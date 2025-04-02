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
  Width60: {
    width: "60%",
  },
  text: {
    fontFamily: selectedFont,
  },

  italicText: {
    fontFamily: selectedFont,
    fontStyle: "italic",
  },

  noBorder: {
    border: "0px",
  },
  FinancialYear: {
    fontSize: "11px",
    fontFamily: selectedFont,
    fontWeight: "bold",
    paddingVertical: "3px",
    paddingBottom: "20px",
  },

  AmountIn: {
    fontSize: "11px",
    fontFamily: selectedFont,
    fontWeight: "bold",
  },

  Total: {
    fontFamily: selectedFont,
    fontWeight: "bold",
  },

  businessName: {
    fontSize: "16px",
    paddingTop: 20,
    textTransform: "capitalize",
    fontFamily: selectedFont,
    fontWeight: "bold",
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
    fontFamily: selectedFont,
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
    backgroundColor: backgroundColor, // ✅ Dynamic,
    fontFamily: selectedFont,
  },
  table: {
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    fontFamily: selectedFont,
  },
  tableRow: {
    flexDirection: "row",
    fontFamily: selectedFont,
  },
  tableHeader: {
    backgroundColor: backgroundColor, // ✅ Dynamic,
    color: "#ffffff",
    textAlign: "left",
    flexDirection: "row",
    fontFamily: selectedFont,
  },
  serialNoCell: {
    width: "25%",
    padding: 3,
    fontSize: "9px",
    textAlign: "center",
    fontFamily: selectedFont,
  },
  particularsCell: {
    width: "40%",
    padding: 3,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    fontSize: "9px",
    fontFamily: selectedFont,
    textAlign: "center",
  },
  separatorCell: {
    width: "5%",
    padding: 3,
    fontFamily: selectedFont,
    fontSize: "9px",
  },
  detailsCell: {
    width: "55%",
    padding: 3,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    fontFamily: selectedFont,
    fontSize: "9px",
  },
  partnersSection: {
    marginTop: 16,
    fontFamily: selectedFont,
  },
  partnersTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    fontFamily: selectedFont,
  },
  partnerCell: {
    width: "25%",
    padding: 3,
    borderLeft: "1px solid #000",
    fontSize: "9px",
    color: "#fff",
    fontFamily: selectedFont,
  },
  serialNoCellDetail: {
    width: "25%",
    padding: 3,
    borderRight: "1px solid #000",
    borderBottom: "1px solid #000",
    fontSize: "9px",
    textAlign: "center",
    fontFamily: selectedFont,
  },
  particularsCellsDetail: {
    width: "40%",
    padding: 3,
    borderBottom: "1px solid #000",
    fontSize: "9px",
    fontFamily: selectedFont,
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
  },
  detailsCellDetail: {
    width: "55%",
    padding: 3,
    borderBottom: "1px solid #000",
    fontSize: "9px",
    fontFamily: selectedFont,
  },
  partnerCellDetail: {
    width: "25%",
    padding: 2,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    fontSize: "9px",
    fontFamily: selectedFont,
  },
  pdfViewer: {
    border: "none",
    backgroundColor: "white",
    fontFamily: selectedFont,
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
  },
});

const stylesMOF = StyleSheet.create({
  page: {
    width: "100%",
    height: "100%",
    padding: 8,
    backgroundColor: "white",
    fontFamily: selectedFont,
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
  },
  table: {
    width: "100%",
    marginBottom: 6,
    fontFamily: selectedFont,
  },
  row: {
    flexDirection: "row",
    borderBottom: "1px solid #000",
    fontFamily: selectedFont,
  },
  cell: {
    flex: 1,
    padding: 4,
    borderRight: "1px solid #000",
    fontSize: "9px",
    fontFamily: selectedFont,
  },
  Snocell: {
    padding: 3,
    borderRight: "1px solid #000",
    fontSize: "9px",
    // paddingHorizontal: 20,
    width: "25%",
    fontFamily: selectedFont,
    textAlign: "center",
  },
  boldCell: {
    fontWeight: "bold",
    fontFamily: selectedFont,
  },
  headerRow: {
    backgroundColor: backgroundColor, // ✅ Dynamic,
    color: "white",
    marginTop: 10,
    fontFamily: selectedFont,
  },
  grayRow: {
    backgroundColor: "#E5E7EB",
    fontFamily: selectedFont,
  },
  totalRow: {
    fontWeight: "bold",
    fontFamily: selectedFont,
  },
  total: {
    border: "1px solid #000",
    fontFamily: selectedFont,
  },
});

