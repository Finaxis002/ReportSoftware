import React, { useEffect, useState } from "react";
import { Page, View, Text, Image } from "@react-pdf/renderer";
import { styles, stylesCOP, stylesMOF, styleExpenses } from "./Styles"; // Import only necessary styles
import { Font } from "@react-pdf/renderer";
import SAWatermark from "../Assets/SAWatermark";
import CAWatermark from "../Assets/CAWatermark";

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

const calculateMonthsPerYear = (
  moratoriumPeriodMonths,
  projectionYears,
  startingMonth
) => {
  let monthsArray = [];
  let remainingMoratorium = moratoriumPeriodMonths;

  for (let year = 1; year <= projectionYears; year++) {
    let monthsInYear = 12;
    if (year === 1) {
      monthsInYear = 12 - startingMonth + 1; // Months left in the starting year
    }

    if (remainingMoratorium >= monthsInYear) {
      monthsArray.push(0); // Entire year under moratorium
      remainingMoratorium -= monthsInYear;
    } else {
      monthsArray.push(monthsInYear - remainingMoratorium); // Partial moratorium impact
      remainingMoratorium = 0;
    }
  }

  return monthsArray;
};

// ✅ Function to Calculate Depreciation Considering Moratorium Period

const calculateDepreciationWithMoratorium = (
  assetValue,
  depreciationRate,
  moratoriumPeriodMonths,
  startingMonth,
  projectionYears
) => {
  const monthsPerYear = calculateMonthsPerYear(
    moratoriumPeriodMonths,
    projectionYears,
    startingMonth
  );

  let yearlyDepreciation = [];
  let cumulativeDepreciation = [];
  let netAssetValue = assetValue;

  for (let yearIndex = 0; yearIndex < projectionYears; yearIndex++) {
    const monthsInYear = monthsPerYear[yearIndex];
    let depreciation = 0;

    // ✅ Depreciation for partial year after moratorium ends
    if (monthsInYear === 0) {
      depreciation = 0; // Entire year under moratorium
    } else {
      // ✅ Correct depreciation formula
      depreciation = (netAssetValue / 12) * depreciationRate * monthsInYear;
    }

    yearlyDepreciation.push(depreciation);

    // ✅ Compute cumulative depreciation
    if (yearIndex === 0) {
      cumulativeDepreciation.push(depreciation);
    } else {
      cumulativeDepreciation.push(
        cumulativeDepreciation[yearIndex - 1] + depreciation
      );
    }

    // ✅ Update net asset value for the next year's calculation
    netAssetValue -= depreciation;
  }

  return { yearlyDepreciation, cumulativeDepreciation };
};

const calculateTotalDepreciationPerYear = (
  formData,
  moratoriumPeriodMonths,
  projectionYears,
  startingMonth
) => {
  return Array.from({ length: projectionYears }).map((_, yearIndex) => {
    return Object.entries(formData.CostOfProject).reduce(
      (sum, [key, asset]) => {
        const assetValue = asset.amount || 0;
        const depreciationRate = asset.rate / 100 || 0;
        const { yearlyDepreciation } = calculateDepreciationWithMoratorium(
          assetValue,
          depreciationRate,
          moratoriumPeriodMonths,
          startingMonth,
          projectionYears
        );
        return sum + yearlyDepreciation[yearIndex];
      },
      0
    );
  });
};

