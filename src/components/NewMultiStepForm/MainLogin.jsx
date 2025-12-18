import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";




const MainLogin = ({ onLogin }) => {
  const BASE_URL = process.env.REACT_APP_BASE_URL || 'https://reportsbe.sharda.co.in';
  const [activeTab, setActiveTab] = useState("admin");
  const [inputUsername, setInputUsername] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [captchaValue, setCaptchaValue] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [captchaToken, setCaptchaToken] = useState(null);
  const [captchaTimestamp, setCaptchaTimestamp] = useState(null);
  const recaptchaRef = useRef(null);

  const navigate = useNavigate();

  // Fixed credentials for Admin & Client
  // const adminCredentials = { username: "admin", password: "admin123" };
  const clientCredentials = { username: "client", password: "client123" };
  const hardcodedAdminCredentials = {
    username: "admin",
    password: "admin123",
  };

  // ✅ Check if already logged in
  // useEffect(() => {
  //   const isLoggedIn = localStorage.getItem("isLoggedIn");
  //   if (isLoggedIn) {
  //     const userRole = localStorage.getItem("userRole");
  //     onLogin(true, userRole);
  //     navigate("/");
  //   }
  // }, [navigate, onLogin]);
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const loginTime = localStorage.getItem("loginTime");

    if (isLoggedIn && loginTime) {
      const now = new Date().getTime();
      const elapsed = now - parseInt(loginTime);

      const maxSessionTime = 10 * 60 * 60 * 1000; // 10 hours in milliseconds

      if (elapsed >= maxSessionTime) {
        // Auto-logout
        localStorage.clear();
        navigate("/login"); // or navigate("/") depending on your route
        return;
      }

      // ✅ Still valid - start timeout to auto-logout after remaining time
      const remainingTime = maxSessionTime - elapsed;
      const timeout = setTimeout(() => {
        localStorage.clear();
        navigate("/login");
      }, remainingTime);

      const userRole = localStorage.getItem("userRole");
      onLogin(true, userRole);

      // ✅ Cleanup on component unmount
      return () => clearTimeout(timeout);
    }
  }, [navigate, onLogin]);

  const handleCaptchaChange = (value) => {
    setCaptchaValue(value);
    setCaptchaToken(value);
    setCaptchaTimestamp(Date.now());
  };

  useEffect(() => {
    if (captchaTimestamp && Date.now() - captchaTimestamp > 60000) {
      // Invalidate if > 1 minute
      setCaptchaToken(null);
      setCaptchaValue(null);
      setCaptchaTimestamp(null);
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
    }
  }, [activeTab]);

  const handleAdminLogin = async () => {
    const loginTime = new Date().getTime();

    // 1️⃣ Try Main Admin Login API (Admin collection)
    try {
      const response = await fetch(
        `${BASE_URL}/api/admin/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: inputUsername,
            password: inputPassword,
          }),
        }
      );

      const data = await response.json();

      const loginTime = new Date().getTime();

      // ✅ Store token and userRole in localStorage

      if (response.ok) {
        console.log("✅ Admin Login Successful (Admin collection):", data);
        localStorage.setItem("adminType", "manual");
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userRole", "admin");
        localStorage.setItem("token", data.token);
        localStorage.setItem("adminName", data.username);

        localStorage.setItem("employeeId", data.employeeId);

        localStorage.setItem("loginTime", loginTime.toString());
        sessionStorage.setItem("justLoggedIn", "true");

        onLogin(true, "admin");
        navigate("/");
        return;
      }
    } catch (error) {
      console.error("🔥 Error during main admin login:", error);
    }

    // 2️⃣ Try Fallback Login API (MainAdminPassword collection)
    try {
      const fallbackResponse = await fetch(
        `${BASE_URL}/api/admin/hardcoded-login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: inputUsername,
            password: inputPassword,
          }),
        }
      );

      const fallbackData = await fallbackResponse.json();

      if (fallbackResponse.ok && fallbackData.success) {
        localStorage.setItem("adminType", "main");
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userRole", "admin");
        localStorage.setItem("token", fallbackData.token);
        localStorage.setItem("adminName", fallbackData.username);
        localStorage.setItem("loginTime", loginTime.toString());
        sessionStorage.setItem("justLoggedIn", "true");

        onLogin(true, "admin");
        navigate("/");
      } else {
        setError(fallbackData.error || "Invalid Admin Credentials!");
      }
    } catch (err) {
      console.error("🔥 Error in fallback admin login:", err);
      setError("Server error during fallback admin login.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (activeTab === "employee") {
      if (!otpSent) {
        // ✅ STEP 1: CAPTCHA verification BEFORE OTP
        if (!captchaToken) {
          setError("Please complete the CAPTCHA.");
          return;
        }

        try {
          const verifyResponse = await fetch(
            `${BASE_URL}/api/verify-captcha`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token: captchaToken }),
            }
          );

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

        // ✅ STEP 2: Send OTP
        const sendOtpRes = await fetch(
          `${BASE_URL}/api/otp/send-otp`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ employeeId: inputUsername }),
          }
        );

        const sendData = await sendOtpRes.json();
        if (sendOtpRes.ok) {
          setOtpSent(true);
          setCaptchaValue(null); // clear used token
          setError("OTP sent! Please enter it below.");
        } else {
          setError(sendData.error || "Failed to send OTP");
        }

        return;
      }

      // ✅ STEP 3: Verify OTP
      const verifyRes = await fetch(
        `${BASE_URL}/api/otp/verify-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ employeeId: inputUsername, otp: otpValue }),
        }
      );

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        setError(verifyData.error || "Invalid OTP");
        return;
      }

      // ✅ STEP 4: Final login
      const loginRes = await fetch(
        `${BASE_URL}/api/employees/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            employeeId: inputUsername,
            password: inputPassword,
          }),
        }
      );

      const loginData = await loginRes.json();
      if (loginRes.ok && loginData.success) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userRole", "employee");
        localStorage.setItem("employeeName", loginData.employee.name);
        localStorage.setItem("employeeId", loginData.employee.employeeId);
        localStorage.setItem("loginTime", new Date().getTime().toString()); // ✅ Add this line
        sessionStorage.setItem("justLoggedIn", "true");
        onLogin(true, "employee");
        navigate("/");
      } else {
        setError(loginData.error || "Login failed");
      }

      return;
    }

    // ✅ For Admin Login
    if (activeTab === "admin") {
      if (!captchaToken) {
        setError("Please complete the CAPTCHA.");
        return;
      }

      try {
        const verifyResponse = await fetch(
          `${BASE_URL}/api/verify-captcha`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: captchaToken }),
          }
        );

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

      await handleAdminLogin();
      return;
    }

    // ✅ For Client Login
    if (activeTab === "client") {
      if (!captchaToken) {
        setError("Please complete the CAPTCHA.");
        return;
      }

      try {
        const verifyResponse = await fetch(
          `${BASE_URL}/api/verify-captcha`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: captchaToken }),
          }
        );

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

      if (
        inputUsername === clientCredentials.username &&
        inputPassword === clientCredentials.password
      ) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userRole", "client");
        localStorage.setItem("loginTime", new Date().getTime().toString());

        onLogin(true, "client");
        navigate("/");
      } else {
        setError("Invalid Client Credentials!");
      }
    }
  };

  console.log("Logging in with password:", inputPassword);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="flex flex-col items-center mt-10 mb-6 select-none animate-fade-in">
        <div className="flex  items-center gap-2 group">
          {/* Logo Container with subtle shine effect */}
          <div className="relative p-1 rounded-full bg-gradient-to-br from-teal-100/30 to-white shadow-lg ring-1 ring-teal-100/50">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/80 to-transparent opacity-70"></div>
            {/* <img
              src="/SALOGO-teal.png" // or your ASA logo path`````
              alt="ASA Logo"
              className="h-16 w-16 object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </div> */}

          {/* Text Content */}

          {/* teal  */}
          {/* <div className="text-center space-y-1">
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
              <span className="bg-gradient-to-r from-teal-600 to-teal-400 bg-clip-text text-transparent">
                Anunay Sharda Associates
              </span>
            </h1>
            <div className="flex items-center justify-center gap-2">
              <div className="h-px w-8 bg-gradient-to-r from-teal-400/0 via-teal-400 to-teal-400/0"></div>
              <p className="text-sm font-medium text-teal-500/90 tracking-wider">
                Empowering Businesses with Trust &amp; Excellence
              </p>
              <div className="h-px w-8 bg-gradient-to-r from-teal-400/0 via-teal-400 to-teal-400/0"></div>
            </div>
          </div> */}

           <img
              src="/SALOGO-black.png" // or your ASA logo path
              alt="ASA Logo"
              className="h-16 w-16 object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </div>


          <div className="text-center space-y-1">
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
              <span className="bg-gradient-to-r from-gray-700 to-gray-500 bg-clip-text text-transparent">
                Anunay Sharda & Associates
              </span>
            </h1>
            <div className="flex items-center justify-center gap-2">
              <div className="h-px w-8 bg-gradient-to-r from-gray-400/0 via-gray-400 to-gray-400/0"></div>
              <p className="text-sm font-medium text-gray-500/90 tracking-wider">
                Empowering Businesses with Trust &amp; Excellence
              </p>
              <div className="h-px w-8 bg-gradient-to-r from-gray-400/0 via-gray-400 to-gray-400/0"></div>
            </div>
          </div> 

          
        </div>
      </div>

      {/* ✅ Tabs */}
      <ul className="w-1/2 max-w-lg mx-auto bg-white rounded-t-lg text-teal-600 flex justify-between shadow-lg">
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
            Login as Users
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
      <div className="bg-white p-4 rounded-b-lg shadow-2xl w-full max-w-lg mx-auto">
        <h4 className="text-center text-3xl font-semibold text-teal-700 mb-6">
          {activeTab === "employee"
            ? "User"
            : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}{" "}
          Login
        </h4>
        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              {activeTab === "employee" ? "User ID" : " Username"}
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
          <div className="mb-4 relative">
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

          {activeTab === "employee" && otpSent && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Enter OTP
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded-lg"
                value={otpValue}
                onChange={(e) => setOtpValue(e.target.value)}
                placeholder="Enter OTP sent to email"
              />
            </div>
          )}

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
