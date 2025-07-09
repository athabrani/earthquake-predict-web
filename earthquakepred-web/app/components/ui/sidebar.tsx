// app/components/Sidebar.tsx
'use client';

import React, { useState, useEffect } from 'react';

// Interface untuk data gempa yang akan ditampilkan
interface EarthquakeEvent {
  id: number | string;
  tgl: string;
  lat: number;
  lon: number; // Pastikan menggunakan 'lon' atau 'lng' sesuai API Anda
  depth: number;
  mag: number;
  provinsi: string;
}

const Sidebar: React.FC = () => {
  const [recentEarthquakes, setRecentEarthquakes] = useState<EarthquakeEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentEarthquakes = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Ambil 10 gempa terbaru
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
    <div className="flex flex-col h-screen p-6 overflow-y-auto bg-white shadow-xl w-80"> {/* Lebar sidebar 80 (320px) */}
      {/* --- Judul --- */}
      <div className="pb-4 mb-6 border-b">
        <h1 className="text-2xl font-bold text-gray-800">Earthquake Map</h1>
        <p className="text-sm text-gray-500">Prediction & Information</p>
      </div>

      {/* --- Pencarian (Placeholder) --- */}
      <div className="mb-8">
        <h2 className="mb-3 text-lg font-semibold text-gray-700">Pencarian</h2>
        <div className="p-4 border rounded-md bg-gray-50">
           <p className="text-sm text-center text-gray-400">
                (Fitur Filter Belum Tersedia)
           </p>
           {/* Nanti di sini Anda bisa tambahkan input tanggal, magnitudo, dll. */}
        </div>
      </div>

      {/* --- Gempa Terkini --- */}
      <div className="flex-1"> {/* Memastikan bagian ini mengisi sisa ruang */}
        <h2 className="mb-3 text-lg font-semibold text-gray-700">Gempa Terkini</h2>
        <div className="space-y-4">
          {isLoading && <p className="text-gray-500">Memuat data...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!isLoading && !error && recentEarthquakes.length === 0 && (
              <p className="text-gray-500">Tidak ada data gempa terkini.</p>
          )}
          {!isLoading && !error && recentEarthquakes.map((quake) => (
            <div key={quake.id || quake.tgl} className="p-4 transition-shadow border rounded-md shadow-sm hover:shadow-md">
              <h3 className="font-semibold text-gray-800">{quake.provinsi || 'Lokasi Tidak Diketahui'}</h3>
              <p className="text-xs text-gray-500">{new Date(quake.tgl).toLocaleString()}</p>
              <div className="flex justify-between mt-2 text-sm">
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

export default Sidebar;