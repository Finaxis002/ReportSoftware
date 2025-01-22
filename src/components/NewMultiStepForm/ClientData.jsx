import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ClientData = () => {
  const [clients, setClients] = useState([]); // State for storing the client names
  const [selectedClientName, setSelectedClientName] = useState(''); // State for selected client name
  const [clientData, setClientData] = useState(null); // State for storing client data

  // Fetch client names when the component mounts
  useEffect(() => {
    const fetchClientNames = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/user'); // Fetch all clients' names
        setClients(response.data); // Update state with client names
      } catch (error) {
        console.error('Error fetching client names:', error);
      }
    };
    fetchClientNames();
  }, []);

  // Handle client selection from the dropdown
  const handleClientChange = async (e) => {
    const clientName = e.target.value;
    setSelectedClientName(clientName); // Set the selected client name

    if (clientName) {
      // Fetch data for the selected client
      try {
        const response = await axios.get(`http://localhost:5000/api/user/by-name/${clientName}`);
        setClientData(response.data); // Set client data in state
      } catch (err) {
        console.error('Error fetching client data:', err);
        setClientData(null); // Clear data if client is not found
      }
    } else {
      setClientData(null); // Clear client data if no selection
    }
  };

  return (
    <div>
      <select value={selectedClientName} onChange={handleClientChange}>
        <option value="">Select Client Name</option>
        {clients.map((client) => (
          <option key={client._id} value={client.clientName}>
            {client.clientName}
          </option>
        ))}
      </select>

      <div>
        {clientData ? (
          <div>
            <h3>Client Data</h3>
            <pre>{JSON.stringify(clientData, null, 2)}</pre>
          </div>
        ) : (
          <p>No client data available.</p>
        )}
      </div>
    </div>
  );
};

export default ClientData;
