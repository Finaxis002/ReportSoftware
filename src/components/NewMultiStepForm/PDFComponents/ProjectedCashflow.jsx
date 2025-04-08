import React, { useEffect, useState, useMemo } from "react";
import { Page, View, Text, Image } from "@react-pdf/renderer";
import { styles, stylesCOP, stylesMOF, styleExpenses } from "./Styles";
import { Font } from "@react-pdf/renderer";
import SAWatermark from "../Assets/SAWatermark";
import CAWatermark from "../Assets/CAWatermark";

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
  yearlyPrincipalRepayment = [],
  yearlyInterestLiabilities = [],
  firstYearGrossFixedAssets,
  financialYearLabels,
  handleWorkingCapitalValuesTransfer,
  incomeTaxCalculation,
  onClosingCashBalanceCalculated,
  formatNumber,
  pdfType,
}) => {
  const [grossFixedAssets, setGrossFixedAssets] = useState(0);
  const [closingCashBalanceArray2, setClosingCashBalanceArray] = useState([]);

  useEffect(() => {
    if (onClosingCashBalanceCalculated && closingCashBalanceArray2.length > 0) {
      onClosingCashBalanceCalculated(closingCashBalanceArray2);
    }
  }, [onClosingCashBalanceCalculated, closingCashBalanceArray2]);

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

  // if (
  //   !formData ||
  //   typeof formData !== "object" ||
  //   !calculations ||
  //   typeof calculations !== "object"
  // ) {
  //   console.error("❌ Invalid formData or calculations provided");
  //   return null;
  // }

  // console.log("data for term loan", yearlyInterestLiabilities);

  const projectionYears =
    Number(formData?.ProjectReportSetting?.ProjectionYears) || 5;

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
  // const interestOnWorkingCapital = Array.from({
  //   length: parseInt(formData.ProjectReportSetting.ProjectionYears) || 0,
  // }).map(() => {
  //   const workingCapitalLoan =
  //     Number(formData.MeansOfFinance.workingCapital.termLoan) || 0;
  //   const interestRate =
  //     Number(formData.ProjectReportSetting.interestOnTL) || 0;

  //   // ✅ Annual Interest Calculation
  //   return (workingCapitalLoan * interestRate) / 100;
  // });
  const interestOnWorkingCapital = Array.from({
    length: parseInt(formData?.ProjectReportSetting?.ProjectionYears) || 0,
  }).map(() => {
    const workingCapitalLoan =
      Number(formData?.MeansOfFinance?.workingCapital?.termLoan) || 0;
    const interestRate =
      Number(formData?.ProjectReportSetting?.interestOnTL) || 0;
  
    return (workingCapitalLoan * interestRate) / 100;
  });
  

  // Function to calculate interest on working capital considering moratorium period
  const calculateInterestOnWorkingCapital = useMemo(() => {
    return (interestAmount, yearIndex) => {
      const repaymentStartYear = Math.floor(moratoriumPeriodMonths / 12);
      const monthsInYear = monthsPerYear[yearIndex];

      if (monthsInYear === 0) {
        return 0; // No interest during moratorium
      } else {
        if (yearIndex === repaymentStartYear) {
          const monthsRemainingAfterMoratorium =
            12 - (moratoriumPeriodMonths % 12);
          return (interestAmount / 12) * monthsRemainingAfterMoratorium; // Apply partial interest in first repayment year
        } else if (yearIndex > repaymentStartYear) {
          return interestAmount; // From second year onwards, apply full interest
        } else {
          return 0; // No interest during moratorium
        }
      }
    };
  }, [moratoriumPeriodMonths, monthsPerYear, rateOfExpense]);

  // Compute Net Profit Before Interest & Taxes for Each Year
  const netProfitBeforeInterestAndTaxes = Array.from({
    length: projectionYears,
  }).map((_, yearIndex) => {
    const profitBeforeTax = netProfitBeforeTax?.[yearIndex] || 0; // Profit Before Tax
    const interestOnTermLoan = yearlyInterestLiabilities?.[yearIndex] || 0; // Interest on Term Loan
    const interestOnWorkingCapitalValue = calculateInterestOnWorkingCapital(
      interestOnWorkingCapital?.[yearIndex] || 0,
      yearIndex
    ); // Call function to get Interest on Working Capital

    // Calculate NPBIT (Net Profit Before Interest & Taxes)
    const calculatedValue =
      profitBeforeTax + interestOnTermLoan + interestOnWorkingCapitalValue;

    return calculatedValue;
  });

  // const incomeTaxCalculation2 = incomeTaxCalculation?.incomeTaxCalculation || 0;
  const incomeTaxCalculation2 = incomeTaxCalculation?.incomeTaxCalculation || [];


  // ✅ Compute Total Sources for Each Year
  // const totalSourcesArray = Array.from({ length: projectionYears }).map(
  //   (_, index) => {
  //     const netProfitValue = netProfitBeforeInterestAndTaxes[index] || 0;
  //     const promotersCapital =
  //       index === 0 ? parseFloat(formData.MeansOfFinance.totalPC || 0) : 0;
  //     const bankTermLoan =
  //       index === 0
  //         ? parseFloat(formData?.MeansOfFinance?.termLoan?.termLoan || 0)
  //         : 0;
  //     const workingCapitalLoan =
  //       index === 0
  //         ? parseFloat(formData.MeansOfFinance?.workingCapital?.termLoan || 0)
  //         : 0;
  //     const depreciation = totalDepreciationPerYear[index] || 0;

  //     // ✅ Sum up all sources
  //     return (
  //       netProfitValue +
  //       promotersCapital +
  //       bankTermLoan +
  //       workingCapitalLoan +
  //       depreciation
  //     );
  //   }
  // );
  const totalSourcesArray = Array.from({ length: projectionYears }).map(
    (_, index) => {
      const netProfitValue = netProfitBeforeInterestAndTaxes[index] || 0;
      const promotersCapital =
        index === 0 ? parseFloat(formData.MeansOfFinance.totalPC || 0) : 0;
      const bankTermLoan =
        index === 0
          ? parseFloat(formData?.MeansOfFinance?.termLoan?.termLoan || 0)
          : 0;
      const workingCapitalLoan =
        index === 0
          ? parseFloat(formData.MeansOfFinance?.workingCapital?.termLoan || 0)
          : 0;
      const depreciation = totalDepreciationPerYear[index] || 0;

      // ✅ Adding newly added current liabilities dynamically
      // const currentLiabilitiesTotal =
      // formData?.MoreDetails?.currentLiabilities?.reduce(
      //   (sum, liability) => sum + (liability.years?.[index] || 0),
      //   0
      // ) || 0;
      const currentLiabilitiesTotal =

        formData?.MoreDetails?.currentLiabilities?.reduce(
          (sum, liability) => sum + (liability.years?.[index] || 0),
          0
        ) || 0;


      // ✅ Sum up all sources including newly added liabilities
      return (
        netProfitValue +
        promotersCapital +
        bankTermLoan +
        workingCapitalLoan +
        depreciation +
        currentLiabilitiesTotal // Adding new liabilities to the total
      );
    }
  );

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
      const interestOnWorkingCapitalValue = calculateInterestOnWorkingCapital(
        interestOnWorkingCapital[index] || 0,
        index
      );
      const withdrawals = parseFloat(
        formData?.MoreDetails?.Withdrawals?.[index] || 0
      );
      const incomeTaxValue = parseFloat(incomeTaxCalculation2[index] || 0);

      // ✅ Ensuring Projection Years Match for Current Assets

      const currentAssetsTotal = formData?.MoreDetails?.currentAssets?.reduce(
        (sum, asset) => sum + (asset.years[index] ?? 0), // Fill missing values with 0

        0
      );
      

      // ✅ Ensure negative values are treated as zero
      const sanitize = (value) => (value < 0 ? 0 : value);

      // ✅ Final Total Uses Calculation
      const totalUses =
        sanitize(fixedAssets) +
        sanitize(repaymentOfTermLoan) +
        sanitize(interestOnTermLoan) +
        sanitize(interestOnWorkingCapitalValue) +
        sanitize(withdrawals) +
        sanitize(incomeTaxValue) +
        sanitize(currentAssetsTotal); // Adding newly added current assets

      return totalUses;
    }
  );

  // console.log(totalUsesArray);

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

  // useEffect(() => {
  //   if (cashBalances.length > 0) {
  //     const computedClosingCashBalance = cashBalances.map((cb) => cb.closing);

  //     // ✅ Update only if the values have changed
  //     const isDifferent = computedClosingCashBalance.some(
  //       (balance, index) => balance !== closingCashBalanceArray2[index]
  //     );

  //     if (isDifferent) {
  //       setClosingCashBalanceArray(computedClosingCashBalance);

  //       // ✅ Pass the new values to the parent component
  //       if (onClosingCashBalanceCalculated) {
  //         onClosingCashBalanceCalculated(computedClosingCashBalance);
  //       }
  //     }
  //   }
  // }, [cashBalances, onClosingCashBalanceCalculated, closingCashBalanceArray]);

  useEffect(() => {
    // ✅ Extract closing cash balance values directly from cashBalances
    const computedClosingCashBalance = cashBalances.map((cb) => cb.closing);

    // ✅ Avoid unnecessary re-renders by comparing stringified arrays
    if (
      JSON.stringify(computedClosingCashBalance) !==
      JSON.stringify(closingCashBalanceArray2)
    ) {
      setClosingCashBalanceArray(computedClosingCashBalance);

      // ✅ Pass updated values to the parent component
      if (onClosingCashBalanceCalculated) {
        onClosingCashBalanceCalculated(computedClosingCashBalance);
      }
    }
  }, [
    JSON.stringify(cashBalances), // Only trigger when cashBalances change
    onClosingCashBalanceCalculated, // Avoid unnecessary rerenders from state updates
  ]);

  useEffect(() => {
    // const termLoanValues = Array.from({ length: projectionYears }).map(
    //   (_, index) =>
    //     index === 0
    //       ? formData.MeansOfFinance?.workingCapital?.termLoan || "-"
    //       : "0"
    // );
    const termLoanValues = Array.from({ length: projectionYears }).map(
      (_, index) =>
        index === 0
          ? formData?.MeansOfFinance?.workingCapital?.termLoan || "-"
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
      size={formData.ProjectReportSetting.ProjectionYears > 12 ? "A3" : "A4"}
      orientation={
        formData.ProjectReportSetting.ProjectionYears > 5
          ? "landscape"
          : "portrait"
      }
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
      <View style={[styleExpenses.paddingx]}>
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

          {/* Sources Section */}
          <View>
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
                Sources
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

            {/* ✅ Net Profit before Interest & Taxes */}
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
                    {formatNumber(value)}
                  </Text>
                );
              })}
            </View>

            {/* Promoters’ Capital */}
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
                  {/* {formatNumber(
                    index === 0
                      ? formData?.MeansOfFinance?.termLoan?.termLoan || "-"
                      : "0"
                  )} */}
                  {formatNumber(
      index === 0
        ? formData?.MeansOfFinance?.termLoan?.termLoan || "-"
        : "0"
    )}
                </Text>
              ))}
            </View>

            {/* Working Capital Loan */}
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

            {/* ✅ Liabilities from More Details dynamically aligned with projectionYears */}
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
                    {idx + 6}
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
                    
                    fontWeight: "bold",
                    textAlign: "right",
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
                      borderTopWidth: "1px",
                      borderBottomWidth: "1px",
                      
                      
                      paddingVertical: "8px",
                    },
                  ]}
                >
                  {formatNumber(total)} {/* ✅ Ensure Proper Formatting */}
                </Text>
              ))}
            </View>
          </View>

          {/* Uses Section */}
          <View>
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
                Uses
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
                  {formatNumber(yearlyPrincipalRepayment[index] || 0)}
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

            {/* Interest On Working Capital */}
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
                Interest On Working Capital
              </Text>

              {/* ✅ Apply `calculateInterestOnWorkingCapital` */}
              {Array.from({
                length: formData.ProjectReportSetting.ProjectionYears,
              }).map((_, yearIndex) => {
                const calculatedInterest = calculateInterestOnWorkingCapital(
                  interestOnWorkingCapital[yearIndex] || 0,
                  yearIndex
                );

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

            {/* Withdrawals */}
            <View style={styles.tableRow}>
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
                    formData.MoreDetails?.Withdrawals?.[index] || "-"
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
                6
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

              {/* Render the incomeTaxCalculation values */}
              {incomeTaxCalculation2 && incomeTaxCalculation2.length > 0 ? (
                incomeTaxCalculation2.map((tax, index) => (
                  <Text
                    key={index}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                    ]}
                  >
                    {tax !== undefined && tax !== null
                      ? formatNumber(tax)
                      : "N/A"}
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
                    {index + 7}
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
                    
                    fontWeight: "bold",
                    textAlign: "right",
                  },
                ]}
              >
                Total
              </Text>
              {totalUsesArray.map((total, index) => (
                <Text
                  key={index}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styles.boldText,
                    {
                      fontSize: "9px",
                      borderTopWidth: "1px",
                      borderBottomWidth: "1px",
                      
                      
                      paddingVertical: "8px",
                    },
                  ]}
                >
                  {formatNumber(total)} {/* ✅ Display Rounded Total */}
                </Text>
              ))}
            </View>
          </View>

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
                  {formatNumber(cb.opening)}{" "}
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
                  {formatNumber(cb.surplus)}
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
                  {formatNumber(cb.closing)}
                </Text>
              ))}
            </View>
          </View>
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
};

export default React.memo(ProjectedCashflow);
