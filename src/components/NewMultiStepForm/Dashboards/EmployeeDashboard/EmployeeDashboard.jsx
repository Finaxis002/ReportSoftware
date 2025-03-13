import React, { useEffect, useState } from "react";
import MenuBar from "../../MenuBar";
import { useNavigate } from "react-router-dom";
import Header from "../../Header";
import EmployeeTasks from "./EmployeeTasks";
import LoadingSpinner from "../../LoadingSpinner/LoadingSpinner"; // Import loading spinner

const EmployeeDashboard = ({ userRole }) => {
  const navigate = useNavigate();
  const [employeeData, setEmployeeData] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Loading state for spinner

  useEffect(() => {
    const authRole = localStorage.getItem("userRole");
    const employeeId = localStorage.getItem("employeeId");

    console.log("👉 Retrieved userRole:", authRole);
    console.log("👉 Retrieved employeeId:", employeeId);

    if (!authRole || authRole !== "employee") {
      console.log("🔒 Not authorized, redirecting to /login...");
      navigate("/login");
    } else {
      const fetchEmployeeData = async () => {
        try {
          console.log(
            `🚀 Fetching data from: https://backend-three-pink.vercel.app/api/employees/${employeeId}`
          );

          const response = await fetch(
            `https://backend-three-pink.vercel.app/api/employees/${employeeId}`
          );

          console.log("🛡️ Response status:", response.status);

          if (!response.ok) {
            const errorData = await response.json();
            console.error("❌ Error Response from Server:", errorData);
            throw new Error("Failed to fetch employee details");
          }

          const data = await response.json();

          // ✅ Log the fetched data
          console.log("✅ Fetched Employee Data:", data);

          setEmployeeData(data);
        } catch (err) {
          console.error("🔥 Error fetching employee details:", err.message);
        } finally {
          setIsLoading(false); // Set loading to false once data is fetched
        }
      };

      fetchEmployeeData();
    }
  }, [navigate]);

  return (
    <div className="app-container">
      <MenuBar userRole={"employee"} />

      <div className="app-content">
        <Header dashboardType="Employee Dashboard" />

        <div>
          {/* ✅ Show loader while fetching data */}
          {isLoading ? (
            <div className="loader-container">
              <LoadingSpinner /> {/* Your loading spinner component */}
            </div>
          ) : (
            <>
              {/* ✅ Display Logged-In Employee Details */}
              {employeeData ? (
                <div className="flex justify-center mt-8">
                  <div className="w-full max-w-4xl bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
                    <div className="bg-gradient-to-r from-teal-400 to-teal-500 text-white text-center py-2">
                      <h2 className="text-xl font-semibold">
                        Employee Details
                      </h2>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-gray-700">
                      {/* ✅ Employee ID */}
                      <div className="flex flex-col">
                        <p className="text-sm text-gray-500 uppercase font-semibold">
                          Employee ID
                        </p>
                        <p className="text-sm capitalize font-medium">
                          {employeeData?.employeeId || "N/A"}
                        </p>
                      </div>

                      {/* ✅ Name */}
                      <div className="flex flex-col">
                        <p className="text-sm text-gray-500 uppercase font-semibold">
                          Name
                        </p>
                        <p className="text-sm capitalize font-medium">
                          {employeeData?.name || "N/A"}
                        </p>
                      </div>

                      {/* ✅ Email */}
                      <div className="flex flex-col">
                        <p className="text-sm text-gray-500 uppercase font-semibold">
                          Email
                        </p>
                        <p className="text-sm capitalize font-medium">
                          {employeeData?.email || "N/A"}
                        </p>
                      </div>

                      {/* ✅ Designation */}
                      <div className="flex flex-col">
                        <p className="text-sm text-gray-500 uppercase font-semibold">
                          Designation
                        </p>
                        <p className="text-sm capitalize font-medium">
                          {employeeData?.designation || "N/A"}
                        </p>
                      </div>

                      {/* ✅ Phone (Optional) */}
                      {employeeData?.phone && (
                        <div className="flex flex-col">
                          <p className="text-sm text-gray-500 uppercase font-semibold">
                            Phone
                          </p>
                          <p className="text-sm capitalize font-medium">
                            {employeeData?.phone || "N/A"}
                          </p>
                        </div>
                      )}

                      {/* ✅ Date of Joining */}
                      {employeeData?.dateOfJoining && (
                        <div className="flex flex-col">
                          <p className="text-sm text-gray-500 uppercase font-semibold">
                            Date of Joining
                          </p>
                          <p className="text-sm capitalize font-medium">
                            {new Date(
                              employeeData?.dateOfJoining
                            ).toLocaleDateString() || "N/A"}
                          </p>
                        </div>
                      )}

                      {/* ✅ Status */}
                      {employeeData && employeeData.status !== undefined ? (
                        <div className="flex flex-col">
                          <p className="text-sm text-gray-500 uppercase font-semibold">
                            Status
                          </p>
                          <p
                            className={`text-sm capitalize font-medium ${
                              employeeData.status === "Active"
                                ? "text-green-500"
                                : "text-red-500"
                            }`}
                          >
                            {employeeData.status}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">
                          Status not available
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-500 mt-4">
                  No employee details found.
                </p>
              )}
            </>
          )}

          {/* Assigned Tasks */}
          <div
            style={{
              overflowY: "scroll",
              height: "400px", // ✅ Set fixed height
              paddingBottom:"5rem"
            }}
          >
            {employeeData && (
              <EmployeeTasks employeeId={employeeData.employeeId} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
