@echo off
rem ============================================================
rem  Asia Auto - chek printer agentini boshqa laptopga o'rnatish
rem  Agent asosiy noutbukdagi bilan aynan bir xil ishlaydi:
rem  dashboardda yoki botda chek bosilsa, shu laptop printeridan chiqadi.
rem  DIQQAT: bir vaqtda faqat BITTA laptopda agent yoqiq bo'lsin,
rem  aks holda chek tasodifiy printerdan yoki ikki marta chiqadi.
rem ============================================================
chcp 65001 >nul
setlocal
title Asia Auto - chek printer agenti

set "DST=C:\AsiaAutoPrinter"
set "SRC=%~dp0"
set "STARTUP=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"

echo.
echo === 1/5  Python tekshirilmoqda ===
set "PYW="
for /f "delims=" %%P in ('where pythonw 2^>nul') do if not defined PYW set "PYW=%%P"
if not defined PYW (
  echo [XATO] Python topilmadi.
  echo python.org saytidan Python 3.11 ni o'rnating.
  echo O'rnatishning birinchi oynasida "Add python.exe to PATH" ga belgi qo'ying.
  echo Keyin shu faylni qayta ishga tushiring.
  pause
  exit /b 1
)
echo Python: %PYW%

echo.
echo === 2/5  Fayllar C:\AsiaAutoPrinter ga ko'chirilmoqda ===
set "AGENT="
if exist "%SRC%print_agent.py" set "AGENT=%SRC%print_agent.py"
if not defined AGENT if exist "%SRC%..\print_agent.py" set "AGENT=%SRC%..\print_agent.py"
set "WATCHDOG="
if exist "%SRC%boshqa_laptop_watchdog.vbs" set "WATCHDOG=%SRC%boshqa_laptop_watchdog.vbs"
if not defined AGENT (
  echo [XATO] print_agent.py topilmadi. Uni shu fayl bilan bitta papkaga qo'ying.
  pause
  exit /b 1
)
if not defined WATCHDOG (
  echo [XATO] boshqa_laptop_watchdog.vbs topilmadi. Uni shu fayl bilan bitta papkaga qo'ying.
  pause
  exit /b 1
)
set "LOGO="
if exist "%SRC%logo-receipt.png" set "LOGO=%SRC%logo-receipt.png"
if not defined LOGO if exist "%SRC%..\public\logo-receipt.png" set "LOGO=%SRC%..\public\logo-receipt.png"

rem Qayta o'rnatishda eski nusxani to'xtatamiz - yangi sozlama bilan qayta yonsin
powershell -NoProfile -Command "Get-CimInstance Win32_Process | Where-Object { @('wscript.exe','pythonw.exe') -contains $_.Name -and ($_.CommandLine -like '*AsiaAutoPrinterWatchdog.vbs*' -or $_.CommandLine -like '*AsiaAutoPrinter\print_agent.py*') } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }"

if not exist "%DST%\public" mkdir "%DST%\public"
copy /Y "%AGENT%" "%DST%\print_agent.py" >nul
if defined LOGO (
  copy /Y "%LOGO%" "%DST%\public\logo-receipt.png" >nul
) else (
  echo [ESLATMA] logo-receipt.png topilmadi - chek logosiz chiqadi.
)

echo.
echo === 3/5  Kutubxonalar o'rnatilmoqda - internet kerak ===
"%PYW:pythonw.exe=python.exe%" -m pip install --upgrade requests pywin32 pillow
if errorlevel 1 (
  echo [XATO] Kutubxonalar o'rnatilmadi. Internetni tekshirib, qayta urinib ko'ring.
  pause
  exit /b 1
)

echo.
echo === 4/5  Sozlash ===
echo Shu laptopdagi printerlar:
powershell -NoProfile -Command "Get-Printer | ForEach-Object { '   ' + $_.Name }"
echo.
set "PRN="
set /p "PRN=Chek printerining nomini yozing (XP-80 bo'lsa shunchaki Enter bosing): "
if not defined PRN set "PRN=XP-80"
if /i "%PRN%"=="XP-80" (
  reg delete HKCU\Environment /v PRINT_AGENT_PRINTER /f >nul 2>&1
  set "PRINT_AGENT_PRINTER="
) else (
  setx PRINT_AGENT_PRINTER "%PRN%" >nul
  set "PRINT_AGENT_PRINTER=%PRN%"
)

set "KEY=%SUPABASE_SERVICE_ROLE_KEY%"
if defined KEY (
  echo Supabase kaliti oldin kiritilgan, o'shasi ishlatiladi.
) else (
  echo.
  echo Supabase service_role kaliti kerak.
  echo Uni supabase.com - loyiha - Project Settings - API Keys bo'limidan nusxalang.
  set /p "KEY=Kalitni shu yerga qo'ying va Enter bosing: "
)
if not defined KEY (
  echo [XATO] Kalit kiritilmadi.
  pause
  exit /b 1
)
setx SUPABASE_SERVICE_ROLE_KEY "%KEY%" >nul
set "SUPABASE_SERVICE_ROLE_KEY=%KEY%"

rem Kompyuter yonganda watchdog o'zi ishga tushadi va agentni yoqib turadi
copy /Y "%WATCHDOG%" "%STARTUP%\AsiaAutoPrinterWatchdog.vbs" >nul

echo.
echo === 5/5  Agent ishga tushirilmoqda ===
start "" wscript "%STARTUP%\AsiaAutoPrinterWatchdog.vbs"
timeout /t 10 >nul
echo.
echo Agent logi:
powershell -NoProfile -Command "Get-Content -LiteralPath '%DST%\print_agent_log.txt' -Tail 4 -ErrorAction SilentlyContinue"
echo.
echo TAYYOR. Logda "Printer: %PRN%" yozuvi chiqqan bo'lsa, agent ishlayapti.
echo Endi istalgan kompyuterdan chek bosilsa, shu laptop printeridan chiqadi.
echo Laptop uyquga ketmasligi kerak: Sozlamalar - Tizim - Quvvat - Uyqu: Hech qachon.
echo.
pause
