import React, { useState, useEffect } from "react";

const EmployeeTasks = ({ employeeId }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      setError("");
      try {
        // Adjust the endpoint as needed
        const response = await fetch(
          `http://localhost:5000/api/tasks?employeeId=${employeeId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }
        const data = await response.json();
        setTasks(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (employeeId) {
      fetchTasks();
    }
  }, [employeeId]);

  return (
    <div className="mt-8 w-[80%] mx-auto max-h-[500px] overflow-y-auto">
      <h3 className="text-2xl font-semibold text-gray-800 mb-4">Assigned Tasks</h3>
      {loading ? (
        <p className="text-center text-gray-600">Loading tasks...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : tasks.length === 0 ? (
        <p className="text-center text-gray-600">No tasks assigned.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 ">
          {tasks.map((task) => (
            <div
              key={task.taskId || task._id} // Use your unique identifier
              className="bg-white p-4 rounded-md shadow border border-gray-200 transition hover:shadow-md"
            >
              <h4 className="text-xl font-medium text-gray-800 capitalize">{task.taskTitle}</h4>
              <p className="mt-2 text-gray-700">{task.taskDescription}</p>
              <p className="mt-3 text-gray-600 text-sm">
                <span className="font-semibold">Due Date:</span>{" "}
                {new Date(task.dueDate).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeTasks;
