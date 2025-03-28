// EditAdminModal.js
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

const EditAdminModal = ({ admin, roles, onClose, onSave, onPasswordChange }) => {
  const [updatedName, setUpdatedName] = useState(admin.username);
  const [updatedPassword, setUpdatedPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
     const [message, setMessage] = useState("");

  const handlePasswordChange = (e) => {
    setUpdatedPassword(e.target.value);
    onPasswordChange(e.target.value);  // Inform parent about the updated password
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError(""); // Reset previous errors
    setMessage(""); // Reset previous success messages
  
    // Prepare the form data with updated fields
    const formData = {
      updatedName: updatedName || "",  // Ensure the updatedName is valid
      updatedPassword: updatedPassword || "",  // Ensure valid password format
      roles: roles || {},  // Ensure roles are an object
    };
  
    try {
      // Send PUT request to the API to update the admin using username
      const response = await fetch(
        `http://localhost:5000/api/admin/${admin.username}`, // Use admin.username as the identifier
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json", // Ensure JSON content type
          },
          body: JSON.stringify(formData), // Send the data as JSON
        }
      );
  
      const data = await response.json(); // Parse the response as JSON
  
      if (response.ok) {
        setMessage("Admin updated successfully!"); // Show success message
  
        // Optionally, update the parent list by calling onUpdate with the updated admin data
        if (onUpdate) {
          onUpdate(data.admin); // Update parent component with the new admin data
        }
  
        // Close the modal after a short delay
        setTimeout(() => {
          setShowEditModal(false); // Close modal after 1 second
        }, 1000);
      } else {
        // If the response is not okay, show the error from the API
        setError(data.error || "Failed to update admin.");
      }
    } catch (err) {
      // Handle any network or unexpected errors
      console.error("Error updating admin:", err);
      setError("Server error. Please try again later.");
    }
  };
  
  
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
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-96">
        <h3 className="text-xl font-semibold mb-4">Edit Admin</h3>

        {/* Username input */}
        <input
          type="text"
          value={updatedName}
          onChange={(e) => setUpdatedName(e.target.value)}
          placeholder="Username"
          className="w-full p-2 mb-4 border border-gray-300 rounded"
        />

        {/* Password input */}
        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            value={updatedPassword}
            onChange={handlePasswordChange}
            placeholder="New password"
            className="w-full p-2 border border-gray-300 rounded"
          />
          <FontAwesomeIcon
            icon={showPassword ? faEyeSlash : faEye}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-2 text-gray-600 cursor-pointer"
          />
        </div>

        {/* Roles input (checkboxes) */}
        <div className="mb-4">
          {Object.keys(roles).map((role) => (
            <label key={role} className="block mb-2">
              <input
                type="checkbox"
                name={role}
                checked={roles[role]}
                onChange={() => {}}
                className="mr-2"
              />
              {role}
            </label>
          ))}
        </div>

        {/* Save and Cancel buttons */}
        <div className="flex justify-between">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditAdminModal;
