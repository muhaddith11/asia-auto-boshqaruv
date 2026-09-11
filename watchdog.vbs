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
    ' MUHIM: nomi bo'yicha emas, aynan shu skript ishga tushirilganini tekshiradi.
    ' Oldin faqat "pythonw.exe bormi" deb tekshirar edi — shu sabab 2026-09-10 kuni
    ' ESKI (xato) print_agent.py nusxasi ishga tushib qolganda ham watchdog buni
    ' "hammasi joyida" deb hisoblab, to'g'ri agentni qayta ishga tushirmadi.
    Set colItems = objWMI.ExecQuery("Select * From Win32_Process Where Name = 'pythonw.exe' And CommandLine Like '%print_agent.py%'")

    If colItems.Count = 0 Then
        ' To'g'ri agent ishlamayapti (umuman ishlamayapti yoki boshqa/eski nusxa
        ' ishga tushib qolgan) - qayta ishga tushirish
        objShell.Run "pythonw """ & scriptPath & """", 0, False
    End If

    Set colItems = Nothing
    WScript.Sleep 60000  ' 60 soniya kutish
Loop
