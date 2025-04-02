import React, { useEffect, useState, useMemo } from "react";
import MenuBar from "./MenuBar";
import Select from "react-select";
import Header from "../NewMultiStepForm/Header";
import {
  faUniversity,
  faUserTie,
  faBriefcase,
  faPhone,
  faEnvelope,
  faHashtag,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";

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
  });

  // useEffect(() => {
  //   const fetchBankDetails = async () => {
  //     try {
  //       const response = await fetch(
  //         "https://backend-three-pink.vercel.app/api/bank-details"
  //       );
  //       if (!response.ok) {
  //         throw new Error("Failed to fetch bank details");
  //       }
  //       const data = await response.json();

  //       // ✅ Filter out empty bank details
  //       const filteredData = data.filter(
  //         (item) =>
  //           item.bankDetails &&
  //           Object.values(item.bankDetails).some((val) => val !== "")
  //       );

  //       setBankDetails(filteredData);

  //       // ✅ Extract unique Bank options
  //       const uniqueBanks = filteredData.reduce((acc, item) => {
  //         const bank = item.bankDetails?.Bank || "Unknown Bank";
  //         const ifsc = item.bankDetails?.IFSCCode || "N/A";
  //         const label = `${bank} (${ifsc})`;
  //         if (!acc.some((option) => option.label === label)) {
  //           acc.push({
  //             label,
  //             value: ifsc,
  //           });
  //         }
  //         return acc;
  //       }, []);

  //       setBankOptions(uniqueBanks);

  //       // ✅ Extract unique Manager options
  //       const uniqueManagers = filteredData.reduce((acc, item) => {
  //         const manager =
  //           item.bankDetails?.BankManagerName || "Unknown Manager";
  //         if (!acc.some((option) => option.label === manager)) {
  //           acc.push({
  //             label: manager,
  //             value: manager,
  //           });
  //         }
  //         return acc;
  //       }, []);

  //       setManagerOptions(uniqueManagers);
  //     } catch (err) {
  //       setError(err.message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchBankDetails();
  // }, []);

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
        const combinedData = [
          ...(data1?.data || []).map((item) => ({
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
            },
          })),
          ...(data2 || []).map((item) => ({
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

      return true;
    });
  }, [bankDetails, selectedBank, selectedManager, selectedIFSC]);

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

  return (
    <div className="flex h-[100vh]">
      {renderMenuBar()}
      <div className="app-content">
        <Header dashboardType="Admin Dashboard" />

        <div className="max-w-7xl w-full pt-4 h-full">
          <h2 className="text-2xl font-extrabold text-gray-500 dark:text-white text-center tracking-wide">
            Bank Details
          </h2>

          {/* ✅ Filter Section */}
          <div className="flex flex-wrap gap-6 justify-between items-center bg-gray-50 dark:bg-gray-800 p-2 rounded-md shadow-md">
            {/* ✅ Add New Button */}
            <button
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-md transition-all duration-300 hover:bg-blue-700 active:scale-95"
              onClick={() => setShowAddModal(true)}
            >
              + Add New
            </button>
            {/* ✅ Bank Name Filter */}
            <div className="w-full sm:w-1/3">
              <label className="block text-gray-800 dark:text-gray-200 font-medium mb-2">
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
                className="dark:bg-black"
              />
            </div>
            {/* ✅ Manager Name Filter */}
            <div className="w-full sm:w-1/3">
              <label className="block text-gray-800 dark:text-gray-200 font-medium mb-2">
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
            {/* <div className="flex justify-between mb-4">
              <button
                onClick={exportManagersToCSV}
                className="px-6 py-2 bg-green-600 text-white font-semibold rounded-md shadow-md transition-all duration-300 hover:bg-green-700 active:scale-95"
              >
                Export Managers
              </button>
            </div> */}

            <button
              onClick={exportBankDataToCSV}
              className="px-6 py-2 bg-green-600 text-white font-semibold rounded-md shadow-md transition-all duration-300 hover:bg-green-700 active:scale-95"
            >
              Export Data
            </button>
          </div>

          {loading ? (
            <p className="text-center text-lg text-gray-100 animate-pulse">
              Loading bank details...
            </p>
          ) : error ? (
            <p className="text-center text-lg text-red-400">{error}</p>
          ) : filteredData.length > 0 ? (
            <div className="relative w-full max-w-full ">
              <div className="w-[175vh] h-[55vh] overflow-x-auto border rounded-md">
                <div className="min-w-full">
                  <table className="table-fixed min-w-full text-sm text-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-700 shadow-md rounded-lg overflow-hidden">
                    <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[13px] font-semibold uppercase tracking-wider shadow-sm rounded-t-md">
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
               <i className="fas fa-university text-blue-600 text-xl"></i> Add New Bank Details
             </h2>
         
             {/* Form Grid */}
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               {[
                 { label: "Business Name", name: "businessName", type: "text", placeholder: "Enter Business Name" },
                 { label: "Client Name", name: "clientName", type: "text", placeholder: "Enter Client Name" },
                 { label: "Bank Name", name: "bankName", type: "text", placeholder: "Enter Bank Name" },
                 { label: "Manager Name", name: "managerName", type: "text", placeholder: "Enter Manager Name" },
                 { label: "Post", name: "post", type: "text", placeholder: "Enter Post" },
                 { label: "Contact Number", name: "contactNo", type: "text", placeholder: "Enter Contact No" },
                 { label: "Email", name: "emailId", type: "email", placeholder: "Enter Email" },
                 { label: "IFSC Code", name: "ifscCode", type: "text", placeholder: "Enter IFSC Code" },
                 { label: "City", name: "city", type: "text", placeholder: "Enter City" },
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
                 onClick={handleAddBank}
                 className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-md"
               >
                 <i className="fas fa-paper-plane mr-2"></i> Submit
               </button>
             </div>
           </div>
         </div>
         
          )}
        </div>
      </div>
    </div>
  );
};

export default BankDetails;
