
import "../css/dashboard.css";

const Dashboard = () => {
  let userData = JSON.parse(localStorage.getItem("userData"));
  let data = JSON.parse(localStorage.getItem("userData"));
  const userDetails = userData?.fields;

  console.log(userData);

  const isSuccess = true;


  function convertToFriendlyDateTime(dateString) {
    const date = new Date(dateString);

    const dateOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    };

    const timeOptions = {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      timeZone: "UTC",
    };
    const formattedDate = date.toLocaleDateString("en-US", dateOptions);
    const formattedTime = date.toLocaleTimeString("en-US", timeOptions);

    return { date: formattedDate, time: formattedTime };
  }

  return (
    <div className="space-y-6">
      {isSuccess && (
        <div className="container">
          <div className="row mt-5">
            <div className="col-12">
              <div className="card border-primary">
                <div className="card-header text-center text-primary">
                  <h4>User Details</h4>
                </div>
                <div className="card-body">
                  <div className="d-flex justify-content-around">
                    <div className="text-center">
                      <div className="card-title fw-bold">Employee ID</div>
                      <div className="card-text">
                        {userDetails?.EmployeeID}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="card-title fw-bold">Name</div>
                      <div className="card-text">
                        {userDetails?.FirstName + " " + userDetails?.LastName}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="card-title fw-bold">Email</div>
                      <div className="card-text">{userDetails?.EmailId}</div>
                    </div>
                    <div className="text-center">
                      <div className="card-title fw-bold">No. of Reports</div>
                      <div className="card-text">
                        {userDetails?.All_Reports.length}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="card-title fw-bold">Designation</div>
                      <div className="card-text">
                        {userDetails?.Designation}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="card-title fw-bold badge bg-success py-3">
                        {userDetails?.IsAdmin ? "Admin" : "Employee"}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card-footer text-end">
                  <small className="text-muted">
                    Date of Joining: {userDetails?.DateOfJoining}
                  </small>
                </div>
              </div>
            </div>
          </div>

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
                      {convertToFriendlyDateTime(record.fields.CreatedAt)
                        .date +
                        " | " +
                        convertToFriendlyDateTime(record.fields.CreatedAt)
                          .time}
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
      )}
    </div>
  );
};

export default Dashboard;
