import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const LimitedEmployeeTaskView = ({ employeeId }) => {
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch(
          `https://reportsbe.sharda.co.in/api/tasks?employeeId=${employeeId}`
        );
        let data = await res.json();
  
        // ✅ Sort by most recent dueDate (latest task first)
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
        setTasks(data || []);
      } catch (error) {
        console.error("Error fetching tasks:", error.message);
      }
    };
  
    if (employeeId) {
      fetchTasks();
    }
  }, [employeeId]);
  

  const handleViewMore = () => {
    if (tasks.length > 0) {
      navigate(`/tasks/${tasks[0]._id}`);
    }
  };

  return (
    <div className=" w-[75%] app-content p-4 bg-gray-50 dark:bg-gray-900 rounded-xl shadow-md">
    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 border-b pb-2">
      📌 Assigned Reports
    </h3>
  
    {tasks.length > 0 ? (
      <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 shadow-sm">
        <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {tasks[0].taskTitle || tasks[0].title || "Unnamed Task"}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          📅 Due:{" "}
          <span className="font-medium">
            {new Date(tasks[0].dueDate).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        </p>
      </div>
    ) : (
      <p className="text-sm text-gray-500 dark:text-gray-400 italic mt-2">
        No task assigned yet.
      </p>
    )}
  
    {tasks.length > 1 && (
      <div className="mt-4 text-right">
        <button
          onClick={handleViewMore}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          View All
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
            />
          </svg>
        </button>
      </div>
    )}
  </div>
  
  );
};

export default LimitedEmployeeTaskView;
