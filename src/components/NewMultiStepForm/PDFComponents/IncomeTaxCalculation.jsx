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
  financialYearLabels
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
  const rateOfInterest = Number(formData?.ProjectReportSetting?.incomeTax) || 0;

  // ✅ Compute Tax at 30% on Net Profit Before Tax
  const incomeTax =
    Array.isArray(netProfitBeforeTax) && netProfitBeforeTax.length > 0
      ? netProfitBeforeTax.map((npbt) =>
          npbt ? Math.round(npbt * (rateOfInterest / 100)) : "0.00"
        )
      : [];

  // const formatNumber = (value) => {
  //   const formatType = formData?.ProjectReportSetting?.Format || "1"; // Default to Indian Format

  //   if (value === undefined || value === null || isNaN(value)) return "0"; // ✅ Handle invalid values

  //   switch (formatType) {
  //     case "1": // Indian Format (1,23,456)
  //       return new Intl.NumberFormat("en-IN").format(value);

  //     case "2": // USD Format (1,123,456)
  //       return new Intl.NumberFormat("en-US").format(value);

  //     case "3": // Generic Format (Same as Indian for now)
  //       return new Intl.NumberFormat("en-IN").format(value);

  //     default:
  //       return new Intl.NumberFormat("en-IN").format(value); // ✅ Safe default
  //   }
  // };

   // ✅ Format number with check for negative values
   const formatNumber = (value) => {
    const formatType = formData?.ProjectReportSetting?.Format || "1"; // Default to Indian Format

    if (value === undefined || value === null || isNaN(value)) return "0"; // ✅ Handle invalid values

    // Check for negative values, return 0 if less than 0
    const formattedValue = value < 0 ? 0 : value;

    switch (formatType) {
      case "1": // Indian Format (1,23,456)
        return new Intl.NumberFormat("en-IN").format(formattedValue);

      case "2": // USD Format (1,123,456)
        return new Intl.NumberFormat("en-US").format(formattedValue);

      case "3": // Generic Format (Same as Indian for now)
        return new Intl.NumberFormat("en-IN").format(formattedValue);

      default:
        return new Intl.NumberFormat("en-IN").format(formattedValue); // ✅ Safe default
    }
  };

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
          {formData?.AccountInformation?.clientName || "0"}
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

            {/* Generate Dynamic Year Headers using financialYearLabels */}
            {financialYearLabels.map((yearLabel, yearIndex) => (
              <Text
                key={yearIndex}
                style={[styles.particularsCell, stylesCOP.boldText]}
              >
                {yearLabel}
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
                  {npbt
                    ? formatNumber(Math.round(npbt)) // ✅ Use the formatNumber function
                    : "0"}
                </Text>
              ))
            ) : (
              <Text style={stylesCOP.particularsCellsDetail}>0</Text>
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
                  {npbt
                    ? formatNumber(Math.round(npbt)) // ✅ Use the formatNumber function
                    : "0"}
                </Text>
              ))
            ) : (
              <Text style={stylesCOP.particularsCellsDetail}>0</Text>
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
                 {formatNumber(npbt + (totalDepreciationPerYear[index] || 0))}
                </Text>
              ))
            ) : (
              <Text style={stylesCOP.particularsCellsDetail}>0</Text>
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
                  paddingVertical: "5px",
                },
              ]}
            >
              Less
            </Text>
            <Text
              style={[
                stylesCOP.detailsCellDetail,
                styleExpenses.particularWidth,
                { paddingVertical: "5px" },
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
                    {
                      fontWeight: "bold",
                      fontSize: "9px",
                      paddingVertical: "5px",
                    },
                  ]}
                >
                  {npbt
                    ? formatNumber(Math.round(npbt)) // ✅ Use the formatNumber function
                    : "0"}
                </Text>
              ))
            ) : (
              <Text style={stylesCOP.particularsCellsDetail}>0</Text>
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
                  paddingVertical: "8px",
                },
              ]}
            ></Text>
            <Text
              style={[
                stylesCOP.detailsCellDetail,
                styleExpenses.particularWidth,
                { paddingVertical: "8px" },
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
                    {
                      fontSize: "9px",
                      borderTopWidth: "2px",
                      borderBottomWidth: "2px",
                      fontFamily: "Roboto",
                      fontWeight: "extrabold",
                      paddingVertical: "8px",
                    },
                  ]}
                >
                  {npbt
                    ? formatNumber(Math.round(npbt)) // ✅ Use the formatNumber function
                    : "0"}
                </Text>
              ))
            ) : (
              <Text style={stylesCOP.particularsCellsDetail}>0</Text>
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
                { paddingVertical: "8px" },
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

                      paddingVertical: "8px",
                    },
                  ]}
                >
                  {npbt
                    ? formatNumber(Math.round(npbt)) // ✅ Use the formatNumber function
                    : "0"}
                </Text>
              ))
            ) : (
              <Text style={stylesCOP.particularsCellsDetail}>0</Text>
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
                { paddingVertical: "8px" },
              ]}
            >
              Tax {formData.ProjectReportSetting.incomeTax}%
            </Text>
            {incomeTax.length > 0 ? (
              incomeTax.map((tax, index) => (
                <Text
                  key={index}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    {
                      fontSize: "9px",

                      paddingVertical: "8px",
                    },
                  ]}
                >
                  {tax ? formatNumber(tax) : "0"}
                </Text>
              ))
            ) : (
              <Text style={stylesCOP.particularsCellsDetail}>0</Text>
            )}
          </View>
        </View>
      </View>
    </Page>
  );
};

export default IncomeTaxCalculation;
