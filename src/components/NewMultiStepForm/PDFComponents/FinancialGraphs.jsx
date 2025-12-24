import {useState} from "react";
import { Page,  } from "@react-pdf/renderer";
import { styles,} from "./Styles";
import DirectExpenseBreakUpGraph from "./Graphs/DirectExpenseBreakUp";

const FinancialGraphs = ({
}) => {

  const [chartImage, setChartImage] = useState(null);

  return (
    <Page size="A4" style={styles.page}>
      <DirectExpenseBreakUpGraph setExportedImage={setChartImage} />
    </Page>
  );
};

export default FinancialGraphs;
