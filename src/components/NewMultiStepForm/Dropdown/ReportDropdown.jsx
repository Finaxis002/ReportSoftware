
import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import "../../../css/reportForm.css";

const ReportDropdown = ({ onBusinessSelect }) => {
  const [businessOptions, setBusinessOptions] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);

  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const response = await axios.get(
          "https://reportsbe.sharda.co.in/api/businesses"
        );

        if (response.data && Array.isArray(response.data.businesses)) {
          const options = response.data.businesses.map((entry) => ({
            value: entry,
            label: entry,
          }));
          setBusinessOptions(options);
        } else {
          console.error("Invalid response format:", response.data);
        }
      } catch (error) {
        console.error("Error fetching businesses:", error.message);
      }
    };

    fetchBusinesses();
  }, []);

  const handleSelect = async (selectedOption) => {
    setSelectedBusiness(selectedOption);
  
    if (selectedOption) {
      const selectedBusinessFullName = selectedOption.value;
      const match = selectedBusinessFullName.match(/^(.*?)\((.*?)\)$/); // Extract businessName and businessOwner
      const businessName = match ? match[1].trim() : selectedBusinessFullName;
      const businessOwner = match ? match[2].trim() : "Unknown Owner";
  
      try {
        const response = await axios.get(
          `https://reportsbe.sharda.co.in/fetch-business-data?businessName=${encodeURIComponent(
            businessName
          )}&businessOwner=${encodeURIComponent(businessOwner)}`
        );
  
        if (response.data && response.data.data.length > 0) {
          const businessData = response.data.data[0];
          const sessionId = businessData.sessionId || null;
          onBusinessSelect?.(businessData, sessionId);
        } else {
          onBusinessSelect?.({}, null);
        }
      } catch (error) {
        console.error("Error fetching business data:", error.message);
        onBusinessSelect?.({}, null);
      }
    }
  };
  
  

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: isDarkMode ? "#1a202c" : "#fff",
      borderColor: state.isFocused ? "#38bdf8" : "#ccc",
      boxShadow: state.isFocused ? "0 0 0 1px #38bdf8" : "none",
      "&:hover": {
        borderColor: "#38bdf8",
      },
      color: isDarkMode ? "#e2e8f0" : "#333",
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: isDarkMode ? "#1a202c" : "#fff",
      color: isDarkMode ? "#e2e8f0" : "#333",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: isDarkMode ? "#e2e8f0" : "#333",
    }),
    input: (provided) => ({
      ...provided,
      color: isDarkMode ? "#e2e8f0" : "#333",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: isDarkMode ? "#94a3b8" : "#a0aec0",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused
        ? isDarkMode
          ? "#2d3748"
          : "#edf2f7"
        : isDarkMode
        ? "#1a202c"
        : "#fff",
      color: isDarkMode ? "#e2e8f0" : "#333",
    }),
  };
  return (
    <div className="m-1 flex items-center justify-center gap-4 dark">
      <label className="dark:text-white">Select Business</label>
      <Select
        className="w-[30rem]"
        options={businessOptions}
        value={selectedBusiness}
        onChange={handleSelect}
        placeholder="Select a business..."
        isClearable
        styles={customStyles}
      />
    </div>
  );
};

export default ReportDropdown;
