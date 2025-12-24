import React, { useEffect, useMemo } from "react";
import { Page, View, Text} from "@react-pdf/renderer";
import { styles, stylesCOP, stylesMOF, styleExpenses } from "./Styles";
import shouldHideFirstYear from "./HideFirstYear";
import PDFHeader from "./HeaderFooter/PDFHeader";
import PDFFooter from "./HeaderFooter/PDFFooter";


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

const ProjectedProfitability = ({
  formData,
  normalExpense,
  directExpense,
  totalDepreciationPerYear,
  onComputedData,
  yearlyInterestLiabilities,
  setInterestOnWorkingCapital, // ✅ Receiving Setter Function from Parent
  totalRevenueReceipts,
  fringAndAnnualCalculation,
  financialYearLabels,
  handleDataSend,
  handleIncomeTaxDataSend,
  formatNumber,
  receivedtotalRevenueReceipts,
  onComputedDataToProfit,
  orientation,
  renderIOTLLabel,
  renderIOWCLabel,
  renderWithdrawalLabel
}) => {
  // console.log(totalRevenueReceipts, "totalRevenueReceipts in pp");
  // console.log(' yearlyInterestLiabilities',  yearlyInterestLiabilities)
  useEffect(() => {
    if (yearlyInterestLiabilities.length > 0) {
      //  console.log("✅ Updated Yearly Interest Liabilities in State:", yearlyInterestLiabilities);
    }
  }, [yearlyInterestLiabilities]); // ✅ Runs when state update

  const activeRowIndex = 0; // Define it or fetch dynamically if needed

  const projectionYears =
    parseInt(formData.ProjectReportSetting.ProjectionYears) || 0;

  const indirectExpense = directExpense.filter(
    (expense) => expense.type === "indirect"
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

  // Check if all Interest On Term Loan values are zero or falsy
  const isInterestOnTermLoanZero = yearlyInterestLiabilities
    .slice(hideFirstYear ? 1 : 0)
    .every((val) => isZeroValue(val));

  // Check if all Depreciation values are zero or falsy
  const isDepreciationZero = totalDepreciationPerYear
    .slice(hideFirstYear ? 1 : 0)
    .every((val) => isZeroValue(val));

  const calculateInterestOnWorkingCapital = useMemo(() => {
    //  console.log("moratorium month", moratoriumPeriodMonths);

    const principal =
      Number(formData.MeansOfFinance?.workingCapital?.termLoan) || 0;
    const rate = Number(formData.ProjectReportSetting?.interestOnWC) || 0;
    const annualInterestAmount = (principal * rate) / 100;

    const firstRepaymentYearIndex = monthsPerYear.findIndex(
      (months) => months > 0
    );

    return (yearIndex) => {
      const monthsInYear = monthsPerYear[yearIndex] || 0;
      //  console.log(`Year ${yearIndex + 1} months: ${monthsInYear}`);
      if (monthsInYear === 0) {
        // Entire year in moratorium, no interest
        return 0;
      }

      if (
        yearIndex === firstRepaymentYearIndex &&
        (moratoriumPeriodMonths > 0 || monthsInYear < 12)
      ) {
        const prorated = (annualInterestAmount * monthsInYear) / 12;
        //  console.log(`Year ${yearIndex + 1} prorated interest:`, prorated);
        return prorated;
      }

      return annualInterestAmount;
    };
  }, [formData, moratoriumPeriodMonths, monthsPerYear]);

  const isWorkingCapitalInterestZero = Array.from({
    length: projectionYears,
  }).every((_, yearIndex) => {
    const calculatedInterest = calculateInterestOnWorkingCapital(yearIndex);
    return calculatedInterest === 0;
  });

  // Function to calculate the expense for each year considering the increment rate
  const calculateExpense = useMemo(() => {
    return (annualExpense, yearIndex) => {
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
  }, [monthsPerYear, rateOfExpense]);

  const calculateRawMaterialExpense = useMemo(() => {
    return (expense, receivedtotalRevenueReceipts, yearIndex) => {
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
        expenseValue = baseValue + ClosingStock - OpeningStock;
      } else {
        expenseValue = num(expense.total);
      }

      return expenseValue;
    };
  }, [formData?.MoreDetails?.ClosingStock, formData?.MoreDetails?.OpeningStock]);

  const totalDirectExpensesArray = useMemo(() => {
    return Array.from({
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
            value = calculateExpense(Number(expense.total) || 0, yearIndex);
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

      // FINAL direct expenses for this year
      return directTotal + salaryTotal + advanceDirectTotal;
    });
  }, [directExpense, normalExpense, fringAndAnnualCalculation, formData?.Expenses?.advanceExpenses, financialYearLabels, receivedtotalRevenueReceipts, calculateRawMaterialExpense, calculateExpense]);

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



  const preliminaryWriteOffPerYear = Array.from({
    length: projectionYears,
  }).map((_, yearIndex) => {
    // Use the same monthsPerYear array that other expenses use
    const monthsInYear = monthsPerYear[yearIndex] || 0;

    console.log(`Year ${yearIndex + 1}: monthsInYear = ${monthsInYear}`);

    // If no months in this year (full moratorium), return 0
    if (monthsInYear === 0) {
      return 0;
    }

    // Find the first year that has actual months (moratorium ends)
    const firstYearWithMonths = monthsPerYear.findIndex(months => months > 0);
    if (firstYearWithMonths === -1) {
      return 0; // All years in moratorium
    }

    // Calculate the actual start year for write-off (considering hideFirstYear)
    const effectiveStartYear = Math.max(hideFirstYear ? 1 : 0, firstYearWithMonths);
    const writeOffEndYear = effectiveStartYear + preliminaryWriteOffYears;

    console.log(`Year ${yearIndex + 1}: effectiveStartYear = ${effectiveStartYear}, writeOffEndYear = ${writeOffEndYear}`);

    // Check if this year is within the write-off period
    if (yearIndex >= effectiveStartYear && yearIndex < writeOffEndYear) {
      // If it's a partial year, prorate the write-off
      if (monthsInYear < 12) {
        const proratedAmount = (yearlyWriteOffAmount * monthsInYear) / 12;
        console.log(`Year ${yearIndex + 1}: prorated write-off = ${proratedAmount}`);
        return proratedAmount;
      }
      console.log(`Year ${yearIndex + 1}: full write-off = ${yearlyWriteOffAmount}`);
      return yearlyWriteOffAmount;
    }

    console.log(`Year ${yearIndex + 1}: outside write-off window = 0`);
    return 0;
  });

  // Debug the final result
  console.log("preliminaryWriteOffPerYear:", preliminaryWriteOffPerYear);


  // ✅ Extract required values from formData

  const totalIndirectExpensesArray = useMemo(() => {
    return Array.from({
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
  }, [indirectExpense, formData?.Expenses?.advanceExpenses, financialYearLabels, yearlyInterestLiabilities, calculateInterestOnWorkingCapital, totalDepreciationPerYear, preliminaryWriteOffPerYear, calculateExpense]);

  const workingCapitalLoan = formData?.MeansOfFinance?.workingCapital?.termLoan; // Loan amount
  const interestRate = formData?.ProjectReportSetting?.rateOfInterest / 100; // Convert % to decimal

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
          return workingCapitalLoan * interestRate * (monthsInYear / 12);
        }
      );

      // console.log("✅ Computed Interest on Working Capital:", computedInterest);

      // ✅ If Parent Function Exists, Update Parent Component
      if (setInterestOnWorkingCapital) {
        setInterestOnWorkingCapital(computedInterest);
      }
    }
  }, [workingCapitalLoan, interestRate, projectionYears, repaymentStartMonth]);

  // ✅ Compute Adjusted Revenue Values for Each Year Before Rendering
  const adjustedRevenueValues = useMemo(() => {
    return Array.from({
      length: parseInt(formData?.ProjectReportSetting?.ProjectionYears) || 0,
    }).map((_, yearIndex) => {
      const totalRevenue = totalRevenueReceipts[yearIndex] || 0;
      const ClosingStock = formData?.MoreDetails?.ClosingStock?.[yearIndex] || 0;
      const OpeningStock = formData?.MoreDetails?.OpeningStock?.[yearIndex] || 0;

      return totalRevenue + Number(ClosingStock) - Number(OpeningStock);
    });
  }, [formData?.ProjectReportSetting?.ProjectionYears, totalRevenueReceipts, formData?.MoreDetails?.ClosingStock, formData?.MoreDetails?.OpeningStock]);

  // ✅ Step 2: Compute Gross Profit Values for Each Year After `totalDirectExpenses` is Defined
  const grossProfitValues = useMemo(() => {
    return adjustedRevenueValues.map(
      (adjustedRevenue, yearIndex) => {
        const totalDirectExpenses = totalDirectExpensesArray[yearIndex] || 0;
        return adjustedRevenue - totalDirectExpenses;
      }
    );
  }, [adjustedRevenueValues, totalDirectExpensesArray]);

  // ✅ Precompute Net Profit Before Tax (NPBT) for Each Year Before Rendering
  const netProfitBeforeTax = useMemo(() => {
    return grossProfitValues.map((grossProfit, yearIndex) => {
      const totalIndirectExpenses = totalIndirectExpensesArray[yearIndex] || 0;
      return grossProfit - totalIndirectExpenses;
    });
  }, [grossProfitValues, totalIndirectExpensesArray]);

  // ✅ Precompute Income Tax Calculation for Each Year Before Rendering
  const incomeTaxCalculation = useMemo(() => {
    return netProfitBeforeTax.map((npbt, yearIndex) => {
      return (npbt * formData.ProjectReportSetting.incomeTax) / 100;
    });
  }, [netProfitBeforeTax, formData.ProjectReportSetting.incomeTax]);

  const netProfitAfterTax = useMemo(() => {
    return netProfitBeforeTax.map((npat, yearIndex) => {
      const tax = incomeTaxCalculation[yearIndex] || 0;
      return npat - tax;
    });
  }, [netProfitBeforeTax, incomeTaxCalculation]);

  // Precompute Balance Transferred to Balance Sheet
  const balanceTransferred = useMemo(() => {
    return netProfitAfterTax.map(
      (npbt, yearIndex) => {
        const withdrawal = formData.MoreDetails.Withdrawals?.[yearIndex] || 0;
        return npbt - withdrawal;
      }
    );
  }, [netProfitAfterTax, formData.MoreDetails.Withdrawals]);

  // Precompute Cumulative Balance Transferred to Balance Sheet
  const cumulativeBalanceTransferred = useMemo(() => {
    const result = [];
    balanceTransferred.forEach((amount, index) => {
      if (index === 0) {
        result.push(Math.max(amount, 0));
      } else {
        result.push(
          Math.max(amount + result[index - 1], 0)
        );
      }
    });
    return result;
  }, [balanceTransferred]);

  // ✅ Compute Cash Profit for Each Year
  const cashProfitArray = useMemo(() => {
    return netProfitAfterTax.map((npat, yearIndex) => {
      const depreciation = totalDepreciationPerYear[yearIndex] || 0;
      return npat + depreciation;
    });
  }, [netProfitAfterTax, totalDepreciationPerYear]);
  useEffect(() => {
    if (cumulativeBalanceTransferred.length > 0) {
      // Pass the data directly as an object
      handleDataSend({
        cumulativeBalanceTransferred,
      });
    }
    // console.log("cummulative data", cumulativeBalanceTransferred);
  }, [JSON.stringify(cumulativeBalanceTransferred)]);

  useEffect(() => {
    if (incomeTaxCalculation.length > 0) {
      // Pass the data directly as an object
      handleIncomeTaxDataSend({
        incomeTaxCalculation,
      });
    }
    //  console.log("Income Tax data", incomeTaxCalculation);
  }, [JSON.stringify(incomeTaxCalculation)]);

  // ✅ Ensure `onComputedData` updates only when required
  useEffect(() => {
    if (grossProfitValues.length > 0) {
      onComputedData((prev) => ({
        ...prev,
        grossProfitValues,
        netProfitBeforeTax,
        cashProfitArray,
      }));
    }
  }, [
    JSON.stringify(grossProfitValues),
    JSON.stringify(netProfitBeforeTax),
    JSON.stringify(cashProfitArray),
  ]);

  useEffect(() => {
    if (netProfitAfterTax.length > 0) {
      onComputedData((prev) => ({
        ...prev,
        netProfitAfterTax,
      }));
    }
  }, [JSON.stringify(netProfitAfterTax)]);

  useEffect(() => {
    if (netProfitAfterTax.length > 0) {
      onComputedDataToProfit((prev) => ({
        ...prev,
        netProfitAfterTax,
      }));
    }
    // console.log("Sending DAta to Checkl Profit", netProfitAfterTax)
  }, [JSON.stringify(netProfitAfterTax)]);

  useEffect(() => {
    const storedProfitabilityData = {
      totalDirectExpensesArray,
      totalIndirectExpensesArray,
      calculateExpense,
    };

    localStorage.setItem(
      "storedProfitabilityData",
      JSON.stringify(storedProfitabilityData)
    );
  }, [totalDirectExpensesArray, totalIndirectExpensesArray, calculateExpense]); // Runs when these values change

  useEffect(() => {
    const storedData = localStorage.getItem("storedProfitabilityData");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      // console.log("Retrieved Data:", parsedData);
    }
  }, []);


  const isPreliminaryWriteOffAllZero = Array.from({
    length: hideFirstYear ? projectionYears - 1 : projectionYears,
  }).every((_, yearIndex) => {
    const adjustedYearIndex = hideFirstYear ? yearIndex + 1 : yearIndex;
    return preliminaryWriteOffPerYear[adjustedYearIndex] === 0;
  });

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

  if (isAdvancedLandscape) {
    return splitFinancialYearLabels.map((labels, pageIdx) => {
      // labels is the page's array of financial year labels (subset of financialYearLabels)
      const pageStart =
        Math.max(0, financialYearLabels.indexOf(labels[0])) || 0;

      const globalIndex = (localIdx) => pageStart + localIdx;
      const shouldSkipCol = (gIdx) => hideFirstYear && gIdx === 0;

      // console.log(formData, "formdata in pp");

      return (
        <Page
          // size={
          //   formData.ProjectReportSetting.ProjectionYears > 12 ? "A3" : "A4"
          // }
          size="A4"
          orientation="landscape"
          style={styles.page}
          wrap={false}
          break
        >
          <PDFHeader />

          <View style={[styleExpenses.paddingx, { paddingBottom: "30px" }]}>


            <View>
              <View style={stylesCOP.heading}>
                <Text>
                  Projected Profitability Statement
                  {splitFinancialYearLabels.length > 1
                    ? ` (${["I", "II", "III", "IV", "V"][pageIdx]})`
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

                  {/* Generate Dynamic Year Headers using current page labels */}
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

                {/* Blank Row  */}
                <View
                  style={[
                    stylesMOF.row,
                    styles.tableRow,
                    styles.Total,
                    {
                      border: 0,
                    },
                  ]}
                >
                  <Text
                    style={[
                      stylesCOP.serialNoCellDetail,
                      styleExpenses.sno,
                      styleExpenses.bordernone,
                      styles.Total,
                    ]}
                  ></Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                      styles.Total,
                      {},
                    ]}
                  ></Text>

                  {/* ✅ Display revenue values aligned to current page */}
                  {labels.map((_, localIdx) => {
                    const gIdx = globalIndex(localIdx);
                    if (shouldSkipCol(gIdx)) return null;
                    return (
                      <Text
                        key={gIdx}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                          { paddingVertical: "5px" },
                        ]}
                      ></Text>
                    );
                  })}
                </View>

                {/* ✅ Display Total Revenue Receipt Row */}
                <View
                  style={[
                    stylesMOF.row,
                    styles.tableRow,
                    styles.Total,
                    {
                      border: 0,
                    },
                  ]}
                >
                  <Text
                    style={[
                      stylesCOP.serialNoCellDetail,
                      styleExpenses.sno,
                      styleExpenses.bordernone,
                      styles.Total,
                    ]}
                  >
                    A
                  </Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                      styles.Total,
                      {},
                    ]}
                  >
                    Total Revenue Receipt
                  </Text>

                  {/* ✅ Display revenue values aligned to current page */}
                  {labels.map((_, localIdx) => {
                    const gIdx = globalIndex(localIdx);
                    if (shouldSkipCol(gIdx)) return null;
                    return (
                      <Text
                        key={gIdx}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          stylesCOP.boldText,
                          styleExpenses.fontSmall,
                          styles.Total,
                          { borderLeftWidth: "0px" },
                        ]}
                      >
                        {formatNumber(totalRevenueReceipts?.[gIdx] || 0)}
                      </Text>
                    );
                  })}
                </View>

                {/* Closing Stock / Inventory */}
                <View style={[styles.tableRow, styles.totalRow]}>
                  <Text
                    style={[
                      stylesCOP.serialNoCellDetail,
                      styleExpenses.sno,
                      styleExpenses.bordernone,
                      styles.Total,
                      { paddingVertical: "10px" },
                    ]}
                  >
                    B
                  </Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                      { paddingVertical: "10px" },
                    ]}
                  >
                    Add: Closing Stock / Inventory
                  </Text>

                  {labels.map((_, localIdx) => {
                    const gIdx = globalIndex(localIdx);
                    if (shouldSkipCol(gIdx)) return null;
                    return (
                      <Text
                        key={`ClosingStock-${gIdx}`}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                          { paddingVertical: "10px" },
                        ]}
                      >
                        {formatNumber(
                          formData.MoreDetails.ClosingStock?.[gIdx] ?? 0
                        )}
                      </Text>
                    );
                  })}
                </View>
                {/* Opening Stock / Inventory */}
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
                    Less: Opening Stock / Inventory
                  </Text>

                  {labels.map((_, localIdx) => {
                    const gIdx = globalIndex(localIdx);
                    if (shouldSkipCol(gIdx)) return null;
                    return (
                      <Text
                        key={`OpeningStock-${gIdx}`}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                        ]}
                      >
                        {formatNumber(
                          formData.MoreDetails.OpeningStock?.[gIdx] ?? 0
                        )}
                      </Text>
                    );
                  })}
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
                  ></Text>

                  {/* ✅ Display Computed Adjusted Revenue Values (page aligned) */}
                  {labels.map((_, localIdx) => {
                    const gIdx = globalIndex(localIdx);
                    if (shouldSkipCol(gIdx)) return null;
                    const finalValue = adjustedRevenueValues?.[gIdx] ?? 0;
                    return (
                      <Text
                        key={`finalValue-${gIdx}`}
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
                    );
                  })}
                </View>

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
                    <View
                      key={index}
                      style={[styles.tableRow, styles.totalRow]}
                    >
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

                      // Determine actual value
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
                            // Calculate raw material expense using the calculateRawMaterialExpense function
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
                              ? formatNumber(expenseValue.toFixed(2))
                              : formatNumber(
                                calculateExpense(expenseValue, gIdx).toFixed(
                                  2
                                )
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
                          // Value for this year:
                          const value =
                            (row.values &&
                              (row.values[financialYearLabels[gIdx]] ??
                                row.values[labels[localIdx]] ??
                                row.values[gIdx])) ||
                            0;
                          // Defensive: treat missing or invalid values as 0
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
                  {/* ✅ Display Precomputed Total Direct Expenses (page aligned) */}
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

                {/* Blank Row  */}
                <View
                  style={[
                    stylesMOF.row,
                    styles.tableRow,
                    styles.Total,
                    {
                      border: 0,
                    },
                  ]}
                >
                  <Text
                    style={[
                      stylesCOP.serialNoCellDetail,
                      styleExpenses.sno,
                      styleExpenses.bordernone,
                      styles.Total,
                    ]}
                  ></Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                      styles.Total,
                      {},
                    ]}
                  ></Text>

                  {/* ✅ Display revenue values aligned to current page */}
                  {labels.map((_, localIdx) => {
                    const gIdx = globalIndex(localIdx);
                    if (shouldSkipCol(gIdx)) return null;
                    return (
                      <Text
                        key={gIdx}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                          { paddingVertical: "5px" },
                        ]}
                      ></Text>
                    );
                  })}
                </View>

                {/* Gross Profit Calculation */}
                <View style={[stylesMOF.row, styles.tableRow]}>
                  <Text
                    style={[
                      stylesCOP.serialNoCellDetail,
                      styleExpenses.sno,
                      styleExpenses.bordernone,
                      {},
                    ]}
                  >
                    D
                  </Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                      {},
                    ]}
                  >
                    Gross Profit
                  </Text>

                  {/* ✅ Display Precomputed Gross Profit Values (page aligned) */}
                  {labels.map((_, localIdx) => {
                    const gIdx = globalIndex(localIdx);
                    if (shouldSkipCol(gIdx)) return null;
                    const grossProfit = grossProfitValues?.[gIdx] ?? 0;
                    return (
                      <Text
                        key={`grossProfit-${gIdx}`}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          stylesCOP.boldText,
                          styleExpenses.fontSmall,
                          {
                            borderWidth: "1.2px",
                            borderLeftWidth: "0px",

                            //
                          },
                        ]}
                      >
                        {formatNumber(grossProfit)}
                      </Text>
                    );
                  })}
                </View>

                {/* indirect expense */}
                <View>
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text
                      style={[
                        stylesCOP.serialNoCellDetail,
                        styles.Total,
                        { paddingVertical: "10px" },
                      ]}
                    >
                      E
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
                      Less:Indirect Expenses
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
                  {/* Interest On Term Loan */}
                  {!isInterestOnTermLoanZero && (
                    <View style={[styles.tableRow, styles.totalRow]}>
                      {/* Serial Number */}
                      <Text style={stylesCOP.serialNoCellDetail}>1</Text>

                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        {renderIOTLLabel()}
                        {/* Interest On Term Loan */}
                      </Text>

                      {/* Get totals aligned to current page */}
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
                              yearlyInterestLiabilities?.[gIdx] ?? 0 // Prevents undefined access
                            )}
                          </Text>
                        );
                      })}
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

                      {/* ✅ Display Depreciation Values for Each Year (page aligned) */}
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

                        // Determine actual value
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
                            (receivedtotalRevenueReceipts?.[
                              adjustedYearIndex
                            ] || 0);
                          expenseValue =
                            baseValue + ClosingStock - OpeningStock;
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
                        expense.name.trim() ===
                        "Raw Material Expenses / Purchases";
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
                                ? formatNumber(expenseValue.toFixed(2))
                                : formatNumber(
                                  calculateExpense(
                                    expenseValue,
                                    gIdx
                                  ).toFixed(2)
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
                  {/* Advance Expenses of type "indirect" */}
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

                    {/* ✅ Display the calculated `totalIndirectExpensesArray` (page aligned) */}
                    {labels.map((_, localIdx) => {
                      const gIdx = globalIndex(localIdx);
                      if (shouldSkipCol(gIdx)) return null;
                      const totalValue =
                        totalIndirectExpensesArray?.[gIdx] ?? 0;
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
                </View>

                {/* Net Profit Before Tax Calculation */}
                <View style={[styles.tableRow, styles.totalRow]}>
                  <Text
                    style={[
                      stylesCOP.serialNoCellDetail,
                      {
                        // ✅ Ensure using the registered font
                        fontWeight: "bold", // ✅ Apply bold
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
                      // { },
                    ]}
                  >
                    Net Profit Before Tax
                  </Text>

                  {/* ✅ Display Precomputed NPBT Values (page aligned) */}
                  {labels.map((_, localIdx) => {
                    const gIdx = globalIndex(localIdx);
                    if (shouldSkipCol(gIdx)) return null;
                    const npbt = netProfitBeforeTax?.[gIdx] ?? 0;
                    return (
                      <Text
                        key={`netProfitBeforeTax-${gIdx}`}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          stylesCOP.boldText,
                          styleExpenses.fontSmall,
                          {
                            borderWidth: "1.2px",

                            fontWeight: "bold",
                            color: "#000",
                            borderLeftWidth: "0px",
                            borderTop: 0,
                            borderBottom: 0,
                          },
                        ]}
                      >
                        {formatNumber(npbt)}
                      </Text>
                    );
                  })}
                </View>
                {/* Income Tax @  % */}
                <View style={[styles.tableRow, styles.totalRow]}>
                  <Text
                    style={[
                      stylesCOP.serialNoCellDetail,
                      {
                        // ✅ Ensure using the registered font
                        fontWeight: "bold", // ✅ Apply bold
                      },
                    ]}
                  >
                    Less
                  </Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                      // { },
                    ]}
                  >
                    Income Tax @ {formData.ProjectReportSetting.incomeTax} %
                  </Text>

                  {/* ✅ Display Precomputed Income Tax Values (page aligned) */}
                  {labels.map((_, localIdx) => {
                    const gIdx = globalIndex(localIdx);
                    if (shouldSkipCol(gIdx)) return null;
                    const tax = incomeTaxCalculation?.[gIdx] ?? 0;
                    return (
                      <Text
                        key={`incomeTax-${gIdx}`}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          // stylesCOP.boldText,
                          styleExpenses.fontSmall,
                          { borderBottomWidth: "0px", borderTopWidth: 0 },
                        ]}
                      >
                        {formatNumber(tax)}
                      </Text>
                    );
                  })}
                </View>
                {/* Net Profit After Tax Calculation  */}
                <View style={[styles.tableRow, styles.totalRow]}>
                  <Text
                    style={[
                      stylesCOP.serialNoCellDetail,
                      {
                        // ✅ Ensure using the registered font
                        // ✅ Apply bold
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
                        // ✅ Ensure using the registered font
                        fontWeight: "bold", // ✅ Apply bold
                      },
                    ]}
                  >
                    Net Profit After Tax
                  </Text>
                  {/*  Display Precomputed Net Profit After Tax (NPAT) Values */}
                  {labels.map((_, localIdx) => {
                    const gIdx = globalIndex(localIdx);
                    if (shouldSkipCol(gIdx)) return null;
                    const tax = netProfitAfterTax?.[gIdx] ?? 0;
                    return (
                      <Text
                        key={`netProfitAfterTax-${gIdx}`}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          stylesCOP.boldText,
                          styleExpenses.fontSmall,
                          {
                            borderWidth: "1.2px",

                            fontWeight: "bold",
                            color: "#000",
                            borderLeftWidth: "0px",
                          },
                        ]}
                      >
                        {formatNumber(tax)}
                      </Text>
                    );
                  })}
                </View>
                {/* Withdrawals during the year  */}

                {Array.from({
                  length: hideFirstYear ? projectionYears - 1 : projectionYears,
                }).every((_, index) => {
                  const adjustedIndex = hideFirstYear ? index + 1 : index;
                  return !Number(
                    formData.MoreDetails?.Withdrawals?.[adjustedIndex]
                  );
                }) ? null : (
                  <View style={styles.tableRow}>
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
                      {/* Withdrawals during the year */}
                      {renderWithdrawalLabel()} during the year
                    </Text>

                    {labels.map((_, localIdx) => {
                      const gIdx = globalIndex(localIdx);
                      if (shouldSkipCol(gIdx)) return null;
                      const value = formData.MoreDetails?.Withdrawals?.[gIdx];
                      return (
                        <Text
                          key={gIdx}
                          style={[
                            stylesCOP.particularsCellsDetail,
                            styleExpenses.fontSmall,
                          ]}
                        >
                          {formatNumber(value || "-")}
                        </Text>
                      );
                    })}
                  </View>
                )}

                {/* Balance Trf. To Balance Sheet */}
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
                    Balance Trf. To Balance Sheet
                  </Text>

                  {/* Display Precomputed Balance Transferred Values with Rounding */}
                  {labels.map((_, localIdx) => {
                    const gIdx = globalIndex(localIdx);
                    if (shouldSkipCol(gIdx)) return null;
                    const amount = balanceTransferred?.[gIdx] ?? 0;
                    const roundedValue = amount;

                    return (
                      <Text
                        key={`balanceTransferred-${gIdx}`}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                        ]}
                      >
                        {formatNumber(roundedValue)}
                      </Text>
                    );
                  })}
                </View>
                {/* Cumulative Balance Trf. To Balance Sheet */}
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
                    Cumulative Balance Trf. To Balance Sheet
                  </Text>

                  {labels.map((_, localIdx) => {
                    const gIdx = globalIndex(localIdx);
                    if (shouldSkipCol(gIdx)) return null;
                    const amount = cumulativeBalanceTransferred?.[gIdx] ?? 0;
                    // Convert negative values to 0 and round appropriately
                    const adjustedAmount = Math.max(amount, 0);

                    const roundedValue = adjustedAmount;

                    return (
                      <Text
                        key={`cumulativeBalance-${gIdx}`}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                        ]}
                      >
                        {formatNumber(roundedValue)}
                      </Text>
                    );
                  })}
                </View>

                {/* ✅ Cash Profit (NPAT + Dep.) */}
                <View style={[styles.tableRow, styles.totalRow]}>
                  <Text
                    style={[
                      stylesCOP.serialNoCellDetail,
                      styleExpenses.sno,
                      styleExpenses.bordernone,
                      {
                        paddingVertical: "10px",
                      },
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
                    Cash Profit (NPAT + Dep.)
                  </Text>

                  {labels.map((_, localIdx) => {
                    const gIdx = globalIndex(localIdx);
                    if (shouldSkipCol(gIdx)) return null;
                    const npat = netProfitAfterTax?.[gIdx] ?? 0;
                    const depreciation = totalDepreciationPerYear?.[gIdx] || 0;

                    // ✅ Correctly Compute Cash Profit
                    const cashProfit = npat + depreciation;

                    // ✅ Round values correctly
                    const roundedValue = cashProfit;
                    return (
                      <Text
                        key={`cashProfit-${gIdx}`}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                          { paddingVertical: "10px" },
                        ]}
                      >
                        {formatNumber(roundedValue)}
                      </Text>
                    );
                  })}
                </View>
              </View>
            </View>

            <View>
              {formData?.ProjectReportSetting?.CAName?.value ? (
                <Text
                  style={[
                    {
                      fontSize: "8px",
                      paddingRight: "4px",
                      paddingLeft: "4px",
                      textAlign: "justify",
                    },
                  ]}
                >
                  Guidance and assistance have been provided for the preparation
                  of these financial statements on the specific request of the
                  promoter for the purpose of availing finance for the business.
                  These financial statements are based on realistic market
                  assumptions, proposed estimates issued by an approved valuer,
                  details provided by the promoter, and rates prevailing in the
                  market. Based on the examination of the evidence supporting
                  the assumptions, nothing has come to attention that causes any
                  belief that the assumptions do not provide a reasonable basis
                  for the forecast. These financials do not vouch for the
                  accuracy of the same, as actual results are likely to be
                  different from the forecast since anticipated events might not
                  occur as expected, and the variation might be material.
                </Text>
              ) : null}
            </View>

            <View
              style={[
                {
                  display: "flex",
                  flexDirection: "row", // ✅ Change to row
                  justifyContent: "space-between", // ✅ Align items left and right
                  alignItems: "center",
                  marginTop: 60,
                },
              ]}
            >
              <View
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  paddingTop: 100,
                }}
              >
                {/* ✅ CA Name (Conditional Display) */}
                {formData?.ProjectReportSetting?.CAName?.value ? (
                  <Text
                    style={[
                      styles.caName,
                      { fontSize: "10px", fontWeight: "bold" },
                    ]}
                  >
                    CA {formData?.ProjectReportSetting?.CAName?.value}
                  </Text>
                ) : null}

                {/* ✅ Membership Number (Conditional Display) */}
                {formData?.ProjectReportSetting?.MembershipNumber?.value ? (
                  <Text style={[styles.membershipNumber, { fontSize: "10px" }]}>
                    M. No.:{" "}
                    {formData?.ProjectReportSetting?.MembershipNumber?.value}
                  </Text>
                ) : null}

                {/* ✅ UDIN Number (Conditional Display) */}
                {formData?.ProjectReportSetting?.UDINNumber?.value ? (
                  <Text style={[styles.udinNumber, { fontSize: "10px" }]}>
                    UDIN: {formData?.ProjectReportSetting?.UDINNumber?.value}
                  </Text>
                ) : null}

                {/* ✅ Mobile Number (Conditional Display) */}
                {formData?.ProjectReportSetting?.MobileNumber?.value ? (
                  <Text style={[styles.mobileNumber, { fontSize: "10px" }]}>
                    Mob. No.:{" "}
                    {formData?.ProjectReportSetting?.MobileNumber?.value}
                  </Text>
                ) : null}
              </View>

              <PDFFooter />
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
      orientation={orientation}
      style={styles.page}
      wrap={false}
      break
    >
      <PDFHeader />

      <View style={[styleExpenses.paddingx, { paddingBottom: "30px" }]}>


        <View>
          <View style={stylesCOP.heading}>
            <Text>Projected Profitability Statement</Text>
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

            {/* Blank Row  */}
            <View
              style={[
                stylesMOF.row,
                styles.tableRow,
                styles.Total,
                {
                  border: 0,
                },
              ]}
            >
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  styleExpenses.sno,
                  styleExpenses.bordernone,
                  styles.Total,
                ]}
              ></Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                  styles.Total,
                  {},
                ]}
              ></Text>

              {/* ✅ Display revenue values based on projectionYears */}
              {Array.from({ length: projectionYears }).map((_, yearIndex) =>
                !hideFirstYear || yearIndex !== 0 ? (
                  <Text
                    key={yearIndex}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                      { paddingVertical: "5px" },
                    ]}
                  ></Text>
                ) : null
              )}
            </View>

            {/* ✅ Display Total Revenue Receipt Row */}
            <View
              style={[
                stylesMOF.row,
                styles.tableRow,
                styles.Total,
                {
                  border: 0,
                },
              ]}
            >
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  styleExpenses.sno,
                  styleExpenses.bordernone,
                  styles.Total,
                ]}
              >
                A
              </Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                  styles.Total,
                  {},
                ]}
              >
                Total Revenue Receipt
              </Text>

              {/* ✅ Display revenue values based on projectionYears */}
              {Array.from({ length: projectionYears }).map((_, yearIndex) =>
                !hideFirstYear || yearIndex !== 0 ? (
                  <Text
                    key={yearIndex}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      stylesCOP.boldText,
                      styleExpenses.fontSmall,
                      styles.Total,
                      { borderLeftWidth: "0px" },
                    ]}
                  >
                    {formatNumber(totalRevenueReceipts?.[yearIndex] || 0)}
                  </Text>
                ) : null
              )}
            </View>

            {/* Closing Stock / Inventory */}
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  styleExpenses.sno,
                  styleExpenses.bordernone,
                  styles.Total,
                  { paddingVertical: "10px" },
                ]}
              >
                B
              </Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                  { paddingVertical: "10px" },
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
                        { paddingVertical: "10px" },
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
                  const isPercentage = String(expense.value)
                    .trim()
                    .endsWith("%");
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

            {/* Blank Row  */}
            <View
              style={[
                stylesMOF.row,
                styles.tableRow,
                styles.Total,
                {
                  border: 0,
                },
              ]}
            >
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  styleExpenses.sno,
                  styleExpenses.bordernone,
                  styles.Total,
                ]}
              ></Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                  styles.Total,
                  {},
                ]}
              ></Text>

              {/* ✅ Display revenue values based on projectionYears */}
              {Array.from({ length: projectionYears }).map((_, yearIndex) =>
                !hideFirstYear || yearIndex !== 0 ? (
                  <Text
                    key={yearIndex}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                      { paddingVertical: "5px" },
                    ]}
                  ></Text>
                ) : null
              )}
            </View>

            {/* Gross Profit Calculation */}
            <View style={[stylesMOF.row, styles.tableRow]}>
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  styleExpenses.sno,
                  styleExpenses.bordernone,
                  {},
                ]}
              >
                D
              </Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                  {},
                ]}
              >
                Gross Profit
              </Text>

              {/* ✅ Display Precomputed Gross Profit Values */}
              {grossProfitValues.map(
                (grossProfit, yearIndex) =>
                  (!hideFirstYear || yearIndex !== 0) && (
                    <Text
                      key={`grossProfit-${yearIndex}`}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        stylesCOP.boldText,
                        styleExpenses.fontSmall,
                        {
                          borderWidth: "1.2px",
                          borderLeftWidth: "0px",

                          //
                        },
                      ]}
                    >
                      {formatNumber(grossProfit)}
                    </Text>
                  )
              )}
            </View>

            {/* indirect expense */}
            <View>
              <View style={[styles.tableRow, styles.totalRow]}>
                <Text
                  style={[
                    stylesCOP.serialNoCellDetail,
                    styles.Total,
                    { paddingVertical: "10px" },
                  ]}
                >
                  E
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
                  Less:Indirect Expenses
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
                        {/* You can add content here if needed */}
                      </Text>
                    )
                )}
              </View>
              {/* Interest On Term Loan */}
              {!isInterestOnTermLoanZero && (
                <View style={[styles.tableRow, styles.totalRow]}>
                  {/* Serial Number */}
                  <Text style={stylesCOP.serialNoCellDetail}>1</Text>

                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                    ]}
                  >
                    {renderIOTLLabel()}
                    {/* Interest On Term Loan */}
                  </Text>

                  {/* Get total projection years */}
                  {Array.from({
                    length:
                      formData?.ProjectReportSetting?.ProjectionYears || 0, // Ensure ProjectionYears is defined
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
                    length: hideFirstYear
                      ? projectionYears - 1
                      : projectionYears,
                  }).every((_, yearIndex) => {
                    const adjustedYearIndex = hideFirstYear
                      ? yearIndex + 1
                      : yearIndex;

                    // Determine actual value
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
                            (receivedtotalRevenueReceipts?.[
                              adjustedYearIndex
                            ] || 0);
                          expenseValue =
                            baseValue + ClosingStock - OpeningStock;
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
              {/* Advance Expenses of type "indirect" */}
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
                            row.values[
                            financialYearLabels[adjustedYearIndex]
                            ]) ||
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
            </View>

            {/* Net Profit Before Tax Calculation */}
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  {
                    // ✅ Ensure using the registered font
                    fontWeight: "bold", // ✅ Apply bold
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
                  // { },
                ]}
              >
                Net Profit Before Tax
              </Text>

              {/* ✅ Display Precomputed NPBT Values */}
              {netProfitBeforeTax.map(
                (npbt, yearIndex) =>
                  (!hideFirstYear || yearIndex !== 0) && (
                    <Text
                      key={`netProfitBeforeTax-${yearIndex}`}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        stylesCOP.boldText,
                        styleExpenses.fontSmall,
                        {
                          borderWidth: "1.2px",

                          fontWeight: "bold",
                          color: "#000",
                          borderLeftWidth: "0px",
                          borderTop: 0,
                          borderBottom: 0,
                        },
                      ]}
                    >
                      {formatNumber(npbt)}
                    </Text>
                  )
              )}
            </View>
            {/* Income Tax @  % */}
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  {
                    // ✅ Ensure using the registered font
                    fontWeight: "bold", // ✅ Apply bold
                  },
                ]}
              >
                Less
              </Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                  // { },
                ]}
              >
                Income Tax @ {formData.ProjectReportSetting.incomeTax} %
              </Text>

              {/* ✅ Display Precomputed Income Tax Values */}
              {incomeTaxCalculation.map(
                (tax, yearIndex) =>
                  (!hideFirstYear || yearIndex !== 0) && (
                    <Text
                      key={`incomeTax-${yearIndex}`}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        // stylesCOP.boldText,
                        styleExpenses.fontSmall,
                        { borderBottomWidth: "0px", borderTopWidth: 0 },
                      ]}
                    >
                      {formatNumber(tax)}
                    </Text>
                  )
              )}
            </View>
            {/* Net Profit After Tax Calculation  */}
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  {
                    // ✅ Ensure using the registered font
                    // ✅ Apply bold
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
                    // ✅ Ensure using the registered font
                    fontWeight: "bold", // ✅ Apply bold
                  },
                ]}
              >
                Net Profit After Tax
              </Text>
              {/*  Display Precomputed Net Profit After Tax (NPAT) Values */}
              {netProfitAfterTax.map(
                (tax, yearIndex) =>
                  (!hideFirstYear || yearIndex !== 0) && (
                    <Text
                      key={`netProfitAfterTax-${yearIndex}`}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        stylesCOP.boldText,
                        styleExpenses.fontSmall,
                        {
                          borderWidth: "1.2px",

                          fontWeight: "bold",
                          color: "#000",
                          borderLeftWidth: "0px",
                        },
                      ]}
                    >
                      {formatNumber(tax)}
                    </Text>
                  )
              )}
            </View>
            {/* Withdrawals during the year  */}

            {Array.from({
              length: hideFirstYear ? projectionYears - 1 : projectionYears,
            }).every((_, index) => {
              const adjustedIndex = hideFirstYear ? index + 1 : index;
              return !Number(
                formData.MoreDetails?.Withdrawals?.[adjustedIndex]
              );
            }) ? null : (
              <View style={styles.tableRow}>
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
                  {/* Withdrawals during the year */}
                  {renderWithdrawalLabel()} during the year
                </Text>

                {Array.from({
                  length: hideFirstYear ? projectionYears - 1 : projectionYears,
                }).map((_, index) => {
                  const adjustedIndex = hideFirstYear ? index + 1 : index;
                  const value =
                    formData.MoreDetails?.Withdrawals?.[adjustedIndex];
                  return (
                    <Text
                      key={index}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                      ]}
                    >
                      {formatNumber(value || "-")}
                    </Text>
                  );
                })}
              </View>
            )}

            {/* Balance Trf. To Balance Sheet */}
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
                Balance Trf. To Balance Sheet
              </Text>

              {/* Display Precomputed Balance Transferred Values with Rounding */}
              {balanceTransferred.map((amount, yearIndex) => {
                if (hideFirstYear && yearIndex === 0) return null;
                const roundedValue = amount;

                return (
                  <Text
                    key={`balanceTransferred-${yearIndex}`}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                    ]}
                  >
                    {formatNumber(roundedValue)}
                  </Text>
                );
              })}
            </View>
            {/* Cumulative Balance Trf. To Balance Sheet */}
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
                Cumulative Balance Trf. To Balance Sheet
              </Text>

              {cumulativeBalanceTransferred.map((amount, yearIndex) => {
                if (hideFirstYear && yearIndex === 0) return null;
                // Convert negative values to 0 and round appropriately
                const adjustedAmount = Math.max(amount, 0);

                const roundedValue = adjustedAmount;

                return (
                  <Text
                    key={`cumulativeBalance-${yearIndex}`}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                    ]}
                  >
                    {formatNumber(roundedValue)}
                  </Text>
                );
              })}
            </View>

            {/* ✅ Cash Profit (NPAT + Dep.) */}
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  styleExpenses.sno,
                  styleExpenses.bordernone,
                  {
                    paddingVertical: "10px",
                  },
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
                Cash Profit (NPAT + Dep.)
              </Text>

              {netProfitAfterTax.map((npat, yearIndex) => {
                if (hideFirstYear && yearIndex === 0) return null;
                const depreciation = totalDepreciationPerYear[yearIndex] || 0;

                // ✅ Correctly Compute Cash Profit
                const cashProfit = npat + depreciation;

                // ✅ Round values correctly
                const roundedValue = cashProfit;
                return (
                  <Text
                    key={`cashProfit-${yearIndex}`}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                      { paddingVertical: "10px" },
                    ]}
                  >
                    {formatNumber(roundedValue)}
                  </Text>
                );
              })}
            </View>
          </View>
        </View>

        <View>
          {formData?.ProjectReportSetting?.CAName?.value ? (
            <Text
              style={[
                {
                  fontSize: "8px",
                  paddingRight: "4px",
                  paddingLeft: "4px",
                  textAlign: "justify",
                },
              ]}
            >
              Guidance and assistance have been provided for the preparation of
              these financial statements on the specific request of the promoter
              for the purpose of availing finance for the business. These
              financial statements are based on realistic market assumptions,
              proposed estimates issued by an approved valuer, details provided
              by the promoter, and rates prevailing in the market. Based on the
              examination of the evidence supporting the assumptions, nothing
              has come to attention that causes any belief that the assumptions
              do not provide a reasonable basis for the forecast. These
              financials do not vouch for the accuracy of the same, as actual
              results are likely to be different from the forecast since
              anticipated events might not occur as expected, and the variation
              might be material.
            </Text>
          ) : null}
        </View>

        <View
          style={[
            {
              display: "flex",
              flexDirection: "row", // ✅ Change to row
              justifyContent: "space-between", // ✅ Align items left and right
              alignItems: "center",
              marginTop: 60,
            },
          ]}
        >
          <View
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              paddingTop: 100,
            }}
          >
            {/* ✅ CA Name (Conditional Display) */}
            {formData?.ProjectReportSetting?.CAName?.value ? (
              <Text
                style={[
                  styles.caName,
                  { fontSize: "10px", fontWeight: "bold" },
                ]}
              >
                CA {formData?.ProjectReportSetting?.CAName?.value}
              </Text>
            ) : null}

            {/* ✅ Membership Number (Conditional Display) */}
            {formData?.ProjectReportSetting?.MembershipNumber?.value ? (
              <Text style={[styles.membershipNumber, { fontSize: "10px" }]}>
                M. No.:{" "}
                {formData?.ProjectReportSetting?.MembershipNumber?.value}
              </Text>
            ) : null}

            {/* ✅ UDIN Number (Conditional Display) */}
            {formData?.ProjectReportSetting?.UDINNumber?.value ? (
              <Text style={[styles.udinNumber, { fontSize: "10px" }]}>
                UDIN: {formData?.ProjectReportSetting?.UDINNumber?.value}
              </Text>
            ) : null}

            {/* ✅ Mobile Number (Conditional Display) */}
            {formData?.ProjectReportSetting?.MobileNumber?.value ? (
              <Text style={[styles.mobileNumber, { fontSize: "10px" }]}>
                Mob. No.: {formData?.ProjectReportSetting?.MobileNumber?.value}
              </Text>
            ) : null}
          </View>

          <PDFFooter />
        </View>
      </View>
    </Page>
  );
};

export default React.memo(ProjectedProfitability);
