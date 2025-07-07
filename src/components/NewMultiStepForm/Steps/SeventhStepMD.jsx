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
              particular: "Quasi Equity",
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
          ],
          OpeningStock: getEmptyArray(),
          ClosingStock: getEmptyArray(),
          Withdrawals: getEmptyArray(),
        }
  );
  const [overriddenOpeningStock, setOverriddenOpeningStock] = useState({});

  // useEffect(() => {
  //   if (MoreDetailsData && Object.keys(MoreDetailsData).length > 0) {
  //     setLocalData(MoreDetailsData);
  //   }
  // }, [MoreDetailsData]);

  useEffect(() => {
    if (formData?.CostOfProject) {
      const selectedItems = Object.values(formData.CostOfProject)
        .filter((item) => item.isSelected)
        .map((item) => item.name);

      const selectedAssets = Object.values(formData.CostOfProject)
        .filter((item) => item.isSelected)
        .map((item) => ({
          particular: item.name,
          years: [
            Number(String(item.amount).replace(/,/g, "")) || 0,
            ...Array.from({ length: projectionYears - 1 }).fill(0),
          ],
          isCustom: false,
          dontSendToBS: false, // 🔥 new flag
        }));

      setLocalData((prevData) => {
        const currentAssets = prevData.currentAssets || [];

        // Keep only unselected static/default items or custom entries
        const filteredAssets = currentAssets.filter(
          (entry) =>
            !Object.values(formData.CostOfProject).some(
              (item) => item.name === entry.particular && !item.isSelected
            ) || entry.isCustom
        );

        // Prevent duplicates by checking existing names
        const existingNames = new Set(filteredAssets.map((a) => a.particular));
        const mergedAssets = [
          ...filteredAssets,
          ...selectedAssets.filter((a) => !existingNames.has(a.particular)),
        ];

        return {
          ...prevData,
          currentAssets: mergedAssets,
        };
      });
    } else if (MoreDetailsData && Object.keys(MoreDetailsData).length > 0) {
      setLocalData(MoreDetailsData);
    }
  }, [MoreDetailsData, formData?.CostOfProject, projectionYears]);

  const sanitizeMoreDetails = (moreDetails, projectionYears) => {
    if (!moreDetails) return {};

    const forceArray = (data) => {
      if (Array.isArray(data)) return data;
      if (typeof data === "object" && data !== null) {
        // Object case {0: ..., 1: ..., 2: ...} => convert to [v0, v1, v2]
        return Object.keys(data)
          .sort((a, b) => Number(a) - Number(b))
          .map((key) => Number(data[key]));
      }
      return Array.from({ length: projectionYears }).fill(0);
    };

    return {
      ...moreDetails,
      OpeningStock: forceArray(moreDetails.OpeningStock),
      ClosingStock: forceArray(moreDetails.ClosingStock),
      Withdrawals: forceArray(moreDetails.Withdrawals),
    };
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const sanitizedData = sanitizeMoreDetails(localData, projectionYears);
      onFormDataChange({ MoreDetails: sanitizedData });
    }, 500); // 500ms delay after user stops typing

    return () => clearTimeout(timeoutId);
  }, [localData, onFormDataChange, projectionYears]);

  // Handle Adding Custom Fields
  const addFields = (type) => {
    const newData = {
      particular: "",
      years: getEmptyArray(),
      isCustom: true,
      dontSendToBS: false,
    };
    setLocalData((prevData) => ({
      ...prevData,
      [type]: [...prevData[type], newData],
    }));
  };



 const handleFormChange = (event, index, year, type) => {
  const { name, value } = event.target;

  // Allow numbers, empty, or trailing dot/decimal
  // Accept "", ".", ".1", "123.", "123.13"
  const validValue = value.match(/^[-]?\d*\.?\d{0,2}$/);

  if (name === "particular") {
    setLocalData((prevData) => {
      const updatedData = { ...prevData };
      updatedData[type][index]["particular"] = value;
      return updatedData;
    });
  } else if (validValue || value === "") {
    setLocalData((prevData) => {
      const updatedData = { ...prevData };
      updatedData[type][index]["years"][year] = value; // keep as string
      return updatedData;
    });
  }
};


//  const handleStockChanges = (name, index, value) => {
//   // Accept numbers, empty, or trailing dot/decimal
//   const validValue = value.match(/^[-]?\d*\.?\d{0,2}$/);

