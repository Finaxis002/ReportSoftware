import { calculateWorkingCapitalLoan } from "./financialCalcs";

export const CMAExtractorBS = (formData) => {
  const years = Number(formData?.ProjectReportSetting?.ProjectionYears || 5);
  const termLoanValues =
    formData?.computedData?.workingCapitalvalues?.termLoanValues || [];
  const workingCapitalLoanArr = calculateWorkingCapitalLoan(termLoanValues);
  const sundryCreditorsObj = formData.MoreDetails.currentLiabilities.find(
    (liab) => liab.particular === "Sundry Creditors / Trade Payables"
  );
  const marchClosingBalances =
    formData?.computedData?.marchClosingBalances || [];

  const repaymentMonths = parseInt(
    formData?.ProjectReportSetting?.RepaymentMonths || "0",
    10
  );
  const termLoanAmount = Number(
    formData?.MeansOfFinance?.termLoan?.termLoan || 0
  );
  function getCumulativeArr(arr) {
    let cumulative = 0;
    return arr.map((val) => (cumulative += Number(val) || 0));
  }

  const sundryCreditorsArr = sundryCreditorsObj
    ? sundryCreditorsObj.years.map(Number)
    : [];
  const repaymentValueswithin12months =
    formData?.computedData?.totalLiabilities?.repaymentValueswithin12months ||
    [];
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
  const otherCurrentLiabilitiesTotal = Array.from({ length: years }).map(
    (_, yearIndex) =>
      includedOtherLiabilitiesB.reduce(
        (sum, liab) => sum + Number(liab.years?.[yearIndex] || 0),
        0
      )
  );

  const cumulativeSundryCreditors = getCumulativeArr(sundryCreditorsArr);
  const subTotalB = Array.from({ length: years }).map(
    (_, idx) =>
      Number(cumulativeSundryCreditors[idx] || 0) +
      Number(repaymentValueswithin12months[idx] || 0) +
      Number(otherCurrentLiabilitiesTotal[idx] || 0)
  );

  const bankTermLoanArr = Array.from({ length: years }).map((_, idx) => {
    if (repaymentMonths === 0) {
      // Repayment not started, use the full loan amount for every year
      return termLoanAmount;
    } else {
      // Repayment started, subtract that year's due repayment
      const marchBalance = marchClosingBalances[idx] || 0;
      const repaymentValue = repaymentValueswithin12months[idx] || 0;
      return marchBalance - repaymentValue;
    }
  });

  const totalTermLiabilities = Array.from({ length: years }).map((_, idx) =>
    Number(bankTermLoanArr[idx] || 0)
  );

  const capital = Number(formData?.MeansOfFinance?.totalPC || 0);
  const shareCapital = Array(years).fill(capital);
  // In your cmaExtractorBS.js or similar
  const reservesAndSurplusArr = Array.from({ length: years }).map(
    (_, i) =>
      Number(
        formData?.computedData?.receivedData?.cumulativeBalanceTransferred?.[i]
      ) || 0
  );

  const netWorth = Array.from({ length: years }).map(
    (_, idx) =>
      Number(shareCapital[idx] || 0) + Number(reservesAndSurplusArr[idx] || 0)
  );

  const closingCashBalanceArray = Array.from({length: years}).map((_, i) =>
  Number(formData?.computedData?.closingCashBalanceArray?.[i] || 0 )
)

const investments = Array.from({length: years}).map((_, i)=>
  Number(formData?.MoreDetails?.currentAssets?.Investments?.[i] || 0)
)

// Utility to safely get inventory/closing stock array
 const inventoryArr = (formData) => {
  const years = Number(formData?.ProjectReportSetting?.ProjectionYears || 5);
  return Array.from({ length: years }).map((_, idx) =>
    Number(formData?.MoreDetails?.ClosingStock?.[idx]) || 0
  );
};
const currentAssetsArr = formData?.MoreDetails?.currentAssets || [];
const excludedAssetNames = [
  "Sources",
  "Investments",
  "Trade Receivables / Sundry Debtors",
];

// Filter out all excluded particulars
const includedAssets = currentAssetsArr.filter(
  (item) => !excludedAssetNames.includes(item.particular)
);
// Year-wise sum across all included assets
const otherCurrentAssetsTotal = Array.from({ length: years }).map((_, yearIdx) =>
  includedAssets.reduce(
    (sum, asset) => sum + Number(asset.years?.[yearIdx] || 0),
    0
  )
);

  console.log(" closing Cash Balance Array", closingCashBalanceArray);
  console.log("share Capital", shareCapital);

  return {
    workingCapitalLoanArr: () => workingCapitalLoanArr,
    fromOtherBanks: () => Array(years).fill(0),
    shortTermBorrowings: () => Array(years).fill(0),
    sundryCreditorsArr: () => sundryCreditorsArr,
    capitalGoods: () => Array(years).fill(0),
    taxation: () => Array(years).fill(0),
    dividend: () => Array(years).fill(0),
    statutoryLiab: () => Array(years).fill(0),
    repaymentValueswithin12months: () => repaymentValueswithin12months,
    otherCurrentLiabilitiesTotal: () => otherCurrentLiabilitiesTotal,
    subTotalB: () => subTotalB,
    debentures: () => Array(years).fill(0),
    preferenceShares: () => Array(years).fill(0),
    bankTermLoanArr: () => bankTermLoanArr,
    vehicleLoan: () => Array(years).fill(0),
    deferredTaxLiability: () => Array(years).fill(0),
    otherTermLiabilities: () => Array(years).fill(0),
    totalTermLiabilities: () => totalTermLiabilities,
    shareCapital: () => shareCapital,
    generalReserve: () => Array(years).fill(0),
    subsidy: () => Array(years).fill(0),
    otherReserve: () => Array(years).fill(0),
    reservesAndSurplusArr: () => reservesAndSurplusArr,
    netWorth: () => netWorth,
    closingCashBalanceArray: ()=>closingCashBalanceArray,
    investments: ()=> investments,
    fixedDeposits: () =>  Array(years).fill(0),
    exportsIncludingBpBd: () =>  Array(years).fill(0),
    exportReceivables: () =>  Array(years).fill(0),
    instalments: () =>  Array(years).fill(0),
    rawMaterialInventory: () =>  Array(years).fill(0),
    stockProcess: () =>  Array(years).fill(0),
    inventoryArr: ()=>inventoryArr(formData),
    consumableSpares: () =>  Array(years).fill(0),
    advancesToSuppliers: () =>  Array(years).fill(0),
    paymentOfTaxes: () =>  Array(years).fill(0),
    otherCurrentAssetsTotal: () => otherCurrentAssetsTotal,
  };
};
