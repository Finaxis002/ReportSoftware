// import React, { useState, useRef, useEffect } from "react";
// import { useLocation } from "react-router-dom";
// import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
// import {
//   styles,
//   stylesCOP,
//   stylesMOF,
//   styleExpenses,
// } from "./PDFComponents/Styles";

// import "./View.css";
// import {
//   Document,
//   Page,
//   View,
//   Text,
//   StyleSheet,
//   PDFViewer,
// } from "@react-pdf/renderer";
// // Register chart.js components
// import BasicDetails from "./PDFComponents/BasicDetails";
// import MeansOfFinance from "./PDFComponents/MeansOfFinance";
// import CostOfProject from "./PDFComponents/CostOfProject";
// import ProjectedExpenses from "./PDFComponents/ProjectedExpenses";
// import ProjectedRevenue from "./PDFComponents/ProjectedRevenue";
// import ProjectedProfitability from "./PDFComponents/ProjectedProfitability";
// import ProjectedDepreciation from "./PDFComponents/ProjectedDepreciation";
// import IncomeTaxCalculation from "./PDFComponents/IncomeTaxCalculation";

// ChartJS.register(ArcElement, Tooltip, Legend);

// const GeneratedPDF = ({ years }) => {
//   const [localData, setLocalData] = useState(() => {
//     const savedData = localStorage.getItem("FourthStepPRS");
//     return savedData
//       ? JSON.parse(savedData) // If saved data exists, parse and return it
//       : {
//           projectionYears: {
//             name: "Projection Years",
//             id: "projectionYears",
//             value: 0, // Default value for ProjectionYears
//             isCustom: false,
//           },
//           rateOfExpense: {
//             name: "Rate of Expense",
//             id: "rateOfExpense",
//             value: 0, // Default value for Rate of Expense
//             isCustom: false,
//           },
//           clientName: "", // Default value from formData
//         };
//   });

//   const [computedData, setComputedData] = useState({ netProfitBeforeTax: [] });

//   const [userRole, setUserRole] = useState("");

//   useEffect(() => {
//     const role = localStorage.getItem("userRole");
//     setUserRole(role);
//   }, []);

//   const [activeRowIndex, setActiveRowIndex] = useState(0);

//   const location = useLocation();

//   // Remove sessionId and _id while keeping other data intact
//   const { sessionId, _id, ...cleanFormData } = location.state || {};

//   const formData = cleanFormData;

//   if (!formData || !formData.AccountInformation) {
//     return <div>No account information available</div>; // Fallback UI
//   }

//   const { Expenses = {} } = formData; // Destructure Expenses safely with fallback to empty object
//   const { normalExpense = [], directExpense = [] } = Expenses;

//   const formatAmountInIndianStyle = (amount) => {
//     return amount.toLocaleString("en-IN"); // Format as per Indian number system
//   };

//   // salary  wages calculation
//   const totalQuantity = normalExpense.reduce(
//     (sum, expense) => sum + Number(expense.quantity || 0),
//     0
//   );
//   const totalAnnualWages = normalExpense.reduce(
//     (sum, expense) => sum + Number(expense.amount * expense.quantity * 12 || 0),
//     0
//   );

//   const fringeCalculation = normalExpense.reduce(
//     (sum, expense) =>
//       sum + (Number(expense.amount) * Number(expense.quantity) * 12 * 0.5) / 10,
//     0 // Initial value to ensure sum starts from zero
//   );

//   const fringAndAnnualCalculation =
//     normalExpense.reduce((sum, expense) => sum, 0) +
//     Number(totalAnnualWages) +
//     Number(fringeCalculation);

//   console.log("form Data : ", formData);

//   // Compute Gross Profit for Each Year (Precomputed from previous step)
//   const grossProfits = Array.from({
//     length: parseInt(formData.ProjectReportSetting.ProjectionYears) || 0,
//   }).map((_, yearIndex) => {
//     // Get total revenue for this year
//     const totalRevenue = formData.Revenue.formFields.reduce(
//       (product, item) =>
//         item.years?.[yearIndex] !== undefined && item.years?.[yearIndex] !== ""
//           ? product * Number(item.years[yearIndex])
//           : 0, // If any value is missing, set product to 0
//       1 // Start with 1 for multiplication
//     );

