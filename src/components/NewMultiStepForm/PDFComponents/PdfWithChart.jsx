// import React from 'react';
// import { Page, Text, View, Document, Image, StyleSheet } from '@react-pdf/renderer';

// const PdfWithChart = ({ chartBase64 }) => {
//   console.log("✅ Chart Data in PDF:", chartBase64); // ✅ Debug log

//   return (
//     <Page size="A4" style={styles.page}>
//       <View>
//         <Text style={styles.title}>Sales Report</Text>

//         {/* ✅ Render Chart */}
//         {chartBase64 ? (
//           <Image src={chartBase64} style={styles.chart} />
//         ) : (
//           <Text>No chart data available</Text>
//         )}
//       </View>
//     </Page>
//   );
// };

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
//     backgroundColor: '#f5f5f5', // ✅ Add background to make it visible
//   },
// });

// export default PdfWithChart;


//////////////////////////////////////////////////////////////////////////////////////////////////////
import React, { useState, useEffect } from 'react';
import { Page, Text, View, Document, Image, StyleSheet } from '@react-pdf/renderer';
import { generateChart } from '../charts/chart'; // ✅ Import as named export

const MyDocument = ({ chartBase64, formData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View>
        <Text style={styles.title}>Direct Expense Break up</Text>
        {/* ✅ Render Pie Chart */}
        {chartBase64 && <Image src={chartBase64} style={styles.chart} />}
      </View>
    </Page>
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
    height: 300,
    marginVertical: 20,
  },
});

const PdfWithChart = ({ formData }) => {
  const [chartBase64, setChartBase64] = useState(null);

//   useEffect(() => {
//     const generateChartData = async () => {
//       if (formData.Expenses  && formData.Expenses.directExpense) {
//         const labels = formData.Expenses.directExpense
//           .filter(item => item.isDirect)
//           .map(item => item.name);

//         const values = formData.Expenses.directExpense
//           .filter(item => item.isDirect)
//           .map(item => parseFloat(item.value) || 0);

//         if (labels.length > 0 && values.length > 0) {
//           // ✅ Generate Pie Chart using the renamed function
//           const base64 = await generateChart({ labels, values });
//           setChartBase64(base64);
//         }
//       }
//     };

//     generateChartData();
//   }, [formData.Expenses]);

useEffect(() => {
    const generateChartData = async () => {
      if (formData.Expenses && formData.Expenses.directExpense) {
        const labels = formData.Expenses.directExpense
          .filter(item => item.isDirect)
          .map(item => item.name);
  
        const values = formData.Expenses.directExpense
          .filter(item => item.isDirect)
          .map(item => parseFloat(item.value) || 0);
  
        // ✅ Add Total Expected Salary to Pie Chart
        const totalExpectedSalary = formData.Expenses.normalExpense
          ? formData.Expenses.normalExpense.reduce((total, form) => {
              const amount = parseFloat(form.amount) || 0;
              const quantity = parseFloat(form.quantity) || 0;
              return total + amount * quantity * 12;
            }, 0)
          : 0;
  
        if (totalExpectedSalary > 0) {
          labels.push("Total Expected Salary");
          values.push(totalExpectedSalary);
        }
  
        if (labels.length > 0 && values.length > 0) {
          // ✅ Generate Pie Chart using the renamed function
          const base64 = await generateChart({ labels, values });
          setChartBase64(base64);
        }
      }
    };
  
    generateChartData();
  }, [formData.Expenses]);
  
  console.log("formdata in pdf with chart",formData)

  return <MyDocument chartBase64={chartBase64} />;
};

export default PdfWithChart;


////////////////////////////////////////////////////////////////////////////////////////////////
