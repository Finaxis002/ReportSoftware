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
  Page,
  Text,
  View,
  Image,
} from "@react-pdf/renderer";
import { Font } from "@react-pdf/renderer";
import useStore from "./useStore";
import { PDFDocument } from "pdf-lib";

import * as pdfjs from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.entry"; // ✅ Direct worker import

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

// import convertToPdf from 'docx-pdf';
import htmlToPdfmake from "html-to-pdfmake";
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { renderAsync } from "docx-preview";

pdfMake.vfs = pdfFonts;

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

import FinancialGraphs from "./PDFComponents/FinancialGraphs";
import PdfWithChart from "./PDFComponents/PdfWithChart"
import { generateChart } from "./charts/chart";

import DirectExpenseBreakUp from "./PDFComponents/Graphs/DirectExpenseBreakUp";

Font.register({
  family: "TimesNewRoman",
  fonts: [
    {
      src: require("./Assets/Fonts/times-new-roman.ttf"),
      fontWeight: "normal",
    },
    {
      src: require("./Assets/Fonts/times-new-roman-bold.ttf"),
      fontWeight: "bold",
    },
    {
      src: require("./Assets/Fonts/times-new-roman-bold-italic.ttf"),
      fontWeight: "bold",
      fontStyle: "italic",
    },
  ],
});


