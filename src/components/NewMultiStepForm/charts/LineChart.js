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
//                   borderColor: '#4CAF50',
//                   backgroundColor: 'rgba(76, 175, 80, 0.2)',
//                   fill: true,
//                   tension: 0.4,
//                 },
//               ],
//             }}
//             options={{
//               responsive: true,
//               plugins: {
//                 legend: { display: true },
//                 tooltip: { enabled: true },
//               },
//               scales: {
//                 x: { title: { display: true, text: 'Years' } },
//                 y: { title: { display: true, text: 'Value' } },
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
//           backgroundColor: '#fff',
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

/////////////////////////////////////////////////////////////////////////////////////////////////////


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
//                   pointBorderColor:"#fff",
//                   pointBorderWidth:1,
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


/////////////////////////////////////////////////////////////////////////
// import React, { useEffect } from 'react';
// import { Chart, registerables } from 'chart.js';
// import html2canvas from 'html2canvas';

// Chart.register(...registerables);

// // ✅ Shadow Plugin for Depth Effect
// const shadowPlugin = {
//   id: 'shadowPlugin',
//   beforeDraw: (chart) => {
//     const ctx = chart.ctx;
//     ctx.save();
//     ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
//     ctx.shadowBlur = 10;
//     ctx.shadowOffsetX = 4;
//     ctx.shadowOffsetY = 4;
//   },
//   afterDraw: (chart) => {
//     const ctx = chart.ctx;
//     ctx.restore(); // ✅ Reset shadow settings after draw
//   }
// };

// Chart.register(shadowPlugin);

// const LineChart = ({ labels = [], values = [], onBase64Generated }) => {
//   useEffect(() => {
//     let mounted = true;

//     const generateChart = async () => {
//       if (labels.length > 0 && values.length > 0) {
//         console.log("✅ Generating DSCR Chart...");

//         // ✅ Create a canvas dynamically
//         const canvas = document.createElement('canvas');
//         canvas.width = 500;
//         canvas.height = 400;
//         const ctx = canvas.getContext('2d');
//         canvas.style.backgroundColor = '#000000'; 

//         // ✅ Append the canvas to the DOM (for html2canvas to work)
//         document.body.appendChild(canvas);

//         // ✅ Ensure existing chart instance is destroyed
//         if (Chart.getChart(ctx)) {
//           Chart.getChart(ctx).destroy();
//         }

//         // ✅ Create gradient for better look
//         const gradient = ctx.createLinearGradient(0, 0, 0, 400);
//         gradient.addColorStop(0, 'rgba(74, 144, 226, 0.5)');
//         gradient.addColorStop(1, 'rgba(74, 144, 226, 0.1)');

//          // ✅ Calculate Y-axis range based on last year's value
//          const lastYearValue = values[values.length - 1] || 0;
//          const maxYValue = lastYearValue + lastYearValue * 0.5;
//          const yInterval = Math.round(maxYValue / 4);

//         // ✅ Create Chart Instance
//         new Chart(ctx, {
//           type: 'line',
//           data: {
//             labels,
//             datasets: [
//               {
//                 label: 'DSCR',
//                 data: values,
//                 borderColor: '#4A90E2',
//                 backgroundColor: gradient,
//                 borderWidth: 3,
//                 tension: 0.4,
//                 pointBackgroundColor: '#4A90E2',
//                 pointBorderColor: '#FFFFFF',
//                 pointBorderWidth: 2,
//                 pointRadius: 6,
//                 pointHoverRadius: 8,
//                 fill: true
//               }
//             ]
//           },
//           options: {
//             responsive: false,
//             maintainAspectRatio: false,
//             backgroundColor: '#000000',
//             plugins: {
//               legend: {
//                 display: true,
//                 position: 'top',
//                 labels: {
//                   color: '#000',
//                   padding: 16,
//                   font: {
//                     size: 14,
//                     weight: 'bold'
//                   }
//                 }
//               },
//               tooltip: {
//                 enabled: true
//               }
//             },
//             scales: {
//               x: {
//                 title: {
//                   display: true,
//                   text: 'Years',
//                   color: '#000',
//                   font: {
//                     size: 14,
//                     weight: 'bold'
//                   }
//                 },
//                 ticks: {
//                   color: '#000',
//                   stepSize: 1,
//                   maxTicksLimit: labels.length
//                 },
//                 grid: {
//                   color: 'rgba(0, 0, 0, 0.1)'
//                 }
//               },
//               y: {
//                 title: {
//                   display: true,
//                   text: 'Value',
//                   color: '#000',
//                   font: {
//                     size: 14,
//                     weight: 'bold'
//                   }
//                 },
//                 ticks: {
//                   ticks: {
//                   color: '#FFFFFF', // ✅ White y-axis values
//                   stepSize: yInterval, // ✅ Divide into 4 equal parts
//                   callback: (value) => value.toLocaleString()
//                 },
//                 },
//                 grid: {
//                   color: 'rgba(0, 0, 0, 0.1)'
//                 }
//               }
//             },
           
//           }
//         });

//         // ✅ Allow time for rendering to complete
//         await new Promise((resolve) => setTimeout(resolve, 200));

//         try {
//           console.log("✅ Capturing chart with html2canvas...");

//           // ✅ Capture chart using html2canvas
//           const canvasImage = await html2canvas(canvas, {
//             scale: 2,
//             useCORS: true,
//              backgroundColor: '#000000'
//           });

