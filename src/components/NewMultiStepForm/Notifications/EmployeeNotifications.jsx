import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import moment from "moment";
// import io from 'socket.io-client';
// import { ToastContainer, toast } from "react-toastify";
// import 'react-toastify/dist/ReactToastify.css'; // Import toast styles


// const socket = io("https://backend-three-pink.vercel.app");
// const socket = io("http://localhost:5000");
// const backendUrl =
//   window.location.hostname === "localhost"
//     ? "http://localhost:5000"
//     : "https://backend-three-pink.vercel.app";

// const socket = io(backendUrl, {
//   transports: ["websocket"], // reduce polling fallback
// });


const EmployeeNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const markNotificationsAsSeen = async () => {
      const employeeId = localStorage.getItem("employeeId");
      if (!employeeId) {
        console.warn("❌ No employeeId found in localStorage");
        return;
      }
  
      console.log("📢 Calling PUT /api/notifications/mark-seen");
  
      try {
        const res = await fetch("https://backend-three-pink.vercel.app/api/notifications/mark-seen", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ employeeId }),
        });
  
        const data = await res.json();
        console.log("✅ Notifications marked as seen:", data);
      } catch (err) {
        console.error("❌ Error marking notifications as seen:", err.message);
      }
    };
  
    markNotificationsAsSeen();
  }, []);
  
  
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const role = localStorage.getItem("userRole");
        setUserRole(role);

        let url = "";
        if (role === "admin") {
          url = "http://backend-three-pink.vercel.app/api/admin/notifications";
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

  
  // useEffect(() => {

  //   const role = localStorage.getItem("userRole");

  // if (role !== "employee") {
  //   console.log("🔒 Not an employee. Skipping socket connection.");
  //   return;
  // }
  //   const tryToJoinRoom = () => {
  //     const employeeId = localStorage.getItem("employeeId");
  
  //     if (employeeId) {
  //       console.log("✅ Joining room with employeeId:", employeeId);
  //       socket.emit("join", employeeId); // ✅ Now correct
  //     } else {
  //       console.warn("⏳ employeeId not found in localStorage. Retrying in 300ms...");
  //       setTimeout(tryToJoinRoom, 300); // Try again after 300ms
  //     }
  //   };
  
  //   tryToJoinRoom();
  
  //   socket.on("new-notification", (data) => {
  //     console.log("🔔 New notification received:", data);
  //     toast.info(`🔔 ${data.message}`);
  //     console.log("✅ toast fired");
  //     setNotifications((prev) => [data, ...prev]);

  //     toast.success(data.message, {
  //       position: "top-right",
  //       autoClose: 3000, // 3 seconds
  //       hideProgressBar: false,
  //       closeOnClick: true,
  //       pauseOnHover: true,
  //       draggable: true,
  //       progress: undefined,
  //     });
     
  //       toast.success("🔥 Toast is working test!");
    
      
  //   });
  
  //   return () => {
  //     socket.disconnect();
  //   };
  // }, []);
  
  return (
    <div className="mt-4">
      {/* ✅ Dynamic Title */}
      <h3 className="text-lg mb-2 dark:text-white" style={{}}>
        {userRole === "admin"
          ? "Admin Notifications"
          : "Employee Notifications"}
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
                  <span className="text-green-700 ml-2 font-medium">
  ({moment(notification.createdAt).format("hh:mm A")})
</span>
                </div>
              </div>
              
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
