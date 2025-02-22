import React, { useEffect, useMemo } from "react";
import { Page, View, Text } from "@react-pdf/renderer";
import { styles, stylesCOP, stylesMOF, styleExpenses } from "./Styles"; // Import styles

const ProjectedRevenue = ({ formData, onTotalRevenueUpdate , financialYearLabels }) => {
  // ✅ Function to format numbers based on the selected format type
  const formatNumber = (value) => {
    const formatType = formData?.ProjectReportSetting?.Format || "1"; // Default to Indian Format
    if (value === undefined || value === null || isNaN(value)) return "0"; // ✅ Handle invalid values

    switch (formatType) {
      case "1":
        return new Intl.NumberFormat("en-IN").format(value); // Indian Format
      case "2":
        return new Intl.NumberFormat("en-US").format(value); // USD Format
      case "3":
        return new Intl.NumberFormat("en-IN").format(value); // Generic Format
      default:
        return new Intl.NumberFormat("en-IN").format(value); // ✅ Safe default
    }
  };

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
    return formData?.Revenue?.totalMonthlyRevenue || [];
  }
  return [];
}, [formData?.Revenue, formType]);




  // ✅ Send computed total revenue to parent or another component
  useEffect(() => {
    if (onTotalRevenueUpdate) {
      onTotalRevenueUpdate(totalRevenueReceipts);
    }
  }, [totalRevenueReceipts, onTotalRevenueUpdate]);

  // // ✅ Console log only when `formType` or `selectedData` changes
  // useEffect(() => {
  //   // console.log("🔍 Displaying Form Type:", formType);
  //   console.table(
  //     selectedData.map((item, index) => ({
  //       "S. No.": index + 1,
  //       "Particular": item.particular,
  //       ...item.years.reduce((acc, val, i) => ({ ...acc, [`Year ${i + 1}`]: val }), {}),
  //     }))
  //   );
  // }, [formType, JSON.stringify(selectedData)]); // ✅ Use JSON.stringify to avoid infinite loops

  return (
    <Page
      size={projectionYears > 12 ? "A3" : "A4"}
      orientation={projectionYears > 7 ? "landscape" : "portrait"}
    >
      <View style={styleExpenses.paddingx}>
        {/* Client Name & Heading */}
        <View>
          <Text style={styles.clientName}>
            {formData?.AccountInformation?.clientName}
          </Text>
          <View style={stylesCOP.heading}>
            <Text>Projected Revenue/ Sales</Text>
          </View>
        </View>
      </View>

      {/* ✅ Table Rendering Based on `formType` */}
      <View style={styleExpenses.paddingx}>
        <View style={[styles.table]}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.serialNoCell, stylesCOP.boldText]}>S. No.</Text>
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
        </View>

        {/* ✅ Table Body - Display Data */}
        {selectedData.map((item, index) => {
          let updatedYears = [...(item.years || [])].slice(0, projectionYears);
          while (updatedYears.length < projectionYears) {
            updatedYears.push(0); // ✅ Fill missing values with 0
          }

          return (
            <View key={index} style={[stylesMOF.row, styleExpenses.tableRow]}>
              <Text style={stylesCOP.serialNoCellDetail}>
                {index + 1}
              </Text>
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  styleExpenses.bordernone,
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
                  ]}
                >
                  {formatNumber(yearValue)}
                </Text>
              ))}
            </View>
          );
        })}

        {/* ✅ Compute & Display Total */}
        <View style={[stylesMOF.row, styleExpenses.totalRow]}>
          <Text
            style={stylesCOP.serialNoCellDetail}
          ></Text>

          <Text
            style={[
              stylesCOP.detailsCellDetail,
              styleExpenses.particularWidth,
              styleExpenses.bordernone,
              { fontWeight: "bold", paddingLeft: 10 },
            ]}
          >
            Total
          </Text>

          {totalRevenueReceipts.map((totalYearValue, yearIndex) => (
            <Text
              key={yearIndex}
              style={[
                stylesCOP.particularsCellsDetail,
                styleExpenses.fontSmall,
                { fontWeight: "extrabold" },
              ]}
            >
              {formatNumber(totalYearValue)}
            </Text>
          ))}
        </View>
      </View>
    </Page>
  );
};

export default ProjectedRevenue;
