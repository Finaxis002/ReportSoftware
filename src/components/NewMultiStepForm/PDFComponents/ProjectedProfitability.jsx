// import React, {useEffect} from "react";
// import { Page, View, Text } from "@react-pdf/renderer";
// import { styles, stylesCOP, stylesMOF, styleExpenses } from "./Styles"; // Import only necessary styles
// import { Font } from "@react-pdf/renderer";

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

// const ProjectedProfitability = ({
//   formData,
//   localData,
//   normalExpense,
//   directExpense,
//   onComputedData,
// }) => {
//   // Ensure formData and Expenses exist before destructuring

//   const activeRowIndex = 0; // Define it or fetch dynamically if needed

//   const totalAnnualWages = normalExpense.reduce(
//     (sum, expense) => sum + Number(expense.amount * expense.quantity * 12 || 0),
//     0
//   );

//   const formatAmountInIndianStyle = (amount) => {
//     return amount.toLocaleString("en-IN"); // Format as per Indian number system
//   };

//   // ✅ Precompute Multiplication for Each Year Before Rendering
//   const totalRevenueReceipts = Array.from({
//     length: parseInt(formData.ProjectReportSetting.ProjectionYears) || 0,
//   }).map((_, yearIndex) => {
//     return formData.Revenue.formFields.reduce(
//       (product, item) => product * (item.years?.[yearIndex] || 1),
//       1 // Start with 1, because multiplying by 0 gives 0
//     );
//   });

//   // ✅ Precompute Total Adjusted Revenue for Each Year Before Rendering
//   // total revenue receipt + Closing STock - Opening Stock
//   const adjustedRevenueValues = Array.from({
//     length: parseInt(formData.ProjectReportSetting.ProjectionYears) || 0,
//   }).map((_, yearIndex) => {
//     // Get total revenue for this year
//     const totalRevenue = formData.Revenue?.formFields?.reduce(
//       (product, item) => product * (item.years?.[yearIndex] || 1),
//       1 // Start with 1, because multiplying by 0 gives 0
//     );

//     // Get closing and opening stock for this year
//     const closingStock =
//       Number(formData.MoreDetails?.closingStock?.[yearIndex]) || 0;
//     const openingStock =
//       Number(formData.MoreDetails?.openingStock?.[yearIndex]) || 0;

//     // Compute Adjusted Revenue
//     return totalRevenue + closingStock - openingStock;
//   });

//   // ✅ Precompute Total Direct Expenses (Including Salary & Wages) for Each Year Before Rendering
//   const totalDirectExpenses = Array.from({
//     length: parseInt(formData.ProjectReportSetting.ProjectionYears) || 0,
//   }).map((_, yearIndex) => {
//     // ✅ Compute Salary & Wages for this year
//     const salaryAndWages =
//       yearIndex === 0
//         ? Number(totalAnnualWages) || 0 // Year 1: Use base value
//         : (Number(totalAnnualWages) || 0) *
//           Math.pow(
//             1 + formData.ProjectReportSetting.rateOfExpense / 100,
//             yearIndex
//           ); // Apply growth for subsequent years

//     // ✅ Compute Total Direct Expenses for this year (Including Salary & Wages)
//     const directExpensesTotal = directExpense
//       ?.filter((expense) => expense.type === "direct")
//       ?.reduce((sum, expense) => {
//         const baseValue = Number(expense.value) || 0;
//         const annualizedValue = baseValue * 12; // Convert monthly to annual
//         return (
//           sum +
//           annualizedValue *
//             Math.pow(
//               1 + formData.ProjectReportSetting.rateOfExpense / 100,
//               yearIndex
//             )
//         );
//       }, 0);

//     return salaryAndWages + directExpensesTotal; // ✅ Total Direct Expenses (Including Salary & Wages)
//   });

//   // ✅ Precompute Total Indirect Expenses for Each Year Before Rendering
//   const totalIndirectExpenses = Array.from({
//     length: parseInt(formData.ProjectReportSetting.ProjectionYears) || 0,
//   }).map((_, yearIndex) => {
//     return directExpense
//       ?.filter((expense) => expense.type === "indirect")
//       ?.reduce((sum, expense) => {
//         const baseValue = Number(expense.value) || 0;
//         const annualizedValue = baseValue * 12; // Convert monthly to annual
//         return (
//           sum +
//           annualizedValue *
//             Math.pow(
//               1 + formData.ProjectReportSetting.rateOfExpense / 100,
//               yearIndex
//             )
//         );
//       }, 0);
//   });

