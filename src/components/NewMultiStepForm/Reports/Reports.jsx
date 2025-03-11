import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faDownload } from "@fortawesome/free-solid-svg-icons";
import ReportEditModal from "./ReportEditModal";
import MenuBar from "../MenuBar";
import Header from "../Header";
import { useNavigate } from "react-router-dom";

const Reports = ({ sendPdfData }) => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Fetch reports when the component mounts
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch("https://backend-three-pink.vercel.app/get-report");
        if (!response.ok) {
          throw new Error("Failed to fetch reports");
        }
        const data = await response.json();
        setReports(data);
      } catch (err) {
        console.error("Error fetching reports:", err);
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

  // ✅ Handle Update Action after Editing
  const handleUpdateReport = (updatedReport) => {
    setReports((prevReports) =>
      prevReports.map((report) =>
        report._id === updatedReport._id ? updatedReport : report
      )
    );
  };

  const handleDownload = async (sessionId) => {
    try {
      const response = await fetch(
        `https://backend-three-pink.vercel.app/get-report-data/${sessionId}`
      );
      if (!response.ok) throw new Error("Failed to fetch report data");

      const reportData = await response.json();

      console.log("✅ Report Data Fetched:", reportData);
      sendPdfData(reportData);

      // ✅ Navigate to the /generated-pdf route and pass data as state
      navigate("/generated-pdf", { state: { reportData } });
    } catch (error) {
      console.error("❌ Error downloading PDF:", error);
      alert(`Error fetching report data: ${error.message}`);
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

  return (
    <div className="app-container bg-gray-50 min-h-screen">
    {renderMenuBar()}
    <div className="flex flex-col w-full px-6 py-4 gap-8">
      <Header />
      <div className="overflow-x-auto shadow-md rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full border-collapse rounded-lg overflow-hidden">
          {/* ✅ Table Header */}
          <thead className="bg-teal-600 text-white">
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
              <th className="px-6 py-4 text-center text-sm font-semibold">
                Actions
              </th>
            </tr>
          </thead>
  
          {/* ✅ Table Body */}
          <tbody className="divide-y divide-gray-200">
            {reports.map((report, index) => (
              <tr
                key={index}
                className="hover:bg-gray-100 transition duration-200"
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
  
                {/* ✅ Actions */}
                <td className="px-6 py-4 flex justify-center gap-4">
                  {/* ✅ Download Button */}
                  <button
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md shadow-sm transition duration-300 flex items-center gap-2"
                    onClick={() => handleDownload(report.sessionId)} // ✅ Use sessionId
                  >
                    <FontAwesomeIcon icon={faDownload} />
                    Download
                  </button>
  
                  {/* ✅ Delete Button */}
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md shadow-sm transition duration-300 flex items-center gap-2"
                    onClick={() => handleDelete(report._id)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                    Delete
                  </button>
                </td>
              </tr>
            ))}
  
            {/* ✅ No Reports Found */}
            {reports.length === 0 && (
              <tr>
                <td
                  colSpan="5"
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
  
  );
};

export default Reports;
