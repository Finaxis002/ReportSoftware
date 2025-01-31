import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select"; // Install using `npm install react-select`

const businessNameDropdown = ({clientName , onbusinessSelect }) => {
  const [businessOptions, setbusinessOptions] = useState([]); // Dropdown options
  const [selectedbusiness, setSelectedbusiness] = useState(null); // Selected business
  const [businesss, setbusinesss] = useState([]);

  // Fetch all business names on component mount
  useEffect(() => {
    const fetchbusinesss = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/business?clientName=${clientName}`);
        const options = response.data.map((business) => ({
          value: business.businessName,
          label: business.businessName,
        }));
        setbusinessOptions(options); // Set dropdown options
      } catch (error) {
        console.error("Error fetching businesss:", error.message);
      }
    };

    fetchbusinesss();
  }, []);

//   useEffect(() => {
//     // Fetch the list of businesss
//     const fetchbusinesss = async () => {
//       try {
//         const response = await axios.get("http://localhost:5000/api/business");
//         setbusinesss(response.data); // Set business data
//       } catch (error) {
//         console.error("Error fetching businesss:", error.message);
//       }
//     };

//     fetchbusinesss();
//   }, []);

  // Handle business selection
  const handleSelect = (selectedOption) => {
    setSelectedbusiness(selectedOption); // Update the selected business state
    onbusinessSelect(selectedOption ? selectedOption.value : null); // Pass the selected business name to the parent
  };

  return (
    <div className="m-1 ">
      <label>Select business</label>
      <Select
      className="w-[20rem]"
        options={businessOptions} // Dropdown options
        value={selectedbusiness} // Selected value
        onChange={handleSelect} // Handle selection
        placeholder="select a business..."
        isClearable // Allows clearing the selection
         
      /> 
    </div>
  );
};

export default businessNameDropdown;
