import React from "react";
import { useLocation } from "react-router-dom";
import MainLayout from "./MainLayout";

// Route configurations to determine which layout to use
const routeConfigs = [
  {
    pattern: /^\/$/,
    layout: "Dashboard",
    roles: ["admin", "employee", "client"]
  },
  {
    pattern: /^\/employees$/,
    layout: "Users Management",
    roles: ["admin"]
  },
  {
    pattern: /^\/admin$/,
    layout: "Admin Management",
    roles: ["admin"]
  },
  {
    pattern: /^\/notifications$/,
    layout: "Notifications",
    roles: ["admin", "employee"]
  },
  {
    pattern: /^\/clientData$/,
    layout: "Client Data",
    roles: ["admin", "employee"]
  },
  {
    pattern: /^\/tasks\//,
    layout: "Task Management",
    roles: ["employee"]
  },
  {
    pattern: /^\/bank-details$/,
    layout: "Bank Details",
    roles: ["admin"]
  },
  {
    pattern: /^\/createreport$/,
    layout: "Create Report",
    roles: ["admin", "employee", "client"]
  },
  {
    pattern: /^\/reports$/,
    layout: "Reports",
    roles: ["admin", "employee", "client"]
  },
  {
    pattern: /^\/clients$/,
    layout: "Clients",
    roles: ["admin"]
  },
  {
    pattern: /^\/generated-pdf$/,
    layout: "Generated PDF",
    roles: ["admin", "employee", "client"]
  },
  {
    pattern: /^\/checkprofit$/,
    layout: "Profit Analysis",
    roles: ["admin", "employee"]
  },
  {
    pattern: /^\/history$/,
    layout: "History",
    roles: ["admin"]
  },
  {
    pattern: /^\/profile$/,
    layout: "Profile",
    roles: ["admin", "employee"]
  },
  {
    pattern: /^\/intro$/,
    layout: "Introduction",
    roles: ["admin", "employee"]
  },
  {
    pattern: /^\/database$/,
    layout: "Database",
    roles: ["admin"]
  },
  {
    pattern: /^\/settings$/,
    layout: "Settings",
    roles: ["admin"]
  },
  {
    pattern: /^\/cma-advance-report$/,
    layout: "CMA Advance Report",
    roles: ["admin", "employee", "client"]
  },
  {
    pattern: /^\/cma-report(?:\/pdf)?$/,
    layout: "CMA Report",
    roles: ["admin", "employee", "client"]
  },
  {
    pattern: /^\/consultant-report(?:\/pdf)?$/,
    layout: "Consultant Report",
    roles: ["admin", "employee", "client"]
  },
  {
    pattern: /^\/create-consultant-report(?:-form)?$/,
    layout: "Create Consultant Report",
    roles: ["admin", "employee", "client"]
  },
  {
    pattern: /^\/MultestepForm$/,
    layout: "Create Report",
    roles: ["admin", "employee", "client"]
  }
];

const LayoutWrapper = ({ children }) => {
  const location = useLocation();
  const userRole = localStorage.getItem("userRole");

  // Find matching route configuration
  const getLayoutConfig = () => {
    const currentPath = location.pathname;
    
    for (const config of routeConfigs) {
      if (config.pattern.test(currentPath)) {
        // Check if user role has access to this route
        if (config.roles.includes(userRole)) {
          return { layout: config.layout };
        }
        break; // Route exists but user doesn't have access
      }
    }
    
    // Default fallback
    return { layout: "Dashboard" };
  };

  const { layout } = getLayoutConfig();

  // Special case for login page - no layout wrapper
  if (location.pathname === "/login" || location.pathname === "/pdf-demo/:reportId") {
    return <>{children}</>;
  }

  // Check if user is authenticated
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  if (!isLoggedIn || isLoggedIn !== "true") {
    return <>{children}</>;
  }

  return (
    <MainLayout dashboardType={layout}>
      {children}
    </MainLayout>
  );
};

export default LayoutWrapper;