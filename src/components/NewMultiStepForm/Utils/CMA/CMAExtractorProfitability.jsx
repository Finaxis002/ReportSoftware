

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
      const totalRevenueForOthers = formData?.Revenue?.totalRevenueForOthers || [] ;
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
     const revenueReducePercentage = localStorage.getItem('revenueReducePercentage') 
    ? parseFloat(localStorage.getItem('revenueReducePercentage')) 
    : 10;
    // console.log("revenueReducePercentage", revenueReducePercentage);
  
    const value10reduceRevenueReceipt = Array.from({
      length: projectionYears,
    }).map((_, idx) => Number(totalRevenueReceipt[idx] * (revenueReducePercentage / 100)));
  
    // const newRevenueReceipt = Array.from({ length: projectionYears }).map(
    //   (_, idx) =>
    //     Number(totalRevenueReceipt[idx] || 0) -
    //     Number(value10reduceRevenueReceipt[idx] || 0)
    // );
     const newRevenueReceipt = Array.from({ length: projectionYears }).map(
      (_, idx) =>
        Number(totalRevenueForOthers[idx] || 0) -
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

//expense increase by 10% 
//  const OriginalRevenueValues = Array.from({length: projectionYears}).map((_, i)=>
//     Number(totalRevenueReceipt[i] || 0 )+
//     Number(ClosingStock[i] || 0) -
//     Number(OpeningStock[i] || 0)
// )

 const OriginalRevenueValues = Array.from({length: projectionYears}).map((_, i)=>
    Number(totalRevenueForOthers[i] || 0 )+
    Number(ClosingStock[i] || 0) -
    Number(OpeningStock[i] || 0)
)



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
        revenueReducePercentage:()=>revenueReducePercentage,
        OriginalRevenueValues:()=>OriginalRevenueValues
    }
}


