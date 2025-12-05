import React, { useState, useEffect } from "react";
import PdfWithChart from "./PdfWithChart";
import PdfWithCombinedCharts from "./PdfWithCombinedCharts";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

import { styles, stylesCOP, stylesMOF, styleExpenses } from "./Styles";



const PdfAllChartsWrapper = ({
  formData,
  totalExpenses,
  labels,
  dscr,
  currentRatio,
}) => {
  const [pieChart, setPieChart] = useState(null);
  const [barChart, setBarChart] = useState(null);
  const [dscrChart, setDscrChart] = useState(null);
  const [currentRatioChart, setCurrentRatioChart] = useState(null);

  const [chartsReady, setChartsReady] = useState(false);

  // ✅ Set `chartsReady` when all charts are available
  // useEffect(() => {
  //   if (pieChart && barChart && dscrChart && currentRatioChart) {
  //     setChartsReady(true);
  //   }
  // }, [pieChart, barChart, dscrChart, currentRatioChart]);

  useEffect(() => {
    const allChartsAvailable =
      typeof pieChart === "string" &&
      pieChart.startsWith("data:image") &&
      typeof barChart === "string" &&
      barChart.startsWith("data:image") &&
      typeof dscrChart === "string" &&
      dscrChart.startsWith("data:image") &&
      typeof currentRatioChart === "string" &&
      currentRatioChart.startsWith("data:image");
  
    if (allChartsAvailable) {
      setChartsReady(true);
    }
  }, [pieChart, barChart, dscrChart, currentRatioChart]);

  const currentRoute = window.location.pathname;

   const totalExpensestosend = currentRoute === '/generated-pdf' 
  ? totalExpenses  // Use totalExpenses when on /generated-pdf route
  : (formData?.computedData?.totalExpense || formData?.totalExpense || totalExpenses || []);
    console.log("formDATA in PdfAllChartsWrapper:", formData);

    console.log("✅ PdfAllChartsWrapper: totalExpensestosend:", totalExpensestosend);
  
  // Render the chart components to generate charts
  return (
    <>
      <PdfWithChart
        formData={formData}
        totalExpenses={totalExpensestosend}
        onPieChartReady={setPieChart}
        onBarChartReady={setBarChart}
      />

      <PdfWithCombinedCharts
        labels={labels}
        dscr={dscr}
        currentRatio={currentRatio}
        onDscrReady={setDscrChart}
        onCurrentRatioReady={setCurrentRatioChart}
      />

      {/* Once all charts are ready, render the PDF */}
      {chartsReady && (
        <Page size="A4" style={styles.page}>
          <View style={styles.section}>

            <Text>Direct Expense Breakup</Text>
            <Image src={pieChart} style={styles.chartImage} />
          </View>

          <View style={styles.section}>
            <Text>Revenue vs Expenses</Text>
            <Image src={barChart} style={styles.chartImage} />
          </View>

          <View style={styles.section}>
            <Text>DSCR Chart</Text>
            <Image src={dscrChart} style={styles.chartImage} />
          </View>

          <View style={styles.section}>
            <Text>Current Ratio</Text>
            <Image src={currentRatioChart} style={styles.chartImage} />
          </View>
        </Page>
      )}
    </>
  );
};

export default PdfAllChartsWrapper;
