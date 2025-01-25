import React, { useState, useEffect } from "react";
import deleteImg from "../delete.png";
import checkImg from "../check.png";

const SeventhStepMD = ({ formData, onFormDataChange, years }) => {
  const [localData, setLocalData] = useState({
    currentLiabilities: [
      {
        particular: "Uses",
        years: Array.from({ length: years }).fill(0),
        isCustom: false,
      },
      {
        particular: "Other Current Liabilities",
        years: Array.from({ length: years }).fill(0),
        isCustom: false,
      },
      {
        particular: "Outstanding Expenses",
        years: Array.from({ length: years }).fill(0),
        isCustom: false,
      },
      {
        particular: "Sundry Creditors / Trade Payables",
        years: Array.from({ length: years }).fill(0),
        isCustom: false,
      },
      {
        particular: "Short term loans",
        years: Array.from({ length: years }).fill(0),
        isCustom: false,
      },
      {
        particular: "Quasi Equity (Important to set Current Ratio)",
        years: Array.from({ length: years }).fill(0),
        isCustom: false,
      },
    ],
    currentAssets: [
      {
        particular: "Sources",
        years: Array.from({ length: years }).fill(0),
        isCustom: false,
      },
      {
        particular: "Other Current Assets",
        years: Array.from({ length: years }).fill(0),
        isCustom: false,
      },
      {
        particular: "Prepaid Expenses",
        years: Array.from({ length: years }).fill(0),
        isCustom: false,
      },
      {
        particular: "Investments",
        years: Array.from({ length: years }).fill(0),
        isCustom: false,
      },
      {
        particular: "Trade Receivables / Sundry Debtors",
        years: Array.from({ length: years }).fill(0),
        isCustom: false,
      },
      {
        particular: "Advances to employees & Suppliers",
        years: Array.from({ length: years }).fill(0),
        isCustom: false,
      },
      {
        particular: "Inventory",
        years: Array.from({ length: years }).fill(0),
        isCustom: false,
      },
    ],
  });

  // Handle adding new fields to liabilities
  const addFields = (type) => {
    const newData = {
      particular: "",
      years: Array.from({ length: years }).fill(0),
      isCustom: true,
    };
    if (type === "liabilities") {
      setLocalData((prevData) => ({
        ...prevData,
        currentLiabilities: [...prevData.currentLiabilities, newData],
      }));
    } else if (type === "assets") {
      setLocalData((prevData) => ({
        ...prevData,
        currentAssets: [...prevData.currentAssets, newData],
      }));
    }
  };

  // Handle removing fields from liabilities or assets
  const removeFields = (e, childIndex, type) => {
    e.preventDefault();
    if (type === "liabilities") {
      setLocalData((prevData) => {
        const updatedLiabilities = [...prevData.currentLiabilities];
        updatedLiabilities.splice(childIndex, 1);
        return { ...prevData, currentLiabilities: updatedLiabilities };
      });
    } else if (type === "assets") {
      setLocalData((prevData) => {
        const updatedAssets = [...prevData.currentAssets];
        updatedAssets.splice(childIndex, 1);
        return { ...prevData, currentAssets: updatedAssets };
      });
    }
  };

  // Handle changes in liabilities or assets input fields
  const handleFormChange = (event, childIndex, year, type) => {
    const { name, value } = event.target;
    setLocalData((prevData) => {
      const updatedData = { ...prevData };
      const dataArray =
        type === "liabilities"
          ? updatedData.currentLiabilities
          : updatedData.currentAssets;

      if (name === "particular") {
        dataArray[childIndex]["particular"] = value;
      } else {
        dataArray[childIndex]["years"][year] = Number(value);
      }

      if (type === "liabilities") {
        updatedData.currentLiabilities = dataArray;
      } else {
        updatedData.currentAssets = dataArray;
      }
      return updatedData;
    });
  };

  // Effect to send form data when localData is updated
  useEffect(() => {
    // console.log("More Details updated:", localData); // Debugging line
    onFormDataChange({ MoreDetails: localData });
  }, [localData, onFormDataChange]);

  const submit = (e) => {
    e.preventDefault();
    // Handle form submission logic
    // console.log("Form submitted with data:", localData);
  };

  const [localDataa, setLocalDataa] = useState(() => {
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

  const [projectionYears, setProjectionYears] = useState(
    localDataa.ProjectionYears || 0
  );

  function getEmptyArray() {
    return Array.from({ length: years }).fill(0);
  }

  const [withdrawls, setWithdrawls] = useState(getEmptyArray());
  const [openingStock, setOpeningStock] = useState(getEmptyArray());
  const [closingStock, setClosingStock] = useState(getEmptyArray());

  const handleStockChanges = (name, index, value) => {
    if (name === "withdrawls") {
      let temp = withdrawls;
      temp[index] = value;
      setWithdrawls([...temp]);
    } else if (name === "openingStock") {
      let temp = openingStock;
      temp[index] = value;
      setOpeningStock([...temp]);
    } else if (name === "closingStock") {
      let temp = closingStock;
      temp[index] = value;
      setClosingStock([...temp]);

      if (index < years - 1) {
        let openingTemp = openingStock;
        openingTemp[index + 1] = value;
        setOpeningStock(openingTemp);
      }
    }
  };

  return (
    <div>
      <form onSubmit={submit}>
        <div className="position-relative w-100">
          <div className="form-scroll" style={{ paddingBottom: "12%" }}>
            <table className="table">
              <thead>
                <tr>
                  <th className="header-label">Particulars</th>
                  {/* Dynamically generate the year columns */}
                  {[...Array(parseInt(projectionYears))].map((_, index) => (
                    <th key={index} className="header-label">
                      Year {index + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Opening Stock row */}
                <tr>
                  <td>
                    <input
                      name="openingStock"
                      placeholder="Opening Stock"
                      value="Opening Stock"
                      className="form-control text-center noBorder"
                      type="text"
                      disabled
                    />
                  </td>
                  {/* Dynamically creating <td>s for each year */}
                  {[...Array(parseInt(projectionYears))].map((_, y) => (
                    <td key={y}>
                      <input
                        name="value"
                        placeholder="Value"
                        onChange={(event) =>
                          handleStockChanges(
                            "openingStock",
                            y,
                            event.target.value
                          )
                        }
                        value={openingStock[y] || 0} // Default to 0 if undefined
                        className="form-control text-end noBorder"
                        type="number"
                        disabled={y > 0} // Disable input for all years except the first one
                      />
                    </td>
                  ))}
                </tr>

                {/* Closing Stock row */}
                <tr>
                  <td>
                    <input
                      name="closingStock"
                      placeholder="Closing Stock"
                      value="Closing Stock"
                      className="form-control text-center noBorder"
                      type="text"
                      disabled
                    />
                  </td>
                  {[...Array(parseInt(projectionYears))].map((_, y) => (
                    <td key={y}>
                      <input
                        name="value"
                        placeholder="Value"
                        onChange={(event) =>
                          handleStockChanges(
                            "closingStock",
                            y,
                            event.target.value
                          )
                        }
                        value={closingStock[y] || 0} // Default to 0 if undefined
                        className="form-control text-end noBorder"
                        type="number"
                      />
                    </td>
                  ))}
                </tr>

                {/* Withdrawals row */}
                <tr>
                  <td>
                    <input
                      name="withdrawls"
                      placeholder="Withdrawals"
                      value="Withdrawals"
                      className="form-control text-center noBorder"
                      type="text"
                      disabled
                    />
                  </td>
                  {/* Dynamically creating <td>s for each year */}
                  {[...Array(parseInt(projectionYears))].map((_, y) => (
                    <td key={y}>
                      <input
                        name="value"
                        placeholder="Value"
                        onChange={(event) =>
                          handleStockChanges(
                            "withdrawls",
                            y,
                            event.target.value
                          )
                        }
                        value={withdrawls[y] || 0} // Default to 0 if undefined
                        className="form-control text-end noBorder"
                        type="number"
                      />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>

            {/* Current Liabilities Table */}
            <h5 className="text-start text-primary mt-4 mb-0">
              Current Liabilities
            </h5>
            <hr className="mt-0 mb-1" />
            <table className="table">
              <thead>
                <tr>
                  <th className="header-label">Index</th>
                  <th className="header-label">Particulars</th>
                  {[...Array(parseInt(projectionYears))].map((_, index) => (
                    <th key={index} className="header-label">
                      Year {index + 1}
                    </th>
                  ))}
                  <th className="header-label"></th>
                </tr>
              </thead>
              <tbody>
                {localData.currentLiabilities.map((entry, i) => (
                  <tr key={i} className="rowHover">
                    <td>{i + 1}</td>
                    <td>
                      <input
                        name="particular"
                        placeholder="Particular"
                        onChange={(event) =>
                          handleFormChange(event, i, null, "liabilities")
                        }
                        value={entry.particular}
                        className="form-control text-center noBorder"
                        type="text"
                        disabled={!entry.isCustom}
                      />
                    </td>
                    {entry.years.map((yr, y) => (
                      <td key={y}>
                        <input
                          name="value"
                          placeholder="value"
                          onChange={(event) =>
                            handleFormChange(event, i, y, "liabilities")
                          }
                          value={yr}
                          className="form-control text-end noBorder"
                          type="number"
                        />
                      </td>
                    ))}
                    {[...Array(parseInt(projectionYears))].map((_, y) => {
                      return (
                        <td key={y}>
                          <input
                            name={`year-${y}`}
                            placeholder={`0`}
                            onChange={(event) => handleFormChange(event, i, y)}
                            value={entry.years[y]}
                            className="form-control text-end noBorder"
                            type="number"
                          />
                        </td>
                      );
                    })}
                    <td>
                      {entry.isCustom ? (
                        <button
                          className="btn h-100 mt-auto"
                          style={{
                            width: "50px",
                            padding: "0",
                            border: "none",
                          }}
                          onClick={(e) => removeFields(e, i, "liabilities")}
                        >
                          <img
                            src={deleteImg}
                            alt="Remove"
                            style={{ width: "30px", marginTop: "5%" }}
                          />
                        </button>
                      ) : (
                        <span
                          className="h-100 mt-auto mx-2"
                          style={{
                            width: "43px",
                            padding: "0",
                            border: "none",
                          }}
                        >
                          <img
                            src={checkImg}
                            alt="add"
                            style={{ width: "25px", marginTop: "10%" }}
                          />
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              className="btn btn-sm btn-primary px-4 me-auto"
              type="button"
              onClick={() => addFields("liabilities")}
            >
              Add Liability +
            </button>

            {/* Current Assets Table */}
            <h5 className="text-start text-primary mt-4 mb-0">
              Current Assets
            </h5>
            <hr className="mt-0 mb-1" />
            <table className="table">
              <thead>
                <tr>
                  <th className="header-label">Index</th>
                  <th className="header-label">Particulars</th>
                  {[...Array(parseInt(projectionYears))].map((_, index) => (
                    <th key={index} className="header-label">
                      Year {index + 1}
                    </th>
                  ))}
                  <th className="header-label"></th>
                </tr>
              </thead>
              <tbody>
                {localData.currentAssets.map((entry, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>
                      <input
                        name="particular"
                        placeholder="Particular"
                        onChange={(event) =>
                          handleFormChange(event, i, null, "assets")
                        }
                        value={entry.particular}
                        className="form-control text-center noBorder"
                        type="text"
                        disabled={!entry.isCustom}
                      />
                    </td>
                    {[...Array(parseInt(projectionYears))].map((_, y) => {
                      return (
                        <td key={y}>
                          <input
                            name={`year-${y}`}
                            placeholder={`0`}
                            onChange={(event) => handleFormChange(event, i, y)}
                            value={entry.years[y]}
                            className="form-control text-end noBorder"
                            type="number"
                          />
                        </td>
                      );
                    })}

                    <td>
                      {entry.isCustom ? (
                        <button
                          className="btn h-100 mt-auto"
                          style={{
                            width: "50px",
                            padding: "0",
                            border: "none",
                          }}
                          onClick={(e) => removeFields(e, i, "assets")}
                        >
                          <img
                            src={deleteImg}
                            alt="Remove"
                            style={{ width: "30px", marginTop: "5%" }}
                          />
                        </button>
                      ) : (
                        <span
                          className="h-100 mt-auto mx-2"
                          style={{
                            width: "43px",
                            padding: "0",
                            border: "none",
                          }}
                        >
                          <img
                            src={checkImg}
                            alt="add"
                            style={{ width: "25px", marginTop: "10%" }}
                          />
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              className="btn btn-sm btn-success px-4 me-auto"
              type="button"
              onClick={() => addFields("assets")}
            >
              Add Asset +
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SeventhStepMD;
