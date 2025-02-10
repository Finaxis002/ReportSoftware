import React from "react";
import { Page, View, Text } from "@react-pdf/renderer";
import { styles, stylesCOP, stylesMOF , styleExpenses} from "./Styles";

const MeansOfFinance = ({ formData, localData }) => {
  return (
    <Page style={styles.page}>
      <Text style={styles.clientName}>{localData.clientName}</Text>
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
          <Text
            style={stylesMOF.cell}
          >{`${formData.MeansOfFinance.TLPromoterContributionPercent}%`}</Text>
          <Text style={stylesMOF.cell}>
          {new Intl.NumberFormat("en-IN").format(formData.MeansOfFinance.termLoan.promoterContribution)}
          </Text>
        </View>

        <View style={stylesMOF.row}>
          <Text style={stylesMOF.Snocell}>b.</Text>
          <Text style={stylesMOF.cell}>Term Loan from Bank</Text>
          <Text
            style={stylesMOF.cell}
          >{`${formData.MeansOfFinance.TLTermLoanPercent}%`}</Text>
          <Text style={stylesMOF.cell}>
          {new Intl.NumberFormat("en-IN").format(formData.MeansOfFinance.termLoan.termLoan)}
          </Text>
        </View>

        <View style={[stylesMOF.row, stylesMOF.totalRow]}>
          <Text style={stylesMOF.Snocell}></Text>
          <Text style={stylesMOF.cell}></Text>
          <Text style={[stylesMOF.cell, stylesMOF.total]}>Total</Text>
          <Text style={[stylesMOF.cell, stylesMOF.total]}>
          {new Intl.NumberFormat("en-IN").format(formData.MeansOfFinance.totalTermLoan)}
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
          <Text
            style={stylesMOF.cell}
          >{`${formData.MeansOfFinance.WCPromoterContributionPercent}%`}</Text>
          <Text style={stylesMOF.cell}>
          {new Intl.NumberFormat("en-IN").format(formData.MeansOfFinance.workingCapital.promoterContribution)}
          </Text>
        </View>

        <View style={stylesMOF.row}>
          <Text style={stylesMOF.Snocell}>b.</Text>
          <Text style={stylesMOF.cell}>Loan from Bank</Text>
          <Text
            style={stylesMOF.cell}
          >{`${formData.MeansOfFinance.WCTermLoanPercent}%`}</Text>
          <Text style={stylesMOF.cell}>
          {new Intl.NumberFormat("en-IN").format(formData.MeansOfFinance.workingCapital.termLoan)}
          </Text>
        </View>

        <View style={[stylesMOF.row, stylesMOF.totalRow]}>
          <Text style={stylesMOF.Snocell}></Text>
          <Text style={stylesMOF.cell}></Text>
          <Text style={[stylesMOF.cell, stylesMOF.total]}>Total</Text>
          <Text style={[stylesMOF.cell, stylesMOF.total]}>
          {new Intl.NumberFormat("en-IN").format(formData.MeansOfFinance.totalWorkingCapital)}
          </Text>
        </View>
      </View>

      {/* Second Table */}
      <View style={stylesMOF.table}>
        <View style={[stylesMOF.row, stylesMOF.headerRow]}>
          <Text style={stylesMOF.Snocell}></Text>
          <Text style={stylesMOF.cell} colSpan="3">
            TOTAL
          </Text>
        </View>

        <View style={stylesMOF.row}>
          <Text style={stylesMOF.Snocell}></Text>
          <Text style={stylesMOF.cell}>Total Promoter's Contribution</Text>
          <Text
            style={stylesMOF.cell}
          >{`${formData.MeansOfFinance.TotalPromoterContributionPercent}%`}</Text>
          <Text style={stylesMOF.cell}>{new Intl.NumberFormat("en-IN").format(formData.MeansOfFinance.totalPC)}</Text>
        </View>

        <View style={stylesMOF.row}>
          <Text style={stylesMOF.Snocell}></Text>
          <Text style={stylesMOF.cell}>Total Bank Loan</Text>
          <Text
            style={stylesMOF.cell}
          >{`${formData.MeansOfFinance.TotalTermLoanPercent}%`}</Text>
          <Text style={stylesMOF.cell}>{new Intl.NumberFormat("en-IN").format(formData.MeansOfFinance.totalTL)}</Text>
        </View>

        <View style={[stylesMOF.row, stylesMOF.totalRow]}>
          <Text style={stylesMOF.Snocell}></Text>
          <Text style={stylesMOF.cell}></Text>
          <Text style={[stylesMOF.cell, stylesMOF.total]}>Total</Text>
          <Text style={[stylesMOF.cell, stylesMOF.total]}>
          {new Intl.NumberFormat("en-IN").format(formData.MeansOfFinance.total)}
          </Text>
        </View>
      </View>
    </Page>
  );
};

export default MeansOfFinance;
