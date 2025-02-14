import React from "react";
import { Page, View, Text } from "@react-pdf/renderer";
import { styles, stylesCOP, styleExpenses } from "./Styles";
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

const IncomeTaxCalculation = ({ formData = {}, netProfitBeforeTax = [] , totalDepreciationPerYear=[]}) => {
  if (!formData || typeof formData !== "object") {
    console.error("❌ Invalid formData provided");
    return null; // Prevent rendering if formData is invalid
  }

  // Get starting year (assuming 2025, adjust based on your data)
const startYear = Number(formData?.ProjectReportSetting?.FinancialYear )|| 2025;
const projectionYears = Number(formData?.ProjectReportSetting?.ProjectionYears) || 5;
 // Default to 5 years if not provided
 const rateOfInterest = Number(formData?.ProjectReportSetting?.rateOfInterest) || 5;



  // ✅ Compute Tax at 30% on Net Profit Before Tax
  const incomeTax = Array.isArray(netProfitBeforeTax) && netProfitBeforeTax.length > 0
    ? netProfitBeforeTax.map((npbt) => (npbt ? Math.round(npbt * (rateOfInterest/100)) : "0.00"))
    : [];

    // const incomeTax1 = Array.isArray(netProfitBeforeTax) && netProfitBeforeTax.length > 0
    // ? netProfitBeforeTax.map((npbt) => (npbt ? npbt * 0.30 : 0))
    // : [];

  return (
    <Page size="A4"  style={stylesCOP.styleCOP}>
      <View style={[styleExpenses.paddingx, ]} >
        <Text style={[styles.clientName]}>
          {formData?.AccountInformation?.clientName || "N/A"}
        </Text>
        <View style={[stylesCOP.heading, { fontWeight: "bold", paddingLeft: 10 }]}>
          <Text>Income Tax Calculation</Text>
        </View>

        {/* <View style={[styles.table]}>
          <View style={styles.tableHeader}>
            <Text style={[styles.serialNoCell, styleExpenses.sno]}>S. No.</Text>
            <Text style={[styles.detailsCell, styleExpenses.particularWidth]}>Particulars</Text>
            {Array.from({ length: 5 }).map((_, index) => (
              <Text key={index} style={styles.particularsCell}>
                2025-{26 + index}
              </Text>
            ))}
          </View>
        </View> */}
        <View style={[styles.table]}>
  <View style={styles.tableHeader}>
    <Text style={[styles.serialNoCell, styleExpenses.sno]}>S. No.</Text>
    <Text style={[styles.detailsCell, styleExpenses.particularWidth]}>Particulars</Text>

    {/* Dynamically generate years based on start year and projection years */}
    {Array.from({ length: projectionYears }).map((_, index) => (
      <Text key={index} style={styles.particularsCell}>
        {`${startYear + index}-${(startYear + index + 1) % 100}`}  
      </Text>
    ))}
  </View>


        {/* Net Profit Before Tax */}
        <View style={[styles.tableRow]}>
          <Text style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}></Text>
          <Text style={[stylesCOP.detailsCellDetail, styleExpenses.particularWidth]}>
            Net Profit Before Tax
          </Text>
          {netProfitBeforeTax.length > 0 ? (
            netProfitBeforeTax.map((npbt, index) => (
              <Text key={index} style={[stylesCOP.particularsCellsDetail, styles.boldText]}> 
                {npbt ? npbt.toLocaleString("en-IN") : "N/A"}
              </Text>
            ))
          ) : (
            <Text style={stylesCOP.particularsCellsDetail}>N/A</Text>
          )}
        </View>

        {/* depreciation */}
        <View style={[styles.tableRow]}>
          <Text style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}></Text>
          <Text style={[stylesCOP.detailsCellDetail, styleExpenses.particularWidth]}>
            Depreciation(WDA)
          </Text>
          {totalDepreciationPerYear.length > 0 ? (
            totalDepreciationPerYear.map((npbt, index) => (
              <Text key={index} style={[stylesCOP.particularsCellsDetail, { fontWeight: "bold" }]}> 
                {npbt ? npbt.toLocaleString("en-IN") : "N/A"}
              </Text>
            ))
          ) : (
            <Text style={stylesCOP.particularsCellsDetail}>N/A</Text>
          )}
        </View>

       {/* total */}
       <View style={[styles.tableRow]}>
  <Text style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}></Text>
  <Text style={[stylesCOP.detailsCellDetail, styleExpenses.particularWidth]}>
  Total
  </Text>
  {netProfitBeforeTax.length > 0 && totalDepreciationPerYear.length > 0 ? (
    netProfitBeforeTax.map((npbt, index) => (
      <Text key={index} style={[stylesCOP.particularsCellsDetail,styles.boldText]}> 
        {(npbt + (totalDepreciationPerYear[index] || 0)).toLocaleString("en-IN")}
      </Text>
    ))
  ) : (
    <Text style={stylesCOP.particularsCellsDetail}>N/A</Text>
  )}
       </View>

       <View style={[styles.tableRow]}>
          <Text style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}>Less</Text>
          <Text style={[stylesCOP.detailsCellDetail, styleExpenses.particularWidth]}>
            Depreciation(As per ITA , 1961)
          </Text>
          {totalDepreciationPerYear.length > 0 ? (
            totalDepreciationPerYear.map((npbt, index) => (
              <Text key={index} style={[stylesCOP.particularsCellsDetail, { fontWeight: "bold" }]}> 
                {npbt ? npbt.toLocaleString("en-IN") : "N/A"}
              </Text>
            ))
          ) : (
            <Text style={stylesCOP.particularsCellsDetail}>N/A</Text>
          )}
        </View>

        <View style={[styles.tableRow, styles.table]}>
          <Text style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}></Text>
          <Text style={[stylesCOP.detailsCellDetail, styleExpenses.particularWidth]}>
            Net Profit (/loss)
          </Text>
          {netProfitBeforeTax.length > 0 ? (
            netProfitBeforeTax.map((npbt, index) => (
              <Text key={index} style={[stylesCOP.particularsCellsDetail,styles.boldText]}> 
                {npbt ? npbt.toLocaleString("en-IN") : "N/A"}
              </Text>
            ))
          ) : (
            <Text style={stylesCOP.particularsCellsDetail}>N/A</Text>
          )}
        </View>

        <View style={[styles.tableRow]} >
          <Text style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}></Text>
          <Text style={[stylesCOP.detailsCellDetail, styleExpenses.particularWidth]}>
          Taxable Profit 
          </Text>
          {netProfitBeforeTax.length > 0 ? (
            netProfitBeforeTax.map((npbt, index) => (
              <Text key={index} style={[stylesCOP.particularsCellsDetail, { fontWeight: "bold" }]}> 
                {npbt ? npbt.toLocaleString("en-IN") : "N/A"}
              </Text>
            ))
          ) : (
            <Text style={stylesCOP.particularsCellsDetail}>N/A</Text>
          )}
        </View>

        {/* Tax at 30% */}
        <View style={[styles.tableRow]}>
          <Text style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}></Text>
          <Text style={[stylesCOP.detailsCellDetail, styleExpenses.particularWidth]}>Tax { rateOfInterest}%</Text>
          {incomeTax.length > 0 ? (
            incomeTax.map((tax, index) => (
              <Text key={index} style={[stylesCOP.particularsCellsDetail, { fontWeight: "bold" }]}> 
                {tax ? tax.toLocaleString("en-IN") : "N/A"}
              </Text>
            ))
          ) : (
            <Text style={stylesCOP.particularsCellsDetail}>N/A</Text>
          )}
        </View>
      </View>
      </View>
    </Page>
  );
};

export default IncomeTaxCalculation;
