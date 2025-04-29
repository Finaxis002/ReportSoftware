import React, { useState, useEffect, useRef } from "react";
import deleteImg from "../delete.png";
import checkImg from "../check.png";

const ThirdStepCOP = ({ formData, onFormDataChange, setError, error }) => {
  const prevDataRef = useRef(null);

  const defaultData = {
    Land: {
      name: "Land",
      id: "Land",
      amount: 0,
      rate: 0,
      isCustom: false,
      isSelected: false,
    },
    Building: {
      name: "Building",
      id: "Building",
      amount: 0,
      rate: 10,
      isCustom: false,
      isSelected: false,
    },
    FurnitureandFittings: {
      name: "Furniture and Fittings",
      id: "FurnitureandFittings",
      amount: 0,
      rate: 10,
      isCustom: false,
      isSelected: false,
    },
    PlantMachinery: {
      name: "Plant Machinery",
      id: "PlantMachinery",
      amount: 0,
      rate: 15,
      isCustom: false,
      isSelected: false,
    },
    FixedAssets: {
      name: "Fixed Assets",
      id: "FixedAssets",
      amount: 0,
      rate: 5,
      isCustom: false,
      isSelected: false,
    },
    IntangibleAssets: {
      name: "Intangible Assets",
      id: "IntangibleAssets",
      amount: 0,
      rate: 25,
      isCustom: false,
      isSelected: false,
    },
    ComputersPeripherals: {
      name: "Computer Peripherals",
      id: "ComputersPeripherals",
      amount: 0,
      rate: 40,
      isCustom: false,
      isSelected: false,
    },
    Miscellaneous: {
      name: "Miscellaneous",
      id: "Miscellaneous",
      amount: 0,
      rate: 15,
      isCustom: false,
      isSelected: false,
    },
  };

  const [localData, setLocalData] = useState(defaultData);
  const [meansOfFinanceSummary, setMeansOfFinanceSummary] = useState({
    meansOfFinanceTotal: 0,
    totalLoan: 0,
    totalProjectCost: 0,
    difference: 0,
  });
  const [infoMessage, setInfoMessage] = useState("");

  // Format number with commas (Indian format)
  const formatNumberWithCommas = (num) => {
    if (num === null || num === undefined || num === "") return "";

    const str = num.toString().replace(/,/g, "");

    // Don't format while user is typing incomplete decimals (e.g., ends with "." or ".0")
    if (str.endsWith(".") || str.match(/\.\d{0,1}$/)) {
      return str;
    }

    const numericValue = Number(str);
    if (isNaN(numericValue)) return num;

    // Format with or without decimals depending on whether there are decimal digits
    return str.includes(".")
      ? numericValue.toLocaleString("en-IN", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        })
      : numericValue.toLocaleString("en-IN");
  };

  // Remove commas for raw value
  const removeCommas = (str) => str?.toString().replace(/,/g, "");

  // ✅ Populate `localData` from `formData.CostOfProject` on mount
  useEffect(() => {
    if (formData?.CostOfProject) {
      const newData = {
        ...defaultData,
        ...formData.CostOfProject,
      };

      // Prevent unnecessary updates
      if (
        !prevDataRef.current ||
        JSON.stringify(prevDataRef.current) !== JSON.stringify(newData)
      ) {
        // console.log("Populating CostOfProject data:", newData);
        setLocalData(newData);
        prevDataRef.current = newData;
      }
    }
  }, [formData?.CostOfProject]);

  // ✅ Save `localData` back to `onFormDataChange` (Avoiding infinite loop)
  useEffect(() => {
    if (JSON.stringify(localData) !== JSON.stringify(prevDataRef.current)) {
      onFormDataChange({ CostOfProject: localData });
      prevDataRef.current = localData;
    }
  }, [localData, onFormDataChange]);

  // ✅ Handle input changes
  const handleChange = (event, key, field) => {
    const { value } = event.target;
    let newValue = value;

    if (field === "amount") {
      const raw = removeCommas(value);
      if (raw === "" || /^\d*\.?\d*$/.test(raw)) {
        newValue = raw; // Keep it as string to preserve trailing '.' or '.0'
      } else {
        return; // Block invalid input
      }
    } else if (field === "rate") {
      newValue = value.trim() === "" ? 0 : parseFloat(value) || 0;
    }

    setLocalData((prevData) => ({
      ...prevData,
      [key]: {
        ...prevData[key],
        [field]: newValue,
      },
    }));
  };

  const calculatedTotal =
    Object.values(localData).reduce(
      (total, field) => total + parseFloat(field.amount || 0),
      0
    ) + Number(formData.MeansOfFinance.totalWorkingCapital || 0);

  useEffect(() => {
    const meansOfFinanceTotal = calculatedTotal;
    const totalLoan = parseFloat(
      removeCommas(formData?.MeansOfFinance?.total || 0)
    );

    // ✅ Fix: handle floating point precision by using Math.abs
    const difference = totalLoan - meansOfFinanceTotal;
    const isMatch = Math.abs(difference) < 0.01;

    if (isMatch) {
      setError(""); // ✅ Very important: exact empty string
    } else {
      setError(
        "Total Amount should be equal to the Total Amount of the Means of Finance."
      );
    }

    setInfoMessage(
      `Means of Finance Total = ₹${totalLoan.toLocaleString(
        "en-IN"
      )}\nDifference = ₹${isMatch ? 0 : difference.toLocaleString("en-IN")}`
    );

    setMeansOfFinanceSummary({
      meansOfFinanceTotal,
      totalLoan,
      calculatedTotal,
      difference: isMatch ? 0 : difference,
    });
  }, [
    calculatedTotal,
    formData?.MeansOfFinance?.total,
    formData?.ProjectReportSetting?.calculatedTotal,
    setError,
  ]);

  const handleChangeCheckbox = (key, checked) => {
    setLocalData((prevData) => ({
      ...prevData,
      [key]: {
        ...prevData[key],
        isSelected: checked,
      },
    }));
  };

  return (
    <div className="form-scroll">
      <form onSubmit={(e) => e.preventDefault()}>
        {Object.entries(localData).map(([key, field], index) => (
          <div key={key}>
            <div className="d-flex gap-2 my-4 justify-content-around">
              <div className="w-100">
                {index === 0 && <label className="form-label">Name</label>}
                <input
                  name="name"
                  placeholder={field.name}
                  onChange={(e) => handleChange(e, key, "name")}
                  value={field.name}
                  className="form-control"
                  type="text"
                  disabled={!field.isCustom}
                />
              </div>
              <div>
                {index === 0 && <label className="form-label">Amount</label>}
                <input
                  name="amount"
                  placeholder="0"
                  onChange={(e) => handleChange(e, key, "amount")}
                  value={formatNumberWithCommas(field.amount || "")}
                  className="form-control no-spinner"
                  type="text"
                />
              </div>
              <div>
                {index === 0 && (
                  <label className="form-label">Depreciation(%)</label>
                )}
                <input
                  name="rate"
                  placeholder={field.rate}
                  onChange={(e) => handleChange(e, key, "rate")}
                  value={field.rate}
                  className="form-control"
                  type="number"
                />
              </div>
              <div className="">
                <div className="flex flex-col items-center justify-center">
                  {index === 0 && (
                   <label className="form-label">Add to Assets</label>
                  )}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={field.isSelected || false}
                      onChange={(e) =>
                        handleChangeCheckbox(key, e.target.checked)
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                  </label>
                </div>
              </div>

              <button
                className="btn h-100 mt-auto"
                style={{ width: "50px", padding: "0", border: "none" }}
                onClick={() =>
                  setLocalData((prevData) => {
                    const updatedData = { ...prevData };
                    delete updatedData[key];
                    return updatedData;
                  })
                }
              >
                <img src={deleteImg} alt="Remove" className="w-100" />
              </button>
            </div>
            <hr />
          </div>
        ))}

        {/* Working Capital Input */}
        <div className="d-flex gap-2 my-4 justify-content-end">
          <div className="w-100 flex">
            <label className="form-label w-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 px-4 py-2 mr-4 rounded-md transition-colors duration-300">
              Working Capital
            </label>

            <input
              type="text"
              name="workingCapital"
              className="form-control w-[50%]"
              value={formatNumberWithCommas(
                formData.MeansOfFinance?.totalWorkingCapital || ""
              )}
              onChange={(e) => {
                const rawValue = e.target.value.replace(/,/g, ""); // Remove commas to get raw number
                const numericValue =
                  rawValue === "" ? 0 : parseFloat(rawValue) || 0; // Convert to numeric

                // Update the state with the formatted value (allow large inputs)
                onFormDataChange({
                  ...formData,
                  MeansOfFinance: {
                    ...formData.MeansOfFinance,
                    totalWorkingCapital: numericValue,
                  },
                });
              }}
            />
          </div>
        </div>

        {/* Total Amount Calculation */}
        <div className="flex flex-col items-end gap-2 my-4 px-4">
          <label className="text-sm font-medium text-gray-700">
            Total Amount
          </label>
          <input
            name="totalAmount"
            value={formatNumberWithCommas(calculatedTotal)}
            className="border border-gray-300 px-3 py-2 rounded-md shadow-sm text-right w-64"
            type="text"
            disabled
          />
        </div>

        {error && <div className="text-danger mt-2 text-right">{error}</div>}
        {infoMessage && (
          <div
            className="mt-2 text-secondary text-right whitespace-pre-line"
            style={{ fontSize: "0.9rem" }}
          >
            {infoMessage}
          </div>
        )}

        <button
          className="btn btn-secondary px-4"
          onClick={() => {
            // Check if the number of fields is less than 5
            if (Object.keys(localData).length < 12) {
              setLocalData((prevData) => ({
                ...prevData,
                [`CustomField${Object.keys(prevData).length + 1}`]: {
                  name: "",
                  id: `CustomField${Object.keys(prevData).length + 1}`,
                  amount: 0,
                  rate: 15,
                  isCustom: true,
                },
              }));
            } else {
              alert("You can only add up to 5 fields.");
            }
          }}
        >
          + Add More
        </button>
      </form>
      <div className="my-2 d-flex gap-5 justify-content-center"></div>
    </div>
  );
};

export default ThirdStepCOP;
