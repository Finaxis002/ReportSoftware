
import React, { useState, useEffect, useRef } from "react";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios"; // Import Axios
import deleteImg from "../delete.png";
import ClientNameDropdown from "./clientNameDropdown";
import {validatePhoneNumber,validateEmail,validateAadhaarNumber,validatePANNumber,validateGSTIN,validateTANNumber,validateUDYAMNumber } from './validation'

const FirstStepBasicDetails = ({ formData, onFormDataChange,onClientSelect }) => {
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
          filePath: "",
          allPartners: [],
          PIN: "",
          numberOfEmployees: "",
          nameofDirectors: "",
          DIN: "",
          allPartners: [],
  });

  
  const [error, setError] = useState("");
  const[errorInEmail, seterrorInEmail] = useState("")
  const[ErrorBusinessEmail, setErrorBusinessEmail]=useState("")
  const [ErrorbusinessContactNo, setErrorbusinessContactNo] = useState("")
  const [aadhaarError, setAadhaarError] = useState("");
  const [panError, setPanError] = useState(""); 
  const [tanError, setTanError] = useState(""); 
  const [udyamError, setUdyamError] = useState(""); // State for UDYAM error message
  const [gstinError, setGstinError] = useState(""); 
 
    
 
  
  const emailInputRef = useRef(null);
  const phoneInputRef = useRef(null);
  const BusinessEmailInputRef = useRef(null);
  const businessContactNoRef =useRef(null)
  const aadhaarInputRef = useRef(null);
  const panInputRef = useRef(null); 
  const tanInputRef = useRef(null);
  const udyamInputRef = useRef(null);
  const gstinInputRef = useRef(null);
  

  const handleClientSelect = async (clientName) => {
    if (!clientName) {
      // If no client is selected, reset the form
      setLocalData({
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
                filePath: "",
                allPartners: [],
                PIN: "",
                numberOfEmployees: "",
                nameofDirectors: "",
                DIN: "",
      });
      return;
    }
          
    

    try {
      const response = await axios.get(`http://localhost:5000/api/user/by-name/${clientName}`);
      setLocalData(response.data);
    } catch (error) {
      console.error("Error fetching client details:", error.message);
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setLocalData((prevData) => ({
            ...prevData,
            logoOfBusiness: file, // Store the file object in the state
        }));
    }
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
 

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     //adding validation for form fields
//     //client email validation
//     if (!validateEmail(localData.clientEmail)) {
//       seterrorInEmail("Invalid email address. Please enter a valid email.");
//       emailInputRef.current.focus(); // Move cursor to email field
//       return;
//      }
//     seterrorInEmail(""); // Clear previous error
    
//   //client phone validation
//   if (!validatePhoneNumber(localData.clientPhone)) {
      
//       setError("Invalid phone number. It should be 10 digits.");
//       phoneInputRef.current.focus();
//       return;
//   }
//   setError("");

//   //business email validation
//   if(!validateEmail(localData.businessEmail)){
//     setErrorBusinessEmail("Invalid email address. Please enter a valid email.");
//     BusinessEmailInputRef.current.focus();
//     return ;
//   }
//   setErrorBusinessEmail("");


//   if (!validatePhoneNumber(localData.businessContactNumber)) {
//     setErrorbusinessContactNo("Invalid phone number. It should be 10 digits.");
//     businessContactNoRef.current.focus();
//     return;
// }
// setErrorbusinessContactNo("");

// //adhaar validation
// if (!validateAadhaarNumber(localData.adhaarNumber)) {
//   setAadhaarError("Invalid Aadhaar number. It must be exactly 12 digits.");
//   aadhaarInputRef.current.focus(); // Focus on Aadhaar input field
//   return;
// }

// setAadhaarError(""); 
  

// // Validate PAN Number
// if (!validatePANNumber(localData.PANNumber)) {
//   setPanError("Invalid PAN number. It must follow the format: ABCDE1234F.");
//   panInputRef.current.focus(); 
//   return;
// }

// setPanError(""); 

// // Validate TAN Number
// if (!validateTANNumber(localData.TANNumber)) {
//   console.log("in if condition for TAN")
//   setTanError("Invalid TAN number. It must follow the format: ABCD12345K.");
//   tanInputRef.current.focus(); // Focus on TAN input field
//   return;
// }
// setTanError("")

// // Validate UDYAM Number
// if (!validateUDYAMNumber(localData.UDYAMNumber)) {
//   setUdyamError("Invalid UDYAM number. Format: UDYAM-XX-YYYY-XXXXXXXXXXX.");
//   udyamInputRef.current.focus(); // Focus on UDYAM input field
//   return;
// }
// setUdyamError("");  

// // Validate GSTIN Number
// if (!validateGSTIN(localData.GSTIN)) {
//   setGstinError("Invalid GSTIN number. It must follow the format: 22ABCDE1234F1Z5.");
//   gstinInputRef.current.focus(); // Focus on GSTIN input field
//   return;
// }


// console.log("Form submitted successfully:", localData);
  
//     // Filter only the required fields
//     const filteredData = {
//       clientName: localData.clientName,
//       clientEmail: localData.clientEmail,
//       clientPhone: localData.clientPhone,
//       businessDescription: localData.businessDescription,
//       businessOwner:localData.businessOwner,
//       businessEmail:localData.businessEmail,
//       businessContactNumber:localData.businessContactNumber,
//       clientDob:localData.clientDob,
//       adhaarNumber:localData.adhaarNumber,
//       educationQualification:localData.educationQualification,
//       businessName:localData.businessName,
//       businessAddress:localData.businessAddress,
//       pincode:localData.pincode,
//       location:localData.location,
//       industryType:localData.industryType,
//       registrationType:localData.registrationType,
//       PANNumber:localData.PANNumber,
//       TANNumber:localData.TANNumber,
//       UDYAMNumber:localData.UDYAMNumber,
//       GSTIN:localData.GSTIN,
//       CIN:localData.CIN,
//       logoOfBusiness:localData.logoOfBusiness,
//       file: localData.file,
//       PIN:localData.PIN,
//       numberOfEmployees:localData.numberOfEmployees,
//       nameofDirectors:localData.nameofDirectors,
//       DIN:localData.DIN,
//       allPartners: localData.allPartners,
//     };
//     // const data = new FormData();
//     console.log("Submitting Data:", filteredData); // Log the filtered data being sent
  
//     try {
//       const response = await axios.post("http://localhost:5000/api/user", filteredData, {
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });
//       alert("Data submitted successfully!");
//     } catch (error) {
//       console.error("Error submitting data:", error.response?.data || error.message);
//       alert("Failed to submit data. Check console for details.");
//     }



