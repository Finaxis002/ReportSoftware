import {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import Swal from "sweetalert2";

import { useLocation, useNavigate } from "react-router-dom";
import "../View.css";
import "../../generatedPdf.css";
import {
  Document,
  PDFViewer,
  BlobProvider,
} from "@react-pdf/renderer";
import useStore from "../useStore";
import axios from "axios";
import { saveAs } from "file-saver"; // install this via `npm i file-saver`

import ConsultantVariableIndex from "./ConsultantPdfComponents/ConsultantVariableIndex";
import ConsultantProjectedProfitability from "./ConsultantPdfComponents/ConsultantProjectedProfitability";
import ConsultantDSCR from "./ConsultantPdfComponents/ConsultantDSCR";
import ConsultantCashflow from "./ConsultantPdfComponents/ConsultantCashflow";
import ConsultantBalanceSheet from "./ConsultantPdfComponents/ConsultantBalanceSheet";
import ConsultantCurrentRatio from "./ConsultantPdfComponents/ConsultantCurrentRatio";
import PdfAllChartsWrapper from "../PDFComponents/PdfAllChartsWrapper";
import WordConclusion from "./ConsultantPdfComponents/WordPages/WordConclusion";
import VersionBasedSections from "./ConsultantPdfComponents/WordPages/VersionBasedSections";
import ProjectCoverPage from "../PDFComponents/Project_Report_Cover";
import ConsultantProjectSynopsis from "./ConsultantPdfComponents/ConsultantProjectSynopsis";
import ConsultantPromoterDetails from "./ConsultantPdfComponents/ConsultantPromoterDetails";
import ConsultantCostOfProject from "./ConsultantPdfComponents/ConsultantCostOfProject";
import ConsultantMeansOfFinance from "./ConsultantPdfComponents/ConsultantMeansOfFinance";
import ConsultantProjectedRevenue from "./ConsultantPdfComponents/ConsultantProjectedRevenue";
import ConsultantProjectedSalaries from "./ConsultantPdfComponents/ConsultantProjectedSalaries";
import ConsultantProjectedDepreciation from "./ConsultantPdfComponents/ConsultantProjectedDepreciation";
import ConsultantProjectedExpenses from "./ConsultantPdfComponents/ConsultantProjectedExpenses";
import ConsultantRepayment from "./ConsultantPdfComponents/ConsultantRepayment";
import ConsultantIncomeTaxCalculation from "./ConsultantPdfComponents/ConsultantIncomeTaxCalculation";
import ConsultantRatioAnalysis from "./ConsultantPdfComponents/ConsultantRatioAnalysis";
import ConsultantBreakEvenPoint from "./ConsultantPdfComponents/ConsultantBreakEvenPoint";
import ConsultantAssumptions from "./ConsultantPdfComponents/ConsultantAssumptions";

const ConsultantGeneratedPDF = () => {
  const BASE_URL = process.env.REACT_APP_BASE_URL || 'https://reportsbe.sharda.co.in';
  const location = useLocation();

  const pdfData = location.state?.reportData; // ✅ Get report data from state

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

  console.log("pdf type ::::::::", pdfType)

  const [years, setYears] = useState(5);

  const [totalRevenueReceipts, setTotalRevenueReceipts] = useState([]);

  const [isPDFLoading, setIsPDFLoading] = useState(true);

  const [isPdfReadyToDownload, setIsPdfReadyToDownload] = useState(false);

  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(null);

  //share demo pdf

  const [shareLink, setShareLink] = useState("");
  const [surplusDuringYear, setSurplusDuringYear] = useState("");


  const [hasPreSavedData, setHasPreSavedData] = useState(false);

  const [consultantReportVersion, setConsultantReportVersion] = useState("Version 5");

  const [isVersionChanging, setIsVersionChanging] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(
    localStorage.getItem("selectedConsultantReportVersion") || "Version 5"
  );

  const [loadingProgress, setLoadingProgress] = useState({
    step: 0,
    totalSteps: 4,
    message: 'Initializing...'
  });

  useEffect(() => {
    localStorage.setItem("selectedConsultantReportVersion", "Version 5");
  }, []);

  const pdfContainerRef = useRef(null);
  const stableLocation = useMemo(() => location, []);

  const handleTotalExpenseUpdate = (expenses) => {
    // console.log("✅ Total Expenses received in GeneratedPDF:", expenses);
    setTotalExpense(expenses); // ✅ Update state
  };

  // window.addEventListener('keydown', e => console.log(e.key));


  // Add this function before your useEffect hooks
  const handleVersionChange = useCallback(async (newVersion) => {
    setIsVersionChanging(true);

    // Progress tracking
    const updateProgress = (step, message) => {
      setLoadingProgress(prev => ({ ...prev, step, message }));
    };

    try {
      updateProgress(1, 'Updating version settings...');
      setSelectedVersion(newVersion);
      setConsultantReportVersion(newVersion);
      localStorage.setItem("selectedConsultantReportVersion", newVersion);

      updateProgress(2, 'Loading report Pages...');
      await new Promise(resolve => setTimeout(resolve, 200));

      updateProgress(3, 'Preparing PDF layout...');
      await new Promise(resolve => setTimeout(resolve, 200));

      updateProgress(4, 'Finalizing...');
      await new Promise(resolve => setTimeout(resolve, 200));

    } finally {
      setIsVersionChanging(false);
      setLoadingProgress({ step: 0, totalSteps: 4, message: '' });
    }
  }, []);



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

  const consultantComputedData = formData?.computedData || {};


  const storedVersion = localStorage.getItem("selectedConsultantReportVersion");
  const versionNum = parseInt(consultantReportVersion.replace("Version ", "")) || 1;

  console.log("Stored Version :: ", storedVersion)
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



  // ✅ Function to save consultant computed data
  const saveConsultantComputedData = async () => {
    if (!formData?._id) {
      console.warn("⚠️ No formData._id found, skipping save");
      return null;
    }

    try {
      console.log("💾 Saving consultant computed data for report:", {
        reportId: formData._id,
        version: storedVersion,
        versionNum
      });

      // ✅ Aggregate all computed data
      const aggregatedComputedData = {
        // Core financial data
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
        surplusDuringYear,

        // Version info
        version: storedVersion || formData?.version,
        versionNum,
        processedAt: new Date().toISOString(),

        // Financial metrics
        financialYear,
        projectionYears,
        financialYearLabels,

        // Business info
        businessName: formData?.AccountInformation?.businessName,
        businessOwner: formData?.AccountInformation?.businessOwner,

        // User info
        savedBy: userName,
        userRole,
      };

      // ✅ API call to save consultant computed data
      const response = await axios.put(
        `${BASE_URL}/api/consultant-reports/save-consultant-computed-data/${formData._id}`,
        { computedData: aggregatedComputedData }
      );

      console.log("✅ Consultant computed data saved successfully");
      return response.data;
    } catch (error) {
      console.error("❌ Failed to save consultant computed data:", error.message);
      return null;
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
    console.log("🔄 PDF rendering started for consultant report");

    // ✅ Save computed data
    await saveConsultantComputedData();

    // ✅ Log activity
    try {
      await axios.post(`${BASE_URL}/api/activity/log`, {
        action: "pdf_render",
        reportId: formData?._id,
        reportTitle: formData?.AccountInformation?.businessName,
        version: storedVersion,
        performedBy: userName,
        role: userRole,
        timestamp: new Date().toISOString()
      });
      console.log("✅ PDF render activity logged");
    } catch (error) {
      console.warn("⚠️ Failed to log render activity:", error);
    }
  };

  // Add this useEffect to save data as soon as we have the required data
  useEffect(() => {
    const saveDataBeforeRender = async () => {
      // Only save once and when we have the required data
      if (!hasPreSavedData && formData?._id && totalRevenueReceipts?.length > 0) {
        console.log("📥 Pre-saving computed data before PDF generation...");

        try {
          await saveConsultantComputedData();
          setHasPreSavedData(true);
          console.log("✅ Data pre-saved successfully");
        } catch (error) {
          console.log("⚠️ Pre-save failed, will save during render");
        }
      }
    };

    saveDataBeforeRender();
  }, [formData, totalRevenueReceipts, hasPreSavedData]);


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


  console.log("Form Data in PDF:", formData);

  // const memoizedPDF = useMemo(() => {
  //   return (
  //      <Document
  //       onRender={() => {
  //         console.log("✅ PDF fully rendered");
  //         setIsPDFLoading(false);
  //         handlePDFRender(); // Save data after the PDF has been rendered
  //          if (!hasPreSavedData) {
  //         handlePDFRender();
  //       } else {
  //         console.log("✅ Data was already saved before render");
  //       }

  //       }}
  //       onContextMenu={(e) => e.preventDefault()}
  //       className="pdf-container"
  //     >

  //         <ProjectCoverPage formData={formData} />
  //       {/* Index Page */}

  //         <ConsultantVariableIndex
  //           formData={formData}
  //           directExpense={directExpense}
  //           formatNumber={formatNumber}
  //           receivedtotalRevenueReceipts={totalRevenueReceipts}
  //           pdfType={pdfType}
  //           orientation={orientation}
  //           selectedVersion={consultantReportVersion}
  //         />

  //       {/* basic details table */}
  //       {/* <BasicDetails formData={formData} /> */}

  //         <ConsultantProjectSynopsis
  //           formData={formData}
  //           receivedtotalRevenueReceipts={totalRevenueReceipts}
  //           localData={localData}
  //           normalExpense={normalExpense}
  //           totalAnnualWages={totalAnnualWages}
  //           totalQuantity={totalQuantity}
  //           fringAndAnnualCalculation={fringAndAnnualCalculation}
  //           fringeCalculation={fringeCalculation}
  //           receivedDscr={dscr}
  //           receivedAverageCurrentRatio={averageCurrentRatio}
  //           receivedBreakEvenPointPercentage={breakEvenPointPercentage}
  //           receivedAssetsLiabilities={assetsliabilities}
  //           pdfType={pdfType}
  //           pageNumber={pageNumber}
  //           renderTotalBankLoanLabel={renderTotalBankLoanLabel}
  //           onRender={() => {
  //             console.log("✅ProjectSynopsis rendered");
  //             setIsPDFLoading(false);
  //           }}
  //         />



  //         <ConsultantPromoterDetails
  //           formData={formData}
  //           pdfType={pdfType}
  //           formatNumber={formatNumber}
  //           pageNumber={pageNumber}
  //         />




  //         <VersionBasedSections
  //           formData={formData}
  //           selectedVersion={consultantReportVersion}
  //           startPageNumber={2} // Start after Project Synopsis
  //         />



  //         <PdfAllChartsWrapper
  //           formData={formData}
  //           totalExpenses={totalExpense}
  //           labels={financialYearLabelsforChart}
  //           dscr={dscr?.DSCR || []}
  //           currentRatio={currentRatio?.currentRatio || []}
  //           pageNumber={pageNumber}
  //         />



  //       {/* cost of project table */}

  //         <ConsultantCostOfProject
  //           formData={formData}
  //           localData={localData}
  //           formatNumber={formatNumber}
  //           pageNumber={pageNumber}
  //         />



  //       {/* Means of Finance Table */}

  //         <ConsultantMeansOfFinance
  //           formData={formData}
  //           localData={localData}
  //           formatNumber={formatNumber}
  //           pdfType={pdfType}
  //           pageNumber={pageNumber}
  //           renderTLFBLabel={renderTLFBLabel}
  //           renderWCLFBLabel={renderWCLFBLabel}
  //           renderTotalBankLoanLabel={renderTotalBankLoanLabel}
  //         />



  //       {/* Projected Revenue/ Sales */}

  //         <ConsultantProjectedRevenue
  //           formData={formData}
  //           onTotalRevenueUpdate={setTotalRevenueReceipts}
  //           financialYearLabels={financialYearLabels}
  //           formatNumber={formatNumber}
  //           pdfType={pdfType}
  //           pageNumber={pageNumber}
  //           orientation={orientation}
  //         />

  //       {/* Projected Salaries & Wages Table*/}

  //         <ConsultantProjectedSalaries
  //           localData={localData}
  //           normalExpense={normalExpense}
  //           totalAnnualWages={totalAnnualWages}
  //           totalQuantity={totalQuantity}
  //           fringAndAnnualCalculation={fringAndAnnualCalculation}
  //           fringeCalculation={fringeCalculation}
  //           formatNumber={formatNumber}
  //           formData={formData}
  //           pageNumber={pageNumber}
  //         />


  //         <ConsultantProjectedDepreciation
  //           formData={formData}
  //           localData={localData}
  //           setTotalDepreciation={setTotalDepreciation}
  //           onComputedData1={setComputedData1}
  //           financialYearLabels={financialYearLabels}
  //           onGrossFixedAssetsPerYearCalculated={(data) => {
  //             setGrossFixedAssetsPerYear(data);
  //           }}
  //           formatNumber={formatNumber}
  //           receivedtotalRevenueReceipts={totalRevenueReceipts}
  //           pageNumber={pageNumber}
  //           orientation={orientation}
  //         />

  //       {/* Projected Expense Table Direct and Indirect */}

  //         <ConsultantProjectedExpenses
  //           formData={formData}
  //           yearlyInterestLiabilities={yearlyInterestLiabilities || []}
  //           totalDepreciationPerYear={totalDepreciation}
  //           fringAndAnnualCalculation={fringAndAnnualCalculation}
  //           fringeCalculation={fringeCalculation}
  //           interestOnWorkingCapital={interestOnWorkingCapital} // ✅ Pass Correctly
  //           financialYearLabels={financialYearLabels}
  //           directExpenses={directExpenses}
  //           projectionYears={projectionYears}
  //           totalDirectExpensesArray={totalDirectExpensesArray}
  //           onTotalExpenseSend={handleTotalExpenseUpdate}
  //           receivedtotalRevenueReceipts={totalRevenueReceipts}
  //           formatNumber={formatNumber}
  //           pageNumber={pageNumber}
  //           orientation={orientation}
  //           renderIOTLLabel={renderIOTLLabel}
  //           renderIOWCLabel={renderIOWCLabel}
  //         />


  //        <ConsultantRepayment
  //         versionNum={versionNum}
  //         formData={formData}
  //         localData={localData}
  //         onInterestCalculated={handleInterestCalculated}
  //         onPrincipalRepaymentCalculated={handlePrincipalRepaymentCalculated} // ✅ Passing to Repayment
  //         financialYearLabels={financialYearLabels}
  //         onMarchClosingBalanceCalculated={setMarchClosingBalances} // Callback to update state
  //         formatNumber={formatNumber}
  //         pdfType={pdfType}
  //         pageNumber={pageNumber}
  //         renderRepaymentSheetheading={renderRepaymentSheetheading}
  //       />

  //       {/* Projected Profitability Statement */}
  //       <ConsultantProjectedProfitability
  //         versionNum={versionNum}
  //         formData={formData}
  //         localData={localData}
  //         normalExpense={normalExpense}
  //         directExpense={directExpense}
  //         location={stableLocation}
  //         totalDepreciationPerYear={totalDepreciation}
  //         onComputedData={setComputedData} // ✅ Storing computed NPAT in `computedData`
  //         netProfitBeforeTax={computedData.netProfitBeforeTax || []}
  //         yearlyInterestLiabilities={yearlyInterestLiabilities || []}
  //         setInterestOnWorkingCapital={setInterestOnWorkingCapital} // ✅ Pass Setter Function
  //         totalRevenueReceipts={totalRevenueReceipts}
  //         fringAndAnnualCalculation={fringAndAnnualCalculation}
  //         financialYearLabels={financialYearLabels}
  //         handleDataSend={handleDataSend} // Ensure this is passed correctly
  //         handleIncomeTaxDataSend={handleIncomeTaxCalculation}
  //         formatNumber={formatNumber}
  //         receivedtotalRevenueReceipts={totalRevenueReceipts}
  //         onComputedDataToProfit={setComputedDataToProfit}
  //         pdfType={pdfType}
  //         pageNumber={pageNumber}
  //         orientation={orientation}
  //         renderIOTLLabel={renderIOTLLabel}
  //         renderIOWCLabel={renderIOWCLabel}
  //         renderWithdrawalLabel={renderWithdrawalLabel}
  //       />

  //       <ConsultantIncomeTaxCalculation
  //         versionNum={versionNum}
  //         formData={formData}
  //         netProfitBeforeTax={computedData.netProfitBeforeTax}
  //         totalDepreciationPerYear={computedData1.totalDepreciationPerYear}
  //         financialYearLabels={financialYearLabels}
  //         formatNumber={formatNumber}
  //         pdfType={pdfType}
  //         receivedtotalRevenueReceipts={totalRevenueReceipts}
  //         pageNumber={pageNumber}
  //         orientation={orientation}
  //       />

  //       {versionNum >= 1 && (
  //         <ConsultantCashflow
  //           formData={formData}
  //           localData={localData}
  //           totalDepreciationPerYear={totalDepreciation}
  //           netProfitBeforeTax={computedData.netProfitBeforeTax || []}
  //           grossProfitValues={computedData.grossProfitValues || []}
  //           yearlyPrincipalRepayment={yearlyPrincipalRepayment}
  //           yearlyInterestLiabilities={yearlyInterestLiabilities || []}
  //           firstYearGrossFixedAssets={firstYearGrossFixedAssets}
  //           totalRevenueReceipts={totalRevenueReceipts}
  //           financialYearLabels={financialYearLabels}
  //           handleWorkingCapitalValuesTransfer={workingCapitalHandler} // <-- Add this
  //           incomeTaxCalculation={incomeTaxCalculation}
  //           onClosingCashBalanceCalculated={setClosingCashBalanceArray}
  //           formatNumber={formatNumber}
  //           pdfType={pdfType}
  //           pageNumber={pageNumber}
  //           orientation={orientation}
  //           receivedtotalRevenueReceipts={totalRevenueReceipts}
  //           surplusDuringYear={surplusDuringYear}
  //           renderIOTLLabel={renderIOTLLabel}
  //           renderIOWCLabel={renderIOWCLabel}
  //           renderWCLLabel={renderWCLFBLabel}
  //           renderBankTLLabel={renderBankTLLabel}
  //           renderWithdrawalLabel={renderWithdrawalLabel}
  //         />
  //       )}

  //         <ConsultantBalanceSheet
  //           formData={formData}
  //           localData={localData}
  //           totalDepreciationPerYear={totalDepreciation}
  //           netProfitBeforeTax={computedData.netProfitBeforeTax || []}
  //           grossProfitValues={computedData.grossProfitValues || []}
  //           yearlyPrincipalRepayment={yearlyPrincipalRepayment}
  //           yearlyInterestLiabilities={yearlyInterestLiabilities || []}
  //           interestOnWorkingCapital={interestOnWorkingCapital} // ✅ Pass Correctly
  //           firstYearGrossFixedAssets={firstYearGrossFixedAssets}
  //           grossFixedAssetsPerYear={grossFixedAssetsPerYear}
  //           onGrossFixedAssetsPerYearCalculated={setGrossFixedAssetsPerYear}
  //           totalRevenueReceipts={totalRevenueReceipts}
  //           financialYearLabels={financialYearLabels}
  //           receivedCummulativeTansferedData={receivedData} // Passing the parent's state as a new prop
  //           receivedMarchClosingBalances={marchClosingBalances} // The computed March balances
  //           receivedWorkingCapitalValues={workingCapitalvalues}
  //           closingCashBalanceArray={closingCashBalanceArray}
  //           onTotalLiabilitiesSend={handleTotalLiabilitiesArray}
  //           formatNumber={formatNumber}
  //           pdfType={pdfType}
  //           pageNumber={pageNumber}
  //           orientation={orientation}
  //           receivedtotalRevenueReceipts={totalRevenueReceipts}
  //           renderBankLoanTermLoanLabel={renderBankLoanTermLoanLabel}
  //           renderWCLLabel={renderWCLLabel}
  //         />


  //         <ConsultantDSCR
  //           formData={formData}
  //           yearlyInterestLiabilities={yearlyInterestLiabilities || []}
  //           yearlyPrincipalRepayment={yearlyPrincipalRepayment || []} // ✅ Passing Principal Repayment to DSCR
  //           totalDepreciationPerYear={totalDepreciation}
  //           netProfitAfterTax={computedData.netProfitAfterTax || []} // ✅ Passing NPAT to DebtServiceCoverageRatio
  //           financialYearLabels={financialYearLabels}
  //           DSCRSend={setDscr}
  //           formatNumber={formatNumber}
  //           pdfType={pdfType}
  //           receivedtotalRevenueReceipts={totalRevenueReceipts}
  //           pageNumber={pageNumber}
  //           orientation={orientation}
  //         />


  //         <ConsultantCurrentRatio
  //           formData={formData}
  //           financialYearLabels={financialYearLabels}
  //           receivedAssetsLiabilities={assetsliabilities}
  //           formatNumber={formatNumber}
  //           sendAverageCurrentRation={setAverageCurrentRatio}
  //           pdfType={pdfType}
  //           receivedtotalRevenueReceipts={totalRevenueReceipts}
  //           sendCurrentRatio={setCurrentRatio}
  //           pageNumber={pageNumber}
  //           orientation={orientation}
  //         />




  //         <ConsultantRatioAnalysis
  //           formData={formData}
  //           localData={localData}
  //           totalDepreciationPerYear={totalDepreciation}
  //           yearlyPrincipalRepayment={yearlyPrincipalRepayment}
  //           yearlyInterestLiabilities={yearlyInterestLiabilities || []}
  //           interestOnWorkingCapital={interestOnWorkingCapital} // ✅ Pass Correctly
  //           totalRevenueReceipts={totalRevenueReceipts}
  //           financialYearLabels={financialYearLabels}
  //           receivedCummulativeTansferedData={receivedData} // Passing the parent's state as a new prop
  //           receivedMarchClosingBalances={marchClosingBalances} // The computed March balances
  //           receivedWorkingCapitalValues={workingCapitalvalues}
  //           closingCashBalanceArray={closingCashBalanceArray}
  //           receivedTotalLiabilities={totalLiabilities}
  //           cashProfitArray={computedData.cashProfitArray}
  //           grossProfitValues={computedData.grossProfitValues}
  //           netProfitBeforeTax={computedData.netProfitBeforeTax}
  //           netProfitAfterTax={computedData.netProfitAfterTax}
  //           receivedDscr={dscr}
  //           onAssetsLiabilitiesSend={setAssetsLiabilities}
  //           formatNumber={formatNumber}
  //           pdfType={pdfType}
  //           receivedtotalRevenueReceipts={totalRevenueReceipts}
  //           pageNumber={pageNumber}
  //           orientation={orientation}
  //         />

  //         <ConsultantBreakEvenPoint
  //           formData={formData}
  //           yearlyInterestLiabilities={yearlyInterestLiabilities || []}
  //           totalDepreciationPerYear={totalDepreciation}
  //           totalRevenueReceipts={totalRevenueReceipts}
  //           fringAndAnnualCalculation={fringAndAnnualCalculation}
  //           financialYearLabels={financialYearLabels}
  //           formatNumber={formatNumber}
  //           sendBreakEvenPointPercentage={setBreakEvenPointPercentage}
  //           receivedtotalRevenueReceipts={totalRevenueReceipts}
  //           pdfType={pdfType}
  //           pageNumber={pageNumber}
  //           orientation={orientation}
  //           renderIOTLLabel={renderIOTLLabel}
  //           renderIOWCLabel={renderIOWCLabel}
  //         />


  //         <ConsultantAssumptions
  //           formData={formData}
  //           financialYearLabels={financialYearLabels}
  //           formatNumber={formatNumber}
  //           totalRevenueReceipts={totalRevenueReceipts}
  //           receiveTotalExpense={totalExpense}
  //           pdfType={pdfType}
  //           receivedtotalRevenueReceipts={totalRevenueReceipts}
  //           pageNumber={pageNumber}
  //           orientation={orientation}
  //           renderTLFBLabel={renderTLFBLabel}
  //           renderWCLFBLabel={renderWCLFBLabel}
  //         />


  //         <WordConclusion
  //           formData={formData}
  //           selectedVersion={consultantReportVersion}
  //           startPageNumber={2} // Start after Project Synopsis
  //         />

  //       {/* {versionNum >= 1 && (
  //         <WordConclusion />
  //       )} */}
  //     </Document>
  //   );
  // }, [
  //   formData,
  //   totalRevenueReceipts,
  //   localData,
  //   normalExpense,
  //   totalAnnualWages,
  //   totalQuantity,
  //   fringAndAnnualCalculation,
  //   fringeCalculation,
  //   dscr,
  //   averageCurrentRatio,
  //   breakEvenPointPercentage,
  //   assetsliabilities,
  //   lineChartBase64,
  //   versionNum,
  //   consultantReportVersion,
  //    hasPreSavedData,
  // ]);

  // for filling the form data silently




  const memoizedPDF = useMemo(() => {
    return (
      <Document
        onRender={() => {
          console.log("✅ PDF fully rendered");
          setIsPDFLoading(false);
          handlePDFRender(); // Save data after the PDF has been rendered
          if (!hasPreSavedData) {
            handlePDFRender();
          } else {
            console.log("✅ Data was already saved before render");
          }

        }}
        onContextMenu={(e) => e.preventDefault()}
        className="pdf-container"
      >
        {versionNum >= 1 && (<ProjectCoverPage formData={formData} />)}
        {/* Index Page */}
        {versionNum >= 1 && (
          <ConsultantVariableIndex
            formData={formData}
            directExpense={directExpense}
            formatNumber={formatNumber}
            receivedtotalRevenueReceipts={totalRevenueReceipts}
            pdfType={pdfType}
            orientation={orientation}
            selectedVersion={storedVersion}
          />
        )}
        {/* basic details table */}
        {/* <BasicDetails formData={formData} /> */}
        {versionNum >= 1 && (
          <ConsultantProjectSynopsis
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
        )}

        {versionNum >= 1 && (
          <ConsultantPromoterDetails
            formData={formData}
            pdfType={pdfType}
            formatNumber={formatNumber}
            pageNumber={pageNumber}
          />
        )}


        {versionNum >= 1 && (
          <VersionBasedSections
            formData={formData}
            selectedVersion={storedVersion}
            startPageNumber={2} // Start after Project Synopsis
          />
        )}

        {versionNum >= 3 && (
          <PdfAllChartsWrapper
            formData={formData}
            totalExpenses={totalExpense}
            labels={financialYearLabelsforChart}
            dscr={dscr?.DSCR || []}
            currentRatio={currentRatio?.currentRatio || []}
            pageNumber={pageNumber}
          />
        )}


        {/* cost of project table */}
        {versionNum >= 1 && (
          <ConsultantCostOfProject
            formData={formData}
            localData={localData}
            formatNumber={formatNumber}
            pageNumber={pageNumber}
          />
        )}


        {/* Means of Finance Table */}
        {versionNum >= 1 && (
          <ConsultantMeansOfFinance
            formData={formData}
            localData={localData}
            formatNumber={formatNumber}
            pdfType={pdfType}
            pageNumber={pageNumber}
            renderTLFBLabel={renderTLFBLabel}
            renderWCLFBLabel={renderWCLFBLabel}
            renderTotalBankLoanLabel={renderTotalBankLoanLabel}
          />
        )}


        {/* Projected Revenue/ Sales */}
        {versionNum >= 3 && (
          <ConsultantProjectedRevenue
            formData={formData}
            onTotalRevenueUpdate={setTotalRevenueReceipts}
            financialYearLabels={financialYearLabels}
            formatNumber={formatNumber}
            pdfType={pdfType}
            pageNumber={pageNumber}
            orientation={orientation}
          />
        )}
        {/* Projected Salaries & Wages Table*/}
        {versionNum >= 5 && (
          <ConsultantProjectedSalaries
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
        )}
        {versionNum >= 4 && (
          <ConsultantProjectedDepreciation
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
        )}
        {/* Projected Expense Table Direct and Indirect */}
        {versionNum >= 5 && (
          <ConsultantProjectedExpenses
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
        )}

        <ConsultantRepayment
          versionNum={versionNum}
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

        {/* Projected Profitability Statement */}
        <ConsultantProjectedProfitability
          versionNum={versionNum}
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
        {versionNum >= 5 && (
          <ConsultantIncomeTaxCalculation
            versionNum={versionNum}
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
        {versionNum >= 1 && (
          <ConsultantCashflow
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
        )}
        {versionNum >= 1 && (
          <ConsultantBalanceSheet
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
        )}
        {versionNum >= 1 && (
          <ConsultantDSCR
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
        )}
        {versionNum >= 1 && (
          <ConsultantCurrentRatio
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
        )}


        {versionNum >= 5 && (
          <ConsultantRatioAnalysis
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
        )}
        {versionNum >= 3 && (
          <ConsultantBreakEvenPoint
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
        )}
        {versionNum >= 1 && (
          <ConsultantAssumptions
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
        )}
        {versionNum >= 1 && (
          <WordConclusion
            formData={formData}
            selectedVersion={storedVersion}
            startPageNumber={2} // Start after Project Synopsis
          />
        )}
        {/* {versionNum >= 1 && (
          <WordConclusion />
        )} */}
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
    versionNum,
    storedVersion,
    hasPreSavedData,
    selectedVersion, // Add this
    isVersionChanging, // Add this
  ]);


  useEffect(() => {
    const reportData = location.state?.reportData;
    const sessionId = location.state?.sessionId;

    if (reportData && sessionId) {
      // console.log("📥 Received Data from Report:", reportData);
      // // ✅ Simulate form population
      // populateForm(reportData);
      // Save fetched version to localStorage
      localStorage.setItem("selectedConsultantReportVersion", "Version 5");
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

  // console.log("selected color : " ,selectedColor)

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
                `${BASE_URL}/api/consultant-reports/save-consultant-computed-data/${formData._id}`,
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
              <div ref={pdfContainerRef} className="w-full bg-black">
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
                    <div className="relative flex-1">
                      <select
                        name="consultantReportVersion"
                        value={selectedVersion}
                        onChange={(e) => handleVersionChange(e.target.value)}
                        disabled={isVersionChanging}
                        className={`appearance-none w-full bg-white text-indigo-600 px-4 py-2.5 pr-10 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm cursor-pointer transition-all duration-200 hover:border-indigo-400 shadow-sm ${isVersionChanging ? 'opacity-70 cursor-not-allowed' : ''
                          }`}
                      >
                        <option value="Version 1">Version 1</option>
                        <option value="Version 2">Version 2</option>
                        <option value="Version 3">Version 3</option>
                        <option value="Version 4">Version 4</option>
                        <option value="Version 5">Version 5</option>
                      </select>

                      {isVersionChanging && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleDownloadPDF}
                      className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-all duration-300 hover:scale-105 hover:shadow-lg shadow-md"
                    >
                      <i className="fas fa-download"></i>
                      <span>Download PDF</span>
                    </button>
                  </div>
                </div>

                {isPDFLoading && (
                  <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex flex-col items-center justify-center">
                    {/* Animated Spinner */}
                    <div className="relative">
                      {/* Outer ring */}
                      <div className="w-20 h-20 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin"></div>

                      {/* Center dot */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-indigo-500 rounded-full"></div>
                    </div>

                    {/* Loading Text */}
                    <div className="mt-8 text-center">
                      <h3 className="text-white text-xl font-semibold mb-2">
                        Loading PDF
                      </h3>
                      <p className="text-gray-300">
                        Preparing report pages...
                      </p>

                      {/* Progress dots animation */}
                      <div className="flex justify-center mt-4 space-x-2">
                        {[...Array(3)].map((_, i) => (
                          <div
                            key={i}
                            className="w-3 h-3 bg-white mt-4 rounded-full animate-bounce"
                            style={{ animationDelay: `${i * 0.1}s` }}
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div
                  style={{
                    position: "relative",
                    width: "100%",
                  }}
                >
                  {isVersionChanging && (
                    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex flex-col items-center justify-center">
                      {/* Animated Spinner */}
                      <div className="relative">
                        {/* Outer ring */}
                        <div className="w-20 h-20 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin"></div>

                        {/* Inner ring */}
                        {/* <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border-4 border-green-200 border-t-green-500 animate-spin animation-delay-300"></div> */}

                        {/* Center dot */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-indigo-500 rounded-full"></div>
                      </div>

                      {/* Loading Text */}
                      <div className="mt-8 text-center">
                        <h3 className="text-white text-xl font-semibold mb-2">
                          Loading Version {selectedVersion.replace("Version ", "")}
                        </h3>
                        <p className="text-gray-300">
                          Preparing report Pages...
                        </p>

                        {/* Progress dots animation */}
                        <div className="flex justify-center mt-4 space-x-2">
                          {[...Array(3)].map((_, i) => (
                            <div
                              key={i}
                              className="w-3 h-3 bg-white mt-4 rounded-full animate-bounce"
                              style={{ animationDelay: `${i * 0.1}s` }}
                            ></div>
                          ))}
                        </div>
                      </div>

                      {/* Optional: Loading percentage */}
                      <div className="mt-6 w-64">
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                            style={{ width: `${(loadingProgress.step / loadingProgress.totalSteps) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-gray-400 text-sm mt-2 text-center">
                          {loadingProgress.message || 'Loading report Pages...'}
                        </p>
                      </div>
                    </div>
                  )}
                  <div
                    className={`${isVersionChanging ? 'pdf-loading' : ''} `}
                    style={{
                      position: 'relative',
                      width: '100%',
                      transition: 'filter 0.3s ease',
                      background:"#282828"
                    }}
                  >
                    <div style={{ height: "95vh", width: "100%" , background:"#282828" }}>

                      <PDFViewer
                        width="100%"
                        height="100%"
                        style={{
                          height: "100%",
                          width: "100%",
                          overflow: "auto",
                           background:"#282828"
                        }}
                        showToolbar={false}
                        key={orientation + selectedVersion}
                      >
                        {memoizedPDF}
                      </PDFViewer>
                    </div>
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

                 
                </div>
              </div>
            </>
          );
        }}
      </BlobProvider>
    </div>
  );
};

export default ConsultantGeneratedPDF;
