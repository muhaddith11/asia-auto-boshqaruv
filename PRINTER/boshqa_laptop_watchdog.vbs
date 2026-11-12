' ============================================
' Asia Auto - Printer Agent Watchdog (boshqa laptop)
' Asosiy noutbukdagi watchdog.vbs bilan bir xil: har 60 soniyada
' tekshiradi, agent to'xtasa qayta ishga tushiradi.
' boshqa_laptopga_ornatish.bat uni Startup papkasiga qo'yadi.
' ============================================

Dim objShell, objWMI, scriptPath

Set objShell = CreateObject("WScript.Shell")
Set objWMI   = GetObject("winmgmts:\\.\root\cimv2")

scriptPath = "C:\AsiaAutoPrinter\print_agent.py"

Do While True
    Dim colItems
    Set colItems = objWMI.ExecQuery("Select * From Win32_Process Where Name = 'pythonw.exe' And CommandLine Like '%print_agent.py%'")

    If colItems.Count = 0 Then
        objShell.Run "pythonw """ & scriptPath & """", 0, False
    End If

    Set colItems = Nothing
    WScript.Sleep 60000  ' 60 soniya kutish
Loop