//     // Get closing and opening stock for this year
//     const closingStock =
//       formData.MoreDetails.closingStock?.[yearIndex] !== undefined &&
//       formData.MoreDetails.closingStock?.[yearIndex] !== ""
//         ? Number(formData.MoreDetails.closingStock[yearIndex])
//         : 0;

//     const openingStock =
//       formData.MoreDetails.openingStock?.[yearIndex] !== undefined &&
//       formData.MoreDetails.openingStock?.[yearIndex] !== ""
//         ? Number(formData.MoreDetails.openingStock[yearIndex])
//         : 0;

//     // Get total direct expenses for this year
//     const totalDirectExpenses = formData.Expenses.directExpense
//       .filter((expense) => expense.type === "direct")
//       .reduce((sum, expense) => {
//         const baseValue = Number(expense.value) || 0;
//         const initialValue = baseValue * 12;
//         return (
//           sum +
//           initialValue *
//             Math.pow(
//               1 +
//                 (parseFloat(formData.ProjectReportSetting.rateOfExpense) || 0) /
//                   100,
//               yearIndex
//             )
//         );
//       }, 0);

//     // Calculate Gross Profit
//     return totalRevenue + closingStock - openingStock - totalDirectExpenses;
//   });

//   // Compute Total Indirect Expenses for Each Year
//   const totalIndirectExpenses = Array.from({
//     length: parseInt(formData.ProjectReportSetting.ProjectionYears) || 0,
//   }).map((_, yearIndex) => {
//     return formData.Expenses.directExpense
//       .filter((expense) => expense.type === "indirect")
//       .reduce((sum, expense) => {
//         const baseValue = Number(expense.value) || 0;
//         const initialValue = baseValue * 12;
//         return (
//           sum +
//           initialValue *
//             Math.pow(
//               1 +
//                 (parseFloat(formData.ProjectReportSetting.rateOfExpense) || 0) /
//                   100,
//               yearIndex
//             )
//         );
//       }, 0);
//   });

//   // Compute Net Profit Before Tax
//   const netProfitBeforeTax = grossProfits.map((grossProfit, yearIndex) => {
//     return  totalIndirectExpenses[yearIndex] - grossProfit ;
//   });



//   return (
//     <>
//       <PDFViewer
//         width="100%"
//         height="800"
//         style={{ overflow: "hidden" }}
//         showToolbar={userRole !== "client" && userRole !== "employee"}
//       >
//         <Document>
//           {/* basic details table */}
//           <BasicDetails formData={formData} />

//           {/* Means of Finance Table */}
//           <MeansOfFinance formData={formData} localData={localData} />

//           {/* cost of project table */}
//           <CostOfProject formData={formData} localData={localData} />

//           {/* Projected Salaries & Wages Table*/}
//           <Page size="A4" style={stylesCOP.styleCOP}>
//             <Text style={styles.clientName}>{localData.clientName}</Text>
//             <View style={stylesCOP.heading}>
//               <Text>Projected Salaries & Wages</Text>
//             </View>

//             <View style={styles.table}>
//               <View style={[styles.tableHeader]}>
//                 <Text style={styles.serialNoCell}>S.No.</Text>
//                 <Text style={[styles.particularsCell, stylesCOP.textCenter]}>
//                   Type Of Worker
//                 </Text>
//                 <Text style={[styles.particularsCell, stylesCOP.textCenter]}>
//                   No. of Workers{" "}
//                 </Text>
//                 <Text style={[styles.particularsCell, stylesCOP.textCenter]}>
//                   Wages per month
//                 </Text>
//                 <Text style={[styles.particularsCell, stylesCOP.textCenter]}>
//                   Annual Wages & Salaries
//                 </Text>
//               </View>
//               {normalExpense.map((expense, index) => (
//                 <View key={index} style={styles.tableRow}>
//                   <Text
//                     style={[stylesCOP.serialNoCellDetail, stylesCOP.textCenter]}
//                   >
//                     {index + 1}
//                   </Text>

