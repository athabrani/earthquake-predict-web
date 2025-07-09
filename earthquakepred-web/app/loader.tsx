// app/components/leaf/MapLoader.tsx (atau nama file yang sesuai)
'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Pastikan path ini benar menunjuk ke gempa.tsx Anda
const GempaMapWithNoSSR = dynamic(
  () => import('@/app/components/leaf2/gempa'), // atau path relatif seperti '../leaf2/gempa'
  {
    ssr: false, // Ini mencegah rendering di server
    loading: () => <p className="flex items-center justify-center w-full h-full">Memuat Peta...</p>,
  }
);

const MapLoader: React.FC = () => {
  return <GempaMapWithNoSSR />;
};

export default MapLoader;