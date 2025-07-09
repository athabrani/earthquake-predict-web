// app/map.tsx (atau app/components/IndonesiaMapWithPins.tsx)
'use client';

import React from 'react';
import Image from 'next/image';

interface ProvinceData {
  id: string;
  name: string;
  lat: number; // Koordinat latitude asli
  lon: number; // Koordinat longitude asli
  probability?: number;
  prediction?: number;
}

interface MapPinProps {
  id: string;
  name: string;
  // Koordinat x dan y dalam persentase (0-100) relatif terhadap gambar
  xPercent: number;
  yPercent: number;
  onClick: (provinceName: string) => void;
  probability?: number;
  prediction?: number;
}

const MapPin: React.FC<MapPinProps> = ({ id, name, xPercent, yPercent, onClick, probability, prediction }) => {
  let fillColor = "fill-gray-500 hover:fill-orange-500 opacity-70 hover:opacity-90";
  let pinRadius = "1.5%"; // Radius pin default

  if (probability !== undefined) {
    pinRadius = `${1 + probability * 2}%`; // Ukuran pin berdasarkan probabilitas
    if (prediction === 1 && probability >= 0.5) {
      fillColor = "fill-red-600 hover:fill-red-700 opacity-80 hover:opacity-100";
    } else if (prediction === 0 && probability < 0.5) {
      fillColor = "fill-green-600 hover:fill-green-700 opacity-80 hover:opacity-100";
    } else { // Gradasi berdasarkan probabilitas jika prediksi tidak jelas atau tidak ada
      if (probability >= 0.7) fillColor = "fill-red-700 hover:fill-red-800 opacity-80 hover:opacity-100";
      else if (probability >= 0.5) fillColor = "fill-orange-500 hover:fill-orange-600 opacity-80 hover:opacity-100";
      else if (probability >= 0.3) fillColor = "fill-yellow-400 hover:fill-yellow-500 opacity-80 hover:opacity-100";
      else fillColor = "fill-green-400 hover:fill-green-500 opacity-70 hover:opacity-90";
    }
  }

  return (
    <circle
      id={id}
      cx={`${xPercent}%`}
      cy={`${yPercent}%`}
      r={pinRadius}
      className={`cursor-pointer stroke-white stroke-[0.3px] transition-all transform hover:scale-110 ${fillColor}`}
      onClick={() => onClick(name)}
    >
      <title>{name}{probability !== undefined ? ` (${(probability * 100).toFixed(1)}%)` : ''}</title>
    </circle>
  );
};

interface IndonesiaMapProps {
  provincesDataForPins: Array<ProvinceData & { xPercent: number; yPercent: number }>;
  onProvinceClick: (provinceName: string) => void;
  mapImageUrl: string;
}

const IndonesiaMapWithPins: React.FC<IndonesiaMapProps> = ({
  provincesDataForPins,
  onProvinceClick,
  mapImageUrl
}) => {
  if (typeof window === 'undefined') {
    // Jangan render di sisi server
    return <div className="relative w-full aspect-[16/9] bg-gray-200 animate-pulse"></div>;
  }

  return (
    <div className="relative w-full aspect-[16/9] overflow-hidden rounded-md shadow-lg">
      <Image
        src={mapImageUrl}
        alt="Peta Indonesia dengan sebaran gempa"
        layout="fill"
        objectFit="contain" // atau 'cover' / 'contain' sesuai kebutuhan
        priority
      />
      {/* SVG Overlay untuk Pins */}
      <svg
        viewBox="0 0 100 100" // Gunakan viewBox berbasis persentase
        className="absolute top-0 left-0 w-full h-full"
        preserveAspectRatio="xMidYMid slice" // Ini akan memastikan SVG mengisi div tanpa distorsi, mungkin memotong bagian
      >
        {provincesDataForPins.map(province => {
          if (province.xPercent === undefined || province.yPercent === undefined) return null; // Lewati jika koordinat tidak ada
          return (
            <MapPin
              key={province.id}
              id={province.id}
              name={province.name}
              xPercent={province.xPercent}
              yPercent={province.yPercent}
              onClick={onProvinceClick}
              probability={province.probability}
              prediction={province.prediction}
            />
          );
        })}
      </svg>
    </div>
  );
};

export default IndonesiaMapWithPins;