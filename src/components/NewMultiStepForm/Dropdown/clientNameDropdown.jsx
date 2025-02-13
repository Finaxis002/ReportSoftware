

///////////////////////////////////////////////////////////////////////////////////////////////////////
// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import Select from "react-select"; // Install using `npm install react-select`

// const ClientNameDropdown = ({ onDataFetch }) => {
//   const [clientOptions, setClientOptions] = useState([]); // Client dropdown options
//   const [selectedClient, setSelectedClient] = useState(null); // Selected client
//   const [businessOptions, setBusinessOptions] = useState([]); // Business dropdown options
//   const [selectedBusiness, setSelectedBusiness] = useState(null); // Selected business
//   const [loadingBusinesses, setLoadingBusinesses] = useState(false); // Loading state

//   // ✅ Fetch all clients when the component mounts
//   useEffect(() => {
//     const fetchClients = async () => {
//       try {
//         const response = await axios.get("http://localhost:5000/api/clients");
//         const options = response.data.map((client) => ({
//           value: client._id,
//           label: client.clientName,
//         }));
//         setClientOptions(options);
//       } catch (error) {
//         console.error("Error fetching clients:", error.message);
//       }
//     };

//     fetchClients();
//   }, []);

//   // ✅ Handle Client Selection - Fetch Business Names
//   const handleClientSelect = async (selectedOption) => {
//     setSelectedClient(selectedOption);
//     setSelectedBusiness(null); // Reset business selection
//     onDataFetch(null); // Reset form fields

//     if (selectedOption) {
//       try {
//         setLoadingBusinesses(true);
//         const response = await axios.get(
//           `http://localhost:5000/api/businesses/${selectedOption.label}`
//         );
//         const businessOptions = response.data.map((business) => ({
//           value: business,
//           label: business,
//         }));
//         setBusinessOptions(businessOptions);
//         setLoadingBusinesses(false);
//       } catch (error) {
//         console.error("Error fetching businesses:", error.message);
//         setLoadingBusinesses(false);
//       }
//     } else {
//       setBusinessOptions([]); // Clear business dropdown if no client selected
//     }
//   };

//   // ✅ Handle Business Selection - Fetch Full Data from API
//   const handleBusinessSelect = async (selectedOption) => {
//     setSelectedBusiness(selectedOption);

//     if (selectedOption && selectedClient) {
//       try {
//         const response = await axios.get(
//           `http://localhost:5000/api/user/by-name/${selectedClient.label}/${selectedOption.label}`
//         );
//         onDataFetch(response.data); // Populate fields using existing API
//       } catch (error) {
//         if (error.response && error.response.status === 404) {
//           alert(`Error: ${error.response.data.error}`); // Show user-friendly alert
//         } else {
//           console.error("Error fetching user details:", error.message);
//         }
//       }
//     }
//   };

//   return (
//     <div className="m-5">
//       {/* ✅ Client Dropdown */}
//       <label>Select Client</label>
//       <Select
//         options={clientOptions} // Client dropdown options
//         value={selectedClient} // Selected client
//         onChange={handleClientSelect} // 🛠️ NOW CORRECTLY CALLING FUNCTION
//         placeholder="Select a client..."
//         isClearable
//       />

//       {/* ✅ Business Dropdown */}
//       <label className="mt-3">Select Business</label>
//       <Select
//         options={businessOptions} // Business dropdown options
//         value={selectedBusiness} // Selected business
//         onChange={handleBusinessSelect} // 🛠️ NOW CORRECTLY CALLING FUNCTION
//         placeholder="Select a business..."
//         isClearable
//         isDisabled={!selectedClient || loadingBusinesses} // Disable if no client is selected
//         isLoading={loadingBusinesses} // Show loading indicator
//       />
//     </div>
//   );
// };

// export default ClientNameDropdown;

/////////////////////////////////////////////////////////////////////////////////////////

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
      {selectedClient && <ReportDropdown key={resetKey} clientName={selectedClient.value} onBusinessSelect={onBusinessSelect} />}
    </div>
  );
};

export default ClientNameDropdown;
