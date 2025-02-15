import React from "react";
import { Page, View, Text } from "@react-pdf/renderer";
import { styles, stylesCOP, stylesMOF, styleExpenses } from "./Styles";
import { Font } from "@react-pdf/renderer";

Font.register({
  family: "Roboto",
  fonts: [
    { src: "https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Me5Q.ttf" }, // Regular
    {
      src: "https://fonts.gstatic.com/s/roboto/v20/KFOlCnqEu92Fr1MmEU9vAw.ttf",
      fontWeight: "bold",
    }, // Bold
  ],
});

const ProjectedCashflow = ({
  formData = {},
  calculations = {},
  totalDepreciationPerYear = [],
  netProfitBeforeTax = [],
  grossProfitValues = [],
  yearlyInterestLiabilities = [],
  yearlyPrincipalRepayment = [],
}) => {
  if (
    !formData ||
    typeof formData !== "object" ||
    !calculations ||
    typeof calculations !== "object"
  ) {
    console.error("❌ Invalid formData or calculations provided");
    return null;
  }

  console.log("data for term loan", yearlyInterestLiabilities);
  const startYear =
    Number(formData?.ProjectReportSetting?.FinancialYear) || 2025;
  const projectionYears =
    Number(formData?.ProjectReportSetting?.ProjectionYears) || 5;

  // ✅ Safe Helper Function to Format Numbers Based on Selected Format
  const formatNumber = (value) => {
    const formatType = formData?.ProjectReportSetting?.Format || "1"; // Default to Indian Format
    if (value === undefined || value === null || isNaN(value)) return "0"; // ✅ Handle invalid values

    switch (formatType) {
      case "1":
        return new Intl.NumberFormat("en-IN").format(value); // Indian Format
      case "2":
        return new Intl.NumberFormat("en-US").format(value); // USD Format
      default:
        return new Intl.NumberFormat("en-IN").format(value); // ✅ Safe default
    }
  };

  return (
    <Page
      size={projectionYears > 12 ? "A3" : "A4"}
      orientation={projectionYears > 7 ? "landscape" : "portrait"}
    >
      <View style={[styleExpenses.paddingx]}>
        <Text style={[styles.clientName]}>
          {formData?.AccountInformation?.clientName || "N/A"}
        </Text>
        <View
          style={[stylesCOP.heading, { fontWeight: "bold", paddingLeft: 10 }]}
        >
          <Text>Projected Cashflow</Text>
        </View>

        <View style={[styles.table]}>
          {/* Header  */}
          <View style={styles.tableHeader}>
            <Text
              style={[
                styles.serialNoCell,
                styleExpenses.sno,
                { textAlign: "center" },
              ]}
            >
              S. No.
            </Text>
            <Text style={[styles.detailsCell, styleExpenses.particularWidth]}>
              Particulars
            </Text>
            {Array.from({ length: projectionYears }).map((_, index) => (
              <Text
                key={index}
                style={[
                  stylesCOP.particularsCellsDetail,
                  styleExpenses.fontSmall,
                ]}
              >
                {`${startYear + index}-${(startYear + index + 1) % 100}`}
              </Text>
            ))}
          </View>

          {/* Sources Section */}

          <View style={[stylesMOF.row, styleExpenses.headerRow]}>
            <Text style={[styleExpenses.sno]}>A</Text>
            <Text style={stylesMOF.cell}>Sources</Text>
          </View>

          {/* Net Profit before Interest & Taxes */}
          <View style={styles.tableRow}>
            <Text
              style={[
                stylesCOP.serialNoCellDetail,
                styleExpenses.sno,
                styleExpenses.bordernone,
                { borderLeftWidth: "1px" },
              ]}
            >
              1
            </Text>
            <Text
              style={[
                stylesCOP.detailsCellDetail,
                styleExpenses.particularWidth,
                styleExpenses.bordernone,
              ]}
            >
              Net Profit before Interest & Taxes
            </Text>
            {Array.from({ length: projectionYears }).map((_, index) => (
              <Text
                key={index}
                style={[
                  stylesCOP.particularsCellsDetail,
                  styleExpenses.fontSmall,
                ]}
              >
                {calculations.sources?.NetProfitBeforeInterestAndTaxes?.[
                  index
                ] || "-"}
              </Text>
            ))}
          </View>

          {/* Promoters’ Capital */}
          <View style={styles.tableRow}>
            <Text
              style={[
                stylesCOP.serialNoCellDetail,
                styleExpenses.sno,
                styleExpenses.bordernone,
                { borderLeftWidth: "1px" },
              ]}
            >
              2
            </Text>
            <Text
              style={[
                stylesCOP.detailsCellDetail,
                styleExpenses.particularWidth,
                styleExpenses.bordernone,
              ]}
            >
              Promoters’ Capital
            </Text>
            {Array.from({ length: projectionYears }).map((_, index) => (
              <Text
                key={index}
                style={[
                  stylesCOP.particularsCellsDetail,
                  styleExpenses.fontSmall,
                ]}
              >
                {index === 0 ? formData.MeansOfFinance.totalPC || "-" : "0"}
              </Text>
            ))}
          </View>

          {/* Bank Term Loan */}
          <View style={styles.tableRow}>
            <Text
              style={[
                stylesCOP.serialNoCellDetail,
                styleExpenses.sno,
                styleExpenses.bordernone,
                { borderLeftWidth: "1px" },
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
              Bank Term Loan
            </Text>
            {Array.from({ length: projectionYears }).map((_, index) => (
              <Text
                key={index}
                style={[
                  stylesCOP.particularsCellsDetail,
                  styleExpenses.fontSmall,
                ]}
              >
                {index === 0 ? formData.MeansOfFinance.totalTL || "-" : "0"}
              </Text>
            ))}
          </View>

          {/* Working Capital Loan */}
          <View style={styles.tableRow}>
            <Text
              style={[
                stylesCOP.serialNoCellDetail,
                styleExpenses.sno,
                styleExpenses.bordernone,
                { borderLeftWidth: "1px" },
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
              Working Capital Loan
            </Text>
            {Array.from({ length: projectionYears }).map((_, index) => (
              <Text
                key={index}
                style={[
                  stylesCOP.particularsCellsDetail,
                  styleExpenses.fontSmall,
                ]}
              >
                {index === 0
                  ? formData.MeansOfFinance?.workingCapital?.termLoan || "-"
                  : "0"}
              </Text>
            ))}
          </View>

          {/* Depreciation */}
          <View style={styles.tableRow}>
            <Text
              style={[
                stylesCOP.serialNoCellDetail,
                styleExpenses.sno,
                styleExpenses.bordernone,
                { borderLeftWidth: "1px" },
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
              Depreciation
            </Text>
            {Array.from({ length: projectionYears }).map((_, index) => (
              <Text
                key={index}
                style={[
                  stylesCOP.particularsCellsDetail,
                  styleExpenses.fontSmall,
                ]}
              >
                {totalDepreciationPerYear[index] || "-"}
              </Text>
            ))}
          </View>

          {/* Total Sources Calculation */}
          <View
            style={[stylesMOF.row, styles.tableRow, styleExpenses.totalRow]}
          >
            <Text
              style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}
            ></Text>
            <Text
              style={[
                stylesCOP.detailsCellDetail,
                styleExpenses.particularWidth,
                { paddingVertical: "8px" },
              ]}
            >
              Total
            </Text>
            {Array.from({ length: projectionYears }).map((_, index) => {
              const total =
                Number(
                  calculations.sources?.NetProfitBeforeInterestAndTaxes?.[
                    index
                  ] || 0
                ) +
                Number(
                  index === 0
                    ? formData.MeansOfFinance?.workingCapital
                        ?.promoterContribution || 0
                    : 0
                ) +
                Number(
                  index === 0
                    ? formData.MeansOfFinance?.termLoan?.termLoan || 0
                    : 0
                ) +
                Number(
                  index === 0
                    ? formData.MeansOfFinance?.workingCapital?.termLoan || 0
                    : 0
                ) +
                Number(
                  Array.isArray(totalDepreciationPerYear) &&
                    totalDepreciationPerYear[index] !== undefined
                    ? totalDepreciationPerYear[index]
                    : 0
                );
              return (
                <Text
                  key={index}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styles.boldText,
                    {
                      fontSize: "9px",
                      borderTopWidth: "2px",
                      borderBottomWidth: "2px",
                      fontFamily: "Roboto",
                      fontWeight: "extrabold",
                      paddingVertical: "8px",
                    },
                  ]}
                >
                  {total || "-"}
                </Text>
              );
            })}
          </View>

          {/* Uses Section */}
          <View style={[stylesMOF.row, styleExpenses.headerRow]}>
            <Text style={[styleExpenses.sno]}>B</Text>
            <Text style={stylesMOF.cell}>Uses</Text>
          </View>

          <View style={styles.tableRow}>
            <Text
              style={[
                stylesCOP.serialNoCellDetail,
                styleExpenses.sno,
                styleExpenses.bordernone,
                { borderLeftWidth: "1px" },
              ]}
            >
              1
            </Text>
            <Text
              style={[
                stylesCOP.detailsCellDetail,
                styleExpenses.particularWidth,
                styleExpenses.bordernone,
              ]}
            >
              Gross Profit
            </Text>
            {Array.from({ length: projectionYears }).map((_, index) => (
              <Text
                key={index}
                style={[
                  stylesCOP.particularsCellsDetail,
                  styleExpenses.fontSmall,
                ]}
              >
                {index === 0
                  ? grossProfitValues[index]
                    ? parseFloat(grossProfitValues[index])
                        .toFixed(2)
                        .replace(/\.00$/, "")
                    : "-"
                  : "0"}
              </Text>
            ))}
          </View>

          <View style={[styles.tableRow, styles.totalRow]}>
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
              ]}
            >
              Repayment of Term Loan
            </Text>

            {/* ✅ Display Principal Repayment Only for Projection Years */}
            {Array.from({
              length: formData.ProjectReportSetting.ProjectionYears || 0,
            }).map((_, index) => (
              <Text
                key={index}
                style={[
                  stylesCOP.particularsCellsDetail,
                  styleExpenses.fontSmall,
                ]}
              >
                {formatNumber(Math.round(yearlyPrincipalRepayment[index] || 0))}
              </Text>
            ))}
          </View>

          <View style={styles.tableRow}>
            <Text
              style={[
                stylesCOP.serialNoCellDetail,
                styleExpenses.sno,
                styleExpenses.bordernone,
                { borderLeftWidth: "1px" },
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
              Interest On Term Loan
            </Text>
            {Array.from({ length: projectionYears }).map((_, index) => (
              <Text
                key={index}
                style={[
                  stylesCOP.particularsCellsDetail,
                  styleExpenses.fontSmall,
                ]}
              >
                {yearlyInterestLiabilities[index] !== undefined
                  ? yearlyInterestLiabilities[index]
                  : "-"}
              </Text>
            ))}
          </View>

          {/* Cash Balance Section */}
          {[
            "Opening Cash Balance",
            "Surplus during the year",
            "Closing Cash Balance",
          ].map((item, idx) => (
            <View style={styles.tableRow} key={idx}>
              <Text
                style={[
                  stylesCOP.serialNoCellDetail,
                  styleExpenses.sno,
                  styleExpenses.bordernone,
                  { borderLeftWidth: "1px" },
                ]}
              >
                {idx + 1}
              </Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
                ]}
              >
                {item}
              </Text>
              {Array.from({ length: projectionYears }).map((_, index) => (
                <Text
                  key={index}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                  ]}
                >
                  {calculations.cashBalances?.[item]?.[index] || "-"}
                </Text>
              ))}
            </View>
          ))}
        </View>
      </View>
    </Page>
  );
};

export default ProjectedCashflow;
