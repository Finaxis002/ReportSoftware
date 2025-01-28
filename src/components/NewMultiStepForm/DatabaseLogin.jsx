import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const DatabaseLogin = ({ onLogin }) =>{
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
  
    const handleSubmit = (e) => {
      e.preventDefault();
  
      // Hardcoded credentials for example purposes
      const correctUsername = "admin";
      const correctPassword = "Admin@123";
  
      if (username === correctUsername && password === correctPassword) {
        onLogin(true); // Successfully logged in
        navigate("/database");
      } else {
        setError("Invalid username or password.");
      }
    };
  
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded shadow-lg w-96">
          <h2 className="text-center text-2xl font-semibold text-purple-800 mb-4">Login</h2>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700" htmlFor="username">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  };

  
  export default DatabaseLogin;