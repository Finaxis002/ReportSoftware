import React, { useEffect, useState } from "react";
import { getAdmins, deleteAdmin, updateAdmin } from "../../../api/adminAPI";
import AddAdminForm from "./AddAdminForm";
import MenuBar from "../MenuBar";
import { faEye, faEyeSlash, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Header from "../Header";

const AdminList = () => {
  const [admins, setAdmins] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [updatedName, setUpdatedName] = useState("");
  const [updatedPassword, setUpdatedPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [permissions, setRoles] = useState({
    createNew: false,
    createFromExisting: false,
    updateReport: false,
    generateReport: false,
    exportData: false,
  });
  const [caSign, setCaSign] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const data = await getAdmins();
      setAdmins(
        data.map((admin) => ({
          ...admin,
          permissions: admin.permissions || {
            createNew: false,
            createFromExisting: false,
            updateReport: false,
            generateReport: false,
            exportData: false,
          },
        }))
      );
    } catch (error) {
      console.error("Failed to load admins:", error);
    }
  };

  const handleAdminAdded = () => {
    fetchAdmins();
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    try {
      await deleteAdmin(id);
      fetchAdmins();
    } catch (error) {
      console.error("Failed to delete admin:", error);
    }
  };

  const handleEdit = async (id) => {
    try {
      await updateAdmin(id, updatedName, updatedPassword, caSign, permissions);
      setEditingAdmin(null);
      fetchAdmins();
      setIsModalOpen(false);
      setUpdatedPassword(""); // ← this clears the input for safety after opening modal

    } catch (error) {
      console.error("Failed to update admin:", error);
    }
    if (updatedPassword.trim() === "") {
      const confirm = window.confirm("Password field is empty. Do you want to keep the old password?");
      if (!confirm) return;
    }
    
  };

  const handleOpenEdit = (admin) => {
    setEditingAdmin(admin._id);
    setUpdatedName(admin.username);
    setRoles(admin.permissions || {});
    setIsModalOpen(true);
    setUpdatedPassword("");

    if (admin.caSign) {
      setCaSign(`https://backend-three-pink.vercel.app/api/uploads/${admin.caSign}`);
      setFileName(admin.caSign.split("/").pop());
    } else {
      setFileName("");
    }
  };

  const handleCheckboxChange = (e) => {
    setRoles({ ...permissions, [e.target.name]: e.target.checked });
  };

  const handleCloseForm = () => {
    setShowForm(false);
  };

  return (
    <div className="flex h-[100vh]">
      <MenuBar userRole="admin" />
      <div className="flex flex-col w-full px-4 gap-8">
        <Header dashboardType="Admin Dashboard" />
        <div className="flex justify-between">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">List of Chartered Accountants (Admin)</h2>
        <div className="flex justify-center">
          <button onClick={() => setShowForm(true)} className="px-4 py-1 bg-green-600 text-white text-lg rounded-md">
            + Add CA
          </button>
        </div>
        </div>
        <div className=" h-[80vh] flex flex-col gap-4 overflow-auto">
       
        <div className="flex flex-wrap gap-5 items-stretch ">
          {admins.map((admin) => (
            <div key={admin._id} className="bg-gray-100 rounded-xl p-5 shadow-md transition-transform w-[350px] max-w-[350px] flex-1">
              <div className="flex items-center mb-4">
                {admin.caSign ? (
                  <img
                    src={`https://backend-three-pink.vercel.app/${admin.caSign}`}
                    alt="CA Sign"
                    className="w-[70px] h-[70px] rounded-lg object-cover border-2 border-gray-300 mr-4"
                  />
                ) : (
                  <div className="w-[70px] h-[70px] bg-blue-500 text-white rounded-lg flex items-center justify-center text-2xl font-bold mr-4 border-2 border-gray-300">
                    {admin.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="text-xl font-semibold text-gray-800">{admin.username}</div>
                  <div className="text-sm text-gray-500">Administrator</div>
                </div>
              </div>
              <div className="flex justify-between mt-3">
                <button
                  onClick={() => handleOpenEdit(admin)}
                  className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faEdit} className="text-lg" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(admin._id)}
                  className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faTrash} className="text-lg" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
        </div>

       

        {showForm && (
          <div className="fixed inset-0 bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-xl w-[420px] shadow-xl">
              <AddAdminForm
                onSuccess={() => {
                  handleAdminAdded();
                  handleCloseForm();
                }}
                onCancel={handleCloseForm}
              />
            </div>
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-xl w-[420px] shadow-xl flex flex-col gap-4">
              <input
                type="text"
                value={updatedName}
                onChange={(e) => setUpdatedName(e.target.value)}
                placeholder="Username"
                className="p-3 rounded-lg border border-gray-300 w-full"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setCaSign(file);
                    setFileName(file.name);
                  }
                }}
                className="p-3 rounded-lg border border-gray-300 w-full"
              />
              {fileName && <span className="text-xs">{fileName}</span>}
              {caSign && (
                <div className="mt-2 flex items-center gap-3">
                  {typeof caSign === "string" ? (
                    <img src={caSign} alt="CA Sign" className="w-12 h-12 object-cover rounded border" />
                  ) : (
                    <span>{caSign.name}</span>
                  )}
                </div>
              )}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={updatedPassword}
                  onChange={(e) => setUpdatedPassword(e.target.value)}
                  placeholder="New password"
                  className="p-3 rounded-lg border border-gray-300 w-full"
                />
                <FontAwesomeIcon
                  icon={showPassword ? faEyeSlash : faEye}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
                />
              </div>
              <div className="flex flex-col gap-2 text-left">
                {Object.keys(permissions).map((role) => (
                  <label key={role} className="flex items-center gap-2 text-gray-700">
                    <input
                      type="checkbox"
                      name={role}
                      checked={permissions[role]}
                      onChange={handleCheckboxChange}
                    />
                    {role}
                  </label>
                ))}
              </div>
              <button onClick={() => handleEdit(editingAdmin)} className="bg-green-600 text-white p-3 rounded-lg mt-2 font-medium">
                Save
              </button>
              <button onClick={() => setIsModalOpen(false)} className="bg-gray-200 text-gray-800 p-3 rounded-lg mt-2 font-medium">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminList;
