import React, { useEffect, useMemo, useState } from "react";
import { Page, View, Text } from "@react-pdf/renderer";
import { styles, stylesCOP, stylesMOF, styleExpenses } from "./Styles"; // Import styles

const ProjectedRevenue = ({
  formData,
  onTotalRevenueUpdate,
  financialYearLabels,
  formatNumber,
}) => {
  // ✅ Ensure `noOfMonths` is safely initialized
  const [noOfMonths, setNoOfMonths] = useState(
    formData?.Revenue?.noOfMonths || []
  );

  // ✅ Extract projection years and formType safely
  const projectionYears =
    parseInt(formData?.ProjectReportSetting?.ProjectionYears) || 0;
  const formType = formData?.Revenue?.formType || "Others"; // ✅ Defaults to "Others" if missing

  // ✅ Function to handle changes in the input field
  const changeMonth = (index, value) => {
    setNoOfMonths((prevMonths) => {
      const updatedMonths = [...prevMonths]; // Clone previous state
      updatedMonths[index] = isNaN(value) ? 0 : Number(value); // Ensure valid number
      return updatedMonths;
    });
  };

  // ✅ Corrected selection of dataset for "Others"
  const selectedData = useMemo(() => {
    return (
      formData?.Revenue?.[
        formType === "Others" ? "formFields" : "formFields2"
      ] || []
    );
  }, [formData?.Revenue, formType]);

  const totalMonthlyRevenue = formData.Revenue.totalMonthlyRevenue;

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

  return (
    <Page
      size={formData.ProjectReportSetting.ProjectionYears > 12 ? "A3" : "A4"}
      orientation={
        formData.ProjectReportSetting.ProjectionYears > 7
          ? "landscape"
          : "portrait"
      }
      wrap={false}
      break
      style={[{ padding: "20px" }]}
    >
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

      <View style={styleExpenses.paddingx}>
        {/* Heading */}

        <View style={stylesCOP.heading}>
          <Text>Projected Revenue/ Sales</Text>
        </View>

        {/* ✅ Table Rendering Based on `formType` */}
        <View style={[styles.table]}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.serialNoCell, stylesCOP.boldText]}>
              S. No.
            </Text>
            <Text style={[styles.detailsCell, styleExpenses.particularWidth]}>
              Particulars
            </Text>

            {/* Generate Dynamic Year Headers using financialYearLabels */}
            {financialYearLabels.map((yearLabel, yearIndex) => (
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

            // ✅ Determine Row Style Based on rowType
            const isHeading = item.rowType === "1";
            const isBold = item.rowType === "2";

            // ✅ Determine which form is selected (assuming `selectedForm` determines this)
            const isForm1 = formType === "Others"; // Adjust according to your actual form selector
            const isForm2 = formType === "Monthly"; // Adjust based on actual selection logic

            // ✅ Fetch serial number conditionally
            const serialNumber =
              formData?.Revenue?.formFields?.[index]?.serialNumber;

            // ✅ Apply serial number logic:
            const finalSerialNumber =
              isForm1 && serialNumber !== undefined && serialNumber !== null
                ? serialNumber
                : isForm2
                ? serialNumber || index + 1
                : "";

            // console.log("serialNumber:", serialNumber, "Final Serial:", finalSerialNumber);

            // ✅ Check if all year values are blank or zero
            const isEmptyRow = updatedYears.every(
              (year) => year === 0 || year === ""
            );

            // ✅ Skip rendering for empty rows
            if (isEmptyRow && !isHeading) {
              return null;
            }

            return (
              <View
                key={index}
                style={[
                  stylesMOF.row,
                  styleExpenses.tableRow,
                  isHeading && styleExpenses.headingRow, // ✅ Apply heading style
                  isBold && { fontFamily: "Roboto", fontWeight: "bold" }, // ✅ Apply bold style
                  { borderBottomWidth: "0px" },
                ]}
              >
                <Text
                  style={[
                    stylesCOP.serialNoCellDetail,
                    isHeading && styleExpenses.headingText, // ✅ Apply heading text style
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
                    isHeading && styleExpenses.headingText, // ✅ Apply heading style
                    { borderBottomWidth: "0px" },
                  ]}
                >
                  {item.particular}
                </Text>

                {updatedYears.map((yearValue, yearIndex) => (
                  <Text
                    key={yearIndex}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                      isBold && { fontFamily: "Roboto", fontWeight: "bold" }, // ✅ Apply bold for rowType "2"
                      isHeading && {
                        fontFamily: "Roboto",
                        color: "black",
                        fontWeight: "bold",
                      }, // ✅ Heading Style
                      { borderBottomWidth: "0px" },
                    ]}
                  >
                    {isHeading && isEmptyRow ? "" : formatNumber(yearValue)}{" "}
                    {/* ✅ Leave blank for headings */}
                  </Text>
                ))}
              </View>
            );
          })}
        </View>
        {/* ✅ Compute & Display Revenue Based on formType */}
        <View style={[stylesMOF.row, styleExpenses.totalRow]}>
          <Text style={stylesCOP.serialNoCellDetail}></Text>

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
          {Array.from({ length: projectionYears }).map((_, yearIndex) => (
            <Text
              key={yearIndex}
              style={[
                stylesCOP.particularsCellsDetail,
                styleExpenses.fontSmall,
                { fontWeight: "extrabold" },
              ]}
            >
              {
                formType?.trim() === "Monthly"
                  ? formatNumber(totalRevenueReceipts[yearIndex] || 0) // Monthly revenue
                  : formatNumber(
                      formData?.Revenue?.totalRevenueForOthers?.[yearIndex] || 0
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

export default React.memo(ProjectedRevenue);
