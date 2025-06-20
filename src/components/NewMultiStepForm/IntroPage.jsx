// import React, { useState } from "react";
// import ReportDropdown from "./Dropdown/ReportDropdown"; // adjust path if needed
// import axios from "axios";
// import BusinessIntroWordExport from "./AIIntro/BusinessIntroWordExport";
// import ProjectReportWordExport from './AIIntro/ProjectReportWordExport'

// const IntroPage = () => {
//   const[businessData , setBusinessData] = useState(null)
//   const [businessDescription, setBusinessDescription] = useState("");
//   const [aiIntro, setAiIntro] = useState(""); // To store the single introduction
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleBusinessSelect = (businessData) => {
//     setBusinessData(businessData)
//     console.log("🔍 Selected Business Data:", businessData);
//     const description =
//       businessData?.AccountInformation?.businessDescription || "";

//     setBusinessDescription(description);
//     setAiIntro(""); // Clear previous generated intro
//     setError("");
//   };

//   const generateIntro = async () => {
//     if (!businessDescription) {
//       setError("Business description is empty.");
//       return;
//     }

//     setLoading(true);
//     setError("");
//     setAiIntro(""); // Clear previous intro before new generation

//     try {
//       // Ensure this matches your backend API endpoint for Gemini
//       const res = await axios.post(
//         "https://reportsbe.sharda.co.in/api/openai/generate-introduction",
//         { businessDescription }
//       );

//       // The backend now returns a single 'introduction' string
//       setAiIntro(res.data.introduction || "");
//     } catch (err) {
//       console.error("Error generating intro:", err.message);
//       setError("Failed to generate AI introduction.");
//       setAiIntro(""); // Ensure empty if error
//     }

//     setLoading(false);
//   };

//   return (
//     <div className="p-6">
//       <h2 className="text-xl font-bold mb-4">
//         AI Business Introduction Generator
//       </h2>

//       <ReportDropdown onBusinessSelect={handleBusinessSelect} />

//       {businessDescription && (
//         <div className="mt-6">
//           <label
//             htmlFor="business-description"
//             className="block font-medium mb-1 dark:text-white"
//           >
//             Business Description
//           </label>
//           <textarea
//             id="business-description"
//             className="w-full p-2 border rounded min-h-[100px] dark:bg-gray-800 dark:text-white resize-y"
//             value={businessDescription}
//             onChange={(e) => setBusinessDescription(e.target.value)}
//           />
//         </div>
//       )}

//       <button
//         className={`mt-4 px-4 py-2 rounded transition duration-300 ease-in-out ${
//           loading || !businessDescription
//             ? "bg-blue-300 text-gray-500 cursor-not-allowed"
//             : "bg-blue-600 text-white hover:bg-blue-700"
//         }`}
//         onClick={generateIntro}
//         disabled={loading || !businessDescription}
//       >
//         {loading ? "Generating..." : "Generate Introduction"}
//       </button>

//       {error && <p className="text-red-500 mt-3">{error}</p>}

//       {aiIntro && (
//         <div className="mt-6">
//           <label className="block font-medium mb-1 dark:text-white">
//             AI-Generated Introduction
//           </label>
//           <div className="p-3 border rounded bg-gray-100 dark:bg-gray-800 dark:text-white whitespace-pre-line">
//             {aiIntro}
//           </div>

//           {/* Regenerate Button */}
//           <button
//             className={`mt-4 w-full px-4 py-2 rounded transition duration-300 ease-in-out ${
//               loading || !businessDescription
//                 ? "bg-yellow-300 text-gray-500 cursor-not-allowed"
//                 : "bg-yellow-500 text-white hover:bg-yellow-600"
//             }`}
//             onClick={generateIntro} // Same function as generate
//             disabled={loading || !businessDescription}
//           >
//             {loading ? "Regenerating..." : "Regenerate Introduction"}
//           </button>

//           {/* Export to PDF Button */}
//           {/* <BusinessIntroWordExport
//             businessData={businessData}
//             aiIntro={aiIntro}
//             businessName
//             financialYear
//           /> */}

//           {businessData && 
//           (<ProjectReportWordExport businessData={businessData}  aiIntro={aiIntro}/>)}
//         </div>
//       )}
//     </div>
//   );
// };

// export default IntroPage;






import React, { useState } from "react";
import ReportDropdown from "./Dropdown/ReportDropdown";
import ProjectReportWordExport from './AIIntro/ProjectReportWordExport';
import axios from "axios";

const SECTIONS = [
  { key: "introduction", label: "Introduction" },
  { key: "about", label: "About the Project" },
  { key: "products_services", label: "Product and Services" },
  { key: "scope", label: "Scope of the Project" },
  { key: "market_potential", label: "Market Potential" },
   { key: "swot", label: "SWOT Analysis" },
];

const IntroPage = () => {
  const [businessData, setBusinessData] = useState(null);
  const [businessDescription, setBusinessDescription] = useState("");
  const [sections, setSections] = useState({});
  const [loading, setLoading] = useState(false);
  const [showProjectReport, setShowProjectReport] = useState(false);
  const [error, setError] = useState("");

  const handleBusinessSelect = (data) => {
    setBusinessData(data);
    setBusinessDescription(data?.AccountInformation?.businessDescription || "");
    setSections({});
    setShowProjectReport(false);
    setError("");
  };

  // THIS function triggers ALL section generation in parent
  const handleGenerateProjectReport = async () => {
    if (!businessDescription) {
      setError("Business description is empty.");
      return;
    }
    setError("");
    setLoading(true);
    setShowProjectReport(true);

    let generatedSections = {};
    for (const sec of SECTIONS) {
      try {
        const res = await axios.post(
          "http://localhost:5000/api/openai/generate-section",
          {
            section: sec.key,
            businessName: businessData?.AccountInformation?.businessName || "",
            businessDescription,
            wordLimit: 1000,
          }
        );
        generatedSections[sec.key] = res.data.sectionText || "No text generated.";
        // Optionally, update state after each section for progressive display:
        setSections({ ...generatedSections });
      } catch (err) {
        generatedSections[sec.key] = "Error generating section.";
        setSections({ ...generatedSections });
      }
    }
    setLoading(false);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">
        AI Project Report Generator
      </h2>

      <ReportDropdown onBusinessSelect={handleBusinessSelect} />

      {businessDescription && (
        <div className="mt-6">
          <label
            htmlFor="business-description"
            className="block font-medium mb-1 dark:text-white"
          >
            Business Description
          </label>
          <textarea
            id="business-description"
            className="w-full p-2 border rounded min-h-[100px] dark:bg-gray-800 dark:text-white resize-y"
            value={businessDescription}
            onChange={(e) => setBusinessDescription(e.target.value)}
          />
        </div>
      )}

      <button
        className={`mt-4 px-4 py-2 rounded transition duration-300 ease-in-out ${
          !businessDescription || loading
            ? "bg-blue-300 text-gray-500 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
        onClick={handleGenerateProjectReport}
        disabled={!businessDescription || loading}
      >
        {loading ? "Generating All Sections..." : "Generate Full Project Report"}
      </button>

      {error && <p className="text-red-500 mt-3">{error}</p>}

      {/* The component below now just shows sections & export button */}
      {showProjectReport && businessData && (
        <ProjectReportWordExport
          businessData={businessData}
          sections={sections}
          loading={loading}
        />
      )}
    </div>
  );
};

export default IntroPage;

