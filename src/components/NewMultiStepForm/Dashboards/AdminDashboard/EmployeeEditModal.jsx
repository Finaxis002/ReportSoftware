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
      generateGraph: employee?.permissions?.generateGraph || false,
      advanceReport: employee?.permissions?.advanceReport || false,
      generateWord: employee?.permissions?.generateWord || false,
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
        generateGraph: employee?.permissions?.generateGraph || false,
      advanceReport: employee?.permissions?.advanceReport || false,
      generateWord: employee?.permissions?.generateWord || false,
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
        `https://reportsbe.sharda.co.in/api/employees/${employee.employeeId}`,
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
    // <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
    //   <div className="bg-white p-6 rounded-lg shadow-lg w-96">
    //     <h2 className="text-lg font-bold mb-4">Edit User</h2>
    //     {message && <p className="mb-4 text-green-500">{message}</p>}
    //     {error && <p className="mb-4 text-red-500">{error}</p>}

    //     <form onSubmit={handleSubmit}>
    //       {/* Employee ID */}
    //       <input
    //         type="text"
    //         name="employeeId"
    //         placeholder="Employee ID"
    //         value={formData.employeeId}
    //         onChange={handleInputChange}
    //         className="w-full p-2 mb-2 border rounded"
    //         required
    //         disabled
    //       />

    //       {/* Name */}
    //       <input
    //         type="text"
    //         name="name"
    //         placeholder="Name"
    //         value={formData.name}
    //         onChange={handleInputChange}
    //         className="w-full p-2 mb-2 border rounded"
    //         required
    //       />

    //       {/* Email */}
    //       <input
    //         type="email"
    //         name="email"
    //         placeholder="Email"
    //         value={formData.email}
    //         onChange={handleInputChange}
    //         className="w-full p-2 mb-2 border rounded"
    //         required
    //       />

    //       {/* Designation */}
    //       <input
    //         type="text"
    //         name="designation"
    //         placeholder="Designation"
    //         value={formData.designation}
    //         onChange={handleInputChange}
    //         className="w-full p-2 mb-4 border rounded"
    //         required
    //       />

    //       {/* Password */}
    //       <div className="flex w-full">
    //         <div className="relative w-full">
    //           <input
    //             type={showPassword ? "text" : "password"}
    //             name="password"
    //             placeholder="Password"
    //             value={formData.password}
    //             onChange={handleInputChange}
    //             className="w-full p-2 mb-4 border rounded"
    //             required
    //           />
    //           <button
    //             type="button"
    //             className="absolute right-3 top-3 text-teal-600"
    //             onClick={() => setShowPassword(!showPassword)}
    //           >
    //             {showPassword ? (
    //               <i className="fas fa-eye-slash text-teal-600 w-6 h-6"></i>
    //             ) : (
    //               <i className="fas fa-eye text-teal-600 w-6 h-6"></i>
    //             )}
    //           </button>
    //         </div>
    //       </div>

    //       {/* Permissions Section */}
    //       <div className="mb-4">
    //         <h3 className="font-semibold mb-2">Access Permissions:</h3>
    //         <div className="flex flex-col gap-2">
    //           {/* Create Report */}
    //           <label className="flex items-center">
    //             <input
    //               type="checkbox"
    //               name="generateReport"
    //               checked={formData.permissions.generateReport}
    //               onChange={handleCheckboxChange}
    //               className="mr-2"
    //             />
    //             Generate Report
    //           </label>

    //           {/* Update Report */}
    //           <label className="flex items-center">
    //             <input
    //               type="checkbox"
    //               name="updateReport"
    //               checked={formData.permissions.updateReport}
    //               onChange={handleCheckboxChange}
    //               className="mr-2"
    //             />
    //             Update Report
    //           </label>

    //           {/* Create New Report with Existing */}
    //           <label className="flex items-center">
    //             <input
    //               type="checkbox"
    //               name="createNewWithExisting"
    //               checked={formData.permissions.createNewWithExisting}
    //               onChange={handleCheckboxChange}
    //               className="mr-2"
    //             />
    //             Create New Report with Existing
    //           </label>

    //           {/* Download PDF */}
    //           <label className="flex items-center">
    //             <input
    //               type="checkbox"
    //               name="downloadPDF"
    //               checked={formData.permissions.downloadPDF}
    //               onChange={handleCheckboxChange}
    //               className="mr-2"
    //             />
    //             Download PDF
    //           </label>
    //           <label className="flex items-center">
    //             <input
    //               type="checkbox"
    //               name="exportData"
    //               checked={formData.permissions.exportData}
    //               onChange={handleCheckboxChange}
    //               className="mr-2"
    //             />
    //            Export Report Data
    //           </label>
    //         </div>
    //       </div>

    //       {/* Action Buttons */}
    //       <div className="flex justify-end">
    //         <button
    //           type="button"
    //           className="mr-2 bg-gray-500 text-white px-4 py-2 rounded"
    //           onClick={() => setShowEditModal(false)}
    //         >
    //           Cancel
    //         </button>
    //         <button
    //           type="submit"
    //           className="bg-green-500 text-white px-4 py-2 rounded"
    //         >
    //           Save Changes
    //         </button>
    //       </div>
    //     </form>
    //   </div>
    // </div>

    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="relative bg-white rounded-xl shadow-2xl p-8 w-full max-w-3xl animate-fadeIn">
        {/* Close Button */}
        <button
          onClick={() => setShowEditModal(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-600 transition-colors text-xl"
          aria-label="Close"
        >
          ×
        </button>

        {/* Title */}
        <h2 className="text-2xl font-extrabold text-indigo-700 mb-3 text-center tracking-wide">
          Edit Employee
        </h2>
        <p className="text-gray-500 mb-6 text-center">
          Update the details and permissions for the employee.
        </p>

        {/* Feedback Messages */}
        {message && (
          <div className="mb-4 px-4 py-2 rounded bg-green-50 text-green-700 border border-green-300 text-center shadow">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-4 px-4 py-2 rounded bg-red-50 text-red-700 border border-red-300 text-center shadow">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="space-y-4">
            {/* Employee ID */}
            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="block font-medium text-gray-700 mb-1">
                  Employee ID
                </label>
                <input
                  type="text"
                  name="employeeId"
                  placeholder="e.g. EMP123"
                  value={formData.employeeId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-indigo-100 outline-none transition"
                  required
                  disabled
                />
              </div>

              {/* Name */}
              <div className="flex-1">
                <label className="block font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-indigo-100 outline-none transition"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="block font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-indigo-100 outline-none transition"
                  required
                />
              </div>

              {/* Designation */}
              <div className="flex-1">
                <label className="block font-medium text-gray-700 mb-1">
                  Designation
                </label>
                <input
                  type="text"
                  name="designation"
                  placeholder="e.g. Analyst"
                  value={formData.designation}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-indigo-100 outline-none transition"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="relative">
              <label className="block font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-indigo-100 outline-none transition pr-12"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-indigo-600"
                tabIndex={-1}
                onClick={() => setShowPassword((s) => !s)}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" className="w-5 h-5" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.961 9.961 0 013.042-7.078m2.285 2.336A5.985 5.985 0 006 12c0 3.314 2.686 6 6 6 1.32 0 2.55-.427 3.547-1.151m2.147-2.147A5.985 5.985 0 0018 12c0-3.314-2.686-6-6-6-1.067 0-2.074.28-2.925.77" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" className="w-5 h-5" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 01-6 0m6 0a6 6 0 11-12 0 6 6 0 0112 0zm0 0c0 1.657-1.343 3-3 3s-3-1.343-3-3" />
                  </svg>
                )}
              </button>
            </div>

            {/* Permissions Section */}
            <div className="mt-6">
              <h3 className="font-semibold mb-2 text-indigo-700 tracking-wide">
                Access Permissions
              </h3>
              <div className="grid grid-cols-2 gap-3 bg-indigo-50 rounded-xl p-4 mb-2">
                {[{ name: "generateReport", label: "Generate Report" },
                { name: "updateReport", label: "Update Report" },
                { name: "createNewWithExisting", label: "Create New with Existing" },
                { name: "downloadPDF", label: "Download PDF" },
                { name: "exportData", label: "Export Data" },
                { name: "generateWord", label: "Generate Word" },
                { name: "advanceReport", label: "Advance Report" },
                { name: "generateGraph", label: "Generate Graph" }].map((perm) => (
                  <label key={perm.name} className="flex items-center gap-2 cursor-pointer text-gray-700 hover:text-indigo-700 transition">
                    <input
                      type="checkbox"
                      name={perm.name}
                      checked={formData.permissions[perm.name]}
                      onChange={handleCheckboxChange}
                      className="form-checkbox text-indigo-600 rounded"
                    />
                    <span className="text-sm">{perm.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold shadow hover:bg-indigo-700 transition"
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
