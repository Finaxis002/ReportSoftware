import React, { useState } from "react";
import ReportDropdown from "./Dropdown/ReportDropdown"; // adjust path if needed
import axios from "axios";

const IntroPage = () => {
  const [businessDescription, setBusinessDescription] = useState("");
  const [aiIntro, setAiIntro] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleBusinessSelect = (businessData) => {
     console.log("🔍 Selected Business Data:", businessData);
    const description = businessData?.AccountInformation?.businessDescription || "";

    setBusinessDescription(description);
    setAiIntro(""); // Clear previous intro
    setError("");
  };

  const generateIntro = async () => {
    if (!businessDescription) {
      setError("Business description is empty.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/openai/generate-introduction",
        { businessDescription }
      );
      setAiIntro(res.data.introduction);
    } catch (err) {
      console.error("Error generating intro:", err.message);
      setError("Failed to generate AI introduction.");
    }

    setLoading(false);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">AI Business Introduction Generator</h2>

      <ReportDropdown onBusinessSelect={handleBusinessSelect} />

      {businessDescription && (
        <div className="mt-6">
          <label className="block font-medium mb-1 dark:text-white">Business Description</label>
          <textarea
            className="w-full p-2 border rounded min-h-[100px] dark:bg-gray-800 dark:text-white"
            value={businessDescription}
            readOnly
          />
        </div>
      )}

      <button
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        onClick={generateIntro}
        disabled={loading}
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
        </div>
      )}
    </div>
  );
};

export default IntroPage;
