import time
import requests
import json
import win32print
import os
from datetime import datetime

PRINTER_NAME = "XP-80"
SUPABASE_URL = "https://fwktbleovtkxxpsccqqr.supabase.co"
SUPABASE_KEY = "sb_publishable_JUnUk2NcYb8fanWmD5TLJw_Gpmd4aoL"
CHECK_INTERVAL = 5
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LOG_FILE = os.path.join(BASE_DIR, "print_agent_log.txt")
WORKERS_MAP = {}

def log_message(msg):
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{ts}] {msg}"
    print(line)
    try:
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(line + "\n")
    except:
        pass

def fetch_workers():
    global WORKERS_MAP
    try:
        r = requests.get(
            f"{SUPABASE_URL}/rest/v1/workers?select=id,ism",
            headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"},
            timeout=10
        )
        if r.status_code == 200:
            for w in r.json():
                WORKERS_MAP[w["id"]] = w["ism"]
    except Exception as e:
        log_message(f"Workers xatosi: {e}")

def fmt(n):
    try:
        return f"{int(n):,}".replace(",", " ")
    except:
        return "0"

# ─── ESC/POS buyruqlari ───────────────────────
INIT        = b"\x1b\x40"           # Printer initialize
CUT         = b"\x1d\x56\x41\x05"  # Partial cut + feed
LF          = b"\x0a"               # Line feed
CENTER      = b"\x1b\x61\x01"      # Markazga
LEFT        = b"\x1b\x61\x00"      # Chapga
BOLD_ON     = b"\x1b\x45\x01"      # Bold yoqish
BOLD_OFF    = b"\x1b\x45\x00"      # Bold o'chirish
DOUBLE_ON   = b"\x1b\x21\x30"      # 2x katta (bold + double height+width)
DOUBLE_OFF  = b"\x1b\x21\x00"      # Normal o'lcham
BIG_ON      = b"\x1d\x21\x11"      # Double height+width
BIG_OFF     = b"\x1d\x21\x00"      # Normal
INVERT_ON   = b"\x1d\x42\x01"      # Qora fon, oq matn
INVERT_OFF  = b"\x1d\x42\x00"      # Normal

def enc(text):
    """Matnni printerga mos encodingga o'tkazish"""
    return text.encode("cp1251", errors="replace")

def line(text="", bold=False, center=False, double=False, invert=False, big=False):
    """Bir qator uchun ESC/POS bytes"""
    b = b""
    if center:   b += CENTER
    else:        b += LEFT
    if invert:   b += INVERT_ON
    if double:   b += DOUBLE_ON
    elif big:    b += BIG_ON
    elif bold:   b += BOLD_ON
    b += enc(text) + LF
    if invert:   b += INVERT_OFF
    if double:   b += DOUBLE_OFF
    elif big:    b += BIG_OFF
    elif bold:   b += BOLD_OFF
    return b

def row(left_text, right_text, width=42):
    """Chap va o'ng tekislangan qator"""
    left_text  = str(left_text)
    right_text = str(right_text)
    gap = width - len(left_text) - len(right_text)
    if gap < 1: gap = 1
    full = left_text + " " * gap + right_text
    return LEFT + enc(full) + LF

def separator(char="-", width=42):
    return LEFT + enc(char * width) + LF

def send_to_printer(data: bytes):
    """Bytlarni to'g'ridan-to'g'ri printerga yuborish"""
    hp = win32print.OpenPrinter(PRINTER_NAME)
    try:
        hj = win32print.StartDocPrinter(hp, 1, ("Chek", None, "RAW"))
        win32print.StartPagePrinter(hp)
        win32print.WritePrinter(hp, data)
        win32print.EndPagePrinter(hp)
        win32print.EndDocPrinter(hp)
    finally:
        win32print.ClosePrinter(hp)

