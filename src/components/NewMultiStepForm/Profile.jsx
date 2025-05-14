import React, { useEffect, useState, useMemo } from "react";
import MenuBar from "./MenuBar";
import Select from "react-select";
import Header from "./Header";
import { useNavigate } from "react-router-dom";

const AdminProfile = () => {
  const navigate = useNavigate();

  const renderMenuBar = () => {
    const authRole = localStorage.getItem("userRole");
    if (!authRole) {
      navigate("/login");
      return null;
    }

    switch (authRole) {
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
    <div className="flex h-[100vh] bg-gray-100">
      {renderMenuBar()}
      <div className="flex-1 p-8 overflow-auto">
        <Header dashboardType="Admin Dashboard" />

        {/* Dummy Profile Card */}
        <div className="max-w-2xl mx-auto mt-8 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
            Admin Profile
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-500 text-sm">Name</p>
              <p className="text-lg font-medium">Mr. Rajendra Kumar Mehta</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Email</p>
              <p className="text-lg font-medium">admin@example.com</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Business Name</p>
              <p className="text-lg font-medium">
                M/s. Imperialscape Developers Pvt. Ltd
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Phone</p>
              <p className="text-lg font-medium">+91 9829070283</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-gray-500 text-sm">Address</p>
              <p className="text-lg font-medium">
                Shop No 1, Banjara Basti, Kotra, Ajmer, Rajasthan - 305001
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Pincode</p>
              <p className="text-lg font-medium">305001</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Industry Type</p>
              <p className="text-lg font-medium">Services</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