//     const formData = new FormData();
//     for (const key in localData) {
//         if (key === "logoOfBusiness" && localData[key]) {
//             formData.append(key, localData[key]); // Add file to FormData
//         } else if (localData[key]) {
//             formData.append(key, localData[key]); // Add other fields to FormData
//         }
//     }

//     const response = await axios.post("http://localhost:5000/api/user/upload", formData, {
//       headers: {
//           "Content-Type": "multipart/form-data",
//       },
//   });
//   };
  
const handleSubmit = async (e) => {
  e.preventDefault();
  let uploadedFilePath = "";
  // Step 1: Validation Logic (keep your existing validations)
  if (!validateEmail(localData.clientEmail)) {
      seterrorInEmail("Invalid email address. Please enter a valid email.");
      emailInputRef.current.focus();
      return;
  }
  seterrorInEmail("");

  if (!validatePhoneNumber(localData.clientPhone)) {
      setError("Invalid phone number. It should be 10 digits.");
      phoneInputRef.current.focus();
      return;
  }
  setError("");

  if (!validateEmail(localData.businessEmail)) {
      setErrorBusinessEmail("Invalid email address. Please enter a valid email.");
      BusinessEmailInputRef.current.focus();
      return;
  }
  setErrorBusinessEmail("");

  if (!validatePhoneNumber(localData.businessContactNumber)) {
      setErrorbusinessContactNo("Invalid phone number. It should be 10 digits.");
      businessContactNoRef.current.focus();
      return;
  }
  setErrorbusinessContactNo("");

  if (!validateAadhaarNumber(localData.adhaarNumber)) {
      setAadhaarError("Invalid Aadhaar number. It must be exactly 12 digits.");
      aadhaarInputRef.current.focus();
      return;
  }
  setAadhaarError("");

  if (!validatePANNumber(localData.PANNumber)) {
      setPanError("Invalid PAN number. It must follow the format: ABCDE1234F.");
      panInputRef.current.focus();
      return;
  }
  setPanError("");

  if (!validateTANNumber(localData.TANNumber)) {
      setTanError("Invalid TAN number. It must follow the format: ABCD12345K.");
      tanInputRef.current.focus();
      return;
  }
  setTanError("");

  if (!validateUDYAMNumber(localData.UDYAMNumber)) {
      setUdyamError("Invalid UDYAM number. Format: UDYAM-XX-YYYY-XXXXXXXXXXX.");
      udyamInputRef.current.focus();
      return;
  }
  setUdyamError("");

  if (!validateGSTIN(localData.GSTIN)) {
      setGstinError("Invalid GSTIN number. It must follow the format: 22ABCDE1234F1Z5.");
      gstinInputRef.current.focus();
      return;
  }
  setGstinError("");

  // Step 2: Submit non-file data to the database (http://localhost:5000/api/user)
    
    // const filteredData = { ...localData };
    // delete filteredData._id; // Ensure _id is removed

    // filteredData.logoOfBusiness = uploadedFilePath; // Replace file object with file path

    // try {
    //     console.log("Submitting form data...");
    //     const response = await axios.post("http://localhost:5000/api/user", filteredData, {
    //         headers: {
    //             "Content-Type": "application/json",
    //         },
    //     });

    //     console.log("Form data submitted successfully:", response.data);
    //     alert("Form data submitted successfully!");
    // } catch (error) {
    //     console.error("Error submitting form data:", error.response?.data || error.message);
    //     alert("Failed to submit form data. Check console for details.");
    // }

  // Step 3: Submit the file (http://localhost:5000/api/user/upload)
  
  if (localData.logoOfBusiness) {
      const formData = new FormData();
      formData.append("logoOfBusiness", localData.logoOfBusiness);

      // Append all other fields
    for (const key in localData) {
      if (key === "allPartners") {
          formData.append(key, JSON.stringify(localData[key])); // Stringify arrays
      } else if (key !== "logoOfBusiness") {
          formData.append(key, localData[key]); // Add other fields
      }
  }

      try {
          console.log("Submitting file...");
          const response = await axios.post("http://localhost:5000/api/user", formData, {
              headers: {
                  "Content-Type": "multipart/form-data",
              },
          });

          uploadedFilePath = response.data.filePath; // Extract file path from response
          console.log("File uploaded successfully:", uploadedFilePath);
      } catch (err) {
          console.error("Error uploading file:", err.response?.data || err.message);
          alert("Failed to upload file. Please try again.");
          return; // Stop further execution if file upload fails
      }
  } else {
      console.log("No file to upload.");
  }
  
};

  return (
    <div className="form-scroll">

    {/* Client Name Dropdown */}
    <ClientNameDropdown onClientSelect={handleClientSelect} />

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
            // onBlur={handleClientNameBlur} // Fetch data on blur
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
              ref={emailInputRef}
              required
            />
            <label htmlFor="clientEmail">Client Email</label>
            {errorInEmail && <p style={{ color: "red" }}>{errorInEmail}</p>}
          </div>



          <div className="input">
            <input
              id="clientPhone"
              name="clientPhone"
              type="text"
              placeholder="e.g., 92245666777"
              value={localData.clientPhone}
              onChange={handleChange}
              ref={phoneInputRef}
              required
            />
            <label htmlFor="clientPhone">client Phone</label>
            {error && <p style={{ color: "red" }}>{error}</p>}
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
            <label htmlFor="businessDescription">business Description</label>
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
              ref={BusinessEmailInputRef}
              required
            />
            <label htmlFor="businessEmail">business Email</label>
            {ErrorBusinessEmail && <p style={{ color: "red" }}>{ErrorBusinessEmail}</p>}
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
              ref={businessContactNoRef}
              required
            />
            <label htmlFor="businessContactNumber">
              Business Contact Number
            </label>
            {ErrorbusinessContactNo && <p style={{ color: "red" }}>{ErrorbusinessContactNo} </p>}
          </div>

          <div className="input">
            <input
              id="clientDob"
              name="clientDob"
              type="date"
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
              ref={aadhaarInputRef} 
              maxLength={12}
              required
            />
            <label htmlFor="adhaarNumber">Aadhaar Number</label>
            {aadhaarError && <p style={{ color: "red", marginTop: "4px" }}>{aadhaarError}</p>}
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
              ref={panInputRef}
              required
            />
            <label htmlFor="PANNumber">PAN Number</label>
            {panError && <p style={{ color: "red", marginTop: "4px" }}>{panError}</p>}
          </div>

          <div className="input">
            <input
              id="TANNumber"
              name="TANNumber"
              type="text"
              placeholder="TAN Number"
              value={localData.TANNumber}
              onChange={handleChange}
              ref={tanInputRef }
              required
            />
            <label htmlFor="TANNumber">TAN Number</label>
            {tanError && <p style={{ color: "red", marginTop: "4px" }}>{tanError}</p>}
          </div>

          <div className="input">
            <input
              id="UDYAMNumber"
              name="UDYAMNumber"
              type="text"
              placeholder="UDYAM Number"
              value={localData.UDYAMNumber}
              onChange={handleChange}
              ref={udyamInputRef}
              required
            />
            <label htmlFor="UDYAMNumber">UDYAM Number</label>
            {udyamError && <p style={{ color: "red", marginTop: "4px" }}>{udyamError}</p>}
          </div>

          <div className="input">
            <input
              id="GSTIN"
              name="GSTIN"
              type="text"
              placeholder="GSTIN"
              value={localData.GSTIN}
              onChange={handleChange}
              ref={gstinInputRef}
              required
            />
            <label htmlFor="GSTIN">GSTIN</label>
            {gstinError && <p style={{ color: "red", marginTop: "4px" }}>{gstinError}</p>}
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
              type="file"
              accept="image/png, image/jpeg"
              // onChange={(e) => handleChange(e)}
              style={{ paddingTop: "1.5%" }}
              onChange={(e) => handleFileChange(e)}
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

            <button className="btn btn-primary mt-3" onClick={handleSubmit}>
              Submit
            </button>
                  </div>

        </div>
        {/* <button type="submit">Submit</button>  */}
      </form>
    </div>
  );
};

export default FirstStepBasicDetails ;
