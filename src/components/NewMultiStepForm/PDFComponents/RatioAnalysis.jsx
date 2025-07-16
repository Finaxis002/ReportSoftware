import React, { useEffect, useState, useRef } from "react";
import { Page, View, Text, Image } from "@react-pdf/renderer";
import { styles, stylesCOP, stylesMOF, styleExpenses } from "./Styles";
import { Font } from "@react-pdf/renderer";
import SAWatermark from "../Assets/SAWatermark";
import CAWatermark from "../Assets/CAWatermark";

Font.register({
  family: "Roboto",
  fonts: [
    {
      src: require("../Assets/Fonts/times-new-roman.ttf"),
      fontWeight: "normal",
    },
    {
      src: require("../Assets/Fonts/times-new-roman-bold.ttf"),
      fontWeight: "bold",
    },
  ],
});

const RatioAnalysis = ({
  formData = {},
  yearlyPrincipalRepayment = [],
  financialYearLabels,
  receivedCummulativeTansferedData,
  receivedMarchClosingBalances,
  receivedWorkingCapitalValues,
  totalRevenueReceipts,
  receivedTotalLiabilities,
  cashProfitArray,
  grossProfitValues = [],
  netProfitBeforeTax = [],
  netProfitAfterTax = [],
  receivedDscr = [],
  onAssetsLiabilitiesSend,
  formatNumber,
  pdfType,
  receivedtotalRevenueReceipts,
  orientation,
}) => {
  

  const projectionYears =
    Number(formData?.ProjectReportSetting?.ProjectionYears) || 5;

  // Destructure termLoanValues from the object.
  // If it's undefined, default to an empty array.
  const { termLoanValues = [] } = receivedWorkingCapitalValues || {};
  const cumulativeLoanForPreviousYears =
    receivedWorkingCapitalValues?.termLoanValues || [];

  const computeWorkingCapitalFallbackArray = (arr, desiredLength) => {
    let fallback = [];
    let lastNonZero = 0;
    for (let i = 0; i < desiredLength; i++) {
      const value = Number(arr?.[i]) || 0;
      if (value !== 0) {
        lastNonZero = value;
      }
      fallback.push(lastNonZero);
    }
    return fallback;
  };

  const workingCapitalArray = computeWorkingCapitalFallbackArray(
    cumulativeLoanForPreviousYears,
    projectionYears
  );

  // ✅ Calculate Net Worth and store in a variable
  const netWorth = Array.from({ length: projectionYears }).map((_, index) => {
    // Get the constant Capital value
    const capitalValue = Number(formData?.MeansOfFinance?.totalPC) || 0;

    // Retrieve Reserves & Surplus for the current year; ensure it isn’t negative
    const reservesValue = Number(
      receivedCummulativeTansferedData?.cumulativeBalanceTransferred?.[index] ||
        0
    );

    // Sum the two values to get Net Worth
    const totalValue = capitalValue + Math.max(reservesValue, 0);

    return totalValue; // Return the calculated Net Worth for that year
  });

  const totalDebtArray = Array.from({ length: projectionYears }).map(
    (_, index) => {
      const termLoan = Number(receivedMarchClosingBalances?.[index + 1]) || 0;

      // ✅ Don't shift repayment index — use current year index
      const bankLoan =
        Number(
          receivedTotalLiabilities?.repaymentValueswithin12months?.[index]
        ) || 0;

      const workingCapitalLoan = workingCapitalArray[index] || 0;

      return termLoan + bankLoan + workingCapitalLoan;
    }
  );

  // ✅ Initialize cumulative sum for Current Liabilities
  let cumulativeCurrentLiabilities = 0;

  const totalOutsideLiabilitiesArray = Array.from({
    length: projectionYears,
  }).map((_, index) => {
    // Use raw value for Term Loan
    const termLoan = Number(receivedMarchClosingBalances?.[index + 1]) || 0;

    // Use raw value for Bank Loan Payable from the next year (index + 1)
    const bankLoan =
      Number(
        receivedTotalLiabilities?.repaymentValueswithin12months?.[index]
      ) || 0;

    // Use the fallback array for Working Capital
    const workingCapitalLoan = workingCapitalArray[index] || 0;

    // ✅ Compute Total of Current Liabilities dynamically with cumulative rule
    const currentYearLiabilities = (
      formData?.MoreDetails?.currentLiabilities ?? []
    )
      .filter((liability) => liability.particular !== "Quasi Equity")
      .reduce(
        (sum, liability) => sum + (Number(liability.years?.[index]) || 0),
        0
      );

    cumulativeCurrentLiabilities += currentYearLiabilities; // Apply cumulative sum

    // ✅ Compute Total Outside Liabilities correctly
    const totalDebt =
      termLoan + bankLoan + workingCapitalLoan + cumulativeCurrentLiabilities;

    return totalDebt; // Store calculated total debt
  });

  // console.log("received DSCR", receivedDscr);

  // ✅ Initialize an array to store total current assets for each projection year
  let cumulativeCurrentAssets = 0; // Initialize cumulative sum
  const CurrentAssetsArray = Array.from({ length: projectionYears }).map(
    (_, index) => {
      const cashBalance =
        Number(receivedTotalLiabilities?.closingCashBalanceArray?.[index]) || 0;

      const currentYearAssets = (formData?.MoreDetails?.currentAssets ?? [])
        .filter((asset) => asset.particular !== "Investments")
        .reduce((total, assets) => total + Number(assets.years[index] || 0), 0);

      const inventory = Array.from({
        length: formData.MoreDetails.OpeningStock.length,
      }).map((_, yearIndex) => {
        const ClosingStock =
          formData?.MoreDetails.ClosingStock?.[yearIndex] || 0;
        const OpeningStock =
          formData?.MoreDetails.OpeningStock?.[yearIndex] || 0;
        return ClosingStock - OpeningStock;
      });

      const inventoryValue = inventory[index] || 0;

      cumulativeCurrentAssets += currentYearAssets + inventoryValue;

      const totalCurrentAssets = cashBalance + cumulativeCurrentAssets;

      // ✅ Log everything year-wise
      // console.log(`\nYear ${index + 1}:`);
      // console.log("Cash Balance           :", cashBalance);
      // console.log("Current Year Assets    :", currentYearAssets);
      // console.log("Inventory Value        :", inventoryValue);
      // console.log("Cumulative CurrentAssets:", cumulativeCurrentAssets);
      // console.log("Total Current Assets   :", totalCurrentAssets);

      return totalCurrentAssets;
    }
  );

  // ✅ Initialize an array to store total liabilities for each projection year

  // console.log("Final Current Liabilities Array:", currentLiabilities);

  // ✅ Calculate Gross Profit / Sales Ratio and store in a variable
  const grossProfitSalesRatios = Array.from({ length: projectionYears }).map(
    (_, index) => {
      const sales = totalRevenueReceipts[index] || 0; // Sales value
      const grossProfit = grossProfitValues[index] || 0; // Gross profit value
      if (sales === 0 || grossProfit === 0) {
        return "-";
      }
      const ratio = ((grossProfit / sales) * 100).toFixed(2); // Avoid division by zero and format to 2 decimal places
      return ratio; // Store ratio
    }
  );

  // ✅ Calculate Operating Profit / Sales Ratio and store in a variable
  const operatingProfitSalesRatios = Array.from({
    length: projectionYears,
  }).map((_, index) => {
    const sales = totalRevenueReceipts[index] || 0;
    const operatingProfit = netProfitBeforeTax[index] || 0;
    if (sales === 0 || operatingProfit === 0) {
      return "-";
    }
    const ratio = ((operatingProfit / sales) * 100).toFixed(2);
    return ratio;
  });

  // ✅ Calculate Profit Before Tax / Sales Ratio and store in a variable
  const ProfitBeforeTaxRatios = Array.from({ length: projectionYears }).map(
    (_, index) => {
      const sales = totalRevenueReceipts[index] || 0;
      const operatingProfit = netProfitBeforeTax[index] || 0;
      if (sales === 0 || operatingProfit === 0) {
        return "-";
      }
      const ratio = ((operatingProfit / sales) * 100).toFixed(2);
      return ratio;
    }
  );

  // ✅ Calculate Net Profit / Sales Ratio and store in a variable
  const netProfitSalesRatio = Array.from({ length: projectionYears }).map(
    (_, index) => {
      const sales = totalRevenueReceipts[index] || 0;
      const netProfit = netProfitAfterTax[index] || 0;
      if (netProfit === 0 || sales === 0) {
        return "-";
      }
      const ratio = ((netProfit / sales) * 100).toFixed(2);
      return ratio;
    }
  );

  // ✅ Calculate Net Profit / Net Worth Ratio and store in a variable
  const netProfitNetWorthRatio = Array.from({ length: projectionYears }).map(
    (_, index) => {
      const netProfit = netProfitAfterTax[index] || 0;
      const netWorthValue = netWorth[index] || 0;
      if (netWorthValue === 0 || netProfit === 0) {
        return "-";
      }
      const ratio = ((netProfit / netWorthValue) * 100).toFixed(2);
      return ratio;
    }
  );

  // ✅ Calculate Debt-Equity Ratio and store in a variable
  const deptEqualityRatio = Array.from({ length: projectionYears }).map(
    (_, index) => {
      const netWorthValue = netWorth[index] || 0;
      const totalDebtvalues = totalDebtArray[index] || 0;
      if (netWorthValue === 0 || totalDebtvalues === 0) {
        return "-";
      }
      const ratio = (totalDebtvalues / netWorthValue).toFixed(2);
      return ratio;
    }
  );

  
  // ✅ Total Outside Liabilities / Total Net Worth Ratio
  // Step 3: Calculate Total Outside Liabilities to Net Worth Ratio
  const totalOutsideLiabilitiesNetWorthRatio = totalOutsideLiabilitiesArray.map(
    (liability, index) => {
      
      const worth = netWorth[index] || 1; // Prevent division by zero
      
      return (liability / worth).toFixed(2); // Round to 2 decimal places
    }
  );

  // ✅ Net Worth / Total Liabilities Ratio
  const netWorthTotalLiabilitiesRatio = Array.from({
    length: projectionYears,
  }).map((_, index) => {
    const capitalValue = Number(formData?.MeansOfFinance?.totalPC) || 0;
    const reservesValue =
      Number(
        receivedCummulativeTansferedData?.cumulativeBalanceTransferred?.[index]
      ) || 0;
    const netWorth = capitalValue + Math.max(reservesValue, 0);

    const totalLiabilities =
      Number(receivedTotalLiabilities?.totalLiabilitiesArray?.[index]) || 0;

    return totalLiabilities === 0
      ? "-"
      : (netWorth / totalLiabilities).toFixed(2);
  });

  // Exclude "Quasi Equity" from Current Liabilities when calculating Total Liabilities
const newTotalLiabilitiesArray = Array.from({ length: projectionYears }).map((_, index) => {
  // Get term loan, bank loan, etc., as per your structure:
  const termLoan = Number(receivedMarchClosingBalances?.[index + 1]) || 0;
  const bankLoan = Number(receivedTotalLiabilities?.repaymentValueswithin12months?.[index]) || 0;
  const workingCapitalLoan = workingCapitalArray[index] || 0;

  // Exclude "Quasi Equity" from current liabilities sum:
  const currentYearLiabilities = (
    formData?.MoreDetails?.currentLiabilities ?? []
  )
    .filter((liability) => liability.particular !== "Quasi Equity")
    .reduce(
      (sum, liability) => sum + (Number(liability.years?.[index]) || 0),
      0
    );

  // Compose the total liabilities for the year:
  return termLoan + bankLoan + workingCapitalLoan + currentYearLiabilities;
});


  const yearlycurrentLiabilities =
    receivedTotalLiabilities?.yearlyTotalLiabilities;

  // ✅ Calculate Current Ratio for each year
  const currentRatio = CurrentAssetsArray.map((assets, index) => {
    const liabilities =
      Number(receivedTotalLiabilities?.yearlyTotalLiabilities?.[index]) || 0;

    return liabilities > 0
      ? (assets / liabilities).toFixed(2) // ✅ Format to 2 decimal places
      : "-"; // ✅ Display "-" if liabilities are 0
  });

  // console.log("Current Ratio per Year:", currentRatio);

  // ✅ Return on Investment (ROI)
  const returnOnInvestment = Array.from({ length: projectionYears }).map(
    (_, index) => {
      const Npat = Number(netProfitAfterTax?.[index]) || 0;
      const toitalMOF = Number(formData?.MeansOfFinance?.total) || 0;

      return toitalMOF === 0 ? "-" : ((Npat / toitalMOF) * 100).toFixed(2);
    }
  );

  // ✅ Utility function to calculate average
  const calculateAverage = (array) => {
    if (!Array.isArray(array) || array.length === 0) return "-";
    const validNumbers = array
      .filter((value) => value !== "-" && !isNaN(Number(value)))
      .map((value) => Number(value));
    if (validNumbers.length === 0) return "-";

    const total = validNumbers.reduce((sum, value) => sum + value, 0);
    return (total / validNumbers.length).toFixed(2);
  };

  // ✅ Calculate Average for Each Ratio
  const averageGrossProfitSalesRatio = calculateAverage(
    grossProfitSalesRatios.map((r) => (r !== "-" ? parseFloat(r) : "-"))
  );

  const averageOperatingProfitSalesRatio = calculateAverage(
    operatingProfitSalesRatios.map((r) => (r !== "-" ? parseFloat(r) : "-"))
  );

  const averageProfitBeforeTaxSalesRatio = calculateAverage(
    ProfitBeforeTaxRatios.map((r) => (r !== "-" ? parseFloat(r) : "-"))
  );

  const averageNetProfitSalesRatio = calculateAverage(
    netProfitSalesRatio.map((r) => (r !== "-" ? parseFloat(r) : "-"))
  );

  const averageNetProfitNetWorthRatio = calculateAverage(
    netProfitNetWorthRatio.map((r) => (r !== "-" ? parseFloat(r) : "-"))
  );

  const averageDebtEquityRatio = calculateAverage(
    deptEqualityRatio.map((r) => (r !== "-" ? parseFloat(r) : "-"))
  );

  // ✅ Calculate Averages for Each Ratio using the same pattern

  const averageTotalOutsideLiabilitiesNetWorthRatio = calculateAverage(
    totalOutsideLiabilitiesNetWorthRatio.map((r) =>
      r !== "-" ? parseFloat(r) : "-"
    )
  );

  const averageNetWorthTotalLiabilitiesRatio = calculateAverage(
    netWorthTotalLiabilitiesRatio.map((r) => (r !== "-" ? parseFloat(r) : "-"))
  );

  // ✅ Correct Average Calculation by filtering out invalid values
  const averageDebtServiceCoverageRatio = calculateAverage(
    receivedDscr?.DSCR?.filter((r) => !isNaN(parseFloat(r)) && r !== 0).map(
      (r) => parseFloat(r)
    ) || []
  );

  const hideFirstYear = receivedtotalRevenueReceipts?.[0] <= 0;
  // ✅ Calculate Average Current Ratio (Ignoring invalid values & values < 1)
  const validRatios = currentRatio
    .map((r, index) => ({ value: parseFloat(r), index })) // Keep track of index
    .filter(({ value, index }) => {
      // Skip the first year if hidden
      if (hideFirstYear && index === 0) return false;
      // Filter out invalid, non-numeric, or < 1 values
      return !isNaN(value) && value >= 1;
    })
    .map(({ value }) => value); // Extract just the values

  const averageCurrentRatio = (() => {
    // Step 1: Filter out invalid values and convert valid ones to numbers
    let validRatios = currentRatio
      .filter((r) => r !== "-" && !isNaN(parseFloat(r)))
      .map((r) => parseFloat(r));

    // Step 2: Remove first year's ratio if it's hidden
    if (hideFirstYear) {
      validRatios = validRatios.slice(1); // Remove first index
    }

    // Step 3: If no valid ratios left, return "-"
    if (validRatios.length === 0) {
      return "-";
    }

    // Step 4: Calculate the average
    const total = validRatios.reduce((sum, value) => sum + value, 0);
    const average = (total / validRatios.length).toFixed(2);

    return average;
  })();

  const numOfYearsUsedForAvg = validRatios.length;

  const filteredROI = returnOnInvestment
    .map((r) => (r !== "-" ? parseFloat(r) : null)) // Convert valid values to numbers
    .filter((r) => r !== null && r > 0); // ✅ Ignore 0 and negative numbers

  const averageReturnOnInvestment =
    filteredROI.length > 0
      ? (
          filteredROI.reduce((sum, value) => sum + value, 0) /
          filteredROI.length
        ).toFixed(2)
      : "0.00"; // ✅ Ensures two decimal places

  // console.log("Filtered ROI Values:", filteredROI);
  // console.log("Average ROI:", averageReturnOnInvestment);

  // ✅ Properly update the state using useEffect
  useEffect(() => {
    if (
      receivedTotalLiabilities?.closingCashBalanceArray?.length > 0 ||
      receivedTotalLiabilities?.currentLiabilities?.length > 0
    ) {
      onAssetsLiabilitiesSend((prev) => ({
        ...prev,
        CurrentAssetsArray,
        yearlycurrentLiabilities,
        averageCurrentRatio,
        numOfYearsUsedForAvg,
      }));
    }
  }, [
    JSON.stringify(CurrentAssetsArray || []),
    JSON.stringify(yearlycurrentLiabilities || []),
    JSON.stringify(averageCurrentRatio),
    numOfYearsUsedForAvg,
  ]);

  // const orientation =
  // hideFirstYear
  //   ? (formData.ProjectReportSetting.ProjectionYears > 6 ? "landscape" : "portrait")
  //   : (formData.ProjectReportSetting.ProjectionYears > 5 ? "landscape" : "portrait");

  return (
    <Page
      size={projectionYears > 12 ? "A3" : "A4"}
      orientation={orientation}
      wrap={false}
      break
      style={styles.page}
    >
      {pdfType &&
        pdfType !== "select option" &&
        (pdfType === "Sharda Associates" || pdfType === "CA Certified") && (
          <View
            style={{
              position: "absolute",
              left: "50%", // Center horizontally
              top: "50%", // Center vertically
              width: 500, // Set width to 500px
              height: 700, // Set height to 700px
              marginLeft: -200, // Move left by half width (500/2)
              marginTop: -350, // Move up by half height (700/2)
              opacity: 0.4, // Light watermark
              zIndex: -1, // Push behind content
            }}
            fixed
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
        <View
          style={[stylesCOP.heading, { fontWeight: "bold", paddingLeft: 10 }]}
        >
          <Text>Ratio Analysis </Text>
        </View>

        <View style={[styles.table, { borderRightWidth: 0 }]}>
          {/* Header  */}
          <View style={styles.tableHeader}>
            <Text
              style={[
                styles.serialNoCell,
                styleExpenses.sno,
                styleExpenses.fontBold,
                { textAlign: "center", borderLeftWidth: 0 },
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
            {financialYearLabels
              .slice(hideFirstYear ? 1 : 0) // ✅ Skip first year if receivedtotalRevenueReceipts[0] < 0
              .map((yearLabel, yearIndex) => (
                <Text
                  key={yearIndex}
                  style={[styles.particularsCell, stylesCOP.boldText]}
                >
                  {yearLabel}
                </Text>
              ))}
            <Text style={[styles.particularsCell, stylesCOP.boldText]}>AR</Text>
          </View>

          {/* Liabilities Section */}

          <View>
            {/* ✅ 1 sales */}
            <View style={styles.tableRow}>
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  styleExpenses.sno,
                  styleExpenses.bordernone,
                  { paddingTop: "20px" },
                ]}
              >
                1
              </Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                  { paddingTop: "20px" },
                ]}
              >
                Sales
              </Text>

              {Array.from({ length: projectionYears }).map(
                (_, index) =>
                  (!hideFirstYear || index !== 0) && (
                    <Text
                      key={index}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                        {
                          paddingTop: "20px",

                          fontWeight: "light",
                        },
                      ]}
                    >
                      {formatNumber(totalRevenueReceipts[index] || 0)}
                    </Text>
                  )
              )}

              <Text
                style={[
                  stylesCOP.particularsCellsDetail,
                  styleExpenses.fontSmall,
                ]}
              ></Text>
            </View>
            {/* 2 Gross Profit */}
            <View style={styles.tableRow}>
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
                ]}
              >
                Gross Profit
              </Text>
              {grossProfitValues.map(
                (profit, yearIndex) =>
                  (!hideFirstYear || yearIndex !== 0) && (
                    <Text
                      key={`grossProfit-${yearIndex}`}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                      ]}
                    >
                      {formatNumber(profit)}
                    </Text>
                  )
              )}
              <Text
                style={[
                  stylesCOP.particularsCellsDetail,
                  styleExpenses.fontSmall,
                ]}
              ></Text>
            </View>

            {/* 3 Operating Profit / Profit Before Tax */}
            <View style={styles.tableRow}>
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  styleExpenses.sno,
                  styleExpenses.bordernone,
                  {},
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
                Operating Profit / Profit Before Tax
              </Text>
              {/* ✅ Dynamically generate years based on projectionYears */}
              {netProfitBeforeTax.map(
                (npbt, yearIndex) =>
                  (!hideFirstYear || yearIndex !== 0) && (
                    <Text
                      key={`npbt-${yearIndex}`}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                      ]}
                    >
                      {formatNumber(npbt)}
                    </Text>
                  )
              )}
              <Text
                style={[
                  stylesCOP.particularsCellsDetail,
                  styleExpenses.fontSmall,
                ]}
              ></Text>
            </View>

            {/* 4  Net Profit After Tax */}
            <View style={styles.tableRow}>
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  styleExpenses.sno,
                  styleExpenses.bordernone,
                  {},
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
                Net Profit After Tax
              </Text>

              {netProfitAfterTax.map(
                (npat, yearIndex) =>
                  (!hideFirstYear || yearIndex !== 0) && (
                    <Text
                      key={`npat-${yearIndex}`}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                      ]}
                    >
                      {formatNumber(npat)}
                    </Text>
                  )
              )}
              <Text
                style={[
                  stylesCOP.particularsCellsDetail,
                  styleExpenses.fontSmall,
                ]}
              ></Text>
            </View>

            {/* 5 Net Worth */}
            <View style={styles.tableRow}>
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
                ]}
              >
                Net Worth
              </Text>

              {/* ✅ Display Net Worth from the Stored Variable */}
              {netWorth.map(
                (totalValue, index) =>
                  (!hideFirstYear || index !== 0) && (
                    <Text
                      key={`net-worth-${index}`}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                      ]}
                    >
                      {formatNumber(totalValue)}
                    </Text>
                  )
              )}
              <Text
                style={[
                  stylesCOP.particularsCellsDetail,
                  styleExpenses.fontSmall,
                ]}
              ></Text>
            </View>

            {/*6 Total Deb */}
            <View style={styles.tableRow}>
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  styleExpenses.sno,
                  styleExpenses.bordernone,
                  {},
                ]}
              >
                6
              </Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                ]}
              >
                Total Deb
              </Text>

              {/* ✅ Display Total Debt from Stored Variable */}
              {totalDebtArray.map(
                (totalDebt, index) =>
                  (!hideFirstYear || index !== 0) && (
                    <Text
                      key={`total-debt-${index}`}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                      ]}
                    >
                      {formatNumber(totalDebt)}
                    </Text>
                  )
              )}
              <Text
                style={[
                  stylesCOP.particularsCellsDetail,
                  styleExpenses.fontSmall,
                ]}
              ></Text>
            </View>

            {/*7 Total Outside Liabilities */}
            <View style={styles.tableRow}>
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  styleExpenses.sno,
                  styleExpenses.bordernone,
                  {},
                ]}
              >
                7
              </Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                ]}
              >
                Total Outside Liabilities
              </Text>

              {/* ✅ Display Total Debt from Stored Variable */}
              {totalOutsideLiabilitiesArray.map(
                (totalDebt, index) =>
                  (!hideFirstYear || index !== 0) && (
                    <Text
                      key={`total-debt-${index}`}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                      ]}
                    >
                      {formatNumber(totalDebt)}
                    </Text>
                  )
              )}
              <Text
                style={[
                  stylesCOP.particularsCellsDetail,
                  styleExpenses.fontSmall,
                ]}
              ></Text>
            </View>

            {/*8 Total Liabilities */}
            <View style={styles.tableRow}>
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  styleExpenses.sno,
                  styleExpenses.bordernone,
                  {},
                ]}
              >
                8
              </Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                ]}
              >
                Total Liabilities
              </Text>

              {/* ✅ Access the nested array correctly */}
              {Array.isArray(receivedTotalLiabilities.totalLiabilitiesArray) &&
                receivedTotalLiabilities.totalLiabilitiesArray.map(
                  (total, index) =>
                    (!hideFirstYear || index !== 0) && (
                      <Text
                        key={index}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                        ]}
                      >
                        {formatNumber(total)} {/* ✅ Display Correct Total */}
                      </Text>
                    )
                )}
              <Text
                style={[
                  stylesCOP.particularsCellsDetail,
                  styleExpenses.fontSmall,
                ]}
              ></Text>
            </View>

            {/*9 Current Assets */}
            <View style={styles.tableRow}>
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  styleExpenses.sno,
                  styleExpenses.bordernone,
                  {},
                ]}
              >
                9
              </Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                ]}
              >
                Current Assets
              </Text>

              {/* ✅ Display total Current Assets for each projection year */}
              {CurrentAssetsArray.map(
                (total, index) =>
                  (!hideFirstYear || index !== 0) && (
                    <Text
                      key={index}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                      ]}
                    >
                      {formatNumber(total)} {/* ✅ Display Correct Total */}
                    </Text>
                  )
              )}
              <Text
                style={[
                  stylesCOP.particularsCellsDetail,
                  styleExpenses.fontSmall,
                ]}
              ></Text>
            </View>

            {/* 10 Current Liabilities */}
            <View style={styles.tableRow}>
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  styleExpenses.sno,
                  styleExpenses.bordernone,
                  {},
                ]}
              >
                10
              </Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                ]}
              >
                Current Liabilities
              </Text>

              {/* ✅ Display Updated Current Liabilities */}
              {(receivedTotalLiabilities?.yearlyTotalLiabilities ?? []).map(
                (total, index) =>
                  (!hideFirstYear || index !== 0) && (
                    <Text
                      key={index}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                      ]}
                    >
                      {formatNumber(total)} {/* ✅ Display Correct Total */}
                    </Text>
                  )
              )}
              <Text
                style={[
                  stylesCOP.particularsCellsDetail,
                  styleExpenses.fontSmall,
                ]}
              ></Text>
            </View>

            {/* 11 Cash Profit */}
            <View style={styles.tableRow}>
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  styleExpenses.sno,
                  styleExpenses.bordernone,
                  {},
                ]}
              >
                11
              </Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                ]}
              >
                Cash Profit
              </Text>

              {/* ✅ Access the nested array correctly */}
              {Array.isArray(cashProfitArray) &&
                cashProfitArray.map(
                  (total, index) =>
                    (!hideFirstYear || index !== 0) && (
                      <Text
                        key={index}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                        ]}
                      >
                        {formatNumber(total)} {/* ✅ Display Correct Total */}
                      </Text>
                    )
                )}
              <Text
                style={[
                  stylesCOP.particularsCellsDetail,
                  styleExpenses.fontSmall,
                ]}
              ></Text>
            </View>

            {/* ✅ Total Cash Profit Calculation */}
            <View
              style={[stylesMOF.row, styles.tableRow, styleExpenses.totalRow]}
            >
              <Text
                style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}
              ></Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                  { fontWeight: "bold" },
                ]}
              >
                Total Cash Profit
              </Text>

              {financialYearLabels
                .slice(hideFirstYear ? 1 : 0)
                .map((yearLabel, yearIndex) => {
                  const visibleLabels = financialYearLabels.slice(
                    hideFirstYear ? 1 : 0
                  );
                  const centerIndex = Math.floor(visibleLabels.length / 2);

                  const totalCashProfit = Array.isArray(cashProfitArray)
                    ? cashProfitArray.reduce(
                        (acc, value) => acc + Number(value || 0),
                        0
                      )
                    : 0;

                  return (
                    <Text
                      key={yearIndex}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                        {
                          fontWeight: "bold",

                          textAlign: "center",
                          borderRightWidth: 0,
                          borderTopWidth: 1,
                        },
                      ]}
                    >
                      {yearIndex === centerIndex
                        ? formatNumber(totalCashProfit)
                        : ""}
                    </Text>
                  );
                })}

              <Text
                style={[
                  stylesCOP.particularsCellsDetail,
                  styleExpenses.fontSmall,
                  { borderLeftWidth: 1 },
                ]}
              ></Text>
            </View>
          </View>

          {/* Calculation of Ratios */}

          <View>
            <View style={[stylesMOF.row]}>
              <Text style={[styleExpenses.sno]}></Text>
              <Text
                style={[
                  stylesMOF.cell,
                  styleExpenses.fontBold,
                  { textAlign: "center" },
                ]}
              >
                Calculation of Ratios
              </Text>
            </View>

            <View>
              {/* ✅1 Gross Profit / Sales  */}
              <View style={styles.tableRow}>
                <Text
                  style={[
                    stylesCOP.serialNoCellDetail,
                    styleExpenses.sno,
                    styleExpenses.bordernone,
                    { paddingTop: "20px", borderLeftWidth: 0 },
                  ]}
                >
                  1
                </Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                    { paddingTop: "20px" },
                  ]}
                >
                  Gross Profit / Sales
                </Text>

                {/* ✅ Display Ratio from the Stored Variable */}
                {grossProfitSalesRatios.map(
                  (ratio, index) =>
                    (!hideFirstYear || index !== 0) && (
                      <Text
                        key={`gp-sales-ratio-${index}`}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                          { paddingTop: "20px", paddingHorizontal: 0 },
                        ]}
                      >
                        {ratio !== "-" ? `${ratio}%` : ratio}{" "}
                        {/* Showing ratio as a percentage only if valid */}
                      </Text>
                    )
                )}
                <Text
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                    {
                      fontWeight: "extrabold",
                      paddingTop: "20px",
                    },
                  ]}
                >
                  {averageGrossProfitSalesRatio !== "-"
                    ? `${averageGrossProfitSalesRatio}%`
                    : "-"}
                </Text>
              </View>

              {/* 2 Operating Profit / Sales Ratio  */}
              <View style={styles.tableRow}>
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
                  ]}
                >
                  Operating Profit / Sales Ratio
                </Text>

                {/* ✅ Display Ratio from the Stored Variable */}
                {operatingProfitSalesRatios.map(
                  (ratio, index) =>
                    (!hideFirstYear || index !== 0) && (
                      <Text
                        key={`op-sales-ratio-${index}`}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                          { paddingHorizontal: 0 },
                        ]}
                      >
                        {ratio !== "-" ? `${ratio}%` : ratio}
                      </Text>
                    )
                )}
                <Text
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                    { fontWeight: "extrabold" },
                  ]}
                >
                  {averageOperatingProfitSalesRatio !== "-"
                    ? `${averageOperatingProfitSalesRatio}%`
                    : "-"}
                </Text>
              </View>

              {/* 3 Profit Before Tax / Sales Ratio */}
              <View style={styles.tableRow}>
                <Text
                  style={[
                    stylesCOP.serialNoCellDetail,
                    styleExpenses.sno,
                    styleExpenses.bordernone,
                    {},
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
                  Profit Before Tax / Sales Ratio
                </Text>
                {/* ✅ Display Ratio from the Stored Variable */}
                {ProfitBeforeTaxRatios.map(
                  (ratio, index) =>
                    (!hideFirstYear || index !== 0) && (
                      <Text
                        key={`op-pbt-ratio-${index}`}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                          { paddingHorizontal: 0 },
                        ]}
                      >
                        {ratio !== "-" ? `${ratio}%` : ratio}
                      </Text>
                    )
                )}
                <Text
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                    { fontWeight: "extrabold" },
                  ]}
                >
                  {averageProfitBeforeTaxSalesRatio !== "-"
                    ? `${averageProfitBeforeTaxSalesRatio}%`
                    : "-"}
                </Text>
              </View>

              {/*4 Net Profit / Sales Ratio  */}
              <View style={styles.tableRow}>
                <Text
                  style={[
                    stylesCOP.serialNoCellDetail,
                    styleExpenses.sno,
                    styleExpenses.bordernone,
                    {},
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
                  Net Profit / Sales Ratio
                </Text>

                {/* ✅ Display Ratio from the Stored Variable */}
                {netProfitSalesRatio.map(
                  (ratio, index) =>
                    (!hideFirstYear || index !== 0) && (
                      <Text
                        key={`np-pbt-ratio-${index}`}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                          { paddingHorizontal: 0 },
                        ]}
                      >
                        {ratio !== "-" ? `${ratio}%` : ratio}
                      </Text>
                    )
                )}
                <Text
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                    { fontWeight: "extrabold" },
                  ]}
                >
                  {averageNetProfitSalesRatio !== "-"
                    ? `${averageNetProfitSalesRatio}%`
                    : "-"}
                </Text>
              </View>

              {/* 5 Net Profit / Net Worth Ratio */}
              <View style={styles.tableRow}>
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
                  ]}
                >
                  Net Profit / Net Worth Ratio
                </Text>

                {netProfitNetWorthRatio.map(
                  (ratio, index) =>
                    (!hideFirstYear || index !== 0) && (
                      <Text
                        key={`np-nw-ratio-${index}`}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                          { paddingHorizontal: 0 },
                        ]}
                      >
                        {ratio !== "-" ? `${ratio}%` : ratio}
                      </Text>
                    )
                )}
                <Text
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                    { fontWeight: "extrabold" },
                  ]}
                >
                  {averageNetProfitNetWorthRatio !== "-"
                    ? `${averageNetProfitNetWorthRatio}%`
                    : "-"}
                </Text>
              </View>

              {/* 6 Debt-Equity Ratio */}
              <View style={styles.tableRow}>
                <Text
                  style={[
                    stylesCOP.serialNoCellDetail,
                    styleExpenses.sno,
                    styleExpenses.bordernone,
                    {},
                  ]}
                >
                  6
                </Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  Debt-Equity Ratio
                </Text>

                {deptEqualityRatio.map(
                  (ratio, index) =>
                    (!hideFirstYear || index !== 0) && (
                      <Text
                        key={`dept-equality-ratio-${index}`}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                          { paddingHorizontal: 0 },
                        ]}
                      >
                        {ratio !== "-" ? `${ratio}` : ratio}
                      </Text>
                    )
                )}
                <Text
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                    { fontWeight: "extrabold" },
                  ]}
                >
                  {averageDebtEquityRatio !== "-"
                    ? `${averageDebtEquityRatio}`
                    : "-"}
                </Text>
              </View>

              {/* 7 Total Outside Liabilities / Total Net Worth  */}
              <View style={styles.tableRow}>
                <Text
                  style={[
                    stylesCOP.serialNoCellDetail,
                    styleExpenses.sno,
                    styleExpenses.bordernone,
                    {},
                  ]}
                >
                  7
                </Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  Total Outside Liabilities / Total Net Worth
                </Text>

                {totalOutsideLiabilitiesNetWorthRatio.map(
                  (ratio, index) =>
                    (!hideFirstYear || index !== 0) && (
                      <Text
                        key={index}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                          { paddingHorizontal: 0 },
                        ]}
                      >
                        {ratio}
                      </Text>
                    )
                )}
                <Text
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                    { fontWeight: "extrabold" },
                  ]}
                >
                  {averageTotalOutsideLiabilitiesNetWorthRatio !== "-"
                    ? `${averageTotalOutsideLiabilitiesNetWorthRatio}`
                    : "-"}
                </Text>
              </View>

              {/*8  Net Worth / Total Liabilities */}
              <View style={styles.tableRow}>
                <Text
                  style={[
                    stylesCOP.serialNoCellDetail,
                    styleExpenses.sno,
                    styleExpenses.bordernone,
                    {},
                  ]}
                >
                  8
                </Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  Net Worth / Total Liabilities
                </Text>

                {netWorthTotalLiabilitiesRatio.map(
                  (ratio, index) =>
                    (!hideFirstYear || index !== 0) && (
                      <Text
                        key={index}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                          { paddingHorizontal: 0 },
                        ]}
                      >
                        {ratio}
                      </Text>
                    )
                )}
                <Text
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                    { fontWeight: "extrabold" },
                  ]}
                >
                  {averageNetWorthTotalLiabilitiesRatio !== "-"
                    ? `${averageNetWorthTotalLiabilitiesRatio}`
                    : "-"}
                </Text>
              </View>

              {/* 9 Debt-service Coverage Ratio */}
              <View style={styles.tableRow}>
                <Text
                  style={[
                    stylesCOP.serialNoCellDetail,
                    styleExpenses.sno,
                    styleExpenses.bordernone,
                    {},
                  ]}
                >
                  9
                </Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  Debt Service Coverage Ratio
                </Text>

                {Array.from({ length: projectionYears }).map((_, index) => {
                  if (hideFirstYear && index === 0) return null; // Skip first year if hideFirstYear is
                  // Retrieve DSCR value or default to 0 if not available
                  const ratio = receivedDscr?.DSCR?.[index] ?? 0;

                  return (
                    <Text
                      key={index}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                      ]}
                    >
                      {/* Display formatted value, rounded to 2 decimal places */}
                      {ratio !== 0 ? ratio.toFixed(2) : "0"}
                    </Text>
                  );
                })}

                <Text
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                    { fontWeight: "extrabold" },
                  ]}
                >
                  {averageDebtServiceCoverageRatio !== "-"
                    ? `${averageDebtServiceCoverageRatio}`
                    : "-"}
                </Text>
              </View>

              {/* 10 Current Ratio */}
              <View style={styles.tableRow}>
                <Text
                  style={[
                    stylesCOP.serialNoCellDetail,
                    styleExpenses.sno,
                    styleExpenses.bordernone,
                    {},
                  ]}
                >
                  10
                </Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  Current Ratio
                </Text>

                {currentRatio.map(
                  (ratio, index) =>
                    (!hideFirstYear || index !== 0) && (
                      <Text
                        key={index}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                          { paddingHorizontal: 0 },
                        ]}
                      >
                        {ratio}
                      </Text>
                    )
                )}
                <Text
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                    { fontWeight: "extrabold" },
                  ]}
                >
                  {averageCurrentRatio !== "-" ? `${averageCurrentRatio}` : "-"}
                </Text>
              </View>

              {/* 11 Return on Investment */}
              <View style={styles.tableRow}>
                <Text
                  style={[
                    stylesCOP.serialNoCellDetail,
                    styleExpenses.sno,
                    styleExpenses.bordernone,
                    {},
                  ]}
                >
                  11
                </Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  Return on Investment
                </Text>

                {returnOnInvestment.map(
                  (roi, index) =>
                    (!hideFirstYear || index !== 0) && (
                      <Text
                        key={index}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                          { paddingHorizontal: 0 },
                        ]}
                      >
                        {roi === "-" ? roi : `${roi}%`}
                      </Text>
                    )
                )}
                <Text
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                    { fontWeight: "extrabold" },
                  ]}
                >
                  {averageReturnOnInvestment !== "-"
                    ? `${averageReturnOnInvestment}%`
                    : "-"}
                </Text>
              </View>
            </View>
          </View>
        </View>
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
    </Page>
  );
};

export default React.memo(RatioAnalysis);
