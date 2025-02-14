import React from "react";
import { Page, View, Text } from "@react-pdf/renderer";
import { styles, stylesCOP, stylesMOF, styleExpenses } from "./Styles";

const MeansOfFinance = ({ formData, localData }) => {

  // ✅ Safe Helper Function to Format Numbers Based on Selected Format
  const formatNumber = (value) => {
    const formatType = formData?.ProjectReportSetting?.Format || "1"; // Default to Indian Format

    if (value === undefined || value === null || isNaN(value)) return "0"; // ✅ Handle invalid values

    switch (formatType) {
      case "1": // Indian Format (1,23,456)
        return new Intl.NumberFormat("en-IN").format(value);
      case "2": // USD Format (1,123,456)
        return new Intl.NumberFormat("en-US").format(value);
      case "3": // Generic Format (Same as Indian for now)
        return new Intl.NumberFormat("en-IN").format(value);
      default:
        return new Intl.NumberFormat("en-IN").format(value); // ✅ Safe default
    }
  };

  return (
    <Page style={styles.page}>
      <Text style={styles.clientName}>{localData?.clientName}</Text>
      <Text style={styles.title}>Means of Finance</Text>

      {/* First Table */}
      <View style={stylesMOF.table}>
        <View style={[stylesMOF.row, stylesMOF.headerRow]}>
          <Text style={stylesMOF.Snocell}>S.No.</Text>
          <Text style={stylesMOF.cell}>Particulars</Text>
          <Text style={stylesMOF.cell}></Text>
          <Text style={stylesMOF.cell}>Amount</Text>
        </View>

        <View style={[stylesMOF.row, stylesMOF.headerRow]}>
          <Text style={stylesMOF.Snocell}>1</Text>
          <Text style={stylesMOF.cell}>Towards Setting-up of Business</Text>
        </View>

        <View style={stylesMOF.row}>
          <Text style={stylesMOF.Snocell}>a.</Text>
          <Text style={stylesMOF.cell}>Promoter's Contribution</Text>
          <Text style={stylesMOF.cell}>
            {`${formData?.MeansOfFinance?.TLPromoterContributionPercent || 0}%`}
          </Text>
          <Text style={stylesMOF.cell}>
            {formatNumber(formData?.MeansOfFinance?.termLoan?.promoterContribution || 0)}
          </Text>
        </View>

        <View style={stylesMOF.row}>
          <Text style={stylesMOF.Snocell}>b.</Text>
          <Text style={stylesMOF.cell}>Term Loan from Bank</Text>
          <Text style={stylesMOF.cell}>
            {`${formData?.MeansOfFinance?.TLTermLoanPercent || 0}%`}
          </Text>
          <Text style={stylesMOF.cell}>
            {formatNumber(formData?.MeansOfFinance?.termLoan?.termLoan || 0)}
          </Text>
        </View>

        <View style={[stylesMOF.row, stylesMOF.totalRow]}>
          <Text style={stylesMOF.Snocell}></Text>
          <Text style={stylesMOF.cell}></Text>
          <Text style={[stylesMOF.cell, stylesMOF.total]}>Total</Text>
          <Text style={[stylesMOF.cell, stylesMOF.total]}>
            {formatNumber(formData?.MeansOfFinance?.totalTermLoan || 0)}
          </Text>
        </View>

        <View style={[stylesMOF.row, stylesMOF.headerRow]}>
          <Text style={[stylesMOF.Snocell, stylesMOF.boldCell]}>2</Text>
          <Text style={[stylesMOF.cell, stylesMOF.boldCell]}>
            Towards Working Capital
          </Text>
        </View>

        <View style={stylesMOF.row}>
          <Text style={stylesMOF.Snocell}>a.</Text>
          <Text style={stylesMOF.cell}>Promoter's Contribution</Text>
          <Text style={stylesMOF.cell}>
            {`${formData?.MeansOfFinance?.WCPromoterContributionPercent || 0}%`}
          </Text>
          <Text style={stylesMOF.cell}>
            {formatNumber(formData?.MeansOfFinance?.workingCapital?.promoterContribution || 0)}
          </Text>
        </View>

        <View style={stylesMOF.row}>
          <Text style={stylesMOF.Snocell}>b.</Text>
          <Text style={stylesMOF.cell}>Loan from Bank</Text>
          <Text style={stylesMOF.cell}>
            {`${formData?.MeansOfFinance?.WCTermLoanPercent || 0}%`}
          </Text>
          <Text style={stylesMOF.cell}>
            {formatNumber(formData?.MeansOfFinance?.workingCapital?.termLoan || 0)}
          </Text>
        </View>

        <View style={[stylesMOF.row, stylesMOF.totalRow]}>
          <Text style={stylesMOF.Snocell}></Text>
          <Text style={stylesMOF.cell}></Text>
          <Text style={[stylesMOF.cell, stylesMOF.total]}>Total</Text>
          <Text style={[stylesMOF.cell, stylesMOF.total]}>
            {formatNumber(formData?.MeansOfFinance?.totalWorkingCapital || 0)}
          </Text>
        </View>
      </View>

      {/* Second Table */}
      <View style={stylesMOF.table}>
        <View style={[stylesMOF.row, stylesMOF.headerRow]}>
          <Text style={stylesMOF.Snocell}></Text>
          <Text style={stylesMOF.cell}>TOTAL</Text>
        </View>

        <View style={stylesMOF.row}>
          <Text style={stylesMOF.Snocell}></Text>
          <Text style={stylesMOF.cell}>Total Promoter's Contribution</Text>
          <Text style={stylesMOF.cell}>
            {`${formData?.MeansOfFinance?.TotalPromoterContributionPercent || 0}%`}
          </Text>
          <Text style={stylesMOF.cell}>
            {formatNumber(formData?.MeansOfFinance?.totalPC || 0)}
          </Text>
        </View>

        <View style={stylesMOF.row}>
          <Text style={stylesMOF.Snocell}></Text>
          <Text style={stylesMOF.cell}>Total Bank Loan</Text>
          <Text style={stylesMOF.cell}>
            {`${formData?.MeansOfFinance?.TotalTermLoanPercent || 0}%`}
          </Text>
          <Text style={stylesMOF.cell}>
            {formatNumber(formData?.MeansOfFinance?.totalTL || 0)}
          </Text>
        </View>

        <View style={[stylesMOF.row, stylesMOF.totalRow]}>
          <Text style={stylesMOF.Snocell}></Text>
          <Text style={stylesMOF.cell}></Text>
          <Text style={[stylesMOF.cell, stylesMOF.total]}>Total</Text>
          <Text style={[stylesMOF.cell, stylesMOF.total]}>
            {formatNumber(formData?.MeansOfFinance?.total || 0)}
          </Text>
        </View>
      </View>
    </Page>
  );
};

export default MeansOfFinance;
