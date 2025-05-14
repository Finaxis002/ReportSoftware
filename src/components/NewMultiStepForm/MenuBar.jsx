import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";

const MenuBar = ({ userRole }) => {
  const nav = useNavigate();
  const location = useLocation();
  const [adminName, setAdminName] = useState("");
  const [unseenCount, setUnseenCount] = useState(0);

  useEffect(() => {
    const storedAdminName = localStorage.getItem("adminName");
    if (storedAdminName) {
      setAdminName(storedAdminName);
    }
  }, []);

  const getLocation = (loc) => {
    return location.pathname === loc ? "active" : "";
  };

  useEffect(() => {
    const fetchUnseenNotifications = async () => {
      const employeeId = localStorage.getItem("employeeId");
      if (!employeeId) return;

      try {
        const res = await fetch(
          `https://backend-three-pink.vercel.app/api/notifications/unseen?employeeId=${employeeId}`
        );
        const data = await res.json();
        setUnseenCount(data.length);

        console.log("🔴 Unseen Count:", data.length);
      } catch (err) {
        console.error("❌ Error fetching unseen notifications:", err.message);
      }
    };

    fetchUnseenNotifications();
  }, [location]);

  // Define menu items with roles
  const menuItems = [
    {
      path: "/",
      label: "Home",
      roles: ["admin", "employee", "client"],
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="feather feather-home"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      path: "/tasks/:taskId",
      label: "Tasks",
      roles: ["employee"],
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="feather feather-home"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      path: "/reports",
      label: "Reports",
      roles: ["admin", "employee", "client"],
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="feather feather-shopping-bag"
        >
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      ),
    },
    {
      path: "/bank-details",
      label: "Bank Details",
      roles: ["admin"],
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="feather feather-file"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <line x1="10" y1="9" x2="8" y2="9" />
        </svg>
      ),
    },
    {
      path: "/clients",
      label: "Clients",
      roles: ["admin"],
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="feather feather-pie-chart"
        >
          <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
          <path d="M22 12A10 10 0 0 0 12 2v10z" />
        </svg>
      ),
    },
    {
      path: "/employees",
      label: "Users",
      roles: ["admin"],
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="feather feather-inbox"
        >
          <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
          <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
        </svg>
      ),
    },
    {
      path: "/admin",
      label: "Admin",
      roles: ["admin"],
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="feather feather-inbox"
        >
          <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
          <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
        </svg>
      ),
    },
    {
      path: "/notifications",
      label: "Notifications",
      roles: ["admin", "employee"],
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="feather feather-bell"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      ),
    },
    {
      path: "/CreateReport",
      label: "Create Report",
      roles: ["admin", "employee", "client"],
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="feather feather-shopping-bag"
        >
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      ),
    },

    {
      path: "/history",
      label: "History",
      roles: ["admin"],
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="feather feather-clock"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
  ];

  // Filter menu items based on the user's role
  const visibleMenuItems = menuItems.filter((item) =>
    item.roles.includes(userRole)
  );

  const paths = visibleMenuItems.map((item) => item.path);
  const uniquePaths = new Set(paths);

  if (paths.length !== uniquePaths.size) {
    console.warn("Duplicate paths detected:", paths);
  }

  const employeeName = localStorage.getItem("employeeName"); // Get employeeName from localStorage
  const ToCapitalize = (str) => {
    if (!str) return "";
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="app-icon" onClick={() => nav("/")}>
          <h6>Sharda Associates</h6>
        </div>
      </div>
      {/* <ul className="sidebar-list">
        {visibleMenuItems.map((item, index) => (
          <li
            key={item.path || index} // Ensure unique keys
            className={`sidebar-list-item ${getLocation(item.path)}`}
            onClick={() => nav(item.path)}
          >
            <div>
              {item.icon}
              <span>{item.label}</span>
            </div>
          </li>
        ))}
      </ul> */}
      <ul className="sidebar-list">
        {visibleMenuItems.map((item, index) => (
          <li
            key={item.path || index}
            className={`sidebar-list-item ${getLocation(item.path)}`}
            onClick={() => nav(item.path)}
          >
            <div className="relative">
              {item.icon}
              <span>{item.label}</span>

              {item.label === "Notifications" && unseenCount > 0 && (
                <span className="absolute top-0 right-0 translate-x-2 -translate-y-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {unseenCount}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>

      <div className="account-info">
        {userRole === "admin" ? (
          <div className="account-info-picture">
            <img
              src="https://static.vecteezy.com/system/resources/previews/006/309/616/original/initial-ca-logo-design-logo-design-free-vector.jpg"
              alt="Account"
            />
          </div>
        ) : (
          <FontAwesomeIcon className="dark:text-white" icon={faUser} />
        )}

        <div className="account-info-name">
          {userRole === "employee"
            ? ToCapitalize(employeeName)
            : adminName
            ? `Admin (${ToCapitalize(adminName)})`
            : "Admin"}
        </div>
      </div>
    </div>
  );
};

export default MenuBar;
