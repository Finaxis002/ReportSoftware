
import React, { useState, useEffect } from 'react';
import { Page, Text, View, Document, Image, StyleSheet } from '@react-pdf/renderer';
import { generateChart } from '../charts/chart';
import { generateBarChart } from '../charts/barChart';
         
const MyDocument = ({ pieBase64, barBase64 }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* ✅ Pie Chart */}
      <View>
        <Text style={styles.title}>Direct Expense Breakdown</Text>
        {pieBase64 && <Image src={pieBase64} style={styles.chart} />}
      </View>

      {/* ✅ Revenue vs Expense Chart */}
      <View>
        <Text style={styles.title}>Revenue vs Expenses</Text>
        {barBase64 && <Image src={barBase64} style={styles.chart} />}

      </View>
    </Page>
  </Document>
);

const styles = StyleSheet.create({

  page: { padding: 20, flexDirection: 'column', backgroundColor: '#fff' },
  title: { fontSize: 18, marginBottom: 10, textAlign: 'center' },
  chart: { width: 400, height: 300, marginVertical: 20 }
});

const PdfWithChart = ({ formData, totalExpenses }) => {
  const [pieBase64, setPieBase64] = useState(null);
  const [barBase64, setBarBase64] = useState(null);

  useEffect(() => {
    const generateCharts = async () => {
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
    };

    generateCharts();
  }, [formData, totalExpenses]);

  return <MyDocument pieBase64={pieBase64} barBase64={barBase64} />;

};

export default PdfWithChart;


