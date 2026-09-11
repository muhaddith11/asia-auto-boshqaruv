"""
Bu fayl ESKIRGAN nusxa edi va shu sabab bir muammo yaratdi: 2026-09-10 kuni
kimdir shu faylni (yoki shu papkadagi run_printer.vbs'ni) ishga tushirib
qo'yganda, u SUPABASE_SERVICE_ROLE_KEY'ni bilmagani uchun (faqat ochiq
"publishable" kalitdan foydalanadi) RLS orqali print_status='pending'
buyurtmalarni butunlay ko'rmay qoldi — va chek soatlab chiqmay turdi.

Endi ikkita nusxa yuritilmasin deb, bu fayl to'g'ridan-to'g'ri asosiy
(root) print_agent.py'ni ishga tushiradi. Haqiqiy kod endi faqat bitta
joyda: ../print_agent.py
"""
import os
import runpy

ROOT_SCRIPT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "print_agent.py")

if __name__ == "__main__":
    runpy.run_path(ROOT_SCRIPT, run_name="__main__")
