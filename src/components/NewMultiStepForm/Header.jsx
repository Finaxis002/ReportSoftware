import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toggleTheme } from "./Utils/themeToggle";

const Header = ({ dashboardType }) => {
  const [darkMode, setDarkMode] = React.useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  const navigate = useNavigate();

  const logoutUser = () => {
    localStorage.clear();
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    navigate("/login");
    window.location.reload();
  };


  return (
    <div className="app-content-header flex justify-between items-center p-4 dark:bg-gray-900 dark:text-white shadow-md transition-colors duration-300">

      <h1 className="app-content-headerText text-2xl font-semibold">
        {dashboardType}
      </h1>
      <div className="flex items-center gap-4">
        <button
          className="mode-switch me-5"
          title="Switch Theme"
          onClick={toggleTheme}
        >
          <svg
            className="moon"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"></path>
          </svg>
        </button>

        <button
          type="button"
          className="btn btn-danger bg-red-500 text-white px-4 py-2 rounded"
          onClick={logoutUser}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Header;
