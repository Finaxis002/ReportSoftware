import React, { useState } from "react";
import MenuBar from "../MenuBar";
import { useNavigate } from "react-router-dom";
import Header from "../Header";
import EmployeeDetailsList from "../Dashboards/AdminDashboard/EmployeeDetailsList";

const Employees = () => {
  const navigate = useNavigate();


  const renderMenuBar = () => {
    const authRole = localStorage.getItem("userRole"); // Get the role from localStorage or state

    // Check if authRole exists, and if it's a valid role
    if (!authRole) {
      navigate("/login"); // If there's no role, redirect to login
      return null; // Optionally render nothing while redirecting
    }

    switch (authRole) {
      case "admin":
        return <MenuBar userRole="admin" />;
      case "employee":
        return <MenuBar userRole="employee" />;
      case "client":
        return <MenuBar userRole="client" />;
      default:
        navigate("/login"); // If role doesn't match, redirect to login
        return null;
    }
  };
  return (
    <div className="app-container">
      {renderMenuBar()}

      <div className="app-content">
      <Header dashboardType="Admin Dashboard" />
      <EmployeeDetailsList />
      </div>
    </div>
  );
};

export default Employees;
