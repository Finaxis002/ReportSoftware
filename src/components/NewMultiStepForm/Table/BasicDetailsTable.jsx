import React from "react";
import { useLocation } from "react-router-dom"; // Import useLocation

const BasicDetailsTable = () => {
  const location = useLocation();
  const formData = location.state;
   
    
  // Debug: Log data to check if AccountInformation is present
  console.log("accountInfo in BasicDetailsView:");

  // Ensure formData is valid
  if (!formData || !formData.AccountInformation) {
    return <div>No account information available</div>; // Fallback UI
  }

  return (
    <div className="container container-width mt-4 bg-light px-4">
      <h2 className="py-4 text-center text-4xl">PROJECT SYNOPSIS</h2>
      <div className="table-responsive">
        <table className="table table-striped table-bordered table-hover">
          <thead>
            <tr>
              <th className="bg-headPurple">Particulars</th>
              <th className="bg-headPurple">Details</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(formData.AccountInformation).map(
              ([key, value], index) => (
                <tr key={index}>
                  <td>{key}</td>
                  <td>
                    {key === "allPartners" ? (
                      // Rendering partner details in a row-wise format
                     <div>
                       <table style={{ width: "100%" }}>
                        <thead>
                          <tr>
                            <th className="bg-headPurple">Partner Name</th>
                            <th className="bg-headPurple">Partner Aadhar</th>
                            <th className="bg-headPurple">Partner DIN</th>
                          </tr>
                        </thead>
                        <tbody>
                          {value.map((partner, idx) => (
                            <tr key={idx}>
                              <td>{partner.partnerName}</td>
                              <td>{partner.partnerAadhar}</td>
                              <td>{partner.partnerDin}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                     </div>
                    ) : // For other fields, render the value directly
                    typeof value === "object" ? (
                      JSON.stringify(value)
                    ) : (
                      value
                    )}
                  </td>
                </tr>
              )
            )}
          </tbody>

          {/* <code>{JSON.stringify(formData.AccountInformation, null, 2)}</code> */}
        </table>
      </div>
    </div>
  );
};

export default BasicDetailsTable;
