import axios from 'axios';

// const API_URL = 'http://localhost:5000/api/admin';
// const API_URL = 'http://localhost:5000/api';
const API_URL = 'https://backend-three-pink.vercel.app/api';


export const getAdmins = async () => {
  try {
    const response = await axios.get(`${API_URL}/admins`);
    return response.data;
  } catch (error) {
    console.error('Error fetching admins:', error);
    throw error;
  }
};



export const addAdmin = async (formData) => {
  try {
    const response = await axios.post(`${API_URL}/admin/register`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Critical for multer
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error adding admin:', error);
    throw error;
  }
};

export const deleteAdmin = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/admin/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting admin:', error);
    throw error;
  }
};



export const updateAdmin = async (id, username, password, caSign, permissions) => {
  try {
    const formData = new FormData();
    formData.append('username', username);
    if (password && password.trim() !== '') {
      formData.append('password', password); // ✅ Only send password if non-empty
    }
    
    
    // ✅ Append file if selected
    if (caSign) {
      formData.append('caSign', caSign);
    }

    // ✅ Append permissions (convert object to string)
    if (permissions) {
      formData.append('permissions', JSON.stringify(permissions));
    }

    const response = await axios.put(`${API_URL}/admin/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // ✅ Important for file upload
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error updating admin:', error);
    throw error;
  }
};
