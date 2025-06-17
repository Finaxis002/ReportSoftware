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
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import History from "./components/NewMultiStepForm/History.jsx";
import Profile from "./components/NewMultiStepForm/Profile.jsx";
import DemoPDFView from "./components/NewMultiStepForm/DemoPDFView.jsx";
import IntroPage from "./components/NewMultiStepForm/IntroPage.jsx";


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

  const location = useLocation(); // ✅ This is now inside the component

  useEffect(() => {
    const navigationType = performance.getEntriesByType("navigation")[0]?.type;
    if (location.pathname === "/MultestepForm" && navigationType === "reload") {
      localStorage.removeItem("selectedColor");
      localStorage.removeItem("selectedFont");
      localStorage.removeItem("pdfType");
    }
  }, [location.pathname]);

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

  // useEffect(() => {
  //   const handleUnload = () => {
  //     // Remove the keys on tab/browser close
  //     localStorage.removeItem("pdfType");
  //     localStorage.removeItem("selectedFont");
  //     localStorage.removeItem("selectedColor");
  //   };

  //   // ✅ Use unload for full tab/window close
  //   window.addEventListener("unload", handleUnload);

  //   return () => {
  //     window.removeEventListener("unload", handleUnload);
  //   };
  // }, []);

  return (
    <>
   
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <Routes>

          <Route path="/pdf-demo/:reportId" element={<DemoPDFView />} />

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

          <Route
            path="/employees"
            element={
              <ProtectedRoute>
                <Employees />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notification />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clientData"
            element={
              <ProtectedRoute>
                <ClientData />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks/:taskId"
            element={
              <ProtectedRoute>
                <Tasks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bank-details"
            element={
              <ProtectedRoute>
                <BankDetails />
              </ProtectedRoute>
            }
          />
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
              <ProtectedRoute>
                <CreateReport
                  userRole={userRole}
                  userName={userRole === "employee" ? userName : null}
                />
              </ProtectedRoute>
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
          <Route path="/fourthstepPRS" element={<FourthStepPRS />} />
          <Route
            path="/MultestepForm"
            element={
              <ProtectedRoute>
                <MultiStepForm
                  receivedGeneratedPDFData={generatePDfData}
                  userRole={userRole}
                  userName={userRole === "employee" ? userName : null}
                />
              </ProtectedRoute>
            }
          />
          <Route path="/employees" element={<Employees />} />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notification />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clientData"
            element={
              <ProtectedRoute>
                <ClientData />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks/:taskId"
            element={
              <ProtectedRoute>
                <Tasks />{" "}
              </ProtectedRoute>
            }
          />

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
              <ProtectedRoute>
                <CreateReport
                  userRole={userRole}
                  userName={userRole === "employee" ? userName : null}
                />
              </ProtectedRoute>
            }
          />

          {/* ✅ Correctly Placed Routes */}

          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                {" "}
                <Reports sendPdfData={setPdfData} />
              </ProtectedRoute>
            }
          />

          <Route path="/clients" element={<Clients />} />

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
                {" "}
                <CheckProfit />{" "}
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                {" "}
                <History userRole={userRole} />{" "}
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                {" "}
                <Profile userRole={userRole} />{" "}
              </ProtectedRoute>
            }
          />

          <Route
            path="/intro"
            element={
              <ProtectedRoute>
                {" "}
                <IntroPage userRole={userRole} />{" "}
              </ProtectedRoute>
            }
          />
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

