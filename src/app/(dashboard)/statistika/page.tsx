'use client';
export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import BossDashboard from '@/components/BossDashboard';

// Boshliq uchun statistika — avval bosh sahifada turgan hamma narsa shu yerda.
export default function StatistikaPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  return <BossDashboard />;
}
