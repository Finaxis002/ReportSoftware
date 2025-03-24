import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register the chart components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const DSCRChart = () => {
  const data = {
    labels: ['1', '2', '3', '4', '5', '6', '7', '8'], // Years
    datasets: [
      {
        label: 'DSCR',
        data: [0, 1.27, 1.46, 1.71, 2.01, 2.41, 2.92, 3.58], // DSCR values
        borderColor: '#4e90f7', // Line color
        backgroundColor: '#4e90f7',
        fill: false,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: '#4e90f7',
        pointBorderColor: '#ffffff',
        tension: 0.4, // Smooth curve
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false, // Hide legend
      },
      title: {
        display: true,
        text: 'DSCR',
        color: '#ffffff',
        font: {
          size: 20,
        },
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#ffffff',
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: '#ffffff',
          stepSize: 0.5,
        },
        grid: {
          color: '#444444',
        },
      },
    },
  };

  return (
    <div style={{ backgroundColor: '#2c2c2c', padding: '20px', borderRadius: '10px' }}>
      <Line data={data} options={options} />
    </div>
  );
};

export default DSCRChart;
