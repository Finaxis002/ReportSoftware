import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { PDFViewer } from "@react-pdf/renderer";
import GeneratedPDF from "./GeneratedPDF";

const SharedReportViewer = () => {
  const { token } = useParams();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:5000/api/reports/shared/${token}`)
      .then((res) => res.json())
      .then((data) => {
        setReportData(data.report);
        setLoading(false);
      });
  }, [token]);

  if (loading) return <div>Loading report...</div>;
  if (!reportData) return <div>Report not found or expired.</div>;

  // Pass all needed props; remove useLocation etc. from GeneratedPDF
  return (
    <PDFViewer width="1000" height="1100">
      <GeneratedPDF formData1={reportData} isSharedView={true} />
    </PDFViewer>
  );
};

export default SharedReportViewer;
