// // cmaExtractors.js

// import { getExpenseRows, extractPerYearValues, sumExpenseRowsPerYear, addArrays, subArrays, calculateRawMaterialExpense } from "./financialCalcs";

// // Each extractor gets (formData)
// export const makeCMAExtractors = (formData) => {
//   const years = Number(formData?.ProjectReportSetting?.ProjectionYears || 5);

//   const directExpense = formData?.Expenses?.directExpense || [];
// const receivedtotalRevenueReceipts = formData?.computedData?.totalRevenueReceipts || [];

//   // Dynamic direct/indirect expense rows
//   const directRows = getExpenseRows(formData?.Expenses?.directExpense, "direct");
//   const indirectRows = getExpenseRows(formData?.Expenses?.directExpense, "indirect");
//   const salaryRows = getExpenseRows(formData?.Expenses?.normalExpense, "normal");

//   // Example: assume gross sales = totalRevenueReceipts (could be elsewhere in your computedData)
//   return {
//     grossSales: () => formData?.computedData?.totalRevenueReceipts?.slice(0, years) || [],
//     dutiesTaxes: () => Array(years).fill(0),
//     netSales: () => formData?.computedData?.totalRevenueReceipts?.slice(0, years) || [],
//     // Dynamic direct expenses (return per-year array)
//     ...Object.fromEntries(
//   directRows.map((row, idx) => [
//     `directExpense_${idx}`,
//     () => {
//       if (row.name.trim() === "Raw Material Expenses / Purchases") {
//         // Skip: Will handle separately
//         return [];
//       }
//       // Annualize if needed:
//       return extractPerYearValues(row, years).map(v => Number(v) * 12);
//     }
//   ])
// ),

    
//    // Combine all salary rows into one yearly total (single row)
// salary: () => {
//   // Sum all salary rows for each year
//   const totals = Array(years).fill(0);
//   salaryRows.forEach(row => {
//     const vals = extractPerYearValues(row, years);
//     vals.forEach((v, i) => { totals[i] += Number(v) * 12; }); // <-- *12 if v is monthly, else remove *12 if already annual
//   });
//   return totals;
// },

// //raw material
//      rawMaterial: () => {
//   const row = directExpense.find(e => e.name.trim() === "Raw Material Expenses / Purchases");
//   if (!row) return Array(years).fill(0);
//   return Array.from({ length: Number(formData?.ProjectReportSetting?.ProjectionYears) || 5 }).map(
//     (_, yearIdx) =>
//       calculateRawMaterialExpense(row, receivedtotalRevenueReceipts, yearIdx, formData)
//   );
// },

//     // Indirect expenses (if you want them)
//     ...Object.fromEntries(
//       indirectRows.map((row, idx) => [
//         `indirectExpense_${idx}`,
//         () => extractPerYearValues(row, years)
//       ])
//     ),
//     // Total cost of sales: sum of all direct expense and salary rows
//     totalCostOfSales: () => {
//       const total = sumExpenseRowsPerYear([...directRows, ...salaryRows], years);
//       return total;
//     },
//     grossProfit: () => {
//       const netSales = formData?.computedData?.totalRevenueReceipts?.slice(0, years) || [];
//       const costOfSales = sumExpenseRowsPerYear([...directRows, ...salaryRows], years);
//       return subArrays(netSales, costOfSales);
//     },
//     // Add more extractors as needed
//   };
// };



// cmaExtractors.js

import {
  getMonthsPerYear,
  calculateEscalatedExpense,
  calculateDirectExpense,
  calculateRawMaterialExpense,
  calculateExpense,
   getFringeAndAnnualCalculation,
   filterActiveDirectExpenses
} from "./financialCalcs";

