import React, { useEffect, useMemo, useState, useRef } from "react";
import { Page, View, Text, Image } from "@react-pdf/renderer";
import {
  styles,
  stylesCOP,
  styleExpenses,
} from "./Styles";
import SAWatermark from "../../Assets/SAWatermark";
import CAWatermark from "../../Assets/CAWatermark";
import shouldHideFirstYear from "../../PDFComponents/HideFirstYear";
import { makeCMAExtractors } from "../../Utils/CMA/cmaExtractors";
import { CMAExtractorFinPos } from "../../Utils/CMA/CMAExtractorFInPos";
import { CMAExtractorFundFlow } from "../../Utils/CMA/CMAExtractorFundFlow";
import { CMAExtractorProfitability } from "../../Utils/CMA/CMAExtractorProfitability";


// Index data for project report
const index = [
  { srNo: 1, particulars: "Contents of the Project Report", versions: [true, true, true, true, true] },
  { srNo: 2, particulars: "Project Synopsis", versions: [true, true, true, true, true] },
  { srNo: 3, particulars: "Promoter Details", versions: [true, true, true, true, true] },
  { srNo: 4, particulars: "About the Company", versions: [false, false, false, false, true] },
  { srNo: 5, particulars: "Introduction about the Project", versions: [true, true, true, true, true] },
  { srNo: 6, particulars: "Scope of the Project", versions: [false, false, true, true, true] },
  { srNo: 7, particulars: "Market Potential & Strategy of the Project", versions: [false, false, false, true, true] },
  { srNo: 8, particulars: "Benefits", versions: [false, false, false, false, true] },
  { srNo: 9, particulars: "SWOT Analysis", versions: [false, false, false, true, true] },
  { srNo: 10, particulars: "Project Feasibility Graphs", versions: [false, false, true, true, true] },
  { srNo: 11, particulars: "Cost of the Project", versions: [true, true, true, true, true] },
  { srNo: 12, particulars: "Means of Finance", versions: [true, true, true, true, true] },
  { srNo: 13, particulars: "Preliminary & Pre-operative Expenses", versions: [false, false, false, false, true] },
  { srNo: 14, particulars: "Projected Revenue / Sales", versions: [false, false, true, true, true] },
  { srNo: 15, particulars: "Projected Salaries & Wages", versions: [false, false, false, false, true] },
  { srNo: 16, particulars: "Projected Power Expenditure", versions: [false, false, false, false, true] },
  { srNo: 17, particulars: "Calculation of Depreciation", versions: [false, false, false, true, true] },
  { srNo: 18, particulars: "Projected Expenses", versions: [false, false, false, false, true] },
  { srNo: 19, particulars: "Repayment of Term Loan (Monthly)", versions: [true, true, true, true, true] },
  { srNo: 20, particulars: "Repayment of Term Loan (Quaterly)", versions: [true, true, true, true, true] },
  { srNo: 21, particulars: "Repayment of Term Loan (Semi Annually)", versions: [true, true, true, true, true] },
  { srNo: 22, particulars: "Projected Profitability Statement", versions: [true, true, true, true, true] },
  { srNo: 23, particulars: "Projected Income Tax-Calculations", versions: [false, false, false, false, true] },
  { srNo: 24, particulars: "Projected Cash Flow Statement", versions: [true, true, true, true, true] },
  { srNo: 25, particulars: "Projected Balance Sheet", versions: [true, true, true, true, true] },
  { srNo: 26, particulars: "Debt-Service Coverage Ratio", versions: [true, true, true, true, true] },
  { srNo: 27, particulars: "Current Ratio", versions: [true, true, true, true, true] },
  { srNo: 28, particulars: "Ratio Analysis", versions: [false, false, false, false, true] },
  { srNo: 29, particulars: "Break-Even Point Analysis", versions: [false, false, true, true, true] },
  { srNo: 30, particulars: "Assumptions", versions: [true, true, true, true, true] },
  { srNo: 31, particulars: "Conclusion", versions: [true, true, true, true, true] },
];

