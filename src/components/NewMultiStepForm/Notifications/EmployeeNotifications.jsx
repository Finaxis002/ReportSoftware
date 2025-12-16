// import React, { useEffect, useState } from "react";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faBell } from "@fortawesome/free-solid-svg-icons";
// import moment from "moment";



// const EmployeeNotifications = () => {
//   const [notifications, setNotifications] = useState([]);
//   const [userRole, setUserRole] = useState("");

//   useEffect(() => {
//     const markNotificationsAsSeen = async () => {
//       const employeeId = localStorage.getItem("employeeId");
//       if (!employeeId) {
//         console.warn("❌ No employeeId found in localStorage");
//         return;
//       }
  
//       console.log("📢 Calling PUT /api/notifications/mark-seen");
  
//       try {
//         const res = await fetch("https://reportsbe.sharda.co.in/api/notifications/mark-seen", {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ employeeId }),
//         });
  
//         const data = await res.json();
//         console.log("✅ Notifications marked as seen:", data);
//       } catch (err) {
//         console.error("❌ Error marking notifications as seen:", err.message);
//       }
//     };
  
//     markNotificationsAsSeen();
//   }, []);
  
  
//   useEffect(() => {
//     const fetchNotifications = async () => {
//       try {
//         const role = localStorage.getItem("userRole");
//         setUserRole(role);

//         let url = "";
//         if (role === "admin") {
//           url = "https://reportsbe.sharda.co.in/api/admin/notifications";
//         } else if (role === "employee") {
//           const employeeId = localStorage.getItem("employeeId");
//           if (!employeeId) {
//             console.error("Employee ID not found in localStorage");
//             return;
//           }
//           url = `https://reportsbe.sharda.co.in/api/notifications/employee?employeeId=${employeeId}`;
//         }

//         if (url) {
//           const response = await fetch(url);
//           if (!response.ok) {
//             throw new Error("Failed to fetch notifications");
//           }

//           const data = await response.json();

//           console.log("✅ Fetched Notifications Data:", data);

//           // ✅ Conditional Handling Based on Role
//           if (role === "admin") {
//             setNotifications(data || []); // Admin API directly returns an array
//           } else if (role === "employee") {
//             setNotifications(data.notifications || []); // Employee API returns an object with `notifications`
//           }
//         }
//       } catch (err) {
//         console.error("Failed to load notifications:", err);
//         setNotifications([]); // ✅ Prevent map() failure by setting an empty array in case of error
//       }
//     };

//     fetchNotifications();
//   }, []);

  
//   return (
//     <div className="mt-4">
//       {/* ✅ Dynamic Title */}
//       <h3 className="text-lg mb-2 dark:text-white" style={{}}>
//         {userRole === "admin"
//           ? "Admin Notifications"
//           : "User Notifications"}
//       </h3>

//       <ul className="list-none ml-4 h-[70vh] overflow-y-auto">
//         {Array.isArray(notifications) && notifications.length > 0 ? (
//           notifications.map((notification) => (
//             <li
//               key={notification._id}
//               className="notification-item p-2 mb-2 rounded-xl border border-green-300 bg-gradient-to-r from-green-100 to-white hover:from-green-200 hover:to-white transition duration-300 max-w-max
//             dark:border-green-600 dark:bg-transparent dark:hover:bg-transparent dark:bg-none"
//             >
//               <div className="notification-content flex justify-between items-center">
//                 <FontAwesomeIcon
//                   icon={faBell}
//                   className="text-green-500 mr-3 text-sm"
//                 />
//                 <div className="notification-message flex-1 text-gray-700 dark:text-white text-[12px] font-medium">
//                   {notification.message}
//                   <span className="text-green-700 ml-2 font-medium">
//   ({moment(notification.createdAt).format("hh:mm A")})
// </span>
//                 </div>
//               </div>
              
//             </li>
//           ))
//         ) : (
//           <p>No notifications</p>
//         )}
//       </ul>
//     </div>
//   );
// };

// export default EmployeeNotifications;















//////////////////////////////////////////////////////////////////////////////////










import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import moment from "moment";

const EmployeeNotifications = () => {
  // const BASE_URL = 'https://reportsbe.sharda.co.in';
  const BASE_URL = 'http://localhost:5000'
  const [notifications, setNotifications] = useState([]);
  const [userRole, setUserRole] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const markNotificationsAsSeen = async () => {
      const employeeId = localStorage.getItem("employeeId");
      if (!employeeId) return;

      try {
        await fetch("http://localhost:5000/api/notifications/mark-seen", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ employeeId }),
        });
      } catch (err) {
        console.error("❌ Error marking notifications as seen:", err.message);
      }
    };

    if (userRole === "employee") {
      markNotificationsAsSeen();
    }
  }, [userRole]);

  useEffect(() => {
    // ✅ SIMPLIFIED - Handle both endpoints the same way
const fetchNotifications = async () => {
  setLoading(true);
  try {
    const role = localStorage.getItem("userRole");
    setUserRole(role);

    let url = "";
    if (role === "admin") {
      url = "http://localhost:5000/api/admin/notifications?limit=20&page=1";
    } else if (role === "employee") {
      const employeeId = localStorage.getItem("employeeId");
      if (!employeeId) {
        console.error("Employee ID not found in localStorage");
        setLoading(false);
        return;
      }
      url = `http://localhost:5000/api/notifications/employee?employeeId=${employeeId}&limit=20&page=1`;
    }

    if (url) {
      console.log(`📡 Fetching: ${url}`);
      const response = await fetch(url);
      const data = await response.json();
      
      // ✅ NOW BOTH ENDPOINTS RETURN data.notifications
      setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
    }
  } catch (err) {
    console.error("Failed to load notifications:", err);
    setNotifications([]);
  } finally {
    setLoading(false);
  }
};

    fetchNotifications();
  }, []);

  // Debug function to check what's being displayed
  useEffect(() => {
    if (notifications.length > 0) {
      console.log(`📊 Displaying ${notifications.length} notifications`);
      console.log("📅 Recent timestamps:", notifications.slice(0, 3).map(n => ({
        message: n.message.substring(0, 30) + "...",
        time: n.createdAt,
        formatted: moment(n.createdAt).format("YYYY-MM-DD HH:mm:ss")
      })));
    }
  }, [notifications]);

  return (
    <div className="mt-4">
      <h3 className="text-lg mb-2 dark:text-white">
        {userRole === "admin" ? "Admin Notifications" : "User Notifications"}
      </h3>

      {loading ? (
        <p className="text-gray-500">Loading notifications...</p>
      ) : (
        <ul className="list-none ml-4 h-[70vh] overflow-y-auto">
          {Array.isArray(notifications) && notifications.length > 0 ? (
            notifications.map((notification) => (
              <li
                key={notification._id}
                className="notification-item p-2 mb-2 rounded-xl border border-green-300 bg-gradient-to-r from-green-100 to-white hover:from-green-200 hover:to-white transition duration-300 max-w-max dark:border-green-600 dark:bg-transparent dark:hover:bg-transparent dark:bg-none"
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
                <div className="text-xs text-gray-500 mt-1 pl-7">
                  {moment(notification.createdAt).format("MMM DD, YYYY")}
                </div>
              </li>
            ))
          ) : (
            <p className="text-gray-500">No notifications</p>
          )}
        </ul>
      )}
    </div>
  );
};

export default EmployeeNotifications;