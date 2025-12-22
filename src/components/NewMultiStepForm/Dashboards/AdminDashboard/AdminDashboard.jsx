import{ useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../LoadingSpinner/LoadingSpinner"; // Import the loading spinner

function AdminBadgeWithClock() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hidden md:block relative z-10">
      <div className="flex flex-col items-center gap-3">
      
        {/* Time & Date */}
        <div className="flex items-center gap-2 mt-1 px-3 py-1 rounded-lg bg-gray-50/60 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 shadow-sm text-xs font-mono text-gray-700 dark:text-gray-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-teal-500 dark:text-teal-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
            <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
          </svg>
          <span className="text-[14px]">
            {currentTime.toLocaleString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
            &nbsp;|&nbsp;
            {currentTime.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
            })}
          </span>
        </div>
      </div>
    </div>
  );
}

const AdminDashboard = () => {
  const BASE_URL = process.env.REACT_APP_BASE_URL || 'https://reportsbe.sharda.co.in';
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Loading state for spinner

  const [chartImage, setChartImage] = useState(null);

  // ✅ Redirect if not admin
  useEffect(() => {
    const authRole = localStorage.getItem("userRole");
    if (!authRole || authRole !== "admin") {
      navigate("/login");
    }
  }, [navigate]);

  // ✅ Fetch Employees Data from Backend
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/api/employees`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch employee data");
        }

        const data = await response.json();
        console.log("Employees Response:", data);

        // ✅ Directly handle the array response
        if (Array.isArray(data)) {
          setEmployees(data);
        } else {
          console.error("Unexpected data format:", data);
        }
      } catch (error) {
        console.error("🔥 Error fetching employees:", error);
      }
    };

    fetchEmployees();
  }, []);

  // ✅ Fetch Reports Data from Backend
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/get-report`
        );
        const data = await response.json();

        console.log("Reports Response:", data);

        if (data.success) {
          setReports(data.data || []);
        } else {
          console.error("Error fetching reports:", data.message);
        }
      } catch (error) {
        console.error("🔥 Error fetching reports:", error);
      }
    };

    fetchReports();
  }, []);

  // ✅ Function to convert DateTime to Friendly format
  const convertToFriendlyDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
    };
  };

  // ✅ Set loading state to false once data is fetched
  useEffect(() => {
    if (employees.length > 0 && reports.length > 0) {
      setIsLoading(false);
    }
  }, [employees, reports]);

  return (
    <div className="space-y-6">
      {/* ===== Brand Bar - Beautiful Professional Branding ===== */}
      <div className="relative flex items-center justify-between bg-white/80 dark:bg-slate-800/80 rounded-2xl border border-gray-100 dark:border-slate-700 px-6 py-5 mt-4 overflow-hidden backdrop-blur-lg shadow-sm hover:shadow-md transition-all duration-300">
        {/* Floating orbs for depth and visual interest */}
        <div className="absolute right-[-60px] top-[-36px] w-40 h-40 rounded-full bg-blue-200/40 dark:bg-blue-700/30 blur-2xl pointer-events-none" />
        <div className="absolute left-[-30px] bottom-[-50px] w-32 h-32 rounded-full bg-blue-200/20 dark:bg-blue-700/20 blur-xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          {/* Logo with subtle glow and transition */}
          <div className="flex items-center justify-center h-14 w-14 rounded-full bg-white/95 dark:bg-slate-900/95 shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-lg transition-all duration-300 group">
            <img
              src="/SALOGO-black.png"
              alt="Anunay Sharda & Associates Logo"
              className="h-9 w-9 object-contain transition-transform duration-300 group-hover:scale-105"
              draggable={false}
            />
          </div>

          {/* Firm Name & Tagline with improved typography */}
          <div className="flex flex-col">
            <span className="text-xl md:text-2xl font-bold text-gray-800 tracking-tight dark:text-white leading-tight tracking-tight flex items-center">
              <span className="w-1 h-6 bg-blue-500 dark:bg-blue-400 mr-3 rounded-full "></span>
              Anunay Sharda & Associates
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium flex items-center">
              <div className="h-px w-8 bg-gradient-to-r from-gray-400/0 via-gray-400 to-gray-400/0"></div>
              Project Report Creation
              <div className="h-px w-8 bg-gradient-to-r from-gray-400/0 via-gray-400 to-gray-400/0"></div>
            </span>
          </div>
        </div>

        {/* Enhanced Admin Badge with animation */}
        <AdminBadgeWithClock />
      </div>

      {/* ✅ Show loader while fetching data */}
      {isLoading ? (
        <div className="loader-container">
          <LoadingSpinner /> {/* Your loading spinner component */}
        </div>
      ) : (
        <>
          {/* ✅ Dashboard Cards */}
          <div className="mt-8">
            <div className="p-6 rounded-lg shadow-md border border-gray-900 dark:border-gray-900 dark:bg-gray-800 hover:shadow-lg transition duration-300">
              <div className="flex flex-wrap items-center gap-8">
                {/* ✅ Total Reports */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 flex items-center justify-center rounded-lg">
                    📊
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Total Reports
                    </h3>
                    <p className="text-3xl font-bold text-gray-800 dark:text-white">
                      {reports.length}
                    </p>
                  </div>
                </div>

                {/* ✅ Total Employees */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300 flex items-center justify-center rounded-lg">
                    👨‍💼
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Total Users
                    </h3>
                    <p className="text-3xl font-bold text-gray-800 dark:text-white">
                      {employees.length}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Active: {employees.filter((emp) => emp.isActive).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
