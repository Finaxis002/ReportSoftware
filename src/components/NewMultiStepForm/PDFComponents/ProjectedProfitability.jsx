import React, { useEffect, useMemo, useState, useRef } from "react";
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

const ProjectedProfitability = ({
  formData,
  localData,
  normalExpense,
  directExpense,
  totalDepreciationPerYear,
  onComputedData,
  yearlyInterestLiabilities,
  setInterestOnWorkingCapital, // ✅ Receiving Setter Function from Parent
  totalRevenueReceipts,
  fringAndAnnualCalculation,
  financialYearLabels,
  handleDataSend,
  handleIncomeTaxDataSend,
  formatNumber,
  receivedtotalRevenueReceipts,
  onComputedDataToProfit,
  pdfType,
  orientation
}) => {
  useEffect(() => {
    if (yearlyInterestLiabilities.length > 0) {
      //  console.log("✅ Updated Yearly Interest Liabilities in State:", yearlyInterestLiabilities);
    }
  }, [yearlyInterestLiabilities]); // ✅ Runs when state update

  const activeRowIndex = 0; // Define it or fetch dynamically if needed

  const projectionYears =
    parseInt(formData.ProjectReportSetting.ProjectionYears) || 0;

  const indirectExpense = directExpense.filter(
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

  const hideFirstYear = receivedtotalRevenueReceipts?.[0] === 0;
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

  // const calculateInterestOnWorkingCapital = useMemo(() => {
  //   return (interestAmount, yearIndex) => {
  //     const monthsInYear = monthsPerYear[yearIndex];
  
  //     if (monthsInYear === 0) {
  //       return 0; // Entire year under moratorium
  //     }
  
  //     // ✅ Determine first visible repayment year index
  //     const isProRataYear =
  //       (!hideFirstYear && yearIndex === 0) ||
  //       (hideFirstYear && yearIndex === 1);
  
  //     const repaymentYear = monthsPerYear
  //       .slice(0, yearIndex)
  //       .filter((months, idx) => months > 0).length;
  
  //     if (isProRataYear && moratoriumPeriodMonths > 0) {
  //       // 🧮 Months applicable in first repayment year (e.g. May = month 2, then 11 months)
  //       const monthsEffective = monthsInYear;
  //       return (interestAmount * monthsEffective) / 12;
  //     } else if (repaymentYear >= 1) {
  //       return interestAmount; // Full interest from second visible repayment year onward
  //     } else {
  //       return 0; // No interest during moratorium
  //     }
  //   };
  // }, [moratoriumPeriodMonths, monthsPerYear, rateOfExpense, hideFirstYear]);


const calculateInterestOnWorkingCapital = useMemo(() => {
    return (interestAmount, yearIndex) => {
      const monthsInYear = monthsPerYear[yearIndex];

      if (monthsInYear === 0) {
        return 0; // Entire year under moratorium
      }

      // ✅ Determine first visible repayment year index
      const isProRataYear =
        (!hideFirstYear && yearIndex === 0) ||
        (hideFirstYear && yearIndex === 1);

      const repaymentYear = monthsPerYear
        .slice(0, yearIndex)
        .filter((months, idx) => months > 0).length;

      if (isProRataYear && moratoriumPeriodMonths > 0) {
        // 🧮 Months applicable in first repayment year (e.g. May = month 2, then 11 months)
        const monthsEffective = monthsInYear;
        return (interestAmount * monthsEffective) / 12;
      } else if (repaymentYear >= 1) {
        return interestAmount; // Full interest from second visible repayment year onward
      } else {
        return 0; // No interest during moratorium
      }
    };
  }, [moratoriumPeriodMonths, monthsPerYear, rateOfExpense, hideFirstYear]);


  const isWorkingCapitalInterestZero = Array.from({
    length: hideFirstYear ? projectionYears - 1 : projectionYears,
  }).every((_, yearIndex) => {
    const adjustedIndex = hideFirstYear ? yearIndex + 1 : yearIndex;
    const interestAmount = interestOnWorkingCapital[adjustedIndex] || 0;
    const calculatedInterest = calculateInterestOnWorkingCapital(
      interestAmount,
      adjustedIndex
    );
    return calculatedInterest === 0;
  });
  
  

  

  const moratoriumPeriod = formData?.ProjectReportSetting?.MoratoriumPeriod;

 
  // Function to calculate the expense for each year considering the increment rate
  const calculateExpense = (annualExpense, yearIndex) => {
    const monthsInYear = monthsPerYear[yearIndex];
    let incrementedExpense;
    // Count years with actual repayment for applying increment correctly
    const repaymentYear = monthsPerYear
      .slice(0, yearIndex)
      .filter((months) => months > 0).length;

    if (monthsInYear === 0) {
      incrementedExpense = 0; // No expense during moratorium
    } else {
      incrementedExpense =
        annualExpense * Math.pow(1 + rateOfExpense, repaymentYear);
    }
    return (incrementedExpense / 12) * monthsInYear;
  };

  const calculateDirectExpense = (annualExpense, yearIndex) => {
    // Example: apply a percentage increase for the direct expense over the years
    const rateOfExpense = 0.05; // Example: 5% increase per year
    const monthsInYear = monthsPerYear[yearIndex]; // Get the number of months in the year

    let incrementedExpense;
    const fullYearExpense =
      annualExpense * Math.pow(1 + rateOfExpense, yearIndex);

    if (monthsInYear === 0) {
      incrementedExpense = 0;
    } else {
      incrementedExpense = fullYearExpense;
    }

    return incrementedExpense;
  };

  // Function to calculate indirect expenses considering the increment rate
  const calculateIndirectExpense = (annualExpense, yearIndex) => {
    // Example: apply a percentage increase for the direct expense over the years
    const rateOfExpense = 0.05; // Example: 5% increase per year
    const monthsInYear = monthsPerYear[yearIndex]; // Get the number of months in the year

    let incrementedExpense;
    const fullYearExpense =
      annualExpense * Math.pow(1 + rateOfExpense, yearIndex);

    if (monthsInYear === 0) {
      incrementedExpense = 0;
    } else {
      incrementedExpense = fullYearExpense;
    }

    return incrementedExpense;
  };
  // Function to calculate interest on working capital considering moratorium period
  // const calculateInterestOnWorkingCapital = useMemo(() => {
  //   return (interestAmount, yearIndex) => {
  //     const monthsInYear = monthsPerYear[yearIndex];

  //     if (monthsInYear === 0) {
  //       return 0; // Entire year under moratorium
  //     }

  //     // ✅ Determine first visible repayment year index
  //     const isProRataYear =
  //       (!hideFirstYear && yearIndex === 0) ||
  //       (hideFirstYear && yearIndex === 1);

  //     const repaymentYear = monthsPerYear
  //       .slice(0, yearIndex)
  //       .filter((months, idx) => months > 0).length;

  //     if (isProRataYear && moratoriumPeriodMonths > 0) {
  //       // 🧮 Months applicable in first repayment year (e.g. May = month 2, then 11 months)
  //       const monthsEffective = monthsInYear;
  //       return (interestAmount * monthsEffective) / 12;
  //     } else if (repaymentYear >= 1) {
  //       return interestAmount; // Full interest from second visible repayment year onward
  //     } else {
  //       return 0; // No interest during moratorium
  //     }
  //   };
  // }, [moratoriumPeriodMonths, monthsPerYear, rateOfExpense, hideFirstYear]);

  const totalDirectExpensesArray = Array.from({
    length: parseInt(formData.ProjectReportSetting.ProjectionYears) || 0,
  }).map((_, yearIndex) => {
    // console.log(`\n📊 YEAR ${yearIndex + 1} CALCULATION STARTS`);

    const totalDirectExpenses = directExpense
      .filter((expense) => expense.type === "direct")
      .reduce((sum, expense) => {
        const isRawMaterial =
          expense.name.trim() === "Raw Material Expenses / Purchases";
        const isPercentage = String(expense.value).trim().endsWith("%");

        const ClosingStock =
          formData?.MoreDetails?.ClosingStock?.[yearIndex] || 0;
        const OpeningStock =
          formData?.MoreDetails?.OpeningStock?.[yearIndex] || 0;

        let expenseValue = 0;

        if (isRawMaterial && isPercentage) {
          const baseValue =
            (parseFloat(expense.value) / 100) *
            (receivedtotalRevenueReceipts?.[yearIndex] || 0);
          expenseValue = baseValue + ClosingStock - OpeningStock;

          // console.log(
          //   `🧾 ${expense.name} [Raw Material - %]: (${expense.value} of revenue) = ₹${baseValue.toFixed(
          //     2
          //   )}, Adj. ClosingStock: ₹${ClosingStock}, OpeningStock: ₹${OpeningStock} ➤ Final: ₹${expenseValue.toFixed(
          //     2
          //   )}`
          // );
        } else {
          const base = Number(expense.total) || 0;
          expenseValue = calculateExpense(base, yearIndex); // use same logic as JSX

          // console.log(
          //   `🧾 ${expense.name}: ₹${base} ➤ Escalated (Y${yearIndex + 1}): ₹${expenseValue.toFixed(
          //     2
          //   )}`
          // );
        }

        return sum + expenseValue;
      }, 0);

    // Salary and Wages - apply the same formula
    const salaryBase = Number(fringAndAnnualCalculation) || 0;
    const totalSalaryWages = calculateExpense(salaryBase, yearIndex); // MATCH JSX

    // console.log(
    //   `👨‍💼 Salary and Wages: ₹${salaryBase} ➤ Escalated (Y${
    //     yearIndex + 1
    //   }): ₹${totalSalaryWages.toFixed(2)}`
    // );

    const yearTotal = totalDirectExpenses + totalSalaryWages;

    // console.log(
    //   `✅ TOTAL Direct Expenses (Y${yearIndex + 1}): ₹${yearTotal.toFixed(2)}`
    // );

    return yearTotal;
  });

  const totalIndirectExpensesArray = Array.from({
    length: parseInt(formData.ProjectReportSetting.ProjectionYears) || 0,
  }).map((_, yearIndex) => {
    // console.log(`\n📊 INDIRECT EXPENSES - YEAR ${yearIndex + 1}`);
  
    const totalIndirectExpenses = indirectExpense
      .filter((expense) => expense.type === "indirect")
      .reduce((sum, expense) => {
        const annual = Number(expense.total) || 0;
  
        // ✅ Use same logic as render: calculateExpense instead of calculateIndirectExpense
        const escalated = calculateExpense(annual, yearIndex);
  
        // console.log(
        //   `💰 ${expense.name}: Base = ₹${annual}, Escalated (Y${yearIndex + 1}) ➤ ₹${escalated.toFixed(
        //     2
        //   )}`
        // );
  
        return sum + escalated;
      }, 0);
  
    const interestOnTermLoan = yearlyInterestLiabilities[yearIndex] || 0;
    const interestExpenseOnWorkingCapital = calculateInterestOnWorkingCapital(
      interestOnWorkingCapital[yearIndex] || 0,
      yearIndex
    );
    const depreciationExpense = totalDepreciationPerYear[yearIndex] || 0;
  
    // console.log(`💳 Interest on Term Loan: ₹${interestOnTermLoan.toFixed(2)}`);
    // console.log(
    //   `🏦 Interest on Working Capital: ₹${interestExpenseOnWorkingCapital.toFixed(
    //     2
    //   )}`
    // );
    // console.log(`🏗️ Depreciation: ₹${depreciationExpense.toFixed(2)}`);
  
    const yearTotal =
      totalIndirectExpenses +
      interestOnTermLoan +
      interestExpenseOnWorkingCapital +
      depreciationExpense;
  
    // console.log(
    //   `✅ TOTAL Indirect Expenses (Y${yearIndex + 1}): ₹${yearTotal.toFixed(2)}`
    // );
  
    return yearTotal;
  });
  // ✅ Extract required values from formData
  const workingCapitalLoan = formData?.MeansOfFinance?.workingCapital?.termLoan; // Loan amount
  const interestRate = formData?.ProjectReportSetting?.rateOfInterest / 100; // Convert % to decimal

  const startMonthIndex = months.indexOf(
    formData.ProjectReportSetting.SelectStartingMonth
  );

  // ✅ Ensure a valid starting month
  const repaymentStartMonth = startMonthIndex !== -1 ? startMonthIndex : 0;

  // ✅ Compute Interest on Working Capital
  useEffect(() => {
    if (workingCapitalLoan > 0) {
      const computedInterest = Array.from({ length: projectionYears }).map(
        (_, yearIndex) => {
          const monthsInYear = yearIndex === 0 ? 12 - repaymentStartMonth : 12;
          return workingCapitalLoan * interestRate * (monthsInYear / 12);
        }
      );

      // console.log("✅ Computed Interest on Working Capital:", computedInterest);

      // ✅ If Parent Function Exists, Update Parent Component
      if (setInterestOnWorkingCapital) {
        setInterestOnWorkingCapital(computedInterest);
      }
    }
  }, [workingCapitalLoan, interestRate, projectionYears, repaymentStartMonth]);

  // ✅ Compute Adjusted Revenue Values for Each Year Before Rendering
  const adjustedRevenueValues = Array.from({
    length: parseInt(formData?.ProjectReportSetting?.ProjectionYears) || 0,
  }).map((_, yearIndex) => {
    const totalRevenue = totalRevenueReceipts[yearIndex] || 0;
    const ClosingStock = formData?.MoreDetails?.ClosingStock?.[yearIndex] || 0;
    const OpeningStock = formData?.MoreDetails?.OpeningStock?.[yearIndex] || 0;

    return totalRevenue + ClosingStock - OpeningStock; // ✅ Final computation
  });

  // ✅ Step 2: Compute Gross Profit Values for Each Year After `totalDirectExpenses` is Defined
  const grossProfitValues = adjustedRevenueValues.map(
    (adjustedRevenue, yearIndex) => {
      const totalDirectExpenses = totalDirectExpensesArray[yearIndex] || 0; // Ensure the expenses for the specific year are used
      return adjustedRevenue - totalDirectExpenses; // Subtract expenses from adjusted revenue to get gross profit
    }
  );

  // ✅ Precompute Net Profit Before Tax (NPBT) for Each Year Before Rendering
  const netProfitBeforeTax = grossProfitValues.map((grossProfit, yearIndex) => {
    // Subtracting totalIndirectExpensesArray and other expenses like interest, depreciation etc.
    const totalIndirectExpenses = totalIndirectExpensesArray[yearIndex] || 0; // Ensure indirect expenses are considered
    return grossProfit - totalIndirectExpenses; // Net Profit Before Tax (NPBT)
  });

  // ✅ Precompute Income Tax Calculation for Each Year Before Rendering
  const incomeTaxCalculation = netProfitBeforeTax.map((npbt, yearIndex) => {
    return (npbt * formData.ProjectReportSetting.incomeTax) / 100;
  });

  // ✅ Precompute Net Profit After Tax (NPAT) for Each Year Before Rendering
  const netProfitAfterTax = netProfitBeforeTax.map((npat, yearIndex) => {
    return npat - incomeTaxCalculation[yearIndex]; // ✅ Correct subtraction
  });

  // Precompute Balance Transferred to Balance Sheet
  const balanceTransferred = netProfitAfterTax.map(
    (npbt, yearIndex) =>
      npbt - (formData.MoreDetails.Withdrawals?.[yearIndex] || 0)
  );

  // Precompute Cumulative Balance Transferred to Balance Sheet
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

  // ✅ Compute Cash Profit for Each Year
  const cashProfitArray = netProfitAfterTax.map((npat, yearIndex) => {
    const depreciation = totalDepreciationPerYear[yearIndex] || 0;

    // ✅ Correctly Compute Cash Profit
    const cashProfit = npat + depreciation;

    // ✅ Round values correctly
    return cashProfit;
  });

  useEffect(() => {
    if (cumulativeBalanceTransferred.length > 0) {
      // Pass the data directly as an object
      handleDataSend({
        cumulativeBalanceTransferred,
      });
    }
    // console.log("cummulative data", cumulativeBalanceTransferred);
  }, [JSON.stringify(cumulativeBalanceTransferred)]);

  useEffect(() => {
    if (incomeTaxCalculation.length > 0) {
      // Pass the data directly as an object
      handleIncomeTaxDataSend({
        incomeTaxCalculation,
      });
    }
    //  console.log("Income Tax data", incomeTaxCalculation);
  }, [JSON.stringify(incomeTaxCalculation)]);

  // ✅ Ensure `onComputedData` updates only when required
  useEffect(() => {
    if (grossProfitValues.length > 0) {
      onComputedData((prev) => ({
        ...prev,
        grossProfitValues,
        netProfitBeforeTax,
        cashProfitArray,
      }));
    }
  }, [
    JSON.stringify(grossProfitValues),
    JSON.stringify(netProfitBeforeTax),
    JSON.stringify(cashProfitArray),
  ]);

  useEffect(() => {
    if (netProfitAfterTax.length > 0) {
      onComputedData((prev) => ({
        ...prev,
        netProfitAfterTax,
      }));
    }
  }, [JSON.stringify(netProfitAfterTax)]);

  useEffect(() => {
    if (netProfitAfterTax.length > 0) {
      onComputedDataToProfit((prev) => ({
        ...prev,
        netProfitAfterTax,
      }));
    }
    // console.log("Sending DAta to Checkl Profit", netProfitAfterTax)
  }, [JSON.stringify(netProfitAfterTax)]);

  useEffect(() => {
    const storedProfitabilityData = {
      totalDirectExpensesArray,
      totalIndirectExpensesArray,
      calculateExpense,
    };

    localStorage.setItem(
      "storedProfitabilityData",
      JSON.stringify(storedProfitabilityData)
    );
  }, [totalDirectExpensesArray, totalIndirectExpensesArray, calculateExpense]); // Runs when these values change

  useEffect(() => {
    const storedData = localStorage.getItem("storedProfitabilityData");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      // console.log("Retrieved Data:", parsedData);
    }
  }, []);

  // ✅ Determine if first-year should be hidden

  // const orientation = hideFirstYear
  //   ? formData.ProjectReportSetting.ProjectionYears > 6
  //     ? "landscape"
  //     : "portrait"
  //   : formData.ProjectReportSetting.ProjectionYears > 5
  //   ? "landscape"
  //   : "portrait";

  return (
    <Page
      size={formData.ProjectReportSetting.ProjectionYears > 12 ? "A3" : "A4"}
      orientation={orientation}
      style={[{ padding: "20px" }]}
      wrap={false}
      break
    >
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
      {/* businees name and financial year  */}
      <View>
        <Text style={styles.businessName}>
          {formData?.AccountInformation?.businessName || "Business Bame"}
        </Text>
        <Text style={styles.FinancialYear}>
          Financial Year{" "}
          {formData?.ProjectReportSetting?.FinancialYear || "financial year"}
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

      <View style={[styleExpenses.paddingx, { paddingBottom: "5px" }]}>
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
            {financialYearLabels.map(
              (yearLabel, yearIndex) =>
                (!hideFirstYear || yearIndex !== 0) && (
                  <Text
                    key={yearIndex}
                    style={[styles.particularsCell, stylesCOP.boldText]}
                  >
                    {yearLabel}
                  </Text>
                )
            )}
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

            {/* ✅ Display revenue values based on projectionYears */}
            {Array.from({ length: projectionYears }).map((_, yearIndex) =>
              !hideFirstYear || yearIndex !== 0 ? (
                <Text
                  key={yearIndex}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                    { paddingVertical: "5px" },
                  ]}
                ></Text>
              ) : null
            )}
          </View>

          {/* ✅ Display Total Revenue Receipt Row */}
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
            >
              A
            </Text>
            <Text
              style={[
                stylesCOP.detailsCellDetail,
                styleExpenses.particularWidth,
                styleExpenses.bordernone,
                styles.Total,
                {},
              ]}
            >
              Total Revenue Receipt
            </Text>

            {/* ✅ Display revenue values based on projectionYears */}
            {Array.from({ length: projectionYears }).map((_, yearIndex) =>
              !hideFirstYear || yearIndex !== 0 ? (
                <Text
                  key={yearIndex}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    stylesCOP.boldText,
                    styleExpenses.fontSmall,
                    styles.Total,
                    { borderLeftWidth: "0px" },
                  ]}
                >
                  {formatNumber(totalRevenueReceipts?.[yearIndex] || 0)}
                </Text>
              ) : null
            )}
          </View>

          {/* Closing Stock / Inventory */}
          <View style={[styles.tableRow, styles.totalRow]}>
            <Text
              style={[
                stylesCOP.serialNoCellDetail,
                styleExpenses.sno,
                styleExpenses.bordernone,
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
                { paddingVertical: "10px" },
              ]}
            >
              Add: Closing Stock / Inventory
            </Text>

            {Array.from({
              length:
                parseInt(formData.ProjectReportSetting.ProjectionYears) || 0,
            }).map(
              (_, index) =>
                (!hideFirstYear || index !== 0) && (
                  <Text
                    key={`ClosingStock-${index}`}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                      { paddingVertical: "10px" },
                    ]}
                  >
                    {formatNumber(
                      formData.MoreDetails.ClosingStock?.[index] ?? 0
                    )}
                  </Text>
                )
            )}
          </View>
          {/* Opening Stock / Inventory */}
          <View style={[styles.tableRow, styles.totalRow]}>
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
              ]}
            >
              Less: Opening Stock / Inventory
            </Text>

            {Array.from({
              length:
                parseInt(formData.ProjectReportSetting.ProjectionYears) || 0,
            }).map(
              (_, index) =>
                (!hideFirstYear || index !== 0) && (
                  <Text
                    key={`OpeningStock-${index}`}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                    ]}
                  >
                    {formatNumber(
                      formData.MoreDetails.OpeningStock?.[index] ?? 0
                    )}
                  </Text>
                )
            )}
          </View>

          {/* Computation of Total Revenue, Adding Closing Stock, and Subtracting Opening Stock */}
          <View
            style={[
              stylesMOF.row,
              styles.tableRow,
              { borderBottomWidth: "0px" },
            ]}
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
                {},
              ]}
            ></Text>

            {/* ✅ Display Computed Adjusted Revenue Values */}
            {adjustedRevenueValues.map(
              (finalValue, yearIndex) =>
                (!hideFirstYear || yearIndex !== 0) && (
                  <Text
                    key={`finalValue-${yearIndex}`}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      stylesCOP.boldText,
                      styleExpenses.fontSmall,
                      {
                        borderLeftWidth: "0px",
                      },
                    ]}
                  >
                    {formatNumber(finalValue)}
                  </Text>
                )
            )}
          </View>

          {/* direct expenses */}
          <View style={[styles.tableRow, styles.totalRow]}>
            <Text
              style={[
                stylesCOP.serialNoCellDetail,
                styles.Total,
                { paddingVertical: "10px" },
              ]}
            >
              C
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
              Direct Expenses
            </Text>
            {Array.from({ length: projectionYears }).map((_, yearIndex) => {
              if (hideFirstYear && yearIndex === 0) return null; // Skip first year if hideFirstYear is true

              return (
                <Text
                  key={yearIndex}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                  ]}
                >
                  {/* You can add content here if needed */}
                </Text>
              );
            })}
          </View>

          {/* Salary and wages  */}
          {normalExpense.map((expense, index) => {
            if (index !== activeRowIndex) return null; // Only render the active row

            return (
              <View key={index} style={[styles.tableRow, styles.totalRow]}>
                <Text style={stylesCOP.serialNoCellDetail}>1</Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  Salary and Wages
                </Text>

                {Array.from({ length: projectionYears }).map(
                  (_, yearIndex) =>
                    (!hideFirstYear || yearIndex !== 0) && (
                      <Text
                        key={yearIndex}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                        ]}
                      >
                        {formatNumber(
                          calculateExpense(
                            Number(fringAndAnnualCalculation) || 0,
                            yearIndex
                          )
                        )}
                      </Text>
                    )
                )}
              </View>
            );
          })}

          {/* Direct Expenses */}
          {directExpense
            .filter((expense) => {
              const isAllYearsZero = Array.from({
                length: hideFirstYear ? projectionYears - 1 : projectionYears,
              }).every((_, yearIndex) => {
                const adjustedYearIndex = hideFirstYear
                  ? yearIndex + 1
                  : yearIndex;

                // Determine actual value
                let expenseValue = 0;
                const isRawMaterial =
                  expense.name.trim() === "Raw Material Expenses / Purchases";
                const isPercentage = String(expense.value).trim().endsWith("%");
                const ClosingStock =
                  formData?.MoreDetails?.ClosingStock?.[yearIndex] || 0;
                const OpeningStock =
                  formData?.MoreDetails?.OpeningStock?.[yearIndex] || 0;

                if (isRawMaterial && isPercentage) {
                  const baseValue =
                    (parseFloat(expense.value) / 100) *
                    (receivedtotalRevenueReceipts?.[adjustedYearIndex] || 0);
                  expenseValue = baseValue + ClosingStock - OpeningStock;
                } else {
                  expenseValue = Number(expense.total) || 0;
                }

                return expenseValue === 0;
              });

              return expense.type === "direct" && !isAllYearsZero;
            })

            .map((expense, index) => {
              const isRawMaterial =
                expense.name.trim() === "Raw Material Expenses / Purchases";
              const isPercentage = String(expense.value).trim().endsWith("%");
              const displayName = isRawMaterial
                ? "Purchases / RM Expenses"
                : expense.name;

              return (
                <View key={index} style={[styles.tableRow, styles.totalRow]}>
                  <Text style={stylesCOP.serialNoCellDetail}>{index + 2}</Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                    ]}
                  >
                    {displayName}
                  </Text>

                  {Array.from({
                    length: hideFirstYear
                      ? projectionYears - 1
                      : projectionYears,
                  }).map((_, yearIndex) => {
                    const adjustedYearIndex = hideFirstYear
                      ? yearIndex + 1
                      : yearIndex;

                    let expenseValue = 0;
                    const isRawMaterial =
                      expense.name.trim() ===
                      "Raw Material Expenses / Purchases";
                    const isPercentage = String(expense.value)
                      .trim()
                      .endsWith("%");
                    const ClosingStock =
                      formData?.MoreDetails?.ClosingStock?.[yearIndex] || 0;
                    const OpeningStock =
                      formData?.MoreDetails?.OpeningStock?.[yearIndex] || 0;

                    if (isRawMaterial && isPercentage) {
                      const baseValue =
                        (parseFloat(expense.value) / 100) *
                        (receivedtotalRevenueReceipts?.[adjustedYearIndex] ||
                          0);
                      expenseValue = baseValue + ClosingStock - OpeningStock;
                    } else {
                      expenseValue = Number(expense.total) || 0;
                    }

                    const formattedExpense =
                      isRawMaterial && isPercentage
                        ? formatNumber(expenseValue.toFixed(2))
                        : formatNumber(
                            calculateExpense(
                              expenseValue,
                              adjustedYearIndex
                            ).toFixed(2)
                          );

                    return (
                      <Text
                        key={yearIndex}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                        ]}
                      >
                        {formattedExpense}
                      </Text>
                    );
                  })}
                </View>
              );
            })}

          {/* direct Expenses total  */}
          <View style={[styles.tableRow, styles.totalRow]}>
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
                {},
              ]}
            >
              Total
            </Text>
            {/* ✅ Display Precomputed Total Direct Expenses */}
            {totalDirectExpensesArray.map(
              (grandTotal, yearIndex) =>
                (!hideFirstYear || yearIndex !== 0) && (
                  <Text
                    key={yearIndex}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      stylesCOP.boldText,
                      styleExpenses.fontSmall,
                    ]}
                  >
                    {formatNumber(grandTotal)}
                  </Text>
                )
            )}
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

            {/* ✅ Display revenue values based on projectionYears */}
            {Array.from({ length: projectionYears }).map((_, yearIndex) =>
              !hideFirstYear || yearIndex !== 0 ? (
                <Text
                  key={yearIndex}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                    { paddingVertical: "5px" },
                  ]}
                ></Text>
              ) : null
            )}
          </View>

          {/* Gross Profit Calculation */}
          <View style={[stylesMOF.row, styles.tableRow]}>
            <Text
              style={[
                stylesCOP.serialNoCellDetail,
                styleExpenses.sno,
                styleExpenses.bordernone,
                {},
              ]}
            >
              D
            </Text>
            <Text
              style={[
                stylesCOP.detailsCellDetail,
                styleExpenses.particularWidth,
                styleExpenses.bordernone,
                {},
              ]}
            >
              Gross Profit
            </Text>

            {/* ✅ Display Precomputed Gross Profit Values */}
            {grossProfitValues.map(
              (grossProfit, yearIndex) =>
                (!hideFirstYear || yearIndex !== 0) && (
                  <Text
                    key={`grossProfit-${yearIndex}`}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      stylesCOP.boldText,
                      styleExpenses.fontSmall,
                      {
                        borderWidth: "1.2px",
                        borderLeftWidth: "0px",

                        //
                      },
                    ]}
                  >
                    {formatNumber(grossProfit)}
                  </Text>
                )
            )}
          </View>

          {/* indirect expense */}
          <View>
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  styles.Total,
                  { paddingVertical: "10px" },
                ]}
              >
                E
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
                Less:Indirect Expenses
              </Text>
              {Array.from({ length: projectionYears }).map(
                (_, yearIndex) =>
                  (!hideFirstYear || yearIndex !== 0) && (
                    <Text
                      key={yearIndex}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                      ]}
                    >
                      {/* You can add content here if needed */}
                    </Text>
                  )
              )}
            </View>
            {/* Interest On Term Loan */}
            <View style={[styles.tableRow, styles.totalRow]}>
              {/* Serial Number */}
              <Text style={stylesCOP.serialNoCellDetail}>1</Text>

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
                length: formData?.ProjectReportSetting?.ProjectionYears || 0, // Ensure ProjectionYears is defined
              }).map(
                (_, index) =>
                  (!hideFirstYear || index !== 0) && (
                    <Text
                      key={index}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                      ]}
                    >
                      {formatNumber(
                        yearlyInterestLiabilities?.[index] ?? 0 // Prevents undefined access
                      )}
                    </Text>
                  )
              )}
            </View>
            {/* Interest on Working Capital */}
            {!isWorkingCapitalInterestZero && (<View style={[styles.tableRow, styles.totalRow]}>
              <Text style={stylesCOP.serialNoCellDetail}>2</Text>

              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                ]}
              >
                Interest On Working Capital
              </Text>

              {/* ✅ Apply `calculateInterestOnWorkingCapital` */}
              {Array.from({
                length: formData.ProjectReportSetting.ProjectionYears,
              }).map((_, yearIndex) => {
                if (hideFirstYear && yearIndex === 0) return null; // Skip first year if hideFirstYear is true

                const calculatedInterest = calculateInterestOnWorkingCapital(
                  interestOnWorkingCapital[yearIndex] || 0,
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
                    {formatNumber(calculatedInterest)}
                  </Text>
                );
              })}
            </View>)}

            
            {/* ✅ Render Depreciation Row */}
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text style={stylesCOP.serialNoCellDetail}>
                {isWorkingCapitalInterestZero ? 2 : 3}
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
              {totalDepreciationPerYear.map(
                (depreciationValue, yearIndex) =>
                  (!hideFirstYear || yearIndex !== 0) && (
                    <Text
                      key={yearIndex}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                      ]}
                    >
                      {formatNumber(depreciationValue)}
                    </Text>
                  )
              )}
            </View>
            {directExpense
              .filter((expense) => {
                const isAllYearsZero = Array.from({
                  length: hideFirstYear ? projectionYears - 1 : projectionYears,
                }).every((_, yearIndex) => {
                  const adjustedYearIndex = hideFirstYear
                    ? yearIndex + 1
                    : yearIndex;

                  // Determine actual value
                  let expenseValue = 0;
                  const isRawMaterial =
                    expense.name.trim() === "Raw Material Expenses / Purchases";
                  const isPercentage = String(expense.value)
                    .trim()
                    .endsWith("%");
                  const ClosingStock =
                    formData?.MoreDetails?.ClosingStock?.[yearIndex] || 0;
                  const OpeningStock =
                    formData?.MoreDetails?.OpeningStock?.[yearIndex] || 0;

                  if (isRawMaterial && isPercentage) {
                    const baseValue =
                      (parseFloat(expense.value) / 100) *
                      (receivedtotalRevenueReceipts?.[adjustedYearIndex] || 0);
                    expenseValue = baseValue + ClosingStock - OpeningStock;
                  } else {
                    expenseValue = Number(expense.total) || 0;
                  }

                  return expenseValue === 0;
                });

                return expense.type === "indirect" && !isAllYearsZero;
              })

              .map((expense, index) => {
                const annualExpense = Number(expense.total) || 0; // ✅ Use annual total directly
                const isRawMaterial =
                        expense.name.trim() ===
                        "Raw Material Expenses / Purchases";
                const displayName = isRawMaterial
                ? "Purchases / RM Expenses"
                : expense.name;
                const serialNumber = isWorkingCapitalInterestZero ? index + 3 : index + 4
                return (
                  <View key={index} style={[styles.tableRow, styles.totalRow]}>
                    <Text style={stylesCOP.serialNoCellDetail}>
                      {serialNumber}
                    </Text>

                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      {displayName}
                    </Text>

                    {Array.from({
                      length: hideFirstYear
                        ? projectionYears - 1
                        : projectionYears,
                    }).map((_, yearIndex) => {
                      const adjustedYearIndex = hideFirstYear
                        ? yearIndex + 1
                        : yearIndex;

                      let expenseValue = 0;
                      const isRawMaterial =
                        expense.name.trim() ===
                        "Raw Material Expenses / Purchases";
                      const isPercentage = String(expense.value)
                        .trim()
                        .endsWith("%");
                      const ClosingStock =
                        formData?.MoreDetails?.ClosingStock?.[yearIndex] || 0;
                      const OpeningStock =
                        formData?.MoreDetails?.OpeningStock?.[yearIndex] || 0;

                      if (isRawMaterial && isPercentage) {
                        const baseValue =
                          (parseFloat(expense.value) / 100) *
                          (receivedtotalRevenueReceipts?.[adjustedYearIndex] ||
                            0);
                        expenseValue = baseValue + ClosingStock - OpeningStock;
                      } else {
                        expenseValue = Number(expense.total) || 0;
                      }

                      const formattedExpense =
                        isRawMaterial && isPercentage
                          ? formatNumber(expenseValue.toFixed(2))
                          : formatNumber(
                              calculateExpense(
                                expenseValue,
                                adjustedYearIndex
                              ).toFixed(2)
                            );

                      return (
                        <Text
                          key={yearIndex}
                          style={[
                            stylesCOP.particularsCellsDetail,
                            styleExpenses.fontSmall,
                          ]}
                        >
                          {formattedExpense}
                        </Text>
                      );
                    })}
                  </View>
                );
              })}
            ;{/* ✅ Total Indirect Expenses Row */}
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text style={stylesCOP.serialNoCellDetail}></Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                  styles.Total,
                  { paddingVertical: "10px" },
                ]}
              >
                Total
              </Text>

              {/* ✅ Display the calculated `totalIndirectExpensesArray` */}
              {totalIndirectExpensesArray.map(
                (totalValue, yearIndex) =>
                  (!hideFirstYear || yearIndex !== 0) && (
                    <Text
                      key={yearIndex}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        stylesCOP.boldText,
                        styleExpenses.fontSmall,
                        styles.Total,
                        { paddingVertical: "10px" },
                      ]}
                    >
                      {formatNumber(totalValue)}
                    </Text>
                  )
              )}
            </View>
          </View>

          {/* Net Profit Before Tax Calculation */}
          <View style={[styles.tableRow, styles.totalRow]}>
            <Text
              style={[
                stylesCOP.serialNoCellDetail,
                styleExpenses.sno,
                styleExpenses.bordernone,
                {
                  // ✅ Ensure using the registered font
                  fontWeight: "bold", // ✅ Apply bold
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
                  // ✅ Ensure using the registered font
                  fontWeight: "bold", // ✅ Apply bold
                },
              ]}
            >
              Net Profit Before Tax
            </Text>

            {/* ✅ Display Precomputed NPBT Values */}
            {netProfitBeforeTax.map(
              (npbt, yearIndex) =>
                (!hideFirstYear || yearIndex !== 0) && (
                  <Text
                    key={`netProfitBeforeTax-${yearIndex}`}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      stylesCOP.boldText,
                      styleExpenses.fontSmall,
                      {
                        borderWidth: "1.2px",

                        fontWeight: "bold",
                        color: "#000",
                        borderLeftWidth: "0px",
                        borderTop: 0,
                        borderBottom: 0,
                      },
                    ]}
                  >
                    {formatNumber(npbt)}
                  </Text>
                )
            )}
          </View>
          {/* Income Tax @  % */}
          <View style={[styles.tableRow, styles.totalRow]}>
            <Text
              style={[
                stylesCOP.serialNoCellDetail,
                styleExpenses.sno,
                styleExpenses.bordernone,
              ]}
            >
              Less
            </Text>
            <Text
              style={[
                stylesCOP.detailsCellDetail,
                styleExpenses.particularWidth,
                styleExpenses.bordernone,
                // { },
              ]}
            >
              Income Tax @ {formData.ProjectReportSetting.incomeTax} %
            </Text>

            {/* ✅ Display Precomputed Income Tax Values */}
            {incomeTaxCalculation.map(
              (tax, yearIndex) =>
                (!hideFirstYear || yearIndex !== 0) && (
                  <Text
                    key={`incomeTax-${yearIndex}`}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      // stylesCOP.boldText,
                      styleExpenses.fontSmall,
                      { borderBottomWidth: "0px", borderTopWidth: 0 },
                    ]}
                  >
                    {formatNumber(tax)}
                  </Text>
                )
            )}
          </View>
          {/* Net Profit After Tax Calculation  */}
          <View style={[styles.tableRow, styles.totalRow]}>
            <Text
              style={[
                stylesCOP.serialNoCellDetail,
                styleExpenses.sno,
                styleExpenses.bordernone,
                {
                  // ✅ Ensure using the registered font
                  fontWeight: "bold", // ✅ Apply bold
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
                  // ✅ Ensure using the registered font
                  fontWeight: "bold", // ✅ Apply bold
                },
              ]}
            >
              Net Profit After Tax
            </Text>
            {/*  Display Precomputed Net Profit After Tax (NPAT) Values */}
            {netProfitAfterTax.map(
              (tax, yearIndex) =>
                (!hideFirstYear || yearIndex !== 0) && (
                  <Text
                    key={`netProfitAfterTax-${yearIndex}`}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      stylesCOP.boldText,
                      styleExpenses.fontSmall,
                      {
                        borderWidth: "1.2px",

                        fontWeight: "bold",
                        color: "#000",
                        borderLeftWidth: "0px",
                      },
                    ]}
                  >
                    {formatNumber(tax)}
                  </Text>
                )
            )}
          </View>
          {/* Withdrawals during the year  */}

          {Array.from({
            length: hideFirstYear ? projectionYears - 1 : projectionYears,
          }).every((_, index) => {
            const adjustedIndex = hideFirstYear ? index + 1 : index;
            return !Number(formData.MoreDetails?.Withdrawals?.[adjustedIndex]);
          }) ? null : (
            <View style={styles.tableRow}>
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
                ]}
              >
                Withdrawals during the year
              </Text>

              {Array.from({
                length: hideFirstYear ? projectionYears - 1 : projectionYears,
              }).map((_, index) => {
                const adjustedIndex = hideFirstYear ? index + 1 : index;
                const value =
                  formData.MoreDetails?.Withdrawals?.[adjustedIndex];
                return (
                  <Text
                    key={index}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                    ]}
                  >
                    {formatNumber(value || "-")}
                  </Text>
                );
              })}
            </View>
          )}

          {/* Balance Trf. To Balance Sheet */}
          <View style={[styles.tableRow, styles.totalRow]}>
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
              ]}
            >
              Balance Trf. To Balance Sheet
            </Text>

            {/* Display Precomputed Balance Transferred Values with Rounding */}
            {balanceTransferred.map((amount, yearIndex) => {
              if (hideFirstYear && yearIndex === 0) return null;
              const roundedValue = amount;

              return (
                <Text
                  key={`balanceTransferred-${yearIndex}`}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                  ]}
                >
                  {formatNumber(roundedValue)}
                </Text>
              );
            })}
          </View>
          {/* Cumulative Balance Trf. To Balance Sheet */}
          <View style={[styles.tableRow, styles.totalRow]}>
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
              ]}
            >
              Cumulative Balance Trf. To Balance Sheet
            </Text>

            {cumulativeBalanceTransferred.map((amount, yearIndex) => {
              if (hideFirstYear && yearIndex === 0) return null;
              // Convert negative values to 0 and round appropriately
              const adjustedAmount = Math.max(amount, 0);

              const roundedValue = adjustedAmount;

              return (
                <Text
                  key={`cumulativeBalance-${yearIndex}`}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                  ]}
                >
                  {formatNumber(roundedValue)}
                </Text>
              );
            })}
          </View>

          {/* ✅ Cash Profit (NPAT + Dep.) */}
          <View style={[styles.tableRow, styles.totalRow]}>
            <Text
              style={[
                stylesCOP.serialNoCellDetail,
                styleExpenses.sno,
                styleExpenses.bordernone,
                {
                  paddingVertical: "10px",
                },
              ]}
            ></Text>

            <Text
              style={[
                stylesCOP.detailsCellDetail,
                styleExpenses.particularWidth,
                styleExpenses.bordernone,
                { paddingVertical: "10px" },
              ]}
            >
              Cash Profit (NPAT + Dep.)
            </Text>

            {netProfitAfterTax.map((npat, yearIndex) => {
              if (hideFirstYear && yearIndex === 0) return null;
              const depreciation = totalDepreciationPerYear[yearIndex] || 0;

              // ✅ Correctly Compute Cash Profit
              const cashProfit = npat + depreciation;

              // ✅ Round values correctly
              const roundedValue = cashProfit;
              return (
                <Text
                  key={`cashProfit-${yearIndex}`}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                    { paddingVertical: "10px" },
                  ]}
                >
                  {formatNumber(roundedValue)}
                </Text>
              );
            })}
          </View>
        </View>
      </View>

      <view>
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
            proposed estimates issued by an approved valuer, details provided by
            the promoter, and rates prevailing in the market. Based on the
            examination of the evidence supporting the assumptions, nothing has
            come to attention that causes any belief that the assumptions do not
            provide a reasonable basis for the forecast. These financials do not
            vouch for the accuracy of the same, as actual results are likely to
            be different from the forecast since anticipated events might not
            occur as expected, and the variation might be material.
          </Text>
        ) : null}
      </view>

      {/* businees name and Client Name  */}
      {/* <View
        style={[
          {
            display: "flex",
            flexDirection: "column",
            gap: "30px",
            alignItems: "flex-end",
            justifyContent: "flex-end",
            marginTop: "60px",
          },
        ]}
      >
        <Text style={[styles.businessName, { fontSize: "14px" }]}>
          {formData?.AccountInformation?.businessName || "Business Name"}
        </Text>

        <Text style={[styles.FinancialYear, { fontSize: "10px" }]}>
          {formData?.AccountInformation?.businessOwner || "businessOwner"}
        </Text>
      </View> */}
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
              style={[styles.caName, { fontSize: "10px", fontWeight: "bold" }]}
            >
              CA {formData?.ProjectReportSetting?.CAName?.value}
            </Text>
          ) : null}

          {/* ✅ Membership Number (Conditional Display) */}
          {formData?.ProjectReportSetting?.MembershipNumber?.value ? (
            <Text style={[styles.membershipNumber, { fontSize: "10px" }]}>
              M. No.: {formData?.ProjectReportSetting?.MembershipNumber?.value}
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
    </Page>
  );
};

export default React.memo(ProjectedProfitability);
