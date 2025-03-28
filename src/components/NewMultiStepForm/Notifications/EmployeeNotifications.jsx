// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";

// const EmployeeNotifications = () => {
//   const [notifications, setNotifications] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [selectedTask, setSelectedTask] = useState(null);
//   const [readNotifications, setReadNotifications] = useState({});
//   const navigate = useNavigate();

//   const employeeId = localStorage.getItem("employeeId");

//   const fetchNotifications = async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const response = await fetch(
//         `https://backend-three-pink.vercel.app/api/notifications?employeeId=${employeeId}`
//       );
//       if (!response.ok) {
//         throw new Error("Failed to fetch notifications");
//       }
//       const data = await response.json();
//       console.log("Fetched Notifications:", data);

//       const initialReadState = data.reduce((acc, notification) => {
//         acc[notification._id] = notification.isRead || false;
//         return acc;
//       }, {});

//       setReadNotifications(initialReadState);
//       setNotifications(data);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchNotifications();
//     const interval = setInterval(() => {
//       fetchNotifications();
//     }, 10000);
//     return () => clearInterval(interval);
//   }, [employeeId]);

//   const formatDate = (dateString) => {
//     if (!dateString) return "N/A";
//     const date = new Date(dateString);
//     return date.toLocaleString(); // Formats to "MM/DD/YYYY, HH:MM:SS AM/PM"
//   };

//   const handleViewTask = (notification) => {
//     console.log("Task Clicked:", notification);
//     if (notification.taskId) {
//       setSelectedTask(notification);
//       setReadNotifications((prev) => ({
//         ...prev,
//         [notification._id]: true, // Mark as read immediately
//       }));

//       fetch(`https://backend-three-pink.vercel.app/api/mark-notification-read`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ notificationId: notification._id }),
//       });
//     } else {
//       alert("No task associated with this notification.");
//     }
//   };

//   const handleGoToTask = () => {
//     if (selectedTask) {
//       setReadNotifications((prev) => ({
//         ...prev,
//         [selectedTask._id]: true, // Hide green dot
//       }));

//       setSelectedTask(null);
//       navigate(`/tasks/${selectedTask.taskId}`);
//     }
//   };

//   return (
//     <div>
//       {loading ? (
//         <p className="text-gray-600">Loading notifications...</p>
//       ) : error ? (
//         <p className="text-red-500">{error}</p>
//       ) : notifications.length === 0 ? (
//         <p className="text-gray-600">No notifications at this time.</p>
//       ) : (
//         <ul className="space-y-4">
//           {notifications.map((notification) => (
//             <li
//               key={notification._id || notification.id}
//               className="bg-white p-4 rounded-md shadow border border-gray-200 transition hover:shadow-lg flex items-center justify-between w-[50rem]"
//             >
//               <div className="flex flex-col">
//                 <p className="text-gray-800">
//                   {notification.message.split(":")[0]}:
//                   <span className="text-teal-500 font-bold capitalize">
//                     {" "}
//                     {notification.message.split(":")[1]}
//                   </span>
//                 </p>

//                 <p className="text-sm text-gray-500">
//                   {formatDate(notification.createdAt)}
//                 </p>
//               </div>

//               {/* View Task Button */}
//               {notification.taskId && (
//                 <button
//                   onClick={() => handleViewTask(notification)}
//                   className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
//                 >
//                   View Task
//                 </button>
//               )}
//             </li>
//           ))}
//         </ul>
//       )}

//       {/* Pop-up Modal */}
//       {selectedTask && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
//           <div className="bg-white p-6 rounded-lg shadow-lg w-96">
//             <h3 className="text-lg font-bold mb-4">Task Assigned</h3>
//             <p>{selectedTask.message}</p>
//             <p className="text-sm text-gray-500 mt-2">
//               Assigned on: {formatDate(selectedTask.createdAt)}
//             </p>
//             <div className="mt-4 flex justify-end">
//               <button
//                 onClick={handleGoToTask}
//                 className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition mr-2"
//               >
//                 Go to Task
//               </button>
//               <button
//                 onClick={() => setSelectedTask(null)}
//                 className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default EmployeeNotifications;

