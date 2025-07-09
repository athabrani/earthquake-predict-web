// app/components/RightSidebar.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { poppins } from '@/app/styles/font';

interface EarthquakeEvent {
  id: number | string;
  tgl: string;
  mag: number;
  depth: number;
  provinsi: string;
}

const RightSidebar: React.FC = () => {
  const [recentEarthquakes, setRecentEarthquakes] = useState<EarthquakeEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentEarthquakes = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('http://localhost:5000/katalog?limit=10'); 
        if (!response.ok) {
          throw new Error('Gagal memuat data gempa terkini.');
        }
        const data = await response.json();
         if (!Array.isArray(data)) {
            throw new Error("Format data API tidak sesuai.");
        }
        setRecentEarthquakes(data);
      } catch (err: any) {
        setError(err.message || 'Terjadi kesalahan.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentEarthquakes();
  }, []);

  return (
    <div className={`${poppins.className} flex flex-col h-screen p-6 shadow-lg bg-gray-50 w-96`}> {/* Lebar sidebar 96 (384px) */}
      {/* --- Judul --- */}
      <div className="pb-4 mb-6 border-b">
        <h1 className="text-2xl font-bold text-gray-800">Earthquake Map</h1>
        <p className="text-sm text-gray-500">Prediction & Information</p>
      </div>

      {/* --- Klasifikasi (Placeholder) --- */}
       <div className="mb-8">
        <h2 className="mb-3 text-lg font-semibold text-gray-700">Klasifikasi Gempa</h2>
        <div className="grid grid-cols-2 gap-4 p-4 bg-white rounded-md shadow-lg">
            <div>
                <div className="text-3xl font-bold text-green-600">15</div>
                <div className="text-xs text-gray-500">Ringan (&lt; 4.5)</div>
            </div>
             <div>
                <div className="text-3xl font-bold text-yellow-600">8</div>
                <div className="text-xs text-gray-500">Sedang</div>
            </div>
             <div>
                <div className="text-3xl font-bold text-orange-600">3</div>
                <div className="text-xs text-gray-500">Kuat</div>
            </div>
             <div>
                <div className="text-3xl font-bold text-red-600">1</div>
                <div className="text-xs text-gray-500">Sangat Kuat</div>
            </div>
            <p className="col-span-2 text-xs text-gray-400"> (Data Klasifikasi Placeholder)</p>
        </div>
      </div>


      {/* --- Gempa Terkini --- */}
      <div className="flex-1 pb-12 overflow-hidden">
        <h2 className="mb-3 text-lg font-semibold text-gray-700">List Gempa</h2>
        <div className="h-full pb-4 pr-2 space-y-3 overflow-y-auto">
          {isLoading && <p className="text-gray-500">Memuat data...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!isLoading && !error && recentEarthquakes.map((quake, index) => ( // <-- Tambahkan 'index' di sini
            <div key={quake.id || `${quake.tgl}-${index}`} // <-- Gunakan kombinasi tgl dan index
                className="p-3 bg-white rounded-md shadow-lg">
                <h3 className="text-sm font-semibold text-gray-800">{quake.provinsi || 'Lokasi Tidak Diketahui'}</h3>
                <p className="text-xs text-gray-500">{new Date(quake.tgl).toLocaleString()}</p>
                <div className="flex justify-between mt-1 text-xs">
                <span>Mag: <span className="font-medium">{quake.mag}</span></span>
                <span>Depth: <span className="font-medium">{quake.depth} km</span></span>
                </div>
            </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;