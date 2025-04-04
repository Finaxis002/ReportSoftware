import React, { useState, useEffect } from "react";
import deleteImg from "../delete.png";
import checkImg from "../check.png";

const SeventhStepMD = ({
  onFormDataChange,
  years,
  MoreDetailsData,
  formData,
}) => {
  const projectionYears =
    parseInt(formData?.ProjectReportSetting?.ProjectionYears) || years; // ✅ Ensure Projection Years are correctly set
  const getEmptyArray = () => Array.from({ length: projectionYears }).fill(0);
  // Initialize local data with default values or from props
  const [localData, setLocalData] = useState(() =>
    MoreDetailsData && Object.keys(MoreDetailsData).length > 0
      ? MoreDetailsData
      : {
          currentLiabilities: [
            { particular: "Uses", years: getEmptyArray(), isCustom: false },
            {
              particular: "Other Current Liabilities",
              years: getEmptyArray(),
              isCustom: false,
            },
            {
              particular: "Outstanding Expenses",
              years: getEmptyArray(),
              isCustom: false,
            },
            {
              particular: "Sundry Creditors / Trade Payables",
              years: getEmptyArray(),
              isCustom: false,
            },
            {
              particular: "Short term loans",
              years: getEmptyArray(),
              isCustom: false,
            },
            {
              particular: "Quasi Equity (Important to set Current Ratio)",
              years: getEmptyArray(),
              isCustom: false,
            },
          ],
          currentAssets: [
            { particular: "Sources", years: getEmptyArray(), isCustom: false },
            {
              particular: "Other Current Assets",
              years: getEmptyArray(),
              isCustom: false,
            },
            {
              particular: "Prepaid Expenses",
              years: getEmptyArray(),
              isCustom: false,
            },
            {
              particular: "Investments",
              years: getEmptyArray(),
              isCustom: false,
            },
            {
              particular: "Trade Receivables / Sundry Debtors",
              years: getEmptyArray(),
              isCustom: false,
            },
            {
              particular: "Advances to employees & Suppliers",
              years: getEmptyArray(),
              isCustom: false,
            },
            {
              particular: "Inventory",
              years: getEmptyArray(),
              isCustom: false,
            },
          ],
          OpeningStock: getEmptyArray(),
          ClosingStock: getEmptyArray(),
          Withdrawals: getEmptyArray(),
        }
  );
  const [overriddenOpeningStock, setOverriddenOpeningStock] = useState({});

  useEffect(() => {
    if (MoreDetailsData && Object.keys(MoreDetailsData).length > 0) {
      setLocalData(MoreDetailsData);
    }
  }, [MoreDetailsData]);

  useEffect(() => {
    onFormDataChange({ MoreDetails: localData });
  }, [localData, onFormDataChange]);

  // Handle Adding Custom Fields
  const addFields = (type) => {
    const newData = { particular: "", years: getEmptyArray(), isCustom: true };
    setLocalData((prevData) => ({
      ...prevData,
      [type]: [...prevData[type], newData],
    }));
  };

  // Handle Removing Custom Fields
  const removeFields = (e, index, type) => {
    e.preventDefault();
    setLocalData((prevData) => {
      const updatedData = [...prevData[type]];
      updatedData.splice(index, 1);
      return { ...prevData, [type]: updatedData };
    });
  };

  // Handle Form Input Changes
  const handleFormChange = (event, index, year, type) => {
    const { name, value } = event.target;
    setLocalData((prevData) => {
      const updatedData = { ...prevData };
      if (name === "particular") {
        updatedData[type][index]["particular"] = value;
      } else {
        updatedData[type][index]["years"][year] = Number(value);
      }
      return updatedData;
    });
  };

  const handleStockChanges = (name, index, value) => {
    const numericValue = Number(value);

    setLocalData((prevData) => {
      const updatedStock = {
        ...(prevData[name] ?? Array.from({ length: projectionYears }).fill(0)),
      };
      updatedStock[index] = numericValue;

      const newState = { ...prevData, [name]: updatedStock };

      // Sync ClosingStock → OpeningStock (if not overridden)
      if (name === "ClosingStock" && index < projectionYears - 1) {
        if (!overriddenOpeningStock[index + 1]) {
          newState.OpeningStock = {
            ...(prevData.OpeningStock ?? getEmptyArray()),
            [index + 1]: numericValue,
          };
        }
      }

      // If user is editing OpeningStock manually
      if (name === "OpeningStock") {
        setOverriddenOpeningStock((prev) => ({
          ...prev,
          [index]: true,
        }));
      }

      return newState;
    });
  };

  return (
    <div className="overflow-x-hidden">
      <form>
        <div
          // className="form-scroll"
          className="form-scroll"
        >
          {/* Stock Table */}
          <h5 className="text-start text-primary mt-4 mb-0">Stock Details</h5>
          <hr className="mt-0 mb-1" />
          {/* Stock Table */}
          <table
            // className="table"
            className="table google-sheet-table"
          >
            <thead>
              <tr>
                <th className="header-label">Particulars</th>
                {Array.from({ length: projectionYears }).map((_, index) => (
                  <th key={index} className="header-label">
                    Year {index + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {["OpeningStock", "ClosingStock", "Withdrawals"].map(
                (stockType) => (
                  <tr key={stockType}>
                    <td
                      className="google-sheet-input md-input"
                      style={{ width: "20rem" }}
                    >
                      {stockType.replace(/([A-Z])/g, " $1")}
                    </td>
                    {Array.from({ length: projectionYears }).map((_, index) => (
                      <td key={index} className="md-input">
                        <input
                          name="value"
                          onChange={(event) =>
                            handleStockChanges(
                              stockType,
                              index,
                              event.target.value
                            )
                          }
                          value={localData?.[stockType]?.[index] ?? ""}
                          className="form-control text-end noBorder"
                          type="number"
                        />
                      </td>
                    ))}
                  </tr>
                )
              )}
            </tbody>
          </table>

          {/* Current Liabilities & Assets Tables */}
          {["currentLiabilities", "currentAssets"].map((dataType) => (
            <div key={dataType}>
              <h5 className="text-start text-primary mt-4 mb-0">
                {dataType === "currentLiabilities"
                  ? "Current Liabilities"
                  : "Current Assets"}
              </h5>
              <hr className="mt-0 mb-1" />
              <table
                // className="table"
                className="table google-sheet-table"
              >
                <thead>
                  <tr>
                    <th className="header-label">Index</th>
                    <th className="header-label">Particular</th>

                    {/* Determine the max number of years dynamically */}
                    {Array.from({ length: projectionYears }).map((_, index) => (
                      <th key={index} className="header-label">
                        Year {index + 1}
                      </th>
                    ))}
                    {/* <th className="header-label"></th> */}
                  </tr>
                </thead>
                <tbody>
                  {(localData?.[dataType] ?? []).map((entry, i) => (
                    <tr key={i}>
                      <td className="md-input">{i + 1}</td>
                      <td className="md-input">
                        <input
                          name="particular"
                          value={entry.particular}
                          onChange={(event) =>
                            handleFormChange(event, i, null, dataType)
                          }
                          // className="form-control text-center noBorder] bg-white p-0"
                          className="google-sheet-input "
                          style={{ width: "20rem" }}
                          type="text"
                          disabled={!entry.isCustom}
                        />
                      </td>
                      {Array.from({ length: projectionYears }).map(
                        (_, index) => (
                          <td key={index} className="md-input">
                            <input
                              name="value"
                              value={entry.years?.[index] ?? ""}
                              onChange={(event) =>
                                handleFormChange(event, i, index, dataType)
                              }
                              className="form-control text-end noBorder"
                              type="number"
                            />
                          </td>
                        )
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>

              <button
                className="btn btn-sm btn-success px-4"
                onClick={(event) => {
                  event.preventDefault(); // Prevents form submission
                  addFields(dataType);
                }}
              >
                Add {dataType === "currentLiabilities" ? "Liability" : "Asset"}{" "}
                +
              </button>
            </div>
          ))}
        </div>
      </form>
    </div>
  );
};

export default SeventhStepMD;
