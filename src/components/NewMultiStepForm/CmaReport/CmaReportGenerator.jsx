import { useState , useRef } from "react";
import { useNavigate , } from "react-router-dom";

const CmaReportGenerator = ({ formData }) => {
  const [isPDFLoaded , setIsPDFLoaded] = useState(false)
  const [isLoading , setIsLoading] = useState(false);
  const iframeRef = useRef(null);
  const localData = formData;
  console.log("formData", formData);

  const navigate = useNavigate();

  // const handleGenerateReport = () => {
  //   sessionStorage.setItem("cmaFormData", JSON.stringify(formData));
  //   window.open("/cma-report/pdf", "_blank");
  // };

const handleGenerateReport = async () => {
  setIsPDFLoaded(false);
  setIsLoading(true);

  // Optional: Log activity if needed (similar to check_profit)
  try {
    await fetch("https://reportsbe.sharda.co.in/api/activity/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "generate_cma_pdf",
        reportTitle: formData?.AccountInformation?.businessName || "Untitled",
        reportOwner: formData?.AccountInformation?.businessOwner || "",
        performedBy: {
          name: userName || "Unknown",
          role: userRole || "unknown",
        },
      }),
    });
    console.log("✅ Logged 'generate_cma_pdf' activity");
  } catch (error) {
    console.warn("❌ Failed to log 'generate_cma_pdf' activity:", error);
  }

  // Save selected formData for PDF generation (if needed)
  localStorage.setItem("cmaFormData", JSON.stringify(formData));

  // 1. Open the popup window (blank for now)
  const popup = window.open(
    "",
    "popupWindow",
    "width=800,height=600,left=200,top=200,resizable=no,scrollbars=yes"
  );
  if (!popup) {
    alert("Popup blocked. Please allow popups for this site.");
    setIsLoading(false);
    return;
  }

  // 2. Trigger PDF generation by loading in a hidden iframe
  if (iframeRef.current) {
    iframeRef.current.src = `/generated-cma-pdf?t=${Date.now()}`; // your PDF route

    // 3. Fallback if PDF doesn't load in 15s
    timeoutId.current = setTimeout(() => {
      if (isComponentMounted.current && popup) {
        popup.location.href = "/cma-report/pdf";
      }
    }, 15000);

    // 4. When PDF is loaded, open the actual report page immediately
    iframeRef.current.onload = () => {
      clearTimeout(timeoutId.current);
      timeoutId.current = null;
      if (isComponentMounted.current && popup) {
        // If you want instant open, set delay to 0
        setTimeout(() => {
          popup.location.href = "/cma-report/pdf";
        }, 0);
      }
    };
  } else {
    // fallback if iframe is not mounted
    popup.location.href = "/cma-report/pdf";
  }

  setIsPDFLoaded(true);
  setIsLoading(false);
};



  return (
    <div className="max-w-2xl mx-auto p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl">
      <div className="flex flex-col items-center justify-center space-y-8">
        {/* Header with icon */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-blue-600 dark:text-blue-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
            CMA Report Generator
          </h2>
        </div>

        {/* Divider */}
        <div className="w-full border-t border-gray-200 dark:border-gray-700 my-2"></div>

        {/* Main action button */}
        <button
          onClick={handleGenerateReport}
          className="px-10 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium rounded-lg shadow-lg"
        >
          <div className="flex items-center justify-center space-x-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h2a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h4a1 1 0 100-2H7z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-lg">Generate CMA Data Report</span>
          </div>
        </button>

        {/* Status indicator */}
        <div
          className={`flex items-center justify-center px-4 py-3 rounded-lg ${
            formData
              ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
              : "bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 mr-2 ${
              formData ? "text-green-500" : "text-gray-400"
            }`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            {formData ? (
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            ) : (
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                clipRule="evenodd"
              />
            )}
          </svg>
          <span>
            {formData
              ? "Data loaded and ready for report generation"
              : "No data available - Please load data first"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CmaReportGenerator;
