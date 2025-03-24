import React, { useEffect } from "react";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import html2canvas from "html2canvas";
import ReactDOM from "react-dom/client";
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.register(...registerables, ChartDataLabels);

// ✅ Keep global settings only in this file
Chart.defaults.plugins.tooltip.enabled = false;
Chart.defaults.interaction.mode = null;

const CurrentRatioChart = ({ labels = [], values = [], onBase64Generated }) => {
  useEffect(() => {
    let mounted = true;

    const generateChart = async () => {
      if (labels.length > 0 && values.length > 0) {
        const container = document.createElement("div");
        container.style.width = "600px";
        container.style.height = "400px";
        container.style.position = "fixed";
        container.style.left = "-9999px";
        container.style.backgroundColor = "#FFFFFF";
        container.style.padding = "10px";
        container.style.border = "1px solid #ccc";
        container.style.borderRadius = "8px";
        container.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)";
        document.body.appendChild(container);

        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 400;
        container.appendChild(canvas);

        if (container.chart) {
          container.chart.destroy();
        }

        const root = ReactDOM.createRoot(container);
        root.render(
          <Line
            data={{
              labels,
              datasets: [
                {
                  label: "Current Ratio",
                  data: values,
                  borderColor: "#4A90E2",
                  backgroundColor: "rgba(74, 144, 226, 0.2)",
                  fill: true,
                  tension: 0.4,
                  pointBackgroundColor: "#4A90E2",
                  pointBorderColor: "#FFFFFF",
                  pointRadius: 6,
                  pointHoverRadius: 8,
                  pointBorderWidth: 2,
                  borderWidth: 3,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: true,
                  position: 'top',
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
                  enabled: false, 
                  callbacks: {
                    label: () => null,
                  },
                },
                datalabels: {
                  display: false,
                  color: "#000",
                  align: "center",
                  anchor: "center",
                  font: {
                    size: 12,
                    weight: "bold",
                  },
                  // formatter: (value) => value.toFixed(2),
                },
              },
            }}
          />
        );

        await new Promise((resolve) => setTimeout(resolve, 800));

        const chartCanvas = await html2canvas(container, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#FFFFFF",
        });

        const base64Image = chartCanvas.toDataURL("image/png");

        if (mounted && onBase64Generated) {
          onBase64Generated(base64Image);
        }

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

export default CurrentRatioChart;










// import React, { useEffect } from "react";
// import { Line } from "react-chartjs-2";
// import { Chart, registerables } from "chart.js";
// import html2canvas from "html2canvas";
// import ReactDOM from "react-dom/client";

// import ChartDataLabels from 'chartjs-plugin-datalabels';

// Chart.register(...registerables, ChartDataLabels);


// const CurrentRatioChart = ({ labels = [], values = [], onBase64Generated }) => {
//   useEffect(() => {
//     let mounted = true;

//     const generateChart = async () => {
//       if (labels.length > 0 && values.length > 0) {
//         // ✅ Create container for rendering chart
//         const container = document.createElement("div");
//         container.style.width = "400px";
//         container.style.height = "300px";
//         container.style.position = "fixed";
//         container.style.left = "-9999px";
//         container.style.backgroundColor = "#FFFFFF"; // ✅ White background
//         container.style.padding = "10px";
//         container.style.border = "1px solid #ccc";
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
//                   label: "Current Ratio",
//                   data: values,
//                   borderColor: "#4A90E2", // ✅ Blue line color
//                   backgroundColor: "rgba(74, 144, 226, 0.2)",
//                   fill: true,
//                   tension: 0.4,
//                   pointBackgroundColor: "#4A90E2",
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
//                     color: "#000", // ✅ Black legend text
//                   },
//                 },
//                 tooltip: {
//                   enabled: true,
//                 },
//                 // ✅ Show values on data points
//                 datalabels: {
//                   display: false,
//                   color: "#000", // ✅ White text for better contrast
//                   align: "top", // ✅ Position at top of point
//                   anchor: "center", // ✅ Keep it centered on the point
//                   font: {
//                     size: 10, // ✅ Increase size for better visibility
//                     weight: "bold",
//                   },
//                   // formatter: (value) => value.toFixed(2), // ✅ Format to two decimal points
//                 },
//               },

//               scales: {
//                 x: {
//                   title: {
//                     display: true,
//                     text: "Years",
//                     color: "#000", // ✅ Black axis label
//                   },
//                   ticks: {
//                     color: "#000", // ✅ Black axis text
//                     stepSize: 1, // ✅ Display whole numbers like 1, 2, 3...
//                     maxTicksLimit: labels.length, // ✅ Ensure all years are shown
//                   },
//                   grid: {
//                     color: "rgba(0, 0, 0, 0.1)", // ✅ Light gridlines
//                   },
//                 },
//                 y: {
//                   title: {
//                     display: true,
//                     text: "Value",
//                     color: "#000", // ✅ Black axis label
//                   },
//                   ticks: {
//                     color: "#000", // ✅ Black axis text
//                   },
//                   grid: {
//                     color: "rgba(0, 0, 0, 0.1)", // ✅ Light gridlines
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
//         await new Promise((resolve) => setTimeout(resolve, 500));

//         // ✅ Capture chart using html2canvas
//         const canvas = await html2canvas(container, {
//           scale: 2,
//           useCORS: true,
//           backgroundColor: "#FFFFFF",
//         });

//         // ✅ Convert to base64
//         const base64Image = canvas.toDataURL("image/png");

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
