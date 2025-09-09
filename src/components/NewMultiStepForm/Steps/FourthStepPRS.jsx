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

  console.log("form data in prs setting", formData);

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
    RepaymentMonths: "",
    ProjectionYears: 5,
    PurposeofReport: "Bank Loan",
    MoratoriumPeriod: "",
    SelectRepaymentMethod: "Monthly",
    SelectStartingMonth: "",
    FinancialYear: "2025",
    AmountIn: "rupees",
    Currency: "",
    Format: "",
    interestOnTL: 10,
    interestOnWC: "",
    rateOfInterest: "",
    increasingRateOfExpenses: 5,
    rateOfWorkingCapital: "",
    incomeTax: 30,
    rateOfExpense: 5,
    DebtEquityOption: "Debt",
    debtPercentage: "",
    // Subsidy
    SubsidyName: "",
    SubsidyPercentage: "",
    SubsidyAmount: "",
    SubsidyText: "",

    // CA Details
    UDINNumber: "",
    CAName: "",
    MembershipNumber: "",
    MobileNumber: "",

    // Bank Details
    BankDetails: {
      Bank: "",
      BankManagerName: "",
      Post: "",
      ContactNo: "",
      EmailId: "",
      IFSCCode: "",
      City: "",
    },

    // ✅ Override with pre-filled data if available
    ...(formData?.ProjectReportSetting || {}),
  }));

  const CA_DETAILS = {
    "Anunay Sharda": {
      membershipNumber: "441497",
      mobileNumber: "+91-79870 21896",
    },
    "Anugrah Sharda": {
      membershipNumber: "473510",
      mobileNumber: "+91-5427896512",
    },
    "Shradha Sharda": {
      membershipNumber: "488858",
      mobileNumber: "+91-1234567894",
    },
  };

  // useEffect(() => {
  //   if (!localData?.incomeTax?.value) {
  //     setLocalData((prev) => ({
  //       ...prev,
  //       incomeTax: {
  //         ...prev.incomeTax,
  //         value: 30,
  //       },
  //     }));
  //   }
  // }, []);

  // ✅ Populate `localData` from `formData.ProjectReportSetting` on mount
  useEffect(() => {
    if (formData?.ProjectReportSetting) {
      const raw = formData.ProjectReportSetting;

      // 🔁 Normalize all values: if it's an object with { value }, extract value
      const normalizeValue = (val) =>
        typeof val === "object" && val !== null && "value" in val
          ? val.value || "rupees" // 👈 Use "rupees" if value is empty string
          : val;

      const normalizedBankDetails = Object.fromEntries(
        Object.entries(raw.BankDetails || {}).map(([key, val]) => [
          key,
          normalizeValue(val),
        ])
      );

      const newData = {
        ...localData,
        ...Object.entries(raw).map(([key, val]) => {
          if (key === "BankDetails") return [key, normalizedBankDetails];

          if (key === "AmountIn") {
            const finalValue =
              typeof val === "object" && val?.value ? val.value : "rupees";
            return [key, finalValue];
          }

          return [key, normalizeValue(val)];
        }),
      };

      // Prevent unnecessary updates
      // if (
      //   !prevDataRef.current ||
      //   JSON.stringify(prevDataRef.current) !== JSON.stringify(newData)
      // ) {
      //   console.log("✅ Normalized and set ProjectReportSetting:", newData);
      //   setLocalData(newData);
      //   prevDataRef.current = newData;

      //   if (newData.ProjectionYears) {
      //     console.log("🚀 Projection Year after normalization:", newData.ProjectionYears);
      //   }
      // }
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

  const handleChange = (e) => {
    const { name, value } = e.target;

     // Handle DebtEquityOption change
  if (name === "DebtEquityOption") {
    setLocalData(prevData => ({
      ...prevData,
      DebtEquityOption: value,
      // Reset DebtPercentage when not using Debt + Equity
      ...(value !== "Debt + Equity" && { DebtPercentage: "" })
    }));
    return;
  }

  // Handle DebtPercentage change
  if (name === "DebtPercentage") {
    setLocalData(prevData => ({
      ...prevData,
      DebtPercentage: value
    }));
    return;
  }

    // ✅ Auto-fill CA details when CA is selected
    if (name === "CAName") {
      const selectedCA = CA_DETAILS[value];

      if (selectedCA) {
        setLocalData((prevData) => ({
          ...prevData,
          CAName: value,
          MembershipNumber: selectedCA.membershipNumber,
          MobileNumber: selectedCA.mobileNumber,
          [name]: name === "AmountIn" ? String(value) : value,
        }));

        // Update parent form too
        onFormDataChange((prev) => ({
          ...prev,
          ProjectReportSetting: {
            ...(prev.ProjectReportSetting || {}),
            CAName: value,
            MembershipNumber: selectedCA.membershipNumber,
            MobileNumber: selectedCA.mobileNumber,
            DebtPercentage: debtPercentage,
            [name]: name === "AmountIn" ? String(value) : value,
          },
        }));

        return; // ✅ Prevent further execution
      }
    }

    // ✅ For nested fields like BankDetails.X
    if (name.includes(".")) {
      const [parentKey, childKey] = name.split(".");
      setLocalData((prevData) => ({
        ...prevData,
        [parentKey]: {
          ...prevData[parentKey],
          [childKey]: value,
        },
      }));

      // Push to parent
      onFormDataChange((prev) => ({
        ...prev,
        ProjectReportSetting: {
          ...(prev.ProjectReportSetting || {}),
          [parentKey]: {
            ...prev.ProjectReportSetting?.[parentKey],
            [childKey]: value,
          },
        },
      }));
    } else {
      // ✅ For normal fields
      setLocalData((prevData) => ({
        ...prevData,
        [name]: value,
      }));

      setLocalData((prevData) => ({
        ...prevData,
        DebtEquityOption: value,
        ...(value === "Debt + Equity" && { DebtPercentage: "" }), // Clear Debt % if not selected
      }));

      onFormDataChange((prev) => ({
        ...prev,
        ProjectReportSetting: {
          ...(prev.ProjectReportSetting || {}),
          [name]: value,
        },
      }));
    }

    // ✅ Special case for ProjectionYears
    if (name === "ProjectionYears") {
      setProjectionYears(value);
      onProjectionYearChange(value);
    }
  };

  useEffect(() => {
    onFormDataChange((prev) => ({
      ...prev,
      ProjectReportSetting: {
        ...(prev.ProjectReportSetting || {}),
        ...localData,
      },
    }));
  }, [localData]);

  const getValue = (obj) => {
    if (typeof obj === "string") return obj;
    if (typeof obj === "object" && obj !== null && "value" in obj)
      return obj.value;
    return "";
  };

  console.log(
    "Incoming formData.AmountIn:",
    formData?.ProjectReportSetting?.AmountIn
  );

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
                  value={localData.FinancialYear || 2025}
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
                  value={localData.AmountIn || "rupees"}
                  onChange={handleChange}
                >
                  <option value="select">Select Amount In</option>
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
                  value={localData.interestOnTL || 10}
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
                  placeholder="Increasing Rate of Expenses"
                  required
                  value={localData.rateOfExpense || 5}
                  onChange={handleChange}
                />
                <label htmlFor="rateOfExpense">
                  Increasing Rate of Expenses
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
                    value={localData.incomeTax || 30}
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

              <div className="col-4">
                <div className="input">
                  <select
                    id="DebtEquityOption"
                    name="DebtEquityOption"
                    value={localData.DebtEquityOption || ""}
                    onChange={handleChange}
                    className="form-control selectInput"
                  >
                    <option value="Debt">Debt</option>
                    <option value="Equity">Equity</option>
                    <option value="Debt + Equity">Debt + Equity</option>
                  </select>
                </div>
              </div>

              {/* Conditional rendering for Debt % field */}
              {localData.DebtEquityOption === "Debt + Equity" && (
                <div className="col-4">
                  <div className="input">
                    <input
                      id="DebtPercentage"
                      name="DebtPercentage"
                      type="number"
                      placeholder="Debt %"
                      required
                      value={localData.DebtPercentage || ""}
                      onChange={handleChange} // Use the main handleChange
                    />
                    <label htmlFor="DebtPercentage">Debt %</label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Subsidy  */}
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
              {/* ✅ Fix UDIN Number */}
              <div className="col-6">
                <div className="input">
                  <input
                    id="UDINNumber"
                    name="UDINNumber"
                    type="text"
                    placeholder="Enter UDIN Number"
                    value={localData?.UDINNumber || ""}
                    onChange={handleChange}
                  />
                  <label htmlFor="UDINNumber">UDIN Number</label>
                </div>
              </div>

              {/* ✅ CA Name Dropdown */}
              <div className="col-6">
                <div className="input">
                  <select
                    id="CAName"
                    name="CAName"
                    value={localData?.CAName || ""}
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
                </div>
              </div>

              {/* ✅ Membership Number */}
              <div className="col-4 mt-3">
                <div className="input">
                  <input
                    id="MembershipNumber"
                    name="MembershipNumber"
                    type="text"
                    placeholder="Membership Number"
                    value={localData?.MembershipNumber || ""}
                    onChange={handleChange}
                  />
                  <label htmlFor="MembershipNumber">Membership Number</label>
                </div>
              </div>

              {/* ✅ Mobile Number */}
              <div className="col-4 mt-3">
                <div className="input">
                  <input
                    id="MobileNumber"
                    name="MobileNumber"
                    type="text"
                    placeholder="Mobile Number"
                    value={localData?.MobileNumber || ""}
                    onChange={handleChange}
                  />
                  <label htmlFor="MobileNumber">Mobile Number</label>
                </div>
              </div>

              {/* ✅ Bank Name */}
              <div className="col-4 mt-3">
                <div className="input">
                  <input
                    id="Bank"
                    name="BankDetails.Bank"
                    type="text"
                    placeholder="Enter Bank Name"
                    // value={localData?.BankDetails?.Bank?.name || ""}
                    value={getValue(localData?.BankDetails?.Bank)}
                    onChange={handleChange}
                  />
                  <label htmlFor="Bank">Bank Name</label>
                </div>
              </div>

              {/* ✅ Bank Manager Name */}
              <div className="col-4 mt-3">
                <div className="input">
                  <input
                    id="BankManagerName"
                    name="BankDetails.BankManagerName"
                    type="text"
                    placeholder="Enter Bank Manager Name"
                    // value={localData?.BankDetails?.BankManagerName?.value || ""}
                    value={getValue(localData?.BankDetails?.BankManagerName)}
                    onChange={handleChange}
                  />
                  <label htmlFor="BankManagerName">Bank Manager Name</label>
                </div>
              </div>

              {/* ✅ Post */}
              <div className="col-4 mt-3">
                <div className="input">
                  <input
                    id="Post"
                    name="BankDetails.Post"
                    type="text"
                    placeholder="Enter Post"
                    // value={localData?.BankDetails?.Post?.value || ""}
                    value={getValue(localData?.BankDetails?.Post)}
                    onChange={handleChange}
                  />
                  <label htmlFor="Post">Post</label>
                </div>
              </div>

              {/* ✅ Contact No */}
              <div className="col-4 mt-3">
                <div className="input">
                  <input
                    id="ContactNo"
                    name="BankDetails.ContactNo"
                    type="text"
                    placeholder="Enter Contact No."
                    // value={localData?.BankDetails?.ContactNo?.value || ""}
                    value={getValue(localData?.BankDetails?.ContactNo)}
                    onChange={handleChange}
                  />
                  <label htmlFor="ContactNo">Contact No.</label>
                </div>
              </div>

              {/* ✅ Email ID */}
              <div className="col-4 mt-3">
                <div className="input">
                  <input
                    id="EmailId"
                    name="BankDetails.EmailId"
                    type="email"
                    placeholder="Enter Email ID"
                    // value={localData?.BankDetails?.EmailId?.value || ""}
                    value={getValue(localData?.BankDetails?.EmailId)}
                    onChange={handleChange}
                  />
                  <label htmlFor="EmailId">Email ID</label>
                </div>
              </div>

              {/* ✅ IFSC Code */}
              <div className="col-4 mt-3">
                <div className="input">
                  <input
                    id="IFSCCode"
                    name="BankDetails.IFSCCode"
                    type="text"
                    placeholder="Enter IFSC Code"
                    // value={localData?.BankDetails?.IFSCCode?.value || ""}
                    value={getValue(localData?.BankDetails?.IFSCCode)}
                    onChange={handleChange}
                  />
                  <label htmlFor="IFSCCode">IFSC Code</label>
                </div>
              </div>

              {/* ✅ City */}
              <div className="col-4 mt-3">
                <div className="input">
                  <input
                    id="City"
                    name="BankDetails.City"
                    type="text"
                    placeholder="Enter City"
                    // value={localData?.BankDetails?.City?.value || ""}
                    value={getValue(localData?.BankDetails?.City)}
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
