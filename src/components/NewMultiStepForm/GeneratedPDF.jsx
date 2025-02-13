import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import {
  styles,
  stylesCOP,
  stylesMOF,
  styleExpenses,
} from "./PDFComponents/Styles";

import "./View.css";
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  PDFViewer,
} from "@react-pdf/renderer";
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

ChartJS.register(ArcElement, Tooltip, Legend);

const GeneratedPDF = ({ years }) => {
  const [computedData, setComputedData] = useState({ netProfitBeforeTax: [] });
  const [computedData1, setComputedData1] = useState({ totalDepreciationPerYear: [] });
  const [localData, setLocalData] = useState(() => {
    const savedData = localStorage.getItem("FourthStepPRS");
    return savedData
      ? JSON.parse(savedData) // If saved data exists, parse and return it
      : {
          projectionYears: {
            name: "Projection Years",
            id: "projectionYears",
            value: 0, // Default value for ProjectionYears
            isCustom: false,
          },
          rateOfExpense: {
            name: "Rate of Expense",
            id: "rateOfExpense",
            value: 0, // Default value for Rate of Expense
            isCustom: false,
          },
          clientName: "", // Default value from formData
        };
  });

  const [userRole, setUserRole] = useState("");

  // ✅ Store totalDepreciationPerYear in state
  const [totalDepreciation, setTotalDepreciation] = useState([]);
  const [yearlyInterestLiabilities, setYearlyInterestLiabilities] = useState([]);


  // for OTP


  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  // ✅ Send OTP Request
  const sendOTP = async () => {
    setLoading(true);
    try {
      const response = await axios.post("https://backend-three-pink.vercel.app/send-otp");
      if (response.data.success) {
        setOtpSent(true);
        setError(""); // Clear errors if any
      }
    } catch (err) {
      setError("Failed to send OTP. Try again.");
    }
    setLoading(false);
  };

  // ✅ Verify OTP
  const verifyOTP = async () => {
    setLoading(true);
    try {
      const response = await axios.post("https://backend-three-pink.vercel.app/verify-otp", {
        otp,
      });

      if (response.data.success) {
        setOtpVerified(true);
        setError(""); // Clear errors
      }
    } catch (err) {
      setError("Invalid OTP! Please try again.");
    }
    setLoading(false);
  };



  useEffect(() => {
    const role = localStorage.getItem("userRole");
    setUserRole(role);
  }, []);


  const location = useLocation();

  // Remove sessionId and _id while keeping other data intact
  const { sessionId, _id, ...cleanFormData } = location.state || {};

  const formData = cleanFormData;

  if (!formData || !formData.AccountInformation) {
    return <div>No account information available</div>; // Fallback UI
  }

  const { Expenses = {} } = formData; // Destructure Expenses safely with fallback to empty object
  const { normalExpense = [], directExpense = [] } = Expenses;

  const formatAmountInIndianStyle = (amount) => {
    return amount.toLocaleString("en-IN"); // Format as per Indian number system
  };

  // salary  wages calculation
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
    0 // Initial value to ensure sum starts from zero
  );

  const fringAndAnnualCalculation =
    normalExpense.reduce((sum, expense) => sum, 0) +
    Number(totalAnnualWages) +
    Number(fringeCalculation);

  
    useEffect(() => {
      // console.log("Updated Yearly Interest Liabilities in State:", yearlyInterestLiabilities);
    }, [yearlyInterestLiabilities]);

  return (
    <>
     <div>
      {/* ✅ If userRole is "employee", ask for OTP */}
      {userRole === "employee" && !otpVerified ? (
        <div className="otp-modal">
          <h3>OTP Verification Required</h3>
          {!otpSent ? (
            <>
              <button onClick={sendOTP} disabled={loading}>
                {loading ? "Sending OTP..." : "Request OTP"}
              </button>
              {error && <p className="error">{error}</p>}
            </>
          ) : (
            <>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <button onClick={verifyOTP} disabled={loading}>
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
              {error && <p className="error">{error}</p>}
            </>
          )}
        </div>
      ) : (
        // ✅ Show PDF Viewer if OTP is verified or user is not an employee
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

          <ProjectedExpenses formData={formData} yearlyInterestLiabilities={yearlyInterestLiabilities}/>

          {/* Projected Revenue/ Sales */}

          <ProjectedRevenue formData={formData} />

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
            yearlyInterestLiabilities={yearlyInterestLiabilities}
          />

          <Repayment formData={formData} localData={localData}  onInterestCalculated={setYearlyInterestLiabilities}/>

          {computedData.netProfitBeforeTax.length > 0 && (
            <IncomeTaxCalculation formData={formData} netProfitBeforeTax={computedData.netProfitBeforeTax} 
            totalDepreciationPerYear={computedData1.totalDepreciationPerYear}/>
          )}
        </Document>
      </PDFViewer>
       )}
    </div>

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
