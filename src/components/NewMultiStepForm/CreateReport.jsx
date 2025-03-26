import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import MenuBar from "./MenuBar";

const CreateReport = ({ userRole, userName }) => {


   const [permissions, setPermissions] = useState({
      createReport: false,
      updateReport: false,
      createNewWithExisting: false,
      downloadPDF: false,
      exportData: false, // ✅ Add this
    });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        // Fetching all employees
        const response = await fetch("https://backend-three-pink.vercel.app/api/employees");
        
        // Check if the response is successful
        if (!response.ok) {
          throw new Error("Failed to fetch employees");
        }
        
        const result = await response.json();
        console.log("✅ Fetched Employees Data:", result);
        
        const employees = Array.isArray(result) ? result : [];

        // Assign permissions based on userRole
        if (userRole === "admin") {
          setPermissions({
            createReport: true,
            updateReport: true,
            createNewWithExisting: true,
            downloadPDF: true,
          });
          console.log("✅ Admin permissions granted");
        } else if (userRole === "employee") {
          // Normalize the userName to lowercase and trim spaces
          const normalizedUserName = userName?.trim().toLowerCase();

          // Find the employee based on name, email, or employeeId
          const employee = employees.find(
            (emp) =>
              (emp.name?.trim().toLowerCase() === normalizedUserName) ||
              (emp.email?.trim().toLowerCase() === normalizedUserName) ||
              (emp.employeeId?.trim().toLowerCase() === normalizedUserName)
          );

          // Set permissions if employee is found
          if (employee && employee.permissions) {
            setPermissions(employee.permissions);
            console.log("✅ Permissions fetched for employee:", employee.permissions);
          } else {
            console.warn("⚠️ No matching employee found or permissions missing");
          }
        }
      } catch (err) {
        console.error("🔥 Error fetching permissions:", err.message);
      }
    };

    // Fetch permissions when the component mounts or when userRole/userName changes
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