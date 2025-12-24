import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { styles } from "../Styles";
import { getFormData } from "../../Utils/generatedPDFUtils/PDFCaclculationsExportor";

const PDFFooter = () => {
  const formData = getFormData()
  return (
    <>
      {/* businees name and Client Name  */}
      <View
        style={[
          {
            display: "flex",
            flexDirection: "column",
            gap: "80px",
            alignItems: "flex-end",
            justifyContent: "flex-end",
            marginTop: "30px",
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
    </>
  );
};

export default React.memo(PDFFooter);