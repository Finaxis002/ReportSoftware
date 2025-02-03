import React, { useState , useEffect} from "react";
import ReactDOM from "react-dom/client";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../node_modules/bootstrap/dist/js/bootstrap.min.js";
import "../node_modules/bootstrap-icons/font/bootstrap-icons.css";
import "./index.css";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import ReportForm from "./components/ReportForm";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import ReportDashboard from "./components/ReportDashboard";
import { Provider } from "react-redux";
import store from "./redux/store";
import Authentication from "./components/Authentication";
import InputForm from "./components/InputForm.jsx";
import ReportReview from "./components/ReportReview.jsx";
import MultiStepForm from "./components/NewMultiStepForm/MultiStepForm.jsx";
import FinalReport from "./components/FinalReport.jsx";
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

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            {/* <Route
              path="/"
              element={
                isAuthenticated ? (
                  <Dashboard />
                ) : (
                  <MainLogin onLogin={handleLogin} />
                )
              }
            /> */}

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
            <Route path="/form" element={<InputForm />} />
            <Route
              path="/form2"
              element={
                <Authentication>
                  <ReportForm />
                </Authentication>
              }
            />
            <Route
              path="/report/review"
              element={
                <Authentication>
                  <ReportReview />
                </Authentication>
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

            <Route
              path="/report/:id"
              element={
                <Authentication>
                  <ReportDashboard />
                </Authentication>
              }
            />
            <Route
              path="/report/final"
              element={
                <Authentication>
                  <FinalReport />
                </Authentication>
              }
            />
            <Route path="/MultestepForm" element={<MultiStepForm />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/notifications" element={<Notification />} />
            <Route path="/generated-pdf" element={<GeneratedPDF />} />
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
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  );
};

// Render the app
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
