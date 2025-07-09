// components/leaf/PopupContent.tsx
'use client';

import React, { useState, useEffect } from 'react';
// Pastikan path impor ini benar sesuai struktur Anda
import { LocationData } from './EarthquakeMap';

interface PopupContentProps {
  location: LocationData;
}

const PopupContent: React.FC<PopupContentProps> = ({ location }) => {
  const [prediction, setPrediction] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrediction = async () => {
      setIsLoading(true);
      setError(null);
      setPrediction(null);

      try {
        const response = await fetch('http://localhost:5000/predict_lstm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provinsi: location.provinceName }),
        });

        const data = await response.json(); // Ambil respons JSON

        if (!response.ok) {
           // Jika respons tidak OK, coba ambil pesan error dari JSON jika ada
           throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }

        // -----> PERUBAHAN DI SINI <-----
        // Cek apakah data ada dan memiliki key "Probabilitas_Gempa_30_Hari"
        if (data && typeof data.Probabilitas_Gempa_30_Hari === 'number') {
            // Gunakan key yang benar dari Flask
            setPrediction(data.Probabilitas_Gempa_30_Hari);
        } else {
            // Jika key tidak ditemukan atau bukan angka
            throw new Error('Format respons tidak valid atau kunci probabilitas tidak ditemukan.');
        }

      } catch (err: any) {
        setError(err.message || 'Gagal memuat prediksi.');
        setPrediction(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrediction();
  }, [location.provinceName]);

  return (
    <div className="p-2 min-w-[150px]">
      <h3 className="mb-2 text-lg font-bold">{location.name}</h3>
      <div className="text-sm">
        {isLoading && <p>Memuat prediksi...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {prediction !== null && !isLoading && (
          <p>
            Probabilitas Gempa:
            <span className="ml-1 font-semibold">
              {(prediction * 100).toFixed(0)}%
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default PopupContent;