//   // ✅ Precompute Gross Profit for Each Year Before Rendering
//   const grossProfitValues = Array.from({
//     length: parseInt(formData.ProjectReportSetting.ProjectionYears) || 0,
//   }).map((_, yearIndex) => {
//     // Get Adjusted Revenue (Total Revenue + Closing Stock - Opening Stock)
//     const adjustedRevenue =
//       (formData.Revenue?.formFields?.reduce(
//         (product, item) => product * (item.years?.[yearIndex] || 1),
//         1 // Start with 1, because multiplying by 0 gives 0
//       ) || 0) +
//       (Number(formData.MoreDetails?.closingStock?.[yearIndex]) || 0) -
//       (Number(formData.MoreDetails?.openingStock?.[yearIndex]) || 0);

//     // Get Total Direct Expenses (Including Salary & Wages)
//     const totalDirectExpenses =
//       (yearIndex === 0
//         ? Number(totalAnnualWages) || 0 // Year 1: Use base value
//         : (Number(totalAnnualWages) || 0) *
//           Math.pow(
//             1 + formData.ProjectReportSetting.rateOfExpense / 100,
//             yearIndex
//           )) +
//       (directExpense
//         ?.filter((expense) => expense.type === "direct")
//         ?.reduce((sum, expense) => {
//           const baseValue = Number(expense.value) || 0;
//           const annualizedValue = baseValue * 12; // Convert monthly to annual
//           return (
//             sum +
//             annualizedValue *
//               Math.pow(
//                 1 + formData.ProjectReportSetting.rateOfExpense / 100,
//                 yearIndex
//               )
//           );
//         }, 0) || 0);

//     // Compute Gross Profit
//     return adjustedRevenue - totalDirectExpenses;
//   });

//   // ✅ Precompute Net Profit Before Tax (NPBT) for Each Year Before Rendering
//   const netProfitBeforeTax = grossProfitValues.map((grossProfit, yearIndex) => {
//     return grossProfit - totalIndirectExpenses[yearIndex];
//   });

//   // ✅ Precompute Income Tax Calculation for Each Year Before Rendering
//   const incomeTaxCalculation = netProfitBeforeTax.map((npbt, yearIndex) => {
//     return (npbt * formData.ProjectReportSetting.incomeTax) / 100;
//   });

//   // ✅ Precompute Net Profit After Tax (NPAT) for Each Year Before Rendering
//   const netProfitAfterTax = netProfitBeforeTax.map((npat, yearIndex) => {
//     return npat - incomeTaxCalculation[yearIndex]; // ✅ Correct subtraction
//   });

//   // const netProfitBeforeTax = formData?.Revenue?.formFields?.map((item) => {
//   //   return Number(item.years?.[0]) - (Number(item.expenses?.[0]) || 0);
//   // }) || [];

//   // ✅ Send computed values to parent
  
//   useEffect(() => {
//     if (netProfitBeforeTax.length > 0) {
//       onComputedData((prev) => ({
//         ...prev,
//         netProfitBeforeTax,
//       }));
//     }
//   }, [netProfitBeforeTax]);


//   return (
//     <Page
//       size="A4"
//       orientation={
//         formData.ProjectReportSetting.ProjectionYears <= 7
//           ? "portrait"
//           : "landscape"
//       }
//     >
//       <View style={styleExpenses.paddingx}>
//         <Text style={[styles.clientName]}>{localData.clientName}</Text>
//         <View
//           style={[
//             stylesCOP.heading,
//             {
//               fontWeight: "bold",
//               paddingLeft: 10,
//             },
//           ]}
//         >
//           <Text>Projected Profitability Statement</Text>
//         </View>

//         <View style={[styles.table]}>
//           <View style={styles.tableHeader}>
//             <Text style={[styles.serialNoCell, styleExpenses.sno]}>S. No.</Text>
//             <Text style={[styles.detailsCell, styleExpenses.particularWidth]}>
//               Particulars
//             </Text>
//             {Array.from({
//               length:
//                 parseInt(formData.ProjectReportSetting.ProjectionYears) || 0,
//             }).map((_, index) => (
//               <Text key={index} style={styles.particularsCell}>
//                 Year {index + 1}
//               </Text>
//             ))}
//           </View>
//         </View>

