import React, { useState, useEffect, useMemo } from "react";
import ReactDOM from "react-dom/client";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../node_modules/bootstrap/dist/js/bootstrap.min.js";
import "../node_modules/bootstrap-icons/font/bootstrap-icons.css";
import "./index.css";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { Provider } from "react-redux";
import Authentication from "./components/Authentication.jsx";
import store from "./redux/store";
import MultiStepForm from "./components/NewMultiStepForm/MultiStepForm.jsx";
import GeneratedPDF from "./components/NewMultiStepForm/GeneratedPDF.jsx";
import ClientData from "./components/NewMultiStepForm/ClientData.jsx";
import MongoDB from "./components/NewMultiStepForm/MongoDB.jsx";
import DatabaseLogin from "./components/NewMultiStepForm/DatabaseLogin.jsx";
import MainLogin from "./components/NewMultiStepForm/MainLogin.jsx";
import CreateReport from "./components/NewMultiStepForm/CreateReport.jsx";
import Dashboard from "./components/Dashboard";
import AdminDashboard from "./components/NewMultiStepForm/Dashboards/AdminDashboard/AdminDashboard.jsx";
import EmployeeDashboard from "./components/NewMultiStepForm/Dashboards/EmployeeDashboard/EmployeeDashboard.jsx";
import Employees from "./components/NewMultiStepForm/Employees/Employees.jsx";
import Notification from "./components/NewMultiStepForm/Notifications/Notification.jsx";
import Tasks from "./components/NewMultiStepForm/Employees/Tasks.jsx";
import CheckProfit from "./components/NewMultiStepForm/CheckProfit.jsx";

// Initialize query client
const queryClient = new QueryClient();

const App = () => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const role = localStorage.getItem("userRole");
    if (isLoggedIn && role) {
      setIsAuthenticated(true);
      setUserRole(role);
    }
  }, []);

  // Handle login to set authentication status
  const handleLogin = (status, role) => {
    setIsAuthenticated(status);
    setUserRole(role);
  };

  const MemoizedPDF = useMemo(() => <GeneratedPDF />, []);

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
            <BrowserRouter>
            <Routes>
              <Route
                path="/"
                element={
                  isAuthenticated ? (
                    userRole === "admin" ? (
                      <AdminDashboard />
                    ) : userRole === "employee" ? (
                      <EmployeeDashboard />
                    ) : (
                      <Dashboard />
                    )
                  ) : (
                    <MainLogin onLogin={handleLogin} />
                  )
                }
              />

              <Route
                path="/login"
                element={
                  isAuthenticated ? (
                    <Navigate to="/login" replace />
                  ) : (
                    <MainLogin onLogin={handleLogin} />
                  )
                }
              />

              <Route path="/MultestepForm" element={<MultiStepForm />} />
              <Route path="/employees" element={<Employees />} />
              <Route path="/notifications" element={<Notification />} />
              <Route path="/clientData" element={<ClientData />} />
              <Route path="/tasks/:taskId" element={<Tasks />} />

              {/* Protect MongoDB route */}
              <Route
                path="/database"
                element={
                  isAuthenticated ? (
                    <MongoDB />
                  ) : (
                    <DatabaseLogin onLogin={handleLogin} />
                  )
                }
              />
              <Route path="/createreport" element={<CreateReport />} />
              
              {/* ✅ Correctly Placed Routes */}
              <Route path="/generated-pdf" element={<GeneratedPDF />} />
              <Route path="/checkprofit"  element={<CheckProfit />} />
            </Routes>
          </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  );
};

// Render the app
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
