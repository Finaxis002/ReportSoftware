import React, { useState } from "react";
import * as XLSX from "xlsx";

const FileUpload = ({ setFormData }) => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

//   const handleFileParse = async () => {
//     if (!file) return alert("Please select a file");

//     const reader = new FileReader();

//     reader.onload = (e) => {
//         const data = new Uint8Array(e.target.result);
//         const workbook = XLSX.read(data, { type: "array" });

//         // Get first sheet
//         const sheetName = workbook.SheetNames[0];
//         const sheet = workbook.Sheets[sheetName];

//         // Convert to JSON (Key-Value Mapping)
//         const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

//         let mappedData = {};

//         rawData.forEach((row) => {
//             if (row[0] && row[2]) { // Ensure key-value exists
//                 mappedData[row[0].trim()] = row[2].toString().trim(); // Key-Value Pair
//             }
//         });

//         console.log("✅ Mapped Data:", mappedData); // Debugging Log

//         // Map Excel Fields to Your Form Fields
//         const formDataStructure = {
//             AccountInformation: {
//                 clientName: mappedData["Name of Individual(s)"] || "",
//                 businessName: mappedData["Business/Company Name"] || "",
//                 industryType: mappedData["Industry Type"] || "",
//                 registrationType: mappedData["Registration Type"] || "",
//                 businessOwner: mappedData["Name of Individual(s)"] || "",
//                 businessContactNumber: mappedData["Contact Number"] || "",
//                 businessAddress: mappedData["Business Address"] || "",
//                 clientEmail: mappedData["Email ID"] || "",
//                 PANNumber: mappedData["TAN/PAN/CIN/GST/UDYAM"] || "",
//                 adhaarNumber: mappedData['Aadhaar Number/ PAN'] || "",
//                 clientDob: mappedData["Date of Birth"] || "",
//                 numberOfEmployees: mappedData["Managing Staff"] || "",
//                 workingCapitalRequired: mappedData["Working Capital Required"] || "",
//             },
            
// CostOfProject:{
//     Land: mappedData["Land"] || "",
//     Building: mappedData["Building & Shed"] || "",
//     FurnitureandFittings: mappedData["Furniture & Fittings"] || "",



// },

//         };

//         console.log("🔄 Final Mapped Form Data:", formDataStructure);

//         // Update Form Fields in MultiStepForm
//         setFormData(formDataStructure);
//         alert("File parsed and fields populated!");
//     };

//     reader.readAsArrayBuffer(file);
// };
// const handleFileParse = async () => {
//     if (!file) return alert("Please select a file");

//     const reader = new FileReader();

//     reader.onload = (e) => {
//         const data = new Uint8Array(e.target.result);
//         const workbook = XLSX.read(data, { type: "array" });

//         // Get first sheet
//         const sheetName = workbook.SheetNames[0];
//         const sheet = workbook.Sheets[sheetName];

//         // Convert to JSON (Key-Value Mapping)
//         const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

//         let mappedData = {};

//         rawData.forEach((row) => {
//             if (row.length > 0 && typeof row[0] === "string") {  // ✅ Ensure row[0] is a valid string
//                 // Find the first non-empty value in the row (after the key)
//                 let value = row.slice(1).find(v => v !== undefined && v !== null && v !== ""); 
                
//                 if (value !== undefined) {
//                     mappedData[row[0].trim()] = value.toString().trim();
//                 }
//             }
//         });

//         console.log("✅ Mapped Data:", mappedData); // Debugging Log

//         // Convert Simple Values into Expected Object Format
//         const formatCostItem = (id, name) => ({
//             amount: mappedData[id] ? parseFloat(mappedData[id].replace(/,/g, '')) || 0 : 0,
//             id,
//             isCustom: false,
//             name,
//             rate: 10  // Default value (modify as needed)
//         });

//         // Map Excel Fields to Your Form Fields
//         const formDataStructure = {
//             AccountInformation: {
//                 clientName: mappedData["Name of Individual(s)"] || "",
//                 businessName: mappedData["Business/Company Name"] || "",
//                 industryType: mappedData["Industry Type"] || "",
//                 registrationType: mappedData["Registration Type"] || "",
//                 businessOwner: mappedData["Name of Individual(s)"] || "",
//                 businessContactNumber: mappedData["Contact Number"] || "",
//                 businessAddress: mappedData["Business Address"] || "",
//                 clientEmail: mappedData["Email ID"] || "",
//                 PANNumber: mappedData["TAN/PAN/CIN/GST/UDYAM"] || "",
//                 adhaarNumber: mappedData["Aadhaar Number/ PAN"] || "",
//                 clientDob: mappedData["Date of Birth"] || "",
//                 numberOfEmployees: mappedData["Managing Staff"] || "",
//                 workingCapitalRequired: mappedData["Working Capital Required"] || "",
//             },
//             MeansOfFinance:{
//                 termLoan:{
//                     promoterContribution:mappedData["Promoter's Contribution"] || "",
//                     termLoan: mappedData["Term Loan"] || "",
//                 }

//             },

//             CostOfProject: {
//                 Land: formatCostItem("Land", "Land"),
//                 Building: formatCostItem("Building & Shed", "Building & Shed"),
//                 FurnitureandFittings: formatCostItem("Furniture & Fittings", "Furniture and Fittings"),
//                 IntangibleAssets: formatCostItem("Intangible Assets", "Intangible Assets"),
//                 PlantMachinery: formatCostItem("Plant & Machinery", "Plant & Machinery"),
//                 ComputersPeripherals: formatCostItem("Computers & Peripherals", "Computers & Peripherals"),
//                 Miscellaneous: formatCostItem("Miscellaneous & Other Assets", "Miscellaneous & Other Assets"),
//             },
//         };

