import { NextRequest, NextResponse, after } from 'next/server';
import supabase from '@/lib/supabaseClient';
import { logAudit } from '@/lib/audit';
import { applyStockDelta } from '@/lib/stock';
import { changeKassa, invertDelta, operationDelta, type KassaBalance } from '@/lib/kassa';
import { FULL_ACCESS, requireRole } from '@/lib/routeGuard';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// ─────────────────────────────────────────────────────────────────────────────
// To'lovni qabul qilish — BITTA so'rovda.
//
// Ilgari klient uchta alohida so'rov yuborardi (buyurtma -> kassa ->
// operatsiya). Har biri brauzerdan serverga borib kelardi va har birining
// ichida yana bir nechta DB so'rovi bor edi. To'lov tugmasi 2-3 soniya
// kutardi.
//
// Endi hammasi bitta so'rovda:
//   1-bosqich: eski holatni o'qish (buyurtma yo'q bo'lsa pulga tegilmaydi)
//   2-bosqich: operatsiya yozish, kassani o'zgartirish
//   3-bosqich: buyurtmani yangilash (yiqilsa 2-bosqich orqaga qaytariladi)
//   javobdan keyin: ombor deltasi + audit (`after` — javobni kuttirmaydi)
//
// Kassaga tushadigan summa `operation`dan olinadi. Eski tablar yuboradigan
// absolyut `kassa` maydoni o'qilmaydi (@/lib/kassa).
// ─────────────────────────────────────────────────────────────────────────────

interface PaymentBody {
  holat?: string;
  final?: number;
  paid?: number;
  operation?: {
    date: string;
    type: string;
    method: string;
    amount: number;
    category: string;
    comment?: string;
    source?: string;
  } | null;
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const guard = await requireRole(request, FULL_ACCESS);
  if (guard.denied) return guard.denied;

