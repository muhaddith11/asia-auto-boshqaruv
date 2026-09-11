' Bu papkadagi print_agent.py ESKIRGAN nusxa edi (service_role kalitni bilmaydi,
' shuning uchun RLS orqali cheklarni ko'ra olmay, jim tarzda chek chiqarmay qolardi).
' Endi bu skript ham asosiy (root) print_agent.py ni ishga tushiradi — bitta haqiqiy
' nusxa bo'lsin, ikkinchisi ikkalanmasin.
Set WinScriptHost = CreateObject("WScript.Shell")
strRootScript = "C:\Users\nout.plus\OneDrive\Desktop\Projects made by AI\Asia Auto Service\boshqaruv\print_agent.py"

' Check if already running (aynan shu root skript)
Set objWMIService = GetObject("winmgmts:\\.\root\cimv2")
Set colItems = objWMIService.ExecQuery("Select * from Win32_Process Where Name = 'pythonw.exe' AND CommandLine LIKE '%boshqaruv\print_agent.py%'")

If colItems.Count = 0 Then
    WinScriptHost.Run """C:\Users\nout.plus\AppData\Local\Programs\Python\Python311\pythonw.exe"" """ & strRootScript & """", 0
End If

Set WinScriptHost = Nothing

