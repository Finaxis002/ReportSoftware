
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
    canvas.height = 500;
    const ctx = canvas.getContext('2d');
    // const storedColors = JSON.parse(localStorage.getItem("pieChartColors")) || [
    //   'rgba(115, 210, 210)', 
    //     'rgba(75, 192, 192, 0.5)',
    //     'rgba(255, 180, 100)',
    //     'rgba(35, 120, 120)', 
    //     'rgba(220, 130, 40)', 
    //     'rgba(255, 159, 64, 0.9)', 
    // ];
    const backgroundColors = [
        'rgba(115, 210, 210)', 
        'rgba(75, 192, 192, 0.5)',
        'rgba(255, 180, 100)',
        'rgba(35, 120, 120)', 
        'rgba(220, 130, 40)', 
        'rgba(255, 159, 64, 0.9)', 
      ];
    // const backgroundColors = storedColors;
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

    Chart.defaults.font.family = 'Times New Roman';

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
        responsive: false,
        
        plugins: {
          legend: {
            display: true,
            position: 'right',
           
            labels: {
              color: '#000', // ✅ Black legend color
              font: {
                size: 12,
                weight: 'bold',
              },
              usePointStyle: true,
              boxWidth: 8,
              padding: 20, 
            },
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
          // layout: {
          //   padding: {
          //     left: 0, 
          //     right: 120, // ✅ Increase this to move labels further to the right
          //     top: 0, 
          //     bottom: 0
          //   }
          // },
         
      },
      
      
    });

    // ✅ Wait for chart rendering to finish
    await new Promise((resolve) => setTimeout(resolve, 200));

    // ✅ Convert canvas to Base64 using `toDataURL`
    const base64 = canvas.toDataURL('image/png');
    // console.log("✅ Pie Chart generated:", base64);
    return base64;
  } catch (error) {
    // console.error("❌ Error generating pie chart:", error);
    return null;
  }
};



