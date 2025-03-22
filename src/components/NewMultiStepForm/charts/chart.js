import React from 'react';
import ReactDOM from 'react-dom/client';
import { Chart, registerables, ArcElement, Tooltip, Legend } from 'chart.js';
import html2canvas from 'html2canvas';
import LineChart from './LineChart';

// ✅ Register controllers and elements
Chart.register(...registerables,ArcElement, Tooltip, Legend);

export const generateChart = async (data) => {
  try {
    // Create a hidden canvas for chart rendering
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    const backgroundColors = [
        '#7CB9E8', 
        '#00308F',
        '#72A0C1', 
        '#0066b2',
        '#89CFF0', 
        '#318CE7', 
      ];

    const borderColors = backgroundColors.map(color =>
        color.replace('0.8', '1')
      );
    // ✅ Destroy previous chart instance if any
    if (Chart.getChart(ctx)) {
      Chart.getChart(ctx).destroy();
    }

    // ✅ Create Pie Chart
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: data.labels,
        datasets: [{
          data: data.values,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1, // Creates the "3D" depth
          hoverOffset: 8,
        }]
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
          },
          title: {
            display: true,
            text: 'Direct Expense Break up',
            font: { size: 16, weight: 'bold' }
          },
          tooltip: {
            enabled: true,
          }
          
        },
        animation: {
            animateRotate: true,
            animateScale: true
          }
      }
    });

    // ✅ Wait for chart rendering to finish
    await new Promise((resolve) => setTimeout(resolve, 100));

    // ✅ Convert canvas to Base64 using `toDataURL`
    const base64 = canvas.toDataURL('image/png');
    console.log("✅ Pie Chart generated:", base64);
    return base64;
  } catch (error) {
    console.error("❌ Error generating pie chart:", error);
    return null;
  }
};


// export const generateLineChart = async ({ labels, values }) => {
//   console.log("🚀 Generating Line Chart with labels:", labels);
//   console.log("🚀 Generating Line Chart with values:", values);

//   // ✅ Create container for rendering
//   const chartContainer = document.createElement('div');
//   chartContainer.style.width = '400px';
//   chartContainer.style.height = '300px';
//   chartContainer.style.position = 'fixed';
//   chartContainer.style.left = '-9999px'; // Hide off-screen
//   document.body.appendChild(chartContainer);

//   // ✅ Destroy any existing chart instance
//   if (chartContainer.chart) {
//     chartContainer.chart.destroy();
//   }

//   // ✅ Create and render chart using ReactDOM
//   const root = ReactDOM.createRoot(chartContainer);
//   root.render(
//     <Line
//       data={{
//         labels,
//         datasets: [
//           {
//             label: 'DSCR',
//             data: values,
//             borderColor: '#4CAF50',
//             backgroundColor: 'rgba(76, 175, 80, 0.2)',
//             fill: true,
//             tension: 0.4,
//           },
//         ],
//       }}
//       options={{
//         responsive: true,
//         plugins: {
//           legend: { display: true },
//           tooltip: { enabled: true },
//         },
//         scales: {
//           x: { title: { display: true, text: 'Years' } },
//           y: { title: { display: true, text: 'Value' } },
//         },
//       }}
//     />
//   );

//   // ✅ Allow chart to render before capturing
//   await new Promise(resolve => setTimeout(resolve, 500));

//   // ✅ Capture using html2canvas
//   const canvas = await html2canvas(chartContainer, {
//     scale: 2,
//     useCORS: true,
//     backgroundColor: '#fff',
//   });

//   // ✅ Convert to base64
//   const base64Image = canvas.toDataURL('image/png');

//   // ✅ Clean up
//   document.body.removeChild(chartContainer);
//   root.unmount();

//   console.log("✅ Line Chart Base64 generated:", base64Image);

//   return base64Image;
// };










