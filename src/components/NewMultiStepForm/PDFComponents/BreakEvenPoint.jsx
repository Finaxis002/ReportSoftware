import React, { useMemo } from "react";
import { Page, View, Text } from "@react-pdf/renderer";
import { styles, stylesCOP, stylesMOF, styleExpenses } from "./Styles";
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

const BreakEvenPoint = ({
  formData,
  yearlyInterestLiabilities = [], // ✅ Default Empty Array
  totalDepreciationPerYear = [], // ✅ Default Empty Array
  totalRevenueReceipts = [], // ✅ Default Empty Array
  fringAndAnnualCalculation,
  financialYearLabels,
}) => {
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
  const totalVariableExpense = Array.from({
    length: parseInt(formData.ProjectReportSetting.ProjectionYears) || 0,
  }).map((_, yearIndex) => {
    // ✅ Compute Direct Expenses Sum
    const directExpenseTotal = directExpense.reduce((total, expense) => {
      const baseValue = Number(expense.value) || 0;
      const calculatedValue =
        baseValue *
        Math.pow(
          1 + formData.ProjectReportSetting.rateOfExpense / 100,
          yearIndex
        );
      return total + calculatedValue;
    }, 0);
    // ✅ Compute Indirect Expenses Sum
    const indirectExpenseTotal = indirectExpense.reduce((total, expense) => {
      const baseValue = Number(expense.value) || 0;
      const calculatedValue =
        baseValue *
        Math.pow(
          1 + formData.ProjectReportSetting.rateOfExpense / 100,
          yearIndex
        );
      return total + calculatedValue;
    }, 0);

    // ✅ Return Sum of Direct + Indirect Expenses
    return directExpenseTotal + indirectExpenseTotal;
  });

  // ✅ Compute Contribution for Each Year
  const contribution = adjustedRevenueValues.map(
    (value, index) => value - totalVariableExpense[index]
  );

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

  // ✅ Compute Total Fixed Expenses for Each Year
  const totalFixedExpenses = Array.from({ length: projectionYears }).map(
    (_, yearIndex) => {
      // ✅ Compute Salary & Wages with Growth Rate
      const salaryAndWages =
        yearIndex === 0
          ? fringAndAnnualCalculation
          : fringAndAnnualCalculation *
            Math.pow(
              1 + formData.ProjectReportSetting.rateOfExpense / 100,
              yearIndex
            );

      // ✅ Extract Interest on Term Loan
      const interestOnTermLoan = yearlyInterestLiabilities[yearIndex] || 0;

      // ✅ Extract Interest on Working Capital
      const interestExpenseOnWorkingCapital =
        interestOnWorkingCapital[yearIndex] || 0;

      // ✅ Extract Depreciation
      const depreciationExpense = totalDepreciationPerYear[yearIndex] || 0;

      // ✅ Compute Total Fixed Expenses (Without Rounding)
      return (
        salaryAndWages +
        interestOnTermLoan +
        interestExpenseOnWorkingCapital +
        depreciationExpense
      );
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
    >
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
        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text
            style={[styles.serialNoCell, stylesCOP.boldText, { width: "85px" }]}
          >
            Sr. No.
          </Text>
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
          {financialYearLabels.map((yearLabel, yearIndex) => (
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
            Gross Receipts
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

        {/* Less: Variable Expense */}
        <View style={[stylesMOF.row, styleExpenses.headerRow]}>
          <Text style={[styleExpenses.sno]}></Text>
          <Text style={stylesMOF.cell}>Less: Variable Expense</Text>
        </View>
        {/* {directExpense
          .filter((expense) => expense.type === "direct")
          .map((expense, index) => {
            const baseValue = Number(expense.value) || 0;
            // const initialValue = baseValue * 12;
            const initialValue = baseValue;

            return (
              <View key={index} style={[stylesMOF.row, styles.tableRow]}>
                <Text
                  style={[
                    stylesCOP.serialNoCellDetail,
                    styleExpenses.sno,
                    styleExpenses.bordernone,
                  ]}
                >
                  {index + 1}
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
          })} */}

        {/* ✅ Render All Expenses (Direct + Indirect) in a Single Section */}
        {allExpenses.map((expense, index) => {
          const baseValue = Number(expense.value) || 0;
          const initialValue = baseValue;

          // Calculate the values for each year based on expense growth rate
          const expenseValuesForYears = Array.from({
            length: projectionYears,
          }).map((_, yearIndex) => {
            return calculateExpense(Number(expense.value) || 0, yearIndex);
          });

          // Calculate the total for each year and format the values
          const totalExpenseForEachYear = expenseValuesForYears.map(
            (value, yearIndex) => {
              return formatNumber(Math.round(value)); // Round and format the expense values
            }
          );

          return (
            <View key={index} style={[stylesMOF.row, styles.tableRow]}>
              {/* Serial Number */}
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  styleExpenses.sno,
                  styleExpenses.bordernone,
                ]}
              >
                {index + 1}
              </Text>

              {/* Expense Name */}
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                ]}
              >
                {expense.name}
              </Text>

              {/* ✅ Display Projection Year Values */}
              {expenseValuesForYears.map((value, yearIndex) => (
                <Text
                  key={yearIndex}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                  ]}
                >
                  {formatNumber(value.toFixed(2))}
                </Text>
              ))}
            </View>
          );
        })}

        {/* ✅ Total Row for Variable Expense */}
        <View style={[stylesMOF.row, styles.tableRow, styleExpenses.totalRow]}>
          <Text
            style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}
          ></Text>
          <Text
            style={[
              stylesCOP.detailsCellDetail,
              styleExpenses.particularWidth,
              styleExpenses.bordernone,
              { fontWeight: "bold", fontFamily: "Roboto", textAlign: "right" },
            ]}
          >
            Total
          </Text>

          {/* ✅ Calculate and Display Total for Each Year */}
          {totalVariableExpense.map((total, yearIndex) => (
            <Text
              key={yearIndex}
              style={[
                stylesCOP.particularsCellsDetail,
                styleExpenses.fontSmall,
                { fontFamily: "Roboto", fontWeight: "extrabold" },
              ]}
            >
              {formatNumber(Math.round(total))}
            </Text>
          ))}
        </View>

        {/* Contribution  */}

        <View
          style={[
            stylesMOF.row,
            styles.tableRow,
            {
              fontWeight: "black",
              borderLeft: "2px solid #000",
              marginVertical: "8px",
            },
          ]}
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
              { fontWeight: "extrabold", fontFamily: "Roboto" },
            ]}
          >
            Contribution
          </Text>

          {/* ✅ Display Contribution for Each Year */}
          {contribution.map((total, yearIndex) => (
            <Text
              key={yearIndex}
              style={[
                stylesCOP.particularsCellsDetail,
                styleExpenses.fontSmall,
                {
                  fontWeight: "extrabold",
                  fontFamily: "Roboto",
                  borderWidth: "2px",
                  borderLeftWidth: "0px",
                },
              ]}
            >
              {formatNumber(Math.round(total))} {/* ✅ Round off Value */}
            </Text>
          ))}
        </View>

        {/* Less: Fixed Expenses */}
        <View style={[stylesMOF.row, styleExpenses.headerRow]}>
          <Text style={[styleExpenses.sno]}></Text>
          <Text style={stylesMOF.cell}> Less: Fixed Expenses</Text>
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
          {Array.from({ length: projectionYears }).map((_, yearIndex) => (
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
          }).map((_, index) => (
            <Text
              key={index}
              style={[
                stylesCOP.particularsCellsDetail,
                styleExpenses.fontSmall,
              ]}
            >
              {formatNumber(yearlyInterestLiabilities[index] || 0)}
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

        {/* ✅ Render Depreciation Row */}
        <View style={[stylesMOF.row, styles.tableRow]}>
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

        {/* ✅ Total Row for Fixed Expenses */}
        <View style={[stylesMOF.row, styles.tableRow, styleExpenses.totalRow]}>
          <Text
            style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}
          ></Text>
          <Text
            style={[
              stylesCOP.detailsCellDetail,
              styleExpenses.particularWidth,
              styleExpenses.bordernone,
              { fontWeight: "bold", fontFamily: "Roboto", textAlign: "right" },
            ]}
          >
            Total
          </Text>

          {/* ✅ Display the calculated `totalFixedExpenses` */}
          {totalFixedExpenses.map((totalValue, yearIndex) => (
            <Text
              key={yearIndex}
              style={[
                stylesCOP.particularsCellsDetail,
                stylesCOP.boldText,
                styleExpenses.fontSmall,
                { fontFamily: "Roboto", fontWeight: "extrabold" },
              ]}
            >
              {formatNumber(Math.round(totalValue))}{" "}
              {/* ✅ Round off for display only */}
            </Text>
          ))}
        </View>

        {/* ✅ Break Even Point (in %) */}
        <View
          style={[
            stylesMOF.row,
            styles.tableRow,
            {
              fontWeight: "black",
              borderLeft: "2px solid #000",
              marginVertical: "8px",
            },
          ]}
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
              { fontWeight: "extrabold", fontFamily: "Roboto" },
            ]}
          >
            Break Even Point (in %)
          </Text>

          {/* ✅ Display Break Even Point for Each Year with Two Decimal Places */}
          {breakEvenPointPercentage.map((value, yearIndex) => (
            <Text
              key={yearIndex}
              style={[
                stylesCOP.particularsCellsDetail,
                styleExpenses.fontSmall,
                {
                  fontWeight: "extrabold",
                  fontFamily: "Roboto",
                  borderWidth: "0px",
                },
              ]}
            >
              {formatNumber(parseFloat(value.toFixed(2)))}%{" "}
              {/* ✅ Display with 2 Decimal Places */}
            </Text>
          ))}
        </View>
      </View>
    </Page>
  );
};

export default BreakEvenPoint;
