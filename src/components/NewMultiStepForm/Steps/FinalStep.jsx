import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx"; // ✅ Import xlsx library

const FinalStep = ({ formData, setCurrentStep }) => {
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

  const handleCheckProfit = () => {
    console.log("🚀 Triggering PDF Load...");
    setIsPDFLoaded(false);
    setIsLoading(true);

    if (iframeRef.current) {
      iframeRef.current.src = `/generated-pdf?t=${Date.now()}`;

      // ✅ Fallback with setTimeout after 15 seconds
      timeoutId.current = setTimeout(() => {
        if (isComponentMounted.current) {
          console.log("⏳ Navigating after timeout...");
          setIsPDFLoaded(true);
          setIsLoading(false);
          navigate("/checkprofit");
        }
      }, 15000);

      iframeRef.current.onload = () => {
        if (!isComponentMounted.current) return;
        console.log("✅ PDF Loaded Successfully");

        clearTimeout(timeoutId.current);
        timeoutId.current = null;
        setIsPDFLoaded(true);
        setIsLoading(false);

        setTimeout(() => {
          if (isComponentMounted.current) {
            console.log("🚀 Navigating after short delay...");
            navigate("/checkprofit");
          }
        }, 3000);
      };
    }

    // ✅ Save last step to localStorage
    localStorage.setItem("lastStep", 8);
  };

  // const handleExportData = () => {
  //   const data = formData; // Assuming formData contains your data

  //   // Convert data to JSON format
  //   const jsonData = JSON.stringify(data, null, 2);
  //   const blob = new Blob([jsonData], { type: "application/json" });

  //   // Create a link and trigger download
  //   const url = URL.createObjectURL(blob);
  //   const link = document.createElement("a");
  //   link.href = url;
  //   link.download = "exported-data.json"; // File name for download
  //   link.click();

  //   // Cleanup
  //   URL.revokeObjectURL(url);
  // };

  // ✅ Utility function to flatten nested objects
  const flattenObject = (obj, parentKey = "", result = {}) => {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = parentKey ? `${parentKey}.${key}` : key;
        if (typeof obj[key] === "object" && obj[key] !== null) {
          // ✅ If it's a File, convert it to string format
          if (obj[key] instanceof File) {
            result[newKey] = `File Attached: ${obj[key].name}`;
          } else {
            flattenObject(obj[key], newKey, result);
          }
        } else {
          // ✅ Convert all values to string (handles undefined and null)
          result[newKey] = obj[key] !== undefined && obj[key] !== null 
            ? obj[key].toString()
            : ""; // ✅ Empty string for null or undefined
        }
      }
    }
    return result;
  };
  
  const handleExportData = () => {
    if (!formData) return;
  
    // ✅ Flatten nested data
    const flattenedData = flattenObject(formData);
  
    // ✅ Convert flattened object to array format
    const dataArray = Object.keys(flattenedData).map((key) => ({
      Key: key,
      Value: flattenedData[key],
    }));
  
    // ✅ Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(dataArray);
  
    // ✅ Create workbook and add worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Exported Data");
  
    // ✅ Write file
    XLSX.writeFile(workbook, "exported-data.xlsx");
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg form-scroll">
      <h2 className="text-2xl font-semibold text-gray-700 mb-6">
        Final Step: Generate PDF
      </h2>
      <p className="text-gray-600 mb-4">
        Review the information and click the button below to proceed.
      </p>

      {/* ✅ Dropdown Selection */}
      <div className="mb-4">
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

        {/* ✅ Error Message */}
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
      </div>

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
        <button
          onClick={handleExportData}
          className="mt-4 bg-orange-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          Export Data
        </button>
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
