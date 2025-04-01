

////////////////////////////////////////////////////////////////////////////////////////////////////////////
// import React, { useState, useEffect } from "react"; 
// import { useLocation, useNavigate } from "react-router-dom";

// const StepperControl = ({
//   handleUpdate,
//   handleNext,
//   handleBack,
//   handleSave,
//   currentStep,
//   totalSteps,
//   handleNextStep,
//   stepData,
//   disableNext,
// }) => {
//   const [userRole, setUserRole] = useState("");
//   const location = useLocation();
//   const navigate = useNavigate();

//   // ✅ Local state for retaining values across steps
//   const [isUpdate, setIsUpdate] = useState(false);
//   const [isCreateReportWithExisting, setIsCreateReportWithExisting] = useState(false);
//   const [isCreateReport, setIsCreateReport] = useState(false);

//   useEffect(() => {
//     const role = localStorage.getItem("userRole");
//     setUserRole(role);

//     // ✅ Set local state from location state when component loads
//     if (location.state?.isUpdateReportClicked) {
//       setIsUpdate(true);
//     }
//     if (location.state?.isCreateReportWithExistingClicked) {
//       setIsCreateReportWithExisting(true);
//     }
//     if (location.state?.isCreateReportClicked) {
//       setIsCreateReport(true);
//     }
//   }, []);

//   // ✅ Pass state when navigating to retain it across steps
//   const handleNextStepWithState = () => {
//     navigate(`/multistepform?step=${currentStep + 1}`, {
//       state: {
//         isUpdateReportClicked: isUpdate,
//         isCreateReportWithExistingClicked: isCreateReportWithExisting,
//         isCreateReportClicked: isCreateReport,
//       },
//     });
//     handleNextStep(stepData);
//   };

//   const handleNextWithState = () => {
//     navigate(`/multistepform?step=${currentStep + 1}`, {
//       state: {
//         isUpdateReportClicked: isUpdate,
//         isCreateReportWithExistingClicked: isCreateReportWithExisting,
//         isCreateReportClicked: isCreateReport,
//       },
//     });
//     handleNext();
//   };

//   return (
//     <div className="container flex justify-end gap-4 mt-2 mb-2">
//       {/* 🔥 Back Button */}
//       <button
//         type="button"
//         onClick={handleBack}
//         className={`bg-white text-black uppercase py-2 px-4 rounded-xl font-semibold cursor-pointer border-2 border-slate-300 hover:bg-slate-700 transition duration-200 ease-in-out ${
//           currentStep === 1 ? "opacity-50 cursor-not-allowed" : ""
//         }`}
//         disabled={currentStep === 1}
//       >
//         Previous
//       </button>

//       {/* 🔥 Update Report Button */}
//       {!isCreateReport && // ✅ FIXED: Hide when "Create Report" is clicked
//         !isCreateReportWithExisting &&
//         userRole !== "client" &&
//          ( 
//           <button
//             type="button"
//             onClick={handleUpdate}
//             className="bg-orange-500 py-2 px-4 rounded-xl font-semibold cursor-pointer border-2 transition duration-200 ease-in-out hover:bg-orange-600"
//           >
//             Update Report
//           </button>
//         )}

//       {/* 🔥 Save Data Button */}
//       {!isUpdate && // ✅ FIXED: Use local state instead of location.state
//         !isCreateReportWithExisting && // ✅ FIXED: Avoid conflicts
//         currentStep !== totalSteps && ( // ✅ FIXED: Hide on last step
//           <button
//             type="button"
//             onClick={() => handleSave(isCreateReportWithExisting)}
//             className={`${
//               isCreateReportWithExisting
//                 ? "bg-orange-500 hover:bg-orange-700"
//                 : "bg-blue-500 hover:bg-blue-700"
//             } text-white uppercase py-2 px-4 rounded-xl font-semibold cursor-pointer border-2 transition duration-200 ease-in-out ${
//               currentStep === totalSteps ? "opacity-50 cursor-not-allowed" : ""
//             }`}
//             disabled={currentStep === totalSteps}
//           >
//             Save Data
//           </button>
//         )}

//       {/* 🔥 Next Button */}
//       {isCreateReportWithExisting ? (
//         <button
//           onClick={handleNextStepWithState}
//           className={`bg-green-500 text-white uppercase py-2 px-4 rounded-xl font-semibold cursor-pointer border-2 hover:bg-green-600 transition duration-200 ease-in-out ${
//             currentStep === totalSteps ? "opacity-50 cursor-not-allowed" : ""
//           }`}
//           disabled={currentStep === totalSteps}
//         >
//           Save & Next
//         </button>
//       ) : (

//         // Hide this button if "Create Report With Existing" is clicked
//         <button
//         type="button"
//         onClick={handleNext}
//         className={`bg-green-500 text-white uppercase py-2 px-4 rounded-xl font-semibold cursor-pointer border-2 hover:bg-slate-700 hover:text-white transition duration-200 ease-in-out ${
//           currentStep === 3 && disableNext ? "opacity-50 cursor-not-allowed" : ""
//         }`}
//         disabled={currentStep === 3 && disableNext} // ✅ Disable only on step 3 if error exists
//         style={{
//           display: currentStep === totalSteps ? "none" : "inline-block",
//         }}
//       >
//         Next
//       </button>
      
//       )}


//     </div>
//   );
// };

// export default StepperControl;


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
      {isCreateReportWithExistingClicked ? (
        // Show this button if "Create Report With Existing" is clicked
        <button
          onClick={() => handleNextStep(stepData)}
          className={`bg-green-500 text-white uppercase py-2 px-4 rounded-xl font-semibold cursor-pointer border-2 hover:bg-slate-700 hover:text-white transition duration-200 ease-in-out ${
            currentStep === totalSteps ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Save & Next
        </button>
      ) : (
        // Hide this button if "Create Report With Existing" is clicked
        <button
        type="button"
        // onClick={handleNext}
        onClick={() => {
          if (currentStep === 1) {
            const isValid = handleSubmitFirstStep();
            if (!isValid) return; 
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
      
      )}

    </div>
  );
};

export default StepperControl;