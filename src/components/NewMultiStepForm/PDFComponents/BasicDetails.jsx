import React from "react";
import { Page, View, Text, Image } from "@react-pdf/renderer";
import { styles, stylesCOP, stylesMOF, styleExpenses } from "./Styles";
import SAWatermark from "../Assets/SAWatermark";
import CAWatermark from "../Assets/CAWatermark";

const BasicDetails = ({ formData, pdfType }) => {
  return (
    <Page
      size="A4"
      style={[styles.page, { padding: "30px", position: "relative" }]}
    >
      {/* ✅ Watermark Image (Properly Positioned) */}
      <View style={{ position: "absolute", left: 70, top: 0, zIndex: -1 }}>

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

      {/* ✅ Table Content */}
      <View style={{ opacity: 1 }}>
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
              if (key === "allPartners" || key === "_id" || key === "__v") {
                return null;
              }
              return (
                <View style={styles.tableRow} key={index}>
                  <Text style={styles.serialNoCellDetail}>{index + 1}</Text>
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

        {/* ✅ Partner Details */}
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

              {formData.AccountInformation.allPartners.map((partner, idx) => (
                <View style={styles.tableRow} key={idx}>
                  <Text style={styles.partnerCellDetail}>{idx + 1}</Text>
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
              ))}
            </View>
          </View>
        )}
      </View>
    </Page>
  );
};

export default BasicDetails;

// import React from "react";
// import { Page, View, Text, Image } from "@react-pdf/renderer"; // Ensure Image is imported
// import { styles, stylesCOP, stylesMOF, styleExpenses } from "./Styles";
//  import SAWatermark from "../Assets/SAWatermark"
// // import watermarkImage from "../Assets/watermark.png";

// const BasicDetails = ({ formData, selectedOption }) => {
//   // console.log("Selected Option" , selectedOption)
//   return (
//     <Page size="A4" style={[styles.page, { padding: "30px"  }]}>
//       {/* Watermark Image */}

//         <View style={{ absolutePosition: { x: 240, y: 1500 } }}>
//           <Image
//             src={SAWatermark}
//             style={{
//               width: "600px",
//               height: "800px",
//               opacity: 0.2, // Light watermark
//             }}
//             fixed
//           />
//         </View>

//       {/* table  */}
//       <View
//         style={{ opacity: 1}}
//       >
//         <Text style={styles.title}>Project Synopsis</Text>

//         <View style={styles.table}>
//           <View style={styles.tableHeader}>
//             <Text style={styles.serialNoCell}>S. No.</Text>
//             <Text style={styles.particularsCell}>Particulars</Text>
//             <Text style={styles.separatorCell}>:</Text>
//             <Text style={styles.detailsCell}>Details</Text>
//           </View>

//           {Object.entries(formData.AccountInformation).map(
//             ([key, value], index) => {
//               if (key === "allPartners" || key === "_id" || key === "__v") {
//                 return null;
//               }
//               return (
//                 <View style={styles.tableRow} key={index}>
//                   <Text style={styles.serialNoCellDetail}>{index + 1}</Text>
//                   <Text style={styles.particularsCellsDetail}>{key}</Text>
//                   <Text style={styles.separatorCellDetail}>:</Text>
//                   <Text style={styles.detailsCellDetail}>
//                     {typeof value === "object"
//                       ? JSON.stringify(value)
//                       : String(value)}
//                   </Text>
//                 </View>
//               );
//             }
//           )}
//         </View>

//         {formData.AccountInformation.allPartners && (
//           <View style={styles.partnersSection}>
//             <Text style={styles.partnersTitle}>Partners Details</Text>
//             <View style={styles.table}>
//               <View style={styles.tableHeader}>
//                 <Text style={styles.partnerCell}>S. No.</Text>
//                 <Text style={styles.partnerCell}>Partner Name</Text>
//                 <Text style={styles.partnerCell}>Partner Aadhar</Text>
//                 <Text style={styles.partnerCell}>Partner DIN</Text>
//               </View>

//               {formData.AccountInformation.allPartners.map((partner, idx) => (
//                 <View style={styles.tableRow} key={idx}>
//                   <Text style={styles.partnerCellDetail}>{idx + 1}</Text>
//                   <Text style={styles.partnerCellDetail}>
//                     {partner.partnerName}
//                   </Text>
//                   <Text style={styles.partnerCellDetail}>
//                     {partner.partnerAadhar}
//                   </Text>
//                   <Text style={styles.partnerCellDetail}>
//                     {partner.partnerDin}
//                   </Text>
//                 </View>
//               ))}
//             </View>
//           </View>
//         )}
//       </View>
//     </Page>
//   );
// };

// export default BasicDetails;
