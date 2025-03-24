
// import React, { useState, useEffect } from 'react';
// import { Page, Text, View, Document, Image, StyleSheet } from '@react-pdf/renderer';
// import { generateChart } from '../charts/chart'; // ✅ Import as named export

// const MyDocument = ({ chartBase64, formData }) => (
//   <Document>
//     <Page size="A4" style={styles.page}>
//       <View>
//         <Text style={styles.title}>Direct Expense Break up</Text>
//         {/* ✅ Render Pie Chart */}
//         {chartBase64 && <Image src={chartBase64} style={styles.chart} />}
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
// });

// const PdfWithChart = ({ formData }) => {
//   const [chartBase64, setChartBase64] = useState(null);

// //   useEffect(() => {
// //     const generateChartData = async () => {
// //       if (formData.Expenses  && formData.Expenses.directExpense) {
// //         const labels = formData.Expenses.directExpense
// //           .filter(item => item.isDirect)
// //           .map(item => item.name);

// //         const values = formData.Expenses.directExpense
// //           .filter(item => item.isDirect)
// //           .map(item => parseFloat(item.value) || 0);

// //         if (labels.length > 0 && values.length > 0) {
// //           // ✅ Generate Pie Chart using the renamed function
// //           const base64 = await generateChart({ labels, values });
// //           setChartBase64(base64);
// //         }
// //       }
// //     };

// //     generateChartData();
// //   }, [formData.Expenses]);

// useEffect(() => {
//     const generateChartData = async () => {
//       if (formData.Expenses && formData.Expenses.directExpense) {
//         const labels = formData.Expenses.directExpense
//           .filter(item => item.isDirect)
//           .map(item => item.name);
  
//         const values = formData.Expenses.directExpense
//           .filter(item => item.isDirect)
//           .map(item => parseFloat(item.value) || 0);
  
//         // ✅ Add Total Expected Salary to Pie Chart
//         const totalExpectedSalary = formData.Expenses.normalExpense
//           ? formData.Expenses.normalExpense.reduce((total, form) => {
//               const amount = parseFloat(form.amount) || 0;
//               const quantity = parseFloat(form.quantity) || 0;
//               return total + amount * quantity * 12;
//             }, 0)
//           : 0;
  
//         if (totalExpectedSalary > 0) {
//           labels.push("Total Expected Salary");
//           values.push(totalExpectedSalary);
//         }
  
//         if (labels.length > 0 && values.length > 0) {
//           // ✅ Generate Pie Chart using the renamed function
//           const base64 = await generateChart({ labels, values });
//           setChartBase64(base64);
//         }
//       }
//     };
  
//     generateChartData();
//   }, [formData.Expenses]);
  
//   console.log("formdata in pdf with chart",formData)

//   return <MyDocument chartBase64={chartBase64} />;
// };

// export default PdfWithChart;


// ////////////////////////////////////////////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////////////////////////////


// import React, { useState, useEffect } from 'react';
// import { Page, Text, View, Document, Image, StyleSheet } from '@react-pdf/renderer';
// import { generateChart } from '../charts/chart';


// const MyDocument = ({ pieBase64, barBase64 }) => (
//   <Document>
//     <Page size="A4" style={styles.page}>
//       {/* ✅ Pie Chart */}
//       <View>
//         <Text style={styles.title}>Direct Expense Break up</Text>
//         {pieBase64 && <Image src={pieBase64} style={styles.chart} />}
//       </View>

//       {/* ✅ Revenue vs Expenses Chart */}
//       <View>
//         <Text style={styles.title}>Revenue V/s Expenses</Text>
//         {barBase64 && <Image src={barBase64} style={styles.chart} />}
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
//     fontWeight: 'bold',
//   },
//   chart: {
//     width: 400,
//     height: 300,
//     marginVertical: 20,
//   },
// });

// const PdfWithChart = ({ formData , totalExpenses}) => {
//   const [pieBase64, setPieBase64] = useState(null);
//   const [barBase64, setBarBase64] = useState(null);
//   // const [totalExpenses, setTotalExpenses] = useState([]);
//   console.log("total expense values in pdf with charts", totalExpenses)

//   // ✅ Callback function to receive expenses data from ProjectedExpenses.jsx
//   // const handleTotalExpenseUpdate = (expenses) => {
//   //   console.log("✅ Received total expenses from ProjectedExpenses:", expenses);
//   //   setTotalExpenses(expenses);
//   // };

//   useEffect(() => {
//     const generateChartData = async () => {
//       if (formData?.Expenses?.directExpense) {
//         const labels = formData.Expenses.directExpense
//           .filter(item => item.isDirect)
//           .map(item => item.name);

