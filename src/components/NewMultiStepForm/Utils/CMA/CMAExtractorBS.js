import {calculateWorkingCapitalLoan} from './financialCalcs'

export const CMAExtractorBS = (formData) =>{
const years = Number(formData?.ProjectReportSetting?.ProjectionYears || 5);
    const termLoanValues = formData?.computedData?.workingCapitalvalues?.termLoanValues || [];
    const workingCapitalLoanArr = calculateWorkingCapitalLoan(termLoanValues);
    const sundryCreditorsObj = formData.MoreDetails.currentLiabilities.find(
  (liab) => liab.particular === "Sundry Creditors / Trade Payables"
);
const sundryCreditorsArr = sundryCreditorsObj ? sundryCreditorsObj.years.map(Number) : [];
const repaymentValueswithin12months = formData?.computedData?.totalLiabilities?.repaymentValueswithin12months || [];
const currentLiabilitiesArr = formData?.MoreDetails?.currentLiabilities || [];

// (Use this if you want to sum all other rows)
const excludedParticulars = [
  "Sundry Creditors / Trade Payables",
  "Short term loans",
];
const includedOtherLiabilitiesB = currentLiabilitiesArr.filter(
  (liab) => !excludedParticulars.includes(liab.particular)
);

// Now, compute year-wise totals:
const otherCurrentLiabilitiesTotal = Array.from({ length: years }).map((_, yearIndex) =>
  includedOtherLiabilitiesB.reduce(
    (sum, liab) => sum + Number(liab.years?.[yearIndex] || 0),
    0
  )
);

console.log('included Other Liabilities B', includedOtherLiabilitiesB)
console.log('current Liabilities Arr', currentLiabilitiesArr)
console.log('other Current Liabilities Total', otherCurrentLiabilitiesTotal)
return{
    workingCapitalLoanArr : () => workingCapitalLoanArr,
    fromOtherBanks: () => Array(years).fill(0),
    shortTermBorrowings: () =>  Array(years).fill(0),
    sundryCreditorsArr: () => sundryCreditorsArr,
    capitalGoods: ()=> Array(years).fill(0),
    taxation: () => Array(years).fill(0),
    dividend: () => Array(years).fill(0),
    statutoryLiab: ()=>Array(years).fill(0),
    repaymentValueswithin12months: ()=>repaymentValueswithin12months,
    otherCurrentLiabilitiesTotal: ()=> otherCurrentLiabilitiesTotal
}

}