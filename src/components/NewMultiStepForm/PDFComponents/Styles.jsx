import { StyleSheet } from "@react-pdf/renderer";

import { Font } from "@react-pdf/renderer";
import { checkAndRegisterFont } from "../checkAndRegisterFont";

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
      fontWeight: "bold",
      fontStyle: "italic",
    },
  ],
});


Font.register({
  family: "Times New Roman",
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
      fontWeight: "bold",
      fontStyle: "italic",
    },
  ],
});


Font.register({
  family: "Poppins",
  fonts: [
    {
      src: require("../Assets/Fonts/Poppins/Poppins-Regular.ttf"),
      fontWeight: "normal",
    },
    {
      src: require("../Assets/Fonts/Poppins/Poppins-Bold.ttf"),
      fontWeight: "bold",
    },
    {
      src: require("../Assets/Fonts/Poppins/Poppins-BoldItalic.ttf"),
      fontWeight: "bold",
      fontStyle: "italic",
    },
  ],
});


Font.register({
  family: "Open Sans",
  fonts: [
    {
      src: require("../Assets/Fonts/OpenSans/OpenSans-Regular.ttf"),
      fontWeight: "normal",
    },
    {
      src: require("../Assets/Fonts/OpenSans/OpenSans-Bold.ttf"),
      fontWeight: "bold",
    },
    {
      src: require("../Assets/Fonts/OpenSans/OpenSans-BoldItalic.ttf"),
      fontWeight: "bold",
      fontStyle: "italic",
    },
  ],
});


Font.register({
  family: "Nunito",
  fonts: [
    {
      src: require("../Assets/Fonts/Nunito/Nunito-Regular.ttf"),
      fontWeight: "normal",
    },
    {
      src: require("../Assets/Fonts/Nunito/Nunito-Bold.ttf"),
      fontWeight: "bold",
    },
    {
      src: require("../Assets/Fonts/Nunito/Nunito-BoldItalic.ttf"),
      fontWeight: "bold",
      fontStyle: "italic",
    },
  ],
});


Font.register({
  family: "Inter",
  fonts: [
    {
      src: require("../Assets/Fonts/Inter/Inter_18pt-Regular.ttf"),
      fontWeight: "normal",
    },
    {
      src: require("../Assets/Fonts/Inter/Inter_18pt-Bold.ttf"),
      fontWeight: "bold",
    },
    {
      src: require("../Assets/Fonts/Inter/Inter_18pt-BoldItalic.ttf"),
      fontWeight: "bold",
      fontStyle: "italic",
    },
  ],
});


Font.register({
  family: "Montserrat",
  fonts: [
    {
      src: require("../Assets/Fonts/Montserrat/Montserrat-Regular.ttf"),
      fontWeight: "normal",
    },
    {
      src: require("../Assets/Fonts/Montserrat/Montserrat-Bold.ttf"),
      fontWeight: "bold",
    },
    {
      src: require("../Assets/Fonts/Montserrat/Montserrat-BoldItalic.ttf"),
      fontWeight: "bold",
      fontStyle: "italic",
    },
  ],
});


Font.register({
  family: "Lato",
  fonts: [
    {
      src: require("../Assets/Fonts/Lato/Lato-Regular.ttf"),
      fontWeight: "normal",
    },
    {
      src: require("../Assets/Fonts/Lato/Lato-Bold.ttf"),
      fontWeight: "bold",
    },
    {
      src: require("../Assets/Fonts/Lato/Lato-BoldItalic.ttf"),
      fontWeight: "bold",
      fontStyle: "italic",
    },
  ],
});



Font.register({
  family: "Raleway",
  fonts: [
    {
      src: require("../Assets/Fonts/Raleway/Raleway-Regular.ttf"),
      fontWeight: "normal",
    },
    {
      src: require("../Assets/Fonts/Raleway/Raleway-Bold.ttf"),
      fontWeight: "bold",
    },
    {
      src: require("../Assets/Fonts/Raleway/Raleway-BoldItalic.ttf"),
      fontWeight: "bold",
      fontStyle: "italic",
    },
  ],
});

