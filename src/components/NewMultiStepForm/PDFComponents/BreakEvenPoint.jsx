import React, { useMemo, useEffect } from "react";
import { Page, View, Text, Image } from "@react-pdf/renderer";
import { styles, stylesCOP, stylesMOF, styleExpenses } from "./Styles";
import { Font } from "@react-pdf/renderer";
import SAWatermark from "../Assets/SAWatermark";
import CAWatermark from "../Assets/CAWatermark";

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

const BreakEvenPoint = ({
  formData,
  yearlyInterestLiabilities = [], // ✅ Default Empty Array
  totalDepreciationPerYear = [], // ✅ Default Empty Array
  totalRevenueReceipts = [], // ✅ Default Empty Array
  fringAndAnnualCalculation,
  financialYearLabels,
  formatNumber,
  sendBreakEvenPointPercentage,
  receivedtotalRevenueReceipts,
  pdfType,
}) => {
  // console.log("received total revenue receipt", receivedtotalRevenueReceipts)
  const years = formData?.ProjectReportSetting?.ProjectionYears || 5; // Default to 5 years if not provided
  const projectionYears =
    parseInt(formData?.ProjectReportSetting?.ProjectionYears) || 0;

  // ✅ Months Array for Indexing
  const monthMap = [
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

  const calculateExpense = (annualExpense, yearIndex) => {
    const monthsInYear = monthsPerYear[yearIndex];
    let incrementedExpense;
    // Count years with actual repayment for applying increment correctly
    const repaymentYear = monthsPerYear
      .slice(0, yearIndex)
      .filter((months) => months > 0).length;

    if (monthsInYear === 0) {
      incrementedExpense = 0; // No expense during moratorium
    } else {
      incrementedExpense =
        annualExpense * Math.pow(1 + rateOfExpense, repaymentYear);
    }
    return (incrementedExpense / 12) * monthsInYear;
  };

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

  // ✅ Compute Adjusted Revenue Values for Each Year Before Rendering
  const adjustedRevenueValues = Array.from({
    length: parseInt(formData?.ProjectReportSetting?.ProjectionYears) || 0,
  }).map((_, yearIndex) => {
    const totalRevenue = totalRevenueReceipts[yearIndex] || 0;
    const closingStock = formData?.MoreDetails?.closingStock?.[yearIndex] || 0;
    const openingStock = formData?.MoreDetails?.openingStock?.[yearIndex] || 0;

    return totalRevenue + closingStock - openingStock; // ✅ Final computation
  });

  const { Expenses = {} } = formData;
  const { directExpense = [], indirectExpense = [] } = Expenses;

  // ✅ Ensure indirect expenses are correctly extracted (if stored in directExpense by mistake)
  const actualIndirectExpenses = indirectExpense.length
    ? indirectExpense // ✅ If indirectExpense exists separately, use it
    : directExpense.filter((expense) => expense.type === "indirect"); // ✅ Otherwise, filter from directExpense

  // ✅ Combine direct and actual indirect expenses correctly
  const allExpenses = [
    ...directExpense.filter((expense) => expense.type === "direct"),
    ...actualIndirectExpenses,
  ];

  // ✅ Compute Total Variable Expense for Each Year (Direct + Indirect)

  // ✅ Initialize Total Expenses Array
  const totalVariableExpenses = Array.from({ length: projectionYears }).map(
    (_, yearIndex) => {
      return allExpenses.reduce((total, expense) => {
        const baseValue = Number(expense.value) || 0;
        const isRawMaterial =
          expense.name.trim() === "Raw Material Expenses / Purchases";
        let expenseValue;

        if (isRawMaterial && String(expense.value).trim().endsWith("%")) {
          // ✅ If "Raw Material Expenses / Purchases" is a percentage, calculate based on revenue
          expenseValue =
            (parseFloat(expense.value) / 100) *
            receivedtotalRevenueReceipts[yearIndex];
        } else {
          // ✅ Otherwise, apply normal numeric calculation
          expenseValue = baseValue * 12 || 0;
        }

        // ✅ Apply growth calculation for normal expenses
        return (
          total +
          (isRawMaterial
            ? expenseValue // ✅ Directly add raw material expense
            : calculateExpense(expenseValue, yearIndex))
        ); // ✅ Apply calculation for others
      }, 0);
    }
  );

  // console.log("Total Expenses for Each Year:", totalVariableExpenses);

  // ✅ Compute Contribution for Each Year
  const contribution = adjustedRevenueValues.map(
    (value, index) => value - totalVariableExpenses[index]
  );

  // ✅ Compute Total Fixed Expenses for Each Year with Correct First-Year Handling
  const totalFixedExpenses = Array.from({ length: projectionYears }).map(
    (_, yearIndex) => {
      if (yearIndex === 0) {
        // ✅ Year 1 should display 0 for all fixed expenses
        return 0;
      }

      // ✅ Compute Salary & Wages with Annual Growth from Year 2 onwards
      const salaryAndWages = parseFloat(
        (
          fringAndAnnualCalculation *
          Math.pow(
            1 + formData.ProjectReportSetting.rateOfExpense / 100,
            yearIndex - 1 // Subtract 1 since first year is zero
          )
        ).toFixed(2)
      );

      // ✅ Extract Interest on Term Loan
      const interestOnTermLoan = parseFloat(
        (yearlyInterestLiabilities[yearIndex] || 0).toFixed(2)
      );

      // ✅ Extract Interest on Working Capital
      const interestExpenseOnWorkingCapital = parseFloat(
        (interestOnWorkingCapital[yearIndex] || 0).toFixed(2)
      );

      // ✅ Extract Depreciation
      const depreciationExpense = parseFloat(
        (totalDepreciationPerYear[yearIndex] || 0).toFixed(2)
      );

      // ✅ Sum Total Fixed Expenses for the Year
      const totalExpense = parseFloat(
        (
          salaryAndWages +
          interestOnTermLoan +
          interestExpenseOnWorkingCapital +
          depreciationExpense
        ).toFixed(2)
      );

      return totalExpense;
    }
  );

  // ✅ Compute Break Even Point (in %) for Each Year
  const breakEvenPointPercentage = Array.from({ length: projectionYears }).map(
    (_, yearIndex) => {
      const totalFixed = totalFixedExpenses[yearIndex] || 0; // Get total fixed expenses for the year
      const contributionValue = contribution[yearIndex] || 1; // Avoid division by zero by using fallback 1

      return (totalFixed / contributionValue) * 100; // Compute Break Even Point in %
    }
  );

  useEffect(() => {
    if (breakEvenPointPercentage.length > 0) {
      sendBreakEvenPointPercentage((prev) => ({
        ...prev,
        breakEvenPointPercentage,
      }));
    }
    // console.log("Sending Dscr : ", DSCR )
  }, [JSON.stringify(breakEvenPointPercentage)]);

  const hideFirstYear = receivedtotalRevenueReceipts?.[0] <= 0;

  return (
    <Page
      size={formData.ProjectReportSetting?.ProjectionYears > 12 ? "A3" : "A4"}
      orientation={
        formData.ProjectReportSetting?.ProjectionYears > 7
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
          {formData?.ProjectReportSetting?.AmountIn?.value === "rupees"
            ? "Rs" // ✅ Convert "rupees" to "Rs"
            : formData?.ProjectReportSetting?.AmountIn?.value}
          .)
        </Text>
      </View>

      <View style={[styleExpenses?.paddingx, { paddingBottom: "30px" }]}>
        {/* Fix: Using formData.clientName instead of localData.clientName */}
        <Text style={[styles.clientName]}>{formData.clientName}</Text>
        <View
          style={[
            stylesCOP.heading,
            {
              fontWeight: "bold",
              paddingLeft: 10,
            },
          ]}
        >
          <Text>Break-Even Point</Text>
        </View>

        <View style={[styles.table]}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.serialNoCell, styleExpenses.sno]}>S. No.</Text>
            <Text
              style={[
                styles.detailsCell,
                stylesCOP.boldText,
                styleExpenses.particularWidth,
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

          {/* ✅ Display Total Revenue Receipt Row */}
          <View
            style={[
              stylesMOF.row,
              styles.tableRow,
              {
                fontWeight: "black",
                borderBottom: 0,
              },
            ]}
          >
            {/* ✅ Serial Number */}
            <Text
              style={[
                stylesCOP.serialNoCellDetail,
                styleExpenses.sno,
                { paddingVertical: "10px" },
              ]}
            ></Text>

            {/* ✅ Title */}
            <Text
              style={[
                stylesCOP.detailsCellDetail,
                styleExpenses.particularWidth,
                styleExpenses.bordernone,
                { fontWeight: "extrabold", paddingVertical: "10px" },
              ]}
            >
              Gross Receipts
            </Text>

            {/* ✅ Dynamically Display Cells Based on Projection Years */}
            {Array.from({ length: projectionYears }).map(
              (_, yearIndex) =>
                (!hideFirstYear || yearIndex !== 0) && (
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
                        paddingVertical: "10px",
                        borderTopWidth: 0,
                        paddingBottom: "10px",
                      },
                    ]}
                  >
                    {/* ✅ Display revenue value if available, else 0 */}
                    {formatNumber(totalRevenueReceipts[yearIndex] || 0)}
                  </Text>
                )
            )}
          </View>

          {/* Closing Stock / Inventory */}
          <View style={[styles.tableRow, styles.totalRow]}>
            <Text
              style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}
            ></Text>
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
            }).map(
              (_, index) =>
                (!hideFirstYear || index !== 0) && (
                  <Text
                    key={`closingStock-${index}`}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                    ]}
                  >
                    {formatNumber(
                      formData.MoreDetails.closingStock?.[index] ?? 0
                    )}
                  </Text>
                )
            )}
          </View>
          {/* Opening Stock / Inventory */}
          <View style={[styles.tableRow, styles.totalRow]}>
            <Text
              style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}
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
            }).map(
              (_, index) =>
                (!hideFirstYear || index !== 0) && (
                  <Text
                    key={`openingStock-${index}`}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                    ]}
                  >
                    {formatNumber(
                      formData.MoreDetails.openingStock?.[index] ?? 0
                    )}
                  </Text>
                )
            )}
          </View>

          {/* Computation of Total Revenue, Adding Closing Stock, and Subtracting Opening Stock */}
          <View
            style={[
              stylesMOF.row,
              styles.tableRow,
              { borderBottomWidth: "0px" },
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
                { fontWeight: "extrabold" },
              ]}
            ></Text>

            {/* ✅ Display Computed Adjusted Revenue Values */}
            {adjustedRevenueValues.map(
              (finalValue, yearIndex) =>
                (!hideFirstYear || yearIndex !== 0) && (
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
                )
            )}
          </View>

          {/* Less: Variable Expense */}

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
              ></Text>
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
                Less: Variable Expense
              </Text>
              {Array.from({
                length: hideFirstYear ? projectionYears - 1 : projectionYears,
              }).map((_, yearIndex) => (
                <Text
                  key={yearIndex}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                    {
                      paddingVertical: "10px",
                      fontFamily: "Roboto",
                      fontWeight: "bold",
                    },
                  ]}
                ></Text>
              ))}
            </View>

            {/* ✅ Render All Expenses (Direct + Indirect) in a Single Section */}
            {allExpenses
              .filter((expense) => {
                const isRawMaterial =
                  expense.name.trim() === "Raw Material Expenses / Purchases";

                // ✅ Check if all projected values are zero
                const allValuesAreZero = Array.from({
                  length: projectionYears,
                }).every((_, yearIndex) => {
                  if (hideFirstYear && yearIndex === 0) return true; // Skip first year if hideFirstYear is true

                  let expenseValue;

                  if (
                    isRawMaterial &&
                    String(expense.value).trim().endsWith("%")
                  ) {
                    // ✅ If it's "Raw Material Expenses / Purchases" with percentage, calculate based on revenue
                    expenseValue =
                      (parseFloat(expense.value) / 100) *
                      receivedtotalRevenueReceipts[yearIndex];
                  } else {
                    // ✅ Otherwise, apply normal numeric calculation
                    expenseValue = Number(expense.value) * 12 || 0;
                  }

                  return expenseValue === 0;
                });

                return !allValuesAreZero; // ✅ Remove rows where all year values are zero
              })
              .map((expense, expenseIndex) => {
                const baseValue = Number(expense.value) || 0;
                const isRawMaterial =
                  expense.name.trim() === "Raw Material Expenses / Purchases";

                return (
                  <View
                    key={expenseIndex}
                    style={[styles.tableRow, styles.totalRow]}
                  >
                    {/* ✅ Serial No. (Adjusted after filtering) */}
                    <Text
                      style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}
                    >
                      {expenseIndex + 1}
                    </Text>

                    {/* ✅ Expense Name */}
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      {expense.name}
                    </Text>

                    {/* ✅ Calculate and Display Expense for Each Year */}
                    {Array.from({ length: projectionYears }).map(
                      (_, yearIndex) => {
                        if (hideFirstYear && yearIndex === 0) return null; // Skip first year if hideFirstYear is true

                        let expenseValue;

                        if (
                          isRawMaterial &&
                          String(expense.value).trim().endsWith("%")
                        ) {
                          // ✅ If "Raw Material Expenses / Purchases" with percentage, calculate based on revenue
                          expenseValue =
                            (parseFloat(expense.value) / 100) *
                            receivedtotalRevenueReceipts[yearIndex];
                        } else {
                          // ✅ Otherwise, apply normal numeric calculation
                          expenseValue = baseValue * 12 || 0;
                        }

                        // ✅ Format the expense value correctly
                        const formattedExpense = isRawMaterial
                          ? formatNumber(expenseValue.toFixed(2)) // Directly format raw material expenses
                          : formatNumber(
                              calculateExpense(expenseValue, yearIndex).toFixed(
                                2
                              )
                            );

                        return (
                          <Text
                            key={yearIndex}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formattedExpense}
                          </Text>
                        );
                      }
                    )}
                  </View>
                );
              })}

            {/* ✅ Total Row for Variable Expense */}
            <View
              style={[
                stylesMOF.row,
                styles.tableRow,
                styleExpenses.totalRow,
                { borderBottom: 0 },
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
                    fontFamily: "Roboto",
                    textAlign: "right",
                    paddingBottom: "10px",
                  },
                ]}
              >
                Total
              </Text>

              {/* ✅ Display Properly Formatted Totals for Each Year */}
              {totalVariableExpenses.map(
                (total, yearIndex) =>
                  (!hideFirstYear || yearIndex !== 0) && (
                    <Text
                      key={yearIndex}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                        {
                          fontFamily: "Roboto",
                          fontWeight: "extrabold",
                          borderBottom: 0,
                          paddingBottom: "10px",
                          borderTopWidth: ".5px",
                        },
                      ]}
                    >
                      {formatNumber(total)} {/* ✅ Correctly formatted total */}
                    </Text>
                  )
              )}
            </View>
          </View>

          {/* Contribution  */}

          <View
            style={[
              stylesMOF.row,
              styles.tableRow,
              {
                fontWeight: "black",
                borderBottomWidth: 0,
              },
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
                { fontWeight: "extrabold", fontFamily: "Roboto" },
              ]}
            >
              Contribution
            </Text>

            {/* ✅ Display Contribution for Each Year */}
            {contribution.map(
              (total, yearIndex) =>
                (!hideFirstYear || yearIndex !== 0) && (
                  <Text
                    key={yearIndex}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                      {
                        fontWeight: "extrabold",
                        fontFamily: "Roboto",
                        borderWidth: "1.2px",
                        borderLeftWidth: "0px",
                      },
                    ]}
                  >
                    {formatNumber(total)} {/* ✅ Round off Value */}
                  </Text>
                )
            )}
          </View>

          {/* Less: Fixed Expenses */}
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
              ></Text>
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
                Less: Fixed Expenses
              </Text>
              {Array.from({
                length: hideFirstYear ? projectionYears - 1 : projectionYears,
              }).map((_, yearIndex) => (
                <Text
                  key={yearIndex}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                    {
                      paddingVertical: "10px",
                      fontFamily: "Roboto",
                      fontWeight: "bold",
                    },
                  ]}
                ></Text>
              ))}
            </View>

            {/* Salary and Wages */}
            <View style={[styles.tableRow, styles.totalRow]}>
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
              {Array.from({ length: projectionYears }).map(
                (_, yearIndex) =>
                  (!hideFirstYear || yearIndex !== 0) && (
                    <Text
                      key={yearIndex}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                      ]}
                    >
                      {formatNumber(
                        calculateExpense(
                          Number(fringAndAnnualCalculation) || 0,
                          yearIndex
                        ).toFixed(2)
                      )}
                    </Text>
                  )
              )}
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
                2
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
                length: formData.ProjectReportSetting.ProjectionYears,
              }).map((_, index) => {
                if (hideFirstYear && index === 0) return null; // Skip first year if hideFirstYear is true

                return (
                  <Text
                    key={index}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                    ]}
                  >
                    {formatNumber(yearlyInterestLiabilities[index] || 0)}
                  </Text>
                );
              })}
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
                3
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
                if (hideFirstYear && yearIndex === 0) return null; // Skip first year if hideFirstYear is true
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

            {/* ✅ Render Depreciation Row */}
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

            {/* ✅ Total Row for Fixed Expenses */}
            <View
              style={[
                stylesMOF.row,
                styles.tableRow,
                styleExpenses.totalRow,
                { borderBottomWidth: 0 },
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
                    fontFamily: "Roboto",
                    textAlign: "right",
                  },
                ]}
              >
                Total
              </Text>

              {/* ✅ Display the calculated `totalFixedExpenses` */}
              {totalFixedExpenses.map(
                (totalValue, yearIndex) =>
                  (!hideFirstYear || yearIndex !== 0) && (
                    <Text
                      key={yearIndex}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        stylesCOP.boldText,
                        styleExpenses.fontSmall,
                        { fontFamily: "Roboto", fontWeight: "extrabold" },
                      ]}
                    >
                      {formatNumber(totalValue)}{" "}
                      {/* ✅ Round off for display only */}
                    </Text>
                  )
              )}
            </View>
          </View>

          {/* ✅ Break Even Point (in %) */}
          <View
            style={[
              stylesMOF.row,
              styles.tableRow,
              {
                fontWeight: "black",
                borderBottomWidth: 0,
                borderTopWidth: 0,
              },
            ]}
          >
            <Text
              style={[
                stylesCOP.serialNoCellDetail,
                styleExpenses.sno,
                { paddingVertical: "10px" },
              ]}
            ></Text>
            <Text
              style={[
                stylesCOP.detailsCellDetail,
                styleExpenses.particularWidth,
                styleExpenses.bordernone,
                {
                  fontWeight: "extrabold",
                  fontFamily: "Roboto",
                  paddingVertical: "10px",
                },
              ]}
            >
              Break Even Point (in %)
            </Text>

            {/* ✅ Display Break Even Point for Each Year with Two Decimal Places */}
            {breakEvenPointPercentage.map(
              (value, yearIndex) =>
                (!hideFirstYear || yearIndex !== 0) && (
                  <Text
                    key={yearIndex}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                      {
                        fontWeight: "extrabold",
                        fontFamily: "Roboto",
                        borderWidth: "0px",
                        borderRightWidth:"1px",
                        paddingVertical: "10px",

                      },
                    ]}
                  >
                    {formatNumber(parseFloat(value.toFixed(2)))}%{" "}
                    {/* ✅ Display with 2 Decimal Places */}
                  </Text>
                )
            )}
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
            marginTop: "50px",
          },
        ]}
      >
        <Text style={[styles.businessName, { fontSize: "10px" }]}>
          {formData?.AccountInformation?.businessName || "Business Name"}
        </Text>
        <Text style={[styles.FinancialYear, { fontSize: "10px" }]}>
          {formData?.AccountInformation?.clientName || "Client Name"}
        </Text>
      </View>
    </Page>
  );
};

export default React.memo(BreakEvenPoint);
