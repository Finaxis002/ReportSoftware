// cmaSchema.js

import { getExpenseRows } from "./financialCalcs";

// Generates schema array
export const getCMASchema = (formData) => {
  const directRows = getExpenseRows(formData?.Expenses?.directExpense, "direct");
  

  // Each schema row: label, extractorKey
  return [
    { label: "Gross Sales", extractorKey: "grossSales" },
    { label: "Less: Duties & Taxes", extractorKey: "dutiesTaxes" },
    { label: "Net Sales", extractorKey: "netSales" },
    { label: "Cost of Sales", group: true },
  
{
  label: "Salary and Wages",
  extractorKey: "salary",
},

    {
  label: "Raw Material Expenses / Purchases",
  extractorKey: "rawMaterial",
  bold: false, // or true if you want bold
},
    // ...directRows.map((row, idx) => ({
    //   label: row.name,
    //   extractorKey: `directExpense_${idx}`
    // })),
    ...directRows.filter(row => row.name.trim() !== "Raw Material Expenses / Purchases").map((row, idx) => ({
  label: row.name,
  extractorKey: `directExpense_${idx}`
})),

    { label: "Total Cost of Sales", extractorKey: "totalCostOfSales", bold: true },
    { label: "Gross Profit", extractorKey: "grossProfit", bold: true },
    // Add more rows (indirect, net profit, etc.) as needed
  ];
};
