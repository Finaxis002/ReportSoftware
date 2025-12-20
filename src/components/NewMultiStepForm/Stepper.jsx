


import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";

const Stepper = ({ steps, currentStep, onStepClick }) => {
  const [newStep, setNewStep] = useState([]);
  const stepRef = useRef([]);


  useEffect(() => {
    if (!steps.length) return;

    const updatedSteps = steps.map((step, index) => ({
      description: step,
      completed: index < currentStep - 1,
      highlighted: index === currentStep - 1,
      selected: index <= currentStep - 1,
    }));

    // ✅ Prevent unnecessary state updates
    const isEqual =
      JSON.stringify(updatedSteps) === JSON.stringify(newStep);

    if (!isEqual) {
      console.log(`🚀 Stepper State Updated to Step ${currentStep}`);
      stepRef.current = updatedSteps;
      setNewStep(updatedSteps);
    }
  }, [steps, currentStep]);



  return (
    <div className="mx-4 p-2 flex justify-between items-center">
      {newStep.map((step, index) => (

        <div
          key={index}
          className="w-full flex items-center"
        >
          <div className="relative flex flex-col items-center">
            <div
              onClick={() => onStepClick(index + 1)}
              className={`cursor-pointer rounded-full transition duration-300 ease-in-out border-2 
        ${step.completed ? "border-teal-600 bg-teal-600 text-white"
                  : step.highlighted ? "border-teal-600 bg-teal-100 text-teal-600"
                    : "border-gray-300 bg-white text-gray-600"
                } h-12 w-12 flex items-center justify-center font-semibold`}
            >
              {index + 1}
            </div>
            <div className={`absolute top-16 text-center mt-2 w-32 text-xs font-medium uppercase 
      ${step.highlighted ? "text-teal-600 font-bold" : "text-gray-500"}
    `}>
              {step.description}
            </div>
          </div>
          {index !== steps.length - 1 && (
            <div
              className={`flex-auto border-t-2 transition duration-500 
        ${step.completed ? "border-teal-600" : "border-gray-300"}
      `}
            ></div>
          )}
        </div>

      ))}
    </div>
  );
};

export default Stepper;
