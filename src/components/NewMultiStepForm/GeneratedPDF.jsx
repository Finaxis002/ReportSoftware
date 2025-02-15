import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import {
  styles,
  stylesCOP,
  stylesMOF,
  styleExpenses,
} from "./PDFComponents/Styles";

import "./View.css";
import { Document, PDFViewer } from "@react-pdf/renderer";

// Register chart.js components
import BasicDetails from "./PDFComponents/BasicDetails";
import MeansOfFinance from "./PDFComponents/MeansOfFinance";
import CostOfProject from "./PDFComponents/CostOfProject";
import ProjectedExpenses from "./PDFComponents/ProjectedExpenses";
import ProjectedRevenue from "./PDFComponents/ProjectedRevenue";
import ProjectedProfitability from "./PDFComponents/ProjectedProfitability";
import ProjectedSalaries from "./PDFComponents/ProjectedSalaries";
import ProjectedDepreciation from "./PDFComponents/ProjectedDepreciation";
import Repayment from "./PDFComponents/Repayment";
import IncomeTaxCalculation from "./PDFComponents/IncomeTaxCalculation";
import BreakEvenPoint from "./PDFComponents/BreakEvenPoint";

ChartJS.register(ArcElement, Tooltip, Legend);

const GeneratedPDF = () => {
  const [computedData, setComputedData] = useState({ netProfitBeforeTax: [] });
  const [computedData1, setComputedData1] = useState({
    totalDepreciationPerYear: [],
  });

  const [totalDepreciation, setTotalDepreciation] = useState([]);
  const [yearlyInterestLiabilities, setYearlyInterestLiabilities] = useState(
    []
  );
  const [userRole, setUserRole] = useState("");

  const location = useLocation();

  // ✅ Function to receive data from Repayment component
  const handleInterestCalculated = (liabilities) => {
    // console.log("📥 Received Interest Liabilities from Repayment:", liabilities);
    setYearlyInterestLiabilities(liabilities); // Update the state
  };

  // useEffect(() => {
  //   console.log("Updated Yearly Interest Liabilities in State:", yearlyInterestLiabilities);
  // }, [yearlyInterestLiabilities]);

  // Safe localStorage retrieval function
  const getStoredData = () => {
    try {
      const savedData = localStorage.getItem("FourthStepPRS");
      return savedData ? JSON.parse(savedData) : {};
    } catch (error) {
      console.error("Error parsing localStorage data:", error);
      return {};
    }
  };

  const [localData, setLocalData] = useState(getStoredData);

  const [years, setYears] = useState(5);

  useEffect(() => {
    // Example: Update years dynamically
    const interval = setInterval(() => {
      setYears((prev) => prev + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role) setUserRole(role);
  }, []);

  // Ensure `formData` is always an object and destructure safely
  const formData = location.state ? { ...location.state } : {};
  if (!formData?.AccountInformation) {
    return <div>No account information available</div>;
  }

  // Extract expenses safely
  const { Expenses = {} } = formData;
  const { normalExpense = [], directExpense = [] } = Expenses;

  // Format currency function
  const formatAmountInIndianStyle = (amount) => amount.toLocaleString("en-IN");

  // Salary & wages calculations
  const totalQuantity = normalExpense.reduce(
    (sum, expense) => sum + Number(expense.quantity || 0),
    0
  );

  const totalAnnualWages = normalExpense.reduce(
    (sum, expense) => sum + Number(expense.amount * expense.quantity * 12 || 0),
    0
  );

  const fringeCalculation = normalExpense.reduce(
    (sum, expense) =>
      sum + (Number(expense.amount) * Number(expense.quantity) * 12 * 0.5) / 10,
    0
  );

  const fringAndAnnualCalculation =
    normalExpense.reduce(
      (sum, expense) => sum + Number(expense.amount || 0),
      0
    ) +
    Number(totalAnnualWages) +
    Number(fringeCalculation);

  console.log("form Data : ", formData);
  return (
    <>
      <PDFViewer
        width="100%"
        height="800"
        style={{ overflow: "hidden" }}
        showToolbar={userRole !== "client" && userRole !== "employee"}
      >
        <Document>
          {/* basic details table */}
          <BasicDetails formData={formData} />

          {/* Means of Finance Table */}
          <MeansOfFinance formData={formData} localData={localData} />

          {/* cost of project table */}
          <CostOfProject formData={formData} localData={localData} />

          {/* Projected Salaries & Wages Table*/}
          <ProjectedSalaries
            localData={localData}
            normalExpense={normalExpense}
            formatAmountInIndianStyle={formatAmountInIndianStyle}
            totalAnnualWages={totalAnnualWages}
            totalQuantity={totalQuantity}
            fringAndAnnualCalculation={fringAndAnnualCalculation}
            fringeCalculation={fringeCalculation}
          />

          <ProjectedDepreciation
            formData={formData}
            localData={localData}
            setTotalDepreciation={setTotalDepreciation}
            onComputedData1={setComputedData1}
          />

          {/* Projected Expense Table Direct and Indirect*/}

          {/* Projected Expense Table Direct and Indirect */}
          <ProjectedExpenses
            formData={formData}
            yearlyInterestLiabilities={yearlyInterestLiabilities || []}
            totalDepreciationPerYear={totalDepreciation}
          />

          {/* Projected Revenue/ Sales */}

          <ProjectedRevenue formData={formData} />

          {/* Projected Profitability Statement */}

          {/* Projected Profitability Statement */}
          <ProjectedProfitability
            formData={formData}
            localData={localData}
            normalExpense={normalExpense}
            directExpense={directExpense}
            location={location}
            totalDepreciationPerYear={totalDepreciation}
            onComputedData={setComputedData}
            netProfitBeforeTax={computedData.netProfitBeforeTax || []}
            yearlyInterestLiabilities={yearlyInterestLiabilities || []}
          />
          <Repayment
            formData={formData}
            localData={localData}
            onInterestCalculated={handleInterestCalculated}
          />

          {computedData.netProfitBeforeTax.length > 0 && (
            <IncomeTaxCalculation
              formData={formData}
              netProfitBeforeTax={computedData.netProfitBeforeTax}
              totalDepreciationPerYear={computedData1.totalDepreciationPerYear}
            />
          )}

          <BreakEvenPoint formData={formData} />
        </Document>
      </PDFViewer>

      {/* <section>
        <h1 className="text-center py-5 bg-headPurple">Report Review</h1>
        <div className="w-75 mx-auto">
          <hr />
          <h5>Index</h5>
          <hr />

          <div ref={pdfRef} id="report-content" style={styles.page}>
           
            <div id="page4" style={styles.pageBreak}>
              <PrSetting />
            </div>

           
            <div id="page5" style={styles.pageBreak}>
              <ExpensesTable />
            </div>

            <div id="page6" style={styles.pageBreak}>
              <RevenueTable />
            </div>

         
            <div id="page7" style={styles.pageBreak}>
              <MoreDetailsTable />
            </div>

         
            <div id="page8" style={styles.pageBreak}>
              <DepreciationTable />
            </div>

           
            <div id="page9" style={styles.pageBreak}>
              <div className="w-50 mx-auto">
                <Bar options={options} data={tempGraphData} />
                <hr />
                <Doughnut data={tempGraphData} />
              </div>
            </div>
          </div>
        </div>
      </section> */}

      <section className="h-[100vh]"></section>
    </>
  );
};

export default GeneratedPDF;