//         {/* Total Revenue Receipt */}
//         <View
//           style={[
//             stylesMOF.row,
//             styles.tableRow,
//             {
//               fontWeight: "black",
//               marginVertical: "12px",
//               borderLeft: "2px solid #000",
//             },
//           ]}
//         >
//           <Text
//             style={[
//               stylesCOP.serialNoCellDetail,
//               styleExpenses.sno,
//               styleExpenses.bordernone,
//             ]}
//           >
//             A
//           </Text>
//           <Text
//             style={[
//               stylesCOP.detailsCellDetail,
//               styleExpenses.particularWidth,
//               styleExpenses.bordernone,
//               { fontWeight: "extrabold" },
//             ]}
//           >
//             Total Revenue Receipt
//           </Text>

//           {/* ✅ Display Precomputed Total Revenue Values */}
//           {totalRevenueReceipts.map((totalYearValue, yearIndex) => (
//             <Text
//               key={yearIndex}
//               style={[
//                 stylesCOP.particularsCellsDetail,
//                 styleExpenses.fontSmall,
//                 { fontWeight: "bold", borderLeftWidth: "0px" }, // ✅ Use "bold" for proper styling
//               ]}
//             >
//               {new Intl.NumberFormat("en-IN").format(totalYearValue)}
//             </Text>
//           ))}
//         </View>

//         {/* Closing Stock / Inventory */}
//         <View style={[stylesMOF.row, styles.tableRow]}>
//           <Text
//             style={[
//               stylesCOP.serialNoCellDetail,
//               styleExpenses.sno,
//               styleExpenses.bordernone,
//             ]}
//           >
//             B
//           </Text>
//           <Text
//             style={[
//               stylesCOP.detailsCellDetail,
//               styleExpenses.particularWidth,
//               styleExpenses.bordernone,
//             ]}
//           >
//             Add: Closing Stock / Inventory
//           </Text>

//           {Array.from({
//             length:
//               parseInt(formData.ProjectReportSetting.ProjectionYears) || 0,
//           }).map((_, index) => (
//             <Text
//               key={`closingStock-${index}`}
//               style={[
//                 stylesCOP.particularsCellsDetail,
//                 styleExpenses.fontSmall,
//               ]}
//             >
//               {new Intl.NumberFormat("en-IN").format(formData.MoreDetails.closingStock?.[index] ?? 0)}

//             </Text>
//           ))}
//         </View>

//         {/* Opening Stock / Inventory */}
//         <View style={[stylesMOF.row, styles.tableRow]}>
//           <Text
//             style={[
//               stylesCOP.serialNoCellDetail,
//               styleExpenses.sno,
//               styleExpenses.bordernone,
//             ]}
//           ></Text>
//           <Text
//             style={[
//               stylesCOP.detailsCellDetail,
//               styleExpenses.particularWidth,
//               styleExpenses.bordernone,
//             ]}
//           >
//             Less: Opening Stock / Inventory
//           </Text>

//           {Array.from({
//             length:
//               parseInt(formData.ProjectReportSetting.ProjectionYears) || 0,
//           }).map((_, index) => (
//             <Text
//               key={`openingStock-${index}`}
//               style={[
//                 stylesCOP.particularsCellsDetail,
//                 styleExpenses.fontSmall,
//               ]}
//             >
//               {formData.MoreDetails.openingStock?.[index] ?? 0}
//             </Text>
//           ))}
//         </View>

//         {/* Computation of Total Revenue, Adding Closing Stock, and Subtracting Opening Stock */}
//         <View
//           style={[stylesMOF.row, styles.tableRow, { borderBottomWidth: "0px" }]}
//         >
//           <Text
//             style={[
//               stylesCOP.serialNoCellDetail,
//               styleExpenses.sno,
//               styleExpenses.bordernone,
//             ]}
//           ></Text>
//           <Text
//             style={[
//               stylesCOP.detailsCellDetail,
//               styleExpenses.particularWidth,
//               styleExpenses.bordernone,
//               { fontWeight: "extrabold" },
//             ]}
//           ></Text>

//           {/* Compute Totals for Each Year */}
//           {/* ✅ Display Precomputed Adjusted Revenue Values */}
//           {adjustedRevenueValues.map((finalValue, yearIndex) => (
//             <Text
//               key={`finalValue-${yearIndex}`}
//               style={[
//                 stylesCOP.particularsCellsDetail,
//                 styleExpenses.fontSmall,
//                 { borderWidth: "2px", borderLeftWidth: "0px" },
//               ]}
//             >
//               {finalValue}
//             </Text>
//           ))}
//         </View>

