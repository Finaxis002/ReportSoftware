import React from "react";
import { Page, Text, View } from "@react-pdf/renderer";
import { styles, styleExpenses } from "../../ConsultantPdfComponents/Styles";
import PageWithFooter from "../../../Helpers/PageWithFooter";

const WordIntroduction = ({ formData, pageNumber }) => {
  // Get introduction content directly from formData
  const content = formData?.generatedPDF?.introduction;
  const text = typeof content === 'string' ? content : content?.text || '';

  console.log("📖 WordIntroduction checking content:", {
    hasGeneratedPDF: !!formData?.generatedPDF,
    hasIntroduction: !!content,
    content: content,
    text: text
  });

  if (!text || text.trim() === "") {
    console.log("❌ WordIntroduction: No content found");
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

        {/* Introduction Content */}
        <View style={styles.section}>
          <Text style={styles.title} >Introduction</Text>
          <Text  style={{ fontSize: 12 , textAlign:"justify" , lineHeight:"1.5px" }}>{text}</Text>
        </View>
        
       
      </View>
    </PageWithFooter>
  );
};

export default WordIntroduction;