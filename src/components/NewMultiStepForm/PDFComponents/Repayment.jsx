// import React, { useEffect, useState } from "react";
// import { Page, View, Text, Image } from "@react-pdf/renderer";
// import { styles, stylesCOP, stylesMOF, styleExpenses } from "./Styles"; // Import only necessary styles
// import { Font } from "@react-pdf/renderer";
// import SAWatermark from "../Assets/SAWatermark";
// import CAWatermark from "../Assets/CAWatermark";

// // ✅ Register a Font That Supports Bold
// Font.register({
//   family: "Roboto",
//   fonts: [
//     { src: "https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Me5Q.ttf" }, // Regular
//     {
//       src: "https://fonts.gstatic.com/s/roboto/v20/KFOlCnqEu92Fr1MmEU9vAw.ttf",
//       fontWeight: "bold",
//     }, // Bold
//   ],
// });

// const Repayment = ({
//   formData,
//   pdfType,
//   onInterestCalculated,
//   onPrincipalRepaymentCalculated,
//   onMarchClosingBalanceCalculated, // New callback prop for March balances
//   onInterestLiabilityUpdate,
// }) => {
//   const termLoan = formData?.MeansOfFinance?.termLoan?.termLoan;
//   const interestRate = formData.ProjectReportSetting.interestOnTL / 100;
//   const moratoriumPeriod = formData.ProjectReportSetting.MoratoriumPeriod; // Given = 5 months
//   const repaymentMonths = formData.ProjectReportSetting.RepaymentMonths;
//   const [yearlyInterestLiabilities, setYearlyInterestLiabilities] = useState(
//     []
//   );
//   const [yearlyPrincipalRepayment, setYearlyPrincipalRepayment] = useState([]);

//   // ✅ Correct the total repayment months (including moratorium)
//   let totalMonths = repaymentMonths + moratoriumPeriod;
//   let effectiveRepaymentMonths = repaymentMonths - moratoriumPeriod;
//   let fixedPrincipalRepayment =
//     effectiveRepaymentMonths > 0 ? termLoan / effectiveRepaymentMonths : 0;

//   // ✅ Month Mapping (April - March)
//   const months = [
//     "April",
//     "May",
//     "June",
//     "July",
//     "August",
//     "September",
//     "October",
//     "November",
//     "December",
//     "January",
//     "February",
//     "March",
//   ];

//   // ✅ Convert Selected Month Name to Index (April-March Mapping)
//   let startMonthIndex = months.indexOf(
//     formData.ProjectReportSetting.SelectStartingMonth
//   );

//   if (startMonthIndex === -1) {
//     startMonthIndex = 0; // Default to April if input is incorrect
//   }

//   let remainingBalance = termLoan; // Remaining loan balance

//   let repaymentStartIndex = startMonthIndex; // Start from selected month

//   let data = [];

//   // ✅ Track the Total Elapsed Months Since Repayment Start
//   let elapsedMonths = 0;

//   for (let year = 0; year < totalMonths; year++) {
//     let yearData = [];

//     // ✅ First Year Starts from Selected Month
//     let firstMonth = year === 0 ? repaymentStartIndex : 0;

//     for (let i = firstMonth; i < 12; i++) {
//       if (remainingBalance <= 0) break; // Stop when balance is cleared

//       let principalOpeningBalance = remainingBalance;

//       // ✅ Ensure exactly 5 months of Moratorium
//       let principalRepayment =
//         elapsedMonths < moratoriumPeriod ? 0 : fixedPrincipalRepayment;

//       let principalClosingBalance = Math.max(
//         0,
//         principalOpeningBalance - principalRepayment
//       );

//       // ✅ Ensure interest is calculated exactly for 5 months
//       let interestLiability =
//         elapsedMonths < moratoriumPeriod
//           ? principalOpeningBalance * (interestRate / 12)
//           : principalClosingBalance * (interestRate / 12);

//       let totalRepayment = principalRepayment + interestLiability;

//       yearData.push({
//         month: months[i],
//         principalOpeningBalance: principalOpeningBalance, // ✅ Rounded
//         principalRepayment: principalRepayment, // ✅ Rounded
//         principalClosingBalance: principalClosingBalance, // ✅ Rounded
//         interestLiability, // ✅ Already rounded above
//         totalRepayment: totalRepayment, // ✅ Rounded
//       });

//       remainingBalance = principalClosingBalance;

//       // ✅ Move the elapsed months counter forward
//       elapsedMonths++;
//     }

//     if (yearData.length > 0) {
//       data.push(yearData);
//     }
//   }

//   const financialYear = parseInt(
//     formData.ProjectReportSetting.FinancialYear || 2025
//   );

//   // ✅ Compute Yearly Total Principal Repayment
//   const computedYearlyPrincipalRepayment = data.map((yearData) =>
//     yearData.reduce((sum, entry) => sum + entry.principalRepayment, 0)
//   );

//   useEffect(() => {
//     setYearlyPrincipalRepayment(computedYearlyPrincipalRepayment);

//     if (onPrincipalRepaymentCalculated) {
//       onPrincipalRepaymentCalculated(computedYearlyPrincipalRepayment);
//     }
//   }, []);

//   // ✅ Store Year-Wise Interest Liability
//   // data.forEach((yearData) => {
//   //   let totalInterestLiability = yearData.reduce(
//   //     (sum, entry) => sum + entry.interestLiability,
//   //     0
//   //   );
//   //   yearlyInterestLiabilities.push(totalInterestLiability);
//   // });

//   // useEffect(() => {
//   //   // ✅ Compute Yearly Interest Liabilities Same as Displayed
//   //   const correctYearlyInterestLiabilities = data.map((yearData) => {
//   //     let totalPrincipalRepayment = yearData.reduce(
//   //       (sum, entry) => sum + entry.principalRepayment,
//   //       0
//   //     );
//   //     let totalInterestLiability = yearData.reduce(
//   //       (sum, entry) => sum + entry.interestLiability,
//   //       0
//   //     );
//   //     let totalRepayment = yearData.reduce(
//   //       (sum, entry) => sum + entry.totalRepayment,
//   //       0
//   //     );

