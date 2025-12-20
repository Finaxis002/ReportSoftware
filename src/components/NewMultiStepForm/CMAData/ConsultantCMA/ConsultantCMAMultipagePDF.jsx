import { useState, useCallback, useEffect } from "react";
import { Document } from "@react-pdf/renderer";
import WordConclusion from "../../Consultant/ConsultantPdfComponents/WordPages/WordConclusion";
import ConsultantCMAContents from "./ConsultantCMAContents"
import ConsultantCMAOperatingStatementPDF from "./ConsultantCMAOperatingStatementPDF";
import ConsultantCMAAnalysisOfBS from "./ConsultantCMAAnalysisOfBS";
import ConsultantCMAWorkingCapReq from "./CosultantCMAWorkingCapReq";
import ConsultantCMAFundFlow from "./ConsultantCMAFundFlow";
import ConsultantCMAFinancialPosition from "./ConsultantCMAFinancialPosition";
import ConsultantCMAProfitabilityMenu from "./ConsultantCMAProfitabilityMenu";
import ConsultantCMADSCR from "./ConsultantCMADSCR";
import ConsultantCMARatioAnalysis from "./ConsultantCMARatioAnalysis";
import ConsultantCMABalanceSheetMenu from "./ConsultantCMABalanceSheetMenu";
import ConsultantCMACashflowMenu from "./ConsultantCMACashflowMenu";
import ConsultantCMAProfitability10perreduce from "./ConsultantCMAProfitability10perreduce";
import ConsultantCMASARevenue from "./ConsultantCMASARevenue";
import ConsultantCMADSCRRevenue from "./ConsultantCMADSCRRevenue";
import ConsultantCMAProfitabiltyExpenseInc from "./ConsultantCMAProfitabiltyExpenseInc";
import ConsultantCMASAExpense from "./ConsultantCMASAExpense";
import ConsultantCMADSCRExpense from "./ConsultantCMADSCRExpense";
import ConsultantCMAAssumptions from "./ConsultantCMAAssumptions";

const ConsultantCMAMultipagePDF = ({
    formData,
    setIsPDFLoading,
    orientation,
    versionNum,
    onLoadingComplete
}) => {
   

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
           
            <ConsultantCMAContents formData={formData} orientation={orientation} formatNumber={formatNumber} versionNum={versionNum} />
             <ConsultantCMAOperatingStatementPDF formData={formData} orientation={orientation} />
             <ConsultantCMAAnalysisOfBS formData={formData} orientation={orientation} />
            <ConsultantCMAWorkingCapReq formData={formData} orientation={orientation} />
            <ConsultantCMAFundFlow formData={formData} orientation={orientation} />
            <ConsultantCMAFinancialPosition formData={formData} orientation={orientation} />
            <ConsultantCMAProfitabilityMenu
                handleDataSend={handleDataSend}
                formData={formData}
                totalRevenueReceipts={reducedRevenueReceipts}
                formatNumber={formatNumber}
                orientation={orientation}
            />
            <ConsultantCMADSCR
                formData={formData}
                formatNumber={formatNumber}
                orientation={orientation}
            />
            {versionNum >= 3 && (
                <ConsultantCMARatioAnalysis
                    formData={formData}
                    formatNumber={formatNumber}
                    orientation={orientation}
                />
            )}
            <ConsultantCMABalanceSheetMenu
                handleDataSend={handleDataSend}
                formData={formData}
                totalRevenueReceipts={reducedRevenueReceipts}
                formatNumber={formatNumber}
                orientation={orientation}
            />
            <ConsultantCMACashflowMenu
                handleDataSend={handleDataSend}
                totalRevenueReceipts={reducedRevenueReceipts}
                formData={formData}
                orientation={orientation}
                formatNumber={formatNumber} />


           
            
            {versionNum >= 3 && (
                <ConsultantCMAProfitability10perreduce
                    handleDataSend={handleDataSend}
                    formData={formData}
                    totalRevenueReceipts={reducedRevenueReceipts}
                    formatNumber={formatNumber}
                    orientation={orientation}
                />
            )}
            {versionNum >= 3 && (
                <ConsultantCMASARevenue
                    formData={formData}
                    formatNumber={formatNumber}
                    orientation={orientation}
                />
            )}
            {versionNum >= 3 && (
                <ConsultantCMADSCRRevenue
                    formData={formData}
                    formatNumber={formatNumber}
                    orientation={orientation}
                />
            )}

            {versionNum >= 4 && (
                <ConsultantCMAProfitabiltyExpenseInc
                    formData={formData}
                    formatNumber={formatNumber}
                    orientation={orientation}
                />
            )}

            {versionNum >= 4 && (
                <ConsultantCMASAExpense
                    formData={formData}
                    formatNumber={formatNumber}
                    orientation={orientation}
                />
            )}

            {versionNum >= 4 && (
                <ConsultantCMADSCRExpense
                    formData={formData}
                    formatNumber={formatNumber}
                    orientation={orientation}
                />
            )}

            
            <ConsultantCMAAssumptions
                formData={formData}
                formatNumber={formatNumber}
                orientation={orientation}
            />
            <WordConclusion 
            formData={formData}
            startPageNumber={2} 
            />
        </Document>
    );
};

export default ConsultantCMAMultipagePDF;
