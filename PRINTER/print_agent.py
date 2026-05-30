import time
import requests
import json
import win32print
import win32ui
import os
import struct
from datetime import datetime, timedelta

try:
    from PIL import Image
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False

# --- SOZLAMALAR ---
PRINTER_NAME = "XP-80" # Windowsdagi printer nomi

SUPABASE_URL = "https://fwktbleovtkxxpsccqqr.supabase.co"
SUPABASE_KEY = "sb_publishable_JUnUk2NcYb8fanWmD5TLJw_Gpmd4aoL"

CHECK_INTERVAL = 2 # Har 2 soniyada tekshiradi
LAST_ORDER_ID = 0

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LOG_FILE = os.path.join(BASE_DIR, "print_agent_log.txt")

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

def get_logo_escpos(max_width=400):
    """logo-receipt.png ni ESC/POS raster formatiga o'giradi"""
    if not PIL_AVAILABLE:
        return None
    logo_path = os.path.join(os.path.dirname(BASE_DIR), 'public', 'logo-receipt.png')
    if not os.path.exists(logo_path):
        # Hostingerdagi yo'l
        logo_path = os.path.join(BASE_DIR, '..', 'public', 'logo-receipt.png')
    if not os.path.exists(logo_path):
        return None
    try:
        img = Image.open(logo_path).convert('L')  # Grayscale
        # O'lchamni kamaytirish
        ratio = max_width / img.width
        new_h = int(img.height * ratio)
        img = img.resize((max_width, new_h), Image.LANCZOS)
        # 1-bit (oq/qora)
        img = img.point(lambda x: 0 if x < 200 else 255, '1')
        img = img.convert('1')

        w, h = img.size
        # ESC/POS: GS v 0 command (raster image)
        bytes_per_row = (w + 7) // 8
        xL = bytes_per_row & 0xFF
        xH = (bytes_per_row >> 8) & 0xFF
        yL = h & 0xFF
        yH = (h >> 8) & 0xFF

        data = bytearray()
        data += b'\x1d\x76\x30\x00'  # GS v 0, normal size
        data += bytes([xL, xH, yL, yH])

        pixels = img.load()
        for y in range(h):
            for bx in range(bytes_per_row):
                byte = 0
                for bit in range(8):
                    px = bx * 8 + bit
                    if px < w:
                        # PIL '1' mode: 0=black, 255=white
                        if pixels[px, y] == 0:
                            byte |= (0x80 >> bit)
                data.append(byte)

        return bytes(data)
    except Exception as e:
        log_message(f"Logo ESC/POS xatosi: {e}")
        return None


def e(text):
    return text.encode('utf-8', errors='replace')

def L(text='', bold=False, center=False, big=False, invert=False):
    """Bir qator ESC/POS"""
    cmd = bytearray()
    cmd += b'\x1b\x61\x01' if center else b'\x1b\x61\x00'
    if bold:   cmd += b'\x1b\x45\x01'
    if big:    cmd += b'\x1d\x21\x11'
    if invert: cmd += b'\x1d\x42\x01'
    cmd += e(text) + b'\n'
    if invert: cmd += b'\x1d\x42\x00'
    if big:    cmd += b'\x1d\x21\x00'
    if bold:   cmd += b'\x1b\x45\x00'
    return bytes(cmd)

def row2(left, right, width=42):
    left_s  = str(left)
    right_s = str(right)
    spaces  = max(1, width - len(left_s) - len(right_s))
    return e(left_s + ' ' * spaces + right_s) + b'\n'

def section_header(text):
    """Qora fon, oq matn (invert)"""
    padded = f' {text} '
    return (b'\x1d\x42\x01' + b'\x1b\x45\x01' +
            e(padded) + b'\n' +
            b'\x1b\x45\x00' + b'\x1d\x42\x00')

def divider(char='-', count=42):
    return e(char * count) + b'\n'

