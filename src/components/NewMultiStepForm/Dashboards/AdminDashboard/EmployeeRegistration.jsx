import React, { useState } from "react";

import axios from 'axios';

const EmployeeRegistrationModal = ({ setShowForm }) => {
  // Initial form state with keys that match your API (update keys if needed)
  const [formData, setFormData] = useState({
    employeeId: "",
    name: "",
    email: "",
    designation: "",
    password: "",
    permissions: {
      createReport: false,
      updateReport: false,
      createNewWithExisting: false,
      downloadPDF: false,
    },
  });
  
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [name]: checked,
      },
    }));
  };
  

  // Handle form submission: send the formData to the API
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await axios.post("/api/employees", formData);
      console.log(response.data);
      setMessage("Employee added successfully");
      setFormData({
        employeeId: "",
        name: "",
        email: "",
        designation: "",
        password: "",
        permissions: {
          createReport: false,
          updateReport: false,
          createNewWithExisting: false,
          downloadPDF: false,
        },
      });
    } catch (error) {
      setError("Failed to add employee");
    }
  };
  

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
      <h2 className="text-lg font-bold mb-4">Add Employee</h2>
      {message && <p className="mb-4 text-green-600">{message}</p>}
      {error && <p className="mb-4 text-red-500">{error}</p>}
      <form onSubmit={handleSubmit}>
        {/* Employee ID */}
        <input
          type="text"
          name="employeeId"
          placeholder="Employee ID"
          value={formData.employeeId}
          onChange={handleInputChange}
          className="w-full p-2 mb-2 border rounded"
          required
        />
  
        {/* Name */}
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleInputChange}
          className="w-full p-2 mb-2 border rounded"
          required
        />
  
        {/* Email */}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleInputChange}
          className="w-full p-2 mb-2 border rounded"
          required
        />
  
        {/* Designation */}
        <input
          type="text"
          name="designation"
          placeholder="Designation"
          value={formData.designation}
          onChange={handleInputChange}
          className="w-full p-2 mb-4 border rounded"
          required
        />
  
        {/* Password */}
        <div className="flex w-full">
          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full p-2 mb-4 border rounded"
              required
            />
            <button
              type="button"
              className="absolute right-3 top-3 text-teal-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <i className="fas fa-eye-slash text-teal-600 w-6 h-6"></i>
              ) : (
                <i className="fas fa-eye text-teal-600 w-6 h-6"></i>
              )}
            </button>
          </div>
        </div>
  
        {/* Access Control Section */}
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Access Controls:</h3>
          <div className="flex flex-col gap-2">
            {/* Create Report */}
            <label className="flex items-center">
              <input
                type="checkbox"
                name="createReport"
                checked={formData.permissions.createReport}
                onChange={handleCheckboxChange}
                className="mr-2"
              />
              Create Report
            </label>
  
            {/* Update Report */}
            <label className="flex items-center">
              <input
                type="checkbox"
                name="updateReport"
                checked={formData.permissions.updateReport}
                onChange={handleCheckboxChange}
                className="mr-2"
              />
              Update Report
            </label>
  
            {/* Create New Report with Existing */}
            <label className="flex items-center">
              <input
                type="checkbox"
                name="createNewWithExisting"
                checked={formData.permissions.createNewWithExisting}
                onChange={handleCheckboxChange}
                className="mr-2"
              />
              Create New Report with Existing
            </label>
  
            {/* Download PDF */}
            <label className="flex items-center">
              <input
                type="checkbox"
                name="downloadPDF"
                checked={formData.permissions.downloadPDF}
                onChange={handleCheckboxChange}
                className="mr-2"
              />
              Download PDF
            </label>
          </div>
        </div>
  
        {/* Form Actions */}
        <div className="flex justify-end">
          <button
            type="button"
            className="mr-2 bg-gray-500 text-white px-4 py-2 rounded"
            onClick={() => setShowForm(false)}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  </div>
  
  );
};

export default EmployeeRegistrationModal;
