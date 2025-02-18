import React, { useEffect } from "react";
import { Page, View, Text } from "@react-pdf/renderer";
import { styles, stylesCOP, stylesMOF, styleExpenses } from "./Styles"; // Import styles

const ProjectedRevenue = ({ formData , setTotalRevenueReceipts}) => {
  // ✅ Function to format numbers based on the selected format type
  const formatNumber = (value) => {
    const formatType = formData?.ProjectReportSetting?.Format || "1"; // Default to Indian Format
    if (value === undefined || value === null || isNaN(value)) return "0"; // ✅ Handle invalid values

    switch (formatType) {
      case "1": return new Intl.NumberFormat("en-IN").format(value); // Indian Format
      case "2": return new Intl.NumberFormat("en-US").format(value); // USD Format
      case "3": return new Intl.NumberFormat("en-IN").format(value); // Generic Format
      default: return new Intl.NumberFormat("en-IN").format(value); // ✅ Safe default
    }
  };

  // ✅ Extract projection years and formType safely
  const projectionYears = parseInt(formData?.ProjectReportSetting?.ProjectionYears) || 0;
  const formType = formData?.Revenue?.formType || "Others"; // Default to "Others" if missing

  // ✅ Determine which dataset to use based on `formType`
  const selectedData = formData?.Revenue?.[formType === "Others" ? "formFields" : "formFields2"] || [];

  // ✅ Get total values: If "Others", use `totalRevenueForOthers`; else compute sum
  const totalRevenueReceipts = formType === "Others"
    ? formData?.Revenue?.totalRevenueForOthers || []
    : Array.from({ length: projectionYears }).map((_, yearIndex) => 
        selectedData.reduce((sum, item) => sum + (Number(item.years?.[yearIndex]) || 0), 0)
      );

  // ✅ Send the total revenue values to parent component
  useEffect(() => {
    setTotalRevenueReceipts(totalRevenueReceipts); // Send data up
  }, [totalRevenueReceipts, setTotalRevenueReceipts]);

  return (
    <Page
      size={projectionYears > 12 ? "A3" : "A4"}
      orientation={projectionYears > 7 ? "landscape" : "portrait"}
    >
      <View style={styleExpenses.paddingx}>
        {/* Client Name & Heading */}
        <View>
          <Text style={styles.clientName}>{formData?.AccountInformation?.clientName}</Text>
          <View style={stylesCOP.heading}>
            <Text>Projected Revenue/ Sales</Text>
          </View>
        </View>
      </View>

      {/* ✅ Table Rendering Based on `formType` */}
      <View style={styleExpenses.paddingx}>
        <View style={[styles.table]}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.serialNoCell, styleExpenses.sno]}>S. No.</Text>
            <Text style={[styles.detailsCell, styleExpenses.particularWidth]}>Particulars</Text>

            {/* Dynamically Generate Year Columns */}
            {Array.from({ length: projectionYears }).map((_, yearIndex) => (
              <Text key={yearIndex} style={styles.particularsCell}>
                Year {yearIndex + 1}
              </Text>
            ))}
          </View>
        </View>

        {/* ✅ Table Body - Display Data */}
        {selectedData.map((item, index) => {
          let updatedYears = [...(item.years || [])].slice(0, projectionYears);
          while (updatedYears.length < projectionYears) {
            updatedYears.push(0); // ✅ Fill missing values with 0
          }

          return (
            <View key={index} style={[stylesMOF.row, styleExpenses.tableRow]}>
              <Text style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}>{index + 1}</Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                ]}
              >
                {item.particular}
              </Text>

              {updatedYears.map((yearValue, yearIndex) => (
                <Text
                  key={yearIndex}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                  ]}
                >
                  {formatNumber(yearValue)}
                </Text>
              ))}
            </View>
          );
        })}

        {/* ✅ Compute & Display Total */}
        <View style={[stylesMOF.row, styleExpenses.totalRow]}>
          <Text style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}></Text>

          <Text
            style={[
              stylesCOP.detailsCellDetail,
              styleExpenses.particularWidth,
              styleExpenses.bordernone,
              { fontWeight: "bold", paddingLeft: 10 },
            ]}
          >
            Total
          </Text>

          {totalRevenueReceipts.map((totalYearValue, yearIndex) => (
            <Text
              key={yearIndex}
              style={[
                stylesCOP.particularsCellsDetail,
                styleExpenses.fontSmall,
                { fontWeight: "extrabold" },
              ]}
            >
              {formatNumber(totalYearValue)}
            </Text>
          ))}
        </View>
      </View>
    </Page>
  );
};

export default ProjectedRevenue;




// import React from "react";
// import { Page, View, Text } from "@react-pdf/renderer";
// import { styles, stylesCOP, stylesMOF, styleExpenses } from "./Styles"; // Import styles