//   //     // ✅ Set other totals to 0 if principal repayment is 0
//   //     if (totalPrincipalRepayment === 0) {
//   //       totalInterestLiability = 0;
//   //       totalRepayment = 0;
//   //     }

//   //     return totalInterestLiability; // ✅ Only return interest liabilities
//   //   });

//   //   // ✅ Set state with the correct computed interest liabilities
//   //   setYearlyInterestLiabilities(correctYearlyInterestLiabilities);
//   //   console.log("correctYearlyInterestLiabilities",correctYearlyInterestLiabilities)

//   //   // ✅ Send the correct values to the parent component
//   //   if (onInterestCalculated) {
//   //     onInterestCalculated(correctYearlyInterestLiabilities);
//   //   }

//   //   // ✅ Console log to verify the correct values
//   //   //  console.log("Correct Yearly Interest Liabilities Sent to Parent:", correctYearlyInterestLiabilities);
//   // }, [JSON.stringify(data)]); // Trigger when data changes

//   // ─── USEEFFECT TO SEND & CONSOLE MARCH PRINCIPAL CLOSING BALANCES ──────
//   useEffect(() => {
//     if (!Array.isArray(data)) return;

//     const yearlyInterestLiabilities = [];

//     data.forEach((yearData) => {
//       let totalPrincipalRepayment = 0;
//       let totalInterestLiability = 0;
//       let totalRepayment = 0;

//       yearData.forEach((entry) => {
//         if (entry?.principalRepayment > 0) {
//           totalPrincipalRepayment += entry.principalRepayment;
//           totalInterestLiability += entry.interestLiability;
//           totalRepayment += entry.totalRepayment;
//         }
//       });

//       // ✅ If principal repayment is 0 for the year, ignore interest
//       if (totalPrincipalRepayment === 0) {
//         totalInterestLiability = 0;
//         totalRepayment = 0;
//       }

//       yearlyInterestLiabilities.push(totalInterestLiability);
//     });

//     setYearlyInterestLiabilities(yearlyInterestLiabilities);
//     // console.log("correctYearlyInterestLiabilities", yearlyInterestLiabilities);

//     if (onInterestCalculated) {
//       onInterestCalculated(yearlyInterestLiabilities);
//     }
//   }, [JSON.stringify(data)]);

//   useEffect(() => {
//     const marchClosingBalances = data.map((yearData) => {
//       const marchEntry = yearData.find((entry) => entry.month === "March");
//       return marchEntry ? marchEntry.principalClosingBalance : 0;
//     });

//     // console.log("Original March Principal Closing Balances:", marchClosingBalances);

//     if (onMarchClosingBalanceCalculated) {
//       onMarchClosingBalanceCalculated(marchClosingBalances);
//     }
//   }, [JSON.stringify(data), onMarchClosingBalanceCalculated]);

//   let yearCounter = 1; // ✅ Separate counter for valid years
//   // ─────────────────────────────────────────────────────────────────────────

//   const formatNumber = (value) => {
//     const formatType = formData?.ProjectReportSetting?.Format || "1"; // Default to Indian Format
//     if (value === undefined || value === null || isNaN(value)) return "0.00"; // ✅ Handle invalid values with 2 decimals

//     switch (formatType) {
//       case "1": // Indian Format (1,23,456.00)
//         return new Intl.NumberFormat("en-IN", {
//           minimumFractionDigits: 2,
//           maximumFractionDigits: 2,
//         }).format(value);

//       case "2": // USD Format (1,123,456.00)
//         return new Intl.NumberFormat("en-US", {
//           minimumFractionDigits: 2,
//           maximumFractionDigits: 2,
//         }).format(value);

//       case "3": // Generic Indian Format (1,23,456.00)
//         return new Intl.NumberFormat("en-IN", {
//           minimumFractionDigits: 2,
//           maximumFractionDigits: 2,
//         }).format(value);

//       default: // Default to Indian Format with 2 decimal places
//         return new Intl.NumberFormat("en-IN", {
//           minimumFractionDigits: 2,
//           maximumFractionDigits: 2,
//         }).format(value);
//     }
//   };

//   return (
//     <>
//       <Page

//         // orientation={
//         //   formData.ProjectReportSetting.ProjectionYears > 7
//         //     ? "landscape"
//         //     : "portrait"
//         // }
//         // wrap={false}
//         style={[{ padding: "20px" }]}
//       >
//         <View style={styleExpenses.paddingx}>
//           {/* businees name and financial year  */}
//           <View>
//             <Text style={styles.businessName}>
//               {formData?.AccountInformation?.businessName || "Business Bame"}
//             </Text>
//             <Text style={styles.FinancialYear}>
//               Financial Year{" "}
//               {formData?.ProjectReportSetting?.FinancialYear
//                 ? `${formData.ProjectReportSetting.FinancialYear}-${(
//                     parseInt(formData.ProjectReportSetting.FinancialYear) + 1
//                   )
//                     .toString()
//                     .slice(-2)}`
//                 : "2025-26"}
//             </Text>
//           </View>

//           {/* Amount format */}

//           <View
//             style={{
//               display: "flex",
//               alignContent: "flex-end",
//               justifyContent: "flex-end",
//               alignItems: "flex-end",
//             }}
//           >
//             <Text style={[styles.AmountIn, styles.italicText]}>
//               (Amount In{" "}
//               {
//                 formData?.ProjectReportSetting?.AmountIn === "rupees"
//                   ? "Rs." // Show "Rupees" if "rupees" is selected
//                   : formData?.ProjectReportSetting?.AmountIn === "thousand"
//                   ? "Thousands" // Show "Thousands" if "thousand" is selected
//                   : formData?.ProjectReportSetting?.AmountIn === "lakhs"
//                   ? "Lakhs" // Show "Lakhs" if "lakhs" is selected
//                   : formData?.ProjectReportSetting?.AmountIn === "crores"
//                   ? "Crores" // Show "Crores" if "crores" is selected
//                   : formData?.ProjectReportSetting?.AmountIn === "millions"
//                   ? "Millions" // Show "Millions" if "millions" is selected
//                   : "" // Default case, in case the value is not found (you can add a fallback text here if needed)
//               }
//               )
//             </Text>
//           </View>

