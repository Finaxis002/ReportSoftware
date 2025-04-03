import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import MenuBar from "./MenuBar";
import Header from "./Header";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSyncAlt } from "@fortawesome/free-solid-svg-icons";

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
  const [refreshKey, setRefreshKey] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
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
          const storedAdminName = localStorage.getItem("adminName");

          // ✅ If no specific admin name, assume full permissions (super admin)
          if (!storedAdminName) {
            setPermissions({
              generateReport: true,
              updateReport: true,
              createNewWithExisting: true,
              downloadPDF: true,
              exportData: true,
              createReport: true,
            });
            console.log("✅ Super Admin - All permissions granted");
            return;
          }

          // ✅ Check if this admin exists
          const admin = adminList.find(
            (a) =>
              a.username?.trim().toLowerCase() === normalizedUserName ||
              a.adminId?.trim().toLowerCase() === normalizedUserName
          );

          if (admin && admin.permissions) {
            setPermissions(admin.permissions);
            console.log("✅ Admin permissions set from DB:", admin.permissions);
          } else {
            setPermissions({
              generateReport: true,
              updateReport: true,
              createNewWithExisting: true,
              downloadPDF: true,
              exportData: true,
              createReport: true,
            });
            console.warn(
              "⚠️ Admin found but no permissions set. Using default full access."
            );
          }
        }

        // ✅ Handle Employee Permissions
        else if (userRole === "employee") {
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
  }, [userRole, userName, refreshKey]);


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
      <div className="app-content">
      <Header dashboardType ={userRole === "admin" ?  "Admin Dashboard" : "Employee Dashboard"} />

        {/* ✅ Cards Section */}
        {/* 🔄 Refresh Button */}
        <div className="flex justify-start items-center px-5 pt-4">
          <button
            onClick={() => setRefreshKey((prev) => prev + 1)}
            className="flex items-center gap-2 text-sm  text-teal-700 dark:text-teal-200 hover:text-teal-900 transition-all"
            title="Refresh Permissions & Cards"
          >
            <FontAwesomeIcon icon={faSyncAlt} className="text-lg" />
           
          </button>
        </div>
        <div className=" w-full grid grid-cols-1 md:grid-cols-3 gap-4 p-5">
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
          {((userRole === "admin" &&
            (!localStorage.getItem("adminName") || permissions.updateReport)) ||
            (userRole === "employee" && permissions.updateReport)) && (
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
          {((userRole === "admin" &&
            (!localStorage.getItem("adminName") ||
              permissions.createNewWithExisting)) ||
            (userRole === "employee" && permissions.createNewWithExisting)) && (
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
