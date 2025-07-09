'use client';

import { useState, useEffect } from 'react';

// Define the structure of prediction result from LSTM
interface LSTMPredictionResult {
  Provinsi: string;
  Probabilitas_Gempa_30_Hari: number;
  Prediksi_Gempa: number;
  Message?: string; // Optional message from backend
}

// Data provinsi (ambil dari value_counts() di notebook atau sesuaikan)
// Ini hanya contoh, idealnya daftar provinsi ini dinamis atau lebih lengkap
const initialProvinces = [
  "Sulawesi Tengah", "Nusa Tenggara Timur", "Maluku", "Jawa Timur", 
  "Jawa Barat", "DKI Jakarta", "Jawa Tengah", "Maluku Utara", 
  "Nusa Tenggara Barat", "Sumatera Utara", "Lampung", "Sumatera Selatan", 
  "Bali", "Sulawesi Selatan", "Banten", "Kalimantan Utara", 
  "Sulawesi Utara", "Papua", "Kalimantan Barat", "Kepulauan Riau", 
  "Papua Barat"
  // Tambahkan provinsi lain yang ada di data training dan memiliki cukup data
];

const EarthquakePredictionLSTM = () => {
  const [selectedProvince, setSelectedProvince] = useState('');
  const [prediction, setPrediction] = useState<LSTMPredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableProvinces, setAvailableProvinces] = useState<string[]>(initialProvinces);

  // Anda bisa juga mengambil daftar provinsi dari backend jika diperlukan
  // useEffect(() => {
  //   // fetch list of provinces that have scalers and enough data from backend
  // }, []);


  const handlePredictLSTM = async () => {
    if (!selectedProvince) {
      setError('Silakan pilih provinsi terlebih dahulu.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const response = await fetch('http://localhost:5000/predict_lstm', { // Pastikan port sesuai
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provinsi: selectedProvince,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Gagal melakukan prediksi');
      }
      
      setPrediction(data);
    } catch (err: any) {
      console.error('Error fetching LSTM prediction:', err);
      setError(err.message || 'Terjadi kesalahan saat mengambil prediksi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container p-4 mx-auto">
      <h1 className="mb-2 text-2xl font-bold text-center text-orange-600">
        Prediksi Gempa (LSTM)
      </h1>
      <p className="mb-6 text-center text-gray-700 text-md">
        Prediksi probabilitas kejadian gempa dalam 30 hari ke depan berdasarkan data historis terakhir.
      </p>

      <div className="max-w-md p-6 mx-auto bg-white rounded-lg shadow-md">
        <div className="mb-4">
          <label htmlFor="province-select" className="block mb-1 text-sm font-medium text-gray-700">
            Pilih Provinsi:
          </label>
          <select
            id="province-select"
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
            className="block w-full p-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
          >
            <option value="">-- Pilih Provinsi --</option>
            {availableProvinces.sort().map((provinceName) => (
              <option key={provinceName} value={provinceName}>
                {provinceName}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-center mt-6">
          <button
            onClick={handlePredictLSTM}
            disabled={isLoading || !selectedProvince}
            className="w-full p-2 text-white bg-orange-500 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:bg-gray-300"
          >
            {isLoading ? 'Memprediksi...' : 'Prediksi Probabilitas'}
          </button>
        </div>
      </div>

      {error && (
        <div className="max-w-md p-4 mx-auto mt-6 text-center text-red-700 bg-red-100 border border-red-300 rounded-md">
          <h2 className="text-lg font-bold">Error</h2>
          <p>{error}</p>
        </div>
      )}

      {prediction && (
        <div className="max-w-md p-6 mx-auto mt-6 text-center border border-green-200 rounded-lg shadow-md bg-green-50">
          <h2 className="mb-2 text-lg font-bold text-green-700">Hasil Prediksi untuk {prediction.Provinsi}</h2>
          <p className={`text-xl font-semibold ${prediction.Prediksi_Gempa === 1 ? 'text-red-600' : 'text-green-600'}`}>
            {prediction.Prediksi_Gempa === 1 ? 'Berpotensi Terjadi Gempa' : 'Tidak Berpotensi Terjadi Gempa'}
          </p>
          <p className="mt-1 text-gray-700">
            Probabilitas Kejadian Gempa (30 hari ke depan): 
            <span className="font-medium"> {(prediction.Probabilitas_Gempa_30_Hari * 100).toFixed(2)}% </span> 
            ({prediction.Probabilitas_Gempa_30_Hari.toFixed(4)})
          </p>
          {prediction.Message && <p className="mt-2 text-sm text-gray-500">{prediction.Message}</p>}
        </div>
      )}
    </div>
  );
};

export default EarthquakePredictionLSTM;