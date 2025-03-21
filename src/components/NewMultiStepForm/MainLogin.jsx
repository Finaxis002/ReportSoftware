
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const MainLogin = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState("admin");
  const [inputUsername, setInputUsername] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Fixed credentials for Admin & Client
  // const adminCredentials = { username: "admin", password: "admin123" };
  const clientCredentials = { username: "client", password: "client123" };
  const hardcodedAdminCredentials = {
    username: "admin",
    password: "admin123",
  };
  

  // ✅ Check if already logged in
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn) {
      const userRole = localStorage.getItem("userRole");
      onLogin(true, userRole);
      navigate("/");
    }
  }, [navigate, onLogin]);

//handlw admin login
  // const handleAdminLogin = async () => {
  //   try {
  //     const response = await fetch("http://localhost:5000/api/admin/login", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         username: inputUsername,
  //         password: inputPassword,
  //       }),
  //     });
  
  //     const data = await response.json();
  
  //     if (response.ok) {
  //       console.log("✅ Admin Login Successful:", data);
  
  //       // ✅ Store token and userRole in localStorage
  //       localStorage.setItem("isLoggedIn", "true");
  //       localStorage.setItem("userRole", "admin");
  //       localStorage.setItem("token", data.token);
  
  //       // ✅ Call onLogin and navigate
  //       onLogin(true, "admin");
  //       navigate("/");
  //     } else {
  //       setError(data.message || "Invalid Admin Credentials!");
  //     }
  //   } catch (error) {
  //     console.error("🔥 Error logging in admin:", error);
  //     setError("Server error. Please try again later.");
  //   }
  // };
  const handleAdminLogin = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: inputUsername,
          password: inputPassword,
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        console.log("✅ Admin Login Successful (Database):", data);
  
        // ✅ Store token and userRole in localStorage
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userRole", "admin");
        localStorage.setItem("token", data.token);
        localStorage.setItem("adminName", data.username);
        localStorage.setItem("employeeId", data.employeeId)

        onLogin(true, "admin");
        navigate("/");
        return; // ✅ Exit if database login succeeds
      }
    } catch (error) {
      console.error("🔥 Error during database login:", error);
    }
  
    // ✅ If database login fails, check hardcoded admin credentials
    if (
      inputUsername === hardcodedAdminCredentials.username &&
      inputPassword === hardcodedAdminCredentials.password
    ) {
      console.log("✅ Admin Login Successful (Hardcoded)");
  
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userRole", "admin");
      localStorage.setItem("token", "hardcoded-token"); // Dummy token for consistency
  
      onLogin(true, "admin");
      navigate("/");
    } else {
      setError("Invalid Admin Credentials!");
    }
  };
  


  // ✅ Handle Login
  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setError("");

  //   // if (activeTab === "admin") {
  //   //   // ✅ Handle Admin Login
  //   //   if (
  //   //     inputUsername === adminCredentials.username &&
  //   //     inputPassword === adminCredentials.password
  //   //   ) {
  //   //     localStorage.setItem("isLoggedIn", "true");
  //   //     localStorage.setItem("userRole", "admin");
  //   //     onLogin(true, "admin");
  //   //     navigate("/");
  //   //   } else {
  //   //     setError("Invalid Admin Credentials!");
  //   //   }
  //   // } 
  //   if (activeTab === "admin") {
  //     await handleAdminLogin(); // ✅ Use API-based login
  //   }
  //    else if (activeTab === "client") {
  //     if (
  //       inputUsername === clientCredentials.username &&
  //       inputPassword === clientCredentials.password
  //     ) {
  //       localStorage.setItem("isLoggedIn", "true");
  //       localStorage.setItem("userRole", "client");
  //       onLogin(true, "client");
  //       navigate("/");
  //     } else {
  //       setError("Invalid Client Credentials!");
  //     }
  //   } else if (activeTab === "employee") {
  //     // ✅ Handle Employee Login (from API)
  //     try {
  //       const response = await fetch(
  //         "https://backend-three-pink.vercel.app/api/employees/login",
  //         {
  //           method: "POST",
  //           headers: {
  //             "Content-Type": "application/json",
  //           },
  //           body: JSON.stringify({
  //             employeeId: inputUsername,
  //             password: inputPassword,
  //           }),
  //         }
  //       );

  //       const data = await response.json();
  //       if (response.ok && data.success) {
  //         console.log("✅ Employee Login Success:", data);

  //         localStorage.setItem("isLoggedIn", "true");
  //         localStorage.setItem("userRole", "employee");
  //         localStorage.setItem("employeeName", data.employee.name);

  //         onLogin(true, "employee", {
  //           employeeId: data.employee.employeeId,
  //           employeeName: data.employee.name,
  //           permissions: data.employee.permissions,
  //         });

  //         navigate("/");
  //       } else {
  //         setError(data.error || "Invalid Employee ID or Password!");
  //       }
  //     } catch (err) {
  //       console.error("🔥 Error logging in employee:", err);
  //       setError("Server error. Please try again later.");
  //     }
  //   }
  // };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
  
    if (activeTab === "admin") {
      await handleAdminLogin(); // ✅ Handles both database and hardcoded login
    } else if (activeTab === "client") {
      if (
        inputUsername === clientCredentials.username &&
        inputPassword === clientCredentials.password
      ) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userRole", "client");
        onLogin(true, "client");
        navigate("/");
      } else {
        setError("Invalid Client Credentials!");
      }
    } else if (activeTab === "employee") {
      try {
        const response = await fetch(
          "https://backend-three-pink.vercel.app/api/employees/login",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              employeeId: inputUsername,
              password: inputPassword,
            }),
          }
        );
  
        const data = await response.json();
        if (response.ok && data.success) {
          console.log("✅ Employee Login Success:", data);
  
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("userRole", "employee");
          localStorage.setItem("employeeName", data.employee.name);
          localStorage.setItem("employeeId", data.employee.employeeId)
  
          onLogin(true, "employee", {
            employeeId: data.employee.employeeId,
            employeeName: data.employee.name,
            permissions: data.employee.permissions,
          });
  
          navigate("/");
        } else {
          setError(data.error || "Invalid Employee ID or Password!");
        }
      } catch (err) {
        console.error("🔥 Error logging in employee:", err);
        setError("Server error. Please try again later.");
      }
    }
  };
  

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setError("");
  
  //   if (activeTab === "admin") {
  //     await handleAdminLogin(); // ✅ Use API for Admin login
  //   } else if (activeTab === "client") {
  //     if (
  //       inputUsername === clientCredentials.username &&
  //       inputPassword === clientCredentials.password
  //     ) {
  //       localStorage.setItem("isLoggedIn", "true");
  //       localStorage.setItem("userRole", "client");
  //       onLogin(true, "client");
  //       navigate("/");
  //     } else {
  //       setError("Invalid Client Credentials!");
  //     }
  //   } else if (activeTab === "employee") {
  //     try {
  //       const response = await fetch(
  //         "https://backend-three-pink.vercel.app/api/employees/login",
  //         {
  //           method: "POST",
  //           headers: {
  //             "Content-Type": "application/json",
  //           },
  //           body: JSON.stringify({
  //             employeeId: inputUsername,
  //             password: inputPassword,
  //           }),
  //         }
  //       );
  
  //       const data = await response.json();
  //       if (response.ok && data.success) {
  //         console.log("✅ Employee Login Success:", data);
  
  //         localStorage.setItem("isLoggedIn", "true");
  //         localStorage.setItem("userRole", "employee");
  //         localStorage.setItem("employeeName", data.employee.name);
  
  //         onLogin(true, "employee", {
  //           employeeId: data.employee.employeeId,
  //           employeeName: data.employee.name,
  //           permissions: data.employee.permissions,
  //         });
  
  //         navigate("/");
  //       } else {
  //         setError(data.error || "Invalid Employee ID or Password!");
  //       }
  //     } catch (err) {
  //       console.error("🔥 Error logging in employee:", err);
  //       setError("Server error. Please try again later.");
  //     }
  //   }
  // };
  

 
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      {/* ✅ Tabs */}
      <ul className="w-1/2 max-w-lg mx-auto bg-white rounded-t-lg text-teal-600 flex justify-between shadow-lg mb-4">
        <li className="nav-item flex-1">
          <a
            className={`nav-link py-3 px-1 text-sm text-center cursor-pointer text-lg font-medium ${
              activeTab === "admin"
                ? "bg-teal-500 text-white"
                : "text-teal-600 hover:bg-teal-100"
            } rounded-t-lg transition-all duration-300`}
            onClick={() => setActiveTab("admin")}
          >
            Login as Admin
          </a>
        </li>
        <li className="nav-item flex-1">
          <a
            className={`nav-link py-3 px-1 text-sm text-center cursor-pointer text-lg font-medium ${
              activeTab === "employee"
                ? "bg-teal-500 text-white"
                : "text-teal-600 hover:bg-teal-100"
            } transition-all duration-300`}
            onClick={() => setActiveTab("employee")}
          >
            Login as Employee
          </a>
        </li>
        <li className="nav-item flex-1">
          <a
            className={`nav-link py-3 px-1 text-sm text-center cursor-pointer text-lg font-medium ${
              activeTab === "client"
                ? "bg-teal-500 text-white"
                : "text-teal-600 hover:bg-teal-100"
            } transition-all duration-300`}
            onClick={() => setActiveTab("client")}
          >
            Login as Client
          </a>
        </li>
      </ul>

      {/* ✅ Login Form */}
      <div className="bg-white p-8 rounded-b-lg shadow-2xl w-full max-w-lg mx-auto">
        <h4 className="text-center text-3xl font-semibold text-teal-700 mb-6">
          {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Login
        </h4>
        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">
              {activeTab === "employee" ? "Employee ID" : "Username"}
            </label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              value={inputUsername}
              onChange={(e) => setInputUsername(e.target.value)}
              placeholder={`Enter ${activeTab} username`}
            />
          </div>

          {/* Password */}
          <div className="mb-6 relative">
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              value={inputPassword}
              onChange={(e) => setInputPassword(e.target.value)}
              placeholder="Enter password"
            />
            <button
              type="button"
              className="absolute right-3 top-7 text-teal-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁"}
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-1 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            Login
          </button>
        </form>
      </div>

      {/* ✅ Error Message */}
      {error && (
        <div className="mt-6 p-2 bg-red-100 text-red-600 rounded-lg text-center font-medium">
          {error}
        </div>
      )}
    </div>
  );
};

