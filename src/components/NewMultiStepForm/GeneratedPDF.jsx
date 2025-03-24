import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./View.css";
import { Document, PDFViewer, BlobProvider, Text } from "@react-pdf/renderer";
import useStore from "./useStore";
import axios from "axios";

// Register chart.js components
import BasicDetails from "./PDFComponents/BasicDetails";
import ProjectSynopsis from "./PDFComponents/ProjectSynopsis";
import MeansOfFinance from "./PDFComponents/MeansOfFinance";
import CostOfProject from "./PDFComponents/CostOfProject";
import ProjectedExpenses from "./PDFComponents/ProjectedExpenses";
import ProjectedRevenue from "./PDFComponents/ProjectedRevenue";
import ProjectedProfitability from "./PDFComponents/ProjectedProfitability";
import ProjectedSalaries from "./PDFComponents/ProjectedSalaries";
import ProjectedDepreciation from "./PDFComponents/ProjectedDepreciation";
import Repayment from "./PDFComponents/Repayment";
import IncomeTaxCalculation from "./PDFComponents/IncomeTaxCalculation";
import BreakEvenPoint from "./PDFComponents/BreakEvenPoint";
import DebtServiceCoverageRatio from "./PDFComponents/DebtServiceCoverageRatio";
import ProjectedCashflow from "./PDFComponents/ProjectedCashflow";
import ProjectedBalanceSheet from "./PDFComponents/ProjectedBalanceSheet";
import RatioAnalysis from "./PDFComponents/RatioAnalysis";
import CurrentRatio from "./PDFComponents/CurrentRatio";
import Assumptions from "./PDFComponents/Assumptions";
import PromoterDetails from "./PDFComponents/PromoterDetails";

import PdfWithChart from "./PDFComponents/PdfWithChart";
import PdfWithLineChart from "./PDFComponents/PdfWithLineChart";
import { generateChart } from "./charts/chart";



// Font.register({
//   family: "TimesNewRoman",
//   fonts: [
//     {
//       src: require("./Assets/Fonts/times-new-roman.ttf"),
//       fontWeight: "normal",
//     },
//     {
//       src: require("./Assets/Fonts/times-new-roman-bold.ttf"),
//       fontWeight: "bold",
//     },
//     {
//       src: require("./Assets/Fonts/times-new-roman-bold-italic.ttf"),
//       fontWeight: "bold",
//       fontStyle: "italic",
//     },
//   ],
// });



import PdfWithLineChart from "./PDFComponents/PdfWithLineChart";

// import {LineChart} from "./charts/LineChart";
import LineChart from "./charts/LineChart";
import PdfWithCurrentRatioChart from "./PDFComponents/PdfWithCurrentRatioChart";
import PdfWithCombinedCharts from "./PDFComponents/PdfWithCombinedCharts";

