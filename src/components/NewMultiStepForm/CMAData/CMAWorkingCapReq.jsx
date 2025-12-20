import {
  Page,
  View,
  Text,
  Font,
} from "@react-pdf/renderer";
import { makeCMAExtractors } from "../Utils/CMA/cmaExtractors";
import { CMAExtractorFundFlow } from "../Utils/CMA/CMAExtractorFundFlow";
import { CMAExtractorBS } from "../Utils/CMA/CMAExtractorBS";
import { CMAExtractorWorkingCap } from "../Utils/CMA/CMAExtractorWorkingCap";
import {
  formatNumber,
} from "../Utils/CMA/financialCalcs";

import {
  styles,
  stylesCOP,
  stylesMOF,
  styleExpenses,
} from "../PDFComponents/Styles";
import { Header } from "./Header";
import { getCurrentAssetsArray } from '../Utils/CMA/CmaReport/calculateCurrentAssets';
// Font registration (optional)
Font.register({
  family: "Roboto",
  src: "https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Me5Q.ttf",
});



// Main component
const CMAWorkingCapReq = ({ formData, orientation }) => {
  // You can import these:
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
  const years = Number(formData?.ProjectReportSetting?.ProjectionYears || 5);
  const extractors = makeCMAExtractors(formData);
  const yearLabels = extractors.yearLabels();
  const FundFlowExtractor = CMAExtractorFundFlow(formData);
  const BSextractors = CMAExtractorBS(formData);


  const closingCashBalanceArray = FundFlowExtractor.closingCashBalanceArray ?
    FundFlowExtractor.closingCashBalanceArray() :
    Array(years).fill(0);
  const closingCashBalanceFromBS = BSextractors.closingCashBalanceArray ?
    BSextractors.closingCashBalanceArray() :
    Array(years).fill(0);
  const closingCashFromComputed = formData?.computedData?.closingCashBalanceArray ||
    Array(years).fill(0);



  // Try the most likely source first, fallback to others
  let finalClosingCashBalance = closingCashBalanceArray;

  // If FundFlow returns all zeros, try BalanceSheet
  if (closingCashBalanceArray.every(val => val === 0) && !closingCashBalanceFromBS.every(val => val === 0)) {
    finalClosingCashBalance = closingCashBalanceFromBS;

  }
  // If both are zeros, try computed data
  else if (closingCashBalanceArray.every(val => val === 0) && closingCashBalanceFromBS.every(val => val === 0) &&
    !closingCashFromComputed.every(val => val === 0)) {
    finalClosingCashBalance = closingCashFromComputed;

  }



  // ✅ USE THE UTILITY FUNCTION WITH THE CORRECT CLOSING CASH BALANCE
  const correctCurrentAssets = getCurrentAssetsArray(formData, finalClosingCashBalance);



  // new data Assessment of Working Capital Requirements
  const WorkingReqExtractor = CMAExtractorWorkingCap(formData);
  // const currentAssets = WorkingReqExtractor.currentAssets() || [];


  // // Use the correct current assets instead of the potentially wrong ones
  const currentAssets = correctCurrentAssets || WorkingReqExtractor.currentAssets() || [];

  const otherCurrLiabilities = WorkingReqExtractor.otherCurrLiabilities() || [];
  const workingCapGap = WorkingReqExtractor.workingCapGap() || [];
  const workingCapitalLoanArr =
    WorkingReqExtractor.workingCapitalLoanArr() || [];
  const totalCurrLiabilities = WorkingReqExtractor.totalCurrLiabilities() || [];
  const NetWorkCap = WorkingReqExtractor.NetWorkCap() || [];
  const MinStipulatedMarginMoney =
    WorkingReqExtractor.MinStipulatedMarginMoney() || [];
  const MPBF = WorkingReqExtractor.MPBF() || [];
  const MPBF3minus6 = WorkingReqExtractor.MPBF3minus6() || [];
  const maxPermissible = WorkingReqExtractor.maxPermissible() || [];
  const netSales = extractors.netSales() || [];
  const turnOver5per = Array.from({ length: years }).map((_, i) =>
    Number(Number(netSales[i] || 0) * 0.05)
  );
  const turnOver20per = Array.from({ length: years }).map((_, i) =>
    Number(Number(netSales[i] || 0) * 0.2)
  );

  const isAdvancedLandscape = orientation === "advanced-landscape";
  let splitYearLabels = [yearLabels];
  if (isAdvancedLandscape) {
    const visibleLabels = yearLabels; // (no hideFirstYear logic here, but add if needed)
    const totalCols = visibleLabels.length;
    const firstPageCols = Math.ceil(totalCols / 2);
    const secondPageCols = totalCols - firstPageCols;
    splitYearLabels = [
      visibleLabels.slice(0, firstPageCols),
      visibleLabels.slice(firstPageCols, firstPageCols + secondPageCols),
    ];
  }
  const toRoman = (n) =>
    ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"][n] || n + 1;

  if (isAdvancedLandscape) {
    return splitYearLabels.map((labels, pageIdx) => {
      const pageStart = yearLabels.indexOf(labels[0]);
      const globalIndex = (localIdx) => pageStart + localIdx;

      return (
        <Page size="A4" style={pageStyles.page} orientation="landscape">
          <View style={pageStyles.safeArea}>
            <View style={[styleExpenses.paddingx, { paddingBottom: "30px" }]}>
              {/* name and financial year  */}
              <Header formData={formData} />

              {/* header  */}
              <View>
                <View>
                  <View style={stylesCOP.heading}>
                    <Text>
                      Assessment of Working Capital Requirements
                      {splitYearLabels.length > 1
                        ? ` (${toRoman(pageIdx)})`
                        : ""}
                    </Text>
                  </View>
                </View>
              </View>

              {/* table  */}
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

                  {/* Dynamic Year Headers (page-scoped) */}
                  {labels.map((label, idx) => (
                    <Text
                      key={`${pageIdx}-hdr-${idx}`}
                      style={[styles.particularsCell, stylesCOP.boldText]}
                    >
                      {label}
                    </Text>
                  ))}
                </View>

                {/* table content  */}
                <View>
                  {/* first part  */}
                  <View>
                    {/* Blank Row  */}
                    <View
                      style={[
                        stylesMOF.row,
                        styles.tableRow,
                        styles.Total,
                        { border: 0 },
                      ]}
                    >
                      <Text
                        style={[
                          stylesCOP.serialNoCellDetail,
                          styleExpenses.sno,
                          styleExpenses.bordernone,
                          styles.Total,
                        ]}
                      />
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                          styles.Total,
                        ]}
                      />
                      {labels.map((_, localIdx) => (
                        <Text
                          key={`${pageIdx}-blank-0-${localIdx}`}
                          style={[
                            stylesCOP.particularsCellsDetail,
                            styleExpenses.fontSmall,
                            { paddingVertical: "5px" },
                          ]}
                        />
                      ))}
                    </View>

                    {/* 1 Current Assets */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>1</Text>
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
                        return (
                          <Text
                            key={`${pageIdx}-ca-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(currentAssets?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* Blank Row */}
                    <View
                      style={[
                        stylesMOF.row,
                        styles.tableRow,
                        styles.Total,
                        { border: 0 },
                      ]}
                    >
                      <Text
                        style={[
                          stylesCOP.serialNoCellDetail,
                          styleExpenses.sno,
                          styleExpenses.bordernone,
                          styles.Total,
                        ]}
                      />
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                          styles.Total,
                        ]}
                      />
                      {labels.map((_, localIdx) => (
                        <Text
                          key={`${pageIdx}-blank-1-${localIdx}`}
                          style={[
                            stylesCOP.particularsCellsDetail,
                            styleExpenses.fontSmall,
                            { paddingVertical: "5px" },
                          ]}
                        />
                      ))}
                    </View>

                    {/* 2 Other Current Liabilities (less WC & TL) */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>2</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Other Current Liabilties (less WC & TL)
                      </Text>
                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-ocl-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(otherCurrLiabilities?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* Blank Row */}
                    <View
                      style={[
                        stylesMOF.row,
                        styles.tableRow,
                        styles.Total,
                        { border: 0 },
                      ]}
                    >
                      <Text
                        style={[
                          stylesCOP.serialNoCellDetail,
                          styleExpenses.sno,
                          styleExpenses.bordernone,
                          styles.Total,
                        ]}
                      />
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                          styles.Total,
                        ]}
                      />
                      {labels.map((_, localIdx) => (
                        <Text
                          key={`${pageIdx}-blank-2-${localIdx}`}
                          style={[
                            stylesCOP.particularsCellsDetail,
                            styleExpenses.fontSmall,
                            { paddingVertical: "5px" },
                          ]}
                        />
                      ))}
                    </View>

                    {/* 3 Working Capital Gap (1-2) */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>3</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Working Capital Gap (1-2)
                      </Text>
                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-wcg-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(workingCapGap?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* Blank Row */}
                    <View
                      style={[
                        stylesMOF.row,
                        styles.tableRow,
                        styles.Total,
                        { border: 0 },
                      ]}
                    >
                      <Text
                        style={[
                          stylesCOP.serialNoCellDetail,
                          styleExpenses.sno,
                          styleExpenses.bordernone,
                          styles.Total,
                        ]}
                      />
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                          styles.Total,
                        ]}
                      />
                      {labels.map((_, localIdx) => (
                        <Text
                          key={`${pageIdx}-blank-3-${localIdx}`}
                          style={[
                            stylesCOP.particularsCellsDetail,
                            styleExpenses.fontSmall,
                            { paddingVertical: "5px" },
                          ]}
                        />
                      ))}
                    </View>

                    {/* 4 Actual / Projected Net Working Capital */}
                    <View
                      style={[
                        stylesMOF.row,
                        styles.tableRow,
                        { borderBottomWidth: "0px" },
                      ]}
                    >
                      <Text
                        style={[
                          stylesCOP.serialNoCellDetail,
                          styleExpenses.sno,
                          styleExpenses.bordernone,
                        ]}
                      >
                        4
                      </Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Actual / Projected Net Working Capital
                      </Text>
                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-apnwc-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(workingCapitalLoanArr?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* Blank Row */}
                    <View
                      style={[
                        stylesMOF.row,
                        styles.tableRow,
                        styles.Total,
                        { border: 0 },
                      ]}
                    >
                      <Text
                        style={[
                          stylesCOP.serialNoCellDetail,
                          styleExpenses.sno,
                          styleExpenses.bordernone,
                          styles.Total,
                        ]}
                      />
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                          styles.Total,
                        ]}
                      />
                      {labels.map((_, localIdx) => (
                        <Text
                          key={`${pageIdx}-blank-4-${localIdx}`}
                          style={[
                            stylesCOP.particularsCellsDetail,
                            styleExpenses.fontSmall,
                            { paddingVertical: "5px" },
                          ]}
                        />
                      ))}
                    </View>

                    {/* 5 Total Current Liabilities */}
                    <View
                      style={[
                        stylesMOF.row,
                        styles.tableRow,
                        { borderBottomWidth: "0px" },
                      ]}
                    >
                      <Text
                        style={[
                          stylesCOP.serialNoCellDetail,
                          styleExpenses.sno,
                          styleExpenses.bordernone,
                        ]}
                      >
                        5
                      </Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Total Current Liabilities
                      </Text>
                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-tcl-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(totalCurrLiabilities?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* Blank Row */}
                    <View
                      style={[
                        stylesMOF.row,
                        styles.tableRow,
                        styles.Total,
                        { border: 0 },
                      ]}
                    >
                      <Text
                        style={[
                          stylesCOP.serialNoCellDetail,
                          styleExpenses.sno,
                          styleExpenses.bordernone,
                          styles.Total,
                        ]}
                      />
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                          styles.Total,
                        ]}
                      />
                      {labels.map((_, localIdx) => (
                        <Text
                          key={`${pageIdx}-blank-5-${localIdx}`}
                          style={[
                            stylesCOP.particularsCellsDetail,
                            styleExpenses.fontSmall,
                            { paddingVertical: "5px" },
                          ]}
                        />
                      ))}
                    </View>

                    {/* 6 Actual / Projected Net Working Capital (1-5) */}
                    <View
                      style={[
                        stylesMOF.row,
                        styles.tableRow,
                        { borderBottomWidth: "0px" },
                      ]}
                    >
                      <Text
                        style={[
                          stylesCOP.serialNoCellDetail,
                          styleExpenses.sno,
                          styleExpenses.bordernone,
                        ]}
                      >
                        6
                      </Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Actual / Projected Net Working Capital (1-5)
                      </Text>
                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-nwc-1-5-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(NetWorkCap?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* Blank Row */}
                    <View
                      style={[
                        stylesMOF.row,
                        styles.tableRow,
                        styles.Total,
                        { border: 0 },
                      ]}
                    >
                      <Text
                        style={[
                          stylesCOP.serialNoCellDetail,
                          styleExpenses.sno,
                          styleExpenses.bordernone,
                          styles.Total,
                        ]}
                      />
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                          styles.Total,
                        ]}
                      />
                      {labels.map((_, localIdx) => (
                        <Text
                          key={`${pageIdx}-blank-6-${localIdx}`}
                          style={[
                            stylesCOP.particularsCellsDetail,
                            styleExpenses.fontSmall,
                            { paddingVertical: "5px" },
                          ]}
                        />
                      ))}
                    </View>

                    {/* 7 Minimum Stipulated Margin Money (25% of 3) */}
                    <View
                      style={[
                        stylesMOF.row,
                        styles.tableRow,
                        { borderBottomWidth: "0px" },
                      ]}
                    >
                      <Text
                        style={[
                          stylesCOP.serialNoCellDetail,
                          styleExpenses.sno,
                          styleExpenses.bordernone,
                        ]}
                      >
                        7
                      </Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Minimum Stipulated Margin Money (25% of 3)
                      </Text>
                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-msmm-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(MinStipulatedMarginMoney?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* Blank Row */}
                    <View
                      style={[
                        stylesMOF.row,
                        styles.tableRow,
                        styles.Total,
                        { border: 0 },
                      ]}
                    >
                      <Text
                        style={[
                          stylesCOP.serialNoCellDetail,
                          styleExpenses.sno,
                          styleExpenses.bordernone,
                          styles.Total,
                        ]}
                      />
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                          styles.Total,
                        ]}
                      />
                      {labels.map((_, localIdx) => (
                        <Text
                          key={`${pageIdx}-blank-7-${localIdx}`}
                          style={[
                            stylesCOP.particularsCellsDetail,
                            styleExpenses.fontSmall,
                            { paddingVertical: "5px" },
                          ]}
                        />
                      ))}
                    </View>

                    {/* 8 MPBF = Working Capital Gap - Minimum Margin (3-7) */}
                    <View
                      style={[
                        stylesMOF.row,
                        styles.tableRow,
                        { borderBottomWidth: "0px" },
                      ]}
                    >
                      <Text
                        style={[
                          stylesCOP.serialNoCellDetail,
                          styleExpenses.sno,
                          styleExpenses.bordernone,
                        ]}
                      >
                        8
                      </Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        MPBF = Working Capital Gap - Minimum Margin (3-7)
                      </Text>
                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-mpbf-3-7-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(formData, Number(MPBF?.[gIdx]) || 0)}
                          </Text>
                        );
                      })}
                    </View>

                    {/* Blank Row */}
                    <View
                      style={[
                        stylesMOF.row,
                        styles.tableRow,
                        styles.Total,
                        { border: 0 },
                      ]}
                    >
                      <Text
                        style={[
                          stylesCOP.serialNoCellDetail,
                          styleExpenses.sno,
                          styleExpenses.bordernone,
                          styles.Total,
                        ]}
                      />
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                          styles.Total,
                        ]}
                      />
                      {labels.map((_, localIdx) => (
                        <Text
                          key={`${pageIdx}-blank-8-${localIdx}`}
                          style={[
                            stylesCOP.particularsCellsDetail,
                            styleExpenses.fontSmall,
                            { paddingVertical: "5px" },
                          ]}
                        />
                      ))}
                    </View>

                    {/* 9 MPBF = Working Capital Gap - Projected Net WC (3-6) */}
                    <View
                      style={[
                        stylesMOF.row,
                        styles.tableRow,
                        { borderBottomWidth: "0px" },
                      ]}
                    >
                      <Text
                        style={[
                          stylesCOP.serialNoCellDetail,
                          styleExpenses.sno,
                          styleExpenses.bordernone,
                        ]}
                      >
                        9
                      </Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        MPBF = Working Capital Gap - Projected Net WC (3-6)
                      </Text>
                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-mpbf-3-6-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(MPBF3minus6?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* Blank Row */}
                    <View
                      style={[
                        stylesMOF.row,
                        styles.tableRow,
                        styles.Total,
                        { border: 0 },
                      ]}
                    >
                      <Text
                        style={[
                          stylesCOP.serialNoCellDetail,
                          styleExpenses.sno,
                          styleExpenses.bordernone,
                          styles.Total,
                        ]}
                      />
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                          styles.Total,
                        ]}
                      />
                      {labels.map((_, localIdx) => (
                        <Text
                          key={`${pageIdx}-blank-9-${localIdx}`}
                          style={[
                            stylesCOP.particularsCellsDetail,
                            styleExpenses.fontSmall,
                            { paddingVertical: "5px" },
                          ]}
                        />
                      ))}
                    </View>

                    {/* 10 Maximum permissible Bank Finance 6 or 7 whichever is less */}
                    <View
                      style={[
                        stylesMOF.row,
                        styles.tableRow,
                        { borderBottomWidth: "0px" },
                      ]}
                    >
                      <Text
                        style={[
                          stylesCOP.serialNoCellDetail,
                          styleExpenses.sno,
                          styleExpenses.bordernone,
                        ]}
                      >
                        10
                      </Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Maximum permissible Bank Finance 6 or 7 whichever is less
                      </Text>
                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-mpbf-max-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(maxPermissible?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* Blank Row */}
                    <View
                      style={[
                        stylesMOF.row,
                        styles.tableRow,
                        styles.Total,
                        { border: 0 },
                      ]}
                    >
                      <Text
                        style={[
                          stylesCOP.serialNoCellDetail,
                          styleExpenses.sno,
                          styleExpenses.bordernone,
                          styles.Total,
                        ]}
                      />
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                          styles.Total,
                        ]}
                      />
                      {labels.map((_, localIdx) => (
                        <Text
                          key={`${pageIdx}-blank-10-${localIdx}`}
                          style={[
                            stylesCOP.particularsCellsDetail,
                            styleExpenses.fontSmall,
                            { paddingVertical: "5px" },
                          ]}
                        />
                      ))}
                    </View>

                    {/* 11 Nayak Committee Anticipated or realistic projection of turnover */}
                    <View
                      style={[
                        stylesMOF.row,
                        styles.tableRow,
                        { borderBottomWidth: "0px" },
                      ]}
                    >
                      <Text
                        style={[
                          stylesCOP.serialNoCellDetail,
                          styleExpenses.sno,
                          styleExpenses.bordernone,
                        ]}
                      >
                        11
                      </Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Nayak Committee Anitcipated or realistic projection of
                        turnover
                      </Text>
                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-turnover-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(netSales?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* Blank Row */}
                    <View
                      style={[
                        stylesMOF.row,
                        styles.tableRow,
                        styles.Total,
                        { border: 0 },
                      ]}
                    >
                      <Text
                        style={[
                          stylesCOP.serialNoCellDetail,
                          styleExpenses.sno,
                          styleExpenses.bordernone,
                          styles.Total,
                        ]}
                      />
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                          styles.Total,
                        ]}
                      />
                      {labels.map((_, localIdx) => (
                        <Text
                          key={`${pageIdx}-blank-11-${localIdx}`}
                          style={[
                            stylesCOP.particularsCellsDetail,
                            styleExpenses.fontSmall,
                            { paddingVertical: "5px" },
                          ]}
                        />
                      ))}
                    </View>

                    {/* 12 5% of turnover which of minimum margin */}
                    <View
                      style={[
                        stylesMOF.row,
                        styles.tableRow,
                        { borderBottomWidth: "0px" },
                      ]}
                    >
                      <Text
                        style={[
                          stylesCOP.serialNoCellDetail,
                          styleExpenses.sno,
                          styleExpenses.bordernone,
                        ]}
                      >
                        12
                      </Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        5% of turnover which of minimum margin
                      </Text>
                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-to5-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(turnOver5per?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* Blank Row */}
                    <View
                      style={[
                        stylesMOF.row,
                        styles.tableRow,
                        styles.Total,
                        { border: 0 },
                      ]}
                    >
                      <Text
                        style={[
                          stylesCOP.serialNoCellDetail,
                          styleExpenses.sno,
                          styleExpenses.bordernone,
                          styles.Total,
                        ]}
                      />
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                          styles.Total,
                        ]}
                      />
                      {labels.map((_, localIdx) => (
                        <Text
                          key={`${pageIdx}-blank-12-${localIdx}`}
                          style={[
                            stylesCOP.particularsCellsDetail,
                            styleExpenses.fontSmall,
                            { paddingVertical: "5px" },
                          ]}
                        />
                      ))}
                    </View>

                    {/* 13 20% of projected turnover as per Nayak Committee Recommendation */}
                    <View
                      style={[
                        stylesMOF.row,
                        styles.tableRow,
                        { borderBottomWidth: "0px" },
                      ]}
                    >
                      <Text
                        style={[
                          stylesCOP.serialNoCellDetail,
                          styleExpenses.sno,
                          styleExpenses.bordernone,
                        ]}
                      >
                        13
                      </Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        20% of projected turnover as per Nayak Committee
                        Recommendation
                      </Text>
                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-to20-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(turnOver20per?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>
                  </View>
                </View>
              </View>

              {/* footer */}
              <View
                style={[
                  {
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
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
                  {/* CA Name (Conditional Display) */}
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

                  {/* Membership Number (Conditional Display) */}
                  {formData?.ProjectReportSetting?.MembershipNumber?.value ? (
                    <Text style={[styles.membershipNumber, { fontSize: "10px" }]}>
                      M. No.:{" "}
                      {formData?.ProjectReportSetting?.MembershipNumber?.value}
                    </Text>
                  ) : null}

                  {/* UDIN Number (Conditional Display) */}
                  {formData?.ProjectReportSetting?.UDINNumber?.value ? (
                    <Text style={[styles.udinNumber, { fontSize: "10px" }]}>
                      UDIN: {formData?.ProjectReportSetting?.UDINNumber?.value}
                    </Text>
                  ) : null}

                  {/* Mobile Number (Conditional Display) */}
                  {formData?.ProjectReportSetting?.MobileNumber?.value ? (
                    <Text style={[styles.mobileNumber, { fontSize: "10px" }]}>
                      Mob. No.:{" "}
                      {formData?.ProjectReportSetting?.MobileNumber?.value}
                    </Text>
                  ) : null}
                </View>

                {/* business name and Client Name */}
                <View
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "30px",
                    alignItems: "flex-end",
                    justifyContent: "flex-end",
                    marginTop: "30px",
                  }}
                >
                  <Text style={[styles.businessName, { fontSize: "10px" }]}>
                    {formData?.AccountInformation?.businessName ||
                      "Business Name"}
                  </Text>
                  <Text style={[styles.FinancialYear, { fontSize: "10px" }]}>
                    {formData?.AccountInformation?.businessOwner ||
                      "businessOwner"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Page>
      );
    });
  }

  return (
    <Page size="A4" style={pageStyles.page} orientation={orientation}>
      <View style={pageStyles.safeArea}>
        <View style={[styleExpenses.paddingx, { paddingBottom: "30px" }]}>
          {/* name and financial year  */}
          <Header formData={formData} />
          {/* header  */}
          <View>
            <View>
              <View style={stylesCOP.heading}>
                <Text>Assessment of Working Capital Requirements</Text>
              </View>
            </View>
          </View>
          {/* table  */}
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
              {yearLabels.map((label, idx) => (
                <Text
                  key={label || idx} // <-- Add key here
                  style={[styles.particularsCell, stylesCOP.boldText]}
                >
                  {label}
                </Text>
              ))}
            </View>
            {/* table content  */}
            <View>
              {/* first part  */}
              <View>
                {/* Blank Row  */}
                <View
                  style={[
                    stylesMOF.row,
                    styles.tableRow,
                    styles.Total,
                    {
                      border: 0,
                    },
                  ]}
                >
                  <Text
                    style={[
                      stylesCOP.serialNoCellDetail,
                      styleExpenses.sno,
                      styleExpenses.bordernone,
                      styles.Total,
                    ]}
                  ></Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                      styles.Total,
                      {},
                    ]}
                  ></Text>

                  {yearLabels.map((label, idx) => (
                    <Text
                      key={label || idx}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                        { paddingVertical: "5px" },
                      ]}
                    ></Text>
                  ))}
                </View>

                {/* 1Current Assets*/}
                <View style={[styles.tableRow, styles.totalRow]}>
                  <Text style={stylesCOP.serialNoCellDetail}>1</Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                    ]}
                  >
                    Current Assets
                  </Text>

                  {yearLabels.map((label, idx) => {
                    return (
                      <Text
                        key={idx}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                        ]}
                      >
                        {formatNumber(formData, Number(currentAssets[idx]) || 0)}
                      </Text>
                    );
                  })}
                </View>

                {/* Blank Row  */}
                <View
                  style={[
                    stylesMOF.row,
                    styles.tableRow,
                    styles.Total,
                    {
                      border: 0,
                    },
                  ]}
                >
                  <Text
                    style={[
                      stylesCOP.serialNoCellDetail,
                      styleExpenses.sno,
                      styleExpenses.bordernone,
                      styles.Total,
                    ]}
                  ></Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                      styles.Total,
                      {},
                    ]}
                  ></Text>

                  {yearLabels.map((label, idx) => (
                    <Text
                      key={label || idx}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                        { paddingVertical: "5px" },
                      ]}
                    ></Text>
                  ))}
                </View>

                {/* 2 Other Current Liabilties (less WC & TL)*/}
                <View style={[styles.tableRow, styles.totalRow]}>
                  <Text style={stylesCOP.serialNoCellDetail}>2</Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                    ]}
                  >
                    Other Current Liabilties (less WC & TL)
                  </Text>

                  {yearLabels.map((label, idx) => {
                    return (
                      <Text
                        key={idx}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                        ]}
                      >
                        {formatNumber(
                          formData,
                          Number(otherCurrLiabilities[idx]) || 0
                        )}
                      </Text>
                    );
                  })}
                </View>

                {/* Blank Row  */}
                <View
                  style={[
                    stylesMOF.row,
                    styles.tableRow,
                    styles.Total,
                    {
                      border: 0,
                    },
                  ]}
                >
                  <Text
                    style={[
                      stylesCOP.serialNoCellDetail,
                      styleExpenses.sno,
                      styleExpenses.bordernone,
                      styles.Total,
                    ]}
                  ></Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                      styles.Total,
                      {},
                    ]}
                  ></Text>

                  {yearLabels.map((label, idx) => (
                    <Text
                      key={label || idx}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                        { paddingVertical: "5px" },
                      ]}
                    ></Text>
                  ))}
                </View>

                {/* 3 Working Capital Gap (1-2)*/}
                <View style={[styles.tableRow, styles.totalRow]}>
                  <Text style={stylesCOP.serialNoCellDetail}>3</Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                    ]}
                  >
                    Working Capital Gap (1-2)
                  </Text>

                  {yearLabels.map((label, idx) => {
                    return (
                      <Text
                        key={idx}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                        ]}
                      >
                        {formatNumber(formData, Number(workingCapGap[idx]) || 0)}
                      </Text>
                    );
                  })}
                </View>

                {/* Blank Row  */}
                <View
                  style={[
                    stylesMOF.row,
                    styles.tableRow,
                    styles.Total,
                    {
                      border: 0,
                    },
                  ]}
                >
                  <Text
                    style={[
                      stylesCOP.serialNoCellDetail,
                      styleExpenses.sno,
                      styleExpenses.bordernone,
                      styles.Total,
                    ]}
                  ></Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                      styles.Total,
                      {},
                    ]}
                  ></Text>

                  {yearLabels.map((label, idx) => (
                    <Text
                      key={label || idx}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                        { paddingVertical: "5px" },
                      ]}
                    ></Text>
                  ))}
                </View>

                {/* 4 Actual / Projected Net Working Capital */}
                <View
                  style={[
                    stylesMOF.row,
                    styles.tableRow,
                    { borderBottomWidth: "0px" },
                  ]}
                >
                  <Text
                    style={[
                      stylesCOP.serialNoCellDetail,
                      styleExpenses.sno,
                      styleExpenses.bordernone,
                    ]}
                  >
                    4
                  </Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                      {},
                    ]}
                  >
                    Actual / Projected Net Working Capital
                  </Text>

                  {/* {workingCapitalLoanArr.map((val, idx) => ( */}
                  {yearLabels.map((_, idx) => (
                    <Text
                      key={idx}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                      ]}
                    >
                      {formatNumber(
                        formData,
                        Number(workingCapitalLoanArr?.[idx]) || 0
                      )}
                    </Text>
                  ))}
                </View>

                {/* Blank Row  */}
                <View
                  style={[
                    stylesMOF.row,
                    styles.tableRow,
                    styles.Total,
                    {
                      border: 0,
                    },
                  ]}
                >
                  <Text
                    style={[
                      stylesCOP.serialNoCellDetail,
                      styleExpenses.sno,
                      styleExpenses.bordernone,
                      styles.Total,
                    ]}
                  ></Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                      styles.Total,
                      {},
                    ]}
                  ></Text>

                  {yearLabels.map((label, idx) => (
                    <Text
                      key={label || idx}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                        { paddingVertical: "5px" },
                      ]}
                    ></Text>
                  ))}
                </View>

                {/* 5 Total Current Liabilities */}
                <View
                  style={[
                    stylesMOF.row,
                    styles.tableRow,
                    { borderBottomWidth: "0px" },
                  ]}
                >
                  <Text
                    style={[
                      stylesCOP.serialNoCellDetail,
                      styleExpenses.sno,
                      styleExpenses.bordernone,
                    ]}
                  >
                    5
                  </Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                      {},
                    ]}
                  >
                    Total Current Liabilities
                  </Text>

                  {totalCurrLiabilities.map((val, idx) => (
                    <Text
                      key={idx}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                      ]}
                    >
                      {formatNumber(formData, val)}
                    </Text>
                  ))}
                </View>

                {/* Blank Row  */}
                <View
                  style={[
                    stylesMOF.row,
                    styles.tableRow,
                    styles.Total,
                    {
                      border: 0,
                    },
                  ]}
                >
                  <Text
                    style={[
                      stylesCOP.serialNoCellDetail,
                      styleExpenses.sno,
                      styleExpenses.bordernone,
                      styles.Total,
                    ]}
                  ></Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                      styles.Total,
                      {},
                    ]}
                  ></Text>

                  {yearLabels.map((label, idx) => (
                    <Text
                      key={label || idx}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                        { paddingVertical: "5px" },
                      ]}
                    ></Text>
                  ))}
                </View>

                {/*6 Actual / Projected Net Working Capital (1-5) */}
                <View
                  style={[
                    stylesMOF.row,
                    styles.tableRow,
                    { borderBottomWidth: "0px" },
                  ]}
                >
                  <Text
                    style={[
                      stylesCOP.serialNoCellDetail,
                      styleExpenses.sno,
                      styleExpenses.bordernone,
                    ]}
                  >
                    6
                  </Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                      {},
                    ]}
                  >
                    Actual / Projected Net Working Capital (1-5)
                  </Text>

                  {NetWorkCap.map((val, idx) => (
                    <Text
                      key={idx}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                      ]}
                    >
                      {formatNumber(formData, val)}
                    </Text>
                  ))}
                </View>

                {/* Blank Row  */}
                <View
                  style={[
                    stylesMOF.row,
                    styles.tableRow,
                    styles.Total,
                    {
                      border: 0,
                    },
                  ]}
                >
                  <Text
                    style={[
                      stylesCOP.serialNoCellDetail,
                      styleExpenses.sno,
                      styleExpenses.bordernone,
                      styles.Total,
                    ]}
                  ></Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                      styles.Total,
                      {},
                    ]}
                  ></Text>

                  {yearLabels.map((label, idx) => (
                    <Text
                      key={label || idx}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                        { paddingVertical: "5px" },
                      ]}
                    ></Text>
                  ))}
                </View>

                {/*7 Minimum Stipulated Margin Money (25% of 3) */}
                <View
                  style={[
                    stylesMOF.row,
                    styles.tableRow,
                    { borderBottomWidth: "0px" },
                  ]}
                >
                  <Text
                    style={[
                      stylesCOP.serialNoCellDetail,
                      styleExpenses.sno,
                      styleExpenses.bordernone,
                    ]}
                  >
                    7
                  </Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                      {},
                    ]}
                  >
                    Minimum Stipulated Margin Money (25% of 3)
                  </Text>

                  {MinStipulatedMarginMoney.map((val, idx) => (
                    <Text
                      key={idx}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                      ]}
                    >
                      {formatNumber(formData, val)}
                    </Text>
                  ))}
                </View>

                {/* Blank Row  */}
                <View
                  style={[
                    stylesMOF.row,
                    styles.tableRow,
                    styles.Total,
                    {
                      border: 0,
                    },
                  ]}
                >
                  <Text
                    style={[
                      stylesCOP.serialNoCellDetail,
                      styleExpenses.sno,
                      styleExpenses.bordernone,
                      styles.Total,
                    ]}
                  ></Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                      styles.Total,
                      {},
                    ]}
                  ></Text>

                  {yearLabels.map((label, idx) => (
                    <Text
                      key={label || idx}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                        { paddingVertical: "5px" },
                      ]}
                    ></Text>
                  ))}
                </View>

                {/*8 MPBF(3-7) */}
                <View
                  style={[
                    stylesMOF.row,
                    styles.tableRow,
                    { borderBottomWidth: "0px" },
                  ]}
                >
                  <Text
                    style={[
                      stylesCOP.serialNoCellDetail,
                      styleExpenses.sno,
                      styleExpenses.bordernone,
                    ]}
                  >
                    8
                  </Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                      {},
                    ]}
                  >
                    MPBF = Working Capital Gap - Minimum Margin (3-7)
                  </Text>

                  {MPBF.map((val, idx) => (
                    <Text
                      key={idx}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                      ]}
                    >
                      {formatNumber(formData, val)}
                    </Text>
                  ))}
                </View>

                {/* Blank Row  */}
                <View
                  style={[
                    stylesMOF.row,
                    styles.tableRow,
                    styles.Total,
                    {
                      border: 0,
                    },
                  ]}
                >
                  <Text
                    style={[
                      stylesCOP.serialNoCellDetail,
                      styleExpenses.sno,
                      styleExpenses.bordernone,
                      styles.Total,
                    ]}
                  ></Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                      styles.Total,
                      {},
                    ]}
                  ></Text>

                  {yearLabels.map((label, idx) => (
                    <Text
                      key={label || idx}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                        { paddingVertical: "5px" },
                      ]}
                    ></Text>
                  ))}
                </View>

                {/*9 MPBF (3-6) */}
                <View
                  style={[
                    stylesMOF.row,
                    styles.tableRow,
                    { borderBottomWidth: "0px" },
                  ]}
                >
                  <Text
                    style={[
                      stylesCOP.serialNoCellDetail,
                      styleExpenses.sno,
                      styleExpenses.bordernone,
                    ]}
                  >
                    9
                  </Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                      {},
                    ]}
                  >
                    MPBF = Working Capital Gap - Projected Net WC (3-6)
                  </Text>

                  {MPBF3minus6.map((val, idx) => (
                    <Text
                      key={idx}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                      ]}
                    >
                      {formatNumber(formData, val)}
                    </Text>
                  ))}
                </View>

                {/* Blank Row  */}
                <View
                  style={[
                    stylesMOF.row,
                    styles.tableRow,
                    styles.Total,
                    {
                      border: 0,
                    },
                  ]}
                >
                  <Text
                    style={[
                      stylesCOP.serialNoCellDetail,
                      styleExpenses.sno,
                      styleExpenses.bordernone,
                      styles.Total,
                    ]}
                  ></Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                      styles.Total,
                      {},
                    ]}
                  ></Text>

                  {yearLabels.map((label, idx) => (
                    <Text
                      key={label || idx}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                        { paddingVertical: "5px" },
                      ]}
                    ></Text>
                  ))}
                </View>

                {/*10 MPBF (3-6) */}
                <View
                  style={[
                    stylesMOF.row,
                    styles.tableRow,
                    { borderBottomWidth: "0px" },
                  ]}
                >
                  <Text
                    style={[
                      stylesCOP.serialNoCellDetail,
                      styleExpenses.sno,
                      styleExpenses.bordernone,
                    ]}
                  >
                    10
                  </Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                      {},
                    ]}
                  >
                    Maximum permissible Bank Finance 6 or 7 whichever is less
                  </Text>

                  {/* {maxPermissible.map((val, idx) => ( */}
                  {yearLabels.map((_, idx) => (
                    <Text
                      key={idx}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                      ]}
                    >
                      {formatNumber(formData, Number(maxPermissible?.[idx]) || 0)}
                    </Text>
                  ))}
                </View>

                {/* Blank Row  */}
                <View
                  style={[
                    stylesMOF.row,
                    styles.tableRow,
                    styles.Total,
                    {
                      border: 0,
                    },
                  ]}
                >
                  <Text
                    style={[
                      stylesCOP.serialNoCellDetail,
                      styleExpenses.sno,
                      styleExpenses.bordernone,
                      styles.Total,
                    ]}
                  ></Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                      styles.Total,
                      {},
                    ]}
                  ></Text>
                  {Array.from({ length: years }).map((_, idx) => (
                    <Text
                      key={idx}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                        { paddingVertical: "5px" },
                      ]}
                    ></Text>
                  ))}
                </View>

                {/*11 Nayak Committee Anitcipated or realistic projection of turnover */}
                <View
                  style={[
                    stylesMOF.row,
                    styles.tableRow,
                    { borderBottomWidth: "0px" },
                  ]}
                >
                  <Text
                    style={[
                      stylesCOP.serialNoCellDetail,
                      styleExpenses.sno,
                      styleExpenses.bordernone,
                    ]}
                  >
                    11
                  </Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                      {},
                    ]}
                  >
                    Nayak Committee Anitcipated or realistic projection of
                    turnover
                  </Text>

                  {netSales.map((val, idx) => (
                    <Text
                      key={idx}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                      ]}
                    >
                      {formatNumber(formData, val)}
                    </Text>
                  ))}
                </View>

                {/* Blank Row  */}
                <View
                  style={[
                    stylesMOF.row,
                    styles.tableRow,
                    styles.Total,
                    {
                      border: 0,
                    },
                  ]}
                >
                  <Text
                    style={[
                      stylesCOP.serialNoCellDetail,
                      styleExpenses.sno,
                      styleExpenses.bordernone,
                      styles.Total,
                    ]}
                  ></Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                      styles.Total,
                      {},
                    ]}
                  ></Text>

                  {yearLabels.map((label, idx) => (
                    <Text
                      key={label || idx}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                        { paddingVertical: "5px" },
                      ]}
                    ></Text>
                  ))}
                </View>

                {/*12 5% of turnover which of minimum margin */}
                <View
                  style={[
                    stylesMOF.row,
                    styles.tableRow,
                    { borderBottomWidth: "0px" },
                  ]}
                >
                  <Text
                    style={[
                      stylesCOP.serialNoCellDetail,
                      styleExpenses.sno,
                      styleExpenses.bordernone,
                    ]}
                  >
                    12
                  </Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                      {},
                    ]}
                  >
                    5% of turnover which of minimum margin
                  </Text>

                  {turnOver5per.map((val, idx) => (
                    <Text
                      key={idx}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                      ]}
                    >
                      {formatNumber(formData, val)}
                    </Text>
                  ))}
                </View>

                {/* Blank Row  */}
                <View
                  style={[
                    stylesMOF.row,
                    styles.tableRow,
                    styles.Total,
                    {
                      border: 0,
                    },
                  ]}
                >
                  <Text
                    style={[
                      stylesCOP.serialNoCellDetail,
                      styleExpenses.sno,
                      styleExpenses.bordernone,
                      styles.Total,
                    ]}
                  ></Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                      styles.Total,
                      {},
                    ]}
                  ></Text>

                  {yearLabels.map((label, idx) => (
                    <Text
                      key={label || idx}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                        { paddingVertical: "5px" },
                      ]}
                    ></Text>
                  ))}
                </View>

                {/*13 20% of projected turnover as per Nayak Committee Recommendation */}
                <View
                  style={[
                    stylesMOF.row,
                    styles.tableRow,
                    { borderBottomWidth: "0px" },
                  ]}
                >
                  <Text
                    style={[
                      stylesCOP.serialNoCellDetail,
                      styleExpenses.sno,
                      styleExpenses.bordernone,
                    ]}
                  >
                    13
                  </Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                      {},
                    ]}
                  >
                    20% of projected turnover as per Nayak Committee
                    Recommendation
                  </Text>

                  {turnOver20per.map((val, idx) => (
                    <Text
                      key={idx}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                      ]}
                    >
                      {formatNumber(formData, val)}
                    </Text>
                  ))}
                </View>
              </View>
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
                  Mob. No.: {formData?.ProjectReportSetting?.MobileNumber?.value}
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

export default CMAWorkingCapReq;
