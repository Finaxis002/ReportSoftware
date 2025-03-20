import { StyleSheet } from "@react-pdf/renderer";

import { Font } from "@react-pdf/renderer";




// ✅ Register a Font That Supports Bold
Font.register({
  family: "Roboto",
  fonts: [
    {
      src: require("../Assets/Fonts/times-new-roman.ttf"),
      fontWeight: "normal",
    },
    {
      src: require("../Assets/Fonts/times-new-roman-bold.ttf"),
      fontWeight: "bold",
    },
  ],
});

Font.register({
  family: "TimesNewRoman",
  fonts: [
    {
      src: require("../Assets/Fonts/times-new-roman.ttf"),
      fontWeight: "normal",
    },
    {
      src: require("../Assets/Fonts/times-new-roman-bold.ttf"),
      fontWeight: "bold",
    },
    {
      src: require("../Assets/Fonts/times-new-roman-bold-italic.ttf"),
      fontWeight:"bold",
      fontStyle: "italic",
    }
  ],
});




const styles = StyleSheet.create({

  Width60:{
    width:"60%"
  },
  text:{
    fontFamily:"TimesNewRoman",
  },

  italicText :{
    fontFamily:"TimesNewRoman",
    fontStyle:"italic"
  },
  
  noBorder: {
    border: "0px",
  },
  FinancialYear: {
    fontSize: "11px",
    fontFamily: "TimesNewRoman",
    fontWeight: "extrabold",
    paddingVertical: "3px",
    paddingBottom: "20px",
  },

  AmountIn:{
    fontSize: "11px",
    fontFamily: "TimesNewRoman",
    fontWeight: "extrabold",
  },

  Total: {
    fontFamily: "TimesNewRoman",
    fontWeight: "extrabold",
  },

  businessName: {
    fontSize: "16px",
    paddingTop: 20,
    textTransform: "capitalize",
    fontFamily: "TimesNewRoman",
    fontWeight: "extrabold",
  },
  caName: {
    fontWeight: "bold",
    textAlign: "right",
  },
  membershipNumber: {
    fontWeight: "normal",
    textAlign: "right",
  },
  udinNumber: {
    fontWeight: "normal",
    textAlign: "right",
  },
  mobileNumber: {
    fontWeight: "normal",
    textAlign: "right",
  },
  page: {
    fontFamily:"TimesNewRoman",
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
    fontSize: 14,
    textAlign: "center",
    marginBottom: 14,
    textTransform: "capitalize",
    color: "#fff",
    fontWeight: "bold",
    padding: 4,
    backgroundColor: "#172554",
    fontFamily:"TimesNewRoman",
  },
  table: {
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    fontFamily:"TimesNewRoman",
  },
  tableRow: {
    flexDirection: "row",
    fontFamily:"TimesNewRoman",
  },
  tableHeader: {
    backgroundColor: "#172554",
    color: "#ffffff",
    textAlign: "left",
    flexDirection: "row",
    fontFamily:"TimesNewRoman",
  },
  serialNoCell: {
    width: "20%",
    padding: 3,
    fontSize: "10px",
    textAlign:"center",
    fontFamily:"TimesNewRoman",
  },
  particularsCell: {
    width: "30%",
    padding: 3,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    fontSize: "10px",
    fontFamily:"TimesNewRoman",
    textAlign:"center"
  },
  separatorCell: {
    width: "5%",
    padding: 3,
    fontFamily:"TimesNewRoman",
    fontSize: "10px",
  },
  detailsCell: {
    width: "65%",
    padding: 3,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    fontFamily:"TimesNewRoman",
    fontSize:"10px"
  },
  partnersSection: {
    marginTop: 16,
    fontFamily:"TimesNewRoman",
  },
  partnersTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    fontFamily:"TimesNewRoman",
  },
  partnerCell: {
    width: "25%",
    padding: 3,
    borderLeft: "1px solid #000",
    fontSize: "10px",
    color: "#fff",
    fontFamily:"TimesNewRoman",
  },
  serialNoCellDetail: {
    width: "20%",
    padding: 3,
    borderRight: "1px solid #000",
    borderBottom: "1px solid #000",
    fontSize: "10px",
    textAlign:"center",
    fontFamily:"TimesNewRoman",
  },
  particularsCellsDetail: {
    width: "30%",
    padding: 3,
    borderBottom: "1px solid #000",
    fontSize: "10px",
    fontFamily:"TimesNewRoman",
    textAlign:"center",
  },
  separatorCellDetail: {
    width: "5%",
    padding: 3,
    borderLeft: "1px solid #000",
    borderRight: "1px solid #000",
    borderBottom: "1px solid #000",
    fontSize: "10px",
    fontFamily:"TimesNewRoman",
  },
  detailsCellDetail: {
    width: "65%",
    padding: 3,
    borderBottom: "1px solid #000",
    fontSize: "10px",
    fontFamily:"TimesNewRoman",
  },
  partnerCellDetail: {
    width: "25%",
    padding: 2,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    fontSize: "10px",
    fontFamily:"TimesNewRoman",
  },
  pdfViewer: {
    border: "none",
    backgroundColor: "white",
    fontFamily:"TimesNewRoman",
  },
  serialNumberCellStyle: {
    textAlign: "center",
    maxWidth: "80px", // ✅ Adjust width for proper alignment
    paddingVertical: "2px", // ✅ Ensures proper padding
    paddingHorizontal: "10px",
    margin: "1px 0", // ✅ Space between rows
    fontWeight: "bold", // ✅ Makes numbers more readable
    fontSize: "10px", // ✅ Optimized for PDF readability
    fontFamily: "TimesNewRoman",

  },
});

