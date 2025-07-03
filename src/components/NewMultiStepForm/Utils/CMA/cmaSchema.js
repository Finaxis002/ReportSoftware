// cmaSchema.js

import { getExpenseRows } from "./financialCalcs";

// Generates schema array
export const getCMASchema = (formData) => {
  const directRows = getExpenseRows(formData?.Expenses?.directExpense, "direct")
  ;
  const salaryRows = getExpenseRows(formData?.Expenses?.normalExpense, "normal");

  // Each schema row: label, extractorKey
  return [
    { label: "Gross Sales", extractorKey: "grossSales" },
    { label: "Less: Duties & Taxes", extractorKey: "dutiesTaxes" },
    { label: "Net Sales", extractorKey: "netSales" },
    { label: "Cost of Sales", group: true },
    ...salaryRows.map((row, idx) => ({
      label: row.name || "Salary/Wages",
      extractorKey: `salary_${idx}`
    })),
    {
  label: "Raw Material Expenses / Purchases",
  extractorKey: "rawMaterial",
  bold: false, // or true if you want bold
},
    ...directRows.map((row, idx) => ({
      label: row.name,
      extractorKey: `directExpense_${idx}`
    })),
    { label: "Total Cost of Sales", extractorKey: "totalCostOfSales", bold: true },
    { label: "Gross Profit", extractorKey: "grossProfit", bold: true },
    // Add more rows (indirect, net profit, etc.) as needed
  ];
};
