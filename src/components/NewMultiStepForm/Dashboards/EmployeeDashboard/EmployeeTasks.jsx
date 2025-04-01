
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
      const employeeId = localStorage.getItem("employeeId");
      const employeeName = localStorage.getItem("employeeName");
  
      const response = await fetch(`https://backend-three-pink.vercel.app/api/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          employeeId, 
          employeeName, 
        }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to update task status");
      }
  
      const updatedTask = await response.json();
  
      // ✅ Update task state locally
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === taskId ? updatedTask.task : task
        )
      );
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };
  

  

  return (
    <div className="mt-8 w-[80%] mx-auto max-h-[500px] overflow-auto">
      <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Assigned Reports</h3>
      {loading ? (
        <p className="text-center text-gray-600 dark:text-white">Loading tasks...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : tasks.length === 0 ? (
        <p className="text-center text-gray-600 dark:text-white">No tasks assigned.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          {tasks.map((task) => (
            <div
              key={task.taskId || task._id}
              className=" p-4 rounded-md shadow border border-gray-200 transition hover:shadow-md"
            >
              <h4 className="text-xl font-medium text-gray-800 dark:text-white capitalize">{task.taskTitle}</h4>
              <p className="mt-2 text-gray-700 dark:text-white ">{task.taskDescription}</p>
              <p className="mt-3 text-gray-600 dark:text-white text-sm">
                <span className="font-semibold">Due Date:</span>{" "}
                {new Date(task.dueDate).toLocaleDateString()}
              </p>
              <div className="mt-3">
                <label className="font-semibold text-gray-600 dark:text-white text-sm mr-2">Status:</label>
                <select
                  className="border border-gray-300 p-1 rounded-md"
                  value={task.status}
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

