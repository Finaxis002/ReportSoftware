// cmaExtractors.js

import {
  getMonthsPerYear,
  calculateEscalatedExpense,
  calculateRawMaterialExpense,
  getFringeAndAnnualCalculation,
  filterActiveDirectExpenses,
  depreciation,
  calculateCostOfSalesData,
  calculateInterestOnWorkingCapital,
  totalRevenueReceipts,
} from "./financialCalcs";

import { calculateTermLoanRepayment } from "./TermloanCalculations";

export const makeCMAExtractors = (formData) => {
  const years = Number(formData?.ProjectReportSetting?.ProjectionYears || 5);
  const receivedtotalRevenueReceipts =
    formData?.computedData?.totalRevenueReceipts || [];

  // Set up expense lists
  const directExpense = formData?.Expenses?.directExpense || [];
  const normalExpense = formData?.Expenses?.normalExpense || [];
  const advanceExpenses = formData?.Expenses?.advanceExpenses || [];

  // Core params for escalation/moratorium
  const rateOfExpense =
    (formData?.ProjectReportSetting?.rateOfExpense || 0) / 100;
  const moratoriumPeriodMonths =
    parseInt(formData?.ProjectReportSetting?.MoratoriumPeriod) || 0;
  const projectionYears =
    parseInt(formData?.ProjectReportSetting?.ProjectionYears) || 5;
  const startingMonth =
    formData?.ProjectReportSetting?.SelectStartingMonth || "April";
  const monthsPerYear = getMonthsPerYear(
    projectionYears,
    moratoriumPeriodMonths,
    startingMonth
  );
  const termLoan = formData?.MeansOfFinance?.termLoan?.termLoan;
  const interestRate = formData.ProjectReportSetting.interestOnTL / 100;
  const repaymentMonths = formData.ProjectReportSetting.RepaymentMonths;
  // 1. Salary & wages (using same escalation/moratorium as ProjectedProfitability)

  const hideFirstYear = totalRevenueReceipts?.[0] === 0;

  const baseSalary = getFringeAndAnnualCalculation(formData);

  const salaryAndWages = Array.from({ length: years }, (_, yearIndex) =>
    calculateEscalatedExpense(
      baseSalary,
      yearIndex,
      monthsPerYear,
      rateOfExpense
    )
  );

  const getDirectExpenseValueForYear = (row, yearIndex) => {
    if (
      row.name.trim() === "Raw Material Expenses / Purchases" &&
      String(row.value).trim().endsWith("%")
    ) {
      return calculateRawMaterialExpense(
        row,
        receivedtotalRevenueReceipts,
        yearIndex,
        formData
      );
    }
    return calculateEscalatedExpense(
      Number(row.total) || 0,
      yearIndex,
      monthsPerYear,
      rateOfExpense
    );
  };


  const filteredDirectExpense = filterActiveDirectExpenses(
    directExpense.filter(
      (row) => row.name.trim() !== "Raw Material Expenses / Purchases"
    ),
    years,
    getDirectExpenseValueForYear
  );

  const directExpenseRows = filteredDirectExpense
    .filter((row) => row.name.trim() !== "Administrative Expenses") // Only direct type rows
    .map((row, idx) => {
      // Now, all rows here are type "direct"
      console.log("row type", row.type);
      return {
        key: `directExpense_${idx}`,
        values: Array.from({ length: years }).map((_, yearIndex) =>
          getDirectExpenseValueForYear(row, yearIndex)
        ),
        name: row.name,
        type: row.type,
      };
    });

  const administrativeExpenseRows = filteredDirectExpense
    .filter((row) => row.name.trim() === "Administrative Expenses")
    .map((row, idx) => {
      // For uniqueness, use a prefix like "adminExpense"
      return {
        key: `adminExpense_${idx}`,
        values: Array.from({ length: years }).map((_, yearIndex) =>
          getDirectExpenseValueForYear(row, yearIndex)
        ),
        name: row.name,
        type: row.type,
      };
    });


  const adminValues = administrativeExpenseRows[0]?.values || [];

  

  // 3. Raw Material row
  const rawMatRow = directExpense.find(
    (row) => row.name.trim() === "Raw Material Expenses / Purchases"
  );

  const rawMaterial = rawMatRow
    ? Array.from({ length: years }).map((_, yearIdx) =>
        calculateRawMaterialExpense(
          rawMatRow,
          receivedtotalRevenueReceipts,
          yearIdx,
          formData
        )
      )
    : Array(years).fill(0);

  // 4. Advance direct expenses (uses values array per year)
  const advanceDirectRows = advanceExpenses
    .filter((row) => row.type === "direct" && row.name && row.values)
    .map((row, idx) => ({
      key: `advanceDirectExpense_${idx}`,
      values: Array.from({ length: years }).map(
        (_, yearIdx) => Number(row.values?.[yearIdx]) || 0
      ),
      name: row.name,
    }));

  const costData = calculateCostOfSalesData({
    years,
    salaryAndWages,
    rawMaterial,
    directExpenseRows,
    advanceDirectRows,
    formData,
  });

  const openingStocks =
    formData?.MoreDetails?.OpeningStock?.slice(0, years) || [];
  const closingStocks =
    formData?.MoreDetails?.ClosingStock?.slice(0, years) || [];

  const TotalCostofSales = Array.from({ length: years }).map(
    (_, i) =>
      (Number(costData.TotalCostofSales[i]) || 0) +
      (Number(openingStocks[i]) || 0) -
      (Number(closingStocks[i]) || 0)
  );

  const yearlyInterestLiabilities = calculateTermLoanRepayment({
    termLoan,
    interestRate,
    moratoriumPeriod:
      parseInt(formData?.ProjectReportSetting?.MoratoriumPeriod) || 0,
    repaymentMonths,
    startMonthName: formData.ProjectReportSetting.SelectStartingMonth,
    financialYearStart: parseInt(
      formData.ProjectReportSetting.FinancialYear || 2025
    ),
  });

  const interestOnWC = calculateInterestOnWorkingCapital(
    formData,
    moratoriumPeriodMonths,
    monthsPerYear
  );

  const interestOnWCArray = Array.from({ length: years }).map((_, yearIdx) =>
    interestOnWC(yearIdx)
  );

  const preliminaryExpensesTotal = Number(
    formData?.CostOfProject?.preliminaryExpensesTotal || 0
  );

  const preliminaryWriteOffYears = Number(
    formData?.CostOfProject?.preliminaryWriteOffYears || 0
  );

  // Calculate yearly write-off value
  const yearlyWriteOffAmount =
    preliminaryWriteOffYears > 0
      ? preliminaryExpensesTotal / preliminaryWriteOffYears
      : 0;

  // Generate the array for yearly values
  const preliminaryWriteOffPerYear = Array.from({
    length: projectionYears,
  }).map((_, index) => {
    const startIndex = hideFirstYear ? 1 : 0;
    const endIndex = startIndex + preliminaryWriteOffYears;

    // 👇 Only insert value if it's within the write-off window
    if (index >= startIndex && index < endIndex) {
      return yearlyWriteOffAmount;
    }

    // 👇 Insert 0 for all other years (including hidden first year)
    return 0;
  });

  const OperatingProfit = (
    formData?.computedData?.totalRevenueReceipts?.slice(0, years) || []
  ).map((n, i) => {
    const grossProfit = (Number(n) || 0) - (Number(TotalCostofSales[i]) || 0);
    const interestTL =
      Number(yearlyInterestLiabilities.yearlyInterestLiabilities[i]) || 0;
    const interestWC = Number(interestOnWCArray[i]) || 0;
    const adminExp = Number(adminValues[i]) || 0;
    const prelim = Number(preliminaryWriteOffPerYear[i]) || 0;
    const operatingProfit =
      grossProfit - interestTL - interestWC - adminExp - prelim;

    // Log breakdown for this year
    // console.log(
    //   `Year ${i + 1} Calculation:\n` +
    //   `  Gross Profit: ${grossProfit}\n` +
    //   `  - Interest on TL: ${interestTL}\n` +
    //   `  - Interest on WC: ${interestWC}\n` +
    //   `  - Administrative Expenses: ${adminExp}\n` +
    //   `  - Preliminary Write Off: ${prelim}\n` +
    //   `= Operating Profit: ${operatingProfit}\n`
    // );

    return operatingProfit;
  });


  const otherIncome = Array(years).fill(0);

  // Now calculate Profit Before Tax (PBT)
  const ProfitbeforeTax = OperatingProfit.map(
    (op, i) => Number(op) + Number(otherIncome[i] || 0)
  );
  const ProvisionforInvestmentAllowance = Array(years).fill(0);

  const incomeTaxCal = formData?.computedData?.incomeTaxCalculation?.incomeTaxCalculation || [] ;
  console.log("incomeTaxCalculation : ", incomeTaxCal)

 const netProfitAfterTax =  formData.computedData.computedData.netProfitAfterTax  || [] ;
console.log('net Profit After Tax', netProfitAfterTax)
  // Build the final extractors object
  return {
    year: () => Number(formData?.ProjectReportSetting?.ProjectionYears || 5),
    yearLabels: () =>
      Array.from(
        { length: years },
        (_, i) =>
          (Number(formData?.ProjectReportSetting?.StartYear) || 2024) + i
      ),
    grossSales: () =>
      formData?.computedData?.totalRevenueReceipts?.slice(0, years) || [],
    dutiesTaxes: () => Array(years).fill(0),
    netSales: () =>
      formData?.computedData?.totalRevenueReceipts?.slice(0, years) || [],
    salary: () => salaryAndWages,
    ...Object.fromEntries(
      directExpenseRows.map((row) => [row.key, () => row.values])
    ),
    rawMaterial: () => rawMaterial,
    ...Object.fromEntries(
      advanceDirectRows.map((row) => [row.key, () => row.values])
    ),
    // depreciation: () => depreciation(formData),
    depreciation: () => depreciation(formData).totalDepreciationPerYear,
    directExpenses: () => directExpenseRows,
    // totalDirect (for quick sum)

    OpeningStockinProcess: () => Array(years).fill(0),
    StockAdjustment: () => Array(years).fill(0),
    SubTotalCostofSales: () => costData.TotalCostofSales,
    openingStocks: () => openingStocks,
    closingStocks: () => closingStocks,
    TotalCostofSales: () => TotalCostofSales,
    GrossProfit: () =>
      (formData?.computedData?.totalRevenueReceipts?.slice(0, years) || []).map(
        (n, i) => (Number(n) || 0) - (Number(TotalCostofSales[i]) || 0)
      ),

    yearlyInterestLiabilities: () =>
      yearlyInterestLiabilities.yearlyInterestLiabilities,
    // interestOnWorkingCapital: () => com
    interestOnWCArray: () => interestOnWCArray,
    administrativeExpenseRows: () => administrativeExpenseRows,
    preliminaryWriteOffPerYear: () => preliminaryWriteOffPerYear,
    OperatingProfit: () => OperatingProfit,

    otherIncome: () => otherIncome,
    ProfitbeforeTax: () => ProfitbeforeTax,
    ProvisionforInvestmentAllowance: () => ProvisionforInvestmentAllowance,
    incomeTaxCal: () => incomeTaxCal,
    netProfitAfterTax : () => netProfitAfterTax ,

  };
};
