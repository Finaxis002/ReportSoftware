import React from "react";
import { Page, View, Text, Image } from "@react-pdf/renderer";
import { styles, stylesCOP, stylesMOF, styleExpenses } from "./Styles";
import SAWatermark from "../Assets/SAWatermark";
import CAWatermark from "../Assets/CAWatermark";

const MeansOfFinance = ({ formData, pdfType, formatNumber }) => {
  return (
    <Page style={[styles.page ]}>
      {/* watermark  */}
      <View style={{ position: "absolute", left: 50, top: 0, zIndex: -1 }}>
        {/* ✅ Conditionally Render Watermark */}
        {pdfType &&
          pdfType !== "select option" &&
          (pdfType === "Sharda Associates" || pdfType === "CA Certified") && (
            <View
              style={{
                position: "absolute",
                left: 50, // Center horizontally
                top: "50%", // Center vertically
                // transform: "translate(-50%, -50%)", // Adjust position to center
                zIndex: -1, // Ensure it's behind the content
              }}
            >
              <Image
                src={
                  pdfType === "Sharda Associates" ? SAWatermark : CAWatermark
                }
                style={{
                  width: "400px", // Adjust size based on PDF layout
                  height: "600px",
                  opacity: 0.2, // Light watermark to avoid blocking content
                }}
              />
            </View>
          )}
      </View>
      {/* businees name and financial year  */}
      <View>
        <Text style={styles.businessName}>
          {formData?.AccountInformation?.businessName || "Business Bame"}
        </Text>
        <Text style={styles.FinancialYear}>
          Financial Year{" "}
          {formData?.ProjectReportSetting?.FinancialYear || "financial year"}
        </Text>
      </View>
      <Text style={styles.title}>Means of Finance</Text>

      <View style={[{ border: "1px solid #000", padding: "0px" }]}>
        {/* First Table */}
        <View style={stylesMOF.table}>
          <View
            style={[
              [stylesMOF.row, styles.noBorder],
              stylesMOF.headerRow,
              styles.noBorder,
              { marginTop: "0px" },
            ]}
          >
            <Text style={stylesMOF.Snocell}>S.No.</Text>
            <Text style={stylesMOF.cell}>Particulars</Text>
            <Text style={stylesMOF.cell}></Text>
            <Text style={stylesMOF.cell}>Amount</Text>
          </View>

          <View
            style={[
              [stylesMOF.row, styles.noBorder],
              stylesMOF.headerRow,
              styles.noBorder,
            ]}
          >
            <Text style={stylesMOF.Snocell}>1</Text>
            <Text style={stylesMOF.cell}>Towards Setting-up of Business</Text>
          </View>

          <View style={[stylesMOF.row, styles.noBorder]}>
            <Text style={stylesMOF.Snocell}>a.</Text>
            <Text style={stylesMOF.cell}>Promoter's Contribution</Text>
            <Text style={stylesMOF.cell}>
              {`${
                formData?.MeansOfFinance?.TLPromoterContributionPercent || 0
              }%`}
            </Text>
            <Text style={stylesMOF.cell}>
              {formatNumber(
                formData?.MeansOfFinance?.termLoan?.promoterContribution || 0
              )}
            </Text>
          </View>

          <View style={[stylesMOF.row, styles.noBorder]}>
            <Text style={stylesMOF.Snocell}>b.</Text>
            <Text style={stylesMOF.cell}>Term Loan from Bank</Text>
            <Text style={stylesMOF.cell}>
              {`${formData?.MeansOfFinance?.TLTermLoanPercent || 0}%`}
            </Text>
            <Text style={stylesMOF.cell}>
              {formatNumber(formData?.MeansOfFinance?.termLoan?.termLoan || 0)}
            </Text>
          </View>

          <View style={[[stylesMOF.row, styles.noBorder], stylesMOF.totalRow]}>
            <Text style={stylesMOF.Snocell}></Text>
            <Text style={stylesMOF.cell}></Text>
            <Text style={[stylesMOF.cell, stylesMOF.total]}>Total</Text>
            <Text style={[stylesMOF.cell, stylesMOF.total]}>
              {formatNumber(formData?.MeansOfFinance?.totalTermLoan || 0)}
            </Text>
          </View>

          <View
            style={[
              [stylesMOF.row, styles.noBorder],
              stylesMOF.headerRow,
              styles.noBorder,
            ]}
          >
            <Text style={[stylesMOF.Snocell, stylesMOF.boldCell]}>2</Text>
            <Text style={[stylesMOF.cell, stylesMOF.boldCell]}>
              Towards Working Capital
            </Text>
          </View>

          <View style={[stylesMOF.row, styles.noBorder]}>
            <Text style={stylesMOF.Snocell}>a.</Text>
            <Text style={stylesMOF.cell}>Promoter's Contribution</Text>
            <Text style={stylesMOF.cell}>
              {`${
                formData?.MeansOfFinance?.WCPromoterContributionPercent || 0
              }%`}
            </Text>
            <Text style={stylesMOF.cell}>
              {formatNumber(
                formData?.MeansOfFinance?.workingCapital
                  ?.promoterContribution || 0
              )}
            </Text>
          </View>

          <View style={[stylesMOF.row, styles.noBorder]}>
            <Text style={stylesMOF.Snocell}>b.</Text>
            <Text style={stylesMOF.cell}>Loan from Bank</Text>
            <Text style={stylesMOF.cell}>
              {`${formData?.MeansOfFinance?.WCTermLoanPercent || 0}%`}
            </Text>
            <Text style={stylesMOF.cell}>
              {formatNumber(
                formData?.MeansOfFinance?.workingCapital?.termLoan || 0
              )}
            </Text>
          </View>

          <View style={[[stylesMOF.row, styles.noBorder], stylesMOF.totalRow]}>
            <Text style={stylesMOF.Snocell}></Text>
            <Text style={stylesMOF.cell}></Text>
            <Text style={[stylesMOF.cell, stylesMOF.total]}>Total</Text>
            <Text style={[stylesMOF.cell, stylesMOF.total]}>
              {formatNumber(formData?.MeansOfFinance?.totalWorkingCapital || 0)}
            </Text>
          </View>
        </View>

        {/* Second Table */}
        <View style={[stylesMOF.table, { marginBottom: 0 }]}>
          <View
            style={[
              [stylesMOF.row, styles.noBorder],
              stylesMOF.headerRow,
              styles.noBorder,
            ]}
          >
            <Text style={stylesMOF.Snocell}></Text>
            <Text style={stylesMOF.cell}>TOTAL</Text>
          </View>

          <View style={[stylesMOF.row, styles.noBorder]}>
            <Text style={stylesMOF.Snocell}></Text>
            <Text style={stylesMOF.cell}>Total Promoter's Contribution</Text>
            <Text style={stylesMOF.cell}>
              {`${
                formData?.MeansOfFinance?.TotalPromoterContributionPercent || 0
              }%`}
            </Text>
            <Text style={stylesMOF.cell}>
              {formatNumber(formData?.MeansOfFinance?.totalPC || 0)}
            </Text>
          </View>

          <View style={[stylesMOF.row, styles.noBorder]}>
            <Text style={stylesMOF.Snocell}></Text>
            <Text style={stylesMOF.cell}>Total Bank Loan</Text>
            <Text style={stylesMOF.cell}>
              {`${formData?.MeansOfFinance?.TotalTermLoanPercent || 0}%`}
            </Text>
            <Text style={stylesMOF.cell}>
              {formatNumber(formData?.MeansOfFinance?.totalTL || 0)}
            </Text>
          </View>

          <View
            style={[
              stylesMOF.row,
              styles.noBorder,
              stylesMOF.totalRow,
              { marginBottom: "0px" },
            ]}
          >
            <Text style={stylesMOF.Snocell}></Text>
            <Text style={stylesMOF.cell}></Text>
            <Text style={[stylesMOF.cell, stylesMOF.total]}>Total</Text>
            <Text style={[stylesMOF.cell, stylesMOF.total]}>
              {formatNumber(formData?.MeansOfFinance?.total || 0)}
            </Text>
          </View>
        </View>
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
            marginTop: "60px",
          },
        ]}
      >
        <Text style={[styles.businessName, { fontSize: "14px" }]}>
          {formData?.AccountInformation?.businessName || "Business Name"}
        </Text>
        <Text style={styles.FinancialYear}>
          {formData?.AccountInformation?.clientName || "Client Name"}
        </Text>
      </View>
    </Page>
  );
};

export default React.memo(MeansOfFinance);