export const makeCMAExtractors = (formData) => {
  const years = Number(formData?.ProjectReportSetting?.ProjectionYears || 5);
  const receivedtotalRevenueReceipts = formData?.computedData?.totalRevenueReceipts || [];

  // Set up expense lists
  const directExpense = formData?.Expenses?.directExpense || [];
  const normalExpense = formData?.Expenses?.normalExpense || [];
  const advanceExpenses = formData?.Expenses?.advanceExpenses || [];

  // Core params for escalation/moratorium
  const rateOfExpense = (formData?.ProjectReportSetting?.rateOfExpense || 0) / 100;
  const moratoriumPeriodMonths = parseInt(formData?.ProjectReportSetting?.MoratoriumPeriod) || 0;
  const projectionYears = parseInt(formData?.ProjectReportSetting?.ProjectionYears) || 5;
  const startingMonth = formData?.ProjectReportSetting?.SelectStartingMonth || "April";
  const monthsPerYear = getMonthsPerYear(projectionYears, moratoriumPeriodMonths, startingMonth);
 // 1. Salary & wages (using same escalation/moratorium as ProjectedProfitability)
  
 const baseSalary = getFringeAndAnnualCalculation(formData);

const salaryAndWages = Array.from({ length: years }, (_, yearIndex) =>
  calculateEscalatedExpense(baseSalary, yearIndex, monthsPerYear, rateOfExpense)
);
  

  // 2. Each direct expense row
 const getDirectExpenseValueForYear = (row, yearIndex) => {
  if (
    row.name.trim() === "Raw Material Expenses / Purchases" &&
    String(row.value).trim().endsWith("%")
  ) {
    return calculateRawMaterialExpense(row, receivedtotalRevenueReceipts, yearIndex, formData);
  }
  return calculateEscalatedExpense(Number(row.total) || 0, yearIndex, monthsPerYear, rateOfExpense);
};

const filteredDirectExpense = filterActiveDirectExpenses(
  directExpense.filter(row => row.name.trim() !== "Raw Material Expenses / Purchases"),
  years,
  getDirectExpenseValueForYear
);

const directExpenseRows = filteredDirectExpense.map((row, idx) => ({
  key: `directExpense_${idx}`,
  values: Array.from({ length: years }).map((_, yearIndex) =>
    getDirectExpenseValueForYear(row, yearIndex)
  ),
  name: row.name,
}));

  // 3. Raw Material row
  const rawMatRow = directExpense.find(row => row.name.trim() === "Raw Material Expenses / Purchases");
  const rawMaterial = rawMatRow
    ? Array.from({length: years}).map((_, yearIdx) =>
        calculateRawMaterialExpense(rawMatRow, receivedtotalRevenueReceipts, yearIdx, formData)
      )
    : Array(years).fill(0);

  // 4. Advance direct expenses (uses values array per year)
  const advanceDirectRows = advanceExpenses
    .filter(row => row.type === "direct" && row.name && row.values)
    .map((row, idx) => ({
      key: `advanceDirectExpense_${idx}`,
      values: Array.from({length: years}).map((_, yearIdx) =>
        Number(row.values?.[yearIdx]) || 0
      ),
      name: row.name
    }));

  // Build the final extractors object
  return {
    grossSales: () => formData?.computedData?.totalRevenueReceipts?.slice(0, years) || [],
     dutiesTaxes: () => Array(years).fill(0),
     netSales: () => formData?.computedData?.totalRevenueReceipts?.slice(0, years) || [],
    salary: () => salaryAndWages,
    ...Object.fromEntries(directExpenseRows.map(row => [row.key, () => row.values])),
    rawMaterial: () => rawMaterial,
    ...Object.fromEntries(advanceDirectRows.map(row => [row.key, () => row.values])),

    // totalDirect (for quick sum)
    totalDirect: () => {
      // sum all direct expenses, salary, and raw material for each year
      return Array.from({length: years}).map((_, yearIndex) =>
        salaryAndWages[yearIndex]
        + rawMaterial[yearIndex]
        + directExpenseRows.reduce((sum, row) => sum + row.values[yearIndex], 0)
        + advanceDirectRows.reduce((sum, row) => sum + row.values[yearIndex], 0)
      );
    }
    // Add other extractors (grossSales etc) as you like
  };
};


