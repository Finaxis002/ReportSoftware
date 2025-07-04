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



// For direct expenses (other than raw material), if you want 5% flat escalation per year:
export function calculateDirectExpense(base, yearIndex, monthsPerYear) {
  const rateOfExpense = 0.05; // Hardcoded or parametrize
  if (monthsPerYear[yearIndex] === 0) return 0;
  const incrementedExpense = base * Math.pow(1 + rateOfExpense, yearIndex);
  return incrementedExpense;
}

// Raw material % logic exactly like your code
export function calculateRawMaterialExpense(expense, totalRevenueReceipts, yearIndex, formData) {
  const isRawMaterial = expense.name.trim() === "Raw Material Expenses / Purchases";
  const isPercentage = String(expense.value).trim().endsWith("%");
  const ClosingStock = Number(formData?.MoreDetails?.ClosingStock?.[yearIndex] || 0);
  const OpeningStock = Number(formData?.MoreDetails?.OpeningStock?.[yearIndex] || 0);

  if (isRawMaterial && isPercentage) {
    const baseValue = (parseFloat(expense.value) / 100) * (totalRevenueReceipts?.[yearIndex] || 0);
    return baseValue + ClosingStock - OpeningStock;
  }
  return Number(expense.total) || 0;
}



      // financialCalcs.js

// 1. Utility to get number of operating months in each projection year, accounting for moratorium
export const getMonthsPerYear = (projectionYears, moratoriumPeriodMonths, startingMonth = "April") => {
  const monthsSequence = [
    "April","May","June","July","August","September",
    "October","November","December","January","February","March"
  ];
  const monthIndexMap = Object.fromEntries(monthsSequence.map((m, i) => [m, i + 1]));
  const startIndex = monthIndexMap[startingMonth] || 1;  // default to April if not provided
  let remainingMoratorium = moratoriumPeriodMonths;
  const monthsPerYear = [];

  for (let year = 1; year <= projectionYears; year++) {
    // Calculate months in the first fiscal year chunk
    let monthsInYear = 12;
    if (year === 1) {
      monthsInYear = 12 - startIndex + 1;  // e.g., if starting in April (index 1), year1 has 12 months, if May (2), year1 has 11 months, etc.
    }
    if (remainingMoratorium >= monthsInYear) {
      // Whole year is under moratorium (no operations)
      monthsPerYear.push(0);
      remainingMoratorium -= monthsInYear;
    } else {
      // Part (or none) of the year is operational
      const operationalMonths = monthsInYear - remainingMoratorium;
      monthsPerYear.push(operationalMonths);
      remainingMoratorium = 0;  // after first non-full-moratorium year, remainingMoratorium becomes 0
    }
  }
  return monthsPerYear;
};

// 2. Calculate the base annual salary including fringe benefits (Year 1 total)
//    Assumes formData.computedData contains totalAnnualWages and fringe (fringe benefits cost) for the first year.
export const calculateBaseSalaryWithFringe = (formData) => {
  const totalAnnualWages = Number(formData?.computedData?.totalAnnualWages || 0);
  const fringeCost = Number(formData?.computedData?.fringeCalculation || formData?.computedData?.fringe || 0);
  return totalAnnualWages + fringeCost;
};

// 3. Calculate escalated expense for a given base amount in a specific year, considering moratorium and annual escalation
export function calculateEscalatedExpense(baseAmount, yearIndex, monthsPerYear, rateOfExpense) {
  const monthsInYear = monthsPerYear[yearIndex];
  if (monthsInYear === 0) return 0;
  const operationalYearsPassed = monthsPerYear.slice(0, yearIndex).filter(m => m > 0).length;
  const escalatedAnnualExpense = baseAmount * Math.pow(1 + rateOfExpense, operationalYearsPassed);
  return (escalatedAnnualExpense / 12) * monthsInYear;
}

// 4. Wrapper to calculate an expense for a given year using formData settings (projection years, moratorium, escalation rate)
//    This can be used for Salary & Wages or any other expense base value.
export const calculateExpense = (formData, annualExpense, yearIndex) => {
  const projectionYears = parseInt(formData?.ProjectReportSetting?.ProjectionYears || 5);
  const moratoriumMonths = parseInt(formData?.ProjectReportSetting?.MoratoriumPeriod) || 0;
  const startingMonth = formData?.ProjectReportSetting?.SelectStartingMonth || "April";
  const rateOfExpense = (Number(formData?.ProjectReportSetting?.rateOfExpense) || 0) / 100;
  const monthsPerYear = getMonthsPerYear(projectionYears, moratoriumMonths, startingMonth);
  return calculateEscalatedExpense(Number(annualExpense) || 0, yearIndex, monthsPerYear, rateOfExpense);
};
export function getTotalAnnualWages(formData) {
  const normalExpense = formData?.Expenses?.normalExpense || [];
  if (!Array.isArray(normalExpense)) return 0;
  return normalExpense.reduce((sum, expense) => sum + Number(expense?.value || 0), 0);
}
export function getFringe(totalAnnualWages) {
  return totalAnnualWages * 0.05;
}
export function getFringeAndAnnualCalculation(formData) {
  const totalAnnualWages = getTotalAnnualWages(formData);
  const fringe = getFringe(totalAnnualWages);
  return totalAnnualWages + fringe;
}

export function filterActiveDirectExpenses(expenseRows, years, getValueForYear) {
  return expenseRows.filter(row => {
    // Only include if at least one year is nonzero
    return Array.from({ length: years }).some((_, yearIdx) => {
      // Defensive: convert value to number
      return Number(getValueForYear(row, yearIdx)) !== 0;
    });
  });
}