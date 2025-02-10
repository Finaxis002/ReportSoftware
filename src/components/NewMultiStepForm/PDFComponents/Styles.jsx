import { StyleSheet } from "@react-pdf/renderer";

 const styles = StyleSheet.create({
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
      fontSize: 10,
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
      width: "10%",
      padding: 3,
      borderRight: "1px solid #8a8b91",
      borderBottom: "1px solid #8a8b91",
      fontSize: 10,
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
      width: "10%",
      padding: 3,
      borderRight: "1px solid #000",
      fontSize: 10,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
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
      border: "2px solid #000",
      borderLeft: "none",
      fontWeight: "extrabold",
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
    },

    particularWidth: {
      width: 600,
    },
    sno: {
      width: 100,
      fontSize: 10,
      paddingLeft: 10,
      paddingTop: 5,
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

export { styles, stylesMOF, stylesCOP, styleExpenses };
