// ─────────────────────────────────────────────────────────────────────────────
// Kundalik hisobot — yagona, sof (pure) manba.
//
// Bir kunlik: ustalar ishlab topgani, sherik ulushi va ishxona foydasi.
// Mantiq mavjud "sherik ulushi" hisob-kitobiga (workers/page.tsx) mos —
// farqi: ulush olmaydigan (korxona) xodimlar oyligi o'rniga har kunga
// BELGILANGAN xarajat ayiriladi (shu xodimlar oylik maoshi ÷ 30 kun).
//
// KUN TANLASH — KASSA ASOSIDA (cash basis):
// Buyurtma qaysi kuni YARATILGANiga emas, qaysi kuni PULI KASSAGA TUSHGANiga
// (to'langaniga) qarab hisoblanadi. To'lov paytida yaratiladigan kassa
// operatsiyasi (source 'buyurtma', comment "Buyurtma #<id>") sanasi = to'lov
// kuni. Bir buyurtma bir necha kun bo'lib to'lansa — yakuniy (eng oxirgi) to'lov
// kuni olinadi. To'lov operatsiyasi topilmasa (masalan 100% chegirma yoki eski
// ma'lumot) — buyurtma yaratilgan sanaga (`sana`) qaytiladi.
//
// MUHIM: bu fayl vitest bilan test qilinadi (dailyReport.spec.ts). Formulani
// o'zgartirsangiz testlar buziladi — avval biznes qoidasini tasdiqlang.
// ─────────────────────────────────────────────────────────────────────────────

// Ulush olmaydigan xodimlar oyligining kunlik ulushi (boshliq ko'rsatmasi).
export const KUNLIK_BELGILANGAN_XARAJAT = 600_000;

export interface DailyServiceLike {
  workerId?: number | string;
  narx?: number;
  zarplata?: number;
}

export interface DailyOrderLike {
  id: number | string;
  holat: string;
  sana: string;
  pribil?: number;
  srv?: number;
  zap?: number;
  final?: number;
  total?: number;
  services: DailyServiceLike[];
}

export interface DailyOpLike {
  type: 'income' | 'expense' | 'transfer';
  category?: string;
  amount?: number;
  date?: string;
  createdAt?: string;
  created_at?: string;
  source?: string;
  orderId?: string | number;
  order_id?: string | number;
  comment?: string;
}

export interface DailyWorkerLike {
  id: number | string;
  ism: string;
  mutax?: string;
  foiz?: number;
  role?: 'xodim' | 'sherik' | 'korxona';
  shareType?: 'total' | 'sub';
  parentId?: number;
}

export interface DailyEmployeeRow {
  id: number | string;
  ism: string;
  mutax?: string;
  foiz: number;
  earned: number;
  count: number;
  cars: number;
}

export interface DailySubPartner {
  id: number | string;
  ism: string;
  foiz: number;
  share: number;
}

export interface DailyPartnerRow {
  id: number | string;
  ism: string;
  foiz: number;
  share: number;
  subs: DailySubPartner[];
}

export interface DailyReport {
  ordersCount: number;
  yalpiFoyda: number;
  boshqaKirim: number;
  xarajat: number;
  xarajatCount: number;
  belgilanganXarajat: number;
  sofFoyda: number;
  partnerShares: DailyPartnerRow[];
  sherikUlushiJami: number;
  ishxonaFoyda: number;
  empRows: DailyEmployeeRow[];
  ustalarJami: number;
  xizmatDaromad: number;
}

// Operatsiya kunini (YYYY-MM-DD) aniqlash. `date` to'liq ISO ("...T...") yoki
// "YYYY-MM-DD" bo'lishi mumkin — ikkalasi ham 10 belgigacha kesiladi.
export function opDay(op: DailyOpLike): string {
  const raw = op.date || op.createdAt || op.created_at || '';
  return String(raw).slice(0, 10);
}

