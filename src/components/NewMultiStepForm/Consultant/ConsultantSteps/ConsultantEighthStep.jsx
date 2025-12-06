// EighthStep.jsx
import React, { useState, useEffect } from "react";
import {
  Document,
  Packer,
  Paragraph,
  AlignmentType,
  TextRun,
  BorderStyle,
  PageBreak,
} from "docx";
import { saveAs } from "file-saver";
import axios from "axios";
import Swal from 'sweetalert2';

const ALL_SECTIONS = {
  introduction: "Introduction",
  about: "About the Project",
  products_services: "Product and Services",
  scope: "Scope of the Project",
  market_potential: "Market Potential",
  swot: "SWOT Analysis",
  conclusion: "Conclusion",
};

const VERSION_SECTIONS = {
  "Version 1": ["introduction", "conclusion"],
  "Version 2": ["introduction", "conclusion"],
  "Version 3": ["introduction", "scope", "conclusion"],
  "Version 4": ["introduction", "scope", "market_potential", "conclusion"],
  "Version 5": ["introduction", "scope", "market_potential", "swot", "products_services", "conclusion"],
};

const SectionHeading = (text) =>
  new Paragraph({
    children: [
      new TextRun({
        text,
        bold: true,
        color: "FFFFFF",
        size: 28,
        font: "Times New Roman",
      }),
    ],
    alignment: AlignmentType.CENTER,
    shading: { type: "clear", color: "auto", fill: "17375E" },
    spacing: { after: 300 },
  });

