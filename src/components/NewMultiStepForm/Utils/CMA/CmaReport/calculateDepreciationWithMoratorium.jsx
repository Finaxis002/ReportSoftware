export const calculateDepreciationWithMoratorium = (
  assetValue,
  depreciationRate,
  moratoriumPeriodMonths,
  startingMonth,
  projectionYears
) => {
  const yearlyDepreciation = new Array(projectionYears).fill(0);
  let remainingValue = assetValue;

  for (let year = 0; year < projectionYears; year++) {
    const monthsToDepreciate =
      year === 0
        ? Math.max(12 - startingMonth - moratoriumPeriodMonths, 0)
        : year === 1 && moratoriumPeriodMonths > 12 - startingMonth
        ? Math.min(12, moratoriumPeriodMonths - (12 - startingMonth))
        : 12;

    const annualDepreciation = remainingValue * depreciationRate;
    const proratedDepreciation = (annualDepreciation / 12) * monthsToDepreciate;

    yearlyDepreciation[year] = proratedDepreciation;
    remainingValue -= proratedDepreciation;
  }

  return { yearlyDepreciation };
};
