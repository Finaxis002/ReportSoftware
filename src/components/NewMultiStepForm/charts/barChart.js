///version1======================================================================================================================



// import { Chart, registerables } from "chart.js";

// Chart.register(...registerables);


// export const generateBarChart = async ({
//   revenue,
//   expenses,
//   formData,
// }) => {
//   try {
//     const canvas = document.createElement("canvas");
//     canvas.width = 600;
//     canvas.height = 500;
//     const ctx = canvas.getContext("2d");

//     const revenueType = formData?.Revenue?.formType;
//     let selectedRevenue = [];

//     if (revenueType === "Monthly" && formData?.Revenue?.totalRevenue) {
//       selectedRevenue = formData.Revenue.totalRevenue;
//     } else if (
//       revenueType === "Others" &&
//       formData?.Revenue?.totalRevenueForOthers
//     ) {
//       selectedRevenue = formData.Revenue.totalRevenueForOthers;
//     }

//     if (selectedRevenue.length === 0) return null;

//     // ✅ Create labels based on revenue data length
//     const labels = Array.from({ length: selectedRevenue.length }, (_, i) =>
//       (i + 1).toString()
//     );

//     const lastYearRevenue =
//       selectedRevenue[selectedRevenue.length - 1] || 0;
//     const maxYValue = lastYearRevenue + lastYearRevenue * 0.5;
//     const yInterval = Math.round(maxYValue / 4);

//     Chart.defaults.font.family = "Times New Roman";
//     const colors = JSON.parse(localStorage.getItem("barChartColors")) || {
//       // revenue: "rgba(75, 192, 192, 0.8)",
//       // expenses: "rgba(255, 159, 64, 0.8)",
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
//             data: selectedRevenue,
//             backgroundColor: colors.revenue,
//             borderColor: colors.revenue,
//             borderWidth: 1,
//           },
//           {
//             label: "Expenses",
//             data: expenses,
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
//               callback: (value) => {
//                 if (value >= 1e7) return (value / 1e7).toFixed(1) + " Cr";
//                 if (value >= 1e5) return (value / 1e5).toFixed(1) + " L";
//                 if (value >= 1e3) return (value / 1e3).toFixed(1) + " K";
//                 return value.toLocaleString();
//               },
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

//     await new Promise((resolve) => setTimeout(resolve, 200));
//     return canvas.toDataURL("image/png");
//   } catch (error) {
//     console.error("Error generating bar chart:", error);
//     return null;
//   }
// };







///version2======================================================================================================================


import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

// ✅ Function to generate color variations for bar chart
const generateBarChartColors = (baseColor) => {
  try {
    let r, g, b;
    
    // Parse the base color
    if (baseColor.startsWith('rgb')) {
      const match = baseColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
      if (match) {
        r = parseInt(match[1]);
        g = parseInt(match[2]);
        b = parseInt(match[3]);
      } else {
        return null;
      }
    } else if (baseColor.startsWith('#')) {
      const hex = baseColor.replace('#', '');
      if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
      } else if (hex.length === 6) {
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
      } else {
        return null;
      }
    } else {
      return null;
    }
    
    // Generate two colors: one for revenue (darker) and one for expenses (lighter)
    const revenueColor = `rgb(${r}, ${g}, ${b})`;
    
    // Create lighter version for expenses
    const lightenFactor = 1.4;
    const expensesR = Math.min(255, Math.round(r * lightenFactor));
    const expensesG = Math.min(255, Math.round(g * lightenFactor));
    const expensesB = Math.min(255, Math.round(b * lightenFactor));
    const expensesColor = `rgb(${expensesR}, ${expensesG}, ${expensesB})`;
    
    return {
      revenue: revenueColor,
      expenses: expensesColor
    };
  } catch (error) {
    console.error("Error generating bar chart colors:", error);
    return null;
  }
};

// ✅ Color mapping for common color names
const colorNameToRGB = {
  'green': 'rgb(46, 125, 50)',
  'blue': 'rgb(54, 116, 181)', // Changed to match your original blue
  'red': 'rgb(244, 67, 54)',
  'purple': 'rgb(156, 39, 176)',
  'orange': 'rgb(255, 152, 0)',
  'yellow': 'rgb(255, 235, 59)',
  'teal': 'rgb(0, 150, 136)',
  'pink': 'rgb(233, 30, 99)',
  'indigo': 'rgb(63, 81, 181)',
  'cyan': 'rgb(0, 188, 212)',
  'lime': 'rgb(205, 220, 57)',
  'amber': 'rgb(255, 193, 7)',
  'brown': 'rgb(121, 85, 72)',
  'grey': 'rgb(158, 158, 158)',
  'bluegrey': 'rgb(96, 125, 139)',
};

export const generateBarChart = async ({
  revenue,
  expenses,
  formData,
}) => {
  try {
    //  const expenses = formData?.computedData?.totalExpense || formData?.totalExpense || [];
    console.log("Expenses in generateBarChart:", expenses);
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
    // const formData = JSON.parse(localStorage.getItem("formData")) || {};
    
    // ✅ Get selected color from localStorage
    const selectedColor = formData?.color || localStorage.getItem("selectedColor");
    let colors;
    
    if (selectedColor && selectedColor.trim() !== '') {
      let colorValue = selectedColor.trim().toLowerCase();
      
      // Convert color name to RGB value if it's a named color
      if (colorNameToRGB[colorValue]) {
        colorValue = colorNameToRGB[colorValue];
      }
      
      // Generate bar chart colors from the selected color
      const generatedColors = generateBarChartColors(colorValue);
      
      if (generatedColors) {
        colors = generatedColors;
      } else {
        // Fallback to localStorage colors or default if generation fails
        colors = JSON.parse(localStorage.getItem("barChartColors")) || {
          revenue: "rgb(54, 116, 181)",
          expenses: "rgb(124, 185, 226)",
        };
      }
    } else {
      // No color selected, use localStorage colors or default
      colors = JSON.parse(localStorage.getItem("barChartColors")) || {
        revenue: "rgb(54, 116, 181)",
        expenses: "rgb(124, 185, 226)",
      };
    }

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

// ✅ Helper function to save selected color to localStorage
export const saveSelectedColor = (color) => {
  try {
    localStorage.setItem('selectedColor', color);
    return true;
  } catch (error) {
    console.error("❌ Error saving color to localStorage:", error);
    return false;
  }
};

// ✅ Helper function to get current selected color
export const getSelectedColor = () => {
  return localStorage.getItem('selectedColor') || null;
};

// ✅ Helper function to reset to default colors
export const resetToDefaultColors = () => {
  localStorage.removeItem('selectedColor');
};






///version3======================================================================================================================