def print_receipt(order):
    try:
        now = datetime.now().strftime("%d.%m.%Y %H:%M")

        services = order.get("services", [])
        if isinstance(services, str):
            try: services = json.loads(services)
            except: services = []

        zaps = order.get("zaps", [])
        if isinstance(zaps, str):
            try: zaps = json.loads(zaps)
            except: zaps = []

        workers = set()
        for s in (services or []):
            wid = s.get("workerId")
            if wid and wid in WORKERS_MAP:
                workers.add(WORKERS_MAP[wid])
        worker_str = ", ".join(workers) or "-"

        final = int(order.get("final", 0) or 0)
        paid  = int(order.get("paid",  0) or 0)
        debt  = final - paid

        buf = b""
        buf += INIT

        # ══ HEADER ══
        buf += CENTER
        buf += DOUBLE_ON
        buf += enc("ASIA AUTO SERVICE") + LF
        buf += DOUBLE_OFF
        buf += CENTER + enc("Sifatli xizmat -- xavfsiz yo'l garovi!") + LF
        buf += LF

        # ══ META ══
        buf += LEFT
        buf += separator()
        buf += row("Buyurtma :", f"#{order['id']}")
        buf += row("Sana     :", now)
        buf += row("Mijoz    :", str(order.get("ism", ""))[:20])
        buf += row("Mashina  :", str(order.get("mashina", ""))[:20])
        if order.get("raqam"):
            buf += row("Raqam    :", str(order["raqam"]))
        if worker_str and worker_str != "-":
            buf += row("Xodim    :", worker_str[:20])
        buf += separator()

        # ══ XIZMATLAR ══
        if services:
            buf += line("KO'RSATILGAN XIZMATLAR:", invert=True)
            buf += LF
            for s in services:
                nom  = str(s.get("nom", "Xizmat"))[:26]
                narx = fmt(s.get("narx", 0))
                buf += row(nom, narx)
            buf += LF

        # ══ ZAPCHASTLAR ══
        if zaps:
            buf += line("EHTIYOT QISMLAR:", invert=True)
            buf += LF
            for z in zaps:
                nom  = str(z.get("nom", "Zapchast"))[:26]
                narx = fmt(int(z.get("narx", 0)) * int(z.get("qty", 1)))
                buf += row(nom, narx)
            buf += LF

        buf += separator()

        # ══ SUBTOTALLAR ══
        if paid > 0:
            buf += row("To'langan  :", fmt(paid) + " UZS")
            if debt > 0:
                buf += BOLD_ON + row("Qolgan qarz:", fmt(debt) + " UZS") + BOLD_OFF
            buf += LF

        # ══ JAMI ══
        buf += CENTER
        buf += BOLD_ON + enc("JAMI SUMMA:") + LF + BOLD_OFF
        buf += BIG_ON
        buf += enc(fmt(final) + " UZS") + LF
        buf += BIG_OFF
        buf += LF

        buf += separator()

        # ══ FOOTER ══
        buf += CENTER
        buf += BOLD_ON + enc("TASHRIFINGIZ UCHUN RAHMAT!") + LF + BOLD_OFF
        buf += enc("+998 90 570 88 88") + LF
        buf += enc("Qo'qon sh., Ubay Oripov 12") + LF
        buf += enc("@asia_auto_service") + LF
        buf += LF + LF + LF

        # ══ KES ══
        buf += CUT

        send_to_printer(buf)
        log_message(f"✅ Chek chiqarildi! ID: {order['id']}")
        return True

    except Exception as e:
        log_message(f"❌ Print xatosi (ID:{order.get('id')}): {e}")
        return False

def get_pending():
    try:
        r = requests.get(
            f"{SUPABASE_URL}/rest/v1/orders?print_status=eq.pending&order=id.asc",
            headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"},
            timeout=10
        )
        return r.json() if r.status_code == 200 else []
    except Exception as e:
        log_message(f"Baza xatosi: {e}")
        return []

def mark_printed(order_id):
    try:
        requests.patch(
            f"{SUPABASE_URL}/rest/v1/orders?id=eq.{order_id}",
            headers={
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Content-Type": "application/json"
            },
            json={"print_status": "printed"},
            timeout=10
        )
    except Exception as e:
        log_message(f"Mark xatosi: {e}")

def main():
    log_message("=" * 48)
    log_message("Print Agent ishga tushdi (ESC/POS v4)")
    log_message(f"Printer: {PRINTER_NAME}")
    log_message("=" * 48)
    fetch_workers()

    counter = 0
    while True:
        try:
            if counter % 60 == 0:
                fetch_workers()

            for order in get_pending():
                if order.get("print_status") == "printed":
                    continue
                log_message(f"Chop etilmoqda... ID: {order['id']}")
                if print_receipt(order):
                    mark_printed(order["id"])

            counter += 1
            if counter % 12 == 0:
                log_message(f"Ishlayapti... {datetime.now().strftime('%H:%M')}")

            time.sleep(CHECK_INTERVAL)
        except Exception as e:
            log_message(f"Loop xatosi: {e}")
            time.sleep(CHECK_INTERVAL)

if __name__ == "__main__":
    main()
