import React, { useState, useCallback, useMemo, useEffect } from "react";
import "../../css/reportForm.css";
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
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import axios from "axios";
import ReportDropdown from "./Dropdown/ReportDropdown";

// import FileUpload from "./FileUpload";

const MultiStepForm = ({ userRole, userName }) => {
  // console.log("received generated PDf Data in Revenue MultiStep Form" , receivedGeneratedPDFData)
  const location = useLocation();
  const isUpdateMode = location.state?.isUpdateMode || false; // ✅ Check if navigated from Update Report
  // const [currentStep, setCurrentStep] = useState(1); // Manages step state
  
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState(null);
  const [projectionYears, setProjectionYears] = useState(0);
  const [error, setError] = useState('');

  const isCreateReportClicked = location.state?.isCreateReportClicked || false;
  const isCreateReportWithExistingClicked =
    location.state?.isCreateReportWithExistingClicked || false;
  const [searchParams] = useSearchParams();
  // const step = searchParams.get("step");
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

  // const [currentStep, setCurrentStep] = useState(step);
  const [currentStep, setCurrentStep] = useState(() => {
    const step = parseInt(searchParams.get("step")) || 1;
    return step > 0 && step <= steps.length ? step : 1;
  });
  




  // useEffect(() => {
  //   if (step) {
  //     setCurrentStep(parseInt(step)); // Update step in state
  //   }
  // }, [step]);

  // useEffect(() => {
  //   const step = parseInt(searchParams.get("step")) || 1;
  //   if (step !== currentStep && step > 0 && step <= steps.length) {
  //     setCurrentStep(step);
  //   }
  // }, [searchParams]);
  useEffect(() => {
    const step = parseInt(searchParams.get("step")) || 1;
    if (step !== currentStep && step > 0 && step <= steps.length) {
      console.log(`✅ Setting Step from URL: ${step}`); // Debugging Log ✅
      setCurrentStep(step);
    }
  }, [searchParams, steps]); // ✅ Depend on steps to avoid async conflicts
  
  
  

  // Function to update projection years
  const handleProjectionYearChange = (newYears) => {
    setProjectionYears(newYears);
  };
  // ✅ State to store business data when selected in ReportDropdown
  // const [formData, setFormData] = useState({
  //   AccountInformation: {},
  //   MeansOfFinance: {},
  //   CostOfProject: {},
  //   ProjectReportSetting: {},
  //   Expenses: {},
  //   Revenue: {},
  //   MoreDetails: {},
  // });

  const [formData, setFormData] = useState({
    AccountInformation: {},
    MeansOfFinance: {},
    CostOfProject: {},
    ProjectReportSetting: {},
    Expenses: {},
    Revenue: {},
    MoreDetails: {},
    generatedPDF: {},
  });

  // Store data in localStorage whenever formData changes
  useEffect(() => {
    localStorage.setItem("formData", JSON.stringify(formData));
  }, [formData]);

  
  // ✅ Memoized function to prevent unnecessary re-renders
  const handleFormDataChange = useCallback(
    (stepData) => {
      setFormData((prevData) => ({
        ...prevData,
        ...stepData,
        userRole, // ✅ Include userRole
      }));
    },
    [userRole]
  );

  const handleBusinessSelect = (businessData, sessionId) => {
    // ✅ Create a new object (Ensures NO reference issues)
    let cleanedBusinessData = JSON.parse(JSON.stringify(businessData));

    // ✅ REMOVE `_id` only when creating a new report from existing
    if (isCreateReportWithExistingClicked) {
      delete cleanedBusinessData._id;
      delete cleanedBusinessData.sessionId; // 🚀 Ensure sessionId is removed for new report creation
      console.log(
        "🗑 Removing `_id` and `sessionId` for new report creation..."
      );
      setSessionId(null); // Reset sessionId for new report
    } else {
      setSessionId(sessionId || null); // Keep sessionId when updating an existing report
    }

    console.log(
      "✅ Cleaned Business Data (Before Setting Form):",
      cleanedBusinessData
    );

    setFormData(cleanedBusinessData);
  };

  const handleSaveData = async () => {
    try {
      let requestData = new FormData();

      requestData.append("step", steps[currentStep - 1]);

      // ✅ Include userRole explicitly in formData
      let formDataWithoutFile = {
        ...formData,
        userRole,
      };

      if (formDataWithoutFile._id) delete formDataWithoutFile._id;

      let apiUrl = "https://backend-three-pink.vercel.app/save-step";

      if (!sessionId || isCreateReportWithExistingClicked) {
        apiUrl =
          "https://backend-three-pink.vercel.app/create-new-from-existing";
        localStorage.removeItem("activeSessionId");
        setSessionId(null);
      } else {
        requestData.append("sessionId", sessionId);
      }

      if (formDataWithoutFile.AccountInformation) {
        delete formDataWithoutFile.AccountInformation.logoOfBusiness;
      }

      requestData.append("data", JSON.stringify(formDataWithoutFile));

      if (formData.AccountInformation?.logoOfBusiness instanceof File) {
        requestData.append("file", formData.AccountInformation.logoOfBusiness);
      }

      console.log(`🚀 Sending Request to API: ${apiUrl}`);

      const response = await axios.post(apiUrl, requestData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("✅ Response from API:", response.data);

      if (!sessionId || isCreateReportWithExistingClicked) {
        setSessionId(response.data.sessionId);
        localStorage.setItem("activeSessionId", response.data.sessionId);
      }

      alert("Data saved successfully!");
    } catch (error) {
      console.error("🔥 Error saving data:", error);
      alert(
        `Failed to save data: ${error.response?.data?.message || error.message}`
      );
    }
  };

  const handleCreateNewFromExisting = async () => {
    try {
      console.log(
        "🔄 Preparing to create a new report from an existing one..."
      );

      // ✅ Deep Copy `formData` to remove any lingering references
      let newData = JSON.parse(JSON.stringify(formData));

      // ✅ REMOVE `_id` & `sessionId` (CRITICAL)
      delete newData._id;
      delete newData.sessionId;

      console.log(
        "🚀 Final Payload Before API Call:",
        JSON.stringify(newData, null, 2)
      );

      // ✅ Prepare FormData
      let requestData = new FormData();
      requestData.append("data", JSON.stringify(newData));

      if (formData.AccountInformation?.logoOfBusiness instanceof File) {
        requestData.append("file", formData.AccountInformation.logoOfBusiness);
      }

      console.log("🚀 Sending Request to /create-new-from-existing");

      // ✅ Step 1: Always create a new document (NO `sessionId`)
      const createResponse = await axios.post(
        "https://backend-three-pink.vercel.app/create-new-from-existing",
        requestData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log("✅ New Report Created:", createResponse.data);

      // ✅ Step 2: Store the NEW `sessionId`
      const newSessionId = createResponse.data.sessionId;
      setSessionId(newSessionId);
      localStorage.setItem("activeSessionId", newSessionId);

      alert("✅ New Report Created Successfully!");
    } catch (error) {
      console.error("🔥 Error creating new report from existing:", error);
      alert(
        `❌ Failed to create new report: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  const handleUpdate = async () => {
    if (!sessionId) {
      alert("No session ID found. Please select a business first.");
      return;
    }

    console.log("🔄 Updating session:", sessionId);
    console.log("📦 FormData:", formData);

    try {
      const updatedData = {
        ...formData,
        userRole, // ✅ Include userRole here
      };

      const response = await axios.post(
        "https://backend-three-pink.vercel.app/update-step",
        {
          sessionId,
          data: updatedData,
        }
      );

      console.log("✅ Update successful:", response.data);
      alert("Report updated successfully!");
    } catch (error) {
      console.error(
        "❌ Error updating report:",
        error.response ? error.response.data : error.message
      );
      alert("Failed to update report.");
    }
  };


  

  const stepContent = useMemo(() => {
    switch (currentStep) {
      case 1:
        return (
          <FirstStepBasicDetails
            formData={formData}
            onFormDataChange={handleFormDataChange} // ✅ Ensure it's passed correctly
            sessionId={sessionId}
            setSessionId={setSessionId}
            userRole={userRole}
            userName={userName}
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
            setError={setError}
            error={error}
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
        return (
          <FinalStep formData={formData} setCurrentStep={setCurrentStep}  currentStep={currentStep} />
        );
      default:
        return null;
    }
  }, [currentStep, formData, handleFormDataChange]);

  // const handleNext = () => {
  //   if (currentStep < steps.length) {
  //     setCurrentStep((prev) => prev + 1);
  //   }
  // };

  // const handleBack = () => {
  //   if (currentStep > 1) {
  //     setCurrentStep((prev) => prev - 1);
  //   }
  // };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep((prev) => {
        const nextStep = prev + 1;
        console.log(`🔄 Next Step: ${nextStep}`); // Debugging Log ✅
        navigate(`/MultistepForm?step=${nextStep}`, { replace: true });
        return nextStep; // ✅ Ensure state update before navigation
      });
    }
  };
  
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => {
        const previousStep = prev - 1;
        console.log(`🔄 Previous Step: ${previousStep}`); // Debugging Log ✅
        navigate(`/MultistepForm?step=${previousStep}`, { replace: true });
        return previousStep; // ✅ Ensure state update before navigation
      });
    }
  };
  
  
  
  

  const renderMenuBar = () => {
    const authRole = localStorage.getItem("userRole");
    console.log(authRole);
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
          (typeof sanitizedStepData[key] === "object" &&
            sanitizedStepData[key] !== null &&
            "window" in sanitizedStepData[key])
        ) {
          delete sanitizedStepData[key];
        }
      });

      // Clone formData safely (Avoid circular structure)
      const safeFormData = JSON.parse(
        JSON.stringify(formData, (key, value) => {
          if (
            typeof value === "object" &&
            value !== null &&
            "window" in value
          ) {
            return undefined; // Remove any window references
          }
          return value;
        })
      );

      const requestData = {
        ...safeFormData,
        ...sanitizedStepData,
        sessionId: sessionId || undefined, // Send sessionId if exists
      };

      const formDataPayload = new FormData();
      formDataPayload.append("data", JSON.stringify(requestData));

      const response = await axios.post(
        "https://backend-three-pink.vercel.app/create-new-from-existing",
        formDataPayload
      );

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


  return (
    <div className="flex">
      {renderMenuBar()}
      <div className="App md:w-[80%] mx-auto shadow-xl rounded-2xl pb-2 bg-white">
        {/* Stepper Component */}
        <div className="container horizontal mt-5">
          <Stepper steps={steps} currentStep={currentStep} />
        </div>

        {/* {isCreateReportClicked && (
          <div className="my-5">
            <FileUpload setFormData={handleFileData} />
          </div>
        )} */}
        

        {/* ✅ Dropdown placed outside steps to persist selection */}
        {!isCreateReportClicked && userRole !== "client" && (
          <div className="mt-[4rem]">
            {/* <ClientNameDropdown
              onClientSelect={() => { }}
              onBusinessSelect={handleBusinessSelect}
            /> */}
            <ReportDropdown onBusinessSelect={handleBusinessSelect} />
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
          disableNext={!!error}
        />
      </div>
    </div>
  );
};

export default MultiStepForm;
