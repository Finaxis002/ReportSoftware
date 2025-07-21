import { calculateWorkingCapitalLoan } from "./financialCalcs";
import { CMAExtractorBS } from "./CMAExtractorBS";
import {  makeCMAExtractors } from "./cmaExtractors";

export const CMAExtractorFinPos = (formData) => {
   const BSextractors = CMAExtractorBS(formData);
    const extractors = makeCMAExtractors(formData);
  const years = Number(formData?.ProjectReportSetting?.ProjectionYears || 5);
  const totalRevenueReceipt = formData?.computedData?.totalRevenueReceipts || [] ;

  const repaymentValueswithin12months =
    formData?.computedData?.totalLiabilities?.repaymentValueswithin12months || [];
  const termLoanValues =
    formData?.computedData?.workingCapitalvalues?.termLoanValues || [];
  const workingCapitalLoanArr = calculateWorkingCapitalLoan(termLoanValues);
  console.log('workingCapitalLoanArr', workingCapitalLoanArr)

  const currentLiabilities =
    formData?.computedData?.assetsliabilities?.yearlycurrentLiabilities || [];

  const currentAssets =
    formData?.computedData?.assetsliabilities?.CurrentAssetsArray || [];


    // Correct current ratio array calculation
  const currentRatioArr = Array.from({ length: years }).map((_, idx) => {
    const asset = Number(currentAssets[idx] || 0);
    const liability = Number(currentLiabilities[idx] || 0);
    if (!liability || liability === 0) return "-";
    return (asset / liability).toFixed(2);
  });

  const middleData = Array.from({ length: years }).map(
    (_, idx) =>
      Number(currentLiabilities[idx] || 0) -
      Number(repaymentValueswithin12months[idx] || 0) -
      Number(workingCapitalLoanArr[idx] || 0)
  );

  const netWorkingCapital = Array.from({ length: years }).map(
    (_, idx) => Number(currentAssets[idx] || 0) - Number(middleData[idx] || 0)
  );
  const grossProfit =  formData?.computedData?.computedData?.grossProfitValues || 0 ;

   const reservesArr =
    formData?.computedData?.receivedData?.cumulativeBalanceTransferred || [];
  const paidUpCapital = Number(formData?.MeansOfFinance?.totalPC) || 0;

  // Calculate Net Worth per year
  const netWorthArr = Array.from({ length: years }).map((_, idx) => {
    const reserves = Number(reservesArr[idx] || 0);
    return paidUpCapital + Math.max(reserves, 0); // Net Worth = Capital + (Reserves, only if > 0)
  });

  

const bankTermLoanArr = BSextractors.bankTermLoanArr() || [];


const totalDebtArr = Array.from({ length: years }).map((_, idx) => {
    const termLoan = Number( bankTermLoanArr[idx]) || 0;
    const workingCapitalLoan = Number(workingCapitalLoanArr[idx] || 0);
    const repaymentDue = Number(repaymentValueswithin12months[idx] || 0);
    return termLoan + workingCapitalLoan + repaymentDue;
  });
  
   // // Calculate Debt-Equity Ratio per year
  const debtEquityArr = Array.from({ length: years }).map((_, idx) => {
    const totalDebt = totalDebtArr[idx] || 0;
    const netWorth = netWorthArr[idx] || 0;
    if (!netWorth || netWorth === 0) return "-";
    return (totalDebt / netWorth).toFixed(2);
  });

 
  const cumulativeCurrentLiabilitiesArr = [];
let cumulativeCurrentLiabilities = 0;

for (let idx = 0; idx < years; idx++) {
  const currentYearLiabilities = (formData?.MoreDetails?.currentLiabilities ?? [])
    .filter((liability) => liability.particular !== "Quasi Equity")
    .reduce((sum, liability) => sum + (Number(liability.years?.[idx]) || 0), 0);

  cumulativeCurrentLiabilities += currentYearLiabilities;
  cumulativeCurrentLiabilitiesArr.push(cumulativeCurrentLiabilities);
}


const totalOutsideLiabilitiesArr = Array.from({ length: years }).map((_, idx) => {
  return totalDebtArr[idx] + cumulativeCurrentLiabilitiesArr[idx];
});
const totalOutsideLiabilitiesNetWorthRatio = totalOutsideLiabilitiesArr.map((tol, idx) => {
  const netWorth = netWorthArr[idx] || 1;
  return (tol / netWorth).toFixed(2);
});

const grossProfitDivNetWorthRatio = Array.from({ length: years }).map((_, idx) => {
  const grossProfit1 = grossProfit[idx] || 1;
  const netWorth = netWorthArr[idx] || 1;
  return (grossProfit1 / netWorth).toFixed(2);
}
 
);

 const netProfitAfterTax = extractors.netProfitAfterTax() || [];
 console.log('netProfitAfterTax', netProfitAfterTax)
const netProfitDivNetWorthRatio = Array.from({ length: years }).map((_, idx) => {
  const netProfitAfterTax1 = netProfitAfterTax[idx] || 1;
  const netWorth = netWorthArr[idx] || 1;
  return ((netProfitAfterTax1 / netWorth)*100).toFixed(2);
}
);

const netProfitDivNetWorthRatioArr = Array.from({ length: years }).map((_, idx) => (
  Number(netProfitDivNetWorthRatio[idx])
)
);

const interestOnTermLoan = formData?.computedData?.yearlyInterestLiabilities ;
console.log('interestOnTermLoan', interestOnTermLoan)



  return {
    netWorkingCapital: () => netWorkingCapital,
    grossProfit: ()=> grossProfit,
    fillZero:() => Array(years).fill(0),
    currentRatioArr:() => currentRatioArr,
    // currentRatio:()=>currentRatio,
    debtEquityArr: ()=>debtEquityArr,
    totalOutsideLiabilitiesNetWorthRatio:()=>totalOutsideLiabilitiesNetWorthRatio,
     grossProfitDivNetWorthRatio: ()=> grossProfitDivNetWorthRatio,
     netProfitDivNetWorthRatioArr:()=>netProfitDivNetWorthRatioArr,
     totalRevenueReceipt:()=>totalRevenueReceipt,
     interestOnTermLoan:()=>interestOnTermLoan,
  };
};