//         {/* direct expenses */}
//         <View style={[stylesMOF.row, styleExpenses.headerRow]}>
//           <Text style={[styleExpenses.sno]}>C</Text>
//           <Text style={stylesMOF.cell}>Less : Direct Expenses</Text>
//         </View>

//         {normalExpense.map((expense, index) => {
//           if (index !== activeRowIndex) return null; // Only render the active row

//           return (
//             <View key={index} style={[stylesMOF.row, styles.tableRow]}>
//               <Text
//                 style={[
//                   stylesCOP.serialNoCellDetail,
//                   styleExpenses.sno,
//                   styleExpenses.bordernone,
//                 ]}
//               >
//                 1
//               </Text>
//               <Text
//                 style={[
//                   stylesCOP.detailsCellDetail,
//                   styleExpenses.particularWidth,
//                   styleExpenses.bordernone,
//                 ]}
//               >
//                 Salary and Wages
//               </Text>

//               {/* Map through projection years to display calculations */}
//               {[
//                 ...Array(
//                   parseInt(formData.ProjectReportSetting.ProjectionYears) || 0
//                 ),
//               ].map((_, yearIndex) => {
//                 const Annual = Number(totalAnnualWages) || 0;
//                 const initialValue = Annual; // Base annual value calculation

//                 // For the first year (first column), show totalAnnualWages
//                 const calculatedValue =
//                   yearIndex === 0
//                     ? initialValue // For Year 1, just show the base value
//                     : initialValue *
//                       Math.pow(
//                         1 + formData.ProjectReportSetting.rateOfExpense / 100,
//                         yearIndex
//                       ); // Apply growth for subsequent years

//                 return (
//                   <Text
//                     key={yearIndex}
//                     style={[
//                       stylesCOP.particularsCellsDetail,
//                       styleExpenses.fontSmall,
//                     ]}
//                   >
//                     {yearIndex === 0
//                       ? formatAmountInIndianStyle(Annual.toFixed(2)) // For Year 1, show the original totalAnnualWages
//                       : formatAmountInIndianStyle(
//                           calculatedValue.toFixed(2)
//                         )}{" "}
//                   </Text>
//                 );
//               })}
//             </View>
//           );
//         })}

//         {directExpense
//           .filter((expense) => expense.type === "direct")
//           .map((expense, index) => {
//             const baseValue = Number(expense.value) || 0;
//             const initialValue = baseValue * 12;

//             return (
//               <View key={index} style={[stylesMOF.row, styles.tableRow]}>
//                 <Text
//                   style={[
//                     stylesCOP.serialNoCellDetail,
//                     styleExpenses.sno,
//                     styleExpenses.bordernone,
//                   ]}
//                 >
//                   {index + 2}
//                 </Text>
//                 <Text
//                   style={[
//                     stylesCOP.detailsCellDetail,
//                     styleExpenses.particularWidth,
//                     styleExpenses.bordernone,
//                   ]}
//                 >
//                   {expense.name}
//                 </Text>
//                 {[
//                   ...Array(
//                     parseInt(formData.ProjectReportSetting.ProjectionYears) || 0
//                   ),
//                 ].map((_, yearIndex) => {
//                   const calculatedValue =
//                     initialValue *
//                     Math.pow(
//                       1 + formData.ProjectReportSetting.rateOfExpense / 100,
//                       yearIndex
//                     );
//                   return (
//                     <Text
//                       key={yearIndex}
//                       style={[
//                         stylesCOP.particularsCellsDetail,
//                         styleExpenses.fontSmall,
//                       ]}
//                     >
//                       {calculatedValue.toFixed(2)}
//                     </Text>
//                   );
//                 })}
//               </View>
//             );
//           })}

//         {/* direct Expenses total  */}

