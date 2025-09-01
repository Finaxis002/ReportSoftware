import React, { useEffect, useMemo, useState, useRef } from "react";
import { Page, View, Text, Image } from "@react-pdf/renderer";
import {
  styles,
  stylesCOP,
  stylesMOF,
  styleExpenses,
} from "../PDFComponents/Styles";
import { Font } from "@react-pdf/renderer";
import SAWatermark from "../Assets/SAWatermark";
import CAWatermark from "../Assets/CAWatermark";
import shouldHideFirstYear from "../PDFComponents/HideFirstYear";
import { makeCMAExtractors } from "../Utils/CMA/cmaExtractors";
import { CMAExtractorFinPos } from "../Utils/CMA/CMAExtractorFInPos";
import { CMAExtractorFundFlow } from "../Utils/CMA/CMAExtractorFundFlow";
import { CMAExtractorProfitability } from "../Utils/CMA/CMAExtractorProfitability";
import { ppid } from "process";

// ✅ Register a Font That Supports Bold
Font.register({
  family: "Roboto",
  fonts: [
    { src: "https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Me5Q.ttf" }, // Regular
    {
      src: "https://fonts.gstatic.com/s/roboto/v20/KFOlCnqEu92Fr1MmEU9vAw.ttf",
      fontWeight: "bold",
    }, // Bold
  ],
});

const num = (v) => {
  // Handle percentages by dividing by 100
  if (typeof v === "string") {
    if (v.trim().endsWith("%")) {
      return parseFloat(v.replace("%", "").replace(/,/g, "").trim()) / 100 || 0;
    }
    // Handle commas (thousands) and convert to number
    return parseFloat(v.replace(/,/g, "").trim()) || 0;
  }
  return Number(v) || 0;
};

