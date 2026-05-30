import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

// Logo to'g'ridan kod ichiga joylashtirilgan (standalone build uchun fs ishlamaydi)
const LOGO_B64 = 'data:image/png;base64,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';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const logoBase64 = LOGO_B64;

  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error || !order) {
    return new NextResponse('Buyurtma topilmadi', { status: 404 });
  }

  const services = Array.isArray(order.services) ? order.services : [];
  const zaps     = Array.isArray(order.zaps)     ? order.zaps     : [];
  const final    = Number(order.final || 0);
  const paid     = Number(order.paid  || 0);
  const zap      = Number(order.zap   || 0);
  const debt     = final - paid;

  const now = new Date().toLocaleString('uz-UZ', {
    timeZone: 'Asia/Tashkent',
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  const srvRows = services.map((s: any) => `
    <div class="item">
      <span class="item-name">${s.nom || s.name || ''}</span>
      <span class="item-price">${Number(s.narx || s.price || 0).toLocaleString('ru-RU')}</span>
    </div>`).join('');

  const zapRows = zaps.map((p: any) => {
    const qty   = Number(p.qty || p.quantity || 1);
    const price = Number(p.narx || p.price || 0);
    return `
    <div class="item">
      <span class="item-name">${p.nom || p.name || ''}</span>
      <span class="item-price">${(price * qty).toLocaleString('ru-RU')}</span>
    </div>`;
  }).join('');

  const subtotalBlock = paid > 0 ? `
    <div class="subtotals">
      ${zap > 0 ? `
      <div class="sub-row"><span>Xizmatlar</span><span>${(final - zap).toLocaleString('ru-RU')} UZS</span></div>
      <div class="sub-row"><span>Zapchastlar</span><span>${zap.toLocaleString('ru-RU')} UZS</span></div>` : ''}
      <div class="sub-row green"><span>To'langan</span><span>${paid.toLocaleString('ru-RU')} UZS</span></div>
      ${debt > 0 ? `<div class="sub-row red"><span>Qolgan qarz</span><span>${debt.toLocaleString('ru-RU')} UZS</span></div>` : ''}
    </div>` : '';

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Chek #${order.id}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&family=JetBrains+Mono:wght@400;600;700&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Inter', Arial, sans-serif;
      background: #fff;
      width: 80mm;
      color: #111;
      font-size: 12px;
    }

    /* ── LOGO ── */
    .r-header {
      text-align: center;
      padding: 14px 10px 10px;
      border-bottom: 1px solid #e5e7eb;
    }
    .logo-line {
      font-family: 'Inter', 'Arial Black', Arial, sans-serif;
      font-weight: 900;
      font-size: 26px;
      letter-spacing: 0.04em;
      line-height: 1;
    }
    .logo-red { color: #e11d2a; }
    .logo-service {
      font-family: 'Inter', 'Arial Black', Arial, sans-serif;
      font-weight: 900;
      font-size: 12px;
      letter-spacing: 0.28em;
      border-top: 2px solid #111;
      border-bottom: 2px solid #111;
      padding: 1px 0;
      margin-top: 3px;
    }
    .tagline {
      font-size: 8px;
      font-style: italic;
      color: #888;
      letter-spacing: 0.06em;
      margin-top: 5px;
      text-transform: uppercase;
    }

    /* ── META ── */
    .r-meta {
      padding: 8px 10px;
      border-bottom: 1px solid #e5e7eb;
    }
    .meta-row {
      display: flex;
      justify-content: space-between;
      padding: 2px 0;
      font-family: 'JetBrains Mono', 'Courier New', monospace;
      font-size: 10px;
    }
    .meta-label { color: #888; }
    .meta-val   { font-weight: 600; color: #111; text-align: right; }

    /* ── SECTIONS ── */
    .sec-h {
      background: #111;
      color: #fff;
      font-weight: 900;
      font-size: 11px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 5px 10px;
    }
    .items { padding: 4px 0; border-bottom: 1px solid #e5e7eb; }
    .item  { display: flex; justify-content: space-between; align-items: flex-start; padding: 5px 10px; gap: 6px; }
    .item-name  { font-size: 11px; font-weight: 600; }
    .item-sub   { font-size: 9px; color: #d97706; margin-top: 1px; }
    .item-price {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px; font-weight: 700;
      white-space: nowrap;
    }

    /* ── SUBTOTALS ── */
    .subtotals { padding: 5px 10px; border-bottom: 1px solid #e5e7eb; }
    .sub-row {
      display: flex; justify-content: space-between;
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px; padding: 1px 0; color: #666;
    }
    .sub-row.green { color: #16a34a; font-weight: 700; }
    .sub-row.red   { color: #dc2626; font-weight: 700; }

    /* ── JAMI ── */
    .r-total {
      background: #111; color: #fff;
      display: flex; justify-content: space-between; align-items: center;
      padding: 11px 10px;
    }
    .total-label {
      font-weight: 900; font-size: 14px;
      letter-spacing: 0.06em; color: #aaa;
    }
    .total-amount {
      font-weight: 900; font-size: 22px; letter-spacing: 0.01em;
    }
    .total-uzs { font-size: 11px; color: #aaa; margin-left: 3px; font-weight: 400; }

    /* ── FOOTER ── */
    .r-footer {
      text-align: center;
      border-top: 1.5px dashed #ccc;
      padding: 10px 10px 12px;
    }
    .footer-thanks {
      font-weight: 900; font-size: 13px;
      letter-spacing: 0.04em; margin-bottom: 6px;
    }
    .footer-contacts {
      font-family: 'JetBrains Mono', monospace;
      font-size: 9px; color: #d97706; line-height: 1.8;
    }
    .footer-handle {
      display: inline-block;
      border: 1px solid #ccc; border-radius: 3px;
      padding: 2px 8px; margin-top: 6px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 9px; color: #555;
    }

    @media print {
      @page { size: 80mm auto; margin: 0; }
      html, body { width: 80mm; }
    }
  </style>
</head>
<body>

  <!-- LOGO -->
  <div class="r-header">
    ${logoBase64
      ? `<img style="max-width:180px;height:auto;display:block;margin:0 auto 2px;" src="${logoBase64}" alt="Asia Auto Service" />`
      : `<div class="logo-line">ASIA <span class="logo-red">AUTO</span></div><div class="logo-service">SERVICE</div>`
    }
    <div class="tagline">Sifatli xizmat — xavfsiz yo'l garovi!</div>
  </div>

  <!-- META -->
  <div class="r-meta">
    <div class="meta-row"><span class="meta-label">BUYURTMA</span><span class="meta-val">#${order.id}</span></div>
    <div class="meta-row"><span class="meta-label">SANA</span><span class="meta-val">${now}</span></div>
    <div class="meta-row"><span class="meta-label">MIJOZ</span><span class="meta-val">${order.ism || ''}</span></div>
    ${order.raqam ? `<div class="meta-row"><span class="meta-label">RAQAM</span><span class="meta-val">${String(order.raqam).toUpperCase()}</span></div>` : ''}
    <div class="meta-row"><span class="meta-label">MASHINA</span><span class="meta-val">${order.mashina || ''}</span></div>
  </div>

  <!-- XIZMATLAR -->
  ${services.length > 0 ? `
  <div class="sec-h">Ko'rsatilgan xizmatlar</div>
  <div class="items">${srvRows}</div>` : ''}

  <!-- ZAPCHASTLAR -->
  ${zaps.length > 0 ? `
  <div class="sec-h">Ehtiyot qismlar</div>
  <div class="items">${zapRows}</div>` : ''}

  <!-- SUBTOTALS -->
  ${subtotalBlock}

  <!-- JAMI -->
  <div class="r-total">
    <span class="total-label">JAMI</span>
    <div>
      <span class="total-amount">${final.toLocaleString('ru-RU')}</span>
      <span class="total-uzs">uzs</span>
    </div>
  </div>

  <!-- FOOTER -->
  <div class="r-footer">
    <div class="footer-thanks">TASHRIFINGIZ UCHUN RAHMAT!</div>
    <div class="footer-contacts">
      +998 90 570 88 88<br>
      Qo'qon sh., Ubay Oripov 10<br>
      Dushanba-Shanba | 9:00 dan 20:00 gacha<br>
      Karta: 5614 6821 1966 0704
    </div>
    <div class="footer-handle">Instagram &amp; Telegram:<br>@asia_auto_service</div>
  </div>

  <script>window.onload = function(){ window.print(); }</script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
