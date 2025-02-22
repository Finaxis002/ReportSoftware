import React, { useEffect, useState } from "react";
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

const ProjectedCashflow = ({
  formData = {},
  calculations = {},
  totalDepreciationPerYear = [],
  netProfitBeforeTax = [],
  grossProfitValues = [],
  yearlyPrincipalRepayment = [],
  yearlyInterestLiabilities = [],
  interestOnWorkingCapital = [], // ✅ Now Receiving Correctly
  firstYearGrossFixedAssets,
  financialYearLabels,
  handleWorkingCapitalValuesTransfer,
}) => {
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

  // console.log("data for term loan", yearlyInterestLiabilities);

  const projectionYears =
    Number(formData?.ProjectReportSetting?.ProjectionYears) || 5;

  // ✅ Safe Helper Function to Format Numbers Based on Selected Format
  // const formatNumber = (value) => {
  //   const formatType = formData?.ProjectReportSetting?.Format || "1"; // Default to Indian Format
  //   if (value === undefined || value === null || isNaN(value)) return "0"; // ✅ Handle invalid values

  //   switch (formatType) {
  //     case "1":
  //       return new Intl.NumberFormat("en-IN").format(value); // Indian Format
  //     case "2":
  //       return new Intl.NumberFormat("en-US").format(value); // USD Format
  //     default:
  //       return new Intl.NumberFormat("en-IN").format(value); // ✅ Safe default
  //   }
  // };

  const formatNumber = (value) => {
    const formatType = formData?.ProjectReportSetting?.Format || "1"; // Default to Indian Format

    if (value === undefined || value === null || isNaN(value)) return "0"; // ✅ Handle invalid values

    // Check for negative values, return 0 if less than 0
    const formattedValue = value < 0 ? 0 : value;

    switch (formatType) {
      case "1": // Indian Format (1,23,456)
        return new Intl.NumberFormat("en-IN").format(formattedValue);

      case "2": // USD Format (1,123,456)
        return new Intl.NumberFormat("en-US").format(formattedValue);

      case "3": // Generic Format (Same as Indian for now)
        return new Intl.NumberFormat("en-IN").format(formattedValue);

      default:
        return new Intl.NumberFormat("en-IN").format(formattedValue); // ✅ Safe default
    }
  };

  // ✅ Compute Net Profit Before Interest & Taxes for Each Year
  const netProfitBeforeInterestAndTaxes = Array.from({
    length: projectionYears,
  }).map((_, yearIndex) => {
    const profitBeforeTax = netProfitBeforeTax?.[yearIndex] || 0; // Profit Before Tax
    const interestOnTermLoan = yearlyInterestLiabilities?.[yearIndex] || 0; // Interest on Term Loan
    const interestOnWorkingCapitalValue =
      interestOnWorkingCapital?.[yearIndex] || 0; // Interest on Working Capital

    // ✅ Compute Corrected Value
    const calculatedValue =
      profitBeforeTax + interestOnTermLoan + interestOnWorkingCapitalValue;

    return calculatedValue;
  });

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
      const netProfitValue = netProfitBeforeInterestAndTaxes[index] || 0;
      const promotersCapital =
        index === 0 ? parseFloat(formData.MeansOfFinance.totalPC || 0) : 0;
      const bankTermLoan =
        index === 0
          ? parseFloat(formData.MeansOfFinance.termLoan.termLoan || 0)
          : 0;
      const workingCapitalLoan =
        index === 0
          ? parseFloat(formData.MeansOfFinance?.workingCapital?.termLoan || 0)
          : 0;
      const depreciation = totalDepreciationPerYear[index] || 0;

      // ✅ Sum up all sources
      return (
        netProfitValue +
        promotersCapital +
        bankTermLoan +
        workingCapitalLoan +
        depreciation
      );
    }
  );

  // ✅ Compute Total Uses for Each Year
  const totalUsesArray = Array.from({ length: projectionYears }).map(
    (_, index) => {
      const fixedAssets =
        index === 0 ? parseFloat(firstYearGrossFixedAssets || 0) : 0;
      const repaymentOfTermLoan = parseFloat(
        yearlyPrincipalRepayment[index] || 0
      );
      const interestOnTermLoan = parseFloat(
        yearlyInterestLiabilities[index] || 0
      );
      const withdrawals = parseFloat(
        formData.MoreDetails?.withdrawals?.[index] || 0
      );
      const incomeTaxValue = parseFloat(incomeTax[index] || 0);

      // ✅ Ensure negative values are treated as zero
      const sanitize = (value) => (value < 0 ? 0 : value);

      const totalUses =
        sanitize(fixedAssets) +
        sanitize(repaymentOfTermLoan) +
        sanitize(interestOnTermLoan) +
        sanitize(withdrawals) +
        sanitize(incomeTaxValue);

      return totalUses;
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

  // ✅ Compute Surplus During the Year for Each Year
  const surplusDuringYearArray = Array.from({ length: projectionYears }).map(
    (_, index) => {
      const totalSources = totalSourcesArray[index] || 0;
      const totalUses = totalUsesArray[index] || 0;

      return totalSources - totalUses; // ✅ Correct Calculation
    }
  );

  // ✅ Compute Closing Cash Balance for Each Year
  const closingCashBalanceArray = Array.from({ length: projectionYears }).map(
    (_, index) => {
      const openingBalance = cashBalances[index]?.opening || 0;
      const surplusDuringYear = surplusDuringYearArray[index] || 0;

      return openingBalance + surplusDuringYear; // ✅ Correct Calculation
    }
  );

  useEffect(() => {
    const termLoanValues = Array.from({ length: projectionYears }).map(
      (_, index) =>
        index === 0
          ? formData.MeansOfFinance?.workingCapital?.termLoan || "-"
          : "0"
    );

    // console.log("term Loan Values:", termLoanValues);

    handleWorkingCapitalValuesTransfer({
      termLoanValues,
    });
  }, [
    projectionYears,
    JSON.stringify(formData.MeansOfFinance?.workingCapital?.termLoan),
  ]);

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
          <Text>Projected Cashflow</Text>
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

          {/* Sources Section */}
          <View>
            <View style={[stylesMOF.row, styleExpenses.headerRow]}>
              <Text style={[styleExpenses.sno]}>A</Text>
              <Text style={stylesMOF.cell}>Sources</Text>
            </View>

            {/* ✅ Net Profit before Interest & Taxes */}
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
                Net Profit before Interest & Taxes
              </Text>

              {/* Sync Net Profit Before Interest & Taxes */}
              {financialYearLabels.map((_, index) => {
                const value = netProfitBeforeInterestAndTaxes[index] || 0; // Use filtered index
                return (
                  <Text
                    key={index}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                    ]}
                  >
                    {formatNumber(value.toFixed(2))}
                  </Text>
                );
              })}
            </View>

            {/* Promoters’ Capital */}
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
                Promoters’ Capital
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
                    index === 0 ? formData.MeansOfFinance.totalPC || "-" : "0"
                  )}
                </Text>
              ))}
            </View>

            {/* Bank Term Loan */}
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
                Bank Term Loan
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
                    index === 0
                      ? formData.MeansOfFinance.termLoan.termLoan || "-"
                      : "0"
                  )}
                </Text>
              ))}
            </View>

            {/* Working Capital Loan */}
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
                Working Capital Loan
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
                    index === 0
                      ? formData.MeansOfFinance?.workingCapital?.termLoan || "-"
                      : "0"
                  )}
                </Text>
              ))}
            </View>

            {/* Depreciation */}
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
                Depreciation
              </Text>
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

          {/* Uses Section */}
          <View>
            <View style={[stylesMOF.row, styleExpenses.headerRow]}>
              <Text style={[styleExpenses.sno]}>B</Text>
              <Text style={stylesMOF.cell}>Uses</Text>
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
                      ? formatNumber(firstYearGrossFixedAssets) // Use formatNumber instead of toLocaleString
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
                    {tax ? formatNumber(tax) : "N/A"}
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
          <View>
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
      </View>
    </Page>
  );
};

export default ProjectedCashflow;
