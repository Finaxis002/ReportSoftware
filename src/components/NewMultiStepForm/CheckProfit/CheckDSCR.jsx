import React, { useMemo, useEffect } from "react";
import { Page, View, Text } from "@react-pdf/renderer";
import { styles, stylesCOP, stylesMOF, styleExpenses } from "../PDFComponents/Styles";
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

const CheckDSCR = ({
  formData,
  yearlyInterestLiabilities,
  totalDepreciationPerYear,
  yearlyPrincipalRepayment, // ✅ Receiving total principal repayment
  netProfitAfterTax,
  financialYearLabels,
  DSCRSend,
  formatNumber,
}) => {
  // console.log("Yearly Principal Repayment:", yearlyPrincipalRepayment); // ✅ Debugging check

  const years = formData?.ProjectReportSetting?.ProjectionYears || 5; // Default to 5 years if not provided
  const projectionYears =
    parseInt(formData?.ProjectReportSetting?.ProjectionYears) || 0;

  // ✅ Months Array for Indexing
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

  const selectedMonth =
    formData?.ProjectReportSetting?.SelectStartingMonth || "April";
  const x = monthMap[selectedMonth]; // Starting month mapped to FY index

  const moratoriumPeriodMonths =
    parseInt(formData?.ProjectReportSetting?.MoratoriumPeriod) || 0;

  const rateOfExpense =
    (formData?.ProjectReportSetting?.rateOfExpense || 0) / 100;

  // Function to handle moratorium period spillover across financial years
  const calculateMonthsPerYear = () => {
    let monthsArray = [];
    let remainingMoratorium = moratoriumPeriodMonths;
    for (let year = 1; year <= projectionYears; year++) {
      let monthsInYear = 12;
      if (year === 1) {
        monthsInYear = 12 - x + 1; // Months left in the starting year
      }

      if (remainingMoratorium >= monthsInYear) {
        monthsArray.push(0); // Entire year under moratorium
        remainingMoratorium -= monthsInYear;
      } else {
        monthsArray.push(monthsInYear - remainingMoratorium); // Partial moratorium impact
        remainingMoratorium = 0;
      }
    }
    return monthsArray;
  };

  const monthsPerYear = calculateMonthsPerYear();

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

  // Function to calculate interest on working capital considering moratorium period
  const calculateInterestOnWorkingCapital = useMemo(() => {
    return (interestAmount, yearIndex) => {
      const repaymentStartYear = Math.floor(moratoriumPeriodMonths / 12);
      const monthsInYear = monthsPerYear[yearIndex];

      if (monthsInYear === 0) {
        return 0; // No interest during moratorium
      } else {
        if (yearIndex === repaymentStartYear) {
          const monthsRemainingAfterMoratorium =
            12 - (moratoriumPeriodMonths % 12);
          return (interestAmount / 12) * monthsRemainingAfterMoratorium; // Apply partial interest in first repayment year
        } else if (yearIndex > repaymentStartYear) {
          return interestAmount; // From second year onwards, apply full interest
        } else {
          return 0; // No interest during moratorium
        }
      }
    };
  }, [moratoriumPeriodMonths, monthsPerYear, rateOfExpense]);
  const { Expenses = {} } = formData;
  const { normalExpense = [], directExpense = [] } = Expenses;

  // ✅ Compute Total Sum for Each Year
  const totalA = Array.from({
    length: formData.ProjectReportSetting.ProjectionYears || 0,
  }).map((_, yearIndex) => {
    if (yearIndex === 0) {
      return 0; // ✅ Set first year's total to 0
    } else {
      return (
        (netProfitAfterTax[yearIndex] || 0) +
        (totalDepreciationPerYear[yearIndex] || 0) +
        (yearlyInterestLiabilities[yearIndex] || 0) +
        (calculateInterestOnWorkingCapital(
          interestOnWorkingCapital[yearIndex] || 0,
          yearIndex
        ) || 0) // ✅ Correctly calling the function
      );
    }
  });

  // ✅ Compute Total (B) for Each Year
  const totalB = Array.from({
    length: formData.ProjectReportSetting.ProjectionYears || 0,
  }).map((_, yearIndex) => {
    return (
      (yearlyInterestLiabilities[yearIndex] || 0) + // ✅ Interest on Term Loan
      (calculateInterestOnWorkingCapital(
        interestOnWorkingCapital[yearIndex] || 0, // Pass interest amount
        yearIndex // Pass current year index
      ) || 0) + // ✅ Interest on Working Capital
      (yearlyPrincipalRepayment[yearIndex] || 0) // ✅ Repayment of Term Loan
    );
  });

  const DSCR = Array.from({
    length: formData.ProjectReportSetting.ProjectionYears || 0,
  }).map((_, yearIndex) => {
    return totalB[yearIndex] !== 0 ? totalA[yearIndex] / totalB[yearIndex] : 0; // ✅ Avoid division by zero
  });

  const totalDSCR = DSCR.reduce((sum, value) => sum + value, 0);
  // ✅ Filter out zero values from the beginning
  const validDSCRValues = DSCR.filter(
    (value, index) => !(index === 0 && value === 0)
  );

  // ✅ Memoize averageDSCR calculation
  const averageDSCR = useMemo(() => {
    if (validDSCRValues.length === 0) return 0;
    return (
      validDSCRValues.reduce((sum, value) => sum + value, 0) /
      validDSCRValues.length
    );
  }, [JSON.stringify(validDSCRValues)]); // Deep dependency check with stringify

  const numOfYearsUsedForAvg = validDSCRValues.length;

  useEffect(() => {
    // ✅ Only update if `averageDSCR` or `DSCR` changes
    DSCRSend((prev) => {
      const newDSCRData = {
        averageDSCR,
        DSCR, // ✅ Ensure DSCR is included
        numOfYearsUsedForAvg,
      };

      if (JSON.stringify(prev) !== JSON.stringify(newDSCRData)) {
        return newDSCRData;
      }
      return prev; // No change, so don't update state
    });

    // console.log("DSCR:", DSCR);
  }, [averageDSCR, DSCR, numOfYearsUsedForAvg]); // ✅ Correct dependency tracking

  return (
    <Page
      size={formData.ProjectReportSetting?.ProjectionYears > 12 ? "A3" : "A4"}
      orientation={
        formData.ProjectReportSetting?.ProjectionYears > 7
          ? "landscape"
          : "portrait"
      }
      style={[
        { paddingBottom: "30px", paddingLeft: "20px", paddingRight: "20px" },
      ]}
      wrap={false}
      break
    >
      <View style={[styles.table]}>
        <View style={styles.tableHeader}>
          <Text style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}>
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

          {/* Generate Dynamic Year Headers using financialYearLabels */}
          {financialYearLabels.map((yearLabel, yearIndex) => (
            <Text
              key={yearIndex}
              style={[styles.particularsCell, stylesCOP.boldText]}
            >
              {yearLabel}
            </Text>
          ))}
        </View>

        {/* DSCR (A/B) */}
        <View
          style={[
            stylesMOF.row,
            styles.tableRow,
            styleExpenses.totalRow,
            { borderWidth: 0 },
          ]}
        >
          <Text style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}>
            2
          </Text>
          <Text
            style={[
              stylesCOP.detailsCellDetail,
              styleExpenses.particularWidth,
              styleExpenses.bordernone,
              { fontWeight: "bold", fontFamily: "Roboto", textAlign: "left" },
            ]}
          >
            DSCR Ratio
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

        {/* Blank Row  */}

        <View
          style={[
            stylesMOF.row,
            styles.tableRow,
            styleExpenses.totalRow,
            { borderWidth: 0 },
          ]}
        >
          <Text
            style={[
              stylesCOP.serialNoCellDetail,
              styleExpenses.sno,
              { padding: "20px" },
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
                padding: "10px",
              },
            ]}
          ></Text>

          {/* ✅ Display Computed Total for Each Year */}
          {DSCR.map((totalValue, yearIndex) => (
            <Text
              key={yearIndex}
              style={[
                stylesCOP.particularsCellsDetail,
                stylesCOP.boldText,
                styleExpenses.fontSmall,
                { borderTopWidth: 0, padding: "10px" },
              ]}
            >
              {" "}
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
            { border: "1px solid #000" },
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
      </View>
    </Page>
  );
};

export default React.memo(CheckDSCR);
