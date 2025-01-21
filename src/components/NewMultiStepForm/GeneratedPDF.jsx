import React, { useState , useRef} from "react";
import { useLocation } from "react-router-dom";
import { StyleSheet } from "@react-pdf/renderer";
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
import jsPDF from 'jspdf'

// Register chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const GeneratedPDF = ({ chartRef }) => {
  const styles = StyleSheet.create({
    page: {
      padding: "20px",
      fontFamily: "Helvetica",
    },
    section: {
      marginBottom: 20,
    },
    sectionHeader: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 10,
      textAlign: "center",
    },
    chartContainer: {
      width: "100%",
      height: "300px",
      marginBottom: 20,
    },
    pageBreak: {
      pageBreakBefore: "always", // Ensures each section starts on a new page
      pageBreakAfter: "always", // Ensure content is separated by page breaks
    },
  });

  

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
  const [fileURL, setFileURL] = useState(null);
  const pdfRef = useRef(null);

  const generatePDF = () => {
    if (!pdfRef.current) {
      console.error("Reference to report content is null");
      return;
    }
  
    // Get all the page sections by their ids
    const pageElements = [
      document.getElementById("page1"),
      document.getElementById("page2"),
      document.getElementById("page3"),
      document.getElementById("page4"),
      document.getElementById("page5"),
      document.getElementById("page6"),
      document.getElementById("page7"),
      document.getElementById("page8"),
      document.getElementById("page9"),
    ];
  
    const pdf = new jsPDF("p", "mm", "a4");
  
    pageElements.forEach((pageElement, index) => {
      if (pageElement) {
        html2canvas(pageElement, { scale: 2 }).then((canvas) => {
          const imgData = canvas.toDataURL("image/png");
          const imgWidth = 210; // A4 width in mm
          const pageHeight = 297; // A4 height in mm
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
          // Add the first page or add pages after the first
          if (index > 0) pdf.addPage();
          
          pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
          
          // If content exceeds one page, add more pages
          let heightLeft = imgHeight - pageHeight;
          let position = 0;
  
          while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
          }
  
          // Save the PDF after processing all pages
          if (index === pageElements.length - 1) {
            pdf.save("report.pdf");
          }
        });
      }
    });
  };
  

  return (
    <section>
      <h1 className="text-center py-5 bg-headPurple">Report Review</h1>
       <div className="w-75 mx-auto">
        <hr />
        <h5>Index</h5>
        <hr />

        <div ref={pdfRef} id="report-content" style={styles.page}>
          {/* Step 1 Basic Details */}
          <div id="page1" style={styles.pageBreak}>
            <BasicDetailsTable fileURL={fileURL} />
          </div>
          {/* Step 2 Means Of Finance */}
          <div id="page2" style={styles.pageBreak}>
            <MeansOfFinanceTable />
          </div>

          {/* Step 3 Cost of Project */}
          <div id="page3" style={styles.pageBreak}>
            <CostOfProjectTable />
          </div>

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

      {/* Button to Trigger PDF Download */}
      <button onClick={generatePDF}>Download PDF</button>
    </section>
  );
};

export default GeneratedPDF;







// import React, { useState } from "react";
// import { useLocation } from "react-router-dom";
// import {
  
//   StyleSheet,
 
// } from "@react-pdf/renderer";
// import html2canvas from "html2canvas";
// import { Bar } from "react-chartjs-2";
// import { Doughnut } from "react-chartjs-2";
// import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
// import "./View.css";
// import ExpensesTable from "./Table/ExpensesTable";
// import BasicDetailsTable from "./Table/BasicDetailsTable";
// import MeansOfFinanceTable from "./Table/MeansOfFinanceTable";
// import CostOfProjectTable from "./Table/CostOfProjectTable";
// import PrSetting from "./Table/PrSetting";
// import RevenueTable from "./Table/RevenueTable";
// import MoreDetailsTable from "./Table/MoreDetailsTable";
// import DepreciationTable from "./Table/DepreciationTable";