//           <View>
//             {/* Heading */}
//             <View
//               style={[
//                 stylesCOP.heading,
//                 {
//                   fontWeight: "bold",
//                   paddingLeft: 10,
//                   borderWidth: "0px",
//                 },
//               ]}
//             >
//               <Text>Repayment of Term Loan</Text>
//             </View>

//             {/* Term Loan Details Section */}
//             <View style={{ paddingHorizontal: 10, marginTop: 10 }}>
//               <Text
//                 style={[
//                   stylesCOP.detailsCellDetail,
//                   {
//                     fontWeight: "bold",
//                     borderWidth: "0px",

//                   },
//                 ]}
//               >
//                 Term Loan = {formatNumber(termLoan)}
//               </Text>

//               <Text
//                 style={[
//                   stylesCOP.detailsCellDetail,
//                   {
//                     fontWeight: "bold",
//                     borderWidth: "0px",

//                   },
//                 ]}
//               >
//                 Interest Rate = {interestRate * 100}% per annum
//               </Text>

//               <Text
//                 style={[
//                   stylesCOP.detailsCellDetail,
//                   {
//                     fontWeight: "bold",
//                     borderWidth: "0px",

//                   },
//                 ]}
//               >
//                 Moratorium Period = {moratoriumPeriod} Months
//               </Text>

//               <Text
//                 style={[
//                   stylesCOP.detailsCellDetail,
//                   {
//                     fontWeight: "bold",
//                     borderWidth: "0px",

//                   },
//                 ]}
//               >
//                 Number of Years ={" "}
//                 {Math.floor(formData.ProjectReportSetting.RepaymentMonths / 12)}{" "}
//                 years
//                 {formData.ProjectReportSetting.RepaymentMonths % 12 !== 0 &&
//                   ` ${
//                     formData.ProjectReportSetting.RepaymentMonths % 12
//                   } months`}
//               </Text>
//             </View>

//             {/* table header  */}

//             <View style={[styles.table, { marginTop: "10px" }]}>
//               <View style={styles.tableHeader}>
//                 <Text
//                   style={[
//                     styles.serialNoCell,
//                     styleExpenses.sno,
//                     {
//                       width: "8%",
//                       paddingHorizontal: "1px",
//                       display: "flex",
//                       alignItems: "center",
//                       justifyContent: "center",
//                     },
//                   ]}
//                 >
//                   S. No.
//                 </Text>
//                 <Text
//                   style={[
//                     styles.detailsCell,
//                     {
//                       textAlign: "center",
//                       width: "15.35%",
//                       display: "flex",
//                       alignItems: "center",
//                       justifyContent: "center",
//                     },
//                   ]}
//                 >
//                   Years / Quarters
//                 </Text>
//                 <Text
//                   style={[
//                     styles.detailsCell,
//                     {
//                       textAlign: "center",
//                       width: "15.35%",
//                       display: "flex",
//                       alignItems: "center",
//                       justifyContent: "center",
//                     },
//                   ]}
//                 >
//                   Principal Opening Balance
//                 </Text>
//                 <Text
//                   style={[
//                     styles.detailsCell,
//                     {
//                       textAlign: "center",
//                       width: "15.35%",
//                       display: "flex",
//                       alignItems: "center",
//                       justifyContent: "center",
//                     },
//                   ]}
//                 >
//                   Principal Repayment
//                 </Text>
//                 <Text
//                   style={[
//                     styles.detailsCell,
//                     {
//                       textAlign: "center",
//                       width: "15.35%",
//                       display: "flex",
//                       alignItems: "center",
//                       justifyContent: "center",
//                     },
//                   ]}
//                 >
//                   Principal Closing Balance
//                 </Text>
//                 <Text
//                   style={[
//                     styles.detailsCell,
//                     {
//                       textAlign: "center",
//                       width: "15.35%",
//                       display: "flex",
//                       alignItems: "center",
//                       justifyContent: "center",
//                     },
//                   ]}
//                 >
//                   Interest Liability
//                 </Text>
//                 <Text
//                   style={[
//                     styles.detailsCell,
//                     {
//                       textAlign: "center",
//                       width: "15.35%",
//                       display: "flex",
//                       alignItems: "center",
//                       justifyContent: "center",
//                     },
//                   ]}
//                 >
//                   Total Repayment
//                 </Text>
//               </View>
//             </View>

//             {/* Table Body */}
//             {data.map((yearData, yearIndex) => {
//               let filteredYearData = [];
//               let repaymentStopped = false;
//               let previousEntryHadZeroClosingBalance = false;

//               for (const entry of yearData) {
//                 // ✅ If previous entry had zero closing balance, stop adding rows
//                 if (previousEntryHadZeroClosingBalance) {
//                   break;
//                 }

//                 // ✅ If closing balance becomes zero, allow one additional row
//                 if (entry.principalClosingBalance === 0) {
//                   if (repaymentStopped) {
//                     previousEntryHadZeroClosingBalance = true; // ✅ Stop after next row
//                   }
//                   repaymentStopped = true;
//                 }

//                 // ✅ Include row if repayment hasn't fully stopped
//                 filteredYearData.push(entry);
//               }

//               const moratoriumPeriod = parseInt(
//                 formData?.ProjectReportSetting?.MoratoriumPeriod || 0
//               );

//               // // ✅ Skip rendering this year if there are no valid months
//               // if (!filteredYearData || filteredYearData.length === 0) {
//               //   filteredYearData = yearData; // Fallback to full yearData if nothing was pushed
//               // }

//               // ✅ Compute total values for the year
//               let totalPrincipalRepayment = filteredYearData.reduce(
//                 (sum, entry) => sum + entry.principalRepayment,
//                 0
//               );
//               let totalInterestLiability = filteredYearData.reduce(
//                 (sum, entry) =>
//                   entry.principalRepayment === 0
//                     ? sum // If principal repayment is 0, don't add interest liability
//                     : sum + entry.interestLiability,
//                 0
//               );

//               // 🔥 Skip first N months from the beginning of the year (not from filtered entries)
//               const monthsToConsider = filteredYearData.filter(
//                 (_, monthIndex) => {
//                   // ✅ Skip moratoriumPeriod only in the first year
//                   if (yearIndex === 0 && monthIndex < moratoriumPeriod) {
//                     return false;
//                   }
//                   return true;
//                 }
//               );

