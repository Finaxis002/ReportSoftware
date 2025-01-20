import React, { useState, useEffect } from "react";
import deleteImg from "../delete.png";
import checkImg from "../check.png";

const SeventhStepMD = ({ formData, onFormDataChange, years }) => {
  const [localData, setLocalData] = useState({
    currentLiabilities: [
      { particular: "Uses", years: Array.from({ length: years }).fill(0), isCustom: false },
      { particular: "Other Current Liabilities", years: Array.from({ length: years }).fill(0), isCustom: false },
      { particular: "Outstanding Expenses", years: Array.from({ length: years }).fill(0), isCustom: false },
      { particular: "Sundry Creditors / Trade Payables", years: Array.from({ length: years }).fill(0), isCustom: false },
      { particular: "Short term loans", years: Array.from({ length: years }).fill(0), isCustom: false },
      { particular: "Quasi Equity (Important to set Current Ratio)", years: Array.from({ length: years }).fill(0), isCustom: false },
    ],
    currentAssets: [
      { particular: "Sources", years: Array.from({ length: years }).fill(0), isCustom: false },
      { particular: "Other Current Assets", years: Array.from({ length: years }).fill(0), isCustom: false },
      { particular: "Prepaid Expenses", years: Array.from({ length: years }).fill(0), isCustom: false },
      { particular: "Investments", years: Array.from({ length: years }).fill(0), isCustom: false },
      { particular: "Trade Receivables / Sundry Debtors", years: Array.from({ length: years }).fill(0), isCustom: false },
      { particular: "Advances to employees & Suppliers", years: Array.from({ length: years }).fill(0), isCustom: false },
      { particular: "Inventory", years: Array.from({ length: years }).fill(0), isCustom: false },
    ],
  });

  // Handle adding new fields to liabilities
  const addFields = (type) => {
    const newData = { particular: "", years: Array.from({ length: years }).fill(0), isCustom: true };
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
      const dataArray = type === "liabilities" ? updatedData.currentLiabilities : updatedData.currentAssets;

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

  return (
    <div>
      <form onSubmit={submit}>
        <div className="position-relative w-100">
          <div className="form-scroll" style={{ paddingBottom: "12%" }}>
            {/* Current Liabilities Table */}
            <h5 className="text-start text-primary mt-4 mb-0">Current Liabilities</h5>
            <hr className="mt-0 mb-1" />
            <table className="table">
              <thead>
                <tr>
                  <th className="header-label">Index</th>
                  <th className="header-label">Particulars</th>
                  {Array.from({ length: years }).map((_, b) => (
                    <th key={b} className="header-label">
                      Year {b + 1}
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
                        onChange={(event) => handleFormChange(event, i, null, "liabilities")}
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
                          onChange={(event) => handleFormChange(event, i, y, "liabilities")}
                          value={yr}
                          className="form-control text-end noBorder"
                          type="number"
                        />
                      </td>
                    ))}
                    <td>
                      {entry.isCustom ? (
                        <button
                          className="btn h-100 mt-auto"
                          style={{ width: "50px", padding: "0", border: "none" }}
                          onClick={(e) => removeFields(e, i, "liabilities")}
                        >
                          <img src={deleteImg} alt="Remove" style={{ width: "30px", marginTop: "5%" }} />
                        </button>
                      ) : (
                        <span className="h-100 mt-auto mx-2" style={{ width: "43px", padding: "0", border: "none" }}>
                          <img src={checkImg} alt="add" style={{ width: "25px", marginTop: "10%" }} />
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="btn btn-sm btn-primary px-4 me-auto" type="button" onClick={() => addFields("liabilities")}>
              Add Liability +
            </button>

            {/* Current Assets Table */}
            <h5 className="text-start text-primary mt-4 mb-0">Current Assets</h5>
            <hr className="mt-0 mb-1" />
            <table className="table">
              <thead>
                <tr>
                  <th className="header-label">Index</th>
                  <th className="header-label">Particulars</th>
                  {Array.from({ length: years }).map((_, b) => (
                    <th key={b} className="header-label">
                      Year {b + 1}
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
                        onChange={(event) => handleFormChange(event, i, null, "assets")}
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
                          onChange={(event) => handleFormChange(event, i, y, "assets")}
                          value={yr}
                          className="form-control text-end noBorder"
                          type="number"
                        />
                      </td>
                    ))}
                    <td>
                      {entry.isCustom ? (
                        <button
                          className="btn h-100 mt-auto"
                          style={{ width: "50px", padding: "0", border: "none" }}
                          onClick={(e) => removeFields(e, i, "assets")}
                        >
                          <img src={deleteImg} alt="Remove" style={{ width: "30px", marginTop: "5%" }} />
                        </button>
                      ) : (
                        <span className="h-100 mt-auto mx-2" style={{ width: "43px", padding: "0", border: "none" }}>
                          <img src={checkImg} alt="add" style={{ width: "25px", marginTop: "10%" }} />
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="btn btn-sm btn-success px-4 me-auto" type="button" onClick={() => addFields("assets")}>
              Add Asset +
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SeventhStepMD;
