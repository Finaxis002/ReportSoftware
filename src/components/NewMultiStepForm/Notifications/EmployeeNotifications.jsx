import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";

const EmployeeNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const role = localStorage.getItem("userRole");
        setUserRole(role);

        let url = "";
        if (role === "admin") {
          url = "https://backend-three-pink.vercel.app/api/admin/notifications";
        } else if (role === "employee") {
          const employeeId = localStorage.getItem("employeeId");
          if (!employeeId) {
            console.error("Employee ID not found in localStorage");
            return;
          }
          url = `https://backend-three-pink.vercel.app/api/notifications/employee?employeeId=${employeeId}`;
        }

        if (url) {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error("Failed to fetch notifications");
          }

          const data = await response.json();

          console.log("✅ Fetched Notifications Data:", data);

          // ✅ Conditional Handling Based on Role
          if (role === "admin") {
            setNotifications(data || []); // Admin API directly returns an array
          } else if (role === "employee") {
            setNotifications(data.notifications || []); // Employee API returns an object with `notifications`
          }
        }
      } catch (err) {
        console.error("Failed to load notifications:", err);
        setNotifications([]); // ✅ Prevent map() failure by setting an empty array in case of error
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div className="mt-4">
      {/* ✅ Dynamic Title */}
      <h3 className="text-lg mb-2 dark:text-white" style={{}}>
        {userRole === "admin"
          ? "Admin Notifications"
          : "User Notifications"}
      </h3>

      <ul className="list-none ml-4 h-[70vh] overflow-y-auto">
        {Array.isArray(notifications) && notifications.length > 0 ? (
          notifications.map((notification) => (
            <li
              key={notification._id}
              className="notification-item p-2 mb-2 rounded-xl border border-green-300 bg-gradient-to-r from-green-100 to-white hover:from-green-200 hover:to-white transition duration-300 max-w-max
            dark:border-green-600 dark:bg-transparent dark:hover:bg-transparent dark:bg-none"
            >
              <div className="notification-content flex justify-between items-center">
                <FontAwesomeIcon
                  icon={faBell}
                  className="text-green-500 mr-3 text-sm"
                />
                <div className="notification-message flex-1 text-gray-700 dark:text-white text-[12px] font-medium">
                  {notification.message}
                </div>
              </div>
              {/* <span className="text-gray-500 ml-2">
                ({moment(notification.createdAt).format("DD-MM-YYYY")})
              </span> */}
            </li>
          ))
        ) : (
          <p>No notifications</p>
        )}
      </ul>
    </div>
  );
};

export default EmployeeNotifications;
