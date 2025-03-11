import React, { useState } from "react";

const ReportEditModal = ({ report, setShowEditModal, onUpdate }) => {
  const [updatedReport, setUpdatedReport] = useState(report);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedReport((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `https://backend-url.com/api/reports/${report.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedReport),
        }
      );

      if (response.ok) {
        onUpdate(updatedReport);
        setShowEditModal(false);
      } else {
        console.error("Failed to update report");
      }
    } catch (err) {
      console.error("Error updating report:", err);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <h2 className="text-lg font-semibold mb-4">Edit Report</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Title</label>
            <input
              type="text"
              name="title"
              value={updatedReport.title}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Author</label>
            <input
              type="text"
              name="author"
              value={updatedReport.author}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="mr-2 text-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportEditModal;
