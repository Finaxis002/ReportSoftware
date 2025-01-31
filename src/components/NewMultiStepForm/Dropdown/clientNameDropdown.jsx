import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select"; // Install using `npm install react-select`

const ClientNameDropdown = ({ onClientSelect }) => {
  const [clientOptions, setClientOptions] = useState([]); // Dropdown options
  const [selectedClient, setSelectedClient] = useState(null); // Selected client

  // Fetch all client names on component mount
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/clients");
        const options = response.data.map((client) => ({
          value: client.clientName,
          label: client.clientName,
        }));
        setClientOptions(options); // Set dropdown options
      } catch (error) {
        console.error("Error fetching clients:", error.message);
      }
    };

    fetchClients();
  }, []);

  // Handle client selection
  const handleSelect = (selectedOption) => {
    setSelectedClient(selectedOption); // Update the selected client state
    onClientSelect(selectedOption ? selectedOption.value : null); // Pass the selected client name to the parent
  };

  return (
    <div className="m-1">
      <label>Select Client</label>
      <Select
      className="w-[15rem]"
        options={clientOptions} // Dropdown options
        value={selectedClient} // Selected value
        onChange={handleSelect} // Handle selection
        placeholder="select a client..."
        isClearable // Allows clearing the selection
      />
    </div>
  );
};

export default ClientNameDropdown;
