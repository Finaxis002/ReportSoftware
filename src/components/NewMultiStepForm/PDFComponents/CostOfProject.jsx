import React from "react";
import { Page, View, Text } from "@react-pdf/renderer";
import { styles, stylesCOP, styleExpenses, stylesMOF } from "./Styles"; // Import only necessary styles

const CostOfProject = ({ formData, localData }) => {
  return (
    <Page size="A4" style={stylesCOP.styleCOP}>
      <Text style={styles.clientName}>{localData.clientName}</Text>
      <View style={stylesCOP.heading}>
        <Text>Cost Of Project</Text>
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.serialNoCell}>S.No.</Text>
          <Text style={styles.detailsCell}>Particulars</Text>
          <Text style={styles.particularsCell}>Amount</Text>
        </View>

        {formData.CostOfProject &&
          Object.entries(formData.CostOfProject).map(([key, field], index) => (
            <View key={key} style={styles.tableRow}>
              <Text style={stylesCOP.serialNoCellDetail}>{index + 1}</Text>
              <Text style={stylesCOP.detailsCellDetail}>{field.name}</Text>
              <Text style={stylesCOP.particularsCellsDetail}>
                {new Intl.NumberFormat("en-IN").format(field.amount)}
              </Text>
            </View>
          ))}

        <View style={stylesCOP.totalHeader}>
          <Text style={stylesCOP.serialNoCellDetail}></Text>
          <Text style={[stylesCOP.detailsCellDetail, stylesCOP.boldText]}>
            Total Cost of Project
          </Text>
          <Text style={[stylesCOP.particularsCellsDetail, stylesCOP.boldText]}>
            {new Intl.NumberFormat("en-IN").format(
              Object.values(formData.CostOfProject).reduce(
                (sum, field) => sum + field.amount,
                0
              )
            )}
          </Text>
        </View>
      </View>
    </Page>
  );
};

export default CostOfProject;