export default MainLogin;



////////////////////////////////////////////////////////////////////
// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";

// const MainLogin = ({ onLogin }) => {
//   const [activeTab, setActiveTab] = useState("admin");
//   const [inputUsername, setInputUsername] = useState("");
//   const [inputPassword, setInputPassword] = useState("");
//   const [error, setError] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const navigate = useNavigate();

//   // Fixed credentials for Admin & Client
//   const adminCredentials = { username: "admin", password: "admin123" };
//   const clientCredentials = { username: "client", password: "client123" };

//   // ✅ Check if already logged in
//   useEffect(() => {
//     const isLoggedIn = localStorage.getItem("isLoggedIn");
//     if (isLoggedIn) {
//       const userRole = localStorage.getItem("userRole");
//       onLogin(true, userRole);
//       navigate("/");
//     }
//   }, [navigate, onLogin]);

//   // ✅ Handle Login
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");

//     if (activeTab === "admin") {
//       // ✅ Handle Admin Login
//       if (
//         inputUsername === adminCredentials.username &&
//         inputPassword === adminCredentials.password
//       ) {
//         localStorage.setItem("isLoggedIn", "true");
//         localStorage.setItem("userRole", "admin");
//         onLogin(true, "admin");
//         navigate("/");
//       } else {
//         setError("Invalid Admin Credentials!");
//       }
//     } else if (activeTab === "client") {
//       // ✅ Handle Client Login
//       if (
//         inputUsername === clientCredentials.username &&
//         inputPassword === clientCredentials.password
//       ) {
//         localStorage.setItem("isLoggedIn", "true");
//         localStorage.setItem("userRole", "client");
//         onLogin(true, "client");
//         navigate("/");
//       } else {
//         setError("Invalid Client Credentials!");
//       }
//     } else if (activeTab === "employee") {
//       // ✅ Handle Employee Login (from API)
//       try {
//         const response = await fetch(
//           "https://backend-three-pink.vercel.app/api/employees/login",
//           {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//             },
//             body: JSON.stringify({
//               employeeId: inputUsername,
//               password: inputPassword,
//             }),
//           }
//         );

