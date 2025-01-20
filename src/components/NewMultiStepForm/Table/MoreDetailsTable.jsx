import React from "react";
import { useLocation } from "react-router-dom";

const MoreDetailsTable = () => {
  const location = useLocation();
  const formData = location.state;

  if (!formData || !formData.AccountInformation) {
    return <div>No account information available</div>;
  }

  return (
    <div className="container-width">
      <div className="container mt-4 bg-light px-4">
        <h2 className="py-4 text-center text-xl font-bold">More Details</h2>
        <p className="py-4 text-center">Current Liabilities</p>
        <div className="table-responsive">
          <table className="table table-striped table-bordered table-hover">
            <thead>
              <tr>
                <th className="bg-headPurple">Index</th>
                <th className="bg-headPurple">Particular</th>
                <th className="bg-headPurple">Years</th>
              </tr>
            </thead>
            <tbody>
              {formData.MoreDetails.currentLiabilities &&
                Array.isArray(formData.MoreDetails.currentLiabilities) &&
                formData.MoreDetails.currentLiabilities.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.particular}</td>
                    <td>
                      {item.years && item.years.length > 0
                        ? item.years.join(", ")
                        : "No data"}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <p className="py-4 text-center">Current Assets</p>
        <div className="table-responsive">
          <table className="table table-striped table-bordered table-hover">
            <thead>
              <tr>
                <th className="bg-headPurple">Index</th>
                <th className="bg-headPurple">Particular</th>
                <th className="bg-headPurple">Years</th>
              </tr>
            </thead>
            <tbody>
              {formData.MoreDetails.currentAssets &&
                Array.isArray(formData.MoreDetails.currentAssets) &&
                formData.MoreDetails.currentAssets.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.particular}</td>
                    <td>
                      {item.years && item.years.length > 0
                        ? item.years.join(", ")
                        : "No data"}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MoreDetailsTable;
