import time
import requests
import json
import win32print
import win32ui
import win32con
import win32gui
import os
import sys
import msvcrt
from PIL import Image
from datetime import datetime

PRINTER_NAME   = "XP-80"
SUPABASE_URL   = "https://fwktbleovtkxxpsccqqr.supabase.co"
SUPABASE_KEY   = "sb_publishable_JUnUk2NcYb8fanWmD5TLJw_Gpmd4aoL"
CHECK_INTERVAL = 5
BASE_DIR       = os.path.dirname(os.path.abspath(__file__))
LOG_FILE       = os.path.join(BASE_DIR, "print_agent_log.txt")
LOGO_FILE      = os.path.join(BASE_DIR, "public", "logo-receipt.png")
WORKERS_MAP    = {}

def log_message(msg):
    ts   = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{ts}] {msg}"
    print(line)
    try:
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(line + "\n")
    except:
        pass

def acquire_lock():
    lock_path = os.path.join(BASE_DIR, "print_agent.lock")
    try:
        lf = open(lock_path, "w")
        msvcrt.locking(lf.fileno(), msvcrt.LK_NBLCK, 1)
        return lf
    except (IOError, OSError):
        log_message("Agent allaqachon ishlayapti!")
        sys.exit(0)

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

def rgb(r, g, b):
    return r | (g << 8) | (b << 16)

