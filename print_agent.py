import time
import requests
import json
import win32print
import win32ui
import win32con
import os
from datetime import datetime, timedelta

# --- SOZLAMALAR ---
PRINTER_NAME = "XP-80" # Windowsdagi printer nomi

SUPABASE_URL = "https://fwktbleovtkxxpsccqqr.supabase.co"
SUPABASE_KEY = "sb_publishable_JUnUk2NcYb8fanWmD5TLJw_Gpmd4aoL"

CHECK_INTERVAL = 5 # Har 5 soniyada tekshiradi
LAST_ORDER_ID = 0
WORKERS_MAP = {}

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LOG_FILE = os.path.join(BASE_DIR, "print_agent_log.txt")

# --- 80mm printer uchun hisob-kitob ---
# XP-80 printer: 576 dots (72 dots/mm * 80mm = 576 dots)
PAGE_W = 576

def log_message(message):
    """Xabarni ham konsolga, ham faylga yozadi"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    full_message = f"[{timestamp}] {message}"
    print(full_message)
    try:
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(full_message + "\n")
    except:
        pass

def fetch_workers():
    global WORKERS_MAP
    url = f"{SUPABASE_URL}/rest/v1/workers?select=id,ism"
    headers = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"}
    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 200:
            for w in response.json():
                WORKERS_MAP[w['id']] = w['ism']
    except Exception as e:
        log_message(f"Ishchilarni yuklashda xato: {e}")

def draw_filled_rect(dc, x, y, w, h, color=0x000000):
    """To'ldirilgan to'rtburchak chizish"""
    brush = win32ui.CreateBrush(win32con.BS_SOLID, color, 0)
    old_brush = dc.SelectObject(brush)
    old_pen = dc.SelectObject(win32ui.CreatePen(win32con.PS_NULL, 0, 0x000000))
    dc.Rectangle((x, y, x + w, y + h))
    dc.SelectObject(old_brush)
    dc.SelectObject(old_pen)

def draw_dashed_line(dc, y, width=PAGE_W):
    """Nuqtali gorizontal chiziq"""
    pen = win32ui.CreatePen(win32con.PS_DOT, 1, 0x999999)
    old_pen = dc.SelectObject(pen)
    dc.MoveTo((0, y))
    dc.LineTo((width, y))
    dc.SelectObject(old_pen)

def text_out_white(dc, x, y, text, font):
    """Oq rangda matn yozish"""
    dc.SelectObject(font)
    old_color = dc.SetTextColor(0xFFFFFF)
    old_bk = dc.SetBkMode(win32con.TRANSPARENT)
    dc.TextOut(x, y, text)
    dc.SetTextColor(old_color)
    dc.SetBkMode(old_bk)

def text_out_black(dc, x, y, text, font):
    """Qora rangda matn yozish"""
    dc.SelectObject(font)
    old_color = dc.SetTextColor(0x000000)
    old_bk = dc.SetBkMode(win32con.TRANSPARENT)
    dc.TextOut(x, y, text)
    dc.SetTextColor(old_color)
    dc.SetBkMode(old_bk)

def text_out_gray(dc, x, y, text, font):
    """Kulrang matn"""
    dc.SelectObject(font)
    old_color = dc.SetTextColor(0x888888)
    old_bk = dc.SetBkMode(win32con.TRANSPARENT)
    dc.TextOut(x, y, text)
    dc.SetTextColor(old_color)
    dc.SetBkMode(old_bk)

def text_right(dc, right_x, y, text, font):
    """O'ng tomonga tekislangan matn"""
    dc.SelectObject(font)
    size = dc.GetTextExtent(text)
    x = right_x - size[0]
    old_bk = dc.SetBkMode(win32con.TRANSPARENT)
    dc.TextOut(x, y, text)
    dc.SetBkMode(old_bk)

