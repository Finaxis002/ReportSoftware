import React, { useMemo, useEffect } from "react";
import { Page, View, Text, Image } from "@react-pdf/renderer";
import { styles, stylesCOP, stylesMOF, styleExpenses } from "./Styles";
import { Font } from "@react-pdf/renderer";
import SAWatermark from "../Assets/SAWatermark";
import CAWatermark from "../Assets/CAWatermark";
import PageWithFooter from "../Helpers/PageWithFooter";

// ✅ Register a Font That Supports Bold
Font.register({
  family: "Roboto",
  fonts: [
    {
      src: require("../Assets/Fonts/times-new-roman.ttf"),
      fontWeight: "normal",
    },
    {
      src: require("../Assets/Fonts/times-new-roman-bold.ttf"),
      fontWeight: "bold",
    },
  ],
});

const DebtServiceCoverageRatio = ({
  formData,
  yearlyInterestLiabilities,
  totalDepreciationPerYear,
  yearlyPrincipalRepayment, // ✅ Receiving total principal repayment
  netProfitAfterTax,
  financialYearLabels,
  DSCRSend,
  formatNumber,
  pdfType,
  receivedtotalRevenueReceipts,
  orientation,
}) => {
  // console.log("Yearly Principal Repayment:", yearlyPrincipalRepayment); // ✅ Debugging check

  const years = formData?.ProjectReportSetting?.ProjectionYears || 5; // Default to 5 years if not provided
  const projectionYears =
    parseInt(formData?.ProjectReportSetting?.ProjectionYears) || 0;


    const debtEquityOption = formData?.ProjectReportSetting?.DebtEquityOption || formData?.ProjectReportSetting?.debtEquityOption ;

const interestRate = formData?.ProjectReportSetting?.interestOnTL;

  const renderIOTLLabel = () => {
    if (debtEquityOption === "Equity") {
      return `Dividend Payout @${interestRate}%`; // Format for equity case
    } else {
      return "Interest On Term Loan"; // Default case
    }
  };

  const renderIOWCLabel = () => {
    if (debtEquityOption === "Equity"){
      return "Return On Operational Equity";
    }
    else{
      return "Interest On Working Capital"
    }
  }

  // ✅ Months Array for Indexing
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

  // ✅ Calculate Interest on Working Capital for each projection year
  const interestOnWorkingCapital = Array.from({
    length: parseInt(formData.ProjectReportSetting.ProjectionYears) || 0,
  }).map(() => {
    const workingCapitalLoan =
      Number(formData.MeansOfFinance.workingCapital.termLoan) || 0;
    const interestRate =
      Number(formData.ProjectReportSetting.interestOnTL) || 0;

    // ✅ Annual Interest Calculation
    return (workingCapitalLoan * interestRate) / 100;
  });

  const hideFirstYear = receivedtotalRevenueReceipts?.[0] <= 0;

  const calculateInterestOnWorkingCapital = useMemo(() => {
    // console.log("moratorium month", moratoriumPeriodMonths);

    const principal =
      Number(formData.MeansOfFinance?.workingCapital?.termLoan) || 0;
    const rate = Number(formData.ProjectReportSetting?.interestOnWC) || 0;
    const annualInterestAmount = (principal * rate) / 100;

    // console.log("principal:", principal);
    // console.log("rate:", rate);
    // console.log("annualInterestAmount:", annualInterestAmount);

    const firstRepaymentYearIndex = monthsPerYear.findIndex(
      (months) => months > 0
    );
    // console.log("Months per year:", monthsPerYear);
    // console.log("First repayment year index:", firstRepaymentYearIndex);

    return (yearIndex) => {
      const monthsInYear = monthsPerYear[yearIndex] || 0;
      // console.log(`Year ${yearIndex + 1} months: ${monthsInYear}`);
      if (monthsInYear === 0) {
        // Entire year in moratorium, no interest
        return 0;
      }

      // if (yearIndex === firstRepaymentYearIndex && moratoriumPeriodMonths > 0) {
      //   // Prorated interest for first repayment year
      //   return (annualInterestAmount * monthsInYear) / 12;
      // }
      if (
        yearIndex === firstRepaymentYearIndex &&
        (moratoriumPeriodMonths > 0 || monthsInYear < 12)
      ) {
        const prorated = (annualInterestAmount * monthsInYear) / 12;
        // console.log(`Year ${yearIndex + 1} prorated interest:`, prorated);
        return prorated;
      }

      // console.log(`Year ${yearIndex + 1} full interest:`, annualInterestAmount);
      // Full annual interest for other repayment years
      return annualInterestAmount;
    };
  }, [formData, moratoriumPeriodMonths, monthsPerYear]);

  const isWorkingCapitalInterestZero = Array.from({
    length: projectionYears,
  }).every((_, yearIndex) => {
    const calculatedInterest = calculateInterestOnWorkingCapital(yearIndex);
    return calculatedInterest === 0;
  });

  const { Expenses = {} } = formData;
  const { normalExpense = [], directExpense = [] } = Expenses;

  // ✅ Compute Total Sum for Each Year
  const totalA = Array.from({
    length: formData.ProjectReportSetting.ProjectionYears || 0,
  }).map((_, yearIndex) => {
    return (
      (netProfitAfterTax[yearIndex] || 0) +
      (totalDepreciationPerYear[yearIndex] || 0) +
      (yearlyInterestLiabilities[yearIndex] || 0) +
      (calculateInterestOnWorkingCapital(yearIndex) || 0)
    );
  });

  // ✅ Compute Total (B) for Each Year
  const totalB = Array.from({
    length: formData.ProjectReportSetting.ProjectionYears || 0,
  }).map((_, yearIndex) => {
    return (
      (yearlyInterestLiabilities[yearIndex] || 0) + // ✅ Interest on Term Loan
      (calculateInterestOnWorkingCapital(
        yearIndex // Pass current year index
      ) || 0) + // ✅ Interest on Working Capital
      (yearlyPrincipalRepayment[yearIndex] || 0) // ✅ Repayment of Term Loan
    );
  });

  const DSCR = Array.from({
    length: formData.ProjectReportSetting.ProjectionYears || 0,
  }).map((_, yearIndex) => {
    return totalB[yearIndex] !== 0 ? totalA[yearIndex] / totalB[yearIndex] : 0; // ✅ Avoid division by zero
  });

  // ✅ Filter out zero values from the beginning
  const validDSCRValues = DSCR.filter(
    (value, index) => !(index === 0 && value === 0)
  );

  // ✅ Memoize averageDSCR calculation
  const averageDSCR = useMemo(() => {
    if (validDSCRValues.length === 0) return 0;
    return (
      validDSCRValues.reduce((sum, value) => sum + value, 0) /
      validDSCRValues.length
    );
  }, [JSON.stringify(validDSCRValues)]); // Deep dependency check with stringify

  const numOfYearsUsedForAvg = validDSCRValues.length;

  useEffect(() => {
    // ✅ Only update if `averageDSCR` or `DSCR` changes
    DSCRSend((prev) => {
      const newDSCRData = {
        averageDSCR,
        DSCR, // ✅ Ensure DSCR is included
        numOfYearsUsedForAvg,
      };

      if (JSON.stringify(prev) !== JSON.stringify(newDSCRData)) {
        return newDSCRData;
      }
      return prev; // No change, so don't update state
    });

    // console.log("DSCR:", DSCR);
  }, [averageDSCR, DSCR, numOfYearsUsedForAvg]); // ✅ Correct dependency tracking

  // Check if all Depreciation values are zero
  const isDepreciationAllZero = totalDepreciationPerYear.every(
    (val) => val === 0
  );

  // Check if all Interest on Term Loan values are zero
  const isInterestOnTermLoanAllZero = yearlyInterestLiabilities.every(
    (val) => val === 0
  );

// console.log("yearlyInterestLiabilities :", yearlyInterestLiabilities);

  // Check if all Repayment of Term Loan values are zero
  const isRepaymentTermLoanAllZero = yearlyPrincipalRepayment.every(
    (val) => val === 0
  );

  const isAdvancedLandscape = orientation === "advanced-landscape";
  let splitFinancialYearLabels = [financialYearLabels];
  if (isAdvancedLandscape) {
    // Remove first year if hidden
    const visibleLabels = hideFirstYear
      ? financialYearLabels.slice(1)
      : financialYearLabels;
    const totalCols = visibleLabels.length;
    const firstPageCols = Math.ceil(totalCols / 2);
    const secondPageCols = totalCols - firstPageCols;
    splitFinancialYearLabels = [
      visibleLabels.slice(0, firstPageCols),
      visibleLabels.slice(firstPageCols, firstPageCols + secondPageCols),
    ];
  }
  const toRoman = (n) =>
    ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"][n] || n + 1;
  if (isAdvancedLandscape) {
    return splitFinancialYearLabels.map((labels, pageIdx) => {
      // labels is the page's array of financial year labels (subset of financialYearLabels)
      const pageStart =
        Math.max(0, financialYearLabels.indexOf(labels[0])) || 0;

      const globalIndex = (localIdx) => pageStart + localIdx;
      const shouldSkipCol = (gIdx) => hideFirstYear && gIdx === 0;

      // For centering the "Average Current Ratio" on the visible columns of this page
      const visibleLocalCols = labels
        .map((_, i) => i)
        .filter((i) => !shouldSkipCol(globalIndex(i)));
      const centerLocalIdx =
        visibleLocalCols[Math.floor(visibleLocalCols.length / 2)];

      return (
        <Page
          // size={formData.ProjectReportSetting?.ProjectionYears > 12 ? "A3" : "A4"}
          size="A4"
          orientation="landscape"
          style={styles.page}
          wrap={false}
          break
        >
          {pdfType &&
            pdfType !== "select option" &&
            (pdfType === "Sharda Associates" || pdfType === "CA Certified") && (
              <View
                style={{
                  position: "absolute",
                  left: "50%", // Center horizontally
                  top: "50%", // Center vertically
                  width: 500, // Set width to 500px
                  height: 700, // Set height to 700px
                  marginLeft: -200, // Move left by half width (500/2)
                  marginTop: -350, // Move up by half height (700/2)
                  opacity: 0.4, // Light watermark
                  zIndex: -1, // Push behind content
                }}
                fixed
              >
                <Image
                  src={
                    pdfType === "Sharda Associates" ? SAWatermark : CAWatermark
                  }
                  style={{
                    width: "100%",
                    height: "100%",
                  }}
                />
              </View>
            )}
          {/* businees name and financial year  */}
          <View>
            <Text style={styles.businessName}>
              {formData?.AccountInformation?.businessName || "Business Bame"}
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

          {/* Amount format */}

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
          <View style={[styles.table, { borderRightWidth: 0 }]}>
            <View
              style={[
                stylesCOP.heading,
                {
                  fontWeight: "bold",
                  paddingLeft: 10,
                },
              ]}
            >
              <Text>
                
                {debtEquityOption === "Equity" ? "Equity-Service" : "Debt-Service"} Coverage Ratio
                {splitFinancialYearLabels.length > 1
                  ? ` (${toRoman(pageIdx)})`
                  : ""}
              </Text>
            </View>
            {/* Table Header */}
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

              {/* ✅ Generate Dynamic Year Headers for THIS PAGE using `labels` */}
              {labels.map((yearLabel, localIdx) => {
                const gIdx = globalIndex(localIdx);
                if (shouldSkipCol(gIdx)) return null;
                return (
                  <Text
                    key={gIdx}
                    style={[styles.particularsCell, stylesCOP.boldText]}
                  >
                    {yearLabel}
                  </Text>
                );
              })}
            </View>

            <View>
              {/* Net Profit After Tax Calculation  */}
              <View
                style={[
                  stylesMOF.row,
                  styles.tableRow,
                  { borderWidth: "0.1px" },
                ]}
              >
                <Text
                  style={[
                    stylesCOP.serialNoCellDetail,
                    styleExpenses.sno,
                    styleExpenses.bordernone,
                  ]}
                >
                  1
                </Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  Net Profit After Tax
                </Text>
                {/*  Display Precomputed Net Profit After Tax (NPAT) Values per visible column */}
                {labels.map((_, localIdx) => {
                  const gIdx = globalIndex(localIdx);
                  if (shouldSkipCol(gIdx)) return null;
                  const val = netProfitAfterTax?.[gIdx] ?? 0;
                  return (
                    <Text
                      key={`netProfitAfterTax-${gIdx}`}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                      ]}
                    >
                      {formatNumber(val)}
                    </Text>
                  );
                })}
              </View>

              {/* ✅ Render Depreciation Row */}
              {!isDepreciationAllZero && (
                <View
                  style={[
                    stylesMOF.row,
                    styles.tableRow,
                    { borderWidth: "0px" },
                  ]}
                >
                  <Text
                    style={[
                      stylesCOP.serialNoCellDetail,
                      styleExpenses.sno,
                      styleExpenses.bordernone,
                    ]}
                  >
                    2
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

                  {/* ✅ Display Depreciation Values for Each Visible Year */}
                  {labels.map((_, localIdx) => {
                    const gIdx = globalIndex(localIdx);
                    if (shouldSkipCol(gIdx)) return null;
                    const val = totalDepreciationPerYear?.[gIdx] ?? 0;
                    return (
                      <Text
                        key={`dep-${gIdx}`}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                        ]}
                      >
                        {formatNumber(val)}
                      </Text>
                    );
                  })}
                </View>
              )}

              {/* Interest On Term Loan */}
              {!isInterestOnTermLoanAllZero && (
                <View style={[styles.tableRow, styles.totalRow]}>
                  {/* Serial Number */}
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
                    {/* Interest On Term Loan */}
                    {renderIOTLLabel()}
                  </Text>

                  {/* Get total projection years - per visible column */}
                  {labels.map((_, localIdx) => {
                    const gIdx = globalIndex(localIdx);
                    if (shouldSkipCol(gIdx)) return null;
                    const val = yearlyInterestLiabilities?.[gIdx] ?? 0;
                    return (
                      <Text
                        key={`itl-a-${gIdx}`}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                        ]}
                      >
                        {formatNumber(val)}
                      </Text>
                    );
                  })}
                </View>
              )}

              {/* Interest On Working Capital */}
              {!isWorkingCapitalInterestZero && (
                <View style={[styles.tableRow, styles.totalRow]}>
                  {/* Serial Number */}
                  <Text
                    style={[
                      stylesCOP.serialNoCellDetail,
                      styleExpenses.sno,
                      styleExpenses.bordernone,
                    ]}
                  >
                    4
                  </Text>

                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                    ]}
                  >
                    {/* Interest On Working Capital */}
                    {renderIOWCLabel()}
                  </Text>

                  {/* ✅ Apply `calculateInterestOnWorkingCapital` for each visible global year index */}
                  {labels.map((_, localIdx) => {
                    const gIdx = globalIndex(localIdx);
                    if (shouldSkipCol(gIdx)) return null;
                    const calculatedInterest =
                      calculateInterestOnWorkingCapital(gIdx);
                    return (
                      <Text
                        key={`iwc-a-${gIdx}`}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                        ]}
                      >
                        {formatNumber(calculatedInterest)}
                      </Text>
                    );
                  })}
                </View>
              )}

              {/* ✅ Total Row for Variable Expense */}
              <View
                style={[
                  stylesMOF.row,
                  styles.tableRow,
                  styleExpenses.totalRow,
                  { borderWidth: 0 },
                ]}
              >
                <Text
                  style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}
                ></Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                    {
                      fontWeight: "bold",

                      textAlign: "right",
                    },
                  ]}
                >
                  Total - A
                </Text>

                {/* ✅ Display Computed Total for Each Visible Year */}
                {labels.map((_, localIdx) => {
                  const gIdx = globalIndex(localIdx);
                  if (shouldSkipCol(gIdx)) return null;
                  const totalValue = totalA?.[gIdx] ?? 0;
                  return (
                    <Text
                      key={`total-a-${gIdx}`}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        stylesCOP.boldText,
                        styleExpenses.fontSmall,
                      ]}
                    >
                      {formatNumber(totalValue)}{" "}
                      {/* ✅ Display Rounded Value */}
                    </Text>
                  );
                })}
              </View>
            </View>

            <View>
              {/* Interest On Term Loan */}
              {!isInterestOnTermLoanAllZero && (
                <View style={[styles.tableRow, styles.totalRow]}>
                  {/* Serial Number */}
                  <Text
                    style={[
                      stylesCOP.serialNoCellDetail,
                      styleExpenses.sno,
                      styleExpenses.bordernone,
                      { paddingTop: "20px" },
                    ]}
                  >
                    1
                  </Text>

                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                      { paddingTop: "20px" },
                    ]}
                  >
                    {/* Interest On Term Loan */}
                    {renderIOTLLabel()}
                  </Text>

                  {/* Per visible column */}
                  {labels.map((_, localIdx) => {
                    const gIdx = globalIndex(localIdx);
                    if (shouldSkipCol(gIdx)) return null;
                    const val = yearlyInterestLiabilities?.[gIdx] ?? 0;
                    return (
                      <Text
                        key={`itl-b-${gIdx}`}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                          { paddingTop: "20px" },
                        ]}
                      >
                        {formatNumber(val)}
                      </Text>
                    );
                  })}
                </View>
              )}

              {/* Interest On Working Capital */}
              {!isWorkingCapitalInterestZero && (
                <View style={[styles.tableRow, styles.totalRow]}>
                  {/* Serial Number */}
                  <Text
                    style={[
                      stylesCOP.serialNoCellDetail,
                      styleExpenses.sno,
                      styleExpenses.bordernone,
                    ]}
                  >
                    2
                  </Text>

                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                    ]}
                  >
                    {/* Interest On Working Capital */}
                    {renderIOWCLabel()}
                  </Text>

                  {/* ✅ Apply `calculateInterestOnWorkingCapital` */}
                  {labels.map((_, localIdx) => {
                    const gIdx = globalIndex(localIdx);
                    if (shouldSkipCol(gIdx)) return null;
                    const calculatedInterest =
                      calculateInterestOnWorkingCapital(gIdx);
                    return (
                      <Text
                        key={`iwc-b-${gIdx}`}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                        ]}
                      >
                        {formatNumber(calculatedInterest)}
                      </Text>
                    );
                  })}
                </View>
              )}

              {/* ✅ Repayment of Term Loan */}
              {!isRepaymentTermLoanAllZero && (
                <View style={[styles.tableRow, styles.totalRow]}>
                  <Text
                    style={[
                      stylesCOP.serialNoCellDetail,
                      styleExpenses.sno,
                      styleExpenses.bordernone,
                    ]}
                  >
                    {isWorkingCapitalInterestZero ? 2 : 3}
                  </Text>

                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                    ]}
                  >
                    Repayment of Term Loan
                  </Text>

                  {/* ✅ Ensure First-Year Repayment is Included (per visible column) */}
                  {labels.map((_, localIdx) => {
                    const gIdx = globalIndex(localIdx);
                    if (shouldSkipCol(gIdx)) return null;
                    const val = yearlyPrincipalRepayment?.[gIdx] ?? 0;
                    return (
                      <Text
                        key={`repay-${gIdx}`}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                        ]}
                      >
                        {formatNumber(val)}
                      </Text>
                    );
                  })}
                </View>
              )}

              {/* ✅ Total Row for Variable Expense */}
              <View
                style={[
                  stylesMOF.row,
                  styles.tableRow,
                  styleExpenses.totalRow,
                  { borderWidth: 0 },
                ]}
              >
                <Text
                  style={[
                    stylesCOP.serialNoCellDetail,
                    styleExpenses.sno,
                    { paddingBottom: "20px" },
                  ]}
                ></Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                    {
                      fontWeight: "bold",

                      textAlign: "right",
                      paddingBottom: "20px",
                    },
                  ]}
                >
                  Total - B
                </Text>

                {/* ✅ Display Computed Total for Each Visible Year */}
                {labels.map((_, localIdx) => {
                  const gIdx = globalIndex(localIdx);
                  if (shouldSkipCol(gIdx)) return null;
                  const totalValue = totalB?.[gIdx] ?? 0;
                  return (
                    <Text
                      key={`total-b-${gIdx}`}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        stylesCOP.boldText,
                        styleExpenses.fontSmall,
                        { paddingBottom: "20px", borderBottomWidth: 0 },
                      ]}
                    >
                      {formatNumber(totalValue)}{" "}
                      {/* ✅ Display Rounded Value */}
                    </Text>
                  );
                })}
              </View>
            </View>

            {/* DSCR (A/B) */}
            <View
              style={[
                stylesMOF.row,
                styles.tableRow,
                styleExpenses.totalRow,
                { borderWidth: 0 },
              ]}
            >
              <Text
                style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}
              ></Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                  { fontWeight: "bold", textAlign: "left" },
                ]}
              >
                DSCR (A/B)
              </Text>

              {/* ✅ Display Computed DSCR for Each Visible Year */}
              {labels.map((_, localIdx) => {
                const gIdx = globalIndex(localIdx);
                if (shouldSkipCol(gIdx)) return null;
                const v = DSCR?.[gIdx] ?? 0;
                return (
                  <Text
                    key={`dscr-${gIdx}`}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      stylesCOP.boldText,
                      styleExpenses.fontSmall,
                    ]}
                  >
                    {formatNumber(parseFloat(v).toFixed(2))}
                  </Text>
                );
              })}
            </View>

            {/* Blank Row  */}
            <View
              style={[
                stylesMOF.row,
                styles.tableRow,
                styleExpenses.totalRow,
                { borderWidth: 0 },
              ]}
            >
              <Text
                style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}
              ></Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                  { fontWeight: "bold", textAlign: "left" },
                ]}
              ></Text>

              {/* Blank cells per visible column */}
              {labels.map((_, localIdx) => {
                const gIdx = globalIndex(localIdx);
                if (shouldSkipCol(gIdx)) return null;
                return (
                  <Text
                    key={`blank-${gIdx}`}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      stylesCOP.boldText,
                      styleExpenses.fontSmall,
                      { borderTopWidth: 0, padding: "10px" },
                    ]}
                  >
                    {/* empty */}
                  </Text>
                );
              })}
            </View>

            {/* ✅ Display Average DSCR */}
            <View
              style={[
                stylesMOF.row,
                styles.tableRow,
                styleExpenses.totalRow,
                { borderWidth: 0 },
              ]}
            >
              {/* Empty Column for Sr. No. */}
              <Text
                style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}
              ></Text>

              {/* Label: Average DSCR */}
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                  { fontWeight: "bold", textAlign: "left" },
                ]}
              >
                Average DSCR
              </Text>

              {/* ✅ Center the value on THIS PAGE only */}
              {labels.map((_, localIdx) => {
                const gIdx = globalIndex(localIdx);
                if (shouldSkipCol(gIdx)) return null;
                const isCenter = localIdx === centerLocalIdx;
                return (
                  <Text
                    key={`avg-dscr-${gIdx}`}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                      {
                        fontWeight: "bold",

                        textAlign: "center",
                        borderWidth: 0,
                      },
                    ]}
                  >
                    {isCenter
                      ? parseFloat(averageDSCR).toFixed(2) // ✅ Display only in the center cell
                      : ""}
                  </Text>
                );
              })}
            </View>
          </View>
          {/* businees name and Client Name  */}
          <View
            style={[
              {
                display: "flex",
                flexDirection: "column",
                gap: "80px",
                alignItems: "flex-end",
                justifyContent: "flex-end",
                marginTop: "60px",
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
        </Page>
      );
    });
  }

  return (
    <PageWithFooter
      // size={formData.ProjectReportSetting?.ProjectionYears > 12 ? "A3" : "A4"}
      size="A4"
      orientation={orientation}
      style={styles.page}
      wrap={false}
      break
    >
      {pdfType &&
        pdfType !== "select option" &&
        (pdfType === "Sharda Associates" || pdfType === "CA Certified") && (
          <View
            style={{
              position: "absolute",
              left: "50%", // Center horizontally
              top: "50%", // Center vertically
              width: 500, // Set width to 500px
              height: 700, // Set height to 700px
              marginLeft: -200, // Move left by half width (500/2)
              marginTop: -350, // Move up by half height (700/2)
              opacity: 0.4, // Light watermark
              zIndex: -1, // Push behind content
            }}
            fixed
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
      {/* businees name and financial year  */}
      <View>
        <Text style={styles.businessName}>
          {formData?.AccountInformation?.businessName || "Business Bame"}
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

      {/* Amount format */}

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
      <View style={[styles.table, { borderRightWidth: 0 }]}>
        <View
          style={[
            stylesCOP.heading,
            {
              fontWeight: "bold",
              paddingLeft: 10,
            },
          ]}
        >
          <Text>
            {debtEquityOption === "Equity" ? "Equity-Service" : "Debt-Service"} Coverage Ratio
          </Text>
        </View>
        {/* Table Header */}
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
          {financialYearLabels
            .slice(hideFirstYear ? 1 : 0) // ✅ Skip first year if receivedtotalRevenueReceipts[0] < 0
            .map((yearLabel, yearIndex) => (
              <Text
                key={yearIndex}
                style={[styles.particularsCell, stylesCOP.boldText]}
              >
                {yearLabel}
              </Text>
            ))}
        </View>

        <View>
          {/* Net Profit After Tax Calculation  */}
          <View
            style={[stylesMOF.row, styles.tableRow, { borderWidth: "0.1px" }]}
          >
            <Text
              style={[
                stylesCOP.serialNoCellDetail,
                styleExpenses.sno,
                styleExpenses.bordernone,
              ]}
            >
              1
            </Text>
            <Text
              style={[
                stylesCOP.detailsCellDetail,
                styleExpenses.particularWidth,
                styleExpenses.bordernone,
              ]}
            >
              Net Profit After Tax
            </Text>
            {/*  Display Precomputed Net Profit After Tax (NPAT) Values */}
            {netProfitAfterTax.map(
              (tax, yearIndex) =>
                (!hideFirstYear || yearIndex !== 0) && (
                  <Text
                    key={`netProfitAfterTax-${yearIndex}`}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                    ]}
                  >
                    {formatNumber(tax)}
                  </Text>
                )
            )}
          </View>

          {/* ✅ Render Depreciation Row */}
          {!isDepreciationAllZero && (
            <View
              style={[stylesMOF.row, styles.tableRow, { borderWidth: "0px" }]}
            >
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  styleExpenses.sno,
                  styleExpenses.bordernone,
                ]}
              >
                2
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

              {/* ✅ Display Depreciation Values for Each Year */}
              {totalDepreciationPerYear.map(
                (depreciationValue, yearIndex) =>
                  (!hideFirstYear || yearIndex !== 0) && (
                    <Text
                      key={yearIndex}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                      ]}
                    >
                      {formatNumber(depreciationValue)}
                    </Text>
                  )
              )}
            </View>
          )}

          {/* Interest On Term Loan */}
          {!isInterestOnTermLoanAllZero && (
            <View style={[styles.tableRow, styles.totalRow]}>
              {/* Serial Number */}
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
                {/* Interest On Term Loan */}
                {renderIOTLLabel()}
              </Text>

              {/* Get total projection years */}
              {Array.from({
                length: formData.ProjectReportSetting.ProjectionYears,
              }).map(
                (_, index) =>
                  (!hideFirstYear || index !== 0) && (
                    <Text
                      key={index}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                      ]}
                    >
                      {formatNumber(yearlyInterestLiabilities[index] || 0)}
                    </Text>
                  )
              )}
            </View>
          )}

          {/* Interest On Working Capital */}
          {!isWorkingCapitalInterestZero && (
            <View style={[styles.tableRow, styles.totalRow]}>
              {/* Serial Number */}
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  styleExpenses.sno,
                  styleExpenses.bordernone,
                ]}
              >
                4
              </Text>

              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                ]}
              >
                {/* Interest On Working Capital */}
                {renderIOWCLabel()}
              </Text>

              {/* ✅ Apply `calculateInterestOnWorkingCapital` */}
              {Array.from({
                length: formData.ProjectReportSetting.ProjectionYears,
              }).map((_, yearIndex) => {
                if (hideFirstYear && yearIndex === 0) return null; // Skip first year if hideFirstYear is true

                const calculatedInterest =
                  calculateInterestOnWorkingCapital(yearIndex);

                return (
                  <Text
                    key={yearIndex}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                    ]}
                  >
                    {formatNumber(calculatedInterest)}
                  </Text>
                );
              })}
            </View>
          )}

          {/* ✅ Total Row for Variable Expense */}
          <View
            style={[
              stylesMOF.row,
              styles.tableRow,
              styleExpenses.totalRow,
              { borderWidth: 0 },
            ]}
          >
            <Text
              style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}
            ></Text>
            <Text
              style={[
                stylesCOP.detailsCellDetail,
                styleExpenses.particularWidth,
                styleExpenses.bordernone,
                {
                  fontWeight: "bold",

                  textAlign: "right",
                },
              ]}
            >
              Total - A
            </Text>

            {/* ✅ Display Computed Total for Each Year */}
            {totalA.map(
              (totalValue, yearIndex) =>
                (!hideFirstYear || yearIndex !== 0) && (
                  <Text
                    key={yearIndex}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      stylesCOP.boldText,
                      styleExpenses.fontSmall,
                    ]}
                  >
                    {formatNumber(totalValue)} {/* ✅ Display Rounded Value */}
                  </Text>
                )
            )}
          </View>
        </View>

        <View>
          {/* Interest On Term Loan */}
          {!isInterestOnTermLoanAllZero && (
            <View style={[styles.tableRow, styles.totalRow]}>
              {/* Serial Number */}
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  styleExpenses.sno,
                  styleExpenses.bordernone,
                  { paddingTop: "20px" },
                ]}
              >
                1
              </Text>

              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                  { paddingTop: "20px" },
                ]}
              >
                {/* Interest On Term Loan */}
                {renderIOTLLabel()}
              </Text>

              {/* Get total projection years */}
              {Array.from({
                length: formData.ProjectReportSetting.ProjectionYears,
              }).map(
                (_, index) =>
                  (!hideFirstYear || index !== 0) && (
                    <Text
                      key={index}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                        { paddingTop: "20px" },
                      ]}
                    >
                      {formatNumber(yearlyInterestLiabilities[index] || 0)}
                    </Text>
                  )
              )}
            </View>
          )}

          {/* Interest On Working Capital */}
          {!isWorkingCapitalInterestZero && (
            <View style={[styles.tableRow, styles.totalRow]}>
              {/* Serial Number */}
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  styleExpenses.sno,
                  styleExpenses.bordernone,
                ]}
              >
                2
              </Text>

              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                ]}
              >
                {/* Interest On Working Capital */}
                {renderIOWCLabel()}
              </Text>

              {/* ✅ Apply `calculateInterestOnWorkingCapital` */}
              {Array.from({
                length: formData.ProjectReportSetting.ProjectionYears,
              }).map((_, yearIndex) => {
                if (hideFirstYear && yearIndex === 0) return null;
                const calculatedInterest =
                  calculateInterestOnWorkingCapital(yearIndex);

                return (
                  <Text
                    key={yearIndex}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                    ]}
                  >
                    {formatNumber(calculatedInterest)}
                  </Text>
                );
              })}
            </View>
          )}

          {/* ✅ Repayment of Term Loan */}
          {!isRepaymentTermLoanAllZero && (
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  styleExpenses.sno,
                  styleExpenses.bordernone,
                ]}
              >
                {isWorkingCapitalInterestZero ? 2 : 3}
              </Text>

              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                ]}
              >
                Repayment of Term Loan
              </Text>

              {/* ✅ Ensure First-Year Repayment is Included */}
              {yearlyPrincipalRepayment &&
              yearlyPrincipalRepayment.length > 0 ? (
                Array.from({ length: projectionYears }).map(
                  (_, index) =>
                    (!hideFirstYear || index !== 0) && (
                      <Text
                        key={index}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                        ]}
                      >
                        {formatNumber(yearlyPrincipalRepayment[index] || 0)}
                      </Text>
                    )
                )
              ) : (
                <Text
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                  ]}
                >
                  No Data Available
                </Text>
              )}
            </View>
          )}

          {/* ✅ Total Row for Variable Expense */}
          <View
            style={[
              stylesMOF.row,
              styles.tableRow,
              styleExpenses.totalRow,
              { borderWidth: 0 },
            ]}
          >
            <Text
              style={[
                stylesCOP.serialNoCellDetail,
                styleExpenses.sno,
                { paddingBottom: "20px" },
              ]}
            ></Text>
            <Text
              style={[
                stylesCOP.detailsCellDetail,
                styleExpenses.particularWidth,
                styleExpenses.bordernone,
                {
                  fontWeight: "bold",

                  textAlign: "right",
                  paddingBottom: "20px",
                },
              ]}
            >
              Total - B
            </Text>

            {/* ✅ Display Computed Total for Each Year */}
            {totalB.map(
              (totalValue, yearIndex) =>
                (!hideFirstYear || yearIndex !== 0) && (
                  <Text
                    key={yearIndex}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      stylesCOP.boldText,
                      styleExpenses.fontSmall,
                      { paddingBottom: "20px", borderBottomWidth: 0 },
                    ]}
                  >
                    {formatNumber(totalValue)} {/* ✅ Display Rounded Value */}
                  </Text>
                )
            )}
          </View>
        </View>

        {/* DSCR (A/B) */}
        <View
          style={[
            stylesMOF.row,
            styles.tableRow,
            styleExpenses.totalRow,
            { borderWidth: 0 },
          ]}
        >
          <Text
            style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}
          ></Text>
          <Text
            style={[
              stylesCOP.detailsCellDetail,
              styleExpenses.particularWidth,
              styleExpenses.bordernone,
              { fontWeight: "bold", textAlign: "left" },
            ]}
          >
            DSCR (A/B)
          </Text>

          {/* ✅ Display Computed Total for Each Year */}
          {DSCR.map(
            (totalValue, yearIndex) =>
              (!hideFirstYear || yearIndex !== 0) && (
                <Text
                  key={yearIndex}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    stylesCOP.boldText,
                    styleExpenses.fontSmall,
                  ]}
                >
                  {formatNumber(parseFloat(totalValue).toFixed(2))}{" "}
                  {/* ✅ Display Rounded Value */}
                </Text>
              )
          )}
        </View>

        {/* Blank Row  */}

        <View
          style={[
            stylesMOF.row,
            styles.tableRow,
            styleExpenses.totalRow,
            { borderWidth: 0 },
          ]}
        >
          <Text
            style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}
          ></Text>
          <Text
            style={[
              stylesCOP.detailsCellDetail,
              styleExpenses.particularWidth,
              styleExpenses.bordernone,
              { fontWeight: "bold", textAlign: "left" },
            ]}
          ></Text>

          {/* ✅ Display Computed Total for Each Year */}
          {DSCR.map(
            (totalValue, yearIndex) =>
              (!hideFirstYear || yearIndex !== 0) && (
                <Text
                  key={yearIndex}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    stylesCOP.boldText,
                    styleExpenses.fontSmall,
                    { borderTopWidth: 0, padding: "10px" },
                  ]}
                >
                  {" "}
                  {/* ✅ Display Rounded Value */}
                </Text>
              )
          )}
        </View>

        {/* ✅ Display Average DSCR */}
        <View
          style={[
            stylesMOF.row,
            styles.tableRow,
            styleExpenses.totalRow,
            { borderWidth: 0 },
          ]}
        >
          {/* Empty Column for Sr. No. */}
          <Text
            style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}
          ></Text>

          {/* Label: Average DSCR */}
          <Text
            style={[
              stylesCOP.detailsCellDetail,
              styleExpenses.particularWidth,
              styleExpenses.bordernone,
              { fontWeight: "bold", textAlign: "left" },
            ]}
          >
            Average DSCR
          </Text>

          {/* ✅ Value - Dynamic Width Based on Financial Years */}

          {financialYearLabels
            .slice(hideFirstYear ? 1 : 0) // ✅ Skip first year if receivedtotalRevenueReceipts[0] < 0
            .map((yearLabel, yearIndex, arr) => {
              const visibleLabels = financialYearLabels.slice(
                hideFirstYear ? 1 : 0
              );
              const centerIndex = Math.floor(visibleLabels.length / 2); // ✅ Find center index
              const isLast = yearIndex === arr.length - 1;

              return (
                <Text
                  key={yearIndex}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                    {
                      fontWeight: "bold",

                      textAlign: "center",
                      borderWidth: 0,
                      ...(isLast && { borderRightWidth: 1 }),
                    },
                  ]}
                >
                  {yearIndex === centerIndex
                    ? parseFloat(averageDSCR).toFixed(2) // ✅ Display only in the center cell
                    : ""}
                </Text>
              );
            })}
        </View>
      </View>
      {/* businees name and Client Name  */}
      <View
        style={[
          {
            display: "flex",
            flexDirection: "column",
            gap: "80px",
            alignItems: "flex-end",
            justifyContent: "flex-end",
            marginTop: "60px",
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
    </PageWithFooter>
  );
};

export default React.memo(DebtServiceCoverageRatio);
