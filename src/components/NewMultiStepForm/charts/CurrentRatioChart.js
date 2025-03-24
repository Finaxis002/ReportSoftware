import React, { useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import html2canvas from 'html2canvas';
import ReactDOM from 'react-dom/client';

Chart.register(...registerables);

const CurrentRatioChart = ({ labels = [], values = [], onBase64Generated }) => {
  useEffect(() => {
    let mounted = true;

    const generateChart = async () => {
      if (labels.length > 0 && values.length > 0) {
        // ✅ Create container for rendering chart
        const container = document.createElement('div');
        container.style.width = '400px';
        container.style.height = '300px';
        container.style.position = 'fixed';
        container.style.left = '-9999px';
        container.style.backgroundColor = '#FFFFFF'; // ✅ White background
        container.style.padding = '10px';
        container.style.border = '1px solid #ccc';
        document.body.appendChild(container);

        // ✅ Destroy existing chart if any
        if (container.chart) {
          container.chart.destroy();
        }

        // ✅ Render chart using ReactDOM
        const root = ReactDOM.createRoot(container);
        root.render(
          <Line
            data={{
              labels,
              datasets: [
                {
                  label: 'Current Ratio',
                  data: values,
                  borderColor: '#4A90E2', // ✅ Blue line color
                  backgroundColor: 'rgba(74, 144, 226, 0.2)',
                  fill: true,
                  tension: 0.4,
                  pointBackgroundColor: '#4A90E2',
                  pointRadius: 5, // ✅ Larger Points
                  pointHoverRadius: 7, // ✅ Hover Effect
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
                    color: '#000', // ✅ Black legend text
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
                    text: 'Years',
                    color: '#000', // ✅ Black axis label
                  },
                  ticks: {
                    color: '#000', // ✅ Black axis text
                    stepSize: 1, // ✅ Display whole numbers like 1, 2, 3...
                    maxTicksLimit: labels.length, // ✅ Ensure all years are shown
                  },
                  grid: {
                    color: 'rgba(0, 0, 0, 0.1)', // ✅ Light gridlines
                  },
                },
                y: {
                  title: {
                    display: true,
                    text: 'Value',
                    color: '#000', // ✅ Black axis label
                  },
                  ticks: {
                    color: '#000', // ✅ Black axis text
                  },
                  grid: {
                    color: 'rgba(0, 0, 0, 0.1)', // ✅ Light gridlines
                  },
                },
              },
              elements: {
                line: {
                  borderWidth: 2,
                },
              },
            }}
          />
        );

        // ✅ Allow chart to render before capturing
        await new Promise(resolve => setTimeout(resolve, 500));

        // ✅ Capture chart using html2canvas
        const canvas = await html2canvas(container, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#FFFFFF',
        });

        // ✅ Convert to base64
        const base64Image = canvas.toDataURL('image/png');

        console.log("✅ Current Ratio Chart Base64:", base64Image);

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

export default CurrentRatioChart;