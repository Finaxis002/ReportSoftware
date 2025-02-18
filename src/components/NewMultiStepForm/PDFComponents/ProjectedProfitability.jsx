import React, { useEffect, useState } from "react";
import { Page, View, Text } from "@react-pdf/renderer";
import { styles, stylesCOP, stylesMOF, styleExpenses } from "./Styles"; // Import only necessary styles
import { Font } from "@react-pdf/renderer";

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

const ProjectedProfitability = ({
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
}) => {
  
  useEffect(() => {
    if (yearlyInterestLiabilities.length > 0) {
      //  console.log("✅ Updated Yearly Interest Liabilities in State:", yearlyInterestLiabilities);
    }
  }, [yearlyInterestLiabilities]); // ✅ Runs when state update

  const activeRowIndex = 0; // Define it or fetch dynamically if needed

  const totalAnnualWages = normalExpense.reduce(
    (sum, expense) => sum + Number(expense.amount * expense.quantity * 12 || 0),
    0
  );

  const formatAmountInIndianStyle = (amount) => {
    return amount.toLocaleString("en-IN"); // Format as per Indian number system
  };

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

  // ✅ Extract required values from formData
  const workingCapitalLoan = formData.MeansOfFinance.workingCapital.termLoan; // Loan amount
  const interestRate = formData.ProjectReportSetting.rateOfInterest / 100; // Convert % to decimal
  const projectionYears =
    parseInt(formData.ProjectReportSetting.ProjectionYears) || 0;
  const startMonthIndex = months.indexOf(
    formData.ProjectReportSetting.SelectStartingMonth
  );

  // ✅ Ensure a valid starting month
  const repaymentStartMonth = startMonthIndex !== -1 ? startMonthIndex : 0;


  // ✅ Compute Interest on Working Capital
  useEffect(() => {
    if (workingCapitalLoan > 0) {
      const computedInterest = Array.from({ length: projectionYears }).map(
        (_, yearIndex) => {
          const monthsInYear = yearIndex === 0 ? 12 - repaymentStartMonth : 12;
          return Math.round(
            workingCapitalLoan * interestRate * (monthsInYear / 12)
          );
        }
      );

      // console.log("✅ Computed Interest on Working Capital:", computedInterest);

      // ✅ If Parent Function Exists, Update Parent Component
      if (setInterestOnWorkingCapital) {
        setInterestOnWorkingCapital(computedInterest);
      }
    } else {
      console.error(
        "❌ Missing working capital loan or interest rate in formData"
      );
    }
  }, [workingCapitalLoan, interestRate, projectionYears, repaymentStartMonth]);

  {
    /* ✅ Get formType safely from formData */
  }
  const formType = formData?.Revenue?.formType || "Others"; // Default to "Others" if missing

  // ✅ Compute Adjusted Revenue Values for Each Year Before Rendering
  const adjustedRevenueValues = Array.from({
    length: parseInt(formData?.ProjectReportSetting?.ProjectionYears) || 0,
  }).map((_, yearIndex) => {
    const totalRevenue = totalRevenueReceipts[yearIndex] || 0;
    const closingStock = formData?.MoreDetails?.closingStock?.[yearIndex] || 0;
    const openingStock = formData?.MoreDetails?.openingStock?.[yearIndex] || 0;

    return totalRevenue + closingStock - openingStock; // ✅ Final computation
  });

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

  // ✅ Properly calculate total direct expenses for each projection year
  const totalDirectExpenses = Array.from({
    length: parseInt(formData.ProjectReportSetting.ProjectionYears) || 0,
  }).map((_, yearIndex) => {
    // Calculate total direct expenses
    const totalDirectExpenses = directExpense
      .filter((expense) => expense.type === "direct")
      .reduce((sum, expense) => {
        const baseValue = Number(expense.value) || 0; // Direct annual value
        return (
          sum +
          baseValue *
            Math.pow(
              1 + formData.ProjectReportSetting.rateOfExpense / 100,
              yearIndex
            )
        );
      }, 0);

    // Calculate salary & wages growth
    const initialSalaryWages = Number(fringAndAnnualCalculation) || 0;
    const totalSalaryWages =
      initialSalaryWages *
      Math.pow(
        1 + formData.ProjectReportSetting.rateOfExpense / 100,
        yearIndex
      );

    return totalDirectExpenses + totalSalaryWages; // ✅ Final Grand Total
  });

  // ✅ Calculate Total Indirect Expenses for Each Year
  const totalIndirectExpenses = Array.from({
    length: parseInt(formData.ProjectReportSetting.ProjectionYears) || 0,
  }).map((_, yearIndex) => {
    // ✅ Interest on Term Loan
    const interestOnTermLoan = yearlyInterestLiabilities[yearIndex] || 0;

    // ✅ Interest on Working Capital
    const interestExpenseOnWorkingCapital =
      interestOnWorkingCapital[yearIndex] || 0;

    // ✅ Depreciation
    const depreciationExpense = totalDepreciationPerYear[yearIndex] || 0;

    // ✅ Other Indirect Expenses (with growth rate)
    const indirectExpenses = directExpense
      .filter((expense) => expense.type === "indirect")
      .reduce((sum, expense) => {
        const baseValue = Number(expense.value) || 0;
        const initialValue = baseValue; // Convert monthly to annual
        return (
          sum +
          initialValue *
            Math.pow(
              1 + formData.ProjectReportSetting.rateOfExpense / 100,
              yearIndex
            )
        );
      }, 0);

    // ✅ Final Total Indirect Expenses Calculation
    return (
      interestOnTermLoan +
      interestExpenseOnWorkingCapital +
      depreciationExpense +
      indirectExpenses
    );
  });

  // ✅ Step 2: Compute Gross Profit Values for Each Year After `totalDirectExpenses` is Defined
  const grossProfitValues = Array.from({
    length: parseInt(formData?.ProjectReportSetting?.ProjectionYears) || 0,
  }).map((_, yearIndex) => {
    const netAdjustedRevenue = adjustedRevenueValues[yearIndex] || 0;
    const totalExpenses = totalDirectExpenses[yearIndex] || 0; // ✅ Now correctly uses the computed direct expenses

    return netAdjustedRevenue - totalExpenses; // ✅ Correct subtraction for gross profit
  });

  // ✅ Precompute Net Profit Before Tax (NPBT) for Each Year Before Rendering
  const netProfitBeforeTax = grossProfitValues.map((grossProfit, yearIndex) => {
    return grossProfit - totalIndirectExpenses[yearIndex];
  });

  // ✅ Precompute Income Tax Calculation for Each Year Before Rendering
  const incomeTaxCalculation = netProfitBeforeTax.map((npbt, yearIndex) => {
    return (npbt * formData.ProjectReportSetting.incomeTax) / 100;
  });

  // ✅ Precompute Net Profit After Tax (NPAT) for Each Year Before Rendering
  const netProfitAfterTax = netProfitBeforeTax.map((npat, yearIndex) => {
    return npat - incomeTaxCalculation[yearIndex]; // ✅ Correct subtraction
  });

 



  // ✅ Precompute Balance Transferred to Balance Sheet
  const balanceTransferred = netProfitAfterTax.map(
    (npbt, yearIndex) =>
      npbt - (formData.MoreDetails.withdrawals?.[yearIndex] || 0)
  );

  // ✅ Precompute Cumulative Balance Transferred to Balance Sheet
  const cumulativeBalanceTransferred = balanceTransferred.reduce(
    (acc, value, index) => {
      if (index === 0) {
        acc.push(value); // First year, just push the value
      } else {
        acc.push(acc[index - 1] + value); // Add previous cumulative value
      }
      return acc;
    },
    []
  );

  // ✅ Ensure `onComputedData` updates only when required
  useEffect(() => {
    if (netProfitBeforeTax.length > 0) {
      onComputedData((prev) => ({
        ...prev,
        netProfitBeforeTax,
      }));
    }
  }, [JSON.stringify(netProfitBeforeTax)]); // ✅ Prevents unnecessary re-renders

  useEffect(() => {
    if (grossProfitValues.length > 0) {
      onComputedData((prev) => ({
        ...prev,
        grossProfitValues,
        netProfitBeforeTax,
      }));
    }
  }, [JSON.stringify(grossProfitValues), JSON.stringify(netProfitBeforeTax)]);

  
  useEffect(() =>{
    if(netProfitAfterTax.length > 0){
      onComputedData((prev) => ({
        ...prev,
        netProfitAfterTax,
      }))
    }
  }, [JSON.stringify(netProfitAfterTax)])



  // ✅ Safe Helper Function to Format Numbers Based on Selected Format
  const formatNumber = (value) => {
    const formatType = formData?.ProjectReportSetting?.Format || "1"; // Default to Indian Format

    if (value === undefined || value === null || isNaN(value)) return "0"; // ✅ Handle invalid values

    switch (formatType) {
      case "1": // Indian Format (1,23,456)
        return new Intl.NumberFormat("en-IN").format(value);

      case "2": // USD Format (1,123,456)
        return new Intl.NumberFormat("en-US").format(value);

      case "3": // Generic Format (Same as Indian for now)
        return new Intl.NumberFormat("en-IN").format(value);

      default:
        return new Intl.NumberFormat("en-IN").format(value); // ✅ Safe default
    }
  };

  return (
    <Page
      size={formData.ProjectReportSetting.ProjectionYears > 12 ? "A3" : "A4"}
      orientation={
        formData.ProjectReportSetting.ProjectionYears > 7
          ? "landscape"
          : "portrait"
      }
      wrap={false}
      break
    >
      <View style={[styleExpenses.paddingx, { paddingBottom: "30px" }]}>
        <Text style={[styles.clientName]}>{localData.clientName}</Text>
        <View
          style={[
            stylesCOP.heading,
            {
              fontWeight: "bold",
              paddingLeft: 10,
            },
          ]}
        >
          <Text>Projected Profitability Statement</Text>
        </View>
        <View style={[styles.table]}>
          <View style={styles.tableHeader}>
            <Text style={[styles.serialNoCell, styleExpenses.sno]}>S. No.</Text>
            <Text style={[styles.detailsCell, styleExpenses.particularWidth]}>
              Particulars
            </Text>
            {Array.from({
              length:
                parseInt(formData.ProjectReportSetting.ProjectionYears) || 0,
            }).map((_, index) => (
              <Text key={index} style={styles.particularsCell}>
                Year {index + 1}
              </Text>
            ))}
          </View>
        </View>
        {/* ✅ Display Total Revenue Receipt Row */}
        <View
          style={[
            stylesMOF.row,
            styles.tableRow,
            {
              fontWeight: "black",
              marginVertical: "12px",
              borderLeft: "2px solid #000",
            },
          ]}
        >
          <Text
            style={[
              stylesCOP.serialNoCellDetail,
              styleExpenses.sno,
              styleExpenses.bordernone,
            ]}
          >
            A
          </Text>
          <Text
            style={[
              stylesCOP.detailsCellDetail,
              styleExpenses.particularWidth,
              styleExpenses.bordernone,
              { fontWeight: "extrabold" },
            ]}
          >
            Total Revenue Receipt
          </Text>

          {/* ✅ Display computed total revenue values received from ProjectedRevenue */}
          {totalRevenueReceipts.map((totalYearValue, yearIndex) => (
            <Text
              key={yearIndex}
              style={[
                stylesCOP.particularsCellsDetail,
                stylesCOP.boldText,
                styleExpenses.fontSmall,
                { fontWeight: "extrabold", borderLeftWidth: "0px" },
              ]}
            >
              {formatNumber(totalYearValue)}
            </Text>
          ))}
        </View>

        {/* Closing Stock / Inventory */}
        <View style={[stylesMOF.row, styles.tableRow]}>
          <Text
            style={[
              stylesCOP.serialNoCellDetail,
              styleExpenses.sno,
              styleExpenses.bordernone,
              { borderLeftWidth: "1px" },
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

          {Array.from({
            length:
              parseInt(formData.ProjectReportSetting.ProjectionYears) || 0,
          }).map((_, index) => (
            <Text
              key={`closingStock-${index}`}
              style={[
                stylesCOP.particularsCellsDetail,
                styleExpenses.fontSmall,
              ]}
            >
              {formatNumber(formData.MoreDetails.closingStock?.[index] ?? 0)}
            </Text>
          ))}
        </View>
        {/* Opening Stock / Inventory */}
        <View style={[stylesMOF.row, styles.tableRow]}>
          <Text
            style={[
              stylesCOP.serialNoCellDetail,
              styleExpenses.sno,
              styleExpenses.bordernone,
              { borderLeftWidth: "1px" },
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

          {Array.from({
            length:
              parseInt(formData.ProjectReportSetting.ProjectionYears) || 0,
          }).map((_, index) => (
            <Text
              key={`openingStock-${index}`}
              style={[
                stylesCOP.particularsCellsDetail,
                styleExpenses.fontSmall,
              ]}
            >
              {formatNumber(formData.MoreDetails.openingStock?.[index] ?? 0)}
            </Text>
          ))}
        </View>

        {/* Computation of Total Revenue, Adding Closing Stock, and Subtracting Opening Stock */}
        <View
          style={[stylesMOF.row, styles.tableRow, { borderBottomWidth: "0px" }]}
        >
          <Text
            style={[
              stylesCOP.serialNoCellDetail,
              styleExpenses.sno,
              styleExpenses.bordernone,
              { borderLeftWidth: "1px" },
            ]}
          ></Text>
          <Text
            style={[
              stylesCOP.detailsCellDetail,
              styleExpenses.particularWidth,
              styleExpenses.bordernone,
              { fontWeight: "extrabold" },
            ]}
          ></Text>

          {/* ✅ Display Computed Adjusted Revenue Values */}
          {adjustedRevenueValues.map((finalValue, yearIndex) => (
            <Text
              key={`finalValue-${yearIndex}`}
              style={[
                stylesCOP.particularsCellsDetail,
                stylesCOP.boldText,
                styleExpenses.fontSmall,
                {
                  fontFamily: "Roboto",
                  fontWeight: "extrabold",
                  borderLeftWidth: "0px",
                },
              ]}
            >
              {formatNumber(finalValue)}
            </Text>
          ))}
        </View>

        {/* direct expenses */}
        <View style={[stylesMOF.row, styleExpenses.headerRow]}>
          <Text style={[styleExpenses.sno, { borderLeftWidth: "1px" }]}>C</Text>
          <Text style={stylesMOF.cell}>Less : Direct Expenses</Text>
        </View>

        {/* Salary and wages  */}
        {normalExpense.map((expense, index) => {
          if (index !== activeRowIndex) return null; // Only render the active row

          return (
            <View key={index} style={[stylesMOF.row, styles.tableRow]}>
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
                Salary and Wages
              </Text>

              {/* Map through projection years to display calculations */}
              {[
                ...Array(
                  parseInt(formData.ProjectReportSetting.ProjectionYears) || 0
                ),
              ].map((_, yearIndex) => {
                const Annual = Number(fringAndAnnualCalculation) || 0;
                const initialValue = Annual; // Base annual value calculation

                // For the first year (first column), show totalAnnualWages
                const calculatedValue =
                  yearIndex === 0
                    ? initialValue // For Year 1, just show the base value
                    : initialValue *
                      Math.pow(
                        1 + formData.ProjectReportSetting.rateOfExpense / 100,
                        yearIndex
                      ); // Apply growth for subsequent years

                return (
                  <Text
                    key={yearIndex}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                    ]}
                  >
                    {formatNumber(
                      yearIndex === 0
                        ? Annual.toFixed(2) // ✅ Only format once
                        : calculatedValue.toFixed(2) // ✅ Same for calculatedValue
                    )}
                  </Text>
                );
              })}
            </View>
          );
        })}

        {directExpense
          .filter((expense) => expense.type === "direct")
          .map((expense, index) => {
            const baseValue = Number(expense.value) || 0;
            const initialValue = baseValue;

            return (
              <View key={index} style={[stylesMOF.row, styles.tableRow]}>
                <Text
                  style={[
                    stylesCOP.serialNoCellDetail,
                    styleExpenses.sno,
                    styleExpenses.bordernone,
                    { borderLeftWidth: "1px" },
                  ]}
                >
                  {index + 2}
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
                {[
                  ...Array(
                    parseInt(formData.ProjectReportSetting.ProjectionYears) || 0
                  ),
                ].map((_, yearIndex) => {
                  const calculatedValue =
                    initialValue *
                    Math.pow(
                      1 + formData.ProjectReportSetting.rateOfExpense / 100,
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
                      {formatNumber(calculatedValue.toFixed(2))}
                    </Text>
                  );
                })}
              </View>
            );
          })}
        {/* direct Expenses total  */}
        <View
          style={[styles.tableRow, styles.totalRow, { paddingTop: "12px" }]}
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
              { fontFamily: "Roboto", fontWeight: "extrabold" },
            ]}
          >
            Total
          </Text>
          {/* ✅ Display Precomputed Total Direct Expenses */}
          {totalDirectExpenses.map((totalValue, yearIndex) => (
            <Text
              key={yearIndex}
              style={[
                stylesCOP.particularsCellsDetail,
                stylesCOP.boldText,
                styleExpenses.fontSmall,
                {
                  fontFamily: "Roboto",
                  fontWeight: "extrabold",
                  borderLeftWidth: "0px",
                },
              ]}
            >
              {formatNumber(formatAmountInIndianStyle(totalValue.toFixed(2)))}
            </Text>
          ))}
        </View>
        {/* Gross Profit Calculation */}
        <View
          style={[stylesMOF.row, styles.tableRow, { marginVertical: "12px" }]}
        >
          <Text
            style={[
              stylesCOP.serialNoCellDetail,
              styleExpenses.sno,
              styleExpenses.bordernone,
              {
                fontFamily: "Roboto",
                fontWeight: "extrabold",
                borderLeftWidth: "1px",
              },
            ]}
          >
            D
          </Text>
          <Text
            style={[
              stylesCOP.detailsCellDetail,
              styleExpenses.particularWidth,
              styleExpenses.bordernone,
              { fontFamily: "Roboto", fontWeight: "extrabold" },
            ]}
          >
            Gross Profit
          </Text>

          {/* ✅ Display Precomputed Gross Profit Values */}
          {grossProfitValues.map((grossProfit, yearIndex) => (
            <Text
              key={`grossProfit-${yearIndex}`}
              style={[
                stylesCOP.particularsCellsDetail,
                stylesCOP.boldText,
                styleExpenses.fontSmall,
                {
                  borderWidth: "2px",
                  borderLeftWidth: "0px",
                  fontFamily: "Roboto",
                  fontWeight: "extrabold",
                },
              ]}
            >
              {formatNumber(formatAmountInIndianStyle(grossProfit.toFixed(2)))}
            </Text>
          ))}
        </View>

        {/* indirect expense */}
        <View style={[stylesMOF.row, styleExpenses.headerRow]}>
          <Text style={[styleExpenses.sno, { borderLeftWidth: "1px" }]}>E</Text>

          <Text style={stylesMOF.cell}>Less:Indirect Expenses</Text>
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
            1
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

        {/* Interest on Working Capital */}

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
            Interest On Working Capital
          </Text>

          {/* ✅ Display Interest Values for Each Year */}
          {interestOnWorkingCapital.map((interest, index) => (
            <Text
              key={index}
              style={[
                stylesCOP.particularsCellsDetail,
                styleExpenses.fontSmall,
              ]}
            >
              {formatNumber(interest)}
            </Text>
          ))}
        </View>
        {/* ✅ Render Depreciation Row */}
        <View style={[stylesMOF.row, styles.tableRow]}>
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

          {/* ✅ Display Depreciation Values for Each Year */}
          {totalDepreciationPerYear.map((depreciationValue, yearIndex) => (
            <Text
              key={yearIndex}
              style={[
                stylesCOP.particularsCellsDetail,
                styleExpenses.fontSmall,
              ]}
            >
              {formatNumber(depreciationValue)}
            </Text>
          ))}
        </View>

        {directExpense
          .filter((expense) => expense.type === "indirect")
          .map((expense, index) => {
            const baseValue = Number(expense.value) || 0;
            const initialValue = baseValue * 12;

            return (
              <View key={index} style={[stylesMOF.row, styles.tableRow]}>
                <Text
                  style={[
                    stylesCOP.serialNoCellDetail,
                    styleExpenses.sno,
                    styleExpenses.bordernone,
                    { borderLeftWidth: "1px" },
                  ]}
                >
                  {index + 4}
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
                {[
                  ...Array(
                    parseInt(formData.ProjectReportSetting.ProjectionYears) || 0
                  ),
                ].map((_, yearIndex) => {
                  const calculatedValue =
                    initialValue *
                    Math.pow(
                      1 + formData.ProjectReportSetting.rateOfExpense / 100,
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
                      {formatNumber(Math.round(calculatedValue))}
                    </Text>
                  );
                })}
              </View>
            );
          })}

        {/* ✅ Total Indirect Expenses Row */}
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
            Total Indirect Expenses
          </Text>

          {/* ✅ Display the calculated `totalIndirectExpensesArray` */}
          {totalIndirectExpenses.map((totalValue, yearIndex) => (
            <Text
              key={yearIndex}
              style={[
                stylesCOP.particularsCellsDetail,
                stylesCOP.boldText,
                styleExpenses.fontSmall,
              ]}
            >
              {formatNumber(Math.round(totalValue))}{" "}
              {/* ✅ Display with Round-Off */}
            </Text>
          ))}
        </View>

        {/* Net Profit Before Tax Calculation */}
        <View style={[stylesMOF.row, styles.tableRow, { marginTop: "12px" }]}>
          <Text
            style={[
              stylesCOP.serialNoCellDetail,
              styleExpenses.sno,
              styleExpenses.bordernone,
              {
                fontFamily: "Roboto", // ✅ Ensure using the registered font
                fontWeight: "bold", // ✅ Apply bold
                borderLeftWidth: "1px",
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
              {
                fontFamily: "Roboto", // ✅ Ensure using the registered font
                fontWeight: "bold", // ✅ Apply bold
              },
            ]}
          >
            Net Profit Before Tax
          </Text>

          {/* ✅ Display Precomputed NPBT Values */}
          {netProfitBeforeTax.map((npbt, yearIndex) => (
            <Text
              key={`netProfitBeforeTax-${yearIndex}`}
              style={[
                stylesCOP.particularsCellsDetail,
                stylesCOP.boldText,
                styleExpenses.fontSmall,
                {
                  borderWidth: "2px",
                  fontFamily: "Roboto",
                  fontWeight: "bold",
                  color: "#000",
                  borderLeftWidth: "0px",
                },
              ]}
            >
              {formatNumber(Math.round(npbt))}
            </Text>
          ))}
        </View>
        {/* Income Tax @  % */}
        <View
          style={[stylesMOF.row, styles.tableRow, { borderWidth: "0.1px" }]}
        >
          <Text
            style={[
              stylesCOP.serialNoCellDetail,
              styleExpenses.sno,
              styleExpenses.bordernone,
              { borderWidth: "0.1px", borderLeftWidth: "1px" },
            ]}
          >
            Less
          </Text>
          <Text
            style={[
              stylesCOP.detailsCellDetail,
              styleExpenses.particularWidth,
              styleExpenses.bordernone,
              { fontWeight: "extrabold" },
              { borderWidth: "0.1px" },
            ]}
          >
            Income Tax @ {formData.ProjectReportSetting.incomeTax} %
          </Text>

          {/* ✅ Display Precomputed Income Tax Values */}
          {incomeTaxCalculation.map((tax, yearIndex) => (
            <Text
              key={`incomeTax-${yearIndex}`}
              style={[
                stylesCOP.particularsCellsDetail,
                stylesCOP.boldText,
                styleExpenses.fontSmall,
                { borderWidth: "0.1px" },
              ]}
            >
              {formatNumber(Math.round(tax))}
            </Text>
          ))}
        </View>
        {/* Net Profit After Tax Calculation  */}
        <View
          style={[stylesMOF.row, styles.tableRow, { borderWidth: "0.1px" }]}
        >
          <Text
            style={[
              stylesCOP.serialNoCellDetail,
              styleExpenses.sno,
              styleExpenses.bordernone,
              {
                fontFamily: "Roboto", // ✅ Ensure using the registered font
                fontWeight: "bold", // ✅ Apply bold
                borderLeftWidth: "1px",
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
                fontFamily: "Roboto", // ✅ Ensure using the registered font
                fontWeight: "bold", // ✅ Apply bold
              },
            ]}
          >
            Net Profit After Tax
          </Text>
          {/*  Display Precomputed Net Profit After Tax (NPAT) Values */}
          {netProfitAfterTax.map((tax, yearIndex) => (
            <Text
              key={`netProfitAfterTax-${yearIndex}`}
              style={[
                stylesCOP.particularsCellsDetail,
                stylesCOP.boldText,
                styleExpenses.fontSmall,
                {
                  borderWidth: "2px",
                  fontFamily: "Roboto",
                  fontWeight: "bold",
                  color: "#000",
                  borderLeftWidth: "0px",
                },
              ]}
            >
              {formatNumber(Math.round(tax))}
            </Text>
          ))}
        </View>
        {/* Withdrawals during the year  */}
        <View
          style={[stylesMOF.row, styles.tableRow, { borderWidth: "0.1px" }]}
        >
          <Text
            style={[
              stylesCOP.serialNoCellDetail,
              styleExpenses.sno,
              styleExpenses.bordernone,
              { borderLeftWidth: "1px" },
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

          {/* Ensure exactly `projectionYears` columns */}
          {Array.from({
            length:
              parseInt(formData.ProjectReportSetting.ProjectionYears) || 0,
          }).map((_, yearIndex) => {
            const amount = formData.MoreDetails.withdrawals?.[yearIndex] ?? 0; // If no data, default to 0

            return (
              <Text
                key={`withdrawals-${yearIndex}`}
                style={[
                  stylesCOP.particularsCellsDetail,
                  stylesCOP.boldText,
                  styleExpenses.fontSmall,
                  { borderWidth: 0 },
                ]}
              >
                {formatNumber(amount.toFixed(2))}
              </Text>
            );
          })}
        </View>

        {/* Balance Trf. To Balance Sheet */}
        <View
          style={[stylesMOF.row, styles.tableRow, { borderWidth: "0.1px" }]}
        >
          <Text
            style={[
              stylesCOP.serialNoCellDetail,
              styleExpenses.sno,
              styleExpenses.bordernone,
              { borderLeftWidth: "1px" },
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

          {/* ✅ Display Precomputed Balance Transferred Values with Rounding */}
          {balanceTransferred.map((amount, yearIndex) => {
            // ✅ Convert to integer based on decimal condition
            const roundedValue =
              amount - Math.floor(amount) <= 0.5
                ? Math.floor(amount) // Round down if decimal part is ≤ 0.5
                : Math.ceil(amount); // Round up if decimal part is > 0.5

            return (
              <Text
                key={`balanceTransferred-${yearIndex}`}
                style={[
                  stylesCOP.particularsCellsDetail,
                  stylesCOP.boldText,
                  styleExpenses.fontSmall,
                  { borderWidth: 0 },
                ]}
              >
                {formatNumber(Math.round(roundedValue))}
              </Text>
            );
          })}
        </View>

        {/* ✅ Display Precomputed Cumulative Balance Transferred Values */}
        <View
          style={[stylesMOF.row, styles.tableRow, { borderWidth: "0.1px" }]}
        >
          <Text
            style={[
              stylesCOP.serialNoCellDetail,
              styleExpenses.sno,
              styleExpenses.bordernone,
              { borderLeftWidth: "1px" },
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

          {cumulativeBalanceTransferred.map((amount, yearIndex) => {
            // ✅ Convert to integer based on decimal condition
            const roundedValue =
              amount - Math.floor(amount) <= 0.5
                ? Math.floor(amount) // Round down if decimal part is ≤ 0.5
                : Math.ceil(amount); // Round up if decimal part is > 0.5

            return (
              <Text
                key={`cumulativeBalance-${yearIndex}`}
                style={[
                  stylesCOP.particularsCellsDetail,
                  stylesCOP.boldText,
                  styleExpenses.fontSmall,
                  { borderWidth: 0 },
                ]}
              >
                {formatNumber(roundedValue)}
              </Text>
            );
          })}
        </View>

        {/* ✅ Cash Profit (NPAT + Dep.) */}
        <View
          style={[stylesMOF.row, styles.tableRow, { borderWidth: "0.1px" }]}
        >
          <Text
            style={[
              stylesCOP.serialNoCellDetail,
              styleExpenses.sno,
              styleExpenses.bordernone,
              {
                paddingVertical: "10px",
                borderBottomWidth: "1px",
                borderLeftWidth: "1px",
              },
            ]}
          ></Text>

          <Text
            style={[
              stylesCOP.detailsCellDetail,
              styleExpenses.particularWidth,
              styleExpenses.bordernone,
              { paddingVertical: "10px", borderBottomWidth: "1px" },
            ]}
          >
            Cash Profit (NPAT + Dep.)
          </Text>

          {netProfitAfterTax.map((npat, yearIndex) => {
            const depreciation = totalDepreciationPerYear[yearIndex] || 0;

            // ✅ Correctly Compute Cash Profit
            const cashProfit = npat + depreciation;

            // ✅ Round values correctly
            const roundedValue =
              cashProfit - Math.floor(cashProfit) <= 0.5
                ? Math.floor(cashProfit) // Round down if decimal part is ≤ 0.5
                : Math.ceil(cashProfit); // Round up if decimal part is > 0.5

            return (
              <Text
                key={`cashProfit-${yearIndex}`}
                style={[
                  stylesCOP.particularsCellsDetail,
                  stylesCOP.boldText,
                  styleExpenses.fontSmall,
                  {
                    borderWidth: 0,
                    paddingVertical: "10px",
                    borderBottomWidth: "1px",
                  },
                ]}
              >
                {formatNumber(roundedValue)}
              </Text>
            );
          })}
        </View>
      </View>
    </Page>
  );
};

export default ProjectedProfitability;