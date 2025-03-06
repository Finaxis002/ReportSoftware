import React, { useEffect, useState, useRef } from "react";
import { Page, View, Text } from "@react-pdf/renderer";
import { styles, stylesCOP, stylesMOF, styleExpenses } from "../PDFComponents/Styles";
import { Font } from "@react-pdf/renderer";

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

const CheckBS = ({
  formData = {},
  calculations = {},
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

  const totalLiabilitiesArray = Array.from({ length: projectionYears }).map(
    (_, index) => {
      const capital = Number(formData?.MeansOfFinance?.totalPC || 0);

      const reservesAndSurplus = Math.max(
        receivedCummulativeTansferedData?.cumulativeBalanceTransferred?.[
          index
        ] || 0,
        0
      );

      const termLoan = Number(receivedMarchClosingBalances?.[index] || 0);

      // ✅ Ensure correct bankLoanPayableWithinNext12Months mapping
      const mappedIndex = index + 1; // Shift to next year's value
      let bankLoanPayableWithinNext12Months =
        mappedIndex < projectionYears
          ? Math.round(yearlyPrincipalRepayment[mappedIndex] || 0)
          : 0; // ✅ Set last year's value to 0

      const workingCapitalLoan = Number(
        cumulativeLoanForPreviousYears?.[index] || 0
      );

      // ✅ Calculate current liabilities for the year and accumulate
      const currentYearLiabilities = (
        formData?.MoreDetails?.currentLiabilities ?? []
      ).reduce(
        (total, liabilities) => total + Number(liabilities.years?.[index] || 0),
        0
      );

      cumulativeAdditionalLiabilities += currentYearLiabilities; // ✅ Keep cumulative sum

      // ✅ Compute the final total liabilities for the year
      const totalForYear =
        capital +
        reservesAndSurplus +
        termLoan +
        bankLoanPayableWithinNext12Months +
        workingCapitalLoan +
        cumulativeAdditionalLiabilities;

      // console.log(`Year ${index + 1}:`);
      // console.log(`  - Capital: ${capital}`);
      // console.log(`  - Reserves & Surplus: ${reservesAndSurplus}`);
      // console.log(`  - Term Loan: ${termLoan}`);
      // console.log(`  - Bank Loan Payable Next 12 Months: ${bankLoanPayableWithinNext12Months}`);
      // console.log(`  - Working Capital Loan: ${workingCapitalLoan}`);
      // console.log(`  - Current Year Liabilities: ${currentYearLiabilities}`);
      // console.log(`  - Cumulative Liabilities: ${cumulativeAdditionalLiabilities}`);
      // console.log(`  - Total Liabilities: ${totalForYear}`);

      return totalForYear;
    }
  );

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
      ? Math.round(yearlyPrincipalRepayment[mappedIndex] || 0) // ✅ Fetch next year's value
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
      orientation={projectionYears > 7 ? "landscape" : "portrait"}
      wrap={false}
      break
      style={[{ padding: "20px" }]}
    >
      <View style={[styleExpenses.paddingx]}>

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
                { textAlign: "center" },
              ]}
            >
              S. No.
            </Text>
            <Text style={[styles.detailsCell, styleExpenses.particularWidth]}>
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
            <View style={[stylesMOF.row, styleExpenses.headerRow]}>
              <Text style={[styleExpenses.sno]}>A</Text>
              <Text style={stylesMOF.cell}>Liabilities</Text>
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
                    adjustedAmount - Math.floor(adjustedAmount) <= 0.5
                      ? Math.floor(adjustedAmount) // Round down if decimal part is ≤ 0.5
                      : Math.ceil(adjustedAmount); // Round up if decimal part is > 0.5

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
                const balance = receivedMarchClosingBalances?.[index] || 0; // Use 0 if value is unavailable
                return (
                  <Text
                    key={index}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                    ]}
                  >
                    {formatNumber(balance)}
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
            {formData?.MoreDetails?.currentLiabilities?.map(
              (liabilities, idx) => {
                let cumulativeSum = 0; // Initialize cumulative sum

                return (
                  <View style={styles.tableRow} key={idx}>
                    <Text
                      style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}
                    >
                      {idx + 6}
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
                        // Apply cumulative rule
                        cumulativeSum +=
                          Number(liabilities.years[yearIndex]) || 0;

                        return (
                          <Text
                            key={yearIndex}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(cumulativeSum)}
                          </Text>
                        );
                      }
                    )}
                  </View>
                );
              }
            )}

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
                  {formatNumber(Math.round(total))}{" "}
                  {/* ✅ Display Correct Total */}
                </Text>
              ))}
            </View>
          </View>

          {/* Assets Section */}

          <View>
            <View style={[stylesMOF.row, styleExpenses.headerRow]}>
              <Text style={[styleExpenses.sno]}>B</Text>
              <Text style={stylesMOF.cell}>Assests</Text>
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
                  {value.toLocaleString("en-IN")}
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
                  {value.toLocaleString("en-IN")}
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
                  {balance ? balance.toLocaleString("en-IN") : "0"}
                </Text>
              ))}
            </View>

            {/* Current Assets from More Details */}
            {formData?.MoreDetails?.currentAssets?.map((assets, index) => {
              let cumulativeSum = 0; // Initialize cumulative sum

              return (
                <View style={styles.tableRow} key={index}>
                  {/* Serial No */}
                  <Text
                    style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}
                  >
                    {index + 6}
                  </Text>

                  {/* Particular Name */}
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                    ]}
                  >
                    {assets.particular}
                  </Text>

                  {/* Ensure Projection Years Match */}
                  {Array.from({ length: projectionYears }).map(
                    (_, yearIndex) => {
                      // Apply cumulative rule
                      cumulativeSum += Number(assets.years[yearIndex]) || 0;

                      return (
                        <Text
                          key={yearIndex}
                          style={[
                            stylesCOP.particularsCellsDetail,
                            styleExpenses.fontSmall,
                          ]}
                        >
                          {formatNumber(cumulativeSum)}
                        </Text>
                      );
                    }
                  )}
                </View>
              );
            })}

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
                  {formatNumber(Math.round(total))}
                </Text>
              ))}
            </View>
          </View>
        </View>

       
      </View>
    </Page>
  );
};

export default React.memo(CheckBS);
