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
}) => {
  // console.log("receivedData:", receivedWorkingCapitalValues);

  const [grossFixedAssets, setGrossFixedAssets] = useState(0);

  // Update the state when the prop value changes
  useEffect(() => {
    if (firstYearGrossFixedAssets > 0) {
      setGrossFixedAssets(firstYearGrossFixedAssets);
    }
  }, [firstYearGrossFixedAssets]);

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

  const totalAssetArray = Array.from({ length: projectionYears }).map(
    (_, index) => {
      const netFixedAssetValue = computedNetFixedAssets[index] || 0; // Use computed values directly
      const cashEquivalent = closingCashBalanceArray[index] || 0; // Use closing cash balance

      // ✅ Include Current Assets from `MoreDetails.currentAssets` with cumulative rule
      const currentYearAssets = formData?.MoreDetails?.currentAssets?.reduce(
        (total, assets) => total + Number(assets.years[index] || 0),
        0
      );

      cumulativeCurrentAssets += currentYearAssets; // Apply cumulative rule

      // ✅ Compute the Correct Total Assets
      return netFixedAssetValue + cashEquivalent + cumulativeCurrentAssets; // Use cumulative total for assets
    }
  );

  const repaymentValueswithin12months = Array.from({
    length: formData.ProjectReportSetting.ProjectionYears || 0,
  }).map((_, index) => {
    let mappedIndex = index + 1; // ✅ Shift to next year

    return mappedIndex < formData.ProjectReportSetting.ProjectionYears
      ? yearlyPrincipalRepayment[mappedIndex] || 0 // ✅ Fetch next year's value
      : 0; // ✅ Ensure last year's value is explicitly set to 0
  });

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
      )
        .filter(
          (liabilitie) =>
            liabilitie.particular !==
            "Quasi Equity (Important to set Current Ratio)"
        )
        .reduce(
          (total, liabilities) =>
            total + Number(liabilities.years?.[yearIndex] || 0),
          0
        );

      // ✅ Accumulate current liabilities over years
      cumulativeCurrentLiabilities += currentYearLiabilities;

      // ✅ Calculate total liabilities for the year
      const totalForYear =
        repayment + workingCapitalLoan + cumulativeCurrentLiabilities;

      // console.log(`Year ${yearIndex + 1}:`);
      // console.log(`  - Bank Loan Payable: ${repayment}`);
      // console.log(`  - Working Capital Loan: ${workingCapitalLoan}`);
      // console.log(`  - Current Year Liabilities: ${currentYearLiabilities}`);
      // console.log(`  - Cumulative Current Liabilities: ${cumulativeCurrentLiabilities}`);
      // console.log(`  - Total Liabilities: ${totalForYear}`);

      return totalForYear;
    }
  );

  const totalLiabilitiesArray = Array.from({ length: projectionYears }).map(
    (_, index) => {
      const capital = Number(formData?.MeansOfFinance?.totalPC || 0);
  
      const reservesAndSurplus = Math.max(
        receivedCummulativeTansferedData?.cumulativeBalanceTransferred?.[index] || 0,
        0
      );
  
      const marchBalance = Number(receivedMarchClosingBalances?.[index] || 0);
      const repaymentWithin12Months = Number(repaymentValueswithin12months?.[index] || 0);
      const termLoan = marchBalance - repaymentWithin12Months;
  
      const mappedIndex = index + 1;
      const bankLoanPayableWithinNext12Months =
        mappedIndex < projectionYears
          ? yearlyPrincipalRepayment[mappedIndex] || 0
          : 0;
  
      const workingCapitalLoan = Number(cumulativeLoanForPreviousYears?.[index] || 0);
  
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

  return (
    <Page
      size={projectionYears > 12 ? "A3" : "A4"}
      orientation={projectionYears > 6 ? "landscape" : "portrait"}
      wrap={false}
      break
      style={[{ padding: "20px" }]}
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

        <View style={[styles.table]}>
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
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  {
                    paddingVertical: "10px",
                    fontFamily: "Roboto",
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
                    fontFamily: "Roboto",
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
                1
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
                2
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
                  const roundedValue =
                    adjustedAmount 

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
            <View style={styles.tableRow}>
              <Text style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}>
                3
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
                const marchBalance = receivedMarchClosingBalances?.[index] || 0;
                const repaymentValue =
                  repaymentValueswithin12months?.[index] || 0;
                const netBalance = marchBalance - repaymentValue;

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

            {/* Bank Loan Payable within next 12 months */}
            <View style={styles.tableRow}>
              <Text style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}>
                4
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

              {repaymentValueswithin12months.map((value, index) => (
                <Text
                  key={index}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                  ]}
                >
                  {formatNumber(value)} {/* Format and display the value */}
                </Text>
              ))}
            </View>

            {/* Bank Loan - Working Capital Loan */}
            <View style={styles.tableRow}>
              <Text style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}>
                5
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

            {/* Liabilities from More Details dynamically aligned with projectionYears */}
            {formData?.MoreDetails?.currentLiabilities
              ?.filter((liabilities) =>
                // ✅ Filter out rows where all year values are zero
                liabilities.years.every((value) => Number(value) === 0)
                  ? false
                  : true
              )
              .map((liabilities, idx) => (
                <View style={styles.tableRow} key={idx}>
                  {/* ✅ Adjust Serial Number after filtering */}
                  <Text
                    style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}
                  >
                    {idx + 5}
                  </Text>

                  {/* ✅ Liabilities Name */}
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                    ]}
                  >
                    {liabilities.particular}
                  </Text>

                  {/* ✅ Loop through Projection Years */}
                  {Array.from({ length: projectionYears }).map(
                    (_, yearIndex) => (
                      <Text
                        key={yearIndex}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                        ]}
                      >
                        {formatNumber(liabilities.years[yearIndex] || "0")}
                      </Text>
                    )
                  )}
                </View>
              ))}

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
                    fontFamily: "Roboto",
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
                      fontFamily: "Roboto",
                      fontWeight: "extrabold",
                      paddingVertical: "8px",
                    },
                  ]}
                >
                  {formatNumber(total)}{" "}
                  {/* ✅ Display Correct Total */}
                </Text>
              ))}
            </View>
          </View>

          {/* Assets Section */}

          <View>
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  {
                    paddingVertical: "10px",
                    fontFamily: "Roboto",
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
                    fontFamily: "Roboto",
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
            <View style={styles.tableRow}>
              <Text style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}>
                1
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

            {/* Less:Depreciation */}
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}>
                2
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

            {/*  Net fixed assets */}
            <View style={[styles.tableRow, styles.totalRow]}>
              {/* Serial Number */}
              <Text style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}>
                3
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

            {/*  Cash & Cash Equivalents  */}
            <View style={styles.tableRow}>
              <Text style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}>
                4
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

            {/* ✅ Current Assets from More Details */}
            {formData?.MoreDetails?.currentAssets
              ?.filter((assets) =>
                // ✅ Filter out rows where all year values are zero
                assets.years.every((value) => Number(value) === 0)
                  ? false
                  : true
              )
              .map((assets, index) => (
                <View style={styles.tableRow} key={index}>
                  {/* ✅ Adjust Serial Number after filtering */}
                  <Text
                    style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}
                  >
                    {index + 6}
                  </Text>

                  {/* ✅ Particular Name */}
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                    ]}
                  >
                    {assets.particular}
                  </Text>

                  {/* ✅ Ensure Projection Years Match */}
                  {Array.from({ length: projectionYears }).map(
                    (_, yearIndex) => (
                      <Text
                        key={yearIndex}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                        ]}
                      >
                        {formatNumber(assets.years[yearIndex] ?? 0)}{" "}
                        {/* Fill missing values with 0 */}
                      </Text>
                    )
                  )}
                </View>
              ))}

            {/* Total assets Calculation */}
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
                    fontFamily: "Roboto",
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
                      fontFamily: "Roboto",
                      fontWeight: "extrabold",
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
        {formData?.ProjectReportSetting?.CAName?.value ?(<Text
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
            proposed estimates issued by an approved valuer, details provided by
            the promoter, and rates prevailing in the market. Based on the
            examination of the evidence supporting the assumptions, nothing has
            come to attention that causes any belief that the assumptions do not
            provide a reasonable basis for the forecast. These financials do not
            vouch for the accuracy of the same, as actual results are likely to
            be different from the forecast since anticipated events might not
            occur as expected, and the variation might be material.
          </Text>): null}

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
                    fontFamily: "Roboto",
                    fontWeight: "bold",
                  },
                ]}
              >
                CA {formData?.ProjectReportSetting?.CAName?.value}
              </Text>
            ) : null}

            {/* ✅ Membership Number (Conditional Display) */}
            {formData?.ProjectReportSetting?.MembershipNumber?.value ? (
              <Text
                style={[
                  styles.membershipNumber,
                  { fontSize: "10px", fontFamily: "Roboto" },
                ]}
              >
                M. No.:{" "}
                {formData?.ProjectReportSetting?.MembershipNumber?.value}
              </Text>
            ) : null}

            {/* ✅ UDIN Number (Conditional Display) */}
            {formData?.ProjectReportSetting?.UDINNumber?.value ? (
              <Text
                style={[
                  styles.udinNumber,
                  { fontSize: "10px", fontFamily: "Roboto" },
                ]}
              >
                UDIN: {formData?.ProjectReportSetting?.UDINNumber?.value}
              </Text>
            ) : null}

            {/* ✅ Mobile Number (Conditional Display) */}
            {formData?.ProjectReportSetting?.MobileNumber?.value ? (
              <Text
                style={[
                  styles.mobileNumber,
                  { fontSize: "10px", fontFamily: "Roboto" },
                ]}
              >
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
