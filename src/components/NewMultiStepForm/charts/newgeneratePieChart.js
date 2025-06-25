import React, { useRef, useEffect } from "react";
import { Pie } from "react-chartjs-2";

export const generatePieChart = (pieData) => {
  return new Promise((resolve) => {
    const mountPoint = document.createElement("div");
    mountPoint.style.width = "400px";
    mountPoint.style.height = "400px";
    mountPoint.style.position = "fixed";
    mountPoint.style.left = "-9999px";
    document.body.appendChild(mountPoint);

    function normalizePieData(pieData) {
      let percentTotal = 0;
      let rupeeTotal = 0;
      let percentSlices = [];
      let rupeeSlices = [];

      // Separate % and rupee slices
      pieData.forEach(item => {
        let value = item.value;

        if (item.isRawMaterial && item.isPercentage) {
          value = parseFloat(item.value);  // Adjust based on your data
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

      // Scale rupee slices to fit the remaining percentage space
      const rupeeAvailable = 100 - percentTotal;
      const result = [];

      if (rupeeSlices.length && rupeeAvailable > 0) {
        rupeeSlices.forEach(slice => {
          result.push({
            ...slice,
            value: (slice.value / rupeeTotal) * rupeeAvailable
          });
        });
      }

      percentSlices.forEach(slice => result.push({ ...slice, value: slice.value }));

      // Remove near-zero/negative values
      let filtered = result.filter(item => item.value > 0.01);

      // Ensure sum is 100 by proportionally scaling the values if needed
      const total = filtered.reduce((a, b) => a + b.value, 0);
      if (Math.abs(total - 100) > 0.0001 && total > 0) {
        filtered = filtered.map(item => ({
          ...item,
          value: (item.value / total) * 100
        }));
      }

      // Fix rounding errors by giving the remaining discrepancy to the largest slice
      const sumAfter = filtered.reduce((a, b) => a + b.value, 0);
      if (Math.abs(sumAfter - 100) > 0.0001 && filtered.length > 0) {
        let maxIdx = 0,
            maxVal = filtered[0].value;
        for (let i = 1; i < filtered.length; i++) {
          if (filtered[i].value > maxVal) {
            maxIdx = i;
            maxVal = filtered[i].value;
          }
        }
        filtered[maxIdx].value += 100 - sumAfter; // Fix the rounding error by adjusting the largest slice
      }

      // Ensure two decimal precision for visual consistency
      filtered = filtered.map(item => ({
        ...item,
        value: parseFloat(item.value.toFixed(2))
      }));

      return filtered;
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

      const sum = filteredPieData.reduce((a, b) => a + b.value, 0);
      console.log("Filtered Pie Data:", filteredPieData);
      console.log("Pie chart sum (should match full circle):", sum);

      const chartData = {
        labels: filteredPieData.map((item) => item.name),
        datasets: [
          {
            data: filteredPieData.map((item) => item.value),
            backgroundColor: [
              "rgb(54, 116, 181)",
              "rgba(32, 164, 243, 1)",
              "rgb(121, 206, 241)",
              "rgb(32, 164, 243)",
              "rgba(87, 143, 202, 0.6)",
              "rgb(71, 130, 192)",
              "rgb(124, 185, 226)",
              "rgb(87, 143, 202)"
            ]
          }
        ]
      };

      const chartOptions = {
        responsive: true,
        plugins: { legend: { position: "top" } },
        cutout: 2, // Small cutout (to avoid donut effect)
        maintainAspectRatio: true, // Ensures the aspect ratio remains square
        rotation: 0, // Start the pie chart from the top
        circumference: 360, // Full circle (360 degrees)
        layout: {
          padding: 0, // No padding to ensure full coverage
        },
      };

      return (
        <Pie
          ref={chartRef}
          data={chartData}
          options={chartOptions}
          width={400}
          height={400}
        />
      );
    };

    import("react-dom/client").then(({ createRoot }) => {
      const root = createRoot(mountPoint);
      root.render(<ChartComponent />);
    });
  });
};
