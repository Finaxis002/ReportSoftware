import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ClientData = () => {
  const [clientNames, setClientNames] = useState([]); // State to store client names
  const [selectedClient, setSelectedClient] = useState(''); // State to store selected client name
  const [localData, setLocalData] = useState({}); // State to store client data

  // Function to fetch all client names
  const fetchClientNames = async () => {
    try {
      const response = await axios.get('https://backend-three-pink.vercel.app/api/user/all-names');
      setClientNames(response.data); // Assuming response.data is an array of client names
    } catch (error) {
      console.error('Error fetching client names:', error);
      alert('Failed to load client names');
    }
  };

  // Function to fetch selected client details
  const fetchClientData = async (clientName) => {
    try {
      const response = await axios.get(`https://backend-three-pink.vercel.app/api/user/by-name/${clientName}`);
      setLocalData(response.data); // Update localData with fetched client details
    } catch (error) {
      console.error('Error fetching client data:', error);
      alert('Client not found!');
    }
  };

  // Fetch client names when component mounts
  useEffect(() => {
    fetchClientNames();
  }, []);
  
  // Handle client selection
  const handleClientChange = (e) => {
    const clientName = e.target.value;
    setSelectedClient(clientName);
    if (clientName) {
      fetchClientData(clientName); // Fetch data for selected client
    } else {
      setLocalData({}); // Clear data if no client is selected
    }
  };

  return (
    <div>
      <label>Select Client Name:</label>
      <select value={selectedClient} onChange={handleClientChange}>
        <option value="">Select Client</option>
        {clientNames.map((name, index) => (
          <option key={index} value={name}>
            {name}
          </option>
        ))}
      </select>

      {Object.keys(localData).length > 0 && ( // Only render if there's data
        <div>
          <h3>Client Details:</h3>
          <pre>{JSON.stringify(localData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default ClientData;
