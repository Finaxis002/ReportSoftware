import React from "react";
import { Page, View, Text } from "@react-pdf/renderer";
import { styles, stylesCOP, stylesMOF, styleExpenses } from "./Styles"; // Import only necessary styles

const ProjectedRevenue = ({ formData }) => {

  const formatNumber = (value) => {
    const formatType = formData?.ProjectReportSetting?.Format || "1"; // Default to Indian Format

    if (value === undefined || value === null || isNaN(value)) return "0"; // ✅ Handle invalid values

    switch (formatType) {
      case "1": // Indian Format (1,23,456)
        return new Intl.NumberFormat("en-IN").format(value);

      case "2": // USD Format (1,123,456)
        return new Intl.NumberFormat("en-US").format(value);

      case "3": // Generic Format (1,23,456)
        return new Intl.NumberFormat("en-IN").format(value);

      default:
        return new Intl.NumberFormat("en-IN").format(value); // ✅ Safe default
    }
  };

  return (
    <Page
      size={formData.ProjectReportSetting.ProjectionYears > 12 ? "A3" : "A4"}
      orientation={
        formData.ProjectReportSetting.ProjectionYears > 7
          ? "landscape"
          : "portrait"
      }
    >
      <View style={styleExpenses.paddingx}>
        {/* Client Name */}
        <View>
          <Text style={styles.clientName}>
            {formData.AccountInformation.clientName}
          </Text>

          {/* Heading */}
          <View style={stylesCOP.heading}>
            <Text>Projected Revenue/ Sales</Text>
          </View>
        </View>
      </View>

      {/* Conditional Rendering of Tables Based on selectedToggleType */}
      {formData.Revenue.selectedToggleType ? (
        /** ✅ If selectedToggleType is TRUE, display the first table */
        <View style={styleExpenses.paddingx}>
          {/* Table Header */}
          <View style={[styles.table]}>
            <View style={styles.tableHeader}>
              <Text style={[styles.serialNoCell, styleExpenses.sno]}>
                S. No.
              </Text>
              <Text style={[styles.detailsCell, styleExpenses.particularWidth]}>
                Particulars
              </Text>

              {/* Dynamically Generate Year Columns */}
              {Array.from({
                length:
                  parseInt(formData.ProjectReportSetting.ProjectionYears) || 0,
              }).map((_, yearIndex) => (
                <Text key={yearIndex} style={styles.particularsCell}>
                  Year {yearIndex + 1}
                </Text>
              ))}
            </View>
          </View>

          {/* Table Body - Looping through formFields */}
          {Array.isArray(formData?.Revenue?.formFields) &&
            formData.Revenue.formFields.map((item, index) => {
              let updatedYears = [...(item.years || [])];
              const projectionYears = parseInt(
                formData.ProjectReportSetting.ProjectionYears
              );

              updatedYears = updatedYears.slice(0, projectionYears);
              while (updatedYears.length < projectionYears) {
                updatedYears.push(1); // ✅ Prevent multiplication by zero
              }

              return (
                <View
                  key={index}
                  style={[stylesMOF.row, styleExpenses.tableRow]}
                >
                  <Text
                    style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}
                  >
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

          {/* ✅ Compute & Display Total for First Table */}
          <View style={[stylesMOF.row, styleExpenses.totalRow]}>
            <Text
              style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}
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

            {Array.from({
              length:
                parseInt(formData.ProjectReportSetting.ProjectionYears) || 0,
            }).map((_, yearIndex) => {
              const totalYearValue = formData.Revenue.formFields.reduce(
                (product, item) => product * (item.years?.[yearIndex] || 1),
                1 // ✅ Multiplication: Start with 1 (not 0)
              );

              return (
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
              );
            })}
          </View>
        </View>
      ) : (
        /** ✅ If selectedToggleType is FALSE, display the second table */
        <View style={styleExpenses.paddingx}>
          {/* Table Header */}
          <View style={[styles.table]}>
            <View style={styles.tableHeader}>
              <Text style={[styles.serialNoCell, styleExpenses.sno]}>
                S. No.
              </Text>
              <Text style={[styles.detailsCell, styleExpenses.particularWidth]}>
                Particulars
              </Text>

              {/* Dynamically Generate Year Columns */}
              {Array.from({
                length:
                  parseInt(formData.ProjectReportSetting.ProjectionYears) || 0,
              }).map((_, yearIndex) => (
                <Text key={yearIndex} style={styles.particularsCell}>
                  Year {yearIndex + 1}
                </Text>
              ))}
            </View>
          </View>

          {/* Table Body - Looping through formFields2 */}
          {Array.isArray(formData?.Revenue?.formFields2) &&
            formData.Revenue.formFields2.map((item, index) => {
              let updatedYears = [...item.years];
              while (
                updatedYears.length <
                parseInt(formData.ProjectReportSetting.ProjectionYears)
              ) {
                updatedYears.push(1); // ✅ Prevent multiplication by zero
              }

              return (
                <View
                  key={index}
                  style={[stylesMOF.row, styleExpenses.tableRow]}
                >
                  <Text
                    style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}
                  >
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

          {/* ✅ Compute & Display Total for Second Table */}
          <View style={[stylesMOF.row, styleExpenses.totalRow]}>
            <Text
              style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}
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

            {Array.from({
              length:
                parseInt(formData.ProjectReportSetting.ProjectionYears) || 0,
            }).map((_, yearIndex) => {
              const totalYearValue = formData.Revenue.formFields2.reduce(
                (product, item) => product * (item.years?.[yearIndex] || 1),
                1 // ✅ Multiplication: Start with 1 (not 0)
              );

              return (
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
              );
            })}
          </View>
        </View>
      )}
    </Page>
  );
};

export default ProjectedRevenue;
