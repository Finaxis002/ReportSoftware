
import React, { useState, useEffect } from "react";
import PdfWithChart from "./PdfWithChart";
import PdfWithCombinedCharts from "./PdfWithCombinedCharts";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 20,
  },
  section: {
    margin: 10,
  },
  chartImage: {
    width: 400,
    height: 300,
    marginVertical: 20,
  },
});

const PdfAllChartsWrapper = ({ formData, totalExpenses, labels, dscr, currentRatio }) => {
  const [pieChart, setPieChart] = useState(null);
  const [barChart, setBarChart] = useState(null);
  const [dscrChart, setDscrChart] = useState(null);
  const [currentRatioChart, setCurrentRatioChart] = useState(null);

  const [chartsReady, setChartsReady] = useState(false);

  // ✅ Set `chartsReady` when all charts are available
  useEffect(() => {
    if (pieChart && barChart && dscrChart && currentRatioChart) {
      setChartsReady(true);
    }
  }, [pieChart, barChart, dscrChart, currentRatioChart]);

  // Render the chart components to generate charts
  return (
    <>
      <PdfWithChart
        formData={formData}
        totalExpenses={totalExpenses}
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
        <Document>
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
        </Document>
      )}
    </>
  );
};

export default PdfAllChartsWrapper;
