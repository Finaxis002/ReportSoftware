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
  ImageRun,
} from "docx";
import { saveAs } from "file-saver";
import axios from "axios";

const SECTIONS = [
  { key: "introduction", label: "Introduction" },
  { key: "about", label: "About the Project" },
  { key: "products_services", label: "Product and Services" },
  { key: "scope", label: "Scope of the Project" },
  { key: "market_potential", label: "Market Potential" },
  { key: "swot", label: "SWOT Analysis" },
  { key: "conclusion", label: "Conclusion" },
];

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

const EighthStep = ({ formData, onFormDataChange, years, MoreDetailsData }) => {
  const businessData = formData;
  const [businessDescription, setBusinessDescription] = useState(
    formData?.AccountInformation?.businessDescription || ""
  );
  const [sections, setSections] = useState(formData?.generatedPDF || {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setBusinessDescription(formData?.AccountInformation?.businessDescription || "");
    setSections(formData?.generatedPDF || {});
  }, [formData]);

  const handleGenerateProjectReport = async () => {
    if (!businessDescription) {
      setError("Business description is empty.");
      return;
    }
    setError("");
    setLoading(true);

    let generatedSections = {};
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    for (const sec of SECTIONS) {
      try {
        const res = await axios.post(
          "http://localhost:5000/api/openai/generate-section",
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
        onFormDataChange({ generatedPDF: { ...generatedSections } });
      } catch (err) {
        generatedSections[sec.key] = "Error generating section.";
        setSections({ ...generatedSections });
        onFormDataChange({ generatedPDF: { ...generatedSections } });
      }

      await sleep(1100);
    }

    setLoading(false);
  };

  const businessName = businessData?.AccountInformation?.businessName || "";
  const financialYear = businessData?.ProjectReportSetting?.FinancialYear || "";


  const fetchImageAsBuffer = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      return new Uint8Array(arrayBuffer);
    } catch (err) {
      console.error("Failed to fetch image:", url, err);
      return null;
    }
  };


  const sectionTextToParagraphs = async (section) => {
    const text = typeof section === "string" ? section : section?.text || "";
    const images = Array.isArray(section?.images) ? section.images : [];

    const lines = text.split(/\r?\n/);
    const paragraphs = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        paragraphs.push(new Paragraph({ text: "", spacing: { after: 150 } }));
        continue;
      }

      // (same logic for bold/headings as your code)

      // Normal paragraph
      const cleanedLine = trimmed.replace(/\*\*(.+?)\*\*/g, "$1");
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: cleanedLine, size: 24, font: "Times New Roman" })],
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: 60 },
        })
      );
    }

    // Append images after text
    for (const imageUrl of images) {
      const imageBuffer = await fetchImageAsBuffer(imageUrl);
      if (imageBuffer) {
        paragraphs.push(
          new Paragraph({
            children: [
              new ImageRun({
                data: imageBuffer,
                transformation: {
                  width: 400,
                  height: 250,
                },
              }),
            ],
            spacing: { after: 120 },
          })
        );
      }
    }

    return paragraphs;
  };


  const exportToWord = async () => {
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

    // Loop over sections asynchronously
    for (let i = 0; i < SECTIONS.length; i++) {
      const sec = SECTIONS[i];
      const section = sections[sec.key];

      if (i !== 0) {
        children.push(new Paragraph({ children: [new PageBreak()] }));
      }

      children.push(SectionHeading(sec.label.toUpperCase()));

      const paragraphs = await sectionTextToParagraphs(section);
      children.push(...paragraphs);
    }

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

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "Project_Report.docx");
  };


  return (
    <div className="overflow-x-hidden">
      <form>
        <div
          // className="form-scroll"
          className="form-scroll"
        >
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
          <div className="d-flex justify-content-between">
            <button
              className={`mt-4 px-4 py-2 rounded transition duration-300 ease-in-out ${!businessDescription || loading
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
              className="mt-4 px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 flex-end"
              onClick={exportToWord}
              disabled={Object.values(sections).some((val) => !val)}
            >
              Export Full Project Report to Word
            </button>
          </div>
          {error && <p className="text-red-500 mt-3">{error}</p>}
          {SECTIONS.map((sec) => (
            <div key={sec.key} className="my-3">
              <div className="font-bold mb-1">{sec.label}</div>
              <div
                className="p-3 border rounded bg-gray-100 dark:bg-gray-800 dark:text-white whitespace-pre-line"
                style={{ minHeight: 120 }}
              >
                {loading ? (
                  <span className="text-blue-400">Generating...</span>
                ) : (
                  <>
                    <div>
                      {sections[sec.key]?.text || (
                        <span className="text-gray-400">Not generated yet.</span>
                      )}
                    </div>

                    {sections[sec.key]?.images?.length > 0 && (
                      <div className="flex flex-wrap gap-3 mt-3">
                        {sections[sec.key].images.map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt={`related-${sec.key}-${idx}`}
                            className="w-40 h-28 object-cover rounded shadow"
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
         </div>
      </form>
    </div>
  );
};

export default EighthStep;
