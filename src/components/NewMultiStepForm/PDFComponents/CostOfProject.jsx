import React from "react";
import { Page, View, Text, Image } from "@react-pdf/renderer";
import { styles, stylesCOP } from "./Styles"; // Import necessary styles
import SAWatermark from "../Assets/SAWatermark";
import CAWatermark from "../Assets/CAWatermark";

const CostOfProject = ({ formData, pdfType, formatNumber }) => {
  // ✅ Helper Function to Format Numbers Based on Selected Format

  // ✅ Compute Total Cost of Project including Working Capital
  const parseAmount = (val) => {
    if (!val) return 0;
    const cleaned = typeof val === "string" ? val.replace(/,/g, "") : val;
    return parseFloat(cleaned) || 0;
  };

  const totalCost =
    (formData?.CostOfProject
      ? Object.values(formData.CostOfProject).reduce(
          (sum, field) => sum + parseAmount(field?.amount),
          0
        )
      : 0) + parseAmount(formData?.MeansOfFinance?.totalWorkingCapital);

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
      <View style={stylesCOP.heading}>
        <Text>Cost Of Project</Text>
      </View>

      <View style={[styles.table, { paddingBottom: 0 }]}>
        <View style={styles.tableHeader}>
          <Text style={[styles.serialNoCell, { width: 100 }]}>S.No.</Text>
          <Text style={styles.particularsCell}>Particulars</Text>
          <Text style={styles.detailsCell}>Amount</Text>
        </View>

        {/* ✅ Show Cost of Project Items */}
        {/* ✅ Precompute filtered cost items */}
        {(() => {
          const filteredCostItems = Object.entries(
            formData?.CostOfProject || {}
          ).filter(([_, field]) => field?.amount > 0);

          return (
            <>
              {filteredCostItems.length > 0 ? (
                filteredCostItems.map(([key, field], index) => (
                  <View key={key} style={styles.tableRow}>
                    <Text
                      style={[stylesCOP.serialNoCellDetail, { width: 100 }]}
                    >
                      {index + 1}
                    </Text>
                    <Text
                      style={[
                        stylesCOP.particularsCellsDetail,
                        { textAlign: "left" },
                      ]}
                    >
                      {field?.name || "N/A"}
                    </Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        { textAlign: "right" },
                      ]}
                    >
                      {formatNumber(field?.amount || 0)}
                    </Text>
                  </View>
                ))
              ) : (
                <View style={styles.tableRow}>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      { textAlign: "center", width: "100%" },
                    ]}
                  >
                    No cost data available
                  </Text>
                </View>
              )}

              {/* ✅ Working Capital - Continues numbering */}
              {formData?.MeansOfFinance?.totalWorkingCapital && (
                <View style={styles.tableRow}>
                  <Text style={[stylesCOP.serialNoCellDetail, { width: 100 }]}>
                    {filteredCostItems.length + 1}
                  </Text>
                  <Text
                    style={[
                      stylesCOP.particularsCellsDetail,
                      { paddingBottom: "10px", textAlign: "left" },
                    ]}
                  >
                    Working Capital Required
                  </Text>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      { paddingBottom: "10px", textAlign: "right" },
                    ]}
                  >
                    {formatNumber(formData.MeansOfFinance.totalWorkingCapital)}
                  </Text>
                </View>
              )}
            </>
          );
        })()}

        {/* ✅ Total Cost Row (Including Working Capital) */}
        <View style={styles.tableRow}>
          <Text style={[stylesCOP.serialNoCellDetail, { width: 100 }]}></Text>
          <View
            style={[
              stylesCOP.particularsCellsDetail,
              stylesCOP.boldText,
              styles.Total,
          {
                borderWidth: 0,
                display: "flex",
                alignContent: "flex-end",
                alignItems: "flex-end",
                fontSize: "10px",
                padding: 0,
              },
            ]}
          >
            <Text
              style={[
                stylesCOP.particularsCellsDetail,
                stylesCOP.boldText,
                styles.Total,
                {
                  width: "30%",
                  border: "1px solid #000",
                  borderBottomWidth: 0,
                  textAlign: "left",
                  borderLeftWidth: 1,
                },
              ]}
            >
              {" "}
              Total{" "}
            </Text>
          </View>

          <Text
            style={[
              stylesCOP.detailsCellDetail,
              stylesCOP.boldText,
              styles.Total,
              {
                borderTop: "1px solid #000",
                borderBottomWidth: 0,
                borderLeftWidth: 1,

                fontWeight: "bold",
                textAlign: "right",
              },
            ]}
          >
            {formatNumber(totalCost)}
          </Text>
        </View>
      </View>
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

export default CostOfProject;
