import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

const COLOR_NAME_MAP = {
  Red: "#ef4444",
  Blue: "#3b82f6",
  Green: "#22c55e",
  Purple: "#8b5cf6",
  SkyBlue: "#0ea5e9",
  Orange: "#f97316",
  Pink: "#ec4899",
  Teal: "#14b8a6",
};

function toHex(color) {
  if (!color) return "#3674b5";
  if (color.startsWith("#")) return color;
  return COLOR_NAME_MAP[color] || color;
}

function hexToRgba(hex, alpha = 1) {
  if (!hex) return `rgba(54,116,181,${alpha})`;
  if (!hex.startsWith("#")) {
    // If not hex (i.e. unknown named color), opacity will NOT work, fallback to default with alpha
    return `rgba(54,116,181,${alpha})`;
  }
  let h = hex.slice(1);
  if (h.length === 3) h = h.split("").map(x => x + x).join("");
  const num = parseInt(h, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

export const generateBarChart = async ({ formData, selectedColor }) => {
  console.log('formData', formData);
  try {
    // Create and isolate canvas
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 500;
    const ctx = canvas.getContext("2d");
    
    // Style isolation
    canvas.style.display = 'block';
    canvas.style.background = 'white';

    // Data extraction with validation
    const getCleanData = (data) => {
      if (!Array.isArray(data)) return [];
      return data.map(item => {
        const num = parseFloat(item);
        return isNaN(num) ? 0 : num;
      });
    };

    let selectedRevenue = [];
    let selectedExpenses = [];

    // Revenue data
    const revenueType = formData?.Revenue?.formType;
    const revenueSource = revenueType === "Monthly" 
      ? formData?.Revenue?.totalRevenue 
      : formData?.Revenue?.totalRevenueForOthers;
    
    selectedRevenue = getCleanData(revenueSource);

    // Expenses data
    selectedExpenses = getCleanData(formData?.computedData?.totalExpense);

   
    // Validation
    if (selectedRevenue.length === 0 || selectedExpenses.length === 0) {
      
      return null;
    }

    // Chart configuration
    const labels = selectedRevenue.map((_, i) => `Year ${i + 1}`);
    const maxValue = Math.max(...[...selectedRevenue, ...selectedExpenses]);
    const chartPadding = maxValue * 0.2; // 20% padding

  const mainColor = hexToRgba(toHex(selectedColor), 1);      // full
    const expensesColor = hexToRgba(toHex(selectedColor), 0.5);   // faded

      
    // Create fresh Chart instance
    const chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Revenue",
            data: selectedRevenue,
            // backgroundColor: "rgba(54, 116, 181)",
            // borderColor: "rgba(54, 116, 181, 1)",
            backgroundColor: mainColor,
            borderColor: mainColor,
            borderWidth: 1
          },
          {
            label: "Expenses",
            data: selectedExpenses,
            // backgroundColor: "rgba(124, 185, 226)",
            // borderColor: "rgba(124, 185, 226, 1)",
             backgroundColor: expensesColor,
            borderColor: expensesColor,
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: false,
        scales: {
          y: {
            beginAtZero: true,
            max: maxValue + chartPadding,
            ticks: {
              callback: (value) => (value / 1e6).toFixed(1) + 'M',
              precision: 1
            },
            title: {
              display: true,
              text: "Amount (Millions)"
            }
          },
          x: {
            grid: { display: false }
          }
        },
        plugins: {
          legend: { position: "bottom" },
          tooltip: {
            callbacks: {
              label: (ctx) => 
                `${ctx.dataset.label}: $${ctx.raw.toLocaleString('en-US')}`
            }
          }
        }
      }
    });

    // Render and return
    await new Promise(resolve => setTimeout(resolve, 500));
    const imageData = canvas.toDataURL("image/png");
    chart.destroy(); // Clean up
    return imageData;
  } catch (error) {
    console.error("Chart generation failed:", error);
    return null;
  }
};