// AdminList.js
import React, { useEffect, useState } from "react";
import { getAdmins, deleteAdmin } from "../../../api/adminAPI";
import AddAdminForm from "./AddAdminForm";
import MenuBar from "../MenuBar";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Header from "../Header";
import EditAdminModal from "./EditAdminModal";

const AdminList = () => {
  const [admins, setAdmins] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [roles, setRoles] = useState({
    createNew: false,
    createFromExisting: false,
    updateReport: false,
    generateReport: false,
    checkPDF: false,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const data = await getAdmins();
      setAdmins(
        data.map((admin) => ({
          ...admin,
          roles: admin.roles || {
            createNew: false,
            createFromExisting: false,
            updateReport: false,
            generateReport: false,
            checkPDF: false,
          },
        }))
      );
    } catch (error) {
      console.error("Failed to load admins:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAdmin(id);
      fetchAdmins(); // Refresh admin list after delete
    } catch (error) {
      console.error("Failed to delete admin:", error);
    }
  };

  const handleOpenEdit = (admin) => {
    setEditingAdmin(admin._id);
    setRoles(
      admin.roles || {
        createNew: false,
        createFromExisting: false,
        updateReport: false,
        generateReport: false,
        checkPDF: false,
      }
    );
    setIsModalOpen(true);
  };

  const handlePasswordChange = (newPassword) => {
    console.log("Updated Password:", newPassword); // Optional: For debugging
  };

  const handleAdminUpdated = (updatedAdmin) => {
    setAdmins((prevAdmins) =>
      prevAdmins.map((admin) =>
        admin._id === updatedAdmin._id ? updatedAdmin : admin
      )
    );
  };

  return (
    <div className="app-container">
      <MenuBar userRole="admin" />
      <div className="flex flex-col w-full px-4 gap-8">
        <Header dashboardType="Admin Dashboard" />
        <h2 className="text-gray-800 dark:text-gray-50 text-lg">
          List of Chartered Accountants (Admin)
        </h2>

        <div className="flex justify-center mt-4">
          <button
            onClick={() => setShowForm(true)}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            + Add CA
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 h-[80vh] overflow-y-auto">
          {admins.map((admin) => (
            <div
              key={admin._id}
              className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between"
            >
              <div className="flex items-center">
                {admin.caSign ? (
                  <img
                    src={`https://backend-three-pink.vercel.app/${admin.caSign}`}
                    alt="CA Sign"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-500 flex items-center justify-center text-white">
                    {admin.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="ml-4">
                  <div className="text-xl font-semibold">{admin.username}</div>
                  <div className="text-gray-600">Administrator</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(admin)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  <FontAwesomeIcon icon={faEdit} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(admin._id)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  <FontAwesomeIcon icon={faTrash} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-96">
              <AddAdminForm
                onSuccess={() => {
                  fetchAdmins(); // Reload admins after adding new one
                  setShowForm(false);
                }}
                onCancel={() => setShowForm(false)}
              />
            </div>
          </div>
        )}

        {isModalOpen && (
          <EditAdminModal
            admin={admins.find((admin) => admin._id === editingAdmin)}
            roles={roles}
            onClose={() => setIsModalOpen(false)}
            onSave={handleAdminUpdated} // Handle the updated admin data here
            onPasswordChange={handlePasswordChange} // Handle password changes
          />
        )}
      </div>
    </div>
  );
};

export default AdminList;
