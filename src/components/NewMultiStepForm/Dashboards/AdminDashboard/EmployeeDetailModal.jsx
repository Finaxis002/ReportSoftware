import React, { useState, useEffect } from "react";

const EmployeeDetailModal = ({ employee, onClose }) => {
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [errorTasks, setErrorTasks] = useState("");

  useEffect(() => {
    const fetchTasks = async () => {
      setLoadingTasks(true);
      setErrorTasks("");
      try {
        // Ensure your backend accepts query parameters:
        // GET /api/tasks?employeeId=XYZ
        const response = await fetch(
          `https://backend-three-pink.vercel.app/api/tasks?employeeId=${employee.employeeId}`
        );
        if (!response.ok) {
          throw new Error("No Task Assigned Yet");
        }
        const data = await response.json();
        setTasks(data); // expecting an array of task objects
      } catch (err) {
        setErrorTasks(err.message);
      } finally {
        setLoadingTasks(false);
      }
    };

    fetchTasks();
  }, [employee.employeeId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm px-4 overflow-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-2 bg-gradient-to-r from-gray-100 to-gray-50 sticky top-0 px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            Employee Profile
          </h2>
          <button
            className="text-gray-600 hover:text-gray-800 transition-colors text-3xl"
            onClick={onClose}
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column - Employee Details */}
          <div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-2">
              Details
            </h3>
            <div className="p-8 grid grid-cols-2 gap-6">
              <div className=" p-2 rounded-md shadow-sm">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Employee ID
                </p>
                <p className="mt-1 text-sm font-medium text-gray-800">
                  {employee.employeeId}
                </p>
              </div>

              <div className=" p-2 rounded-md shadow-sm">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Name
                </p>
                <p className="mt-1 text-sm font-medium text-gray-800">
                  {employee.name}
                </p>
              </div>

              <div className=" p-2 rounded-md shadow-sm">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Email
                </p>
                <p className="mt-1 text-sm font-medium text-gray-800">
                  {employee.email}
                </p>
              </div>

              <div className=" p-2 rounded-md shadow-sm">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Designation
                </p>
                <p className="mt-1 text-sm font-medium text-gray-800">
                  {employee.designation}
                </p>
              </div>

              <div className=" p-2 rounded-md shadow-sm col-span-2">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Password
                </p>
                <p className="mt-1 text-lg font-medium text-gray-800">
                  {employee.password}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Assigned Tasks */}
          <div className="overflow-y-scroll max-h-96">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-2">
              Assigned Tasks
            </h3>
            {loadingTasks ? (
              <p className="text-gray-600">Loading tasks...</p>
            ) : errorTasks ? (
              <p className="text-red-500">{errorTasks}</p>
            ) : tasks.length === 0 ? (
              <p className="text-gray-600">No tasks assigned yet.</p>
            ) : (
              <div className="space-y-6">
                {tasks.map((task, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg bg-gray-50 shadow-sm transition hover:shadow-md"
                  >
                    <p className="text-lg font-semibold text-gray-800">
                      {task.taskTitle}
                    </p>
                    <p className="mt-2 text-gray-700">{task.taskDescription}</p>
                    <p className="mt-3 text-gray-600 text-sm">
                      <span className="font-medium">Due Date:</span>{" "}
                      {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                    <p className="mt-2 text-gray-700">
                    <span className="font-medium">Status:</span>{" "}
                    {task.status}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t bg-gray-50 flex justify-end">
          <button
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition duration-300"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetailModal;
