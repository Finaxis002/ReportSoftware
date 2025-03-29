import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const EditAdminModal = ({
  updatedName,
  setUpdatedName,
  updatedPassword,
  setUpdatedPassword,
  showPassword,
  setShowPassword,
  roles,
  handleCheckboxChange,
  handleEdit,
  editingAdmin,
  setIsModalOpen,
  caSign,
  setCaSign,
  fileName,
  setFileName,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-md flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-xl w-[420px] shadow-lg flex flex-col gap-4 font-poppins">
        <input
          type="text"
          value={updatedName}
          onChange={(e) => setUpdatedName(e.target.value)}
          placeholder="Username"
          className="p-3 rounded-lg border border-gray-300 text-base w-full outline-none focus:border-green-500"
        />

        <div className="flex flex-col gap-1">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setCaSign(file);
                setFileName(file.name);
              }
            }}
            className="p-2 rounded-lg border border-gray-300 text-base w-full"
          />
          {fileName && <span className="text-xs text-gray-600">{fileName}</span>}
          {caSign && (
            <div className="mt-2 flex items-center gap-2">
              {typeof caSign === "string" ? (
                <img
                  src={caSign}
                  alt="CA Sign"
                  className="w-12 h-12 object-cover rounded border"
                />
              ) : (
                <span className="text-sm">{caSign.name}</span>
              )}
            </div>
          )}
        </div>

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={updatedPassword}
            onChange={(e) => setUpdatedPassword(e.target.value)}
            placeholder="New password"
            className="p-3 rounded-lg border border-gray-300 text-base w-full pr-10"
          />
          <FontAwesomeIcon
            icon={showPassword ? faEyeSlash : faEye}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
          />
        </div>

        <div className="flex flex-col gap-2 text-left mt-2">
          {Object.keys(roles).map((role) => (
            <label key={role} className="flex items-center gap-2 text-gray-700">
              <input
                type="checkbox"
                name={role}
                checked={roles[role]}
                onChange={handleCheckboxChange}
              />
              {role}
            </label>
          ))}
        </div>

        <button
          onClick={() => handleEdit(editingAdmin)}
          className="bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 font-medium mt-2"
        >
          Save
        </button>
        <button
          onClick={() => setIsModalOpen(false)}
          className="bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default EditAdminModal;
