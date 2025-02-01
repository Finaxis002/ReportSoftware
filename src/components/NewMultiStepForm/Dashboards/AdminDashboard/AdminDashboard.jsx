import React, { useState, useEffect } from "react";
import MenuBar from "../../MenuBar";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import EmployeeRegistration from "./EmployeeRegistration";
import EmployeeList from "./EmployeeList";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const nav = useNavigate();
  const authRole = localStorage.getItem("userRole");

  const [showForm, setShowForm] = useState(false);
  const [employees, setEmployees] = useState([]);

  const [editingEmployee, setEditingEmployee] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    localStorage.setItem("employees", JSON.stringify(employees));
  }, [employees]);

  if (!authRole || authRole !== "admin") {
    navigate("/login");
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Save Edited Employee Data
  const handleSave = () => {
    if (editingEmployee) {
      setEmployees(
        employees.map((emp) =>
          emp.id === editingEmployee ? { ...formData } : emp
        )
      );
      setShowEditModal(false);
      setEditingEmployee(null);
    }
  };

  const logoutUser = () => {
    // Remove user login data from localStorage
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");

    // Optional: Update any state related to authentication (if necessary)
    // For example: setAuthStatus(false);

    // Navigate to the login page immediately
    nav("/login");

    // You can also force a page reload to ensure everything is reset
    window.location.reload();
  };

  return (
    <div className="app-container">
      <MenuBar userRole="admin" />
      <div className="flex flex-col w-full p-4 gap-8">
        <div className="app-content-header">
          <h1 className="app-content-headerText">Admin Dashboard </h1>
          <button className="mode-switch me-5" title="Switch Theme">
            <svg
              className="moon"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <defs></defs>
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"></path>
            </svg>
          </button>
          <button type="button" className="btn btn-danger" onClick={logoutUser}>
            Logout
          </button>
        </div>
        <div className="flex items-center ">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded h-[10vh]"
            onClick={() => setShowForm(true)}
          >
            Add Employee
          </button>
        </div>
        {showForm && <EmployeeRegistration setShowForm={setShowForm} />}
        <div className="row mt-1">
          <div className="col-12">
            <h4 className="text-center">Employee List</h4>
            <hr />
          </div>
        </div>
        <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-100">
          <EmployeeList />
        </div>

        {/* Edit Employee Modal */}
        {showEditModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h2 className="text-lg font-bold mb-4">Edit Employee</h2>
              <form onSubmit={handleSave}>
                <input
                  type="text"
                  name="id"
                  placeholder="Employee ID"
                  value={formData.id}
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
                <input
                  type="text"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full p-2 mb-4 border rounded"
                  required
                />
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
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
