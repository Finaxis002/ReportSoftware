import React, { useState, useEffect } from 'react';
import { Page, Text, View, Document, Image, StyleSheet } from '@react-pdf/renderer';
import LineChart from '../charts/LineChart';

const MyDocument = ({ chartBase64 }) => (
  <View>
    <Text style={styles.title}>DSCR Chart</Text>
    {chartBase64 ? (
      <Image src={chartBase64} style={styles.chart} />
    ) : (
      <Text style={styles.loading}>Generating Chart...</Text>
    )}
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
  const [formattedValues, setFormattedValues] = useState([]);

  useEffect(() => {
    if (dscr.length > 0) {
      // ✅ Format to 2 decimal points
      const newValues = dscr.map(value => Number(value.toFixed(2)));
      setFormattedValues(newValues);
    }
  }, [dscr]);

  return (
    <>
      {labels.length > 0 && formattedValues.length > 0 && (
        <LineChart
          labels={labels}
          values={formattedValues}
          onBase64Generated={setChartBase64}
        />
      )}

      {chartBase64 && <MyDocument chartBase64={chartBase64} />}
    </>
  );
};

export default PdfWithLineChart;







// import React, { useState, useEffect } from 'react';
// import { Page, Text, View, Document, Image, StyleSheet } from '@react-pdf/renderer';
// import LineChart from '../charts/LineChart';

// const MyDocument = ({ chartBase64 }) => (
//   <View>
//     <View>
//       <Text style={styles.title}>DSCR Chart</Text>
//       {chartBase64 ? (
//         <Image src={chartBase64} style={styles.chart} />
//       ) : (
//         <Text style={styles.loading}>Generating Chart...</Text>
//       )}
//     </View>
//   </View>
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
//     width: 300,
//     height: 200,
//     marginVertical: 20,
//   },
//   loading: {
//     fontSize: 14,
//     textAlign: 'center',
//     color: '#999',
//   },
// });

// const PdfWithLineChart = ({ labels = [], dscr = [] }) => {
//   const [chartBase64, setChartBase64] = useState(null);
//   const [formattedValues, setFormattedValues] = useState([]);

//   const handleBase64Generated = (base64) => {
//     setChartBase64(base64);
//   };

//   useEffect(() => {
//     if (dscr.length > 0) {
//       console.log("📊 Generating Line Chart...");

//       // ✅ Format values to two decimal points
//       const newValues = dscr.map(value => Number(value.toFixed(2)));
//       setFormattedValues(newValues);
//     }
//   }, [dscr]);

//   return (
//     <>
//       {labels.length > 0 && formattedValues.length > 0 && (
//         <LineChart
//           labels={labels}
//           values={formattedValues} // ✅ Pass formatted values
//           onBase64Generated={handleBase64Generated}
//         />
//       )}

//       {chartBase64 && <MyDocument chartBase64={chartBase64} />}
//     </>
//   );
// };

// export default PdfWithLineChart;




