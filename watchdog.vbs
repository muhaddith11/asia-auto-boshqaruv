' ============================================
' Asia Auto - Printer Agent Watchdog
' Har 60 soniyada tekshiradi, to'xtasa qayta ishga tushiradi
' ============================================

Dim objShell, objWMI, scriptPath

Set objShell = CreateObject("WScript.Shell")
Set objWMI   = GetObject("winmgmts:\\.\root\cimv2")

scriptPath = "C:\Users\nout.plus\OneDrive\Desktop\Projects made by AI\Asia Auto Service\boshqaruv\print_agent.py"

Do While True
    Dim colItems
    Set colItems = objWMI.ExecQuery("Select * From Win32_Process Where Name = 'pythonw.exe'")

    If colItems.Count = 0 Then
        ' Agent ishlamayapti - qayta ishga tushirish
        objShell.Run "pythonw """ & scriptPath & """", 0, False
    End If

    Set colItems = Nothing
    WScript.Sleep 60000  ' 60 soniya kutish
Loop
