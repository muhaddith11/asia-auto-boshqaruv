# Asia Auto Service - davomat skanerini kompyuter yoqilganda avtomatik ishga tushirish.
# Bir marta ishga tushiriladi: powershell -ExecutionPolicy Bypass -File ornatish.ps1
# O'chirish: Unregister-ScheduledTask -TaskName "AsiaAuto-Davomat" -Confirm:$false

$TaskName = "AsiaAuto-Davomat"
$Dir      = Split-Path -Parent $MyInvocation.MyCommand.Path
$Script   = Join-Path $Dir "skaner.ps1"

if (-not (Test-Path (Join-Path $Dir "config.json"))) {
    Write-Host "config.json yo'q - avval config.example.json dan nusxa oling va kalitni yozing." -ForegroundColor Red
    exit 1
}

if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
}

$Action = New-ScheduledTaskAction `
    -Execute "powershell.exe" `
    -Argument "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$Script`"" `
    -WorkingDirectory $Dir

$Trigger = New-ScheduledTaskTrigger -AtLogOn -User "$env:USERDOMAIN\$env:USERNAME"

# Laptop zaryadsiz ishlasa ham to'xtamasin (Windows standarti - to'xtatadi).
$Settings = New-ScheduledTaskSettingsSet `
    -ExecutionTimeLimit ([TimeSpan]::Zero) `
    -RestartCount 999 `
    -RestartInterval (New-TimeSpan -Minutes 1) `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -MultipleInstances IgnoreNew

Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Settings $Settings `
    -Description "Asia Auto Service - davomat skaneri (WiFi)" -Force | Out-Null

Start-ScheduledTask -TaskName $TaskName
Write-Host "Davomat skaneri o'rnatildi va ishga tushirildi ($TaskName)." -ForegroundColor Green
Write-Host "Log: $(Join-Path $Dir 'skaner.log')"
