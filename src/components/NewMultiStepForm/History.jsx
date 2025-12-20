import React, { useEffect, useState } from "react";
import MenuBar from "./MenuBar";
import Header from "./Header";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const History = ({ userRole }) => {
  const BASE_URL = process.env.REACT_APP_BASE_URL || 'https://reportsbe.sharda.co.in';
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
  const [matches, setMatches] = useState([]);
  const [totalActivities, setTotalActivities] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ ADD this right after your useState declarations (around line 20):
const [debouncedSearch, setDebouncedSearch] = useState("");

// ✅ ADD this useEffect for debouncing (after the useState, before other useEffects):
useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(searchQuery);
  }, 300);

  return () => clearTimeout(timer);
}, [searchQuery]);


  // Fetch total count of activities on component mount
  useEffect(() => {
    const fetchTotalCount = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/api/activity/total-count`
        );
        setTotalActivities(res.data.total);
      } catch (err) {
        console.error("❌ Failed to fetch total activities count", err);
      }
    };

    if (userRole === "admin") {
      fetchTotalCount();
    }
  }, [userRole]);

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

// Replace the entire fetchActivityLog useEffect with this:
useEffect(() => {
  const fetchActivityLog = async () => {
    if (!startDate || !endDate) {
      setActivities([]);
      return;
    }

    setIsLoading(true);
    try {
      // Create Date objects for the selected dates
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Set start date to beginning of the day (00:00:00)
      start.setHours(0, 0, 0, 0);
      
      // Set end date to end of the day (23:59:59.999)
      end.setHours(23, 59, 59, 999);

      const params = {
        startDate: start.toISOString(), // Convert to ISO string with time
        endDate: end.toISOString()     // Convert to ISO string with time
      };

      console.log("📅 Dates to API:", params);

      const res = await axios.get(
        `${BASE_URL}/api/activity/history`,
        { params }
      );
      
      console.log("📊 Activities received from API:", res.data.map(a => ({
        action: a.action,
        title: a.reportTitle,
        owner: a.reportOwner,
        timestamp: a.timestamp,
        isConsultantAction: a.action.startsWith("consultant_")
      })));
      
      setActivities(res.data);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (userRole === "admin") {
    fetchActivityLog();
  }
}, [userRole, startDate, endDate]);
  
// ✅ ADD THIS NEW useEffect BLOCK:
useEffect(() => {
    if (!debouncedSearch) {
    setFilteredActivities(activities);
    setMatches([]);
    setCurrentMatchIndex(-1);
    return;
  }

  const normalizedQuery = searchQuery.toLowerCase().trim();
  const queryWords = normalizedQuery.split(/\s+/).filter(word => word.length > 0);

  const filtered = activities.filter((act) => {
    const searchText = `
      ${act?.performedBy?.name || ''}
      ${act?.reportTitle || ''}
      ${act?.reportOwner || ''}
      ${act?.action || ''}
    `.toLowerCase();
    
    return queryWords.every(word => searchText.includes(word));
  });

  setFilteredActivities(filtered);
  const matchingIds = filtered.map(act => act._id);
  setMatches(matchingIds);
  setCurrentMatchIndex(matchingIds.length > 0 ? 0 : -1);
}, [activities, searchQuery]);

  useEffect(() => {
    if (currentMatchIndex >= 0 && matches.length > 0) {
      const element = document.getElementById(
        `activity-${matches[currentMatchIndex]}`
      );
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.classList.add("ring-2", "ring-orange-500");
        setTimeout(() => {
          element.classList.remove("ring-2", "ring-orange-500");
        }, 2000);
      }
    }
  }, [currentMatchIndex, matches]);

// ✅ REPLACE the existing handleKeyDown function with this:
const handleKeyDown = (e) => {
  if (e.key === "Enter" && matches.length > 0) {
    e.preventDefault();
    if (currentMatchIndex >= 0) {
      const nextIndex = (currentMatchIndex + 1) % matches.length;
      setCurrentMatchIndex(nextIndex);
    } else {
      setCurrentMatchIndex(0);
    }
  }
};

 // ✅ REPLACE the entire formatActivityMessage function with this:
const formatActivityMessage = ({
  _id,
  action,
  performedBy,
  reportTitle,
  reportOwner,
  timestamp,
  reportType
}) => {
  const name = performedBy?.name || "Unknown";
  const role = performedBy?.role === "admin" ? "Admin" : "User";

 const formattedAction = {
  create: "created",
  update: "updated",
  download: "downloaded",
  check_profit: "checked profit for",
  generated_pdf: "generated PDF for",
  consultant_create: "created", // ✅ REMOVE "consultant report" from here
  consultant_update: "updated", // ✅ REMOVE "consultant report" from here
  consultant_download: "downloaded", // ✅ REMOVE "consultant report" from here
  consultant_generated_pdf: "generated PDF for", // ✅ REMOVE "consultant report" from here
}[action] || "performed an action on";
  const formattedDate = new Date(timestamp).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const cleanTitle = reportTitle?.trim() || "Untitled";
  const cleanOwner = reportOwner?.trim();
  const fullTitle = cleanOwner ? `${cleanTitle} (${cleanOwner})` : cleanTitle;

  const isConsultant = reportType === "consultant" || action.startsWith("consultant_");
  
  let message;
  if (isConsultant && (action === "consultant_generated_pdf" || action === "generated_pdf")) {
    message = `${name} (${role}) ${formattedAction} the report "${fullTitle}" on ${formattedDate} - consultant report`;
  } else if (isConsultant) {
    message = `${name} (${role}) ${formattedAction} consultant report "${fullTitle}" on ${formattedDate}`;
  } else {
    message = `${name} (${role}) ${formattedAction} the report "${fullTitle}" on ${formattedDate}`;
  }

  // If no search query, return plain message
  if (!searchQuery) return message;

  // Highlight logic
  const highlightText = (text, searchTerm) => {
    if (!searchTerm) return text;
    
    const normalizedSearch = searchTerm.toLowerCase();
    const parts = [];
    let lastIndex = 0;
    let textLower = text.toLowerCase();
    
    let matchIndex = textLower.indexOf(normalizedSearch, lastIndex);
    
    while (matchIndex !== -1) {
      if (matchIndex > lastIndex) {
        parts.push(text.substring(lastIndex, matchIndex));
      }
      
      const isCurrentMatch = matches[currentMatchIndex] === _id && 
                           matchIndex <= searchTerm.length;
      
      parts.push(
        <mark
          key={`${_id}-${matchIndex}`}
          className={`${
            isCurrentMatch 
              ? "bg-orange-300 dark:bg-orange-600 font-semibold" 
              : "bg-yellow-200 dark:bg-yellow-600"
          }`}
        >
          {text.substring(matchIndex, matchIndex + searchTerm.length)}
        </mark>
      );
      
      lastIndex = matchIndex + searchTerm.length;
      matchIndex = textLower.indexOf(normalizedSearch, lastIndex);
    }
    
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    return parts.length > 0 ? parts : text;
  };

  return highlightText(message, searchQuery);
};

  const hasDateFilter = startDate || endDate;


  // Add this helper function near the top of your History component
const formatDateForAPI = (dateString, isEndDate = false) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  if (isEndDate) {
    // For end date, set to end of day
    date.setHours(23, 59, 59, 999);
  } else {
    // For start date, set to beginning of day
    date.setHours(0, 0, 0, 0);
  }
  
  return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
};

// Then update your date change handlers:
const handleStartDateChange = (e) => {
  const date = e.target.value;
  setStartDate(date);
  
  // Optional: If you want to send formatted dates to API
  const formattedStart = formatDateForAPI(date, false);
  const formattedEnd = formatDateForAPI(endDate, true);
  console.log("📅 Dates to API:", { start: formattedStart, end: formattedEnd });
};

const handleEndDateChange = (e) => {
  const date = e.target.value;
  setEndDate(date);
  
  // Optional: If you want to send formatted dates to API
  const formattedStart = formatDateForAPI(startDate, false);
  const formattedEnd = formatDateForAPI(date, true);
  console.log("📅 Dates to API:", { start: formattedStart, end: formattedEnd });
};

  return (
    <div className="flex h-[100vh]">
      {renderMenuBar()}
      <div className="app-content w-full p-6">
        <Header dashboardType="Admin Dashboard" />

        {/* Always show total count and date filter section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/50 shadow-sm p-2 my-2">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Header Section */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-blue-200 dark:border-blue-700">
                  <svg
                    className="w-5 h-5 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold dark:text-white text-gray-800">
                    Activity History
                  </h3>
                  <p className="text-sm dark:text-gray-300 text-gray-600 mt-1">
                    {totalActivities > 0
                      ? `Total of ${totalActivities.toLocaleString()} activities recorded`
                      : "Loading activity count..."}
                  </p>
                </div>
              </div>

              {!hasDateFilter && totalActivities > 0 && (
                <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2 mt-3">
                  <svg
                    className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">
                    Select a date range for faster loading and better
                    performance
                  </p>
                </div>
              )}
            </div>

            {/* Date Filter Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="text-blue-600 dark:text-blue-400">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <label className="text-sm font-medium dark:text-gray-200 text-gray-700 whitespace-nowrap">
                        From
                      </label>
                      <input
                        type="date"
                        value={startDate}
                       onChange={handleStartDateChange}
                        className="px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[140px]"
                      />
                    </div>

                    <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

                    <div className="flex items-center gap-2">
                      <div className="text-blue-600 dark:text-blue-400">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <label className="text-sm font-medium dark:text-gray-200 text-gray-700 whitespace-nowrap">
                        To
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={handleEndDateChange} 
                        className="px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[140px]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {(startDate || endDate) && (
                <button
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                  }}
                  className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-200 flex items-center gap-2 whitespace-nowrap shadow-sm hover:shadow-md"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Clear Filter
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Show activities only when dates are selected */}
        {hasDateFilter ? (
          <>
            {/* Search and Results Section */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 relative max-w-2xl">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search activities by name, report title, or owner..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full pl-11 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition-all duration-200 placeholder-gray-500 dark:placeholder-gray-400"
                  />
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500"
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

              {searchQuery && matches.length > 0 && (
                <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-4 py-2 rounded-lg whitespace-nowrap">
                  <span className="font-medium">{currentMatchIndex + 1}</span>
                  <span className="text-indigo-400 dark:text-indigo-500">
                    of
                  </span>
                  <span className="font-medium">{matches.length}</span>
                  <span className="text-sm ml-1">matches</span>
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  Loading activities...
                </p>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-[60vh] pr-1">
                {filteredActivities.length > 0 ? (
                  filteredActivities.map((act) => (
                    <div
                      key={act._id}
                      id={`activity-${act._id}`}
                      className={`group relative flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-700 transition-all duration-300 ${
                        matches[currentMatchIndex] === act._id
                          ? "ring-2 ring-orange-500 dark:ring-orange-400 border-orange-300 dark:border-orange-600 shadow-lg"
                          : ""
                      }`}
                    >
                      {/* Timeline indicator */}
                      <div className="flex flex-col items-center mt-0.5">
                        <div className="w-3 h-3 bg-indigo-500 dark:bg-indigo-400 rounded-full border-2 border-white dark:border-gray-800 shadow-sm"></div>
                        <div className="w-0.5 h-full bg-gradient-to-b from-indigo-300 to-transparent dark:from-indigo-600 mt-1"></div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm dark:text-gray-100 text-gray-800 leading-relaxed font-medium">
                          {formatActivityMessage(act)}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <svg
                            className="w-3 h-3 text-gray-400 dark:text-gray-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span className="text-xs dark:text-gray-400 text-gray-500 font-medium">
                            {new Date(act.timestamp).toLocaleString("en-IN", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Hover effect indicator */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <svg
                          className="w-4 h-4 text-gray-400 dark:text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  ))
                ) : searchQuery ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full mb-3">
                      <svg
                        className="w-6 h-6 text-gray-400 dark:text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                    <h4 className="text-gray-600 dark:text-gray-300 font-medium mb-1">
                      No matches found
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No activities found for "
                      <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                        {searchQuery}
                      </span>
                      "
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full mb-3">
                      <svg
                        className="w-6 h-6 text-gray-400 dark:text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <h4 className="text-gray-600 dark:text-gray-300 font-medium mb-1">
                      No activities found
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Try adjusting the date range or search terms
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          /* Show message when no dates are selected */
          <div className="text-center py-16 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/30 shadow-sm">
            <div className="flex justify-center mb-6">
              <div className="p-5 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl">
                <svg
                  className="w-12 h-12 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-semibold dark:text-white text-gray-800 mb-3">
              Select Date Range to View Activities
            </h3>
            <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto leading-relaxed">
              Choose a start and/or end date above to display the activity
              history.
            </p>
            <div className="flex justify-center mt-6">
              <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 font-medium">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Select dates to get started</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
