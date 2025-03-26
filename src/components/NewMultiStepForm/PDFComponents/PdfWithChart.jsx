
import React, { useState, useEffect } from 'react';
import { Page, Text, View, Document, Image, StyleSheet } from '@react-pdf/renderer';
import { generateChart } from '../charts/chart';
import { generateBarChart } from '../charts/barChart';

const MyDocument = ({ pieBase64, barBase64 }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* ✅ Pie Chart */}
      <View  style={styles.chartContainer}>
        <Text style={styles.title}>Direct Expense Break up</Text>
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
    width: 400,
    height: 300,
    borderColor: '#ccc',
    backgroundColor: '#000000' // ✅ BLACK background for bar chart
  }
});

const PdfWithChart = ({ formData, totalExpenses }) => {
  
  const [pieBase64, setPieBase64] = useState(null);
  const [barBase64, setBarBase64] = useState(null);
  const [loading, setLoading] = useState(true);
 console.log("form data in pdf with charts", formData)

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
          const bar = await generateBarChart({ labels, revenue, expenses: totalExpenses,formData });
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


