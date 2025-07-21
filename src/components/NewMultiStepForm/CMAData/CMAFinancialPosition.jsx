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
import { CMAExtractorFinPos } from "../Utils/CMA/CMAExtractorFInPos";
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
const CMAFinancialPosition = ({ formData , orientation}) => {
  // You can import these:
   const FinPosextractors = CMAExtractorFinPos(formData);
  const years = Number(formData?.ProjectReportSetting?.ProjectionYears || 5);
  const extractors = makeCMAExtractors(formData);
  const yearLabels = extractors.yearLabels();
  
  const depreciation = extractors.depreciation();
  
  const rawmaterial = extractors.rawMaterial();
  const directExpensesArray = extractors.directExpenses?.() || [];
 
  const GrossProfit = extractors.GrossProfit() || [];
  const interestOnTermLoan= FinPosextractors.interestOnTermLoan() || [];
  const interestOnWCArray = extractors.interestOnWCArray() || [];
  const administrativeExpenseRows =
    extractors.administrativeExpenseRows() || [];
 
console.log('interestOnTermLoan',interestOnTermLoan)
 

  const netProfitAfterTax = extractors.netProfitAfterTax() || [];

  console.log("form Data : ", formData);

  console.log("interest On Term Loan :", interestOnTermLoan);

 

  const hasRawMaterial = rawmaterial.some((val) => Number(val) !== 0);
  

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

  //new data
 

  const shareCapital = BSextractors.shareCapital() || [];
  const netWorth = BSextractors.netWorth() || [];
  const netWorkingCapital = FinPosextractors.netWorkingCapital() || [];
  const grossProfit = FinPosextractors.grossProfit() || [];
  const withdrawalsToNPATPercentage = Array.from({ length: years }).map((_, idx) => {
  const wdraw = Number(withdrawals[idx] || 0);
  const npat = Number(netProfitAfterTax[idx] || 0);
  if (wdraw === 0 || npat === 0) return 0;
  return (wdraw / npat) * 100;
});
const currentRatioArr = FinPosextractors.currentRatioArr() || [];
const totalRevenueReceipt = FinPosextractors.totalRevenueReceipt() || [];
const debtEquityArr = FinPosextractors.debtEquityArr() || [];
const totalOutsideLiabilitiesNetWorthRatio = FinPosextractors.totalOutsideLiabilitiesNetWorthRatio() || [];
const grossProfitDivNetWorthRatio= FinPosextractors.grossProfitDivNetWorthRatio() || [];
const netProfitDivNetWorthRatioArr= FinPosextractors.netProfitDivNetWorthRatioArr() || [];

const termLaonplusWorkingCap =  Array.from({ length: years }).map((_, idx) => 
   Number(interestOnTermLoan[idx] || 0)+
   Number(interestOnWCArray[idx] || 0)
)
const grossReceiptMinusProfit = Array.from({ length: years }).map((_, idx) => 
   Number(totalRevenueReceipt[idx] || 0)-
   Number(grossProfit[idx] || 0)
)

const interestDivCOP =  Array.from({ length: years }).map((_, idx) => 
 (Number(termLaonplusWorkingCap[idx] || 0)/
 Number(grossReceiptMinusProfit[idx] || 0))*100
)

const dscr = formData?.computedData?.dscr?.DSCR || 0 ;


  return (
    <Page size="A4" style={styles.page} orientation={orientation}>
      <View style={[styleExpenses.paddingx, { paddingBottom: "30px" }]}>
        {/* name and financial year  */}
        <Header formData={formData} />
        {/* header  */}
        <View>
          <View>
            <View style={stylesCOP.heading}>
              <Text>Financial Position of the Borrower</Text>
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
              {/* 1 paid up capital */}
              <View style={[styles.tableRow, styles.totalRow]}>
                <Text style={stylesCOP.serialNoCellDetail}>a</Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  Paid-up Capital
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
                      {formatNumber(formData, Number(shareCapital[idx]) || 0)}
                    </Text>
                  );
                })}
              </View>

              {/* 2  Net Worth */}
              <View style={[styles.tableRow, styles.totalRow]}>
                <Text style={stylesCOP.serialNoCellDetail}>b</Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  Net Worth
                </Text>

                {netWorth.map((val, idx) => (
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

              {/* net working capital */}
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
                  c
                </Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                    {},
                  ]}
                >
                  Net Working Capital
                </Text>

                {netWorkingCapital.map((val, idx) => (
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

              {/* Gross Receipts */}
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
                  d
                </Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                    {},
                  ]}
                >
                  Gross Receipts
                </Text>

                {totalRevenueReceipt.map((val, idx) => (
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

              {/* Net Sales */}
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
                  e
                </Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                    {},
                  ]}
                >
                  Net Sales
                </Text>

                {totalRevenueReceipt.map((val, idx) => (
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

              {/* Interest Term Loan */}
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
                  f
                </Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                    {},
                  ]}
                >
                  Interest Term Loan
                </Text>

                {interestOnTermLoan
                 .slice(0, formData?.ProjectReportSetting?.ProjectionYears || 0)
                .map((val, idx) => (
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

              {/* Interest working capital */}
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
                  g
                </Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                    {},
                  ]}
                >
                  Interest CC
                </Text>

                {interestOnWCArray.map((val, idx) => (
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

              {/* gross profit */}
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
                  h
                </Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                    {},
                  ]}
                >
                  Gross Profit
                </Text>

                {grossProfit.map((val, idx) => (
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

              {/* depreciation */}
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
                  i
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

                {depreciation.map((val, idx) => (
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

              {/* Taxation */}
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
                  j
                </Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                    {},
                  ]}
                >
                  Taxation
                </Text>

                {incomeTaxCal.map((val, idx) => (
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

              {/* net Profit After Tax */}
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
                  k
                </Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                    {},
                  ]}
                >
                  Net Profit
                </Text>

                {netProfitAfterTax.map((val, idx) => (
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

              {/* Dividend */}
              <View style={[styles.tableRow, styles.totalRow]}>
                <Text
                  style={[
                    stylesCOP.serialNoCellDetail,
                    styles.Total,
                    { paddingVertical: "10px" },
                  ]}
                >l</Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                    styles.Total,
                    { paddingVertical: "10px" },
                  ]}
                >
                  Dividend
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

               {/* amount */}
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
                  
                </Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                    {},
                  ]}
                >
                  (i)Amount
                </Text>

                {withdrawals.map((val, idx) => (
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

               {/*percentage */}
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
                  
                </Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                    {},
                  ]}
                >
                  (ii)Percentage
                </Text>

                {withdrawalsToNPATPercentage.map((val, idx) => (
                  <Text
                    key={idx}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                    ]}
                  >
                    {formatNumber(formData, val)}%
                  </Text>
                ))}
              </View>

               {/*Advance / investments in subsidiary / allied concerns */}
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
                  m
                </Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                    {},
                  ]}
                >
                  Advance / investments in subsidiary / allied concerns
                </Text>

                {fillZero.map((val, idx) => (
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

               {/*Bad-debts, if any */}
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
                  n
                </Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                    {},
                  ]}
                >
                  Bad-debts, if any
                </Text>

                {fillZero.map((val, idx) => (
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


               {/*Arrears of depreciation, if any */}
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
                  o
                </Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                    {},
                  ]}
                >
                  Arrears of depreciation, if any
                </Text>

                {fillZero.map((val, idx) => (
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

               {/* ratio */}
              <View style={[styles.tableRow, styles.totalRow]}>
                <Text
                  style={[
                    stylesCOP.serialNoCellDetail,
                    styles.Total,
                    { paddingVertical: "10px" },
                  ]}
                >l</Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                    styles.Total,
                    { paddingVertical: "10px" },
                  ]}
                >
                  RATIOS:
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

               {/*Current Ratio*/}
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
                  1
                </Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                    {},
                  ]}
                >
                  Current Ratio
                </Text>

                {currentRatioArr.map((val, idx) => (
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

               {/*Debt-Equity Ratio*/}
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
                  2
                </Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                    {},
                  ]}
                >
                 Debt-Equity Ratio
                </Text>

                {debtEquityArr.map((val, idx) => (
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

               {/*TOL/TWN*/}
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
                  3
                </Text>
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                    {},
                  ]}
                >
                 Funded Debt: Net worth (TOL/TNW)
                </Text>

                {totalOutsideLiabilitiesNetWorthRatio.map((val, idx) => (
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

               {/*Gross Profit / Net worth*/}
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
                 Gross Profit / Net worth
                </Text>

                {grossProfitDivNetWorthRatio.map((val, idx) => (
                  <Text
                    key={idx}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                    ]}
                  >
                   { formatNumber(formData, val)}%
                  </Text>
                ))}
              </View>

               {/*Gross Profit / Net worth*/}
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
                 Net Profit / Net worth
                </Text>

                {netProfitDivNetWorthRatioArr.map((val, idx) => (
                  <Text
                    key={idx}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                    ]}
                  >
                   { formatNumber(formData, val)}%
                  </Text>
                ))}
              </View>

                {/*intrest  / cop*/}
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
                 Interest / Cost of production
                </Text>

                {interestDivCOP.map((val, idx) => (
                  <Text
                    key={idx}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                    ]}
                  >
                   { formatNumber(formData, val)}%
                  </Text>
                ))}
              </View>

                {/*dscr*/}
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
                 Debt Service Coverage Ratio
                </Text>

                {dscr.map((val, idx) => (
                  <Text
                    key={idx}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                    ]}
                  >
                   { formatNumber(formData, val)}%
                  </Text>
                ))}
              </View>
            </View>
          </View>
        </View>
      </View>
    </Page>
  );
};

export default CMAFinancialPosition;
