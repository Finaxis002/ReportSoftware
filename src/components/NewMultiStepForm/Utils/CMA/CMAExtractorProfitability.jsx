
import { useMemo } from "react";
import { calculateWorkingCapitalLoan } from "./financialCalcs";
import { CMAExtractorBS } from "./CMAExtractorBS";
import {  makeCMAExtractors } from "./cmaExtractors";
import { CMAExtractorFinPos } from "./CMAExtractorFInPos";
import { CMAExtractorFundFlow } from "./CMAExtractorFundFlow";import {
  getMonthsPerYear,
  calculateEscalatedExpense,
  calculateRawMaterialExpense,
  getFringeAndAnnualCalculation,
  filterActiveDirectExpenses,
  depreciation,
  calculateCostOfSalesData,
  calculateInterestOnWorkingCapital,
  totalRevenueReceipts,
} from "./financialCalcs";

export const CMAExtractorProfitability = (formData) => {
     const projectionYears =
     parseInt(formData.ProjectReportSetting.ProjectionYears) || 5;
     const rateOfExpense =
    (formData?.ProjectReportSetting?.rateOfExpense || 0) / 100;
  const moratoriumPeriodMonths =
    parseInt(formData?.ProjectReportSetting?.MoratoriumPeriod) || 0;
 
  const startingMonth =
    formData?.ProjectReportSetting?.SelectStartingMonth || "April";
     const monthsPerYear = getMonthsPerYear(
    projectionYears,
    moratoriumPeriodMonths,
    startingMonth
  );
     const FinPosextractors = CMAExtractorFinPos(formData);
    const FundFlowExtractor = CMAExtractorFundFlow(formData);
    const totalRevenueReceipt = FinPosextractors.totalRevenueReceipt() || [];
    console.log("totalRevenueReceipt", totalRevenueReceipt);
  
    const value10reduceRevenueReceipt = Array.from({
      length: projectionYears,
    }).map((_, idx) => Number(totalRevenueReceipt[idx] * 0.1));
  
    const newRevenueReceipt = Array.from({ length: projectionYears }).map(
      (_, idx) =>
        Number(totalRevenueReceipt[idx] || 0) -
        Number(value10reduceRevenueReceipt[idx] || 0)
    );
  

    const ClosingStock = formData?.MoreDetails?.ClosingStock || 0;
  const OpeningStock = formData?.MoreDetails?.OpeningStock || 0;
//   const adjustedRevenueValues = Array.from({
//     length: parseInt(projectionYears) || 0,
//   }).map((_, yearIndex) => {
//     const totalRevenue = newRevenueReceipt[yearIndex] || 0;
//     return totalRevenue + Number(ClosingStock) - Number(OpeningStock); // ✅ Final computation
//   });

  const adjustedRevenueValues = Array.from({length: projectionYears}).map((_, i)=>
    Number(newRevenueReceipt[i] || 0 )+
    Number(ClosingStock[i] || 0) -
    Number(OpeningStock[i] || 0)
)




  const grossProfit = formData?.computedData?.computedData?.grossProfitValues || [];
  const interestOnTermLoan = formData?.computedData?.yearlyInterestLiabilities || [];

const interestOnWC = calculateInterestOnWorkingCapital(
    formData,
    moratoriumPeriodMonths,
    monthsPerYear
  );

  const interestOnWCArray = Array.from({ length: projectionYears }).map((_, yearIdx) =>
    interestOnWC(yearIdx)
  );

  const depreciation = formData?.computedData?.totalDepreciation || [];
  const netProfitBeforeTax = formData?.computedData?.computedData?.netProfitBeforeTax || [];
  const incomeTaxCalculation = formData?.computedData?.incomeTaxCalculation?.incomeTaxCalculation || [];
  const netProfitAfterTax = formData?.computedData?.computedData?.netProfitAfterTax || [];
  const Withdrawals = formData?.MoreDetails?.Withdrawals || [];

  const balanceTrfBalncSheet = Array.from({length:projectionYears}).map((_,idx)=>
    Number(netProfitAfterTax[idx] || 0)-
    Number(Withdrawals[idx] || 0)
)

const cumulativeBalanceTransferred = formData?.computedData?.receivedData?.cumulativeBalanceTransferred || [];

const cashProfit = formData?.computedData?.computedData?.cashProfitArray || [];



    return{
        value10reduceRevenueReceipt:()=>value10reduceRevenueReceipt,
        newRevenueReceipt:()=>newRevenueReceipt,
        ClosingStock:()=>ClosingStock,
        OpeningStock:()=>OpeningStock,
        adjustedRevenueValues:()=>adjustedRevenueValues,
        grossProfit:()=>grossProfit,
        interestOnTermLoan:()=>interestOnTermLoan,
        interestOnWCArray: () => interestOnWCArray,
        depreciation:() => depreciation,
        netProfitBeforeTax:()=>netProfitBeforeTax,
        incomeTaxCalculation:()=>incomeTaxCalculation,
        netProfitAfterTax:()=>netProfitAfterTax,
        Withdrawals:()=>Withdrawals,
        balanceTrfBalncSheet:()=>balanceTrfBalncSheet,
        cumulativeBalanceTransferred:()=>cumulativeBalanceTransferred,
        cashProfit:()=>cashProfit,
    }
}


