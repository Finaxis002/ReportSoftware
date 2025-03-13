import React from "react";
import { Page, View, Text, Image } from "@react-pdf/renderer";
import { styles, stylesCOP, stylesMOF, styleExpenses } from "./Styles"; // Import only necessary styles
import { Font } from "@react-pdf/renderer";
import SAWatermark from "../Assets/SAWatermark";
import CAWatermark from "../Assets/CAWatermark";

const ProjectedSalaries = ({
  formData,
  localData,
  normalExpense,
  totalQuantity,
  totalAnnualWages,
  fringeCalculation,
  fringAndAnnualCalculation,
  formatNumber,
  pdfType,
}) => {
  return (
    <Page size="A4" style={stylesCOP.styleCOP}>
      {/* watermark  */}
      <View style={{ position: "absolute", left: 50, top: 0, zIndex: -1 }}>
        {/* ✅ Conditionally Render Watermark */}
        {pdfType &&
          pdfType !== "select option" &&
          (pdfType === "Sharda Associates" || pdfType === "CA Certified") && (
            <Image
              src={pdfType === "Sharda Associates" ? SAWatermark : CAWatermark}
              style={{
                width: "500px", // Adjust size based on PDF layout
                height: "700px",
                opacity: 0.4, // Light watermark to avoid blocking content
              }}
            />
          )}
      </View>
      {/* businees name and financial year  */}
      <View>
        <Text style={styles.businessName}>
          {formData?.AccountInformation?.businessName || "Business Name"}
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
      <View style={stylesCOP.heading}>
        <Text>Projected Salaries & Wages</Text>
      </View>

      <View style={styles.table}>
        <View style={[styles.tableHeader]}>
          <Text style={styles.serialNoCell}>S.No.</Text>
          <Text style={[styles.particularsCell, stylesCOP.textCenter]}>
            Type Of Worker
          </Text>
          <Text style={[styles.particularsCell, stylesCOP.textCenter]}>
            No. of Workers{" "}
          </Text>
          <Text style={[styles.particularsCell, stylesCOP.textCenter]}>
            Wages per month
          </Text>
          <Text style={[styles.particularsCell, stylesCOP.textCenter]}>
            Annual Wages & Salaries
          </Text>
        </View>
        {normalExpense.map((expense, index) => (
          <View
            key={index}
            style={[
              styles.tableRow,
              // index === 0 && { paddingTop: 20 }, // ✅ Padding for the first element
              // index === normalExpense.length - 1 && { paddingBottom: 15 }, // ✅ Padding for the last element
            ]}
          >
            <Text
              style={[
                stylesCOP.serialNoCellDetail,
                stylesCOP.textCenter,
                index === 0 && { paddingTop: 20 },
                index === normalExpense.length - 1 && { paddingBottom: 20 },
              ]}
            >
              {index + 1}
            </Text>

            <Text
              style={[
                stylesCOP.particularsCellsDetail,
                stylesCOP.textCenter,
                index === 0 && { paddingTop: 20 },
                index === normalExpense.length - 1 && { paddingBottom: 20 },
                { textAlign: "left" },
              ]}
            >
              {expense.name || "N/A"}
            </Text>
            <Text
              style={[
                stylesCOP.particularsCellsDetail,
                stylesCOP.textCenter,
                index === 0 && { paddingTop: 20 },
                index === normalExpense.length - 1 && { paddingBottom: 20 },
              ]}
            >
              {expense.quantity || "0"}
            </Text>
            <Text
              style={[
                stylesCOP.particularsCellsDetail,
                stylesCOP.textCenter,
                index === 0 && { paddingTop: 20 },
                index === normalExpense.length - 1 && { paddingBottom: 20 },
              ]}
            >
              {formatNumber(expense.amount || 0)}
            </Text>
            <Text
              style={[
                stylesCOP.particularsCellsDetail,
                stylesCOP.textCenter,
                index === 0 && { paddingTop: 20 },
                index === normalExpense.length - 1 && { paddingBottom: 20 },
              ]}
            >
              {formatNumber(expense.amount * expense.quantity * 12)}
            </Text>
          </View>
        ))}

        <View style={styles.tableRow}>
          <Text style={stylesCOP.serialNoCellDetail}></Text>

          <Text
            style={[
              stylesCOP.particularsCellsDetail,
              stylesCOP.textCenter,
              styles.Total,
              {},
            ]}
          >
            Total
          </Text>
          <Text
            style={[
              stylesCOP.particularsCellsDetail,
              stylesCOP.textCenter,
              stylesCOP.boldText,
              { borderTop: "1px solid #000", borderBottom: "1px solid #000" },
            ]}
          >
            {totalQuantity}
          </Text>
          <Text
            style={[stylesCOP.particularsCellsDetail, stylesCOP.textCenter]}
          ></Text>
          <Text
            style={[
              stylesCOP.particularsCellsDetail,
              stylesCOP.textCenter,
              stylesCOP.boldText,
              { borderTop: "1px solid #000", borderBottom: "1px solid #000" },
            ]}
          >
            {formatNumber(totalAnnualWages)}
          </Text>
        </View>

        <View style={styles.tableRow}>
          <Text style={stylesCOP.serialNoCellDetail}></Text>

          <Text
            style={[stylesCOP.particularsCellsDetail, stylesCOP.textCenter]}
          ></Text>
          <Text
            style={[stylesCOP.particularsCellsDetail, stylesCOP.textCenter]}
          ></Text>
          <Text
            style={[
              stylesCOP.particularsCellsDetail,
              stylesCOP.textCenter,
              stylesCOP.verticalPadding,
              { fontSize: "9px" },
            ]}
          >
            Add: Fringe Benefits @ 5 %
          </Text>
          <Text
            style={[
              stylesCOP.particularsCellsDetail,
              stylesCOP.textCenter,
              stylesCOP.verticalPadding,
            ]}
          >
            {" "}
            {formatNumber(fringeCalculation)}
          </Text>
        </View>

        <View style={styles.tableRow}>
          <Text style={stylesCOP.serialNoCellDetail}></Text>

          <Text
            style={[stylesCOP.particularsCellsDetail, stylesCOP.textCenter]}
          ></Text>
          <Text
            style={[
              stylesCOP.particularsCellsDetail,
              stylesCOP.textCenter,
              stylesCOP.boldText,
              stylesCOP.extraWidth,
              styles.Total,
              {
                borderTopWidth: "1px",
                borderBottomWidth: "1px",
                fontSize: "12px",
                paddingVertical: "6px",
              },
            ]}
          >
            {" "}
            Total Wages during the year
          </Text>

          <Text
            style={[
              stylesCOP.particularsCellsDetail,
              stylesCOP.textCenter,
              stylesCOP.boldText,
              styles.Total,
              {
                borderTopWidth: "1px",
                borderBottomWidth: "1px",
                fontSize: "12px",
                paddingVertical: "6px",
              },
            ]}
          >
            {" "}
            {formatNumber(fringAndAnnualCalculation)}
          </Text>
        </View>
      </View>

      {/* businees name and Client Name  */}
      <View
        style={[
          {
            display: "flex",
            flexDirection: "column",
            gap: "60px",
            alignItems: "flex-end",
            justifyContent: "flex-end",
            marginTop: "30px",
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

export default React.memo(ProjectedSalaries);
