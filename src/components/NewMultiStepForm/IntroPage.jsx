// import React, { useState } from "react";
// import ReportDropdown from "./Dropdown/ReportDropdown"; // adjust path if needed
// import axios from "axios";

// const IntroPage = () => {
//   const [businessDescription, setBusinessDescription] = useState("");
//   const [aiIntro, setAiIntro] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleBusinessSelect = (businessData) => {
//      console.log("🔍 Selected Business Data:", businessData);
//     const description = businessData?.AccountInformation?.businessDescription || "";

//     setBusinessDescription(description);
//     setAiIntro(""); // Clear previous intro
//     setError("");
//   };

//   const generateIntro = async () => {
//     if (!businessDescription) {
//       setError("Business description is empty.");
//       return;
//     }

//     setLoading(true);
//     setError("");

//     try {
//       const res = await axios.post(
//         "http://localhost:5000/api/openai/generate-introduction",
//         { businessDescription }
//       );
//       setAiIntro(res.data.introduction);
//     } catch (err) {
//       console.error("Error generating intro:", err.message);
//       setError("Failed to generate AI introduction.");
//     }

//     setLoading(false);
//   };

//   return (
//     <div className="p-6">
//       <h2 className="text-xl font-bold mb-4">AI Business Introduction Generator</h2>

//       <ReportDropdown onBusinessSelect={handleBusinessSelect} />

//       {businessDescription && (
//         <div className="mt-6">
//           <label className="block font-medium mb-1 dark:text-white">Business Description</label>
//           <textarea
//             className="w-full p-2 border rounded min-h-[100px] dark:bg-gray-800 dark:text-white"
//             value={businessDescription}
//             readOnly
//           />
//         </div>
//       )}

//       <button
//         className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//         onClick={generateIntro}
//         disabled={loading}
//       >
//         {loading ? "Generating..." : "Generate Introduction"}
//       </button>

//       {error && <p className="text-red-500 mt-3">{error}</p>}

//       {aiIntro && (
//         <div className="mt-6">
//           <label className="block font-medium mb-1 dark:text-white">AI-Generated Introduction</label>
//           <div className="p-3 border rounded bg-gray-100 dark:bg-gray-800 dark:text-white whitespace-pre-line">
//             {aiIntro}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default IntroPage;








import React, { useState } from "react";
import ReportDropdown from "./Dropdown/ReportDropdown"; // adjust path if needed
import axios from "axios";
import jsPDF from "jspdf"; // Import jsPDF

const IntroPage = () => {
  const [businessDescription, setBusinessDescription] = useState("");
  const [aiIntro, setAiIntro] = useState(""); // To store the single introduction
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleBusinessSelect = (businessData) => {
    console.log("🔍 Selected Business Data:", businessData);
    const description = businessData?.AccountInformation?.businessDescription || "";

    setBusinessDescription(description);
    setAiIntro(""); // Clear previous generated intro
    setError("");
  };

  const generateIntro = async () => {
    if (!businessDescription) {
      setError("Business description is empty.");
      return;
    }

    setLoading(true);
    setError("");
    setAiIntro(""); // Clear previous intro before new generation

    try {
      // Ensure this matches your backend API endpoint for Gemini
      const res = await axios.post(
        "https://reportsbe.sharda.co.in/api/openai/generate-introduction",
        { businessDescription }
      );
      
      // The backend now returns a single 'introduction' string
      setAiIntro(res.data.introduction || "");
    } catch (err) {
      console.error("Error generating intro:", err.message);
      setError("Failed to generate AI introduction.");
      setAiIntro(""); // Ensure empty if error
    }

    setLoading(false);
  };

  const exportToPdf = () => {
    if (!aiIntro) {
      // In a production app, replace alert with a custom modal/toast notification
      alert('Please generate an introduction before exporting to PDF.');
      return;
    }

    const doc = new jsPDF();

    // Set font and size for title
    doc.setFontSize(22);
    doc.setTextColor('#333333');
    doc.text('Business Introduction Report', 14, 20);

    // Add Business Description
    doc.setFontSize(14);
    doc.setTextColor('#555555');
    doc.text('Business Description:', 14, 40);
    // Use splitTextToSize for long descriptions to wrap text
    const splitDesc = doc.splitTextToSize(businessDescription, 180); // Max width 180mm
    doc.setFontSize(12);
    doc.text(splitDesc, 14, 50);

    // Add Generated Introduction
    doc.setFontSize(14);
    doc.setTextColor('#555555');
    // Calculate starting Y position based on description height
    const introStartY = 50 + (splitDesc.length * 7) + 20; // 7mm per line, 20mm extra space
    doc.text('AI-Generated Introduction:', 14, introStartY);
    const splitIntro = doc.splitTextToSize(aiIntro, 180);
    doc.setFontSize(12);
    doc.text(splitIntro, 14, introStartY + 10);

    // Save the PDF
    doc.save('Business_Introduction_Report.pdf');
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">AI Business Introduction Generator</h2>

      <ReportDropdown onBusinessSelect={handleBusinessSelect} />

      {businessDescription && (
        <div className="mt-6">
          <label htmlFor="business-description" className="block font-medium mb-1 dark:text-white">
            Business Description
          </label>
          <textarea
            id="business-description"
            className="w-full p-2 border rounded min-h-[100px] dark:bg-gray-800 dark:text-white resize-y"
            value={businessDescription}
            readOnly
          />
        </div>
      )}

      <button
        className={`mt-4 px-4 py-2 rounded transition duration-300 ease-in-out ${
          loading || !businessDescription
            ? 'bg-blue-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
        onClick={generateIntro}
        disabled={loading || !businessDescription}
      >
        {loading ? "Generating..." : "Generate Introduction"}
      </button>

      {error && <p className="text-red-500 mt-3">{error}</p>}

      {aiIntro && (
        <div className="mt-6">
          <label className="block font-medium mb-1 dark:text-white">AI-Generated Introduction</label>
          <div className="p-3 border rounded bg-gray-100 dark:bg-gray-800 dark:text-white whitespace-pre-line">
            {aiIntro}
          </div>

          {/* Regenerate Button */}
          <button
            className={`mt-4 w-full px-4 py-2 rounded transition duration-300 ease-in-out ${
              loading || !businessDescription
                ? 'bg-yellow-300 text-gray-500 cursor-not-allowed'
                : 'bg-yellow-500 text-white hover:bg-yellow-600'
            }`}
            onClick={generateIntro} // Same function as generate
            disabled={loading || !businessDescription}
          >
            {loading ? "Regenerating..." : "Regenerate Introduction"}
          </button>

          {/* Export to PDF Button */}
          <button
            onClick={exportToPdf}
            disabled={!aiIntro}
            className={`mt-4 w-full px-4 py-2 rounded transition duration-300 ease-in-out ${
              !aiIntro
                ? 'bg-green-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            Export Introduction to PDF
          </button>
        </div>
      )}
    </div>
  );
};

export default IntroPage;
