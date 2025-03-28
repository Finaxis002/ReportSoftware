import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx"; // ✅ Import xlsx library

const FinalStep = ({ formData, userName , userRole}) => {
  const [permissions, setPermissions] = useState({
     createReport: false,
     updateReport: false,
     createNewWithExisting: false,
     downloadPDF: false,
     exportData: false, // ✅ Add this
   });

  const navigate = useNavigate();
  const [isPDFLoaded, setIsPDFLoaded] = useState(false);
  const [showError, setShowError] = useState(false);
  const [selectedOption, setSelectedOption] = useState("select option");
  const [isLoading, setIsLoading] = useState(false);

  const iframeRef = useRef(null);
  let timeoutId = useRef(null);
  let isComponentMounted = useRef(true);

  useEffect(() => {
    if (selectedOption !== "select option") {
      localStorage.setItem("pdfType", selectedOption);
    }
  }, [selectedOption]);

  useEffect(() => {
    isComponentMounted.current = true;

    // ✅ Cleanup on unmount
    return () => {
      console.log("🧹 Cleaning up FinalStep...");
      isComponentMounted.current = false;

      // ✅ Clear timeout
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
        timeoutId.current = null;
      }

      // ✅ Reset iframe source to prevent load event triggering
      if (iframeRef.current) {
        iframeRef.current.src = "";
      }
    };
  }, []);

  const handleIframeLoad = () => {
    if (!isComponentMounted.current) return; // ✅ Exit if component unmounted

    console.log("✅ PDF Loaded Successfully");
    setIsPDFLoaded(true);
    setIsLoading(false);

    timeoutId.current = setTimeout(() => {
      if (isComponentMounted.current) {
        console.log("✅ Navigating to /checkprofit after delay...");
        navigate("/checkprofit");
      }
    }, 10000);
  };

  // ✅ Utility function to flatten nested objects
  const flattenObject = (obj, parentKey = "", result = {}) => {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = parentKey ? `${parentKey}.${key}` : key;

        if (Array.isArray(obj[key])) {
          // ✅ If it's an array (like years), keep as an array for row-wise format
          result[newKey] = obj[key];
        } else if (typeof obj[key] === "object" && obj[key] !== null) {
          if (obj[key] instanceof File) {
            result[newKey] = `File Attached: ${obj[key].name}`;
          } else {
            flattenObject(obj[key], newKey, result);
          }
        } else {
          result[newKey] =
            obj[key] !== undefined && obj[key] !== null
              ? obj[key].toString()
              : "";
        }
      }
    }
    return result;
  };

  const handleExportData = () => {
    if (!formData) return;

    // ✅ Flatten the object for easy processing
    const flattenedData = flattenObject(formData);

    // ✅ Split data into separate components (sheets)
    const sections = {
      "Account Information": {},
      "Means of Finance": {},
      "Cost of Project": {},
      Expenses: {},
      Revenue: {},
      "More Details": {},
      "Other Data": {},
    };

    // ✅ Categorize data based on prefix (like "AccountInformation")
    Object.keys(flattenedData).forEach((key) => {
      if (key.startsWith("AccountInformation")) {
        sections["Account Information"][
          key.replace("AccountInformation.", "")
        ] = flattenedData[key];
      } else if (key.startsWith("MeansOfFinance")) {
        sections["Means of Finance"][key.replace("MeansOfFinance.", "")] =
          flattenedData[key];
      } else if (key.startsWith("CostOfProject")) {
        sections["Cost of Project"][key.replace("CostOfProject.", "")] =
          flattenedData[key];
      } else if (key.startsWith("Expenses")) {
        sections["Expenses"][key.replace("Expenses.", "")] = flattenedData[key];
      } else if (key.startsWith("Revenue")) {
        sections["Revenue"][key.replace("Revenue.", "")] = flattenedData[key];
      } else if (key.startsWith("MoreDetails")) {
        sections["More Details"][key.replace("MoreDetails.", "")] =
          flattenedData[key];
      } else {
        sections["Other Data"][key] = flattenedData[key];
      }
    });

    // ✅ Create workbook
    const workbook = XLSX.utils.book_new();

    // ✅ Function to format key-value pairs into a worksheet
    const addKeyValueSheet = (data, sheetName) => {
      const rows = [["Key", "Value"]]; // Header row

      Object.keys(data).forEach((key) => {
        if (Array.isArray(data[key])) {
          // ✅ If it's an array (like years), format row-wise
          rows.push([key, ...data[key]]);
        } else {
          rows.push([key, data[key]]);
        }
      });

      const worksheet = XLSX.utils.aoa_to_sheet(rows);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    };

    // ✅ Function to format array-based data in a structured table format
    const addArraySheet = (data, sheetName) => {
      const headerRow = [
        "Parameter",
        "Year 1",
        "Year 2",
        "Year 3",
        "Year 4",
        "Year 5",
      ];
      const rows = [headerRow];

      Object.keys(data).forEach((key) => {
        if (Array.isArray(data[key])) {
          rows.push([key, ...data[key]]);
        }
      });

      const worksheet = XLSX.utils.aoa_to_sheet(rows);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    };

    // ✅ Add individual sheets for each section
    if (Object.keys(sections["Account Information"]).length > 0) {
      addKeyValueSheet(sections["Account Information"], "Account Info");
    }

    if (Object.keys(sections["Means of Finance"]).length > 0) {
      addKeyValueSheet(sections["Means of Finance"], "Means of Finance");
    }

    if (Object.keys(sections["Cost of Project"]).length > 0) {
      addKeyValueSheet(sections["Cost of Project"], "Cost of Project");
    }

    if (Object.keys(sections["Expenses"]).length > 0) {
      addArraySheet(sections["Expenses"], "Expenses");
    }

    if (Object.keys(sections["Revenue"]).length > 0) {
      addArraySheet(sections["Revenue"], "Revenue");
    }

    if (Object.keys(sections["More Details"]).length > 0) {
      addKeyValueSheet(sections["More Details"], "More Details");
    }

    if (Object.keys(sections["Other Data"]).length > 0) {
      addKeyValueSheet(sections["Other Data"], "Other Data");
    }

    // ✅ Save the file
    XLSX.writeFile(workbook, "exported-data.xlsx");
  };

  const handleCheckProfit = () => {
    console.log("🚀 Triggering PDF Load...");
    setIsPDFLoaded(false);
    setIsLoading(true);

    // ✅ Open the popup window with specific size and position
    const popup = window.open(
      "",
      "popupWindow",
      "width=800,height=600,left=200,top=200,resizable=no,scrollbars=yes"
    );

    if (!popup) {
      alert("Popup blocked. Please allow popups for this site.");
      return;
    }

    if (iframeRef.current) {
      // ✅ Load the generated PDF
      iframeRef.current.src = `/generated-pdf?t=${Date.now()}`;

      // ✅ Fallback timeout after 15 seconds
      timeoutId.current = setTimeout(() => {
        if (isComponentMounted.current && popup) {
          console.log("⏳ Navigating to checkprofit after timeout...");
          setIsPDFLoaded(true);
          setIsLoading(false);

          // ✅ Open checkprofit in the popup window
          popup.location.href = "/checkprofit";
        }
      }, 15000);

      // ✅ Handle iframe load for early completion
      iframeRef.current.onload = () => {
        if (!isComponentMounted.current) return;
        console.log("✅ PDF Loaded Successfully");

        clearTimeout(timeoutId.current);
        timeoutId.current = null;
        setIsPDFLoaded(true);
        setIsLoading(false);

        // ✅ Navigate the popup window after PDF load
        setTimeout(() => {
          if (isComponentMounted.current && popup) {
            console.log("🚀 Opening checkprofit in popup...");
            popup.location.href = "/checkprofit";
          }
        }, 3000);
      };
    }

    // ✅ Save last step to localStorage
    localStorage.setItem("lastStep", 8);
  };

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        // Fetching all employees
        const response = await fetch(
          "https://backend-three-pink.vercel.app/api/employees"
        );

        // Check if the response is successful
        if (!response.ok) {
          throw new Error("Failed to fetch employees");
        }

        const result = await response.json();
        console.log("✅ Fetched Employees Data:", result);

        const employees = Array.isArray(result) ? result : [];

        // Assign permissions based on userRole
        if (userRole === "admin") {
          setPermissions({
            createReport: true,
            updateReport: true,
            createNewWithExisting: true,
            downloadPDF: true,
          });
          console.log("✅ Admin permissions granted");
        } else if (userRole === "employee") {
          // Normalize the userName to lowercase and trim spaces
          const normalizedUserName = userName?.trim().toLowerCase();

          // Find the employee based on name, email, or employeeId
          const employee = employees.find(
            (emp) =>
              emp.name?.trim().toLowerCase() === normalizedUserName ||
              emp.email?.trim().toLowerCase() === normalizedUserName ||
              emp.employeeId?.trim().toLowerCase() === normalizedUserName
          );

          // Set permissions if employee is found
          if (employee && employee.permissions) {
            setPermissions(employee.permissions);
            console.log(
              "✅ Permissions fetched for employee:",
              employee.permissions
            );
          } else {
            console.warn(
              "⚠️ No matching employee found or permissions missing"
            );
          }
        }
      } catch (err) {
        console.error("🔥 Error fetching permissions:", err.message);
      }
    };

    // Fetch permissions when the component mounts or when userRole/userName changes
    fetchPermissions();
  }, [userRole, userName]);

  console.log(permissions)

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg form-scroll">
      <h2 className="text-2xl font-semibold text-gray-700 mb-6">
        Final Step: Generate PDF
      </h2>
      <p className="text-gray-600 mb-4">
        Review the information and click the button below to proceed.
      </p>

      {/* ✅ Dropdown Selection */}
      {/* <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">
          Select PDF Type:
        </label>
        <select
          value={selectedOption}
          onChange={(e) => {
            setSelectedOption(e.target.value);

            if (
              e.target.value === "CA Certified" &&
              (!formData?.ProjectReportSetting?.UDINNumber ||
                formData?.ProjectReportSetting?.UDINNumber.trim() === "")
            ) {
              setShowError(true);
            } else {
              setShowError(false);
            }
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="select option">Select Report Type</option>
          <option value="Sharda Associates">Sharda Associates</option>
          <option value="CA Certified">CA Certified</option>
          <option value="Finaxis">Finaxis</option>
        </select>

        
        {showError && (
          <div className="mt-2 text-red-600">
            <p>UDIN number is not available.</p>
            <button
              onClick={() => setCurrentStep(4)}
              className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Go to Project Report Settings
            </button>
          </div>
        )}
      </div> */}

      <div className="flex gap-5">
        {/* ✅ Generate PDF Button */}
        <button
          onClick={() => window.open("/generated-pdf", "_blank")}
          className="mt-4 bg-indigo-600 text-white py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Generate PDF
        </button>

        {/* ✅ Check Profit Button */}
        <button
          onClick={handleCheckProfit}
          className="mt-4 bg-green-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {isLoading ? "Loading..." : "Check Profit"}
        </button>

        {/* ✅ New Export Data Button */}
        {(userRole === "admin" || permissions.exportData) && (
          <button
            onClick={handleExportData}
            className="mt-4 bg-orange-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            Export Data
          </button>
        )}
      </div>

      {/* ✅ Hidden Iframe */}
      <iframe
        ref={iframeRef}
        src=""
        style={{ width: "0px", height: "0px", border: "none", display: "none" }}
        onLoad={handleIframeLoad}
      />
    </div>
  );
};

export default FinalStep;
