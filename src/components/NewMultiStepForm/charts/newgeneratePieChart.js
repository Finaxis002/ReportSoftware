import React, { useRef, useEffect } from "react";
import { Pie } from "react-chartjs-2";

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

// function hexToRgba(hex, alpha = 1) {
//   if (!hex) return `rgba(54,116,181,${alpha})`;
//   if (!hex.startsWith("#")) {
//     // If not hex (i.e. unknown named color), opacity will NOT work, fallback to default with alpha
//     return `rgba(54,116,181,${alpha})`;
//   }
//   let h = hex.slice(1);
//   if (h.length === 3)
//     h = h
//       .split("")
//       .map((x) => x + x)
//       .join("");
//   const num = parseInt(h, 16);
//   const r = (num >> 16) & 255;
//   const g = (num >> 8) & 255;
//   const b = num & 255;
//   return `rgba(${r},${g},${b},${alpha})`;
// }
function hexToRgba(hex, alpha = 1) {
  if (!hex) return `rgba(54,116,181,${alpha})`;
  if (hex.startsWith("rgba")) return hex; // already rgba
  if (hex.startsWith("#")) {
    let h = hex.slice(1);
    if (h.length === 3) h = h.split("").map(x => x + x).join("");
    if (h.length !== 6) return `rgba(54,116,181,${alpha})`;
    const num = parseInt(h, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r},${g},${b},${alpha})`;
  }
  // Not a hex, maybe color name?
  return `rgba(54,116,181,${alpha})`;
}


function hexToHSL(hex) {
  hex = hex.replace(/^#/, "");
  if (hex.length === 3) hex = hex.split("").map(x => x + x).join("");
  const num = parseInt(hex, 16);
  const r = (num >> 16) & 255, g = (num >> 8) & 255, b = num & 255;
  let r1 = r / 255, g1 = g / 255, b1 = b / 255;
  let max = Math.max(r1, g1, b1), min = Math.min(r1, g1, b1);
  let h, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r1: h = (g1 - b1) / d + (g1 < b1 ? 6 : 0); break;
      case g1: h = (b1 - r1) / d + 2; break;
      case b1: h = (r1 - g1) / d + 4; break;
    }
    h = h * 60;
  }
  return [h, s * 100, l * 100];
}

function hslToCssAlpha(h, s, l, a) {
  return `hsla(${Math.round(h)},${Math.round(s)}%,${Math.round(l)}%,${a})`;
}

// 👇 Function to generate N pie slice colors in the same family, with opacity
function generateColorVariations(hex, n) {
  let [h, s, l] = hexToHSL(hex);
  s = Math.max(45, Math.min(s, 80));
  l = Math.max(35, Math.min(l, 65));
  let opacities = [1, 0.85, 0.7, 0.55, 0.4, 0.3, 0.18, 0.12];
  let colors = [];
  for (let i = 0; i < n; i++) {
    // ±8° hue shift, slight lightness shift, and varied opacity
    let newH = h + ((i - Math.floor(n / 2)) * (16 / Math.max(n - 1, 1)));
    let newL = l + (i - Math.floor(n / 2)) * 7;
    newL = Math.max(30, Math.min(newL, 78));
    let alpha = opacities[i] !== undefined ? opacities[i] : 0.1;
    colors.push(hslToCssAlpha(newH, s, newL, alpha));
  }
  return colors;
}



export const generatePieChart = (pieData, selectedColor) => {

  console.log('pieData', pieData);

  function makePieSliceColors(selectedColor, n) {
    const base = toHex(selectedColor);
    let opacities = [1, 0.7, 0.5, 0.3, 0.2, 0.15, 0.12, 0.1];
    // Clamp/cycle as needed
    return Array.from({ length: n }, (_, i) =>
      hexToRgba(base, opacities[i] || 0.1)
    );
  }

  const DEFAULT_PIE_COLORS = [
    "rgb(54, 116, 181)",
    "rgba(32, 164, 243, 1)",
    "rgb(121, 206, 241)",
    "rgb(32, 164, 243)",
    "rgba(87, 143, 202, 0.6)",
    "rgb(71, 130, 192)",
    "rgb(124, 185, 226)",
    "rgb(87, 143, 202)"
  ];

  return new Promise((resolve) => {
    const mountPoint = document.createElement("div");
    mountPoint.style.width = "1200px";
    mountPoint.style.height = "400px";
    mountPoint.style.position = "fixed";
    mountPoint.style.left = "-9999px";
    document.body.appendChild(mountPoint);

    //    function normalizePieData(pieData) {
    //   let percentTotal = 0;
    //   let rupeeTotal = 0;
    //   let percentSlices = [];
    //   let rupeeSlices = [];

    //   pieData.forEach(item => {
    //     let value = item.value;
    //     if (item.isRawMaterial && item.isPercentage) {
    //       value = parseFloat(item.value);
    //     }
    //     if (typeof value === "string" && value.trim().endsWith("%")) {
    //       let percent = parseFloat(value);
    //       if (percent > 0) {
    //         percentTotal += percent;
    //         percentSlices.push({ ...item, value: percent, type: "percent" });
    //       }
    //     } else {
    //       value = parseFloat(value);
    //       if (value > 0) {
    //         rupeeTotal += value;
    //         rupeeSlices.push({ ...item, value, type: "rupee" });
    //       }
    //     }
    //   });

    //   // Scale rupee slices to fit the remaining percentage space
    //   const rupeeAvailable = 100 - percentTotal;
    //   const result = [];
    //   if (rupeeSlices.length && rupeeAvailable > 0) {
    //     rupeeSlices.forEach(slice => {
    //       result.push({
    //         ...slice,
    //         value: (slice.value / rupeeTotal) * rupeeAvailable
    //       });
    //     });
    //   }
    //   percentSlices.forEach(slice => result.push({ ...slice, value: slice.value }));

    //   let filtered = result.filter(item => item.value > 0.01);

    //   // Scale so sum is 100
    //   const total = filtered.reduce((a, b) => a + b.value, 0);
    //   if (Math.abs(total - 100) > 0.0001 && total > 0) {
    //     filtered = filtered.map(item => ({
    //       ...item,
    //       value: (item.value / total) * 100
    //     }));
    //   }
    // // --- NEW FIX: Adjust the last slice so sum is exactly 100 ---
    // filtered = filtered.map(item => ({
    //   ...item,
    //   value: parseFloat(item.value.toFixed(2))
    // }));

    // let sum = filtered.reduce((a, b) => a + b.value, 0);
    // const diff = parseFloat((100 - sum).toFixed(2));
    // if (filtered.length > 0 && Math.abs(diff) > 0.001) {
    //   filtered[filtered.length - 1].value = parseFloat((filtered[filtered.length - 1].value + diff).toFixed(2));
    // }

    //   return filtered;
    // }
    function normalizePieData(pieData) {
      // 1. Convert all values to numbers, separate percent and rupee slices
      let percentTotal = 0;
      let rupeeTotal = 0;
      let percentSlices = [];
      let rupeeSlices = [];

      pieData.forEach((item) => {
        let value = item.value;
        if (item.isRawMaterial && item.isPercentage) {
          value = parseFloat(item.value);
        }
        if (typeof value === "string" && value.trim().endsWith("%")) {
          let percent = parseFloat(value);
          if (percent > 0) {
            percentTotal += percent;
            percentSlices.push({ ...item, value: percent, type: "percent" });
          }
        } else {
          value = parseFloat(value);
          if (value > 0) {
            rupeeTotal += value;
            rupeeSlices.push({ ...item, value, type: "rupee" });
          }
        }
      });

      // 2. Scale rupee slices to fit the remaining percent space
      const rupeeAvailable = 100 - percentTotal;
      const combined = [];
      if (rupeeSlices.length && rupeeAvailable > 0) {
        rupeeSlices.forEach((slice) => {
          combined.push({
            ...slice,
            value: (slice.value / rupeeTotal) * rupeeAvailable,
          });
        });
      }
      percentSlices.forEach((slice) =>
        combined.push({ ...slice, value: slice.value })
      );

      // 3. Remove near-zero/negative slices, and round to 2 decimals
      let filtered = combined
        .filter((item) => item.value > 0.01)
        .map((item) => ({
          ...item,
          value: parseFloat(item.value.toFixed(2)),
        }));

      // 4. Combine all slices below 2% into "Other"
      const minSlice = 0.2;
      let mainSlices = filtered.filter((item) => item.value >= minSlice);
      let smallSlices = filtered.filter((item) => item.value < minSlice);

      let smallSum = smallSlices.reduce((sum, s) => sum + s.value, 0);
      if (smallSum > 0) {
        mainSlices.push({
          name: "Other",
          value: parseFloat(smallSum.toFixed(2)),
        });
      }

      // 5. Normalize all slices to sum to exactly 100
      let sum = mainSlices.reduce((a, b) => a + b.value, 0);
      if (Math.abs(sum - 100) > 0.0001 && sum > 0) {
        mainSlices = mainSlices.map((item) => ({
          ...item,
          value: parseFloat(((item.value / sum) * 100).toFixed(2)),
        }));
      }

      // 6. Assign any final tiny difference to the largest slice
      let newSum = mainSlices.reduce((a, b) => a + b.value, 0);
      const diff = parseFloat((100 - newSum).toFixed(2));
      if (mainSlices.length > 0 && Math.abs(diff) > 0.01) {
        // Find largest slice
        let maxIdx = 0,
          maxVal = mainSlices[0].value;
        for (let i = 1; i < mainSlices.length; i++) {
          if (mainSlices[i].value > maxVal) {
            maxIdx = i;
            maxVal = mainSlices[i].value;
          }
        }
        mainSlices[maxIdx].value = parseFloat(
          (mainSlices[maxIdx].value + diff).toFixed(2)
        );
      }

      return mainSlices;
    }

    const ChartComponent = () => {
      const chartRef = useRef();

      useEffect(() => {
        setTimeout(() => {
          if (chartRef.current) {
            const base64 = chartRef.current.toBase64Image();
            resolve(base64);
            if (document.body.contains(mountPoint)) {
              document.body.removeChild(mountPoint);
            }
          }
        }, 400);
      }, [pieData]);

      const filteredPieData = normalizePieData(pieData);

    //  const backgroundColors = selectedColor
    //     ? makePieSliceColors(selectedColor, filteredPieData.length)
    //     : DEFAULT_PIE_COLORS.slice(0, filteredPieData.length);
    const backgroundColors = selectedColor
    ? generateColorVariations(toHex(selectedColor), filteredPieData.length)
    : DEFAULT_PIE_COLORS.slice(0, filteredPieData.length);


      const sum = filteredPieData.reduce((a, b) => a + b.value, 0);

      const chartData = {
        labels: filteredPieData.map((item) => item.name),
        datasets: [
          {
            data: filteredPieData.map((item) => item.value),
            // backgroundColor: [
            //   "rgb(54, 116, 181)",
            //   "rgba(32, 164, 243, 1)",
            //   "rgb(121, 206, 241)",
            //   "rgb(32, 164, 243)",
            //   "rgba(87, 143, 202, 0.6)",
            //   "rgb(71, 130, 192)",
            //   "rgb(124, 185, 226)",
            //   "rgb(87, 143, 202)"
            // ],
            backgroundColor: backgroundColors,
            borderWidth: 0,
          },
        ],
      };

      const chartOptions = {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            position: "right", // <-- legend on right
            labels: {
              font: {
                size: 10,
                family: "Arial",
                weight: "normal",
              },
              color: "#000000",
              usePointStyle: true,
              boxWidth: 18,
              padding: 18,
            },
          },
        },
        cutout: 2, // Small cutout (to avoid donut effect)
        maintainAspectRatio: true, // Ensures the aspect ratio remains square
        rotation: 0, // Start the pie chart from the top
        circumference: 360, // Full circle (360 degrees)
        layout: {
          padding: 0, // No padding to ensure full coverage
        },
        animation: false,
      };

      return (
        <Pie
          ref={chartRef}
          data={chartData}
          options={chartOptions}
          width={1200}
          height={1200}
        />
      );
    };

    import("react-dom/client").then(({ createRoot }) => {
      const root = createRoot(mountPoint);
      root.render(<ChartComponent />);
    });
  });
};

// PieChartGenerator.js

// import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';

// Chart.register(ArcElement, Tooltip, Legend);

// export const generatePieChart = async ({ labels, values }) => {
//   console.log("generatePieChart received:", { labels, values });
//   console.log('pieLabels:', labels);
// console.log('pieValues:', values);
// console.log('Sum of pieValues:', values.reduce((a, b) => a + b, 0));

//   // Hard fail if not arrays:
//   if (!Array.isArray(values) || !Array.isArray(labels)) {
//     throw new Error(
//       `generatePieChart: labels and values must be arrays. Got: ${typeof labels}, ${typeof values}`
//     );
//   }
//   // Remove zero and invalid values (important)
//   const filteredLabels = [];
//   const filteredValues = [];

//   values.forEach((v, idx) => {
//     const val = typeof v === "string" ? parseFloat(v) : v;
//     if (val && val > 0) {
//       filteredLabels.push(labels[idx]);
//       filteredValues.push(val);
//     }
//   });

//   // Chart.js works best when you only feed it clean numbers!
//   const canvas = document.createElement('canvas');
//   canvas.width = 400;
//   canvas.height = 400;
//   const ctx = canvas.getContext('2d');

//   const backgroundColors = [
//     'rgb(54, 116, 181)',
//     'rgba(32, 164, 243, 1)',
//     'rgb(121, 206, 241)',
//     'rgb(32, 164, 243)',
//     'rgba(87, 143, 202, 0.6)',
//     'rgb(71, 130, 192)',
//     'rgb(124, 185, 226)',
//     'rgb(87, 143, 202)',
//   ];

//   // Destroy any previous chart on this canvas context
//   if (Chart.getChart(ctx)) Chart.getChart(ctx).destroy();

//   // Create the pie chart
//   new Chart(ctx, {
//     type: 'pie',
//     data: {
//       labels: filteredLabels,
//       datasets: [{
//         data: filteredValues,
//         backgroundColor: backgroundColors,
//         borderColor: '#fff',
//         borderWidth: 2,
//       }],
//     },
//     options: {
//       responsive: false,
//       maintainAspectRatio: false,

//       plugins: {
//         legend: {
//           display: true,
//           position: 'right',
//           labels: {
//             color: '#000',
//             font: { size: 12, weight: 'bold' },
//             usePointStyle: true,
//             boxWidth: 8,
//             padding: 20,
//           },
//         },
//         tooltip: { enabled: true },
//       },
//       animation: {
//         animateRotate: true,
//         animateScale: true,
//       },
//     }
//   });

//   // Wait for rendering
//   await new Promise(resolve => setTimeout(resolve, 200));
//   return canvas.toDataURL('image/png');
// };
