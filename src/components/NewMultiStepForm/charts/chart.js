//Version 1 ===================================================================================================================


// import { Chart, registerables, ArcElement, Tooltip, Legend } from 'chart.js';


// // ✅ Register controllers and elements
// Chart.register(...registerables,ArcElement, Tooltip, Legend);

// const shadowPlugin = {
//   id: 'shadowPlugin',
//   beforeDraw: (chart) => {
//     const ctx = chart.ctx;
//     ctx.save();
//     ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'; // ✅ Shadow color
//     ctx.shadowBlur = 10; // ✅ Blurry effect for depth
//     ctx.shadowOffsetX = 4; // ✅ Horizontal offset
//     ctx.shadowOffsetY = 4; // ✅ Vertical offset
//   },
//   afterDraw: (chart) => {
//     const ctx = chart.ctx;
//     ctx.restore(); // ✅ Reset shadow settings after draw
//   }
// };

// Chart.register(shadowPlugin);

// export const generateChart = async (data) => {
//   try {

//      // ✅ Step 1: Filter out zero values and their corresponding labels
//      const filteredLabels = [];
//      const filteredValues = [];
     
//      data.values.forEach((value, index) => {
//        if (value !== 0 && value !== null && value !== undefined) {
//          filteredLabels.push(data.labels[index]);
//          filteredValues.push(value);
//        }
//      });
//     // Create a hidden canvas for chart rendering
//     const canvas = document.createElement('canvas');
//     canvas.width = 500;
//     canvas.height = 500;
//     const ctx = canvas.getContext('2d');
//     // const storedColors = JSON.parse(localStorage.getItem("pieChartColors")) || [
//     //   'rgba(115, 210, 210)', 
//     //     'rgba(75, 192, 192, 0.5)',
//     //     'rgba(255, 180, 100)',
//     //     'rgba(35, 120, 120)', 
//     //     'rgba(220, 130, 40)', 
//     //     'rgba(255, 159, 64, 0.9)', 
//     // ];
//     // const backgroundColors = [
//     //     'rgba(115, 210, 210)', 
//     //     'rgba(75, 192, 192, 0.5)',
//     //     'rgba(255, 180, 100)',
//     //     'rgba(35, 120, 120)', 
//     //     'rgba(220, 130, 40)', 
//     //     'rgba(255, 159, 64, 0.9)', 
//     //   ];
//     const backgroundColors = [
//       'rgb(54, 116, 181)', 
//       'rgba(32, 164, 243, 1)',
//       'rgb(121, 206, 241)',
//       'rgb(32, 164, 243)', 
//       'rgba(87, 143, 202, 0.6)', 
//       'rgb(71, 130, 192)', 
//       'rgb(124, 185, 226)',
//       'rgb(87, 143, 202)',
//     ];
//     // const backgroundColors = storedColors;
//     const borderColors = backgroundColors.map(color =>
//         color.replace('0.8', '1')
//       );

//       // ✅ Create Gradient for Shadow Effect
//     const gradient = ctx.createLinearGradient(0, 0, 400, 400);
//     gradient.addColorStop(0, 'rgba(0, 0, 0, 0.4)');
//     gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');

//     // ✅ Destroy previous chart instance if any
//     if (Chart.getChart(ctx)) {
//       Chart.getChart(ctx).destroy();
//     }

//     Chart.defaults.font.family = 'Times New Roman';

//     // ✅ Create Pie Chart
//     new Chart(ctx, {
//       type: 'pie',
//       data: {
//         // labels: data.labels,
//         labels: filteredLabels,
//         datasets: [{
//           // data: data.values,
//           data: filteredValues,
//           backgroundColor: backgroundColors,
//           borderColor: borderColors,

//           borderWidth: 2, 
//           hoverOffset: 12,
          
//           borderJoinStyle: 'round',
//           spacing: 2

//         }]
//       },
//       options: {
//         responsive: false,
//         maintainAspectRatio: false,
        
        
//         plugins: {
//           legend: {
//             display: true,
//             position: 'right',
           
//             labels: {
//               color: '#000', // ✅ Black legend color
//               font: {
//                 size: 12,
//                 weight: 'bold',
//               },
//               usePointStyle: true,
//               boxWidth: 8,
//               padding: 20, 
//             },
//           },
//           tooltip: {
//             enabled: true,
//           },
//           datalabels: {
//             display: false, // ✅ Enable datalabels properly
//           },
          