const ConsultantEighthStep = ({ formData, onFormDataChange }) => {
  const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';
  const businessData = formData;
  const [businessDescription, setBusinessDescription] = useState(
    formData?.AccountInformation?.businessDescription || ""
  );
  const [allSections, setAllSections] = useState(formData?.generatedPDF || {});
  const [filteredSections, setFilteredSections] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedVersion, setSelectedVersion] = useState(() => {
    return localStorage.getItem("selectedConsultantReportVersion") || "Version 1";
  });

  // Listen for localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const newVersion = localStorage.getItem("selectedConsultantReportVersion") || "Version 1";
      if (newVersion !== selectedVersion) {
        setSelectedVersion(newVersion);
      }
    };

    // Initial check
    handleStorageChange();

    // Listen for storage events (from other tabs/windows)
    window.addEventListener('storage', handleStorageChange);

    // Poll for changes (for same tab changes)
    const intervalId = setInterval(handleStorageChange, 500);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, [selectedVersion]);

  // Initialize business description
  useEffect(() => {
    setBusinessDescription(formData?.AccountInformation?.businessDescription || "");
  }, [formData]);

  // Initialize and update all sections
  useEffect(() => {
    if (formData?.generatedPDF) {
      setAllSections(prev => ({ ...prev, ...formData.generatedPDF }));
    }
  }, [formData?.generatedPDF]);

  // Filter sections based on selected version
  useEffect(() => {
    const currentVersionSections = VERSION_SECTIONS[selectedVersion] || [];
    const filtered = {};
    
    currentVersionSections.forEach(key => {
      if (allSections[key]) {
        filtered[key] = allSections[key];
      }
    });
    
    setFilteredSections(filtered);
  }, [selectedVersion, allSections]);

  // Get current sections for the selected version
  const currentSections = VERSION_SECTIONS[selectedVersion] || [];

  const handleGenerateProjectReport = async () => {
    if (!businessDescription) {
      setError("Business description is empty.");
      return;
    }
    setError("");
    setLoading(true);

    const generatedSections = { ...allSections };
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    for (const secKey of currentSections) {
      try {
        const res = await axios.post(
          `${BASE_URL}/api/openai/generate-section`,
          {
            section: secKey,
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
            version: selectedVersion,
          }
        );

        generatedSections[secKey] = res.data.sectionText || "No text generated.";
        
        // Update all sections immediately
        setAllSections({ ...generatedSections });
        onFormDataChange({ generatedPDF: { ...generatedSections } });
      } catch (err) {
        generatedSections[secKey] = "Error generating section.";
        setAllSections({ ...generatedSections });
        onFormDataChange({ generatedPDF: { ...generatedSections } });
      }

      await sleep(1100);
    }

    setLoading(false);

    // Auto-save generated sections to database
    try {
      await axios.post(`${BASE_URL}/api/consultant-reports/update-consultant-step`, {
        sessionId: businessData.sessionId,
        data: { generatedPDF: generatedSections },
      });
      console.log("✅ Generated sections auto-saved to database");
    } catch (err) {
      console.error("❌ Failed to auto-save generated sections:", err);
    }
  };

  const businessName = businessData?.AccountInformation?.businessName || "";
  const financialYear = businessData?.ProjectReportSetting?.FinancialYear || "";

  const sectionTextToParagraphs = (section) => {
    const text = (typeof section === 'string' ? section : section?.text) || "";
    const lines = text.split(/\r?\n/);
    const paragraphs = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        paragraphs.push(new Paragraph({ text: "", spacing: { after: 150 } }));
        continue;
      }

      const cleanedLine = trimmed.replace(/\*\*(.+?)\*\*/g, "$1");
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: cleanedLine, size: 24, font: "Times New Roman" })],
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: 60 },
        })
      );
    }

    return paragraphs;
  };

  const exportToWord = async () => {
    try {
      setLoading(true);

      const BORDER = {
        top: { style: BorderStyle.SINGLE, size: 8, color: "000000" },
        bottom: { style: BorderStyle.SINGLE, size: 8, color: "000000" },
        left: { style: BorderStyle.SINGLE, size: 8, color: "000000" },
        right: { style: BorderStyle.SINGLE, size: 8, color: "000000" },
      };

      const children = [];

      // Heading with Business Name and Financial Year
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: businessName || "Business Name",
              bold: true,
              size: 32,
              font: "Times New Roman",
              color: "666666",
            }),
          ],
          alignment: AlignmentType.LEFT,
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: financialYear ? `Financial Year ${financialYear}` : "",
              italics: true,
              size: 26,
              color: "9F8A51",
              font: "Times New Roman",
            }),
          ],
          alignment: AlignmentType.LEFT,
          spacing: { after: 200 },
        })
      );

      // Check if we have any valid sections
      const validSections = currentSections.filter(secKey => {
        const section = filteredSections[secKey];
        return section && (typeof section === 'string' ? section.trim() !== "" : section.text && section.text.trim() !== "");
      });

      if (validSections.length === 0) {
        Swal.fire({
          icon: 'warning',
          title: 'No Content',
          text: 'No content available to export. Please generate sections first.',
          confirmButtonText: 'OK'
        });
        setLoading(false);
        return;
      }

      // Loop over valid sections
      for (let i = 0; i < validSections.length; i++) {
        const secKey = validSections[i];
        const section = filteredSections[secKey];

        // Add page break for all sections except the first one
        if (i !== 0) {
          children.push(new Paragraph({ children: [new PageBreak()] }));
        }

        // Add section heading
        children.push(SectionHeading(ALL_SECTIONS[secKey].toUpperCase()));

        // Convert section text to paragraphs
        const paragraphs = sectionTextToParagraphs(section);
        children.push(...paragraphs);
      }

      // Create document
      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                margin: { top: 720, right: 720, bottom: 720, left: 720 },
                borders: BORDER,
              },
            },
            children,
          },
        ],
      });

      // Generate and save the document
      const blob = await Packer.toBlob(doc);

      // Create a safe filename
      const safeBusinessName = businessName.replace(/[^a-zA-Z0-9]/g, "_");
      const fileName = `${safeBusinessName}_Project_Report.docx`;

      saveAs(blob, fileName);

      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Export Successful',
        text: `Project report exported as ${fileName}`,
        timer: 2000,
        showConfirmButton: false
      });

    } catch (error) {
      console.error("❌ Error exporting to Word:", error);

      // Show error message
      Swal.fire({
        icon: 'error',
        title: 'Export Failed',
        text: 'Failed to export project report. Please try again.',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-6 px-4">
      <div className="">
        <div className="mt-4 max-h-96 overflow-y-auto">
          <div className="">
            <label
              htmlFor="business-description"
              className="block font-medium mb-1 dark:text-white bold"
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
          
          {/* Display current version for debugging */}
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Current Version: <span className="font-semibold">{selectedVersion}</span>
          </div>
          
          <div className="flex flex-wrap gap-4 mt-4">
            <button
              className={`px-4 py-2 rounded transition duration-300 ease-in-out ${!businessDescription || loading
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
            <button
              className={`px-4 py-2 rounded transition duration-300 ease-in-out ${!currentSections.every(secKey => {
                const section = filteredSections[secKey];
                return section && (typeof section === 'string' ? section.trim() !== "" : section.text && section.text.trim() !== "");
              }) || loading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700"
                }`}
              onClick={exportToWord}
              disabled={!currentSections.every(secKey => {
                const section = filteredSections[secKey];
                return section && (typeof section === 'string' ? section.trim() !== "" : section.text && section.text.trim() !== "");
              }) || loading}
            >
              {loading ? "Exporting..." : "Export Full Project Report to Word"}
            </button>
          </div>
          {error && <p className="text-red-500 mt-3">{error}</p>}
          
          {/* Display sections for current version */}
          {currentSections.map((secKey) => (
            <div key={secKey} className="my-3">
              <div className="font-bold mb-1">{ALL_SECTIONS[secKey]}</div>
              <div
                className="p-3 border rounded bg-gray-100 dark:bg-gray-800 dark:text-white whitespace-pre-line"
                style={{ minHeight: 120 }}
              >
                {loading ? (
                  <span className="text-blue-400">Generating...</span>
                ) : (
                  <div>
                    {typeof filteredSections[secKey] === 'string' 
                      ? filteredSections[secKey] 
                      : filteredSections[secKey]?.text || (
                        <span className="text-gray-400">Not generated yet.</span>
                      )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConsultantEighthStep;