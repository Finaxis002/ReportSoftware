import React, { useEffect, useState } from "react";
import MenuBar from "../../MenuBar";
import { useNavigate } from "react-router-dom";

const EmployeeDashboard = ({ userRole }) => {
  const navigate = useNavigate();
  const [employeeData, setEmployeeData] = useState(null);

  useEffect(() => {
    const authRole = localStorage.getItem("userRole");
    const employeeId = localStorage.getItem("userId"); // 🔥 Get logged-in Employee ID

    console.log("Stored User ID:", employeeId);
    console.log("Stored Role:", authRole);

    if (!authRole || authRole !== "employee") {
        navigate("/login"); // Redirect if not an employee
      } else {
        // Fetch all employees from localStorage
        const employees = JSON.parse(localStorage.getItem("employees")) || [];
       
        // 🔥 Ensure Correct Employee ID Matching
        const loggedInEmployee = employees.find((emp) => String(emp.id).trim() === String(employeeId).trim());
  
        console.log("Matched Employee Data:", loggedInEmployee);
  
        if (loggedInEmployee) {
          setEmployeeData(loggedInEmployee);
        } else {
          setEmployeeData(null);
        }
      }
    }, [navigate]);



  let data = JSON.parse(localStorage.getItem("userData"));

  const renderMenuBar = () => {
    const authRole = localStorage.getItem("userRole"); // Get the role from localStorage or state

    // Check if authRole exists, and if it's a valid role
    if (!authRole) {
      navigate("/login"); // If there's no role, redirect to login
      return null; // Optionally render nothing while redirecting
    }

    switch (authRole) {
      case "admin":
        return <MenuBar userRole="admin" />;
      case "employee":
        return <MenuBar userRole="employee" />;
      case "client":
        return <MenuBar userRole="client" />;
      default:
        navigate("/login"); // If role doesn't match, redirect to login
        return null;
    }
  };

  // ✅ Corrected Logout Function
  const logoutUser = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId"); // ✅ Remove Employee ID
    navigate("/login"); // ✅ Use correct navigate function
    window.location.reload();
  };

  return (
    <div className="app-container">
      {renderMenuBar()}

      <div className="app-content">
        <div className="app-content-header">
          <h1 className="app-content-headerText">Employee Dashboard </h1>
          <button className="mode-switch me-5" title="Switch Theme">
            <svg
              className="moon"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <defs></defs>
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"></path>
            </svg>
          </button>
          <button type="button" className="btn btn-danger" onClick={logoutUser}>
            Logout
          </button>
        </div>

        <div>
          {/* ✅ Display Logged-In Employee Details */}
        {employeeData ? (
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 w-full max-w-md mx-auto">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Employee Details</h2>
            <div className="flex flex-col gap-2 text-lg">
              <p><strong>Employee ID:</strong> {employeeData.id}</p>
              <p><strong>Name:</strong> {employeeData.name}</p>
              <p><strong>Email:</strong> {employeeData.email}</p>
              <p><strong>Designation:</strong> {employeeData.designation}</p>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500">No employee details found.</p>
        )}
        </div>
        <div className="container">
          <div className="row mt-4">
            <div className="col-12">
              <h4 className="text-center">Recent reports</h4>
              <hr></hr>
            </div>
          </div>

          <div className="row">
            <div className="col">
              <div className="app-content-actions pt-0">
                <input
                  className="search-bar"
                  placeholder="Search..."
                  type="text"
                />
                <div className="app-content-actions-wrapper">
                  <div className="filter-button-wrapper">
                    <button className="action-button filter jsFilter">
                      <span>Filter</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="feather feather-filter"
                      >
                        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                      </svg>
                    </button>
                    <div className="filter-menu">
                      <label>Category</label>
                      <select>
                        <option>All Categories</option>
                        <option>Employee</option>
                        <option>Client</option>
                        <option>Report ID</option>
                        <option>Recent</option>
                      </select>
                      <label>Status</label>
                      <select>
                        <option>All Status</option>
                        <option>Active</option>
                        <option>Disabled</option>
                      </select>
                      <div className="filter-menu-buttons">
                        <button className="filter-button reset">Reset</button>
                        <button className="filter-button apply">Apply</button>
                      </div>
                    </div>
                  </div>
                  <button
                    className="action-button list active"
                    title="List View"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="feather feather-list"
                    >
                      <line x1="8" y1="6" x2="21" y2="6" />
                      <line x1="8" y1="12" x2="21" y2="12" />
                      <line x1="8" y1="18" x2="21" y2="18" />
                      <line x1="3" y1="6" x2="3.01" y2="6" />
                      <line x1="3" y1="12" x2="3.01" y2="12" />
                      <line x1="3" y1="18" x2="3.01" y2="18" />
                    </svg>
                  </button>
                  <button className="action-button grid" title="Grid View">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="feather feather-grid"
                    >
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="products-area-wrapper tableView">
                <div className="products-header">
                  <div className="product-cell image">
                    Name
                    <button className="sort-button">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 512 512"
                      >
                        <path
                          fill="currentColor"
                          d="M496.1 138.3L375.7 17.9c-7.9-7.9-20.6-7.9-28.5 0L226.9 138.3c-7.9 7.9-7.9 20.6 0 28.5 7.9 7.9 20.6 7.9 28.5 0l85.7-85.7v352.8c0 11.3 9.1 20.4 20.4 20.4 11.3 0 20.4-9.1 20.4-20.4V81.1l85.7 85.7c7.9 7.9 20.6 7.9 28.5 0 7.9-7.8 7.9-20.6 0-28.5zM287.1 347.2c-7.9-7.9-20.6-7.9-28.5 0l-85.7 85.7V80.1c0-11.3-9.1-20.4-20.4-20.4-11.3 0-20.4 9.1-20.4 20.4v352.8l-85.7-85.7c-7.9-7.9-20.6-7.9-28.5 0-7.9 7.9-7.9 20.6 0 28.5l120.4 120.4c7.9 7.9 20.6 7.9 28.5 0l120.4-120.4c7.8-7.9 7.8-20.7-.1-28.5z"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="product-cell category">
                    Phone
                    <button className="sort-button">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 512 512"
                      >
                        <path
                          fill="currentColor"
                          d="M496.1 138.3L375.7 17.9c-7.9-7.9-20.6-7.9-28.5 0L226.9 138.3c-7.9 7.9-7.9 20.6 0 28.5 7.9 7.9 20.6 7.9 28.5 0l85.7-85.7v352.8c0 11.3 9.1 20.4 20.4 20.4 11.3 0 20.4-9.1 20.4-20.4V81.1l85.7 85.7c7.9 7.9 20.6 7.9 28.5 0 7.9-7.8 7.9-20.6 0-28.5zM287.1 347.2c-7.9-7.9-20.6-7.9-28.5 0l-85.7 85.7V80.1c0-11.3-9.1-20.4-20.4-20.4-11.3 0-20.4 9.1-20.4 20.4v352.8l-85.7-85.7c-7.9-7.9-20.6-7.9-28.5 0-7.9 7.9-7.9 20.6 0 28.5l120.4 120.4c7.9 7.9 20.6 7.9 28.5 0l120.4-120.4c7.8-7.9 7.8-20.7-.1-28.5z"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="product-cell status-cell">
                    Status
                    <button className="sort-button">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 512 512"
                      >
                        <path
                          fill="currentColor"
                          d="M496.1 138.3L375.7 17.9c-7.9-7.9-20.6-7.9-28.5 0L226.9 138.3c-7.9 7.9-7.9 20.6 0 28.5 7.9 7.9 20.6 7.9 28.5 0l85.7-85.7v352.8c0 11.3 9.1 20.4 20.4 20.4 11.3 0 20.4-9.1 20.4-20.4V81.1l85.7 85.7c7.9 7.9 20.6 7.9 28.5 0 7.9-7.8 7.9-20.6 0-28.5zM287.1 347.2c-7.9-7.9-20.6-7.9-28.5 0l-85.7 85.7V80.1c0-11.3-9.1-20.4-20.4-20.4-11.3 0-20.4 9.1-20.4 20.4v352.8l-85.7-85.7c-7.9-7.9-20.6-7.9-28.5 0-7.9 7.9-7.9 20.6 0 28.5l120.4 120.4c7.9 7.9 20.6 7.9 28.5 0l120.4-120.4c7.8-7.9 7.8-20.7-.1-28.5z"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="product-cell sales">
                    Rate
                    <button className="sort-button">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 512 512"
                      >
                        <path
                          fill="currentColor"
                          d="M496.1 138.3L375.7 17.9c-7.9-7.9-20.6-7.9-28.5 0L226.9 138.3c-7.9 7.9-7.9 20.6 0 28.5 7.9 7.9 20.6 7.9 28.5 0l85.7-85.7v352.8c0 11.3 9.1 20.4 20.4 20.4 11.3 0 20.4-9.1 20.4-20.4V81.1l85.7 85.7c7.9 7.9 20.6 7.9 28.5 0 7.9-7.8 7.9-20.6 0-28.5zM287.1 347.2c-7.9-7.9-20.6-7.9-28.5 0l-85.7 85.7V80.1c0-11.3-9.1-20.4-20.4-20.4-11.3 0-20.4 9.1-20.4 20.4v352.8l-85.7-85.7c-7.9-7.9-20.6-7.9-28.5 0-7.9 7.9-7.9 20.6 0 28.5l120.4 120.4c7.9 7.9 20.6 7.9 28.5 0l120.4-120.4c7.8-7.9 7.8-20.7-.1-28.5z"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="product-cell stock">
                    Created at
                    <button className="sort-button">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 512 512"
                      >
                        <path
                          fill="currentColor"
                          d="M496.1 138.3L375.7 17.9c-7.9-7.9-20.6-7.9-28.5 0L226.9 138.3c-7.9 7.9-7.9 20.6 0 28.5 7.9 7.9 20.6 7.9 28.5 0l85.7-85.7v352.8c0 11.3 9.1 20.4 20.4 20.4 11.3 0 20.4-9.1 20.4-20.4V81.1l85.7 85.7c7.9 7.9 20.6 7.9 28.5 0 7.9-7.8 7.9-20.6 0-28.5zM287.1 347.2c-7.9-7.9-20.6-7.9-28.5 0l-85.7 85.7V80.1c0-11.3-9.1-20.4-20.4-20.4-11.3 0-20.4 9.1-20.4 20.4v352.8l-85.7-85.7c-7.9-7.9-20.6-7.9-28.5 0-7.9 7.9-7.9 20.6 0 28.5l120.4 120.4c7.9 7.9 20.6 7.9 28.5 0l120.4-120.4c7.8-7.9 7.8-20.7-.1-28.5z"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="product-cell price">
                    Price
                    <button className="sort-button">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 512 512"
                      >
                        <path
                          fill="currentColor"
                          d="M496.1 138.3L375.7 17.9c-7.9-7.9-20.6-7.9-28.5 0L226.9 138.3c-7.9 7.9-7.9 20.6 0 28.5 7.9 7.9 20.6 7.9 28.5 0l85.7-85.7v352.8c0 11.3 9.1 20.4 20.4 20.4 11.3 0 20.4-9.1 20.4-20.4V81.1l85.7 85.7c7.9 7.9 20.6 7.9 28.5 0 7.9-7.8 7.9-20.6 0-28.5zM287.1 347.2c-7.9-7.9-20.6-7.9-28.5 0l-85.7 85.7V80.1c0-11.3-9.1-20.4-20.4-20.4-11.3 0-20.4 9.1-20.4 20.4v352.8l-85.7-85.7c-7.9-7.9-20.6-7.9-28.5 0-7.9 7.9-7.9 20.6 0 28.5l120.4 120.4c7.9 7.9 20.6 7.9 28.5 0l120.4-120.4c7.8-7.9 7.8-20.7-.1-28.5z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                {data?.records?.map((record, index) => (
                  <div className="products-row" key={index}>
                    {/* <button className="cell-more-button">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-more-vertical"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>
                                    </button> */}
                    <div className="product-cell image">
                      <img
                        src="https://png.pngtree.com/element_our/png_detail/20181227/report-vector-icon-png_295013.jpg"
                        alt="product"
                      />
                      <span>{record.fields.name}</span>
                    </div>
                    <div className="product-cell category">
                      <span className="cell-label">Category:</span>
                      {record.fields.phone}
                    </div>
                    <div className="product-cell status-cell">
                      <span className="cell-label">Status:</span>
                      <span className="status active">Active</span>
                    </div>
                    <div className="product-cell sales">
                      <span className="cell-label">Sales:</span>
                      {record.fields.SimpleInterest + "%"}
                    </div>
                    <div className="product-cell stock">
                      <span className="cell-label">Stock:</span>
                      {convertToFriendlyDateTime(record.fields.CreatedAt).date +
                        " | " +
                        convertToFriendlyDateTime(record.fields.CreatedAt).time}
                    </div>
                    <div className="product-cell price">
                      <span className="cell-label">Price:</span>$
                      {record.fields.TotalExpenditure}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
