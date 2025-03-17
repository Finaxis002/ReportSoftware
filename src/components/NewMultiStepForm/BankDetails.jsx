import React, { useEffect, useState , useMemo} from "react";
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

  useEffect(() => {
    const fetchBankDetails = async () => {
      try {
        const response = await fetch("https://backend-three-pink.vercel.app/api/bank-details");
        if (!response.ok) {
          throw new Error("Failed to fetch bank details");
        }
        const data = await response.json();

        // ✅ Filter out empty bank details
        const filteredData = data.filter(
          (item) =>
            item.bankDetails &&
            Object.values(item.bankDetails).some((val) => val !== "")
        );

        setBankDetails(filteredData);

        // ✅ Extract unique Bank options
        const uniqueBanks = filteredData.reduce((acc, item) => {
          const bank = item.bankDetails?.Bank || "Unknown Bank";
          const ifsc = item.bankDetails?.IFSCCode || "N/A";
          const label = `${bank} (${ifsc})`;
          if (!acc.some((option) => option.label === label)) {
            acc.push({
              label,
              value: ifsc,
            });
          }
          return acc;
        }, []);

        setBankOptions(uniqueBanks);

        // ✅ Extract unique Manager options
        const uniqueManagers = filteredData.reduce((acc, item) => {
          const manager =
            item.bankDetails?.BankManagerName || "Unknown Manager";
          if (!acc.some((option) => option.label === manager)) {
            acc.push({
              label: manager,
              value: manager,
            });
          }
          return acc;
        }, []);

        setManagerOptions(uniqueManagers);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBankDetails();
  }, []);


  const filteredData = useMemo(() => {
    return bankDetails
      .filter((detail) => {
        // ✅ Filter by Bank (IFSC)
        if (selectedBank) {
          const bank = detail.bankDetails?.Bank || "";
          const ifsc = detail.bankDetails?.IFSCCode || "";
          const label = `${bank} (${ifsc})`;
          if (!label.includes(selectedBank)) return false;
        }
  
        // ✅ Filter by Manager
        if (selectedManager) {
          const manager = detail.bankDetails?.BankManagerName || "";
          if (!manager.includes(selectedManager)) return false;
        }
  
        // ✅ Filter by IFSC Code
        if (selectedIFSC) {
          const ifsc = detail.bankDetails?.IFSCCode || "";
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

  
  return (
    <div className="flex h-[100vh]">
      {renderMenuBar()}
      <div className="app-content">
        <Header dashboardType="Admin Dashboard" />

        <div className="max-w-7xl w-full pt-4 h-[600px] overflow-auto">
          <h2 className="text-2xl font-extrabold text-gray-500 mb-8 text-center tracking-wide">
            Bank Details
          </h2>

          {/* ✅ Filter Section */}
          <div className="flex flex-wrap gap-4 justify-center mb-6">
            {/* ✅ Bank Name Filter */}
            <div className="w-full sm:w-1/3">
              <label className="block text-gray-700 font-semibold mb-1">
                Bank Name (IFSC)
              </label>
              <Select
                options={bankOptions}
                value={bankOptions.find(
                  (option) => option.value === selectedBank
                )}
                onChange={(option) => setSelectedBank(option?.value)}
                placeholder="Select Bank"
                isClearable
                className="shadow-md"
              />
            </div>

            {/* ✅ Manager Name Filter */}
            <div className="w-full sm:w-1/3">
              <label className="block text-gray-700 font-semibold mb-1">
                Manager Name
              </label>
              <Select
                options={managerOptions}
                value={managerOptions.find(
                  (option) => option.value === selectedManager
                )}
                onChange={(option) => setSelectedManager(option?.value)}
                placeholder="Select Manager"
                isClearable
                className="shadow-md"
              />
            </div>
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
        className="bg-white/60 backdrop-blur-lg shadow-xl border border-gray-200 rounded-xl overflow-hidden transform transition duration-300  hover:shadow-2xl"
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
          <p className="text-gray-700 flex items-center">
            <FontAwesomeIcon
              icon={faUniversity}
              className="h-3 w-3 text-gray-500 mr-3"
            />
            <span className="font-semibold w-40">Business:</span>{" "}
            {detail.businessName || "N/A"}
          </p>

          {/* Bank */}
          <p className="text-gray-700 flex items-center">
            <FontAwesomeIcon
              icon={faUniversity}
              className="h-3 w-3 text-gray-500 mr-3"
            />
            <span className="font-semibold w-40">Bank:</span>{" "}
            {detail.bankDetails.Bank || "N/A"}
          </p>

          {/* Manager */}
          <p className="text-gray-700 flex items-center">
            <FontAwesomeIcon
              icon={faUserTie}
              className="h-3 w-3 text-gray-500 mr-3"
            />
            <span className="font-semibold w-40">Manager:</span>{" "}
            {detail.bankDetails.BankManagerName || "N/A"}
          </p>

          {/* Post */}
          <p className="text-gray-700 flex items-center">
            <FontAwesomeIcon
              icon={faBriefcase}
              className="h-3 w-3 text-gray-500 mr-3"
            />
            <span className="font-semibold w-40">Post:</span>{" "}
            {detail.bankDetails.Post || "N/A"}
          </p>

          {/* Contact */}
          <p className="text-gray-700 flex items-center">
            <FontAwesomeIcon
              icon={faPhone}
              className="h-3 w-3 text-gray-500 mr-3"
            />
            <span className="font-semibold w-40">Contact:</span>{" "}
            {detail.bankDetails.ContactNo || "N/A"}
          </p>

          {/* Email */}
          <p className="text-gray-700 flex items-center">
            <FontAwesomeIcon
              icon={faEnvelope}
              className="h-3 w-3 text-gray-500 mr-3"
            />
            <span className="font-semibold w-40">Email:</span>{" "}
            {detail.bankDetails.EmailId || "N/A"}
          </p>

          {/* IFSC Code */}
          <p className="text-gray-700 flex items-center">
            <FontAwesomeIcon
              icon={faHashtag}
              className="h-3 w-3 text-gray-500 mr-3"
            />
            <span className="font-semibold w-40">IFSC:</span>{" "}
            {detail.bankDetails.IFSCCode || "N/A"}
          </p>

          {/* City */}
          <p className="text-gray-700 flex items-center">
            <FontAwesomeIcon
              icon={faMapMarkerAlt}
              className="h-3 w-3 text-gray-500 mr-3"
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

        </div>
      </div>
    </div>
  );
};

export default BankDetails;
