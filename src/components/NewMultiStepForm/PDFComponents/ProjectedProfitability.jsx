import React from "react";
import { Page, View, Text } from "@react-pdf/renderer";
import { styles, stylesCOP, stylesMOF, styleExpenses } from "./Styles"; // Import only necessary styles
import { Font } from "@react-pdf/renderer";

// ✅ Register a Font That Supports Bold
Font.register({
  family: "Roboto",
  fonts: [
    { src: "https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Me5Q.ttf" }, // Regular
    {
      src: "https://fonts.gstatic.com/s/roboto/v20/KFOlCnqEu92Fr1MmEU9vAw.ttf",
      fontWeight: "bold",
    }, // Bold
  ],
});

const ProjectedProfitability = ({
  formData,
  localData,
  normalExpense,
  directExpense,
  totalDepreciationPerYear,
}) => {
  // Ensure formData and Expenses exist before destructuring

  // console.log("total depreciation per year : ", totalDepreciationPerYear);

  const activeRowIndex = 0; // Define it or fetch dynamically if needed

  const totalAnnualWages = normalExpense.reduce(
    (sum, expense) => sum + Number(expense.amount * expense.quantity * 12 || 0),
    0
  );

  const formatAmountInIndianStyle = (amount) => {
    return amount.toLocaleString("en-IN"); // Format as per Indian number system
  };

  // ✅ Precompute Multiplication for Each Year Before Rendering
  const totalRevenueReceipts = Array.from({
    length: parseInt(formData.ProjectReportSetting.ProjectionYears) || 0,
  }).map((_, yearIndex) => {
    return formData.Revenue.formFields.reduce(
      (product, item) => product * (item.years?.[yearIndex] || 1),
      1 // Start with 1, because multiplying by 0 gives 0
    );
  });

  // ✅ Precompute Total Adjusted Revenue for Each Year Before Rendering
  // total revenue receipt + Closing STock - Opening Stock
  const adjustedRevenueValues = Array.from({
    length: parseInt(formData.ProjectReportSetting.ProjectionYears) || 0,
  }).map((_, yearIndex) => {
    // Get total revenue for this year
    const totalRevenue = formData.Revenue?.formFields?.reduce(
      (product, item) => product * (item.years?.[yearIndex] || 1),
      1 // Start with 1, because multiplying by 0 gives 0
    );

    // Get closing and opening stock for this year
    const closingStock =
      Number(formData.MoreDetails?.closingStock?.[yearIndex]) || 0;
    const openingStock =
      Number(formData.MoreDetails?.openingStock?.[yearIndex]) || 0;

    // Compute Adjusted Revenue
    return totalRevenue + closingStock - openingStock;
  });

  // ✅ Precompute Total Direct Expenses (Including Salary & Wages) for Each Year Before Rendering
  const totalDirectExpenses = Array.from({
    length: parseInt(formData.ProjectReportSetting.ProjectionYears) || 0,
  }).map((_, yearIndex) => {
    // ✅ Compute Salary & Wages for this year
    const salaryAndWages =
      yearIndex === 0
        ? Number(totalAnnualWages) || 0 // Year 1: Use base value
        : (Number(totalAnnualWages) || 0) *
          Math.pow(
            1 + formData.ProjectReportSetting.rateOfExpense / 100,
            yearIndex
          ); // Apply growth for subsequent years

    // ✅ Compute Total Direct Expenses for this year (Including Salary & Wages)
    const directExpensesTotal = directExpense
      ?.filter((expense) => expense.type === "direct")
      ?.reduce((sum, expense) => {
        const baseValue = Number(expense.value) || 0;
        const annualizedValue = baseValue * 12; // Convert monthly to annual
        return (
          sum +
          annualizedValue *
            Math.pow(
              1 + formData.ProjectReportSetting.rateOfExpense / 100,
              yearIndex
            )
        );
      }, 0);

    return salaryAndWages + directExpensesTotal; // ✅ Total Direct Expenses (Including Salary & Wages)
  });

// ✅ Precompute Total Indirect Expenses for Each Year Before Rendering
const totalIndirectExpenses = Array.from({
  length: parseInt(formData.ProjectReportSetting.ProjectionYears) || 0,
}).map((_, yearIndex) => {
  // Compute total indirect expenses from directExpense
  let indirectExpenseTotal = directExpense
    ?.filter((expense) => expense.type === "indirect")
    ?.reduce((sum, expense) => {
      const baseValue = Number(expense.value) || 0;
      const annualizedValue = baseValue * 12; // Convert monthly to annual
      return (
        sum +
        annualizedValue *
          Math.pow(1 + formData.ProjectReportSetting.rateOfExpense / 100, yearIndex)
      );
    }, 0);

  // ✅ Add Depreciation for this year
  return indirectExpenseTotal + (totalDepreciationPerYear[yearIndex] || 0);
});


  // ✅ Precompute Gross Profit for Each Year Before Rendering
  const grossProfitValues = Array.from({
    length: parseInt(formData.ProjectReportSetting.ProjectionYears) || 0,
  }).map((_, yearIndex) => {
    // Get Adjusted Revenue (Total Revenue + Closing Stock - Opening Stock)
    const adjustedRevenue =
      (formData.Revenue?.formFields?.reduce(
        (product, item) => product * (item.years?.[yearIndex] || 1),
        1 // Start with 1, because multiplying by 0 gives 0
      ) || 0) +
      (Number(formData.MoreDetails?.closingStock?.[yearIndex]) || 0) -
      (Number(formData.MoreDetails?.openingStock?.[yearIndex]) || 0);

    // Get Total Direct Expenses (Including Salary & Wages)
    const totalDirectExpenses =
      (yearIndex === 0
        ? Number(totalAnnualWages) || 0 // Year 1: Use base value
        : (Number(totalAnnualWages) || 0) *
          Math.pow(
            1 + formData.ProjectReportSetting.rateOfExpense / 100,
            yearIndex
          )) +
      (directExpense
        ?.filter((expense) => expense.type === "direct")
        ?.reduce((sum, expense) => {
          const baseValue = Number(expense.value) || 0;
          const annualizedValue = baseValue * 12; // Convert monthly to annual
          return (
            sum +
            annualizedValue *
              Math.pow(
                1 + formData.ProjectReportSetting.rateOfExpense / 100,
                yearIndex
              )
          );
        }, 0) || 0);

    // Compute Gross Profit
    return adjustedRevenue - totalDirectExpenses;
  });

  // ✅ Precompute Net Profit Before Tax (NPBT) for Each Year Before Rendering
  const netProfitBeforeTax = grossProfitValues.map((grossProfit, yearIndex) => {
    return grossProfit - totalIndirectExpenses[yearIndex];
  });

  // ✅ Precompute Income Tax Calculation for Each Year Before Rendering
  const incomeTaxCalculation = netProfitBeforeTax.map((npbt, yearIndex) => {
    return (npbt * formData.ProjectReportSetting.incomeTax) / 100;
  });

  // ✅ Precompute Net Profit After Tax (NPAT) for Each Year Before Rendering
  const netProfitAfterTax = netProfitBeforeTax.map((npat, yearIndex) => {
    return npat - incomeTaxCalculation[yearIndex]; // ✅ Correct subtraction
  });

  // ✅ Precompute Balance Transferred to Balance Sheet
  const balanceTransferred = netProfitAfterTax.map(
    (npbt, yearIndex) =>
      npbt - (formData.MoreDetails.withdrawals?.[yearIndex] || 0)
  );

  // ✅ Precompute Cumulative Balance Transferred to Balance Sheet
  const cumulativeBalanceTransferred = balanceTransferred.reduce(
    (acc, value, index) => {
      if (index === 0) {
        acc.push(value); // First year, just push the value
      } else {
        acc.push(acc[index - 1] + value); // Add previous cumulative value
      }
      return acc;
    },
    []
  );

  return (
    <Page
      size={formData.ProjectReportSetting.ProjectionYears <= 7 ? "A4" : "A3"}
      orientation={
        formData.ProjectReportSetting.ProjectionYears <= 7
          ? "portrait"
          : "landscape"
      }
    >
      <View style={styleExpenses.paddingx}>
        <Text style={[styles.clientName]}>{localData.clientName}</Text>
        <View
          style={[
            stylesCOP.heading,
            {
              fontWeight: "bold",
              paddingLeft: 10,
            },
          ]}
        >
          <Text>Projected Profitability Statement</Text>
        </View>
        <View style={[styles.table]}>
          <View style={styles.tableHeader}>
            <Text style={[styles.serialNoCell, styleExpenses.sno]}>S. No.</Text>
            <Text style={[styles.detailsCell, styleExpenses.particularWidth]}>
              Particulars
            </Text>
            {Array.from({
              length:
                parseInt(formData.ProjectReportSetting.ProjectionYears) || 0,
            }).map((_, index) => (
              <Text key={index} style={styles.particularsCell}>
                Year {index + 1}
              </Text>
            ))}
          </View>
        </View>
        {/* Total Revenue Receipt */}
        <View
          style={[
            stylesMOF.row,
            styles.tableRow,
            {
              fontWeight: "black",
              marginVertical: "12px",
              borderLeft: "2px solid #000",
            },
          ]}
        >
          <Text
            style={[
              stylesCOP.serialNoCellDetail,
              styleExpenses.sno,
              styleExpenses.bordernone,
            ]}
          >
            A
          </Text>
          <Text
            style={[
              stylesCOP.detailsCellDetail,
              styleExpenses.particularWidth,
              styleExpenses.bordernone,
              { fontWeight: "extrabold" },
            ]}
          >
            Total Revenue Receipt
          </Text>

          {/* ✅ Display Precomputed Total Revenue Values */}
          {totalRevenueReceipts.map((totalYearValue, yearIndex) => (
            <Text
              key={yearIndex}
              style={[
                stylesCOP.particularsCellsDetail,
                stylesCOP.boldText,
                styleExpenses.fontSmall,
                {
                  fontFamily: "Roboto",
                  fontWeight: "extrabold",
                  borderLeftWidth: "0px",
                },
              ]}
            >
              {new Intl.NumberFormat("en-IN").format(totalYearValue)}
            </Text>
          ))}
        </View>
        {/* Closing Stock / Inventory */}
        <View style={[stylesMOF.row, styles.tableRow]}>
          <Text
            style={[
              stylesCOP.serialNoCellDetail,
              styleExpenses.sno,
              styleExpenses.bordernone,
              { borderLeftWidth: "1px" },
            ]}
          >
            B
          </Text>
          <Text
            style={[
              stylesCOP.detailsCellDetail,
              styleExpenses.particularWidth,
              styleExpenses.bordernone,
            ]}
          >
            Add: Closing Stock / Inventory
          </Text>

          {Array.from({
            length:
              parseInt(formData.ProjectReportSetting.ProjectionYears) || 0,
          }).map((_, index) => (
            <Text
              key={`closingStock-${index}`}
              style={[
                stylesCOP.particularsCellsDetail,
                styleExpenses.fontSmall,
              ]}
            >
              {new Intl.NumberFormat("en-IN").format(
                formData.MoreDetails.closingStock?.[index] ?? 0
              )}
            </Text>
          ))}
        </View>
        {/* Opening Stock / Inventory */}
        <View style={[stylesMOF.row, styles.tableRow]}>
          <Text
            style={[
              stylesCOP.serialNoCellDetail,
              styleExpenses.sno,
              styleExpenses.bordernone,
              { borderLeftWidth: "1px" },
            ]}
          ></Text>
          <Text
            style={[
              stylesCOP.detailsCellDetail,
              styleExpenses.particularWidth,
              styleExpenses.bordernone,
            ]}
          >
            Less: Opening Stock / Inventory
          </Text>

          {Array.from({
            length:
              parseInt(formData.ProjectReportSetting.ProjectionYears) || 0,
          }).map((_, index) => (
            <Text
              key={`openingStock-${index}`}
              style={[
                stylesCOP.particularsCellsDetail,
                styleExpenses.fontSmall,
              ]}
            >
              {new Intl.NumberFormat("en-IN").format(
                formData.MoreDetails.openingStock?.[index] ?? 0
              )}
            </Text>
          ))}
        </View>
        {/* Computation of Total Revenue, Adding Closing Stock, and Subtracting Opening Stock */}
        <View
          style={[stylesMOF.row, styles.tableRow, { borderBottomWidth: "0px" }]}
        >
          <Text
            style={[
              stylesCOP.serialNoCellDetail,
              styleExpenses.sno,
              styleExpenses.bordernone,
              { borderLeftWidth: "1px" },
            ]}
          ></Text>
          <Text
            style={[
              stylesCOP.detailsCellDetail,
              styleExpenses.particularWidth,
              styleExpenses.bordernone,
              { fontWeight: "extrabold" },
            ]}
          ></Text>

          {/* Compute Totals for Each Year */}
          {/* ✅ Display Precomputed Adjusted Revenue Values */}
          {adjustedRevenueValues.map((finalValue, yearIndex) => (
            <Text
              key={`finalValue-${yearIndex}`}
              style={[
                stylesCOP.particularsCellsDetail,
                stylesCOP.boldText,
                styleExpenses.fontSmall,
                {
                  fontFamily: "Roboto",
                  fontWeight: "extrabold",
                  borderLeftWidth: "0px",
                },
              ]}
            >
              {new Intl.NumberFormat("en-IN").format(finalValue)}
            </Text>
          ))}
        </View>
        {/* direct expenses */}
        <View style={[stylesMOF.row, styleExpenses.headerRow]}>
          <Text style={[styleExpenses.sno, { borderLeftWidth: "1px" }]}>C</Text>
          <Text style={stylesMOF.cell}>Less : Direct Expenses</Text>
        </View>

        {normalExpense.map((expense, index) => {
          if (index !== activeRowIndex) return null; // Only render the active row

          return (
            <View key={index} style={[stylesMOF.row, styles.tableRow]}>
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  styleExpenses.sno,
                  styleExpenses.bordernone,
                  { borderLeftWidth: "1px" },
                ]}
              >
                1
              </Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                ]}
              >
                Salary and Wages
              </Text>

              {/* Map through projection years to display calculations */}
              {[
                ...Array(
                  parseInt(formData.ProjectReportSetting.ProjectionYears) || 0
                ),
              ].map((_, yearIndex) => {
                const Annual = Number(totalAnnualWages) || 0;
                const initialValue = Annual; // Base annual value calculation

                // For the first year (first column), show totalAnnualWages
                const calculatedValue =
                  yearIndex === 0
                    ? initialValue // For Year 1, just show the base value
                    : initialValue *
                      Math.pow(
                        1 + formData.ProjectReportSetting.rateOfExpense / 100,
                        yearIndex
                      ); // Apply growth for subsequent years

                return (
                  <Text
                    key={yearIndex}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                    ]}
                  >
                    {new Intl.NumberFormat("en-IN").format(
                      yearIndex === 0
                        ? Annual.toFixed(2) // ✅ Use `Annual.toFixed(2)`, no need to format twice
                        : calculatedValue.toFixed(2) // ✅ Same for calculatedValue
                    )}
                  </Text>
                );
              })}
            </View>
          );
        })}
        {directExpense
          .filter((expense) => expense.type === "direct")
          .map((expense, index) => {
            const baseValue = Number(expense.value) || 0;
            const initialValue = baseValue * 12;

            return (
              <View key={index} style={[stylesMOF.row, styles.tableRow]}>
                <Text
                  style={[
                    stylesCOP.serialNoCellDetail,
                    styleExpenses.sno,
                    styleExpenses.bordernone,
                    { borderLeftWidth: "1px" },
                  ]}
                >
                  {index + 2}
                </Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  {expense.name}
                </Text>
                {[
                  ...Array(
                    parseInt(formData.ProjectReportSetting.ProjectionYears) || 0
                  ),
                ].map((_, yearIndex) => {
                  const calculatedValue =
                    initialValue *
                    Math.pow(
                      1 + formData.ProjectReportSetting.rateOfExpense / 100,
                      yearIndex
                    );
                  return (
                    <Text
                      key={yearIndex}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                      ]}
                    >
                      {new Intl.NumberFormat("en-IN").format(
                        calculatedValue.toFixed(2)
                      )}
                    </Text>
                  );
                })}
              </View>
            );
          })}
        {/* direct Expenses total  */}
        <View
          style={[styles.tableRow, styles.totalRow, { paddingTop: "12px" }]}
        >
          <Text
            style={[
              stylesCOP.serialNoCellDetail,
              styleExpenses.sno,
              styleExpenses.bordernone,
            ]}
          ></Text>
          <Text
            style={[
              stylesCOP.detailsCellDetail,
              styleExpenses.particularWidth,
              styleExpenses.bordernone,
              { fontFamily: "Roboto", fontWeight: "extrabold" },
            ]}
          >
            Total
          </Text>
          {/* ✅ Display Precomputed Total Direct Expenses */}
          {totalDirectExpenses.map((totalValue, yearIndex) => (
            <Text
              key={yearIndex}
              style={[
                stylesCOP.particularsCellsDetail,
                stylesCOP.boldText,
                styleExpenses.fontSmall,
                {
                  fontFamily: "Roboto",
                  fontWeight: "extrabold",
                  borderLeftWidth: "0px",
                },
              ]}
            >
              {new Intl.NumberFormat("en-IN").format(
                formatAmountInIndianStyle(totalValue.toFixed(2))
              )}
            </Text>
          ))}
        </View>
        {/* Gross Profit Calculation */}
        <View
          style={[stylesMOF.row, styles.tableRow, { marginVertical: "12px" }]}
        >
          <Text
            style={[
              stylesCOP.serialNoCellDetail,
              styleExpenses.sno,
              styleExpenses.bordernone,
              {
                fontFamily: "Roboto",
                fontWeight: "extrabold",
                borderLeftWidth: "1px",
              },
            ]}
          >
            D
          </Text>
          <Text
            style={[
              stylesCOP.detailsCellDetail,
              styleExpenses.particularWidth,
              styleExpenses.bordernone,
              { fontFamily: "Roboto", fontWeight: "extrabold" },
            ]}
          >
            Gross Profit
          </Text>

          {/* ✅ Display Precomputed Gross Profit Values */}
          {grossProfitValues.map((grossProfit, yearIndex) => (
            <Text
              key={`grossProfit-${yearIndex}`}
              style={[
                stylesCOP.particularsCellsDetail,
                stylesCOP.boldText,
                styleExpenses.fontSmall,
                {
                  borderWidth: "2px",
                  borderLeftWidth: "0px",
                  fontFamily: "Roboto",
                  fontWeight: "extrabold",
                },
              ]}
            >
              {new Intl.NumberFormat("en-IN").format(
                formatAmountInIndianStyle(grossProfit.toFixed(2))
              )}
            </Text>
          ))}
        </View>
        {/* indirect expense */}
        <View style={[stylesMOF.row, styleExpenses.headerRow]}>
          <Text style={[styleExpenses.sno, { borderLeftWidth: "1px" }]}>E</Text>

          <Text style={stylesMOF.cell}>Less:Indirect Expenses</Text>
        </View>


        {/* ✅ Render Depreciation Row */}
      <View style={[stylesMOF.row, styles.tableRow]}>
        <Text
          style={[
            stylesCOP.serialNoCellDetail,
            styleExpenses.sno,
            styleExpenses.bordernone,
            { borderLeftWidth: "1px" },
          ]}
        >
          3
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
        {totalDepreciationPerYear.map((depreciationValue, yearIndex) => (
          <Text
            key={yearIndex}
            style={[
              stylesCOP.particularsCellsDetail,
              styleExpenses.fontSmall,
            ]}
          >
            {new Intl.NumberFormat("en-IN").format(depreciationValue)}
          </Text>
        ))}
      </View>

        {directExpense
          .filter((expense) => expense.type === "indirect")
          .map((expense, index) => {
            const baseValue = Number(expense.value) || 0;
            const initialValue = baseValue * 12;

            return (
              <View key={index} style={[stylesMOF.row, styles.tableRow]}>
                <Text
                  style={[
                    stylesCOP.serialNoCellDetail,
                    styleExpenses.sno,
                    styleExpenses.bordernone,
                    { borderLeftWidth: "1px" },
                  ]}
                >
                  {index + 1}
                </Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  {expense.name}
                </Text>
                {[
                  ...Array(
                    parseInt(formData.ProjectReportSetting.ProjectionYears) || 0
                  ),
                ].map((_, yearIndex) => {
                  const calculatedValue =
                    initialValue *
                    Math.pow(
                      1 + formData.ProjectReportSetting.rateOfExpense / 100,
                      yearIndex
                    );
                  return (
                    <Text
                      key={yearIndex}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                      ]}
                    >
                      {new Intl.NumberFormat("en-IN").format(
                        formatAmountInIndianStyle(calculatedValue.toFixed(2))
                      )}
                    </Text>
                  );
                })}
              </View>
            );
          })}
        {/* total of indirect expenses */}
        <View style={[styles.tableRow, styles.totalRow]}>
          <Text
            style={[
              stylesCOP.serialNoCellDetail,
              styleExpenses.sno,
              styleExpenses.bordernone,
              {
                fontFamily: "Roboto",
                fontWeight: "extrabold",
                borderLeftWidth: "1px",
              },
            ]}
          ></Text>
          <Text
            style={[
              stylesCOP.detailsCellDetail,
              styleExpenses.particularWidth,
              styleExpenses.bordernone,
              { fontFamily: "Roboto", fontWeight: "extrabold" },
            ]}
          >
            Total
          </Text>
          {/* ✅ Display Precomputed Total Indirect Expenses */}
          {totalIndirectExpenses.map((totalValue, yearIndex) => (
            <Text
              key={yearIndex}
              style={[
                stylesCOP.particularsCellsDetail,
                stylesCOP.boldText,
                styleExpenses.fontSmall,
                {
                  borderWidth: "2px",
                  borderLeftWidth: "0px",
                  fontFamily: "Roboto",
                  fontWeight: "extrabold",
                },
              ]}
            >
              {new Intl.NumberFormat("en-IN").format(
                formatAmountInIndianStyle(totalValue.toFixed(2))
              )}
            </Text>
          ))}
        </View>
        {/* Net Profit Before Tax Calculation */}
        <View style={[stylesMOF.row, styles.tableRow, { marginTop: "12px" }]}>
          <Text
            style={[
              stylesCOP.serialNoCellDetail,
              styleExpenses.sno,
              styleExpenses.bordernone,
              {
                fontFamily: "Roboto", // ✅ Ensure using the registered font
                fontWeight: "bold", // ✅ Apply bold
                borderLeftWidth: "1px",
              },
            ]}
          >
            F
          </Text>
          <Text
            style={[
              stylesCOP.detailsCellDetail,
              styleExpenses.particularWidth,
              styleExpenses.bordernone,
              {
                fontFamily: "Roboto", // ✅ Ensure using the registered font
                fontWeight: "bold", // ✅ Apply bold
              },
            ]}
          >
            Net Profit Before Tax
          </Text>

          {/* ✅ Display Precomputed NPBT Values */}
          {netProfitBeforeTax.map((npbt, yearIndex) => (
            <Text
              key={`netProfitBeforeTax-${yearIndex}`}
              style={[
                stylesCOP.particularsCellsDetail,
                stylesCOP.boldText,
                styleExpenses.fontSmall,
                {
                  borderWidth: "2px",
                  fontFamily: "Roboto",
                  fontWeight: "bold",
                  color: "#000",
                  borderLeftWidth: "0px",
                },
              ]}
            >
              {new Intl.NumberFormat("en-IN").format(npbt.toFixed(2))}
            </Text>
          ))}
        </View>
        {/* Income Tax @  % */}
        <View
          style={[stylesMOF.row, styles.tableRow, { borderWidth: "0.1px" }]}
        >
          <Text
            style={[
              stylesCOP.serialNoCellDetail,
              styleExpenses.sno,
              styleExpenses.bordernone,
              { borderWidth: "0.1px", borderLeftWidth: "1px" },
            ]}
          >
            Less
          </Text>
          <Text
            style={[
              stylesCOP.detailsCellDetail,
              styleExpenses.particularWidth,
              styleExpenses.bordernone,
              { fontWeight: "extrabold" },
              { borderWidth: "0.1px" },
            ]}
          >
            Income Tax @ {formData.ProjectReportSetting.incomeTax} %
          </Text>

          {/* ✅ Display Precomputed Income Tax Values */}
          {incomeTaxCalculation.map((tax, yearIndex) => (
            <Text
              key={`incomeTax-${yearIndex}`}
              style={[
                stylesCOP.particularsCellsDetail,
                stylesCOP.boldText,
                styleExpenses.fontSmall,
                { borderWidth: "0.1px" },
              ]}
            >
              {new Intl.NumberFormat("en-IN").format(tax.toFixed(2))}
            </Text>
          ))}
        </View>
        {/* Net Profit After Tax Calculation  */}
        <View
          style={[stylesMOF.row, styles.tableRow, { borderWidth: "0.1px" }]}
        >
          <Text
            style={[
              stylesCOP.serialNoCellDetail,
              styleExpenses.sno,
              styleExpenses.bordernone,
              {
                fontFamily: "Roboto", // ✅ Ensure using the registered font
                fontWeight: "bold", // ✅ Apply bold
                borderLeftWidth: "1px",
              },
            ]}
          >
            G
          </Text>
          <Text
            style={[
              stylesCOP.detailsCellDetail,
              styleExpenses.particularWidth,
              styleExpenses.bordernone,
              {
                fontFamily: "Roboto", // ✅ Ensure using the registered font
                fontWeight: "bold", // ✅ Apply bold
              },
            ]}
          >
            Net Profit After Tax
          </Text>
          {/*  Display Precomputed Net Profit After Tax (NPAT) Values */}
          {netProfitAfterTax.map((tax, yearIndex) => (
            <Text
              key={`netProfitAfterTax-${yearIndex}`}
              style={[
                stylesCOP.particularsCellsDetail,
                stylesCOP.boldText,
                styleExpenses.fontSmall,
                {
                  borderWidth: "2px",
                  fontFamily: "Roboto",
                  fontWeight: "bold",
                  color: "#000",
                  borderLeftWidth: "0px",
                },
              ]}
            >
              {new Intl.NumberFormat("en-IN").format(tax.toFixed(2))}
            </Text>
          ))}
        </View>
        {/* Withdrawals during the year  */}
        <View
          style={[stylesMOF.row, styles.tableRow, { borderWidth: "0.1px" }]}
        >
          <Text
            style={[
              stylesCOP.serialNoCellDetail,
              styleExpenses.sno,
              styleExpenses.bordernone,
              { borderLeftWidth: "1px" },
            ]}
          ></Text>
          <Text
            style={[
              stylesCOP.detailsCellDetail,
              styleExpenses.particularWidth,
              styleExpenses.bordernone,
            ]}
          >
            Withdrawals during the year
          </Text>
          {/*  Display Precomputed Withdrawals per year */}
          {formData.MoreDetails.withdrawals.map((amount, yearIndex) => (
            <Text
              key={`withdrawals-${yearIndex}`}
              style={[
                stylesCOP.particularsCellsDetail,
                stylesCOP.boldText,
                styleExpenses.fontSmall,
                {
                  borderWidth: 0,
                },
              ]}
            >
              {new Intl.NumberFormat("en-IN").format(amount.toFixed(2))}
            </Text>
          ))}
        </View>
        {/* Balance Trf. To Balance Sheet */}
        <View
          style={[stylesMOF.row, styles.tableRow, { borderWidth: "0.1px" }]}
        >
          <Text
            style={[
              stylesCOP.serialNoCellDetail,
              styleExpenses.sno,
              styleExpenses.bordernone,
              { borderLeftWidth: "1px" },
            ]}
          ></Text>
          <Text
            style={[
              stylesCOP.detailsCellDetail,
              styleExpenses.particularWidth,
              styleExpenses.bordernone,
            ]}
          >
            Balance Trf. To Balance Sheet
          </Text>

          {/* ✅ Display Precomputed Balance Transferred Values with Rounding */}
          {balanceTransferred.map((amount, yearIndex) => {
            // ✅ Convert to integer based on decimal condition
            const roundedValue =
              amount - Math.floor(amount) <= 0.5
                ? Math.floor(amount) // Round down if decimal part is ≤ 0.5
                : Math.ceil(amount); // Round up if decimal part is > 0.5

            return (
              <Text
                key={`balanceTransferred-${yearIndex}`}
                style={[
                  stylesCOP.particularsCellsDetail,
                  stylesCOP.boldText,
                  styleExpenses.fontSmall,
                  { borderWidth: 0 },
                ]}
              >
                {new Intl.NumberFormat("en-IN").format(roundedValue)}
              </Text>
            );
          })}
        </View>

        {/* ✅ Display Precomputed Cumulative Balance Transferred Values */}
        <View
          style={[stylesMOF.row, styles.tableRow, { borderWidth: "0.1px" }]}
        >
          <Text
            style={[
              stylesCOP.serialNoCellDetail,
              styleExpenses.sno,
              styleExpenses.bordernone,
              { borderLeftWidth: "1px" },
            ]}
          ></Text>
          <Text
            style={[
              stylesCOP.detailsCellDetail,
              styleExpenses.particularWidth,
              styleExpenses.bordernone,
            ]}
          >
            Cumulative Balance Trf. To Balance Sheet
          </Text>

          {cumulativeBalanceTransferred.map((amount, yearIndex) => {
            // ✅ Convert to integer based on decimal condition
            const roundedValue =
              amount - Math.floor(amount) <= 0.5
                ? Math.floor(amount) // Round down if decimal part is ≤ 0.5
                : Math.ceil(amount); // Round up if decimal part is > 0.5

            return (
              <Text
                key={`cumulativeBalance-${yearIndex}`}
                style={[
                  stylesCOP.particularsCellsDetail,
                  stylesCOP.boldText,
                  styleExpenses.fontSmall,
                  { borderWidth: 0 },
                ]}
              >
                {new Intl.NumberFormat("en-IN").format(roundedValue)}
              </Text>
            );
          })}
        </View>

        {/* Cash Profit (NPAT + Dep. */}
        <View
          style={[stylesMOF.row, styles.tableRow, { borderWidth: "0.1px" }]}
        >
          <Text
            style={[
              stylesCOP.serialNoCellDetail,
              styleExpenses.sno,
              styleExpenses.bordernone,
              {
                paddingVertical: "10px",
                borderBottomWidth: "1px",
                borderLeftWidth: "1px",
              },
            ]}
          ></Text>
          <Text
            style={[
              stylesCOP.detailsCellDetail,
              styleExpenses.particularWidth,
              styleExpenses.bordernone,
              { paddingVertical: "10px", borderBottomWidth: "1px" },
            ]}
          >
            Cash Profit (NPAT + Dep.)
          </Text>

          {cumulativeBalanceTransferred.map((amount, yearIndex) => {
            // ✅ Convert to integer based on decimal condition
            const roundedValue =
              amount - Math.floor(amount) <= 0.5
                ? Math.floor(amount) // Round down if decimal part is ≤ 0.5
                : Math.ceil(amount); // Round up if decimal part is > 0.5

            return (
              <Text
                key={`cumulativeBalance-${yearIndex}`}
                style={[
                  stylesCOP.particularsCellsDetail,
                  stylesCOP.boldText,
                  styleExpenses.fontSmall,
                  {
                    borderWidth: 0,
                    paddingVertical: "10px",
                    borderBottomWidth: "1px",
                  },
                ]}
              >
                {new Intl.NumberFormat("en-IN").format(roundedValue)}
              </Text>
            );
          })}
        </View>
      </View>
    </Page>
  );
};

export default ProjectedProfitability;
