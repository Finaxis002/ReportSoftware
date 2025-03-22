


import { Chart, registerables, ArcElement, Tooltip, Legend } from 'chart.js';


// ✅ Register controllers and elements
Chart.register(...registerables,ArcElement, Tooltip, Legend);

export const generateChart = async (data) => {
  try {
    // Create a hidden canvas for chart rendering
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    const backgroundColors = [
        '#7CB9E8', 
        '#00308F',
        '#72A0C1', 
        '#0066b2',
        '#89CFF0', 
        '#318CE7', 
      ];

    const borderColors = backgroundColors.map(color =>
        color.replace('0.8', '1')
      );
    // ✅ Destroy previous chart instance if any
    if (Chart.getChart(ctx)) {
      Chart.getChart(ctx).destroy();
    }

    // ✅ Create Pie Chart
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: data.labels,
        datasets: [{
          data: data.values,
          backgroundColor: backgroundColors,
          borderColor: borderColors,

          borderWidth: 1, 

          hoverOffset: 8,
        }]
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
          },
          title: {
            display: true,
            text: 'Direct Expense Break up',
            font: { size: 16, weight: 'bold' }
          },
          tooltip: {
            enabled: true,
          }
          
        },
        animation: {
            animateRotate: true,
            animateScale: true
          }
      }
    });

    // ✅ Wait for chart rendering to finish
    await new Promise((resolve) => setTimeout(resolve, 100));

    // ✅ Convert canvas to Base64 using `toDataURL`
    const base64 = canvas.toDataURL('image/png');
    console.log("✅ Pie Chart generated:", base64);
    return base64;
  } catch (error) {
    console.error("❌ Error generating pie chart:", error);
    return null;
  }
};



