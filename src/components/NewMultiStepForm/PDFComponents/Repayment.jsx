import React, { useEffect, useState } from "react";
import { Page, View, Text } from "@react-pdf/renderer";
import {
  styles,
  stylesCOP,
  stylesMOF,
  styleExpenses,
  columnWidths,
} from "./Styles"; // Import only necessary styles
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

const Repayment = ({
  formData,
  localData,
  onInterestCalculated,
  onPrincipalRepaymentCalculated,
}) => {
  const termLoan = formData.MeansOfFinance.termLoan.termLoan;
  const interestRate = formData.ProjectReportSetting.interestOnTL / 100;
  const moratoriumPeriod = formData.ProjectReportSetting.MoratoriumPeriod || 0; // Given = 5 months
  const repaymentMonths = formData.ProjectReportSetting.RepaymentMonths || 0;
  const [yearlyInterestLiabilities, setYearlyInterestLiabilities] = useState(
    []
  );
  const [yearlyPrincipalRepayment, setYearlyPrincipalRepayment] = useState([]);

  // ✅ Correct the total repayment months (including moratorium)
  let totalMonths = repaymentMonths + moratoriumPeriod;
  const numYears = Math.ceil(totalMonths / 12); // Convert months to years

  let effectiveRepaymentMonths = repaymentMonths - moratoriumPeriod;
  let fixedPrincipalRepayment =
    effectiveRepaymentMonths > 0 ? termLoan / effectiveRepaymentMonths : 0;

  // ✅ Month Mapping (April - March)
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

  // ✅ Convert Selected Month Name to Index (April-March Mapping)
  let startMonthIndex = months.indexOf(
    formData.ProjectReportSetting.SelectStartingMonth
  );

  if (startMonthIndex === -1) {
    startMonthIndex = 0; // Default to April if input is incorrect
  }

  let remainingBalance = termLoan; // Remaining loan balance

  let repaymentStartIndex = startMonthIndex; // Start from selected month

  let data = [];

  // ✅ Track the Total Elapsed Months Since Repayment Start
  let elapsedMonths = 0;

  for (let year = 0; year < totalMonths; year++) {
    let yearData = [];

    // ✅ First Year Starts from Selected Month
    let firstMonth = year === 0 ? repaymentStartIndex : 0;

    for (let i = firstMonth; i < 12; i++) {
      if (remainingBalance <= 0) break; // Stop when balance is cleared

      let principalOpeningBalance = remainingBalance;

      // ✅ Ensure exactly 5 months of Moratorium
      let principalRepayment =
        elapsedMonths < moratoriumPeriod ? 0 : fixedPrincipalRepayment;

      let principalClosingBalance = Math.max(
        0,
        principalOpeningBalance - principalRepayment
      );

      // ✅ Ensure interest is calculated exactly for 5 months
      let interestLiability =
        elapsedMonths < moratoriumPeriod
          ? Math.round(principalOpeningBalance * (interestRate / 12))
          : Math.round(principalClosingBalance * (interestRate / 12));

      let totalRepayment = principalRepayment + interestLiability;

      yearData.push({
        month: months[i],
        principalOpeningBalance: Math.round(principalOpeningBalance), // ✅ Rounded
        principalRepayment: Math.round(principalRepayment), // ✅ Rounded
        principalClosingBalance: Math.round(principalClosingBalance), // ✅ Rounded
        interestLiability, // ✅ Already rounded above
        totalRepayment: Math.round(totalRepayment), // ✅ Rounded
      });

      remainingBalance = principalClosingBalance;

      // ✅ Move the elapsed months counter forward
      elapsedMonths++;
    }

    if (yearData.length > 0) {
      data.push(yearData);
    }
  }

  const financialYear = parseInt(
    formData.ProjectReportSetting.FinancialYear || 2025
  );

  // ✅ Compute Yearly Total Principal Repayment
  const computedYearlyPrincipalRepayment = data.map((yearData) =>
    yearData.reduce((sum, entry) => sum + entry.principalRepayment, 0)
  );

  useEffect(() => {
    if (!data || data.length === 0) return;
    // ✅ Compute Yearly Principal Repayment
    const computedYearlyPrincipalRepayment = data.map((yearData) =>
      yearData.reduce((sum, entry) => sum + entry.principalRepayment, 0)
    );

    // ✅ Find First Year Where Repayment Actually Starts
    const firstRepaymentYearIndex = computedYearlyPrincipalRepayment.findIndex(
      (value) => value > 0
    );

    // ✅ Exclude the Moratorium Year (i.e., remove leading 0 values)
    const filteredPrincipalRepayment = computedYearlyPrincipalRepayment.slice(
      firstRepaymentYearIndex
    );

    // ✅ Set State and Pass to Parent
    setYearlyPrincipalRepayment(filteredPrincipalRepayment);

    if (onPrincipalRepaymentCalculated) {
      onPrincipalRepaymentCalculated(filteredPrincipalRepayment);
    }
  }, []);

  // ✅ Compute Yearly Total Interest Liability (Ignoring Moratorium Period)
  const computedYearlyInterestLiabilities = data
    .map((yearData) =>
      yearData.reduce((sum, entry) => sum + entry.interestLiability, 0)
    )
    .filter((total) => total > 0); // ✅ Only store years with actual interest

  useEffect(() => {
    setYearlyInterestLiabilities(computedYearlyInterestLiabilities);

    if (onInterestCalculated) {
      onInterestCalculated(computedYearlyInterestLiabilities);
    }
  }, []); // ✅ Runs only once when component mounts

  // ✅ Store Year-Wise Interest Liability
  data.forEach((yearData) => {
    let totalInterestLiability = yearData.reduce(
      (sum, entry) => sum + entry.interestLiability,
      0
    );
    yearlyInterestLiabilities.push(totalInterestLiability);
  });

  useEffect(() => {
    // ✅ Mock Data: Replace this with actual calculations
    const computedLiabilities = [];

    setYearlyInterestLiabilities(computedLiabilities);

    // ✅ Send values to parent component
    if (onInterestCalculated) {
      onInterestCalculated(computedLiabilities);
    }
  }, []); // Runs once when component mounts

  useEffect(() => {
    // ✅ Find the first year where repayment actually starts
    const firstRepaymentYearIndex = data.findIndex((yearData) =>
      yearData.some((entry) => entry.principalRepayment > 0)
    );

    // ✅ Compute total interest liability per year, starting from first repayment year
    const computedYearlyInterestLiabilities = data
      .slice(firstRepaymentYearIndex) // ✅ Ignore pre-repayment years
      .map((yearData) =>
        yearData.reduce((sum, entry) => sum + entry.interestLiability, 0)
      );

    // console.log("Corrected Yearly Interest Liabilities:", computedYearlyInterestLiabilities); // ✅ Log the correct array

    setYearlyInterestLiabilities(computedYearlyInterestLiabilities);

    if (onInterestCalculated) {
      onInterestCalculated(computedYearlyInterestLiabilities);
    }
  }, []); // ✅ Runs only once when component mounts

  const formatNumber = (value) => {
    const formatType = formData?.ProjectReportSetting?.Format || "1"; // Default to Indian Format

    if (value === undefined || value === null || isNaN(value)) return "0"; // ✅ Handle invalid values

    switch (formatType) {
      case "1": // Indian Format (1,23,456)
        return new Intl.NumberFormat("en-IN").format(value);

      case "2": // USD Format (1,123,456)
        return new Intl.NumberFormat("en-US").format(value);

      case "3": // Generic Format (1,23,456)
        return new Intl.NumberFormat("en-IN").format(value);

      default:
        return new Intl.NumberFormat("en-IN").format(value); // ✅ Safe default
    }
  };

  return (
    <>
      <Page
        size={formData.ProjectReportSetting.ProjectionYears > 12 ? "A3" : "A4"}
        orientation={
          formData.ProjectReportSetting.ProjectionYears > 7
            ? "landscape"
            : "portrait"
        }
      >
        <View style={styleExpenses.paddingx}>
          {/* Client Name */}
          <Text style={[styles.clientName]}>{localData.clientName}</Text>

          {/* Heading */}
          <View
            style={[
              stylesCOP.heading,
              {
                fontWeight: "bold",
                paddingLeft: 10,
                borderWidth: "0px",
              },
            ]}
          >
            <Text>Repayment of Term Loan</Text>
          </View>

          {/* Term Loan Details Section */}
          <View style={{ paddingHorizontal: 10, marginTop: 10 }}>
            <Text
              style={[
                stylesCOP.detailsCellDetail,
                {
                  fontWeight: "bold",
                  borderWidth: "0px",
                  fontFamily: "Roboto",
                },
              ]}
            >
              Term Loan = {formatNumber(termLoan)}
            </Text>

            <Text
              style={[
                stylesCOP.detailsCellDetail,
                {
                  fontWeight: "bold",
                  borderWidth: "0px",
                  fontFamily: "Roboto",
                },
              ]}
            >
              Interest Rate = {interestRate * 100}% per annum
            </Text>

            <Text
              style={[
                stylesCOP.detailsCellDetail,
                {
                  fontWeight: "bold",
                  borderWidth: "0px",
                  fontFamily: "Roboto",
                },
              ]}
            >
              Moratorium Period = {moratoriumPeriod} Months
            </Text>

            <Text
              style={[
                stylesCOP.detailsCellDetail,
                {
                  fontWeight: "bold",
                  borderWidth: "0px",
                  fontFamily: "Roboto",
                },
              ]}
            >
              Number of Years ={" "}
              {Math.floor(formData.ProjectReportSetting.RepaymentMonths / 12)}{" "}
              years
              {formData.ProjectReportSetting.RepaymentMonths % 12 !== 0 &&
                ` ${formData.ProjectReportSetting.RepaymentMonths % 12} months`}
            </Text>
          </View>

          {/* table header  */}

          <View style={[styles.table, { marginTop: "10px" }]}>
            <View style={styles.tableHeader}>
              <Text style={[styles.serialNoCell, styles.serialNumberCellStyle]}>
                S. No.
              </Text>
              <Text
                style={[
                  styles.detailsCell,
                  styleExpenses.particularWidth,
                  { textAlign: "center" },
                ]}
              >
                Years / Quarters
              </Text>
              <Text
                style={[
                  styles.detailsCell,
                  styleExpenses.particularWidth,
                  { textAlign: "center" },
                ]}
              >
                Principal Opening Balance
              </Text>
              <Text
                style={[
                  styles.detailsCell,
                  styleExpenses.particularWidth,
                  { textAlign: "center" },
                ]}
              >
                Principal Repayment
              </Text>
              <Text
                style={[
                  styles.detailsCell,
                  styleExpenses.particularWidth,
                  { textAlign: "center" },
                ]}
              >
                Principal Closing Balance
              </Text>
              <Text
                style={[
                  styles.detailsCell,
                  styleExpenses.particularWidth,
                  { textAlign: "center" },
                ]}
              >
                Interest Liability
              </Text>
              <Text
                style={[
                  styles.detailsCell,
                  styleExpenses.particularWidth,
                  { textAlign: "center" },
                ]}
              >
                Total Repayment
              </Text>
            </View>
          </View>

          {/* ✅ Remove tables where principal repayment is 0 and re-index tables */}
          {data
            .map((yearData, yearIndex) => ({
              yearIndex,
              filteredYearData: yearData.filter(
                (entry) => entry.principalRepayment !== 0
              ),
            }))
            .filter(({ filteredYearData }) => filteredYearData.length > 0) // ✅ Remove Empty Tables
            .map(({ filteredYearData }, newYearIndex) => {
              // ✅ Compute totals **only for filtered data**
              let totalPrincipalRepayment = filteredYearData.reduce(
                (sum, entry) => sum + entry.principalRepayment,
                0
              );
              let totalInterestLiability = filteredYearData.reduce(
                (sum, entry) => sum + entry.interestLiability,
                0
              );
              let totalRepayment = filteredYearData.reduce(
                (sum, entry) => sum + entry.totalRepayment,
                0
              );

              return (
                <View
                  key={newYearIndex}
                  wrap={false}
                  style={{ marginBottom: 10 }}
                >
                  {/* ✅ Updated Year Numbering (Ensuring First Table is Correct) */}
                  <View style={[stylesMOF.row, styleExpenses.headerRow]}>
                    <Text style={styles.serialNumberCellStyle}>
                      {newYearIndex + 1} {/* ✅ Now properly starts from 1 */}
                    </Text>

                    <Text
                      style={[
                        stylesMOF.cell,
                        {
                          fontFamily: "Roboto",
                          fontWeight: "extrabold",
                          backgroundColor: "#D3D3D3",
                          textAlign: "center",
                        },
                      ]}
                    >
                      {financialYear + newYearIndex}-{" "}
                      {(financialYear + newYearIndex + 1).toString().slice(-2)}
                    </Text>
                  </View>

                  {/* ✅ Monthly Breakdown */}
                  {filteredYearData.map((entry, monthIndex) => (
                    <View
                      key={monthIndex}
                      style={[stylesMOF.row, styles.tableRow]}
                    >
                      {/* Serial Number (Blank) */}
                      <Text style={styles.serialNumberCellStyle}></Text>

                      {/* Months / Quarters */}
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                          { textAlign: "center", width: "190px" },
                        ]}
                      >
                        {entry.month}
                      </Text>

                      {/* Principal Opening Balance */}
                      <Text
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                          { textAlign: "center", fontSize: "9px" },
                        ]}
                      >
                        {formatNumber(entry.principalOpeningBalance)}
                      </Text>

                      {/* Principal Repayment */}
                      <Text
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                          { textAlign: "center", fontSize: "9px" },
                        ]}
                      >
                        {formatNumber(entry.principalRepayment)}
                      </Text>

                      {/* Principal Closing Balance */}
                      <Text
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                          { textAlign: "center", fontSize: "9px" },
                        ]}
                      >
                        {formatNumber(entry.principalClosingBalance)}
                      </Text>

                      {/* Interest Liability */}
                      <Text
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                          { textAlign: "center", fontSize: "9px" },
                        ]}
                      >
                        {formatNumber(entry.interestLiability)}
                      </Text>

                      {/* Total Repayment */}
                      <Text
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                          { textAlign: "center", fontSize: "9px" },
                        ]}
                      >
                        {formatNumber(entry.totalRepayment)}
                      </Text>
                    </View>
                  ))}

                  {/* ✅ Show Totals **Only for Months Where Repayment Starts** */}
                  {totalPrincipalRepayment > 0 && (
                    <View
                      style={[
                        stylesMOF.row,
                        styleExpenses.totalRow,
                        { backgroundColor: "#f0f0f0" },
                      ]}
                    >
                      <Text
                        style={[
                          stylesCOP.serialNoCellDetail,
                          styleExpenses.sno,
                          {
                            fontWeight: "bold",
                            width: "230px",
                            textAlign: "center",
                          },
                        ]}
                      >
                        Total
                      </Text>

                      {/* Empty Cells to Align */}
                      <Text
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                          { textAlign: "center", fontSize: "9px" },
                        ]}
                      ></Text>

                      {/* ✅ Total Principal Repayment */}
                      <Text
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                          {
                            textAlign: "center",
                            fontSize: "9px",
                            fontWeight: "bold",
                            borderWidth: "2px",
                          },
                        ]}
                      >
                        {formatNumber(totalPrincipalRepayment)}
                      </Text>

                      {/* Empty Cell for Principal Closing Balance */}
                      <Text
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                          { textAlign: "center", fontSize: "9px" },
                        ]}
                      ></Text>

                      {/* ✅ Total Interest Liability */}
                      <Text
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                          {
                            textAlign: "center",
                            fontSize: "9px",
                            fontWeight: "bold",
                            borderWidth: "2px",
                          },
                        ]}
                      >
                        {formatNumber(totalInterestLiability)}
                      </Text>

                      {/* ✅ Total Repayment */}
                      <Text
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                          {
                            textAlign: "center",
                            fontSize: "9px",
                            fontWeight: "bold",
                            borderWidth: "2px",
                          },
                        ]}
                      >
                        {formatNumber(totalRepayment)}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
        </View>
      </Page>
    </>
  );
};

export default Repayment;
