


import { Chart, registerables, ArcElement, Tooltip, Legend } from 'chart.js';


// ✅ Register controllers and elements
Chart.register(...registerables,ArcElement, Tooltip, Legend);

const shadowPlugin = {
  id: 'shadowPlugin',
  beforeDraw: (chart) => {
    const ctx = chart.ctx;
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'; // ✅ Shadow color
    ctx.shadowBlur = 10; // ✅ Blurry effect for depth
    ctx.shadowOffsetX = 4; // ✅ Horizontal offset
    ctx.shadowOffsetY = 4; // ✅ Vertical offset
  },
  afterDraw: (chart) => {
    const ctx = chart.ctx;
    ctx.restore(); // ✅ Reset shadow settings after draw
  }
};

Chart.register(shadowPlugin);

export const generateChart = async (data) => {
  try {
    // Create a hidden canvas for chart rendering
    const canvas = document.createElement('canvas');
    canvas.width = 500;
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

      // ✅ Create Gradient for Shadow Effect
    const gradient = ctx.createLinearGradient(0, 0, 400, 400);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.4)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');

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

          borderWidth: 2, 
          hoverOffset: 12,
          
          borderJoinStyle: 'round',
          spacing: 2

        }]
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              color: '#000', // ✅ Black legend color
              font: {
                size: 12,
                weight: 'bold',
              },
              usePointStyle: true, // ✅ Circular legend points
            },
          },
          title: {
            display: true,
            text: 'Direct Expense Break up',
            font: { size: 16, weight: 'bold' }
          },
          tooltip: {
            enabled: true,
          },
          datalabels: {
            display: false, // ✅ Enable datalabels properly
          },
          
        },
        animation: {
            animateRotate: true,
            animateScale: true
          },
         
      }
    });

    // ✅ Wait for chart rendering to finish
    await new Promise((resolve) => setTimeout(resolve, 100));

    // ✅ Convert canvas to Base64 using `toDataURL`
    const base64 = canvas.toDataURL('image/png');
    // console.log("✅ Pie Chart generated:", base64);
    return base64;
  } catch (error) {
    console.error("❌ Error generating pie chart:", error);
    return null;
  }
};



