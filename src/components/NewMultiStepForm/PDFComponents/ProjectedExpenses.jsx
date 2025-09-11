import React, { useMemo, useEffect } from "react";
import { Page, View, Text, Image } from "@react-pdf/renderer";
import { styles, stylesCOP, stylesMOF, styleExpenses } from "./Styles";
import SAWatermark from "../Assets/SAWatermark";
import CAWatermark from "../Assets/CAWatermark";
import shouldHideFirstYear from "./HideFirstYear";

const num = (v) => {
  // Handle percentages by dividing by 100
  if (typeof v === "string") {
    if (v.trim().endsWith("%")) {
      return parseFloat(v.replace("%", "").replace(/,/g, "").trim()) / 100 || 0;
    }
    // Handle commas (thousands) and convert to number
    return parseFloat(v.replace(/,/g, "").trim()) || 0;
  }
  return Number(v) || 0;
};

// put near your `num()` helper:
const n2 = (v) => Number(num(v).toFixed(2));

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
  const activeRowIndex = 0;
  // console.log("formdata in projected expense", formData);
  const { Expenses = {} } = formData;
  const { normalExpense = [], directExpense = [] } = Expenses;
  const indirectExpense = directExpense.filter(
    (expense) => expense.type === "indirect"
  );

  const projectionYears =
    parseInt(formData.ProjectReportSetting.ProjectionYears) || 5;

  // advance expense
  const advanceExpenses = Array.isArray(Expenses?.advanceExpenses)
    ? Expenses.advanceExpenses.filter((row) => row && row.name && row.type)
    : [];

  // Get the value for a given advance expense row for a given year index
  const getAdvanceExpenseValueForYear = (row, yearLabel) => {
    const val = row?.values?.[yearLabel];
    return num(val);
  };
const debtEquityOption = formData?.ProjectReportSetting?.DebtEquityOption || formData?.ProjectReportSetting?.debtEquityOption ;

