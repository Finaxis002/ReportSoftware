import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MenuBar from "../MenuBar";
import Header from "../Header";
import ReportDropdown from "../Dropdown/ReportDropdown";
import CmaReportGenerator from "../CmaReport/CmaReportGenerator";

const CmaPage = ({ userRole }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect immediately if no userRole
  useEffect(() => {
    if (!userRole) navigate("/login");
  }, [userRole, navigate]);


  // Get initial form data
  const initialFormData = location.state?.formData || null;
  const initialBusinessDescription =
    initialFormData?.AccountInformation?.businessDescription || "";
  const initialBep =
    initialFormData?.computedData?.breakEvenPointPercentage
      ?.breakEvenPointPercentage?.[1] || "";

  const [businessData, setBusinessData] = useState(initialFormData);
  const [businessDescription, setBusinessDescription] = useState(
    initialBusinessDescription
  );
  const [bep, setBep] = useState(initialBep);
  const [sections, setSections] = useState({});
  const [loading, setLoading] = useState(false);
  const [showProjectReport, setShowProjectReport] = useState(false);
  const [error, setError] = useState("");

  const renderMenuBar = () => {
    switch (userRole) {
      case "admin":
        return <MenuBar userRole="admin" />;
      case "employee":
        return <MenuBar userRole="employee" />;
      case "client":
        return <MenuBar userRole="client" />;
      default:
        return null;
    }
  };

  function handleBusinessSelect(data) {
    setBusinessData(data);
    setBusinessDescription(data?.AccountInformation?.businessDescription || "");
    setBep(
      data?.computedData?.breakEvenPointPercentage
        ?.breakEvenPointPercentage?.[1] || ""
    );
    setSections({});
    setShowProjectReport(false);
    setError("");
  }

  const formData = businessData;

  console.log("formData :" , formData?.AccountInformation)

  return (
    <div className="flex h-[100vh]">
      {renderMenuBar()}
      <div className="app-content">
        <Header
          dashboardType={
            userRole === "admin" ? "Admin Dashboard" : "User Dashboard"
          }
        />
        <div className="w-full bg-white dark:bg-gray-900/90 backdrop-blur-lg rounded-xl shadow-sm px-6 py-6 border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-md mb-6">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
            <div className="flex items-center gap-3 flex-shrink-0">
              <svg
                className="w-5 h-5 text-teal-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h2 className="text-lg md:text-xl font-normal text-teal-500 ">
                Select Project Report
              </h2>
            </div>
            <div className="w-full md:w-auto flex-1 max-w-2xl">
              <ReportDropdown
                onBusinessSelect={handleBusinessSelect}
                className="w-full"
              />
            </div>
          </div>      
        </div>

         <CmaReportGenerator formData={formData}/>
      </div>
    </div>
  );
};

export default CmaPage;
