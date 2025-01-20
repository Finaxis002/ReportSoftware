import React, { useState } from 'react'

const Step1 = ({ handleSave, reportInput }) => {
    const getValue = (name) => {
        if (reportInput !== undefined && reportInput.personalDetails !== undefined && reportInput.personalDetails[name] !== undefined)
            return reportInput.personalDetails[name]
        return '';
    }

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
        nameofPartners: getValue('nameofPartners'),
        PIN: getValue('PIN'),
        numberOfEmployees: getValue('numberOfEmployees'),
        nameofDirectors: getValue('nameofDirectors'),
        DIN: getValue('DIN')
    })

    const handleSave2 = (x) => {
        console.log("ssdds", formInput)
        handleSave({ "personalDetails": formInput })
    }

    const handleChange = (e) => {
        let targetName = e.target.name;
        let targetValue = e.target.value;
        //console.log(targetName, targetValue);
        let tempInput = formInput;
        tempInput[targetName] = targetValue;
        setFormInput({ ...tempInput })
    }

    return (
        <div className=''>
            <div className='form-scroll'>
                <div className="input">
                    <input id="name" name="clientName" type="text" placeholder="eg. John Doe" required
                        value={formInput.clientName} onChange={(e) => handleChange(e)} />
                    <label htmlFor="name">Name</label>
                </div>

                <div className="input">
                    <input id="clientEmail" name="clientEmail" type="email" placeholder="eg. john@example.com" required
                        value={formInput.clientEmail} onChange={(e) => handleChange(e)} />
                    <label htmlFor="clientEmail">Email</label>
                </div>

                <div className="input">
                    <input id="clientPhone" name="clientPhone" type="tel" placeholder="eg. 123-456-7890" required
                        value={formInput.clientPhone} onChange={(e) => handleChange(e)} />
                    <label htmlFor="clientPhone">Phone</label>
                </div>

                <div className="input">
                    <input id="businessDescription" name="businessDescription" type="text" placeholder="Business Description" required
                        value={formInput.businessDescription} onChange={(e) => handleChange(e)} />
                    <label htmlFor="businessDescription">Business Description</label>
                </div>

                <div className="input">
                    <input id="businessOwner" name="businessOwner" type="text" placeholder="Business Owner's Name" required
                        value={formInput.businessOwner} onChange={(e) => handleChange(e)} />
                    <label htmlFor="businessOwner">Business Owner</label>
                </div>

                <div className="input">
                    <input id="businessEmail" name="businessEmail" type="email" placeholder="eg. info@example.com" required
                        value={formInput.businessEmail} onChange={(e) => handleChange(e)} />
                    <label htmlFor="businessEmail">Business Email</label>
                </div>

                <div className="input">
                    <input id="businessContactNumber" name="businessContactNumber" type="tel" placeholder="eg. 123-456-7890" required
                        value={formInput.businessContactNumber} onChange={(e) => handleChange(e)} />
                    <label htmlFor="businessContactNumber">Business Contact Number</label>
                </div>

                <div className="input">
                    <input id="clientDob" name="clientDob" type="date" required
                        value={formInput.clientDob} onChange={(e) => handleChange(e)} />
                    <label htmlFor="clientDob">Date of Birth</label>
                </div>

                <div className="input">
                    <input id="adhaarNumber" name="adhaarNumber" type="text" placeholder="Adhaar Number" required
                        value={formInput.adhaarNumber} onChange={(e) => handleChange(e)} />
                    <label htmlFor="adhaarNumber">Adhaar Number</label>
                </div>

                <div className="input">
                    <input id="educationQualification" name="educationQualification" type="text" placeholder="Education Qualification" required
                        value={formInput.educationQualification} onChange={(e) => handleChange(e)} />
                    <label htmlFor="educationQualification">Education Qualification</label>
                </div>

                <div className="input">
                    <input id="businessName" name="businessName" type="text" placeholder="Business Name" required
                        value={formInput.businessName} onChange={(e) => handleChange(e)} />
                    <label htmlFor="businessName">Business Name</label>
                </div>

                <div className="input">
                    <input id="businessAddress" name="businessAddress" type="text" placeholder="Business Address" required
                        value={formInput.businessAddress} onChange={(e) => handleChange(e)} />
                    <label htmlFor="businessAddress">Business Address</label>
                </div>

                <div className="input">
                    <input id="pincode" name="pincode" type="text" placeholder="Pincode" required
                        value={formInput.pincode} onChange={(e) => handleChange(e)} />
                    <label htmlFor="pincode">Pincode</label>
                </div>

                <div className="input">
                    <input id="location" name="location" type="text" placeholder="Location" required
                        value={formInput.location} onChange={(e) => handleChange(e)} />
                    <label htmlFor="location">Location</label>
                </div>

                <div className="input">
                    <input id="industryType" name="industryType" type="text" placeholder="Industry Type" required
                        value={formInput.industryType} onChange={(e) => handleChange(e)} />
                    <label htmlFor="industryType">Industry Type</label>
                </div>

                <div className="input">
                    <input id="registrationType" name="registrationType" type="text" placeholder="Registration Type" required
                        value={formInput.registrationType} onChange={(e) => handleChange(e)} />
                    <label htmlFor="registrationType">Registration Type</label>
                </div>

                <div className="input">
                    <input id="PANNumber" name="PANNumber" type="text" placeholder="PAN Number" required
                        value={formInput.PANNumber} onChange={(e) => handleChange(e)} />
                    <label htmlFor="PANNumber">PAN Number</label>
                </div>

                <div className="input">
                    <input id="TANNumber" name="TANNumber" type="text" placeholder="TAN Number" required
                        value={formInput.TANNumber} onChange={(e) => handleChange(e)} />
                    <label htmlFor="TANNumber">TAN Number</label>
                </div>

                <div className="input">
                    <input id="UDYAMNumber" name="UDYAMNumber" type="text" placeholder="UDYAM Number" required
                        value={formInput.UDYAMNumber} onChange={(e) => handleChange(e)} />
                    <label htmlFor="UDYAMNumber">UDYAM Number</label>
                </div>

                <div className="input">
                    <input id="GSTIN" name="GSTIN" type="text" placeholder="GSTIN" required
                        value={formInput.GSTIN} onChange={(e) => handleChange(e)} />
                    <label htmlFor="GSTIN">GSTIN</label>
                </div>

                <div className="input">
                    <input id="CIN" name="CIN" type="text" placeholder="CIN" required
                        value={formInput.CIN} onChange={(e) => handleChange(e)} />
                    <label htmlFor="CIN">CIN</label>
                </div>

                {/* <div className="input align-baseline">
                    <input id="logoOfBusiness" name="logoOfBusiness" type="file" required
                        accept="image/png, image/jpeg"
                        value={formInput.logoOfBusiness} onChange={(e) => handleChange(e)} />
                    <label htmlFor="logoOfBusiness">Logo of Business</label>
                </div> */}

                <div className="input">
                    <input id="nameofPartners" name="nameofPartners" type="text" placeholder="Name of Partners" required
                        value={formInput.nameofPartners} onChange={(e) => handleChange(e)} />
                    <label htmlFor="nameofPartners">Name of Partners</label>
                </div>

                <div className="input">
                    <input id="PIN" name="PIN" type="text" placeholder="PIN" required
                        value={formInput.PIN} onChange={(e) => handleChange(e)} />
                    <label htmlFor="PIN">PIN</label>
                </div>

                <div className="input">
                    <input id="numberOfEmployees" name="numberOfEmployees" type="number" placeholder="Number of Employees" required
                        value={formInput.numberOfEmployees} onChange={(e) => handleChange(e)} />
                    <label htmlFor="numberOfEmployees">Number of Employees</label>
                </div>

                <div className="input">
                    <input id="nameofDirectors" name="nameofDirectors" type="text" placeholder="Name of Directors" required
                        value={formInput.nameofDirectors} onChange={(e) => handleChange(e)} />
                    <label htmlFor="nameofDirectors">Name of Directors</label>
                </div>

                <div className="input">
                    <input id="DIN" name="DIN" type="text" placeholder="DIN" required
                        value={formInput.DIN} onChange={(e) => handleChange(e)} />
                    <label htmlFor="DIN">DIN</label>
                </div>
            </div>
            <button className="btn btn-success mt-5 px-5" onClick={() => { handleSave2({ step1: formInput }) }}>
                Save
            </button>
        </div>


    )
}

export default Step1