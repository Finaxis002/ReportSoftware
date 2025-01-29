import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

import "./View.css";
import ExpensesTable from "./Table/ExpensesTable";
import BasicDetailsTable from "./Table/BasicDetailsTable";
import MeansOfFinanceTable from "./Table/MeansOfFinanceTable";
import CostOfProjectTable from "./Table/CostOfProjectTable";
import PrSetting from "./Table/PrSetting";
import RevenueTable from "./Table/RevenueTable";
import MoreDetailsTable from "./Table/MoreDetailsTable";
import DepreciationTable from "./Table/DepreciationTable";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  PDFViewer,
} from "@react-pdf/renderer";

// Register chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const GeneratedPDF = ({ years }) => {
  const [localData, setLocalData] = useState(() => {
    const savedData = localStorage.getItem("FourthStepPRS");
    return savedData
      ? JSON.parse(savedData) // If saved data exists, parse and return it
      : {
          ProjectionYears: {
            name: "Projection Years",
            id: "ProjectionYears",
            value: "", // Default value
            isCustom: false,
          },
          rateOfExpense: {
            name: "Rate of Expense",
            id: "rateOfExpense",
            value: "",
            isCustom: false,
          },
          clientName: "", // Default value from formData
        };
  });

  const [userRole, setUserRole] = useState("");
  
    useEffect(() => {
      const role = localStorage.getItem("userRole");
      setUserRole(role);
    }, []);

  const [projectionYears, setProjectionYears] = useState(
    localData.ProjectionYears || 5
  ); // Default to 5 years

  const [rateOfExpense, setRetOfExpense] = useState(
    localData.rateOfExpense || 2
  );

  const [activeRowIndex, setActiveRowIndex] = useState(0);

  const [localDataaa, setLocalDataaa] = useState({
    StockValues: [
      {
        particular: "Opening Stock",
        years: Array.from({ length: years }).fill(0),
        isCustom: true,
      },
      {
        particular: "Closing Stock",
        years: Array.from({ length: years }).fill(0),
        isCustom: true,
      },
      {
        particular: "Withdrawals",
        years: Array.from({ length: years }).fill(0),
        isCustom: true,
      },
    ],
  });
  
  useEffect(() => {
    // Loop through the StockValues array and log each stock
    localDataaa.StockValues.forEach((item) => {
      if (item.particular === "Opening Stock") {
        console.log(`Opening Stock values: (${item.years.join(", ")})`);
      } else if (item.particular === "Closing Stock") {
        console.log(`Closing Stock values: (${item.years.join(", ")})`);
      }
    });
  }, [localDataaa]);
  

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Chart.js Bar Chart",
      },
    },
  };

  const labels = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
  ];

  const tempGraphData = {
    labels,
    datasets: [
      {
        label: "Dataset 1",
        data: [65, 59, 80, 81, 56, 55, 40],
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
      {
        label: "Dataset 2",
        data: [25, 49, 85, 71, 52, 58, 70],
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
    ],
  };

  const location = useLocation();
  const pdfRef = useRef(null);
  const formData = location.state;

  if (!formData || !formData.AccountInformation) {
    return <div>No account information available</div>; // Fallback UI
  }

  const styles = StyleSheet.create({
    page: {
      flexDirection: "column",
      backgroundColor: "#ffffff",
      paddingHorizontal: 30,
      paddingVertical: 10,
    },
    clientName: {
      fontSize: "16px",
      padding: 20,
      textTransform: "capitalize",
    },

    title: {
      fontSize: 10,
      textAlign: "center",
      marginBottom: 14,
      textTransform: "uppercase",
      color: "#fff",
      fontWeight: "bold",
      padding: 4,
      backgroundColor: "#172554",
    },
    table: {
      width: "100%",
      borderStyle: "solid",
      borderWidth: 1,
      borderColor: "#8a8b91",
    },
    tableRow: {
      flexDirection: "row",
    },
    tableHeader: {
      backgroundColor: "#172554",
      color: "#ffffff",
      textAlign: "left",
      flexDirection: "row",
    },
    serialNoCell: {
      width: "10%",
      padding: 3,
      fontSize: 10,
    },
    particularsCell: {
      width: "30%",
      padding: 3,
      borderStyle: "solid",
      borderWidth: 1,
      borderColor: "#000",
      fontSize: 10,
    },
    separatorCell: {
      width: "5%",
      padding: 3,

      fontSize: 10,
    },
    detailsCell: {
      width: "65%",
      padding: 3,
      borderStyle: "solid",
      borderWidth: 1,
      borderColor: "#000",
      fontSize: 10,
    },
    partnersSection: {
      marginTop: 16,
    },
    partnersTitle: {
      fontSize: 10,
      fontWeight: "bold",
      marginBottom: 8,
    },
    partnerCell: {
      width: "25%",
      padding: 3,
      borderLeft: "1px solid #8a8b91",
      fontSize: 10,
      color: "#fff",
    },
    serialNoCellDetail: {
      width: "10%",
      padding: 3,
      borderRight: "1px solid #8a8b91",
      borderBottom: "1px solid #8a8b91",
      fontSize: 10,
    },
    particularsCellsDetail: {
      width: "30%",
      padding: 3,
      borderBottom: "1px solid #8a8b91",
      fontSize: 10,
    },
    separatorCellDetail: {
      width: "5%",
      padding: 3,
      borderLeft: "1px solid #8a8b91",
      borderRight: "1px solid #8a8b91",
      borderBottom: "1px solid #8a8b91",
      fontSize: 10,
    },
    detailsCellDetail: {
      width: "65%",
      padding: 3,
      borderBottom: "1px solid #8a8b91",
      fontSize: 10,
    },
    partnerCellDetail: {
      width: "25%",
      padding: 2,
      borderStyle: "solid",
      borderWidth: 1,
      borderColor: "#000",
      fontSize: 10,
    },
    pdfViewer: {
      border: "none",
      backgroundColor: "white",
    },
  });

  const stylesMOF = StyleSheet.create({
    page: {
      width: "100%",
      height: "100%",
      padding: 8,
      backgroundColor: "white",
    },
    sectionHeader: {
      textAlign: "center",
      fontWeight: "bold",
      fontSize: 12,
      textTransform: "uppercase",
      padding: 4,
      backgroundColor: "#172554",
      color: "white",
    },
    table: {
      width: "100%",

      marginBottom: 6,
    },
    row: {
      flexDirection: "row",
      borderBottom: "1px solid #9CA3AF",
    },
    cell: {
      flex: 1,
      padding: 4,
      borderRight: "1px solid #9CA3AF",
      fontSize: 10,
    },
    Snocell: {
      padding: 4,
      borderRight: "1px solid #9CA3AF",
      fontSize: 10,
      paddingHorizontal: 20,
      width: 50,
    },
    boldCell: {
      fontWeight: "bold",
    },
    headerRow: {
      backgroundColor: "#172554",
      color: "white",
      marginTop: 10,
    },
    grayRow: {
      backgroundColor: "#E5E7EB",
    },
    totalRow: {
      fontWeight: "bold",
    },
    total: {
      border: "1px solid #000",
    },
  });

  const stylesCOP = StyleSheet.create({
    styleCOP: {
      backgroundColor: "white",
      overflow: "hidden",
      padding: 20,
    },
    heading: {
      textAlign: "center",
      color: "white",
      fontWeight: "bold",
      fontSize: 10,
      textTransform: "uppercase",
      marginBottom: 20,
      padding: 4,
      backgroundColor: "#172554",
    },
    tableContainer: {
      marginBottom: 6,
    },
    table: {
      width: "100%",
      borderWidth: 1,
      borderColor: "#d1d5db",
    },
    tableHeader: {
      backgroundColor: "#172554",
      color: "white",
    },
    tableHeaderGray: {
      backgroundColor: "#f2f2f2",
      color: "#000",
      display: "flex",
    },

    totalHeader: {
      color: "#000",
      textAlign: "left",
      flexDirection: "row",
      fontWeight: "bold",
    },
    tableCell: {
      padding: 4,
      borderWidth: 1,
      borderColor: "black",
    },
    totalCostRow: {
      fontWeight: "bold",
    },

    serialNoCellDetail: {
      width: "10%",
      padding: 3,
      borderRight: "1px solid #000",
      fontSize: 10,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    particularsCellsDetail: {
      width: "30%",
      padding: 3,
      borderRight: "1px solid #000",
      fontSize: 10,
    },
    separatorCellDetail: {
      width: "5%",
      padding: 3,
      borderLeft: "1px solid #8a8b91",
      borderRight: "1px solid #8a8b91",
      borderBottom: "1px solid #8a8b91",
      fontSize: 10,
    },
    detailsCellDetail: {
      width: "65%",
      padding: 3,
      borderRight: "1px solid #000",
      fontSize: 10,
      paddingLeft: 10,
    },
    boldText: {
      border: "2px solid #000",
      borderLeft: "none",
      fontWeight: "extrabold",
    },

    textCenter: {
      display: "flex",
      alignItems: "center",
      textAlign: "center",
      justifyContent: "center",
    },
    extraWidth: {
      width: "60%",
    },
    verticalPadding: {
      paddingVertical: 10,
    },
    extraWidthExpenses: {
      width: "100%",
    },
  });

  const styleExpenses = StyleSheet.create({
    headerRow: {
      backgroundColor: "#f2f2f2",
      color: "#000",
      marginTop: 10,
    },

    particularWidth: {
      width: 600,
    },
    sno: {
      width: 100,
      fontSize: 10,
      paddingLeft: 10,
      paddingTop: 5,
    },
    bordernone: {
      borderBottom: "none",
    },
    fontSmall: {
      fontSize: 8,
    },
    paddingx: {
      paddingHorizontal: 6,
    },
  });
  
  

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

  

  const { MoreDetails } = location.state || {}; // Ensure state exists

  return (
    <>
      <PDFViewer width="100%" height="800" style={{ overflow: "hidden" }} showToolbar={userRole !== "client"}>
        <Document>
          {/* basic details table */}
          <Page size="A4" style={styles.page}>
            <View>
              <Text style={styles.title}>Project Synopsis</Text>

              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={styles.serialNoCell}>S. No.</Text>
                  <Text style={styles.particularsCell}>Particulars</Text>
                  <Text style={styles.separatorCell}>:</Text>
                  <Text style={styles.detailsCell}>Details</Text>
                </View>

                {Object.entries(formData.AccountInformation).map(
                  ([key, value], index) => {
                    // Skip _id, __v, and allPartners fields
                    if (
                      key === "allPartners" ||
                      key === "_id" ||
                      key === "__v"
                    ) {
                      return null;
                    }

                    // Track the visible index for the fields
                    return (
                      <View style={styles.tableRow} key={index}>
                        <Text style={styles.serialNoCellDetail}>
                          {index + 0}
                        </Text>
                        <Text style={styles.particularsCellsDetail}>{key}</Text>
                        <Text style={styles.separatorCellDetail}>:</Text>
                        <Text style={styles.detailsCellDetail}>
                          {typeof value === "object"
                            ? JSON.stringify(value)
                            : String(value)}
                        </Text>
                      </View>
                    );
                  }
                )}
              </View>

              {formData.AccountInformation.allPartners && (
                <View style={styles.partnersSection}>
                  <Text style={styles.partnersTitle}>Partners Details</Text>
                  <View style={styles.table}>
                    <View style={styles.tableHeader}>
                      <Text style={styles.partnerCell}>S. No.</Text>
                      <Text style={styles.partnerCell}>Partner Name</Text>
                      <Text style={styles.partnerCell}>Partner Aadhar</Text>
                      <Text style={styles.partnerCell}>Partner DIN</Text>
                    </View>

                    {formData.AccountInformation.allPartners.map(
                      (partner, idx) => (
                        <View style={styles.tableRow} key={idx}>
                          <Text style={styles.partnerCellDetail}>
                            {idx + 1}
                          </Text>
                          <Text style={styles.partnerCellDetail}>
                            {partner.partnerName}
                          </Text>
                          <Text style={styles.partnerCellDetail}>
                            {partner.partnerAadhar}
                          </Text>
                          <Text style={styles.partnerCellDetail}>
                            {partner.partnerDin}
                          </Text>
                        </View>
                      )
                    )}
                  </View>
                </View>
              )}
            </View>
          </Page>

          {/* Means of Finance Table */}
          <Page style={styles.page}>
            <Text style={styles.clientName}>{localData.clientName}</Text>
            <Text style={styles.title}>Means of Finance</Text>

            {/* First Table */}
            <View style={stylesMOF.table}>
              <View style={[stylesMOF.row, stylesMOF.headerRow]}>
                <Text style={stylesMOF.Snocell}>S.No.</Text>
                <Text style={stylesMOF.cell}>Particulars</Text>
                <Text style={stylesMOF.cell}></Text>
                <Text style={stylesMOF.cell}>Amount</Text>
              </View>

              <View style={[stylesMOF.row, stylesMOF.headerRow]}>
                <Text style={stylesMOF.Snocell}>1</Text>
                <Text style={stylesMOF.cell}>
                  Towards Setting-up of Business
                </Text>
              </View>

              <View style={stylesMOF.row}>
                <Text style={stylesMOF.Snocell}>a.</Text>
                <Text style={stylesMOF.cell}>Promoter's Contribution</Text>
                <Text
                  style={stylesMOF.cell}
                >{`${formData.MeansOfFinance.TLPromoterContributionPercent}%`}</Text>
                <Text style={stylesMOF.cell}>
                  {formData.MeansOfFinance.termLoan.promoterContribution}
                </Text>
              </View>

              <View style={stylesMOF.row}>
                <Text style={stylesMOF.Snocell}>b.</Text>
                <Text style={stylesMOF.cell}>Term Loan from Bank</Text>
                <Text
                  style={stylesMOF.cell}
                >{`${formData.MeansOfFinance.TLTermLoanPercent}%`}</Text>
                <Text style={stylesMOF.cell}>
                  {formData.MeansOfFinance.termLoan.termLoan}
                </Text>
              </View>

              <View style={[stylesMOF.row, stylesMOF.totalRow]}>
                <Text style={stylesMOF.Snocell}></Text>
                <Text style={stylesMOF.cell}></Text>
                <Text style={[stylesMOF.cell, stylesMOF.total]}>Total</Text>
                <Text style={[stylesMOF.cell, stylesMOF.total]}>
                  {formData.MeansOfFinance.totalTermLoan}
                </Text>
              </View>

              <View style={[stylesMOF.row, stylesMOF.headerRow]}>
                <Text style={[stylesMOF.Snocell, stylesMOF.boldCell]}>2</Text>
                <Text style={[stylesMOF.cell, stylesMOF.boldCell]}>
                  Towards Working Capital
                </Text>
              </View>

              <View style={stylesMOF.row}>
                <Text style={stylesMOF.Snocell}>a.</Text>
                <Text style={stylesMOF.cell}>Promoter's Contribution</Text>
                <Text
                  style={stylesMOF.cell}
                >{`${formData.MeansOfFinance.WCPromoterContributionPercent}%`}</Text>
                <Text style={stylesMOF.cell}>
                  {formData.MeansOfFinance.workingCapital.promoterContribution}
                </Text>
              </View>

              <View style={stylesMOF.row}>
                <Text style={stylesMOF.Snocell}>b.</Text>
                <Text style={stylesMOF.cell}>Loan from Bank</Text>
                <Text
                  style={stylesMOF.cell}
                >{`${formData.MeansOfFinance.WCTermLoanPercent}%`}</Text>
                <Text style={stylesMOF.cell}>
                  {formData.MeansOfFinance.workingCapital.termLoan}
                </Text>
              </View>

              <View style={[stylesMOF.row, stylesMOF.totalRow]}>
                <Text style={stylesMOF.Snocell}></Text>
                <Text style={stylesMOF.cell}></Text>
                <Text style={[stylesMOF.cell, stylesMOF.total]}>Total</Text>
                <Text style={[stylesMOF.cell, stylesMOF.total]}>
                  {formData.MeansOfFinance.totalWorkingCapital}
                </Text>
              </View>
            </View>

            {/* Second Table */}
            <View style={stylesMOF.table}>
              <View style={[stylesMOF.row, stylesMOF.headerRow]}>
                <Text style={stylesMOF.Snocell}></Text>
                <Text style={stylesMOF.cell} colSpan="3">
                  TOTAL
                </Text>
              </View>

              <View style={stylesMOF.row}>
                <Text style={stylesMOF.Snocell}></Text>
                <Text style={stylesMOF.cell}>
                  Total Promoter's Contribution
                </Text>
                <Text
                  style={stylesMOF.cell}
                >{`${formData.MeansOfFinance.TotalPromoterContributionPercent}%`}</Text>
                <Text style={stylesMOF.cell}>
                  {formData.MeansOfFinance.totalPC}
                </Text>
              </View>

              <View style={stylesMOF.row}>
                <Text style={stylesMOF.Snocell}></Text>
                <Text style={stylesMOF.cell}>Total Bank Loan</Text>
                <Text
                  style={stylesMOF.cell}
                >{`${formData.MeansOfFinance.TotalTermLoanPercent}%`}</Text>
                <Text style={stylesMOF.cell}>
                  {formData.MeansOfFinance.totalTL}
                </Text>
              </View>

              <View style={[stylesMOF.row, stylesMOF.totalRow]}>
                <Text style={stylesMOF.Snocell}></Text>
                <Text style={stylesMOF.cell}></Text>
                <Text style={[stylesMOF.cell, stylesMOF.total]}>Total</Text>
                <Text style={[stylesMOF.cell, stylesMOF.total]}>
                  {formData.MeansOfFinance.total}
                </Text>
              </View>
            </View>
          </Page>

          {/* cost of project table */}
          <Page size="A4" style={stylesCOP.styleCOP}>
            <Text style={styles.clientName}>{localData.clientName}</Text>
            <View style={stylesCOP.heading}>
              <Text>Cost Of Project</Text>
            </View>

            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.serialNoCell}>S.No.</Text>
                <Text style={styles.detailsCell}>Particulars</Text>
                <Text style={styles.particularsCell}>Amount</Text>
              </View>
              {formData.CostOfProject &&
                Object.entries(formData.CostOfProject).map(
                  ([key, field], index) => (
                    <View key={key} style={styles.tableRow}>
                      <Text style={stylesCOP.serialNoCellDetail}>
                        {index + 1}
                      </Text>
                      <Text style={stylesCOP.detailsCellDetail}>
                        {field.name}
                      </Text>
                      <Text style={stylesCOP.particularsCellsDetail}>
                        {field.amount}
                      </Text>
                    </View>
                  )
                )}

              <View style={stylesCOP.totalHeader}>
                <Text style={stylesCOP.serialNoCellDetail}></Text>

                <Text style={[stylesCOP.detailsCellDetail, stylesCOP.boldText]}>
                  Total Cost of Project
                </Text>
                <Text
                  style={[stylesCOP.particularsCellsDetail, stylesCOP.boldText]}
                >
                  {Object.values(formData.CostOfProject).reduce(
                    (sum, field) => sum + field.amount,
                    0
                  )}
                </Text>
              </View>
            </View>
          </Page>

          {/* Projected Salaries & Wages Table*/}
          <Page size="A4" style={stylesCOP.styleCOP}>
            <Text style={styles.clientName}>{localData.clientName}</Text>
            <View style={stylesCOP.heading}>
              <Text>Projected Salaries & Wages</Text>
            </View>

            <View style={styles.table}>
              <View style={[styles.tableHeader]}>
                <Text style={styles.serialNoCell}>S.No.</Text>
                <Text style={[styles.particularsCell, stylesCOP.textCenter]}>
                  Type Of Worker
                </Text>
                <Text style={[styles.particularsCell, stylesCOP.textCenter]}>
                  No. of Workers{" "}
                </Text>
                <Text style={[styles.particularsCell, stylesCOP.textCenter]}>
                  Wages per month
                </Text>
                <Text style={[styles.particularsCell, stylesCOP.textCenter]}>
                  Annual Wages & Salaries
                </Text>
              </View>
              {normalExpense.map((expense, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text
                    style={[stylesCOP.serialNoCellDetail, stylesCOP.textCenter]}
                  >
                    {index + 1}
                  </Text>

                  <Text
                    style={[
                      stylesCOP.particularsCellsDetail,
                      stylesCOP.textCenter,
                    ]}
                  >
                    {expense.name || "N/A"}
                  </Text>
                  <Text
                    style={[
                      stylesCOP.particularsCellsDetail,
                      stylesCOP.textCenter,
                    ]}
                  >
                    {expense.quantity || "0"}
                  </Text>
                  <Text
                    style={[
                      stylesCOP.particularsCellsDetail,
                      stylesCOP.textCenter,
                    ]}
                  >
                    {formatAmountInIndianStyle(expense.amount || 0)}
                  </Text>
                  <Text
                    style={[
                      stylesCOP.particularsCellsDetail,
                      stylesCOP.textCenter,
                    ]}
                  >
                    {" "}
                    {formatAmountInIndianStyle(
                      expense.amount * expense.quantity * 12
                    )}
                  </Text>
                </View>
              ))}

              <View style={styles.tableRow}>
                <Text style={stylesCOP.serialNoCellDetail}></Text>

                <Text
                  style={[
                    stylesCOP.particularsCellsDetail,
                    stylesCOP.textCenter,
                  ]}
                >
                  Total
                </Text>
                <Text
                  style={[
                    stylesCOP.particularsCellsDetail,
                    stylesCOP.textCenter,
                    stylesCOP.boldText,
                  ]}
                >
                  {totalQuantity}
                </Text>
                <Text
                  style={[
                    stylesCOP.particularsCellsDetail,
                    stylesCOP.textCenter,
                  ]}
                ></Text>
                <Text
                  style={[
                    stylesCOP.particularsCellsDetail,
                    stylesCOP.textCenter,
                    stylesCOP.boldText,
                  ]}
                >
                  {formatAmountInIndianStyle(totalAnnualWages)}
                </Text>
              </View>

              <View style={styles.tableRow}>
                <Text style={stylesCOP.serialNoCellDetail}></Text>

                <Text
                  style={[
                    stylesCOP.particularsCellsDetail,
                    stylesCOP.textCenter,
                  ]}
                ></Text>
                <Text
                  style={[
                    stylesCOP.particularsCellsDetail,
                    stylesCOP.textCenter,
                  ]}
                ></Text>
                <Text
                  style={[
                    stylesCOP.particularsCellsDetail,
                    stylesCOP.textCenter,
                    stylesCOP.verticalPadding,
                  ]}
                >
                  Add: Fringe Benefits @ 5 %
                </Text>
                <Text
                  style={[
                    stylesCOP.particularsCellsDetail,
                    stylesCOP.textCenter,
                    stylesCOP.verticalPadding,
                  ]}
                >
                  {" "}
                  {formatAmountInIndianStyle(fringeCalculation)}
                </Text>
              </View>

              <View style={styles.tableRow}>
                <Text style={stylesCOP.serialNoCellDetail}></Text>

                <Text
                  style={[
                    stylesCOP.particularsCellsDetail,
                    stylesCOP.textCenter,
                  ]}
                ></Text>
                <Text
                  style={[
                    stylesCOP.particularsCellsDetail,
                    stylesCOP.textCenter,
                    stylesCOP.boldText,
                    stylesCOP.extraWidth,
                    stylesCOP.verticalPadding,
                  ]}
                >
                  {" "}
                  Total Wages during the year
                </Text>

                <Text
                  style={[
                    stylesCOP.particularsCellsDetail,
                    stylesCOP.textCenter,
                    stylesCOP.boldText,
                    stylesCOP.verticalPadding,
                  ]}
                >
                  {" "}
                  {formatAmountInIndianStyle(fringAndAnnualCalculation)}
                </Text>
              </View>
            </View>
          </Page>

          {/* Projected Expense Table Direct and Indirect*/}

          <Page
            size="A4"
            orientation={projectionYears <= 7 ? "portrait" : "landscape"}
          >
            <View style={styleExpenses.paddingx}>
              <Text style={styles.clientName}>{localData.clientName}</Text>
              <View style={stylesCOP.heading}>
                <Text>Projected Expenses</Text>
              </View>

              <View style={[styles.table]}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.serialNoCell, styleExpenses.sno]}>
                    S. No.
                  </Text>
                  <Text
                    style={[styles.detailsCell, styleExpenses.particularWidth]}
                  >
                    Particulars
                  </Text>
                  {[...Array(parseInt(projectionYears) || 0)].map(
                    (_, index) => (
                      <Text key={index} style={styles.particularsCell}>
                        Year {index + 1}
                      </Text>
                    )
                  )}
                </View>
              </View>

              {/* direct expenses */}
              <View style={[stylesMOF.row, styleExpenses.headerRow]}>
                <Text style={[styleExpenses.sno]}>A</Text>
                <Text style={stylesMOF.cell}>Direct Expenses</Text>
              </View>

              {normalExpense.map((expense, index) => {
                if (index !== activeRowIndex) return null; // Only render the active row

                return (
                  <View key={index} style={[stylesMOF.row, styles.tableRow]}>
                    <Text
                      style={[
                        stylesCOP.serialNoCellDetail,
                        styleExpenses.sno,
                        styleExpenses.bordernone,
                      ]}
                    >
                      1
                    </Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      Salary and Wages
                    </Text>

                    {/* Map through projection years to display calculations */}
                    {[...Array(parseInt(projectionYears) || 0)].map(
                      (_, yearIndex) => {
                        const Annual = Number(totalAnnualWages) || 0;
                        const initialValue = Annual; // Base annual value calculation

                        // For the first year (first column), show totalAnnualWages
                        const calculatedValue =
                          yearIndex === 0
                            ? initialValue // For Year 1, just show the base value
                            : initialValue *
                              Math.pow(1 + rateOfExpense / 100, yearIndex); // Apply growth for subsequent years

                        return (
                          <Text
                            key={yearIndex}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {yearIndex === 0
                              ? formatAmountInIndianStyle(Annual.toFixed(2)) // For Year 1, show the original totalAnnualWages
                              : formatAmountInIndianStyle(
                                  calculatedValue.toFixed(2)
                                )}{" "}
                  
                          </Text>
                        );
                      }
                    )}
                  </View>
                );
              })}

              {directExpense
                .filter((expense) => expense.type === "direct")
                .map((expense, index) => {
                  const baseValue = Number(expense.value) || 0;
                  const initialValue = baseValue * 12;

                  return (
                    <View key={index} style={[stylesMOF.row, styles.tableRow]}>
                      <Text
                        style={[
                          stylesCOP.serialNoCellDetail,
                          styleExpenses.sno,
                          styleExpenses.bordernone,
                        ]}
                      >
                        {index + 2}
                      </Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        {expense.name}
                      </Text>
                      {[...Array(parseInt(projectionYears) || 0)].map(
                        (_, yearIndex) => {
                          const calculatedValue =
                            initialValue *
                            Math.pow(1 + rateOfExpense / 100, yearIndex);
                          return (
                            <Text
                              key={yearIndex}
                              style={[
                                stylesCOP.particularsCellsDetail,
                                styleExpenses.fontSmall,
                              ]}
                            >
                              {calculatedValue.toFixed(2)}
                            </Text>
                          );
                        }
                      )}
                    </View>
                  );
                })}

              <View style={[styles.tableRow, styles.totalRow]}>
                <Text
                  style={[
                    stylesCOP.serialNoCellDetail,
                    styleExpenses.sno,
                    styleExpenses.bordernone,
                  ]}
                ></Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  Total
                </Text>
                {[...Array(parseInt(projectionYears) || 0)].map(
                  (_, yearIndex) => {
                    const totalValue = directExpense
                      .filter((expense) => expense.type === "direct")
                      .reduce((sum, expense) => {
                        const baseValue = Number(expense.value) || 0;
                        const initialValue = baseValue * 12;
                        return (
                          sum +
                          initialValue *
                            Math.pow(1 + rateOfExpense / 100, yearIndex)
                        );
                      }, 0);
                    return (
                      <Text
                        key={yearIndex}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          stylesCOP.boldText,
                          styleExpenses.fontSmall,
                        ]}
                      >
                        {formatAmountInIndianStyle(totalValue.toFixed(2))}
                      </Text>
                    );
                  }
                )}
              </View>

              {/* indirect expense */}
              <View style={[stylesMOF.row, styleExpenses.headerRow]}>
                <Text style={[styleExpenses.sno]}>B</Text>
                <Text style={stylesMOF.cell}>Indirect Expenses</Text>
              </View>

              {directExpense
                .filter((expense) => expense.type === "indirect")
                .map((expense, index) => {
                  const baseValue = Number(expense.value) || 0;
                  const initialValue = baseValue * 12;

                  return (
                    <View key={index} style={[stylesMOF.row, styles.tableRow]}>
                      <Text
                        style={[
                          stylesCOP.serialNoCellDetail,
                          styleExpenses.sno,
                          styleExpenses.bordernone,
                        ]}
                      >
                        {index + 1}
                      </Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        {expense.name}
                      </Text>
                      {[...Array(parseInt(projectionYears) || 0)].map(
                        (_, yearIndex) => {
                          const calculatedValue =
                            initialValue *
                            Math.pow(1 + rateOfExpense / 100, yearIndex);
                          return (
                            <Text
                              key={yearIndex}
                              style={[
                                stylesCOP.particularsCellsDetail,
                                styleExpenses.fontSmall,
                              ]}
                            >
                              {formatAmountInIndianStyle(
                                calculatedValue.toFixed(2)
                              )}
                            </Text>
                          );
                        }
                      )}
                    </View>
                  );
                })}

              <View style={[styles.tableRow, styles.totalRow]}>
                <Text
                  style={[
                    stylesCOP.serialNoCellDetail,
                    styleExpenses.sno,
                    styleExpenses.bordernone,
                  ]}
                ></Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  Total
                </Text>
                {[...Array(parseInt(projectionYears) || 0)].map(
                  (_, yearIndex) => {
                    const totalValue = directExpense
                      .filter((expense) => expense.type === "indirect")
                      .reduce((sum, expense) => {
                        const baseValue = Number(expense.value) || 0;
                        const initialValue = baseValue * 12;
                        return (
                          sum +
                          initialValue *
                            Math.pow(1 + rateOfExpense / 100, yearIndex)
                        );
                      }, 0);
                    return (
                      <Text
                        key={yearIndex}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          stylesCOP.boldText,
                          styleExpenses.fontSmall,
                        ]}
                      >
                        {totalValue.toFixed(2)}
                      </Text>
                    );
                  }
                )}
              </View>

              {/* total a and b  */}

              <View style={[stylesMOF.row, styleExpenses.headerRow]}>
                <Text style={[styleExpenses.sno]}></Text>
                <Text style={stylesMOF.cell}>Grand Total</Text>
              </View>

              <View style={[styles.tableRow, styles.totalRow]}>
                <Text
                  style={[
                    stylesCOP.serialNoCellDetail,
                    styleExpenses.sno,
                    styleExpenses.bordernone,
                  ]}
                ></Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  Total (A + B)
                </Text>

                {[...Array(parseInt(projectionYears) || 0)].map(
                  (_, yearIndex) => {
                    // Calculate total direct expenses for each year
                    const totalDirectValue = directExpense
                      .filter((expense) => expense.type === "direct")
                      .reduce((sum, expense) => {
                        const baseValue = Number(expense.value) || 0;
                        const initialValue = baseValue * 12;
                        return (
                          sum +
                          initialValue *
                            Math.pow(1 + rateOfExpense / 100, yearIndex)
                        );
                      }, 0);

                    // Calculate total indirect expenses for each year
                    const totalIndirectValue = directExpense
                      .filter((expense) => expense.type === "indirect")
                      .reduce((sum, expense) => {
                        const baseValue = Number(expense.value) || 0;
                        const initialValue = baseValue * 12;
                        return (
                          sum +
                          initialValue *
                            Math.pow(1 + rateOfExpense / 100, yearIndex)
                        );
                      }, 0);

                    // Sum of direct and indirect expenses for each year
                    const grandTotal = totalDirectValue + totalIndirectValue;

                    return (
                      <Text
                        key={yearIndex}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          stylesCOP.boldText,
                          styleExpenses.fontSmall,
                        ]}
                      >
                        {formatAmountInIndianStyle(grandTotal.toFixed(2))}
                      </Text>
                    );
                  }
                )}
              </View>
            </View>
          </Page>

          {/* Projected Profitability Statement */}

          <Page
            size="A4"
            orientation={projectionYears <= 7 ? "portrait" : "landscape"}
          >
            <View style={styleExpenses.paddingx}>
              <Text style={styles.clientName}>{localData.clientName}</Text>
              <View style={stylesCOP.heading}>
                <Text>Projected Profitability Statement</Text>
              </View>

              <View style={[styles.table]}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.serialNoCell, styleExpenses.sno]}>
                    S. No.
                  </Text>
                  <Text
                    style={[styles.detailsCell, styleExpenses.particularWidth]}
                  >
                    Particulars
                  </Text>
                  {[...Array(parseInt(projectionYears) || 0)].map(
                    (_, index) => (
                      <Text key={index} style={styles.particularsCell}>
                        Year {index + 1}
                      </Text>
                    )
                  )}
                </View>
              </View>

              {/* Closing Stock / Inventory */}
              <View style={[stylesMOF.row, styles.tableRow]}>
                <Text
                  style={[
                    stylesCOP.serialNoCellDetail,
                    styleExpenses.sno,
                    styleExpenses.bordernone,
                  ]}
                >
                  B
                </Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  Add: Closing Stock / Inventory
                </Text>

                {/* Display only the 'Closing Stock' values for each year */}
                {[...Array(parseInt(projectionYears) || 0)].map((_, y) => (
                  <Text
                    key={y}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                    ]}
                  >
                    {MoreDetails.StockValues &&
                    MoreDetails.StockValues[1] &&
                    MoreDetails.StockValues[1].years &&
                    MoreDetails.StockValues[1].years[y] !== undefined
                      ? MoreDetails.StockValues[1].years[y]
                      : 0}
                  </Text>
                ))}
              </View>

              {/* Opening Stock / Inventory */}
              <View style={[stylesMOF.row, styles.tableRow]}>
                <Text
                  style={[
                    stylesCOP.serialNoCellDetail,
                    styleExpenses.sno,
                    styleExpenses.bordernone,
                  ]}
                ></Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  Less: Opening Stock / Inventory
                </Text>

                {[...Array(parseInt(projectionYears) || 0)].map((_, y) => (
                  <Text
                    key={y}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                    ]}
                  >
                    {MoreDetails.StockValues &&
                    MoreDetails.StockValues[0] &&
                    MoreDetails.StockValues[0].years &&
                    MoreDetails.StockValues[0].years[y] !== undefined
                      ? MoreDetails.StockValues[0].years[y]
                      : 0}
                  </Text>
                ))}
              </View>

              {/* direct expenses */}
              <View style={[stylesMOF.row, styleExpenses.headerRow]}>
                <Text style={[styleExpenses.sno]}>C</Text>
                <Text style={stylesMOF.cell}>Less : Direct Expenses</Text>
              </View>

              {normalExpense.map((expense, index) => {
                if (index !== activeRowIndex) return null; // Only render the active row

                return (
                  <View key={index} style={[stylesMOF.row, styles.tableRow]}>
                    <Text
                      style={[
                        stylesCOP.serialNoCellDetail,
                        styleExpenses.sno,
                        styleExpenses.bordernone,
                      ]}
                    >
                      1
                    </Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      Salary and Wages
                    </Text>

                    {/* Map through projection years to display calculations */}
                    {[...Array(parseInt(projectionYears) || 0)].map(
                      (_, yearIndex) => {
                        const Annual = Number(totalAnnualWages) || 0;
                        const initialValue = Annual; // Base annual value calculation

                        // For the first year (first column), show totalAnnualWages
                        const calculatedValue =
                          yearIndex === 0
                            ? initialValue // For Year 1, just show the base value
                            : initialValue *
                              Math.pow(1 + rateOfExpense / 100, yearIndex); // Apply growth for subsequent years

                        return (
                          <Text
                            key={yearIndex}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {yearIndex === 0
                              ? formatAmountInIndianStyle(Annual.toFixed(2)) // For Year 1, show the original totalAnnualWages
                              : formatAmountInIndianStyle(
                                  calculatedValue.toFixed(2)
                                )}{" "}
                  
                          </Text>
                        );
                      }
                    )}
                  </View>
                );
              })}

              {directExpense
                .filter((expense) => expense.type === "direct")
                .map((expense, index) => {
                  const baseValue = Number(expense.value) || 0;
                  const initialValue = baseValue * 12;

                  return (
                    <View key={index} style={[stylesMOF.row, styles.tableRow]}>
                      <Text
                        style={[
                          stylesCOP.serialNoCellDetail,
                          styleExpenses.sno,
                          styleExpenses.bordernone,
                        ]}
                      >
                        {index + 2}
                      </Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        {expense.name}
                      </Text>
                      {[...Array(parseInt(projectionYears) || 0)].map(
                        (_, yearIndex) => {
                          const calculatedValue =
                            initialValue *
                            Math.pow(1 + rateOfExpense / 100, yearIndex);
                          return (
                            <Text
                              key={yearIndex}
                              style={[
                                stylesCOP.particularsCellsDetail,
                                styleExpenses.fontSmall,
                              ]}
                            >
                              {calculatedValue.toFixed(2)}
                            </Text>
                          );
                        }
                      )}
                    </View>
                  );
                })}

              <View style={[styles.tableRow, styles.totalRow]}>
                <Text
                  style={[
                    stylesCOP.serialNoCellDetail,
                    styleExpenses.sno,
                    styleExpenses.bordernone,
                  ]}
                ></Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  Total
                </Text>
                {[...Array(parseInt(projectionYears) || 0)].map(
                  (_, yearIndex) => {
                    const totalValue = directExpense
                      .filter((expense) => expense.type === "direct")
                      .reduce((sum, expense) => {
                        const baseValue = Number(expense.value) || 0;
                        const initialValue = baseValue * 12;
                        return (
                          sum +
                          initialValue *
                            Math.pow(1 + rateOfExpense / 100, yearIndex)
                        );
                      }, 0);
                    return (
                      <Text
                        key={yearIndex}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          stylesCOP.boldText,
                          styleExpenses.fontSmall,
                        ]}
                      >
                        {formatAmountInIndianStyle(totalValue.toFixed(2))}
                      </Text>
                    );
                  }
                )}
              </View>

              {/* indirect expense */}
              <View style={[stylesMOF.row, styleExpenses.headerRow]}>
                <Text style={[styleExpenses.sno]}>E</Text>

                <Text style={stylesMOF.cell}>Less:Indirect Expenses</Text>
              </View>

              {directExpense
                .filter((expense) => expense.type === "indirect")
                .map((expense, index) => {
                  const baseValue = Number(expense.value) || 0;
                  const initialValue = baseValue * 12;

                  return (
                    <View key={index} style={[stylesMOF.row, styles.tableRow]}>
                      <Text
                        style={[
                          stylesCOP.serialNoCellDetail,
                          styleExpenses.sno,
                          styleExpenses.bordernone,
                        ]}
                      >
                        {index + 1}
                      </Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        {expense.name}
                      </Text>
                      {[...Array(parseInt(projectionYears) || 0)].map(
                        (_, yearIndex) => {
                          const calculatedValue =
                            initialValue *
                            Math.pow(1 + rateOfExpense / 100, yearIndex);
                          return (
                            <Text
                              key={yearIndex}
                              style={[
                                stylesCOP.particularsCellsDetail,
                                styleExpenses.fontSmall,
                              ]}
                            >
                              {formatAmountInIndianStyle(
                                calculatedValue.toFixed(2)
                              )}
                            </Text>
                          );
                        }
                      )}
                    </View>
                  );
                })}

              <View style={[styles.tableRow, styles.totalRow]}>
                <Text
                  style={[
                    stylesCOP.serialNoCellDetail,
                    styleExpenses.sno,
                    styleExpenses.bordernone,
                  ]}
                ></Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  Total
                </Text>
                {[...Array(parseInt(projectionYears) || 0)].map(
                  (_, yearIndex) => {
                    const totalValue = directExpense
                      .filter((expense) => expense.type === "indirect")
                      .reduce((sum, expense) => {
                        const baseValue = Number(expense.value) || 0;
                        const initialValue = baseValue * 12;
                        return (
                          sum +
                          initialValue *
                            Math.pow(1 + rateOfExpense / 100, yearIndex)
                        );
                      }, 0);
                    return (
                      <Text
                        key={yearIndex}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          stylesCOP.boldText,
                          styleExpenses.fontSmall,
                        ]}
                      >
                        {totalValue.toFixed(2)}
                      </Text>
                    );
                  }
                )}
              </View>
            </View>
          </Page>
        </Document>
      </PDFViewer>



      <section>
        <h1 className="text-center py-5 bg-headPurple">Report Review</h1>
        <div className="w-75 mx-auto">
          <hr />
          <h5>Index</h5>
          <hr />

          <div ref={pdfRef} id="report-content" style={styles.page}>
            {/* Step 1 Basic Details */}
            {/* <div id="page1" style={styles.pageBreak}>
              <BasicDetailsTable fileURL={fileURL} />
            </div> */}
            {/* Step 2 Means Of Finance */}
            {/* <div id="page2" style={styles.pageBreak}>
              <MeansOfFinanceTable />
            </div> */}

            {/* Step 3 Cost of Project */}
            {/* <div id="page3" style={styles.pageBreak}>
              <CostOfProjectTable />
            </div> */}

            {/* Step 4 Project Report Setting */}
            <div id="page4" style={styles.pageBreak}>
              <PrSetting />
            </div>

            {/* Step 5 Expenses */}
            <div id="page5" style={styles.pageBreak}>
              <ExpensesTable />
            </div>

            {/* Step 6 Revenue */}
            <div id="page6" style={styles.pageBreak}>
              <RevenueTable />
            </div>

            {/* Step 7 More Details */}
            <div id="page7" style={styles.pageBreak}>
              <MoreDetailsTable />
            </div>

            {/* Step 8 Depreciation */}
            <div id="page8" style={styles.pageBreak}>
              <DepreciationTable />
            </div>

            {/* Pie Chart */}
            <div id="page9" style={styles.pageBreak}>
              <div className="w-50 mx-auto">
                <Bar options={options} data={tempGraphData} />
                <hr />
                <Doughnut data={tempGraphData} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <table>
        <thead>
          <tr>
            <th className="bg-headPurple">Name</th>
            <th className="bg-headPurple">Amount</th>
            <th className="bg-headPurple">Rate (%)</th>
            {[...Array(parseInt(projectionYears))].map((_, index) => (
              <th key={index} className="bg-headPurple">
                Year {index + 1}
              </th>
            ))}
          </tr>
        </thead>
      </table>
    </>
  );
};

export default GeneratedPDF;
