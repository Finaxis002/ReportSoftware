import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import EmployeeEditModal from "./EmployeeEditModal"; // Adjust the import path as needed
import AssignTaskModal from "./AssignTaskModal";

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  // Fetch employee data when the component mounts
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch("https://reportsbe.sharda.co.in/api/employees");
        if (!response.ok) {
          throw new Error("Failed to fetch employee data");
        }
        const data = await response.json();
        setEmployees(data);
      } catch (err) {
        console.error("Error fetching employees:", err);
      }
    };

    fetchEmployees();
  }, []);

  // Handler for editing an employee
  const handleEdit = (employeeId) => {
    const employeeToEdit = employees.find(
      (emp) => emp.employeeId === employeeId
    );
    if (employeeToEdit) {
      setSelectedEmployee(employeeToEdit);
      setShowEditModal(true);
    }
  };

  // Handler for deleting an employee
  const handleDelete = async (employeeId) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        const response = await fetch(
          `https://reportsbe.sharda.co.in/api/employees/${employeeId}`,
          {
            method: "DELETE",
          }
        );
        if (response.ok) {
          setEmployees((prevEmployees) =>
            prevEmployees.filter((emp) => emp.employeeId !== employeeId)
          );
        } else {
          console.error("Failed to delete employee");
        }
      } catch (error) {
        console.error("Error deleting employee:", error);
      }
    }
  };

  // Update an employee in the state after editing
  const handleUpdateEmployee = (updatedEmployee) => {
    setEmployees((prevEmployees) =>
      prevEmployees.map((emp) =>
        emp.employeeId === updatedEmployee.employeeId ? updatedEmployee : emp
      )
    );
  };

  const handleAssign = (employeeId) => {
    setSelectedEmployeeId(employeeId);
    setShowAssignModal(true);
  };

  const closeAssignModal = () => {
    setShowAssignModal(false);
    setSelectedEmployeeId(null);
  };

  return (
    <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-100">
    <table className="min-w-full bg-white border border-gray-300 rounded-lg">
      <thead className="bg-gray-100 sticky top-0">
        <tr>
          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800 border-b">
            User ID
          </th>
          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800 border-b">
            User Name
          </th>
          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800 border-b">
            Email
          </th>
          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800 border-b">
            Designation
          </th>
          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800 border-b">
            Password
          </th>
          <th className="px-6 py-3 text-center text-sm font-semibold text-gray-800 border-b">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="divide-y">
        {employees.map((employee, index) => (
          <tr
            key={index}
            className="hover:bg-gray-50 transition duration-200"
          >
            <td className="px-6 py-4 text-gray-800">{employee.employeeId}</td>
            <td className="px-6 py-4 text-gray-800">{employee.name}</td>
            <td className="px-6 py-4 text-gray-800">{employee.email}</td>
            <td className="px-6 py-4 text-gray-800">
              {employee.designation}
            </td>
            <td className="px-6 py-4 text-gray-800">{employee.password}</td>
            <td className="px-6 py-4 flex justify-center gap-4">
             
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow-md transition duration-300 flex items-center gap-2"
                onClick={() => handleEdit(employee.employeeId)}
              >
                <FontAwesomeIcon icon={faEdit} />
                Edit
              </button>
              <button
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow-md transition duration-300 flex items-center gap-2"
                onClick={() => handleDelete(employee.employeeId)}
              >
                <FontAwesomeIcon icon={faTrash} />
                Delete
              </button>
            </td>
          </tr>
        ))}
        {employees.length === 0 && (
          <tr>
            <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
              No employees found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  
    {/* Move modal components outside of the table */}
    {showAssignModal && selectedEmployeeId && (
      <AssignTaskModal
        employeeId={selectedEmployeeId}
        onClose={closeAssignModal}
        onTaskAssigned={(task) => {
          console.log("Task assigned:", task);
          // Optionally refresh task list or update state here
        }}
      />
    )}
    {showEditModal && selectedEmployee && (
      <EmployeeEditModal
        employee={selectedEmployee}
        setShowEditModal={setShowEditModal}
        onUpdate={handleUpdateEmployee}
      />
    )}
  </div>
  
  );
};

export default EmployeeList;
