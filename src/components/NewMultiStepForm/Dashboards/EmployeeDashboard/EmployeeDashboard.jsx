import React, { useEffect, useState } from "react";
import MenuBar from "../../MenuBar";
import { useNavigate } from "react-router-dom";
import Header from "../../Header";
import EmployeeTasks from "./EmployeeTasks";

const EmployeeDashboard = ({ userRole }) => {
  const navigate = useNavigate();
  const [employeeData, setEmployeeData] = useState(null);

  useEffect(() => {
    const authRole = localStorage.getItem("userRole");
    const employeeId = localStorage.getItem("userId");

    if (!authRole || authRole !== "employee") {
      navigate("/login");
    } else {
      const fetchEmployeeData = async () => {
        try {
          const response = await fetch(
            `https://backend-three-pink.vercel.app/api/employees/${employeeId}`
          );
          if (!response.ok) {
            throw new Error("Failed to fetch employee details");
          }
          const data = await response.json();
          setEmployeeData(data);
        } catch (err) {
          console.error("Error fetching employee details:", err);
        }
      };
      fetchEmployeeData();
    }
  }, [navigate]);

  const convertToFriendlyDateTime = (dateString) => {
    const dateObj = new Date(dateString);
    const date = dateObj.toLocaleDateString();
    const time = dateObj.toLocaleTimeString();
    return { date, time };
  };

  let data = JSON.parse(localStorage.getItem("userData"));

 

  // ✅ Corrected Logout Function
  const logoutUser = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId"); // ✅ Remove Employee ID
    navigate("/login"); // ✅ Use correct navigate function
    window.location.reload();
  };

  

  return (
    <div className="app-container">
      <MenuBar userRole={"employee"} />

      <div className="app-content">
      <Header dashboardType="Employee Dashboard" />

        <div>
          {/* ✅ Display Logged-In Employee Details */}
          {employeeData ? (
            <div className="flex justify-center mt-8">
              <div className="w-full max-w-4xl bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
                <div className="bg-gradient-to-r from-teal-400 to-teal-500 text-white text-center py-2">
                  <h2 className="text-xl font-semibold ">Employee Details</h2>
                </div>
                <div className="p-6 flex gap-20 text-gray-700">
                  {/* Employee ID */}
                  <div className="flex flex-col items-center md:items-start w-1/4">
                    <p className="text-sm text-gray-500 uppercase font-semibold">
                      Employee ID
                    </p>
                    <p className="text-sm capitalize font-medium">
                      {employeeData.employeeId}
                    </p>
                  </div>

                  {/* Name */}
                  <div className="flex flex-col items-center md:items-start w-1/4">
                    <p className="text-sm text-gray-500 uppercase font-semibold">
                      Name
                    </p>
                    <p className="text-sm capitalize font-medium">{employeeData.name}</p>
                  </div>

                  {/* Email */}
                  <div className="flex flex-col items-center md:items-start w-1/4">
                    <p className="text-sm text-gray-500 uppercase font-semibold">
                      Email
                    </p>
                    <p className="text-sm capitalize font-medium">{employeeData.email}</p>
                  </div>

                  {/* Designation */}
                  <div className="flex flex-col items-center md:items-start w-1/4">
                    <p className="text-sm text-gray-500 uppercase font-semibold">
                      Designation
                    </p>
                    <p className="text-sm capitalize font-medium">
                      {employeeData.designation}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500">
              No employee details found.
            </p>
          )}
        </div>

      
          {/* Assigned Tasks */}
        {employeeData && (
          <EmployeeTasks employeeId={employeeData.employeeId} />
        )}
       
      </div>
    </div>
  );
};

export default EmployeeDashboard;
