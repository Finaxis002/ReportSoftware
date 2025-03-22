// import { Chart, registerables } from 'chart.js';
// import { toPng } from 'html-to-image';

// // ✅ Register controllers and elements
// Chart.register(...registerables);

// const generateChart = async () => {
//   try {
//     // Create a hidden canvas for chart rendering
//     const canvas = document.createElement('canvas');
//     canvas.width = 600;
//     canvas.height = 400;
//     const ctx = canvas.getContext('2d');

//     // ✅ Create the Chart.js instance
//     new Chart(ctx, {
//       type: 'bar', // ✅ Now "bar" will be recognized
//       data: {
//         labels: ['January', 'February', 'March', 'April', 'May'],
//         datasets: [{
//           label: 'Sales',
//           data: [12, 19, 3, 5, 2],
//           backgroundColor: 'rgba(75, 192, 192, 0.6)',
//           borderColor: 'rgba(75, 192, 192, 1)',
//           borderWidth: 1,
//         }]
//       },
//       options: {
//         responsive: false, // ✅ Fix size issue
//         maintainAspectRatio: false,
//       }
//     });

//     // ✅ Wait for the chart to finish rendering
//     await new Promise((resolve) => setTimeout(resolve, 100));

//     // ✅ Convert canvas to Base64 using `toDataURL`
//     const base64 = canvas.toDataURL('image/png');
//     console.log("✅ Chart generated:", base64);

//     return base64;
//   } catch (error) {
//     console.error("❌ Error generating chart:", error);
//     return null;
//   }
// };

// export default generateChart;



//////////////////////////////////////////////////////////////////
// import { Chart, registerables } from 'chart.js';

// // ✅ Register controllers and elements
// Chart.register(...registerables);

// export const generateChart = async (data) => {
//   try {
//     // Create a hidden canvas for chart rendering
//     const canvas = document.createElement('canvas');
//     canvas.width = 600;
//     canvas.height = 400;
//     const ctx = canvas.getContext('2d');

//     // ✅ Destroy previous chart instance if any
//     if (Chart.getChart(ctx)) {
//       Chart.getChart(ctx).destroy();
//     }

//     // ✅ Create Pie Chart
//     new Chart(ctx, {
//       type: 'pie',
//       data: {
//         labels: data.labels,
//         datasets: [{
//           data: data.values,
//           backgroundColor: [
//             '#36A2EB', '#FF6384', '#FFCD56', '#4BC0C0', '#9966FF',
//             '#C9CBCF', '#FF9F40', '#7FFFD4', '#FFD700', '#DC143C',
//           ],
//           hoverOffset: 4,
//         }]
//       },
//       options: {
//         responsive: false,
//         maintainAspectRatio: false,
//         plugins: {
//           legend: {
//             display: true,
//             position: 'bottom',
//           },
//           title: {
//             display: true,
//             text: 'Direct Expense Break up',
//             font: { size: 16, weight: 'bold' }
//           }
//         }
//       }
//     });

//     // ✅ Wait for chart rendering to finish
//     await new Promise((resolve) => setTimeout(resolve, 100));

//     // ✅ Convert canvas to Base64 using `toDataURL`
//     const base64 = canvas.toDataURL('image/png');
//     console.log("✅ Pie Chart generated:", base64);
//     return base64;
//   } catch (error) {
//     console.error("❌ Error generating pie chart:", error);
//     return null;
//   }
// };
//////////////////////////////////////////////////////////////////////////////////////////
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
          borderWidth: 1, // Creates the "3D" depth
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
