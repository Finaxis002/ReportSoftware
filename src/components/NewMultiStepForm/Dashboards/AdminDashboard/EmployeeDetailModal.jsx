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
          `http://localhost:5000/api/tasks?employeeId=${employee.employeeId}`
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
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow-xl max-w-5xl w-full border dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 px-6 py-4 border-b dark:border-gray-700 sticky top-0">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            User Profile
          </h2>
          <button
            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors text-3xl"
            onClick={onClose}
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="p-8 mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left - Employee Details */}
          <div>
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6 border-b border-gray-300 dark:border-gray-700 pb-2">
              Details
            </h3>
            <div className="p-6 grid grid-cols-2 gap-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
              {[
                { label: "User ID", value: employee.employeeId },
                { label: "Name", value: employee.name },
                { label: "Email", value: employee.email },
                { label: "Designation", value: employee.designation },
              ].map((item, idx) => (
                <div key={idx} className="p-2 rounded-md">
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white">
                    {item.value}
                  </p>
                </div>
              ))}
              <div className="col-span-2 p-2">
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Password
                </p>
                <p className="mt-1 text-lg font-medium text-gray-800 dark:text-white">
                  {employee.password}
                </p>
              </div>
            </div>
          </div>

          {/* Right - Assigned Tasks */}
          <div className="overflow-y-scroll max-h-96">
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6 border-b border-gray-300 dark:border-gray-700 pb-2">
              Assigned Tasks
            </h3>
            {loadingTasks ? (
              <p className="text-gray-600 dark:text-gray-300">
                Loading tasks...
              </p>
            ) : errorTasks ? (
              <p className="text-red-500">{errorTasks}</p>
            ) : tasks.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">
                No tasks assigned yet.
              </p>
            ) : (
              <div className="space-y-4">
                {tasks.map((task, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-600 shadow-sm"
                  >
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {task.taskTitle}
                    </p>
                    <p className="mt-1 text-gray-700 dark:text-gray-300">
                      {task.taskDescription}
                    </p>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <strong>Due:</strong>{" "}
                      {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Status:</strong> {task.status}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Permissions Section */}
        <div className="p-6 mx-10 mb-6 rounded-b-lg bg-gray-100 dark:bg-gray-800 border-t dark:border-gray-700 shadow-inner">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Access Permissions
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              
              { key: "updateReport", label: "Update Report" },
              {
                key: "createNewWithExisting",
                label: "Create New with Existing",
              },
              { key: "downloadPDF", label: "Download PDF" },
              { key: "generateGraph", label: "Generate Graph" },
              { key: "advanceReport", label: "Advance Report" },
              { key: "generateWord", label: "Generate Word" },
              { key: "exportData", label: "Export Data" },
              { key: "cmaData", label: "CMA Data" },
              { key: "consultantReport", label: "Consultant Report" }
            ].map((perm) => (
              <div key={perm.key} className="flex items-center gap-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={employee.permissions?.[perm.key]}
                    readOnly
                    className="hidden"
                  />
                  <div
                    className={`w-8 h-4 flex items-center rounded-full p-1 transition duration-300 ${
                      employee.permissions?.[perm.key]
                        ? "bg-green-500"
                        : "bg-gray-400"
                    }`}
                  >
                    <div
                      className={`w-3 h-3 bg-white rounded-full shadow-md transform transition ${
                        employee.permissions?.[perm.key]
                          ? "translate-x-3"
                          : "translate-x-0"
                      }`}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-800 dark:text-white font-medium">
                    {perm.label}
                  </span>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetailModal;
