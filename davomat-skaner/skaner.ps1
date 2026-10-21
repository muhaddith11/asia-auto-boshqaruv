# Asia Auto Service - davomat skaneri
#
# Har daqiqada ishxona WiFi tarmog'ini tekshiradi va hozir ulangan qurilmalarni
# (MAC + IP) serverga yuboradi: /api/attendance/scan. Kim kimligi va boshliqqa
# xabar - serverda (boshqaruv paneli -> Xodimlar -> Davomat).
#
# Sozlash: config.example.json dan config.json nusxa oling va "key" ga Davomat
# sahifasidagi "Skaner kaliti"ni qo'ying.
#
# Ishga tushirish:  powershell -ExecutionPolicy Bypass -File skaner.ps1
# Bir marta sinash: powershell -ExecutionPolicy Bypass -File skaner.ps1 -Once
# Kompyuter yoqilganda o'zi ishlashi uchun: ornatish.ps1

param([switch]$Once)

$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$Dir     = Split-Path -Parent $MyInvocation.MyCommand.Path
$Config  = Get-Content (Join-Path $Dir 'config.json') -Raw | ConvertFrom-Json
$LogFile = Join-Path $Dir 'skaner.log'
$GatewayMac = ($Config.gatewayMac -replace '[^0-9a-fA-F]', '').ToLower()

function Log([string]$msg) {
    $line = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')  $msg"
    Write-Host $line
    if ((Test-Path $LogFile) -and (Get-Item $LogFile).Length -gt 1MB) {
        Move-Item $LogFile "$LogFile.old" -Force
    }
    Add-Content -Path $LogFile -Value $line -Encoding UTF8
}

# Ishxona tarmog'idamizmi? Router MAC manzili bo'yicha tekshiramiz -
# laptop uyga olib ketilsa, uydagi qurilmalar yuborilmasin.
function Get-WorkshopNetwork {
    $cfg = Get-NetIPConfiguration | Where-Object { $_.IPv4DefaultGateway -and $_.NetAdapter.Status -eq 'Up' } | Select-Object -First 1
    if (-not $cfg) { return $null }
    $gw = $cfg.IPv4DefaultGateway.NextHop
    $ip = ($cfg.IPv4Address | Select-Object -First 1).IPAddress
    $n = Get-NetNeighbor -AddressFamily IPv4 -IPAddress $gw -ErrorAction SilentlyContinue | Select-Object -First 1
    if (-not $n) {
        # Router hali ARP jadvalida yo'q - bir marta ping qilib olamiz.
        $null = (New-Object System.Net.NetworkInformation.Ping).Send($gw, 1000)
        $n = Get-NetNeighbor -AddressFamily IPv4 -IPAddress $gw -ErrorAction SilentlyContinue | Select-Object -First 1
    }
    if (-not $n) { return $null }
    $mac = ($n.LinkLayerAddress -replace '[^0-9a-fA-F]', '').ToLower()
    if ($GatewayMac -and $mac -ne $GatewayMac) { return $null }
    return @{ Gateway = $gw; Ip = $ip; IfIndex = $cfg.InterfaceIndex }
}

function Get-OnlineDevices($net) {
    $base = ($net.Ip -split '\.')[0..2] -join '.'

    # Hammaga bir vaqtda ping: javob bermasa ham (iPhone ICMP'ni yopadi) Windows
    # avval ARP so'raydi va telefon ARP'ga javob beradi -> qo'shnilar jadvalida "Reachable".
    $tasks = 1..254 | ForEach-Object { (New-Object System.Net.NetworkInformation.Ping).SendPingAsync("$base.$_", 700) }
    try { [System.Threading.Tasks.Task]::WaitAll($tasks) } catch { }
    $pinged = @{}
    for ($i = 0; $i -lt 254; $i++) {
        if ($tasks[$i].Status -eq 'RanToCompletion' -and $tasks[$i].Result.Status -eq 'Success') { $pinged["$base.$($i + 1)"] = $true }
    }
    # Uxlab yotgan telefon ARP'ga 2-5 soniyada javob beradi: 2 soniya kutilganda
    # telefonlar uzilib-uzilib ko'rinardi, 6 soniyada har skanda ko'rinadi.
    Start-Sleep -Seconds 6

    $devices = @()
    foreach ($n in (Get-NetNeighbor -AddressFamily IPv4 -InterfaceIndex $net.IfIndex -ErrorAction SilentlyContinue)) {
        if (-not $n.IPAddress.StartsWith("$base.") -or $n.IPAddress -eq $net.Gateway) { continue }
        $mac = $n.LinkLayerAddress
        if (-not $mac -or $mac -eq '00-00-00-00-00-00' -or $mac -eq 'FF-FF-FF-FF-FF-FF') { continue }
        if ($n.State -eq 'Reachable' -or $pinged.ContainsKey($n.IPAddress)) {
            $devices += @{ mac = $mac; ip = $n.IPAddress }
        }
    }
    return ,$devices
}

function Invoke-Scan {
    $net = Get-WorkshopNetwork
    if (-not $net) {
        Log "Ishxona tarmog'i emas - o'tkazib yuborildi"
        return
    }
    # Daqiqada ikki marta tekshiramiz: telefon qisqa uyg'onganini ham ushlash uchun.
    $byMac = @{}
    foreach ($d in (Get-OnlineDevices $net)) { $byMac[$d.mac] = $d }
    if (-not $Once) {
        Start-Sleep -Seconds 20
        foreach ($d in (Get-OnlineDevices $net)) { $byMac[$d.mac] = $d }
    }
    $devices = @($byMac.Values)
    $body = @{ devices = $devices } | ConvertTo-Json -Depth 4 -Compress
    $res = Invoke-RestMethod -Uri "$($Config.server.TrimEnd('/'))/api/attendance/scan" -Method Post `
        -Headers @{ 'x-scanner-key' = $Config.key } -ContentType 'application/json; charset=utf-8' `
        -Body ([Text.Encoding]::UTF8.GetBytes($body)) -TimeoutSec 30
    Log "OK: $($devices.Count) qurilma yuborildi (server: $($res.seen))"
}

# Ikkinchi nusxa ishga tushmasin (rejalashtiruvchi + qo'lda ochilgan).
$mutex = New-Object System.Threading.Mutex($false, 'Global\AsiaAuto-Davomat-Skaner')
if (-not $mutex.WaitOne(0)) {
    Write-Host 'Skaner allaqachon ishlayapti.'
    exit 0
}

try {
    do {
        $started = Get-Date
        try { Invoke-Scan } catch { Log "Xato: $($_.Exception.Message)" }
        if ($Once) { break }
        $wait = 60 - ((Get-Date) - $started).TotalSeconds
        if ($wait -gt 0) { Start-Sleep -Seconds ([int]$wait) }
    } while ($true)
} finally {
    $mutex.ReleaseMutex()
}
