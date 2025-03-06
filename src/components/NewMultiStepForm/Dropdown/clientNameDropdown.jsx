

import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import ReportDropdown from "./ReportDropdown";

const ClientNameDropdown = ({ onClientSelect, onBusinessSelect }) => {
  const [clientOptions, setClientOptions] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get("https://backend-three-pink.vercel.app/api/clients");

        if (response.data && Array.isArray(response.data.clientNames)) {
          const options = response.data.clientNames.map((name) => ({
            value: name,
            label: name,
          }));
          setClientOptions(options);
        } else {
          console.error("Invalid response format:", response.data);
        }
      } catch (error) {
        console.error("Error fetching clients:", error.message);
      }
    };

    fetchClients();
  }, []);

  const handleSelect = (selectedOption) => {
    setSelectedClient(selectedOption);
    onClientSelect(selectedOption ? selectedOption.value : null);
    setResetKey((prevKey) => prevKey + 1);
  };

  return (
    <div className="m-1 flex items-center justify-center gap-4">
      <label>Select Client</label>
      <Select
        className="w-[15rem]"
        options={clientOptions}
        value={selectedClient}
        onChange={handleSelect}
        placeholder="Select a client..."
        isClearable
      />

      {/* Pass onBusinessSelect to ReportDropdown */}
      {/* {selectedClient && <ReportDropdown key={resetKey} clientName={selectedClient.value} onBusinessSelect={onBusinessSelect} />} */}
      {selectedClient && <ReportDropdown key={resetKey} clientName={selectedClient.value} onBusinessSelect={onBusinessSelect} />}
    </div>
  );
};

export default ClientNameDropdown;
