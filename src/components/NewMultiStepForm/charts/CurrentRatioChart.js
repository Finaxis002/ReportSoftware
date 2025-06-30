import React, { useEffect } from "react";
import { Chart, registerables, ArcElement, Tooltip, Legend } from "chart.js";
import html2canvas from "html2canvas";

Chart.register(...registerables, ArcElement, Tooltip, Legend);

// ✅ Shadow Plugin for Depth Effect
const shadowPlugin = {
  id: "shadowPlugin",
  beforeDraw: (chart) => {
    const ctx = chart.ctx;
    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 4;
  },
  afterDraw: (chart) => {
    const ctx = chart.ctx;
    ctx.restore(); // ✅ Reset shadow settings after draw
  },
};

Chart.register(shadowPlugin);

const COLOR_NAME_MAP = {
  Red: "#ef4444",
  Blue: "#3b82f6",
  Green: "#22c55e",
  Purple: "#8b5cf6",
  SkyBlue: "#0ea5e9",
  Orange: "#f97316",
  Pink: "#ec4899",
  Teal: "#14b8a6",
};

function toHex(color) {
  if (!color) return "#3674b5";
  if (color.startsWith("#")) return color;
  return COLOR_NAME_MAP[color] || color;
}
function hexToRgba(hex, alpha = 1) {
  if (!hex) return `rgba(54,116,181,${alpha})`;
  if (!hex.startsWith("#")) return `rgba(54,116,181,${alpha})`;
  let h = hex.slice(1);
  if (h.length === 3)
    h = h
      .split("")
      .map((x) => x + x)
      .join("");
  const num = parseInt(h, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

const CurrentRatioChart = ({
  labels = [],
  values = [],
  onBase64Generated,
  selectedColor,
}) => {
  
  useEffect(() => {
    let mounted = true;
    // console.log("current ratio value in current ratio chart", values);
    const generateChart = async () => {
      if (labels.length > 0 && values.length > 0) {
        // ✅ Create a canvas for chart rendering
        const canvas = document.createElement("canvas");
        canvas.width = 600;
        canvas.height = 500;
        canvas.style.backgroundColor = "#ffffff";
        canvas.style.width = "300px";
        canvas.style.height = "250px";

        const ctx = canvas.getContext("2d");
        document.body.appendChild(canvas);

        // ✅ Ensure existing chart instance is destroyed
        if (Chart.getChart(ctx)) {
          Chart.getChart(ctx).destroy();
        }

        // ✅ Create Gradient Background
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        // gradient.addColorStop(0, "rgba(75, 192, 192, 0.5)");
        // gradient.addColorStop(1, "rgba(75, 192, 192, 0.2)");
        gradient.addColorStop(0, "rgba(128, 196, 233, 0.5)");
        gradient.addColorStop(1, "rgba(128, 196, 233, 0.2)");

        const lastYearValue = values[values.length - 1] || 0;
        let maxYValue = lastYearValue + lastYearValue * 0.5 + 1;
        // let maxYValue = lastYearValue + lastYearValue * 0.2;

        // maxYValue = Math.ceil(maxYValue / 0.1) * 0.1;
        // Calculate the yInterval and ensure it's a number
        let yInterval = maxYValue / 4;
        yInterval = parseFloat(yInterval.toFixed(2)); // Fix the interval calculation to have decimal points.

        maxYValue = Math.ceil(maxYValue / yInterval) * yInterval;

        Chart.defaults.font.family = "Times New Roman";

        // 👇 Add after context creation
        const hexColor = toHex(selectedColor);
        const lineColor = hexToRgba(hexColor, 1); // Solid line
        const fillColor = hexToRgba(hexColor, 0.18); // Faded fill (adjust opacity as desired)
        

        // ✅ Create Chart Instance
        new Chart(ctx, {
          type: "line",
          data: {
            labels,
            datasets: [
              {
                label: "CurrentRatio",
                data: values,
                // borderColor: "rgba(54, 116, 181, 0.8)",
                // backgroundColor: gradient,
                borderColor: lineColor,
                backgroundColor: fillColor,

                borderWidth: 3,
                tension: 0.4,
                pointBackgroundColor: fillColor,
                pointBorderColor: lineColor,
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8,
                fill: true,
              },
            ],
          },
          options: {
            responsive: false,
            maintainAspectRatio: false,
            layout: {
              padding: { top: 40, left: 0, right: 0, bottom: 20 }, // Adjust padding to avoid clipping
            },
            plugins: {
              legend: {
                display: true,
                position: "top",
                labels: {
                  color: "#000",
                  padding: 16,
                  font: {
                    size: 14,
                    weight: "bold",
                  },
                },
              },
              tooltip: {
                enabled: true,
              },
            },
            scales: {
              x: {
                title: {
                  display: true,
                  text: "Years",
                  color: "#000",
                  font: {
                    size: 14,
                    weight: "bold",
                  },
                },
                ticks: {
                  color: "#000",
                  stepSize: 1,
                  maxTicksLimit: labels.length,
                },
                grid: {
                  color: "rgba(0, 0, 0, 0.1)",
                },
              },
              y: {
                beginAtZero: true,
                min: 0,
                max: maxYValue,
                title: {
                  display: true,
                  text: "Value",
                  color: "#000",
                  font: {
                    size: 14,
                    weight: "bold",
                  },
                },
                ticks: {
                  color: "#000",
                  stepSize: parseFloat(yInterval), // ✅ Divide into 4 equal parts
                  callback: (value) => {
                    return value.toFixed(2); // Ensuring decimal precision in y-axis ticks
                  },
                },
                grid: {
                  color: "rgba(0, 0, 0, 0.1)",
                },
              },
            },
          },
        });

        // ✅ Allow time for rendering to complete
        await new Promise((resolve) => setTimeout(resolve, 200));

        // ✅ Capture chart using html2canvas
        const base64Image = canvas.toDataURL("image/png");

        // console.log("✅ Current Ratio Chart Base64:", base64Image);

        if (mounted && onBase64Generated) {
          onBase64Generated(base64Image);
        }

        // ✅ Cleanup
        document.body.removeChild(canvas);
      }
    };

    generateChart();

    return () => {
      mounted = false;
    };
  }, [labels, values, onBase64Generated]);

  return null;
};

export default CurrentRatioChart;

// import React, { useEffect } from 'react';
// import { Line } from 'react-chartjs-2';
// import { Chart, registerables } from 'chart.js';
// import html2canvas from 'html2canvas';
// import ReactDOM from 'react-dom/client';

// Chart.register(...registerables);

// const CurrentRatioChart = ({ labels = [], values = [], onBase64Generated }) => {
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
//         container.style.backgroundColor = '#FFFFFF'; // ✅ White background
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
//                   label: 'Current Ratio',
//                   data: values,
//                   borderColor: '#4A90E2', // ✅ Blue line color
//                   backgroundColor: 'rgba(74, 144, 226, 0.2)',
//                   fill: true,
//                   tension: 0.4,
//                   pointBackgroundColor: '#4A90E2',
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
//                     color: '#000', // ✅ Black legend text
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
//                     color: '#000', // ✅ Black axis label
//                   },
//                   ticks: {
//                     color: '#000', // ✅ Black axis text
//                     stepSize: 1, // ✅ Display whole numbers like 1, 2, 3...
//                     maxTicksLimit: labels.length, // ✅ Ensure all years are shown
//                   },
//                   grid: {
//                     color: 'rgba(0, 0, 0, 0.1)', // ✅ Light gridlines
//                   },
//                 },
//                 y: {
//                   title: {
//                     display: true,
//                     text: 'Value',
//                     color: '#000', // ✅ Black axis label
//                   },
//                   ticks: {
//                     color: '#000', // ✅ Black axis text
//                   },
//                   grid: {
//                     color: 'rgba(0, 0, 0, 0.1)', // ✅ Light gridlines
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
//           backgroundColor: '#FFFFFF',
//         });

//         // ✅ Convert to base64
//         const base64Image = canvas.toDataURL('image/png');

//         console.log("✅ Current Ratio Chart Base64:", base64Image);

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

// export default CurrentRatioChart;
