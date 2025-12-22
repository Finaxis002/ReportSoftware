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
import store from "./redux/store";
import MultiStepForm from "./components/NewMultiStepForm/MultiStepForm.jsx";
import GeneratedPDF from "./components/NewMultiStepForm/GeneratedPDF.jsx";
import ClientData from "./components/NewMultiStepForm/ClientData.jsx";
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
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import History from "./components/NewMultiStepForm/History.jsx";
import Profile from "./components/NewMultiStepForm/Profile.jsx";
import DemoPDFView from "./components/NewMultiStepForm/DemoPDFView.jsx";
import IntroPage from "./components/NewMultiStepForm/IntroPage.jsx";
import Database from "./components/NewMultiStepForm/Database.jsx";
import SettingsPage from "./components/NewMultiStepForm/SettingsPage.jsx";
import CMADataPdfGeneration from "./components/NewMultiStepForm/CMADataPdfGeneration.jsx";
import CmaPage from "./components/NewMultiStepForm/Pages/CmaPage.jsx";
import CmaPdfPage from "./components/NewMultiStepForm/Pages/CmaPdfPage.jsx";
import ConsultantReport from "./components/NewMultiStepForm/Pages/ConsultantReport.jsx";
import CreateConsultantReport from "./components/NewMultiStepForm/Consultant/createConsultantReport.jsx";
import CreateConsultantReportForm from "./components/NewMultiStepForm/Consultant/createConsultantReportForm.jsx";
import ConsultantGeneratedPDF from "./components/NewMultiStepForm/Consultant/ConsultantReportPDF.jsx";
import LayoutWrapper from "./components/Layout/LayoutWrapper.jsx";

// Initialize query client
const queryClient = new QueryClient();

