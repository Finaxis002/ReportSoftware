import { useNavigate } from "react-router-dom";

const CmaReportGenerator = ({ formData }) => {
  const localData = formData;
  console.log("formData", formData);

  const navigate = useNavigate();

  const handleMenuCmaGenerate = () => {
  localStorage.setItem("cmaAdvanceFormData", JSON.stringify(formData));
  localStorage.setItem("cmaSource", "menu-bar");
  window.open("/cma-advance-report", "_blank", "noopener,noreferrer");
};


  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
      <div className="flex flex-col items-center justify-center space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            CMA Report Generator
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Generate comprehensive Comparative Market Analysis reports
          </p>
        </div>

        <div className="w-full border-t border-gray-200 dark:border-gray-700 my-4"></div>

       
        <button
          onClick={handleMenuCmaGenerate}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium rounded-lg shadow-lg "
        >
          <div className="flex items-center justify-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                clipRule="evenodd"
              />
            </svg>
            <span>Generate CMA Data Report</span>
          </div>
        </button>

        <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          {formData
            ? "Data loaded and ready for report generation"
            : "No data available"}
        </div>
      </div>
    </div>
  );
};

export default CmaReportGenerator;
