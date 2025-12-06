import React from "react";
import { Page, Text, View } from "@react-pdf/renderer";
import { styles, styleExpenses } from "../../ConsultantPdfComponents/Styles";

const WordGenericSection = ({ formData, pageNumber, sectionKey, title }) => {
  // Get content directly from formData using the sectionKey
  const content = formData?.generatedPDF?.[sectionKey];
  
  console.log(`📖 WordGenericSection [${sectionKey}] checking content:`, {
    hasGeneratedPDF: !!formData?.generatedPDF,
    hasContent: !!content,
    content: content
  });

  if (!content?.text || content.text.trim() === "") {
    return null;
  }

  const displayTitle = title || sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1).replace(/_/g, " ");

  return (
    <Page size="A4" style={styles.page}>
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

        {/* Section Content */}
        <View style={styles.section}>
          <Text style={styles.title}>{displayTitle}</Text>
          <Text  style={{ fontSize: 12 , textAlign:"justify" , lineHeight:"1.5px"}}>{content.text}</Text>
        </View>
        
       
      </View>
    </Page>
  );
};

export default WordGenericSection;