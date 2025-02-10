import React, { useState, useCallback, useMemo, useEffect } from "react";
import Stepper from "./Stepper";
import StepperControl from "./StepperControl";
import FirstStepBasicDetails from "./Steps/FirstStepBasicDetails";
import SecondStepMOF from "./Steps/SecondStepMOF";
import FinalStep from "./Steps/FinalStep";
import ThirdStepCOP from "./Steps/ThirdStepCOP";
import FourthStepPRS from "./Steps/FourthStepPRS";
import FifthStepExpenses from "./Steps/FifthStepExpenses";
import SixthRevenue from "./Steps/SixthRevenue";
import SeventhStepMD from "./Steps/SeventhStepMD";
import MenuBar from "./MenuBar";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import ClientNameDropdown from "./Dropdown/clientNameDropdown";

const MultiStepForm = () => {
  const location = useLocation();
  const isUpdateMode = location.state?.isUpdateMode || false; // ✅ Check if navigated from Update Report
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState(null);
  const [projectionYears, setProjectionYears] = useState(0);
  const [userRole, setUserRole] = useState("");

  const isCreateReportClicked = location.state?.isCreateReportClicked || false;
  const isCreateReportWithExistingClicked = location.state?.isCreateReportWithExistingClicked || false;

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    setUserRole(role);
  }, []);

  // Function to update projection years
  const handleProjectionYearChange = (newYears) => {
    setProjectionYears(newYears);
  };
  // ✅ State to store business data when selected in ReportDropdown
  const [formData, setFormData] = useState({
    AccountInformation: {},
    MeansOfFinance: {},
    CostOfProject: {},
    ProjectReportSetting: {},
    Expenses: {},
    Revenue: {},
    MoreDetails: {},
  });

  const steps = [
    "Account Information",
    "Means Of Finance",
    "Cost Of Project",
    "Project Report Settings",
    "Expenses",
    "Revenue",
    "More Details",
    "Complete",
  ];

  // ✅ Memoized function to prevent unnecessary re-renders
  const handleFormDataChange = useCallback((stepData) => {
    setFormData((prevData) => ({
      ...prevData,
      ...stepData,
    }));
  }, []);

  const handleBusinessSelect = (businessData, sessionId) => {
    setFormData(businessData); // ✅ Populate form fields correctly
    setSessionId(sessionId || null); // ✅ Store sessionId separately
  };
  
  const handleSaveData = async () => {
    try {
        let requestData = new FormData();
        requestData.append("step", steps[currentStep - 1]); // Track current step

        let formDataWithoutFile = { ...formData };

        // ✅ Remove `_id` field to prevent MongoDB from generating a new one
        if (formDataWithoutFile._id) {
            delete formDataWithoutFile._id;
        }

        let apiUrl = "http://localhost:5000/save-step"; // Always updating/saving

        if (!sessionId) {
            // 🆕 First Step - Creating a new document
            console.log("🆕 First Step: Creating New Report...");
        } else {
            // 🔄 Subsequent Steps - Updating existing document
            console.log("🔄 Updating Existing Report...");
            requestData.append("sessionId", sessionId);
        }

        // ✅ Remove `logoOfBusiness` before sending (if needed)
        if (formDataWithoutFile.AccountInformation) {
            delete formDataWithoutFile.AccountInformation.logoOfBusiness;
        }

        requestData.append("data", JSON.stringify(formDataWithoutFile));

        if (formData.AccountInformation?.logoOfBusiness instanceof File) {
            requestData.append("file", formData.AccountInformation.logoOfBusiness);
        }

        console.log(`🚀 Sending Request to API: ${apiUrl}`);
        console.log("📩 Request Data:", requestData);

        const response = await axios.post(apiUrl, requestData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        console.log("✅ Response from API:", response.data);

        if (!sessionId) {
            // ✅ Store sessionId from Step 1 so that future steps use it
            setSessionId(response.data.sessionId);
            console.log("🆔 Stored sessionId:", response.data.sessionId);
        }

        alert("Data saved successfully!");

        if (response.data.filePath) {
            handleFormDataChange({
                AccountInformation: {
                    ...formData.AccountInformation,
                    logoOfBusiness: response.data.filePath,
                },
            });
        }

    } catch (error) {
        console.error("🔥 Error saving data:", error);

        if (error.response) {
            console.error("🚨 Full Error Response:", error.response.data);
        } else {
            console.error("❌ No response received from server");
        }

        alert(`Failed to save data: ${error.response?.data?.message || error.message}`);
    }
};


  const handleCreateNewFromExisting = async () => {
    try {
        console.log("🔄 Preparing data for creating a new report from existing...");
  
        // ✅ Remove `_id` to prevent MongoDB duplicate key error
        let newData = { ...formData };
        if (newData._id) {
            console.log("🗑 Removing old _id:", newData._id);
            delete newData._id;
        }
  
        let sessionToUse = sessionId || localStorage.getItem("sessionId");
  
        if (!sessionToUse) {
            // ✅ First step: Remove old sessionId to create a new document
            if (newData.sessionId) {
                console.log("🗑 Removing old sessionId:", newData.sessionId);
                delete newData.sessionId;
            }
        } else {
            // ✅ Step 2+: Use stored sessionId to update the same document
            console.log("🔄 Using existing sessionId:", sessionToUse);
            newData.sessionId = sessionToUse;
        }
  
        // ✅ Prepare FormData for submission
        let requestData = new FormData();
        requestData.append("data", JSON.stringify(newData));
  
        if (formData.AccountInformation?.logoOfBusiness instanceof File) {
            requestData.append("file", formData.AccountInformation.logoOfBusiness);
        }
  
        console.log("🚀 Sending Request to /create-new-from-existing");
  
        // ✅ Send data to create or update the report
        const createResponse = await axios.post("http://localhost:5000/create-new-from-existing", requestData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
  
        console.log("✅ New Report Created or Updated:", createResponse.data);
  
        // ✅ Store the sessionId from response so that Step 2+ updates the same document
        if (!sessionToUse) {
            setSessionId(createResponse.data.sessionId);
            localStorage.setItem("sessionId", createResponse.data.sessionId);
        }
  
        alert("New Report Created Successfully!");
  
    } catch (error) {
        console.error("🔥 Error creating new report from existing:", error);
        alert(`Failed to create new report: ${error.response?.data?.message || error.message}`);
    }
  };
  
  
  
  
  // new Handle Save Data code to update and create new with existing
  // const handleSaveData = async (isCreateReportWithExistingClicked) => {
  //   try {
  //     let requestData = new FormData();
  //     requestData.append("step", steps[currentStep - 1]);
  
  //     let formDataWithoutFile = { ...formData };
  
  //     if (formDataWithoutFile._id) {
  //       delete formDataWithoutFile._id;
  //     }
  
  //     if (formDataWithoutFile.AccountInformation) {
  //       delete formDataWithoutFile.AccountInformation.logoOfBusiness;
  //     }
  
  //     requestData.append("data", JSON.stringify(formDataWithoutFile));
  
  //     if (sessionId && sessionId !== "undefined") {
  //       requestData.append("sessionId", sessionId);
  //     }
  
  //     if (formData.AccountInformation?.logoOfBusiness instanceof File) {
  //       requestData.append("file", formData.AccountInformation.logoOfBusiness);
  //     }
  
  //     console.log("🚀 Sending Request to:", isCreateReportWithExistingClicked ? "/start-new-session" : "/save-step");
  
  //     let apiUrl = isCreateReportWithExistingClicked
  //       ? "http://localhost:5000/start-new-session"
  //       : "http://localhost:5000/save-step";
  
  //     const response = await axios.post(apiUrl, requestData, {
  //       headers: { "Content-Type": "multipart/form-data" },
  //     });
  
  //     console.log("✅ Response from API:", response.data);
  
  //     if (!sessionId || isCreateReportWithExistingClicked) {
  //       setSessionId(response.data.sessionId);
  //       alert("New Report Created Successfully!");
  //     } else {
  //       alert("Data saved successfully!");
  //     }
  
  //     if (response.data.filePath) {
  //       handleFormDataChange({
  //         AccountInformation: {
  //           ...formData.AccountInformation,
  //           logoOfBusiness: response.data.filePath,
  //         },
  //       });
  //     }
  
  //   } catch (error) {
  //     console.error("🔥 Error saving data:", error);
  
  //     if (error.response) {
  //       console.error("🚨 Full Error Response:", error.response.data);
  //     } else {
  //       console.error("❌ No response received from server");
  //     }
  
  //     alert("Failed to save data. Check console for details.");
  //   }
  // };
  
  
  


  // const handleSaveData = async () => {
  //   try {
  //     let requestData = new FormData();
  
  //     requestData.append("step", steps[currentStep - 1]);
  
  //     let formDataWithoutFile = { ...formData };
  
  //     if (formDataWithoutFile._id) {
  //       delete formDataWithoutFile._id;
  //     }
  
  //     if (formDataWithoutFile.AccountInformation) {
  //       delete formDataWithoutFile.AccountInformation.logoOfBusiness; // Remove file field
  //     }
  
  //     requestData.append("data", JSON.stringify(formDataWithoutFile));
  
  //     if (sessionId && sessionId !== "undefined") {
  //       requestData.append("sessionId", sessionId);
  //     }
  
  //     if (formData.AccountInformation?.logoOfBusiness instanceof File) {
  //       requestData.append("file", formData.AccountInformation.logoOfBusiness);
  //     }
  
  //     console.log("🚀 Sending Request:", requestData);
  
  //     const response = await axios.post("http://localhost:5000/save-step", requestData, {
  //       headers: { "Content-Type": "multipart/form-data" },
  //     });
  
  //     console.log("Response from /save-step:", response.data);
  
  //     if (!sessionId && response.data.sessionId) {
  //       setSessionId(response.data.sessionId);
  //     }
  
  //     if (response.data.filePath) {
  //       handleFormDataChange({
  //         AccountInformation: {
  //           ...formData.AccountInformation,
  //           logoOfBusiness: response.data.filePath,
  //         },
  //       });
  //     }
  
  //     alert("Data saved successfully!");
  //   } catch (error) {
  //     console.error("🔥 Error saving data:", error);
  //     alert("Failed to save data.");
  //   }
  // };
  
  

  // console.log("Revenue Data Fetched: ", formData?.Revenue);
  // console.log("MoreDetails DAta Fetched: ", formData?.MoreDetails);

  const handleUpdate = async () => {
    if (!sessionId) {
      alert("No session ID found. Please select a client and business first.");
      return;
    }

    try {
      await axios.post("http://localhost:5000/update-step", {
        sessionId,
        data: formData,
      });

      alert("Report updated successfully!");
    } catch (error) {
      console.error("Error updating report:", error);
      alert("Failed to update report.");
    }
  };

  // ✅ Memoized step rendering to prevent re-renders
  const stepContent = useMemo(() => {
    switch (currentStep) {
      case 1:
        return (
          <FirstStepBasicDetails
            formData={formData}
            onFormDataChange={handleFormDataChange} // ✅ Ensure it's passed correctly
            sessionId={sessionId}
            setSessionId={setSessionId}
          />
        );
      case 2:
        return (
          <SecondStepMOF
            formData={formData}
            onFormDataChange={handleFormDataChange}
          />
        );
      case 3:
        return (
          <ThirdStepCOP
            formData={formData}
            onFormDataChange={handleFormDataChange}
          />
        );
      case 4:
        return (
          <FourthStepPRS
            formData={formData}
            onFormDataChange={handleFormDataChange}
            onProjectionYearChange={handleProjectionYearChange}
          />
        );
      case 5:
        return (
          <FifthStepExpenses
            formData={formData}
            onFormDataChange={handleFormDataChange}
            expenseData={formData?.Expenses}
          />
        );
      case 6:
        return (
          <SixthRevenue
            formData={formData}
            onFormDataChange={handleFormDataChange}
            years={projectionYears}
            revenueData={formData?.Revenue}
          />
        );
      case 7:
        return (
          <SeventhStepMD
            formData={formData}
            onFormDataChange={handleFormDataChange}
            years={projectionYears}
            MoreDetailsData={formData?.MoreDetails}
          />
        );
      case 8:
        return <FinalStep formData={formData} />;
      default:
        return null;
    }
  }, [currentStep, formData, handleFormDataChange]);

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const renderMenuBar = () => {
    const authRole = localStorage.getItem("userRole");

    if (!authRole) {
      navigate("/login");
      return null;
    }

    switch (authRole) {
      case "admin":
        return <MenuBar userRole="admin" />;
      case "employee":
        return <MenuBar userRole="employee" />;
      case "client":
        return <MenuBar userRole="client" />;
      default:
        navigate("/login");
        return null;
    }
  };

  return (
    <div className="flex">
      {renderMenuBar()}
      <div className="App md:w-[80%] mx-auto shadow-xl rounded-2xl pb-2 bg-white">
        {/* Stepper Component */}
        <div className="container horizontal mt-5">
          <Stepper steps={steps} currentStep={currentStep} />
        </div>

        {/* ✅ Dropdown placed outside steps to persist selection */}
        {!isCreateReportClicked && userRole !== "client" && (
          <div className="mt-[4rem]">
            <ClientNameDropdown
              onClientSelect={() => {}}
              onBusinessSelect={handleBusinessSelect}
            />
          </div>
        )}

        {/* Step Content */}
        <div className="my-5">{stepContent}</div>

        {/* Stepper Control Buttons */}
        <StepperControl
          handleNext={handleNext}
          handleBack={handleBack}
          handleSave={handleSaveData}
          handleUpdate={handleUpdate}
          currentStep={currentStep}
          totalSteps={steps.length}
          isUpdateMode={isUpdateMode} // ✅ Pass to StepperControl
          handleCreateNewFromExisting = {handleCreateNewFromExisting}
        />
      </div>
    </div>
  );
};

export default MultiStepForm;

// import React, { useState, useCallback, useMemo, useEffect } from "react";
// import Stepper from "./Stepper";
// import StepperControl from "./StepperControl";
// import FirstStepBasicDetails from "./Steps/FirstStepBasicDetails";
// import SecondStepMOF from "./Steps/SecondStepMOF";
// import FinalStep from "./Steps/FinalStep";
// import ThirdStepCOP from "./Steps/ThirdStepCOP";
// import FourthStepPRS from "./Steps/FourthStepPRS";
// import FifthStepExpenses from "./Steps/FifthStepExpenses";
// import SixthRevenue from "./Steps/SixthRevenue";
// import SeventhStepMD from "./Steps/SeventhStepMD";
// import MenuBar from "./MenuBar";
// import { useNavigate, useLocation } from "react-router-dom";
// import axios from "axios";
// import ClientNameDropdown from "./Dropdown/clientNameDropdown";

// const MultiStepForm = () => {
//   const [currentStep, setCurrentStep] = useState(1);
//   const navigate = useNavigate();
//   const [sessionId, setSessionId] = useState(null);
//   const [projectionYears, setProjectionYears] = useState(5);
//   const [userRole, setUserRole] = useState("");
//   const location = useLocation();

//   const isCreateReportClicked = location.state?.isCreateReportClicked || false;

//   useEffect(() => {
//     const role = localStorage.getItem("userRole");
//     setUserRole(role);
//   }, []);

//   // Function to update projection years
//   const handleProjectionYearChange = (newYears) => {
//     setProjectionYears(newYears);
//   };
//   // ✅ State to store business data when selected in ReportDropdown
//   const [formData, setFormData] = useState({
//     AccountInformation: {},
//     MeansOfFinance: {},
//     CostOfProject: {},
//     ProjectReportSetting: {},
//     Expenses: {},
//     Revenue: {},
//     MoreDetails: {},
//   });

//   const steps = [
//     "Account Information",
//     "Means Of Finance",
//     "Cost Of Project",
//     "Project Report Settings",
//     "Expenses",
//     "Revenue",
//     "More Details",
//     "Complete",
//   ];

//   // ✅ Memoized function to prevent unnecessary re-renders
//   const handleFormDataChange = useCallback((stepData) => {
//     setFormData((prevData) => ({
//       ...prevData,
//       ...stepData,
//     }));
//   }, []);

//   // ✅ Handle business selection to populate ALL steps
//   const handleBusinessSelect = (businessData) => {
//     if (businessData) {
//       // console.log("Selected Business Data:", businessData); // Debugging
//       setFormData({
//         AccountInformation: businessData?.AccountInformation || {},
//         MeansOfFinance: businessData?.MeansOfFinance || {},
//         CostOfProject: businessData?.CostOfProject || {},
//         ProjectReportSetting: businessData?.ProjectReportSetting || {},
//         Expenses: businessData?.Expenses || {},
//         Revenue: businessData?.Revenue || {},
//         MoreDetails: businessData?.MoreDetails || {},
//       });

//       // ✅ Ensure immediate update by forcing re-render
//       setTimeout(() => {
//         setFormData((prev) => ({ ...prev })); // ✅ Triggers re-render
//       }, 0);
//     }
//   };

//   const handleSaveData = async () => {
//     try {
//       if (currentStep === 1) {
//         const response = await axios.post("http://localhost:5000/save-step", {
//           sessionId: sessionId || undefined,
//           step: steps[currentStep - 1],
//           data: formData,
//         });

//         if (!sessionId) {
//           setSessionId(response.data.sessionId);
//         }
//       } else {
//         if (!sessionId) {
//           alert("Error: No session ID found. Please start from Step 1.");
//           return;
//         }

//         await axios.post("http://localhost:5000/save-step", {
//           sessionId,
//           step: steps[currentStep - 1],
//           data: formData,
//         });
//       }

//       alert("Data saved successfully!");
//     } catch (error) {
//       // console.error("Error saving data:", error);
//       alert("Failed to save data.");
//     }
//   };

//   const stepContent = useMemo(() => {
//     switch (currentStep) {
//       case 1:
//         return (
//           <FirstStepBasicDetails
//             formData={formData}
//             onFormDataChange={handleFormDataChange}
//           />
//         );
//       case 2:
//         return (
//           <SecondStepMOF
//             formData={formData}
//             onFormDataChange={handleFormDataChange}
//           />
//         );
//       case 3:
//         return (
//           <ThirdStepCOP
//             formData={formData}
//             onFormDataChange={handleFormDataChange}
//           />
//         );
//       case 4:
//         return (
//           <FourthStepPRS
//             formData={formData}
//             onFormDataChange={handleFormDataChange}
//             onProjectionYearChange={handleProjectionYearChange}
//           />
//         );
//       case 5:
//         return (
//           <FifthStepExpenses
//             formData={formData}
//             onFormDataChange={handleFormDataChange}
//             expenseData={formData?.Expenses}
//           />
//         );
//       case 6:
//         return (
//           <SixthRevenue
//             formData={formData}
//             onFormDataChange={handleFormDataChange}
//             years={projectionYears}
//             revenueData={formData?.Revenue}
//           />
//         );
//       case 7:
//         return (
//           <SeventhStepMD
//             formData={formData}
//             onFormDataChange={handleFormDataChange}
//             years={projectionYears}
//             MoreDetailsData={formData?.MoreDetails}
//           />
//         );
//       case 8:
//         return <FinalStep formData={formData} />;
//       default:
//         return null;
//     }
//   }, [currentStep, formData, handleFormDataChange]);

//   const handleNext = () => {
//     if (currentStep < steps.length) {
//       setCurrentStep((prev) => prev + 1);
//     }
//   };

//   const handleBack = () => {
//     if (currentStep > 1) {
//       setCurrentStep((prev) => prev - 1);
//     }
//   };

//   const renderMenuBar = () => {
//     const authRole = localStorage.getItem("userRole");

//     if (!authRole) {
//       navigate("/login");
//       return null;
//     }

//     switch (authRole) {
//       case "admin":
//         return <MenuBar userRole="admin" />;
//       case "employee":
//         return <MenuBar userRole="employee" />;
//       case "client":
//         return <MenuBar userRole="client" />;
//       default:
//         navigate("/login");
//         return null;
//     }
//   };

//   return (
//     <div className="flex">
//       {renderMenuBar()}
//       <div className="App md:w-[80%] mx-auto shadow-xl rounded-2xl pb-2 bg-white">
//         {/* Stepper Component */}
//         <div className="container horizontal mt-5">
//           <Stepper steps={steps} currentStep={currentStep} />
//         </div>

//         {/* ✅ Dropdown placed outside steps to persist selection */}
//         <div className="mt-[4rem]">
//           {!isCreateReportClicked && userRole !== "client" && (
//             <ClientNameDropdown
//               onClientSelect={() => {}}
//               onBusinessSelect={handleBusinessSelect}
//             />
//           )}
//         </div>

//         {/* Step Content */}
//         <div className="my-5">{stepContent}</div>

//         {/* Stepper Control Buttons */}
//         <StepperControl
//           handleNext={handleNext}
//           handleBack={handleBack}
//           handleSave={handleSaveData}
//           currentStep={currentStep}
//           totalSteps={steps.length}
//         />
//       </div>
//     </div>
//   );
// };

// export default MultiStepForm;
