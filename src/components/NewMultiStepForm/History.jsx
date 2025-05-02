import React, { useEffect, useState } from "react";
import MenuBar from "./MenuBar";
import Header from "./Header";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const History = ({ userRole }) => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);


  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await axios.get("/api/activity/unread-count");
        setUnreadCount(res.data.count);
      } catch (err) {
        console.error("❌ Failed to fetch unread count", err);
      }
    };
  
    fetchUnreadCount();
  }, []);

  const renderMenuBar = () => {
    if (!userRole) {
      navigate("/login");
      return null;
    }

    switch (userRole) {
      case "admin":
        return <MenuBar userRole="admin" />;
      case "employee":
        return <MenuBar userRole="employee" />;
      case "client":
        return <MenuBar userRole="client" />;
      default:
        navigate("/login");
        return null;
    }
  };

  useEffect(() => {
    const fetchActivityLog = async () => {
      try {
        const res = await axios.get("https://backend-three-pink.vercel.app/api/activity/history");
        setActivities(res.data);
      } catch (error) {
        console.error("Failed to fetch history:", error);
      }
    };

    if (userRole === "admin") {
      fetchActivityLog();
    }
  }, [userRole]);

  const formatActivityMessage = ({
    action,
    performedBy,
    reportTitle,
    reportOwner,
    timestamp,
  }) => {
    const name = performedBy?.name || "Unknown";
    const role = performedBy?.role === "admin" ? "Admin" : "User"; // ✅ Correct role logic

    const formattedAction =
      {
        create: "created",
        update: "updated",
        download: "downloaded",
        check_profit: "checked profit for",
      }[action] || "performed an action on";

    const formattedDate = new Date(timestamp).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    const cleanTitle = reportTitle?.trim() || "Untitled";
    const cleanOwner = reportOwner?.trim();
    const fullTitle = cleanOwner ? `${cleanTitle} (${cleanOwner})` : cleanTitle;

    return `${name} (${role}) ${formattedAction} the report "${fullTitle}"`;
  };

  return (
    <div className="flex h-[100vh]">
      {renderMenuBar()}
      <div className="app-content w-full p-6">
        <Header dashboardType="Admin Dashboard" />
        <div className="flex items-center gap-10 mb-6 px-3 pt-3">
          <h2 className="text-lg text-gray-700">
            User Activity History
          </h2>
          <div className="relative w-full max-w-sm">
            <input
              type="text"
              placeholder="Search by name, report title, or owner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <svg
              className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z"
              />
            </svg>
          </div>
        </div>

        <div className="space-y-4 overflow-y-auto max-h-[75vh] pr-2">
          {activities
            .filter((act) => {
              const q = searchQuery.toLowerCase();
              return (
                act?.performedBy?.name?.toLowerCase().includes(q) ||
                act?.reportTitle?.toLowerCase().includes(q) ||
                act?.reportOwner?.toLowerCase().includes(q)
              );
            })
            .map((act) => (
              <div
                key={act._id}
                className="flex items-start gap-3 p-4 border-l-4 border-indigo-500 bg-gray-50 rounded-md shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <p className="text-sm text-gray-700 font-medium">
                    {formatActivityMessage(act)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(act.timestamp).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default History;
