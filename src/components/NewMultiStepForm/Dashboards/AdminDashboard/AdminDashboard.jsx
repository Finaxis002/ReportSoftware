import React, { useState, useEffect } from "react";
import MenuBar from "../../MenuBar";
import { useNavigate } from "react-router-dom";
import Header from "../../Header";
import LoadingSpinner from "../../LoadingSpinner/LoadingSpinner"; // Import the loading spinner

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Loading state for spinner

  const [chartImage, setChartImage] = useState(null);

  // ✅ Redirect if not admin
  useEffect(() => {
    const authRole = localStorage.getItem("userRole");
    if (!authRole || authRole !== "admin") {
      navigate("/login");
    }
  }, [navigate]);

  // ✅ Fetch Employees Data from Backend
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch(
          "https://backend-three-pink.vercel.app/api/employees"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch employee data");
        }

        const data = await response.json();
        console.log("Employees Response:", data);

        // ✅ Directly handle the array response
        if (Array.isArray(data)) {
          setEmployees(data);
        } else {
          console.error("Unexpected data format:", data);
        }
      } catch (error) {
        console.error("🔥 Error fetching employees:", error);
      }
    };

    fetchEmployees();
  }, []);

  // ✅ Fetch Reports Data from Backend
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch(
          "https://backend-three-pink.vercel.app/get-report"
        );
        const data = await response.json();

        console.log("Reports Response:", data);

        if (data.success) {
          setReports(data.data || []);
        } else {
          console.error("Error fetching reports:", data.message);
        }
      } catch (error) {
        console.error("🔥 Error fetching reports:", error);
      }
    };

    fetchReports();
  }, []);

  // ✅ Function to convert DateTime to Friendly format
  const convertToFriendlyDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
    };
  };

  // ✅ Set loading state to false once data is fetched
  useEffect(() => {
    if (employees.length > 0 && reports.length > 0) {
      setIsLoading(false);
    }
  }, [employees, reports]);

  return (
    <div className="flex h-[100vh]">
      <MenuBar userRole="admin" />
      <div className="flex flex-col w-full px-4 gap-8">
        <Header dashboardType="Admin Dashboard" />

        {/* ✅ Show loader while fetching data */}
        {isLoading ? (
          <div className="loader-container">
            <LoadingSpinner /> {/* Your loading spinner component */}
          </div>
        ) : (
          <>
            {/* ✅ Dashboard Cards */}
            <div className="mt-8">
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition duration-300">
                <div className="flex flex-wrap  items-center gap-8">
                  {/* ✅ Total Reports */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 flex items-center justify-center rounded-lg">
                      📊
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-600">
                        Total Reports
                      </h3>
                      <p className="text-3xl font-bold text-gray-800">
                        {reports.length}
                      </p>
                      <p className="text-xs text-gray-500">
                        Last Report:{" "}
                        {reports.length > 0
                          ? new Date(
                              reports[reports.length - 1].createdAt
                            ).toDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* ✅ Total Employees */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-green-100 text-green-600 flex items-center justify-center rounded-lg">
                      👨‍💼
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-600">
                        Total Employees
                      </h3>
                      <p className="text-3xl font-bold text-gray-800">
                        {employees.length}
                      </p>
                      <p className="text-xs text-gray-500">
                        Active: {employees.filter((emp) => emp.isActive).length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
