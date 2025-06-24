import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

export const generateBarChart = async ({ formData }) => {
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

    console.log("Revenue Data:", selectedRevenue);
    console.log("Expenses Data:", selectedExpenses);

    // Validation
    if (selectedRevenue.length === 0 || selectedExpenses.length === 0) {
      console.error("Missing valid data");
      return null;
    }

    // Chart configuration
    const labels = selectedRevenue.map((_, i) => `Year ${i + 1}`);
    const maxValue = Math.max(...[...selectedRevenue, ...selectedExpenses]);
    const chartPadding = maxValue * 0.2; // 20% padding

    // Create fresh Chart instance
    const chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Revenue",
            data: selectedRevenue,
            backgroundColor: "rgba(54, 116, 181, 0.7)",
            borderColor: "rgba(54, 116, 181, 1)",
            borderWidth: 1
          },
          {
            label: "Expenses",
            data: selectedExpenses,
            backgroundColor: "rgba(124, 185, 226, 0.7)",
            borderColor: "rgba(124, 185, 226, 1)",
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