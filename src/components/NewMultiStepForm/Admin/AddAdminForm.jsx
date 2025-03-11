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
};

export default AddAdminForm;
