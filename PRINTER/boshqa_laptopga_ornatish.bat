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
set "PYDIR=%LOCALAPPDATA%\Programs\Python\Python311"
set "PYW="
for /f "delims=" %%P in ('where pythonw 2^>nul') do if not defined PYW set "PYW=%%P"
if not defined PYW if exist "%PYDIR%\pythonw.exe" set "PYW=%PYDIR%\pythonw.exe"
if defined PYW goto :python_bor

rem Python yo'q - yonidagi python-3.11 o'rnatuvchisi bilan o'rnatamiz (admin shart emas)
set "PYSETUP="
for %%F in ("%SRC%python-3.11*-amd64.exe") do set "PYSETUP=%%~fF"
if not defined PYSETUP goto :python_yoq
echo Python o'rnatilmoqda, 1-2 daqiqa kuting...
"%PYSETUP%" /passive InstallAllUsers=0 PrependPath=1 Include_launcher=0 Include_test=0
if exist "%PYDIR%\pythonw.exe" set "PYW=%PYDIR%\pythonw.exe"
if defined PYW goto :python_bor

:python_yoq
echo [XATO] Python topilmadi va o'rnatib bo'lmadi.
echo python-3.11.9-amd64.exe faylini shu fayl bilan bitta papkaga qo'ying,
echo yoki uni ikki marta bosib o'zingiz o'rnating ("Add python.exe to PATH" ga belgi qo'ying).
echo Keyin shu faylni qayta ishga tushiring.
pause
exit /b 1

:python_bor
rem Yangi o'rnatilgan Python shu oynada ham, watchdog'da ham topilsin
for %%D in ("%PYW%") do set "PATH=%%~dpD;%PATH%"
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
echo Chek printeri XP-80 yoki XP-80C bo'lsa, shunchaki Enter bosing - agent uni o'zi topadi.
set /p "PRN=Boshqa nomli printer bo'lsa, nomini ro'yxatdagidek yozing: "
if not defined PRN set "PRN=XP-80"
if /i "%PRN%"=="XP-80" (
  reg delete HKCU\Environment /v PRINT_AGENT_PRINTER /f >nul 2>&1
  set "PRINT_AGENT_PRINTER="
) else (
  setx PRINT_AGENT_PRINTER "%PRN%" >nul
  set "PRINT_AGENT_PRINTER=%PRN%"
)

rem Kalit buyurtmalarni ko'ra olishi shart. Publishable kalit bilan baza bo'sh
rem ro'yxat qaytaradi va agent hech qachon chek chiqarmaydi.
set "KEY=%SUPABASE_SERVICE_ROLE_KEY%"
if defined KEY call :kalit_tekshir
if defined KEY (
  echo Supabase kaliti oldin kiritilgan va to'g'ri, o'shasi ishlatiladi.
  goto :kalit_tayyor
)
:kalit_sora
echo.
echo Supabase SECRET kaliti kerak - u sb_secret_ bilan boshlanadi.
echo supabase.com - loyiha - Project Settings - API Keys - "Secret keys" bo'limida
echo ko'z belgisini bosib kalitni oching va nusxalang. "Publishable key" EMAS.
set "KEY="
set /p "KEY=Kalitni shu yerga qo'ying va Enter bosing: "
if not defined KEY goto :kalit_sora
call :kalit_tekshir
if not defined KEY (
  echo [XATO] Bu kalit bilan buyurtmalar ko'rinmadi: kalit noto'g'ri yoki internet yo'q.
  goto :kalit_sora
)
echo Kalit to'g'ri.
:kalit_tayyor
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
exit /b 0

rem Kalit bilan bitta buyurtmani o'qib ko'radi; o'qiy olmasa KEY ni bo'shatadi.
rem UserAgent shart: Supabase brauzerga o'xshagan so'rovda (PowerShell'niki
rem "Mozilla" bilan boshlanadi) secret kalitni 401 bilan rad etadi.
:kalit_tekshir
set "AA_KEY=%KEY%"
powershell -NoProfile -Command "try { $k = $env:AA_KEY; $r = Invoke-RestMethod -Uri 'https://fwktbleovtkxxpsccqqr.supabase.co/rest/v1/orders?select=id&limit=1' -UserAgent 'asia-auto-ornatish' -Headers @{ apikey = $k; Authorization = ('Bearer ' + $k) } -TimeoutSec 20; if (@($r).Count -gt 0) { exit 0 } else { exit 1 } } catch { exit 1 }"
if errorlevel 1 set "KEY="
set "AA_KEY="
exit /b 0
