import React, { useState } from "react";

const AssignTaskModal = ({ employeeId, onClose, onTaskAssigned }) => {
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState("")
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const response = await fetch("https://reportsbe.sharda.co.in/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employeeId, // Associate the task with this employee
          taskTitle,
          taskDescription,
          dueDate,
          status,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Task assigned successfully!");
        // Optionally, clear the form
        setTaskTitle("");
        setTaskDescription("");
        setDueDate("");
        setStatus("");
        // Let the parent component know a task was assigned (if needed)
        if (onTaskAssigned) onTaskAssigned(data.task);
        // Close the modal after a short delay
        setTimeout(() => onClose(), 1000);
      } else {
        setError(data.error || "Failed to assign task.");
      }
    } catch (err) {
      console.error("Error assigning task:", err);
      setError("Server error. Please try again later.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Assign Report</h2>
        {error && <p className="mb-2 text-red-500">{error}</p>}
        {message && <p className="mb-2 text-green-500">{message}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Report Title
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Report Description
            </label>
            <textarea
              className="w-full p-2 border rounded"
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              required
            ></textarea>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Due Date
            </label>
            <input
              type="date"
              className="w-full p-2 border rounded"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              className="mr-2 bg-gray-500 text-white px-4 py-2 rounded"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Assign
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignTaskModal;
