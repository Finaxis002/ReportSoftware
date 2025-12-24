import React from "react";
import { Page, View, Text, } from "@react-pdf/renderer";
import { styles, stylesMOF } from "./Styles";
import PDFHeader from "./HeaderFooter/PDFHeader";
import PDFFooter from "./HeaderFooter/PDFFooter";

const MeansOfFinance = ({
  formData,
  formatNumber,
  renderTLFBLabel,
  renderWCLFBLabel,
  renderTotalBankLoanLabel }) => {


  return (
    <Page style={[styles.page]}>
      <PDFHeader />
      <Text style={styles.title}>Means of Finance</Text>

      <View
        style={[
          { border: "1px solid #000", paddingBottom: 0, marginBottom: 0 },
        ]}
      >
        {/* First Table */}
        <View style={[stylesMOF.table, { paddingBottom: 0, marginBottom: 0 }]}>
          <View
            style={[
              [stylesMOF.row, styles.noBorder],
              stylesMOF.headerRow,
              styles.noBorder,
              { marginTop: "0px" },
            ]}
          >
            <Text
              style={[stylesMOF.Snocell, stylesMOF.boldCell, { width: 50 }]}
            >
              Sr.No.
            </Text>
            <Text style={[stylesMOF.cell, stylesMOF.boldCell]}>
              Particulars
            </Text>
            <Text style={[stylesMOF.cell, { width: "20%" }]}></Text>
            <Text
              style={[
                stylesMOF.cell,
                stylesMOF.boldCell,
                { textAlign: "center" },
              ]}
            >
              Amount
            </Text>
          </View>
          {Number(formData?.MeansOfFinance?.totalTermLoan) > 0 && (
            <>
              <View
                style={[
                  [stylesMOF.row, styles.noBorder],
                  stylesMOF.headerRow,
                  styles.noBorder,
                ]}
              >
                <Text
                  style={[stylesMOF.Snocell, stylesMOF.boldCell, { width: 50 }]}
                >
                  1
                </Text>
                <Text style={[stylesMOF.cell, stylesMOF.boldCell]}>
                  Towards Setting-up of Business
                </Text>
              </View>

              <View style={[stylesMOF.row, styles.noBorder]}>
                <Text style={[stylesMOF.Snocell, { width: 50 }]}>a.</Text>
                <Text style={[stylesMOF.cell]}>Promoter's Contribution</Text>
                <Text
                  style={[
                    stylesMOF.cell,
                    { textAlign: "center", width: "20%" },
                  ]}
                >
                  {`${formData?.MeansOfFinance?.TLPromoterContributionPercent || 0
                    }%`}
                </Text>
                <Text style={[stylesMOF.cell, { textAlign: "right" }]}>
                  {formatNumber(
                    formData?.MeansOfFinance?.termLoan?.promoterContribution ||
                    0
                  )}
                </Text>
              </View>

              <View style={[stylesMOF.row, styles.noBorder]}>
                <Text style={[stylesMOF.Snocell, { width: 50 }]}>b.</Text>
                <Text style={[stylesMOF.cell]}>
                  {/* Term Loan from Bank */}
                  {renderTLFBLabel()}
                </Text>
                <Text
                  style={[
                    stylesMOF.cell,
                    { textAlign: "center", width: "20%" },
                  ]}
                >
                  {`${formData?.MeansOfFinance?.TLTermLoanPercent || 0}%`}
                </Text>
                <Text style={[stylesMOF.cell, { textAlign: "right" }]}>
                  {formatNumber(
                    formData?.MeansOfFinance?.termLoan?.termLoan || 0
                  )}
                </Text>
              </View>

              <View
                style={[[stylesMOF.row, styles.noBorder], stylesMOF.totalRow]}
              >
                <Text style={[stylesMOF.Snocell, { width: 50 }]}></Text>
                <Text style={stylesMOF.cell}></Text>
                <Text
                  style={[
                    stylesMOF.cell,
                    stylesMOF.total,
                    { textAlign: "center", width: "20%" },
                  ]}
                >
                  Total
                </Text>
                <Text
                  style={[
                    stylesMOF.cell,
                    stylesMOF.total,
                    { textAlign: "right" },
                  ]}
                >
                  {formatNumber(formData?.MeansOfFinance?.totalTermLoan || 0)}
                </Text>
              </View>

              {/* Blank Row  */}
              <View
                style={[[stylesMOF.row, styles.noBorder], stylesMOF.totalRow]}
              >
                <Text style={[stylesMOF.Snocell, { width: 50 }]}></Text>
                <Text style={[stylesMOF.cell, { width: "20%" }]}></Text>
                <Text style={[stylesMOF.cell, stylesMOF.total]}></Text>
                <Text
                  style={[
                    stylesMOF.cell,
                    stylesMOF.total,
                    { textAlign: "right" },
                  ]}
                ></Text>
              </View>
            </>
          )}

          {Number(formData?.MeansOfFinance?.totalWorkingCapital) > 0 && (
            <>
              <View
                style={[
                  [stylesMOF.row, styles.noBorder],
                  stylesMOF.headerRow,
                  styles.noBorder,
                  { marginTop: 0 },
                ]}
              >
                <Text
                  style={[stylesMOF.Snocell, stylesMOF.boldCell, { width: 50 }]}
                >
                  2
                </Text>
                <Text style={[stylesMOF.cell, stylesMOF.boldCell]}>
                  Towards Working Capital
                </Text>
              </View>

              <View style={[stylesMOF.row, styles.noBorder]}>
                <Text style={[stylesMOF.Snocell, { width: 50 }]}>a.</Text>
                <Text style={stylesMOF.cell}>Promoter's Contribution</Text>
                <Text
                  style={[
                    stylesMOF.cell,
                    { textAlign: "center", width: "20%" },
                  ]}
                >
                  {`${formData?.MeansOfFinance?.WCPromoterContributionPercent || 0
                    }%`}
                </Text>
                <Text style={[stylesMOF.cell, { textAlign: "right" }]}>
                  {formatNumber(
                    formData?.MeansOfFinance?.workingCapital
                      ?.promoterContribution || 0
                  )}
                </Text>
              </View>

              <View style={[stylesMOF.row, styles.noBorder]}>
                <Text style={[stylesMOF.Snocell, { width: 50 }]}>b.</Text>
                <Text style={stylesMOF.cell}>
                  {/* Loan from Bank */}
                  {renderWCLFBLabel()}
                </Text>
                <Text
                  style={[
                    stylesMOF.cell,
                    { textAlign: "center", width: "20%" },
                  ]}
                >
                  {`${formData?.MeansOfFinance?.WCTermLoanPercent || 0}%`}
                </Text>
                <Text style={[stylesMOF.cell, { textAlign: "right" }]}>
                  {formatNumber(
                    formData?.MeansOfFinance?.workingCapital?.termLoan || 0
                  )}
                </Text>
              </View>

              <View
                style={[[stylesMOF.row, styles.noBorder], stylesMOF.totalRow]}
              >
                <Text style={[stylesMOF.Snocell, { width: 50 }]}></Text>
                <Text style={stylesMOF.cell}></Text>
                <Text
                  style={[
                    stylesMOF.cell,
                    stylesMOF.total,
                    stylesMOF.boldCell,
                    { textAlign: "center", width: "20%" },
                  ]}
                >
                  Total
                </Text>
                <Text
                  style={[
                    stylesMOF.cell,
                    stylesMOF.total,
                    { textAlign: "right" },
                  ]}
                >
                  {formatNumber(
                    formData?.MeansOfFinance?.totalWorkingCapital || 0
                  )}
                </Text>
              </View>

              {/* Blank Row  */}
              <View
                style={[[stylesMOF.row, styles.noBorder], stylesMOF.totalRow]}
              >
                <Text style={[stylesMOF.Snocell, { width: 50 }]}></Text>
                <Text style={[stylesMOF.cell, { width: "20%" }]}></Text>
                <Text style={[stylesMOF.cell, stylesMOF.total]}></Text>
                <Text
                  style={[
                    stylesMOF.cell,
                    stylesMOF.total,
                    { textAlign: "right" },
                  ]}
                ></Text>
              </View>
            </>
          )}
          <View
            style={[
              [stylesMOF.row, styles.noBorder],
              stylesMOF.headerRow,
              styles.noBorder,
              { marginTop: 0 },
            ]}
          >
            <Text style={[stylesMOF.Snocell, { width: 50 }]}></Text>
            <Text style={stylesMOF.cell}>TOTAL</Text>
          </View>

          <View style={[stylesMOF.row, styles.noBorder]}>
            <Text style={[stylesMOF.Snocell, { width: 50 }]}></Text>
            <Text style={stylesMOF.cell}>Total Promoter's Contribution</Text>
            <Text
              style={[stylesMOF.cell, { textAlign: "center", width: "20%" }]}
            >
              {`${formData?.MeansOfFinance?.TotalPromoterContributionPercent || 0
                }%`}
            </Text>
            <Text style={[stylesMOF.cell, { textAlign: "right" }]}>
              {formatNumber(formData?.MeansOfFinance?.totalPC || 0)}
            </Text>
          </View>

          <View style={[stylesMOF.row, styles.noBorder]}>
            <Text style={[stylesMOF.Snocell, { width: 50 }]}></Text>
            <Text style={stylesMOF.cell}>
              {/* Total Bank Loan */}
              {renderTotalBankLoanLabel()}
            </Text>
            <Text
              style={[stylesMOF.cell, { textAlign: "center", width: "20%" }]}
            >
              {`${formData?.MeansOfFinance?.TotalTermLoanPercent || 0}%`}
            </Text>
            <Text style={[stylesMOF.cell, { textAlign: "right" }]}>
              {formatNumber(formData?.MeansOfFinance?.totalTL || 0)}
            </Text>
          </View>

          <View style={[[stylesMOF.row, styles.noBorder], stylesMOF.totalRow]}>
            <Text style={[stylesMOF.Snocell, { width: 50 }]}></Text>
            <Text style={stylesMOF.cell}></Text>
            <Text
              style={[
                stylesMOF.cell,
                stylesMOF.total,
                stylesMOF.boldCell,
                { textAlign: "center", width: "20%" },
              ]}
            >
              Total
            </Text>
            <Text
              style={[stylesMOF.cell, stylesMOF.total, { textAlign: "right" }]}
            >
              {formatNumber(formData?.MeansOfFinance?.total || 0)}
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.text, { marginTop: 5, marginLeft: 2 }]}>
        {formData?.ProjectReportSetting?.subsidyName && (
          <Text style={{ fontSize: 9 }}>
            *Inclusive of Subsidy {formData.ProjectReportSetting.subsidyName}
            {formData.ProjectReportSetting.subsidyAmount &&
              ` of Rs. ${formatNumber(
                Number(formData.ProjectReportSetting.subsidyAmount)
              )}`}
            {formData.ProjectReportSetting.subsidyPercentage &&
              ` i.e. ${Number(
                formData.ProjectReportSetting.subsidyPercentage
              )}%`}
            {formData.MeansOfFinance?.total &&
              formData.ProjectReportSetting.subsidyAmount &&
              `. And thus the Net Bank Loan would be Rs. ${formatNumber(
                Number(formData.MeansOfFinance.totalTL) -
                Number(formData.ProjectReportSetting.subsidyAmount)
              )}`}
            .
          </Text>
        )}

        {/* 👉 Display additional subsidy text on the next line */}
        {formData?.ProjectReportSetting?.subsidyText && (
          <Text style={{ fontSize: 9, marginTop: 2 }}>
            {formData.ProjectReportSetting.subsidyText}
          </Text>
        )}
      </View>


      <PDFFooter />
    </Page>
  );
};

export default React.memo(MeansOfFinance);
