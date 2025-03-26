import React, { useState, useEffect } from 'react';
import { Page, Text, View, Document, Image, StyleSheet } from '@react-pdf/renderer';
import CurrentRatioChart from '../charts/CurrentRatioChart';

const MyDocument = ({ chartBase64 }) => (
  <Document>
    <View >
      <View>
        <Text style={styles.title}>Current Ratio</Text>
        {chartBase64 ? (
          <Image src={chartBase64} style={styles.chart} />
        ) : (
          <Text style={styles.loading}>Generating Chart...</Text>
        )}
      </View>
    </View>
  </Document>
);

const styles = StyleSheet.create({
  page: {
    padding: 20,
    flexDirection: 'column',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  chart: {
    width: 400,
    height: 250,
    marginVertical: 20,
  },
  loading: {
    fontSize: 14,
    textAlign: 'center',
    color: '#999',
  },
});

const PdfWithCurrentRatioChart = ({ labels = [], currentRatio = [] }) => {
  const [chartBase64, setChartBase64] = useState(null);

  const handleBase64Generated = (base64) => {
    setChartBase64(base64);
  };

  useEffect(() => {
    if (labels?.length > 0 && currentRatio?.length > 0) {
      console.log("📊 Generating Current Ratio Chart...");
    }
  }, [labels, currentRatio]);

  return (
    <>
      {labels.length > 0 && currentRatio.length > 0 && (
        <CurrentRatioChart
          labels={labels}
          values={currentRatio}
          onBase64Generated={handleBase64Generated}
        />
      )}

      {chartBase64 && <MyDocument chartBase64={chartBase64} />}
    </>
  );
};

export default PdfWithCurrentRatioChart;
