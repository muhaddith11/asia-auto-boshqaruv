import React, { Suspense } from 'react';
import PartsContent from '@/components/PartsContent';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Ehtiyot qismlar - AsiaAutoService',
  description: 'Ombordagi ehtiyot qismlarni boshqarish',
};

export default function PartsPage() {
  return (
    <Suspense fallback={<div className="flex-1 bg-[#14161f] min-h-screen" />}>
      <PartsContent />
    </Suspense>
  );
}