const CMAProjectedProfitability = ({
  formData,
  localData,
  normalExpense,
  directExpense,
  totalDepreciationPerYear,
  onComputedData,
  yearlyInterestLiabilities,
  setInterestOnWorkingCapital, // ✅ Receiving Setter Function from Parent
  totalRevenueReceipts,
  fringAndAnnualCalculation,
  financialYearLabels,
  handleDataSend,
  handleIncomeTaxDataSend,
  formatNumber,
  receivedtotalRevenueReceipts,
  onComputedDataToProfit,
  pdfType,
  orientation,
}) => {
  const PPExtractor = CMAExtractorProfitability(formData);
  const extractors = makeCMAExtractors(formData);
  const yearLabels = extractors.yearLabels();

  // Defensive defaults for props that may be undefined
  formData = formData || {};

  // useEffect(() => {
  //   if (yearlyInterestLiabilities.length > 0) {
  //     //  console.log("✅ Updated Yearly Interest Liabilities in State:", yearlyInterestLiabilities);
  //   }
  // }, [yearlyInterestLiabilities]); // ✅ Runs when state update

  const activeRowIndex = 0; // Define it or fetch dynamically if needed

  const projectionYears =
    parseInt(formData.ProjectReportSetting.ProjectionYears) || 0;

  const indirectExpense = (directExpense || []).filter(
    (expense) => expense.type === "indirect"
  );

  const months = [
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

  // Month Mapping
  const monthMap = {
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

  const selectedMonth =
    formData?.ProjectReportSetting?.SelectStartingMonth || "April";
  const x = monthMap[selectedMonth]; // Starting month mapped to FY index

  const moratoriumPeriodMonths =
    parseInt(formData?.ProjectReportSetting?.MoratoriumPeriod) || 0;

  const rateOfExpense =
    (formData?.ProjectReportSetting?.rateOfExpense || 0) / 100;

  const hideFirstYear = shouldHideFirstYear(receivedtotalRevenueReceipts);
  // Function to handle moratorium period spillover across financial years
  const calculateMonthsPerYear = () => {
    let monthsArray = [];
    let remainingMoratorium = moratoriumPeriodMonths;
    for (let year = 1; year <= projectionYears; year++) {
      let monthsInYear = 12;
      if (year === 1) {
        monthsInYear = 12 - x + 1; // Months left in the starting year
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
  const monthsPerYear = calculateMonthsPerYear();

  const isZeroValue = (val) => {
    const num = Number(val);
    return !num || num === 0; // covers 0, null, undefined, NaN, ""
  };

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
    const startIndex = 0;
    const endIndex = startIndex + preliminaryWriteOffYears;

    // 👇 Only insert value if it's within the write-off window
    if (index >= startIndex && index < endIndex) {
      return yearlyWriteOffAmount;
    }

    // 👇 Insert 0 for all other years (including hidden first year)
    return 0;
  });

  const isPreliminaryWriteOffAllZero = Array.from({
    length: hideFirstYear ? projectionYears - 1 : projectionYears,
  }).every((_, yearIndex) => {
    const adjustedYearIndex = hideFirstYear ? yearIndex + 1 : yearIndex;
    return preliminaryWriteOffPerYear[adjustedYearIndex] === 0;
  });

  console.log("Preliminary Write-Off Per Year:", preliminaryWriteOffPerYear);
  console.log(
    "Is Preliminary Write-Off All Zero:",
    isPreliminaryWriteOffAllZero
  );

  //////////////////////////////   new data
  const FinPosextractors = CMAExtractorFinPos(formData);
  const FundFlowExtractor = CMAExtractorFundFlow(formData);
  const totalRevenueReceipt = FinPosextractors.totalRevenueReceipt() || [];
  const value10reduceRevenueReceipt =
    PPExtractor.value10reduceRevenueReceipt() || [];
  const newRevenueReceipt = PPExtractor.newRevenueReceipt() || [];
  const ClosingStock = PPExtractor.ClosingStock() || [];
  const OpeningStock = PPExtractor.OpeningStock() || [];
  const adjustedRevenueValues = PPExtractor.adjustedRevenueValues() || [];
  const { totalSalaryAndWages } = CMAExtractorProfitability(formData);
  // const grossProfit = PPExtractor.grossProfit() || [];
  const interestOnTermLoan = PPExtractor.interestOnTermLoan() || [];
  const interestOnWCArray = PPExtractor.interestOnWCArray() || [];
  const depreciation = PPExtractor.depreciation() || [];
  const salaryandwages = extractors.salary();
  const rawmaterial = extractors.rawMaterial();
  const directExpensesArray = extractors.directExpenses?.() || [];
  const filteredDirectExpenses = directExpensesArray.filter(
    (exp) => exp.name !== "Raw Material Expenses / Purchases"
  );

  const OnlyfilteredDirectExpenses =
    filteredDirectExpenses.filter((expense) => expense.type === "direct") || [];

  const OnlyIndirectExpenses =
    filteredDirectExpenses.filter((expense) => expense.type === "indirect") ||
    [];

  console.log("OnlyfilteredDirectExpenses", OnlyfilteredDirectExpenses);
  const hasRawMaterial = rawmaterial.some((val) => Number(val) !== 0);
  const directExpenseStartSerial = hasRawMaterial ? 3 : 2;

  const administrativeExpenseRows =
    extractors.administrativeExpenseRows() || [];

  const adminValues = administrativeExpenseRows[0]?.values || [];

  const totalDirectExpenses = Array.from({ length: projectionYears }).map(
    (_, idx) => {
      let totalSalary = Number(salaryandwages[idx] || 0);
      let totalMaterial = Number(rawmaterial[idx] || 0);
      let administrativeExpenses = Number(adminValues[idx] || 0);

      // Sum values from OnlyfilteredDirectExpenses
      let totalDirectExpense = OnlyfilteredDirectExpenses.reduce(
        (sum, expense) => {
          const expenseValue = expense.values[idx] || 0; // Access the value for the specific year
          return sum + Number(expenseValue); // Add to the running total
        },
        0
      );

      // Return the total of salary, material, and direct expenses for the year
      return (
        totalSalary +
        totalMaterial +
        totalDirectExpense +
        administrativeExpenses
      );
    }
  );

  const totalIndirectExpenses = Array.from({ length: projectionYears }).map(
    (_, idx) => {
      let TermLoan = Number(interestOnTermLoan[idx] || 0);
      let WCArray = Number(interestOnWCArray[idx] || 0);
      let depreciationadd = Number(depreciation[idx] || 0);
      // Sum values from OnlyfilteredDirectExpenses
      let totalIndirectExpense = OnlyIndirectExpenses.reduce((sum, expense) => {
        const expenseValue = expense.values[idx] || 0; // Access the value for the specific year
        return sum + Number(expenseValue); // Add to the running total
      }, 0);
      const preliminaryExpense = preliminaryWriteOffPerYear[idx] || 0;
      // Return the total of salary, material, and direct expenses for the year
      return (
        TermLoan +
        WCArray +
        depreciationadd +
        totalIndirectExpense +
        preliminaryExpense
      );
    }
  );

  const netProfitBeforeTax = PPExtractor.netProfitBeforeTax() || [];
  // const incomeTaxCalculation =  PPExtractor.incomeTaxCalculation() || [];
  const netProfitAfterTax = PPExtractor.netProfitAfterTax() || [];
  const Withdrawals = PPExtractor.Withdrawals() || [];
  const balanceTrfBalncSheet = PPExtractor.balanceTrfBalncSheet() || [];
  // const cumulativeBalanceTransferred = PPExtractor.cumulativeBalanceTransferred() || [];
  // const cashProfit = PPExtractor.cashProfit() || [];
  const grossProfit = Array.from({ length: projectionYears }).map(
    (_, i) => Number(newRevenueReceipt[i]) - Number(totalDirectExpenses[i])
  );

  const NPBT = Array.from({ length: projectionYears }).map(
    (_, i) => Number(grossProfit[i]) - Number(totalIndirectExpenses[i])
  );

  const incomeTax = formData?.ProjectReportSetting?.incomeTax || 0;
  const incomeTaxCalculation = Array.from({ length: projectionYears }).map(
    (_, i) => Number((Number(NPBT[i] || 0) * incomeTax) / 100)
  );

  const NPAT = Array.from({ length: projectionYears }).map(
    (_, i) => Number(NPBT[i]) - Number(incomeTaxCalculation[i])
  );

  const balanceTransferred = Array.from({ length: projectionYears }).map(
    (_, i) => Number(NPBT[i]) - Number(Withdrawals[i])
  );

  const cumulativeBalanceTransferred = [];
  balanceTransferred.forEach((amount, index) => {
    if (index === 0) {
      cumulativeBalanceTransferred.push(Math.max(amount, 0)); // First year, just the amount itself
    } else {
      // For subsequent years, sum of Balance Trf. and previous year's Cumulative Balance
      cumulativeBalanceTransferred.push(
        Math.max(amount + cumulativeBalanceTransferred[index - 1], 0)
      );
    }
  });

  // const cashProfitArray = netProfitAfterTax.map((npat, yearIndex) => {
  //   const depreciation = totalDepreciationPerYear[yearIndex] || 0;

  //   // ✅ Correctly Compute Cash Profit
  //   const cashProfit = npat + depreciation;

  //   // ✅ Round values correctly
  //   return cashProfit;
  // });

  const cashProfit = Array.from({ length: projectionYears }).map(
    (_, i) => Number(NPAT[i]) + Number(depreciation[i])
  );

  const revenueReducePercentage = PPExtractor.revenueReducePercentage() || 10;

  const isAdvancedLandscape = orientation === "advanced-landscape";
  let splitYearLabels = [yearLabels];
  let splitFinancialYearLabels = [yearLabels];
  if (isAdvancedLandscape) {
    const visibleLabels = yearLabels; // (no hideFirstYear logic here, but add if needed)
    const totalCols = visibleLabels.length;
    const firstPageCols = Math.ceil(totalCols / 2);
    const secondPageCols = totalCols - firstPageCols;
    splitYearLabels = [
      visibleLabels.slice(0, firstPageCols),
      visibleLabels.slice(firstPageCols, firstPageCols + secondPageCols),
    ];
  }
  const toRoman = (n) =>
    ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"][n] || n + 1;

if (isAdvancedLandscape) {
  return splitYearLabels.map((labels, pageIdx) => {
    const pageStart = yearLabels.indexOf(labels[0]);
    const globalIndex = (localIdx) => pageStart + localIdx;

    return (
      <Page size="A4" style={styles.page} orientation="landscape">
        {/* watermark  */}
        {pdfType &&
          pdfType !== "select option" &&
          (pdfType === "Sharda Associates" || pdfType === "CA Certified") && (
            <View
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: 500,
                height: 700,
                marginLeft: -200,
                marginTop: -350,
                opacity: 0.4,
                zIndex: -1,
              }}
            >
              <Image
                src={pdfType === "Sharda Associates" ? SAWatermark : CAWatermark}
                style={{
                  width: "100%",
                  height: "100%",
                }}
              />
            </View>
          )}

        <View style={[styleExpenses.paddingx, { paddingBottom: "30px" }]}>
          {/* business name and financial year  */}
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

          <View
            style={{
              display: "flex",
              alignContent: "flex-end",
              justifyContent: "flex-end",
              alignItems: "flex-end",
            }}
          >
            <Text style={[styles.AmountIn, styles.italicText]}>
              (Amount In{" "}
              {formData?.ProjectReportSetting?.AmountIn === "rupees"
                ? "Rs."
                : formData?.ProjectReportSetting?.AmountIn === "thousand"
                ? "Thousands"
                : formData?.ProjectReportSetting?.AmountIn === "lakhs"
                ? "Lakhs"
                : formData?.ProjectReportSetting?.AmountIn === "crores"
                ? "Crores"
                : formData?.ProjectReportSetting?.AmountIn === "millions"
                ? "Millions"
                : ""}
              )
            </Text>
          </View>

          <View>
            <View style={stylesCOP.heading}>
              <Text>Sensitivity Analysis</Text>
              <Text>
                Projected Profitability (Revenue Reduced by {revenueReducePercentage}
                %)
                {splitYearLabels.length > 1 ? ` (${toRoman(pageIdx)})` : ""}
              </Text>
            </View>
            <View style={[styles.table, { borderRightWidth: 0 }]}>
              <View style={styles.tableHeader}>
                <Text
                  style={[
                    styles.serialNoCell,
                    styleExpenses.sno,
                    styleExpenses.fontBold,
                    { textAlign: "center" },
                  ]}
                >
                  S. No.
                </Text>
                <Text
                  style={[
                    styles.detailsCell,
                    styleExpenses.particularWidth,
                    styleExpenses.fontBold,
                    { textAlign: "center" },
                  ]}
                >
                  Particulars
                </Text>

                {/* Generate Dynamic Year Headers using paged labels */}
                {labels.map((label, localIdx) => (
                  <Text
                    key={label || localIdx}
                    style={[styles.particularsCell, stylesCOP.boldText]}
                  >
                    {label}
                  </Text>
                ))}
              </View>

              {/* Blank Row */}
              <View
                style={[
                  stylesMOF.row,
                  styles.tableRow,
                  styles.Total,
                  { border: 0 },
                ]}
              >
                <Text
                  style={[
                    stylesCOP.serialNoCellDetail,
                    styleExpenses.sno,
                    styleExpenses.bordernone,
                    styles.Total,
                  ]}
                />
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                    styles.Total,
                  ]}
                />
                {labels.map((label, localIdx) => (
                  <Text
                    key={label || localIdx}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                      { paddingVertical: "5px" },
                    ]}
                  />
                ))}
              </View>

              {/* ✅ Total Revenue Receipt */}
              <View style={[styles.tableRow, styles.totalRow, styles.Total]}>
                <Text
                  style={[
                    stylesCOP.serialNoCellDetail,
                    styleExpenses.sno,
                    styleExpenses.bordernone,
                    styles.Total,
                  ]}
                >
                  A
                </Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                    styles.Total,
                  ]}
                >
                  Total Revenue Receipt
                </Text>

                {labels.map((_, localIdx) => (
                  <Text
                    key={`totrev-${localIdx}`}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      stylesCOP.boldText,
                      styleExpenses.fontSmall,
                      styles.Total,
                      { borderLeftWidth: "0px" },
                    ]}
                  >
                    {formatNumber(totalRevenueReceipt?.[globalIndex(localIdx)] || 0)}
                  </Text>
                ))}
              </View>

              {/* ✅ Less: Revenue reduced by % */}
              <View style={[stylesMOF.row, styles.tableRow, { border: 0 }]}>
                <Text
                  style={[
                    stylesCOP.serialNoCellDetail,
                    styleExpenses.sno,
                    styleExpenses.bordernone,
                  ]}
                />
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  Less: Revenue reduced by {revenueReducePercentage}%
                </Text>

                {labels.map((_, localIdx) => (
                  <Text
                    key={`lessrev-${localIdx}`}
                    style={[stylesCOP.particularsCellsDetail, styleExpenses.fontSmall]}
                  >
                    {formatNumber(
                      value10reduceRevenueReceipt?.[globalIndex(localIdx)] || 0
                    )}
                  </Text>
                ))}
              </View>

              {/* ✅ New Revenue (after reduction) */}
              <View
                style={[
                  stylesMOF.row,
                  styles.tableRow,
                  styles.Total,
                  { border: 0 },
                ]}
              >
                <Text
                  style={[
                    stylesCOP.serialNoCellDetail,
                    styleExpenses.sno,
                    styleExpenses.bordernone,
                    styles.Total,
                  ]}
                />
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                    styles.Total,
                  ]}
                />
                {labels.map((_, localIdx) => (
                  <Text
                    key={`newrev-${localIdx}`}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      stylesCOP.boldText,
                      styleExpenses.fontSmall,
                      styles.Total,
                      { borderLeftWidth: "0px" },
                    ]}
                  >
                    {formatNumber(newRevenueReceipt?.[globalIndex(localIdx)] || 0)}
                  </Text>
                ))}
              </View>

              {/* Closing Stock / Inventory */}
              <View style={[styles.tableRow, styles.totalRow]}>
                <Text
                  style={[
                    stylesCOP.serialNoCellDetail,
                    styleExpenses.sno,
                    styleExpenses.bordernone,
                    styles.Total,
                    { paddingVertical: "10px" },
                  ]}
                >
                  B
                </Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  Add: Closing Stock / Inventory
                </Text>

                {labels.map((_, localIdx) => (
                  <Text
                    key={`close-${localIdx}`}
                    style={[stylesCOP.particularsCellsDetail, styleExpenses.fontSmall]}
                  >
                    {formatNumber(ClosingStock?.[globalIndex(localIdx)] ?? 0)}
                  </Text>
                ))}
              </View>

              {/* Opening Stock / Inventory */}
              <View style={[styles.tableRow, styles.totalRow]}>
                <Text
                  style={[
                    stylesCOP.serialNoCellDetail,
                    styleExpenses.sno,
                    styleExpenses.bordernone,
                  ]}
                />
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  Less: Opening Stock / Inventory
                </Text>

                {labels.map((_, localIdx) => (
                  <Text
                    key={`open-${localIdx}`}
                    style={[stylesCOP.particularsCellsDetail, styleExpenses.fontSmall]}
                  >
                    {formatNumber(OpeningStock?.[globalIndex(localIdx)] ?? 0)}
                  </Text>
                ))}
              </View>

              {/* Computed Adjusted Revenue */}
              <View
                style={[
                  stylesMOF.row,
                  styles.tableRow,
                  styles.Total,
                  { borderBottomWidth: "0px" },
                ]}
              >
                <Text
                  style={[
                    stylesCOP.serialNoCellDetail,
                    styleExpenses.sno,
                    styleExpenses.bordernone,
                  ]}
                />
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                />
                {labels.map((_, localIdx) => (
                  <Text
                    key={`adjrev-${localIdx}`}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      stylesCOP.boldText,
                      styleExpenses.fontSmall,
                      { borderLeftWidth: "0px" },
                    ]}
                  >
                    {formatNumber(adjustedRevenueValues?.[globalIndex(localIdx)] || 0)}
                  </Text>
                ))}
              </View>

              {/* Direct Expenses */}
              <View style={[styles.tableRow, styles.totalRow]}>
                <Text
                  style={[
                    stylesCOP.serialNoCellDetail,
                    styles.Total,
                    { paddingVertical: "10px" },
                  ]}
                >
                  C
                </Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                    styles.Total,
                    { paddingVertical: "10px" },
                  ]}
                >
                  Direct Expenses
                </Text>
                {labels.map((label, localIdx) => (
                  <Text
                    key={`direct-head-${label || localIdx}`}
                    style={[stylesCOP.particularsCellsDetail, styleExpenses.fontSmall]}
                  />
                ))}
              </View>

              {/* 1 Salaries & Wages */}
              <View style={[styles.tableRow, styles.totalRow]}>
                <Text style={stylesCOP.serialNoCellDetail}>1</Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  Salaries & Wages
                </Text>

                {labels.map((_, localIdx) => (
                  <Text
                    key={`sal-${localIdx}`}
                    style={[stylesCOP.particularsCellsDetail, styleExpenses.fontSmall]}
                  >
                    {formatNumber(salaryandwages?.[globalIndex(localIdx)] || 0)}
                  </Text>
                ))}
              </View>

              {/* 2 Raw Material Expenses */}
              {rawmaterial?.some((val) => Number(val) !== 0) && (
                <View style={[styles.tableRow, styles.totalRow]}>
                  <Text style={stylesCOP.serialNoCellDetail}>2</Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                    ]}
                  >
                    Raw Material Expenses
                  </Text>

                  {labels.map((_, localIdx) => (
                    <Text
                      key={`raw-${localIdx}`}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                      ]}
                    >
                      {formatNumber(rawmaterial?.[globalIndex(localIdx)] || 0)}
                    </Text>
                  ))}
                </View>
              )}

              {/* Map Direct Expenses (type = "direct") */}
              {OnlyfilteredDirectExpenses.map((expense, dIdx) => (
                <View
                  key={expense.key || expense.name || dIdx}
                  style={[styles.tableRow, styles.totalRow]}
                >
                  <Text style={stylesCOP.serialNoCellDetail}>
                    {directExpenseStartSerial + dIdx}
                  </Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                    ]}
                  >
                    {expense.name}
                  </Text>

                  {labels.map((_, localIdx) => (
                    <Text
                      key={`dir-${dIdx}-${localIdx}`}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                      ]}
                    >
                      {formatNumber(
                        Array.isArray(expense.values)
                          ? Number(expense.values[globalIndex(localIdx)]) || 0
                          : Number(expense.value) || 0
                      )}
                    </Text>
                  ))}
                </View>
              ))}

              {/* Administrative Expenses */}
              <View style={[styles.tableRow, styles.totalRow]}>
                <Text style={stylesCOP.serialNoCellDetail}>9</Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  Administrative Expenses
                </Text>

                {labels.map((_, localIdx) => (
                  <Text
                    key={`admin-${localIdx}`}
                    style={[stylesCOP.particularsCellsDetail, styleExpenses.fontSmall]}
                  >
                    {formatNumber(adminValues?.[globalIndex(localIdx)] || 0)}
                  </Text>
                ))}
              </View>

              {/* Direct Expenses Total */}
              <View style={[styles.tableRow, styles.totalRow, styles.Total]}>
                <Text
                  style={[
                    stylesCOP.serialNoCellDetail,
                    styleExpenses.sno,
                    styleExpenses.bordernone,
                  ]}
                />
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  Total
                </Text>
                {labels.map((_, localIdx) => (
                  <Text
                    key={`tdir-${localIdx}`}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      stylesCOP.boldText,
                      styleExpenses.fontSmall,
                      styles.Total,
                      { borderLeftWidth: "0px" },
                    ]}
                  >
                    {formatNumber(totalDirectExpenses?.[globalIndex(localIdx)] || 0)}
                  </Text>
                ))}
              </View>

              {/* Blank Row */}
              <View
                style={[
                  stylesMOF.row,
                  styles.tableRow,
                  styles.Total,
                  { border: 0 },
                ]}
              >
                <Text
                  style={[
                    stylesCOP.serialNoCellDetail,
                    styleExpenses.sno,
                    styleExpenses.bordernone,
                    styles.Total,
                  ]}
                />
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                    styles.Total,
                  ]}
                />
                {labels.map((label, localIdx) => (
                  <Text
                    key={label || localIdx}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                      { paddingVertical: "5px" },
                    ]}
                  />
                ))}
              </View>

              {/* Gross Profit */}
              <View style={[stylesMOF.row, styles.tableRow, styles.Total]}>
                <Text
                  style={[
                    stylesCOP.serialNoCellDetail,
                    styleExpenses.sno,
                    styleExpenses.bordernone,
                  ]}
                >
                  D
                </Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  Gross Profit
                </Text>

                {labels.map((_, localIdx) => (
                  <Text
                    key={`gp-${localIdx}`}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      stylesCOP.boldText,
                      styleExpenses.fontSmall,
                      styles.Total,
                      { borderLeftWidth: "0px" },
                    ]}
                  >
                    {formatNumber(grossProfit?.[globalIndex(localIdx)] || 0)}
                  </Text>
                ))}
              </View>

              {/* Indirect Expenses */}
              <View style={[styles.tableRow, styles.totalRow]}>
                <Text
                  style={[
                    stylesCOP.serialNoCellDetail,
                    styles.Total,
                    { paddingVertical: "10px" },
                  ]}
                >
                  E
                </Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                    styles.Total,
                    { paddingVertical: "10px" },
                  ]}
                >
                  Less: Indirect Expenses
                </Text>
                {labels.map((label, localIdx) => (
                  <Text
                    key={`ind-head-${label || localIdx}`}
                    style={[stylesCOP.particularsCellsDetail, styleExpenses.fontSmall]}
                  />
                ))}
              </View>

              {/* 1 Interest on Term Loan */}
              <View style={[styles.tableRow]}>
                <Text style={stylesCOP.serialNoCellDetail}>1</Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  Interest on Term Loan
                </Text>

                {labels.map((_, localIdx) => (
                  <Text
                    key={`itl-${localIdx}`}
                    style={[stylesCOP.particularsCellsDetail, styleExpenses.fontSmall]}
                  >
                    {formatNumber(interestOnTermLoan?.[globalIndex(localIdx)] || 0)}
                  </Text>
                ))}
              </View>

              {/* 2 Interest on Working Capital */}
              <View style={[styles.tableRow]}>
                <Text style={stylesCOP.serialNoCellDetail}>2</Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  Interest on Working Capital
                </Text>

                {labels.map((_, localIdx) => (
                  <Text
                    key={`iwc-${localIdx}`}
                    style={[stylesCOP.particularsCellsDetail, styleExpenses.fontSmall]}
                  >
                    {formatNumber(interestOnWCArray?.[globalIndex(localIdx)] || 0)}
                  </Text>
                ))}
              </View>

              {/* 3 Depreciation */}
              <View style={[styles.tableRow]}>
                <Text
                  style={[
                    stylesCOP.serialNoCellDetail,
                    styleExpenses.sno,
                    styleExpenses.bordernone,
                  ]}
                >
                  3
                </Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  Depreciation
                </Text>

                {labels.map((_, localIdx) => (
                  <Text
                    key={`dep-${localIdx}`}
                    style={[stylesCOP.particularsCellsDetail, styleExpenses.fontSmall]}
                  >
                    {formatNumber(depreciation?.[globalIndex(localIdx)] || 0)}
                  </Text>
                ))}
              </View>

              {/* Render Indirect Expenses (type = "indirect") */}
              {OnlyIndirectExpenses.map((expense, iIdx) => (
                <View
                  key={expense.key || expense.name || iIdx}
                  style={[styles.tableRow, styles.totalRow]}
                >
                  <Text style={stylesCOP.serialNoCellDetail}>4</Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                    ]}
                  >
                    {expense.name}
                  </Text>

                  {labels.map((_, localIdx) => (
                    <Text
                      key={`indir-${iIdx}-${localIdx}`}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                      ]}
                    >
                      {formatNumber(
                        Array.isArray(expense.values)
                          ? Number(expense.values[globalIndex(localIdx)]) || 0
                          : Number(expense.value) || 0
                      )}
                    </Text>
                  ))}
                </View>
              ))}

              {/* Preliminary Expenses */}
              {!isPreliminaryWriteOffAllZero && (
                <View style={[styles.tableRow, styles.totalRow]}>
                  <Text style={stylesCOP.serialNoCellDetail}>4</Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                    ]}
                  >
                    Preliminary Expenses
                  </Text>

                  {labels.map((_, localIdx) => (
                    <Text
                      key={`prel-${localIdx}`}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                      ]}
                    >
                      {formatNumber(
                        preliminaryWriteOffPerYear?.[globalIndex(localIdx)] || 0
                      )}
                    </Text>
                  ))}
                </View>
              )}

              {/* Indirect Expenses Total */}
              <View style={[styles.tableRow, styles.totalRow, styles.Total]}>
                <Text
                  style={[
                    stylesCOP.serialNoCellDetail,
                    styleExpenses.sno,
                    styleExpenses.bordernone,
                  ]}
                />
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  Total
                </Text>
                {labels.map((_, localIdx) => (
                  <Text
                    key={`tindir-${localIdx}`}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      stylesCOP.boldText,
                      styleExpenses.fontSmall,
                      styles.Total,
                      { borderLeftWidth: "0px" },
                    ]}
                  >
                    {formatNumber(totalIndirectExpenses?.[globalIndex(localIdx)] || 0)}
                  </Text>
                ))}
              </View>

              {/* Blank Row */}
              <View
                style={[
                  stylesMOF.row,
                  styles.tableRow,
                  styles.Total,
                  { border: 0 },
                ]}
              >
                <Text
                  style={[
                    stylesCOP.serialNoCellDetail,
                    styleExpenses.sno,
                    styleExpenses.bordernone,
                    styles.Total,
                  ]}
                />
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                    styles.Total,
                  ]}
                />
                {labels.map((label, localIdx) => (
                  <Text
                    key={label || localIdx}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                      { paddingVertical: "5px" },
                    ]}
                  />
                ))}
              </View>

              {/* Net Profit Before Tax */}
              <View style={[styles.tableRow, styles.totalRow, styles.Total]}>
                <Text
                  style={[
                    stylesCOP.serialNoCellDetail,
                    { fontWeight: "bold" },
                  ]}
                >
                  F
                </Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  Net Profit Before Tax
                </Text>

                {labels.map((_, localIdx) => (
                  <Text
                    key={`npbt-${localIdx}`}
                    style={[stylesCOP.particularsCellsDetail, styleExpenses.fontSmall]}
                  >
                    {formatNumber(NPBT?.[globalIndex(localIdx)] || 0)}
                  </Text>
                ))}
              </View>

              {/* Income Tax @ % */}
              <View style={[styles.tableRow, styles.totalRow]}>
                <Text
                  style={[
                    stylesCOP.serialNoCellDetail,
                    { fontWeight: "bold" },
                  ]}
                >
                  Less
                </Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  Income Tax @ {formData.ProjectReportSetting.incomeTax} %
                </Text>

                {labels.map((_, localIdx) => (
                  <Text
                    key={`tax-${localIdx}`}
                    style={[stylesCOP.particularsCellsDetail, styleExpenses.fontSmall]}
                  >
                    {formatNumber(incomeTaxCalculation?.[globalIndex(localIdx)] || 0)}
                  </Text>
                ))}
              </View>

              {/* Net Profit After Tax */}
              <View style={[styles.tableRow, styles.totalRow, styles.Total]}>
                <Text style={[stylesCOP.serialNoCellDetail]}>{/* G */}G</Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                    { fontWeight: "bold" },
                  ]}
                >
                  Net Profit After Tax
                </Text>

                {labels.map((_, localIdx) => (
                  <Text
                    key={`npat-${localIdx}`}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      stylesCOP.boldText,
                      styleExpenses.fontSmall,
                      styles.Total,
                      { borderLeftWidth: "0px" },
                    ]}
                  >
                    {formatNumber(NPAT?.[globalIndex(localIdx)] || 0)}
                  </Text>
                ))}
              </View>

              {/* Withdrawals during the year */}
              <View style={[styles.tableRow, styles.totalRow]}>
                <Text
                  style={[
                    stylesCOP.serialNoCellDetail,
                    styleExpenses.sno,
                    styleExpenses.bordernone,
                  ]}
                />
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  Withdrawals during the year
                </Text>
                {labels.map((_, localIdx) => (
                  <Text
                    key={`with-${localIdx}`}
                    style={[stylesCOP.particularsCellsDetail, styleExpenses.fontSmall]}
                  >
                    {formatNumber(Withdrawals?.[globalIndex(localIdx)] || 0)}
                  </Text>
                ))}
              </View>

              {/* Balance Trf. To Balance Sheet */}
              <View style={[styles.tableRow, styles.totalRow]}>
                <Text
                  style={[
                    stylesCOP.serialNoCellDetail,
                    styleExpenses.sno,
                    styleExpenses.bordernone,
                  ]}
                />
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  Balance Trf. To Balance Sheet
                </Text>

                {labels.map((_, localIdx) => (
                  <Text
                    key={`baltrf-${localIdx}`}
                    style={[stylesCOP.particularsCellsDetail, styleExpenses.fontSmall]}
                  >
                    {formatNumber(balanceTransferred?.[globalIndex(localIdx)] || 0)}
                  </Text>
                ))}
              </View>

              {/* Cumulative Balance Trf. To Balance Sheet */}
              <View style={[styles.tableRow, styles.totalRow]}>
                <Text
                  style={[
                    stylesCOP.serialNoCellDetail,
                    styleExpenses.sno,
                    styleExpenses.bordernone,
                  ]}
                />
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  Cumulative Balance Trf. To Balance Sheet
                </Text>

                {labels.map((_, localIdx) => (
                  <Text
                    key={`cumbal-${localIdx}`}
                    style={[stylesCOP.particularsCellsDetail, styleExpenses.fontSmall]}
                  >
                    {formatNumber(
                      cumulativeBalanceTransferred?.[globalIndex(localIdx)] || 0
                    )}
                  </Text>
                ))}
              </View>

              {/* Blank Row */}
              <View
                style={[
                  stylesMOF.row,
                  styles.tableRow,
                  styles.Total,
                  { border: 0 },
                ]}
              >
                <Text
                  style={[
                    stylesCOP.serialNoCellDetail,
                    styleExpenses.sno,
                    styleExpenses.bordernone,
                    styles.Total,
                  ]}
                />
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                    styles.Total,
                  ]}
                />
                {labels.map((label, localIdx) => (
                  <Text
                    key={label || localIdx}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                      { paddingVertical: "5px" },
                    ]}
                  />
                ))}
              </View>

              {/* ✅ Cash Profit (NPAT + Dep.) */}
              <View style={[styles.tableRow, styles.totalRow]}>
                <Text
                  style={[
                    stylesCOP.serialNoCellDetail,
                    styleExpenses.sno,
                    styleExpenses.bordernone,
                    { paddingVertical: "10px" },
                  ]}
                />
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  Cash Profit (NPAT + Dep.)
                </Text>

                {labels.map((_, localIdx) => (
                  <Text
                    key={`cash-${localIdx}`}
                    style={[stylesCOP.particularsCellsDetail, styleExpenses.fontSmall]}
                  >
                    {formatNumber(cashProfit?.[globalIndex(localIdx)] || 0)}
                  </Text>
                ))}
              </View>
            </View>
          </View>

          <View>
            {formData?.ProjectReportSetting?.CAName?.value ? (
              <Text
                style={[
                  {
                    fontSize: "8px",
                    paddingRight: "4px",
                    paddingLeft: "4px",
                    textAlign: "justify",
                  },
                ]}
              >
                Guidance and assistance have been provided for the preparation of
                these financial statements on the specific request of the promoter
                for the purpose of availing finance for the business. These
                financial statements are based on realistic market assumptions,
                proposed estimates issued by an approved valuer, details provided
                by the promoter, and rates prevailing in the market. Based on the
                examination of the evidence supporting the assumptions, nothing has
                come to attention that causes any belief that the assumptions do not
                provide a reasonable basis for the forecast. These financials do not
                vouch for the accuracy of the same, as actual results are likely to
                be different from the forecast since anticipated events might not
                occur as expected, and the variation might be material.
              </Text>
            ) : null}
          </View>

          <View
            style={[
              {
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 30,
              },
            ]}
          >
            <View
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                paddingTop: 100,
              }}
            >
              {/* ✅ CA Name (Conditional Display) */}
              {formData?.ProjectReportSetting?.CAName?.value ? (
                <Text
                  style={[styles.caName, { fontSize: "10px", fontWeight: "bold" }]}
                >
                  CA {formData?.ProjectReportSetting?.CAName?.value}
                </Text>
              ) : null}

              {/* ✅ Membership Number (Conditional Display) */}
              {formData?.ProjectReportSetting?.MembershipNumber?.value ? (
                <Text style={[styles.membershipNumber, { fontSize: "10px" }]}>
                  M. No.: {formData?.ProjectReportSetting?.MembershipNumber?.value}
                </Text>
              ) : null}

              {/* ✅ UDIN Number (Conditional Display) */}
              {formData?.ProjectReportSetting?.UDINNumber?.value ? (
                <Text style={[styles.udinNumber, { fontSize: "10px" }]}>
                  UDIN: {formData?.ProjectReportSetting?.UDINNumber?.value}
                </Text>
              ) : null}

              {/* ✅ Mobile Number (Conditional Display) */}
              {formData?.ProjectReportSetting?.MobileNumber?.value ? (
                <Text style={[styles.mobileNumber, { fontSize: "10px" }]}>
                  Mob. No.: {formData?.ProjectReportSetting?.MobileNumber?.value}
                </Text>
              ) : null}
            </View>

            {/* business name and Client Name */}
            <View
              style={[
                {
                  display: "flex",
                  flexDirection: "column",
                  gap: "30px",
                  alignItems: "flex-end",
                  justifyContent: "flex-end",
                  marginTop: "30px",
                },
              ]}
            >
              <Text style={[styles.businessName, { fontSize: "10px" }]}>
                {formData?.AccountInformation?.businessName || "Business Name"}
              </Text>
              <Text style={[styles.FinancialYear, { fontSize: "10px" }]}>
                {formData?.AccountInformation?.businessOwner || "businessOwner"}
              </Text>
            </View>
          </View>
        </View>
      </Page>
    );
  });
}



  return (
    <Page
      size="A4"
      orientation={orientation}
      style={styles.page}
    >
      {/* watermark  */}
      {pdfType &&
        pdfType !== "select option" &&
        (pdfType === "Sharda Associates" || pdfType === "CA Certified") && (
          <View
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 500,
              height: 700,
              marginLeft: -200,
              marginTop: -350,
              opacity: 0.4,
              zIndex: -1,
            }}
          >
            <Image
              src={pdfType === "Sharda Associates" ? SAWatermark : CAWatermark}
              style={{
                width: "100%",
                height: "100%",
              }}
            />
          </View>
        )}

      <View style={[styleExpenses.paddingx, { paddingBottom: "30px" }]}>
        {/* businees name and financial year  */}
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

        <View
          style={{
            display: "flex",
            alignContent: "flex-end",
            justifyContent: "flex-end",
            alignItems: "flex-end",
          }}
        >
          <Text style={[styles.AmountIn, styles.italicText]}>
            (Amount In{" "}
            {
              formData?.ProjectReportSetting?.AmountIn === "rupees"
                ? "Rs." // Show "Rupees" if "rupees" is selected
                : formData?.ProjectReportSetting?.AmountIn === "thousand"
                ? "Thousands" // Show "Thousands" if "thousand" is selected
                : formData?.ProjectReportSetting?.AmountIn === "lakhs"
                ? "Lakhs" // Show "Lakhs" if "lakhs" is selected
                : formData?.ProjectReportSetting?.AmountIn === "crores"
                ? "Crores" // Show "Crores" if "crores" is selected
                : formData?.ProjectReportSetting?.AmountIn === "millions"
                ? "Millions" // Show "Millions" if "millions" is selected
                : "" // Default case, in case the value is not found (you can add a fallback text here if needed)
            }
            )
          </Text>
        </View>

        <View>
          <View style={stylesCOP.heading}>
            <Text>Sensitivity Analysis</Text>
            <Text>
              Projected Profitability (Revenue Reduced by{" "}
              {revenueReducePercentage}%)
              {splitYearLabels.length > 1 ? ` (${toRoman(pageIdx)})` : ""}
            </Text>
          </View>
          <View style={[styles.table, { borderRightWidth: 0 }]}>
            <View style={styles.tableHeader}>
              <Text
                style={[
                  styles.serialNoCell,
                  styleExpenses.sno,
                  styleExpenses.fontBold,
                  { textAlign: "center" },
                ]}
              >
                S. No.
              </Text>
              <Text
                style={[
                  styles.detailsCell,
                  styleExpenses.particularWidth,
                  styleExpenses.fontBold,
                  { textAlign: "center" },
                ]}
              >
                Particulars
              </Text>

              {/* Generate Dynamic Year Headers using financialYearLabels */}
              {yearLabels.map((label, idx) => (
                <Text
                  key={label || idx} // <-- Add key here
                  style={[styles.particularsCell, stylesCOP.boldText]}
                >
                  {label}
                </Text>
              ))}
            </View>

            {/* Blank Row  */}
            <View
              style={[
                stylesMOF.row,
                styles.tableRow,
                styles.Total,
                {
                  border: 0,
                },
              ]}
            >
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  styleExpenses.sno,
                  styleExpenses.bordernone,
                  styles.Total,
                ]}
              ></Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                  styles.Total,
                  {},
                ]}
              ></Text>

              {yearLabels.map((label, idx) => (
                <Text
                  key={label || idx}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                    { paddingVertical: "5px" },
                  ]}
                ></Text>
              ))}
            </View>

            {/* ✅ Display Total Revenue Receipt Row */}
            <View style={[styles.tableRow, styles.totalRow, styles.Total]}>
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  styleExpenses.sno,
                  styleExpenses.bordernone,
                  styles.Total,
                ]}
              >
                A
              </Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                  styles.Total,
                  {},
                ]}
              >
                Total Revenue Receipt
              </Text>

              {/* ✅ Display revenue values based on projectionYears */}
              {/* {Array.from({ length: projectionYears }).map((_, yearIndex) =>
                !hideFirstYear || yearIndex !== 0 ? (
                  <Text
                    key={yearIndex}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      stylesCOP.boldText,
                      styleExpenses.fontSmall,
                      styles.Total,
                      { borderLeftWidth: "0px" },
                    ]}
                  >
                    {formatNumber(totalRevenueReceipts?.[yearIndex] || 0)}
                  </Text>
                ) : null
              )} */}
              {totalRevenueReceipt.map((val, idx) => (
                <Text
                  key={idx}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    stylesCOP.boldText,
                    styleExpenses.fontSmall,
                    styles.Total,
                    { borderLeftWidth: "0px" },
                  ]}
                >
                  {formatNumber(val)}
                </Text>
              ))}
            </View>

            {/* ✅ Display 10% of Total Revenue Receipt Row */}
            <View
              style={[
                stylesMOF.row,
                styles.tableRow,
                {
                  border: 0,
                },
              ]}
            >
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  styleExpenses.sno,
                  styleExpenses.bordernone,
                ]}
              ></Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                  {},
                ]}
              >
                Less: Revenue reduced by {revenueReducePercentage}%
              </Text>

              {/* ✅ Display revenue values based on projectionYears */}
              {/* {Array.from({ length: projectionYears }).map((_, yearIndex) =>
                !hideFirstYear || yearIndex !== 0 ? (
                  <Text
                    key={yearIndex}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      stylesCOP.boldText,
                      styleExpenses.fontSmall,
                      styles.Total,
                      { borderLeftWidth: "0px" },
                    ]}
                  >
                    {formatNumber(totalRevenueReceipts?.[yearIndex] || 0)}
                  </Text>
                ) : null
              )} */}
              {value10reduceRevenueReceipt.map((val, idx) => (
                <Text
                  key={idx}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                  ]}
                >
                  {formatNumber(val)}
                </Text>
              ))}
            </View>

            {/* new revenue reduced by 10% */}
            <View
              style={[
                stylesMOF.row,
                styles.tableRow,
                styles.Total,
                {
                  border: 0,
                },
              ]}
            >
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  styleExpenses.sno,
                  styleExpenses.bordernone,
                  styles.Total,
                ]}
              ></Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                  styles.Total,
                  {},
                ]}
              ></Text>

              {/* ✅ Display revenue values based on projectionYears */}
              {/* {Array.from({ length: projectionYears }).map((_, yearIndex) =>
                !hideFirstYear || yearIndex !== 0 ? (
                  <Text
                    key={yearIndex}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      stylesCOP.boldText,
                      styleExpenses.fontSmall,
                      styles.Total,
                      { borderLeftWidth: "0px" },
                    ]}
                  >
                    {formatNumber(totalRevenueReceipts?.[yearIndex] || 0)}
                  </Text>
                ) : null
              )} */}
              {newRevenueReceipt.map((val, idx) => (
                <Text
                  key={idx}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    stylesCOP.boldText,
                    styleExpenses.fontSmall,
                    styles.Total,
                    { borderLeftWidth: "0px" },
                  ]}
                >
                  {formatNumber(val)}
                </Text>
              ))}
            </View>

            {/* Closing Stock / Inventory */}
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  styleExpenses.sno,
                  styleExpenses.bordernone,
                  styles.Total,
                  { paddingVertical: "10px" },
                ]}
              >
                B
              </Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                ]}
              >
                Add: Closing Stock / Inventory
              </Text>

              {/* {Array.from({
                length:
                  parseInt(formData.ProjectReportSetting.ProjectionYears) || 0,
              }).map(
                (_, index) =>
                  (!hideFirstYear || index !== 0) && (
                    <Text
                      key={`ClosingStock-${index}`}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                        { paddingVertical: "10px" },
                      ]}
                    >
                      {formatNumber(
                        formData.MoreDetails.ClosingStock?.[index] ?? 0
                      )}
                    </Text>
                  )
              )} */}
              {ClosingStock.map((val, idx) => (
                <Text
                  key={idx}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                  ]}
                >
                  {formatNumber(val)}
                </Text>
              ))}
            </View>

            {/* Opening Stock / Inventory */}
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  styleExpenses.sno,
                  styleExpenses.bordernone,
                ]}
              ></Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                ]}
              >
                Less: Opening Stock / Inventory
              </Text>

              {/* {Array.from({
                length:
                  parseInt(formData.ProjectReportSetting.ProjectionYears) || 0,
              }).map(
                (_, index) =>
                  (!hideFirstYear || index !== 0) && (
                    <Text
                      key={`OpeningStock-${index}`}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                      ]}
                    >
                      {formatNumber(
                        formData.MoreDetails.OpeningStock?.[index] ?? 0
                      )}
                    </Text>
                  )
              )} */}
              {OpeningStock.map((val, idx) => (
                <Text
                  key={idx}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                  ]}
                >
                  {formatNumber(val)}
                </Text>
              ))}
            </View>

            {/* Computation of Total Revenue, Adding Closing Stock, and Subtracting Opening Stock */}
            <View
              style={[
                stylesMOF.row,
                styles.tableRow,
                styles.Total,
                { borderBottomWidth: "0px" },
              ]}
            >
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  styleExpenses.sno,
                  styleExpenses.bordernone,
                ]}
              ></Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                  {},
                ]}
              ></Text>

              {/* ✅ Display Computed Adjusted Revenue Values */}
              {/* {adjustedRevenueValues.map(
                (finalValue, yearIndex) =>
                  (!hideFirstYear || yearIndex !== 0) && (
                    <Text
                      key={`finalValue-${yearIndex}`}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        stylesCOP.boldText,
                        styleExpenses.fontSmall,
                        {
                          borderLeftWidth: "0px",
                        },
                      ]}
                    >
                      {formatNumber(finalValue)}
                    </Text>
                  )
              )} */}
              {adjustedRevenueValues.map((val, idx) => (
                <Text
                  key={idx}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    stylesCOP.boldText,
                    styleExpenses.fontSmall,
                    styles.Total,
                    { borderLeftWidth: "0px" },
                  ]}
                >
                  {formatNumber(val)}
                </Text>
              ))}
            </View>

            {/* direct expenses */}
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  styles.Total,
                  { paddingVertical: "10px" },
                ]}
              >
                C
              </Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                  styles.Total,
                  { paddingVertical: "10px" },
                ]}
              >
                Direct Expenses
              </Text>
              {yearLabels.map((label, idx) => {
                return (
                  <Text
                    key={idx}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                    ]}
                  ></Text>
                );
              })}
            </View>

            {/* b Salaries & Wages  */}
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text style={stylesCOP.serialNoCellDetail}>1</Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                ]}
              >
                Salaries & Wages
              </Text>

              {yearLabels.map((label, idx) => {
                return (
                  <Text
                    key={idx}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                    ]}
                  >
                    {formatNumber(salaryandwages[idx] || 0)}
                  </Text>
                );
              })}
            </View>
            {/* c raw material  */}
            {rawmaterial.some((val) => Number(val) !== 0) && (
              <View style={[styles.tableRow, styles.totalRow]}>
                <Text style={stylesCOP.serialNoCellDetail}>2</Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  Raw Material Expenses
                </Text>

                {yearLabels.map((label, idx) => {
                  return (
                    <Text
                      key={idx}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                      ]}
                    >
                      {formatNumber(rawmaterial[idx] || 0)}
                    </Text>
                  );
                })}
              </View>
            )}

            {/* map direct expenses type=direct  */}
            {/* Render Direct Expenses (type = "direct") */}
            {OnlyfilteredDirectExpenses.map((expense, idx) => (
              <View
                key={expense.key || expense.name || idx}
                style={[styles.tableRow, styles.totalRow]}
              >
                <Text style={stylesCOP.serialNoCellDetail}>
                  {directExpenseStartSerial + idx}
                  {/* This gives 'd', 'e', 'f', ... OR 'c', 'd', ... */}
                </Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  {expense.name}
                </Text>
                {/* Loop through yearLabels and display expense values for each year */}
                {yearLabels.map((label, yidx) => (
                  <Text
                    key={yidx}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                    ]}
                  >
                    {formatNumber(
                      Array.isArray(expense.values)
                        ? Number(expense.values[yidx]) || 0
                        : Number(expense.value) || 0
                    )}
                  </Text>
                ))}
              </View>
            ))}

            {/* Administrative Expenses */}
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text style={stylesCOP.serialNoCellDetail}>9</Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                ]}
              >
                Administrative Expenses
              </Text>

              {yearLabels.map((label, idx) => {
                return (
                  <Text
                    key={idx}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                    ]}
                  >
                    {formatNumber(adminValues[idx] || 0)}
                  </Text>
                );
              })}
            </View>

            {/* direct Expenses total  */}
            <View style={[styles.tableRow, styles.totalRow, styles.Total]}>
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  styleExpenses.sno,
                  styleExpenses.bordernone,
                ]}
              ></Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                  {},
                ]}
              >
                Total
              </Text>
              {/* ✅ Display Precomputed Total Direct Expenses */}
              {yearLabels.map((label, idx) => {
                return (
                  <Text
                    key={idx}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      stylesCOP.boldText,
                      styleExpenses.fontSmall,
                      styles.Total,
                      { borderLeftWidth: "0px" },
                    ]}
                  >
                    {formatNumber(totalDirectExpenses[idx] || 0)}
                  </Text>
                );
              })}
            </View>

            {/* Blank Row  */}
            <View
              style={[
                stylesMOF.row,
                styles.tableRow,
                styles.Total,
                {
                  border: 0,
                },
              ]}
            >
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  styleExpenses.sno,
                  styleExpenses.bordernone,
                  styles.Total,
                ]}
              ></Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                  styles.Total,
                  {},
                ]}
              ></Text>

              {yearLabels.map((label, idx) => (
                <Text
                  key={label || idx}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                    { paddingVertical: "5px" },
                  ]}
                ></Text>
              ))}
            </View>

            {/* Gross Profit Calculation */}
            <View style={[stylesMOF.row, styles.tableRow, styles.Total]}>
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  styleExpenses.sno,
                  styleExpenses.bordernone,
                  {},
                ]}
              >
                D
              </Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                  {},
                ]}
              >
                Gross Profit
              </Text>

              {/* ✅ Display Precomputed Gross Profit Values */}
              {grossProfit.map((val, idx) => (
                <Text
                  key={idx}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    stylesCOP.boldText,
                    styleExpenses.fontSmall,
                    styles.Total,
                    { borderLeftWidth: "0px" },
                  ]}
                >
                  {formatNumber(val)}
                </Text>
              ))}
            </View>

            {/* indirect expense */}
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  styles.Total,
                  { paddingVertical: "10px" },
                ]}
              >
                E
              </Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                  styles.Total,
                  { paddingVertical: "10px" },
                ]}
              >
                Less: Indirect Expenses
              </Text>
              {yearLabels.map((label, idx) => {
                return (
                  <Text
                    key={idx}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                    ]}
                  ></Text>
                );
              })}
            </View>

            {/* Interest on Term Loan */}
            <View style={[styles.tableRow]}>
              <Text style={stylesCOP.serialNoCellDetail}>1</Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                ]}
              >
                Interest on Term Loan
              </Text>

              {/* ✅ Display Precomputed Gross Profit Values */}
              {interestOnTermLoan
                .slice(0, formData?.ProjectReportSetting?.ProjectionYears || 0)
                .map((val, idx) => (
                  <Text
                    key={idx}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                    ]}
                  >
                    {formatNumber(val)}
                  </Text>
                ))}
            </View>

            {/* Interest on working capital */}
            <View style={[styles.tableRow]}>
              <Text style={stylesCOP.serialNoCellDetail}>2</Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                ]}
              >
                Interest on Working Capital
              </Text>

              {/* ✅ Display Precomputed Gross Profit Values */}
              {interestOnWCArray.map((val, idx) => (
                <Text
                  key={idx}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                  ]}
                >
                  {formatNumber(val)}
                </Text>
              ))}
            </View>

            {/* depreciation */}
            <View style={[styles.tableRow]}>
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  styleExpenses.sno,
                  styleExpenses.bordernone,
                  {},
                ]}
              >
                3
              </Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                  {},
                ]}
              >
                Depreciation
              </Text>

              {/* ✅ Display Precomputed Gross Profit Values */}
              {depreciation.map((val, idx) => (
                <Text
                  key={idx}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                  ]}
                >
                  {formatNumber(val)}
                </Text>
              ))}
            </View>

            {/* Render inDirect Expenses (type = "indirect") */}
            {OnlyIndirectExpenses.map((expense, idx) => (
              <View
                key={expense.key || expense.name || idx}
                style={[styles.tableRow, styles.totalRow]}
              >
                <Text style={stylesCOP.serialNoCellDetail}>
                  {/* This gives 'd', 'e', 'f', ... OR 'c', 'd', ... */}4
                </Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  {expense.name}
                </Text>
                {/* Loop through yearLabels and display expense values for each year */}
                {yearLabels.map((label, yidx) => (
                  <Text
                    key={yidx}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                    ]}
                  >
                    {formatNumber(
                      Array.isArray(expense.values)
                        ? Number(expense.values[yidx]) || 0
                        : Number(expense.value) || 0
                    )}
                  </Text>
                ))}
              </View>
            ))}

            {/* preliminary expense */}
            {!isPreliminaryWriteOffAllZero && (
              <View style={[styles.tableRow, styles.totalRow]}>
                <Text style={stylesCOP.serialNoCellDetail}>4</Text>

                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  Preliminary Expenses
                </Text>

                {preliminaryWriteOffPerYear.map((value, yearIndex) => (
                  <Text
                    key={yearIndex}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                    ]}
                  >
                    {formatNumber(value)}
                  </Text>
                ))}
              </View>
            )}

            {/* indirect Expenses total  */}
            <View style={[styles.tableRow, styles.totalRow, styles.Total]}>
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  styleExpenses.sno,
                  styleExpenses.bordernone,
                ]}
              ></Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                  {},
                ]}
              >
                Total
              </Text>
              {/* ✅ Display Precomputed Total Direct Expenses */}
              {yearLabels.map((label, idx) => {
                return (
                  <Text
                    key={idx}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      stylesCOP.boldText,
                      styleExpenses.fontSmall,
                      styles.Total,
                      { borderLeftWidth: "0px" },
                    ]}
                  >
                    {formatNumber(totalIndirectExpenses[idx] || 0)}
                  </Text>
                );
              })}
            </View>

            {/* blank row */}
            <View
              style={[
                stylesMOF.row,
                styles.tableRow,
                styles.Total,
                {
                  border: 0,
                },
              ]}
            >
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  styleExpenses.sno,
                  styleExpenses.bordernone,
                  styles.Total,
                ]}
              ></Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                  styles.Total,
                  {},
                ]}
              ></Text>

              {yearLabels.map((label, idx) => (
                <Text
                  key={label || idx}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                    { paddingVertical: "5px" },
                  ]}
                ></Text>
              ))}
            </View>

            {/* Net Profit Before Tax Calculation */}
            <View style={[styles.tableRow, styles.totalRow, styles.Total]}>
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  {
                    // ✅ Ensure using the registered font
                    fontWeight: "bold", // ✅ Apply bold
                  },
                ]}
              >
                F
              </Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                  // { },
                ]}
              >
                Net Profit Before Tax
              </Text>

              {NPBT.map((val, idx) => (
                <Text
                  key={idx}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                  ]}
                >
                  {formatNumber(val)}
                </Text>
              ))}
            </View>

            {/* Income Tax @  % */}
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  {
                    // ✅ Ensure using the registered font
                    fontWeight: "bold", // ✅ Apply bold
                  },
                ]}
              >
                Less
              </Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                  // { },
                ]}
              >
                Income Tax @ {formData.ProjectReportSetting.incomeTax} %
              </Text>

              {/* ✅ Display Precomputed Income Tax Values */}
              {incomeTaxCalculation.map((val, idx) => (
                <Text
                  key={idx}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                  ]}
                >
                  {formatNumber(val)}
                </Text>
              ))}
            </View>

            {/* Net Profit After Tax Calculation  */}
            <View style={[styles.tableRow, styles.totalRow, styles.Total]}>
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  {
                    // ✅ Ensure using the registered font
                    // ✅ Apply bold
                  },
                ]}
              >
                G
              </Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                  {
                    // ✅ Ensure using the registered font
                    fontWeight: "bold", // ✅ Apply bold
                  },
                ]}
              >
                Net Profit After Tax
              </Text>
              {/*  Display Precomputed Net Profit After Tax (NPAT) Values */}
              {NPAT.map((val, idx) => (
                <Text
                  key={idx}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    stylesCOP.boldText,
                    styleExpenses.fontSmall,
                    styles.Total,
                    { borderLeftWidth: "0px" },
                  ]}
                >
                  {formatNumber(val)}
                </Text>
              ))}
            </View>

            {/* Withdrawals during the year  */}

            {/* {Array.from({
              length: hideFirstYear ? projectionYears - 1 : projectionYears,
            }).every((_, index) => {
              const adjustedIndex = hideFirstYear ? index + 1 : index;
              return !Number(
                formData.MoreDetails?.Withdrawals?.[adjustedIndex]
              );
            }) ? null : (
              <View style={styles.tableRow}>
                <Text
                  style={[
                    stylesCOP.serialNoCellDetail,
                    styleExpenses.sno,
                    styleExpenses.bordernone,
                  ]}
                ></Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  Withdrawals during the year
                </Text>

                {Array.from({
                  length: hideFirstYear ? projectionYears - 1 : projectionYears,
                }).map((_, index) => {
                  const adjustedIndex = hideFirstYear ? index + 1 : index;
                  const value =
                    formData.MoreDetails?.Withdrawals?.[adjustedIndex];
                  return (
                    <Text
                      key={index}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                      ]}
                    >
                      {formatNumber(value || "-")}
                    </Text>
                  );
                })}
              </View>
            )} */}
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  styleExpenses.sno,
                  styleExpenses.bordernone,
                ]}
              ></Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                ]}
              >
                Withdrawals during the year
              </Text>
              {Withdrawals.map((val, idx) => (
                <Text
                  key={idx}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                  ]}
                >
                  {formatNumber(val)}
                </Text>
              ))}
            </View>

            {/* Balance Trf. To Balance Sheet */}
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  styleExpenses.sno,
                  styleExpenses.bordernone,
                ]}
              ></Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                ]}
              >
                Balance Trf. To Balance Sheet
              </Text>

              {/* Display Precomputed Balance Transferred Values with Rounding */}
              {balanceTransferred.map((val, idx) => (
                <Text
                  key={idx}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                  ]}
                >
                  {formatNumber(val)}
                </Text>
              ))}
            </View>
            {/* Cumulative Balance Trf. To Balance Sheet */}
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  styleExpenses.sno,
                  styleExpenses.bordernone,
                ]}
              ></Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                ]}
              >
                Cumulative Balance Trf. To Balance Sheet
              </Text>

              {cumulativeBalanceTransferred.map((val, idx) => (
                <Text
                  key={idx}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                  ]}
                >
                  {formatNumber(val)}
                </Text>
              ))}
            </View>

            {/* blank row */}
            <View
              style={[
                stylesMOF.row,
                styles.tableRow,
                styles.Total,
                {
                  border: 0,
                },
              ]}
            >
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  styleExpenses.sno,
                  styleExpenses.bordernone,
                  styles.Total,
                ]}
              ></Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                  styles.Total,
                  {},
                ]}
              ></Text>

              {yearLabels.map((label, idx) => (
                <Text
                  key={label || idx}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                    { paddingVertical: "5px" },
                  ]}
                ></Text>
              ))}
            </View>

            {/* ✅ Cash Profit (NPAT + Dep.) */}
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  styleExpenses.sno,
                  styleExpenses.bordernone,
                  {
                    paddingVertical: "10px",
                  },
                ]}
              ></Text>

              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                ]}
              >
                Cash Profit (NPAT + Dep.)
              </Text>

              {cashProfit.map((val, idx) => (
                <Text
                  key={idx}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                  ]}
                >
                  {formatNumber(val)}
                </Text>
              ))}
            </View>
          </View>
        </View>

        <View>
          {formData?.ProjectReportSetting?.CAName?.value ? (
            <Text
              style={[
                {
                  fontSize: "8px",
                  paddingRight: "4px",
                  paddingLeft: "4px",
                  textAlign: "justify",
                },
              ]}
            >
              Guidance and assistance have been provided for the preparation of
              these financial statements on the specific request of the promoter
              for the purpose of availing finance for the business. These
              financial statements are based on realistic market assumptions,
              proposed estimates issued by an approved valuer, details provided
              by the promoter, and rates prevailing in the market. Based on the
              examination of the evidence supporting the assumptions, nothing
              has come to attention that causes any belief that the assumptions
              do not provide a reasonable basis for the forecast. These
              financials do not vouch for the accuracy of the same, as actual
              results are likely to be different from the forecast since
              anticipated events might not occur as expected, and the variation
              might be material.
            </Text>
          ) : null}
        </View>

        <View
          style={[
            {
              display: "flex",
              flexDirection: "row", // ✅ Change to row
              justifyContent: "space-between", // ✅ Align items left and right
              alignItems: "center",
              marginTop: 30,
            },
          ]}
        >
          <View
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              paddingTop: 100,
            }}
          >
            {/* ✅ CA Name (Conditional Display) */}
            {formData?.ProjectReportSetting?.CAName?.value ? (
              <Text
                style={[
                  styles.caName,
                  { fontSize: "10px", fontWeight: "bold" },
                ]}
              >
                CA {formData?.ProjectReportSetting?.CAName?.value}
              </Text>
            ) : null}

            {/* ✅ Membership Number (Conditional Display) */}
            {formData?.ProjectReportSetting?.MembershipNumber?.value ? (
              <Text style={[styles.membershipNumber, { fontSize: "10px" }]}>
                M. No.:{" "}
                {formData?.ProjectReportSetting?.MembershipNumber?.value}
              </Text>
            ) : null}

            {/* ✅ UDIN Number (Conditional Display) */}
            {formData?.ProjectReportSetting?.UDINNumber?.value ? (
              <Text style={[styles.udinNumber, { fontSize: "10px" }]}>
                UDIN: {formData?.ProjectReportSetting?.UDINNumber?.value}
              </Text>
            ) : null}

            {/* ✅ Mobile Number (Conditional Display) */}
            {formData?.ProjectReportSetting?.MobileNumber?.value ? (
              <Text style={[styles.mobileNumber, { fontSize: "10px" }]}>
                Mob. No.: {formData?.ProjectReportSetting?.MobileNumber?.value}
              </Text>
            ) : null}
          </View>

          {/* businees name and Client Name  */}
          <View
            style={[
              {
                display: "flex",
                flexDirection: "column",
                gap: "30px",
                alignItems: "flex-end",
                justifyContent: "flex-end",
                marginTop: "30px",
              },
            ]}
          >
            <Text style={[styles.businessName, { fontSize: "10px" }]}>
              {formData?.AccountInformation?.businessName || "Business Name"}
            </Text>
            <Text style={[styles.FinancialYear, { fontSize: "10px" }]}>
              {formData?.AccountInformation?.businessOwner || "businessOwner"}
            </Text>
          </View>
        </View>
      </View>
    </Page>
  );
};

export default React.memo(CMAProjectedProfitability);
