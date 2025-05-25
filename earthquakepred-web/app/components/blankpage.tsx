// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import IndonesiaMapWithPins from './blankmap'; // Sesuaikan path

interface PredictionResult {
  Provinsi: string;
  Probabilitas_Gempa_30_Hari: number;
  Prediksi_Gempa: number; // 0 atau 1
  Message?: string;
}

// Daftar provinsi yang ada di backend/memiliki data dan scaler
const ALL_AVAILABLE_PROVINCES = [
  "Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", "Jambi", "Sumatera Selatan",
  "Bengkulu", "Lampung", "Kepulauan Bangka Belitung", "Kepulauan Riau", "DKI Jakarta",
  "Jawa Barat", "Jawa Tengah", "DI Yogyakarta", "Jawa Timur", "Banten", "Bali",
  "Nusa Tenggara Barat", "Nusa Tenggara Timur", "Kalimantan Barat", "Kalimantan Tengah",
  "Kalimantan Selatan", "Kalimantan Timur", "Kalimantan Utara", "Sulawesi Utara",
  "Sulawesi Tengah", "Sulawesi Selatan", "Sulawesi Tenggara", "Gorontalo", "Sulawesi Barat",
  "Maluku", "Maluku Utara", "Papua", "Papua Barat"
  // Pastikan ini adalah daftar lengkap provinsi yang bisa diprediksi oleh backend Anda
].sort();


export default function HomePage() {
  const [allPredictions, setAllPredictions] = useState<PredictionResult[]>([]);
  const [selectedPrediction, setSelectedPrediction] = useState<PredictionResult | null>(null);
  const [isLoadingMap, setIsLoadingMap] = useState<boolean>(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllPredictions = async () => {
    setIsLoadingMap(true);
    setError(null);
    const results: PredictionResult[] = [];
    // Batasi jumlah request paralel jika terlalu banyak provinsi
    // atau idealnya backend punya endpoint untuk mengambil semua prediksi sekaligus
    for (const provinceName of ALL_AVAILABLE_PROVINCES) {
      try {
        const response = await fetch('http://localhost:5000/predict_lstm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provinsi: provinceName }),
        });
        const data = await response.json();
        if (response.ok) {
          results.push(data);
        } else {
          console.warn(`Gagal prediksi untuk ${provinceName}: ${data.error}`);
        }
      } catch (err) {
        console.warn(`Error saat menghubungi server untuk ${provinceName}:`, err);
      }
    }
    setAllPredictions(results);
    setIsLoadingMap(false);
    if (results.length === 0 && ALL_AVAILABLE_PROVINCES.length > 0) {
        setError("Tidak dapat mengambil data prediksi untuk provinsi manapun. Pastikan backend berjalan dan dapat diakses.");
    }
  };

  // Panggil fetchAllPredictions saat komponen pertama kali dimuat
  useEffect(() => {
    fetchAllPredictions();
  }, []);

  const handleProvincePinClick = async (provinceName: string) => {
    // Cari prediksi yang sudah ada, atau fetch ulang jika diperlukan
    const existingPrediction = allPredictions.find(p => p.Provinsi === provinceName);
    if (existingPrediction) {
      setSelectedPrediction(existingPrediction);
      return;
    }

    // Jika tidak ada, fetch individual (seharusnya sudah ada dari fetchAll)
    setIsLoadingDetail(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/predict_lstm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provinsi: provinceName }),
      });
      const data: PredictionResult | { error: string } = await response.json();
      if (!response.ok) throw new Error((data as { error: string }).error || 'Gagal mengambil prediksi detail');
      setSelectedPrediction(data as PredictionResult);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  return (
    <main className="flex flex-col items-center min-h-screen p-4 bg-gray-100 md:p-8">
      <div className="w-full max-w-5xl text-center">
        <h1 className="mb-3 text-3xl font-bold text-orange-600 md:text-4xl">
          Peta Probabilitas Gempa Indonesia (LSTM)
        </h1>
        <p className="mb-6 text-gray-700 text-md md:text-lg">
          Klik pin pada provinsi untuk melihat detail prediksi. Warna pin menunjukkan potensi gempa.
        </p>
        <button
            onClick={fetchAllPredictions}
            disabled={isLoadingMap}
            className="px-4 py-2 mb-6 text-white bg-blue-500 rounded hover:bg-blue-600 disabled:bg-gray-300"
        >
            {isLoadingMap ? 'Memuat Peta...' : 'Segarkan Data Peta'}
        </button>

        <div className="p-2 mb-8 bg-white border border-gray-200 rounded-lg shadow-lg md:p-4">
          {isLoadingMap && <p className="py-10 text-center text-orange-500">Memuat data peta...</p>}
          {!isLoadingMap && allPredictions.length === 0 && !error && <p className="py-10 text-center text-gray-500">Tidak ada data prediksi untuk ditampilkan di peta.</p>}
          {!isLoadingMap && allPredictions.length > 0 && (
            <IndonesiaMapWithPins 
                onProvinceClick={handleProvincePinClick} 
                predictionsData={allPredictions}
            />
          )}
        </div>
        
        {isLoadingDetail && <div className="mt-4 text-orange-500">Memuat detail...</div>}

        {error && (
          <div className="max-w-md p-4 mx-auto mt-4 text-red-700 bg-red-100 border border-red-300 rounded-md">
            <h2 className="text-lg font-bold">Error</h2>
            <p>{error}</p>
          </div>
        )}

        {selectedPrediction && !isLoadingDetail && (
          <div className="max-w-md p-6 mx-auto mt-4 bg-white border border-gray-200 rounded-lg shadow-lg">
            <h2 className="mb-2 text-xl font-semibold text-gray-800">
              Detail Prediksi: <span className="text-orange-600">{selectedPrediction.Provinsi}</span>
            </h2>
            <p 
              className={`text-lg font-bold mb-1 ${
                selectedPrediction.Prediksi_Gempa === 1 ? 'text-red-600' : 'text-green-600'
              }`}
            >
              {selectedPrediction.Prediksi_Gempa === 1 
                ? 'BERPOTENSI TERJADI GEMPA' 
                : 'TIDAK BERPOTENSI TERJADI GEMPA'}
            </p>
            <p className="text-gray-600">
              Probabilitas Kejadian Gempa (30 hari ke depan): 
              <span className="ml-1 font-medium">
                {(selectedPrediction.Probabilitas_Gempa_30_Hari * 100).toFixed(2)}%
              </span>
            </p>
            {selectedPrediction.Message && (
              <p className="mt-2 text-xs text-gray-500">{selectedPrediction.Message}</p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}