// Defensive defaults for props that may be undefined
//   formData = formData || {};
//   normalExpense = normalExpense || [];
//   directExpense = directExpense || [];
//   totalDepreciationPerYear = totalDepreciationPerYear || [];
//   yearlyInterestLiabilities = yearlyInterestLiabilities || [];

//   fringAndAnnualCalculation = fringAndAnnualCalculation || 0;
//   financialYearLabels = financialYearLabels || [];
//   receivedtotalRevenueReceipts = receivedtotalRevenueReceipts || [];

//   useEffect(() => {
//     if (yearlyInterestLiabilities.length > 0) {
//       //  console.log("✅ Updated Yearly Interest Liabilities in State:", yearlyInterestLiabilities);
//     }
//   }, [yearlyInterestLiabilities]); // ✅ Runs when state update

//   const activeRowIndex = 0; // Define it or fetch dynamically if needed

//   const projectionYears =
//     parseInt(formData.ProjectReportSetting.ProjectionYears) || 0;

//   const indirectExpense = (directExpense || []).filter(
//     (expense) => expense.type === "indirect"
//   );

//   const months = [
//     "April",
//     "May",
//     "June",
//     "July",
//     "August",
//     "September",
//     "October",
//     "November",
//     "December",
//     "January",
//     "February",
//     "March",
//   ];

//   // Month Mapping
//   const monthMap = {
//     April: 1,
//     May: 2,
//     June: 3,
//     July: 4,
//     August: 5,
//     September: 6,
//     October: 7,
//     November: 8,
//     December: 9,
//     January: 10,
//     February: 11,
//     March: 12,
//   };

//   const selectedMonth =
//     formData?.ProjectReportSetting?.SelectStartingMonth || "April";
//   const x = monthMap[selectedMonth]; // Starting month mapped to FY index

//   const moratoriumPeriodMonths =
//     parseInt(formData?.ProjectReportSetting?.MoratoriumPeriod) || 0;

//   const rateOfExpense =
//     (formData?.ProjectReportSetting?.rateOfExpense || 0) / 100;

//   // ✅ Calculate Interest on Working Capital for each projection year
//   const interestOnWorkingCapital = Array.from({
//     length: parseInt(formData.ProjectReportSetting.ProjectionYears) || 0,
//   }).map(() => {
//     const workingCapitalLoan =
//       Number(formData.MeansOfFinance.workingCapital.termLoan) || 0;
//     const interestRate =
//       Number(formData.ProjectReportSetting.interestOnTL) || 0;

//     // ✅ Annual Interest Calculation
//     return (workingCapitalLoan * interestRate) / 100;
//   });

//   const hideFirstYear = shouldHideFirstYear(receivedtotalRevenueReceipts);
//   // Function to handle moratorium period spillover across financial years
//   const calculateMonthsPerYear = () => {
//     let monthsArray = [];
//     let remainingMoratorium = moratoriumPeriodMonths;
//     for (let year = 1; year <= projectionYears; year++) {
//       let monthsInYear = 12;
//       if (year === 1) {
//         monthsInYear = 12 - x + 1; // Months left in the starting year
//       }

//       if (remainingMoratorium >= monthsInYear) {
//         monthsArray.push(0); // Entire year under moratorium
//         remainingMoratorium -= monthsInYear;
//       } else {
//         monthsArray.push(monthsInYear - remainingMoratorium); // Partial moratorium impact
//         remainingMoratorium = 0;
//       }
//     }
//     return monthsArray;
//   };
//   const monthsPerYear = calculateMonthsPerYear();

