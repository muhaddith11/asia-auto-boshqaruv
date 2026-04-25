Set WinScriptHost = CreateObject("WScript.Shell")
' Loyiha papkasini aniqlash
strPath = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptPosition)
' Pythonw orqali skriptni terminalsiz ishga tushirish
WinScriptHost.Run "pythonw """ & strPath & "\print_agent.py""", 0
Set WinScriptHost = Nothing
