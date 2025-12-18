import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faDownload,
  faPlus,
  faSync,
} from "@fortawesome/free-solid-svg-icons";
import ReportEditModal from "./ReportEditModal";
import MenuBar from "../MenuBar";
import Header from "../Header";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";

const Reports = ({ sendPdfData }) => {
  const BASE_URL = process.env.REACT_APP_BASE_URL || 'https://reportsbe.sharda.co.in';
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Loading state for spinner
  // const [selectedReportData, setSelectedReportData] = useState(null); // ✅ State to store report data
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
const [matches, setMatches] = useState([]);
  const toggleDescription = (index) => {
    setExpandedRow((prev) => (prev === index ? null : index));
  };

  // Fetch reports when the component mounts

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/get-report`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch reports");
        }

        const data = await response.json();

        console.log("Fetched Reports Data:", data);

        if (data.success) {
          setReports(data.data || []);
        } else {
          console.error("Error fetching reports:", data.message);
        }
      } catch (err) {
        console.error("🔥 Error fetching reports:", err);
      } finally {
        setIsLoading(false); // Set loading to false once data is fetched
      }
    };

    fetchReports();
  }, []);

  // ✅ Handle Delete Action
  const handleDelete = async (reportId) => {
    if (window.confirm("Are you sure you want to delete this report?")) {
      try {
        const response = await fetch(
          `${BASE_URL}/get-report/delete-report/${reportId}`,
          {
            method: "DELETE",
          }
        );
        if (response.ok) {
          // ✅ Remove the deleted report from the state
          setReports((prevReports) =>
            prevReports.filter((report) => report._id !== reportId)
          );
        } else {
          console.error("Failed to delete report");
        }
      } catch (error) {
        console.error("Error deleting report:", error);
      }
    }
  };

  // ✅ Handle Download and Store Report Data
  const handleDownload = async (sessionId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/get-report/get-report-data/${sessionId}`
      );
      if (!response.ok) throw new Error("Failed to fetch report data");

      const reportData = await response.json();

      console.log("✅ Report Data Fetched:", reportData);

      // ✅ Send to parent (if needed for other logic)
      sendPdfData(reportData);

      console.log("📤 Sent PDF Data to Parent:", reportData);

      // ✅ Pass data directly in state when navigating
      navigate("/generated-pdf", { state: { reportData } });
    } catch (error) {
      console.error("❌ Error downloading PDF:", error);
      alert(`Error fetching report data: ${error.message}`);
    }
  };

  // ✅ Handle Update Action after Editing

  const authRole = localStorage.getItem("userRole");

  // ✅ ADD THIS FUNCTION (around line 105):
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

  const renderMenuBar = () => {
    const authRole = localStorage.getItem("userRole"); // Get the role from localStorage or state

    // Check if authRole exists, and if it's a valid role
    if (!authRole) {
      navigate("/login"); // If there's no role, redirect to login
      return null; // Optionally render nothing while redirecting
    }

    switch (authRole) {
      case "admin":
        return <MenuBar userRole="admin" />;
      case "employee":
        return <MenuBar userRole="employee" />;
      case "client":
        return <MenuBar userRole="client" />;
      default:
        navigate("/login"); // If role doesn't match, redirect to login
        return null;
    }
  };

  // ✅ NEW IMPROVED SEARCH LOGIC:
  const filteredReports = React.useMemo(() => {
    if (!searchTerm) {
      setMatches([]);
      setCurrentMatchIndex(-1);
      return reports;
    }

    const normalizedQuery = searchTerm.toLowerCase().trim();
    const queryWords = normalizedQuery.split(/\s+/).filter(word => word.length > 0);

    const filtered = reports.filter((report) => {
      const searchText = `
      ${report?.AccountInformation?.businessName || ''}
      ${report?.AccountInformation?.businessDescription || ''}
      ${report?.AccountInformation?.clientName || ''}
      ${report?.AccountInformation?.createdBy || ''}
    `.toLowerCase();

      return queryWords.every(word => searchText.includes(word));
    });

    // Store matching IDs for highlighting
    const matchingIds = filtered.map(report => report._id);
    setMatches(matchingIds);
    setCurrentMatchIndex(matchingIds.length > 0 ? 0 : -1);

    return filtered;
  }, [reports, searchTerm]);

  const fetchReports = async () => {
    setIsLoading(true); // Show loading during refresh too
    try {
      const response = await fetch(
        `${BASE_URL}/get-report`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch reports");
      }

      const data = await response.json();
      console.log("Fetched Reports Data:", data);

      if (data.success) {
        setReports(data.data || []);
      } else {
        console.error("Error fetching reports:", data.message);
      }
    } catch (err) {
      console.error("🔥 Error fetching reports:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchReports(); // Re-fetch reports from the backend
  };

  // Assume userRole is stored in localStorage after login.
  const userRole = localStorage.getItem("userRole") || "admin";


  // ✅ ADD THIS useEffect FOR AUTO-SCROLLING (after your existing useEffect):
useEffect(() => {
  if (currentMatchIndex >= 0 && matches.length > 0) {
    const element = document.getElementById(`report-${matches[currentMatchIndex]}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.classList.add("ring-2", "ring-orange-500");
      setTimeout(() => {
        element.classList.remove("ring-2", "ring-orange-500");
      }, 2000);
    }
  }
}, [currentMatchIndex, matches]);

  return (
    <div className="flex h-[100vh]">
      {renderMenuBar()}
      <div className="app-content">
        <Header dashboardType={userRole === "admin" ? "Admin Dashboard" : "User Dashboard"} />

       {/* ✅ MINIMAL ENHANCED SEARCH BAR */}
<div className="w-full flex items-center gap-3 mb-4 px-2 mt-4">
  {/* Refresh Button */}
  <button
    onClick={handleRefresh}
    className="p-2 text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300"
    title="Refresh"
  >
    <FontAwesomeIcon icon={faSync} className="text-lg" />
  </button>

  {/* Search Input */}
  <div className="relative flex-1">
    <div className="relative">
      <input
        type="text"
        placeholder="Search reports..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-800 dark:text-white"
      />
      <svg
        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z" />
      </svg>
      {searchTerm && (
        <button
          onClick={() => setSearchTerm("")}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      )}
    </div>
  </div>

  {/* Match Counter - Only show when searching */}
  {searchTerm && matches.length > 0 && (
    <div className="flex items-center gap-2 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 px-3 py-1.5 rounded-lg text-sm border border-teal-200 dark:border-teal-700">
      <span className="font-medium">{currentMatchIndex + 1}</span>
      <span className="text-teal-400">/</span>
      <span className="font-medium">{matches.length}</span>
      <span className="text-xs ml-1">matches</span>
    </div>
  )}
</div>

        {/* ✅ Better Structured Table */}
        <div className="w-[175vh] h-[80vh] overflow-x-auto">
          <table className="table-fixed border-collapse w-full">
            <thead className="bg-teal-700 text-white text-sm">
              <tr>
                <th className="border px-4 py-2 text-left font-medium w-[250px]">
                  Business Name
                </th>
                <th className="border px-4 py-2 text-left font-medium w-[180px]">Owner</th>

                {/* Conditionally render Author column */}
                {authRole !== "employee" && (
                  <th className="border px-4 py-2 text-left font-medium w-[100px]">
                    Author
                  </th>
                )}
                <th className="border px-4 py-2 text-left font-medium w-[120px]">
                  Created
                </th>
                <th className="border px-4 py-2 text-left font-medium w-[300px]">
                  Description
                </th>
                <th className="border px-4 py-2 text-left font-medium w-[130px]">
                  Term Loan
                </th>
                <th className="border px-4 py-2 text-left font-medium w-[150px]">
                  Working Capital
                </th>

                {/* Conditionally render Actions column */}
                {authRole !== "employee" && (
                  <th className="border px-4 py-2 text-center w-[180px]">
                    Actions
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="text-sm divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={authRole !== "employee" ? 8 : 6}
                    className="text-center py-4"
                  >
                    <LoadingSpinner />
                  </td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td
                    colSpan={authRole !== "employee" ? 8 : 6}
                    className="text-center py-4 text-gray-500"
                  >
                    No reports found.
                  </td>
                </tr>
              ) : (
                filteredReports.map((report, index) => (
                  <tr
                    key={index}
                    id={`report-${report._id}`}  // ✅ ADD ID for scrolling
                    className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition duration-200 ${matches[currentMatchIndex] === report._id
                        ? "bg-teal-50 dark:bg-teal-900/20 ring-2 ring-teal-400"  // ✅ HIGHLIGHT CURRENT MATCH
                        : ""
                      }`}
                  >
                    <td className="border px-4 py-2 font-medium text-gray-800 dark:text-white w-[250px]">
                      {report.AccountInformation?.businessName || "N/A"}
                    </td>
                    <td className="border px-4 py-2 text-gray-700 dark:text-white w-[180px]">
                      {report.AccountInformation?.clientName || "N/A"}
                    </td>

                    {authRole !== "employee" && (
                      <td className="border px-4 py-2 text-gray-700 dark:text-white w-[100px]">
                        {report.AccountInformation?.createdBy || report.AccountInformation?.userRole || "N/A"}

                      </td>
                    )}

                    <td className="border px-4 py-2 text-gray-700 dark:text-white w-[120px]">
                      {report.AccountInformation?.createdAt
                        ? new Date(
                          report.AccountInformation.createdAt
                        ).toLocaleDateString()
                        : "N/A"}
                    </td>

                    <td className="border px-4 py-2 text-gray-700 dark:text-white w-[300px]">
                      <p className="text-sm">
                        {expandedRow === index
                          ? report.AccountInformation?.businessDescription ||
                          "No description available"
                          : (
                            report.AccountInformation?.businessDescription ||
                            "No description available"
                          ).slice(0, 60) + "..."}
                      </p>
                      {report.AccountInformation?.businessDescription?.length >
                        60 && (
                          <button
                            onClick={() => toggleDescription(index)}
                            className="text-blue-500 dark:text-blue-300 text-xs mt-1"
                          >
                            {expandedRow === index ? "Show less" : "Read more"}
                          </button>
                        )}
                    </td>

                    <td className="border px-4 py-2 text-gray-700 dark:text-white w-[130px]">
                      {report.MeansOfFinance?.termLoan?.termLoan || "N/A"}
                    </td>
                    <td className="border px-4 py-2 text-gray-700 dark:text-white w-[150px]">
                      {report.MeansOfFinance?.workingCapital?.termLoan || "N/A"}
                    </td>

                    {authRole !== "employee" && (
                      <td className="border px-4 py-2 text-center w-[180px]">
                        <div className="flex justify-center gap-2 flex-wrap">
                          <button
                            onClick={() => handleDownload(report.sessionId)}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-xs"
                          >
                            Download
                          </button>
                          <button
                            onClick={() => handleDelete(report._id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-xs"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
