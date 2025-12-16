import React from "react";
import WordIntroduction from "./WordIntroduction";
import WordGenericSection from "./WordGenericSection";

// Define which sections are included in each version
const VERSION_SECTIONS = {
  "Version 1": [
    { type: "introduction", component: WordIntroduction },
  ],
  "Version 2": [
    { type: "introduction", component: WordIntroduction },
  ],
  "Version 3": [
    { type: "introduction", component: WordIntroduction },
    { type: "scope", component: WordGenericSection, props: { sectionKey: "scope", title: "Scope of the Project" } },
  ],
  "Version 4": [
    { type: "introduction", component: WordIntroduction },
    { type: "scope", component: WordGenericSection, props: { sectionKey: "scope", title: "Scope of the Project" } },
    { type: "market_potential", component: WordGenericSection, props: { sectionKey: "market_potential", title: "Market Potential" } },
   { type: "swot", component: WordGenericSection, props: { sectionKey: "swot", title: "SWOT Analysis" } },
  ],
  "Version 5": [
    { type: "introduction", component: WordIntroduction },
    { type: "scope", component: WordGenericSection, props: { sectionKey: "scope", title: "Scope of the Project" } },
    { type: "market_potential", component: WordGenericSection, props: { sectionKey: "market_potential", title: "Market Potential" } },
    { type: "swot", component: WordGenericSection, props: { sectionKey: "swot", title: "SWOT Analysis" } },
    { type: "products_services", component: WordGenericSection, props: { sectionKey: "products_services", title: "Products and Services" } },
  ]
};

const VersionBasedSections = ({ formData }) => {
  // Get version directly from formData
  const selectedVersion = localStorage.getItem("selectedConsultantReportVersion");
  
  console.log("🎯 VersionBasedSections - formData version:", selectedVersion);
  console.log("📊 formData.generatedPDF:", formData?.generatedPDF);
  
  const sectionsConfig = VERSION_SECTIONS[selectedVersion] || VERSION_SECTIONS["Version 1"];
  
  if (!sectionsConfig || sectionsConfig.length === 0) {
    console.log("❌ No sections configured for version:", selectedVersion);
    return null;
  }

  console.log("📋 Sections to render for version", selectedVersion, ":", sectionsConfig.map(s => s.type));

  return sectionsConfig.map((sectionConfig, index) => {
    const { component: Component, props = {} } = sectionConfig;
    
    // For WordGenericSection, check if the section content exists in formData
    if (sectionConfig.type !== "introduction") {
      const sectionKey = props.sectionKey;
      const sectionContent = formData?.generatedPDF?.[sectionKey];
      const text = typeof sectionContent === 'string' ? sectionContent : sectionContent?.text || '';

      // Log for debugging
      console.log(`Checking section ${sectionKey}:`, sectionContent ? "Content exists" : "No content");

      // If section content doesn't exist or is empty, don't render this section
      if (!text || text.trim() === "") {
        console.log(`⚠️ Section ${sectionKey} has no content, skipping`);
        return null;
      }
    } else {
      // For introduction, check if it exists
      const introductionContent = formData?.generatedPDF?.introduction;
      const introText = typeof introductionContent === 'string' ? introductionContent : introductionContent?.text || '';
      if (!introText || introText.trim() === "") {
        console.log(`⚠️ Introduction has no content, skipping`);
        return null;
      }
    }
    
    return (
      <Component
        key={`${sectionConfig.type}-${index}`}
        formData={formData}
        {...props}
      />
    );
  }).filter(Boolean); // Remove null values (skipped sections)
};

export default VersionBasedSections;