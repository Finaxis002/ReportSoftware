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

const Repayment = ({ formData, localData }) => {
  const termLoan = formData.MeansOfFinance.totalTermLoan;
  const interestRate = formData.ProjectReportSetting.interestOnTL / 100;
  const moratoriumPeriod = formData.ProjectReportSetting.MoratoriumPeriod;
  const repaymentMonths = formData.ProjectReportSetting.RepaymentMonths;
  const extraMonths = repaymentMonths % 12;
  const principalRepayment = Math.round(
    termLoan / (repaymentMonths - moratoriumPeriod)
  );

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
    console.error("Invalid SelectStartingMonth! Defaulting to April.");
    startMonthIndex = 0; // Default to April if input is incorrect
  }

  let numYears = Math.ceil(formData.ProjectReportSetting.RepaymentMonths / 12); // Total years of repayment
  let remainingBalance = termLoan; // Remaining loan balance

  // ✅ Repayment starts exactly from the selected month (NOT after moratorium)
  let repaymentStartIndex = startMonthIndex; // Start directly from selected month

  // ✅ Ensure correct year alignment
  let currentYear = 2025;
  let data = [];

  for (let year = 0; year < numYears; year++) {
    let yearData = [];

    // ✅ First Year Starts from Client’s Selected Month
    let firstMonth = year === 0 ? repaymentStartIndex : 0;

    for (let i = firstMonth; i < 12; i++) {
      if (remainingBalance <= 0) break; // Stop when balance is cleared

      let principalOpeningBalance = remainingBalance; // ✅ Interest should be calculated on this

      let principalClosingBalance = Math.max(
        0,
        principalOpeningBalance - principalRepayment
      ); // ✅ Ensure no negative values
      let interestLiability = Math.max(
        0,
        Math.round(principalClosingBalance * (interestRate / 12))
      ); // ✅ Ensure no negative values
      let totalRepayment = Math.max(0, principalRepayment + interestLiability); // ✅ Ensure no negative values

      yearData.push({
        month: months[i], // ✅ Corrected month selection
        principalOpeningBalance, // ✅ Corrected
        principalRepayment,
        principalClosingBalance, // ✅ Corrected
        interestLiability, // ✅ Corrected
        totalRepayment, // ✅ Corrected
      });

      remainingBalance = principalClosingBalance; // ✅ Move to the next month's POB
    }

    if (yearData.length > 0) {
      data.push(yearData);
    }
  }
  {
    /* Extract the Financial Year from formData */
  }
  const financialYear = parseInt(
    formData.ProjectReportSetting.FinancialYear,
    10
  );

  console.log("Generated Repayment Schedule:", data);

  console.log("Form DAta From Repayment Component : ", formData);
  return (
    <>
      <Page
        size={formData.ProjectReportSetting.ProjectionYears <= 7 ? "A4" : "A3"}
        orientation={
          formData.ProjectReportSetting.ProjectionYears <= 7
            ? "portrait"
            : "landscape"
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
              Term Loan = {new Intl.NumberFormat("en-IN").format(termLoan)}
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
              <Text style={[styles.detailsCell, { textAlign: "center" }]}>
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

          {/* Table Body */}
          {data.map((yearData, yearIndex) => {
            // Calculate total sums for each year
            let totalPrincipalRepayment = yearData.reduce(
              (sum, entry) => sum + entry.principalRepayment,
              0
            );
            let totalInterestLiability = yearData.reduce(
              (sum, entry) => sum + entry.interestLiability,
              0
            );
            let totalRepayment = yearData.reduce(
              (sum, entry) => sum + entry.totalRepayment,
              0
            );

            return (
              <View key={yearIndex} wrap={false} style={{ marginBottom: 10 }}>
                {/* Year Row */}
                <View style={[stylesMOF.row, styleExpenses.headerRow]}>
                  <Text
                    style={[
                      stylesCOP.serialNoCellDetail,
                      { textAlign: "center", width: "40px" },
                    ]}
                  >
                    {yearIndex + 1}
                  </Text>

                  <Text
                    style={[
                      stylesMOF.cell,
                      {
                        paddingLeft: "40px",
                        fontFamily: "Roboto",
                        fontWeight: "extrabold",
                        backgroundColor: "#D3D3D3",
                        textAlign: "center",
                      },
                    ]}
                  >
                    {financialYear + yearIndex}-
                    {(financialYear + yearIndex + 1).toString().slice(-2)}
                  </Text>
                </View>

                {/* Monthly Breakdown */}
                {yearData.map((entry, monthIndex) => (
                  <View
                    key={monthIndex}
                    style={[stylesMOF.row, styles.tableRow]}
                  >
                    {/* Serial Number (Blank as per your structure) */}
                    <Text
                      style={[
                        stylesCOP.serialNoCellDetail,
                        styleExpenses.sno,
                        styleExpenses.bordernone,
                        { width: "80px" },
                      ]}
                    ></Text>

                    {/* Months / Quarters */}
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                        { textAlign: "center", width: "200px" },
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
                      {new Intl.NumberFormat("en-IN").format(
                        entry.principalOpeningBalance
                      )}
                    </Text>

                    {/* Principal Repayment */}
                    <Text
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                        { textAlign: "center", fontSize: "9px" },
                      ]}
                    >
                      {new Intl.NumberFormat("en-IN").format(
                        entry.principalRepayment
                      )}
                    </Text>

                    {/* Principal Closing Balance */}
                    <Text
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                        { textAlign: "center", fontSize: "9px" },
                      ]}
                    >
                      {new Intl.NumberFormat("en-IN").format(
                        entry.principalClosingBalance
                      )}
                    </Text>

                    {/* Interest Liability */}
                    <Text
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                        { textAlign: "center", fontSize: "9px" },
                      ]}
                    >
                      {new Intl.NumberFormat("en-IN").format(
                        entry.interestLiability
                      )}
                    </Text>

                    {/* Total Repayment */}
                    <Text
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                        { textAlign: "center", fontSize: "9px" },
                      ]}
                    >
                      {new Intl.NumberFormat("en-IN").format(
                        entry.totalRepayment
                      )}
                    </Text>
                  </View>
                ))}

                {/* Total Row at the Bottom of Each Year Table */}
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
                        width: "280px",
                        textAlign: "center",
                        paddingLeft: "40px",
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

                  {/* Total Principal Repayment */}
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
                    {new Intl.NumberFormat("en-IN").format(
                      totalPrincipalRepayment
                    )}
                  </Text>

                  {/* Empty Cell for Principal Closing Balance */}
                  <Text
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                      { textAlign: "center", fontSize: "9px" },
                    ]}
                  ></Text>

                  {/* Total Interest Liability */}
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
                    {new Intl.NumberFormat("en-IN").format(
                      totalInterestLiability
                    )}
                  </Text>

                  {/* Total Repayment */}
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
                    {new Intl.NumberFormat("en-IN").format(totalRepayment)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </Page>
    </>
  );
};

export default Repayment;
