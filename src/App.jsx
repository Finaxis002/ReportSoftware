import React, { useState, useEffect, Suspense, lazy } from "react";
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

// Keep core components as regular imports (needed immediately)
import MainLogin from "./components/NewMultiStepForm/MainLogin.jsx";
import Dashboard from "./components/Dashboard";
import AdminDashboard from "./components/NewMultiStepForm/Dashboards/AdminDashboard/AdminDashboard.jsx";
import EmployeeDashboard from "./components/NewMultiStepForm/Dashboards/EmployeeDashboard/EmployeeDashboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import LayoutWrapper from "./components/Layout/LayoutWrapper.jsx";

// Lazy load components one by one
const MultiStepForm = lazy(() => import("./components/NewMultiStepForm/MultiStepForm.jsx"));
const GeneratedPDF = lazy(() => import("./components/NewMultiStepForm/GeneratedPDF.jsx"));
const ClientData = lazy(() => import("./components/NewMultiStepForm/ClientData.jsx"));
const CreateReport = lazy(() => import("./components/NewMultiStepForm/CreateReport.jsx"));
const Employees = lazy(() => import("./components/NewMultiStepForm/Employees/Employees.jsx"));
const AdminList = lazy(() => import("./components/NewMultiStepForm/Admin/AdminList.jsx"));
const Notification = lazy(() => import("./components/NewMultiStepForm/Notifications/Notification.jsx"));
const Tasks = lazy(() => import("./components/NewMultiStepForm/Employees/Tasks.jsx"));
const CheckProfit = lazy(() => import("./components/NewMultiStepForm/CheckProfit.jsx"));
const FourthStepPRS = lazy(() => import("./components/NewMultiStepForm/Steps/FourthStepPRS.jsx"));
const Reports = lazy(() => import("./components/NewMultiStepForm/Reports/Reports.jsx"));
const BankDetails = lazy(() => import("./components/NewMultiStepForm/BankDetails.jsx"));
const Clients = lazy(() => import("./components/NewMultiStepForm/Clients/Clients.jsx"));
const History = lazy(() => import("./components/NewMultiStepForm/History.jsx"));
const Profile = lazy(() => import("./components/NewMultiStepForm/Profile.jsx"));
const IntroPage = lazy(() => import("./components/NewMultiStepForm/IntroPage.jsx"));
const Database = lazy(() => import("./components/NewMultiStepForm/Database.jsx"));
const SettingsPage = lazy(() => import("./components/NewMultiStepForm/SettingsPage.jsx"));
const CMADataPdfGeneration = lazy(() => import("./components/NewMultiStepForm/CMADataPdfGeneration.jsx"));
const CmaPage = lazy(() => import("./components/NewMultiStepForm/Pages/CmaPage.jsx"));
const CmaPdfPage = lazy(() => import("./components/NewMultiStepForm/Pages/CmaPdfPage.jsx"));
const ConsultantReport = lazy(() => import("./components/NewMultiStepForm/Pages/ConsultantReport.jsx"));
const CreateConsultantReport = lazy(() => import("./components/NewMultiStepForm/Consultant/createConsultantReport.jsx"));
const CreateConsultantReportForm = lazy(() => import("./components/NewMultiStepForm/Consultant/createConsultantReportForm.jsx"));
const ConsultantGeneratedPDF = lazy(() => import("./components/NewMultiStepForm/Consultant/ConsultantReportPDF.jsx"));

// Loading spinner component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
  </div>
);

// Initialize query client
const queryClient = new QueryClient();