const App = () => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState("");
  const [generatePDfData, setGeneratedPDFData] = useState({});
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  const [pdfData, setPdfData] = useState();
  console.log("pdfData", pdfData);

  const location = useLocation(); // ✅ This is now inside the component

  // Initialize authentication state on mount and page refresh
  useEffect(() => {
    const initializeAuth = () => {
      const isLoggedIn = localStorage.getItem("isLoggedIn");
      const role = localStorage.getItem("userRole");
      const storedEmployeeName = localStorage.getItem("employeeName");

      if (isLoggedIn === "true" && role) {
        setIsAuthenticated(true);
        setUserRole(role);

        if (role === "employee" && storedEmployeeName) {
          setUserName(storedEmployeeName);
        }
      }
      setIsLoading(false); // Set loading to false after checking auth
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    const navigationType = performance.getEntriesByType("navigation")[0]?.type;
    if (location.pathname === "/MultestepForm" && navigationType === "reload") {
      localStorage.removeItem("selectedColor");
      localStorage.removeItem("selectedFont");
      localStorage.removeItem("pdfType");
    }
  }, [location.pathname]);

  const handleLogin = (status, role, userData) => {
    setIsAuthenticated(status);
    setUserRole(role);

    if (role === "employee" && userData?.employeeName) {
      setUserName(userData.employeeName);
      localStorage.setItem("employeeName", userData.employeeName);
    }
  };

  useEffect(() => {
    const theme = localStorage.getItem("theme") || "light";
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, []);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <Routes>
            {/* Special routes that don't need layout wrapper */}
            <Route path="/pdf-demo/:reportId" element={<DemoPDFView />} />
            <Route
              path="/login"
              element={
                isAuthenticated ? (
                  <Navigate to="/" replace />
                ) : isLoading ? (
                  <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <MainLogin onLogin={handleLogin} />
                )
              }
            />

            {/* Main dashboard routes - these will be handled by LayoutWrapper automatically */}
            <Route
              path="/"
              element={
                isAuthenticated ? (
                  <LayoutWrapper>
                    {userRole === "admin" ? (
                      <AdminDashboard />
                    ) : userRole === "employee" ? (
                      <EmployeeDashboard />
                    ) : (
                      <Dashboard />
                    )}
                  </LayoutWrapper>
                ) : (
                  <MainLogin onLogin={handleLogin} />
                )
              }
            />

            {/* All other authenticated routes wrapped with LayoutWrapper */}
            <Route
              path="/employees"
              element={
                <ProtectedRoute>
                  <LayoutWrapper>
                    <Employees />
                  </LayoutWrapper>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <LayoutWrapper>
                    <AdminList />
                  </LayoutWrapper>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <LayoutWrapper>
                    <Notification />
                  </LayoutWrapper>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/clientData"
              element={
                <ProtectedRoute>
                  <LayoutWrapper>
                    <ClientData />
                  </LayoutWrapper>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/tasks/:taskId"
              element={
                <ProtectedRoute>
                  <LayoutWrapper>
                    <Tasks />
                  </LayoutWrapper>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/bank-details"
              element={
                <ProtectedRoute>
                  <LayoutWrapper>
                    <BankDetails />
                  </LayoutWrapper>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/createreport"
              element={
                <ProtectedRoute>
                  <LayoutWrapper>
                    <CreateReport
                      userRole={userRole}
                      userName={userRole === "employee" ? userName : null}
                    />
                  </LayoutWrapper>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/MultestepForm"
              element={
                <ProtectedRoute>
                  <LayoutWrapper>
                    <MultiStepForm
                      receivedGeneratedPDFData={generatePDfData}
                      userRole={userRole}
                      userName={userRole === "employee" ? userName : null}
                    />
                  </LayoutWrapper>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <LayoutWrapper>
                    <Reports sendPdfData={setPdfData} />
                  </LayoutWrapper>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/clients"
              element={
                <ProtectedRoute>
                  <LayoutWrapper>
                    <Clients />
                  </LayoutWrapper>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/generated-pdf"
              element={
                <ProtectedRoute>
                    <GeneratedPDF
                      userRole={userRole}
                      userName={userRole === "employee" ? userName : null}
                      pdfData={pdfData}
                    />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/checkprofit"
              element={
                <ProtectedRoute>
                    <CheckProfit />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <LayoutWrapper>
                    <History userRole={userRole} />
                  </LayoutWrapper>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <LayoutWrapper>
                    <Profile userRole={userRole} />
                  </LayoutWrapper>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/intro"
              element={
                <ProtectedRoute>
                  <LayoutWrapper>
                    <IntroPage userRole={userRole} />
                  </LayoutWrapper>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/database"
              element={
                <ProtectedRoute>
                  <LayoutWrapper>
                    <Database userRole={userRole} />
                  </LayoutWrapper>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <LayoutWrapper>
                    <SettingsPage userRole={userRole} />
                  </LayoutWrapper>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/cma-advance-report"
              element={
                <ProtectedRoute>
                    <CMADataPdfGeneration />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/cma-report"
              element={
                <ProtectedRoute>
                  <LayoutWrapper>
                    <CmaPage userRole={userRole} />
                  </LayoutWrapper>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/consultant-report"
              element={
                <ProtectedRoute>
                  <LayoutWrapper>
                    <ConsultantReport userRole={userRole} />
                  </LayoutWrapper>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/create-consultant-report"
              element={
                <ProtectedRoute>
                  <LayoutWrapper>
                    <CreateConsultantReport userRole={userRole} />
                  </LayoutWrapper>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/create-consultant-report-form"
              element={
                <ProtectedRoute>
                  <LayoutWrapper>
                    <CreateConsultantReportForm userRole={userRole} />
                  </LayoutWrapper>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/consultant-report-pdf"
              element={
                <ProtectedRoute>
                    <ConsultantGeneratedPDF userRole={userRole} />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/cma-report/pdf"
              element={
                <ProtectedRoute>
                    <CmaPdfPage userRole={userRole} />
                </ProtectedRoute>
              }
            />

            <Route path="/fourthstepPRS" element={<FourthStepPRS />} />
          </Routes>
        </QueryClientProvider>
      </Provider>
    </>
  );
};

// Render the app
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