//         const data = await response.json();
//         if (response.ok && data.success) {
//           console.log("✅ Employee Login Success:", data);

//           localStorage.setItem("isLoggedIn", "true");
//           localStorage.setItem("userRole", "employee");
//           localStorage.setItem("employeeName", data.employee.name);

//           onLogin(true, "employee", {
//             employeeId: data.employee.employeeId,
//             employeeName: data.employee.name,
//             permissions: data.employee.permissions,
//           });

//           navigate("/");
//         } else {
//           setError(data.error || "Invalid Employee ID or Password!");
//         }
//       } catch (err) {
//         console.error("🔥 Error logging in employee:", err);
//         setError("Server error. Please try again later.");
//       }
//     }
//   };

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
//       {/* ✅ Tabs */}
//       <ul className="w-1/2 max-w-lg mx-auto bg-white rounded-t-lg text-teal-600 flex justify-between shadow-lg mb-4">
//         <li className="nav-item flex-1">
//           <a
//             className={`nav-link py-3 px-1 text-sm text-center cursor-pointer text-lg font-medium ${
//               activeTab === "admin"
//                 ? "bg-teal-500 text-white"
//                 : "text-teal-600 hover:bg-teal-100"
//             } rounded-t-lg transition-all duration-300`}
//             onClick={() => setActiveTab("admin")}
//           >
//             Login as Admin
//           </a>
//         </li>
//         <li className="nav-item flex-1">
//           <a
//             className={`nav-link py-3 px-1 text-sm text-center cursor-pointer text-lg font-medium ${
//               activeTab === "employee"
//                 ? "bg-teal-500 text-white"
//                 : "text-teal-600 hover:bg-teal-100"
//             } transition-all duration-300`}
//             onClick={() => setActiveTab("employee")}
//           >
//             Login as Employee
//           </a>
//         </li>
//         <li className="nav-item flex-1">
//           <a
//             className={`nav-link py-3 px-1 text-sm text-center cursor-pointer text-lg font-medium ${
//               activeTab === "client"
//                 ? "bg-teal-500 text-white"
//                 : "text-teal-600 hover:bg-teal-100"
//             } transition-all duration-300`}
//             onClick={() => setActiveTab("client")}
//           >
//             Login as Client
//           </a>
//         </li>
//       </ul>

