import React, { useEffect, useState } from "react";
import { Page, View, Text, Image } from "@react-pdf/renderer";
import { styles, stylesCOP, stylesMOF, styleExpenses } from "./Styles";
import { Font } from "@react-pdf/renderer";
import SAWatermark from "../Assets/SAWatermark";
import CAWatermark from "../Assets/CAWatermark";
import shouldHideFirstYear from "./HideFirstYear";

// ✅ Register Font
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

const Assumptions = ({
  formData = {},
  financialYearLabels = [],
  formatNumber,
  totalRevenueReceipts,
  receiveTotalExpense,
  pdfType,
  receivedtotalRevenueReceipts,
  orientation,
}) => {
  const projectionYears = formData?.ProjectReportSetting?.ProjectionYears || 5;
  const years = Math.floor(formData.ProjectReportSetting.RepaymentMonths / 12);
  const months = formData.ProjectReportSetting.RepaymentMonths % 12;

  const debtEquityOption = formData?.ProjectReportSetting?.DebtEquityOption || formData?.ProjectReportSetting?.debtEquityOption ;

  const renderTLFBLabel = () => {
    if (debtEquityOption === "Equity") {
      return `Equity Capital Infusion`; // Format for equity case
    } else {
      return "Term Loan From Bank Repayment"; // Default case
    }
  };

  const renderWCLFBLabel = () => {
    if (debtEquityOption === "Equity"){
      return "Equity Of Running Operations";
    }
    else{
      return "Loan From Bank Repayment"
    }

  }

  const [isDataReady, setIsDataReady] = useState(false);
  // Depreciation Data


 useEffect(() => {
    // Check if computed data has totalExpense available
    if (formData?.computedData?.totalExpense && formData.computedData.totalExpense.length > 0) {
        // console.log("Expense data ready for rendering from computed data");
        setIsDataReady(true);
    } 
    // Fall back to the original prop if computed data is not available
    else if (receiveTotalExpense && receiveTotalExpense.length > 0) {
        // console.log("Expense data ready for rendering from prop");
        setIsDataReady(true);
    }
}, [formData?.computedData?.totalExpense, receiveTotalExpense]);

  const revenueArray =
    formData?.computedData?.totalRevenueReceipts ??
    receivedtotalRevenueReceipts ??
    totalRevenueReceipts ??
    [];
  const expenseArray =
    formData?.computedData?.totalExpense ?? receiveTotalExpense ?? [];

  // How many leading years should be hidden (zeros) if present
  const hideFirstYear = shouldHideFirstYear(revenueArray) || 0;

  const baseFinancialYearLabels =
    hideFirstYear > 0
      ? financialYearLabels.slice(hideFirstYear)
      : financialYearLabels;
  const baseRevenueReceipts =
    hideFirstYear > 0 ? revenueArray.slice(hideFirstYear) : revenueArray;
  const baseExpenses =
    hideFirstYear > 0 ? expenseArray.slice(hideFirstYear) : expenseArray;

  // Align headers with available data length (like Projected Revenue/Expenses)
  const activeLength = Math.max(
    baseRevenueReceipts?.length || 0,
    baseExpenses?.length || 0
  );
  const sliceOffset =
    activeLength > 0 && baseFinancialYearLabels.length > activeLength
      ? baseFinancialYearLabels.length - activeLength
      : 0;

  const alignedFinancialYearLabels =
    sliceOffset > 0
      ? baseFinancialYearLabels.slice(sliceOffset)
      : baseFinancialYearLabels;
  const alignedRevenueReceipts =
    sliceOffset > 0 ? baseRevenueReceipts.slice(-activeLength) : baseRevenueReceipts;
  const alignedExpenses =
    sliceOffset > 0 ? baseExpenses.slice(-activeLength) : baseExpenses;

  const isAdvancedLandscape = orientation === "advanced-landscape";
  let splitFinancialYearLabels = [alignedFinancialYearLabels];
  if (isAdvancedLandscape) {
    const totalCols = alignedFinancialYearLabels.length;
    const firstPageCols = Math.ceil(totalCols / 2);
    const secondPageCols = totalCols - firstPageCols;
    splitFinancialYearLabels = [
      alignedFinancialYearLabels.slice(0, firstPageCols),
      alignedFinancialYearLabels.slice(firstPageCols, firstPageCols + secondPageCols),
    ];
  }
  const toRoman = (n) =>
    ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"][n] || n + 1;
  if (isAdvancedLandscape) {
    return splitFinancialYearLabels.map((labels, pageIdx) => {
      // labels is the page's array of financial year labels (subset of visibleFinancialYearLabels)
      const pageStart = splitFinancialYearLabels
        .slice(0, pageIdx)
        .reduce((sum, chunk) => sum + chunk.length, 0);


      return (
        <Page
          // size={projectionYears > 12 ? "A3" : "A4"}
          size="A4"
          orientation="landscape"
          style={styles.page}
          wrap={false}
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
                fixed
              >
                <Image
                  src={
                    pdfType === "Sharda Associates" ? SAWatermark : CAWatermark
                  }
                  style={{
                    width: "100%",
                    height: "100%",
                  }}
                />
              </View>
            )}

          <View style={[styleExpenses?.paddingx]}>
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

            {/* Table Heading */}
            <View
              style={[
                stylesCOP.heading,
                {
                  fontWeight: "bold",
                  paddingLeft: 10,
                  marginTop: "10px",
                },
              ]}
            >
              <Text>
                Assumption
                {splitFinancialYearLabels.length > 1
                  ? `(${toRoman(pageIdx)})`
                  : ""}
              </Text>
            </View>

            <Text style={{ fontSize: 9 }}>
              The entire projection is based on the assumption that the sales
              for
              {years} Years {months} Months will be:
            </Text>

            {/* sales table */}
            <View style={[{ marginTop: "10px" }]}>
              <View style={styles.tableHeader}>
                <Text
                  style={[
                    styles.detailsCell,
                    stylesCOP.boldText,
                    styleExpenses.particularWidth,
                  ]}
                >
                  Particulars
                </Text>

                {/* ✅ Page-scoped dynamic year headers */}
                {labels.map((yearLabel, localIdx) => (
                  <Text
                    key={`hdr-sales-${pageStart + localIdx}`}
                    style={[styles.particularsCell, stylesCOP.boldText]}
                  >
                    {yearLabel}
                  </Text>
                ))}
              </View>

              <View
                style={[stylesMOF.row, styles.tableRow, { borderWidth: "1px" }]}
              >
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                    { padding: "2px" },
                  ]}
                >
                  Sales
                </Text>

                {/* ✅ Page-scoped values for Sales */}
                {labels.map((_, localIdx) => (
                  <Text
                    key={`sales-${pageStart + localIdx}`}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                      { padding: "2px" },
                    ]}
                  >
                    {formatNumber(alignedRevenueReceipts?.[pageStart + localIdx] || 0)}
                  </Text>
                ))}
              </View>
            </View>
          </View>

          <View style={{ marginTop: "10px" }}>
            <Text style={[styles.text, { fontSize: 9 }]}>
              Also the total expense for the firm during the projection years
              will be as follows:
            </Text>

            {/* expense table */}
            <View style={{ margin: "10px" }}>
              <View style={styles.tableHeader}>
                <Text
                  style={[
                    styles.detailsCell,
                    stylesCOP.boldText,
                    styleExpenses.particularWidth,
                  ]}
                >
                  Particulars
                </Text>

                {/* ✅ Page-scoped dynamic year headers */}
                {labels.map((yearLabel, localIdx) => (
                  <Text
                    key={`hdr-exp-${pageStart + localIdx}`}
                    style={[styles.particularsCell, stylesCOP.boldText]}
                  >
                    {yearLabel}
                  </Text>
                ))}
              </View>

              <View
                style={[stylesMOF.row, styles.tableRow, { borderWidth: "1px" }]}
              >
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  Expenses
                </Text>

                {isDataReady ? (
                  // ✅ Page-scoped values for Total Expenses
                  labels.map((_, localIdx) => (
                    <Text
                      key={`exp-${pageStart + localIdx}`}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                        { padding: "2px" },
                      ]}
                    >
                      {formatNumber(alignedExpenses?.[pageStart + localIdx] || 0)}
                    </Text>
                  ))
                ) : (
                  <Text>Loading Total Expenses...</Text>
                )}
              </View>
            </View>
          </View>

          <Text style={[styles.text, { fontSize: 9 }]}>
            Rate of Depreciation is as follows:
          </Text>

          <View
            style={[
              styles.table,
              {
                marginLeft: "auto",
                marginRight: "auto",
                marginTop: "20px",
                width: "50%",
              },
            ]}
          >
            <View style={styles.tableHeader}>
              <Text
                style={[
                  styles.detailsCell,
                  stylesCOP.boldText,
                  styleExpenses.particularWidth,
                ]}
              >
                Particulars
              </Text>

              <Text
                style={[
                  styles.particularsCell,
                  stylesCOP.boldText,
                  { textAlign: "left", width: "30%" },
                ]}
              >
                Rates
              </Text>
            </View>

            {/* ✅ Show Cost of Project Items */}
            {formData?.CostOfProject &&
            Object.keys(formData.CostOfProject).length > 0 ? (
              Object.entries(formData.CostOfProject)
                .filter(([_, field]) => field?.name?.trim())
                .map(([key, field]) => (
                  <View key={key} style={styles.tableRow}>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      {field.name}
                    </Text>
                    <Text
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                        { textAlign: "right" },
                      ]}
                    >
                      {formatNumber(field?.rate || 0)}%
                    </Text>
                  </View>
                ))
            ) : (
              <View style={styles.tableRow}>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    { textAlign: "center", width: "100%" },
                  ]}
                >
                  No cost data available
                </Text>
              </View>
            )}
          </View>

          {/* Notes Section */}
          <View style={[styles.text, { marginTop: 20, marginLeft: 2 }]}>
            <Text style={{ fontSize: 9 }}>
              The {renderTLFBLabel()} for {years} Years {months} Months is
              calculated at an interest rate of{" "}
              {formData.ProjectReportSetting.interestOnTL}% per annum.
            </Text>
            <Text style={{ fontSize: 9 }}>
              The {renderWCLFBLabel()} Repayment is calculated at an interest
              rate of {formData.ProjectReportSetting.interestOnWC}% per annum.
            </Text>
            <Text style={{ fontSize: 9 }}>
              Cost of the land is based on the current rate.
            </Text>
            <Text style={{ fontSize: 9 }}>
              Cost of the building is based on the current rate.
            </Text>
            <Text style={{ fontSize: 9 }}>
              Cost of machinery is based on the quotation submitted by the
              supplier.
            </Text>
            <Text style={{ fontSize: 9 }}>
              Value of raw materials & utility charges are as per current market
              conditions.
            </Text>
            <Text style={{ fontSize: 9 }}>
              All other assumptions are based on the experience of the promoter
              and study of similar models.
            </Text>
          </View>

          <View style={{ color: "#172554" }}>
            <Text style={{ marginTop: 20, fontSize: 9 }}>
              This report is created using www.shardaassociates.in. Sharda
              Associates bears no financial responsibility on or behalf of any
              of the authorized signatories.
            </Text>
          </View>
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
      wrap={false}
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
            fixed
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

      <View style={[styleExpenses?.paddingx]}>
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

        {/* Table Heading */}
        <View
          style={[
            stylesCOP.heading,
            {
              fontWeight: "bold",
              paddingLeft: 10,
              marginTop: "10px",
            },
          ]}
        >
          <Text>Assumption</Text>
        </View>

        <Text style={{ fontSize: 9 }}>
          The entire projection is based on the assumption that the sales for
          {years} Years {months} Months will be:
        </Text>

        {/* sales table */}
        <View style={[{ marginTop: "10px" }]}>
          <View style={styles.tableHeader}>
            <Text
              style={[
                styles.detailsCell,
                stylesCOP.boldText,
                styleExpenses.particularWidth,
              ]}
            >
              Particulars
            </Text>

            {/* ✅ Dynamically generate years with fallback */}
            {alignedFinancialYearLabels.map((yearLabel, yearIndex) => (
              <Text
                key={yearIndex}
                style={[styles.particularsCell, stylesCOP.boldText]}
              >
                {yearLabel}
              </Text>
            ))}
          </View>
          <View
            style={[stylesMOF.row, styles.tableRow, { borderWidth: "1px" }]}
          >
            <Text
              style={[
                stylesCOP.detailsCellDetail,
                styleExpenses.particularWidth,
                styleExpenses.bordernone,
                { padding: "2px" },
              ]}
            >
              Sales
            </Text>
            {alignedFinancialYearLabels.map((_, index) => (
              <Text
                key={index}
                style={[
                  stylesCOP.particularsCellsDetail,
                  styleExpenses.fontSmall,
                  { padding: "2px" },
                ]}
              >
                {formatNumber(alignedRevenueReceipts?.[index] || 0)}
              </Text>
            ))}
          </View>
        </View>
      </View>

      <View style={{ marginTop: "10px" }}>
        <Text style={[styles.text, { fontSize: 9 }]}>
          Also the total expense for the firm during the projection years will
          be as follows:
        </Text>
        {/*expense table */}
        <View style={{ margin: "10px" }}>
          <View style={styles.tableHeader}>
            <Text
              style={[
                styles.detailsCell,
                stylesCOP.boldText,
                styleExpenses.particularWidth,
              ]}
            >
              Particulars
            </Text>

            {/* ✅ Dynamically generate years with fallback */}
            {alignedFinancialYearLabels.map((yearLabel, yearIndex) => (
              <Text
                key={yearIndex}
                style={[styles.particularsCell, stylesCOP.boldText]}
              >
                {yearLabel}
              </Text>
            ))}
          </View>
          <View
            style={[stylesMOF.row, styles.tableRow, { borderWidth: "1px" }]}
          >
            <Text
              style={[
                stylesCOP.detailsCellDetail,
                styleExpenses.particularWidth,
                styleExpenses.bordernone,
              ]}
            >
              Expenses
            </Text>

            {isDataReady ? (
              alignedFinancialYearLabels.map((_, index) => (
                <Text
                  key={index}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                    { padding: "2px" },
                  ]}
                >
                  {formatNumber(alignedExpenses?.[index] || 0)}
                </Text>
              ))
            ) : (
              <Text>Loading Total Expenses...</Text>
            )}
          </View>
        </View>
      </View>

      <Text style={[styles.text, { fontSize: 9 }]}>
        Rate of Depreciation is as follows:
      </Text>
      <View
        style={[
          styles.table,
          {
            marginLeft: "auto", // Centers the table horizontally
            marginRight: "auto", // Centers the table horizontally
            marginTop: "20px",
            width: "50%",
          },
        ]}
      >
        <View style={styles.tableHeader}>
          <Text
            style={[
              styles.detailsCell,
              stylesCOP.boldText,
              styleExpenses.particularWidth,
            ]}
          >
            Particulars
          </Text>

          <Text
            style={[
              styles.particularsCell,
              stylesCOP.boldText,
              { textAlign: "left", width: "30%" },
            ]}
          >
            Rates
          </Text>
        </View>

        {/* ✅ Show Cost of Project Items */}
        {formData?.CostOfProject &&
        Object.keys(formData.CostOfProject).length > 0 ? (
          // Object.entries(formData.CostOfProject).map(([key, field], index) => (
          //   <View key={key} style={styles.tableRow}>
          //     <Text
          //       style={[
          //         stylesCOP.detailsCellDetail,
          //         styleExpenses.particularWidth,
          //         styleExpenses.bordernone,
          //       ]}
          //     >
          //       {field?.name || "N/A"}
          //     </Text>
          //     <Text
          //       style={[
          //         stylesCOP.particularsCellsDetail,
          //         styleExpenses.fontSmall,
          //         { textAlign: "right" },
          //       ]}
          //     >
          //       {formatNumber(field?.rate || 0)}%
          //     </Text>
          //   </View>
          // ))
          Object.entries(formData.CostOfProject)
            .filter(([_, field]) => field?.name?.trim()) // ⛔ filters out empty or whitespace-only names
            .map(([key, field]) => (
              <View key={key} style={styles.tableRow}>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  {field.name}
                </Text>
                <Text
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                    { textAlign: "right" },
                  ]}
                >
                  {formatNumber(field?.rate || 0)}%
                </Text>
              </View>
            ))
        ) : (
          <View style={styles.tableRow}>
            <Text
              style={[
                stylesCOP.detailsCellDetail,
                { textAlign: "center", width: "100%" },
              ]}
            >
              No cost data available
            </Text>
          </View>
        )}
      </View>
      {/* Notes Section */}
      <View style={[styles.text, { marginTop: 20, marginLeft: 2 }]}>
        <Text style={{ fontSize: 9 }}>
          The  {renderTLFBLabel()} for {years} Years {months} Months is
          calculated at an interest rate of{" "}
          {formData.ProjectReportSetting.interestOnTL}% per annum.
        </Text>
        <Text style={{ fontSize: 9 }}>
          The {renderWCLFBLabel()} is calculated at an interest rate
          of {formData.ProjectReportSetting.interestOnWC}% per annum.
        </Text>
        <Text style={{ fontSize: 9 }}>
          Cost of the land is based on the current rate.
        </Text>
        <Text style={{ fontSize: 9 }}>
          Cost of the building is based on the current rate.
        </Text>
        <Text style={{ fontSize: 9 }}>
          Cost of machinery is based on the quotation submitted by the supplier.
        </Text>
        <Text style={{ fontSize: 9 }}>
          Value of raw materials & utility charges are as per current market
          conditions.
        </Text>
        <Text style={{ fontSize: 9 }}>
          All other assumptions are based on the experience of the promoter and
          study of similar models.
        </Text>
      </View>

      <View style={{ color: "#172554" }}>
        <Text style={{ marginTop: 20, fontSize: 9 }}>
          This report is created using www.shardaassociates.in. Sharda
          Associates bears no financial responsibility on or behalf of any of
          the authorized signatories.
        </Text>
      </View>
    </Page>
  );
};

export default React.memo(Assumptions);
