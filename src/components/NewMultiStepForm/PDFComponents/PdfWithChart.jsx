import { useState, useEffect } from "react";
import { View, Text, Image, Page } from "@react-pdf/renderer";
import { generateChart } from "../charts/chart";
import { generateBarChart } from "../charts/barChart";

import { styles, stylesCOP} from "./Styles";

const PdfWithChart = ({
  totalExpenses,
  formData,
  onPieChartReady,
  onBarChartReady,
}) => {
  const [pieBase64, setPieBase64] = useState(null);
  const [barBase64, setBarBase64] = useState(null);
  
  // ✅ Check if route is consultant-report-pdf
  const isConsultantRoute = window.location.pathname.includes('/consultant-report-pdf');

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

  //new useeffect for full chart generation
  useEffect(() => {
    if (pieBase64 && barBase64) {
      if (typeof pieBase64 === 'string' && pieBase64.startsWith('data:image') && onPieChartReady) {
        onPieChartReady(pieBase64);
      }
      if (typeof barBase64 === 'string' && barBase64.startsWith('data:image') && onBarChartReady) {
        onBarChartReady(barBase64);
      }
    }
  }, [pieBase64, barBase64, onPieChartReady, onBarChartReady]);
  

  if (!pieBase64 || !barBase64) {
    return <Text>Loading charts...</Text>;
  }

  return (
    <>
      <Page size="A4" style={styles.page}  wrap={false}>
        <View>
          <Text style={styles.businessName}>
            {formData?.AccountInformation?.businessName || "Business Name"}
          </Text>
          <Text style={styles.FinancialYear}>
            Financial Year{" "}
            {formData?.ProjectReportSetting?.FinancialYear
              ? `${formData.ProjectReportSetting.FinancialYear}-${(
                  parseInt(formData.ProjectReportSetting.FinancialYear) + 1
                )
                  .toString()
                  .slice(-2)}`
              : "2025-26"}
          </Text>
        </View>

        {/* ✅ Apply conditional styling for consultant route */}
        <View 
          style={[
            stylesCOP.heading,
          ]}
        >
          <Text style={isConsultantRoute && { color: '#ffffff' }}>
            Financial Graphs
          </Text>
        </View>

        {pieBase64 ? (
          <View style={styles.chartContainer}>
            <Text style={styles.Charttitle}>Direct Expense Break up</Text>
            <Image src={pieBase64} style={styles.pieChart} />
          </View>
        ) : (
          <Text>No Pie Chart Data Available</Text>
        )}

        {barBase64 ? (
          <View style={styles.chartContainer}>
            <Text style={styles.Charttitle}>Revenue V/s Expenses</Text>
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