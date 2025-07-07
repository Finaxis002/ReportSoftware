// cmaSchema.js

import { getExpenseRows, filterActiveDirectExpenses } from "./financialCalcs";

// Generates schema array
export const getCMASchema = (formData) => {

  const directRows = getExpenseRows(
    formData?.Expenses?.directExpense,
    "direct"
  );


    const years = Number(formData?.ProjectReportSetting?.ProjectionYears || 5);
 const getDirectExpenseValueForYear = (row, yearIndex) => {
    // This is just for filtering, not for rendering, so we can use row.total
    const base = Number(row.total) || 0;
    return base;
  };
  console.log( 'get Direct Expense Value For Year',getDirectExpenseValueForYear)
  const filteredDirectRows = filterActiveDirectExpenses(
    directRows.filter(row => row.name.trim() !== "Raw Material Expenses / Purchases"),
    years,
    getDirectExpenseValueForYear
  );
const filteredDirectExpense = filterActiveDirectExpenses(
  directRows.filter(row => row.name.trim() !== "Raw Material Expenses / Purchases"),
  years,
  getDirectExpenseValueForYear
);
console.log('filtered Direct Expense',filteredDirectExpense)
const directExpenseRows = filteredDirectExpense.map((row, idx) => ({
  key: `directExpense_${idx}`,
  values: Array.from({ length: years }).map((_, yearIndex) =>
    getDirectExpenseValueForYear(row, yearIndex)
  ),
  name: row.name,
}));
console.log("direct Expense Rows", directExpenseRows)
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

    ...directRows
      .filter((row) => row.name.trim() !== "Raw Material Expenses / Purchases")
      .map((row, idx) => ({
        label: row.name,
        extractorKey: `directExpense_${idx}`,
      })),

    {
      label: "Total Cost of Sales",
      extractorKey: "totalCostOfSales",
      bold: true,
    },
    { label: "Gross Profit", extractorKey: "grossProfit", bold: true },
    // Add more rows (indirect, net profit, etc.) as needed
  ];
};
