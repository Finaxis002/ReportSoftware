
import React, { useState, useEffect } from "react";

const EmployeeTasks = ({ employeeId }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      setError("");
  
      // Retrieve employeeId from localStorage
      const employeeId = localStorage.getItem("employeeId");
  
      if (!employeeId) {
        console.log("⚠️ No employeeId found in localStorage, skipping task fetch.");
        setError("No employee ID found.");
        setLoading(false);
        return;
      }
  
      try {
        console.log(`🚀 Fetching tasks for employeeId: ${employeeId}`);  // Log employeeId
  
        const response = await fetch(
          `https://backend-three-pink.vercel.app/api/tasks?employeeId=${employeeId}`
        );
  
        console.log("🛡️ Response status:", response.status);  // Log the response status
  
        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }
  
        const data = await response.json();
        console.log("✅ Fetched Tasks Data:", data);  // Log the fetched tasks data
  
        setTasks(data);
      } catch (err) {
        console.error("🔥 Error fetching tasks:", err.message);  // Log errors
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchTasks();
  }, []);  // Empty dependency array to run only once on mount
  

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const response = await fetch(`https://backend-three-pink.vercel.app/api/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to update task status");
      }
  
      const updatedTask = await response.json();
  
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.taskId === taskId || task._id === taskId
            ? { ...task, status: updatedTask.task.status }
            : task
        )
      );
    } catch (err) {
      console.error("Error updating status:", err);
      setError("Failed to update task status");
    }
  };
  

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
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          {tasks.map((task) => (
            <div
              key={task.taskId || task._id}
              className="bg-white p-4 rounded-md shadow border border-gray-200 transition hover:shadow-md"
            >
              <h4 className="text-xl font-medium text-gray-800 capitalize">{task.taskTitle}</h4>
              <p className="mt-2 text-gray-700">{task.taskDescription}</p>
              <p className="mt-3 text-gray-600 text-sm">
                <span className="font-semibold">Due Date:</span>{" "}
                {new Date(task.dueDate).toLocaleDateString()}
              </p>
              <div className="mt-3">
                <label className="font-semibold text-gray-600 text-sm mr-2">Status:</label>
                <select
                  className="border border-gray-300 p-1 rounded-md"
                  value={task.status || "Ongoing"}
                  onChange={(e) => handleStatusChange(task.taskId || task._id, e.target.value)}
                >
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeTasks;

