import React, { useState, useEffect } from "react";
import deleteImg from "../delete.png";
import axios from "axios";

const FirstStepBasicDetails = ({
  formData,
  onFormDataChange,
  sessionId,
  setSessionId,
  userRole,
  userName,
}) => {
  const [localData, setLocalData] = useState({
    clientName: formData?.AccountInformation?.clientName || "",
    clientEmail: formData?.AccountInformation?.clientEmail || "",
    clientPhone: formData?.AccountInformation?.clientPhone || "",
    businessDescription:
      formData?.AccountInformation?.businessDescription || "",
    businessOwner: formData?.AccountInformation?.businessOwner || "",
    businessEmail: formData?.AccountInformation?.businessEmail || "",
    businessContactNumber:
      formData?.AccountInformation?.businessContactNumber || "",
    clientDob: formData?.AccountInformation?.clientDob || "",
    adhaarNumber: formData?.AccountInformation?.adhaarNumber || "",
    educationQualification:
      formData?.AccountInformation?.educationQualification || "",
    businessName: formData?.AccountInformation?.businessName || "",
    businessAddress: formData?.AccountInformation?.businessAddress || "",
    pincode: formData?.AccountInformation?.pincode || "",
    location: formData?.AccountInformation?.location || "",
    industryType: formData?.AccountInformation?.industryType || "",
    registrationType: formData?.AccountInformation?.registrationType || "",
    PANNumber: formData?.AccountInformation?.PANNumber || "",
    TANNumber: formData?.AccountInformation?.TANNumber || "",
    UDYAMNumber: formData?.AccountInformation?.UDYAMNumber || "",
    GSTIN: formData?.AccountInformation?.GSTIN || "",
    CIN: formData?.AccountInformation?.CIN || "",
    logoOfBusiness: formData?.AccountInformation?.logoOfBusiness || "",
    allPartners: formData?.AccountInformation?.allPartners || [],
    PIN: formData?.AccountInformation?.PIN || "",
    numberOfEmployees: formData?.AccountInformation?.numberOfEmployees || "",
    nameofDirectors: formData?.AccountInformation?.nameofDirectors || "",
    DIN: formData?.AccountInformation?.DIN || "",
    createdAt: { type: Date, default: Date.now },
    userRole: userRole === "employee" ? userName : userRole, // ✅ Use state
  });

  useEffect(() => {
    // ✅ Update userRole state based on props (not localStorage)
    setLocalData((prevData) => ({
      ...prevData,
      userRole: userRole === "employee" ? userName : userRole,
    }));
  }, [userRole, userName]); // ✅ Depend on state, not localStorage

  // ✅ Send updated state to parent component
  useEffect(() => {
    onFormDataChange({
      ...formData,
      AccountInformation: {
        ...formData?.AccountInformation,
        ...localData,
      },
      userRole: localData.userRole, // ✅ Send userRole or employee name
    });
  }, [localData, onFormDataChange]);

  useEffect(() => {
    if (formData?.AccountInformation) {
      setLocalData((prevData) => {
        // ✅ Prevent unnecessary state updates to avoid infinite loops
        if (
          JSON.stringify(prevData) !==
          JSON.stringify(formData.AccountInformation)
        ) {
          return {
            ...prevData,
            ...formData.AccountInformation,
            allPartners: Array.isArray(formData.AccountInformation.allPartners)
              ? formData.AccountInformation.allPartners
              : [], // ✅ Ensures allPartners is always an array
          };
        }
        return prevData; // ✅ Return existing state if no changes
      });
    }
  }, [formData?.AccountInformation]); // ✅ Runs only when `formData.AccountInformation` changes

  /** ✅ Handle input changes and update both localData & formData */
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Update local state
    setLocalData((prevData) => ({
      ...prevData,
      [name]: value,
      createdAt: new Date().toISOString(), // ✅ Store the current date before sending
    }));

    // Update parent state (MultiStepForm)
    onFormDataChange({
      AccountInformation: {
        ...formData.AccountInformation, // Preserve existing data
        [name]: value, // Update only the changed field
      },
      userRole,
    });
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    const uploadFormData = new FormData();
    uploadFormData.append("file", file);

    // ✅ Only send sessionId if it exists
    if (sessionId) {
      uploadFormData.append("sessionId", sessionId);
    }

    uploadFormData.append("step", "Account Information");
    uploadFormData.append("data", JSON.stringify({ AccountInformation: {} })); // ✅ Ensure `data` is sent

    try {
      const response = await axios.post(
        "https://backend-three-pink.vercel.app/save-step",
        uploadFormData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log("File uploaded successfully:", response.data);

      // ✅ Update formData with correct filePath
      onFormDataChange({
        AccountInformation: {
          ...formData.AccountInformation,
          logoOfBusiness: response.data.filePath, // ✅ Save returned filePath
        },
      });

      // ✅ Update session ID if needed
      if (!sessionId && response.data.sessionId) {
        setSessionId(response.data.sessionId);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("File upload failed. Please try again.");
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
    onFormDataChange({ AccountInformation: localData, userRole });
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
        <form>
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
                value={localData.clientName || ""}
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
                value={localData.clientEmail || ""}
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
                value={localData.clientPhone || ""}
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
                value={localData.businessDescription || ""}
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
                value={localData.businessOwner || ""}
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
                value={localData.businessEmail || ""}
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
                value={localData.businessContactNumber || ""}
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
                value={localData.clientDob || ""}
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
                value={localData.adhaarNumber || ""}
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
                value={localData.educationQualification || ""}
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
                value={localData.businessName || ""}
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
                value={localData.businessAddress || ""}
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
                value={localData.pincode || ""}
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
                value={localData.location || ""}
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
                value={localData.industryType || ""}
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
                value={localData.registrationType || ""}
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
                value={localData.PANNumber || ""}
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
                value={localData.TANNumber || ""}
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
                value={localData.UDYAMNumber || ""}
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
                value={localData.GSTIN || ""}
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
                value={localData.CIN || ""}
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
                onChange={(e) => handleFileUpload(e.target.files[0])}
                style={{ paddingTop: "1.5%" }}
                required
              />
              <label htmlFor="logoOfBusiness">Logo of Business</label>

              {/* ✅ Show Uploaded File Path */}
              {formData.AccountInformation.logoOfBusiness && (
                <p>
                  Uploaded File:
                  <a
                    href={`https://backend-three-pink.vercel.app${formData.AccountInformation.logoOfBusiness}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {formData.AccountInformation.logoOfBusiness}
                  </a>
                </p>
              )}
            </div>

            <div className="input">
              <input
                id="PIN"
                name="PIN"
                type="text"
                placeholder="PIN"
                value={localData.PIN || ""}
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
                value={localData.numberOfEmployees || ""}
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
                value={localData.nameofDirectors || ""}
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
                value={localData.DIN || ""}
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
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FirstStepBasicDetails;
