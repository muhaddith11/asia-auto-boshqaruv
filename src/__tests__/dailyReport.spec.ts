import { describe, it, expect } from 'vitest';
import {
  computeDailyReport,
  KUNLIK_BELGILANGAN_XARAJAT,
  type DailyOrderLike,
  type DailyOpLike,
  type DailyWorkerLike,
} from '@/lib/dailyReport';

// Bu testlar kundalik hisob-kitob mantig'ini "muzlatadi". Biznes qoidasi:
//   Kunlik sof foyda = Σpribil(bugun to'langan) + Boshqa kirim − xarajat − 600 000
//   Sherik ulushi = max(0, sof foyda) × foiz%;  Ishxona = sof foyda − sherik ulushi
//   Usta ishlab topgani = zarplata × (final−zap)/srv  (chegirma proporsional)

const DAY = '2026-07-24';
const OTHER = '2026-07-23';

const usta = (id: number, foiz = 40, ism = `Usta${id}`): DailyWorkerLike => ({
  id, ism, role: 'xodim', foiz,
});
const sherik = (id: number, foiz: number, ism = `Sherik${id}`): DailyWorkerLike => ({
  id, ism, role: 'sherik', shareType: 'total', foiz,
});

// To'langan buyurtma qurish yordamchisi
function order(
  id: number,
  sana: string,
  pribil: number,
  services: DailyOrderLike['services'],
  extra: Partial<DailyOrderLike> = {},
): DailyOrderLike {
  const srv = services.reduce((s, sv) => s + (sv.narx || 0), 0);
  return {
    id, holat: 'tulangan', sana, pribil,
    srv, zap: 0, final: srv, total: srv,
    services,
    ...extra,
  };
}

