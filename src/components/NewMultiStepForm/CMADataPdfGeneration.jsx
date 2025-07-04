// import CMAOperatingStatementPDF from "./CMAData/CMAOperatingStatementPDF";

// const CMADataPdfGeneration = () => {
//   // Read formData from localStorage (set in FinalStep)
//   const formData = JSON.parse(localStorage.getItem("cmaAdvanceFormData")) || {};

//   // Optionally, clear it after use:
//   // localStorage.removeItem("cmaAdvanceFormData");

//   return (
//     <CMAOperatingStatementPDF formData={formData} />
//   );
// };

// export default CMADataPdfGeneration;







import React from "react";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import CMAOperatingStatementPDF from "./CMAData/CMAOperatingStatementPDF";

const CMADataPdfGeneration = () => {
  const formData = JSON.parse(localStorage.getItem("cmaAdvanceFormData")) || {};
  const isEmpty =
    !formData ||
    !formData.ProjectReportSetting ||
    !formData.AccountInformation ||
    !formData.ProjectReportSetting.ProjectionYears;

  if (isEmpty) {
    return (
      <div style={{ width: "100%", maxWidth: 900, margin: "40px auto", padding: 40, textAlign: "center" }}>
        <h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 24 }}>
          CMA Advance Report Preview
        </h2>
        <div style={{ color: "tomato", fontWeight: 600, fontSize: 20, marginTop: 50 }}>
          ⚠️ No CMA data found. <br />
          Please complete the form and generate the report again.
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", maxWidth: 900, margin: "40px auto", background: "#fff", borderRadius: 12, boxShadow: "0 2px 12px #0002", padding: 24 }}>
      <h2 style={{ textAlign: "center", fontWeight: 700, fontSize: 22, marginBottom: 24 }}>
        CMA Advance Report Preview
      </h2>
      {/* PDF Preview */}
      <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden", marginBottom: 32 }}>
        <PDFViewer width="100%" height={900} style={{ border: "none", width: "100%" }}>
          <CMAOperatingStatementPDF formData={formData} />
        </PDFViewer>
      </div>
      {/* Download Button */}
      {/* <div style={{ textAlign: "center" }}>
        <PDFDownloadLink
          document={<CMAOperatingStatementPDF formData={formData} />}
          fileName="CMA-Operating-Statement.pdf"
          style={{
            display: "inline-block",
            background: "linear-gradient(90deg,#f59e42,#f3cc4d)",
            color: "#222",
            fontWeight: 700,
            padding: "12px 28px",
            borderRadius: 8,
            boxShadow: "0 2px 6px #0002",
            textDecoration: "none",
            fontSize: 18
          }}
        >
          {({ loading }) => (loading ? "Preparing PDF..." : "Download PDF")}
        </PDFDownloadLink>
      </div> */}
    </div>
  );
};

export default CMADataPdfGeneration;
