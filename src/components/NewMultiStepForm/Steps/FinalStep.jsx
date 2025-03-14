import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const FinalStep = ({ formData, setCurrentStep }) => {
  const navigate = useNavigate();
  const [isPDFLoaded, setIsPDFLoaded] = useState(false);
  const [showError, setShowError] = useState();

  // ✅ Default to "" (empty) if nothing is selected, ensuring "Select Report Type" appears first
  const [selectedOption, setSelectedOption] = useState("select option");

  const iframeRef = useRef(null);
  console.log("selected Option", selectedOption);

  // ✅ Store selected option in localStorage but do not pre-fill fields
  useEffect(() => {
    if (selectedOption !== "select option") {
      // Prevent storing default value
      localStorage.setItem("pdfType", selectedOption);
    }
  }, [selectedOption]);

  // ✅ Save selected option to localStorage only if a valid option is chosen
  useEffect(() => {
    if (selectedOption !== "") {
      localStorage.setItem("pdfType", selectedOption);
    }
  }, [selectedOption]);

  // Function to check when iframe has loaded
  const handleIframeLoad = () => {
    console.log("Generated PDF is fully loaded.");
    setIsPDFLoaded(true);
  };

  // When PDF is loaded, navigate to Check Profit
  useEffect(() => {
    if (isPDFLoaded) {
      setTimeout(() => {
        navigate("/checkprofit");
      }, 500); // Small delay to ensure correct navigation
    }
  }, [isPDFLoaded, navigate]);

  const handleCheckProfit = () => {
    setIsPDFLoaded(false);
    if (iframeRef.current) {
      iframeRef.current.src = "/generated-pdf"; // Load PDF in the background
    }
  };

  // const savePdfDataToDB = async () => {
  //   try {
  //     // ✅ Prepare data to send to backend
  //     const dataToSave = {
  //       AccountInformation: formData?.AccountInformation || {},
  //       MeansOfFinance: formData?.MeansOfFinance || {},
  //       CostOfProject: formData?.CostOfProject || {},
  //       ProjectReportSetting: formData?.ProjectReportSetting || {},
  //       Expenses: formData?.Expenses || {},
  //       Revenue: formData?.Revenue || {},
  //       MoreDetails: formData?.MoreDetails || {},
  //     };

  //     console.log("🚀 Saving PDF data to DB:", dataToSave);

  //     const response = await fetch("http://localhost:5000/save-pdf-data", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ data: dataToSave }),
  //     });

  //     const result = await response.json();

  //     if (response.ok) {
  //       console.log("✅ PDF data saved successfully:", result);
  //       alert(`PDF data saved successfully with sessionId: ${result.sessionId}`);
  //     } else {
  //       console.error("❌ Error saving PDF data:", result.error);
  //       alert("Failed to save PDF data. Please try again.");
  //     }
  //   } catch (error) {
  //     console.error("🔥 Error:", error);
  //     alert("An error occurred while saving PDF data.");
  //   }
  // };

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
            const selectedValue = e.target.value;
            setSelectedOption(selectedValue);

            // Debugging logs
            console.log("Selected Option:", selectedValue);
            console.log(
              "UDIN Number:",
              formData?.ProjectReportSetting?.UDINNumber
            );

            // Check if "CA Certified" is selected and UDIN Number is missing or empty
            if (
              selectedValue === "CA Certified" &&
              (!formData?.ProjectReportSetting?.UDINNumber ||
                formData?.ProjectReportSetting?.UDINNumber.trim() === "")
            ) {
              console.log("Error: UDIN Number is missing!");
              setShowError(true);
            } else {
              console.log("No Error: UDIN Number is available!");
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

        {/* Error Message & Redirect Button */}
        {showError && (
          <div className="mt-2 text-red-600">
            <p>UDIN number is not available.</p>
            <button
              onClick={() => setCurrentStep(4)} // ✅ Move to Step 4 in Parent Component
              className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Go to Project Report Settings
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-5">
        {/* ✅ Open Generate PDF in new tab */}
        <button
          onClick={() => window.open("/generated-pdf", "_blank")} // ✅ Use window.open for new tab
          className="mt-4 bg-indigo-600 text-white py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Generate PDF
        </button>

        {/* ✅ Open Check Profit in new tab */}
        <button
          onClick={() => {
            const profitUrl = handleCheckProfit(); // ✅ Call the function and get the result (if it's a URL)
            if (profitUrl) {
              window.open(profitUrl, "_blank"); // ✅ Open the result in a new tab
            }
          }}
          className="mt-4 bg-green-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Check Profit
        </button>
      </div>

      {/* Hidden iframe to load generated-pdf in the background */}
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

// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import CheckProfit from "../CheckProfit"

// const FinalStep = ({
//   formData = [],
//   localData = [],
//   normalExpense = [],
//   directExpense = [],
//   stableLocation = {},
//   computedData = {},
//   yearlyInterestLiabilities = [],
//   totalRevenueReceipts = [],
//   fringAndAnnualCalculation = [],
//   financialYearLabels = [],
//   yearlyPrincipalRepayment = [],
//   totalDepreciationPerYear = [],
//   netProfitBeforeTax = [],
//   netProfitAfterTax = [],
//   formatNumber = [],
//   receivedtotalRevenueReceipts = [],
//   receivedAssetsLiabilities = []
// }) => {
//   const navigate = useNavigate();
//   const [showCheckProfit, setShowCheckProfit] = useState(false); // State to control visibility of CheckProfit

//   // Handler for "Generate PDF" button click
//   const handleGeneratePDF = () => {
//     // Navigate to the generated-pdf page and pass form data via state
//     navigate("/generated-pdf", { state: formData });
//   };

//   // Handler for "Check Profit" button click
//   const handleCheckProfit = () => {
//     setShowCheckProfit(true); // Show CheckProfit component when clicked
//   };

//   return (
//     <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg form-scroll">
//       <h2 className="text-2xl font-semibold text-gray-700 mb-6">
//         Final Step: Generate PDF
//       </h2>
//       <p className="text-gray-600 mb-4">
//         Review the information and click the button below to generate your final
//         report PDF.
//       </p>

//       {/* Generate PDF Button */}
//       <button
//         onClick={handleGeneratePDF}
//         className="mt-4 bg-indigo-600 text-white py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//       >
//         Generate PDF
//       </button>

//       {/* Check Profit Button */}
//       <button
//         onClick={handleCheckProfit}
//         className="mt-4 bg-green-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//       >
//         Check Profit
//       </button>

//       {/* Conditionally render CheckProfit component */}
//       {showCheckProfit && (
//         <CheckProfit
//           formData={formData}
//           localData={localData}
//           normalExpense={normalExpense}
//           directExpense={directExpense}
//           location={stableLocation}
//           totalDepreciationPerYear={computedData.totalDepreciation}
//           netProfitBeforeTax={computedData.netProfitBeforeTax || []}
//           yearlyInterestLiabilities={yearlyInterestLiabilities || []}
//           totalRevenueReceipts={totalRevenueReceipts}
//           fringAndAnnualCalculation={fringAndAnnualCalculation}
//           financialYearLabels={financialYearLabels}
//           formatNumber={formatNumber}
//           receivedtotalRevenueReceipts={totalRevenueReceipts}
//           yearlyPrincipalRepayment={yearlyPrincipalRepayment || []}
//           netProfitAfterTax={computedData.netProfitAfterTax || []}
//           receivedAssetsLiabilities={assetsliabilities}
//         />
//       )}
//     </div>
//   );
// };

// export default FinalStep;