//                   <Text
//                     style={[
//                       stylesCOP.particularsCellsDetail,
//                       stylesCOP.textCenter,
//                     ]}
//                   >
//                     {expense.name || "N/A"}
//                   </Text>
//                   <Text
//                     style={[
//                       stylesCOP.particularsCellsDetail,
//                       stylesCOP.textCenter,
//                     ]}
//                   >
//                     {expense.quantity || "0"}
//                   </Text>
//                   <Text
//                     style={[
//                       stylesCOP.particularsCellsDetail,
//                       stylesCOP.textCenter,
//                     ]}
//                   >
//                     {formatAmountInIndianStyle(expense.amount || 0)}
//                   </Text>
//                   <Text
//                     style={[
//                       stylesCOP.particularsCellsDetail,
//                       stylesCOP.textCenter,
//                     ]}
//                   >
//                     {" "}
//                     {formatAmountInIndianStyle(
//                       expense.amount * expense.quantity * 12
//                     )}
//                   </Text>
//                 </View>
//               ))}

//               <View style={styles.tableRow}>
//                 <Text style={stylesCOP.serialNoCellDetail}></Text>

//                 <Text
//                   style={[
//                     stylesCOP.particularsCellsDetail,
//                     stylesCOP.textCenter,
//                   ]}
//                 >
//                   Total
//                 </Text>
//                 <Text
//                   style={[
//                     stylesCOP.particularsCellsDetail,
//                     stylesCOP.textCenter,
//                     stylesCOP.boldText,
//                   ]}
//                 >
//                   {totalQuantity}
//                 </Text>
//                 <Text
//                   style={[
//                     stylesCOP.particularsCellsDetail,
//                     stylesCOP.textCenter,
//                   ]}
//                 ></Text>
//                 <Text
//                   style={[
//                     stylesCOP.particularsCellsDetail,
//                     stylesCOP.textCenter,
//                     stylesCOP.boldText,
//                   ]}
//                 >
//                   {formatAmountInIndianStyle(totalAnnualWages)}
//                 </Text>
//               </View>

//               <View style={styles.tableRow}>
//                 <Text style={stylesCOP.serialNoCellDetail}></Text>

//                 <Text
//                   style={[
//                     stylesCOP.particularsCellsDetail,
//                     stylesCOP.textCenter,
//                   ]}
//                 ></Text>
//                 <Text
//                   style={[
//                     stylesCOP.particularsCellsDetail,
//                     stylesCOP.textCenter,
//                   ]}
//                 ></Text>
//                 <Text
//                   style={[
//                     stylesCOP.particularsCellsDetail,
//                     stylesCOP.textCenter,
//                     stylesCOP.verticalPadding,
//                   ]}
//                 >
//                   Add: Fringe Benefits @ 5 %
//                 </Text>
//                 <Text
//                   style={[
//                     stylesCOP.particularsCellsDetail,
//                     stylesCOP.textCenter,
//                     stylesCOP.verticalPadding,
//                   ]}
//                 >
//                   {" "}
//                   {formatAmountInIndianStyle(fringeCalculation)}
//                 </Text>
//               </View>

//               <View style={styles.tableRow}>
//                 <Text style={stylesCOP.serialNoCellDetail}></Text>

//                 <Text
//                   style={[
//                     stylesCOP.particularsCellsDetail,
//                     stylesCOP.textCenter,
//                   ]}
//                 ></Text>
//                 <Text
//                   style={[
//                     stylesCOP.particularsCellsDetail,
//                     stylesCOP.textCenter,
//                     stylesCOP.boldText,
//                     stylesCOP.extraWidth,
//                     stylesCOP.verticalPadding,
//                   ]}
//                 >
//                   {" "}
//                   Total Wages during the year
//                 </Text>

//                 <Text
//                   style={[
//                     stylesCOP.particularsCellsDetail,
//                     stylesCOP.textCenter,
//                     stylesCOP.boldText,
//                     stylesCOP.verticalPadding,
//                   ]}
//                 >
//                   {" "}
//                   {formatAmountInIndianStyle(fringAndAnnualCalculation)}
//                 </Text>
//               </View>
//             </View>
//           </Page>

