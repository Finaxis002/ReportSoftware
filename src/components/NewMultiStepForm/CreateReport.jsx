import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import MenuBar from "./MenuBar";

const CreateReport = ({ userRole, userName }) => {
  const [permissions, setPermissions] = useState({
    createReport: false,
    updateReport: false,
    createNewWithExisting: false,
    downloadPDF: false,
  });

  const navigate = useNavigate();

  // ✅ Fetch permissions from backend
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/employees");
        if (!response.ok) {
          throw new Error("Failed to fetch employees");
        }

        const data = await response.json();
        console.log("Fetched Employees Data:", data);

        if (userRole === "admin") {
          // ✅ Grant full permissions if admin
          setPermissions({
            createReport: true,
            updateReport: true,
            createNewWithExisting: true,
            downloadPDF: true,
          });
        } else if (userRole === "employee") {
          // ✅ Find the logged-in employee's permissions
          const employee = data.find((emp) => emp.name === userName);
          if (employee) {
            setPermissions(employee.permissions);
          }
        }
      } catch (err) {
        console.error("Error fetching permissions:", err);
      }
    };

    fetchPermissions();
  }, [userRole, userName]);

  console.log("✅ User Role:", userRole);
  console.log("✅ User Name:", userName);
  console.log("✅ Permissions:", permissions);

  // ✅ Render the menu bar based on user role
  const renderMenuBar = () => {
    if (!userRole) {
      navigate("/login");
      return null;
    }

    switch (userRole) {
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

  // ✅ Handle Create Report click
  const handleCreateReportClick = () => {
    localStorage.removeItem("FirstStepBasicDetails");
  };

  return (
    <div className="flex h-[100vh]">
      {renderMenuBar()}
      <div className="App md:w-[80%] mx-auto shadow-xl rounded-2xl pb-2 bg-white">
        <div className="container horizontal mt-5"></div>

        <div className="my-5"></div>

        {/* ✅ Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5">
          {/* ✅ Create Report Card */}
          {(userRole === "admin" || permissions.createReport) && (
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
          )}

          {/* ✅ Update Report Card */}
          {(userRole === "admin" || permissions.updateReport) && (
            <div className="bg-yellow-100 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-xl font-semibold text-center">
                Update Report
              </h3>
              <p className="text-center mt-4">
                Edit or update an existing report.
              </p>
              <Link
                to="/MultestepForm"
                state={{ isUpdateReportClicked: true }}
              >
                <button className="mt-4 px-6 py-2 bg-yellow-500 text-white rounded-lg w-full">
                  Update Report
                </button>
              </Link>
            </div>
          )}

          {/* ✅ Create New with Existing Card */}
          {(userRole === "admin" || permissions.createNewWithExisting) && (
            <div className="bg-green-100 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-xl font-semibold text-center">
                Create New with Existing
              </h3>
              <p className="text-center mt-4">
                Start a new report using an existing template.
              </p>
              <Link
                to="/MultestepForm"
                state={{ isCreateReportWithExistingClicked: true }}
              >
                <button className="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg w-full">
                  Create New with Existing
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateReport;