import { useParams } from "react-router-dom";
import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
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
import { FiIconName } from "react-icons/fi";

const DemoPDFView = () => {
  const { reportId } = useParams();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
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

  const location = useLocation();

  const pdfContainerRef = useRef(null);

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
  
   
  
    const [orientation, setOrientation] = useState(() => {
      const stored = JSON.parse(localStorage.getItem("formData"));
      const years = formData?.ProjectReportSetting?.ProjectionYears || 5;
      return years > 6 ? "landscape" : "portrait";
    });
  
    const yearsRef = useRef(5);

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

  const { id } = useParams;
  console.log("id : ", reportId);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:9000/api/reports/${reportId}`
        );
        if (!response.ok) throw new Error("Report not found");
        const data = await response.json();
        setFormData(data);
      } catch (err) {
        setFormData(null);
        alert("Could not fetch report data. Please check the link.");
      } finally {
        setLoading(false);
      }
    }
    if (reportId) fetchData();
  }, [reportId]);

  console.log("formData : ", formData);

  useEffect(() => {
    // Fetch report data from localStorage or backend (ideally backend in production)
    const data = localStorage.getItem(`sharedReport-${reportId}`);
    if (data) setFormData(JSON.parse(data));
  }, [reportId]);

  // Disable right-click, print, etc.
  useEffect(() => {
    const prevent = (e) => {
      e.preventDefault();
      alert("Action disabled on Demo PDF.");
    };
    const preventPrint = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
        e.preventDefault();
        alert("Printing is disabled for this document.");
      }
    };
    document.addEventListener("contextmenu", prevent);
    document.addEventListener("keydown", preventPrint);
    return () => {
      document.removeEventListener("contextmenu", prevent);
      document.removeEventListener("keydown", preventPrint);
    };
  }, []);

  if (!formData) return <div>Loading...</div>;

  // Your existing PDF Document component, just pass formData as before!
  return (
    <div className="relative">
      {/* Watermark overlay (optional) */}
      <div
        style={{
          position: "absolute",
          zIndex: 20,
          pointerEvents: "none",
          opacity: 0.18,
          width: "100%",
          height: "100%",
          textAlign: "center",
          fontSize: "4rem",
          color: "#a0aec0",
          userSelect: "none",
        }}
      >
        DEMO ONLY - SCREENSHOTS PROHIBITED
      </div>
      <PDFViewer
        width="100%"
        height="800"
        showToolbar={false}
        style={{ background: "#f3f4f6", zIndex: 10 }}
      >
        {/* Render your Document here with formData */}
        {/* <YourDocumentComponent formData={formData} /> */}
      </PDFViewer>
    </div>
  );
};

export default DemoPDFView;
