


import React, { useState, useCallback, useMemo, useEffect } from "react";
import "../../css/reportForm.css"
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
import FileUpload from "./FileUpload";
import useStore from "./useStore";

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

      let apiUrl = "https://backend-three-pink.vercel.app/save-step"; // Always updating/saving

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
      console.log("🔄 Preparing to create a new report from an existing one...");

      // ✅ Remove `_id` to prevent MongoDB duplicate key error
      let newData = { ...formData };
      if (newData._id) {
        console.log("🗑 Removing old _id:", newData._id);
        delete newData._id;
      }

      // ✅ Remove existing sessionId (so a new document is created)
      if (newData.sessionId) {
        console.log("🗑 Removing old sessionId:", newData.sessionId);
        delete newData.sessionId;
      }

      // ✅ Prepare FormData for submission
      let requestData = new FormData();
      requestData.append("data", JSON.stringify(newData));

      if (formData.AccountInformation?.logoOfBusiness instanceof File) {
        requestData.append("file", formData.AccountInformation.logoOfBusiness);
      }

      console.log("🚀 Sending Request to /create-new-from-existing");

      // ✅ Step 1: Always create a new document
      const createResponse = await axios.post("https://backend-three-pink.vercel.app/create-new-from-existing", requestData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("✅ New Report Created:", createResponse.data);

      // ✅ Step 2+: Store the NEW sessionId to use in next steps
      const newSessionId = createResponse.data.sessionId;
      setSessionId(newSessionId);
      localStorage.setItem("activeSessionId", newSessionId); // Persist sessionId for next steps

      alert("New Report Created Successfully!");

    } catch (error) {
      console.error("🔥 Error creating new report from existing:", error);
      alert(`Failed to create new report: ${error.response?.data?.message || error.message}`);
    }
  };


  const handleUpdate = async () => {
    if (!sessionId) {
      alert("No session ID found. Please select a client and business first.");
      return;
    }

    try {
      await axios.post("https://backend-three-pink.vercel.app/update-step", {
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


  const handleNextStep = async (newStepData = {}, event) => {
    try {
      // Prevent default behavior if event exists
      if (event && event.preventDefault) {
        event.preventDefault();
      }

      // Ensure stepData is correctly merged with existing data
      const sanitizedStepData = { ...newStepData };

      // Remove problematic circular references (e.g., event, React elements, window)
      Object.keys(sanitizedStepData).forEach((key) => {
        if (
          sanitizedStepData[key] instanceof Event ||
          sanitizedStepData[key] instanceof HTMLElement ||
          typeof sanitizedStepData[key] === "function" ||
          (typeof sanitizedStepData[key] === "object" && sanitizedStepData[key] !== null && "window" in sanitizedStepData[key])
        ) {
          delete sanitizedStepData[key];
        }
      });

      // Clone formData safely (Avoid circular structure)
      const safeFormData = JSON.parse(JSON.stringify(formData, (key, value) => {
        if (typeof value === "object" && value !== null && "window" in value) {
          return undefined; // Remove any window references
        }
        return value;
      }));

      const requestData = {
        ...safeFormData,
        ...sanitizedStepData,
        sessionId: sessionId || undefined, // Send sessionId if exists
      };

      const formDataPayload = new FormData();
      formDataPayload.append("data", JSON.stringify(requestData));

      const response = await axios.post("https://backend-three-pink.vercel.app/create-new-from-existing", formDataPayload);

      if (response.status === 201 && !sessionId) {
        // Only store sessionId if it's Step 1
        setSessionId(response.data.sessionId);
        localStorage.setItem("sessionId", response.data.sessionId);
      }

      console.log("✅ Step Saved:", response.data);
    } catch (error) {
      console.error("❌ Error saving step:", error);
    }

    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleFileData = (uploadedData) => {
    console.log("📥 Received Data from File Upload:", uploadedData); // Debugging Log

    setFormData((prevData) => ({
        ...prevData,
        AccountInformation: {
            ...prevData.AccountInformation, // Preserve existing data
            ...uploadedData.AccountInformation, // Merge new data
        },
        CostOfProject: {
          ...prevData.CostOfProject, // Preserve existing data
          ...uploadedData.CostOfProject, // Merge uploaded data
      },
    }));
};


  return (
    <div className="flex">
      {renderMenuBar()}
      <div className="App md:w-[80%] mx-auto shadow-xl rounded-2xl pb-2 bg-white">
        {/* Stepper Component */}
        <div className="container horizontal mt-5">
          <Stepper steps={steps} currentStep={currentStep} />
        </div>

        {isCreateReportClicked && (
          <div className="my-5">
            <FileUpload setFormData={handleFileData} />
          </div>
        )}
        {/* <div className="my-5">
          <FileUpload setFormData={handleFileData} />
        </div> */}


        {/* ✅ Dropdown placed outside steps to persist selection */}
        {!isCreateReportClicked && userRole !== "client" && (
          <div className="mt-[4rem]">
            <ClientNameDropdown
              onClientSelect={() => { }}
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
          handleCreateNewFromExisting={handleCreateNewFromExisting}
          handleNextStep={handleNextStep}
          stepData={formData}
        />
      </div>
    </div>
  );
};

export default MultiStepForm;














// import React, { useState, useCallback, useMemo, useEffect } from "react";
// import "../../css/reportForm.css";
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
// import FileUpload from "./FileUpload";

// const MultiStepForm = () => {
//   const location = useLocation();
//   const isUpdateMode = location.state?.isUpdateMode || false; // ✅ Check if navigated from Update Report
//   const [currentStep, setCurrentStep] = useState(1);
//   const navigate = useNavigate();
//   const [sessionId, setSessionId] = useState(null);
//   const [projectionYears, setProjectionYears] = useState(0);
//   const [userRole, setUserRole] = useState("");

//   const isCreateReportClicked = location.state?.isCreateReportClicked || false;
//   const isCreateReportWithExistingClicked =
//     location.state?.isCreateReportWithExistingClicked || false;

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

//   const handleBusinessSelect = (businessData, sessionId) => {
//     setFormData(businessData); // ✅ Populate form fields correctly
//     setSessionId(sessionId || null); // ✅ Store sessionId separately
//   };

//   const handleSaveData = async () => {
//     try {
//       let requestData = new FormData();
//       requestData.append("step", steps[currentStep - 1]); // Track current step

//       let formDataWithoutFile = { ...formData };

//       // ✅ Remove `_id` field to prevent MongoDB from generating a new one
//       if (formDataWithoutFile._id) {
//         delete formDataWithoutFile._id;
//       }

//       let apiUrl = "https://backend-three-pink.vercel.app/save-step"; // Always updating/saving

//       if (!sessionId) {
//         // 🆕 First Step - Creating a new document
//         console.log("🆕 First Step: Creating New Report...");
//       } else {
//         // 🔄 Subsequent Steps - Updating existing document
//         console.log("🔄 Updating Existing Report...");
//         requestData.append("sessionId", sessionId);
//       }

//       // ✅ Remove `logoOfBusiness` before sending (if needed)
//       if (formDataWithoutFile.AccountInformation) {
//         delete formDataWithoutFile.AccountInformation.logoOfBusiness;
//       }

//       requestData.append("data", JSON.stringify(formDataWithoutFile));

//       if (formData.AccountInformation?.logoOfBusiness instanceof File) {
//         requestData.append("file", formData.AccountInformation.logoOfBusiness);
//       }

//       console.log(`🚀 Sending Request to API: ${apiUrl}`);
//       console.log("📩 Request Data:", requestData);

//       const response = await axios.post(apiUrl, requestData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       console.log("✅ Response from API:", response.data);

//       if (!sessionId) {
//         // ✅ Store sessionId from Step 1 so that future steps use it
//         setSessionId(response.data.sessionId);
//         console.log("🆔 Stored sessionId:", response.data.sessionId);
//       }

//       alert("Data saved successfully!");

//       if (response.data.filePath) {
//         handleFormDataChange({
//           AccountInformation: {
//             ...formData.AccountInformation,
//             logoOfBusiness: response.data.filePath,
//           },
//         });
//       }
//     } catch (error) {
//       console.error("🔥 Error saving data:", error);

//       if (error.response) {
//         console.error("🚨 Full Error Response:", error.response.data);
//       } else {
//         console.error("❌ No response received from server");
//       }

//       alert(
//         `Failed to save data: ${error.response?.data?.message || error.message}`
//       );
//     }
//   };

//   const handleCreateNewFromExisting = async () => {
//     try {
//       console.log(
//         "🔄 Preparing to create a new report from an existing one..."
//       );

//       // ✅ Remove `_id` to prevent MongoDB duplicate key error
//       let newData = { ...formData };
//       if (newData._id) {
//         console.log("🗑 Removing old _id:", newData._id);
//         delete newData._id;
//       }

//       // ✅ Remove existing sessionId (so a new document is created)
//       if (newData.sessionId) {
//         console.log("🗑 Removing old sessionId:", newData.sessionId);
//         delete newData.sessionId;
//       }

//       // ✅ Prepare FormData for submission
//       let requestData = new FormData();
//       requestData.append("data", JSON.stringify(newData));

//       if (formData.AccountInformation?.logoOfBusiness instanceof File) {
//         requestData.append("file", formData.AccountInformation.logoOfBusiness);
//       }

//       console.log("🚀 Sending Request to /create-new-from-existing");

//       // ✅ Step 1: Always create a new document
//       const createResponse = await axios.post(
//         "https://backend-three-pink.vercel.app/create-new-from-existing",
//         requestData,
//         {
//           headers: { "Content-Type": "multipart/form-data" },
//         }
//       );

//       console.log("✅ New Report Created:", createResponse.data);

//       // ✅ Step 2+: Store the NEW sessionId to use in next steps
//       const newSessionId = createResponse.data.sessionId;
//       setSessionId(newSessionId);
//       localStorage.setItem("activeSessionId", newSessionId); // Persist sessionId for next steps

//       alert("New Report Created Successfully!");
//     } catch (error) {
//       console.error("🔥 Error creating new report from existing:", error);
//       alert(
//         `Failed to create new report: ${
//           error.response?.data?.message || error.message
//         }`
//       );
//     }
//   };

//   const handleUpdate = async () => {
//     if (!sessionId) {
//       alert("No session ID found. Please select a client and business first.");
//       return;
//     }

//     try {
//       await axios.post("https://backend-three-pink.vercel.app/update-step", {
//         sessionId,
//         data: formData,
//       });

//       alert("Report updated successfully!");
//     } catch (error) {
//       console.error("Error updating report:", error);
//       alert("Failed to update report.");
//     }
//   };

//   // ✅ Memoized step rendering to prevent re-renders
//   const stepContent = useMemo(() => {
//     switch (currentStep) {
//       case 1:
//         return (
//           <FirstStepBasicDetails
//             formData={formData}
//             onFormDataChange={handleFormDataChange} // ✅ Ensure it's passed correctly
//             sessionId={sessionId}
//             setSessionId={setSessionId}
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

//   const handleNextStep = async (newStepData = {}, event) => {
//     try {
//       // Prevent default behavior if event exists
//       if (event && event.preventDefault) {
//         event.preventDefault();
//       }

//       // Ensure stepData is correctly merged with existing data
//       const sanitizedStepData = { ...newStepData };

//       // Remove problematic circular references (e.g., event, React elements, window)
//       Object.keys(sanitizedStepData).forEach((key) => {
//         if (
//           sanitizedStepData[key] instanceof Event ||
//           sanitizedStepData[key] instanceof HTMLElement ||
//           typeof sanitizedStepData[key] === "function" ||
//           (typeof sanitizedStepData[key] === "object" &&
//             sanitizedStepData[key] !== null &&
//             "window" in sanitizedStepData[key])
//         ) {
//           delete sanitizedStepData[key];
//         }
//       });

//       // Clone formData safely (Avoid circular structure)
//       const safeFormData = JSON.parse(
//         JSON.stringify(formData, (key, value) => {
//           if (
//             typeof value === "object" &&
//             value !== null &&
//             "window" in value
//           ) {
//             return undefined; // Remove any window references
//           }
//           return value;
//         })
//       );

//       const requestData = {
//         ...safeFormData,
//         ...sanitizedStepData,
//         sessionId: sessionId || undefined, // Send sessionId if exists
//       };

//       const formDataPayload = new FormData();
//       formDataPayload.append("data", JSON.stringify(requestData));

//       const response = await axios.post(
//         "https://backend-three-pink.vercel.app/create-new-from-existing",
//         formDataPayload
//       );

//       if (response.status === 201 && !sessionId) {
//         // Only store sessionId if it's Step 1
//         setSessionId(response.data.sessionId);
//         localStorage.setItem("sessionId", response.data.sessionId);
//       }

//       console.log("✅ Step Saved:", response.data);
//     } catch (error) {
//       console.error("❌ Error saving step:", error);
//     }

//     if (currentStep < steps.length) {
//       setCurrentStep((prev) => prev + 1);
//     }
//   };

//   const handleFileData = (uploadedData) => {
//     console.log("📥 Received Data from File Upload:", uploadedData); // Debugging Log

//     setFormData((prevData) => ({
//         ...prevData,
//         AccountInformation: {
//             ...prevData.AccountInformation, // Preserve existing data
//             ...uploadedData.AccountInformation, // Merge new data
//         },
//         CostOfProject: {
//           ...prevData.CostOfProject, // Preserve existing data
//           ...uploadedData.CostOfProject, // Merge uploaded data
//       },
//     }));
// };

//   return (
//     <div className="flex">
//       {renderMenuBar()}
//       <div className="App md:w-[80%] mx-auto shadow-xl rounded-2xl pb-2 bg-white">
//         {/* Stepper Component */}
//         <div className="container horizontal mt-5">
//           <Stepper steps={steps} currentStep={currentStep} />
//         </div>

//         {/* ✅ Dropdown placed outside steps to persist selection */}
//         {!isCreateReportClicked && userRole !== "client" && (
//           <div className="mt-[4rem]">
//             <ClientNameDropdown
//               onClientSelect={() => {}}
//               onBusinessSelect={handleBusinessSelect}
//             />
//           </div>
//         )}

//         {/* Step Content */}
//         <div className="my-5">{stepContent}</div>

//         {/* Stepper Control Buttons */}
//         <StepperControl
//           handleNext={handleNext}
//           handleBack={handleBack}
//           handleSave={handleSaveData}
//           handleUpdate={handleUpdate}
//           currentStep={currentStep}
//           totalSteps={steps.length}
//           isUpdateMode={isUpdateMode} // ✅ Pass to StepperControl
//           handleCreateNewFromExisting={handleCreateNewFromExisting}
//           handleNextStep={handleNextStep}
//           stepData={formData}
//         />
//       </div>
//     </div>
//   );
// };

// export default MultiStepForm;











