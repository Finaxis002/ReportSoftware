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
import { CMAExtractorBS } from "../Utils/CMA/CMAExtractorBS";

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

const num = (v) => {
  // Handle percentages by dividing by 100
  if (typeof v === "string") {
    if (v.trim().endsWith("%")) {
      return parseFloat(v.replace("%", "").replace(/,/g, "").trim()) / 100 || 0;
    }
    // Handle commas (thousands) and convert to number
    return parseFloat(v.replace(/,/g, "").trim()) || 0;
  }
  return Number(v) || 0;
};

const CMACashflowMenu = ({
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

  const hideFirstYear = shouldHideFirstYear(receivedtotalRevenueReceipts);
  // Function to handle moratorium period spillover across financial years

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
    const startIndex = 0;
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

  //////////////////////////////   new data
  const FinPosextractors = CMAExtractorFinPos(formData);
  const FundFlowExtractor = CMAExtractorFundFlow(formData);

  const OriginalRevenueValues = PPExtractor.OriginalRevenueValues() || [];
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

  console.log("interestOnTermLoan", interestOnTermLoan);
  console.log("interestOnWCArray", interestOnWCArray);
  const OnlyfilteredDirectExpenses =
    filteredDirectExpenses.filter((expense) => expense.type === "direct") || [];

  const OnlyIndirectExpenses =
    filteredDirectExpenses.filter((expense) => expense.type === "indirect") ||
    [];

  console.log("OnlyfilteredDirectExpenses", OnlyfilteredDirectExpenses);
  const hasRawMaterial = rawmaterial.some((val) => Number(val) !== 0);
  const directExpenseStartSerial = hasRawMaterial ? 3 : 2;

  const administrativeExpenseRows =
    extractors.administrativeExpenseRows() || [];

  const adminValues = administrativeExpenseRows[0]?.values || [];

  const totalDirectExpenses = Array.from({ length: projectionYears }).map(
    (_, idx) => {
      let totalSalary = Number(salaryandwages[idx] || 0);
      let totalMaterial = Number(rawmaterial[idx] || 0);
      let administrativeExpenses = Number(adminValues[idx] || 0);
      // Sum values from OnlyfilteredDirectExpenses
      let totalDirectExpense = OnlyfilteredDirectExpenses.reduce(
        (sum, expense) => {
          const expenseValue = expense.values[idx] || 0; // Access the value for the specific year
          return sum + Number(expenseValue); // Add to the running total
        },
        0
      );

      // Return the total of salary, material, and direct expenses for the year
      return (
        totalSalary +
        totalMaterial +
        totalDirectExpense +
        administrativeExpenses
      );
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
  // const incomeTaxCalculation =  PPExtractor.incomeTaxCalculation() || [];
  const netProfitAfterTax = PPExtractor.netProfitAfterTax() || [];
  const Withdrawals = PPExtractor.Withdrawals() || [];
  const balanceTrfBalncSheet = PPExtractor.balanceTrfBalncSheet() || [];

  const grossProfit = Array.from({ length: projectionYears }).map(
    (_, i) => Number(OriginalRevenueValues[i]) - Number(totalDirectExpenses[i])
  );

  const NPBT = Array.from({ length: projectionYears }).map(
    (_, i) => Number(grossProfit[i]) - Number(totalIndirectExpenses[i])
  );

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

  //new data
  const BSextractors = CMAExtractorBS(formData);
  const reverseAndSurplus = BSextractors.reservesAndSurplusArr() || [];
  const bankTermLoanArr = BSextractors.bankTermLoanArr() || [];
  const bankLoan12month =
    formData?.computedData?.totalLiabilities?.repaymentValueswithin12months ||
    [];

  const bankLoanPayablewithin12months = Array.from({
    length: projectionYears,
  }).map((_, i) => Number(bankLoan12month[i] || 0));

  const workingCapitalLoanArr = BSextractors.workingCapitalLoanArr() || [];
  const currentLiabilities = formData?.MoreDetails?.currentLiabilities || [];

  const totalLiabilitiesArray = Array.from({ length: projectionYears }).map(
    (_, index) => {
      const capital = Number(formData?.MeansOfFinance?.totalPC || 0);

      const reservesAndSurplus = Number(reverseAndSurplus[index] || 0);
      const bankTermLoan = Number(bankTermLoanArr?.[index] || 0);
      const repaymentWithin12 = Number(
        bankLoanPayablewithin12months[index] || 0
      ); // Shift by 1
      const workingCapital = Number(workingCapitalLoanArr[index] || 0);

      let cumulativeAdditionalLiabilities = 0;
      const currentYearLiabilities = (
        formData?.MoreDetails?.currentLiabilities ?? []
      ).reduce(
        (total, liabilities) => total + Number(liabilities.years?.[index] || 0),
        0
      );

      cumulativeAdditionalLiabilities += currentYearLiabilities;

      const totalForYear =
        capital +
        reservesAndSurplus +
        bankTermLoan +
        repaymentWithin12 +
        workingCapital +
        cumulativeAdditionalLiabilities;

      return totalForYear;
    }
  );

  const grossFixedAssetsPerYear = BSextractors.grossFixedAssetsPerYear() || [];
  const totalDepreciation = BSextractors.totalDepreciation() || [];
  const netBlock = BSextractors.netBlock() || [];
  const closingCashBalanceArray = BSextractors.closingCashBalanceArray() || [];
  const safeNumber = (val) =>
    val === undefined || val === null || val === "" ? 0 : Number(val) || 0;
  const inventory = Array.from({
    length: formData.MoreDetails.OpeningStock.length,
  }).map((_, yearIndex) => {
    const ClosingStock = formData?.MoreDetails.ClosingStock?.[yearIndex] || 0;
    return safeNumber(ClosingStock);
  });
  const isInventoryZero = inventory.every((value) => value === 0);

  const preliminaryExpenseBalanceSheet = [];
  for (let i = 0; i < projectionYears; i++) {
    if (i === 0) {
      preliminaryExpenseBalanceSheet[i] = Math.max(
        preliminaryExpensesTotal - yearlyWriteOffAmount,
        0
      );
    } else {
      preliminaryExpenseBalanceSheet[i] = Math.max(
        preliminaryExpenseBalanceSheet[i - 1] - yearlyWriteOffAmount,
        0
      );
    }
  }

  const totalAssetsArray = Array.from({ length: projectionYears }).map(
    (_, index) => {
      const netFixed = Number(netBlock[index] || 0);

      const cashEquivalent = Number(closingCashBalanceArray[index] || 0);

      const preliminaryExp = Number(preliminaryExpenseBalanceSheet[index] || 0);

      let cumulativeAdditionalAssets = 0;
      const currentYearAssets = (
        formData?.MoreDetails?.currentAssets ?? []
      ).reduce(
        (total, assets) => total + Number(assets.years?.[index] || 0),
        0
      );

      cumulativeAdditionalAssets += currentYearAssets;

      const totalForYear =
        netFixed + cashEquivalent + preliminaryExp + cumulativeAdditionalAssets;

      return totalForYear;
    }
  );

  //new data

  const netProfitBeforeInterestAndTaxes = Array.from({
    length: projectionYears,
  }).map((_, yearIndex) => {
    const profitBeforeTax = netProfitBeforeTax?.[yearIndex] || 0; // Profit Before Tax
    const TermLoan = interestOnTermLoan?.[yearIndex] || 0; // Interest on Term Loan
    const interestOnWorkingCapitalValue = Number(
      interestOnWCArray[yearIndex] || 0
    );

    // Calculate NPBIT (Net Profit Before Interest & Taxes)
    const calculatedValue =
      profitBeforeTax + TermLoan + interestOnWorkingCapitalValue;

    return calculatedValue;
  });

  const totalSourcesArray = Array.from({ length: projectionYears }).map(
    (_, index) => {
      const netProfitValue = netProfitBeforeInterestAndTaxes[index] || 0;

      const promotersCapital =
        index === 0 ? parseFloat(formData.MeansOfFinance.totalPC || 0) : 0;

      const bankTermLoan =
        index === 0
          ? parseFloat(formData?.MeansOfFinance?.termLoan?.termLoan || 0)
          : 0;

      const workingCapitalLoan =
        index === 0
          ? parseFloat(formData.MeansOfFinance?.workingCapital?.termLoan || 0)
          : 0;

      const depreciation = totalDepreciation[index] || 0;

      const currentLiabilitiesTotal =
        formData?.MoreDetails?.currentLiabilities?.reduce((sum, liability) => {
          const liabilityValue = parseFloat(liability.years?.[index]) || 0;

          return sum + liabilityValue;
        }, 0) || 0;

      const preliminaryExpenseWriteOff = preliminaryWriteOffPerYear[index] || 0;

      // ✅ Sum up all sources and log the result
      const total =
        netProfitValue +
        promotersCapital +
        bankTermLoan +
        workingCapitalLoan +
        depreciation +
        currentLiabilitiesTotal +
        preliminaryExpenseWriteOff;
      // console.log(`Total Sources for Year ${index}:`, total);

      return total;
    }
  );

  const repaymentOfTL = formData?.computedData?.yearlyPrincipalRepayment || [];
  const withdrawals = FundFlowExtractor.withdrawals() || [];
  const incomeTaxCal = extractors.incomeTaxCal() || [];

  const totalUsesArray = Array.from({ length: projectionYears }).map(
    (_, index) => {
      const fixedAssets =
        index === 0 ? parseFloat(grossFixedAssetsPerYear || 0) : 0;
      // console.log(`fixedAssets[${index}]:`, fixedAssets);

      const repaymentOfTermLoan = parseFloat(repaymentOfTL[index] || 0);
      // console.log(`repaymentOfTermLoan[${index}]:`, repaymentOfTermLoan);

      const TermLoan = parseFloat(interestOnTermLoan[index] || 0);
      // console.log(`interestOnTermLoan[${index}]:`, interestOnTermLoan);

      const WorkingCapitalValue = parseFloat(interestOnWCArray[index] || 0);

      const withdrawals = parseFloat(
        formData?.MoreDetails?.Withdrawals?.[index] || 0
      );
      // console.log(`withdrawals[${index}]:`, withdrawals);

      const incomeTaxValue = parseFloat(incomeTaxCal[index] || 0);

      const currentAssetsTotal = (formData?.MoreDetails?.currentAssets || [])
        .filter(
          (assets) =>
            assets.particular !== "Inventory" &&
            !assets.dontSendToBS &&
            Array.isArray(assets.years)
        )
        .reduce((sum, asset) => {
          const value = parseFloat(asset.years?.[index]) || 0;
          return sum + value;
        }, 0);

      // ✅ Ensuring Inventory Calculation - Closing Stock - Opening Stock
      const inventory = Array.from({
        length: formData.MoreDetails.OpeningStock.length,
      }).map((_, yearIndex) => {
        const ClosingStock =
          formData?.MoreDetails.ClosingStock?.[yearIndex] || 0;
        const OpeningStock =
          formData?.MoreDetails.OpeningStock?.[yearIndex] || 0;
        const finalStock = ClosingStock - OpeningStock;
        return finalStock;
      });

      // ✅ If Inventory is not available, set it to 0
      const inventoryValue = inventory[index] || 0;

      // ✅ Ensure negative values are treated as zero
      const sanitize = (value) => (value < 0 ? 0 : value);

      const preliminaryExpenseInUses =
        index === 0
          ? Number(formData?.CostOfProject?.preliminaryExpensesTotal || 0)
          : 0;

      // ✅ Final Total Uses Calculation (including Inventory)
      const totalUses =
        sanitize(fixedAssets) +
        sanitize(repaymentOfTermLoan) +
        sanitize(TermLoan) +
        sanitize(WorkingCapitalValue) +
        sanitize(withdrawals) +
        sanitize(incomeTaxValue) +
        sanitize(currentAssetsTotal) +
        sanitize(inventoryValue) + // Add the Inventory for the current year (index)
        sanitize(preliminaryExpenseInUses);
      return totalUses;
    }
  );

  // ✅ Initial Opening Cash Balance
  let openingCashBalance = 0;

  // ✅ Compute Cash Flow Balances
  const cashBalances = Array.from({ length: projectionYears }).map(
    (_, index) => {
      const totalSources = totalSourcesArray[index] || 0;
      const totalUses = totalUsesArray[index] || 0;
      const surplusDuringYear = totalSources - totalUses;

      // ✅ Compute Closing Balance
      const closingCashBalance = openingCashBalance + surplusDuringYear;

      const result = {
        opening: openingCashBalance, // ✅ Carry forward previous year's closing balance
        surplus: surplusDuringYear,
        closing: closingCashBalance,
      };

      // ✅ Set next year's opening balance
      openingCashBalance = closingCashBalance;

      return result;
    }
  );

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
            {formData?.ProjectReportSetting?.FinancialYear &&
            !isNaN(formData.ProjectReportSetting.FinancialYear) &&
            formData.ProjectReportSetting.FinancialYear.length === 4
              ? `${formData.ProjectReportSetting.FinancialYear}-${(
                  parseInt(formData.ProjectReportSetting.FinancialYear) + 1
                )
                  .toString()
                  .slice(-2)}`
              : "2024-25"}
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
            <Text>Projected Cashflow</Text>
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
              {yearLabels.map((yearLabel, yearIndex) => (
                             <Text
                               key={yearIndex}
                               style={[styles.particularsCell, stylesCOP.boldText]}
                             >
                               {yearLabel}
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

            {/* Sources */}
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  styles.Total,
                  { paddingVertical: "10px" },
                ]}
              >
                A
              </Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                  styles.Total,
                  { paddingVertical: "10px" },
                ]}
              >
                Sources
              </Text>
              {yearLabels.map((label, idx) => {
                return (
                  <Text
                    key={idx}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                    ]}
                  ></Text>
                );
              })}
            </View>

            {/* 1 Net Profit Before Interest And Taxes */}
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text style={stylesCOP.serialNoCellDetail}>1</Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                ]}
              >
                Net Profit Before Interest And Taxes
              </Text>

              {yearLabels.map((label, idx) => {
                return (
                  <Text
                    key={idx}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                    ]}
                  >
                    {formatNumber(netProfitBeforeInterestAndTaxes[idx] || 0)}
                  </Text>
                );
              })}
            </View>

            {/* 2 Promoters' Capital  */}
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text style={stylesCOP.serialNoCellDetail}>2</Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                ]}
              >
                Promoters' Capital
              </Text>

              {Array.from({ length: projectionYears }).map((_, index) => (
                <Text
                  key={index}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                  ]}
                >
                  {formatNumber(
                    index === 0 ? formData.MeansOfFinance.totalPC || "-" : "0"
                  )}
                </Text>
              ))}
            </View>

            {/* 3 Bank Term Loan */}
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text style={stylesCOP.serialNoCellDetail}>3</Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                ]}
              >
                Bank Term Loan
              </Text>

              {Array.from({ length: projectionYears }).map((_, index) => (
                <Text
                  key={index}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                  ]}
                >
                  {formatNumber(
                    index === 0
                      ? formData?.MeansOfFinance?.termLoan?.termLoan || "-"
                      : "0"
                  )}
                </Text>
              ))}
            </View>

            {/*4 Working Capital Loan   */}
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
                  {},
                ]}
              >
                Working Capital Loan
              </Text>
              {/* ✅ Display Precomputed Total Direct Expenses */}
              {Array.from({ length: projectionYears }).map((_, index) => (
                <Text
                  key={index}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                  ]}
                >
                  {formatNumber(
                    index === 0
                      ? formData.MeansOfFinance?.workingCapital?.termLoan || "-"
                      : "0"
                  )}
                </Text>
              ))}
            </View>

            {/*5 Depreciation */}
            <View style={[styles.tableRow]}>
              <Text style={stylesCOP.serialNoCellDetail}>5</Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                ]}
              >
                Depreciation
              </Text>

              {/* ✅ Display Precomputed Gross Profit Values */}
              {totalDepreciation.map((val, idx) => (
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

            {/*6 current liabilities array  */}
            {currentLiabilities
              .filter((liabilities) =>
                liabilities.years.some((value) => Number(value) !== 0)
              )
              .map((liabilities, idx) => {
                let cumulative = 0;

                return (
                  <View style={styles.tableRow} key={idx}>
                    <Text
                      style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}
                    >
                      {(idx += 6)}
                    </Text>

                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      {liabilities.particular}
                    </Text>

                    {Array.from({ length: projectionYears }).map(
                      (_, yearIndex) => {
                        return (
                          <Text
                            key={yearIndex}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(liabilities.years[yearIndex] || "0")}
                          </Text>
                        );
                      }
                    )}
                  </View>
                );
              })}

            {!isPreliminaryWriteOffAllZero && (
              <View style={[styles.tableRow, styles.totalRow]}>
                <Text style={stylesCOP.serialNoCellDetail}></Text>

                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  Preliminary Expenses <br /> written off
                </Text>

                {preliminaryWriteOffPerYear.map((value, yearIndex) => (
                  <Text
                    key={yearIndex}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                    ]}
                  >
                    {formatNumber(value)}
                  </Text>
                ))}
              </View>
            )}

            {/* total */}
            <View style={[stylesMOF.row, styles.tableRow, styles.Total]}>
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  styleExpenses.sno,
                  styleExpenses.bordernone,
                  {},
                ]}
              ></Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                  {},
                ]}
              >
                Total
              </Text>

              {/* ✅ Display Precomputed Gross Profit Values */}
              {totalSourcesArray.map((total, index) => (
                <Text
                  key={index}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styles.boldText,
                    {
                      fontSize: "9px",
                      borderTopWidth: "1px",
                      borderBottomWidth: "1px",

                      paddingVertical: "8px",
                    },
                  ]}
                >
                  {formatNumber(total)} {/* ✅ Ensure Proper Formatting */}
                </Text>
              ))}
            </View>

            {/* assets */}
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  styles.Total,
                  { paddingVertical: "10px" },
                ]}
              >
                B
              </Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                  styles.Total,
                  { paddingVertical: "10px" },
                ]}
              >
                Assets
              </Text>
              {yearLabels.map((label, idx) => {
                return (
                  <Text
                    key={idx}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                    ]}
                  ></Text>
                );
              })}
            </View>

            {/* Fixed Assets */}
            <View style={[styles.tableRow]}>
              <Text style={stylesCOP.serialNoCellDetail}>1</Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                ]}
              >
                Fixed Assets
              </Text>

              {/* ✅ Display Precomputed Gross Profit Values */}
              {yearLabels.map((label, idx) => {
                return (
                  <Text
                    key={idx}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                    ]}
                  >
                    {/* {formatNumber(grossFixedAssetsPerYear[idx] || 0)} */}
                    {idx === 0
                      ? grossFixedAssetsPerYear[0]
                        ? formatNumber(grossFixedAssetsPerYear[0]) // Use formatNumber instead of toLocaleString
                        : "-"
                      : "0"}
                  </Text>
                );
              })}
            </View>

            {/* Repayment Of Term Loan */}
            <View style={[styles.tableRow]}>
              <Text style={stylesCOP.serialNoCellDetail}>2</Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                ]}
              >
                Repayment Of Term Loan
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

            {/* Interest On Term Loan */}
            <View style={[styles.tableRow]}>
              <Text style={stylesCOP.serialNoCellDetail}>3</Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                ]}
              >
                Interest On Term Loan
              </Text>

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

            {/* Interest On Working Capital */}
            <View style={[styles.tableRow]}>
              <Text style={stylesCOP.serialNoCellDetail}>4</Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                ]}
              >
                Interest On Working Capital
              </Text>

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

            {/* withdrawals */}
            <View style={[styles.tableRow]}>
              <Text style={stylesCOP.serialNoCellDetail}>5</Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                ]}
              >
                Withdrawals
              </Text>

              {withdrawals.map((val, idx) => (
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

            {/* Income Tax */}
            <View style={[styles.tableRow]}>
              <Text style={stylesCOP.serialNoCellDetail}>6</Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                ]}
              >
                Income Tax
              </Text>

              {incomeTaxCal.map((val, idx) => (
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

            {/* Inventory */}
            {!isInventoryZero && (
              <View style={[styles.tableRow]}>
                <Text
                  style={[
                    stylesCOP.serialNoCellDetail,
                    styleExpenses.sno,
                    styleExpenses.bordernone,
                    {},
                  ]}
                >
                  5
                </Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                    {},
                  ]}
                >
                  Inventory
                </Text>

                {Array.from({
                  length: formData.ProjectReportSetting.ProjectionYears,
                }).map((_, yearIndex) => {
                  const inventorymap = inventory[yearIndex] || 0;

                  return (
                    <Text
                      key={yearIndex}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                      ]}
                    >
                      {formatNumber(inventorymap)}
                    </Text>
                  );
                })}
              </View>
            )}

            {/* ✅ Current Assets from More Details */}
            {formData?.MoreDetails?.currentAssets
              ?.filter(
                (assets) =>
                  assets.particular !== "Inventory" &&
                  !assets.dontSendToBS &&
                  assets.years.some((value) => Number(value) !== 0)
              )
              .map((assets, index) => {
                const serialNumber = isInventoryZero ? index + 8 : index + 7;

                return (
                  <View style={styles.tableRow} key={index}>
                    {/* Serial Number */}
                    <Text
                      style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}
                    >
                      {isInventoryZero ? (index += 8) : (index += 7)}
                    </Text>

                    {/* Particular */}
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      {assets.particular}
                    </Text>

                    {Array.from({ length: projectionYears }).map(
                      (_, yearIndex) => {
                        const value = Number(assets.years[yearIndex] || 0);

                        return (
                          <Text
                            key={yearIndex}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(value)}
                          </Text>
                        );
                      }
                    )}
                  </View>
                );
              })}

            {/* preliminary expense */}
            {/* Preliminary Expenses in Uses (year 1 only) */}
            {Number(formData?.CostOfProject?.preliminaryExpensesTotal) > 0 && (
              <View style={styles.tableRow}>
                <Text
                  style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}
                ></Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  Preliminary Expenses
                </Text>
                {Array.from({ length: projectionYears }).map((_, index) => (
                  <Text
                    key={index}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                    ]}
                  >
                    {formatNumber(
                      index === 0
                        ? Number(
                            formData?.CostOfProject?.preliminaryExpensesTotal
                          ) || 0
                        : 0
                    )}
                  </Text>
                ))}
              </View>
            )}

            {/* total uses*/}
            <View style={[stylesMOF.row, styles.tableRow, styles.Total]}>
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  styleExpenses.sno,
                  styleExpenses.bordernone,
                  {},
                ]}
              ></Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                  {},
                ]}
              >
                Total
              </Text>

              {/* ✅ Display Precomputed Gross Profit Values */}
              {totalUsesArray.map((total, index) => (
                <Text
                  key={index}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styles.boldText,
                    {
                      fontSize: "9px",
                      borderTopWidth: "2px",
                      borderBottomWidth: "2px",
                      paddingVertical: "8px",
                    },
                  ]}
                >
                  {formatNumber(total)} {/* ✅ Display Correct Total */}
                </Text>
              ))}
            </View>

            {/* Opening Cash Balance */}
            <View>
              <View style={styles.tableRow}>
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
                  Opening Cash Balance
                </Text>

                {/* ✅ Display Updated Opening Cash Balance for Each Year */}
                {cashBalances.map((cb, index) => (
                  <Text
                    key={index}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                    ]}
                  >
                    {formatNumber(cb.opening)}{" "}
                  </Text>
                ))}
              </View>

              {/* Surplus During the Year */}
              <View style={styles.tableRow}>
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
                  Surplus During the Year
                </Text>

                {/* ✅ Display Surplus for Each Year */}
                {cashBalances.map((cb, index) => (
                  <Text
                    key={index}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                    ]}
                  >
                    {formatNumber(cb.surplus)}
                  </Text>
                ))}
              </View>

              {/* Closing Cash Balance */}
              <View style={styles.tableRow}>
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
                  Closing Cash Balance
                </Text>

                {/* ✅ Display Closing Cash Balance for Each Year */}
                {cashBalances.map((cb, index) => (
                  <Text
                    key={index}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                    ]}
                  >
                    {formatNumber(cb.closing)}
                  </Text>
                ))}
              </View>
            </View>
          </View>
        </View>

        <View>
          {formData?.ProjectReportSetting?.CAName?.value ? (
            <Text
              style={[
                {
                  fontSize: "8px",
                  paddingRight: "4px",
                  paddingLeft: "4px",
                  textAlign: "justify",
                },
              ]}
            >
              Guidance and assistance have been provided for the preparation of
              these financial statements on the specific request of the promoter
              for the purpose of availing finance for the business. These
              financial statements are based on realistic market assumptions,
              proposed estimates issued by an approved valuer, details provided
              by the promoter, and rates prevailing in the market. Based on the
              examination of the evidence supporting the assumptions, nothing
              has come to attention that causes any belief that the assumptions
              do not provide a reasonable basis for the forecast. These
              financials do not vouch for the accuracy of the same, as actual
              results are likely to be different from the forecast since
              anticipated events might not occur as expected, and the variation
              might be material.
            </Text>
          ) : null}
        </View>

        <View
          style={[
            {
              display: "flex",
              flexDirection: "row", // ✅ Change to row
              justifyContent: "space-between", // ✅ Align items left and right
              alignItems: "center",
              marginTop: 60,
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
                gap: "80px",
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

export default React.memo(CMACashflowMenu);
