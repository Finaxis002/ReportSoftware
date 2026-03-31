import {
  Page,
  View,
  Text,
  Font,
} from "@react-pdf/renderer";
import { makeCMAExtractors } from "../Utils/CMA/cmaExtractors";
import shouldHideFirstYear from "../PDFComponents/HideFirstYear";

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

// Font registration (optional)
Font.register({
  family: "Roboto",
  src: "https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Me5Q.ttf",
});

// Main component
const CMAOperatingStatementPDF = ({ formData, orientation }) => {
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
  const grossSales = extractors.grossSales();
  const dutiesTaxes = extractors.dutiesTaxes();
  const netSales = extractors.netSales();
  const depreciation = extractors.depreciation();
  const salaryandwages = extractors.salary();
  const rawmaterial = extractors.rawMaterial();
  const directExpensesArray = extractors.directExpenses?.() || [];
  const filteredDirectExpenses = directExpensesArray.filter(
    (exp) => exp.name !== "Raw Material Expenses / Purchases"
  );
  const StockAdjustment = extractors.StockAdjustment();
  const OpeningStockinProcess = extractors.OpeningStockinProcess();
  const SubTotalCostofSales = extractors.SubTotalCostofSales();
  const OpeningStock = extractors.openingStocks() || [];
  const closingStocks = extractors.closingStocks() || [];
  const TotalCostofSales = extractors.TotalCostofSales() || [];
  const GrossProfit = extractors.GrossProfit() || [];
  const interestOnTermLoan = formData?.computedData?.yearlyInterestLiabilities;
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
  const advanceDirectRows = extractors.advanceDirectRows() || [];
  const revenueArray =
    formData?.computedData?.totalRevenueReceipts || grossSales || [];
  const normalizedRevenue = Array.isArray(revenueArray)
    ? revenueArray.map((v) => Number(v || 0))
    : [];
  const hideFirstYear = shouldHideFirstYear(normalizedRevenue) || 0;

  const visibleYearLabels =
    hideFirstYear > 0 ? yearLabels.slice(hideFirstYear) : yearLabels;

  const trimVisible = (arr = []) =>
    Array.isArray(arr) ? arr.slice(hideFirstYear) : [];

  const vGrossSales = trimVisible(grossSales);
  const vDutiesTaxes = trimVisible(dutiesTaxes);
  const vNetSales = trimVisible(netSales);
  const vDepreciation = trimVisible(depreciation);
  const vSalaryandwages = trimVisible(salaryandwages);
  const vRawmaterial = trimVisible(rawmaterial);
  const vStockAdjustment = trimVisible(StockAdjustment);
  const vOpeningStockinProcess = trimVisible(OpeningStockinProcess);
  const vSubTotalCostofSales = trimVisible(SubTotalCostofSales);
  const vOpeningStock = trimVisible(OpeningStock);
  const vClosingStocks = trimVisible(closingStocks);
  const vTotalCostofSales = trimVisible(TotalCostofSales);
  const vGrossProfit = trimVisible(GrossProfit);
  const vInterestOnTermLoan = trimVisible(interestOnTermLoan);
  const vInterestOnWCArray = trimVisible(interestOnWCArray);
  const vAdminValues = trimVisible(adminValues);
  const vPreliminaryWriteOffPerYear = trimVisible(preliminaryWriteOffPerYear);
  const vOperatingProfit = trimVisible(OperatingProfit);
  const vProfitbeforeTax = trimVisible(ProfitbeforeTax);
  const vProvisionforInvestmentAllowance = trimVisible(
    ProvisionforInvestmentAllowance
  );
  const vIncomeTaxCal = trimVisible(incomeTaxCal);
  const vNetProfitAfterTax = trimVisible(netProfitAfterTax);
  const vAdvanceDirectRows = advanceDirectRows.map((row) => ({
    ...row,
    values: trimVisible(row.values || []),
  }));
  const trimmedDirectExpenses = filteredDirectExpenses.map((exp) => ({
    ...exp,
    values: trimVisible(exp.values || []),
  }));


  const hasRawMaterial = vRawmaterial.some((val) => Number(val) !== 0);
  const directExpenseStartSerial = hasRawMaterial ? "d" : "c";

  const isAdvancedLandscape = orientation === "advanced-landscape";
  let splitYearLabels = [visibleYearLabels];
  if (isAdvancedLandscape) {
    const visibleLabels = visibleYearLabels;
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
      const pageStart = splitYearLabels
        .slice(0, pageIdx)
        .reduce((sum, chunk) => sum + chunk.length, 0);
      const globalIndex = (localIdx) => pageStart + localIdx;

      return (
        <Page
          key={`cma-operating-${pageIdx}`}
          size="A4"
          style={pageStyles.page}
          orientation="landscape"
        >
          <View style={pageStyles.safeArea}>
            <View style={[styleExpenses.paddingx, { paddingBottom: "30px" }]}>
              {/* name and financial year  */}
              <Header formData={formData} />

              {/* header  */}
              <View>
                <View>
                  <View style={[stylesCOP.heading, { marginBottom: 10 }]}>
                    <Text>
                      Credit Monitoring Arrangement (CMA) Report
                      {splitYearLabels.length > 1
                        ? ` (${toRoman(pageIdx)})`
                        : ""}
                    </Text>
                  </View>

                  <View style={stylesCOP.heading}>
                    <Text>Operating Statement</Text>
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

                  {/* Generate Dynamic Year Headers using paged labels */}
                  {labels.map((label, idx) => (
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
                      />
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                          styles.Total,
                        ]}
                      />
                      {labels.map((label, idx) => (
                        <Text
                          key={label || idx}
                          style={[
                            stylesCOP.particularsCellsDetail,
                            styleExpenses.fontSmall,
                            { paddingVertical: "5px" },
                          ]}
                        />
                      ))}
                    </View>

                    {/* 1 Gross Sales */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>1</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Gross Sales
                      </Text>

                      {labels.map((_, localIdx) => (
                        <Text
                          key={`gross-${localIdx}`}
                          style={[
                            stylesCOP.particularsCellsDetail,
                            styleExpenses.fontSmall,
                          ]}
                        >
                          {formatNumber(
                            formData,
                            Number(vGrossSales?.[globalIndex(localIdx)]) || 0
                          )}
                        </Text>
                      ))}
                    </View>

                    {/* 2 Less: Duties & Taxes */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>2</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Less: Duties & Taxes
                      </Text>

                      {labels.map((_, localIdx) => (
                        <Text
                          key={`duties-${localIdx}`}
                          style={[
                            stylesCOP.particularsCellsDetail,
                            styleExpenses.fontSmall,
                          ]}
                        >
                          {formatNumber(
                            formData,
                            Number(vDutiesTaxes?.[globalIndex(localIdx)]) || 0
                          )}
                        </Text>
                      ))}
                    </View>

                    {/* 3 Net Sales */}
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
                        ]}
                      >
                        Net Sales
                      </Text>

                      {labels.map((_, localIdx) => (
                        <Text
                          key={`vNetSales-${localIdx}`}
                          style={[
                            stylesCOP.particularsCellsDetail,
                            stylesCOP.boldText,
                            styleExpenses.fontSmall,
                            { borderLeftWidth: "0px" },
                          ]}
                        >
                          {formatNumber(
                            formData,
                            Number(vNetSales?.[globalIndex(localIdx)]) || 0
                          )}
                        </Text>
                      ))}
                    </View>

                    {/* 4 Cost of Sales */}
                    <View>
                      {/* Cost of Sales header */}
                      <View style={[styles.tableRow, styles.totalRow]}>
                        <Text
                          style={[
                            stylesCOP.serialNoCellDetail,
                            styles.Total,
                            { paddingVertical: "10px" },
                          ]}
                        >
                          4
                        </Text>
                        <Text
                          style={[
                            stylesCOP.detailsCellDetail,
                            styleExpenses.particularWidth,
                            styleExpenses.bordernone,
                            styles.Total,
                            { paddingVertical: "10px" },
                          ]}
                        >
                          Cost of Sales
                        </Text>
                        {labels.map((_, localIdx) => (
                          <Text
                            key={`cos-head-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          />
                        ))}
                      </View>

                      {/* a vDepreciation */}
                      <View style={[styles.tableRow, styles.totalRow]}>
                        <Text style={stylesCOP.serialNoCellDetail}>a</Text>
                        <Text
                          style={[
                            stylesCOP.detailsCellDetail,
                            styleExpenses.particularWidth,
                            styleExpenses.bordernone,
                          ]}
                        >
                          vDepreciation
                        </Text>

                        {labels.map((_, localIdx) => (
                          <Text
                            key={`cos-dep-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(vDepreciation?.[globalIndex(localIdx)]) || 0
                            )}
                          </Text>
                        ))}
                      </View>

                      {/* b Salaries & Wages */}
                      <View style={[styles.tableRow, styles.totalRow]}>
                        <Text style={stylesCOP.serialNoCellDetail}>b</Text>
                        <Text
                          style={[
                            stylesCOP.detailsCellDetail,
                            styleExpenses.particularWidth,
                            styleExpenses.bordernone,
                          ]}
                        >
                          Salaries & Wages
                        </Text>

                        {labels.map((_, localIdx) => (
                          <Text
                            key={`cos-sal-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(vSalaryandwages?.[globalIndex(localIdx)]) ||
                                0
                            )}
                          </Text>
                        ))}
                      </View>

                      {/* c raw material */}
                      {vRawmaterial.some((val) => Number(val) !== 0) && (
                        <View style={[styles.tableRow, styles.totalRow]}>
                          <Text style={stylesCOP.serialNoCellDetail}>c</Text>
                          <Text
                            style={[
                              stylesCOP.detailsCellDetail,
                              styleExpenses.particularWidth,
                              styleExpenses.bordernone,
                            ]}
                          >
                            Raw Material Expenses
                          </Text>

                          {labels.map((_, localIdx) => (
                            <Text
                              key={`cos-rm-${localIdx}`}
                              style={[
                                stylesCOP.particularsCellsDetail,
                                styleExpenses.fontSmall,
                              ]}
                            >
                              {formatNumber(
                                formData,
                                Number(vRawmaterial?.[globalIndex(localIdx)]) ||
                                  0
                              )}
                            </Text>
                          ))}
                        </View>
                      )}

                      {/* map direct expenses type=direct */}
                      {trimmedDirectExpenses.map((expense, idx) => (
                        <View
                          key={expense.key || expense.name || idx}
                          style={[styles.tableRow, styles.totalRow]}
                        >
                          <Text style={stylesCOP.serialNoCellDetail}>
                            {String.fromCharCode(
                              directExpenseStartSerial.charCodeAt(0) + idx
                            )}
                          </Text>
                          <Text
                            style={[
                              stylesCOP.detailsCellDetail,
                              styleExpenses.particularWidth,
                              styleExpenses.bordernone,
                            ]}
                          >
                            {expense.name}
                          </Text>

                          {labels.map((_, localIdx) => (
                            <Text
                              key={`dir-${idx}-${localIdx}`}
                              style={[
                                stylesCOP.particularsCellsDetail,
                                styleExpenses.fontSmall,
                              ]}
                            >
                              {formatNumber(
                                formData,
                                Array.isArray(expense.values)
                                  ? Number(
                                      expense.values[globalIndex(localIdx)]
                                    ) || 0
                                  : Number(expense.value) || 0
                              )}
                            </Text>
                          ))}
                        </View>
                      ))}

                      {/* Map advance direct expenses */}
                      {vAdvanceDirectRows.map((expense, idx) => {
                        // Calculate the serial number (continue from direct expenses)
                        const advanceSerialNumber = String.fromCharCode(
                          directExpenseStartSerial.charCodeAt(0) +
                            trimmedDirectExpenses.length +
                            idx
                        );

                        return (
                          <View
                            key={expense.key || `advance-${idx}`}
                            style={[styles.tableRow, styles.totalRow]}
                          >
                            <Text style={stylesCOP.serialNoCellDetail}>
                              {advanceSerialNumber}
                            </Text>
                            <Text
                              style={[
                                stylesCOP.detailsCellDetail,
                                styleExpenses.particularWidth,
                                styleExpenses.bordernone,
                              ]}
                            >
                              {expense.name}
                            </Text>

                            {visibleYearLabels.map((label, yidx) => (
                              <Text
                                key={yidx}
                                style={[
                                  stylesCOP.particularsCellsDetail,
                                  styleExpenses.fontSmall,
                                ]}
                              >
                                {formatNumber(
                                  formData,
                                  Array.isArray(expense.values)
                                    ? Number(expense.values[yidx]) || 0
                                    : Number(expense.value) || 0
                                )}
                              </Text>
                            ))}
                          </View>
                        );
                      })}

                      {/* sub total of cost of sales */}
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
                            styles.Total,
                          ]}
                        >
                          Sub-Total
                        </Text>

                        {labels.map((_, localIdx) => (
                          <Text
                            key={`cos-sub-${localIdx}`}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              stylesCOP.boldText,
                              styleExpenses.fontSmall,
                              { borderLeftWidth: "0px" },
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Number(
                                vSubTotalCostofSales?.[globalIndex(localIdx)]
                              ) || 0
                            )}
                          </Text>
                        ))}
                      </View>
                    </View>

                    {/* Add: Opening Stock in Process */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail} />
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Add: Opening Stock in Process
                      </Text>

                      {labels.map((_, localIdx) => (
                        <Text
                          key={`osip-${localIdx}`}
                          style={[
                            stylesCOP.particularsCellsDetail,
                            styleExpenses.fontSmall,
                          ]}
                        >
                          {formatNumber(
                            formData,
                            Number(
                              vOpeningStockinProcess?.[globalIndex(localIdx)]
                            ) || 0
                          )}
                        </Text>
                      ))}
                    </View>

                    {/* Less: Stock Adjustment */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail} />
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Less: Stock Adjustment
                      </Text>

                      {labels.map((_, localIdx) => (
                        <Text
                          key={`stock-adj-${localIdx}`}
                          style={[
                            stylesCOP.particularsCellsDetail,
                            styleExpenses.fontSmall,
                          ]}
                        >
                          {formatNumber(
                            formData,
                            Number(vStockAdjustment?.[globalIndex(localIdx)]) ||
                              0
                          )}
                        </Text>
                      ))}
                    </View>

                    {/* Cost of Production */}
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
                        Cost of Production
                      </Text>

                      {labels.map((_, localIdx) => (
                        <Text
                          key={`cop-${localIdx}`}
                          style={[
                            stylesCOP.particularsCellsDetail,
                            stylesCOP.boldText,
                            styleExpenses.fontSmall,
                            {
                              borderLeftWidth: "0px",
                              borderBottomWidth: "0px",
                            },
                          ]}
                        >
                          {formatNumber(
                            formData,
                            Number(
                              vSubTotalCostofSales?.[globalIndex(localIdx)]
                            ) || 0
                          )}
                        </Text>
                      ))}
                    </View>

                    {/* Add: Opening Stock */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail} />
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Add: Opening Stock
                      </Text>

                      {labels.map((_, localIdx) => (
                        <Text
                          key={`os-${localIdx}`}
                          style={[
                            stylesCOP.particularsCellsDetail,
                            styleExpenses.fontSmall,
                          ]}
                        >
                          {formatNumber(
                            formData,
                            Number(vOpeningStock?.[globalIndex(localIdx)]) || 0
                          )}
                        </Text>
                      ))}
                    </View>

                    {/* Less: Closing Stock */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail} />
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Less: Closing Stock
                      </Text>

                      {labels.map((_, localIdx) => (
                        <Text
                          key={`cs-${localIdx}`}
                          style={[
                            stylesCOP.particularsCellsDetail,
                            styleExpenses.fontSmall,
                          ]}
                        >
                          {formatNumber(
                            formData,
                            Number(vClosingStocks?.[globalIndex(localIdx)]) || 0
                          )}
                        </Text>
                      ))}
                    </View>

                    {/* Total Cost of Sales */}
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
                          styles.Total,
                        ]}
                      >
                        Total Cost of Sales
                      </Text>

                      {labels.map((_, localIdx) => (
                        <Text
                          key={`tcos-${localIdx}`}
                          style={[
                            stylesCOP.particularsCellsDetail,
                            stylesCOP.boldText,
                            styleExpenses.fontSmall,
                            {
                              borderLeftWidth: "0px",
                              borderBottomWidth: "0px",
                            },
                          ]}
                        >
                          {formatNumber(
                            formData,
                            Number(vTotalCostofSales?.[globalIndex(localIdx)]) ||
                              0
                          )}
                        </Text>
                      ))}
                    </View>
                  </View>

                  {/* second part  */}
                  <View>
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
                      {labels.map((label, idx) => (
                        <Text
                          key={label || idx}
                          style={[
                            stylesCOP.particularsCellsDetail,
                            styleExpenses.fontSmall,
                            { paddingVertical: "5px" },
                          ]}
                        />
                      ))}
                    </View>

                    {/* 5 Gross Profit */}
                    <View
                      style={[
                        stylesMOF.row,
                        styles.tableRow,
                        { borderBottomWidth: "0px", borderTopWidth: 0 },
                      ]}
                    >
                      <Text
                        style={[
                          stylesCOP.serialNoCellDetail,
                          styleExpenses.sno,
                          stylesCOP.boldText,
                          styleExpenses.bordernone,
                          { borderTopWidth: 0 },
                        ]}
                      >
                        5
                      </Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          stylesCOP.boldText,
                          styleExpenses.bordernone,
                          { borderTopWidth: 0 },
                        ]}
                      >
                        Gross Profit
                      </Text>

                      {labels.map((_, localIdx) => (
                        <Text
                          key={`gp-${localIdx}`}
                          style={[
                            stylesCOP.particularsCellsDetail,
                            stylesCOP.boldText,
                            styleExpenses.fontSmall,
                            {
                              borderLeftWidth: "0px",
                              borderBottomWidth: "0px",
                              borderTopWidth: 0,
                            },
                          ]}
                        >
                          {formatNumber(
                            formData,
                            Number(vGrossProfit?.[globalIndex(localIdx)]) || 0
                          )}
                        </Text>
                      ))}
                    </View>

                    {/* 6 Interest on Term Loan */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>6</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Interest on Term Loan
                      </Text>

                      {labels.map((_, localIdx) => (
                        <Text
                          key={`itl-${localIdx}`}
                          style={[
                            stylesCOP.particularsCellsDetail,
                            styleExpenses.fontSmall,
                          ]}
                        >
                          {formatNumber(
                            formData,
                            Number(
                              vInterestOnTermLoan?.[globalIndex(localIdx)]
                            ) || 0
                          )}
                        </Text>
                      ))}
                    </View>

                    {/* 7 Interest on Working Capital */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>7</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Interest on Working Capital
                      </Text>

                      {labels.map((_, localIdx) => (
                        <Text
                          key={`iwc-${localIdx}`}
                          style={[
                            stylesCOP.particularsCellsDetail,
                            styleExpenses.fontSmall,
                          ]}
                        >
                          {formatNumber(
                            formData,
                            Number(
                              vInterestOnWCArray?.[globalIndex(localIdx)]
                            ) || 0
                          )}
                        </Text>
                      ))}
                    </View>

                    {/* 8 Administrative Expenses */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>8</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Administrative Expenses
                      </Text>

                      {labels.map((_, localIdx) => (
                        <Text
                          key={`admin-${localIdx}`}
                          style={[
                            stylesCOP.particularsCellsDetail,
                            styleExpenses.fontSmall,
                          ]}
                        >
                          {formatNumber(
                            formData,
                            Number(vAdminValues?.[globalIndex(localIdx)]) || 0
                          )}
                        </Text>
                      ))}
                    </View>

                    {/* 9 Preliminary Expenses Written Off */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>9</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Preliminary Expenses Written Off
                      </Text>

                      {labels.map((_, localIdx) => (
                        <Text
                          key={`prelim-${localIdx}`}
                          style={[
                            stylesCOP.particularsCellsDetail,
                            styleExpenses.fontSmall,
                          ]}
                        >
                          {formatNumber(
                            formData,
                            Number(
                              preliminaryWriteOffPerYear?.[
                                globalIndex(localIdx)
                              ]
                            ) || 0
                          )}
                        </Text>
                      ))}
                    </View>

                    {/* 10 Operating Profit */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text
                        style={[
                          stylesCOP.serialNoCellDetail,
                          { borderTopWidth: 0 },
                        ]}
                      >
                        10
                      </Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                          { borderTopWidth: 0 },
                        ]}
                      >
                        Operating Profit
                      </Text>

                      {labels.map((_, localIdx) => (
                        <Text
                          key={`op-${localIdx}`}
                          style={[
                            stylesCOP.particularsCellsDetail,
                            stylesCOP.boldText,
                            styleExpenses.fontSmall,
                            { borderLeftWidth: "0px", borderBottomWidth: 0 },
                          ]}
                        >
                          {formatNumber(
                            formData,
                            Number(vOperatingProfit?.[globalIndex(localIdx)]) ||
                              0
                          )}
                        </Text>
                      ))}
                    </View>

                    {/* 11 Other income / expenses */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text
                        style={[
                          stylesCOP.serialNoCellDetail,
                          { borderTopWidth: 0 },
                        ]}
                      >
                        11
                      </Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                          { borderTopWidth: 0 },
                        ]}
                      >
                        Other income / expenses
                      </Text>

                      {labels.map((_, localIdx) => (
                        <Text
                          key={`other-${localIdx}`}
                          style={[
                            stylesCOP.particularsCellsDetail,
                            styleExpenses.fontSmall,
                          ]}
                        >
                          {0}
                        </Text>
                      ))}
                    </View>

                    {/* 12 Profit before Tax */}
                    <View
                      style={[
                        stylesMOF.row,
                        styles.tableRow,
                        { borderBottomWidth: "0px", borderTopWidth: 0 },
                      ]}
                    >
                      <Text
                        style={[
                          stylesCOP.serialNoCellDetail,
                          styleExpenses.sno,
                          stylesCOP.boldText,
                          styleExpenses.bordernone,
                          { borderTopWidth: 0 },
                        ]}
                      >
                        12
                      </Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          stylesCOP.boldText,
                          styleExpenses.bordernone,
                          { borderTopWidth: 0 },
                        ]}
                      >
                        Profit before Tax
                      </Text>

                      {labels.map((_, localIdx) => (
                        <Text
                          key={`pbt-${localIdx}`}
                          style={[
                            stylesCOP.particularsCellsDetail,
                            stylesCOP.boldText,
                            styleExpenses.fontSmall,
                            { borderLeftWidth: "0px", borderBottomWidth: 0 },
                          ]}
                        >
                          {formatNumber(
                            formData,
                            Number(vProfitbeforeTax?.[globalIndex(localIdx)]) ||
                              0
                          )}
                        </Text>
                      ))}
                    </View>

                    {/* 13 Less: Provision for Investment Allowance */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>13</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Less: Provision for Investment Allowance
                      </Text>

                      {labels.map((_, localIdx) => (
                        <Text
                          key={`pia-${localIdx}`}
                          style={[
                            stylesCOP.particularsCellsDetail,
                            styleExpenses.fontSmall,
                          ]}
                        >
                          {formatNumber(
                            formData,
                            Number(
                              vProvisionforInvestmentAllowance?.[
                                globalIndex(localIdx)
                              ]
                            ) || 0
                          )}
                        </Text>
                      ))}
                    </View>

                    {/* 14 Less: Provision for tax */}
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>14</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Less: Provision for tax
                      </Text>

                      {labels.map((_, localIdx) => (
                        <Text
                          key={`ptax-${localIdx}`}
                          style={[
                            stylesCOP.particularsCellsDetail,
                            styleExpenses.fontSmall,
                          ]}
                        >
                          {formatNumber(
                            formData,
                            Number(vIncomeTaxCal?.[globalIndex(localIdx)]) || 0
                          )}
                        </Text>
                      ))}
                    </View>

                    {/* 15 Net Profit After Tax */}
                    <View
                      style={[
                        stylesMOF.row,
                        styles.tableRow,
                        { borderBottomWidth: "0px", borderTopWidth: 0 },
                      ]}
                    >
                      <Text
                        style={[
                          stylesCOP.serialNoCellDetail,
                          styleExpenses.sno,
                          stylesCOP.boldText,
                          styleExpenses.bordernone,
                          { borderTopWidth: 0 },
                        ]}
                      >
                        15
                      </Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          stylesCOP.boldText,
                          styleExpenses.bordernone,
                          { borderTopWidth: 0 },
                        ]}
                      >
                        Net Profit After Tax
                      </Text>

                      {labels.map((_, localIdx) => (
                        <Text
                          key={`npat-final-${localIdx}`}
                          style={[
                            stylesCOP.particularsCellsDetail,
                            stylesCOP.boldText,
                            styleExpenses.fontSmall,
                            { borderLeftWidth: "0px", borderBottomWidth: 0 },
                          ]}
                        >
                          {formatNumber(
                            formData,
                            Number(
                              vNetProfitAfterTax?.[globalIndex(localIdx)]
                            ) || 0
                          )}
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
              <View style={[stylesCOP.heading, { marginBottom: 10 }]}>
                <Text>Credit Monitoring Arrangement (CMA) Report</Text>
              </View>

              <View style={stylesCOP.heading}>
                <Text>Operating Statement</Text>
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
              {visibleYearLabels.map((label, idx) => (
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

                  {visibleYearLabels.map((label, idx) => (
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
                {/* 1 Gross Sales */}
                <View style={[styles.tableRow, styles.totalRow]}>
                  <Text style={stylesCOP.serialNoCellDetail}>1</Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                    ]}
                  >
                    Gross Sales
                  </Text>

                  {visibleYearLabels.map((label, idx) => {
                    return (
                      <Text
                        key={idx}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                        ]}
                      >
                        {formatNumber(formData, Number(vGrossSales[idx]) || 0)}
                      </Text>
                    );
                  })}
                </View>

                {/* 2 Less: Duties & Taxes */}
                <View style={[styles.tableRow, styles.totalRow]}>
                  <Text style={stylesCOP.serialNoCellDetail}>2</Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                    ]}
                  >
                    Less: Duties & Taxes
                  </Text>

                  {visibleYearLabels.map((label, idx) => {
                    return (
                      <Text
                        key={idx}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                        ]}
                      >
                        {formatNumber(formData, Number(vDutiesTaxes[idx]) || 0)}
                      </Text>
                    );
                  })}
                </View>

                {/* 3 Net Sales */}
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
                    Net Sales
                  </Text>

                  {visibleYearLabels.map((label, idx) => {
                    return (
                      <Text
                        key={idx}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          stylesCOP.boldText,
                          styleExpenses.fontSmall,
                          {
                            borderLeftWidth: "0px",
                          },
                        ]}
                      >
                        {formatNumber(formData, Number(vNetSales[idx]) || 0)}
                      </Text>
                    );
                  })}
                </View>

                {/* 4 Cost of Sales */}
                <View>
                  {/* Cost of Sales header  */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text
                      style={[
                        stylesCOP.serialNoCellDetail,
                        styles.Total,
                        { paddingVertical: "10px" },
                      ]}
                    >
                      4
                    </Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                        styles.Total,
                        { paddingVertical: "10px" },
                      ]}
                    >
                      Cost of Sales
                    </Text>
                    {visibleYearLabels.map((label, idx) => {
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

                  {/* a vDepreciation  */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={stylesCOP.serialNoCellDetail}>a</Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      vDepreciation
                    </Text>

                    {visibleYearLabels.map((label, idx) => {
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
                            Number(vDepreciation[idx]) || 0
                          )}
                        </Text>
                      );
                    })}
                  </View>
                  {/* b Salaries & Wages  */}
                  <View style={[styles.tableRow, styles.totalRow]}>
                    <Text style={stylesCOP.serialNoCellDetail}>b</Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      Salaries & Wages
                    </Text>

                    {visibleYearLabels.map((label, idx) => {
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
                            Number(vSalaryandwages[idx]) || 0
                          )}
                        </Text>
                      );
                    })}
                  </View>
                  {/* c raw material  */}
                  {vRawmaterial.some((val) => Number(val) !== 0) && (
                    <View style={[styles.tableRow, styles.totalRow]}>
                      <Text style={stylesCOP.serialNoCellDetail}>c</Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        Raw Material Expenses
                      </Text>

                      {visibleYearLabels.map((label, idx) => {
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
                              Number(vRawmaterial[idx]) || 0
                            )}
                          </Text>
                        );
                      })}
                    </View>
                  )}

                  {/* map direct expenses type=direct  */}
                  {trimmedDirectExpenses.map((expense, idx) => (
                    <View
                      key={expense.key || expense.name || idx}
                      style={[styles.tableRow, styles.totalRow]}
                    >
                      <Text style={stylesCOP.serialNoCellDetail}>
                        {String.fromCharCode(
                          directExpenseStartSerial.charCodeAt(0) + idx
                        )}
                        {/* This gives 'd', 'e', 'f', ... OR 'c', 'd', ... */}
                      </Text>
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                        ]}
                      >
                        {expense.name}
                      </Text>
                      {visibleYearLabels.map((label, yidx) => (
                        <Text
                          key={yidx}
                          style={[
                            stylesCOP.particularsCellsDetail,
                            styleExpenses.fontSmall,
                          ]}
                        >
                          {formatNumber(
                            formData,
                            Array.isArray(expense.values)
                              ? Number(expense.values[yidx]) || 0
                              : Number(expense.value) || 0
                          )}
                        </Text>
                      ))}
                    </View>
                  ))}

                  {/* Map advance direct expenses */}
                  {vAdvanceDirectRows.map((expense, idx) => {
                    // Calculate the serial number (continue from direct expenses)
                    const advanceSerialNumber = String.fromCharCode(
                      directExpenseStartSerial.charCodeAt(0) +
                        trimmedDirectExpenses.length +
                        idx
                    );

                    return (
                      <View
                        key={expense.key || `advance-${idx}`}
                        style={[styles.tableRow, styles.totalRow]}
                      >
                        <Text style={stylesCOP.serialNoCellDetail}>
                          {advanceSerialNumber}
                        </Text>
                        <Text
                          style={[
                            stylesCOP.detailsCellDetail,
                            styleExpenses.particularWidth,
                            styleExpenses.bordernone,
                          ]}
                        >
                          {expense.name}
                        </Text>

                        {visibleYearLabels.map((label, yidx) => (
                          <Text
                            key={yidx}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                            ]}
                          >
                            {formatNumber(
                              formData,
                              Array.isArray(expense.values)
                                ? Number(expense.values[yidx]) || 0
                                : Number(expense.value) || 0
                            )}
                          </Text>
                        ))}
                      </View>
                    );
                  })}
                  {/* sub total of cost of sales  */}
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
                        styles.Total,
                      ]}
                    >
                      Sub-Total
                    </Text>

                    {visibleYearLabels.map((label, idx) => {
                      return (
                        <Text
                          key={idx}
                          style={[
                            stylesCOP.particularsCellsDetail,
                            stylesCOP.boldText,
                            styleExpenses.fontSmall,
                            {
                              borderLeftWidth: "0px",
                            },
                          ]}
                        >
                          {formatNumber(
                            formData,
                            Number(vSubTotalCostofSales[idx]) || 0
                          )}
                        </Text>
                      );
                    })}
                  </View>
                </View>

                {/* Add: Opening Stock in Process  */}
                <View style={[styles.tableRow, styles.totalRow]}>
                  <Text style={stylesCOP.serialNoCellDetail}></Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                    ]}
                  >
                    Add: Opening Stock in Process
                  </Text>

                  {visibleYearLabels.map((label, idx) => {
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
                          Number(vOpeningStockinProcess[idx]) || 0
                        )}
                      </Text>
                    );
                  })}
                </View>

                {/* Less: Stock Adjustment */}
                <View style={[styles.tableRow, styles.totalRow]}>
                  <Text style={stylesCOP.serialNoCellDetail}></Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                    ]}
                  >
                    Less: Stock Adjustment
                  </Text>

                  {visibleYearLabels.map((label, idx) => {
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
                          Number(vStockAdjustment[idx]) || 0
                        )}
                      </Text>
                    );
                  })}
                </View>

                {/* Cost of Production */}
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
                    Cost of Production
                  </Text>

                  {visibleYearLabels.map((label, idx) => {
                    return (
                      <Text
                        key={idx}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          stylesCOP.boldText,
                          styleExpenses.fontSmall,
                          {
                            borderLeftWidth: "0px",
                            borderBottomWidth: "0px",
                          },
                        ]}
                      >
                        {formatNumber(
                          formData,
                          Number(vSubTotalCostofSales[idx]) || 0
                        )}
                      </Text>
                    );
                  })}
                </View>

                {/* Add: Opening Stock */}
                <View style={[styles.tableRow, styles.totalRow]}>
                  <Text style={stylesCOP.serialNoCellDetail}></Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                    ]}
                  >
                    Add: Opening Stock
                  </Text>

                  {visibleYearLabels.map((label, idx) => {
                    return (
                      <Text
                        key={idx}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                        ]}
                      >
                        {formatNumber(formData, Number(vOpeningStock[idx]) || 0)}
                      </Text>
                    );
                  })}
                </View>

                {/* Less: Closing Stock */}
                <View style={[styles.tableRow, styles.totalRow]}>
                  <Text style={stylesCOP.serialNoCellDetail}></Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                    ]}
                  >
                    Less: Closing Stock
                  </Text>

                  {visibleYearLabels.map((label, idx) => {
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
                          Number(vClosingStocks[idx]) || 0
                        )}
                      </Text>
                    );
                  })}
                </View>

                {/* total of cost of sales  */}
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
                      styles.Total,
                    ]}
                  >
                    Total Cost of Sales
                  </Text>

                  {visibleYearLabels.map((label, idx) => {
                    return (
                      <Text
                        key={idx}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          stylesCOP.boldText,
                          styleExpenses.fontSmall,
                          {
                            borderLeftWidth: "0px",
                            borderBottomWidth: "0px",
                          },
                        ]}
                      >
                        {formatNumber(
                          formData,
                          Number(vTotalCostofSales[idx]) || 0
                        )}
                      </Text>
                    );
                  })}
                </View>
              </View>

              {/* second part  */}
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

                  {visibleYearLabels.map((label, idx) => (
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

                {/* 5 Gross Profit  */}
                <View
                  style={[
                    stylesMOF.row,
                    styles.tableRow,
                    { borderBottomWidth: "0px", borderTopWidth: 0 },
                  ]}
                >
                  <Text
                    style={[
                      stylesCOP.serialNoCellDetail,
                      styleExpenses.sno,
                      stylesCOP.boldText,
                      styleExpenses.bordernone,
                      { borderTopWidth: 0 },
                    ]}
                  >
                    5
                  </Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      stylesCOP.boldText,
                      styleExpenses.bordernone,
                      { borderTopWidth: 0 },
                    ]}
                  >
                    Gross Profit
                  </Text>

                  {visibleYearLabels.map((label, idx) => {
                    return (
                      <Text
                        key={idx}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          stylesCOP.boldText,
                          styleExpenses.fontSmall,
                          {
                            borderLeftWidth: "0px",
                            borderBottomWidth: "0px",
                            borderTopWidth: 0,
                          },
                        ]}
                      >
                        {formatNumber(formData, Number(vGrossProfit[idx]) || 0)}
                      </Text>
                    );
                  })}
                </View>

                {/* 6 Interest on Term Loan */}
                <View style={[styles.tableRow, styles.totalRow]}>
                  <Text style={stylesCOP.serialNoCellDetail}>6</Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                    ]}
                  >
                    Interest on Term Loan
                  </Text>

                  {visibleYearLabels.map((label, idx) => {
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
                          Number(vInterestOnTermLoan[idx]) || 0
                        )}
                      </Text>
                    );
                  })}
                </View>

                {/* 7 Interest on Working Capital */}
                <View style={[styles.tableRow, styles.totalRow]}>
                  <Text style={stylesCOP.serialNoCellDetail}>7</Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                    ]}
                  >
                    Interest on Working Capital
                  </Text>

                  {visibleYearLabels.map((label, idx) => {
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
                          Number(vInterestOnWCArray[idx]) || 0
                        )}
                      </Text>
                    );
                  })}
                </View>

                {/* 8 Administrative Expenses */}
                <View style={[styles.tableRow, styles.totalRow]}>
                  <Text style={stylesCOP.serialNoCellDetail}>8</Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                    ]}
                  >
                    Administrative Expenses
                  </Text>

                  {visibleYearLabels.map((label, idx) => {
                    return (
                      <Text
                        key={idx}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                        ]}
                      >
                        {formatNumber(formData, Number(vAdminValues[idx]) || 0)}
                      </Text>
                    );
                  })}
                </View>

                {/* 9 Preliminary Expenses Written Off */}
                <View style={[styles.tableRow, styles.totalRow]}>
                  <Text style={stylesCOP.serialNoCellDetail}>9</Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                    ]}
                  >
                    Preliminary Expenses Written Off
                  </Text>

                  {visibleYearLabels.map((label, idx) => {
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

                {/* 10 Operating Profit */}
                <View style={[styles.tableRow, styles.totalRow]}>
                  <Text
                    style={[
                      stylesCOP.serialNoCellDetail,
                      { borderTopWidth: 0 },
                    ]}
                  >
                    10
                  </Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                      { borderTopWidth: 0 },
                    ]}
                  >
                    Operating Profit
                  </Text>

                  {visibleYearLabels.map((label, idx) => {
                    return (
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
                          Number(vOperatingProfit[idx]) || 0
                        )}
                      </Text>
                    );
                  })}
                </View>
                {/* 11 Other income / expenses */}
                <View style={[styles.tableRow, styles.totalRow]}>
                  <Text
                    style={[
                      stylesCOP.serialNoCellDetail,
                      { borderTopWidth: 0 },
                    ]}
                  >
                    11
                  </Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                      { borderTopWidth: 0 },
                    ]}
                  >
                    Other income / expenses
                  </Text>

                  {visibleYearLabels.map((label, idx) => {
                    return (
                      <Text
                        key={idx}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                        ]}
                      >
                        {0}
                      </Text>
                    );
                  })}
                </View>

                {/* 12  Profit before Tax*/}
                <View
                  style={[
                    stylesMOF.row,
                    styles.tableRow,
                    { borderBottomWidth: "0px", borderTopWidth: 0 },
                  ]}
                >
                  <Text
                    style={[
                      stylesCOP.serialNoCellDetail,
                      styleExpenses.sno,
                      stylesCOP.boldText,
                      styleExpenses.bordernone,
                      { borderTopWidth: 0 },
                    ]}
                  >
                    12
                  </Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      stylesCOP.boldText,
                      styleExpenses.bordernone,
                      { borderTopWidth: 0 },
                    ]}
                  >
                    Profit before Tax
                  </Text>

                  {visibleYearLabels.map((label, idx) => {
                    return (
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
                          Number(vProfitbeforeTax[idx]) || 0
                        )}
                      </Text>
                    );
                  })}
                </View>

                {/* 13 Less: Provision for Investment Allowance */}
                <View style={[styles.tableRow, styles.totalRow]}>
                  <Text style={stylesCOP.serialNoCellDetail}>13</Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                    ]}
                  >
                    Less: Provision for Investment Allowance
                  </Text>

                  {visibleYearLabels.map((label, idx) => {
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
                          Number(vProvisionforInvestmentAllowance[idx]) || 0
                        )}
                      </Text>
                    );
                  })}
                </View>

                {/* 14 Less: Provision for tax */}
                <View style={[styles.tableRow, styles.totalRow]}>
                  <Text style={stylesCOP.serialNoCellDetail}>14</Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                    ]}
                  >
                    Less: Provision for tax
                  </Text>

                  {visibleYearLabels.map((label, idx) => {
                    return (
                      <Text
                        key={idx}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                        ]}
                      >
                        {formatNumber(formData, Number(vIncomeTaxCal[idx]) || 0)}
                      </Text>
                    );
                  })}
                </View>

                {/* 15 Net Profit After Tax */}
                <View
                  style={[
                    stylesMOF.row,
                    styles.tableRow,
                    { borderBottomWidth: "0px", borderTopWidth: 0 },
                  ]}
                >
                  <Text
                    style={[
                      stylesCOP.serialNoCellDetail,
                      styleExpenses.sno,
                      stylesCOP.boldText,
                      styleExpenses.bordernone,
                      { borderTopWidth: 0 },
                    ]}
                  >
                    15
                  </Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      stylesCOP.boldText,
                      styleExpenses.bordernone,
                      { borderTopWidth: 0 },
                    ]}
                  >
                    Net Profit After Tax
                  </Text>

                  {visibleYearLabels.map((label, idx) => {
                    return (
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
                          Number(vNetProfitAfterTax[idx]) || 0
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

export default CMAOperatingStatementPDF;







