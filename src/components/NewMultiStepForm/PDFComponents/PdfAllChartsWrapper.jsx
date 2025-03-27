// import React, { useState, useEffect } from "react";
// import PdfWithChart from "./PdfWithChart";
// import PdfWithCombinedCharts from "./PdfWithCombinedCharts";
// import { Document, Page, View, Text } from "@react-pdf/renderer";

// const PdfAllChartsWrapper = ({ formData, totalExpenses, labels, dscr, currentRatio }) => {
//   const [pieChart, setPieChart] = useState(null);
//   const [barChart, setBarChart] = useState(null);
//   const [dscrChart, setDscrChart] = useState(null);
//   const [currentRatioChart, setCurrentRatioChart] = useState(null);
//   const [chartsReady, setChartsReady] = useState(false);

//   // ✅ Once all charts are set, mark charts as ready
//   useEffect(() => {
//     if (pieChart && barChart && dscrChart && currentRatioChart) {
//       setChartsReady(true);
//     }
//   }, [pieChart, barChart, dscrChart, currentRatioChart]);
  


//   const allReady = pieChart && barChart && dscrChart && currentRatioChart;
 
  

//   return (
//     <>
//       <PdfWithChart
//         formData={formData}
//         totalExpenses={totalExpenses}
//         onPieChartReady={setPieChart}
//         onBarChartReady={setBarChart}
//       />
//       <PdfWithCombinedCharts
//         labels={labels}
//         dscr={dscr}
//         currentRatio={currentRatio}
//         onDscrReady={setDscrChart}
//         onCurrentRatioReady={setCurrentRatioChart}
//       />



//       {/* {!allReady && (
//          <div style={{ display: "none" }}>
//         <Document>
//           <Page size="A4">
//             <View style={{ padding: 20 }}>
//               {<Text>Generating charts... Please wait.</Text>}
//             </View>
//           </Page>
//         </Document>
//         </div>
//       )} */}

// <Document>
//         {!chartsReady ? (
//           <Page size="A4">
//             <View style={{ padding: 20 }}>
//               <Text>Generating charts... Please wait.</Text>
//             </View>
//           </Page>
//         ) : (
//           <>
//             {/* If your chart components already return <Page />, you can leave this empty */}
//           </>
//         )}
//       </Document>


//     </>
//   );
// };

// export default PdfAllChartsWrapper;











////////////////////////////////////////////////////////////////////////////////////////////////////////

// import React, { useState, useEffect } from "react";
// import PdfWithChart from "./PdfWithChart";
// import PdfWithCombinedCharts from "./PdfWithCombinedCharts";
// import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

// const styles = StyleSheet.create({
//   page: {
//     padding: 20,
//   },
//   section: {
//     margin: 10,
//   },
//   chartImage: {
//     width: 400,
//     height: 300,
//     marginVertical: 20,
//   },
// });

// const PdfAllChartsWrapper = ({ formData, totalExpenses, labels, dscr, currentRatio }) => {
//   const [pieChart, setPieChart] = useState(null);
//   const [barChart, setBarChart] = useState(null);
//   const [dscrChart, setDscrChart] = useState(null);
//   const [currentRatioChart, setCurrentRatioChart] = useState(null);

//   const [chartsReady, setChartsReady] = useState(false);

//   // ✅ Set `chartsReady` when all charts are available
//   useEffect(() => {
//     if (pieChart && barChart && dscrChart && currentRatioChart) {
//       setChartsReady(true);
//     }
//   }, [pieChart, barChart, dscrChart, currentRatioChart]);

//   // ⛔ Don't return <Document> until charts are ready
//   if (!chartsReady) {
//     // Still trigger chart generation
//     return (
//       <>
//         <PdfWithChart
//           formData={formData}
//           totalExpenses={totalExpenses}
//           onPieChartReady={setPieChart}
//           onBarChartReady={setBarChart}
//         />
//         <PdfWithCombinedCharts
//           labels={labels}
//           dscr={dscr}
//           currentRatio={currentRatio}
//           onDscrReady={setDscrChart}
//           onCurrentRatioReady={setCurrentRatioChart}
//         />
//       </>
//     );
//   }
  

//   // ✅ All charts are ready, now render the PDF
//   return (
//     <Document>
//       <Page size="A4" style={styles.page}>
//         <View style={styles.section}>
//           <Text>Direct Expense Breakup</Text>
//           <Image src={pieChart} style={styles.chartImage} />
//         </View>

//         <View style={styles.section}>
//           <Text>Revenue vs Expenses</Text>
//           <Image src={barChart} style={styles.chartImage} />
//         </View>

//         <View style={styles.section}>
//           <Text>DSCR Chart</Text>
//           <Image src={dscrChart} style={styles.chartImage} />
//         </View>

//         <View style={styles.section}>
//           <Text>Current Ratio</Text>
//           <Image src={currentRatioChart} style={styles.chartImage} />
//         </View>
//       </Page>
//     </Document>
//   );
// };

// export default PdfAllChartsWrapper;

///////////////////////////////////////////////////////////////////////////////////////////////////////////////

import React, { useState, useEffect } from "react";
import PdfWithChart from "./PdfWithChart";
import PdfWithCombinedCharts from "./PdfWithCombinedCharts";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 20,
  },
  section: {
    margin: 10,
  },
  chartImage: {
    width: 400,
    height: 300,
    marginVertical: 20,
  },
});

const PdfAllChartsWrapper = ({ formData, totalExpenses, labels, dscr, currentRatio }) => {
  const [pieChart, setPieChart] = useState(null);
  const [barChart, setBarChart] = useState(null);
  const [dscrChart, setDscrChart] = useState(null);
  const [currentRatioChart, setCurrentRatioChart] = useState(null);

  const [chartsReady, setChartsReady] = useState(false);

  // ✅ Set `chartsReady` when all charts are available
  useEffect(() => {
    if (pieChart && barChart && dscrChart && currentRatioChart) {
      setChartsReady(true);
    }
  }, [pieChart, barChart, dscrChart, currentRatioChart]);

  // Render the chart components to generate charts
  return (
    <>
      <PdfWithChart
        formData={formData}
        totalExpenses={totalExpenses}
        onPieChartReady={setPieChart}
        onBarChartReady={setBarChart}
      />
      <PdfWithCombinedCharts
        labels={labels}
        dscr={dscr}
        currentRatio={currentRatio}
        onDscrReady={setDscrChart}
        onCurrentRatioReady={setCurrentRatioChart}
      />

      {/* Render loading message if charts are still not ready */}
      {/* {!chartsReady && (
        <div style={{ textAlign: "center", padding: "20px" , display: "none"}}>
          <Text>Generating charts... Please wait.</Text>
        </div>
      )} */}

      {/* Once all charts are ready, render the PDF */}
      {chartsReady && (
        <Document>
          <Page size="A4" style={styles.page}>
            <View style={styles.section}>
              <Text>Direct Expense Breakup</Text>
              <Image src={pieChart} style={styles.chartImage} />
            </View>

            <View style={styles.section}>
              <Text>Revenue vs Expenses</Text>
              <Image src={barChart} style={styles.chartImage} />
            </View>

            <View style={styles.section}>
              <Text>DSCR Chart</Text>
              <Image src={dscrChart} style={styles.chartImage} />
            </View>

            <View style={styles.section}>
              <Text>Current Ratio</Text>
              <Image src={currentRatioChart} style={styles.chartImage} />
            </View>
          </Page>
        </Document>
      )}
    </>
  );
};

export default PdfAllChartsWrapper;
