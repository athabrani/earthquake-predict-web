// app/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image'; // Diperlukan jika ada fallback Image

// Komponen LeafletMap hanya di-render di sisi client
const IndonesiaMapWithPinsWithNoSSR = dynamic(() => import('./map'), { // Pastikan path ini benar
  ssr: false,
  loading: () => <div className="w-full aspect-[16/9] bg-gray-200 animate-pulse rounded-md flex items-center justify-center"><p className="text-gray-500">Memuat Peta...</p></div>
});

interface PredictionResult {
  Provinsi: string;
  Probabilitas_Gempa_30_Hari: number;
  Prediksi_Gempa: number; // 0 atau 1
  Message?: string;
}

interface ErrorResponse {
  error: string;
}

interface ProvinceCoordinateData {
    id: string;
    name: string;
    // Koordinat x dan y dalam persentase (0-100) relatif terhadap gambar
    xPercent: number; 
    yPercent: number;
}

// Tipe untuk data yang akan dikirim ke komponen peta
type MapProvinceDisplayData = ProvinceCoordinateData & {
    probability?: number;
    prediction?: number;
};

// **PENTING: SESUAIKAN KOORDINAT PERSENTASE INI DENGAN GAMBAR PETA ANDA**
// Anda perlu menentukan xPercent dan yPercent secara manual untuk setiap provinsi
// berdasarkan posisi mereka di gambar peta '1_xjuG7BDqJlsojmBXGwnOBA.jpeg'
const PROVINCE_PIN_COORDINATES: ProvinceCoordinateData[] = [
  // Sumatera
  { id: 'ID-AC', name: 'Aceh', xPercent: 9.5, yPercent: 28.5 },        // Kiri atas
  { id: 'ID-SU', name: 'Sumatera Utara', xPercent: 14, yPercent: 33 },
  { id: 'ID-SB', name: 'Sumatera Barat', xPercent: 14, yPercent: 44 },
  { id: 'ID-RI', name: 'Riau', xPercent: 18.5, yPercent: 39 },
  { id: 'ID-JA', name: 'Jambi', xPercent: 20, yPercent: 47 },
  { id: 'ID-SS', name: 'Sumatera Selatan', xPercent: 22, yPercent: 53 },
  { id: 'ID-BB', name: 'Kepulauan Bangka Belitung', xPercent: 25.5, yPercent: 50 },
  { id: 'ID-KR', name: 'Kepulauan Riau', xPercent: 22, yPercent: 37 }, // Antara Riau dan Bangka
  { id: 'ID-BE', name: 'Bengkulu', xPercent: 18, yPercent: 56 },
  { id: 'ID-LA', name: 'Lampung', xPercent: 23, yPercent: 63 },
  // Jawa & Bali & Nusa Tenggara
  { id: 'ID-BT', name: 'Banten', xPercent: 23.5, yPercent: 70.5 },    // Ujung barat Jawa
  { id: 'ID-JK', name: 'DKI Jakarta', xPercent: 25.5, yPercent: 70 },
  { id: 'ID-JB', name: 'Jawa Barat', xPercent: 27, yPercent: 72.5 },
  { id: 'ID-JT', name: 'Jawa Tengah', xPercent: 31.5, yPercent: 72.8 },
  { id: 'ID-YO', name: 'DI Yogyakarta', xPercent: 31.8, yPercent: 75.5 },
  { id: 'ID-JI', name: 'Jawa Timur', xPercent: 35, yPercent: 74.5 },
  { id: 'ID-BA', name: 'Bali', xPercent: 39.5, yPercent: 78 },
  { id: 'ID-NB', name: 'Nusa Tenggara Barat', xPercent: 43, yPercent: 79 },
  { id: 'ID-NT', name: 'Nusa Tenggara Timur', xPercent: 52, yPercent: 81 }, // Lebih ke timur
  // Kalimantan
  { id: 'ID-KB', name: 'Kalimantan Barat', xPercent: 32, yPercent: 35.5 },
  { id: 'ID-KT', name: 'Kalimantan Tengah', xPercent: 38, yPercent: 47 },
  { id: 'ID-KS', name: 'Kalimantan Selatan', xPercent: 41, yPercent: 53 },
  { id: 'ID-KI', name: 'Kalimantan Timur', xPercent: 45, yPercent: 40 },
  { id: 'ID-KU', name: 'Kalimantan Utara', xPercent: 44, yPercent: 28 }, // Di atas Kaltim
  // Sulawesi
  { id: 'ID-SA', name: 'Sulawesi Utara', xPercent: 58, yPercent: 30 }, // Ujung atas Sulawesi
  { id: 'ID-GO', name: 'Gorontalo', xPercent: 56, yPercent: 36 },
  { id: 'ID-ST', name: 'Sulawesi Tengah', xPercent: 52.5, yPercent: 47 },
  { id: 'ID-SR', name: 'Sulawesi Barat', xPercent: 50, yPercent: 52.5 },
  { id: 'ID-SN', name: 'Sulawesi Selatan', xPercent: 51.5, yPercent: 59 },
  { id: 'ID-SG', name: 'Sulawesi Tenggara', xPercent: 55.5, yPercent: 60 },
  // Maluku & Papua
  { id: 'ID-MU', name: 'Maluku Utara', xPercent: 68, yPercent: 38 },
  { id: 'ID-MA', name: 'Maluku', xPercent: 70, yPercent: 59 },
  { id: 'ID-PB', name: 'Papua Barat', xPercent: 77, yPercent: 48 }, // Kepala Burung
  { id: 'ID-PA', name: 'Papua', xPercent: 87, yPercent: 63 }, // Bagian utama Papua
].sort((a, b) => a.name.localeCompare(b.name));