describe('computeDailyReport', () => {
  it("bo'sh kun — faqat belgilangan xarajat ayiriladi (zarar)", () => {
    const r = computeDailyReport([], [], [], DAY);
    expect(r.ordersCount).toBe(0);
    expect(r.yalpiFoyda).toBe(0);
    expect(r.boshqaKirim).toBe(0);
    expect(r.xarajat).toBe(0);
    expect(r.belgilanganXarajat).toBe(600000);
    expect(r.sofFoyda).toBe(-600000);
    expect(r.sherikUlushiJami).toBe(0);
    expect(r.ishxonaFoyda).toBe(-600000);
    expect(r.empRows).toEqual([]);
    expect(r.ustalarJami).toBe(0);
  });

  it('asosiy stsenariy — usta 40%, sherik 50%', () => {
    const orders = [
      order(10, DAY, 1_200_000, [{ workerId: 1, narx: 2_000_000, zarplata: 800_000 }]),
    ];
    const workers = [usta(1, 40), sherik(2, 50)];
    const r = computeDailyReport(orders, [], workers, DAY);

    expect(r.yalpiFoyda).toBe(1_200_000);
    expect(r.sofFoyda).toBe(600_000); // 1.2M − 600k
    expect(r.sherikUlushiJami).toBe(300_000); // 50% × 600k
    expect(r.ishxonaFoyda).toBe(300_000); // qolgani
    expect(r.ustalarJami).toBe(800_000);
    expect(r.empRows).toHaveLength(1);
    expect(r.empRows[0]).toMatchObject({ id: 1, earned: 800_000, count: 1, cars: 1 });
    // Rekonsilyatsiya: ustalar + yalpi = xizmat daromadi (chegirmadan keyin)
    expect(r.xizmatDaromad).toBe(2_000_000);
  });

  it("boshqa kundagi buyurtma hisobga olinmaydi", () => {
    const orders = [order(11, OTHER, 5_000_000, [{ workerId: 1, narx: 1_000_000 }])];
    const r = computeDailyReport(orders, [], [usta(1)], DAY);
    expect(r.ordersCount).toBe(0);
    expect(r.yalpiFoyda).toBe(0);
  });

  it("to'lanmagan buyurtma hisobga olinmaydi", () => {
    const orders = [{ ...order(12, DAY, 5_000_000, [{ workerId: 1, narx: 1_000_000 }]), holat: 'tulanmagan' }];
    const r = computeDailyReport(orders, [], [usta(1)], DAY);
    expect(r.ordersCount).toBe(0);
    expect(r.yalpiFoyda).toBe(0);
  });

  it('xarajat kategoriyalari — Aylanmadan tashqari va buyurtma kirimi qo\'shilmaydi', () => {
    const orders = [order(13, DAY, 2_000_000, [{ workerId: 1, narx: 2_000_000, zarplata: 800_000 }])];
    const ops: DailyOpLike[] = [
      { type: 'expense', category: 'Ijara', amount: 300_000, date: DAY },
      { type: 'expense', category: 'Aylanmadan tashqari', amount: 1_000_000, date: DAY }, // kirmaydi
      { type: 'income', category: 'Boshqa', amount: 100_000, date: DAY }, // + qo'shiladi
      { type: 'income', category: 'Buyurtma', amount: 2_000_000, date: DAY }, // buyurtma to'lovi — kirmaydi
      { type: 'expense', category: 'Ijara', amount: 500_000, date: OTHER }, // boshqa kun
    ];
    const r = computeDailyReport(orders, ops, [usta(1)], DAY);
    expect(r.boshqaKirim).toBe(100_000);
    expect(r.xarajat).toBe(300_000);
    expect(r.xarajatCount).toBe(1);
    // 2,000,000 + 100,000 − 300,000 − 600,000
    expect(r.sofFoyda).toBe(1_200_000);
  });

  it('zarar kunida sherik ulush olmaydi, zararni ishxona ko\'taradi', () => {
    const orders = [order(14, DAY, 200_000, [{ workerId: 1, narx: 500_000, zarplata: 200_000 }])];
    const workers = [usta(1, 40), sherik(2, 50)];
    const r = computeDailyReport(orders, [], workers, DAY);
    expect(r.sofFoyda).toBe(-400_000); // 200k − 600k
    expect(r.sherikUlushiJami).toBe(0); // zararda ulush yo'q
    expect(r.ishxonaFoyda).toBe(-400_000);
  });

  it('sub-sherik ulushi asosiy sherik ulushidan olinadi', () => {
    const orders = [order(15, DAY, 1_200_000, [{ workerId: 1, narx: 2_000_000, zarplata: 800_000 }])];
    const workers: DailyWorkerLike[] = [
      usta(1, 40),
      { id: 2, ism: 'Bosh', role: 'sherik', shareType: 'total', foiz: 50 },
      { id: 3, ism: 'Kichik', role: 'sherik', shareType: 'sub', parentId: 2, foiz: 20 },
    ];
    const r = computeDailyReport(orders, [], workers, DAY);
    // sof foyda 600k, asosiy sherik 50% = 300k
    expect(r.partnerShares).toHaveLength(1);
    expect(r.partnerShares[0]).toMatchObject({ id: 2, share: 300_000 });
    expect(r.partnerShares[0].subs).toHaveLength(1);
    expect(r.partnerShares[0].subs[0]).toMatchObject({ id: 3, share: 60_000 }); // 20% × 300k
    // Jami ulush faqat asosiy sheriklardan — ishxona 600k − 300k
    expect(r.sherikUlushiJami).toBe(300_000);
    expect(r.ishxonaFoyda).toBe(300_000);
  });

  it('bir nechta asosiy sherik ulushi qo\'shiladi', () => {
    const orders = [order(16, DAY, 1_800_000, [{ workerId: 1, narx: 2_000_000, zarplata: 200_000 }])];
    const workers = [usta(1, 10), sherik(2, 30), sherik(3, 20)];
    const r = computeDailyReport(orders, [], workers, DAY);
    // sof foyda = 1,800,000 − 600,000 = 1,200,000
    expect(r.sofFoyda).toBe(1_200_000);
    // 30% + 20% = 50% × 1.2M = 600k
    expect(r.sherikUlushiJami).toBe(600_000);
    expect(r.ishxonaFoyda).toBe(600_000);
  });

  it('usta ishlab topgani chegirmaga proporsional kamayadi', () => {
    // 1M xizmat, 500k chegirma → final 500k, ratio 0.5, zarplata 400k → 200k
    const orders: DailyOrderLike[] = [{
      id: 17, holat: 'tulangan', sana: DAY, pribil: 300_000,
      srv: 1_000_000, zap: 0, final: 500_000, total: 1_000_000,
      services: [{ workerId: 1, narx: 1_000_000, zarplata: 400_000 }],
    }];
    const r = computeDailyReport(orders, [], [usta(1, 40)], DAY);
    expect(r.empRows[0].earned).toBe(200_000);
    // Rekonsilyatsiya: ustalar(200k) + yalpi(300k) = final − zap = 500k
    expect(r.xizmatDaromad).toBe(500_000);
  });

  it('zarplata berilmagan bo\'lsa foizdan hisoblanadi', () => {
    const orders = [order(18, DAY, 300_000, [{ workerId: 1, narx: 500_000 }])];
    const r = computeDailyReport(orders, [], [usta(1, 40)], DAY);
    expect(r.empRows[0].earned).toBe(200_000); // 500k × 40%
  });

  it('bir buyurtmada bir nechta usta — kamayish tartibida, nol ishlaganlar chiqmaydi', () => {
    const orders = [order(19, DAY, 740_000, [
      { workerId: 1, narx: 1_000_000, zarplata: 400_000 },
      { workerId: 2, narx: 200_000, zarplata: 60_000 },
    ])];
    const workers = [usta(1, 40), usta(2, 30), usta(3, 50)]; // 3-usta ishlamagan
    const r = computeDailyReport(orders, [], workers, DAY);
    expect(r.empRows).toHaveLength(2);
    expect(r.empRows.map(e => e.id)).toEqual([1, 2]); // kamayish tartibida
    expect(r.empRows[0].earned).toBe(400_000);
    expect(r.empRows[1].earned).toBe(60_000);
  });

  it('sherik empRows ro\'yxatiga tushmaydi', () => {
    // Sherik (role) xizmatga biriktirilgan bo'lsa ham usta sifatida chiqmaydi
    const orders = [order(20, DAY, 1_000_000, [
      { workerId: 1, narx: 1_000_000, zarplata: 400_000 },
      { workerId: 2, narx: 500_000, zarplata: 250_000 },
    ])];
    const workers = [usta(1, 40), sherik(2, 50)];
    const r = computeDailyReport(orders, [], workers, DAY);
    expect(r.empRows.map(e => e.id)).toEqual([1]);
  });

  it('takroriy id\'li buyurtmalar bir marta sanaladi (dedup)', () => {
    const dup = order(21, DAY, 1_200_000, [{ workerId: 1, narx: 2_000_000, zarplata: 800_000 }]);
    const r = computeDailyReport([dup, { ...dup }], [], [usta(1)], DAY);
    expect(r.ordersCount).toBe(1);
    expect(r.yalpiFoyda).toBe(1_200_000);
  });

  it('manfiy yoki yo\'q pribil 0 sifatida olinadi', () => {
    const orders: DailyOrderLike[] = [
      order(22, DAY, -50_000, [{ workerId: 1, narx: 100_000 }]),
      { id: 23, holat: 'tulangan', sana: DAY, srv: 100_000, zap: 0, final: 100_000, services: [] }, // pribil yo'q
    ];
    const r = computeDailyReport(orders, [], [usta(1)], DAY);
    expect(r.yalpiFoyda).toBe(0);
  });

  it('belgilangan xarajatni parametr bilan o\'zgartirish mumkin', () => {
    const orders = [order(24, DAY, 1_000_000, [{ workerId: 1, narx: 1_000_000, zarplata: 400_000 }])];
    const r = computeDailyReport(orders, [], [usta(1)], DAY, 0);
    expect(r.belgilanganXarajat).toBe(0);
    expect(r.sofFoyda).toBe(1_000_000);
  });

  it('operatsiya sanasi date bo\'lmasa createdAt dan olinadi', () => {
    const ops: DailyOpLike[] = [
      { type: 'expense', category: 'Ijara', amount: 100_000, createdAt: `${DAY}T10:00:00.000Z` },
    ];
    const r = computeDailyReport([], ops, [], DAY);
    expect(r.xarajat).toBe(100_000);
  });

  it('eksport konstantasi 600 000', () => {
    expect(KUNLIK_BELGILANGAN_XARAJAT).toBe(600_000);
  });
});