//         console.log("🔄 Final Mapped Form Data:", formDataStructure);
//         console.log("🔍 Available Keys in Mapped Data:", Object.keys(mappedData));


//         // Update Form Fields in MultiStepForm
//         setFormData(formDataStructure);
//         alert("File parsed and fields populated!");
//     };

//     reader.readAsArrayBuffer(file);
// };

const handleFileParse = async () => {
    if (!file) return alert("Please select a file");

    const reader = new FileReader();

    reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Convert to JSON (Key-Value Mapping)
        const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        let mappedData = {};
        let meansOfFinanceData = {};  // Separate object for term loan values
        let isInTermLoanSection = false;

        rawData.forEach((row) => {
            if (row.length > 0 && typeof row[0] === "string") {  
                let key = row[0].trim();
                let value = row.slice(1).find(v => v !== undefined && v !== null && v !== ""); 

                // ✅ Detect "TERM LOAN" Section
                if (key.toUpperCase() === "TERM LOAN") {
                    isInTermLoanSection = true;
                } else if (isInTermLoanSection && key.toUpperCase().includes("WORKING CAPITAL")) {
                    isInTermLoanSection = false;  // ✅ Stop when "WORKING CAPITAL" is detected
                }

                if (isInTermLoanSection && value !== undefined) {
                    meansOfFinanceData[key] = value.toString().trim();
                } else if (value !== undefined) {
                    mappedData[key] = value.toString().trim();
                }
            }
        });

        console.log("✅ Mapped Data:", mappedData);
        console.log("✅ Extracted TERM LOAN Data:", meansOfFinanceData);

        // Convert Simple Values into Expected Object Format
        const formatCostItem = (id, name) => ({
            amount: mappedData[id] ? parseFloat(mappedData[id].replace(/,/g, '')) || 0 : 0,
            id,
            isCustom: false,
            name,
            rate: 10  // Default value (modify as needed)
        });

        // **✅ Correctly structured formData**
        const formDataStructure = {
            AccountInformation: {
                clientName: mappedData["Name of Individual(s)"] || "",
                businessName: mappedData["Business/Company Name"] || "",
                industryType: mappedData["Industry Type"] || "",
                registrationType: mappedData["Registration Type"] || "",
                businessOwner: mappedData["Name of Individual(s)"] || "",
                businessContactNumber: mappedData["Contact Number"] || "",
                businessAddress: mappedData["Business Address"] || "",
                clientEmail: mappedData["Email ID"] || "",
                PANNumber: mappedData["TAN/PAN/CIN/GST/UDYAM"] || "",
                adhaarNumber: mappedData["Aadhaar Number/ PAN"] || "",
                clientDob: mappedData["Date of Birth"] || "",
                numberOfEmployees: mappedData["Managing Staff"] || "",
                workingCapitalRequired: mappedData["Working Capital Required"] || "",
            },
            MeansOfFinance: {
               
                termLoan: {
                    promoterContribution: meansOfFinanceData["Promoter's Contribution"] || "",
                    termLoan: meansOfFinanceData["Term Loan"] || "",
                },
                workingCapital: {
                    promoterContribution: mappedData["WCPromoterContribution"] || "",
                    termLoan: mappedData["WCTermLoan"] || "",
                },
                
            },
            CostOfProject: {
                Land: formatCostItem("Land", "Land"),
                Building: formatCostItem("Building & Shed", "Building & Shed"),
                FurnitureandFittings: formatCostItem("Furniture & Fittings", "Furniture and Fittings"),
                IntangibleAssets: formatCostItem("Intangible Assets", "Intangible Assets"),
                PlantMachinery: formatCostItem("Plant & Machinery", "Plant & Machinery"),
                ComputersPeripherals: formatCostItem("Computers & Peripherals", "Computers & Peripherals"),
                Miscellaneous: formatCostItem("Miscellaneous & Other Assets", "Miscellaneous & Other Assets"),
            },
        };

        console.log("🔄 Final Mapped Form Data:", formDataStructure);
        console.log("🔍 Available Keys in Mapped Data:", Object.keys(mappedData));

        // Update Form Fields in MultiStepForm
        setFormData(formDataStructure);
        alert("File parsed and fields populated!");
    };

    reader.readAsArrayBuffer(file);
};



  return (
    
    <div className="flex gap-x-5 items-center justify-center bg-gray-100 p-4 rounded-md shadow-md w-full max-w-sm mx-auto">
  {/* File Upload Label */}
  <label className="flex flex-col items-center px-3 py-2 bg-white rounded-md shadow-sm tracking-wide uppercase border border-blue-500 cursor-pointer hover:bg-blue-500 hover:text-white transition duration-300 text-sm">
    <svg
      className="w-6 h-6 text-blue-500 hover:text-white transition duration-300"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path>
    </svg>
    <span className="mt-1 text-xs">{file ? file.name : "Select File"}</span>
    <input type="file" accept=".xlsx" className="hidden" onChange={handleFileChange} />
  </label>

  {/* Upload Button */}
  <button
    onClick={handleFileParse}
    className="bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-md shadow-sm hover:bg-blue-700 transition duration-300"
  >
    Upload
  </button>
</div>

  );
};

export default FileUpload;




