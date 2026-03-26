import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import "../../../css/reportForm.css";

const AllReportsDropdown = ({ onBusinessSelect, showAll = false, consultantId }) => {
  const [reportOptions, setReportOptions] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);

  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );
   const BASE_URL = process.env.REACT_APP_BASE_URL || 'https://reportsbe.sharda.co.in';

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
    const fetchReports = async () => {
      try {
        let url = `${BASE_URL}/api/consultant-reports/get-all-reports`;
        
        // Check for consultantId - from props first, then localStorage
        const consultantIdToUse = consultantId || localStorage.getItem("consultantId");
        
        if (showAll) {
          url += '?all=true';
        } else if (consultantIdToUse) {
          url += `?consultantId=${consultantIdToUse}`;
        }
        
        const response = await axios.get(url);

        if (response.data && response.data.success && Array.isArray(response.data.data)) {
          const options = response.data.data.map((report) => ({
            value: report,
            label: `${report.AccountInformation?.businessName || 'Unknown'} (${report.AccountInformation?.clientName || 'Unknown'}) - ${report.type}`,
          }));
          setReportOptions(options);
        } else {
          console.error("Invalid response format:", response.data);
        }
      } catch (error) {
        console.error("Error fetching reports:", error.message);
      }
    };

    fetchReports();
  }, []);

  const handleSelect = (selectedOption) => {
    setSelectedReport(selectedOption);

    if (selectedOption) {
      const reportData = selectedOption.value;
      const sessionId = reportData.sessionId;
      onBusinessSelect?.(reportData, sessionId);
    } else {
      onBusinessSelect?.({}, null);
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
        <Select
          className="w-full sm:w-[30rem]"
          options={reportOptions}
          value={selectedReport}
          onChange={handleSelect}
          placeholder={
            <span className="text-gray-400 dark:text-gray-400">
              Select a report...
            </span>
          }
          isClearable
          styles={{
            control: (base) => ({
              ...base,
              backgroundColor: 'transparent',
              borderColor: '#e2e8f0',
              '&:hover': {
                borderColor: '#cbd5e1'
              },
              minHeight: '40px',
              boxShadow: 'none',
              borderRadius: '8px',
            }),
            menu: (base) => ({
              ...base,
              backgroundColor: '#ffffff',
              borderColor: '#e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              zIndex: 9999,
            }),
            option: (base, { isFocused, isSelected }) => ({
              ...base,
              backgroundColor: isSelected
                ? '#3b82f6'
                : isFocused
                ? '#f1f5f9'
                : undefined,
              color: isSelected ? 'white' : '#1e293b',
              '&:active': {
                backgroundColor: '#3b82f6',
                color: 'white'
              }
            }),
          }}
        />
      </div>
    </div>
  );
};

export default AllReportsDropdown;