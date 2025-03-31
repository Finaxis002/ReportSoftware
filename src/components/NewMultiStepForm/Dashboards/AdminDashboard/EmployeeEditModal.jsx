import React, { useState, useEffect } from "react";

const EmployeeEditModal = ({ employee, setShowEditModal, onUpdate }) => {
  // Initialize form data with the employee's data
  const [formData, setFormData] = useState({
    employeeId: employee.employeeId || "",
    name: employee.name || "",
    email: employee.email || "",
    designation: employee.designation || "",
    password: employee.password || "",
    permissions: {
      generateReport: employee?.permissions?.generateReport || false,
      updateReport: employee?.permissions?.updateReport || false,
      createNewWithExisting: employee?.permissions?.createNewWithExisting || false,
      downloadPDF: employee?.permissions?.downloadPDF || false,
      exportData: employee?.permissions?.exportData || false,
    },
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Update formData if employee prop changes (for example, if you edit a different employee)
  useEffect(() => {
    setFormData({
      employeeId: employee.employeeId || "",
      name: employee.name || "",
      email: employee.email || "",
      designation: employee.designation || "",
      password: employee.password || "",
      permissions: {
        generateReport: employee?.permissions?.generateReport || false,
        updateReport: employee?.permissions?.updateReport || false,
        createNewWithExisting: employee?.permissions?.createNewWithExisting || false,
        downloadPDF: employee?.permissions?.downloadPDF || false,
        exportData: employee?.permissions?.exportData || false,
      },
    });
  }, [employee]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle permission changes (for checkboxes)
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

  // Handle form submission: send updated data to the API
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `https://backend-three-pink.vercel.app/api/employees/${employee.employeeId}`,
        {
          method: "PUT", // or "PATCH" if updating only certain fields
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setMessage("Employee updated successfully!");
        // Optionally, update the parent list by calling onUpdate with the new data
        onUpdate(data.employee);
        // Close the modal after a short delay
        setTimeout(() => {
          setShowEditModal(false);
        }, 1000);
      } else {
        setError(data.error || "Failed to update employee.");
      }
    } catch (err) {
      console.error("Error updating employee:", err);
      setError("Server error. Please try again later.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-lg font-bold mb-4">Edit Employee</h2>
        {message && <p className="mb-4 text-green-500">{message}</p>}
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
            disabled
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

          {/* Permissions Section */}
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Access Permissions:</h3>
            <div className="flex flex-col gap-2">
              {/* Create Report */}
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="generateReport"
                  checked={formData.permissions.generateReport}
                  onChange={handleCheckboxChange}
                  className="mr-2"
                />
                Generate Report
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
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="exportData"
                  checked={formData.permissions.exportData}
                  onChange={handleCheckboxChange}
                  className="mr-2"
                />
               Export Report Data
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end">
            <button
              type="button"
              className="mr-2 bg-gray-500 text-white px-4 py-2 rounded"
              onClick={() => setShowEditModal(false)}
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

export default EmployeeEditModal;
