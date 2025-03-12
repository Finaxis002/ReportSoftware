import React from "react";
import { Page, View, Text, Image } from "@react-pdf/renderer";
import { styles, stylesCOP, stylesMOF, styleExpenses } from "./Styles";
import SAWatermark from "../Assets/SAWatermark";
import CAWatermark from "../Assets/CAWatermark";

const ProjectSynopsis = React.memo(
  ({
    formData,
    receivedtotalRevenueReceipts,
    normalExpense,
    totalQuantity,
    totalAnnualWages,
    fringeCalculation,
    fringAndAnnualCalculation = [],
    receivedDscr = [],
    receivedAverageCurrentRatio = [],
    receivedBreakEvenPointPercentage = [],
    receivedAssetsLiabilities = [],
    pdfType,
  }) => {
    //  console.log("received values : ", receivedBreakEvenPointPercentage);
    // console.log("received Dscr : " , receivedDscr);
    //  console.log("received current ratio : ", receivedAssetsLiabilities)
    // console.log(receivedAssetsLiabilities)

    const convertMonthsToYearsAndMonths = (months) => {
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      return `${years} Year${years !== 1 ? "s" : ""} ${remainingMonths} Month${
        remainingMonths !== 1 ? "s" : ""
      }`;
    };

    // ✅ Define specific fields to display with their corresponding keys and sources
    const requiredFields = [
      {
        label: "Name of the Concern",
        key: "businessName",
        source: "AccountInformation",
      },
      {
        label: "Constitution",
        key: "registrationType",
        source: "AccountInformation",
      },
      {
        label: "Industry Type",
        key: "industryType",
        source: "AccountInformation",
      },
      {
        label: "Address of the Business",
        key: "businessAddress",
        source: "AccountInformation",
      },
      {
        label: "Name of Promoter(s)",
        key: "businessOwner",
        source: "AccountInformation",
      },
      {
        label: "Contact Number",
        key: "businessContactNumber",
        source: "AccountInformation",
      },
      { label: "Email ID", key: "businessEmail", source: "AccountInformation" },
      {
        label: "Aadhaar/ PAN Number",
        key: "aadhaarOrPAN",
        source: "AccountInformation",
      }, // Special Handling

      {
        label: "Receipts/ Revenue (1st year onwards)",
        key: "receiptsRevenue",
        source: "AccountInformation",
      },
      {
        label: "Financial Year",
        key: "FinancialYear",
        source: "ProjectReportSetting",
      },
      {
        label: "Moratorium Period",
        key: "MoratoriumPeriod",
        source: "ProjectReportSetting",
      },
      {
        label: "Projections/ Repayment Period",
        key: "RepaymentMonths",
        source: "ProjectReportSetting",
        format: (value) => convertMonthsToYearsAndMonths(parseInt(value || 0)),
      },
    ];
    const formatNumber = (value) => {
      const formatType = formData?.ProjectReportSetting?.Format || "1"; // Default to Indian Format

      if (value === undefined || value === null || isNaN(value)) return "0"; // ✅ Handle invalid values with 0

      // ✅ Check if the value has decimal points
      const hasDecimal = value % 1 !== 0;

      // ✅ Format options based on whether decimals are needed
      const formatOptions = hasDecimal
        ? { minimumFractionDigits: 2, maximumFractionDigits: 2 } // Show 2 decimal places
        : {}; // No decimal places for whole numbers

      switch (formatType) {
        case "1": // Indian Format (1,23,456.00)
          return new Intl.NumberFormat("en-IN", formatOptions).format(value);

        case "2": // USD Format (1,123,456.00)
          return new Intl.NumberFormat("en-US", formatOptions).format(value);

        case "3": // Generic Indian Format (1,23,456.00)
          return new Intl.NumberFormat("en-IN", formatOptions).format(value);

        default: // Default to Indian Format
          return new Intl.NumberFormat("en-IN", formatOptions).format(value);
      }
    };

    // ✅ Function to get the first non-zero revenue value
    const getFirstNonZeroRevenue = (revenueArray) => {
      const firstValidValue = revenueArray.find((value) => value !== 0);
      return firstValidValue !== undefined
        ? `Rs. ${formatNumber(Math.round(firstValidValue))} /-`
        : " ";
    };

    // ✅ Function to get the first non-zero percentage value and its corresponding year
    const getFirstNonZeroPercentageWithYear = (percentageArray) => {
      // Find the index of the first non-zero value
      const firstNonZeroIndex = Array.isArray(percentageArray)
        ? percentageArray.findIndex((value) => value !== 0 && value !== "-")
        : -1;

      // ✅ If a valid non-zero value exists
      if (firstNonZeroIndex !== -1) {
        const firstValidValue = percentageArray[firstNonZeroIndex];
        return {
          value: `${formatNumber(firstValidValue)}`, // Format the value
          year: firstNonZeroIndex + 1, // Adding 1 because years are usually 1-based
        };
      }

      // ✅ If no valid non-zero value found
      return {
        value: "-",
        year: " ",
      };
    };

    // ✅ Destructure the first non-zero percentage value and the year
    const { value: firstNonZeroValue, year: fromWhichYearWeReceivedValue } =
      getFirstNonZeroPercentageWithYear(
        receivedBreakEvenPointPercentage?.breakEvenPointPercentage || []
      );

    // ✅ Compute Total Cost of Project including Working Capital
    const totalCost =
      (formData?.CostOfProject
        ? Object.values(formData.CostOfProject).reduce(
            (sum, field) => sum + (field?.amount || 0),
            0
          )
        : 0) + Number(formData?.MeansOfFinance?.totalWorkingCapital || 0); // ✅ Adding Working Capital

    return (
      <>
        <Page size="A4" style={styles.page}>
          {/* watermark  */}
          <View style={{ position: "absolute", left: 70, top: 0, zIndex: -1 }}>
            {/* ✅ Conditionally Render Watermark */}
            {pdfType &&
              pdfType !== "select option" &&
              (pdfType === "Sharda Associates" ||
                pdfType === "CA Certified") && (
                <Image
                  src={
                    pdfType === "Sharda Associates" ? SAWatermark : CAWatermark
                  }
                  style={{
                    width: "500px", // Adjust size based on PDF layout
                    height: "700px",
                    opacity: 0.4, // Light watermark to avoid blocking content
                  }}
                />
              )}
          </View>
          <View>
            <Text style={styles.title}>Project Synopsis</Text>

            <View style={styles.table}>
              {/* ✅ Table Header */}
              <View style={[styles.tableHeader]}>
                <Text
                  style={[
                    styles.serialNoCell,
                    { padding: "8px", width: "10%" },
                  ]}
                >
                  Sr. No.
                </Text>
                <Text
                  style={[
                    styles.particularsCell,
                    { padding: "8px", width: "45%" },
                  ]}
                >
                  Particulars
                </Text>
                <Text
                  style={[
                    styles.separatorCell,
                    { textAlign: "center", width: "5%" },
                  ]}
                >
                  :
                </Text>
                <Text
                  style={[styles.detailsCell, { padding: "8px", width: "55%" }]}
                >
                  Details
                </Text>
              </View>

              {/* ✅ Map Only Required Fields */}
              {requiredFields.map((field, index) => {
                let value = " ";

                // ✅ Dynamically fetching data from AccountInformation or ProjectReportSetting
                if (field.source === "AccountInformation") {
                  value = formData?.AccountInformation?.[field.key] || " ";
                } else if (field.source === "ProjectReportSetting") {
                  value = formData?.ProjectReportSetting?.[field.key] || " ";
                }
                // ✅ Fetch data dynamically based on the source
                if (field.source === "AccountInformation") {
                  // ✅ Special handling for Aadhaar/ PAN Number
                  if (field.key === "aadhaarOrPAN") {
                    const aadhaar = formData?.AccountInformation?.adhaarNumber;
                    const pan = formData?.AccountInformation?.PANNumber;

                    // ✅ Prioritize Aadhaar, fallback to PAN
                    if (aadhaar) {
                      value = ` ${aadhaar}`;
                    } else if (pan) {
                      value = `${pan}`;
                    } else {
                      value = " ";
                    }
                  } else {
                    value = formData?.AccountInformation?.[field.key] || " ";
                  }
                } else if (field.source === "ProjectReportSetting") {
                  value = formData?.ProjectReportSetting?.[field.key] || " ";
                }

                // ✅ Special Formatting for Repayment Period (Convert Months to Years and Months)
                if (field.key === "RepaymentMonths" && value !== " ") {
                  const months = parseInt(value);
                  const years = Math.floor(months / 12);
                  const remainingMonths = months % 12;
                  value = `${years} Years ${remainingMonths} Months`;
                }

                // ✅ Special Formatting for Moratorium Period
                if (field.key === "MoratoriumPeriod" && value !== " ") {
                  value = `${value} Months`;
                }

                // ✅ Special Formatting for Financial Year
                if (field.key === "FinancialYear" && value !== " ") {
                  value = `${value}-${parseInt(value) + 1}`;
                }

                if (field.source === "AccountInformation") {
                  if (field.key === "receiptsRevenue") {
                    // ✅ Use the function to get the first valid revenue
                    value = getFirstNonZeroRevenue(
                      receivedtotalRevenueReceipts
                    );
                  } else {
                    value = formData?.AccountInformation?.[field.key] || " ";
                  }
                } else if (field.source === "ProjectReportSetting") {
                  value = formData?.ProjectReportSetting?.[field.key] || " ";
                }

                // ✅ Check if the field requires special formatting for Repayment Months
                if (field.key === "RepaymentMonths" && value !== " ") {
                  value = convertMonthsToYearsAndMonths(parseInt(value));
                }

                return (
                  <View style={[styles.tableRow]} key={index}>
                    <Text
                      style={[
                        styles.serialNoCellDetail,
                        { padding: "8px", width: "10%" },
                      ]}
                    >
                      {index + 1}
                    </Text>
                    <Text
                      style={[
                        styles.particularsCellsDetail,
                        { padding: "8px", width: "45%" },
                      ]}
                    >
                      {field.label}
                    </Text>
                    <Text
                      style={[
                        styles.separatorCellDetail,
                        { padding: "8px", textAlign: "center", width: "5%" },
                      ]}
                    >
                      :
                    </Text>
                    <Text
                      style={[
                        styles.detailsCellDetail,
                        { padding: "8px", width: "55%" },
                      ]}
                    >
                      {value}
                    </Text>
                  </View>
                );
              })}

              {/* Manpower Requirement  */}
              <View>
                <View style={[styles.tableHeader]}>
                  <Text
                    style={[
                      styles.serialNoCell,
                      { padding: "8px", width: "10%" },
                    ]}
                  >
                    13
                  </Text>
                  <Text
                    style={[
                      styles.particularsCell,
                      { padding: "8px", width: "45%" },
                    ]}
                  >
                    Manpower Requirement
                  </Text>
                  <Text
                    style={[
                      styles.separatorCell,
                      { textAlign: "center", width: "5%" },
                    ]}
                  >
                    :
                  </Text>
                  <Text
                    style={[
                      styles.detailsCell,
                      { padding: "8px", width: "27.5%", textAlign: "center" },
                    ]}
                  >
                    Number
                  </Text>
                  <Text
                    style={[
                      styles.detailsCell,
                      { padding: "8px", width: "27.5%", textAlign: "center" },
                    ]}
                  >
                    Annual Wages
                  </Text>
                </View>

                {normalExpense.map((expense, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text
                      style={[
                        styles.serialNoCellDetail,
                        { padding: "8px", width: "10%" },
                      ]}
                    ></Text>

                    <Text
                      style={[
                        styles.particularsCellsDetail,
                        { padding: "8px", width: "45%" },
                      ]}
                    >
                      {expense.name || " "}
                    </Text>
                    <Text
                      style={[
                        styles.separatorCellDetail,
                        { padding: "8px", textAlign: "center", width: "5%" },
                      ]}
                    >
                      :
                    </Text>
                    <Text
                      style={[
                        styles.detailsCellDetail,
                        { padding: "8px", width: "27.5%", textAlign: "center" },
                      ]}
                    >
                      {expense.quantity || "0"}
                    </Text>
                    <Text
                      style={[
                        styles.detailsCellDetail,
                        {
                          padding: "8px",
                          width: "27.5%",
                          textAlign: "center",
                          borderLeftWidth: "1px",
                        },
                      ]}
                    >
                      {" "}
                      {formatNumber(expense.amount * expense.quantity * 12)}
                    </Text>
                  </View>
                ))}

                {/* Total Row with Applied Styling */}
                <View key="total" style={styles.tableRow}>
                  <Text
                    style={[
                      styles.serialNoCellDetail,
                      { padding: "8px", width: "10%" },
                    ]}
                  ></Text>

                  <Text
                    style={[
                      styles.particularsCellsDetail,
                      {
                        padding: "8px",
                        width: "45%",
                        fontFamily: "Roboto",
                        fontWeight: "extrabold",
                      },
                    ]}
                  >
                    Total
                  </Text>

                  <Text
                    style={[
                      styles.separatorCellDetail,
                      {
                        padding: "8px",
                        textAlign: "center",
                        width: "5%",
                      },
                    ]}
                  >
                    :
                  </Text>

                  {/* ✅ Total Quantity Display */}
                  <Text
                    style={[
                      styles.detailsCellDetail,
                      {
                        padding: "8px",
                        width: "27.5%",
                        textAlign: "center",
                        fontFamily: "Roboto",
                        fontWeight: "extrabold",
                      },
                    ]}
                  >
                    {totalQuantity || "0"}
                  </Text>

                  {/* ✅ Total Annual Wages Display with Proper Formatting */}
                  <Text
                    style={[
                      styles.detailsCellDetail,
                      {
                        padding: "8px",
                        width: "27.5%",
                        textAlign: "center",
                        borderLeftWidth: "1px",
                        fontFamily: "Roboto",
                        fontWeight: "extrabold",
                      },
                    ]}
                  >
                    {formatNumber(totalAnnualWages || 0)}
                  </Text>
                </View>

                {/* Add: Fringe Benefits @ 5 % */}
                <View key="fringeCalculation" style={styles.tableRow}>
                  <Text
                    style={[
                      styles.serialNoCellDetail,
                      { padding: "8px", width: "10%" },
                    ]}
                  ></Text>

                  <Text
                    style={[
                      styles.particularsCellsDetail,
                      {
                        padding: "8px",
                        width: "45%",
                      },
                    ]}
                  ></Text>

                  <Text
                    style={[
                      styles.separatorCellDetail,
                      {
                        padding: "8px",
                        textAlign: "center",
                        width: "5%",
                      },
                    ]}
                  >
                    :
                  </Text>

                  {/* ✅ Total Quantity Display */}
                  <Text
                    style={[
                      styles.detailsCellDetail,
                      {
                        padding: "8px",
                        width: "27.5%",
                        textAlign: "center",
                        fontSize: "9px",
                      },
                    ]}
                  >
                    Add: Fringe Benefits @ 5 %
                  </Text>

                  {/* ✅ Total Annual Wages Display with Proper Formatting */}
                  <Text
                    style={[
                      styles.detailsCellDetail,
                      {
                        padding: "8px",
                        width: "27.5%",
                        textAlign: "center",
                        borderLeftWidth: "1px",
                      },
                    ]}
                  >
                    {formatNumber(fringeCalculation)}
                  </Text>
                </View>

                {/* TOTAL  */}
                <View key="total" style={styles.tableRow}>
                  <Text
                    style={[
                      styles.serialNoCellDetail,
                      { padding: "8px", width: "10%" },
                    ]}
                  ></Text>

                  <Text
                    style={[
                      styles.particularsCellsDetail,
                      {
                        padding: "8px",
                        width: "45%",
                        fontFamily: "Roboto",
                        fontWeight: "extrabold",
                      },
                    ]}
                  ></Text>

                  <Text
                    style={[
                      styles.separatorCellDetail,
                      {
                        padding: "8px",
                        textAlign: "center",
                        width: "5%",
                      },
                    ]}
                  >
                    :
                  </Text>

                  {/* ✅ Total Quantity Display */}
                  <Text
                    style={[
                      styles.detailsCellDetail,
                      {
                        padding: "8px",
                        width: "27.5%",
                        textAlign: "center",
                        fontFamily: "Roboto",
                        fontWeight: "extrabold",
                      },
                    ]}
                  >
                    Total
                  </Text>

                  {/* ✅ Total Annual Wages Display with Proper Formatting */}
                  <Text
                    style={[
                      styles.detailsCellDetail,
                      {
                        padding: "8px",
                        width: "27.5%",
                        textAlign: "center",
                        borderLeftWidth: "1px",
                        fontFamily: "Roboto",
                        fontWeight: "extrabold",
                      },
                    ]}
                  >
                    {formatNumber(fringAndAnnualCalculation)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.table} break>
            {/* watermark  */}
            <View
              style={{ position: "absolute", left: 10, top: -100, zIndex: -1 }}
            >
              {/* ✅ Conditionally Render Watermark */}
              {pdfType &&
                pdfType !== "select option" &&
                (pdfType === "Sharda Associates" ||
                  pdfType === "CA Certified") && (
                  <Image
                    src={
                      pdfType === "Sharda Associates"
                        ? SAWatermark
                        : CAWatermark
                    }
                    style={{
                      width: "500px", // Adjust size based on PDF layout
                      height: "700px",
                      opacity: 0.4, // Light watermark to avoid blocking content
                    }}
                  />
                )}
            </View>
            {/*Cost of Project  */}
            <View>
              <View style={[styles.tableHeader]}>
                <Text
                  style={[
                    styles.serialNoCell,
                    { padding: "8px", width: "10%" },
                  ]}
                >
                  14
                </Text>
                <Text
                  style={[
                    styles.particularsCell,
                    { padding: "8px", width: "45%" },
                  ]}
                >
                  Cost of Project
                </Text>
                <Text
                  style={[
                    styles.separatorCell,
                    { textAlign: "center", width: "5%" },
                  ]}
                >
                  :
                </Text>
                <Text
                  style={[
                    styles.detailsCell,
                    { padding: "8px", width: "35%", textAlign: "left" },
                  ]}
                >
                  Particulars
                </Text>
                <Text
                  style={[
                    styles.detailsCell,
                    { padding: "8px", width: "20%", textAlign: "center" },
                  ]}
                >
                  Amount
                </Text>
              </View>

              {/* cost of project mapping  */}
              {formData?.CostOfProject &&
              Object.keys(formData.CostOfProject).length > 0 ? (
                Object.entries(formData.CostOfProject)
                  .filter(([key, field]) => field?.amount > 0) // ✅ Filter out fields where amount = 0
                  .map(([key, field], index) => (
                    <View key={index} style={styles.tableRow}>
                      {/* ✅ Serial No */}
                      <Text
                        style={[
                          styles.serialNoCellDetail,
                          {
                            padding: "8px",
                            width: "10%",
                            borderBottomWidth: "0px",
                            borderTopWidth: "0px",
                          },
                        ]}
                      ></Text>

                      {/* ✅ Particular Name */}
                      <Text
                        style={[
                          styles.particularsCellsDetail,
                          {
                            padding: "8px",
                            width: "45%",
                            borderBottomWidth: "0px",
                            borderTopWidth: "0px",
                          },
                        ]}
                      ></Text>

                      {/* ✅ Separator */}
                      <Text
                        style={[
                          styles.separatorCellDetail,
                          {
                            padding: "8px",
                            textAlign: "left",
                            width: "5%",
                            borderBottomWidth: "0px",
                            borderTopWidth: "0px",
                          },
                        ]}
                      >
                        {/* ✅ Leave blank if no separator value */}
                      </Text>

                      {/* ✅ Details */}
                      <Text
                        style={[
                          styles.detailsCellDetail,
                          { padding: "8px", width: "35%", textAlign: "left" },
                        ]}
                      >
                        {field?.name || ""}
                      </Text>

                      {/* ✅ Amount */}
                      <Text
                        style={[
                          styles.detailsCellDetail,
                          {
                            padding: "8px",
                            width: "20%",
                            textAlign: "center",
                            borderLeftWidth: "1px",
                          },
                        ]}
                      >
                        {formatNumber(field?.amount || 0)}
                      </Text>
                    </View>
                  ))
              ) : (
                <View style={styles.tableRow}>
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      { textAlign: "center", width: "100%" },
                    ]}
                  >
                    No cost data available
                  </Text>
                </View>
              )}

              {/* working capital  */}
              <View style={styles.tableRow}>
                <Text
                  style={[
                    styles.serialNoCellDetail,
                    {
                      padding: "8px",
                      width: "10%",
                      borderBottomWidth: "0px",
                      borderTopWidth: "0px",
                    },
                  ]}
                ></Text>
                <Text
                  style={[
                    styles.particularsCellsDetail,
                    {
                      padding: "8px",
                      width: "45%",
                      borderBottomWidth: "0px",
                      borderTopWidth: "0px",
                    },
                  ]}
                ></Text>
                <Text
                  style={[
                    styles.separatorCellDetail,
                    {
                      padding: "8px",
                      textAlign: "left",
                      width: "5%",
                      borderBottomWidth: "0px",
                      borderTopWidth: "0px",
                    },
                  ]}
                ></Text>
                <Text
                  style={[
                    styles.detailsCellDetail,
                    { padding: "8px", width: "35%", textAlign: "left" },
                  ]}
                >
                  Working Capital Required
                </Text>
                <Text
                  style={[
                    styles.detailsCellDetail,
                    {
                      padding: "8px",
                      width: "20%",
                      textAlign: "center",
                      borderLeftWidth: "1px",
                    },
                  ]}
                >
                  {formatNumber(formData.MeansOfFinance.totalWorkingCapital)}
                </Text>
              </View>

              {/* total  */}
              <View style={styles.tableRow}>
                <Text
                  style={[
                    styles.serialNoCellDetail,
                    {
                      padding: "8px",
                      width: "10%",
                      borderBottomWidth: "0px",
                      borderTopWidth: "0px",
                    },
                  ]}
                ></Text>
                <Text
                  style={[
                    styles.particularsCellsDetail,
                    {
                      padding: "8px",
                      width: "45%",
                      borderBottomWidth: "0px",
                      borderTopWidth: "0px",
                    },
                  ]}
                ></Text>
                <Text
                  style={[
                    styles.separatorCellDetail,
                    { padding: "8px", textAlign: "center", width: "5%" },
                  ]}
                ></Text>
                <Text
                  style={[
                    styles.detailsCellDetail,
                    {
                      padding: "8px",
                      width: "35%",
                      textAlign: "left",
                      fontFamily: "Roboto",
                      fontWeight: "extrabold",
                      fontSize: "12px",
                    },
                  ]}
                >
                  Total
                </Text>
                <Text
                  style={[
                    styles.detailsCellDetail,
                    {
                      padding: "8px",
                      width: "20%",
                      textAlign: "center",
                      borderLeftWidth: "1px",
                      fontFamily: "Roboto",
                      fontWeight: "extrabold",
                    },
                  ]}
                >
                  {formatNumber(totalCost)}
                </Text>
              </View>
            </View>

            {/* Means of Finance  */}
            <View>
              <View style={[styles.tableHeader]}>
                <Text
                  style={[
                    styles.serialNoCell,
                    { padding: "8px", width: "10%" },
                  ]}
                >
                  15
                </Text>
                <Text
                  style={[
                    styles.particularsCell,
                    { padding: "8px", width: "45%" },
                  ]}
                >
                  Means of Finance
                </Text>
                <Text
                  style={[
                    styles.separatorCell,
                    { textAlign: "center", width: "5%" },
                  ]}
                >
                  :
                </Text>
                <Text
                  style={[
                    styles.detailsCell,
                    { padding: "8px", width: "35%", textAlign: "left" },
                  ]}
                >
                  Particulars
                </Text>
                <Text
                  style={[
                    styles.detailsCell,
                    { padding: "8px", width: "20%", textAlign: "center" },
                  ]}
                >
                  Amount
                </Text>
              </View>

              {/* Total Promoter's Contribution  */}
              <View style={styles.tableRow}>
                <Text
                  style={[
                    styles.serialNoCellDetail,
                    {
                      padding: "8px",
                      width: "10%",
                      borderBottomWidth: "0px",
                      borderTopWidth: "0px",
                    },
                  ]}
                ></Text>
                <Text
                  style={[
                    styles.particularsCellsDetail,
                    {
                      padding: "8px",
                      width: "45%",
                      borderBottomWidth: "0px",
                      borderTopWidth: "0px",
                    },
                  ]}
                ></Text>
                <Text
                  style={[
                    styles.separatorCellDetail,
                    {
                      padding: "8px",
                      textAlign: "center",
                      width: "5%",
                      borderBottomWidth: "0px",
                      borderTopWidth: "0px",
                    },
                  ]}
                ></Text>
                <Text
                  style={[
                    styles.detailsCellDetail,
                    {
                      padding: "8px",
                      width: "35%",
                      textAlign: "left",
                      borderBottomWidth: "0px",
                      borderTopWidth: "0px",
                      paddingTop: "20px",
                    },
                  ]}
                >
                  Total Promoter's Contribution
                </Text>
                <Text
                  style={[
                    styles.detailsCellDetail,
                    {
                      padding: "8px",
                      width: "20%",
                      textAlign: "center",
                      borderLeftWidth: "1px",
                      borderBottomWidth: "0px",
                      borderTopWidth: "0px",
                      paddingTop: "20px",
                    },
                  ]}
                >
                  {formatNumber(formData?.MeansOfFinance?.totalPC || 0)}
                </Text>
              </View>

              {/*  Total Bank Loan  */}
              <View style={styles.tableRow}>
                <Text
                  style={[
                    styles.serialNoCellDetail,
                    {
                      padding: "8px",
                      width: "10%",
                      borderBottomWidth: "0px",
                      borderTopWidth: "0px",
                    },
                  ]}
                ></Text>
                <Text
                  style={[
                    styles.particularsCellsDetail,
                    {
                      padding: "8px",
                      width: "45%",
                      borderBottomWidth: "0px",
                      borderTopWidth: "0px",
                    },
                  ]}
                ></Text>
                <Text
                  style={[
                    styles.separatorCellDetail,
                    {
                      padding: "8px",
                      textAlign: "center",
                      width: "5%",
                      borderBottomWidth: "0px",
                      borderTopWidth: "0px",
                    },
                  ]}
                ></Text>
                <Text
                  style={[
                    styles.detailsCellDetail,
                    {
                      padding: "8px",
                      width: "35%",
                      textAlign: "left",
                      borderBottomWidth: "0px",
                      borderTopWidth: "0px",
                    },
                  ]}
                >
                  Total Bank Loan
                </Text>
                <Text
                  style={[
                    styles.detailsCellDetail,
                    {
                      padding: "8px",
                      width: "20%",
                      textAlign: "center",
                      borderLeftWidth: "1px",
                      borderBottomWidth: "0px",
                      borderTopWidth: "0px",
                    },
                  ]}
                >
                  {formatNumber(formData?.MeansOfFinance?.totalTL || 0)}
                </Text>
              </View>

              {/* total  */}
              <View style={styles.tableRow}>
                <Text
                  style={[
                    styles.serialNoCellDetail,
                    {
                      padding: "8px",
                      width: "10%",
                      borderBottomWidth: "0px",
                      borderTopWidth: "0px",
                    },
                  ]}
                ></Text>
                <Text
                  style={[
                    styles.particularsCellsDetail,
                    {
                      padding: "8px",
                      width: "45%",
                      borderBottomWidth: "0px",
                      borderTopWidth: "0px",
                    },
                  ]}
                ></Text>
                <Text
                  style={[
                    styles.separatorCellDetail,
                    { padding: "8px", textAlign: "center", width: "5%" },
                  ]}
                ></Text>
                <Text
                  style={[
                    styles.detailsCellDetail,
                    {
                      padding: "8px",
                      width: "35%",
                      textAlign: "left",
                      fontFamily: "Roboto",
                      fontWeight: "extrabold",
                      fontSize: "12px",
                      borderTop: "1px",
                    },
                  ]}
                >
                  Total
                </Text>
                <Text
                  style={[
                    styles.detailsCellDetail,
                    {
                      padding: "8px",
                      width: "20%",
                      textAlign: "center",
                      borderLeftWidth: "1px",
                      fontFamily: "Roboto",
                      fontWeight: "extrabold",
                      borderTop: "1px",
                    },
                  ]}
                >
                  {formatNumber(formData?.MeansOfFinance?.total || 0)}
                </Text>
              </View>
            </View>

            {/* other  */}
            <View>
              {/* Debt Service Coverage Ratio */}
              <View
                style={[styles.tableRow, { borderTopWidth: "0.6px" }]}
                key={16}
              >
                <Text
                  style={[
                    styles.serialNoCellDetail,
                    { padding: "8px", width: "10%" },
                  ]}
                >
                  16
                </Text>
                <Text
                  style={[
                    styles.particularsCellsDetail,
                    { padding: "8px", width: "45%" },
                  ]}
                >
                  Debt Service Coverage Ratio
                </Text>
                <Text
                  style={[
                    styles.separatorCellDetail,
                    { padding: "8px", textAlign: "center", width: "5%" },
                  ]}
                >
                  :
                </Text>
                <Text
                  style={[
                    styles.detailsCellDetail,
                    { padding: "8px", paddingLeft: "20px", width: "55%" },
                  ]}
                >
                  {`${formatNumber(receivedDscr?.averageDSCR || 0)} (${
                    receivedDscr?.numOfYearsUsedForAvg || 0
                  } Years Average)`}
                </Text>
              </View>

              {/* Current Ratio */}
              <View
                style={[styles.tableRow, { borderTopWidth: "0.6px" }]}
                key={16}
              >
                <Text
                  style={[
                    styles.serialNoCellDetail,
                    { padding: "8px", width: "10%" },
                  ]}
                >
                  17
                </Text>
                <Text
                  style={[
                    styles.particularsCellsDetail,
                    { padding: "8px", width: "45%" },
                  ]}
                >
                  Current Ratio
                </Text>
                <Text
                  style={[
                    styles.separatorCellDetail,
                    { padding: "8px", textAlign: "center", width: "5%" },
                  ]}
                >
                  :
                </Text>
                <Text
                  style={[
                    styles.detailsCellDetail,
                    { padding: "8px", paddingLeft: "20px", width: "55%" },
                  ]}
                >
                  {`${formatNumber(
                    receivedAssetsLiabilities?.averageCurrentRatio || 0
                  )} (${
                    receivedAssetsLiabilities?.numOfYearsUsedForAvg || 0
                  } Years Average)`}
                </Text>
              </View>

              {/* Breakeven Point */}
              <View
                style={[styles.tableRow, { borderTopWidth: "0.6px" }]}
                key={16}
              >
                <Text
                  style={[
                    styles.serialNoCellDetail,
                    { padding: "8px", width: "10%" },
                  ]}
                >
                  18
                </Text>
                <Text
                  style={[
                    styles.particularsCellsDetail,
                    { padding: "8px", width: "45%" },
                  ]}
                >
                  Breakeven Point
                </Text>
                <Text
                  style={[
                    styles.separatorCellDetail,
                    { padding: "8px", textAlign: "center", width: "5%" },
                  ]}
                >
                  :
                </Text>
                <Text
                  style={[
                    styles.detailsCellDetail,
                    { padding: "8px", paddingLeft: "20px", width: "55%" },
                  ]}
                >
                  {`${firstNonZeroValue}% (In the ${fromWhichYearWeReceivedValue} Year itself)`}
                </Text>
              </View>

              {/* Subsidy Scheme */}
              <View
                style={[styles.tableRow, { borderTopWidth: "0.6px" }]}
                key={16}
              >
                <Text
                  style={[
                    styles.serialNoCellDetail,
                    { padding: "8px", width: "10%" },
                  ]}
                >
                  19
                </Text>
                <Text
                  style={[
                    styles.particularsCellsDetail,
                    { padding: "8px", width: "45%" },
                  ]}
                >
                  Subsidy Scheme
                </Text>
                <Text
                  style={[
                    styles.separatorCellDetail,
                    { padding: "8px", textAlign: "center", width: "5%" },
                  ]}
                >
                  :
                </Text>
                <Text
                  style={[
                    styles.detailsCellDetail,
                    { padding: "8px", paddingLeft: "20px", width: "55%" },
                  ]}
                >
                  {formData?.ProjectReportSetting?.subsidyName || " "}
                </Text>
              </View>
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
            <Text style={[styles.businessName, { fontSize: "14px" }]}>
              {formData?.AccountInformation?.businessName || "Business Name"}
            </Text>
            <Text style={styles.FinancialYear}>
              {formData?.AccountInformation?.clientName || "Client Name"}
            </Text>
          </View>
        </Page>
      </>
    );
  }
);

export default React.memo(ProjectSynopsis);
