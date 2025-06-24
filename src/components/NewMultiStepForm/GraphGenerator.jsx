import React, { useState } from "react";
import { generateAllCharts } from "./charts/generateAllCharts";
import { generateGraphsPdf } from "./Utils/generateGraphsPdf";

const GraphGenerator = ({ formData }) => {
  const [loading, setLoading] = useState(false);
  console.log("form data here", formData);
  const handleClick = async () => {
    if (!formData) return;
    setLoading(true);
    try {
      const charts = await generateAllCharts(formData);
      await generateGraphsPdf(charts);
    } catch (e) {
      console.error(e);
      alert("Failed to generate graph PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="mt-4 bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
    >
      {loading ? "Generating Graph PDF..." : "Generate Graph PDF"}
    </button>
  );
};

export default GraphGenerator;
