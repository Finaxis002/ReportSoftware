import React, { useEffect, useState } from "react";
import { getAdmins, deleteAdmin, updateAdmin } from "../../../api/adminAPI";
import AddAdminForm from "./AddAdminForm";
import MenuBar from "../MenuBar";
import {
  faEye,
  faEyeSlash,
  faEdit,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const AdminList = () => {
  const [admins, setAdmins] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [updatedName, setUpdatedName] = useState("");
  const [updatedPassword, setUpdatedPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const data = await getAdmins();
      setAdmins(data);
    } catch (error) {
      console.error("Failed to load admins:", error);
    }
  };

  const handleAdminAdded = () => {
    fetchAdmins(); // Reload admins after adding new one
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    try {
      await deleteAdmin(id);
      fetchAdmins(); // Refresh admin list after delete
    } catch (error) {
      console.error("Failed to delete admin:", error);
    }
  };

  const handleEdit = async (id) => {
    try {
      await updateAdmin(id, updatedName, updatedPassword);
      setEditingAdmin(null);
      fetchAdmins(); // Refresh admin list after edit
    } catch (error) {
      console.error("Failed to update admin:", error);
    }
  };

  

  return (
    <div className="app-container" style={styles.scrollContainer}>
      <MenuBar userRole="admin" />
      <div style={styles.container}>
        <h2 style={styles.header}>List of Chartered Accountants (Admin)</h2>

        <div style={styles.adminList}>
          {admins.map((admin) => (
             
            <div key={admin._id} style={styles.adminCard}>
              {editingAdmin === admin._id ? (
                <div style={styles.editContainer}>
                  <input
                    type="text"
                    value={updatedName}
                    onChange={(e) => setUpdatedName(e.target.value)}
                    placeholder="New username"
                    style={styles.input}
                  />
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={updatedPassword}
                      onChange={(e) => setUpdatedPassword(e.target.value)}
                      placeholder="Enter password"
                      style={styles.input}
                    />
                    <FontAwesomeIcon
                      icon={showPassword ? faEyeSlash : faEye}
                      onClick={() => setShowPassword(!showPassword)}
                      style={styles.eyeIcon}
                    />
                  </div>
                  <button
                    onClick={() => handleEdit(admin._id)}
                    style={styles.saveButton}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingAdmin(null)}
                    style={styles.cancelButton}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div style={styles.adminDetails}>
                  {/* Display CA Sign if available */}
                  {/* {admin.caSign && (
                <img
                  src={`http://localhost:5000${admin.caSign}`}
                  alt="CA Sign"
                  style={styles.caSign}
                />
              )}
              <span style={styles.adminName}>{admin.username}</span> */}
                  {admin.caSign && (
                    <img
                      src={`http://localhost:5000${admin.caSign}`}
                      alt="CA Sign"
                      style={styles.caSign}
                    />
                  )}
                 
                  <span style={styles.adminName}>{admin.username}</span>
                  <div style={styles.actionButtons}>
                    <button
                      onClick={() => setEditingAdmin(admin._id)}
                      style={styles.editButton}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(admin._id)}
                      style={styles.deleteButton}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Admin Button */}
        <button onClick={() => setShowForm(true)} style={styles.addButton}>
          + Add CA
        </button>

        {/* AddAdminForm Component */}
        {showForm && <AddAdminForm onSuccess={handleAdminAdded} />}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    maxWidth: "800px",
    margin: "0 auto",
    textAlign: "center",
  },
  header: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "20px",
  },
  adminList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    maxHeight: "400px",
    overflowY: "auto", // Enable Y-axis scrolling
    paddingRight: "5px",
  },
  adminCard: {
    backgroundColor: "#f9f9f9",
    padding: "12px 20px",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    transition: "transform 0.2s",
  },
  adminCardHover: {
    transform: "scale(1.02)",
  },
  adminDetails: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  adminName: {
    fontSize: "18px",
    color: "#333",
    fontWeight: "500",
  },
  actionButtons: {
    display: "flex",
    gap: "10px",
  },
  editButton: {
    backgroundColor: "#57B9FF",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  deleteButton: {
    backgroundColor: "#FF474D",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  editContainer: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    width: "100%",
  },
  input: {
    padding: "8px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    width: "40%",
    fontSize: "14px",
  },
  saveButton: {
    backgroundColor: "#4caf50",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  cancelButton: {
    backgroundColor: "#ccc",
    color: "#333",
    border: "none",
    padding: "6px 12px",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  addButton: {
    marginTop: "20px",
    padding: "10px 20px",
    backgroundColor: "#4CAF50",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    borderRadius: "5px",
    transition: "background-color 0.2s",
  },
  passwordWrapper: {
    position: "relative",
    width: "40%",
  },
  eyeIcon: {
    position: "absolute",
    right: "8px",
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
    fontSize: "18px",
  },
  scrollContainer: {
    overflowY: "auto",
  },
  caSign: {
    width: "40px", // Adjust size as needed
    height: "40px", // Adjust size as needed
    borderRadius: "50%", // Makes it circular
    objectFit: "cover", // Ensures the image doesn't get distorted
    marginRight: "10px",
    border: "1px solid #ccc",
  },
};

export default AdminList;
