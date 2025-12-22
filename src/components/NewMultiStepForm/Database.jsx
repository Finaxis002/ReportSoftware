import React from "react";
import { useNavigate } from "react-router-dom";

const options = [
  {
    label: "Reports",
    path: "/reports",
    description: "View and manage all project and financial reports.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-shopping-bag">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  {
    label: "Clients",
    path: "/clients",
    description: "Access, edit, and organize all client information.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-pie-chart">
        <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
        <path d="M22 12A10 10 0 0 0 12 2v10z" />
      </svg>
    ),
  },
  {
    label: "Bank Details",
    path: "/bank-details",
    description: "Review and update all company banking information.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-file">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <line x1="10" y1="9" x2="8" y2="9" />
      </svg>
    ),
  },
];

const DatabasePage = ({ userRole }) => {
  const nav = useNavigate();

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 dark:from-[#181c21] dark:to-[#22232a]">
      <main className="flex-1 flex flex-col px-8 py-10">
        <div className="mb-8">
         
          <p className="text-gray-500 dark:text-gray-300 text-base">Central access to all master data modules.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {options.map((opt) => (
            <div
              key={opt.path}
              className="relative flex flex-col items-center text-center bg-white/70 dark:bg-[#232733]/80 backdrop-blur-[6px] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] hover:shadow-[0_12px_28px_0_rgba(31,38,135,0.19)] transition-all duration-200 hover:scale-[1.025] group min-h-[260px] p-7"
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
                onClick={() => nav(opt.path)}
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

export default DatabasePage;
