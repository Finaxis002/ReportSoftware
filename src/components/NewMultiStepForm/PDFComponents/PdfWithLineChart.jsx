// import React, { useState, useEffect } from 'react';
// import { Page, Text, View, Document, Image, StyleSheet } from '@react-pdf/renderer';
// import LineChart from '../charts/LineChart';

// const MyDocument = ({ chartBase64 }) => (
//   <Document>
//     <Page size="A4" style={styles.page}>
//       <View>
//         <Text style={styles.title}>DSCR Chart</Text>
//         {chartBase64 ? (
//           <Image src={chartBase64} style={styles.chart} />
//         ) : (
//           <Text style={styles.loading}>Generating Chart...</Text>
//         )}
//       </View>
//     </Page>
//   </Document>
// );

// const styles = StyleSheet.create({
//   page: {
//     padding: 20,
//     flexDirection: 'column',
//     backgroundColor: '#fff',
//   },
//   title: {
//     fontSize: 18,
//     marginBottom: 10,
//     textAlign: 'center',
//   },
//   chart: {
//     width: 400,
//     height: 300,
//     marginVertical: 20,
//   },
//   loading: {
//     fontSize: 14,
//     textAlign: 'center',
//     color: '#999',
//   },
// });

// const PdfWithLineChart = ({ labels = [], dscr = [] }) => {

//   console.log("received dscr values in pdfwithlinechart" , dscr)
//   const [chartBase64, setChartBase64] = useState(null);

//   const handleBase64Generated = (base64) => {
//     setChartBase64(base64);
//   };

//   // ✅ Only render the chart if labels and dscr are valid arrays
//   useEffect(() => {
//     if (labels?.length > 0 && dscr?.length > 0) {
//       console.log("📊 Generating Line Chart...");
//     }
//   }, [labels, dscr]);

//   return (
//     <>
//       {Array.isArray(labels) && labels.length > 0 && Array.isArray(dscr) && dscr.length > 0 && (
//         <LineChart
//           labels={labels}
//           values={dscr}
//           onBase64Generated={handleBase64Generated}
//         />
//       )}

//       {chartBase64 && <MyDocument chartBase64={chartBase64} />}
//     </>
//   );
// };

// export default PdfWithLineChart;





import React, { useState, useEffect } from 'react';
import { Page, Text, View, Document, Image, StyleSheet } from '@react-pdf/renderer';
import LineChart from '../charts/LineChart';

const MyDocument = ({ chartBase64 }) => (
    <View>
      <View>
        <Text style={styles.title}>DSCR Chart</Text>
        {chartBase64 ? (
          <Image src={chartBase64} style={styles.chart} />
        ) : (
          <Text style={styles.loading}>Generating Chart...</Text>
        )}
      </View>
    </View>
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
    width: 300,
    height: 200,
    marginVertical: 20,
  },
  loading: {
    fontSize: 14,
    textAlign: 'center',
    color: '#999',
  },
});

const PdfWithLineChart = ({ labels = [], dscr = [] }) => {
  const [chartBase64, setChartBase64] = useState(null);

  const handleBase64Generated = (base64) => {
    setChartBase64(base64);
  };

  useEffect(() => {
    if (labels?.length > 0 && dscr?.length > 0) {
      console.log("📊 Generating Line Chart...");
    }
  }, [labels, dscr]);

  return (
    <>
      {Array.isArray(labels) && labels.length > 0 && Array.isArray(dscr) && dscr.length > 0 && (
        <LineChart
          labels={labels}
          values={dscr}
          onBase64Generated={handleBase64Generated}
        />
      )}

      {chartBase64 && <MyDocument chartBase64={chartBase64} />}
    </>
  );
};

export default PdfWithLineChart;
