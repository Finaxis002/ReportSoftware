import React from "react";
import { useLocation } from "react-router-dom";

const CostOfProjectTable = () => {
  const location = useLocation();
  const formData = location.state;

  // Debug: Log data to check if AccountInformation is present

  // console.log("accountInfo in BasicDetailsView:");

  // Ensure formData is valid
  if (!formData || !formData.AccountInformation) {
    return <div>No account information available</div>; // Fallback UI
  }

  return (
    <div className="w-full h-screen bg-white overflow-hidden p-8">
      <h1 className="text-center text-white font-bold text-sm uppercase mb-4 p-1 bg-blue-950">
        Cost Of Project
      </h1>
      <div className="table-responsive">
        <table className="w-full border border-gray-400 mb-6">
          <thead>
            <tr className="bg-blue-950 text-white">
              <th className="px-4 py-1 border border-black w-4">S.No.</th>
              <th className="p-1 border  border-gray-400">Particulars</th>
              <th className="p-1 border  border-gray-400">Amount</th>
            </tr>
          </thead>
          <tbody className="mb-4">
            {/* Loop through formData.CostOfProject and render each row */}
           
            {formData.CostOfProject &&
              Object.entries(formData.CostOfProject).map(
                ([key, field], index) => (
                  <tr key={key}>
                     <td className="px-4 py-1 border border-black">
                      {index + 1}
                    </td>
                    <td className="px-4 py-1 border border-black">{field.name}</td>
                    <td className="px-4 py-1 border border-black">{field.amount}</td>
                    
                  </tr>
                )
              )}
            <tr>
            <td className="px-4 py-1 border border-black"></td>
              <td className="px-4 py-1 border border-black font-bold">Total Cost of Project</td>
              <td className="px-4 py-1 border border-black font-bold">
                {/* You can add a calculated total here */}
                {Object.values(formData.CostOfProject).reduce(
                  (sum, field) => sum + field.amount,
                  0
                )}
              </td>
             
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CostOfProjectTable;
