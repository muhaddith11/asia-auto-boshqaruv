import React, { Suspense } from 'react';
import ServicesContent from '@/components/ServicesContent';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Xizmatlar - AsiaAutoService',
  description: 'Avtoservis xizmatlarini boshqarish',
};

export default function ServicesPage() {
  return (
    <Suspense fallback={<div className="flex-1 bg-[#14161f] min-h-screen" />}>
      <ServicesContent />
    </Suspense>
  );
}
