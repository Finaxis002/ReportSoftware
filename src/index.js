import React from "react";
import ReactDOM from "react-dom/client";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../node_modules/bootstrap/dist/js/bootstrap.min.js";
import "../node_modules/bootstrap-icons/font/bootstrap-icons.css";
import "./index.css";
import Dashboard from "./components/Dashboard";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
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

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            exact
            element={
              <Authentication>
                <Dashboard />
              </Authentication>
            }
          />
          <Route
            path="/form"
            element={
              <Authentication>
                <InputForm />
              </Authentication>
            }
          />
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
          <Route path="/login" element={<Login />} />
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

          <Route path="/generated-pdf" element={<GeneratedPDF />} />


          <Route path="/clientData" element={<ClientData />} />

        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </Provider>
);
