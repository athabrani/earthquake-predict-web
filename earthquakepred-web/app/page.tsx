'use client';

// app/page.tsx
import React from 'react';
import RightSidebar from './components/RightSidebar'; // Impor Sidebar Kanan
import MapLoader from './loader'; // Impor MapLoader
import HistoryChart from './components/ui/HistoryChart'; // Impor HistoryChart


export default function Home() {
  return (
    // Layout Utama: Flexbox baris
    <div className="flex w-screen h-screen overflow-hidden bg-gray-200">

      {/* Kolom Kiri (Peta & Grafik) - Mengisi 2/3 ruang */}
      <div className="flex flex-col flex-grow h-full p-4"> {/* flex-grow agar mengisi sisa */}
          {/* Area Peta - Mengisi 2/3 tinggi kolom kiri */}
          <div className="flex-grow mb-4 overflow-hidden bg-white rounded-lg shadow-lg"> {/* flex-grow agar mengisi */}
              <MapLoader />
          </div>
          {/* Area Grafik - Mengisi 1/3 tinggi kolom kiri */}
          <div className="h-1/3"> {/* Tinggi tetap atau proporsional */}
              <HistoryChart />
          </div>
      </div>

      {/* Kolom Kanan (Sidebar) - Lebar tetap */}
      <RightSidebar />

    </div>
  );
}