// // Register chart.js components
// ChartJS.register(ArcElement, Tooltip, Legend);

// const GeneratedPDF = ({ chartRef }) => {
//   const styles = StyleSheet.create({
//     page: {
//       padding: "20px",
//       fontFamily: "Helvetica",
//     },
//     header: {
//       fontSize: 20,
//       fontWeight: "bold",
//       marginBottom: 10,
//     },
//     section: {
//       marginBottom: 20,
//     },
//     sectionHeader: {
//       fontSize: 16,
//       fontWeight: "bold",
//     },
//     sectionContent: {
//       fontSize: 12,
//       whiteSpace: "pre-wrap",
//     },
//     chartContainer: {
//       width: "100%",
//       height: "300px",
//       marginBottom: 20,
//     },
//     chartTitle: {
//       fontSize: 16,
//       fontWeight: "bold",
//       marginBottom: 10,
//     },
//     table: {
//       display: "flex",
//       flexDirection: "column",
//       borderWidth: 1,
//       borderColor: "#000",
//       marginTop: 10,
//     },
//     tableRow: {
//       flexDirection: "row",
//       borderBottomWidth: 1,
//       borderColor: "#000",
//       paddingVertical: 5,
//     },
//     tableCellHeader: {
//       flex: 1,
//       fontWeight: "bold",
//       padding: 5,
//       borderRightWidth: 1,
//       borderColor: "#000",
//     },
//     tableCell: {
//       flex: 2,
//       padding: 5,
//     },
//     sectionHeader: {
//       fontSize: 20,
//       fontWeight: "bold",
//       marginBottom: 10,
//       textAlign: "center",
//     },
//     chartContainer: {
//       marginTop: 20,
//       textAlign: "center",
//     },
//   });
//   const options = {
//     responsive: true,
//     plugins: {
//       legend: {
//         position: "top",
//       },
//       title: {
//         display: true,
//         text: "Chart.js Bar Chart",
//       },
//     },
//   };
//   const labels = [
//     "January",
//     "February",
//     "March",
//     "April",
//     "May",
//     "June",
//     "July",
//   ];
//   const tempGraphData = {
//     labels,
//     datasets: [
//       {
//         label: "Dataset 1",
//         data: [65, 59, 80, 81, 56, 55, 40],
//         backgroundColor: "rgba(255, 99, 132, 0.5)",
//       },
//       {
//         label: "Dataset 2",
//         data: [25, 49, 85, 71, 52, 58, 70],
//         backgroundColor: "rgba(53, 162, 235, 0.5)",
//       },
//     ],
//   };

//   const location = useLocation();
//   const [fileURL, setFileURL] = useState(null);

//   return (

//     <section>
//       <h1 className="text-center py-5 bg-headPurple">Report Review</h1>
//       <div className="w-75 mx-auto">
//         <hr />
//         <h5>Index</h5>
//         <hr />
//         <div style={styles.page}>
//           {/* step 1 basic details */}
//           <BasicDetailsTable fileURL={fileURL} />
//           <hr />
//           {/* step 2 Means Of Finance */}
//           <MeansOfFinanceTable />
//           <hr />
//           {/* step 3 cost of project */}
//           <CostOfProjectTable />
//           <hr />
//           {/* step 4 Project Report Setting */}
//           <PrSetting />
//           <hr />
//           {/* Step 5 Expenses */}
//           <ExpensesTable />
//           <hr />
//           {/* Step 6 Revenue */}
//           <RevenueTable />
//           <hr />
//           {/* Step 7 More Details */}
//           <MoreDetailsTable />
//           <hr />
//           {/* deprectiation table */}
//           <DepreciationTable />
//           <hr />
//           {/* Pie Chart */}
//           <div className="w-50 mx-auto">
//             <Bar options={options} data={tempGraphData} />;
//             <hr />
//             <Doughnut data={tempGraphData} />
//           </div>
//         </div>
//       </div>

//       <button>Download PDF</button>
//     </section>
//   );
// };

// export default GeneratedPDF;
