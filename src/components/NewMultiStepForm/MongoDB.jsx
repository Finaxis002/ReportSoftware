import React, { useEffect, useState } from "react";
import axios from "axios";

const MongoDB = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios
      .get("  ")
      .then((response) => setUsers(response.data))
      .catch((err) => console.error("Error fetching users:", err));
  }, []);

  return (
    <div className="p-4 bg-gray-100 min-h-screen mt-4 bg-light px-4">
      <h1 className="py-4 text-center text-xl font-bold">MongoDB Data</h1>
      <div className="overflow-x-visible ">
        <table className="table-auto w-full border-collapse border border-gray-300 ">
          <thead className="bg-gray-200">
            <tr>
            <th className="border border-gray-300 px-4 py-2">S. No. </th>
              <th className="border border-gray-300 px-4 py-2">Client Name</th>
              <th className="border border-gray-300 px-4 py-2">Client Email</th>
              <th className="border border-gray-300 px-4 py-2">Client Phone</th>
              <th className="border border-gray-300 px-4 py-2">Business Description</th>
              <th className="border border-gray-300 px-4 py-2">Business Owner</th>
              <th className="border border-gray-300 px-4 py-2">Business Email</th>
              <th className="border border-gray-300 px-4 py-2">Business Contact Number</th>
              <th className="border border-gray-300 px-4 py-2">Client DOB</th>
              <th className="border border-gray-300 px-4 py-2">Aadhaar Number</th>
              <th className="border border-gray-300 px-4 py-2">Education Qualification</th>
              <th className="border border-gray-300 px-4 py-2">Business Name</th>
              <th className="border border-gray-300 px-4 py-2">Business Address</th>
              <th className="border border-gray-300 px-4 py-2">Pincode</th>
              <th className="border border-gray-300 px-4 py-2">Location</th>
              <th className="border border-gray-300 px-4 py-2">Industry Type</th>
              <th className="border border-gray-300 px-4 py-2">Registration Type</th>
              <th className="border border-gray-300 px-4 py-2">PAN Number</th>
              <th className="border border-gray-300 px-4 py-2">TAN Number</th>
              <th className="border border-gray-300 px-4 py-2">UDYAM Number</th>
              <th className="border border-gray-300 px-4 py-2">GSTIN</th>
              <th className="border border-gray-300 px-4 py-2">CIN</th>
              <th className="border border-gray-300 px-4 py-2">Logo of Business</th>
              <th className="border border-gray-300 px-4 py-2">PIN</th>
              <th className="border border-gray-300 px-4 py-2">Number of Employees</th>
              <th className="border border-gray-300 px-4 py-2">Name of Directors</th>
              <th className="border border-gray-300 px-4 py-2">DIN</th>
              <th className="border border-gray-300 px-4 py-2">All Partners</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={index} className="even:bg-gray-100 odd:bg-white">
                <td className="border border-gray-300 px-4 py-2">{index + 1}</td> {/* Display Serial Number */}
                <td className="border border-gray-300 px-4 py-2">{user.clientName}</td>
                <td className="border border-gray-300 px-4 py-2">{user.clientEmail}</td>
                <td className="border border-gray-300 px-4 py-2">{user.clientPhone}</td>
                <td className="border border-gray-300 px-4 py-2">{user.businessDescription}</td>
                <td className="border border-gray-300 px-4 py-2">{user.businessOwner}</td>
                <td className="border border-gray-300 px-4 py-2">{user.businessEmail}</td>
                <td className="border border-gray-300 px-4 py-2">{user.businessContactNumber}</td>
                <td className="border border-gray-300 px-4 py-2">{user.clientDob}</td>
                <td className="border border-gray-300 px-4 py-2">{user.adhaarNumber}</td>
                <td className="border border-gray-300 px-4 py-2">{user.educationQualification}</td>
                <td className="border border-gray-300 px-4 py-2">{user.businessName}</td>
                <td className="border border-gray-300 px-4 py-2">{user.businessAddress}</td>
                <td className="border border-gray-300 px-4 py-2">{user.pincode}</td>
                <td className="border border-gray-300 px-4 py-2">{user.location}</td>
                <td className="border border-gray-300 px-4 py-2">{user.industryType}</td>
                <td className="border border-gray-300 px-4 py-2">{user.registrationType}</td>
                <td className="border border-gray-300 px-4 py-2">{user.PANNumber}</td>
                <td className="border border-gray-300 px-4 py-2">{user.TANNumber}</td>
                <td className="border border-gray-300 px-4 py-2">{user.UDYAMNumber}</td>
                <td className="border border-gray-300 px-4 py-2">{user.GSTIN}</td>
                <td className="border border-gray-300 px-4 py-2">{user.CIN}</td>
                <td className="border border-gray-300 px-4 py-2">{user.logoOfBusiness}</td>
                <td className="border border-gray-300 px-4 py-2">{user.PIN}</td>
                <td className="border border-gray-300 px-4 py-2">{user.numberOfEmployees}</td>
                <td className="border border-gray-300 px-4 py-2">{user.nameofDirectors}</td>
                <td className="border border-gray-300 px-4 py-2">{user.DIN}</td>
                <td className="border border-gray-300 px-4 py-2">
                  {user.allPartners.map((partner, idx) => (
                    <div key={idx}>
                      <p>Partner Name: {partner.partnerName}</p>
                      <p>Partner Aadhaar: {partner.partnerAadhar}</p>
                      <p>Partner DIN: {partner.partnerDin}</p>
                    </div>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MongoDB;
