import React from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const ExportClientsButton = ({ clients, formData }) => {
  const handleExport = () => {
    const combinedClients = [
      ...clients.map((client) => ({
        "Client Name": client.clientName || "N/A",
        "Contact Number": client.contactNo || "N/A",
        "Email ID": client.emailId || "N/A",
        "Address": client.address || "N/A",
        "Source": "Added Client",
      })),
      ...formData.map((data) => ({
        "Client Name": data.clientName || "N/A",
        "Contact Number": data.clientPhone || "N/A",
        "Email ID": data.clientEmail || "N/A",
        "Address": "N/A",
        "Source": "Form Data",
      })),
    ];

    if (combinedClients.length === 0) {
      alert("No client data available to export!");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(combinedClients);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "All Clients");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "CompleteClientData.xlsx");
  };

  return (
    <button
      onClick={handleExport}
      className="px-6 py-3 bg-green-600 text-white rounded-xl shadow-lg hover:bg-green-700 transition duration-300 transform hover:scale-105"
    >
      Export All Clients Data
    </button>
  );
};

export default ExportClientsButton;
