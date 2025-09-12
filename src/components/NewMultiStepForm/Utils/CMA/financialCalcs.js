// financialCals.js

const formData = JSON.parse(localStorage.getItem("cmaAdvanceFormData")) || {};
const projectionYears = formData?.ProjectReportSetting?.projectionYears || 5;

// Get dynamic expense rows (direct/indirect)
export const getExpenseRows = (expenses = [], type = "direct") =>
  Array.isArray(expenses)
    ? expenses.filter(
        (row) => row.type === type && row.name && row.name.trim() !== ""
      )
    : [];

// Extract per-year values from a row (supporting both array or single value)
export const extractPerYearValues = (row, years = 5) => {
  if (Array.isArray(row.values)) return row.values.slice(0, years);
  if (row.amount || row.value)
    return Array.from({ length: years }, () =>
      Number(row.amount ?? row.value ?? 0)
    );
  return Array(years).fill(0);
};

// Get total per year for an array of expense rows
export const sumExpenseRowsPerYear = (rows, years = 5) => {
  const totals = Array(years).fill(0);
  rows.forEach((row) => {
    extractPerYearValues(row, years).forEach(
      (val, i) => (totals[i] += Number(val || 0))
    );
  });
  return totals;
};

// Utility to add two arrays element-wise
export const addArrays = (a, b) =>
  a.map((v, i) => (Number(v) || 0) + (Number(b[i]) || 0));

// Utility to subtract two arrays element-wise
export const subArrays = (a, b) =>
  a.map((v, i) => (Number(v) || 0) - (Number(b[i]) || 0));

// For direct expenses (other than raw material), if you want 5% flat escalation per year:
export function calculateDirectExpense(base, yearIndex, monthsPerYear) {
  const rateOfExpense = 0.05; // Hardcoded or parametrize
  if (monthsPerYear[yearIndex] === 0) return 0;
  const incrementedExpense = base * Math.pow(1 + rateOfExpense, yearIndex);
  return incrementedExpense;
}

// Raw material % logic exactly like your code
// export function calculateRawMaterialExpense(
//   expense,
//   totalRevenueReceipts,
//   yearIndex,
//   formData
// ) {
//   const isRawMaterial =
//     expense.name.trim() === "Raw Material Expenses / Purchases";
//   const isPercentage = String(expense.value).trim().endsWith("%");
//   const ClosingStock = Number(
//     formData?.MoreDetails?.ClosingStock?.[yearIndex] || 0
//   );
//   const OpeningStock = Number(
//     formData?.MoreDetails?.OpeningStock?.[yearIndex] || 0
//   );

//   if (isRawMaterial && isPercentage) {
//     const baseValue =
//       (parseFloat(expense.value) / 100) *
//       (totalRevenueReceipts?.[yearIndex] || 0);
//     return baseValue + ClosingStock - OpeningStock;
//   }
//   return Number(expense.total) || 0;
// }


// financialCalcs.js

export function calculateRawMaterialExpense(
  expense,
  totalRevenueReceipts, // array
  yearIndex,
  formData
) {
  // helpers
  const num = (v) => {
    if (v == null) return 0;
    if (typeof v === "number") return v;
    if (typeof v === "string") {
      const s = v.trim();
      if (s.endsWith("%")) {
        const n = parseFloat(s.replace("%", "").replace(/,/g, "").trim());
        return isNaN(n) ? 0 : n / 100; // percentage -> fraction
      }
      const n = parseFloat(s.replace(/,/g, ""));
      return isNaN(n) ? 0 : n;
    }
    return Number(v) || 0;
  };
  const pctToFloat = (v) => {
    const n = num(v);
    return n > 1 ? n / 100 : n; // if 60 -> 0.60; if "60%" -> 0.60
  };

  const isRawMaterial =
    expense?.name?.trim() === "Raw Material Expenses / Purchases";
  const isPercentage =
    typeof expense?.value === "string" &&
    expense.value.trim().endsWith("%");

  if (!isRawMaterial) {
    // Not RM → behave like old fallback
    return num(expense?.total);
  }

  // ---------- % path (NO stock here in CMA flow) ----------
  if (isPercentage) {
    const perc = pctToFloat(expense.value);
    const receipts = num(totalRevenueReceipts?.[yearIndex]);
    return receipts * perc;
  }

  // ---------- non-% path → annual base then moratorium/escalation ----------
  // Prefer explicit annual fields; if only monthly given, annualize; fallback to total/value
  const annualBase =
    num(expense?.annual) ||
    num(expense?.perYear) ||
    (expense?.total ? 0 : num(expense?.monthly) * 12) ||
    (expense?.total ? 0 : num(expense?.perMonth) * 12) ||
    num(expense?.total) ||
    num(expense?.value);

  // Apply moratorium + YoY increase using your existing helper
  return calculateExpense(formData, annualBase, yearIndex);
}

