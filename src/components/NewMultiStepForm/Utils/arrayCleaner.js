// src/utils/arrayCleaner.js
export const cleanFormDataArrays = (formData) => {
  if (!formData) return formData;
  
  // Get projection years from form data
  const projectionYears = parseInt(
    formData.ProjectReportSetting?.ProjectionYears?.value || 
    formData.ProjectReportSetting?.ProjectionYears ||
    5
  );
  
  const expectedLength = projectionYears + 1; // Year 0 + projection years
  const cleanedData = JSON.parse(JSON.stringify(formData));
  
  // Arrays to clean
  const arraysToClean = [
    "totalExpense",
    "totalDepreciation",
    "totalRevenueReceipts",
    "totalDirectExpensesArray",
    "grossFixedAssetsPerYear",
    "marchClosingBalances",
    "yearlyInterestLiabilities",
    "yearlyPrincipalRepayment",
    "closingCashBalanceArray",
    "interestOnWorkingCapital",
  ];
  
  // Clean each array
  arraysToClean.forEach(key => {
    if (Array.isArray(cleanedData[key]) && cleanedData[key].length > expectedLength) {
      cleanedData[key] = cleanedData[key].slice(0, expectedLength);
    }
  });
  
  // Clean nested arrays
  if (cleanedData.workingCapitalvalues?.termLoanValues) {
    if (cleanedData.workingCapitalvalues.termLoanValues.length > expectedLength) {
      cleanedData.workingCapitalvalues.termLoanValues = 
        cleanedData.workingCapitalvalues.termLoanValues.slice(0, expectedLength);
    }
  }
  
  // Clean computedData arrays
  ["computedData", "computedData1"].forEach(dataKey => {
    if (cleanedData[dataKey]) {
      Object.keys(cleanedData[dataKey]).forEach(key => {
        if (Array.isArray(cleanedData[dataKey][key])) {
          if (cleanedData[dataKey][key].length > expectedLength) {
            cleanedData[dataKey][key] = cleanedData[dataKey][key].slice(0, expectedLength);
          }
        }
      });
    }
  });
  
  return cleanedData;
};