const ConsultantVariableIndex = ({
  formData,
  directExpense,
  formatNumber,
  receivedtotalRevenueReceipts,
  pdfType,
  orientation,
  selectedVersion,
}) => {
  const pageStyles = {
    page: {
      padding: 40,
      paddingTop: 50, // Extra top margin for print safety
      paddingBottom: 80, // Extra bottom margin for print safety
      paddingLeft: 40,
      paddingRight: 40,
      fontFamily: "Helvetica",
      position: "relative",
    },
    contentWrapper: {
      flex: 1,
      marginBottom: 30, // Space before footer
    },
    // Safe area to avoid content being cut off
    safeArea: {
      marginTop: 20, // Top margin for content
      marginBottom: 40, // Bottom margin for content
    },
    footer: {
      position: "absolute",
      bottom: 30,
      left: 40,
      right: 40,
      height: 50, // Fixed footer height
    },
  };
  const PPExtractor = CMAExtractorProfitability(formData);
  const extractors = makeCMAExtractors(formData);
  const yearLabels = extractors.yearLabels();

  // Defensive defaults for props that may be undefined
  formData = formData || {};

  const projectionYears =
    parseInt(formData.ProjectReportSetting.ProjectionYears) || 0;

  const versionNum = parseInt(selectedVersion?.replace("Version ", "") || "1") || 1;

  const filteredIndex = index.filter(item => item.versions[versionNum - 1]);

  // Month Mapping
  const monthMap = {
    April: 1,
    May: 2,
    June: 3,
    July: 4,
    August: 5,
    September: 6,
    October: 7,
    November: 8,
    December: 9,
    January: 10,
    February: 11,
    March: 12,
  };

  const selectedMonth =
    formData?.ProjectReportSetting?.SelectStartingMonth || "April";
  const x = monthMap[selectedMonth]; // Starting month mapped to FY index

  const moratoriumPeriodMonths =
    parseInt(formData?.ProjectReportSetting?.MoratoriumPeriod) || 0;

  const hideFirstYear = shouldHideFirstYear(receivedtotalRevenueReceipts);

  //////////////////////////////   new data
  const FinPosextractors = CMAExtractorFinPos(formData);
  const FundFlowExtractor = CMAExtractorFundFlow(formData);
  const revenueReducePercentage = PPExtractor.revenueReducePercentage() || 10;
  const expenseIncreasePercentage = localStorage.getItem(
    "expenseIncreasePercentage"
  )
    ? parseFloat(localStorage.getItem("expenseIncreasePercentage"))
    : 10;

  const generateFinancialYearLabels = useMemo(
    () => (startingFY, totalYears) => {
      const yearLabels = [];
      for (let i = 0; i < totalYears; i++) {
        const fromYear = startingFY + i;
        const toYear = (fromYear + 1) % 100; // Only last two digits for the second year
        yearLabels.push(`${fromYear}-${toYear < 10 ? "0" + toYear : toYear}`);
      }
      return yearLabels;
    },
    []
  );
  const financialYear =
    parseInt(formData.ProjectReportSetting.FinancialYear) || 2025; // Use the provided year
  const financialYearLabels = generateFinancialYearLabels(
    financialYear,
    projectionYears
  );

  return (
    <Page size="A4" orientation="portrait" style={pageStyles.page}>
      {/* watermark  */}
      {pdfType &&
        pdfType !== "select option" &&
        (pdfType === "Sharda Associates" || pdfType === "CA Certified") && (
          <View
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 500,
              height: 700,
              marginLeft: -200,
              marginTop: -350,
              opacity: 0.4,
              zIndex: -1,
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
      <View style={pageStyles.safeArea}>
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
              <Text>CONTENTS</Text>
            </View>
            <View style={[styles.table]}>
              <View style={styles.tableHeader}>
                <Text
                  style={[
                    styles.serialNoCell,
                    styleExpenses.sno,
                    styleExpenses.fontBold,
                    { textAlign: "center", fontSize: "10px" },
                  ]}
                >
                  S. No.
                </Text>
                <Text
                  style={[
                    styles.detailsCell,
                    styleExpenses.particularWidth,
                    styleExpenses.fontBold,
                    { textAlign: "left", fontSize: "10px" },
                  ]}
                >
                  Particulars
                </Text>
              </View>

              {filteredIndex.map((item, idx) => (
                <React.Fragment key={item.srNo}>
                  <View
                    style={[
                      styles.tableRow,
                      {
                        // borderBottom: "0.5px light black",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        stylesCOP.serialNoCellDetail,
                        {
                          fontSize: "10px",
                          paddingVertical: 6
                        },
                      ]}
                    >
                      {idx + 1}
                    </Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                        {
                          fontSize: "10px",
                          paddingVertical: 6
                        },
                      ]}
                    >
                      {item.particulars}
                    </Text>
                  </View>
                
                </React.Fragment>
              ))}
            </View>
          </View>

          <View
            style={[
              {
                display: "flex",
                flexDirection: "row", // ✅ Change to row
                justifyContent: "space-between", // ✅ Align items left and right
                alignItems: "center",
                marginTop: 30,
              },
            ]}
          >
            <View
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                paddingTop: 100,
              }}
            >
              {/* ✅ CA Name (Conditional Display) */}
              {formData?.ProjectReportSetting?.CAName?.value ? (
                <Text
                  style={[
                    styles.caName,
                    { fontSize: "10px", fontWeight: "bold" },
                  ]}
                >
                  CA {formData?.ProjectReportSetting?.CAName?.value}
                </Text>
              ) : null}

              {/* ✅ Membership Number (Conditional Display) */}
              {formData?.ProjectReportSetting?.MembershipNumber?.value ? (
                <Text style={[styles.membershipNumber, { fontSize: "10px" }]}>
                  M. No.:{" "}
                  {formData?.ProjectReportSetting?.MembershipNumber?.value}
                </Text>
              ) : null}

              {/* ✅ UDIN Number (Conditional Display) */}
              {formData?.ProjectReportSetting?.UDINNumber?.value ? (
                <Text style={[styles.udinNumber, { fontSize: "10px" }]}>
                  UDIN: {formData?.ProjectReportSetting?.UDINNumber?.value}
                </Text>
              ) : null}

              {/* ✅ Mobile Number (Conditional Display) */}
              {formData?.ProjectReportSetting?.MobileNumber?.value ? (
                <Text style={[styles.mobileNumber, { fontSize: "10px" }]}>
                  Mob. No.:{" "}
                  {formData?.ProjectReportSetting?.MobileNumber?.value}
                </Text>
              ) : null}
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
                  marginTop: "30px",
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
          </View>
        </View>
      </View>
    </Page>
  );
};

export default React.memo(ConsultantVariableIndex);
