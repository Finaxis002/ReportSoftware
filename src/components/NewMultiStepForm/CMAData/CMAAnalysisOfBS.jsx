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

// Font registration (optional)
Font.register({
  family: "Roboto",
  src: "https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Me5Q.ttf",
});

const format = (n) => (n == null ? "" : Number(n).toLocaleString("en-IN"));

// Main component
const CMAAnalysisOfBS = ({ formData, orientation }) => {
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

  const extractors = makeCMAExtractors(formData);
  const yearLabels = extractors.yearLabels();

  const BSextractors = CMAExtractorBS(formData);
  const years = Number(formData?.ProjectReportSetting?.ProjectionYears || 5);
  const workingCapitalLoanArr = BSextractors.workingCapitalLoanArr() || [];
  const fromOtherBanks = BSextractors.fromOtherBanks() || [];
  const SubTotal = yearLabels.map(
    (_, idx) =>
      Number(workingCapitalLoanArr[idx] || 0) + Number(fromOtherBanks[idx] || 0)
  );
  const shortTermBorrowings = BSextractors.shortTermBorrowings() || [];
  const sundryCreditorsArr = BSextractors.sundryCreditorsArr() || [];
  const capitalGoods = BSextractors.capitalGoods() || [];
  const taxation = BSextractors.taxation() || [];
  const dividend = BSextractors.dividend() || [];
  const statutoryLiab = BSextractors.statutoryLiab() || [];
  const repaymentValueswithin12months =
    BSextractors.repaymentValueswithin12months() || [];
  const otherCurrentLiabilitiesTotal =
    BSextractors.otherCurrentLiabilitiesTotal() || [];
  const subTotalB = BSextractors.subTotalB() || [];

  const totalAandB = Array.from({ length: years }).map(
    (_, idx) => Number(SubTotal[idx] || 0) + Number(subTotalB[idx] || 0)
  );

  const debentures = BSextractors.debentures() || [];
  const preferenceShares = BSextractors.preferenceShares() || [];
  const bankTermLoanArr = BSextractors.bankTermLoanArr() || [];
  const vehicleLoan = BSextractors.vehicleLoan() || [];
  const deferredTaxLiability = BSextractors.deferredTaxLiability() || [];
  const otherTermLiabilities = BSextractors.otherTermLiabilities() || [];
  const totalTermLiabilities = BSextractors.totalTermLiabilities() || [];

  const totalOutsidersLiabilities = Array.from({ length: years }).map(
    (_, idx) =>
      Number(totalAandB[idx] || 0) + Number(totalTermLiabilities[idx] || 0)
  );

  const shareCapital = BSextractors.shareCapital() || [];
  const generalReserve = BSextractors.generalReserve() || [];
  const subsidy = BSextractors.subsidy() || [];
  const otherReserve = BSextractors.otherReserve() || [];
  const reservesAndSurplusArr = BSextractors.reservesAndSurplusArr() || [];
  const netWorth = BSextractors.netWorth() || [];

  const totalLiabilities = Array.from({ length: years }).map(
    (_, idx) =>
      Number(totalOutsidersLiabilities[idx] || 0) + Number(netWorth[idx] || 0)
  );

 

  const investments = BSextractors.investments() || [];
  const fixedDeposits = BSextractors.fixedDeposits() || [];
  const exportsIncludingBpBd = BSextractors.exportsIncludingBpBd() || [];
  const exportReceivables = BSextractors.exportReceivables() || [];
  const instalments = BSextractors.instalments() || [];
  const rawMaterialInventory = BSextractors.rawMaterialInventory() || [];
  const stockProcess = BSextractors.stockProcess() || [];
  const inventoryArr = BSextractors.inventoryArr() || [];
  const consumableSpares = BSextractors.consumableSpares() || [];
  const advancesToSuppliers = BSextractors.advancesToSuppliers() || [];
  const paymentOfTaxes = BSextractors.paymentOfTaxes() || [];
  const otherCurrentAssetsTotal = BSextractors.otherCurrentAssetsTotal() || [];
  const totalCurrentAssets = BSextractors.totalCurrentAssets() || [];
  const grossFixedAssetsPerYear = BSextractors.grossFixedAssetsPerYear() || [];
  const isFixedAssetsZero = grossFixedAssetsPerYear.every(
    (value) => value === 0
  );
  const totalDepreciation = BSextractors.totalDepreciation() || [];
  const netBlock = BSextractors.netBlock() || [];
  const invBookDebt = BSextractors.invBookDebt() || [];
  const investmentsInGroup = BSextractors.investmentsInGroup() || [];
  const deferredReceivables = BSextractors.deferredReceivables() || [];
  const totalAssets = BSextractors.totalAssets() || [];
  const netWorkingCapital = Array.from({ length: years }).map(
    (_, i) => Number(totalCurrentAssets[i] || 0) - Number(totalAandB[i] || 0)
  );

  const closingCashBalanceArray = formData?.computedData?.closingCashBalanceArray
  const currentAssets = formData?.computedData?.assetsliabilities?.CurrentAssetsArray
  const currentLiabilities = formData?.computedData?.assetsliabilities?.yearlycurrentLiabilities


  // const currentRatio = Array.from({ length: years }).map(
  //   (_, i) => Number(totalCurrentAssets[i] || 0) / Number(totalAandB[i] || 0)
  // );
 
  const currentRatio = Array.from({ length: years }).map((_, i) => {
  const cash = currentAssets?.[i];
  const liabilities = currentLiabilities?.[i];
  
  
  
  const numerator = Number(cash || 0);
  const denominator = Number(liabilities || 1); // Avoid division by zero
  
  const ratio = numerator / denominator;
  
  
  return ratio;
});

  const TOLDividedByTNW = Array.from({ length: years }).map((_, i) =>
    netWorth[i] === 0
      ? "NA"
      : Number(totalOutsidersLiabilities[i] || 0) / Number(netWorth[i])
  );

  const cumulativeOtherCurrentAssetsTotal =
    BSextractors.cumulativeOtherCurrentAssetsTotal() || [];
  const commulativeSundryDebtors =
    BSextractors.commulativeSundryDebtors() || [];

  const isAdvancedLandscape = orientation === "advanced-landscape";
  let splitYearLabels = [yearLabels];
  let splitFinancialYearLabels = [yearLabels];
  const toRoman = (n) =>
    ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"][n] || n + 1;

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

  if (isAdvancedLandscape) {
    return splitYearLabels.map((labels, pageIdx) => {
      const pageStart = yearLabels.indexOf(labels[0]);
      const globalIndex = (localIdx) => pageStart + localIdx;

      return (
        <Page
          size="A4"
          style={[pageStyles.page]}
          orientation="landscape"
        >
          <View style={pageStyles.safeArea}>
            <View style={[styleExpenses.paddingx, { paddingBottom: "30px" }]}>
              {/* name and financial year  */}
              <Header formData={formData} />

              {/* heading */}
              <View>
                <View>
                  <View style={[stylesCOP.heading, { marginBottom: 10 }]}>
                    <Text>
                      Analysis Of Balance Sheet
                      {splitYearLabels.length > 1
                        ? ` (${toRoman(pageIdx)})`
                        : ""}
                    </Text>
                  </View>
                </View>
              </View>

              {/* table */}
              <View style={[styles.table, { borderRightWidth: 0 }]}>
                {/* table header */}
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

                  {/* Dynamic year headers FOR THIS PAGE ONLY */}
                  {labels.map((label, idx) => (
                    <Text
                      key={`${pageIdx}-hdr-${idx}`}
                      style={[styles.particularsCell, stylesCOP.boldText]}
                    >
                      {label}
                    </Text>
                  ))}
                </View>

                {/* table content */}
                <View>
                  {/* top spacer row */}
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
                        {},
                      ]}
                    />

                    {labels.map((_, localIdx) => (
                      <Text
                        key={`${pageIdx}-blank-${localIdx}`}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                          { paddingVertical: "5px" },
                        ]}
                      />
                    ))}
                  </View>

                  {/* LIABILITIES */}
                  <View>
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
                        LIABILITIES
                      </Text>
                      {labels.map((_, localIdx) => (
                        <Text
                          key={`${pageIdx}-liab-${localIdx}`}
                          style={[
                            stylesCOP.particularsCellsDetail,
                            styleExpenses.fontSmall,
                          ]}
                        />
                      ))}
                    </View>

                    {/* Current Liabilities */}
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
                        Current Liabilities
                      </Text>
                      {labels.map((_, localIdx) => (
                        <Text
                          key={`${pageIdx}-curliab-${localIdx}`}
                          style={[
                            stylesCOP.particularsCellsDetail,
                            styleExpenses.fontSmall,
                          ]}
                        />
                      ))}
                    </View>

                    {/* 1 Short Term Borrowings From Banks */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>1</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Short Term Borrowings From Banks
                      </Text>

                      {labels.map((_, localIdx) => (
                        <Text
                          key={`${pageIdx}-stbb-${localIdx}`}
                          style={[
                            stylesCOP.particularsCellsDetail,
                            styleExpenses.fontSmall,
                          ]}
                        />
                      ))}
                    </View>

                    {/* (I) From Applicant Bank */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}></Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        (I) From Applicant Bank
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-fab-${localIdx}`}
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

                    {/* (II) From Other Bank */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}></Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        (II) From Other Bank
                      </Text>
                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-fob-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(fromOtherBanks?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* Sub-Total (A) */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}></Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Sub-Total(A)
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-sta-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(SubTotal?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* 2 Other Short Term Borrowings */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>2</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Other Short Term Borrowings
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-ostb-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(shortTermBorrowings?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* 3 Sundry Creditors (Trading) – cumulative */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>3</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Sundry Creditors (Trading)
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        const cumulative = (sundryCreditorsArr || [])
                          .slice(0, gIdx + 1)
                          .reduce((s, v) => s + (Number(v) || 0), 0);
                        return (
                          <Text
                            key={`${pageIdx}-sct-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(formData, cumulative)}
                          </Text>
                        );
                      })}
                    </View>

                    {/* 4 Creditors for Capital Goods */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>4</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Creditors for Capital Goods
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-cfg-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(capitalGoods?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* 5 Provision for Taxation */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>5</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Provision for Taxation
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-pft-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(taxation?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* 6 Dividend Payable */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>6</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Dividend Payable
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
                              Number(dividend?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* 7 Other Statutory Liabilities (Due within one year) */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>7</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Other Statutory Liabilities (Due within one year)
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-osl-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(statutoryLiab?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* 8 Instalments of Term Loans (Due within one year) */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>8</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Instalments of Term Loans (Due within one year)
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-itl-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(repaymentValueswithin12months?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* 9 Other Current Liabilities & Provisions */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>9</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Other Current Liabilties & Provisions
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-oclp-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(otherCurrentLiabilitiesTotal?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* Sub - Total (B) */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}></Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Sub - Total (B)
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-stb-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(subTotalB?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* 10 Total Current Liabilities (A) + (B) */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>10</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Total Current Liabilities (A) + (B)
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
                              Number(totalAandB?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* Term Liabilities */}
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
                        Term Liabilities
                      </Text>
                      {labels.map((_, localIdx) => (
                        <Text
                          key={`${pageIdx}-tl-${localIdx}`}
                          style={[
                            stylesCOP.particularsCellsDetail,
                            styleExpenses.fontSmall,
                          ]}
                        />
                      ))}
                    </View>

                    {/* 11 Debentures */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>11</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Debentures (excluding not maturing within one year)
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-deb-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(debentures?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* 12 Preference Shares */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>12</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Preference Shares ( excluding redeemable within one
                        year)
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-ps-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(preferenceShares?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* 13 Term Loans */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>13</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Term Loans (excluding instalments payable within one
                        year)
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-tl2-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(bankTermLoanArr?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* 14 Vehicle Loan */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>14</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Vehicle Loan (excluding instalments payable within one
                        year)
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-vl-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(vehicleLoan?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* 15 Deferred Tax Liability */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>15</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Deferred Tax Liability
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-dtl-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(deferredTaxLiability?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* 16 Other Term Liabilities (Q.E.) */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>16</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Other Term Liabilities (Q.E.)
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

                    {/* 17 Total Term Liabilities */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>17</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Total Term Liabilities (Total of 11 to 16)
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-ttl-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(totalTermLiabilities?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* 18 Total Outsiders' Liabilities */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>18</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Total Outsiders' Liabilities
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-tol-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(totalOutsidersLiabilities?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* Net Worth */}
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
                        Net Worth
                      </Text>
                      {labels.map((_, localIdx) => (
                        <Text
                          key={`${pageIdx}-nwhead-${localIdx}`}
                          style={[
                            stylesCOP.particularsCellsDetail,
                            styleExpenses.fontSmall,
                          ]}
                        />
                      ))}
                    </View>

                    {/* 19 Share Capital */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>19</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Share Capital
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-scap-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(shareCapital?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* 20 General Reserve */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>20</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        General Reserve
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-gr-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(generalReserve?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* 21 Subsidy */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>21</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Subsidy
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-sub-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(subsidy?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* 22 Other Reserve(excl. provisions) */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>22</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Other Reserve(excl. provisions)
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-or-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(otherReserve?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* 23 Surplus / Deficit in P&L */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>23</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Surplus (+) or Deficit (-) in Profit and Loss account
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-pl-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(reservesAndSurplusArr?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* 24 Net Worth (Total of 19 to 23) */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text
                        style={[
                          stylesCOP.serialNoCellDetail,
                          { paddingVertical: "10px" },
                        ]}
                      >
                        24
                      </Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                          { paddingVertical: "10px" },
                        ]}
                      >
                        Net Worth (Total of 19 to 23)
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-nw-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              stylesCOP.boldText,
                              styleExpenses.fontSmall,
                              {
                                borderLeftWidth: "0px",
                                borderBottomWidth: 0,
                                paddingVertical: "10px",
                              },
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(netWorth?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* 25 Total Liabilities (18 + 24) */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text
                        style={[stylesCOP.serialNoCellDetail, styles.Total]}
                      >
                        25
                      </Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                          styles.Total,
                        ]}
                      >
                        Total Liabilities (18 + 24)
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-tlall-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              stylesCOP.boldText,
                              styleExpenses.fontSmall,
                              { borderLeftWidth: "0px", borderBottomWidth: 0 },
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(totalLiabilities?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* Current Assets */}
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
                        Current Assets
                      </Text>
                      {labels.map((_, localIdx) => (
                        <Text
                          key={`${pageIdx}-cahead-${localIdx}`}
                          style={[
                            stylesCOP.particularsCellsDetail,
                            styleExpenses.fontSmall,
                          ]}
                        />
                      ))}
                    </View>

                    {/* 26 Cash and Bank Balances */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>26</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Cash and Bank Balances
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-cbb-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(closingCashBalanceArray?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* 27 Investments (other than long term) */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>27</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Investments (other than long term investments)
                      </Text>

                      {labels.map((_, localIdx) => (
                        <Text
                          key={`${pageIdx}-invhead-${localIdx}`}
                          style={[
                            stylesCOP.particularsCellsDetail,
                            styleExpenses.fontSmall,
                          ]}
                        />
                      ))}
                    </View>

                    {/* Government and other Trustee Securities */}
                    {/* <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}></Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        (I)Government and other Trustee Securities
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-gts-${localIdx}`}
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
                    </View> */}

                    {/* Fixed Deposits with Banks */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}></Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        (I) Fixed Deposits with Banks
                      </Text>
                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-fdb-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(fixedDeposits?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* 28 Receivables other than deferred & Exports incl. B.P./B.D. */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>28</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        (I)Receivables other than deferred & Exports including
                        B.P./B.D. by Bank
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-rob-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(exportsIncludingBpBd?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* Export Receivables */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}></Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        (II)Export Receivables
                      </Text>
                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-er-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(exportReceivables?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* 29 Instalments of Deferred Receivables due within one year */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>29</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Instalments of Deferred Receivables due within one year
                      </Text>
                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-idr-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(instalments?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* 30 Inventory */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>30</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Inventory
                      </Text>

                      {labels.map((_, localIdx) => (
                        <Text
                          key={`${pageIdx}-inv-${localIdx}`}
                          style={[
                            stylesCOP.particularsCellsDetail,
                            styleExpenses.fontSmall,
                          ]}
                        />
                      ))}
                    </View>

                    {/* Raw Materials */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}></Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        (I) Raw Materials (incl.stores)
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-rm-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(rawMaterialInventory?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* Stocks in Process */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}></Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        (II)Stocks in Process
                      </Text>
                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-sip-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(stockProcess?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* Finished Goods */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}></Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        (III)Finished Goods
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-fg-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(inventoryArr?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* Other Consumable Spares */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}></Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        (IV)Other Consumable Spares
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-ocs-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(consumableSpares?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* 31 Advances to suppliers of Raw materials & stores/spares */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>31</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Advances to suppliers of Raw materials & stores/spares
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-ats-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(advancesToSuppliers?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* 32 Advances Payment of Taxes */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>32</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Advances Payment of Taxes
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-apt-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(paymentOfTaxes?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* 33 Other Current Assets(Major Items to specify) */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text
                        style={[stylesCOP.serialNoCellDetail, styles.Total]}
                      >
                        33
                      </Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Other Current Assets(Major Items to specify)
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-ocam-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(
                                cumulativeOtherCurrentAssetsTotal?.[gIdx]
                              ) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* 34 Sundry Debtors */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={[stylesCOP.serialNoCellDetail]}>34</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Sundry Debtors
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-sd-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(commulativeSundryDebtors?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* 35 Total Current Assets */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={[stylesCOP.serialNoCellDetail]}>35</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Total Current Assets
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-tca-${localIdx}`}
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

                    {/* Fixed Assets */}
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
                        Fixed Assets
                      </Text>
                      {labels.map((_, localIdx) => (
                        <Text
                          key={`${pageIdx}-fahead-${localIdx}`}
                          style={[
                            stylesCOP.particularsCellsDetail,
                            styleExpenses.fontSmall,
                          ]}
                        />
                      ))}
                    </View>

                    {/* 36 Gross Block */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>36</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Gross Block
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-gb-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(grossFixedAssetsPerYear?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* 37 Depreciation to-date */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>37</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Depreciation to-date
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

                    {/* 38 Net Block */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>38</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Net Block (36 - 37) Capital Work - in - Progress
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-nb-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(netBlock?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* Other Non-Current Assets */}
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
                        Other Non-Current Assets
                      </Text>
                      {labels.map((_, localIdx) => (
                        <Text
                          key={`${pageIdx}-onca-${localIdx}`}
                          style={[
                            stylesCOP.particularsCellsDetail,
                            styleExpenses.fontSmall,
                          ]}
                        />
                      ))}
                    </View>

                    {/* 39 Inv./Book debt/Advances/Deposits which are non C.A. */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>39</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Inv./Book debt/Advances/Deposits which are non C.A.
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-nbd-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(invBookDebt?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* (i) Investment in group Cos. */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>(i)</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        (a) Investment in group Cos.
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-iig-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(investmentsInGroup?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* (b) Others */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}></Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        (b) Others
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-ioth-${localIdx}`}
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

                    {/* (ii) Advances to supplier to Capital Goods & Contractors */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>(ii)</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Advances to supplier to Capital Goods & Contractors
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-ascc-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(capitalGoods?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* (iii) Deferred Receivables (Maturing exceeding one year) */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>(iii)</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Deferred Receivables (Maturing exceeding one year)
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-drmy-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(deferredReceivables?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* (iv) Others */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>(iv)</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Others
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-onon-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(deferredReceivables?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* 40 Non consumable stores/spares */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>40</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Non consumable stores/spares
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-ncss-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(deferredReceivables?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* 41 Other non current assets incl. Dues from Directors */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>41</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Other non current assets incl. Dues from Directors
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-oncad-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(deferredReceivables?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* 42 Total Other Non Current Assets (Total of 39 to 41) */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>42</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Total Other Non Current Assets (Total of 39 to 41)
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-tonca-${localIdx}`}
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

                    {/* 43 Intangible Assets */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>43</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Intangible Assets (Patents, Goodwill,Preliminary
                        Expenses not written off,etc.)
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-ia-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(deferredReceivables?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* Total Assets (Total of 34, 37, 41 & 42) */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}></Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Total Assets (Total of 34, 37, 41 & 42)
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-ta-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(totalAssets?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* 44 Tangible Net Worth */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>44</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Tangible Net Worth
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-tnw-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              stylesCOP.boldText,
                              styleExpenses.fontSmall,
                              { borderLeftWidth: "0px", borderBottomWidth: 0 },
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(netWorth?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* 45 Net Working Capital (CA-CL) */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>45</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Net Working Capital (CA-CL)
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-nwc-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              stylesCOP.boldText,
                              styleExpenses.fontSmall,
                              { borderLeftWidth: "0px", borderBottomWidth: 0 },
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(netWorkingCapital?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* 46 Current Ratio */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>46</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Current Ratio
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-cr-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              stylesCOP.boldText,
                              styleExpenses.fontSmall,
                              { borderLeftWidth: "0px", borderBottomWidth: 0 },
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(currentRatio?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* 47 TOL/TNW */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>47</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Total outside Liabilities/Tangible Net Worth (TOL/TNW)
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-toltnw-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              stylesCOP.boldText,
                              styleExpenses.fontSmall,
                              { borderLeftWidth: "0px", borderBottomWidth: 0 },
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(TOLDividedByTNW?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>

                    {/* 48 Total Outside Liab./Net Worth */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>48</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Total Outside Liab./Net Worth
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        return (
                          <Text
                            key={`${pageIdx}-tolnw-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              stylesCOP.boldText,
                              styleExpenses.fontSmall,
                              { borderLeftWidth: "0px", borderBottomWidth: 0 },
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(TOLDividedByTNW?.[gIdx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>
                  </View>
                </View>
              </View>

              {/* footer block */}
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

                  {formData?.ProjectReportSetting?.MembershipNumber?.value ? (
                    <Text
                      style={[styles.membershipNumber, { fontSize: "10px" }]}
                    >
                      M. No.:{" "}
                      {formData?.ProjectReportSetting?.MembershipNumber?.value}
                    </Text>
                  ) : null}

                  {formData?.ProjectReportSetting?.UDINNumber?.value ? (
                    <Text style={[styles.udinNumber, { fontSize: "10px" }]}>
                      UDIN: {formData?.ProjectReportSetting?.UDINNumber?.value}
                    </Text>
                  ) : null}

                  {formData?.ProjectReportSetting?.MobileNumber?.value ? (
                    <Text style={[styles.mobileNumber, { fontSize: "10px" }]}>
                      Mob. No.:{" "}
                      {formData?.ProjectReportSetting?.MobileNumber?.value}
                    </Text>
                  ) : null}
                </View>

                {/* business name and client */}
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
    <Page
      size="A4"
      style={[pageStyles.page]}
      orientation={orientation}
    >
      <View style={pageStyles.safeArea}>
        <View style={[styleExpenses.paddingx, { paddingBottom: "30px" }]}>
          {/* name and financial year  */}
          <Header formData={formData} />

          {/* header  */}
          <View>
            <View>
              <View style={[stylesCOP.heading, { marginBottom: 10 }]}>
                <Text>Analysis Of Balance Sheet</Text>
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
                  key={label || idx}
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

                  {yearLabels.map((_, idx) => (
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

                {/*  Liabilities */}
                <View>
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
                      LIABILITIES
                    </Text>
                    {yearLabels.map((_, idx) => {
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

                  {/* Current Liabilities  */}
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
                      Current Liabilities
                    </Text>
                    {yearLabels.map((_, idx) => {
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

                  {/* short term borrowings  */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={stylesCOP.serialNoCellDetail}>1</Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      Short Term Borrowings From Banks
                    </Text>

                    {yearLabels.map((_, idx) => (
                      <Text
                        key={idx}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                        ]}
                      ></Text>
                    ))}
                  </View>

                  {/* from applicant bank */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={stylesCOP.serialNoCellDetail}></Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      (I) From Applicant Bank
                    </Text>

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

                  {/* from other bank */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={stylesCOP.serialNoCellDetail}></Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      (II) From Other Bank
                    </Text>
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
                          Number(fromOtherBanks?.[idx]) || 0
                        )}
                      </Text>
                    ))}
                  </View>

                  {/* sub-total(A)  */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={stylesCOP.serialNoCellDetail}></Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      Sub-Total (A)
                    </Text>

                    {yearLabels.map((_, idx) => (
                      <Text
                        key={idx}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                        ]}
                      >
                        {formatNumber(formData, Number(SubTotal?.[idx]) || 0)}
                      </Text>
                    ))}
                  </View>

                  {/* short term loans  */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={stylesCOP.serialNoCellDetail}>2</Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      Other Short Term Borrowings
                    </Text>

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
                          Number(shortTermBorrowings?.[idx]) || 0
                        )}
                      </Text>
                    ))}
                  </View>

                  {/* sundry creditors (Trading) – cumulative */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={stylesCOP.serialNoCellDetail}>3</Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      Sundry Creditors (Trading)
                    </Text>

                    {yearLabels.map((_, idx) => {
                      const cumulative = (sundryCreditorsArr || [])
                        .slice(0, idx + 1)
                        .reduce((s, v) => s + (Number(v) || 0), 0);
                      return (
                        <Text
                          key={idx}
                          style={[
                            stylesCOP.particularsCellsDetail,
                            styleExpenses.fontSmall,
                          ]}
                        >
                          {formatNumber(formData, cumulative)}
                        </Text>
                      );
                    })}
                  </View>

                  {/* Creditors for Capital Goods  */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={stylesCOP.serialNoCellDetail}>4</Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      Creditors for Capital Goods
                    </Text>

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
                          Number(capitalGoods?.[idx]) || 0
                        )}
                      </Text>
                    ))}
                  </View>

                  {/* Provision for Taxation  */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={stylesCOP.serialNoCellDetail}>5</Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      Provision for Taxation
                    </Text>

                    {yearLabels.map((_, idx) => (
                      <Text
                        key={idx}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                        ]}
                      >
                        {formatNumber(formData, Number(taxation?.[idx]) || 0)}
                      </Text>
                    ))}
                  </View>

                  {/* Dividend Payable  */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={stylesCOP.serialNoCellDetail}>6</Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      Dividend Payable
                    </Text>

                    {yearLabels.map((_, idx) => (
                      <Text
                        key={idx}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                        ]}
                      >
                        {formatNumber(formData, Number(dividend?.[idx]) || 0)}
                      </Text>
                    ))}
                  </View>

                  {/* Other Statutory Liabilities  */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={stylesCOP.serialNoCellDetail}>7</Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      Other Statutory Liabilities (Due within one year)
                    </Text>

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
                          Number(statutoryLiab?.[idx]) || 0
                        )}
                      </Text>
                    ))}
                  </View>

                  {/* Instalments of Term Loans  */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={stylesCOP.serialNoCellDetail}>8</Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      Instalments of Term Loans (Due within one year)
                    </Text>

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
                          Number(repaymentValueswithin12months?.[idx]) || 0
                        )}
                      </Text>
                    ))}
                  </View>

                  {/* Other Current Liabilties & Provisions  */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={stylesCOP.serialNoCellDetail}>9</Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      Other Current Liabilties & Provisions
                    </Text>

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
                          Number(otherCurrentLiabilitiesTotal?.[idx]) || 0
                        )}
                      </Text>
                    ))}
                  </View>

                  {/* sub-total(B)  */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={stylesCOP.serialNoCellDetail}></Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      Sub - Total (B)
                    </Text>

                    {yearLabels.map((_, idx) => (
                      <Text
                        key={idx}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                        ]}
                      >
                        {formatNumber(formData, Number(subTotalB?.[idx]) || 0)}
                      </Text>
                    ))}
                  </View>

                  {/* Total Current Liabilities (A) + (B)  */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={stylesCOP.serialNoCellDetail}>10</Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      Total Current Liabilities (A) + (B)
                    </Text>

                    {yearLabels.map((_, idx) => (
                      <Text
                        key={idx}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                        ]}
                      >
                        {formatNumber(formData, Number(totalAandB?.[idx]) || 0)}
                      </Text>
                    ))}
                  </View>

                  {/*Term Liabilities  */}
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
                      Term Liabilities
                    </Text>
                    {yearLabels.map((_, idx) => {
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

                  {/* Debentures (excluding not  */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={stylesCOP.serialNoCellDetail}>11</Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      Debentures (excluding not maturing within one year)
                    </Text>

                    {yearLabels.map((_, idx) => (
                      <Text
                        key={idx}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                        ]}
                      >
                        {formatNumber(formData, Number(debentures?.[idx]) || 0)}
                      </Text>
                    ))}
                  </View>

                  {/* Preference Shares ( excluding  */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={stylesCOP.serialNoCellDetail}>12</Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      Preference Shares ( excluding redeemable within one year)
                    </Text>

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
                          Number(preferenceShares?.[idx]) || 0
                        )}
                      </Text>
                    ))}
                  </View>

                  {/* term loans  */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={stylesCOP.serialNoCellDetail}>13</Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      Term Loans (excluding instalments payable within one year)
                    </Text>

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
                          Number(bankTermLoanArr?.[idx]) || 0
                        )}
                      </Text>
                    ))}
                  </View>

                  {/* Vehicle Loan (excluding Instalments  */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={stylesCOP.serialNoCellDetail}>14</Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      Vehicle Loan (excluding instalments payable within one
                      year)
                    </Text>

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
                          Number(vehicleLoan?.[idx]) || 0
                        )}
                      </Text>
                    ))}
                  </View>

                  {/* Deferred Tax Liability  */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={stylesCOP.serialNoCellDetail}>15</Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      Deferred Tax Liability
                    </Text>

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
                          Number(deferredTaxLiability?.[idx]) || 0
                        )}
                      </Text>
                    ))}
                  </View>

                  {/* Other Term Liabilities (Q.E.)  */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={stylesCOP.serialNoCellDetail}>16</Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      Other Term Liabilities (Q.E.)
                    </Text>

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
                          Number(otherTermLiabilities?.[idx]) || 0
                        )}
                      </Text>
                    ))}
                  </View>

                  {/* Total term Liabilities   */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={stylesCOP.serialNoCellDetail}>17</Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      Total Term Liabilities (Total of 11 to 16)
                    </Text>

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
                          Number(totalTermLiabilities?.[idx]) || 0
                        )}
                      </Text>
                    ))}
                  </View>

                  {/* Total outsiders Liabilities   */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={stylesCOP.serialNoCellDetail}>18</Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      Total Outsiders' Liabilities
                    </Text>

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
                          Number(totalOutsidersLiabilities?.[idx]) || 0
                        )}
                      </Text>
                    ))}
                  </View>

                  {/*Net Worth  */}
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
                      Net Worth
                    </Text>
                    {yearLabels.map((_, idx) => {
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

                  {/* capital */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={stylesCOP.serialNoCellDetail}>19</Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      Share Capital
                    </Text>

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
                          Number(shareCapital?.[idx]) || 0
                        )}
                      </Text>
                    ))}
                  </View>

                  {/* General Reserve  */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={stylesCOP.serialNoCellDetail}>20</Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      General Reserve
                    </Text>

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
                          Number(generalReserve?.[idx]) || 0
                        )}
                      </Text>
                    ))}
                  </View>

                  {/* Subsidy  */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={stylesCOP.serialNoCellDetail}>21</Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      Subsidy
                    </Text>

                    {yearLabels.map((_, idx) => (
                      <Text
                        key={idx}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                        ]}
                      >
                        {formatNumber(formData, Number(subsidy?.[idx]) || 0)}
                      </Text>
                    ))}
                  </View>

                  {/* Other Reserve(excl. provisions)  */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={stylesCOP.serialNoCellDetail}>22</Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      Other Reserve(excl. provisions)
                    </Text>

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
                          Number(otherReserve?.[idx]) || 0
                        )}
                      </Text>
                    ))}
                  </View>

                  {/* Surplus (+) or Deficit (-) in  */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={stylesCOP.serialNoCellDetail}>23</Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      Surplus (+) or Deficit (-) in Profit and Loss account
                    </Text>

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
                          Number(reservesAndSurplusArr?.[idx]) || 0
                        )}
                      </Text>
                    ))}
                  </View>

                  {/* net worth total 19 to 23   */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={stylesCOP.serialNoCellDetail}>24</Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      Net Worth (Total of 19 to 23)
                    </Text>

                    {yearLabels.map((_, idx) => (
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
                        {formatNumber(formData, Number(netWorth?.[idx]) || 0)}
                      </Text>
                    ))}
                  </View>

                  {/* total liabilities 18+24   */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={[stylesCOP.serialNoCellDetail, styles.Total]}>
                      25
                    </Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                        styles.Total,
                      ]}
                    >
                      Total Liabilities (18 + 24)
                    </Text>

                    {yearLabels.map((_, idx) => (
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
                        {formatNumber(
                          formData,
                          Number(totalLiabilities?.[idx]) || 0
                        )}
                      </Text>
                    ))}
                  </View>

                  {/*current assets  */}
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
                      Current Assets
                    </Text>
                    {yearLabels.map((_, idx) => {
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

                  {/* Cash and Bank Balances  */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={stylesCOP.serialNoCellDetail}>26</Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      Cash and Bank Balances
                    </Text>

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
                          Number(closingCashBalanceArray?.[idx]) || 0
                        )}
                      </Text>
                    ))}
                  </View>

                  {/* Investments (other than long term  */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={stylesCOP.serialNoCellDetail}>27</Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      Investments (other than long term investments)
                    </Text>

                    {yearLabels.map((_, idx) => (
                      <Text
                        key={idx}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                        ]}
                      ></Text>
                    ))}
                  </View>

                  {/* trustee securitees */}
                  {/* <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={stylesCOP.serialNoCellDetail}></Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      (I)Government and other Trustee Securities
                    </Text>

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
                          Number(investments?.[idx]) || 0
                        )}
                      </Text>
                    ))}
                  </View> */}

                  {/* fixed deposits */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={stylesCOP.serialNoCellDetail}></Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      (I) Fixed Deposits with Banks
                    </Text>
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
                          Number(fixedDeposits?.[idx]) || 0
                        )}
                      </Text>
                    ))}
                  </View>

                  {/* (I) Receivables other than deferred & */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={stylesCOP.serialNoCellDetail}>28</Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      (I)Receivables other than deferred & Exports including
                      B.P./B.D. by Bank
                    </Text>

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
                          Number(exportsIncludingBpBd?.[idx]) || 0
                        )}
                      </Text>
                    ))}
                  </View>

                  {/* (II)Export Receivables */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={stylesCOP.serialNoCellDetail}></Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      (II)Export Receivables
                    </Text>
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
                          Number(exportReceivables?.[idx]) || 0
                        )}
                      </Text>
                    ))}
                  </View>

                  {/* Instalments of Deferred Receivables */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={stylesCOP.serialNoCellDetail}>29</Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      Instalments of Deferred Receivables due within one year
                    </Text>
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
                          Number(instalments?.[idx]) || 0
                        )}
                      </Text>
                    ))}
                  </View>

                  {/* Inventory  */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={stylesCOP.serialNoCellDetail}>30</Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      Inventory
                    </Text>

                    {yearLabels.map((_, idx) => (
                      <Text
                        key={idx}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                        ]}
                      ></Text>
                    ))}
                  </View>

                  {/* (I) Raw Materials (incl.stores) */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={stylesCOP.serialNoCellDetail}></Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      (I) Raw Materials (incl.stores)
                    </Text>

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
                          Number(rawMaterialInventory?.[idx]) || 0
                        )}
                      </Text>
                    ))}
                  </View>

                  {/* (ii) Stocks in Process */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={stylesCOP.serialNoCellDetail}></Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      (II)Stocks in Process
                    </Text>
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
                          Number(stockProcess?.[idx]) || 0
                        )}
                      </Text>
                    ))}
                  </View>

                  {/*  (III)Finished Goods */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={stylesCOP.serialNoCellDetail}></Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      (III)Finished Goods
                    </Text>

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
                          Number(inventoryArr?.[idx]) || 0
                        )}
                      </Text>
                    ))}
                  </View>

                  {/*  (IV) Other Consumable Spares */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={stylesCOP.serialNoCellDetail}></Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      (IV)Other Consumable Spares
                    </Text>

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
                          Number(consumableSpares?.[idx]) || 0
                        )}
                      </Text>
                    ))}
                  </View>

                  {/* Advances to suppliers of Raw materials & stores/spares */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={stylesCOP.serialNoCellDetail}>31</Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      Advances to suppliers of Raw materials & stores/spares
                    </Text>

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
                          Number(advancesToSuppliers?.[idx]) || 0
                        )}
                      </Text>
                    ))}
                  </View>

                  {/* Advances Payment of Taxes */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={stylesCOP.serialNoCellDetail}>32</Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      Advances Payment of Taxes
                    </Text>

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
                          Number(paymentOfTaxes?.[idx]) || 0
                        )}
                      </Text>
                    ))}
                  </View>

                  {/* Other Current Assets(Major Items to specify)   */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={[stylesCOP.serialNoCellDetail, styles.Total]}>
                      33
                    </Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      Other Current Assets(Major Items to specify)
                    </Text>

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
                          Number(cumulativeOtherCurrentAssetsTotal?.[idx]) || 0
                        )}
                      </Text>
                    ))}
                  </View>

                  {/* Sundry Debtors    */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={[stylesCOP.serialNoCellDetail]}>34</Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      Sundry Debtors
                    </Text>

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
                          Number(commulativeSundryDebtors?.[idx]) || 0
                        )}
                      </Text>
                    ))}
                  </View>

                  {/* Total Current Assets   */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={[stylesCOP.serialNoCellDetail]}>35</Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      Total Current Assets
                    </Text>

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
                          Number(totalCurrentAssets?.[idx]) || 0
                        )}
                      </Text>
                    ))}
                  </View>

                  {/*Fixed Assets  */}
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
                      Fixed Assets
                    </Text>
                    {yearLabels.map((_, idx) => {
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

                  {/*  Gross Block */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={stylesCOP.serialNoCellDetail}>36</Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      Gross Block
                    </Text>

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
                          Number(grossFixedAssetsPerYear?.[idx]) || 0
                        )}
                      </Text>
                    ))}
                  </View>

                  {/*  Depreciation to-date */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={stylesCOP.serialNoCellDetail}>37</Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      Depreciation to-date
                    </Text>

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
                          Number(totalDepreciation?.[idx]) || 0
                        )}
                      </Text>
                    ))}
                  </View>

                  {/*  Net Block (35 - 36) Capital Work - in - Progress */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={stylesCOP.serialNoCellDetail}>38</Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      Net Block (36 - 37) Capital Work - in - Progress
                    </Text>

                    {yearLabels.map((_, idx) => (
                      <Text
                        key={idx}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                        ]}
                      >
                        {formatNumber(formData, Number(netBlock?.[idx]) || 0)}
                      </Text>
                    ))}
                  </View>

                  {/* Other Non-Current Assets */}
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
                      Other Non-Current Assets
                    </Text>
                    {yearLabels.map((_, idx) => {
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

                  {/* Inv./Book debt/Advances/Deposits which are non C.A.  */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={stylesCOP.serialNoCellDetail}>39</Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      Inv./Book debt/Advances/Deposits which are non C.A.
                    </Text>

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
                          Number(invBookDebt?.[idx]) || 0
                        )}
                      </Text>
                    ))}
                  </View>

                  {/*(a) Investment in group Cos.  */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={stylesCOP.serialNoCellDetail}>(i)</Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      (a) Investment in group Cos.
                    </Text>

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
                          Number(investmentsInGroup?.[idx]) || 0
                        )}
                      </Text>
                    ))}
                  </View>

                  {/*(b) Others  */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={stylesCOP.serialNoCellDetail}></Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      (b) Others
                    </Text>

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
                          Number(investments?.[idx]) || 0
                        )}
                      </Text>
                    ))}
                  </View>

                  {/*Advances to supplier to Capital Goods & Contractors  */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={stylesCOP.serialNoCellDetail}>(ii)</Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      Advances to supplier to Capital Goods & Contractors
                    </Text>

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
                          Number(capitalGoods?.[idx]) || 0
                        )}
                      </Text>
                    ))}
                  </View>

                  {/*Deferred Receivables (Maturing exceeding one year)  */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={stylesCOP.serialNoCellDetail}>(iii)</Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      Deferred Receivables (Maturing exceeding one year)
                    </Text>

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
                          Number(deferredReceivables?.[idx]) || 0
                        )}
                      </Text>
                    ))}
                  </View>

                  {/*Others  */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={stylesCOP.serialNoCellDetail}>(iv)</Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      Others
                    </Text>

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
                          Number(deferredReceivables?.[idx]) || 0
                        )}
                      </Text>
                    ))}
                  </View>

                  {/*Non consumable stores/spares  */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={stylesCOP.serialNoCellDetail}>40</Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      Non consumable stores/spares
                    </Text>

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
                          Number(deferredReceivables?.[idx]) || 0
                        )}
                      </Text>
                    ))}
                  </View>

                  {/*Other non current assets incl. Dues from Directors  */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={stylesCOP.serialNoCellDetail}>41</Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      Other non current assets incl. Dues from Directors
                    </Text>

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
                          Number(deferredReceivables?.[idx]) || 0
                        )}
                      </Text>
                    ))}
                  </View>

                  {/*Total Other Non Current Assets (Total of 38 to 40)  */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={stylesCOP.serialNoCellDetail}>42</Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      Total Other Non Current Assets (Total of 39 to 41)
                    </Text>

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
                          Number(investments?.[idx]) || 0
                        )}
                      </Text>
                    ))}
                  </View>

                  {/*Intangible Assets (Patents, Goodwill,Preliminary Expenses not written off,etc.)  */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={stylesCOP.serialNoCellDetail}>43</Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      Intangible Assets (Patents, Goodwill,Preliminary Expenses
                      not written off,etc.)
                    </Text>

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
                          Number(deferredReceivables?.[idx]) || 0
                        )}
                      </Text>
                    ))}
                  </View>

                  {/* Total Assets(Total of 34, 37, 41 & 42) */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={stylesCOP.serialNoCellDetail}></Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      Total Assets (Total of 34, 37, 41 & 42)
                    </Text>

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
                          Number(totalAssets?.[idx]) || 0
                        )}
                      </Text>
                    ))}
                  </View>

                  {/* Tangible Net Worth   */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={stylesCOP.serialNoCellDetail}>44</Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      Tangible Net Worth
                    </Text>

                    {yearLabels.map((_, idx) => (
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
                        {formatNumber(formData, Number(netWorth?.[idx]) || 0)}
                      </Text>
                    ))}
                  </View>

                  {/* Net Working Capital (CA-CL)   */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={stylesCOP.serialNoCellDetail}>45</Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      Net Working Capital (CA-CL)
                    </Text>

                    {yearLabels.map((_, idx) => (
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
                        {formatNumber(
                          formData,
                          Number(netWorkingCapital?.[idx]) || 0
                        )}
                      </Text>
                    ))}
                  </View>

                  {/* current ratio   */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={stylesCOP.serialNoCellDetail}>46</Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      Current Ratio
                    </Text>

                    {yearLabels.map((_, idx) => (
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
                        {formatNumber(
                          formData,
                          Number(currentRatio?.[idx]) || 0
                        )}
                      </Text>
                    ))}
                  </View>

                  {/* Total outside Liabilities/Tangible Net Worth (TOL/TNW)   */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={stylesCOP.serialNoCellDetail}>47</Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      Total outside Liabilities/Tangible Net Worth (TOL/TNW)
                    </Text>

                    {yearLabels.map((_, idx) => (
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
                        {formatNumber(
                          formData,
                          Number(TOLDividedByTNW?.[idx]) || 0
                        )}
                      </Text>
                    ))}
                  </View>

                  {/* Total Outside Liab./Net Worth   */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={stylesCOP.serialNoCellDetail}>48</Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      Total Outside Liab./Net Worth
                    </Text>

                    {yearLabels.map((_, idx) => (
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
                        {formatNumber(
                          formData,
                          Number(TOLDividedByTNW?.[idx]) || 0
                        )}
                      </Text>
                    ))}
                  </View>
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

              {formData?.ProjectReportSetting?.MembershipNumber?.value ? (
                <Text style={[styles.membershipNumber, { fontSize: "10px" }]}>
                  M. No.:{" "}
                  {formData?.ProjectReportSetting?.MembershipNumber?.value}
                </Text>
              ) : null}

              {formData?.ProjectReportSetting?.UDINNumber?.value ? (
                <Text style={[styles.udinNumber, { fontSize: "10px" }]}>
                  UDIN: {formData?.ProjectReportSetting?.UDINNumber?.value}
                </Text>
              ) : null}

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

export default CMAAnalysisOfBS;
