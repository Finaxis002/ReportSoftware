import React from "react";
import { Page, View, Text } from "@react-pdf/renderer";
import { styles, stylesCOP, styleExpenses, stylesMOF } from "./Styles"; // Import only necessary styles

const CostOfProject = ({ formData, localData }) => {

  // ✅ Safe Helper Function to Format Numbers Based on Selected Format
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

  // ✅ Compute Total Cost of Project Safely
  const totalCost = formData?.CostOfProject
    ? Object.values(formData.CostOfProject).reduce(
        (sum, field) => sum + (field?.amount || 0), // ✅ Ensures missing values default to 0
        0
      )
    : 0; // ✅ Default to 0 if CostOfProject is missing

  return (
    <Page size="A4" style={stylesCOP.styleCOP}>
      <Text style={styles.clientName}>{localData?.clientName || "Client Name"}</Text>
      <View style={stylesCOP.heading}>
        <Text>Cost Of Project</Text>
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.serialNoCell}>S.No.</Text>
          <Text style={styles.detailsCell}>Particulars</Text>
          <Text style={styles.particularsCell}>Amount</Text>
        </View>

        {/* ✅ Handle Empty CostOfProject Data Gracefully */}
        {formData?.CostOfProject && Object.keys(formData.CostOfProject).length > 0 ? (
          Object.entries(formData.CostOfProject).map(([key, field], index) => (
            <View key={key} style={styles.tableRow}>
              <Text style={stylesCOP.serialNoCellDetail}>{index + 1}</Text>
              <Text style={stylesCOP.detailsCellDetail}>{field?.name || "N/A"}</Text>
              <Text style={stylesCOP.particularsCellsDetail}>
                {formatNumber(field?.amount || 0)}
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.tableRow}>
            <Text style={[stylesCOP.detailsCellDetail, { textAlign: "center", width: "100%" }]}>
              No cost data available
            </Text>
          </View>
        )}

        {/* ✅ Total Cost Row */}
        <View style={stylesCOP.totalHeader}>
          <Text style={stylesCOP.serialNoCellDetail}></Text>
          <Text style={[stylesCOP.detailsCellDetail, stylesCOP.boldText]}>
            Total Cost of Project
          </Text>
          <Text style={[stylesCOP.particularsCellsDetail, stylesCOP.boldText]}>
            {formatNumber(totalCost)}
          </Text>
        </View>
      </View>
    </Page>
  );
};

export default CostOfProject;