//               // ✅ Then calculate totalRepayment from monthsToConsider
//               let totalRepayment = monthsToConsider.reduce(
//                 (sum, entry) => sum + entry.totalRepayment,
//                 0
//               );

//               if (totalInterestLiability === 0) {
//                 return null; // 🚫 Skip year block if no visible month
//               }

//               return (
//                 <View
//                   key={yearIndex}
//                   wrap={false}
//                   style={[
//                     { borderLeftWidth: 0 },
//                     {
//                       position: "relative",
//                       zIndex: 1,
//                       borderLeftWidth: 1,
//                       borderTopWidth: 1,
//                     },
//                   ]}
//                 >
//                   {/* ✅ Year Row */}
//                   <View style={[stylesMOF.row, { borderBottomWidth: 0 }]}>
//                     <Text
//                       style={[
//                         styles.serialNumberCellStyle,
//                         { width: "8%", paddingTop: "5px" },
//                       ]}
//                     >
//                       {yearIndex + 1}
//                     </Text>

//                     <Text
//                       style={[
//                         stylesCOP.detailsCellDetail,
//                         styleExpenses.bordernone,
//                         styleExpenses.fontBold,
//                         {
//                           textAlign: "left",
//                           width: "15.35%",
//                           borderLeftWidth: 1,
//                           paddingTop: "5px",
//                         },
//                       ]}
//                     >
//                       {financialYear + yearIndex}-{" "}
//                       {(financialYear + yearIndex + 1).toString().slice(-2)}
//                     </Text>

//                     {/* Empty columns for alignment */}
//                     {Array.from({ length: 5 }).map((_, idx) => (
//                       <Text
//                         key={idx}
//                         style={[
//                           stylesCOP.particularsCellsDetail,
//                           styleExpenses.fontSmall,
//                           {
//                             textAlign: "center",
//                             width: "15.35%",
//                             paddingTop: "5px",
//                           },
//                         ]}
//                       />
//                     ))}
//                   </View>

//                   {/* ✅ Render Only Valid Months (skip row if Principal Repayment or Interest Liability <= 0) */}
//                   {filteredYearData.map((entry, monthIndex) => {
//                     // ✅ Skip moratorium months for the first year only
//                     if (yearIndex === 0 && monthIndex < moratoriumPeriod) {
//                       return null;
//                     }

//                     return (
//                       <View
//                         key={monthIndex}
//                         style={[
//                           stylesMOF.row,
//                           styles.tableRow,
//                           { borderBottomWidth: 0, borderTopWidth: 0 },
//                         ]}
//                       >
//                         <Text
//                           style={[
//                             styles.serialNumberCellStyle,
//                             { width: "8%" },
//                           ]}
//                         >
//                           {"\u00A0"}
//                         </Text>

//                         <Text
//                           style={[
//                             stylesCOP.detailsCellDetail,
//                             styleExpenses.particularWidth,
//                             styleExpenses.bordernone,
//                             {
//                               textAlign: "left",
//                               width: "15.35%",
//                               borderLeftWidth: 1,
//                             },
//                           ]}
//                         >
//                           {entry.month}
//                         </Text>
//                         <Text
//                           style={[
//                             stylesCOP.particularsCellsDetail,
//                             styleExpenses.fontSmall,
//                             { textAlign: "center", width: "15.35%" },
//                           ]}
//                         >
//                           {formatNumber(entry.principalOpeningBalance)}
//                         </Text>
//                         <Text
//                           style={[
//                             stylesCOP.particularsCellsDetail,
//                             styleExpenses.fontSmall,
//                             { textAlign: "center", width: "15.35%" },
//                           ]}
//                         >
//                           {formatNumber(entry.principalRepayment)}
//                         </Text>
//                         <Text
//                           style={[
//                             stylesCOP.particularsCellsDetail,
//                             styleExpenses.fontSmall,
//                             { textAlign: "center", width: "15.35%" },
//                           ]}
//                         >
//                           {formatNumber(entry.principalClosingBalance)}
//                         </Text>
//                         <Text
//                           style={[
//                             stylesCOP.particularsCellsDetail,
//                             styleExpenses.fontSmall,
//                             { textAlign: "center", width: "15.35%" },
//                           ]}
//                         >
//                           {formatNumber(
//                             entry.principalRepayment === 0
//                               ? 0
//                               : entry.interestLiability
//                           )}
//                         </Text>
//                         <Text
//                           style={[
//                             stylesCOP.particularsCellsDetail,
//                             styleExpenses.fontSmall,
//                             { textAlign: "center", width: "15.35%" },
//                           ]}
//                         >
//                           {formatNumber(entry.totalRepayment)}
//                         </Text>
//                       </View>
//                     );
//                   })}

//                   {/* ✅ Total Row for the Year */}
//                   <View
//                     style={[
//                       stylesMOF.row,
//                       styles.tableRow,
//                       { borderTopWidth: 0 },
//                     ]}
//                   >
//                     <Text
//                       style={[styles.serialNumberCellStyle, { width: "8%" }]}
//                     ></Text>
//                     <Text
//                       style={[
//                         stylesCOP.particularsCellsDetail,
//                         styleExpenses.fontSmall,
//                         {
//                           textAlign: "center",
//                           width: "15.35%",
//                           borderLeftWidth: 1,
//                         },
//                       ]}
//                     ></Text>
//                     <Text
//                       style={[
//                         stylesCOP.particularsCellsDetail,
//                         styleExpenses.fontSmall,
//                         {
//                           textAlign: "center",
//                           width: "15.35%",
//                         },
//                       ]}
//                     ></Text>

//                     <Text
//                       style={[
//                         stylesCOP.particularsCellsDetail,
//                         styleExpenses.fontSmall,
//                         styleExpenses.fontBold,
//                         {
//                           textAlign: "center",
//                           width: "15.35%",
//                           borderTopWidth: 1,
//                         },
//                       ]}
//                     >
//                       {formatNumber(totalPrincipalRepayment)}
//                     </Text>

