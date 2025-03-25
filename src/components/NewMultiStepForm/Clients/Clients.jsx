import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import MenuBar from "../MenuBar";
import Header from "../Header";
import Select from "react-select";

const Clients = () => {
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [clientNames, setClientNames] = useState([]);
  const [error, setError] = useState(null);
  const [selectedClient, setSelectedClient] = useState("All"); // "All" is for showing all clients

  const [newClientDetails, setNewClientDetails] = useState({
    clientName: "",
    contactNo: "",
    emailId: "",
    address: "",
  });

  // Fetch Clients and Form Data
  useEffect(() => {
    const fetchClientsAndFormData = async () => {
      try {
        const [clientsResponse, formDataResponse] = await Promise.all([
          axios.get("https://backend-three-pink.vercel.app/api/clients"),
          axios.get("https://backend-three-pink.vercel.app/api/formdatas"),
        ]);
        console.log("Clients Data:", clientsResponse.data);
        console.log("Form Data:", formDataResponse.data);

        setClients(clientsResponse.data);
        setFormData(formDataResponse.data);

        // Extract client names and store them for the dropdown filter
        const names = clientsResponse.data.map((client) => client.clientName);
        setClientNames(["All", ...names]); // Add "All" to filter all clients
        setFilteredClients(clientsResponse.data); // Initially show all clients
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch data from APIs");
      }
    };

    fetchClientsAndFormData();
  }, []);

  // Fetch Clients and Form Data
  useEffect(() => {
    const fetchClientsAndFormData = async () => {
      try {
        const [clientsResponse] = await Promise.all([axios.get("https://backend-three-pink.vercel.app/api/client-filetrs")]);
        console.log("Client Data:", clientsResponse.data.clientOptions);
  
        // Add "All" to the client options as an object with label and value
        const names = clientsResponse.data.clientOptions.map((client) => ({
          label: client.label, // Client name for display
          value: client.value, // Client email for selection
        }));
  
        // Set the client options with "All" as an object
        setClientNames([{ label: "All", value: "All" }, ...names]); // Add "All" to filter all clients
        setClients(clientsResponse.data.clientOptions);
        setFilteredClients(clientsResponse.data.clientOptions);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  
    fetchClientsAndFormData();
  }, []);
  

  const handleClientFilterChange = (selectedOption) => {
    const selectedClientEmail = selectedOption ? selectedOption.value : "All";

    console.log("Selected Client Email:", selectedClientEmail);

    if (selectedClientEmail === "All") {
      setFilteredClients(clients); // Show all clients if "All" is selected
    } else {
      const filtered = clients.filter(
        (client) => client.value === selectedClientEmail
      );
      console.log("Filtered Clients:", filtered);
      setFilteredClients(filtered);
    }
  };

  const renderMenuBar = () => {
    const authRole = localStorage.getItem("userRole");
    if (!authRole) {
      navigate("/login");
      return null;
    }
    switch (authRole) {
      case "admin":
        return <MenuBar userRole="admin" />;
      case "employee":
        return <MenuBar userRole="employee" />;
      case "client":
        return <MenuBar userRole="client" />;
      default:
        navigate("/login");
        return null;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewClientDetails((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleAddClient = async () => {
    try {
      const response = await axios.post(
        "https://backend-three-pink.vercel.app/api/clients",
        newClientDetails
      );
      console.log(response.data);
      alert("Client added successfully!");
      setShowAddModal(false);
      setNewClientDetails({
        clientName: "",
        contactNo: "",
        emailId: "",
        address: "",
      });
    } catch (error) {
      console.error("Error adding client:", error);
      alert("Failed to add client!");
    }
  };

  return (
    <div className="flex h-[100vh] bg-gray-100">
      {renderMenuBar()}
      <div className="app-content p-8 w-full">
        <Header dashboardType="Admin Dashboard" />

        <div className="h-[80vh] overflow-y-auto p-4">
          {/* Add Client Button */}
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition duration-300 transform hover:scale-105"
            >
              + Add Client
            </button>
          </div>

          <h2 className="text-3xl font-semibold text-gray-800 mb-6">
            Clients List
          </h2>

          {/* Filter Dropdown */}
          {/* <div className="mb-4 w-1/3">
            <Select
              options={clientNames} // Make sure you're passing the correct array of objects
              value={clientNames.find(
                (option) => option.value === selectedClient
              )} // Set the selected client
              onChange={handleClientFilterChange} // Update the selected client
              placeholder="Select Client"
              isClearable
            />
          </div> */}

          {/* Clients Card Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8 px-4 py-6">
            {clients.length > 0 ? (
              clients.map((client) => (
                <div
                  key={client._id}
                  className="bg-white p-6 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  {/* Client Info */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {client.clientName}
                    </h3>
                    <p className="text-sm text-gray-600">{client.contactNo}</p>
                    <p className="text-sm text-gray-600">{client.emailId}</p>
                    <p className="text-sm text-gray-600">{client.address}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500">
                No clients available.
              </div>
            )}

            {formData.length > 0 ? (
              formData.map((data, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  {/* Form Data Info */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {data.clientName}
                    </h3>
                    <p className="text-sm text-gray-600">{data.clientEmail}</p>
                    <p className="text-sm text-gray-600">{data.clientPhone}</p>
                    <p className="text-sm text-gray-600">
                      {data.businessDescription || "No description available"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500">
                No form data available.
              </div>
            )}
          </div>

          {/* Add Client Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-40 backdrop-blur-md flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-lg">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                  Add New Client
                </h2>

                <div className="space-y-4">
                  {/* Client Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client Name
                    </label>
                    <input
                      type="text"
                      name="clientName"
                      value={newClientDetails.clientName}
                      onChange={handleInputChange}
                      placeholder="Enter Client Name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>

                  {/* Contact Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Number
                    </label>
                    <input
                      type="text"
                      name="contactNo"
                      value={newClientDetails.contactNo}
                      onChange={handleInputChange}
                      placeholder="Enter Contact Number"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>

                  {/* Email ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email ID
                    </label>
                    <input
                      type="email"
                      name="emailId"
                      value={newClientDetails.emailId}
                      onChange={handleInputChange}
                      placeholder="Enter Email ID"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={newClientDetails.address}
                      onChange={handleInputChange}
                      placeholder="Enter Address"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-6">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddClient}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Clients;
