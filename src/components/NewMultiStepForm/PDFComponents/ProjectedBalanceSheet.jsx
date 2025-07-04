import React, { useEffect, useState, useRef } from "react";
import { Page, View, Text, Image } from "@react-pdf/renderer";
import { styles, stylesCOP, stylesMOF, styleExpenses } from "./Styles";
import { Font } from "@react-pdf/renderer";
import SAWatermark from "../Assets/SAWatermark";
import CAWatermark from "../Assets/CAWatermark";

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

const ProjectedBalanceSheet = ({
  formData = {},
  pdfType,
  totalDepreciationPerYear = [],
  grossFixedAssetsPerYear = [],
  yearlyPrincipalRepayment = [],
  yearlyInterestLiabilities = [],
  firstYearGrossFixedAssets,
  financialYearLabels,
  receivedCummulativeTansferedData,
  receivedMarchClosingBalances,
  receivedWorkingCapitalValues,
  closingCashBalanceArray = [],
  onTotalLiabilitiesSend = [],
  formatNumber,
  orientation,
  receivedtotalRevenueReceipts,
}) => {
  // console.log("receivedData:", receivedWorkingCapitalValues);

  const [grossFixedAssets, setGrossFixedAssets] = useState(0);

  // Update the state when the prop value changes
  useEffect(() => {
    if (firstYearGrossFixedAssets > 0) {
      setGrossFixedAssets(firstYearGrossFixedAssets);
    }
  }, [firstYearGrossFixedAssets]);

  useEffect(() => {
    if (yearlyInterestLiabilities.length > 0) {
      //  console.log("✅ Updated Yearly Interest Liabilities in State:", yearlyInterestLiabilities);
    }
  }, [yearlyInterestLiabilities]); // ✅ Runs when state update

  const projectionYears =
    Number(formData?.ProjectReportSetting?.ProjectionYears) || 5;

  const rateOfInterest =
    Number(formData?.ProjectReportSetting?.rateOfInterest) || 5;

  // If it's undefined, default to an empty array.
  const { termLoanValues = [] } = receivedWorkingCapitalValues || {};

  // Convert string values to numbers, if needed:
  const numericTermLoanValues = termLoanValues.map((val) => Number(val) || 0);

  // Now compute your cumulative array using numericTermLoanValues
  const cumulativeLoanForPreviousYears = numericTermLoanValues.reduce(
    (acc, currentValue, index) => {
      if (index === 0) {
        acc.push(currentValue);
      } else {
        acc.push(acc[index - 1] + currentValue);
      }
      return acc;
    },
    []
  );

  // Calculate if all values for the working capital loan are zero
  const isWorkingCapitalLoanZero = cumulativeLoanForPreviousYears.every(
    (loan) => loan === 0
  );

  // ✅ Compute Corrected Total Liabilities for Each Year
  let cumulativeAdditionalLiabilities = 0; // ✅ Initialize cumulative liabilities

  // console.log("Final Total Liabilities Array:", totalLiabilitiesArray);

  // ✅ Calculate Current Liabilities for Each Year
  const currentLiabilities = Array.from({
    length: formData.ProjectReportSetting.ProjectionYears || 0,
  }).map((_, index) => {
    const bankLoanNext12Months = yearlyPrincipalRepayment[index + 1] || 0; // Shift repayment from next year
    const workingCapitalLoan = cumulativeLoanForPreviousYears[index] || 0; // Fetch working capital loan

    return bankLoanNext12Months + workingCapitalLoan; // Sum of both loans for that year
  });

  // First, compute the arrays for Fixed Assets and Net Fixed Assets
  const computedFixedAssets = [];
  const computedNetFixedAssets = [];

  // For the first year, use the provided value
  computedFixedAssets[0] = grossFixedAssetsPerYear[0] || 0;
  computedNetFixedAssets[0] =
    computedFixedAssets[0] - (totalDepreciationPerYear[0] || 0);

  // For subsequent years, carry forward the net value as the new fixed asset value
  for (let i = 1; i < projectionYears; i++) {
    computedFixedAssets[i] = computedNetFixedAssets[i - 1];
    computedNetFixedAssets[i] =
      computedFixedAssets[i] - (totalDepreciationPerYear[i] || 0);
  }

  // ✅ Compute Corrected Total Assets for Each Year
  let cumulativeCurrentAssets = 0; // Initialize cumulative sum for current assets

  // const inventory = Array.from({
  //   length: formData.MoreDetails.OpeningStock.length,
  // }).map((_, yearIndex) => {
  //   const ClosingStock = formData?.MoreDetails?.ClosingStock?.[yearIndex] || 0;
  //   const finalStock = ClosingStock;

  //   return finalStock;
  // });

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

  // const writeOffStartIndex = skipfirstyear ? 1 : 0;
  const writeOffStartIndex = 0;
  const preliminaryWriteOffSteps = preliminaryWriteOffYears;

  const preliminaryWriteOffPerYear = Array.from({
    length: projectionYears,
  }).map((_, index) => {
    const relativeYear = index - writeOffStartIndex;

    if (
      index >= writeOffStartIndex &&
      relativeYear < preliminaryWriteOffSteps
    ) {
      // Calculate decreasing value
      return yearlyWriteOffAmount * (preliminaryWriteOffSteps - relativeYear);
    }

    return 0;
  });

  const preliminaryExpenseBalanceSheet = [];
for (let i = 0; i < projectionYears; i++) {
  if (i === 0) {
    preliminaryExpenseBalanceSheet[i] = Math.max(preliminaryExpensesTotal - yearlyWriteOffAmount, 0);
  } else {
    preliminaryExpenseBalanceSheet[i] = Math.max(preliminaryExpenseBalanceSheet[i - 1] - yearlyWriteOffAmount, 0);
  }
}

  const inventory = Array.from({
    length: formData.MoreDetails.OpeningStock.length,
  }).map((_, yearIndex) => {
    const ClosingStock = formData?.MoreDetails.ClosingStock?.[yearIndex] || 0;
    return ClosingStock;
  });

  // console.log("inventory in total assest", inventory);

  const totalAssetArray = Array.from({ length: projectionYears }).map(
    (_, index) => {
      const netFixedAssetValue = computedNetFixedAssets[index] || 0;
      const cashEquivalent = closingCashBalanceArray[index] || 0;

      const currentYearAssets = formData?.MoreDetails?.currentAssets
        ?.filter(
          (assets) => assets.particular !== "Inventory" && !assets.dontSendToBS
        )
        .reduce((total, assets) => total + Number(assets.years[index] || 0), 0);

      cumulativeCurrentAssets += currentYearAssets;

      const preliminaryAsset = preliminaryExpenseBalanceSheet[index] || 0; // ✅ NEW
console.log('preliminary Asset', preliminaryAsset)
      const totalAssets =
        netFixedAssetValue +
        cashEquivalent +
        cumulativeCurrentAssets +
        Number(inventory[index]) +
        preliminaryAsset; // ✅ INCLUDED

      return totalAssets;
    }
  );

  //  console.log("yearly principal repayment" , yearlyPrincipalRepayment)

  const repaymentValueswithin12months = yearlyPrincipalRepayment.slice(1);

  // console.log("repaymentValueswithin12months" , repaymentValueswithin12months)

  // ✅ Initialize cumulative liabilities
  let cumulativeCurrentLiabilities = 0;

  // ✅ Initialize array for storing total liabilities year-wise
  const yearlyTotalLiabilities = Array.from({ length: projectionYears }).map(
    (_, yearIndex) => {
      // ✅ Get repayment values for the year
      const repayment = Number(repaymentValueswithin12months?.[yearIndex]) || 0;

      // ✅ Get working capital loan for the year
      const workingCapitalLoan =
        Number(cumulativeLoanForPreviousYears?.[yearIndex]) || 0;

      // ✅ Compute current year liabilities and accumulate
      const currentYearLiabilities = (
        formData?.MoreDetails?.currentLiabilities ?? []
      ).reduce(
        (total, liabilities) =>
          total + Number(liabilities.years?.[yearIndex] || 0),
        0
      );

      // ✅ Accumulate current liabilities over years
      cumulativeCurrentLiabilities += currentYearLiabilities;

      // ✅ Calculate total liabilities for the year
      const totalForYear =
        repayment + workingCapitalLoan + cumulativeCurrentLiabilities;

      return totalForYear;
    }
  );

  const totalLiabilitiesArray = Array.from({ length: projectionYears }).map(
    (_, index) => {
      const capital = Number(formData?.MeansOfFinance?.totalPC || 0);

      const reservesAndSurplus = Math.max(
        receivedCummulativeTansferedData?.cumulativeBalanceTransferred?.[
          index
        ] || 0,
        0
      );

      const marchBalance = Number(receivedMarchClosingBalances?.[index] || 0);
      const repaymentWithin12 = yearlyPrincipalRepayment[index + 1] || 0; // Shift by 1
      // const termLoan = marchBalance - repaymentWithin12;
      const repaymentMonths = parseInt(
        formData?.ProjectReportSetting?.RepaymentMonths || "0",
        10
      );
      const termLoanAmount = Number(
        formData?.MeansOfFinance?.termLoan?.termLoan || 0
      );
      const termLoan =
        repaymentMonths === 0
          ? termLoanAmount
          : marchBalance - repaymentWithin12;

      const bankLoanPayableWithinNext12Months = repaymentWithin12;

      const workingCapitalLoan = Number(
        cumulativeLoanForPreviousYears?.[index] || 0
      );

      const currentYearLiabilities = (
        formData?.MoreDetails?.currentLiabilities ?? []
      ).reduce(
        (total, liabilities) => total + Number(liabilities.years?.[index] || 0),
        0
      );

      cumulativeAdditionalLiabilities += currentYearLiabilities;

      const totalForYear =
        capital +
        reservesAndSurplus +
        termLoan +
        bankLoanPayableWithinNext12Months +
        workingCapitalLoan +
        cumulativeAdditionalLiabilities;

      return totalForYear;
    }
  );

  // ✅ Log final yearly total liabilities array
  // console.log("Year-wise Total Liabilities:", yearlyTotalLiabilities);

  // ✅ Send Total Liabilities Data to Parent Component Only When Final
  useEffect(() => {
    if (totalLiabilitiesArray.length > 0) {
      onTotalLiabilitiesSend((prev) => ({
        ...prev,
        totalLiabilitiesArray,
        closingCashBalanceArray,
        currentLiabilities,
        yearlyTotalLiabilities,
        repaymentValueswithin12months,
      }));
    }
  }, [
    JSON.stringify(totalLiabilitiesArray),
    JSON.stringify(closingCashBalanceArray),
    JSON.stringify(currentLiabilities),
    JSON.stringify(yearlyTotalLiabilities),
    JSON.stringify(repaymentValueswithin12months),
  ]);

  // const isPreliminaryWriteOffAllZero = Array.from({
  //   length: projectionYears,
  // }).every((_, yearIndex) => {
  //   const adjustedYearIndex = yearIndex; // ✅ Fix index offset
  //   return preliminaryWriteOffPerYear[adjustedYearIndex] === 0;
  // });
  const isPreliminaryWriteOffAllZero = Array.from({
  length: projectionYears,
}).every((_, yearIndex) => preliminaryExpenseBalanceSheet[yearIndex] === 0);


  const visibleLiabilitiesCount =
    formData?.MoreDetails?.currentAssets?.filter(
      (liability) => !liability.years.every((value) => Number(value) === 0)
    )?.length || 0;
  const preliminarySerialNo = 6 + visibleLiabilitiesCount;

  const isInventoryZero = inventory.every((value) => value === 0);

  // Check if Bank Term Loan is zero for all years
  const isBankTermLoanZero = Array.from({ length: projectionYears }).every(
    (_, index) =>
      (index === 0
        ? parseFloat(formData?.MeansOfFinance?.termLoan?.termLoan || 0)
        : 0) === 0
  );

  // Check if Bank Term Loan Payable within next 12 months is zero for all years
  const isBankTermLoanPayableZero = repaymentValueswithin12months.every(
    (value) => value === 0
  );

  // Check if Fixed Assets are zero for all years
  const isFixedAssetsZero = computedFixedAssets.every((value) => value === 0);

  // Check if Depreciation is zero for all years
  const isDepreciationZero = totalDepreciationPerYear.every(
    (value) => value === 0
  );

  // Check if Net Fixed Assets are zero for all years
  const isNetFixedAssetsZero = computedNetFixedAssets.every(
    (value) => value === 0
  );

  // Simple counters for each section
  let liabilitiesSerial = 0;
  let assetsSerial = 0;

  const getNextLiabilitiesSerial = () => ++liabilitiesSerial;
  const getNextAssetsSerial = () => ++assetsSerial;

  // Reset counters before rendering each section
  const resetCounters = () => {
    liabilitiesSerial = 0;
    assetsSerial = 0;
  };
  // Initialize counters for each section
  // let liabilitiesSerial = 0;
  // let assetsSerial = 0;

  // const getNextLiabilitiesSerial = () => ++liabilitiesSerial;
  // const getNextAssetsSerial = () => ++assetsSerial;

  // Always visible rows (Capital, Reserves & Surplus)
  const capitalSerial = getNextLiabilitiesSerial();
  const reservesSerial = getNextLiabilitiesSerial();

  // Conditional rows for Liabilities
  const bankTermLoanSerial = !isBankTermLoanZero
    ? getNextLiabilitiesSerial()
    : null;
  const bankPayableSerial = !isBankTermLoanPayableZero
    ? getNextLiabilitiesSerial()
    : null;
  const workingCapitalSerial = !isWorkingCapitalLoanZero
    ? getNextLiabilitiesSerial()
    : null;

  // Always visible rows for Assets (Cash)
  const cashSerial = getNextAssetsSerial();

  // Conditional rows for Assets
  const fixedAssetsSerial = !isFixedAssetsZero ? getNextAssetsSerial() : null;
  const depreciationSerial = !isDepreciationZero ? getNextAssetsSerial() : null;
  const netFixedAssetsSerial = !isNetFixedAssetsZero
    ? getNextAssetsSerial()
    : null;
  const inventorySerial = !isInventoryZero ? getNextAssetsSerial() : null;

  return (
    <Page
      size={projectionYears > 12 ? "A3" : "A4"}
      orientation={orientation}
      wrap={false}
      break
      style={styles.page}
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
      <View style={[styleExpenses.paddingx]}>
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

        <View
          style={[stylesCOP.heading, { fontWeight: "bold", paddingLeft: 10 }]}
        >
          <Text>Projected Balance Sheet </Text>
        </View>

        <View style={[styles.table,{borderRightWidth:0}]}>
          {/* Header  */}
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
            {financialYearLabels.map((yearLabel, yearIndex) => (
              <Text
                key={yearIndex}
                style={[styles.particularsCell, stylesCOP.boldText]}
              >
                {yearLabel}
              </Text>
            ))}
          </View>

          {/* Liabilities Section */}

          <View>
            {resetCounters()}
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  {
                    paddingVertical: "10px",

                    fontWeight: "bold",
                  },
                ]}
              >
                A
              </Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                  {
                    paddingVertical: "10px",

                    fontWeight: "bold",
                  },
                ]}
              >
                Liabilities
              </Text>
              {Array.from({
                length: formData.ProjectReportSetting.ProjectionYears || 0,
              }).map((_, index) => (
                <Text
                  key={index}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                  ]}
                ></Text>
              ))}
            </View>

            {/* ✅ Capital */}
            <View style={styles.tableRow}>
              <Text style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}>
                {getNextLiabilitiesSerial()}
              </Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                ]}
              >
                Capital
              </Text>

              {/* ✅totalPC */}
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

            {/* Reserves & Surplus */}
            <View style={styles.tableRow}>
              <Text style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}>
                {getNextLiabilitiesSerial()}
              </Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                ]}
              >
                Reserves & Surplus
              </Text>
              {receivedCummulativeTansferedData?.cumulativeBalanceTransferred?.map(
                (amount, yearIndex) => {
                  // Convert negative values to 0 and round appropriately
                  const adjustedAmount = Math.max(amount, 0);
                  const roundedValue = adjustedAmount;

                  return (
                    <Text
                      key={`cumulativeBalance-${yearIndex}`}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                      ]}
                    >
                      {formatNumber(roundedValue)}
                    </Text>
                  );
                }
              )}
            </View>

            {/* Bank Loan - Term Loan */}
            {!isBankTermLoanZero && (
              <View style={styles.tableRow}>
                <Text style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}>
                  {getNextLiabilitiesSerial()}
                </Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  Bank Loan - Term Loan
                </Text>
                {Array.from({ length: projectionYears }).map((_, index) => {
                  const marchBalance =
                    receivedMarchClosingBalances?.[index] || 0;
                  const repaymentValue =
                    repaymentValueswithin12months?.[index] || 0;

                  // const netBalance = marchBalance - repaymentValue;
                  const repaymentMonths = parseInt(
                    formData?.ProjectReportSetting?.RepaymentMonths || "0",
                    10
                  );
                  const termLoanAmount = Number(
                    formData?.MeansOfFinance?.termLoan?.termLoan || 0
                  );

                  const netBalance =
                    repaymentMonths === 0
                      ? termLoanAmount
                      : marchBalance - repaymentValue;

                  return (
                    <Text
                      key={index}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                      ]}
                    >
                      {formatNumber(netBalance)} {/* ✅ Corrected this line */}
                    </Text>
                  );
                })}
              </View>
            )}

            {/* Bank Loan Payable within next 12 months */}
            {!isBankTermLoanPayableZero && (
              <View style={styles.tableRow}>
                <Text style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}>
                  {getNextLiabilitiesSerial()}
                </Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  Bank Loan Payable within next 12 months
                </Text>

                {Array.from({ length: projectionYears }).map((_, yearIndex) => (
                  <Text
                    key={yearIndex}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                    ]}
                  >
                    {formatNumber(
                      repaymentValueswithin12months[yearIndex] || 0
                    )}{" "}
                    {/* Default to 0 if no value exists */}
                  </Text>
                ))}
              </View>
            )}

            {/* Bank Loan - Working Capital Loan */}
            {!isWorkingCapitalLoanZero && (
              <View style={styles.tableRow}>
                <Text style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}>
                  {getNextLiabilitiesSerial()}
                </Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  Bank Loan - Working Capital Loan
                </Text>
                {/* Display the cumulative working capital loan for each year */}
                {cumulativeLoanForPreviousYears.map((loan, index) => (
                  <Text
                    key={index}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                    ]}
                  >
                    {formatNumber(loan)}
                  </Text>
                ))}
              </View>
            )}

            {/* Liabilities from More Details dynamically aligned with projectionYears */}
            {formData?.MoreDetails?.currentLiabilities
              ?.filter((liabilities) =>
                liabilities.years.some((value) => Number(value) !== 0)
              )
              .map((liabilities, idx) => {
                let cumulative = 0; // ⬅️ initialize cumulative tracker

                // Calculate the correct serial number
                // const serialNumber = isWorkingCapitalLoanZero
                //   ? idx + 5
                //   : idx + 6;

                return (
                  <View style={styles.tableRow} key={idx}>
                    {/* Serial Number */}
                    <Text
                      style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}
                    >
                      {getNextLiabilitiesSerial()}
                    </Text>

                    {/* Particular Name */}
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      {liabilities.particular}
                    </Text>

                    {/* Cumulative values */}
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

            {/* Total Liabilities Calculation */}
            <View
              style={[stylesMOF.row, styles.tableRow, styleExpenses.totalRow]}
            >
              <Text
                style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}
              ></Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  {
                    paddingVertical: "8px",

                    fontWeight: "bold",
                  },
                ]}
              >
                Total
              </Text>
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
          </View>

          {/* Assets Section */}

          <View>
            {resetCounters()}
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  {
                    paddingVertical: "10px",

                    fontWeight: "bold",
                  },
                ]}
              >
                B
              </Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                  {
                    paddingVertical: "10px",

                    fontWeight: "bold",
                  },
                ]}
              >
                Assests
              </Text>
              {Array.from({
                length: formData.ProjectReportSetting.ProjectionYears || 0,
              }).map((_, index) => (
                <Text
                  key={index}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                  ]}
                ></Text>
              ))}
            </View>

            {/* Fixed Assets */}
            {!isFixedAssetsZero && (
              <View style={styles.tableRow}>
                <Text style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}>
                  {getNextAssetsSerial()}
                </Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  Fixed Assets
                </Text>

                {computedFixedAssets.map((value, index) => (
                  <Text
                    key={index}
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

            {/* Less:Depreciation */}
            {!isDepreciationZero && (
              <View
                style={[
                  styles.tableRow,
                  styles.totalRow,
                  { borderBottomWidth: 1 },
                ]}
              >
                <Text style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}>
                  {getNextAssetsSerial()}
                </Text>

                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  Less:Depreciation
                </Text>

                {/* ✅ Display Principal Repayment Only for Projection Years */}

                {Array.from({ length: projectionYears }).map((_, index) => (
                  <Text
                    key={index}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                    ]}
                  >
                    {formatNumber(totalDepreciationPerYear[index] || "-")}
                  </Text>
                ))}
              </View>
            )}

            {/*  Net fixed assets */}
            {!isNetFixedAssetsZero && (
              <View style={[styles.tableRow, styles.totalRow]}>
                {/* Serial Number */}
                <Text style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}>
                  {getNextAssetsSerial()}
                </Text>

                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  Net fixed assets
                </Text>

                {/* Get total projection years */}

                {computedNetFixedAssets.map((value, index) => (
                  <Text
                    key={index}
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

            {/*  Cash & Cash Equivalents  */}
            <View style={styles.tableRow}>
              <Text style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}>
                {getNextAssetsSerial()}
              </Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                ]}
              >
                Cash & Cash Equivalents
              </Text>

              {closingCashBalanceArray.map((balance, index) => (
                <Text
                  key={index}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                  ]}
                >
                  {formatNumber(balance)}
                </Text>
              ))}
            </View>

            {/* inventory  */}
            {!isInventoryZero && (
              <View style={[styles.tableRow]}>
                <Text
                  style={[
                    stylesCOP.serialNoCellDetail,
                    styleExpenses.sno,
                    styleExpenses.bordernone,
                  ]}
                >
                  {getNextAssetsSerial()}
                </Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  Inventory
                </Text>

                {/* Render the incomeTaxCalculation values */}
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
                      {getNextAssetsSerial()}
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

            {/* ✅ Render Preliminary Row */}
            {!isPreliminaryWriteOffAllZero && (
              <View style={[styles.tableRow, styles.totalRow]}>
                <Text style={stylesCOP.serialNoCellDetail}>
                  {/* {preliminarySerialNo} */}
                  {getNextAssetsSerial()}
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

            {/* Total assets Calculation */}
            <View
              style={[stylesMOF.row, styles.tableRow, styleExpenses.totalRow , {borderBottomWidth:0}]}
            >
              <Text
                style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}
              ></Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  {
                    paddingVertical: "8px",
                    fontWeight: "bold",
                  },
                ]}
              >
                Total Assets
              </Text>
              {totalAssetArray.map((total, index) => (
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
                  {formatNumber(total)}
                </Text>
              ))}
            </View>
          </View>
        </View>

        {/* businees name and Client Name  */}
        {/* <View
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
        </View> */}

        <view>
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
        </view>

        <View
          style={[
            {
              display: "flex",
              flexDirection: "row", // ✅ Change to row
              justifyContent: "space-between", // ✅ Align items left and right
              alignItems: "flex-start",
              marginTop: 60,
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
                  {
                    fontSize: "10px",

                    fontWeight: "bold",
                  },
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
        </View>
      </View>
    </Page>
  );
};

export default React.memo(ProjectedBalanceSheet);
