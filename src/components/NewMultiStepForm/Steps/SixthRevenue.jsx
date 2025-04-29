import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

const SixthRevenue = ({ onFormDataChange, years, revenueData, formData }) => {
  const [excelFile, setExcelFile] = useState(null);

  const projectionYears = formData?.ProjectReportSetting?.ProjectionYears || 5;

  // const [totalRevenue, setTotalRevenue] = useState(
  //   Array.from({ length: Math.max(1, projectionYears) }, () => 0)
  // );

  const [totalRevenue, setTotalRevenue] = useState(
    Array.from({ length: projectionYears || 1 }, () => 0) // ✅ Ensures correct length
  );

  const getPaddedMonths = (months, length) => {
    return [...months, ...Array(Math.max(0, length - months.length)).fill(12)];
  };

  const [noOfMonths, setNoOfMonths] = useState(() => {
    const stored = localStorage.getItem("noOfMonths");
    // return stored ? JSON.parse(stored) : Array(projectionYears).fill(12);
    const parsed = stored ? JSON.parse(stored) : [];
    return getPaddedMonths(parsed, projectionYears);
  });

  useEffect(() => {
    if (noOfMonths.length < projectionYears) {
      const padded = [
        ...noOfMonths,
        ...Array(projectionYears - noOfMonths.length).fill(12),
      ];
      setNoOfMonths(padded);
      localStorage.setItem("noOfMonths", JSON.stringify(padded));
      setLocalData((prev) => ({
        ...prev,
        noOfMonths: padded,
      }));
    }
  }, [noOfMonths, projectionYears]);

  const [totalMonthlyRevenue, setTotalMonthlyRevenue] = useState(
    Array.from({ length: Math.max(1, projectionYears) }, () => 0)
  );

  useEffect(() => {
    const updatedTotalRevenue = Array.from(
      { length: projectionYears },
      (_, i) => {
        return (noOfMonths[i] || 12) * (totalMonthlyRevenue[i] || 0);
      }
    );

    setTotalRevenue(updatedTotalRevenue); // ✅ Ensure it always matches projectionYears
    setLocalData((prevData) => ({
      ...prevData,
      totalRevenue: updatedTotalRevenue, // ✅ Update in localData too
    }));
  }, [projectionYears, noOfMonths, totalMonthlyRevenue]); // ✅ Add projectionYears as dependency

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

  const [localData, setLocalData] = useState(() => {
    const safeProjectionYears = Number(projectionYears) || 1;

    if (revenueData && Object.keys(revenueData).length > 0) {
      return {
        ...revenueData,
        formType: revenueData?.formType || "Others",
        noOfMonths:
          revenueData?.noOfMonths || Array(safeProjectionYears).fill(12), // Ensure default months
        totalRevenue:
          revenueData?.totalRevenue || Array(safeProjectionYears).fill(0), // Ensure default revenue
      };
    }

    return {
      formFields: [
        {
          particular: "p1",
          years: Array.from({ length: safeProjectionYears }, () => 0),
          amount: 0,
          rowType: "0",
          increaseBy: "",
        },
      ],
      totalRevenueForOthers: Array.from(
        { length: safeProjectionYears },
        () => 0
      ),
      formFields2: [
        {
          particular: "p1",
          years: Array.from({ length: safeProjectionYears }, () => 0),
          amount: 0,
          increaseBy: "",
        },
      ],
      totalMonthlyRevenue: Array(safeProjectionYears).fill(0),
      noOfMonths: Array(safeProjectionYears).fill(12), // ✅ Default to 12 months
      totalRevenue: Array(safeProjectionYears).fill(0), // ✅ Initialize correctly
      formType: "Others",
      togglerType: false,
    };
  });

  // on change
  const changeMonth = (index, newValue) => {
    const updated = [...noOfMonths];

    if (updated.length < projectionYears) {
      updated = [
        ...updated,
        ...Array(projectionYears - updated.length).fill(12),
      ];
    }
    updated[index] = Number(newValue);
    setNoOfMonths(updated);
    localStorage.setItem("noOfMonths", JSON.stringify(updated));

    // ✅ Update localData.noOfMonths as well
    setLocalData((prev) => ({
      ...prev,
      noOfMonths: updated,
    }));
  };

  useEffect(() => {
    if (localData?.noOfMonths?.length > 0) {
      setNoOfMonths(localData.noOfMonths);
    }
  }, [localData]);

  // useEffect(() => {
  //   const storedMonths = localStorage.getItem("noOfMonths");
  //   if (storedMonths) {
  //     const parsed = JSON.parse(storedMonths);
  //     setNoOfMonths(parsed);
  //     setLocalData((prev) => ({
  //       ...prev,
  //       noOfMonths: parsed,
  //     }));
  //   }
  // }, []);

  // console.log("Submitting this data to backend:", localData);

  // ✅ Auto-update `totalRevenue` when `noOfMonths` or `totalMonthlyRevenue` changes
  useEffect(() => {
    const storedMonths = localStorage.getItem("noOfMonths");
    if (storedMonths) {
      let parsed = JSON.parse(storedMonths);
      const padded = getPaddedMonths(parsed, projectionYears);
      setNoOfMonths(padded);
      setLocalData((prev) => ({
        ...prev,
        noOfMonths: padded,
      }));
    }
  }, [projectionYears]);

  useEffect(() => {
    setLocalData((prevData) => ({
      ...prevData,
      totalRevenue: prevData.noOfMonths.map(
        (months, i) => months * (prevData.totalMonthlyRevenue[i] || 0)
      ),
    }));
  }, [localData.noOfMonths, localData.totalMonthlyRevenue]); // Watch dependencies

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

  // ✅ Toggle function to correctly update both `formType` and `togglerType`
  const toggleType = (isChecked) => {
    setFormType(isChecked);
    setTogglerType(isChecked); // ✅ Ensure togglerType is updated
  };

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
      updatedFormFields[index][field] = value;
    } else if (field !== null && name === "value") {
      // Year cell update
      updatedFormFields[index].years[field] = value;

      // ✅ If this is the first year, and increaseBy exists → recalculate onward years
      if (field === 0) {
        const baseValue = parseFloat(value || "0"); // safer

        const increasePercent = parseFloat(updatedFormFields[index].increaseBy);
        const projectionYears =
          parseInt(formData?.ProjectReportSetting?.ProjectionYears) || 1;

        if (!isNaN(baseValue) && !isNaN(increasePercent)) {
          updatedFormFields[index].years = [baseValue];
          for (let y = 1; y < projectionYears; y++) {
            const prev = parseFloat(updatedFormFields[index].years[y - 1]);
            const next = parseFloat(
              (prev * (1 + increasePercent / 100)).toFixed(2)
            );
            updatedFormFields[index].years[y] = next;
          }
        }
      }
    } else if (name === "increaseBy") {
      // ✅ Store increaseBy
      updatedFormFields[index][name] = value;

      // ✅ If year 1 exists, use it to recalculate
      const baseValue = parseFloat(updatedFormFields[index].years[0]);
      const increasePercent = parseFloat(value);
      const projectionYears =
        parseInt(formData?.ProjectReportSetting?.ProjectionYears) || 1;

      if (!isNaN(baseValue) && !isNaN(increasePercent)) {
        updatedFormFields[index].years = [baseValue];
        for (let y = 1; y < projectionYears; y++) {
          const prev = parseFloat(updatedFormFields[index].years[y - 1]);
          const next = parseFloat(
            (prev * (1 + increasePercent / 100)).toFixed(2)
          );
          updatedFormFields[index].years[y] = next;
        }
      }
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

  const handleFormChange2 = (event, childIndex, yearIndex = null) => {
    const { name, value } = event.target;
    let data = [...localData.formFields2];

    if (name === "particular") {
      data[childIndex]["particular"] = value;
    } else if (name === "amount") {
      data[childIndex]["amount"] = Number(value);
    } else if (name === "increaseBy") {
      data[childIndex]["increaseBy"] = value;

      const baseValue = parseFloat(data[childIndex]?.years?.[0]);
      const percent = parseFloat(value);
      const projectionYears =
        parseInt(formData?.ProjectReportSetting?.ProjectionYears) || 1;

      if (!isNaN(baseValue) && !isNaN(percent)) {
        data[childIndex].years = [baseValue];
        for (let j = 1; j < projectionYears; j++) {
          const prev = data[childIndex].years[j - 1];
          const next = parseFloat((prev * (1 + percent / 100)).toFixed(2));
          data[childIndex].years[j] = next;
        }
      }
    } else if (name === "value") {
      data[childIndex]["years"][yearIndex] = value; // ✅ Keep raw input string

      // ✅ Trigger auto-calc if it's the first year and increaseBy is already filled
      if (yearIndex === 0) {
        const baseValue = parseFloat(value);
        const percent = parseFloat(data[childIndex].increaseBy);
        const projectionYears =
          parseInt(formData?.ProjectReportSetting?.ProjectionYears) || 1;

        if (!isNaN(baseValue) && !isNaN(percent)) {
          data[childIndex].years = [baseValue];
          for (let j = 1; j < projectionYears; j++) {
            const prev = data[childIndex].years[j - 1];
            const next = parseFloat((prev * (1 + percent / 100)).toFixed(2));
            data[childIndex].years[j] = next;
          }
        }
      }
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
          (sum, field) => sum + parseFloat(field.years[yearIndex] || "0") || 0,
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

  const handleImportExcel = (file) => {
    const reader = new FileReader();

    reader.onload = (evt) => {
      const data = evt.target.result;
      const workbook = XLSX.read(data, { type: "binary" });

      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // 2D array

      const [header, ...rows] = json;

      const projectionYears = parseInt(
        formData?.ProjectReportSetting?.ProjectionYears || 5
      );

      const getYearValues = (row, startIndex) => {
        const values = row
          .slice(startIndex, startIndex + projectionYears)
          .map((val) => {
            const trimmed = String(val).trim();
            return trimmed === "" ? "" : Number(val);
          });

        while (values.length < projectionYears) {
          values.push(""); // fill missing years with blank instead of 0
        }

        return values;
      };

      if (formType) {
        // ✅ OTHERS MODE

        // Extract total revenue row (assuming it's the last row or includes "total")
        const totalRevenueRow = rows.find(
          (row) =>
            String(row[0] || "")
              .toLowerCase()
              .includes("total revenue from operations") ||
            String(row[1] || "")
              .toLowerCase()
              .includes("total revenue from operations")
        );

        const importedTotalRevenue = totalRevenueRow
          ? getYearValues(totalRevenueRow, 2)
          : Array(projectionYears).fill(0);
        const formFields = rows

          .filter(
            (row) =>
              !String(row[0] || "")
                .toLowerCase()
                .includes("total revenue from operations") &&
              !String(row[1] || "")
                .toLowerCase()
                .includes("total revenue from operations")
          )
          .map((row) => ({
            serialNumber: row[0] ?? "",
            particular: row[1] ?? "",
            years: getYearValues(row, 2),
            rowType: "0",
            increaseBy: "",
          }));

        setLocalData((prev) => ({
          ...prev,
          formFields,
          totalRevenueForOthers: importedTotalRevenue,
        }));
      } else {
        // ✅ MONTHLY MODE

        const monthlyRows = rows.filter(
          (row) =>
            !String(row[0] || "")
              .toLowerCase()
              .includes("total")
        );

        const formFields2 = monthlyRows.map((row) => ({
          particular: row[1] ?? "",
          years: getYearValues(row, 2),
          amount: 0,
          increaseBy: "",
        }));

        setLocalData((prev) => ({
          ...prev,
          formFields2,
        }));
      }
    };

    reader.readAsBinaryString(file);
  };

  // const projectionYears = parseInt(
  //   formData?.ProjectReportSetting?.ProjectionYears || 5
  // );
  const startYear = parseInt(
    formData?.ProjectReportSetting?.FinancialYear || 2025
  );

  const getFinancialYearHeaders = (startYear, projectionYears) => {
    const headers = [];
    let year = parseInt(startYear); // Make sure it's a number
    for (let i = 0; i < projectionYears; i++) {
      headers.push(`${year}-${(year + 1).toString().slice(-2)}`);
      year++;
    }
    return headers;
  };

  const handleDownloadTemplate = () => {
    const businessName =
      formData?.AccountInformation?.businessName || "Template";

    const projectionYears = parseInt(
      formData?.ProjectReportSetting?.ProjectionYears || 5
    );

    const headers = ["S.No", "Particular"];
    for (let i = 1; i <= projectionYears; i++) {
      headers.push(`Year ${i}`);
    }

    const data = [headers];

    // Use either Others or Monthly format
    if (formType && localData?.formFields?.length > 0) {
      // Others Template
      localData.formFields.forEach((item) => {
        const row = [
          item.serialNumber ?? "",
          item.particular ?? "",
          ...(item.years ?? []).slice(0, projectionYears),
        ];
        while (row.length < 2 + projectionYears) row.push("");
        data.push(row);
      });

      // Add Total Row
      const totalRow = [
        "",
        "Total Revenue From Operations",
        ...(localData.totalRevenueForOthers ?? []).slice(0, projectionYears),
      ];
      while (totalRow.length < 2 + projectionYears) totalRow.push("");
      data.push(totalRow);
    } else if (!formType && localData?.formFields2?.length > 0) {
      // Monthly Template
      localData.formFields2.forEach((item) => {
        const row = [
          "", // no serial number
          item.particular ?? "",
          ...(item.years ?? []).slice(0, projectionYears),
        ];
        while (row.length < 2 + projectionYears) row.push("");
        data.push(row);
      });
    } else {
      // Add one blank row if no data available
      data.push(["1", "Sample Entry", ...Array(projectionYears).fill("")]);
    }

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");

    const fileName = `${businessName.replace(
      /[/\\?%*:|"<>]/g,
      "-"
    )}_Template.xlsx`;

    XLSX.writeFile(wb, fileName);
  };

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

  // Remove commas for raw value
  const removeCommas = (str) => {
    if (typeof str !== "string") str = String(str);
    return str.replace(/,/g, "");
  };

  return (
    <>
      <div className="form-scroll p-0">
        {/* ✅ Toggle Section */}

        <div className="flex items-center gap-4 ">
          {/* Download Template Button */}
          <button
            type="button"
            className="px-4 py-2 rounded text-white bg-blue-600 hover:bg-blue-700 text-sm transition duration-150"
            onClick={() => handleDownloadTemplate()}
          >
            📥 Download Template
          </button>
          {/* Upload Label */}
          <label
            htmlFor="excel-upload"
            className="cursor-pointer border border-gray-300 rounded px-4 py-2 bg-white shadow-sm hover:bg-gray-100 transition duration-150 text-sm"
          >
            📁 Choose Excel File
          </label>

          {/* Hidden File Input */}
          <input
            id="excel-upload"
            type="file"
            accept=".xlsx, .xls"
            onChange={(e) => setExcelFile(e.target.files?.[0])}
            className="hidden"
          />

          {/* Import Button */}
          <button
            type="button"
            className={`px-4 py-2 rounded text-white text-sm transition duration-150 ${
              excelFile
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
            onClick={() => {
              if (excelFile) {
                handleImportExcel(excelFile);
              } else {
                alert("Please select a file first.");
              }
            }}
            disabled={!excelFile}
          >
            ✅ Import Excel Data
          </button>

          {/* File Name Preview */}
          {excelFile && (
            <span className="text-sm text-gray-600 italic">
              Selected: {excelFile.name}
            </span>
          )}
        </div>

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
            <div
              className="position-relative w-100"
              style={{ position: "relative" }}
            >
              <div style={{}}>
                <table className="table table-revenue">
                  <thead>
                    <tr>
                      <th className="header-label">Index</th>
                      <th className="header-label">Particulars</th>

                      {/* Dynamically Generate Table Headers */}
                      {/* {Array.from({
                        length:
                          parseInt(
                            formData?.ProjectReportSetting?.ProjectionYears
                          ) || 5,
                      }).map((_, b) => (
                        <th key={b} className="header-label">
                          Year {b + 1}
                        </th>
                      ))} */}
                      {getFinancialYearHeaders(
                        parseInt(
                          formData?.ProjectReportSetting?.StartYear || 2025
                        ),
                        parseInt(
                          formData?.ProjectReportSetting?.ProjectionYears || 5
                        )
                      ).map((fy, idx) => (
                        <th key={idx} className="header-label">
                          {fy}
                        </th>
                      ))}

                      <th className="header-label">Type</th>
                      <th className="header-label">Increase By (%)</th>
                      <th className="header-label"></th>
                    </tr>
                  </thead>

                  <tbody>
                    {localData.formFields.map((entry, i) => {
                      // Adjust the number of years dynamically
                      const validProjectionYears = Math.max(
                        1,
                        formData?.ProjectReportSetting?.ProjectionYears || 5
                      );
                      const adjustedYears = [
                        ...entry.years.slice(0, validProjectionYears),
                        ...Array(
                          Math.max(
                            0,
                            validProjectionYears - (entry.years?.length || 5)
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
                            : entry.rowType === "4"
                            ? "underlineRow"
                            : entry.rowType === "5"
                            ? "totalRow"
                            : entry.rowType === "6"
                            ? "showRow"
                            : ""
                        }`}
                      >
                      
                          {/* ✅ Editable Serial Number (Now Alphanumeric) */}
                          <td>
                            <input
                              name="serialNumber"
                              type="text" // ✅ Changed to text to allow alphanumeric values
                              // className="form-control text-center noBorder"

                              className="table-input"
                              value={
                                entry.serialNumber !== undefined
                                  ? entry.serialNumber
                                  : ""
                              } // ✅ Blank by default
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
                              // className="form-control text-center noBorder" priya
                              className="table-input"
                              type="text"
                            />
                          </td>

                          {/* Dynamically Generate <td> Based on Projection Years */}
                          {adjustedYears.map((yr, y) => (
                            <td key={y}>
                              <input
                                name="value"
                                placeholder=""
                                className="table-input"
                                type="text"
                                value={formatNumberWithCommas(yr || 0)}
                                onChange={(event) => {
                                  const rawValue = removeCommas(
                                    event.target.value
                                  );
                                  handleFormChange(
                                    {
                                      target: {
                                        name: "value",
                                        value: rawValue,
                                      },
                                    },
                                    i,
                                    y
                                  );
                                }}
                              />
                            </td>
                          ))}

                          {/* Row Type Dropdown */}
                          <td>
                            <select
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
                              <option value="3">B / U</option>
                              <option value="4">Underline</option>
                              <option value="5">Total Format</option>
                              <option value="6">Show</option>
                            </select>
                          </td>
                          {/* Increase By (%) Input */}
                          <td>
                            <input
                              name="increaseBy"
                              placeholder="e.g. 5"
                              type="number"
                              className="table-input"
                              value={entry.increaseBy || ""}
                              onChange={(event) =>
                                handleFormChange(event, i, "increaseBy")
                              }
                            />
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

                  <tfoot>
                    <tr
                      style={{
                        position: "sticky",
                        bottom: 0,
                        backgroundColor: "#f0ebff", // ✅ Light purple background
                        zIndex: 9,
                        borderTop: "2px solid #7e22ce", // ✅ Strong top border
                      }}
                    >
                      <td
                        style={{
                          border: "1px solid #7e22ce",
                          backgroundColor: "#f3e8ff", // ✅ Lighter purple to match header
                          fontWeight: "600", // ✅ Slightly bolder
                        }}
                      ></td>

                      <td
                        style={{
                          border: "1px solid #7e22ce",
                          backgroundColor: "#f3e8ff", // ✅ Lighter purple to match header
                          fontWeight: "600", // ✅ Slightly bolder
                        }}
                      >
                        <strong>Total Revenue From Operations</strong>
                      </td>

                      {Array.from({
                        length:
                          parseInt(
                            formData?.ProjectReportSetting?.ProjectionYears
                          ) || 5,
                      }).map((_, i, arr) => (
                        <td
                          key={i}
                          style={{
                            padding: 0,
                            border: "1px solid #7e22ce",
                            backgroundColor: "#f3e8ff",
                            fontWeight: "600",
                          }}
                        >
                          <strong>
                            <input
                              name={`value-${i}`}
                              type="text"
                              placeholder="Enter value"
                              className="table-input"
                              style={{
                                width: "100%",
                                border: "none",
                                backgroundColor: "#f3e8ff",
                                borderLeft: "1px solid #7e22ce",
                                ...(i === arr.length - 1 && {
                                  borderRight: "1px solid #7e22ce", // ✅ Only on the last one
                                }),
                              }}
                              value={formatNumberWithCommas(
                                localData.totalRevenueForOthers?.[i] ?? ""
                              )}
                              onChange={(e) => {
                                const rawValue = removeCommas(e.target.value);
                                handleTotalRevenueForOthersChange(rawValue, i);
                              }}
                            />
                          </strong>
                        </td>
                      ))}

                      <td
                        style={{
                          border: "1px solid #7e22ce",
                          backgroundColor: "#f3e8ff", // ✅ Lighter purple to match header
                          fontWeight: "600", // ✅ Slightly bolder
                        }}
                      ></td>
                      <td
                        style={{
                          border: "1px solid #7e22ce",
                          backgroundColor: "#f3e8ff", // ✅ Lighter purple to match header
                          fontWeight: "600", // ✅ Slightly bolder
                        }}
                      ></td>
                      <td
                        style={{
                          border: "1px solid #7e22ce",
                          backgroundColor: "#f3e8ff", // ✅ Lighter purple to match header
                          fontWeight: "600", // ✅ Slightly bolder
                        }}
                      ></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* <div
                className="total-fixed-row dark:bg-gray-800 table table-revenue"
                style={{
                  position: "sticky",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  borderTop: "1px solid #ddd",
                  boxShadow: "0 -2px 6px rgba(0,0,0,0.1)",
                  zIndex: 10,
                }}
              >
                <div className=" total-div">
                  <div className="d-flex">
                    <label htmlFor="" className="header-label">
                      Total Revenue From Operations
                    </label>

                    <table className="table">
                      <tbody>
                        <tr>
                          {Array.from({
                            length:
                              formData.ProjectReportSetting.ProjectionYears ||
                              0, // Generate fields based on projection years
                          }).map((_, i) => (
                            <td key={i}>
                              <input
                                name={`value-${i}`} // Unique name for each input
                                placeholder="Enter value"
                                value={formatNumberWithCommas(
                                  localData.totalRevenueForOthers?.[i] ?? ""
                                )} // Show formatted value
                                onChange={(e) => {
                                  const rawValue = removeCommas(e.target.value); // Get raw number
                                  handleTotalRevenueForOthersChange(
                                    rawValue,
                                    i
                                  ); // Save clean value
                                }}
                                className="table-input"
                                type="text" // Use text instead of number to allow commas
                              />
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div> */}
            </div>
          </form>
        ) : (
          <form onSubmit={submit}>
            <div
              className="position-relative w-100"
              style={{ position: "relative" }}
            >
              <div style={{}}>
                <table className="table table-revenue">
                  <thead>
                    <tr>
                      <th className="header-label">Index</th>
                      <th className="header-label">Particulars</th>

                      {/* Dynamically Generate Table Headers */}
                      {/* {Array.from({
                        length:
                          parseInt(
                            formData?.ProjectReportSetting?.ProjectionYears
                          ) || 5,
                      }).map((_, b) => (
                        <th key={b} className="header-label">
                          Year {b + 1}
                        </th>
                      ))} */}
                      {getFinancialYearHeaders(
                        parseInt(
                          formData?.ProjectReportSetting?.StartYear || 2025
                        ),
                        parseInt(
                          formData?.ProjectReportSetting?.ProjectionYears || 5
                        )
                      ).map((fy, idx) => (
                        <th key={idx} className="header-label">
                          {fy}
                        </th>
                      ))}

                      <th className="header-label">Increase By (%)</th>
                      <th className="header-label"></th>
                    </tr>
                  </thead>

                  <tbody>
                    {localData.formFields2.map((entry, i) => {
                      // Adjust the number of years dynamically
                      const validProjectionYears = Math.max(
                        1,
                        formData?.ProjectReportSetting?.ProjectionYears || 5
                      );
                      const adjustedYears = [
                        ...entry?.years?.slice(0, validProjectionYears),
                        ...Array(
                          Math.max(
                            0,
                            validProjectionYears - (entry?.years?.length || 5)
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
                              // className="form-control text-center noBorder"

                              //  className="total-revenue-input"
                              className="table-input"
                              type="text"
                            />
                          </td>

                          {/* Dynamically Generate <td> Based on Projection Years */}
                          {adjustedYears.map((yr, y) => (
                            <td key={y}>
                              <input
                                name="value"
                                placeholder=""
                                className="table-input"
                                type="text" // ✅ change to text so we can show commas
                                value={formatNumberWithCommas(yr || "")}
                                onChange={(event) => {
                                  const rawValue = removeCommas(
                                    event.target.value
                                  );
                                  handleFormChange2(
                                    {
                                      target: {
                                        name: "value",
                                        value: rawValue,
                                      },
                                    },
                                    i,
                                    y
                                  );
                                }}
                              />
                            </td>
                          ))}
                          {/* Increase By (%) Input */}
                          <td>
                            <td>
                              <input
                                name="increaseBy"
                                type="number"
                                placeholder="e.g. 5"
                                className="table-input"
                                value={entry.increaseBy || ""}
                                onChange={(e) => handleFormChange2(e, i)}
                              />
                            </td>
                          </td>

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

                  <tfoot
                    style={{
                      position: "sticky",
                      bottom: 0,
                      zIndex: 99,
                      background: "#f3e8ff", // ✅ Solid color
                      borderTop: "2px solid #7e22ce",
                      boxShadow: "0 -2px 8px rgba(0, 0, 0, 0.15)", // ✅ Adds depth
                      backdropFilter: "none", // ✅ Ensures it's not transparent
                      WebkitBackdropFilter: "none",
                    }}
                  >
                    <tr>
                      <td
                        style={{
                          border: "1px solid #7e22ce",
                          backgroundColor: "#f3e8ff", // ✅ Lighter purple to match header
                          fontWeight: "600", // ✅ Slightly bolder
                        }}
                      ></td>

                      <td
                        style={{
                          border: "1px solid #7e22ce",
                          backgroundColor: "#f3e8ff", // ✅ Lighter purple to match header
                          fontWeight: "600", // ✅ Slightly bolder
                        }}
                      >
                        <strong> Total Monthly Revenue</strong>
                      </td>
                      {totalMonthlyRevenue.map((v, i, arr) => (
                        <td
                          key={i}
                          style={{
                            padding: 0,
                            border: "1px solid #7e22ce",
                            backgroundColor: "#f3e8ff",
                            fontWeight: "600",
                          }}
                        >
                          <strong>
                            <input
                              name={`value-${i}`}
                              type="text"
                              placeholder="Enter value"
                              className="table-input"
                              style={{
                                width: "100%",
                                border: "none",
                                backgroundColor: "#f3e8ff",
                                borderLeft: "1px solid #7e22ce",
                                ...(i === arr.length - 1 && {
                                  borderRight: "1px solid #7e22ce", // ✅ Only on the last one
                                }),
                              }}
                              value={Number(v || 0).toLocaleString("en-IN")} // ✅ Correct value binding
                              readOnly // Optional: prevent editing
                            />
                          </strong>
                        </td>
                      ))}
                    </tr>

                    <tr>
                      <td
                        style={{
                          border: "1px solid #7e22ce",
                          backgroundColor: "#f3e8ff", // ✅ Lighter purple to match header
                          fontWeight: "600", // ✅ Slightly bolder
                        }}
                      ></td>

                      <td
                        style={{
                          border: "1px solid #7e22ce",
                          backgroundColor: "#f3e8ff", // ✅ Lighter purple to match header
                          fontWeight: "600", // ✅ Slightly bolder
                        }}
                      >
                        <strong> No. of Months</strong>
                      </td>
                      {/* {noOfMonths.map((v, i, arr) => ( */}
                      {getFinancialYearHeaders(startYear, projectionYears).map(
                        (_, i, arr) => (
                          <td
                            key={i}
                            style={{
                              padding: 0,
                              border: "1px solid #7e22ce",
                              backgroundColor: "#f3e8ff",
                              fontWeight: "600",
                            }}
                          >
                            <strong>
                              <input
                                className="total-revenue-input"
                                style={{
                                  width: "100%",
                                  border: "none",
                                  backgroundColor: "#f3e8ff",
                                  borderLeft: "1px solid #7e22ce",
                                  ...(i === arr.length - 1 && {
                                    borderRight: "1px solid #7e22ce", // ✅ Only on the last one
                                  }),
                                }}
                                type="number"
                                // value={v || 0}
                                value={noOfMonths[i] || 0}
                                onChange={(e) => changeMonth(i, e.target.value)}
                              />
                            </strong>
                          </td>
                        )
                      )}
                    </tr>

                    <tr>
                      <td
                        style={{
                          border: "1px solid #7e22ce",
                          backgroundColor: "#f3e8ff", // ✅ Lighter purple to match header
                          fontWeight: "600", // ✅ Slightly bolder
                        }}
                      ></td>

                      <td
                        style={{
                          border: "1px solid #7e22ce",
                          backgroundColor: "#f3e8ff", // ✅ Lighter purple to match header
                          fontWeight: "600", // ✅ Slightly bolder
                        }}
                      >
                        <strong> Total Revenue</strong>
                      </td>
                      {/* {Array.from({ length: projectionYears }).map(
                        (_, i, arr) => { */}
                      {getFinancialYearHeaders(startYear, projectionYears).map(
                        (_, i, arr) => {
                          const total =
                            (parseFloat(totalMonthlyRevenue?.[i]) || 0) *
                            (parseFloat(noOfMonths?.[i]) || 0);

                          return (
                            <td
                              key={i}
                              style={{
                                padding: 0,
                                border: "1px solid #7e22ce",
                                backgroundColor: "#f3e8ff",
                                fontWeight: "600",
                              }}
                            >
                              <strong>
                                <input
                                  name={`total-${i}`}
                                  value={total.toLocaleString("en-IN")}
                                  readOnly
                                  className="total-revenue-input text-center"
                                  type="text"
                                  style={{
                                    width: "100%",
                                    border: "none",
                                    backgroundColor: "#f3e8ff",
                                    borderLeft: "1px solid #7e22ce",
                                    ...(i === arr.length - 1 && {
                                      borderRight: "1px solid #7e22ce", // ✅ Only on the last one
                                    }),
                                  }}
                                />
                              </strong>
                            </td>
                          );
                        }
                      )}
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </form>
        )}
      </div>
    </>
  );
};

export default SixthRevenue;
