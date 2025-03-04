import React , {useState} from "react";
import { jsPDF } from "jspdf"; // Import jsPDF for PDF generation
import { useNavigate } from "react-router-dom";

const FinalStep = ({ formData }) => {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState("Sharda Associates");
  const handleGeneratePDF = () => {
    // Navigate to the new page and pass form data via state
    navigate("/generated-pdf", { state: formData });
  };

  const handleCheckProfit = () => {
    // Navigate to the new page and pass form data via state
    navigate("/checkprofit", { state: formData });
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg form-scroll">
      <h2 className="text-2xl font-semibold text-gray-700 mb-6">
        Final Step: Generate PDF
      </h2>
      <p className="text-gray-600 mb-4">
        Review the information and click the button below to generate your final
        report PDF.
      </p>

      <div className="flex gap-5">
        {/* Generate PDF Button */}
        <button
          onClick={() => {
            if (typeof handleGeneratePDF === "function") {
              handleGeneratePDF(selectedOption);
            } else {
              console.error(
                "handleGeneratePDF is not defined or not a function"
              );
            }
          }}
          className="mt-4 bg-indigo-600 text-white py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Generate PDF
        </button>

        <button
          onClick={handleCheckProfit}
          className="mt-4 bg-green-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Check Profit
        </button>
      </div>
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