//   const isZeroValue = (val) => {
//     const num = Number(val);
//     return !num || num === 0; // covers 0, null, undefined, NaN, ""
//   };

//   // Check if all Interest On Term Loan values are zero or falsy
//   const isInterestOnTermLoanZero = (yearlyInterestLiabilities || [])
//     .slice(hideFirstYear ? 1 : 0)
//     .every((val) => isZeroValue(val));

//   // Check if all Depreciation values are zero or falsy
//   const isDepreciationZero = (totalDepreciationPerYear || [])
//     .slice(hideFirstYear ? 1 : 0)
//     .every((val) => isZeroValue(val));

//   const calculateInterestOnWorkingCapital = useMemo(() => {
//     //  console.log("moratorium month", moratoriumPeriodMonths);

//     const principal =
//       Number(formData.MeansOfFinance?.workingCapital?.termLoan) || 0;
//     const rate = Number(formData.ProjectReportSetting?.interestOnWC) || 0;
//     const annualInterestAmount = (principal * rate) / 100;

//     const firstRepaymentYearIndex = monthsPerYear.findIndex(
//       (months) => months > 0
//     );

//     return (yearIndex) => {
//       const monthsInYear = monthsPerYear[yearIndex] || 0;
//       //  console.log(`Year ${yearIndex + 1} months: ${monthsInYear}`);
//       if (monthsInYear === 0) {
//         // Entire year in moratorium, no interest
//         return 0;
//       }

//       if (
//         yearIndex === firstRepaymentYearIndex &&
//         (moratoriumPeriodMonths > 0 || monthsInYear < 12)
//       ) {
//         const prorated = (annualInterestAmount * monthsInYear) / 12;
//         //  console.log(`Year ${yearIndex + 1} prorated interest:`, prorated);
//         return prorated;
//       }

//       return annualInterestAmount;
//     };
//   }, [formData, moratoriumPeriodMonths, monthsPerYear]);

//   const isWorkingCapitalInterestZero = Array.from({
//     length: projectionYears,
//   }).every((_, yearIndex) => {
//     const calculatedInterest = calculateInterestOnWorkingCapital(yearIndex);
//     return calculatedInterest === 0;
//   });

//   const moratoriumPeriod = formData?.ProjectReportSetting?.MoratoriumPeriod;

//   // Function to calculate the expense for each year considering the increment rate
//   const calculateExpense = (annualExpense, yearIndex) => {
//     const monthsInYear = monthsPerYear[yearIndex];
//     let incrementedExpense;
//     // Count years with actual repayment for applying increment correctly
//     const repaymentYear = monthsPerYear
//       .slice(0, yearIndex)
//       .filter((months) => months > 0).length;

//     if (monthsInYear === 0) {
//       incrementedExpense = 0; // No expense during moratorium
//     } else {
//       incrementedExpense =
//         annualExpense * Math.pow(1 + rateOfExpense, repaymentYear);
//     }
//     return (incrementedExpense / 12) * monthsInYear;
//   };

//   const calculateRawMaterialExpense = (
//     expense,
//     receivedtotalRevenueReceipts,
//     yearIndex
//   ) => {
//     const isRawMaterial =
//       expense.name.trim() === "Raw Material Expenses / Purchases";
//     const isPercentage = String(expense.value).trim().endsWith("%");

//     const ClosingStock = Number(
//       formData?.MoreDetails?.ClosingStock?.[yearIndex] || 0
//     );
//     const OpeningStock = Number(
//       formData?.MoreDetails?.OpeningStock?.[yearIndex] || 0
//     );

//     let expenseValue = 0;

//     if (isRawMaterial && isPercentage) {
//       const baseValue =
//         (parseFloat(expense.value) / 100) *
//         (receivedtotalRevenueReceipts?.[yearIndex] || 0);
//       expenseValue = baseValue + ClosingStock - OpeningStock; // Ensure it's a sum of numbers
//     } else {
//       expenseValue = num(expense.total); // Ensure we use num() to prevent string concatenation
//     }