Font.register({
  family: "Playfair Display",
  fonts: [
    {
      src: require("../Assets/Fonts/PlayfairDisplay/PlayfairDisplay-Regular.ttf"),
      fontWeight: "normal",
    },
    {
      src: require("../Assets/Fonts/PlayfairDisplay/PlayfairDisplay-Bold.ttf"),
      fontWeight: "bold",
    },
    {
      src: require("../Assets/Fonts/PlayfairDisplay/PlayfairDisplay-BoldItalic.ttf"),
      fontWeight: "bold",
      fontStyle: "italic",
    },
  ],
});

Font.register({
  family: "Merriweather",
  fonts: [
    {
      src: require("../Assets/Fonts/Merriweather/Merriweather-Regular.ttf"),
      fontWeight: "normal",
    },
    {
      src: require("../Assets/Fonts/Merriweather/Merriweather-Bold.ttf"),
      fontWeight: "bold",
    },
    {
      src: require("../Assets/Fonts/Merriweather/Merriweather-BoldItalic.ttf"),
      fontWeight: "bold",
      fontStyle: "italic",
    },
  ],
});

Font.register({
  family: "Ubuntu",
  fonts: [
    {
      src: require("../Assets/Fonts/Ubuntu/Ubuntu-Regular.ttf"),
      fontWeight: "normal",
    },
    {
      src: require("../Assets/Fonts/Ubuntu/Ubuntu-Bold.ttf"),
      fontWeight: "bold",
    },
    {
      src: require("../Assets/Fonts/Ubuntu/Ubuntu-BoldItalic.ttf"),
      fontWeight: "bold",
      fontStyle: "italic",
    },
  ],
});

Font.register({
  family: "Oswald",
  fonts: [
    {
      src: require("../Assets/Fonts/Oswald/Oswald-Regular.ttf"),
      fontWeight: "normal",
    },
    {
      src: require("../Assets/Fonts/Oswald/Oswald-Bold.ttf"),
      fontWeight: "bold",
    },
    {
      src: require("../Assets/Fonts/Oswald/Oswald-Bold.ttf"),
      fontWeight: "bold",
      fontStyle: "italic",
    },
  ],
});

Font.register({
  family: "Courier Prime",
  fonts: [
    {
      src: require("../Assets/Fonts/CourierPrime/CourierPrime-Regular.ttf"),
      fontWeight: "normal",
    },
    {
      src: require("../Assets/Fonts/CourierPrime/CourierPrime-Bold.ttf"),
      fontWeight: "bold",
    },
    {
      src: require("../Assets/Fonts/CourierPrime/CourierPrime-BoldItalic.ttf"),
      fontWeight: "bold",
      fontStyle: "italic",
    },
  ],
});


// styles.jsx or in the same component file
const colorMap = {
  Red: "#ef4444", // Tailwind red-500 (vibrant)
  Blue: "#3b82f6", // Tailwind blue-500
  Green: "#22c55e", // Tailwind green-500
  Purple: "#8b5cf6", // Tailwind purple-500
  SkyBlue: "#0ea5e9", // Tailwind sky-500
  Orange: "#f97316", // Tailwind orange-500
  Pink: "#ec4899", // Tailwind pink-500
  Teal: "#14b8a6", // Tailwind teal-500
  Black: "#172554", // Default / fallback
};

const storedColor = localStorage.getItem("selectedColor");
// console.log("stored color" , storedColor)

// If it's a predefined color in colorMap, use its hex
// Otherwise, assume it's a custom HEX and use it directly
const backgroundColor = colorMap[storedColor] || storedColor || "#172554";


const selectedFont = localStorage.getItem("selectedFont") || "TimesNewRoman";


console.log("Selected font:", selectedFont);
console.log("Registered fonts:", Font.getRegisteredFonts?.());





