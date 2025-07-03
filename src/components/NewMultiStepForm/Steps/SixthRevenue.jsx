import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";

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

  // useEffect(() => {
  //   const updatedTotalRevenue = Array.from(
  //     { length: projectionYears },
  //     (_, i) => {
  //       return (noOfMonths[i] || 12) * (totalMonthlyRevenue[i] || 0);
  //     }
  //   );

  //   setTotalRevenue(updatedTotalRevenue); // ✅ Ensure it always matches projectionYears
  //   setLocalData((prevData) => ({
  //     ...prevData,
  //     totalRevenue: updatedTotalRevenue, // ✅ Update in localData too
  //   }));
  // }, [projectionYears, noOfMonths, totalMonthlyRevenue]); // ✅ Add projectionYears as dependency

  // ✅ Initialize togglerType (boolean) from revenueData, default to false

  useEffect(() => {
    setLocalData((prevData) => {
      const safeYears = projectionYears || 1;

      // Trim formFields years array
      const trimmedFormFields = (prevData.formFields || []).map((item) => ({
        ...item,
        years: item.years?.slice(0, safeYears) || Array(safeYears).fill(0),
      }));

      // Trim formFields2 years array
      const trimmedFormFields2 = (prevData.formFields2 || []).map((item) => ({
        ...item,
        years: item.years?.slice(0, safeYears) || Array(safeYears).fill(0),
      }));

      return {
        ...prevData,
        formFields: trimmedFormFields,
        formFields2: trimmedFormFields2,
        totalRevenue: prevData.totalRevenue?.slice(0, safeYears) || [],
        totalMonthlyRevenue:
          prevData.totalMonthlyRevenue?.slice(0, safeYears) || [],
        totalRevenueForOthers:
          prevData.totalRevenueForOthers?.slice(0, safeYears) || [],
        noOfMonths: prevData.noOfMonths?.slice(0, safeYears) || [],
      };
    });
  }, [projectionYears]);

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
    const safeYears = projectionYears || 1;

    // Safely prepare clean data before submission
    const trimmedData = {
      ...localData,
      formFields: (localData.formFields || []).map((item) => ({
        ...item,
        years: item.years?.slice(0, safeYears) || [],
      })),
      formFields2: (localData.formFields2 || []).map((item) => ({
        ...item,
        years: item.years?.slice(0, safeYears) || [],
      })),
      totalRevenue: localData.totalRevenue?.slice(0, safeYears) || [],
      totalMonthlyRevenue:
        localData.totalMonthlyRevenue?.slice(0, safeYears) || [],
      totalRevenueForOthers:
        localData.totalRevenueForOthers?.slice(0, safeYears) || [],
      noOfMonths: localData.noOfMonths?.slice(0, safeYears) || [],
    };

    onFormDataChange({ Revenue: trimmedData });
  }, [localData, projectionYears]);

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

  // const handleDownloadTemplate = () => {
  //   const businessName =
  //     formData?.AccountInformation?.businessName || "Template";

  //   const projectionYears = parseInt(
  //     formData?.ProjectReportSetting?.ProjectionYears || 5
  //   );

  //   const TOTAL_COLUMNS = 330; // MR

  //   const fixedColumns = 2; // S.No, Particular
  //   const yearColumns = parseInt(
  //     formData?.ProjectReportSetting?.ProjectionYears || 5
  //   );
  //   const blanksNeeded = TOTAL_COLUMNS - (fixedColumns + yearColumns + 1); // +1 for Row Type column itself

  //   // HEADER LOGIC
  //   const headers = ["S.No", "Particular"];
  //   for (let i = 1; i <= projectionYears; i++) {
  //     headers.push(`Year ${i}`);
  //   }
  //   if (formType) {
  //     for (let i = 0; i < blanksNeeded; i++) {
  //       headers.push(""); // Add blank columns to reach MR
  //     }
  //     headers.push("Row Type"); // Only Others
  //   }
  //   // NO else! (Monthly will just have S.No, Particular, Years)

  //   const data = [headers];

  //   if (formType && localData?.formFields?.length > 0) {
  //     localData.formFields.forEach((item) => {
  //       // Start with S.No, Particular, Years
  //       const row = [
  //         item.serialNumber ?? "",
  //         item.particular ?? "",
  //         ...(item.years ?? []).slice(0, projectionYears),
  //       ];
  //       // Pad so Row Type lands in LR (last required column)
  //       while (row.length < TOTAL_COLUMNS - 1) row.push("");
  //       // Row Type in last required column (LR)
  //       row.push(item.rowType ?? "0");
  //       data.push(row);
  //     });
  //     // Add Total Row if needed (set Row Type blank or appropriate)
  //     const totalRow = [
  //       "",
  //       "Total Revenue From Operations",
  //       ...(localData.totalRevenueForOthers ?? []).slice(0, projectionYears),
  //     ];
  //     while (totalRow.length < TOTAL_COLUMNS - 1) totalRow.push("");
  //     totalRow.push(""); // or push a value for rowType if you want
  //     data.push(totalRow);
  //   } else if (!formType && localData?.formFields2?.length > 0) {
  //     // MONTHLY Section
  //     localData.formFields2.forEach((item) => {
  //       const row = [
  //         "", // no S.No
  //         item.particular ?? "",
  //         ...(item.years ?? []).slice(0, projectionYears),
  //       ];
  //       // Only pad to fixed columns (NO rowType at all)
  //       while (row.length < 2 + projectionYears) row.push("");
  //       data.push(row);
  //     });
  //   } else {
  //     // Fallback sample row
  //     const row = ["1", "Sample Entry", ...Array(projectionYears).fill("")];
  //     // Only pad for correct columns, no rowType
  //     while (row.length < (formType ? TOTAL_COLUMNS : 2 + projectionYears))
  //       row.push("");
  //     data.push(row);
  //   }

  //   const ws = XLSX.utils.aoa_to_sheet(data);
  //   const wb = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(wb, ws, "Template");

  //   // Add formulas back to worksheet before saving file
  //   if (localData.formulaMap) {
  //     Object.entries(localData.formulaMap).forEach(([cell, formula]) => {
  //       if (!ws[cell]) ws[cell] = {};
  //       ws[cell].f = formula;
  //       // Optional: You can also set ws[cell].v if you want to write a cached value
  //     });
  //   }

  //   const fileName = `${businessName.replace(
  //     /[/\\?%*:|"<>]/g,
  //     "-"
  //   )}_Template.xlsx`;

  //   XLSX.writeFile(wb, fileName);
  // };


