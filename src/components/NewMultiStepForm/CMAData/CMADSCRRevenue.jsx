import React, { useEffect, useMemo, useState, useRef } from "react";
import { Page, View, Text, Image } from "@react-pdf/renderer";
import {
  styles,
  stylesCOP,
  stylesMOF,
  styleExpenses,
} from "../PDFComponents/Styles";
import { Font } from "@react-pdf/renderer";
import SAWatermark from "../Assets/SAWatermark";
import CAWatermark from "../Assets/CAWatermark";
import shouldHideFirstYear from "../PDFComponents/HideFirstYear";
import { makeCMAExtractors } from "../Utils/CMA/cmaExtractors";
import { CMAExtractorFinPos } from "../Utils/CMA/CMAExtractorFInPos";
import { CMAExtractorFundFlow } from "../Utils/CMA/CMAExtractorFundFlow";
import { CMAExtractorProfitability } from "../Utils/CMA/CMAExtractorProfitability";
import { ppid } from "process";

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



const CMADSCRRevenue = ({
  formData,
  directExpense,
  formatNumber,
  receivedtotalRevenueReceipts,
  pdfType,
  orientation,
}) => {
  const PPExtractor = CMAExtractorProfitability(formData);
  const extractors = makeCMAExtractors(formData);
  const yearLabels = extractors.yearLabels();

  // Defensive defaults for props that may be undefined
  formData = formData || {};

 

  const activeRowIndex = 0; // Define it or fetch dynamically if needed

  const projectionYears =
    parseInt(formData.ProjectReportSetting.ProjectionYears) || 0;

  const indirectExpense = (directExpense || []).filter(
    (expense) => expense.type === "indirect"
  );

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

  // Month Mapping
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

  const hideFirstYear = shouldHideFirstYear(receivedtotalRevenueReceipts);
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

  const isZeroValue = (val) => {
    const num = Number(val);
    return !num || num === 0; // covers 0, null, undefined, NaN, ""
  };

  const preliminaryExpensesTotal = Number(
    formData?.CostOfProject?.preliminaryExpensesTotal || 0
  );

  const preliminaryWriteOffYears = Number(
    formData?.CostOfProject?.preliminaryWriteOffYears || 0
  );

  // Calculate yearly write-off value
  const yearlyWriteOffAmount =
    preliminaryWriteOffYears > 0
      ? preliminaryExpensesTotal / preliminaryWriteOffYears
      : 0;

  // Generate the array for yearly values
  const preliminaryWriteOffPerYear = Array.from({
    length: projectionYears,
  }).map((_, index) => {
    const startIndex =  0;
    const endIndex = startIndex + preliminaryWriteOffYears;

    // 👇 Only insert value if it's within the write-off window
    if (index >= startIndex && index < endIndex) {
      return yearlyWriteOffAmount;
    }

    // 👇 Insert 0 for all other years (including hidden first year)
    return 0;
  });

  const isPreliminaryWriteOffAllZero = Array.from({
    length: hideFirstYear ? projectionYears - 1 : projectionYears,
  }).every((_, yearIndex) => {
    const adjustedYearIndex = hideFirstYear ? yearIndex + 1 : yearIndex;
    return preliminaryWriteOffPerYear[adjustedYearIndex] === 0;
  });

  console.log("Preliminary Write-Off Per Year:", preliminaryWriteOffPerYear);
  console.log(
    "Is Preliminary Write-Off All Zero:",
    isPreliminaryWriteOffAllZero
  );

  //////////////////////////////   new data
  const FinPosextractors = CMAExtractorFinPos(formData);
  const FundFlowExtractor = CMAExtractorFundFlow(formData);
  const totalRevenueReceipt = FinPosextractors.totalRevenueReceipt() || [];
  const value10reduceRevenueReceipt =
    PPExtractor.value10reduceRevenueReceipt() || [];
  const newRevenueReceipt = PPExtractor.newRevenueReceipt() || [];
  const ClosingStock = PPExtractor.ClosingStock() || [];
  const OpeningStock = PPExtractor.OpeningStock() || [];
  const adjustedRevenueValues = PPExtractor.adjustedRevenueValues() || [];
  const { totalSalaryAndWages } = CMAExtractorProfitability(formData);
  // const grossProfit = PPExtractor.grossProfit() || [];
  const interestOnTermLoan = PPExtractor.interestOnTermLoan() || [];
  const interestOnWCArray = PPExtractor.interestOnWCArray() || [];
  const depreciation = PPExtractor.depreciation() || [];
  const salaryandwages = extractors.salary();
  const rawmaterial = extractors.rawMaterial();
  const directExpensesArray = extractors.directExpenses?.() || [];
  const filteredDirectExpenses = directExpensesArray.filter(
    (exp) => exp.name !== "Raw Material Expenses / Purchases"
  );

  const OnlyfilteredDirectExpenses =
    filteredDirectExpenses.filter((expense) => expense.type === "direct") || [];

  const OnlyIndirectExpenses =
    filteredDirectExpenses.filter((expense) => expense.type === "indirect") ||
    [];

  console.log("OnlyfilteredDirectExpenses", OnlyfilteredDirectExpenses);
  const hasRawMaterial = rawmaterial.some((val) => Number(val) !== 0);
  const directExpenseStartSerial = hasRawMaterial ? 3 : 2;

  const totalDirectExpenses = Array.from({ length: projectionYears }).map(
    (_, idx) => {
      let totalSalary = Number(salaryandwages[idx] || 0);
      let totalMaterial = Number(rawmaterial[idx] || 0);

      // Sum values from OnlyfilteredDirectExpenses
      let totalDirectExpense = OnlyfilteredDirectExpenses.reduce(
        (sum, expense) => {
          const expenseValue = expense.values[idx] || 0; // Access the value for the specific year
          return sum + Number(expenseValue); // Add to the running total
        },
        0
      );

      // Return the total of salary, material, and direct expenses for the year
      return totalSalary + totalMaterial + totalDirectExpense;
    }
  );

  const totalIndirectExpenses = Array.from({ length: projectionYears }).map(
    (_, idx) => {
      let TermLoan = Number(interestOnTermLoan[idx] || 0);
      let WCArray = Number(interestOnWCArray[idx] || 0);
      let depreciationadd = Number(depreciation[idx] || 0);
      // Sum values from OnlyfilteredDirectExpenses
      let totalIndirectExpense = OnlyIndirectExpenses.reduce((sum, expense) => {
        const expenseValue = expense.values[idx] || 0; // Access the value for the specific year
        return sum + Number(expenseValue); // Add to the running total
      }, 0);
      const preliminaryExpense = preliminaryWriteOffPerYear[idx] || 0;
      // Return the total of salary, material, and direct expenses for the year
      return (
        TermLoan +
        WCArray +
        depreciationadd +
        totalIndirectExpense +
        preliminaryExpense
      );
    }
  );

  const netProfitBeforeTax = PPExtractor.netProfitBeforeTax() || [];

  const netProfitAfterTax = PPExtractor.netProfitAfterTax() || [];
  const Withdrawals = PPExtractor.Withdrawals() || [];
  const balanceTrfBalncSheet = PPExtractor.balanceTrfBalncSheet() || [];
  
  const grossProfit = Array.from({ length: projectionYears }).map(
    (_, i) => Number(newRevenueReceipt[i]) - Number(totalDirectExpenses[i])
  );

  const NPBT = Array.from({ length: projectionYears }).map(
    (_, i) => Number(grossProfit[i]) - Number(totalIndirectExpenses[i])
  );
 console.log('NPBT', NPBT)
  console.log('grossProfit', grossProfit)
   console.log('newRevenueReceipt', newRevenueReceipt)

  const incomeTax = formData?.ProjectReportSetting?.incomeTax || 0;
  const incomeTaxCalculation = Array.from({ length: projectionYears }).map(
    (_, i) => Number((Number(NPBT[i] || 0) * incomeTax) / 100)
  );

  const NPAT = Array.from({ length: projectionYears }).map(
    (_, i) => Number(NPBT[i]) - Number(incomeTaxCalculation[i])
  );

  const balanceTransferred = Array.from({ length: projectionYears }).map(
    (_, i) => Number(NPBT[i]) - Number(Withdrawals[i])
  );

  const cumulativeBalanceTransferred = [];
  balanceTransferred.forEach((amount, index) => {
    if (index === 0) {
      cumulativeBalanceTransferred.push(Math.max(amount, 0)); // First year, just the amount itself
    } else {
      // For subsequent years, sum of Balance Trf. and previous year's Cumulative Balance
      cumulativeBalanceTransferred.push(
        Math.max(amount + cumulativeBalanceTransferred[index - 1], 0)
      );
    }
  });

 const totalA = Array.from({length:projectionYears}).map((_, i)=>
    Number(NPAT[i] || 0)+
    Number(depreciation[i] || 0)+
    Number(interestOnTermLoan[i] || 0)+
    Number(interestOnWCArray[i] || 0)
)

const repaymentOfTL = formData?.computedData?.yearlyPrincipalRepayment || [] ;

const totalB = Array.from({length:projectionYears}).map((_, i)=>
    Number(interestOnTermLoan[i] || 0)+
    Number(interestOnWCArray[i] || 0)+
     Number(repaymentOfTL[i] || 0)
)

const dscr = Array.from({length:projectionYears}).map((_, i )=>{
    if(totalB[i] === 0 )return 0 ;
  return (Number(totalA[i] || 0)/
   Number(totalB[i] || 0))
}
)

// ✅ Filter out zero values from the beginning
  const validDSCRValues = dscr.filter(
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

  const generateFinancialYearLabels = useMemo(
      () => (startingFY, totalYears) => {
        const yearLabels = [];
        for (let i = 0; i < totalYears; i++) {
          const fromYear = startingFY + i;
          const toYear = (fromYear + 1) % 100; // Only last two digits for the second year
          yearLabels.push(`${fromYear}-${toYear < 10 ? "0" + toYear : toYear}`);
        }
        return yearLabels;
      },
      []
    );
  const financialYear =
    parseInt(formData.ProjectReportSetting.FinancialYear) || 2025; // Use the provided year
  const financialYearLabels = generateFinancialYearLabels(
    financialYear,
    projectionYears
  );

   const revenueReducePercentage = PPExtractor.revenueReducePercentage() || 10 ;
  return (
    <Page
      size={formData.ProjectReportSetting.ProjectionYears > 12 ? "A3" : "A4"}
      orientation={orientation}
      style={styles.page}
      wrap={false}
      break
    >
      {/* watermark  */}
      {pdfType &&
        pdfType !== "select option" &&
        (pdfType === "Sharda Associates" || pdfType === "CA Certified") && (
          <View
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 500,
              height: 700,
              marginLeft: -200,
              marginTop: -350,
              opacity: 0.4,
              zIndex: -1,
            }}
          >
            <Image
              src={pdfType === "Sharda Associates" ? SAWatermark : CAWatermark}
              style={{
                width: "100%",
                height: "100%",
              }}
            />
          </View>
        )}

      <View style={[styleExpenses.paddingx, { paddingBottom: "30px" }]}>
        {/* businees name and financial year  */}
        <View>
          <Text style={styles.businessName}>
            {formData?.AccountInformation?.businessName || "Business Name"}
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
          <View style={stylesCOP.heading}>
            <Text>Sensitivity Analysis</Text>
            <Text>Debt-Service Coverage Ratio (Revenue Reduced by {revenueReducePercentage}%)</Text>
          </View>
          <View style={[styles.table, { borderRightWidth: 0 }]}>
            <View style={styles.tableHeader}>
              <Text
                style={[
                  styles.serialNoCell,
                  styleExpenses.sno,
                  styleExpenses.fontBold,
                  { textAlign: "center" },
                ]}
              >
                S. No.
              </Text>
              <Text
                style={[
                  styles.detailsCell,
                  styleExpenses.particularWidth,
                  styleExpenses.fontBold,
                  { textAlign: "center" },
                ]}
              >
                Particulars
              </Text>

              {/* Generate Dynamic Year Headers using financialYearLabels */}
              {yearLabels.map((label, idx) => (
                <Text
                  key={label || idx} // <-- Add key here
                  style={[styles.particularsCell, stylesCOP.boldText]}
                >
                  {label}
                </Text>
              ))}
            </View>

            {/* Blank Row  */}
            <View
              style={[
                stylesMOF.row,
                styles.tableRow,
                styles.Total,
                {
                  border: 0,
                },
              ]}
            >
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  styleExpenses.sno,
                  styleExpenses.bordernone,
                  styles.Total,
                ]}
              ></Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                  styles.Total,
                  {},
                ]}
              ></Text>

              {yearLabels.map((label, idx) => (
                <Text
                  key={label || idx}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                    { paddingVertical: "5px" },
                  ]}
                ></Text>
              ))}
            </View>
            
             {/* Net Profit After Tax Calculation  */}
            <View style={[styles.tableRow]}>
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  {
                    // ✅ Ensure using the registered font
                    // ✅ Apply bold
                  },
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
              {NPAT.map((val, idx) => (
                <Text
                  key={idx}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    stylesCOP.boldText,
                    styleExpenses.fontSmall,
                    { borderLeftWidth: "0px" },
                  ]}
                >
                  {formatNumber(val)}
                </Text>
              ))}
            </View>

             {/* depreciation */}
            <View style={[styles.tableRow]}>
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  styleExpenses.sno,
                  styleExpenses.bordernone,
                  {},
                ]}
              >
                2
              </Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                  {},
                ]}
              >
                Depreciation
              </Text>

              {/* ✅ Display Precomputed Gross Profit Values */}
              {depreciation.map((val, idx) => (
                <Text
                  key={idx}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                  ]}
                >
                  {formatNumber(val)}
                </Text>
              ))}
            </View>


            {/* Interest on Term Loan */}
            <View style={[ styles.tableRow]}>
              <Text style={stylesCOP.serialNoCellDetail}>3</Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                ]}
              >
                Interest on Term Loan
              </Text>

              {/* ✅ Display Precomputed Gross Profit Values */}
              {interestOnTermLoan
               .slice(0, formData?.ProjectReportSetting?.ProjectionYears || 0)
              .map((val, idx) => (
                <Text
                  key={idx}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                  ]}
                >
                  {formatNumber(val)}
                </Text>
              ))}
            </View>

            {/* Interest on working capital */}
            <View style={[ styles.tableRow]}>
              <Text style={stylesCOP.serialNoCellDetail}>4</Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                ]}
              >
                Interest on Working Capital
              </Text>

              {/* ✅ Display Precomputed Gross Profit Values */}
              {interestOnWCArray.map((val, idx) => (
                <Text
                  key={idx}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                  ]}
                >
                  {formatNumber(val)}
                </Text>
              ))}
            </View>

             {/* total  */}
            <View style={[styles.tableRow, styles.totalRow, styles.Total]}>
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  {
                    // ✅ Ensure using the registered font
                    // ✅ Apply bold
                  },
                ]}
              >
                
              </Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                  {
                    // ✅ Ensure using the registered font
                    fontWeight: "bold", // ✅ Apply bold
                  },
                ]}
              >
                Total - A
              </Text>
              {/*  Display Precomputed Net Profit After Tax (NPAT) Values */}
              {totalA.map((val, idx) => (
                <Text
                  key={idx}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    stylesCOP.boldText,
                    styleExpenses.fontSmall,
                    styles.Total,
                    { borderLeftWidth: "0px" },
                  ]}
                >
                  {formatNumber(val)}
                </Text>
              ))}
            </View>

            {/* Blank Row  */}
            <View
              style={[
                stylesMOF.row,
                styles.tableRow,
                styles.Total,
                {
                  border: 0,
                },
              ]}
            >
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  styleExpenses.sno,
                  styleExpenses.bordernone,
                  styles.Total,
                ]}
              ></Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                  styles.Total,
                  {},
                ]}
              ></Text>

              {yearLabels.map((label, idx) => (
                <Text
                  key={label || idx}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                    { paddingVertical: "5px" },
                  ]}
                ></Text>
              ))}
            </View>

             {/* Interest on Term Loan */}
            <View style={[ styles.tableRow]}>
              <Text style={stylesCOP.serialNoCellDetail}>1</Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                ]}
              >
                Interest on Term Loan
              </Text>

              {/* ✅ Display Precomputed Gross Profit Values */}
              {interestOnTermLoan
               .slice(0, formData?.ProjectReportSetting?.ProjectionYears || 0)
              .map((val, idx) => (
                <Text
                  key={idx}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                  ]}
                >
                  {formatNumber(val)}
                </Text>
              ))}
            </View>

            {/* Interest on working capital */}
            <View style={[ styles.tableRow]}>
              <Text style={stylesCOP.serialNoCellDetail}>2</Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                ]}
              >
                Interest on Working Capital
              </Text>

              {/* ✅ Display Precomputed Gross Profit Values */}
              {interestOnWCArray.map((val, idx) => (
                <Text
                  key={idx}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                  ]}
                >
                  {formatNumber(val)}
                </Text>
              ))}
            </View>

             {/* repayment of term loan */}
            <View style={[ styles.tableRow]}>
              <Text style={stylesCOP.serialNoCellDetail}>3</Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                ]}
              >
                Repayment of Term Loan
              </Text>

              {/* ✅ Display Precomputed Gross Profit Values */}
              {repaymentOfTL
               .slice(0, formData?.ProjectReportSetting?.ProjectionYears || 0)
              .map((val, idx) => (
                <Text
                  key={idx}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                  ]}
                >
                  {formatNumber(val)}
                </Text>
              ))}
            </View>

              {/* total B  */}
            <View style={[styles.tableRow, styles.totalRow, styles.Total]}>
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  {
                    // ✅ Ensure using the registered font
                    // ✅ Apply bold
                  },
                ]}
              >
                
              </Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                  {
                    // ✅ Ensure using the registered font
                    fontWeight: "bold", // ✅ Apply bold
                  },
                ]}
              >
                Total - B
              </Text>
              {/*  Display Precomputed Net Profit After Tax (NPAT) Values */}
              {totalB.map((val, idx) => (
                <Text
                  key={idx}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    stylesCOP.boldText,
                    styleExpenses.fontSmall,
                    styles.Total,
                    { borderLeftWidth: "0px" },
                  ]}
                >
                  {formatNumber(val)}
                </Text>
              ))}
            </View>

               {/* Blank Row  */}
            <View
              style={[
                stylesMOF.row,
                styles.tableRow,
                styles.Total,
                {
                  border: 0,
                },
              ]}
            >
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  styleExpenses.sno,
                  styleExpenses.bordernone,
                  styles.Total,
                ]}
              ></Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                  styles.Total,
                  {},
                ]}
              ></Text>

              {yearLabels.map((label, idx) => (
                <Text
                  key={label || idx}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                    { paddingVertical: "5px" },
                  ]}
                ></Text>
              ))}
            </View>


            {/* DSCR (A/B) */}
            <View style={[styles.tableRow, styles.totalRow, styles.Total]}>
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  {
                    // ✅ Ensure using the registered font
                    // ✅ Apply bold
                  },
                ]}
              >
                
              </Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                  {
                    // ✅ Ensure using the registered font
                    fontWeight: "bold", // ✅ Apply bold
                  },
                ]}
              >
                DSCR (A/B)
              </Text>
              {/*  Display Precomputed Net Profit After Tax (NPAT) Values */}
              {dscr.map((val, idx) => (
                <Text
                  key={idx}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    stylesCOP.boldText,
                    styleExpenses.fontSmall,
                    styles.Total,
                    { borderLeftWidth: "0px" },
                  ]}
                >
                  {formatNumber(val)}
                </Text>
              ))}
            </View>

           {/*avg dscr */}
            {/* <View style={[styles.tableRow, styles.totalRow, styles.Total]}>
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  {
                    // ✅ Ensure using the registered font
                    // ✅ Apply bold
                  },
                ]}
              >
                
              </Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                  {
                    // ✅ Ensure using the registered font
                    fontWeight: "bold", // ✅ Apply bold
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
                    styles.Total,
                    { borderLeftWidth: "0px" },
                  ]}
                >
                  {formatNumber(averageDSCR)}
                </Text>
              
            </View> */}

             {/* ✅ Display Average DSCR */}
                    <View
                      style={[
                        stylesMOF.row,
                        styles.tableRow,
                        styleExpenses.totalRow,
                        { borderWidth: 0 },
                      ]}
                    >
                     
                      <Text
                        style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}
                      ></Text>
            
                      
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                  {
                    // ✅ Ensure using the registered font
                    fontWeight: "bold", // ✅ Apply bold
                  },
                        ]}
                      >
                        Average DSCR
                      </Text>
            
                      
            
                      {financialYearLabels
                        // .slice(hideFirstYear ? 1 : 0) // ✅ Skip first year if receivedtotalRevenueReceipts[0] < 0
                        .map((yearLabel, yearIndex , arr) => {
                          const visibleLabels = financialYearLabels.slice(
                            hideFirstYear ? 1 : 0
                          );
                          const centerIndex = Math.floor(visibleLabels.length / 2); // ✅ Find center index
                          const isLast = yearIndex === arr.length - 1;
            
                          return (
                            <Text
                              key={yearIndex}
                              style={[
                                stylesCOP.particularsCellsDetail,
                                styleExpenses.fontSmall,
                                styles.Total,
                                {
                                  fontWeight: "bold",
                                  
                                  textAlign: "center",
                                  borderWidth: 0,
                                  ...(isLast && { borderRightWidth:1 }),
                                },
                              ]}
                              
                            >
                              {yearIndex === centerIndex
                                ? (parseFloat(averageDSCR).toFixed(2)) // ✅ Display only in the center cell
                                : ""}
                            </Text>
                          );
                        })}
                    </View>

          </View>
        </View>

       
        <View
          style={[
            {
              display: "flex",
              flexDirection: "row", // ✅ Change to row
              justifyContent: "space-between", // ✅ Align items left and right
              alignItems: "center",
              marginTop: 30,
            },
          ]}
        >
          <View
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              paddingTop: 100,
            }}
          >
            {/* ✅ CA Name (Conditional Display) */}
            {formData?.ProjectReportSetting?.CAName?.value ? (
              <Text
                style={[
                  styles.caName,
                  { fontSize: "10px", fontWeight: "bold" },
                ]}
              >
                CA {formData?.ProjectReportSetting?.CAName?.value}
              </Text>
            ) : null}

            {/* ✅ Membership Number (Conditional Display) */}
            {formData?.ProjectReportSetting?.MembershipNumber?.value ? (
              <Text style={[styles.membershipNumber, { fontSize: "10px" }]}>
                M. No.:{" "}
                {formData?.ProjectReportSetting?.MembershipNumber?.value}
              </Text>
            ) : null}

            {/* ✅ UDIN Number (Conditional Display) */}
            {formData?.ProjectReportSetting?.UDINNumber?.value ? (
              <Text style={[styles.udinNumber, { fontSize: "10px" }]}>
                UDIN: {formData?.ProjectReportSetting?.UDINNumber?.value}
              </Text>
            ) : null}

            {/* ✅ Mobile Number (Conditional Display) */}
            {formData?.ProjectReportSetting?.MobileNumber?.value ? (
              <Text style={[styles.mobileNumber, { fontSize: "10px" }]}>
                Mob. No.: {formData?.ProjectReportSetting?.MobileNumber?.value}
              </Text>
            ) : null}
          </View>

          {/* businees name and Client Name  */}
          <View
            style={[
              {
                display: "flex",
                flexDirection: "column",
                gap: "30px",
                alignItems: "flex-end",
                justifyContent: "flex-end",
                marginTop: "30px",
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
      </View>
    </Page>
  );
};

export default React.memo(CMADSCRRevenue);
