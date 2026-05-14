import time
import requests
import json
import win32print
import win32ui
import win32con
import os
import glob
from datetime import datetime

# --- SOZLAMALAR ---
PRINTER_NAME = "XP-80"
SUPABASE_URL = "https://fwktbleovtkxxpsccqqr.supabase.co"
SUPABASE_KEY = "sb_publishable_JUnUk2NcYb8fanWmD5TLJw_Gpmd4aoL"

CHECK_INTERVAL = 5
BASE_DIR  = os.path.dirname(os.path.abspath(__file__))
LOG_FILE  = os.path.join(BASE_DIR, "print_agent_log.txt")
WORKERS_MAP = {}

# 80mm printer: 576 dots kenglik
PAGE_W = 560
MARGIN = 10

def log_message(msg):
    ts  = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
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

# ─────────────────────────────────────────────
# GDI yordamchilar
# ─────────────────────────────────────────────
def mk_font(dc, name, height, weight=400, italic=False):
    return win32ui.CreateFont({
        "name": name, "height": height,
        "weight": weight, "italic": italic
    })

def filled_rect(dc, x, y, w, h, color=0x000000):
    brush = win32ui.CreateBrush(win32con.BS_SOLID, color, 0)
    pen   = win32ui.CreatePen(win32con.PS_NULL, 0, 0)
    ob    = dc.SelectObject(brush)
    op    = dc.SelectObject(pen)
    dc.Rectangle((x, y, x + w, y + h))
    dc.SelectObject(ob)
    dc.SelectObject(op)

