# Yog' stansiyasi uchun alohida printer — o'rnatish qo'llanmasi

Maqsad: **yog' quyish cheklari alohida printerdan** chiqsin, ustaxona printeri (XP-80)
ularni chiqarmasin. Buning uchun yog' stansiyasida **ikkinchi print-agent** ishlaydi
va u faqat `bo'lim = yog` cheklarini chiqaradi.

Bu ish `orders.bolim` ustuniga tayanadi (yog'chi mashinani qabul qilganda avtomatik
`yog` yoziladi). Kod: [print_agent.py](print_agent.py) — bitta fayl ikki rol o'ynaydi.

---

## 1. Ustaxona kompyuteri (mavjud — XP-80)

Hech narsa sozlash **shart emas**. `print_agent.py` yangilangandan keyin agent
default holatda `bo'lim = ustaxona` bo'lib ishlaydi va **yog' cheklarini boshqa chiqarmaydi**.

⚠️ Faqat bitta ish: agentni **qayta ishga tushiring** (yangi kod yuklansin):
- `run_printer.vbs` ni qayta bosing, YOKI kompyuterni qayta yoqing.

Loglar ([print_agent_log.txt](print_agent_log.txt)) da shunday yozuv chiqishi kerak:
`Printer: XP-80  |  Bo'lim: ustaxona`

---

## 2. Yog' stansiyasi kompyuteri (yangi PC + yangi printer)

### a) Printerni ulang
Yangi chek printerini shu PC ga ulang. Windows'dagi **aniq printer nomini** eslab qoling
(Sozlamalar → Bluetooth va qurilmalar → Printerlar). Masalan: `OIL-80`.

### b) Python va kutubxonalar
1. Python 3.11 o'rnating (python.org).
2. Buyruq qatorida (cmd):
   ```
   pip install requests pywin32 pillow
   ```

### c) Agent fayllarini nusxalang
Yog' PC da alohida papka oching, masalan `C:\PrintAgentYog\`, va shu fayllarni tashlang:
- `print_agent.py`
- `public\logo-receipt.png` (chekda logo chiqishi uchun; ixtiyoriy)

### d) `printer_config.json` yarating
`C:\PrintAgentYog\printer_config.json` fayl yarating (namuna:
[printer_config.example.json](printer_config.example.json)) va o'z printer nomingizni yozing:
```json
{
  "department": "yog",
  "printer_name": "OIL-80"
}
```
`printer_name` — (b) bosqichdagi haqiqiy Windows printer nomi bo'lsin.

### e) Ishga tushiring
```
pythonw C:\PrintAgentYog\print_agent.py
```
Yoki avtomatik ishga tushishi uchun ustaxonadagi kabi `run_printer.vbs` / Task Scheduler
sozlang (`PRINTER\README.txt` ga qarang).

Log da tekshiring: `Printer: OIL-80  |  Bo'lim: yog`

---

## Muqobil: OneDrive bilan bo'lingan papka bo'lsa

Agar yog' PC aynan shu OneDrive papkasidan ishlasa (`printer_config.json` bo'linib
ketmasligi uchun), config fayl o'rniga **muhit o'zgaruvchisi** ishlating — u har PC da alohida:
```
setx PRINT_AGENT_DEPARTMENT yog
setx PRINT_AGENT_PRINTER OIL-80
```
(muhit o'zgaruvchisi config fayldan kuchliroq — o'rnatilsa u ishlaydi). Keyin agentni
qayta ishga tushiring.

---

## Qanday ishlaydi (qisqacha)

- Yog'chi bot'da mashina qabul qiladi → `orders.bolim = 'yog'`.
- Chek chiqarilganda `print_status = 'pending'` bo'ladi.
- **Ustaxona agenti** (XP-80): faqat `bolim = ustaxona` (yoki eski/bo'sh) cheklarni chiqaradi.
- **Yog' agenti** (yangi printer): faqat `bolim = yog` cheklarni chiqaradi.
- Har agent faqat o'zinikini chiqaradi va faqat o'zi chiqarganini `printed` deb belgilaydi —
  shuning uchun chalkashmaydi, chek ikki marta chiqmaydi.
