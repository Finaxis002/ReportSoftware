
//////////////////////////////////////////////////////////////////////////////////
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";


const StepperControl = ({
  handleUpdate,
  handleNext,
  handleBack,
  handleSave,
  currentStep,
  totalSteps,
  handleNextStep,
  stepData,
  disableNext,
  handleSubmitFirstStep,
  onStepClick
}) => {
  const [userRole, setUserRole] = useState("");
  const location = useLocation();

  const isCreateReportClicked = location.state?.isCreateReportClicked || false;
  const isCreateReportWithExistingClicked =
    location.state?.isCreateReportWithExistingClicked || false;
  const isUpdateReportClicked = location.state?.isUpdateReportClicked || false;

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    setUserRole(role);
  }, []);


  // validatio for step 6
  // const validateRevenueForStep6 = () => {
  //   if (currentStep !== 6) return true; // ✅ Only validate on Step 6
  
  //   const revenueData = stepData?.Revenue;
  //   if (!revenueData) return true;
  
  //   const monthlyRevenues = revenueData.totalRevenue || [];
  //   const otherRevenues = revenueData.totalRevenueForOthers || [];
  
  //   const selectedRevenueArray = revenueData.formType === "Others"
  //     ? otherRevenues
  //     : monthlyRevenues;
  
  //   let foundNonZero = false;
  
  //   // for (let i = 0; i < selectedRevenueArray.length; i++) {
  //   //   const val = parseFloat(selectedRevenueArray[i] || 0);
  
  //   //   if (val > 0) {
  //   //     foundNonZero = true;
  //   //   } else if (foundNonZero &&  (!raw || val <= 0 || isNaN(val))) {
  //   //     alert(`❌ Please fill revenue for Year ${i + 1} after a non-zero year.`);
  //   //     return false;
  //   //   }
  //   // }

  //   for (let i = 0; i < selectedRevenueArray.length; i++) {
  //     const raw = selectedRevenueArray[i];  // ✅ Declare raw here
  //     const val = Number(raw);
    
  //     if (val > 0) {
  //       foundNonZero = true;
  //     } else if (foundNonZero && (!raw || val <= 0 || isNaN(val))) {
  //       alert(`❌ Please fill revenue for Year ${i + 1} after a non-zero year.`);
  //       return false;
  //     }
  //   }
    
  
  //   return true;
  // };

  const validateRevenueForStep6 = () => {
    if (currentStep !== 6) return true;
  
    const revenueData = stepData?.Revenue;
    if (!revenueData) return true;
  
    const monthlyRevenues = revenueData.totalRevenue || [];
    const otherRevenues = revenueData.totalRevenueForOthers || [];
  
    const selectedRevenueArray =
      revenueData.formType === "Others" ? otherRevenues : monthlyRevenues;
  
    let foundNonZero = false;
  
    for (let i = 0; i < selectedRevenueArray.length; i++) {
      const raw = selectedRevenueArray[i];
  
      const isFilled = raw !== undefined && raw !== null && raw !== "" && !isNaN(raw) && Number(raw) > 0;
  
      if (isFilled) {
        foundNonZero = true;
      } else if (foundNonZero) {
        // If any non-zero revenue is found before, this one must be filled
        alert(`❌ Please fill revenue for Year ${i + 1} after a non-zero year.`);
        return false;
      }
    }
  
    //debug
    console.log("🚨 DEBUG Revenue Values:", selectedRevenueArray);
selectedRevenueArray.forEach((val, idx) =>
  console.log(`Year ${idx + 1}:`, val, typeof val)
);
    return true;
  };
  
  

  return (
    <div className="container flex justify-end gap-4 mt-2 mb-2">
      {/* Back Button */}
      <button
        type="button"
        onClick={handleBack}
        className={`bg-white text-black uppercase py-2 px-4 rounded-xl font-semibold cursor-pointer border-2 border-slate-300 hover:bg-slate-700 transition duration-200 ease-in-out ${
          currentStep === 1 ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={currentStep === 1}
      >
        Previous
      </button>

      {/* ✅ Update Report Button */}
      {!isCreateReportClicked &&
        !isCreateReportWithExistingClicked &&
        userRole !== "client" && (
          <button
            type="button"
            onClick={handleUpdate}
            className="bg-orange-500 py-2 px-4 rounded-xl font-semibold cursor-pointer border-2 transition duration-200 ease-in-out"
          >
            Update Report
          </button>
        )}

      {!isUpdateReportClicked &&
        (!isCreateReportWithExistingClicked ||
          (isCreateReportWithExistingClicked &&
            currentStep === totalSteps)) && (
          <button
            type="button"
            onClick={() => handleSave(isCreateReportWithExistingClicked)} // ✅ Pass the flag
            className={`${
              isCreateReportWithExistingClicked
                ? "bg-orange-500 hover:bg-orange-700"
                : "bg-blue-500 hover:bg-blue-700"
            } text-white uppercase py-2 px-4 rounded-xl font-semibold cursor-pointer border-2 transition duration-200 ease-in-out`}
          >
            Save Data
          </button>
        )}
      {/* Next Button */}
      {/* {isCreateReportWithExistingClicked ? (
        // Show this button if "Create Report With Existing" is clicked
        <button
          onClick={() => {
            if (currentStep === 1) {
              const isValid = handleSubmitFirstStep();
              if (!isValid) return; 
            }
            if (currentStep === 6 && !validateRevenueForStep6()) {
              return; // 🔴 Block next step if validation fails
            }
            handleNextStep(stepData)}}
          className={`bg-green-500 text-white uppercase py-2 px-4 rounded-xl font-semibold cursor-pointer border-2 hover:bg-slate-700 hover:text-white transition duration-200 ease-in-out ${
            currentStep === totalSteps ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Save & Next
        </button>
      ) : ( */}
      
        <button
        type="button"
        // onClick={handleNext}
        onClick={() => {
          if (currentStep === 1) {
            const isValid = handleSubmitFirstStep();
            if (!isValid) return; 
          }
          if (currentStep === 6 && !validateRevenueForStep6()) {
            return; // 🔴 Block next step if validation fails
          }
          handleNext(); // Go to next step
        }}
        className={`bg-green-500 text-white uppercase py-2 px-4 rounded-xl font-semibold cursor-pointer border-2 hover:bg-slate-700 hover:text-white transition duration-200 ease-in-out ${
          currentStep === 3 && disableNext ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={currentStep === 3 && disableNext} // ✅ Disable only on step 3 if error exists
        style={{
          display: currentStep === totalSteps ? "none" : "inline-block",
        }}
      >
        Next
      </button>
      
      {/* )} */}

    </div>
  );
};

export default StepperControl;