//         },
//         animation: {
//             animateRotate: true,
//             animateScale: true
//           },
//           // layout: {
//           //   padding: {
//           //     left: 0, 
//           //     right: 120, // ✅ Increase this to move labels further to the right
//           //     top: 0, 
//           //     bottom: 0
//           //   }
//           // },
         
//       },
      
      
//     });

//     // ✅ Wait for chart rendering to finish
//     await new Promise((resolve) => setTimeout(resolve, 200));

//     // ✅ Convert canvas to Base64 using `toDataURL`
//     const base64 = canvas.toDataURL('image/png');
//     // console.log("✅ Pie Chart generated:", base64);
//     return base64;
//   } catch (error) {
//     // console.error("❌ Error generating pie chart:", error);
//     return null;
//   }
// };


//Version 2===================================================================================================================


// import { Chart, registerables, ArcElement, Tooltip, Legend } from 'chart.js';

// // ✅ Register controllers and elements
// Chart.register(...registerables, ArcElement, Tooltip, Legend);

// const shadowPlugin = {
//   id: 'shadowPlugin',
//   beforeDraw: (chart) => {
//     const ctx = chart.ctx;
//     ctx.save();
//     ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
//     ctx.shadowBlur = 10;
//     ctx.shadowOffsetX = 4;
//     ctx.shadowOffsetY = 4;
//   },
//   afterDraw: (chart) => {
//     const ctx = chart.ctx;
//     ctx.restore();
//   }
// };

// Chart.register(shadowPlugin);

// // ✅ Function to generate color variations based on a base color
// const generateColorVariations = (baseColor) => {
//   const colors = [];
  
//   // Parse the base color
//   let r, g, b, a = 1;
  
//   if (baseColor.startsWith('rgb')) {
//     const match = baseColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
//     if (match) {
//       r = parseInt(match[1]);
//       g = parseInt(match[2]);
//       b = parseInt(match[3]);
//       a = match[4] ? parseFloat(match[4]) : 1;
//     }
//   } else if (baseColor.startsWith('#')) {
//     const hex = baseColor.replace('#', '');
//     if (hex.length === 3) {
//       r = parseInt(hex[0] + hex[0], 16);
//       g = parseInt(hex[1] + hex[1], 16);
//       b = parseInt(hex[2] + hex[2], 16);
//     } else if (hex.length === 6) {
//       r = parseInt(hex.substring(0, 2), 16);
//       g = parseInt(hex.substring(2, 4), 16);
//       b = parseInt(hex.substring(4, 6), 16);
//     }
//   }
  
//   // Generate variations by adjusting brightness and saturation
//   for (let i = 0; i < 8; i++) {
//     const factor = 0.7 + (i * 0.05); // Vary brightness
//     const newR = Math.min(255, Math.max(0, Math.round(r * factor)));
//     const newG = Math.min(255, Math.max(0, Math.round(g * factor)));
//     const newB = Math.min(255, Math.max(0, Math.round(b * factor)));
    
//     // Adjust alpha for some variations
//     const newAlpha = i % 3 === 0 ? 0.6 : a;
    
//     colors.push(`rgba(${newR}, ${newG}, ${newB}, ${newAlpha})`);
//   }
  
//   return colors;
// };

// // ✅ Default blue color palette (your original colors)
// const defaultColors = [
//   'rgb(54, 116, 181)', 
//   'rgba(32, 164, 243, 1)',
//   'rgb(121, 206, 241)',
//   'rgb(32, 164, 243)', 
//   'rgba(87, 143, 202, 0.6)', 
//   'rgb(71, 130, 192)', 
//   'rgb(124, 185, 226)',
//   'rgb(87, 143, 202)',
// ];

// // ✅ Color mapping for common color names
// const colorNameToRGB = {
//   'green': 'rgb(46, 125, 50)',
//   'blue': 'rgb(33, 150, 243)',
//   'red': 'rgb(244, 67, 54)',
//   'purple': 'rgb(156, 39, 176)',
//   'orange': 'rgb(255, 152, 0)',
//   'yellow': 'rgb(255, 235, 59)',
//   'teal': 'rgb(0, 150, 136)',
//   'pink': 'rgb(233, 30, 99)',
//   'indigo': 'rgb(63, 81, 181)',
//   'cyan': 'rgb(0, 188, 212)',
//   'lime': 'rgb(205, 220, 57)',
//   'amber': 'rgb(255, 193, 7)',
//   'brown': 'rgb(121, 85, 72)',
//   'grey': 'rgb(158, 158, 158)',
//   'bluegrey': 'rgb(96, 125, 139)',
// };

