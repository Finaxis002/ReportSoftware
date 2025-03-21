import React from "react";
import { Page, View, Text, Image } from "@react-pdf/renderer";
import { styles, stylesCOP, styleExpenses } from "./Styles";
import { Font } from "@react-pdf/renderer";
import SAWatermark from "../Assets/SAWatermark";
import CAWatermark from "../Assets/CAWatermark";

Font.register({
  family: "Roboto",
  fonts: [
    { src: "https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Me5Q.ttf" }, // Regular
    {
      src: "https://fonts.gstatic.com/s/roboto/v20/KFOlCnqEu92Fr1MmEU9vAw.ttf",
      fontWeight: "bold",
    },
  ],
});

const IncomeTaxCalculation = ({
  formData = {},
  netProfitBeforeTax = [],
  totalDepreciationPerYear = [],
  financialYearLabels,
  formatNumber,
  pdfType,
  receivedtotalRevenueReceipts,
}) => {
  if (!formData || typeof formData !== "object") {
    console.error("❌ Invalid formData provided");
    return null;
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
          npbt ? npbt * (rateOfInterest / 100) : "0.00"
        )
      : [];

  const hideFirstYear = receivedtotalRevenueReceipts?.[0] <= 0;

  return (
    <Page
      size={formData.ProjectReportSetting.ProjectionYears > 12 ? "A3" : "A4"}
      orientation={
        formData.ProjectReportSetting.ProjectionYears > 7
          ? "landscape"
          : "portrait"
      }
      style={[{ padding: "20px" }]}
    >
      {pdfType &&
        pdfType !== "select option" &&
        (pdfType === "Sharda Associates" || pdfType === "CA Certified") && (
          <View
            style={{
              position: "absolute",
              left: "50%", // Center horizontally
              top: "50%", // Center vertically
              width: 500, // Set width to 500px
              height: 700, // Set height to 700px
              marginLeft: -200, // Move left by half width (500/2)
              marginTop: -350, // Move up by half height (700/2)
              opacity: 0.4, // Light watermark
              zIndex: -1, // Push behind content
            }}
          >
            <Image
              src={pdfType === "Sharda Associates" ? SAWatermark : CAWatermark}
              style={{
                width: "100%",
                height: "100%",
              }}
            />
          </View>
        )}
      {/* businees name and financial year  */}
      <View>
        <Text style={styles.businessName}>
          {formData?.AccountInformation?.businessName || "Business Bame"}
        </Text>
        <Text style={styles.FinancialYear}>
          Financial Year{" "}
          {formData?.ProjectReportSetting?.FinancialYear
            ? `${formData.ProjectReportSetting.FinancialYear}-${(
                parseInt(formData.ProjectReportSetting.FinancialYear) + 1
              )
                .toString()
                .slice(-2)}`
            : "2025-26"}
        </Text>
      </View>

      {/* Amount format */}

      <View
        style={{
          display: "flex",
          alignContent: "flex-end",
          justifyContent: "flex-end",
          alignItems: "flex-end",
        }}
      >
        <Text style={[styles.AmountIn, styles.italicText]}>
          (Amount In{" "}
          {formData?.ProjectReportSetting?.AmountIn?.value === "rupees"
            ? "Rs" // ✅ Convert "rupees" to "Rs"
            : formData?.ProjectReportSetting?.AmountIn?.value}
          .)
        </Text>
      </View>
      <View style={[styleExpenses.paddingx]}>
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
                styleExpenses.fontBold,
                { paddingHorizontal: "5px", textAlign: "center" },
              ]}
            >
              S. No.
            </Text>
            <Text style={[styles.detailsCell, styleExpenses.particularWidth , styleExpenses.fontBold, {textAlign:"center"}]}>
              Particulars
            </Text>

            {/* Generate Dynamic Year Headers using financialYearLabels */}
            {financialYearLabels.map(
              (yearLabel, yearIndex) =>
                (!hideFirstYear || yearIndex !== 0) && (
                  <Text
                    key={yearIndex}
                    style={[styles.particularsCell, stylesCOP.boldText]}
                  >
                    {yearLabel}
                  </Text>
                )
            )}
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
              netProfitBeforeTax.map(
                (npbt, index) =>
                  (!hideFirstYear || index !== 0) && (
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
                      {npbt ? formatNumber(npbt) : "0"}
                    </Text>
                  )
              )
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
              totalDepreciationPerYear.map(
                (npbt, index) =>
                  (!hideFirstYear || index !== 0) && (
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
                      {npbt ? formatNumber(npbt) : "0"}
                    </Text>
                  )
              )
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
              netProfitBeforeTax.map(
                (npbt, index) =>
                  (!hideFirstYear || index !== 0) && (
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
                      {formatNumber(
                        npbt + (totalDepreciationPerYear[index] || 0)
                      )}
                    </Text>
                  )
              )
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
              totalDepreciationPerYear.map(
                (npbt, index) =>
                  (!hideFirstYear || index !== 0) && (
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
                        ? formatNumber(npbt) // ✅ Use the formatNumber function
                        : "0"}
                    </Text>
                  )
              )
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
              netProfitBeforeTax.map(
                (npbt, index) =>
                  (!hideFirstYear || index !== 0) && (
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
                        ? formatNumber(npbt) // ✅ Use the formatNumber function
                        : "0"}
                    </Text>
                  )
              )
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
              netProfitBeforeTax.map(
                (npbt, index) =>
                  (!hideFirstYear || index !== 0) && (
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
                        ? formatNumber(npbt) // ✅ Use the formatNumber function
                        : "0"}
                    </Text>
                  )
              )
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
              incomeTax.map(
                (tax, index) =>
                  (!hideFirstYear || index !== 0) && (
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
                  )
              )
            ) : (
              <Text style={stylesCOP.particularsCellsDetail}>0</Text>
            )}
          </View>
        </View>
      </View>
      {/* businees name and Client Name  */}
      <View
        style={[
          {
            display: "flex",
            flexDirection: "column",
            gap: "80px",
            alignItems: "flex-end",
            justifyContent: "flex-end",
            marginTop: "60px",
          },
        ]}
      >
        <Text style={[styles.businessName, { fontSize: "10px" }]}>
          {formData?.AccountInformation?.businessName || "Business Name"}
        </Text>
        <Text style={[styles.FinancialYear, { fontSize: "10px" }]}>
          {formData?.AccountInformation?.businessOwner || "businessOwner"}
        </Text>
      </View>
    </Page>
  );
};

export default React.memo(IncomeTaxCalculation);
