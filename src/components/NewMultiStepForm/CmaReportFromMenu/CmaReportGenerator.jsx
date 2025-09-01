import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useState, useEffect } from "react";

const CmaReportGenerator = ({ formData }) => {
  const [revenueReducePercentage, setRevenueReducePercentage] = useState(10);
  const [expenseIncreasePercentage, setExpenseIncreasePercentage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Handle change in revenue reduce percentage input field
  const handleRevenueReduceChange = (e) => {
    const value = parseFloat(e.target.value);
    if (value >= 0 && value <= 100) {
      setRevenueReducePercentage(value);
    }
  };

  const handleExpenseIncreaseChange = (e) => {
    const value = parseFloat(e.target.value);
    if (value >= 0 && value <= 100) {
      setExpenseIncreasePercentage(value);
    }
  };

  const localData = formData;
  const userRole = localStorage.getItem("userRole");
  const userName =
    localStorage.getItem("adminName") || localStorage.getItem("employeeName");

  const navigate = useNavigate();
  const [permissions, setPermissions] = useState({
    generateReport: false,
    updateReport: false,
    createNewWithExisting: false,
    downloadPDF: false,
    exportData: false,
    generateGraph: false,
    advanceReport: false,
    generateWord: false,
  });

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        setIsLoading(true);
        const [empRes, adminRes] = await Promise.all([
          fetch("https://reportsbe.sharda.co.in/api/employees"),
          fetch("https://reportsbe.sharda.co.in/api/admins"),
        ]);

        if (!empRes.ok || !adminRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const employeeList = await empRes.json();
        const adminList = await adminRes.json();

        const normalizedUserName = userName?.trim().toLowerCase();

        if (userRole === "admin") {
          // Set all permissions to true for admin role
          setPermissions({
            generateReport: true,
            updateReport: true,
            createNewWithExisting: true,
            downloadPDF: true,
            exportData: true,
            createReport: true,
            generateGraph: true,
            advanceReport: true,
            generateWord: true,
            cmaData: true,
          });
          return;
        }

        if (userRole === "employee") {
          const employee = employeeList.find(
            (emp) =>
              emp.name?.trim().toLowerCase() === normalizedUserName ||
              emp.email?.trim().toLowerCase() === normalizedUserName ||
              emp.employeeId?.trim().toLowerCase() === normalizedUserName
          );

          if (employee?.permissions) {
            setPermissions(employee.permissions);
          }
        }
      } catch (err) {
        console.error("Error fetching permissions:", err.message);
        Swal.fire({
          icon: "error",
          title: "Connection Error",
          text: "Could not fetch permissions. Some features may be limited.",
          timer: 2000,
          showConfirmButton: false,
          background: "#fef3f2",
          color: "#1f2937"
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (userRole && userName) {
      fetchPermissions();
    }
  }, [userRole, userName]);

  const buttonClass = (permission) => {
    return permissions[permission]
      ? "flex items-center justify-center bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white font-medium rounded-xl px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 w-full group"
      : "flex items-center justify-center bg-gray-200 text-gray-500 rounded-xl px-6 py-3 shadow-md cursor-not-allowed opacity-70 w-full";
  };

  const handleMenuCmaGenerate = () => {
    const isComputedDataEmpty =
      !formData.computedData ||
      (typeof formData.computedData === "object" &&
        Object.keys(formData.computedData).length === 0);

    if (isComputedDataEmpty) {
      Swal.fire({
        icon: "error",
        title: "Missing Financial Data",
        text: "Please generate and download your financial data first.",
        confirmButtonColor: "#6366f1",
        background: "#fff",
        timer: 1600,
        showConfirmButton: false,
      });
      return;
    }

    localStorage.setItem("cmaAdvanceFormData", JSON.stringify(formData));
    localStorage.setItem("cmaSource", "menu-bar");
    localStorage.setItem("revenueReducePercentage", revenueReducePercentage);
    localStorage.setItem("expenseIncreasePercentage", expenseIncreasePercentage);
    
    // Show loading animation before opening new tab
    setIsLoading(true);
    setTimeout(() => {
      window.open("/cma-advance-report", "_blank", "noopener,noreferrer");
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-xl flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-gray-700 dark:text-gray-300 font-medium">Processing your request...</p>
          </div>
        </div>
      )}

      <div className="flex flex-col space-y-4">
        {/* Header Section - Made more compact */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-teal-100 to-blue-100 dark:from-teal-900 dark:to-blue-900 rounded-xl mb-2">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-8 w-8 text-teal-600 dark:text-teal-300" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1 bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
            CMA Report Generator
          </h2>
          <p className="text-xs text-gray-600 dark:text-gray-300">
            Generate comprehensive Comparative Market Analysis reports
          </p>
        </div>

        {/* Configuration Panel - Made more compact */}
        <div className="w-full bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-3 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-teal-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            Scenario Parameters
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Revenue Reduction Input */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                Revenue Reduction (%)
              </label>
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={revenueReducePercentage}
                  onChange={handleRevenueReduceChange}
                  className="w-full h-1.5 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-teal-500"
                />
                <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400 px-0.5 mt-0.5">
                  <span>0</span>
                  <span>50</span>
                  <span>100</span>
                </div>
              </div>
              <div className="flex items-center mt-1">
                <input
                  type="number"
                  value={revenueReducePercentage}
                  onChange={handleRevenueReduceChange}
                  min={0}
                  max={100}
                  className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-center font-medium text-teal-700 dark:text-teal-300 bg-white dark:bg-gray-700 focus:ring-1 focus:ring-teal-500 focus:border-transparent"
                />
                <span className="ml-1 text-xs text-gray-600 dark:text-gray-400">%</span>
              </div>
            </div>

            {/* Expense Increase Input */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                Expense Increase (%)
              </label>
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={expenseIncreasePercentage}
                  onChange={handleExpenseIncreaseChange}
                  className="w-full h-1.5 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400 px-0.5 mt-0.5">
                  <span>0</span>
                  <span>50</span>
                  <span>100</span>
                </div>
              </div>
              <div className="flex items-center mt-1">
                <input
                  type="number"
                  value={expenseIncreasePercentage}
                  onChange={handleExpenseIncreaseChange}
                  min={0}
                  max={100}
                  className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-center font-medium text-blue-700 dark:text-blue-300 bg-white dark:bg-gray-700 focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="ml-1 text-xs text-gray-600 dark:text-gray-400">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleMenuCmaGenerate}
          className={buttonClass("cmaData")}
          disabled={!permissions.cmaData || isLoading}
          title={
            !permissions.cmaData
              ? "You do not have permission to generate CMA Data."
              : "Generate CMA Report with selected parameters"
          }
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              <span className="text-sm">Processing...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 group-hover:scale-110 transition-transform"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm">Generate CMA Report</span>
            </div>
          )}
        </button>

        {/* Status Indicator - Made more compact */}
        <div className={`flex items-center justify-center p-2 rounded-lg ${formData ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'} transition-colors duration-300`}>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-3 w-3 mr-1" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            {formData ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            )}
          </svg>
          <span className="text-xs font-medium">
            {formData
              ? "Data loaded and ready for report generation"
              : "No financial data available"}
          </span>
        </div>
      </div>

      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          cursor: pointer;
        }
        
        input[type="range"]::-webkit-slider-thumb {
          background: #0d9488;
          box-shadow: 0 0 2px 0 #555;
        }
        
        input[type="range"]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #0d9488;
          cursor: pointer;
          border: none;
        }
        
        .accent-teal-500::-webkit-slider-thumb {
          background: #0d9488;
        }
        
        .accent-blue-500::-webkit-slider-thumb {
          background: #3b82f6;
        }
      `}</style>
    </div>
  );
};

export default CmaReportGenerator;