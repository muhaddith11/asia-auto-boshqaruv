import time
import requests
import subprocess
import os
import glob
from datetime import datetime

# --- SOZLAMALAR ---
PRINTER_NAME  = "XP-80"
SUPABASE_URL  = "https://fwktbleovtkxxpsccqqr.supabase.co"
SUPABASE_KEY  = "sb_publishable_JUnUk2NcYb8fanWmD5TLJw_Gpmd4aoL"
RECEIPT_BASE  = "https://asia-auto-boshqaruv.vercel.app/api/receipt"

CHECK_INTERVAL = 5

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LOG_FILE = os.path.join(BASE_DIR, "print_agent_log.txt")

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

def cleanup_old_pdfs():
    """Eski temp PDF fayllarini o'chirish"""
    for f in glob.glob(os.path.join(BASE_DIR, "tmp_chek_*.pdf")):
        try:
            os.remove(f)
        except:
            pass

def print_receipt(order_id):
    """Chrome/Edge headless orqali HTML ni to'g'ridan-to'g'ri printerga yuborish"""
    if not BROWSER:
        log_message("XATO: Chrome yoki Edge topilmadi!")
        return False

    url = f"{RECEIPT_BASE}/{order_id}"

    try:
        # HTML → to'g'ridan-to'g'ri printer (PDF orqali emas)
        cmd = [
            BROWSER,
            "--headless=new",
            "--disable-gpu",
            "--no-sandbox",
            "--disable-extensions",
            "--disable-dev-shm-usage",
            "--run-all-compositor-stages-before-draw",
            f"--print-to-printer={PRINTER_NAME}",
            "--no-pdf-header-footer",
            url
        ]
        result = subprocess.run(cmd, timeout=30, capture_output=True)
        stderr = result.stderr.decode(errors='ignore')

        # Muvaffaqiyat tekshiruvi
        if result.returncode == 0 or "Printing" in stderr or "printed" in stderr.lower():
            log_message(f"Chek chiqarildi! ID: {order_id}")
            return True

        # Agar to'g'ridan-to'g'ri ishlamasa — PDF orqali urinish
        log_message(f"To'g'ridan-to'g'ri print ishlamadi, PDF orqali urinilmoqda...")
        return print_via_pdf(order_id, url)

    except subprocess.TimeoutExpired:
        log_message(f"Chrome timeout (ID:{order_id}), PDF orqali urinilmoqda...")
        return print_via_pdf(order_id, url)
    except Exception as e:
        log_message(f"Print xatosi (ID:{order_id}): {e}")
        return False


def print_via_pdf(order_id, url):
    """Fallback: PDF yaratib PowerShell orqali printerga yuborish"""
    pdf_path = os.path.join(BASE_DIR, f"tmp_chek_{order_id}_{int(time.time())}.pdf")
    try:
        # 1. Chrome → PDF
        pdf_cmd = [
            BROWSER,
            "--headless=new",
            "--disable-gpu",
            "--no-sandbox",
            "--disable-extensions",
            "--no-pdf-header-footer",
            "--print-to-pdf-no-header",
            f"--print-to-pdf={pdf_path}",
            url
        ]
        subprocess.run(pdf_cmd, timeout=30, capture_output=True)

        if not os.path.exists(pdf_path):
            log_message(f"PDF ham yaratilmadi (ID:{order_id})")
            return False

        log_message(f"PDF tayyor, PowerShell orqali chiqarilmoqda...")

        # 2. PowerShell orqali printer ga yuborish
        ps_cmd = (
            f'$pdf = "{pdf_path}"; '
            f'$p = New-Object -ComObject WScript.Shell; '
            f'Start-Process -FilePath $pdf -ArgumentList \'/pt\',\'"{PRINTER_NAME}"\' -Wait'
        )
        subprocess.run(
            ["powershell", "-Command", ps_cmd],
            timeout=20, capture_output=True
        )

        time.sleep(5)
        log_message(f"Chek chiqarildi (PDF)! ID: {order_id}")
        return True

    except Exception as e:
        log_message(f"PDF print xatosi (ID:{order_id}): {e}")
        return False
    finally:
        time.sleep(4)
        try:
            if os.path.exists(pdf_path):
                os.remove(pdf_path)
        except:
            pass

def get_orders_to_print():
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
    }
    url = f"{SUPABASE_URL}/rest/v1/orders?print_status=eq.pending&order=id.asc"
    try:
        res = requests.get(url, headers=headers, timeout=10)
        return res.json() if res.status_code == 200 else []
    except Exception as e:
        log_message(f"Baza xatosi: {e}")
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
            log_message(f"Status xatosi: {r.status_code}")
    except Exception as e:
        log_message(f"Status yangilash xatosi: {e}")

def main():
    log_message("=" * 50)
    log_message("Print Agent ishga tushdi")
    log_message(f"Printer : {PRINTER_NAME}")
    log_message(f"Browser : {BROWSER or 'TOPILMADI!'}")
    log_message("=" * 50)

    if not BROWSER:
        log_message("XATO: Chrome/Edge o'rnatilmagan!")
        return

    # Eski temp fayllarni tozalash
    cleanup_old_pdfs()
    log_message("Eski temp fayllar tozalandi")

    # Hozircha pending bo'lib qolgan buyurtmani ham printed deb belgilash
    # (agar agent uzoq vaqt o'chiq bo'lsa)
    headers = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"}
    try:
        res = requests.get(
            f"{SUPABASE_URL}/rest/v1/orders?print_status=eq.pending&order=id.asc",
            headers=headers, timeout=10
        )
        pending = res.json() if res.status_code == 200 else []
        log_message(f"Kutayotgan buyurtmalar: {len(pending)} ta")
    except:
        pass

    counter = 0
    while True:
        try:
            # Har 60 tsiklda eski temp fayllarni tozala
            if counter % 60 == 0:
                cleanup_old_pdfs()

            to_print = get_orders_to_print()
            for order in to_print:
                if order.get('print_status') == 'printed':
                    continue
                log_message(f"Chop etilmoqda... ID: {order['id']}")
                if print_receipt(order['id']):
                    mark_as_printed(order['id'])

            counter += 1
            if counter % 12 == 0:
                log_message(f"Agent ishlayapti... {datetime.now().strftime('%H:%M:%S')}")

            time.sleep(CHECK_INTERVAL)

        except Exception as e:
            log_message(f"Loop xatosi: {e}")
            time.sleep(CHECK_INTERVAL)

if __name__ == "__main__":
    main()
