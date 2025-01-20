// src/components/FinalReport.js
import React from "react";
import { useLocation } from "react-router-dom";

const FinalReport = ({BasicDetails}) => {
    const location = useLocation();
    const reportData = location.state;
    
    console.log("Received Data:", reportData);
    
  return (
    <div className="container">
      <h2>Final Report</h2>
      <div className="row">
        <div className="col">
          <h3>Personal Details:</h3>
          <pre>{JSON.stringify(reportData.BasicDetails, null, 2)}</pre>
        </div>
        <div className="col">
          <h3>Means of Finance:</h3>
          <pre>{JSON.stringify(reportData.MeansOfFinance, null, 2)}</pre>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <h3>Cost of Project:</h3>
          <pre>{JSON.stringify(reportData.CostOfProject, null, 2)}</pre>
        </div>
        <div className="col">
          <h3>Report Settings:</h3>
          <pre>{JSON.stringify(reportData.ReportSettings, null, 2)}</pre>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <h3>Expenses:</h3>
          <pre>{JSON.stringify(reportData.Expense, null, 2)}</pre>
        </div>
        <div className="col">
          <h3>Revenue:</h3>
          <pre>{JSON.stringify(reportData.Revenue, null, 2)}</pre>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <h3>Details:</h3>
          <pre>{JSON.stringify(reportData.InfoDetails, null, 2)}</pre>
        </div>
        <div className="col">
          <h3>More Details:</h3>
          <pre>{JSON.stringify(reportData.MoreDetails, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
};

export default FinalReport;
