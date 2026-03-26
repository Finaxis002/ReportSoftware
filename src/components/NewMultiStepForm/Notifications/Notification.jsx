import React, { useState, useEffect } from "react";
import EmployeeNotifications from "./EmployeeNotifications";

const Notification = () => {

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  return (
    <div className="flex h-[85vh] overflow-y-auto">
    <div className="app-content w-full">

      <div className="p-6">
        {/* <h2 className="text-2xl font-bold mb-4">Notifications</h2> */}
        {loading ? (
          <p className="text-gray-600">Loading notifications...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : notifications.length === 0 ? (
          <p className="text-gray-600">No notifications at this time.</p>
        ) : (
          <ul className="">
            <EmployeeNotifications />
          </ul>
        )}
      </div>
      </div>
    </div>
  );
};


export default Notification;
