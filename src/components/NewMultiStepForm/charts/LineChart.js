
import React, { useEffect } from "react";
import { Chart, registerables } from "chart.js";
import html2canvas from "html2canvas";
import ChartDataLabels from "chartjs-plugin-datalabels";

Chart.register(...registerables);

const LineChart = ({ labels = [], values = [], onBase64Generated }) => {
  useEffect(() => {
    let mounted = true;

    const generateChart = async () => {
      if (labels.length > 0 && values.length > 0) {
        // console.log("✅ Generating DSCR Chart...");

        // ✅ Create a canvas dynamically
        const canvas = document.createElement("canvas");
        canvas.width = 600;
        canvas.height = 500;
        canvas.style.backgroundColor = "#ffffff"; // ✅ Black background
        canvas.style.width = "300px";
        canvas.style.height = "250px";

        const ctx = canvas.getContext("2d");

        // ✅ Append to DOM for html2canvas to work
        document.body.appendChild(canvas);

        // ✅ Ensure existing chart instance is destroyed
        if (Chart.getChart(ctx)) {
          Chart.getChart(ctx).destroy();
        }

        // ✅ Create gradient for line chart
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, "rgba(128, 196, 233, 0.5)");
        gradient.addColorStop(1, "rgba(128, 196, 233, 0.2)");

    

        // ✅ Calculate Y-axis range based on last year's value
        const lastYearValue = values[values.length - 1] || 0;
        let maxYValue = lastYearValue + lastYearValue * 0.5; // ✅ Max = last value + 50%
        const yInterval = Number((maxYValue / 4).toFixed(2)); // ✅ Divide into 4 equal parts with decimals

        // console.log("✅ Last Year Value:", lastYearValue);
        // console.log("✅ Max Y Value:", maxYValue);
        // console.log("✅ Y Interval:", yInterval);

        Chart.defaults.font.family = "Times New Roman";

        // ✅ Create Chart Instance
        new Chart(ctx, {
          type: "line",
          data: {
            labels,
            datasets: [
              {
                label: "DSCR",
                data: values,
                borderColor: "rgba(54, 116, 181, 0.8)", //lineColor // ✅ Blue line color
                backgroundColor: gradient,
                borderWidth: 3,
                tension: 0.4,
                pointBackgroundColor: "rgba(121, 206, 241, 0.5)",// pointColor,
                pointBorderColor: "rgb(54, 116, 181)",
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
            scales: {
              x: {
                title: {
                  display: true,
                  text: "Years",
                  color: "#000000", // ✅ White x-axis label
                  font: {
                    size: 14,
                    weight: "bold",
                  },
                },
                ticks: {
                  color: "#000000", // ✅ White x-axis ticks
                  stepSize: 1,
                  maxTicksLimit: labels.length,
                },
                grid: {
                  color: "rgba(255, 255, 255, 0.1)", // ✅ Light white gridlines
                  drawBorder: true, // ✅ Ensure border is drawn
                },
              },
              y: {
                beginAtZero: true,
                min: 0,
                max: Number(maxYValue.toFixed(2)),
                title: {
                  display: true,
                  text: "Value",
                  color: "#000000", // ✅ White y-axis label
                  font: {
                    size: 14,
                    weight: "bold",
                  },
                },
                ticks: {
                  color: "#000000", // ✅ White y-axis ticks
                  stepSize: yInterval, // ✅ Divide into 4 equal parts
                  callback: (value) => value.toFixed(2),
                },
                grid: {
                  color: "rgba(255, 255, 255, 0.1)", // ✅ Light white gridlines
                  drawBorder: true,
                },
              },
            },
            plugins: {
              legend: {
                display: true,
                position: "top",
                labels: {
                  color: "#000000", // ✅ White legend text
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
          },
        });

        // ✅ Allow time for rendering to complete
        await new Promise((resolve) => setTimeout(resolve, 200));

        try {
          // console.log("✅ Capturing chart with html2canvas...");

          // ✅ Capture chart using html2canvas
          const canvasImage = await html2canvas(canvas, {
            scale: 2,
            useCORS: true,
            backgroundColor: "#000000", // ✅ Set background for capture
          });

          // ✅ Convert to base64
          const base64Image = canvasImage.toDataURL("image/png");
          // console.log("✅ DSCR Chart Base64:", base64Image);

          // ✅ Pass Base64 to parent component
          if (mounted && onBase64Generated) {
            onBase64Generated(base64Image);
          }
        } catch (error) {
          // console.error("❌ Error capturing chart:", error);
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
