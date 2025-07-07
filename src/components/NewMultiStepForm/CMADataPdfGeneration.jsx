import React from "react";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import CMAMultiPagePDF from './CMAData/CMAMultiPagePDF'
import CMAOperatingStatementPDF from "./CMAData/CMAOperatingStatementPDF";
import CMAAnalysisOfBS from './CMAData/CMAAnalysisOfBS';

const CMADataPdfGeneration = () => {
  const formData = JSON.parse(localStorage.getItem("cmaAdvanceFormData")) || {};
  const isEmpty =
    !formData ||
    !formData.ProjectReportSetting ||
    !formData.AccountInformation ||
    !formData.ProjectReportSetting.ProjectionYears;

  if (isEmpty) {
    return (
      <div
        style={{
          width: "100%",
          maxWidth: 900,
          margin: "40px auto",
          padding: 40,
          textAlign: "center",
        }}
      >
        <h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 24 }}>
          CMA Advance Report Preview
        </h2>
        <div
          style={{
            color: "tomato",
            fontWeight: 600,
            fontSize: 20,
            marginTop: 50,
          }}
        >
          ⚠️ No CMA data found. <br />
          Please complete the form and generate the report again.
        </div>
      </div>
    );
  }

  return (
    <>
      {/* PDF Preview */}
      {/* <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden", marginBottom: 32 }}>
        <PDFViewer width="100%" height={500} style={{ border: "none", width: "100%" }}>
          <CMAOperatingStatementPDF formData={formData} />
        </PDFViewer>
      </div> */}

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
        >
          <CMAMultiPagePDF formData={formData} />
        </PDFViewer>
      </div>
    </>
  );
};

export default CMADataPdfGeneration;
