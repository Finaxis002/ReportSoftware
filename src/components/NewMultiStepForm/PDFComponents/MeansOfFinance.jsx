import React from "react";
import { Page, View, Text, Image } from "@react-pdf/renderer";
import { styles, stylesCOP, stylesMOF, styleExpenses } from "./Styles";
import SAWatermark from "../Assets/SAWatermark";
import CAWatermark from "../Assets/CAWatermark";

const MeansOfFinance = ({ formData, pdfType, formatNumber }) => {
  return (
    <Page style={[styles.page]}>
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
          {formData?.ProjectReportSetting?.FinancialYear
            ? `${formData.ProjectReportSetting.FinancialYear}-${(
                parseInt(formData.ProjectReportSetting.FinancialYear) + 1
              )
                .toString()
                .slice(-2)}`
            : "2025-26"}
        </Text>
      </View>

      {/* Amount format */}

      <View
        style={{
          display: "flex",
          alignContent: "flex-end",
          justifyContent: "flex-end",
          alignItems: "flex-end",
        }}
      >
        {/* <Text style={[styles.AmountIn, styles.italicText]}>
          (Amount In{" "}
          {formData?.ProjectReportSetting?.AmountIn?.value === "rupees"
            ? "Rs" // ✅ Convert "rupees" to "Rs"
            : formData?.ProjectReportSetting?.AmountIn?.value}
          .)
        </Text> */}
        <Text style={[styles.AmountIn, styles.italicText]}>
          (Amount In{" "}
          {
            formData?.ProjectReportSetting?.AmountIn === "rupees"
              ? "Rs." // Show "Rupees" if "rupees" is selected
              : formData?.ProjectReportSetting?.AmountIn === "thousand"
              ? "Thousands" // Show "Thousands" if "thousand" is selected
              : formData?.ProjectReportSetting?.AmountIn === "lakhs"
              ? "Lakhs" // Show "Lakhs" if "lakhs" is selected
              : formData?.ProjectReportSetting?.AmountIn === "crores"
              ? "Crores" // Show "Crores" if "crores" is selected
              : formData?.ProjectReportSetting?.AmountIn === "millions"
              ? "Millions" // Show "Millions" if "millions" is selected
              : "" // Default case, in case the value is not found (you can add a fallback text here if needed)
          }
          )
        </Text>
      </View>

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
              style={[stylesMOF.cell, { textAlign: "center", width: "20%" }]}
            >
              {`${
                formData?.MeansOfFinance?.TLPromoterContributionPercent || 0
              }%`}
            </Text>
            <Text style={[stylesMOF.cell, { textAlign: "right" }]}>
              {formatNumber(
                formData?.MeansOfFinance?.termLoan?.promoterContribution || 0
              )}
            </Text>
          </View>

          <View style={[stylesMOF.row, styles.noBorder]}>
            <Text style={[stylesMOF.Snocell, { width: 50 }]}>b.</Text>
            <Text style={[stylesMOF.cell]}>Term Loan from Bank</Text>
            <Text
              style={[stylesMOF.cell, { textAlign: "center", width: "20%" }]}
            >
              {`${formData?.MeansOfFinance?.TLTermLoanPercent || 0}%`}
            </Text>
            <Text style={[stylesMOF.cell, { textAlign: "right" }]}>
              {formatNumber(formData?.MeansOfFinance?.termLoan?.termLoan || 0)}
            </Text>
          </View>

          <View style={[[stylesMOF.row, styles.noBorder], stylesMOF.totalRow]}>
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
              style={[stylesMOF.cell, stylesMOF.total, { textAlign: "right" }]}
            >
              {formatNumber(formData?.MeansOfFinance?.totalTermLoan || 0)}
            </Text>
          </View>

          {/* Blank Row  */}
          <View style={[[stylesMOF.row, styles.noBorder], stylesMOF.totalRow]}>
            <Text style={[stylesMOF.Snocell, { width: 50 }]}></Text>
            <Text style={[stylesMOF.cell, { width: "20%" }]}></Text>
            <Text style={[stylesMOF.cell, stylesMOF.total]}></Text>
            <Text
              style={[stylesMOF.cell, stylesMOF.total, { textAlign: "right" }]}
            ></Text>
          </View>

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
              style={[stylesMOF.cell, { textAlign: "center", width: "20%" }]}
            >
              {`${
                formData?.MeansOfFinance?.WCPromoterContributionPercent || 0
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
            <Text style={stylesMOF.cell}>Loan from Bank</Text>
            <Text
              style={[stylesMOF.cell, { textAlign: "center", width: "20%" }]}
            >
              {`${formData?.MeansOfFinance?.WCTermLoanPercent || 0}%`}
            </Text>
            <Text style={[stylesMOF.cell, { textAlign: "right" }]}>
              {formatNumber(
                formData?.MeansOfFinance?.workingCapital?.termLoan || 0
              )}
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
              {formatNumber(formData?.MeansOfFinance?.totalWorkingCapital || 0)}
            </Text>
          </View>

          {/* Blank Row  */}
          <View style={[[stylesMOF.row, styles.noBorder], stylesMOF.totalRow]}>
            <Text style={[stylesMOF.Snocell, { width: 50 }]}></Text>
            <Text style={[stylesMOF.cell, { width: "20%" }]}></Text>
            <Text style={[stylesMOF.cell, stylesMOF.total]}></Text>
            <Text
              style={[stylesMOF.cell, stylesMOF.total, { textAlign: "right" }]}
            ></Text>
          </View>

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
              {`${
                formData?.MeansOfFinance?.TotalPromoterContributionPercent || 0
              }%`}
            </Text>
            <Text style={[stylesMOF.cell, { textAlign: "right" }]}>
              {formatNumber(formData?.MeansOfFinance?.totalPC || 0)}
            </Text>
          </View>

          <View style={[stylesMOF.row, styles.noBorder]}>
            <Text style={[stylesMOF.Snocell, { width: 50 }]}></Text>
            <Text style={stylesMOF.cell}>Total Bank Loan</Text>
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
      {formData?.ProjectReportSetting?.subsidyName && (
       <View style={[styles.text, { marginTop: 5, marginLeft: 2 }]}>
       <Text style={{ fontSize: 9 }}>
         *Inclusive of Subsidy {formData.ProjectReportSetting.subsidyName}
         {formData.ProjectReportSetting.subsidyAmount &&
           ` of Rs. ${formatNumber(
             Number(formData.ProjectReportSetting.subsidyAmount)
           )}`}
         {formData.ProjectReportSetting.subsidyPercentage &&
           ` i.e. ${Number(formData.ProjectReportSetting.subsidyPercentage)}%`}
         {formData.MeansOfFinance?.total &&
           formData.ProjectReportSetting.subsidyAmount &&
           `. And thus the Net Bank Loan would be Rs. ${formatNumber(
             Number(formData.MeansOfFinance.total) -
               Number(formData.ProjectReportSetting.subsidyAmount)
           )}`}
         .
       </Text>
     
       {/* 👉 Display additional subsidy text on the next line */}
       {formData?.ProjectReportSetting?.subsidyText && (
         <Text style={{ fontSize: 9, marginTop: 2 }}>
           {formData.ProjectReportSetting.subsidyText}
         </Text>
       )}
     </View>
     
      )}

      {/* businees name and Client Name  */}
      <View
        style={[
          {
            display: "flex",
            flexDirection: "column",
            gap: "80px",
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
    </Page>
  );
};

export default React.memo(MeansOfFinance);
