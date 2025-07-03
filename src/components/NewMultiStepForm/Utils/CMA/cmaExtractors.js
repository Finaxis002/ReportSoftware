// cmaExtractors.js

import { getExpenseRows, extractPerYearValues, sumExpenseRowsPerYear, addArrays, subArrays, calculateRawMaterialExpense } from "./financialCalcs";

// Each extractor gets (formData)
export const makeCMAExtractors = (formData) => {
  const years = Number(formData?.ProjectReportSetting?.ProjectionYears || 5);

  const directExpense = formData?.Expenses?.directExpense || [];
const receivedtotalRevenueReceipts = formData?.computedData?.totalRevenueReceipts || [];

  // Dynamic direct/indirect expense rows
  const directRows = getExpenseRows(formData?.Expenses?.directExpense, "direct");
  const indirectRows = getExpenseRows(formData?.Expenses?.directExpense, "indirect");
  const salaryRows = getExpenseRows(formData?.Expenses?.normalExpense, "normal");

  // Example: assume gross sales = totalRevenueReceipts (could be elsewhere in your computedData)
  return {
    grossSales: () => formData?.computedData?.totalRevenueReceipts?.slice(0, years) || [],
    dutiesTaxes: () => Array(years).fill(0),
    netSales: () => formData?.computedData?.totalRevenueReceipts?.slice(0, years) || [],
    // Dynamic direct expenses (return per-year array)
    ...Object.fromEntries(
      directRows.map((row, idx) => [
        `directExpense_${idx}`,
        () => extractPerYearValues(row, years)
      ])
    ),
    // Salary/wages (single row)
    ...Object.fromEntries(
      salaryRows.map((row, idx) => [
        `salary_${idx}`,
        () => extractPerYearValues(row, years)
      ])
    ),
//raw material
     rawMaterial: () => {
      const row = directExpense.find(e => e.name.trim() === "Raw Material Expenses / Purchases");
      if (!row) return Array(Number(formData?.ProjectReportSetting?.ProjectionYears) || 5).fill(0);
      return Array.from({ length: Number(formData?.ProjectReportSetting?.ProjectionYears) || 5 }).map(
        (_, yearIdx) =>
          calculateRawMaterialExpense(row, receivedtotalRevenueReceipts, yearIdx, formData)
      );
    },
    // Indirect expenses (if you want them)
    ...Object.fromEntries(
      indirectRows.map((row, idx) => [
        `indirectExpense_${idx}`,
        () => extractPerYearValues(row, years)
      ])
    ),
    // Total cost of sales: sum of all direct expense and salary rows
    totalCostOfSales: () => {
      const total = sumExpenseRowsPerYear([...directRows, ...salaryRows], years);
      return total;
    },
    grossProfit: () => {
      const netSales = formData?.computedData?.totalRevenueReceipts?.slice(0, years) || [];
      const costOfSales = sumExpenseRowsPerYear([...directRows, ...salaryRows], years);
      return subArrays(netSales, costOfSales);
    },
    // Add more extractors as needed
  };
};