//           {/* Projected Expense Table Direct and Indirect*/}

//           <ProjectedExpenses formData={formData} />

//           {/* Projected Revenue/ Sales */}

//           <ProjectedRevenue formData={formData} />

//           {/* Projected Profitability Statement */}

//           <ProjectedProfitability
//             formData={formData}
//             localData={localData}
//             normalExpense={normalExpense}
//             directExpense={directExpense}
//             location={location}
//             onComputedData={setComputedData}
//             netProfitBeforeTax={computedData.netProfitBeforeTax || []}
//           />

//          <ProjectedDepreciation formData={formData}
//             localData={localData}
//             />
          
//           {computedData.netProfitBeforeTax.length > 0 && (
//         <IncomeTaxCalculation formData={formData} netProfitBeforeTax={computedData.netProfitBeforeTax} />
//       )}
          
//         </Document>
//       </PDFViewer>

//       {/* <section>
//         <h1 className="text-center py-5 bg-headPurple">Report Review</h1>
//         <div className="w-75 mx-auto">
//           <hr />
//           <h5>Index</h5>
//           <hr />

//           <div ref={pdfRef} id="report-content" style={styles.page}>
           
//             <div id="page4" style={styles.pageBreak}>
//               <PrSetting />
//             </div>

           
//             <div id="page5" style={styles.pageBreak}>
//               <ExpensesTable />
//             </div>

//             <div id="page6" style={styles.pageBreak}>
//               <RevenueTable />
//             </div>

         
//             <div id="page7" style={styles.pageBreak}>
//               <MoreDetailsTable />
//             </div>

         
//             <div id="page8" style={styles.pageBreak}>
//               <DepreciationTable />
//             </div>

           
//             <div id="page9" style={styles.pageBreak}>
//               <div className="w-50 mx-auto">
//                 <Bar options={options} data={tempGraphData} />
//                 <hr />
//                 <Doughnut data={tempGraphData} />
//               </div>
//             </div>
//           </div>
//         </div>
//       </section> */}

//       <section className="h-[100vh]"></section>
//     </>
//   );
// };

// export default GeneratedPDF;


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
import {
  Document,
  Page,
  View,
  Text,
  PDFViewer,
} from "@react-pdf/renderer";

// Register chart.js components
import BasicDetails from "./PDFComponents/BasicDetails";
import MeansOfFinance from "./PDFComponents/MeansOfFinance";
import CostOfProject from "./PDFComponents/CostOfProject";
import ProjectedExpenses from "./PDFComponents/ProjectedExpenses";
import ProjectedRevenue from "./PDFComponents/ProjectedRevenue";
import ProjectedProfitability from "./PDFComponents/ProjectedProfitability";
import ProjectedDepreciation from "./PDFComponents/ProjectedDepreciation";
import IncomeTaxCalculation from "./PDFComponents/IncomeTaxCalculation";

ChartJS.register(ArcElement, Tooltip, Legend);

