PRINTER AGENT QO'LLANMASI:

1. 'run_printer.vbs' faylini ikki marta bosing. Bu printer agentini orqa fonda (background) ishga tushiradi.
2. Agent ishga tushgandan keyin terminalni yopsangiz ham, u ishlashda davom etaveradi.
3. 'print_agent_log.txt' faylida printer ishlayotganini yoki xatolarni ko'rishingiz mumkin.
4. Kompyuter o'chib yonsa, agent avtomatik ravishda o'zi ishga tushadi (Startup-ga qo'shilgan).

Agar printer to'xtab qolsa, shunchaki 'run_printer.vbs' faylini yana bir marta bosib qo'ying.

ESLATMA (2026-09-10): bu papkadagi print_agent.py endi asosiy (../print_agent.py)
skriptni ishga tushiradi — bu yerda alohida eski kod qolmagan, shuning uchun
qaysi yorliqni bossangiz ham bitta to'g'ri agent ishlaydi.
