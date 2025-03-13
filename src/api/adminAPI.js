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

// export const addAdmin = async (username, password) => {
//   try {
//     const response = await axios.post(`${API_URL}/admin/register`, { username, password });
//     return response.data;
//   } catch (error) {
//     console.error('Error adding admin:', error);
//     throw error;
//   }
// };

// export const addAdmin = async (formData) => {
//   try {
//     const response = await axios.post(`${API_URL}/admin/register`, formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     });
//     return response.data;
//   } catch (error) {
//     console.error('Error adding admin:', error);
//     throw error;
//   }
// };
// export const addAdmin = async (username, password, caSign) => {
//   try {
//     const formData = new FormData();
//     formData.append('username', username);
//     formData.append('password', password);
//     if (caSign) {
//       formData.append('caSign', caSign); // Make sure 'caSign' matches the multer field name
//     }

//     // Axios will automatically detect multipart/form-data
//     const response = await axios.post(`${API_URL}/register`, formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data', // <-- This is critical for multer!
//       },
//     });

//     return response.data;
//   } catch (error) {
//     console.error('Error adding admin:', error);
//     throw error;
//   }
// };



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


// export const updateAdmin = async (id, username, password) => {
//   try {
//     const response = await axios.put(`${API_URL}/admin/${id}`, { username, password });
//     return response.data;
//   } catch (error) {
//     console.error('Error updating admin:', error);
//     throw error;
//   }
// };
export const updateAdmin = async (id, username, password, caSign, roles) => {
  try {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    // ✅ Append file if selected
    if (caSign) {
      formData.append('caSign', caSign);
    }

    // ✅ Append roles (convert object to string)
    if (roles) {
      formData.append('roles', JSON.stringify(roles));
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
