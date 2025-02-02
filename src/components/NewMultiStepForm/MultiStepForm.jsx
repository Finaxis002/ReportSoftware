import React, { useState, useCallback, useMemo } from "react";
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
import { useNavigate } from "react-router-dom";

const MultiStepForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    AccountInformation: {},
    MeansOfFinance: {},
    CostOfProject: {},
    ProjestReportSetting: {},
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

  // Memoized function to prevent unnecessary re-renders
  const handleFormDataChange = useCallback((stepData) => {
    setFormData((prevData) => ({
      ...prevData,
      ...stepData,
    }));
  }, []);

  // Memoized step rendering to prevent re-rendering
  const stepContent = useMemo(() => {
    switch (currentStep) {
      case 1:
        return (
          <FirstStepBasicDetails
            formData={formData}
            onFormDataChange={handleFormDataChange}
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
          />
        );
      case 5:
        return (
          <FifthStepExpenses
            formData={formData}
            onFormDataChange={handleFormDataChange}
          />
        );
      case 6:
        return (
          <SixthRevenue
            formData={formData}
            onFormDataChange={handleFormDataChange}
          />
        );
      case 7:
        return (
          <SeventhStepMD
            formData={formData}
            onFormDataChange={handleFormDataChange}
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
    const authRole = localStorage.getItem("userRole"); // Get the role from localStorage or state

    // Check if authRole exists, and if it's a valid role
    if (!authRole) {
      navigate("/login"); // If there's no role, redirect to login
      return null; // Optionally render nothing while redirecting
    }

    switch (authRole) {
      case "admin":
        return <MenuBar userRole="admin" />;
      case "employee":
        return <MenuBar userRole="employee" />;
      case "client":
        return <MenuBar userRole="client" />;
      default:
        navigate("/login"); // If role doesn't match, redirect to login
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

        {/* Step Content */}
        <div className="my-5">{stepContent}</div>

        {/* Stepper Control Buttons */}
        <StepperControl
          handleNext={handleNext}
          handleBack={handleBack}
          currentStep={currentStep}
          totalSteps={steps.length}
        />
      </div>
    </div>
  );
};

export default MultiStepForm;
