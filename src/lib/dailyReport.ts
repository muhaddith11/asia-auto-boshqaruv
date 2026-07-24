// ─────────────────────────────────────────────────────────────────────────────
// Kundalik hisobot — yagona, sof (pure) manba.
//
// Bir kunlik: ustalar ishlab topgani, sherik ulushi va ishxona foydasi.
// Mantiq mavjud "sherik ulushi" hisob-kitobiga (workers/page.tsx) mos —
// farqi: ulush olmaydigan (korxona) xodimlar oyligi o'rniga har kunga
// BELGILANGAN xarajat ayiriladi (shu xodimlar oylik maoshi ÷ 30 kun).
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

// Operatsiya kunini (YYYY-MM-DD) aniqlash — avval kiritilgan `date`, bo'lmasa createdAt.
export function opDay(op: DailyOpLike): string {
  return op.date || String(op.createdAt || op.created_at || '').slice(0, 10);
}

export function computeDailyReport(
  buyurtmalar: DailyOrderLike[],
  ishxonaOperatsiyalar: DailyOpLike[],
  xodimlar: DailyWorkerLike[],
  selectedDate: string,
  fixedDailyCost: number = KUNLIK_BELGILANGAN_XARAJAT,
): DailyReport {
  // Takrorlanmas buyurtmalar (id bo'yicha), faqat shu kunga TO'LANGAN
  const dayOrders = Array.from(new Map(buyurtmalar.map((b) => [b.id, b])).values())
    .filter((b) => b.holat === 'tulangan' && b.sana === selectedDate);

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
