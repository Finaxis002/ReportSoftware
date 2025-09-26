// src/utils/currentAssetsCalculator.js

/**
 * Calculate current assets from formData (matches RatioAnalysis logic)
 * @param {Object} formData - The form data object
 * @param {Array} closingCashBalanceArray - Array of closing cash balances for each year (REQUIRED)
 * @param {Array} investments - Array of investments for each year (REQUIRED)
 * @returns {Object} - Object containing CurrentAssetsArray and other calculated values
 */
export const calculateCurrentAssets = (formData, closingCashBalanceArray = [], investments = []) => {
  if (!formData) {
    return { CurrentAssetsArray: [] };
  }
  
  const years = Number(formData?.ProjectReportSetting?.ProjectionYears || 5);
  
  // Safely extract data from formData - match exactly what works in RatioAnalysis
  const currentAssetsArr = formData?.MoreDetails?.currentAssets || [];
  const closingStock = formData?.MoreDetails?.ClosingStock || Array(years).fill(0);

  // Find sundry debtors - same as RatioAnalysis
  const sundryDebtorsObj = currentAssetsArr.find(
    asset => asset.particular === 'Trade Receivables / Sundry Debtors'
  );
  const sundryDebtors = sundryDebtorsObj 
    ? sundryDebtorsObj.years.map(Number) 
    : Array(years).fill(0);

  // Excluded asset names - same as RatioAnalysis
  const excludedAssetNames = [
    "Sources",
    "Investments", 
    "Trade Receivables / Sundry Debtors",
  ];

  // Filter out excluded particulars and calculate other current assets - same as RatioAnalysis
  const includedAssets = currentAssetsArr.filter(
    item => !excludedAssetNames.includes(item.particular)
  );

  // Calculate year-wise sum for other current assets - same as RatioAnalysis
  const otherCurrentAssetsTotal = Array.from({ length: years }).map((_, yearIdx) =>
    includedAssets.reduce(
      (sum, asset) => sum + Number(asset.years?.[yearIdx] || 0),
      0
    )
  );

  // ✅ FIX 1: Calculate cumulative sum for other current assets CORRECTLY
  const cumulativeOtherCurrentAssetsTotal = [];
  let cumulativeOther = 0;
  for (let i = 0; i < years; i++) {
    cumulativeOther += Number(otherCurrentAssetsTotal[i] || 0);
    cumulativeOtherCurrentAssetsTotal.push(cumulativeOther);
  }

  // ✅ FIX 2: Calculate cumulative sundry debtors CORRECTLY
  const cumulativeSundryDebtors = [];
  let cumulativeDebtors = 0;
  for (let i = 0; i < years; i++) {
    cumulativeDebtors += Number(sundryDebtors[i] || 0);
    cumulativeSundryDebtors.push(cumulativeDebtors);
  }

  // ✅ FIX 3: Calculate total current assets for each year - USE THE CORRECT VALUES
  const CurrentAssetsArray = Array.from({ length: years }).map((_, i) => {
    // These must match what's in your working RatioAnalysis component
    const cashBalance = Number(closingCashBalanceArray[i] || 0);
    const investment = Number(investments[i] || 0);
    const inventory = Number(closingStock[i] || 0);
    const otherAssets = Number(cumulativeOtherCurrentAssetsTotal[i] || 0);
    const debtors = Number(cumulativeSundryDebtors[i] || 0);

    console.log(`Year ${i}:`, {
      cashBalance,
      investment,
      inventory,
      otherAssets,
      debtors,
      total: cashBalance + investment + inventory + otherAssets + debtors
    });

    return cashBalance + investment + inventory + otherAssets + debtors;
  });

  return {
    CurrentAssetsArray,
    cumulativeSundryDebtors,
    cumulativeOtherCurrentAssetsTotal,
    sundryDebtors,
    closingStock,
    otherCurrentAssets: otherCurrentAssetsTotal
  };
};

/**
 * Simple function to get just the current assets array
 * @param {Object} formData - The form data object
 * @param {Array} closingCashBalanceArray - REQUIRED from computed data
 * @param {Array} investments - REQUIRED from form data
 * @returns {Array} - Array of current assets values for each year
 */
export const getCurrentAssetsArray = (formData, closingCashBalanceArray = [], investments = []) => {
  const result = calculateCurrentAssets(formData, closingCashBalanceArray, investments);
  return result.CurrentAssetsArray;
};

/**
 * Debug function to see what's happening in the calculation
 */
export const debugCurrentAssetsCalculation = (formData, closingCashBalanceArray = [], investments = []) => {
  const years = Number(formData?.ProjectReportSetting?.ProjectionYears || 5);
  
  console.log('=== DEBUG Current Assets Calculation ===');
  console.log('Years:', years);
  console.log('Closing Cash Balance:', closingCashBalanceArray);
  console.log('Investments:', investments);
  
  const currentAssetsArr = formData?.MoreDetails?.currentAssets || [];
  console.log('Current Assets from formData:', currentAssetsArr);
  
  const closingStock = formData?.MoreDetails?.ClosingStock || Array(years).fill(0);
  console.log('Closing Stock:', closingStock);
  
  const result = calculateCurrentAssets(formData, closingCashBalanceArray, investments);
  console.log('Final Current Assets Array:', result.CurrentAssetsArray);
  
  return result;
};