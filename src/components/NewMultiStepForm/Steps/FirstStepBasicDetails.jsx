
import React, { useState, useEffect } from "react";
import axios from "axios"; // Import Axios
import deleteImg from "../delete.png";

const FirstStepBasicDetails = ({ formData, onFormDataChange }) => {
  // const [localData, setLocalData] = useState(() => {
  //   const savedData = localStorage.getItem("FirstStepBasicDetails");
  //   return savedData
  //     ? JSON.parse(savedData)
  //     : {
  //         clientName: "",
  //         clientEmail: "",
  //         clientPhone: "",
  //         // businessDescription: "",
  //         // businessOwner: "",
  //         // businessEmail: "",
  //         // businessContactNumber: "",
  //         // clientDob: "",
  //         // adhaarNumber: "",
  //         // educationQualification: "",
  //         // businessName: "",
  //         // businessAddress: "",
  //         // pincode: "",
  //         // location: "",
  //         // industryType: "",
  //         // registrationType: "",
  //         // PANNumber: "",
  //         // TANNumber: "",
  //         // UDYAMNumber: "",
  //         // GSTIN: "",
  //         // CIN: "",
  //         // logoOfBusiness: "",
  //         // allPartners: [],
  //         // PIN: "",
  //         // numberOfEmployees: "",
  //         // nameofDirectors: "",
  //         // DIN: "",
  //       };
  // });

  const [localData, setLocalData] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    businessDescription: "",
          businessOwner: "",
          businessEmail: "",
          businessContactNumber: "",
          clientDob: "",
          adhaarNumber: "",
          educationQualification: "",
          businessName: "",
          businessAddress: "",
          pincode: "",
          location: "",
          industryType: "",
          registrationType: "",
          PANNumber: "",
          TANNumber: "",
          UDYAMNumber: "",
          GSTIN: "",
          CIN: "",
          logoOfBusiness: "",
          allPartners: [],
          PIN: "",
          numberOfEmployees: "",
          nameofDirectors: "",
          DIN: "",
          allPartners: [],
  });
  

  const fetchClientData = async (clientName, clientEmail) => {
    try {
      // Fetch the list of clients by name
      const response = await axios.get(`http://localhost:5000/api/user/by-name/${clientName}`);
      const userData = response.data;
  
      if (userData.length <= 1) {
        // If there is one or fewer clients, use the data directly
        setLocalData((prevData) => ({
          ...prevData,
          ...userData[0], // Assuming the first item in the array is the client data
        }));
      } else {
        // If there are multiple clients with the same name, ask for the email ID
        if (!clientEmail) {
          alert("There are multiple clients with the same name. Please provide your email ID.");
          return;
        }
  
        // Fetch the data using the clientName and clientEmail
        const emailResponse = await axios.get(`http://localhost:5000/api/user/by-name-and-email`, {
          params: { clientName, clientEmail },
        });
        const emailUserData = emailResponse.data;
  
        if (emailUserData) {
          setLocalData((prevData) => ({
            ...prevData,
            ...emailUserData,
          }));
        } else {
          alert("No client found with the provided email ID.");
        }
      }
    } catch (error) {
      console.error("Error fetching client data:", error);
      alert("Error fetching client data.");
    }
  };
  

  const handleClientNameBlur = (e) => {
    const clientName = e.target.value.trim();
    if (clientName) {
      fetchClientData(clientName); // Fetch data when the clientName field loses focus
    }
  };

  useEffect(() => {
    localStorage.setItem("FirstStepBasicDetails", JSON.stringify(localData));
  }, [localData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const addPartner = () => {
    setLocalData((prevData) => ({
      ...prevData,
      allPartners: [
        ...prevData.allPartners,
        { partnerName: "", partnerAadhar: "", partnerDin: "" },
      ],
    }));
  };

  const handlePartnerChange = (e, index) => {
    const { name, value } = e.target;
    setLocalData((prevData) => {
      const updatedPartners = [...prevData.allPartners];
      updatedPartners[index] = { ...updatedPartners[index], [name]: value };
      return { ...prevData, allPartners: updatedPartners };
    });
  };

  const handleDeletePartner = (index) => {
    const updatedPartners = localData.allPartners.filter((_, idx) => idx !== index);
    setLocalData((prevData) => ({
      ...prevData,
      allPartners: updatedPartners,
    }));
  };

  // ** New Submission Handler **
  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   console.log("Submitting Data:", localData); 
  //   try {
  //     // Send data to the backend API
  //     const response = await axios.post("http://localhost:5000/api/user", localData);
  //     alert("Data submitted successfully!");
  //     console.log("Response:", response.data);
  //   } catch (error) {
  //     console.error("Error submitting data:", error);
  //     alert("Failed to submit data. Check console for details.");
  //   }
  // };
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Filter only the required fields
    const filteredData = {
      clientName: localData.clientName,
      clientEmail: localData.clientEmail,
      clientPhone: localData.clientPhone,
      businessDescription: localData.businessDescription,
      businessOwner:localData.businessOwner,
      businessEmail:localData.businessEmail,
      businessContactNumber:localData.businessContactNumber,
      clientDob:localData.clientDob,
      adhaarNumber:localData.adhaarNumber,
      educationQualification:localData.educationQualification,
      businessName:localData.businessName,
      businessAddress:localData.businessAddress,
      pincode:localData.pincode,
      location:localData.location,
      industryType:localData.industryType,
      registrationType:localData.registrationType,
      PANNumber:localData.PANNumber,
      TANNumber:localData.TANNumber,
      UDYAMNumber:localData.UDYAMNumber,
      GSTIN:localData.GSTIN,
      CIN:localData.CIN,
      logoOfBusiness:localData.logoOfBusiness,
      PIN:localData.PIN,
      numberOfEmployees:localData.numberOfEmployees,
      nameofDirectors:localData.nameofDirectors,
      DIN:localData.DIN,
      allPartners: localData.allPartners,
    };
  
    console.log("Submitting Data:", filteredData); // Log the filtered data being sent
  
    try {
      const response = await axios.post("http://localhost:5000/api/user", filteredData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      alert("Data submitted successfully!");
    } catch (error) {
      console.error("Error submitting data:", error.response?.data || error.message);
      alert("Failed to submit data. Check console for details.");
    }
  };
  
  return (
    <div className="form-scroll">
      <form onSubmit={handleSubmit}> {/* Form wrapper with submit */}
        <div>
          
          <div className="input">
          <input
            id="clientName"
            name="clientName"
            type="text"
            placeholder="Enter Client Name"
            value={localData.clientName}
            onChange={handleChange}
            onBlur={handleClientNameBlur} // Fetch data on blur
            required
          />
          <label htmlFor="clientName">Client Name</label>
          </div>
          {/* Repeat similar input fields for other data */}
          <div className="input">
            <input
              id="clientEmail"
              name="clientEmail"
              type="text"
              placeholder="e.g., john@example.com"
              value={localData.clientEmail}
              onChange={handleChange}
              onBlur={handleClientNameBlur}
              required
            />
            <label htmlFor="clientEmail">Client Email</label>
          </div>



          <div className="input">
            <input
              id="clientPhone"
              name="clientPhone"
              type="text"
              placeholder="e.g., 92245666777"
              value={localData.clientPhone}
              onChange={handleChange}
              required
            />
            <label htmlFor="clientPhone">client Phone</label>
          </div>

          <div className="input">
            <input
              id="businessDescription"
              name="businessDescription"
              type="text"
              placeholder="description..............."
              value={localData.businessDescription}
              onChange={handleChange}
              required
            />
            <label htmlFor="businessDescription">businessDescription</label>
          </div>

          <div className="input">
            <input
              id="businessOwner"
              name="businessOwner"
              type="text"
              placeholder="business Owner "
              value={localData.businessOwner}
              onChange={handleChange}
              required
            />
            <label htmlFor="businessOwner">business Owner</label>
          </div>

          <div className="input">
            <input
              id="businessEmail"
              name="businessEmail"
              type="text"
              placeholder="e.g., john@example.com"
              value={localData.businessEmail}
              onChange={handleChange}
              required
            />
            <label htmlFor="businessEmail">business Email</label>
          </div>

          {/* Add more fields as needed */}
          <div className="input">
            <input
              id="businessContactNumber"
              name="businessContactNumber"
              type="text"
              placeholder="e.g., 123-456-789"
              value={localData.businessContactNumber}
              onChange={handleChange}
              required
            />
            <label htmlFor="businessContactNumber">
              Business Contact Number
            </label>
          </div>

          <div className="input">
            <input
              id="clientDob"
              name="clientDob"
              type="text"
              value={localData.clientDob}
              onChange={handleChange}
              required
            />
            <label htmlFor="clientDob">Date of Birth</label>
          </div>

          <div className="input">
            <input
              id="adhaarNumber"
              name="adhaarNumber"
              type="text"
              placeholder="Aadhaar Number"
              value={localData.adhaarNumber}
              onChange={handleChange}
              required
            />
            <label htmlFor="adhaarNumber">Aadhaar Number</label>
          </div>

          <div className="input">
            <input
              id="educationQualification"
              name="educationQualification"
              type="text"
              placeholder="Education Qualification"
              value={localData.educationQualification}
              onChange={handleChange}
              required
            />
            <label htmlFor="educationQualification">
              Education Qualification
            </label>
          </div>

          {/* Business Details */}
          <div className="input">
            <input
              id="businessName"
              name="businessName"
              type="text"
              placeholder="Business Name"
              value={localData.businessName}
              onChange={handleChange}
              required
            />
            <label htmlFor="businessName">Business Name</label>
          </div>

           <div className="input">
            <input
              id="businessAddress"
              name="businessAddress"
              type="text"
              placeholder="Business Address"
              value={localData.businessAddress}
              onChange={handleChange}
              required
            />
            <label htmlFor="businessAddress">Business Address</label>
          </div>

          <div className="input">
            <input
              id="pincode"
              name="pincode"
              type="text"
              placeholder="Pincode"
              value={localData.pincode}
              onChange={handleChange}
              required
            />
            <label htmlFor="pincode">Pincode</label>
          </div>

          <div className="input">
            <input
              id="location"
              name="location"
              type="text"
              placeholder="Location"
              value={localData.location}
              onChange={handleChange}
              required
            />
            <label htmlFor="location">Location</label>
          </div>

          <div className="input">
            <input
              id="industryType"
              name="industryType"
              type="text"
              placeholder="Industry Type"
              value={localData.industryType}
              onChange={handleChange}
              required
            />
            <label htmlFor="industryType">Industry Type</label>
          </div>

          <div className="input">
            <input
              id="registrationType"
              name="registrationType"
              type="text"
              placeholder="Registration Type"
              value={localData.registrationType}
              onChange={handleChange}
              required
            />
            <label htmlFor="registrationType">Registration Type</label>
          </div>

          <div className="input">
            <input
              id="PANNumber"
              name="PANNumber"
              type="text"
              placeholder="PAN Number"
              value={localData.PANNumber}
              onChange={handleChange}
              required
            />
            <label htmlFor="PANNumber">PAN Number</label>
          </div>

          <div className="input">
            <input
              id="TANNumber"
              name="TANNumber"
              type="text"
              placeholder="TAN Number"
              value={localData.TANNumber}
              onChange={handleChange}
              required
            />
            <label htmlFor="TANNumber">TAN Number</label>
          </div>

          <div className="input">
            <input
              id="UDYAMNumber"
              name="UDYAMNumber"
              type="text"
              placeholder="UDYAM Number"
              value={localData.UDYAMNumber}
              onChange={handleChange}
              required
            />
            <label htmlFor="UDYAMNumber">UDYAM Number</label>
          </div>

          <div className="input">
            <input
              id="GSTIN"
              name="GSTIN"
              type="text"
              placeholder="GSTIN"
              value={localData.GSTIN}
              onChange={handleChange}
              required
            />
            <label htmlFor="GSTIN">GSTIN</label>
          </div>

          <div className="input">
            <input
              id="CIN"
              name="CIN"
              type="text"
              placeholder="CIN"
              value={localData.CIN}
              onChange={handleChange}
              required
            />
            <label htmlFor="CIN">CIN</label>
          </div>

          <div className="input align-baseline">
            <input
              id="logoOfBusiness"
              name="logoOfBusiness"
              type="text"
              accept="image/png, image/jpeg"
              onChange={(e) => handleChange(e)}
              style={{ paddingTop: "1.5%" }}
              required
            />
            <label htmlFor="logoOfBusiness">Logo of Business</label>
          </div>

          <div className="input">
            <input
              id="PIN"
              name="PIN"
              type="text"
              placeholder="PIN"
              value={localData.PIN}
              onChange={handleChange}
              required
            />
            <label htmlFor="PIN">PIN</label>
          </div>

          <div className="input">
            <input
              id="numberOfEmployees"
              name="numberOfEmployees"
              type="number"
              placeholder="Number of Employees"
              value={localData.numberOfEmployees}
              onChange={handleChange}
              required
            />
            <label htmlFor="numberOfEmployees">Number of Employees</label>
          </div>

          <div className="input">
            <input
              id="nameofDirectors"
              name="nameofDirectors"
              type="text"
              placeholder="Name of Directors"
              value={localData.nameofDirectors}
              onChange={handleChange}
              required
            />
            <label htmlFor="nameofDirectors">Name of Directors</label>
          </div>

          <div className="input">
            <input
              id="DIN"
              name="DIN"
              type="text"
              placeholder="DIN"
              value={localData.DIN}
              onChange={handleChange}
              required
            />
            <label htmlFor="DIN">DIN</label>
          </div> 

          
          {/* Partners Section */}
          {/* <div>
            <h5>Add Partners</h5>
            {localData.allPartners.map((partner, index) => (
              <div key={index}>
                <input
                  name="partnerName"
                  placeholder="Partner Name"
                  value={partner.partnerName}
                  onChange={(e) => handlePartnerChange(e, index)}
                />
                <input
                  name="partnerAadhar"
                  placeholder="Partner Aadhaar"
                  value={partner.partnerAadhar}
                  onChange={(e) => handlePartnerChange(e, index)}
                />
                <input
                  name="partnerDin"
                  placeholder="Partner DIN"
                  value={partner.partnerDin}
                  onChange={(e) => handlePartnerChange(e, index)}
                />
                <button type="button" onClick={() => handleDeletePartner(index)}>
                  Delete Partner
                </button>
              </div>
            ))}
            <button type="button" onClick={addPartner}>
              Add Partner
            </button>
          </div> */}
                 <div className="bg-light text-center p-3 mb-4 flex flex-col gap-[1rem]">
            <h5>Add Partners</h5>
            {localData.allPartners.map((partner, index) => (
              <div
                key={index}
                className="d-flex gap-3 justify-content-around align-items-center"
              >
                <div className="mt-2">{index + 1}</div>
                <div className="input mb-0">
                  <input
                    id={`partnerName-${index}`}
                    name="partnerName"
                    type="text"
                    placeholder="Name of Partner"
                    value={partner.partnerName || ""} // Ensure value is a string
                    onChange={(e) => handlePartnerChange(e, index)}
                    required
                  />
                  <label htmlFor={`partnerName-${index}`}>
                    Name of Partner
                  </label>
                </div>
                <div className="input mb-0">
                  <input
                    id={`partnerAadhar-${index}`}
                    name="partnerAadhar"
                    type="text"
                    placeholder="Aadhar of Partner"
                    value={partner.partnerAadhar || ""} // Ensure value is a string
                    onChange={(e) => handlePartnerChange(e, index)}
                    required
                  />
                  <label htmlFor={`partnerAadhar-${index}`}>
                    Aadhar of Partner
                  </label>
                </div>
                <div className="input mb-0">
                  <input
                    id={`partnerDin-${index}`}
                    name="partnerDin"
                    type="text"
                    placeholder="DIN of Partner"
                    value={partner.partnerDin || ""} // Ensure value is a string
                    onChange={(e) => handlePartnerChange(e, index)}
                    required
                  />
                  <label htmlFor={`partnerDin-${index}`}>DIN of Partner</label>
                </div>
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => handleDeletePartner(index)}
                >
                  <img className="w-8" src={deleteImg} alt="" />
                </button>
              </div>
            ))}
            <button
              className="btn btn-sm btn-primary mt-3"
              onClick={addPartner}
            >
              Add Partner
            </button>

            {/* <button className="btn btn-primary mt-3" onClick={handleSubmit}>
  Submit
</button> */}
                  </div>

        </div>
        <button className="btn btn-sm btn-primary mt-3" type="submit">Submit</button> 
      </form>
    </div>
  );
};

export default FirstStepBasicDetails;
