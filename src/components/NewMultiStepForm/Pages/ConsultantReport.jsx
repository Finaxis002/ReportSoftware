import { useState } from 'react';
import MenuBar from '../MenuBar';
import AddConsultantForm from '../Forms/AddConsultantForm';
import Header from '../Header';
import { useNavigate } from "react-router-dom";

// Mock data for consultants
const initialConsultants = [
  {
    id: 1,
    name: 'John Smith',
    mobile: '+1 (555) 123-4567',
    email: 'john.smith@consulting.com',
    address: '123 Business Ave, Suite 100, New York, NY 10001',
    logo: 'JS'
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    mobile: '+1 (555) 987-6543',
    email: 'sarah.j@techconsult.com',
    address: '456 Innovation Drive, Boston, MA 02108',
    logo: 'SJ'
  }
];

const ConsultantReport = ({ userRole }) => {
  const [consultants, setConsultants] = useState(initialConsultants);
  const [showForm, setShowForm] = useState(false);
  const [editingConsultant, setEditingConsultant] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleAddConsultant = () => {
    setEditingConsultant(null);
    setShowForm(true);
  };

  const handleEditConsultant = (consultant) => {
    setEditingConsultant(consultant);
    setShowForm(true);
  };

  const handleDeleteConsultant = (id) => {
    if (window.confirm('Are you sure you want to delete this consultant?')) {
      setConsultants(consultants.filter(consultant => consultant.id !== id));
    }
  };

  const handleFormSubmit = (consultantData) => {
    if (editingConsultant) {
      // Update existing consultant
      setConsultants(consultants.map(consultant =>
        consultant.id === editingConsultant.id
          ? { ...consultantData, id: editingConsultant.id }
          : consultant
      ));
    } else {
      // Add new consultant
      const newConsultant = {
        ...consultantData,
        id: Math.max(...consultants.map(c => c.id)) + 1
      };
      setConsultants([...consultants, newConsultant]);
    }
    setShowForm(false);
    setEditingConsultant(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingConsultant(null);
  };

  const filteredConsultants = consultants.filter(consultant =>
    consultant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    consultant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    consultant.mobile.includes(searchQuery) ||
    consultant.address.toLowerCase().includes(searchQuery.toLowerCase())
  );


  // ✅ Render the menu bar based on user role
  const renderMenuBar = () => {
    if (!userRole) {
      navigate("/login");
      return null;
    }

    switch (userRole) {
      case "admin":
        return <MenuBar userRole="admin" />;
      case "employee":
        return <MenuBar userRole="employee" />;
      case "client":
        return <MenuBar userRole="client" />;
      default:
        navigate("/login");
        return null;
    }
  };

  return (
    <div className="flex h-[100vh]">
      {renderMenuBar()}
      <div className="app-content">
        <Header dashboardType={userRole === "admin" ? "Admin Dashboard" : "User Dashboard"} />

        <main className="flex-2 flex flex-col px-8 py-10">
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold tracking-tight text-neutral-800 dark:text-white mb-2">Consultant Management</h2>
            <p className="text-gray-500 dark:text-gray-300 text-base">Manage your consulting team members and their information</p>
          </div>

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
                  className="w-full pl-9 pr-8 py-1 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-150 placeholder-gray-500 text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-2 flex items-center hover:bg-gray-50 rounded-r-lg transition-colors"
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
                className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-sm font-medium">Add Consultant</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Consultants List */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800">Consultants ({filteredConsultants.length})</h2>
                </div>

                <div className="divide-y divide-gray-100">
                  {filteredConsultants.map((consultant) => (
                    <div key={consultant.id} className="p-6 hover:bg-gray-50 transition-colors duration-150">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md">
                              {consultant.logo}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              {consultant.name}
                            </h3>

                            <div className="mt-2 space-y-1">
                              <div className="flex items-center text-sm text-gray-600">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                {consultant.mobile}
                              </div>

                              <div className="flex items-center text-sm text-gray-600">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                {consultant.email}
                              </div>

                              <div className="flex items-start text-sm text-gray-600">
                                <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="break-words">{consultant.address}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditConsultant(consultant)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                            title="Edit"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>

                          <button
                            onClick={() => handleDeleteConsultant(consultant.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
                            title="Delete"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredConsultants.length === 0 && (
                    <div className="p-12 text-center">
                      <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <h3 className="mt-4 text-lg font-medium text-gray-900">
                        {consultants.length === 0 ? 'No consultants found' : 'No matching consultants'}
                      </h3>
                      <p className="mt-2 text-sm text-gray-500">
                        {consultants.length === 0 ? 'Get started by adding your first consultant.' : 'Try adjusting your search terms.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Form Sidebar */}
            <div className="lg:col-span-1">
              {showForm && editingConsultant && (
                <ConsultantForm
                  consultant={editingConsultant}
                  onSubmit={handleFormSubmit}
                  onCancel={handleFormCancel}
                />
              )}


            </div>
          </div>

          {/* Add Consultant Modal */}
          {showForm && !editingConsultant && (
            <AddConsultantForm
              onClose={handleFormCancel}
              onSubmit={handleFormSubmit}
            />
          )}
        </main>
      </div>
    </div>
  );
};

// Consultant Form Component
const ConsultantForm = ({ consultant, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: consultant?.name || '',
    mobile: consultant?.mobile || '',
    email: consultant?.email || '',
    address: consultant?.address || '',
    logo: consultant?.logo || ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.logo.trim()) {
      newErrors.logo = 'Logo initials are required';
    } else if (formData.logo.length > 3) {
      newErrors.logo = 'Logo should be 2-3 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-8">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">
          {consultant ? 'Edit Consultant' : 'Add New Consultant'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
            placeholder="Enter full name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Mobile Number Field */}
        <div>
          <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-2">
            Mobile Number *
          </label>
          <input
            type="tel"
            id="mobile"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.mobile ? 'border-red-300' : 'border-gray-300'
              }`}
            placeholder="+1 (555) 123-4567"
          />
          {errors.mobile && (
            <p className="mt-1 text-sm text-red-600">{errors.mobile}</p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email ID *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.email ? 'border-red-300' : 'border-gray-300'
              }`}
            placeholder="consultant@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Address Field */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
            Address *
          </label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows={3}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${errors.address ? 'border-red-300' : 'border-gray-300'
              }`}
            placeholder="Enter complete address"
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-600">{errors.address}</p>
          )}
        </div>

        {/* Logo Field */}
        <div>
          <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-2">
            Logo Initials *
          </label>
          <input
            type="text"
            id="logo"
            name="logo"
            value={formData.logo}
            onChange={handleChange}
            maxLength={3}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.logo ? 'border-red-300' : 'border-gray-300'
              }`}
            placeholder="JS (2-3 characters)"
          />
          {errors.logo && (
            <p className="mt-1 text-sm text-red-600">{errors.logo}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Enter 2-3 character initials for the consultant's logo
          </p>
        </div>

        {/* Form Actions */}
        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          >
            {consultant ? 'Update' : 'Add'} Consultant
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConsultantReport;