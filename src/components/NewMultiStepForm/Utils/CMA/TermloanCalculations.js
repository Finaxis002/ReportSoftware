// termLoanCalculations.js

export function calculateTermLoanRepayment({
  termLoan,
  interestRate, // As decimal, e.g. 0.12 for 12%
  moratoriumPeriod, // months (number)
  repaymentMonths,  // months (number)
  startMonthName = "April",
  financialYearStart = 2025,
}) {
  const months = [
    "April", "May", "June", "July", "August", "September",
    "October", "November", "December", "January", "February", "March"
  ];
  let startMonthIndex = months.indexOf(startMonthName);
  if (startMonthIndex === -1) startMonthIndex = 0;

  let remainingBalance = Number(termLoan);
  let elapsedMonths = 0;
  let monthsLeft = Number(repaymentMonths);
  let effectiveRepaymentMonths = Number(repaymentMonths) - Number(moratoriumPeriod);
  let fixedPrincipalRepayment = effectiveRepaymentMonths > 0
    ? remainingBalance / effectiveRepaymentMonths
    : 0;
  let data = [];

  while (monthsLeft > 0) {
    let yearData = [];
    let firstMonth = data.length === 0 ? startMonthIndex : 0;
    for (let i = firstMonth; i < 12; i++) {
      if (elapsedMonths >= repaymentMonths) break;

      let principalOpeningBalance = remainingBalance;
      let isMoratorium = elapsedMonths < moratoriumPeriod;
      let principalRepayment = isMoratorium ? 0 : fixedPrincipalRepayment;
      let principalClosingBalance = Math.max(
        0,
        principalOpeningBalance - principalRepayment
      );
      let interestLiability = principalOpeningBalance * (interestRate / 12);
      let totalRepayment = principalRepayment + interestLiability;

      yearData.push({
        month: months[i],
        principalOpeningBalance,
        principalRepayment,
        principalClosingBalance,
        interestLiability,
        totalRepayment,
      });

      remainingBalance = principalClosingBalance;
      elapsedMonths++;
      monthsLeft--;
      if (elapsedMonths >= repaymentMonths) break;
    }
    if (yearData.length > 0) {
      data.push(yearData);
    }
  }

  // Process year-wise sums for UI or reporting
  const yearlyPrincipalRepayment = data.map(yearData =>
    yearData.reduce((sum, entry) => sum + entry.principalRepayment, 0)
  );
  const yearlyInterestLiabilities = data.map(yearData =>
    yearData.reduce((sum, entry) => sum + (entry.principalRepayment === 0 ? 0 : entry.interestLiability), 0)
  );
  const yearlyTotalRepayment = data.map(yearData =>
    yearData.reduce((sum, entry) => sum + entry.totalRepayment, 0)
  );
  const marchClosingBalances = data.map(yearData => {
    const march = yearData.find(e => e.month === "March");
    return march ? march.principalClosingBalance : 0;
  });

  return {
    data, // All details: [ [month1, month2, ...], [year2...], ... ]
    yearlyPrincipalRepayment,
    yearlyInterestLiabilities,
    yearlyTotalRepayment,
    marchClosingBalances
  };
}
