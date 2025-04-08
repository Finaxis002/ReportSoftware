

import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

// export const generateBarChart = async ({
//   labels,
//   revenue,
//   expenses,
//   formData,
// }) => {
//   // console.log("form data in bar chart", formData);
//   try {
//     const canvas = document.createElement("canvas");
//     canvas.width = 600;
//     canvas.height = 500;
//     canvas.style.width = "300px";
//     canvas.style.height = "250px";

//     const ctx = canvas.getContext("2d");

//     if (Chart.getChart(ctx)) {
//       Chart.getChart(ctx).destroy();
//     }

//     const labels = Array.from({ length: revenue.length }, (_, i) =>
//       (i + 1).toString()
//     );

//     const revenueType = formData?.Revenue?.formType ; 
//     // console.log("revenue type from bar chart",revenueType )
//     let selectedRevenue = [];
//     if (revenueType === "Monthly" && formData?.Revenue?.totalRevenue) {
//       selectedRevenue = formData.Revenue.totalRevenue;
//       // console.log("this is selected revenue from monthly ",selectedRevenue)
//     } else if (
//       revenueType === "Others" &&
//       formData?.Revenue?.totalRevenueForOthers
//     ) {
//       selectedRevenue = formData.Revenue.totalRevenueForOthers;
//       // console.log("this is selected revenue from others ",selectedRevenue)
//     }

//     if (selectedRevenue.length === 0) {
//       // console.error("❌ No revenue data available for the selected type.");
//       return null;
//     }


//     // ✅ Get the last year's revenue
//     // const lastYearRevenue = formData?.Revenue?.totalRevenueForOthers
//     //   ? formData.Revenue.totalRevenueForOthers[
//     //       formData.Revenue.totalRevenueForOthers.length - 1
//     //     ]
//     //   : 0;
//       const lastYearRevenue = selectedRevenue[selectedRevenue.length - 1] || 0;
//       // console.log("revenue from bar chart",lastYearRevenue)
//     // ✅ Set max value as last year revenue + 50% of last year revenue
//     const maxYValue = lastYearRevenue + lastYearRevenue * 0.5;

    
   

//     // ✅ Set interval by dividing into 4 parts
//     const yInterval = Math.round(maxYValue / 4);

//     if (
//       !formData?.Revenue?.totalRevenueForOthers ||
//       formData.Revenue.totalRevenueForOthers.length === 0
//     ) {
//       // console.error("❌ Revenue data is missing or empty");
//       return null;
//     }

//     Chart.defaults.font.family = "Times New Roman";
//     const colors = JSON.parse(localStorage.getItem("barChartColors")) || {
//       revenue: "rgba(75, 192, 192, 0.8)",
//       expenses: "rgba(255, 159, 64, 0.8)",
//     };
//     // let storedColors = JSON.parse(localStorage.getItem("barChartColors"));

//     // if (Array.isArray(storedColors)) {
//     //   storedColors = {
//     //     revenue: storedColors[0] || "rgba(75, 192, 192, 0.8)",
//     //     expenses: storedColors[1] || "rgba(255, 159, 64, 0.8)"
//     //   };
//     // }
    
//     // const colors = storedColors || {
//     //   revenue: "rgba(75, 192, 192, 0.8)",
//     //   expenses: "rgba(255, 159, 64, 0.8)",
//     // };

