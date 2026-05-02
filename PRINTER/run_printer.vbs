Set WinScriptHost = CreateObject("WScript.Shell")
strProjectDir = "c:\Users\nout.plus\OneDrive\Desktop\Projects made by AI\Asia Auto Service\boshqaruv\PRINTER"
WinScriptHost.CurrentDirectory = strProjectDir

' Check if already running
Set objWMIService = GetObject("winmgmts:\\.\root\cimv2")
Set colItems = objWMIService.ExecQuery("Select * from Win32_Process Where Name = 'pythonw.exe' AND CommandLine LIKE '%print_agent.py%'")

If colItems.Count = 0 Then
    ' Start with full path
    WinScriptHost.Run """C:\Users\nout.plus\AppData\Local\Programs\Python\Python311\pythonw.exe"" print_agent.py", 0
End If

Set WinScriptHost = Nothing

