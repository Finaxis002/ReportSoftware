import React, { useState, useEffect, useRef } from "react";
import deleteImg from "../delete.png";
import checkImg from "../check.png";

const ThirdStepCOP = ({ formData, onFormDataChange, setError, error }) => {
  const prevDataRef = useRef(null);
  const prevPrelimDataRef = useRef(null);
  const prevWriteOffRef = useRef(null);

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
  const [preliminaryWriteOffYears, setPreliminaryWriteOffYears] = useState(
    formData?.CostOfProject?.preliminaryWriteOffYears || 0
  );

  const formatNumberWithCommas = (num) => {
    if (num === null || num === undefined || num === "") return "";
    const str = num.toString().replace(/,/g, "");
    if (str.endsWith(".") || str.match(/\.\d{0,1}$/)) {
      return str;
    }
    const numericValue = Number(str);
    if (isNaN(numericValue)) return num;
    return str.includes(".")
      ? numericValue.toLocaleString("en-IN", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        })
      : numericValue.toLocaleString("en-IN");
  };

  const removeCommas = (str) => str?.toString().replace(/,/g, "");

  // Calculate preliminary expenses total (add this helper function)
  const calculatePreliminaryTotal = (data) => {
    return Object.values(data)
      .filter((item) => item?.isPreliminary)
      .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  };

  useEffect(() => {
    if (formData?.CostOfProject) {
      const newData = {
        ...defaultData,
        ...formData.CostOfProject,
      };

      // Ensure all preliminary expenses have isPreliminary flag
      Object.keys(newData).forEach((key) => {
        if (newData[key].isPreliminary) {
          newData[key] = {
            ...newData[key],
            isPreliminary: true,
            isCustom: true,
          };
        }
      });

      if (formData.CostOfProject.preliminaryWriteOffYears) {
        setPreliminaryWriteOffYears(
          formData.CostOfProject.preliminaryWriteOffYears
        );
      }

      // Calculate or use existing preliminary expenses total
      newData.preliminaryExpensesTotal =
        typeof newData.preliminaryExpensesTotal === "number"
          ? newData.preliminaryExpensesTotal
          : calculatePreliminaryTotal(newData);

      if (
        !prevDataRef.current ||
        JSON.stringify(prevDataRef.current) !== JSON.stringify(newData)
      ) {
        setLocalData(newData);
        prevDataRef.current = newData;
      }
    }
  }, [formData?.CostOfProject]);

  useEffect(() => {
    const prelimsTotal = calculatePreliminaryTotal(localData);

    const combinedData = {
      ...localData,
      preliminaryWriteOffYears: preliminaryWriteOffYears,
      preliminaryExpensesTotal: prelimsTotal,
    };

    if (JSON.stringify(prevDataRef.current) !== JSON.stringify(combinedData)) {
      onFormDataChange({
        CostOfProject: combinedData,
      });
      prevDataRef.current = combinedData;
    }
  }, [localData, preliminaryWriteOffYears, onFormDataChange]);

  const handleChange = (event, key, field) => {
    const { value } = event.target;
    let newValue = value;

    if (field === "amount") {
      const raw = removeCommas(value);
      if (raw === "" || /^\d*\.?\d*$/.test(raw)) {
        newValue = raw;
      } else {
        return;
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
    const difference = totalLoan - meansOfFinanceTotal;
    const isMatch = Math.abs(difference) < 0.01;

    if (isMatch) {
      setError("");
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
  }, [calculatedTotal, formData?.MeansOfFinance?.total, setError]);

  const handleChangeCheckbox = (key, checked) => {
    setLocalData((prevData) => {
      const updatedData = { ...prevData };
  
      if (updatedData[key]) {
        const current = updatedData[key];
  
        updatedData[key] = {
          ...current,
          isSelected: checked,
          rate: checked
            ? 0
            : current.prevRate ?? current.rate, // restore previous rate
          prevRate: checked ? current.rate : current.prevRate, // store prev rate only when selecting
        };
      }
  
      return updatedData;
    });
  };
  

  const handlePrelimChange = (id, field, value) => {
    setLocalData((prevData) => ({
      ...prevData,
      [id]: {
        ...prevData[id],
        [field]: field === "amount" ? Number(value) : value,
      },
    }));
  };

  const removePrelimRow = (id) => {
    setLocalData((prevData) => {
      const updated = { ...prevData };
      delete updated[id];
      return updated;
    });
  };

  const getSeparatedData = () => {
    const assets = {};
    const prelims = {};

    Object.entries(localData).forEach(([key, field]) => {
      if (field.isPreliminary) {
        prelims[key] = field;
      } else {
        assets[key] = field;
      }
    });

    return { assets, prelims };
  };

  const addPreliminaryExpense = () => {
    const newId = `PreliminaryExpense_${Date.now()}`;
    setLocalData((prevData) => ({
      ...prevData,
      [newId]: {
        name: "",
        id: newId,
        amount: 0,
        isPreliminary: true,
        isCustom: true,
      },
    }));
  };

  return (
    <div className="form-scroll">
      <form onSubmit={(e) => e.preventDefault()}>
        {Object.entries(getSeparatedData().assets).map(
          ([key, field], index) => (
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
                    disabled={field.isSelected}
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
          )
        )}

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
                const rawValue = e.target.value.replace(/,/g, "");
                const numericValue =
                  rawValue === "" ? 0 : parseFloat(rawValue) || 0;
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
            if (Object.keys(localData).length < 12) {
              setLocalData((prevData) => ({
                ...prevData,
                [`CustomField${Object.keys(prevData).length + 1}`]: {
                  name: "",
                  id: `CustomField${Object.keys(prevData).length + 1}`,
                  amount: 0,
                  rate: 15,
                  prevRate: 15, // 👈 Store initial rate
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
      <div>
        <hr className="my-4" />

        {/* Heading with editable years */}
        <div className="d-flex align-items-center gap-3 mb-3">
          <h5 className="text-primary m-0">
            Preliminary Expenses Written Off in
          </h5>
          <input
            type="number"
            min="1"
            className="form-control text-center border border-gray-300 rounded shadow-sm"
            style={{ width: "80px", height: "38px" }}
            value={preliminaryWriteOffYears || 5} // Default value is 5
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (!isNaN(val) && val > 0) {
                setPreliminaryWriteOffYears(val);
              }
            }}
          />

          <span className="text-primary fw-semibold">Years</span>
        </div>

        {/* Header Labels */}
        <div className="d-flex gap-2 my-2 justify-content-around fw-bold text-secondary">
          <div className="w-100">Particular Name</div>
          <div style={{ width: "250px" }}>Amount</div>
          <div style={{ width: "40px" }}></div>
        </div>

        {/* Expense rows */}
        {Object.entries(getSeparatedData().prelims).map(([id, item]) => (
          <div key={id}>
            <div className="d-flex gap-2 my-3 justify-content-around">
              <div className="w-100">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) =>
                    handlePrelimChange(id, "name", e.target.value)
                  }
                  className="form-control"
                />
              </div>
              <div style={{ width: "250px" }}>
                <input
                  type="number"
                  value={item.amount}
                  onChange={(e) =>
                    handlePrelimChange(id, "amount", e.target.value)
                  }
                  className="form-control no-spinner"
                />
              </div>
              <button
                className="btn h-100"
                style={{ width: "40px", padding: "0", border: "none" }}
                onClick={() => removePrelimRow(id)}
              >
                <img src={deleteImg} alt="Remove" className="w-100" />
              </button>
            </div>
            <hr />
          </div>
        ))}

        {/* Total Row */}
        <div className="d-flex gap-2 my-3 justify-content-around">
          <div className="w-100 fw-bold text-end pe-3">Total:</div>
          <div style={{ width: "250px" }}>
            <input
              type="number"
              value={Object.values(getSeparatedData().prelims).reduce(
                (sum, item) => sum + (Number(item.amount) || 0),
                0
              )}
              className="form-control no-spinner fw-bold"
              disabled
            />
          </div>
          <div style={{ width: "40px" }}></div>
        </div>

        {/* Add New Preliminary Expense Button */}
        <div className="d-flex justify-start mt-3 mb-2">
          <button
            className="btn btn-secondary px-4"
            onClick={addPreliminaryExpense}
          >
            + Add Preliminary Expense
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThirdStepCOP;
