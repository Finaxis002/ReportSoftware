import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import MenuBar from "./MenuBar";
import Header from "./Header";
import { availableMemory } from "process";

const CreateReport = ({ userRole }) => {
  const userName =
    localStorage.getItem("adminName") || localStorage.getItem("employeeName");

  const [permissions, setPermissions] = useState({
    generateReport: false,
    updateReport: false,
    createNewWithExisting: false,
    downloadPDF: false,
    exportData: false, // ✅ Add this
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        // Fetch both employees and admins
        const [empRes, adminRes] = await Promise.all([
          fetch("https://backend-three-pink.vercel.app/api/employees"),
          fetch("https://backend-three-pink.vercel.app/api/admins"),
        ]);

        if (!empRes.ok || !adminRes.ok) {
          throw new Error("Failed to fetch employee or admin data");
        }

        const employeeList = await empRes.json();
        const adminList = await adminRes.json();

        const normalizedUserName = userName?.trim().toLowerCase();

        if (userRole === "admin") {
          // ✅ Check if this admin exists in adminList
          const admin = adminList.find(
            (a) =>
              a.username?.trim().toLowerCase() === normalizedUserName ||
              a.adminId?.trim().toLowerCase() === normalizedUserName
          );

          if (admin && admin.permissions) {
            setPermissions(admin.permissions);
            console.log("✅ Admin permissions set:", admin.permissions);
          } else {
            // fallback
            setPermissions({
              createReport: true,
              updateReport: true,
              createNewWithExisting: true,
              downloadPDF: true,
            });
            console.warn(
              "⚠️ Admin found but no permissions set, using defaults."
            );
          }
        } else if (userRole === "employee") {
          const employee = employeeList.find(
            (emp) =>
              emp.name?.trim().toLowerCase() === normalizedUserName ||
              emp.email?.trim().toLowerCase() === normalizedUserName ||
              emp.employeeId?.trim().toLowerCase() === normalizedUserName
          );

          if (employee && employee.permissions) {
            setPermissions(employee.permissions);
            console.log("✅ Employee permissions set:", employee.permissions);
          } else {
            console.warn(
              "⚠️ No matching employee found or permissions missing"
            );
          }
        }
      } catch (err) {
        console.error("🔥 Error fetching permissions:", err.message);
      }
    };

    if (userRole && userName) {
      fetchPermissions();
    }
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
      <div className="App mx-auto shadow-xl rounded-2xl pb-2 w-full">
        <Header />
        <div className=" w-full container horizontal mt-5"></div>


        {/* ✅ Cards Section */}
        <div className=" w-full grid grid-cols-1 md:grid-cols-3 gap-4 p-5">
          {/* ✅ Create Report Card */}
          {/* ✅ New Report Card - show if permission.createReport is true */}

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

          {/* ✅ Update Report Card */}
          {permissions.updateReport && (
            <div className="bg-yellow-100 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-xl font-semibold text-center">
                Update Report
              </h3>
              <p className="text-center mt-4">
                Edit or update an existing report.
              </p>
              <Link to="/MultestepForm" state={{ isUpdateReportClicked: true }}>
                <button className="mt-4 px-6 py-2 bg-yellow-500 text-white rounded-lg w-full">
                  Update Report
                </button>
              </Link>
            </div>
          )}

          {/* ✅ Create New with Existing Card */}
          {permissions.createNewWithExisting && (
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