// const ProjectedRevenue = ({ formData }) => {
//   // ✅ Function to format numbers based on the selected format type
//   const formatNumber = (value) => {
//     const formatType = formData?.ProjectReportSetting?.Format || "1"; // Default to Indian Format

//     if (value === undefined || value === null || isNaN(value)) return "0"; // ✅ Handle invalid values

//     switch (formatType) {
//       case "1": // Indian Format (1,23,456)
//         return new Intl.NumberFormat("en-IN").format(value);

//       case "2": // USD Format (1,123,456)
//         return new Intl.NumberFormat("en-US").format(value);

//       case "3": // Generic Format (1,23,456)
//         return new Intl.NumberFormat("en-IN").format(value);

//       default:
//         return new Intl.NumberFormat("en-IN").format(value); // ✅ Safe default
//     }
//   };

//   const projectionYears = parseInt(formData?.ProjectReportSetting?.ProjectionYears) || 0;
//   const formType = formData?.Revenue?.formType || "Others"; // ✅ Default to "Others" if missing

//   return (
//     <Page
//       size={projectionYears > 12 ? "A3" : "A4"}
//       orientation={projectionYears > 7 ? "landscape" : "portrait"}
//     >
//       <View style={styleExpenses.paddingx}>
//         {/* Client Name & Heading */}
//         <View>
//           <Text style={styles.clientName}>{formData?.AccountInformation?.clientName}</Text>
//           <View style={stylesCOP.heading}>
//             <Text>Projected Revenue/ Sales</Text>
//           </View>
//         </View>
//       </View>

//       {/* ✅ Conditional Rendering of Tables Based on formType */}
//       <View style={styleExpenses.paddingx}>
//         <View style={[styles.table]}>
//           {/* Table Header */}
//           <View style={styles.tableHeader}>
//             <Text style={[styles.serialNoCell, styleExpenses.sno]}>S. No.</Text>
//             <Text style={[styles.detailsCell, styleExpenses.particularWidth]}>Particulars</Text>

//             {/* Dynamically Generate Year Columns */}
//             {Array.from({ length: projectionYears }).map((_, yearIndex) => (
//               <Text key={yearIndex} style={styles.particularsCell}>
//                 Year {yearIndex + 1}
//               </Text>
//             ))}
//           </View>
//         </View>

//         {/* ✅ Table Body - Looping through Revenue Data */}
//         {Array.isArray(formData?.Revenue?.[formType === "Others" ? "formFields" : "formFields2"]) &&
//           formData.Revenue[formType === "Others" ? "formFields" : "formFields2"].map((item, index) => {
//             let updatedYears = [...(item.years || [])].slice(0, projectionYears);

//             while (updatedYears.length < projectionYears) {
//               updatedYears.push(0); // ✅ Fill missing values with 0
//             }

//             return (
//               <View key={index} style={[stylesMOF.row, styleExpenses.tableRow]}>
//                 <Text style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}>{index + 1}</Text>

//                 <Text
//                   style={[
//                     stylesCOP.detailsCellDetail,
//                     styleExpenses.particularWidth,
//                     styleExpenses.bordernone,
//                   ]}
//                 >
//                   {item.particular}
//                 </Text>

//                 {updatedYears.map((yearValue, yearIndex) => (
//                   <Text
//                     key={yearIndex}
//                     style={[
//                       stylesCOP.particularsCellsDetail,
//                       styleExpenses.fontSmall,
//                     ]}
//                   >
//                     {formatNumber(yearValue)}
//                   </Text>
//                 ))}
//               </View>
//             );
//           })}

//         {/* ✅ Compute & Display Total */}
//         <View style={[stylesMOF.row, styleExpenses.totalRow]}>
//           <Text style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}></Text>

//           <Text
//             style={[
//               stylesCOP.detailsCellDetail,
//               styleExpenses.particularWidth,
//               styleExpenses.bordernone,
//               { fontWeight: "bold", paddingLeft: 10 },
//             ]}
//           >
//             Total
//           </Text>

//           {Array.from({ length: projectionYears }).map((_, yearIndex) => {
//             const totalYearValue = formData.Revenue[formType === "Others" ? "formFields" : "formFields2"]
//               .reduce((sum, item) => sum + (item.years?.[yearIndex] || 0), 0); // ✅ Sum instead of multiplication

//             return (
//               <Text
//                 key={yearIndex}
//                 style={[
//                   stylesCOP.particularsCellsDetail,
//                   styleExpenses.fontSmall,
//                   { fontWeight: "extrabold" },
//                 ]}
//               >
//                 {formatNumber(totalYearValue)}
//               </Text>
//             );
//           })}
//         </View>
//       </View>
//     </Page>
//   );
// };

// export default ProjectedRevenue;
