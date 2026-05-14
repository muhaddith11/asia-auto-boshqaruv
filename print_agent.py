import time
import requests
import json
import win32print
import win32ui
import win32con
import os
import sys
import msvcrt
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

def send_cut():
    """ESC/POS kesish buyrug'ini yuborish"""
    try:
        CUT = b"\x1d\x56\x41\x05"  # Partial cut + feed
        hp = win32print.OpenPrinter(PRINTER_NAME)
        hj = win32print.StartDocPrinter(hp, 1, ("Cut", None, "RAW"))
        win32print.StartPagePrinter(hp)
        win32print.WritePrinter(hp, CUT)
        win32print.EndPagePrinter(hp)
        win32print.EndDocPrinter(hp)
        win32print.ClosePrinter(hp)
    except Exception as e:
        log_message(f"Cut xatosi: {e}")

def fmt(n):
    try:
        return f"{int(n):,}".replace(",", " ")
    except:
        return "0"

def rgb(r, g, b):
    return r | (g << 8) | (b << 16)

def get_printer_dc_info():
    """Printer DC parametrlarini olish"""
    hdc = win32ui.CreateDC()
    hdc.CreatePrinterDC(PRINTER_NAME)
    dpi_x  = hdc.GetDeviceCaps(win32con.LOGPIXELSX)
    dpi_y  = hdc.GetDeviceCaps(win32con.LOGPIXELSY)
    phys_w = hdc.GetDeviceCaps(win32con.PHYSICALWIDTH)
    phys_h = hdc.GetDeviceCaps(win32con.PHYSICALHEIGHT)
    pr_w   = hdc.GetDeviceCaps(win32con.HORZRES)
    pr_h   = hdc.GetDeviceCaps(win32con.VERTRES)
    off_x  = hdc.GetDeviceCaps(win32con.PHYSICALOFFSETX)
    off_y  = hdc.GetDeviceCaps(win32con.PHYSICALOFFSETY)
    hdc.DeleteDC()
    info = {
        "dpi_x": dpi_x, "dpi_y": dpi_y,
        "phys_w": phys_w, "phys_h": phys_h,
        "pr_w": pr_w, "pr_h": pr_h,
        "off_x": off_x, "off_y": off_y,
    }
    log_message(f"Printer DC: DPI={dpi_x}x{dpi_y} Printable={pr_w}x{pr_h} Physical={phys_w}x{phys_h} Offset={off_x},{off_y}")
    return info

def pt_to_px(points, dpi):
    """Point o'lchamini printer pikselga o'tkazish"""
    return -int(dpi * points / 72)