//           // ✅ Convert to base64
//           const base64Image = canvasImage.toDataURL('image/png');
//           console.log('✅ DSCR Chart Base64:', base64Image);

//           // ✅ Pass Base64 to parent component
//           if (mounted && onBase64Generated) {
//             onBase64Generated(base64Image);
//           }
//         } catch (error) {
//           console.error("❌ Error capturing chart:", error);
//         } finally {
//           // ✅ Cleanup: remove the canvas from DOM
//           document.body.removeChild(canvas);
//         }
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


//////////////////////////////////////////////////////////////////////////////////////////
import React, { useEffect } from 'react';
import { Chart, registerables } from 'chart.js';
import html2canvas from 'html2canvas';
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.register(...registerables);

const LineChart = ({ labels = [], values = [], onBase64Generated }) => {
  useEffect(() => {
    let mounted = true;

    const generateChart = async () => {
      if (labels.length > 0 && values.length > 0) {
        console.log("✅ Generating DSCR Chart...");

        // ✅ Create a canvas dynamically
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 500;
        canvas.style.backgroundColor = '#000000'; // ✅ Black background
        const ctx = canvas.getContext('2d');

        // ✅ Append to DOM for html2canvas to work
        document.body.appendChild(canvas);

        // ✅ Ensure existing chart instance is destroyed
        if (Chart.getChart(ctx)) {
          Chart.getChart(ctx).destroy();
        }

        // ✅ Create gradient for line chart
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(74, 144, 226, 0.5)');
        gradient.addColorStop(1, 'rgba(74, 144, 226, 0.1)');

        console.log("values in line chart.js ", values)
        // ✅ Calculate Y-axis range based on last year's value
        const lastYearValue = values[values.length - 1] || 0;
        let maxYValue = lastYearValue + lastYearValue * 0.5; // ✅ Max = last value + 50%
        const yInterval = Number((maxYValue / 4).toFixed(2)); // ✅ Divide into 4 equal parts with decimals
        

        console.log('✅ Last Year Value:', lastYearValue);
        console.log('✅ Max Y Value:', maxYValue);
        console.log('✅ Y Interval:', yInterval);

        Chart.defaults.font.family = 'Times New Roman';

        // ✅ Create Chart Instance
        new Chart(ctx, {
          type: 'line',
          data: {
            labels,
            datasets: [
              {
                
                data: values,
                borderColor: '#4A90E2', // ✅ Blue line color
                backgroundColor: gradient,
                borderWidth: 3,
                tension: 0.4,
                pointBackgroundColor: 'rgba(255, 205, 86, 0.5)',
                pointBorderColor: 'rgb(255, 205, 86)',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8,
                fill: true
              }
            ]
          },
          options: {
            responsive: false,
            maintainAspectRatio: false,
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'Years',
                  color: '#FFFFFF', // ✅ White x-axis label
                  font: {
                    size: 10,
                    weight: 'bold'
                  }
                },
                ticks: {
                  color: '#FFFFFF', // ✅ White x-axis ticks
                  stepSize: 1,
                  maxTicksLimit: labels.length
                },
                grid: {
                  color: 'rgba(255, 255, 255, 0.1)', // ✅ Light white gridlines
                  drawBorder: true // ✅ Ensure border is drawn
                }
              },
              y: {
                beginAtZero: true,
                min: 0,
                max: Number(maxYValue.toFixed(2)),
                title: {
                  display: true,
                  text: 'Value',
                  color: '#FFFFFF', // ✅ White y-axis label
                  font: {
                    size: 10,
                    weight: 'bold'
                  }
                },
                ticks: {
                  color: '#FFFFFF', // ✅ White y-axis ticks
                  stepSize: yInterval, // ✅ Divide into 4 equal parts
                  callback: (value) => value.toFixed(2)
                },
                grid: {
                  color: 'rgba(255, 255, 255, 0.1)', // ✅ Light white gridlines
                  drawBorder: true
                },
                
              }
            },
            plugins: {
              legend: {
                display: true,
                position: 'top',
                labels: {
                  color: '#FFFFFF', // ✅ White legend text
                  padding: 10,
                  font: {
                    size: 10,
                    weight: 'bold'
                  }
                }
              },
              tooltip: {
                enabled: true
              },
              // datalabels: {
              //   display: true, // Show data labels
              //   color: '#FFFFFF', // White color for the labels
              //   font: { size: 12, weight: 'bold' },
              //   formatter: (value) => value.toFixed(2), // Show value with decimals
              //   align: 'top',
              //   anchor: 'end',
              //   offset: 8,  // Adjust offset to prevent overlap
              //   // Position data labels at each point
              //   padding: 5, // Padding from point
              //   clip: true // Prevent overlap outside chart area
              // }
            }
          }
        });

        // ✅ Allow time for rendering to complete
        await new Promise((resolve) => setTimeout(resolve, 200));

        try {
          console.log("✅ Capturing chart with html2canvas...");

          // ✅ Capture chart using html2canvas
          const canvasImage = await html2canvas(canvas, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#000000' // ✅ Set background for capture
          });

          // ✅ Convert to base64
          const base64Image = canvasImage.toDataURL('image/png');
          console.log('✅ DSCR Chart Base64:', base64Image);

          // ✅ Pass Base64 to parent component
          if (mounted && onBase64Generated) {
            onBase64Generated(base64Image);
          }
        } catch (error) {
          console.error("❌ Error capturing chart:", error);
        } finally {
          // ✅ Cleanup: remove canvas from DOM
          document.body.removeChild(canvas);
        }
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
