import React from "react";
import { Page, View, Text } from "@react-pdf/renderer";
import { styles, stylesCOP, stylesMOF, styleExpenses } from "./Styles"; // Import only necessary styles

const ProjectedExpenses = ({
  formData,
  yearlyInterestLiabilities,
  totalDepreciationPerYear,
}) => {
  // Ensure formData and Expenses exist before destructuring
  const activeRowIndex = 0; // Define it or fetch dynamically if needed
  const { Expenses = {} } = formData; // Destructure Expenses safely with fallback to empty object
  const { normalExpense = [], directExpense = [] } = Expenses;

  const totalAnnualWages = normalExpense.reduce(
    (sum, expense) => sum + Number(expense.amount * expense.quantity * 12 || 0),
    0
  );

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

  // ✅ Compute Interest on Working Capital for Each Year
  const interestOnWorkingCapital = Array.from({ length: projectionYears }).map(
    (_, yearIndex) => {
      // First year → Interest only for months from start month onwards
      const monthsInYear = yearIndex === 0 ? 12 - repaymentStartMonth : 12;

      // Apply the formula
      return Math.round(
        workingCapitalLoan * interestRate * (monthsInYear / 12)
      );
    }
  );

  // ✅ Calculate total direct expenses for each projection year
  const totalDirectExpensesArray = Array.from({
    length: parseInt(formData.ProjectReportSetting.ProjectionYears) || 0,
  }).map((_, yearIndex) => {
    const totalDirectExpenses = directExpense
      .filter((expense) => expense.type === "direct")
      .reduce((sum, expense) => {
        const baseValue = Number(expense.value) || 0;
        const initialValue = baseValue * 12; // Convert to annual
        return (
          sum +
          initialValue *
            Math.pow(
              1 + formData.ProjectReportSetting.rateOfExpense / 100,
              yearIndex
            )
        );
      }, 0);

    // ✅ Include Salary and Wages in the total
    const initialSalaryWages = Number(totalAnnualWages) || 0;
    const totalSalaryWages =
      yearIndex === 0
        ? initialSalaryWages
        : initialSalaryWages *
          Math.pow(
            1 + formData.ProjectReportSetting.rateOfExpense / 100,
            yearIndex
          );

    return totalDirectExpenses + totalSalaryWages; // ✅ Final Grand Total
  });

  // ✅ Calculate Total Indirect Expenses for Each Year
  const totalIndirectExpensesArray = Array.from({
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
        const initialValue = baseValue * 12; // Convert to annual
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

  // ✅ Calculate Grand Total (A + B)
  const grandTotalArray = totalDirectExpensesArray.map((directTotal, index) => {
    return directTotal + (totalIndirectExpensesArray[index] || 0);
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
    >
      <View style={styleExpenses.paddingx}>
        <Text style={styles.clientName}>
          {formData.AccountInformation.clientName}
        </Text>
        <View style={stylesCOP.heading}>
          <Text>Projected Expenses</Text>
        </View>

        <View style={[styles.table]}>
          <View style={styles.tableHeader}>
            <Text style={[styles.serialNoCell, styleExpenses.sno]}>S. No.</Text>
            <Text style={[styles.detailsCell, styleExpenses.particularWidth]}>
              Particulars
            </Text>
            {[
              ...Array(
                parseInt(formData.ProjectReportSetting.ProjectionYears) || 0
              ),
            ].map((_, index) => (
              <Text key={index} style={styles.particularsCell}>
                Year {index + 1}
              </Text>
            ))}
          </View>
        </View>

        {/* direct expenses */}
        <View style={[stylesMOF.row, styleExpenses.headerRow]}>
          <Text style={[styleExpenses.sno]}>A</Text>
          <Text style={stylesMOF.cell}>Direct Expenses</Text>
        </View>

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
                const Annual = Number(totalAnnualWages) || 0;
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
            const initialValue = baseValue * 12;

            return (
              <View key={index} style={[stylesMOF.row, styles.tableRow]}>
                <Text
                  style={[
                    stylesCOP.serialNoCellDetail,
                    styleExpenses.sno,
                    styleExpenses.bordernone,
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

        {/* Total Direct Expenses Row */}
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
            Total
          </Text>

          {/* ✅ Use `totalDirectExpensesArray` here */}
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

        {/* indirect expense */}
        <View style={[stylesMOF.row, styleExpenses.headerRow]}>
          <Text style={[styleExpenses.sno]}>B</Text>
          <Text style={stylesMOF.cell}>Indirect Expenses</Text>
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
            Interest on Working Capital
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
                      {formatNumber(calculatedValue.toFixed(2))}
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

        {/* total a and b  */}

        <View style={[stylesMOF.row, styleExpenses.headerRow]}>
          <Text style={[styleExpenses.sno]}></Text>
          <Text style={stylesMOF.cell}>Grand Total</Text>
        </View>

        {/* Total Expenses (A + B) Row */}
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
            Total (A + B)
          </Text>

          {/* ✅ Use the calculated `grandTotalArray` here */}
          {grandTotalArray.map((grandTotal, yearIndex) => (
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
    </Page>
  );
};

export default ProjectedExpenses;