const styles = StyleSheet.create({

  chartContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  Charttitle: { fontSize: 18, marginBottom: 10, textAlign: "center" },
  pieChart: {
    width: 300,
    height: 300,
    marginVertical: 20,
    borderRadius: 8,
    textAlign: "center",
  },
  barChart: {
    width: 400,
    height: 300,
    borderColor: "#ccc",
    backgroundColor: "#ffffff",
  },
  Width60: {
    width: "60%",
    wrap: false,
  },
  text: {
    fontFamily: selectedFont,
    wrap: false,
  },

  italicText: {
    fontFamily: selectedFont,
    fontStyle: "italic",
    wrap: false,
  },

  noBorder: {
    border: "0px",
    wrap: false,
  },
  FinancialYear: {
    fontSize: "11px",
    fontFamily: selectedFont,
    fontWeight: "bold",
    paddingVertical: "3px",
    paddingBottom: "20px",
    wrap: false,
  },

  AmountIn: {
    fontSize: "11px",
    fontFamily: selectedFont,
    fontWeight: "bold",
    wrap: false,
  },

  Total: {
    fontFamily: selectedFont,
    fontWeight: "bold",
    wrap: false,
  },

  businessName: {
    fontSize: "16px",
    paddingTop: 20,
    textTransform: "capitalize",
    fontFamily: selectedFont,
    fontWeight: "bold",
    wrap: false,
  },
  caName: {
    fontWeight: "bold",
    textAlign: "right",
    wrap: false,
  },
  membershipNumber: {
    fontWeight: "normal",
    textAlign: "right",
    wrap: false,
  },
  udinNumber: {
    fontWeight: "normal",
    textAlign: "right",
    wrap: false,
  },
  mobileNumber: {
    fontWeight: "normal",
    textAlign: "right",
    wrap: false,
  },
  page: {
    fontFamily: selectedFont,
    flexDirection: "column",
    backgroundColor: "#ffffff",
    paddingHorizontal: 30,
    paddingVertical: 10,
    wrap: false,
  },
  clientName: {
    fontSize: "16px",
    padding: 20,
    textTransform: "capitalize",
    wrap: false,
  },

  title: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 14,
    textTransform: "capitalize",
    color: "#fff",
    fontWeight: "bold",
    padding: 4,
    backgroundColor: backgroundColor, // ✅ Dynamic,
    fontFamily: selectedFont,
    wrap: false,
  },
  table: {
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    fontFamily: selectedFont,
    wrap: false,
  },
  tableRow: {
    flexDirection: "row",
    fontFamily: selectedFont,
    wrap: false,
  },
  tableHeader: {
    backgroundColor: backgroundColor, // ✅ Dynamic,
    color: "#ffffff",
    textAlign: "left",
    flexDirection: "row",
    fontFamily: selectedFont,
    wrap: false,
  },
  serialNoCell: {
    width: "25%",
    padding: 3,
    fontSize: "9px",
    textAlign: "center",
    fontFamily: selectedFont,
    wrap: false,
  },
  particularsCell: {
    width: "55%",
    padding: 3,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    fontSize: "9px",
    fontFamily: selectedFont,
    textAlign: "center",
    wrap: false,
  },
  separatorCell: {
    width: "5%",
    padding: 3,
    fontFamily: selectedFont,
    fontSize: "9px",
    wrap: false,
  },
  detailsCell: {
    width: "30%",
    padding: 3,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    fontFamily: selectedFont,
    fontSize: "9px",
    wrap: false,
  },
  partnersSection: {
    marginTop: 16,
    fontFamily: selectedFont,
    wrap: false,
  },
  partnersTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    fontFamily: selectedFont,
    wrap: false,
  },
  partnerCell: {
    width: "25%",
    padding: 3,
    borderLeft: "1px solid #000",
    fontSize: "9px",
    color: "#fff",
    fontFamily: selectedFont,
    wrap: false,
  },
  serialNoCellDetail: {
    width: "25%",
    padding: 3,
    borderRight: "1px solid #000",
    borderBottom: "1px solid #000",
    fontSize: "9px",
    textAlign: "center",
    fontFamily: selectedFont,
    wrap: false,
  },
  particularsCellsDetail: {
    width: "55%",
    padding: 3,
    borderBottom: "1px solid #000",
    fontSize: "9px",
    fontFamily: selectedFont,
    textAlign: "center",
    wrap: false,
  },
  separatorCellDetail: {
    width: "5%",
    padding: 3,
    borderLeft: "1px solid #000",
    borderRight: "1px solid #000",
    borderBottom: "1px solid #000",
    fontSize: "9px",
    fontFamily: selectedFont,
    wrap: false,
  },
  detailsCellDetail: {
    width: "30%",
    padding: 3,
    borderBottom: "1px solid #000",
    fontSize: "9px",
    fontFamily: selectedFont,
    wrap: false,
  },
  partnerCellDetail: {
    width: "25%",
    padding: 2,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    fontSize: "9px",
    fontFamily: selectedFont,
    wrap: false,
  },
  pdfViewer: {
    border: "none",
    backgroundColor: "white",
    fontFamily: selectedFont,
    wrap: false,
  },
  serialNumberCellStyle: {
    textAlign: "center",
    maxWidth: "80px", // ✅ Adjust width for proper alignment
    paddingVertical: "2px", // ✅ Ensures proper padding
    paddingHorizontal: "10px",
    margin: "1px 0", // ✅ Space between rows
    fontWeight: "bold", // ✅ Makes numbers more readable
    fontSize: "9px", // ✅ Optimized for PDF readability
    fontFamily: selectedFont,
    wrap: false,
  },
});

