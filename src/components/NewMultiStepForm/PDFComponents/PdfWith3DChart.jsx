// PdfWith3DChart.jsx
import { useState, useEffect } from "react";
import { View, Text, Image, Page } from "@react-pdf/renderer";
import { generateBarChart } from "../charts/barChart";
import { generate3DPieChart } from "../charts/newgenerate3DPieChart"; // NEW: 3D chart generator
import { styles, stylesCOP} from "./Styles";

const PdfWith3DChart = ({
  formData,
  totalExpenses,
  onPieChartReady,
  onBarChartReady,
  selectedColor = null,
  selectedFont = 'Arial'
}) => {
  const [pieBase64, setPieBase64] = useState(null);
  const [barBase64, setBarBase64] = useState(null);
  const [isGenerating3D, setIsGenerating3D] = useState(true);

  // ✅ Get selected color from localStorage, similar to chart.js
  const getSelectedColor = () => {
    return localStorage.getItem('selectedColor') || null;
  };

  const currentSelectedColor = selectedColor || getSelectedColor();

  useEffect(() => {
    const generateCharts = async () => {
      if (!formData?.Expenses?.directExpense) return;

      // Extract pie chart data (direct expenses)
      const pieData = formData.Expenses.directExpense
        .filter((item) => item.isDirect && parseFloat(item.value) > 0)
        .map((item) => ({
          name: item.name,
          value: parseFloat(item.value) || 0
        }));

      // Add salary if applicable
      const totalExpectedSalary =
        formData.Expenses.normalExpense?.reduce((total, form) => {
          const amount = parseFloat(form.amount) || 0;
          const quantity = parseFloat(form.quantity) || 0;
          return total + amount * quantity * 12;
        }, 0) || 0;

      if (totalExpectedSalary > 0) {
        pieData.push({
          name: "Total Expected Salary",
          value: totalExpectedSalary
        });
      }

      // Generate 3D Pie Chart
      if (pieData.length > 0) {
        try {
          setIsGenerating3D(true);
          console.log('Generating 3D pie chart with data:', pieData);
          
          const pie = await generate3DPieChart(pieData, currentSelectedColor, selectedFont);
          
          if (pie && pie.startsWith('data:image/png')) {
            console.log('✅ 3D Pie chart generated successfully');
            setPieBase64(pie);
            onPieChartReady?.(pie);
          } else {
            console.warn('Invalid pie chart data received');
            setPieBase64(null);
          }
        } catch (err) {
          console.error("❌ 3D Pie Chart Generation Error:", err);
          setPieBase64(null);
        } finally {
          setIsGenerating3D(false);
        }
      }

      // Generate Bar Chart (keep existing)
      const revenue = formData?.Revenue?.totalRevenueForOthers || [];
      if (revenue.length > 0 && totalExpenses.length === revenue.length) {
        const bar = await generateBarChart({
          labels: revenue.map((_, i) => `Year ${i + 1}`),
          revenue,
          expenses: totalExpenses,
          formData,
        });
        setBarBase64(bar);
        if (onBarChartReady) onBarChartReady(bar);
      }
    };

    generateCharts();
  }, [formData, totalExpenses, currentSelectedColor, selectedFont]);

  // Fallback effect for old 2D chart (optional)
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

  return (
    <>
      <Page size="A4" style={styles.page} wrap={false}>
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

        <View style={stylesCOP.heading}>
          <Text>Financial Graphs (3D Visualization)</Text>
        </View>

        {isGenerating3D ? (
          <View style={styles.chartContainer}>
            <Text style={styles.Charttitle}>Direct Expense Break up</Text>
            <Text>Generating 3D visualization...</Text>
          </View>
        ) : pieBase64 ? (
          <View style={styles.chartContainer}>
            <Text style={styles.Charttitle}>Direct Expense Break up</Text>
            <Image src={pieBase64} style={styles.pieChart} />
            <Text style={styles.chartNote}>*3D Interactive Visualization</Text>
          </View>
        ) : (
          <View style={styles.chartContainer}>
            <Text style={styles.Charttitle}>Direct Expense Break up</Text>
            <Text>No chart data available or failed to generate</Text>
          </View>
        )}
      </Page>
    </>
  );
};

export default PdfWith3DChart;