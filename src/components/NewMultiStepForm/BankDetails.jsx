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

        <div className="max-w-7xl w-full pt-4 h-[600px] overflow-auto">
          <h2 className="text-2xl font-extrabold text-gray-500 dark:text-white mb-8 text-center tracking-wide">
            Bank Details
          </h2>

          {/* ✅ Filter Section */}
          <div className="flex flex-wrap gap-6 justify-between items-center mb-6 bg-gray-50 dark:bg-gray-800 p-2 rounded-md shadow-md">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
              {filteredData.map((detail, index) => (
                <div
                  key={index}
                  className="bg-white/60 dark:bg-gray-800 backdrop-blur-lg shadow-xl border border-gray-200 rounded-xl overflow-hidden transform transition duration-300  hover:shadow-2xl"
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-blue-400 to-blue-600 text-white text-center py-3">

                    <h3 className="text-lg font-semibold tracking-wide">
                      {detail.clientName || "N/A"}
                    </h3>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    {/* Business name */}
                    <p className="text-gray-700 dark:text-gray-100 flex items-center">

                      <FontAwesomeIcon
                        icon={faUniversity}
                        className="h-3 w-3 text-gray-500 dark:text-gray-50 mr-3"
                      />
                      <span className="font-semibold w-40">Business:</span>{" "}
                      {detail.businessName || "N/A"}
                    </p>

                    {/* Bank */}
                    <p className="text-gray-700 dark:text-gray-100 flex items-center">

                      <FontAwesomeIcon
                        icon={faUniversity}
                        className="h-3 w-3 text-gray-500 dark:text-gray-50 mr-3"
                      />
                      <span className="font-semibold w-40">Bank:</span>{" "}
                      {detail.bankDetails.Bank || "N/A"}
                    </p>

                    {/* Manager */}
                    <p className="text-gray-700 dark:text-gray-100 flex items-center">

                      <FontAwesomeIcon
                        icon={faUserTie}
                        className="h-3 w-3 text-gray-500 dark:text-gray-50 mr-3"
                      />
                      <span className="font-semibold w-40">Manager:</span>{" "}
                      {detail.bankDetails.BankManagerName || "N/A"}
                    </p>

                    {/* Post */}
                    <p className="text-gray-700 dark:text-gray-100 flex items-center">

                      <FontAwesomeIcon
                        icon={faBriefcase}
                        className="h-3 w-3 text-gray-500 dark:text-gray-50 mr-3"
                      />
                      <span className="font-semibold w-40">Post:</span>{" "}
                      {detail.bankDetails.Post || "N/A"}
                    </p>

                    {/* Contact */}
                    <p className="text-gray-700 dark:text-gray-100 flex items-center">

                      <FontAwesomeIcon
                        icon={faPhone}
                        className="h-3 w-3 text-gray-500 dark:text-gray-50 mr-3"
                      />
                      <span className="font-semibold w-40">Contact:</span>{" "}
                      {detail.bankDetails.ContactNo || "N/A"}
                    </p>

                    {/* Email */}
                    <p className="text-gray-700 dark:text-gray-100 flex items-center">

                      <FontAwesomeIcon
                        icon={faEnvelope}
                        className="h-3 w-3 text-gray-500 dark:text-gray-50 mr-3"
                      />
                      <span className="font-semibold w-40">Email:</span>{" "}
                      {detail.bankDetails.EmailId || "N/A"}
                    </p>

                    {/* IFSC Code */}
                    <p className="text-gray-700 dark:text-gray-100 flex items-center">

                      <FontAwesomeIcon
                        icon={faHashtag}
                        className="h-3 w-3 text-gray-500 dark:text-gray-50 mr-3"
                      />
                      <span className="font-semibold w-40">IFSC:</span>{" "}
                      {detail.bankDetails.IFSCCode || "N/A"}
                    </p>

                    {/* City */}
                    <p className="text-gray-700 dark:text-gray-100 flex items-center">

                      <FontAwesomeIcon
                        icon={faMapMarkerAlt}
                        className="h-3 w-3 text-gray-500 dark:text-gray-50 mr-3"
                      />
                      <span className="font-semibold w-40">City:</span>{" "}
                      {detail.bankDetails.City || "N/A"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-lg text-gray-200">
              No bank details available.
            </p>
          )}

          {showAddModal && (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-30 backdrop-blur-md flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-3xl">
                {/* ✅ Title */}
                <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">
                  Add New Bank Details
                </h2>

                {/* ✅ Form Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* ✅ Business Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Name
                    </label>
                    <input
                      type="text"
                      name="businessName"
                      value={newBankDetails.businessName}
                      onChange={handleInputChange}
                      placeholder="Enter Business Name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 transition"
                    />
                  </div>

                  {/* ✅ Client Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client Name
                    </label>
                    <input
                      type="text"
                      name="clientName"
                      value={newBankDetails.clientName}
                      onChange={handleInputChange}
                      placeholder="Enter Client Name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 transition"
                    />
                  </div>

                  {/* ✅ Bank Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      name="bankName"
                      value={newBankDetails.bankName}
                      onChange={handleInputChange}
                      placeholder="Enter Bank Name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 transition"
                    />
                  </div>

                  {/* ✅ Manager Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Manager Name
                    </label>
                    <input
                      type="text"
                      name="managerName"
                      value={newBankDetails.managerName}
                      onChange={handleInputChange}
                      placeholder="Enter Manager Name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 transition"
                    />
                  </div>

                  {/* ✅ Post */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Post
                    </label>
                    <input
                      type="text"
                      name="post"
                      value={newBankDetails.post}
                      onChange={handleInputChange}
                      placeholder="Enter Post"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 transition"
                    />
                  </div>

                  {/* ✅ Contact Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Number
                    </label>
                    <input
                      type="text"
                      name="contactNo"
                      value={newBankDetails.contactNo}
                      onChange={handleInputChange}
                      placeholder="Enter Contact No"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 transition"
                    />
                  </div>

                  {/* ✅ Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="emailId"
                      value={newBankDetails.emailId}
                      onChange={handleInputChange}
                      placeholder="Enter Email"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 transition"
                    />
                  </div>

                  {/* ✅ IFSC Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      name="ifscCode"
                      value={newBankDetails.ifscCode}
                      onChange={handleInputChange}
                      placeholder="Enter IFSC Code"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 transition"
                    />
                  </div>

                  {/* ✅ City */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={newBankDetails.city}
                      onChange={handleInputChange}
                      placeholder="Enter City"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 transition"
                    />
                  </div>
                </div>

                {/* ✅ Buttons */}
                <div className="flex justify-end gap-4 mt-6">
                  {/* ✅ Cancel Button */}
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="px-5 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 transition rounded-lg"
                  >
                    Cancel
                  </button>

                  {/* ✅ Submit Button */}
                  <button
                    onClick={handleAddBank}
                    className="px-5 py-2 bg-blue-500 text-white hover:bg-blue-600 transition rounded-lg shadow-md"
                  >
                    Submit
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