const stylesMOF = StyleSheet.create({

  chartImage: {
    width: 300,
    height: 300,
    marginTop: 10,
  },
  page: {
    width: "100%",
    height: "100%",
    padding: 8,
    backgroundColor: "white",
    fontFamily:"TimesNewRoman",
  },
  sectionHeader: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 14,
    textTransform: "capitalize",
    padding: 4,
    backgroundColor: "#172554",
    color: "white",
    fontFamily:"TimesNewRoman",
  },
  table: {
    width: "100%",
    marginBottom: 6,
    fontFamily:"TimesNewRoman",
  },
  row: {
    flexDirection: "row",
    borderBottom: "1px solid #000",
    fontFamily:"TimesNewRoman",
  },
  cell: {
    flex: 1,
    padding: 4,
    borderRight: "1px solid #000",
    fontSize: "10px",
    fontFamily:"TimesNewRoman",
  },
  Snocell: {
    padding: 4,
    borderRight: "1px solid #000",
    fontSize: "10px",
    paddingHorizontal: 20,
    width: 50,
    fontFamily:"TimesNewRoman",
  },
  boldCell: {
    fontWeight: "bold",
    fontFamily:"TimesNewRoman",
  },
  headerRow: {
    backgroundColor: "#172554",
    color: "white",
    marginTop: 10,
    fontFamily:"TimesNewRoman",
  },
  grayRow: {
    backgroundColor: "#E5E7EB",
    fontFamily:"TimesNewRoman",
  },
  totalRow: {
    fontWeight: "bold",
    fontFamily:"TimesNewRoman",
  },
  total: {
    border: "1px solid #000",
    fontFamily:"TimesNewRoman",
  },
});

