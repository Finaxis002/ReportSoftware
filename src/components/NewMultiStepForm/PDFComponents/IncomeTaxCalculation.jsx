import React from "react";
import { Page, View, Text,} from "@react-pdf/renderer";
import { styles, stylesCOP, styleExpenses } from "./Styles";
import PDFHeader from "./HeaderFooter/PDFHeader";
import PDFFooter from "./HeaderFooter/PDFFooter";


const IncomeTaxCalculation = ({
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
      <Page
        // size={formData.ProjectReportSetting.ProjectionYears > 12 ? "A3" : "A4"}
        size="A4"
        orientation="landscape"
        style={styles.page}
        wrap
        break
      >
        <View style={[styleExpenses.paddingx, { paddingBottom: "30px" }]}>
         <PDFHeader />
          <View>
            <View style={stylesCOP.heading}>
              <Text>Income Tax Calculation
              {splitFinancialYearLabels.length > 1 ? ` (${toRoman(pageIdx)})` : ""}
            </Text>
            </View>

            <View style={[styles.table, { borderRightWidth: 0 }]}>
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
                            borderTopWidth: "2px",
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
                            borderTopWidth: "2px",
                            borderBottomWidth: "2px",

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
          <PDFFooter />
        </View>
      </Page>
    );
  });
}


  return (
    <Page
      // size={formData.ProjectReportSetting.ProjectionYears > 12 ? "A3" : "A4"}
      size="A4"
      orientation={orientation}
      style={styles.page}
      wrap
      break
    >
     
      <View style={[styleExpenses.paddingx, { paddingBottom: "30px" }]}>
       <PDFHeader />
        <View>
          <View style={stylesCOP.heading}>
            <Text>Income Tax Calculation</Text>
          </View>

          <View style={[styles.table, { borderRightWidth: 0 }]}>
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
                            borderTopWidth: "2px",
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
                            borderTopWidth: "2px",
                            borderBottomWidth: "2px",

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
       <PDFFooter />
      </View>
    </Page>
  );
};

export default React.memo(IncomeTaxCalculation);