def text_center(dc, y, text, font, page_w=PAGE_W, color=0x000000):
    dc.SelectObject(font)
    tw = dc.GetTextExtent(text)[0]
    dc.SetTextColor(color)
    dc.SetBkMode(win32con.TRANSPARENT)
    dc.TextOut((page_w - tw) // 2, y, text)

def text_left(dc, x, y, text, font, color=0x000000):
    dc.SelectObject(font)
    dc.SetTextColor(color)
    dc.SetBkMode(win32con.TRANSPARENT)
    dc.TextOut(x, y, text)

def text_right(dc, right_x, y, text, font, color=0x000000):
    dc.SelectObject(font)
    tw = dc.GetTextExtent(text)[0]
    dc.SetTextColor(color)
    dc.SetBkMode(win32con.TRANSPARENT)
    dc.TextOut(right_x - tw, y, text)

def dashed_line(dc, y, page_w=PAGE_W):
    pen = win32ui.CreatePen(win32con.PS_DOT, 1, 0xAAAAAA)
    op  = dc.SelectObject(pen)
    dc.MoveTo((0, y))
    dc.LineTo((page_w, y))
    dc.SelectObject(op)

def fmt(n):
    return f"{int(n):,}".replace(",", " ")

# ─────────────────────────────────────────────
# Chek chop etish
# ─────────────────────────────────────────────
def print_receipt(order):
    dc = None
    try:
        now = datetime.now().strftime("%d.%m.%Y %H:%M")

        services = order.get("services", [])
        if isinstance(services, str): services = json.loads(services)
        zaps = order.get("zaps", [])
        if isinstance(zaps, str): zaps = json.loads(zaps)

        # Xodim nomini topish
        workers = set()
        for s in (services or []):
            wid = s.get("workerId")
            if wid and wid in WORKERS_MAP:
                workers.add(WORKERS_MAP[wid])
        worker_str = ", ".join(workers) or "-"

        final = int(order.get("final", 0) or 0)
        paid  = int(order.get("paid",  0) or 0)
        debt  = final - paid

        # ── Fontlar ──
        f_logo    = mk_font(None, "Arial Black", 48, 900)
        f_service = mk_font(None, "Arial",       36, 900)
        f_tag     = mk_font(None, "Arial",        22, 400, italic=True)
        f_label   = mk_font(None, "Courier New",  24, 400)
        f_value   = mk_font(None, "Courier New",  24, 700)
        f_sec     = mk_font(None, "Arial",        26, 700)
        f_item    = mk_font(None, "Courier New",  26, 400)
        f_price   = mk_font(None, "Courier New",  26, 700)
        f_total_l = mk_font(None, "Arial",        28, 700)
        f_total_n = mk_font(None, "Arial Black",  54, 900)
        f_thanks  = mk_font(None, "Arial",        28, 700)
        f_contact = mk_font(None, "Courier New",  22, 400)

        dc = win32ui.CreateDC()
        dc.CreatePrinterDC(PRINTER_NAME)
        dc.StartDoc(f"Chek #{order['id']}")
        dc.StartPage()

        y = 0

        # ══ 1. LOGO ══════════════════════════════
        logo = "ASIA AUTO SERVICE"
        dc.SelectObject(f_logo)
        tw = dc.GetTextExtent(logo)[0]
        dc.SetTextColor(0x000000)
        dc.SetBkMode(win32con.TRANSPARENT)
        dc.TextOut((PAGE_W - tw) // 2, y + 6, logo)
        y += 56

        # SERVICE — ikki chiziq orasida
        dc.SelectObject(f_service)
        svc_tw = dc.GetTextExtent("SERVICE")[0]
        sx = (PAGE_W - svc_tw) // 2
        # Ustki chiziq
        pen = win32ui.CreatePen(win32con.PS_SOLID, 2, 0x000000)
        op  = dc.SelectObject(pen)
        dc.MoveTo((sx - 10, y)); dc.LineTo((sx + svc_tw + 10, y))
        dc.SelectObject(op)
        y += 4
        text_center(dc, y, "SERVICE", f_service)
        y += 28
        pen2 = win32ui.CreatePen(win32con.PS_SOLID, 2, 0x000000)
        op2  = dc.SelectObject(pen2)
        dc.MoveTo((sx - 10, y)); dc.LineTo((sx + svc_tw + 10, y))
        dc.SelectObject(op2)
        y += 8

        # Tagline
        text_center(dc, y, "Sifatli xizmat — xavfsiz yo'l garovi!", f_tag, color=0x888888)
        y += 30

        dashed_line(dc, y); y += 12

        # ══ 2. META INFO ══════════════════════════
        meta = [
            ("BUYURTMA", f"#{order['id']}"),
            ("SANA",     now),
            ("MIJOZ",    str(order.get("ism", ""))[:24]),
            ("MASHINA",  str(order.get("mashina", ""))[:24]),
        ]
        if order.get("raqam"):
            meta.append(("RAQAM", str(order["raqam"])))
        if worker_str and worker_str != "-":
            meta.append(("XODIM", worker_str[:24]))

        for label, val in meta:
            text_left(dc,  MARGIN,       y, label + ":", f_label, color=0x888888)
            text_right(dc, PAGE_W - MARGIN, y, val,     f_value)
            y += 30

        y += 6
        dashed_line(dc, y); y += 10

        # ══ 3. XIZMATLAR ══════════════════════════
        if services:
            filled_rect(dc, 0, y, PAGE_W, 36, 0x111111)
            dc.SetBkMode(win32con.TRANSPARENT)
            text_center(dc, y + 6, "KO'RSATILGAN XIZMATLAR", f_sec, color=0xFFFFFF)
            y += 40

            for s in services:
                nom  = str(s.get("nom", "Xizmat"))
                narx = fmt(s.get("narx", 0))
                # Uzun nomni qisqartirish
                if len(nom) > 26:
                    nom = nom[:25] + "."
                text_left(dc,  MARGIN + 6,       y, nom,  f_item)
                text_right(dc, PAGE_W - MARGIN,  y, narx, f_price)
                y += 32

            y += 4

        # ══ 4. EHTIYOT QISMLAR ════════════════════
        if zaps:
            filled_rect(dc, 0, y, PAGE_W, 36, 0x111111)
            dc.SetBkMode(win32con.TRANSPARENT)
            text_center(dc, y + 6, "EHTIYOT QISMLAR", f_sec, color=0xFFFFFF)
            y += 40

            for z in zaps:
                nom  = str(z.get("nom", "Zapchast"))
                qty  = int(z.get("qty", 1))
                narx = fmt(int(z.get("narx", 0)) * qty)
                if len(nom) > 26:
                    nom = nom[:25] + "."
                text_left(dc,  MARGIN + 6,       y, nom,  f_item)
                text_right(dc, PAGE_W - MARGIN,  y, narx, f_price)
                y += 32

            y += 4

        # ══ 5. SUBTOTALLAR (faqat qisman to'langan) ══
        if paid > 0:
            dashed_line(dc, y); y += 8
            if paid > 0:
                text_left(dc,  MARGIN,           y, "To'langan:", f_label, color=0x006600)
                text_right(dc, PAGE_W - MARGIN,  y, fmt(paid) + " UZS", f_value, color=0x006600)
                y += 28
            if debt > 0:
                text_left(dc,  MARGIN,           y, "Qolgan qarz:", f_label, color=0x0000CC)
                text_right(dc, PAGE_W - MARGIN,  y, fmt(debt) + " UZS", f_value, color=0x0000CC)
                y += 28
            y += 4

        # ══ 6. JAMI QORA BAR ══════════════════════
        filled_rect(dc, 0, y, PAGE_W, 82, 0x111111)
        dc.SetBkMode(win32con.TRANSPARENT)
        text_left(dc, MARGIN, y + 10, "JAMI", f_total_l, color=0xAAAAAA)

        total_str = fmt(final) + " UZS"
        dc.SelectObject(f_total_n)
        dc.SetTextColor(0xFFFFFF)
        tw = dc.GetTextExtent(total_str)[0]
        dc.TextOut(PAGE_W - MARGIN - tw, y + 14, total_str)
        y += 88

        # ══ 7. FOOTER ═════════════════════════════
        dashed_line(dc, y); y += 14
        text_center(dc, y, "TASHRIFINGIZ UCHUN RAHMAT!", f_thanks)
        y += 38

        for line in ["+998 90 570 88 88", "Qo'qon sh., Ubay Oripov 12", "@asia_auto_service"]:
            text_center(dc, y, line, f_contact, color=0x666666)
            y += 28

        y += 280
        dc.SetTextColor(0xFFFFFF)
        dc.TextOut(0, y, ".")

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

# ─────────────────────────────────────────────
def get_pending():
    headers = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"}
    try:
        r = requests.get(
            f"{SUPABASE_URL}/rest/v1/orders?print_status=eq.pending&order=id.asc",
            headers=headers, timeout=10
        )
        return r.json() if r.status_code == 200 else []
    except Exception as e:
        log_message(f"Baza xatosi: {e}"); return []

def mark_printed(order_id):
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }
    try:
        requests.patch(
            f"{SUPABASE_URL}/rest/v1/orders?id=eq.{order_id}",
            headers=headers, json={"print_status": "printed"}, timeout=10
        )
    except Exception as e:
        log_message(f"Mark xatosi: {e}")

# ─────────────────────────────────────────────
def main():
    log_message("=" * 48)
    log_message("Print Agent ishga tushdi (win32print)")
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
