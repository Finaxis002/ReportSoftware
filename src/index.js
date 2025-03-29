import React, { useState, useEffect, useMemo } from "react";
import ReactDOM from "react-dom/client";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../node_modules/bootstrap/dist/js/bootstrap.min.js";
import "../node_modules/bootstrap-icons/font/bootstrap-icons.css";
import "./index.css";
import {
  BrowserRouter,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
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
import AdminList from "./components/NewMultiStepForm/Admin/AdminList.jsx";
import Notification from "./components/NewMultiStepForm/Notifications/Notification.jsx";
import Tasks from "./components/NewMultiStepForm/Employees/Tasks.jsx";
import CheckProfit from "./components/NewMultiStepForm/CheckProfit.jsx";
import FourthStepPRS from "./components/NewMultiStepForm/Steps/FourthStepPRS.jsx";
import Reports from "./components/NewMultiStepForm/Reports/Reports.jsx";
import BankDetails from "./components/NewMultiStepForm/BankDetails.jsx";
import Clients from "./components/NewMultiStepForm/Clients/Clients.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";

// Initialize query client
const queryClient = new QueryClient();

const App = () => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState("");
  const [generatePDfData, setGeneratedPDFData] = useState({});

  const [pdfData, setPdfData] = useState();
  console.log("pdfData", pdfData);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const role = localStorage.getItem("userRole");
    const storedEmployeeName = localStorage.getItem("employeeName");

    if (isLoggedIn && role) {
      setIsAuthenticated(true);
      setUserRole(role);

      if (role === "employee" && storedEmployeeName) {
        setUserName(storedEmployeeName); // ✅ Restore employee name
      }
    }
  }, []);

  const handleLogin = (status, role, userData) => {
    setIsAuthenticated(status);
    setUserRole(role);

    if (role === "employee" && userData?.employeeName) {
      setUserName(userData.employeeName); // ✅ Store employee name for employee role
      localStorage.setItem("employeeName", userData.employeeName); // ✅ Store employee name in localStorage
    }
  };

  useEffect(() => {
    const theme = localStorage.getItem("theme") || "light"; // fallback to light
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, []);


  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const role = localStorage.getItem("userRole");
  
    if (isLoggedIn && role) {
      setIsAuthenticated(true);
      setUserRole(role);
    }
  }, []);
  

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
                  <Navigate to="/" replace />
                ) : (
                  <MainLogin onLogin={handleLogin} />
                )
              }
            />

            {isAuthenticated ? (
              <>
                <Route path="/fourthstepPRS" element={<FourthStepPRS />} />
                <Route
                  path="/MultistepForm"
                  element={
                    <MultiStepForm
                      receivedGeneratedPDFData={generatePDfData}
                      userRole={userRole}
                      userName={userRole === "employee" ? userName : null}
                    />
                  }
                />
                <Route path="/employees" element={<Employees />} />
                <Route path="/admin" element={<AdminList />} />
                <Route path="/notifications" element={<Notification />} />
                <Route path="/clientData" element={<ClientData />} />
                <Route path="/tasks/:taskId" element={<Tasks />} />
                <Route path="/bank-details" element={<BankDetails />} />
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
                <Route
                  path="/createreport"
                  element={
                    <CreateReport
                      userRole={userRole}
                      userName={userRole === "employee" ? userName : null}
                    />
                  }
                />

                {/* ✅ Correctly Placed Routes */}
                <Route path="/generated-pdf" element={<GeneratedPDF />} />
                <Route path="/checkprofit" element={<CheckProfit />} />

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
                <Route path="/fourthstepPRS" element={<FourthStepPRS />} />
                <Route
                  path="/MultestepForm"
                  element={
                    <MultiStepForm
                      receivedGeneratedPDFData={generatePDfData}
                      userRole={userRole}
                      userName={userRole === "employee" ? userName : null}
                    />
                  }
                />
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
                <Route
                  path="/createreport"
                  element={
                    <CreateReport
                      userRole={userRole}
                      userName={userRole === "employee" ? userName : null}
                    />
                  }
                />

                {/* ✅ Correctly Placed Routes */}
                <Route
                  path="/generated-pdf"
                  element={
                    <GeneratedPDF
                      userRole={userRole}
                      userName={userRole === "employee" ? userName : null}
                      pdfData={pdfData}
                    />
                  }
                />
                <Route path="/checkprofit" element={<CheckProfit />} />

                <Route
                  path="/reports"
                  element={
                    <PrivateRoute isAuthenticated={isAuthenticated}>
                      <Reports sendPdfData={setPdfData} />
                    </PrivateRoute>
                  }
                />

                <Route path="/clients" element={<Clients />} />
              </>
            ) : (
              <Route path="*" element={<Navigate to="/login" replace />} />
            )}
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  );
};

// Render the app
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

///////////////////////////////////////////////////////////////////////////////////////////
