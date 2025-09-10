import React, { useEffect, useState } from "react";
import { Page, View, Text, Image } from "@react-pdf/renderer";
import { styles, stylesCOP, stylesMOF, styleExpenses } from "./Styles"; // Import only necessary styles
import { Font } from "@react-pdf/renderer";
import SAWatermark from "../Assets/SAWatermark";
import CAWatermark from "../Assets/CAWatermark";

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
  pdfType,
  onInterestCalculated,
  onPrincipalRepaymentCalculated,
  onMarchClosingBalanceCalculated, // New callback prop for March balances
  onInterestLiabilityUpdate,
}) => {
  // console.log("formData :", formData);
  const termLoan = formData?.MeansOfFinance?.termLoan?.termLoan;

  const interestRate = formData.ProjectReportSetting.interestOnTL / 100;
  const moratoriumPeriod = formData.ProjectReportSetting.MoratoriumPeriod; // Given = 5 months
  const repaymentMonths = formData.ProjectReportSetting.RepaymentMonths;
  const [yearlyInterestLiabilities, setYearlyInterestLiabilities] = useState(
    []
  );
  const [yearlyPrincipalRepayment, setYearlyPrincipalRepayment] = useState([]);

  const repaymentMethod = formData.ProjectReportSetting.SelectRepaymentMethod; // Get selected repayment method

  const debtEquityOption =
    formData?.ProjectReportSetting?.DebtEquityOption ||
    formData?.ProjectReportSetting?.debtEquityOption;

  // ---- NORMALIZE INPUTS (force numbers; handle empty strings) ----
  const TL = Number(formData?.MeansOfFinance?.termLoan?.termLoan ?? 0);
  const annualRate =
    Number(formData?.ProjectReportSetting?.interestOnTL ?? 0) / 100;
  const MOR = Number(formData?.ProjectReportSetting?.MoratoriumPeriod ?? 0); // months
  const TOTAL_MONTHS = Number(
    formData?.ProjectReportSetting?.RepaymentMonths ?? 0
  );

  // ---- REPAYMENT METHOD -> cadence in months (case/typo tolerant) ----
  const rmRaw = String(
    formData?.ProjectReportSetting?.SelectRepaymentMethod || "Monthly"
  )
    .toLowerCase()
    .replace(/\s|-/g, "");

  const cadence =
    rmRaw.includes("quarter") || rmRaw.includes("quater") || rmRaw === "qtr"
      ? 3
      : rmRaw.includes("semiannual") ||
        rmRaw.includes("semianual") ||
        rmRaw.includes("semiannually")
      ? 6
      : rmRaw.includes("annual") || rmRaw.includes("year")
      ? 12
      : 1; // monthly default

  // We repay on the *last* month of each cadence window relative to the start month.
  // Example: start=April (offset 0), Quarterly=3 => offsets 2,5,8,11 => Jun, Sep, Dec, Mar
  const phase = cadence - 1;

  const alignFirst = (start, step, phase) => {
    const s = Number(start) || 0;
    const stp = Number(step) || 1;
    const ph = Number(phase) || 0;
    const delta = (ph - (s % stp) + stp) % stp;
    return s + delta;
  };

  // first eligible repayment month offset counting from the selected *start month*
  const firstRepayOffset = alignFirst(MOR, cadence, phase);

  // number of repayment *events* (not months)
  const eventsCount =
    firstRepayOffset >= TOTAL_MONTHS
      ? 0
      : Math.floor((TOTAL_MONTHS - 1 - firstRepayOffset) / cadence) + 1;

  // principal per repayment event (last one clears rounding)
  const principalPerEvent = eventsCount > 0 ? TL / eventsCount : 0;

  // We repay on the *last* month of each cadence window relative to the starting month.
  // Example: start=April, Quarterly (3) -> months with offsets 2,5,8,11 => Jun, Sep, Dec, Mar

  let repaymentPeriod = 1; // Default to monthly
  let periodsInYear = 12; // Default to monthly (12 months in a year)

  // Keep your existing months array (you have April→March). Use whatever you already use.
  const MONTHS = [
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

  // safe mod
  const imod = (n, m = 12) => ((n % m) + m) % m;

  // 3-letter lowercase like "jan", "apr"
  const m3 = (name) => name.slice(0, 3).toLowerCase();

  if (repaymentMethod === "Quarterly") {
    repaymentPeriod = 3; // Every 3 months
    periodsInYear = 4; // 4 periods in a year (quarterly)
  } else if (repaymentMethod === "Semi-annually") {
    repaymentPeriod = 6; // Every 6 months
    periodsInYear = 2; // 2 periods in a year (semi-annually)
  } else if (repaymentMethod === "Annually") {
    repaymentPeriod = 12; // Every 12 months
    periodsInYear = 1; // 1 period in a year (annually)
  }

  let totalRepaymentPeriods =
    (repaymentMonths - moratoriumPeriod) / repaymentPeriod; // Total repayment periods
  let fixedPrincipalRepayment = termLoan / totalRepaymentPeriods; // Calculate fixed repayment per period

  // ✅ Correct the total repayment months (including moratorium)

  let effectiveRepaymentMonths = repaymentMonths - moratoriumPeriod;
  // let fixedPrincipalRepayment =
  //   effectiveRepaymentMonths > 0 ? termLoan / effectiveRepaymentMonths : 0;

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

  // Label for a period ending at absolute offset `endAbsOff` from the start month,
  // covering `cadence` months (3 = quarter, 6 = semi, 12 = annual).
  const periodLabelAt = (endAbsOff, cadence, startMonthIndex) => {
    const endIdx = imod(startMonthIndex + endAbsOff);
    const startIdx = imod(endIdx - (cadence - 1));
    return `${m3(MONTHS[startIdx])}-${m3(MONTHS[endIdx])}`;
  };

  /**
   * Your same alignment from earlier:
   * - cadence = 3 (Quarterly) / 6 (Semi-annual) / 12 (Annual)
   * - phase = cadence - 1  -> we repay on the *last* month of each window
   */

  // Precompute labels for all events
  const eventEndOffsets = Array.from(
    { length: eventsCount },
    (_, i) => firstRepayOffset + i * cadence
  );
  const periodLabels = eventEndOffsets.map((off) =>
    periodLabelAt(off, cadence, startMonthIndex)
  );

  const capitalizeFirstLetter = (str) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const labelForEntry = (absOff) => {
    if (cadence === 1) {
      // Capitalize the month abbreviation and return it
      return capitalizeFirstLetter(MONTHS[imod(startMonthIndex + absOff)]);
    }
    if (absOff < firstRepayOffset) return ""; // moratorium
    if ((absOff - firstRepayOffset) % cadence !== 0) return ""; // not an event month

    // Map offset → index
    const idx = Math.floor((absOff - firstRepayOffset) / cadence);

    // Capitalize the period label if it exists
    return periodLabels[idx] ? capitalizeFirstLetter(periodLabels[idx]) : "";
  };

  // let remainingBalance = termLoan; // Remaining loan balance

  let repaymentStartIndex = startMonthIndex; // Start from selected month

  const financialYear = parseInt(
    formData.ProjectReportSetting.FinancialYear || 2025
  );

  // let data = [];

  // Update the months array to accommodate quarterly, semi-annual, or annual repayment
  let monthsForRepayment = [];
  if (repaymentMethod === "Monthly") {
    monthsForRepayment = months; // Monthly
  } else if (repaymentMethod === "Quarterly") {
    monthsForRepayment = months.filter((month, index) => index % 3 === 0); // Every 3 months (quarterly)
  } else if (repaymentMethod === "Semi-annually") {
    monthsForRepayment = months.filter((month, index) => index % 6 === 0); // Every 6 months (semi-annually)
  } else if (repaymentMethod === "Annually") {
    monthsForRepayment = months.filter((month, index) => index % 12 === 0); // Every 12 months (annually)
  }

  let data = [];

  let monthsLeft = TOTAL_MONTHS; // includes moratorium
  let remainingBalance = TL;
  let globalOffset = 0; // 0..TOTAL_MONTHS-1 since start month
  let repayEventNo = 0;

  while (monthsLeft > 0) {
    const yearData = [];
    const firstMonth = data.length === 0 ? startMonthIndex : 0;

    for (let i = firstMonth; i < 12 && monthsLeft > 0; i++) {
      const principalOpeningBalance = remainingBalance;

      // A month is a repayment month if we are past MOR and aligned to cadence/phase
      const isRepaymentMonth =
        Number.isFinite(firstRepayOffset) &&
        globalOffset >= firstRepayOffset &&
        (globalOffset - firstRepayOffset) % cadence === 0;

      // principal only on repayment months
      let principalRepayment = 0;
      if (isRepaymentMonth && remainingBalance > 0) {
        principalRepayment =
          repayEventNo === eventsCount - 1
            ? remainingBalance
            : principalPerEvent;
        repayEventNo += 1;
      }

      console.log("debtEquityOption :", debtEquityOption);

      if (debtEquityOption === "Equity") {
        principalRepayment = 0;
      }

      const principalClosingBalance = Math.max(
        0,
        principalOpeningBalance - principalRepayment
      );

      const interestRate = formData.ProjectReportSetting.interestOnTL / 100; // Annual rate as a decimal
      let interestLiability = 0; // Initialize interest liability

      // Adjust the interest calculation based on the selected repayment method
      if (cadence === 1) {
        // Monthly Repayment
        interestLiability = principalOpeningBalance * (interestRate / 12); // Monthly interest rate
      } else if (cadence === 3) {
        // Quarterly Repayment
        interestLiability = principalOpeningBalance * (interestRate / 4); // Quarterly interest rate
      } else if (cadence === 6) {
        // Semi-Annually Repayment
        interestLiability = principalOpeningBalance * (interestRate / 2); // Semi-annual interest rate
      } else if (cadence === 12) {
        // Annually Repayment
        interestLiability = principalOpeningBalance * interestRate; // Annual interest rate
      }

      const totalRepayment =
        principalRepayment +
        (debtEquityOption === "Equity" || principalRepayment > 0
          ? interestLiability
          : 0);

      yearData.push({
        month: months[i],
        principalOpeningBalance,
        principalRepayment,
        principalClosingBalance,
        interestLiability,
        totalRepayment,
        isRepaymentMonth,
        absOffset: globalOffset, // helpful for FY logic below
      });

      remainingBalance = principalClosingBalance;
      monthsLeft -= 1;
      globalOffset += 1;
    }

    data.push(yearData);
  }

  // ✅ Compute Yearly Total Principal Repayment
  const computedYearlyPrincipalRepayment = data.map((yearData) =>
    yearData.reduce((sum, entry) => sum + entry.principalRepayment, 0)
  );

  useEffect(() => {
    setYearlyPrincipalRepayment(computedYearlyPrincipalRepayment);

    if (onPrincipalRepaymentCalculated) {
      onPrincipalRepaymentCalculated(computedYearlyPrincipalRepayment);
    }
  }, []);

  // ─── USEEFFECT TO SEND & CONSOLE MARCH PRINCIPAL CLOSING BALANCES ──────
useEffect(() => {
  if (!Array.isArray(data)) return;

  const yearlyInterestLiabilities = [];

  data.forEach((yearData) => {
    let totalPrincipalRepayment = 0;
    let totalInterestLiability = 0;
    let totalRepayment = 0;

    yearData.forEach((entry) => {
      // Skip moratorium months (months within the moratorium period)
      if (entry.absOffset < moratoriumPeriod) return;

      // Calculate totalPrincipalRepayment
      totalPrincipalRepayment += entry.principalRepayment;

      // Apply the logic for totalInterestLiability calculation
      totalInterestLiability +=
        entry.principalRepayment > 0 || debtEquityOption === "Equity"
          ? entry.interestLiability
          : 0;

      // Calculate totalRepayment (principal + interest)
      totalRepayment +=
        entry.principalRepayment +
        (entry.principalRepayment > 0 || debtEquityOption === "Equity"
          ? entry.interestLiability
          : 0);
    });

    // If principal repayment is 0 and debtEquityOption is not "Equity", reset interest liability
    if (totalPrincipalRepayment === 0 && debtEquityOption !== "Equity") {
      totalInterestLiability = 0;
      totalRepayment = 0;
    }

    // Push the calculated totalInterestLiability for the year
    yearlyInterestLiabilities.push(totalInterestLiability);
  });

  // Set the calculated yearly interest liabilities
  setYearlyInterestLiabilities(yearlyInterestLiabilities);

  // Call onInterestCalculated if available
  if (onInterestCalculated) {
    onInterestCalculated(yearlyInterestLiabilities);
  }
}, [JSON.stringify(data), debtEquityOption, moratoriumPeriod]);




   console.log("yearlyInterestLiabilities from Repaymnet:", yearlyInterestLiabilities);

  useEffect(() => {
    const marchClosingBalances = data.map((yearData) => {
      const marchEntry = yearData.find((entry) => entry.month === "March");
      return marchEntry ? marchEntry.principalClosingBalance : 0;
    });

    // console.log("Original March Principal Closing Balances:", marchClosingBalances);

    if (onMarchClosingBalanceCalculated) {
      onMarchClosingBalanceCalculated(marchClosingBalances);
    }
  }, [JSON.stringify(data), onMarchClosingBalanceCalculated]);

  let yearCounter = 1; // ✅ Separate counter for valid years
  // ─────────────────────────────────────────────────────────────────────────

  const formatNumber = (value) => {
    const formatType = formData?.ProjectReportSetting?.Format || "1"; // Default to Indian Format
    if (value === undefined || value === null || isNaN(value)) return "0.00"; // ✅ Handle invalid values with 2 decimals

    switch (formatType) {
      case "1": // Indian Format (1,23,456.00)
        return new Intl.NumberFormat("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(value);

      case "2": // USD Format (1,123,456.00)
        return new Intl.NumberFormat("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(value);

      case "3": // Generic Indian Format (1,23,456.00)
        return new Intl.NumberFormat("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(value);

      default: // Default to Indian Format with 2 decimal places
        return new Intl.NumberFormat("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(value);
    }
  };

  let globalMonthIndex = 0;
  let finalRepaymentReached = false;
  let displayYearCounter = 1; // 👈 Start counting from 1 (for S. No.)
  let globalMonthCounter = 0; // 👈 To calculate absolute months for moratorium

  return (
    <>
      <Page style={[styles.page, { paddingTop: 40 }]}>
        <View style={styleExpenses.paddingx}>
          {/* businees name and financial year  */}
          <View>
            <Text style={styles.businessName}>
              {formData?.AccountInformation?.businessName || "Business Bame"}
            </Text>
            <Text style={styles.FinancialYear}>
              Financial Year{" "}
              {formData?.ProjectReportSetting?.FinancialYear
                ? `${formData.ProjectReportSetting.FinancialYear}-${(
                    parseInt(formData.ProjectReportSetting.FinancialYear) + 1
                  )
                    .toString()
                    .slice(-2)}`
                : "2025-26"}
            </Text>
          </View>

          {/* Amount format */}

          <View
            style={{
              display: "flex",
              alignContent: "flex-end",
              justifyContent: "flex-end",
              alignItems: "flex-end",
            }}
          >
            <Text style={[styles.AmountIn, styles.italicText]}>
              (Amount In{" "}
              {
                formData?.ProjectReportSetting?.AmountIn === "rupees"
                  ? "Rs." // Show "Rupees" if "rupees" is selected
                  : formData?.ProjectReportSetting?.AmountIn === "thousand"
                  ? "Thousands" // Show "Thousands" if "thousand" is selected
                  : formData?.ProjectReportSetting?.AmountIn === "lakhs"
                  ? "Lakhs" // Show "Lakhs" if "lakhs" is selected
                  : formData?.ProjectReportSetting?.AmountIn === "crores"
                  ? "Crores" // Show "Crores" if "crores" is selected
                  : formData?.ProjectReportSetting?.AmountIn === "millions"
                  ? "Millions" // Show "Millions" if "millions" is selected
                  : "" // Default case, in case the value is not found (you can add a fallback text here if needed)
              }
              )
            </Text>
          </View>

          <View>
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
                  },
                ]}
              >
                Number of Years ={" "}
                {Math.floor(formData.ProjectReportSetting.RepaymentMonths / 12)}{" "}
                years
                {formData.ProjectReportSetting.RepaymentMonths % 12 !== 0 &&
                  ` ${
                    formData.ProjectReportSetting.RepaymentMonths % 12
                  } months`}
              </Text>
            </View>

            {/* table header  */}

            <View style={[styles.table, { marginTop: "10px" }]}>
              <View style={styles.tableHeader}>
                <Text
                  style={[
                    styles.serialNoCell,
                    styleExpenses.sno,
                    styleExpenses.fontBold,
                    {
                      width: "8%",
                      paddingHorizontal: "1px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    },
                  ]}
                >
                  S. No.
                </Text>
                <Text
                  style={[
                    styles.detailsCell,
                    styleExpenses.fontBold,
                    {
                      textAlign: "center",
                      width: "15.35%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    },
                  ]}
                >
                  Years
                </Text>
                <Text
                  style={[
                    styles.detailsCell,
                    styleExpenses.fontBold,
                    {
                      textAlign: "center",
                      width: "15.35%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    },
                  ]}
                >
                  Principal Opening Balance
                </Text>
                <Text
                  style={[
                    styles.detailsCell,
                    styleExpenses.fontBold,
                    {
                      textAlign: "center",
                      width: "15.35%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    },
                  ]}
                >
                  Principal Repayment
                </Text>
                <Text
                  style={[
                    styles.detailsCell,
                    styleExpenses.fontBold,
                    {
                      textAlign: "center",
                      width: "15.35%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    },
                  ]}
                >
                  Principal Closing Balance
                </Text>
                <Text
                  style={[
                    styles.detailsCell,
                    styleExpenses.fontBold,
                    {
                      textAlign: "center",
                      width: "15.35%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    },
                  ]}
                >
                  {debtEquityOption === "Equity"
                    ? "Divident Payout @ _ %"
                    : "Interest Liability"}
                </Text>
                <Text
                  style={[
                    styles.detailsCell,
                    styleExpenses.fontBold,
                    {
                      textAlign: "center",
                      width: "15.35%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    },
                  ]}
                >
                  Total Repayment
                </Text>
              </View>
            </View>

            {/* Table Body */}
            {data.map((yearData, yearIndex) => {
              const moratoriumPeriod = parseInt(
                formData?.ProjectReportSetting?.MoratoriumPeriod || 0
              );

              let filteredYearData = [...yearData];

              // Check if every month in this year is within the moratorium
              let futureCounter = globalMonthCounter;
              const isFullYearInMoratorium = filteredYearData.every(
                (e) => e.absOffset < MOR
              );

              globalMonthCounter += filteredYearData.length;

              // Initialize total repayment for only visible months
              // Render Only Valid Months
              const visibleMonths = filteredYearData.filter(
                (e) => e.isRepaymentMonth
              );

              let totalPrincipalRepayment = 0;
              let totalInterestLiability = 0;
              let totalRepayment = 0;

              visibleMonths.forEach((e) => {
                totalPrincipalRepayment += e.principalRepayment;

                // Include interest liability even if principalRepayment is 0 when "Equity" is selected
                totalInterestLiability +=
                  e.principalRepayment > 0 || debtEquityOption === "Equity"
                    ? e.interestLiability
                    : 0;

                totalRepayment +=
                  e.principalRepayment +
                  (e.principalRepayment > 0 || debtEquityOption === "Equity"
                    ? e.interestLiability
                    : 0);
              });

              // console.log(
              //   `Year ${
              //     financialYear + yearIndex
              //   }: Total Repayment for Visible Months: ${totalRepayment}`
              // );

              return (
                <View
                  key={yearIndex}
                  wrap={false}
                  style={[
                    { borderLeftWidth: 0 },
                    {
                      position: "relative",
                      zIndex: 1,
                      borderLeftWidth: 1,
                      borderTopWidth: 1,
                    },
                  ]}
                >
                  {/* Year Row */}
                  {!isFullYearInMoratorium && (
                    <View style={[stylesMOF.row, { borderBottomWidth: 0 }]}>
                      <Text
                        style={[
                          styles.serialNumberCellStyle,
                          { width: "8%", paddingTop: "5px" },
                        ]}
                      >
                        {displayYearCounter++}
                      </Text>

                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.bordernone,
                          styleExpenses.fontBold,
                          {
                            textAlign: "left",
                            width: "15.35%",
                            borderLeftWidth: 1,
                            paddingTop: "5px",
                          },
                        ]}
                      >
                        {financialYear + yearIndex}-{" "}
                        {(financialYear + yearIndex + 1).toString().slice(-2)}
                      </Text>

                      {/* Empty columns for alignment */}
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Text
                          key={idx}
                          style={[
                            stylesCOP.particularsCellsDetail,
                            styleExpenses.fontSmall,
                            {
                              textAlign: "center",
                              width: "15.35%",
                              paddingTop: "5px",
                            },
                          ]}
                        />
                      ))}
                    </View>
                  )}

                  {/* Render Only Valid Months */}
                  {visibleMonths.map((entry, monthIndex) => {
                    if (
                      entry.principalClosingBalance === 0 &&
                      !finalRepaymentReached
                    ) {
                      finalRepaymentReached = true;
                    } else if (finalRepaymentReached) {
                      return null;
                    }

                    // console.log("Interst Liability : (",monthIndex,")", entry.interestLiability)

                    // console.log(
                    //   "Interst Liability : (",
                    //   monthIndex,
                    //   ")",
                    //   entry.totalRepayment
                    // );

                    return (
                      <View
                        key={monthIndex}
                        style={[
                          stylesMOF.row,
                          styles.tableRow,
                          { borderBottomWidth: 0, borderTopWidth: 0 },
                        ]}
                      >
                        <Text
                          style={[
                            styles.serialNumberCellStyle,
                            { width: "8%" },
                          ]}
                        >
                          {"\u00A0"}
                        </Text>

                        <Text
                          style={[
                            stylesCOP.detailsCellDetail,
                            styleExpenses.particularWidth,
                            styleExpenses.bordernone,
                            {
                              textAlign: "left",
                              width: "15.35%",
                              borderLeftWidth: 1,
                            },
                          ]}
                        >
                          {cadence === 1
                            ? entry.month
                            : labelForEntry(entry.absOffset)}
                        </Text>
                        <Text
                          style={[
                            stylesCOP.particularsCellsDetail,
                            styleExpenses.fontSmall,
                            { textAlign: "center", width: "15.35%" },
                          ]}
                        >
                          {formatNumber(entry.principalOpeningBalance)}
                        </Text>
                        <Text
                          style={[
                            stylesCOP.particularsCellsDetail,
                            styleExpenses.fontSmall,
                            { textAlign: "center", width: "15.35%" },
                          ]}
                        >
                          {formatNumber(entry.principalRepayment)}
                        </Text>
                        <Text
                          style={[
                            stylesCOP.particularsCellsDetail,
                            styleExpenses.fontSmall,
                            { textAlign: "center", width: "15.35%" },
                          ]}
                        >
                          {formatNumber(entry.principalClosingBalance)}
                        </Text>
                        <Text
                          style={[
                            stylesCOP.particularsCellsDetail,
                            styleExpenses.fontSmall,
                            { textAlign: "center", width: "15.35%" },
                          ]}
                        >
                          {/* {formatNumber(
                            entry.principalRepayment === 0
                              ? 0
                              : entry.interestLiability
                          )} */}

                          {formatNumber(
                            debtEquityOption === "Equity" ||
                              entry.principalRepayment !== 0
                              ? entry.interestLiability
                              : 0
                          )}
                        </Text>
                        <Text
                          style={[
                            stylesCOP.particularsCellsDetail,
                            styleExpenses.fontSmall,
                            { textAlign: "center", width: "15.35%" },
                          ]}
                        >
                          {formatNumber(entry.totalRepayment)}
                        </Text>
                      </View>
                    );
                  })}

                  {/* Total Row for the Year */}
                  {!isFullYearInMoratorium && (
                    <View
                      style={[
                        stylesMOF.row,
                        styles.tableRow,
                        { borderTopWidth: 0 },
                      ]}
                    >
                      <Text
                        style={[styles.serialNumberCellStyle, { width: "8%" }]}
                      ></Text>
                      <Text
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                          {
                            textAlign: "center",
                            width: "15.35%",
                            borderLeftWidth: 1,
                          },
                        ]}
                      ></Text>
                      <Text
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                          {
                            textAlign: "center",
                            width: "15.35%",
                          },
                        ]}
                      ></Text>

                      <Text
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                          styleExpenses.fontBold,
                          {
                            textAlign: "center",
                            width: "15.35%",
                            borderTopWidth: 1,
                          },
                        ]}
                      >
                        {formatNumber(totalPrincipalRepayment)}
                      </Text>

                      <Text
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                          {
                            textAlign: "center",
                            width: "15.35%",
                            borderLeftWidth: 1,
                          },
                        ]}
                      ></Text>
                      <Text
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                          styleExpenses.fontBold,
                          {
                            textAlign: "center",
                            width: "15.35%",
                            borderTopWidth: 1,
                          },
                        ]}
                      >
                        {formatNumber(totalInterestLiability)}
                      </Text>
                      <Text
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                          styleExpenses.fontBold,
                          {
                            textAlign: "center",
                            width: "15.35%",
                            borderTopWidth: 1,
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

          {/* businees name and Client Name  */}
          <View
            style={[
              {
                display: "flex",
                flexDirection: "column",
                gap: "80px",
                alignItems: "flex-end",
                justifyContent: "flex-end",
                marginTop: "60px",
              },
            ]}
          >
            <Text style={[styles.businessName, { fontSize: "10px" }]}>
              {formData?.AccountInformation?.businessName || "Business Name"}
            </Text>
            <Text style={[styles.FinancialYear, { fontSize: "10px" }]}>
              {formData?.AccountInformation?.businessOwner || "businessOwner"}
            </Text>
          </View>
        </View>
      </Page>
    </>
  );
};

export default React.memo(Repayment);
