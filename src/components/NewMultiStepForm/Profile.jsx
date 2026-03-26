import { useEffect, useState } from "react";
import ChangePasswordModal from "./ChangePasswordModal";

const Profile = () => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [hardcodedAdminCredentials, setHardcodedAdminCredentials] = useState({
    username: "admin",
    password: "admin123",
  });



  const onPasswordChanged = () => {
    alert("Password changed successfully!");
    setShowPasswordModal(false);
  };

  // On component mount, check if there's a stored password
  useEffect(() => {
    const storedCredentials = localStorage.getItem("hardcodedAdminCredentials");
    if (storedCredentials) {
      setHardcodedAdminCredentials(JSON.parse(storedCredentials));
    }
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Morning";
    if (hour < 18) return "Afternoon";
    return "Evening";
  };

  return (
    <div className="flex h-[100vh] bg-gray-100">
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-3xl mx-auto my-12">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-t-2xl p-2 shadow-lg">
            <div className="flex flex-col justify-center sm:flex-row items-center gap-6">
              <div className="text-center sm:text-left py-4 px-6">
                <h2 className="text-white text-2xl font-semibold">
                  {`Good ${getGreeting()}, Admin 👋`}
                </h2>
                <p className="text-indigo-200 mt-1 text-sm sm:text-base">
                  You can securely change your password below to keep your
                  account safe.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-b-2xl shadow-xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </h3>
                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition duration-150"
                  >
                    Change Password
                  </button>

                  {showPasswordModal && (
                    <ChangePasswordModal
                      onClose={() => setShowPasswordModal(false)}
                      onSubmit={onPasswordChanged}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
