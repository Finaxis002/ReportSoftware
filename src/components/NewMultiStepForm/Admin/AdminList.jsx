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
  const [roles, setRoles] = useState({
    createNew: false,
    createFromExisting: false,
    updateReport: false,
    generateReport: false,
    checkPDF: false,
  });
  const [caSign, setCaSign] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileName, setFileName] = useState("");
  

  useEffect(() => {
    fetchAdmins();
  }, []);

  // const fetchAdmins = async () => {
  //   try {
  //     const data = await getAdmins();
  //     setAdmins(data);
  //   } catch (error) {
  //     console.error("Failed to load admins:", error);
  //   }
  // };

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

  // const handleEdit = async (id) => {
  //   try {
  //     await updateAdmin(id, updatedName, updatedPassword);
  //     setEditingAdmin(null);
  //     fetchAdmins(); // Refresh admin list after edit
  //   } catch (error) {
  //     console.error("Failed to update admin:", error);
  //   }
  // };

  // const handleEdit = async (id) => {
  //   const formData = new FormData();
  //   formData.append("username", updatedName);
  //   if (updatedPassword) formData.append("password", updatedPassword);
  //   if (caSign) formData.append("caSign", caSign);
  //   formData.append("roles", JSON.stringify(roles)); // Include roles

  //   try {
  //     await updateAdmin(id, formData);
  //     setEditingAdmin(null);
  //     fetchAdmins();
  //   } catch (error) {
  //     console.error("Failed to update admin:", error);
  //   }
  // };

  const handleEdit = async (id) => {
    try {
      await updateAdmin(
        id,
        updatedName,
        updatedPassword,
        caSign,
        roles // Pass roles directly as an object
      );
      setEditingAdmin(null);
      fetchAdmins(); // Refresh admin list after update
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to update admin:", error);
    }
  };

  const handleOpenEdit = (admin) => {
    setEditingAdmin(admin._id);
    setUpdatedName(admin.username);
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
    setUpdatedPassword("");
    // setCaSign(admin.caSign ? `http://localhost:5000${admin.caSign}` : null);
    setRoles(admin.roles || {});

    if (admin.caSign) {
      setCaSign(`http://localhost:5000${admin.caSign}`);
      setFileName(admin.caSign.split("/").pop()); // ✅ Set file name from path
    } else {
      setFileName(""); // If no file exists
    }
  };

  const handleCheckboxChange = (e) => {
    setRoles({ ...roles, [e.target.name]: e.target.checked });
  };

  const handleCloseForm = () => {
    setShowForm(false);
  };
  

  return (
    <div className="app-container" style={styles.scrollContainer}>
      <MenuBar userRole="admin" />
      <div style={styles.container}>
        <h2 style={styles.header}>List of Chartered Accountants (Admin)</h2>

        
        {/* <div style={styles.adminList}>
          {admins.map((admin) => (
            <div key={admin._id} style={styles.adminCard}>
              <div style={styles.adminDetails}>
                
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
                    onClick={() => handleOpenEdit(admin)}
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
            </div>
          ))}
        </div> */}

{/* <div style={styles.cardContainer}>
  {admins.map((admin) => (
    <div key={admin._id} style={styles.card}>
      
      <div style={styles.cardHeader}>
        <div style={styles.profileIcon}>
          {admin.username.charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={styles.name}>{admin.username}</div>
          <div style={styles.designation}>Administrator</div>
        </div>
      </div>

      

      
      <div style={styles.actionButtons}>
        <button onClick={() => handleOpenEdit(admin)} style={styles.editButton}>
          Edit
        </button>
        <button onClick={() => handleDelete(admin._id)} style={styles.deleteButton}>
          Delete
        </button>
      </div>
    </div>
  ))}
</div> */}

<div style={styles.cardContainer}>
  {admins.map((admin) => (
    <div key={admin._id} style={styles.card}>
      {/* Header */}
      <div style={styles.cardHeader}>
        {/* ✅ Show CA Sign if available, otherwise show initials */}
        {admin.caSign ? (
          <img
            src={`http://localhost:5000${admin.caSign}`}
            alt="CA Sign"
            style={styles.profileIcon}
          />
        ) : (
          <div style={styles.profileIcon}>
            {admin.username.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <div style={styles.name}>{admin.username}</div>
          <div style={styles.designation}>Administrator</div>
        </div>
      </div>

      {/* ✅ Action Buttons */}
      <div style={styles.actionButtons}>
        <button
          onClick={() => handleOpenEdit(admin)}
          onMouseEnter={(e) => e.target.style.backgroundColor = "#45a049"}
          onMouseLeave={(e) => e.target.style.backgroundColor = "#4CAF50"}
          style={styles.editButton}
        >
           <FontAwesomeIcon icon={faEdit} style={styles.buttonIcon} /> 
          Edit
        </button>
        <button
          onClick={() => handleDelete(admin._id)}
          onMouseEnter={(e) => e.target.style.backgroundColor = "#c0392b"}
          onMouseLeave={(e) => e.target.style.backgroundColor = "#e74c3c"}
          style={styles.deleteButton}
        >
           <FontAwesomeIcon icon={faTrash} style={styles.buttonIcon} />
          Delete
        </button>
      </div>
    </div>
  ))}
</div>



        {/* Add Admin Button */}
        <button onClick={() => setShowForm(true)} style={styles.addButton}>
          + Add CA
        </button>

        {/* AddAdminForm Component */}
        {/* {showForm && <AddAdminForm onSuccess={handleAdminAdded} />} */}
        {showForm && (
  <div style={styles.modalOverlay}>
    <div style={styles.modalContent}>
      <AddAdminForm 
        onSuccess={() => {
          handleAdminAdded();
          handleCloseForm(); // ✅ Close modal after submission
        }} 
        onCancel={handleCloseForm} // ✅ Close modal on cancel
      />
    </div>
  </div>
)}

        {isModalOpen && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
              <input
                type="text"
                value={updatedName}
                onChange={(e) => setUpdatedName(e.target.value)}
                placeholder="Username"
                style={styles.input}
              />
              <div style={styles.fileInputWrapper}>
                <input
                  type="file"
                  accept="image/*"
                  // onChange={(e) => setCaSign(e.target.files[0])}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setCaSign(file);
                      setFileName(file.name); // ✅ Set file name on new upload
                    }
                  }}
                  style={styles.input}
                />
                {fileName && <span style={styles.fileName}>{fileName}</span>}
              
              {caSign && (
                <div style={styles.filePreview}>
                  {typeof caSign === "string" ? (
                    <img
                      src={caSign}
                      alt="CA Sign"
                      style={styles.previewImage}
                    />
                  ) : (
                    <span>{caSign.name}</span>
                  )}
                </div>
              )}
              </div>

              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={updatedPassword}
                  onChange={(e) => setUpdatedPassword(e.target.value)}
                  placeholder="New password"
                  style={styles.input}
                />
                <FontAwesomeIcon
                  icon={showPassword ? faEyeSlash : faEye}
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                />
              </div>

              {/* Checkbox for Roles */}
              <div style={styles.checkboxContainer}>
                {Object.keys(roles).map((role) => (
                  <label key={role}>
                    <input
                      type="checkbox"
                      name={role}
                      checked={roles[role]}
                      onChange={handleCheckboxChange}
                    />
                    {role}
                  </label>
                ))}
              </div>

              <button
                onClick={() => handleEdit(editingAdmin)}
                style={styles.saveButton}
              >
                Save
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                style={styles.cancelButton}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
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
  checkboxContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    marginBottom: "10px",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.4)",
    backdropFilter: "blur(8px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "12px",
    width: "420px",
    boxShadow: "0 12px 24px rgba(0,0,0,0.2)",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    fontFamily: "'Poppins', sans-serif",
  },
  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "16px",
    width: "100%",
    boxSizing: "border-box",
    transition: "border-color 0.2s ease",
    outline: "none",
  },
  inputFocus: {
    borderColor: "#4CAF50",
  },
  eyeIcon: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
    fontSize: "18px",
    color: "#888",
    transition: "color 0.2s ease",
  },
  eyeIconHover: {
    color: "#4CAF50",
  },
  checkboxContainer: {
    display: "flex", // ✅ Correct camelCase
    flexDirection: "column", // ✅ Correct camelCase
    gap: "8px",
    marginTop: "10px", // ✅ Correct camelCase
    textAlign: "left" // ✅ Correct camelCase
},

  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    fontSize: "16px",
    color: "#555",
    transition: "color 0.2s ease",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    color: "#fff",
    padding: "12px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    transition: "background-color 0.2s ease",
    marginTop: "10px",
    fontWeight: "500",
  },
  cancelButton: {
    backgroundColor: "#eee",
    color: "#333",
    padding: "12px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    transition: "background-color 0.2s ease",
    marginTop: "10px",
    fontWeight: "500",
  },
  saveButtonHover: {
    backgroundColor: "#45a049",
  },
  cancelButtonHover: {
    backgroundColor: "#ddd",
  },
  filePreview: {
    marginTop: "8px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  previewImage: {
    width: "50px",
    height: "50px",
    objectFit: "cover",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  fileName:{
    fontSize:"10px"
  },
  cardContainer: {
    display: "flex",
    flexWrap: "wrap", // ✅ Allow wrapping to next row
    gap: "20px", // ✅ Space between cards
    justifyContent: "center", // ✅ Center items in row
    alignItems: "stretch", // ✅ Stretch items vertically to match height
},

card: {
  backgroundColor: "#f9f9f9",
  borderRadius: "16px",
  padding: "20px",
  boxShadow: "0 6px 12px rgba(0,0,0,0.1)",
  transition: "transform 0.2s ease",
  width: "350px", // ✅ Adjust width so that two cards fit in one row
  maxWidth: "350px", // ✅ Prevent overflow
  flex: "0 0 calc(50% - 20px)", // ✅ Ensure 2 cards in 1 row
},


  cardHeader: {
    display: "flex",
    alignItems: "center",
    marginBottom: "16px",
  },

  // ✅ Square Shape for Profile Icon and CA Sign
  profileIcon: {
    width: "70px", // ✅ Larger icon size
    height: "70px",
    backgroundColor: "#3498db",
    color: "#ffffff",
    borderRadius: "12px", // ✅ Square shape with rounded edges
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    fontWeight: "bold",
    marginRight: "14px",
    objectFit: "cover",
    border: "2px solid #ddd", // ✅ Slight border for separation
  },

  name: {
    fontSize: "20px",
    fontWeight: "600", // ✅ Bolder font for better visibility
    color: "#333",
  },

  designation: {
    fontSize: "14px",
    color: "#7f8c8d",
  },

  actionButtons: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "12px",
  },

  // ✅ Styling for Buttons with Icons
  editButton: {
    backgroundColor: "#4CAF50",
    color: "#fff",
    border: "none",
    padding: "10px 20px", // ✅ Increased padding for better touch area
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    gap: "8px", // ✅ Space between icon and text
    transition: "background-color 0.2s ease",
  },

  deleteButton: {
    backgroundColor: "#e74c3c",
    color: "#fff",
    border: "none",
    padding: "10px 20px", // ✅ Increased padding for better touch area
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    gap: "8px", // ✅ Space between icon and text
    transition: "background-color 0.2s ease",
  },

  buttonIcon: {
    fontSize: "18px", // ✅ Larger icon for better visibility
  },

  editButtonHover: {
    backgroundColor: "#45a049",
  },

  deleteButtonHover: {
    backgroundColor: "#c0392b",
  },
};

export default AdminList;
