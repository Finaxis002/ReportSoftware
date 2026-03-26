import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const LimitedEmployeeTaskView = ({ employeeId }) => {
  const BASE_URL = process.env.REACT_APP_BASE_URL || 'https://reportsbe.sharda.co.in';
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/api/tasks?employeeId=${employeeId}`
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
    <div className="w-[75%] app-content p-4 bg-gray-50 dark:bg-gray-900 rounded-xl shadow-md">
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
        // ✅ IMPROVED "NO TASKS" MESSAGE
        <div className="p-6 text-center border border-gray-300 dark:border-gray-700 rounded-xl bg-gradient-to-br from-gray-100 to-white dark:from-gray-800 dark:to-gray-900">
          <div className="mb-3">
            <svg 
              className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">
            No Reports Assigned
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            You don't have any reports assigned to you yet.
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            Check back later or contact your manager.
          </p>
        </div>
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