import React, { useState, useEffect } from 'react';
import { Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import LineChart from '../charts/LineChart';
import { styles, stylesCOP, stylesMOF, styleExpenses } from "./Styles";

const MyDocument = ({ chartBase64 }) => (
  <View>
    <View style={styles.centeredTextContainer}>
      <Text style={styles.Charttitle}>DSCR</Text>
    </View>
    <Image src={chartBase64} style={styles.chart} />
  </View>
);



const PdfWithLineChart = ({ labels = [], dscr = [], onDscrReady }) => {
  const [chartBase64, setChartBase64] = useState(null);

  const formattedDSCR = dscr.map(value => Number(value.toFixed(2)));

  useEffect(() => {
    if (labels.length > 0 && formattedDSCR.length > 0) {
      setChartBase64(null); // Reset chart until it regenerates
    }
  }, [labels, dscr]);

  // ✅ Second useEffect to call onDscrReady AFTER chartBase64 is available
  useEffect(() => {
    if (chartBase64 && typeof chartBase64 === 'string' && chartBase64.startsWith('data:image')) {
      if (onDscrReady) onDscrReady(chartBase64);
    }
  }, [chartBase64, onDscrReady]);

  return (
    <>
      {/* ✅ Render chart generation component */}
      {labels.length > 0 && formattedDSCR.length > 0 && !chartBase64 && (
        <LineChart
          labels={labels}
          values={formattedDSCR}
          onBase64Generated={(base64) => {
            setChartBase64(base64);
            if (onDscrReady) onDscrReady(base64);
          }}
        />
      )}

      {/* ✅ Only render the chart in the PDF once it’s ready */}
      {chartBase64 && <MyDocument chartBase64={chartBase64} />}
    </>
  );
};

export default PdfWithLineChart;
