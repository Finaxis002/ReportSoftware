import React from "react";
import { Page, View, Text, Image } from "@react-pdf/renderer"; // Ensure Image is imported
import { styles, stylesCOP, stylesMOF, styleExpenses } from "./Styles";
import watermarkImage from "../Assets/SAWatermark.jpg"; // Ensure correct path

const BasicDetails = ({ formData, selectedOption }) => {
  return (
    <Page size="A4" style={styles.page}>
      {/* Watermark Image */}
      {selectedOption === "Sharda Associates" && (
        <Image
          src={watermarkImage}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            opacity: 0.1, // Light watermark
            zIndex: -1, // Ensure it is in the background
          }}
          fixed // Ensures it's placed on every page
        />
      )}

      <View>
        <Text style={styles.title}>Project Synopsis</Text>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.serialNoCell}>S. No.</Text>
            <Text style={styles.particularsCell}>Particulars</Text>
            <Text style={styles.separatorCell}>:</Text>
            <Text style={styles.detailsCell}>Details</Text>
          </View>

          {Object.entries(formData.AccountInformation).map(
            ([key, value], index) => {
              if (key === "allPartners" || key === "_id" || key === "__v") {
                return null;
              }
              return (
                <View style={styles.tableRow} key={index}>
                  <Text style={styles.serialNoCellDetail}>{index + 1}</Text>
                  <Text style={styles.particularsCellsDetail}>{key}</Text>
                  <Text style={styles.separatorCellDetail}>:</Text>
                  <Text style={styles.detailsCellDetail}>
                    {typeof value === "object"
                      ? JSON.stringify(value)
                      : String(value)}
                  </Text>
                </View>
              );
            }
          )}
        </View>

        {formData.AccountInformation.allPartners && (
          <View style={styles.partnersSection}>
            <Text style={styles.partnersTitle}>Partners Details</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.partnerCell}>S. No.</Text>
                <Text style={styles.partnerCell}>Partner Name</Text>
                <Text style={styles.partnerCell}>Partner Aadhar</Text>
                <Text style={styles.partnerCell}>Partner DIN</Text>
              </View>

              {formData.AccountInformation.allPartners.map((partner, idx) => (
                <View style={styles.tableRow} key={idx}>
                  <Text style={styles.partnerCellDetail}>{idx + 1}</Text>
                  <Text style={styles.partnerCellDetail}>
                    {partner.partnerName}
                  </Text>
                  <Text style={styles.partnerCellDetail}>
                    {partner.partnerAadhar}
                  </Text>
                  <Text style={styles.partnerCellDetail}>
                    {partner.partnerDin}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </Page>
  );
};

export default BasicDetails;