const ALL_PREDICTABLE_PROVINCES = PROVINCE_PIN_COORDINATES.map(p => p.name);

export default function HomePage() {
  const [mapDisplayData, setMapDisplayData] = useState<MapProvinceDisplayData[]>([]);
  const [selectedPrediction, setSelectedPrediction] = useState<PredictionResult | null>(null);
  const [isLoadingMap, setIsLoadingMap] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const mapImageUrl = '/indo-map.jpeg'; // Ganti dengan path gambar Anda

  const fetchAllPredictionsForMap = useCallback(async () => {
    setIsLoadingMap(true);
    setError(null);
    setSelectedPrediction(null);
    
    const results: MapProvinceDisplayData[] = [];

    const fetchPromises = ALL_PREDICTABLE_PROVINCES.map(async (provinceName) => {
      const basePinData = PROVINCE_PIN_COORDINATES.find(p => p.name === provinceName);
      if (!basePinData) {
        console.warn(`Koordinat pin untuk ${provinceName} tidak ditemukan.`);
        return null; 
      }

      try {
        const response = await fetch('http://localhost:5000/predict_lstm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provinsi: provinceName }),
        });

        const responseData: PredictionResult | ErrorResponse = await response.json();

        if (!response.ok) {
          let errorMessage = `Gagal prediksi untuk ${provinceName}`;
          if (responseData && 'error' in responseData && typeof responseData.error === 'string') {
            errorMessage = responseData.error;
          }
          console.warn(errorMessage);
          return { ...basePinData, probability: undefined, prediction: undefined };
        }
        
        const predictionData = responseData as PredictionResult;
        return {
          ...basePinData,
          probability: predictionData.Probabilitas_Gempa_30_Hari,
          prediction: predictionData.Prediksi_Gempa,
        };
      } catch (err: any) {
        console.warn(`Error saat menghubungi server untuk ${provinceName}:`, err.message || err);
        return { ...basePinData, probability: undefined, prediction: undefined };
      }
    });

    const settledResults = await Promise.all(fetchPromises);
    setMapDisplayData(settledResults.filter(r => r !== null) as MapProvinceDisplayData[]);
    setIsLoadingMap(false);

    const successfulPredictions = settledResults.filter(r => r && r.probability !== undefined);
    if (successfulPredictions.length === 0 && ALL_PREDICTABLE_PROVINCES.length > 0) {
        setError("Gagal mengambil data prediksi. Pastikan backend berjalan dan dapat diakses.");
    }
  }, []); 

  useEffect(() => {
    fetchAllPredictionsForMap();
  }, [fetchAllPredictionsForMap]);

  const handleProvincePinClick = (provinceName: string) => {
    const data = mapDisplayData.find(p => p.name === provinceName);
    
    setSelectedPrediction(null);
    setError(null);

    if (data) {
        if (data.probability !== undefined && data.prediction !== undefined) {
            setSelectedPrediction({
                Provinsi: data.name,
                Probabilitas_Gempa_30_Hari: data.probability,
                Prediksi_Gempa: data.prediction,
                Message: "Prediksi berdasarkan data historis terakhir."
            });
        } else {
            setError(`Data prediksi detail untuk ${provinceName} belum tersedia atau gagal dimuat sebelumnya.`);
        }
    } else {
        setError(`Informasi koordinat untuk ${provinceName} tidak ditemukan.`);
    }
  };

  return (
    <main className="flex flex-col items-center min-h-screen p-4 bg-gray-100 md:p-8">
      <div className="w-full max-w-5xl text-center">
        <h1 className="mb-3 text-3xl font-bold text-orange-600 md:text-4xl">
          Peta Probabilitas Gempa Indonesia
        </h1>
        <p className="mb-6 text-gray-700 text-md md:text-lg">
          Klik pin pada provinsi untuk melihat detail prediksi. Warna dan ukuran pin menunjukkan potensi gempa.
        </p>
        <button
            onClick={fetchAllPredictionsForMap}
            disabled={isLoadingMap}
            className="px-4 py-2 mb-6 text-white transition-colors bg-blue-500 rounded hover:bg-blue-600 disabled:bg-gray-300"
        >
            {isLoadingMap ? 'Memuat Peta...' : 'Segarkan Data Peta'}
        </button>

        <div className="p-1 mb-8 bg-gray-200 border border-gray-300 rounded-lg shadow-xl w-full h-auto md:aspect-[16/9] md:max-h-[70vh]">
          {isLoadingMap && (
            <div className="flex items-center justify-center w-full h-full min-h-[300px] md:min-h-[400px]">
                <p className="text-orange-500">Memuat data peta...</p>
            </div>
          )}
          {!isLoadingMap && mapDisplayData.length === 0 && !error && (
            <div className="relative flex items-center justify-center w-full h-full min-h-[300px] md:min-h-[400px]">
                <Image src={mapImageUrl} alt="Peta Indonesia Dasar" layout="fill" objectFit="contain" priority />
                <p className="absolute z-10 p-2 text-gray-500 bg-white bg-opacity-75 rounded">
                    Tidak ada data prediksi pin.
                </p>
            </div>
          )}
           {!isLoadingMap && error && mapDisplayData.every(p => p.probability === undefined) && (
            <div className="relative flex items-center justify-center w-full h-full min-h-[300px] md:min-h-[400px]">
                <Image src={mapImageUrl} alt="Peta Indonesia Dasar" layout="fill" objectFit="contain" priority />
                 <p className="absolute z-10 p-2 text-red-500 bg-white bg-opacity-75 rounded">
                    Gagal memuat data pin.
                </p>
            </div>
          )}
          {!isLoadingMap && mapDisplayData.some(p => p.probability !== undefined) && ( // Tampilkan peta jika setidaknya ada 1 prediksi
            <IndonesiaMapWithPinsWithNoSSR
                provincesDataForPins={mapDisplayData}
                onProvinceClick={handleProvincePinClick}
                mapImageUrl={mapImageUrl}
            />
          )}
        </div>
        
        {error && !selectedPrediction && (
          <div className="max-w-md p-4 mx-auto mt-4 text-red-700 bg-red-100 border border-red-300 rounded-md">
            <h2 className="text-lg font-bold">Error</h2>
            <p>{error}</p>
          </div>
        )}

        {selectedPrediction && (
          <div className="max-w-md p-6 mx-auto mt-4 bg-white border border-gray-200 rounded-lg shadow-xl animate-fadeIn">
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
                : 'KURANG BERPOTENSI TERJADI GEMPA'}
            </p>
            <p className="text-gray-600">
              Probabilitas (30 hari ke depan): 
              <span className="ml-1 font-medium">
                {(selectedPrediction.Probabilitas_Gempa_30_Hari * 100).toFixed(2)}%
              </span>
            </p>
            {selectedPrediction.Message && (
              <p className="mt-2 text-xs text-gray-500">{selectedPrediction.Message}</p>
            )}
          </div>
        )}

        {!selectedPrediction && !isLoadingMap && !error && (
            <p className="mt-4 text-gray-600">Pilih pin pada peta untuk melihat detail prediksi provinsi.</p>
        )}
      </div>
    </main>
  );
}