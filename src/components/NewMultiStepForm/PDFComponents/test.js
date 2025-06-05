const indirectExpense = directExpense.filter(
  (expense) => expense.type === "indirect"
);

const totalIndirectExpensesArray = Array.from({
  length: parseInt(formData.ProjectReportSetting.ProjectionYears) || 0,
}).map((_, yearIndex) => {
  const totalIndirectExpenses = indirectExpense
    .filter((expense) => expense.type === "indirect")
    .reduce((sum, expense) => {
      const annual = Number(expense.total) || 0;
      const escalated = calculateExpense(annual, yearIndex);
      return sum + escalated;
    }, 0);

  const interestOnTermLoan = yearlyInterestLiabilities[yearIndex] || 0;
  const interestExpenseOnWorkingCapital =
    calculateInterestOnWorkingCapital(yearIndex);
  const depreciationExpense = totalDepreciationPerYear[yearIndex] || 0;
  const preliminaryWriteOff = preliminaryWriteOffPerYear[yearIndex] || 0; // ✅ NEW LINE

  const yearTotal =
    totalIndirectExpenses +
    interestOnTermLoan +
    interestExpenseOnWorkingCapital +
    depreciationExpense +
    preliminaryWriteOff; // ✅ ADDED HERE

  return yearTotal;
});

useEffect(() => {
  const storedProfitabilityData = {
    totalDirectExpensesArray,
    totalIndirectExpensesArray,
    calculateExpense,
  };

  localStorage.setItem(
    "storedProfitabilityData",
    JSON.stringify(storedProfitabilityData)
  );
}, [totalDirectExpensesArray, totalIndirectExpensesArray, calculateExpense]);

const indirectCount = directExpense.filter((expense) => {
  if (expense.name.trim() === "Raw Material Expenses / Purchases") {
    return false;
  }

  const isAllYearsZero = Array.from({
    length: hideFirstYear ? projectionYears - 1 : projectionYears,
  }).every((_, yearIndex) => {
    const adjustedYearIndex = hideFirstYear ? yearIndex + 1 : yearIndex;
    const expenseValue = Number(expense.total) || 0;
    return expenseValue === 0;
  });

  return expense.type === "indirect" && !isAllYearsZero;
}).length;

const renderedIndirectExpenses = directExpense.filter((expense) => {
  if (expense.name.trim() === "Raw Material Expenses / Purchases") return false;

  const isAllYearsZero = Array.from({
    length: hideFirstYear ? projectionYears - 1 : projectionYears,
  }).every((_, yearIndex) => {
    const adjustedYearIndex = hideFirstYear ? yearIndex + 1 : yearIndex;
    const escalated = calculateExpense(
      Number(expense.total) || 0,
      adjustedYearIndex
    );
    return escalated === 0;
  });

  return expense.type === "indirect" && !isAllYearsZero;
}).length;

const preliminarySerialNo = 3 + renderedIndirectExpenses + 1;

