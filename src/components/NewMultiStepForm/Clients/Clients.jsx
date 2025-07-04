// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import MenuBar from "../MenuBar";
// import Header from "../Header";
// import Select from "react-select";
// import ExportClientsButton from "./ExportClientsButton";

// const Clients = () => {
//   const navigate = useNavigate();
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [clients, setClients] = useState([]);
//   const [formData, setFormData] = useState([]);
//   const [filteredClients, setFilteredClients] = useState([]);
//   const [clientNames, setClientNames] = useState([]);
//   const [error, setError] = useState(null);
//   const [selectedClient, setSelectedClient] = useState(null); // "All" is for showing all clients

//   const [newClientDetails, setNewClientDetails] = useState({
//     clientName: "",
//     contactNo: "",
//     emailId: "",
//     address: "",
//   });
//   const [currentSource, setCurrentSource] = useState("clients");
//   const [currentSessionId, setCurrentSessionId] = useState(null);

//   // Fetch Clients and Form Data
//   useEffect(() => {
//     const fetchClientsAndFormData = async () => {
//       try {
//         const [clientsResponse, formDataResponse] = await Promise.all([
//           axios.get("http://localhost:5000/api/formFilter/clients"),
//           axios.get("https://reportsbe.sharda.co.in/api/formdatas"),
//         ]);
//         console.log("Clients Data:", clientsResponse.data);
//         console.log("Form Data:", formDataResponse.data);

//         setClients(clientsResponse.data);
//         setFormData(formDataResponse.data);

//         // Extract client names and store them for the dropdown filter
//         const names = clientsResponse.data.map((client) => client.clientName);
//         setClientNames(["All", ...names]); // Add "All" to filter all clients
//         setFilteredClients(clientsResponse.data); // Initially show all clients
//       } catch (error) {
//         console.error("Error fetching data:", error);
//         setError("Failed to fetch data from APIs");
//       }
//     };

//     fetchClientsAndFormData();
//   }, []);

//   const handleClientFilterChange = (selectedOption) => {
//     const selectedClientEmail = selectedOption ? selectedOption.value : "All";

//     console.log("Selected Client Email:", selectedClientEmail);

//     if (selectedClientEmail === "All") {
//       setFilteredClients(clients); // Show all clients if "All" is selected
//     } else {
//       const filtered = clients.filter(
//         (client) => client.value === selectedClientEmail
//       );
//       console.log("Filtered Clients:", filtered);
//       setFilteredClients(filtered);
//     }
//   };

