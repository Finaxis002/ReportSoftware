import React , {useState} from "react";
import { Page, View, Text, Image } from "@react-pdf/renderer";
import { styles, stylesCOP, stylesMOF, styleExpenses } from "./Styles";
import SAWatermark from "../Assets/SAWatermark";
import CAWatermark from "../Assets/CAWatermark";
import DirectExpenseBreakUpGraph from "./Graphs/DirectExpenseBreakUp";

const FinancialGraphs = ({
  formData,
  receivedtotalRevenueReceipts,
  normalExpense,
  totalQuantity,
  totalAnnualWages,
  fringeCalculation,
  fringAndAnnualCalculation = [],
  receivedDscr = [],
  receivedAverageCurrentRatio = [],
  receivedBreakEvenPointPercentage = [],
  receivedAssetsLiabilities = [],
  pdfType,
}) => {

  const [chartImage, setChartImage] = useState(null);

  return (
    <Page size="A4" style={styles.page}>
      <DirectExpenseBreakUpGraph setExportedImage={setChartImage} />
    </Page>
  );
};

export default FinancialGraphs;
