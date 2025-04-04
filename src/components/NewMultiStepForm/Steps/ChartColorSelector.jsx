import React, { useState, useEffect } from "react";

const ChartColorSelector = ({ chartType }) => {
  const [colors, setColors] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem(`${chartType}Colors`);
    if (stored) setColors(JSON.parse(stored));
  }, [chartType]);

  const handleColorChange = (index, color) => {
    const updated = [...colors];
    updated[index] = color;
    setColors(updated);
    localStorage.setItem(`${chartType}Colors`, JSON.stringify(updated));
  };

  const handleAddColor = () => {
    setColors([...colors, "#3b82f6"]); // Default blue
  };

  const handleRemoveColor = (index) => {
    const updated = colors.filter((_, i) => i !== index);
    setColors(updated);
    localStorage.setItem(`${chartType}Colors`, JSON.stringify(updated));
  };

  return (
    <div className="mb-4">
      <h4 className="font-semibold text-gray-800 capitalize mb-2">{chartType} Colors:</h4>
      {colors.map((color, index) => (
        <div key={index} className="flex items-center gap-2 mb-1">
          <input
            type="color"
            value={color}
            onChange={(e) => handleColorChange(index, e.target.value)}
            className="h-8 w-8 border"
          />
          <button
            onClick={() => handleRemoveColor(index)}
            className="text-red-500 text-xs"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        onClick={handleAddColor}
        className="mt-2 px-3 py-1 bg-blue-500 text-white rounded"
      >
        Add Color
      </button>
    </div>
  );
};

export default ChartColorSelector;
