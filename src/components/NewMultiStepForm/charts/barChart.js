// import { Chart, registerables } from 'chart.js';

// Chart.register(...registerables);

// export const generateChart = async ({ labels, values, revenue, expenses }) => {
//   try {
//     const canvas = document.createElement('canvas');
//     canvas.width = 600;
//     canvas.height = 400;
//     const ctx = canvas.getContext('2d');

//     // ✅ Colors for better visual appeal
//     const backgroundColors = [
//       'rgba(75, 192, 192, 0.8)', // Light blue
//       'rgba(54, 162, 235, 0.8)', // Deep blue
//       'rgba(153, 102, 255, 0.8)', // Purple
//       'rgba(255, 159, 64, 0.8)', // Orange
//       'rgba(255, 205, 86, 0.8)', // Yellow
//       'rgba(201, 203, 207, 0.8)', // Grey
//     ];

//     const borderColors = backgroundColors.map(color =>
//       color.replace('0.8', '1')
//     );

//     if (Chart.getChart(ctx)) {
//           Chart.getChart(ctx).destroy();
//            }
    

//     // ✅ Create Pie Chart for Direct Expenses
//     new Chart(ctx, {
//       type: 'pie',
//       data: {
//         labels,
//         datasets: [{
//           label: 'Direct Expenses',
//           data: values,
//           backgroundColor: backgroundColors,
//           borderColor: borderColors,
//           borderWidth: 1,
//           hoverOffset: 8, // Lifts slice when hovered
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
//           tooltip: {
//             enabled: true,
//           }
//         },
//         animation: {
//           animateRotate: true,
//           animateScale: true
//         }
//       }
//     });

//     // ✅ Convert Pie Chart to Base64
//     const pieBase64 = canvas.toDataURL('image/png');

//     // ✅ Create Revenue vs Expense Chart
//     const canvas2 = document.createElement('canvas');
//     canvas2.width = 600;
//     canvas2.height = 400;
//     const ctx2 = canvas2.getContext('2d');

//     new Chart(ctx2, {
//       type: 'bar',
//       data: {
//         labels,
//         datasets: [
//           {
//             label: 'REVENUE',
//             data: revenue,
//             backgroundColor: 'rgba(54, 162, 235, 0.8)', // Blue for revenue
//             borderColor: 'rgba(54, 162, 235, 1)',
//             borderWidth: 1,
//           },
//           {
//             label: 'EXPENSES',
//             data: expenses,
//             backgroundColor: 'rgba(201, 203, 207, 0.8)', // Grey for expenses
//             borderColor: 'rgba(201, 203, 207, 1)',
//             borderWidth: 1,
//           }
//         ]
//       },
//       options: {
//         responsive: false,
//         maintainAspectRatio: false,
//         scales: {
//           y: {
//             beginAtZero: true,
//             ticks: {
//               callback: (value) => `${value.toLocaleString()}`
//             },
//             grid: {
//               color: 'rgba(255, 255, 255, 0.1)', // Light grid lines
//             }
//           },
//           x: {
//             grid: {
//               display: false
//             }
//           }
//         },
//         plugins: {
//           legend: {
//             display: true,
//             position: 'bottom'
//           },
//           tooltip: {
//             enabled: true
//           }
//         }
//       }
//     });

//     // ✅ Convert Revenue vs Expense Chart to Base64
//     const barBase64 = canvas2.toDataURL('image/png');
    

//     return { pieBase64, barBase64 };
//   } catch (error) {
//     console.error("❌ Error generating chart:", error);
//     return null;
//   }
// };


///////////////////////////////////////////////////////////////////////////////////////////////////////

// src/charts/barChart.js
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export const generateBarChart = async ({ labels, revenue, expenses }) => {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');

    if (Chart.getChart(ctx)) {
      Chart.getChart(ctx).destroy();
    }

    const labels = Array.from({ length: revenue.length }, (_, i) => (i + 1).toString());

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'REVENUE',
            data: revenue,
            backgroundColor: 'rgba(54, 162, 235, 0.8)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
          },
          {
            label: 'EXPENSES',
            data: expenses,
            backgroundColor: 'rgba(201, 203, 207, 0.8)',
            borderColor: 'rgba(201, 203, 207, 1)',
            borderWidth: 1,
          }
        ]
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => `${value.toLocaleString()}`
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'bottom'
          }
        }
      }
    });

    // ✅ Convert to Base64
    await new Promise((resolve) => setTimeout(resolve, 100));
    const base64 = canvas.toDataURL('image/png');
    console.log("✅ Bar Chart generated:", base64);

    return base64;
  } catch (error) {
    console.error("❌ Error generating bar chart:", error);
    return null;
  }
};
