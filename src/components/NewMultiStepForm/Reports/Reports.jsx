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
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Loading state for spinner
  // const [selectedReportData, setSelectedReportData] = useState(null); // ✅ State to store report data
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);
  const toggleDescription = (index) => {
    setExpandedRow((prev) => (prev === index ? null : index));
  };

  // Fetch reports when the component mounts

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch(
          "https://reportsbe.sharda.co.in/get-report"
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
          `https://reportsbe.sharda.co.in/delete-report/${reportId}`,
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
        `https://reportsbe.sharda.co.in/get-report-data/${sessionId}`
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

  const filteredReports = reports.filter((report) => {
    const name = report?.AccountInformation?.businessName?.toLowerCase() || "";
    const desc = report?.AccountInformation?.businessDescription?.toLowerCase() || "";
    const owner = report?.AccountInformation?.clientName?.toLowerCase() || "";
  
    return (
      name.includes(searchTerm) ||
      desc.includes(searchTerm) ||
      owner.includes(searchTerm)
    );
  });
  

  const fetchReports = async () => {
    setIsLoading(true); // Show loading during refresh too
    try {
      const response = await fetch(
        "https://reportsbe.sharda.co.in/get-report"
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

  return (
    <div className="flex h-[100vh]">
      {renderMenuBar()}
      <div className="app-content">
      <Header dashboardType ={userRole === "admin" ?  "Admin Dashboard" : "User Dashboard"} />

        {/* ✅ Enhanced Search Bar */}
        <div className="w-full flex  items-center mb-6 p-4">
          <div className="flex w-80 justify-between items-center mb-2 px-2 me-6">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-1 text-sm text-teal-900 hover:text-teal-900 dark:text-teal-300 dark:hover:text-teal-100"
            >
              <FontAwesomeIcon icon={faSync} className="text-lg" />
            </button>
          </div>
          <div className="relative ">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
                />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search by Keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition duration-150 ease-in-out"
            />
          </div>
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
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition duration-200"
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
