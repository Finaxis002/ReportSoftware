import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { getCMASchema } from "../Utils/CMA/cmaSchema";
import { makeCMAExtractors } from "../Utils/CMA/cmaExtractors";
import { CMAExtractorFundFlow } from "../Utils/CMA/CMAExtractorFundFlow";
import { CMAExtractorBS } from "../Utils/CMA/CMAExtractorBS";

import {
  formatNumber,
  filterActiveDirectExpenses,
} from "../Utils/CMA/financialCalcs";

import {
  styles,
  stylesCOP,
  stylesMOF,
  styleExpenses,
} from "../PDFComponents/Styles";
import { Header } from "./Header";
import PageWithFooter from "../Helpers/PageWithFooter"

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

// Main component
const CMAFundFlow = ({ formData, orientation }) => {



  const years = Number(formData?.ProjectReportSetting?.ProjectionYears || 5);
  const extractors = makeCMAExtractors(formData);
  const yearLabels = extractors.yearLabels();
  const grossSales = extractors.grossSales();
  const rawmaterial = extractors.rawMaterial();
  const directExpensesArray = extractors.directExpenses?.() || [];
  const netProfitAfterTax = extractors.netProfitAfterTax() || [];

    const projectionYears =
    parseInt(formData.ProjectReportSetting.ProjectionYears) || 0;
  // You can import these:


  console.log("form Data : ", formData);

  console.log("net Profit After Tax :", netProfitAfterTax);

  const filteredDirectExpenses = directExpensesArray.filter(
    (exp) => exp.name !== "Raw Material Expenses / Purchases"
  );

  const hasRawMaterial = rawmaterial.some((val) => Number(val) !== 0);
  const directExpenseStartSerial = hasRawMaterial ? "d" : "c";

  const FundFlowExtractor = CMAExtractorFundFlow(formData);
  const BSextractors = CMAExtractorBS(formData);
  const netProfitBeforeTax = FundFlowExtractor.netProfitBeforeTax() || [];
  const totalDepreciation = BSextractors.totalDepreciation() || [];
  const preliminaryWriteOffPerYear =
    extractors.preliminaryWriteOffPerYear() || [];
  const grossFundsGenerated = Array.from({ length: years }).map(
    (_, idx) =>
      Number(netProfitBeforeTax[idx] || 0) +
      Number(totalDepreciation[idx] || 0) +
      Number(preliminaryWriteOffPerYear[idx] || 0)
  );
  const incomeTaxCal = extractors.incomeTaxCal() || [];
  const dividendsPaid = FundFlowExtractor.dividendsPaid() || [];

  const netFundsGenerated = Array.from({ length: years }).map(
    (_, idx) =>
      Number(grossFundsGenerated[idx] || 0) - Number(incomeTaxCal[idx] || 0)
  );

  const promotersCapital = FundFlowExtractor.promotersCapital() || [];
  const bankTermLoan = FundFlowExtractor.bankTermLoan() || [];
  const fillZero = FundFlowExtractor.fillZero() || [];
  const subtotalB = FundFlowExtractor.subtotalB() || [];
  const workingCapitalLoan = FundFlowExtractor.workingCapitalLoan() || [];
  const sundryCreditorsArr = BSextractors.sundryCreditorsArr() || [];
  const totalCurrentLiabilities =
    FundFlowExtractor.totalCurrentLiabilities() || [];
  const subTotalC = Array.from({ length: years }).map(
    (_, i) =>
      Number(workingCapitalLoan[i] || 0) + Number(sundryCreditorsArr[i] || 0)
  );

  const totalFunds = Array.from({ length: years }).map(
    (_, idx) =>
      Number(netFundsGenerated[idx] || 0) +
      Number(subtotalB[idx] || 0) +
      Number(subTotalC[idx] || 0)
  );

  const firstYearGrossFixedAssets =
    FundFlowExtractor.firstYearGrossFixedAssets() || [];
  const repaymentOfTermLoan = FundFlowExtractor.repaymentOfTermLoan() || [];
  const subTotalD = FundFlowExtractor.subTotalD() || [];
  const inventory = FundFlowExtractor.inventory() || [];
  const sundryDebitorsArr = FundFlowExtractor.sundryDebitorsArr() || [];
  const totalCurrentAssets = FundFlowExtractor.totalCurrentAssets() || [];
  const SubTotalE = FundFlowExtractor.SubTotalE() || [];
  const withdrawals = FundFlowExtractor.withdrawals() || [];

  const otherTermLiabilities = (BSextractors.otherTermLiabilities() || []).slice(0, projectionYears);
  const investments = BSextractors.investments() || [];

  const TOTALFUNDSUSED = Array.from({ length: years }).map(
    (_, idx) =>
      Number(subTotalD[idx] || 0) +
      Number(SubTotalE[idx] || 0) +
      Number(withdrawals[idx] || 0)
  );

  const longTermSources = Array.from({ length: years }).map(
    (_, idx) =>
      Number(netFundsGenerated[idx] || 0) + Number(subtotalB[idx] || 0)
  );

  const surplusShortfall = Array.from({ length: years }).map(
    (_, idx) => Number(longTermSources[idx] || 0) - Number(subTotalD[idx] || 0)
  );

  const shortTermUses = Array.from({ length: years }).map(
    (_, idx) => Number(SubTotalE[idx] || 0) + Number(withdrawals[idx] || 0)
  );

  const surplusShortfall2 = Array.from({ length: years }).map(
    (_, idx) => Number(subTotalC[idx] || 0) - Number(shortTermUses[idx] || 0)
  );

  const isAdvancedLandscape = orientation === "advanced-landscape";
  let splitYearLabels = [yearLabels];
  let splitFinancialYearLabels = [yearLabels];
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
                      Fund Flow Statement
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

                  {/* Generate Dynamic Year Headers using labels for this page */}
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

                    {/* 1 Sales */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>1</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Sales
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-sales-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(grossSales?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* 2 Net profit before tax */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>2</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Net Profit Before Tax
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-npbt-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(netProfitBeforeTax?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* Depreciation */}
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
                        Add:
                      </Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Depreciation
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-dep-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(totalDepreciation?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* 4 Preliminary Expenses Written Off */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>Add:</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Preliminary Expenses Written Off
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-prewrite-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(preliminaryWriteOffPerYear?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* Gross funds generated */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail} />
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Gross funds generated
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-gfg-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(grossFundsGenerated?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* Less: Taxes paid / payable */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>Less:</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Taxes paid / payable
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-taxes-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(incomeTaxCal?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* Dividends paid / payable */}
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
                        Less:
                      </Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Dividends paid / payable
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-div-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(dividendsPaid?.[gIdx]) || 0
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

                    {/* Net funds generated - Sub-total (A) */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text
                        style={[stylesCOP.serialNoCellDetail, styles.Total]}
                      />
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                          styles.Total,
                        ]}
                      >
                        Net funds generated - Sub-total (A)
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-nfgA-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              stylesCOP.boldText,
                              styleExpenses.fontSmall,
                              { borderLeftWidth: "0px", borderBottomWidth: 0 },
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(netFundsGenerated?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* Increase in capital */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>Less:</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Increase in capital
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-inc-cap-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(promotersCapital?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* Increase in term loans */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>Less:</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Increase in term loans
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-inc-tl-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(bankTermLoan?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* Increase in unsecured loans */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>Less:</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Increase in unsecured loans
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-otl-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(otherTermLiabilities?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* Increase in Subsidy / Decrease in fixed assets / Decrease in inter-corp. invt. and advances / Decrease in other non-current assets */}
                    {[
                      "Increase in Subsidy",
                      "Decrease in fixed assets",
                      "Decrease in inter-corp. invt. and advances",
                      "Decrease in other non-current assets",
                    ].map((labelTxt, blockIdx) => (
                      <View
                        key={`${pageIdx}-blockB-${blockIdx}`}
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
                        />
                        <Text
                          style={[
                            stylesCOP.detailsCellDetail,
                            styleExpenses.particularWidth,
                            styleExpenses.bordernone,
                          ]}
                        >
                          {labelTxt}
                        </Text>

                        {labels.map((_, localIdx) => {
                          const gIdx = globalIndex(localIdx);
                          return (
                            <Text
                              key={`${pageIdx}-fillzeroB-${blockIdx}-${localIdx}`}
                              style={[
                                stylesCOP.particularsCellsDetail,
                                styleExpenses.fontSmall,
                              ]}
                            >
                              {formatNumber(
                                formData,
                                Number(fillZero?.[gIdx]) || 0
                              )}
                            </Text>
                          );
                        })}
                      </View>
                    ))}

                    {/* Sub-total (B) */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text
                        style={[stylesCOP.serialNoCellDetail, styles.Total]}
                      />
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                          styles.Total,
                        ]}
                      >
                        Sub-total (B)
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-subB-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              stylesCOP.boldText,
                              styleExpenses.fontSmall,
                              { borderLeftWidth: "0px", borderBottomWidth: 0 },
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(subtotalB?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* Increase in short terms bank borrowings */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail} />
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Increase in short terms bank borrowings
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-inc-stbb-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(workingCapitalLoan?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* Increase in bills purchased & discounted */}
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
                      />
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Increase in bills purchased & discounted
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-inc-bpd-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(fillZero?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* Increase in Sundry Creditors */}
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
                      />
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Increase in Sundry Creditors
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-inc-sc-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(sundryCreditorsArr?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* Increase in other current liabilities */}
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
                      />
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Increase in other current liabilities
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-inc-ocl-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(totalCurrentLiabilities?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* Decrease in other current assets / Decrease in receivables / Decrease in other current assets */}
                    {[
                      "Decrease in other current assets",
                      "Decrease in receivables",
                      "Decrease in other current assets",
                    ].map((labelTxt, blockIdx) => (
                      <View
                        key={`${pageIdx}-blockC-${blockIdx}`}
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
                        />
                        <Text
                          style={[
                            stylesCOP.detailsCellDetail,
                            styleExpenses.particularWidth,
                            styleExpenses.bordernone,
                          ]}
                        >
                          {labelTxt}
                        </Text>

                        {labels.map((_, localIdx) => {
                          const gIdx = globalIndex(localIdx);
                          return (
                            <Text
                              key={`${pageIdx}-fillzeroC-${blockIdx}-${localIdx}`}
                              style={[
                                stylesCOP.particularsCellsDetail,
                                styleExpenses.fontSmall,
                              ]}
                            >
                              {formatNumber(
                                formData,
                                Number(fillZero?.[gIdx]) || 0
                              )}
                            </Text>
                          );
                        })}
                      </View>
                    ))}

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

                    {/* Sub-total (C) */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text
                        style={[stylesCOP.serialNoCellDetail, styles.Total]}
                      />
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                          styles.Total,
                        ]}
                      >
                        Sub-total (C)
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-subC-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              stylesCOP.boldText,
                              styleExpenses.fontSmall,
                              { borderLeftWidth: "0px", borderBottomWidth: 0 },
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(subTotalC?.[gIdx]) || 0
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

                    {/* Total funds available (A+B+C) */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text
                        style={[stylesCOP.serialNoCellDetail, styles.Total]}
                      />
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                          styles.Total,
                        ]}
                      >
                        Total funds available (A+B+C)
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-tfa-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              stylesCOP.boldText,
                              styleExpenses.fontSmall,
                              { borderLeftWidth: "0px", borderBottomWidth: 0 },
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(totalFunds?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* Uses */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text
                        style={[
                          stylesCOP.serialNoCellDetail,
                          styles.Total,
                          { paddingVertical: "10px" },
                        ]}
                      />
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                          styles.Total,
                          { paddingVertical: "10px" },
                        ]}
                      >
                        Uses
                      </Text>
                      {labels.map((_, localIdx) => (
                        <Text
                          key={`${pageIdx}-uses-hdr-${localIdx}`}
                          style={[
                            stylesCOP.particularsCellsDetail,
                            styleExpenses.fontSmall,
                          ]}
                        />
                      ))}
                    </View>

                    {/* Increase in fixed assets */}
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
                      />
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Increase in fixed assets
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-inc-fa-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(firstYearGrossFixedAssets?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* Decrease in term loans / debentures */}
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
                      />
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Decrease in term loans / debentures
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-dec-tl-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(repaymentOfTermLoan?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* Deferred payment liabilities / Decrease in unsecured loan / Increase in inter-corp. invt. & advances / Increase in other non-current assets */}
                    {[
                      "Deferred payment liablities",
                      "Decrease in unsecured loan",
                      "Increase in inter-corp. invt. & advances",
                    ].map((labelTxt, blockIdx) => (
                      <View
                        key={`${pageIdx}-blockD-${blockIdx}`}
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
                        />
                        <Text
                          style={[
                            stylesCOP.detailsCellDetail,
                            styleExpenses.particularWidth,
                            styleExpenses.bordernone,
                          ]}
                        >
                          {labelTxt}
                        </Text>

                        {labels.map((_, localIdx) => {
                          const gIdx = globalIndex(localIdx);
                          return (
                            <Text
                              key={`${pageIdx}-fillzeroD-${blockIdx}-${localIdx}`}
                              style={[
                                stylesCOP.particularsCellsDetail,
                                styleExpenses.fontSmall,
                              ]}
                            >
                              {formatNumber(
                                formData,
                                Number(fillZero?.[gIdx]) || 0
                              )}
                            </Text>
                          );
                        })}
                      </View>
                    ))}

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
                      />
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Increase in other non-current assets
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-dec-tl-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(investments?.[gIdx]) || 0
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

                    {/* Sub-total (D) */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text
                        style={[stylesCOP.serialNoCellDetail, styles.Total]}
                      />
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                          styles.Total,
                        ]}
                      >
                        Sub-total (D)
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-subD-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              stylesCOP.boldText,
                              styleExpenses.fontSmall,
                              { borderLeftWidth: "0px", borderBottomWidth: 0 },
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(subTotalD?.[gIdx]) || 0
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

                    {/* Decrease in short term borrowings / Decrease in bills purchased / discounted / Decrease in other current liabilities */}
                    {[
                      "Decrease in short term borrowings",
                      "Decrease in bills purchased / discounted",
                      "Decrease in other current liabilities",
                    ].map((labelTxt, blockIdx) => (
                      <View
                        key={`${pageIdx}-blockE-${blockIdx}`}
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
                        />
                        <Text
                          style={[
                            stylesCOP.detailsCellDetail,
                            styleExpenses.particularWidth,
                            styleExpenses.bordernone,
                          ]}
                        >
                          {labelTxt}
                        </Text>

                        {labels.map((_, localIdx) => {
                          const gIdx = globalIndex(localIdx);
                          return (
                            <Text
                              key={`${pageIdx}-fillzeroE-${blockIdx}-${localIdx}`}
                              style={[
                                stylesCOP.particularsCellsDetail,
                                styleExpenses.fontSmall,
                              ]}
                            >
                              {formatNumber(
                                formData,
                                Number(fillZero?.[gIdx]) || 0
                              )}
                            </Text>
                          );
                        })}
                      </View>
                    ))}

                    {/* Increase in inventory */}
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
                      />
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Increase in inventory
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-inc-inv-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(inventory?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* Increase in receivables */}
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
                      />
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Increase in receivables
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-inc-rec-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(sundryDebitorsArr?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* Increase in other current assets (Cash & CE) */}
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
                      />
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Increase in other current assets (Cash & CE)
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-inc-oca-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(totalCurrentAssets?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* Sub-total (E) */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text
                        style={[stylesCOP.serialNoCellDetail, styles.Total]}
                      />
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                          styles.Total,
                        ]}
                      >
                        Sub-total (E)
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-subE-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              stylesCOP.boldText,
                              styleExpenses.fontSmall,
                              { borderLeftWidth: "0px", borderBottomWidth: 0 },
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(SubTotalE?.[gIdx]) || 0
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

                    {/* Withdrawals */}
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
                      />
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Withdrawals
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-withdrawals-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(withdrawals?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* Less: Depreciation / Balance i.e. Gross funds lost (-) / or Gross funds generated (+) */}
                    {[
                      "Less: Depreciation",
                      "Balance i.e. Gross funds lost (-)",
                      "or Gross funds generated (+)",
                    ].map((labelTxt, blockIdx) => (
                      <View
                        key={`${pageIdx}-blockF-${blockIdx}`}
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
                        />
                        <Text
                          style={[
                            stylesCOP.detailsCellDetail,
                            styleExpenses.particularWidth,
                            styleExpenses.bordernone,
                          ]}
                        >
                          {labelTxt}
                        </Text>

                        {labels.map((_, localIdx) => {
                          const gIdx = globalIndex(localIdx);
                          return (
                            <Text
                              key={`${pageIdx}-fillzeroF-${blockIdx}-${localIdx}`}
                              style={[
                                stylesCOP.particularsCellsDetail,
                                styleExpenses.fontSmall,
                              ]}
                            >
                              {formatNumber(
                                formData,
                                Number(fillZero?.[gIdx]) || 0
                              )}
                            </Text>
                          );
                        })}
                      </View>
                    ))}

                    {/* Net funds lost - Sub-total (F) */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text
                        style={[stylesCOP.serialNoCellDetail, styles.Total]}
                      />
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                          styles.Total,
                        ]}
                      >
                        Net funds lost - Sub-total (F)
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-subF-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              stylesCOP.boldText,
                              styleExpenses.fontSmall,
                              { borderLeftWidth: "0px", borderBottomWidth: 0 },
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(withdrawals?.[gIdx]) || 0
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

                    {/* TOTAL FUNDS USED (D+E+F) */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text
                        style={[stylesCOP.serialNoCellDetail, styles.Total]}
                      />
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                          styles.Total,
                        ]}
                      >
                        TOTAL FUNDS USED (D+E+F)
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-tfu-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              stylesCOP.boldText,
                              styleExpenses.fontSmall,
                              { borderLeftWidth: "0px", borderBottomWidth: 0 },
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(TOTALFUNDSUSED?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* Summary: */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text
                        style={[
                          stylesCOP.serialNoCellDetail,
                          styles.Total,
                          { paddingVertical: "10px" },
                        ]}
                      />
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                          styles.Total,
                          { paddingVertical: "10px" },
                        ]}
                      >
                        Summary:
                      </Text>
                      {labels.map((_, localIdx) => (
                        <Text
                          key={`${pageIdx}-summary-hdr-${localIdx}`}
                          style={[
                            stylesCOP.particularsCellsDetail,
                            styleExpenses.fontSmall,
                          ]}
                        />
                      ))}
                    </View>

                    {/* Long term sources */}
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
                      />
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Long term sources
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-lts-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(longTermSources?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* Long term uses */}
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
                        Less:
                      </Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Long term uses
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-ltu-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(subTotalD?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* Surplus (+) / Shortfall (-) */}
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
                      />
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Surplus (+) / Shortfall (-)
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-surplus1-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(surplusShortfall?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* Short term sources */}
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
                      />
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Short term sources
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-sts-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(subTotalC?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* Short term uses */}
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
                        Less:
                      </Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Short term uses
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-stu-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(shortTermUses?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* Surplus (+) / Shortfall (-) */}
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
                      />
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Surplus (+) / Shortfall (-)
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-surplus2-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(surplusShortfall2?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>
                  </View>
                </View>
              </View>

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
                    <Text
                      style={[styles.membershipNumber, { fontSize: "10px" }]}
                    >
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

                {/* business name and Client Name  */}
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
                <Text>Fund Flow Statement</Text>
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
                {/* 1 Sales */}
                <View style={[styles.tableRow, styles.totalRow]}>
                  <Text style={stylesCOP.serialNoCellDetail}>1</Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                    ]}
                  >
                    Sales
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
                        {formatNumber(formData, Number(grossSales[idx]) || 0)}
                      </Text>
                    );
                  })}
                </View>

                {/* 2 net profit before tax */}
                <View style={[styles.tableRow, styles.totalRow]}>
                  <Text style={stylesCOP.serialNoCellDetail}>2</Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                    ]}
                  >
                    Net Profit Before Tax
                  </Text>

                  {netProfitBeforeTax.map((val, idx) => (
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

                {/* Depreciation */}
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
                    Add:
                  </Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                      {},
                    ]}
                  >
                    Depreciation
                  </Text>

                  {totalDepreciation.map((val, idx) => (
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

                {/* 4 Preliminary Expenses Written Off */}
                <View style={[styles.tableRow, styles.totalRow]}>
                  <Text style={stylesCOP.serialNoCellDetail}>Add:</Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                    ]}
                  >
                    Preliminary Expenses Written Off
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
                          Number(preliminaryWriteOffPerYear[idx]) || 0
                        )}
                      </Text>
                    );
                  })}
                </View>

                {/*Gross funds generated  */}
                <View style={[styles.tableRow, styles.totalRow]}>
                  <Text style={stylesCOP.serialNoCellDetail}></Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                    ]}
                  >
                    Gross funds generated
                  </Text>

                  {grossFundsGenerated.map((val, idx) => (
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

                {/* Less: Taxes paid / payable */}
                <View style={[styles.tableRow, styles.totalRow]}>
                  <Text style={stylesCOP.serialNoCellDetail}>Less:</Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                    ]}
                  >
                    Taxes paid / payable
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
                        {formatNumber(formData, Number(incomeTaxCal[idx]) || 0)}
                      </Text>
                    );
                  })}
                </View>

                {/* Dividends paid / payable */}
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
                    Less:
                  </Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                      {},
                    ]}
                  >
                    Dividends paid / payable
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
                          Number(dividendsPaid[idx]) || 0
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

                {/* Net funds generated - Sub-total (A)   */}
                <View style={[styles.tableRow, styles.totalRow]}>
                  <Text
                    style={[stylesCOP.serialNoCellDetail, styles.Total]}
                  ></Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                      styles.Total,
                    ]}
                  >
                    Net funds generated - Sub-total (A)
                  </Text>

                  {netFundsGenerated.map((val, idx) => (
                    <Text
                      key={idx}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        stylesCOP.boldText,
                        styleExpenses.fontSmall,
                        {
                          borderLeftWidth: "0px",
                          borderBottomWidth: 0,
                        },
                      ]}
                    >
                      {formatNumber(formData, val)}
                    </Text>
                  ))}
                </View>

                {/* Increase in capital */}
                <View style={[styles.tableRow, styles.totalRow]}>
                  <Text style={stylesCOP.serialNoCellDetail}>Less:</Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                    ]}
                  >
                    Increase in capital
                  </Text>

                  {promotersCapital.map((val, idx) => {
                    return (
                      <Text
                        key={idx}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                        ]}
                      >
                        {formatNumber(formData, val)}
                      </Text>
                    );
                  })}
                </View>

                {/* Increase in term loans */}
                <View style={[styles.tableRow, styles.totalRow]}>
                  <Text style={stylesCOP.serialNoCellDetail}>Less:</Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                    ]}
                  >
                    Increase in term loans
                  </Text>

                  {bankTermLoan.map((val, idx) => {
                    return (
                      <Text
                        key={idx}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                        ]}
                      >
                        {formatNumber(formData, val)}
                      </Text>
                    );
                  })}
                </View>

                {/* Increase in unsecured loans */}
                <View style={[styles.tableRow, styles.totalRow]}>
                  <Text style={stylesCOP.serialNoCellDetail}>Less:</Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                    ]}
                  >
                    Increase in unsecured loans
                  </Text>

                  {otherTermLiabilities.map((val, idx) => {
                    return (
                      <Text
                        key={idx}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                        ]}
                      >
                        {formatNumber(formData, val)}
                      </Text>
                    );
                  })}
                </View>

                {/* "Increase in Subsidy",
                "Decrease in fixed assets",
                "Decrease in inter-corp. invt. and advances",
                "Decrease in other non-current assets", */}
                {[
                  "Increase in Subsidy",
                  "Decrease in fixed assets",
                  "Decrease in inter-corp. invt. and advances",
                  "Decrease in other non-current assets",
                ].map((label, idx) => (
                  <View
                    key={idx}
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
                    ></Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                        {},
                      ]}
                    >
                      {label}
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
                          {formatNumber(formData, Number(fillZero[idx]) || 0)}
                        </Text>
                      );
                    })}
                  </View>
                ))}

                {/* Sub-total (B)   */}
                <View style={[styles.tableRow, styles.totalRow]}>
                  <Text
                    style={[stylesCOP.serialNoCellDetail, styles.Total]}
                  ></Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                      styles.Total,
                    ]}
                  >
                    Sub-total (B)
                  </Text>

                  {subtotalB.map((val, idx) => (
                    <Text
                      key={idx}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        stylesCOP.boldText,
                        styleExpenses.fontSmall,
                        {
                          borderLeftWidth: "0px",
                          borderBottomWidth: 0,
                        },
                      ]}
                    >
                      {formatNumber(formData, val)}
                    </Text>
                  ))}
                </View>

                {/* Increase in short terms bank borrowings */}
                <View style={[styles.tableRow, styles.totalRow]}>
                  <Text style={stylesCOP.serialNoCellDetail}></Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                    ]}
                  >
                    Increase in short terms bank borrowings
                  </Text>

                  {workingCapitalLoan.map((val, idx) => {
                    return (
                      <Text
                        key={idx}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                        ]}
                      >
                        {formatNumber(formData, val)}
                      </Text>
                    );
                  })}
                </View>

                {/* Increase in bills purchased & discounted */}
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
                  ></Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                      {},
                    ]}
                  >
                    Increase in bills purchased & discounted
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
                        {formatNumber(formData, Number(fillZero[idx]) || 0)}
                      </Text>
                    );
                  })}
                </View>

                {/* Increase in Sundry Creditors */}
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
                  ></Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                      {},
                    ]}
                  >
                    Increase in Sundry Creditors
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
                          Number(sundryCreditorsArr[idx]) || 0
                        )}
                      </Text>
                    );
                  })}
                </View>

                {/* Increase in other current liabilities */}
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
                  ></Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                      {},
                    ]}
                  >
                    Increase in other current liabilities
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
                          Number(totalCurrentLiabilities[idx]) || 0
                        )}
                      </Text>
                    );
                  })}
                </View>

                {/* 'Decrease in other current assets',  'Decrease in receivables', 'Decrease in other current assets' */}
                {[
                  "Decrease in other current assets",
                  "Decrease in receivables",
                  "Decrease in other current assets",
                ].map((label, idx) => (
                  <View
                    key={idx}
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
                    ></Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                        {},
                      ]}
                    >
                      {label}
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
                          {formatNumber(formData, Number(fillZero[idx]) || 0)}
                        </Text>
                      );
                    })}
                  </View>
                ))}

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

                {/* sub total c  */}
                <View style={[styles.tableRow, styles.totalRow]}>
                  <Text
                    style={[stylesCOP.serialNoCellDetail, styles.Total]}
                  ></Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                      styles.Total,
                    ]}
                  >
                    Sub-total (C)
                  </Text>

                  {subTotalC.map((val, idx) => (
                    <Text
                      key={idx}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        stylesCOP.boldText,
                        styleExpenses.fontSmall,
                        {
                          borderLeftWidth: "0px",
                          borderBottomWidth: 0,
                        },
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

                {/* Total funds available (A+B+C) */}
                <View style={[styles.tableRow, styles.totalRow]}>
                  <Text
                    style={[stylesCOP.serialNoCellDetail, styles.Total]}
                  ></Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                      styles.Total,
                    ]}
                  >
                    Total funds available (A+B+C)
                  </Text>

                  {totalFunds.map((val, idx) => (
                    <Text
                      key={idx}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        stylesCOP.boldText,
                        styleExpenses.fontSmall,
                        {
                          borderLeftWidth: "0px",
                          borderBottomWidth: 0,
                        },
                      ]}
                    >
                      {formatNumber(formData, val)}
                    </Text>
                  ))}
                </View>

                {/* Uses  */}
                <View style={[styles.tableRow, styles.totalRow]}>
                  <Text
                    style={[
                      stylesCOP.serialNoCellDetail,
                      styles.Total,
                      { paddingVertical: "10px" },
                    ]}
                  ></Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                      styles.Total,
                      { paddingVertical: "10px" },
                    ]}
                  >
                    Uses
                  </Text>
                  {yearLabels.map((label, idx) => {
                    return (
                      <Text
                        key={idx}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                        ]}
                      ></Text>
                    );
                  })}
                </View>

                {/* Increase in fixed assets */}
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
                  ></Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                      {},
                    ]}
                  >
                    Increase in fixed assets
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
                          Number(firstYearGrossFixedAssets[idx]) || 0
                        )}
                      </Text>
                    );
                  })}
                </View>

                {/* Decrease in term loans / debentures */}
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
                  ></Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                      {},
                    ]}
                  >
                    Decrease in term loans / debentures
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
                          Number(repaymentOfTermLoan[idx]) || 0
                        )}
                      </Text>
                    );
                  })}
                </View>

                {[
                  "Deferred payment liablities",
                  "Decrease in unsecured loan",
                  "Increase in inter-corp. invt. & advances",
                ].map((label, idx) => (
                  <View
                    key={idx}
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
                    ></Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                        {},
                      ]}
                    >
                      {label}
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
                          {formatNumber(formData, Number(fillZero[idx]) || 0)}
                        </Text>
                      );
                    })}
                  </View>
                ))}

                {/* Increase in other non-current assets */}

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
                  ></Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                      {},
                    ]}
                  >
                    Increase in other non-current assets
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
                        {formatNumber(formData, Number(investments[idx]) || 0)}
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

                {/* sub total D */}
                <View style={[styles.tableRow, styles.totalRow]}>
                  <Text
                    style={[stylesCOP.serialNoCellDetail, styles.Total]}
                  ></Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                      styles.Total,
                    ]}
                  >
                    Sub-total (D)
                  </Text>

                  {subTotalD.map((val, idx) => (
                    <Text
                      key={idx}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        stylesCOP.boldText,
                        styleExpenses.fontSmall,
                        {
                          borderLeftWidth: "0px",
                          borderBottomWidth: 0,
                        },
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

                {/* 'Decrease in short term borrowings',
                 'Decrease in bills purchased / discounted',
                 'Decrease in other current liabilities' */}
                {[
                  "Decrease in short term borrowings",
                  "Decrease in bills purchased / discounted",
                  "Decrease in other current liabilities",
                ].map((label, idx) => (
                  <View
                    key={idx}
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
                    ></Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                        {},
                      ]}
                    >
                      {label}
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
                          {formatNumber(formData, Number(fillZero[idx]) || 0)}
                        </Text>
                      );
                    })}
                  </View>
                ))}

                {/* Increase in inventory */}
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
                  ></Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                      {},
                    ]}
                  >
                    Increase in inventory
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
                        {formatNumber(formData, Number(inventory[idx]) || 0)}
                      </Text>
                    );
                  })}
                </View>

                {/* Increase in receivables */}
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
                  ></Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                      {},
                    ]}
                  >
                    Increase in receivables
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
                          Number(sundryDebitorsArr[idx]) || 0
                        )}
                      </Text>
                    );
                  })}
                </View>

                {/* Increase in other current assets (Cash & CE) */}
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
                  ></Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                      {},
                    ]}
                  >
                    Increase in other current assets (Cash & CE)
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
                          Number(totalCurrentAssets[idx]) || 0
                        )}
                      </Text>
                    );
                  })}
                </View>

                {/* sub total E */}
                <View style={[styles.tableRow, styles.totalRow]}>
                  <Text
                    style={[stylesCOP.serialNoCellDetail, styles.Total]}
                  ></Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                      styles.Total,
                    ]}
                  >
                    Sub-total (E)
                  </Text>

                  {SubTotalE.map((val, idx) => (
                    <Text
                      key={idx}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        stylesCOP.boldText,
                        styleExpenses.fontSmall,
                        {
                          borderLeftWidth: "0px",
                          borderBottomWidth: 0,
                        },
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

                {/*Withdrawals */}
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
                  ></Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                      {},
                    ]}
                  >
                    Withdrawals
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
                        {formatNumber(formData, Number(withdrawals[idx]) || 0)}
                      </Text>
                    );
                  })}
                </View>

                {[
                  "Less: Depreciation",
                  "Balance i.e. Gross funds lost (-)",
                  "or Gross funds generated (+)",
                ].map((label, idx) => (
                  <View
                    key={idx}
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
                    ></Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                        {},
                      ]}
                    >
                      {label}
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
                          {formatNumber(formData, Number(fillZero[idx]) || 0)}
                        </Text>
                      );
                    })}
                  </View>
                ))}

                {/* Net funds lost - Sub-total (F) */}
                <View style={[styles.tableRow, styles.totalRow]}>
                  <Text
                    style={[stylesCOP.serialNoCellDetail, styles.Total]}
                  ></Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                      styles.Total,
                    ]}
                  >
                    Net funds lost - Sub-total (F)
                  </Text>

                  {withdrawals.slice(0, projectionYears).map((val, idx) => (
                    <Text
                      key={idx}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        stylesCOP.boldText,
                        styleExpenses.fontSmall,
                        {
                          borderLeftWidth: "0px",
                          borderBottomWidth: 0,
                        },
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

                {/*TOTAL FUNDS USED (D+E+F) */}
                <View style={[styles.tableRow, styles.totalRow]}>
                  <Text
                    style={[stylesCOP.serialNoCellDetail, styles.Total]}
                  ></Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                      styles.Total,
                    ]}
                  >
                    TOTAL FUNDS USED (D+E+F)
                  </Text>

                  {TOTALFUNDSUSED.slice(0, projectionYears).map((val, idx) => (
                    <Text
                      key={idx}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        stylesCOP.boldText,
                        styleExpenses.fontSmall,
                        {
                          borderLeftWidth: "0px",
                          borderBottomWidth: 0,
                        },
                      ]}
                    >
                      {formatNumber(formData, val)}
                    </Text>
                  ))}
                </View>

                {/* Summary: */}
                <View style={[styles.tableRow, styles.totalRow]}>
                  <Text
                    style={[
                      stylesCOP.serialNoCellDetail,
                      styles.Total,
                      { paddingVertical: "10px" },
                    ]}
                  ></Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                      styles.Total,
                      { paddingVertical: "10px" },
                    ]}
                  >
                    Summary:
                  </Text>
                  {yearLabels.map((label, idx) => {
                    return (
                      <Text
                        key={idx}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                        ]}
                      ></Text>
                    );
                  })}
                </View>

                {/*Long term sources */}
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
                  ></Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                      {},
                    ]}
                  >
                    Long term sources
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
                          Number(longTermSources[idx]) || 0
                        )}
                      </Text>
                    );
                  })}
                </View>

                {/*Long term uses */}
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
                    Less:
                  </Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                      {},
                    ]}
                  >
                    Long term uses
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
                        {formatNumber(formData, Number(subTotalD[idx]) || 0)}
                      </Text>
                    );
                  })}
                </View>

                {/* Surplus (+) / Shortfall (-) */}
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
                  ></Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                      {},
                    ]}
                  >
                    Surplus (+) / Shortfall (-)
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
                          Number(surplusShortfall[idx]) || 0
                        )}
                      </Text>
                    );
                  })}
                </View>

                {/* Short term sources */}
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
                  ></Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                      {},
                    ]}
                  >
                    Short term sources
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
                        {formatNumber(formData, Number(subTotalC[idx]) || 0)}
                      </Text>
                    );
                  })}
                </View>

                {/* Short term uses */}
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
                    Less:
                  </Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                      {},
                    ]}
                  >
                    Short term uses
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
                          Number(shortTermUses[idx]) || 0
                        )}
                      </Text>
                    );
                  })}
                </View>

                {/* Surplus (+) / Shortfall (-) */}
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
                  ></Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                      {},
                    ]}
                  >
                    Surplus (+) / Shortfall (-)
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
                          Number(surplusShortfall2[idx]) || 0
                        )}
                      </Text>
                    );
                  })}
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

export default CMAFundFlow;