def get_worker_name(worker_id):
    """Worker nomini Supabaseden oladi"""
    if not worker_id:
        return None
    try:
        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
        }
        res = requests.get(
            f"{SUPABASE_URL}/rest/v1/workers?id=eq.{worker_id}&select=ism",
            headers=headers, timeout=5
        )
        if res.status_code == 200:
            data = res.json()
            if data:
                return data[0].get('ism', '')
    except:
        pass
    return None


def print_receipt(order):
    """Buyurtmani ESC/POS orqali chop etadi"""
    try:
        now = datetime.now().strftime("%d.%m.%Y %H:%M")

        # Xodim nomini aniqlaymiz
        services = order.get('services', [])
        if isinstance(services, str):
            services = json.loads(services)
        zaps = order.get('zaps', [])
        if isinstance(zaps, str):
            zaps = json.loads(zaps)

        worker_name = None
        if services:
            wid = services[0].get('workerId')
            if wid:
                worker_name = get_worker_name(wid)

        data = bytearray()
        data += b'\x1b\x40'      # Reset
        data += b'\x1b\x74\x12'  # UTF-8

        # ── LOGO ──
        logo_data = get_logo_escpos(max_width=400)
        if logo_data:
            data += b'\x1b\x61\x01'
            data += logo_data
            data += b'\n'
        else:
            data += L("ASIA AUTO SERVICE", bold=True, center=True, big=True)
            data += L("SERVICE", center=True)

        data += L("Sifatli xizmat -- xavfsiz yo'l garovi!", center=True)
        data += divider('- ', 21)

        # ── MA'LUMOTLAR ──
        data += row2("Buyurtma :", f"#{order['id']}")
        data += row2("Sana      :", now)
        data += row2("Mijoz     :", str(order.get('ism', ''))[:20])
        data += row2("Mashina   :", str(order.get('mashina', ''))[:20])
        if order.get('raqam'):
            data += row2("Raqam     :", order.get('raqam', ''))
        if worker_name:
            data += row2("Xodim     :", str(worker_name)[:20])
        data += b'\n'

        # ── XIZMATLAR ──
        if services:
            data += section_header("KO'RSATILGAN XIZMATLAR:")
            for s in services:
                nom  = str(s.get('nom', 'Xizmat'))
                narx = f"{int(s.get('narx', 0)):,}".replace(',', ' ')
                # Emoji ajratib olinadi (printer ko'tarolmasligi mumkin)
                nom_clean = ''.join(c for c in nom if ord(c) < 0x4000)[:28]
                data += row2(f"  {nom_clean}", narx)

        # ── ZAPCHASTLAR ──
        if zaps:
            data += section_header("EHTIYOT QISMLAR:")
            for z in zaps:
                nom  = str(z.get('nom', 'Zapchast'))[:26]
                narx = f"{int(z.get('narx', 0)) * int(z.get('qty', 1)):,}".replace(',', ' ')
                data += row2(f"  {nom}", narx)

        # ── JAMI ──
        data += b'\n'
        jami = f"{int(order.get('final', 0)):,} UZS".replace(',', ' ')
        data += L("JAMI SUMMA:", bold=True, center=True)
        data += L(jami, bold=True, center=True, big=True)
        data += b'\n'

        # ── FOOTER ──
        data += divider('- ', 21)
        data += L("TASHRIFINGIZ UCHUN RAHMAT!", bold=True, center=True)
        data += L("+998 90 570 88 88", center=True)
        data += L("Qo'qon sh., Ubay Oripov 10", center=True)
        data += L("Dushanba-Shanba | 9:00 dan 20:00 gacha", center=True)
        data += L("Karta: 5614 6821 1966 0704", center=True)
        data += L("Instagram & Telegram:", center=True)
        data += L("@asia_auto_service", center=True)
        data += b'\n\n\n\n'
        data += b'\x1d\x56\x01'  # Partial cut

        # ── PRINTERGA YUBORISH ──
        hprinter = win32print.OpenPrinter(PRINTER_NAME)
        try:
            hjob = win32print.StartDocPrinter(hprinter, 1, (f"Chek #{order['id']}", None, "RAW"))
            win32print.StartPagePrinter(hprinter)
            win32print.WritePrinter(hprinter, bytes(data))
            win32print.EndPagePrinter(hprinter)
            win32print.EndDocPrinter(hprinter)
        finally:
            win32print.ClosePrinter(hprinter)

        log_message(f"Chek chiqarildi! ID: {order['id']}")
        return True
    except Exception as e:
        log_message(f"Chop etishda xato (ID: {order.get('id')}): {e}")
        return False

