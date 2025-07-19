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
import {CMAExtractorWorkingCap} from '../Utils/CMA/CMAExtractorWorkingCap';
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
const CMAWorkingCapReq = ({ formData }) => {
  // You can import these:

  const years = Number(formData?.ProjectReportSetting?.ProjectionYears || 5);
  const extractors = makeCMAExtractors(formData);
  const yearLabels = extractors.yearLabels();
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

  const netFundsGenerated = Array.from({ length: years }).map(
    (_, idx) =>
      Number(grossFundsGenerated[idx] || 0) - Number(incomeTaxCal[idx] || 0)
  );

  
  
  //new data
  const FinPosextractors = CMAExtractorFinPos(formData);

// new data Assessment of Working Capital Requirements
const WorkingReqExtractor = CMAExtractorWorkingCap(formData) ;
const currentAssets = WorkingReqExtractor.currentAssets() || [];
const otherCurrLiabilities = WorkingReqExtractor.otherCurrLiabilities() || [];
const  workingCapGap = WorkingReqExtractor. workingCapGap() || [];
const workingCapitalLoanArr = WorkingReqExtractor. workingCapitalLoanArr() || [];
const totalCurrLiabilities = WorkingReqExtractor. totalCurrLiabilities() || [];
const NetWorkCap = WorkingReqExtractor. NetWorkCap() || [];
const MinStipulatedMarginMoney = WorkingReqExtractor. MinStipulatedMarginMoney() || [];
const MPBF = WorkingReqExtractor. MPBF() || [];
const MPBF3minus6 =  WorkingReqExtractor.MPBF3minus6() || [];
const maxPermissible =  WorkingReqExtractor.maxPermissible() || [];
const netSales = extractors.netSales() || [];
const turnOver5per = Array.from({length:years}).map((_, i)=>
        Number(Number(netSales[i] || 0) * (.05))
)
const turnOver20per = Array.from({length:years}).map((_, i)=>
        Number(Number(netSales[i] || 0) * (.20))
)

  return (
    <Page size="A4" style={styles.page}>
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
                      {formatNumber(formData, Number(otherCurrLiabilities[idx]) || 0)}
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
                      {formatNumber(formData, Number( workingCapGap[idx]) || 0)}
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

                {maxPermissible.map((val, idx) => (
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
                 Nayak Committee Anitcipated or realistic projection of turnover
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
                 20% of projected turnover as per Nayak Committee Recommendation
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
      </View>
    </Page>
  );
};

export default CMAWorkingCapReq;
