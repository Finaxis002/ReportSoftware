import React from "react";
import { Page, View, Text } from "@react-pdf/renderer";
import { styles, stylesCOP, stylesMOF, styleExpenses } from "./Styles";
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

const BreakEvenPoint = ({ formData }) => {
  const years = formData?.ProjectReportSetting?.ProjectionYears || 5; // Default to 5 years if not provided

  // ✅ Precompute Multiplication for Each Year Before Rendering Based on Selected Form
  const totalRevenueReceipts = Array.from({
    length: parseInt(formData?.ProjectReportSetting?.ProjectionYears) || 0,
  }).map((_, yearIndex) => {
    return (
      formData?.Revenue?.selectedToggleType
        ? formData?.Revenue?.formFields
        : formData?.Revenue?.formFields2
    )?.reduce((product, item) => product * (item?.years?.[yearIndex] || 1), 1);
  });

  // ✅ Safe Helper Function to Format Numbers Based on Selected Format
  const formatNumber = (value) => {
    const formatType = formData?.ProjectReportSetting?.Format || "1"; // Default to Indian Format

    if (value === undefined || value === null || isNaN(value)) return "0"; // ✅ Handle invalid values

    switch (formatType) {
      case "1": // Indian Format (1,23,456)
        return new Intl.NumberFormat("en-IN").format(value);

      case "2": // USD Format (1,123,456)
        return new Intl.NumberFormat("en-US").format(value);

      case "3": // Generic Format (Same as Indian for now)
        return new Intl.NumberFormat("en-IN").format(value);

      default:
        return new Intl.NumberFormat("en-IN").format(value); // ✅ Safe default
    }
  };

  // ✅ Compute Adjusted Revenue Values for Each Year Before Rendering
  const adjustedRevenueValues = Array.from({
    length: parseInt(formData?.ProjectReportSetting?.ProjectionYears) || 0,
  }).map((_, yearIndex) => {
    const totalRevenue = totalRevenueReceipts[yearIndex] || 0;
    const closingStock = formData?.MoreDetails?.closingStock?.[yearIndex] || 0;
    const openingStock = formData?.MoreDetails?.openingStock?.[yearIndex] || 0;

    return totalRevenue + closingStock - openingStock; // ✅ Final computation
  });

  const { Expenses = {} } = formData; // Destructure Expenses safely with fallback to empty object
  const { normalExpense = [], directExpense = [] } = Expenses;

  // ✅ Calculate Total Variable Expense for Each Year
  const totalVariableExpense = Array(
    parseInt(formData.ProjectReportSetting.ProjectionYears) || 0
  )
    .fill(0)
    .map((_, yearIndex) =>
      directExpense
        .filter((expense) => expense.type === "direct")
        .reduce((total, expense) => {
          const baseValue = Number(expense.value) || 0;
          const initialValue = baseValue * 12;
          const calculatedValue =
            initialValue *
            Math.pow(
              1 + formData.ProjectReportSetting.rateOfExpense / 100,
              yearIndex
            );
          return total + calculatedValue;
        }, 0)
    );

  // ✅ Compute Contribution for Each Year
  const contribution = adjustedRevenueValues.map(
    (value, index) => value - totalVariableExpense[index]
  );

  return (
    <Page
      size={formData.ProjectReportSetting?.ProjectionYears > 12 ? "A3" : "A4"}
      orientation={
        formData.ProjectReportSetting?.ProjectionYears > 7
          ? "landscape"
          : "portrait"
      }
      wrap={false}
    >
      <View style={[styleExpenses?.paddingx, { paddingBottom: "30px" }]}>
        {/* Fix: Using formData.clientName instead of localData.clientName */}
        <Text style={[styles.clientName]}>{formData.clientName}</Text>
        <View
          style={[
            stylesCOP.heading,
            {
              fontWeight: "bold",
              paddingLeft: 10,
            },
          ]}
        >
          <Text>Break-Even Point</Text>
        </View>
        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.serialNoCell, stylesCOP.boldText]}>Sr. No.</Text>
          <Text style={[styles.detailsCell, stylesCOP.boldText]}>
            Particulars
          </Text>

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
        {/* Total Revenue Receipt */}
        <View
          style={[
            stylesMOF.row,
            styles.tableRow,
            {
              fontWeight: "black",
              marginVertical: "12px",
              borderLeft: "2px solid #000",
            },
          ]}
        >
          <Text
            style={[
              stylesCOP.serialNoCellDetail,
              styleExpenses.sno,
              styleExpenses.bordernone,
            ]}
          ></Text>
          <Text
            style={[
              stylesCOP.detailsCellDetail,
              styleExpenses.particularWidth,
              styleExpenses.bordernone,
              { fontWeight: "extrabold", fontFamily: "Roboto" },
            ]}
          >
            Gross Receipts
          </Text>

          {/* ✅ Display Precomputed Total Revenue Values */}
          {totalRevenueReceipts.map((totalYearValue, yearIndex) => (
            <Text
              key={yearIndex}
              style={[
                stylesCOP.particularsCellsDetail,
                stylesCOP.boldText,
                styleExpenses.fontSmall,
                {
                  fontFamily: "Roboto",
                  fontWeight: "extrabold",
                  borderLeftWidth: "0px",
                },
              ]}
            >
              {formatNumber(totalYearValue)}
            </Text>
          ))}
        </View>
        {/* Closing Stock / Inventory */}
        <View style={[stylesMOF.row, styles.tableRow]}>
          <Text
            style={[
              stylesCOP.serialNoCellDetail,
              styleExpenses.sno,
              styleExpenses.bordernone,
              { borderLeftWidth: "1px" },
            ]}
          ></Text>
          <Text
            style={[
              stylesCOP.detailsCellDetail,
              styleExpenses.particularWidth,
              styleExpenses.bordernone,
            ]}
          >
            Add: Closing Stock / Inventory
          </Text>

          {Array.from({
            length:
              parseInt(formData.ProjectReportSetting.ProjectionYears) || 0,
          }).map((_, index) => (
            <Text
              key={`closingStock-${index}`}
              style={[
                stylesCOP.particularsCellsDetail,
                styleExpenses.fontSmall,
              ]}
            >
              {formatNumber(formData.MoreDetails.closingStock?.[index] ?? 0)}
            </Text>
          ))}
        </View>
        {/* Opening Stock / Inventory */}
        <View style={[stylesMOF.row, styles.tableRow]}>
          <Text
            style={[
              stylesCOP.serialNoCellDetail,
              styleExpenses.sno,
              styleExpenses.bordernone,
              { borderLeftWidth: "1px" },
            ]}
          ></Text>
          <Text
            style={[
              stylesCOP.detailsCellDetail,
              styleExpenses.particularWidth,
              styleExpenses.bordernone,
            ]}
          >
            Less: Opening Stock / Inventory
          </Text>

          {Array.from({
            length:
              parseInt(formData.ProjectReportSetting.ProjectionYears) || 0,
          }).map((_, index) => (
            <Text
              key={`openingStock-${index}`}
              style={[
                stylesCOP.particularsCellsDetail,
                styleExpenses.fontSmall,
              ]}
            >
              {formatNumber(formData.MoreDetails.openingStock?.[index] ?? 0)}
            </Text>
          ))}
        </View>

        {/* Computation of Total Revenue, Adding Closing Stock, and Subtracting Opening Stock */}
        <View
          style={[stylesMOF.row, styles.tableRow, { borderBottomWidth: "0px" }]}
        >
          <Text
            style={[
              stylesCOP.serialNoCellDetail,
              styleExpenses.sno,
              styleExpenses.bordernone,
              { borderLeftWidth: "1px" },
            ]}
          ></Text>
          <Text
            style={[
              stylesCOP.detailsCellDetail,
              styleExpenses.particularWidth,
              styleExpenses.bordernone,
              { fontWeight: "extrabold" },
            ]}
          ></Text>

          {/* ✅ Display Computed Adjusted Revenue Values */}
          {adjustedRevenueValues.map((finalValue, yearIndex) => (
            <Text
              key={`finalValue-${yearIndex}`}
              style={[
                stylesCOP.particularsCellsDetail,
                stylesCOP.boldText,
                styleExpenses.fontSmall,
                {
                  fontFamily: "Roboto",
                  fontWeight: "extrabold",
                  borderLeftWidth: "0px",
                },
              ]}
            >
              {formatNumber(finalValue)}
            </Text>
          ))}
        </View>

        {/* Less: Variable Expense */}
        <View style={[stylesMOF.row, styleExpenses.headerRow]}>
          <Text style={[styleExpenses.sno]}></Text>
          <Text style={stylesMOF.cell}>Less: Variable Expense</Text>
        </View>
        {directExpense
          .filter((expense) => expense.type === "direct")
          .map((expense, index) => {
            const baseValue = Number(expense.value) || 0;
            const initialValue = baseValue * 12;

            return (
              <View key={index} style={[stylesMOF.row, styles.tableRow]}>
                <Text
                  style={[
                    stylesCOP.serialNoCellDetail,
                    styleExpenses.sno,
                    styleExpenses.bordernone,
                  ]}
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
                  {expense.name}
                </Text>
                {[
                  ...Array(
                    parseInt(formData.ProjectReportSetting.ProjectionYears) || 0
                  ),
                ].map((_, yearIndex) => {
                  const calculatedValue =
                    initialValue *
                    Math.pow(
                      1 + formData.ProjectReportSetting.rateOfExpense / 100,
                      yearIndex
                    );
                  return (
                    <Text
                      key={yearIndex}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                      ]}
                    >
                      {formatNumber(Math.round(calculatedValue))}
                    </Text>
                  );
                })}
              </View>
            );
          })}

        {/* ✅ Total Row for Variable Expense */}
        <View style={[stylesMOF.row, styles.tableRow, styleExpenses.totalRow]}>
          <Text
            style={[stylesCOP.serialNoCellDetail, styleExpenses.sno]}
          ></Text>
          <Text
            style={[
              stylesCOP.detailsCellDetail,
              styleExpenses.particularWidth,
              styleExpenses.bordernone,
              { fontWeight: "bold", fontFamily: "Roboto", textAlign: "right" },
            ]}
          >
            Total
          </Text>

          {/* ✅ Display Total for Each Year */}
          {totalVariableExpense.map((total, yearIndex) => (
            <Text
              key={yearIndex}
              style={[
                stylesCOP.particularsCellsDetail,
                styleExpenses.fontSmall,
                {fontFamily:"Roboto", fontWeight:"extrabold"}
              ]}
            >
              {formatNumber(Math.round(total))}
            </Text>
          ))}
        </View>

        {/* Contribution  */}

        <View
          style={[
            stylesMOF.row,
            styles.tableRow,
            {
              fontWeight: "black",
              borderLeft: "2px solid #000",
              marginVertical:"8px"
            },
          ]}
        >
          <Text
            style={[
              stylesCOP.serialNoCellDetail,
              styleExpenses.sno,
              styleExpenses.bordernone,
            ]}
          ></Text>
          <Text
            style={[
              stylesCOP.detailsCellDetail,
              styleExpenses.particularWidth,
              styleExpenses.bordernone,
              { fontWeight: "extrabold", fontFamily: "Roboto" , },
            ]}
          >
            Contribution
          </Text>

          {/* ✅ Display Contribution for Each Year */}
          {contribution.map((total, yearIndex) => (
            <Text
              key={yearIndex}
              style={[
                stylesCOP.particularsCellsDetail,
                styleExpenses.fontSmall,
                { fontWeight: "extrabold", fontFamily: "Roboto" , borderWidth:"2px", borderLeftWidth:"0px"}
              ]}
            >
              {formatNumber(Math.round(total))} {/* ✅ Round off Value */}
            </Text>
          ))}
        </View>

         
      </View>
    </Page>
  );
};

export default BreakEvenPoint;
