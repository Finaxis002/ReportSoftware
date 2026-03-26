import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MenuBar from "../NewMultiStepForm/MenuBar";
import Header from "../NewMultiStepForm/Header";

const MainLayout = ({ children, dashboardType = "Dashboard" }) => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Get user data from localStorage
  useEffect(() => {
    const initializeUser = () => {
      const storedUserRole = localStorage.getItem("userRole");
      const storedEmployeeName = localStorage.getItem("employeeName");
      const isLoggedIn = localStorage.getItem("isLoggedIn");

      if (!isLoggedIn || isLoggedIn !== "true") {
        navigate("/login");
        return;
      }

      setUserRole(storedUserRole);
      if (storedUserRole === "employee" && storedEmployeeName) {
        setUserName(storedEmployeeName);
      }
      setIsLoading(false);
    };

    initializeUser();
  }, [navigate]);

  // Logout function
  const logoutUser = async () => {
    const employeeId = localStorage.getItem("employeeId");
    const BASE_URL = process.env.REACT_APP_BASE_URL || 'https://reportsbe.sharda.co.in';

    if (employeeId) {
      try {
        await fetch(
          `${BASE_URL}/api/employees/logout`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ employeeId }),
          }
        );
      } catch (error) {
        console.error("Logout API failed:", error);
      }
    }

    localStorage.clear();
    sessionStorage.removeItem("hasSeenDuePopup");
    navigate("/login");
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!userRole) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar - Hidden on mobile, shown on desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <MenuBar userRole={userRole} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header dashboardType={dashboardType} />

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="max-w-9xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
      
      {/* Mobile Menu Overlay - for future mobile navigation implementation */}
      <div className="lg:hidden">
        {/* Mobile menu button will be added here in future */}
      </div>
    </div>
  );
};

export default MainLayout;