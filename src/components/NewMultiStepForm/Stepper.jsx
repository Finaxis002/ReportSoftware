import React, { useEffect, useState, useRef } from "react";

const Stepper = ({ steps, currentStep }) => {
  const [newStep, setNewStep] = useState([]);
  const stepRef = useRef();

  const updateStep = (stepNumber, steps) => {
    return steps.map((step, index) => ({
      ...step,
      completed: index < stepNumber,
      highlighted: index === stepNumber,
      selected: index <= stepNumber,
    }));
  };

  useEffect(() => {
    if (!steps.length) return;

    const stepState = steps.map((step, index) => ({
      description: step,
      completed: false,
      highlighted: index === 0,
      selected: index === 0,
    }));

    stepRef.current = stepState;
    const updatedSteps = updateStep(currentStep - 1, stepRef.current);

    // Prevent unnecessary re-renders
    if (JSON.stringify(updatedSteps) !== JSON.stringify(newStep)) {
      setNewStep(updatedSteps);
    }
  }, [steps, currentStep]);

  return (
    <div className="mx-4 p-2 flex justify-between items-center">
      {newStep.map((step, index) => (
        <div key={index} className="w-full flex items-center">
          <div className="relative flex flex-col items-center text-teal-600">
            <div
              className={`rounded-full transition duration-300 ease-in-out border-2 ${
                step.completed
                  ? "border-teal-600 bg-teal-600 text-white"
                  : step.highlighted
                  ? "border-teal-600 bg-teal-100 text-teal-600"
                  : "border-gray-300 bg-white text-gray-600"
              } h-12 w-12 flex items-center justify-center py-3`}
            >
              {index + 1}
            </div>
            <div className={`absolute top-16 text-center mt-2 w-32 text-xs font-medium uppercase ${
              step.highlighted ? "text-teal-600" : "text-gray-500"
            }`}>
              {step.description}
            </div>
          </div>
          {index !== steps.length - 1 && (
            <div
              className={`flex-auto border-t-2 transition duration-500 ${
                step.completed ? "border-teal-600" : "border-gray-300"
              }`}
            ></div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Stepper;
