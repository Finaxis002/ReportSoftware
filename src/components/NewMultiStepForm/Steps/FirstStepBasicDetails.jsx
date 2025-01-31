import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import deleteImg from "../delete.png";
import ClientNameDropdown from "../Dropdown/clientNameDropdown";
import ReportDropdown from "../Dropdown/ReportDropdown";
import axios from "axios";

const FirstStepBasicDetails = ({ formData, onFormDataChange }) => {
  // Initialize form data with props if available
  const [localData, setLocalData] = useState(() => {
    const savedData = localStorage.getItem("FirstStepBasicDetails");
    return savedData
      ? JSON.parse(savedData)
      : {
          clientName: formData?.ClientInformation?.clientName || "",
          clientEmail: formData?.ClientInformation?.clientEmail || "",
          clientPhone: formData?.ClientInformation?.clientPhone || "",
          businessDescription:
            formData?.BusinessDetails?.businessDescription || "",
          businessOwner: formData?.BusinessDetails?.businessOwner || "",
          businessEmail: formData?.BusinessDetails?.businessEmail || "",
          businessContactNumber:
            formData?.BusinessDetails?.businessContactNumber || "",
          clientDob: formData?.ClientInformation?.clientDob || "",
          adhaarNumber: formData?.ClientInformation?.adhaarNumber || "",
          educationQualification:
            formData?.ClientInformation?.educationQualification || "",
          businessName: formData?.BusinessDetails?.businessName || "",
          businessAddress: formData?.BusinessDetails?.businessAddress || "",
          pincode: formData?.BusinessDetails?.pincode || "",
          location: formData?.BusinessDetails?.location || "",
          industryType: formData?.BusinessDetails?.industryType || "",
          registrationType: formData?.BusinessDetails?.registrationType || "",
          PANNumber: formData?.BusinessDetails?.PANNumber || "",
          TANNumber: formData?.BusinessDetails?.TANNumber || "",
          UDYAMNumber: formData?.BusinessDetails?.UDYAMNumber || "",
          GSTIN: formData?.BusinessDetails?.GSTIN || "",
          CIN: formData?.BusinessDetails?.CIN || "",
          logoOfBusiness: formData?.BusinessDetails?.logoOfBusiness || "",
          allPartners: formData?.BusinessDetails?.allPartners || [],
          PIN: formData?.BusinessDetails?.PIN || "",
          numberOfEmployees: formData?.BusinessDetails?.numberOfEmployees || "",
          nameofDirectors: formData?.BusinessDetails?.nameofDirectors || "",
          DIN: formData?.BusinessDetails?.DIN || "",
          allPartners: [],
        };
  });
  const [userRole, setUserRole] = useState("");
  const location = useLocation();
  const isCreateReportClicked = location.state?.isCreateReportClicked || false;

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    setUserRole(role);
  }, []);

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
        allPartners: [],
        PIN: "",
        numberOfEmployees: "",
        nameofDirectors: "",
        DIN: "",
      });
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:5000/api/user/by-name/${clientName}`
      );
      setLocalData(response.data); // Populate form fields with client data
    } catch (error) {
      console.error("Error fetching client details:", error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Filter only the required fields
    const filteredData = {
      clientName: localData.clientName,
      clientEmail: localData.clientEmail,
      clientPhone: localData.clientPhone,
      businessDescription: localData.businessDescription,
      businessOwner: localData.businessOwner,
      businessEmail: localData.businessEmail,
      businessContactNumber: localData.businessContactNumber,
      clientDob: localData.clientDob,
      adhaarNumber: localData.adhaarNumber,
      educationQualification: localData.educationQualification,
      businessName: localData.businessName,
      businessAddress: localData.businessAddress,
      pincode: localData.pincode,
      location: localData.location,
      industryType: localData.industryType,
      registrationType: localData.registrationType,
      PANNumber: localData.PANNumber,
      TANNumber: localData.TANNumber,
      UDYAMNumber: localData.UDYAMNumber,
      GSTIN: localData.GSTIN,
      CIN: localData.CIN,
      logoOfBusiness: localData.logoOfBusiness,
      PIN: localData.PIN,
      numberOfEmployees: localData.numberOfEmployees,
      nameofDirectors: localData.nameofDirectors,
      DIN: localData.DIN,
      allPartners: localData.allPartners,
    };

    console.log("Submitting Data:", filteredData); // Log the filtered data being sent

    try {
      const response = await axios.post(
        "http://localhost:5000/api/user",
        filteredData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      alert("Data submitted successfully!");
    } catch (error) {
      console.error(
        "Error submitting data:",
        error.response?.data || error.message
      );
      alert("Failed to submit data. Check console for details.");
    }
  };

  // Handle input change
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

  // console.log(addPartner);

  const handlePartnerChange = (e, index) => {
    const { name, value } = e.target;
    setLocalData((prevData) => {
      const updatedPartners = [...prevData.allPartners];
      updatedPartners[index] = { ...updatedPartners[index], [name]: value };
      return { ...prevData, allPartners: updatedPartners };
    });
  };

  // Effect to automatically save the data when the form is updated
  useEffect(() => {
    // Make sure to update AccountInformation instead of CostOfProject
    onFormDataChange({ AccountInformation: localData });
  }, [localData, onFormDataChange]);

  const handleDeletePartner = (index) => {
    // Filter out the partner at the given index
    const updatedPartners = localData.allPartners.filter(
      (_, idx) => idx !== index
    );

    // Update the state with the new partners list
    setLocalData((prevData) => ({
      ...prevData,
      allPartners: updatedPartners,
    }));
  };

  return (
    <div className="">
      <div className="form-scroll">
        {/* Conditionally render the dropdown only if the user is NOT a client */}
        {!isCreateReportClicked && userRole !== "client" && (
          <div className="flex gap-4 pb-5">
            <ClientNameDropdown onClientSelect={handleClientSelect} />
            <ReportDropdown onClientSelect={handleClientSelect} />
          </div>
        )}
        <form onSubmit={handleSubmit}>
          {" "}
          {/* Form wrapper with submit */}
          <div>
            {/* Client Information */}
            <div className="input">
              <input
                id="clientName"
                name="clientName"
                type="text"
                placeholder="e.g., John Doe"
                value={localData.clientName}
                onChange={handleChange}
                required
              />
              <label htmlFor="clientName">Client Name</label>
            </div>

            <div className="input">
              <input
                id="clientEmail"
                name="clientEmail"
                type="email"
                placeholder="e.g., john@example.com"
                value={localData.clientEmail}
                onChange={handleChange}
                required
              />
              <label htmlFor="clientEmail">Client Email</label>
            </div>

            <div className="input">
              <input
                id="clientPhone"
                name="clientPhone"
                type="tel"
                placeholder="e.g., 123-456-7890"
                value={localData.clientPhone}
                onChange={handleChange}
                required
              />
              <label htmlFor="clientPhone">Client Phone</label>
            </div>
            <div className="input">
              <input
                id="businessDescription"
                name="businessDescription"
                type="tel"
                placeholder="e.g., Description"
                value={localData.businessDescription}
                onChange={handleChange}
                required
              />
              <label htmlFor="businessOwner">Business Description</label>
            </div>
            <div className="input">
              <input
                id="businessOwner"
                name="businessOwner"
                type="tel"
                placeholder="e.g., John Doe"
                value={localData.businessOwner}
                onChange={handleChange}
                required
              />
              <label htmlFor="businessOwner">Business Owner</label>
            </div>
            <div className="input">
              <input
                id="businessEmail"
                name="businessEmail"
                type="tel"
                placeholder="e.g., john@example.com"
                value={localData.businessEmail}
                onChange={handleChange}
                required
              />
              <label htmlFor="businessEmail">Business Email</label>
            </div>
            <div className="input">
              <input
                id="businessContactNumber"
                name="businessContactNumber"
                type="tel"
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
                type="file"
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

            {/* Add Partners Section */}
            <div className="bg-light text-center p-3 mb-4 flex flex-col gap-[2rem]">
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
                    <label htmlFor={`partnerDin-${index}`}>
                      DIN of Partner
                    </label>
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

              {/* Conditionally render the submit button only if the user is NOT a client */}
              {userRole !== "client" && (
                <button className="btn btn-primary mt-3" onClick={handleSubmit}>
                  Submit
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FirstStepBasicDetails;
