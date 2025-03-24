import React, { useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import html2canvas from 'html2canvas';
import ReactDOM from 'react-dom/client';
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.register(...registerables, ChartDataLabels);

const LineChart = ({ labels = [], values = [], onBase64Generated }) => {
  useEffect(() => {
    let mounted = true;

    const generateChart = async () => {
      if (labels.length > 0 && values.length > 0) {
        // ✅ Create container for rendering chart
        const container = document.createElement('div');
        container.style.width = '600px'; // ✅ Increased size
        container.style.height = '400px';
        container.style.position = 'fixed';
        container.style.left = '-9999px';
        container.style.backgroundColor = '#1E1E1E'; // ✅ Dark background for better contrast
        container.style.padding = '20px';
        container.style.border = '1px solid #444';
        container.style.borderRadius = '12px'; // ✅ Rounded corners
        container.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)'; // ✅ Shadow for depth

        // ✅ Create canvas element (instead of div)
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 400;
        container.appendChild(canvas);
        document.body.appendChild(container);

        // ✅ Get canvas context for gradient
        const ctx = canvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(74, 144, 226, 0.5)'); // ✅ Soft Blue
        gradient.addColorStop(1, 'rgba(74, 144, 226, 0.1)');

        // ✅ Render chart using ReactDOM
        const root = ReactDOM.createRoot(container);
        root.render(
          <Line
            data={{
              labels,
              datasets: [
                {
                  label: 'DSCR',
                  data: values,
                  borderColor: '#4A90E2', // ✅ Soft Blue line
                  backgroundColor: gradient, // ✅ Gradient fill
                  fill: true,
                  tension: 0.4, // ✅ Smoother curve
                  pointBackgroundColor: '#FFFFFF', // ✅ White points for better contrast
                  pointRadius: 6, // ✅ Larger points
                  pointHoverRadius: 8, // ✅ Larger hover effect
                  pointBorderWidth: 2, // ✅ Point border width
                  pointBorderColor: '#4A90E2',
                  borderWidth: 3, // ✅ Thicker line
                  hoverBackgroundColor: '#4A90E2',
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: true,
                  labels: {
                    color: '#FFFFFF', // ✅ White legend text
                    padding: 20,
                    font: {
                      size: 14,
                      weight: 'bold',
                    },
                  },
                },
                tooltip: {
                  enabled: true,
                  backgroundColor: '#4A90E2',
                  bodyColor: '#FFFFFF',
                  titleColor: '#FFFFFF',
                  borderColor: '#FFFFFF',
                  borderWidth: 1,
                  padding: 12,
                  cornerRadius: 8,
                  titleFont: {
                    size: 14,
                    weight: 'bold',
                  },
                  bodyFont: {
                    size: 12,
                  },
                },
                datalabels: {
                  display: false,
                  color: '#FFFFFF', // ✅ White text for better contrast
                  align: 'top', // ✅ Align at top
                  anchor: 'center', // ✅ Center alignment
                  font: {
                    size: 12,
                    weight: 'bold',
                  },
                  formatter: (value) => value.toFixed(2), // ✅ Format to 2 decimal points
                },
              },
              scales: {
                x: {
                  title: {
                    display: true,
                    text: 'Years',
                    color: '#FFFFFF', // ✅ White axis label
                    font: {
                      size: 14,
                      weight: 'bold',
                    },
                  },
                  ticks: {
                    color: '#FFFFFF',
                    font: {
                      size: 12,
                    },
                  },
                  grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                  },
                },
                y: {
                  title: {
                    display: true,
                    text: 'Value',
                    color: '#FFFFFF',
                    font: {
                      size: 14,
                      weight: 'bold',
                    },
                  },
                  ticks: {
                    color: '#FFFFFF',
                    font: {
                      size: 12,
                    },
                  },
                  grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                  },
                },
              },
              elements: {
                line: {
                  borderWidth: 3,
                  capBezierPoints: true, // ✅ Rounded corners on line
                },
              },
            }}
          />
        );

        // ✅ Allow chart to render before capturing
        await new Promise(resolve => setTimeout(resolve, 500));

        // ✅ Capture chart using html2canvas
        const chartCanvas = await html2canvas(container, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#1E1E1E',
        });

        // ✅ Convert to base64
        const base64Image = chartCanvas.toDataURL('image/png');

        console.log("✅ Line Chart Base64:", base64Image);

        // ✅ Pass base64 to parent component only if mounted
        if (mounted && onBase64Generated) {
          onBase64Generated(base64Image);
        }

        // ✅ Cleanup
        document.body.removeChild(container);
        root.unmount();
      }
    };

    generateChart();

    return () => {
      mounted = false;
    };
  }, [labels, values, onBase64Generated]);

  return null;
};

