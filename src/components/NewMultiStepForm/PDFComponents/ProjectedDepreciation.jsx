import React from "react";
import { Page, View, Text } from "@react-pdf/renderer";
import { styles, stylesCOP, stylesMOF, styleExpenses } from "./Styles"; // Import only necessary styles
import { Font } from "@react-pdf/renderer";

// ✅ Register a Font That Supports Bold
Font.register({
  family: "Roboto",
  fonts: [
    { src: "https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Me5Q.ttf" }, // Regular
    {
      src: "https://fonts.gstatic.com/s/roboto/v20/KFOlCnqEu92Fr1MmEU9vAw.ttf",
      fontWeight: "bold",
    }, // Bold
  ],
});

const ProjectedDepreciation = ({ formData, localData }) => {
  const years = formData?.ProjectReportSetting?.ProjectionYears || 5; // Default to 5 years if not provided

  // ✅ Compute Net Asset (D) & Depreciation (B) for Each Year
  const netAssetValues = Object.entries(formData.CostOfProject).map(
    ([key, asset]) => {
      let assetValues = [];
      let depreciationValues = [];

      for (let yearIndex = 0; yearIndex < years; yearIndex++) {
        let depreciation =
          yearIndex === 0 && asset.rate && asset.amount
            ? Math.round((asset.amount * asset.rate) / 100) // ✅ First-Year Depreciation
            : Math.round((assetValues[yearIndex - 1] * asset.rate) / 100 || 0); // ✅ Future Years

        let netAsset =
          (yearIndex === 0 ? asset.amount : assetValues[yearIndex - 1]) -
          depreciation;

        assetValues.push(netAsset);
        depreciationValues.push(depreciation);
      }

      return { assetValues, depreciationValues };
    }
  );

  const depreciationValues = Object.entries(formData.CostOfProject).map(
    ([key, asset]) => {
      let yearlyDepreciation = [];
      let cumulativeDepreciation = [];
      let netAssetValue = asset.amount; // Start with original asset value

      for (let yearIndex = 0; yearIndex < years; yearIndex++) {
        // ✅ Calculate Depreciation based on the updated asset value each year
        let depreciation = Math.round((netAssetValue * asset.rate) / 100) || 0;
        yearlyDepreciation.push(depreciation);

        // ✅ Compute Cumulative Depreciation
        if (yearIndex === 0) {
          cumulativeDepreciation.push(depreciation);
        } else {
          cumulativeDepreciation.push(
            cumulativeDepreciation[yearIndex - 1] + depreciation
          );
        }

        // ✅ Reduce Asset Value for Next Year
        netAssetValue -= depreciation;
      }

      return { yearlyDepreciation, cumulativeDepreciation };
    }
  );

  return (
    <Page size="A4" style={stylesCOP.styleCOP}>
      <Text style={styles.clientName}>{localData.clientName}</Text>
      {/* Heading */}
      <View style={stylesCOP.heading}>
        <Text>Projected Depreciation</Text>
      </View>

      {/* Table Container */}

      <View style={styles.table}>
        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.serialNoCell, stylesCOP.boldText]}>Sr. No.</Text>
          <Text style={[styles.detailsCell, stylesCOP.boldText]}>
            Particulars
          </Text>
          <Text style={[styles.particularsCell, stylesCOP.boldText]}>Rate</Text>

          {/* Generate Dynamic Year Headers */}
          {Array.from({ length: years }).map((_, yearIndex) => (
            <Text
              key={yearIndex}
              style={[styles.particularsCell, stylesCOP.boldText]}
            >
              {2025 + yearIndex}-{26 + yearIndex}
            </Text>
          ))}
        </View>

        {/* Total Gross Fixed Assets Calculation for Each Year */}
        <View style={[styles.tableHeader, { marginTop: "20px" }]}>
          <Text style={[styles.serialNoCell, stylesCOP.boldText]}>A</Text>
          <Text style={[styles.detailsCell, stylesCOP.boldText]}>
            Gross Fixed Assets
          </Text>
          <Text style={[styles.particularsCell, stylesCOP.boldText]}></Text>

          {/* Display Total Fixed Assets for Each Year */}
          {Array.from({ length: years }).map((_, yearIndex) => {
            // Compute Total Gross Fixed Assets for each year
            let totalFixedAssets = Object.values(formData.CostOfProject).reduce(
              (sum, asset) => {
                let netAsset = asset.amount; // Initial asset value

                // Deduct depreciation for all previous years
                for (let i = 0; i < yearIndex; i++) {
                  let depreciation = Math.round((netAsset * asset.rate) / 100);
                  netAsset -= depreciation; // Reduce the net asset for the next year
                }

                return sum + netAsset;
              },
              0 // Initial sum starts from 0
            );

            return (
              <Text
                key={yearIndex}
                style={[styles.particularsCell, stylesCOP.boldText]}
              >
                {new Intl.NumberFormat("en-IN").format(totalFixedAssets)}
              </Text>
            );
          })}
        </View>

        {/* Display Gross Fixed Assets (A) with updated values */}
        {Object.entries(formData.CostOfProject).map(([key, asset], index) => (
          <View key={index} style={styles.tableRow}>
            {/* Asset Serial Number */}
            <Text style={stylesCOP.serialNoCellDetail}>{index + 1}</Text>

            {/* Asset Name */}
            <Text style={stylesCOP.detailsCellDetail}>{asset.name}</Text>

            {/* Empty column for alignment */}
            <Text style={stylesCOP.particularsCellsDetail}></Text>

            {/* Generate Yearly Gross Fixed Asset Values */}
            {Array.from({ length: years }).map((_, yearIndex) => (
              <Text key={yearIndex} style={stylesCOP.particularsCellsDetail}>
                {new Intl.NumberFormat("en-IN").format(
                  yearIndex === 0
                    ? asset.amount
                    : netAssetValues[index].assetValues[yearIndex - 1] // ✅ Use Previous Year's Net Asset
                )}
              </Text>
            ))}
          </View>
        ))}

        
        {/* Depreciation Header */}
        <View style={[styles.tableHeader]}>
          <Text style={[styles.serialNoCell, stylesCOP.boldText]}>B</Text>
          <Text style={[styles.detailsCell, stylesCOP.boldText]}>
            Depreciation
          </Text>
          <Text style={[styles.particularsCell, stylesCOP.boldText]}></Text>

          {/* Compute and Display Total Depreciation for Each Year */}
          {Array.from({ length: years }).map((_, yearIndex) => {
            // Compute Total Depreciation for this year
            let totalDepreciation = Object.values(
              formData.CostOfProject
            ).reduce(
              (sum, asset) => {
                let netAsset = asset.amount;

                // Deduct depreciation for all previous years before current year
                for (let i = 0; i < yearIndex; i++) {
                  let depreciation = Math.round((netAsset * asset.rate) / 100);
                  netAsset -= depreciation;
                }

                // Calculate depreciation for the current year
                let currentYearDepreciation = Math.round(
                  (netAsset * asset.rate) / 100
                );
                return sum + currentYearDepreciation;
              },
              0 // Initial sum starts from 0
            );

            return (
              <Text
                key={yearIndex}
                style={[styles.particularsCell, stylesCOP.boldText]}
              >
                {new Intl.NumberFormat("en-IN").format(totalDepreciation)}
              </Text>
            );
          })}
        </View>

        {/* Display Depreciation Rates for Each Asset */}

        {Object.entries(formData.CostOfProject).map(([key, asset], index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={stylesCOP.serialNoCellDetail}>{index + 1}</Text>
            <Text style={stylesCOP.detailsCellDetail}>{asset.name}</Text>
            <Text style={stylesCOP.particularsCellsDetail}>
              {asset.rate ? `${asset.rate}%` : "N/A"}
            </Text>

            {Array.from({ length: years }).map((_, yearIndex) => (
              <Text key={yearIndex} style={stylesCOP.particularsCellsDetail}>
                {new Intl.NumberFormat("en-IN").format(
                  depreciationValues[index].yearlyDepreciation[yearIndex]
                )}
              </Text>
            ))}
          </View>
        ))}

        {/* Cumulative Depreciation */}

        <View style={[styles.tableHeader]}>
          <Text style={[styles.serialNoCell, stylesCOP.boldText]}>C</Text>
          <Text style={[styles.detailsCell, stylesCOP.boldText]}>
            Cumulative Depreciation
          </Text>

          {/* Show Depreciation Rates */}
          <Text style={[styles.particularsCell, stylesCOP.boldText]}></Text>

          {/* Generate Dynamic Year Headers */}
          {Array.from({ length: years }).map((_, yearIndex) => (
            <Text
              key={yearIndex}
              style={[styles.particularsCell, stylesCOP.boldText]}
            ></Text>
          ))}
        </View>

        {/* ✅ Display Correct Cumulative Depreciation for Each Asset */}
        {Object.entries(formData.CostOfProject).map(([key, asset], index) => (
          <View key={index} style={styles.tableRow}>
            {/* Asset Serial Number */}
            <Text style={stylesCOP.serialNoCellDetail}>{index + 1}</Text>

            {/* Asset Name */}
            <Text style={stylesCOP.detailsCellDetail}>{asset.name}</Text>

            {/* Empty Column for Depreciation Rate */}
            <Text style={stylesCOP.particularsCellsDetail}></Text>

            {/* Display Cumulative Depreciation Yearly (THIS IS NOW FIXED) */}
            {Array.from({ length: years }).map((_, yearIndex) => (
              <Text key={yearIndex} style={stylesCOP.particularsCellsDetail}>
                {new Intl.NumberFormat("en-IN").format(
                  depreciationValues[index].cumulativeDepreciation[yearIndex] // ✅ Now Correctly Computed
                )}
              </Text>
            ))}
          </View>
        ))}

        {/* Net Asset */}

        <View style={[styles.tableHeader]}>
          <Text style={[styles.serialNoCell, stylesCOP.boldText]}>D</Text>
          <Text style={[styles.detailsCell, stylesCOP.boldText]}>
            Net Asset
          </Text>

          {/* Show Depreciation Rates */}
          <Text style={[styles.particularsCell, stylesCOP.boldText]}></Text>

          {/* Generate Dynamic Year Headers */}
          {Array.from({ length: years }).map((_, yearIndex) => (
            <Text
              key={yearIndex}
              style={[styles.particularsCell, stylesCOP.boldText]}
            ></Text>
          ))}
        </View>

        {/* Display Net Assets for Each Asset */}
        {Object.entries(formData.CostOfProject).map(([key, asset], index) => {
          let netAssetValue = asset.amount; // Start with the initial asset amount

          return (
            <View key={index} style={styles.tableRow}>
              {/* Asset Serial Number */}
              <Text style={stylesCOP.serialNoCellDetail}>{index + 1}</Text>

              {/* Asset Name */}
              <Text style={stylesCOP.detailsCellDetail}>{asset.name}</Text>

              {/* Empty column for alignment */}
              <Text style={stylesCOP.particularsCellsDetail}></Text>

              {/* Generate Yearly Net Asset Values */}
              {Array.from({ length: years }).map((_, yearIndex) => {
                // ✅ Calculate Depreciation for each year based on the updated net asset value
                let depreciation =
                  asset.rate && netAssetValue
                    ? Math.round((netAssetValue * asset.rate) / 100)
                    : 0;

                // ✅ Compute Net Asset by subtracting depreciation
                let netAsset = netAssetValue - depreciation;

                // ✅ Update the Net Asset Value for next year's calculation
                netAssetValue = netAsset;

                return (
                  <Text
                    key={yearIndex}
                    style={stylesCOP.particularsCellsDetail}
                  >
                    {new Intl.NumberFormat("en-IN").format(netAsset)}{" "}
                    {/* ✅ Correctly Display Net Asset for Each Year */}
                  </Text>
                );
              })}
            </View>
          );
        })}
      </View>
    </Page>
  );
};

export default ProjectedDepreciation;
