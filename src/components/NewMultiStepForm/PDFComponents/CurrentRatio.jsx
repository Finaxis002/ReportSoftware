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
  sendCurrentRatio,
  orientation,
}) => {
  //   console.log("received values", receivedAssetsLiabilities);
  // ✅ Safely handle undefined formData and provide fallback
  const projectionYears = formData?.ProjectReportSetting?.ProjectionYears || 5; // Default to 5 if undefined
  const hideFirstYear = receivedtotalRevenueReceipts?.[0] <= 0;
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
    let validRatios = currentRatio
      .filter((r) => r !== "-" && !isNaN(parseFloat(r)))
      .map((r) => parseFloat(r));
  
    // ✅ Remove the first year's value if it's hidden
    if (hideFirstYear) {
      validRatios = validRatios.slice(1); // Remove first index
    }
  
    // ✅ If there are no valid ratios left, return "-"
    if (validRatios.length === 0) {
      return "-";
    }
  
    // ✅ Calculate the average of valid ratios
    const total = validRatios.reduce((sum, value) => sum + value, 0);
    const average = (total / validRatios.length).toFixed(2);
  
    return average;
  })();
  

  useEffect(() => {
    if (averageCurrentRatio !== "-") {
      sendAverageCurrentRation((prev) => ({
        ...prev,
        averageCurrentRatio,
      }));
    }
  }, [averageCurrentRatio]);
  


  useEffect(() => {
    if (currentRatio.length > 0) {
      sendCurrentRatio((prev) => ({
        ...prev,
        currentRatio,
      }));
    }
  }, [JSON.stringify(currentRatio)]);

  // const orientation =
  // hideFirstYear
  //   ? (formData.ProjectReportSetting.ProjectionYears > 6 ? "landscape" : "portrait")
  //   : (formData.ProjectReportSetting.ProjectionYears > 5 ? "landscape" : "portrait");

  return (
    <Page
      size={projectionYears > 12 ? "A3" : "A4"}
      orientation={orientation}
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
          {
            formData?.ProjectReportSetting?.AmountIn === "rupees"
              ? "Rs." // Show "Rupees" if "rupees" is selected
              : formData?.ProjectReportSetting?.AmountIn === "thousand"
              ? "Thousands" // Show "Thousands" if "thousand" is selected
              : formData?.ProjectReportSetting?.AmountIn === "lakhs"
              ? "Lakhs" // Show "Lakhs" if "lakhs" is selected
              : formData?.ProjectReportSetting?.AmountIn === "crores"
              ? "Crores" // Show "Crores" if "crores" is selected
              : formData?.ProjectReportSetting?.AmountIn === "millions"
              ? "Millions" // Show "Millions" if "millions" is selected
              : "" // Default case, in case the value is not found (you can add a fallback text here if needed)
          }
          )
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
              styleExpenses.fontBold,
              { textAlign: "center" },
            ]}
          >
            S. No.
          </Text>
          <Text
            style={[
              styles.detailsCell,
              styleExpenses.particularWidth,
              styleExpenses.fontBold,
              { textAlign: "center" },
            ]}
          >
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
                { fontWeight: "bold" },
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
                { fontWeight: "bold", fontSize: "10px" },
              ]}
            >
              Average Current Ratio
            </Text>

            {/* ✅ Display the Average Current Ratio in JSX */}
            {/* <Text
              style={[
                stylesCOP.particularsCellsDetail,
                styleExpenses.fontSmall,
                {
                  width: `${financialYearLabels.length * 210}px`, // ✅ Adjust width dynamically
                  fontWeight: "bold",
                  ,
                  textAlign: "center",
                  borderRightWidth: 0,
                  fontSize: "10px",
                },
              ]}
            >
              {averageCurrentRatio !== "-" ? `${averageCurrentRatio}` : "0"}
            </Text> */}

            {financialYearLabels
              .slice(hideFirstYear ? 1 : 0) // ✅ Skip first year if receivedtotalRevenueReceipts[0] < 0
              .map((yearLabel, yearIndex) => {
                const visibleLabels = financialYearLabels.slice(
                  hideFirstYear ? 1 : 0
                );
                const centerIndex = Math.floor(visibleLabels.length / 2); // ✅ Find center index

                return (
                  <Text
                    key={yearIndex}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                      {
                        fontWeight: "bold",

                        textAlign: "center",
                        borderLeftWidth: 0,
                        borderRightWidth: 0,
                      },
                    ]}
                  >
                    {yearIndex === centerIndex
                      ? averageCurrentRatio !== "-"
                        ? `${averageCurrentRatio}`
                        : "0"
                      : ""}{" "}
                    {/* ✅ Display only in the center */}
                  </Text>
                );
              })}
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

export default React.memo(CurrentRatio);
