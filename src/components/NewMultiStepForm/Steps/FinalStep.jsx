import React, { useState, useEffect, useRef } from "react";

import * as XLSX from "xlsx"; // ✅ Import xlsx library
import GraphGenerator from "../GraphGenerator";
import IntroPage from "../IntroPage";
import { useNavigate } from "react-router-dom";


const FinalStep = ({ formData, userRole }) => {
   const navigate = useNavigate();
  const [permissions, setPermissions] = useState({
    generateReport: false,
    updateReport: false,
    createNewWithExisting: false,
    downloadPDF: false,
    exportData: false, // ✅ Add this
  });

  const userName =
    localStorage.getItem("adminName") || localStorage.getItem("employeeName");

  const [isPDFLoaded, setIsPDFLoaded] = useState(false);
  const [showError, setShowError] = useState(false);
  const [selectedOption, setSelectedOption] = useState("select option");
  const [selectedColor, setSelectedColor] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedFont, setSelectedFont] = useState(
    localStorage.getItem("selectedFont") || "Roboto"
  );

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

    if (formData?.CostOfProject) {
      const rows = [["Name", "Amount"]];

      Object.values(formData.CostOfProject).forEach((item) => {
        if (item?.name && typeof item.amount === "number") {
          rows.push([item.name, item.amount]);
        }
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

    if (Object.keys(sections["Other Data"]).length > 0) {
      addKeyValueSheet(sections["Other Data"], "Other Data");
    }

    // ✅ Save the file
    XLSX.writeFile(workbook, "exported-data.xlsx");
  };

  const handleCheckProfit = async () => {
    console.log("🚀 Triggering PDF Load...");
    setIsPDFLoaded(false);
    setIsLoading(true);

    const reportTitle =
      formData?.AccountInformation?.businessName || "Untitled";
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
          const storedAdminName = localStorage.getItem("adminName");

          if (!storedAdminName) {
            setPermissions({
              generateReport: true,
              updateReport: true,
              createNewWithExisting: true,
              downloadPDF: true,
              exportData: true,
              createReport: true,
            });
            return;
          }

          const admin = adminList.find(
            (a) =>
              a.username?.trim().toLowerCase() === normalizedUserName ||
              a.adminId?.trim().toLowerCase() === normalizedUserName
          );

          if (admin?.permissions) {
            setPermissions(admin.permissions);
          }
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

    fetchPermissions(); // 🔁 Only fetch once when dependencies change
  }, [userRole, userName]);

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
    };

    window.addEventListener("beforeunload", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);

  const handleGeneratePdfClick = async () => {
    try {
      console.log("🚀 Logging 'generated-pdf' activity...");

      const reportTitle =
        formData?.AccountInformation?.businessName || "Untitled";
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

  console.log("userRole:", userRole);
  console.log("adminName:", localStorage.getItem("adminName"));
  console.log("permissions.generateReport:", permissions?.generateReport);

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg form-scroll">
      <h2 className="text-2xl font-semibold text-gray-700 mb-6">
        Final Step: Generate PDF
      </h2>
      <p className="text-gray-600 mb-4">
        Review the information and click the button below to proceed.
      </p>

      {/* ✅ PDF Type Dropdown */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">
          Select PDF Type:
        </label>
        <select
          value={selectedOption}
          onChange={(e) => {
            const option = e.target.value;
            setSelectedOption(option);

            // ✅ Clear selected color and type from localStorage when changed
            if (option !== "Other") {
              setSelectedColor("");
              localStorage.removeItem("selectedColor");
              localStorage.removeItem("selectedFont");
            }

            // ✅ Remove previously selected type from localStorage
            localStorage.removeItem("pdfType");

            if (
              option === "CA Certified" &&
              !formData?.ProjectReportSetting?.UDINNumber
            ) {
              setShowError(true);
            } else {
              setShowError(false);
            }
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="select option">Select Report Type</option>
          <option value="Other">Other</option>
        </select>

        {showError && (
          <div className="mt-2 text-red-600">
            <p>UDIN number is not available.</p>
            <button
              // onClick={() => setCurrentStep(4)}
              className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Go to Project Report Settings
            </button>
          </div>
        )}
      </div>

      {selectedOption === "Other" && (
        <div>
          {/* Color Selection - Horizontal Layout */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
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
                  className={`flex items-center gap-1 px-1 py-1 rounded-md border transition cursor-pointer 
              ${
                selectedColor === color
                  ? "border-2 border-indigo-600 bg-indigo-50 scale-105 shadow-md"
                  : "border border-gray-300"
              } hover:shadow-sm`}
                  onDoubleClick={() => {
                    if (selectedColor === color) {
                      setSelectedColor("");
                      localStorage.removeItem("selectedColor");
                    }
                  }}
                >
                  <input
                    type="radio"
                    name="selectedColor"
                    value={color}
                    checked={selectedColor === color}
                    onChange={(e) => {
                      const selected = e.target.value;
                      setSelectedColor(selected);
                      localStorage.setItem("selectedColor", selected);
                    }}
                    className="hidden"
                  />

                  <div
                    className="relative w-6 h-6 rounded-full border border-gray-300"
                    style={{ backgroundColor: getColorHex(color) }}
                  >
                    {selectedColor === color && (
                      <svg
                        className="absolute top-0 left-0 w-full h-full text-white p-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 6.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l7-7a1 1 0 000-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm font-medium">
                    {color === "SkyBlue" ? "Sky Blue" : color}
                  </span>
                </label>
              ))}
            </div>

            {/* ✅ Hex Color Input */}
            <div className="mt-4">
              <label className="block text-gray-700 font-medium mb-1">
                Or enter custom HEX code:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="#000000"
                  maxLength={7}
                  className="border border-gray-300 rounded-md px-2 py-1 w-32 focus:outline-none focus:ring focus:ring-indigo-200"
                  value={selectedColor.startsWith("#") ? selectedColor : ""}
                  onChange={(e) => {
                    const hex = e.target.value;
                    // Basic HEX validation
                    if (/^#([0-9A-Fa-f]{3}){1,2}$/.test(hex)) {
                      setSelectedColor(hex);
                      localStorage.setItem("selectedColor", hex);
                    } else {
                      setSelectedColor(hex); // still store the input for user to correct
                    }
                  }}
                />
                <div
                  className="w-6 h-6 rounded-full border border-gray-400"
                  style={{
                    backgroundColor: selectedColor.startsWith("#")
                      ? selectedColor
                      : "#fff",
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* ✅ Font Dropdown */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Choose Font:
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={selectedFont}
              onChange={(e) => {
                const font = e.target.value;
                setSelectedFont(font);
                localStorage.setItem("selectedFont", font);
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
      )}

      <div className="flex gap-5">
        {/* ✅ Check Profit Button */}
        <button
          onClick={handleCheckProfit}
          className="mt-4 bg-green-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {isLoading ? "Loading..." : "Check Profit"}
        </button>

        {/* ✅ Generate PDF Button */}
        {(userRole === "admin" ||
          (userRole === "employee" && permissions.generateReport)) && (
          <button
            onClick={handleGeneratePdfClick}
            className="mt-4 bg-indigo-600 text-white py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Generate PDF
          </button>
        )}

        {(userRole === "admin" ||
          (userRole === "employee" && permissions.generateReport)) && (
          <GraphGenerator formData={formData} />
        )}

        {/* ✅ New Export Data Button */}
        {(userRole === "admin" ||
          (userRole === "employee" && permissions.generateReport)) && (
          <button
            onClick={handleExportData}
            className="mt-4 bg-orange-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            Export Data
          </button>
        )}
      </div>

      {(userRole === "admin" ||
        (userRole === "employee" && permissions.generateReport)) && (
        // <IntroPage formData={formData} />
        <button
      onClick={() => navigate("/intro", { state: { formData } })}
      className="mt-4 bg-indigo-600 text-white py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      Generate Word
    </button>
      )}
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
