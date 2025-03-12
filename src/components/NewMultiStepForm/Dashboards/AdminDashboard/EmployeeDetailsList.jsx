import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faTasks,
  faIdCard,
  faEnvelope,
  faLock,
  faUser
} from "@fortawesome/free-solid-svg-icons";
import EmployeeEditModal from "./EmployeeEditModal";
import AssignTaskModal from "./AssignTaskModal";
import EmployeeDetailModal from "./EmployeeDetailModal";
import EmployeeRegistration from "./EmployeeRegistration";

const EmployeeDetailsList = () => {
  const [employees, setEmployees] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [showCombinedModal, setShowCombinedModal] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch(
          "https://backend-three-pink.vercel.app/api/employees"
        );
        if (!response.ok) throw new Error("Failed to fetch employee data");
  
        const data = await response.json();
  
        console.log("Fetched Employees Data:", data);
  
        if (data.success) {
          setEmployees(data.data || []); // ✅ Use data.data instead of data directly
        } else {
          console.error("Failed to fetch employee data:", data.message);
        }
      } catch (err) {
        console.error("🔥 Error fetching employees:", err);
      }
    };
  
    fetchEmployees();
  }, []);
  

  // ✅ Handle Edit
  const handleEdit = (employeeId) => {
    const employeeToEdit = employees.find(
      (emp) => emp.employeeId === employeeId
    );
    if (employeeToEdit) {
      setSelectedEmployee(employeeToEdit);
      setShowEditModal(true);
    }
  };

  // ✅ Handle Delete
  const handleDelete = async (employeeId) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        const response = await fetch(
          `https://backend-three-pink.vercel.app/api/employees/${employeeId}`,
          { method: "DELETE" }
        );
        if (response.ok) {
          setEmployees((prev) =>
            prev.filter((emp) => emp.employeeId !== employeeId)
          );
        } else {
          console.error("Failed to delete employee");
        }
      } catch (error) {
        console.error("Error deleting employee:", error);
      }
    }
  };

  // ✅ Handle Update After Edit
  const handleUpdateEmployee = (updatedEmployee) => {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.employeeId === updatedEmployee.employeeId ? updatedEmployee : emp
      )
    );
  };

  // ✅ Handle View and Assign
  const handleViewAndAssign = (employeeId) => {
    const employeeToView = employees.find(
      (emp) => emp.employeeId === employeeId
    );
    if (employeeToView) {
      setSelectedEmployee(employeeToView);
      setShowCombinedModal(true);
    }
  };

  // ✅ Handle Assign Task
  const handleAssign = (employeeId) => {
    setSelectedEmployeeId(employeeId);
    setShowAssignModal(true);
  };

  const closeAssignModal = () => {
    setShowAssignModal(false);
    setSelectedEmployeeId(null);
  };

  return (
    <div className="container mx-auto p-6">
      {/* ✅ Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-semibold text-black">Employee List</h2>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg shadow-md transition duration-300"
          onClick={() => setShowForm(true)}
        >
          + Add Employee
        </button>
      </div>

      {/* ✅ Employee Registration */}
      {showForm && <EmployeeRegistration setShowForm={setShowForm} />}

      {/* ✅ Card-based Layout */}
      <div
        className="overflow-y-auto"
        style={{
          maxHeight: "calc(100vh - 150px)", // ✅ Adjust height dynamically based on viewport height
          paddingBottom: "100px", // ✅ Optional padding for better look
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 ">
          {employees.map((employee) => (
            <div
              key={employee.employeeId}
              className="bg-white border border-gray-200 shadow-lg rounded-lg overflow-hidden transition transform hover:scale-100"
            >
              {/* ✅ Header */}
              <div className="flex items-center gap-4 px-6 py-3 border-b bg-gradient-to-r from-blue-100 to-blue-200 shadow-sm">
                {/* ✅ Avatar/Icon */}
                <div className="w-10 h-10 bg-blue-500 text-white flex items-center justify-center rounded-full">
                  <FontAwesomeIcon icon={faUser} className="text-xl" />
                </div>

                {/* ✅ Name & Designation */}
                <div>
                  <h3 className="text-xl font-bold text-gray-800 leading-snug">
                    {employee.name}
                  </h3>
                  <p className="text-sm text-gray-500 font-medium">
                    {employee.designation}
                  </p>
                </div>
              </div>

              {/* ✅ Details */}
              <div className="p-6 bg-gray-50 rounded-lg shadow-md border border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  {/* Employee ID */}
                  <div className="flex items-center gap-3">
                    <span className="inline-block bg-blue-100 text-blue-500 p-2 rounded-md">
                      <FontAwesomeIcon icon={faIdCard} />
                    </span>
                    <div>
                      <p className="text-sm text-gray-500 uppercase font-medium tracking-wide">
                        Employee ID
                      </p>
                      <p className="text-sm font-normal text-gray-800">
                        {employee.employeeId}
                      </p>
                    </div>
                  </div>

                  {/* Email */}
                  {/* <div className="flex items-center gap-3">
                    <span className="inline-block bg-green-100 text-green-500 p-2 rounded-md">
                      <FontAwesomeIcon icon={faEnvelope} />
                    </span>
                    <div>
                      <p className="text-sm text-gray-500 uppercase font-medium tracking-wide">
                        Email
                      </p>
                      <p className="text-sm font-normal text-gray-800">
                        {employee.email}
                      </p>
                    </div>
                  </div> */}

                  {/* Password */}
                  <div className="flex items-center gap-3">
                    <span className="inline-block bg-yellow-100 text-yellow-500 p-2 rounded-md">
                      <FontAwesomeIcon icon={faLock} />
                    </span>
                    <div>
                      <p className="text-sm text-gray-500 uppercase font-medium tracking-wide">
                        Password
                      </p>
                      <p className="text-sm font-normal text-gray-800">
                        {employee.password}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ✅ Actions */}
              <div className="flex flex-wrap justify-start gap-3 px-6 py-4 bg-gray-50 border-t">
                {/* ✅ Assign Task */}
                <button
                  className="flex items-center gap-2 bg-white text-green-500 hover:text-green-600 px-4 py-2 rounded-md shadow-md transition duration-300"
                  onClick={() => handleAssign(employee.employeeId)}
                >
                  <FontAwesomeIcon icon={faTasks} />
                  <span>Assign Task</span>
                </button>

                {/* ✅ View Details */}
                <button
                  className="flex items-center gap-2 bg-white text-blue-500 hover:bg-blue-100 hover:text-blue-600 px-4 py-2 rounded-md shadow-md transition duration-300"
                  onClick={() => handleViewAndAssign(employee.employeeId)}
                >
                  <FontAwesomeIcon icon={faEdit} />
                  <span>View Details</span>
                </button>

                {/* ✅ Edit */}
                <button
                  className="flex items-center gap-2 bg-white  text-yellow-500 hover:bg-yellow-100 hover:text-yellow-600 px-4 py-2 rounded-md shadow-md transition duration-300"
                  onClick={() => handleEdit(employee.employeeId)}
                >
                  <FontAwesomeIcon icon={faEdit} />
                  <span>Edit</span>
                </button>

                {/* ✅ Delete */}
                <button
                  className="flex items-center gap-2 bg-white  text-red-500 hover:bg-red-100 hover:text-red-600 px-4 py-2 rounded-md shadow-md transition duration-300"
                  onClick={() => handleDelete(employee.employeeId)}
                >
                  <FontAwesomeIcon icon={faTrash} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ✅ No Data */}
      {employees.length === 0 && (
        <p className="text-gray-500 text-center mt-10">No employees found.</p>
      )}

      {/* ✅ Modals */}
      {showAssignModal && selectedEmployeeId && (
        <AssignTaskModal
          employeeId={selectedEmployeeId}
          onClose={closeAssignModal}
        />
      )}
      {showEditModal && selectedEmployee && (
        <EmployeeEditModal
          employee={selectedEmployee}
          setShowEditModal={setShowEditModal}
          onUpdate={handleUpdateEmployee}
        />
      )}
      {showCombinedModal && selectedEmployee && (
        <EmployeeDetailModal
          employee={selectedEmployee}
          onClose={() => setShowCombinedModal(false)}
        />
      )}
    </div>
  );
};

export default EmployeeDetailsList;