//         <View
//           style={[styles.tableRow, styles.totalRow, { paddingTop: "12px" }]}
//         >
//           <Text
//             style={[
//               stylesCOP.serialNoCellDetail,
//               styleExpenses.sno,
//               styleExpenses.bordernone,
//             ]}
//           ></Text>
//           <Text
//             style={[
//               stylesCOP.detailsCellDetail,
//               styleExpenses.particularWidth,
//               styleExpenses.bordernone,
//               { fontFamily: "Roboto", fontWeight: "extrabold" },
//             ]}
//           >
//             Total
//           </Text>
//           {/* ✅ Display Precomputed Total Direct Expenses */}
//           {totalDirectExpenses.map((totalValue, yearIndex) => (
//             <Text
//               key={yearIndex}
//               style={[
//                 stylesCOP.particularsCellsDetail,
//                 stylesCOP.boldText,
//                 styleExpenses.fontSmall,
//                 {
//                   fontFamily: "Roboto",
//                   fontWeight: "extrabold",
//                   borderLeftWidth: "0px",
//                 },
//               ]}
//             >
//               {formatAmountInIndianStyle(totalValue.toFixed(2))}
//             </Text>
//           ))}
//         </View>

//         {/* Gross Profit Calculation */}
//         <View
//           style={[stylesMOF.row, styles.tableRow, { marginVertical: "12px" }]}
//         >
//           <Text
//             style={[
//               stylesCOP.serialNoCellDetail,
//               styleExpenses.sno,
//               styleExpenses.bordernone,
//               { fontFamily: "Roboto", fontWeight: "extrabold" },
//             ]}
//           >
//             D
//           </Text>
//           <Text
//             style={[
//               stylesCOP.detailsCellDetail,
//               styleExpenses.particularWidth,
//               styleExpenses.bordernone,
//               { fontFamily: "Roboto", fontWeight: "extrabold" },
//             ]}
//           >
//             Gross Profit
//           </Text>

//           {/* ✅ Display Precomputed Gross Profit Values */}
//           {grossProfitValues.map((grossProfit, yearIndex) => (
//             <Text
//               key={`grossProfit-${yearIndex}`}
//               style={[
//                 stylesCOP.particularsCellsDetail,
//                 stylesCOP.boldText,
//                 styleExpenses.fontSmall,
//                 {
//                   borderWidth: "2px",
//                   borderLeftWidth: "0px",
//                   fontFamily: "Roboto",
//                   fontWeight: "extrabold",
//                 },
//               ]}
//             >
//               {formatAmountInIndianStyle(grossProfit.toFixed(2))}
//             </Text>
//           ))}
//         </View>

//         {/* indirect expense */}
//         <View style={[stylesMOF.row, styleExpenses.headerRow]}>
//           <Text style={[styleExpenses.sno]}>E</Text>

//           <Text style={stylesMOF.cell}>Less:Indirect Expenses</Text>
//         </View>

//         {directExpense
//           .filter((expense) => expense.type === "indirect")
//           .map((expense, index) => {
//             const baseValue = Number(expense.value) || 0;
//             const initialValue = baseValue * 12;

//             return (
//               <View key={index} style={[stylesMOF.row, styles.tableRow]}>
//                 <Text
//                   style={[
//                     stylesCOP.serialNoCellDetail,
//                     styleExpenses.sno,
//                     styleExpenses.bordernone,
//                   ]}
//                 >
//                   {index + 1}
//                 </Text>
//                 <Text
//                   style={[
//                     stylesCOP.detailsCellDetail,
//                     styleExpenses.particularWidth,
//                     styleExpenses.bordernone,
//                   ]}
//                 >
//                   {expense.name}
//                 </Text>
//                 {[
//                   ...Array(
//                     parseInt(formData.ProjectReportSetting.ProjectionYears) || 0
//                   ),
//                 ].map((_, yearIndex) => {
//                   const calculatedValue =
//                     initialValue *
//                     Math.pow(
//                       1 + formData.ProjectReportSetting.rateOfExpense / 100,
//                       yearIndex
//                     );
//                   return (
//                     <Text
//                       key={yearIndex}
//                       style={[
//                         stylesCOP.particularsCellsDetail,
//                         styleExpenses.fontSmall,
//                       ]}
//                     >
//                       {formatAmountInIndianStyle(calculatedValue.toFixed(2))}
//                     </Text>
//                   );
//                 })}
//               </View>
//             );
//           })}

//         {/* total of indirect expenses */}

