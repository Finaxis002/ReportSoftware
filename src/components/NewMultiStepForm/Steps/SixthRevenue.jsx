import { useState, useEffect } from "react";

const SixthRevenue = ({ onFormDataChange, years, revenueData, formData }) => {
  const projectionYears = Math.max(
    1,
    parseInt(formData?.ProjectReportSetting?.ProjectionYears) || years || 1
  );

  // ✅ Initialize togglerType (boolean) from revenueData, default to false
  const [togglerType, setTogglerType] = useState(
    revenueData?.togglerType ?? false
  );

  // ✅ Ensure togglerType updates when revenueData changes
  useEffect(() => {
    if (revenueData?.togglerType !== undefined) {
      setTogglerType(revenueData.togglerType);
    }
  }, [revenueData?.togglerType]);

  // ✅ Initialize formType based on revenueData first, fallback to formData
  const [formType, setFormType] = useState(() => {
    if (revenueData?.formType) {
      return revenueData.formType === "Others";
    }
  });

  // ✅ Initialize localData correctly
  const [localData, setLocalData] = useState(() => {
    if (revenueData && Object.keys(revenueData).length > 0) {
      return { ...revenueData, formType: revenueData?.formType || "Others" };
    }
    return {
      formFields: [
        {
          particular: "p1",
          years: Array.from({ length: Math.max(1, projectionYears) }).fill(0),
          amount: 0,
          rowType: "0",
        },
      ],
      totalRevenueForOthers: Array.from({
        length: Math.max(1, projectionYears),
      }).fill(0),
      formFields2: [
        {
          particular: "p1",
          years: Array.from({ length: Math.max(1, projectionYears) }).fill(0),
          amount: 0,
        },
      ],
      totalMonthlyRevenue: Array(projectionYears).fill(0), // ✅ Ensure default value

      formType: "Others", // ✅ Ensure default value
      togglerType: false, // ✅ Ensure default value
    };
  });

  // ✅ Sync `localData.togglerType` when `togglerType` changes
  useEffect(() => {
    setLocalData((prevData) => ({
      ...prevData,
      togglerType,
    }));
  }, [togglerType]);

  // ✅ Sync `localData.formType` when `formType` changes
  useEffect(() => {
    setLocalData((prevData) => ({
      ...prevData,
      formType: formType ? "Others" : "Monthly",
    }));
  }, [formType]);

  // ✅ Ensure `onFormDataChange` updates only when `localData` changes
  useEffect(() => {
    onFormDataChange({ Revenue: localData });
  }, [localData]);

  console.log("Updated formType: ", formType);
  console.log("Updated localData formType: ", localData.formType);

  console.log("form Data : ", formData);

  // ✅ Toggle function to correctly update both `formType` and `togglerType`
  const toggleType = (isChecked) => {
    setFormType(isChecked);
    setTogglerType(isChecked); // ✅ Ensure togglerType is updated
  };

  // ✅ Initialize totalMonthlyRevenue state
  const [totalMonthlyRevenue, setTotalMonthlyRevenue] = useState(
    Array(projectionYears).fill(0)
  );

  // ✅ Compute totalMonthlyRevenue dynamically
  useEffect(() => {
    const total = Array.from({ length: projectionYears }).map((_, yearIndex) =>
      localData.formFields2.reduce(
        (sum, field) => sum + Number(field.years[yearIndex] || 0),
        0
      )
    );
    setTotalMonthlyRevenue(total);
    // ✅ Update localData with computed totalMonthlyRevenue
    setLocalData((prevData) => ({
      ...prevData,
      totalMonthlyRevenue: total,
    }));
  }, [localData.formFields2, projectionYears]);

  const [noOfMonths, setNoOfMonths] = useState(
    Array.from({ length: projectionYears || 1 }).fill(12)
  );
  const [totalRevenue, setTotalRevenue] = useState(
    Array.from({ length: Math.max(1, projectionYears) }).fill(0)
  );

  const addFields = (e) => {
    e.preventDefault();
    let object = {
      particular: "",
      years: Array.from({ length: Math.max(1, projectionYears) }).fill(0),
      amount: 0,
      rowType: "0",
    };
    setLocalData({
      ...localData,
      formFields: [...localData.formFields, object],
    });
  };

  const removeFields = (e, childIndex) => {
    e.preventDefault();
    let data = [...localData.formFields];
    data.splice(childIndex, 1);
    setLocalData({
      ...localData,
      formFields: data,
    });
  };

  const handleFormChange = (event, index, field = null) => {
    const { name, value } = event.target;
    const updatedFormFields = [...localData.formFields];

    if (field === "serialNumber") {
      updatedFormFields[index][field] = value; // ✅ Store any alphanumeric value
    } else if (field !== null) {
      updatedFormFields[index].years[field] = value;
    } else {
      updatedFormFields[index][name] = value;
    }

    setLocalData({ ...localData, formFields: updatedFormFields });
  };

  const addFields2 = (e) => {
    e.preventDefault();
    let object = {
      particular: "",
      years: Array.from({ length: Math.max(1, projectionYears) }).fill(0),
      amount: 0,
    };
    setLocalData({
      ...localData,
      formFields2: [...localData.formFields2, object],
    });
  };

  const removeFields2 = (e, childIndex) => {
    e.preventDefault();
    let data = [...localData.formFields2];
    data.splice(childIndex, 1);
    setLocalData({
      ...localData,
      formFields2: data,
    });
  };

  const handleFormChange2 = (event, childIndex, year) => {
    let data = [...localData.formFields2];
    if (event.target.name === "particular") {
      data[childIndex]["particular"] = event.target.value;
    } else if (event.target.name === "amount") {
      data[childIndex]["amount"] = Number(event.target.value);
    } else {
      data[childIndex]["years"][year] = Number(event.target.value);
    }
    setLocalData({ ...localData, formFields2: data });
  };

  const handleTotalRevenueForOthersChange = (value, index) => {
    setLocalData((prevData) => {
      const updatedRevenue = [...prevData.totalRevenueForOthers]; // Clone array
      updatedRevenue[index] = value === "" ? "" : Number(value); // Prevent `NaN`

      return {
        ...prevData,
        totalRevenueForOthers: updatedRevenue, // ✅ Properly update state
      };
    });
  };

  // Function to calculate total monthly revenue (sum of all year inputs)
  const calculateTotalMonthlyRevenue = () => {
    const total = Array.from(
      { length: projectionYears || 1 },
      (_, yearIndex) => {
        return localData.formFields2.reduce(
          (sum, field) => sum + Number(field.years[yearIndex] || 0),
          0
        );
      }
    );
    setTotalMonthlyRevenue(total);
  };

  // Function to calculate total revenue (Monthly Revenue * No. of Months)
  const calculateTotalRevenue = () => {
    const revenue = totalMonthlyRevenue.map(
      (monthlyRev, index) =>
        Number(monthlyRev || 0) * Number(noOfMonths[index] || 12)
    );
    setTotalRevenue(revenue);
  };

  // Function to update No. of Months and trigger revenue calculation
  const changeMonth = (index, value) => {
    const updatedMonths = [...noOfMonths];
    updatedMonths[index] = Number(value) || 12; // Default 12 months if empty

    setNoOfMonths(updatedMonths);
    calculateTotalRevenue();
  };

  // Call these functions when form values change
  useEffect(() => {
    calculateTotalMonthlyRevenue();
  }, [localData.formFields2]);

  useEffect(() => {
    calculateTotalRevenue();
  }, [totalMonthlyRevenue, noOfMonths]);

  const submit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Form submitted", localData);
  };

  return (
    <>
      <div className="form-scroll">
        {/* ✅ Toggle Section */}
        <div className="toggleBtn">
          {formType ? (
            <button
              className="btn btn-sm btn-primary px-4 me-auto"
              type="button"
              onClick={addFields}
            >
              Add Field +
            </button>
          ) : (
            <button
              className="btn btn-sm btn-success px-4 me-auto"
              type="button"
              onClick={addFields2}
            >
              Add Field +
            </button>
          )}
          Monthly
          <input
            type="checkbox"
            id="toggle-btn"
            onChange={(e) => toggleType(e.target.checked)}
            checked={formType}
          />
          <label htmlFor="toggle-btn"></label>
          Others
        </div>

        {formType ? (
          <form onSubmit={submit}>
            <div className="position-relative w-100">
              <div className="form-scroll" style={{ height: "30vh" }}>
                <table className="table table-revenue">
                  <thead>
                    <tr>
                      <th className="header-label">Index</th>
                      <th className="header-label">Particulars</th>

                      {/* Dynamically Generate Table Headers */}
                      {Array.from({
                        length:
                          parseInt(
                            formData?.ProjectReportSetting?.ProjectionYears
                          ) || 1,
                      }).map((_, b) => (
                        <th key={b} className="header-label">
                          Year {b + 1}
                        </th>
                      ))}

                      <th className="header-label">Type</th>
                      <th className="header-label"></th>
                    </tr>
                  </thead>

                  <tbody>
                    {localData.formFields.map((entry, i) => {
                      // Adjust the number of years dynamically
                      const validProjectionYears = Math.max(
                        1,
                        formData?.ProjectReportSetting?.ProjectionYears || 1
                      );
                      const adjustedYears = [
                        ...entry.years.slice(0, validProjectionYears),
                        ...Array(
                          Math.max(
                            0,
                            validProjectionYears - (entry.years?.length || 0)
                          )
                        ).fill(""),
                      ];

                      return (
                        <tr
                          key={i}
                          className={`rowHover ${
                            entry.rowType === "0"
                              ? "normalRow"
                              : entry.rowType === "1"
                              ? "headingRow"
                              : entry.rowType === "2"
                              ? "boldRow"
                              : entry.rowType === "3"
                              ? "boldUnderlineRow"
                              : ""
                          }`}
                        >
                          {/* ✅ Editable Serial Number (Now Alphanumeric) */}
                          <td>
                            <input
                              name="serialNumber"
                              type="text" // ✅ Changed to text to allow alphanumeric values
                              className="form-control text-center noBorder"
                              value={entry.serialNumber || i + 1} // Default to `i + 1`
                              onChange={(event) =>
                                handleFormChange(event, i, "serialNumber")
                              }
                            />
                          </td>

                          {/* Particulars Input */}
                          <td>
                            <input
                              name="particular"
                              placeholder="Particular"
                              onChange={(event) => handleFormChange(event, i)}
                              value={entry.particular}
                              className="form-control text-center noBorder"
                              type="text"
                            />
                          </td>

                          {/* Dynamically Generate <td> Based on Projection Years */}
                          {adjustedYears.map((yr, y) => (
                            <td key={y}>
                              <input
                                name="value"
                                placeholder="0"
                                onChange={(event) =>
                                  handleFormChange(event, i, y)
                                }
                                value={yr || 0}
                                className="form-control text-end noBorder"
                                type="number"
                              />
                            </td>
                          ))}

                          {/* Row Type Dropdown */}
                          <td>
                            <select
                              className="form-control"
                              id="rowType"
                              name="rowType"
                              value={entry.rowType}
                              onChange={(e) => handleFormChange(e, i)}
                              style={{
                                fontSize: "0.8em",
                                padding: "0px",
                                border: "none",
                              }}
                            >
                              <option value="0">Normal</option>
                              <option value="1">Heading</option>
                              <option value="2">Bold</option>
                              <option value="3">B \ U</option>
                            </select>
                          </td>

                          {/* Remove Button */}
                          <td>
                            <button
                              className="rmvBtn"
                              type="button"
                              onClick={(e) => removeFields(e, i)}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="position-relative w-100 overflow-y-scroll">
                <div className="pt-3 total-div">
                  <div className="d-flex">
                    <label htmlFor="" className="form-label w-25 fs-10">
                      Total Revenue
                    </label>
                    <table class="table">
                      <tbody>
                        <tr>
                          {localData.totalRevenueForOthers?.map((v, i) => (
                            <td key={i}>
                              <input
                                name={`value-${i}`} // Unique name for each input
                                placeholder="Enter value"
                                value={v ?? ""} // Ensure empty fields show blank, not `undefined` or `0`
                                onChange={(e) =>
                                  handleTotalRevenueForOthersChange(
                                    e.target.value,
                                    i
                                  )
                                }
                                className="form-control text-end noBorder"
                                type="number"
                                style={{
                                  padding: "5px",
                                }}
                              />
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={submit}>
            <div className="position-relative w-100">
              <div className="form-scroll" style={{ height: "30vh" }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th className="header-label">Index</th>
                      <th className="header-label">Particulars</th>

                      {/* Dynamically Generate Table Headers */}
                      {Array.from({
                        length:
                          parseInt(
                            formData?.ProjectReportSetting?.ProjectionYears
                          ) || 1,
                      }).map((_, b) => (
                        <th key={b} className="header-label">
                          Year {b + 1}
                        </th>
                      ))}

                      <th className="header-label"></th>
                    </tr>
                  </thead>

                  <tbody>
                    {localData.formFields2.map((entry, i) => {
                      // Adjust the number of years dynamically
                      const validProjectionYears = Math.max(
                        1,
                        formData?.ProjectReportSetting?.ProjectionYears || 1
                      );
                      const adjustedYears = [
                        ...entry.years.slice(0, validProjectionYears),
                        ...Array(
                          Math.max(
                            0,
                            validProjectionYears - (entry.years?.length || 0)
                          )
                        ).fill(""),
                      ];

                      return (
                        <tr key={i}>
                          <td>{i + 1}</td>
                          <td>
                            <input
                              name="particular"
                              placeholder="Particular"
                              onChange={(event) => handleFormChange2(event, i)}
                              value={entry.particular}
                              className="form-control text-center noBorder"
                              type="text"
                            />
                          </td>

                          {/* Dynamically Generate <td> Based on Projection Years */}
                          {adjustedYears.map((yr, y) => (
                            <td key={y}>
                              <input
                                name="value"
                                placeholder="0"
                                onChange={(event) =>
                                  handleFormChange2(event, i, y)
                                }
                                value={yr || 1}
                                className="form-control text-end noBorder"
                                type="number"
                              />
                            </td>
                          ))}

                          <td>
                            <button
                              className="rmvBtn"
                              type="button"
                              onClick={(e) => removeFields2(e, i)}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="position-relative w-100">
                <div className="total-div pt-3 px-2">
                  {/* Total Monthly Revenue */}
                  <div className="d-flex">
                    <label className="form-label w-[20rem] fs-10">
                      Total Monthly Revenue
                    </label>
                    <table className="table mb-1">
                      <tbody>
                        <tr>
                          {totalMonthlyRevenue.map((v, i) => (
                            <td key={i}>{v.toLocaleString("en-IN")}</td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Number of Months */}
                  <div className="d-flex">
                    <label className="form-label w-[20rem] fs-10">
                      No. of Months
                    </label>
                    <table className="table mb-1">
                      <tbody>
                        <tr>
                          {noOfMonths.map((v, i) => (
                            <td key={i}>
                              <input
                                className="form-control text-center w-20 p-0"
                                style={{ width: "4rem", padding: "0px" }}
                                type="number"
                                value={v || 0}
                                onChange={(e) => changeMonth(i, e.target.value)}
                              />
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Total Revenue */}
                  <div className="d-flex">
                    <label className="form-label w-[20rem] fs-10">
                      Total Revenue
                    </label>
                    <table className="table">
                      <tbody>
                        <tr>
                          {totalRevenue.map((v, i) => (
                            <td key={i}>{v.toLocaleString("en-IN")}</td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </>
  );
};

export default SixthRevenue;

// import { useState, useEffect } from "react";

// const SixthRevenue = ({ onFormDataChange, years, revenueData, formData }) => {
//   const projectionYears = Math.max(
//     1,
//     parseInt(formData?.ProjectReportSetting?.ProjectionYears) || years || 1
//   );

//   const [localData, setLocalData] = useState(() => {
//     return revenueData && Object.keys(revenueData).length > 0
//       ? revenueData
//       : {
//           formFields: [
//             {
//               particular: "p1",
//               years: Array.from({ length: Math.max(1, projectionYears) }).fill(
//                 0
//               ),
//               amount: 0,
//               rowType: "0",
//             },
//           ],
//           totalRevenueForOthers: Array.from({
//             length: Math.max(1, projectionYears),
//           }).fill(0),
//           formFields2: [
//             {
//               particular: "p1",
//               years: Array.from({ length: Math.max(1, projectionYears) }).fill(
//                 0
//               ),
//               amount: 0,
//             },
//           ],
//           selectedToggleType: "",
//         };
//   });

//   const [totalMonthlyRevenue, setTotalMonthlyRevenue] = useState(
//     Array.from({ length: Math.max(1, projectionYears) }).fill(0)
//   );
//   const [noOfMonths, setNoOfMonths] = useState(
//     Array.from({ length: projectionYears || 1 }).fill(12)
//   );
//   const [totalRevenue, setTotalRevenue] = useState(
//     Array.from({ length: Math.max(1, projectionYears) }).fill(0)
//   );

//   const [totalRevenueForOthers, setTotalRevenueForOthers] = useState(
//     Array.from({ length: Math.max(1, projectionYears) }).fill(0)
//   );

//   const [formType, setFormType] = useState(""); // ✅ Track selected toggle type

//   useEffect(() => {
//     if (revenueData && Object.keys(revenueData).length > 0) {
//       setLocalData(revenueData); // ✅ Update when new business is selected
//     }
//   }, [revenueData]);

//   useEffect(() => {
//     onFormDataChange({ Revenue: localData });
//   }, [localData, onFormDataChange]);

//   console.log("form Data from Revenue : ", formData);

//   const addFields = (e) => {
//     e.preventDefault();
//     let object = {
//       particular: "",
//       years: Array.from({ length: Math.max(1, projectionYears) }).fill(0),
//       amount: 0,
//       rowType: "0",
//     };
//     setLocalData({
//       ...localData,
//       formFields: [...localData.formFields, object],
//     });
//   };

//   const removeFields = (e, childIndex) => {
//     e.preventDefault();
//     let data = [...localData.formFields];
//     data.splice(childIndex, 1);
//     setLocalData({
//       ...localData,
//       formFields: data,
//     });
//   };

//   const handleFormChange = (event, index, field = null) => {
//     const { name, value } = event.target;
//     const updatedFormFields = [...localData.formFields];

//     if (field === "serialNumber") {
//       updatedFormFields[index][field] = value; // ✅ Store any alphanumeric value
//     } else if (field !== null) {
//       updatedFormFields[index].years[field] = value;
//     } else {
//       updatedFormFields[index][name] = value;
//     }

//     setLocalData({ ...localData, formFields: updatedFormFields });
//   };

//   const toggleType = (value) => {
//     setFormType(value); // ✅ Update state

//     // ✅ Update localData with selected toggle type
//     setLocalData((prevData) => ({
//       ...prevData,
//       selectedToggleType: value, // ✅ Store toggle type inside localData
//     }));
//   };

//   const addFields2 = (e) => {
//     e.preventDefault();
//     let object = {
//       particular: "",
//       years: Array.from({ length: Math.max(1, projectionYears) }).fill(0),
//       amount: 0,
//     };
//     setLocalData({
//       ...localData,
//       formFields2: [...localData.formFields2, object],
//     });
//   };

//   const removeFields2 = (e, childIndex) => {
//     e.preventDefault();
//     let data = [...localData.formFields2];
//     data.splice(childIndex, 1);
//     setLocalData({
//       ...localData,
//       formFields2: data,
//     });
//   };

//   const handleFormChange2 = (event, childIndex, year) => {
//     let data = [...localData.formFields2];
//     if (event.target.name === "particular") {
//       data[childIndex]["particular"] = event.target.value;
//     } else if (event.target.name === "amount") {
//       data[childIndex]["amount"] = Number(event.target.value);
//     } else {
//       data[childIndex]["years"][year] = Number(event.target.value);
//     }
//     setLocalData({ ...localData, formFields2: data });
//   };

//   const handleTotalRevenueForOthersChange = (value, index) => {
//     const updatedRevenue = [...localData.totalRevenueForOthers];
//     updatedRevenue[index] = Number(value);
//     setLocalData((prevData) => ({
//       ...prevData,
//       totalRevenueForOthers: updatedRevenue,
//     }));
//   };

//   // Function to calculate total monthly revenue (sum of all year inputs)
//   const calculateTotalMonthlyRevenue = () => {
//     const total = Array.from(
//       { length: projectionYears || 1 },
//       (_, yearIndex) => {
//         return localData.formFields2.reduce(
//           (sum, field) => sum + Number(field.years[yearIndex] || 0),
//           0
//         );
//       }
//     );
//     setTotalMonthlyRevenue(total);
//   };

//   // Function to calculate total revenue (Monthly Revenue * No. of Months)
//   const calculateTotalRevenue = () => {
//     const revenue = totalMonthlyRevenue.map(
//       (monthlyRev, index) =>
//         Number(monthlyRev || 0) * Number(noOfMonths[index] || 12)
//     );
//     setTotalRevenue(revenue);
//   };

//   // Function to update No. of Months and trigger revenue calculation
//   const changeMonth = (index, value) => {
//     const updatedMonths = [...noOfMonths];
//     updatedMonths[index] = Number(value) || 12; // Default 12 months if empty

//     setNoOfMonths(updatedMonths);
//     calculateTotalRevenue();
//   };

//   // Call these functions when form values change
//   useEffect(() => {
//     calculateTotalMonthlyRevenue();
//   }, [localData.formFields2]);

//   useEffect(() => {
//     calculateTotalRevenue();
//   }, [totalMonthlyRevenue, noOfMonths]);

//   const submit = (e) => {
//     e.preventDefault();
//     // Handle form submission here
//     console.log("Form submitted", localData);
//   };

//   return (
//     <>
//       <div className="form-scroll">
//         <div className="toggleBtn">
//           {formType ? (
//             <button
//               className="btn btn-sm btn-primary px-4 me-auto"
//               type="button"
//               onClick={addFields}
//             >
//               Add Field +
//             </button>
//           ) : (
//             <button
//               className="btn btn-sm btn-success px-4 me-auto"
//               type="button"
//               onClick={addFields2}
//             >
//               Add Field +
//             </button>
//           )}
//           Monthly
//           <input
//             type="checkbox"
//             id="toggle-btn"
//             onChange={(e) => toggleType(e.target.checked)}
//             checked={formType}
//           />
//           <label htmlFor="toggle-btn"></label>
//           Others
//         </div>

//         {formType ? (
//           <form onSubmit={submit}>
//             <div className="position-relative w-100">
//               <div className="form-scroll" style={{ paddingBottom: "12%" }}>
//                 <table className="table">
//                   <thead>
//                     <tr>
//                       <th className="header-label">Index</th>
//                       <th className="header-label">Particulars</th>

//                       {/* Dynamically Generate Table Headers */}
//                       {Array.from({
//                         length:
//                           parseInt(
//                             formData?.ProjectReportSetting?.ProjectionYears
//                           ) || 1,
//                       }).map((_, b) => (
//                         <th key={b} className="header-label">
//                           Year {b + 1}
//                         </th>
//                       ))}

//                       <th className="header-label">Type</th>
//                       <th className="header-label"></th>
//                     </tr>
//                   </thead>

//                   <tbody>
//                     {localData.formFields.map((entry, i) => {
//                       // Adjust the number of years dynamically
//                       const validProjectionYears = Math.max(
//                         1,
//                         formData?.ProjectReportSetting?.ProjectionYears || 1
//                       );
//                       const adjustedYears = [
//                         ...entry.years.slice(0, validProjectionYears),
//                         ...Array(
//                           Math.max(
//                             0,
//                             validProjectionYears - (entry.years?.length || 0)
//                           )
//                         ).fill(""),
//                       ];

//                       return (
//                         <tr
//                           key={i}
//                           className={`rowHover ${
//                             entry.rowType === "0"
//                               ? "normalRow"
//                               : entry.rowType === "1"
//                               ? "headingRow"
//                               : entry.rowType === "2"
//                               ? "boldRow"
//                               : entry.rowType === "3"
//                               ? "boldUnderlineRow"
//                               : ""
//                           }`}
//                         >
//                           {/* ✅ Editable Serial Number (Now Alphanumeric) */}
//                           <td>
//                             <input
//                               name="serialNumber"
//                               type="text" // ✅ Changed to text to allow alphanumeric values
//                               className="form-control text-center noBorder"
//                               value={entry.serialNumber || i + 1} // Default to `i + 1`
//                               onChange={(event) =>
//                                 handleFormChange(event, i, "serialNumber")
//                               }
//                             />
//                           </td>

//                           {/* Particulars Input */}
//                           <td>
//                             <input
//                               name="particular"
//                               placeholder="Particular"
//                               onChange={(event) => handleFormChange(event, i)}
//                               value={entry.particular}
//                               className="form-control text-center noBorder"
//                               type="text"
//                             />
//                           </td>

//                           {/* Dynamically Generate <td> Based on Projection Years */}
//                           {adjustedYears.map((yr, y) => (
//                             <td key={y}>
//                               <input
//                                 name="value"
//                                 placeholder="0"
//                                 onChange={(event) =>
//                                   handleFormChange(event, i, y)
//                                 }
//                                 value={yr || 0}
//                                 className="form-control text-end noBorder"
//                                 type="number"
//                               />
//                             </td>
//                           ))}

//                           {/* Row Type Dropdown */}
//                           <td>
//                             <select
//                               className="form-control #000"
//                               id="rowType"
//                               name="rowType"
//                               value={entry.rowType}
//                               onChange={(e) => handleFormChange(e, i)}
//                               style={{ fontSize: "0.8em" }}
//                             >
//                               <option value="0">Normal</option>
//                               <option value="1">Heading</option>
//                               <option value="2">Bold</option>
//                               <option value="3">B \ U</option>
//                             </select>
//                           </td>

//                           {/* Remove Button */}
//                           <td>
//                             <button
//                               className="rmvBtn"
//                               type="button"
//                               onClick={(e) => removeFields(e, i)}
//                             >
//                               Remove
//                             </button>
//                           </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>
//               </div>

//               <div className="position-relative w-100">
//                 <div className="total-div pt-3">
//                   <div className="d-flex">
//                     <label htmlFor="" className="form-label w-25 fs-10">
//                       Total Revenue
//                     </label>
//                     <table class="table">
//                       <tbody>
//                         <tr>
//                           {totalRevenueForOthers.map((v, i) => {
//                             return (
//                               <td key={i}>
//                                 <input
//                                   name="value"
//                                   placeholder="value"
//                                   onChange={(e) =>
//                                     handleTotalRevenueForOthersChange(
//                                       e.target.value,
//                                       i
//                                     )
//                                   }
//                                   value={v || 0}
//                                   className="form-control text-end noBorder"
//                                   type="number"
//                                 />
//                               </td>
//                             );
//                           })}
//                         </tr>
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </form>
//         ) : (
//           <form onSubmit={submit}>
//             <div className="position-relative w-100">
//               <div className="form-scroll" style={{ paddingBottom: "12%" }}>
//                 <table className="table">
//                   <thead>
//                     <tr>
//                       <th className="header-label">Index</th>
//                       <th className="header-label">Particulars</th>

//                       {/* Dynamically Generate Table Headers */}
//                       {Array.from({
//                         length:
//                           parseInt(
//                             formData?.ProjectReportSetting?.ProjectionYears
//                           ) || 1,
//                       }).map((_, b) => (
//                         <th key={b} className="header-label">
//                           Year {b + 1}
//                         </th>
//                       ))}

//                       <th className="header-label"></th>
//                     </tr>
//                   </thead>

//                   <tbody>
//                     {localData.formFields2.map((entry, i) => {
//                       // Adjust the number of years dynamically
//                       const validProjectionYears = Math.max(
//                         1,
//                         formData?.ProjectReportSetting?.ProjectionYears || 1
//                       );
//                       const adjustedYears = [
//                         ...entry.years.slice(0, validProjectionYears),
//                         ...Array(
//                           Math.max(
//                             0,
//                             validProjectionYears - (entry.years?.length || 0)
//                           )
//                         ).fill(""),
//                       ];

//                       return (
//                         <tr key={i}>
//                           <td>{i + 1}</td>
//                           <td>
//                             <input
//                               name="particular"
//                               placeholder="Particular"
//                               onChange={(event) => handleFormChange2(event, i)}
//                               value={entry.particular}
//                               className="form-control text-center noBorder"
//                               type="text"
//                             />
//                           </td>

//                           {/* Dynamically Generate <td> Based on Projection Years */}
//                           {adjustedYears.map((yr, y) => (
//                             <td key={y}>
//                               <input
//                                 name="value"
//                                 placeholder="0"
//                                 onChange={(event) =>
//                                   handleFormChange2(event, i, y)
//                                 }
//                                 value={yr || 1}
//                                 className="form-control text-end noBorder"
//                                 type="number"
//                               />
//                             </td>
//                           ))}

//                           <td>
//                             <button
//                               className="rmvBtn"
//                               type="button"
//                               onClick={(e) => removeFields2(e, i)}
//                             >
//                               Remove
//                             </button>
//                           </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>
//               </div>

//               <div className="position-relative w-100">
//                 <div className="total-div pt-3 px-2">
//                   <div className="d-flex">
//                     <label className="form-label w-[10rem] fs-10">
//                       Total Monthly Revenue
//                     </label>
//                     <table className="table mb-1">
//                       <tbody>
//                         <tr>
//                           {totalMonthlyRevenue.map((v, i) => (
//                             <td key={i}>{v}</td> // Display the exact sum of year columns
//                           ))}
//                         </tr>
//                       </tbody>
//                     </table>
//                   </div>

//                   <div className="d-flex">
//                     <label className="form-label w-[10rem] fs-10">
//                       No. of Months
//                     </label>
//                     <table className="table mb-1">
//                       <tbody>
//                         <tr>
//                           {noOfMonths.map((v, i) => (
//                             <td key={i}>
//                               <input
//                                 className="form-control text-center w-100 "
//                                 style={{width : "4rem",
//                                   padding: '0px'
//                                 }}
//                                 type="number"
//                                 value={v || 0}
//                                 onChange={(e) => changeMonth(i, e.target.value)}
//                               />
//                             </td>
//                           ))}
//                         </tr>
//                       </tbody>
//                     </table>
//                   </div>

//                   <div className="d-flex">
//                     <label className="form-label w-[10rem] fs-10">
//                       Total Revenue
//                     </label>
//                     <table className="table">
//                       <tbody>
//                         <tr>
//                           {totalRevenue.map((v, i) => (
//                             <td key={i}>{v}</td> // Display Monthly Revenue * No. of Months
//                           ))}
//                         </tr>
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </form>
//         )}
//       </div>
//     </>
//   );
// };

// export default SixthRevenue;
