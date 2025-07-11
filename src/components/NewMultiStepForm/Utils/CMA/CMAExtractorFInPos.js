import { calculateWorkingCapitalLoan } from "./financialCalcs";

export const CMAExtractorFinPos = (formData) => {
  const years = Number(formData?.ProjectReportSetting?.ProjectionYears || 5);

  const repaymentValueswithin12months =
    formData?.computedData?.totalLiabilities?.repaymentValueswithin12months || [];
  const termLoanValues =
    formData?.computedData?.workingCapitalvalues?.termLoanValues || [];
  const workingCapitalLoanArr = calculateWorkingCapitalLoan(termLoanValues);

  const currentLiabilities =
    formData?.computedData?.assetsliabilities?.yearlycurrentLiabilities || [];

  const currentAssets =
    formData?.computedData?.assetsliabilities?.CurrentAssetsArray || [];

    const currentRatio = Array.from({length:years}).map((_,idx)=>(
      Number(currentAssets(idx)) / Number(currentLiabilities(idx))
    ))

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

  return {
    netWorkingCapital: () => netWorkingCapital,
    grossProfit: ()=> grossProfit,
    fillZero:() => Array(years).fill(0),
    currentRatio:()=>currentRatio,
  };
};
