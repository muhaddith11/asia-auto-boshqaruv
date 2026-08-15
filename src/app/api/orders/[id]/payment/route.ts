import { NextRequest, NextResponse, after } from 'next/server';
import supabase from '@/lib/supabaseClient';
import { logAudit } from '@/lib/audit';
import { applyStockDelta } from '@/lib/stock';

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
//   1-bosqich (parallel): eski holatni o'qish + kassa yozish + operatsiya yozish
//   2-bosqich:            buyurtmani yangilash
//   javobdan keyin:       ombor deltasi + audit (`after` — javobni kuttirmaydi)
//
// Kassa qiymatlari klientdan ABSOLYUT ko'rinishda keladi (naqd/karta) —
// ilgarigi /api/kassa POST bilan bir xil semantika, xatti-harakat o'zgarmaydi.
// ─────────────────────────────────────────────────────────────────────────────

interface PaymentBody {
  holat?: string;
  final?: number;
  paid?: number;
  kassa?: { naqd: number; karta: number } | null;
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

    // ── 1-bosqich: bir-biriga bog'liq bo'lmagan uchta ish parallel ketadi ──
    const [prevRes, kassaRes, opRes] = await Promise.all([
      // Ombor deltasi uchun buyurtmaning eski holati (update'dan OLDIN o'qilishi shart)
      supabase.from('orders').select('zaps, holat').eq('id', id).maybeSingle(),
      body.kassa
        ? supabase
            .from('kassa')
            .upsert({ id: 1, naqd: body.kassa.naqd, karta: body.kassa.karta, updated_at: new Date().toISOString() })
            .select()
            .single()
        : Promise.resolve({ data: null, error: null }),
      body.operation
        ? supabase
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
        : Promise.resolve({ data: null, error: null }),
    ]);

    if (kassaRes.error) {
      console.error('❌ To\'lov: kassa yangilanmadi:', kassaRes.error);
      return NextResponse.json({ error: 'Kassa yangilanmadi: ' + kassaRes.error.message }, { status: 500 });
    }
    if (opRes.error) {
      console.error('❌ To\'lov: operatsiya yozilmadi:', opRes.error);
      return NextResponse.json({ error: 'Operatsiya yozilmadi: ' + opRes.error.message }, { status: 500 });
    }

    // ── 2-bosqich: buyurtmani yangilash ──
    const { data: updated, error: orderErr } = await supabase
      .from('orders')
      .update(orderPatch)
      .eq('id', id)
      .select()
      .single();

    if (orderErr) {
      console.error('❌ To\'lov: buyurtma yangilanmadi:', orderErr);
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
        details: { changes: orderPatch, kassa: body.kassa ?? undefined, amount: body.operation?.amount },
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

    return NextResponse.json({ order, kassa: kassaRes.data, operation: opRes.data });
  } catch (err) {
    console.error("❌ To'lov handler xatosi:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Noto'g'ri so'rov" }, { status: 400 });
  }
}
