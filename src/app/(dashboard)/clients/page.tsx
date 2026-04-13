import React, { Suspense } from 'react';
import ClientsContent from '@/components/ClientsContent';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Mijozlar - AutoServis Pro',
  description: 'Mijozlar bazasini boshqarish',
};

export default function ClientsPage() {
  return (
    <Suspense fallback={<div className="flex-1 bg-[#14161f] min-h-screen" />}>
      <ClientsContent />
    </Suspense>
  );
}
