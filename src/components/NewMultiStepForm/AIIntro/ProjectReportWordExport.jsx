// ProjectReportWordExport.jsx
import React from "react";
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

const SECTIONS = [
  { key: "introduction", label: "Introduction" },
  { key: "about", label: "About the Project" },
  { key: "products_services", label: "Product and Services" },
  { key: "scope", label: "Scope of the Project" },
  { key: "market_potential", label: "Market Potential" },
  { key: "swot", label: "SWOT Analysis" },
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

const ProjectReportWordExport = ({ businessData, sections, loading }) => {
  const businessName = businessData?.AccountInformation?.businessName || "";
  const financialYear = businessData?.ProjectReportSetting?.FinancialYear || "";

  const sectionTextToParagraphs = (sectionText) => {
    if (!sectionText) return [];

    const lines = sectionText.split(/\r?\n/);
    const paragraphs = [];

    // lines.forEach((line, idx) => {
    //   const trimmed = line.trim();

    //   if (!trimmed) {
    //     paragraphs.push(new Paragraph({ text: "", spacing: { after: 150 } }));
    //     return;
    //   }

    //   // Improved heuristic:
    //   // Heading if:
    //   // - Length < 55 chars
    //   // - No ending period/question mark
    //   // - Not the very first paragraph of the section (idx !== 0)
    //   // - Not all lower-case
    //   const isHeading =
    //     trimmed.length < 55 &&
    //     !/[.?!]$/.test(trimmed) &&
    //     idx !== 0 &&
    //     /[A-Z]/.test(trimmed[0]) && // starts with capital
    //     trimmed.split(" ").length < 10; // not a long sentence

    //   if (isHeading) {
    //     paragraphs.push(
    //       new Paragraph({
    //         children: [
    //           new TextRun({
    //             text: trimmed,
    //             bold: true,
    //             size: 28,
    //             font: "Times New Roman",
    //             color: "17375E",
    //           }),
    //         ],
    //         spacing: { after: 80 },
    //       })
    //     );
    //   } else {
    //     paragraphs.push(
    //       new Paragraph({
    //         children: [
    //           new TextRun({
    //             text: trimmed,
    //             size: 24,
    //             font: "Times New Roman",
    //           }),
    //         ],
    //         alignment: AlignmentType.JUSTIFIED,
    //         spacing: { after: 60 },
    //       })
    //     );
    //   }
    // });


// lines.forEach((line, idx) => {
//   const trimmed = line.trim();

//   if (!trimmed) {
//     paragraphs.push(new Paragraph({ text: "", spacing: { after: 150 } }));
//     return;
//   }

//   // New logic: If line starts and ends with **, treat as bold heading
//   if (/^\*\*(.+)\*\*$/.test(trimmed)) {
//     const headingText = trimmed.replace(/^\*\*(.+)\*\*$/, "$1");
//     paragraphs.push(
//       new Paragraph({
//         children: [
//           new TextRun({
//             text: headingText,
//             bold: true,
//             size: 28,
//             font: "Times New Roman",
//             color: "17375E",
//           }),
//         ],
//         spacing: { after: 80 },
//       })
//     );
//   } else {
//     // Normal paragraph
//     paragraphs.push(
//       new Paragraph({
//         children: [
//           new TextRun({
//             text: trimmed,
//             size: 24,
//             font: "Times New Roman",
//           }),
//         ],
//         alignment: AlignmentType.JUSTIFIED,
//         spacing: { after: 60 },
//       })
//     );
//   }
// });
lines.forEach((line, idx) => {
    const trimmed = line.trim();

    if (!trimmed) {
      paragraphs.push(new Paragraph({ text: "", spacing: { after: 150 } }));
      return;
    }
   const cleanedLine = trimmed.replace(/\*\*(.+?)\*\*/g, "$1");

    // 1. If line is a section heading in SWOT ("Strengths", "Weaknesses", etc.)
    if (/^(Strengths|Weaknesses|Opportunities|Threats)$/i.test(cleanedLine)) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: trimmed,
              bold: true,
              size: 28,
              font: "Times New Roman",
              color: "17375E",
            }),
          ],
          spacing: { after: 120 },
        })
      );
      return;
    }

    // 2. If line is a bolded heading via **...** (used in Products & Services)
    const matchAsterisks = trimmed.match(/^\*\*(.+)\*\*$/);
    if (matchAsterisks) {
      const headingText = matchAsterisks[1];
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: headingText,
              bold: true,
              size: 28,
              font: "Times New Roman",
              color: "17375E",
            }),
          ],
          spacing: { after: 80 },
        })
      );
      return;
    }

    // 3. If line is a numbered heading: "1. Essential Service"
    const numberedHeadingMatch = trimmed.match(/^(\d+\.\s)(.+)$/);
    if (numberedHeadingMatch) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: numberedHeadingMatch[1], // "1. "
              bold: true,
              size: 24,
              font: "Times New Roman",
              color: "17375E",
            }),
            new TextRun({
              text: numberedHeadingMatch[2], // "Essential Service"
              bold: true,
              size: 24,
              font: "Times New Roman",
            }),
          ],
          spacing: { after: 40 },
        })
      );
      return;
    }

    // 4. Normal paragraph
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: trimmed,
            size: 24,
            font: "Times New Roman",
          }),
        ],
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 60 },
      })
    );
  });

    return paragraphs;
  };

  const exportToWord = async () => {
    const BORDER = {
      top: { style: BorderStyle.SINGLE, size: 8, color: "000000" },
      bottom: { style: BorderStyle.SINGLE, size: 8, color: "000000" },
      left: { style: BorderStyle.SINGLE, size: 8, color: "000000" },
      right: { style: BorderStyle.SINGLE, size: 8, color: "000000" },
    };
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: { top: 720, right: 720, bottom: 720, left: 720 },
              borders: BORDER,
            },
          },
          children: [
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
            }),
            // ...SECTIONS.flatMap((sec) => [
            //   SectionHeading(sec.label.toUpperCase()),
            //   ...sectionTextToParagraphs(sections[sec.key] || ""),
            // ]),
            ...SECTIONS.flatMap((sec, idx) => [
              ...(idx === 0
                ? []
                : [new Paragraph({ children: [new PageBreak()] })]),
              SectionHeading(sec.label.toUpperCase()),
              ...sectionTextToParagraphs(sections[sec.key] || ""),
            ]),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "Project_Report.docx");
  };

  return (
    <div className="my-6 p-4 border rounded-lg">
      <div className="mt-4">
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
                sections[sec.key] || (
                  <span className="text-gray-400">Not generated yet.</span>
                )
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        className="mt-6 w-full px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
        onClick={exportToWord}
        disabled={Object.values(sections).some((val) => !val)}
      >
        Export Full Project Report to Word
      </button>
    </div>
  );
};

export default ProjectReportWordExport;
