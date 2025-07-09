// app/components/HistoryChart.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Daftarkan komponen Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface QuakeData {
  provinsi: string;
  mag: number;
  // Tambahkan field lain jika perlu
}

const HistoryChart: React.FC = () => {
  const [chartData, setChartData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAndProcessData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:5000/katalog?limit=200'); // Ambil lebih banyak data untuk chart
        if (!response.ok) {
          throw new Error('Gagal memuat data untuk grafik.');
        }
        const data: QuakeData[] = await response.json();

        // Proses data: Hitung jumlah gempa per provinsi (contoh sederhana)
        const counts: { [key: string]: number } = data.reduce((acc, quake) => {
          acc[quake.provinsi] = (acc[quake.provinsi] || 0) + 1;
          return acc;
        }, {} as { [key: string]: number });

        const labels = Object.keys(counts);
        const values = Object.values(counts);

        setChartData({
          labels: labels,
          datasets: [
            {
              label: 'Jumlah Gempa per Provinsi (200 Terkini)',
              data: values,
              backgroundColor: 'rgba(54, 162, 235, 0.6)', // Biru
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1,
            },
          ],
        });

      } catch (error) {
        console.error("Error fetching chart data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndProcessData();
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Penting agar chart bisa mengisi container
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Riwayat Gempa',
      },
    },
     scales: {
        y: {
            beginAtZero: true
        }
    }
  };

  return (
    <div className="w-full h-full p-4 bg-white rounded-lg shadow-md">
      {isLoading && <p>Memuat grafik...</p>}
      {!isLoading && chartData && (
        <div style={{ position: 'relative', height: '100%', width: '100%' }}>
            <Bar options={options} data={chartData} />
        </div>
      )}
      {!isLoading && !chartData && <p>Gagal memuat data grafik.</p>}
    </div>
  );
};

export default HistoryChart;