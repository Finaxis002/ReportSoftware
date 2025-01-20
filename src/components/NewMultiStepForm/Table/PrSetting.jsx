import React from "react";
import { useLocation } from "react-router-dom";


const PrSetting=()=>{
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
          Report Settings
        </h2>
        <div className="table-responsive">
          <table className="table table-striped table-bordered table-hover">
            <thead>
              <tr>
                <th className="bg-headPurple">Name</th>
                <th className="bg-headPurple">Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(formData.ProjestReportSetting).map((key) => (
                <tr key={key}>
                  <td>{key}</td>
                  <td>
                    {typeof formData.ProjestReportSetting[key] === "string"
                      ? formData.ProjestReportSetting[key]
                      : (formData.ProjestReportSetting["0"], null, 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
}


export default PrSetting;