// Convenience: build RM array for all years
export function getRawMaterialPerYear(formData, rmExpenseRow, receiptsArr) {
  const years = parseInt(formData?.ProjectReportSetting?.ProjectionYears || 5);
  return Array.from({ length: years }).map((_, yearIndex) =>
    calculateRawMaterialExpense(
      rmExpenseRow,
      receiptsArr, // totalRevenueReceipts array
      yearIndex,
      formData
    )
  );
}



// 1. Utility to get number of operating months in each projection year, accounting for moratorium
export const getMonthsPerYear = (
  projectionYears,
  moratoriumPeriodMonths,
  startingMonth = "April"
) => {
  const monthsSequence = [
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
    "January",
    "February",
    "March",
  ];
  const monthIndexMap = Object.fromEntries(
    monthsSequence.map((m, i) => [m, i + 1])
  );
  const startIndex = monthIndexMap[startingMonth] || 1; // default to April if not provided
  let remainingMoratorium = moratoriumPeriodMonths;
  const monthsPerYear = [];

  for (let year = 1; year <= projectionYears; year++) {
    // Calculate months in the first fiscal year chunk
    let monthsInYear = 12;
    if (year === 1) {
      monthsInYear = 12 - startIndex + 1; // e.g., if starting in April (index 1), year1 has 12 months, if May (2), year1 has 11 months, etc.
    }
    if (remainingMoratorium >= monthsInYear) {
      // Whole year is under moratorium (no operations)
      monthsPerYear.push(0);
      remainingMoratorium -= monthsInYear;
    } else {
      // Part (or none) of the year is operational
      const operationalMonths = monthsInYear - remainingMoratorium;
      monthsPerYear.push(operationalMonths);
      remainingMoratorium = 0; // after first non-full-moratorium year, remainingMoratorium becomes 0
    }
  }
  return monthsPerYear;
};

//    Assumes formData.computedData contains totalAnnualWages and fringe (fringe benefits cost) for the first year.
export const calculateBaseSalaryWithFringe = (formData) => {
  const totalAnnualWages = Number(
    formData?.computedData?.totalAnnualWages || 0
  );
  const fringeCost = Number(
    formData?.computedData?.fringeCalculation ||
      formData?.computedData?.fringe ||
      0
  );
  return totalAnnualWages + fringeCost;
};

// 3. Calculate escalated expense for a given base amount in a specific year, considering moratorium and annual escalation
export function calculateEscalatedExpense(
  baseAmount,
  yearIndex,
  monthsPerYear,
  rateOfExpense
) {
  const monthsInYear = monthsPerYear[yearIndex];
  if (monthsInYear === 0) return 0;
  const operationalYearsPassed = monthsPerYear
    .slice(0, yearIndex)
    .filter((m) => m > 0).length;
  const escalatedAnnualExpense =
    baseAmount * Math.pow(1 + rateOfExpense, operationalYearsPassed);
  return (escalatedAnnualExpense / 12) * monthsInYear;
}

// 4. Wrapper to calculate an expense for a given year using formData settings (projection years, moratorium, escalation rate)
//    This can be used for Salary & Wages or any other expense base value.
export const calculateExpense = (formData, annualExpense, yearIndex) => {
  const projectionYears = parseInt(
    formData?.ProjectReportSetting?.ProjectionYears || 5
  );
  const moratoriumMonths =
    parseInt(formData?.ProjectReportSetting?.MoratoriumPeriod) || 0;
  const startingMonth =
    formData?.ProjectReportSetting?.SelectStartingMonth || "April";
  const rateOfExpense =
    (Number(formData?.ProjectReportSetting?.rateOfExpense) || 0) / 100;
  const monthsPerYear = getMonthsPerYear(
    projectionYears,
    moratoriumMonths,
    startingMonth
  );
  return calculateEscalatedExpense(
    Number(annualExpense) || 0,
    yearIndex,
    monthsPerYear,
    rateOfExpense
  );
};