const stylesCOP = StyleSheet.create({
  styleCOP: {
    backgroundColor: "white",
    overflow: "hidden",
    padding: 20,
    fontFamily:"TimesNewRoman",
  },
  heading: {
    textAlign: "center",
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
    textTransform: "capitalize",
    marginBottom: 20,
    padding: 4,
    backgroundColor: "#172554",
    fontFamily:"TimesNewRoman",
  },
  tableContainer: {
    marginBottom: 6,
    fontFamily:"TimesNewRoman",
  },
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#d1d5db",
    fontFamily:"TimesNewRoman",
  },
  tableHeader: {
    backgroundColor: "#172554",
    color: "white",
    fontFamily:"TimesNewRoman",
  },
  tableHeaderGray: {
    backgroundColor: "#f2f2f2",
    color: "#000",
    display: "flex",
    fontFamily:"TimesNewRoman",
  },

  totalHeader: {
    color: "#000",
    textAlign: "left",
    flexDirection: "row",
    fontWeight: "bold",
    fontFamily:"TimesNewRoman",
  },
  tableCell: {
    padding: 4,
    borderWidth: 1,
    borderColor: "black",
    fontFamily:"TimesNewRoman",
  },
  totalCostRow: {
    fontWeight: "bold",
    fontFamily:"TimesNewRoman",
  },

  serialNoCellDetail: {
    width: "20%",
    padding: 3,
    borderRight: "1px solid #000",
    fontSize: "10px",
    textAlign:"center",
    fontFamily:"TimesNewRoman",
  },
  particularsCellsDetail: {
    width: "30%",
    padding: 3,
    borderRight: "1px solid #000",
    fontSize: "10px",
    fontFamily:"TimesNewRoman",
    textAlign:"center"
  },
  separatorCellDetail: {
    width: "5%",
    padding: 3,
    borderLeft: "1px solid #000",
    borderRight: "1px solid #000",
    borderBottom: "1px solid #000",
    fontSize: "10px",
    fontFamily:"TimesNewRoman",
  },
  detailsCellDetail: {
    width: "65%",
    padding: 3,
    borderRight: "1px solid #000",
    fontSize: "10px",
    paddingLeft: 10,
    fontFamily:"TimesNewRoman",
    fontSize:"10px"
  },
  boldText: {
    border: "1.2px solid #000",
    borderLeft: "none",
    fontWeight: "extrabold",
    fontSize:"10px",
    fontFamily:"TimesNewRoman",
  },

  textCenter: {
    display: "flex",
    alignItems: "center",
    textAlign: "center",
    justifyContent: "center",
    fontFamily:"TimesNewRoman",
  },
  extraWidth: {
    width: "60%",
    fontFamily:"TimesNewRoman",
  },
  verticalPadding: {
    paddingVertical: 10,
    fontFamily:"TimesNewRoman",
  },
  extraWidthExpenses: {
    width: "100%",
    fontFamily:"TimesNewRoman",
  },
});

const styleExpenses = StyleSheet.create({
  headerRow: {
    backgroundColor: "#f2f2f2",
     color: "#000",
     marginTop: 10,
     fontFamily:"TimesNewRoman",
     fontWeight:"extrabold"
  },
  headingRow:{
    fontFamily:"TimesNewRoman",
    fontWeight:"extrabold"
  },

  particularWidth: {
    width: 600,
    fontFamily:"TimesNewRoman",
  },
  sno: {
    width: 100,
    fontSize: "10px",
    paddingLeft: 10,
    paddingTop: 5,
    textAlign:"center",
    width:"20%",
    fontFamily:"TimesNewRoman",
  },
  bordernone: {
    borderBottom: "none",
    fontFamily:"TimesNewRoman",
  },
  fontSmall: {
    fontSize: "10px",
    fontFamily:"TimesNewRoman",
  },
  paddingx: {
    paddingHorizontal: 6,
    fontFamily:"TimesNewRoman",
  },
  fontBold: {
    fontWeight: "extrabold",
    fontFamily:"TimesNewRoman",
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


const stylesRepayment = {
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    paddingVertical: 10,
    color: "#000", // Black text
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#002F5F", // Dark blue background
    paddingVertical: 10,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  tableCellHeader: {
    color: "#ffffff", // White text
    fontWeight: "bold",
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 12,
    textAlign: "center",
    flex: 1,
    borderRightWidth: 1,
    borderColor: "#ffffff", // White borders inside header
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#f9f9f9", // Light gray background for rows
  },
  tableCell: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 12,
    textAlign: "center",
    flex: 1,
    borderRightWidth: 1,
    borderColor: "#ccc", // Gray borders inside row
  },
};


export { styles, stylesMOF, stylesCOP, styleExpenses, columnWidths , stylesRepayment };