const GeneratedPDF = React.memo(({}) => {
  const [chartBase64, setChartBase64] = useState(null);
  const [lineChartBase64, setLineChartBase64] = useState(null); // ✅ Line chart state



  const [directExpenses, setDirectExpenses] = useState([]);
  const [totalDirectExpensesArray, setTotalDirectExpensesArray] = useState([]);

  const [computedData, setComputedData] = useState({
    netProfitBeforeTax: [],
    grossProfitValues: [],
    yearlyInterestLiabilities: [],
    cashProfitArray: [],
  });

  const [computedData1, setComputedData1] = useState({
    totalDepreciationPerYear: [],
  });

  const [totalDepreciation, setTotalDepreciation] = useState([]);
  const [yearlyInterestLiabilities, setYearlyInterestLiabilities] = useState(
    []
  );

  const [yearlyPrincipalRepayment, setYearlyPrincipalRepayment] = useState([]);

  const [interestOnWorkingCapital, setInterestOnWorkingCapital] = useState([]);

  const [receivedData, setReceivedData] = useState({});

  const [marchClosingBalances, setMarchClosingBalances] = useState([]);

  const [workingCapitalvalues, setWorkingCapitalValues] = useState({});

  const [grossFixedAssetsPerYear, setGrossFixedAssetsPerYear] = useState([]);

  const [incomeTaxCalculation, setIncomeTaxCalculation] = useState([]);

  const [closingCashBalanceArray, setClosingCashBalanceArray] = useState([]);

  const [totalLiabilities, setTotalLiabilities] = useState([]);

  const [assetsliabilities, setAssetsLiabilities] = useState([]);

  const [dscr, setDscr] = useState([]);

  const [currentRatio, setCurrentRatio] = useState([]);
  console.log("current ratio values", currentRatio);

  const [averageCurrentRatio, setAverageCurrentRatio] = useState([]);

  const [breakEvenPointPercentage, setBreakEvenPointPercentage] = useState([]);

  const [totalExpense, setTotalExpense] = useState([]);

  const [userRole, setUserRole] = useState("");

  const [pdfType, setPdfType] = useState("");

  const [years, setYears] = useState(5);

  const [totalRevenueReceipts, setTotalRevenueReceipts] = useState([]);

  const [isPDFLoading, setIsPDFLoading] = useState(true);

  const location = useLocation();
  const stableLocation = useMemo(() => location, []);

  const pdfData = location.state?.reportData; // ✅ Get report data from state

  const handleTotalExpenseUpdate = (expenses) => {
    console.log("✅ Total Expenses received in GeneratedPDF:", expenses);
    setTotalExpense(expenses); // ✅ Update state
  };

  useEffect(() => {
    // ✅ Fetch from localStorage when component mounts
    const storedPdfType = localStorage.getItem("pdfType");
    if (storedPdfType) {
      setPdfType(storedPdfType);
    }
  }, []);

  // ✅ Receiving data from Child A
  const handleTotalLiabilitiesArray = useCallback((data) => {
    //  console.log("Updated Total Liabilities from Child A:", data);
    setTotalLiabilities(data);
  });

  const handleIncomeTaxCalculation = useCallback((data) => {
    // console.log("Income Tax Calculation Received :", data);
    setIncomeTaxCalculation(data);
  });

  const workingCapitalHandler = useCallback((data) => {
    // console.log("Working Capital Values Received:", data);
    setWorkingCapitalValues(data);
  });

  // Update the state when data is received from the child
  const handleDataSend = useCallback((data) => {
    // console.log("Data received in parent: ", data);
    setReceivedData(data);
  });

  // ✅ Function to receive data from Repayment component
  const handleInterestCalculated = useCallback((liabilities) => {
    // console.log("📥 Received Interest Liabilities from Repayment:", liabilities);
    setYearlyInterestLiabilities(liabilities); // Update the state
  });

  // ✅ Handler for Principal Repayment Calculation
  const handlePrincipalRepaymentCalculated = useCallback(
    (calculatedRepayment) => {
      setYearlyPrincipalRepayment(calculatedRepayment);
    }
  );

  const getStoredData = () => {
    try {
      const savedData = localStorage.getItem("FourthStepPRS");
      return savedData ? JSON.parse(savedData) : {};
    } catch (error) {
      console.error("Error parsing localStorage data:", error);
      return {};
    }
  };

  const localDataRef = useRef(getStoredData());
  const localData = localDataRef.current;

  useEffect(() => {
    const fetchChart = async () => {
      try {
        console.log("🚀 Generating Chart...");
        const base64 = await generateChart();
        console.log("✅ Chart Base64:", base64);
        setChartBase64(base64);
      } catch (error) {
        console.error("❌ Failed to generate chart:", error);
      }
    };

    fetchChart(); // ✅ Generate on component mount
  }, []);

  useEffect(() => {
    const fetchChart = async () => {
      try {
        console.log("🚀 Generating Chart...");
        const base64 = await generateChart();
        console.log("✅ Chart Base64:", base64);
        setChartBase64(base64);
      } catch (error) {
        console.error("❌ Failed to generate chart:", error);
      }
    };

    fetchChart(); // ✅ Generate on component mount
  }, []);

  useEffect(() => {
    const fetchChart = async () => {
      try {
        console.log("🚀 Generating Chart...");
        const base64 = await LineChart();
        console.log("✅ Chart Base64:", base64);
        setLineChartBase64(base64);
      } catch (error) {
        console.error("❌ Failed to generate chart:", error);
      }
    };
    fetchChart();
  }, []);

  useEffect(() => {
    if (years >= 10) return; // ✅ Stop execution when years reach 10

    const interval = setInterval(() => {
      setYears((prev) => {
        if (prev >= 10) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [years]); // ✅ Runs only when necessary

  const [formData1, setFormData] = useState(() => {
    return JSON.parse(localStorage.getItem("formData")) || {};
  });

  console.log("formData1", formData1);

  const formData = pdfData || formData1;

  // console.log("formData", formData);

  const yearsRef = useRef(5);

  useEffect(() => {
    let interval;
    if (yearsRef < 10) {
      interval = setInterval(() => {
        setYears((prev) => (prev < 10 ? prev + 1 : prev));
      }, 5000);
    }

    return () => clearInterval(interval);
  }, [yearsRef]); // Only runs when `years` changes

  // Extract expenses safely
  const { Expenses = {} } = formData;
  const { normalExpense = [], directExpense = [] } = Expenses;

  // console.log("normal expenses", normalExpense)

  // Salary & wages calculations
  const totalQuantity = useMemo(
    () =>
      normalExpense.reduce(
        (sum, expense) => sum + Number(expense.quantity || 0),
        0
      ),
    [normalExpense]
  );

  // ✅ Compute Total Annual Wages
  const totalAnnualWages = useMemo(() => {
    if (!Array.isArray(normalExpense)) return 0; // Prevents errors
    return normalExpense.reduce(
      (sum, expense) =>
        sum + Number(expense.amount * expense.quantity * 12 || 0),
      0
    );
  }, [normalExpense]);

  // ✅ Compute Fringe Benefits at 5%
  const fringeCalculation = useMemo(
    () => totalAnnualWages * 0.05,
    [totalAnnualWages]
  );

  // ✅ Compute Total Wages including Fringe Benefits
  const fringAndAnnualCalculation = useMemo(
    () => totalAnnualWages + fringeCalculation,
    [totalAnnualWages]
  );

  // ✅ Compute Total Gross Fixed Assets for first year
  const firstYearGrossFixedAssets = useMemo(() => {
    return Object.values(formData?.CostOfProject || {}).reduce((sum, asset) => {
      let netAsset = asset.amount || 0;
      return sum + netAsset;
    }, 0);
  }, [formData.CostOfProject]);

  // Function to generate correct financial year labels
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

  // Example Usage
  const financialYear =
    parseInt(formData.ProjectReportSetting.FinancialYear) || 2025; // Use the provided year
  const projectionYears =
    parseInt(formData.ProjectReportSetting.ProjectionYears) || 20;

  const financialYearLabels = generateFinancialYearLabels(
    financialYear,
    projectionYears
  );

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

  useEffect(() => {
    console.log("🔄 GeneratedPDF is re-rendering");
  });

  //saving data to Local Storage

  useEffect(() => {
    const saveData = {
      normalExpense,
      totalAnnualWages,
      directExpenses,
      totalDirectExpensesArray,
      computedData,
      computedData1,
      totalDepreciation,
      yearlyInterestLiabilities,
      yearlyPrincipalRepayment,
      interestOnWorkingCapital,
      receivedData,
      marchClosingBalances,
      workingCapitalvalues,
      grossFixedAssetsPerYear,
      incomeTaxCalculation,
      closingCashBalanceArray,
      totalLiabilities,
      assetsliabilities,
      dscr,
      averageCurrentRatio,
      breakEvenPointPercentage,
      totalExpense,
      userRole,
      years,
      totalRevenueReceipts,
    };

    // console.log("Saving to localStorage:", saveData);
    localStorage.setItem("storedGeneratedPdfData", JSON.stringify(saveData));
  }, [
    normalExpense,
    totalAnnualWages,
    directExpenses,
    totalDirectExpensesArray,
    computedData,
    computedData1,
    totalDepreciation,
    yearlyInterestLiabilities,
    yearlyPrincipalRepayment,
    interestOnWorkingCapital,
    receivedData,
    marchClosingBalances,
    workingCapitalvalues,
    grossFixedAssetsPerYear,
    incomeTaxCalculation,
    closingCashBalanceArray,
    totalLiabilities,
    assetsliabilities,
    dscr,
    averageCurrentRatio,
    breakEvenPointPercentage,
    totalExpense,
    userRole,
    years,
    totalRevenueReceipts,
  ]);

  const setComputedDataToProfit = useStore(
    (state) => state.setComputedDataToProfit
  );
  const resetDataReady = useStore((state) => state.resetDataReady);
  const navigate = useNavigate();

  useEffect(() => {
    if (computedData) {
      setComputedDataToProfit(computedData); // ✅ Store computed data in Zustand
      // console.log("✅ Computed Data Stored in Zustand:", computedData);

      // ✅ If this was a silent trigger, navigate back to Check Profit
      if (location.state?.fromCheckProfit) {
        // console.log("🔄 Redirecting to Check Profit after computation...");
        navigate("/checkprofit");
      }
    }
    return () => resetDataReady(); // ✅ Reset flag when leaving the page
  }, [
    computedData,
    setComputedDataToProfit,
    resetDataReady,
    location,
    navigate,
  ]);

  // Example: Convert financial year to simple numeric labels
  const financialYearLabelsforChart = Array.from(
    { length: projectionYears },
    (_, i) => i + 1
  );

  const memoizedPDF = useMemo(() => {
    return (
      <Document>
        {/* basic details table */}
        {/* <BasicDetails formData={formData} /> */}
        <ProjectSynopsis
          formData={formData}
          receivedtotalRevenueReceipts={totalRevenueReceipts}
          localData={localData}
          normalExpense={normalExpense}
          totalAnnualWages={totalAnnualWages}
          totalQuantity={totalQuantity}
          fringAndAnnualCalculation={fringAndAnnualCalculation}
          fringeCalculation={fringeCalculation}
          receivedDscr={dscr}
          receivedAverageCurrentRatio={averageCurrentRatio}
          receivedBreakEvenPointPercentage={breakEvenPointPercentage}
          receivedAssetsLiabilities={assetsliabilities}
          pdfType={pdfType}
        />

        {/* Graphs  */}
        <PdfWithChart
          formData={formData}
          chartBase64={chartBase64}
          totalExpenses={totalExpense}
        />

        <PdfWithCombinedCharts
          labels={financialYearLabelsforChart || []}
          dscr={dscr?.DSCR || []}
          currentRatio={currentRatio?.currentRatio || []}
        />
        {/* Means of Finance Table */}
        <MeansOfFinance
          formData={formData}
          localData={localData}
          formatNumber={formatNumber}
          pdfType={pdfType}
        />
        {/* cost of project table */}
        <CostOfProject
          formData={formData}
          localData={localData}
          formatNumber={formatNumber}
        />
        {/* Projected Salaries & Wages Table*/}
        <ProjectedSalaries
          localData={localData}
          normalExpense={normalExpense}
          totalAnnualWages={totalAnnualWages}
          totalQuantity={totalQuantity}
          fringAndAnnualCalculation={fringAndAnnualCalculation}
          fringeCalculation={fringeCalculation}
          formatNumber={formatNumber}
          formData={formData}
        />
        <ProjectedDepreciation
          formData={formData}
          localData={localData}
          setTotalDepreciation={setTotalDepreciation}
          onComputedData1={setComputedData1}
          financialYearLabels={financialYearLabels}
          onGrossFixedAssetsPerYearCalculated={(data) => {
            setGrossFixedAssetsPerYear(data);
          }}
          formatNumber={formatNumber}
          receivedtotalRevenueReceipts={totalRevenueReceipts}
        />
        {/* Projected Expense Table Direct and Indirect */}
        <ProjectedExpenses
          formData={formData}
          yearlyInterestLiabilities={yearlyInterestLiabilities || []}
          totalDepreciationPerYear={totalDepreciation}
          fringAndAnnualCalculation={fringAndAnnualCalculation}
          fringeCalculation={fringeCalculation}
          interestOnWorkingCapital={interestOnWorkingCapital} // ✅ Pass Correctly
          financialYearLabels={financialYearLabels}
          directExpenses={directExpenses}
          projectionYears={projectionYears}
          totalDirectExpensesArray={totalDirectExpensesArray}
          onTotalExpenseSend={handleTotalExpenseUpdate}
          receivedtotalRevenueReceipts={totalRevenueReceipts}
          formatNumber={formatNumber}
        />
        {/* Projected Revenue/ Sales */}
        <ProjectedRevenue
          formData={formData}
          onTotalRevenueUpdate={setTotalRevenueReceipts}
          financialYearLabels={financialYearLabels}
          formatNumber={formatNumber}
          pdfType={pdfType}
        />
        {/* Projected Profitability Statement */}
        <ProjectedProfitability
          formData={formData}
          localData={localData}
          normalExpense={normalExpense}
          directExpense={directExpense}
          location={stableLocation}
          totalDepreciationPerYear={totalDepreciation}
          onComputedData={setComputedData} // ✅ Storing computed NPAT in `computedData`
          netProfitBeforeTax={computedData.netProfitBeforeTax || []}
          yearlyInterestLiabilities={yearlyInterestLiabilities || []}
          setInterestOnWorkingCapital={setInterestOnWorkingCapital} // ✅ Pass Setter Function
          totalRevenueReceipts={totalRevenueReceipts}
          fringAndAnnualCalculation={fringAndAnnualCalculation}
          financialYearLabels={financialYearLabels}
          handleDataSend={handleDataSend} // Ensure this is passed correctly
          handleIncomeTaxDataSend={handleIncomeTaxCalculation}
          formatNumber={formatNumber}
          receivedtotalRevenueReceipts={totalRevenueReceipts}
          onComputedDataToProfit={setComputedDataToProfit}
          pdfType={pdfType}
        />
        <Repayment
          formData={formData}
          localData={localData}
          onInterestCalculated={handleInterestCalculated}
          onPrincipalRepaymentCalculated={handlePrincipalRepaymentCalculated} // ✅ Passing to Repayment
          financialYearLabels={financialYearLabels}
          onMarchClosingBalanceCalculated={setMarchClosingBalances} // Callback to update state
          formatNumber={formatNumber}
          pdfType={pdfType}
        />
        {computedData.netProfitBeforeTax.length > 0 && (
          <IncomeTaxCalculation
            formData={formData}
            netProfitBeforeTax={computedData.netProfitBeforeTax}
            totalDepreciationPerYear={computedData1.totalDepreciationPerYear}
            financialYearLabels={financialYearLabels}
            formatNumber={formatNumber}
            pdfType={pdfType}
            receivedtotalRevenueReceipts={totalRevenueReceipts}
          />
        )}
        <ProjectedCashflow
          formData={formData}
          localData={localData}
          totalDepreciationPerYear={totalDepreciation}
          netProfitBeforeTax={computedData.netProfitBeforeTax || []}
          grossProfitValues={computedData.grossProfitValues || []}
          yearlyPrincipalRepayment={yearlyPrincipalRepayment}
          yearlyInterestLiabilities={yearlyInterestLiabilities || []}
          firstYearGrossFixedAssets={firstYearGrossFixedAssets}
          totalRevenueReceipts={totalRevenueReceipts}
          financialYearLabels={financialYearLabels}
          handleWorkingCapitalValuesTransfer={workingCapitalHandler} // <-- Add this
          incomeTaxCalculation={incomeTaxCalculation}
          onClosingCashBalanceCalculated={setClosingCashBalanceArray}
          formatNumber={formatNumber}
          pdfType={pdfType}
        />
        <ProjectedBalanceSheet
          formData={formData}
          localData={localData}
          totalDepreciationPerYear={totalDepreciation}
          netProfitBeforeTax={computedData.netProfitBeforeTax || []}
          grossProfitValues={computedData.grossProfitValues || []}
          yearlyPrincipalRepayment={yearlyPrincipalRepayment}
          yearlyInterestLiabilities={yearlyInterestLiabilities || []}
          interestOnWorkingCapital={interestOnWorkingCapital} // ✅ Pass Correctly
          firstYearGrossFixedAssets={firstYearGrossFixedAssets}
          grossFixedAssetsPerYear={grossFixedAssetsPerYear}
          onGrossFixedAssetsPerYearCalculated={setGrossFixedAssetsPerYear}
          totalRevenueReceipts={totalRevenueReceipts}
          financialYearLabels={financialYearLabels}
          receivedCummulativeTansferedData={receivedData} // Passing the parent's state as a new prop
          receivedMarchClosingBalances={marchClosingBalances} // The computed March balances
          receivedWorkingCapitalValues={workingCapitalvalues}
          closingCashBalanceArray={closingCashBalanceArray}
          onTotalLiabilitiesSend={handleTotalLiabilitiesArray}
          formatNumber={formatNumber}
          pdfType={pdfType}
        />
        <CurrentRatio
          formData={formData}
          financialYearLabels={financialYearLabels}
          receivedAssetsLiabilities={assetsliabilities}
          formatNumber={formatNumber}
          sendAverageCurrentRation={setAverageCurrentRatio}
          pdfType={pdfType}
          receivedtotalRevenueReceipts={totalRevenueReceipts}
          sendCurrentRatio={setCurrentRatio}
        />
        <BreakEvenPoint
          formData={formData}
          yearlyInterestLiabilities={yearlyInterestLiabilities || []}
          totalDepreciationPerYear={totalDepreciation}
          totalRevenueReceipts={totalRevenueReceipts}
          fringAndAnnualCalculation={fringAndAnnualCalculation}
          financialYearLabels={financialYearLabels}
          formatNumber={formatNumber}
          sendBreakEvenPointPercentage={setBreakEvenPointPercentage}
          receivedtotalRevenueReceipts={totalRevenueReceipts}
          pdfType={pdfType}
        />
        <DebtServiceCoverageRatio
          formData={formData}
          yearlyInterestLiabilities={yearlyInterestLiabilities || []}
          yearlyPrincipalRepayment={yearlyPrincipalRepayment || []} // ✅ Passing Principal Repayment to DSCR
          totalDepreciationPerYear={totalDepreciation}
          netProfitAfterTax={computedData.netProfitAfterTax || []} // ✅ Passing NPAT to DebtServiceCoverageRatio
          financialYearLabels={financialYearLabels}
          DSCRSend={setDscr}
          formatNumber={formatNumber}
          pdfType={pdfType}
          receivedtotalRevenueReceipts={totalRevenueReceipts}
        />
        <RatioAnalysis
          formData={formData}
          localData={localData}
          totalDepreciationPerYear={totalDepreciation}
          yearlyPrincipalRepayment={yearlyPrincipalRepayment}
          yearlyInterestLiabilities={yearlyInterestLiabilities || []}
          interestOnWorkingCapital={interestOnWorkingCapital} // ✅ Pass Correctly
          totalRevenueReceipts={totalRevenueReceipts}
          financialYearLabels={financialYearLabels}
          receivedCummulativeTansferedData={receivedData} // Passing the parent's state as a new prop
          receivedMarchClosingBalances={marchClosingBalances} // The computed March balances
          receivedWorkingCapitalValues={workingCapitalvalues}
          closingCashBalanceArray={closingCashBalanceArray}
          receivedTotalLiabilities={totalLiabilities}
          cashProfitArray={computedData.cashProfitArray}
          grossProfitValues={computedData.grossProfitValues}
          netProfitBeforeTax={computedData.netProfitBeforeTax}
          netProfitAfterTax={computedData.netProfitAfterTax}
          receivedDscr={dscr}
          onAssetsLiabilitiesSend={setAssetsLiabilities}
          formatNumber={formatNumber}
          pdfType={pdfType}
          receivedtotalRevenueReceipts={totalRevenueReceipts}
        />
        <Assumptions
          formData={formData}
          financialYearLabels={financialYearLabels}
          formatNumber={formatNumber}
          totalRevenueReceipts={totalRevenueReceipts}
          receiveTotalExpense={totalExpense}
          pdfType={pdfType}
          receivedtotalRevenueReceipts={totalRevenueReceipts}
        />
        <PromoterDetails
          formData={formData}
          pdfType={pdfType}
          formatNumber={formatNumber}
        />

       
      </Document>
    );
  }, [
    formData,
    totalRevenueReceipts,
    localData,
    normalExpense,
    totalAnnualWages,
    totalQuantity,
    fringAndAnnualCalculation,
    fringeCalculation,
    dscr,
    averageCurrentRatio,
    breakEvenPointPercentage,
    assetsliabilities,
    lineChartBase64,
  ]);

  // for filling the form data silently

  useEffect(() => {
    const reportData = location.state?.reportData;
    const sessionId = location.state?.sessionId;

    if (reportData && sessionId) {
      console.log("📥 Received Data from Report:", reportData);

      // // ✅ Simulate form population
      // populateForm(reportData);
    }
  }, [location.state]);

  useEffect(() => {
    // ✅ Remove the default download button using CSS
    const style = document.createElement("style");
    style.innerHTML = `
    button[aria-label="Download"] {
      display: none !important;
    }
  `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {/* ✅ Loader Section */}
      {isPDFLoading && (
        <div className="flex items-center justify-center">
          <svg
            className="animate-spin h-12 w-12 text-indigo-600"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v2.5A5.5 5.5 0 005.5 12H4z"
            />
          </svg>
          <span className="ml-2 text-gray-500 font-medium">Loading PDF...</span>
        </div>
      )}

      <BlobProvider document={memoizedPDF}>
        {({ blob, url, loading }) => {
          if (!loading) {
            // ✅ Update state when PDF is fully loaded
            setTimeout(() => setIsPDFLoading(false), 5000);
          }
          return !isPDFLoading ? (
            <>
              <PDFViewer
                width="100%"
                height="800"
                style={{ overflow: "hidden" }}
                showToolbar={userRole !== "client" && userRole !== "employee"}
              >
                {memoizedPDF}
              </PDFViewer>

              {/* ✅ Custom Download Button */}
              <section className="h-[100vh]"></section>
            </>
          ) : null;
        }}
      </BlobProvider>
    </div>
  );
});

export default GeneratedPDF;
