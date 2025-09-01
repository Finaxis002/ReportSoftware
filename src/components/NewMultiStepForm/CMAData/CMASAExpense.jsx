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

const CMASAExpense = ({
  formData,
  directExpense,
  formatNumber,
  receivedtotalRevenueReceipts,
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

  //////////////////////////////   new data
  const FinPosextractors = CMAExtractorFinPos(formData);
  const FundFlowExtractor = CMAExtractorFundFlow(formData);
  const totalRevenueReceipt = FinPosextractors.totalRevenueReceipt() || [];
  const value10reduceRevenueReceipt =
    PPExtractor.value10reduceRevenueReceipt() || [];
  const newRevenueReceipt = PPExtractor.newRevenueReceipt() || [];
  const ClosingStock = PPExtractor.ClosingStock() || [];
  const OpeningStock = PPExtractor.OpeningStock() || [];
  const OriginalRevenueValues = PPExtractor.OriginalRevenueValues() || [];
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

  const totalDirectExpenses = Array.from({ length: projectionYears }).map(
    (_, idx) => {
      let totalSalary = Number(salaryandwages[idx] || 0);
      let totalMaterial = Number(rawmaterial[idx] || 0);

      // Sum values from OnlyfilteredDirectExpenses
      let totalDirectExpense = OnlyfilteredDirectExpenses.reduce(
        (sum, expense) => {
          const expenseValue = expense.values[idx] || 0; // Access the value for the specific year
          return sum + Number(expenseValue); // Add to the running total
        },
        0
      );

      // Return the total of salary, material, and direct expenses for the year
      return totalSalary + totalMaterial + totalDirectExpense;
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

  //expense increased by 10 %- new data
  const totalExpenseWithoutRM = Array.from({ length: projectionYears }).map(
    (_, i) => Number(totalDirectExpenses[i] || 0) - Number(rawmaterial[i] || 0)
  );

  const expenseIncreasePercentage = localStorage.getItem(
    "expenseIncreasePercentage"
  )
    ? parseFloat(localStorage.getItem("expenseIncreasePercentage"))
    : 10;
  console.log("expenseIncreasePercentage", expenseIncreasePercentage);
  //expense increase by 10%
  const increaseValueExpense = Array.from({ length: projectionYears }).map(
    (_, i) =>
      Number(totalExpenseWithoutRM[i] * (expenseIncreasePercentage / 100))
  );

  const increasedExpenseTotal = Array.from({ length: projectionYears }).map(
    (_, i) =>
      Number(totalDirectExpenses[i] || 0) + Number(increaseValueExpense[i] || 0)
  );
  const grossProfit = Array.from({ length: projectionYears }).map(
    (_, i) =>
      Number(OriginalRevenueValues[i]) - Number(increasedExpenseTotal[i])
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

  const total = Array.from({ length: projectionYears }).map(
    (_, i) => Number(NPBT[i] || 0) + Number(depreciation[i] || 0)
  );

  const isAdvancedLandscape = orientation === "advanced-landscape";
  let splitYearLabels = [yearLabels];
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
      <Page
        size="A4"
        orientation="landscape"
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
                style={{ width: "100%", height: "100%" }}
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
                  ? "Rs."
                  : formData?.ProjectReportSetting?.AmountIn === "thousand"
                  ? "Thousands"
                  : formData?.ProjectReportSetting?.AmountIn === "lakhs"
                  ? "Lakhs"
                  : formData?.ProjectReportSetting?.AmountIn === "crores"
                  ? "Crores"
                  : formData?.ProjectReportSetting?.AmountIn === "millions"
                  ? "Millions"
                  : ""
              }
              )
            </Text>
          </View>

          <View>
            <View style={stylesCOP.heading}>
              <Text>Sensitivity Analysis</Text>
              <Text>
                Income Tax Calculation (Expenses Increase by{" "}
                {expenseIncreasePercentage}%)
                {splitYearLabels.length > 1 ? ` (${toRoman(pageIdx)})` : ""}
              </Text>
            </View>

            <View style={[styles.table, { borderRightWidth: 0 }]}>
              {/* table header */}
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

                {/* Use page-local labels */}
                {labels.map((label, idx) => (
                  <Text
                    key={`${pageIdx}-hdr-${idx}`}
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
                {labels.map((_, localIdx) => (
                  <Text
                    key={`${pageIdx}-blank-${localIdx}`}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                      { paddingVertical: "5px" },
                    ]}
                  />
                ))}
              </View>

              {/* Net Profit Before Tax */}
              <View style={[styles.tableRow, styles.totalRow]}>
                <Text style={[stylesCOP.serialNoCellDetail]} />
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  Net Profit Before Tax
                </Text>

                {labels.map((_, localIdx) => {
                  const gIdx = globalIndex(localIdx);
                  return (
                    <Text
                      key={`${pageIdx}-npbt-${localIdx}`}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                      ]}
                    >
                      {formatNumber(NPBT?.[gIdx] || 0)}
                    </Text>
                  );
                })}
              </View>

              {/* Depreciation */}
              <View style={[stylesMOF.row, styles.tableRow]}>
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
                  Depreciation
                </Text>

                {labels.map((_, localIdx) => {
                  const gIdx = globalIndex(localIdx);
                  return (
                    <Text
                      key={`${pageIdx}-dep-${localIdx}`}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                      ]}
                    >
                      {formatNumber(depreciation?.[gIdx] || 0)}
                    </Text>
                  );
                })}
              </View>

              {/* Total */}
              <View style={[styles.tableRow, styles.totalRow, styles.Total]}>
                <Text
                  style={[stylesCOP.serialNoCellDetail, { fontWeight: "bold" }]}
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

                {labels.map((_, localIdx) => {
                  const gIdx = globalIndex(localIdx);
                  return (
                    <Text
                      key={`${pageIdx}-total-${localIdx}`}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                      ]}
                    >
                      {formatNumber(total?.[gIdx] || 0)}
                    </Text>
                  );
                })}
              </View>

              {/* Less: Depreciation (As per ITA, 1961) */}
              <View style={[stylesMOF.row, styles.tableRow]}>
                <Text
                  style={[
                    stylesCOP.serialNoCellDetail,
                    styleExpenses.sno,
                    styleExpenses.bordernone,
                  ]}
                >
                  Less:
                </Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  Depreciation (As per ITA, 1961)
                </Text>

                {labels.map((_, localIdx) => {
                  const gIdx = globalIndex(localIdx);
                  return (
                    <Text
                      key={`${pageIdx}-depITA-${localIdx}`}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                      ]}
                    >
                      {formatNumber(depreciation?.[gIdx] || 0)}
                    </Text>
                  );
                })}
              </View>

              {/* Net Profit / (Loss) */}
              <View style={[styles.tableRow, styles.totalRow]}>
                <Text style={[stylesCOP.serialNoCellDetail]} />
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  Net Profit / (Loss)
                </Text>

                {labels.map((_, localIdx) => {
                  const gIdx = globalIndex(localIdx);
                  return (
                    <Text
                      key={`${pageIdx}-np-l-${localIdx}`}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                      ]}
                    >
                      {formatNumber(NPBT?.[gIdx] || 0)}
                    </Text>
                  );
                })}
              </View>

              {/* Taxable Profit */}
              <View style={[styles.tableRow, styles.totalRow]}>
                <Text
                  style={[stylesCOP.serialNoCellDetail, { fontWeight: "bold" }]}
                />
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  Taxable Profit
                </Text>

                {labels.map((_, localIdx) => {
                  const gIdx = globalIndex(localIdx);
                  return (
                    <Text
                      key={`${pageIdx}-taxable-${localIdx}`}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                      ]}
                    >
                      {formatNumber(NPBT?.[gIdx] || 0)}
                    </Text>
                  );
                })}
              </View>

              {/* Income Tax @ % */}
              <View style={[styles.tableRow, styles.totalRow]}>
                <Text
                  style={[stylesCOP.serialNoCellDetail, { fontWeight: "bold" }]}
                />
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  Tax @ {formData.ProjectReportSetting.incomeTax} %
                </Text>

                {labels.map((_, localIdx) => {
                  const gIdx = globalIndex(localIdx);
                  return (
                    <Text
                      key={`${pageIdx}-tax-${localIdx}`}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                      ]}
                    >
                      {formatNumber(incomeTaxCalculation?.[gIdx] || 0)}
                    </Text>
                  );
                })}
              </View>
            </View>
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

            {/* business name and Client Name  */}
            <View
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "30px",
                alignItems: "flex-end",
                justifyContent: "flex-end",
                marginTop: "30px",
              }}
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
              Income Tax Calculation (Expenses Increase by{" "}
              {expenseIncreasePercentage}%)
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

            {/* Net Profit Before Tax Calculation */}
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text style={[stylesCOP.serialNoCellDetail]}></Text>
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

            {/* depreciation */}
            <View style={[stylesMOF.row, styles.tableRow]}>
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  styleExpenses.sno,
                  styleExpenses.bordernone,
                  {},
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

            {/* total */}
            <View style={[styles.tableRow, styles.totalRow, styles.Total]}>
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  {
                    // ✅ Ensure using the registered font
                    fontWeight: "bold", // ✅ Apply bold
                  },
                ]}
              ></Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                  // { },
                ]}
              >
                Total
              </Text>

              {total.map((val, idx) => (
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
            <View style={[stylesMOF.row, styles.tableRow]}>
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  styleExpenses.sno,
                  styleExpenses.bordernone,
                  {},
                ]}
              >
                Less:
              </Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                  {},
                ]}
              >
                Depreciation (As per ITA, 1961)
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

            {/* Net Profit / (Loss) */}
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text style={[stylesCOP.serialNoCellDetail]}></Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                  // { },
                ]}
              >
                Net Profit / (Loss)
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

            {/* Taxable Profit */}
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  {
                    // ✅ Ensure using the registered font
                    fontWeight: "bold", // ✅ Apply bold
                  },
                ]}
              ></Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                  // { },
                ]}
              >
                Taxable Profit
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
              ></Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                  // { },
                ]}
              >
                Tax @ {formData.ProjectReportSetting.incomeTax} %
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
          </View>
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

export default React.memo(CMASAExpense);
