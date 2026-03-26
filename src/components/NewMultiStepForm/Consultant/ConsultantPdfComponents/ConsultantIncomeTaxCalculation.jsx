import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { styles, stylesCOP, styleExpenses } from "./Styles";
import { Font } from "@react-pdf/renderer";
import PageWithFooter from "../../Helpers/PageWithFooter";

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

const ConsultantIncomeTaxCalculation = ({
  formData = {},
  netProfitBeforeTax = [],
  totalDepreciationPerYear = [],
  financialYearLabels,
  formatNumber,
  receivedtotalRevenueReceipts,
  orientation,
}) => {
  if (!formData || typeof formData !== "object") {
    console.error("❌ Invalid formData provided");
    return null;
  }


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
  const toRoman = n => ["I","II","III","IV","V","VI","VII","VIII","IX","X"][n] || (n+1);


 if (isAdvancedLandscape) {
  return splitFinancialYearLabels.map((labels, pageIdx) => {
    // labels is the page's array of financial year labels (subset of financialYearLabels)
    const pageStart =
      Math.max(0, financialYearLabels.indexOf(labels[0])) || 0;

    const globalIndex = (localIdx) => pageStart + localIdx;
    const shouldSkipCol = (gIdx) => hideFirstYear && gIdx === 0;

    return (
      <PageWithFooter
        // size={formData.ProjectReportSetting.ProjectionYears > 12 ? "A3" : "A4"}
        size="A4"
        orientation="landscape"
        style={styles.page}
        wrap
        break
      >
        <View style={[styleExpenses.paddingx, { paddingBottom: "30px" }]}>
          {/* businees name and financial year  */}
          <View>
            <Text style={styles.businessName}>
              {formData?.AccountInformation?.businessName || "Business Name"}
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

          {/* <View
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
          </View> */}
          <View>
            <View style={stylesCOP.heading}>
              <Text>Income Tax Calculation
              {splitFinancialYearLabels.length > 1 ? ` (${toRoman(pageIdx)})` : ""}
            </Text>
            </View>

            <View style={[styles.table]}>
              {/* table header  */}
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

                {/* Generate Dynamic Year Headers using current page labels */}
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

              {/* Net Profit Before Tax */}
              <View style={[styles.tableRow]}>
                <Text style={stylesCOP.serialNoCellDetail}></Text>
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
                  labels.map((_, localIdx) => {
                    const gIdx = globalIndex(localIdx);
                    if (shouldSkipCol(gIdx)) return null;
                    const npbt = netProfitBeforeTax[gIdx];
                    return (
                      <Text
                        key={gIdx}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styles.boldText,
                          {
                            fontSize: "9px",

                            fontWeight: "bold",
                            paddingVertical: "10px",
                          },
                        ]}
                      >
                        {npbt ? formatNumber(npbt) : "0"}
                      </Text>
                    );
                  })
                ) : (
                  labels.map((_, localIdx) => {
                    const gIdx = globalIndex(localIdx);
                    if (shouldSkipCol(gIdx)) return null;
                    return (
                      <Text key={gIdx} style={stylesCOP.particularsCellsDetail}>
                        0
                      </Text>
                    );
                  })
                )}
              </View>

              {/* depreciation */}
              <View style={[styles.tableRow]}>
                <Text style={stylesCOP.serialNoCellDetail}>Add</Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                  ]}
                >
                  Depreciation(WDA)
                </Text>
                {totalDepreciationPerYear.length > 0 ? (
                  labels.map((_, localIdx) => {
                    const gIdx = globalIndex(localIdx);
                    if (shouldSkipCol(gIdx)) return null;
                    const npbt = totalDepreciationPerYear[gIdx];
                    return (
                      <Text
                        key={gIdx}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          {
                            fontWeight: "light",
                            fontSize: "9px",
                          },
                        ]}
                      >
                        {npbt ? formatNumber(npbt) : "0"}
                      </Text>
                    );
                  })
                ) : (
                  labels.map((_, localIdx) => {
                    const gIdx = globalIndex(localIdx);
                    if (shouldSkipCol(gIdx)) return null;
                    return (
                      <Text key={gIdx} style={stylesCOP.particularsCellsDetail}>
                        0
                      </Text>
                    );
                  })
                )}
              </View>

              {/* total */}
              <View style={[styles.tableRow]}>
                <Text style={stylesCOP.serialNoCellDetail}></Text>
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
                  labels.map((_, localIdx) => {
                    const gIdx = globalIndex(localIdx);
                    if (shouldSkipCol(gIdx)) return null;
                    const npbt = netProfitBeforeTax[gIdx] || 0;
                    const dep = totalDepreciationPerYear[gIdx] || 0;
                    return (
                      <Text
                        key={gIdx}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styles.boldText,
                          {
                            fontSize: "9px",
                            paddingVertical: "10px",
                            
                          },
                        ]}
                      >
                        {formatNumber(npbt + dep)}
                      </Text>
                    );
                  })
                ) : (
                  labels.map((_, localIdx) => {
                    const gIdx = globalIndex(localIdx);
                    if (shouldSkipCol(gIdx)) return null;
                    return (
                      <Text key={gIdx} style={stylesCOP.particularsCellsDetail}>
                        0
                      </Text>
                    );
                  })
                )}
              </View>

              {/* depreciation (As per ITA , 1961)*/}
              <View style={[styles.tableRow]}>
                <Text style={stylesCOP.serialNoCellDetail}>Less</Text>
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
                  labels.map((_, localIdx) => {
                    const gIdx = globalIndex(localIdx);
                    if (shouldSkipCol(gIdx)) return null;
                    const npbt = totalDepreciationPerYear[gIdx];
                    return (
                      <Text
                        key={gIdx}
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
                    );
                  })
                ) : (
                  labels.map((_, localIdx) => {
                    const gIdx = globalIndex(localIdx);
                    if (shouldSkipCol(gIdx)) return null;
                    return (
                      <Text key={gIdx} style={stylesCOP.particularsCellsDetail}>
                        0
                      </Text>
                    );
                  })
                )}
              </View>

              {/* Net Profit (/loss) */}
              <View style={[styles.tableRow]}>
                <Text style={stylesCOP.serialNoCellDetail}></Text>
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
                  labels.map((_, localIdx) => {
                    const gIdx = globalIndex(localIdx);
                    if (shouldSkipCol(gIdx)) return null;
                    const npbt = netProfitBeforeTax[gIdx];
                    return (
                      <Text
                        key={gIdx}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styles.boldText,
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
                    );
                  })
                ) : (
                  labels.map((_, localIdx) => {
                    const gIdx = globalIndex(localIdx);
                    if (shouldSkipCol(gIdx)) return null;
                    return (
                      <Text key={gIdx} style={stylesCOP.particularsCellsDetail}>
                        0
                      </Text>
                    );
                  })
                )}
              </View>

              {/* Taxable Profit */}
              <View style={[styles.tableRow]}>
                <Text style={stylesCOP.serialNoCellDetail}></Text>
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
                  labels.map((_, localIdx) => {
                    const gIdx = globalIndex(localIdx);
                    if (shouldSkipCol(gIdx)) return null;
                    const npbt = netProfitBeforeTax[gIdx];
                    return (
                      <Text
                        key={gIdx}
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
                    );
                  })
                ) : (
                  labels.map((_, localIdx) => {
                    const gIdx = globalIndex(localIdx);
                    if (shouldSkipCol(gIdx)) return null;
                    return (
                      <Text key={gIdx} style={stylesCOP.particularsCellsDetail}>
                        0
                      </Text>
                    );
                  })
                )}
              </View>

              {/* Tax at 30% */}
              <View style={[styles.tableRow]}>
                <Text style={stylesCOP.serialNoCellDetail}></Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    { paddingVertical: "8px" },
                  ]}
                >
                  Tax {formData.ProjectReportSetting.incomeTax}%
                </Text>
                {/* {incomeTax.length > 0 ? (
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
            )} */}
                {incomeTax.length > 0 ? (
                  labels.map((_, localIdx) => {
                    const gIdx = globalIndex(localIdx);
                    if (shouldSkipCol(gIdx)) return null;

                    // Corresponding Net Profit Before Tax (NPBT) for this year
                    const npbt = netProfitBeforeTax[gIdx]; // Get NPBT for the current index
                    const tax = incomeTax[gIdx];

                    // If NPBT is negative, set the tax to zero
                    const taxAmount = npbt < 0 ? 0 : tax; // Set tax to 0 if NPBT is negative

                    return (
                      <Text
                        key={gIdx}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          {
                            fontSize: "9px",
                            paddingVertical: "8px",
                          },
                        ]}
                      >
                        {taxAmount ? formatNumber(taxAmount) : "0"}{" "}
                        {/* Display calculated tax or "0" if NPBT is negative */}
                      </Text>
                    );
                  })
                ) : (
                  labels.map((_, localIdx) => {
                    const gIdx = globalIndex(localIdx);
                    if (shouldSkipCol(gIdx)) return null;
                    return (
                      <Text key={gIdx} style={stylesCOP.particularsCellsDetail}>
                        0
                      </Text>
                    );
                  })
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
                marginBottom: "5px",
              },
            ]}
          >
            <Text style={[styles.businessName, { fontSize: "10px" }]}>
              {formData?.AccountInformation?.businessName || "Business Name"}
            </Text>
            <Text
              style={[
                styles.FinancialYear,
                { fontSize: "10px", marginBottom: 0 },
              ]}
            >
              {formData?.AccountInformation?.businessOwner || "businessOwner"}
            </Text>
          </View>
        </View>
      </PageWithFooter>
    );
  });
}


  return (
    <PageWithFooter
      // size={formData.ProjectReportSetting.ProjectionYears > 12 ? "A3" : "A4"}
      size="A4"
      orientation={orientation}
      style={styles.page}
      wrap
      break
    >
     
      <View style={[styleExpenses.paddingx, { paddingBottom: "30px" }]}>
        {/* businees name and financial year  */}
        <View>
          <Text style={styles.businessName}>
            {formData?.AccountInformation?.businessName || "Business Name"}
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
          <View style={stylesCOP.heading}>
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

              {/* Generate Dynamic Year Headers using financialYearLabels */}
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

            {/* Net Profit Before Tax */}
            <View style={[styles.tableRow]}>
              <Text style={stylesCOP.serialNoCellDetail}></Text>
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
              <Text style={stylesCOP.serialNoCellDetail}>Add</Text>
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
              <Text style={stylesCOP.serialNoCellDetail}></Text>
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
              <Text style={stylesCOP.serialNoCellDetail}>Less</Text>
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
            <View style={[styles.tableRow]}>
              <Text style={stylesCOP.serialNoCellDetail}></Text>
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
              <Text style={stylesCOP.serialNoCellDetail}></Text>
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
              <Text style={stylesCOP.serialNoCellDetail}></Text>
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
                incomeTax.map((tax, index) => {
                  // Corresponding Net Profit Before Tax (NPBT) for this year
                  const npbt = netProfitBeforeTax[index]; // Get NPBT for the current index

                  // If NPBT is negative, set the tax to zero
                  const taxAmount = npbt < 0 ? 0 : tax; // Set tax to 0 if NPBT is negative

                  return (
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
                        {taxAmount ? formatNumber(taxAmount) : "0"}{" "}
                        {/* Display calculated tax or "0" if NPBT is negative */}
                      </Text>
                    )
                  );
                })
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
              marginBottom: "5px",
            },
          ]}
        >
          <Text style={[styles.businessName, { fontSize: "10px" }]}>
            {formData?.AccountInformation?.businessName || "Business Name"}
          </Text>
          <Text
            style={[
              styles.FinancialYear,
              { fontSize: "10px", marginBottom: 0 },
            ]}
          >
            {formData?.AccountInformation?.businessOwner || "businessOwner"}
          </Text>
        </View>
      </View>
    </PageWithFooter>
  );
};

export default React.memo(ConsultantIncomeTaxCalculation);
