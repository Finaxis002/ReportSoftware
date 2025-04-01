import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./View.css";
import {
  Document,
  PDFViewer,
  BlobProvider,
  Text,
  pdf,
} from "@react-pdf/renderer";
import useStore from "./useStore";
import axios from "axios";
import { saveAs } from "file-saver"; // install this via `npm i file-saver`
import { FiDownload } from "react-icons/fi"; // npm i react-icons

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

import PdfAllChartsWrapper from "./PDFComponents/PdfAllChartsWrapper";
import { FiIconName } from 'react-icons/fi';


const GeneratedPDF = ({}) => {
  const userRole = localStorage.getItem("userRole");
  const userName =
    localStorage.getItem("adminName") || localStorage.getItem("employeeName");

  // console.log("userRole:", userRole, "userName:", userName);

  const [permissions, setPermissions] = useState({
    createReport: false,
    updateReport: false,
    createNewWithExisting: false,
    downloadPDF: false,
    exportData: false, // ✅ Add this
  });

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
  // console.log("current ratio values", currentRatio);

  const [averageCurrentRatio, setAverageCurrentRatio] = useState([]);

  const [breakEvenPointPercentage, setBreakEvenPointPercentage] = useState([]);

  const [totalExpense, setTotalExpense] = useState([]);

  // const [userRole, setUserRole] = useState("");

  const [pdfType, setPdfType] = useState("");

  const [years, setYears] = useState(5);

  const [totalRevenueReceipts, setTotalRevenueReceipts] = useState([]);

  const [isPDFLoading, setIsPDFLoading] = useState(true);

  const [isPdfReadyToDownload, setIsPdfReadyToDownload] = useState(false);

  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(null);

  //for otp

  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);

  const [blobUrl, setBlobUrl] = useState(null);
  const [blobObject, setBlobObject] = useState(null);

  const location = useLocation();
  const stableLocation = useMemo(() => location, []);

  const pdfData = location.state?.reportData; // ✅ Get report data from state

  const handleTotalExpenseUpdate = (expenses) => {
    // console.log("✅ Total Expenses received in GeneratedPDF:", expenses);
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
        // console.log("🚀 Generating Chart...");
        // const base64 = await generateChart();
        // console.log("✅ Chart Base64:", base64);
        // setChartBase64(base64);
      } catch (error) {
        console.error("❌ Failed to generate chart:", error);
      }
    };

    fetchChart(); // ✅ Generate on component mount
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
    });

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

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const [empRes, adminRes] = await Promise.all([
          fetch("https://backend-three-pink.vercel.app/api/employees"),
          fetch("https://backend-three-pink.vercel.app/api/admins"),
        ]);

        if (!empRes.ok || !adminRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const employeeList = await empRes.json();
        const adminList = await adminRes.json();

        const normalizedUserName = userName?.trim().toLowerCase();

        if (userRole === "admin") {
          const storedAdminName = localStorage.getItem("adminName");

          if (!storedAdminName) {
            setPermissions({
              generateReport: true,
              updateReport: true,
              createNewWithExisting: true,
              downloadPDF: true,
              exportData: true,
              createReport: true,
            });
            return;
          }

          const admin = adminList.find(
            (a) =>
              a.username?.trim().toLowerCase() === normalizedUserName ||
              a.adminId?.trim().toLowerCase() === normalizedUserName
          );

          if (admin?.permissions) setPermissions(admin.permissions);
        }

        if (userRole === "employee") {
          const employee = employeeList.find(
            (emp) =>
              emp.name?.trim().toLowerCase() === normalizedUserName ||
              emp.email?.trim().toLowerCase() === normalizedUserName ||
              emp.employeeId?.trim().toLowerCase() === normalizedUserName
          );

          if (employee?.permissions) setPermissions(employee.permissions);
        }
      } catch (err) {
        console.error("Error fetching permissions:", err.message);
      }
    };

    // 🔁 Initial fetch
    fetchPermissions();

    // 🔁 Poll every 15 seconds
    const interval = setInterval(fetchPermissions, 100);

    return () => clearInterval(interval); // Cleanup
  }, [userRole, userName]);

  useEffect(() => {
    if (
      dscr.length > 0 &&
      currentRatio.currentRatio?.length > 0 &&
      formData?.AccountInformation?.businessName &&
      formData?.AccountInformation?.businessOwner
    ) {
      setIsPdfReadyToDownload(true);
    }
  }, [dscr, currentRatio, formData]);

  const memoizedPDF = useMemo(() => {
    return (
      <Document
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        onRender={() => {
          console.log("✅ PDF fully rendered");
          setIsPDFLoading(false); // Turn off loader reliably
        }}
      >
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
          pageNumber={pageNumber}
        />

        <PdfAllChartsWrapper
          formData={formData}
          totalExpenses={totalExpense}
          labels={financialYearLabelsforChart}
          dscr={dscr?.DSCR || []}
          currentRatio={currentRatio?.currentRatio || []}
          pageNumber={pageNumber}
        />

        <PromoterDetails
          formData={formData}
          pdfType={pdfType}
          formatNumber={formatNumber}
          pageNumber={pageNumber}
        />

        {/* Means of Finance Table */}
        <MeansOfFinance
          formData={formData}
          localData={localData}
          formatNumber={formatNumber}
          pdfType={pdfType}
          pageNumber={pageNumber}
        />
        {/* cost of project table */}
        <CostOfProject
          formData={formData}
          localData={localData}
          formatNumber={formatNumber}
          pageNumber={pageNumber}
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
          pageNumber={pageNumber}
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
          pageNumber={pageNumber}
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
          pageNumber={pageNumber}
        />
        {/* Projected Revenue/ Sales */}
        <ProjectedRevenue
          formData={formData}
          onTotalRevenueUpdate={setTotalRevenueReceipts}
          financialYearLabels={financialYearLabels}
          formatNumber={formatNumber}
          pdfType={pdfType}
          pageNumber={pageNumber}
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
          pageNumber={pageNumber}
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
          pageNumber={pageNumber}
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
            pageNumber={pageNumber}
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
          pageNumber={pageNumber}
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
          pageNumber={pageNumber}
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
          pageNumber={pageNumber}
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
          pageNumber={pageNumber}
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
          pageNumber={pageNumber}
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
          pageNumber={pageNumber}
        />
        <Assumptions
          formData={formData}
          financialYearLabels={financialYearLabels}
          formatNumber={formatNumber}
          totalRevenueReceipts={totalRevenueReceipts}
          receiveTotalExpense={totalExpense}
          pdfType={pdfType}
          receivedtotalRevenueReceipts={totalRevenueReceipts}
          pageNumber={pageNumber}
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

  const triggerPdfDownload = () => {
    if (!blobUrl || !blobObject) {
      alert("PDF not ready yet. Please wait...");
      return;
    }

    const businessName = formData?.AccountInformation?.businessName || "Report";
    const businessOwner =
      formData?.AccountInformation?.businessOwner || "Owner";
    const safeName = `${businessName} (${businessOwner})`
      .replace(/[/\\?%*:|"<>]/g, "-")
      .trim();

    saveAs(blobObject, `${safeName}.pdf`);
  };

  // for filling the form data silently

  useEffect(() => {
    const reportData = location.state?.reportData;
    const sessionId = location.state?.sessionId;

    if (reportData && sessionId) {
      // console.log("📥 Received Data from Report:", reportData);
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
  {(blobProps) => {
    // Immediately assign values
    if (blobProps.blob && blobProps.url && !blobObject && !blobUrl) {
      setBlobObject(blobProps.blob);
      setBlobUrl(blobProps.url);
    }

    const { loading } = blobProps;


          // Check if the blob is ready
          const handleDownloadPDF = async () => {
            if (userRole === "employee") {
              const employeeName =
                localStorage.getItem("employeeName") || "Unknown";
              try {
                const res = await fetch(
                  "http://localhost:5000/api/send-otp-download",
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ employeeName }),
                  }
                );

                if (res.ok) {
                  setShowOTPModal(true);
                  setIsOtpSent(true);
                } else {
                  alert("Failed to send OTP to admin.");
                }
              } catch (err) {
                console.error("OTP send error:", err);
              }
            } else {
              triggerPdfDownload(); // For admin or client
            }
          };

          const handleVerifyOtpForDownload = async () => {
            try {
              const res = await fetch(
                "http://localhost:5000/api/verify-otp-download",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ otp: otpInput }),
                }
              );

              const result = await res.json();
              if (res.ok) {
                setShowOTPModal(false);
                setIsOtpVerified(true);
                setOtpInput(""); // Clear OTP input
                setTimeout(() => triggerPdfDownload(), 100); // Now works
              } else {
                alert("❌ Invalid or expired OTP.");
              }
            } catch (err) {
              console.error("OTP verify error:", err);
              alert("OTP verification failed.");
            }
          };

          return (
            <>
              {/* Toolbar */}
              {((userRole === "admin" &&
                (!localStorage.getItem("adminName") ||
                  permissions.downloadPDF)) ||
                (userRole === "employee" && permissions.downloadPDF)) && (
                <div className="w-full bg-gradient-to-r from-blue-900 to-blue-950 p-2 shadow-md flex justify-between items-center">
                  {/* Title */}
                  <div className="text-white font-normal text-sm px-4 tracking-wide">
                    📄 PDF Report Viewer
                  </div>

                  {/* Page Counter */}
                  {numPages && (
                    <div className="text-white text-xs">
                      Page {pageNumber} / {numPages}
                    </div>
                  )}

                  {/* Download Button */}
                  <div className="flex gap-2 px-4">
                    <button
                      onClick={handleDownloadPDF}
                      className={`flex items-center gap-2 ${
                        loading
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-white hover:bg-indigo-100"
                      } text-indigo-600 font-medium py-1 px-3 rounded-md text-sm transition-all duration-300`}
                      disabled={loading}
                    >
                      <FiDownload size={16} />
                      Download PDF
                    </button>
                  </div>
                </div>
              )}

              <PDFViewer
                width="100%"
                height="800"
                showToolbar={false}
                style={{ overflow: "hidden" }}
              >
                {memoizedPDF}
              </PDFViewer>

              {showOTPModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-40 flex justify-center items-center z-50">
                  <div className="bg-white p-6 rounded-xl w-full max-w-md">
                    <h2 className="text-xl font-semibold mb-4 text-center">
                      Admin OTP Verification
                    </h2>
                    <p className="text-sm text-gray-600 text-center mb-4">
                      An OTP has been sent to the admin's email to approve your
                      download.
                    </p>
                    <input
                      type="text"
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      className="w-full border p-2 rounded mb-4"
                      placeholder="Enter OTP received by admin"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        className="px-4 py-2 bg-gray-300 rounded"
                        onClick={() => setShowOTPModal(false)}
                      >
                        Cancel
                      </button>
                      <button
                        className="px-4 py-2 bg-green-600 text-white rounded"
                        onClick={handleVerifyOtpForDownload}
                      >
                        Verify & Download
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          );
        }}
      </BlobProvider>
    </div>
  );
};

export default GeneratedPDF;
