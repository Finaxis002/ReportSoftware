import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const MainLogin = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState("admin");
   // State for user input
   const [inputUsername, setInputUsername] = useState("");
   const [inputPassword, setInputPassword] = useState("");
   const [error, setError] = useState("");
   const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Fixed credentials for Admin & Client
  const adminCredentials = { username: "admin", password: "admin123" };
  const clientCredentials = { username: "client", password: "client123" };

 

  // Check if already logged in
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn) {
      const userRole = localStorage.getItem("userRole");
      onLogin(true, userRole);
      navigate("/");
    }
  }, [navigate, onLogin]);

  // Handle Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
  
    if (activeTab === "employee") {
      try {
        const response = await fetch(
          "https://backend-three-pink.vercel.app/api/employees/login",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              employeeId: inputUsername,
              password: inputPassword,
            }),
          }
        );
  
        const data = await response.json();
        console.log("Backend Response:", data); // ✅ Check the full response
  
        if (response.ok && data.success) {
          console.log("✅ Employee Login Success:", data);
  
          // ✅ Pass `employeeName` from backend response
          onLogin(true, "employee", {
            employeeId: data.employee.employeeId,
            employeeName: data.employee.name, // ✅ Pass employeeName properly
            permissions: data.employee.permissions,
          });
  
          navigate("/"); // ✅ Redirect after login
        } else {
          setError(data.error || "Invalid Employee ID or Password!");
        }
      } catch (err) {
        console.error("🔥 Error logging in employee:", err);
        setError("Server error. Please try again later.");
      }
    }
  };
  
  
  

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      {/* Tabs */}
      <ul className="w-1/2 max-w-lg mx-auto bg-white rounded-t-lg text-teal-600 flex justify-between shadow-lg mb-4">
        <li className="nav-item flex-1">
          <a
            className={`nav-link py-3 px-1 text-sm text-center cursor-pointer text-lg font-medium ${
              activeTab === "admin"
                ? "bg-teal-500 text-white"
                : "text-teal-600 hover:bg-teal-100"
            } rounded-t-lg transition-all duration-300`}
            onClick={() => setActiveTab("admin")}
          >
            Login as Admin
          </a>
        </li>
        <li className="nav-item flex-1">
          <a
            className={`nav-link py-3 px-1 text-sm text-center cursor-pointer text-lg font-medium ${
              activeTab === "employee"
                ? "bg-teal-500 text-white"
                : "text-teal-600 hover:bg-teal-100"
            } transition-all duration-300`}
            onClick={() => setActiveTab("employee")}
          >
            Login as Employee
          </a>
        </li>
        <li className="nav-item flex-1">
          <a
            className={`nav-link py-3 px-1 text-sm text-center cursor-pointer text-lg font-medium ${
              activeTab === "client"
                ? "bg-teal-500 text-white"
                : "text-teal-600 hover:bg-teal-100"
            } transition-all duration-300`}
            onClick={() => setActiveTab("client")}
          >
            Login as Client
          </a>
        </li>
      </ul>

      {/* Login Form */}
      <div className="bg-white p-8 rounded-b-lg shadow-2xl w-full max-w-lg mx-auto ">
        <h4 className="text-center text-3xl font-semibold text-teal-700 mb-6">
          {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Login
        </h4>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700">
            {activeTab === "employee" ? "Employee ID" : "Username"}
          </label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
            value={inputUsername}
            onChange={(e) => setInputUsername(e.target.value)}
            placeholder={`Enter ${
              activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
            } Username`}
          />
        </div>
        <div className="mb-6 relative">
          <label className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
            value={inputPassword}
            onChange={(e) => setInputPassword(e.target.value)}
            placeholder="Enter Password"
          />
          <button
            type="button"
            className="absolute right-3 top-7 text-teal-600"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <i className="fas fa-eye-slash text-teal-600 w-6 h-6"></i>
            ) : (
              <i className="fas fa-eye text-teal-600 w-6 h-6"></i>
            )}
          </button>
        </div>
        <button
          className="w-full py-3 px-1 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
          onClick={handleSubmit}
        >
          Login
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-6 p-2 bg-red-100 text-red-600 rounded-lg text-center font-medium">
          {error}
        </div>
      )}
    </div>
  );
};

export default MainLogin;
