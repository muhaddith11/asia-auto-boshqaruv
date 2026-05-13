import time
import requests
import subprocess
import os
import sys
from datetime import datetime

# --- SOZLAMALAR ---
PRINTER_NAME  = "XP-80"
SUPABASE_URL  = "https://fwktbleovtkxxpsccqqr.supabase.co"
SUPABASE_KEY  = "sb_publishable_JUnUk2NcYb8fanWmD5TLJw_Gpmd4aoL"
RECEIPT_BASE  = "https://asia-auto-boshqaruv.vercel.app/api/receipt"  # Vercel URL

CHECK_INTERVAL = 5
LAST_ORDER_ID  = 0

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LOG_FILE = os.path.join(BASE_DIR, "print_agent_log.txt")

# Chrome yoki Edge yo'lini topish
CHROME_PATHS = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
]

def find_browser():
    for path in CHROME_PATHS:
        if os.path.exists(path):
            return path
    return None

BROWSER = find_browser()

def log_message(message):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    full_message = f"[{timestamp}] {message}"
    print(full_message)
    try:
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(full_message + "\n")
    except:
        pass

def print_receipt_chrome(order_id):
    """Chrome headless orqali chekni printerga yuborish"""
    if not BROWSER:
        log_message("XATO: Chrome yoki Edge topilmadi!")
        return False

    url = f"{RECEIPT_BASE}/{order_id}"
    cmd = [
        BROWSER,
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--disable-extensions",
        "--disable-dev-shm-usage",
        f"--print-to-pdf-no-header",
        f"--kiosk-printing",
        f"--printer={PRINTER_NAME}",
        "--print-to-pdf=/dev/null",  # headless print trigger
        url
    ]

    # Yangi Chrome headless print usuli
    cmd2 = [
        BROWSER,
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--run-all-compositor-stages-before-draw",
        "--disable-extensions",
        f"--print-to-printer={PRINTER_NAME}",
        url
    ]

    try:
        # PDF ga chiqarish usuli (barqarorroq)
        pdf_path = os.path.join(BASE_DIR, f"temp_receipt_{order_id}.pdf")
        pdf_cmd = [
            BROWSER,
            "--headless=new",
            "--disable-gpu",
            "--no-sandbox",
            "--disable-extensions",
            "--print-to-pdf=" + pdf_path,
            "--print-to-pdf-no-header",
            "--no-pdf-header-footer",
            url
        ]
        result = subprocess.run(pdf_cmd, timeout=30, capture_output=True)

        if os.path.exists(pdf_path):
            # PDF ni printer ga yuborish
            print_pdf(pdf_path)
            os.remove(pdf_path)
            log_message(f"Chek chiqarildi! ID: {order_id}")
            return True
        else:
            log_message(f"PDF yaratilmadi. Chrome output: {result.stderr.decode(errors='ignore')[:200]}")
            return False

    except subprocess.TimeoutExpired:
        log_message(f"Chrome timeout (ID: {order_id})")
        return False
    except Exception as e:
        log_message(f"Chrome xatosi (ID: {order_id}): {e}")
        return False

def print_pdf(pdf_path):
    """PDF ni standart printer orqali chiqarish"""
    try:
        # Windows built-in PDF print
        import win32api
        win32api.ShellExecute(0, "print", pdf_path, f'/d:"{PRINTER_NAME}"', ".", 0)
        time.sleep(3)  # Printerga yuborilishini kutish
    except ImportError:
        # win32api yo'q bo'lsa — Acrobat yoki Edge orqali
        try:
            subprocess.run([
                "powershell", "-Command",
                f'Start-Process -FilePath "{pdf_path}" -Verb Print -Wait'
            ], timeout=15)
        except Exception as e:
            log_message(f"PDF print xatosi: {e}")

def get_orders_to_print():
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }
    url_pending = f"{SUPABASE_URL}/rest/v1/orders?print_status=eq.pending&order=id.asc"
    try:
        res = requests.get(url_pending, headers=headers, timeout=10)
        return res.json() if res.status_code == 200 else []
    except Exception as e:
        log_message(f"Baza bilan ulanishda xato: {e}")
        return []

def mark_as_printed(order_id):
    url = f"{SUPABASE_URL}/rest/v1/orders?id=eq.{order_id}"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }
    try:
        r = requests.patch(url, headers=headers, json={"print_status": "printed"}, timeout=10)
        if r.status_code not in (200, 204):
            log_message(f"Status yangilashda xatolik: {r.status_code}")
    except Exception as e:
        log_message(f"Status yangilashda xato: {e}")

def main():
    global LAST_ORDER_ID
    log_message("=" * 50)
    log_message("Chrome Print Agent ishga tushdi")
    log_message(f"Printer : {PRINTER_NAME}")
    log_message(f"Browser : {BROWSER or 'TOPILMADI!'}")
    log_message(f"URL base: {RECEIPT_BASE}")
    log_message("=" * 50)

    if not BROWSER:
        log_message("XATO: Chrome/Edge o'rnatilmagan. Agent to'xtadi.")
        return

    counter = 0
    while True:
        try:
            to_print = get_orders_to_print()
            for order in to_print:
                if order.get('print_status') == 'printed':
                    continue
                log_message(f"Chop etilmoqda... ID: {order['id']}")
                if print_receipt_chrome(order['id']):
                    mark_as_printed(order['id'])

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
