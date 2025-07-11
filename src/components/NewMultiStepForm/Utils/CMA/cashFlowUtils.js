// cashflowUtils.js
const monthMap = {
  April: 1,
  May: 2,
  June: 3,
  July: 4,
  August: 5,
  September: 6,
  October: 7,
  November: 8,
  December: 9,
  January: 10,
  February: 11,
  March: 12,
};

export function calculateMonthsPerYear(formData) {
  const projectionYears = Number(formData?.ProjectReportSetting?.ProjectionYears) || 5;
  const selectedMonth = formData?.ProjectReportSetting?.SelectStartingMonth || "April";
  const moratoriumPeriodMonths = parseInt(formData?.ProjectReportSetting?.MoratoriumPeriod) || 0;
  const x = monthMap[selectedMonth];
  let monthsArray = [];
  let remainingMoratorium = moratoriumPeriodMonths;

  for (let year = 1; year <= projectionYears; year++) {
    let monthsInYear = 12;
    if (year === 1) {
      monthsInYear = 12 - x + 1;
    }

    if (remainingMoratorium >= monthsInYear) {
      monthsArray.push(0);
      remainingMoratorium -= monthsInYear;
    } else {
      monthsArray.push(monthsInYear - remainingMoratorium);
      remainingMoratorium = 0;
    }
  }
  return monthsArray;
}
