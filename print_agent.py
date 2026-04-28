import time
import requests
import json
import win32print
import win32ui
from datetime import datetime

# --- SOZLAMALAR ---
PRINTER_NAME = "XP-80" # Windowsdagi printer nomi

SUPABASE_URL = "https://fwktbleovtkxxpsccqqr.supabase.co"
SUPABASE_KEY = "sb_publishable_JUnUk2NcYb8fanWmD5TLJw_Gpmd4aoL"

CHECK_INTERVAL = 5 # Har 5 soniyada tekshiradi
LAST_ORDER_ID = None

def get_latest_order():
    """Supabase'dan eng oxirgi buyurtmani oladi"""
    url = f"{SUPABASE_URL}/rest/v1/orders?select=*&order=id.desc&limit=1"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}"
    }
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            data = response.json()
            return data[0] if data else None
    except Exception as e:
        print(f"Baza bilan ulanishda xato: {e}")
    return None

def print_receipt(order):
    """Buyurtmani boyitilgan ko'rinishda chop etadi"""
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
        
        # Sarlavha va Slogan
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
        dc.TextOut(0, y, f"MIJOZ: {order['ism'][:20]}")
        y += 35
        dc.TextOut(0, y, f"MASHINA: {order['mashina'][:20]}")
        y += 35
        dc.TextOut(0, y, f"RAQAM: {order['raqam']}")
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
        for s in services:
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
        dc.DeleteDC()
        
        # Kesish
        try:
            hprinter = win32print.OpenPrinter(PRINTER_NAME)
            hjob = win32print.StartDocPrinter(hprinter, 1, ("Cut", None, "RAW"))
            win32print.StartPagePrinter(hprinter)
            win32print.WritePrinter(hprinter, b"\n\n\n\n\x1d\x56\x01")
            win32print.EndPagePrinter(hprinter)
            win32print.EndDocPrinter(hprinter)
            win32print.ClosePrinter(hprinter)
        except: pass

        print(f"Boyitilgan chek chiqarildi! ID: {order['id']}")
        return True
    except Exception as e:
        print(f"Chop etishda xato (ID: {order.get('id')}): {e}")
        return False

def get_pending_prints():
    """Chop etilishi kerak bo'lgan (yangi yoki qo'lda bosilgan) buyurtmalarni oladi"""
    # print("Pending buyurtmalarni tekshirmoqdaman...")
    url = f"{SUPABASE_URL}/rest/v1/orders?print_status=eq.pending&order=id.desc"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            data = response.json()
            if data: print(f"Pending buyurtmalar topildi: {len(data)} ta")
            return data
    except Exception as e:
        print(f"Baza bilan ulanishda xato (pending): {e}")
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
        requests.patch(url, headers=headers, json={"print_status": "printed"})
        print(f"Buyurtma #{order_id} 'printed' holatiga o'tkazildi.")
    except Exception as e:
        print(f"Statusni yangilashda xato: {e}")

def main():
    global LAST_ORDER_ID
    print("Professional Print Agent ishga tushdi...")
    print(f"Printer: {PRINTER_NAME}")
    
    # Boshlang'ich oxirgi ID
    url = f"{SUPABASE_URL}/rest/v1/orders?select=id&order=id.desc&limit=1"
    headers = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"}
    try:
        res = requests.get(url, headers=headers).json()
        if res: 
            LAST_ORDER_ID = res[0]['id']
            print(f"Oxirgi buyurtma ID: {LAST_ORDER_ID}")
    except Exception as e:
        print(f"Boshlang'ich ID ni olishda xato: {e}")

    counter = 0
    while True:
        try:
            # 1. Yangi buyurtmalarni tekshirish
            url_new = f"{SUPABASE_URL}/rest/v1/orders?id=gt.{LAST_ORDER_ID or 0}&order=id.asc"
            new_orders = requests.get(url_new, headers=headers).json()
            if isinstance(new_orders, list) and new_orders:
                for order in new_orders:
                    print(f"Yangi buyurtma keldi! ID: {order['id']}")
                    if print_receipt(order):
                        LAST_ORDER_ID = order['id']
                        mark_as_printed(order['id'])
            
            # 2. Qo'lda bosilganlarni (Re-print) tekshirish
            pending = get_pending_prints()
            for order in pending:
                # Agar bu yangi bo'lsa (ID > LAST_ORDER_ID), uni tepada Loop 1 qayta ishlaydi yoki u hali Loop 1 ga kirmagan
                # Agar bu eski bo'lsa (ID <= LAST_ORDER_ID), bu aniq Re-print
                print(f"Saytdan chop etish buyrug'i keldi! ID: {order['id']}")
                if print_receipt(order):
                    mark_as_printed(order['id'])
            
            counter += 1
            if counter >= 12: # Har 1 daqiqada (5s * 12) "alive" xabari
                print(f"Agent ishlayapti... {datetime.now().strftime('%H:%M:%S')}")
                counter = 0

            time.sleep(CHECK_INTERVAL)
        except KeyboardInterrupt:
            print("\nDastur to'xtatildi.")
            break
        except Exception as e:
            print(f"Loop xatosi: {e}")
            time.sleep(CHECK_INTERVAL)


if __name__ == "__main__":
    main()
