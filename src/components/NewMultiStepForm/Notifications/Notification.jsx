import React, { useState, useEffect } from "react";
import MenuBar from "../MenuBar";
import EmployeeNotifications from "./EmployeeNotifications";
import Header from '../Header'
import { useNavigate } from "react-router-dom";

const Notification = () => {

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate;

   // Assume userRole is stored in localStorage after login.
   const userRole = localStorage.getItem("userRole") || "admin";

   useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError("");
      try {
       
        let simulatedNotifications = [];
        if (userRole === "admin") {
          simulatedNotifications = [
            { id: 1, message: "John Doe has completed Task A." },
            { id: 2, message: "Jane Smith has completed Task B." },
            // You can add more admin notifications here.
          ];
        } else if (userRole === "employee") {
          simulatedNotifications = [
            { id: 1, message: "" },
            // You can add more employee notifications here.
          ];
        }

        // Simulate a delay (for demo purposes)
        setTimeout(() => {
          setNotifications(simulatedNotifications);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [userRole]);

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
     
      <div className="flex flex-col w-full">
      <Header dashboardType="Employee Dashboard"/>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Notifications</h2>
        {loading ? (
          <p className="text-gray-600">Loading notifications...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : notifications.length === 0 ? (
          <p className="text-gray-600">No notifications at this time.</p>
        ) : (
          <ul className="space-y-4">
            <EmployeeNotifications />
          </ul>
        )}
      </div>
      </div>
    </div>
  );
};


export default Notification;
