import { useState, useEffect } from 'react';
import AddConsultantForm from '../Consultant/AddConsultantForm';
import { useNavigate } from "react-router-dom";
import { capitalizeWords } from '../../../utils';


const ConsultantReport = ({ userRole }) => {
  const [consultants, setConsultants] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingConsultant, setEditingConsultant] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const BASE_URL = process.env.REACT_APP_BASE_URL || 'https://reportsbe.sharda.co.in';



  const handleAddConsultant = () => {
    setEditingConsultant(null);
    setShowForm(true);
  };

  const handleEditConsultant = (consultant) => {
    setEditingConsultant(consultant);
    setShowForm(true);
  };

  const handleDeleteConsultant = async (id) => {
    if (window.confirm('Are you sure you want to delete this consultant?')) {
      try {
        const response = await fetch(`${BASE_URL}/api/consultants/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete consultant');
        }

        // Refresh the list after deletion
        fetchConsultants(searchQuery);
      } catch (err) {
        setError('Failed to delete consultant');
        console.error('Error deleting consultant:', err);
      }
    }
  };

  // Fetch consultants from API
  const fetchConsultants = async (search = '') => {
    setLoading(true);
    setError('');
    try {
      const url = search
        ? `${BASE_URL}/api/consultants?search=${encodeURIComponent(search)}`
        : `${BASE_URL}/api/consultants`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch consultants');
      }
      const data = await response.json();
      setConsultants(data.consultants || []);
    } catch (err) {
      setError('Failed to load consultants');
      console.error('Error fetching consultants:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load consultants on component mount and when search query changes
  useEffect(() => {
    fetchConsultants(searchQuery);
  }, [searchQuery]);

  const handleFormSubmit = async (consultantData) => {
    try {
      setError('');
      let url = `${BASE_URL}/api/consultants`;
      let method = 'POST';

      if (editingConsultant) {
        url = `${BASE_URL}/api/consultants/${editingConsultant._id}`;
        method = 'PUT';
      }

      console.log('Received data type:', typeof consultantData);
      console.log('Is FormData?', consultantData instanceof FormData);
      console.log('Data received:', consultantData);

      // If it's not FormData, create FormData from the object
      let formDataToSend;
      if (consultantData instanceof FormData) {
        formDataToSend = consultantData;
      } else {
        // It's a plain object, convert to FormData
        formDataToSend = new FormData();
        formDataToSend.append('name', consultantData.name || '');
        formDataToSend.append('mobile', consultantData.mobile || '');
        formDataToSend.append('email', consultantData.email || '');
        formDataToSend.append('address', consultantData.address || '');

        // Handle logo if it exists (it might be base64 or file)
        if (consultantData.logoImage) {
          // If it's base64, convert to blob
          if (typeof consultantData.logoImage === 'string' && consultantData.logoImage.startsWith('data:')) {
            const response = await fetch(consultantData.logoImage);
            const blob = await response.blob();
            formDataToSend.append('logo', blob, 'logo.png');
          }
        } else if (consultantData.logoFile) {
          formDataToSend.append('logo', consultantData.logoFile);
        }
      }

      console.log('Sending request to:', url);

      const response = await fetch(url, {
        method: method,
        body: formDataToSend,
        // Let browser set Content-Type automatically
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save consultant');
      }

      // Refresh the list after successful operation
      fetchConsultants(searchQuery);
      setShowForm(false);
      setEditingConsultant(null);
    } catch (err) {
      setError(err.message || 'Failed to save consultant');
      console.error('Error saving consultant:', err);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingConsultant(null);
  };

  const filteredConsultants = consultants.filter(consultant =>
    searchQuery ? (
      consultant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      consultant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      consultant.mobile.includes(searchQuery) ||
      consultant.address.toLowerCase().includes(searchQuery.toLowerCase())
    ) : consultants
  );

  // ✅ Render the menu bar based on user role

  return (
  <div className="flex h-[100vh]">
  <div className="app-content">

    {error && (
      <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-500 dark:text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-red-700 dark:text-red-300">{error}</span>
        </div>
      </div>
    )}

    <main className="flex-2 flex flex-col px-8  max-h-[80vh] overflow-y-auto">
      

      {/* Action Bar */}
      <div className="mb-6 flex items-center justify-between">
        {/* Search Section */}
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search consultants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-150 placeholder-gray-500 dark:placeholder-gray-400 text-sm text-gray-900 dark:text-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-2 flex items-center hover:bg-gray-50 dark:hover:bg-gray-600 rounded-r-lg transition-colors"
              >
                <svg className="h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="flex-shrink-0">
          <button
            onClick={handleAddConsultant}
            className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 flex items-center space-x-2 shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-sm font-medium">Add Consultant</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1">
        {/* Consultants List */}
        <div className="w-full">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-blue-50/80 to-white dark:from-gray-800 dark:to-gray-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                      Consultants
                      <span className="ml-2 px-2.5 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold rounded-full shadow-sm">
                        {filteredConsultants.length}
                      </span>
                    </h2>
                    {searchQuery && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center">
                        <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Results for "<span className="font-semibold text-gray-800 dark:text-gray-200 ml-1">"{searchQuery}"</span>"
                      </p>
                    )}
                  </div>
                </div>

                {loading && (
                  <div className="flex items-center px-3 py-1.5 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 shadow-sm">
                    <svg className="animate-spin h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </div>
                )}
              </div>
            </div>

            {/* Consultants List - Modern Design */}
            <div className="space-y-3 p-4 dark:bg-gray-800">
              {filteredConsultants.map((consultant, index) => (
                <div
                  key={consultant._id}
                  className="group dark:bg-gray-800 relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-lg dark:hover:shadow-blue-500/10"
                >
                  <div className="p-4 dark:bg-gray-800 ">
                    <div className="flex items-start justify-between">
                      {/* Left Section - Consultant Info */}
                      <div className="flex items-start space-x-4 flex-1 min-w-0">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          {consultant.logo ? (
                            <div className="relative">
                              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-500/20 dark:from-blue-400/30 dark:to-purple-500/30 rounded-xl blur-sm group-hover:blur-md transition-all duration-300"></div>
                              <img
                                src={`${BASE_URL}${consultant.logo}`}
                                alt={`${consultant.name} logo`}
                                className="w-14 h-14 rounded-xl object-cover border-2 border-white dark:border-gray-700 shadow-md group-hover:shadow-lg transition-all duration-300 relative z-10"
                              />
                            </div>
                          ) : (
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                              {consultant.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </div>
                          )}
                        </div>

                        {/* Consultant Details */}
                        <div className="flex-1 min-w-0 space-y-3">
                          {/* Name and Badge */}
                          <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-200 transition-colors duration-200">
                              {capitalizeWords(consultant.name)}
                            </h3>
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
                              Consultant
                            </span>
                          </div>

                          {/* Contact Info Grid */}
                          <div className="flex gap-4 gap-3">
                            {/* Phone */}
                            <div className="flex items-center space-x-2 text-sm">
                              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                                <svg className="w-4 h-4 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-gray-500 dark:text-gray-400 text-xs">Mobile</p>
                                <p className="font-medium text-gray-900 dark:text-white">{consultant.mobile}</p>
                              </div>
                            </div>

                            {/* Email */}
                            <div className="flex items-center space-x-2 text-sm">
                              <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg">
                                <svg className="w-4 h-4 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-gray-500 dark:text-gray-400 text-xs">Email</p>
                                <p className="font-medium text-gray-900 dark:text-white truncate max-w-[180px]">{consultant.email}</p>
                              </div>
                            </div>

                            {/* Address */}
                            <div className="flex items-start space-x-2 text-sm md:col-span-2">
                              <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg mt-1">
                                <svg className="w-4 h-4 text-purple-500 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-gray-500 dark:text-gray-400 text-xs">Address</p>
                                <p className="font-medium text-gray-900 dark:text-white leading-relaxed">{capitalizeWords(consultant.address)}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Section - Action Buttons */}
                      <div className="flex flex-col space-y-2 ml-4">
                        {/* Select Button - Primary */}
                       
                        {/* Secondary Actions */}
                        <div className="flex space-x-2">
                           <button
                          onClick={() => navigate('/create-consultant-report', { state: { selectedConsultantId: consultant._id } })}
                          className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-sm font-medium flex items-center space-x-2"
                          title="Select Consultant"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Select</span>
                        </button>

                          <button
                            onClick={() => handleEditConsultant(consultant)}
                            className="p-2 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-all duration-200 border border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700"
                            title="Edit Consultant"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>

                          <button
                            onClick={() => handleDeleteConsultant(consultant._id)}
                            className="p-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-all duration-200 border border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700"
                            title="Delete Consultant"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Empty State */}
              {filteredConsultants.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
                    <svg className="w-10 h-10 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {consultants.length === 0 ? 'No consultants yet' : 'No matches found'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                    {consultants.length === 0
                      ? 'Get started by adding your first consultant to build your team.'
                      : 'Try adjusting your search terms or filters to find what you\'re looking for.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Consultant Modal */}
      {showForm && (
        <AddConsultantForm
          onClose={handleFormCancel}
          onSubmit={handleFormSubmit}
          consultant={editingConsultant}
        />
      )}

      {/* Add/Edit Consultant Modal */}
      {showForm && (
        <AddConsultantForm
          consultant={editingConsultant}
          onClose={handleFormCancel}
          onSubmit={handleFormSubmit}
        />
      )}
    </main>
  </div>
</div>
  );
};


export default ConsultantReport;