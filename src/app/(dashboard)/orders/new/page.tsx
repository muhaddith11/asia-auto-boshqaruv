'use client';
import toast from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { OrderForm, Assignment, PartRow } from './_components/formStyles';
import { computeOrderTotals } from '@/lib/orderCalc';
import ClientSection from './_components/ClientSection';
import ServicesSection from './_components/ServicesSection';
import PartsSection from './_components/PartsSection';
import SummarySection from './_components/SummarySection';

export default function NewOrderPage() {
  const router = useRouter();
  const {
    mijozlar, xodimlar, xizmatlar, zapchastlar, mashinalar,
    addBuyurtma, updateMijoz, addMashina, loadInitialData
  } = useStore();

  const [mounted, setMounted] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

  const [form, setForm] = useState<OrderForm>({
    ism: 'Kunlik Mijoz',
    tel: '',
    mashina: '',
    raqam: '',
    yil: '',
    vin: '',
    muammo: '',
    holat: 'yaratildi',
    chegirma: 0,
    chegirmaFoiz: 0,
  });

  const [assignments, setAssignments] = useState<Assignment[]>([
    { id: Date.now(), workerId: '', serviceId: '', customNarx: '' }
  ]);

  const [partRows, setPartRows] = useState<PartRow[]>([
    { id: Date.now(), partId: '', qty: 1 }
  ]);

  useEffect(() => {
    setMounted(true);
    loadInitialData(); // Ensure fresh data on page load
  }, []);

  if (!mounted) return null;

  // ── Helpers ─────────────────────────────────────────────────
  const getServiceNarx = (serviceId: string | number) => {
    const s = xizmatlar.find(x => String(x.id) === String(serviceId));
    return s?.narx || 0;
  };
  const getPartNarx = (partId: string | number) => {
    const p = zapchastlar.find(x => x.id === Number(partId));
    return p?.narx || 0;
  };

  // ── Calculations (yagona pure modul orqali — natijalar avvalgidek) ──
  // Xizmat qatorlari: narx (custom yoki katalog) + usta ulushi (usta yo'q bo'lsa 0%)
  const serviceLines = assignments
    .filter(a => a.serviceId)
    .map(a => {
      const base = a.customNarx ? parseFloat(a.customNarx) : getServiceNarx(a.serviceId);
      const worker = xodimlar.find(x => Number(x.id) === Number(a.workerId));
      return { narx: isNaN(base) ? 0 : base, foiz: a.workerId ? (worker?.foiz || 0) : 0 };
    });
  const partLines = partRows
    .filter(r => r.partId)
    .map(r => ({ narx: getPartNarx(r.partId), qty: r.qty || 1 }));

  const { servicesTotal, partsTotal, subTotal, finalTotal, zarplataAdjusted, netProfit } =
    computeOrderTotals(serviceLines, partLines, form.chegirma || 0);

  // ── Save ─────────────────────────────────────────────────────
  const handleSave = () => {
    if (!form.ism || !form.mashina || !form.raqam) {
      toast.error('Ism, mashina va davlat raqamini kiriting!');
      return;
    }

    const orderServices = assignments
      .filter(a => a.workerId && a.serviceId)
      .map(a => {
        const s = xizmatlar.find(x => String(x.id) === String(a.serviceId));
        const worker = xodimlar.find(x => String(x.id) === String(a.workerId));
        const rawNarx = a.customNarx ? parseFloat(a.customNarx) : (s?.narx || 0);
        const narx = isNaN(rawNarx) ? 0 : rawNarx;
        const foiz = worker?.foiz || 0;
        return {
          ...s,
          narx,
          workerId: Number(a.workerId),
          zarplata: Math.round(narx * foiz / 100),
        };
      });

    const orderParts = partRows
      .filter(r => r.partId)
      .map(r => {
        const p = zapchastlar.find(x => String(x.id) === String(r.partId));
        return { ...p, qty: r.qty || 1 };
      });

    const newOrder = {
      ...form,
      sana: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      services: orderServices,
      zaps: orderParts,
      srv: servicesTotal,
      zap: partsTotal,
      total: subTotal,
      final: finalTotal,
      zarplata: zarplataAdjusted,
      pribil: netProfit,
      print_status: 'pending'
    };

    addBuyurtma(newOrder as any);

    if (selectedClientId) {
      const mijoz = mijozlar.find(m => m.id === selectedClientId);
      if (mijoz) {
        updateMijoz(selectedClientId, {
          tashriflar: (mijoz.tashriflar || 0) + 1,
          jami: (mijoz.jami || 0) + finalTotal,
          raqam: form.raqam, mashina: form.mashina, vin: form.vin,
        });
      }
    }

    // Ombor balansini kamaytirish endi SERVER tomonda (/api/orders POST) qilinadi —
    // ishonchli va bekor qilish/tahrirlash bilan izchil. Bu yerda client tomonda
    // kamaytirmaymiz (aks holda ikki marta ayirilar edi).

    router.push('/orders');
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg)', minHeight: '100vh' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>

          <ClientSection
            form={form}
            setForm={setForm}
            mijozlar={mijozlar}
            mashinalar={mashinalar}
            xizmatlar={xizmatlar}
            selectedClientId={selectedClientId}
            setSelectedClientId={setSelectedClientId}
            addMashina={addMashina}
            assignments={assignments}
            setAssignments={setAssignments}
          />

          <ServicesSection
            assignments={assignments}
            setAssignments={setAssignments}
            xodimlar={xodimlar}
            xizmatlar={xizmatlar}
            mashina={form.mashina}
            zarplataAdjusted={zarplataAdjusted}
            servicesTotal={servicesTotal}
          />

          <PartsSection
            partRows={partRows}
            setPartRows={setPartRows}
            zapchastlar={zapchastlar}
            mashina={form.mashina}
          />

          <SummarySection
            form={form}
            setForm={setForm}
            servicesTotal={servicesTotal}
            partsTotal={partsTotal}
            zarplataAdjusted={zarplataAdjusted}
            subTotal={subTotal}
            finalTotal={finalTotal}
            onSave={handleSave}
          />

        </div>
      </div>
    </div>
  );
}
