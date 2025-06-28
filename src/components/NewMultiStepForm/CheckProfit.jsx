import React, { useEffect, useMemo, useState } from "react";
import useStore from "./useStore";
import { useNavigate } from "react-router-dom";
// Add this import at the top of your file
import { usePDF } from 'react-to-pdf';

const CheckProfit = () => {
  const computedDataToProfit = useStore((state) => state.computedDataToProfit);
  const [storedData, setStoredData] = useState(null);

  const [formData, setFormData] = useState(() => {
    return JSON.parse(localStorage.getItem("formData")) || {};
  });
  // const [formData , setFormData] = useState(null)
  const [profitabilityData, setProfitabilityData] = useState({
    totalDirectExpensesArray: [],
    totalIndirectExpensesArray: [],
  });

  const { toPDF, targetRef } = usePDF({ filename: 'profit-statements.pdf' });
  const navigate = useNavigate();

  const handleBack = () => {
    const lastStep = parseInt(localStorage.getItem("lastStep")) || 8; // ✅ Parse and set fallback
    console.log(`🔄 Navigating back to step: ${lastStep}`);
    navigate(`/MultistepForm?step=${lastStep}`);
  };

  useEffect(() => {
    try {
      const retrievedData = localStorage.getItem("storedGeneratedPdfData");
      if (retrievedData) {
        setStoredData(JSON.parse(retrievedData)); // Parse JSON
      }
    } catch (error) {
      console.error("Error retrieving stored data:", error);
    }
  }, []);

  useEffect(() => {
    const storedData = localStorage.getItem("storedProfitabilityData");
    if (storedData) {
      setProfitabilityData(JSON.parse(storedData));
    }
  }, []);

  console.log("generated PDf DAta", storedData);

  const storedProfitabilityData = JSON.parse(
    localStorage.getItem("storedProfitabilityData")
  );

  console.log("Profitability Data", storedProfitabilityData);

  console.log("formData", formData);

  const formatNumber = (value) => {
    const formatType = formData?.ProjectReportSetting?.Format || "1"; // Default to Indian Format
    if (value === undefined || value === null || isNaN(value)) return "0.00"; // ✅ Handle invalid values with 2 decimals

    switch (formatType) {
      case "1": // Indian Format (1,23,456.00)
        return new Intl.NumberFormat("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(value);

      case "2": // USD Format (1,123,456.00)
        return new Intl.NumberFormat("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(value);

      case "3": // Generic Indian Format (1,23,456.00)
        return new Intl.NumberFormat("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(value);

      default: // Default to Indian Format with 2 decimal places
        return new Intl.NumberFormat("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(value);
    }
  };

  const generateFinancialYearLabels = useMemo(
    () => (startingFY, totalYears) => {
      const yearLabels = [];
      for (let i = 0; i < totalYears; i++) {
        const fromYear = startingFY + i;
        const toYear = (fromYear + 1) % 100; // Only last two digits for the second year
        yearLabels.push(`${fromYear}-${toYear < 10 ? "0" + toYear : toYear}`);
      }
      return yearLabels;
    },
    []
  );

  const financialYear =
    parseInt(formData?.ProjectReportSetting?.FinancialYear) || 2025; // Use the provided year
  const projectionYears =
    parseInt(formData?.ProjectReportSetting?.ProjectionYears) || 0;

  const financialYearLabels = generateFinancialYearLabels(
    financialYear,
    projectionYears
  );

  // const adjustedRevenueValues = Array.from({
  //   length: parseInt(formData?.ProjectReportSetting?.ProjectionYears) || 0,
  // }).map((_, yearIndex) => {
  //   const totalRevenue = storedData?.totalRevenueReceipts?.[yearIndex] ?? 0; // Ensure safe access
  //   const ClosingStock = formData?.MoreDetails?.ClosingStock?.[yearIndex] ?? 0;
  //   const OpeningStock = formData?.MoreDetails?.OpeningStock?.[yearIndex] ?? 0;

  //   return totalRevenue + ClosingStock - OpeningStock;
  // });

  const adjustedRevenueValues = Array.from({
    length: parseInt(formData?.ProjectReportSetting?.ProjectionYears) || 0,
  }).map((_, yearIndex) => {
    const totalRevenue = storedData?.totalRevenueReceipts?.[yearIndex] ?? 0;
    const ClosingStock = formData?.MoreDetails?.ClosingStock?.[yearIndex] || 0;
    const OpeningStock = formData?.MoreDetails?.OpeningStock?.[yearIndex] || 0;

    return totalRevenue + Number(ClosingStock) - Number(OpeningStock); // ✅ Final computation
  });

  const activeRowIndex = 0; // Define it or fetch dynamically if needed
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

  const fringeCalculation = useMemo(
    () => storedData?.totalAnnualWages * 0.05,
    [storedData?.totalAnnualWages]
  );

  // ✅ Compute Total Wages including Fringe Benefits
  const fringAndAnnualCalculation = useMemo(
    () => storedData?.totalAnnualWages + fringeCalculation,
    [storedData?.totalAnnualWages]
  );

  const { Expenses = {} } = formData;
  const { normalExpense = [], directExpense = [] } = Expenses;

  const totalDirectExpensesArray = Array.from({
    length: parseInt(formData.ProjectReportSetting.ProjectionYears) || 0,
  }).map((_, yearIndex) => {
    const totalDirectExpenses = directExpense
      .filter((expense) => expense.type === "direct")
      .reduce((sum, expense) => {
        const isRawMaterial =
          expense.name.trim() === "Raw Material Expenses / Purchases";
        const isPercentage = String(expense.value).trim().endsWith("%");

        let expenseValue = 0;

        const ClosingStock =
          formData?.MoreDetails?.ClosingStock?.[yearIndex] || 0;
        const OpeningStock =
          formData?.MoreDetails?.OpeningStock?.[yearIndex] || 0;

        if (isRawMaterial && isPercentage) {
          const baseValue =
            (parseFloat(expense.value) / 100) *
            (storedData?.totalRevenueReceipts?.[yearIndex] || 0);
          expenseValue = baseValue + ClosingStock - OpeningStock;
        } else {
          // ✅ Use annual total directly
          expenseValue = Number(expense.total) || 0;
        }

        return (
          sum +
          (isRawMaterial && isPercentage
            ? expenseValue
            : calculateExpense(expenseValue, yearIndex))
        );
      }, 0);

    const initialSalaryWages = Number(fringAndAnnualCalculation) || 0;
    const totalSalaryWages = calculateExpense(initialSalaryWages, yearIndex);

    return totalDirectExpenses + totalSalaryWages;
  });

  // ✅ Step 2: Compute Gross Profit Values for Each Year After `totalDirectExpenses` is Defined
  const grossProfitValues = adjustedRevenueValues.map(
    (adjustedRevenue, yearIndex) => {
      const totalDirectExpenses = totalDirectExpensesArray[yearIndex] || 0; // Ensure the expenses for the specific year are used
      return adjustedRevenue - totalDirectExpenses; // Subtract expenses from adjusted revenue to get gross profit
    }
  );

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
  // const calculateInterestOnWorkingCapital = useMemo(() => {
  //   return (interestAmount, yearIndex) => {
  //     const principal =
  //       Number(formData.MeansOfFinance?.workingCapital?.termLoan) || 0;
  //     const rate = Number(formData.ProjectReportSetting?.interestOnWC) || 0;
  //     const annualInterestAmount = (principal * rate) / 100;
  //     const firstRepaymentYearIndex = monthsPerYear.findIndex(
  //       (months) => months > 0
  //     );
  //     const repaymentStartYear = Math.floor(moratoriumPeriodMonths / 12);
  //     const monthsInYear = monthsPerYear[yearIndex];
  //     if (monthsInYear === 0) {
  //       return 0; // No interest during moratorium
  //     } else {
  //       if (yearIndex === repaymentStartYear) {
  //         const monthsRemainingAfterMoratorium =
  //           12 - (moratoriumPeriodMonths % 12);
  //         return (interestAmount / 12) * monthsRemainingAfterMoratorium; // Apply partial interest in first repayment year
  //       } else if (yearIndex > repaymentStartYear) {
  //         return interestAmount; // From second year onwards, apply full interest
  //       } else {
  //         return 0; // No interest during moratorium
  //       }
  //     }
  //   };
  // }, [moratoriumPeriodMonths, monthsPerYear, rateOfExpense]);

  const calculateInterestOnWorkingCapital = useMemo(() => {
    const principal =
      Number(formData.MeansOfFinance?.workingCapital?.termLoan) || 0;
    const rate = Number(formData.ProjectReportSetting?.interestOnWC) || 0;
    const annualInterestAmount = (principal * rate) / 100;

    const firstRepaymentYearIndex = monthsPerYear.findIndex(
      (months) => months > 0
    );

    return (yearIndex) => {
      const monthsInYear = monthsPerYear[yearIndex] || 0;
      let calculatedInterest = 0;
      let type = "";

      if (monthsInYear === 0) {
        type = "Moratorium";
        calculatedInterest = 0;
      } else if (
        yearIndex === firstRepaymentYearIndex &&
        (moratoriumPeriodMonths > 0 || monthsInYear < 12)
      ) {
        type = "First Repayment Year (Prorated)";
        calculatedInterest = (annualInterestAmount * monthsInYear) / 12;
      } else {
        type = "Full Year Repayment";
        calculatedInterest = annualInterestAmount;
      }

      // Only log if yearIndex is a real number (not some weird value)
      if (typeof yearIndex === "number" && !isNaN(yearIndex)) {
        // console.table([
        //   {
        //     "Year Index": yearIndex + 1,
        //     "Months in Year": monthsInYear,
        //     "Principal": principal,
        //     "Interest Rate (%)": rate,
        //     "Annual Interest Amount": annualInterestAmount,
        //     "Type": type,
        //     "Calculated Interest": calculatedInterest,
        //   },
        // ]);
      }

      return calculatedInterest;
    };
  }, [formData, moratoriumPeriodMonths, monthsPerYear]);

  const isWorkingCapitalInterestZero = Array.from({
    length: projectionYears,
  }).every((_, yearIndex) => {
    const calculatedInterest = calculateInterestOnWorkingCapital(yearIndex);
    return calculatedInterest === 0;
  });

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

  const indirectExpense = directExpense.filter(
    (expense) => expense.type === "indirect"
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

    const interestOnTermLoan =
      storedData?.yearlyInterestLiabilities[yearIndex] || 0;

    const interestExpenseOnWorkingCapital =
      calculateInterestOnWorkingCapital(yearIndex);

    const depreciationExpense =
      storedData?.computedData1?.totalDepreciationPerYear[yearIndex] || 0;

    const total =
      totalIndirectExpenses +
      interestOnTermLoan +
      interestExpenseOnWorkingCapital +
      depreciationExpense;

    // 👇 Console log in table format per year
    // console.table([
    //   {
    //     Year: yearIndex + 1,
    //     "Total Indirect Expenses": totalIndirectExpenses,
    //     "Interest on Term Loan": interestOnTermLoan,
    //     "Interest on Working Capital": interestExpenseOnWorkingCapital,
    //     Depreciation: depreciationExpense,
    //     "Year Total": total,
    //   },
    // ]);

    return total;
  });

  // ✅ Precompute Net Profit Before Tax (NPBT) for Each Year Before Rendering
  const netProfitBeforeTax = grossProfitValues.map((grossProfit, yearIndex) => {
    // Subtracting totalIndirectExpensesArray and other expenses like interest, depreciation etc.
    const totalIndirectExpenses = totalIndirectExpensesArray[yearIndex] || 0; // Ensure indirect expenses are considered
    return grossProfit - totalIndirectExpenses; // Net Profit Before Tax (NPBT)
  });

  // ✅ Precompute Income Tax Calculation for Each Year Before Rendering
  const incomeTaxCalculation = netProfitBeforeTax.map((npbt, yearIndex) => {
    return (npbt * formData.ProjectReportSetting.incomeTax) / 100;
  });

  // ✅ Precompute Net Profit After Tax (NPAT) for Each Year Before Rendering
  const netProfitAfterTax = netProfitBeforeTax.map((npat, yearIndex) => {
    return npat - incomeTaxCalculation[yearIndex]; // ✅ Correct subtraction
  });

  // Precompute Balance Transferred to Balance Sheet
  const balanceTransferred = netProfitAfterTax.map(
    (npbt, yearIndex) =>
      npbt - (formData.MoreDetails.Withdrawals?.[yearIndex] || 0)
  );

  // Log as a table for clarity:
  // console.table(
  //   balanceTransferred.map((val, i) => ({
  //     "Year Index": i + 1,
  //     "Net Profit After Tax (NPAT)": netProfitAfterTax[i],
  //     Withdrawals: formData.MoreDetails.Withdrawals?.[i] || 0,
  //     "Balance Transferred": val,
  //   }))
  // );

  // Precompute Cumulative Balance Transferred to Balance Sheet
  const cumulativeBalanceTransferred = [];
  balanceTransferred.forEach((amount, index) => {
    if (index === 0) {
      cumulativeBalanceTransferred.push(Math.max(amount, 0)); // First year, just the amount itself
    } else {
      // For subsequent years, sum of Balance Trf. and previous year's Cumulative Balance
      cumulativeBalanceTransferred.push(
        Math.max(amount + cumulativeBalanceTransferred[index - 1], 0)
      );
    }
  });

  // ✅ Compute Total Sum for Each Year
  const totalA = Array.from({
    length: formData.ProjectReportSetting.ProjectionYears || 0,
  }).map((_, yearIndex) => {
    const npat = netProfitAfterTax[yearIndex] || 0;
    const depreciation =
      storedData?.computedData1?.totalDepreciationPerYear[yearIndex] || 0;
    const interestTL = storedData?.yearlyInterestLiabilities[yearIndex] || 0;
    const interestWC = calculateInterestOnWorkingCapital(yearIndex);

    const total = npat + depreciation + interestTL + interestWC;

    // Debug table for this year
    // console.table([{
    //   "Year Index": yearIndex + 1,
    //   "Net Profit After Tax (NPAT)": npat,
    //   "Depreciation": depreciation,
    //   "Interest on Term Loan": interestTL,
    //   "Interest on Working Capital": interestWC,
    //   "Total A": total,
    // }]);

    return total;
  });

  // ✅ Compute Total (B) for Each Year
  const totalB = Array.from({
    length: formData.ProjectReportSetting.ProjectionYears || 0,
  }).map((_, yearIndex) => {
    return (
      (storedData?.yearlyInterestLiabilities[yearIndex] || 0) + // ✅ Interest on Term Loan
      calculateInterestOnWorkingCapital(yearIndex) + // ✅ Interest on Working Capital
      (storedData?.yearlyPrincipalRepayment[yearIndex] || 0) // ✅ Repayment of Term Loan
    );
  });

  // console.table(
  //   Array.from({
  //     length: formData.ProjectReportSetting.ProjectionYears || 0,
  //   }).map((_, yearIndex) => ({
  //     "Year Index": yearIndex + 1,
  //     "Interest on Term Loan":
  //       storedData?.yearlyInterestLiabilities[yearIndex] || 0,
  //     "Interest on Working Capital":
  //       calculateInterestOnWorkingCapital(yearIndex),
  //     "Principal Repayment":
  //       storedData?.yearlyPrincipalRepayment[yearIndex] || 0,
  //     "Total B":
  //       (storedData?.yearlyInterestLiabilities[yearIndex] || 0) +
  //       (calculateInterestOnWorkingCapital(yearIndex)) +
  //       (storedData?.yearlyPrincipalRepayment[yearIndex] || 0),
  //   }))
  // );

  // const DSCR = Array.from({
  //   length: formData.ProjectReportSetting.ProjectionYears || 0,
  // }).map((_, yearIndex) => {
  //   return totalB[yearIndex] !== 0 ? totalA[yearIndex] / totalB[yearIndex] : 0; // ✅ Avoid division by zero
  // });

  const DSCR = Array.from({
    length: formData.ProjectReportSetting.ProjectionYears || 0,
  }).map((_, yearIndex) => {
    return totalB[yearIndex] !== 0 ? totalA[yearIndex] / totalB[yearIndex] : 0; // ✅ Avoid division by zero
  });

  // console.table(
  //   DSCR.map((value, yearIndex) => ({
  //     "Year Index": yearIndex + 1,
  //     "Total A": totalA[yearIndex],
  //     "Total B": totalB[yearIndex],
  //     DSCR: value,
  //   }))
  // );

  const validDSCRValues = DSCR.filter(
    (value, index) => !(index === 0 && value === 0)
  );

  // ✅ Memoize averageDSCR calculation
  const averageDSCR = useMemo(() => {
    if (validDSCRValues.length === 0) return 0;
    return (
      validDSCRValues.reduce((sum, value) => sum + value, 0) /
      validDSCRValues.length
    );
  }, [JSON.stringify(validDSCRValues)]); // Deep dependency check with stringify

  // ✅ Calculate Current Ratio and store in a variable
  const currentRatio = Array.from({
    length: storedData?.assetsliabilities?.CurrentAssetsArray?.length || 0,
  }).map((_, index) => {
    const currentAssets =
      storedData?.assetsliabilities?.CurrentAssetsArray?.[index] || 0;
    const currentLiabilities =
      storedData?.assetsliabilities?.yearlycurrentLiabilities?.[index] || 0;

    // ✅ Handle division by zero and format to 2 decimal places
    return currentLiabilities === 0
      ? "-"
      : (currentAssets / currentLiabilities).toFixed(2);
  });

  // ✅ Calculate Average Current Ratio (Excluding Leading Zeros and Values ≤ 1)
  const averageCurrentRatio = (() => {
    // Filter out invalid ratios and convert valid ones to numbers
    const validRatios = currentRatio
      .filter((r) => r !== "-" && !isNaN(parseFloat(r))) // Filter out invalid values
      .map((r) => parseFloat(r)); // Convert to numeric values

    // ✅ Exclude leading values ≤ 1
    const firstValidIndex = validRatios.findIndex((value) => value > 1);
    const nonZeroRatios = validRatios.slice(firstValidIndex);

    // ✅ If there are no valid ratios left, return "-"
    if (nonZeroRatios.length === 0) {
      return "-";
    }

    // ✅ Calculate the total of valid non-zero ratios
    const total = nonZeroRatios.reduce((sum, value) => sum + value, 0);

    // ✅ Return the average rounded to 2 decimal places
    const average = (total / nonZeroRatios.length).toFixed(2);

    return average;
  })();

  //balance sheet calculations

  // If it's undefined, default to an empty array.
  const { termLoanValues = [] } = storedData?.workingCapitalvalues || {};

  // Convert string values to numbers, if needed:
  const numericTermLoanValues = termLoanValues.map((val) => Number(val) || 0);

  // Now compute your cumulative array using numericTermLoanValues
  const cumulativeLoanForPreviousYears = numericTermLoanValues.reduce(
    (acc, currentValue, index) => {
      if (index === 0) {
        acc.push(currentValue);
      } else {
        acc.push(acc[index - 1] + currentValue);
      }
      return acc;
    },
    []
  );

  // First, compute the arrays for Fixed Assets and Net Fixed Assets
  const computedFixedAssets = [];
  const computedNetFixedAssets = [];

  // For the first year, use the provided value
  computedFixedAssets[0] = storedData?.grossFixedAssetsPerYear[0] || 0;
  computedNetFixedAssets[0] =
    computedFixedAssets[0] -
    (storedData?.computedData1?.totalDepreciationPerYear[0] || 0);

  // For subsequent years, carry forward the net value as the new fixed asset value
  for (let i = 1; i < projectionYears; i++) {
    computedFixedAssets[i] = computedNetFixedAssets[i - 1];
    computedNetFixedAssets[i] =
      computedFixedAssets[i] -
      (storedData?.computedData1?.totalDepreciationPerYear[i] || 0);
  }

  // ✅ Compute Corrected Total Assets for Each Year
  let cumulativeCurrentAssets = 0; // Initialize cumulative sum for current assets

  const inventory = Array.from({
    length: formData.MoreDetails.OpeningStock.length,
  }).map((_, yearIndex) => {
    const ClosingStock = formData?.MoreDetails?.ClosingStock?.[yearIndex] || 0;
    const finalStock = ClosingStock;

    return finalStock;
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

  // const writeOffStartIndex = skipfirstyear ? 1 : 0;
  const writeOffStartIndex = 0;
  const preliminaryWriteOffSteps = preliminaryWriteOffYears;

  const preliminaryWriteOffPerYear = Array.from({
    length: projectionYears,
  }).map((_, index) => {
    const relativeYear = index - writeOffStartIndex;

    if (
      index >= writeOffStartIndex &&
      relativeYear < preliminaryWriteOffSteps
    ) {
      // Calculate decreasing value
      return yearlyWriteOffAmount * (preliminaryWriteOffSteps - relativeYear);
    }

    return 0;
  });

  // const totalAssetArray = Array.from({ length: projectionYears }).map(
  //   (_, index) => {
  //     const netFixedAssetValue = computedNetFixedAssets[index] || 0;
  //     const cashEquivalent = storedData?.closingCashBalanceArray[index] || 0;

  //     // ✅ Filter out "Inventory" and dontSendToBS before summing
  //     const currentYearAssets =
  //       formData?.MoreDetails?.currentAssets
  //         ?.filter(
  //           (asset) =>
  //             asset.particular !== "Inventory" &&
  //             !asset.dontSendToBS &&
  //             asset.years?.[index]
  //         )
  //         .reduce((sum, asset) => sum + Number(asset.years[index] || 0), 0) ||
  //       0;

  //     cumulativeCurrentAssets += currentYearAssets;

  //     const inventoryValue = inventory[index] || 0; // ✅ Add inventory here

  //     const preliminaryWriteOffcalculation =
  //       preliminaryWriteOffPerYear[index] || 0;

  //     const totalAssets =
  //       netFixedAssetValue +
  //       cashEquivalent +
  //       currentYearAssets + // <-- NOT cumulative!
  //       preliminaryWriteOffcalculation +
  //       inventoryValue;

  //     // Console table per year
  //     console.table([
  //       {
  //         "Year Index": index + 1,
  //         "Net Fixed Assets": netFixedAssetValue,
  //         "Cash & Cash Equivalents": cashEquivalent,
  //         "Current Year Assets": currentYearAssets, // only current
  //         "Cumulative Current Assets": cumulativeCurrentAssets,
  //         Inventory: inventoryValue,
  //         "Preliminary Write Off": preliminaryWriteOffcalculation,
  //         "Total Assets (Current Year Only)":
  //           netFixedAssetValue +
  //           cashEquivalent +
  //           currentYearAssets +
  //           preliminaryWriteOffcalculation +
  //           inventoryValue,
  //         "Total Assets (Buggy - Cumulative)":
  //           netFixedAssetValue +
  //           cashEquivalent +
  //           cumulativeCurrentAssets +
  //           preliminaryWriteOffcalculation +
  //           inventoryValue,
  //       },
  //     ]);

  //     return totalAssets;
  //   }
  // );


    const totalAssetArray = Array.from({ length: projectionYears }).map(
    (_, index) => {
      const netFixedAssetValue = computedNetFixedAssets[index] || 0;
      const cashEquivalent = storedData?.closingCashBalanceArray[index] || 0;

      const currentYearAssets = formData?.MoreDetails?.currentAssets
        ?.filter(
          (assets) => assets.particular !== "Inventory" && !assets.dontSendToBS
        )
        .reduce((total, assets) => total + Number(assets.years[index] || 0), 0);

      cumulativeCurrentAssets += currentYearAssets;


      const preliminaryAsset = preliminaryWriteOffPerYear[index] || 0; // ✅ NEW

      const totalAssets =
        Number(netFixedAssetValue) +
        Number(cashEquivalent) +
        Number(cumulativeCurrentAssets) +
        Number(inventory[index]) +
        Number(preliminaryAsset); // ✅ INCLUDED

      return totalAssets;
    }
  );
  const repaymentValueswithin12months = Array.from({
    length: formData.ProjectReportSetting.ProjectionYears || 0,
  }).map((_, index) => {
    let mappedIndex = index + 1; // ✅ Shift to next year

    return mappedIndex < formData.ProjectReportSetting.ProjectionYears
      ? storedData?.yearlyPrincipalRepayment[mappedIndex] || 0 // ✅ Fetch next year's value
      : 0; // ✅ Ensure last year's value is explicitly set to 0
  });

  // ✅ Initialize cumulative liabilities
  let cumulativeCurrentLiabilities = 0;
  let cumulativeAdditionalLiabilities = 0; // ✅ Initialize cumulative liabilities

  const totalLiabilitiesArray = Array.from({ length: projectionYears }).map(
    (_, index) => {
      const capital = Number(formData?.MeansOfFinance?.totalPC || 0);

      const reservesAndSurplus = Math.max(
        storedData?.receivedData?.cumulativeBalanceTransferred?.[index] || 0,
        0
      );

      const marchBalance = storedData?.marchClosingBalances[index] || 0;
      const repaymentValue = repaymentValueswithin12months?.[index] || 0;

      const termLoan = marchBalance - repaymentValue;

      // ✅ Ensure correct bankLoanPayableWithinNext12Months mapping
      const mappedIndex = index + 1; // Shift to next year's value
      let bankLoanPayableWithinNext12Months =
        mappedIndex < projectionYears
          ? storedData?.yearlyPrincipalRepayment[mappedIndex] || 0
          : 0; // ✅ Set last year's value to 0

      const workingCapitalLoan = Number(
        cumulativeLoanForPreviousYears?.[index] || 0
      );

      // ✅ Calculate current liabilities for the year and accumulate
      const currentYearLiabilities = (
        formData?.MoreDetails?.currentLiabilities ?? []
      ).reduce(
        (total, liabilities) => total + Number(liabilities.years?.[index] || 0),
        0
      );

      cumulativeAdditionalLiabilities += currentYearLiabilities; // ✅ Keep cumulative sum

      // ✅ Compute the final total liabilities for the year
      const totalForYear =
        capital +
        reservesAndSurplus +
        termLoan +
        bankLoanPayableWithinNext12Months +
        workingCapitalLoan +
        cumulativeAdditionalLiabilities;

      return totalForYear;
    }
  );

  const hideFirstYear = storedData?.totalRevenueReceipts?.[0] === 0;

  const isPreliminaryWriteOffAllZero = Array.from({
    length: projectionYears,
  }).every((_, yearIndex) => {
    const adjustedYearIndex = yearIndex; // ✅ Fix index offset
    return preliminaryWriteOffPerYear[adjustedYearIndex] === 0;
  });

  const visibleLiabilitiesCount =
    formData?.MoreDetails?.currentAssets?.filter(
      (liability) => !liability.years.every((value) => Number(value) === 0)
    )?.length || 0;
  const preliminarySerialNo = 6 + visibleLiabilitiesCount;

  return (
    <div className="p-2 w-full">
      {/* ✅ Corrected inline styles using spread operator */}
      <div className="p-20 pt-4 flex flex-col items-center w-full">
          {/* Download PDF Button */}
  
        <h2 className="text-xl font-bold mb-4">Profit Statements</h2>

        <div ref={targetRef} className="p-2 w-full">
          {/* Profit Statement Heading */}
          <div className="bg-blue-950 text-white text-center py-2 text-[11px]">
            PROJECTED PROFITABILITY STATEMENT
          </div>
          

          <table
            className="w-full  mt-3"
            style={{ borderCollapse: "collapse" }}
          >
            <thead>
              <tr className="bg-blue-950 text-white">
                <th className="border border-black px-1 py-2 w-16 text-center font-normal text-[11px]">
                  S. No.
                </th>
                <th className="border border-black px-1 py-2 text-left font-normal text-[11px]">
                  Particulars
                </th>
                {financialYearLabels
                  .map((yearLabel, yearIndex) => ({ yearLabel, yearIndex }))
                  .filter(
                    ({ yearIndex }) => !(hideFirstYear && yearIndex === 0)
                  )
                  .map(({ yearLabel, yearIndex }) => (
                    <th
                      key={yearIndex}
                      className="border border-black px-1 py-2 text-center font-normal text-[11px]"
                    >
                      {yearLabel}
                    </th>
                  ))}
              </tr>
            </thead>

            <tbody>
              {/* Revenue Receipt  */}
              <tr className="font-normal text-[11px] border-0 mt-2">
                <td className="border border-black px-1 py-2 text-center font-normal text-[11px]">
                  A
                </td>
                <td className="border border-black px-1 py-2 font-normal text-[11px] text-left">
                  Total Revenue Receipt
                </td>

                {storedData?.totalRevenueReceipts
                  ?.slice(0, projectionYears)
                  .map((value, yearIndex) => ({ value, yearIndex }))
                  .filter(
                    ({ yearIndex }) => !(hideFirstYear && yearIndex === 0)
                  )
                  .map(({ value, yearIndex }) => (
                    <td
                      key={`revenue-${yearIndex}`}
                      className="border border-black px-1 py-2 text-center font-normal text-[11px]"
                    >
                      {formatNumber(value)}
                    </td>
                  ))}
              </tr>

              {/* Closing Stock / Inventory */}
              <tr className="font-normal text-[11px] border-0 mt-2">
                <td className="border border-black px-1 py-2 text-center font-normal text-[11px]">
                  B
                </td>
                <td className="border border-black px-1 py-2 font-normal text-[11px] text-left w-1/3">
                  Add: Closing Stock / Inventory
                </td>

                {Array.from({ length: projectionYears })
                  .map((_, yearIndex) => ({
                    value: formData.MoreDetails.ClosingStock?.[yearIndex] ?? 0,
                    yearIndex,
                  }))
                  .filter(
                    ({ yearIndex }) => !(hideFirstYear && yearIndex === 0)
                  )
                  .map(({ value, yearIndex }) => (
                    <td
                      key={`ClosingStock-${yearIndex}`}
                      className="border border-black px-1 py-2 text-center font-normal text-[11px]"
                    >
                      {formatNumber(value)}
                    </td>
                  ))}
              </tr>

              {/* Opening Stock / Inventory */}
              <tr className="font-normal text-[11px] border-0 mt-2">
                <td className="border border-black px-1 py-2 text-center font-normal text-[11px]"></td>
                <td className="border border-black px-1 py-2 font-normal text-[11px] text-left w-1/3">
                  Less: Opening Stock / Inventory
                </td>

                {Array.from({ length: projectionYears })
                  .map((_, yearIndex) => ({
                    value: formData.MoreDetails.OpeningStock?.[yearIndex] ?? 0,
                    yearIndex,
                  }))
                  .filter(
                    ({ yearIndex }) => !(hideFirstYear && yearIndex === 0)
                  )
                  .map(({ value, yearIndex }) => (
                    <td
                      key={`OpeningStock-${yearIndex}`}
                      className="border border-black px-1 py-2 text-center font-normal text-[11px]"
                    >
                      {formatNumber(value)}
                    </td>
                  ))}
              </tr>

              {/* Computation of Total Revenue */}
              <tr className="font-normal text-[11px] border-0 mt-2">
                <td className="border border-black px-1 py-2 text-center font-normal text-[11px]"></td>
                <td className="border border-black px-1 py-2 font-extrabold text-left w-1/3"></td>

                {adjustedRevenueValues
                  ?.map((value, yearIndex) => ({ value, yearIndex }))
                  .filter(
                    ({ yearIndex }) => !(hideFirstYear && yearIndex === 0)
                  )
                  .map(({ value, yearIndex }) => (
                    <td
                      key={`finalValue-${yearIndex}`}
                      className="border border-black px-1 py-2 text-center font-extrabold font-roboto"
                    >
                      {formatNumber(value)}
                    </td>
                  ))}
              </tr>

              {/* direct expenses heading  */}
              <tr className="font-normal text-[11px] border-0 mt-2">
                <td className="border border-black px-1 py-2 text-center font-normal text-[11px]">
                  C
                </td>
                <td className="border border-black px-1 py-2 font-extrabold text-left w-1/3">
                  Direct Expenses
                </td>
              </tr>

              {/* Salary and Wages */}
              {storedData?.normalExpense.map((expense, index) => {
                if (index !== activeRowIndex) return null; // Only render the active row

                return (
                  <tr className="font-normal text-[11px] border-0 mt-2">
                    <td className="border border-black px-1 py-2 text-center font-normal text-[11px]">
                      1
                    </td>
                    <td className="border border-black px-1 py-2  text-left w-1/3">
                      Salary and Wages
                    </td>
                    {Array.from({ length: projectionYears })
                      .map((_, yearIndex) => ({
                        yearIndex,
                        isHidden: hideFirstYear && yearIndex === 0,
                      }))
                      .filter(({ isHidden }) => !isHidden)
                      .map(({ yearIndex }) => (
                        <td
                          key={yearIndex}
                          className="border border-black px-1 py-2 text-center font-roboto"
                        >
                          {formatNumber(
                            calculateExpense(
                              Number(fringAndAnnualCalculation) || 0,
                              yearIndex
                            )
                          )}
                        </td>
                      ))}
                  </tr>
                );
              })}

              {directExpense
                ?.filter((expense) => expense.type === "direct")
                ?.map((expense, index) => {
                  const isRawMaterial =
                    expense.name.trim() === "Raw Material Expenses / Purchases";
                  const isPercentage = String(expense.value)
                    .trim()
                    .endsWith("%");

                  // ✅ Step 1: Compute values for all years
                  const valuesPerYear = Array.from({
                    length: projectionYears,
                  }).map((_, yearIndex) => {
                    const ClosingStock =
                      Number(
                        formData?.MoreDetails?.ClosingStock?.[yearIndex]
                      ) || 0;
                    const OpeningStock =
                      Number(
                        formData?.MoreDetails?.OpeningStock?.[yearIndex]
                      ) || 0;

                    if (isRawMaterial && isPercentage) {
                      const baseValue =
                        (parseFloat(expense.value) / 100) *
                        (storedData?.totalRevenueReceipts?.[yearIndex] || 0);
                      return parseFloat(
                        (baseValue + ClosingStock - OpeningStock).toFixed(2)
                      );
                    } else {
                      const total = Number(expense.total) || 0;
                      return parseFloat(
                        calculateExpense(total, yearIndex).toFixed(2)
                      );
                    }
                  });

                  // ✅ Step 2: Filter out values if hideFirstYear is true
                  const filteredValues = valuesPerYear.filter(
                    (_, i) => !(hideFirstYear && i === 0)
                  );

                  // ✅ Step 3: Check if all visible values are 0
                  const allValuesZero = filteredValues.every(
                    (val) => val === 0
                  );

                  // ✅ Step 4: Skip rendering this row if all values are 0
                  if (allValuesZero) return null;

                  // ✅ Step 5: Render the row
                  return (
                    <tr
                      key={`directExpense-${index}`}
                      className="font-normal text-[11px] border-0 mt-2"
                    >
                      <td className="border border-black px-1 py-2 text-center font-normal text-[11px]">
                        {index + 2}
                      </td>
                      <td className="border border-black px-1 py-2 font-normal text-[11px] text-left w-1/3">
                        {expense.name}
                      </td>

                      {valuesPerYear.map((val, yearIndex) => {
                        if (hideFirstYear && yearIndex === 0) return null;

                        return (
                          <td
                            key={`directExpense-${index}-year-${yearIndex}`}
                            className="border border-black px-1 py-2 text-center font-normal text-[11px]"
                          >
                            {formatNumber(val)}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}

              {/* Direct Expenses Total as Table Row */}
              <tr className="font-normal text-[11px] border-black">
                <td className="border border-black  px-1 py-2 text-center font-normal text-[11px]"></td>
                <td className="border border-black px-1 py-2 font-normal text-left w-1/3">
                  Total
                </td>
                {/* ✅ Display Precomputed Total Direct Expenses */}
                {totalDirectExpensesArray
                  .map((grandTotal, yearIndex) => ({ grandTotal, yearIndex }))
                  .filter(
                    ({ yearIndex }) => !(hideFirstYear && yearIndex === 0)
                  )
                  .map(({ grandTotal, yearIndex }) => (
                    <td
                      key={yearIndex}
                      className="border border-black px-1 py-2 text-center font-normal text-[11px]"
                    >
                      {formatNumber(grandTotal)}
                    </td>
                  ))}
              </tr>

              {/* Gross Profit  */}
              <tr className="font-normal text-[11px] border-0 mt-2">
                <td className="border border-black px-1 py-2 text-center font-bold text-[11px]">
                  D
                </td>
                <td className="border border-black px-1 py-2 font-bold text-[11px] text-left w-1/3">
                  Gross Profit
                </td>

                {/* ✅ Display Precomputed Gross Profit Values */}
                {grossProfitValues
                  .map((grossProfit, yearIndex) => ({ grossProfit, yearIndex }))
                  .filter(
                    ({ yearIndex }) => !(hideFirstYear && yearIndex === 0)
                  )
                  .map(({ grossProfit, yearIndex }) => (
                    <td
                      key={`grossProfit-${yearIndex}`}
                      className="border border-black px-1 py-2 text-center font-bold text-[11px]"
                    >
                      {formatNumber(grossProfit)}
                    </td>
                  ))}
              </tr>

              {/* Less: Indirect Expenses Heading */}
              <tr className="font-normal text-[11px] border-0 mt-2">
                <td className="border border-black px-1 py-2 text-center font-normal text-[11px]">
                  E
                </td>
                <td className="border border-black px-1 py-2 font-extrabold text-left w-1/3">
                  Less: Indirect Expenses
                </td>
              </tr>

              {/* Interest On Term Loan */}
              <tr className="font-normal text-[11px] border-0 mt-2">
                <td className="border border-black px-1 py-2 text-center font-normal text-[11px]">
                  1
                </td>
                <td className="border border-black px-1 py-2 font-normal text-[11px] text-left w-1/3">
                  Interest On Term Loan
                </td>

                {Array.from({
                  length:
                    parseInt(formData.ProjectReportSetting.ProjectionYears) ||
                    0,
                })
                  .map((_, yearIndex) => ({
                    value:
                      storedData?.yearlyInterestLiabilities?.[yearIndex] ?? 0,
                    yearIndex,
                  }))
                  .filter(
                    ({ yearIndex }) => !(hideFirstYear && yearIndex === 0)
                  )
                  .map(({ value, yearIndex }) => (
                    <td
                      key={`interestLoan-${yearIndex}`}
                      className="border border-black px-1 py-2 text-center font-normal text-[11px]"
                    >
                      {formatNumber(value)}
                    </td>
                  ))}
              </tr>

              {/* Interest On Working Capital */}
              {!isWorkingCapitalInterestZero && (
                <tr className="font-normal text-[11px] border-0 mt-2">
                  <td className="border border-black px-1 py-2 text-center font-normal text-[11px]">
                    2
                  </td>
                  <td className="border border-black px-1 py-2 font-normal text-[11px] text-left w-1/3">
                    Interest On Working Capital
                  </td>

                  {Array.from({
                    length:
                      parseInt(formData.ProjectReportSetting.ProjectionYears) ||
                      0,
                  })
                    .map((_, yearIndex) => {
                      const value =
                        calculateInterestOnWorkingCapital(yearIndex);

                      return { value, yearIndex };
                    })
                    .filter(
                      ({ yearIndex }) => !(hideFirstYear && yearIndex === 0)
                    )
                    .map(({ value, yearIndex }) => (
                      <td
                        key={`workingCapitalInterest-${yearIndex}`}
                        className="border border-black px-1 py-2 text-center font-normal text-[11px]"
                      >
                        {formatNumber(value)}
                      </td>
                    ))}
                </tr>
              )}

              {/* Depreciation */}
              <tr className="font-normal text-[11px] border-0 mt-2">
                <td className="border border-black px-1 py-2 text-center font-normal text-[11px]">
                  3
                </td>
                <td className="border border-black px-1 py-2 font-normal text-[11px] text-left w-1/3">
                  Depreciation
                </td>

                {storedData?.computedData1?.totalDepreciationPerYear
                  ?.map((value, yearIndex) => ({ value, yearIndex }))
                  .filter(
                    ({ yearIndex }) => !(hideFirstYear && yearIndex === 0)
                  )
                  .map(({ value, yearIndex }) => (
                    <td
                      key={`depreciation-${yearIndex}`}
                      className="border border-black px-1 py-2 text-center font-normal text-[11px]"
                    >
                      {formatNumber(value)}
                    </td>
                  ))}
              </tr>

              {/* Indirect Expenses Rows */}
              {directExpense
                .filter((expense) => expense.type === "indirect")
                .map((expense, index) => {
                  const baseValue = Number(expense.total) || 0; // ✅ Use total

                  // ✅ Step 1: Precompute all values with increment
                  const yearlyValues = Array.from({
                    length:
                      parseInt(formData.ProjectReportSetting.ProjectionYears) ||
                      0,
                  }).map((_, yearIndex) =>
                    calculateIndirectExpense(baseValue, yearIndex)
                  );

                  // ✅ Step 2: Filter values based on hideFirstYear
                  const filteredValues = yearlyValues.filter(
                    (_, yearIndex) => !(hideFirstYear && yearIndex === 0)
                  );

                  // ✅ Step 3: Check if all visible values are 0
                  const allValuesZero = filteredValues.every(
                    (val) => val === 0
                  );

                  // ✅ Step 4: Skip rendering this row if all values are zero
                  if (allValuesZero) return null;

                  // ✅ Step 5: Render row
                  return (
                    <tr
                      key={`indirect-expense-${index}`}
                      className="font-normal text-[11px] border-0 mt-2"
                    >
                      <td className="border border-black px-1 py-2 text-center font-normal text-[11px]">
                        {index + 4}
                      </td>
                      <td className="border border-black px-1 py-2 font-normal text-[11px] text-left w-1/3">
                        {expense.name}
                      </td>

                      {yearlyValues.map((val, yearIndex) => {
                        if (hideFirstYear && yearIndex === 0) return null;

                        return (
                          <td
                            key={`indirectExpense-${index}-${yearIndex}`}
                            className="border border-black px-1 py-2 text-center font-normal text-[11px]"
                          >
                            {formatNumber(val.toFixed(2))}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}

              {/* ✅ Total Indirect Expenses Row */}
              <tr className="font-normal text-[11px] border-black">
                {/* Empty Serial Number Column */}
                <td className="border border-black px-1 py-2 text-center font-normal text-[11px]"></td>

                {/* "Total" Label */}
                <td className="border border-black px-1 py-2 font-normal text-left w-1/3">
                  Total
                </td>

                {/* ✅ Display the filtered totalIndirectExpensesArray */}
                {totalIndirectExpensesArray
                  .map((totalValue, yearIndex) => ({ totalValue, yearIndex }))
                  .filter(
                    ({ yearIndex }) => !(hideFirstYear && yearIndex === 0)
                  )
                  .map(({ totalValue, yearIndex }) => (
                    <td
                      key={`totalIndirectExpenses-${yearIndex}`}
                      className="border border-black px-1 py-2 text-center font-normal text-[11px]"
                    >
                      {formatNumber(totalValue)}
                    </td>
                  ))}
              </tr>

              {/* ✅ Net Profit Before Tax (NPBT) Row */}
              <tr className="font-normal text-[11px] border-0 mt-2">
                <td className="border border-black px-1 py-2 text-center font-bold text-[11px]">
                  F
                </td>
                <td className="border border-black px-1 py-2 font-bold text-[11px] text-left w-1/3">
                  Net Profit Before Tax
                </td>

                {netProfitBeforeTax
                  .map((npbt, yearIndex) => ({ npbt, yearIndex }))
                  .filter(
                    ({ yearIndex }) => !(hideFirstYear && yearIndex === 0)
                  )
                  .map(({ npbt, yearIndex }) => (
                    <td
                      key={`netProfitBeforeTax-${yearIndex}`}
                      className="border border-black px-1 py-2 text-center font-bold text-[11px]"
                    >
                      {formatNumber(npbt)}
                    </td>
                  ))}
              </tr>

              {/* ✅ Income Tax Row */}
              <tr className="font-normal text-[11px] border-0 mt-2">
                <td className="border border-black border-b-black px-1 py-2 text-center font-normal text-[11px]">
                  Less
                </td>
                <td className="border border-black border-b-black px-1 py-2 font-normal text-[11px] text-left w-1/3">
                  Income Tax @ {formData.ProjectReportSetting.incomeTax} %
                </td>

                {incomeTaxCalculation
                  .map((tax, yearIndex) => ({ tax, yearIndex }))
                  .filter(
                    ({ yearIndex }) => !(hideFirstYear && yearIndex === 0)
                  )
                  .map(({ tax, yearIndex }) => (
                    <td
                      key={`incomeTax-${yearIndex}`}
                      className="border border-black border-b-black px-1 py-2 text-center font-normal text-[11px]"
                    >
                      {formatNumber(tax)}
                    </td>
                  ))}
              </tr>

              {/* ✅ Net Profit After Tax (NPAT) Row */}
              <tr className="font-normal text-[11px] border-0 mt-2">
                <td className="border border-black px-1 py-2 text-center font-bold text-[11px]">
                  G
                </td>
                <td className="border border-black px-1 py-2 font-bold text-[11px] text-left w-1/3">
                  Net Profit After Tax
                </td>

                {netProfitAfterTax
                  .map((npat, yearIndex) => ({ npat, yearIndex }))
                  .filter(
                    ({ yearIndex }) => !(hideFirstYear && yearIndex === 0)
                  )
                  .map(({ npat, yearIndex }) => (
                    <td
                      key={`netProfitAfterTax-${yearIndex}`}
                      className="border border-black px-1 py-2 text-center font-bold text-[11px]"
                    >
                      {formatNumber(npat)}
                    </td>
                  ))}
              </tr>

              {/* ✅ Withdrawals During the Year Row */}
              <tr className="font-normal text-[11px] border-0 mt-2">
                <td className="border border-black px-1 py-2 text-center font-normal text-[11px]"></td>
                <td className="border border-black px-1 py-2 font-normal text-[11px] text-left w-1/3">
                  Withdrawals during the year
                </td>

                {Array.from({
                  length:
                    parseInt(formData.ProjectReportSetting.ProjectionYears) ||
                    0,
                })
                  .map((_, yearIndex) => ({
                    amount: formData.MoreDetails.Withdrawals?.[yearIndex] ?? 0,
                    yearIndex,
                  }))
                  .filter(
                    ({ yearIndex }) => !(hideFirstYear && yearIndex === 0)
                  )
                  .map(({ amount, yearIndex }) => (
                    <td
                      key={`Withdrawals-${yearIndex}`}
                      className="border border-black px-1 py-2 text-center font-normal text-[11px]"
                    >
                      {formatNumber(amount)}
                    </td>
                  ))}
              </tr>

              {/* ✅ Balance Trf. To Balance Sheet Row */}
              <tr className="font-normal text-[11px] border-0 mt-2">
                <td className="border border-black px-1 py-2 text-center font-normal text-[11px]"></td>
                <td className="border border-black px-1 py-2 font-normal text-[11px] text-left w-1/3">
                  Balance Trf. To Balance Sheet
                </td>

                {balanceTransferred
                  .map((amount, yearIndex) => ({ amount, yearIndex }))
                  .filter(
                    ({ yearIndex }) => !(hideFirstYear && yearIndex === 0)
                  )
                  .map(({ amount, yearIndex }) => (
                    <td
                      key={`balanceTrf-${yearIndex}`}
                      className="border border-black px-1 py-2 text-center font-normal text-[11px]"
                    >
                      {formatNumber(amount)}
                    </td>
                  ))}
              </tr>

              {/* ✅ Cumulative Balance Trf. To Balance Sheet Row */}
              <tr className="font-normal text-[11px] border-0 mt-2">
                <td className="border border-black px-1 py-2 text-center font-normal text-[11px]"></td>
                <td className="border border-black px-1 py-2 font-normal text-[11px] text-left w-1/3">
                  Cumulative Balance Trf. To Balance Sheet
                </td>

                {cumulativeBalanceTransferred
                  .map((amount, yearIndex) => ({ amount, yearIndex }))
                  .filter(
                    ({ yearIndex }) => !(hideFirstYear && yearIndex === 0)
                  )
                  .map(({ amount, yearIndex }) => {
                    const adjustedAmount = Math.max(amount, 0);
                    const roundedValue = adjustedAmount;

                    return (
                      <td
                        key={`cumulativeBalance-${yearIndex}`}
                        className="border border-black px-1 py-2 text-center font-normal text-[11px]"
                      >
                        {formatNumber(roundedValue)}
                      </td>
                    );
                  })}
              </tr>

              {/* ✅ Cash Profit (NPAT + Dep.) Row */}
              <tr className="font-normal text-[11px] border-0 mt-2">
                <td className="border border-black px-1 py-2 text-center font-normal text-[11px]"></td>
                <td className="border border-black px-1 py-2 font-normal text-[11px] text-left w-1/3">
                  Cash Profit (NPAT + Dep.)
                </td>

                {netProfitAfterTax
                  .map((npat, yearIndex) => {
                    const depreciation =
                      storedData?.computedData1?.totalDepreciationPerYear?.[
                        yearIndex
                      ] || 0;
                    const cashProfit = npat + depreciation;
                    return { yearIndex, cashProfit };
                  })
                  .filter(
                    ({ yearIndex }) => !(hideFirstYear && yearIndex === 0)
                  )
                  .map(({ yearIndex, cashProfit }) => {
                    const roundedValue = cashProfit;
                    return (
                      <td
                        key={`cashProfit-${yearIndex}`}
                        className="border border-black px-1 py-2 text-center font-normal text-[11px]"
                      >
                        {formatNumber(roundedValue)}
                      </td>
                    );
                  })}
              </tr>

              {/* Dscr Table header  */}
              <tr className="font-bold text-[11px] border-black border-2">
                {/* Serial Number Column */}
                <th className="border border-black px-1 py-2 text-center">
                  Sr. No.
                </th>

                {/* Particulars Column */}
                <th className="border border-black px-1 py-2 text-left w-1/3">
                  Particulars
                </th>

                {/* Dynamic Year Headers */}
                {financialYearLabels
                  .map((yearLabel, yearIndex) => ({ yearLabel, yearIndex }))
                  .filter(
                    ({ yearIndex }) => !(hideFirstYear && yearIndex === 0)
                  )
                  .map(({ yearLabel, yearIndex }) => (
                    <th
                      key={`yearHeader-${yearIndex}`}
                      className="border border-black px-1 py-2 text-center"
                    >
                      {yearLabel}
                    </th>
                  ))}
              </tr>

              {/* ✅ DSCR Ratio Row */}
              <tr className="font-normal text-[11px] border-0 mt-2">
                <td className="border border-black px-1 py-2 text-center font-normal text-[11px]">
                  2
                </td>
                <td className="border border-black px-1 py-2 font-normal text-[11px] text-left w-1/3">
                  DSCR Ratio
                </td>

                {DSCR.map((totalValue, yearIndex) => ({
                  totalValue,
                  yearIndex,
                }))
                  .filter(
                    ({ yearIndex }) => !(hideFirstYear && yearIndex === 0)
                  )
                  .map(({ totalValue, yearIndex }) => (
                    <td
                      key={`dscr-${yearIndex}`}
                      className="border border-black px-1 py-2 text-center font-normal text-[11px]"
                    >
                      {formatNumber(parseFloat(totalValue).toFixed(2))}
                    </td>
                  ))}
              </tr>

              {/* ✅ Average DSCR Row */}
              <tr className="font-bold text-[11px] border-black border-2">
                <td
                  className="border border-black px-1 py-2 text-center"
                  style={{ width: "85px" }}
                ></td>
                <td
                  className="border border-black px-1 py-2 text-left w-1/3"
                  style={{ borderRight: "0" }}
                >
                  Average DSCR
                </td>
                <td
                  className="border border-black px-1 py-2 text-center font-extrabold text-[11px]"
                  colSpan={
                    hideFirstYear
                      ? financialYearLabels.length - 1
                      : financialYearLabels.length
                  }
                >
                  {formatNumber(parseFloat(averageDSCR).toFixed(2))}
                </td>
              </tr>

              {/* ✅ Current Ratio Row */}
              <tr className="font-normal text-[11px] border-0 mt-2">
                <td className="border border-black px-1 py-2 text-center font-normal text-[11px]">
                  3
                </td>

                <td className="border border-black px-1 py-2 font-normal text-[11px] text-left w-1/3">
                  Current Ratio
                </td>

                {currentRatio
                  .map((ratio, yearIndex) => ({ ratio, yearIndex }))
                  .filter(
                    ({ yearIndex }) => !(hideFirstYear && yearIndex === 0)
                  )
                  .map(({ ratio, yearIndex }) => (
                    <td
                      key={`current-ratio-${yearIndex}`}
                      className="border border-black px-1 py-2 text-center font-normal text-[11px]"
                    >
                      {ratio !== "-" ? ratio : "0"}
                    </td>
                  ))}
              </tr>

              {/* ✅ Average Current Ratio Row */}
              <tr className="font-bold text-[11px] border-black border-2">
                <td
                  className="border border-black px-1 py-2 text-center"
                  style={{ width: "85px" }}
                ></td>

                <td
                  className="border border-black px-1 py-2 text-left w-1/3"
                  style={{ borderRight: "0" }}
                >
                  Average Current Ratio
                </td>

                <td
                  className="border border-black px-1 py-2 text-center font-extrabold text-[11px]"
                  colSpan={
                    hideFirstYear
                      ? financialYearLabels.length - 1
                      : financialYearLabels.length
                  }
                >
                  {averageCurrentRatio !== "-" ? `${averageCurrentRatio}` : "0"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="w-full mt-10">
          {/* Profit Statement Heading */}
          <div className="bg-blue-950 text-white text-center py-2 text-[11px]">
            PROJECTED BALANCE SHEET
          </div>
          <table
            className="w-full  mt-3"
            style={{ borderCollapse: "collapse" }}
          >
            <thead>
              <tr className="bg-blue-950 text-white">
                <th className="border border-black px-1 py-2 w-16 text-center font-normal text-[11px]">
                  S. No.
                </th>
                <th className="border border-black px-1 py-2 text-left font-normal text-[11px]">
                  Particulars
                </th>
                {financialYearLabels.map((yearLabel, yearIndex) => (
                  <th
                    key={yearIndex}
                    className="border border-black px-1 py-2 text-center font-normal text-[11px]"
                  >
                    {yearLabel}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {/* ✅ Liabilities Header Row */}
              <tr className="font-normal text-[11px] border-0 mt-2">
                {/* Serial Number Column */}
                <td className="border border-black px-1 py-2 text-center font-normal text-[11px]">
                  A
                </td>

                {/* Label: Liabilities */}
                <td className="border border-black px-1 py-2 font-extrabold text-left w-1/3">
                  Liabilities
                </td>
              </tr>

              {/* ✅ Capital Row */}
              <tr className="font-normal text-[11px] border-0 mt-2">
                {/* Serial Number */}
                <td className="border border-black px-1 py-2 text-center font-normal text-[11px]">
                  1
                </td>

                {/* Label: Capital */}
                <td className="border border-black px-1 py-2 font-normal text-[11px] text-left w-1/3">
                  Capital
                </td>

                {/* ✅ Display Total PC for Each Year */}
                {Array.from({ length: projectionYears }).map((_, index) => (
                  <td
                    key={`capital-${index}`}
                    className="border border-black px-1 py-2 text-center font-normal text-[11px]"
                  >
                    {formatNumber(formData?.MeansOfFinance?.totalPC || 0)}
                  </td>
                ))}
              </tr>

              {/* ✅ Reserves & Surplus Row */}
              <tr className="font-normal text-[11px] border-0 mt-2">
                {/* Serial Number */}
                <td className="border border-black px-1 py-2 text-center font-normal text-[11px]">
                  2
                </td>

                {/* Label: Reserves & Surplus */}
                <td className="border border-black px-1 py-2 font-normal text-[11px] text-left w-1/3">
                  Reserves & Surplus
                </td>

                {/* ✅ Display Computed Reserves & Surplus Values */}
                {storedData?.receivedData?.cumulativeBalanceTransferred?.map(
                  (amount, yearIndex) => {
                    const adjustedAmount = Math.max(amount, 0);
                    const roundedValue = adjustedAmount;

                    return (
                      <td
                        key={`cumulativeBalance-${yearIndex}`}
                        className="border border-black px-1 py-2 text-center font-normal text-[11px]"
                      >
                        {formatNumber(roundedValue)}
                      </td>
                    );
                  }
                )}
              </tr>

              {/* ✅ Bank Loan - Term Loan Row */}
              <tr className="font-normal text-[11px] border-0 mt-2">
                {/* Serial Number */}
                <td className="border border-black px-1 py-2 text-center font-normal text-[11px]">
                  3
                </td>

                {/* Label: Bank Loan - Term Loan */}
                <td className="border border-black px-1 py-2 font-normal text-[11px] text-left w-1/3">
                  Bank Loan - Term Loan
                </td>

                {/* ✅ Display Bank Loan Balances */}
                {Array.from({ length: projectionYears }).map((_, index) => {
                  const marchBalance =
                    storedData?.marchClosingBalances[index] || 0;
                  const repaymentValue =
                    repaymentValueswithin12months?.[index] || 0;
                  const balance = marchBalance - repaymentValue;
                  return (
                    <td
                      key={`bankLoan-${index}`}
                      className="border border-black px-1 py-2 text-center font-normal text-[11px]"
                    >
                      {formatNumber(balance)}
                    </td>
                  );
                })}
              </tr>

              {/* ✅ Bank Loan Payable within next 12 months */}
              <tr className="font-normal text-[11px] border-0 mt-2">
                {/* Serial Number */}
                <td className="border border-black px-1 py-2 text-center font-normal text-[11px]">
                  4
                </td>

                {/* Label: Bank Loan Payable within next 12 months */}
                <td className="border border-black px-1 py-2 font-normal text-[11px] text-left w-1/3">
                  Bank Loan Payable within next 12 months
                </td>

                {/* ✅ Display Payable Loan Values */}
                {repaymentValueswithin12months.map((value, index) => (
                  <td
                    key={`loanPayable-${index}`}
                    className="border border-black px-1 py-2 text-center font-normal text-[11px]"
                  >
                    {formatNumber(value)}
                  </td>
                ))}
              </tr>

              {/* ✅ Bank Loan - Working Capital Loan */}
              <tr className="font-normal text-[11px] border-0 mt-2">
                {/* Serial Number */}
                <td className="border border-black px-1 py-2 text-center font-normal text-[11px]">
                  5
                </td>

                {/* Label: Bank Loan - Working Capital Loan */}
                <td className="border border-black px-1 py-2 font-normal text-[11px] text-left w-1/3">
                  Bank Loan - Working Capital Loan
                </td>

                {/* ✅ Display Cumulative Working Capital Loan for Each Year */}
                {cumulativeLoanForPreviousYears.map((loan, index) => (
                  <td
                    key={`workingCapitalLoan-${index}`}
                    className="border border-black px-1 py-2 text-center font-normal text-[11px]"
                  >
                    {formatNumber(loan)}
                  </td>
                ))}
              </tr>

              {/* ✅ Liabilities from More Details (Dynamically Aligned with Projection Years) */}
              {formData?.MoreDetails?.currentLiabilities?.map(
                (liabilities, idx) => {
                  let cumulativeSum = 0;

                  // ✅ Step 1: Precompute cumulative values
                  const cumulativeValues = Array.from({
                    length: projectionYears,
                  }).map((_, yearIndex) => {
                    cumulativeSum += Number(liabilities.years[yearIndex]) || 0;
                    return cumulativeSum;
                  });

                  // ✅ Step 2: Check if all values are zero
                  const allValuesZero = cumulativeValues.every(
                    (val) => val === 0
                  );

                  // ✅ Step 3: Skip rendering if all values are zero
                  if (allValuesZero) return null;

                  // ✅ Step 4: Render row
                  return (
                    <tr
                      className="font-normal text-[11px] border-0 mt-2"
                      key={`liabilities-${idx}`}
                    >
                      {/* Serial Number */}
                      <td className="border border-black px-1 py-2 text-center font-normal text-[11px]">
                        {idx + 6}
                      </td>

                      {/* Liability Name */}
                      <td className="border border-black px-1 py-2 font-normal text-[11px] text-left w-1/3">
                        {liabilities.particular}
                      </td>

                      {/* Display cumulative values */}
                      {cumulativeValues.map((val, yearIndex) => (
                        <td
                          key={`liability-${idx}-${yearIndex}`}
                          className="border border-black px-1 py-2 text-center font-normal text-[11px]"
                        >
                          {formatNumber(val)}
                        </td>
                      ))}
                    </tr>
                  );
                }
              )}

              {/* ✅ Total Liabilities Row */}
              <tr className="font-normal text-[11px] border-0 mt-2">
                {/* Empty Serial Number Column */}
                <td className="border border-black px-1 py-2 text-center font-bold text-[11px]"></td>

                {/* Label: Total Liabilities */}
                <td className="border border-black px-1 py-2 font-bold text-[11px] text-left w-1/3">
                  Total
                </td>

                {/* ✅ Display Computed Total Liabilities for Each Year */}
                {totalLiabilitiesArray.map((total, index) => (
                  <td
                    key={`totalLiabilities-${index}`}
                    className="border border-black px-1 py-2 text-center font-bold text-[11px]"
                    style={{ borderTopWidth: "2px", borderBottomWidth: "2px" }} // ✅ Adds thick borders to highlight total
                  >
                    {formatNumber(total)}
                  </td>
                ))}
              </tr>

              {/* ✅ Assets Header Row */}
              <tr className="font-normal text-[11px] border-0 mt-2">
                {/* Serial Number Column */}
                <td className="border border-black px-1 py-2 text-center font-normal text-[11px]">
                  B
                </td>

                {/* Label: Liabilities */}
                <td className="border border-black px-1 py-2 font-extrabold text-left w-1/3">
                  Assets
                </td>
              </tr>

              {/* ✅ Fixed Assets Row */}
              <tr className="font-normal text-[11px] border-0 mt-2">
                <td className="border border-black px-1 py-2 text-center font-normal text-[11px]">
                  1
                </td>
                <td className="border border-black px-1 py-2 font-normal text-[11px] text-left w-1/3">
                  Fixed Assets
                </td>
                {computedFixedAssets.map((value, index) => (
                  <td
                    key={`fixedAssets-${index}`}
                    className="border border-black px-1 py-2 text-center font-normal text-[11px]"
                  >
                    {value.toLocaleString("en-IN")}
                  </td>
                ))}
              </tr>

              {/* ✅ Less: Depreciation Row */}
              <tr className="font-normal text-[11px] border-0 mt-2">
                <td className="border border-black px-1 py-2 text-center font-normal text-[11px]">
                  2
                </td>
                <td className="border border-black px-1 py-2 font-normal text-[11px] text-left w-1/3">
                  Less: Depreciation
                </td>
                {Array.from({ length: projectionYears }).map((_, index) => (
                  <td
                    key={`depreciation-${index}`}
                    className="border border-black px-1 py-2 text-center font-normal text-[11px]"
                  >
                    {formatNumber(
                      storedData?.computedData1?.totalDepreciationPerYear[
                        index
                      ] || "-"
                    )}
                  </td>
                ))}
              </tr>

              {/* ✅ Net Fixed Assets Row */}
              <tr className="font-normal text-[11px] border-0 mt-2">
                <td className="border border-black px-1 py-2 text-center font-normal text-[11px]">
                  3
                </td>
                <td className="border border-black px-1 py-2 font-normal text-[11px] text-left w-1/3">
                  Net Fixed Assets
                </td>
                {computedNetFixedAssets.map((value, index) => (
                  <td
                    key={`netFixedAssets-${index}`}
                    className="border border-black px-1 py-2 text-center font-normal text-[11px]"
                  >
                    {value.toLocaleString("en-IN")}
                  </td>
                ))}
              </tr>

              {/* ✅ Cash & Cash Equivalents Row */}
              <tr className="font-normal text-[11px] border-0 mt-2">
                <td className="border border-black px-1 py-2 text-center font-normal text-[11px]">
                  4
                </td>
                <td className="border border-black px-1 py-2 font-normal text-[11px] text-left w-1/3">
                  Cash & Cash Equivalents
                </td>
                {storedData?.closingCashBalanceArray.map((balance, index) => (
                  <td
                    key={`cashEquivalents-${index}`}
                    className="border border-black px-1 py-2 text-center font-normal text-[11px]"
                  >
                    {balance ? balance.toLocaleString("en-IN") : "0"}
                  </td>
                ))}
              </tr>

              <tr className="font-normal text-[11px] border-0 mt-2">
                {/* Serial Number */}
                <td className="border border-black px-1 py-2 text-center font-normal text-[11px]">
                  5
                </td>

                {/* Particular Name */}
                <td className="border border-black px-1 py-2 text-left font-normal text-[11px] w-1/3">
                  Inventory
                </td>

                {/* Inventory Values per Year */}
                {Array.from({
                  length: formData.ProjectReportSetting.ProjectionYears,
                }).map((_, yearIndex) => {
                  const inventorymap = inventory[yearIndex] || 0;

                  return (
                    <td
                      key={yearIndex}
                      className="border border-black px-1 py-2 text-center font-normal text-[11px]"
                    >
                      {formatNumber(inventorymap)}
                    </td>
                  );
                })}
              </tr>

              {/* ✅ Current Assets from More Details */}
              {formData?.MoreDetails?.currentAssets
                ?.filter(
                  (assets) =>
                    assets.particular !== "Inventory" &&
                    !assets.dontSendToBS && // ✅ Skip if checkbox was ticked
                    assets.years.some((value) => Number(value) !== 0) // ✅ Skip all-zero rows
                )
                .map((assets, index) => {
                  let cumulativeSum = 0;

                  // ✅ Step 1: Precompute cumulative values
                  const cumulativeValues = Array.from({
                    length: projectionYears,
                  }).map((_, yearIndex) => {
                    cumulativeSum += Number(assets.years[yearIndex]) || 0;
                    return cumulativeSum;
                  });

                  // ✅ Step 2: Render the row
                  return (
                    <tr
                      className="font-normal text-[11px] border-0 mt-2"
                      key={`currentAssets-${index}`}
                    >
                      <td className="border border-black px-1 py-2 text-center font-normal text-[11px]">
                        {index + 6}
                      </td>
                      <td className="border border-black px-1 py-2 font-normal text-[11px] text-left w-1/3">
                        {assets.particular}
                      </td>
                      {cumulativeValues.map((val, yearIndex) => (
                        <td
                          key={`currentAsset-${index}-${yearIndex}`}
                          className="border border-black px-1 py-2 text-center font-normal text-[11px]"
                        >
                          {formatNumber(val)}
                        </td>
                      ))}
                    </tr>
                  );
                })}

              {/* ✅ Render Preliminary Row */}
              {!isPreliminaryWriteOffAllZero && (
                <tr className="font-normal text-[11px] border-0 mt-2">
                  {/* Serial Number */}
                  <td className="border border-black px-1 py-2 text-center font-normal text-[11px]">
                    {preliminarySerialNo}
                  </td>

                  {/* Particular Name */}
                  <td className="border border-black px-1 py-2 text-left font-normal text-[11px] w-1/3">
                    Preliminary Expenses <br /> Yet to Be Written Off
                  </td>

                  {/* Render values for each projection year */}
                  {preliminaryWriteOffPerYear.map((value, yearIndex) => (
                    <td
                      key={yearIndex}
                      className="border border-black px-1 py-2 text-center font-normal text-[11px]"
                    >
                      {formatNumber(value)}
                    </td>
                  ))}
                </tr>
              )}

              {/* ✅ Total Assets Row */}
              <tr className="font-bold text-[11px] border-black border-2 mt-2">
                <td className="border border-black px-1 py-2 text-center font-bold text-[11px]"></td>
                <td className="border border-black px-1 py-2 font-bold text-[11px] text-left w-1/3">
                  Total Assets
                </td>
                {totalAssetArray.map((total, index) => (
                  <td
                    key={`totalAssets-${index}`}
                    className="border border-black px-1 py-2 text-center font-bold text-[11px]"
                    style={{ borderTopWidth: "2px", borderBottomWidth: "2px" }}
                  >
                    {formatNumber(total)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* <h1>Check Profit Data</h1> */}

      {/* <pre>{JSON.stringify(formData, null, 2)}</pre> */}

      {/* <pre>{JSON.stringify(profitabilityData, null, 2)}</pre>
      <pre>{JSON.stringify(storedData, null, 2)}</pre> */}
    </div>
  );
};

export default CheckProfit;
