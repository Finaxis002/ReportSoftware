import { useState, useEffect } from "react";

const SixthRevenue = ({ onFormDataChange, years, revenueData, formData }) => {
  const [localData, setLocalData] = useState(() => {
    return revenueData && Object.keys(revenueData).length > 0
      ? revenueData
      : {
          formFields: [
            {
              particular: "p1",
              years: Array.from({ length: years }).fill(0),
              amount: 0,
              rowType: "0",
            },
          ],
          totalRevenueForOthers: Array.from({ length: years }).fill(0),
          formFields2: [
            {
              particular: "p1",
              years: Array.from({ length: years }).fill(0),
              amount: 0,
            },
          ],
        };
  });

  const [totalMonthlyRevenue, setTotalMonthlyRevenue] = useState(
    Array.from({ length: years }).fill(0)
  );
  const [noOfMonths, setNoOfMonths] = useState(
    Array.from({ length: years }).fill(12)
  );
  const [totalRevenue, setTotalRevenue] = useState(
    Array.from({ length: years }).fill(0)
  );

  const [totalRevenueForOthers, setTotalRevenueForOthers] = useState(
    Array.from({ length: years }).fill(0)
  );

  useEffect(() => {
    if (revenueData && Object.keys(revenueData).length > 0) {
      setLocalData(revenueData); // ✅ Update when new business is selected
    }
  }, [revenueData]);

  useEffect(() => {
    onFormDataChange({ Revenue: localData });
  }, [localData, onFormDataChange]);

  console.log("form Data from Revenue : ", formData);

  const [formType, setFormType] = useState(false);

  const addFields = (e) => {
    e.preventDefault();
    let object = {
      particular: "",
      years: Array.from({ length: years }).fill(0),
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

  const handleFormChange = (event, childIndex, year) => {
    let data = [...localData.formFields];
    if (event.target.name === "particular") {
      data[childIndex]["particular"] = event.target.value;
    } else if (event.target.name === "rowType") {
      data[childIndex]["rowType"] = event.target.value;
    } else if (event.target.name === "amount") {
      data[childIndex]["amount"] = Number(event.target.value);
    } else {
      data[childIndex]["years"][year] = Number(event.target.value);
    }
    setLocalData({ ...localData, formFields: data });
  };

  const toggleType = (value) => {
    setFormType(value);
  };

  const addFields2 = (e) => {
    e.preventDefault();
    let object = {
      particular: "",
      years: Array.from({ length: years }).fill(0),
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
    const updatedRevenue = [...localData.totalRevenueForOthers];
    updatedRevenue[index] = Number(value);
    setLocalData((prevData) => ({
      ...prevData,
      totalRevenueForOthers: updatedRevenue,
    }));
  };

  // Function to calculate total monthly revenue (sum of all year inputs)
  const calculateTotalMonthlyRevenue = () => {
    const total = Array.from({ length: years }, (_, yearIndex) => {
      return localData.formFields2.reduce(
        (sum, field) => sum + Number(field.years[yearIndex] || 0),
        0
      );
    });
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
              <div className="form-scroll" style={{ paddingBottom: "12%" }}>
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
                          ) || 0,
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
                      const adjustedYears = [
                        ...entry.years.slice(
                          0,
                          formData.ProjectReportSetting.ProjectionYears
                        ), // Keep only required years
                        ...Array(
                          Math.max(
                            0,
                            formData.ProjectReportSetting.ProjectionYears -
                              entry.years.length
                          )
                        ).fill(""), // Fill missing years
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

                          {/* Dynamically Generate <td> Based on Projection Years */}
                          {adjustedYears.map((yr, y) => (
                            <td key={y}>
                              <input
                                name="value"
                                placeholder="0"
                                onChange={(event) =>
                                  handleFormChange(event, i, y)
                                }
                                value={yr}
                                className="form-control text-end noBorder"
                                type="number"
                              />
                            </td>
                          ))}

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

              <div className="position-relative w-100">
                <div className="total-div pt-3">
                  <div className="d-flex">
                    <label htmlFor="" className="form-label w-25 fs-10">
                      Total Revenue
                    </label>
                    <table class="table">
                      <tbody>
                        <tr>
                          {totalRevenueForOthers.map((v, i) => {
                            return (
                              <td key={i}>
                                <input
                                  name="value"
                                  placeholder="value"
                                  onChange={(e) =>
                                    handleTotalRevenueForOthersChange(
                                      e.target.value,
                                      i
                                    )
                                  }
                                  value={v}
                                  className="form-control text-end noBorder"
                                  type="number"
                                />
                              </td>
                            );
                          })}
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
              <div className="form-scroll" style={{ paddingBottom: "12%" }}>
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
                          ) || 0,
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
                      const adjustedYears = [
                        ...entry.years.slice(
                          0,
                          formData.ProjectReportSetting.ProjectionYears
                        ), // Keep only required years
                        ...Array(
                          Math.max(
                            0,
                            formData.ProjectReportSetting.ProjectionYears -
                              entry.years.length
                          )
                        ).fill(""), // Fill missing years
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
                                value={yr}
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
                  <div className="d-flex">
                    <label className="form-label w-[10rem] fs-10">
                      Total Monthly Revenue
                    </label>
                    <table className="table mb-1">
                      <tbody>
                        <tr>
                          {totalMonthlyRevenue.map((v, i) => (
                            <td key={i}>{v}</td> // Display the exact sum of year columns
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="d-flex">
                    <label className="form-label w-[10rem] fs-10">
                      No. of Months
                    </label>
                    <table className="table mb-1">
                      <tbody>
                        <tr>
                          {noOfMonths.map((v, i) => (
                            <td key={i}>
                              <input
                                className="form-control text-center w-100"
                                type="number"
                                value={v}
                                onChange={(e) => changeMonth(i, e.target.value)}
                              />
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="d-flex">
                    <label className="form-label w-[10rem] fs-10">
                      Total Revenue
                    </label>
                    <table className="table">
                      <tbody>
                        <tr>
                          {totalRevenue.map((v, i) => (
                            <td key={i}>{v}</td> // Display Monthly Revenue * No. of Months
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