// export const generateChart = async (data) => {
//   try {
//     // ✅ Step 1: Filter out zero values and their corresponding labels
//     const filteredLabels = [];
//     const filteredValues = [];
    
//     data.values.forEach((value, index) => {
//       if (value !== 0 && value !== null && value !== undefined) {
//         filteredLabels.push(data.labels[index]);
//         filteredValues.push(value);
//       }
//     });

//     // ✅ Get selected color from localStorage
//     const selectedColor = localStorage.getItem('selectedColor');
//     let backgroundColors = defaultColors;

//     // ✅ If a color is selected, generate color palette based on it
//     if (selectedColor && selectedColor.trim() !== '') {
//       let colorValue = selectedColor.trim().toLowerCase();
      
//       // Convert color name to RGB value if it's a named color
//       if (colorNameToRGB[colorValue]) {
//         colorValue = colorNameToRGB[colorValue];
//       }
      
//       // Generate color variations from the selected color
//       backgroundColors = generateColorVariations(colorValue);
      
//       // If the selected color is a valid hex or rgb but variations generation fails,
//       // create a simple palette with transparency variations
//       if (backgroundColors.length === 0) {
//         backgroundColors = defaultColors.map((color, index) => {
//           // Replace the blue tones with the selected color tones
//           const alpha = index % 3 === 0 ? 0.6 : 1;
//           return colorValue.replace(/rgb/, 'rgba').replace(/\)/, `, ${alpha})`);
//         });
//       }
//     }

//     // Create a hidden canvas for chart rendering
//     const canvas = document.createElement('canvas');
//     canvas.width = 500;
//     canvas.height = 500;
//     const ctx = canvas.getContext('2d');
    
//     const borderColors = backgroundColors.map(color =>
//       color.replace('0.6', '1').replace('0.8', '1')
//     );

//     // ✅ Create Gradient for Shadow Effect
//     const gradient = ctx.createLinearGradient(0, 0, 400, 400);
//     gradient.addColorStop(0, 'rgba(0, 0, 0, 0.4)');
//     gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');

//     // ✅ Destroy previous chart instance if any
//     if (Chart.getChart(ctx)) {
//       Chart.getChart(ctx).destroy();
//     }

//     Chart.defaults.font.family = 'Times New Roman';

//     // ✅ Create Pie Chart
//     new Chart(ctx, {
//       type: 'pie',
//       data: {
//         labels: filteredLabels,
//         datasets: [{
//           data: filteredValues,
//           backgroundColor: backgroundColors,
//           borderColor: borderColors,
//           borderWidth: 2,
//           hoverOffset: 12,
//           borderJoinStyle: 'round',
//           spacing: 2
//         }]
//       },
//       options: {
//         responsive: false,
//         maintainAspectRatio: false,
//         plugins: {
//           legend: {
//             display: true,
//             position: 'right',
//             labels: {
//               color: '#000',
//               font: {
//                 size: 12,
//                 weight: 'bold',
//               },
//               usePointStyle: true,
//               boxWidth: 8,
//               padding: 20,
//             },
//           },
//           tooltip: {
//             enabled: true,
//           },
//           datalabels: {
//             display: false,
//           },
//         },
//         animation: {
//           animateRotate: true,
//           animateScale: true
//         },
//       },
//     });

//     // ✅ Wait for chart rendering to finish
//     await new Promise((resolve) => setTimeout(resolve, 200));

//     // ✅ Convert canvas to Base64 using `toDataURL`
//     const base64 = canvas.toDataURL('image/png');
//     return base64;
//   } catch (error) {
//     console.error("❌ Error generating pie chart:", error);
//     return null;
//   }
// };

// // ✅ Helper function to save selected color to localStorage
// export const saveSelectedColor = (color) => {
//   try {
//     localStorage.setItem('selectedColor', color);
//     return true;
//   } catch (error) {
//     console.error("❌ Error saving color to localStorage:", error);
//     return false;
//   }
// };

// // ✅ Helper function to get current selected color
// export const getSelectedColor = () => {
//   return localStorage.getItem('selectedColor') || null;
// };

// // ✅ Helper function to reset to default colors


// export const resetToDefaultColors = () => {
//   localStorage.removeItem('selectedColor');
// };



//Version 3===================================================================================================================

import { Chart, registerables, ArcElement, Tooltip, Legend } from 'chart.js';

