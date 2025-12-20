import React, { useEffect } from "react";
import { Page, View, Text } from "@react-pdf/renderer";
import { styles, stylesCOP, stylesMOF, styleExpenses } from "../PDFComponents/Styles";
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

const CheckRatio = ({
  formData = {},
  receivedAssetsLiabilities = [],
  sendAverageCurrentRation,
}) => {
  const projectionYears = formData?.ProjectReportSetting?.ProjectionYears || 5; // Default to 5 if undefined

  // ✅ Calculate Current Ratio and store in a variable
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

  return (
    <Page
      size={projectionYears > 12 ? "A3" : "A4"}
      orientation={projectionYears > 7 ? "landscape" : "portrait"}
      style={[{ padding: "20px", paddingVertical: "40px" }]}
      //   wrap={false}
      //   break
    >
      {/* businees name and financial year  */}
      <View>
        <Text style={styles.businessName}>
          {formData?.AccountInformation?.businessName || "Business Bame"}
        </Text>
        <Text style={styles.FinancialYear}>
          Financial Year{" "}
          {formData?.ProjectReportSetting?.FinancialYear || "financial year"}
        </Text>
      </View>

      <View>

    

        <View style={[styles.table]}>

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
            {currentRatio.map((ratio, yearIndex) => (
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
            ))}
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
                  fontWeight: "bold",
                  fontFamily: "Roboto",
                  textAlign: "center",
                  borderRightWidth: 0,
                },
              ]}
            >
              {averageCurrentRatio !== "-" ? `${averageCurrentRatio}` : "0"}
            </Text>
            {Array.from({ length: projectionYears - 1 }).map((_, yearIndex) => (
              <Text
                key={yearIndex}
                style={[
                  stylesCOP.particularsCellsDetail,
                  styleExpenses.fontSmall,
                  {
                    fontWeight: "bold",
                    fontFamily: "Roboto",
                    textAlign: "center",
                    borderWidth: "0px",
                  },
                ]}
              ></Text>
            ))}
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

export default React.memo(CheckRatio);