const stylesMOF = StyleSheet.create({
  page: {
    width: "100%",
    height: "100%",
    padding: 8,
    backgroundColor: "white",
    fontFamily: selectedFont,
    wrap: false,
  },
  sectionHeader: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 14,
    textTransform: "capitalize",
    padding: 4,
    backgroundColor: backgroundColor, // ✅ Dynamic,
    color: "white",
    fontFamily: selectedFont,
    wrap: false,
  },
  table: {
    width: "100%",
    marginBottom: 6,
    fontFamily: selectedFont,
    wrap: false,
  },
  row: {
    flexDirection: "row",
    borderBottom: "1px solid #000",
    fontFamily: selectedFont,
    wrap: false,
  },
  cell: {
    flex: 1,
    padding: 4,
    borderRight: "1px solid #000",
    fontSize: "9px",
    fontFamily: selectedFont,
    wrap: false,
  },
  Snocell: {
    padding: 3,
    borderRight: "1px solid #000",
    fontSize: "9px",
    // paddingHorizontal: 20,
    width: "25%",
    fontFamily: selectedFont,
    textAlign: "center",
    wrap: false,
  },
  boldCell: {
    fontWeight: "bold",
    fontFamily: selectedFont,
    wrap: false,
  },
  headerRow: {
    backgroundColor: backgroundColor, // ✅ Dynamic,
    color: "white",
    marginTop: 10,
    fontFamily: selectedFont,
    wrap: false,
  },
  grayRow: {
    backgroundColor: "#E5E7EB",
    fontFamily: selectedFont,
    wrap: false,
  },
  totalRow: {
    fontWeight: "bold",
    fontFamily: selectedFont,
    wrap: false,
  },
  total: {
    border: "1px solid #000",
    fontFamily: selectedFont,
    wrap: false,
  },
});