def get_orders_to_print():
    """Chop etilishi kerak bo'lgan buyurtmalarni oladi"""
    # 1. 'pending' statusdagilar
    # 2. print_status kiritilmagan yangi buyurtmalar (id > LAST_ORDER_ID)
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }
    
    # Avval pendinglarni olamiz
    url_pending = f"{SUPABASE_URL}/rest/v1/orders?print_status=eq.pending&order=id.asc"
    
    try:
        res_pending = requests.get(url_pending, headers=headers, timeout=10)
        pending_list = res_pending.json() if res_pending.status_code == 200 else []
        
        # Keyin yangi ID larni tekshiramiz
        global LAST_ORDER_ID
        url_new = f"{SUPABASE_URL}/rest/v1/orders?id=gt.{LAST_ORDER_ID}&order=id.asc"
        res_new = requests.get(url_new, headers=headers, timeout=10)
        new_list = res_new.json() if res_new.status_code == 200 else []
        
        # Ikkalasini birlashtiramiz (takrorlanmasligi uchun set/dict ishlatish mumkin)
        all_to_print = {o['id']: o for o in (pending_list + new_list)}.values()
        return sorted(all_to_print, key=lambda x: x['id'])
    except Exception as e:
        if "Connection aborted" in str(e) or "ConnectionResetError" in str(e):
             log_message(f"Baza bilan ulanish uzildi (qaytadan ulanmoqda...)")
        else:
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
        requests.patch(url, headers=headers, json={"print_status": "printed"}, timeout=10)
    except Exception as e:
        log_message(f"Statusni yangilashda xato: {e}")

def main():
    global LAST_ORDER_ID
    log_message("Professional Print Agent ishga tushdi...")
    log_message(f"Printer: {PRINTER_NAME}")
    
    # Boshlang'ich oxirgi ID - oxirgi PRINTERD orderni topamiz
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
                # Agar birorta ham printed bo'lmasa, oxirgi ID dan boshlaymiz (eskilarini chiqarmaslik uchun)
                url_last = f"{SUPABASE_URL}/rest/v1/orders?select=id&order=id.desc&limit=1"
                res_last = requests.get(url_last, headers=headers, timeout=10).json()
                if res_last: LAST_ORDER_ID = res_last[0]['id']
                log_message(f"Printed topilmadi. Oxirgi ID: {LAST_ORDER_ID}")
    except Exception as e:
        log_message(f"Boshlang'ich ID ni olishda xato: {e}")

    counter = 0
    while True:
        try:
            to_print = get_orders_to_print()
            for order in to_print:
                # Agar status 'printed' bo'lsa o'tkazib yuboramiz (get_orders_to_print'da filter bor, lekin ehtiyot shart)
                if order.get('print_status') == 'printed':
                    continue
                    
                log_message(f"Chop etilmoqda... ID: {order['id']}")
                if print_receipt(order):
                    mark_as_printed(order['id'])
                    if order['id'] > LAST_ORDER_ID:
                        LAST_ORDER_ID = order['id']
            
            counter += 1
            if counter >= 12: # Har 1 daqiqada "alive" xabari
                log_message(f"Agent ishlayapti... {datetime.now().strftime('%H:%M:%S')}")
                counter = 0

            time.sleep(CHECK_INTERVAL)
        except Exception as e:
            log_message(f"Loop xatosi: {e}")
            time.sleep(CHECK_INTERVAL)

if __name__ == "__main__":
    main()
