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

    function solidFullCirclePieData(pieData) {
      let percentTotal = 0;
      let rupeeTotal = 0;
      let percentSlices = [];
      let rupeeSlices = [];

      // Step 1: Separate % and rupee slices
      pieData.forEach((item) => {
        let value = item.value;
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

      // Step 2: Guard against >100% (this will always fill the pie!)
      if (percentTotal >= 100) {
        // Only keep percent slices, scaled to sum exactly 100
        return percentSlices.map((slice) => ({
          ...slice,
          value: (slice.value / percentTotal) * 100,
        }));
      }

      // Step 3: Calculate rupee slices as percent of available
      const rupeeAvailable = 100 - percentTotal;
      const result = [];

      if (rupeeSlices.length && rupeeAvailable > 0) {
        rupeeSlices.forEach((slice) => {
          // Scale value to percent
          result.push({
            ...slice,
            value: (slice.value / rupeeTotal) * rupeeAvailable,
          });
        });
      }

      // Add percent slices
      percentSlices.forEach((slice) =>
        result.push({ ...slice, value: slice.value })
      );

      // Step 4: Remove near-zero/negative values
      let filtered = result.filter((item) => item.value > 0.0001);

      // Step 5: FINAL FIX — Force sum to EXACTLY 100 (fix float gaps forever)
      const total = filtered.reduce((a, b) => a + b.value, 0);

      if (Math.abs(total - 100) > 0.0001 && total > 0) {
        // Proportionally scale all values to sum exactly 100
        filtered = filtered.map((item, i) => ({
          ...item,
          value: (item.value / total) * 100,
        }));
      }

      // Step 6: If float rounding still leaves a micro-gap, assign remainder to the biggest slice (last-resort fix)
      let sumAfter = filtered.reduce((a, b) => a + b.value, 0);
      if (Math.abs(sumAfter - 100) > 0.0001 && filtered.length > 0) {
        let maxIdx = 0,
          maxVal = filtered[0].value;
        for (let i = 1; i < filtered.length; i++) {
          if (filtered[i].value > maxVal) {
            maxIdx = i;
            maxVal = filtered[i].value;
          }
        }
        // Fix remainder to the biggest slice
        filtered[maxIdx].value += 100 - sumAfter;
      }

      // Step 7: Re-round values to a reasonable precision for display
      return filtered.map((item) => ({
        ...item,
        value: +item.value.toFixed(6),
      }));
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

      const filteredPieData = solidFullCirclePieData(pieData);

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
              "rgb(87, 143, 202)",
            ],
          },
        ],
      };

      const chartOptions = {
        responsive: false,
        plugins: { legend: { position: "top" } },
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
