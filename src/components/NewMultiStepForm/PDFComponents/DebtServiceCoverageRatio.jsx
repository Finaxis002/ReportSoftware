import React from "react";
import { Page, View, Text } from "@react-pdf/renderer";
import { styles, stylesCOP, stylesMOF, styleExpenses } from "./Styles";
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

const DebtServiceCoverageRatio = ({
  formData,
  yearlyInterestLiabilities,
  totalDepreciationPerYear,
  yearlyPrincipalRepayment,
}) => {
  const years = formData?.ProjectReportSetting?.ProjectionYears || 5; // Default to 5 years if not provided
  const projectionYears =
    parseInt(formData?.ProjectReportSetting?.ProjectionYears) || 0;

  // ✅ Months Array for Indexing
  const months = [
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
    "January",
    "February",
    "March",
  ];

  // ✅ Extract required values from formData
  const workingCapitalLoan =
    formData?.MeansOfFinance?.workingCapital?.termLoan || 0; // Loan amount
  const interestRate = formData?.ProjectReportSetting?.rateOfInterest / 100; // Convert % to decimal
  const startMonthIndex = months.indexOf(
    formData?.ProjectReportSetting?.SelectStartingMonth
  );
  const repaymentStartMonth = startMonthIndex !== -1 ? startMonthIndex : 0;

  // ✅ Compute Interest on Working Capital for Each Year
  const interestOnWorkingCapital = Array.from({ length: projectionYears }).map(
    (_, yearIndex) => {
      const monthsInYear = yearIndex === 0 ? 12 - repaymentStartMonth : 12;
      return Math.round(
        workingCapitalLoan * interestRate * (monthsInYear / 12)
      );
    }
  );

  // ✅ Precompute Multiplication for Each Year Before Rendering Based on Selected Form
  const totalRevenueReceipts = Array.from({ length: projectionYears }).map(
    (_, yearIndex) => {
      return (
        formData?.Revenue?.selectedToggleType
          ? formData?.Revenue?.formFields
          : formData?.Revenue?.formFields2
      )?.reduce(
        (product, item) => product * (item?.years?.[yearIndex] || 1),
        1
      );
    }
  );

  // ✅ Compute Adjusted Revenue Values for Each Year Before Rendering
  const adjustedRevenueValues = Array.from({ length: projectionYears }).map(
    (_, yearIndex) => {
      const totalRevenue = totalRevenueReceipts[yearIndex] || 0;
      const closingStock =
        formData?.MoreDetails?.closingStock?.[yearIndex] || 0;
      const openingStock =
        formData?.MoreDetails?.openingStock?.[yearIndex] || 0;
      return totalRevenue + closingStock - openingStock; // ✅ Final computation
    }
  );

  const activeRowIndex = 0; // Define it or fetch dynamically if needed
  const { Expenses = {} } = formData;
  const { normalExpense = [], directExpense = [] } = Expenses;

  // ✅ Compute Total Annual Wages
  const totalAnnualWages = normalExpense.reduce(
    (sum, expense) => sum + Number(expense.amount * expense.quantity * 12 || 0),
    0
  );

  // ✅ Calculate Total Variable Expense for Each Year
  const totalVariableExpense = Array.from({ length: projectionYears }).map(
    (_, yearIndex) =>
      directExpense
        .filter((expense) => expense.type === "direct")
        .reduce((total, expense) => {
          const baseValue = Number(expense.value) || 0;
          const initialValue = baseValue * 12;
          const calculatedValue =
            initialValue *
            Math.pow(
              1 + formData?.ProjectReportSetting?.rateOfExpense / 100,
              yearIndex
            );
          return total + calculatedValue;
        }, 0)
  );

  // ✅ Compute Contribution for Each Year
  const contribution = adjustedRevenueValues.map(
    (value, index) => value - totalVariableExpense[index]
  );

  // ✅ Safe Helper Function to Format Numbers Based on Selected Format
  const formatNumber = (value) => {
    const formatType = formData?.ProjectReportSetting?.Format || "1"; // Default to Indian Format
    if (value === undefined || value === null || isNaN(value)) return "0"; // ✅ Handle invalid values

    switch (formatType) {
      case "1":
        return new Intl.NumberFormat("en-IN").format(value); // Indian Format
      case "2":
        return new Intl.NumberFormat("en-US").format(value); // USD Format
      default:
        return new Intl.NumberFormat("en-IN").format(value); // ✅ Safe default
    }
  };

  // ✅ Calculate Total Indirect Expenses for Each Year
  const totalIndirectExpenses = Array.from({
    length: parseInt(formData.ProjectReportSetting.ProjectionYears) || 0,
  }).map((_, yearIndex) => {
    // ✅ Interest on Term Loan
    const interestOnTermLoan = yearlyInterestLiabilities[yearIndex] || 0;

    // ✅ Interest on Working Capital
    const interestExpenseOnWorkingCapital =
      interestOnWorkingCapital[yearIndex] || 0;

    // ✅ Depreciation
    const depreciationExpense = totalDepreciationPerYear[yearIndex] || 0;

    // ✅ Other Indirect Expenses (with growth rate)
    const indirectExpenses = directExpense
      .filter((expense) => expense.type === "indirect")
      .reduce((sum, expense) => {
        const baseValue = Number(expense.value) || 0;
        const initialValue = baseValue * 12; // Convert monthly to annual
        return (
          sum +
          initialValue *
            Math.pow(
              1 + formData.ProjectReportSetting.rateOfExpense / 100,
              yearIndex
            )
        );
      }, 0);

    // ✅ Final Total Indirect Expenses Calculation
    return (
      interestOnTermLoan +
      interestExpenseOnWorkingCapital +
      depreciationExpense +
      indirectExpenses
    );
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

  // ✅ Step 2: Compute Gross Profit Values for Each Year After `totalDirectExpenses` is Defined
  const grossProfitValues = Array.from({
    length: parseInt(formData?.ProjectReportSetting?.ProjectionYears) || 0,
  }).map((_, yearIndex) => {
    const netAdjustedRevenue = adjustedRevenueValues[yearIndex] || 0;
    const totalExpenses = totalDirectExpenses[yearIndex] || 0; // ✅ Now correctly uses the computed direct expenses

    return netAdjustedRevenue - totalExpenses; // ✅ Correct subtraction for gross profit
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

  // ✅ Compute Total Fixed Expenses for Each Year
  const totalFixedExpenses = Array.from({ length: projectionYears }).map(
    (_, yearIndex) => {
      // ✅ Compute Salary & Wages with Growth Rate
      const salaryAndWages =
        yearIndex === 0
          ? totalAnnualWages
          : totalAnnualWages *
            Math.pow(
              1 + formData.ProjectReportSetting.rateOfExpense / 100,
              yearIndex
            );

      // ✅ Extract Interest on Term Loan
      const interestOnTermLoan = yearlyInterestLiabilities[yearIndex] || 0;

      // ✅ Extract Interest on Working Capital
      const interestExpenseOnWorkingCapital =
        interestOnWorkingCapital[yearIndex] || 0;

      // ✅ Extract Depreciation
      const depreciationExpense = totalDepreciationPerYear[yearIndex] || 0;

      // ✅ Compute Total Fixed Expenses (Without Rounding)
      return (
        salaryAndWages +
        interestOnTermLoan +
        interestExpenseOnWorkingCapital +
        depreciationExpense
      );
    }
  );

  // ✅ Compute Total Sum for Each Year
  const totalA = Array.from({
    length: formData.ProjectReportSetting.ProjectionYears || 0,
  }).map((_, yearIndex) => {
    return (
      (netProfitAfterTax[yearIndex] || 0) +
      (totalDepreciationPerYear[yearIndex] || 0) +
      (yearlyInterestLiabilities[yearIndex] || 0) +
      (interestOnWorkingCapital[yearIndex] || 0)
    );
  });

  // ✅ Compute Total (B) for Each Year
  const totalB = Array.from({
    length: formData.ProjectReportSetting.ProjectionYears || 0,
  }).map((_, yearIndex) => {
    return (
      (yearlyInterestLiabilities[yearIndex] || 0) +
      (interestOnWorkingCapital[yearIndex] || 0) +
      (yearlyPrincipalRepayment[yearIndex] || 0)
    );
  });

  const DSCR = Array.from({
    length: formData.ProjectReportSetting.ProjectionYears || 0,
  }).map((_, yearIndex) => {
    return totalB[yearIndex] !== 0 ? totalA[yearIndex] / totalB[yearIndex] : 0; // ✅ Avoid division by zero
  });

  const totalDSCR = DSCR.reduce((sum, value) => sum + value, 0);
  const averageDSCR = DSCR.length > 0 ? totalDSCR / DSCR.length : 0;

  return (
    <Page
      size={formData.ProjectReportSetting?.ProjectionYears > 12 ? "A3" : "A4"}
      orientation={
        formData.ProjectReportSetting?.ProjectionYears > 7
          ? "landscape"
          : "portrait"
      }
      style={[ { paddingBottom:"30px"}]}
      wrap={false}
      break
    >
      <View style={[styleExpenses?.paddingx ,]}>
        <Text style={[styles.clientName]}>{formData.clientName}</Text>
        <View
          style={[
            stylesCOP.heading,
            {
              fontWeight: "bold",
              paddingLeft: 10,
            },
          ]}
        >
          <Text>Debt-Service Coverage Ratio</Text>
        </View>
        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text
            style={[styles.serialNoCell, stylesCOP.boldText, { width: "85px" }]}
          >
            Sr. No.
          </Text>
          <Text
            style={[
              styles.detailsCell,
              stylesCOP.boldText,
              styleExpenses.particularWidth,
            ]}
          >
            Particulars
          </Text>

          {/* Generate Dynamic Year Headers */}
          {Array.from({ length: years }).map((_, yearIndex) => (
            <Text
              key={yearIndex}
              style={[styles.particularsCell, stylesCOP.boldText]}
            >
              {2025 + yearIndex}-{26 + yearIndex}
            </Text>
          ))}
        </View>
      </View>

      <View>
        {/* Net Profit After Tax Calculation  */}
        <View
          style={[stylesMOF.row, styles.tableRow, { borderWidth: "0.1px" }]}
        >
          <Text
            style={[
              stylesCOP.serialNoCellDetail,
              styleExpenses.sno,
              styleExpenses.bordernone,
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
            Net Profit After Tax
          </Text>
          {/*  Display Precomputed Net Profit After Tax (NPAT) Values */}
          {netProfitAfterTax.map((tax, yearIndex) => (
            <Text
              key={`netProfitAfterTax-${yearIndex}`}
              style={[
                stylesCOP.particularsCellsDetail,
                styleExpenses.fontSmall,
              ]}
            >
              {formatNumber(Math.round(tax))}
            </Text>
          ))}
        </View>

        {/* ✅ Render Depreciation Row */}
        <View style={[stylesMOF.row, styles.tableRow, { borderWidth: "0px" }]}>
          <Text
            style={[
              stylesCOP.serialNoCellDetail,
              styleExpenses.sno,
              styleExpenses.bordernone,
            ]}
          >
            2
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
              {formatNumber(depreciationValue)}
            </Text>
          ))}
        </View>

        {/* Interest On Term Loan */}
        <View style={[styles.tableRow, styles.totalRow]}>
          {/* Serial Number */}
          <Text
            style={[
              stylesCOP.serialNoCellDetail,
              styleExpenses.sno,
              styleExpenses.bordernone,
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
            Interest On Term Loan
          </Text>

          {/* Get total projection years */}
          {Array.from({
            length: formData.ProjectReportSetting.ProjectionYears,
          }).map((_, index) => (
            <Text
              key={index}
              style={[
                stylesCOP.particularsCellsDetail,
                styleExpenses.fontSmall,
              ]}
            >
              {formatNumber(yearlyInterestLiabilities[index] || 0)}
            </Text>
          ))}
        </View>

        {/* Interest on Working Capital */}
        <View style={[styles.tableRow, styles.totalRow]}>
          <Text
            style={[
              stylesCOP.serialNoCellDetail,
              styleExpenses.sno,
              styleExpenses.bordernone,
            ]}
          >
            4
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

          {/* ✅ Display Interest Values for Each Year */}
          {interestOnWorkingCapital.map((interest, index) => (
            <Text
              key={index}
              style={[
                stylesCOP.particularsCellsDetail,
                styleExpenses.fontSmall,
              ]}
            >
              {formatNumber(interest)}
            </Text>
          ))}
        </View>

        {/* ✅ Total Row for Variable Expense */}
        <View style={[stylesMOF.row, styles.tableRow, styleExpenses.totalRow]}>
          <Text
            style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}
          ></Text>
          <Text
            style={[
              stylesCOP.detailsCellDetail,
              styleExpenses.particularWidth,
              styleExpenses.bordernone,
              { fontWeight: "bold", fontFamily: "Roboto", textAlign: "right" },
            ]}
          >
            Total - A
          </Text>

          {/* ✅ Display Computed Total for Each Year */}
          {totalA.map((totalValue, yearIndex) => (
            <Text
              key={yearIndex}
              style={[
                stylesCOP.particularsCellsDetail,
                stylesCOP.boldText,
                styleExpenses.fontSmall,
              ]}
            >
              {formatNumber(Math.round(totalValue))}{" "}
              {/* ✅ Display Rounded Value */}
            </Text>
          ))}
        </View>
      </View>

      <View style={[{ marginTop: "10px" }]}>
        {/* Interest On Term Loan */}
        <View style={[styles.tableRow, styles.totalRow]}>
          {/* Serial Number */}
          <Text
            style={[
              stylesCOP.serialNoCellDetail,
              styleExpenses.sno,
              styleExpenses.bordernone,
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
            Interest On Term Loan
          </Text>

          {/* Get total projection years */}
          {Array.from({
            length: formData.ProjectReportSetting.ProjectionYears,
          }).map((_, index) => (
            <Text
              key={index}
              style={[
                stylesCOP.particularsCellsDetail,
                styleExpenses.fontSmall,
              ]}
            >
              {formatNumber(yearlyInterestLiabilities[index] || 0)}
            </Text>
          ))}
        </View>

        {/* Interest on Working Capital */}
        <View style={[styles.tableRow, styles.totalRow]}>
          <Text
            style={[
              stylesCOP.serialNoCellDetail,
              styleExpenses.sno,
              styleExpenses.bordernone,
            ]}
          >
            2
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

          {/* ✅ Display Interest Values for Each Year */}
          {interestOnWorkingCapital.map((interest, index) => (
            <Text
              key={index}
              style={[
                stylesCOP.particularsCellsDetail,
                styleExpenses.fontSmall,
              ]}
            >
              {formatNumber(interest)}
            </Text>
          ))}
        </View>

        {/* Repayment of Term Loan */}
        <View style={[styles.tableRow, styles.totalRow]}>
          <Text
            style={[
              stylesCOP.serialNoCellDetail,
              styleExpenses.sno,
              styleExpenses.bordernone,
            ]}
          >
            2
          </Text>

          <Text
            style={[
              stylesCOP.detailsCellDetail,
              styleExpenses.particularWidth,
              styleExpenses.bordernone,
            ]}
          >
            Repayment of Term Loan
          </Text>

          {/* ✅ Display Principal Repayment Only for Projection Years */}
          {Array.from({
            length: formData.ProjectReportSetting.ProjectionYears || 0,
          }).map((_, index) => (
            <Text
              key={index}
              style={[
                stylesCOP.particularsCellsDetail,
                styleExpenses.fontSmall,
              ]}
            >
              {formatNumber(Math.round(yearlyPrincipalRepayment[index] || 0))}
            </Text>
          ))}
        </View>

        {/* ✅ Total Row for Variable Expense */}
        <View style={[stylesMOF.row, styles.tableRow, styleExpenses.totalRow]}>
          <Text
            style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}
          ></Text>
          <Text
            style={[
              stylesCOP.detailsCellDetail,
              styleExpenses.particularWidth,
              styleExpenses.bordernone,
              { fontWeight: "bold", fontFamily: "Roboto", textAlign: "right" },
            ]}
          >
            Total - B
          </Text>

          {/* ✅ Display Computed Total for Each Year */}
          {totalB.map((totalValue, yearIndex) => (
            <Text
              key={yearIndex}
              style={[
                stylesCOP.particularsCellsDetail,
                stylesCOP.boldText,
                styleExpenses.fontSmall,
              ]}
            >
              {formatNumber(Math.round(totalValue))}{" "}
              {/* ✅ Display Rounded Value */}
            </Text>
          ))}
        </View>
      </View>

      {/* DSCR (A/B) */}
      <View
        style={[
          stylesMOF.row,
          styles.tableRow,
          styleExpenses.totalRow,
          { marginTop: "10px" },
        ]}
      >
        <Text style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}></Text>
        <Text
          style={[
            stylesCOP.detailsCellDetail,
            styleExpenses.particularWidth,
            styleExpenses.bordernone,
            { fontWeight: "bold", fontFamily: "Roboto", textAlign: "left" },
          ]}
        >
          DSCR (A/B)
        </Text>

        {/* ✅ Display Computed Total for Each Year */}
        {DSCR.map((totalValue, yearIndex) => (
          <Text
            key={yearIndex}
            style={[
              stylesCOP.particularsCellsDetail,
              stylesCOP.boldText,
              styleExpenses.fontSmall,
            ]}
          >
            {formatNumber(parseFloat(totalValue).toFixed(2))}{" "}
            {/* ✅ Display Rounded Value */}
          </Text>
        ))}
      </View>

      {/* ✅ Display Average DSCR */}
      <View
        style={[
          stylesMOF.row,
          styles.tableRow,
          styleExpenses.totalRow,
          { marginTop: "25px" },
        ]}
      >
       <Text style={[stylesCOP.serialNoCellDetail, styleExpenses.sno , {width:"85px"}]}></Text>
       <Text
          style={[
            stylesCOP.detailsCellDetail,
            styleExpenses.particularWidth,
            styleExpenses.bordernone,
            { fontWeight: "bold", fontFamily: "Roboto", textAlign: "left", borderRight:"0" },
          ]}
        >
          Average DSCR
        </Text>
        <Text
         style={[
            stylesCOP.particularsCellsDetail,
            stylesCOP.boldText,
            styleExpenses.fontSmall,
            {width:"850px", fontSize:"10px", fontFamily:"Roboto", fontWeight:"extrabold", borderBottomWidth:"0px" , borderWidth:"1px"}
          ]}
        >
         {formatNumber(parseFloat(averageDSCR).toFixed(2))}
          {/* ✅ Display Rounded Value */}
        </Text>
      </View>
    </Page>
  );
};

export default DebtServiceCoverageRatio;
