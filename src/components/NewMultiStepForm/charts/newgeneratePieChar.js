import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale } from 'chart.js';

// Register the necessary components for Chart.js
ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale);

export const generatePieChart = (pieData) => {
  return new Promise((resolve, reject) => {
    const chartData = {
      labels: pieData.map(item => item.name),  // Map the names to labels
      datasets: [{
        data: pieData.map(item => item.value),  // Map the values to dataset
        backgroundColor: ['#FF5733', '#33FF57', '#5733FF', '#FF33FF', '#33FFFF'],  // Add some random colors
      }],
    };

    const chartOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
      },
    };

    // Render the chart using react-chartjs-2 (or Chart.js directly)
    const mountPoint = document.createElement('div');
    document.body.appendChild(mountPoint);

    import("react-dom/client").then(({ createRoot }) => {
      const root = createRoot(mountPoint);
      root.render(
        <Pie
          data={chartData}
          options={chartOptions}
          ref={(chart) => {
            if (chart) {
              // Once the chart is rendered, convert it to a base64 image
              const base64Image = chart.toBase64Image();
              resolve(base64Image);  // Resolve the base64 image once chart is rendered
            }
          }}
        />
      );
    });
  });
};
