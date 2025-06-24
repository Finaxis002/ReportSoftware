import { extractChartData } from "../Utils/chartDataExtractor";
// import { generateBarChart } from "./barChart";
import {generateBarChart} from './newgenerateRevenueExpenseChart'
import { generateChart as generatePieChart } from "./chart";


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
 console.log("pie chart", pie)
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