//         <View style={[styles.tableRow, styles.totalRow]}>
//           <Text
//             style={[
//               stylesCOP.serialNoCellDetail,
//               styleExpenses.sno,
//               styleExpenses.bordernone,
//               { fontFamily: "Roboto", fontWeight: "extrabold" },
//             ]}
//           ></Text>
//           <Text
//             style={[
//               stylesCOP.detailsCellDetail,
//               styleExpenses.particularWidth,
//               styleExpenses.bordernone,
//               { fontFamily: "Roboto", fontWeight: "extrabold" },
//             ]}
//           >
//             Total
//           </Text>
//           {/* ✅ Display Precomputed Total Indirect Expenses */}
//           {totalIndirectExpenses.map((totalValue, yearIndex) => (
//             <Text
//               key={yearIndex}
//               style={[
//                 stylesCOP.particularsCellsDetail,
//                 stylesCOP.boldText,
//                 styleExpenses.fontSmall,
//                 {
//                   borderWidth: "2px",
//                   borderLeftWidth: "0px",
//                   fontFamily: "Roboto",
//                   fontWeight: "extrabold",
//                 },
//               ]}
//             >
//               {formatAmountInIndianStyle(totalValue.toFixed(2))}
//             </Text>
//           ))}
//         </View>

//         {/* Net Profit Before Tax Calculation */}
//         <View style={[stylesMOF.row, styles.tableRow, { marginTop: "12px" }]}>
//           <Text
//             style={[
//               stylesCOP.serialNoCellDetail,
//               styleExpenses.sno,
//               styleExpenses.bordernone,
//               {
//                 fontFamily: "Roboto", // ✅ Ensure using the registered font
//                 fontWeight: "bold", // ✅ Apply bold
//               },
//             ]}
//           >
//             F
//           </Text>
//           <Text
//             style={[
//               stylesCOP.detailsCellDetail,
//               styleExpenses.particularWidth,
//               styleExpenses.bordernone,
//               {
//                 fontFamily: "Roboto", // ✅ Ensure using the registered font
//                 fontWeight: "bold", // ✅ Apply bold
//               },
//             ]}
//           >
//             Net Profit Before Tax
//           </Text>

//           {/* ✅ Display Precomputed NPBT Values */}
//           {netProfitBeforeTax.map((npbt, yearIndex) => (
//             <Text
//               key={`netProfitBeforeTax-${yearIndex}`}
//               style={[
//                 stylesCOP.particularsCellsDetail,
//                 stylesCOP.boldText,
//                 styleExpenses.fontSmall,
//                 {
//                   borderWidth: "2px",
//                   fontFamily: "Roboto",
//                   fontWeight: "bold",
//                   color: "#000",
//                   borderLeftWidth: "0px",
//                 },
//               ]}
//             >
//               {formatAmountInIndianStyle(npbt.toFixed(2))}
//             </Text>
//           ))}
//         </View>

//         {/* Income Tax @  % */}

//         <View
//           style={[stylesMOF.row, styles.tableRow, { borderWidth: "0.1px" }]}
//         >
//           <Text
//             style={[
//               stylesCOP.serialNoCellDetail,
//               styleExpenses.sno,
//               styleExpenses.bordernone,
//               { borderWidth: "0.1px" },
//             ]}
//           >
//             Less
//           </Text>
//           <Text
//             style={[
//               stylesCOP.detailsCellDetail,
//               styleExpenses.particularWidth,
//               styleExpenses.bordernone,
//               { fontWeight: "extrabold" },
//               { borderWidth: "0.1px" },
//             ]}
//           >
//             Income Tax @ {formData.ProjectReportSetting.incomeTax} %
//           </Text>

//           {/* ✅ Display Precomputed Income Tax Values */}
//           {incomeTaxCalculation.map((tax, yearIndex) => (
//             <Text
//               key={`incomeTax-${yearIndex}`}
//               style={[
//                 stylesCOP.particularsCellsDetail,
//                 stylesCOP.boldText,
//                 styleExpenses.fontSmall,
//                 { borderWidth: "0.1px" },
//               ]}
//             >
//               {formatAmountInIndianStyle(tax.toFixed(2))}
//             </Text>
//           ))}
//         </View>

//         {/* Net Profit After Tax Calculation  */}

