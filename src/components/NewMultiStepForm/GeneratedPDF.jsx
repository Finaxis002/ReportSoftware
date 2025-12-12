import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import Swal from "sweetalert2";

import { useLocation, useNavigate } from "react-router-dom";
import "./View.css";
import "../generatedPdf.css";
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
import { FiDownload, FiShare2 } from "react-icons/fi"; // npm i react-icons


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
// import GeneratedSections from "./PDFComponents/GeneratedSections";
// import WordIntro from "./PDFComponents/WordIntroduction";


const GeneratedPDF = () => {
  const BASE_URL = process.env.REACT_APP_BASE_URL || 'https://reportsbe.sharda.co.in';
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

  //share demo pdf
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [surplusDuringYear, setSurplusDuringYear] = useState("");
  //for otp

  const location = useLocation();

  const pdfContainerRef = useRef(null);

  const stableLocation = useMemo(() => location, []);

  const pdfData = location.state?.reportData; // ✅ Get report data from state

  const handleTotalExpenseUpdate = (expenses) => {
    // console.log("✅ Total Expenses received in GeneratedPDF:", expenses);
    setTotalExpense(expenses); // ✅ Update state
  };

  // Fetch consultant data if on consultant PDF route
  useEffect(() => {
    if (location.pathname === "/consultant-report-pdf") {
      const fetchConsultantData = async () => {
        try {
          const sessionId = localStorage.getItem("activeSessionId");
          if (sessionId) {
            const response = await axios.get(`${BASE_URL}/api/consultant-reports/get-consultant-report?sessionId=${sessionId}`);
            if (response.data.success && response.data.data) {
              setFormData(response.data.data);
            }
          }
        } catch (error) {
          console.error("Error fetching consultant data:", error);
        }
      };
      fetchConsultantData();
    }
  }, [location.pathname]);

  // window.addEventListener('keydown', e => console.log(e.key));

  useEffect(() => {
    // ✅ Fetch from localStorage when component mounts
    const storedPdfType = localStorage.getItem("pdfType");
    if (storedPdfType) {
      setPdfType(storedPdfType);
    }
  }, []);

  useEffect(() => {
    // Poll for the iframe created by @react-pdf/renderer
    const pollIframe = setInterval(() => {
      const iframe = pdfContainerRef.current?.querySelector("iframe");
      if (iframe && iframe.contentWindow && iframe.contentWindow.document) {
        // Prevent right-click inside PDF
        iframe.contentWindow.document.addEventListener("contextmenu", (e) => {
          e.preventDefault();
          // Optional: show a message
          // alert("Right-click is disabled on this PDF.");
        });
        clearInterval(pollIframe);
      }
    }, 300);

    return () => clearInterval(pollIframe);
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
    setReceivedData(data);
  });

  // ✅ Function to receive data from Repayment component
  const handleInterestCalculated = useCallback((liabilities) => {
    setYearlyInterestLiabilities(liabilities); // Update the state
  });

  // ✅ Handler for Principal Repayment Calculation
  const handlePrincipalRepaymentCalculated = useCallback(
    (calculatedRepayment) => {
      setYearlyPrincipalRepayment(calculatedRepayment);
    }
  );
  // console.log("interest On Working Capital", interestOnWorkingCapital);
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

  // console.log("formData1", formData1);

  const formData = pdfData || formData1;

  const [orientation, setOrientation] = useState(() => {
    const stored = JSON.parse(localStorage.getItem("formData"));
    const years = formData?.ProjectReportSetting?.ProjectionYears || 5;
    return years > 6 ? "landscape" : "portrait";
  });

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
      (sum, expense) => sum + Number(expense?.value),
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
  const parseAmount = (val) => {
    if (!val) return 0;
    const cleaned = typeof val === "string" ? val.replace(/,/g, "") : val;
    return parseFloat(cleaned) || 0;
  };

  // const firstYearGrossFixedAssets = useMemo(() => {
  //   return Object.values(formData?.CostOfProject || {}).reduce((sum, asset) => {
  //     if (asset?.isSelected) return sum; // ✅ Skip selected assets
  //     const netAsset = parseAmount(asset.amount);
  //     return sum + netAsset;
  //   }, 0);
  // }, [formData?.CostOfProject]);
  const firstYearGrossFixedAssets = useMemo(() => {
    return Object.values(formData?.CostOfProject || {}).reduce((sum, asset) => {
      if (asset?.isSelected || asset?.isPreliminary) return sum;
      const netAsset = parseAmount(asset.amount);
      return sum + netAsset;
    }, 0);
  }, [formData?.CostOfProject]);

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

  // useEffect(() => {
  //   console.log("🔄 GeneratedPDF is re-rendering");
  // });

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
      surplusDuringYear,
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
    surplusDuringYear,
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
          fetch(`${BASE_URL}/api/employees`),
          fetch(`${BASE_URL}/api/admins`),
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

    fetchPermissions(); // 🔁 Fetch once on mount or when userRole/userName changes
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

  //disable print button

  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    const handleKeyDown = (e) => {
      // Ctrl+P or Command+P
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
        e.preventDefault();
        alert("Printing is disabled for this document.");
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const overlayRef = useRef(null);

  useEffect(() => {
    const overlay = overlayRef.current;

    const handleWheel = (e) => {
      const iframe = document.querySelector("iframe");
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.scrollBy(0, e.deltaY);
      }
    };

    if (overlay) {
      overlay.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      if (overlay) {
        overlay.removeEventListener("wheel", handleWheel);
      }
    };
  }, []);

  const handlePDFRender = async () => {
    // ✅ Aggregated computed data
    const aggregatedComputedData = aggregateComputedData();

    // ✅ API call to save computed data
    try {
      await axios.put(
        `${BASE_URL}/save-computed-data/${formData._id}`,
        { computedData: aggregatedComputedData }
      );
      console.log("✅ Computed data saved successfully.");
    } catch (error) {
      console.error("❌ Failed to save computed data:", error);
    }

    // ✅ Send activity log
    try {
      const sessionId =
        localStorage.getItem("activeSessionId") || formData?.sessionId || "";

      let reportId = null;

      if (sessionId) {
        const res = await fetch(
          `${BASE_URL}/api/activity/get-report-id?sessionId=${sessionId}`
        );
        const data = await res.json();
        if (data?.reportId) {
          reportId = data.reportId;
        }
      }

      console.log("✅ Logged PDF render activity");
    } catch (error) {
      console.warn("❌ Failed to log render activity:", error);
    }
  };



  

  const debtEquityOption =
    formData?.ProjectReportSetting?.DebtEquityOption ||
    formData?.ProjectReportSetting?.debtEquityOption;

  const interestRate = formData?.ProjectReportSetting?.interestOnTL;

  const renderIOTLLabel = () => {
    if (debtEquityOption === "Equity") {
      return `Dividend Payout @${interestRate}%`; // Format for equity case
    } else {
      return "Interest On Term Loan"; // Default case
    }
  };

  const renderIOWCLabel = () => {
    if (debtEquityOption === "Equity") {
      return "Return On Operational Equity";
    } else {
      return "Interest On Working Capital";
    }
  };

  const renderTLFBLabel = () => {
    if (debtEquityOption === "Equity") {
      return `Equity Capital Infusion`; // Format for equity case
    } else {
      return "Term Loan From Bank"; // Default case
    }
  };

  const renderWCLFBLabel = () => {
    if (debtEquityOption === "Equity") {
      return "Equity Of Running Operations";
    } else {
      return "Loan From Bank";
    }
  };

  const renderBankTLLabel = () => {
    if (debtEquityOption === "Equity") {
      return `Equity Capital Infusion`; // Format for equity case
    } else {
      return "Bank Term Loan"; // Default case
    }
  };

  const renderBankLoanTermLoanLabel = () => {
    if (debtEquityOption === "Equity") {
      return `Equity Capital Infusion`; // Format for equity case
    } else {
      return "Bank Loan - Term Loan"; // Default case
    }
  };

  const renderWCLLabel = () => {
    if (debtEquityOption === "Equity") {
      return "Equity Of Running Operations";
    } else {
      return "Working Capital Loan";
    }
  };

  const renderTotalBankLoanLabel = () => {
    if (debtEquityOption === "Equity") {
      return "Total Equity Capital Infusion";
    } else {
      return "Total Bank Loan";
    }
  };

  const renderRepaymentSheetheading = () => {
    if (debtEquityOption === "Equity") {
      return "Dividend Payout On Equity";
    } else {
      return "Repayment of Term Loan";
    }
  };

  const renderWithdrawalLabel = () => {
    if (debtEquityOption === "Equity") {
      return "Return On Equity";
    } else {
      return "Withdrawals";
    }
  };

  console.log("totalExpense in generated pdf", totalExpense);
  console.log("formData in generated pdf", formData);

  const memoizedPDF = useMemo(() => {
    return (
      <Document
        onRender={() => {
          console.log("✅ PDF fully rendered");
          setIsPDFLoading(false);
          handlePDFRender(); // Save data after the PDF has been rendered
        }}
        onContextMenu={(e) => e.preventDefault()}
        className="pdf-container"
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
          renderTotalBankLoanLabel={renderTotalBankLoanLabel}
          onRender={() => {
            console.log("✅ProjectSynopsis rendered");
            setIsPDFLoading(false);
          }}
        />

        {/* <WordIntro
          generatedPDF={formData.generatedPDF}
          startPageNumber={1}
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
          renderTotalBankLoanLabel={renderTotalBankLoanLabel}
          onRender={() => {
            console.log("✅ProjectSynopsis rendered");
            setIsPDFLoading(false);
          }}
        /> */}

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
          renderTLFBLabel={renderTLFBLabel}
          renderWCLFBLabel={renderWCLFBLabel}
          renderTotalBankLoanLabel={renderTotalBankLoanLabel}
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
          orientation={orientation}
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
          orientation={orientation}
          renderIOTLLabel={renderIOTLLabel}
          renderIOWCLabel={renderIOWCLabel}
        />
        {/* Projected Revenue/ Sales */}
        <ProjectedRevenue
          formData={formData}
          onTotalRevenueUpdate={setTotalRevenueReceipts}
          financialYearLabels={financialYearLabels}
          formatNumber={formatNumber}
          pdfType={pdfType}
          pageNumber={pageNumber}
          orientation={orientation}
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
          orientation={orientation}
          renderIOTLLabel={renderIOTLLabel}
          renderIOWCLabel={renderIOWCLabel}
          renderWithdrawalLabel={renderWithdrawalLabel}
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
          renderRepaymentSheetheading={renderRepaymentSheetheading}
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
            orientation={orientation}
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
          orientation={orientation}
          receivedtotalRevenueReceipts={totalRevenueReceipts}
          surplusDuringYear={surplusDuringYear}
          renderIOTLLabel={renderIOTLLabel}
          renderIOWCLabel={renderIOWCLabel}
          renderWCLLabel={renderWCLFBLabel}
          renderBankTLLabel={renderBankTLLabel}
          renderWithdrawalLabel={renderWithdrawalLabel}
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
          orientation={orientation}
          receivedtotalRevenueReceipts={totalRevenueReceipts}
          renderBankLoanTermLoanLabel={renderBankLoanTermLoanLabel}
          renderWCLLabel={renderWCLLabel}
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
          orientation={orientation}
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
          orientation={orientation}
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
          orientation={orientation}
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
          orientation={orientation}
          renderIOTLLabel={renderIOTLLabel}
          renderIOWCLabel={renderIOWCLabel}
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
          orientation={orientation}
          renderTLFBLabel={renderTLFBLabel}
          renderWCLFBLabel={renderWCLFBLabel}
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

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    const handleUnload = () => {
      localStorage.removeItem("selectedColor");
    };

    window.addEventListener("beforeunload", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);

  const selectedColor = localStorage.getItem("selectedColor");

  console.log("selected color : " ,selectedColor)

  const aggregateComputedData = () => ({
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
    totalRevenueReceipts,
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen generatedpdf">
      {/* ✅ Loader Section */}

      <BlobProvider document={memoizedPDF}>
        {({ blob, url, loading }) => {
          // ✅ Save to ref or state

          const handleDownloadPDF = async () => {
            if (!blob) {
              alert("PDF is not ready yet.");
              return;
            }

            const businessName =
              formData?.AccountInformation?.businessName || "Report";
            const businessOwner =
              formData?.AccountInformation?.businessOwner || "Owner";

            const safeName = `${businessName} (${businessOwner})`
              .replace(/[/\\?%*:|"<>]/g, "-")
              .trim();

            // ✅ Save the file locally
            saveAs(blob, `${safeName}.pdf`);

            // ✅ Aggregated computed data
            const aggregatedComputedData = aggregateComputedData();

            // ✅ API call to save computed data
            try {
              await axios.put(
                `${BASE_URL}/save-computed-data/${formData._id}`,
                { computedData: aggregatedComputedData }
              );

              // console.log("✅ Computed data saved successfully.");
            } catch (error) {
              console.error("❌ Failed to save computed data:", error);
            }

            // ✅ Send activity log
            try {
              const sessionId =
                localStorage.getItem("activeSessionId") ||
                formData?.sessionId ||
                "";

              let reportId = null;

              if (sessionId) {
                const res = await fetch(
                  `${BASE_URL}/api/activity/get-report-id?sessionId=${sessionId}`
                );
                const data = await res.json();
                if (data?.reportId) {
                  reportId = data.reportId;
                }
              }

              await fetch(`${BASE_URL}/api/activity/log`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  action: "download",
                  reportTitle: businessName,
                  reportOwner: businessOwner,
                  reportId,
                  performedBy: {
                    name:
                      localStorage.getItem("adminName") ||
                      localStorage.getItem("employeeName") ||
                      "Unknown",
                    role: localStorage.getItem("userRole") || "unknown",
                  },
                }),
              });

              // console.log("✅ Logged PDF download");
            } catch (error) {
              console.warn("❌ Failed to log download activity:", error);
            }
          };

          return (
            <>
              <div ref={pdfContainerRef} className="w-full">
                {/* Toolbar */}
                <div className="w-full bg-[#161616] p-3 py-1 shadow-lg flex flex-wrap justify-between items-center gap-3">
                  <div className="text-white font-medium text-sm px-3 py-2 tracking-wide flex items-center bg-white/10 backdrop-blur-sm rounded-lg shadow-md">
                    <i className="fas fa-file-pdf mr-2 text-red-400"></i>
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-100 to-blue-300">
                      PDF Report Viewer
                    </span>
                  </div>

                  <div className="flex gap-1 bg-white/10 backdrop-blur-sm rounded-lg p-1 shadow-md">
                    <button
                      onClick={() => {
                        setOrientation("portrait");
                      }}
                      className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg transition-all duration-200 ease-out hover:scale-105 hover:shadow-button portrait-btn ${orientation === "portrait"
                          ? "bg-indigo-600 text-white"
                          : "bg-white text-indigo-600"
                        }`}
                    >
                      <i className="fas fa-portrait text-sm"></i>
                      <span>Portrait</span>
                    </button>
                    <button
                      onClick={() => {
                        setOrientation("landscape");
                      }}
                      className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg transition-all duration-200 ease-out hover:scale-105 hover:shadow-button landscape-btn ${orientation === "landscape"
                          ? "bg-indigo-600 text-white"
                          : "bg-white text-indigo-600"
                        }`}
                    >
                      <i className="fas fa-landscape text-sm"></i>
                      <span>Landscape</span>
                    </button>
                    <button
                      onClick={() => setOrientation("advanced-landscape")}
                      className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg transition-all duration-200 ease-out hover:scale-105 hover:shadow-button advanced-landscape-btn ${orientation === "advanced-landscape"
                          ? "bg-indigo-600 text-white"
                          : "bg-white text-indigo-600"
                        }`}
                    >
                      <i className="fas fa-expand-alt text-sm"></i>
                      <span>Advanced-Landscape</span>
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleDownloadPDF}
                      className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-all duration-300 hover:scale-105 hover:shadow-button shadow-md"
                    >
                      <i className="fas fa-download"></i>
                      <span>Download PDF</span>
                    </button>
                  </div>
                </div>

                {isPDFLoading && (
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      zIndex: 10,
                      justifyContent: "center",
                      alignItems: "center",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div>
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
                    </div>
                    <span className="ml-2 text-gray-500 font-medium">
                      Loading PDF...
                    </span>
                  </div>
                )}

                <div
                  style={{
                    position: "relative",
                    width: "100%",
                  }}
                >
                  <div style={{ height: "100vh", width: "100%" }}>
                    <PDFViewer
                      width="100%"
                      height="100%"
                      style={{
                        height: "100%",
                        width: "100%",
                        overflow: "auto",
                      }}
                      showToolbar={false}
                      key={orientation}
                    >
                      {memoizedPDF}
                    </PDFViewer>
                  </div>

                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: "98%",
                      height: "100%",
                      zIndex: 10,
                      backgroundColor: "transparent",
                      overflow: "hidden", // Hide any overflow from the overlay
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault(); // Disable right-click on the overlay
                      Swal.fire({
                        icon: "error",
                        title: "Right-click Disabled",
                        text: "Right-click is disabled on this PDF for security reasons.",
                        confirmButtonColor: "#6366f1", // Indigo-500, optional
                        background: "#fff", // optional, matches most UIs
                        timer: 1600,
                        showConfirmButton: false,
                      });
                    }}
                    onWheel={(e) => {
                      const pdfIframe = document.querySelector("iframe"); // Select the iframe inside the PDFViewer
                      if (pdfIframe) {
                        pdfIframe.contentWindow.scrollBy(0, e.deltaY); // Scroll the content of the iframe by deltaY amount
                      }
                    }}
                    onTouchMove={(e) => {
                      // Ensure scrolling works for touch devices as well
                      const pdfIframe = document.querySelector("iframe");
                      if (pdfIframe) {
                        pdfIframe.contentWindow.scrollBy(
                          0,
                          e.touches[0].clientY
                        );
                      }
                    }}
                  ></div>

                  {/* <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: "98%",
                      height: "100%",
                      zIndex: 10,
                      backgroundColor: "transparent",
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      Swal.fire({
                        icon: "error",
                        title: "Right-click Disabled",
                        text: "Right-click is disabled on this PDF for security reasons.",
                        confirmButtonColor: "#6366f1", // Indigo-500, optional
                        background: "#fff", // optional, matches most UIs
                        timer: 1600,
                        showConfirmButton: false,
                      });
                    }}
                    onWheel={(e) => {
                      const pdfIframe = document.querySelector("iframe");
                      if (pdfIframe) {
                        pdfIframe.contentWindow.scrollBy(0, e.deltaY);
                      }
                    }}
                  /> */}
                </div>
              </div>
            </>
          );
        }}
      </BlobProvider>
    </div>
  );
};

export default GeneratedPDF;