//   if (validValue || value === "") {
//     setLocalData((prevData) => {
//       const updatedStock = [
//         ...(Array.isArray(prevData[name]) ? prevData[name] : getEmptyArray()),
//       ];
//       updatedStock[index] = value; // keep as string
//       // ...rest of your logic here (overrides, sync, etc)
//       return { ...prevData, [name]: updatedStock };
//     });
//   }
// };



  


  // Remove commas for raw value
  
  const handleStockChanges = (name, index, value) => {
  // Accept numbers, empty, or trailing dot/decimal
  const validValue = value.match(/^[-]?\d*\.?\d{0,2}$/);

  if (!(validValue || value === "")) return; // Only allow valid numbers

  setLocalData((prevData) => {
    const updatedStock = [
      ...(Array.isArray(prevData[name]) ? prevData[name] : getEmptyArray()),
    ];
    updatedStock[index] = value; // keep as string

    let newState = { ...prevData, [name]: updatedStock };

    // ClosingStock logic: auto-fill OpeningStock for next year, if not overridden
    if (name === "ClosingStock" && index < projectionYears - 1) {
      // If OpeningStock for next year has NOT been overridden
      if (!overriddenOpeningStock[index + 1]) {
        // Copy closing stock to opening stock of next year
        const opening = [
          ...(Array.isArray(prevData.OpeningStock)
            ? prevData.OpeningStock
            : getEmptyArray()),
        ];
        opening[index + 1] = value;
        newState.OpeningStock = opening;
      }
    }

    // If user is clearing OpeningStock cell, also clear its override flag
    if (name === "OpeningStock" && value === "") {
      setOverriddenOpeningStock((prev) => {
        const copy = { ...prev };
        delete copy[index];
        return copy;
      });
    }

    return newState;
  });

  // If user manually edits OpeningStock, flag as overridden
  if (name === "OpeningStock") {
    setOverriddenOpeningStock((prev) => ({
      ...prev,
      [index]: true,
    }));
  }
};

  
  
  const removeCommas = (str) => str?.toString().replace(/,/g, "");

  
  // Format number with commas (Indian format)
  const formatNumberWithCommas = (num) => {
    if (num === null || num === undefined || num === "") return "";

    const str = num.toString();

    // Allow incomplete decimals like "1000.", "1000.5"
    if (/^\d+\.\d{0,1}$/.test(str) || str.endsWith(".")) return str;

    const numericValue = parseFloat(str.replace(/,/g, ""));
    if (isNaN(numericValue)) return str;

    return numericValue.toLocaleString("en-IN", {
      minimumFractionDigits: str.includes(".") ? 2 : 0,
      maximumFractionDigits: 2,
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
                          value={formatNumberWithCommas(localData?.[stockType]?.[index] ?? "")}
                          onChange={(event) => {
                            const rawValue = removeCommas(event.target.value); // Remove commas
                            handleStockChanges(stockType, index, rawValue); // Pass raw number to state
                          }}
                          
                          onKeyDown={(e) => {
                            if (e.key === "," || e.key === "e")
                              e.preventDefault(); // Prevent invalid characters
                          }}
                          className="form-control text-end noBorder"
                          type="text" // ✅ Use text to allow commas in display
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
                    <th className="header-label">Exclude from BS</th>{" "}
                    {/* ✅ NEW COLUMN */}
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
                          value={formatNumberWithCommas(entry.particular)}
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
                      <td className="md-input text-center">
                        <div
                          className={`w-6 h-6 rounded-full border-2 mx-auto cursor-pointer ${
                            entry.dontSendToBS
                              ? "bg-green-700 border-green-700"
                              : "bg-white border-gray-400"
                          }`}
                          onClick={() =>
                            setLocalData((prev) => {
                              const updated = [...prev[dataType]];
                              updated[i] = {
                                ...updated[i],
                                dontSendToBS: !entry.dontSendToBS,
                              };
                              return {
                                ...prev,
                                [dataType]: updated,
                              };
                            })
                          }
                        >
                          {entry.dontSendToBS && (
                            <svg
                              viewBox="0 0 24 24"
                              className="w-4 h-4 text-white fill-current relative top-0.5 left-0.5"
                            >
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                            </svg>
                          )}
                        </div>
                      </td>
                      {Array.from({ length: projectionYears }).map(
                        (_, index) => (
                          <td key={index} className="md-input">
                            <input
                              name="value"
                              value={formatNumberWithCommas(entry.years?.[index] ?? "")}
                              onChange={(event) => {
                                const rawValue = removeCommas(
                                  event.target.value
                                ); // remove commas from input
                                const modifiedEvent = {
                                  ...event,
                                  target: {
                                    ...event.target,
                                    value: rawValue, // send raw value to handler
                                  },
                                };
                                handleFormChange(
                                  modifiedEvent,
                                  i,
                                  index,
                                  dataType
                                );
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "," || e.key === "e")
                                  e.preventDefault(); // prevent invalid input
                              }}
                              className="form-control text-end noBorder"
                              type="text" // ✅ Use text to allow comma display
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