<View style={[{ borderLeftWidth: 1, borderBottom: 1 }]}>
  <View style={[styles.tableRow, styles.totalRow]}>
    <Text
      style={[
                stylesCOP.serialNoCellDetail,
                {
                  paddingVertical: "10px",

                  fontWeight: "bold",
                },
              ]}
    >
      B
    </Text>
    <Text
       style={[
                stylesCOP.detailsCellDetail,
                styleExpenses.particularWidth,
                styleExpenses.bordernone,
                {
                  paddingVertical: "10px",

                  fontWeight: "bold",
                },
              ]}
    >
      Indirect Expenses
    </Text>
   {Array.from({
              length: hideFirstYear ? projectionYears - 1 : projectionYears,
            }).map((_, yearIndex) => (
          <Text
            key={yearIndex}
                style={[
                  stylesCOP.particularsCellsDetail,
                  styleExpenses.fontSmall,
                  {
                    paddingVertical: "10px",

                    fontWeight: "bold",
                  },
                ]}
          >
            {/* You can add content here if needed */}
          </Text>
        )
    )}
  </View>
  {/* Interest On Term Loan */}
  {!isInterestOnTermLoanZero && (
    <View style={[styles.tableRow, styles.totalRow]}>
      {/* Serial Number */}
      <Text style={[
                  stylesCOP.serialNoCellDetail,
                  styleExpenses.sno,
                  styleExpenses.bordernone,
                ]}>1</Text>

      <Text
        style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                ]}
      >
        Interest On Term Loan
      </Text>

      {/* Get total projection years */}
      {Array.from({
        length: formData?.ProjectReportSetting?.ProjectionYears || 0, // Ensure ProjectionYears is defined
      }).map(
        (_, index) =>
          (!hideFirstYear || index !== 0) && (
            <Text
              key={index}
              style={[
                stylesCOP.particularsCellsDetail,
                styleExpenses.fontSmall,
              ]}
            >
              {formatNumber(
                yearlyInterestLiabilities?.[index] ?? 0 // Prevents undefined access
              )}
            </Text>
          )
      )}
    </View>
  )}
  {/* Interest on Working Capital */}
  {!isWorkingCapitalInterestZero && (
    <View style={[styles.tableRow, styles.totalRow]}>
      <Text style={stylesCOP.serialNoCellDetail}>
        {" "}
        {isInterestOnTermLoanZero ? 1 : 2}
      </Text>

      <Text
        style={[
          stylesCOP.detailsCellDetail,
          styleExpenses.particularWidth,
          styleExpenses.bordernone,
        ]}
      >
        Interest On Working Capital
      </Text>

      {/* ✅ Apply `calculateInterestOnWorkingCapital` */}
      {Array.from({
        length: formData.ProjectReportSetting.ProjectionYears,
      }).map((_, yearIndex) => {
        if (hideFirstYear && yearIndex === 0) return null; // Skip first year if hideFirstYear is true

        const calculatedInterest = calculateInterestOnWorkingCapital(yearIndex);

        return (
          <Text
            key={yearIndex}
            style={[stylesCOP.particularsCellsDetail, styleExpenses.fontSmall]}
          >
            {formatNumber(calculatedInterest)}
          </Text>
        );
      })}
    </View>
  )}
  {/* ✅ Render Depreciation Row */}
  {!isDepreciationZero && (
    <View style={[styles.tableRow, styles.totalRow]}>
      <Text style={stylesCOP.serialNoCellDetail}>
        {isWorkingCapitalInterestZero ? 2 : 3}
      </Text>
      <Text
        style={[
          stylesCOP.detailsCellDetail,
          styleExpenses.particularWidth,
          styleExpenses.bordernone,
        ]}
      >
        Depreciation
      </Text>

      {/* ✅ Display Depreciation Values for Each Year */}
      {totalDepreciationPerYear.map(
        (depreciationValue, yearIndex) =>
          (!hideFirstYear || yearIndex !== 0) && (
            <Text
              key={yearIndex}
              style={[
                stylesCOP.particularsCellsDetail,
                styleExpenses.fontSmall,
              ]}
            >
              {formatNumber(depreciationValue)}
            </Text>
          )
      )}
    </View>
  )}
  {directExpense
    .filter((expense) => {
      const isAllYearsZero = Array.from({
        length: hideFirstYear ? projectionYears - 1 : projectionYears,
      }).every((_, yearIndex) => {
        const adjustedYearIndex = hideFirstYear ? yearIndex + 1 : yearIndex;

        // Determine actual value
        let expenseValue = 0;
        const isRawMaterial =
          expense.name.trim() === "Raw Material Expenses / Purchases";
        const isPercentage = String(expense.value).trim().endsWith("%");
        const ClosingStock =
          formData?.MoreDetails?.ClosingStock?.[yearIndex] || 0;
        const OpeningStock =
          formData?.MoreDetails?.OpeningStock?.[yearIndex] || 0;

        if (isRawMaterial && isPercentage) {
          const baseValue =
            (parseFloat(expense.value) / 100) *
            (receivedtotalRevenueReceipts?.[adjustedYearIndex] || 0);
          expenseValue = baseValue + ClosingStock - OpeningStock;
        } else {
          expenseValue = Number(expense.total) || 0;
        }

        return expenseValue === 0;
      });

      return expense.type === "indirect" && !isAllYearsZero;
    })

    .map((expense, index) => {
      const annualExpense = Number(expense.total) || 0; // ✅ Use annual total directly
      const isRawMaterial =
        expense.name.trim() === "Raw Material Expenses / Purchases";
      const displayName = isRawMaterial
        ? "Purchases / RM Expenses"
        : expense.name;
      const serialNumber =
        isInterestOnTermLoanZero && isDepreciationZero
          ? index + 2
          : isWorkingCapitalInterestZero
          ? index + 3
          : index + 4;
      return (
        <View key={index} style={[styles.tableRow, styles.totalRow]}>
          <Text style={stylesCOP.serialNoCellDetail}>{serialNumber}</Text>

          <Text
            style={[
              stylesCOP.detailsCellDetail,
              styleExpenses.particularWidth,
              styleExpenses.bordernone,
            ]}
          >
            {displayName}
          </Text>

          {Array.from({
            length: hideFirstYear ? projectionYears - 1 : projectionYears,
          }).map((_, yearIndex) => {
            const adjustedYearIndex = hideFirstYear ? yearIndex + 1 : yearIndex;

            let expenseValue = 0;
            const isRawMaterial =
              expense.name.trim() === "Raw Material Expenses / Purchases";
            const isPercentage = String(expense.value).trim().endsWith("%");
            const ClosingStock =
              formData?.MoreDetails?.ClosingStock?.[yearIndex] || 0;
            const OpeningStock =
              formData?.MoreDetails?.OpeningStock?.[yearIndex] || 0;

            if (isRawMaterial && isPercentage) {
              const baseValue =
                (parseFloat(expense.value) / 100) *
                (receivedtotalRevenueReceipts?.[adjustedYearIndex] || 0);
              expenseValue = baseValue + ClosingStock - OpeningStock;
            } else {
              expenseValue = Number(expense.total) || 0;
            }

            const formattedExpense =
              isRawMaterial && isPercentage
                ? formatNumber(expenseValue.toFixed(2))
                : formatNumber(
                    calculateExpense(expenseValue, adjustedYearIndex).toFixed(2)
                  );

            return (
              <Text
                key={yearIndex}
                style={[
                  stylesCOP.particularsCellsDetail,
                  styleExpenses.fontSmall,
                ]}
              >
                {formattedExpense}
              </Text>
            );
          })}
        </View>
      );
    })}
  ;{/* ✅ Render Preliminary Row */}
  {!isPreliminaryWriteOffAllZero && (
    <View style={[styles.tableRow, styles.totalRow]}>
      <Text style={stylesCOP.serialNoCellDetail}>{preliminarySerialNo}</Text>

      <Text
        style={[
          stylesCOP.detailsCellDetail,
          styleExpenses.particularWidth,
          styleExpenses.bordernone,
        ]}
      >
        Preliminary Expenses
      </Text>

      {preliminaryWriteOffPerYear
        .slice(hideFirstYear ? 1 : 0)
        .map((value, yearIndex) => (
          <Text
            key={yearIndex}
            style={[stylesCOP.particularsCellsDetail, styleExpenses.fontSmall]}
          >
            {formatNumber(value)}
          </Text>
        ))}
    </View>
  )}
  {/* ✅ Total Indirect Expenses Row */}
  <View style={[styles.tableRow, styles.totalRow]}>
    <Text style={stylesCOP.serialNoCellDetail}></Text>
    <Text
      style={[
        stylesCOP.detailsCellDetail,
        styleExpenses.particularWidth,
        styleExpenses.bordernone,
        styles.Total,
        { paddingVertical: "10px" },
      ]}
    >
      Total
    </Text>

    {/* ✅ Display the calculated `totalIndirectExpensesArray` */}
    {totalIndirectExpensesArray.map(
      (totalValue, yearIndex) =>
        (!hideFirstYear || yearIndex !== 0) && (
          <Text
            key={yearIndex}
            style={[
              stylesCOP.particularsCellsDetail,
              stylesCOP.boldText,
              styleExpenses.fontSmall,
              styles.Total,
              { paddingVertical: "10px" },
            ]}
          >
            {formatNumber(totalValue)}
          </Text>
        )
    )}
  </View>
</View>;
