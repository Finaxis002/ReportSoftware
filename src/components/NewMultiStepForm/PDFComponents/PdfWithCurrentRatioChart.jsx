import { useState, useEffect } from 'react';
import {  Text, View, Document, Image, } from '@react-pdf/renderer';
import CurrentRatioChart from '../charts/CurrentRatioChart';
import { styles } from "./Styles";

const MyDocument = ({ chartBase64 }) => (
  <Document>
    <View >
      <View>
      <View style={styles.centeredTextContainer}>
        <Text style={styles.Charttitle}>Current Ratio</Text>
        </View>
        {chartBase64 ? (
          <Image src={chartBase64} style={styles.chart} />
        ) : (
          <Text style={styles.loading}>Generating Chart...</Text>
        )}
      </View>
    </View>
  </Document>
);



const PdfWithCurrentRatioChart = ({ labels = [], currentRatio = [] , onCurrentRatioReady}) => {
  const [chartBase64, setChartBase64] = useState(null);

  const handleBase64Generated = (base64) => {
    setChartBase64(base64);
    // if(onCurrentRatioReady) onCurrentRatioReady(base64);
  };

   // ✅ New useEffect to safely call parent once chartBase64 is ready
  useEffect(() => {
    if (chartBase64 && typeof chartBase64 === 'string' && chartBase64.startsWith('data:image')) {
      if (onCurrentRatioReady) onCurrentRatioReady(chartBase64);
    }
  }, [chartBase64, onCurrentRatioReady]);

  useEffect(() => {
    if (labels?.length > 0 && currentRatio?.length > 0) {
      // console.log("📊 Generating Current Ratio Chart...");
      
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
