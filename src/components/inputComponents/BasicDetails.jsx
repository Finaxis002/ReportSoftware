import React, { useState } from 'react';

const BasicDetails = ({ handleSave, reportInput }) => {
    const getValue = (name) => {
        if (reportInput !== undefined && reportInput.personalDetails !== undefined && reportInput.personalDetails[name] !== undefined)
            return reportInput.personalDetails[name];
        else if (name === "allPartners")
            return [];
        else
            return '';
    };

    const [formInput, setFormInput] = useState({
        clientName: getValue('clientName'),
        clientEmail: getValue('clientEmail'),
        clientPhone: getValue('clientPhone'),
        businessDescription: getValue('businessDescription'),
        businessOwner: getValue('businessOwner'),
        businessEmail: getValue('businessEmail'),
        businessContactNumber: getValue('businessContactNumber'),
        clientDob: getValue('clientDob'),
        adhaarNumber: getValue('adhaarNumber'),
        educationQualification: getValue('educationQualification'),
        businessName: getValue('businessName'),
        businessAddress: getValue('businessAddress'),
        pincode: getValue('pincode'),
        location: getValue('location'),
        industryType: getValue('industryType'),
        registrationType: getValue('registrationType'),
        PANNumber: getValue('PANNumber'),
        TANNumber: getValue('TANNumber'),
        UDYAMNumber: getValue('UDYAMNumber'),
        GSTIN: getValue('GSTIN'),
        CIN: getValue('CIN'),
        logoOfBusiness: getValue('logoOfBusiness'),
        allPartners: getValue('allPartners'),
        PIN: getValue('PIN'),
        numberOfEmployees: getValue('numberOfEmployees'),
        nameofDirectors: getValue('nameofDirectors'),
        DIN: getValue('DIN')
    });

    const addPartner = () => {
        let newArray = [...formInput["allPartners"]];
        if (newArray.length > 0 && newArray[newArray.length - 1].partnerName === "") {
            alert("Please fill the previous field first");
            return false;
        }
        newArray.push({
            partnerName: "",
            partnerAadhar: "",
            partnerDin: ""
        });
        setFormInput({
            ...formInput,
            allPartners: newArray
        });
    };

    const handlePartnerChange = (e, i) => {
        let newArray = [...formInput.allPartners];
        newArray[i][e.target.name] = e.target.value;
        setFormInput({
            ...formInput,
            allPartners: newArray
        });
    };

    const submit = () => {
        const formData = new FormData();
    
        // Append all form inputs to the FormData object
        for (const key in formInput) {
            if (key === "allPartners") {
                formInput[key].forEach((partner, idx) => {
                    formData.append(`personalDetails[allPartners][${idx}][partnerName]`, partner.partnerName);
                    formData.append(`personalDetails[allPartners][${idx}][partnerAadhar]`, partner.partnerAadhar);
                    formData.append(`personalDetails[allPartners][${idx}][partnerDin]`, partner.partnerDin);
                });
            } else {
                formData.append(`personalDetails[${key}]`, formInput[key]);
            }
        }
    
        // Append file (logoOfBusiness)
        const logoFile = document.getElementById("logoOfBusiness").files[0];
        if (logoFile) {
            formData.append("logoOfBusiness", logoFile);
        }
    
        // Now send the formData to the server
        handleSave(formData); // Send this formData with the file to the server
    };
    

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormInput(prevInput => ({
            ...prevInput,
            [name]: value
        }));
    };

    return (
        <div className="">
            <div className="form-scroll">
                {[
                    { name: "clientName", placeholder: "eg. John Doe", type: "text", label: "Name" },
                    { name: "clientEmail", placeholder: "eg. john@example.com", type: "email", label: "Email" },
                    { name: "clientPhone", placeholder: "eg. 123-456-7890", type: "tel", label: "Phone" },
                    { name: "businessDescription", placeholder: "Business Description", type: "text", label: "Business Description" },
                    { name: "businessOwner", placeholder: "Business Owner's Name", type: "text", label: "Business Owner" },
                    { name: "businessEmail", placeholder: "eg. info@example.com", type: "email", label: "Business Email" },
                    { name: "businessContactNumber", placeholder: "eg. 123-456-7890", type: "tel", label: "Business Contact Number" },
                    { name: "clientDob", placeholder: "", type: "date", label: "Date of Birth" },
                    { name: "adhaarNumber", placeholder: "Adhaar Number", type: "text", label: "Adhaar Number" },
                    { name: "educationQualification", placeholder: "Education Qualification", type: "text", label: "Education Qualification" },
                    { name: "businessName", placeholder: "Business Name", type: "text", label: "Business Name" },
                    { name: "businessAddress", placeholder: "Business Address", type: "text", label: "Business Address" },
                    { name: "pincode", placeholder: "Pincode", type: "text", label: "Pincode" },
                    { name: "location", placeholder: "Location", type: "text", label: "Location" },
                    { name: "industryType", placeholder: "Industry Type", type: "text", label: "Industry Type" },
                    { name: "registrationType", placeholder: "Registration Type", type: "text", label: "Registration Type" },
                    { name: "PANNumber", placeholder: "PAN Number", type: "text", label: "PAN Number" },
                    { name: "TANNumber", placeholder: "TAN Number", type: "text", label: "TAN Number" },
                    { name: "UDYAMNumber", placeholder: "UDYAM Number", type: "text", label: "UDYAM Number" },
                    { name: "GSTIN", placeholder: "GSTIN", type: "text", label: "GSTIN" },
                    { name: "CIN", placeholder: "CIN", type: "text", label: "CIN" },
                    { name: "PIN", placeholder: "PIN", type: "text", label: "PIN" },
                    { name: "numberOfEmployees", placeholder: "Number of Employees", type: "number", label: "Number of Employees" },
                    { name: "nameofDirectors", placeholder: "Name of Directors", type: "text", label: "Name of Directors" },
                    { name: "DIN", placeholder: "DIN", type: "text", label: "DIN" }
                ].map((input, index) => (
                    <div className="input" key={index}>
                        <input 
                            id={input.name} 
                            name={input.name} 
                            type={input.type} 
                            placeholder={input.placeholder} 
                            required
                            value={formInput[input.name]} 
                            onChange={handleChange} 
                        />
                        <label htmlFor={input.name}>{input.label}</label>
                    </div>
                ))}

                <div className="input align-baseline">
                    <input 
                        id="logoOfBusiness" 
                        name="logoOfBusiness" 
                        type="file" 
                        required
                        accept="image/png, image/jpeg" 
                        style={{ paddingTop: "1.5%" }}
                        value={formInput.logoOfBusiness} 
                        onChange={handleChange} 
                    />
                    <label htmlFor="logoOfBusiness">Logo of Business</label>
                </div>

                <div className="bg-light text-center p-3 mb-4">
                    <h5>Add Partners</h5>
                    {formInput["allPartners"] &&
                        formInput["allPartners"].map((p, i) => (
                            <div key={i} className='d-flex gap-3 justify-content-around'>
                                <div className="mt-2">{i + 1}</div>
                                {["partnerName", "partnerAadhar", "partnerDin"].map((field, idx) => (
                                    <div key={idx} className="input mb-0">
                                        <input
                                            id={field} 
                                            name={field} 
                                            type="text" 
                                            placeholder={`${field} of Partner`} 
                                            required
                                            value={p[field]} 
                                            onChange={(e) => handlePartnerChange(e, i)} 
                                        />
                                        <label htmlFor={field}>{field.replace(/([A-Z])/g, ' $1').toUpperCase()}</label>
                                    </div>
                                ))}
                            </div>
                        ))}
                    <button className="btn btn-sm btn-primary" onClick={addPartner}>Add Partner</button>
                </div>
            </div>

            <button className="btn btn-success mt-5 px-5" onClick={submit}>
                Save
            </button>
        </div>
    );
};

export default BasicDetails;
