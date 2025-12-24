import React from "react";
import { View, Text, Image } from "@react-pdf/renderer";
import { styles } from "../Styles";
import SAWatermark from "../../Assets/SAWatermark";
import CAWatermark from "../../Assets/CAWatermark";
import { getFormData , getPdfType} from "../../Utils/generatedPDFUtils/PDFCaclculationsExportor";

const PDFHeader = () => {
  const pdfType = getPdfType();
  const formData = getFormData();
  return (
    <>
      {/* watermark  */}
      <View style={{ position: "absolute", left: 50, top: 0, zIndex: -1 }}>
        {/* ✅ Conditionally Render Watermark */}
        {pdfType &&
          pdfType !== "select option" &&
          (pdfType === "Sharda Associates" || pdfType === "CA Certified") && (
            <View
              style={{
                position: "absolute",
                left: 50, // Center horizontally
                top: "50%", // Center vertically
                // transform: "translate(-50%, -50%)", // Adjust position to center
                zIndex: -1, // Ensure it's behind the content
              }}
            >
              <Image
                src={
                  pdfType === "Sharda Associates" ? SAWatermark : CAWatermark
                }
                style={{
                  width: "400px", 
                  height: "600px",
                  opacity: 0.2, 
                }}
              />
            </View>
          )}
      </View>
      {/* businees name and financial year  */}
      <View>
        <Text style={styles.businessName}>
          {formData?.AccountInformation?.businessName || "Business Bame"}
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

      {/* Amount format */}
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
    </>
  );
};

export default React.memo(PDFHeader);