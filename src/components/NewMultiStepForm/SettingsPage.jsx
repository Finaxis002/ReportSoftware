import React from "react";
import { useNavigate } from "react-router-dom";
import MenuBar from "./MenuBar"; // If you want sidebar here

const settingsOptions = [
  {
    label: "User",
    path: "/employees",
    description: "Manage user settings, permissions, and preferences.",
    icon: (
      <svg width="38" height="38" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-user" viewBox="0 0 24 24">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  {
    label: "Admin",
    path: "/admin",
    description: "Configure admin options and advanced features.",
    icon: (
      <svg width="38" height="38" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-shield" viewBox="0 0 24 24">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
];

const SettingsPage = ({ userRole }) => {
  const nav = useNavigate();

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 dark:from-[#181c21] dark:to-[#22232a]">
      <MenuBar userRole={userRole} />
      <main className="flex-1 flex flex-col px-8 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-neutral-800 dark:text-white mb-2">Settings</h2>
          <p className="text-gray-500 dark:text-gray-300 text-base">Manage user and admin configurations from here.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {settingsOptions.map((opt) => (
            <div
              key={opt.path}
              className="relative flex flex-col items-center text-center bg-white/70 dark:bg-[#232733]/80 backdrop-blur-[6px] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] hover:shadow-[0_12px_28px_0_rgba(31,38,135,0.19)] transition-all duration-200 hover:scale-[1.025] group min-h-[220px] p-7"
              onClick={() => nav(opt.path)}
              style={{ cursor: "pointer" }}
            >
              <div className="mb-5">
                <span className="inline-flex items-center justify-center rounded-xl bg-neutral-100 dark:bg-[#232733] border border-slate-200 dark:border-slate-700 shadow w-16 h-16 group-hover:bg-blue-50 group-hover:border-blue-400 transition-colors duration-200">
                  <span className="text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-150">{opt.icon}</span>
                </span>
              </div>
              <div className="text-xl font-semibold text-neutral-800 dark:text-white mb-2">{opt.label}</div>
              <div className="text-gray-500 dark:text-gray-300 text-sm mb-4 px-2">{opt.description}</div>
              <button
                className="mt-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1"
                onClick={(e) => { e.stopPropagation(); nav(opt.path); }}
              >
                Enter
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
