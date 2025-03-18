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

  return (
    <div className="container flex justify-end gap-4 mt-2 mb-2">
      {/* ✅ Back Button */}
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
      {isUpdateReportClicked && userRole !== "client" && (
        <button
          type="button"
          onClick={handleUpdate}
          className="bg-orange-500 py-2 px-4 rounded-xl font-semibold cursor-pointer border-2 transition duration-200 ease-in-out"
        >
          Update Report
        </button>
      )}

      {/* ✅ Save Data Button */}
      {isCreateReportClicked && (
        <button
          type="button"
          onClick={() => handleSave(isCreateReportWithExistingClicked)} // ✅ Pass the flag
          className={`bg-blue-500 hover:bg-blue-700 text-white uppercase py-2 px-4 rounded-xl font-semibold cursor-pointer border-2 transition duration-200 ease-in-out`}
        >
          Save Data
        </button>
      )}

      {/* ✅ Save & Next Button */}
      {isCreateReportWithExistingClicked && (
        <button
          onClick={() => handleNextStep(stepData)}
          className={`bg-green-500 text-white uppercase py-2 px-4 rounded-xl font-semibold cursor-pointer border-2 hover:bg-slate-700 hover:text-white transition duration-200 ease-in-out ${
            currentStep === totalSteps ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={currentStep === totalSteps}
        >
          Save & Next
        </button>
      )}

      {/* ✅ Next Button */}
      {!isCreateReportWithExistingClicked && (
        <button
          type="button"
          onClick={handleNext}
          className={`bg-green-500 text-white uppercase py-2 px-4 rounded-xl font-semibold cursor-pointer border-2 hover:bg-slate-700 hover:text-white transition duration-200 ease-in-out ${
            currentStep === 3 && disableNext ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={currentStep === 3 && disableNext}
          style={{
            display: currentStep === totalSteps ? "none" : "inline-block",
          }}
        >
          Next
        </button>
      )}
    </div>
  );
};

export default StepperControl;
