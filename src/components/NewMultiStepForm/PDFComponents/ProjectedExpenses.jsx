import React, { useMemo, useEffect } from "react";
import { Page, View, Text } from "@react-pdf/renderer";
import { styles, stylesCOP, stylesMOF, styleExpenses } from "./Styles";

const ProjectedExpenses = ({
  formData,
  yearlyInterestLiabilities,
  totalDepreciationPerYear,
  fringAndAnnualCalculation,
  financialYearLabels,
  transferCalculatedInterestOnWorkingCapital
}) => {
  const { Expenses = {} } = formData;
  const { normalExpense = [], directExpense = [] } = Expenses;
  const indirectExpense = directExpense.filter(
    (expense) => expense.type === "indirect"
  );

  const projectionYears =
  parseInt(formData.ProjectReportSetting.ProjectionYears) || 20;


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

  const moratoriumPeriodMonths =
    parseInt(formData?.ProjectReportSetting?.MoratoriumPeriod) || 0;

  const rateOfExpense =
    (formData?.ProjectReportSetting?.rateOfExpense || 0) / 100;

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

  // Function to calculate the expense for each year considering the increment rate
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

  // Function to calculate indirect expenses considering the increment rate
  const calculateIndirectExpense = (annualExpense, yearIndex) => {
    const monthsInYear = monthsPerYear[yearIndex];
    let incrementedExpense;
    const repaymentYear = monthsPerYear
      .slice(0, yearIndex)
      .filter((months) => months > 0).length;

    if (monthsInYear === 0) {
      incrementedExpense = 0;
    } else {
      incrementedExpense =
        annualExpense * Math.pow(1 + rateOfExpense, repaymentYear);
    }
    return (incrementedExpense / 12) * monthsInYear;
  };

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



 
  const totalDirectExpensesArray = Array.from({
    length: parseInt(formData.ProjectReportSetting.ProjectionYears) || 0,
  }).map((_, yearIndex) => {
    const totalDirectExpenses = directExpense
      .filter((expense) => expense.type === "direct")
      .reduce(
        (sum, expense) =>
          sum + calculateExpense(Number(expense.value) || 0, yearIndex),
        0
      );

    const initialSalaryWages = Number(fringAndAnnualCalculation) || 0;
    const totalSalaryWages = calculateExpense(initialSalaryWages, yearIndex);

    return totalDirectExpenses + totalSalaryWages;
  });

  const totalIndirectExpensesArray = Array.from({
    length: parseInt(formData.ProjectReportSetting.ProjectionYears) || 0,
  }).map((_, yearIndex) => {
    const totalIndirectExpenses = indirectExpense.reduce(
      (sum, expense) =>
        sum + calculateIndirectExpense(Number(expense.value) || 0, yearIndex),
      0
    );

    const interestOnTermLoan = yearlyInterestLiabilities[yearIndex] || 0;
    const interestExpenseOnWorkingCapital = calculateInterestOnWorkingCapital(
      interestOnWorkingCapital[yearIndex] || 0,
      yearIndex
    );
    const depreciationExpense = totalDepreciationPerYear[yearIndex] || 0;

    const total =
      totalIndirectExpenses +
      interestOnTermLoan +
      interestExpenseOnWorkingCapital +
      depreciationExpense;

    // console.log(`Year ${yearIndex + 1}:`);
    // console.log(`  Indirect Expenses: ${totalIndirectExpenses.toFixed(2)}`);
    // console.log(`  Interest on Term Loan: ${interestOnTermLoan.toFixed(2)}`);
    // console.log(`  Interest on Working Capital: ${interestExpenseOnWorkingCapital.toFixed(2)}`);
    // console.log(`  Depreciation: ${depreciationExpense.toFixed(2)}`);
    // console.log(`  TOTAL: ${total.toFixed(2)}`);

    return total;
  });

  const formatNumber = (value) => {
    const formatType = formData?.ProjectReportSetting?.Format || "1"; // Default to Indian Format

    if (value === undefined || value === null || isNaN(value)) return "0"; // ✅ Handle invalid values

    switch (formatType) {
      case "1": // Indian Format (1,23,456)
        return new Intl.NumberFormat("en-IN").format(value);

      case "2": // USD Format (1,123,456)
        return new Intl.NumberFormat("en-US").format(value);

      case "3": // Generic Format (1,23,456)
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
      style={[{ paddingVertical: "30px" }]}
    >
      <View style={styleExpenses.paddingx}>
        <View>
          <Text style={styles.clientName}>
            {formData.AccountInformation.clientName}
          </Text>
          <View style={stylesCOP.heading}>
            <Text>Projected Expenses</Text>
          </View>

          <View style={[styles.table]}>
            <View style={styles.tableHeader}>
              <Text style={[styles.serialNoCell, styleExpenses.sno]}>
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
          </View>
        </View>

        {/* Direct Expenses */}
        <View>
          <View style={[stylesMOF.row, styleExpenses.headerRow]}>
            <Text style={[styleExpenses.sno]}>A</Text>
            <Text style={stylesMOF.cell}>Direct Expenses</Text>
          </View>

          {/* Salary and Wages */}
          <View style={[styles.tableRow, styles.totalRow]}>
            <Text style={stylesCOP.serialNoCellDetail}>1</Text>
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
          {/* Direct Expenses */}
          {directExpense
            .filter((expense) => expense.type === "direct")
            .map((expense, index) => (
              <View key={index} style={[styles.tableRow, styles.totalRow]}>
                <Text style={stylesCOP.serialNoCellDetail}>{index + 2}</Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  {expense.name}
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
                        Number(expense.value) || 0,
                        yearIndex
                      ).toFixed(2)
                    )}
                  </Text>
                ))}
              </View>
            ))}

          {/* Total Direct Expenses */}
          <View style={[styles.tableRow, styles.totalRow]}>
            <Text style={stylesCOP.serialNoCellDetail}></Text>
            <Text
              style={[
                stylesCOP.detailsCellDetail,
                styleExpenses.particularWidth,
                styleExpenses.bordernone,
              ]}
            >
              Total
            </Text>
            {totalDirectExpensesArray.map((grandTotal, yearIndex) => (
              <Text
                key={yearIndex}
                style={[
                  stylesCOP.particularsCellsDetail,
                  stylesCOP.boldText,
                  styleExpenses.fontSmall,
                ]}
              >
                {formatNumber(grandTotal.toFixed(2))}
              </Text>
            ))}
          </View>
        </View>

        {/* Indirect Expenses  */}
        <View>
          <View style={[stylesMOF.row, styleExpenses.headerRow]}>
            <Text style={[styleExpenses.sno]}>B</Text>
            <Text style={stylesMOF.cell}>Indirect Expenses</Text>
          </View>

          {/* ✅ Interest On Term Loan (Corrected Display) */}
          {yearlyInterestLiabilities.length > 0 && (
            <View style={[styles.tableRow, styles.totalRow]}>
              {/* Serial Number */}
              <Text style={stylesCOP.serialNoCellDetail}>1</Text>

              {/* Interest On Term Loan Label */}
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                ]}
              >
                Interest On Term Loan
              </Text>

              {Array.from({
                length: formData?.ProjectReportSetting?.ProjectionYears || 0,
              }).map((_, yearIndex) => {
                const firstInterestYear =
                  yearlyInterestLiabilities?.findIndex((value) => value > 0) ||
                  0;

                // Shift the values so first non-zero interest starts from Year 1
                const adjustedInterestValues = Array.from(
                  { length: formData?.ProjectReportSetting?.ProjectionYears },
                  (_, i) =>
                    yearlyInterestLiabilities?.[firstInterestYear + i] || 0
                );

                return (
                  <Text
                    key={yearIndex}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                    ]}
                  >
                    {formatNumber(adjustedInterestValues[yearIndex])}
                  </Text>
                );
              })}
            </View>
          )}

          {/* Interest on Working Capital */}
          <View style={[styles.tableRow, styles.totalRow]}>
            <Text style={stylesCOP.serialNoCellDetail}>2</Text>

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
          <View style={[styles.tableRow, styles.totalRow]}>
            <Text style={stylesCOP.serialNoCellDetail}>3</Text>
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

              return (
                <View key={index} style={[styles.tableRow, styles.totalRow]}>
                  {/* Serial Number */}
                  <Text style={stylesCOP.serialNoCellDetail}>{index + 4}</Text>

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

                  {/* Loop through Projection Years */}
                  {Array.from({
                    length:
                      parseInt(formData.ProjectReportSetting.ProjectionYears) ||
                      0,
                  }).map((_, yearIndex) => {
                    const calculatedValue = calculateIndirectExpense(
                      baseValue,
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

          {/* ✅ Total Indirect Expenses Row */}
          <View style={[styles.tableRow, styles.totalRow]}>
            <Text style={stylesCOP.serialNoCellDetail}></Text>
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
            {totalIndirectExpensesArray.map((totalValue, yearIndex) => (
              <Text
                key={yearIndex}
                style={[
                  stylesCOP.particularsCellsDetail,
                  stylesCOP.boldText,
                  styleExpenses.fontSmall,
                ]}
              >
                {formatNumber(totalValue.toFixed(2))}
              </Text>
            ))}
          </View>
        </View>
      </View>
    </Page>
  );
};

export default ProjectedExpenses;
