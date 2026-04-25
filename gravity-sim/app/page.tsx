'use client';

import dynamic from 'next/dynamic';

const SimApp = dynamic(() => import('@/components/SimApp'), { ssr: false });


export default function Home() {
  return (
    <main className="w-screen h-screen overflow-hidden bg-black">
      <SimApp />
    </main>
  );
}
