// app/components/leaf/EarthquakeMap.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { poppins } from "@/app/styles/font";
import PopupContent from './popo';
import Legend from '@/app/components/ui/legend';

// ... (Interface LocationData & getMarkerColor) ...
export interface LocationData {
  id: number | string;
  name: string;
  lat: number;
  lng: number;
  provinceName: string;
  mag?: number;
}

const getMarkerColor = (magnitude: number | undefined): string => {
  if (magnitude === undefined) return '#808080';
  if (magnitude < 2.5) return 'green';
  if (magnitude < 3.5) return 'yellow';
  if (magnitude < 4.5) return 'orange';
  return 'red';
};
// --------------------------------------------------

const EarthquakeMap: React.FC = () => {
  const position: LatLngExpression = [-2.5, 118];
  const [apiLocations, setApiLocations] = useState<LocationData[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocations = async () => {
      setMapError(null);
      try {
        const response = await fetch('http://localhost:5000/katalog?limit=50');
        if (!response.ok) {
          throw new Error(`Gagal memuat data lokasi: ${response.statusText}`);
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
            throw new Error("Format data API tidak sesuai (bukan array).");
        }
        const mappedLocations: LocationData[] = data
            .filter((item: any) => item.provinsi && item.lat && (item.lon || item.lng))
            .map((item: any, index: number): LocationData | null => {
                const lat = parseFloat(item.lat);
                const lng = parseFloat(item.lon || item.lng);
                if (isNaN(lat) || isNaN(lng)) { return null; }
                return {
                    id: item.id || `${item.tgl}-${index}`,
                    name: `Gempa ${item.provinsi} (Mag: ${item.mag || 'N/A'})`,
                    lat: lat,
                    lng: lng,
                    provinceName: item.provinsi, // Tidak perlu || 'Tidak Diketahui' lagi
                    mag: item.mag ? parseFloat(item.mag) : undefined,
                };
            }).filter((item): item is LocationData => item !== null);
        setApiLocations(mappedLocations);
      } catch (error: any) {
        console.error("Error fetching locations:", error);
        setMapError(error.message || "Tidak dapat memuat data lokasi.");
        setApiLocations([]);
      }
    };
    fetchLocations();
  }, []);

  return (
    <div className={`${poppins.className} relative w-full h-full`}> {/* Pastikan ini w-full h-full */}
      <MapContainer
        center={position}
        zoom={5}
        scrollWheelZoom={true}
        className="z-0 w-full h-full"
      >
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
            radius={7}
            pathOptions={{
              color: 'black',
              weight: 1,
              fillColor: getMarkerColor(loc.mag),
              fillOpacity: 0.8,
            }}
          >
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