def print_receipt(order):
    """Buyurtmani boyitilgan ko'rinishda chop etadi"""
    dc = None
    try:
        now = datetime.now().strftime("%d.%m.%Y %H:%M")

        # Printer uchun Device Context (DC) yaratish
        dc = win32ui.CreateDC()
        dc.CreatePrinterDC(PRINTER_NAME)
        dc.StartDoc(f"Buyurtma #{order['id']}")
        dc.StartPage()

        # --- Fontlar ---
        font_logo    = win32ui.CreateFont({"name": "Arial Black", "height": 46, "weight": 900})
        font_tagline = win32ui.CreateFont({"name": "Arial",       "height": 22, "weight": 400, "italic": 1})
        font_label   = win32ui.CreateFont({"name": "Courier New", "height": 24, "weight": 400})
        font_value   = win32ui.CreateFont({"name": "Courier New", "height": 24, "weight": 700})
        font_section = win32ui.CreateFont({"name": "Arial",       "height": 28, "weight": 700})
        font_item    = win32ui.CreateFont({"name": "Courier New", "height": 26, "weight": 400})
        font_price   = win32ui.CreateFont({"name": "Courier New", "height": 26, "weight": 700})
        font_total_l = win32ui.CreateFont({"name": "Arial",       "height": 30, "weight": 700})
        font_total_n = win32ui.CreateFont({"name": "Arial Black", "height": 52, "weight": 900})
        font_footer  = win32ui.CreateFont({"name": "Arial",       "height": 26, "weight": 700})
        font_contact = win32ui.CreateFont({"name": "Courier New", "height": 22, "weight": 400})

        M = 12   # gorizontal margin
        R = PAGE_W - M  # o'ng chegara
        y = 0

        # ═══════════════════════════════════════
        # 1. QORA HEADER
        # ═══════════════════════════════════════
        HEADER_H = 90
        draw_filled_rect(dc, 0, y, PAGE_W, HEADER_H, 0x111111)

        # Logo markaz
        logo_text = "ASIA AUTO SERVICE"
        dc.SelectObject(font_logo)
        tw = dc.GetTextExtent(logo_text)[0]
        text_out_white(dc, (PAGE_W - tw) // 2, y + 8, logo_text, font_logo)

        # Tagline
        tag_text = "Sifatli xizmat — xavfsiz yo'l garovi!"
        dc.SelectObject(font_tagline)
        tw2 = dc.GetTextExtent(tag_text)[0]
        text_out_white(dc, (PAGE_W - tw2) // 2, y + 56, tag_text, font_tagline)

        y += HEADER_H + 8

        # ═══════════════════════════════════════
        # 2. META BLOK (buyurtma ma'lumotlari)
        # ═══════════════════════════════════════
        # Xodim nomini aniqlash
        services = order.get('services', [])
        if isinstance(services, str): services = json.loads(services)
        workers_set = set()
        for s in (services or []):
            wid = s.get('workerId')
            if wid and wid in WORKERS_MAP:
                workers_set.add(WORKERS_MAP[wid])
        workers_str = ", ".join(workers_set) or order.get('worker_name', '-')

        rows = [
            ("BUYURTMA", f"#{order['id']}"),
            ("SANA",     now),
            ("MIJOZ",    str(order.get('ism', ''))[:22]),
            ("MASHINA",  str(order.get('mashina', ''))[:22]),
            ("RAQAM",    str(order.get('raqam', '') or '-')),
        ]
        if workers_str and workers_str != '-':
            rows.append(("XODIM", workers_str[:22]))

        ROW_H = 30
        for label, value in rows:
            text_out_gray(dc, M, y, label + ":", font_label)
            # Value o'ngga
            dc.SelectObject(font_value)
            dc.SetTextColor(0x000000)
            dc.SetBkMode(win32con.TRANSPARENT)
            dc.TextOut(M + 115, y, value)
            dc.SetTextColor(0x000000)
            y += ROW_H

        y += 8
        draw_dashed_line(dc, y)
        y += 14

        # ═══════════════════════════════════════
        # 3. XIZMATLAR BO'LIMI
        # ═══════════════════════════════════════
        if services:
            # Qora sarlavha
            draw_filled_rect(dc, 0, y, PAGE_W, 34, 0x111111)
            dc.SelectObject(font_section)
            dc.SetTextColor(0xFFFFFF)
            dc.SetBkMode(win32con.TRANSPARENT)
            dc.TextOut(M, y + 4, "KO'RSATILGAN XIZMATLAR:")
            dc.SetTextColor(0x000000)
            y += 38

            for s in services:
                nom = str(s.get('nom', 'Xizmat'))
                narx_val = int(s.get('narx', 0))
                narx_str = f"{narx_val:,}".replace(',', ' ')

                # Nom (wrapping - 28 belgi)
                if len(nom) > 28:
                    nom1 = nom[:28]
                    nom2 = nom[28:]
                    dc.SelectObject(font_item)
                    dc.SetBkMode(win32con.TRANSPARENT)
                    dc.TextOut(M + 8, y, nom1)
                    y += 26
                    dc.TextOut(M + 8, y, nom2[:28])
                else:
                    dc.SelectObject(font_item)
                    dc.SetBkMode(win32con.TRANSPARENT)
                    dc.TextOut(M + 8, y, nom)

                # Narx (o'ngga)
                dc.SelectObject(font_price)
                dc.SetTextColor(0x000000)
                pw = dc.GetTextExtent(narx_str)[0]
                dc.TextOut(R - pw, y, narx_str)
                dc.SetTextColor(0x000000)
                y += 30

            y += 4

        # ═══════════════════════════════════════
        # 4. EHTIYOT QISMLAR BO'LIMI
        # ═══════════════════════════════════════
        zaps = order.get('zaps', [])
        if isinstance(zaps, str): zaps = json.loads(zaps)

        if zaps:
            draw_filled_rect(dc, 0, y, PAGE_W, 34, 0x111111)
            dc.SelectObject(font_section)
            dc.SetTextColor(0xFFFFFF)
            dc.SetBkMode(win32con.TRANSPARENT)
            dc.TextOut(M, y + 4, "EHTIYOT QISMLAR:")
            dc.SetTextColor(0x000000)
            y += 38

            for z in zaps:
                nom = str(z.get('nom', 'Zapchast'))
                qty = int(z.get('qty', 1))
                narx_val = int(z.get('narx', 0)) * qty
                narx_str = f"{narx_val:,}".replace(',', ' ')
                sub = f"{int(z.get('narx',0)):,}".replace(',', ' ') + f" x{qty}"

                nom_short = nom[:26]
                dc.SelectObject(font_item)
                dc.SetBkMode(win32con.TRANSPARENT)
                dc.TextOut(M + 8, y, nom_short)

                dc.SelectObject(font_price)
                dc.SetTextColor(0x000000)
                pw = dc.GetTextExtent(narx_str)[0]
                dc.TextOut(R - pw, y, narx_str)

                y += 26
                # kichik sub matn (narx x qty)
                text_out_gray(dc, M + 16, y, sub, font_contact)
                y += 28

            y += 4

        # ═══════════════════════════════════════
        # 5. SUBTOTALLAR (to'langan / qarz)
        # ═══════════════════════════════════════
        paid = int(order.get('paid', 0) or 0)
        final = int(order.get('final', 0) or 0)
        debt = final - paid

        draw_dashed_line(dc, y)
        y += 12

        if paid > 0 and paid < final:
            paid_str = f"To'langan:  {paid:,}".replace(',', ' ') + " UZS"
            dc.SelectObject(font_label)
            dc.SetTextColor(0x16A34A)  # yashil
            dc.SetBkMode(win32con.TRANSPARENT)
            dc.TextOut(M, y, paid_str)
            dc.SetTextColor(0x000000)
            y += 28

        if debt > 0:
            debt_str = f"Qolgan qarz:{debt:,}".replace(',', ' ') + " UZS"
            dc.SelectObject(font_label)
            dc.SetTextColor(0x0000CC)  # qizil (BGR)
            dc.SetBkMode(win32con.TRANSPARENT)
            dc.TextOut(M, y, debt_str)
            dc.SetTextColor(0x000000)
            y += 28

        y += 4

        # ═══════════════════════════════════════
        # 6. JAMI QORA BAR
        # ═══════════════════════════════════════
        TOTAL_H = 80
        draw_filled_rect(dc, 0, y, PAGE_W, TOTAL_H, 0x111111)

        # "JAMI SUMMA" label
        text_out_white(dc, M, y + 8, "JAMI SUMMA", font_total_l)

        # Raqam o'ngga
        total_str = f"{final:,}".replace(',', ' ') + " UZS"
        dc.SelectObject(font_total_n)
        dc.SetTextColor(0xFFFFFF)
        dc.SetBkMode(win32con.TRANSPARENT)
        tw3 = dc.GetTextExtent(total_str)[0]
        dc.TextOut(PAGE_W - M - tw3, y + 16, total_str)
        dc.SetTextColor(0x000000)

        y += TOTAL_H + 14

        # ═══════════════════════════════════════
        # 7. FOOTER
        # ═══════════════════════════════════════
        draw_dashed_line(dc, y)
        y += 16

        thanks = "TASHRIFINGIZ UCHUN RAHMAT!"
        dc.SelectObject(font_footer)
        dc.SetBkMode(win32con.TRANSPARENT)
        tw4 = dc.GetTextExtent(thanks)[0]
        dc.TextOut((PAGE_W - tw4) // 2, y, thanks)
        y += 40

        contacts = [
            "+998 90 570 88 88",
            "Qo'qon sh., Ubay Oripov 12",
            "09:00-20:00",
            "@asia_auto_service"
        ]
        for c in contacts:
            dc.SelectObject(font_contact)
            dc.SetTextColor(0x666666)
            dc.SetBkMode(win32con.TRANSPARENT)
            cw = dc.GetTextExtent(c)[0]
            dc.TextOut((PAGE_W - cw) // 2, y, c)
            dc.SetTextColor(0x000000)
            y += 28

        y += 280  # Qog'oz surilishi
        dc.TextOut(0, y, ".")

        dc.EndPage()
        dc.EndDoc()

        # Kesish
        try:
            hprinter = win32print.OpenPrinter(PRINTER_NAME)
            try:
                hjob = win32print.StartDocPrinter(hprinter, 1, ("Cut", None, "RAW"))
                win32print.StartPagePrinter(hprinter)
                win32print.WritePrinter(hprinter, b"\x1d\x56\x01")
                win32print.EndPagePrinter(hprinter)
                win32print.EndDocPrinter(hprinter)
            finally:
                win32print.ClosePrinter(hprinter)
        except:
            pass

        log_message(f"Chek chiqarildi! ID: {order['id']}")
        return True
    except Exception as e:
        log_message(f"Chop etishda xato (ID: {order.get('id')}): {e}")
        return False
    finally:
        if dc:
            try:
                dc.DeleteDC()
            except:
                pass

def get_orders_to_print():
    """Chop etilishi kerak bo'lgan buyurtmalarni oladi"""
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }

    url_pending = f"{SUPABASE_URL}/rest/v1/orders?print_status=eq.pending&order=id.asc"

    try:
        res_pending = requests.get(url_pending, headers=headers, timeout=10)
        pending_list = res_pending.json() if res_pending.status_code == 200 else []

        global LAST_ORDER_ID
        url_new = f"{SUPABASE_URL}/rest/v1/orders?id=gt.{LAST_ORDER_ID}&order=id.asc"
        res_new = requests.get(url_new, headers=headers, timeout=10)
        new_list = res_new.json() if res_new.status_code == 200 else []

        all_to_print = {o['id']: o for o in (pending_list + new_list)}.values()
        return sorted(all_to_print, key=lambda x: x['id'])
    except Exception as e:
        log_message(f"Baza bilan ulanishda xato: {e}")
        return []

def mark_as_printed(order_id):
    """Buyurtmani 'printed' holatiga o'tkazadi"""
    url = f"{SUPABASE_URL}/rest/v1/orders?id=eq.{order_id}"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }
    try:
        response = requests.patch(url, headers=headers, json={"print_status": "printed"}, timeout=10)
        if response.status_code not in (200, 204):
            log_message(f"Statusni yangilashda xatolik (HTTP {response.status_code}): {response.text}")
    except Exception as e:
        log_message(f"Statusni yangilashda xato (Network): {e}")

def main():
    global LAST_ORDER_ID
    log_message("Professional Print Agent ishga tushdi...")
    log_message(f"Printer: {PRINTER_NAME}")

    fetch_workers()

    url = f"{SUPABASE_URL}/rest/v1/orders?select=id&print_status=eq.printed&order=id.desc&limit=1"
    headers = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"}
    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 200:
            res = response.json()
            if res:
                LAST_ORDER_ID = res[0]['id']
                log_message(f"Oxirgi chop etilgan ID: {LAST_ORDER_ID}")
            else:
                url_last = f"{SUPABASE_URL}/rest/v1/orders?select=id&order=id.desc&limit=1"
                res_last = requests.get(url_last, headers=headers, timeout=10).json()
                if res_last: LAST_ORDER_ID = res_last[0]['id']
                log_message(f"Printed topilmadi. Oxirgi ID: {LAST_ORDER_ID}")
    except Exception as e:
        log_message(f"Boshlang'ich ID ni olishda xato: {e}")

    counter = 0
    while True:
        try:
            if counter == 0:
                fetch_workers()

            to_print = get_orders_to_print()
            for order in to_print:
                if order.get('print_status') == 'printed':
                    continue

                log_message(f"Chop etilmoqda... ID: {order['id']}")
                if print_receipt(order):
                    mark_as_printed(order['id'])
                    if order['id'] > LAST_ORDER_ID:
                        LAST_ORDER_ID = order['id']

            counter += 1
            if counter >= 12:
                log_message(f"Agent ishlayapti... {datetime.now().strftime('%H:%M:%S')}")
                counter = 0

            time.sleep(CHECK_INTERVAL)
        except Exception as e:
            log_message(f"Loop xatosi: {e}")
            time.sleep(CHECK_INTERVAL)

if __name__ == "__main__":
    main()