//         <View
//           style={[stylesMOF.row, styles.tableRow, { borderWidth: "0.1px" }]}
//         >
//           <Text
//             style={[
//               stylesCOP.serialNoCellDetail,
//               styleExpenses.sno,
//               styleExpenses.bordernone,
//               {
//                 fontFamily: "Roboto", // ✅ Ensure using the registered font
//                 fontWeight: "bold", // ✅ Apply bold
//               },
//             ]}
//           >
//             G
//           </Text>
//           <Text
//             style={[
//               stylesCOP.detailsCellDetail,
//               styleExpenses.particularWidth,
//               styleExpenses.bordernone,
//               {
//                 fontFamily: "Roboto", // ✅ Ensure using the registered font
//                 fontWeight: "bold", // ✅ Apply bold
//               },
//             ]}
//           >
//             Net Profit After Tax
//           </Text>
//           {/*  Display Precomputed Net Profit After Tax (NPAT) Values */}
//           {netProfitAfterTax.map((tax, yearIndex) => (
//             <Text
//               key={`netProfitAfterTax-${yearIndex}`}
//               style={[
//                 stylesCOP.particularsCellsDetail,
//                 stylesCOP.boldText,
//                 styleExpenses.fontSmall,
//                 {
//                   borderWidth: "2px",
//                   fontFamily: "Roboto",
//                   fontWeight: "bold",
//                   color: "#000",
//                   borderLeftWidth: "0px",
//                 },
//               ]}
//             >
//               {formatAmountInIndianStyle(tax.toFixed(2))}
//             </Text>
//           ))}
//         </View>
//       </View>
//     </Page>
//   );
// };

// export default ProjectedProfitability;


/////////////////////////////////////////////////////////////////////////////////////
import React, { useEffect } from "react";
import { Page, View, Text } from "@react-pdf/renderer";
import { styles, stylesCOP, stylesMOF, styleExpenses } from "./Styles"; 
import { Font } from "@react-pdf/renderer";

// ✅ Register a Font That Supports Bold
Font.register({
  family: "Roboto",
  fonts: [
    { src: "https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Me5Q.ttf" }, 
    { src: "https://fonts.gstatic.com/s/roboto/v20/KFOlCnqEu92Fr1MmEU9vAw.ttf", fontWeight: "bold" }, 
  ],
});

