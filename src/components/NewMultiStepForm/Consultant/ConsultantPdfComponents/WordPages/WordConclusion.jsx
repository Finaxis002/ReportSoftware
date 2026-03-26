import React from "react";
import { Page, Text, View } from "@react-pdf/renderer";
import { styles, styleExpenses } from "../../ConsultantPdfComponents/Styles";
import PageWithFooter from "../../../Helpers/PageWithFooter";

const WordConclusion = ({ formData, pageNumber }) => {
  // Get conclusion content directly from formData
  const content = formData?.generatedPDF?.conclusion;
  const text = typeof content === 'string' ? content : content?.text || '';

  console.log("📖 WordConclusion checking content:", {
    hasGeneratedPDF: !!formData?.generatedPDF,
    hasConclusion: !!content,
    content: content,
    text: text
  });

  if (!text || text.trim() === "") {
    console.log("❌ WordConclusion: No content found");
    return null;
  }

  return (
   <PageWithFooter size="A4" orientation="portrait" >
      <View style={styleExpenses?.paddingx}>
        {/* Header */}
        <View>
          <Text style={styles.businessName}>
            {formData?.AccountInformation?.businessName || "Business Name"}
          </Text>
          <Text style={styles.FinancialYear}>
            Financial Year{" "}
            {formData?.ProjectReportSetting?.FinancialYear
              ? `${formData.ProjectReportSetting.FinancialYear}-${(
                parseInt(formData.ProjectReportSetting.FinancialYear) + 1
              ).toString()}`
              : "2025-26"}
          </Text>
        </View>

        {/* Conclusion Content */}
        <View style={styles.section}>
          <Text style={styles.title}>Conclusion</Text>
          <Text  style={{ fontSize: 12 , textAlign:"justify" , lineHeight:"1.5px" }}>{text}</Text>
        </View>
        
       
      </View>
    </PageWithFooter>
  );
};

export default WordConclusion;