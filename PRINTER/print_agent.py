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


def print_receipt(order):
    """Buyurtmani boyitilgan ko'rinishda chop etadi"""
    dc = None
    try:
        now = datetime.now().strftime("%d.%m.%Y %H:%M")
        
        # Printer uchun Device Context (DC) yaratish
        dc = win32ui.CreateDC()
        dc.CreatePrinterDC(PRINTER_NAME)
        
        # Chop etishni boshlash
        dc.StartDoc(f"Buyurtma #{order['id']}")
        dc.StartPage()
        
        # Fontlar
        font_header = win32ui.CreateFont({"name": "Arial", "height": 42, "weight": 900})
        font_slogan = win32ui.CreateFont({"name": "Arial", "height": 24, "weight": 400, "italic": 1})
        font_normal = win32ui.CreateFont({"name": "Courier New", "height": 28, "weight": 400})
        font_bold = win32ui.CreateFont({"name": "Arial", "height": 30, "weight": 700})
        
        y = 10

        # ── LOGO ── (ESC/POS orqali to'g'ridan printerga yuboriladi)
        logo_data = get_logo_escpos(max_width=400)
        if logo_data:
            try:
                hprinter = win32print.OpenPrinter(PRINTER_NAME)
                try:
                    hjob = win32print.StartDocPrinter(hprinter, 1, ("Logo", None, "RAW"))
                    win32print.StartPagePrinter(hprinter)
                    # Markazga o'rnatish
                    win32print.WritePrinter(hprinter, b'\x1b\x61\x01')  # ESC a 1 = center
                    win32print.WritePrinter(hprinter, logo_data)
                    win32print.WritePrinter(hprinter, b'\n\n')
                    win32print.WritePrinter(hprinter, b'\x1b\x61\x00')  # ESC a 0 = left
                    win32print.EndPagePrinter(hprinter)
                    win32print.EndDocPrinter(hprinter)
                finally:
                    win32print.ClosePrinter(hprinter)
                y += 80  # Logo uchun joy
            except Exception as e:
                log_message(f"Logo chop etishda xato: {e}")
                # Logo chiqmasa matn bilan davom etamiz
                dc.SelectObject(font_header)
                dc.TextOut(40, y, "ASIA AUTO SERVICE")
                y += 50
        else:
            dc.SelectObject(font_header)
            dc.TextOut(40, y, "ASIA AUTO SERVICE")
            y += 50

        dc.SelectObject(font_slogan)
        dc.TextOut(20, y, "Sifatli xizmat — xavfsiz yo'l garovi!")
        y += 40
        
        dc.SelectObject(font_normal)
        dc.TextOut(0, y, "--------------------------------")
        y += 30
        
        # Buyurtma ma'lumotlari
        dc.TextOut(0, y, f"BUYURTMA: #{order['id']}")
        y += 35
        dc.TextOut(0, y, f"SANA: {now}")
        y += 35
        dc.TextOut(0, y, f"MIJOZ: {str(order.get('ism', ''))[:20]}")
        y += 35
        dc.TextOut(0, y, f"MASHINA: {str(order.get('mashina', ''))[:20]}")
        y += 35
        dc.TextOut(0, y, f"RAQAM: {order.get('raqam', '')}")
        y += 40
        dc.TextOut(0, y, "--------------------------------")
        y += 35
        
        # Xizmatlar
        dc.SelectObject(font_bold)
        dc.TextOut(0, y, "KO'RSATILGAN XIZMATLAR:")
        y += 40
        dc.SelectObject(font_normal)
        
        services = order.get('services', [])
        if isinstance(services, str): services = json.loads(services)
        for s in (services or []):
            nom = s.get('nom', 'Xizmat')[:22]
            narx = f"{int(s.get('narx', 0)):,}".replace(',', ' ')
            dc.TextOut(10, y, f"{nom}")
            dc.TextOut(350, y, f"{narx}")
            y += 35
            
        zaps = order.get('zaps', [])
        if isinstance(zaps, str): zaps = json.loads(zaps)
        if zaps:
            y += 10
            dc.SelectObject(font_bold)
            dc.TextOut(0, y, "EHTIYOT QISMLAR:")
            y += 40
            dc.SelectObject(font_normal)
            for z in zaps:
                nom = z.get('nom', 'Zapchast')[:22]
                narx = f"{int(z.get('narx', 0)) * int(z.get('qty', 1)):,}".replace(',', ' ')
                dc.TextOut(10, y, f"{nom}")
                dc.TextOut(350, y, f"{narx}")
                y += 35
        
        y += 20
        dc.TextOut(0, y, "--------------------------------")
        y += 40
        
        # Jami
        dc.SelectObject(font_header)
        dc.TextOut(0, y, f"JAMI: {int(order.get('final', 0)):,} UZS".replace(',', ' '))
        y += 85
        
        # Footer
        dc.SelectObject(font_bold)
        dc.TextOut(60, y, "XARID UCHUN RAHMAT!")
        y += 45
        dc.SelectObject(font_normal)
        dc.TextOut(0, y, "Tel: +998 90 570 88 88")
        y += 35
        dc.TextOut(0, y, "Qo'qon shahar Ubay Oripov 12")
        
        y += 250 # Qog'oz surilishi
        
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
