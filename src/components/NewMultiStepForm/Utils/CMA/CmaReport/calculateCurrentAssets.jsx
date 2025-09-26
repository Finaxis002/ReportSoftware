// src/utils/currentAssetsCalculator.js

/**
 * Calculate current assets from formData
 * Current Assets = Trade Receivables / Sundry Debtors + Inventory + Other Current Assets + Cash & Cash Equivalent
 * @param {Object} formData - The form data object
 * @param {Array} closingCashBalanceArray - Array of closing cash balances for each year (REQUIRED)
 * @returns {Object} - Object containing CurrentAssetsArray and other calculated values
 */
export const calculateCurrentAssets = (formData, closingCashBalanceArray = []) => {
  if (!formData) {
    return { CurrentAssetsArray: [] };
  }

  const years = Number(formData?.ProjectReportSetting?.ProjectionYears || 5);

  // Safely extract data from formData
  const currentAssetsArr = formData?.MoreDetails?.currentAssets || [];
  const closingStock = formData?.MoreDetails?.ClosingStock || Array(years).fill(0);

  // Find sundry debtors (Trade Receivables / Sundry Debtors)
  const sundryDebtorsObj = currentAssetsArr.find(
    asset => asset.particular === 'Trade Receivables / Sundry Debtors'
  );
  const sundryDebtors = sundryDebtorsObj
    ? sundryDebtorsObj.years.map(Number)
    : Array(years).fill(0);

  // Excluded asset names - exclude Investments and Inventory (handled separately)
  const excludedAssetNames = [
    "Sources",
    "Investments",
    "Trade Receivables / Sundry Debtors",
    "Inventory"
  ];

  // Filter out excluded particulars to get other current assets
  const includedAssets = currentAssetsArr.filter(
    item => !excludedAssetNames.includes(item.particular)
  );

  // Calculate year-wise sum for other current assets
  const otherCurrentAssetsTotal = Array.from({ length: years }).map((_, yearIdx) =>
    includedAssets.reduce(
      (sum, asset) => sum + Number(asset.years?.[yearIdx] || 0),
      0
    )
  );

  // Calculate cumulative sum for other current assets
  const cumulativeOtherCurrentAssetsTotal = [];
  let cumulativeOther = 0;
  for (let i = 0; i < years; i++) {
    cumulativeOther += Number(otherCurrentAssetsTotal[i] || 0);
    cumulativeOtherCurrentAssetsTotal.push(cumulativeOther);
  }

  // Calculate cumulative sundry debtors
  const cumulativeSundryDebtors = [];
  let cumulativeDebtors = 0;
  for (let i = 0; i < years; i++) {
    cumulativeDebtors += Number(sundryDebtors[i] || 0);
    cumulativeSundryDebtors.push(cumulativeDebtors);
  }

  // Calculate total current assets for each year
  // Current Assets = Cash & Cash Equivalent + Trade Receivables + Inventory + Other Current Assets
  const CurrentAssetsArray = Array.from({ length: years }).map((_, i) => {
    const cashBalance = Number(closingCashBalanceArray[i] || 0); // Cash & Cash Equivalent
    const inventory = Number(closingStock[i] || 0); // Inventory
    const otherAssets = Number(cumulativeOtherCurrentAssetsTotal[i] || 0); // Other Current Assets
    const debtors = Number(cumulativeSundryDebtors[i] || 0); // Trade Receivables / Sundry Debtors

    console.log(`Year ${i + 1} Current Assets:`, {
      cashBalance,
      inventory,
      otherAssets,
      debtors,
      total: cashBalance + inventory + otherAssets + debtors
    });

    return cashBalance + inventory + otherAssets + debtors;
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
 * @returns {Array} - Array of current assets values for each year
 */
export const getCurrentAssetsArray = (formData, closingCashBalanceArray = []) => {
  const result = calculateCurrentAssets(formData, closingCashBalanceArray);
  return result.CurrentAssetsArray;
};

/**
 * Debug function to see what's happening in the calculation
 */
export const debugCurrentAssetsCalculation = (formData, closingCashBalanceArray = []) => {
  const years = Number(formData?.ProjectReportSetting?.ProjectionYears || 5);

  console.log('=== DEBUG Current Assets Calculation ===');
  console.log('Years:', years);
  console.log('Closing Cash Balance:', closingCashBalanceArray);

  const currentAssetsArr = formData?.MoreDetails?.currentAssets || [];
  console.log('Current Assets from formData:', currentAssetsArr);

  const closingStock = formData?.MoreDetails?.ClosingStock || Array(years).fill(0);
  console.log('Closing Stock:', closingStock);

  const result = calculateCurrentAssets(formData, closingCashBalanceArray);
  console.log('Final Current Assets Array:', result.CurrentAssetsArray);

  return result;
};