import React from "react";
import { Page, View, Text } from "@react-pdf/renderer";
import { styles, stylesCOP, stylesMOF, styleExpenses } from "./Styles"; // Import only necessary styles

const ProjectedRevenue = ({ formData }) => {

  
  return (
   <Page
       size={formData.ProjectReportSetting.ProjectionYears <= 7 ? "A4" : "A3"}
       orientation={formData.ProjectReportSetting.ProjectionYears <= 7 ? "portrait" : "landscape"}
    >
      <View style={styleExpenses.paddingx}>
        {/* Client Name */}
        <Text style={styles.clientName}>
          M/s {formData.AccountInformation.clientName}
        </Text>

        {/* Heading */}
        <View style={stylesCOP.heading}>
          <Text>Projected Revenue/ Sales</Text>
        </View>

        {/* Table Header */}
        <View style={[styles.table]}>
          <View style={styles.tableHeader}>
            <Text style={[styles.serialNoCell, styleExpenses.sno]}>S. No.</Text>
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
            // Ensure years array matches the number of ProjectionYears
            let updatedYears = [...item.years];

            while (
              updatedYears.length <
              parseInt(formData.ProjectReportSetting.ProjectionYears)
            ) {
              updatedYears.push(0); // Add missing years with 0 value
            }

            return (
              <View key={index} style={[stylesMOF.row, styleExpenses.tableRow]}>
                {/* Serial Number */}
                <Text style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}>
                  {index + 1}
                </Text>

                {/* Particular Name */}
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  {item.particular}
                </Text>

                {/* Yearly Revenue Values */}
                {updatedYears.map((yearValue, yearIndex) => (
                  <Text
                    key={yearIndex}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                    ]}
                  >
                    {new Intl.NumberFormat("en-IN").format(yearValue)}
                  </Text>
                ))}
              </View>
            );
          })}

        {/* Compute and Display Total Row at Bottom */}
        {Array.isArray(formData?.Revenue?.formFields) && (
          <View style={[stylesMOF.row, styleExpenses.totalRow]}>
            {/* Empty cell for serial number */}
            <Text
              style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}
            ></Text>

            {/* Label for total row */}
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

            {/* Compute Multiplication for Each Year */}
            {Array.from({
              length:
                parseInt(formData.ProjectReportSetting.ProjectionYears) || 0,
            }).map((_, yearIndex) => {
              // Initialize multiplication result with 1
              const totalYearValue = formData.Revenue.formFields.reduce(
                (product, item) => product * (item.years?.[yearIndex] || 1),
                1 // Start with 1, because multiplying by 0 gives 0
              );

              return (
                <Text
                  key={yearIndex}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                    { fontWeight: "extrabold" }, // Make total row bold
                  ]}
                >
                  {new Intl.NumberFormat("en-IN").format(totalYearValue)}
                </Text>
              );
            })}
          </View>
        )}
      </View>

       {/* Add Another Line Here for Separation */}
      <View style={{ borderBottomWidth: 1, borderBottomColor: "#000", marginVertical: "20px" }} />
      
       
         
       {/* second table  */}
       
       <View style={styleExpenses.paddingx}>
       
        {/* Table Header */}
        <View style={[styles.table]}>
          <View style={styles.tableHeader}>
            <Text style={[styles.serialNoCell, styleExpenses.sno]}>S. No.</Text>
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
        {Array.isArray(formData?.Revenue?.formFields2) &&
          formData.Revenue.formFields2.map((item, index) => {
            // Ensure years array matches the number of ProjectionYears
            let updatedYears = [...item.years];

            while (
              updatedYears.length <
              parseInt(formData.ProjectReportSetting.ProjectionYears)
            ) {
              updatedYears.push(0); // Add missing years with 0 value
            }

            return (
              <View key={index} style={[stylesMOF.row, styleExpenses.tableRow]}>
                {/* Serial Number */}
                <Text style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}>
                  {index + 1}
                </Text>

                {/* Particular Name */}
                <Text
                  style={[
                    stylesCOP.detailsCellDetail,
                    styleExpenses.particularWidth,
                    styleExpenses.bordernone,
                  ]}
                >
                  {item.particular}
                </Text>

                {/* Yearly Revenue Values */}
                {updatedYears.map((yearValue, yearIndex) => (
                  <Text
                    key={yearIndex}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                    ]}
                  >
                    {new Intl.NumberFormat("en-IN").format(yearValue)}
                  </Text>
                ))}
              </View>
            );
          })}

        {/* Compute and Display Total Row at Bottom */}
        {Array.isArray(formData?.Revenue?.formFields) && (
          <View style={[stylesMOF.row, styleExpenses.totalRow]}>
            {/* Empty cell for serial number */}
            <Text
              style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}
            ></Text>

            {/* Label for total row */}
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

            {/* Compute Multiplication for Each Year */}
            {Array.from({
              length:
                parseInt(formData.ProjectReportSetting.ProjectionYears) || 0,
            }).map((_, yearIndex) => {
              // Initialize multiplication result with 1
              const totalYearValue = formData.Revenue.formFields2.reduce(
                (product, item) => product * (item.years?.[yearIndex] || 1),
                1 // Start with 1, because multiplying by 0 gives 0
              );

              return (
                <Text
                  key={yearIndex}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                    { fontWeight: "extrabold" }, // Make total row bold
                  ]}
                >
                  {new Intl.NumberFormat("en-IN").format(totalYearValue)}
                </Text>
              );
            })}
          </View>
        )}
      </View>
    </Page>
  );
};

export default ProjectedRevenue;
