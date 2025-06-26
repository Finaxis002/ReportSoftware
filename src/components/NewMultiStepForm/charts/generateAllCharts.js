import { extractChartData } from "../Utils/chartDataExtractor";
// import { generateBarChart } from "./barChart";
import {generateBarChart} from './newgenerateRevenueExpenseChart'
import { generatePieChart } from "./newgeneratePieChart";


const loadLineChartBase64 = (Comp, labels, values) =>
  new Promise((resolve) => {
    const mountPoint = document.createElement("div");
    document.body.appendChild(mountPoint);

    import("react-dom/client").then(({ createRoot }) => {
        
      const root = createRoot(mountPoint);
      root.render(
        <Comp
          labels={labels}
          values={values}
          onBase64Generated={(b64) => {
            root.unmount();
            document.body.removeChild(mountPoint);
            resolve(b64);
          }}
        />
      );
    });
  });

export const generateAllCharts = async (formData) => {
  const { years, revenue, expenses, pieData, dscr, currentRatio } =
    extractChartData(formData);

  const revenueExpenseChartBase64 = await generateBarChart({ formData });

  const pie = await generatePieChart(pieData);
  const pieLabels = pieData.map(x => x.name);
const pieValues = pieData.map(x => Number(x.value));
// Clean and normalize pie data
// const pieLabels = [];
// const pieValues = [];
// pieData.forEach(item => {
//   const val = Number(item.value);
//   if (!isNaN(val) && val > 0) {
//     pieLabels.push(item.name);
//     pieValues.push(val);
//   }
// });
// const total = pieValues.reduce((a, b) => a + b, 0);
// const normalizedPieValues = total > 0 ? pieValues.map(v => (v / total) * 100) : [];

// const testLabels = ['A', 'B', 'C', 'D'];
// const testValues = [25, 25, 25, 25]; // Sums to 100

// const pie = await generatePieChart({
//   labels: testLabels,
//   values: testValues,
// });

// const pie = await generatePieChart({
//   labels: pieLabels,
//   values: normalizedPieValues
// });


 
  const dscrB64 = await loadLineChartBase64(
    (await import("./LineChart")).default,
    years,
    dscr
  );
  const currentRatioB64 = await loadLineChartBase64(
    (await import("./CurrentRatioChart")).default,
    years,
    currentRatio
  );

  return {
     barChartBase64: revenueExpenseChartBase64,
    pieChartBase64: pie,
    dscrChartBase64: dscrB64,
    currentRatioBase64: currentRatioB64,
  };
};
