import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const MenuBar = ({ userRole }) => {
  const nav = useNavigate();
  const location = useLocation();

  const getLocation = (loc) => {
    return location.pathname === loc ? "active" : "";
  };

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
      path: "#1",
      label: "Clients",
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
          className="feather feather-pie-chart"
        >
          <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
          <path d="M22 12A10 10 0 0 0 12 2v10z" />
        </svg>
      ),
    },
    {
      path: "/employees",
      label: "Employees",
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

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="app-icon" onClick={() => nav("/")}>
          <h6>Sharda Associates</h6>
        </div>
      </div>
      <ul className="sidebar-list">
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
      </ul>
      <div className="account-info">
        <div className="account-info-picture">
          <img
            src="https://static.vecteezy.com/system/resources/previews/006/309/616/original/initial-ca-logo-design-logo-design-free-vector.jpg"
            alt="Account"
          />
        </div>
        <div className="account-info-name">Anugraha</div>
        <button className="account-info-more">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="feather feather-more-horizontal"
          >
            <circle cx="12" cy="12" r="1" />
            <circle cx="19" cy="12" r="1" />
            <circle cx="5" cy="12" r="1" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MenuBar;

// import React from 'react'
// import { useLocation, useNavigate } from 'react-router-dom'

// const MenuBar = () => {
//     const nav = useNavigate()
//     const location = useLocation();
//     console.log(location.pathname);

//     const getLocation = (loc) => {
//         return location.pathname === loc ? "active" : "";
//     }
//     return (
//         <div className="sidebar">
//             <div className="sidebar-header">
//                 <div className="app-icon" onClick={() => nav('/')}>
//                     <h6>
//                         Sharda Associates
//                     </h6>
//                 </div>
//             </div>
//             <ul className="sidebar-list">
//                 <li className={`sidebar-list-item ${getLocation('/')}`} onClick={() => nav('/')}>
//                     <div>
//                         <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-home"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
//                         <span>Home</span>
//                     </div>
//                 </li>
//                 <li className={`sidebar-list-item ${getLocation('/form')}`} onClick={() => nav('/form')}>
//                     <div>
//                         <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-shopping-bag"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
//                         <span>Add Report</span>
//                     </div>
//                 </li>
//                 <li className="sidebar-list-item">
//                     <div>
//                         <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-pie-chart"><path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" /></svg>
//                         <span>Clients</span>
//                     </div>
//                 </li>
//                 <li className="sidebar-list-item">
//                     <div>
//                         <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-inbox"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></svg>
//                         <span>Employees</span>
//                     </div>
//                 </li>
//                 <li className="sidebar-list-item">
//                     <div>
//                         <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-bell"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
//                         <span>Notifications</span>
//                     </div>
//                 </li>
//                 <li className={`sidebar-list-item ${getLocation('/MultestepForm')}`} onClick={() => nav('/MultestepForm')}>
//                     <div>
//                         <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-shopping-bag"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
//                         <span>MultestepForm</span>
//                     </div>
//                 </li>

//                 <li className={`sidebar-list-item ${getLocation('/database')}`} onClick={() => nav('/database')}>
//                     <div>
//                         <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-shopping-bag"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
//                         <span>Database</span>
//                     </div>
//                 </li>
//             </ul>
//             <div className="account-info">
//                 <div className="account-info-picture">
//                     <img src="https://static.vecteezy.com/system/resources/previews/006/309/616/original/initial-ca-logo-design-logo-design-free-vector.jpg" alt="Account" />
//                 </div>
//                 <div className="account-info-name">Anugraha</div>
//                 <button className="account-info-more">
//                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-more-horizontal"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>
//                 </button>
//             </div>
//         </div>
//     )
// }

// export default MenuBar
