import React from "react";
import { useLocation } from "react-router-dom"; // Import useLocation
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  PDFViewer,
} from "@react-pdf/renderer";

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    paddingHorizontal: 30,
    paddingVertical:10
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
    fontSize: 10
  },
  particularsCell: {
    width: "30%",
    padding: 3,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    fontSize:10
  },
  separatorCell: {
    width: "5%",
    padding: 3,
   
    fontSize:10
  },
  detailsCell: {
    width: "65%",
    padding: 3,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    fontSize:10
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
   borderLeft:'1px solid #8a8b91',
    fontSize:10,
    color: '#fff'
  },
  serialNoCellDetail:{
    width: "10%",
    padding: 3,
    borderRight:'1px solid #8a8b91',
    borderBottom: '1px solid #8a8b91',
    fontSize: 10
  },
  particularsCellsDetail:{
    width: "30%",
    padding: 3,
    borderBottom:'1px solid #8a8b91',
    fontSize: 10
  },
  separatorCellDetail:{
    width: "5%",
    padding: 3,
    borderLeft:'1px solid #8a8b91',
    borderRight:'1px solid #8a8b91',
    borderBottom: '1px solid #8a8b91',
    fontSize: 10
  },
  detailsCellDetail:{
    width: "65%",
    padding: 3,
    borderBottom:'1px solid #8a8b91',
    fontSize: 10
  },
  partnerCellDetail:{
    width: "25%",
    padding: 2,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    fontSize:10
  },
  pdfViewer: {
    border: 'none',
    backgroundColor: 'white'
  },

});

const BasicDetailsTable = () => {
  const location = useLocation();
  const formData = location.state;

  // Debug: Log data to check if AccountInformation is present
  // console.log("accountInfo in BasicDetailsView:");

  // Ensure formData is valid
  if (!formData || !formData.AccountInformation) {
    return <div>No account information available</div>; // Fallback UI
  }

  return (
    // <>
    //  <PDFViewer 
    //     width="100%" 
    //     height="800" 
    //     showToolbar={false} 
    //     style={{
    //       ...styles.pdfViewer,
    //       overflow: 'hidden', // Disable scrolling in PDFViewer,
          
    //     }}
    //   >
    //     <Document>
    //       <Page size="A4" style={styles.page}>
    //         <View>
    //           <Text style={styles.title}>Project Synopsis</Text>
              
    //           <View style={styles.table}>
    //             <View style={styles.tableHeader}>
    //               <Text style={styles.serialNoCell}>S. No.</Text>
    //               <Text style={styles.particularsCell}>Particulars</Text>
    //               <Text style={styles.separatorCell}>:</Text>
    //               <Text style={styles.detailsCell}>Details</Text>
    //             </View>
                
    //             {Object.entries(formData.AccountInformation).map(([key, value], index) =>
    //               key !== "allPartners" ? (
    //                 <View style={styles.tableRow} key={index}>
    //                   <Text style={styles.serialNoCellDetail}>{index + 1}</Text>
    //                   <Text style={styles.particularsCellsDetail}>{key}</Text>
    //                   <Text style={styles.separatorCellDetail}>:</Text>
    //                   <Text style={styles.detailsCellDetail}>
    //                     {typeof value === "object" ? JSON.stringify(value) : String(value)}
    //                   </Text>
    //                 </View>
    //               ) : null
    //             )}
    //           </View>

    //           {formData.AccountInformation.allPartners && (
    //             <View style={styles.partnersSection}>
    //               <Text style={styles.partnersTitle}>Partners Details</Text>
    //               <View style={styles.table}>
    //                 <View style={styles.tableHeader}>
    //                   <Text style={styles.partnerCell}>S. No.</Text>
    //                   <Text style={styles.partnerCell}>Partner Name</Text>
    //                   <Text style={styles.partnerCell}>Partner Aadhar</Text>
    //                   <Text style={styles.partnerCell}>Partner DIN</Text>
    //                 </View>
                    
    //                 {formData.AccountInformation.allPartners.map((partner, idx) => (
    //                   <View style={styles.tableRow} key={idx}>
    //                     <Text style={styles.partnerCellDetail}>{idx + 1}</Text>
    //                     <Text style={styles.partnerCellDetail}>{partner.partnerName}</Text>
    //                     <Text style={styles.partnerCellDetail}>{partner.partnerAadhar}</Text>
    //                     <Text style={styles.partnerCellDetail}>{partner.partnerDin}</Text>
    //                   </View>
    //                 ))}
    //               </View>
    //             </View>
    //           )}
    //         </View>
    //       </Page>
    //     </Document>
    //   </PDFViewer>
    // </>

    <div className="container container-width mt-4 bg-light px-4">
      <h2 class="py-4 text-center text-4xl font-bold uppercase text-gray-800">
        PROJECT SYNOPSIS
      </h2>
      <div className="table-responsive">
        {/* Main Table */}
        <table className="table-auto w-full border border-black">
          <thead>
            <tr className="bg-blue-950 text-white text-left">
              <th className="px-1 py-1 border border-black">S. No.</th>
              <th className="px-4 py-1 border border-black">Particulars</th>
              <th className="px-2 py-1 border border-black">:</th>
              <th className="px-4 py-1 border border-black">Details</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(formData.AccountInformation).map(
              ([key, value], index) =>
                key !== "allPartners" ? ( // Exclude "allPartners" from the main table
                  <tr key={index}>
                    {/* Serial Number */}
                    <td className="px-1 py-1 border border-black">
                      {index + 1}
                    </td>
                    {/* Particulars */}
                    <td className="px-4 py-1 border border-black">{key}</td>
                    {/* Separator */}
                    <td className="px-2 py-1 border border-black">:</td>
                    {/* Details */}
                    <td className="px-4 py-1 border border-black">
                      {typeof value === "object"
                        ? JSON.stringify(value)
                        : value}
                    </td>
                  </tr>
                ) : null
            )}
          </tbody>
        </table>

        {/* Partners Table */}
        {formData.AccountInformation.allPartners && (
          <div className="mt-4">
            <h3 className="text-lg font-bold mb-2">Partners Details</h3>
            <table className="table-auto w-full border border-black">
              <thead>
                <tr className="bg-blue-950 text-white text-left">
                  <th className="px-4 py-1 border border-black">S. No.</th>
                  <th className="px-4 py-1 border border-black">
                    Partner Name
                  </th>
                  <th className="px-4 py-1 border border-black">
                    Partner Aadhar
                  </th>
                  <th className="px-4 py-1 border border-black">Partner DIN</th>
                </tr>
              </thead>
              <tbody>
                {formData.AccountInformation.allPartners.map((partner, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-1 border border-black">{idx + 1}</td>
                    <td className="px-4 py-1 border border-black">
                      {partner.partnerName}
                    </td>
                    <td className="px-4 py-1 border border-black">
                      {partner.partnerAadhar}
                    </td>
                    <td className="px-4 py-1 border border-black">
                      {partner.partnerDin}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BasicDetailsTable;
