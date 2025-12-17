import React from "react";
import { Page, View, Text, Image } from "@react-pdf/renderer";
import {
  styles,
  stylesCOP,
  stylesMOF,
  styleExpenses,
} from "../PDFComponents/Styles";
import SAWatermark from "../Assets/SAWatermark";
import CAWatermark from "../Assets/CAWatermark";
import shouldHideFirstYear from "../PDFComponents/HideFirstYear";
import { makeCMAExtractors } from "../Utils/CMA/cmaExtractors";
import { CMAExtractorFinPos } from "../Utils/CMA/CMAExtractorFInPos";
import { CMAExtractorFundFlow } from "../Utils/CMA/CMAExtractorFundFlow";
import { CMAExtractorProfitability } from "../Utils/CMA/CMAExtractorProfitability";
import { CMAExtractorBS } from "../Utils/CMA/CMAExtractorBS";
import PageWithFooter from "../Helpers/PageWithFooter"

const CMABalanceSheetMenu = ({
  formData,
  formatNumber,
  receivedtotalRevenueReceipts,
  pdfType,
  orientation,
}) => {

  const pageStyles = {
    page: {
      padding: 40,
      paddingTop: 50, // Extra top margin for print safety
      paddingBottom: 80, // Extra bottom margin for print safety
      paddingLeft: 40,
      paddingRight: 40,
      fontFamily: "Helvetica",
      position: "relative",
    },
    contentWrapper: {
      flex: 1,
      marginBottom: 30, // Space before footer
    },
    // Safe area to avoid content being cut off
    safeArea: {
      marginTop: 20, // Top margin for content
      marginBottom: 40, // Bottom margin for content
    },
    footer: {
      position: "absolute",
      bottom: 30,
      left: 40,
      right: 40,
      height: 50, // Fixed footer height
    },
  };

  const PPExtractor = CMAExtractorProfitability(formData);
  const extractors = makeCMAExtractors(formData);
  const yearLabels = extractors.yearLabels();

  // Defensive defaults for props that may be undefined
  formData = formData || {};

  
  const activeRowIndex = 0; // Define it or fetch dynamically if needed

  const projectionYears =
    parseInt(formData.ProjectReportSetting.ProjectionYears) || 0;

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

  const hideFirstYear = shouldHideFirstYear(receivedtotalRevenueReceipts);
  // Function to handle moratorium period spillover across financial years

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

  const grossProfit = Array.from({ length: projectionYears }).map(
    (_, i) => Number(OriginalRevenueValues[i]) - Number(totalDirectExpenses[i])
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

  //new data
  const BSextractors = CMAExtractorBS(formData);
  const reverseAndSurplus = BSextractors.reservesAndSurplusArr() || [];
  const bankTermLoanArr = BSextractors.bankTermLoanArr() || [];
  const bankLoan12month =
    formData?.computedData?.totalLiabilities?.repaymentValueswithin12months ||
    [];

  const bankLoanPayablewithin12months = Array.from({
    length: projectionYears,
  }).map((_, i) => Number(bankLoan12month[i] || 0));

  const workingCapitalLoanArr = BSextractors.workingCapitalLoanArr() || [];
  const currentLiabilities = formData?.MoreDetails?.currentLiabilities || [];

  const totalLiabilitiesArray = formData?.computedData?.totalLiabilities?.totalLiabilitiesArray || []

  const grossFixedAssetsPerYear = BSextractors.grossFixedAssetsPerYear() || [];
  const totalDepreciation = BSextractors.totalDepreciation() || [];
  const netBlock = BSextractors.netBlock() || [];
  const closingCashBalanceArray = formData?.computedData?.totalLiabilities?.closingCashBalanceArray || [];
  const safeNumber = (val) =>
    val === undefined || val === null || val === "" ? 0 : Number(val) || 0;
  const inventory = Array.from({
    length: formData.MoreDetails.OpeningStock.length,
  }).map((_, yearIndex) => {
    const ClosingStock = formData?.MoreDetails.ClosingStock?.[yearIndex] || 0;
    return safeNumber(ClosingStock);
  });
  const isInventoryZero = inventory.every((value) => value === 0);

  const writeOffStartIndex = 0;
  const preliminaryWriteOffSteps = preliminaryWriteOffYears;

  //   const preliminaryWriteOffPerYear = Array.from({
  //     length: projectionYears,
  //   }).map((_, index) => {
  //     const relativeYear = index - writeOffStartIndex;

  //     if (
  //       index >= writeOffStartIndex &&
  //       relativeYear < preliminaryWriteOffSteps
  //     ) {
  //       // Calculate decreasing value
  //       return yearlyWriteOffAmount * (preliminaryWriteOffSteps - relativeYear);
  //     }

  //     return 0;
  //   });

  const preliminaryExpenseBalanceSheet = [];
  for (let i = 0; i < projectionYears; i++) {
    if (i === 0) {
      preliminaryExpenseBalanceSheet[i] = Math.max(
        preliminaryExpensesTotal - yearlyWriteOffAmount,
        0
      );
    } else {
      preliminaryExpenseBalanceSheet[i] = Math.max(
        preliminaryExpenseBalanceSheet[i - 1] - yearlyWriteOffAmount,
        0
      );
    }
  }

  let cumulativeAdditionalAssets = 0;
  const totalAssetsArray = Array.from({ length: projectionYears }).map(
    (_, index) => {
      const netFixed = Number(netBlock[index] || 0);

      const cashEquivalent = Number(closingCashBalanceArray[index] || 0);

      const preliminaryExp = Number(preliminaryExpenseBalanceSheet[index] || 0);

      const currentYearAssets = (
        formData?.MoreDetails?.currentAssets ?? []
      ).reduce(
        (total, assets) => total + Number(assets.years?.[index] || 0),
        0
      );

      cumulativeAdditionalAssets += currentYearAssets;

      const inventoryValue = Number(inventory[index] || 0);

      const totalForYear =
        netFixed + cashEquivalent + preliminaryExp + cumulativeAdditionalAssets + inventoryValue;

      return totalForYear;
    }
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
      <PageWithFooter key={`pbs-${pageIdx}`} size="A4" orientation="landscape" style={pageStyles.page}>
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

  <View style={pageStyles.safeArea}>
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
              <Text>Projected Balance Sheet
              {splitYearLabels.length > 1 ? ` (${toRoman(pageIdx)})` : ""}
              </Text>
            </View>

            <View style={[styles.table,]}>
              {/* header */}
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

                {/* Use paged labels */}
                {labels.map((label, idx) => (
                  <Text key={label || idx} style={[styles.particularsCell, stylesCOP.boldText]}>
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
                {labels.map((label, idx) => (
                  <Text
                    key={label || idx}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                      { paddingVertical: "5px" },
                    ]}
                  />
                ))}
              </View>

              {/* Liabilities */}
              <View style={[styles.tableRow, styles.totalRow]}>
                <Text
                  style={[
                    stylesCOP.serialNoCellDetail,
                    styles.Total,
                    { paddingVertical: "10px" },
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
                    { paddingVertical: "10px" },
                  ]}
                >
                  Liabilities
                </Text>
                {labels.map((_, idx) => (
                  <Text
                    key={`liab-head-${idx}`}
                    style={[stylesCOP.particularsCellsDetail, styleExpenses.fontSmall]}
                  />
                ))}
              </View>

              {/* 1 Capital */}
              <View style={[styles.tableRow, styles.totalRow]}>
                <Text style={stylesCOP.serialNoCellDetail}>1</Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  Capital
                </Text>
                {labels.map((_, localIdx) => (
                  <Text
                    key={`cap-${localIdx}`}
                    style={[stylesCOP.particularsCellsDetail, styleExpenses.fontSmall]}
                  >
                    {formatNumber(formData?.MeansOfFinance?.totalPC || 0)}
                  </Text>
                ))}
              </View>

              {/* 2 Reserves and Surplus */}
              <View style={[styles.tableRow, styles.totalRow]}>
                <Text style={stylesCOP.serialNoCellDetail}>2</Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  Reserves and Surplus
                </Text>
                {labels.map((_, localIdx) => (
                  <Text
                    key={`ras-${localIdx}`}
                    style={[stylesCOP.particularsCellsDetail, styleExpenses.fontSmall]}
                  >
                    {formatNumber(reverseAndSurplus?.[globalIndex(localIdx)] || 0)}
                  </Text>
                ))}
              </View>

              {/* 3 Bank Loan - Term Loan */}
              <View style={[styles.tableRow, styles.totalRow]}>
                <Text style={stylesCOP.serialNoCellDetail}>3</Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  Bank Loan - Term Loan
                </Text>
                {labels.map((_, localIdx) => (
                  <Text
                    key={`bltl-${localIdx}`}
                    style={[stylesCOP.particularsCellsDetail, styleExpenses.fontSmall]}
                  >
                    {formatNumber(bankTermLoanArr?.[globalIndex(localIdx)] || 0)}
                  </Text>
                ))}
              </View>

              {/* 4 Bank Loan Payable within next 12 months */}
              <View style={[styles.tableRow, styles.totalRow]}>
                <Text style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}>4</Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  Bank Loan Payable within next 12 months
                </Text>
                {labels.map((_, localIdx) => (
                  <Text
                    key={`blp12-${localIdx}`}
                    style={[stylesCOP.particularsCellsDetail, styleExpenses.fontSmall]}
                  >
                    {formatNumber(
                      bankLoanPayablewithin12months?.[globalIndex(localIdx)] || 0
                    )}
                  </Text>
                ))}
              </View>

              {/* 5 Bank Loan - Working Capital Loan */}
              <View style={[styles.tableRow, styles.totalRow]}>
                <Text style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}>5</Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  Bank Loan - Working Capital Loan
                </Text>
                {labels.map((_, localIdx) => (
                  <Text
                    key={`blwcl-${localIdx}`}
                    style={[stylesCOP.particularsCellsDetail, styleExpenses.fontSmall]}
                  >
                    {formatNumber(workingCapitalLoanArr?.[globalIndex(localIdx)] || 0)}
                  </Text>
                ))}
              </View>

              {/* current liabilities array (paged, cumulative to global year) */}
              {currentLiabilities
                .filter((liab) => liab.years.some((v) => Number(v) !== 0))
                .map((liab, idx) => {
                  const serialNo = 6 + idx;
                  return (
                    <View style={styles.tableRow} key={`cliab-${idx}`}>
                      <Text style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}>
                        {serialNo}
                      </Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        {liab.particular}
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        const cumulative = (liab.years || [])
                          .slice(0, gIdx + 1)
                          .reduce((a, b) => a + (Number(b) || 0), 0);
                        return (
                          <Text
                            key={`cliab-val-${idx}-${localIdx}`}
                            style={[stylesCOP.particularsCellsDetail, styleExpenses.fontSmall]}
                          >
                            {formatNumber(cumulative)}
                          </Text>
                        );
                      })}
                    </View>
                  );
                })}

              {/* total liabilities */}
              <View style={[stylesMOF.row, styles.tableRow, styles.Total]}>
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
                    key={`tliab-${localIdx}`}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styles.boldText,
                      {
                        fontSize: "9px",
                        borderTopWidth: "2px",
                        borderBottomWidth: "2px",
                        paddingVertical: "8px",
                      },
                    ]}
                  >
                    {formatNumber(totalLiabilitiesArray?.[globalIndex(localIdx)] || 0)}
                  </Text>
                ))}
              </View>

              {/* Assets */}
              <View style={[styles.tableRow, styles.totalRow]}>
                <Text
                  style={[
                    stylesCOP.serialNoCellDetail,
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
                    styles.Total,
                    { paddingVertical: "10px" },
                  ]}
                >
                  Assets
                </Text>
                {labels.map((_, idx) => (
                  <Text
                    key={`assets-head-${idx}`}
                    style={[stylesCOP.particularsCellsDetail, styleExpenses.fontSmall]}
                  />
                ))}
              </View>

              {/* Fixed Assets */}
              <View style={[styles.tableRow]}>
                <Text style={stylesCOP.serialNoCellDetail}>1</Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  Fixed Assets
                </Text>
                {labels.map((_, localIdx) => (
                  <Text
                    key={`fa-${localIdx}`}
                    style={[stylesCOP.particularsCellsDetail, styleExpenses.fontSmall]}
                  >
                    {formatNumber(grossFixedAssetsPerYear?.[globalIndex(localIdx)] || 0)}
                  </Text>
                ))}
              </View>

              {/* Depreciation */}
              <View style={[styles.tableRow]}>
                <Text style={stylesCOP.serialNoCellDetail}>2</Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  Less: Depreciation
                </Text>
                {labels.map((_, localIdx) => (
                  <Text
                    key={`tdep-${localIdx}`}
                    style={[stylesCOP.particularsCellsDetail, styleExpenses.fontSmall]}
                  >
                    {formatNumber(totalDepreciation?.[globalIndex(localIdx)] || 0)}
                  </Text>
                ))}
              </View>

              {/* Net Fixed Assets */}
              <View style={[styles.tableRow]}>
                <Text style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}>3</Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  Net Fixed Assets
                </Text>
                {labels.map((_, localIdx) => (
                  <Text
                    key={`nba-${localIdx}`}
                    style={[stylesCOP.particularsCellsDetail, styleExpenses.fontSmall]}
                  >
                    {formatNumber(netBlock?.[globalIndex(localIdx)] || 0)}
                  </Text>
                ))}
              </View>

              {/* Cash & Cash Equivalents */}
              <View style={[styles.tableRow]}>
                <Text style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}>4</Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  Cash & Cash Equivalents
                </Text>
                {labels.map((_, localIdx) => (
                  <Text
                    key={`cce-${localIdx}`}
                    style={[stylesCOP.particularsCellsDetail, styleExpenses.fontSmall]}
                  >
                    {formatNumber(closingCashBalanceArray?.[globalIndex(localIdx)] || 0)}
                  </Text>
                ))}
              </View>

              {/* Inventory (if any) */}
              {!isInventoryZero && (
                <View style={[styles.tableRow]}>
                  <Text style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}>5</Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                    ]}
                  >
                    Inventory
                  </Text>
                  {labels.map((_, localIdx) => (
                    <Text
                      key={`inv-${localIdx}`}
                      style={[stylesCOP.particularsCellsDetail, styleExpenses.fontSmall]}
                    >
                      {formatNumber(inventory?.[globalIndex(localIdx)] || 0)}
                    </Text>
                  ))}
                </View>
              )}

              {/* Current Assets (excluding Inventory), cumulative to global year */}
              {formData?.MoreDetails?.currentAssets
                ?.filter(
                  (assets) =>
                    assets.particular !== "Inventory" &&
                    !assets.dontSendToBS &&
                    assets.years?.some((v) => Number(v) !== 0)
                )
                .map((assets, index) => {
                  const serialNumber = (isInventoryZero ? 5 : 6) + index;
                  return (
                    <View style={styles.tableRow} key={`casset-${index}`}>
                      <Text style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}>
                        {serialNumber}
                      </Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        {assets.particular}
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        const cumulative = (assets.years || [])
                          .slice(0, gIdx + 1)
                          .reduce((a, b) => a + (Number(b) || 0), 0);
                        return (
                          <Text
                            key={`casset-val-${index}-${localIdx}`}
                            style={[stylesCOP.particularsCellsDetail, styleExpenses.fontSmall]}
                          >
                            {formatNumber(cumulative)}
                          </Text>
                        );
                      })}
                    </View>
                  );
                })}

              {/* preliminary expense */}
              {!isPreliminaryWriteOffAllZero && (
                <View style={[styles.tableRow, styles.totalRow]}>
                  <Text style={stylesCOP.serialNoCellDetail}></Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                    ]}
                  >
                    <Text>
                      Preliminary Expenses <br /> Yet to Be Written Off
                    </Text>
                  </Text>

                  {labels.map((_, localIdx) => (
                    <Text
                      key={`prelim-${localIdx}`}
                      style={[stylesCOP.particularsCellsDetail, styleExpenses.fontSmall]}
                    >
                      {formatNumber(
                        preliminaryExpenseBalanceSheet?.[globalIndex(localIdx)] || 0
                      )}
                    </Text>
                  ))}
                </View>
              )}

              {/* total assets */}
              <View style={[stylesMOF.row, styles.tableRow, styles.Total]}>
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
                    key={`tassets-${localIdx}`}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styles.boldText,
                      {
                        fontSize: "9px",
                        borderTopWidth: "2px",
                        borderBottomWidth: "2px",
                        paddingVertical: "8px",
                      },
                    ]}
                  >
                    {formatNumber(totalAssetsArray?.[globalIndex(localIdx)] || 0)}
                  </Text>
                ))}
              </View>
            </View>
          </View>

          {/* disclaimer */}
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
                Guidance and assistance have been provided for the preparation
                of these financial statements on the specific request of the
                promoter for the purpose of availing finance for the business.
                These financial statements are based on realistic market
                assumptions, proposed estimates issued by an approved valuer,
                details provided by the promoter, and rates prevailing in the
                market. Based on the examination of the evidence supporting
                the assumptions, nothing has come to attention that causes any
                belief that the assumptions do not provide a reasonable basis
                for the forecast. These financials do not vouch for the
                accuracy of the same, as actual results are likely to be
                different from the forecast since anticipated events might not
                occur as expected, and the variation might be material.
              </Text>
            ) : null}
          </View>

          {/* footer */}
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
              {formData?.ProjectReportSetting?.CAName?.value ? (
                <Text style={[styles.caName, { fontSize: "10px", fontWeight: "bold" }]}>
                  CA {formData?.ProjectReportSetting?.CAName?.value}
                </Text>
              ) : null}

              {formData?.ProjectReportSetting?.MembershipNumber?.value ? (
                <Text style={[styles.membershipNumber, { fontSize: "10px" }]}>
                  M. No.: {formData?.ProjectReportSetting?.MembershipNumber?.value}
                </Text>
              ) : null}

              {formData?.ProjectReportSetting?.UDINNumber?.value ? (
                <Text style={[styles.udinNumber, { fontSize: "10px" }]}>
                  UDIN: {formData?.ProjectReportSetting?.UDINNumber?.value}
                </Text>
              ) : null}

              {formData?.ProjectReportSetting?.MobileNumber?.value ? (
                <Text style={[styles.mobileNumber, { fontSize: "10px" }]}>
                  Mob. No.: {formData?.ProjectReportSetting?.MobileNumber?.value}
                </Text>
              ) : null}
            </View>

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
        </View>
      </PageWithFooter>
    );
  });
}


  return (
    <PageWithFooter size="A4" orientation={orientation} style={pageStyles.page}>
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

  <View style={pageStyles.safeArea}>
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
            <Text>Projected Balance Sheet</Text>
          </View>
          <View style={[styles.table,]}>
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

            {/* Liabilities */}
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  styles.Total,
                  { paddingVertical: "10px" },
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
                  { paddingVertical: "10px" },
                ]}
              >
                Liabilities
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

            {/* 1 capital */}
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text style={stylesCOP.serialNoCellDetail}>1</Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                ]}
              >
                Capital
              </Text>

              {Array.from({ length: projectionYears }).map((_, index) => (
                <Text
                  key={index}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                  ]}
                >
                  {formatNumber(formData?.MeansOfFinance?.totalPC || 0)}
                </Text>
              ))}
            </View>

            {/* 2 Reserves and Surplus  */}
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text style={stylesCOP.serialNoCellDetail}>2</Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                ]}
              >
                Reserves and Surplus
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
                    {formatNumber(reverseAndSurplus[idx] || 0)}
                  </Text>
                );
              })}
            </View>

            {/* 3 Bank Loan - Term Loan */}
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text style={stylesCOP.serialNoCellDetail}>3</Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                ]}
              >
                Bank Loan - Term Loan
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
                    {formatNumber(bankTermLoanArr[idx] || 0)}
                  </Text>
                );
              })}
            </View>

            {/* Bank Loan Payable within next 12 months   */}
            <View style={[styles.tableRow, styles.totalRow]}>
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
                  {},
                ]}
              >
                Bank Loan Payable within next 12 months
              </Text>
              {/* ✅ Display Precomputed Total Direct Expenses */}
              {yearLabels.map((label, idx) => {
                return (
                  <Text
                    key={idx}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                    ]}
                  >
                    {formatNumber(bankLoanPayablewithin12months[idx] || 0)}
                  </Text>
                );
              })}
            </View>

            {/* Bank Loan - Working Capital Loan   */}
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  styleExpenses.sno,
                  styleExpenses.bordernone,
                ]}
              >
                5
              </Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                  {},
                ]}
              >
                Bank Loan - Working Capital Loan
              </Text>
              {/* ✅ Display Precomputed Total Direct Expenses */}
              {yearLabels.map((label, idx) => {
                return (
                  <Text
                    key={idx}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                    ]}
                  >
                    {formatNumber(workingCapitalLoanArr[idx] || 0)}
                  </Text>
                );
              })}
            </View>

            {/* current liabilities array  */}
            {currentLiabilities
              .filter((liabilities) =>
                liabilities.years.some((value) => Number(value) !== 0)
              )
              .map((liabilities, idx) => {
                let cumulative = 0;

                return (
                  <View style={styles.tableRow} key={idx}>
                    <Text
                      style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}
                    >
                      {(idx += 6)}
                    </Text>

                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      {liabilities.particular}
                    </Text>

                    {Array.from({ length: projectionYears }).map(
                      (_, yearIndex) => {
                        const value = Number(liabilities.years[yearIndex]) || 0;
                        cumulative += value;

                        return (
                          <Text
                            key={yearIndex}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(cumulative)}
                          </Text>
                        );
                      }
                    )}
                  </View>
                );
              })}

            {/* total */}
            <View style={[stylesMOF.row, styles.tableRow, styles.Total]}>
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
                Total
              </Text>

              {/* ✅ Display Precomputed Gross Profit Values */}
              {totalLiabilitiesArray.map((total, index) => (
                <Text
                  key={index}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styles.boldText,
                    {
                      fontSize: "9px",
                      borderTopWidth: "2px",
                      borderBottomWidth: "2px",
                      paddingVertical: "8px",
                    },
                  ]}
                >
                  {formatNumber(total)} {/* ✅ Display Correct Total */}
                </Text>
              ))}
            </View>

            {/* assets */}
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
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
                  styles.Total,
                  { paddingVertical: "10px" },
                ]}
              >
                Assets
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

            {/* Fixed Assets */}
            <View style={[styles.tableRow]}>
              <Text style={stylesCOP.serialNoCellDetail}>1</Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                ]}
              >
                Fixed Assets
              </Text>

              {/* ✅ Display Precomputed Gross Profit Values */}
              {yearLabels.map((label, idx) => {
                return (
                  <Text
                    key={idx}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                    ]}
                  >
                    {formatNumber(grossFixedAssetsPerYear[idx] || 0)}
                  </Text>
                );
              })}
            </View>

            {/* Depreciation */}
            <View style={[styles.tableRow]}>
              <Text style={stylesCOP.serialNoCellDetail}>2</Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                ]}
              >
                Less: Depreciation
              </Text>

              {/* ✅ Display Precomputed Gross Profit Values */}
              {totalDepreciation.map((val, idx) => (
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

            {/* Net Fixed Assets */}
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
                Net Fixed Assets
              </Text>

              {/* ✅ Display Precomputed Gross Profit Values */}
              {netBlock.map((val, idx) => (
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

            {/* Cash & Cash Equivalents */}
            <View style={[styles.tableRow]}>
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  styleExpenses.sno,
                  styleExpenses.bordernone,
                  {},
                ]}
              >
                4
              </Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                  {},
                ]}
              >
                Cash & Cash Equivalents
              </Text>

              {/* ✅ Display Precomputed Gross Profit Values */}
              {closingCashBalanceArray.map((val, idx) => (
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

            {/* Inventory */}
            {!isInventoryZero && (
              <View style={[styles.tableRow]}>
                <Text
                  style={[
                    stylesCOP.serialNoCellDetail,
                    styleExpenses.sno,
                    styleExpenses.bordernone,
                    {},
                  ]}
                >
                  5
                </Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                    {},
                  ]}
                >
                  Inventory
                </Text>

                {Array.from({
                  length: formData.ProjectReportSetting.ProjectionYears,
                }).map((_, yearIndex) => {
                  const inventorymap = inventory[yearIndex] || 0;

                  return (
                    <Text
                      key={yearIndex}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                      ]}
                    >
                      {formatNumber(inventorymap)}
                    </Text>
                  );
                })}
              </View>
            )}

            {/* ✅ Current Assets from More Details */}
            {formData?.MoreDetails?.currentAssets
              ?.filter(
                (assets) =>
                  assets.particular !== "Inventory" &&
                  !assets.dontSendToBS &&
                  assets.years.some((value) => Number(value) !== 0)
              )
              .map((assets, index) => {
                const serialNumber = isInventoryZero ? index + 5 : index + 6;
                let cumulative = 0;

                return (
                  <View style={styles.tableRow} key={index}>
                    {/* Serial Number */}
                    <Text
                      style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}
                    >
                      {isInventoryZero ? (index += 5) : (index += 6)}
                    </Text>

                    {/* Particular */}
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      {assets.particular}
                    </Text>

                    {/* Cumulative Year-wise Values */}
                    {Array.from({ length: projectionYears }).map(
                      (_, yearIndex) => {
                        const value = Number(assets.years[yearIndex] || 0);
                        cumulative += value; // 🧮 accumulate value
                        return (
                          <Text
                            key={yearIndex}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(cumulative)}
                          </Text>
                        );
                      }
                    )}
                  </View>
                );
              })}

            {/* preliminary expense */}
            {!isPreliminaryWriteOffAllZero && (
              <View style={[styles.tableRow, styles.totalRow]}>
                <Text style={stylesCOP.serialNoCellDetail}>
                  {/* {preliminarySerialNo} */}
                </Text>

                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  <Text>
                    Preliminary Expenses <br /> Yet to Be Written Off
                  </Text>
                </Text>

                {preliminaryExpenseBalanceSheet.map((value, yearIndex) => (
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

            {/* total assets*/}
            <View style={[stylesMOF.row, styles.tableRow, styles.Total]}>
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
                Total
              </Text>

              {/* ✅ Display Precomputed Gross Profit Values */}
              {totalAssetsArray.map((total, index) => (
                <Text
                  key={index}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styles.boldText,
                    {
                      fontSize: "9px",
                      borderTopWidth: "2px",
                      borderBottomWidth: "2px",
                      paddingVertical: "8px",
                    },
                  ]}
                >
                  {formatNumber(total)} {/* ✅ Display Correct Total */}
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
      </View>
    </PageWithFooter>
  );
};

export default React.memo(CMABalanceSheetMenu);