  try {
    const { id: idStr } = await context.params;
    const id = Number(idStr);
    const body = (await request.json()) as PaymentBody;

    const orderPatch: Record<string, unknown> = {};
    (['holat', 'final', 'paid'] as const).forEach((k) => {
      if (body[k] !== undefined) orderPatch[k] = body[k];
    });

    if (Object.keys(orderPatch).length === 0) {
      return NextResponse.json({ error: "To'lov uchun ma'lumot yuborilmagan" }, { status: 400 });
    }

    // ── 1-bosqich: eski holat ──
    // Ombor deltasi uchun buyurtmaning eski holati (update'dan OLDIN o'qilishi shart)
    // + `final` skidka bilan o'zgarsa foyda/maosh qayta hisoblanishi uchun kerakli maydonlar.
    const prevRes = await supabase
      .from('orders')
      .select('zaps, holat, srv, total, services, zarplata, pribil')
      .eq('id', id)
      .maybeSingle();
    if (prevRes.error) {
      console.error('❌ To\'lov: buyurtma o\'qilmadi:', prevRes.error);
      return NextResponse.json({ error: 'Buyurtma o\'qilmadi: ' + prevRes.error.message }, { status: 500 });
    }
    if (!prevRes.data) {
      return NextResponse.json({ error: 'Buyurtma topilmadi' }, { status: 404 });
    }

    // ── 2-bosqich: operatsiya va kassa ──
    const opRes = body.operation
      ? await supabase
          .from('operations')
          .insert([{
            date: body.operation.date,
            type: body.operation.type,
            method: body.operation.method || 'naqd',
            amount: body.operation.amount,
            category: body.operation.category,
            comment: body.operation.comment || '',
            source: body.operation.source || 'buyurtma',
          }])
          .select()
          .single()
      : { data: null, error: null };
    if (opRes.error) {
      console.error('❌ To\'lov: operatsiya yozilmadi:', opRes.error);
      return NextResponse.json({ error: 'Operatsiya yozilmadi: ' + opRes.error.message }, { status: 500 });
    }

    const removeOperation = async () => {
      const opId = (opRes.data as { id?: number } | null)?.id;
      if (opId) await supabase.from('operations').delete().eq('id', opId);
    };

    const delta = body.operation ? operationDelta(body.operation) : null;
    let kassa: KassaBalance | null = null;
    if (delta) {
      try {
        kassa = await changeKassa(delta);
      } catch (kassaErr) {
        console.error('❌ To\'lov: kassa yangilanmadi:', kassaErr);
        await removeOperation();
        return NextResponse.json({ error: 'Kassa yangilanmadi' }, { status: 500 });
      }
    }

    // `final` skidka (to'lov paytidagi "Qo'shimcha skidka") bilan pasaytirilganda
    // foyda va usta maoshi ham qayta hisoblanishi kerak — aks holda ular eski
    // (chegirmasiz) qiymatda "muzlab" qoladi (buyurtmalar ro'yxatida FOYDA ustuni
    // noto'g'ri, shishirilgan ko'rinadi). `total` — chegirmasiz asl summa (doim
    // o'zgarmaydi), shu bois (total − yangi final) jami chegirmani beradi.
    // Usta ulushi har doim `services[].zarplata`da XOM (chegirmasiz) saqlanadi.
    //
    // Buyurtma "foyda" bazasi ikki xil bo'lishi mumkin: dashboard buyurtmalarida
    // faqat xizmat summasidan (zapchast kirmaydi), bot orqali chiqarilgan
    // buyurtmalarda esa xizmat + zapchast foydasidan (narx − sebestoimost).
    // Qaysi formula ishlatilganini taxmin qilish o'rniga — hali chegirma
    // "singdirilmagan" (zarplata hamon xom) qiymatdan asl bazani orqaga
    // chiqarib olamiz: bazaBazis = eski_pribil + zarplataRaw (ikkala formula
    // uchun ham to'g'ri, chunki ikkalasida ham pribil = baza − zarplata).
    if (body.final !== undefined) {
      const prevRow = prevRes.data as { srv?: number; total?: number; zarplata?: number; pribil?: number; services?: { zarplata?: number }[] } | null;
      const srv = Number(prevRow?.srv) || 0;
      const totalBase = Number(prevRow?.total) || srv;
      const totalChegirma = Math.max(0, totalBase - Number(body.final));
      const zarplataRaw = Array.isArray(prevRow?.services)
        ? prevRow!.services!.reduce((s, sv) => s + (Number(sv?.zarplata) || 0), 0)
        : 0;
      const zarplataCurrent = Number(prevRow?.zarplata) || 0;
      // Faqat HALI chegirma singdirilmagan bo'lsa qayta hisoblaymiz — aks holda
      // oldingi bosqichda kiritilgan chegirmani ikki marta hisoblab yuboramiz.
      if (zarplataCurrent === zarplataRaw) {
        const baseBasis = (Number(prevRow?.pribil) || 0) + zarplataRaw;
        const chegirmaRatio = srv > 0 ? Math.max(0, srv - totalChegirma) / srv : 1;
        const zarplataAdjusted = Math.round(zarplataRaw * chegirmaRatio);
        orderPatch.zarplata = zarplataAdjusted;
        orderPatch.pribil = Math.max(0, baseBasis - totalChegirma - zarplataAdjusted);
      }
    }

    // ── 3-bosqich: buyurtmani yangilash ──
    const { data: updated, error: orderErr } = await supabase
      .from('orders')
      .update(orderPatch)
      .eq('id', id)
      .select()
      .single();

    if (orderErr) {
      console.error('❌ To\'lov: buyurtma yangilanmadi:', orderErr);
      // Pul buyurtmaga bog'lanmagan holda qolmasin.
      if (delta) await changeKassa(invertDelta(delta)).catch((e) => console.error('❌ To\'lov: kassa qaytarilmadi:', e));
      await removeOperation();
      return NextResponse.json({ error: 'Buyurtma yangilanmadi: ' + orderErr.message }, { status: 500 });
    }

    const order = updated
      ? { ...updated, createdAt: updated.created_at ?? updated.createdat, chegirma: (updated.total || 0) - (updated.final || 0) }
      : null;

    // ── Javobdan keyin: ombor va audit foydalanuvchini kuttirmaydi ──
    const prevRow = prevRes.data;
    after(async () => {
      // To'lovda zaps o'zgarmaydi — delta odatda bo'sh. Ammo bekor qilingan
      // buyurtma qayta to'langan holat uchun baribir hisoblab qo'yamiz.
      await applyStockDelta(
        { zaps: prevRow?.zaps, holat: prevRow?.holat },
        { zaps: prevRow?.zaps, holat: (orderPatch.holat as string) ?? prevRow?.holat },
      );
      await logAudit({
        req: request,
        action: 'payment',
        entity: 'order',
        entityId: id,
        details: { changes: orderPatch, kassa: kassa ?? undefined, amount: body.operation?.amount },
      });
      if (opRes.data) {
        await logAudit({
          req: request,
          action: 'create',
          entity: 'operation',
          entityId: (opRes.data as { id?: number }).id,
          details: { type: body.operation?.type, amount: body.operation?.amount, category: body.operation?.category, method: body.operation?.method },
        });
      }
    });

    return NextResponse.json({ order, kassa, operation: opRes.data });
  } catch (err) {
    console.error("❌ To'lov handler xatosi:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Noto'g'ri so'rov" }, { status: 400 });
  }
}
