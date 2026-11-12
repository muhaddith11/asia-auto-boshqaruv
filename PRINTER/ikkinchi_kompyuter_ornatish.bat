@echo off
rem ============================================================
rem  Asia Auto - 2-kompyuter uchun chek printer agenti
rem  Shu kompyuterda: dashboardda "Printer: 2-kompyuter printeri"
rem  tanlab bosilgan cheklar shu kompyuter printeridan chiqadi.
rem  Asosiy noutbuk agenti o'zgarishsiz ishlayveradi.
rem ============================================================
chcp 65001 >nul
setlocal
title Asia Auto - 2-kompyuter printer agenti

set "DST=C:\AsiaAutoPrinter"
set "SRC=%~dp0"
set "STATION=kompyuter2"

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
if not defined AGENT (
  echo [XATO] print_agent.py topilmadi. Uni shu fayl bilan bitta papkaga qo'ying.
  pause
  exit /b 1
)
set "LOGO="
if exist "%SRC%logo-receipt.png" set "LOGO=%SRC%logo-receipt.png"
if not defined LOGO if exist "%SRC%..\public\logo-receipt.png" set "LOGO=%SRC%..\public\logo-receipt.png"

rem Eski nusxa ishlab turgan bo'lsa to'xtatamiz (qayta o'rnatishda yangi sozlama olinsin)
powershell -NoProfile -Command "Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*AsiaAutoPrinter\print_agent.py*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }"

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
echo Shu kompyuterdagi printerlar:
powershell -NoProfile -Command "Get-Printer | ForEach-Object { '   ' + $_.Name }"
echo.
set "PRN="
set /p "PRN=Chek printerining nomini yuqoridagidek aynan yozing: "
if not defined PRN (
  echo [XATO] Printer nomi kiritilmadi.
  pause
  exit /b 1
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
setx PRINT_AGENT_STATION %STATION% >nul
setx PRINT_AGENT_PRINTER "%PRN%" >nul

rem Kompyuter yonganda agent o'zi ishga tushsin
set "STARTUP=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
> "%STARTUP%\AsiaAutoPrinter.vbs" (
  echo Set s = CreateObject^("WScript.Shell"^)
  echo s.Run """%PYW%"" ""%DST%\print_agent.py""", 0, False
)

echo.
echo === 5/5  Agent ishga tushirilmoqda ===
set "SUPABASE_SERVICE_ROLE_KEY=%KEY%"
set "PRINT_AGENT_STATION=%STATION%"
set "PRINT_AGENT_PRINTER=%PRN%"
start "" "%PYW%" "%DST%\print_agent.py"
timeout /t 8 >nul
echo.
echo Agent logi:
powershell -NoProfile -Command "Get-Content -LiteralPath '%DST%\print_agent_log.txt' -Tail 4 -ErrorAction SilentlyContinue"
echo.
echo TAYYOR. Endi shu kompyuterda saytni oching, chek oynasida
echo "Printer" ro'yxatidan "2-kompyuter printeri" ni tanlang.
echo Tanlov shu kompyuterda eslab qolinadi.
echo.
pause
