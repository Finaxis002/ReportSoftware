import{ useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ReportDropdown from "../Dropdown/ReportDropdown";
import CmaReportGenerator from "../CmaReportFromMenu/CmaReportGenerator";

const CmaPage = ({ userRole }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect immediately if no userRole
  useEffect(() => {
    if (!userRole) navigate("/login");
  }, [userRole, navigate]);

  // Get initial form data
  const initialFormData = location.state?.formData || null;
  const initialBusinessDescription =
    initialFormData?.AccountInformation?.businessDescription || "";
  const initialBep =
    initialFormData?.computedData?.breakEvenPointPercentage
      ?.breakEvenPointPercentage?.[1] || "";

  const [businessData, setBusinessData] = useState(initialFormData);
  const [businessDescription, setBusinessDescription] = useState(
    initialBusinessDescription
  );
  const [bep, setBep] = useState(initialBep);
  const [sections, setSections] = useState({});
  const [loading, setLoading] = useState(false);
  const [showProjectReport, setShowProjectReport] = useState(false);
  const [error, setError] = useState("");
  const [isDataSelected, setIsDataSelected] = useState(!!initialFormData);

  function handleBusinessSelect(data) {
    setBusinessData(data);
    setBusinessDescription(data?.AccountInformation?.businessDescription || "");
    setBep(
      data?.computedData?.breakEvenPointPercentage
        ?.breakEvenPointPercentage?.[1] || ""
    );
    setSections({});
    setShowProjectReport(false);
    setError("");
    setIsDataSelected(true);
    // Save the data to localStorage as 'cmareportdata'
    localStorage.setItem("cmareportdata", JSON.stringify(data));
  }

  const formData = businessData;

  return (
    <div className="flex h-[100vh] bg-gray-50 dark:bg-gray-900 transition-colors duration-300 relative">
      <div className="app-content flex-1 overflow-auto">
       
        <div className="">
          {/* Selection Card - Fixed z-index for dropdown */}
          <div className="w-full bg-white/70 dark:bg-[#232733]/80 backdrop-blur-[6px] rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-800 transition-all duration-300 hover:shadow-xl mb-2 relative z-40">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
                  <svg
                    className="w-6 h-6 text-teal-600 dark:text-teal-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl md:text-2xl font-semibold text-neutral-800 dark:text-white">
                  Select Project Report
                </h2>
              </div>
              <div className="w-full md:w-auto flex-1 max-w-6xl relative z-50">
                <ReportDropdown
                  onBusinessSelect={handleBusinessSelect}
                  className="w-full"
                />
              </div>
            </div>

            {!isDataSelected && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/50">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-500 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <p className="text-blue-700 dark:text-blue-300 text-sm">
                    Please select a business from the dropdown to generate a comprehensive CMA report.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Report Section with Smooth Transition */}
          <div className={`transition-all duration-500 ${isDataSelected ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {isDataSelected && (
              <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700 p-2">
                <CmaReportGenerator formData={formData} />
              </div>
            )}
          </div>

          {/* Empty State */}
          {!isDataSelected && (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl bg-white/70 dark:bg-[#232733]/80 shadow border border-gray-100 dark:border-gray-800 backdrop-blur-[6px]">
              <div className="mb-5 p-4 bg-teal-100 dark:bg-teal-900/20 rounded-full">
                <svg className="w-12 h-12 text-teal-500 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-neutral-800 dark:text-white mb-2">No Report Selected</h3>
              <p className="text-gray-500 dark:text-gray-300 max-w-md">
                Choose a business from the dropdown above to generate and view a comprehensive CMA report with financial analysis and insights.
              </p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .app-content {
          transition: all 0.3s ease;
        }
        
        /* Ensure dropdown appears above all content */
        .relative.z-50 {
          position: relative;
          z-index: 50;
        }
        
        .relative.z-40 {
          position: relative;
          z-index: 40;
        }
        
        /* Smooth scrolling */
        .app-content::-webkit-scrollbar {
          width: 6px;
        }
        
        .app-content::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .app-content::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        
        .app-content::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        
        .dark .app-content::-webkit-scrollbar-thumb {
          background: #475569;
        }
        
        .dark .app-content::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>
    </div>
  );
};

export default CmaPage;