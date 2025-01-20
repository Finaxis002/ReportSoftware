import React from "react";

const StepperControl = ({ handleNext, handleBack, currentStep, totalSteps }) => {
  return (
    <div style={{position:"relative"}} className="container flex justify-end gap-4 mt-2 mb-2">
      {/* Back Button */}
      <button
        onClick={handleBack}
        className={`bg-white text-slate-400 uppercase py-2 px-4 rounded-xl font-semibold cursor-pointer border-2 border-slate-300 hover:bg-slate-700 transition duration-200 ease-in-out ${
          currentStep === 1 ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={currentStep === 1}
      >
        Previous
      </button>

      {/* Next Button */}
      <button
        onClick={handleNext}
        className={`bg-green-500 text-white uppercase py-2 px-4 rounded-xl font-semibold cursor-pointer border-2 hover:bg-slate-700 hover:text-white transition duration-200 ease-in-out ${
          currentStep === totalSteps ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={currentStep === totalSteps || currentStep === 8}
        style={{display: currentStep === 8 ? 'none' : 'inline-block'}}
      >
        Next
      </button>
    </div>
  );
};

export default StepperControl;
