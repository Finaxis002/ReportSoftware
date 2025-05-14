import React, { useEffect, useState, useMemo } from "react";
import MenuBar from "./MenuBar";
import Select from "react-select";
import Header from "../NewMultiStepForm/Header";
import { useNavigate } from "react-router-dom";
import Skeleton from "../common/Skeleton";
import * as XLSX from "xlsx";

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

  useEffect(() => {
    const fetchBankDetails = async () => {
      try {
        setLoading(true);
        setError("");

        // ✅ Fetch from both APIs concurrently
        const [response1, response2] = await Promise.all([
          fetch("https://backend-three-pink.vercel.app/api/get-bank-details"),
          fetch("https://backend-three-pink.vercel.app/api/bank-details"),
        ]);

        if (!response1.ok || !response2.ok) {
          throw new Error("Failed to fetch bank details");
        }

        const data1 = await response1.json();
        const data2 = await response2.json();

        console.log("✅ Fetched data1:", data1);
        console.log("✅ Fetched data2:", data2);

        // ✅ Combine data without removing duplicates
        // const combinedData = [
        //   ...(data1?.data || []).map((item) => ({
        //     clientName: item?.clientName || "N/A",
        //     businessName: item?.businessName || "N/A",
        //     bankDetails: {
        //       Bank: item?.bankName || "N/A",
        //       BankManagerName: item?.managerName || "N/A",
        //       Post: item?.post || "N/A",
        //       ContactNo: item?.contactNo || "N/A",
        //       EmailId: item?.emailId || "N/A",
        //       IFSCCode: item?.ifscCode || "N/A",
        //       City: item?.city || "N/A",
        //     },
        //   })),
        //   ...(data2 || []).map((item) => ({
        //     clientName: item?.clientName || "N/A",
        //     businessName: item?.businessName || "N/A",
        //     bankDetails: {
        //       Bank: item?.bankDetails?.Bank || "N/A",
        //       BankManagerName: item?.bankDetails?.BankManagerName || "N/A",
        //       Post: item?.bankDetails?.Post || "N/A",
        //       ContactNo: item?.bankDetails?.ContactNo || "N/A",
        //       EmailId: item?.bankDetails?.EmailId || "N/A",
        //       IFSCCode: item?.bankDetails?.IFSCCode || "N/A",
        //       City: item?.bankDetails?.City || "N/A",
        //     },
        //   })),
        // ];

        // const combinedData = [
        //   ...(data1?.data || []).map((item) => ({
        //     _id: item?._id, // Preserve the ID from API 1
        //     clientName: item?.clientName || "N/A",
        //     businessName: item?.businessName || "N/A",
        //     bankDetails: {
        //       _id: item?._id, // Also include ID in bankDetails for consistency
        //       Bank: item?.bankName || "N/A",
        //       BankManagerName: item?.managerName || "N/A",
        //       Post: item?.post || "N/A",
        //       ContactNo: item?.contactNo || "N/A",
        //       EmailId: item?.emailId || "N/A",
        //       IFSCCode: item?.ifscCode || "N/A",
        //       City: item?.city || "N/A",
        //     },
        //   })),
        //   ...(data2 || []).map((item) => ({
        //     _id: item?._id, // Preserve the ID from API 2
        //     clientName: item?.clientName || "N/A",
        //     businessName: item?.businessName || "N/A",
        //     bankDetails: {
        //       _id: item?.bankDetails?._id, // Preserve nested ID if it exists
        //       Bank: item?.bankDetails?.Bank || "N/A",
        //       BankManagerName: item?.bankDetails?.BankManagerName || "N/A",
        //       Post: item?.bankDetails?.Post || "N/A",
        //       ContactNo: item?.bankDetails?.ContactNo || "N/A",
        //       EmailId: item?.bankDetails?.EmailId || "N/A",
        //       IFSCCode: item?.bankDetails?.IFSCCode || "N/A",
        //       City: item?.bankDetails?.City || "N/A",
        //     },
        //   })),
        // ];
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
          "https://backend-three-pink.vercel.app/api/bank-filters"
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

  const renderMenuBar = () => {
    const authRole = localStorage.getItem("userRole");
    if (!authRole) {
      navigate("/login");
      return null;
    }

    switch (authRole) {
      case "admin":
        return <MenuBar userRole="admin" />;
      case "employee":
        return <MenuBar userRole="employee" />;
      case "client":
        return <MenuBar userRole="client" />;
      default:
        navigate("/login");
        return null;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBankDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddBank = async () => {
    const { city, contactNo, bankName, managerName } = newBankDetails;

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
        "https://backend-three-pink.vercel.app/api/add-bank-details",
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

  // ✅ Utility function to convert JSON to CSV
  // const exportManagersToCSV = () => {
  //   if (!managerOptions.length) {
  //     alert("No manager data available to export");
  //     return;
  //   }

  //   const headers = ["Manager Name"];
  //   const csvRows = [
  //     headers.join(","), // ✅ Add headers
  //     ...managerOptions.map((option) => `"${option.label}"`), // ✅ Add each manager name
  //   ];

  //   const csvData = csvRows.join("\n");
  //   const blob = new Blob([csvData], { type: "text/csv" });
  //   const url = window.URL.createObjectURL(blob);
  //   const link = document.createElement("a");
  //   link.href = url;
  //   link.download = "managers_list.csv";
  //   link.click();
  //   window.URL.revokeObjectURL(url);
  // };

  // ✅ Utility function to convert JSON to CSV and trigger download
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

  //   const handleExcelImport = async (e) => {
  //   const file = e.target.files[0];
  //   if (!file) return;

  //   const reader = new FileReader();

  //   reader.onload = async (event) => {
  //     const data = new Uint8Array(event.target.result);
  //     const workbook = XLSX.read(data, { type: "array" });

  //     const sheetName = workbook.SheetNames[0];
  //     const worksheet = workbook.Sheets[sheetName];

  //     const jsonData = XLSX.utils.sheet_to_json(worksheet);

  //     console.log("📥 Parsed Excel Data:", jsonData);

  //     const mappedData = jsonData.map((row) => ({
  //       clientName: row["Client Name"] || "",
  //       businessName: row["Business Name"] || "",
  //       bankDetails: {
  //         Bank: row["Bank Name"] || "",
  //         BankManagerName: row["Manager Name"] || "",
  //         Post: row["Post"] || "",
  //         ContactNo: row["Contact No"] || "",
  //         EmailId: row["Email"] || "",
  //         IFSCCode: row["IFSC Code"] || "",
  //         City: row["City"] || "",
  //       },
  //     }));

  //     setBankDetails((prev) => [...prev, ...mappedData]);

  //     // Optional: Upload to backend
  //     for (const entry of mappedData) {
  //       try {
  //         const res = await fetch(
  //           "https://backend-three-pink.vercel.app/api/add-bank-details",
  //           {
  //             method: "POST",
  //             headers: { "Content-Type": "application/json" },
  //             body: JSON.stringify({ bankDetails: entry.bankDetails, clientName: entry.clientName, businessName: entry.businessName }),
  //           }
  //         );

  //         if (!res.ok) {
  //           const err = await res.json();
  //           console.error("❌ Upload failed:", err.message);
  //         } else {
  //           console.log("✅ Uploaded entry:", await res.json());
  //         }
  //       } catch (error) {
  //         console.error("🔥 Upload error:", error.message);
  //       }
  //     }

  //     alert("Excel data imported successfully!");
  //   };

  //   reader.readAsArrayBuffer(file);
  // };
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
            "https://backend-three-pink.vercel.app/api/add-bank-details",
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
        `https://backend-three-pink.vercel.app/api/delete-bank-details/${idToDelete}`,
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
        `https://backend-three-pink.vercel.app/api/update-bank-details/${id}`,
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

  // const handleOTPVerifyAndExport = async () => {
  //   try {
  //     // ✅ Step 1: Request OTP to be sent
  //     const sendRes = await fetch("https://backend-three-pink.vercel.app/api/otpRouteForExport/send-otp", {
  //       method: "POST",
  //     });

  //     if (!sendRes.ok) {
  //       alert("Failed to send OTP. Please try again.");
  //       return;
  //     }

  //     // ✅ Step 2: Ask user for OTP input
  //     const otp = prompt("Enter the OTP sent to your email:");

  //     if (!otp) {
  //       alert("OTP is required to proceed.");
  //       return;
  //     }

  //     // ✅ Step 3: Verify OTP
  //     const verifyRes = await fetch("https://backend-three-pink.vercel.app/api/otpRouteForExport/verify-otp", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ otp }),
  //     });

  //     const verifyData = await verifyRes.json();

  //     if (verifyRes.ok && verifyData.success) {
  //       // ✅ Step 4: OTP verified — proceed to export
  //       exportBankDataToCSV();
  //     } else {
  //       alert("Invalid OTP. Export cancelled.");
  //     }
  //   } catch (err) {
  //     console.error("❌ OTP export error:", err);
  //     alert("An error occurred. Please try again.");
  //   }
  // };
  const handleOTPVerifyAndExport = async () => {
    try {
      if (!otpInput) {
        alert("Please enter the OTP.");
        return;
      }

      const verifyRes = await fetch(
        "https://backend-three-pink.vercel.app/api/otpRouteForExport/verify-otp",
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
      {renderMenuBar()}
      <div className="app-content">
        <Header dashboardType="Admin Dashboard" />

        <div className="max-w-7xl w-full pt-4 h-full">
          <h2 className="text-2xl font-extrabold text-gray-500 dark:text-white text-center tracking-wide">
            Bank Details
          </h2>

          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md shadow-md space-y-4">
            {/* ✅ First Line: Buttons */}
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div className="flex gap-4">
                <button
                  className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-md transition-all duration-300 hover:bg-blue-700 active:scale-95"
                  onClick={() => setShowAddModal(true)}
                >
                  + Add New
                </button>
                {/* <button
                  onClick={handleOTPVerifyAndExport}
                  className="px-6 py-2 bg-green-600 text-white font-semibold rounded-md shadow-md transition-all duration-300 hover:bg-green-700 active:scale-95"
                >
                  Export Data
                </button> */}
                <button
                  onClick={() => {
                    fetch(
                      "https://backend-three-pink.vercel.app/api/otpRouteForExport/send-otp",
                      {
                        method: "POST",
                      }
                    )
                      .then((res) => {
                        if (!res.ok) throw new Error("Failed to send OTP");
                        alert("OTP sent to your email.");
                        setOtpModalOpen(true); // ✅ Show the OTP modal
                      })
                      .catch((err) => {
                        console.error("❌ OTP send error:", err);
                        alert("Failed to send OTP.");
                      });
                  }}
                  className="px-6 py-2 bg-green-600 text-white font-semibold rounded-md shadow-md transition-all duration-300 hover:bg-green-700 active:scale-95"
                >
                  Export Data
                </button>

                <button
                  onClick={handleDownloadTemplate}
                  className="px-6 py-2 bg-yellow-500 text-white font-semibold rounded-md shadow-md transition-all duration-300 hover:bg-yellow-600 active:scale-95"
                >
                  Download Template
                </button>

                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleExcelImport}
                  className="hidden"
                  id="upload-excel"
                />
                <label
                  htmlFor="upload-excel"
                  className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-md shadow-md transition-all duration-300 hover:bg-purple-700 active:scale-95 cursor-pointer"
                >
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
              <div className="w-[175vh] h-[55vh] overflow-x-auto border rounded-md">
                <div className="min-w-full">
                  <table className="table-fixed min-w-full text-sm text-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-700 shadow-md rounded-lg overflow-hidden">
                    {/* <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[13px] font-semibold uppercase tracking-wider shadow-sm rounded-t-md">
                      <tr>
                        <th className="px-6 py-3 text-left whitespace-nowrap border-r border-blue-500">
                          <i className="fas fa-user mr-1"></i> Client Name
                        </th>
                        <th className="px-6 py-3 text-left whitespace-nowrap border-r border-blue-500">
                          <i className="fas fa-building mr-1"></i> Business
                        </th>
                        <th className="px-6 py-3 text-left whitespace-nowrap border-r border-blue-500">
                          <i className="fas fa-university mr-1"></i> Bank
                        </th>
                        <th className="px-6 py-3 text-left whitespace-nowrap border-r border-blue-500">
                          <i className="fas fa-user-tie mr-1"></i> Manager
                        </th>
                        <th className="px-6 py-3 text-left whitespace-nowrap border-r border-blue-500">
                          <i className="fas fa-briefcase mr-1"></i> Post
                        </th>
                        <th className="px-6 py-3 text-left whitespace-nowrap border-r border-blue-500">
                          <i className="fas fa-phone-alt mr-1"></i> Contact
                        </th>
                        <th className="px-6 py-3 text-left whitespace-nowrap border-r border-blue-500">
                          <i className="fas fa-envelope mr-1"></i> Email
                        </th>
                        <th className="px-6 py-3 text-left whitespace-nowrap border-r border-blue-500">
                          <i className="fas fa-code mr-1"></i> IFSC
                        </th>
                        <th className="px-6 py-3 text-left whitespace-nowrap">
                          <i className="fas fa-city mr-1"></i> City
                        </th>
                      </tr>
                    </thead>

                    <tbody className=" dark:bg-gray-900 text-gray-800 dark:text-gray-200 text-sm">
                      {filteredData.map((detail, index) => (
                        <tr
                          key={index}
                          className={`transition duration-200 ${
                            index % 2 === 0
                              ? " dark:bg-gray-900"
                              : "bg-gray-50 dark:bg-gray-800"
                          } hover:bg-blue-50 dark:hover:bg-gray-700`}
                        >
                          <td
                            className="px-6 py-3 whitespace-nowrap truncate"
                            title={detail.clientName}
                          >
                            <i className="fas fa-user mr-2 text-blue-500" />{" "}
                            {detail.clientName || "N/A"}
                          </td>
                          <td
                            className="px-6 py-3 whitespace-nowrap truncate"
                            title={detail.businessName}
                          >
                            <i className="fas fa-briefcase mr-2 text-indigo-500" />{" "}
                            {detail.businessName || "N/A"}
                          </td>
                          <td
                            className="px-6 py-3 whitespace-nowrap truncate"
                            title={detail.bankDetails?.Bank}
                          >
                            <i className="fas fa-university mr-2 text-green-600" />{" "}
                            {detail.bankDetails?.Bank || "N/A"}
                          </td>
                          <td
                            className="px-6 py-3 whitespace-nowrap truncate"
                            title={detail.bankDetails?.BankManagerName}
                          >
                            <i className="fas fa-user-tie mr-2 text-yellow-500" />{" "}
                            {detail.bankDetails?.BankManagerName || "N/A"}
                          </td>
                          <td
                            className="px-6 py-3 whitespace-nowrap truncate"
                            title={detail.bankDetails?.Post}
                          >
                            <i className="fas fa-id-badge mr-2 text-cyan-500" />{" "}
                            {detail.bankDetails?.Post || "N/A"}
                          </td>
                          <td
                            className="px-6 py-3 whitespace-nowrap truncate"
                            title={detail.bankDetails?.ContactNo}
                          >
                            <i className="fas fa-phone-alt mr-2 text-red-500" />{" "}
                            {detail.bankDetails?.ContactNo || "N/A"}
                          </td>
                          <td
                            className="px-6 py-3 whitespace-nowrap truncate"
                            title={detail.bankDetails?.EmailId}
                          >
                            <i className="fas fa-envelope mr-2 text-orange-500" />{" "}
                            {detail.bankDetails?.EmailId || "N/A"}
                          </td>
                          <td
                            className="px-6 py-3 whitespace-nowrap truncate"
                            title={detail.bankDetails?.IFSCCode}
                          >
                            <i className="fas fa-barcode mr-2 text-gray-600" />{" "}
                            {detail.bankDetails?.IFSCCode || "N/A"}
                          </td>
                          <td
                            className="px-6 py-3 whitespace-nowrap truncate"
                            title={detail.bankDetails?.City}
                          >
                            <i className="fas fa-city mr-2 text-purple-500" />{" "}
                            {detail.bankDetails?.City || "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody> */}
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
                        <th className="px-6 py-3 text-left border-r border-blue-500">
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
                            className={`transition duration-200 ${
                              index % 2 === 0
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
                    {
                      label: "Business Name",
                      name: "businessName",
                      type: "text",
                      placeholder: "Enter Business Name",
                    },
                    {
                      label: "Client Name",
                      name: "clientName",
                      type: "text",
                      placeholder: "Enter Client Name",
                    },
                    {
                      label: "Bank Name",
                      name: "bankName",
                      type: "text",
                      placeholder: "Enter Bank Name",
                    },
                    {
                      label: "Manager Name",
                      name: "managerName",
                      type: "text",
                      placeholder: "Enter Manager Name",
                    },
                    {
                      label: "Post",
                      name: "post",
                      type: "text",
                      placeholder: "Enter Post",
                    },
                    {
                      label: "Contact Number",
                      name: "contactNo",
                      type: "text",
                      placeholder: "Enter Contact No",
                    },
                    {
                      label: "Email",
                      name: "emailId",
                      type: "email",
                      placeholder: "Enter Email",
                    },
                    {
                      label: "IFSC Code",
                      name: "ifscCode",
                      type: "text",
                      placeholder: "Enter IFSC Code",
                    },
                    {
                      label: "City",
                      name: "city",
                      type: "text",
                      placeholder: "Enter City",
                    },
                    {
                      label: "Branch Address",
                      name: "branchAddress",
                      type: "text",
                      placeholder: "Enter Branch Address",
                    },
                  ].map((field, i) => (
                    <div key={i}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                        {field.label}
                      </label>
                      <input
                        type={field.type}
                        name={field.name}
                        value={newBankDetails[field.name]}
                        onChange={handleInputChange}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
                      />
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
