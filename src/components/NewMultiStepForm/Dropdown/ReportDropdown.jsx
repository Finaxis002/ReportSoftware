import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import { useLocation } from "react-router-dom";

const ReportDropdown = ({ clientName, onBusinessSelect }) => {
  const [businessOptions, setBusinessOptions] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);

  const location = useLocation(); // ✅ Get location from React Router

  const isCreateReportWithExistingClicked = location.state?.isCreateReportWithExistingClicked || false;

  useEffect(() => {
    if (!clientName) return;

    const fetchBusinesses = async () => {
      try {
        const trimmedClientName = clientName.trim();
        const response = await axios.get(`https://backend-three-pink.vercel.app/api/businesses/${trimmedClientName}`);

        if (response.data && Array.isArray(response.data.businessNames)) {
          const options = response.data.businessNames.map((name) => ({
            value: name,
            label: name,
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
  }, [clientName]);
  
  const handleSelect = async (selectedOption) => {
    setSelectedBusiness(selectedOption);
  
    if (selectedOption && clientName) {
      try {
        const response = await axios.get(
          `https://backend-three-pink.vercel.app/fetch-business-data?clientName=${encodeURIComponent(clientName)}&businessName=${encodeURIComponent(selectedOption.value)}&isCreateReportWithExistingClicked=${isCreateReportWithExistingClicked}`
        );
  
        if (response.data && response.data.data.length > 0) {
          const businessData = response.data.data[0];
  
          // ✅ If creating a new report with existing data, remove sessionId
          onBusinessSelect(businessData, isCreateReportWithExistingClicked ? null : businessData.sessionId);
        } else {
          onBusinessSelect({}, null);
        }
      } catch (error) {
        console.error("Error fetching business data:", error.message);
        onBusinessSelect({}, null);
      }
    }
  };
  
  
  
  

  return (
    <div className="m-1 flex items-center justify-center gap-4">
      <label>Select Business</label>
      <Select
        className="w-[15rem]"
        options={businessOptions}
        value={selectedBusiness}
        onChange={handleSelect}
        placeholder="Select a business..."
        isClearable
      />
      
    </div>
  );
};

export default ReportDropdown;



