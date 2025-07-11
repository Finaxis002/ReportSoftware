import { calculateMonthsPerYear } from "./cashFlowUtils";
const calculateTotalSourcesAndUses = (formData) => {
  if (!formData) {
    console.error("FormData is undefined or null");
    return { totalSourcesArray: [], totalUsesArray: [], surplusDuringYear: [] };
  }
  const monthsPerYear = calculateMonthsPerYear(formData);
  const projectionYears = Number(formData?.ProjectReportSetting?.ProjectionYears) || 5;

  // Get values as per ProjectedCashflow
  const depreciationArray = formData?.totalDepreciationPerYear || formData?.computedData1?.totalDepreciationPerYear || [];
  const preliminaryWriteOffArray = formData?.CostOfProject?.preliminaryWriteOffPerYear || [];
  const promotersCapital = Number(formData?.MeansOfFinance?.totalPC || 0);
  const bankTermLoan = Number(formData?.MeansOfFinance?.termLoan?.termLoan || 0);
  const workingCapitalLoan = Number(formData?.MeansOfFinance?.workingCapital?.termLoan || 0);

  // 1. Use correct fixed assets (use exactly what your ProjectedCashflow passes in prop)
  const firstYearGrossFixedAssets =
    Number(formData?.firstYearGrossFixedAssets) ||
    Number(formData?.CostOfProject?.firstYearGrossFixedAssets) ||
    Object.values(formData?.CostOfProject || {})
      .filter(
        (item) =>
          item &&
          typeof item === "object" &&
          "cost" in item &&
          item.name !== "preliminaryExpensesTotal" &&
          item.name !== "preliminaryWriteOffYears" &&
          item.name !== "preliminaryWriteOffPerYear"
      )
      .reduce((sum, item) => sum + Number(item.cost || 0), 0);

  // 2. Net Profit Before Tax
  const netProfitBeforeTaxArr = Array.from({ length: projectionYears }).map(
    (_, index) =>
      Number(
        formData?.netProfitBeforeTax?.[index] ||
          formData?.computedData?.netProfitBeforeTax?.[index] ||
          0
      )
  );

  // 3. Current Liabilities
  const currentLiabilitiesArr = Array.from({ length: projectionYears }).map(
    (_, index) =>
      (formData?.MoreDetails?.currentLiabilities || []).reduce(
        (sum, liab) => sum + Number(liab.years?.[index] || 0),
        0
      )
  );

  // 4. Current Assets (exclude inventory)
  const currentAssetsArr = Array.from({ length: projectionYears }).map(
    (_, index) =>
      (formData?.MoreDetails?.currentAssets || [])
        .filter(
          (asset) =>
            asset.particular !== "Inventory" && Array.isArray(asset.years)
        )
        .reduce((sum, asset) => sum + Number(asset.years?.[index] || 0), 0)
  );

  // 5. Depreciation: already in depreciationArray
  // 6. Preliminary Expenses written off: already in preliminaryWriteOffArray

  // 7. Inventory (Closing - Opening)
  const inventoryArr = Array.from({ length: projectionYears }).map((_, index) =>
    Number(formData?.MoreDetails?.ClosingStock?.[index] || 0) -
    Number(formData?.MoreDetails?.OpeningStock?.[index] || 0)
  );

  // 8. Withdrawals
  const withdrawalsArr = Array.from({ length: projectionYears }).map((_, index) =>
    Number(formData?.MoreDetails?.Withdrawals?.[index] || 0)
  );

  // 9. Income Tax
  const incomeTaxArr = Array.from({ length: projectionYears }).map((_, index) =>
    Number(formData?.incomeTaxCalculation?.incomeTaxCalculation?.[index] || 0)
  );

  // 10. Repayment and Interest
  const repaymentOfTermLoanArr = Array.from({ length: projectionYears }).map(
    (_, index) => Number(formData?.yearlyPrincipalRepayment?.[index] || 0)
  );
  const interestOnTermLoanArr = Array.from({ length: projectionYears }).map(
    (_, index) => Number(formData?.yearlyInterestLiabilities?.[index] || 0)
  );

  // 11. Interest on Working Capital (same formula as ProjectedCashflow)
  const moratoriumPeriodMonths =
    Number(formData?.ProjectReportSetting?.MoratoriumPeriod) || 0;
  const principal =
    Number(formData.MeansOfFinance?.workingCapital?.termLoan) || 0;
  const wcRate = Number(formData.ProjectReportSetting?.interestOnWC) || 0;
  const annualInterestAmount = (principal * wcRate) / 100;
  const firstRepaymentYearIndex = monthsPerYear.findIndex((months) => months > 0);
  const calcInterestOnWorkingCapital = (yearIndex) => {
    const monthsInYear = monthsPerYear[yearIndex] || 0;
    if (monthsInYear === 0) return 0;
    if (
      yearIndex === firstRepaymentYearIndex &&
      (moratoriumPeriodMonths > 0 || monthsInYear < 12)
    ) {
      return (annualInterestAmount * monthsInYear) / 12;
    }
    return annualInterestAmount;
  };

  // *** THE CRUCIAL PART: Calculate NPBIT ***
  const netProfitBeforeInterestAndTaxes = Array.from({ length: projectionYears }).map((_, yearIndex) => {
    const profitBeforeTax = netProfitBeforeTaxArr[yearIndex];
    const interestOnTermLoan = interestOnTermLoanArr[yearIndex];
    const interestOnWorkingCapitalValue = calcInterestOnWorkingCapital(yearIndex);
    return profitBeforeTax + interestOnTermLoan + interestOnWorkingCapitalValue;
  });

  // SOURCES
  const totalSourcesArray = Array.from({ length: projectionYears }).map(
    (_, index) =>
      netProfitBeforeInterestAndTaxes[index] +
      (index === 0 ? promotersCapital : 0) +
      (index === 0 ? bankTermLoan : 0) +
      (index === 0 ? workingCapitalLoan : 0) +
      (depreciationArray[index] || 0) +
      currentLiabilitiesArr[index] +
      (preliminaryWriteOffArray[index] || 0)
  );

  // USES
  const totalUsesArray = Array.from({ length: projectionYears }).map(
    (_, index) => {
      const sanitize = (val) => (val < 0 ? 0 : val);
      return (
        sanitize(index === 0 ? firstYearGrossFixedAssets : 0) +
        sanitize(repaymentOfTermLoanArr[index]) +
        sanitize(interestOnTermLoanArr[index]) +
        sanitize(calcInterestOnWorkingCapital(index)) +
        sanitize(withdrawalsArr[index]) +
        sanitize(incomeTaxArr[index]) +
        sanitize(currentAssetsArr[index]) +
        sanitize(inventoryArr[index]) +
        // Preliminary Expenses FULL (not amortization) only in year 1
        sanitize(index === 0 ? Number(formData?.CostOfProject?.preliminaryExpensesTotal || 0) : 0)
      );
    }
  );

  // SURPLUS
  const surplusDuringYear = totalSourcesArray.map((src, idx) => src - totalUsesArray[idx]);
  return { totalSourcesArray, totalUsesArray, surplusDuringYear };
};
export { calculateTotalSourcesAndUses };
