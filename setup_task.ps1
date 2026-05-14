# Asia Auto - Print Agent Task Scheduler Setup

$TaskName   = "AsiaAuto-PrintAgent"
$PythonPath = "C:\Users\nout.plus\AppData\Local\Programs\Python\Python311\pythonw.exe"
$ScriptPath = "C:\Users\nout.plus\OneDrive\Desktop\Projects made by AI\Asia Auto Service\boshqaruv\print_agent.py"
$WorkDir    = "C:\Users\nout.plus\OneDrive\Desktop\Projects made by AI\Asia Auto Service\boshqaruv"

# Eski vazifani ochirish
if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    Write-Host "Eski vazifa ochirildi." -ForegroundColor Yellow
}

$Action = New-ScheduledTaskAction `
    -Execute $PythonPath `
    -Argument "`"$ScriptPath`"" `
    -WorkingDirectory $WorkDir

$Trigger1 = New-ScheduledTaskTrigger -AtLogOn
$Trigger2 = New-ScheduledTaskTrigger -AtStartup

$Settings = New-ScheduledTaskSettingsSet `
    -ExecutionTimeLimit ([TimeSpan]::Zero) `
    -RestartCount 999 `
    -RestartInterval (New-TimeSpan -Minutes 1) `
    -StartWhenAvailable `
    -MultipleInstances IgnoreNew

$Principal = New-ScheduledTaskPrincipal `
    -UserId $env:USERNAME `
    -LogonType Interactive `
    -RunLevel Highest

Register-ScheduledTask `
    -TaskName $TaskName `
    -Action $Action `
    -Trigger $Trigger1, $Trigger2 `
    -Settings $Settings `
    -Principal $Principal `
    -Description "Asia Auto Service - Printer Agent" `
    -Force

Write-Host ""
Write-Host "Vazifa royxatga olindi!" -ForegroundColor Green
Write-Host "Nomi: $TaskName" -ForegroundColor Cyan

# Hoziroq ishga tushirish
Start-ScheduledTask -TaskName $TaskName
Write-Host "Agent hoziroq ishga tushirildi!" -ForegroundColor Green

Start-Sleep -Seconds 4

$Task = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($Task) {
    Write-Host "Holat: $($Task.State)" -ForegroundColor White
}

$PythonProc = Get-Process -Name "pythonw" -ErrorAction SilentlyContinue
if ($PythonProc) {
    Write-Host "Python ishlayapti! PID: $($PythonProc.Id)" -ForegroundColor Green
} else {
    Write-Host "Python jarayoni topilmadi, tekshiring." -ForegroundColor Red
}
