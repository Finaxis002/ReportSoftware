import React, { useState } from "react";

import axios from "axios";

const EmployeeRegistrationModal = ({ setShowForm, onEmployeeAdded }) => {
  const BASE_URL = process.env.REACT_APP_BASE_URL || 'https://reportsbe.sharda.co.in';
  // Initial form state with keys that match your API (update keys if needed)
  const [formData, setFormData] = useState({
    employeeId: "",
    name: "",
    email: "",
    designation: "",
    password: "",
    permissions: {
      generateReport: false,
      updateReport: false,
      createNewWithExisting: false,
      downloadPDF: false,
      exportData: false,
      generateWord: false,
      advanceReport: false,
      generateGraph: false,
      cmaData: false,
      consultantReport: false,
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
      const response = await axios.post(
        `${BASE_URL}/api/employees/register`,
        formData
      );

      console.log(response.data);
      setMessage("Employee added successfully");
       if (onEmployeeAdded) {
      onEmployeeAdded(response.data);
    }
      setShowForm(false);
      setFormData({
        employeeId: "",
        name: "",
        email: "",
        designation: "",
        password: "",
        permissions: {
          generateReport: false,
          updateReport: false,
          createNewWithExisting: false,
          downloadPDF: false,
          exportData: false,
          generateWord: false,
          advanceReport: false,
          generateGraph: false,
          cmaData: false,
          consultantReport: false,
        },
      });
    } catch (error) {
      setError("Failed to add employee");
    }
  };

  return (
    // <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
    //   <div className="bg-white p-6 rounded-lg shadow-lg w-96">
    //     <h2 className="text-lg font-bold mb-4">Add User</h2>
    //     {message && <p className="mb-4 text-green-600">{message}</p>}
    //     {error && <p className="mb-4 text-red-500">{error}</p>}
    //     <form onSubmit={handleSubmit}>
    //       {/* Employee ID */}
    //       <input
    //         type="text"
    //         name="employeeId"
    //         placeholder="User ID"
    //         value={formData.employeeId}
    //         onChange={handleInputChange}
    //         className="w-full p-2 mb-2 border rounded"
    //         required
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

    //       {/* Access Control Section */}
    //       <div className="mb-4">
    //         <h3 className="font-semibold mb-2">Access Controls:</h3>
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
    //             Export Report Data
    //           </label>

    //           <label className="flex items-center">
    //             <input
    //               type="checkbox"
    //               name="generateWord"
    //               checked={formData.permissions.generateWord}
    //               onChange={handleCheckboxChange}
    //               className="mr-2"
    //             />
    //             Generate Word
    //           </label>

    //           <label className="flex items-center">
    //             <input
    //               type="checkbox"
    //               name="advanceReport"
    //               checked={formData.permissions.advanceReport}
    //               onChange={handleCheckboxChange}
    //               className="mr-2"
    //             />
    //             Advance Report
    //           </label>

    //           <label className="flex items-center">
    //             <input
    //               type="checkbox"
    //               name="generateGraph"
    //               checked={formData.permissions.generateGraph}
    //               onChange={handleCheckboxChange}
    //               className="mr-2"
    //             />
    //             Generate Graph
    //           </label>
    //         </div>
    //       </div>

    //       {/* Form Actions */}
    //       <div className="flex justify-end">
    //         <button
    //           type="button"
    //           className="mr-2 bg-gray-500 text-white px-4 py-2 rounded"
    //           onClick={() => setShowForm(false)}
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

   <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm p-4">
  <div className="relative bg-white rounded-xl shadow-2xl p-8 w-full max-w-3xl max-h-[90vh] flex flex-col animate-fadeIn">
    {/* Close Button */}
    <button
      onClick={() => setShowForm(false)}
      className="absolute top-4 right-4 text-gray-400 hover:text-red-600 transition-colors text-xl"
      aria-label="Close"
    >
      ×
    </button>

    {/* Title Section */}
    <div className="mb-4">
      <h2 className="text-2xl font-extrabold text-indigo-700 mb-1 text-center tracking-wide">
        Register New User
      </h2>
      <p className="text-gray-500 text-center">
        Fill in the details and assign access rights.
      </p>
    </div>

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

    {/* Form Content with Scroll */}
    <div className="flex-1 overflow-y-auto pr-2">
      <form onSubmit={handleSubmit} autoComplete="off">
        <div className="space-y-4">
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
              />
            </div>

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

          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    className="w-6 h-6"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 3C6.48 3 2 7.02 2 12s4.48 9 10 9 10-4.02 10-9-4.48-9-10-9zM12 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    className="w-6 h-6"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 3C6.48 3 2 7.02 2 12s4.48 9 10 9 10-4.02 10-9-4.48-9-10-9zm1 12a3 3 0 11-2-5.24"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Access Controls */}
          <div className="mt-6">
            <h3 className="font-semibold mb-2 text-indigo-700 tracking-wide">
              Access Controls
            </h3>
            <div className="grid grid-cols-2 gap-3 bg-indigo-50 rounded-xl p-4 mb-2">
              {[
                { name: "generateReport", label: "Generate Report" },
                { name: "updateReport", label: "Update Report" },
                {
                  name: "createNewWithExisting",
                  label: "Create New with Existing",
                },
                { name: "downloadPDF", label: "Download PDF" },
                { name: "exportData", label: "Export Data" },
                { name: "generateWord", label: "Generate Word" },
                { name: "advanceReport", label: "Advance Report" },
                { name: "generateGraph", label: "Generate Graph" },
                { name: "cmaData", label: "CMA Data" },
                { name: "consultantReport", label: "Consultant Report" }
              ].map((perm) => (
                <label
                  key={perm.name}
                  className="flex items-center gap-2 cursor-pointer text-gray-700 hover:text-indigo-700 transition"
                >
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
      </form>
    </div>

    {/* Fixed Buttons at Bottom */}
    <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
      <button
        type="button"
        onClick={() => setShowForm(false)}
        className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
      >
        Cancel
      </button>
      <button
        type="submit"
        className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold shadow hover:bg-indigo-700 transition"
        onClick={handleSubmit}
      >
        Register
      </button>
    </div>
  </div>
</div>
  );
};

export default EmployeeRegistrationModal;

