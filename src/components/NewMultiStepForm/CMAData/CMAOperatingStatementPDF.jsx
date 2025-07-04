// // CMAOperatingStatementPDF.jsx

// import React from "react";
// import { Page, View, Text } from "@react-pdf/renderer";
// import { getCMASchema } from "../Utils/CMA/cmaSchema";
// import { makeCMAExtractors } from "../Utils/CMA/cmaExtractors";

// // Example number formatter
// const format = (n) => (n == null ? "" : n.toLocaleString("en-IN"));

// const CMAOperatingStatementPDF = ({ formData }) => {
//   const years = Number(formData?.ProjectReportSetting?.ProjectionYears || 5);
//   const yearLabels = Array.from({ length: years }, (_, i) =>
//     (Number(formData?.ProjectReportSetting?.StartYear) || 2024) + i
//   );

//   // Build schema and extractors for this report
//   const schema = getCMASchema(formData);
//   const extractors = makeCMAExtractors(formData);

//   return (
//     <Page size="A4" style={{ padding: 20 }}>
//       <View>
//         <Text style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>
//           Operating Statement (CMA)
//         </Text>
//         <View style={{ flexDirection: "row", borderBottom: 1, fontWeight: 600 }}>
//           <Text style={{ width: 200 }}>Particulars</Text>
//           {yearLabels.map((label, idx) => (
//             <Text key={idx} style={{ width: 80, textAlign: "right" }}>
//               {label}
//             </Text>
//           ))}
//         </View>
//         {/* Render each row */}
//         {schema.map((row, idx) => {
//           if (row.group) {
//             return (
//               <View key={row.label} style={{ backgroundColor: "#f0f0f0", fontWeight: 700 }}>
//                 <Text>{row.label}</Text>
//               </View>
//             );
//           }
//           const extractor = extractors[row.extractorKey];
//           const values = extractor ? extractor(formData) : [];
//           return (
//             <View key={row.label} style={{ flexDirection: "row", borderBottom: 0.5 }}>
//               <Text style={{
//                 width: 200,
//                 fontWeight: row.bold ? 700 : 400
//               }}>
//                 {row.label}
//               </Text>
//               {yearLabels.map((_, y) => (
//                 <Text
//                   key={y}
//                   style={{
//                     width: 80,
//                     textAlign: "right",
//                     fontWeight: row.bold ? 700 : 400
//                   }}
//                 >
//                   {format(values?.[y])}
//                 </Text>
//               ))}
//             </View>
//           );
//         })}
//       </View>
//     </Page>
//   );
// };

// export default CMAOperatingStatementPDF;














import React from "react";
import { Document, Page, View, Text, StyleSheet, Font } from "@react-pdf/renderer";
import { getCMASchema } from "../Utils/CMA/cmaSchema";
 import { makeCMAExtractors } from "../Utils/CMA/cmaExtractors";

// Font registration (optional)
Font.register({
  family: "Roboto",
  src: "https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Me5Q.ttf",
});

const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 10, fontFamily: "Roboto" },
  title: { fontSize: 14, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  subTitle: { fontSize: 11, fontWeight: 600, marginBottom: 8, textAlign: "center" },
  table: { width: "100%", border: "1 solid #234", marginTop: 6, marginBottom: 12 },
  row: { flexDirection: "row", alignItems: "stretch", borderBottom: "1 solid #bbb" },
  header: {
    backgroundColor: "#1c3766", color: "#fff", fontWeight: "bold", borderBottom: "2 solid #333"
  },
  group: { backgroundColor: "#e4eaff", fontWeight: "bold" },
  subtotal: { fontWeight: "bold", backgroundColor: "#f4f6fa" },
  total: { fontWeight: "bold", backgroundColor: "#dde4f2" },
  cellPart: { width: 170, padding: 4, borderRight: "1 solid #bbb" },
  cell: { width: 66, padding: 4, textAlign: "right", borderRight: "1 solid #bbb" },
  cellLast: { width: 66, padding: 4, textAlign: "right" },
  bold: { fontWeight: "bold" },
});

const format = (n) => (n == null ? "" : Number(n).toLocaleString("en-IN"));

// Main component
const CMAOperatingStatementPDF = ({ formData }) => {
  // You can import these:
 
  const years = Number(formData?.ProjectReportSetting?.ProjectionYears || 5);
  const yearLabels = Array.from({ length: years }, (_, i) =>
    (Number(formData?.ProjectReportSetting?.StartYear) || 2024) + i
  );
  const schema = getCMASchema(formData);
  const extractors = makeCMAExtractors(formData);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>
          M/S {formData?.AccountInformation?.businessName?.toUpperCase() || "________"}
        </Text>
        <Text style={styles.subTitle}>
          Financial Year {formData?.ProjectReportSetting?.StartYear || "______"}
        </Text>
        <Text style={{ textAlign: "center", fontWeight: "bold", marginBottom: 6, marginTop: 6 }}>
          Operating Statement
        </Text>
        {/* Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={[styles.row, styles.header]}>
            <Text style={styles.cellPart}>Particulars</Text>
            {yearLabels.map((label, idx) => (
              <Text key={idx} style={idx === yearLabels.length - 1 ? styles.cellLast : styles.cell}>
                {label}
              </Text>
            ))}
          </View>
          {/* Table Body */}
          {schema.map((row, idx) => {
            if (row.group) {
              return (
                <View key={row.label} style={[styles.row, styles.group]}>
                  <Text style={[styles.cellPart, styles.bold]}>{row.label}</Text>
                  {yearLabels.map((_, i) => (
                    <Text key={i} style={i === yearLabels.length - 1 ? styles.cellLast : styles.cell}></Text>
                  ))}
                </View>
              );
            }
            const extractor = extractors[row.extractorKey];
            const values = extractor ? extractor(formData) : [];
            const isSubtotal = row.bold && !row.total;
            const isTotal = row.total;
            return (
              <View key={row.label} style={[
                styles.row,
                isSubtotal && styles.subtotal,
                isTotal && styles.total,
              ]}>
                <Text style={[styles.cellPart, row.bold && styles.bold]}>
                  {row.label}
                </Text>
                {yearLabels.map((_, y) => (
                  <Text
                    key={y}
                    style={[
                      y === yearLabels.length - 1 ? styles.cellLast : styles.cell,
                      row.bold && styles.bold,
                    ]}
                  >
                    {format(values?.[y])}
                  </Text>
                ))}
              </View>
            );
          })}
        </View>
      </Page>
    </Document>
  );
};

export default CMAOperatingStatementPDF;