//     return expenseValue;
//   };
//   const totalDirectExpensesArray = Array.from({
//     length: projectionYears,
//   }).map((_, yearIndex) => {
//     let directRows = [];
//     // 1. All regular direct expenses, escalated if required
//     const directTotal = (directExpense || [])
//       .filter((expense) => expense.type === "direct")
//       .reduce((sum, expense) => {
//         let value;
//         if (
//           expense.name.trim() === "Raw Material Expenses / Purchases" &&
//           String(expense.value).trim().endsWith("%")
//         ) {
//           value = calculateRawMaterialExpense(
//             expense,
//             receivedtotalRevenueReceipts,
//             yearIndex
//           );
//         } else {
//           value = calculateExpense(Number(expense.total) || 0, yearIndex); // PATCHED!
//         }
//         directRows.push({ name: expense.name, value });
//         return sum + value;
//       }, 0);

//     // 2. Salary/wages (from normalExpense, always only one row)
//     let salaryTotal = 0;
//     if (Array.isArray(normalExpense) && normalExpense.length > 0) {
//       salaryTotal = calculateExpense(
//         Number(fringAndAnnualCalculation) || 0,
//         yearIndex
//       );
//     }

//     // 3. Advance expenses of type "direct"
//     let advanceDirectTotal = 0;
//     if (
//       Array.isArray(formData?.Expenses?.advanceExpenses) &&
//       formData.Expenses.advanceExpenses.length > 0
//     ) {
//       advanceDirectTotal = formData.Expenses.advanceExpenses
//         .filter((row) => row.type === "direct" && row.name && row.values)
//         .reduce((sum, row) => {
//           const value =
//             row.values?.[financialYearLabels[yearIndex]] ??
//             row.values?.[yearIndex] ??
//             0;
//           directRows.push({
//             name: row.name + " (Advance)",
//             value: Number(value) || 0,
//           });
//           return sum + (Number(value) || 0);
//         }, 0);
//     }

//     // LOGGING the row values for this year:
//     // console.log(`Direct Expense Breakdown for Year ${yearIndex + 1}:`);
//     // directRows.forEach((row, i) =>
//     //   console.log(`   ${i + 1}. ${row.name}: ${row.value}`)
//     // );
//     // console.log(`   Salary and Wages: ${salaryTotal}`);
//     // console.log(
//     //   `   Total Direct (sum): ${directTotal + salaryTotal + advanceDirectTotal}`
//     // );

//     // FINAL direct expenses for this year
//     return directTotal + salaryTotal + advanceDirectTotal;
//   });

//   const preliminaryExpensesTotal = Number(
//     formData?.CostOfProject?.preliminaryExpensesTotal || 0
//   );

//   const preliminaryWriteOffYears = Number(
//     formData?.CostOfProject?.preliminaryWriteOffYears || 0
//   );

//   // Calculate yearly write-off value
//   const yearlyWriteOffAmount =
//     preliminaryWriteOffYears > 0
//       ? preliminaryExpensesTotal / preliminaryWriteOffYears
//       : 0;

//   // Generate the array for yearly values
//   const preliminaryWriteOffPerYear = Array.from({
//     length: projectionYears,
//   }).map((_, index) => {
//     const startIndex = hideFirstYear ? 1 : 0;
//     const endIndex = startIndex + preliminaryWriteOffYears;

//     // 👇 Only insert value if it's within the write-off window
//     if (index >= startIndex && index < endIndex) {
//       return yearlyWriteOffAmount;
//     }

//     // 👇 Insert 0 for all other years (including hidden first year)
//     return 0;
//   });


//   const totalIndirectExpensesArray = Array.from({
//       length: parseInt(formData.ProjectReportSetting.ProjectionYears) || 0,
//     }).map((_, yearIndex) => {
//       let indirectRows = [];
//       // 1. All regular indirect expenses, escalated if required
//       const indirectTotal = indirectExpense
//         .filter((expense) => expense.type === "indirect")
//         .reduce((sum, expense) => {
//           const annual = Number(expense.total) || 0;
//           const escalated = calculateExpense(annual, yearIndex);
//           indirectRows.push({ name: expense.name, value: escalated });
//           return sum + escalated;
//         }, 0);
  
//       // 2. Advance expenses of type "indirect"
//       let advanceIndirectTotal = 0;
//       if (
//         Array.isArray(formData?.Expenses?.advanceExpenses) &&
//         formData.Expenses.advanceExpenses.length > 0
//       ) {
//         advanceIndirectTotal = formData.Expenses.advanceExpenses
//           .filter((row) => row.type === "indirect" && row.name && row.values)
//           .reduce((sum, row) => {
//             const value =
//               row.values?.[financialYearLabels[yearIndex]] ??
//               row.values?.[yearIndex] ??
//               0;
//             indirectRows.push({
//               name: row.name + " (Advance)",
//               value: Number(value) || 0,
//             });
//             return sum + (Number(value) || 0);
//           }, 0);
//       }
  
