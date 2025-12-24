import React, { useEffect } from "react";
import { Page, View, Text } from "@react-pdf/renderer";
import { styles, stylesCOP, stylesMOF, styleExpenses } from "./Styles";
import PDFHeader from "./HeaderFooter/PDFHeader";
import PDFFooter from "./HeaderFooter/PDFFooter";


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

  const isAdvancedLandscape = orientation === "advanced-landscape";
  let splitFinancialYearLabels = [financialYearLabels];
  if (isAdvancedLandscape) {
  // Remove first year if hidden
  const visibleLabels = hideFirstYear ? financialYearLabels.slice(1) : financialYearLabels;
  const totalCols = visibleLabels.length;
  const firstPageCols = Math.ceil(totalCols / 2);
  const secondPageCols = totalCols - firstPageCols;
  splitFinancialYearLabels = [
    visibleLabels.slice(0, firstPageCols),
    visibleLabels.slice(firstPageCols, firstPageCols + secondPageCols),
  ];
}
  const toRoman = (n) =>
    ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"][n] || n + 1;

  if (isAdvancedLandscape) {
    return splitFinancialYearLabels.map((labels, pageIdx) => {
      // labels is the page's array of financial year labels (subset of financialYearLabels)
      const pageStart =
        Math.max(0, financialYearLabels.indexOf(labels[0])) || 0;

      const globalIndex = (localIdx) => pageStart + localIdx;
      const shouldSkipCol = (gIdx) => hideFirstYear && gIdx === 0;

      // For centering the "Average Current Ratio" on the visible columns of this page
      const visibleLocalCols = labels
        .map((_, i) => i)
        .filter((i) => !shouldSkipCol(globalIndex(i)));
      const centerLocalIdx =
        visibleLocalCols[Math.floor(visibleLocalCols.length / 2)];

      return (
        <Page
          // size={projectionYears > 12 ? "A3" : "A4"}
          size="A4"
          orientation="landscape"
          style={styles.page}
        >
        
         <PDFHeader />

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
              <Text>
                Current Ratio
                {splitFinancialYearLabels.length > 1
                  ? ` (${toRoman(pageIdx)})`
                  : ""}
              </Text>
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

              {/* ✅ Dynamically generate year headers for THIS PAGE using labels */}
              {labels.map((yearLabel, localIdx) => {
                const gIdx = globalIndex(localIdx);
                if (shouldSkipCol(gIdx)) return null;
                return (
                  <Text
                    key={gIdx}
                    style={[styles.particularsCell, stylesCOP.boldText]}
                  >
                    {yearLabel}
                  </Text>
                );
              })}
            </View>

            <View style={[styles.table, { borderRightWidth: 0 }]}>
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
                {labels.map((_, localIdx) => {
                  const gIdx = globalIndex(localIdx);
                  if (shouldSkipCol(gIdx)) return null;
                  const tax =
                    receivedAssetsLiabilities?.CurrentAssetsArray?.[gIdx] || 0;
                  return (
                    <Text
                      key={`receivedAssetsLiabilities-CurrentAssetsArray-${gIdx}`}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                      ]}
                    >
                      {formatNumber(tax)} {/* Format the value */}
                    </Text>
                  );
                })}
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
                {labels.map((_, localIdx) => {
                  const gIdx = globalIndex(localIdx);
                  if (shouldSkipCol(gIdx)) return null;
                  const tax =
                    receivedAssetsLiabilities?.yearlycurrentLiabilities?.[
                      gIdx
                    ] || 0;
                  return (
                    <Text
                      key={`receivedAssetsLiabilities-yearlycurrentLiabilities-${gIdx}`}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                      ]}
                    >
                      {formatNumber(tax)} {/* Format the value */}
                    </Text>
                  );
                })}
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

                {/* ✅ Display Computed Total for Each Visible Year on THIS PAGE */}
                {labels.map((_, localIdx) => {
                  const gIdx = globalIndex(localIdx);
                  if (shouldSkipCol(gIdx)) return null;
                  const ratio = currentRatio?.[gIdx];
                  return (
                    <Text
                      key={`current-ratio-${gIdx}`}
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
                  );
                })}
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

                {labels.map((_, localIdx) => {
                  const gIdx = globalIndex(localIdx);
                  if (shouldSkipCol(gIdx)) return null;
                  const isCenter = localIdx === centerLocalIdx;
                  return (
                    <Text
                      key={gIdx}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                        {
                          fontWeight: "bold",
                          textAlign: "center",
                          borderWidth: 0,
                        },
                      ]}
                    >
                      {isCenter
                        ? averageCurrentRatio !== "-"
                          ? `${averageCurrentRatio}`
                          : "0"
                        : ""}
                    </Text>
                  );
                })}
              </View>
            </View>
          </View>

        <PDFFooter />
        </Page>
      );
    });
  }

  return (
    <Page
      // size={projectionYears > 12 ? "A3" : "A4"}
      size="A4"
      orientation={orientation}
      style={styles.page}
    >
      
     <PDFHeader />

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

        <View style={[styles.table, { borderRightWidth: 0 }]}>
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

            {financialYearLabels
              .slice(hideFirstYear ? 1 : 0) // ✅ Skip first year if receivedtotalRevenueReceipts[0] < 0
              .map((yearLabel, yearIndex, arr) => {
                const visibleLabels = financialYearLabels.slice(
                  hideFirstYear ? 1 : 0
                );
                const centerIndex = Math.floor(visibleLabels.length / 2); // ✅ Find center index
                const isLast = yearIndex === arr.length - 1;
                return (
                  <Text
                    key={yearIndex}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                      {
                        fontWeight: "bold",
                        textAlign: "center",
                        borderWidth: 0,
                        ...(isLast && { borderRightWidth: 1 }),
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

     <PDFFooter />
    </Page>
  );
};

export default React.memo(CurrentRatio);