const handleDownloadTemplate = async () => {
  const businessName =
    formData?.AccountInformation?.businessName || "Template";

  const projectionYears = parseInt(
    formData?.ProjectReportSetting?.ProjectionYears || 5
  );

  const TOTAL_COLUMNS = 330;
  const fixedColumns = 2; // S.No, Particular
  const blanksNeeded =
    TOTAL_COLUMNS - (fixedColumns + projectionYears + 1); // +1 for Row Type

  // Build headers
  const headers = ["S.No", "Particular"];
  for (let i = 1; i <= projectionYears; i++) headers.push(`Year ${i}`);
  if (formType) {
    for (let i = 0; i < blanksNeeded; i++) headers.push("");
    headers.push("Row Type");
  }

  const data = [headers];

  if (formType && localData?.formFields?.length > 0) {
    localData.formFields.forEach((item) => {
      const row = [
        item.serialNumber ?? "",
        item.particular ?? "",
        ...(item.years ?? []).slice(0, projectionYears),
      ];
      while (row.length < TOTAL_COLUMNS - 1) row.push("");
      row.push(item.rowType ?? "0");
      data.push(row);
    });
    // Add Total Row
    const totalRow = [
      "",
      "Total Revenue From Operations",
      ...(localData.totalRevenueForOthers ?? []).slice(0, projectionYears),
    ];
    while (totalRow.length < TOTAL_COLUMNS - 1) totalRow.push("");
    totalRow.push("");
    data.push(totalRow);
  } else if (!formType && localData?.formFields2?.length > 0) {
    localData.formFields2.forEach((item) => {
      const row = [
        "",
        item.particular ?? "",
        ...(item.years ?? []).slice(0, projectionYears),
      ];
      while (row.length < 2 + projectionYears) row.push("");
      data.push(row);
    });
  } else {
    const row = ["1", "Sample Entry", ...Array(projectionYears).fill("")];
    while (row.length < (formType ? TOTAL_COLUMNS : 2 + projectionYears)) row.push("");
    data.push(row);
  }

  // ---- 1. Create sheet & workbook with SheetJS for data/formulas
  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Template");

  // ---- 2. Add formulas if present (SheetJS way)
  if (localData.formulaMap) {
    Object.entries(localData.formulaMap).forEach(([cell, formula]) => {
      if (!ws[cell]) ws[cell] = {};
      ws[cell].f = formula;
    });
  }

  // ---- 3. Write to buffer, then use ExcelJS for styling
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });

  // Now style with ExcelJS
  const workbookJS = new ExcelJS.Workbook();
  await workbookJS.xlsx.load(wbout);
  const worksheetJS = workbookJS.worksheets[0];

  if (formType && localData?.formFields?.length > 0) {
    // Loop data rows (skip header, which is row 1)
    localData.formFields.forEach((item, idx) => {
      // Row in ExcelJS is idx + 2 (header is row 1)
      const excelRow = worksheetJS.getRow(idx + 2);

      if (item.rowType === "2" || item.rowType === "3") {
        // Bold or Bold+Underline
        for (let col = 2; col <= 2 + projectionYears ; col++) {
          const cell = excelRow.getCell(col);
          cell.font = {
            ...cell.font,
            bold: true,
            underline: item.rowType === "3" ? true : undefined,
          };
        }
      } else if (item.rowType === "4") {
        // Underline only
        for (let col = 2; col <= 2 + projectionYears ; col++) {
          const cell = excelRow.getCell(col);
          cell.font = {
            ...cell.font,
            underline: true,
            bold: undefined,
          };
        }
      }
      // You can style S.No and Particular also if needed; right now, only data columns are styled
    });
  }

  // ---- 4. Download using ExcelJS
  const fileName = `${businessName.replace(
    /[/\\?%*:|"<>]/g,
    "-"
  )}_Template.xlsx`;

  const buffer = await workbookJS.xlsx.writeBuffer();

  // Download via blob
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  setTimeout(() => window.URL.revokeObjectURL(url), 100);
};


  //  const handleImportExcel = (file) => {
  //   const reader = new FileReader();
  //   const ROW_TYPE_COL_INDEX = 329;

  //   // 1. Create a formula map: { "C2": "=C7*C8", ... }
  //   const getFormulaMap = (sheet) => {
  //     const formulaMap = {};
  //     Object.keys(sheet).forEach((cell) => {
  //       if (!cell.match(/^[A-Z]+[0-9]+$/)) return; // only cell addresses
  //       if (sheet[cell].f) {
  //         formulaMap[cell] = sheet[cell].f;
  //       }
  //     });
  //     return formulaMap;
  //   };

  //   function getCellRowType(sheet, cellAddress) {
  //     // cellAddress: like "B2"
  //     const cell = sheet[cellAddress];
  //     if (!cell || !cell.s) return "0"; // Default

  //     const font = cell.s && cell.s.font ? cell.s.font : {};
  //     const bold = font.bold === true || font.bold === 1;
  //     const underline = font.underline === true || font.underline === 1;

  //     if (bold && underline) return "3"; // B/U
  //     if (bold) return "2"; // Bold
  //     if (underline) return "4"; // Underline
  //     return "0"; // Normal
  //   }

  //   reader.onload = (evt) => {
  //     const data = evt.target.result;
  //     // const workbook = XLSX.read(data, { type: "binary" });
  //     const workbook = XLSX.read(data, { type: "binary", cellStyles: true });

  //     const sheetName = workbook.SheetNames[0];
  //     const sheet = workbook.Sheets[sheetName];
  //     const json = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // 2D array

  //     const formulaMap = getFormulaMap(sheet);

  //     const [header, ...rows] = json;

  //     const projectionYears = parseInt(
  //       formData?.ProjectReportSetting?.ProjectionYears || 5
  //     );

  //     // const getYearValues = (row, startIndex) => {
  //     //   return row
  //     //     .slice(startIndex, startIndex + projectionYears)
  //     //     .map((val) => {
  //     //       if (val === undefined || val === null) return "";
  //     //       if (typeof val === "string") {
  //     //         const trimmed = val.trim();
  //     //         if (trimmed === "") return "";
  //     //         // If already has % sign, keep as is
  //     //         if (trimmed.endsWith("%")) return trimmed;
  //     //         // Otherwise, parse number or keep as text if not a number
  //     //         const numVal = Number(trimmed.replace(/,/g, ""));
  //     //         return isNaN(numVal) ? trimmed : numVal;
  //     //       }
  //     //       // If number, just return as is (no conversion to percent!)
  //     //       if (typeof val === "number") {
  //     //         return val;
  //     //       }
  //     //       // Fallback: just toString
  //     //       return String(val);
  //     //     });
  //     // };

  //     const getYearValues = (row, startIndex) => {
  //       // Check if the entire row appears to be percent (all values 0<x<=1)
  //       const valueCells = row.slice(startIndex, startIndex + projectionYears);
  //       const percentLike = valueCells.every(
  //         (v) => typeof v === "number" && v > 0 && v < 1
  //       );
  //       return valueCells.map((val) => {
  //         if (val === undefined || val === null) return "";
  //         // If value is a string and ends with %, return as is
  //         if (typeof val === "string") {
  //           const trimmed = val.trim();
  //           if (trimmed === "") return "";
  //           if (trimmed.endsWith("%")) return trimmed;
  //           // Try parse as number, if fails return as-is
  //           const numVal = Number(trimmed.replace(/,/g, ""));
  //           return isNaN(numVal) ? trimmed : numVal;
  //         }
  //         // If number and looks like percent, AND row appears to be percent row, show as %
  //         if (typeof val === "number" && percentLike) {
  //           return `${(val * 100).toFixed(2).replace(/\.00$/, "")}%`;
  //         }
  //         // Else, just show as number
  //         return val;
  //       });
  //     };

  //     if (formType) {
  //       // ✅ OTHERS MODE

  //       // Extract total revenue row (assuming it's the last row or includes "total")
  //       const totalRevenueRow = rows.find(
  //         (row) =>
  //           String(row[0] || "")
  //             .toLowerCase()
  //             .includes("total revenue from operations") ||
  //           String(row[1] || "")
  //             .toLowerCase()
  //             .includes("total revenue from operations")
  //       );

  //       const importedTotalRevenue = totalRevenueRow
  //         ? getYearValues(totalRevenueRow, 2)
  //         : Array(projectionYears).fill(0);
  //       // const formFields = rows

  //       //   .filter(
  //       //     (row) =>
  //       //       !String(row[0] || "")
  //       //         .toLowerCase()
  //       //         .includes("total revenue from operations") &&
  //       //       !String(row[1] || "")
  //       //         .toLowerCase()
  //       //         .includes("total revenue from operations")
  //       //   )
  //       //   .map((row) => ({
  //       //     serialNumber: row[0] ?? "",
  //       //     particular: row[1] ?? "",
  //       //     years: getYearValues(row, 2),
  //       //     // rowType: "0",
  //       //     rowType:
  //       //       row[ROW_TYPE_COL_INDEX] !== undefined &&
  //       //       row[ROW_TYPE_COL_INDEX] !== ""
  //       //         ? String(row[ROW_TYPE_COL_INDEX]).trim()
  //       //         : "0",
  //       //     increaseBy: "",
  //       //   }));

  //       const XLSX = require("xlsx"); // if not already at the top

  //       const formFields = rows

  //         .filter(
  //           (row) =>
  //             !String(row[0] || "")
  //               .toLowerCase()
  //               .includes("total revenue from operations") &&
  //             !String(row[1] || "")
  //               .toLowerCase()
  //               .includes("total revenue from operations")
  //         )
  //         .map((row, rowIdx) => {
  //           // Row index + 2 because header is row 1, then data rows
  //           const cellAddress = `B${rowIdx + 2}`; // "B" = Particular column
  //           const detectedRowType = getCellRowType(sheet, cellAddress);

  //           return {
  //             serialNumber: row[0] ?? "",
  //             particular: row[1] ?? "",
  //             years: getYearValues(row, 2),
  //             rowType:
  //               row[ROW_TYPE_COL_INDEX] !== undefined &&
  //               row[ROW_TYPE_COL_INDEX] !== ""
  //                 ? String(row[ROW_TYPE_COL_INDEX]).trim()
  //                 : detectedRowType, // <-- Use detectedRowType if none in file
  //             increaseBy: "",
  //           };
  //         });

  //       setLocalData((prev) => ({
  //         ...prev,
  //         formFields,
  //         totalRevenueForOthers: importedTotalRevenue,
  //         formulaMap,
  //       }));
  //     } else {
  //       // ✅ MONTHLY MODE

  //       const monthlyRows = rows.filter(
  //         (row) =>
  //           !String(row[0] || "")
  //             .toLowerCase()
  //             .includes("total")
  //       );

  //       const formFields2 = monthlyRows.map((row) => ({
  //         particular: row[1] ?? "",
  //         years: getYearValues(row, 2),
  //         amount: 0,
  //         increaseBy: "",
  //       }));

  //       setLocalData((prev) => ({
  //         ...prev,
  //         formFields2,
  //         formulaMap,
  //       }));
  //     }
  //   };

  //   reader.readAsBinaryString(file);
  // };

  const handleImportExcel = (file) => {
  const reader = new FileReader();

  reader.onload = async (evt) => {
    const buffer = evt.target.result;
    const projectionYears = parseInt(
      formData?.ProjectReportSetting?.ProjectionYears || 5
    );

    // SheetJS for formulas
    const data = new Uint8Array(buffer);
    const workbookXLSX = XLSX.read(data, { type: "array", cellStyles: true });
    const sheetName = workbookXLSX.SheetNames[0];
    const sheetXLSX = workbookXLSX.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(sheetXLSX, { header: 1 }); // array of arrays

    // ExcelJS for styles (only needed for Others)
    const workbookJS = new ExcelJS.Workbook();
    await workbookJS.xlsx.load(buffer);
    const worksheetJS = workbookJS.worksheets[0];

    // Helper to convert col index (1-based) to Excel letter
    const colToLetter = (colIdx) => {
      let s = "";
      while (colIdx > 0) {
        let m = (colIdx - 1) % 26;
        s = String.fromCharCode(65 + m) + s;
        colIdx = Math.floor((colIdx - m) / 26);
      }
      return s;
    };

    // Style detection for "Others"
    function getRowType(excelRow, cellIndex = 2) {
      const cell = excelRow.getCell(cellIndex);
      const font = cell.font || {};
      const bold = font.bold === true || font.bold === 1;
      const underline = font.underline === true || font.underline === 1;
      if (bold && underline) return "3";
      if (bold) return "2";
      if (underline) return "4";
      return "0";
    }

    // ---------------- Others Mode -----------------
    if (formType) {
      const formFields = [];
      const ROW_TYPE_COL_INDEX = 330;
      worksheetJS.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header

        const serialNumber = row.getCell(1).value || "";
        const particular = row.getCell(2).value || "";
        const years = [];
        const formulas = [];

        for (let col = 3; col < 3 + projectionYears; col++) {
          const colLetter = colToLetter(col);
          const cellAddress = `${colLetter}${rowNumber}`;
          let cellValue = row.getCell(col).value;
          let xlsxCell = sheetXLSX[cellAddress];
          let formula = xlsxCell && xlsxCell.f ? xlsxCell.f : null;
          if (cellValue && typeof cellValue === "object") {
            cellValue = cellValue.result !== undefined ? cellValue.result : "";
          }
          years.push(cellValue || "");
          formulas.push(formula);
        }

        // Prefer explicit Row Type, fallback to styling
        let explicitRowType = "";
        if (row.getCell(ROW_TYPE_COL_INDEX)) {
          explicitRowType = String(
            row.getCell(ROW_TYPE_COL_INDEX).value || ""
          ).trim();
        }
        const rowType = explicitRowType || getRowType(row, 2);

        if (!particular && years.every((y) => !y)) return;

        formFields.push({
          serialNumber,
          particular,
          years,
          formulas,
          rowType,
          increaseBy: "",
        });
      });

      // Handle total revenue
      let totalRevenueForOthers = [];
      const lastRow = worksheetJS.lastRow;
      if (
        lastRow &&
        (String(lastRow.getCell(1).value || "")
          .toLowerCase()
          .includes("total revenue from operations") ||
          String(lastRow.getCell(2).value || "")
            .toLowerCase()
            .includes("total revenue from operations"))
      ) {
        for (let col = 3; col < 3 + projectionYears; col++) {
          let cell = lastRow.getCell(col);
          let cellValue = cell.value;
          if (
            cellValue &&
            typeof cellValue === "object" &&
            cellValue.result !== undefined
          ) {
            cellValue = cellValue.result;
          }
          totalRevenueForOthers.push(cellValue || "");
        }
      }

      setLocalData((prev) => ({
        ...prev,
        formFields,
        totalRevenueForOthers,
        formulaMap: (() => {
          const map = {};
          formFields.forEach((row, rowIdx) => {
            row.formulas.forEach((f, yearIdx) => {
              if (f) {
                const col = 3 + yearIdx;
                const cellAddr = `${colToLetter(col)}${rowIdx + 2}`;
                map[cellAddr] = f;
              }
            });
          });
          return map;
        })(),
      }));
    }
    // ------------- Monthly Mode -------------------
    else {
      // Monthly: Only values and formulas, no style/rowType
      const [, ...rows] = json; // skip header row
      const formFields2 = rows
        .filter(
          (row) =>
            !String(row[0] || "").toLowerCase().includes("total") // skip total rows
        )
        .map((row, rowIdx) => {
          // row[1] = particular
          const particular = row[1] ?? "";
          // Get years and formulas for columns 2..(2+projectionYears)
          const years = [];
          const formulas = [];
          for (let i = 0; i < projectionYears; i++) {
            // SheetJS cell address
            const colLetter = colToLetter(i + 3); // Years start from column 3 (C)
            const cellAddress = `${colLetter}${rowIdx + 2}`; // +2: header skipped
            let value = row[2 + i] ?? "";
            let formula = sheetXLSX[cellAddress] && sheetXLSX[cellAddress].f ? sheetXLSX[cellAddress].f : null;
            years.push(value);
            formulas.push(formula);
          }
          return {
            particular,
            years,
            formulas,
            amount: 0,
            increaseBy: "",
          };
        });

      setLocalData((prev) => ({
        ...prev,
        formFields2,
        formulaMap: (() => {
          const map = {};
          formFields2.forEach((row, rowIdx) => {
            row.formulas.forEach((f, yearIdx) => {
              if (f) {
                const col = 3 + yearIdx;
                const cellAddr = `${colToLetter(col)}${rowIdx + 2}`;
                map[cellAddr] = f;
              }
            });
          });
          return map;
        })(),
      }));
    }
  };

  reader.readAsArrayBuffer(file);
};


  // const handleImportExcel = (file) => {
  //   const reader = new FileReader();

  //   reader.onload = async (evt) => {
  //     const buffer = evt.target.result;
  //     const projectionYears = parseInt(
  //       formData?.ProjectReportSetting?.ProjectionYears || 5
  //     );

  //     // 1. Parse with ExcelJS for STYLING
  //     const workbookJS = new ExcelJS.Workbook();
  //     await workbookJS.xlsx.load(buffer);
  //     const worksheetJS = workbookJS.worksheets[0];

  //     // 2. Parse with SheetJS for FORMULAS/DATA
  //     const data = new Uint8Array(buffer);
  //     const workbookXLSX = XLSX.read(data, { type: "array", cellStyles: true });
  //     const sheetName = workbookXLSX.SheetNames[0];
  //     const sheetXLSX = workbookXLSX.Sheets[sheetName];

  //     // Helper for cell address (A1, B2, etc.)
  //     const colToLetter = (colIdx) => {
  //       let s = "";
  //       while (colIdx > 0) {
  //         let m = (colIdx - 1) % 26;
  //         s = String.fromCharCode(65 + m) + s;
  //         colIdx = Math.floor((colIdx - m) / 26);
  //       }
  //       return s;
  //     };

  //     function getRowType(excelRow, cellIndex = 2) {
  //       // cellIndex = 2 => "Particular" column (ExcelJS is 1-based)
  //       const cell = excelRow.getCell(cellIndex);
  //       const font = cell.font || {};
  //       const bold = font.bold === true || font.bold === 1;
  //       const underline = font.underline === true || font.underline === 1;
  //       if (bold && underline) return "3";
  //       if (bold) return "2";
  //       if (underline) return "4";
  //       return "0";
  //     }

  //     // 3. Parse rows
  //     const formFields = [];
  //     const ROW_TYPE_COL_INDEX = 330;
  //     worksheetJS.eachRow({ includeEmpty: false }, (row, rowNumber) => {
  //       if (rowNumber === 1) return; // Skip header

  //       const serialNumber = row.getCell(1).value || "";
  //       const particular = row.getCell(2).value || "";

  //       const years = [];
  //       const formulas = [];
  //       // Columns: 3...3+projectionYears (ExcelJS is 1-based)
  //       for (let col = 3; col < 3 + projectionYears; col++) {
  //         const colLetter = colToLetter(col); // 3 = "C"
  //         const cellAddress = `${colLetter}${rowNumber}`;
  //         // Get value from ExcelJS
  //         let cellValue = row.getCell(col).value;
  //         // Get formula from SheetJS
  //         let xlsxCell = sheetXLSX[cellAddress];
  //         let formula = xlsxCell && xlsxCell.f ? xlsxCell.f : null;

  //         // If ExcelJS value is an object, use computed value (result)
  //         if (cellValue && typeof cellValue === "object") {
  //           cellValue = cellValue.result !== undefined ? cellValue.result : "";
  //         }
  //         years.push(cellValue || "");
  //         formulas.push(formula);
  //       }
  //       // 👇 Prefer explicit Row Type from file, fallback to style detection
  //       let explicitRowType = "";
  //       if (row.getCell(ROW_TYPE_COL_INDEX)) {
  //         explicitRowType = String(
  //           row.getCell(ROW_TYPE_COL_INDEX).value || ""
  //         ).trim();
  //       }
  //       // Detect style using ExcelJS
  //       const rowType = explicitRowType || getRowType(row, 2);

  //       // Skip empty rows
  //       if (!particular && years.every((y) => !y)) return;

  //       formFields.push({
  //         serialNumber,
  //         particular,
  //         years, // array of values for each year
  //         formulas, // array of formula strings for each year (null if not a formula)
  //         rowType,
  //         increaseBy: "",
  //       });
  //     });

  //     // 4. Handle totalRevenueForOthers row (optional)
  //     let totalRevenueForOthers = [];
  //     const lastRow = worksheetJS.lastRow;
  //     if (
  //       lastRow &&
  //       (String(lastRow.getCell(1).value || "")
  //         .toLowerCase()
  //         .includes("total revenue from operations") ||
  //         String(lastRow.getCell(2).value || "")
  //           .toLowerCase()
  //           .includes("total revenue from operations"))
  //     ) {
  //       for (let col = 3; col < 3 + projectionYears; col++) {
  //         let cell = lastRow.getCell(col);
  //         let cellValue = cell.value;
  //         if (
  //           cellValue &&
  //           typeof cellValue === "object" &&
  //           cellValue.result !== undefined
  //         ) {
  //           cellValue = cellValue.result;
  //         }
  //         totalRevenueForOthers.push(cellValue || "");
  //       }
  //     }

  //     setLocalData((prev) => ({
  //       ...prev,
  //       formFields,
  //       totalRevenueForOthers,
  //       // If you want to use the formulas for download, you can save a map as well
  //       formulaMap: (() => {
  //         const map = {};
  //         formFields.forEach((row, rowIdx) => {
  //           row.formulas.forEach((f, yearIdx) => {
  //             if (f) {
  //               // Calculate the cell address
  //               const col = 3 + yearIdx;
  //               const cellAddr = `${colToLetter(col)}${rowIdx + 2}`; // +2 for header offset
  //               map[cellAddr] = f;
  //             }
  //           });
  //         });
  //         return map;
  //       })(),
  //     }));
  //   };

  //   reader.readAsArrayBuffer(file);
  // };

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

  function formatNumberWithCommasAndPercent(val, isPercent) {
    if (val === null || val === undefined || val === "") return "";
    let str = val.toString().replace(/,/g, "");
    if (str.endsWith("%")) {
      str = str.replace("%", "");
      const num = Number(str);
      if (isNaN(num)) return val;
      return num.toLocaleString("en-IN") + "%";
    }
    // If isPercent true, but value is not string with %—treat as number
    return Number(str).toLocaleString("en-IN");
  }

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
                          formData?.ProjectReportSetting?.FinancialYear || 2025
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
                                value={
                                  typeof yr === "string" &&
                                  yr.trim().endsWith("%")
                                    ? formatNumberWithCommasAndPercent(yr, true)
                                    : formatNumberWithCommas(yr)
                                }
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
                          formData?.ProjectReportSetting?.FinancialYear || 2025
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
                                value={
                                  typeof yr === "string" &&
                                  yr.trim().endsWith("%")
                                    ? formatNumberWithCommasAndPercent(yr, true)
                                    : formatNumberWithCommas(yr)
                                }
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
