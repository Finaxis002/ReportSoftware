export const extractChartData = (formData) => {
  const years = ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5"];

  const revenue = formData.computedData?.totalRevenueReceipts || [];
  const expenses = formData.computedData?.totalExpense || [];

  // const pieData = formData.Expenses?.directExpense?.map((item) => ({
  //   name: item.name || item.label,
  //   value: item.value,
  // })) || [];
let pieData = formData.Expenses?.directExpense?.map((item) => ({
  name: item.name || item.label,
  value: item.value,
})) || [];

// ---- Add this: calculate and include Total Expected Salary ----

const totalExpectedSalary =
  formData.Expenses?.normalExpense?.reduce((total, form) => {
    const amount = parseFloat(form.amount) || 0;
    const quantity = parseFloat(form.quantity) || 0;
    return total + amount * quantity * 12;
  }, 0) || 0;

if (totalExpectedSalary > 0) {
  pieData.push({
    name: "Total Expected Salary",
    value: totalExpectedSalary,
  });
}

  const dscr = formData.computedData?.dscr?.DSCR || [];
  const currentRatio = formData.computedData?.assetsliabilities?.CurrentAssetsArray?.map((val, i) => {
    const liabilities = formData.computedData?.assetsliabilities?.yearlycurrentLiabilities?.[i] || 1;
    return Number((val / liabilities).toFixed(2));
  }) || [];

  return {
    years,
    revenue,
    expenses,
    pieData,
    dscr,
    currentRatio,
  };
};