const interestRate = formData?.ProjectReportSetting?.interestOnTL;

  const renderIOTLLabel = () => {
    if (debtEquityOption === "Equity") {
      return `Dividend Payout @${interestRate}%`; // Format for equity case
    } else {
      return "Interest On Term Loan"; // Default case
    }
  };

  const renderIOWCLabel = () => {
    if (debtEquityOption === "Equity"){
      return "Return On Operational Equity";
    }
    else{
      return "Interest On Working Capital"
    }
  }

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

  const hideFirstYear = shouldHideFirstYear(receivedtotalRevenueReceipts);

  // console.log("receivedtotalRevenueReceipts", receivedtotalRevenueReceipts)

  // console.log(
  //   "should hide first year",
  //   shouldHideFirstYear(receivedtotalRevenueReceipts)
  // );

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
  const isZeroValue = (val) => {
    const num = Number(val);
    return !num || num === 0; // covers 0, null, undefined, NaN, ""
  };
  // console.log("monthsPerYear", monthsPerYear);

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

  const calculateDirectExpense = (annualExpense, yearIndex) => {
    // Example: apply a percentage increase for the direct expense over the years
    const rateOfExpense = 0.05; // Example: 5% increase per year
    const monthsInYear = monthsPerYear[yearIndex]; // Get the number of months in the year

    let incrementedExpense;
    const fullYearExpense =
      annualExpense * Math.pow(1 + rateOfExpense, yearIndex);

    if (monthsInYear === 0) {
      incrementedExpense = 0;
    } else {
      incrementedExpense = fullYearExpense;
    }

    return incrementedExpense;
  };

  // const calculateRawMaterialExpense = (
  //   expense,
  //   receivedtotalRevenueReceipts,
  //   yearIndex
  // ) => {
  //   const isRawMaterial =
  //     expense.name.trim() === "Raw Material Expenses / Purchases";
  //   const isPercentage = String(expense.value).trim().endsWith("%");

  //   const ClosingStock =  num(
  //     formData?.MoreDetails?.ClosingStock?.[yearIndex] || 0
  //   );
  //   const OpeningStock =  num(
  //     formData?.MoreDetails?.OpeningStock?.[yearIndex] || 0
  //   );

  //   let expenseValue = 0;

  //   if (isRawMaterial && isPercentage) {
  //     const baseValue =
  //       (parseFloat(expense.value) / 100) *
  //       (receivedtotalRevenueReceipts?.[yearIndex] || 0);
  //     expenseValue = baseValue + ClosingStock - OpeningStock; // Ensure it's a sum of numbers
  //   } else {
  //     expenseValue = num(expense.total); // Ensure we use num() to prevent string concatenation
  //   }

  //   return expenseValue;
  // };

  const calculateRawMaterialExpense = (
    expense,
    receivedtotalRevenueReceipts,
    yearIndex
  ) => {
    const isRawMaterial =
      expense.name?.trim() === "Raw Material Expenses / Purchases";
    const isPercentage =
      typeof expense.value === "string" && expense.value.trim().endsWith("%");

    const closingStock = num(
      formData?.MoreDetails?.ClosingStock?.[yearIndex] ?? 0
    );
    const openingStock = num(
      formData?.MoreDetails?.OpeningStock?.[yearIndex] ?? 0
    );

    if (isRawMaterial && isPercentage) {
      // percentage value like "60%" or "60 %"
      const perc = num(expense.value.replace("%", "")) / 100;
      // receipts might be "10,00,000" → use num() so it becomes a number
      const receipts = num(receivedtotalRevenueReceipts?.[yearIndex] ?? 0);

      const baseValue = receipts * perc; // number
      const expenseValue = baseValue + closingStock - openingStock; // number
      return expenseValue || 0;
    }

    // non-% case: total might be a string with commas → use num()
    return num(expense.total);
  };

  // ✅ Calculate Interest on Working Capital for each projection year
  const totalDirectExpensesArray = Array.from({
    length: projectionYears,
  }).map((_, yearIndex) => {
    let directRows = [];
    // 1. All regular direct expenses, escalated if required
    const directTotal = directExpense
      .filter((expense) => expense.type === "direct")
      .reduce((sum, expense) => {
        let value;
        if (
          expense.name.trim() === "Raw Material Expenses / Purchases" &&
          String(expense.value).trim().endsWith("%")
        ) {
          value = calculateRawMaterialExpense(
            expense,
            receivedtotalRevenueReceipts,
            yearIndex
          );
        } else {
          value = calculateExpense(Number(expense.total) || 0, yearIndex); // PATCHED!
        }
        directRows.push({ name: expense.name, value });
        return sum + value;
      }, 0);

    // 2. Salary/wages (from normalExpense, always only one row)
    let salaryTotal = 0;
    if (Array.isArray(normalExpense) && normalExpense.length > 0) {
      salaryTotal = calculateExpense(
        Number(fringAndAnnualCalculation) || 0,
        yearIndex
      );
    }

    // 3. Advance expenses of type "direct"
    let advanceDirectTotal = 0;
    if (
      Array.isArray(formData?.Expenses?.advanceExpenses) &&
      formData.Expenses.advanceExpenses.length > 0
    ) {
      advanceDirectTotal = formData.Expenses.advanceExpenses
        .filter((row) => row.type === "direct" && row.name && row.values)
        .reduce((sum, row) => {
          const value =
            row.values?.[financialYearLabels[yearIndex]] ??
            row.values?.[yearIndex] ??
            0;
          directRows.push({
            name: row.name + " (Advance)",
            value: Number(value) || 0,
          });
          return sum + (Number(value) || 0);
        }, 0);
    }

    // LOGGING the row values for this year:
    // console.log(`Direct Expense Breakdown for Year ${yearIndex + 1}:`);
    // directRows.forEach((row, i) =>
    //   console.log(`   ${i + 1}. ${row.name}: ${row.value}`)
    // );
    // console.log(`   Salary and Wages: ${salaryTotal}`);
    // console.log(`   Total Direct (sum): ${directTotal + salaryTotal + advanceDirectTotal}`);

    // FINAL direct expenses for this year
    return directTotal + salaryTotal + advanceDirectTotal;
  });

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

  // Check if all Interest On Term Loan values are zero or falsy
  const isInterestOnTermLoanZero = yearlyInterestLiabilities
    .slice(hideFirstYear ? 1 : 0)
    .every((val) => isZeroValue(val));

  // Check if all Depreciation values are zero or falsy
  const isDepreciationZero = totalDepreciationPerYear
    .slice(hideFirstYear ? 1 : 0)
    .every((val) => isZeroValue(val));

  const calculateInterestOnWorkingCapital = useMemo(() => {
    // console.log("moratorium month", moratoriumPeriodMonths);

    const principal =
      Number(formData.MeansOfFinance?.workingCapital?.termLoan) || 0;
    const rate = Number(formData.ProjectReportSetting?.interestOnWC) || 0;
    const annualInterestAmount = (principal * rate) / 100;

    // console.log("principal:", principal);
    // console.log("rate:", rate);
    // console.log("annualInterestAmount:", annualInterestAmount);

    const firstRepaymentYearIndex = monthsPerYear.findIndex(
      (months) => months > 0
    );
    // console.log("Months per year:", monthsPerYear);
    // console.log("First repayment year index:", firstRepaymentYearIndex);

    return (yearIndex) => {
      const monthsInYear = monthsPerYear[yearIndex] || 0;
      // console.log(`Year ${yearIndex + 1} months: ${monthsInYear}`);
      if (monthsInYear === 0) {
        // Entire year in moratorium, no interest
        return 0;
      }

      // if (yearIndex === firstRepaymentYearIndex && moratoriumPeriodMonths > 0) {
      //   // Prorated interest for first repayment year
      //   return (annualInterestAmount * monthsInYear) / 12;
      // }
      if (
        yearIndex === firstRepaymentYearIndex &&
        (moratoriumPeriodMonths > 0 || monthsInYear < 12)
      ) {
        const prorated = (annualInterestAmount * monthsInYear) / 12;
        // console.log(`Year ${yearIndex + 1} prorated interest:`, prorated);
        return prorated;
      }

      // console.log(`Year ${yearIndex + 1} full interest:`, annualInterestAmount);
      // Full annual interest for other repayment years
      return annualInterestAmount;
    };
  }, [formData, moratoriumPeriodMonths, monthsPerYear]);

  const isWorkingCapitalInterestZero = Array.from({
    length: projectionYears,
  }).every((_, yearIndex) => {
    const calculatedInterest = calculateInterestOnWorkingCapital(yearIndex);
    return calculatedInterest === 0;
  });

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
  const preliminaryWriteOffPerYear = Array.from({
    length: projectionYears,
  }).map((_, index) => {
    const startIndex = hideFirstYear ? 1 : 0;
    const endIndex = startIndex + preliminaryWriteOffYears;

    // 👇 Only insert value if it's within the write-off window
    if (index >= startIndex && index < endIndex) {
      return yearlyWriteOffAmount;
    }

    // 👇 Insert 0 for all other years (including hidden first year)
    return 0;
  });

  const totalIndirectExpensesArray = Array.from({
    length: parseInt(formData.ProjectReportSetting.ProjectionYears) || 0,
  }).map((_, yearIndex) => {
    let indirectRows = [];
    // 1. All regular indirect expenses, escalated if required
    const indirectTotal = indirectExpense
      .filter((expense) => expense.type === "indirect")
      .reduce((sum, expense) => {
        const annual = Number(expense.total) || 0;
        const escalated = calculateExpense(annual, yearIndex);
        indirectRows.push({ name: expense.name, value: escalated });
        return sum + escalated;
      }, 0);

    // 2. Advance expenses of type "indirect"
    let advanceIndirectTotal = 0;
    if (
      Array.isArray(formData?.Expenses?.advanceExpenses) &&
      formData.Expenses.advanceExpenses.length > 0
    ) {
      advanceIndirectTotal = formData.Expenses.advanceExpenses
        .filter((row) => row.type === "indirect" && row.name && row.values)
        .reduce((sum, row) => {
          const value =
            row.values?.[financialYearLabels[yearIndex]] ??
            row.values?.[yearIndex] ??
            0;
          indirectRows.push({
            name: row.name + " (Advance)",
            value: Number(value) || 0,
          });
          return sum + (Number(value) || 0);
        }, 0);
    }

    // 3. Interest, Depreciation, Write-off (rest as before)
    const interestOnTermLoan = yearlyInterestLiabilities[yearIndex] || 0;
    const interestExpenseOnWorkingCapital =
      calculateInterestOnWorkingCapital(yearIndex);
    const depreciationExpense = totalDepreciationPerYear[yearIndex] || 0;
    const preliminaryWriteOff = preliminaryWriteOffPerYear[yearIndex] || 0;

    // Optionally, console log for debugging:
    // console.log(`Indirect Expense Breakdown for Year ${yearIndex + 1}:`);
    // indirectRows.forEach((row, i) =>
    //   console.log(`   ${i + 1}. ${row.name}: ${row.value}`)
    // );
    // console.log(`   Advance Indirect: ${advanceIndirectTotal}`);
    // console.log(
    //   `   Total Indirect (sum): ${indirectTotal + advanceIndirectTotal + interestOnTermLoan + interestExpenseOnWorkingCapital + depreciationExpense + preliminaryWriteOff}`
    // );

    // FINAL indirect expenses for this year
    return (
      indirectTotal +
      advanceIndirectTotal +
      interestOnTermLoan +
      interestExpenseOnWorkingCapital +
      depreciationExpense +
      preliminaryWriteOff
    );
  });

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

  const writeOffStartIndex = hideFirstYear ? 1 : 0;
  const writeOffEndIndex = writeOffStartIndex + preliminaryWriteOffYears;

  const isPreliminaryWriteOffAllZero = preliminaryWriteOffPerYear
    .slice(writeOffStartIndex, writeOffEndIndex)
    .every((value) => value === 0);

  const indirectCount = directExpense.filter((expense) => {
    if (expense.name.trim() === "Raw Material Expenses / Purchases") {
      return false;
    }

    const isAllYearsZero = Array.from({
      length: hideFirstYear ? projectionYears - 1 : projectionYears,
    }).every((_, yearIndex) => {
      const adjustedYearIndex = hideFirstYear ? yearIndex + 1 : yearIndex;
      const expenseValue = Number(expense.total) || 0;
      return expenseValue === 0;
    });

    return expense.type === "indirect" && !isAllYearsZero;
  }).length;

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

  const isAdvancedLandscape = orientation === "advanced-landscape";
  let splitFinancialYearLabels = [financialYearLabels];
  if (isAdvancedLandscape) {
  // Remove first year if hidden
  const visibleLabels = hideFirstYear ? financialYearLabels.slice(1) : financialYearLabels;
  const totalCols = visibleLabels.length;
  const firstPageCols = Math.ceil(totalCols / 2);
  const secondPageCols = totalCols - firstPageCols;
  splitFinancialYearLabels = [
    visibleLabels.slice(0, firstPageCols),
    visibleLabels.slice(firstPageCols, firstPageCols + secondPageCols),
  ];
}
  const toRoman = (n) =>
    ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"][n] || n + 1;

  if (isAdvancedLandscape) {
    return splitFinancialYearLabels.map((labels, pageIdx) => {
      // labels is the page's array of financial year labels (subset of financialYearLabels)
      const pageStart =
        Math.max(0, financialYearLabels.indexOf(labels[0])) || 0;

      const globalIndex = (localIdx) => pageStart + localIdx;
      const shouldSkipCol = (gIdx) => hideFirstYear && gIdx === 0;

      return (
        <Page
          key={pageIdx}
          // size={
          //   formData.ProjectReportSetting.ProjectionYears > 12 ? "A3" : "A4"
          // }
          size="A4"
          orientation="landscape"
          wrap={false}
          break
          style={styles.page}
        >
          <View style={[styleExpenses.paddingx, { paddingBottom: "30px" }]}>
            {/* businees name and financial year  */}
            <View>
              <Text style={styles.businessName}>
                {formData?.AccountInformation?.businessName || "Business Name"}
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
                {formData?.ProjectReportSetting?.AmountIn === "rupees"
                  ? "Rs."
                  : formData?.ProjectReportSetting?.AmountIn === "thousand"
                  ? "Thousands"
                  : formData?.ProjectReportSetting?.AmountIn === "lakhs"
                  ? "Lakhs"
                  : formData?.ProjectReportSetting?.AmountIn === "crores"
                  ? "Crores"
                  : formData?.ProjectReportSetting?.AmountIn === "millions"
                  ? "Millions"
                  : ""}
                )
              </Text>
            </View>

            <View>
              <View style={stylesCOP.heading}>
                <Text>
                  Projected Expenses
                  {splitFinancialYearLabels.length > 1
                    ? ` (${toRoman(pageIdx)})`
                    : ""}
                </Text>
              </View>

              <View style={[styles.table, { borderRightWidth: 0 }]}>
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

                  {/* Generate Dynamic Year Headers using *page* labels */}
                  {labels.map((yearLabel, localIdx) => {
                    const gIdx = globalIndex(localIdx);
                    if (shouldSkipCol(gIdx)) return null;
                    return (
                      <Text
                        key={gIdx}
                        style={[styles.particularsCell, stylesCOP.boldText]}
                      >
                        {yearLabel}
                      </Text>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* Direct Expenses */}
            <View style={[{ borderLeftWidth: 1 }]}>
              {/* direct expenses */}
              <View style={[styles.tableRow, styles.totalRow]}>
                <Text
                  style={[
                    stylesCOP.serialNoCellDetail,
                    styles.Total,
                    { paddingVertical: "10px" },
                  ]}
                >
                  C
                </Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                    styles.Total,
                    { paddingVertical: "10px" },
                  ]}
                >
                  Direct Expenses
                </Text>
                {labels.map((_, localIdx) => {
                  const gIdx = globalIndex(localIdx);
                  if (shouldSkipCol(gIdx)) return null;
                  return (
                    <Text
                      key={gIdx}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                      ]}
                    >
                      {/* You can add content here if needed */}
                    </Text>
                  );
                })}
              </View>

              {/* Salary and wages  */}
              {normalExpense.map((expense, index) => {
                if (index !== activeRowIndex) return null; // Only render the active row

                return (
                  <View key={index} style={[styles.tableRow, styles.totalRow]}>
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

                    {labels.map((_, localIdx) => {
                      const gIdx = globalIndex(localIdx);
                      if (shouldSkipCol(gIdx)) return null;
                      return (
                        <Text
                          key={gIdx}
                          style={[
                            stylesCOP.particularsCellsDetail,
                            styleExpenses.fontSmall,
                          ]}
                        >
                          {formatNumber(
                            calculateExpense(
                              Number(fringAndAnnualCalculation) || 0,
                              gIdx
                            )
                          )}
                        </Text>
                      );
                    })}
                  </View>
                );
              })}

              {/* Direct Expenses */}
              {directExpense
                .filter((expense) => {
                  const isAllYearsZero = Array.from({
                    length: hideFirstYear
                      ? projectionYears - 1
                      : projectionYears,
                  }).every((_, yearIndex) => {
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
                      expenseValue = calculateRawMaterialExpense(
                        expense,
                        receivedtotalRevenueReceipts,
                        adjustedYearIndex
                      );
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
                  const isPercentage = String(expense.value)
                    .trim()
                    .endsWith("%");
                  const displayName = isRawMaterial
                    ? "Purchases / RM Expenses"
                    : expense.name;

                  return (
                    <View
                      key={index}
                      style={[styles.tableRow, styles.totalRow]}
                    >
                      <Text style={stylesCOP.serialNoCellDetail}>
                        {index + 2}
                      </Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        {displayName}
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        if (shouldSkipCol(gIdx)) return null;

                        let expenseValue = 0;
                        if (isRawMaterial && isPercentage) {
                          expenseValue = calculateRawMaterialExpense(
                            expense,
                            receivedtotalRevenueReceipts,
                            gIdx
                          );
                        } else {
                          expenseValue = Number(expense.total) || 0;
                        }

                        const formattedExpense =
                          isRawMaterial && isPercentage
                            ? formatNumber(n2(expenseValue))
                            : formatNumber(
                                n2(calculateExpense(expenseValue, gIdx))
                              );

                        return (
                          <Text
                            key={gIdx}
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

              {/* Advance Expenses of type "direct" */}
              {Array.isArray(formData?.Expenses?.advanceExpenses) &&
                formData.Expenses.advanceExpenses
                  .filter(
                    (row) =>
                      row.type === "direct" &&
                      row.name &&
                      row.name.trim() !== ""
                  )
                  .map((row, advIdx) => (
                    <View
                      key={"adv-direct-" + advIdx}
                      style={[styles.tableRow, styles.totalRow]}
                    >
                      <Text style={stylesCOP.serialNoCellDetail}>
                        {"A" + (advIdx + 1)}
                      </Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        {row.name}
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        if (shouldSkipCol(gIdx)) return null;

                        const value =
                          (row.values &&
                            (row.values[financialYearLabels[gIdx]] ??
                              row.values[labels[localIdx]] ??
                              row.values[gIdx])) ||
                          0;

                        return (
                          <Text
                            key={gIdx}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(Number(value) || 0)}
                          </Text>
                        );
                      })}
                    </View>
                  ))}

              {/* direct Expenses total  */}
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
                    {},
                  ]}
                >
                  Total
                </Text>
                {/* ✅ Display Precomputed Total Direct Expenses for current page */}
                {labels.map((_, localIdx) => {
                  const gIdx = globalIndex(localIdx);
                  if (shouldSkipCol(gIdx)) return null;
                  const grandTotal = totalDirectExpensesArray?.[gIdx] ?? 0;
                  return (
                    <Text
                      key={gIdx}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        stylesCOP.boldText,
                        styleExpenses.fontSmall,
                      ]}
                    >
                      {formatNumber(grandTotal)}
                    </Text>
                  );
                })}
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
                {labels.map((_, localIdx) => {
                  const gIdx = globalIndex(localIdx);
                  if (shouldSkipCol(gIdx)) return null;
                  return (
                    <Text
                      key={gIdx}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                        {
                          paddingVertical: "10px",

                          fontWeight: "bold",
                        },
                      ]}
                    >
                      {/* You can add content here if needed */}
                    </Text>
                  );
                })}
              </View>
              {/* Interest On Term Loan */}
              {!isInterestOnTermLoanZero && (
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
                    {renderIOTLLabel()}
                  </Text>

                  {/* Get totals for the current page */}
                  {labels.map((_, localIdx) => {
                    const gIdx = globalIndex(localIdx);
                    if (shouldSkipCol(gIdx)) return null;
                    return (
                      <Text
                        key={gIdx}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                        ]}
                      >
                        {formatNumber(yearlyInterestLiabilities?.[gIdx] ?? 0)}
                      </Text>
                    );
                  })}
                </View>
              )}
              {/* Interest on Working Capital */}
              {!isWorkingCapitalInterestZero && (
                <View style={[styles.tableRow, styles.totalRow]}>
                  <Text style={stylesCOP.serialNoCellDetail}>
                    {isInterestOnTermLoanZero ? 1 : 2}
                  </Text>

                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                    ]}
                  >
                    {renderIOWCLabel()}
                  </Text>

                  {/* ✅ Apply `calculateInterestOnWorkingCapital` */}
                  {labels.map((_, localIdx) => {
                    const gIdx = globalIndex(localIdx);
                    if (shouldSkipCol(gIdx)) return null;

                    const calculatedInterest =
                      calculateInterestOnWorkingCapital(gIdx);

                    return (
                      <Text
                        key={gIdx}
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
              )}
              {/* ✅ Render Depreciation Row */}
              {!isDepreciationZero && (
                <View style={[styles.tableRow, styles.totalRow]}>
                  <Text style={stylesCOP.serialNoCellDetail}>
                    {isWorkingCapitalInterestZero ? 2 : 3}
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

                  {/* ✅ Display Depreciation Values for Each Year on current page */}
                  {labels.map((_, localIdx) => {
                    const gIdx = globalIndex(localIdx);
                    if (shouldSkipCol(gIdx)) return null;
                    const depreciationValue =
                      totalDepreciationPerYear?.[gIdx] ?? 0;
                    return (
                      <Text
                        key={gIdx}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                        ]}
                      >
                        {formatNumber(depreciationValue)}
                      </Text>
                    );
                  })}
                </View>
              )}
              {directExpense
                .filter((expense) => {
                  const isAllYearsZero = Array.from({
                    length: hideFirstYear
                      ? projectionYears - 1
                      : projectionYears,
                  }).every((_, yearIndex) => {
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
                    } else {
                      expenseValue = Number(expense.total) || 0;
                    }

                    return expenseValue === 0;
                  });

                  return expense.type === "indirect" && !isAllYearsZero;
                })

                .map((expense, index) => {
                  const annualExpense = Number(expense.total) || 0; // ✅ Use annual total directly
                  const isRawMaterial =
                    expense.name.trim() === "Raw Material Expenses / Purchases";
                  const displayName = isRawMaterial
                    ? "Purchases / RM Expenses"
                    : expense.name;
                  const serialNumber =
                    isInterestOnTermLoanZero && isDepreciationZero
                      ? index + 2
                      : isWorkingCapitalInterestZero
                      ? index + 3
                      : index + 4;
                  return (
                    <View
                      key={index}
                      style={[styles.tableRow, styles.totalRow]}
                    >
                      <Text style={stylesCOP.serialNoCellDetail}>
                        {serialNumber}
                      </Text>

                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        {displayName}
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        if (shouldSkipCol(gIdx)) return null;

                        let expenseValue = 0;
                        const isRawMaterialInner =
                          expense.name.trim() ===
                          "Raw Material Expenses / Purchases";
                        const isPercentage = String(expense.value)
                          .trim()
                          .endsWith("%");
                        const ClosingStock =
                          formData?.MoreDetails?.ClosingStock?.[gIdx] || 0;
                        const OpeningStock =
                          formData?.MoreDetails?.OpeningStock?.[gIdx] || 0;

                        if (isRawMaterialInner && isPercentage) {
                          const baseValue =
                            (parseFloat(expense.value) / 100) *
                            (receivedtotalRevenueReceipts?.[gIdx] || 0);
                          expenseValue =
                            baseValue + ClosingStock - OpeningStock;
                        } else {
                          expenseValue = Number(expense.total) || 0;
                        }

                        const formattedExpense =
                          isRawMaterialInner && isPercentage
                            ? formatNumber(n2(expenseValue))
                            : formatNumber(
                                n2(calculateExpense(expenseValue, gIdx))
                              );

                        return (
                          <Text
                            key={gIdx}
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
              ;{/* Advance Expenses of type "indirect" */}
              {Array.isArray(formData?.Expenses?.advanceExpenses) &&
                formData.Expenses.advanceExpenses
                  .filter(
                    (row) =>
                      row.type === "indirect" &&
                      row.name &&
                      row.name.trim() !== ""
                  )
                  .map((row, advIdx) => (
                    <View
                      key={"adv-indirect-" + advIdx}
                      style={[styles.tableRow, styles.totalRow]}
                    >
                      <Text style={stylesCOP.serialNoCellDetail}>
                        {"I" + (advIdx + 1)}
                      </Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        {row.name}
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        if (shouldSkipCol(gIdx)) return null;
                        const value =
                          (row.values &&
                            (row.values[financialYearLabels[gIdx]] ??
                              row.values[labels[localIdx]] ??
                              row.values[gIdx])) ||
                          0;
                        return (
                          <Text
                            key={gIdx}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(Number(value) || 0)}
                          </Text>
                        );
                      })}
                    </View>
                  ))}
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

                  {labels.map((_, localIdx) => {
                    const gIdx = globalIndex(localIdx);
                    if (shouldSkipCol(gIdx)) return null;
                    const value = preliminaryWriteOffPerYear?.[gIdx] ?? 0;
                    return (
                      <Text
                        key={gIdx}
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
              )}
              {/* ✅ Total Indirect Expenses Row */}
              <View style={[styles.tableRow, styles.totalRow]}>
                <Text style={stylesCOP.serialNoCellDetail}></Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                    styles.Total,
                    { paddingVertical: "10px" },
                  ]}
                >
                  Total
                </Text>

                {/* ✅ Display the calculated `totalIndirectExpensesArray` for current page */}
                {labels.map((_, localIdx) => {
                  const gIdx = globalIndex(localIdx);
                  if (shouldSkipCol(gIdx)) return null;
                  const totalValue = totalIndirectExpensesArray?.[gIdx] ?? 0;
                  return (
                    <Text
                      key={gIdx}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        stylesCOP.boldText,
                        styleExpenses.fontSmall,
                        styles.Total,
                        { paddingVertical: "10px" },
                      ]}
                    >
                      {formatNumber(totalValue)}
                    </Text>
                  );
                })}
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

                {/* Keep column count aligned with current page */}
                {labels.map((_, localIdx) => {
                  const gIdx = globalIndex(localIdx);
                  if (shouldSkipCol(gIdx)) return null;
                  return (
                    <Text
                      key={gIdx}
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

                {/* ✅ Display the combined total for each year on current page */}
                {labels.map((_, localIdx) => {
                  const gIdx = globalIndex(localIdx);
                  if (shouldSkipCol(gIdx)) return null;
                  const totalValue = totalExpensesArray?.[gIdx] ?? 0;
                  return (
                    <Text
                      key={gIdx}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        stylesCOP.boldText,
                        styleExpenses.fontSmall,
                      ]}
                    >
                      {formatNumber(n2(totalValue))}
                    </Text>
                  );
                })}
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
          </View>
        </Page>
      );
    });
  }

  return (
    <Page
      // size={formData.ProjectReportSetting.ProjectionYears > 12 ? "A3" : "A4"}
      size="A4"
      orientation={orientation} // ✅ Now using prop
      wrap={false}
      break
      style={styles.page}
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

      <View style={[styleExpenses.paddingx, { paddingBottom: "30px" }]}>
        {/* businees name and financial year  */}
        <View>
          <Text style={styles.businessName}>
            {formData?.AccountInformation?.businessName || "Business Name"}
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

        <View>
          <View style={stylesCOP.heading}>
            <Text>Projected Expenses</Text>
          </View>

          <View style={[styles.table, { borderRightWidth: 0 }]}>
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
              {financialYearLabels.map(
                (yearLabel, yearIndex) =>
                  (!hideFirstYear || yearIndex !== 0) && (
                    <Text
                      key={yearIndex}
                      style={[styles.particularsCell, stylesCOP.boldText]}
                    >
                      {yearLabel}
                    </Text>
                  )
              )}
            </View>
          </View>
        </View>
        {/* Direct Expenses */}
        <View style={[{ borderLeftWidth: 1 }]}>
          {/* direct expenses */}
          <View style={[styles.tableRow, styles.totalRow]}>
            <Text
              style={[
                stylesCOP.serialNoCellDetail,
                styles.Total,
                { paddingVertical: "10px" },
              ]}
            >
              C
            </Text>
            <Text
              style={[
                stylesCOP.detailsCellDetail,
                styleExpenses.particularWidth,
                styleExpenses.bordernone,
                styles.Total,
                { paddingVertical: "10px" },
              ]}
            >
              Direct Expenses
            </Text>
            {Array.from({ length: projectionYears }).map((_, yearIndex) => {
              if (hideFirstYear && yearIndex === 0) return null; // Skip first year if hideFirstYear is true

              return (
                <Text
                  key={yearIndex}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                  ]}
                >
                  {/* You can add content here if needed */}
                </Text>
              );
            })}
          </View>

          {/* Salary and wages  */}
          {normalExpense.map((expense, index) => {
            if (index !== activeRowIndex) return null; // Only render the active row

            return (
              <View key={index} style={[styles.tableRow, styles.totalRow]}>
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
                          )
                        )}
                      </Text>
                    )
                )}
              </View>
            );
          })}

          {/* Direct Expenses */}
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
                  // const baseValue =
                  //   (parseFloat(expense.value) / 100) *
                  //   (receivedtotalRevenueReceipts?.[adjustedYearIndex] || 0);
                  // expenseValue = baseValue + ClosingStock - OpeningStock;
                  expenseValue = calculateRawMaterialExpense(
                    expense,
                    receivedtotalRevenueReceipts,
                    adjustedYearIndex
                  );
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
                    // const isRawMaterial =
                    //   expense.name.trim() ===
                    //   "Raw Material Expenses / Purchases";
                    // const isPercentage = String(expense.value)
                    //   .trim()
                    //   .endsWith("%");
                    // const ClosingStock =
                    //   formData?.MoreDetails?.ClosingStock?.[adjustedYearIndex] || 0;
                    // const OpeningStock =
                    //   formData?.MoreDetails?.OpeningStock?.[adjustedYearIndex] || 0;

                    // if (isRawMaterial && isPercentage) {
                    //   const baseValue =
                    //     (parseFloat(expense.value) / 100) *
                    //     (receivedtotalRevenueReceipts?.[adjustedYearIndex] ||
                    //       0);
                    //   expenseValue = baseValue + ClosingStock - OpeningStock;
                    // } else {
                    //   expenseValue = Number(expense.total) || 0;
                    // }
                    if (isRawMaterial && isPercentage) {
                      // Calculate raw material expense using the calculateRawMaterialExpense function
                      expenseValue = calculateRawMaterialExpense(
                        expense,
                        receivedtotalRevenueReceipts,
                        adjustedYearIndex
                      );
                    } else {
                      expenseValue = Number(expense.total) || 0;
                    }
                    // const formattedExpense =
                    //   isRawMaterial && isPercentage
                    //     ? formatNumber(expenseValue.toFixed(2))
                    //     : formatNumber(
                    //         calculateExpense(
                    //           expenseValue,
                    //           adjustedYearIndex
                    //         ).toFixed(2)
                    //       );
                    const formattedExpense =
                      isRawMaterial && isPercentage
                        ? formatNumber(n2(expenseValue))
                        : formatNumber(
                            n2(
                              calculateExpense(expenseValue, adjustedYearIndex)
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
                  })}
                </View>
              );
            })}

          {/* Advance Expenses of type "direct" */}
          {Array.isArray(formData?.Expenses?.advanceExpenses) &&
            formData.Expenses.advanceExpenses
              .filter(
                (row) =>
                  row.type === "direct" && row.name && row.name.trim() !== ""
              )
              .map((row, advIdx) => (
                <View
                  key={"adv-direct-" + advIdx}
                  style={[styles.tableRow, styles.totalRow]}
                >
                  <Text style={stylesCOP.serialNoCellDetail}>
                    {"A" + (advIdx + 1)}
                  </Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                    ]}
                  >
                    {row.name}
                  </Text>

                  {Array.from({
                    length: hideFirstYear
                      ? projectionYears - 1
                      : projectionYears,
                  }).map((_, yearIndex) => {
                    const adjustedYearIndex = hideFirstYear
                      ? yearIndex + 1
                      : yearIndex;
                    // Value for this year:
                    const value =
                      (row.values &&
                        row.values[financialYearLabels[adjustedYearIndex]]) ||
                      (row.values && row.values[adjustedYearIndex]) ||
                      0;
                    // Defensive: treat missing or invalid values as 0
                    return (
                      <Text
                        key={yearIndex}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                        ]}
                      >
                        {formatNumber(Number(value) || 0)}
                      </Text>
                    );
                  })}
                </View>
              ))}

          {/* direct Expenses total  */}
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
                {},
              ]}
            >
              Total
            </Text>
            {/* ✅ Display Precomputed Total Direct Expenses */}
            {totalDirectExpensesArray.map(
              (grandTotal, yearIndex) =>
                (!hideFirstYear || yearIndex !== 0) && (
                  <Text
                    key={yearIndex}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      stylesCOP.boldText,
                      styleExpenses.fontSmall,
                    ]}
                  >
                    {formatNumber(grandTotal)}
                  </Text>
                )
            )}
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
              >
                {/* You can add content here if needed */}
              </Text>
            ))}
          </View>
          {/* Interest On Term Loan */}
          {!isInterestOnTermLoanZero && (
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
                {renderIOTLLabel()}
              </Text>

              {/* Get total projection years */}
              {Array.from({
                length: formData?.ProjectReportSetting?.ProjectionYears || 0, // Ensure ProjectionYears is defined
              }).map(
                (_, index) =>
                  (!hideFirstYear || index !== 0) && (
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
                  )
              )}
            </View>
          )}
          {/* Interest on Working Capital */}
          {!isWorkingCapitalInterestZero && (
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text style={stylesCOP.serialNoCellDetail}>
                {" "}
                {isInterestOnTermLoanZero ? 1 : 2}
              </Text>

              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                ]}
              >
                {/* Interest On Working Capital */}
                {renderIOWCLabel()}
              </Text>

              {/* ✅ Apply `calculateInterestOnWorkingCapital` */}
              {Array.from({
                length: formData.ProjectReportSetting.ProjectionYears,
              }).map((_, yearIndex) => {
                if (hideFirstYear && yearIndex === 0) return null; // Skip first year if hideFirstYear is true

                const calculatedInterest =
                  calculateInterestOnWorkingCapital(yearIndex);

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
          )}
          {/* ✅ Render Depreciation Row */}
          {!isDepreciationZero && (
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text style={stylesCOP.serialNoCellDetail}>
                {isWorkingCapitalInterestZero ? 2 : 3}
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
          )}
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

              return expense.type === "indirect" && !isAllYearsZero;
            })

            .map((expense, index) => {
              const annualExpense = Number(expense.total) || 0; // ✅ Use annual total directly
              const isRawMaterial =
                expense.name.trim() === "Raw Material Expenses / Purchases";
              const displayName = isRawMaterial
                ? "Purchases / RM Expenses"
                : expense.name;
              const serialNumber =
                isInterestOnTermLoanZero && isDepreciationZero
                  ? index + 2
                  : isWorkingCapitalInterestZero
                  ? index + 3
                  : index + 4;
              return (
                <View key={index} style={[styles.tableRow, styles.totalRow]}>
                  <Text style={stylesCOP.serialNoCellDetail}>
                    {serialNumber}
                  </Text>

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
                    } else {
                      expenseValue = Number(expense.total) || 0;
                    }

                    // const formattedExpense =
                    //   isRawMaterial && isPercentage
                    //     ? formatNumber(expenseValue.toFixed(2))
                    //     : formatNumber(
                    //         calculateExpense(
                    //           expenseValue,
                    //           adjustedYearIndex
                    //         ).toFixed(2)
                    //       );
                    const formattedExpense =
                      isRawMaterial && isPercentage
                        ? formatNumber(n2(expenseValue))
                        : formatNumber(
                            n2(
                              calculateExpense(expenseValue, adjustedYearIndex)
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
                  })}
                </View>
              );
            })}
          ;{/* Advance Expenses of type "indirect" */}
          {Array.isArray(formData?.Expenses?.advanceExpenses) &&
            formData.Expenses.advanceExpenses
              .filter(
                (row) =>
                  row.type === "indirect" && row.name && row.name.trim() !== ""
              )
              .map((row, advIdx) => (
                <View
                  key={"adv-indirect-" + advIdx}
                  style={[styles.tableRow, styles.totalRow]}
                >
                  <Text style={stylesCOP.serialNoCellDetail}>
                    {"I" + (advIdx + 1)}
                  </Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                    ]}
                  >
                    {row.name}
                  </Text>

                  {Array.from({
                    length: hideFirstYear
                      ? projectionYears - 1
                      : projectionYears,
                  }).map((_, yearIndex) => {
                    const adjustedYearIndex = hideFirstYear
                      ? yearIndex + 1
                      : yearIndex;
                    const value =
                      (row.values &&
                        row.values[financialYearLabels[adjustedYearIndex]]) ||
                      (row.values && row.values[adjustedYearIndex]) ||
                      0;
                    return (
                      <Text
                        key={yearIndex}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                        ]}
                      >
                        {formatNumber(Number(value) || 0)}
                      </Text>
                    );
                  })}
                </View>
              ))}
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
                styles.Total,
                { paddingVertical: "10px" },
              ]}
            >
              Total
            </Text>

            {/* ✅ Display the calculated `totalIndirectExpensesArray` */}
            {totalIndirectExpensesArray.map(
              (totalValue, yearIndex) =>
                (!hideFirstYear || yearIndex !== 0) && (
                  <Text
                    key={yearIndex}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      stylesCOP.boldText,
                      styleExpenses.fontSmall,
                      styles.Total,
                      { paddingVertical: "10px" },
                    ]}
                  >
                    {formatNumber(totalValue)}
                  </Text>
                )
            )}
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
                  {/* {formatNumber(totalValue.toFixed(2))} */}
                  {formatNumber(n2(totalValue))}
                </Text>
              ))}
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
      </View>
    </Page>
  );
};

export default React.memo(ProjectedExpenses);
