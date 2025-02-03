import React, { useState, useEffect } from "react";

const SixthRevenue = ({ handleSave, years }) => {
  const [localData, setLocalData] = useState(() => {
    const savedData = localStorage.getItem("FourthStepPRS");

    // Parse and return saved data if it exists, otherwise use the default structure
    return savedData
      ? JSON.parse(savedData)
      : {
          ProjectionYears: {
            name: "Projection Years",
            id: "ProjectionYears",
            value: "",
            isCustom: false,
          },
        };
  });

  const [formType, setFormType] = useState(true); // Defaulting to "Others"
  const toggleType = (value) => {
    console.log(value);
    setFormType(value);
  };

  const [projectionYears, setProjectionYears] = useState(Number(localData.ProjectionYears?.value || 1));
  const yearsValid = typeof years === "number" && years > 0 ? years : 1;

  const [formFields, setFormFields] = useState([
    {
      particular: "p1",
      years: Array.from({ length: years }).fill(0),
      rowType: "0",
    },
  ]);
  //totalRevenue for others type
  const [totalRevenueForOthers, setTotalRevenueForOthers] = useState(
    Array.from({ length: yearsValid }).fill(0)

  );

  const [formFields2, setFormFields2] = useState([
    { particular: "p1", years: Array.from({ length: years }).fill(0) },
  ]);
  const revenueData = Array.isArray(formFields) ? formFields : [];
  



  const addFields = (e) => {
    e.preventDefault();
    let object = {
      particular: "",
      years: Array.from({ length: years }).fill(0),
      rowType: "0",
    };
    setFormFields([...formFields, object]);
  };
  const removeFields = (e, childIndex) => {
    e.preventDefault();
    let data = [...formFields];
    data.splice(childIndex, 1);
    setFormFields(data);
  };
  const handleFormChange = (event, childIndex, year) => {
    let data = [...formFields];
    console.log(event.target.name);
    console.log(data);

    if (event.target.name === "particular") {
      data[childIndex]["particular"] = event.target.value;
    } else if (event.target.name === "rowType") {
      data[childIndex]["rowType"] = event.target.value;
    } else {
      data[childIndex]["years"][year] = Number(event.target.value);
    }

    setFormFields(data);
  };

  const handleTotalRevenueForOthersChange = (value, i) => {
    let temp = [...totalRevenueForOthers];
    temp[i] = Number(value);
    setTotalRevenueForOthers(temp);
  };

  const submit = (e) => {
    e.preventDefault();
    const final = {
      revenue: formType
        ? {
            type: "others",
            entries: formFields,
            totalRevenue: totalRevenueForOthers,
          }
        : {
            type: "monthly",
            entries: formFields2,
            totalMonthlyRevenue,
            noOfMonths,
  
          },
    };

    handleSave({ ...final });
  };

  const addFields2 = (e) => {
    e.preventDefault();
    let object = {
      particular: "",
      years: Array.from({ length: years }).fill(0),
    };
    setFormFields2([...formFields2, object]);
  };
  const removeFields2 = (e, childIndex) => {
    e.preventDefault();
    let data = [...formFields2];
    data.splice(childIndex, 1);
    setFormFields2(data);
  };
  const handleFormChange2 = (event, childIndex, year) => {
    let data = [...formFields2];

    if (event.target.name === "particular") {
      data[childIndex]["particular"] = event.target.value;
    } else {
      data[childIndex]["years"][year] = Number(event.target.value);
    }
    setFormFields2(data);
  };

  const initialTotalMonthlyRevenue = Array(parseInt(projectionYears)).fill(0);
  const initialNoOfMonths = Array(parseInt(projectionYears)).fill(12); // Default to 12 months

  const [totalMonthlyRevenue, setTotalMonthlyRevenue] = useState(
    initialTotalMonthlyRevenue
  );
  const [noOfMonths, setNoOfMonths] = useState(initialNoOfMonths);

  const changeMonth = (index, value) => {
    const newMonths = [...noOfMonths];
    newMonths[index] = value;
    setNoOfMonths(newMonths);
  };

  // Handle total monthly revenue changes
  const changeTotalMonthlyRevenue = (index, value) => {
    const newRevenue = [...totalMonthlyRevenue];
    newRevenue[index] = value;
    setTotalMonthlyRevenue(newRevenue);
  };

  useEffect(() => {
    let tempMonthlyRevenue = [...totalMonthlyRevenue];
    tempMonthlyRevenue = tempMonthlyRevenue.map((val) => {
      return 0;
    });
    formFields2.map((entry) => {
      entry["years"].forEach((sub, index) => {
        tempMonthlyRevenue[index] += sub;
        // totalMonthlyRevenue[index]+=Number(_.toString())
      });
      return null;
    });
    setTotalMonthlyRevenue([...tempMonthlyRevenue]);
  }, [formFields2]);

  useEffect(() => {
    let tempRevenue = totalMonthlyRevenue.map((val, i) => {
      return totalMonthlyRevenue[i] * noOfMonths[i];
    });

    console.log(tempRevenue);
  }, [noOfMonths, formFields2]);

  return (
    <div className="form-scroll">
      <div className="toggleBtn">
        {formType ? (
          <button
            className="btn btn-sm btn-primary px-4 me-auto"
            type="button"
            onClick={(e) => addFields(e)}
          >
            Add Field +
          </button>
        ) : (
          <button
            className="btn btn-sm btn-success px-4 me-auto"
            type="button"
            onClick={(e) => addFields2(e)}
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
        <label for="toggle-btn"></label>
        Others
      </div>
      {formType ? (
        <form onSubmit={submit} className="">
          <div className="position-relative w-100">
            <div className="form-scroll" style={{ paddingBottom: "12%" }}>
              <table class="table">
                <thead>
                  <tr>
                    <th class="header-label">Index</th>
                    <th class="header-label">Particulars</th>
                    {[...Array(parseInt(projectionYears))].map((_, index) => (
                      <th key={index} className="header-label">
                        Year {index + 1}
                      </th>
                    ))}
                    <th class="header-label">Type</th>
                    <th class="header-label"></th>
                  </tr>
                </thead>
                <tbody>
                  {formFields.map((entry, i) => {
                    return (
                      <tr
                        key={i}
                        className={
                          "rowHover " +
                          (entry.rowType === "5"
                            ? "normalRow"
                            : entry.rowType === "1"
                            ? "headingRow"
                            : entry.rowType === "2"
                            ? "boldRow"
                            : entry.rowType === "3"
                            ? "boldUnderlineRow"
                            : "")
                        }
                      >
                        <td>{i + 1}</td>
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
                        {/* Add TD for each year */}
                        {[...Array(parseInt(projectionYears))].map((_, y) => {
                          return (
                            <td key={y}>
                              <input
                                name={`year-${y}0`}
                                placeholder={`0`}
                                onChange={(event) =>
                                  handleFormChange(event, i, y)
                                }
                                value={entry.years[y]}
                                className="form-control text-end noBorder"
                                type="number"
                              />
                            </td>
                          );
                        })}
                        <td>
                          <select
                            className="form-control"
                            id="rowType"
                            name="rowType"
                            value={entry.rowType}
                            onChange={(e) => handleFormChange(e, i)}
                            style={{ fontSize: "0.8em" }}
                          >
                            <option value="0">Normal</option>
                            <option value="1">Heading</option>
                            <option value="2">Bold</option>
                            <option value="3">B \ U</option>
                          </select>
                        </td>
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
            <div className="position-fixed w-100">
              <div className="total-div pt-3">
                <div className="d-flex">
                  <label htmlFor="" className="form-label w-25 fs-10">
                    Total Revenue
                  </label>
                  <table class="table">
                    <tbody>
                      <tr>
                        {[...Array(parseInt(projectionYears))].map((_, i) => (
                          <td key={i}>
                            <input
                              className="form-control text-center w-100"
                              type="number"
                              value={totalMonthlyRevenue[i]}
                              onChange={(e) =>
                                changeTotalMonthlyRevenue(i, e.target.value)
                              }
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
        <form onSubmit={submit} className="">
          <div className="position-relative w-100">
            <div className="form-scroll" style={{ paddingBottom: "12%" }}>
              <table class="table">
                <thead>
                  <tr>
                    <th class="header-label">Index</th>
                    <th class="header-label">Particulars</th>
                    {[...Array(parseInt(projectionYears))].map((_, index) => (
                      <th key={index} className="header-label">
                        Year {index + 1}
                      </th>
                    ))}
                    <th class="header-label"></th>
                  </tr>
                </thead>
                <tbody>
                  {formFields2.map((entry, i) => {
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
                        {/* Add TD for each year */}
                        {[...Array(parseInt(projectionYears))].map((_, y) => {
                          return (
                            <td key={y}>
                              <input
                                name={`year-${y}`}
                                placeholder={`0`}
                                onChange={(event) =>
                                  handleFormChange2(event, i, y)
                                }
                                value={entry.years[y]}
                                className="form-control text-end noBorder"
                                type="number"
                              />
                            </td>
                          );
                        })}
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
            <div className="position-fixed w-100">
              <div className="total-div pt-3">
                <div className="d-flex">
                  <label htmlFor="" className="form-label w-25 fs-10">
                    Total Monthly Revenue
                  </label>
                  <table className="table mb-1">
                    <tbody>
                      <tr>
                        {[...Array(parseInt(projectionYears))].map((_, i) => (
                          <td key={i}>
                            <input
                              className="form-control text-center w-100"
                              type="number"
                              value={totalMonthlyRevenue[i]}
                              onChange={(e) =>
                                changeTotalMonthlyRevenue(i, e.target.value)
                              }
                            />
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="d-flex">
                  <label htmlFor="" className="form-label w-25 fs-10">
                    No. of Months
                  </label>
                  <table className="table mb-1">
                    <tbody>
                      <tr>
                        {[...Array(parseInt(projectionYears))].map((_, i) => (
                          <td key={i}>
                            <input
                              className="form-control text-center w-100"
                              type="number"
                              value={noOfMonths[i]}
                              onChange={(e) => changeMonth(i, e.target.value)}
                            />
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="d-flex">
                  <label htmlFor="" className="form-label w-25 fs-10">
                    Total Revenue
                  </label>
                  <table className="table">
                    <tbody>
                      <tr>
                        {[...Array(parseInt(projectionYears))].map((_, i) => (
                          <td key={i}>
                            {totalMonthlyRevenue[i] * noOfMonths[i]}{" "}
                            {/* Total Revenue calculation */}
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
      )}
    </div>
  );
};

export default SixthRevenue;
