// components/leaf/EarthquakeMap.tsx
'use client';

import React, { useState, useEffect } from 'react'; // <-- Tambahkan useState, useEffect
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import PopupContent from './PopupContent';
import Legend from '../../ui/legend';

// --- Interface (Tetap Sama) ---
// Kita akan memetakan data API ke interface ini
export interface LocationData {
  id: number | string; // ID bisa berupa angka atau string unik
  name: string;
  lat: number;
  lng: number;
  provinceName: string;
  mag?: number;
}

// --- Custom Icon (Tetap Sama) ---
const getMarkerColor = (magnitude: number | undefined): string => {
  if (magnitude === undefined) return '#808080'; // Abu-abu untuk data tanpa mag
  if (magnitude < 2.5) return 'green';    // Hijau untuk gempa kecil
  if (magnitude < 3.5) return 'yellow';   // Kuning untuk gempa sedang
  if (magnitude < 4.5) return 'orange';   // Oranye untuk gempa kuat
  return 'red';                        // Merah untuk gempa sangat kuat
};


// --- Komponen Peta Utama (Dimodifikasi) ---
const EarthquakeMap: React.FC = () => {
  const position: LatLngExpression = [-2.5, 118];

  // --- State untuk menyimpan data lokasi dari API ---
  const [apiLocations, setApiLocations] = useState<LocationData[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);

  // --- useEffect untuk mengambil data saat komponen dimuat ---
  useEffect(() => {
    const fetchLocations = async () => {
      setMapError(null); // Reset error
      try {
        // Panggil API /katalog (ambil 50 data terbaru)
        const response = await fetch('http://localhost:5000/katalog?limit=50');

        if (!response.ok) {
          throw new Error(`Gagal memuat data lokasi: ${response.statusText}`);
        }

        const data = await response.json();

        // Pastikan respons adalah array
        if (!Array.isArray(data)) {
            throw new Error("Format data API tidak sesuai (bukan array).");
        }

        // Petakan data API ke format LocationData
      const mappedLocations: LocationData[] = data
            .filter((item: any) => item.provinsi && item.lat && (item.lon || item.lng))
       
            .map((item: any, index: number): LocationData | null => {

                const lat = parseFloat(item.lat);
                const lng = parseFloat(item.lon || item.lng);

                if (isNaN(lat) || isNaN(lng)) {
                    return null;
                }

               return {
                    id: item.id || `${item.tgl}-${index}`,
                    name: `Gempa ${item.provinsi} (Mag: ${item.mag || 'N/A'})`,
                    lat: lat,
                    lng: lng,
                    provinceName: item.provinsi, // Tidak perlu || 'Tidak Diketahui' lagi
                    mag: item.mag ? parseFloat(item.mag) : undefined,
                };
            })

            .filter((item): item is LocationData => item !== null);
   


        setApiLocations(mappedLocations);

      } catch (error: any) {
        console.error("Error fetching locations:", error);
        setMapError(error.message || "Tidak dapat memuat data lokasi.");
        setApiLocations([]); // Kosongkan jika error
      }
    };

    fetchLocations();
  }, []); // Array dependensi kosong berarti hanya dijalankan sekali saat mount

  return (
    <div className="relative w-full h-screen">
      <MapContainer
        center={position}
        zoom={5}
        scrollWheelZoom={true}
        className="relative z-0 w-full h-screen" // Tambahkan 'relative' jika perlu overlay
      >
        {/* Tampilkan pesan error jika ada */}
        {mapError && (
            <div className="absolute top-5 left-1/2 transform -translate-x-1/2 z-[1000] p-3 bg-red-600 text-white rounded shadow-lg">
                Error: {mapError}
            </div>
        )}

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {apiLocations.map((loc) => (
        <CircleMarker
          key={loc.id}
          center={[loc.lat, loc.lng]}
          radius={7} // Ukuran lingkaran dalam pixel (sesuaikan)
          // Opsi untuk styling (warna, dll)
          pathOptions={{
            color: 'black', // Warna garis tepi
            weight: 1,       // Ketebalan garis tepi
            fillColor: getMarkerColor(loc.mag), // Warna isian dari fungsi kita
            fillOpacity: 0.8, // Opasitas isian (0 - 1)
          }}
        >
          {/* Popup tetap bisa digunakan di dalam CircleMarker */}
          <Popup>
            <PopupContent location={loc} />
          </Popup>
        </CircleMarker>
        ))}
      </MapContainer>
      <Legend />
    </div>
  );
};

export default EarthquakeMap;