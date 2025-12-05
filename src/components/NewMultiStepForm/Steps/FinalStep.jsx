import React, { useState, useEffect, useRef } from "react";
import { cleanFormDataArrays } from "../Utils/arrayCleaner";

import * as XLSX from "xlsx"; // ✅ Import xlsx library
import GraphGenerator from "../GraphGenerator";

import IntroPage from "../IntroPage";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const FinalStep = ({ formData, userRole }) => {
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
  const [showAdvanced, setShowAdvanced] = useState(false);
  const userName =
    localStorage.getItem("adminName") || localStorage.getItem("employeeName");

  const [isPDFLoaded, setIsPDFLoaded] = useState(false);
  const [showError, setShowError] = useState(false);
  const [selectedOption, setSelectedOption] = useState("select option");
  const [selectedColor, setSelectedColor] = useState("select color");
  const [isLoading, setIsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedFont, setSelectedFont] = useState(
    localStorage.getItem("selectedFont") || "Roboto"
  );

  const iframeRef = useRef(null);
  let timeoutId = useRef(null);
  let isComponentMounted = useRef(true);

    const cleanedFormData = React.useMemo(() => {
    return cleanFormDataArrays(formData);
  }, [formData]);

  useEffect(() => {
    if (selectedOption !== "select option") {
      localStorage.setItem("pdfType", selectedOption);
    } else {
      localStorage.removeItem("pdfType");
      localStorage.removeItem("selectedColor");
    }
  }, [selectedOption]);

  useEffect(() => {
    if (selectedColor !== "select color") {
      localStorage.setItem("selectedColor", selectedColor);
    } else {
      localStorage.removeItem("selectedColor");
    }
  }, [selectedColor]);

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

    // timeoutId.current = setTimeout(() => {
    //   if (isComponentMounted.current) {
    //     console.log("✅ Navigating to /checkprofit after delay...");
    //     navigate("/checkprofit");
    //   }
    // }, 10000);
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
     if (!cleanedFormData) return;
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

    // ✅ Add individual sheets for each section
    if (Object.keys(sections["Account Information"]).length > 0) {
      addKeyValueSheet(sections["Account Information"], "Account Info");
    }

    if (Object.keys(sections["Means of Finance"]).length > 0) {
      addKeyValueSheet(sections["Means of Finance"], "Means of Finance");
    }

    if (formData?.CostOfProject) {
      const rows = [["Name", "Amount", "Rate"]];
      Object.values(formData.CostOfProject)
        .filter(
          (item) =>
            typeof item === "object" &&
            item !== null &&
            "name" in item &&
            "amount" in item
        )
        .forEach((item) => {
          rows.push([item.name, item.amount, item.rate]);
        });
      const worksheet = XLSX.utils.aoa_to_sheet(rows);
      XLSX.utils.book_append_sheet(workbook, worksheet, "Cost of Project");
    }

    if (formData?.Expenses) {
      const worksheetData = [];

      // 1️⃣ Normal Expenses
      if (Array.isArray(formData.Expenses.normalExpense)) {
        worksheetData.push(["Normal Expenses"]); // Section heading
        worksheetData.push(["Name", "Amount", "Quantity", "Value", "Type"]); // Headers

        formData.Expenses.normalExpense.forEach((item) => {
          if (item?.name) {
            worksheetData.push([
              item.name,
              item.amount ?? "",
              item.quantity ?? "",
              item.value ?? "",
              item.type ?? "normal",
            ]);
          }
        });

        worksheetData.push([]); // Spacer row
      }

      // 2️⃣ Direct Expenses
      if (Array.isArray(formData.Expenses.directExpense)) {
        worksheetData.push(["Direct Expenses"]); // Section heading
        worksheetData.push(["Name", "Value", "Type"]); // Headers

        formData.Expenses.directExpense.forEach((item) => {
          if (item?.name) {
            worksheetData.push([
              item.name,
              item.value ?? "",
              item.type ?? "direct",
            ]);
          }
        });
      }

      // ✅ Create worksheet and add it
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");
    }

    if (formData?.Revenue) {
      const revenueData = formData.Revenue;
      const revenueSheet = [];

      // 1️⃣ Form Fields (if exists)
      if (Array.isArray(revenueData.formFields)) {
        revenueSheet.push(["Form Fields"]);
        revenueSheet.push([
          "Index",
          "Particular",
          "Serial Number",
          "Row Type",
          "Increase By",
          "Year 1",
          "Year 2",
          "Year 3",
          "Year 4",
          "Year 5",
        ]);

        revenueData.formFields.forEach((item, i) => {
          revenueSheet.push([
            i + 1,
            item.particular ?? "",
            item.serialNumber ?? "",
            item.rowType ?? "",
            item.increaseBy ?? "",
            ...(Array.isArray(item.years) ? item.years.slice(0, 5) : []),
          ]);
        });

        revenueSheet.push([]);
      }

      // 2️⃣ Form Fields 2 (if exists)
      if (Array.isArray(revenueData.formFields2)) {
        revenueSheet.push(["Form Fields 2"]);
        revenueSheet.push([
          "Index",
          "Particular",
          "Amount",
          "Increase By",
          "Year 1",
          "Year 2",
          "Year 3",
          "Year 4",
          "Year 5",
        ]);

        revenueData.formFields2.forEach((item, i) => {
          revenueSheet.push([
            i + 1,
            item.particular ?? "",
            item.amount ?? "",
            item.increaseBy ?? "",
            ...(Array.isArray(item.years) ? item.years.slice(0, 5) : []),
          ]);
        });

        revenueSheet.push([]);
      }

      // 3️⃣ Total Revenue For Others
      if (Array.isArray(revenueData.totalRevenueForOthers)) {
        revenueSheet.push(["Total Revenue For Others"]);
        revenueSheet.push(["Year 1", "Year 2", "Year 3", "Year 4", "Year 5"]);
        revenueSheet.push(revenueData.totalRevenueForOthers.slice(0, 5));
        revenueSheet.push([]);
      }

      // 4️⃣ Total Monthly Revenue
      if (Array.isArray(revenueData.totalMonthlyRevenue)) {
        revenueSheet.push(["Total Monthly Revenue"]);
        revenueSheet.push(["Year 1", "Year 2", "Year 3", "Year 4", "Year 5"]);
        revenueSheet.push(revenueData.totalMonthlyRevenue.slice(0, 5));
        revenueSheet.push([]);
      }

      // 5️⃣ No. of Months
      if (Array.isArray(revenueData.noOfMonths)) {
        revenueSheet.push(["No. of Months"]);
        revenueSheet.push(["Year 1", "Year 2", "Year 3", "Year 4", "Year 5"]);
        revenueSheet.push(revenueData.noOfMonths.slice(0, 5));
        revenueSheet.push([]);
      }

      // 6️⃣ Total Revenue
      if (Array.isArray(revenueData.totalRevenue)) {
        revenueSheet.push(["Total Revenue"]);
        revenueSheet.push(["Year 1", "Year 2", "Year 3", "Year 4", "Year 5"]);
        revenueSheet.push(revenueData.totalRevenue.slice(0, 5));
        revenueSheet.push([]);
      }

      // 7️⃣ Form Type
      revenueSheet.push(["Form Type", revenueData.formType ?? ""]);

      // ✅ Create and append the worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(revenueSheet);
      XLSX.utils.book_append_sheet(workbook, worksheet, "Revenue");
    }

    if (formData?.MoreDetails && Object.keys(formData.MoreDetails).length > 0) {
      const moreDetails = formData.MoreDetails;
      const rows = [];

      const addSectionHeader = (title) => {
        rows.push([title]);
        rows.push([]); // Empty row
      };

      const addArrayTable = (label, array = []) => {
        const header = ["Particular", ...array.map((_, i) => `Year ${i + 1}`)];
        rows.push(header);
        rows.push([label, ...array]);
        rows.push([]);
      };

      const addStructuredRows = (title, dataArray) => {
        addSectionHeader(title);
        if (Array.isArray(dataArray)) {
          const yearCount =
            dataArray.find((item) => Array.isArray(item?.years))?.years
              .length || 8;
          const header = [
            "Particular",
            ...Array.from({ length: yearCount }, (_, i) => `Year ${i + 1}`),
          ];
          rows.push(header);

          dataArray.forEach((item) => {
            if (item?.particular && Array.isArray(item.years)) {
              rows.push([item.particular, ...item.years]);
            }
          });

          rows.push([]);
        }
      };

      // 👉 Export currentAssets and currentLiabilities
      addStructuredRows("Current Assets", moreDetails.currentAssets || []);
      addStructuredRows(
        "Current Liabilities",
        moreDetails.currentLiabilities || []
      );

      // 👉 Export other raw arrays (openingStock, closingStock, withdrawals, etc.)
      [
        "openingStock",
        "closingStock",
        "withdrawals",
        "Withdrawals",
        "OpeningStock",
        "ClosingStock",
      ].forEach((key) => {
        if (Array.isArray(moreDetails[key])) {
          addArrayTable(key, moreDetails[key]);
        }
      });

      // 👉 Convert to sheet and append to workbook
      const worksheet = XLSX.utils.aoa_to_sheet(rows);
      XLSX.utils.book_append_sheet(workbook, worksheet, "More Details");
    }

    if (
      formData?.ProjectReportSetting &&
      Object.keys(formData.ProjectReportSetting).length > 0
    ) {
      const rows = [["Key", "Value"]]; // Header row
      Object.entries(formData.ProjectReportSetting).forEach(([key, value]) => {
        rows.push([key, value]);
      });
      const worksheet = XLSX.utils.aoa_to_sheet(rows);
      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Project Report Setting"
      );
    }

    // ✅ Save the file
    XLSX.writeFile(workbook, "exported-data.xlsx");
  };

  const handleCheckProfit = async () => {
    
    console.log("🚀 Triggering PDF Load...");
    setIsPDFLoaded(false);
    setIsLoading(true);

    const reportTitle = cleanedFormData?.AccountInformation?.businessName || "Untitled";
    const sessionId =
      localStorage.getItem("activeSessionId") || formData?.sessionId;

    let reportId = null;

    // ✅ Try to fetch reportId via sessionId
    try {
      const res = await fetch(
        `https://reportsbe.sharda.co.in/api/activity/get-report-id?sessionId=${sessionId}`
      );
      const data = await res.json();
      if (data?.reportId) {
        reportId = data.reportId;
      }
    } catch (err) {
      console.warn("⚠️ Could not fetch reportId for check_profit log");
    }
    const reportOwner = formData?.AccountInformation?.businessOwner || "";
    // ✅ Log activity
    try {
      await fetch("https://reportsbe.sharda.co.in/api/activity/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "check_profit",
          reportTitle,
          reportId,
          reportOwner, // ✅ send this
          performedBy: {
            name: userName || "Unknown",
            role: userRole || "unknown",
          },
        }),
      });
      console.log("✅ Logged 'check_profit' activity");
    } catch (error) {
      console.warn("❌ Failed to log 'check_profit' activity:", error);
    }

    // ✅ Continue opening checkprofit
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
      iframeRef.current.src = `/generated-pdf?t=${Date.now()}`;

      timeoutId.current = setTimeout(() => {
        if (isComponentMounted.current && popup) {
          popup.location.href = "/checkprofit";
        }
      }, 15000);

      iframeRef.current.onload = () => {
        clearTimeout(timeoutId.current);
        timeoutId.current = null;
        if (isComponentMounted.current && popup) {
          setTimeout(() => {
            popup.location.href = "/checkprofit";
          }, 3000);
        }
      };
    }

    localStorage.setItem("lastStep", 8);
  };

  // useEffect(() => {
  //   const fetchPermissions = async () => {
  //     try {
  //       const [empRes, adminRes] = await Promise.all([
  //         fetch("https://reportsbe.sharda.co.in/api/employees"),
  //         fetch("https://reportsbe.sharda.co.in/api/admins"),
  //       ]);

  //       if (!empRes.ok || !adminRes.ok) {
  //         throw new Error("Failed to fetch data");
  //       }

  //       const employeeList = await empRes.json();
  //       const adminList = await adminRes.json();

  //       const normalizedUserName = userName?.trim().toLowerCase();

  //       if (userRole === "admin") {
  //         const storedAdminName = localStorage.getItem("adminName");

  //         if (!storedAdminName) {
  //           setPermissions({
  //             generateReport: true,
  //             updateReport: true,
  //             createNewWithExisting: true,
  //             downloadPDF: true,
  //             exportData: true,
  //             createReport: true,
  //             generateGraph: true,
  //             advanceReport: true,
  //             generateWord: true,
              
  //           });
  //           return;
  //         }

  //         const admin = adminList.find(
  //           (a) =>
  //             a.username?.trim().toLowerCase() === normalizedUserName ||
  //             a.adminId?.trim().toLowerCase() === normalizedUserName
  //         );

  //         if (admin?.permissions) {
  //           setPermissions(admin.permissions);
  //         }
  //       }

  //       if (userRole === "employee") {
  //         const employee = employeeList.find(
  //           (emp) =>
  //             emp.name?.trim().toLowerCase() === normalizedUserName ||
  //             emp.email?.trim().toLowerCase() === normalizedUserName ||
  //             emp.employeeId?.trim().toLowerCase() === normalizedUserName
  //         );

  //         if (employee?.permissions) {
  //           setPermissions(employee.permissions);
  //         }
  //       }
  //     } catch (err) {
  //       console.error("Error fetching permissions:", err.message);
  //     }
  //   };

  //   fetchPermissions(); // 🔁 Only fetch once when dependencies change
  // }, [userRole, userName]);

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

  const getColorHex = (color) => {
    const colorMap = {
      Red: "#ef4444", // Tailwind red-500 (vibrant)
      Blue: "#3b82f6", // Tailwind blue-500
      Green: "#22c55e", // Tailwind green-500
      Purple: "#8b5cf6", // Tailwind purple-500
      SkyBlue: "#0ea5e9", // Tailwind sky-500
      Orange: "#f97316", // Tailwind orange-500
      Pink: "#ec4899", // Tailwind pink-500
      Teal: "#14b8a6", // Tailwind teal-500
    };

    return colorMap[color] || "#172554"; // default fallback (dark blue)
  };

  useEffect(() => {
    const handleUnload = () => {
      localStorage.removeItem("selectedColor");
      setSelectedColor("select color"); // <-- Reset state to default
    };

    window.addEventListener("beforeunload", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);

    const handleColorChange = (color) => {
    setSelectedColor(color);

    // Update formData in localStorage with the new color
    if (formData) {
      const updatedFormData = {
        ...formData,
        color: color !== "select color" ? color : null
      };

      // Update localStorage
      localStorage.setItem("formData", JSON.stringify(updatedFormData));

      // Also update the state if you're using it elsewhere
      // Note: You might need to lift this state up or use context
      // if you need the updated formData in parent components
    }
  };


  const handleGeneratePdfClick = async () => {
    try {
      console.log("🚀 Logging 'generated-pdf' activity...");

       const reportTitle = cleanedFormData?.AccountInformation?.businessName || "Untitled"; 
      const sessionId =
        localStorage.getItem("activeSessionId") || formData?.sessionId;

      let reportId = null;

      // ✅ Try to fetch reportId via sessionId
      try {
        const res = await fetch(
          `https://reportsbe.sharda.co.in/api/activity/get-report-id?sessionId=${sessionId}`
        );
        const data = await res.json();
        if (data?.reportId) {
          reportId = data.reportId;
        }
      } catch (err) {
        console.warn("⚠️ Could not fetch reportId for generated_pdf log");
      }
      const reportOwner = formData?.AccountInformation?.businessOwner || "";
      // ✅ Log activity
      try {
        await fetch("https://reportsbe.sharda.co.in/api/activity/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "generated_pdf",
            reportTitle,
            reportId,
            reportOwner, // ✅ send this
            performedBy: {
              name: userName || "Unknown",
              role: userRole || "unknown",
            },
          }),
        });
        console.log("✅ Logged 'generated_pdf' activity");
      } catch (error) {
        console.warn("❌ Failed to log 'generated_pdf' activity:", error);
      }

      console.log("✅ Logged 'generated-pdf' activity");

      // ✅ Open PDF in new tab
      window.open("/generated-pdf", "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("❌ Failed to log 'generated-pdf' activity:", error);
    }
  };

  // Helper function to update ONLY formData in localStorage
