import React, { useMemo, useEffect } from "react";
import { Page, View, Text, Image } from "@react-pdf/renderer";
import { styles, stylesCOP, stylesMOF, styleExpenses } from "./Styles";
import { Font } from "@react-pdf/renderer";
import SAWatermark from "../Assets/SAWatermark";
import CAWatermark from "../Assets/CAWatermark";

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

const CurrentRatio = ({
  formData = {},
  financialYearLabels = [],
  receivedAssetsLiabilities = [],
  formatNumber,
  sendAverageCurrentRation,
  pdfType,
  receivedtotalRevenueReceipts,
}) => {
  //   console.log("received values", receivedAssetsLiabilities);
  // ✅ Safely handle undefined formData and provide fallback
  const projectionYears = formData?.ProjectReportSetting?.ProjectionYears || 5; // Default to 5 if undefined

  const currentRatio = Array.from({
    length: receivedAssetsLiabilities?.CurrentAssetsArray?.length || 0,
  }).map((_, index) => {
    const currentAssets =
      receivedAssetsLiabilities?.CurrentAssetsArray?.[index] || 0;
    const currentLiabilities =
      receivedAssetsLiabilities?.yearlycurrentLiabilities?.[index] || 0;

    // ✅ Handle division by zero and format to 2 decimal places
    return currentLiabilities === 0
      ? "-"
      : (currentAssets / currentLiabilities).toFixed(2);
  });

  // ✅ Calculate Average Current Ratio (Excluding Leading Zeros and Values ≤ 1)
  const averageCurrentRatio = (() => {
    // Filter out invalid ratios and convert valid ones to numbers
    const validRatios = currentRatio
      .filter((r) => r !== "-" && !isNaN(parseFloat(r))) // Filter out invalid values
      .map((r) => parseFloat(r)); // Convert to numeric values

    // ✅ Exclude leading values ≤ 1
    const firstValidIndex = validRatios.findIndex((value) => value > 1);
    const nonZeroRatios = validRatios.slice(firstValidIndex);

    // ✅ If there are no valid ratios left, return "-"
    if (nonZeroRatios.length === 0) {
      return "-";
    }

    // ✅ Calculate the total of valid non-zero ratios
    const total = nonZeroRatios.reduce((sum, value) => sum + value, 0);

    // ✅ Return the average rounded to 2 decimal places
    const average = (total / nonZeroRatios.length).toFixed(2);

    return average;
  })();

  useEffect(() => {
    if (averageCurrentRatio.length > 0) {
      sendAverageCurrentRation((prev) => ({
        ...prev,
        averageCurrentRatio,
      }));
    }
    // console.log("sending average current ratio : ", averageCurrentRatio)
  }, [JSON.stringify(averageCurrentRatio)]);
  const hideFirstYear = receivedtotalRevenueReceipts?.[0] <= 0;

  return (
    <Page
      size={projectionYears > 12 ? "A3" : "A4"}
      orientation={projectionYears > 7 ? "landscape" : "portrait"}
      style={[{ padding: "20px", paddingVertical: "40px" }]}
      //   wrap={false}
      //   break
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

      <View>
        {/* Table Heading */}
        <View
          style={[
            stylesCOP.heading,
            {
              fontWeight: "bold",
              paddingLeft: 10,
            },
          ]}
        >
          <Text>Current Ratio</Text>
        </View>

        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text
            style={[
              styles.serialNoCell,
              styleExpenses.sno,
              { textAlign: "center" },
            ]}
          >
            S. No.
          </Text>
          <Text style={[styles.detailsCell, styleExpenses.particularWidth]}>
            Particulars
          </Text>

          {/* ✅ Dynamically generate years with fallback */}
          {financialYearLabels
            .slice(hideFirstYear ? 1 : 0) // ✅ Skip first year if receivedtotalRevenueReceipts[0] < 0
            .map((yearLabel, yearIndex) => (
              <Text
                key={yearIndex}
                style={[styles.particularsCell, stylesCOP.boldText]}
              >
                {yearLabel}
              </Text>
            ))}
        </View>

        <View style={[styles.table]}>
          {/* currect Assets  */}
          <View style={styles.tableRow}>
            <Text style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}>
              1
            </Text>
            <Text
              style={[
                stylesCOP.detailsCellDetail,
                styleExpenses.particularWidth,
                styleExpenses.bordernone,
              ]}
            >
              Current Assets
            </Text>
            {Array.isArray(receivedAssetsLiabilities?.CurrentAssetsArray) &&
              receivedAssetsLiabilities.CurrentAssetsArray.map(
                (tax, yearIndex) =>
                  (!hideFirstYear || yearIndex !== 0) && (
                    <Text
                      key={`receivedAssetsLiabilities-CurrentAssetsArray-${yearIndex}`}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                      ]}
                    >
                      {formatNumber(tax || 0)}{" "}
                      {/* Format the value and handle undefined/null */}
                    </Text>
                  )
              )}
          </View>

          {/* Current Liabilities  */}
          <View style={styles.tableRow}>
            <Text
              style={[
                stylesCOP.serialNoCellDetail,
                styleExpenses.sno,
                styleExpenses.bordernone,
              ]}
            >
              2
            </Text>
            <Text
              style={[
                stylesCOP.detailsCellDetail,
                styleExpenses.particularWidth,
                styleExpenses.bordernone,
              ]}
            >
              Current Liabilities
            </Text>
            {Array.isArray(
              receivedAssetsLiabilities?.yearlycurrentLiabilities
            ) &&
              receivedAssetsLiabilities.yearlycurrentLiabilities.map(
                (tax, yearIndex) =>
                  (!hideFirstYear || yearIndex !== 0) && (
                    <Text
                      key={`receivedAssetsLiabilities-yearlycurrentLiabilities-${yearIndex}`}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                      ]}
                    >
                      {formatNumber(tax || 0)}{" "}
                      {/* Format the value and handle undefined/null */}
                    </Text>
                  )
              )}
          </View>

          {/* Ratio  */}
          <View
            style={[stylesMOF.row, styles.tableRow, styleExpenses.totalRow]}
          >
            <Text
              style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}
            ></Text>
            <Text
              style={[
                stylesCOP.detailsCellDetail,
                styleExpenses.particularWidth,
                styleExpenses.bordernone,
                { fontWeight: "bold", fontFamily: "Roboto" },
              ]}
            >
              Current Ratio
            </Text>

            {/* ✅ Display Computed Total for Each Year */}
            {currentRatio.map(
              (ratio, yearIndex) =>
                (!hideFirstYear || yearIndex !== 0) && (
                  <Text
                    key={`current-ratio-${yearIndex}`}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                      {
                        fontWeight: "bold",
                        fontFamily: "Roboto",
                        textAlign: "center",
                      },
                    ]}
                  >
                    {ratio !== "-" ? ratio : "0"}
                  </Text>
                )
            )}
          </View>

          {/* Average Current Ratio */}
          <View
            style={[stylesMOF.row, styles.tableRow, styleExpenses.totalRow]}
          >
            <Text
              style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}
            ></Text>
            <Text
              style={[
                stylesCOP.detailsCellDetail,
                styleExpenses.particularWidth,
                styleExpenses.bordernone,
                { fontWeight: "bold", fontFamily: "Roboto" },
              ]}
            >
              Average Current Ratio
            </Text>

            {/* ✅ Display the Average Current Ratio in JSX */}
            <Text
              style={[
                stylesCOP.particularsCellsDetail,
                styleExpenses.fontSmall,
                {
                  width: `${financialYearLabels.length * 210}px`, // ✅ Adjust width dynamically
                  fontWeight: "bold",
                  fontFamily: "Roboto",
                  textAlign: "center",
                  borderRightWidth: 0,
                  fontSize: "12px",
                },
              ]}
            >
              {averageCurrentRatio !== "-" ? `${averageCurrentRatio}` : "0"}
            </Text>
          </View>
        </View>
      </View>

      {/* businees name and Client Name  */}
      <View
        style={[
          {
            display: "flex",
            flexDirection: "column",
            gap: "30px",
            alignItems: "flex-end",
            justifyContent: "flex-end",
            marginTop: "60px",
          },
        ]}
      >
        <Text style={[styles.businessName, { fontSize: "14px" }]}>
          {formData?.AccountInformation?.businessName || "Business Name"}
        </Text>
        <Text style={styles.FinancialYear}>
          {formData?.AccountInformation?.clientName || "Client Name"}
        </Text>
      </View>
    </Page>
  );
};

export default React.memo(CurrentRatio);
