import React from "react";
import { Page, View, Text } from "@react-pdf/renderer";
import { styles, stylesCOP, stylesMOF, styleExpenses } from "./Styles"; // Import only necessary styles
import { Font } from "@react-pdf/renderer";

const ProjectedSalaries = ({
  localData,
  normalExpense,
  formatAmountInIndianStyle,
  totalQuantity,
  totalAnnualWages,
  fringeCalculation,
  fringAndAnnualCalculation
}) => {
  return (
    <Page size="A4" style={stylesCOP.styleCOP}>
      <Text style={styles.clientName}>{localData.clientName}</Text>
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
          <View key={index} style={styles.tableRow}>
            <Text style={[stylesCOP.serialNoCellDetail, stylesCOP.textCenter]}>
              {index + 1}
            </Text>

            <Text
              style={[stylesCOP.particularsCellsDetail, stylesCOP.textCenter]}
            >
              {expense.name || "N/A"}
            </Text>
            <Text
              style={[stylesCOP.particularsCellsDetail, stylesCOP.textCenter]}
            >
              {expense.quantity || "0"}
            </Text>
            <Text
              style={[stylesCOP.particularsCellsDetail, stylesCOP.textCenter]}
            >
              {new Intl.NumberFormat("en-IN").format(expense.amount || 0)}
            </Text>
            <Text
              style={[stylesCOP.particularsCellsDetail, stylesCOP.textCenter]}
            >
              {" "}
              {formatAmountInIndianStyle(
                expense.amount * expense.quantity * 12
              )}
            </Text>
          </View>
        ))}

        <View style={styles.tableRow}>
          <Text style={stylesCOP.serialNoCellDetail}></Text>

          <Text
            style={[stylesCOP.particularsCellsDetail, stylesCOP.textCenter]}
          >
            Total
          </Text>
          <Text
            style={[
              stylesCOP.particularsCellsDetail,
              stylesCOP.textCenter,
              stylesCOP.boldText,
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
            ]}
          >
            {formatAmountInIndianStyle(totalAnnualWages)}
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
            ]}
          >
            Add: Fringe Benefits @ 5 %
          </Text>
          <Text
            style={[
              stylesCOP.particularsCellsDetail,
              stylesCOP.textCenter,
              stylesCOP.verticalPadding,
            ]}
          >
            {" "}
            {formatAmountInIndianStyle(fringeCalculation)}
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
              stylesCOP.verticalPadding,
            ]}
          >
            {" "}
            Total Wages during the year
          </Text>

          <Text
            style={[
              stylesCOP.particularsCellsDetail,
              stylesCOP.textCenter,
              stylesCOP.boldText,
              stylesCOP.verticalPadding,
            ]}
          >
            {" "}
            {formatAmountInIndianStyle(fringAndAnnualCalculation)}
          </Text>
        </View>
      </View>
    </Page>
  );
};

export default ProjectedSalaries;
