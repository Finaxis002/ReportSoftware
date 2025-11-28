import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from "react";
import Header from "./Header";
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
import EighthStep from "./Steps/EighthStep"
import MenuBar from "./MenuBar";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import axios from "axios";
import ReportDropdown from "./Dropdown/ReportDropdown";
import Swal from 'sweetalert2';
// import FileUpload from "./FileUpload";

const MultiStepForm = ({ userRole, userName }) => {
  // console.log("received generated PDf Data in Revenue MultiStep Form" , receivedGeneratedPDFData)
  const location = useLocation();
  const isUpdateMode = location.state?.isUpdateMode || false;
  const [currentStep, setCurrentStep] = useState(1);

  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState(null);
  const [projectionYears, setProjectionYears] = useState(0);
  const [error, setError] = useState("");
  const [requiredFieldErrors, setRequiredFieldErrors] = useState({});
  const isCreateReportClicked = location.state?.isCreateReportClicked || false;
  const isCreateReportWithExistingClicked =
  location.state?.isCreateReportWithExistingClicked || false;
  const reportData = location.state?.reportData || null;

  const [searchParams] = useSearchParams();
  const step = searchParams.get("step");

  useEffect(() => {
    if (step) {
      setCurrentStep(parseInt(step)); // Update step in state
    }
  }, [step]);

  // 👇 Add at the top
  const hasPreFilled = useRef(false);

  // 👇 This useEffect should be inside MultiStepForm.jsx (NOT Stepper.jsx!)
  useEffect(() => {
    if (
      !hasPreFilled.current &&
      isCreateReportWithExistingClicked &&
      reportData
    ) {
      const preFilledData = { ...reportData };
      delete preFilledData._id;
      delete preFilledData.sessionId;
      setFormData(preFilledData);
      hasPreFilled.current = true;
    }
  }, [isCreateReportWithExistingClicked, reportData]);

  // Function to update projection years
  const handleProjectionYearChange = (newYears) => {
    setProjectionYears(newYears);
  };

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

  // useEffect(() => {
  //   if (isCreateReportWithExistingClicked && reportData) {
  //     // Pre-fill the form data when creating new from existing report
  //     const preFilledData = { ...reportData }; // Clone the report data
  //     setFormData(preFilledData);
  //   }
  // }, [isCreateReportWithExistingClicked, reportData]);

  // Store data in localStorage whenever formData changes
  useEffect(() => {
    if (isCreateReportWithExistingClicked && reportData) {
      const preFilledData = { ...reportData };
      delete preFilledData._id;
      delete preFilledData.sessionId; // ✅ CRITICAL
      setFormData(preFilledData);
    }
  }, [isCreateReportWithExistingClicked, reportData]);

  useEffect(() => {
    localStorage.setItem("formData", JSON.stringify(formData));
  }, [formData]);

  const steps = [
    "Account Information",
    "Means Of Finance",
    "Cost Of Project",
    "Project Report Settings",
    "Expenses",
    "Revenue",
    "More Details",
    "Project Report Export",
    "Complete",
  ];

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
    // ✅ Create a deep copy of the fetched business data
    let cleanedBusinessData = JSON.parse(JSON.stringify(businessData));

    // ✅ Get current logged-in user and role from localStorage
    const currentUser =
      localStorage.getItem("adminName") ||
      localStorage.getItem("employeeName") ||
      "Unknown";
    const currentUserRole = localStorage.getItem("userRole") || "unknown";

    // ✅ REMOVE _id and sessionId if creating a new report
    if (isCreateReportWithExistingClicked) {
      delete cleanedBusinessData._id;
      delete cleanedBusinessData.sessionId;
      console.log("🗑 Removing _id and sessionId for new report creation...");
      setSessionId(null); // Reset sessionId for new report

      // ✅ Force update author info
      if (!cleanedBusinessData.AccountInformation) {
        cleanedBusinessData.AccountInformation = {};
      }

      cleanedBusinessData.AccountInformation.userRole = currentUserRole;
      cleanedBusinessData.AccountInformation.createdBy = currentUser;

      console.log("✍️ Overwriting author info:", {
        userRole: currentUserRole,
        createdBy: currentUser,
      });
    } else {
      setSessionId(sessionId || null); // Use sessionId when updating
    }

    console.log(
      "✅ Cleaned Business Data (Before Setting Form):",
      cleanedBusinessData
    );

    // ✅ Set final data in state
    setFormData(cleanedBusinessData);
  };

  const waitForReportId = async (sessionId, retries = 5, delay = 1000) => {
    console.log("⏳ Waiting for reportId for session:", sessionId);
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`🔍 Attempt ${attempt} to fetch reportId...`);
        const res = await axios.get(
          `https://reportsbe.sharda.co.in/api/activity/get-report-id?sessionId=${sessionId}`
        );
        
        console.log("📡 Response from get-report-id:", res.data);
        
        if (res.data?.reportId) {
          console.log("🎉 Successfully got reportId:", res.data.reportId);
          return res.data.reportId;
        }
        
        if (attempt < retries) {
          console.log(`⏸ Waiting ${delay}ms before next attempt...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } catch (err) {
        console.error(`⚠️ Attempt ${attempt} failed:`, err.message);
        if (attempt === retries) {
          console.error("❌ All attempts to fetch reportId failed");
          throw err;
        }
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    console.warn("⚠️ Exhausted all retries without getting reportId");
    return null;
  };

  const handleSaveData = async () => {
    try {
      let requestData = new FormData();
      requestData.append("step", steps[currentStep - 1]);
  
      const currentUser =
        localStorage.getItem("adminName") ||
        localStorage.getItem("employeeName") ||
        "Unknown";
      const currentUserRole = localStorage.getItem("userRole") || "unknown";
  
      let formDataWithoutFile = {
        ...formData,
        AccountInformation: {
          ...formData.AccountInformation,
          userRole: currentUserRole,
          createdBy: currentUser,
        },
      };
  
      formDataWithoutFile.CostOfProject = {
        ...formDataWithoutFile.CostOfProject,
        preliminaryExpenses: formData.preliminaryExpenses,
      };
  
      if (formDataWithoutFile._id) delete formDataWithoutFile._id;
  
      let apiUrl = "https://reportsbe.sharda.co.in/save-step";
      const isNew = !sessionId || isCreateReportWithExistingClicked;
  
      if (!isNew) {
        requestData.append("sessionId", sessionId);
      }
  
      if (formDataWithoutFile.AccountInformation) {
        delete formDataWithoutFile.AccountInformation.logoOfBusiness;
      }
  
      requestData.append("data", JSON.stringify(formDataWithoutFile));
  
      if (formData.AccountInformation?.logoOfBusiness instanceof File) {
        requestData.append("file", formData.AccountInformation.logoOfBusiness);
      }
  
      // ✅ API call first
      const response = await axios.post(apiUrl, requestData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      console.log("✅ Response from API:", response.data);
  
      // ✅ Set sessionId if it was just created
      if (isNew) {
        const newSessionId = response.data.sessionId;
        setSessionId(newSessionId);
        localStorage.setItem("activeSessionId", newSessionId);
  
        const reportTitle =
          formDataWithoutFile?.AccountInformation?.businessName || "Untitled";
  
        try {
          const reportId = await waitForReportId(newSessionId);
          if (reportId) {
            await logActivity("create", reportTitle, reportId);
          } else {
            console.warn("⚠️ No reportId available for logging");
          }
        } catch (err) {
          console.warn("⚠️ Activity logging failed:", err.message);
        }
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
      console.log("🔄 Creating new report from existing...");
      setSessionId(null);
  
      // Step 1: Prepare data
      let newData = JSON.parse(JSON.stringify(formData));
      delete newData._id;
      delete newData.sessionId;
      newData.cloneFromExisting = true;
  
      // Ensure creator info exists
      if (!newData.AccountInformation) newData.AccountInformation = {};
      newData.AccountInformation.userRole = userRole;
      newData.AccountInformation.createdBy = userName;
  
      const requestData = new FormData();
      requestData.append("data", JSON.stringify(newData));
  
      if (formData.AccountInformation?.logoOfBusiness instanceof File) {
        requestData.append("file", formData.AccountInformation.logoOfBusiness);
      }
  
      // Step 2: Create report
      const createResponse = await axios.post(
        "https://reportsbe.sharda.co.in/create-new-from-existing",
        requestData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
  
      const newSessionId = createResponse.data.sessionId;
      setSessionId(newSessionId);
      localStorage.setItem("activeSessionId", newSessionId);
  
      // Step 3: Retry to fetch the Mongo _id using sessionId
      const reportId = await waitForReportId(newSessionId);
      if (!reportId) {
        console.warn("❌ Could not fetch reportId, skipping activity log.");
        return;
      }
  
      // Step 4: Log activity now
      const reportTitle = newData.AccountInformation?.businessName || "Untitled";
      await logActivity("create", reportTitle, reportId);
  
      alert("✅ New Report Created Successfully!");
    } catch (error) {
      console.error("🔥 Error in create from existing:", error);
      alert(`❌ Failed: ${error.response?.data?.message || error.message}`);
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
        "https://reportsbe.sharda.co.in/update-step",
        {
          sessionId,
          data: updatedData,
        }
      );

      // console.log("✅ Update successful:", response.data);
      // alert("Report updated successfully!");
      if (response.status === 200 || response.status === 201) {
      console.log("✅ Update successful:", response.data);
      alert("Report updated successfully!");

    } else {
      console.error("⚠️ Unexpected response:", response);
      alert("Failed to update report."); 
    }

      await logActivity(
        "update",
        formData?.AccountInformation?.businessName || "Untitled"
      );

    } catch (error) {
      console.error(
        "❌ Error updating report:",
        error.response ? error.response.data : error.message
      );
      // alert("Failed to update report.");
    }
  };

  const handleSubmitFirstStep = () => {
    const errors = {};
    const { clientName, businessOwner, businessName, businessDescription } =
      formData?.AccountInformation || {};

    if (!clientName || clientName.trim() === "") {
      errors.clientName = "Client Name is required";
    }

    if (!businessOwner || businessOwner.trim() === "") {
      errors.businessOwner = "Business Owner is required";
    }

    if (!businessName || businessName.trim() === "") {
      errors.businessName = "Business Name is required";
    }

    if (!businessDescription || businessDescription.trim() === "") {
  errors.businessDescription = "Business Description is required";
} else {
  const wordCount = businessDescription.trim().split(/\s+/).length;
  if (wordCount < 10) {
    errors.businessDescription = "Business Description must be at least 10 words";
  }
}

    // if (Object.keys(errors).length > 0) {
    //   // 👇 Show alert
    //   alert("Please fill the required fields: " + Object.keys(errors).join(", "));
    // }
    const friendlyFieldNames = {
      clientName: "Client Name",
      businessOwner: "Business Owner",
      businessName: "Business Name",
      businessDescription: "Business Description"
    };

    if (Object.keys(errors).length > 0) {
      const missing = Object.keys(errors).map(
        (k) => friendlyFieldNames[k] || k
      );
      Swal.fire({
  icon: 'error',
  title: 'Required Fields Missing',
  html: `<div style="text-align:left;"><ul style="padding-left:1.5em;">${missing.map(m => `<li>${m}</li>`).join('')}</ul></div>`,
  confirmButtonColor: '#3085d6'
});

    }

    setRequiredFieldErrors(errors); // 👈 this sends the message to FirstStep

    return Object.keys(errors).length === 0;
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
            requiredFieldErrors={requiredFieldErrors}
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
          <EighthStep
            businessData={formData}
            sections={formData?.generatedPDF || {}}
            loading={false}
            formData={formData}
            onFormDataChange={handleFormDataChange}
            years={projectionYears}
            MoreDetailsData={formData?.MoreDetails}
          />
        );
      case 9:
        return (
          <FinalStep
            formData={formData}
            setCurrentStep={setCurrentStep}
            currentStep={currentStep || 1}
            userRole={userRole}
            userName={userName}
          />
        );
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
    // console.log(authRole);
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
        "https://reportsbe.sharda.co.in/create-new-from-existing",
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

  const goToLastStep = () => {
    const lastStep = steps.length;
    setCurrentStep(lastStep);
    navigate(`/MultistepForm?step=${lastStep}`, { replace: true }); // ✅ Update URL to last step
  };

  const handleStepClick = (stepNumber) => {
    if (currentStep === 1 && stepNumber > 1) {
      const isValid = handleSubmitFirstStep();
      if (!isValid) return; // Block navigation to step 2
    }
    console.log("Step clicked:", stepNumber);
    setCurrentStep(stepNumber);
  };

  const logActivity = async (action, reportTitle = "", reportId = "") => {
    try {
      const currentUser =
        localStorage.getItem("adminName") ||
        localStorage.getItem("employeeName") ||
        "Unknown";
      const currentUserRole = localStorage.getItem("userRole") || "unknown";
  
      const reportOwner = formData?.AccountInformation?.businessOwner || "";
  
      console.log("📝 Logging activity with:", {
        action,
        reportTitle,
        reportId,
        name: currentUser,
        role: currentUserRole
      });
  
      const response = await axios.post("https://reportsbe.sharda.co.in/api/activity/log", {
        action,
        reportTitle,
        reportId,
        reportOwner,
        performedBy: {
          name: currentUser,
          role: currentUserRole
        },
        timestamp: new Date().toISOString()
      });
  
      console.log("✅ Activity logged successfully:", response.data);
      return response.data;
    } catch (err) {
      console.error("❌ Failed to log activity:", {
        error: err.response?.data || err.message,
        action,
        reportTitle,
        reportId
      });
      throw err;
    }
  };
  

  return (
    <div className="flex h-[100vh]">
      {renderMenuBar()}
      <div className="App w-full shadow-xl rounded-2xl pb-2">
        <Header
          dashboardType={
            userRole === "admin" ? "Admin Dashboard" : "Employee Dashboard"
          }
        />

        {/* Stepper Component */}
        <div className="container horizontal mb-[3.5rem]">
          <Stepper
            steps={steps}
            currentStep={currentStep}
            onStepClick={handleStepClick}
          />
        </div>

        {/* ✅ Dropdown placed outside steps to persist selection */}
        {!isCreateReportClicked && userRole !== "client" && (
          <div className="">
            {/* <ClientNameDropdown
              onClientSelect={() => { }}
              onBusinessSelect={handleBusinessSelect}
            /> */}
            <ReportDropdown onBusinessSelect={handleBusinessSelect} />
          </div>
        )}
        <div>{stepContent}</div>
        <StepperControl
          handleNext={handleNext}
          handleBack={handleBack}
          handleSave={handleSaveData}
          handleUpdate={handleUpdate}
          currentStep={currentStep}
          totalSteps={steps.length}
          isUpdateMode={isUpdateMode}
          handleCreateNewFromExisting={handleCreateNewFromExisting}
          handleNextStep={handleNextStep}
          stepData={formData}
          disableNext={!!error}
          goToLastStep={goToLastStep}
          handleSubmitFirstStep={handleSubmitFirstStep}
          onStepClick={handleStepClick}
          isCreateReportWithExistingClicked={isCreateReportWithExistingClicked} // 👈 ADD THIS
        />

        {/* Stepper Control Buttons */}
      </div>
    </div>
  );
};

export default MultiStepForm;

////////////////////////////////////////////////////////////////