// ✅ Register controllers and elements
Chart.register(...registerables, ArcElement, Tooltip, Legend);

const shadowPlugin = {
  id: 'shadowPlugin',
  beforeDraw: (chart) => {
    const ctx = chart.ctx;
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 4;
  },
  afterDraw: (chart) => {
    const ctx = chart.ctx;
    ctx.restore();
  }
};

Chart.register(shadowPlugin);

// ✅ Function to generate color variations based on a base color
const generateColorVariations = (baseColor) => {
  const colors = [];
  
  // Parse the base color
  let r, g, b, a = 1;
  
  if (baseColor.startsWith('rgb')) {
    const match = baseColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (match) {
      r = parseInt(match[1]);
      g = parseInt(match[2]);
      b = parseInt(match[3]);
      a = match[4] ? parseFloat(match[4]) : 1;
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
    }
  }
  
  // Generate variations by adjusting brightness and saturation
  for (let i = 0; i < 8; i++) {
    const factor = 0.7 + (i * 0.05); // Vary brightness
    const newR = Math.min(255, Math.max(0, Math.round(r * factor)));
    const newG = Math.min(255, Math.max(0, Math.round(g * factor)));
    const newB = Math.min(255, Math.max(0, Math.round(b * factor)));
    
    // Adjust alpha for some variations
    const newAlpha = i % 3 === 0 ? 0.6 : a;
    
    colors.push(`rgba(${newR}, ${newG}, ${newB}, ${newAlpha})`);
  }
  
  return colors;
};

// ✅ Default blue color palette (your original colors)
const defaultColors = [
  'rgb(54, 116, 181)', 
  'rgba(32, 164, 243, 1)',
  'rgb(121, 206, 241)',
  'rgb(32, 164, 243)', 
  'rgba(87, 143, 202, 0.6)', 
  'rgb(71, 130, 192)', 
  'rgb(124, 185, 226)',
  'rgb(87, 143, 202)',
];

// ✅ Color mapping for common color names
const colorNameToRGB = {
  'green': 'rgb(46, 125, 50)',
  'blue': 'rgb(33, 150, 243)',
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

export const generateChart = async (data) => {
  try {
    // ✅ Step 1: Filter out zero values and their corresponding labels
    const filteredLabels = [];
    const filteredValues = [];
    
    data.values.forEach((value, index) => {
      if (value !== 0 && value !== null && value !== undefined) {
        filteredLabels.push(data.labels[index]);
        filteredValues.push(value);
      }
    });

    // ✅ Get selected color from localStorage
    const selectedColor = localStorage.getItem('selectedColor');
    let backgroundColors = defaultColors;

    // ✅ If a color is selected, generate color palette based on it
    if (selectedColor && selectedColor.trim() !== '') {
      let colorValue = selectedColor.trim().toLowerCase();
      
      // Convert color name to RGB value if it's a named color
      if (colorNameToRGB[colorValue]) {
        colorValue = colorNameToRGB[colorValue];
      }
      
      // Generate color variations from the selected color
      backgroundColors = generateColorVariations(colorValue);
      
      // If the selected color is a valid hex or rgb but variations generation fails,
      // create a simple palette with transparency variations
      if (backgroundColors.length === 0) {
        backgroundColors = defaultColors.map((color, index) => {
          // Replace the blue tones with the selected color tones
          const alpha = index % 3 === 0 ? 0.6 : 1;
          return colorValue.replace(/rgb/, 'rgba').replace(/\)/, `, ${alpha})`);
        });
      }
    }

    // Create a hidden canvas for chart rendering
    const canvas = document.createElement('canvas');
    canvas.width = 500;
    canvas.height = 500;
    const ctx = canvas.getContext('2d');
    
    const borderColors = backgroundColors.map(color =>
      color.replace('0.6', '1').replace('0.8', '1')
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
        labels: filteredLabels,
        datasets: [{
          data: filteredValues,
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
            position: 'right',
            labels: {
              color: '#000',
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
            display: false,
          },
        },
        animation: {
          animateRotate: true,
          animateScale: true
        },
      },
    });

    // ✅ Wait for chart rendering to finish
    await new Promise((resolve) => setTimeout(resolve, 200));

    // ✅ Convert canvas to Base64 using `toDataURL`
    const base64 = canvas.toDataURL('image/png');
    return base64;
  } catch (error) {
    console.error("❌ Error generating pie chart:", error);
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