const ProjectedDepreciation = ({
  formData,
  pdfType,
  setTotalDepreciation,
  onComputedData1,
  onFirstYearGrossAssetsCalculated,
  onGrossFixedAssetsPerYearCalculated,
  financialYearLabels,
  formatNumber,
  receivedtotalRevenueReceipts,
}) => {
  const [grossFixedAssetsPerYear, setGrossFixedAssetsPerYear] = useState([]);

  const years = formData?.ProjectReportSetting?.ProjectionYears || 5;
  const moratoriumMonths =
    parseInt(formData?.ProjectReportSetting?.MoratoriumPeriod) || 0;
  const startingMonthMap = {
    April: 1,
    May: 2,
    June: 3,
    July: 4,
    August: 5,
    September: 6,
    October: 7,
    November: 8,
    December: 9,
    January: 10,
    February: 11,
    March: 12,
  };
  const selectedStartingMonth =
    formData?.ProjectReportSetting?.SelectStartingMonth || "April";
  const startingMonth = startingMonthMap[selectedStartingMonth];

  // State for First Year Gross Fixed Assets
  const [firstYearGrossFixedAssets, setFirstYearGrossFixedAssets] = useState(0);
  // ✅ Calculate Gross Fixed Assets using useEffect

  useEffect(() => {
    if (formData && formData.CostOfProject) {
      const calculatedAssets = Array.from({ length: years }).map(
        (_, yearIndex) => {
          return Object.values(formData.CostOfProject).reduce((sum, asset) => {
            let netAsset = asset.amount;
            for (let i = 1; i < yearIndex; i++) {
              let depreciation = (netAsset * asset.rate) / 100;
              netAsset -= depreciation;
            }
            return sum + netAsset;
          }, 0);
        }
      );

      setGrossFixedAssetsPerYear(calculatedAssets);

      // ✅ Send data back to parent component
      if (onGrossFixedAssetsPerYearCalculated) {
        onGrossFixedAssetsPerYearCalculated(calculatedAssets);
      }
    }
  }, [formData, years]);
  // ✅ Send the First Year's Value to Another Component via useEffect
  useEffect(() => {
    if (firstYearGrossFixedAssets > 0 && onFirstYearGrossAssetsCalculated) {
      onFirstYearGrossAssetsCalculated(firstYearGrossFixedAssets);
    }
  }, [firstYearGrossFixedAssets]);
  // const years = formData?.ProjectReportSetting?.ProjectionYears || 5; // Default to 5 years if not provided

  // ✅ Compute Net Asset (D) & Depreciation (B) for Each Year
  const netAssetValues = Object.entries(formData.CostOfProject).map(
    ([key, asset]) => {
      let assetValues = [];
      let depreciationValues = [];

      for (let yearIndex = 0; yearIndex < years; yearIndex++) {
        let depreciation =
          yearIndex === 0 && asset.rate && asset.amount
            ? (asset.amount * asset.rate) / 100 // ✅ First-Year Depreciation
            : (assetValues[yearIndex - 1] * asset.rate) / 100 || 0; // ✅ Future Years

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
      const { yearlyDepreciation, cumulativeDepreciation } =
        calculateDepreciationWithMoratorium(
          asset.amount || 0,
          asset.rate / 100 || 0,
          moratoriumMonths,
          startingMonth,
          years
        );

      return { yearlyDepreciation, cumulativeDepreciation };
    }
  );

  const totalDepreciationPerYear = calculateTotalDepreciationPerYear(
    formData,
    moratoriumMonths,
    years,
    startingMonth
  );

  useEffect(() => {
    setTotalDepreciation(totalDepreciationPerYear);
  }, [setTotalDepreciation]);

  useEffect(() => {
    if (totalDepreciationPerYear.length > 0) {
      onComputedData1((prev) => ({
        ...prev,
        totalDepreciationPerYear,
      }));
    }
  }, [JSON.stringify(totalDepreciationPerYear)]);

  const cumulativeDepreciationTotals = Array.from({ length: years }).map(
    (_, yearIndex) => {
      return Object.entries(formData.CostOfProject).reduce(
        (sum, [key, asset]) => {
          const { cumulativeDepreciation } =
            calculateDepreciationWithMoratorium(
              asset.amount || 0,
              asset.rate / 100 || 0,
              moratoriumMonths,
              startingMonth,
              years
            );

          return sum + cumulativeDepreciation[yearIndex];
        },
        0
      );
    }
  );

  // ✅ Compute Total Net Assets Per Year
  const netAssetTotals = Array.from({ length: years }).map((_, yearIndex) => {
    return Object.entries(formData.CostOfProject).reduce(
      (sum, [key, asset]) => {
        let netAssetValue = asset.amount;

        // Deduct depreciation for all previous years before current year
        for (let i = 1; i <= yearIndex; i++) {
          let depreciation = (netAssetValue * asset.rate) / 100;
          netAssetValue -= depreciation;
        }

        return sum + netAssetValue;
      },
      0 // Start sum at 0
    );
  });

  const hideFirstYear = receivedtotalRevenueReceipts?.[0] <= 0;

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
      {/* watermark  */}
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

      <View style={[styleExpenses.paddingx, { paddingBottom: "30px" }]}>
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
        {/* Heading */}
        <View style={stylesCOP.heading}>
          <Text>Projected Depreciation</Text>
        </View>

        {/* Table Container */}

        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.serialNoCell, stylesCOP.boldText]}>
              Sr. No.
            </Text>
            <Text style={[styles.detailsCell, stylesCOP.boldText , {width:"80%"} , {width:"80%"}]}>
              Particulars
            </Text>
            <Text
              style={[
                stylesCOP.boldText,
                { width: "15%", textAlign: "center" },
              ]}
            >
              Rate
            </Text>

            {/* Generate Dynamic Year Headers using financialYearLabels */}
            {financialYearLabels.map((yearLabel, yearIndex) =>
              // ✅ Conditionally hide the first year if hideFirstYear is true
              hideFirstYear && yearIndex === 0 ? null : (
                <Text
                  key={yearIndex}
                  style={[styles.particularsCell, stylesCOP.boldText]}
                >
                  {yearLabel}
                </Text>
              )
            )}
          </View>

          <View style={[styles.tableHeader, { marginTop: "20px" }]}>
            <Text style={[styles.serialNoCell, stylesCOP.boldText]}>A</Text>
            <Text style={[styles.detailsCell, stylesCOP.boldText , {width:"80%"}]}>
              Gross Fixed Assets
            </Text>
            <Text style={[stylesCOP.boldText, { width: "15%" }]}></Text>

            {/* ✅ Display Pre-calculated Gross Fixed Assets for Each Year */}
            {grossFixedAssetsPerYear.map((totalFixedAssets, yearIndex) =>
              // ✅ Conditionally hide the first year if hideFirstYear is true
              hideFirstYear && yearIndex === 0 ? null : (
                <Text
                  key={yearIndex}
                  style={[styles.particularsCell, stylesCOP.boldText]}
                >
                  {formatNumber(totalFixedAssets)}
                </Text>
              )
            )}
          </View>

          {/* Display Gross Fixed Assets (A) with updated values */}
          {(() => {
            let visibleIndex = 0; // Track actual visible index

            return Object.entries(formData.CostOfProject).map(
              ([key, asset]) => {
                // Calculate asset values
                let netAssetValue = asset.amount;
                const assetValues = Array.from({ length: years }).map(
                  (_, yearIndex) => {
                    let depreciation = 0;
                    if (yearIndex > 1 && asset.rate) {
                      depreciation = (netAssetValue * asset.rate) / 100;
                      netAssetValue -= depreciation;
                    }
                    return netAssetValue;
                  }
                );

                // Filter only visible values for zero-check
                const visibleAssetValues = hideFirstYear
                  ? assetValues.slice(1)
                  : assetValues;

                // Skip if all visible values are 0
                if (visibleAssetValues.every((val) => val === 0)) return null;

                visibleIndex++; // Increment only for visible rows

                return (
                  <View key={key} style={styles.tableRow}>
                    {/* ✅ Corrected Serial Number */}
                    <Text style={stylesCOP.serialNoCellDetail}>
                      {visibleIndex}
                    </Text>

                    {/* Asset Name */}
                    <Text style={[stylesCOP.detailsCellDetail , {width:"80%"}]}>
                      {asset.name}
                    </Text>

                    {/* Empty column */}
                    <Text
                      style={[
                        stylesCOP.particularsCellsDetail,
                        { width: "15%" },
                      ]}
                    ></Text>

                    {/* Asset values per year */}
                    {assetValues.map((value, yearIndex) =>
                      hideFirstYear && yearIndex === 0 ? null : (
                        <Text
                          key={yearIndex}
                          style={[
                            stylesCOP.particularsCellsDetail,
                            styleExpenses.fontSmall,
                          ]}
                        >
                          {formatNumber(value)}
                        </Text>
                      )
                    )}
                  </View>
                );
              }
            );
          })()}

          {/* Depreciation Header */}
          <View style={[styles.tableHeader]}>
            <Text style={[styles.serialNoCell, stylesCOP.boldText]}>B</Text>
            <Text style={[styles.detailsCell, stylesCOP.boldText , {width:"80%"}]}>
              Depreciation
            </Text>
            <Text style={[{ width: "15%" }, stylesCOP.boldText]}></Text>

            {/* ✅ Display Precomputed Total Depreciation for Each Year */}
            {totalDepreciationPerYear.map((total, yearIndex) =>
              hideFirstYear && yearIndex === 0 ? null : (
                <Text
                  key={yearIndex}
                  style={[styles.particularsCell, stylesCOP.boldText]}
                >
                  {formatNumber(total)}
                </Text>
              )
            )}
          </View>

          {/* Display Depreciation Rates for Each Asset */}

          {(() => {
            let visibleIndex = 0; // To track only visible (non-zero) rows

            return Object.entries(formData.CostOfProject).map(
              ([key, asset], index) => {
                const yearlyDep =
                  depreciationValues[index]?.yearlyDepreciation || [];

                // Get only the visible years
                const visibleDep = hideFirstYear
                  ? yearlyDep.slice(1)
                  : yearlyDep;

                // If all visible values are 0, skip rendering
                if (visibleDep.every((val) => val === 0)) return null;

                visibleIndex++; // Increment for visible rows only

                return (
                  <View key={key} style={styles.tableRow}>
                    {/* ✅ Corrected Serial Number */}
                    <Text style={stylesCOP.serialNoCellDetail}>
                      {visibleIndex}
                    </Text>

                    {/* Asset Name */}
                    <Text style={[stylesCOP.detailsCellDetail , {width:"80%"}]}>
                      {asset.name}
                    </Text>

                    {/* Depreciation Rate */}
                    <Text
                      style={[
                        stylesCOP.particularsCellsDetail,
                        { width: "15%" },
                      ]}
                    >
                      {asset.rate ? `${asset.rate}%` : " "}
                    </Text>

                    {/* Yearly Depreciation Values */}
                    {yearlyDep.map((value, yearIndex) =>
                      hideFirstYear && yearIndex === 0 ? null : (
                        <Text
                          key={yearIndex}
                          style={[
                            stylesCOP.particularsCellsDetail,
                            styleExpenses.fontSmall,
                          ]}
                        >
                          {formatNumber(value)}
                        </Text>
                      )
                    )}
                  </View>
                );
              }
            );
          })()}

          {/* Cumulative Depreciation */}

          <View style={[styles.tableHeader]}>
            <Text style={[styles.serialNoCell, stylesCOP.boldText]}>C</Text>
            <Text style={[styles.detailsCell, stylesCOP.boldText , {width:"80%"}]}>
              Cumulative Depreciation
            </Text>

            {/* Show Depreciation Rates */}
            <Text style={[{ width: "15%" }, stylesCOP.boldText]}></Text>

            {/* ✅ Display Cumulative Depreciation for Each Year in Header */}
            {cumulativeDepreciationTotals.map((total, yearIndex) =>
              hideFirstYear && yearIndex === 0 ? null : (
                <Text
                  key={yearIndex}
                  style={[styles.particularsCell, stylesCOP.boldText]}
                >
                  {formatNumber(total)}
                </Text>
              )
            )}
          </View>

          {/* ✅ Display Correct Cumulative Depreciation for Each Asset */}
          {(() => {
            let visibleIndex = 0; // To track visible rows only

            return Object.entries(formData.CostOfProject).map(
              ([key, asset], index) => {
                const cumDep =
                  depreciationValues[index]?.cumulativeDepreciation || [];

                // Only consider visible years
                const visibleCumDep = hideFirstYear ? cumDep.slice(1) : cumDep;

                // Skip rendering if all visible values are zero
                if (visibleCumDep.every((val) => val === 0)) return null;

                visibleIndex++; // Increment only for rows that are displayed

                return (
                  <View key={key} style={styles.tableRow}>
                    {/* ✅ Correct Serial Number */}
                    <Text style={stylesCOP.serialNoCellDetail}>
                      {visibleIndex}
                    </Text>

                    {/* Asset Name */}
                    <Text style={[stylesCOP.detailsCellDetail , {width:"80%"}]}>
                      {asset.name}
                    </Text>

                    {/* Empty Column for Depreciation Rate */}
                    <Text
                      style={[
                        stylesCOP.particularsCellsDetail,
                        { width: "15%" },
                      ]}
                    ></Text>

                    {/* Display Cumulative Depreciation per year */}
                    {cumDep.map((value, yearIndex) =>
                      hideFirstYear && yearIndex === 0 ? null : (
                        <Text
                          key={yearIndex}
                          style={[
                            stylesCOP.particularsCellsDetail,
                            styleExpenses.fontSmall,
                          ]}
                        >
                          {formatNumber(value)}
                        </Text>
                      )
                    )}
                  </View>
                );
              }
            );
          })()}

          {/* Net Asset */}

          <View style={[styles.tableHeader]}>
            <Text style={[styles.serialNoCell, stylesCOP.boldText]}>D</Text>
            <Text style={[styles.detailsCell, stylesCOP.boldText , {width:"80%"}]}>
              Net Asset
            </Text>

            {/* Show Depreciation Rates */}
            <Text style={[{ width: "15%" }, stylesCOP.boldText]}></Text>

            {/* ✅ Display Total Net Assets for Each Year in Header */}
            {netAssetTotals.map((total, yearIndex) =>
              hideFirstYear && yearIndex === 0 ? null : (
                <Text
                  key={yearIndex}
                  style={[styles.particularsCell, stylesCOP.boldText]}
                >
                  {formatNumber(total)}
                </Text>
              )
            )}
          </View>

          {(() => {
            let visibleIndex = 0; // To track and display correct serial number

            return Object.entries(formData.CostOfProject).map(
              ([key, asset]) => {
                let netAssetValue = asset.amount;
                const netAssetValues = [];

                for (let yearIndex = 0; yearIndex < years; yearIndex++) {
                  let depreciation = 0;
                  if (yearIndex > 0 && asset.rate && netAssetValue) {
                    depreciation = (netAssetValue * asset.rate) / 100;
                  }
                  const netAsset = netAssetValue - depreciation;
                  netAssetValues.push(netAsset);
                  netAssetValue = netAsset;
                }

                // ✅ Filter only visible years
                const visibleValues = hideFirstYear
                  ? netAssetValues.slice(1)
                  : netAssetValues;

                // ✅ Skip rendering if all visible values are zero
                if (visibleValues.every((val) => val === 0)) return null;

                visibleIndex++; // ✅ Increase index only for visible rows

                return (
                  <View key={key} style={styles.tableRow}>
                    {/* ✅ Corrected Serial Number */}
                    <Text style={stylesCOP.serialNoCellDetail}>
                      {visibleIndex}
                    </Text>

                    {/* Asset Name */}
                    <Text style={[stylesCOP.detailsCellDetail , {width:"80%"}]}>
                      {asset.name}
                    </Text>

                    {/* Empty column for alignment */}
                    <Text
                      style={[
                        stylesCOP.particularsCellsDetail,
                        { width: "15%" },
                      ]}
                    ></Text>

                    {/* Render Net Asset Values */}
                    {netAssetValues.map((netAsset, yearIndex) =>
                      hideFirstYear && yearIndex === 0 ? null : (
                        <Text
                          key={yearIndex}
                          style={[
                            stylesCOP.particularsCellsDetail,
                            styleExpenses.fontSmall,
                          ]}
                        >
                          {formatNumber(netAsset)}
                        </Text>
                      )
                    )}
                  </View>
                );
              }
            );
          })()}
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
              marginTop: "50px",
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
      </View>
    </Page>
  );
};

export default React.memo(ProjectedDepreciation);
