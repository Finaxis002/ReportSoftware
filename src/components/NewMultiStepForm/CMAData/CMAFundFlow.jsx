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

// Font registration (optional)
Font.register({
  family: "Roboto",
  src: "https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Me5Q.ttf",
});

const format = (n) => (n == null ? "" : Number(n).toLocaleString("en-IN"));

// Main component
const CMAFundFlow = ({ formData }) => {
  // You can import these:

  const years = Number(formData?.ProjectReportSetting?.ProjectionYears || 5);
  const extractors = makeCMAExtractors(formData);
  const yearLabels = extractors.yearLabels();
  const grossSales = extractors.grossSales();
  const dutiesTaxes = extractors.dutiesTaxes();
  const netSales = extractors.netSales();
  const depreciation = extractors.depreciation();
  const salaryandwages = extractors.salary();
  const rawmaterial = extractors.rawMaterial();
  const directExpensesArray = extractors.directExpenses?.() || [];
  const StockAdjustment = extractors.StockAdjustment();
  const OpeningStockinProcess = extractors.OpeningStockinProcess();
  const SubTotalCostofSales = extractors.SubTotalCostofSales();
  const OpeningStock = extractors.openingStocks() || [];
  const closingStocks = extractors.closingStocks() || [];
  const TotalCostofSales = extractors.TotalCostofSales() || [];
  const GrossProfit = extractors.GrossProfit() || [];
  const interestOnTermLoan = extractors.yearlyInterestLiabilities() || [];
  const interestOnWCArray = extractors.interestOnWCArray() || [];
  const administrativeExpenseRows =
    extractors.administrativeExpenseRows() || [];
  const adminValues = administrativeExpenseRows[0]?.values || [];

  const OperatingProfit = extractors.OperatingProfit() || [];
  const ProfitbeforeTax = extractors.ProfitbeforeTax() || [];
  const ProvisionforInvestmentAllowance =
    extractors.ProvisionforInvestmentAllowance() || [];

  const netProfitAfterTax = extractors.netProfitAfterTax() || [];

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
  const TOTALFUNDSUSED = Array.from({length:years}).map((_, idx)=>(
   Number(subTotalD[idx] || 0 )+
   Number(SubTotalE[idx] || 0 )+
   Number(withdrawals[idx] || 0 )
  ))

  const longTermSources = Array.from({length:years}).map((_, idx)=>(
  Number(netFundsGenerated[idx] || 0) +
      Number(subtotalB[idx] || 0)
  ))

  const surplusShortfall = Array.from({length:years}).map((_, idx)=>(
    Number(longTermSources[idx] || 0) -
    Number(subTotalD[idx] || 0)
  ))

  const shortTermUses =  Array.from({length:years}).map((_, idx)=>(
    Number(SubTotalE[idx] || 0) +
    Number(withdrawals[idx] || 0)
  ))

  const surplusShortfall2 = Array.from({length:years}).map((_, idx)=>(
    Number(subTotalC[idx] || 0) -
    Number(shortTermUses[idx] || 0)
  ))
  
  return (
    <Page size="A4" style={styles.page}>
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
                      {formatNumber(formData, Number(dividendsPaid[idx]) || 0)}
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
                "Increase in other non-current assets",
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

                {withdrawals.map((val, idx) => (
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

                {TOTALFUNDSUSED.map((val, idx) => (
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
                      {formatNumber(formData, Number(longTermSources[idx]) || 0)}
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
                >Less:</Text>
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
                      {formatNumber(formData, Number(surplusShortfall[idx]) || 0)}
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
                >Less:</Text>
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
                      {formatNumber(formData, Number(shortTermUses[idx]) || 0)}
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
                      {formatNumber(formData, Number(surplusShortfall2[idx]) || 0)}
                    </Text>
                  );
                })}
              </View>

            </View>
          </View>
        </View>
      </View>
    </Page>
  );
};

export default CMAFundFlow;
