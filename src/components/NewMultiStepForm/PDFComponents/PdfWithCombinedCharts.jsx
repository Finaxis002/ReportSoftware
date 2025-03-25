import React from "react";
import PdfWithCurrentRatioChart from "./PdfWithCurrentRatioChart";
import PdfWithLineChart from "./PdfWithLineChart";
import { Page, StyleSheet, View } from "@react-pdf/renderer";

const PdfWithCombinedCharts = ({
  labels = [],
  currentRatio = [],
  dscr = [],
}) => {
  if (!labels.length || !dscr.length) {
    console.warn("❌ Missing data for DSCR chart");
    return null;
  }

  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.chartContainer}>
        {/* ✅ Flexbox styling applied */}
        <View style={styles.chartWrapper}>
          <PdfWithLineChart labels={labels} dscr={dscr} />
        </View>
        <View style={styles.chartWrapper}>
          <PdfWithCurrentRatioChart labels={labels} currentRatio={currentRatio} />
        </View>
      </View>
    </Page>
  );
};

const styles = StyleSheet.create({
  page: {
    padding: 20,
    flexDirection: "column", // ✅ Use flexDirection instead of display
    backgroundColor: "#fff",
  },
  chartContainer: {
    justifyContent: "space-between", // ✅ Add space between charts
    alignItems: "center", // ✅ Align charts vertically
    gap: 10,
  },
  chartWrapper: {
    // width: "48%", // ✅ Each chart will take up 48% of the width
  },
});

export default PdfWithCombinedCharts;
