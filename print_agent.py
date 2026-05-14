import time
import requests
import json
import win32print
import win32ui
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
    return f"{int(n):,}".replace(",", " ")

def print_receipt(order):
    dc = None
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

        # ── DC yaratish ──
        dc = win32ui.CreateDC()
        dc.CreatePrinterDC(PRINTER_NAME)
        dc.StartDoc(f"Chek #{order['id']}")
        dc.StartPage()

        # ── Fontlar ──
        f_big    = win32ui.CreateFont({"name": "Arial", "height": 46, "weight": 900})
        f_bold   = win32ui.CreateFont({"name": "Arial", "height": 30, "weight": 700})
        f_normal = win32ui.CreateFont({"name": "Courier New", "height": 26, "weight": 400})
        f_mono   = win32ui.CreateFont({"name": "Courier New", "height": 26, "weight": 700})
        f_small  = win32ui.CreateFont({"name": "Courier New", "height": 22, "weight": 400})
        f_total  = win32ui.CreateFont({"name": "Arial", "height": 54, "weight": 900})

        y = 20

        # ══ HEADER ══
        dc.SelectObject(f_big)
        dc.TextOut(60, y, "ASIA AUTO SERVICE")
        y += 54

        dc.SelectObject(f_small)
        dc.TextOut(40, y, "Sifatli xizmat -- xavfsiz yo'l garovi!")
        y += 30

        dc.SelectObject(f_normal)
        dc.TextOut(0, y, "- " * 28)
        y += 30

        # ══ META ══
        dc.SelectObject(f_normal)
        dc.TextOut(0, y, f"Buyurtma : #{order['id']}")
        y += 30
        dc.TextOut(0, y, f"Sana     : {now}")
        y += 30
        dc.TextOut(0, y, f"Mijoz    : {str(order.get('ism', ''))[:22]}")
        y += 30
        dc.TextOut(0, y, f"Mashina  : {str(order.get('mashina', ''))[:22]}")
        y += 30
        if order.get("raqam"):
            dc.TextOut(0, y, f"Raqam    : {order['raqam']}")
            y += 30
        if worker_str and worker_str != "-":
            dc.TextOut(0, y, f"Xodim    : {worker_str[:22]}")
            y += 30

        dc.TextOut(0, y, "- " * 28)
        y += 30

        # ══ XIZMATLAR ══
        if services:
            dc.SelectObject(f_bold)
            dc.TextOut(0, y, "KO'RSATILGAN XIZMATLAR:")
            y += 38

            dc.SelectObject(f_normal)
            for s in services:
                nom  = str(s.get("nom", "Xizmat"))[:26]
                narx = fmt(s.get("narx", 0))
                # Nom chap, narx ong
                dc.TextOut(10, y, nom)
                dc.SelectObject(f_mono)
                nw = dc.GetTextExtent(narx)[0]
                dc.TextOut(540 - nw, y, narx)
                dc.SelectObject(f_normal)
                y += 32

            y += 6

        # ══ ZAPCHASTLAR ══
        if zaps:
            dc.SelectObject(f_bold)
            dc.TextOut(0, y, "EHTIYOT QISMLAR:")
            y += 38

            dc.SelectObject(f_normal)
            for z in zaps:
                nom  = str(z.get("nom", "Zapchast"))[:26]
                narx = fmt(int(z.get("narx", 0)) * int(z.get("qty", 1)))
                dc.TextOut(10, y, nom)
                dc.SelectObject(f_mono)
                nw = dc.GetTextExtent(narx)[0]
                dc.TextOut(540 - nw, y, narx)
                dc.SelectObject(f_normal)
                y += 32

            y += 6

        dc.SelectObject(f_normal)
        dc.TextOut(0, y, "- " * 28)
        y += 30

        # ══ SUBTOTALLAR ══
        if paid > 0:
            dc.SelectObject(f_normal)
            dc.TextOut(0, y, f"To'langan  : {fmt(paid)} UZS")
            y += 30
            if debt > 0:
                dc.TextOut(0, y, f"Qolgan qarz: {fmt(debt)} UZS")
                y += 30
            y += 6

        # ══ JAMI ══
        dc.SelectObject(f_bold)
        dc.TextOut(0, y, "JAMI SUMMA:")
        y += 38

        dc.SelectObject(f_total)
        total_str = fmt(final) + " UZS"
        tw = dc.GetTextExtent(total_str)[0]
        dc.TextOut((560 - tw) // 2, y, total_str)
        y += 70

        dc.SelectObject(f_normal)
        dc.TextOut(0, y, "- " * 28)
        y += 30

        # ══ FOOTER ══
        dc.SelectObject(f_bold)
        fw = dc.GetTextExtent("TASHRIFINGIZ UCHUN RAHMAT!")[0]
        dc.TextOut((560 - fw) // 2, y, "TASHRIFINGIZ UCHUN RAHMAT!")
        y += 40

        dc.SelectObject(f_small)
        for line in ["+998 90 570 88 88", "Qo'qon sh., Ubay Oripov 12", "@asia_auto_service"]:
            lw = dc.GetTextExtent(line)[0]
            dc.TextOut((560 - lw) // 2, y, line)
            y += 28

        # Qogoz surilishi
        y += 250
        dc.SelectObject(f_small)
        dc.TextOut(0, y, " ")

        dc.EndPage()
        dc.EndDoc()

        # Kesish
        try:
            hp = win32print.OpenPrinter(PRINTER_NAME)
            win32print.StartDocPrinter(hp, 1, ("cut", None, "RAW"))
            win32print.StartPagePrinter(hp)
            win32print.WritePrinter(hp, b"\x1d\x56\x01")
            win32print.EndPagePrinter(hp)
            win32print.EndDocPrinter(hp)
            win32print.ClosePrinter(hp)
        except:
            pass

        log_message(f"✅ Chek chiqarildi! ID: {order['id']}")
        return True

    except Exception as e:
        log_message(f"❌ Print xatosi (ID:{order.get('id')}): {e}")
        return False
    finally:
        if dc:
            try: dc.DeleteDC()
            except: pass

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
    log_message("Print Agent ishga tushdi (win32print v3)")
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
