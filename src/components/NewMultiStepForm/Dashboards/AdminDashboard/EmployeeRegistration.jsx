import React, { useState } from "react";

const EmployeeRegistrationModal = ({ setShowForm }) => {
  // Initial form state with keys that match your API (update keys if needed)
  const [formData, setFormData] = useState({
    employeeId: "",
    name: "",
    email: "",
    designation: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission: send the formData to the API
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        "https://backend-three-pink.vercel.app/api/employees/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          // Note: the keys in formData should match what your API expects.
          body: JSON.stringify({
            employeeId: formData.employeeId, // ensure API expects "employeeId"
            name: formData.name,
            email: formData.email,
            designation: formData.designation,
            password: formData.password,
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setMessage("Employee registered successfully!");
        // Optionally clear the form after successful submission
        setFormData({
          employeeId: "",
          name: "",
          email: "",
          designation: "",
          password: "",
        });
        // Close the modal after successful submission
        setShowForm(false);
      } else {
        setError(data.error || "Failed to register employee.");
      }
    } catch (err) {
      console.error("Error during registration:", err);
      setError("Server error. Please try again later.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-lg font-bold mb-4">Add Employee</h2>
        {message && <p className="mb-4 text-green-500">{message}</p>}
        {error && <p className="mb-4 text-red-500">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="employeeId"
            placeholder="Employee ID"
            value={formData.employeeId}
            onChange={handleInputChange}
            className="w-full p-2 mb-2 border rounded"
            required
          />
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full p-2 mb-2 border rounded"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full p-2 mb-2 border rounded"
            required
          />
          <input
            type="text"
            name="designation"
            placeholder="Designation"
            value={formData.designation}
            onChange={handleInputChange}
            className="w-full p-2 mb-4 border rounded"
            required
          />
         
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
