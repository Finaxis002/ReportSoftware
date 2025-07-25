import React from "react";
import { useState, useCallback, useEffect } from "react";
import { Document, Page } from "@react-pdf/renderer";
import CMAOperatingStatementPDF from "./CMAOperatingStatementPDF";
import CMAAnalysisOfBS from "./CMAAnalysisOfBS";
import CMAFundFlow from "./CMAFundFlow";
import CMAFinancialPosition from "./CMAFinancialPosition";
import ProjectedProfitability from "../PDFComponents/ProjectedProfitability";
import CMAProfitability10perreduce from "./CMAProfitability10perreduce";
import CMAProfitabiltyExpenseInc from "./CMAProfitabiltyExpenseInc";
import CMASARevenue from "./CMASARevenue";
import CMASAExpense from "./CMASAExpense";
import CMADSCRRevenue from "./CMADSCRRevenue";
import CMADSCRExpense from "./CMADSCRExpense";
import CMAWorkingCapReq from "./CMAWorkingCapReq";
import CMAProfitabilityMenu from "./CMAProfitabilityMenu";
import CMABalanceSheetMenu from './CMABalanceSheetMenu';
import CMACashflowMenu from './CMACashflowMenu';
import CMAContents from './CMAContents';

const CMAMultiPagePDF = ({
  formData,
  setIsPDFLoading,
  orientation,
  source,
  onLoadingComplete
}) => {
  //     const formData = JSON.parse(localStorage.getItem("cmaAdvanceFormData")) || {};
  //   const isEmpty =
  //     !formData ||
  //     !formData.ProjectReportSetting ||
  //     !formData.AccountInformation ||
  //     !formData.ProjectReportSetting.ProjectionYears;

  //   if (isEmpty) {
  //     return (
  //       <div
  //         style={{
  //           width: "100%",
  //           maxWidth: 900,
  //           margin: "40px auto",
  //           padding: 40,
  //           textAlign: "center",
  //         }}
  //       >
  //         <h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 24 }}>
  //           CMA Advance Report Preview
  //         </h2>
  //         <div
  //           style={{
  //             color: "tomato",
  //             fontWeight: 600,
  //             fontSize: 20,
  //             marginTop: 50,
  //           }}
  //         >
  //           ⚠️ No CMA data found. <br />
  //           Please complete the form and generate the report again.
  //         </div>
  //       </div>
  //     );
  //   }

  const isMenuBar = source === "menu-bar";
  const [totalRevenueReceipts, setTotalRevenueReceipts] = useState([]);
  const [receivedData, setReceivedData] = useState({});
  const reducedRevenueReceipts = totalRevenueReceipts.map((val) => val * 0.9);
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
  const handleDataSend = useCallback((data) => {
    setReceivedData(data);
  });

   useEffect(() => {
    // This timeout is a fallback in case the PDF rendering doesn't trigger an event
    const fallbackTimeout = setTimeout(() => {
      onLoadingComplete && onLoadingComplete();
    }, 3000); // 3 seconds fallback

    return () => clearTimeout(fallbackTimeout);
  }, [onLoadingComplete]);

  return (
    <Document
      onRender={() => {
        if (setIsPDFLoading) setIsPDFLoading(false); // <-- Only call if provided!
      }}
    >
      {/* Each sub-component must return <Page> or an array of <Page> */}
       {isMenuBar && (
        <>

           <CMAContents formData={formData} orientation={orientation}  formatNumber={formatNumber}/>
          <CMAProfitabilityMenu
            handleDataSend={handleDataSend}
            formData={formData}
            totalRevenueReceipts={reducedRevenueReceipts}
            formatNumber={formatNumber}
            orientation={orientation}
          />
          <CMABalanceSheetMenu
            handleDataSend={handleDataSend}
            formData={formData}
            totalRevenueReceipts={reducedRevenueReceipts}
            formatNumber={formatNumber}
            orientation={orientation}
          />
           <CMACashflowMenu 
            handleDataSend={handleDataSend}
            totalRevenueReceipts={reducedRevenueReceipts}
           formData={formData} 
           orientation={orientation} 
           formatNumber={formatNumber}/>
        </>
      )}
      <CMAAnalysisOfBS formData={formData} orientation={orientation} />
      <CMAWorkingCapReq formData={formData} orientation={orientation} />
      <CMAFundFlow formData={formData} orientation={orientation} />
      <CMAFinancialPosition formData={formData} orientation={orientation} />
      <CMAProfitability10perreduce
        handleDataSend={handleDataSend}
        formData={formData}
        totalRevenueReceipts={reducedRevenueReceipts}
        formatNumber={formatNumber}
        orientation={orientation}
      />
      <CMASARevenue
        formData={formData}
        formatNumber={formatNumber}
        orientation={orientation}
      />
      <CMADSCRRevenue
        formData={formData}
        formatNumber={formatNumber}
        orientation={orientation}
      />

      <CMAProfitabiltyExpenseInc
        formData={formData}
        formatNumber={formatNumber}
        orientation={orientation}
      />

      <CMASAExpense
        formData={formData}
        formatNumber={formatNumber}
        orientation={orientation}
      />

      <CMADSCRExpense
        formData={formData}
        formatNumber={formatNumber}
        orientation={orientation}
      />
      <CMAOperatingStatementPDF formData={formData} orientation={orientation} />
      
     

     
    </Document>
  );
};

export default CMAMultiPagePDF;
