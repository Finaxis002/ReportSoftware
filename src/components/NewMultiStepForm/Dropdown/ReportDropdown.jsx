// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import Select from "react-select";
// import { useLocation } from "react-router-dom";

// const ReportDropdown = ({ clientName, onBusinessSelect }) => {
//   const [businessOptions, setBusinessOptions] = useState([]);
//   const [selectedBusiness, setSelectedBusiness] = useState(null);

//   const location = useLocation(); // ✅ Get location from React Router

//   const isCreateReportWithExistingClicked = location.state?.isCreateReportWithExistingClicked || false;

//   useEffect(() => {
//     if (!clientName) return;

//     const fetchBusinesses = async () => {
//       try {
//         const trimmedClientName = clientName.trim();
//         const response = await axios.get(`https://backend-three-pink.vercel.app/api/businesses/${trimmedClientName}`);

//         if (response.data && Array.isArray(response.data.businessNames)) {
//           const options = response.data.businessNames.map((name) => ({
//             value: name,
//             label: name,
//           }));
//           setBusinessOptions(options);
//         } else {
//           console.error("Invalid response format:", response.data);
//         }
//       } catch (error) {
//         console.error("Error fetching businesses:", error.message);
//       }
//     };

//     fetchBusinesses();
//   }, [clientName]);

//   const handleSelect = async (selectedOption) => {
//     setSelectedBusiness(selectedOption);

//     if (selectedOption && clientName) {
//       try {
//         const response = await axios.get(
//           `https://backend-three-pink.vercel.app/fetch-business-data?clientName=${encodeURIComponent(clientName)}&businessName=${encodeURIComponent(selectedOption.value)}&isCreateReportWithExistingClicked=${isCreateReportWithExistingClicked}`
//         );

//         if (response.data && response.data.data.length > 0) {
//           const businessData = response.data.data[0];

//           // ✅ If creating a new report with existing data, remove sessionId
//           onBusinessSelect(businessData, isCreateReportWithExistingClicked ? null : businessData.sessionId);
//         } else {
//           onBusinessSelect({}, null);
//         }
//       } catch (error) {
//         console.error("Error fetching business data:", error.message);
//         onBusinessSelect({}, null);
//       }
//     }
//   };

//   return (
//     <div className="m-1 flex items-center justify-center gap-4">
//       <label>Select Business</label>
//       <Select
//         className="w-[15rem]"
//         options={businessOptions}
//         value={selectedBusiness}
//         onChange={handleSelect}
//         placeholder="Select a business..."
//         isClearable
//       />

//     </div>
//   );
// };

// export default ReportDropdown;

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
          "https://backend-three-pink.vercel.app/api/businesses"
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
      const match = selectedBusinessFullName.match(/^(.*?)\((.*?)\)$/); // Extract business and client name
      const businessName = match ? match[1].trim() : selectedBusinessFullName;
      const clientName = match ? match[2].trim() : "Unknown Client";

      try {
        const response = await axios.get(
          `https://backend-three-pink.vercel.app/fetch-business-data?clientName=${encodeURIComponent(
            clientName
          )}&businessName=${encodeURIComponent(businessName)}`
        );

        if (response.data && response.data.data.length > 0) {
          const businessData = response.data.data[0];

          // ✅ Ensure sessionId is stored properly
          const sessionId = businessData.sessionId || null;

          onBusinessSelect?.(businessData, sessionId); // ✅ Pass sessionId
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
