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
  orientation,
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

  useEffect(() => {
    if (firstYearGrossFixedAssets > 0 && onFirstYearGrossAssetsCalculated) {
      onFirstYearGrossAssetsCalculated(firstYearGrossFixedAssets);
    }
  }, [firstYearGrossFixedAssets]);
  // const years = formData?.ProjectReportSetting?.ProjectionYears || 5; // Default to 5 years if not provided

  // ✅ Step 1: Compute Depreciation Values with Moratorium
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

  // ✅ Step 2: Compute Net Asset Values using Depreciation from Step 1
  const netAssetValues = Object.entries(formData.CostOfProject)
    .filter(([_, asset]) => !asset.isSelected && !asset.isPreliminary) // ✅ Skip both
    .map(([key, asset], index) => {
      const assetAmount = asset.amount || 0;
      const depreciationPerYear =
        depreciationValues[index]?.yearlyDepreciation || [];

      const assetValues = [];
      let currentValue = assetAmount;

      for (let yearIndex = 0; yearIndex < years; yearIndex++) {
        const depreciation = depreciationPerYear[yearIndex] || 0;
        const net = currentValue - depreciation;
        assetValues.push(net);
        currentValue = net;
      }

      return { assetValues };
    });

  const totalDepreciationPerYear = calculateTotalDepreciationPerYear(
    formData,
    moratoriumMonths,
    years,
    startingMonth
  );

  useEffect(() => {
    if (formData && formData.CostOfProject) {
      const calculatedAssets = Array.from({ length: years }).map(
        (_, yearIndex) => {
          return Object.values(formData.CostOfProject).reduce((sum, asset) => {
            if (asset.isSelected) return sum; // ✅ Skip selected assets

            let currentValue =
              typeof asset.amount === "string"
                ? parseFloat(asset.amount.replace(/,/g, "")) || 0
                : asset.amount || 0;

            // Apply depreciation year by year
            for (let i = 1; i <= yearIndex; i++) {
              const rate = asset.rate || 0;
              const depreciation = (currentValue * rate) / 100;
              currentValue -= depreciation;
            }

            return sum + currentValue;
          }, 0);
        }
      );

      setGrossFixedAssetsPerYear(calculatedAssets);

      if (onGrossFixedAssetsPerYearCalculated) {
        onGrossFixedAssetsPerYearCalculated(calculatedAssets);
      }
    }
  }, [formData, years]);

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

  // ✅ Total Net Asset Values Per Year (summed across all assets)
  const totalNetAssetValuesPerYear = [];

  for (let year = 0; year < years; year++) {
    let yearTotal = 0;

    netAssetValues.forEach((assetData) => {
      yearTotal += assetData.assetValues[year] || 0;
    });

    totalNetAssetValuesPerYear.push(yearTotal);
  }

  useEffect(() => {
    if (formData && formData.CostOfProject && depreciationValues.length > 0) {
      const allAssetValues = [];

      Object.values(formData.CostOfProject).forEach((asset, index) => {
        if (asset.isSelected || asset.isPreliminary) return; // ✅ Skip selected & preliminary assets

        const assetAmount =
          typeof asset.amount === "string"
            ? parseFloat(asset.amount.replace(/,/g, "")) || 0
            : asset.amount || 0;

        const depreciationPerYear =
          depreciationValues[index]?.yearlyDepreciation || [];

        const assetValues = [];
        let currentValue = assetAmount;

        for (let yearIndex = 0; yearIndex < years; yearIndex++) {
          if (yearIndex === 0) {
            assetValues.push(currentValue); // Year 1 – Original
          } else {
            const depreciation = depreciationPerYear[yearIndex - 1] || 0;
            currentValue -= depreciation;
            assetValues.push(currentValue);
          }
        }

        allAssetValues.push(assetValues); // Add only non-selected assets
      });

      const totalNetAssetValuesPerYear = [];

      for (let yearIndex = 0; yearIndex < years; yearIndex++) {
        let yearTotal = 0;

        allAssetValues.forEach((assetValues) => {
          yearTotal += assetValues[yearIndex] || 0;
        });

        totalNetAssetValuesPerYear.push(yearTotal);
      }

      setGrossFixedAssetsPerYear(totalNetAssetValuesPerYear);

      if (onGrossFixedAssetsPerYearCalculated) {
        onGrossFixedAssetsPerYearCalculated(totalNetAssetValuesPerYear);
      }
    }
  }, [formData, years]);

  const hideFirstYear = receivedtotalRevenueReceipts?.[0] <= 0;
  // const orientation =
  // hideFirstYear
  //   ? (formData.ProjectReportSetting.ProjectionYears > 6 ? "landscape" : "portrait")
  //   : (formData.ProjectReportSetting.ProjectionYears > 5 ? "landscape" : "portrait");

  return (
    <Page
      size={formData.ProjectReportSetting.ProjectionYears > 12 ? "A3" : "A4"}
      orientation={orientation} // ✅ Now using prop
      wrap={false}
      break
       style={styles.page}
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

        {/* Heading */}
        <View style={stylesCOP.heading}>
          <Text>Projected Depreciation</Text>
        </View>

        {/* Table Container */}

        <View style={[styles.table, {borderRightWidth:0}]}>
          {/* Table Header */}
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

            <Text
              style={[
                styles.serialNoCell,
                styleExpenses.sno,
                styleExpenses.fontBold,
                { textAlign: "center", borderRightWidth: 1 },
              ]}
            >
              Rate
            </Text>

            {/* Generate Dynamic Year Headers using financialYearLabels */}
            {financialYearLabels
              .slice(hideFirstYear ? 1 : 0) // ✅ Skip first year if receivedtotalRevenueReceipts[0] < 0
              .map((yearLabel, yearIndex) => (
                <Text
                  key={yearIndex}
                  style={[styles.particularsCell, stylesCOP.boldText]}
                >
                  {yearLabel}
                </Text>
              ))}
          </View>

          <View style={[styles.tableHeader, { marginTop: "20px", borderRightWidth:0 }]}>
            <Text
              style={[
                stylesCOP.serialNoCellDetail,
                {
                  fontWeight: "bold",
                },
              ]}
            >
              A
            </Text>
            <Text
              style={[
                stylesCOP.detailsCellDetail,
                styleExpenses.particularWidth,
                styleExpenses.bordernone,
                {
                  fontWeight: "bold",
                },
              ]}
            >
              Gross Fixed Assets
            </Text>
            <Text
              style={[
                stylesCOP.serialNoCellDetail,
                {
                  fontWeight: "bold",
                },
              ]}
            ></Text>

            {/* ✅ Render values from grossFixedAssetsPerYear */}
            {grossFixedAssetsPerYear &&
              grossFixedAssetsPerYear.map((value, index) =>
                hideFirstYear && index === 0 ? null : (
                  <Text
                    key={index}
                    style={[
                      stylesCOP.particularsCellsDetail,
                      styleExpenses.fontSmall,
                      {
                        fontWeight: "bold",
                      },
                    ]}
                  >
                    {formatNumber(value)}
                  </Text>
                )
              )}
          </View>

        
          {(() => {
            let visibleIndex = 0;

            return Object.entries(formData.CostOfProject).map(
              ([key, asset], index) => {
                if (!asset || !asset.amount || !asset.rate) {
                  // Log any assets that don't have the required properties (amount, rate)
                  // console.log(
                  //   `Skipping invalid asset: ${key}, missing amount or rate.`
                  // );
                  return null;
                }

                const assetAmount = asset.amount || 0;
                const depreciationPerYear =
                  depreciationValues[index]?.yearlyDepreciation || [];

                if (!depreciationPerYear || depreciationPerYear.length === 0) {
                  // console.log(
                  //   `Skipping asset: ${asset.name} due to missing depreciation values.`
                  // );
                  return null;
                }

                // Ensure depreciation values are numbers (not strings)
                const numericDepreciation = depreciationPerYear.map((val) =>
                  Number(val)
                );

                // Log depreciation values to check if conversion worked
                // console.log(`Asset: ${asset.name}`);
                // console.log(
                //   "Depreciation values per year (numeric):",
                //   numericDepreciation
                // );

                // Calculate asset values after depreciation
                const assetValues = [];
                let currentValue = assetAmount;

                for (let yearIndex = 0; yearIndex < years; yearIndex++) {
                  if (yearIndex === 0) {
                    assetValues.push(currentValue);
                  } else {
                    const depreciation =
                      numericDepreciation[yearIndex - 1] || 0;
                    currentValue -= depreciation;
                    assetValues.push(currentValue);
                  }
                }

                const visibleAssetValues = hideFirstYear
                  ? assetValues.slice(1)
                  : assetValues;

                // Check if all depreciation values are zero
                if (visibleAssetValues.every((val) => val === 0)) {
                  // console.log(
                  //   `Skipping Asset: ${asset.name} as depreciation values are zero`
                  // );
                  return null; // Skip rendering this asset row
                }

                visibleIndex++; // Increment for visible rows

                return (
                  <View key={key} style={[styles.tableRow, {borderRightWidth:0}]}>
                    <Text style={stylesCOP.serialNoCellDetail}>
                      {visibleIndex}
                    </Text>
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      {asset.name}
                    </Text>
                    <Text style={stylesCOP.serialNoCellDetail}></Text>
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
            <Text
              style={[
                stylesCOP.serialNoCellDetail,
                {
                  fontWeight: "bold",
                },
              ]}
            >
              B
            </Text>
            <Text
              style={[
                stylesCOP.detailsCellDetail,
                styleExpenses.particularWidth,
                styleExpenses.bordernone,
                {
                  fontWeight: "bold",
                },
              ]}
            >
              Depreciation
            </Text>
            <Text
              style={[
                stylesCOP.serialNoCellDetail,
                {
                  fontWeight: "bold",
                },
              ]}
            ></Text>

            {/* ✅ Render values from grossFixedAssetsPerYear */}
            {totalDepreciationPerYear.map((total, yearIndex) =>
              hideFirstYear && yearIndex === 0 ? null : (
                <Text
                  key={yearIndex}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                    {
                      fontWeight: "bold",
                    },
                  ]}
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
                  <View key={key} style={[styles.tableRow , {borderRightWidth:0}]}>
                    {/* ✅ Corrected Serial Number */}
                    <Text style={stylesCOP.serialNoCellDetail}>
                      {visibleIndex}
                    </Text>

                    {/* Asset Name */}
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      {asset.name}
                    </Text>

                    {/* Depreciation Rate */}
                    <Text style={stylesCOP.serialNoCellDetail}>
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
            <Text
              style={[
                stylesCOP.serialNoCellDetail,
                {
                  fontWeight: "bold",
                },
              ]}
            >
              C
            </Text>
            <Text
              style={[
                stylesCOP.detailsCellDetail,
                styleExpenses.particularWidth,
                styleExpenses.bordernone,
                {
                  fontWeight: "bold",
                },
              ]}
            >
              Cumulative Depreciation
            </Text>
            <Text
              style={[
                stylesCOP.serialNoCellDetail,
                {
                  fontWeight: "bold",
                },
              ]}
            ></Text>

            {/* ✅ Render values from grossFixedAssetsPerYear */}
            {cumulativeDepreciationTotals.map((total, yearIndex) =>
              hideFirstYear && yearIndex === 0 ? null : (
                <Text
                  key={yearIndex}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                    {
                      fontWeight: "bold",
                    },
                  ]}
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
                  <View key={key} style={[styles.tableRow, {borderRightWidth:0}]}>
                    {/* ✅ Correct Serial Number */}
                    <Text style={stylesCOP.serialNoCellDetail}>
                      {visibleIndex}
                    </Text>

                    {/* Asset Name */}
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      {asset.name}
                    </Text>

                    {/* Empty Column for Depreciation Rate */}
                    <Text style={stylesCOP.serialNoCellDetail}></Text>

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
            <Text
              style={[
                stylesCOP.serialNoCellDetail,
                {
                  fontWeight: "bold",
                },
              ]}
            >
              D
            </Text>
            <Text
              style={[
                stylesCOP.detailsCellDetail,
                styleExpenses.particularWidth,
                styleExpenses.bordernone,
                {
                  fontWeight: "bold",
                },
              ]}
            >
              Net Asset
            </Text>
            <Text
              style={[
                stylesCOP.serialNoCellDetail,
                {
                  fontWeight: "bold",
                },
              ]}
            ></Text>

            {/* ✅ Render values from net assets per year */}
            {totalNetAssetValuesPerYear.map((total, yearIndex) =>
              hideFirstYear && yearIndex === 0 ? null : (
                <Text
                  key={yearIndex}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                    {
                      fontWeight: "bold",
                    },
                  ]}
                >
                  {formatNumber(total)}
                </Text>
              )
            )}
          </View>

          {(() => {
            let visibleIndex = 0;

            return Object.entries(formData.CostOfProject).map(
              ([assetKey, asset], index) => {
                const assetData = netAssetValues.find(
                  (_, i) => Object.keys(formData.CostOfProject)[i] === assetKey
                );
                if (!assetData) return null;

                const netPerYear = assetData.assetValues;

                // ❌ Skip selected or preliminary assets
                const totalValue = netPerYear.reduce(
                  (acc, val) => acc + val,
                  0
                );
                const allSameValue = netPerYear.every(
                  (val) => val === netPerYear[0]
                );

                if (
                  asset.isSelected ||
                  asset.isPreliminary ||
                  totalValue < 10000 ||
                  allSameValue
                )
                  return null;

                // Skip assets where all visible years are 0
                const visibleNetValues = hideFirstYear
                  ? netPerYear.slice(1)
                  : netPerYear;
                if (visibleNetValues.every((val) => val === 0)) return null;

                visibleIndex++;

                return (
                  <View key={assetKey} style={[styles.tableRow, {borderRightWidth:0}]}>
                    <Text style={stylesCOP.serialNoCellDetail}>
                      {visibleIndex}
                    </Text>

                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                      ]}
                    >
                      {asset.name}
                    </Text>

                    <Text
                      style={[
                        stylesCOP.serialNoCellDetail,
                        { fontWeight: "bold" },
                      ]}
                    ></Text>

                    {netPerYear.map((netAsset, yearIndex) =>
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
