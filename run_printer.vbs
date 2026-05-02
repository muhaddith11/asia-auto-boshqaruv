Dim objShell
Set objShell = CreateObject("WScript.Shell")
' pythonw ishlatiladi - terminal oynasisiz, mustaqil ishlaydi
objShell.Run "pythonw ""C:\Users\nout.plus\OneDrive\Desktop\Projects made by AI\Asia Auto Service\boshqaruv\print_agent.py""", 0, False
Set objShell = Nothing
