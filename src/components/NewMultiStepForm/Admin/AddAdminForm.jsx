import React, { useState } from 'react';
import { addAdmin } from '../../../api/adminAPI';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const AddAdminForm = ({ onSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [caSign, setCaSign] = useState(null);
  
  // ✅ State for user roles
  const [roles, setRoles] = useState({
    createNew: false,
    createFromExisting: false,
    updateReport: false,
    generateReport: false,
    checkPDF: false,
  });

  // ✅ Handle checkbox changes
  const handleRoleChange = (role) => {
    setRoles((prevRoles) => ({
      ...prevRoles,
      [role]: !prevRoles[role],
    }));
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   const formData = new FormData();
  //   formData.append('username', username);
  //   formData.append('password', password);
  //   if (caSign) {
  //     formData.append('caSign', caSign);
  //   }


  //   try {
  //     await addAdmin(username, password);
  //     onSuccess(); // Refresh the list after adding
  //   } catch (error) {
  //     setError(error.response?.data?.message || 'Failed to create admin');
  //   }
  // };
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    if (caSign) {
      formData.append('caSign', caSign);
    }
    formData.append('roles', JSON.stringify(roles));
  
    try {
      await addAdmin(formData); // ✅ Pass formData directly here
      onSuccess(); // Refresh the list after adding
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create admin');
    }
  };
  
  return (
    <div style={styles.container}>
      <h3>Add New CA (Admin)</h3>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
          required
        />
        {/* <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          required
        /> */}
        <div style={styles.passwordContainer}>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
          <FontAwesomeIcon
            icon={showPassword ? faEyeSlash : faEye}
            onClick={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          />
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setCaSign(e.target.files[0])}
          style={styles.input}
        />

<div style={styles.checkboxContainer}>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={roles.createNew}
              onChange={() => handleRoleChange('createNew')}
            />
            Create New
          </label>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={roles.createFromExisting}
              onChange={() => handleRoleChange('createFromExisting')}
            />
            Create from Existing
          </label>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={roles.updateReport}
              onChange={() => handleRoleChange('updateReport')}
            />
            Update Report
          </label>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={roles.generateReport}
              onChange={() => handleRoleChange('generateReport')}
            />
            Generate Report
          </label>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={roles.checkPDF}
              onChange={() => handleRoleChange('checkPDF')}
            />
            Check PDF
          </label>
        </div>
        {error && <p style={styles.error}>{error}</p>}
        <button type="submit" style={styles.button}>Create</button>
      </form>
    </div>
  );
};

// const styles = {
//   container: {
//     marginTop: '20px',
//     padding: '20px',
//     border: '1px solid #ddd',
//     borderRadius: '5px',
//   },
//   form: {
//     display: 'flex',
//     flexDirection: 'column',
//   },
//   input: {
//     padding: '10px',
//     marginBottom: '10px',
//     fontSize: '16px',
//     borderRadius: '4px',
//     border: '1px solid #ccc',
//   },
//   button: {
//     padding: '10px',
//     backgroundColor: '#4CAF50',
//     color: '#fff',
//     border: 'none',
//     cursor: 'pointer',
//   },
//   error: {
//     color: 'red',
//   },
// };
const styles = {
  container: {
    marginTop: '20px',
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    backgroundColor: '#f9f9f9',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  input: {
    padding: '10px',
    marginBottom: '10px',
    fontSize: '16px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    width: '100%',
    boxSizing: 'border-box',
  },
  passwordContainer: {
    position: 'relative',
    width: '100%',
  },
  eyeIcon: {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    cursor: 'pointer',
    color: '#888',
  },
  button: {
    padding: '10px',
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '4px',
    fontSize: '16px',
    transition: 'background 0.3s ease',
  },
  buttonHover: {
    backgroundColor: '#45a049',
  },
  error: {
    color: 'red',
    marginBottom: '10px',
  },
  // ✅ Checkbox styles
  checkboxContainer: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '10px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '5px',
    fontSize: '14px',
    cursor: 'pointer',
  },
};

export default AddAdminForm;
