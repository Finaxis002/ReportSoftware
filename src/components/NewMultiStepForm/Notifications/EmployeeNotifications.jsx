import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const EmployeeNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [readNotifications, setReadNotifications] = useState({});
  const navigate = useNavigate();

  const employeeId = localStorage.getItem("userId");

  const fetchNotifications = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `https://backend-three-pink.vercel.app/api/employees/register/api/notifications?employeeId=${employeeId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }
      const data = await response.json();
      console.log("Fetched Notifications:", data);

      const initialReadState = data.reduce((acc, notification) => {
        acc[notification._id] = notification.isRead || false;
        return acc;
      }, {});

      setReadNotifications(initialReadState);
      setNotifications(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications();
    }, 10000);
    return () => clearInterval(interval);
  }, [employeeId]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString(); // Formats to "MM/DD/YYYY, HH:MM:SS AM/PM"
  };

  const handleViewTask = (notification) => {
    console.log("Task Clicked:", notification);
    if (notification.taskId) {
      setSelectedTask(notification);
      setReadNotifications((prev) => ({
        ...prev,
        [notification._id]: true, // Mark as read immediately
      }));

      fetch(`https://backend-three-pink.vercel.app/api/mark-notification-read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: notification._id }),
      });
    } else {
      alert("No task associated with this notification.");
    }
  };

  const handleGoToTask = () => {
    if (selectedTask) {
      setReadNotifications((prev) => ({
        ...prev,
        [selectedTask._id]: true, // Hide green dot
      }));

      setSelectedTask(null);
      navigate(`/tasks/${selectedTask.taskId}`);
    }
  };

  return (
    <div>
      {loading ? (
        <p className="text-gray-600">Loading notifications...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : notifications.length === 0 ? (
        <p className="text-gray-600">No notifications at this time.</p>
      ) : (
        <ul className="space-y-4">
          {notifications.map((notification) => (
            <li
              key={notification._id || notification.id}
              className="bg-white p-4 rounded-md shadow border border-gray-200 transition hover:shadow-lg flex items-center justify-between w-[50rem]"
            >
              <div className="flex flex-col">
                <p className="text-gray-800">
                  {notification.message.split(":")[0]}:
                  <span className="text-teal-500 font-bold capitalize">
                    {" "}
                    {notification.message.split(":")[1]}
                  </span>
                </p>

                <p className="text-sm text-gray-500">
                  {formatDate(notification.createdAt)}
                </p>
              </div>

              {/* View Task Button */}
              {notification.taskId && (
                <button
                  onClick={() => handleViewTask(notification)}
                  className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
                >
                  View Task
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Pop-up Modal */}
      {selectedTask && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-bold mb-4">Task Assigned</h3>
            <p>{selectedTask.message}</p>
            <p className="text-sm text-gray-500 mt-2">
              Assigned on: {formatDate(selectedTask.createdAt)}
            </p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleGoToTask}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition mr-2"
              >
                Go to Task
              </button>
              <button
                onClick={() => setSelectedTask(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
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

export default EmployeeNotifications;
