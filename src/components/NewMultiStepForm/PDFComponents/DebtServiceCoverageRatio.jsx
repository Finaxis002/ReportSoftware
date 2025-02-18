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
  yearlyPrincipalRepayment, // ✅ Receiving total principal repayment
  netProfitAfterTax,
}) => {
  // console.log("Yearly Principal Repayment:", yearlyPrincipalRepayment); // ✅ Debugging check

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

  // ✅ Calculate Interest on Working Capital for each projection year
  const interestOnWorkingCapital = Array.from({
    length: parseInt(formData.ProjectReportSetting.ProjectionYears) || 0,
  }).map(() => {
    const workingCapitalLoan =
      Number(formData.MeansOfFinance.workingCapital.termLoan) || 0;
    const interestRate =
      Number(formData.ProjectReportSetting.interestOnTL) || 0;

    // ✅ Annual Interest Calculation
    return (workingCapitalLoan * interestRate) / 100;
  });

  const { Expenses = {} } = formData;
  const { normalExpense = [], directExpense = [] } = Expenses;

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
      style={[{ paddingBottom: "30px" }]}
      wrap={false}
      break
    >
      <View style={[styleExpenses?.paddingx]}>
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

        {/* ✅ Repayment of Term Loan */}
        <View style={[styles.tableRow, styles.totalRow]}>
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
            Repayment of Term Loan
          </Text>

          {/* ✅ Ensure First-Year Repayment is Included */}
          {yearlyPrincipalRepayment && yearlyPrincipalRepayment.length > 0 ? (
            Array.from({ length: projectionYears }).map((_, index) => (
              <Text
                key={index}
                style={[
                  stylesCOP.particularsCellsDetail,
                  styleExpenses.fontSmall,
                ]}
              >
                {formatNumber(Math.round(yearlyPrincipalRepayment[index] || 0))}
              </Text>
            ))
          ) : (
            <Text
              style={[
                stylesCOP.particularsCellsDetail,
                styleExpenses.fontSmall,
              ]}
            >
              No Data Available
            </Text>
          )}
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
        <Text
          style={[
            stylesCOP.serialNoCellDetail,
            styleExpenses.sno,
            { width: "85px" },
          ]}
        ></Text>
        <Text
          style={[
            stylesCOP.detailsCellDetail,
            styleExpenses.particularWidth,
            styleExpenses.bordernone,
            {
              fontWeight: "bold",
              fontFamily: "Roboto",
              textAlign: "left",
              borderRight: "0",
            },
          ]}
        >
          Average DSCR
        </Text>
        <Text
          style={[
            stylesCOP.particularsCellsDetail,
            stylesCOP.boldText,
            styleExpenses.fontSmall,
            {
              width: "850px",
              fontSize: "10px",
              fontFamily: "Roboto",
              fontWeight: "extrabold",
              borderBottomWidth: "0px",
              borderWidth: "1px",
            },
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