//     new Chart(ctx, {
//       type: "bar",
//       data: {
//         labels,
//         datasets: [
//           {
//             label: "Revenue",
//             data: selectedRevenue,
//             backgroundColor:" rgba(75, 192, 192, 0.8)", //(colors.revenue)
//             borderColor: "rgb(75, 192, 192)",//(colors.revenue)
//             borderWidth: 1,
//           },
//           {
//             label: "Expenses",
//             data: expenses,
//             backgroundColor: "rgba(255, 159, 64, 0.8)", //colors.expenses
//             borderColor: "rgb(255, 159, 64)", //colors.expenses,
//             borderWidth: 1,
//           },
//         ],
//       },
//       options: {
//         responsive: false,
//         maintainAspectRatio: false,
//         scales: {
//           y: {
//             beginAtZero: true,
//             min: 0,
//             max: maxYValue,
//             title: {
//               display: true,
//               text: "Value",
//               color: "#000",
//               font: {
//                 size: 12,
//                 weight: "normal",
//               },
//             },
//             ticks: {
//               color: "#000000",
//               stepSize: yInterval,
//               // callback: (value) => `${value.toLocaleString()}`,
//               callback: (value) => {
//                 if (value >= 10000000)
//                   return (value / 10000000).toFixed(1) + " Cr";
//                 if (value >= 100000) return (value / 100000).toFixed(1) + " L";
//                 if (value >= 1000) return (value / 1000).toFixed(1) + " K";
//                 return value.toLocaleString();
//               },
//               font: {
//                 size: 12,
//               },
//               padding: 0,
//               align: "end",
//             },
//             grid: {
//               color: "rgba(255, 255, 255, 0.1)", // ✅ Light grid lines for visibility
//               drawBorder: true,
//             },
//             border: {
//               color: "#000000", // ✅ White axis line
//             },
//             labels: {
//               color: "#000000", // ✅ White legend text
//               font: {
//                 size: 10,
//                 weight: "400",
//               },
//             },
//           },
//           x: {
//             grid: {
//               display: false,
//               color: "rgba(255, 255, 255, 0.3)",
//               drawBorder: true,
//             },
//             ticks: {
//               color: "#000000",
//               font: {
//                 size: 12,
//               },
//             },
//             border: {
//               color: "#000000",
//             },
//             font: {
//               size: 12,
//               weight: "bold",
//             },
//           },
//         },
//         plugins: {
//           legend: {
//             display: true,
//             position: "bottom",
//             labels: {
//               color: "#000000",
//               font: {
//                 size: 12,
//                 weight: "normal",
//               },
//             },
//           },
//           datalabels: {
//             display: false, // ✅ Enable datalabels properly
//           },
//         },
       
//       },
//     });

//     // ✅ Convert to Base64
//     await new Promise((resolve) => setTimeout(resolve, 200));
//     const base64 = canvas.toDataURL("image/png");
//     // console.log("✅ Bar Chart generated:", base64);
//     return base64;
//   } catch (error) {
//     console.error("❌ Error generating bar chart:", error);
//     return null;
//   }
// };
export const generateBarChart = async ({
  revenue,
  expenses,
  formData,
}) => {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 500;
    const ctx = canvas.getContext("2d");

    const revenueType = formData?.Revenue?.formType;
    let selectedRevenue = [];

    if (revenueType === "Monthly" && formData?.Revenue?.totalRevenue) {
      selectedRevenue = formData.Revenue.totalRevenue;
    } else if (
      revenueType === "Others" &&
      formData?.Revenue?.totalRevenueForOthers
    ) {
      selectedRevenue = formData.Revenue.totalRevenueForOthers;
    }

    if (selectedRevenue.length === 0) return null;

    // ✅ Create labels based on revenue data length
    const labels = Array.from({ length: selectedRevenue.length }, (_, i) =>
      (i + 1).toString()
    );

    const lastYearRevenue =
      selectedRevenue[selectedRevenue.length - 1] || 0;
    const maxYValue = lastYearRevenue + lastYearRevenue * 0.5;
    const yInterval = Math.round(maxYValue / 4);

    Chart.defaults.font.family = "Times New Roman";
    const colors = JSON.parse(localStorage.getItem("barChartColors")) || {
      revenue: "rgba(75, 192, 192, 0.8)",
      expenses: "rgba(255, 159, 64, 0.8)",
    };

    new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Revenue",
            data: selectedRevenue,
            backgroundColor: colors.revenue,
            borderColor: colors.revenue,
            borderWidth: 1,
          },
          {
            label: "Expenses",
            data: expenses,
            backgroundColor: colors.expenses,
            borderColor: colors.expenses,
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            min: 0,
            max: maxYValue,
            ticks: {
              stepSize: yInterval,
              callback: (value) => {
                if (value >= 1e7) return (value / 1e7).toFixed(1) + " Cr";
                if (value >= 1e5) return (value / 1e5).toFixed(1) + " L";
                if (value >= 1e3) return (value / 1e3).toFixed(1) + " K";
                return value.toLocaleString();
              },
              font: { size: 12 },
              color: "#000000",
            },
            title: {
              display: true,
              text: "Value",
              font: { size: 12 },
              color: "#000000",
            },
            grid: {
              color: "rgba(255, 255, 255, 0.1)",
              drawBorder: true,
            },
            border: {
              color: "#000000",
            },
          },
          x: {
            ticks: {
              font: { size: 12 },
              color: "#000000",
            },
            grid: {
              display: false,
            },
            border: {
              color: "#000000",
            },
          },
        },
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "#000000",
              font: { size: 12 },
            },
          },
        },
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 200));
    return canvas.toDataURL("image/png");
  } catch (error) {
    console.error("Error generating bar chart:", error);
    return null;
  }
};