const App = () => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState("");
  const [generatePDfData, setGeneratedPDFData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const [pdfData, setPdfData] = useState();
  console.log("pdfData", pdfData);

  const location = useLocation();

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
      setIsLoading(false);
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
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <Routes>
          {/* Special routes that don't need layout wrapper */}
        
          
          <Route path="/fourthstepPRS" element={
            <Suspense fallback={<LoadingSpinner />}>
              <FourthStepPRS />
            </Suspense>
          } />

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
                  <Suspense fallback={<LoadingSpinner />}>
                    <Employees />
                  </Suspense>
                </LayoutWrapper>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <LayoutWrapper>
                  <Suspense fallback={<LoadingSpinner />}>
                    <AdminList />
                  </Suspense>
                </LayoutWrapper>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <LayoutWrapper>
                  <Suspense fallback={<LoadingSpinner />}>
                    <Notification />
                  </Suspense>
                </LayoutWrapper>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/clientData"
            element={
              <ProtectedRoute>
                <LayoutWrapper>
                  <Suspense fallback={<LoadingSpinner />}>
                    <ClientData />
                  </Suspense>
                </LayoutWrapper>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/tasks/:taskId"
            element={
              <ProtectedRoute>
                <LayoutWrapper>
                  <Suspense fallback={<LoadingSpinner />}>
                    <Tasks />
                  </Suspense>
                </LayoutWrapper>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/bank-details"
            element={
              <ProtectedRoute>
                <LayoutWrapper>
                  <Suspense fallback={<LoadingSpinner />}>
                    <BankDetails />
                  </Suspense>
                </LayoutWrapper>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/createreport"
            element={
              <ProtectedRoute>
                <LayoutWrapper>
                  <Suspense fallback={<LoadingSpinner />}>
                    <CreateReport
                      userRole={userRole}
                      userName={userRole === "employee" ? userName : null}
                    />
                  </Suspense>
                </LayoutWrapper>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/MultestepForm"
            element={
              <ProtectedRoute>
                <LayoutWrapper>
                  <Suspense fallback={<LoadingSpinner />}>
                    <MultiStepForm
                      receivedGeneratedPDFData={generatePDfData}
                      userRole={userRole}
                      userName={userRole === "employee" ? userName : null}
                    />
                  </Suspense>
                </LayoutWrapper>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <LayoutWrapper>
                  <Suspense fallback={<LoadingSpinner />}>
                    <Reports sendPdfData={setPdfData} />
                  </Suspense>
                </LayoutWrapper>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/clients"
            element={
              <ProtectedRoute>
                <LayoutWrapper>
                  <Suspense fallback={<LoadingSpinner />}>
                    <Clients />
                  </Suspense>
                </LayoutWrapper>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/generated-pdf"
            element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <GeneratedPDF
                    userRole={userRole}
                    userName={userRole === "employee" ? userName : null}
                    pdfData={pdfData}
                  />
                </Suspense>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/checkprofit"
            element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <CheckProfit />
                </Suspense>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <LayoutWrapper>
                  <Suspense fallback={<LoadingSpinner />}>
                    <History userRole={userRole} />
                  </Suspense>
                </LayoutWrapper>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <LayoutWrapper>
                  <Suspense fallback={<LoadingSpinner />}>
                    <Profile userRole={userRole} />
                  </Suspense>
                </LayoutWrapper>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/intro"
            element={
              <ProtectedRoute>
                <LayoutWrapper>
                  <Suspense fallback={<LoadingSpinner />}>
                    <IntroPage userRole={userRole} />
                  </Suspense>
                </LayoutWrapper>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/database"
            element={
              <ProtectedRoute>
                <LayoutWrapper>
                  <Suspense fallback={<LoadingSpinner />}>
                    <Database userRole={userRole} />
                  </Suspense>
                </LayoutWrapper>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <LayoutWrapper>
                  <Suspense fallback={<LoadingSpinner />}>
                    <SettingsPage userRole={userRole} />
                  </Suspense>
                </LayoutWrapper>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/cma-advance-report"
            element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <CMADataPdfGeneration />
                </Suspense>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/cma-report"
            element={
              <ProtectedRoute>
                <LayoutWrapper>
                  <Suspense fallback={<LoadingSpinner />}>
                    <CmaPage userRole={userRole} />
                  </Suspense>
                </LayoutWrapper>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/consultant-report"
            element={
              <ProtectedRoute>
                <LayoutWrapper>
                  <Suspense fallback={<LoadingSpinner />}>
                    <ConsultantReport userRole={userRole} />
                  </Suspense>
                </LayoutWrapper>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/create-consultant-report"
            element={
              <ProtectedRoute>
                <LayoutWrapper>
                  <Suspense fallback={<LoadingSpinner />}>
                    <CreateConsultantReport userRole={userRole} />
                  </Suspense>
                </LayoutWrapper>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/create-consultant-report-form"
            element={
              <ProtectedRoute>
                <LayoutWrapper>
                  <Suspense fallback={<LoadingSpinner />}>
                    <CreateConsultantReportForm userRole={userRole} />
                  </Suspense>
                </LayoutWrapper>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/consultant-report-pdf"
            element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <ConsultantGeneratedPDF userRole={userRole} />
                </Suspense>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/cma-report/pdf"
            element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <CmaPdfPage userRole={userRole} />
                </Suspense>
              </ProtectedRoute>
            }
          />
        </Routes>
      </QueryClientProvider>
    </Provider>
  );
};

export default App;