//       {/* ✅ Login Form */}
//       <div className="bg-white p-8 rounded-b-lg shadow-2xl w-full max-w-lg mx-auto">
//         <h4 className="text-center text-3xl font-semibold text-teal-700 mb-6">
//           {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Login
//         </h4>
//         <form onSubmit={handleSubmit}>
//           {/* Username */}
//           <div className="mb-6">
//             <label className="block text-sm font-medium text-gray-700">
//               {activeTab === "employee" ? "Employee ID" : "Username"}
//             </label>
//             <input
//               type="text"
//               className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
//               value={inputUsername}
//               onChange={(e) => setInputUsername(e.target.value)}
//               placeholder={`Enter ${activeTab} username`}
//             />
//           </div>

//           {/* Password */}
//           <div className="mb-6 relative">
//             <label className="block text-sm font-medium text-gray-700">
//               Password
//             </label>
//             <input
//               type={showPassword ? "text" : "password"}
//               className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
//               value={inputPassword}
//               onChange={(e) => setInputPassword(e.target.value)}
//               placeholder="Enter password"
//             />
//             <button
//               type="button"
//               className="absolute right-3 top-7 text-teal-600"
//               onClick={() => setShowPassword(!showPassword)}
//             >
//               {showPassword ? "🙈" : "👁"}
//             </button>
//           </div>

//           <button
//             type="submit"
//             className="w-full py-3 px-1 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
//           >
//             Login
//           </button>
//         </form>
//       </div>

//       {/* ✅ Error Message */}
//       {error && (
//         <div className="mt-6 p-2 bg-red-100 text-red-600 rounded-lg text-center font-medium">
//           {error}
//         </div>
//       )}
//     </div>
//   );
// };

// export default MainLogin;