import { BlobProvider } from "@react-pdf/renderer";

const handleDownload = async (sessionId) => {
  try {
    const response = await fetch(`http://localhost:5000/get-report-data/${sessionId}`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch report data");
    }

    const reportData = await response.json();

    console.log("✅ Report Data Fetched:", reportData);

    // ✅ Use BlobProvider for PDF download
    const blob = await new Promise((resolve) => {
      const { pdf } = require("@react-pdf/renderer");
      const blobStream = pdf(<GeneratedPDF formData={reportData} />).toBlob();

      blobStream.then((blob) => {
        resolve(blob);
      });
    });

    // ✅ Create a downloadable link
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Report_${sessionId}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log("✅ PDF downloaded successfully");
  } catch (error) {
    console.error("❌ Error downloading PDF:", error);
    alert("Error downloading PDF");
  }
};