//                     <Text
//                       style={[
//                         stylesCOP.particularsCellsDetail,
//                         styleExpenses.fontSmall,
//                         {
//                           textAlign: "center",
//                           width: "15.35%",
//                           borderLeftWidth: 1,
//                         },
//                       ]}
//                     ></Text>
//                     <Text
//                       style={[
//                         stylesCOP.particularsCellsDetail,
//                         styleExpenses.fontSmall,
//                         styleExpenses.fontBold,
//                         {
//                           textAlign: "center",
//                           width: "15.35%",
//                           borderTopWidth: 1,
//                         },
//                       ]}
//                     >
//                       {formatNumber(totalInterestLiability)}
//                     </Text>
//                     <Text
//                       style={[
//                         stylesCOP.particularsCellsDetail,
//                         styleExpenses.fontSmall,
//                         styleExpenses.fontBold,
//                         {
//                           textAlign: "center",
//                           width: "15.35%",
//                           borderTopWidth: 1,
//                         },
//                       ]}
//                     >
//                       {formatNumber(totalRepayment)}
//                     </Text>
//                   </View>
//                 </View>
//               );
//             })}
//           </View>

//           {/* businees name and Client Name  */}
//           <View
//             style={[
//               {
//                 display: "flex",
//                 flexDirection: "column",
//                 gap: "80px",
//                 alignItems: "flex-end",
//                 justifyContent: "flex-end",
//                 marginTop: "60px",
//               },
//             ]}
//           >
//             <Text style={[styles.businessName, { fontSize: "10px" }]}>
//               {formData?.AccountInformation?.businessName || "Business Name"}
//             </Text>
//             <Text style={[styles.FinancialYear, { fontSize: "10px" }]}>
//               {formData?.AccountInformation?.businessOwner || "businessOwner"}
//             </Text>
//           </View>
//         </View>
//       </Page>
//     </>
//   );
// };

// export default React.memo(Repayment);

// ///////////////////////////////////////////////////////////////////////////////////

import React, { useEffect, useState } from "react";
import { Page, View, Text, Image } from "@react-pdf/renderer";
import { styles, stylesCOP, stylesMOF, styleExpenses } from "./Styles"; // Import only necessary styles
import { Font } from "@react-pdf/renderer";
import SAWatermark from "../Assets/SAWatermark";
import CAWatermark from "../Assets/CAWatermark";

// ✅ Register a Font That Supports Bold
Font.register({
  family: "Roboto",
  fonts: [
    { src: "https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Me5Q.ttf" }, // Regular
    {
      src: "https://fonts.gstatic.com/s/roboto/v20/KFOlCnqEu92Fr1MmEU9vAw.ttf",
      fontWeight: "bold",
    }, // Bold
  ],
});

