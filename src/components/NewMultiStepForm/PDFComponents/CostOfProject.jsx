import React from "react";
import { Page, View, Text, Image } from "@react-pdf/renderer";
import { styles, stylesCOP } from "./Styles"; // Import necessary styles
import SAWatermark from "../Assets/SAWatermark";
import CAWatermark from "../Assets/CAWatermark";

const CostOfProject = ({ formData, pdfType, formatNumber }) => {
  // ✅ Helper Function to Format Numbers Based on Selected Format

  // ✅ Compute Total Cost of Project including Working Capital
  const totalCost =
    (formData?.CostOfProject
      ? Object.values(formData.CostOfProject).reduce(
          (sum, field) => sum + (field?.amount || 0),
          0
        )
      : 0) + Number(formData?.MeansOfFinance?.totalWorkingCapital || 0); // ✅ Adding Working Capital

  return (
    <Page size="A4" style={stylesCOP.styleCOP}>
      {/* watermark  */}
      <View style={{ position: "absolute", left: 50, top: 0, zIndex: -1 }}>
        {/* ✅ Conditionally Render Watermark */}
        {pdfType &&
          pdfType !== "select option" &&
          (pdfType === "Sharda Associates" || pdfType === "CA Certified") && (
            <Image
              src={pdfType === "Sharda Associates" ? SAWatermark : CAWatermark}
              style={{
                width: "500px", // Adjust size based on PDF layout
                height: "700px",
                opacity: 0.4, // Light watermark to avoid blocking content
              }}
            />
          )}
      </View>
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
          {formData?.ProjectReportSetting?.AmountIn?.value === "rupees"
            ? "Rs" // ✅ Convert "rupees" to "Rs"
            : formData?.ProjectReportSetting?.AmountIn?.value}
          .)
        </Text>
      </View>
      <View style={stylesCOP.heading}>
        <Text>Cost Of Project</Text>
      </View>

      <View style={[styles.table, { paddingBottom: 0 }]}>
        <View style={styles.tableHeader}>
          <Text style={styles.serialNoCell}>S.No.</Text>
          <Text style={styles.detailsCell}>Particulars</Text>
          <Text style={styles.particularsCell}>Amount</Text>
        </View>

        {/* ✅ Show Cost of Project Items */}
        {formData?.CostOfProject &&
        Object.keys(formData.CostOfProject).length > 0 ? (
          // ✅ Filter out rows where amount = 0
          Object.entries(formData.CostOfProject)
            .filter(([_, field]) => field?.amount > 0) // ✅ Filter condition
            .map(([key, field], index) => (
              <View key={key} style={styles.tableRow}>
                {/* ✅ Serial No. based on filtered data */}
                <Text style={stylesCOP.serialNoCellDetail}>{index + 1}</Text>
                <Text style={stylesCOP.detailsCellDetail}>
                  {field?.name || "N/A"}
                </Text>
                <Text
                  style={[
                    stylesCOP.particularsCellsDetail,
                    { textAlign: "right" },
                  ]}
                >
                  {formatNumber(field?.amount || 0)}
                </Text>
              </View>
            ))
        ) : (
          <View style={styles.tableRow}>
            <Text
              style={[
                stylesCOP.detailsCellDetail,
                { textAlign: "center", width: "100%" },
              ]}
            >
              No cost data available
            </Text>
          </View>
        )}

        {/* ✅ Show Working Capital Row */}
        {formData?.MeansOfFinance?.totalWorkingCapital && (
          <View style={styles.tableRow}>
            <Text style={stylesCOP.serialNoCellDetail}>
              {Object.keys(formData.CostOfProject).length - 1 + 1}
            </Text>
            <Text
              style={[stylesCOP.detailsCellDetail, { paddingBottom: "10px" }]}
            >
              Working Capital Required
            </Text>
            <Text
              style={[
                stylesCOP.particularsCellsDetail,
                { paddingBottom: "10px" },
                { textAlign: "right" },
              ]}
            >
              {formatNumber(formData.MeansOfFinance.totalWorkingCapital)}
            </Text>
          </View>
        )}

        {/* ✅ Total Cost Row (Including Working Capital) */}
        <View style={stylesCOP.totalHeader}>
          <Text style={stylesCOP.serialNoCellDetail}></Text>
          <View
            style={[
              stylesCOP.detailsCellDetail,
              stylesCOP.boldText,
              styles.Total,
              {
                borderWidth: 0,
                display: "flex",
                alignContent: "flex-end",
                alignItems: "flex-end",
                fontSize: "10px",
                padding: 0,
              },
            ]}
          >
            <Text
              style={[
                stylesCOP.particularsCellsDetail,
                stylesCOP.boldText,
                styles.Total,
                {
                  width: "30%",
                  border: "1px solid #000",
                  borderBottomWidth: 0,
                  textAlign: "left",
                  borderLeftWidth:1
                },
              ]}
            >
              {" "}
              Total{" "}
            </Text>
          </View>
          <Text
            style={[
              stylesCOP.particularsCellsDetail,
              stylesCOP.boldText,
              styles.Total,
              {
                borderTop: "1px solid #000",
                borderBottomWidth: 0,
                borderLeftWidth: 1,
                fontFamily: "Roboto",
                fontWeight: "bold",
                textAlign: "right",
              },
            ]}
          >
            {formatNumber(totalCost)}
          </Text>
        </View>
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
            marginTop: "30px",
          },
        ]}
      >
        <Text style={[styles.businessName, { fontSize: "10px" }]}>
          {formData?.AccountInformation?.businessName || "Business Name"}
        </Text>
        <Text style={[styles.FinancialYear, { fontSize: "10px" }]}>
          {formData?.AccountInformation?.clientName || "Client Name"}
        </Text>
      </View>
    </Page>
  );
};

