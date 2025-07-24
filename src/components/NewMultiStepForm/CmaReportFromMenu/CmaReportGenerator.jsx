import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useState, useEffect } from "react";

const CmaReportGenerator = ({ formData }) => {
  const [revenueReducePercentage, setRevenueReducePercentage] = useState(10);
  const [expenseIncreasePercentage, setExpenseIncreasePercentage] = useState(10);

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
  console.log("formData", formData);
  const userRole = localStorage.getItem("userRole");
  const userName =
    localStorage.getItem("adminName") || localStorage.getItem("employeeName");
  console.log("userName", userName);

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
          console.log("Setting all permissions to true for admin!");
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
      }
    };

    if (userRole && userName) {
      fetchPermissions();
    }
  }, [userRole, userName]);

  const buttonClass = (permission) => {
    return permissions[permission]
      ? "flex items-center bg-gradient-to-br from-green-500 to-green-300 text-white rounded-lg px-6 py-2 shadow-md hover:scale-105 transition-all"
      : "flex items-center bg-gray-300 text-gray-500 rounded-lg px-6 py-2 shadow-md cursor-not-allowed opacity-50";
  };

  const handleMenuCmaGenerate = () => {
    const isComputedDataEmpty =
      !formData.computedData ||
      (typeof formData.computedData === "object" &&
        Object.keys(formData.computedData).length === 0);

    if (isComputedDataEmpty) {
      // You can use Swal or alert:
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
    window.open("/cma-advance-report", "_blank", "noopener,noreferrer");
    localStorage.setItem("revenueReducePercentage", revenueReducePercentage);
    localStorage.setItem("expenseIncreasePercentage", expenseIncreasePercentage);
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

        <div>
          <label>Revenue Reduction Percentage</label>
          <input
            type="number"
            value={revenueReducePercentage}
            onChange={handleRevenueReduceChange}
            min={0}
            max={100}
          />
        </div>

         <div>
          <label>Expense Increase Percentage</label>
          <input
            type="number"
            value={expenseIncreasePercentage}
            onChange={handleExpenseIncreaseChange}
            min={0}
            max={100}
          />
        </div>
        <div className="w-full border-t border-gray-200 dark:border-gray-700 my-4"></div>

        <button
          onClick={handleMenuCmaGenerate}
          className={buttonClass("cmaData")}
          disabled={!permissions.cmaData}
          title={
            !permissions.cmaData
              ? "You do not have permission to generate CMA Data."
              : ""
          }
          // className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium rounded-lg shadow-lg "
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