const stylesCOP = StyleSheet.create({
  styleCOP: {
    backgroundColor: "white",
    overflow: "hidden",
    padding: 20,
    fontFamily: selectedFont,
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
  },
  tableContainer: {
    marginBottom: 6,
    fontFamily: selectedFont,
  },
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#d1d5db",
    fontFamily: selectedFont,
  },
  tableHeader: {
    backgroundColor: backgroundColor, // ✅ Dynamic,
    color: "white",
    fontFamily: selectedFont,
  },
  tableHeaderGray: {
    backgroundColor: "#f2f2f2",
    color: "#000",
    display: "flex",
    fontFamily: selectedFont,
  },

  totalHeader: {
    color: "#000",
    textAlign: "left",
    flexDirection: "row",
    fontWeight: "bold",
    fontFamily: selectedFont,
  },
  tableCell: {
    padding: 4,
    borderWidth: 1,
    borderColor: "black",
    fontFamily: selectedFont,
  },
  totalCostRow: {
    fontWeight: "bold",
    fontFamily: selectedFont,
  },

  serialNoCellDetail: {
    width: "25%",
    padding: 3,
    borderRight: "1px solid #000",
    fontSize: "9px",
    textAlign: "center",
    fontFamily: selectedFont,
  },
  particularsCellsDetail: {
    width: "40%",
    padding: 3,
    borderRight: "1px solid #000",
    fontSize: "9px",
    fontFamily: selectedFont,
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
  },
  detailsCellDetail: {
    width: "55%",
    padding: 3,
    borderRight: "1px solid #000",
    fontSize: "9px",
    paddingLeft: 10,
    fontFamily: selectedFont,
    fontSize: "9px",
  },
  boldText: {
    border: "1.2px solid #000",
    borderLeft: "none",
    fontWeight: "bold",
    fontSize: "9px",
    fontFamily: selectedFont,
  },

  textCenter: {
    display: "flex",
    alignItems: "center",
    textAlign: "center",
    justifyContent: "center",
    fontFamily: selectedFont,
  },
  extraWidth: {
    width: "55%",
    fontFamily: selectedFont,
  },
  verticalPadding: {
    paddingVertical: 10,
    fontFamily: selectedFont,
  },
  extraWidthExpenses: {
    width: "100%",
    fontFamily: selectedFont,
  },
});

const styleExpenses = StyleSheet.create({
  headerRow: {
    backgroundColor: "#f2f2f2",
    color: "#000",
    marginTop: 10,
    fontFamily: selectedFont,
    fontWeight: "bold",
  },
  headingRow: {
    fontFamily: selectedFont,
    fontWeight: "bold",
  },

  particularWidth: {
    width: 500,
    fontFamily: selectedFont,
  },
  sno: {
    width: 100,
    fontSize: "9px",
    // paddingLeft: 10,
    paddingTop: 5,
    textAlign: "center",
    width: "25%",
    fontFamily: selectedFont,
  },
  bordernone: {
    borderBottom: "none",
    fontFamily: selectedFont,
  },
  fontSmall: {
    fontSize: "9px",
    fontFamily: selectedFont,
  },
  paddingx: {
    paddingHorizontal: 6,
    fontFamily: selectedFont,
  },
  fontBold: {
    fontWeight: "bold",
    fontFamily: selectedFont,
  },
});

const columnWidths = {
  serialNo: { width: "25%", textAlign: "center" }, // ✅ Fixed width for Serial No.
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

export {
  styles,
  stylesMOF,
  stylesCOP,
  styleExpenses,
  columnWidths,
  stylesRepayment,
};