const GeneratedPDF = React.memo(({}) => {
  const [chartBase64, setChartBase64] = useState(null);
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

  const [averageCurrentRatio, setAverageCurrentRatio] = useState([]);

  const [breakEvenPointPercentage, setBreakEvenPointPercentage] = useState([]);

  const [totalExpense, setTotalExpense] = useState([]);

  const [userRole, setUserRole] = useState("");

  const [pdfType, setPdfType] = useState("");

  const [years, setYears] = useState(5);

  const [totalRevenueReceipts, setTotalRevenueReceipts] = useState([]);

  const [isPDFLoading, setIsPDFLoading] = useState(true);

  const [importedPages, setImportedPages] = useState([]);

  const location = useLocation();
  const stableLocation = useMemo(() => location, []);

  const pdfData = location.state?.reportData; // ✅ Get report data from state

  console.log("📥 Received PDF Data:", pdfData);

  useEffect(() => {
    // ✅ Fetch from localStorage when component mounts
    const storedPdfType = localStorage.getItem("pdfType");
    if (storedPdfType) {
      setPdfType(storedPdfType);
    }
  }, []);

  console.log("pdf type", pdfType);

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

  // const formatNumber = (value) => {
  //   const formatType = formData?.ProjectReportSetting?.Format || "1"; // Default to Indian Format
  //   if (value === undefined || value === null || isNaN(value)) return "0.00"; // ✅ Handle invalid values with 2 decimals

  //   switch (formatType) {
  //     case "1": // Indian Format (1,23,456.00)
  //       return new Intl.NumberFormat("en-IN", {
  //         minimumFractionDigits: 2,
  //         maximumFractionDigits: 2,
  //       }).format(value);

  //     case "2": // USD Format (1,123,456.00)
  //       return new Intl.NumberFormat("en-US", {
  //         minimumFractionDigits: 2,
  //         maximumFractionDigits: 2,
  //       }).format(value);

  //     case "3": // Generic Indian Format (1,23,456.00)
  //       return new Intl.NumberFormat("en-IN", {
  //         minimumFractionDigits: 2,
  //         maximumFractionDigits: 2,
  //       }).format(value);

  //     default: // Default to Indian Format with 2 decimal places
  //       return new Intl.NumberFormat("en-IN", {
  //         minimumFractionDigits: 2,
  //         maximumFractionDigits: 2,
  //       }).format(value);
  //   }
  // };

  //new format number to visually remove decimals after

  const formatNumber = (value) => {
    const formatType = formData?.ProjectReportSetting?.Format || "1"; // Default to Indian Format
    if (value === undefined || value === null || isNaN(value)) return "0"; // ✅ Handle invalid values

    let formattedValue;

    switch (formatType) {
      case "1": // Indian Format (1,23,456)
        formattedValue = new Intl.NumberFormat("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(value);
        break;

      case "2": // USD Format (1,123,456)
        formattedValue = new Intl.NumberFormat("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(value);
        break;

      case "3": // Generic Indian Format (1,23,456)
        formattedValue = new Intl.NumberFormat("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(value);
        break;

      default: // Default to Indian Format
        formattedValue = new Intl.NumberFormat("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(value);
    }

    // ✅ Remove the decimal part visually but keep it internally
    return formattedValue.split(".")[0];
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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];

    if (file) {
      const fileType = file.type;

      if (fileType === "application/pdf") {
        await handlePdfUpload(file);
      } else if (
        fileType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        await handleWordUpload(file);
      } else {
        alert("Unsupported file type");
      }
    }
  };
    
  const handleWordUpload = async (file) => {
    try {
      const reader = new FileReader();
  
      reader.onload = async (event) => {
        const arrayBuffer = event.target.result;
        const container = document.createElement("div");
  
        // ✅ Render the document (async)
        await renderAsync(arrayBuffer, container);
  
        const images = container.getElementsByTagName("img");
        console.log(`🔎 Found ${images.length} images`);
  
        for (let img of images) {
          console.log(`➡️ Original image src: ${img.src}`);
          
          // ✅ Check if blob URL exists
          if (img.src.startsWith("blob:")) {
            console.log(`🔍 Attempting to convert blob: ${img.src}`);
            const base64 = await convertBlobToBase64(img.src);
  
            if (base64) {
              img.src = base64; // ✅ Replace blob with base64
              console.log(`✅ Converted blob to base64`);
            } else {
              console.warn(`⚠️ Failed to convert blob to base64: ${img.src}`);
            }
          }
        }
  
        console.log("🟢 Extracted HTML:", container.innerHTML);
        const extractedHtml = container.innerHTML;
        setImportedPages((prev) => [...prev, extractedHtml]);
      };
  
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("❌ Error uploading Word file:", error);
    }
  };
  
  

  const cleanHtml = (html) => {
    return html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "") // Remove <style> tags
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "") // Remove <script> tags
      .replace(/<!--[\s\S]*?-->/g, "") // Remove HTML comments
      .replace(/<(iframe|video|svg)[^>]*>[\s\S]*?<\/\1>/gi, "") // Remove unsupported tags
      .replace(/\s+/g, " ") // Remove excessive whitespace
      .trim();
  };
  

  const convertCssToPdfStyles = (styleString) => {
    if (!styleString) return {};
  
    return styleString.split(";").reduce((acc, style) => {
      const [key, value] = style.split(":").map((s) => s.trim());
      if (!key || !value) return acc;
  
      // Convert CSS property names to camelCase
      const camelCaseKey = key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  
      let finalValue = value;
  
      // Handle numeric values like px and pt
      if (value.endsWith("pt") || value.endsWith("px")) {
        finalValue = parseFloat(value);
      }
  
      // Handle common CSS styles for pdfMake compatibility
      switch (camelCaseKey) {
        case "fontWeight":
          acc.bold = value === "bold" || parseInt(value) >= 600;
          break;
        case "fontStyle":
          acc.italics = value === "italic";
          break;
        case "textAlign":
          acc.alignment = value;
          break;
        case "color":
          acc.color = value;
          break;
        case "backgroundColor":
          acc.fillColor = value;
          break;
        case "fontSize":
          acc.fontSize = finalValue;
          break;
        case "paddingTop":
          acc.marginTop = finalValue;
          break;
        case "paddingBottom":
          acc.marginBottom = finalValue;
          break;
        case "paddingLeft":
          acc.marginLeft = finalValue;
          break;
        case "paddingRight":
          acc.marginRight = finalValue;
          break;
        case "borderColor":
          acc.borderColor = value;
          break;
        case "borderWidth":
          acc.borderWidth = finalValue;
          break;
        case "borderStyle":
          acc.borderStyle = value;
          break;
        default:
          acc[camelCaseKey] = finalValue;
      }
  
      return acc;
    }, {});
  };
  
  

  const resizeImage = async (blob, maxWidth = 500) => {
    return new Promise((resolve, reject) => {
      const img = new window.Image(); // ✅ Use native Image object
      img.src = URL.createObjectURL(blob);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
  
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
  
        canvas.width = width;
        canvas.height = height;
  
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
  
        canvas.toBlob((newBlob) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            console.log(`✅ Resized Image Base64: ${reader.result.substring(0, 50)}...`);
            resolve(reader.result);
          };
          reader.onerror = reject;
          reader.readAsDataURL(newBlob);
        }, 'image/jpeg', 0.8); // Use JPEG format to reduce size
      };
      img.onerror = reject;
    });
  };
  

  const isValidBase64 = (base64) => {
    return base64 && base64.startsWith('data:image');
  };
  
  const convertBlobToBase64 = async (blobUrl) => {
    if (!blobUrl.startsWith("blob:")) return null;
  
    try {
      const blob = await fetch(blobUrl).then((res) => res.blob());
      const resizedBase64 = await resizeImage(blob); // ✅ Resize before encoding
  
      if (isValidBase64(resizedBase64)) {
        console.log(`✅ Resized and converted base64: ${resizedBase64.substring(0, 50)}...`);
        return resizedBase64;
      } else {
        console.warn(`⚠️ Invalid Base64 string`);
        return null;
      }
    } catch (error) {
      console.error("❌ Failed to convert blob to base64:", error);
      return null;
    }
  };
  
  
  useEffect(() => {
    const loadPdfMake = async () => {
      const pdfMakeModule = await import('pdfmake/build/pdfmake');
      const pdfFontsModule = await import('pdfmake/build/vfs_fonts');
      pdfMakeModule.default.vfs = pdfFontsModule.default.vfs; // ✅ Fix Here
    };
  
    loadPdfMake();
  }, []);
  

  
  const convertHtmlToReactElements = (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
  
    const walkNodes = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent.trim();
        if (text) {
          return <Text key={Math.random()}>{text}</Text>;
        }
        return null;
      }
  
      if (node.nodeType === Node.ELEMENT_NODE) {
        const styles = convertCssToPdfStyles(node.getAttribute("style") || "");
  
        switch (node.nodeName.toLowerCase()) {
          case "p":
            return (
              <Text key={Math.random()} style={{ fontSize: 12, marginBottom: 5, ...styles }}>
                {Array.from(node.childNodes).map(walkNodes).filter(Boolean)}
              </Text>
            );
  
          case "b":
          case "strong":
            return (
              <Text key={Math.random()} style={{ fontWeight: "bold", ...styles }}>
                {Array.from(node.childNodes).map(walkNodes).filter(Boolean)}
              </Text>
            );
  
          case "i":
          case "em":
            return (
              <Text key={Math.random()} style={{ fontStyle: "italic", ...styles }}>
                {Array.from(node.childNodes).map(walkNodes).filter(Boolean)}
              </Text>
            );
  
          case "ul":
            return (
              <View key={Math.random()} style={{ marginLeft: 10, marginBottom: 5, ...styles }}>
                {Array.from(node.childNodes).map(walkNodes).filter(Boolean)}
              </View>
            );
  
          case "li":
            return (
              <Text key={Math.random()} style={{ marginLeft: 10, ...styles }}>
                • {Array.from(node.childNodes).map(walkNodes).filter(Boolean)}
              </Text>
            );
  
          case "img":
            const src = node.getAttribute("src");
            if (src && src.startsWith("data:image")) {
              return (
                <Image
                  key={Math.random()}
                  src={src}
                  style={{ width: 150, height: 100, ...styles }}
                />
              );
            }
            return null;
  
          default:
            return Array.from(node.childNodes).map(walkNodes).filter(Boolean);
        }
      }
  
      return null;
    };
  
    return Array.from(doc.body.childNodes).map(walkNodes).filter(Boolean);
  };

  const generatePdfContent = (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
  
    const walkNodes = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent.trim();
        if (text) return { text };
        return null;
      }
  
      if (node.nodeType === Node.ELEMENT_NODE) {
        const styles = convertCssToPdfStyles(node.getAttribute("style") || "");
  
        switch (node.nodeName.toLowerCase()) {
          case "p":
            return {
              text: Array.from(node.childNodes).map(walkNodes).filter(Boolean),
              marginBottom: 5,
              ...styles,
            };
  
          case "b":
          case "strong":
            return {
              text: Array.from(node.childNodes).map(walkNodes).filter(Boolean),
              bold: true,
              ...styles,
            };
  
          case "i":
          case "em":
            return {
              text: Array.from(node.childNodes).map(walkNodes).filter(Boolean),
              italics: true,
              ...styles,
            };
  
          case "ul":
            return {
              ul: Array.from(node.childNodes).map(walkNodes).filter(Boolean),
              margin: [10, 5],
              ...styles,
            };
  
          case "li":
            return {
              text: `• ${Array.from(node.childNodes).map(walkNodes).filter(Boolean).join("")}`,
              marginLeft: 10,
              ...styles,
            };
  
          case "img":
            const src = node.getAttribute("src");
            if (src && src.startsWith("data:image")) {
              return {
                image: src,
                width: 150,
                height: 100,
                ...styles,
              };
            }
            return null;
  
          default:
            return Array.from(node.childNodes).map(walkNodes).filter(Boolean);
        }
      }
  
      return null;
    };
  
    return Array.from(doc.body.childNodes).map(walkNodes).flat().filter(Boolean);
  };
  
  const handleAppendPages = async () => {
    if (importedPages.length === 0) {
      alert("No imported pages to append!");
      return;
    }
  
    try {
      // ✅ Ensure all blob URLs are converted to Base64 before PDF generation
      await Promise.all(
        importedPages.map(async (page, index) => {
          const container = document.createElement("div");
          container.innerHTML = page;
  
          const images = container.getElementsByTagName("img");
          // console.log(`🔎 Found ${images.length} images in imported page`);
  
          for (let img of images) {
            // console.log(`➡️ Original image src: ${img.src}`);
            if (img.src.startsWith("blob:")) {
              const base64 = await convertBlobToBase64(img.src);
              if (base64) {
                img.src = base64;
                // console.log(`✅ Converted blob to base64`);
              } else {
                // console.warn(`⚠️ Failed to convert blob to base64: ${img.src}`);
              }
            }
          }
  
          importedPages[index] = container.innerHTML;
        })
      );
  
      // ✅ Generate PDF content
      const pdfContent = importedPages
        .map((page) => generatePdfContent(cleanHtml(page)))
        .flat();
  
      // console.log("🟢 Generated PDF content:", pdfContent);
  
      const docDefinition = {
        content: pdfContent,
        styles: {
          header: {
            fontSize: 18,
            bold: true,
            margin: [0, 10, 0, 10],
          },
        },
        defaultStyle: {
          fontSize: 12,
          margin: [5, 5, 5, 5],
          lineHeight: 1.5,
        },
      };
  
      // console.log("🟢 Generated PDF definition:", docDefinition);
      pdfMake.createPdf(docDefinition).download("generated-pdf.pdf");
    } catch (error) {
      // console.error("❌ Error generating PDF:", error);
    }
  };
  


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

        {/* <DirectExpenseBreakUp /> */}
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
          onTotalExpenseSend={setTotalExpense}
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


        <PdfWithChart 
        formData={formData}
        chartBase64={chartBase64}/>

        {/* Append Imported Pages */}

        {/* ✅ Render Imported Pages */}
        {importedPages.map((html, index) => (
          <Page key={`imported-${index}`}>
            <View
              style={{
                fontSize: 12,
                padding: 10,
                lineHeight: 1.5,
                marginTop: 0,
                whiteSpace: "pre-wrap",
              }}
            >
              {convertHtmlToReactElements(html)}
            </View>
          </Page>
        ))}

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
    importedPages,
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
              <div>
                <div>
                  {/* Import Button */}
                  <input
                    type="file"
                    accept=".pdf, .docx"
                    onChange={handleFileUpload}
                  />

                  {/* Append Button */}

                  <button
                    onClick={handleAppendPages}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                  >
                    Append Pages to PDF
                  </button>
                </div>
              </div>
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
