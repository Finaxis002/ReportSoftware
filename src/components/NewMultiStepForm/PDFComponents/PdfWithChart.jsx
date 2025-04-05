import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, Page } from "@react-pdf/renderer";
import { generateChart } from "../charts/chart";
import { generateBarChart } from "../charts/barChart";

const styles = StyleSheet.create({
  // chartContainer: {
  //   display: 'flex',
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   marginVertical: 20,
  // },
  page: {
    padding: 20,
    flexDirection: "column",
    backgroundColor: "#fff",
  },
  chartContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  title: { fontSize: 18, marginBottom: 10, textAlign: "center" },
  pieChart: {
    width: 300,
    height: 300,
    marginVertical: 20,
    borderRadius: 8,
    textAlign: "center",
  },
  barChart: {
    width: 400,
    height: 300,
    borderColor: "#ccc",
    backgroundColor: "#ffffff",
  },
});

const PdfWithChart = ({
  formData,
  totalExpenses,
  onPieChartReady,
  onBarChartReady,
}) => {
  const [pieBase64, setPieBase64] = useState(null);
  const [barBase64, setBarBase64] = useState(null);

  useEffect(() => {
    const generateCharts = async () => {
      if (!formData?.Expenses?.directExpense) return;

      const labels = formData.Expenses.directExpense
        .filter((item) => item.isDirect)
        .map((item) => item.name);

      const values = formData.Expenses.directExpense
        .filter((item) => item.isDirect)
        .map((item) => parseFloat(item.value) || 0);

      const totalExpectedSalary =
        formData.Expenses.normalExpense?.reduce((total, form) => {
          const amount = parseFloat(form.amount) || 0;
          const quantity = parseFloat(form.quantity) || 0;
          return total + amount * quantity * 12;
        }, 0) || 0;

      if (totalExpectedSalary > 0) {
        labels.push("Total Expected Salary");
        values.push(totalExpectedSalary);
      }

      if (labels.length > 0 && values.length > 0) {
        try {
          const pie = await generateChart({ labels, values });
          if (pie) {
            setPieBase64(pie);
            onPieChartReady?.(pie);
          }
        } catch (err) {
          console.error("❌ Pie Chart Generation Error:", err);
        }
      }      

      const revenue = formData?.Revenue?.totalRevenueForOthers || [];
      if (revenue.length > 0 && totalExpenses.length === revenue.length) {
        const bar = await generateBarChart({
          labels,
          revenue,
          expenses: totalExpenses,
          formData,
        });
        setBarBase64(bar);
        if (onBarChartReady) onBarChartReady(bar);
      }
    };

    generateCharts();
  }, [formData, totalExpenses]);

  if (!pieBase64 || !barBase64) {
    return <Text>Loading charts...</Text>;
  }

  

  return (
    <>
      <Page size="A4" style={styles.page}>
        {pieBase64 ? (
          <View style={styles.chartContainer}>
            <Text style={styles.title}>Direct Expense Break up</Text>
            <Image src={pieBase64} style={styles.pieChart} />
          </View>
        ) : (
          <Text>No Pie Chart Data Available</Text>
        )}

        {barBase64 ? (
          <View style={styles.chartContainer}>
            <Text style={styles.title}>Revenue vs Expenses</Text>
            <Image src={barBase64} style={styles.barChart} />
          </View>
        ) : (
          <Text>No Bar Chart Data Available</Text>
        )}
      </Page>
    </>
  );
};

export default PdfWithChart;