const GeneratedPDF = ({ years }) => {
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

  const [computedData, setComputedData] = useState({ netProfitBeforeTax: [] });
  const [computedData1, setComputedData1] = useState({ totalDepreciationPerYear: [] });

  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    setUserRole(role);
  }, []);

  const location = useLocation();
  const formData = location.state ? { ...location.state } : {}; // ✅ Prevent undefined errors

  // Ensure essential nested objects exist to avoid crashes
  formData.AccountInformation = formData.AccountInformation || {};
  formData.ProjectReportSetting = formData.ProjectReportSetting || {};
  formData.Revenue = formData.Revenue || { formFields: [] };
  formData.MoreDetails = formData.MoreDetails || {};
  formData.Expenses = formData.Expenses || { directExpense: [], normalExpense: [] };

  if (!formData || !formData.AccountInformation) {
    return <div>No account information available</div>; // Fallback UI
  }

  const { Expenses = {} } = formData; // Destructure Expenses safely with fallback to empty object
  const { normalExpense = [], directExpense = [] } = Expenses;

  const formatAmountInIndianStyle = (amount) => {
    return amount.toLocaleString("en-IN"); // Format as per Indian number system
  };

  // Compute Gross Profit for Each Year (Precomputed from previous step)
  const grossProfits = Array.from({
    length: parseInt(formData.ProjectReportSetting.ProjectionYears) || 0,
  }).map((_, yearIndex) => {
    const totalRevenue = formData.Revenue.formFields.reduce(
      (product, item) =>
        item.years?.[yearIndex] !== undefined && item.years?.[yearIndex] !== ""
          ? product * Number(item.years[yearIndex])
          : 0, // If any value is missing, set product to 0
      1 // Start with 1 for multiplication
    );

    const closingStock = Number(formData.MoreDetails.closingStock?.[yearIndex]) || 0;
    const openingStock = Number(formData.MoreDetails.openingStock?.[yearIndex]) || 0;

    const totalDirectExpenses = formData.Expenses.directExpense
      .filter((expense) => expense.type === "direct")
      .reduce((sum, expense) => {
        const baseValue = Number(expense.value) || 0;
        const initialValue = baseValue * 12;
        return (
          sum +
          initialValue *
            Math.pow(
              1 + (parseFloat(formData.ProjectReportSetting.rateOfExpense) || 0) / 100,
              yearIndex
            )
        );
      }, 0);

    return totalRevenue + closingStock - openingStock - totalDirectExpenses;
  });

  // Compute Total Indirect Expenses for Each Year
  const totalIndirectExpenses = Array.from({
    length: parseInt(formData.ProjectReportSetting.ProjectionYears) || 0,
  }).map((_, yearIndex) => {
    return formData.Expenses.directExpense
      .filter((expense) => expense.type === "indirect")
      .reduce((sum, expense) => {
        const baseValue = Number(expense.value) || 0;
        const initialValue = baseValue * 12;
        return (
          sum +
          initialValue *
            Math.pow(
              1 + (parseFloat(formData.ProjectReportSetting.rateOfExpense) || 0) / 100,
              yearIndex
            )
        );
      }, 0);
  });

  // Compute Net Profit Before Tax
  const netProfitBeforeTax = grossProfits.map((grossProfit, yearIndex) => {
    return grossProfit - totalIndirectExpenses[yearIndex];
  });

  return (
    <>
      <PDFViewer
        width="100%"
        height="800"
        style={{ overflow: "hidden" }}
        showToolbar={userRole !== "client" && userRole !== "employee"}
      >
        <Document>
          {/* Basic Details Table */}
          <BasicDetails formData={formData} />

          {/* Means of Finance Table */}
          <MeansOfFinance formData={formData} localData={localData} />

          {/* Cost of Project Table */}
          <CostOfProject formData={formData} localData={localData} />

          {/* Projected Salaries & Wages Table */}
          <Page size="A4" style={stylesCOP.styleCOP}>
            <Text style={styles.clientName}>{localData.clientName}</Text>
            <View style={stylesCOP.heading}>
              <Text>Projected Salaries & Wages</Text>
            </View>
          </Page>

          {/* Projected Expense Table */}
          <ProjectedExpenses formData={formData} />

          {/* Projected Revenue/ Sales */}
          <ProjectedRevenue formData={formData} />

          {/* Projected Profitability Statement */}
          <ProjectedProfitability
            formData={formData}
            localData={localData}
            normalExpense={normalExpense}
            directExpense={directExpense}
            location={location}
            onComputedData={setComputedData}
            netProfitBeforeTax={computedData.netProfitBeforeTax || []}
          />

          {/* Projected Depreciation */}
          <ProjectedDepreciation formData={formData} localData={localData} 
          onComputedData1={setComputedData1}/>

          {/* Income Tax Calculation (Only if data is available) */}
          {computedData.netProfitBeforeTax.length > 0 && (
            <IncomeTaxCalculation formData={formData} netProfitBeforeTax={computedData.netProfitBeforeTax} 
            totalDepreciationPerYear={computedData1.totalDepreciationPerYear}/>
          )}
        </Document>
      </PDFViewer>
    </>
  );
};

export default GeneratedPDF;
