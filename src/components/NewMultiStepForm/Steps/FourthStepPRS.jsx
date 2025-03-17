import React, { useState, useEffect, useRef } from "react";
import { getAdmins } from "../../../api/adminAPI";

const FourthStepPRS = ({
  formData,
  onFormDataChange,
  onProjectionYearChange,
}) => {
  const prevDataRef = useRef(null);
  const [projectionYears, setProjectionYears] = useState(0);
  const [rateOfExpense, setRateOfExpense] = useState(0);
  const [showAdvance, setShowAdvance] = useState(false);
  const [caList, setCaList] = useState([]);

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

      increasingRateOfRevenue: {
        name: "Increasing Rate of Revenue",
        id: "increasingRateOfRevenue",
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
      // ✅ Added Subsidy Fields
      SubsidyName: {
        name: "Subsidy Name",
        id: "SubsidyName",
        value: "Government Grant", // Default value
        isCustom: false,
      },
      SubsidyPercentage: {
        name: "Subsidy Percentage",
        id: "SubsidyPercentage",
        value: "15", // Default value (15%)
        isCustom: false,
      },
      SubsidyAmount: {
        name: "Subsidy Amount",
        id: "SubsidyAmount",
        value: "10", // Default value in Lakhs
        isCustom: false,
      },
      SubsidyText: {
        name: "Text for Subsidy",
        id: "SubsidyText",
        value: "Eligible for government subsidy under MSME scheme.", // Default text
        isCustom: false,
      },
      UDINNumber: {
        name: "UDIN Number",
        id: "UDINNumber",
        value: "",
        isCustom: false,
      },
      CAName: {
        name: "CA Name",
        id: "CAName",
        value: "",
        isCustom: false,
      },
      // ✅ New Object for Bank Details
      BankDetails: {
        Bank: {
          name: "Bank",
          id: "Bank",
          value: "",
          isCustom: false,
        },
        BankManagerName: {
          name: "Bank Manager Name",
          id: "BankManagerName",
          value: "",
          isCustom: false,
        },
        Post: {
          name: "Post",
          id: "Post",
          value: "",
          isCustom: false,
        },
        ContactNo: {
          name: "Contact No.",
          id: "ContactNo",
          value: "",
          isCustom: false,
        },
        EmailId: {
          name: "Email ID",
          id: "EmailId",
          value: "",
          isCustom: false,
        },
        IFSCCode: {
          name: "IFSC Code",
          id: "IFSCCode",
          value: "",
          isCustom: false,
        },
        City: {
          name: "City",
          id: "City",
          value: "",
          isCustom: false,
        },
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

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const data = await getAdmins();
        setCaList(data.map((admin) => admin.username)); // Extract only the CA names
      } catch (error) {
        console.error("Failed to load CA list:", error);
      }
    };

    fetchAdmins(); // ✅ Fetch data on component mount
  }, []);

  // Handle change for any field including ProjectionYears
  const handleChange = (e) => {
    const { name, value } = e.target;
    const keys = name.split("."); // Handle nested objects

    setLocalData((prevData) => {
      if (keys.length === 2) {
        // For nested objects like BankDetails.Bank
        const [parentKey, childKey] = keys;
        return {
          ...prevData,
          [parentKey]: {
            ...prevData[parentKey],
            [childKey]: {
              ...prevData[parentKey][childKey],
              value: value, // ✅ Update value inside object
            },
          },
        };
      } else {
        // For non-nested fields
        return {
          ...prevData,
          [name]: {
            ...prevData[name],
            value: value,
          },
        };
      }
    });

    // ✅ Update parent state (onFormDataChange)
    onFormDataChange((prevData) => {
      if (keys.length === 2) {
        const [parentKey, childKey] = keys;
        return {
          ...prevData,
          ProjectReportSetting: {
            ...prevData.ProjectReportSetting,
            [parentKey]: {
              ...prevData.ProjectReportSetting[parentKey],
              [childKey]: {
                ...prevData.ProjectReportSetting[parentKey][childKey],
                value: value,
              },
            },
          },
        };
      } else {
        return {
          ...prevData,
          ProjectReportSetting: {
            ...prevData.ProjectReportSetting,
            [name]: {
              ...prevData.ProjectReportSetting[name],
              value: value,
            },
          },
        };
      }
    });
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
                  placeholder="e.g. 2023"
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
                  value={localData.AmountIn.value} // ✅ Accessing value inside object
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
                  id="rateOfExpense" // ✅ Updated ID
                  name="rateOfExpense" // ✅ Updated Name
                  type="number"
                  placeholder="Increasing Rate of Revenue"
                  required
                  value={localData.rateOfExpense.value}
                  onChange={handleChange}
                />
                <label htmlFor="rateOfExpense">
                  Increasing Rate of Revenue
                </label>
              </div>
            </div>

            <div className="row">
              <div className="col-4">
                <div className="input">
                  <input
                    id="incomeTax"
                    name="incomeTax"
                    type="text"
                    placeholder="Income Tax (%)"
                    required
                    value={
                      typeof localData.incomeTax === "object" ||
                      localData.incomeTax === null ||
                      localData.incomeTax === undefined
                        ? ""
                        : localData.incomeTax || ""
                    }
                    onChange={handleChange}
                  />
                  <label htmlFor="incomeTax">Income Tax (%)</label>
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
          </div>
          <div className="row">
            {/* Name Field */}
            <div className="col-4">
              <div className="input">
                <input
                  id="subsidyName"
                  name="subsidyName"
                  type="text"
                  placeholder="Subsidy Name"
                  required
                  value={localData.subsidyName}
                  onChange={handleChange}
                />
                <label htmlFor="subsidyName">Subsidy Name</label>
              </div>
            </div>

            {/* Percentage Field */}
            <div className="col-4">
              <div className="input">
                <input
                  id="subsidyPercentage"
                  name="subsidyPercentage"
                  type="number"
                  placeholder="Subsidy Percentage"
                  required
                  value={localData.subsidyPercentage}
                  onChange={handleChange}
                />
                <label htmlFor="subsidyPercentage">Subsidy Percentage</label>
              </div>
            </div>

            {/* Amount Field */}
            <div className="col-4">
              <div className="input">
                <input
                  id="subsidyAmount"
                  name="subsidyAmount"
                  type="number"
                  placeholder="Subsidy Amount"
                  required
                  value={localData.subsidyAmount}
                  onChange={handleChange}
                />
                <label htmlFor="subsidyAmount">Subsidy Amount</label>
              </div>
            </div>
          </div>

          <div className="row">
            {/* Text for Subsidy */}
            <div className="col-4">
              <div className="input">
                <input
                  id="subsidyText"
                  name="subsidyText"
                  type="text"
                  placeholder="Subsidy Details"
                  required
                  value={localData.subsidyText}
                  onChange={handleChange}
                />
                <label htmlFor="subsidyText">Text for Subsidy</label>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary mt-3"
            onClick={() => setShowAdvance(!showAdvance)}
          >
            {showAdvance ? "Hide Advance" : "Show Advance"}
          </button>

          {showAdvance && (
            <div className="row mt-3">
              {/* UDIN Number */}
              <div className="col-6">
                <div className="input">
                  <input
                    id="UDINNumber"
                    name="UDINNumber"
                    type="text"
                    placeholder="Enter UDIN Number"
                    value={localData.UDINNumber.value}
                    onChange={handleChange}
                  />
                  <label htmlFor="UDINNumber">UDIN Number</label>
                </div>
              </div>

              {/* CA Name */}
              {/* <div className="col-6">
                <div className="input">
                  <input
                    id="CAName"
                    name="CAName"
                    type="text"
                    placeholder="Enter CA Name"
                    value={localData?.CAName?.value || ""}
                    onChange={handleChange}
                  />
                  <label htmlFor="CAName">Name of the CA</label>
                </div>
              </div> */}
              <div className="col-6">
                <div className="input">
                  <select
                    id="CAName"
                    name="CAName"
                    value={localData?.CAName?.value || ""}
                    onChange={handleChange}
                    className="form-control selectInput"
                  >
                    <option value="">Select CA Name</option>
                    {caList.map((ca, index) => (
                      <option key={index} value={ca}>
                        {ca}
                      </option>
                    ))}
                  </select>
                  {/* <label htmlFor="CAName">Name of the CA</label> */}
                </div>
              </div>

              {/* Bank */}
              <div className="col-4 mt-3">
                <div className="input">
                  <input
                    id="Bank"
                    name="BankDetails.Bank" // ✅ Add Parent Key
                    type="text"
                    placeholder="Enter Bank Name"
                    value={localData?.BankDetails?.Bank?.value || ""}
                    onChange={handleChange}
                  />
                  <label htmlFor="Bank">Bank Name</label>
                </div>
              </div>

              {/* Bank Manager Name */}
              <div className="col-4 mt-3">
                <div className="input">
                  <input
                    id="BankManagerName"
                    name="BankDetails.BankManagerName" // ✅ Add Parent Key
                    type="text"
                    placeholder="Enter Bank Manager Name"
                    value={localData?.BankDetails?.BankManagerName?.value || ""}
                    onChange={handleChange}
                  />
                  <label htmlFor="BankManagerName">Bank Manager Name</label>
                </div>
              </div>

              {/* Post */}
              <div className="col-4 mt-3">
                <div className="input">
                  <input
                    id="Post"
                    name="BankDetails.Post" // ✅ Add Parent Key
                    type="text"
                    placeholder="Enter Post"
                    value={localData?.BankDetails?.Post?.value || ""}
                    onChange={handleChange}
                  />
                  <label htmlFor="Post">Post</label>
                </div>
              </div>

              {/* Contact No */}
              <div className="col-4 mt-3">
                <div className="input">
                  <input
                    id="ContactNo"
                    name="BankDetails.ContactNo" // ✅ Add Parent Key
                    type="text"
                    placeholder="Enter Contact No."
                    value={localData?.BankDetails?.ContactNo?.value || ""}
                    onChange={handleChange}
                  />
                  <label htmlFor="ContactNo">Contact No.</label>
                </div>
              </div>

              {/* Email ID */}
              <div className="col-4 mt-3">
                <div className="input">
                  <input
                    id="EmailId"
                    name="BankDetails.EmailId" // ✅ Add Parent Key
                    type="email"
                    placeholder="Enter Email ID"
                    value={localData?.BankDetails?.EmailId?.value || ""}
                    onChange={handleChange}
                  />
                  <label htmlFor="EmailId">Email ID</label>
                </div>
              </div>

              {/* IFSC Code */}
              <div className="col-4 mt-3">
                <div className="input">
                  <input
                    id="IFSCCode"
                    name="BankDetails.IFSCCode" // ✅ Add Parent Key
                    type="text"
                    placeholder="Enter IFSC Code"
                    value={localData?.BankDetails?.IFSCCode?.value || ""}
                    onChange={handleChange}
                  />
                  <label htmlFor="IFSCCode">IFSC Code</label>
                </div>
              </div>

              {/* City */}
              <div className="col-4 mt-3">
                <div className="input">
                  <input
                    id="City"
                    name="BankDetails.City" // ✅ Add Parent Key
                    type="text"
                    placeholder="Enter City"
                    value={localData?.BankDetails?.City?.value || ""}
                    onChange={handleChange}
                  />
                  <label htmlFor="City">City</label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FourthStepPRS;
