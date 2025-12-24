import React from "react";
import { Page, View, Text } from "@react-pdf/renderer";
import { styles, stylesCOP } from "./Styles"; // Import only necessary styles
import PDFHeader from "./HeaderFooter/PDFHeader";
import PDFFooter from "./HeaderFooter/PDFFooter";

const ProjectedSalaries = ({
  normalExpense,
  totalQuantity,
  totalAnnualWages,
  fringeCalculation,
  fringAndAnnualCalculation,
  formatNumber,
}) => {
  return (
    <Page size="A4" style={styles.page}>
      <PDFHeader />
      <View style={stylesCOP.heading}>
        <Text>Projected Salaries & Wages</Text>
      </View>

      <View style={styles.table}>
        <View style={[styles.tableHeader]}>
          <Text style={styles.serialNoCell}>S.No.</Text>
          <Text style={[styles.particularsCell, stylesCOP.textCenter]}>
            Type Of Worker
          </Text>
          <Text style={[styles.particularsCell, stylesCOP.textCenter]}>
            No. of Workers{" "}
          </Text>
          <Text style={[styles.particularsCell, stylesCOP.textCenter]}>
            Wages per month
          </Text>
          <Text style={[styles.particularsCell, stylesCOP.textCenter]}>
            Annual Wages & Salaries
          </Text>
        </View>
        {normalExpense.map((expense, index) => (
          <View
            key={index}
            style={[
              styles.tableRow,
              // index === 0 && { paddingTop: 20 }, // ✅ Padding for the first element
              // index === normalExpense.length - 1 && { paddingBottom: 15 }, // ✅ Padding for the last element
            ]}
          >
            <Text
              style={[
                stylesCOP.serialNoCellDetail,
                stylesCOP.textCenter,
                index === 0 && { paddingTop: 20 },
                index === normalExpense.length - 1 && { paddingBottom: 20 },
              ]}
            >
              {index + 1}
            </Text>

            <Text
              style={[
                stylesCOP.particularsCellsDetail,
                stylesCOP.textCenter,
                index === 0 && { paddingTop: 20 },
                index === normalExpense.length - 1 && { paddingBottom: 20 },
                { textAlign: "left" },
              ]}
            >
              {expense.name || "N/A"}
            </Text>
            <Text
              style={[
                stylesCOP.particularsCellsDetail,
                stylesCOP.textCenter,
                index === 0 && { paddingTop: 20 },
                index === normalExpense.length - 1 && { paddingBottom: 20 },
              ]}
            >
              {expense.quantity || "0"}
            </Text>
            <Text
              style={[
                stylesCOP.particularsCellsDetail,
                stylesCOP.textCenter,
                index === 0 && { paddingTop: 20 },
                index === normalExpense.length - 1 && { paddingBottom: 20 },
              ]}
            >
              {formatNumber(expense.amount || 0)}
            </Text>
            <Text
              style={[
                stylesCOP.particularsCellsDetail,
                stylesCOP.textCenter,
                { borderRight: 0 },
                index === 0 && { paddingTop: 20 },
                index === normalExpense.length - 1 && { paddingBottom: 20 },
              ]}
            >
              {formatNumber(expense.value)}
            </Text>
          </View>
        ))}

        <View style={styles.tableRow}>
          <Text style={stylesCOP.serialNoCellDetail}></Text>

          <Text
            style={[
              stylesCOP.particularsCellsDetail,
              stylesCOP.textCenter,
              styles.Total,
              { textAlign: "left" },
            ]}
          >
            Total
          </Text>
          <Text
            style={[
              stylesCOP.particularsCellsDetail,
              stylesCOP.textCenter,
              stylesCOP.boldText,
              { borderTop: "1px solid #000", borderBottom: "1px solid #000" },
            ]}
          >
            {totalQuantity}
          </Text>
          <Text
            style={[stylesCOP.particularsCellsDetail, stylesCOP.textCenter]}
          ></Text>
          <Text
            style={[
              stylesCOP.particularsCellsDetail,
              stylesCOP.textCenter,
              stylesCOP.boldText,
              { borderTop: "1px solid #000", borderBottom: "1px solid #000", borderRightWidth: 0 },
            ]}
          >
            {formatNumber(totalAnnualWages)}
          </Text>
        </View>

        <View style={styles.tableRow}>
          <Text style={stylesCOP.serialNoCellDetail}></Text>

          <Text
            style={[stylesCOP.particularsCellsDetail, stylesCOP.textCenter]}
          ></Text>
          <Text
            style={[stylesCOP.particularsCellsDetail, stylesCOP.textCenter]}
          ></Text>
          <Text
            style={[
              stylesCOP.particularsCellsDetail,
              stylesCOP.textCenter,
              stylesCOP.verticalPadding,
              { paddingHorizontal: "1px" },
            ]}
          >
            Add: Fringe Benefits @ 5 %
          </Text>
          <Text
            style={[
              stylesCOP.particularsCellsDetail,
              stylesCOP.textCenter,
              stylesCOP.verticalPadding,
              { borderRight: 0, }
            ]}
          >
            {" "}
            {formatNumber(fringeCalculation)}
          </Text>
        </View>

        <View style={styles.tableRow}>
          <Text style={stylesCOP.serialNoCellDetail}></Text>

          <Text
            style={[stylesCOP.particularsCellsDetail, stylesCOP.textCenter]}
          ></Text>
          <Text
            style={[
              stylesCOP.particularsCellsDetail,
              stylesCOP.textCenter,
              stylesCOP.boldText,
              stylesCOP.extraWidth,
              styles.Total,
              {
                borderTopWidth: "1px",
                fontSize: "10px",
                paddingVertical: "6px",
                width: "110%",
                borderBottomWidth: 0,
              },
            ]}
          >
            {" "}
            Total Wages during the year
          </Text>

          <Text
            style={[
              stylesCOP.particularsCellsDetail,
              stylesCOP.textCenter,
              { borderTopWidth: 1, borderBottomWidth: 0, borderRightWidth: 0 }
            ]}
          >
            {" "}
            {formatNumber(fringAndAnnualCalculation)}
          </Text>
        </View>
      </View>

      <PDFFooter />

    </Page>
  );
};

export default React.memo(ProjectedSalaries);
