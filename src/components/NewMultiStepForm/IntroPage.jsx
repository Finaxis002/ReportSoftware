import { useState} from "react";
import ReportDropdown from "./Dropdown/ReportDropdown";
import ProjectReportWordExport from "./AIIntro/ProjectReportWordExport";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { BASE_URL } from "./Utils/baseurl";

const SECTIONS = [
  { key: "introduction", label: "Introduction" },
  { key: "about", label: "About the Project" },
  { key: "products_services", label: "Product and Services" },
  { key: "scope", label: "Scope of the Project" },
  { key: "market_potential", label: "Market Potential" },
  { key: "swot", label: "SWOT Analysis" },
  { key: "conclusion", label: "Conclusion" },
];

const IntroPage = ({ userRole }) => {
  const location = useLocation();

  const [businessData, setBusinessData] = useState(
    location.state?.formData || null
  );
  const [businessDescription, setBusinessDescription] = useState(
    location.state?.formData?.AccountInformation?.businessDescription || ""
  );
  const [bep, setBep] = useState(
    location.state?.formData?.computedData?.breakEvenPointPercentage
      ?.breakEvenPointPercentage?.[1] || ""
  );
  const [sections, setSections] = useState({});
  const [loading, setLoading] = useState(false);
  const [showProjectReport, setShowProjectReport] = useState(false);
  const [error, setError] = useState("");

  const handleBusinessSelect = (data) => {
    setBusinessData(data);
    setBusinessDescription(data?.AccountInformation?.businessDescription || "");
    setBep(
      data?.computedData?.breakEvenPointPercentage
        ?.breakEvenPointPercentage[1] || ""
    );
    setSections({});
    setShowProjectReport(false);
    setError("");
  };
  console.log("break even point", bep);

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
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    for (const sec of SECTIONS) {
      try {
        const res = await axios.post(
          `${BASE_URL}/api/openai/generate-section`,
          {
            section: sec.key,
            businessName: businessData?.AccountInformation?.businessName || "",
            averageCurrentRatio:
              businessData?.computedData?.averageCurrentRatio
                ?.averageCurrentRatio || "",
            averageDSCR: businessData?.computedData?.dscr?.averageDSCR || "",
            BEP:
              businessData?.computedData?.breakEvenPointPercentage
                ?.breakEvenPointPercentage[1] || "",
            businessDescription,
            wordLimit: 1000,
          }
        );

        generatedSections[sec.key] = {
          text: res.data.sectionText || "No text generated.",
          images: res.data.images || [],
        };

        setSections({ ...generatedSections });
      } catch (err) {
        generatedSections[sec.key] = "Error generating section.";
        setSections({ ...generatedSections });
      }

      await sleep(1100); // ✅ wait 1.1 seconds before next request
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 p-8">
        <h2 className="text-xl font-bold mb-4">AI Project Report Generator</h2>

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
          {loading
            ? "Generating All Sections..."
            : "Generate Full Project Report"}
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
    </div>
  );
};

export default IntroPage;
