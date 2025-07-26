

import React from "react";
import { Document, Packer, Paragraph, HeadingLevel, AlignmentType, TextRun, BorderStyle } from "docx";
import { saveAs } from "file-saver";

const BusinessIntroWordExport = ({ businessDescription, aiIntro, businessData }) => {
  console.log("🔍 Selected Business Data:", businessData);
  const businessName = businessData?.AccountInformation?.businessName || "";
  const financialYear = businessData?.ProjectReportSetting?.FinancialYear || "";
  console.log(businessName +' '+  financialYear)
  const exportToWord = async () => {
    if (!aiIntro) {
      alert("Please generate an introduction before exporting to Word.");
      return;
    }

    // --- Main border style ---
    const BORDER = {
      top: { style: BorderStyle.SINGLE, size: 8, color: "000000" },
      bottom: { style: BorderStyle.SINGLE, size: 8, color: "000000" },
      left: { style: BorderStyle.SINGLE, size: 8, color: "000000" },
      right: { style: BorderStyle.SINGLE, size: 8, color: "000000" },
    };

    // --- Document creation ---
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: { top: 720, right: 720, bottom: 720, left: 720 }, // 1 inch margins
              borders: BORDER,
            },
          },
          children: [
            // Company Name (Title)
            new Paragraph({
              children: [
                new TextRun({
                  text: businessName || "M/SWOW POULTRY",
                  bold: true,
                  size: 32, // 16pt
                  font: "Times New Roman",
                  color: "666666",
                }),
              ],
              alignment: AlignmentType.LEFT,
              spacing: { after: 100 },
            }),
            // Subtitle
            new Paragraph({
              children: [
                new TextRun({
                  text:  `Financial Year ${financialYear}` || "Financial Year 2025-26",
                  bold: true,
                  size: 26, // 13pt
                  color: "9F8A51",
                  font: "Times New Roman",
                }),
              ],
              alignment: AlignmentType.LEFT,
              spacing: { after: 200 },
            }),

            // Colored Introduction Heading
            new Paragraph({
              children: [
                new TextRun({
                  text: "INTRODUCTION",
                  bold: true,
                  color: "FFFFFF",
                  size: 28, // 14pt
                  font: "Times New Roman",
                  // Not directly supported: background, so see below
                }),
              ],
              alignment: AlignmentType.CENTER,
              shading: {
                type: "clear",
                color: "auto",
                fill: "17375E", // Navy blue
              },
              spacing: { after: 300 },
            }),

            // Body (justified)
            new Paragraph({
              children: [
                new TextRun({
                  text: aiIntro,
                  size: 24, // 12pt
                  font: "Times New Roman",
                }),
              ],
              alignment: AlignmentType.JUSTIFIED,
              spacing: { before: 100, after: 100 },
            }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "Business_Introduction_Report.docx");
  };

  return (
    <button
      onClick={exportToWord}
      disabled={!aiIntro}
      className={`mt-4 w-full px-4 py-2 rounded transition duration-300 ease-in-out ${
        !aiIntro
          ? 'bg-green-300 text-gray-500 cursor-not-allowed'
          : 'bg-green-600 text-white hover:bg-green-700'
      }`}
    >
      Export Introduction to Word
    </button>
  );
};

export default BusinessIntroWordExport;