// Operatsiya kommentidan buyurtma id sini ajratib olish ("Buyurtma #123 ...").
function orderIdFromComment(comment?: string): number | null {
  if (!comment) return null;
  const m = comment.match(/Buyurtma #(\d+)/);
  return m ? Number(m[1]) : null;
}

// Buyurtma to'lovi operatsiyasi bo'lgan id ni topish (DB'da order_id ustuni yo'q —
// comment orqali bog'lanadi; optimistik holatda orderId ham bo'lishi mumkin).
function paymentOrderId(op: DailyOpLike): number | null {
  const direct = op.order_id ?? op.orderId;
  if (direct != null && direct !== '') return Number(direct);
  return orderIdFromComment(op.comment);
}

// Har bir buyurtma qaysi kuni to'langanini (kassaga tushganini) aniqlaydi.
// Bir necha to'lov bo'lsa — eng oxirgi (yakuniy) to'lov kuni olinadi.
export function buildPaymentDayMap(ishxonaOperatsiyalar: DailyOpLike[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const op of ishxonaOperatsiyalar) {
    if (op.type !== 'income') continue;
    const isOrderPayment = op.source === 'buyurtma' || op.category === "Buyurtma to'lovi";
    if (!isOrderPayment) continue;
    const oid = paymentOrderId(op);
    if (oid == null || Number.isNaN(oid)) continue;
    const day = opDay(op);
    if (!day) continue;
    const key = String(oid);
    const prev = map.get(key);
    if (!prev || day > prev) map.set(key, day);
  }
  return map;
}

export function computeDailyReport(
  buyurtmalar: DailyOrderLike[],
  ishxonaOperatsiyalar: DailyOpLike[],
  xodimlar: DailyWorkerLike[],
  selectedDate: string,
  fixedDailyCost: number = KUNLIK_BELGILANGAN_XARAJAT,
): DailyReport {
  // Buyurtma qaysi kuni to'langanini (kassaga tushganini) aniqlaydigan xarita.
  const paymentDayByOrder = buildPaymentDayMap(ishxonaOperatsiyalar);
  // Buyurtmaning "hisob kuni" = to'lov kuni; topilmasa yaratilgan sanasi (zaxira).
  const orderDay = (b: DailyOrderLike): string =>
    paymentDayByOrder.get(String(b.id)) ?? b.sana;

  // Takrorlanmas buyurtmalar (id bo'yicha), faqat shu kunga TO'LANGAN — to'lov
  // (kassaga pul tushgan) kuni bo'yicha, yaratilgan kuni bo'yicha emas.
  const dayOrders = Array.from(new Map(buyurtmalar.map((b) => [b.id, b])).values())
    .filter((b) => b.holat === 'tulangan' && orderDay(b) === selectedDate);

  // 1) Xizmatlardan yalpi foyda (pribil) — usta ulushi ayirilgandan keyingi
  const yalpiFoyda = dayOrders.reduce(
    (s, b) => s + Math.max(0, Number(b.pribil) || 0),
    0,
  );

  // 2) "Boshqa" kategoriyali kirimlar sherik/ishxona foydasiga qo'shiladi
  const boshqaKirim = ishxonaOperatsiyalar
    .filter((op) => op.type === 'income' && op.category === 'Boshqa' && opDay(op) === selectedDate)
    .reduce((s, op) => s + (Number(op.amount) || 0), 0);

  // 3) Ishxona xarajatlari (aylanmadan tashqari — kirmaydi)
  const xarajatOps = ishxonaOperatsiyalar.filter(
    (op) =>
      op.type === 'expense' &&
      op.category !== 'Aylanmadan tashqari' &&
      opDay(op) === selectedDate,
  );
  const xarajat = xarajatOps.reduce((s, op) => s + (Number(op.amount) || 0), 0);

  // 4) Kunlik sof foyda = yalpi + boshqa − xarajat − belgilangan xarajat
  const sofFoyda = yalpiFoyda + boshqaKirim - xarajat - fixedDailyCost;

  // ── Sherik ulushi (zarar bo'lsa sherik ulush olmaydi) ────────────────────────
  const positiveNet = Math.max(0, sofFoyda);
  const partners = xodimlar.filter((x) => x.role === 'sherik');
  const totalPartners = partners.filter((p) => (p.shareType || 'total') !== 'sub');

  const partnerShares: DailyPartnerRow[] = totalPartners.map((p) => {
    const share = Math.round(positiveNet * ((p.foiz || 0) / 100));
    const subs: DailySubPartner[] = partners
      .filter((s) => s.shareType === 'sub' && Number(s.parentId) === Number(p.id))
      .map((s) => ({
        id: s.id,
        ism: s.ism,
        foiz: s.foiz || 0,
        share: Math.round(share * ((s.foiz || 0) / 100)),
      }));
    return { id: p.id, ism: p.ism, foiz: p.foiz || 0, share, subs };
  });
  const sherikUlushiJami = partnerShares.reduce((s, p) => s + p.share, 0);

  // Qolgani — ishxona foydasi
  const ishxonaFoyda = sofFoyda - sherikUlushiJami;

  // ── Har bir usta bugun ishlab topgani ────────────────────────────────────────
  const empRows: DailyEmployeeRow[] = xodimlar
    .filter((x) => (x.role || 'xodim') !== 'sherik')
    .map((x) => {
      let earned = 0;
      let count = 0;
      const orderIds = new Set<string>();
      dayOrders.forEach((b) => {
        const srv = (b.srv as number) || b.services.reduce((s, sv) => s + (sv.narx || 0), 0);
        const zap = (b.zap as number) || 0;
        const final = (b.final as number) ?? (b.total as number) ?? 0;
        const ratio = srv > 0 ? Math.min(1, Math.max(0, final - zap) / srv) : 1;
        let participated = false;
        b.services.forEach((s) => {
          if (Number(s.workerId) === Number(x.id)) {
            const raw = s.zarplata || Math.round(((s.narx || 0) * (x.foiz || 0)) / 100);
            earned += Math.round(raw * ratio);
            count += 1;
            participated = true;
          }
        });
        if (participated) orderIds.add(String(b.id));
      });
      return { id: x.id, ism: x.ism, mutax: x.mutax, foiz: x.foiz || 0, earned, count, cars: orderIds.size };
    })
    .filter((x) => x.earned > 0)
    .sort((a, b) => b.earned - a.earned);

  const ustalarJami = empRows.reduce((s, e) => s + e.earned, 0);

  return {
    ordersCount: dayOrders.length,
    yalpiFoyda,
    boshqaKirim,
    xarajat,
    xarajatCount: xarajatOps.length,
    belgilanganXarajat: fixedDailyCost,
    sofFoyda,
    partnerShares,
    sherikUlushiJami,
    ishxonaFoyda,
    empRows,
    ustalarJami,
    // Xizmat daromadi (chegirmadan keyin) = ustalar ulushi + yalpi foyda
    xizmatDaromad: ustalarJami + yalpiFoyda,
  };
}
