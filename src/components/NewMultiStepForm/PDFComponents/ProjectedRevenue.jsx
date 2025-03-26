import React, { useEffect, useMemo, useState } from "react";
import { Page, View, Text, Image } from "@react-pdf/renderer";
import { styles, stylesCOP, stylesMOF, styleExpenses } from "./Styles"; // Import styles
import SAWatermark from "../Assets/SAWatermark";
import CAWatermark from "../Assets/CAWatermark";

const ProjectedRevenue = ({
  formData,
  onTotalRevenueUpdate,
  financialYearLabels,
  formatNumber,
  pdfType,
}) => {
  // ✅ Extract projection years and formType safely
  const projectionYears =
    parseInt(formData?.ProjectReportSetting?.ProjectionYears) || 0;
  const formType = formData?.Revenue?.formType || "Others"; // ✅ Defaults to "Others" if missing

  // ✅ Corrected selection of dataset for "Others"
  const selectedData = useMemo(() => {
    return (
      formData?.Revenue?.[
        formType === "Others" ? "formFields" : "formFields2"
      ] || []
    );
  }, [formData?.Revenue, formType]);

  // ✅ Determine the total revenue array based on formType
  const totalRevenueReceipts = useMemo(() => {
    if (formType === "Others") {
      return formData?.Revenue?.totalRevenueForOthers || [];
    } else if (formType === "Monthly") {
      return formData?.Revenue?.totalRevenue || [];
    }
    return [];
  }, [formData?.Revenue, formType]);

  // ✅ Send computed total revenue to parent or another component
  useEffect(() => {
    if (onTotalRevenueUpdate) {
      onTotalRevenueUpdate(totalRevenueReceipts);
    }
    // console.log("sending revenue receipt", totalRevenueReceipts)
  }, [totalRevenueReceipts, onTotalRevenueUpdate]);

  {
    /* ✅ Determine if first year column should be hidden */
  }
  const hideFirstYear = totalRevenueReceipts?.[0] === 0;

  // ✅ Remove first year from financialYearLabels if hiding is required
  const adjustedFinancialYearLabels = hideFirstYear
    ? financialYearLabels.slice(1)
    : financialYearLabels;
  // ✅ Remove first-year revenue if hiding is required


  const adjustedTotalRevenueForOthers = hideFirstYear
    ? formData?.Revenue?.totalRevenueForOthers?.slice(1)
    : formData?.Revenue?.totalRevenueForOthers;


    const adjustedTotalRevenueReceipts = hideFirstYear
    ? totalRevenueReceipts.slice(1)
    : totalRevenueReceipts;

  return (
    <Page
      size={formData.ProjectReportSetting.ProjectionYears > 12 ? "A3" : "A4"}
      orientation={
        formData.ProjectReportSetting.ProjectionYears > 6
          ? "landscape"
          : "portrait"
      }
      wrap={false}
      break
      style={[{ padding: "20px" }]}
    >
      {pdfType &&
        pdfType !== "select option" &&
        (pdfType === "Sharda Associates" || pdfType === "CA Certified") && (
          <View
            style={{
              position: "absolute",
              left: "50%", // Center horizontally
              top: "50%", // Center vertically
              width: 500, // Set width to 500px
              height: 700, // Set height to 700px
              marginLeft: -200, // Move left by half width (500/2)
              marginTop: -350, // Move up by half height (700/2)
              opacity: 0.4, // Light watermark
              zIndex: -1, // Push behind content
            }}
          >
            <Image
              src={pdfType === "Sharda Associates" ? SAWatermark : CAWatermark}
              style={{
                width: "100%",
                height: "100%",
              }}
            />
          </View>
        )}
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
          {formData?.ProjectReportSetting?.AmountIn?.value === "rupees"
            ? "Rs" // ✅ Convert "rupees" to "Rs"
            : formData?.ProjectReportSetting?.AmountIn?.value}
          .)
        </Text>
      </View>

      <View style={styleExpenses.paddingx}>
        {/* Heading */}
        <View style={stylesCOP.heading}>
          <Text>Projected Revenue/ Sales</Text>
        </View>
        {/* ✅ Table Rendering Based on `formType` */}
        <View style={[styles.table]}>
          {/* ✅ Table Header */}
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
            {/* ✅ Generate Dynamic Year Headers, skipping first year if needed */}
            {adjustedFinancialYearLabels.map((yearLabel, yearIndex) => (
              <Text
                key={yearIndex}
                style={[styles.particularsCell, stylesCOP.boldText]}
              >
                {yearLabel}
              </Text>
            ))}
          </View>

          {/* ✅ Table Body - Display Data */}
          {selectedData.map((item, index) => {
            let updatedYears = [...(item.years || [])].slice(
              0,
              projectionYears
            );

            while (updatedYears.length < projectionYears) {
              updatedYears.push(0); // ✅ Fill missing values with 0
            }

            // ✅ Remove first-year column if required
            if (hideFirstYear) {
              updatedYears.shift();
            }

            const isHeading = item.rowType === "1";
            const isBold = item.rowType === "2";
            const serialNumber =
              formData?.Revenue?.formFields?.[index]?.serialNumber;

            const finalSerialNumber =
              formType === "Others" &&
              serialNumber !== undefined &&
              serialNumber !== null
                ? serialNumber
                : formType === "Monthly"
                ? serialNumber || index + 1
                : "";

            const isEmptyRow = updatedYears.every(
              (year) => year === 0 || year === ""
            );

            if (isEmptyRow && !isHeading) {
              return null;
            }

            return (
              <View
                key={index}
                style={[
                  stylesMOF.row,
                  styleExpenses.tableRow,
                  isHeading && styleExpenses.headingRow,
                  isBold && { fontFamily: "Roboto", fontWeight: "bold" },
                  { borderBottomWidth: "0px" },
                ]}
              >
                <Text
                  style={[
                    stylesCOP.serialNoCellDetail,
                    isHeading && styleExpenses.headingText,
                    { borderBottomWidth: "0px" },
                  ]}
                >
                  {finalSerialNumber}
                </Text>

                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                    isHeading && styleExpenses.headingText,
                    { borderBottomWidth: "0px" },
                  ]}
                >
                  {item.particular}
                </Text>

                {/* ✅ Render years dynamically, skipping first year if necessary */}
                {updatedYears.map((yearValue, yearIndex) => (
                  <Text
                    key={yearIndex}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                      isBold && { fontFamily: "Roboto", fontWeight: "bold" },
                      isHeading && {
                        fontFamily: "Roboto",
                        color: "black",
                        fontWeight: "bold",
                        textAlign: "center",
                      },
                      { borderBottomWidth: "0px" },
                    ]}
                  >
                    {isHeading && isEmptyRow ? "" : formatNumber(yearValue)}{" "}
                  </Text>
                ))}
              </View>
            );
          })}
        </View>
        {/* ✅ Compute & Display Revenue Based on formType */}
        <View style={[stylesMOF.row, styleExpenses.totalRow]}>
          <Text
            style={[
              stylesCOP.serialNoCellDetail,
              { borderBottomWidth: "0px", borderLeftWidth: "1px" },
            ]}
          ></Text>

          {/* ✅ Conditional Label Based on formType */}
          <Text
            style={[
              stylesCOP.detailsCellDetail,
              styleExpenses.particularWidth,
              styleExpenses.bordernone,
              { fontWeight: "bold", paddingLeft: 10 },
            ]}
          >
            {formType?.trim() === "Monthly"
              ? "Total Monthly Revenue"
              : "Total Revenue for Others"}
          </Text>

          {/* ✅ Display Correct Revenue Based on formType */}
          {adjustedTotalRevenueReceipts.map((_, yearIndex) => (
            <Text
              key={yearIndex}
              style={[
                stylesCOP.particularsCellsDetail,
                styleExpenses.fontSmall,
                { fontWeight: "extrabold", textAlign: "center" },
              ]}
            >
              {
                formType?.trim() === "Monthly"
                  ? formatNumber(adjustedTotalRevenueReceipts[yearIndex] || 0) // Monthly revenue
                  : formatNumber(
                      adjustedTotalRevenueForOthers?.[yearIndex] || 0
                    ) // Others revenue
              }
            </Text>
          ))}
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
            marginTop: "60px",
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

export default React.memo(ProjectedRevenue);
