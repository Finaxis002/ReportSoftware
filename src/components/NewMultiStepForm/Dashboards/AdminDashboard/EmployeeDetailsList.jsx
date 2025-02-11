import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import EmployeeEditModal from "./EmployeeEditModal"; // Adjust the import path as needed
import AssignTaskModal from "./AssignTaskModal";
import EmployeeDetailModal from "./EmployeeDetailModal";

const EmployeeDetailsList = () => {
  const [employees, setEmployees] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [showCombinedModal, setShowCombinedModal] = useState(false);

  // Fetch employee data when the component mounts
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch("https://report-software-xhlu.vercel.app/api/employees");
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

  

  // Handler for viewing details & assigning task (combined modal)
  const handleViewAndAssign = (employeeId) => {
    const employeeToView = employees.find(
      (emp) => emp.employeeId === employeeId
    );
    if (employeeToView) {
      setSelectedEmployee(employeeToView);
      setShowCombinedModal(true);
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

  // Handler for opening the assign task modal (if used separately)
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
              Employee ID
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800 border-b">
              Employee Name
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
            <tr key={index} className="hover:bg-gray-50 transition duration-200">
              <td className="px-6 py-4 text-gray-800">{employee.employeeId}</td>
              <td className="px-6 py-4 text-gray-800">{employee.name}</td>
              <td className="px-6 py-4 text-gray-800">{employee.email}</td>
              <td className="px-6 py-4 text-gray-800">{employee.designation}</td>
              <td className="px-6 py-4 text-gray-800">{employee.password}</td>
              <td className="px-6 py-4 flex justify-center gap-4">
                <button
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow-md transition duration-300 flex items-center gap-2"
                  onClick={() => handleAssign(employee.employeeId)}
                >
                  <FontAwesomeIcon icon={faEdit} />
                  Assign Task
                </button>
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow-md transition duration-300 flex items-center gap-2"
                  onClick={() => handleViewAndAssign(employee.employeeId)}
                >
                  <FontAwesomeIcon icon={faEdit} />
                  View Details
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

      {/* Render modal components outside the table */}
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
