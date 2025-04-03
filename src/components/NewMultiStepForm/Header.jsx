import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toggleTheme } from "./Utils/themeToggle";


const Header = ({ dashboardType }) => {
  const [darkMode, setDarkMode] = React.useState(() => {
    return localStorage.getItem("theme") === "dark";
  });
  const [showReminderPopup, setShowReminderPopup] = useState(false);
  const [upcomingTasks, setUpcomingTasks] = useState([]);

  const navigate = useNavigate();

  const userRole = localStorage.getItem("userRole")

  const logoutUser = async () => {
    const employeeId = localStorage.getItem("employeeId");
  
    if (employeeId) {
      try {
        await fetch("https://backend-three-pink.vercel.app/api/employees/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ employeeId }),
        });
      } catch (error) {
        console.error("Logout API failed:", error);
      }
    }
  
    localStorage.clear();
    sessionStorage.removeItem("hasSeenDuePopup");
    navigate("/login");
    window.location.reload();
  };
  

  const fetchUpcomingTasks = async () => {
    const employeeId = localStorage.getItem("employeeId");
    if (!employeeId) return;

    try {
      const res = await fetch(
        `https://backend-three-pink.vercel.app/api/tasks?employeeId=${employeeId}`
      );
      const taskData = await res.json();

      const now = new Date();
      const futureTasks = taskData.filter(
        (task) => new Date(task.dueDate) > now
      );

      setUpcomingTasks(futureTasks);
      setShowReminderPopup(true);
    } catch (err) {
      console.error("Failed to fetch reminders:", err.message);
    }
  };

  return (
    <div className="app-content-header flex justify-between items-center p-4 dark:bg-gray-900 dark:text-white shadow-md transition-colors duration-300">
      <h1 className="app-content-headerText text-2xl font-semibold">
        {dashboardType}
      </h1>
      <div className="flex items-center gap-4">
        {/* 🔔 Bell Icon - Only for Employee Dashboard */}
        <div className="flex align-middle justify-center items-center gap-8">
        {userRole === "employee" && (
            <button
              className="text-xl transition hover:scale-110"
              title="Upcoming Task Reminders"
              onClick={fetchUpcomingTasks}
            >
              ⏱️
            </button>
          )}
          <button
            className="mode-switch me-5"
            title="Switch Theme"
            onClick={toggleTheme}
          >
            <svg
              className="moon"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"></path>
            </svg>
          </button>
        </div>

        <button
          type="button"
          className="btn btn-danger bg-red-500 text-white px-4 py-2 rounded"
          onClick={logoutUser}
        >
          Logout
        </button>
      </div>
      {/* 🔔 Reminder Popup */}
      {showReminderPopup && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex justify-center items-center z-50">
          <div className="bg-gray-50 border dark:bg-gray-900 p-6 rounded-xl shadow-xl w-full max-w-md">
            <h2 className="text-lg font-bold text-blue-700 dark:text-blue-300 mb-3">
              📋 Upcoming Task Due Date Reminders
            </h2>
            {upcomingTasks.length > 0 ? (
              <ul className="text-sm text-gray-800 dark:text-white space-y-2 max-h-64 overflow-y-auto">
                {upcomingTasks.map((task) => (
                  <li key={task._id}>
                    📌{" "}
                   
                      {task.taskTitle || task.title || "Unnamed Task"}
                   {" "}
                    —{" "}
                    {new Date(task.dueDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600 dark:text-gray-300">
                No upcoming tasks found.
              </p>
            )}

            <div className="mt-4 text-right">
              <button
                onClick={() => setShowReminderPopup(false)}
                className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
