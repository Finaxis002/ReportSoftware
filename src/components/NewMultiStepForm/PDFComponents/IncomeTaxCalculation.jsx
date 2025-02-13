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

const IncomeTaxCalculation = ({
  formData = {},
  netProfitBeforeTax = [],
  totalDepreciationPerYear = [],
}) => {
  if (!formData || typeof formData !== "object") {
    console.error("❌ Invalid formData provided");
    return null; // Prevent rendering if formData is invalid
  }

  // Get starting year (assuming 2025, adjust based on your data)
  const startYear =
    Number(formData?.ProjectReportSetting?.FinancialYear) || 2025;
  const projectionYears =
    Number(formData?.ProjectReportSetting?.ProjectionYears) || 5;
  // Default to 5 years if not provided
  const rateOfInterest =
    Number(formData?.ProjectReportSetting?.rateOfInterest) || 5;

  // ✅ Compute Tax at 30% on Net Profit Before Tax
  const incomeTax =
    Array.isArray(netProfitBeforeTax) && netProfitBeforeTax.length > 0
      ? netProfitBeforeTax.map((npbt) =>
          npbt ? Math.round(npbt * (rateOfInterest / 100)) : "0.00"
        )
      : [];

  // const incomeTax1 = Array.isArray(netProfitBeforeTax) && netProfitBeforeTax.length > 0
  // ? netProfitBeforeTax.map((npbt) => (npbt ? npbt * 0.30 : 0))
  // : [];

  return (
    <Page
      size={formData.ProjectReportSetting.ProjectionYears > 12 ? "A3" : "A4"}
      orientation={
        formData.ProjectReportSetting.ProjectionYears > 7
          ? "landscape"
          : "portrait"
      }
    >
      <View style={[styleExpenses.paddingx]}>
        <Text style={[styles.clientName]}>
          {formData?.AccountInformation?.clientName || "N/A"}
        </Text>
        <View
          style={[stylesCOP.heading, { fontWeight: "bold", paddingLeft: 10 }]}
        >
          <Text>Income Tax Calculation</Text>
        </View>

        <View style={[styles.table]}>
          {/* table header  */}
          <View style={styles.tableHeader}>
            <Text
              style={[
                styles.serialNoCell,
                styleExpenses.sno,
                { paddingHorizontal: "20px", textAlign: "center" },
              ]}
            >
              S. No.
            </Text>
            <Text style={[styles.detailsCell, styleExpenses.particularWidth]}>
              Particulars
            </Text>

            {/* Dynamically generate years based on start year and projection years */}
            {Array.from({ length: projectionYears }).map((_, index) => (
              <Text key={index} style={styles.particularsCell}>
                {`${startYear + index}-${(startYear + index + 1) % 100}`}
              </Text>
            ))}
          </View>

          {/* Net Profit Before Tax */}
          <View style={[styles.tableRow]}>
            <Text
              style={[
                styles.serialNoCell,
                styleExpenses.sno,
                {
                  borderRight: "1px",
                  paddingHorizontal: "20px",
                  textAlign: "center",
                  paddingVertical: "10px",
                },
              ]}
            ></Text>
            <Text
              style={[
                stylesCOP.detailsCellDetail,
                styleExpenses.particularWidth,
                { paddingVertical: "10px" },
              ]}
            >
              Net Profit Before Tax
            </Text>
            {netProfitBeforeTax.length > 0 ? (
              netProfitBeforeTax.map((npbt, index) => (
                <Text
                  key={index}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styles.boldText,
                    {
                      fontSize: "9px",
                      fontFamily: "Roboto",
                      fontWeight: "bold",
                      paddingVertical: "10px",
                    },
                  ]}
                >
                  {npbt ? Math.round(npbt).toLocaleString("en-IN") : "N/A"}
                </Text>
              ))
            ) : (
              <Text style={stylesCOP.particularsCellsDetail}>N/A</Text>
            )}
          </View>

          {/* depreciation */}
          <View style={[styles.tableRow]}>
            <Text
              style={[
                styles.serialNoCell,
                styleExpenses.sno,
                {
                  borderRight: "1px",
                  paddingHorizontal: "20px",
                  textAlign: "center",
                },
              ]}
            ></Text>
            <Text
              style={[
                stylesCOP.detailsCellDetail,
                styleExpenses.particularWidth,
              ]}
            >
              Depreciation(WDA)
            </Text>
            {totalDepreciationPerYear.length > 0 ? (
              totalDepreciationPerYear.map((npbt, index) => (
                <Text
                  key={index}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    {
                      fontWeight: "light",
                      fontSize: "9px",
                      fontFamily: "Roboto",
                    },
                  ]}
                >
                  {npbt ? npbt.toLocaleString("en-IN") : "N/A"}
                </Text>
              ))
            ) : (
              <Text style={stylesCOP.particularsCellsDetail}>N/A</Text>
            )}
          </View>

          {/* total */}
          <View style={[styles.tableRow]}>
            <Text
              style={[
                styles.serialNoCell,
                styleExpenses.sno,
                {
                  borderRight: "1px",
                  paddingHorizontal: "20px",
                  textAlign: "center",
                },
              ]}
            ></Text>
            <Text
              style={[
                stylesCOP.detailsCellDetail,
                styleExpenses.particularWidth,
                { paddingVertical: "10px" },
              ]}
            >
              Total
            </Text>
            {netProfitBeforeTax.length > 0 &&
            totalDepreciationPerYear.length > 0 ? (
              netProfitBeforeTax.map((npbt, index) => (
                <Text
                  key={index}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styles.boldText,
                    {
                      fontSize: "9px",
                      paddingVertical: "10px",
                      borderTopWidth: "2px",
                      fontFamily: "Roboto",
                      fontWeight: "extrabold",
                    },
                  ]}
                >
                  {(
                    npbt + (totalDepreciationPerYear[index] || 0)
                  ).toLocaleString("en-IN")}
                </Text>
              ))
            ) : (
              <Text style={stylesCOP.particularsCellsDetail}>N/A</Text>
            )}
          </View>

          {/* depreciation (As per ITA , 1961)*/}
          <View style={[styles.tableRow]}>
            <Text
              style={[
                styles.serialNoCell,
                styleExpenses.sno,
                {
                  borderRight: "1px",
                  paddingHorizontal: "20px",
                  textAlign: "center",
                  paddingVertical:"5px"
                },
              ]}
            >
              Less
            </Text>
            <Text
              style={[
                stylesCOP.detailsCellDetail,
                styleExpenses.particularWidth,
                {paddingVertical:"5px"}
              ]}
            >
              Depreciation(As per ITA , 1961)
            </Text>
            {totalDepreciationPerYear.length > 0 ? (
              totalDepreciationPerYear.map((npbt, index) => (
                <Text
                  key={index}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    { fontWeight: "bold", fontSize: "9px",paddingVertical:"5px"},
                  ]}
                >
                  {npbt ? npbt.toLocaleString("en-IN") : "N/A"}
                </Text>
              ))
            ) : (
              <Text style={stylesCOP.particularsCellsDetail}>N/A</Text>
            )}
          </View>

          {/* Net Profit (/loss) */}
          <View style={[styles.tableRow, styles.table]}>
            <Text
              style={[
                styles.serialNoCell,
                styleExpenses.sno,
                {
                  borderRight: "1px",
                  paddingHorizontal: "20px",
                  textAlign: "center",
                  paddingVertical:"8px"
                },
              ]}
            ></Text>
            <Text
              style={[
                stylesCOP.detailsCellDetail,
                styleExpenses.particularWidth,
                {paddingVertical:"8px"}
              ]}
            >
              Net Profit (/loss)
            </Text>
            {netProfitBeforeTax.length > 0 ? (
              netProfitBeforeTax.map((npbt, index) => (
                <Text
                  key={index}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styles.boldText,
                    { fontSize: "9px" , borderTopWidth:"2px", borderBottomWidth:"2px",fontFamily:"Roboto", fontWeight:"extrabold", paddingVertical:"8px"},
                  ]}
                >
                  {npbt ? npbt.toLocaleString("en-IN") : "N/A"}
                </Text>
              ))
            ) : (
              <Text style={stylesCOP.particularsCellsDetail}>N/A</Text>
            )}
          </View>

            
          {/* Taxable Profit */}
          <View style={[styles.tableRow]}>
            <Text
              style={[
                styles.serialNoCell,
                styleExpenses.sno,
                {
                  borderRight: "1px",
                  paddingHorizontal: "20px",
                  textAlign: "center",
                },
              ]}
            ></Text>
            <Text
              style={[
                stylesCOP.detailsCellDetail,
                styleExpenses.particularWidth,
                {paddingVertical:"8px"}
              ]}
            >
              Taxable Profit
            </Text>
            {netProfitBeforeTax.length > 0 ? (
              netProfitBeforeTax.map((npbt, index) => (
                <Text
                  key={index}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    {
                      
                      fontSize: "9px",
                    
                      paddingVertical:"8px"
                    },
                  ]}
                >
                  {npbt ? npbt.toLocaleString("en-IN") : "N/A"}
                </Text>
              ))
            ) : (
              <Text style={stylesCOP.particularsCellsDetail}>N/A</Text>
            )}
          </View>

          {/* Tax at 30% */}
          <View style={[styles.tableRow]}>
            <Text
              style={[
                styles.serialNoCell,
                styleExpenses.sno,
                {
                  borderRight: "1px",
                  paddingHorizontal: "20px",
                  textAlign: "center",
                },
              ]}
            ></Text>
            <Text
              style={[
                stylesCOP.detailsCellDetail,
                styleExpenses.particularWidth,
                {paddingVertical:"8px"}
              ]}
            >
              Tax {rateOfInterest}%
            </Text>
            {incomeTax.length > 0 ? (
              incomeTax.map((tax, index) => (
                <Text
                  key={index}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    {
                     
                      fontSize: "9px",
                     
                      paddingVertical:"8px"
                    },
                  ]}
                >
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