class Printer:
    """GDI printer wrapper"""
    def __init__(self):
        info = get_printer_dc_info()
        self.dpi_x  = info["dpi_x"]
        self.dpi_y  = info["dpi_y"]
        self.width  = info["pr_w"]   # Chop etiladigan maydon kengligi (piksel)
        self.height = info["pr_h"]
        self.off_x  = info["off_x"]
        self.off_y  = info["off_y"]
        self.hdc    = win32ui.CreateDC()
        self.hdc.CreatePrinterDC(PRINTER_NAME)
        self.hdc.SetBkMode(win32con.TRANSPARENT)
        self.hdc.SetTextColor(rgb(0, 0, 0))

    def start(self, doc_name="Chek"):
        self.hdc.StartDoc(doc_name)
        self.hdc.StartPage()

    def end(self):
        self.hdc.EndPage()
        self.hdc.EndDoc()
        self.hdc.DeleteDC()

    def font(self, pt=10, bold=False, name="Courier New"):
        weight = win32con.FW_BOLD if bold else win32con.FW_NORMAL
        h = pt_to_px(pt, self.dpi_y)
        return win32ui.CreateFont({
            "name": name,
            "height": h,
            "weight": weight,
            "charset": win32con.RUSSIAN_CHARSET,
        })

    def px(self, pt):
        """pt dan px"""
        return int(self.dpi_y * pt / 72)

    def text(self, x, y, text, pt=10, bold=False):
        f = self.font(pt=pt, bold=bold)
        self.hdc.SelectObject(f)
        self.hdc.TextOut(x, y, text)
        return y + self.px(pt) + self.px(2)

    def text_center(self, y, text, pt=10, bold=False):
        f = self.font(pt=pt, bold=bold)
        self.hdc.SelectObject(f)
        w, _ = self.hdc.GetTextExtent(text)
        x = max(0, (self.width - w) // 2)
        self.hdc.TextOut(x, y, text)
        return y + self.px(pt) + self.px(2)

    def text_right(self, y, text, pt=10, bold=False):
        f = self.font(pt=pt, bold=bold)
        self.hdc.SelectObject(f)
        w, _ = self.hdc.GetTextExtent(text)
        x = self.width - w
        self.hdc.TextOut(x, y, text)
        return y + self.px(pt) + self.px(2)

    def row(self, y, left_text, right_text, pt=9, bold=False):
        f = self.font(pt=pt, bold=bold)
        self.hdc.SelectObject(f)
        self.hdc.TextOut(0, y, str(left_text))
        rw, _ = self.hdc.GetTextExtent(str(right_text))
        self.hdc.TextOut(self.width - rw, y, str(right_text))
        return y + self.px(pt) + self.px(2)

    def sep(self, y, char="-", pt=9):
        f = self.font(pt=pt)
        self.hdc.SelectObject(f)
        cw, _ = self.hdc.GetTextExtent(char)
        count = max(1, self.width // max(1, cw))
        self.hdc.TextOut(0, y, char * count)
        return y + self.px(pt) + self.px(2)

    def header_bar(self, y, text, pt=10):
        """Qora fon, oq matn sarlavha"""
        f = self.font(pt=pt, bold=True)
        self.hdc.SelectObject(f)
        bar_h = self.px(pt) + self.px(4)
        # Qora to'rtburchak
        brush = win32ui.CreateBrush(win32con.BS_SOLID, rgb(0, 0, 0), 0)
        pen   = win32ui.CreatePen(win32con.PS_NULL, 0, rgb(0, 0, 0))
        old_b = self.hdc.SelectObject(brush)
        old_p = self.hdc.SelectObject(pen)
        self.hdc.Rectangle((0, y, self.width, y + bar_h))
        self.hdc.SelectObject(old_b)
        self.hdc.SelectObject(old_p)
        # Oq matn
        self.hdc.SetTextColor(rgb(255, 255, 255))
        self.hdc.SetBkMode(win32con.TRANSPARENT)
        self.hdc.TextOut(4, y + self.px(2), text)
        self.hdc.SetTextColor(rgb(0, 0, 0))
        return y + bar_h + self.px(2)

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
        worker_str = ", ".join(workers) or ""

        final = int(order.get("final", 0) or 0)
        paid  = int(order.get("paid",  0) or 0)
        debt  = final - paid

        p = Printer()
        p.start("Chek")
        y = 0

        # ══ HEADER ══
        y = p.text_center(y, "ASIA AUTO SERVICE", pt=18, bold=True)
        y = p.text_center(y, "Sifatli xizmat -- xavfsiz yo'l garovi!", pt=8)
        y += p.px(4)

        # ══ META ══
        y = p.sep(y)
        y = p.row(y, "Buyurtma :", f"#{order['id']}")
        y = p.row(y, "Sana     :", now)
        y = p.row(y, "Mijoz    :", str(order.get("ism", ""))[:28])
        y = p.row(y, "Mashina  :", str(order.get("mashina", ""))[:28])
        if order.get("raqam"):
            y = p.row(y, "Raqam    :", str(order["raqam"]).upper())
        if worker_str:
            y = p.row(y, "Xodim    :", worker_str[:28])
        y = p.sep(y)

        # ══ XIZMATLAR ══
        if services:
            y = p.header_bar(y, "KO'RSATILGAN XIZMATLAR:")
            y += p.px(2)
            for s in services:
                nom  = str(s.get("nom", "Xizmat"))[:30]
                narx = fmt(s.get("narx", 0))
                y = p.row(y, nom, narx)
            y += p.px(4)

        # ══ ZAPCHASTLAR ══
        if zaps:
            y = p.header_bar(y, "EHTIYOT QISMLAR:")
            y += p.px(2)
            for z in zaps:
                nom  = str(z.get("nom", "Zapchast"))[:30]
                narx = fmt(int(z.get("narx", 0)) * int(z.get("qty", 1)))
                y = p.row(y, nom, narx)
            y += p.px(4)

        y = p.sep(y)

        # ══ SUBTOTALLAR ══
        if paid > 0:
            y = p.row(y, "To'langan  :", fmt(paid) + " UZS")
            if debt > 0:
                y = p.row(y, "Qolgan qarz:", fmt(debt) + " UZS", bold=True)
            y += p.px(4)

        # ══ JAMI ══
        y = p.text_center(y, "JAMI SUMMA:", pt=13, bold=True)
        y = p.text_center(y, fmt(final) + " UZS", pt=20, bold=True)
        y += p.px(4)
        y = p.sep(y)

        # ══ FOOTER ══
        y = p.text_center(y, "TASHRIFINGIZ UCHUN RAHMAT!", pt=12, bold=True)
        y = p.text_center(y, "+998 90 570 88 88", pt=9)
        y = p.text_center(y, "Qo'qon sh., Ubay Oripov 10", pt=9)
        y = p.text_center(y, "Instagram & Telegram:", pt=9)
        y = p.text_center(y, "@asia_auto_service", pt=9)
        y += p.px(20)

        p.end()
        time.sleep(0.3)
        send_cut()
        log_message(f"✅ Chek chiqarildi! ID: {order['id']}")
        return True

    except Exception as e:
        log_message(f"❌ Print xatosi (ID:{order.get('id')}): {e}")
        import traceback
        log_message(traceback.format_exc())
        return False

def test_print():
    """DPI diagnostika + test chek"""
    try:
        p = Printer()
        log_message(f"Printer kengligi: {p.width}px, DPI: {p.dpi_x}x{p.dpi_y}")
        p.start("Test")
        y = 0
        y = p.text_center(y, "--- TEST ---", pt=14, bold=True)
        y = p.text_center(y, "Asia Auto Service", pt=11)
        y = p.text_center(y, "Printer ishlayapti!", pt=10)
        y += p.px(10)
        p.end()
        time.sleep(0.3)
        send_cut()
        log_message("✅ Test chek yuborildi!")
    except Exception as e:
        log_message(f"❌ Test xatosi: {e}")
        import traceback
        log_message(traceback.format_exc())

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

def acquire_lock():
    """Faqat bitta instance ishlashini ta'minlash"""
    lock_path = os.path.join(BASE_DIR, "print_agent.lock")
    try:
        lock_file = open(lock_path, "w")
        msvcrt.locking(lock_file.fileno(), msvcrt.LK_NBLCK, 1)
        return lock_file
    except (IOError, OSError):
        log_message("❌ Agent allaqachon ishlayapti! Ikkinchi instance yopildi.")
        sys.exit(0)

def main():
    lock = acquire_lock()
    log_message("=" * 48)
    log_message("Print Agent ishga tushdi (GDI v7)")
    log_message(f"Printer: {PRINTER_NAME}")
    log_message("=" * 48)
    fetch_workers()
    test_print()

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