export default LineChart;







// import React, { useEffect } from 'react';
// import { Line } from 'react-chartjs-2';
// import { Chart, registerables } from 'chart.js';
// import html2canvas from 'html2canvas';
// import ReactDOM from 'react-dom/client';

// Chart.register(...registerables);

// const LineChart = ({ labels = [], values = [], onBase64Generated }) => {
//   useEffect(() => {
//     let mounted = true;

//     const generateChart = async () => {
//       if (labels.length > 0 && values.length > 0) {
//         // ✅ Create container for rendering chart
//         const container = document.createElement('div');
//         container.style.width = '400px';
//         container.style.height = '300px';
//         container.style.position = 'fixed';
//         container.style.left = '-9999px';
//         container.style.backgroundColor = '#2D2D2D'; // ✅ Dark gray background
//         container.style.padding = '10px';
//         container.style.border = '1px solid #ccc';
//         document.body.appendChild(container);

//         // ✅ Destroy existing chart if any
//         if (container.chart) {
//           container.chart.destroy();
//         }

//         // ✅ Render chart using ReactDOM
//         const root = ReactDOM.createRoot(container);
//         root.render(
//           <Line
//             data={{
//               labels,
//               datasets: [
//                 {
//                   label: 'DSCR',
//                   data: values,
//                   borderColor: '#4A90E2', // ✅ Soft Blue
//                   backgroundColor: 'rgba(74, 144, 226, 0.2)',
//                   fill: true,
//                   tension: 0.4,
//                   pointBackgroundColor: '#4A90E2', // ✅ Blue Points
//                   pointRadius: 5, // ✅ Larger Points
//                   pointHoverRadius: 7, // ✅ Hover Effect
//                 },
//               ],
//             }}
//             options={{
//               responsive: true,
//               maintainAspectRatio: false,
//               plugins: {
//                 legend: {
//                   display: true,
//                   labels: {
//                     color: '#FFFFFF', // ✅ White legend text
//                   },
//                 },
//                 tooltip: {
//                   enabled: true,
//                 },
//               },
//               scales: {
//                 x: {
//                   title: {
//                     display: true,
//                     text: 'Years',
//                     color: '#FFFFFF', // ✅ White axis label
//                   },
//                   ticks: {
//                     color: '#FFFFFF', // ✅ White axis text
//                     stepSize: 1, // ✅ Display whole numbers like 1, 2, 3...
//                   },
//                   grid: {
//                     color: 'rgba(255, 255, 255, 0.1)', // ✅ Light gridlines
//                   },
//                 },
//                 y: {
//                   title: {
//                     display: true,
//                     text: 'Value',
//                     color: '#FFFFFF', // ✅ White axis label
//                   },
//                   ticks: {
//                     color: '#FFFFFF', // ✅ White axis text
//                   },
//                   grid: {
//                     color: 'rgba(255, 255, 255, 0.1)', // ✅ Light gridlines
//                   },
//                 },
//               },
//               elements: {
//                 line: {
//                   borderWidth: 2,
//                 },
//               },
//             }}
//           />
//         );

//         // ✅ Allow chart to render before capturing
//         await new Promise(resolve => setTimeout(resolve, 500));

//         // ✅ Capture chart using html2canvas
//         const canvas = await html2canvas(container, {
//           scale: 2,
//           useCORS: true,
//           backgroundColor: '#2D2D2D',
//         });

//         // ✅ Convert to base64
//         const base64Image = canvas.toDataURL('image/png');

//         console.log("✅ Line Chart Base64:", base64Image);

//         // ✅ Pass base64 to parent component only if mounted
//         if (mounted && onBase64Generated) {
//           onBase64Generated(base64Image);
//         }

//         // ✅ Cleanup
//         document.body.removeChild(container);
//         root.unmount();
//       }
//     };

//     generateChart();

//     return () => {
//       mounted = false;
//     };
//   }, [labels, values, onBase64Generated]);

//   return null;
// };

// export default LineChart;
