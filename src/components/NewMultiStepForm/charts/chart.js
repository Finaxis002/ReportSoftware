
//Version 3===================================================================================================================

import { Chart, registerables, ArcElement, Tooltip, Legend } from 'chart.js';

// ✅ Register controllers and elements
Chart.register(...registerables, ArcElement, Tooltip, Legend);

// Chart.register(shadowPlugin);

// ✅ Function to convert any CSS color to RGB
const parseColorToRGB = (color) => {
  // Create a temporary div to use browser's color parsing
  const tempDiv = document.createElement('div');
  tempDiv.style.color = color;
  document.body.appendChild(tempDiv);
  
  // Get computed color
  const computedColor = getComputedStyle(tempDiv).color;
  document.body.removeChild(tempDiv);
  
  // Parse rgb/rgba
  const match = computedColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  
  if (match) {
    return {
      r: parseInt(match[1]),
      g: parseInt(match[2]),
      b: parseInt(match[3]),
      a: match[4] ? parseFloat(match[4]) : 1
    };
  }
  
  // Fallback to black
  return { r: 0, g: 0, b: 0, a: 1 };
};

// ✅ Function to generate color variations based on a base color
const generateColorVariations = (baseColor) => {
  const colors = [];

  // Parse the base color to RGB
  const { r, g, b, a } = parseColorToRGB(baseColor);

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
  'skyblue': 'rgb(135, 206, 235)',  // Add this
  'navy': 'rgb(0, 0, 128)',         // You might want this too
  'maroon': 'rgb(128, 0, 0)',       // And this
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
    const formData = JSON.parse(localStorage.getItem("formData")) || {};

    // ✅ Get selected color from localStorage
    const selectedColor = formData?.color || localStorage.getItem("selectedColor");
    let backgroundColors = defaultColors;

   // ✅ If a color is selected, generate color palette based on it
if (selectedColor && selectedColor.trim() !== '') {
  let colorValue = selectedColor.trim().toLowerCase();

  // Convert color name to RGB value if it's a named color
  if (colorNameToRGB[colorValue]) {
    colorValue = colorNameToRGB[colorValue];
  } else if (!colorValue.startsWith('#') && !colorValue.startsWith('rgb')) {
    // If it's a CSS color name not in our mapping, convert it using a canvas
    try {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 1;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = colorValue;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      colorValue = `rgb(${r}, ${g}, ${b})`;
    } catch (e) {
      // Fallback to blue
      colorValue = colorNameToRGB['blue'];
    }
  }

  // Generate color variations from the selected color
  backgroundColors = generateColorVariations(colorValue);

  // If variations generation fails, use default
  if (backgroundColors.length === 0) {
    backgroundColors = defaultColors;
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
        // In your chart options, add shadow to the dataset instead:
        datasets: [{
          data: filteredValues,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 2,
          hoverOffset: 12,
          borderJoinStyle: 'round',
          spacing: 2,
          // Add subtle shadow here instead
          shadowColor: 'rgba(0, 0, 0, 0.1)',
          shadowBlur: 5,
          shadowOffsetX: 2,
          shadowOffsetY: 2,
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
