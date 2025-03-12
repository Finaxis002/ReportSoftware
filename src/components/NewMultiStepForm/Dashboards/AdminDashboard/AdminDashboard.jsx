import React, { useState, useEffect } from "react";
import MenuBar from "../../MenuBar";
import { useNavigate } from "react-router-dom";
import Header from "../../Header";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [reports, setReports] = useState([]);
  const [weeklyReports, setWeeklyReports] = useState([]);
  const [dailyReports, setDailyReports] = useState([]);

  const [records, setRecords] = useState([]);

  const authRole = localStorage.getItem("userRole");

  if (!authRole || authRole !== "admin") {
    navigate("/login");
    return null;
  }

  // ✅ Fetch Employees Data from Backend
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch(
          "https://backend-three-pink.vercel.app/api/employees"
        );
        const data = await response.json();

        console.log("Employees Response:", data);

        if (data.success) {
          setEmployees(data.data || []);
        } else {
          console.error("Error fetching employees:", data.message);
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

          const today = new Date();
          const weekAgo = new Date(today);
          weekAgo.setDate(today.getDate() - 7);

          const weekly = data.data.filter(
            (report) => new Date(report.date) >= weekAgo
          );
          const daily = data.data.filter(
            (report) =>
              new Date(report.date).toDateString() === today.toDateString()
          );

          setWeeklyReports(weekly);
          setDailyReports(daily);
        } else {
          console.error("Error fetching reports:", data.message);
        }
      } catch (error) {
        console.error("🔥 Error fetching reports:", error);
      }
    };

    fetchReports();
  }, []);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch(
          "https://backend-three-pink.vercel.app/get-report"
        );
        if (!response.ok) throw new Error("Failed to fetch reports");

        const data = await response.json();

        console.log("Fetched Reports Data:", data);

        if (data) {
          // ✅ Set total reports count
          setTotalReports(data.length);

          // ✅ Filter Weekly and Daily Reports
          const today = new Date().setHours(0, 0, 0, 0); // Remove time for accurate date comparison
          const weekAgo = new Date();
          weekAgo.setDate(new Date().getDate() - 7);
          weekAgo.setHours(0, 0, 0, 0); // Remove time for accurate comparison

          const weekly = data.filter((report) => {
            const reportDate = new Date(report.createdAt).setHours(0, 0, 0, 0);
            return reportDate >= weekAgo && reportDate <= today;
          });

          const daily = data.filter((report) => {
            const reportDate = new Date(report.createdAt).setHours(0, 0, 0, 0);
            return reportDate === today;
          });

          setWeeklyReports(weekly);
          setDailyReports(daily);
        }
      } catch (err) {
        console.error("🔥 Error fetching reports:", err);
      }
    };

    fetchReports();
  }, []);

  //Fetch Weekly Reports

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch(
          "https://backend-three-pink.vercel.app/get-report"
        );
        if (!response.ok) throw new Error("Failed to fetch reports");

        const data = await response.json();

        console.log("Fetched Reports Data:", data);

        if (data.success) {
          setReports(data.data || []); // ✅ Use data.data based on API response format

          // ✅ Filter weekly reports
          const today = new Date();
          const weekAgo = new Date();
          weekAgo.setDate(today.getDate() - 7);

          const weekly = data.data.filter((report) => {
            const reportDate = new Date(report.createdAt);
            return reportDate >= weekAgo && reportDate <= today;
          });

          setWeeklyReports(weekly);
        } else {
          console.error("Failed to fetch report data:", data.message);
        }
      } catch (err) {
        console.error("🔥 Error fetching reports:", err);
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

  return (
    <div className="app-container">
      <MenuBar userRole="admin" />
      <div className="flex flex-col w-full px-4 gap-8">
        <Header dashboardType="Admin Dashboard" />

        {/* ✅ Dashboard Cards */}
        <div className="mt-8">
          {/* ✅ Combined Horizontal Card */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition duration-300">
            <div className="flex flex-wrap justify-between items-center gap-8">
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
                          reports[reports.length - 1].date
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

              {/* ✅ Weekly Reports */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-yellow-100 text-yellow-600 flex items-center justify-center rounded-lg">
                  📅
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600">
                    Weekly Reports
                  </h3>
                  <p className="text-3xl font-bold text-gray-800">
                    {weeklyReports.length}
                  </p>
                  <p className="text-xs text-gray-500">
                    Highest in a week:{" "}
                    {weeklyReports.length > 0
                      ? Math.max(
                          ...weeklyReports.map((report) => report.value || 0)
                        )
                      : "N/A"}
                  </p>
                </div>
              </div>

              {/* ✅ Daily Reports */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-red-100 text-red-600 flex items-center justify-center rounded-lg">
                  📆
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600">
                    Today Reports
                  </h3>
                  <p className="text-3xl font-bold text-gray-800">
                    {dailyReports.length}
                  </p>
                  <p className="text-xs text-gray-500">
                    Last generated:{" "}
                    {dailyReports.length > 0
                      ? new Date(
                          dailyReports[dailyReports.length - 1].date
                        ).toLocaleTimeString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Recent Reports Table */}
        <div className="overflow-x-auto mt-8">
          <table className="min-w-full bg-white shadow-md rounded-xl">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 text-left">Name</th>
                <th className="py-2 px-4 text-left">Category</th>
                <th className="py-2 px-4 text-left">Status</th>
                <th className="py-2 px-4 text-left">Rate</th>
                <th className="py-2 px-4 text-left">Created At</th>
                <th className="py-2 px-4 text-left">Price</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record, index) => (
                <tr key={index} className="border-t">
                  <td className="py-2 px-4">{record.fields.name}</td>
                  <td className="py-2 px-4">{record.fields.phone}</td>
                  <td className="py-2 px-4">Active</td>
                  <td className="py-2 px-4">{record.fields.SimpleInterest}%</td>
                  <td className="py-2 px-4">
                    {convertToFriendlyDateTime(record.fields.CreatedAt).date}
                  </td>
                  <td className="py-2 px-4">
                    ${record.fields.TotalExpenditure}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
