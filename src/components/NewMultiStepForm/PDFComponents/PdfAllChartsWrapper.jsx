import React, { useState } from "react";
import PdfWithChart from "./PdfWithChart";
import PdfWithCombinedCharts from "./PdfWithCombinedCharts";
import { Document, Page, View, Text } from "@react-pdf/renderer";

const PdfAllChartsWrapper = ({ formData, totalExpenses, labels, dscr, currentRatio }) => {
  const [pieChart, setPieChart] = useState(null);
  const [barChart, setBarChart] = useState(null);
  const [dscrChart, setDscrChart] = useState(null);
  const [currentRatioChart, setCurrentRatioChart] = useState(null);

  const allReady = pieChart && barChart && dscrChart && currentRatioChart;

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

      {!allReady && (
        <Document>
          <Page size="A4">
            <View style={{ padding: 20 }}>
              <Text>Generating charts... Please wait.</Text>
            </View>
          </Page>
        </Document>
      )}
    </>
  );
};

export default PdfAllChartsWrapper;
