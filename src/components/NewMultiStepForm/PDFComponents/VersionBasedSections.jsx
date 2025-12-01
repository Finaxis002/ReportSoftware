import React from "react";
import WordIntroduction from "./WordIntroduction";
import WordGenericSection from "./WordGenericSection";

// Define which sections are included in each version (from your EighthStep.jsx)
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
  ],
  "Version 5": [
    { type: "introduction", component: WordIntroduction },
    { type: "scope", component: WordGenericSection, props: { sectionKey: "scope", title: "Scope of the Project" } },
    { type: "market_potential", component: WordGenericSection, props: { sectionKey: "market_potential", title: "Market Potential" } },
    { type: "swot", component: WordGenericSection, props: { sectionKey: "swot", title: "SWOT Analysis" } },
    { type: "products_services", component: WordGenericSection, props: { sectionKey: "products_services", title: "Products and Services" } },
  ]
};

const VersionBasedSections = ({ formData, selectedVersion = "Version 1", startPageNumber = 2 }) => {
  console.log("🎯 VersionBasedSections rendering for version:", selectedVersion);
  
  const sectionsConfig = VERSION_SECTIONS[selectedVersion] || VERSION_SECTIONS["Version 1"];
  
  if (!sectionsConfig || sectionsConfig.length === 0) {
    console.log("❌ No sections configured for version:", selectedVersion);
    return null;
  }

  console.log("📋 Sections to render:", sectionsConfig);

  return sectionsConfig.map((sectionConfig, index) => {
    const { component: Component, props = {} } = sectionConfig;
    
    return (
      <Component
        key={`${sectionConfig.type}-${index}`}
        formData={formData}
        {...props}
      />
    );
  });
};

export default VersionBasedSections;