//       // 3. Interest, Depreciation, Write-off (rest as before)
//       // const interestOnTermLoan = yearlyInterestLiabilities[yearIndex] || 0;
//       const interestOnTermLoan =
//         formData.computedData.assetsliabilities.yearlycurrentLiabilities || 0;
//       const interestExpenseOnWorkingCapital =
//         calculateInterestOnWorkingCapital(yearIndex);
//       const depreciationExpense = totalDepreciationPerYear[yearIndex] || 0;
//       const preliminaryWriteOff = preliminaryWriteOffPerYear[yearIndex] || 0;
  
//       // FINAL indirect expenses for this year
//       return (
//         indirectTotal +
//         advanceIndirectTotal +
//         interestOnTermLoan +
//         interestExpenseOnWorkingCapital +
//         depreciationExpense +
//         preliminaryWriteOff
//       );
//     });
  
//     const workingCapitalLoan = formData?.MeansOfFinance?.workingCapital?.termLoan; // Loan amount
//     const interestRate = formData?.ProjectReportSetting?.rateOfInterest / 100; // Convert % to decimal
  
//     const startMonthIndex = months.indexOf(
//       formData.ProjectReportSetting.SelectStartingMonth
//     );
  
//     // ✅ Ensure a valid starting month
//     const repaymentStartMonth = startMonthIndex !== -1 ? startMonthIndex : 0;
  
//     // ✅ Compute Interest on Working Capital
//     useEffect(() => {
//       if (workingCapitalLoan > 0) {
//         const computedInterest = Array.from({ length: projectionYears }).map(
//           (_, yearIndex) => {
//             const monthsInYear = yearIndex === 0 ? 12 - repaymentStartMonth : 12;
//             return workingCapitalLoan * interestRate * (monthsInYear / 12);
//           }
//         );
  
//         // console.log("✅ Computed Interest on Working Capital:", computedInterest);
  
//         // ✅ If Parent Function Exists, Update Parent Component
//         if (setInterestOnWorkingCapital) {
//           setInterestOnWorkingCapital(computedInterest);
//         }
//       }
//     }, [workingCapitalLoan, interestRate, projectionYears, repaymentStartMonth]);
  
//     // ✅ Compute Adjusted Revenue Values for Each Year Before Rendering
    
  
//     // ✅ Step 2: Compute Gross Profit Values for Each Year After `totalDirectExpenses` is Defined
    
  
    
  
//     // Precompute Balance Transferred to Balance Sheet
//     const balanceTransferred = netProfitAfterTax.map(
//       (npbt, yearIndex) =>
//         npbt - (formData.MoreDetails.Withdrawals?.[yearIndex] || 0)
//     );
  
//     // Precompute Cumulative Balance Transferred to Balance Sheet
//     const cumulativeBalanceTransferred = [];
//     balanceTransferred.forEach((amount, index) => {
//       if (index === 0) {
//         cumulativeBalanceTransferred.push(Math.max(amount, 0)); // First year, just the amount itself
//       } else {
//         // For subsequent years, sum of Balance Trf. and previous year's Cumulative Balance
//         cumulativeBalanceTransferred.push(
//           Math.max(amount + cumulativeBalanceTransferred[index - 1], 0)
//         );
//       }
//     });
  
//     // ✅ Compute Cash Profit for Each Year
//     const cashProfitArray = netProfitAfterTax.map((npat, yearIndex) => {
//       const depreciation = totalDepreciationPerYear[yearIndex] || 0;
  
//       // ✅ Correctly Compute Cash Profit
//       const cashProfit = npat + depreciation;
  
//       // ✅ Round values correctly
//       return cashProfit;
//     });
  
//     useEffect(() => {
//       if (cumulativeBalanceTransferred.length > 0) {
//         // Pass the data directly as an object
//         handleDataSend({
//           cumulativeBalanceTransferred,
//         });
//       }
//       // console.log("cummulative data", cumulativeBalanceTransferred);
//     }, [JSON.stringify(cumulativeBalanceTransferred)]);

//      useEffect(() => {
//         const storedProfitabilityData = {
//           totalDirectExpensesArray,
//           totalIndirectExpensesArray,
//           calculateExpense,
//         };
    