const ProjectedProfitability = ({
  formData,
  localData,
  normalExpense,
  directExpense,
  onComputedData,
}) => {
  const activeRowIndex = 0; 

  const totalAnnualWages = normalExpense.reduce(
    (sum, expense) => sum + Number(expense.amount * expense.quantity * 12 || 0),
    0
  );

  const formatAmountInIndianStyle = (amount) => amount.toLocaleString("en-IN");

  // ✅ Total Revenue Computation
  const totalRevenueReceipts = Array.from({
    length: parseInt(formData?.ProjectReportSetting?.ProjectionYears) || 0,
  }).map((_, yearIndex) => {
    return formData.Revenue?.formFields?.reduce(
      (product, item) => product * (item.years?.[yearIndex] || 1),
      1
    );
  });

  // ✅ Adjusted Revenue (Total Revenue + Closing Stock - Opening Stock)
  const adjustedRevenueValues = totalRevenueReceipts.map((totalRevenue, yearIndex) => {
    const closingStock = Number(formData?.MoreDetails?.closingStock?.[yearIndex]) || 0;
    const openingStock = Number(formData?.MoreDetails?.openingStock?.[yearIndex]) || 0;
    return totalRevenue + closingStock - openingStock;
  });

  // ✅ Direct Expenses Computation
  const totalDirectExpenses = Array.from({
    length: parseInt(formData?.ProjectReportSetting?.ProjectionYears) || 0,
  }).map((_, yearIndex) => {
    const salaryAndWages =
      yearIndex === 0
        ? Number(totalAnnualWages) || 0 
        : (Number(totalAnnualWages) || 0) * Math.pow(
            1 + formData?.ProjectReportSetting?.rateOfExpense / 100,
            yearIndex
          );

    const directExpensesTotal = directExpense?.filter(exp => exp.type === "direct")
      ?.reduce((sum, expense) => {
        const baseValue = Number(expense.value) || 0;
        return sum + baseValue * 12 * Math.pow(
          1 + formData?.ProjectReportSetting?.rateOfExpense / 100,
          yearIndex
        );
      }, 0);

    return salaryAndWages + directExpensesTotal;
  });

  // ✅ Indirect Expenses Computation
  const totalIndirectExpenses = Array.from({
    length: parseInt(formData?.ProjectReportSetting?.ProjectionYears) || 0,
  }).map((_, yearIndex) => {
    return directExpense?.filter(exp => exp.type === "indirect")
      ?.reduce((sum, expense) => {
        const baseValue = Number(expense.value) || 0;
        return sum + baseValue * 12 * Math.pow(
          1 + formData?.ProjectReportSetting?.rateOfExpense / 100,
          yearIndex
        );
      }, 0);
  });

  // ✅ Gross Profit Calculation
  const grossProfitValues = adjustedRevenueValues.map((adjustedRevenue, yearIndex) => {
    return adjustedRevenue - totalDirectExpenses[yearIndex];
  });

  // ✅ Net Profit Before Tax (NPBT)
  const netProfitBeforeTax = grossProfitValues.map((grossProfit, yearIndex) => {
    return grossProfit - totalIndirectExpenses[yearIndex];
  });

  // ✅ Income Tax Calculation
  const incomeTaxCalculation = netProfitBeforeTax.map((npbt) => {
    return (npbt * formData?.ProjectReportSetting?.incomeTax) / 100;
  });

  // ✅ Net Profit After Tax (NPAT)
  const netProfitAfterTax = netProfitBeforeTax.map((npbt, yearIndex) => {
    return npbt - incomeTaxCalculation[yearIndex];
  });

  // ✅ Ensure `onComputedData` updates only when required
  useEffect(() => {
    if (netProfitBeforeTax.length > 0) {
      onComputedData((prev) => ({
        ...prev,
        netProfitBeforeTax,
      }));
    }
  }, [JSON.stringify(netProfitBeforeTax)]); // ✅ Prevents unnecessary re-renders

 

  return (
    <Page size="A4">
      <View style={styleExpenses.paddingx}>
        <Text style={[styles.clientName]}>{localData?.clientName || "N/A"}</Text>
        <View style={[stylesCOP.heading, { fontWeight: "bold", paddingLeft: 10 }]}>
          <Text>Projected Profitability Statement</Text>
        </View>

        {/* Table Header */}
        <View style={[styles.table]}>
          <View style={styles.tableHeader}>
            <Text style={[styles.serialNoCell, styleExpenses.sno]}>S. No.</Text>
            <Text style={[styles.detailsCell, styleExpenses.particularWidth]}>Particulars</Text>
            {Array.from({ length: parseInt(formData?.ProjectReportSetting?.ProjectionYears) || 0 }).map((_, index) => (
              <Text key={index} style={styles.particularsCell}>
                Year {index + 1}
              </Text>
            ))}
          </View>
        </View>

        {/* ✅ Gross Profit Row */}
        <View style={[stylesMOF.row, styles.tableRow]}>
          <Text style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}>D</Text>
          <Text style={[stylesCOP.detailsCellDetail, styleExpenses.particularWidth]}>Gross Profit</Text>
          {grossProfitValues.map((grossProfit, yearIndex) => (
            <Text key={yearIndex} style={[stylesCOP.particularsCellsDetail, styleExpenses.fontSmall, { fontWeight: "bold" }]}>
              {formatAmountInIndianStyle(grossProfit.toFixed(2))}
            </Text>
          ))}
        </View>

        {/* ✅ Net Profit Before Tax */}
        <View style={[stylesMOF.row, styles.tableRow]}>
          <Text style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}>F</Text>
          <Text style={[stylesCOP.detailsCellDetail, styleExpenses.particularWidth]}>Net Profit Before Tax</Text>
          {netProfitBeforeTax.map((npbt, yearIndex) => (
            <Text key={yearIndex} style={[stylesCOP.particularsCellsDetail, styleExpenses.fontSmall, { fontWeight: "bold" }]}>
              {formatAmountInIndianStyle(npbt.toFixed(2))}
            </Text>
          ))}
        </View>

        {/* ✅ Income Tax */}
        <View style={[stylesMOF.row, styles.tableRow]}>
          <Text style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}>Less</Text>
          <Text style={[stylesCOP.detailsCellDetail, styleExpenses.particularWidth]}>Income Tax @ {formData?.ProjectReportSetting?.incomeTax} %</Text>
          {incomeTaxCalculation.map((tax, yearIndex) => (
            <Text key={yearIndex} style={[stylesCOP.particularsCellsDetail, styleExpenses.fontSmall]}>
              {formatAmountInIndianStyle(tax.toFixed(2))}
            </Text>
          ))}
        </View>
      </View>
    </Page>
  );
};

export default ProjectedProfitability;