const updateFormDataInLocalStorage = (updates) => {
  try {
    // Get existing formData from localStorage
    const existingFormDataStr = localStorage.getItem("formData");
    const existingFormData = existingFormDataStr ? JSON.parse(existingFormDataStr) : {};
    
    // Merge with updates
    const updatedFormData = {
      ...existingFormData,
      ...updates
    };
    
    // Save back to localStorage
    localStorage.setItem("formData", JSON.stringify(updatedFormData));
    console.log("✅ Updated formData in localStorage with:", updates);
  } catch (error) {
    console.error("❌ Failed to update formData in localStorage:", error);
  }
};
  return (
    <div className="max-w-full mx-auto p-6 bg-white shadow-lg rounded-lg form-scroll">
      <h2 className="text-3xl font-semibold text-gray-700 mb-6">
        Final Step: Generate PDF
      </h2>
      <p className="text-gray-600 mb-4">
        Review the information and click the button below to proceed.
      </p>

      {/* PDF Type Dropdown */}
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          Select PDF Type:
        </label>
        <select
          value={selectedOption}
          onChange={(e) => setSelectedOption(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="select option">Select Report Type</option>
          <option value="Other">Other</option>
        </select>
      </div>

       {/* Color Picker and Font Dropdown */}
        {selectedOption === "Other" && (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-gray-700 font-medium">
                Select Color:
              </label>
              <div className="flex flex-wrap gap-4">
                {[
                  "Red",
                  "Blue",
                  "Green",
                  "Purple",
                  "SkyBlue",
                  "Orange",
                  "Teal",
                ].map((color) => (
                  <label
                    key={color}
                    className={`flex items-center gap-1 px-2 py-2 rounded-md border cursor-pointer 
      ${selectedColor === color
                        ? "border-2 border-indigo-600 bg-indigo-50 scale-105 shadow-md"
                        : "border-gray-300"
                      } 
      hover:shadow-sm`}
                    onClick={() => handleColorChange(color)}
                  >
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: color }}
                    ></div>
                    <span className="text-sm">{color}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-4 mb-6">

              {/* Hex Color Input */}
              <div className="flex-1">
                <label className="block text-gray-700 font-medium">
                  Or enter custom HEX code:
                </label>
                <input
                  type="text"
                  value={selectedColor}
                  onChange={(e) => {
                    const color = e.target.value;
                    handleColorChange(color);
                  }}
                  className="border border-gray-300 rounded-md px-4 py-2 w-full"
                  placeholder="#000000"
                />
              </div>

               {/* Font Selection */}
<div className="flex-1">
  <label className="block text-gray-700 font-medium">
    Choose Font:
  </label>
  <select
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
    value={selectedFont}
    onChange={(e) => {
      const font = e.target.value;
      setSelectedFont(font);
      
      // Save ONLY in formData (not as separate localStorage item)
      updateFormDataInLocalStorage({ 
        font: font
      });
    }}
  >
    {[
      "Roboto",
      "Poppins",
      "Times New Roman",
      "Open Sans",
      "Inter",
      "Montserrat",
      "Lato",
      "Nunito",
      "Playfair Display",
      "Raleway",
      "Merriweather",
      "Ubuntu",
      "Oswald",
    ].map((font) => (
      <option key={font} value={font} style={{ fontFamily: font }}>
        {font}
      </option>
    ))}
  </select>
</div>
            </div>
          </div>
        )}

      {/* Action Buttons (Check Profit, Generate PDF, Generate Word) */}
      <div className="flex flex-wrap gap-6 mb-6">
        {/* <button
          onClick={handleCheckProfit}
          className="h-full flex-1 flex  items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 hover:border-blue-300 transition-all hover:shadow-md group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
          </svg>
          Check Profit
        </button> */}
        <button
          onClick={handleCheckProfit}
          className="h-full  flex  items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 hover:border-blue-300 transition-all hover:shadow-md group px-2"
          disabled={isLoading}
        >
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-blue-200 transition-colors">
            {isLoading ? (
              <svg
                className="animate-spin h-6 w-6 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"
                />
              </svg>
            )}
          </div>
          <span className="text-sm font-medium text-blue-800">
            {isLoading ? "Loading..." : "Check Profit"}
          </span>
        </button>

        <button
          onClick={handleGeneratePdfClick}
          className="flex items-center bg-gradient-to-br from-green-500 to-green-300 text-white rounded-lg px-6 py-2 shadow-md hover:scale-105 transition-all"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"
            />
          </svg>
          Generate Financial
        </button>

        <button
          onClick={() => navigate("/intro", { state: { formData } })}
         className={`flex items-center bg-gradient-to-br from-amber-500 to-amber-300 text-white rounded-lg px-6 py-2 shadow-md hover:scale-105 transition-all ${
        !permissions.generateWord ? "cursor-not-allowed opacity-50" : ""
      }`}
          disabled={!permissions.generateWord}
          title={
            !permissions.generateWord
              ? "You do not have permission to generate word."
              : ""
          }
          // className="flex items-center bg-gradient-to-br from-amber-500 to-amber-300 text-white rounded-lg px-6 py-2 shadow-md hover:scale-105 transition-all"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Generate Word
        </button>
      </div>

      {/* Advanced Options */}
      <div className="flex justify-between items-center mt-6">
        <h6
          onClick={() => setShowAdvanced((prev) => !prev)}
          className=" text-blue-700 px-2 py-2 rounded-lg  transition-all cursor-pointer"
        >
          {showAdvanced ? "Hide Advanced" : "Show Advanced"}
        </h6>
      </div>

      {showAdvanced && (
        <div className="flex flex-wrap gap-6 mb-6">
          {/* Export Data Button */}
          <button
            onClick={handleExportData}
            // className="flex items-center bg-gradient-to-br from-yellow-500 to-yellow-300 text-white rounded-lg px-6 py-2 shadow-md hover:scale-105 transition-all"
            className={`flex items-center bg-gradient-to-br from-yellow-500 to-yellow-300 text-white rounded-lg px-6 py-2 shadow-md hover:scale-105 transition-all ${
        !permissions.exportData ? "cursor-not-allowed opacity-50" : ""
      }`}
            // className={buttonClass("exportData")}
            disabled={!permissions.exportData}
            title={
              !permissions.exportData
                ? "You do not have permission to export Data."
                : ""
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Export Data
          </button>

          {/* Graph Generator Button */}
          <GraphGenerator
            formData={formData}
            // selectedColor={selectedColor}
            selectedFont={selectedFont}
            permissions={permissions}
            className="flex items-center justify-center w-5 bg-gradient-to-br from-purple-500 to-purple-300 text-white rounded-lg px-6 py-2 shadow-md hover:scale-105 transition-all"
          />

          <button
            onClick={() => {
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

              localStorage.setItem(
                "cmaAdvanceFormData",
                JSON.stringify(formData)
              );
              localStorage.setItem("cmaSource", "final-step");
              window.open(
                "/cma-advance-report",
                "_blank",
                "noopener,noreferrer"
              );
            }}
            
             className={buttonClass("advanceReport")}
              disabled={!permissions.advanceReport}
              title={
              !permissions.advanceReport
                ? "You do not have permission to generate advance report."
                : ""
               }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Advance Report
          </button>
        </div>
      )}
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