//         const values = formData.Expenses.directExpense
//           .filter(item => item.isDirect)
//           .map(item => parseFloat(item.value) || 0);

//         // ✅ Get Revenue Data
//         const revenue = formData?.Revenue?.totalRevenueForOthers || [];
//         console.log("revenue value in pdf with charts", revenue )

//         // if (labels.length > 0 && values.length > 0 && totalExpenses.length > 0) {
//         //   const { pieBase64, barBase64 } = await generateChart({ 
//         //     labels, 
//         //     values, 
//         //     revenue, 
//         //     expenses: totalExpenses
//         //   });


//         //   setPieBase64(pieBase64);
//         //   setBarBase64(barBase64);
//         // }
//         if (revenue.length === totalExpenses.length) {
//           const { pieBase64, barBase64 } = await generateChart({ 
//             labels, 
//             values, 
//             revenue, 
//             expenses: totalExpenses 
//           });
        
//           setPieBase64(pieBase64);
//           setBarBase64(barBase64);
//         } else {
//           console.error("🚨 Revenue and Expense lengths do not match!");
//         }
    
//       }
//     };

//     generateChartData();
//   }, [formData, totalExpenses]); // ✅ Trigger when expenses change

//   return (
//     <>
    
//       <MyDocument pieBase64={pieBase64} barBase64={barBase64} />
//     </>
//   );
// };

// export default PdfWithChart;


////////////////////////////////////////////////////////////////////////////////////////
// src/PDFComponents/PdfWithChart.jsx
import React, { useState, useEffect } from 'react';
import { Page, Text, View, Document, Image, StyleSheet } from '@react-pdf/renderer';
import { generateChart } from '../charts/chart';
import { generateBarChart } from '../charts/barChart';



const MyDocument = ({ pieBase64, barBase64 }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* ✅ Pie Chart */}
      <View  style={styles.chartContainer}>
        <Text style={styles.title}>Direct Expense Breakdown</Text>
        {pieBase64 && <Image src={pieBase64} style={styles.pieChart} />}
      </View>

      {/* ✅ Revenue vs Expense Chart */}
      <View  style={styles.chartContainer}>
        <Text style={styles.title}>Revenue vs Expenses</Text>
        {barBase64 && <Image src={barBase64} style={styles.barChart} />}
      </View>
    </Page>
  </Document>
);

const styles = StyleSheet.create({
  page: { padding: 20, flexDirection: 'column', backgroundColor: '#fff' },
  chartContainer: {
    display: 'flex',
    justifyContent: 'center', // ✅ Center horizontally
    alignItems: 'center', // ✅ Center vertically
    marginVertical: 20,
  },
  title: { fontSize: 18, marginBottom: 10, textAlign: 'center' },
  chart: {
    width: 400,
    height: 400, // ✅ Bigger chart size for better visibility
    padding: 10,
    borderRadius: 10, // ✅ Rounded edges
    marginVertical: 10,
  },
  pieChart: {
    width: 300, // ✅ Adjust width
    height: 300, // ✅ Adjust height
    marginVertical: 20,
    borderRadius: 8, // ✅ Adds softness to edges
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    textAlign: 'center'
  },
  barChart: {
    width: 500,
    height: 400,
    borderColor: '#ccc',
    backgroundColor: '#000000' // ✅ BLACK background for bar chart
  }
});

const PdfWithChart = ({ formData, totalExpenses }) => {
  const [pieBase64, setPieBase64] = useState(null);
  const [barBase64, setBarBase64] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const generateCharts = async () => {

      setLoading(true);
      if (formData?.Expenses?.directExpense) {
        const labels = formData.Expenses.directExpense
          .filter(item => item.isDirect)
          .map(item => item.name);

        const values = formData.Expenses.directExpense
          .filter(item => item.isDirect)
          .map(item => parseFloat(item.value) || 0);

          //✅ Add Total Expected Salary to Pie Chart
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
          const pie = await generateChart({ labels, values });
          setPieBase64(pie);
        }

        const revenue = formData?.Revenue?.totalRevenueForOthers || [];

        if (revenue.length > 0 && totalExpenses.length === revenue.length) {
          const bar = await generateBarChart({ labels, revenue, expenses: totalExpenses });
          setBarBase64(bar);
        }
      }
      setLoading(false); 
    };

    generateCharts();
  }, [formData, totalExpenses]);

  if (loading) {
    return <Text>Loading Charts...</Text>;
  }

  return <MyDocument pieBase64={pieBase64} barBase64={barBase64} />;
};

export default PdfWithChart;


