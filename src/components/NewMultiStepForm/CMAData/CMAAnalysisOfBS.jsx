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
const CMAAnalysisOfBS = ({ formData }) => {
  // You can import these:

  const schema = getCMASchema(formData);
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
  const preliminaryWriteOffPerYear =
    extractors.preliminaryWriteOffPerYear() || [];
  const OperatingProfit = extractors.OperatingProfit() || [];
  const ProfitbeforeTax = extractors.ProfitbeforeTax() || [];
  const ProvisionforInvestmentAllowance =
    extractors.ProvisionforInvestmentAllowance() || [];
  const incomeTaxCal = extractors.incomeTaxCal() || [];
  const netProfitAfterTax = extractors.netProfitAfterTax() || [];

  console.log("form Data : ", formData);

  console.log("net Profit After Tax :", netProfitAfterTax);

  const filteredDirectExpenses = directExpensesArray.filter(
    (exp) => exp.name !== "Raw Material Expenses / Purchases"
  );

  const hasRawMaterial = rawmaterial.some((val) => Number(val) !== 0);
  const directExpenseStartSerial = hasRawMaterial ? "d" : "c";

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

  const closingCashBalanceArray = BSextractors.closingCashBalanceArray() || [];

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

  console.log("share Capital", shareCapital);
  return (
    <Page size="A4" style={styles.page}>
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

                  {workingCapitalLoanArr.map((val, idx) => (
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
                          Number(fromOtherBanks[idx]) || 0
                        )}
                      </Text>
                    );
                  })}
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
                    Sub-Total(A)
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
                        {formatNumber(formData, Number(SubTotal[idx]) || 0)}
                      </Text>
                    );
                  })}
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
                          Number(shortTermBorrowings[idx]) || 0
                        )}
                      </Text>
                    );
                  })}
                </View>

                {/* sundry creditors  */}
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

                  {(() => {
                    let cumulative = 0;
                    return Array.from({
                      length: sundryCreditorsArr.length,
                    }).map((_, idx) => {
                      cumulative += sundryCreditorsArr[idx] || 0;
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
                    });
                  })()}
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

                  {yearLabels.map((label, idx) => {
                    return (
                      <Text
                        key={idx}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                        ]}
                      >
                        {formatNumber(formData, Number(capitalGoods[idx]) || 0)}
                      </Text>
                    );
                  })}
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

                  {yearLabels.map((label, idx) => {
                    return (
                      <Text
                        key={idx}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                        ]}
                      >
                        {formatNumber(formData, Number(taxation[idx]) || 0)}
                      </Text>
                    );
                  })}
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

                  {yearLabels.map((label, idx) => {
                    return (
                      <Text
                        key={idx}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                        ]}
                      >
                        {formatNumber(formData, Number(dividend[idx]) || 0)}
                      </Text>
                    );
                  })}
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
                          Number(statutoryLiab[idx]) || 0
                        )}
                      </Text>
                    );
                  })}
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
                          Number(repaymentValueswithin12months[idx]) || 0
                        )}
                      </Text>
                    );
                  })}
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

                  {otherCurrentLiabilitiesTotal.map((val, idx) => (
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

                  {subTotalB.map((val, idx) => (
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

                  {totalAandB.map((val, idx) => (
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

                  {yearLabels.map((label, idx) => {
                    return (
                      <Text
                        key={idx}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                        ]}
                      >
                        {formatNumber(formData, Number(debentures[idx]) || 0)}
                      </Text>
                    );
                  })}
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
                    Preference Shares ( excluding Redeemable within one year)
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
                          Number(preferenceShares[idx]) || 0
                        )}
                      </Text>
                    );
                  })}
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
                    Term Loans (excluding Instalments payable within one year)
                  </Text>

                  {bankTermLoanArr.map((val, idx) => (
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
                    Vehicle Loan (excluding Instalments payable within one year)
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
                        {formatNumber(formData, Number(vehicleLoan[idx]) || 0)}
                      </Text>
                    );
                  })}
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
                          Number(deferredTaxLiability[idx]) || 0
                        )}
                      </Text>
                    );
                  })}
                </View>

                {/* Other Term Liabilities (Q.E.)  */}
                <View style={[styles.tableRow, styles.totalRow]}>
                  <Text style={stylesCOP.serialNoCellDetail}>15</Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                    ]}
                  >
                    Other Term Liabilities (Q.E.)
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
                          Number(otherTermLiabilities[idx]) || 0
                        )}
                      </Text>
                    );
                  })}
                </View>

                {/* Total term Liabilities   */}
                <View style={[styles.tableRow, styles.totalRow]}>
                  <Text style={stylesCOP.serialNoCellDetail}>10</Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                    ]}
                  >
                    Total Term Liabilities (Total of 11 to 16)
                  </Text>

                  {totalTermLiabilities.map((val, idx) => (
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

                  {totalOutsidersLiabilities.map((val, idx) => (
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

                  {shareCapital.map((val, idx) => (
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
                          Number(generalReserve[idx]) || 0
                        )}
                      </Text>
                    );
                  })}
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

                  {yearLabels.map((label, idx) => {
                    return (
                      <Text
                        key={idx}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                        ]}
                      >
                        {formatNumber(formData, Number(subsidy[idx]) || 0)}
                      </Text>
                    );
                  })}
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

                  {yearLabels.map((label, idx) => {
                    return (
                      <Text
                        key={idx}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                        ]}
                      >
                        {formatNumber(formData, Number(otherReserve[idx]) || 0)}
                      </Text>
                    );
                  })}
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
                          Number(reservesAndSurplusArr[idx]) || 0
                        )}
                      </Text>
                    );
                  })}
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

                  {netWorth.map((val, idx) => (
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

                  {totalLiabilities.map((val, idx) => (
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
                          Number(closingCashBalanceArray[idx]) || 0
                        )}
                      </Text>
                    );
                  })}
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

                {/* trustee securitees */}
                <View style={[styles.tableRow, styles.totalRow]}>
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

                  {investments.map((val, idx) => (
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
                    (II) Fixed Deposits with Banks
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
                          Number(fixedDeposits[idx]) || 0
                        )}
                      </Text>
                    );
                  })}
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

                  {yearLabels.map((val, idx) => (
                    <Text
                      key={idx}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                      ]}
                    >
                      {formatNumber(
                        formData,
                        Number(exportsIncludingBpBd[idx]) || 0
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
                          Number(exportReceivables[idx]) || 0
                        )}
                      </Text>
                    );
                  })}
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
                          Number(instalments[idx]) || 0
                        )}
                      </Text>
                    );
                  })}
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

                  {yearLabels.map((val, idx) => (
                    <Text
                      key={idx}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                      ]}
                    >
                      {formatNumber(formData, 
                         Number(rawMaterialInventory[idx]) || 0
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
                          Number(stockProcess[idx]) || 0
                        )}
                      </Text>
                    );
                  })}
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

                  {inventoryArr.map((val, idx) => (
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

                  {consumableSpares.map((val, idx) => (
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

                  {advancesToSuppliers.map((val, idx) => (
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

                  {paymentOfTaxes.map((val, idx) => (
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

                  {otherCurrentAssetsTotal.map((val, idx) => (
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
        </View>
      </View>
    </Page>
  );
};

export default CMAAnalysisOfBS;