# ── Logo → ESC/POS bitmap ─────────────────────────────
def logo_to_escpos(path, print_width=400):
    try:
        src = Image.open(path)
        bg  = Image.new("RGB", src.size, (255, 255, 255))
        if src.mode in ("RGBA", "LA", "P"):
            src = src.convert("RGBA")
            bg.paste(src, mask=src.split()[3])
        else:
            bg.paste(src.convert("RGB"))
        if bg.width != print_width:
            ratio = print_width / bg.width
            bg    = bg.resize((print_width, max(1, int(bg.height * ratio))), Image.LANCZOS)
        bw = bg.convert("L").point(lambda p: 0 if p < 128 else 255, "1")
        w  = bw.width
        if w % 8 != 0:
            pad = Image.new("1", ((w + 7) // 8 * 8, bw.height), 1)
            pad.paste(bw, (0, 0))
            bw  = pad
            w   = bw.width
        width_bytes = w // 8
        height      = bw.height
        buf = b"\x1d\x76\x30\x00" + bytes([width_bytes & 0xFF, (width_bytes >> 8) & 0xFF,
                                            height & 0xFF, (height >> 8) & 0xFF])
        px  = bw.load()
        for y in range(height):
            for x in range(0, w, 8):
                byte = 0
                for bit in range(8):
                    if px[x + bit, y] == 0:
                        byte |= (0x80 >> bit)
                buf += bytes([byte])
        return buf
    except Exception as e:
        log_message(f"Logo xatosi: {e}")
        return b""

def send_raw(data: bytes):
    hp = win32print.OpenPrinter(PRINTER_NAME)
    try:
        win32print.StartDocPrinter(hp, 1, ("Cut", None, "RAW"))
        win32print.StartPagePrinter(hp)
        win32print.WritePrinter(hp, data)
        win32print.EndPagePrinter(hp)
        win32print.EndDocPrinter(hp)
    finally:
        win32print.ClosePrinter(hp)

# ── GDI Printer ──────────────────────────────────────
def pt_to_px(pt, dpi):
    return -int(dpi * pt / 72)

class Printer:
    def __init__(self):
        self.hdc = win32ui.CreateDC()
        self.hdc.CreatePrinterDC(PRINTER_NAME)
        self.dpi   = self.hdc.GetDeviceCaps(win32con.LOGPIXELSY)
        self.width = self.hdc.GetDeviceCaps(win32con.HORZRES)
        self.hdc.SetBkMode(win32con.TRANSPARENT)
        self.hdc.SetTextColor(rgb(0, 0, 0))

    def start(self, name="Chek"):
        self.hdc.StartDoc(name)
        self.hdc.StartPage()

    def end(self):
        self.hdc.EndPage()
        self.hdc.EndDoc()
        self.hdc.DeleteDC()

    def px(self, pt):
        return int(self.dpi * pt / 72)

    def font(self, pt=10, bold=False):
        return win32ui.CreateFont({
            "name":    "Segoe UI",
            "height":  pt_to_px(pt, self.dpi),
            "weight":  win32con.FW_BOLD if bold else win32con.FW_NORMAL,
            "charset": win32con.DEFAULT_CHARSET,   # emoji uchun
        })

    def text_center(self, y, text, pt=10, bold=False):
        f = self.font(pt=pt, bold=bold)
        self.hdc.SelectObject(f)
        w, _ = self.hdc.GetTextExtent(text)
        self.hdc.TextOut(max(0, (self.width - w) // 2), y, text)
        return y + self.px(pt) + self.px(2)

    def row(self, y, left_text, right_text, pt=9, bold=False):
        f = self.font(pt=pt, bold=bold)
        self.hdc.SelectObject(f)
        self.hdc.TextOut(0, y, str(left_text))
        rw, _ = self.hdc.GetTextExtent(str(right_text))
        self.hdc.TextOut(self.width - rw, y, str(right_text))
        return y + self.px(pt) + self.px(2)

    def sep(self, y, pt=8):
        f = self.font(pt=pt)
        self.hdc.SelectObject(f)
        cw, _ = self.hdc.GetTextExtent("-")
        count  = max(1, self.width // max(1, cw))
        self.hdc.TextOut(0, y, "-" * count)
        return y + self.px(pt) + self.px(2)

    def draw_logo(self, y):
        """Logo rasmini GDI orqali chizish (bitta job ichida)"""
        try:
            img = Image.open(LOGO_FILE)
            # Shaffoflikni oq fonga o'zgartirish
            if img.mode in ("RGBA", "LA", "P"):
                bg = Image.new("RGB", img.size, (255, 255, 255))
                src = img.convert("RGBA")
                bg.paste(src, mask=src.split()[3])
                img = bg
            else:
                img = img.convert("RGB")
            # Printer kengligi bo'yicha o'lchamni moslash
            new_h = max(1, int(img.height * self.width / img.width))
            img = img.resize((self.width, new_h), Image.LANCZOS)
            # Vaqtincha BMP fayl saqlash
            tmp_path = os.path.join(BASE_DIR, "_logo_print.bmp")
            img.save(tmp_path, "BMP")
            # GDI orqali chizish
            IMAGE_BITMAP   = 0
            LR_LOADFROMFILE = 0x00000010
            hbmp = win32gui.LoadImage(0, tmp_path, IMAGE_BITMAP, 0, 0, LR_LOADFROMFILE)
            hdc_handle = self.hdc.GetSafeHdc()
            mem_dc = win32gui.CreateCompatibleDC(hdc_handle)
            old_bmp = win32gui.SelectObject(mem_dc, hbmp)
            win32gui.StretchBlt(
                hdc_handle, 0, y, self.width, new_h,
                mem_dc, 0, 0, self.width, new_h,
                win32con.SRCCOPY
            )
            win32gui.SelectObject(mem_dc, old_bmp)
            win32gui.DeleteDC(mem_dc)
            win32gui.DeleteObject(hbmp)
            try: os.unlink(tmp_path)
            except: pass
            return y + new_h
        except Exception as e:
            log_message(f"Logo GDI xatosi: {e}")
            return y

    def header_bar(self, y, text, pt=10):
        f     = self.font(pt=pt, bold=True)
        self.hdc.SelectObject(f)
        bar_h = self.px(pt) + self.px(4)
        brush = win32ui.CreateBrush(win32con.BS_SOLID, rgb(0, 0, 0), 0)
        pen   = win32ui.CreatePen(win32con.PS_NULL, 0, rgb(0, 0, 0))
        ob    = self.hdc.SelectObject(brush)
        op    = self.hdc.SelectObject(pen)
        self.hdc.Rectangle((0, y, self.width, y + bar_h))
        self.hdc.SelectObject(ob)
        self.hdc.SelectObject(op)
        self.hdc.SetTextColor(rgb(255, 255, 255))
        self.hdc.TextOut(4, y + self.px(2), text)
        self.hdc.SetTextColor(rgb(0, 0, 0))
        return y + bar_h + self.px(2)

# ── Chek ──────────────────────────────────────────────
def print_receipt(order):
    try:
        now      = datetime.now().strftime("%d.%m.%Y %H:%M")
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

        # ══ Hammasi bitta GDI job: logo + matn ══
        p = Printer()
        p.start("Chek")
        y = 0

        # Logo tepada
        y = p.draw_logo(y)
        y += p.px(4)

        y = p.text_center(y, "Sifatli xizmat -- xavfsiz yo'l garovi!", pt=8)
        y += p.px(3)
        y  = p.sep(y)
        y  = p.row(y, "Buyurtma :", f"#{order['id']}")
        y  = p.row(y, "Sana     :", now)
        y  = p.row(y, "Mijoz    :", str(order.get("ism", ""))[:28])
        y  = p.row(y, "Mashina  :", str(order.get("mashina", ""))[:28])
        if order.get("raqam"):
            y = p.row(y, "Raqam    :", str(order["raqam"]).upper())
        if worker_str:
            y = p.row(y, "Xodim    :", worker_str[:28])
        y = p.sep(y)

        if services:
            y = p.header_bar(y, "KO'RSATILGAN XIZMATLAR:")
            y += p.px(2)
            for s in services:
                nom  = str(s.get("nom", s.get("name", "Xizmat")))[:32]
                narx = fmt(s.get("narx", s.get("price", 0)))
                y = p.row(y, nom, narx)
            y += p.px(3)

        if zaps:
            y = p.header_bar(y, "EHTIYOT QISMLAR:")
            y += p.px(2)
            for z in zaps:
                nom  = str(z.get("nom", z.get("name", "Zapchast")))[:32]
                narx = fmt(int(z.get("narx", z.get("price", 0))) * int(z.get("qty", 1)))
                y = p.row(y, nom, narx)
            y += p.px(3)

        y = p.sep(y)

        if paid > 0:
            y = p.row(y, "To'langan  :", fmt(paid) + " UZS")
            if debt > 0:
                y = p.row(y, "Qolgan qarz:", fmt(debt) + " UZS", bold=True)
            y += p.px(3)

        y = p.text_center(y, "JAMI SUMMA:", pt=13, bold=True)
        y = p.text_center(y, fmt(final) + " UZS", pt=20, bold=True)
        y += p.px(4)
        y = p.sep(y)

        y = p.text_center(y, "TASHRIFINGIZ UCHUN RAHMAT!", pt=12, bold=True)
        y = p.text_center(y, "+998 90 570 88 88", pt=9)
        y = p.text_center(y, "Qo'qon sh., Ubay Oripov 10", pt=9)
        y = p.text_center(y, "Dushanba-Shanba | 9:00 dan 20:00 gacha", pt=9)
        y = p.text_center(y, "Karta: 5614 6821 1966 0704", pt=9)
        y = p.text_center(y, "Instagram & Telegram:", pt=9)
        y = p.text_center(y, "@asia_auto_service", pt=9)
        y += p.px(20)

        p.end()

        # ══ Faqat CUT — ESC/POS ══
        time.sleep(0.3)
        send_raw(b"\x1d\x56\x41\x05")

        log_message(f"Chek chiqarildi! ID: {order['id']}")
        return True

    except Exception as e:
        log_message(f"Print xatosi (ID:{order.get('id')}): {e}")
        import traceback
        log_message(traceback.format_exc())
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
    lock = acquire_lock()
    log_message("=" * 48)
    log_message("Print Agent ishga tushdi (GDI+Emoji v9)")
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
