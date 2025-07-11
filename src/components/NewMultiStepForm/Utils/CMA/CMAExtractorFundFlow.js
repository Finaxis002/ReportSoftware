import { calculateTotalSourcesAndUses } from './surplusDuringYear'; 

export const CMAExtractorFundFlow = (formData) => {
 

    const { totalSourcesArray, totalUsesArray, surplusDuringYear } =
    calculateTotalSourcesAndUses(formData) || { totalSourcesArray: [], totalUsesArray: [], surplusDuringYear: [] };

  console.log('surplusDuringYear:', surplusDuringYear); 
  const years = Number(formData?.ProjectReportSetting?.ProjectionYears || 5);
  const netProfitBeforeTax =
    formData?.computedData?.computedData?.netProfitBeforeTax || [];
  const promotersCapital = Number(formData?.MeansOfFinance?.totalPC || 0);
  const bankTermLoan = Number(
    formData?.MeansOfFinance?.termLoan?.termLoan || 0
  );
  const promotersCapitalArray = Array.from({ length: years }).map((_, idx) =>
    idx === 0 ? promotersCapital : 0
  );

  const bankTermLoanArray = Array.from({ length: years }).map((_, idx) =>
    idx === 0 ? bankTermLoan : 0
  );

  const subtotalB= Array.from({length:years}).map((_, idx)=>(
    Number(promotersCapitalArray[idx] || 0)+
     Number( bankTermLoanArray[idx] || 0)
  ))

  const workingCapitalLoan = Number(formData.MeansOfFinance?.workingCapital?.termLoan || 0);
  const workingCapitalArr = Array.from({length:years}).map((_, idx)=>(
    idx ===  0 ? workingCapitalLoan : 0 
  ))

  const currentLiabilities = formData?.MoreDetails?.currentLiabilities || [];

// Excluded items
const excludedParticulars = [
  "Sundry Creditors / Trade Payables",
  "Short term loans",
  "Quasi Equity",
];

// Filter out excluded items and include dynamically added fields (i.e., those with `isCustom: true`)
const includedCurrentLiabilities = currentLiabilities.filter(
  (liab) =>
    !excludedParticulars.includes(liab.particular) &&
    (!liab.isCustom || liab.isCustom) // Include if `isCustom` is true
);

// Now, compute year-wise totals for the included liabilities
const totalCurrentLiabilities = Array.from({ length: years }).map((_, yearIndex) =>
  includedCurrentLiabilities.reduce(
    (sum, liab) => sum + Number(liab.years?.[yearIndex] || 0),
    0
  )
);

const grossFixedAssetsPerYear = formData?.computedData?.grossFixedAssetsPerYear || [];
const firstYearGrossFixedAssets = Array.from({length: years}).map((_, idx)=>(
    idx === 0 ? grossFixedAssetsPerYear[0] :0 
))
const repaymentOfTermLoan = formData?.computedData?.yearlyPrincipalRepayment || [];
const subTotalD = Array.from({length:years}).map((_,idx)=>(
    Number(firstYearGrossFixedAssets[idx] || 0)+
    Number(repaymentOfTermLoan[idx] || 0)
))

const inventory = Array.from({
    length: formData.MoreDetails.OpeningStock.length,
  }).map((_, yearIndex) => {
    const ClosingStock = formData?.MoreDetails?.ClosingStock?.[yearIndex] || 0;
    const OpeningStock = formData?.MoreDetails?.OpeningStock?.[yearIndex] || 0;
    const finalStock = ClosingStock - OpeningStock;

    return finalStock;
  });

const sundryDebitorsObj = formData?.MoreDetails?.currentAssets?.find((asset)=>
asset.particular === 'Trade Receivables / Sundry Debtors'
)

const sundryDebitorsArr = sundryDebitorsObj? sundryDebitorsObj.years.map(Number) : [];

const currentAssets = formData?.MoreDetails?.currentAssets || [];
const excludedParticularsAssets = [
  "Trade Receivables / Sundry Debtors"
];
const includedCurrentAssets = currentAssets.filter(
  (liab) =>
    !excludedParticularsAssets.includes(liab.particular) &&
    (!liab.isCustom || liab.isCustom) // Include if `isCustom` is true
);

// Now, compute year-wise totals for the included liabilities
const totalCurrentAssets = Array.from({ length: years }).map((_, yearIndex) =>
  includedCurrentAssets.reduce(
    (sum, liab) => sum + Number(liab.years?.[yearIndex] || 0),
    0
  )
);

const SubTotalE = Array.from({length:years}).map((_, idx)=>(
  Number(inventory[idx] || 0)+
  Number(sundryDebitorsArr[idx] || 0)+
  Number(totalCurrentAssets[idx] || 0)
))
 
const withdrawals = formData?.MoreDetails?.Withdrawals || 0 ;



console.log('withdrawals', withdrawals)
console.log('inventory', inventory)

  return {
    netProfitBeforeTax: () => netProfitBeforeTax,
    dividendsPaid: () => Array(years).fill(0),
    promotersCapital: () => promotersCapitalArray,
    bankTermLoan: () => bankTermLoanArray,
    fillZero: () => Array(years).fill(0),
    subtotalB: ()=> subtotalB,
    workingCapitalLoan: ()=>workingCapitalArr,
    totalCurrentLiabilities: () => totalCurrentLiabilities,
    firstYearGrossFixedAssets: ()=>firstYearGrossFixedAssets,
    repaymentOfTermLoan: ()=>repaymentOfTermLoan,
    subTotalD: ()=>subTotalD,
    inventory: ()=>inventory,
    sundryDebitorsArr: ()=> sundryDebitorsArr,
    totalCurrentAssets: ()=>totalCurrentAssets,
    SubTotalE:()=>SubTotalE,
    withdrawals: ()=>withdrawals,
  };
};