//   const renderMenuBar = () => {
//     const authRole = localStorage.getItem("userRole");
//     if (!authRole) {
//       navigate("/login");
//       return null;
//     }
//     switch (authRole) {
//       case "admin":
//         return <MenuBar userRole="admin" />;
//       case "employee":
//         return <MenuBar userRole="employee" />;
//       case "client":
//         return <MenuBar userRole="client" />;
//       default:
//         navigate("/login");
//         return null;
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setNewClientDetails((prevState) => ({
//       ...prevState,
//       [name]: value,
//     }));
//   };

//   // const handleAddClient = async () => {
//   //   try {
//   //     const response = await axios.post(
//   //       "https://reportsbe.sharda.co.in/api/clients",
//   //       newClientDetails
//   //     );
//   //     console.log(response.data);
//   //     alert("Client added successfully!");
//   //     setShowAddModal(false);
//   //     setNewClientDetails({
//   //       clientName: "",
//   //       contactNo: "",
//   //       emailId: "",
//   //       address: "",
//   //     });
//   //   } catch (error) {
//   //     console.error("Error adding client:", error);
//   //     alert("Failed to add client!");
//   //   }
//   // };

//   const handleDeleteClient = async (clientId) => {
//     if (window.confirm("Are you sure you want to delete this client?")) {
//       try {
//         await axios.delete(
//           `https://reportsbe.sharda.co.in/api/clients/${clientId}`
//         );
//         alert("Client deleted successfully!");
//         setClients((prev) => prev.filter((client) => client._id !== clientId));
//       } catch (error) {
//         console.error("Error deleting client:", error);
//         alert("Failed to delete client!");
//       }
//     }
//   };

//   // const handleEditClient = (client) => {
//   //   setNewClientDetails({
//   //     clientName: client.clientName,
//   //     contactNo: client.contactNo,
//   //     emailId: client.emailId,
//   //     address: client.address,
//   //   });
//   //   setShowAddModal(true);
//   //   // Store client ID to update later
//   //   setSelectedClient(client._id);
//   // };

//   const handleEditClient = (client, source = "clients") => {
//     console.log("Editing client from source:", source);
//     console.log("Client Object:", client);

//     if (source === "clients") {
//       setNewClientDetails({
//         clientName: client.clientName || "",
//         contactNo: client.clientPhone || "",
//         emailId: client.clientEmail || "",
//         address: client.address || "",
//       });
//       setSelectedClient(client._id);
//        setCurrentSessionId(client.sessionId || "");
//       setCurrentSource("clients");
//     } else if (source === "formData") {
//       console.log("SessionId in client:", client.sessionId);
//       setNewClientDetails({
//         clientName: client.clientName || "",
//         contactNo: client.clientPhone || "",
//         emailId: client.clientEmail || "",
//         address: client.location || "",
//       });
//       setSelectedClient(null);
//       setCurrentSessionId(client.sessionId); // <--- THIS IS CRITICAL
//       setCurrentSource("formData");
//     }

//     setShowAddModal(true);
//   };

//   // const handleAddClient = async () => {
//   //   try {
//   //     if (selectedClient) {
//   //       // Update client
//   //       await axios.put(
//   //         `https://reportsbe.sharda.co.in/api/clients/${selectedClient}`,
//   //         newClientDetails
//   //       );
//   //       alert("Client updated successfully!");
//   //     } else {
//   //       // Add new client
//   //       await axios.post(
//   //         "https://reportsbe.sharda.co.in/api/clients",
//   //         newClientDetails
//   //       );
//   //       alert("Client added successfully!");
//   //     }

//   //     setShowAddModal(false);
//   //     setNewClientDetails({
//   //       clientName: "",
//   //       contactNo: "",
//   //       emailId: "",
//   //       address: "",
//   //     });
//   //     setSelectedClient(null); // Reset
//   //     // Refetch clients
//   //     const response = await axios.get(
//   //       "https://reportsbe.sharda.co.in/api/clients"
//   //     );
//   //     setClients(response.data);
//   //   } catch (error) {
//   //     console.error("Error saving client:", error);
//   //     alert("Failed to save client!");
//   //   }
//   // };

//   const handleAddClient = async () => {
//     console.log("SelectedClient ID:", selectedClient);
//     console.log("Current Source:", currentSource);
//     console.log("Current SessionId:", currentSessionId);
//     console.log("New Client Details:", newClientDetails);

//     try {
//       // ✅ Update clients using PUT /api/clients/:id
//       if (selectedClient && currentSource === "clients") {
//         await axios.put(
//           `https://reportsbe.sharda.co.in/api/clients/${selectedClient}`, // PUT request for updating the client
//           newClientDetails
//         );
//         alert("Client updated successfully!");
//       }
//       // ✅ Update formData clients using sessionId (POST /update-step)
//       else if (currentSource === "formData" && currentSessionId) {
//         await axios.post("https://reportsbe.sharda.co.in/update-step", {
//           sessionId: currentSessionId, // Pass the sessionId to update formData client
//           data: {
//             clientName: newClientDetails.clientName,
//             clientPhone: newClientDetails.contactNo,
//             clientEmail: newClientDetails.emailId,
//             location: newClientDetails.address,
//           },
//         });
//         alert("Form Data client updated successfully!");
//       }
//       // ✅ Create new client (POST /api/clients) if neither updating nor formData
//       else {
//         await axios.post(
//           "https://reportsbe.sharda.co.in/api/clients",
//           newClientDetails
//         );
//         alert("New client added successfully!");
//       }

//       // Reset modal and data
//       setShowAddModal(false);
//       setNewClientDetails({
//         clientName: "",
//         contactNo: "",
//         emailId: "",
//         address: "",
//       });
//       setSelectedClient(null); // Reset selected client
//       setCurrentSessionId(null); // Reset sessionId
//       setCurrentSource("clients"); // Reset source to "clients"

//       // Refetch updated data
//       const [clientsRes, formDataRes] = await Promise.all([
//         axios.get("https://reportsbe.sharda.co.in/api/clients"),
//         axios.get("https://reportsbe.sharda.co.in/api/formdatas"),
//       ]);
//       setClients(clientsRes.data);
//       setFormData(formDataRes.data);
//       // setFilteredClients([...clientsRes.data, ...formDataRes.data]);
//     } catch (error) {
//       console.error("❌ Error saving client:", error);
//       alert("Failed to save client!");
//     }
//   };

//   return (
//     <div className="flex h-[100vh] bg-gray-100 dark:bg">
//       {renderMenuBar()}
//       <div className="app-content p-8 w-full">
//         <Header dashboardType="Admin Dashboard" />

//         <div className="h-[80vh] overflow-y-auto p-4">
//           {/* Add Client Button */}
//           <div className="flex justify-end mb-6">
//             <button
//               onClick={() => {
//                 setSelectedClient(null);
//                 setNewClientDetails({
//                   clientName: "",
//                   contactNo: "",
//                   emailId: "",
//                   address: "",
//                 });
//                 setShowAddModal(true);
//               }}
//               className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition duration-300 transform hover:scale-105"
//             >
//               + Add Client
//             </button>

//             <ExportClientsButton clients={clients} formData={formData} />
//           </div>

//           <h2 className="text-3xl font-semibold text-gray-800 dark:text-white dark:text-gray-100 mb-6">
//             Clients List
//           </h2>

//           {/* Clients Card Layout */}

//           <div className="grid grid-cols-1 sm:grid-cols-2  md:grid-cols-3 lg:grid-cols-3 gap-8 px-4 py-6">
//             {clients.length > 0 ? (
//               clients.map((client) => (
//                 <div
//                   key={client._id}
//                   className="relative /5 dark:/10 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-lg transition-transform hover:scale-[1.02]"
//                 >
//                   {/* Header with Avatar & Name */}
//                   <div className="flex items-center gap-4 mb-4">
//                     <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-500 to-teal-400 flex items-center justify-center text-white text-xl font-bold shadow-md">
//                       {client.clientName?.charAt(0).toUpperCase()}
//                     </div>
//                     <div>
//                       <h3 className="text-xl font-bold text-gray-900 dark:text-white">
//                         {client.clientName}
//                       </h3>
//                       <p className="text-xs text-gray-500 dark:text-gray-400">
//                         Client Profile
//                       </p>
//                     </div>
//                   </div>

//                   {/* Details */}
//                   <div className="space-y-3 text-[15px]">
//                     <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
//                       <span className="text-blue-500 dark:text-blue-300">
//                         📞
//                       </span>
//                       <span>{client.clientPhone || "Not Available"}</span>
//                     </div>

//                     <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
//                       <span className="text-green-500 dark:text-green-300">
//                         📧
//                       </span>
//                       <span>{client.clientEmail || "Not Available"}</span>
//                     </div>

//                     <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
//                       <span className="text-red-400 dark:text-red-300">📍</span>
//                       <span>{client.address || "Not Provided"}</span>
//                     </div>

//                     <div className="flex justify-end gap-2 mt-4">
//                       <button
//                         onClick={() => handleEditClient(client)}
//                         className="text-sm px-4 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
//                       >
//                         Edit
//                       </button>
//                       <button
//                         onClick={() => handleDeleteClient(client._id)}
//                         className="text-sm px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
//                       >
//                         Delete
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <div className="col-span-full text-center text-gray-500">
//                 No clients available.
//               </div>
//             )}

//             {formData.length > 0 ? (
//               formData.map((data, index) => {
//                 console.log("FormData Card:", data);
//                 <div
//                   key={index}
//                   className="relative /5 dark:/10 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-lg transition-transform hover:scale-[1.02]"
//                 >
//                   {/* Header with Avatar & Name */}
//                   <div className="flex items-center gap-4 mb-4">
//                     <div className="w-14 h-14 rounded-full bg-gradient-to-tr  from-blue-500 to-teal-400 flex items-center justify-center text-white text-xl font-bold shadow-md">
//                       {data.clientName?.charAt(0).toUpperCase()}
//                     </div>
//                     <div>
//                       <h3 className="text-xl font-bold text-gray-900 dark:text-white">
//                         {data.clientName || "Unknown"}
//                       </h3>
//                       <p className="text-xs text-gray-500 dark:text-gray-400">
//                         Client Entry
//                       </p>
//                     </div>
//                   </div>

//                   {/* Details */}
//                   <div className="space-y-3 text-[15px]">
//                     <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
//                       <span className="text-green-500 dark:text-green-300">
//                         📧
//                       </span>
//                       <span>{data.clientEmail || "Email not provided"}</span>
//                     </div>

//                     <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
//                       <span className="text-blue-500 dark:text-blue-300">
//                         📞
//                       </span>
//                       <span>{data.clientPhone || "Phone not available"}</span>
//                     </div>

//                     <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
//                       <span className="text-red-400 dark:text-red-300">📍</span>
//                       <span>{data.location || "Not Provided"}</span>
//                     </div>

//                     <div className="flex justify-end gap-2 mt-4">
//                       <button
//                         onClick={() => handleEditClient(data, "formData")}
//                         className="text-sm px-4 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
//                       >
//                         Edit
//                       </button>
//                     </div>
//                   </div>
//                 </div>;
//               })
//             ) : (
//               <div className="col-span-full text-center text-gray-500">
//                 No form data available.
//               </div>
//             )}
//           </div>

//           {/* Add Client Modal */}
//           {showAddModal && (
//             <div className="fixed inset-0 dark:border-white bg-gray-900 bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
//               <div className=" dark:bg-gray-900 bg-gray-50 dark:border-white border rounded-2xl shadow-2xl p-8 w-full max-w-lg animate-fadeIn">
//                 {/* Title */}
//                 <h2 className="text-3xl font-semibold text-gray-800 dark:text-white mb-8 border-b pb-4 flex items-center gap-2">
//                   <i className="fas fa-user-plus text-indigo-600 text-xl" />
//                   {selectedClient || currentSessionId
//                     ? "Edit Client"
//                     : "Add New Client"}
//                 </h2>

//                 {/* Form Grid */}
//                 <div className="space-y-5">
//                   {/* Client Name */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
//                       Client Name
//                     </label>
//                     <div className="relative">
//                       <i className="fas fa-user absolute left-3 top-3 text-gray-400" />
//                       <input
//                         type="text"
//                         name="clientName"
//                         value={newClientDetails.clientName}
//                         onChange={handleInputChange}
//                         placeholder="Enter Client Name"
//                         className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg  dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 transition"
//                       />
//                     </div>
//                   </div>

//                   {/* Contact Number */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
//                       Contact Number
//                     </label>
//                     <div className="relative">
//                       <i className="fas fa-phone-alt absolute left-3 top-3 text-gray-400" />
//                       <input
//                         type="text"
//                         name="contactNo"
//                         value={newClientDetails.contactNo}
//                         onChange={handleInputChange}
//                         placeholder="Enter Contact Number"
//                         className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg  dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 transition"
//                       />
//                     </div>
//                   </div>

//                   {/* Email ID */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
//                       Email ID
//                     </label>
//                     <div className="relative">
//                       <i className="fas fa-envelope absolute left-3 top-3 text-gray-400" />
//                       <input
//                         type="email"
//                         name="emailId"
//                         value={newClientDetails.emailId}
//                         onChange={handleInputChange}
//                         placeholder="Enter Email ID"
//                         className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg  dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 transition"
//                       />
//                     </div>
//                   </div>

//                   {/* Address */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
//                       Address
//                     </label>
//                     <div className="relative">
//                       <i className="fas fa-map-marker-alt absolute left-3 top-3 text-gray-400" />
//                       <input
//                         type="text"
//                         name="address"
//                         value={newClientDetails.address}
//                         onChange={handleInputChange}
//                         placeholder="Enter Address"
//                         className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg  dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 transition"
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 {/* Buttons */}
//                 <div className="flex justify-end gap-4 mt-8">
//                   <button
//                     onClick={() => setShowAddModal(false)}
//                     className="px-6 py-2 text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition"
//                   >
//                     <i className="fas fa-times mr-2" />
//                     Cancel
//                   </button>
//                   <button
//                     onClick={handleAddClient}
//                     className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition shadow-md"
//                   >
//                     <i className="fas fa-check mr-2" />
//                     Submit
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Clients;





import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import MenuBar from "../MenuBar";
import Header from "../Header";
import Select from "react-select";
import ExportClientsButton from "./ExportClientsButton";

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
          axios.get("https://reportsbe.sharda.co.in/api/clients"),
          axios.get("https://reportsbe.sharda.co.in/api/formdatas"),
        ]);
       

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
  // useEffect(() => {
  //   const fetchClientsAndFormData = async () => {
  //     try {
  //       const [clientsResponse] = await Promise.all([
  //         axios.get("https://reportsbe.sharda.co.in/api/client-filetrs"),
  //       ]);
  //       console.log("Client Data:", clientsResponse.data.clientOptions);

  //       // Add "All" to the client options as an object with label and value
  //       const names = clientsResponse.data.clientOptions.map((client) => ({
  //         label: client.label, // Client name for display
  //         value: client.value, // Client email for selection
  //       }));

  //       // Set the client options with "All" as an object
  //       setClientNames([{ label: "All", value: "All" }, ...names]); // Add "All" to filter all clients
  //       setClients(clientsResponse.data.clientOptions);
  //       setFilteredClients(clientsResponse.data.clientOptions);
  //     } catch (error) {
  //       console.error("Error fetching data:", error);
  //     }
  //   };

  //   fetchClientsAndFormData();
  // }, []);

  const handleClientFilterChange = (selectedOption) => {
    const selectedClientEmail = selectedOption ? selectedOption.value : "All";

    

    if (selectedClientEmail === "All") {
      setFilteredClients(clients); // Show all clients if "All" is selected
    } else {
      const filtered = clients.filter(
        (client) => client.value === selectedClientEmail
      );
      
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

  // const handleAddClient = async () => {
  //   try {
  //     const response = await axios.post(
  //       "https://reportsbe.sharda.co.in/api/clients",
  //       newClientDetails
  //     );
  //     console.log(response.data);
  //     alert("Client added successfully!");
  //     setShowAddModal(false);
  //     setNewClientDetails({
  //       clientName: "",
  //       contactNo: "",
  //       emailId: "",
  //       address: "",
  //     });
  //   } catch (error) {
  //     console.error("Error adding client:", error);
  //     alert("Failed to add client!");
  //   }
  // };
  const handleDeleteClient = async (clientId) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      try {
        await axios.delete(
          `https://reportsbe.sharda.co.in/api/clients/${clientId}`
        );
        alert("Client deleted successfully!");
        setClients((prev) => prev.filter((client) => client._id !== clientId));
      } catch (error) {
        console.error("Error deleting client:", error);
        alert("Failed to delete client!");
      }
    }
  };

  const handleEditClient = (client) => {
    setNewClientDetails({
      clientName: client.clientName,
      contactNo: client.contactNo,
      emailId: client.emailId,
      address: client.address,
    });
    setShowAddModal(true);
    // Store client ID to update later
    setSelectedClient(client._id);
  };

  const handleAddClient = async () => {
    try {
      if (selectedClient) {
        // Update client
        await axios.put(
          `https://reportsbe.sharda.co.in/api/clients/${selectedClient}`,
          newClientDetails
        );
        alert("Client updated successfully!");
      } else {
        // Add new client
        await axios.post(
          "https://reportsbe.sharda.co.in/api/clients",
          newClientDetails
        );
        alert("Client added successfully!");
      }

      setShowAddModal(false);
      setNewClientDetails({
        clientName: "",
        contactNo: "",
        emailId: "",
        address: "",
      });
      setSelectedClient(null); // Reset
      // Refetch clients
      const response = await axios.get(
        "https://reportsbe.sharda.co.in/api/clients"
      );
      setClients(response.data);
    } catch (error) {
      console.error("Error saving client:", error);
      alert("Failed to save client!");
    }
  };

  return (
    <div className="flex h-[100vh] bg-gray-100 dark:bg">
      {renderMenuBar()}
      <div className="app-content p-8 w-full">
        <Header dashboardType="Admin Dashboard" />

        <div className="h-[80vh] overflow-y-auto p-4">
          {/* Add Client Button */}
          <div className="flex justify-end mb-6">
            <button
              onClick={() => {
                setSelectedClient(null);
                setNewClientDetails({
                  clientName: "",
                  contactNo: "",
                  emailId: "",
                  address: "",
                });
                setShowAddModal(true);
              }}
              className="px-6 py-3 bg-blue-500 text-white rounded-xl shadow-lg hover:bg-blue-700 transition duration-300 transform hover:scale-105"
            >
              + Add Client
            </button>
              <ExportClientsButton clients={clients} formData={formData} />
          </div>

          <h2 className="text-3xl font-semibold text-gray-800 dark:text-white dark:text-gray-100 mb-6">
            Clients List
          </h2>

          {/* Clients Card Layout */}
          
          <div className="grid grid-cols-1 sm:grid-cols-2  md:grid-cols-3 lg:grid-cols-3 gap-8 px-4 py-6">
            {clients.length > 0 ? (
              clients.map((client) => (
                <div
                  key={client._id}
                  className="relative /5 dark:/10 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-lg transition-transform hover:scale-[1.02]"
                >
                  {/* Header with Avatar & Name */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-500 to-teal-400 flex items-center justify-center text-white text-xl font-bold shadow-md">
                      {client.clientName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {client.clientName}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Client Profile
                      </p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-3 text-[15px]">
                    <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
                      <span className="text-blue-500 dark:text-blue-300">
                        📞
                      </span>
                      <span>{client.contactNo || "Not Available"}</span>
                    </div>

                    <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
                      <span className="text-green-500 dark:text-green-300">
                        📧
                      </span>
                      <span>{client.emailId || "Not Available"}</span>
                    </div>

                    <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
                      <span className="text-red-400 dark:text-red-300">📍</span>
                      <span>{client.address || "Not Provided"}</span>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                      <button
                        onClick={() => handleEditClient(client)}
                        className="text-sm px-4 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClient(client._id)}
                        className="text-sm px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
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
                  className="relative /5 dark:/10 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-lg transition-transform hover:scale-[1.02]"
                >
                  {/* Header with Avatar & Name */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-tr  from-blue-500 to-teal-400 flex items-center justify-center text-white text-xl font-bold shadow-md">
                      {data.clientName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {data.clientName || "Unknown"}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Client Entry
                      </p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-3 text-[15px]">
                    <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
                      <span className="text-green-500 dark:text-green-300">
                        📧
                      </span>
                      <span>{data.clientEmail || "Email not provided"}</span>
                    </div>

                    <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
                      <span className="text-blue-500 dark:text-blue-300">
                        📞
                      </span>
                      <span>{data.clientPhone || "Phone not available"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
                      <span className="text-red-400 dark:text-red-300">📍</span>
                      <span>{data.location || "Not Provided"}</span>
                    </div>
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
            <div className="fixed inset-0 dark:border-white bg-gray-900 bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
              <div className=" dark:bg-gray-900 bg-gray-50 dark:border-white border rounded-2xl shadow-2xl p-8 w-full max-w-lg animate-fadeIn">
                {/* Title */}
                <h2 className="text-3xl font-semibold text-gray-800 dark:text-white mb-8 border-b pb-4 flex items-center gap-2">
                  <i className="fas fa-user-plus text-indigo-600 text-xl" /> Add
                  New Client
                </h2>

                {/* Form Grid */}
                <div className="space-y-5">
                  {/* Client Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      Client Name
                    </label>
                    <div className="relative">
                      <i className="fas fa-user absolute left-3 top-3 text-gray-400" />
                      <input
                        type="text"
                        name="clientName"
                        value={newClientDetails.clientName}
                        onChange={handleInputChange}
                        placeholder="Enter Client Name"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg  dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 transition"
                      />
                    </div>
                  </div>

                  {/* Contact Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      Contact Number
                    </label>
                    <div className="relative">
                      <i className="fas fa-phone-alt absolute left-3 top-3 text-gray-400" />
                      <input
                        type="text"
                        name="contactNo"
                        value={newClientDetails.contactNo}
                        onChange={handleInputChange}
                        placeholder="Enter Contact Number"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg  dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 transition"
                      />
                    </div>
                  </div>

                  {/* Email ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      Email ID
                    </label>
                    <div className="relative">
                      <i className="fas fa-envelope absolute left-3 top-3 text-gray-400" />
                      <input
                        type="email"
                        name="emailId"
                        value={newClientDetails.emailId}
                        onChange={handleInputChange}
                        placeholder="Enter Email ID"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg  dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 transition"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      Address
                    </label>
                    <div className="relative">
                      <i className="fas fa-map-marker-alt absolute left-3 top-3 text-gray-400" />
                      <input
                        type="text"
                        name="address"
                        value={newClientDetails.address}
                        onChange={handleInputChange}
                        placeholder="Enter Address"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg  dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-4 mt-8">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="px-6 py-2 text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition"
                  >
                    <i className="fas fa-times mr-2" />
                    Cancel
                  </button>
                  <button
                    onClick={handleAddClient}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition shadow-md"
                  >
                    <i className="fas fa-check mr-2" />
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




