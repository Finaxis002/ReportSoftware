import { useEffect, useState, useMemo } from "react";
import Select from "react-select";

import { useNavigate } from "react-router-dom";
import Skeleton from "../common/Skeleton";
import * as XLSX from "xlsx";
import { BASE_URL } from "./Utils/baseurl";

const BankDetails = () => {
  const [bankDetails, setBankDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bankOptions, setBankOptions] = useState([]);
  const [managerOptions, setManagerOptions] = useState([]);
  const [selectedBank, setSelectedBank] = useState(null);
  const [selectedManager, setSelectedManager] = useState(null);
  const [selectedIFSC, setSelectedIFSC] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newBankDetails, setNewBankDetails] = useState({
    businessName: "",
    clientName: "",
    bankName: "",
    managerName: "",
    post: "",
    contactNo: "",
    emailId: "",
    ifscCode: "",
    city: "",
    branchAddress: "",
  });


  const [cityOptions, setCityOptions] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [formErrors, setFormErrors] = useState({});



  useEffect(() => {
    const fetchBankDetails = async () => {
      try {
        setLoading(true);
        setError("");

        // ✅ Fetch from both APIs concurrently
        const [response1, response2] = await Promise.all([
          fetch(`${BASE_URL}/api/get-bank-details`),
          fetch(`${BASE_URL}/api/bank-details`),
        ]);

        if (!response1.ok || !response2.ok) {
          throw new Error("Failed to fetch bank details");
        }

        const data1 = await response1.json();
        const data2 = await response2.json();

        console.log("✅ Fetched data1:", data1);
        console.log("✅ Fetched data2:", data2);


        const combinedData = [
          ...(data1?.data || []).map((item) => ({
            _id: item?._id, // Preserve ID from first API
            clientName: item?.clientName || "N/A",
            businessName: item?.businessName || "N/A",
            bankDetails: {
              Bank: item?.bankName || "N/A",
              BankManagerName: item?.managerName || "N/A",
              Post: item?.post || "N/A",
              ContactNo: item?.contactNo || "N/A",
              EmailId: item?.emailId || "N/A",
              IFSCCode: item?.ifscCode || "N/A",
              City: item?.city || "N/A",
              BranchAddress: item?.branchAddress || "N/A",
            },
          })),
          ...(data2 || []).map((item) => ({
            _id: item?._id, // Preserve ID from second API
            clientName: item?.clientName || "N/A",
            businessName: item?.businessName || "N/A",
            bankDetails: {
              Bank: item?.bankDetails?.Bank || "N/A",
              BankManagerName: item?.bankDetails?.BankManagerName || "N/A",
              Post: item?.bankDetails?.Post || "N/A",
              ContactNo: item?.bankDetails?.ContactNo || "N/A",
              EmailId: item?.bankDetails?.EmailId || "N/A",
              IFSCCode: item?.bankDetails?.IFSCCode || "N/A",
              City: item?.bankDetails?.City || "N/A",
              BranchAddress: item?.bankDetails?.BranchAddress || "N/A",
            },
          })),
        ];

        console.log("✅ Combined Data Before Filtering:", combinedData);

        // ✅ Filter out empty bank details or "N/A" values
        const filteredData = combinedData.filter((item) => {
          const details = item?.bankDetails;

          // ✅ If ALL values are "N/A", skip it
          if (
            details.Bank === "N/A" &&
            details.BankManagerName === "N/A" &&
            details.Post === "N/A" &&
            details.ContactNo === "N/A" &&
            details.EmailId === "N/A" &&
            details.IFSCCode === "N/A" &&
            details.City === "N/A"
          ) {
            return false; // Skip this record
          }

          return true; // Include this record
        });

        console.log("✅ Filtered Data:", filteredData);

        // ✅ Update state with filtered data
        setBankDetails(filteredData);
        // Extract unique cities
        const uniqueCities = filteredData.reduce((acc, item) => {
          const city = item?.bankDetails?.City || "N/A";
          if (city && city !== "N/A" && !acc.includes(city)) {
            acc.push(city);
          }
          return acc;
        }, []);

        setCityOptions(
          uniqueCities.map((city) => ({
            label: city,
            value: city,
          }))
        );
      } catch (err) {
        console.error("🔥 Error fetching bank details:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBankDetails();
  }, []);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/api/bank-filters`
        );
        if (!response.ok) throw new Error("Failed to fetch filter options");

        const data = await response.json();

        console.log("✅ Fetched Filter Data:", data);

        // ✅ Filter out 'N/A' values before setting the state
        setBankOptions(
          data.bankOptions
            .filter((option) => option.value && option.value !== "N/A") // ✅ Remove N/A values
            .map((option) => ({
              label: option.label || "",
              value: option.value || "",
            }))
        );

        setManagerOptions(
          data.managerOptions
            .filter((option) => option.value && option.value !== "N/A") // ✅ Remove N/A values
            .map((option) => ({
              label: option.label || "",
              value: option.value || "",
            }))
        );
      } catch (err) {
        console.error("🔥 Error fetching filter options:", err);
      }
    };

    fetchFilters();
  }, []);

  const filteredData = useMemo(() => {
    return bankDetails.filter((detail) => {
      if (!detail?.bankDetails) return false;

      // ✅ Filter by Bank (IFSC)
      if (selectedBank) {
        const bank = detail?.bankDetails?.Bank || "";
        const ifsc = detail?.bankDetails?.IFSCCode || "";
        const label = `${bank} (${ifsc})`;
        if (!label.includes(selectedBank)) return false;
      }

      // ✅ Filter by Manager
      if (selectedManager) {
        const manager = detail?.bankDetails?.BankManagerName || "";
        if (!manager.includes(selectedManager)) return false;
      }

      // ✅ Filter by IFSC Code
      if (selectedIFSC) {
        const ifsc = detail?.bankDetails?.IFSCCode || "";
        if (!ifsc.includes(selectedIFSC)) return false;
      }
      // ✅ City filter
      if (selectedCity) {
        const city = detail?.bankDetails.City || "";
        if (!city.includes(selectedCity)) return false;
      }
      return true;
    });
  }, [bankDetails, selectedBank, selectedManager, selectedIFSC, selectedCity]);

  const navigate = useNavigate();


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBankDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddBank = async () => {
    const { city, contactNo, bankName, managerName } = newBankDetails;
    setFormErrors({});
    const requiredFields = ["bankName", "managerName", "contactNo", "city"];
    const errors = {};
    requiredFields.forEach((field) => {
      if (!newBankDetails[field] || newBankDetails[field].trim() === "") {
        errors[field] = `${field
          .replace(/([A-Z])/g, " $1") // Add spaces before capital letters
          .replace(/^./, (str) => str.toUpperCase())} is required`;
      }
    });

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return; // Stop submission if errors
    }
    // ✅ Validate only the 4 required fields
    if (!city || !contactNo || !bankName || !managerName) {
      alert(
        "Please fill all required fields: Business Name, Client Name, Bank Name, Manager Name."
      );
      return;
    }

    try {
      // ✅ Ensure the payload structure is correct
      const payload = {
        bankDetails: {
          businessName: newBankDetails.businessName || "",
          clientName: newBankDetails.clientName || "",
          bankName: newBankDetails.bankName || "",
          managerName: newBankDetails.managerName || "",
          post: newBankDetails.post || "",
          contactNo: newBankDetails.contactNo || "",
          emailId: newBankDetails.emailId || "",
          ifscCode: newBankDetails.ifscCode || "",
          city: newBankDetails.city || "",
          branchAddress: newBankDetails.branchAddress || "",
        },
      };

      console.log("📤 Sending Payload:", payload); // ✅ Debugging

      const response = await fetch(
        `${BASE_URL}/api/add-bank-details`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload), // ✅ Wrap data under `bankDetails`
        }
      );

      if (response.ok) {
        const newBank = await response.json();

        console.log("✅ New Bank Added:", newBank);

        // ✅ Update bank list state
        setBankDetails((prev) => [...prev, newBank.data]);
        alert("✅ Bank details added successfully!");

        // ✅ Close modal and reset form
        setShowAddModal(false);
        setNewBankDetails({
          businessName: "",
          clientName: "",
          bankName: "",
          managerName: "",
          post: "",
          contactNo: "",
          emailId: "",
          ifscCode: "",
          city: "",
          branchAddress: "",
        });
      } else {
        const errorResponse = await response.json();
        console.error("❌ Failed to add bank:", errorResponse.message);
        alert(`Failed to add bank: ${errorResponse.message}`);
      }
    } catch (error) {
      console.error("🔥 Error adding bank:", error);
      alert("Error adding bank");
    }
  };

  const uniqueBankOptions = Array.from(
    new Set(bankOptions.map(JSON.stringify))
  ).map(JSON.parse);

  const uniqueManagerOptions = Array.from(
    new Set(managerOptions.map(JSON.stringify))
  ).map(JSON.parse);

  const exportBankDataToCSV = () => {
    if (!filteredData.length) {
      alert("No data available to export");
      return;
    }

    // ✅ Define CSV headers
    const headers = [
      "Client Name",
      "Business Name",
      "Bank Name",
      "Manager Name",
      "Post",
      "Contact No",
      "Email",
      "IFSC Code",
      "City",
      "Branch Address",
    ];

    // ✅ Prepare data rows
    const csvRows = [
      headers.join(","), // ✅ Add headers
      ...filteredData.map((detail) => {
        const { bankDetails } = detail;

        return [
          `"${detail.clientName || "N/A"}"`,
          `"${detail.businessName || "N/A"}"`,
          `"${bankDetails.Bank || "N/A"}"`,
          `"${bankDetails.BankManagerName || "N/A"}"`,
          `"${bankDetails.Post || "N/A"}"`,
          `"${bankDetails.ContactNo || "N/A"}"`,
          `"${bankDetails.EmailId || "N/A"}"`,
          `"${bankDetails.IFSCCode || "N/A"}"`,
          `"${bankDetails.City || "N/A"}"`,
          `"${bankDetails.BranchAddress || "N/A"}"`,
        ].join(",");
      }),
    ];

    // ✅ Create a Blob and trigger download
    const csvData = csvRows.join("\n");
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "bank_details.csv";
    link.click();
    window.URL.revokeObjectURL(url);
  };


  const handleExcelImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      console.log("📥 Parsed Excel Data:", jsonData);

      // Map Excel rows to payload format
      const mappedData = jsonData.map((row) => ({
        clientName: row["Client Name"] || "",
        businessName: row["Business Name"] || "",
        bankDetails: {
          Bank: row["Bank Name"] || "",
          BankManagerName: row["Manager Name"] || "",
          Post: row["Post"] || "",
          ContactNo: row["Contact No"] || "",
          EmailId: row["Email"] || "",
          IFSCCode: row["IFSC Code"] || "",
          City: row["City"] || "",
          branchAddress: row["Branch Address"] || "",
        },
      }));

      const insertedEntries = [];

      for (const entry of mappedData) {
        try {
          const response = await fetch(
            `${BASE_URL}/api/add-bank-details`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                bankDetails: {
                  businessName: entry.businessName,
                  clientName: entry.clientName,
                  bankName: entry.bankDetails.Bank,
                  managerName: entry.bankDetails.BankManagerName,
                  post: entry.bankDetails.Post,
                  contactNo: entry.bankDetails.ContactNo,
                  emailId: entry.bankDetails.EmailId,
                  ifscCode: entry.bankDetails.IFSCCode,
                  city: entry.bankDetails.City,
                  branchAddress: entry.bankDetails.branchAddress,
                },
              }),
            }
          );

          if (!response.ok) {
            const error = await response.json();
            console.error("❌ Upload failed:", error.message);
            continue;
          }

          const saved = await response.json();

          // Push in correct format expected by frontend
          insertedEntries.push({
            _id: saved.data._id,
            clientName: saved.data.clientName,
            businessName: saved.data.businessName,
            bankDetails: {
              Bank: saved.data.bankName,
              BankManagerName: saved.data.managerName,
              Post: saved.data.post,
              ContactNo: saved.data.contactNo,
              EmailId: saved.data.emailId,
              IFSCCode: saved.data.ifscCode,
              City: saved.data.city,
              BranchAddress: saved.data.branchAddress,
            },
          });
        } catch (err) {
          console.error("🔥 Upload error:", err.message);
        }
      }

      if (insertedEntries.length > 0) {
        setBankDetails((prev) => [...prev, ...insertedEntries]);
        alert("✅ Excel data imported successfully!");
      } else {
        alert("❌ No entries were imported.");
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleEdit = (detail) => {
    const id = detail._id || detail.bankDetails?._id;
    if (!id) {
      alert("Only manually added records can be edited");
      return;
    }

    // Set the form data to the existing bank details for editing
    setNewBankDetails({
      _id: id, // Store the ID for updating
      businessName: detail.businessName || "",
      clientName: detail.clientName || "",
      bankName: detail.bankDetails?.Bank || "",
      managerName: detail.bankDetails?.BankManagerName || "",
      post: detail.bankDetails?.Post || "",
      contactNo: detail.bankDetails?.ContactNo || "",
      emailId: detail.bankDetails?.EmailId || "",
      ifscCode: detail.bankDetails?.IFSCCode || "",
      city: detail.bankDetails?.City || "",
      branchAddress: detail.bankDetails?.branchAddress || "",
    });

    setShowAddModal(true); // Show the modal for editing
  };

  const handleDelete = async (detail) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;

    try {
      const idToDelete = detail._id || detail.bankDetails?._id;

      const response = await fetch(
        `${BASE_URL}/api/delete-bank-details/${idToDelete}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setBankDetails((prev) =>
          prev.filter((item) => {
            const itemId = item._id || item.bankDetails?._id;
            return itemId !== idToDelete;
          })
        );
        alert("Bank detail deleted successfully");
      } else {
        const err = await response.json();
        alert(`Failed to delete: ${err.message}`);
      }
    } catch (err) {
      console.error("Error deleting bank detail:", err);
      alert("Something went wrong while deleting.");
    }
  };

  const handleUpdateBank = async () => {
    try {
      const id = newBankDetails._id; // Ensure the _id is available
      if (!id) {
        alert("Cannot update - no valid ID found");
        return;
      }

      const payload = {
        businessName: newBankDetails.businessName,
        clientName: newBankDetails.clientName,
        bankName: newBankDetails.bankName,
        managerName: newBankDetails.managerName,
        post: newBankDetails.post,
        contactNo: newBankDetails.contactNo,
        emailId: newBankDetails.emailId,
        ifscCode: newBankDetails.ifscCode,
        city: newBankDetails.city,
        branchAddress: newBankDetails.branchAddress,
      };

      const response = await fetch(
        `${BASE_URL}/api/update-bank-details/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        const updatedBank = await response.json();

        // Update the local state with the updated bank details
        setBankDetails((prev) =>
          prev.map((item) =>
            item._id === id || item.bankDetails?._id === id
              ? {
                ...item,
                ...updatedBank.data,
              }
              : item
          )
        );

        // Close the modal and reset the form
        setShowAddModal(false);
        setNewBankDetails({
          businessName: "",
          clientName: "",
          bankName: "",
          managerName: "",
          post: "",
          contactNo: "",
          emailId: "",
          ifscCode: "",
          city: "",
          branchAddress: "",
        });

        alert("Bank details updated successfully");
      } else {
        const errorResponse = await response.json();
        alert(`Failed to update: ${errorResponse.message}`);
      }
    } catch (error) {
      console.error("Error updating bank:", error);
      alert("Error updating bank details");
    }
  };

  const handleDownloadTemplate = () => {
    const templateHeaders = [
      [
        "City",
        "Bank Name",
        "Manager Name",
        "Contact No",
        "Email",
        "IFSC Code",
        "Client Name",
        "Business Name",
        "Post",
        "Branch Address",
      ],
    ];

    // Create worksheet from headers
    const worksheet = XLSX.utils.aoa_to_sheet(templateHeaders);

    // Create workbook and add the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");

    // Write workbook and trigger download
    XLSX.writeFile(workbook, "BankDetails_Template.xlsx");
  };


  const handleOTPVerifyAndExport = async () => {
    try {
      if (!otpInput) {
        alert("Please enter the OTP.");
        return;
      }

      const verifyRes = await fetch(
        `${BASE_URL}/api/otpRouteForExport/verify-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ otp: otpInput }),
        }
      );

      const verifyData = await verifyRes.json();

      if (verifyRes.ok && verifyData.success) {
        setOtpModalOpen(false);
        setOtpInput("");
        exportBankDataToCSV(); // ✅ Success
      } else {
        alert("❌ Invalid OTP. Please try again.");
      }
    } catch (err) {
      console.error("❌ OTP verification error:", err);
      alert("Error verifying OTP. Try again.");
    }
  };

  return (
    <div className="flex h-[100vh]">
      <div className="app-content">

        <div className="max-w-8xl w-full h-full">

          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md shadow-md space-y-4">
            {/* ✅ First Line: Buttons */}

            <div className="flex flex-wrap items-center gap-3">
              {/* Add New Button */}
              <button
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 border border-blue-700"
                onClick={() => setShowAddModal(true)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add New
              </button>

              {/* Export Data Button */}
              <button
                onClick={() => {
                  fetch(`${BASE_URL}/api/otpRouteForExport/send-otp`, {
                    method: "POST",
                  })
                    .then((res) => {
                      if (!res.ok) throw new Error("Failed to send OTP");
                      alert("OTP sent to your email.");
                      setOtpModalOpen(true);
                    })
                    .catch((err) => {
                      console.error("❌ OTP send error:", err);
                      alert("Failed to send OTP.");
                    });
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-500 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 border border-green-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Export Data
              </button>

              {/* Download Template Button */}
              <button
                onClick={handleDownloadTemplate}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 border border-amber-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Template
              </button>

              {/* Import Excel Button */}
              <div className="relative">
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleExcelImport}
                  className="hidden"
                  id="upload-excel"
                />
                <label
                  htmlFor="upload-excel"
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-violet-500 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 border border-purple-700 cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  Import Excel
                </label>
              </div>
            </div>


            {/* ✅ Second Line: Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {/* Bank Name Filter */}
              <div>
                <label className="block text-gray-800 dark:text-gray-200 font-medium mb-1">
                  Bank Name (IFSC)
                </label>
                <Select
                  key={uniqueBankOptions.length}
                  options={uniqueBankOptions}
                  value={uniqueBankOptions.find(
                    (option) => option.value === selectedBank
                  )}
                  onChange={(option) => setSelectedBank(option?.value)}
                  placeholder="Select Bank"
                  isClearable
                />
              </div>

              {/* Manager Name Filter */}
              <div>
                <label className="block text-gray-800 dark:text-gray-200 font-medium mb-1">
                  Manager Name
                </label>
                <Select
                  key={uniqueManagerOptions.length}
                  options={uniqueManagerOptions}
                  value={uniqueManagerOptions.find(
                    (option) => option.value === selectedManager
                  )}
                  onChange={(option) => setSelectedManager(option?.value)}
                  placeholder="Select Manager"
                  isClearable
                />
              </div>

              {/* City Filter */}
              <div>
                <label className="block text-gray-800 dark:text-gray-200 font-medium mb-1">
                  City
                </label>
                <Select
                  key={cityOptions.length}
                  options={cityOptions}
                  value={cityOptions.find(
                    (option) => option.value === selectedCity
                  )}
                  onChange={(option) => setSelectedCity(option?.value)}
                  placeholder="Select City"
                  isClearable
                />
              </div>
            </div>
          </div>

          {loading ? (
            // <p className="text-center text-lg text-gray-100 animate-pulse">
            //   Loading bank details...
            // </p>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          ) : error ? (
            <p className="text-center text-lg text-red-400">{error}</p>
          ) : filteredData.length > 0 ? (
            <div className="relative w-full max-w-full ">
              <div className="w-[180vh] h-[55vh] overflow-x-auto border rounded-md">
                <div className="min-w-full">
                  <table className="table-fixed min-w-full text-sm text-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-700 shadow-md rounded-lg overflow-hidden">

                    <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[13px] font-semibold uppercase tracking-wider shadow-sm rounded-t-md">
                      <tr>
                        <th className="px-6 py-3 text-left border-r border-blue-500">
                          City
                        </th>
                        <th className="px-6 py-3 text-left border-r border-blue-500">
                          Bank
                        </th>
                        <th className="px-6 py-3 text-left border-r border-blue-500">
                          Manager
                        </th>
                        <th className="px-6 py-3 text-left border-r border-blue-500">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left border-r border-blue-500">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left border-r border-blue-500">
                          IFSC
                        </th>
                        <th className="px-6 py-3 text-left border-r border-blue-500">
                          Client Name
                        </th>
                        <th className="px-6 py-3 text-left border-r border-blue-500">
                          Business
                        </th>
                        <th className="px-6 py-3 text-left border-r border-blue-500 ">
                          Branch Address
                        </th>
                        <th className="px-6 py-3 text-left">Actions</th>
                      </tr>
                    </thead>

                    <tbody className="dark:bg-gray-900 text-gray-800 dark:text-gray-200 text-sm">
                      {filteredData.map((detail, index) => {
                        // Check if this record has an ID (manually added)
                        const hasId = detail._id || detail.bankDetails?._id;

                        return (
                          <tr
                            key={index}
                            className={`transition duration-200 ${index % 2 === 0
                              ? "dark:bg-gray-900"
                              : "bg-gray-50 dark:bg-gray-800"
                              } hover:bg-blue-50 dark:hover:bg-gray-700`}
                          >
                            <td className="px-6 py-3 truncate">
                              {detail.bankDetails?.City || "N/A"}
                            </td>
                            <td className="px-6 py-3 truncate">
                              {detail.bankDetails?.Bank || "N/A"}
                            </td>
                            <td className="px-6 py-3 truncate">
                              {detail.bankDetails?.BankManagerName || "N/A"}
                            </td>
                            <td className="px-6 py-3 truncate">
                              {detail.bankDetails?.ContactNo || "N/A"}
                            </td>
                            <td className="px-6 py-3 truncate">
                              {detail.bankDetails?.EmailId || "N/A"}
                            </td>
                            <td className="px-6 py-3 truncate">
                              {detail.bankDetails?.IFSCCode || "N/A"}
                            </td>
                            <td className="px-6 py-3 truncate">
                              {detail.clientName || "N/A"}
                            </td>
                            <td className="px-6 py-3 truncate">
                              {detail.businessName || "N/A"}
                            </td>
                            <td className="px-6 py-3 truncate">
                              {detail.bankDetails?.BranchAddress || "N/A"}
                            </td>

                            <td className="px-6 py-3 whitespace-nowrap flex gap-2">
                              {hasId ? (
                                <>
                                  <button
                                    onClick={() => handleEdit(detail)}
                                    className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDelete(detail)}
                                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                  >
                                    Delete
                                  </button>
                                </>
                              ) : (
                                <span className="text-gray-500 text-sm">
                                  (Form Data)
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-lg text-gray-200">
              No bank details available.
            </p>
          )}

          {showAddModal && (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-3xl animate-fadeIn">
                {/* Modal Title */}
                <h2 className="text-3xl font-semibold text-gray-800 dark:text-white mb-8 border-b pb-4 flex items-center gap-2">
                  <i className="fas fa-university text-blue-600 text-xl"></i>{" "}
                  {newBankDetails._id
                    ? "Edit Bank Details"
                    : "Add New Bank Details"}
                </h2>

                {/* Form Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                  {[
                    { label: "Business Name", name: "businessName", type: "text", placeholder: "Enter Business Name" },
                    { label: "Client Name", name: "clientName", type: "text", placeholder: "Enter Client Name" },
                    { label: "Bank Name", name: "bankName", type: "text", placeholder: "Enter Bank Name", required: true },
                    { label: "Manager Name", name: "managerName", type: "text", placeholder: "Enter Manager Name", required: true },
                    { label: "Post", name: "post", type: "text", placeholder: "Enter Post" },
                    { label: "Contact Number", name: "contactNo", type: "text", placeholder: "Enter Contact No", required: true },
                    { label: "Email", name: "emailId", type: "email", placeholder: "Enter Email" },
                    { label: "IFSC Code", name: "ifscCode", type: "text", placeholder: "Enter IFSC Code" },
                    { label: "City", name: "city", type: "text", placeholder: "Enter City", required: true },
                    { label: "Branch Address", name: "branchAddress", type: "text", placeholder: "Enter Branch Address" },
                  ].map((field, i) => (
                    <div key={i}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                        {field.label} {field.required && <span className="text-red-600">*</span>}
                      </label>
                      <input
                        type={field.type}
                        name={field.name}
                        value={newBankDetails[field.name]}
                        onChange={handleInputChange}
                        placeholder={field.placeholder}
                        className={`w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-400 focus:outline-none transition
        ${formErrors[field.name] ? "border-red-500" : "border-gray-300 dark:border-gray-700"}`}
                      />
                      {formErrors[field.name] && (
                        <p className="text-red-600 text-sm mt-1">{formErrors[field.name]}</p>
                      )}
                    </div>
                  ))}

                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-4 mt-8">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 rounded-lg transition"
                  >
                    <i className="fas fa-times mr-2"></i> Cancel
                  </button>
                  <button
                    // onClick={handleAddBank}
                    onClick={
                      newBankDetails._id ? handleUpdateBank : handleAddBank
                    }
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-md"
                  >
                    <i className="fas fa-paper-plane mr-2"></i>
                    {newBankDetails._id ? "Update" : "Submit"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {otpModalOpen && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl p-6 shadow-lg z-[9999] w-full max-w-sm">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Enter OTP
          </h2>
          <input
            type="text"
            value={otpInput}
            onChange={(e) => setOtpInput(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter OTP received on email"
            autoFocus
          />
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => setOtpModalOpen(false)}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleOTPVerifyAndExport}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Verify & Export
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankDetails;
