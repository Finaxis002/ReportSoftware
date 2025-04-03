import React, { useEffect, useState } from "react";
import MenuBar from "../../MenuBar";
import { useNavigate } from "react-router-dom";
import Header from "../../Header";
import EmployeeTasks from "./EmployeeTasks";
import LoadingSpinner from "../../LoadingSpinner/LoadingSpinner"; // Import loading spinner
import LimitedEmployeeTaskView from "./LimitedEmployeeTaskView";

const EmployeeDashboard = ({ userRole }) => {
  const navigate = useNavigate();
  const [employeeData, setEmployeeData] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Loading state for spinner
  const [showDueDatePopup, setShowDueDatePopup] = useState(false);
  const [dueTask, setDueTask] = useState(null);

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
          fetchTasksAndCheckDueDate(data.employeeId); // call this after setting data
        } catch (err) {
          console.error("🔥 Error fetching employee details:", err.message);
        } finally {
          setIsLoading(false); // Set loading to false once data is fetched
        }
      };

      fetchEmployeeData(); // ✅ Move the call outside the function definition
    }
  }, [navigate]);

  const fetchTasksAndCheckDueDate = async (empId) => {
    const justLoggedIn = sessionStorage.getItem("justLoggedIn");
  
    if (!justLoggedIn || !empId) return;
  
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000); // ⏱️ 8s timeout
  
      const res = await fetch(
        `https://backend-three-pink.vercel.app/api/tasks?employeeId=${empId}`,
        { signal: controller.signal }
      );
      clearTimeout(timeout);
  
      const taskData = await res.json();
      const now = new Date();
  
      const upcomingTasks = taskData.filter((task) => {
        const due = new Date(task.dueDate);
        return due > now;
      });
  
      if (upcomingTasks.length > 0) {
        setDueTask(upcomingTasks); // Pass array
        setShowDueDatePopup(true);
      }
  
      sessionStorage.removeItem("justLoggedIn");
    } catch (err) {
      if (err.name === "AbortError") {
        console.error("⏱️ Request timed out!");
      } else {
        console.error("🔥 Error fetching tasks:", err.message);
      }
    }
  };
  

  return (
    <div className="flex h-[100vh] overflow-hidden">
      <MenuBar userRole={"employee"} />

      <div className="app-content">
        <Header dashboardType="Employee Dashboard" />

        <div className="overflow-y-auto flex flex-col items-center justify-center">
          {/* ✅ Show loader while fetching data */}
          {isLoading ? (
            <div className="loader-container">
              <LoadingSpinner /> {/* Your loading spinner component */}
            </div>
          ) : (
            <>
              {/* ✅ Display Logged-In Employee Details */}
              {employeeData ? (
                <div className="flex justify-center mt-8 ">
                  <div className="w-full max-w-4xl shadow-sm rounded-lg overflow-hidden border border-gray-200">
                    <div className="bg-gradient-to-r bg-teal-600  text-white text-center py-2">
                      <h2 className="text-xl font-semibold">
                        Employee Details
                      </h2>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-gray-700 dark:text-white">
                      {/* ✅ Employee ID */}
                      <div className="flex flex-col">
                        <p className="text-sm text-gray-500 dark:text-white uppercase font-semibold">
                          Employee ID
                        </p>
                        <p className="text-sm capitalize font-medium">
                          {employeeData?.employeeId || "N/A"}
                        </p>
                      </div>

                      {/* ✅ Name */}
                      <div className="flex flex-col">
                        <p className="text-sm text-gray-500 dark:text-white uppercase font-semibold">
                          Name
                        </p>
                        <p className="text-sm capitalize font-medium">
                          {employeeData?.name || "N/A"}
                        </p>
                      </div>

                      {/* ✅ Email */}
                      <div className="flex flex-col">
                        <p className="text-sm text-gray-500 dark:text-white uppercase font-semibold">
                          Email
                        </p>
                        <p className="text-sm capitalize font-medium">
                          {employeeData?.email || "N/A"}
                        </p>
                      </div>

                      {/* ✅ Designation */}
                      <div className="flex flex-col">
                        <p className="text-sm text-gray-500 dark:text-white uppercase font-semibold">
                          Designation
                        </p>
                        <p className="text-sm capitalize font-medium">
                          {employeeData?.designation || "N/A"}
                        </p>
                      </div>

                      {/* ✅ Phone (Optional) */}
                      {employeeData?.phone && (
                        <div className="flex flex-col">
                          <p className="text-sm text-gray-500 dark:text-white uppercase font-semibold">
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
                          <p className="text-sm text-gray-500 dark:text-white uppercase font-semibold">
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
                          <p className="text-sm text-gray-500 dark:text-white uppercase font-semibold">
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
                        <p className="text-sm text-gray-500 dark:text-white">
                          Status not available
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-500 dark:text-white mt-4">
                  No employee details found.
                </p>
              )}
            </>
          )}

          {/* Assigned Tasks */}

          {employeeData && (
            <LimitedEmployeeTaskView employeeId={employeeData.employeeId} />
          )}
        </div>
      </div>

      {showDueDatePopup && Array.isArray(dueTask) && dueTask.length > 0 && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-90 flex justify-center items-center z-50">
          <div className="border bg-gray-50 dark:bg-black p-6 rounded-xl shadow-lg w-full max-w-md text-center">
            <h2 className="text-xl font-bold mb-3 text-blue-700">
              📢 Report Due Reminder
            </h2>

            <div className="text-left space-y-4">
              {dueTask.map((task, index) => (
                <div key={index} className="border-b pb-2">
                  <p className="text-gray-700 dark:text-white mb-1">
                    <strong>Task:</strong>{" "}
                    {task.taskTitle || task.title || "Unnamed Task"}
                  </p>
                  <p className="text-gray-600 dark:text-white">
                    <strong>Due Date:</strong>{" "}
                    {task.dueDate && !isNaN(new Date(task.dueDate))
                      ? new Date(task.dueDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "Invalid or Missing Date"}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowDueDatePopup(false)}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Okay
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;
