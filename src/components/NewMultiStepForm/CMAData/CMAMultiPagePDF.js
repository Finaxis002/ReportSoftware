import React from "react";
import { Document, Page } from "@react-pdf/renderer";
import CMAOperatingStatementPDF from "./CMAOperatingStatementPDF";
import CMAAnalysisOfBS from "./CMAAnalysisOfBS";
import CMAFundFlow from "./CMAFundFlow";

const CMAMultiPagePDF = ({formData}) => {

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
return (
  <Document>
    {/* Each sub-component must return <Page> or an array of <Page> */}
    <CMAOperatingStatementPDF formData={formData} />
    <CMAAnalysisOfBS formData={formData} />
    <CMAFundFlow formData={formData} />
    
  </Document>
)
};

export default CMAMultiPagePDF;
