// financialCals.js

// Get dynamic expense rows (direct/indirect)
export const getExpenseRows = (expenses = [], type = "direct") =>
  Array.isArray(expenses)
    ? expenses.filter(row => row.type === type && row.name && row.name.trim() !== "")
    : [];

// Extract per-year values from a row (supporting both array or single value)
export const extractPerYearValues = (row, years = 5) => {
  if (Array.isArray(row.values)) return row.values.slice(0, years);
  if (row.amount || row.value)
    return Array.from({ length: years }, () => Number(row.amount ?? row.value ?? 0));
  return Array(years).fill(0);
};

// Get total per year for an array of expense rows
export const sumExpenseRowsPerYear = (rows, years = 5) => {
  const totals = Array(years).fill(0);
  rows.forEach(row => {
    extractPerYearValues(row, years).forEach((val, i) => (totals[i] += Number(val || 0)));
  });
  return totals;
};

// Utility to add two arrays element-wise
export const addArrays = (a, b) => a.map((v, i) => (Number(v) || 0) + (Number(b[i]) || 0));

// Utility to subtract two arrays element-wise
export const subArrays = (a, b) => a.map((v, i) => (Number(v) || 0) - (Number(b[i]) || 0));

// Example: financialcals.js
export function calculateRawMaterialExpense(expense, receivedTotalRevenue, yearIndex, formData) {
  const isRawMaterial = expense.name.trim() === "Raw Material Expenses / Purchases";
  const isPercentage = String(expense.value).trim().endsWith("%");
  const ClosingStock = Number(formData?.MoreDetails?.ClosingStock?.[yearIndex] || 0);
  const OpeningStock = Number(formData?.MoreDetails?.OpeningStock?.[yearIndex] || 0);

  let expenseValue = 0;
  if (isRawMaterial && isPercentage) {
    const baseValue = (parseFloat(expense.value) / 100) * (receivedTotalRevenue?.[yearIndex] || 0);
    expenseValue = baseValue + ClosingStock - OpeningStock;
  } else {
    expenseValue = Number(expense.total) || 0;
  }
  return expenseValue;
}