export default CostOfProject;

// import React from "react";
// import { Page, View, Text } from "@react-pdf/renderer";
// import { styles, stylesCOP, styleExpenses, stylesMOF } from "./Styles"; // Import only necessary styles

// const CostOfProject = ({ formData, localData }) => {

//   // ✅ Safe Helper Function to Format Numbers Based on Selected Format
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

//   // ✅ Compute Total Cost of Project Safely
//   const totalCost = formData?.CostOfProject
//     ? Object.values(formData.CostOfProject).reduce(
//         (sum, field) => sum + (field?.amount || 0), // ✅ Ensures missing values default to 0
//         0
//       )
//     : 0; // ✅ Default to 0 if CostOfProject is missing

//   return (
//     <Page size="A4" style={stylesCOP.styleCOP}>
//       <Text style={styles.clientName}>{localData?.clientName || "Client Name"}</Text>
//       <View style={stylesCOP.heading}>
//         <Text>Cost Of Project</Text>
//       </View>

//       <View style={styles.table}>
//         <View style={styles.tableHeader}>
//           <Text style={styles.serialNoCell}>S.No.</Text>
//           <Text style={styles.detailsCell}>Particulars</Text>
//           <Text style={styles.particularsCell}>Amount</Text>
//         </View>

//         {/* ✅ Handle Empty CostOfProject Data Gracefully */}
//         {formData?.CostOfProject && Object.keys(formData.CostOfProject).length > 0 ? (
//           Object.entries(formData.CostOfProject).map(([key, field], index) => (
//             <View key={key} style={styles.tableRow}>
//               <Text style={stylesCOP.serialNoCellDetail}>{index + 1}</Text>
//               <Text style={stylesCOP.detailsCellDetail}>{field?.name || "N/A"}</Text>
//               <Text style={stylesCOP.particularsCellsDetail}>
//                 {formatNumber(field?.amount || 0)}
//               </Text>
//             </View>
//           ))
//         ) : (
//           <View style={styles.tableRow}>
//             <Text style={[stylesCOP.detailsCellDetail, { textAlign: "center", width: "100%" }]}>
//               No cost data available
//             </Text>
//           </View>
//         )}

//         {/* ✅ Total Cost Row */}
//         <View style={stylesCOP.totalHeader}>
//           <Text style={stylesCOP.serialNoCellDetail}></Text>
//           <Text style={[stylesCOP.detailsCellDetail, stylesCOP.boldText]}>
//             Total Cost of Project
//           </Text>
//           <Text style={[stylesCOP.particularsCellsDetail, stylesCOP.boldText]}>
//             {formatNumber(totalCost)}
//           </Text>
//         </View>
//       </View>
//     </Page>
//   );
// };

// export default CostOfProject;
