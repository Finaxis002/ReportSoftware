import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";

const MainLogin = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState("admin");
  const [inputUsername, setInputUsername] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [captchaValue, setCaptchaValue] = useState(null);


  //for otp
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [emailForOtp, setEmailForOtp] = useState("");


  const navigate = useNavigate();
  const handleCaptchaChange = (value) => {
    setCaptchaValue(value);
  };
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


  // const handleAdminLogin = async () => {
  //   try {
  //     const response = await fetch("https://backend-three-pink.vercel.app/api/admin/login", {
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
  //       console.log("✅ Admin Login Successful (Database):", data);

  //       // ✅ Store token and userRole in localStorage
  //       localStorage.setItem("isLoggedIn", "true");
  //       localStorage.setItem("userRole", "admin");
  //       localStorage.setItem("token", data.token);
  //       localStorage.setItem("adminName", data.username);
  //       localStorage.setItem("employeeId", data.employeeId)

  //       onLogin(true, "admin");
  //       navigate("/");
  //       return; // ✅ Exit if database login succeeds
  //     }
  //   } catch (error) {
  //     console.error("🔥 Error during database login:", error);
  //   }

  //   // ✅ If database login fails, check hardcoded admin credentials
  //   if (
  //     inputUsername === hardcodedAdminCredentials.username &&
  //     inputPassword === hardcodedAdminCredentials.password
  //   ) {
  //     console.log("✅ Admin Login Successful (Hardcoded)");

  //     localStorage.setItem("isLoggedIn", "true");
  //     localStorage.setItem("userRole", "admin");
  //     localStorage.setItem("token", "hardcoded-token"); // Dummy token for consistency

  //     onLogin(true, "admin");
  //     navigate("/");
  //   } else {
  //     setError("Invalid Admin Credentials!");
  //   }
  // };

  const handleAdminLogin = async () => {
    try {
      const response = await fetch(
        "https://backend-three-pink.vercel.app/api/admin/login",
        {
          method: "POST",

          headers: { "Content-Type": "application/json" },

          body: JSON.stringify({
            username: inputUsername,
            password: inputPassword,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        console.log("✅ Employee Login Success:", data);
      
        const email = data.employee.email;
        const name = data.employee.name;
      
        const otpRes = await fetch(
          "https://backend-three-pink.vercel.app/api/send-otp",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, name }),
          }
        );
      
        if (otpRes.ok) {
          setEmailForOtp(email);
          setOtpSent(true); // This will show OTP input field
          localStorage.setItem("employeeId", data.employee.employeeId);
          localStorage.setItem("employeeName", data.employee.name);
          localStorage.setItem("employeeEmail", data.employee.email);
      
          // ❌ DO NOT set isLoggedIn or navigate here
        } else {
          setError("Failed to send OTP.");
        }
      }      

    } catch (error) {
      console.error("🔥 Error during database login:", error);
      setError("Something went wrong.");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
  
    // ✅ Verify reCAPTCHA first
    if (!captchaValue) {
      setError("Please complete the CAPTCHA.");
      return;
    }
  
    try {
      const verifyResponse = await fetch("https://backend-three-pink.vercel.app/api/verify-captcha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: captchaValue }),
      });
  
      const verifyData = await verifyResponse.json();
  
      if (!verifyData.success) {
        setError("CAPTCHA verification failed!");
        return;
      }
  
      console.log("✅ CAPTCHA verified successfully");
    } catch (err) {
      console.error("🔥 CAPTCHA verification error:", err);
      setError("CAPTCHA verification failed due to server error.");
      return;
    }
  
    // ✅ Proceed to role-based login
    if (activeTab === "employee") {
      try {
        const response = await fetch("https://backend-three-pink.vercel.app/api/employees/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            employeeId: inputUsername,
            password: inputPassword,
          }),
        });
  
        const data = await response.json();
        if (response.ok && data.success) {
          console.log("✅ Employee credentials verified:", data);
  
          const email = data.employee.email;
          const name = data.employee.name;
  
          // ✅ Send OTP to employee's email
          const otpRes = await fetch("https://backend-three-pink.vercel.app/api/send-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, name }),
          });
  
          if (otpRes.ok) {
            setEmailForOtp(email);
            setOtpSent(true);
            localStorage.setItem("employeeId", data.employee.employeeId);
            localStorage.setItem("employeeName", name);
            localStorage.setItem("employeeEmail", email);
          } else {
            setError("Failed to send OTP.");
          }
        } else {
          setError(data.error || "Invalid Employee ID or Password!");
        }
      } catch (err) {
        console.error("🔥 Error logging in employee:", err);
        setError("Server error. Please try again later.");
      }
    } else if (activeTab === "admin") {
      await handleAdminLogin(); // This should include its own flow
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
    }
  };
  
  const handleVerifyOtp = async () => {
    try {
      const res = await fetch("https://backend-three-pink.vercel.app/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailForOtp,
          otp: otpInput,
        }),
      });
  
      const result = await res.json();
      if (res.ok) {
        console.log("✅ OTP verified");
  
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userRole", "employee");
  
        onLogin(true, "employee", {
          employeeId: localStorage.getItem("employeeId"),
          employeeName: localStorage.getItem("employeeName"),
        });
  
        navigate("/");
      } else {
        setError("❌ Invalid or expired OTP");
      }
    } catch (err) {
      console.error("❌ OTP verification error:", err);
      setError("OTP verification failed.");
    }
  };
  
  console.log("Logging in with password:", inputPassword);

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

          <ReCAPTCHA
            sitekey="6LdqAgYrAAAAAMWSS3XNUV9yMPSgHwUHo3_VUduG"
            onChange={handleCaptchaChange}
            className="mb-4"
          />

          <button
            type="submit"
            className="w-full py-3 px-1 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            Login
          </button>
        </form>
      </div>

      {otpSent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
            <h2 className="text-lg font-semibold text-center mb-4">
              OTP Verification
            </h2>
            <p className="text-sm text-gray-600 mb-4 text-center">
              An OTP has been sent to your email.
            </p>
            <input
              type="text"
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value)}
              className="w-full p-2 border rounded mb-4"
              placeholder="Enter OTP"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setOtpSent(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyOtp}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Verify OTP
              </button>
            </div>
          </div>
        </div>
      )}

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
