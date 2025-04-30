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
  orientation,
}) => {
  //  console.log("Received total depreciation", yearlyInterestLiabilities)

  const { Expenses = {} } = formData;
  const { normalExpense = [], directExpense = [] } = Expenses;
  const indirectExpense = directExpense.filter(
    (expense) => expense.type === "indirect"
  );

  const projectionYears =
    parseInt(formData.ProjectReportSetting.ProjectionYears) || 5;

  const hideFirstYear = receivedtotalRevenueReceipts?.[0] <= 0;

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

  // Function to handle moratorium period spillover across financial years
  const calculateMonthsPerYear = () => {
    let monthsArray = [];
    let remainingMoratorium = moratoriumPeriodMonths;

    for (let year = 1; year <= projectionYears; year++) {
      let monthsInYear;

      // ✅ If first year is hidden, apply starting month logic on second year
      const isEffectiveFirstYear =
        (!hideFirstYear && year === 1) || (hideFirstYear && year === 2);

      if (isEffectiveFirstYear) {
        monthsInYear = 12 - x + 1;
      } else {
        monthsInYear = 12;
      }

      // ✅ Apply moratorium logic
      if (remainingMoratorium >= monthsInYear) {
        monthsArray.push(0);
        remainingMoratorium -= monthsInYear;
      } else {
        monthsArray.push(monthsInYear - remainingMoratorium);
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
      const monthsInYear = monthsPerYear[yearIndex];

      if (monthsInYear === 0) {
        return 0; // Entire year under moratorium
      }

      // ✅ Determine first visible repayment year index
      const isProRataYear =
        (!hideFirstYear && yearIndex === 0) ||
        (hideFirstYear && yearIndex === 1);

      const repaymentYear = monthsPerYear
        .slice(0, yearIndex)
        .filter((months, idx) => months > 0).length;

      if (isProRataYear && moratoriumPeriodMonths > 0) {
        // 🧮 Months applicable in first repayment year (e.g. May = month 2, then 11 months)
        const monthsEffective = monthsInYear;
        return (interestAmount * monthsEffective) / 12;
      } else if (repaymentYear >= 1) {
        return interestAmount; // Full interest from second visible repayment year onward
      } else {
        return 0; // No interest during moratorium
      }
    };
  }, [moratoriumPeriodMonths, monthsPerYear, rateOfExpense, hideFirstYear]);

  interestOnWorkingCapital.forEach((interestAmount, yearIndex) => {
    const monthsInYear = monthsPerYear[yearIndex];
    const isProRataYear =
      (!hideFirstYear && yearIndex === 0) || (hideFirstYear && yearIndex === 1);

    const repaymentYear = monthsPerYear
      .slice(0, yearIndex)
      .filter((months) => months > 0).length;

    // console.log(`\n📅 Final Adjustment - Year ${yearIndex + 1}`);
    // console.log(`- Base Interest: ₹${interestAmount.toFixed(2)}`);
    // console.log(`- Months In Year: ${monthsInYear}`);
    // console.log(`- Is Pro-Rata Year: ${isProRataYear}`);
    // console.log(`- Repayment Year Index: ${repaymentYear}`);

    if (isProRataYear && moratoriumPeriodMonths > 0) {
      const monthsEffective = monthsInYear;
      const final = (interestAmount * monthsEffective) / 12;

      // console.log(`✅ Adjusted Pro-Rata Interest: ₹${final.toFixed(2)} for ${monthsEffective} months`);
    } else if (repaymentYear >= 1) {
      // console.log(`✅ Full Interest Applicable: ₹${interestAmount.toFixed(2)}`);
    } else {
      // console.log(`❌ No Interest: Under Moratorium`);
    }
  });

  const totalDirectExpensesArray = Array.from({
    length: parseInt(formData.ProjectReportSetting.ProjectionYears) || 0,
  }).map((_, yearIndex) => {
    // console.log(`\n📊 YEAR ${yearIndex + 1} CALCULATION STARTS`);

    const totalDirectExpenses = directExpense
      .filter((expense) => expense.type === "direct")
      .reduce((sum, expense) => {
        const isRawMaterial =
          expense.name.trim() === "Raw Material Expenses / Purchases";
        const isPercentage = String(expense.value).trim().endsWith("%");

        const ClosingStock =
          formData?.MoreDetails?.ClosingStock?.[yearIndex] || 0;
        const OpeningStock =
          formData?.MoreDetails?.OpeningStock?.[yearIndex] || 0;

        let expenseValue = 0;

        if (isRawMaterial && isPercentage) {
          const baseValue =
            (parseFloat(expense.value) / 100) *
            (receivedtotalRevenueReceipts?.[yearIndex] || 0);
          expenseValue = baseValue + ClosingStock - OpeningStock;

          // console.log(
          //   `🧾 ${expense.name} [Raw Material - %]: (${expense.value} of revenue) = ₹${baseValue.toFixed(
          //     2
          //   )}, Adj. ClosingStock: ₹${ClosingStock}, OpeningStock: ₹${OpeningStock} ➤ Final: ₹${expenseValue.toFixed(
          //     2
          //   )}`
          // );
        } else {
          const base = Number(expense.total) || 0;
          expenseValue = calculateExpense(base, yearIndex); // use same logic as JSX

          // console.log(
          //   `🧾 ${expense.name}: ₹${base} ➤ Escalated (Y${yearIndex + 1}): ₹${expenseValue.toFixed(
          //     2
          //   )}`
          // );
        }

        return sum + expenseValue;
      }, 0);

    // Salary and Wages - apply the same formula
    const salaryBase = Number(fringAndAnnualCalculation) || 0;
    const totalSalaryWages = calculateExpense(salaryBase, yearIndex); // MATCH JSX

    // console.log(
    //   `👨‍💼 Salary and Wages: ₹${salaryBase} ➤ Escalated (Y${
    //     yearIndex + 1
    //   }): ₹${totalSalaryWages.toFixed(2)}`
    // );

    const yearTotal = totalDirectExpenses + totalSalaryWages;

    // console.log(
    //   `✅ TOTAL Direct Expenses (Y${yearIndex + 1}): ₹${yearTotal.toFixed(2)}`
    // );

    return yearTotal;
  });

  const preliminaryExpensesTotal = Number(
    formData?.CostOfProject?.preliminaryExpensesTotal || 0
  );

  const preliminaryWriteOffYears = Number(
    formData?.CostOfProject?.preliminaryWriteOffYears || 0
  );

  // Calculate yearly write-off value
  const yearlyWriteOffAmount =
    preliminaryWriteOffYears > 0
      ? preliminaryExpensesTotal / preliminaryWriteOffYears
      : 0;

  // Generate the array for yearly values
  const preliminaryWriteOffPerYear = Array.from({ length: projectionYears }).map(
    (_, index) => {
      const startIndex = hideFirstYear ? 1 : 0;
      const endIndex = startIndex + preliminaryWriteOffYears;
  
      // 👇 Only insert value if it's within the write-off window
      if (index >= startIndex && index < endIndex) {
        return yearlyWriteOffAmount;
      }
  
      // 👇 Insert 0 for all other years (including hidden first year)
      return 0;
    }
  );
  

  const totalIndirectExpensesArray = Array.from({
    length: parseInt(formData.ProjectReportSetting.ProjectionYears) || 0,
  }).map((_, yearIndex) => {
    const totalIndirectExpenses = indirectExpense
      .filter((expense) => expense.type === "indirect")
      .reduce((sum, expense) => {
        const annual = Number(expense.total) || 0;
        const escalated = calculateExpense(annual, yearIndex);
        return sum + escalated;
      }, 0);

    const interestOnTermLoan = yearlyInterestLiabilities[yearIndex] || 0;
    const interestExpenseOnWorkingCapital = calculateInterestOnWorkingCapital(
      interestOnWorkingCapital[yearIndex] || 0,
      yearIndex
    );
    const depreciationExpense = totalDepreciationPerYear[yearIndex] || 0;
    const preliminaryWriteOff = preliminaryWriteOffPerYear[yearIndex] || 0;

    const yearTotal =
      totalIndirectExpenses +
      interestOnTermLoan +
      interestExpenseOnWorkingCapital +
      depreciationExpense +
      preliminaryWriteOff;

    return yearTotal;
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

  // const orientation = hideFirstYear
  //   ? formData.ProjectReportSetting.ProjectionYears > 6
  //     ? "landscape"
  //     : "portrait"
  //   : formData.ProjectReportSetting.ProjectionYears > 5
  //   ? "landscape"
  //   : "portrait";

  const writeOffStartIndex = hideFirstYear ? 1 : 0;
  const writeOffEndIndex = writeOffStartIndex + preliminaryWriteOffYears;

  const isPreliminaryWriteOffAllZero = preliminaryWriteOffPerYear
    .slice(writeOffStartIndex, writeOffEndIndex)
    .every((value) => value === 0);

  const renderedIndirectExpenses = directExpense.filter((expense) => {
    if (expense.name.trim() === "Raw Material Expenses / Purchases")
      return false;

    const isAllYearsZero = Array.from({
      length: hideFirstYear ? projectionYears - 1 : projectionYears,
    }).every((_, yearIndex) => {
      const adjustedYearIndex = hideFirstYear ? yearIndex + 1 : yearIndex;
      const escalated = calculateExpense(
        Number(expense.total) || 0,
        adjustedYearIndex
      );
      return escalated === 0;
    });

    return expense.type === "indirect" && !isAllYearsZero;
  }).length;

  const preliminarySerialNo = 3 + renderedIndirectExpenses + 1; // 3 static rows + count + 1

  return (
    <Page
      size={formData.ProjectReportSetting.ProjectionYears > 12 ? "A3" : "A4"}
      orientation={orientation} // ✅ Now using prop
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

          {directExpense
            .filter((expense) => {
              const isAllYearsZero = Array.from({
                length: hideFirstYear ? projectionYears - 1 : projectionYears,
              }).every((_, yearIndex) => {
                const adjustedYearIndex = hideFirstYear
                  ? yearIndex + 1
                  : yearIndex;

                // Determine actual value
                let expenseValue = 0;
                const isRawMaterial =
                  expense.name.trim() === "Raw Material Expenses / Purchases";
                const isPercentage = String(expense.value).trim().endsWith("%");
                const ClosingStock =
                  formData?.MoreDetails?.ClosingStock?.[yearIndex] || 0;
                const OpeningStock =
                  formData?.MoreDetails?.OpeningStock?.[yearIndex] || 0;

                if (isRawMaterial && isPercentage) {
                  const baseValue =
                    (parseFloat(expense.value) / 100) *
                    (receivedtotalRevenueReceipts?.[adjustedYearIndex] || 0);
                  expenseValue = baseValue + ClosingStock - OpeningStock;
                } else {
                  expenseValue = Number(expense.total) || 0;
                }

                return expenseValue === 0;
              });

              return expense.type === "direct" && !isAllYearsZero;
            })

            .map((expense, index) => {
              const isRawMaterial =
                expense.name.trim() === "Raw Material Expenses / Purchases";
              const isPercentage = String(expense.value).trim().endsWith("%");
              const displayName = isRawMaterial
                ? "Purchases / RM Expenses"
                : expense.name;

              return (
                <View key={index} style={[styles.tableRow, styles.totalRow]}>
                  <Text style={stylesCOP.serialNoCellDetail}>{index + 2}</Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                    ]}
                  >
                    {displayName}
                  </Text>

                  {Array.from({
                    length: hideFirstYear
                      ? projectionYears - 1
                      : projectionYears,
                  }).map((_, yearIndex) => {
                    const adjustedYearIndex = hideFirstYear
                      ? yearIndex + 1
                      : yearIndex;

                    let expenseValue = 0;
                    const isRawMaterial =
                      expense.name.trim() ===
                      "Raw Material Expenses / Purchases";
                    const isPercentage = String(expense.value)
                      .trim()
                      .endsWith("%");
                    const ClosingStock =
                      formData?.MoreDetails?.ClosingStock?.[yearIndex] || 0;
                    const OpeningStock =
                      formData?.MoreDetails?.OpeningStock?.[yearIndex] || 0;

                    if (isRawMaterial && isPercentage) {
                      const baseValue =
                        (parseFloat(expense.value) / 100) *
                        (receivedtotalRevenueReceipts?.[adjustedYearIndex] ||
                          0);
                      expenseValue = baseValue + ClosingStock - OpeningStock;

                      // console.log(
                      //   `📦 [Y${adjustedYearIndex + 1}] ${
                      //     expense.name
                      //   } (Raw Material %): Base = ₹${baseValue.toFixed(
                      //     2
                      //   )}, -ClosingStock ₹${ClosingStock}, +OpeningStock ₹${OpeningStock} ➤ Final = ₹${expenseValue.toFixed(
                      //     2
                      //   )}`
                      // );
                    } else {
                      expenseValue = Number(expense.total) || 0;
                      const escalated = calculateExpense(
                        expenseValue,
                        adjustedYearIndex
                      );

                      // console.log(
                      //   `💰 [Y${adjustedYearIndex + 1}] ${
                      //     expense.name
                      //   }: Base = ₹${expenseValue}, Escalated ➤ ₹${escalated.toFixed(
                      //     2
                      //   )}`
                      // );

                      expenseValue = escalated;
                    }

                    const formattedExpense = formatNumber(
                      expenseValue.toFixed(2)
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
              // ✅ Exclude Raw Material
              if (expense.name.trim() === "Raw Material Expenses / Purchases") {
                return false;
              }

              const isAllYearsZero = Array.from({
                length: hideFirstYear ? projectionYears - 1 : projectionYears,
              }).every((_, yearIndex) => {
                const adjustedYearIndex = hideFirstYear
                  ? yearIndex + 1
                  : yearIndex;

                const expenseValue = Number(expense.total) || 0;
                return expenseValue === 0;
              });

              return expense.type === "indirect" && !isAllYearsZero;
            })
            .map((expense, index) => {
              const displayName = expense.name;

              return (
                <View key={index} style={[styles.tableRow, styles.totalRow]}>
                  <Text style={stylesCOP.serialNoCellDetail}>{index + 4}</Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                    ]}
                  >
                    {displayName}
                  </Text>

                  {Array.from({
                    length: hideFirstYear
                      ? projectionYears - 1
                      : projectionYears,
                  }).map((_, yearIndex) => {
                    const adjustedYearIndex = hideFirstYear
                      ? yearIndex + 1
                      : yearIndex;

                    const base = Number(expense.total) || 0;
                    const escalated = calculateExpense(base, adjustedYearIndex);
                    const formattedExpense = formatNumber(escalated.toFixed(2));

                    // ✅ Log value
                    // console.log(
                    //   `💰 [Y${adjustedYearIndex + 1}] ${
                    //     expense.name
                    //   }: Base = ₹${base} ➤ Escalated = ₹${escalated.toFixed(2)}`
                    // );

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

          {/* ✅ Render Preliminary Row */}
          {!isPreliminaryWriteOffAllZero && (
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text style={stylesCOP.serialNoCellDetail}>
                {preliminarySerialNo}
              </Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                ]}
              >
                Preliminary Expenses
              </Text>

              {preliminaryWriteOffPerYear
                .slice(hideFirstYear ? 1 : 0)
                .map((value, yearIndex) => (
                  <Text
                    key={yearIndex}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                    ]}
                  >
                    {formatNumber(value)}
                  </Text>
                ))}
            </View>
          )}

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