export function filterActiveDirectExpenses(
  expenseRows,
  years,
  getValueForYear
) {
  return expenseRows.filter((row) => {
    // Only include if at least one year is nonzero
    return Array.from({ length: years }).some((_, yearIdx) => {
      // Defensive: convert value to number
      return Number(getValueForYear(row, yearIdx)) !== 0;
    });
  });
}
export function getTotalAnnualWages(formData) {
  const normalExpense = formData?.Expenses?.normalExpense || [];
  if (!Array.isArray(normalExpense)) return 0;
  return normalExpense.reduce(
    (sum, expense) => sum + Number(expense?.value || 0),
    0
  );
}
export function getFringe(totalAnnualWages) {
  return totalAnnualWages * 0.05;
}
export function getFringeAndAnnualCalculation(formData) {
  const totalAnnualWages = getTotalAnnualWages(formData);
  const fringe = getFringe(totalAnnualWages);
  return totalAnnualWages + fringe;
}

export function totalRevenueReceipts(formData, formType) {
  if (formType === "Others") {
    return formData?.Revenue?.totalRevenueForOthers || [];
  } else if (formType === "Monthly") {
    return formData?.Revenue?.totalRevenue || [];
  }
  return [];
}

export const formatNumber = (formData, value) => {
  const formatType = formData?.ProjectReportSetting?.Format || "1"; // Default to Indian Format
  if (value === undefined || value === null || isNaN(value)) return "0.00"; // ✅ Handle invalid values with 2 decimals

  switch (formatType) {
    case "1": // Indian Format (1,23,456.00)
      return new Intl.NumberFormat("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);

    case "2": // USD Format (1,123,456.00)
      return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);

    case "3": // Generic Indian Format (1,23,456.00)
      return new Intl.NumberFormat("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);

    default: // Default to Indian Format with 2 decimal places
      return new Intl.NumberFormat("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
  }
};

const calculateMonthsPerYear = (
  moratoriumPeriodMonths,
  projectionYears,
  startingMonth
) => {
  let monthsArray = [];
  let remainingMoratorium = moratoriumPeriodMonths;

  for (let year = 1; year <= projectionYears; year++) {
    let monthsInYear = 12;
    if (year === 1) {
      monthsInYear = 12 - startingMonth + 1; // Months left in the starting year
    }

    if (remainingMoratorium >= monthsInYear) {
      monthsArray.push(0); // Entire year under moratorium
      remainingMoratorium -= monthsInYear;
    } else {
      monthsArray.push(monthsInYear - remainingMoratorium); // Partial moratorium impact
      remainingMoratorium = 0;
    }
  }

  return monthsArray;
};

export function calculateDepreciationWithMoratorium(
  assetValue,
  depreciationRate,
  moratoriumPeriodMonths,
  startingMonth,
  projectionYears
) {
  const monthsPerYear = calculateMonthsPerYear(
    moratoriumPeriodMonths,
    projectionYears,
    startingMonth
  );

  let yearlyDepreciation = [];
  let cumulativeDepreciation = [];
  let netAssetValue = assetValue;

  for (let yearIndex = 0; yearIndex < projectionYears; yearIndex++) {
    const monthsInYear = monthsPerYear[yearIndex];
    let depreciation = 0;
    if (monthsInYear === 0) {
      depreciation = 0;
    } else {
      depreciation = (netAssetValue / 12) * depreciationRate * monthsInYear;
    }
    yearlyDepreciation.push(depreciation);
    if (yearIndex === 0) {
      cumulativeDepreciation.push(depreciation);
    } else {
      cumulativeDepreciation.push(
        cumulativeDepreciation[yearIndex - 1] + depreciation
      );
    }
    netAssetValue -= depreciation;
  }

  return { yearlyDepreciation, cumulativeDepreciation };
}

export const depreciation = (formData) => {
  const years = Number(formData?.ProjectReportSetting?.ProjectionYears || 5);
  const moratoriumMonths =
    parseInt(formData?.ProjectReportSetting?.MoratoriumPeriod) || 0;
  const startingMonthMap = {
    April: 1,
    May: 2,
    June: 3,
    July: 4,
    August: 5,
    September: 6,
    October: 7,
    November: 8,
    December: 9,
    January: 10,
    February: 11,
    March: 12,
  };
  const selectedStartingMonth =
    formData?.ProjectReportSetting?.SelectStartingMonth || "April";
  const startingMonth = startingMonthMap[selectedStartingMonth];

  // Loop through all assets
  const assetEntries = Object.entries(formData.CostOfProject || {});
  const allYearlyDepreciation = [];
  const allCumulativeDepreciation = [];
  let totalDepreciationPerYear = Array(years).fill(0);

  assetEntries.forEach(([key, asset]) => {
    const assetValue = Number(asset.amount) || 0;
    const depreciationRate = (Number(asset.rate) || 0) / 100;
    const { yearlyDepreciation, cumulativeDepreciation } =
      calculateDepreciationWithMoratorium(
        assetValue,
        depreciationRate,
        moratoriumMonths,
        startingMonth,
        years
      );
    allYearlyDepreciation.push(yearlyDepreciation);
    allCumulativeDepreciation.push(cumulativeDepreciation);

    // Add up per year
    for (let i = 0; i < years; i++) {
      totalDepreciationPerYear[i] += yearlyDepreciation[i] || 0;
    }
  });

  return {
    allYearlyDepreciation, // Array of [ [y1, y2, ...], ... ] for each asset
    allCumulativeDepreciation, // Same as above, cumulative
    totalDepreciationPerYear, // [year1, year2, ...] summed across all assets
  };
};

export function calculateTotalDirect({
  years,
  salaryAndWages,
  rawMaterial,
  directExpenseRows,
  advanceDirectRows,
  depreciationArray, // new param: [per year]
}) {
  return Array.from({ length: years }).map(
    (_, yearIndex) =>
      (Number(salaryAndWages[yearIndex]) || 0) +
      (Number(rawMaterial[yearIndex]) || 0) +
      directExpenseRows.reduce(
        (sum, row) => sum + (Number(row.values[yearIndex]) || 0),
        0
      ) +
      advanceDirectRows.reduce(
        (sum, row) => sum + (Number(row.values[yearIndex]) || 0),
        0
      ) +
      (Number(depreciationArray?.[yearIndex]) || 0) // Add depreciation
  );
}

export function calculateCostOfSalesData({
  formData,
  years,
  salaryAndWages,
  rawMaterial,
  directExpenseRows,
  advanceDirectRows,
}) {
  // Get depreciation per year
  const depreciationArray = depreciation(formData).totalDepreciationPerYear;

  // Calculate TotalCostofSales (array of numbers)
  const TotalCostofSales = calculateTotalDirect({
    years,
    salaryAndWages,
    rawMaterial,
    directExpenseRows,
    advanceDirectRows,
    depreciationArray,
  });

  // Get Opening and Closing Stocks (arrays of numbers)
  const OpeningStocks =
    formData?.MoreDetails?.OpeningStock?.slice(0, years) || [];
  const ClosingStocks =
    formData?.MoreDetails?.ClosingStock?.slice(0, years) || [];

  // Calculate Cost of Production year-wise
  const costOfProduction = Array.from({ length: years }).map(
    (_, idx) =>
      (Number(TotalCostofSales[idx]) || 0) +
      (Number(OpeningStocks[idx]) || 0) -
      (Number(ClosingStocks[idx]) || 0)
  );

  return {
    TotalCostofSales,
    openingStocks: OpeningStocks,
    closingStocks: ClosingStocks,
    costOfProduction, // <-- This is the main 'cost of production'
  };
}

export function calculateInterestOnWorkingCapital(
  formData,
  moratoriumPeriodMonths,
  monthsPerYear
) {
  // Defensive: ensure monthsPerYear is always an array
  if (!Array.isArray(monthsPerYear)) {
    console.error("monthsPerYear is undefined or not an array", monthsPerYear);
    return () => 0; // Return a dummy function that returns 0 for all years
  }

  const principal =
    Number(formData.MeansOfFinance?.workingCapital?.termLoan) || 0;
  const rate = Number(formData.ProjectReportSetting?.interestOnWC) || 0;
  const annualInterestAmount = (principal * rate) / 100;

  const firstRepaymentYearIndex = monthsPerYear.findIndex(
    (months) => months > 0
  );

  return (yearIndex) => {
    const monthsInYear = monthsPerYear[yearIndex] || 0;
    if (monthsInYear === 0) {
      return 0;
    }
    if (
      yearIndex === firstRepaymentYearIndex &&
      (moratoriumPeriodMonths > 0 || monthsInYear < 12)
    ) {
      const prorated = (annualInterestAmount * monthsInYear) / 12;
      return prorated;
    }
    return annualInterestAmount;
  };
}

// Returns the cumulative working capital loan array for each year
export function calculateWorkingCapitalLoan(termLoanValues = []) {
  const numericTermLoanValues = termLoanValues.map((val) => Number(val) || 0);
  return numericTermLoanValues.reduce((acc, curr, idx) => {
    if (idx === 0) {
      acc.push(curr);
    } else {
      acc.push(acc[idx - 1] + curr);
    }
    return acc;
  }, []);
}

 
