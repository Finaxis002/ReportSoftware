import React from "react";
import { Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { styles, stylesCOP, stylesMOF, styleExpenses } from "./Styles";

// const styles = StyleSheet.create({
//   page: {
//     padding: 40,
//     fontSize: 12,
//     fontFamily: "Helvetica",
//   },
//   title: {
//     fontSize: 16,
//     fontWeight: "bold",
//     marginBottom: 15,
//     textAlign: "center",
//     color: "#1f2937",
//     borderBottom: "2px solid #3b82f6",
//     paddingBottom: 8,
//   },
//   content: {
//     fontSize: 11,
//     lineHeight: 1.5,
//     textAlign: "justify",
//   },
//   section: {
//     marginBottom: 20,
//   },
//   pageNumber: {
//     position: "absolute",
//     bottom: 20,
//     right: 40,
//     fontSize: 10,
//     color: "#666",
//   }
// });

const GeneratedSections = ({ generatedPDF, startPageNumber = 1 ,formData, pdfType,}) => {
  console.log("📄 GeneratedSections received generatedPDF:", generatedPDF);
  
  if (!generatedPDF || typeof generatedPDF !== "object" || Object.keys(generatedPDF).length === 0) {
    console.log("❌ No generatedPDF data available");
    return null;
  }

  const sections = Object.entries(generatedPDF).filter(([_, content]) => {
    const isValid = content && typeof content === "string" && content.trim() !== "";
    console.log(`🔍 Section "${_[0]}" validation:`, isValid);
    return isValid;
  });

  console.log("✅ Filtered sections:", sections);

  if (sections.length === 0) {
    console.log("❌ No valid sections after filtering");
    return null;
  }

  return (
    <>
     <Page size="A4" style={styles.page}>
      <View style={styleExpenses?.paddingx}>
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
       {sections.map(([key, content], index) => {
        console.log(`📝 Rendering section "${key}":`, content);
        const title = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ");
        
        return (
         <View>
            <View style={styles.section}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.content}>{content}</Text> {/* THIS LINE RENDERS THE CONTENT */}
            </View>
            <Text style={styles.pageNumber}>
              Page {startPageNumber + index}
            </Text>
          </View>
        );
      })}
      </View>
     </Page>
     
    </>
  );
};

export default GeneratedSections;