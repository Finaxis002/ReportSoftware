import React, { useMemo, useEffect } from "react";
import { Page, View, Text, Image } from "@react-pdf/renderer";
import { styles, stylesCOP, stylesMOF, styleExpenses } from "./Styles";
import SAWatermark from "../Assets/SAWatermark";
import CAWatermark from "../Assets/CAWatermark";

const ProjectedExpenses = ({
  formData,
  yearlyInterestLiabilities,
  totalDepreciationPerYear,
  fringAndAnnualCalculation,
  financialYearLabels,
  receivedtotalRevenueReceipts,
  formatNumber,
  onTotalExpenseSend,
  pdfType,
}) => {
  //  console.log("Received total depreciation", totalDepreciationPerYear)

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
    // ✅ Calculate total direct expenses including "Raw Material Expenses / Purchases"
    const totalDirectExpenses = directExpense
      .filter((expense) => expense.type === "direct")
      .reduce((sum, expense) => {
        // ✅ Check if this is "Raw Material Expenses / Purchases"
        const isRawMaterial =
          expense.name.trim() === "Raw Material Expenses / Purchases";

        let expenseValue;
        if (isRawMaterial && String(expense.value).trim().endsWith("%")) {
          // ✅ Calculate as percentage of total revenue
          expenseValue =
            (parseFloat(expense.value) / 100) *
            receivedtotalRevenueReceipts[yearIndex];
        } else {
          // ✅ Normal calculation for other expenses
          expenseValue = Number(expense.value) * 12 || 0;
        }

        // ✅ Apply calculateExpense only for non-raw material expenses
        return (
          sum +
          (isRawMaterial
            ? expenseValue
            : calculateExpense(expenseValue, yearIndex))
        );
      }, 0);

    // ✅ Add Salary & Wages Calculation
    const initialSalaryWages = Number(fringAndAnnualCalculation) || 0;
    const totalSalaryWages = calculateExpense(initialSalaryWages, yearIndex);

    return totalDirectExpenses + totalSalaryWages;
  });

  const totalIndirectExpensesArray = Array.from({
    length: parseInt(formData.ProjectReportSetting.ProjectionYears) || 0,
  }).map((_, yearIndex) => {
    const totalIndirectExpenses = indirectExpense.reduce(
      (sum, expense) =>
        sum +
        calculateIndirectExpense(Number(expense.value * 12) || 0, yearIndex),
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

  // ✅ Calculate Total (A + B) for each year
  const totalExpensesArray = totalDirectExpensesArray.map(
    (directExpense, index) => {
      const indirectExpense = totalIndirectExpensesArray[index] || 0;
      return directExpense + indirectExpense;
    }
  );

  useEffect(() => {
    if (totalExpensesArray.length > 0) {
      onTotalExpenseSend(totalExpensesArray);
    }
  }, [JSON.stringify(totalExpensesArray)]);

  useEffect(() => {
    if (totalExpensesArray.length > 0) {
      // ✅ Pass the totalExpensesArray to PdfWithChart.jsx
      onTotalExpenseSend(totalExpensesArray);
    }
  }, [JSON.stringify(totalExpensesArray), onTotalExpenseSend]);
  

  const hideFirstYear = receivedtotalRevenueReceipts?.[0] <= 0;

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
      style={[{ padding: "20px" }]}
    >
      {/* watermark  */}
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
          {formData?.ProjectReportSetting?.AmountIn?.value === "rupees"
            ? "Rs" // ✅ Convert "rupees" to "Rs"
            : formData?.ProjectReportSetting?.AmountIn?.value}
          .)
        </Text>
      </View>

      <View style={[styleExpenses.paddingx]}>
        <View>
          <View style={stylesCOP.heading}>
            <Text>Projected Expenses</Text>
          </View>

          <View style={[styles.table]}>
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
          </View>
        </View>

        {/* Direct Expenses */}
        <View style={[{ borderLeftWidth: 1 }]}>
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
              Direct Expenses
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
            {Array.from({
              length: hideFirstYear ? projectionYears - 1 : projectionYears,
            }).map((_, yearIndex) => (
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
                    hideFirstYear ? yearIndex + 1 : yearIndex // Shift index when skipping the first year
                  ).toFixed(2)
                )}
              </Text>
            ))}
          </View>
          {/* Direct Expenses */}
          {directExpense
            .filter((expense) => {
              // ✅ Filter out rows where all year values are zero
              const isAllYearsZero = Array.from({
                length: hideFirstYear ? projectionYears - 1 : projectionYears,
              }).every((_, yearIndex) => {
                const adjustedYearIndex = hideFirstYear
                  ? yearIndex + 1
                  : yearIndex;
                let expenseValue;

                if (
                  expense.name.trim() === "Raw Material Expenses / Purchases" &&
                  String(expense.value).trim().endsWith("%")
                ) {
                  expenseValue =
                    (parseFloat(expense.value) / 100) *
                    receivedtotalRevenueReceipts[adjustedYearIndex];
                } else {
                  expenseValue = Number(expense.value) * 12 || 0;
                }

                // ✅ Check if the value is zero for this year
                return expenseValue === 0;
              });

              return expense.type === "direct" && !isAllYearsZero; // ✅ Filter out if all year values are zero
            })
            .map((expense, index) => {
              const isRawMaterial =
                expense.name.trim() === "Raw Material Expenses / Purchases";

              return (
                <View key={index} style={[styles.tableRow, styles.totalRow]}>
                  {/* ✅ Adjust index for filtered data */}
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

                  {Array.from({
                    length: hideFirstYear
                      ? projectionYears - 1
                      : projectionYears,
                  }).map((_, yearIndex) => {
                    let expenseValue;

                    const adjustedYearIndex = hideFirstYear
                      ? yearIndex + 1
                      : yearIndex;

                    if (
                      isRawMaterial &&
                      String(expense.value).trim().endsWith("%")
                    ) {
                      expenseValue =
                        (parseFloat(expense.value) / 100) *
                        receivedtotalRevenueReceipts[adjustedYearIndex];
                    } else {
                      expenseValue = Number(expense.value) * 12 || 0;
                    }

                    const formattedExpense = isRawMaterial
                      ? formatNumber(expenseValue.toFixed(2))
                      : formatNumber(
                          calculateExpense(
                            expenseValue,
                            adjustedYearIndex
                          ).toFixed(2)
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
                  })}
                </View>
              );
            })}

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
              Total A
            </Text>
            {totalDirectExpensesArray
              .slice(hideFirstYear ? 1 : 0) // ✅ Skip first year dynamically
              .map((grandTotal, yearIndex) => (
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
        <View style={[{ borderLeftWidth: 1, borderBottom: 1 }]}>
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
              Indirect Expenses
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
              length: hideFirstYear
                ? formData?.ProjectReportSetting?.ProjectionYears - 1
                : formData?.ProjectReportSetting?.ProjectionYears || 0, // Adjust length
            }).map((_, index) => {
              const adjustedIndex = hideFirstYear ? index + 1 : index; // Shift index when skipping first year

              return (
                <Text
                  key={index}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                  ]}
                >
                  {formatNumber(
                    yearlyInterestLiabilities?.[adjustedIndex] ?? 0
                  )}
                </Text>
              );
            })}
          </View>

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
              length: hideFirstYear
                ? formData?.ProjectReportSetting?.ProjectionYears - 1
                : formData?.ProjectReportSetting?.ProjectionYears || 0, // Adjust length
            }).map((_, index) => {
              const adjustedIndex = hideFirstYear ? index + 1 : index; // Shift index when skipping first year
              const calculatedInterest = calculateInterestOnWorkingCapital(
                interestOnWorkingCapital[adjustedIndex] || 0,
                adjustedIndex
              );

              return (
                <Text
                  key={adjustedIndex}
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
            {totalDepreciationPerYear
              .slice(hideFirstYear ? 1 : 0) // ✅ Skip first year dynamically
              .map((depreciationValue, yearIndex) => (
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
            .filter((expense) => {
              // ✅ Filter out rows where all calculated year values are zero
              const isAllYearsZero = Array.from({
                length: hideFirstYear
                  ? parseInt(formData.ProjectReportSetting.ProjectionYears) - 1
                  : parseInt(formData.ProjectReportSetting.ProjectionYears) ||
                    0,
              }).every((_, yearIndex) => {
                const adjustedIndex = hideFirstYear ? yearIndex + 1 : yearIndex;
                const baseValue = Number(expense.value) || 0;
                const calculatedValue = calculateIndirectExpense(
                  baseValue,
                  adjustedIndex
                );
                return calculatedValue * 12 === 0; // ✅ If all calculated values are zero, filter out
              });

              return expense.type === "indirect" && !isAllYearsZero;
            })
            .map((expense, index) => {
              const baseValue = Number(expense.value) || 0;

              return (
                <View key={index} style={[styles.tableRow, styles.totalRow]}>
                  {/* ✅ Adjust Serial Number after filtering */}
                  <Text style={stylesCOP.serialNoCellDetail}>{index + 4}</Text>

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

                  {/* ✅ Loop through Projection Years */}
                  {Array.from({
                    length: hideFirstYear
                      ? parseInt(
                          formData.ProjectReportSetting.ProjectionYears
                        ) - 1
                      : parseInt(
                          formData.ProjectReportSetting.ProjectionYears
                        ) || 0,
                  }).map((_, yearIndex) => {
                    const adjustedIndex = hideFirstYear
                      ? yearIndex + 1
                      : yearIndex;

                    const calculatedValue = calculateIndirectExpense(
                      baseValue,
                      adjustedIndex
                    );

                    return (
                      <Text
                        key={yearIndex}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                        ]}
                      >
                        {formatNumber((calculatedValue * 12).toFixed(2))}
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
              Total B
            </Text>

            {/* ✅ Display the calculated `totalIndirectExpensesArray` */}
            {totalIndirectExpensesArray
              .slice(hideFirstYear ? 1 : 0) // ✅ Skip first year if receivedtotalRevenueReceipts[0] < 0
              .map((totalValue, yearIndex) => (
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

          {/* blank row */}
          <View style={[styles.tableRow, styles.totalRow]}>
            {/* Serial Number */}
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
            ></Text>

            {/* Get total projection years */}
            {Array.from({
              length: hideFirstYear
                ? formData?.ProjectReportSetting?.ProjectionYears - 1
                : formData?.ProjectReportSetting?.ProjectionYears || 0, // Adjust length
            }).map((_, index) => {
              const adjustedIndex = hideFirstYear ? index + 1 : index; // Shift index when skipping first year

              return (
                <Text
                  key={index}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                  ]}
                ></Text>
              );
            })}
          </View>

          {/* ✅ Total (A + B) - Combined Direct and Indirect Expenses */}
          <View style={[styles.tableRow, styles.totalRow]}>
            <Text style={stylesCOP.serialNoCellDetail}></Text>
            <Text
              style={[
                stylesCOP.detailsCellDetail,
                styleExpenses.particularWidth,
                styleExpenses.bordernone,
              ]}
            >
              Total Expenses(A + B)
            </Text>

            {/* ✅ Display the combined total for each year */}
            {totalExpensesArray
              .slice(hideFirstYear ? 1 : 0)
              .map((totalValue, yearIndex) => (
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

export default React.memo(ProjectedExpenses);
