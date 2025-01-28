import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const MainLogin = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState("admin");
  const [adminCredentials] = useState({ username: "admin", password: "admin123" });
  const [employeeCredentials] = useState({ username: "employee", password: "employee123" });
  const [clientCredentials] = useState({ username: "client", password: "client123" });
  const navigate = useNavigate();

  const [inputUsername, setInputUsername] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false); // New state for toggling password visibility

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn) {
      const userRole = localStorage.getItem("userRole");
      onLogin(true, userRole); // Pass the role to the parent component
      navigate("/"); // Navigate to the homepage
    }
  }, [navigate, onLogin]);

  const handleSubmit = (e) => {
    e.preventDefault();
    let correctUsername = "";
    let correctPassword = "";

    if (activeTab === "admin") {
      correctUsername = adminCredentials.username;
      correctPassword = adminCredentials.password;
    } else if (activeTab === "employee") {
      correctUsername = employeeCredentials.username;
      correctPassword = employeeCredentials.password;
    } else if (activeTab === "client") {
      correctUsername = clientCredentials.username;
      correctPassword = clientCredentials.password;
    }

    if (inputUsername === correctUsername && inputPassword === correctPassword) {
      localStorage.setItem("isLoggedIn", true);
      localStorage.setItem("userRole", activeTab); // Store role in localStorage if needed
      onLogin(true, activeTab); // Pass role to parent
      navigate("/");
    } else {
      setError("Invalid username or password.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      {/* Tabs */}
      <ul className="w-1/2 max-w-lg mx-auto bg-white rounded-t-lg text-teal-600 flex justify-between shadow-lg mb-4">
        <li className="nav-item flex-1">
          <a
            className={`nav-link py-3 px-1 text-sm text-center cursor-pointer text-lg font-medium ${
              activeTab === "admin" ? "bg-teal-500 text-white" : "text-teal-600 hover:bg-teal-100"
            } rounded-t-lg transition-all duration-300`}
            onClick={() => setActiveTab("admin")}
          >
            Login as Admin
          </a>
        </li>
        <li className="nav-item flex-1">
          <a
            className={`nav-link py-3 px-1 text-sm text-center cursor-pointer text-lg font-medium ${
              activeTab === "employee" ? "bg-teal-500 text-white" : "text-teal-600 hover:bg-teal-100"
            } transition-all duration-300`}
            onClick={() => setActiveTab("employee")}
          >
            Login as Employee
          </a>
        </li>
        <li className="nav-item flex-1">
          <a
            className={`nav-link py-3 px-1 text-sm text-center cursor-pointer text-lg font-medium ${
              activeTab === "client" ? "bg-teal-500 text-white" : "text-teal-600 hover:bg-teal-100"
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
          <label className="block text-sm font-medium text-gray-700">Username</label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
            value={inputUsername}
            onChange={(e) => setInputUsername(e.target.value)}
            placeholder={`Enter ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Username`}
          />
        </div>
        <div className="mb-6 relative">
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type={showPassword ? "text" : "password"} // Conditionally render the password input type
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
            value={inputPassword}
            onChange={(e) => setInputPassword(e.target.value)}
            placeholder={`Enter ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Password`}
          />
          <button
            type="button"
            className="absolute right-3 top-7 text-teal-600"
            onClick={() => setShowPassword(!showPassword)} // Toggle password visibility
          >
            {showPassword ? (
              <i className="fas fa-eye-slash text-teal-600 w-6 h-6"></i> // Eye-slash icon when password is hidden
            ) : (
              <i className="fas fa-eye text-teal-600 w-6 h-6"></i> // Eye icon when password is visible
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
