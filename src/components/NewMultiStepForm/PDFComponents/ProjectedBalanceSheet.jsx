import React, { useEffect, useState, useRef } from "react";
import { Page, View, Text } from "@react-pdf/renderer";
import { styles, stylesCOP, stylesMOF, styleExpenses } from "./Styles";
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

const ProjectedBalanceSheet = ({
  formData = {},
  calculations = {},
  totalDepreciationPerYear = [],
  netProfitBeforeTax = [],
  grossProfitValues = [],
  yearlyPrincipalRepayment = [],
  yearlyInterestLiabilities = [],
  firstYearGrossFixedAssets,
  financialYearLabels,
  receivedCummulativeTansferedData,
  receivedMarchClosingBalances,
  receivedWorkingCapitalValues,
}) => {
  console.log("receivedData:", receivedWorkingCapitalValues);
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

  if (
    !formData ||
    typeof formData !== "object" ||
    !calculations ||
    typeof calculations !== "object"
  ) {
    console.error("❌ Invalid formData or calculations provided");
    return null;
  }

  const projectionYears =
    Number(formData?.ProjectReportSetting?.ProjectionYears) || 5;

  // ✅ Safe Helper Function to Format Numbers Based on Selected Format
  const formatNumber = (value) => {
    const formatType = formData?.ProjectReportSetting?.Format || "1"; // Default to Indian Format
    if (value === undefined || value === null || isNaN(value)) return "0"; // ✅ Handle invalid values

    switch (formatType) {
      case "1":
        return new Intl.NumberFormat("en-IN").format(value); // Indian Format
      case "2":
        return new Intl.NumberFormat("en-US").format(value); // USD Format
      default:
        return new Intl.NumberFormat("en-IN").format(value); // ✅ Safe default
    }
  };

  const rateOfInterest =
    Number(formData?.ProjectReportSetting?.rateOfInterest) || 5;

  const incomeTax =
    Array.isArray(netProfitBeforeTax) && netProfitBeforeTax.length > 0
      ? netProfitBeforeTax.map((npbt) =>
          npbt ? Math.round(npbt * (rateOfInterest / 100)) : "0.00"
        )
      : [];

  // ✅ Compute Total Sources for Each Year
  const totalSourcesArray = Array.from({ length: projectionYears }).map(
    (_, index) => {
      const netProfitBeforeInterestAndTaxes = Number(
        calculations?.sources?.NetProfitBeforeInterestAndTaxes?.[index] || 0
      );

      const promoterContribution =
        index === 0
          ? Number(
              formData?.MeansOfFinance?.workingCapital?.promoterContribution ||
                0
            )
          : 0;

      const termLoan =
        index === 0
          ? Number(formData?.MeansOfFinance?.termLoan?.termLoan || 0)
          : 0;

      const workingCapitalLoan =
        index === 0
          ? Number(formData?.MeansOfFinance?.workingCapital?.termLoan || 0)
          : 0;

      const depreciation = Number(totalDepreciationPerYear?.[index] || 0);

      return (
        netProfitBeforeInterestAndTaxes +
        promoterContribution +
        termLoan +
        workingCapitalLoan +
        depreciation
      );
    }
  );

  // ✅ Compute Total Uses for Each Year
  const totalUsesArray = Array.from({ length: projectionYears }).map(
    (_, index) => {
      const fixedAssets = Number(grossProfitValues[index] || 0);
      const repaymentOfLoan = Number(yearlyPrincipalRepayment[index] || 0);
      const interestOnTermLoan = Number(yearlyInterestLiabilities[index] || 0);
      const withdrawals = Number(
        formData.MoreDetails?.withdrawals?.[index] || 0
      );
      const incomeTaxValue = Number(incomeTax[index] || 0);

      return (
        fixedAssets +
        repaymentOfLoan +
        interestOnTermLoan +
        withdrawals +
        incomeTaxValue
      );
    }
  );

  // ✅ Initial Opening Cash Balance
  let openingCashBalance = 0;

  // ✅ Compute Cash Flow Balances
  const cashBalances = Array.from({ length: projectionYears }).map(
    (_, index) => {
      const totalSources = totalSourcesArray[index] || 0;
      const totalUses = totalUsesArray[index] || 0;
      const surplusDuringYear = totalSources - totalUses;

      // ✅ Compute Closing Balance
      const closingCashBalance = openingCashBalance + surplusDuringYear;

      const result = {
        opening: openingCashBalance, // ✅ Carry forward previous year's closing balance
        surplus: surplusDuringYear,
        closing: closingCashBalance,
      };

      // ✅ Set next year's opening balance
      openingCashBalance = closingCashBalance;

      return result;
    }
  );

  // Compute cumulative loan values:
  // 1st Year: receivedWorkingCapitalValues[0]
  // 2nd Year: receivedWorkingCapitalValues[0] + receivedWorkingCapitalValues[1]
  // 3rd Year: receivedWorkingCapitalValues[0] + receivedWorkingCapitalValues[1] + receivedWorkingCapitalValues[2]
  // And so on...
  // Ensure it's an array; if not, default to an empty array


  
  console.log("receivedWorkingCapitalValues:", receivedWorkingCapitalValues);


  // Destructure termLoanValues from the object. 
// If it's undefined, default to an empty array.
const { termLoanValues = [] } = receivedWorkingCapitalValues || {};

// Convert string values to numbers, if needed:
const numericTermLoanValues = termLoanValues.map((val) => Number(val) || 0);

// Now compute your cumulative array using numericTermLoanValues
const cumulativeLoanForPreviousYears = numericTermLoanValues.reduce((acc, currentValue, index) => {
  if (index === 0) {
    acc.push(currentValue);
  } else {
    acc.push(acc[index - 1] + currentValue);
  }
  return acc;
}, []);




  

  return (
    <Page
      size={projectionYears > 12 ? "A3" : "A4"}
      orientation={projectionYears > 7 ? "landscape" : "portrait"}
    >
      <View style={[styleExpenses.paddingx]}>
        <Text style={[styles.clientName]}>
          {formData?.AccountInformation?.clientName || "N/A"}
        </Text>
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
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  styleExpenses.sno,
                  styleExpenses.bordernone,
                  { borderLeftWidth: "1px" },
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
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  styleExpenses.sno,
                  styleExpenses.bordernone,
                  { borderLeftWidth: "1px" },
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
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  styleExpenses.sno,
                  styleExpenses.bordernone,
                  { borderLeftWidth: "1px" },
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
                Bank Loan - Term Loan
              </Text>
              {receivedMarchClosingBalances &&
                receivedMarchClosingBalances
                  .slice(0, projectionYears)
                  .map((balance, index) => (
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

            {/*  Bank Loan Payable within next 12 months */}
            <View style={styles.tableRow}>
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  styleExpenses.sno,
                  styleExpenses.bordernone,
                  { borderLeftWidth: "1px" },
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
                Bank Loan Payable within next 12 months
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
                >
                  {formatNumber(
                    Math.round(yearlyPrincipalRepayment[index] || 0)
                  )}
                </Text>
              ))}
            </View>

            {/* Bank Loan - Working Capital Loan */}
            <View style={styles.tableRow}>
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  styleExpenses.sno,
                  styleExpenses.bordernone,
                  { borderLeftWidth: "1px" },
                ]}
              >
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

            {/* Total Sources Calculation */}
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
              {totalSourcesArray.map((total, index) => (
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
                  {/* ✅ Ensure Proper Formatting */}
                </Text>
              ))}
            </View>
          </View>

          {/* Assets Section */}

          <View>
            <View style={[stylesMOF.row, styleExpenses.headerRow]}>
              <Text style={[styleExpenses.sno]}>B</Text>
              <Text style={stylesMOF.cell}>Assets</Text>
            </View>

            {/* Fixed Assets */}
            <View style={styles.tableRow}>
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  styleExpenses.sno,
                  styleExpenses.bordernone,
                  { borderLeftWidth: "1px" },
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
                Fixed Assets
              </Text>

              {Array.from({ length: projectionYears }).map((_, index) => (
                <Text
                  key={index}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                  ]}
                >
                  {index === 0
                    ? firstYearGrossFixedAssets
                      ? firstYearGrossFixedAssets.toLocaleString("en-IN") // Format as Indian Numbering
                      : "-"
                    : "0"}
                </Text>
              ))}
            </View>

            {/* Repayment of Term Loan */}
            <View style={[styles.tableRow, styles.totalRow]}>
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
                Repayment of Term Loan
              </Text>

              {/* ✅ Display Principal Repayment Only for Projection Years */}
              {Array.from({
                length: formData.ProjectReportSetting.ProjectionYears || 0,
              }).map((_, index) => (
                <Text
                  key={index}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                  ]}
                >
                  {formatNumber(
                    Math.round(yearlyPrincipalRepayment[index] || 0)
                  )}
                </Text>
              ))}
            </View>

            {/* Interest On Term Loan */}
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
                Interest On Term Loan
              </Text>

              {/* Get total projection years */}
              {Array.from({
                length: formData?.ProjectReportSetting?.ProjectionYears || 0, // Ensure ProjectionYears is defined
              }).map((_, index) => (
                <Text
                  key={index}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                  ]}
                >
                  {formatNumber(
                    yearlyInterestLiabilities?.[index] ?? 0 // Prevents undefined access
                  )}
                </Text>
              ))}
            </View>

            {/* Withdrawals */}
            <View style={styles.tableRow}>
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
                Withdrawals
              </Text>
              {Array.from({ length: projectionYears }).map((_, index) => (
                <Text
                  key={index}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                  ]}
                >
                  {formatNumber(
                    formData.MoreDetails?.withdrawals?.[index] || "-"
                  )}
                </Text>
              ))}
            </View>

            {/* Income Tax */}
            <View style={[styles.tableRow]}>
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
                ]}
              >
                Income Tax
              </Text>
              {incomeTax.length > 0 ? (
                incomeTax.map((tax, index) => (
                  <Text
                    key={index}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                    ]}
                  >
                    {tax ? tax.toLocaleString("en-IN") : "N/A"}
                  </Text>
                ))
              ) : (
                <Text
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                  ]}
                >
                  N/A
                </Text>
              )}
            </View>

            {/* Total Uses Calculation */}
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
                Total Uses
              </Text>
              {totalUsesArray.map((total, index) => (
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
                  {/* ✅ Display Rounded Total */}
                </Text>
              ))}
            </View>
          </View>

          {/* Cash Balance Section */}

          {/* Opening Cash Balance */}
          <View style={styles.tableRow}>
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
              Opening Cash Balance
            </Text>

            {/* ✅ Display Updated Opening Cash Balance for Each Year */}
            {cashBalances.map((cb, index) => (
              <Text
                key={index}
                style={[
                  stylesCOP.particularsCellsDetail,
                  styleExpenses.fontSmall,
                ]}
              >
                {formatNumber(Math.round(cb.opening))}{" "}
              </Text>
            ))}
          </View>

          {/* Surplus During the Year */}
          <View style={styles.tableRow}>
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
              Surplus During the Year
            </Text>

            {/* ✅ Display Surplus for Each Year */}
            {cashBalances.map((cb, index) => (
              <Text
                key={index}
                style={[
                  stylesCOP.particularsCellsDetail,
                  styleExpenses.fontSmall,
                ]}
              >
                {formatNumber(Math.round(cb.surplus))}
              </Text>
            ))}
          </View>

          {/* Closing Cash Balance */}
          <View style={styles.tableRow}>
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
              Closing Cash Balance
            </Text>

            {/* ✅ Display Closing Cash Balance for Each Year */}
            {cashBalances.map((cb, index) => (
              <Text
                key={index}
                style={[
                  stylesCOP.particularsCellsDetail,
                  styleExpenses.fontSmall,
                ]}
              >
                {formatNumber(Math.round(cb.closing))}
              </Text>
            ))}
          </View>
        </View>
      </View>
    </Page>
  );
};

export default ProjectedBalanceSheet;
