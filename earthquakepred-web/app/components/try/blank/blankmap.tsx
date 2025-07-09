// components/IndonesiaMapWithPins.tsx
import React from 'react';

interface ProvincePinProps {
  id: string;
  name: string;
  cx: number; // Koordinat x untuk pusat lingkaran (pin)
  cy: number; // Koordinat y untuk pusat lingkaran (pin)
  onClick: (provinceName: string) => void;
  probability?: number; // Probabilitas gempa (opsional, untuk pewarnaan)
  prediction?: number; // Prediksi gempa (opsional, untuk pewarnaan)
}

const ProvincePin: React.FC<ProvincePinProps> = ({ id, name, cx, cy, onClick, probability, prediction }) => {
  let fillColor = "fill-gray-400 hover:fill-orange-500"; // Warna default
  if (prediction === 1 && probability && probability >= 0.5) {
    fillColor = "fill-red-500 hover:fill-red-700"; // Berpotensi gempa (merah)
  } else if (prediction === 0 && probability && probability < 0.5) {
    fillColor = "fill-green-500 hover:fill-green-700"; // Tidak berpotensi (hijau)
  } else if (probability) { // Jika hanya ada probabilitas, gradasi berdasarkan itu
    if (probability >= 0.7) fillColor = "fill-red-500 hover:fill-red-700";
    else if (probability >= 0.4) fillColor = "fill-yellow-500 hover:fill-yellow-700";
    else fillColor = "fill-green-500 hover:fill-green-700";
  }


  return (
    <circle
      id={id}
      cx={cx}
      cy={cy}
      r="5" // Radius pin
      className={`cursor-pointer stroke-white stroke-1 transition-colors ${fillColor}`}
      onClick={() => onClick(name)}
    >
      <title>{name}{probability ? ` (${(probability * 100).toFixed(1)}%)` : ''}</title>
    </circle>
  );
};

interface IndonesiaMapWithPinsProps {
  onProvinceClick: (provinceName: string) => void;
  predictionsData: Array<{ // Data prediksi untuk pewarnaan pin
    Provinsi: string;
    Probabilitas_Gempa_30_Hari: number;
    Prediksi_Gempa: number;
  }>;
}

const IndonesiaMapWithPins: React.FC<IndonesiaMapWithPinsProps> = ({ onProvinceClick, predictionsData }) => {
  // KOORDINAT (cx, cy) INI HANYA PERKIRAAN DAN PERLU DISESUAIKAN
  // dengan posisi geografis relatif provinsi pada SVG viewBox Anda.
  // Anda perlu menyesuaikan viewBox dan koordinat cx, cy agar representatif.
  // Nama provinsi HARUS SAMA PERSIS dengan yang ada di backend/data training.
  const provinces = [
    { id: 'ID-AC', name: 'Aceh', cx: 30, cy: 30 },
    { id: 'ID-SU', name: 'Sumatera Utara', cx: 50, cy: 45 },
    { id: 'ID-SB', name: 'Sumatera Barat', cx: 55, cy: 65 },
    { id: 'ID-RI', name: 'Riau', cx: 70, cy: 55 },
    { id: 'ID-JA', name: 'Jambi', cx: 80, cy: 75 },
    { id: 'ID-SS', name: 'Sumatera Selatan', cx: 90, cy: 85 },
    { id: 'ID-BE', name: 'Bengkulu', cx: 75, cy: 95 },
    { id: 'ID-LA', name: 'Lampung', cx: 100, cy: 105 },
    { id: 'ID-BB', name: 'Kepulauan Bangka Belitung', cx: 115, cy: 80 },
    { id: 'ID-KR', name: 'Kepulauan Riau', cx: 100, cy: 50 },
    { id: 'ID-JK', name: 'DKI Jakarta', cx: 120, cy: 115 },
    { id: 'ID-JB', name: 'Jawa Barat', cx: 130, cy: 118 },
    { id: 'ID-JT', name: 'Jawa Tengah', cx: 145, cy: 118 },
    { id: 'ID-YO', name: 'DI Yogyakarta', cx: 148, cy: 125 },
    { id: 'ID-JI', name: 'Jawa Timur', cx: 160, cy: 122 },
    { id: 'ID-BT', name: 'Banten', cx: 115, cy: 110 },
    { id: 'ID-BA', name: 'Bali', cx: 175, cy: 130 },
    { id: 'ID-NB', name: 'Nusa Tenggara Barat', cx: 190, cy: 132 },
    { id: 'ID-NT', name: 'Nusa Tenggara Timur', cx: 220, cy: 135 },
    { id: 'ID-KB', name: 'Kalimantan Barat', cx: 140, cy: 60 },
    { id: 'ID-KT', name: 'Kalimantan Tengah', cx: 160, cy: 70 },
    { id: 'ID-KS', name: 'Kalimantan Selatan', cx: 175, cy: 85 },
    { id: 'ID-KI', name: 'Kalimantan Timur', cx: 190, cy: 65 },
    { id: 'ID-KU', name: 'Kalimantan Utara', cx: 185, cy: 45 },
    { id: 'ID-SA', name: 'Sulawesi Utara', cx: 230, cy: 40 },
    { id: 'ID-ST', name: 'Sulawesi Tengah', cx: 220, cy: 75 },
    { id: 'ID-SN', name: 'Sulawesi Selatan', cx: 215, cy: 95 },
    { id: 'ID-SG', name: 'Sulawesi Tenggara', cx: 235, cy: 98 },
    { id: 'ID-GO', name: 'Gorontalo', cx: 225, cy: 55 },
    { id: 'ID-SR', name: 'Sulawesi Barat', cx: 205, cy: 80 },
    { id: 'ID-MA', name: 'Maluku', cx: 260, cy: 90 },
    { id: 'ID-MU', name: 'Maluku Utara', cx: 270, cy: 60 },
    { id: 'ID-PA', name: 'Papua', cx: 320, cy: 100 },
    { id: 'ID-PB', name: 'Papua Barat', cx: 290, cy: 70 },
    // ... Tambahkan provinsi lain beserta perkiraan koordinat cx, cy pada viewBox Anda
  ];

  // Gambar peta dasar (misalnya, garis pantai atau batas negara jika Anda punya path SVG-nya)
  // Untuk saat ini, kita hanya akan menampilkan pin.
  // Anda bisa menambahkan path SVG untuk pulau-pulau di sini jika ada.
  // Contoh: <path d="..." className="fill-gray-200 stroke-gray-400" />

  return (
    <svg viewBox="0 0 350 160" className="w-full h-auto max-w-4xl mx-auto bg-blue-100 rounded shadow" preserveAspectRatio="xMidYMid meet">
      {/* Tambahkan path untuk pulau-pulau Indonesia di sini jika ada */}
      {/* <image href="/indonesia_base_map.svg" x="0" y="0" height="160" width="350"/>  Jika Anda punya gambar dasar */}

      {provinces.map(province => {
        const predictionData = predictionsData.find(p => p.Provinsi === province.name);
        return (
          <ProvincePin
            key={province.id}
            id={province.id}
            name={province.name}
            cx={province.cx}
            cy={province.cy}
            onClick={onProvinceClick}
            probability={predictionData?.Probabilitas_Gempa_30_Hari}
            prediction={predictionData?.Prediksi_Gempa}
          />
        );
      })}
    </svg>
  );
};

export default IndonesiaMapWithPins;