import { Chart, registerables } from "chart.js";

Chart.register(...registerables);


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
      // revenue: "rgba(75, 192, 192, 0.8)",
      // expenses: "rgba(255, 159, 64, 0.8)",
      revenue: "rgb(54, 116, 181)",
      expenses: "rgb(124, 185, 226)",
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











// import { Chart, registerables } from "chart.js";
// Chart.register(...registerables);

// export const generateBarChart = async ({ revenue, expenses, formData }) => {
//   try {
//     const canvas = document.createElement("canvas");
//     canvas.width = 600;
//     canvas.height = 500;
//     const ctx = canvas.getContext("2d");

//     const revenueType = formData?.Revenue?.formType;
//     let selectedRevenue = [];

//     if (revenueType === "Monthly" && formData?.Revenue?.totalRevenue) {
//       selectedRevenue = formData.Revenue.totalRevenue;
//     } else if (revenueType === "Others" && formData?.Revenue?.totalRevenueForOthers) {
//       selectedRevenue = formData.Revenue.totalRevenueForOthers;
//     }

//     // 🧼 Clean the data before use
//     const cleanRevenue = JSON.parse(JSON.stringify(selectedRevenue));
//     const cleanExpenses = JSON.parse(JSON.stringify(expenses));

//     console.log("📊 Revenue Type:", revenueType);
//     console.log("📊 Selected Revenue Data:", cleanRevenue);
//     console.log("📊 Expenses Data:", cleanExpenses);

//     if (cleanRevenue.length === 0) return null;

//     const labels = Array.from({ length: cleanRevenue.length }, (_, i) => (i + 1).toString());

//     // Convert to Crores
//     const revenueInCr = cleanRevenue.map(val => val / 10000000);
//     const expensesInCr = cleanExpenses.map(val => val / 10000000);

//     const maxYData = Math.max(...revenueInCr, ...expensesInCr);
//     const maxYValue = Math.ceil(maxYData * 1.1);
//     const yInterval = Math.ceil(maxYValue / 5);

//     console.log("✅ Revenue in Cr:", revenueInCr);
//     console.log("✅ Expenses in Cr:", expensesInCr);

//     Chart.defaults.font.family = "Times New Roman";
//     const colors = JSON.parse(localStorage.getItem("barChartColors")) || {
//       revenue: "rgb(54, 116, 181)",
//       expenses: "rgb(124, 185, 226)",
//     };

//     new Chart(ctx, {
//       type: "bar",
//       data: {
//         labels,
//         datasets: [
//           {
//             label: "Revenue",
//             data: revenueInCr,
//             backgroundColor: colors.revenue,
//             borderColor: colors.revenue,
//             borderWidth: 1,
//           },
//           {
//             label: "Expenses",
//             data: expensesInCr,
//             backgroundColor: colors.expenses,
//             borderColor: colors.expenses,
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
//             ticks: {
//               stepSize: yInterval,
//               callback: value => value.toFixed(1) + " Cr",
//               font: { size: 12 },
//               color: "#000000",
//             },
//             title: {
//               display: true,
//               text: "Value",
//               font: { size: 12 },
//               color: "#000000",
//             },
//             grid: {
//               color: "rgba(255, 255, 255, 0.1)",
//               drawBorder: true,
//             },
//             border: {
//               color: "#000000",
//             },
//           },
//           x: {
//             ticks: {
//               font: { size: 12 },
//               color: "#000000",
//             },
//             grid: {
//               display: false,
//             },
//             border: {
//               color: "#000000",
//             },
//           },
//         },
//         plugins: {
//           legend: {
//             position: "bottom",
//             labels: {
//               color: "#000000",
//               font: { size: 12 },
//             },
//           },
//         },
//       },
//     });

//     await new Promise(resolve => setTimeout(resolve, 200));
//     return canvas.toDataURL("image/png");

//   } catch (error) {
//     console.error("Error generating bar chart:", error);
//     return null;
//   }
// };

