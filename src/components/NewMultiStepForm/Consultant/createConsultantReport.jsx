import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import MenuBar from "../MenuBar";
import Header from "../Header";
import { capitalizeWords } from "../../../utils";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSyncAlt } from "@fortawesome/free-solid-svg-icons";

const CreateConsultantReport = ({ userRole }) => {
  const location = useLocation();
  console.log('Location state:', location.state);

  const userName =
    localStorage.getItem("adminName") || localStorage.getItem("employeeName");
    const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

  const [permissions, setPermissions] = useState({
    generateReport: false,
    updateReport: false,
    createNewWithExisting: false,
    downloadPDF: false,
    exportData: false, // ✅ Add this
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedConsultant, setSelectedConsultant] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const [empRes, adminRes] = await Promise.all([
          fetch(`${BASE_URL}/api/employees`),
          fetch(`${BASE_URL}/api/admins`),
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

  useEffect(() => {
    const fetchSelectedConsultant = async () => {
      if (location.state?.selectedConsultantId) {
        try {
          const response = await fetch(`${BASE_URL}/api/consultants/${location.state.selectedConsultantId}`);
          if (response.ok) {
            const consultant = await response.json();
            setSelectedConsultant(consultant);
          } else {
            console.error("Failed to fetch consultant");
          }
        } catch (error) {
          console.error("Error fetching consultant:", error);
        }
      }
    };

    fetchSelectedConsultant();
  }, [location.state, BASE_URL]);


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
    navigate('/create-consultant-report-form', {
      state: {
        isCreateReportClicked: true,
        consultantId: location.state?.selectedConsultantId
      }
    });
  };


  return (
    <div className="flex h-[100vh]">
      {renderMenuBar()}
      <div className="app-content">
      <Header dashboardType ={userRole === "admin" ?  "Admin Dashboard" : "User Dashboard"} />

        {/* Selected Consultant Display */}
        {selectedConsultant && (
          <div className="px-5 pt-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-blue-800">
                    Create Report for: {capitalizeWords(selectedConsultant.name)}
                  </h2>
                  <p className="text-sm text-blue-600 mt-1">
                    Email: {selectedConsultant.email} | Mobile: {selectedConsultant.mobile}
                  </p>
                </div>
                <button
                  onClick={() => navigate('/consultant-report')}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 text-sm font-medium"
                  title="Go Back to Consultant List"
                >
                  ← Go Back
                </button>
              </div>
            </div>
          </div>
        )}

       
        <div className=" w-full grid grid-cols-1 md:grid-cols-3 gap-4 p-5">
          {/* ✅ New Report Card - show if permission.createReport is true */}

          <div className="bg-blue-100 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold text-center">New Report</h3>
            <p className="text-center mt-4">
              Create a fresh report from scratch.
            </p>
            <Link
              to="/create-consultant-report-form"
              onClick={handleCreateReportClick}
              state={{
                isCreateReportClicked: true,
                consultantId: location.state?.selectedConsultantId
              }}
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
              <Link to="/create-consultant-report-form" state={{ isUpdateReportClicked: true, consultantId: location.state?.selectedConsultantId }}>
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
                to="/create-consultant-report-form"
                state={{ isCreateReportWithExistingClicked: true, consultantId: location.state?.selectedConsultantId }}
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

export default CreateConsultantReport;