//         localStorage.setItem(
//           "storedProfitabilityData",
//           JSON.stringify(storedProfitabilityData)
//         );
//       }, [totalDirectExpensesArray, totalIndirectExpensesArray, calculateExpense]); // Runs when these values change
    
//       useEffect(() => {
//         const storedData = localStorage.getItem("storedProfitabilityData");
//         if (storedData) {
//           const parsedData = JSON.parse(storedData);
//           // console.log("Retrieved Data:", parsedData);
//         }
//       }, []);
    

//        const isPreliminaryWriteOffAllZero = Array.from({
//     length: hideFirstYear ? projectionYears - 1 : projectionYears,
//   }).every((_, yearIndex) => {
//     const adjustedYearIndex = hideFirstYear ? yearIndex + 1 : yearIndex;
//     return preliminaryWriteOffPerYear[adjustedYearIndex] === 0;
//   });

//   const renderedIndirectExpenses = directExpense.filter((expense) => {
//     if (expense.name.trim() === "Raw Material Expenses / Purchases")
//       return false;

//     const isAllYearsZero = Array.from({
//       length: hideFirstYear ? projectionYears - 1 : projectionYears,
//     }).every((_, yearIndex) => {
//       const adjustedYearIndex = hideFirstYear ? yearIndex + 1 : yearIndex;
//       const escalated = calculateExpense(
//         Number(expense.total) || 0,
//         adjustedYearIndex
//       );
//       return escalated === 0;
//     });

//     return expense.type === "indirect" && !isAllYearsZero;
//   }).length;

//   const preliminarySerialNo = 3 + renderedIndirectExpenses + 1; 


//    //   new data
//     const FinPosextractors = CMAExtractorFinPos(formData);
//     const FundFlowExtractor = CMAExtractorFundFlow(formData);
//     const totalRevenueReceipt = FinPosextractors.totalRevenueReceipt() || [];
//     console.log("totalRevenueReceipt", totalRevenueReceipt);
  
//     const value10reduceRevenueReceipt = Array.from({
//       length: projectionYears,
//     }).map((_, idx) => Number(totalRevenueReceipt[idx] * 0.1));
  
//     const newRevenueReceipt = Array.from({ length: projectionYears }).map(
//       (_, idx) =>
//         Number(totalRevenueReceipt[idx] || 0) -
//         Number(value10reduceRevenueReceipt[idx] || 0)
//     );
  
//     const adjustedRevenueValues = Array.from({
//       length: parseInt(formData?.ProjectReportSetting?.ProjectionYears) || 0,
//     }).map((_, yearIndex) => {
//       const totalRevenue = newRevenueReceipt[yearIndex] || 0;
//       const ClosingStock = formData?.MoreDetails?.ClosingStock?.[yearIndex] || 0;
//       const OpeningStock = formData?.MoreDetails?.OpeningStock?.[yearIndex] || 0;
  
//       return totalRevenue + Number(ClosingStock) - Number(OpeningStock); // ✅ Final computation
//     });
  
//     const grossProfitValues = adjustedRevenueValues.map(
//       (adjustedRevenue, yearIndex) => {
//         const totalDirectExpenses = totalDirectExpensesArray[yearIndex] || 0; // Ensure the expenses for the specific year are used
//         return adjustedRevenue - totalDirectExpenses; // Subtract expenses from adjusted revenue to get gross profit
//       }
//     );
  
//     // ✅ Precompute Net Profit Before Tax (NPBT) for Each Year Before Rendering
//     const netProfitBeforeTax = grossProfitValues.map((grossProfit, yearIndex) => {
//       // Subtracting totalIndirectExpensesArray and other expenses like interest, depreciation etc.
//       const totalIndirectExpenses = totalIndirectExpensesArray[yearIndex] || 0; // Ensure indirect expenses are considered
//       return grossProfit - totalIndirectExpenses; // Net Profit Before Tax (NPBT)
//     });
  
//     // ✅ Precompute Income Tax Calculation for Each Year Before Rendering
//     const incomeTaxCalculation = netProfitBeforeTax.map((npbt, yearIndex) => {
//       return (npbt * formData.ProjectReportSetting.incomeTax) / 100;
//     });
  
//     // ✅ Precompute Net Profit After Tax (NPAT) for Each Year Before Rendering
//     const netProfitAfterTax = netProfitBeforeTax.map((npat, yearIndex) => {
//       return npat - incomeTaxCalculation[yearIndex]; // ✅ Correct subtraction
//     });