const Repayment = ({
  formData,
  pdfType,
  onInterestCalculated,
  onPrincipalRepaymentCalculated,
  onMarchClosingBalanceCalculated, // New callback prop for March balances
  onInterestLiabilityUpdate,
}) => {
  const termLoan = formData?.MeansOfFinance?.termLoan?.termLoan;
  const interestRate = formData.ProjectReportSetting.interestOnTL / 100;
  const moratoriumPeriod = formData.ProjectReportSetting.MoratoriumPeriod; // Given = 5 months
  const repaymentMonths = formData.ProjectReportSetting.RepaymentMonths;
  const [yearlyInterestLiabilities, setYearlyInterestLiabilities] = useState(
    []
  );
  const [yearlyPrincipalRepayment, setYearlyPrincipalRepayment] = useState([]);

  // ✅ Correct the total repayment months (including moratorium)
  let totalMonths = repaymentMonths;
  let effectiveRepaymentMonths = repaymentMonths - moratoriumPeriod;
  let fixedPrincipalRepayment =
    effectiveRepaymentMonths > 0 ? termLoan / effectiveRepaymentMonths : 0;

  // ✅ Month Mapping (April - March)
  const months = [
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
    "January",
    "February",
    "March",
  ];

  // ✅ Convert Selected Month Name to Index (April-March Mapping)
  let startMonthIndex = months.indexOf(
    formData.ProjectReportSetting.SelectStartingMonth
  );

  if (startMonthIndex === -1) {
    startMonthIndex = 0; // Default to April if input is incorrect
  }

  let remainingBalance = termLoan; // Remaining loan balance

  let repaymentStartIndex = startMonthIndex; // Start from selected month

  const financialYear = parseInt(
    formData.ProjectReportSetting.FinancialYear || 2025
  );

  let data = [];

  // ✅ Track the Total Elapsed Months Since Repayment Start
  let elapsedRepaymentMonths = 0;
  let elapsedMonths = 0; // total from start including moratorium

  for (let year = 0; year < 10; year++) {
    let yearData = [];
    let firstMonth = year === 0 ? repaymentStartIndex : 0;

    for (let i = firstMonth; i < 12; i++) {
      if (elapsedMonths >= repaymentMonths) break; // ✅ Fixed here

      let principalOpeningBalance = remainingBalance;
      let isMoratorium = elapsedMonths < moratoriumPeriod;

      let principalRepayment = isMoratorium ? 0 : fixedPrincipalRepayment;
      let principalClosingBalance = Math.max(
        0,
        principalOpeningBalance - principalRepayment
      );

      let interestLiability = isMoratorium
        ? principalOpeningBalance * (interestRate / 12)
        : principalClosingBalance * (interestRate / 12);

      let totalRepayment = principalRepayment + interestLiability;

      yearData.push({
        month: months[i],
        principalOpeningBalance,
        principalRepayment,
        principalClosingBalance,
        interestLiability,
        totalRepayment,
      });

      remainingBalance = principalClosingBalance;
      elapsedMonths++;
      if (!isMoratorium) elapsedRepaymentMonths++;
    }

    if (yearData.length > 0) {
      data.push(yearData);

      const displayYear = financialYear + data.length - 1;
      // console.log(
      //   `📅 Financial Year: ${displayYear}-${(displayYear + 1)
      //     .toString()
      //     .slice(-2)}`
      // );

      // console.table(
      //   yearData.map((entry, index) => ({
      //     "Month No": elapsedMonths - yearData.length + index + 1,
      //     Month: entry.month,
      //     "Opening Balance": Number(entry.principalOpeningBalance || 0).toFixed(
      //       2
      //     ),
      //     "Principal Repayment": Number(entry.principalRepayment || 0).toFixed(
      //       2
      //     ),
      //     "Closing Balance": Number(entry.principalClosingBalance || 0).toFixed(
      //       2
      //     ),
      //     Interest: Number(entry.interestLiability || 0).toFixed(2),
      //     "Total Repayment": Number(entry.totalRepayment || 0).toFixed(2),
      //     "Is Moratorium":
      //       elapsedMonths - yearData.length + index < moratoriumPeriod
      //         ? "✅ Yes"
      //         : "❌ No",
      //   }))
      // );
    }

    if (elapsedMonths >= repaymentMonths) break; // ✅ Also here
  }

  // ✅ Compute Yearly Total Principal Repayment
  const computedYearlyPrincipalRepayment = data.map((yearData) =>
    yearData.reduce((sum, entry) => sum + entry.principalRepayment, 0)
  );

  useEffect(() => {
    setYearlyPrincipalRepayment(computedYearlyPrincipalRepayment);

    if (onPrincipalRepaymentCalculated) {
      onPrincipalRepaymentCalculated(computedYearlyPrincipalRepayment);
    }
  }, []);

  // ✅ Store Year-Wise Interest Liability
  // data.forEach((yearData) => {
  //   let totalInterestLiability = yearData.reduce(
  //     (sum, entry) => sum + entry.interestLiability,
  //     0
  //   );
  //   yearlyInterestLiabilities.push(totalInterestLiability);
  // });

  // useEffect(() => {
  //   // ✅ Compute Yearly Interest Liabilities Same as Displayed
  //   const correctYearlyInterestLiabilities = data.map((yearData) => {
  //     let totalPrincipalRepayment = yearData.reduce(
  //       (sum, entry) => sum + entry.principalRepayment,
  //       0
  //     );
  //     let totalInterestLiability = yearData.reduce(
  //       (sum, entry) => sum + entry.interestLiability,
  //       0
  //     );
  //     let totalRepayment = yearData.reduce(
  //       (sum, entry) => sum + entry.totalRepayment,
  //       0
  //     );

  //     // ✅ Set other totals to 0 if principal repayment is 0
  //     if (totalPrincipalRepayment === 0) {
  //       totalInterestLiability = 0;
  //       totalRepayment = 0;
  //     }

  //     return totalInterestLiability; // ✅ Only return interest liabilities
  //   });

  //   // ✅ Set state with the correct computed interest liabilities
  //   setYearlyInterestLiabilities(correctYearlyInterestLiabilities);
  //   console.log("correctYearlyInterestLiabilities",correctYearlyInterestLiabilities)

  //   // ✅ Send the correct values to the parent component
  //   if (onInterestCalculated) {
  //     onInterestCalculated(correctYearlyInterestLiabilities);
  //   }

  //   // ✅ Console log to verify the correct values
  //   //  console.log("Correct Yearly Interest Liabilities Sent to Parent:", correctYearlyInterestLiabilities);
  // }, [JSON.stringify(data)]); // Trigger when data changes

  // ─── USEEFFECT TO SEND & CONSOLE MARCH PRINCIPAL CLOSING BALANCES ──────
  useEffect(() => {
    if (!Array.isArray(data)) return;

    const yearlyInterestLiabilities = [];

    data.forEach((yearData) => {
      let totalPrincipalRepayment = 0;
      let totalInterestLiability = 0;
      let totalRepayment = 0;

      yearData.forEach((entry) => {
        if (entry?.principalRepayment > 0) {
          totalPrincipalRepayment += entry.principalRepayment;
          totalInterestLiability += entry.interestLiability;
          totalRepayment += entry.totalRepayment;
        }
      });

      // ✅ If principal repayment is 0 for the year, ignore interest
      if (totalPrincipalRepayment === 0) {
        totalInterestLiability = 0;
        totalRepayment = 0;
      }

      yearlyInterestLiabilities.push(totalInterestLiability);
    });

    setYearlyInterestLiabilities(yearlyInterestLiabilities);
    // console.log("correctYearlyInterestLiabilities", yearlyInterestLiabilities);

    if (onInterestCalculated) {
      onInterestCalculated(yearlyInterestLiabilities);
    }
  }, [JSON.stringify(data)]);

  useEffect(() => {
    const marchClosingBalances = data.map((yearData) => {
      const marchEntry = yearData.find((entry) => entry.month === "March");
      return marchEntry ? marchEntry.principalClosingBalance : 0;
    });

    // console.log("Original March Principal Closing Balances:", marchClosingBalances);

    if (onMarchClosingBalanceCalculated) {
      onMarchClosingBalanceCalculated(marchClosingBalances);
    }
  }, [JSON.stringify(data), onMarchClosingBalanceCalculated]);

  let yearCounter = 1; // ✅ Separate counter for valid years
  // ─────────────────────────────────────────────────────────────────────────

  const formatNumber = (value) => {
    const formatType = formData?.ProjectReportSetting?.Format || "1"; // Default to Indian Format
    if (value === undefined || value === null || isNaN(value)) return "0.00"; // ✅ Handle invalid values with 2 decimals

    switch (formatType) {
      case "1": // Indian Format (1,23,456.00)
        return new Intl.NumberFormat("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(value);

      case "2": // USD Format (1,123,456.00)
        return new Intl.NumberFormat("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(value);

      case "3": // Generic Indian Format (1,23,456.00)
        return new Intl.NumberFormat("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(value);

      default: // Default to Indian Format with 2 decimal places
        return new Intl.NumberFormat("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(value);
    }
  };

  let globalMonthIndex = 0;
  let finalRepaymentReached = false;
  let displayYearCounter = 1; // 👈 Start counting from 1 (for S. No.)
  let globalMonthCounter = 0; // 👈 To calculate absolute months for moratorium

  return (
    <>
      <Page
        // orientation={
        //   formData.ProjectReportSetting.ProjectionYears > 7
        //     ? "landscape"
        //     : "portrait"
        // }
        // wrap={false}
        style={[{ padding: "20px" }]}
      >
        <View style={styleExpenses.paddingx}>
          {/* businees name and financial year  */}
          <View>
            <Text style={styles.businessName}>
              {formData?.AccountInformation?.businessName || "Business Bame"}
            </Text>
            <Text style={styles.FinancialYear}>
              Financial Year{" "}
              {formData?.ProjectReportSetting?.FinancialYear
                ? `${formData.ProjectReportSetting.FinancialYear}-${(
                    parseInt(formData.ProjectReportSetting.FinancialYear) + 1
                  )
                    .toString()
                    .slice(-2)}`
                : "2025-26"}
            </Text>
          </View>

          {/* Amount format */}

          <View
            style={{
              display: "flex",
              alignContent: "flex-end",
              justifyContent: "flex-end",
              alignItems: "flex-end",
            }}
          >
            <Text style={[styles.AmountIn, styles.italicText]}>
              (Amount In{" "}
              {
                formData?.ProjectReportSetting?.AmountIn === "rupees"
                  ? "Rs." // Show "Rupees" if "rupees" is selected
                  : formData?.ProjectReportSetting?.AmountIn === "thousand"
                  ? "Thousands" // Show "Thousands" if "thousand" is selected
                  : formData?.ProjectReportSetting?.AmountIn === "lakhs"
                  ? "Lakhs" // Show "Lakhs" if "lakhs" is selected
                  : formData?.ProjectReportSetting?.AmountIn === "crores"
                  ? "Crores" // Show "Crores" if "crores" is selected
                  : formData?.ProjectReportSetting?.AmountIn === "millions"
                  ? "Millions" // Show "Millions" if "millions" is selected
                  : "" // Default case, in case the value is not found (you can add a fallback text here if needed)
              }
              )
            </Text>
          </View>

          <View>
            {/* Heading */}
            <View
              style={[
                stylesCOP.heading,
                {
                  fontWeight: "bold",
                  paddingLeft: 10,
                  borderWidth: "0px",
                },
              ]}
            >
              <Text>Repayment of Term Loan</Text>
            </View>

            {/* Term Loan Details Section */}
            <View style={{ paddingHorizontal: 10, marginTop: 10 }}>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  {
                    fontWeight: "bold",
                    borderWidth: "0px",
                  },
                ]}
              >
                Term Loan = {formatNumber(termLoan)}
              </Text>

              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  {
                    fontWeight: "bold",
                    borderWidth: "0px",
                  },
                ]}
              >
                Interest Rate = {interestRate * 100}% per annum
              </Text>

              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  {
                    fontWeight: "bold",
                    borderWidth: "0px",
                  },
                ]}
              >
                Moratorium Period = {moratoriumPeriod} Months
              </Text>

              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  {
                    fontWeight: "bold",
                    borderWidth: "0px",
                  },
                ]}
              >
                Number of Years ={" "}
                {Math.floor(formData.ProjectReportSetting.RepaymentMonths / 12)}{" "}
                years
                {formData.ProjectReportSetting.RepaymentMonths % 12 !== 0 &&
                  ` ${
                    formData.ProjectReportSetting.RepaymentMonths % 12
                  } months`}
              </Text>
            </View>

            {/* table header  */}

            <View style={[styles.table, { marginTop: "10px" }]}>
              <View style={styles.tableHeader}>
                <Text
                  style={[
                    styles.serialNoCell,
                    styleExpenses.sno,
                    {
                      width: "8%",
                      paddingHorizontal: "1px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    },
                  ]}
                >
                  S. No.
                </Text>
                <Text
                  style={[
                    styles.detailsCell,
                    {
                      textAlign: "center",
                      width: "15.35%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    },
                  ]}
                >
                  Years / Quarters
                </Text>
                <Text
                  style={[
                    styles.detailsCell,
                    {
                      textAlign: "center",
                      width: "15.35%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    },
                  ]}
                >
                  Principal Opening Balance
                </Text>
                <Text
                  style={[
                    styles.detailsCell,
                    {
                      textAlign: "center",
                      width: "15.35%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    },
                  ]}
                >
                  Principal Repayment
                </Text>
                <Text
                  style={[
                    styles.detailsCell,
                    {
                      textAlign: "center",
                      width: "15.35%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    },
                  ]}
                >
                  Principal Closing Balance
                </Text>
                <Text
                  style={[
                    styles.detailsCell,
                    {
                      textAlign: "center",
                      width: "15.35%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    },
                  ]}
                >
                  Interest Liability
                </Text>
                <Text
                  style={[
                    styles.detailsCell,
                    {
                      textAlign: "center",
                      width: "15.35%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    },
                  ]}
                >
                  Total Repayment
                </Text>
              </View>
            </View>

            {/* Table Body */}
            {data.map((yearData, yearIndex) => {
              const moratoriumPeriod = parseInt(
                formData?.ProjectReportSetting?.MoratoriumPeriod || 0
              );

              let filteredYearData = [...yearData];

              // Check if every month in this year is within the moratorium
              let futureCounter = globalMonthCounter;
              const isFullYearInMoratorium = filteredYearData.every(
                () => futureCounter++ < moratoriumPeriod
              );

              globalMonthCounter += filteredYearData.length;

              // Initialize total repayment for only visible months
              let totalPrincipalRepayment = 0;
              let totalInterestLiability = 0;
              let totalRepayment = 0;

              // console.log(
              //   `Year ${
              //     financialYear + yearIndex
              //   }: Total Repayment (Visible Months Only):`
              // );

              // Render Only Valid Months
              const visibleMonths = filteredYearData.filter(
                (entry, monthIndex) => {
                  if (globalMonthIndex < moratoriumPeriod) {
                    globalMonthIndex++;
                    return false; // Skip the months within the moratorium period
                  }

                  // Add the month to the total repayment if it is visible
                  totalPrincipalRepayment += entry.principalRepayment;
                  totalInterestLiability +=
                    entry.principalRepayment === 0
                      ? 0
                      : entry.interestLiability;
                  totalRepayment += entry.totalRepayment;

                  // Log visible months and their total repayment
                  // console.log(`Month: ${entry.month}`);
                  // console.log(
                  //   `Total Repayment for ${entry.month}: ${entry.totalRepayment}`
                  // );

                  return true; // Keep the visible months
                }
              );

              // console.log(
              //   `Year ${
              //     financialYear + yearIndex
              //   }: Total Repayment for Visible Months: ${totalRepayment}`
              // );

              return (
                <View
                  key={yearIndex}
                  wrap={false}
                  style={[
                    { borderLeftWidth: 0 },
                    {
                      position: "relative",
                      zIndex: 1,
                      borderLeftWidth: 1,
                      borderTopWidth: 1,
                    },
                  ]}
                >
                  {/* Year Row */}
                  {!isFullYearInMoratorium && (
                    <View style={[stylesMOF.row, { borderBottomWidth: 0 }]}>
                      <Text
                        style={[
                          styles.serialNumberCellStyle,
                          { width: "8%", paddingTop: "5px" },
                        ]}
                      >
                        {displayYearCounter++}
                      </Text>

                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.bordernone,
                          styleExpenses.fontBold,
                          {
                            textAlign: "left",
                            width: "15.35%",
                            borderLeftWidth: 1,
                            paddingTop: "5px",
                          },
                        ]}
                      >
                        {financialYear + yearIndex}-{" "}
                        {(financialYear + yearIndex + 1).toString().slice(-2)}
                      </Text>

                      {/* Empty columns for alignment */}
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Text
                          key={idx}
                          style={[
                            stylesCOP.particularsCellsDetail,
                            styleExpenses.fontSmall,
                            {
                              textAlign: "center",
                              width: "15.35%",
                              paddingTop: "5px",
                            },
                          ]}
                        />
                      ))}
                    </View>
                  )}

                  {/* Render Only Valid Months */}
                  {visibleMonths.map((entry, monthIndex) => {
                    if (
                      entry.principalClosingBalance === 0 &&
                      !finalRepaymentReached
                    ) {
                      finalRepaymentReached = true;
                    } else if (finalRepaymentReached) {
                      return null;
                    }

                    return (
                      <View
                        key={monthIndex}
                        style={[
                          stylesMOF.row,
                          styles.tableRow,
                          { borderBottomWidth: 0, borderTopWidth: 0 },
                        ]}
                      >
                        <Text
                          style={[
                            styles.serialNumberCellStyle,
                            { width: "8%" },
                          ]}
                        >
                          {"\u00A0"}
                        </Text>

                        <Text
                          style={[
                            stylesCOP.detailsCellDetail,
                            styleExpenses.particularWidth,
                            styleExpenses.bordernone,
                            {
                              textAlign: "left",
                              width: "15.35%",
                              borderLeftWidth: 1,
                            },
                          ]}
                        >
                          {entry.month}
                        </Text>
                        <Text
                          style={[
                            stylesCOP.particularsCellsDetail,
                            styleExpenses.fontSmall,
                            { textAlign: "center", width: "15.35%" },
                          ]}
                        >
                          {formatNumber(entry.principalOpeningBalance)}
                        </Text>
                        <Text
                          style={[
                            stylesCOP.particularsCellsDetail,
                            styleExpenses.fontSmall,
                            { textAlign: "center", width: "15.35%" },
                          ]}
                        >
                          {formatNumber(entry.principalRepayment)}
                        </Text>
                        <Text
                          style={[
                            stylesCOP.particularsCellsDetail,
                            styleExpenses.fontSmall,
                            { textAlign: "center", width: "15.35%" },
                          ]}
                        >
                          {formatNumber(entry.principalClosingBalance)}
                        </Text>
                        <Text
                          style={[
                            stylesCOP.particularsCellsDetail,
                            styleExpenses.fontSmall,
                            { textAlign: "center", width: "15.35%" },
                          ]}
                        >
                          {formatNumber(
                            entry.principalRepayment === 0
                              ? 0
                              : entry.interestLiability
                          )}
                        </Text>
                        <Text
                          style={[
                            stylesCOP.particularsCellsDetail,
                            styleExpenses.fontSmall,
                            { textAlign: "center", width: "15.35%" },
                          ]}
                        >
                          {formatNumber(entry.totalRepayment)}
                        </Text>
                      </View>
                    );
                  })}

                  {/* Total Row for the Year */}
                  {!isFullYearInMoratorium && (
                    <View
                      style={[
                        stylesMOF.row,
                        styles.tableRow,
                        { borderTopWidth: 0 },
                      ]}
                    >
                      <Text
                        style={[styles.serialNumberCellStyle, { width: "8%" }]}
                      ></Text>
                      <Text
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                          {
                            textAlign: "center",
                            width: "15.35%",
                            borderLeftWidth: 1,
                          },
                        ]}
                      ></Text>
                      <Text
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                          {
                            textAlign: "center",
                            width: "15.35%",
                          },
                        ]}
                      ></Text>

                      <Text
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                          styleExpenses.fontBold,
                          {
                            textAlign: "center",
                            width: "15.35%",
                            borderTopWidth: 1,
                          },
                        ]}
                      >
                        {formatNumber(totalPrincipalRepayment)}
                      </Text>

                      <Text
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                          {
                            textAlign: "center",
                            width: "15.35%",
                            borderLeftWidth: 1,
                          },
                        ]}
                      ></Text>
                      <Text
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                          styleExpenses.fontBold,
                          {
                            textAlign: "center",
                            width: "15.35%",
                            borderTopWidth: 1,
                          },
                        ]}
                      >
                        {formatNumber(totalInterestLiability)}
                      </Text>
                      <Text
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                          styleExpenses.fontBold,
                          {
                            textAlign: "center",
                            width: "15.35%",
                            borderTopWidth: 1,
                          },
                        ]}
                      >
                        {formatNumber(totalRepayment)}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {/* businees name and Client Name  */}
          <View
            style={[
              {
                display: "flex",
                flexDirection: "column",
                gap: "80px",
                alignItems: "flex-end",
                justifyContent: "flex-end",
                marginTop: "60px",
              },
            ]}
          >
            <Text style={[styles.businessName, { fontSize: "10px" }]}>
              {formData?.AccountInformation?.businessName || "Business Name"}
            </Text>
            <Text style={[styles.FinancialYear, { fontSize: "10px" }]}>
              {formData?.AccountInformation?.businessOwner || "businessOwner"}
            </Text>
          </View>
        </View>
      </Page>
    </>
  );
};

export default React.memo(Repayment);