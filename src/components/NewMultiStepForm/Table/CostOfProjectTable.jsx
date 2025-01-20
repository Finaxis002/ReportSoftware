import React from "react";
import { useLocation } from "react-router-dom";


const CostOfProjectTable=()=>{
     const location = useLocation();
        const formData = location.state;
      
        // Debug: Log data to check if AccountInformation is present
       
       
       
       
        // console.log("accountInfo in BasicDetailsView:");
      
        // Ensure formData is valid
        if (!formData || !formData.AccountInformation) {
          return <div>No account information available</div>; // Fallback UI
        }

    return(
        <div className="container container-width mt-4 bg-light px-4">
          <h2 className="py-4 text-center text-xl font-bold">
            Cost Of Project
          </h2>
          <div className="table-responsive">
            <table className="table table-striped table-bordered table-hover">
              <thead>
                <tr>
                  <th className="bg-headPurple">Name</th>
                  <th className="bg-headPurple">Amount</th>
                  <th className="bg-headPurple">Depreciation (%)</th>
                </tr>
              </thead>
              <tbody>
                {/* Loop through formData.CostOfProject and render each row */}
                {formData.CostOfProject &&
                  Object.entries(formData.CostOfProject).map(
                    ([key, field], index) => (
                      <tr key={key}>
                        <td>{field.name}</td>
                        <td>{field.amount}</td>
                        <td>{field.rate}</td>
                      </tr>
                    )
                  )}
                <tr>
                  <td className="bg-totalRed">Total Cost of Project</td>
                  <td className="bg-totalRed">
                    {/* You can add a calculated total here */}
                    {Object.values(formData.CostOfProject).reduce(
                      (sum, field) => sum + field.amount,
                      0
                    )}
                  </td>
                  <td className="bg-totalRed"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
    )
}

export default CostOfProjectTable