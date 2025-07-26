import { calculateDepreciationWithMoratorium } from "./calculateDepreciationWithMoratorium";

export const calculateTotalDepreciationPerYear = (
  formData,
  moratoriumPeriodMonths,
  projectionYears,
  startingMonth
) => {
  return Array.from({ length: projectionYears }).map((_, yearIndex) => {
    return Object.entries(formData.CostOfProject).reduce(
      (sum, [key, asset]) => {
        const assetValue = asset.amount || 0;
        const depreciationRate = asset.rate / 100 || 0;
        const { yearlyDepreciation } = calculateDepreciationWithMoratorium(
          assetValue,
          depreciationRate,
          moratoriumPeriodMonths,
          startingMonth,
          projectionYears
        );
        return sum + yearlyDepreciation[yearIndex];
      },
      0
    );
  });
};
