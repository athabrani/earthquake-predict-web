// app/components/leaf/Legend.tsx
'use client';

import React from 'react';

// Definisikan rentang dan warna sesuai dengan fungsi getMarkerColor Anda
const legendData = [
  { color: 'green', label: '< 2.5' },
  { color: 'yellow', label: '2.5 - 3.4' },
  { color: 'orange', label: '3.5 - 4.4' },
  { color: 'red', label: '≥ 4.5' },
  { color: '#808080', label: 'N/A (Tanpa Mag)' }
];

const Legend: React.FC = () => {
  return (
    // Container legenda: posisi absolut, pojok kanan bawah, z-index tinggi
    // bg-white/80 memberikan latar putih dengan sedikit transparansi
    // p-4 (padding), rounded (sudut membulat), shadow-lg (bayangan)
    <div className="absolute bottom-5 right-5 z-[1000] p-4 bg-white/80 rounded shadow-lg">
      <h4 className="mb-2 text-sm font-bold text-center text-gray-800">Legenda Magnitudo</h4>
      <div className="flex flex-col space-y-1">
        {legendData.map((item) => (
          <div key={item.label} className="flex items-center">
            {/* Kotak warna */}
            <span
              className="inline-block w-4 h-4 mr-2 border border-gray-400"
              style={{ backgroundColor: item.color }}
            ></span>
            {/* Teks label */}
            <span className="text-xs text-gray-700">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Legend;