import React, { useState, useEffect, useRef } from "react";

const FourthStepPRS = ({
  formData,
  onFormDataChange,
  onProjectionYearChange,
}) => {
  const prevDataRef = useRef(null);
  const [projectionYears, setProjectionYears] = useState(0);
  const [rateOfExpense, setRateOfExpense] = useState(0);
  // ✅ Default data structure\
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const [localData, setLocalData] = useState(() => ({
    ...{
      RepaymentMonths: {
        name: "Repayment Months",
        id: "RepaymentMonths",
        value: "",
        isCustom: false,
      },
      ProjectionYears: {
        name: "Projection Years",
        id: "ProjectionYears",
        value: "",
        isCustom: false,
      },
      PurposeofReport: {
        name: "Purpose of Report",
        id: "PurposeofReport",
        value: "",
        isCustom: false,
      },
      MoratoriumPeriod: {
        name: "Moratorium Period",
        id: "MoratoriumPeriod",
        value: "",
        isCustom: false,
      },
      SelectRepaymentMethod: {
        name: "Select Repayment Method",
        id: "SelectRepaymentMethod",
        value: "",
        isCustom: false,
      },
      SelectStartingMonth: {
        name: "Select Starting Month",
        id: "SelectStartingMonth",
        value: "",
        isCustom: false,
      },
      FinancialYear: {
        name: "Financial Year",
        id: "FinancialYear",
        value: "",
        isCustom: false,
      },
      AmountIn: {
        name: "Amount In",
        id: "AmountIn",
        value: "",
        isCustom: false,
      },
      Currency: {
        name: "Currency",
        id: "Currency",
        value: "",
        isCustom: false,
      },
      Format: { name: "Format", id: "Format", value: "", isCustom: false },
      interestOnTL: {
        name: "Interest On Term Loan",
        id: "interestOnTL",
        value: "",
        isCustom: false,
      },
      interestOnWC: {
        name: "Interest On Working Capital",
        id: "interestOnWC",
        value: "",
        isCustom: false,
      },
      rateOfInterest: {
        name: "Rate of Interest",
        id: "rateOfInterest",
        value: "",
        isCustom: false,
      },
      rateOfWorkingCapital: {
        name: "Rate of Working Capital",
        id: "rateOfWorkingCapital",
        value: "",
        isCustom: false,
      },
      incomeTax: {
        name: "Income Tax",
        id: "incomeTax",
        value: 30,
        isCustom: false,
      },
      rateOfExpense: {
        name: "Rate of Expense",
        id: "rateOfExpense",
        value: "",
        isCustom: false,
      },
    },
    ...(formData?.ProjectReportSetting || {}), // Merging formData if available
  }));

  // ✅ Populate `localData` from `formData.ProjectReportSetting` on mount
  useEffect(() => {
    if (formData?.ProjectReportSetting) {
      const newData = {
        ...localData,
        ...formData.ProjectReportSetting,
      };

      // Prevent unnecessary updates
      if (
        !prevDataRef.current ||
        JSON.stringify(prevDataRef.current) !== JSON.stringify(newData)
      ) {
        console.log("✅ Populating ProjectReportSetting data:", newData);
        setLocalData(newData);
        prevDataRef.current = newData;

        // ✅ Log ProjectionYears immediately when populated
        if (newData.ProjectionYears?.value) {
          console.log(
            "🚀 Populated Projection Year:",
            newData.ProjectionYears.value
          );
        }
      }
    }
  }, [formData?.ProjectReportSetting]);

  // ✅ Save `localData` back to `onFormDataChange` (Avoiding infinite loop)
  useEffect(() => {
    if (JSON.stringify(localData) !== JSON.stringify(prevDataRef.current)) {
      onFormDataChange({ ProjectReportSetting: localData });
      prevDataRef.current = localData;
    }
  }, [localData, onFormDataChange]);

  useEffect(() => {
    if (formData?.ProjectReportSetting?.ProjectionYears?.value) {
      setProjectionYears(
        Number(formData.ProjectReportSetting.ProjectionYears.value)
      );
      console.log(
        "🚀 Parent Component Updated Projection Years:",
        Number(formData.ProjectReportSetting.ProjectionYears.value)
      );
    }
  }, [formData?.ProjectReportSetting?.ProjectionYears?.value]);

  // Handle change for any field including ProjectionYears
  const handleChange = (e) => {
    const { name, value } = e.target;
    const [key, subKey] = name.split(".");

    // Update data in MultiStepForm
    onFormDataChange({
      ProjectReportSetting: {
        ...formData.ProjectReportSetting,
        [name]: value,
      },
    });

    setLocalData((prevData) => {
      if (subKey) {
        return {
          ...prevData,
          [key]: {
            ...prevData[key],
            [subKey]: value,
          },
        };
      }
      return {
        ...prevData,
        [name]: value,
      };
    });

    // If it's the ProjectionYears field, we can propagate it further
    if (name === "ProjectionYears") {
      setProjectionYears(value);
    }
    if (name === "rateOfExpense") {
      setRateOfExpense(value);
    }
    onProjectionYearChange(value); // Call the parent handler if necessary
  };

  return (
    <div>
      <div className="form-scroll">
        <div className="container">
          <div className="row">
            <div className="col-4">
              <div className="input">
                <input
                  id="RepaymentMonths"
                  name="RepaymentMonths"
                  type="number"
                  value={localData.RepaymentMonths}
                  onChange={handleChange}
                />
                <label htmlFor="RepaymentMonths">Repayment Months</label>
              </div>
            </div>
            <div className="col-4">
              <div className="input">
                <input
                  id="ProjectionYears"
                  name="ProjectionYears"
                  type="number"
                  placeholder="Projection Years"
                  required
                  value={localData.ProjectionYears}
                  onChange={handleChange}
                />
                <label htmlFor="ProjectionYears">Projection Years</label>
              </div>
            </div>
            <div className="col-4">
              <div className="input">
                <input
                  id="MoratoriumPeriod"
                  name="MoratoriumPeriod"
                  type="number"
                  placeholder="e.g. 6 months"
                  required
                  value={localData.MoratoriumPeriod}
                  onChange={handleChange}
                />
                <label htmlFor="MoratoriumPeriod">Moratorium Period</label>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-4">
              <div className="">
                <select
                  className="form-control selectInput"
                  id="SelectRepaymentMethod"
                  name="SelectRepaymentMethod"
                  required
                  value={localData.SelectRepaymentMethod}
                  onChange={handleChange}
                >
                  <option value="">Select Repayment Method</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Semi-annually">Semi-annually</option>
                  <option value="Annually">Annually</option>
                </select>
              </div>
            </div>
            <div className="col-4">
              <div className="">
                <select
                  className="form-control selectInput"
                  id="SelectStartingMonth"
                  name="SelectStartingMonth"
                  required
                  value={localData.SelectStartingMonth} // ✅ Stores month name
                  onChange={handleChange}
                >
                  <option value="">Select Starting Month</option>
                  {monthNames.map((month, index) => (
                    <option key={index} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="col-4">
              <div className="input">
                <input
                  id="FinancialYear"
                  name="FinancialYear"
                  type="number"
                  placeholder="e.g. 2023-2024"
                  required
                  value={localData.FinancialYear}
                  onChange={handleChange}
                />
                <label htmlFor="FinancialYear">Financial Year</label>
              </div>
            </div>
          </div>
          <div className="row mb-4">
            <div className="col-4">
              <div className="d-flex">
                <select
                  className="form-control selectInput"
                  id="Currency"
                  name="Currency"
                  required
                  value={localData.Currency}
                  onChange={handleChange}
                >
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                  <option value="Dhiram">Dhiram</option>
                </select>
              </div>
            </div>
            <div className="col-4">
              <div className="d-flex">
                <select
                  className="form-control selectInput"
                  id="AmountIn"
                  name="AmountIn"
                  required
                  value={localData.AmountIn}
                  onChange={handleChange}
                >
                  <option value="rupees">Rupees</option>
                  <option value="thousand">Thousands</option>
                  <option value="lakhs">Lakhs</option>
                  <option value="crores">Crores</option>
                  <option value="millions">Millions</option>
                </select>
              </div>
            </div>
            <div className="col-4">
              <div>
                <select
                  className="form-control selectInput"
                  id="Format"
                  name="Format"
                  required
                  value={localData.Format}
                  onChange={handleChange}
                >
                  <option value="">Format (e.g. 1,23,456)</option>
                  <option value="1">Indian (1,23,456)</option>
                  <option value="2">USD (1,123,456)</option>
                  <option value="3">1,23,456</option>
                </select>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-4">
              <div className="input">
                <input
                  id="PurposeofReport"
                  name="PurposeofReport"
                  type="text"
                  placeholder="e.g. Annual Report"
                  required
                  value={
                    typeof localData.PurposeofReport === "object"
                      ? ""
                      : localData.PurposeofReport || ""
                  }
                  onChange={handleChange}
                />
                <label htmlFor="PurposeofReport">Purpose of Report</label>
              </div>
            </div>
            <div className="col-4">
              <div className="input">
                <input
                  id="interestOnTL"
                  name="interestOnTL"
                  type="text"
                  placeholder="Interest On TL"
                  required
                  value={
                    typeof localData.interestOnTL === "object" ||
                    localData.interestOnTL === null ||
                    localData.interestOnTL === undefined
                      ? ""
                      : localData.interestOnTL || ""
                  }
                  onChange={handleChange}
                />

                <label htmlFor="interestOnTL">Interest On Term Loan</label>
              </div>
            </div>
            <div className="col-4">
              <div className="input">
                <input
                  id="interestOnWC"
                  name="interestOnWC"
                  type="number"
                  placeholder="Interest On WC"
                  required
                  value={localData.interestOnWC}
                  onChange={handleChange}
                />
                <label htmlFor="interestOnWC">
                  Interest On Working Capital
                </label>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-4">
              <div className="input">
                <input
                  id="rateOfInterest"
                  name="rateOfInterest"
                  type="number"
                  placeholder="Rate of Interest"
                  required
                  value={localData.rateOfInterest}
                  onChange={handleChange}
                />
                <label htmlFor="rateOfInterest">Rate Of Interest</label>
              </div>
            </div>
            <div className="col-4">
              <div className="input">
                <input
                  id="rateOfExpense"
                  name="rateOfExpense"
                  type="number"
                  placeholder="Rate of Expense"
                  required
                  value={localData.rateOfExpense}
                  onChange={handleChange}
                />
                <label htmlFor="rateOfExpense">Rate Of Expense</label>
              </div>
            </div>
            <div className="col-4">
              <div className="input">
                <input
                  id="incomeTax"
                  name="incomeTax"
                  type="number"
                  placeholder="Income Tax"
                  required
                  value={localData.incomeTax}
                  onChange={handleChange}
                />
                <label htmlFor="incomeTax">Income Tax</label>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-4">
              <div className="input">
                <input
                  id="rateOfWorkingCapital"
                  name="rateOfWorkingCapital"
                  type="number"
                  placeholder="Rate of Working Capital"
                  required
                  value={localData.rateOfWorkingCapital}
                  onChange={handleChange}
                />
                <label htmlFor="rateOfWorkingCapital">
                  Rate Of Working Capital
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FourthStepPRS;
