import React, { useState } from "react";
import { Page, View, Text, Image } from "@react-pdf/renderer";
import ChartGenerator from "./ChartGenerator";

const DirectExpenseBreakUp = () => {
  const [chartImage, setChartImage] = useState(null);

  const handleChartReady = (imageUrl) => {
    setChartImage(imageUrl);
  };

  return (
    <>
      {/* Generate the chart and pass the base64 to PDF */}
      <ChartGenerator onChartReady={handleChartReady} />

      {/* PDF Content */}
      {chartImage && (
        <Page size="A4" style={{ padding: 20 }}>
          <View>
            <Text style={{ fontSize: 20, marginBottom: 10 }}>
              Direct Expense Break Up
            </Text>
            <Image
              src={chartImage}
              style={{ width: 300, height: 300 }}
            />
          </View>
        </Page>
      )}
    </>
  );
};

export default DirectExpenseBreakUp;
