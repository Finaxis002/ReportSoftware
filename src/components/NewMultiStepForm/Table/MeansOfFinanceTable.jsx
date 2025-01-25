import React from "react";
import { useLocation } from "react-router-dom";
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  PDFViewer,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  pdfViewer: {
    border: "none",
    backgroundColor: "white",
  },
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    paddingHorizontal: 30,
    paddingVertical: 10,
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
    marginBottom: 15,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#8a8b91",
  },
  tableHeader: {
    backgroundColor: "#172554",
  },
  headerCell: {
    color: "#ffffff",
    padding: 3,
    fontSize: 10,
    borderLeft: "1px solid #8a8b91",
  },
  cell: {
    padding: 3,
    fontSize: 10,
    borderLeft: "1px solid #8a8b91",
  },
  categoryCell: {
    width: "20%",
  },
  valueCell: {
    width: "20%",
  },
  totalRow: {
    backgroundColor: "#fee2e2", // Light red background for total row
  },
  particularsCell: {
    width: "80%",
  },
});

const MeansOfFinanceTable = () => {
  const location = useLocation();
  const formData = location.state;

  if (!formData || !formData.MeansOfFinance) {
    return <div>No means of finance data available</div>;
  }

  return (
    // <div style={{
    //   width: '100%',
    //   height: '100vh',
    //   backgroundColor: 'white',
    //   overflow: 'hidden'
    // }}>
    //   <PDFViewer
    //     width="100%"
    //     height="100%"
    //     showToolbar={false}
    //     style={{
    //       ...styles.pdfViewer,
    //       overflow: 'hidden'
    //     }}
    //   >
    //     <Document>
    //       <Page size="A4" style={styles.page}>
    //         <Text style={styles.title}>Means of Finance</Text>

    //         {/* First Table */}
    //         <View style={styles.table}>

    //         <View style={[styles.tableRow, styles.tableHeader]}>
    //             <Text style={[styles.headerCell, styles.serialNoCell]}>S.No.</Text>
    //             <Text style={[styles.headerCell, styles.particularsCell]}>Particulars</Text>
    //             <Text style={[styles.headerCell, styles.valueCell]}>Amount</Text>

    //           </View>

    //           <View style={[styles.tableRow, styles.tableHeader]}>
    //             <Text style={[styles.headerCell, styles.categoryCell]}>Category</Text>
    //             <Text style={[styles.headerCell, styles.valueCell]}>Loan</Text>
    //             <Text style={[styles.headerCell, styles.valueCell]}>Loan (%)</Text>
    //             <Text style={[styles.headerCell, styles.valueCell]}>Promoter Contribution</Text>
    //             <Text style={[styles.headerCell, styles.valueCell]}>Promoter Contribution (%)</Text>
    //           </View>

    //           <View style={styles.tableRow}>
    //             <Text style={[styles.cell, styles.categoryCell]}>Term Loan</Text>
    //             <Text style={[styles.cell, styles.valueCell]}>{formData.MeansOfFinance.termLoan.termLoan}</Text>
    //             <Text style={[styles.cell, styles.valueCell]}>{formData.MeansOfFinance.TLTermLoanPercent}</Text>
    //             <Text style={[styles.cell, styles.valueCell]}>{formData.MeansOfFinance.termLoan.promoterContribution}</Text>
    //             <Text style={[styles.cell, styles.valueCell]}>{formData.MeansOfFinance.TLPromoterContributionPercent}</Text>
    //           </View>

    //           <View style={styles.tableRow}>
    //             <Text style={[styles.cell, styles.categoryCell]}>Working Capital</Text>
    //             <Text style={[styles.cell, styles.valueCell]}>{formData.MeansOfFinance.workingCapital.termLoan}</Text>
    //             <Text style={[styles.cell, styles.valueCell]}>{formData.MeansOfFinance.WCTermLoanPercent}</Text>
    //             <Text style={[styles.cell, styles.valueCell]}>{formData.MeansOfFinance.workingCapital.promoterContribution}</Text>
    //             <Text style={[styles.cell, styles.valueCell]}>{formData.MeansOfFinance.WCPromoterContributionPercent}</Text>
    //           </View>

    //           <View style={[styles.tableRow, styles.totalRow]}>
    //             <Text style={[styles.cell, styles.categoryCell]}>Total</Text>
    //             <Text style={[styles.cell, styles.valueCell]}>{formData.MeansOfFinance.totalTL}</Text>
    //             <Text style={[styles.cell, styles.valueCell]}>{formData.MeansOfFinance.TotalTermLoanPercent}</Text>
    //             <Text style={[styles.cell, styles.valueCell]}>{formData.MeansOfFinance.totalPC}</Text>
    //             <Text style={[styles.cell, styles.valueCell]}>{formData.MeansOfFinance.TotalPromoterContributionPercent}</Text>
    //           </View>
    //         </View>

    //         {/* Second Table */}
    //         <View style={styles.table}>
    //           <View style={[styles.tableRow, styles.tableHeader]}>
    //             <Text style={[styles.headerCell, { width: "50%" }]}>Category</Text>
    //             <Text style={[styles.headerCell, { width: "50%" }]}>Value</Text>
    //           </View>

    //           <View style={styles.tableRow}>
    //             <Text style={[styles.cell, { width: "50%" }]}>Total Term Loan</Text>
    //             <Text style={[styles.cell, { width: "50%" }]}>{formData.MeansOfFinance.totalTermLoan}</Text>
    //           </View>

    //           <View style={styles.tableRow}>
    //             <Text style={[styles.cell, { width: "50%" }]}>Total Working Capital</Text>
    //             <Text style={[styles.cell, { width: "50%" }]}>{formData.MeansOfFinance.totalWorkingCapital}</Text>
    //           </View>

    //           <View style={[styles.tableRow, styles.totalRow]}>
    //             <Text style={[styles.cell, { width: "50%" }]}>Total</Text>
    //             <Text style={[styles.cell, { width: "50%" }]}>{formData.MeansOfFinance.total}</Text>
    //           </View>
    //         </View>
    //       </Page>
    //     </Document>
    //   </PDFViewer>
    // </div>

    <div className="w-full h-screen bg-white overflow-hidden p-8">
      <h1 className="text-center text-white font-bold text-sm uppercase mb-4 p-1 bg-blue-950">
        Means of Finance
      </h1>

      {/* First Table */}
      <table className="w-full border border-gray-400 mb-6">
        <thead>
          <tr className="bg-blue-950 text-white">
            <th className="p-1 border  border-gray-400">S.No.</th>
            <th className="p-1 border  border-gray-400">Particulars</th>
            <th className="p-1 border  border-gray-400">Percentage</th>
            <th className="p-1 border  border-gray-400">Amount</th>
          </tr>
        </thead>
        <tbody className="mb-4">
          <tr className="bg-gray-200 mt-4">
            <td className="p-1 bg-blue-950 text-white">1</td>
            <td className="p-1 bg-blue-950 text-white" colSpan="3">
              <strong>Towards Setting-up of Business</strong>
            </td>
            
          </tr>
          <tr>
            <td className="p-1 border border-gray-400">a.</td>
            <td className="p-1 border border-gray-400">
              Promoter's Contribution
            </td>
            <td className="p-1 border border-gray-400">{`${formData.MeansOfFinance.TLPromoterContributionPercent}%`}</td>
            <td className="p-1 border border-gray-400">
              {formData.MeansOfFinance.termLoan.promoterContribution}
            </td>
          </tr>

          <tr>
            <td className="p-1 border border-gray-400">b.</td>
            <td className="p-1 border border-gray-400">Term Loan from Bank</td>
            <td className="p-1 border border-gray-400">{`${formData.MeansOfFinance.TLTermLoanPercent}%`}</td>
            <td className="p-1 border border-gray-400">
              {formData.MeansOfFinance.termLoan.termLoan}
            </td>
          </tr>

          <tr className=" font-bold">
            <td className="p-1 border border-gray-800"></td>
            <td className="p-1 border border-gray-800"></td>
            <td className="p-1 border border-gray-800">Total</td>

            <td className="p-1 border border-gray-800">
              {formData.MeansOfFinance.totalTermLoan}
            </td>
          </tr>

          <tr className="bg-gray-200">
            <td className="p-1 bg-blue-950 text-white">2</td>
            <td className="p-1 bg-blue-950 text-white" colSpan="3">
              <strong> Towards Working Capital</strong>
            </td>
           
          </tr>

          <tr>
            <td className="p-1 border border-gray-400">a.</td>
            <td className="p-1 border border-gray-400">
              Promoter's Contribution
            </td>
            <td className="p-1 border border-gray-400">{`${formData.MeansOfFinance.WCPromoterContributionPercent}%`}</td>

            <td className="p-1 border border-gray-400">
              {formData.MeansOfFinance.workingCapital.promoterContribution}
            </td>
          </tr>
          <tr>
            <td className="p-1 border border-gray-400">b.</td>
            <td className="p-1 border border-gray-400">Loan from Bank</td>
            <td className="p-1 border border-gray-400">{`${formData.MeansOfFinance.WCTermLoanPercent}%`}</td>
            <td className="p-1 border border-gray-400">
              {formData.MeansOfFinance.workingCapital.termLoan}
            </td>
          </tr>

          <tr className=" font-bold">
            <td className="p-2 border border-gray-800"></td>
            <td className="p-2 border border-gray-800"></td>
            <td className="p-2 border border-gray-800">Total</td>
            <td className="p-2 border border-gray-800">
              {formData.MeansOfFinance.totalWorkingCapital}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Second Table */}
      <table className="w-full border border-gray-400">
        <thead>
          <tr className="bg-blue-950 text-white">
          <th className="p-1 border border-gray-400 w-[13%]"></th>
            <th className="p-1 border border-gray-400" colSpan="3">TOTAL</th>
           
          </tr>
        </thead>
        <tbody>
          <tr>
          <td className="p-1 border border-gray-400" ></td>
            <td className="p-1 border border-gray-400">Total Promoter's Contribution</td>
            <td className="p-1 border border-gray-400">
              { `${formData.MeansOfFinance.TotalPromoterContributionPercent}%`}
            </td>
            <td className="p-1 border border-gray-400">
              {formData.MeansOfFinance.totalPC}
            </td>
          </tr>

          <tr>
          <td className="p-1 border border-gray-400"></td>
            <td className="p-1 border border-gray-400">Total Bank Loan</td>
            <td className="p-1 border border-gray-400">
           { `${formData.MeansOfFinance.TotalTermLoanPercent}%`}
            
            </td>
            <td className="p-1 border border-gray-400">
              {formData.MeansOfFinance.totalTL}
            </td>
          </tr>
          <tr className="font-bold">
          <td className="p-1 border border-gray-400"></td>
          <td className="p-1 border border-gray-400"></td>
            <td className="p-2 border border-gray-400">Total</td>
            <td className="p-2 border border-gray-400">{formData.MeansOfFinance.total}</td>
          </tr>
          
        </tbody>
      </table>
    </div>
  );
};

export default MeansOfFinanceTable;
