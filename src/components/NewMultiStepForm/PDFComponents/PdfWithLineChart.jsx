import React, { useState, useEffect } from 'react';
import { Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import LineChart from '../charts/LineChart';

const MyDocument = ({ chartBase64 }) => (
  <View>
    <View style={styles.centeredTextContainer}>
      <Text style={styles.title}>DSCR</Text>
    </View>
    <Image src={chartBase64} style={styles.chart} />
  </View>
);

const styles = StyleSheet.create({
  centeredTextContainer: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  chart: {
    width: 400,
    height: 250,
    marginVertical: 10,
    alignSelf: 'center',
  },
  loading: {
    fontSize: 14,
    textAlign: 'center',
    color: '#999',
  },
});

const PdfWithLineChart = ({ labels = [], dscr = [], onDscrReady }) => {
  const [chartBase64, setChartBase64] = useState(null);

  const formattedDSCR = dscr.map(value => Number(value.toFixed(2)));

  useEffect(() => {
    if (labels.length > 0 && formattedDSCR.length > 0) {
      setChartBase64(null); // Reset chart until it regenerates
    }
  }, [labels, dscr]);

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