//////////////////////////////////////////////////////////////////////////////////////////////////////////
// import React, { useEffect, useState } from "react";

// const EmployeeNotifications = () => {
//   const [notifications, setNotifications] = useState([]);

//   useEffect(() => {
//     const fetchNotifications = async () => {
//       try {
//         const response = await fetch("https://backend-three-pink.vercel.app/api/admin/notifications");
//         if (!response.ok) {
//           throw new Error("Failed to fetch notifications");
//         }
//         const data = await response.json();
//         setNotifications(data);
//       } catch (err) {
//         console.error("Failed to load notifications:", err);
//       }
//     };

//     fetchNotifications();
//   }, []);

//   return (
//     <div className="mt-4">
//       <h3 className="text-lg font-bold mb-2">Notifications</h3>
//       {notifications.length === 0 ? (
//         <p>No notifications</p>
//       ) : (
//         <ul className="list-disc ml-4">
//           {notifications.map((notification) => (
//             <li key={notification._id} className="text-gray-700 mb-1">
//               {notification.message}
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// };

// export default EmployeeNotifications;

///////////////////////////////////////////////////////////////////////////////////////////////////////
// import React, { useEffect, useState } from "react";

// const AdminNotifications = () => {
//   const [notifications, setNotifications] = useState([]);

//   useEffect(() => {
//     const fetchNotifications = async () => {
//       try {
//         const response = await fetch("https://backend-three-pink.vercel.app/api/admin/notifications");
//         if (!response.ok) {
//           throw new Error("Failed to fetch notifications");
//         }
//         const data = await response.json();
//         setNotifications(data);
//       } catch (err) {
//         console.error("Failed to load notifications:", err);
//       }
//     };

//     fetchNotifications();
//   }, []);

//   return (
//     <div className="mt-4">
//       <h3 className="text-lg font-bold mb-2">Notifications</h3>
//       {notifications.length === 0 ? (
//         <p>No notifications</p>
//       ) : (
//         <ul className="list-disc ml-4">
//           {notifications.map((notification) => (
//             <li key={notification._id} className="text-gray-700 mb-1">
//               {notification.message} {/* ✅ Message already contains taskTitle */}
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// };

// export default AdminNotifications;

//////////////////////////////////////////////////////////////////////////////////////////////////////////
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
      <h3 className="text-lg font-bold mb-2 text-white" 
      style={{
        WebkitBackgroundClip: 'text', 
        backgroundClip: 'text', 
        color: 'transparent', 
        WebkitTextStroke: '1px green'
      }}>
        {userRole === "admin"
          ? "Admin Notifications"
          : "Employee Notifications"}
      </h3>

      {/* ✅ Show Notifications */}
      {/* {notifications.length === 0 ? (
        <p>No notifications</p>
      ) : (
        <ul className="list-disc ml-4">
          {notifications.map((notification) => (
            <li key={notification._id} className="text-gray-700 mb-1">
             
              {notification.message}
            </li>
          ))}
        </ul>
      )} */}
      <ul className="list-none ml-4">
        {Array.isArray(notifications) && notifications.length > 0 ? (
          notifications.map((notification) => (
            <li key={notification._id} 
            className="notification-item p-2 mb-2 rounded-xl border-1 border-green-300 bg-gradient-to-r from-green-100 to-white hover:from-green-200 hover:to-white transition duration-300 max-w-max">
              
              
              <div className="notification-content flex justify-between items-center">
              <FontAwesomeIcon
                icon={faBell}
                className="text-green-500 mr-3 text-xl"
              />
              <div className="notification-message flex-1 text-gray-700 text-sm font-medium">
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
