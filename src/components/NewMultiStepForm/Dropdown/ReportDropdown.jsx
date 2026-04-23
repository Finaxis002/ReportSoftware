
import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import "../../../css/reportForm.css";

const ReportDropdown = ({ onBusinessSelect }) => {
  const BASE_URL = process.env.REACT_APP_BASE_URL || 'https://reportsbe.sharda.co.in';
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

  const buildOptionFromReport = (report) => {
    const accountInformation = report?.AccountInformation || {};
    const businessName = accountInformation.businessName || "Unknown";
    const businessOwner = accountInformation.businessOwner || "Unknown Owner";
    const referredBy =
      accountInformation.referredBy || accountInformation.clientName || "";
    const labelParts = [`${businessName} (${businessOwner})`];

    if (referredBy) {
      labelParts.push(`Referred By: ${referredBy}`);
    }

    return {
      value: report.sessionId || report._id || labelParts.join(" - "),
      label: labelParts.join(" - "),
      sessionId: report.sessionId,
      businessName,
      businessOwner,
      referredBy,
    };
  };

  const buildOptionFromBusinessEntry = (entry) => {
    if (typeof entry === "string") {
      return {
        value: entry,
        label: entry,
      };
    }

    const referredBy = entry.referredBy || entry.clientName || "";
    const baseLabel =
      entry.label ||
      `${entry.businessName || "Unknown"} (${entry.businessOwner || "Unknown Owner"})`;
    const labelParts = [baseLabel];

    if (referredBy && !baseLabel.includes("Referred By:")) {
      labelParts.push(`Referred By: ${referredBy}`);
    }

    return {
      value: entry.sessionId || entry.label,
      label: labelParts.join(" - "),
      sessionId: entry.sessionId,
      businessName: entry.businessName,
      businessOwner: entry.businessOwner,
      referredBy,
    };
  };

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const reportsResponse = await axios.get(`${BASE_URL}/get-report`);
        const reports = reportsResponse.data?.data;

        if (Array.isArray(reports)) {
          setBusinessOptions(reports.map(buildOptionFromReport));
          return;
        }

        const response = await axios.get(`${BASE_URL}/api/businesses`);
        const businesses = Array.isArray(response.data?.businessDetails)
          ? response.data.businessDetails
          : response.data?.businesses;

        if (Array.isArray(businesses)) {
          setBusinessOptions(businesses.map(buildOptionFromBusinessEntry));
        } else {
          console.error("Invalid response format:", response.data);
        }
      } catch (error) {
        try {
          const response = await axios.get(`${BASE_URL}/api/businesses`);
          const businesses = Array.isArray(response.data?.businessDetails)
            ? response.data.businessDetails
            : response.data?.businesses;

          if (Array.isArray(businesses)) {
            setBusinessOptions(businesses.map(buildOptionFromBusinessEntry));
          } else {
            console.error("Invalid response format:", response.data);
          }
        } catch (fallbackError) {
          console.error("Error fetching businesses:", fallbackError.message);
        }
      }
    };

    fetchBusinesses();
  }, []);

  const splitBusinessLabel = (label = "") => {
    const lastOpenParen = label.lastIndexOf(" (");
    const lastCloseParen = label.endsWith(")") ? label.length - 1 : -1;

    if (lastOpenParen >= 0 && lastCloseParen > lastOpenParen) {
      return {
        businessName: label.slice(0, lastOpenParen).trim(),
        businessOwner: label.slice(lastOpenParen + 2, lastCloseParen).trim(),
      };
    }

    return {
      businessName: label.trim(),
      businessOwner: "",
    };
  };

  const handleSelect = async (selectedOption) => {
    setSelectedBusiness(selectedOption);
  
    if (selectedOption) {
      const selectedBusinessFullName = selectedOption.label || selectedOption.value;
      const parsedBusiness = splitBusinessLabel(selectedBusinessFullName);
      const businessName = selectedOption.businessName || parsedBusiness.businessName;
      const businessOwner = selectedOption.businessOwner || parsedBusiness.businessOwner;
  
      try {
        const response = selectedOption.sessionId
          ? await axios.get(`${BASE_URL}/get-report`, {
              params: { sessionId: selectedOption.sessionId },
            })
          : await axios.get(`${BASE_URL}/fetch-business-data`, {
              params: {
                businessName,
                businessOwner,
              },
            });
  
        const responseData = response.data?.data;
        const businessData = Array.isArray(responseData)
          ? responseData.find((item) => {
              const accountInformation = item?.AccountInformation || {};
              return (
                accountInformation.businessName?.trim().toLowerCase() === businessName.toLowerCase() &&
                (!businessOwner ||
                  accountInformation.businessOwner?.trim().toLowerCase() === businessOwner.toLowerCase())
              );
            }) || responseData[0]
          : responseData;

        if (businessData) {
          const sessionId = businessData.sessionId || null;
          onBusinessSelect?.(businessData, sessionId);
        } else {
          onBusinessSelect?.({}, null);
        }
      } catch (error) {
        console.error("Error fetching business data:", error.message);
        onBusinessSelect?.({}, null);
      }
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
      options={businessOptions}
      value={selectedBusiness}
      onChange={handleSelect}
      placeholder={
        <span className="text-gray-400 dark:text-gray-400">
          Select a business...
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

export default ReportDropdown;
