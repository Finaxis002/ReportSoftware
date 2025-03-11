import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom"; // Ensure you import navigate hook if not done
import MenuBar from "./MenuBar";

const CreateReport = () => {
  const [isCreateReportClicked, setIsCreateReportClicked] = useState(false);
  const [
    isCreateReportWithExistingClicked,
    setIsCreateReportWithExistingClicked,
  ] = useState(false);

  const navigate = useNavigate();

  const renderMenuBar = () => {
    const authRole = localStorage.getItem("userRole"); // Get the role from localStorage or state

    // Check if authRole exists, and if it's a valid role
    if (!authRole) {
      navigate("/login"); // If there's no role, redirect to login
      return null; // Optionally render nothing while redirecting
    }

    switch (authRole) {
      case "admin":
        return <MenuBar userRole="admin" />;
      case "employee":
        return <MenuBar userRole="employee" />;
      case "client":
        return <MenuBar userRole="client" />;
      default:
        navigate("/login"); // If role doesn't match, redirect to login
        return null;
    }
  };

  const handleCreateReportClick = () => {
    // Clear the localStorage data when Create Report is clicked
    localStorage.removeItem("FirstStepBasicDetails");
    setIsCreateReportClicked(true);
  };

  

  return (
    <div className="flex h-[100vh]">
      {renderMenuBar()}
      <div className="App md:w-[80%] mx-auto shadow-xl rounded-2xl pb-2 bg-white">
        <div className="container horizontal mt-5"></div>

        <div className="my-5"></div>

        {/* Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5">
          {/* New Report Card */}
          <div className="bg-blue-100 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold text-center">New Report</h3>
            <p className="text-center mt-4">
              Create a fresh report from scratch.
            </p>
            <Link
              to="/MultestepForm"
              onClick={handleCreateReportClick}
              state={{ isCreateReportClicked: true }}
            >
              <button className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg w-full">
                Create Report
              </button>
            </Link>
          </div>

          {/* Update Report Card */}
          <div className="bg-yellow-100 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold text-center">Update Report</h3>
            <p className="text-center mt-4">
              Edit or update an existing report.
            </p>
            <Link to="/MultestepForm" state={{ isUpdateReportClicked: true }}>
              <button className="mt-4 px-6 py-2 bg-yellow-500 text-white rounded-lg w-full">
                Update Report
              </button>
            </Link>
          </div>

          {/* Create New with Existing Card */}
          <div className="bg-green-100 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold text-center">
              Create New with Existing
            </h3>
            <p className="text-center mt-4">
              Start a new report using an existing template.
            </p>
            <Link
              to="/MultestepForm"
              state={{ isCreateReportWithExistingClicked: true }} // ✅ Pass state directly
            >
              <button className="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg w-full">
                Create New with Existing
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateReport;
