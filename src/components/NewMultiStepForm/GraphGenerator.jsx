import React, { useState } from "react";
import { generateAllCharts } from "./charts/generateAllCharts";
import { generateGraphsPdf } from "./Utils/generateGraphsPdf";

const GraphGenerator = ({ formData, selectedColor }) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!formData) return;
    setLoading(true);
    try {
      const charts = await generateAllCharts(formData, selectedColor);
      await generateGraphsPdf(charts);
    } catch (e) {
      console.error(e);
      alert("Failed to generate graph PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    // <button
    //   onClick={handleClick}
    //   className="mt-4 bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
    // >
    //   {loading ? "Generating Graph PDF..." : "Generate Graph PDF"}
    // </button>

    <button
      onClick={handleClick}
      disabled={loading}
      className="h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 hover:border-purple-300 transition-all hover:shadow-md group px-2"
    >
      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-purple-200 transition-colors">
        {loading ? (
          <svg
            className="animate-spin h-6 w-6 text-purple-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-purple-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        )}
      </div>
      <span className="text-sm font-medium text-purple-800">
        {loading ? "Generating..." : "Generate Graph PDF"}
      </span>
    </button>
  );
};

export default GraphGenerator;
