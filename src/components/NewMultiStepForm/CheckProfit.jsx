// import React from "react";
// import useStore from "./useStore";

// const CheckProfit = () => {
//   const computedDataToProfit = useStore((state) => state.computedDataToProfit);

//   return (
//     <div>
//       <h2>Check Profit</h2>
//       {computedDataToProfit ? (
//         <pre>{JSON.stringify(computedDataToProfit, null, 2)}</pre>
//       ) : (
//         <p>No Data Available</p>
//       )}
//     </div>
//   );
// };

// export default CheckProfit;

import React, { useEffect, useMemo, useState } from "react";
import useStore from "./useStore";
import {useNavigate, useSearchParams} from "react-router-dom";

const CheckProfit = () => {
  const navigate = useNavigate();
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

  const handleBack = () => {
    const lastStep = localStorage.getItem("lastStep") || 8;
    navigate(`/multistepform?step=${lastStep}`); // ✅ Sync with query parameter
  };
  
  

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

  const adjustedRevenueValues = Array.from({
    length: parseInt(formData?.ProjectReportSetting?.ProjectionYears) || 0,
  }).map((_, yearIndex) => {
    const totalRevenue = storedData?.totalRevenueReceipts?.[yearIndex] ?? 0; // Ensure safe access
    const closingStock = formData?.MoreDetails?.closingStock?.[yearIndex] ?? 0;
    const openingStock = formData?.MoreDetails?.openingStock?.[yearIndex] ?? 0;

    return totalRevenue + closingStock - openingStock;
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
        // ✅ Check if this is "Raw Material Expenses / Purchases"
        const isRawMaterial =
          expense.name.trim() === "Raw Material Expenses / Purchases";

        let expenseValue;
        if (isRawMaterial && String(expense.value).trim().endsWith("%")) {
          // ✅ Calculate as percentage of total revenue
          expenseValue =
            (parseFloat(expense.value) / 100) *
            storedData?.totalRevenueReceipts[yearIndex];
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
    const totalIndirectExpenses = indirectExpense.reduce(
      (sum, expense) =>
        sum +
        calculateIndirectExpense(Number(expense.value * 12) || 0, yearIndex),
      0
    );

    const interestOnTermLoan =
      storedData?.yearlyInterestLiabilities[yearIndex] || 0;
    const interestExpenseOnWorkingCapital = calculateInterestOnWorkingCapital(
      interestOnWorkingCapital[yearIndex] || 0,
      yearIndex
    );
    const depreciationExpense =
      storedData?.computedData1?.totalDepreciationPerYear[yearIndex] || 0;

    const total =
      totalIndirectExpenses +
      interestOnTermLoan +
      interestExpenseOnWorkingCapital +
      depreciationExpense;

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
      npbt - (formData.MoreDetails.withdrawals?.[yearIndex] || 0)
  );

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
    if (yearIndex === 0) {
      return 0; // ✅ Set first year's total to 0
    } else {
      return (
        (netProfitAfterTax[yearIndex] || 0) +
        (storedData?.computedData1?.totalDepreciationPerYear[yearIndex] || 0) +
        (storedData?.yearlyInterestLiabilities[yearIndex] || 0) +
        (calculateInterestOnWorkingCapital(
          interestOnWorkingCapital[yearIndex] || 0,
          yearIndex
        ) || 0) // ✅ Correctly calling the function
      );
    }
  });

  // ✅ Compute Total (B) for Each Year
  const totalB = Array.from({
    length: formData.ProjectReportSetting.ProjectionYears || 0,
  }).map((_, yearIndex) => {
    return (
      (storedData?.yearlyInterestLiabilities[yearIndex] || 0) + // ✅ Interest on Term Loan
      (calculateInterestOnWorkingCapital(
        interestOnWorkingCapital[yearIndex] || 0, // Pass interest amount
        yearIndex // Pass current year index
      ) || 0) + // ✅ Interest on Working Capital
      (storedData?.yearlyPrincipalRepayment[yearIndex] || 0) // ✅ Repayment of Term Loan
    );
  });

  const DSCR = Array.from({
    length: formData.ProjectReportSetting.ProjectionYears || 0,
  }).map((_, yearIndex) => {
    return totalB[yearIndex] !== 0 ? totalA[yearIndex] / totalB[yearIndex] : 0; // ✅ Avoid division by zero
  });
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

  const totalAssetArray = Array.from({ length: projectionYears }).map(
    (_, index) => {
      const netFixedAssetValue = computedNetFixedAssets[index] || 0; // Use computed values directly
      const cashEquivalent = storedData?.closingCashBalanceArray[index] || 0; // Use closing cash balance

      // ✅ Include Current Assets from `MoreDetails.currentAssets` with cumulative rule
      const currentYearAssets = formData?.MoreDetails?.currentAssets?.reduce(
        (total, assets) => total + Number(assets.years[index] || 0),
        0
      );

      cumulativeCurrentAssets += currentYearAssets; // Apply cumulative rule

      // ✅ Compute the Correct Total Assets
      return netFixedAssetValue + cashEquivalent + cumulativeCurrentAssets; // Use cumulative total for assets
    }
  );

  const repaymentValueswithin12months = Array.from({
    length: formData.ProjectReportSetting.ProjectionYears || 0,
  }).map((_, index) => {
    let mappedIndex = index + 1; // ✅ Shift to next year

    return mappedIndex < formData.ProjectReportSetting.ProjectionYears
      ? Math.round(storedData?.yearlyPrincipalRepayment[mappedIndex] || 0) // ✅ Fetch next year's value
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

      const termLoan = Number(storedData?.marchClosingBalances?.[index] || 0);

      // ✅ Ensure correct bankLoanPayableWithinNext12Months mapping
      const mappedIndex = index + 1; // Shift to next year's value
      let bankLoanPayableWithinNext12Months =
        mappedIndex < projectionYears
          ? Math.round(storedData?.yearlyPrincipalRepayment[mappedIndex] || 0)
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

      // console.log(`Year ${index + 1}:`);
      // console.log(`  - Capital: ${capital}`);
      // console.log(`  - Reserves & Surplus: ${reservesAndSurplus}`);
      // console.log(`  - Term Loan: ${termLoan}`);
      // console.log(`  - Bank Loan Payable Next 12 Months: ${bankLoanPayableWithinNext12Months}`);
      // console.log(`  - Working Capital Loan: ${workingCapitalLoan}`);
      // console.log(`  - Current Year Liabilities: ${currentYearLiabilities}`);
      // console.log(`  - Cumulative Liabilities: ${cumulativeAdditionalLiabilities}`);
      // console.log(`  - Total Liabilities: ${totalForYear}`);

      return totalForYear;
    }
  );

  return (
    <div className="p-2 w-full">
      {/* ✅ Corrected inline styles using spread operator */}

      <div className="p-20 flex flex-col items-center align-middle justify-center w-full">
      <div className="">
        <button
          onClick={handleBack}
          className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition duration-200 "
          style={{marginRight: "66rem"}}
        >
          ← Back
        </button>
        
      </div>
      <h2 className="text-3xl font-bold">Profit Statements</h2>
        {/* <h2 className="text-3xl font-bold mb-4">Profit Statements</h2> */}
        <div style={{ scale: "0.9" }}>
          <div className="w-full">
            {/* Profit Statement Heading */}
            <div className="bg-blue-950 text-white text-center py-2 text-sm">
              PROJECTED PROFITABILITY STATEMENT
            </div>

            <table
              className="w-full  mt-3"
              style={{ borderCollapse: "collapse" }}
            >
              <thead>
                <tr className="bg-blue-950 text-white">
                  <th className="border border-black px-2 py-2 w-16 text-center font-normal text-sm">
                    S. No.
                  </th>
                  <th className="border border-black px-2 py-2 text-left font-normal text-sm">
                    Particulars
                  </th>
                  {financialYearLabels.map((yearLabel, yearIndex) => (
                    <th
                      key={yearIndex}
                      className="border border-black px-2 py-2 text-center font-normal text-sm"
                    >
                      {yearLabel}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {/* Revenue Receipt  */}
                <tr className=" font-normal text-sm border-0 mt-2">
                  <td className="border border-black px-4 py-2 text-center font-normal text-sm">
                    A
                  </td>
                  <td className="border border-black px-4 py-2 font-normal text-sm text-left font-normal text-sm">
                    Total Revenue Receipt
                  </td>

                  {/* ✅ Display revenue values based on projectionYears */}
                  {storedData?.totalRevenueReceipts
                    ?.slice(0, projectionYears)
                    .map((totalYearValue, yearIndex) => (
                      <td
                        key={yearIndex}
                        className="border border-black px-4 py-2 text-center font-normal text-sm"
                      >
                        {formatNumber(totalYearValue)}
                      </td>
                    ))}
                </tr>
                {/* Closing Stock / Inventory */}
                <tr className="font-normal text-sm border-0 mt-2">
                  <td className="border border-black px-4 py-2 text-center font-normal text-sm">
                    B
                  </td>
                  <td className="border border-black px-4 py-2 font-normal text-sm text-left w-1/3">
                    Add: Closing Stock / Inventory
                  </td>


        <div className="w-full">
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
              {/* Revenue Receipt  */}
              <tr className=" font-normal text-[11px] border-0 mt-2">
                <td className="border border-black px-1 py-2 text-center font-normal text-[11px]">
                  A
                </td>
                <td className="border border-black px-1 py-2 font-normal text-[11px] text-left font-normal text-[11px]">
                  Total Revenue Receipt
                </td>

                {/* ✅ Display revenue values based on projectionYears */}
                {storedData?.totalRevenueReceipts
                  ?.slice(0, projectionYears)
                  .map((totalYearValue, yearIndex) => (
                    <td
                      key={yearIndex}
                      className="border border-black px-1 py-2 text-center font-normal text-[11px]"
                    >
                      {formatNumber(totalYearValue)}
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

                {Array.from({
                  length:
                    parseInt(formData.ProjectReportSetting.ProjectionYears) ||
                    0,
                }).map((_, index) => (
                  <td
                    key={`closingStock-${index}`}
                    className="border border-black px-1 py-2 text-center font-normal text-[11px]"
                  >
                    {formatNumber(
                      formData.MoreDetails.closingStock?.[index] ?? 0
                    )}
                  </td>
                ))}
              </tr>

              {/* Opening Stock / Inventory */}
              <tr className="font-normal text-[11px] border-0 mt-2">
                <td className="border border-black px-1 py-2 text-center font-normal text-[11px]"></td>
                <td className="border border-black px-1 py-2 font-normal text-[11px] text-left w-1/3">
                  Less: Opening Stock / Inventory
                </td>

                {Array.from({
                  length:
                    parseInt(formData.ProjectReportSetting.ProjectionYears) ||
                    0,
                }).map((_, index) => (
                  <td
                    key={`openingStock-${index}`}
                    className="border border-black px-1 py-2 text-center font-normal text-[11px]"
                  >
                    {formatNumber(
                      formData.MoreDetails.openingStock?.[index] ?? 0
                    )}
                  </td>
                ))}
              </tr>
              {/* Computation of Total Revenue, Adding Closing Stock, and Subtracting Opening Stock */}
              <tr className="font-normal text-[11px] border-0 mt-2">
                <td className="border border-black px-1 py-2 text-center font-normal text-[11px]"></td>
                <td className="border border-black px-1 py-2 font-extrabold text-left w-1/3"></td>

                {/* ✅ Display Computed Adjusted Revenue Values */}
                {adjustedRevenueValues?.map((finalValue, yearIndex) => (
                  <td
                    key={`finalValue-${yearIndex}`}
                    className="border border-black px-1 py-2 text-center font-extrabold font-roboto"
                  >
                    {formatNumber(finalValue)}
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

                    {Array.from({ length: projectionYears }).map(
                      (_, yearIndex) => (
                        <td
                          key={yearIndex}
                          className="border border-black px-1 py-2 text-center  font-roboto"
                        >
                          {formatNumber(
                            calculateExpense(
                              Number(fringAndAnnualCalculation) || 0,
                              yearIndex
                            )
                          )}
                        </td>
                      )
                    )}
                  </tr>
                );
              })}

              {directExpense
                ?.filter((expense) => expense.type === "direct")
                ?.map((expense, index) => {
                  // ✅ Check if this is the "Raw Material Expenses / Purchases" field
                  const isRawMaterial =
                    expense.name.trim() === "Raw Material Expenses / Purchases";

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

                      {Array.from({ length: projectionYears }).map(
                        (_, yearIndex) => {
                          let expenseValue;

                          if (
                            isRawMaterial &&
                            String(expense.value).trim().endsWith("%")
                          ) {
                            // ✅ If "Raw Material Expenses / Purchases" contains `%`, calculate based on revenue
                            expenseValue =
                              (parseFloat(expense.value) / 100) *
                              storedData?.totalRevenueReceipts[yearIndex];
                          } else {
                            // ✅ Otherwise, use the normal numeric calculation
                            expenseValue = Number(expense.value) * 12 || 0;
                          }

                          // ✅ Apply calculateExpense only if it's NOT a raw material expense
                          const formattedExpense = isRawMaterial
                            ? formatNumber(expenseValue.toFixed(2)) // Directly format raw material expense
                            : formatNumber(
                                calculateExpense(
                                  expenseValue,
                                  yearIndex
                                ).toFixed(2)
                              );

                          return (
                            <td
                              key={`directExpense-${index}-year-${yearIndex}`}
                              className="border border-black px-1 py-2 text-center font-normal text-[11px]"
                            >
                              {formattedExpense}
                            </td>
                          );
                        }
                      )}
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
                {totalDirectExpensesArray.map((grandTotal, yearIndex) => (
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
                {grossProfitValues.map((grossProfit, yearIndex) => (
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
                {/* Serial Number */}
                <td className="border border-black px-1 py-2 text-center font-normal text-[11px]">
                  1
                </td>

                {/* Particular Name */}
                <td className="border border-black px-1 py-2 font-normal text-[11px] text-left w-1/3">
                  Interest On Term Loan
                </td>

                {/* Projection Yearly Values */}
                {Array.from({
                  length:
                    parseInt(formData.ProjectReportSetting.ProjectionYears) ||
                    0,
                }).map((_, index) => (
                  <td
                    key={`interestLoan-${index}`}
                    className="border border-black px-1 py-2 text-center font-normal text-[11px]"
                  >
                    {formatNumber(
                      storedData?.yearlyInterestLiabilities?.[index] ?? 0
                    )}
                  </td>
                ))}
              </tr>

              {/* Interest on Working Capital */}
              <tr className="font-normal text-[11px] border-0 mt-2">
                {/* Serial Number */}
                <td className="border border-black px-1 py-2 text-center font-normal text-[11px]">
                  2
                </td>

                {/* Particular Name */}
                <td className="border border-black px-1 py-2 font-normal text-[11px] text-left w-1/3">
                  Interest On Working Capital
                </td>

                {/* Projection Yearly Values */}
                {Array.from({
                  length:
                    parseInt(formData.ProjectReportSetting.ProjectionYears) ||
                    0,
                }).map((_, yearIndex) => {
                  const calculatedInterest = calculateInterestOnWorkingCapital(
                    interestOnWorkingCapital?.[yearIndex] || 0,
                    yearIndex
                  );

                  return (
                    <td
                      key={`workingCapitalInterest-${yearIndex}`}
                      className="border border-black px-1 py-2 text-center font-normal text-[11px]"
                    >
                      {formatNumber(calculatedInterest)}
                    </td>
                  );
                })}
              </tr>

              {/* Depreciation Row */}
              <tr className="font-normal text-[11px] border-0 mt-2">
                {/* Serial Number */}
                <td className="border border-black px-1 py-2 text-center font-normal text-[11px]">
                  3
                </td>

                {/* Particular Name */}
                <td className="border border-black px-1 py-2 font-normal text-[11px] text-left w-1/3">
                  Depreciation
                </td>

                {/* Depreciation Values for Each Year */}
                {storedData?.computedData1?.totalDepreciationPerYear?.map(
                  (depreciationValue, yearIndex) => (
                    <td
                      key={`depreciation-${yearIndex}`}
                      className="border border-black px-1 py-2 text-center font-normal text-[11px]"
                    >
                      {formatNumber(depreciationValue)}
                    </td>
                  )
                )}
              </tr>

              {/* Indirect Expenses Rows */}
              {directExpense
                .filter((expense) => expense.type === "indirect")
                .map((expense, index) => {
                  const baseValue = Number(expense.value) || 0;

                  return (
                    <tr
                      key={`indirect-expense-${index}`}
                      className="font-normal text-[11px] border-0 mt-2"
                    >
                      {/* Serial Number */}
                      <td className="border border-black px-1 py-2 text-center font-normal text-[11px]">
                        {index + 4}
                      </td>

                      {/* Expense Name */}
                      <td className="border border-black px-1 py-2 font-normal text-[11px] text-left w-1/3">
                        {expense.name}
                      </td>

                      {/* Loop through Projection Years */}
                      {Array.from({
                        length:
                          parseInt(
                            formData.ProjectReportSetting.ProjectionYears
                          ) || 0,
                      }).map((_, yearIndex) => {
                        const calculatedValue = calculateIndirectExpense(
                          baseValue,
                          yearIndex
                        );

                        return (
                          <td
                            key={`indirectExpense-${index}-${yearIndex}`}
                            className="border border-black px-1 py-2 text-center font-normal text-[11px]"
                          >
                            {formatNumber(calculatedValue * 12)}
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

                {/* ✅ Display the calculated `totalIndirectExpensesArray` */}
                {totalIndirectExpensesArray.map((totalValue, yearIndex) => (
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
                {/* Serial Number */}
                <td className="border border-black px-1 py-2 text-center font-bold text-[11px]">
                  F
                </td>

                {/* Label: Net Profit Before Tax */}
                <td className="border border-black px-1 py-2 font-bold text-[11px] text-left w-1/3">
                  Net Profit Before Tax
                </td>

                {/* ✅ Display Precomputed NPBT Values */}
                {netProfitBeforeTax.map((npbt, yearIndex) => (
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
                {/* Serial Number */}
                <td className="border border-black border-b-black px-1 py-2 text-center font-normal text-[11px]">
                  Less
                </td>

                {/* Label: Income Tax @ % */}
                <td className="border border-black border-b-black px-1 py-2 font-normal text-[11px] text-left w-1/3">
                  Income Tax @ {formData.ProjectReportSetting.incomeTax} %
                </td>

                {/* ✅ Display Precomputed Income Tax Values */}
                {incomeTaxCalculation.map((tax, yearIndex) => (
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
                {/* Serial Number */}
                <td className="border border-black px-1 py-2 text-center font-bold text-[11px]">
                  G
                </td>

                {/* Label: Net Profit After Tax */}
                <td className="border border-black px-1 py-2 font-bold text-[11px] text-left w-1/3">
                  Net Profit After Tax
                </td>

                {/* ✅ Display Precomputed NPAT Values */}
                {netProfitAfterTax.map((npat, yearIndex) => (
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
                {/* Empty Serial Number Column */}
                <td className="border border-black px-1 py-2 text-center font-normal text-[11px]"></td>

                {/* Label: Withdrawals During the Year */}
                <td className="border border-black px-1 py-2 font-normal text-[11px] text-left w-1/3">
                  Withdrawals during the year
                </td>

                {/* ✅ Display Precomputed Withdrawals Values */}
                {Array.from({
                  length:
                    parseInt(formData.ProjectReportSetting.ProjectionYears) ||
                    0,
                }).map((_, yearIndex) => {
                  const amount =
                    formData.MoreDetails.withdrawals?.[yearIndex] ?? 0; // Ensure safe data access

                  return (
                    <td
                      key={`withdrawals-${yearIndex}`}
                      className="border border-black px-1 py-2 text-center font-normal text-[11px]"
                    >
                      {formatNumber(amount)}
                    </td>
                  );
                })}
              </tr>
              {/* ✅ Balance Trf. To Balance Sheet Row */}
              <tr className="font-normal text-[11px] border-0 mt-2">
                {/* Empty Serial Number Column */}
                <td className="border border-black px-1 py-2 text-center font-normal text-[11px]"></td>

                {/* Label: Balance Trf. To Balance Sheet */}
                <td className="border border-black px-1 py-2 font-normal text-[11px] text-left w-1/3">
                  Balance Trf. To Balance Sheet
                </td>

                {/* ✅ Display Precomputed Balance Transferred Values */}
                {balanceTransferred.map((amount, yearIndex) => {
                  const roundedValue =
                    amount - Math.floor(amount) <= 0.5
                      ? Math.floor(amount)
                      : Math.ceil(amount); // Rounding logic

                  return (
                    <td
                      key={`balanceTransferred-${yearIndex}`}
                      className="border border-black px-1 py-2 text-center font-normal text-[11px]"
                    >
                      {formatNumber(roundedValue)}
                    </td>
                  );
                })}
              </tr>

              {/* ✅ Cumulative Balance Trf. To Balance Sheet Row */}
              <tr className="font-normal text-[11px] border-0 mt-2">
                {/* Empty Serial Number Column */}
                <td className="border border-black px-1 py-2 text-center font-normal text-[11px]"></td>

                {/* Label: Cumulative Balance Trf. To Balance Sheet */}
                <td className="border border-black px-1 py-2 font-normal text-[11px] text-left w-1/3">
                  Cumulative Balance Trf. To Balance Sheet
                </td>

                {/* ✅ Display Cumulative Balance Transferred Values */}
                {cumulativeBalanceTransferred.map((amount, yearIndex) => {
                  const adjustedAmount = Math.max(amount, 0); // Convert negative values to 0
                  const roundedValue =
                    adjustedAmount - Math.floor(adjustedAmount) <= 0.5
                      ? Math.floor(adjustedAmount)
                      : Math.ceil(adjustedAmount); // Rounding logic

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
                {/* Empty Serial Number Column */}
                <td className="border border-black px-1 py-2 text-center font-normal text-[11px]"></td>

                {/* Label: Cash Profit (NPAT + Dep.) */}
                <td className="border border-black px-1 py-2 font-normal text-[11px] text-left w-1/3">
                  Cash Profit (NPAT + Dep.)
                </td>

                {/* ✅ Display Computed Cash Profit */}
                {netProfitAfterTax.map((npat, yearIndex) => {
                  const depreciation =
                    storedData?.computedData1?.totalDepreciationPerYear[
                      yearIndex
                    ] || 0;
                  const cashProfit = npat + depreciation;

                  const roundedValue =
                    cashProfit - Math.floor(cashProfit) <= 0.5
                      ? Math.floor(cashProfit)
                      : Math.ceil(cashProfit); // Rounding logic

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
                {financialYearLabels.map((yearLabel, yearIndex) => (
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
                {/* Empty Serial Number Column */}
                <td className="border border-black px-1 py-2 text-center font-normal text-[11px]">
                  2
                </td>

                {/* Label: DSCR (A/B) */}
                <td className="border border-black px-1 py-2 font-normal text-[11px] text-left w-1/3">
                  DSCR Ratio
                </td>

                {/* ✅ Display Computed DSCR Values for Each Year */}
                {DSCR.map((totalValue, yearIndex) => (
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
                {/* Empty Serial Number Column */}
                <td
                  className="border border-black px-1 py-2 text-center"
                  style={{ width: "85px" }}
                ></td>

                {/* Label: Average DSCR */}
                <td
                  className="border border-black px-1 py-2 text-left w-1/3"
                  style={{ borderRight: "0" }}
                >
                  Average DSCR
                </td>

                {/* ✅ Display Computed Average DSCR Value Across All Financial Year Columns */}
                <td
                  className="border border-black px-1 py-2 text-center font-extrabold text-[11px]"
                  colSpan={financialYearLabels.length} // Dynamically spans across financial years
                >
                  {formatNumber(parseFloat(averageDSCR).toFixed(2))}
                </td>
              </tr>
              {/* ✅ Current Ratio Row */}
              <tr className="font-normal text-[11px] border-0 mt-2">
                {/* Empty Serial Number Column */}
                <td className="border border-black px-1 py-2 text-center font-normal text-[11px]">
                  3
                </td>

                {/* Label: Current Ratio */}
                <td className="border border-black px-1 py-2 font-normal text-[11px] text-left w-1/3">
                  Current Ratio
                </td>

                {/* ✅ Display Computed Current Ratio for Each Year */}
                {currentRatio.map((ratio, yearIndex) => (
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
                {/* Empty Serial Number Column */}
                <td
                  className="border border-black px-1 py-2 text-center"
                  style={{ width: "85px" }}
                ></td>

                {/* Label: Average Current Ratio */}
                <td
                  className="border border-black px-1 py-2 text-left w-1/3"
                  style={{ borderRight: "0" }}
                >
                  Average Current Ratio
                </td>

                {/* ✅ Display Computed Average Current Ratio Across All Financial Year Columns */}
                <td
                  className="border border-black px-1 py-2 text-center font-extrabold text-[11px]"
                  colSpan={financialYearLabels.length} // Dynamically spans across financial years
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
                    const roundedValue =
                      adjustedAmount - Math.floor(adjustedAmount) <= 0.5
                        ? Math.floor(adjustedAmount)
                        : Math.ceil(adjustedAmount);

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
                  const balance = storedData?.marchClosingBalances[index] || 0;
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
                  let cumulativeSum = 0; // Initialize cumulative sum

                  return (
                    <tr
                      className="font-normal text-[11px] border-0 mt-2"
                      key={`liabilities-${idx}`}
                    >
                      {/* Serial Number */}
                      <td className="border border-black px-1 py-2 text-center font-normal text-[11px]">
                        {idx + 6}
                      </td>

                      {/* Label: Particular Liability Name */}
                      <td className="border border-black px-1 py-2 font-normal text-[11px] text-left w-1/3">
                        {liabilities.particular}
                      </td>

                      {/* ✅ Display Liabilities for Each Year with Cumulative Rule Applied */}
                      {Array.from({ length: projectionYears }).map(
                        (_, yearIndex) => {
                          cumulativeSum +=
                            Number(liabilities.years[yearIndex]) || 0; // Apply cumulative sum logic

                          return (
                            <td
                              key={`liability-${idx}-${yearIndex}`}
                              className="border border-black px-1 py-2 text-center font-normal text-[11px]"
                            >
                              {formatNumber(cumulativeSum)}
                            </td>
                          );
                        }
                      )}
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
                    {formatNumber(Math.round(total))}
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

              {/* ✅ Current Assets from More Details */}
              {formData?.MoreDetails?.currentAssets?.map((assets, index) => {
                let cumulativeSum = 0; // Initialize cumulative sum
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
                    {Array.from({ length: projectionYears }).map(
                      (_, yearIndex) => {
                        cumulativeSum += Number(assets.years[yearIndex]) || 0;
                        return (
                          <td
                            key={`currentAsset-${index}-${yearIndex}`}
                            className="border border-black px-1 py-2 text-center font-normal text-[11px]"
                          >
                            {formatNumber(cumulativeSum)}
                          </td>
                        );
                      }
                    )}
                  </tr>
                );
              })}

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
                    {formatNumber(Math.round(total))}
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
