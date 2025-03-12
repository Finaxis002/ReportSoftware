import { StyleSheet } from "@react-pdf/renderer";

import { Font } from "@react-pdf/renderer";

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

const styles = StyleSheet.create({
  
  noBorder: {
    border: "0px",
  },
  FinancialYear: {
    fontSize: "11px",
    fontFamily: "Roboto",
    fontWeight: "extrabold",
    paddingVertical: "3px",
    paddingBottom: "20px",
  },

  Total: {
    fontFamily: "Roboto",
    fontWeight: "extrabold",
  },

  businessName: {
    fontSize: "16px",
    paddingTop: 20,
    textTransform: "capitalize",
    fontFamily: "Roboto",
    fontWeight: "extrabold",
  },
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    paddingHorizontal: 30,
    paddingVertical: 10,
  },
  clientName: {
    fontSize: "16px",
    padding: 20,
    textTransform: "capitalize",
  },

  title: {
    fontSize: 12,
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
    borderColor: "#000",
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
    width: "20%",
    padding: 3,
    fontSize: 10,
    textAlign:"center"
  },
  particularsCell: {
    width: "30%",
    padding: 3,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    fontSize: 10,
  },
  separatorCell: {
    width: "5%",
    padding: 3,

    fontSize: 10,
  },
  detailsCell: {
    width: "65%",
    padding: 3,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    fontSize: 10,
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
    borderLeft: "1px solid #8a8b91",
    fontSize: 10,
    color: "#fff",
  },
  serialNoCellDetail: {
    width: "20%",
    padding: 3,
    borderRight: "1px solid #8a8b91",
    borderBottom: "1px solid #8a8b91",
    fontSize: 10,
    textAlign:"center"
  },
  particularsCellsDetail: {
    width: "30%",
    padding: 3,
    borderBottom: "1px solid #8a8b91",
    fontSize: 10,
  },
  separatorCellDetail: {
    width: "5%",
    padding: 3,
    borderLeft: "1px solid #8a8b91",
    borderRight: "1px solid #8a8b91",
    borderBottom: "1px solid #8a8b91",
    fontSize: 10,
  },
  detailsCellDetail: {
    width: "65%",
    padding: 3,
    borderBottom: "1px solid #8a8b91",
    fontSize: 10,
  },
  partnerCellDetail: {
    width: "25%",
    padding: 2,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    fontSize: 10,
  },
  pdfViewer: {
    border: "none",
    backgroundColor: "white",
  },
  serialNumberCellStyle: {
    textAlign: "center",
    maxWidth: "80px", // ✅ Adjust width for proper alignment
    paddingVertical: "2px", // ✅ Ensures proper padding
    paddingHorizontal: "10px",
    margin: "1px 0", // ✅ Space between rows
    fontWeight: "bold", // ✅ Makes numbers more readable
    fontSize: "10px", // ✅ Optimized for PDF readability
    fontFamily: "Roboto",
  },
});

const stylesMOF = StyleSheet.create({
  page: {
    width: "100%",
    height: "100%",
    padding: 8,
    backgroundColor: "white",
  },
  sectionHeader: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 12,
    textTransform: "uppercase",
    padding: 4,
    backgroundColor: "#172554",
    color: "white",
  },
  table: {
    width: "100%",
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    borderBottom: "1px solid #9CA3AF",
  },
  cell: {
    flex: 1,
    padding: 4,
    borderRight: "1px solid #9CA3AF",
    fontSize: 10,
  },
  Snocell: {
    padding: 4,
    borderRight: "1px solid #9CA3AF",
    fontSize: 10,
    paddingHorizontal: 20,
    width: 50,
  },
  boldCell: {
    fontWeight: "bold",
  },
  headerRow: {
    backgroundColor: "#172554",
    color: "white",
    marginTop: 10,
  },
  grayRow: {
    backgroundColor: "#E5E7EB",
  },
  totalRow: {
    fontWeight: "bold",
  },
  total: {
    border: "1px solid #000",
  },
});

const stylesCOP = StyleSheet.create({
  styleCOP: {
    backgroundColor: "white",
    overflow: "hidden",
    padding: 20,
  },
  heading: {
    textAlign: "center",
    color: "white",
    fontWeight: "bold",
    fontSize: 10,
    textTransform: "uppercase",
    marginBottom: 20,
    padding: 4,
    backgroundColor: "#172554",
  },
  tableContainer: {
    marginBottom: 6,
  },
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  tableHeader: {
    backgroundColor: "#172554",
    color: "white",
  },
  tableHeaderGray: {
    backgroundColor: "#f2f2f2",
    color: "#000",
    display: "flex",
  },

  totalHeader: {
    color: "#000",
    textAlign: "left",
    flexDirection: "row",
    fontWeight: "bold",
  },
  tableCell: {
    padding: 4,
    borderWidth: 1,
    borderColor: "black",
  },
  totalCostRow: {
    fontWeight: "bold",
  },

  serialNoCellDetail: {
    width: "20%",
    padding: 3,
    borderRight: "1px solid #000",
    fontSize: 10,
    textAlign:"center"
  },
  particularsCellsDetail: {
    width: "30%",
    padding: 3,
    borderRight: "1px solid #000",
    fontSize: 10,
  },
  separatorCellDetail: {
    width: "5%",
    padding: 3,
    borderLeft: "1px solid #8a8b91",
    borderRight: "1px solid #8a8b91",
    borderBottom: "1px solid #8a8b91",
    fontSize: 10,
  },
  detailsCellDetail: {
    width: "65%",
    padding: 3,
    borderRight: "1px solid #000",
    fontSize: 10,
    paddingLeft: 10,
  },
  boldText: {
    border: "1.2px solid #000",
    borderLeft: "none",
    fontWeight: "extrabold",
    fontSize:"9px"
  },

  textCenter: {
    display: "flex",
    alignItems: "center",
    textAlign: "center",
    justifyContent: "center",
  },
  extraWidth: {
    width: "60%",
  },
  verticalPadding: {
    paddingVertical: 10,
  },
  extraWidthExpenses: {
    width: "100%",
  },
});

const styleExpenses = StyleSheet.create({
  headerRow: {
    backgroundColor: "#f2f2f2",
     color: "#000",
     marginTop: 10,
     fontFamily:"Roboto",
     fontWeight:"extrabold"
  },
  headingRow:{
    fontFamily:"Roboto",
    fontWeight:"extrabold"
  },

  particularWidth: {
    width: 600,
  },
  sno: {
    width: 100,
    fontSize: 10,
    paddingLeft: 10,
    paddingTop: 5,
    textAlign:"center",
    width:"20%"
  },
  bordernone: {
    borderBottom: "none",
  },
  fontSmall: {
    fontSize: 8,
  },
  paddingx: {
    paddingHorizontal: 6,
  },
  fontBold: {
    fontWeight: "extrabold",
  },
});

const columnWidths = {
  serialNo: { width: "20%", textAlign: "center" }, // ✅ Fixed width for Serial No.
  yearQuarter: { width: "120px", textAlign: "center" },
  openingBalance: { width: "120px", textAlign: "center" },
  principalRepayment: { width: "120px", textAlign: "center" },
  closingBalance: { width: "120px", textAlign: "center" },
  interestLiability: { width: "120px", textAlign: "center" },
  totalRepayment: { width: "120px", textAlign: "center" },
};

export { styles, stylesMOF, stylesCOP, styleExpenses, columnWidths };
