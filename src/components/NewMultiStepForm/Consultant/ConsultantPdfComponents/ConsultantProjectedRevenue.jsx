import React , {useMemo , useEffect} from "react";
import { Page, View, Text, Image, Font } from "@react-pdf/renderer";
import { styles, stylesCOP, stylesMOF, styleExpenses } from "./Styles";
import SAWatermark from "../../Assets/SAWatermark";
import CAWatermark from "../../Assets/CAWatermark";
import shouldHideFirstYear from "../../PDFComponents/HideFirstYear";

const ConsultantProjectedRevenue = ({
  formData,
  onTotalRevenueUpdate,
  financialYearLabels,
  formatNumber,
  pdfType,
  orientation,
}) => {
  // console.log("revenue", formData.Revenue);
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

  {
    /* ✅ Determine if first year column should be hidden */
  }
  const hideFirstYear = shouldHideFirstYear(totalRevenueReceipts);

  // ✅ Remove first year from financialYearLabels if hiding is required
  const adjustedFinancialYearLabels = hideFirstYear
    ? financialYearLabels.slice(1)
    : financialYearLabels;
  // ✅ Remove first-year revenue if hiding is required

  const adjustedTotalRevenueForOthers = hideFirstYear
    ? formData?.Revenue?.totalRevenueForOthers?.slice(1)
    : formData?.Revenue?.totalRevenueForOthers;

  const adjustedTotalRevenueReceipts = hideFirstYear
    ? totalRevenueReceipts.slice(1)
    : totalRevenueReceipts;

  const isAdvancedLandscape = orientation === "advanced-landscape";
  let splitFinancialYearLabels = [financialYearLabels];
  if (isAdvancedLandscape) {
  // Remove first year if hidden
  const visibleLabels = hideFirstYear ? financialYearLabels.slice(1) : financialYearLabels;
  const totalCols = visibleLabels.length;
  const firstPageCols = Math.ceil(totalCols / 2);
  const secondPageCols = totalCols - firstPageCols;
  splitFinancialYearLabels = [
    visibleLabels.slice(0, firstPageCols),
    visibleLabels.slice(firstPageCols, firstPageCols + secondPageCols),
  ];
}
  const toRoman = (n) =>
    ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"][n] || n + 1;

  if (isAdvancedLandscape) {
    return splitFinancialYearLabels.map((labels, pageIdx) => {
      // labels is the page's array of financial year labels (subset of financialYearLabels)
      const pageStart =
        Math.max(0, financialYearLabels.indexOf(labels[0])) || 0;

      const globalIndex = (localIdx) => pageStart + localIdx;
      const shouldSkipCol = (gIdx) => hideFirstYear && gIdx === 0;

      return (
        <Page
          // size={
          //   formData.ProjectReportSetting.ProjectionYears > 12 ? "A3" : "A4"
          // }
          size="A4"
          orientation="landscape"
          wrap={false}
          break
          style={styles.page}
        >
          {/* watermark */}
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
                  src={
                    pdfType === "Sharda Associates" ? SAWatermark : CAWatermark
                  }
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
                {formData?.AccountInformation?.businessName || "Business Name"}
              </Text>
              <Text style={styles.FinancialYear}>
                Financial Year{" "}
                {formData?.ProjectReportSetting?.FinancialYear
                  ? `${formData.ProjectReportSetting.FinancialYear}-${(
                      parseInt(formData.ProjectReportSetting.FinancialYear) + 1
                    )
                      .toString()
                      .slice(-2)}`
                  : "2025-26"}
              </Text>
            </View>

            {/* <View
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
            </View> */}
            <View>
              <View style={stylesCOP.heading}>
                <Text>
                  Projected Revenue/ Sales
                  {splitFinancialYearLabels.length > 1
                    ? ` (${toRoman(pageIdx)})`
                    : ""}
                </Text>
              </View>
              {/* ✅ Table Rendering Based on `formType` */}
              <View style={[styles.table]}>
                {/* ✅ Table Header */}
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
                  {/* ✅ Generate Dynamic Year Headers from current page labels */}
                  {labels.map((yearLabel, localIdx) => {
                    const gIdx = globalIndex(localIdx);
                    if (shouldSkipCol(gIdx)) return null;
                    return (
                      <Text
                        key={gIdx}
                        style={[styles.particularsCell, stylesCOP.boldText]}
                      >
                        {yearLabel}
                      </Text>
                    );
                  })}
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

                  // ✅ Remove first-year column if required
                  if (hideFirstYear) {
                    updatedYears.shift();
                  }

                  // Set all row type flags
                  const isNormal = item.rowType === "0";
                  const isHeading = item.rowType === "1";
                  const isBold = item.rowType === "2";
                  const isBoldUnderline = item.rowType === "3";
                  const isUnderline = item.rowType === "4";
                  const isTotalFormat = item.rowType === "5";
                  const isShow = item.rowType === "6";

                  const serialNumber =
                    formData?.Revenue?.formFields?.[index]?.serialNumber;
                  const finalSerialNumber =
                    formType === "Others" &&
                    serialNumber !== undefined &&
                    serialNumber !== null
                      ? serialNumber
                      : formType === "Monthly"
                      ? serialNumber || index + 1
                      : "";

                  const isEmptyRow = updatedYears.every(
                    (year) => year === 0 || year === ""
                  );

                  // 🛑 Important: If Show Row → render blank View and return immediately
                  if (isShow) {
                    return (
                      <View
                        key={index}
                        style={[
                          stylesMOF.row,
                          styleExpenses.tableRow,
                          isHeading && styleExpenses.headingRow,
                          isBold && { fontWeight: "bold" }, // for full row bold
                          {borderRightWidth: 1  },
                        ]}
                      >
                        {/* Serial Number */}
                        <Text
                          style={[
                            stylesCOP.serialNoCellDetail,
                            isHeading && styleExpenses.headingText,
                            { borderBottomWidth: "0px" },
                          ]}
                        ></Text>

                        {/* Particular Column */}
                        <Text
                          style={[
                            stylesCOP.detailsCellDetail,
                            styleExpenses.particularWidth,
                            styleExpenses.bordernone,
                            isHeading && styleExpenses.headingText,
                            isBold && { fontWeight: "bold" },
                            isBoldUnderline && {
                              fontWeight: "bold",
                              textDecoration: "underline",
                            },
                            isUnderline && { textDecoration: "underline" }, // only underline
                            {
                              borderBottomWidth: "0px",
                              paddingTop: 6,
                              paddingBottom: 6,
                            },
                          ]}
                        ></Text>

                        {/* Year Values (blank cells, page-aligned) */}
                        {labels.map((_, localIdx) => {
                          const gIdx = globalIndex(localIdx);
                          if (shouldSkipCol(gIdx)) return null;
                          return (
                            <Text
                              key={gIdx}
                              style={[
                                stylesCOP.particularsCellsDetail,
                                styleExpenses.fontSmall,
                                isBold && { fontWeight: "bold" },
                                isHeading && {
                                  color: "black",
                                  fontWeight: "bold",
                                  textAlign: "center",
                                },
                                isTotalFormat && {
                                  fontWeight: "bold",
                                  textAlign: "center",
                                  borderTopWidth: 1,
                                  borderBottomWidth: 1,
                                  paddingTop: 2,
                                  paddingBottom: 2,
                                },
                                {
                                  borderBottomWidth: "0px",
                                  borderRightWidth: 1,
                                },
                              ]}
                            ></Text>
                          );
                        })}
                      </View>
                    );
                  }

                  // 🛠️ Now Normal Rows Render
                  return (
                    <View
                      key={index}
                      style={[
                        stylesMOF.row,
                        styleExpenses.tableRow,
                        isHeading && styleExpenses.headingRow,
                        isBold && { fontWeight: "bold" }, // for full row bold
                        { borderBottomWidth: "0px" },
                      ]}
                    >
                      {/* Serial Number */}
                      <Text
                        style={[
                          stylesCOP.serialNoCellDetail,
                          isHeading && styleExpenses.headingText,
                          { borderBottomWidth: "0px" },
                        ]}
                      >
                        {finalSerialNumber}
                      </Text>

                      {/* Particular Column */}
                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                          isHeading && styleExpenses.headingText,
                          isBold && { fontWeight: "bold" },
                          isBoldUnderline && {
                            fontWeight: "bold",
                            textDecoration: "underline",
                          },
                          isUnderline && { textDecoration: "underline" }, // only underline
                          { borderBottomWidth: "0px" },
                          isTotalFormat && { fontWeight: "bold" },
                        ]}
                      >
                        {item.particular}
                      </Text>

                      {/* Year Values (page-aligned using labels/gIdx) */}
                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        if (shouldSkipCol(gIdx)) return null;

                        const yearValue =
                          item.years && item.years[gIdx] !== undefined
                            ? item.years[gIdx]
                            : 0;

                        return (
                          <Text
                            key={gIdx}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                              isBold && { fontWeight: "bold" },
                              isHeading && {
                                color: "black",
                                fontWeight: "bold",
                                textAlign: "center",
                              },
                              isTotalFormat && {
                                fontWeight: "bold",
                                textAlign: "center",
                                borderTopWidth: 1,
                                borderBottomWidth: 0,
                              },
                            ]}
                          >
                            {/* If heading and empty row, blank text */}
                            {isEmptyRow
                              ? ""
                              : typeof yearValue === "string" &&
                                yearValue.trim().endsWith("%")
                              ? yearValue
                              : formatNumber(yearValue)}
                          </Text>
                        );
                      })}
                    </View>
                  );
                })}

                {/* ✅ Show No. of Months in each year column for Monthly form */}
                {formType?.trim() === "Monthly" &&
                  Array.isArray(formData?.Revenue?.noOfMonths) && (
                    <View
                      style={[
                        stylesMOF.row,
                        styleExpenses.totalRow,
                        { borderBottomWidth: 0 },
                      ]}
                    >
                      <Text style={[stylesCOP.serialNoCellDetail]}></Text>

                      <Text
                        style={[
                          stylesCOP.detailsCellDetail,
                          styleExpenses.particularWidth,
                          styleExpenses.bordernone,
                          { paddingLeft: 10 },
                        ]}
                      >
                        Number of Months
                      </Text>

                      {labels.map((_, localIdx) => {
                        const gIdx = globalIndex(localIdx);
                        if (shouldSkipCol(gIdx)) return null;
                        const monthValue =
                          formData.Revenue.noOfMonths?.[gIdx] ?? "";
                        return (
                          <Text
                            key={gIdx}
                            style={[
                              stylesCOP.particularsCellsDetail,
                              styleExpenses.fontSmall,
                              { textAlign: "center", borderTopWidth: 1 },
                            ]}
                          >
                            {monthValue}
                          </Text>
                        );
                      })}
                    </View>
                  )}

                {/* ✅ Compute & Display Revenue Based on formType */}
                <View
                  style={[
                    stylesMOF.row,
                    styleExpenses.totalRow,
                    { borderBottomWidth: 0 },
                  ]}
                >
                  <Text style={[stylesCOP.serialNoCellDetail]}></Text>

                  {/* ✅ Conditional Label Based on formType */}
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      { fontWeight: "bold", paddingLeft: 10 },
                    ]}
                  >
                    {formType?.trim() === "Monthly"
                      ? "Total Monthly Revenue"
                      : "Total Revenue From Operations"}
                  </Text>

                  {/* ✅ Display Correct Revenue Based on formType — page-aligned */}
                  {labels.map((_, localIdx) => {
                    const gIdx = globalIndex(localIdx);
                    if (shouldSkipCol(gIdx)) return null;

                    // adjusted arrays are usually shifted when hideFirstYear is true
                    const adjustedIdx = hideFirstYear ? gIdx - 1 : gIdx;

                    const value =
                      formType?.trim() === "Monthly"
                        ? adjustedTotalRevenueReceipts?.[adjustedIdx] ?? 0
                        : adjustedTotalRevenueForOthers?.[adjustedIdx] ?? 0;

                    return (
                      <Text
                        key={gIdx}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                          {
                            textAlign: "center",
                            fontWeight: "bold",
                            borderWidth: 1,
                            borderBottom: 0,
                            borderLeftWidth: 0,
                          },
                        ]}
                      >
                        {formatNumber(value)}
                      </Text>
                    );
                  })}
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
    });
  }

  return (
    <Page
      // size={formData.ProjectReportSetting.ProjectionYears > 12 ? "A3" : "A4"}
     size="A4"
      orientation={orientation}
      wrap={false}
      break
      style={styles.page}
    >
      {/* watermark */}
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
            {formData?.AccountInformation?.businessName || "Business Name"}
          </Text>
          <Text style={styles.FinancialYear}>
            Financial Year{" "}
            {formData?.ProjectReportSetting?.FinancialYear
              ? `${formData.ProjectReportSetting.FinancialYear}-${(
                  parseInt(formData.ProjectReportSetting.FinancialYear) + 1
                )
                  .toString()
                  .slice(-2)}`
              : "2025-26"}
          </Text>
        </View>

        {/* <View
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
        </View> */}
        <View>
          <View style={stylesCOP.heading}>
            <Text>Projected Revenue/ Sales</Text>
          </View>
          {/* ✅ Table Rendering Based on `formType` */}
          <View style={[styles.table]}>
            {/* ✅ Table Header */}
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
              {/* ✅ Generate Dynamic Year Headers, skipping first year if needed */}
              {adjustedFinancialYearLabels.map((yearLabel, yearIndex) => (
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

              // ✅ Remove first-year column if required
              if (hideFirstYear) {
                updatedYears.shift();
              }

              // Set all row type flags
              const isNormal = item.rowType === "0";
              const isHeading = item.rowType === "1";
              const isBold = item.rowType === "2";
              const isBoldUnderline = item.rowType === "3";
              const isUnderline = item.rowType === "4";
              const isTotalFormat = item.rowType === "5";
              const isShow = item.rowType === "6";

              const serialNumber =
                formData?.Revenue?.formFields?.[index]?.serialNumber;
              const finalSerialNumber =
                formType === "Others" &&
                serialNumber !== undefined &&
                serialNumber !== null
                  ? serialNumber
                  : formType === "Monthly"
                  ? serialNumber || index + 1
                  : "";

              const isEmptyRow = updatedYears.every(
                (year) => year === 0 || year === ""
              );

              // 🛑 Important: If Show Row → render blank View and return immediately
              if (isShow) {
                return (
                  <View
                    key={index}
                    style={[
                      stylesMOF.row,
                      styleExpenses.tableRow,
                      isHeading && styleExpenses.headingRow,
                      isBold && { fontWeight: "bold" }, // for full row bold
                      { borderBottomWidth: "0px" },
                    ]}
                  >
                    {/* Serial Number */}
                    <Text
                      style={[
                        stylesCOP.serialNoCellDetail,
                        isHeading && styleExpenses.headingText,
                        { borderBottomWidth: "0px" },
                      ]}
                    ></Text>

                    {/* Particular Column */}
                    <Text
                      style={[
                        stylesCOP.detailsCellDetail,
                        styleExpenses.particularWidth,
                        styleExpenses.bordernone,
                        isHeading && styleExpenses.headingText,
                        isBold && { fontWeight: "bold" },
                        isBoldUnderline && {
                          fontWeight: "bold",
                          textDecoration: "underline",
                        },
                        isUnderline && { textDecoration: "underline" }, // only underline
                        {
                          borderBottomWidth: "0px",
                          paddingTop: 6,
                          paddingBottom: 6,
                        },
                      ]}
                    ></Text>

                    {/* Year Values */}
                    {updatedYears.map((yearValue, yearIndex) => (
                      <Text
                        key={yearIndex}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                          isBold && { fontWeight: "bold" },
                          isHeading && {
                            color: "black",
                            fontWeight: "bold",
                            textAlign: "center",
                          },
                          isTotalFormat && {
                            fontWeight: "bold",
                            textAlign: "center",
                            borderTopWidth: 1,
                            borderBottomWidth: 1,
                            paddingTop: 2,
                            paddingBottom: 2,
                          },
                          { borderBottomWidth: "0px", borderRightWidth: 0 }, // default bottom (overridden if Total)
                        ]}
                      ></Text>
                    ))}
                  </View>
                );
              }

              // 🛠️ Now Normal Rows Render
              return (
                <View
                  key={index}
                  style={[
                    stylesMOF.row,
                    styleExpenses.tableRow,
                    isHeading && styleExpenses.headingRow,
                    isBold && { fontWeight: "bold" }, // for full row bold
                    { borderBottomWidth: "0px" },
                  ]}
                >
                  {/* Serial Number */}
                  <Text
                    style={[
                      stylesCOP.serialNoCellDetail,
                      isHeading && styleExpenses.headingText,
                      { borderBottomWidth: "0px" },
                    ]}
                  >
                    {finalSerialNumber}
                  </Text>

                  {/* Particular Column */}
                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                      isHeading && styleExpenses.headingText,
                      isBold && { fontWeight: "bold" },
                      isBoldUnderline && {
                        fontWeight: "bold",
                        textDecoration: "underline",
                      },
                      isUnderline && { textDecoration: "underline" }, // only underline
                      { borderBottomWidth: "0px" },
                      isTotalFormat && { fontWeight: "bold" },
                    ]}
                  >
                    {item.particular}
                  </Text>

                  {/* Year Values */}
                  {updatedYears.map((yearValue, yearIndex) => (
                    <Text
                      key={yearIndex}
                      style={[
                        stylesCOP.particularsCellsDetail,
                        styleExpenses.fontSmall,
                        isBold && { fontWeight: "bold" },
                        isHeading && {
                          color: "black",
                          fontWeight: "bold",
                          textAlign: "center",
                        },
                        isTotalFormat && {
                          fontWeight: "bold",
                          textAlign: "center",
                          borderTopWidth: 1,
                          borderBottomWidth: 0,
                        },
                      ]}
                    >
                      {/* If heading and empty row, blank text */}
                      {isEmptyRow
                        ? ""
                        : typeof yearValue === "string" &&
                          yearValue.trim().endsWith("%")
                        ? yearValue
                        : formatNumber(yearValue)}
                    </Text>
                  ))}
                </View>
              );
            })}

            {/* ✅ Show No. of Months in each year column for Monthly form */}
            {formType?.trim() === "Monthly" &&
              Array.isArray(formData?.Revenue?.noOfMonths) && (
                <View
                  style={[
                    stylesMOF.row,
                    styleExpenses.totalRow,
                    { borderBottomWidth: 0 },
                  ]}
                >
                  <Text style={[stylesCOP.serialNoCellDetail]}></Text>

                  <Text
                    style={[
                      stylesCOP.detailsCellDetail,
                      styleExpenses.particularWidth,
                      styleExpenses.bordernone,
                      { paddingLeft: 10 },
                    ]}
                  >
                    Number of Months
                  </Text>

                  {formData.Revenue.noOfMonths
                    .slice(hideFirstYear ? 1 : 0) // ✅ Skip first year if needed
                    .map((monthValue, yearIndex) => (
                      <Text
                        key={yearIndex}
                        style={[
                          stylesCOP.particularsCellsDetail,
                          styleExpenses.fontSmall,
                          { textAlign: "center", borderTopWidth: 1 },
                        ]}
                      >
                        {monthValue}
                      </Text>
                    ))}
                </View>
              )}

            {/* ✅ Compute & Display Revenue Based on formType */}
            <View
              style={[
                stylesMOF.row,
                styleExpenses.totalRow,
                { borderBottomWidth: 0 },
              ]}
            >
              <Text style={[stylesCOP.serialNoCellDetail]}></Text>

              {/* ✅ Conditional Label Based on formType */}
              <Text
                style={[
                  stylesCOP.detailsCellDetail,
                  styleExpenses.particularWidth,
                  { fontWeight: "bold", paddingLeft: 10 },
                ]}
              >
                {formType?.trim() === "Monthly"
                  ? "Total Monthly Revenue"
                  : "Total Revenue From Operations"}
              </Text>

              {/* ✅ Display Correct Revenue Based on formType */}
              {adjustedTotalRevenueReceipts.map((_, yearIndex) => (
                <Text
                  key={yearIndex}
                  style={[
                    stylesCOP.particularsCellsDetail,
                    styleExpenses.fontSmall,
                    {
                      textAlign: "center",
                      fontWeight: "bold",
                      borderWidth: 1,
                      borderBottom: 0,
                      borderLeftWidth: 0,
                    },
                  ]}
                >
                  {
                    formType?.trim() === "Monthly"
                      ? formatNumber(
                          adjustedTotalRevenueReceipts[yearIndex] || 0
                        ) // Monthly revenue
                      : formatNumber(
                          adjustedTotalRevenueForOthers?.[yearIndex] || 0
                        ) // Others revenue
                  }
                </Text>
              ))}
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

export default React.memo(ConsultantProjectedRevenue);
