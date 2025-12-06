import React from "react";
import { Page, Text, View } from "@react-pdf/renderer";
import { styles, styleExpenses } from "../../ConsultantPdfComponents/Styles";

const WordIntroduction = ({ formData, pageNumber }) => {
  // Get introduction content directly from formData
  const content = formData?.generatedPDF?.introduction;
  
  console.log("📖 WordIntroduction checking content:", {
    hasGeneratedPDF: !!formData?.generatedPDF,
    hasIntroduction: !!content,
    content: content
  });

  if (!content || content.trim() === "") {
    console.log("❌ WordIntroduction: No content found");
    return null;
  }

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
        
        {/* Introduction Content */}
        <View style={styles.section}>
          <Text style={styles.title} >Introduction</Text>
          <Text  style={{ fontSize: 13 , textAlign:"justify" , lineHeight:"1.5px" }}>{content}</Text>
        </View>
        
       
      </View>
    </Page>
  );
};

export default WordIntroduction;