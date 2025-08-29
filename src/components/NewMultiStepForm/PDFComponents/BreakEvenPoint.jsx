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

const toNumber = (value) => {
  const numberValue = Number(value);
  return isNaN(numberValue) ? 0 : numberValue; // Return 0 if it's NaN
};

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
  orientation,
}) => {
  // console.log("received total revenue receipt", receivedtotalRevenueReceipts)
  const years = formData?.ProjectReportSetting?.ProjectionYears || 5; // Default to 5 years if not provided
  const projectionYears =
    parseInt(formData?.ProjectReportSetting?.ProjectionYears) || 0;

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

  // ✅ Months Array for Indexing
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

  const hideFirstYear = receivedtotalRevenueReceipts?.[0] <= 0;

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

  // Utility to check if a value is effectively zero
  const isZeroValue = (val) => {
    const num = Number(val);
    return !num || num === 0; // covers 0, null, undefined, NaN, ""
  };

  // Check if all Interest On Term Loan values are zero or falsy
  const isInterestOnTermLoanZero = yearlyInterestLiabilities
    .slice(hideFirstYear ? 1 : 0)
    .every((val) => isZeroValue(val));

  // Check if all Depreciation values are zero or falsy
  const isDepreciationZero = totalDepreciationPerYear
    .slice(hideFirstYear ? 1 : 0)
    .every((val) => isZeroValue(val));

  const adjustedRevenueValues = Array.from({
    length: parseInt(formData?.ProjectReportSetting?.ProjectionYears) || 0,
  }).map((_, yearIndex) => {
    const totalRevenue = toNumber(totalRevenueReceipts[yearIndex] || 0);
    const ClosingStock = toNumber(
      formData?.MoreDetails?.ClosingStock?.[yearIndex] || 0
    );
    const OpeningStock = toNumber(
      formData?.MoreDetails?.OpeningStock?.[yearIndex] || 0
    );

    return totalRevenue + ClosingStock - OpeningStock; // ✅ Final computation
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

  const calculateRawMaterialExpense = (
    expense,
    receivedtotalRevenueReceipts,
    yearIndex
  ) => {
    const isRawMaterial =
      expense.name.trim() === "Raw Material Expenses / Purchases";
    const isPercentage = String(expense.value).trim().endsWith("%");

    const ClosingStock = Number(
      formData?.MoreDetails?.ClosingStock?.[yearIndex] || 0
    );
    const OpeningStock = Number(
      formData?.MoreDetails?.OpeningStock?.[yearIndex] || 0
    );

    let expenseValue = 0;

    if (isRawMaterial && isPercentage) {
      const baseValue =
        (parseFloat(expense.value) / 100) *
        (receivedtotalRevenueReceipts?.[yearIndex] || 0);
      expenseValue = baseValue + ClosingStock - OpeningStock; // Ensure it's a sum of numbers
    } else {
      expenseValue = num(expense.total); // Ensure we use num() to prevent string concatenation
    }

    return expenseValue;
  };

  // At the top of BreakEvenPoint (after extracting Expenses)
  const advanceExpenses = Array.isArray(Expenses?.advanceExpenses)
    ? Expenses.advanceExpenses.filter((row) => row && row.name && row.type)
    : [];

  // Utility to fetch advance value for a year
  const getAdvanceExpenseValueForYear = (row, yearLabelOrIndex) => {
    // Support for both "FY2024-25" or array index
    return num(row?.values?.[yearLabelOrIndex]) || 0;
  };

  // const totalVariableExpenses = Array.from({ length: projectionYears }).map(
  //   (_, yearIndex) => {
  //     const adjustedYearIndex = hideFirstYear ? yearIndex + 1 : yearIndex;
  //     const yearLabel = financialYearLabels[adjustedYearIndex];
  //     const totalFromExpenses = allExpenses.reduce((total, expense) => {
  //       // Match display logic
  //       const isRawMaterial =
  //         expense.name.trim() === "Raw Material Expenses / Purchases";
  //       const isPercentage = String(expense.value).trim().endsWith("%");

  //       let expenseValue = 0;
  //       if (isRawMaterial && isPercentage) {
  //         expenseValue = calculateRawMaterialExpense(
  //           expense,
  //           receivedtotalRevenueReceipts,
  //           adjustedYearIndex
  //         );
  //         // For raw material, your table may just display this
  //       } else {
  //         expenseValue = calculateExpense(
  //           Number(expense.total) || 0,
  //           adjustedYearIndex // <--- use the same index as your visible cell
  //         );
  //       }
  //       return total + expenseValue;
  //     }, 0);

  //     // Sum advance expenses (direct and indirect) for this year
  //     const totalAdvanceForYear = advanceExpenses.reduce((total, row) => {
  //       // Pick value by year label or index, as per your values object/array
  //       const advValue =
  //         getAdvanceExpenseValueForYear(row, yearLabel) ||
  //         getAdvanceExpenseValueForYear(row, adjustedYearIndex);
  //       return total + advValue;
  //     }, 0);

  //     const preliminaryExpense =
  //       preliminaryWriteOffPerYear[adjustedYearIndex] || 0;
  //     return totalFromExpenses + preliminaryExpense + totalAdvanceForYear;
  //   }
  // );

  const totalVariableExpenses = Array.from({
    length: projectionYears - (hideFirstYear ? 1 : 0),
  }).map((_, visibleIndex) => {
    const adjustedYearIndex = hideFirstYear ? visibleIndex + 1 : visibleIndex;
    const yearLabel = financialYearLabels[adjustedYearIndex];

    const totalFromExpenses = allExpenses.reduce((total, expense) => {
      const isRawMaterial =
        expense.name.trim() === "Raw Material Expenses / Purchases";
      const isPercentage = String(expense.value).trim().endsWith("%");

      let expenseValue = 0;
      if (isRawMaterial && isPercentage) {
        expenseValue = calculateRawMaterialExpense(
          expense,
          receivedtotalRevenueReceipts,
          adjustedYearIndex
        );
      } else {
        expenseValue = calculateExpense(
          Number(expense.total) || 0,
          adjustedYearIndex
        );
      }

      return total + expenseValue;
    }, 0);

    const totalAdvanceForYear = advanceExpenses.reduce((total, row) => {
      const advValue =
        getAdvanceExpenseValueForYear(row, yearLabel) ||
        getAdvanceExpenseValueForYear(row, adjustedYearIndex);
      return total + advValue;
    }, 0);

    const preliminaryExpense =
      preliminaryWriteOffPerYear[adjustedYearIndex] || 0;

    return totalFromExpenses + totalAdvanceForYear + preliminaryExpense;
  });

  // const contribution = adjustedRevenueValues.map((value, index) => {
  //   // Ensure both adjusted revenue and variable expenses are numbers
  //   const revenueValue = toNumber(value);
  //   const expenseValue = toNumber(totalVariableExpenses[index]);

  //   return revenueValue - expenseValue;
  // });

  // ✅ Compute Total Fixed Expenses for Each Year with Correct Handling

  //  const contribution = adjustedRevenueValues.map((value, index) => {
  //   // Adjust index to ensure proper mapping when hideFirstYear is enabled
  //   const adjustedIndex = hideFirstYear ? index + 1 : index;

  //   const revenueValue = toNumber(adjustedRevenueValues[adjustedIndex]);  // Adjust revenue index
  //   const expenseValue = toNumber(totalVariableExpenses[index]);  // Adjust expense index

  //   // Log for debugging
  //   console.log(`Year ${index + 1} | Adjusted Revenue: ${revenueValue} | Expense: ${expenseValue} | Contribution: ${revenueValue - expenseValue}`);

  //   return revenueValue - expenseValue;
  // });
  const contribution = Array.from({
    length: hideFirstYear ? projectionYears - 1 : projectionYears,
  }).map((_, index) => {
    const adjustedIndex = hideFirstYear ? index + 1 : index;

    const revenueValue = toNumber(adjustedRevenueValues[adjustedIndex]);
    const expenseValue = toNumber(totalVariableExpenses[index]);

    return revenueValue - expenseValue;
  });

  const totalFixedExpenses = Array.from({ length: projectionYears }).map(
    (_, yearIndex) => {
      // ✅ Calculate Salary & Wages using `calculateExpense`
      const salaryAndWages = calculateExpense(
        Number(fringAndAnnualCalculation) || 0,
        yearIndex // Pass the yearIndex to apply any year-specific logic
      );

      // ✅ Extract Interest on Term Loan
      const interestOnTermLoan = parseFloat(
        (yearlyInterestLiabilities[yearIndex] || 0).toFixed(2)
      );

      // ✅ Extract Interest on Working Capital
      const interestExpenseOnWorkingCapital =
        calculateInterestOnWorkingCapital(yearIndex);

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

      // Log the individual values for each year
      // console.log(`Year ${yearIndex + 1}:`);
      // console.log(`Salary & Wages: ${salaryAndWages}`);
      // console.log(`Interest on Term Loan: ${interestOnTermLoan}`);
      // console.log(`Interest on Working Capital: ${interestExpenseOnWorkingCapital}`);
      // console.log(`Depreciation: ${depreciationExpense}`);
      // console.log(`Total Fixed Expenses: ${totalExpense}`);
      // console.log('------------------------');

      return totalExpense;
    }
  );

  // console.log("Total Fixed Expenses for Each Year:", totalFixedExpenses);

  // ✅ Compute Break Even Point (in %) for Each Year
  const breakEvenPointPercentage = Array.from({
    length: hideFirstYear ? projectionYears - 1 : projectionYears,
  }).map((_, yearIndex) => {
    const adjustedYearIndex = hideFirstYear ? yearIndex + 1 : yearIndex;
    const totalFixed = totalFixedExpenses[adjustedYearIndex] || 0; // Get total fixed expenses for the year
    const contributionValue = contribution[yearIndex] || 1; // Avoid division by zero by using fallback 1
    //  console.log(`Year ${yearIndex + 1} | totalFixed: ${totalFixed} | contributionValue: ${contributionValue} | Contribution: ${totalFixed / contributionValue}`);
    return (totalFixed / contributionValue) * 100; // Compute Break Even Point in %
  });

  useEffect(() => {
    if (breakEvenPointPercentage.length > 0) {
      sendBreakEvenPointPercentage((prev) => ({
        ...prev,
        breakEvenPointPercentage,
      }));
    }
    // console.log("Sending Dscr : ", DSCR )
  }, [JSON.stringify(breakEvenPointPercentage)]);

  const isPreliminaryWriteOffAllZero = Array.from({
    length: hideFirstYear ? projectionYears - 1 : projectionYears,
  }).every((_, yearIndex) => {
    const adjustedYearIndex = hideFirstYear ? yearIndex + 1 : yearIndex; // ✅ Fix index offset
    return preliminaryWriteOffPerYear[adjustedYearIndex] === 0;
  });
  const visibleAllExpenses = allExpenses.filter((expense) => {
    const isAllYearsZero = Array.from({
      length: hideFirstYear ? projectionYears - 1 : projectionYears,
    }).every((_, yearIndex) => {
      const adjustedYearIndex = hideFirstYear ? yearIndex + 1 : yearIndex;

      let expenseValue = 0;
      const isRawMaterial =
        expense.name.trim() === "Raw Material Expenses / Purchases";
      const isPercentage = String(expense.value || "")
        .trim()
        .endsWith("%");
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

    return !isAllYearsZero;
  });

  const preliminarySerialNo = visibleAllExpenses.length + 2;

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

    // Visible local column indices for this page (respecting hideFirstYear)
    const visibleLocalCols = labels
      .map((_, i) => i)
      .filter((i) => !shouldSkipCol(globalIndex(i)));
    const centerLocalIdx =
      visibleLocalCols[Math.floor(visibleLocalCols.length / 2)];

    // Helper: build N empty cells matching visible columns on this page
    const renderEmptyCellsForVisibleCols = () =>
      labels.map((_, localIdx) => {
        const gIdx = globalIndex(localIdx);
        if (shouldSkipCol(gIdx)) return null;
        return (
          <Text
            key={`empty-${gIdx}`}
            style={[stylesCOP.particularsCellsDetail, styleExpenses.fontSmall]}
          />
        );
      });

    // Pre-compute the visible expenses list (only rows that aren't all-zero across visible columns)
    const visibleAllExpenses = allExpenses
      .filter((expense) => {
        // check only visible columns on this page
        const isAllZeroOnPage = visibleLocalCols.every((localIdx) => {
          const gIdx = globalIndex(localIdx);
          const isRawMaterial =
            expense.name.trim() === "Raw Material Expenses / Purchases";
          const isPercentage = String(expense.value).trim().endsWith("%");
          let expenseValue = 0;

          if (isRawMaterial && isPercentage) {
            // Year-specific RM expense based on receipts & stock adjustments
            expenseValue = calculateRawMaterialExpense(
              expense,
              receivedtotalRevenueReceipts,
              gIdx
            );
          } else {
            // Base yearly total before applying escalation profile
            expenseValue = Number(expense.total) || 0;
          }

          return Number(expenseValue) === 0;
        });

        return !isAllZeroOnPage;
      });

    return (
      <Page
        // size={formData.ProjectReportSetting?.ProjectionYears > 12 ? "A3" : "A4"}
        size="A4"
        orientation="landscape"
        wrap={false}
        break
        style={styles.page}
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
                src={
                  pdfType === "Sharda Associates" ? SAWatermark : CAWatermark
                }
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
                  : "" // Default case
              }
              )
            </Text>
          </View>

          <View
            style={[
              stylesCOP.heading,
              {
                fontWeight: "bold",
                paddingLeft: 10,
              },
            ]}
          >
            <Text>
              Break-Even Point
              {splitFinancialYearLabels.length > 1
                ? ` (${toRoman(pageIdx)})`
                : ""}
            </Text>
          </View>

          <View style={[styles.table, { borderRightWidth: 0 }]}>
            {/* Table Header */}
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
              {/* Generate Dynamic Year Headers: use labels for this page only */}
              {labels.map((yearLabel, localIdx) => {
                const gIdx = globalIndex(localIdx);
                if (shouldSkipCol(gIdx)) return null;
                return (
                  <Text
                    key={`hdr-${gIdx}`}
                    style={[styles.particularsCell, stylesCOP.boldText]}
                  >
                    {yearLabel}
                  </Text>
                );
              })}
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
                  { paddingVertical: "10px" },
                ]}
              >
                Gross Receipts
              </Text>

              {/* ✅ Dynamically Display Cells for visible columns */}
              {labels.map((_, localIdx) => {
                const gIdx = globalIndex(localIdx);
                if (shouldSkipCol(gIdx)) return null;
                return (
                  <Text
                    key={`gross-${gIdx}`}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      stylesCOP.boldText,
                      styleExpenses.fontSmall,
                      {
                        borderLeftWidth: "0px",
                        paddingVertical: "10px",
                        borderTopWidth: 0,
                        paddingBottom: "10px",
                      },
                    ]}
                  >
                    {formatNumber(totalRevenueReceipts[gIdx] || 0)}
                  </Text>
                );
              })}
            </View>

            {/* Closing Stock / Inventory */}
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]} />
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                ]}
              >
                Add: Closing Stock / Inventory
              </Text>

              {labels.map((_, localIdx) => {
                const gIdx = globalIndex(localIdx);
                if (shouldSkipCol(gIdx)) return null;
                const v =
                  formData?.MoreDetails?.ClosingStock?.[gIdx] ?? 0;
                return (
                  <Text
                    key={`closing-${gIdx}`}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                    ]}
                  >
                    {formatNumber(v)}
                  </Text>
                );
              })}
            </View>

            {/* Opening Stock / Inventory */}
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]} />
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                ]}
              >
                Less: Opening Stock / Inventory
              </Text>

              {labels.map((_, localIdx) => {
                const gIdx = globalIndex(localIdx);
                if (shouldSkipCol(gIdx)) return null;
                const v =
                  formData?.MoreDetails?.OpeningStock?.[gIdx] ?? 0;
                return (
                  <Text
                    key={`opening-${gIdx}`}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                    ]}
                  >
                    {formatNumber(v)}
                  </Text>
                );
              })}
            </View>

            {/* Computation of Adjusted Revenue (Gross + Closing - Opening) */}
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
                ]}
              ></Text>

              {/* ✅ Display Adjusted Revenue Values for visible columns */}
              {labels.map((_, localIdx) => {
                const gIdx = globalIndex(localIdx);
                if (shouldSkipCol(gIdx)) return null;
                const val = adjustedRevenueValues?.[gIdx] ?? 0;
                return (
                  <Text
                    key={`adjrev-${gIdx}`}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      stylesCOP.boldText,
                      styleExpenses.fontSmall,
                      { borderLeftWidth: "0px" },
                    ]}
                  >
                    {formatNumber(val)}
                  </Text>
                );
              })}
            </View>

            {/* Less: Variable Expense */}
            <View>
              <View style={[styles.tableRow, styles.totalRow]}>
                <Text
                  style={[
                    stylesCOP.serialNoCellDetail,
                    { paddingVertical: "10px", fontWeight: "bold" },
                  ]}
                />
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                    { paddingVertical: "10px", fontWeight: "bold" },
                  ]}
                >
                  Less: Variable Expense
                </Text>
                {renderEmptyCellsForVisibleCols()}
              </View>

              {/* ✅ Render All Expenses (Direct + Indirect) in a Single Section (for visible columns) */}
              {visibleAllExpenses.map((expense, idx) => {
                const isRawMaterial =
                  expense.name.trim() ===
                  "Raw Material Expenses / Purchases";
                const isPercentage = String(expense.value)
                  .trim()
                  .endsWith("%");
                const displayName = isRawMaterial
                  ? "Purchases / RM Expenses"
                  : expense.name;

                return (
                  <View
                    key={`exp-${idx}`}
                    style={[styles.tableRow, styles.totalRow]}
                  >
                    <Text style={stylesCOP.serialNoCellDetail}>
                      {idx + 1}
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
                        // Year-specific RM expense
                        expenseValue = calculateRawMaterialExpense(
                          expense,
                          receivedtotalRevenueReceipts,
                          gIdx
                        );
                      } else {
                        // Base value; apply escalation per year
                        expenseValue = Number(expense.total) || 0;
                      }

                      const formattedExpense =
                        isRawMaterial && isPercentage
                          ? formatNumber(
                              Number(expenseValue).toFixed(2)
                            )
                          : formatNumber(
                              Number(
                                calculateExpense(expenseValue, gIdx)
                              ).toFixed(2)
                            );

                      return (
                        <Text
                          key={`exp-${idx}-${gIdx}`}
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

              {/* ADVANCE EXPENSES RENDERING */}
              {advanceExpenses.length > 0 &&
                advanceExpenses.map((row, advIdx) => (
                  <View
                    key={`adv-exp-${advIdx}`}
                    style={[styles.tableRow, styles.totalRow]}
                  >
                    <Text style={stylesCOP.serialNoCellDetail}>
                      {visibleAllExpenses.length + advIdx + 1}
                    </Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      {row.name} (Advance)
                    </Text>

                    {labels.map((_, localIdx) => {
                      const gIdx = globalIndex(localIdx);
                      if (shouldSkipCol(gIdx)) return null;

                      // prefer year label first, then index
                      const yearLabel = financialYearLabels[gIdx];
                      const v =
                        getAdvanceExpenseValueForYear(row, yearLabel) ??
                        getAdvanceExpenseValueForYear(row, gIdx) ??
                        0;

                      return (
                        <Text
                          key={`adv-${advIdx}-${gIdx}`}
                          style={[
                            stylesCOP.particularsCellsDetail,
                            styleExpenses.fontSmall,
                          ]}
                        >
                          {formatNumber(v)}
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
                        key={`prelim-${gIdx}`}
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
                      textAlign: "right",
                      paddingBottom: "10px",
                    },
                  ]}
                >
                  Total
                </Text>

                {/* Totals for visible columns */}
                {labels.map((_, localIdx) => {
                  const gIdx = globalIndex(localIdx);
                  if (shouldSkipCol(gIdx)) return null;
                  const total = totalVariableExpenses?.[gIdx] ?? 0;
                  return (
                    <Text
                      key={`tvar-${gIdx}`}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                        {
                          borderBottom: 0,
                          paddingBottom: "10px",
                          borderTopWidth: ".5px",
                        },
                      ]}
                    >
                      {formatNumber(total)}
                    </Text>
                  );
                })}
              </View>
            </View>

            {/* Contribution */}
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
              <Text style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]} />
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                ]}
              >
                Contribution
              </Text>

              {labels.map((_, localIdx) => {
                const gIdx = globalIndex(localIdx);
                if (shouldSkipCol(gIdx)) return null;
                const v = contribution?.[gIdx] ?? 0;
                return (
                  <Text
                    key={`contrib-${gIdx}`}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                      { borderWidth: "1.2px", borderLeftWidth: "0px" },
                    ]}
                  >
                    {formatNumber(v)}
                  </Text>
                );
              })}
            </View>

            {/* Less: Fixed Expenses */}
            <View>
              <View style={[styles.tableRow, styles.totalRow]}>
                <Text
                  style={[
                    stylesCOP.serialNoCellDetail,
                    { paddingVertical: "10px", fontWeight: "bold" },
                  ]}
                />
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                    { paddingVertical: "10px", fontWeight: "bold" },
                  ]}
                >
                  Less: Fixed Expenses
                </Text>
                {renderEmptyCellsForVisibleCols()}
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

                {labels.map((_, localIdx) => {
                  const gIdx = globalIndex(localIdx);
                  if (shouldSkipCol(gIdx)) return null;

                  return (
                    <Text
                      key={`sal-${gIdx}`}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                      ]}
                    >
                      {formatNumber(
                        Number(
                          calculateExpense(
                            Number(fringAndAnnualCalculation) || 0,
                            gIdx
                          ).toFixed(2)
                        )
                      )}
                    </Text>
                  );
                })}
              </View>

              {/* Interest On Term Loan */}
              {!isInterestOnTermLoanZero && (
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
                    Interest On Term Loan
                  </Text>

                  {labels.map((_, localIdx) => {
                    const gIdx = globalIndex(localIdx);
                    if (shouldSkipCol(gIdx)) return null;

                    return (
                      <Text
                        key={`int-tl-${gIdx}`}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                        ]}
                      >
                        {formatNumber(
                          yearlyInterestLiabilities?.[gIdx] ?? 0
                        )}
                      </Text>
                    );
                  })}
                </View>
              )}

              {/* Interest On Working Capital */}
              {!isWorkingCapitalInterestZero && (
                <View style={[styles.tableRow, styles.totalRow]}>
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

                  {labels.map((_, localIdx) => {
                    const gIdx = globalIndex(localIdx);
                    if (shouldSkipCol(gIdx)) return null;
                    const calculatedInterest =
                      calculateInterestOnWorkingCapital(gIdx);

                    return (
                      <Text
                        key={`int-wc-${gIdx}`}
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
                  <Text
                    style={[
                      stylesCOP.serialNoCellDetail,
                      styleExpenses.sno,
                      styleExpenses.bordernone,
                    ]}
                  >
                    {isWorkingCapitalInterestZero ? 3 : 4}
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

                  {labels.map((_, localIdx) => {
                    const gIdx = globalIndex(localIdx);
                    if (shouldSkipCol(gIdx)) return null;
                    const depreciationValue =
                      totalDepreciationPerYear?.[gIdx] ?? 0;
                    return (
                      <Text
                        key={`dep-${gIdx}`}
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
                      textAlign: "right",
                    },
                  ]}
                >
                  Total
                </Text>

                {labels.map((_, localIdx) => {
                  const gIdx = globalIndex(localIdx);
                  if (shouldSkipCol(gIdx)) return null;
                  const totalValue = totalFixedExpenses?.[gIdx] ?? 0;
                  return (
                    <Text
                      key={`tfixed-${gIdx}`}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        stylesCOP.boldText,
                        styleExpenses.fontSmall,
                      ]}
                    >
                      {formatNumber(totalValue)}
                    </Text>
                  );
                })}
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
                  { paddingVertical: "10px" },
                ]}
              >
                Break Even Point (in %)
              </Text>

              {labels.map((_, localIdx) => {
                const gIdx = globalIndex(localIdx);
                if (shouldSkipCol(gIdx)) return null;
                const v = Number(breakEvenPointPercentage?.[gIdx] ?? 0);
                return (
                  <Text
                    key={`bep-${gIdx}`}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                      {
                        borderWidth: "0px",
                        borderRightWidth: "1px",
                        paddingVertical: "10px",
                      },
                    ]}
                  >
                    {formatNumber(parseFloat(v.toFixed(2)))}%
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
                marginTop: "50px",
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
      // size={formData.ProjectReportSetting?.ProjectionYears > 12 ? "A3" : "A4"}
      size="A4"
      orientation={orientation}
      wrap={false}
      break
      style={styles.page}
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

        <View style={[styles.table, { borderRightWidth: 0 }]}>
          {/* Table Header */}
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
                { paddingVertical: "10px" },
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
                    key={`ClosingStock-${index}`}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                    ]}
                  >
                    {formatNumber(
                      formData.MoreDetails.ClosingStock?.[index] ?? 0
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
                    key={`OpeningStock-${index}`}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                    ]}
                  >
                    {formatNumber(
                      formData.MoreDetails.OpeningStock?.[index] ?? 0
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
                {},
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

                      fontWeight: "bold",
                    },
                  ]}
                ></Text>
              ))}
            </View>

            {/* ✅ Render All Expenses (Direct + Indirect) in a Single Section */}
            {allExpenses
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
                  const isPercentage = String(expense.value)
                    .trim()
                    .endsWith("%");
                  const ClosingStock =
                    formData?.MoreDetails?.ClosingStock?.[yearIndex] || 0;
                  const OpeningStock =
                    formData?.MoreDetails?.OpeningStock?.[yearIndex] || 0;

                  // if (isRawMaterial && isPercentage) {
                  //   const baseValue =
                  //     (parseFloat(expense.value) / 100) *
                  //     (receivedtotalRevenueReceipts?.[adjustedYearIndex] || 0);
                  //   expenseValue = baseValue + ClosingStock - OpeningStock;
                  // } else {
                  //   expenseValue = Number(expense.total) || 0;
                  // }
                  if (isRawMaterial && isPercentage) {
                    // Call calculateRawMaterialExpense and pass the adjustedYearIndex
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

                return !isAllYearsZero;
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
                    <Text style={stylesCOP.serialNoCellDetail}>
                      {index + 1}
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
                        // Call calculateRawMaterialExpense and pass the adjustedYearIndex
                        expenseValue = calculateRawMaterialExpense(
                          expense,
                          receivedtotalRevenueReceipts,
                          adjustedYearIndex
                        );
                      } else {
                        expenseValue = Number(expense.total) || 0;
                      }

                      const formattedExpense =
                        isRawMaterial && isPercentage
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

            {/* ADVANCE EXPENSES RENDERING */}
            {advanceExpenses.length > 0 &&
              advanceExpenses.map((row, advIdx) => (
                <View
                  key={"adv-exp-" + advIdx}
                  style={[styles.tableRow, styles.totalRow]}
                >
                  <Text style={stylesCOP.serialNoCellDetail}>
                    {visibleAllExpenses.length + advIdx + 1}
                  </Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                    ]}
                  >
                    {row.name} (Advance)
                  </Text>
                  {Array.from({
                    length: hideFirstYear
                      ? projectionYears - 1
                      : projectionYears,
                  }).map((_, yearIndex) => {
                    const adjustedYearIndex = hideFirstYear
                      ? yearIndex + 1
                      : yearIndex;
                    const yearLabel = financialYearLabels[adjustedYearIndex];
                    const value =
                      getAdvanceExpenseValueForYear(row, yearLabel) ||
                      getAdvanceExpenseValueForYear(row, adjustedYearIndex) ||
                      0;
                    return (
                      <Text
                        key={yearIndex}
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

                    textAlign: "right",
                    paddingBottom: "10px",
                  },
                ]}
              >
                Total
              </Text>

              {/* ✅ Display Properly Formatted Totals for Each Year */}
              {totalVariableExpenses.map((total, yearIndex) => (
                // (!hideFirstYear || yearIndex !== 0) && (
                <Text
                  key={yearIndex}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                    {
                      borderBottom: 0,
                      paddingBottom: "10px",
                      borderTopWidth: ".5px",
                    },
                  ]}
                >
                  {formatNumber(total)} {/* ✅ Correctly formatted total */}
                </Text>
              ))}
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
                {},
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
                    borderWidth: "1.2px",
                    borderLeftWidth: "0px",
                  },
                ]}
              >
                {formatNumber(total)} {/* ✅ Round off Value */}
              </Text>
            ))}
          </View>

          {/* Less: Fixed Expenses */}
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
              ></Text>
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
              {/* {Array.from({
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
                      hideFirstYear ? yearIndex - 1 : yearIndex // Shift index when skipping the first year
                    ).toFixed(2)
                  )}
                </Text>
              ))} */}
              {Array.from({
                length: projectionYears - (hideFirstYear ? 1 : 0),
              }).map((_, visibleIndex) => {
                const adjustedIndex = hideFirstYear
                  ? visibleIndex + 1
                  : visibleIndex;

                return (
                  <Text
                    key={adjustedIndex}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                    ]}
                  >
                    {formatNumber(
                      calculateExpense(
                        Number(fringAndAnnualCalculation) || 0,
                        adjustedIndex
                      ).toFixed(2)
                    )}
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
            )}

            {/* Interest On Working Capital */}
            {!isWorkingCapitalInterestZero && (
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
                <Text
                  style={[
                    stylesCOP.serialNoCellDetail,
                    styleExpenses.sno,
                    styleExpenses.bordernone,
                  ]}
                >
                  {isWorkingCapitalInterestZero ? 3 : 4}
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
                        {},
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
                  paddingVertical: "10px",
                },
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
                    borderWidth: "0px",
                    borderRightWidth: "1px",
                    paddingVertical: "10px",
                  },
                ]}
              >
                {formatNumber(parseFloat(value.toFixed(2)))}%{" "}
                {/* ✅ Display with 2 Decimal Places */}
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
              marginTop: "50px",
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

export default React.memo(BreakEvenPoint);