const stylesCOP = StyleSheet.create({
  styleCOP: {
    backgroundColor: "white",
    overflow: "hidden",
    padding: 20,
    fontFamily: selectedFont,
    wrap: false,
  },
  heading: {
    textAlign: "center",
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
    textTransform: "capitalize",
    marginBottom: 20,
    padding: 4,
    backgroundColor: backgroundColor, // ✅ Dynamic,
    fontFamily: selectedFont,
    wrap: false,
  },
  tableContainer: {
    marginBottom: 6,
    fontFamily: selectedFont,
    wrap: false,
  },
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#d1d5db",
    fontFamily: selectedFont,
    wrap: false,
  },
  tableHeader: {
    backgroundColor: backgroundColor, // ✅ Dynamic,
    color: "white",
    fontFamily: selectedFont,
    wrap: false,
  },
  tableHeaderGray: {
    backgroundColor: "#f2f2f2",
    color: "#000",
    display: "flex",
    fontFamily: selectedFont,
    wrap: false,
  },

  totalHeader: {
    color: "#000",
    textAlign: "left",
    flexDirection: "row",
    fontWeight: "bold",
    fontFamily: selectedFont,
    wrap: false,
  },
  tableCell: {
    padding: 4,
    borderWidth: 1,
    borderColor: "black",
    fontFamily: selectedFont,
    wrap: false,
  },
  totalCostRow: {
    fontWeight: "bold",
    fontFamily: selectedFont,
    wrap: false,
  },

  serialNoCellDetail: {
    width: "25%",
    padding: 3,
    borderRight: "1px solid #000",
    fontSize: "9px",
    textAlign: "center",
    fontFamily: selectedFont,
    wrap: false,
  },
  particularsCellsDetail: {
    width: "55%",
    padding: 3,
    borderRight: "1px solid #000",
    fontSize: "9px",
    fontFamily: selectedFont,
    wrap: false,
    textAlign: "center",
  },
  separatorCellDetail: {
    width: "5%",
    padding: 3,
    borderLeft: "1px solid #000",
    borderRight: "1px solid #000",
    borderBottom: "1px solid #000",
    fontSize: "9px",
    fontFamily: selectedFont,
    wrap: false,
  },
  detailsCellDetail: {
    width: "30%",
    padding: 3,
    borderRight: "1px solid #000",
    fontSize: "9px",
    paddingLeft: 10,
    fontFamily: selectedFont,
    wrap: false,
    fontSize: "9px",
  },
  boldText: {
    border: "1.2px solid #000",
    borderLeft: "none",
    fontWeight: "bold",
    fontSize: "9px",
    fontFamily: selectedFont,
    wrap: false,
  },

  textCenter: {
    display: "flex",
    alignItems: "center",
    textAlign: "center",
    justifyContent: "center",
    fontFamily: selectedFont,
    wrap: false,
  },
  extraWidth: {
    width: "30%",
    fontFamily: selectedFont,
    wrap: false,
  },
  verticalPadding: {
    paddingVertical: 10,
    fontFamily: selectedFont,
    wrap: false,
  },
  extraWidthExpenses: {
    width: "100%",
    fontFamily: selectedFont,
    wrap: false,
  },
});

const styleExpenses = StyleSheet.create({
  headerRow: {
    backgroundColor: "#f2f2f2",
    color: "#000",
    marginTop: 10,
    fontFamily: selectedFont,
    wrap: false,
    fontWeight: "bold",
  },
  headingRow: {
    fontFamily: selectedFont,
    wrap: false,
    fontWeight: "bold",
  },

  particularWidth: {
    width: 800,
    fontFamily: selectedFont,
    wrap: false,
  },
  sno: {
    width: 100,
    fontSize: "9px",
    // paddingLeft: 10,
    paddingTop: 5,
    textAlign: "center",
    width: "25%",
    fontFamily: selectedFont,
    wrap: false,
  },
  bordernone: {
    borderBottom: "none",
    fontFamily: selectedFont,
    wrap: false,
  },
  fontSmall: {
    fontSize: "9px",
    fontFamily: selectedFont,
    wrap: false,
  },
  paddingx: {
    paddingHorizontal: 6,
    fontFamily: selectedFont,
    wrap: false,
  },
  fontBold: {
    fontWeight: "bold",
    fontFamily: selectedFont,
    wrap: false,
  },
});

const columnWidths = {
  serialNo: { width: "25%", textAlign: "center" , wrap: false, }, // ✅ Fixed width for Serial No.
  yearQuarter: { width: "120px", textAlign: "center" , wrap: false, },
  openingBalance: { width: "120px", textAlign: "center" , wrap: false, },
  principalRepayment: { width: "120px", textAlign: "center" , wrap: false, },
  closingBalance: { width: "120px", textAlign: "center" , wrap: false, },
  interestLiability: { width: "120px", textAlign: "center" , wrap: false, },
  totalRepayment: { width: "120px", textAlign: "center" , wrap: false, },
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

export {
  styles,
  stylesMOF,
  stylesCOP,
  styleExpenses,
  columnWidths,
  stylesRepayment,
};
