import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faDownload,
  faPlus,
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
  const [selectedReportData, setSelectedReportData] = useState(null); // ✅ State to store report data

  // Fetch reports when the component mounts

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch(
          "https://backend-three-pink.vercel.app/get-report"
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
          `https://backend-three-pink.vercel.app/delete-report/${reportId}`,
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
        `https://backend-three-pink.vercel.app/get-report-data/${sessionId}`
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


  

  return (
    <div className="app-container bg-gray-50 min-h-screen">
      {renderMenuBar()}
      <div className="flex flex-col w-full px-6 py-4 gap-8">
        <Header />
        <div className="overflow-x-auto shadow-md rounded-xl border border-gray-200 bg-white">
          <div className="w-[70rem] h-[70vh] overflow-x-auto  whitespace-nowrap">
            {" "}
            {/* Wrapper for horizontal scrolling */}{" "}
            {/* Wrapper for horizontal scrolling with padding */}
            <table className="min-w-full table-auto border-collapse rounded-lg shadow-md overflow-hidden">
              {/* ✅ Table Header */}
              <thead className="bg-teal-400 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Business Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Name of Owner
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Author
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Date Created
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Description
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Term Loan
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Working Capital Loan
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              {/* ✅ Table Body */}
              <tbody className="divide-y divide-gray-200">
                {/* Show loading spinner if data is still being fetched */}
                {isLoading ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-center">
                      <LoadingSpinner />
                    </td>
                  </tr>
                ) : (
                  reports.map((report, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-100 transition-all duration-200 ease-in-out"
                    >
                      {/* ✅ Business Name */}
                      <td className="px-6 py-4 text-gray-700 font-medium">
                        {report.AccountInformation?.businessName || "N/A"}
                      </td>

                      {/* ✅ Name of Owner */}
                      <td className="px-6 py-4 text-gray-700">
                        {report.AccountInformation?.clientName || "N/A"}
                      </td>

                      {/* ✅ Author */}
                      <td className="px-6 py-4 text-gray-700">
                        {report.AccountInformation?.userRole || "N/A"}
                      </td>

                      {/* ✅ Date Created */}
                      <td className="px-6 py-4 text-gray-700">
                        {report?.AccountInformation?.createdAt
                          ? new Date(
                              report.AccountInformation.createdAt
                            ).toLocaleDateString()
                          : "N/A"}
                      </td>

                      {/* ✅ Description */}
                      <td className="px-6 py-4 text-gray-700">
                        {report.AccountInformation?.businessDescription ||
                          "No description available"}
                      </td>

                      {/* ✅ Term Loan */}
                      <td className="px-6 py-4 text-gray-700">
                        {report.MeansOfFinance?.termLoan?.termLoan ||
                          "No Term Loan Info"}
                      </td>

                      {/* ✅ Working Capital Loan */}
                      <td className="px-6 py-4 text-gray-700">
                        {report.MeansOfFinance?.workingCapital?.termLoan ||
                          "No Working Capital Loan Info"}
                      </td>

                      {/* ✅ Actions */}
                      <td className="px-6 py-4 flex justify-center gap-4">
                        {/* Conditional rendering of buttons based on user role */}
                        <div className="flex gap-4">
                          {/* ✅ Download Button for non-employees */}
                          <button
                            className={`px-4 py-2 rounded-md shadow-sm transition duration-300 flex items-center gap-2 ${
                              localStorage.getItem("userRole") === "employee"
                                ? "hidden" // Hide the button if user is employee
                                : "bg-green-500 hover:bg-green-600 text-white"
                            }`}
                            onClick={() => handleDownload(report.sessionId)}
                          >
                            <FontAwesomeIcon icon={faDownload} />
                            Download
                          </button>

                          {/* ✅ Delete Button for non-employees */}
                          <button
                            className={`px-4 py-2 rounded-md shadow-sm transition duration-300 flex items-center gap-2 ${
                              localStorage.getItem("userRole") === "employee"
                                ? "hidden" // Hide the button if user is employee
                                : "bg-red-500 hover:bg-red-600 text-white"
                            }`}
                            onClick={() => handleDelete(report._id)}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                            Delete
                          </button>

                          {/* ✅ Create Button for employees */}
                          <button
                            onClick={() => {
                              navigate("/MultestepForm", {
                                state: {
                                  isCreateReportWithExistingClicked: true,
                                  reportData: report, // Passing the report data to the form
                                },
                              });
                            }}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md"
                          >
                            Create new from this
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}

                {/* ✅ No Reports Found */}
                {reports.length === 0 && !isLoading && (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No reports found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
