import React, { useState } from "react";
import { useLocation } from "react-router-dom";

const MoreDetailsTable = () => {
  const location = useLocation();
  const { MoreDetails } = location.state || {}; // Ensure state exists

  const [localData, setLocalData] = useState(() => {
    const savedData = localStorage.getItem("FourthStepPRS");

    // Parse and return saved data if it exists, otherwise use the default structure
    return savedData
      ? JSON.parse(savedData)
      : {
          ProjectionYears: {
            name: "Projection Years",
            id: "ProjectionYears",
            value: "",
            isCustom: false,
          },
        };
  });

  const [projectionYears, setProjectionYears] = useState(
    localData.ProjectionYears || 0
  ); // Default to 5 years

  return (
    <div className="container-width">
      <h2 className="py-4 text-center text-xl font-bold">More Details</h2>
      <div className="table-responsive mb-4">
        {/* stock table */}
        <h3>Stocks Data</h3>

        <div className="table-responsive">
          <table className="table table-striped table-bordered table-hover">
            <thead>
              <tr>
                <th className="bg-headPurple">Index</th>
                <th className="bg-headPurple">Particular</th>
                {[...Array(parseInt(projectionYears))].map((_, index) => (
                  <th key={index} className="bg-headPurple">
                    Year {index + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MoreDetails.StockValues &&
                Array.isArray(MoreDetails.StockValues) &&
                MoreDetails.StockValues.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.particular}</td>
                    {/* Map through the years for each item and display each year in a separate column */}
                    {[...Array(parseInt(projectionYears))].map(
                      (_, yearIndex) => (
                        <td key={yearIndex}>
                          {item.years && item.years[yearIndex]
                            ? item.years[yearIndex]
                            : "0"}
                        </td>
                      )
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* currentLiabilities table  */}
        <h3>current Liabilities</h3>
        <div className="table-responsive">
          <table className="table table-striped table-bordered table-hover">
            <thead>
              <tr>
                <th className="bg-headPurple">Index</th>
                <th className="bg-headPurple">Particular</th>
                {[...Array(parseInt(projectionYears))].map((_, index) => (
                  <th key={index} className="bg-headPurple">
                    Year {index + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MoreDetails.currentLiabilities &&
                Array.isArray(MoreDetails.currentLiabilities) &&
                MoreDetails.currentLiabilities.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.particular}</td>
                    {/* Map through the years for each item and display each year in a separate column */}
                    {[...Array(parseInt(projectionYears))].map(
                      (_, yearIndex) => (
                        <td key={yearIndex}>
                          {item.years && item.years[yearIndex]
                            ? item.years[yearIndex]
                            : "0"}
                        </td>
                      )
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* current Assets table  */}
        <h3>current Assets</h3>
        <div className="table-responsive">
          <table className="table table-striped table-bordered table-hover">
            <thead>
              <tr>
                <th className="bg-headPurple">Index</th>
                <th className="bg-headPurple">Particular</th>
                {[...Array(parseInt(projectionYears))].map((_, index) => (
                  <th key={index} className="bg-headPurple">
                    Year {index + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MoreDetails.currentAssets &&
                Array.isArray(MoreDetails.currentAssets) &&
                MoreDetails.currentAssets.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.particular}</td>
                    {/* Map through the years for each item and display each year in a separate column */}
                    {[...Array(parseInt(projectionYears))].map(
                      (_, yearIndex) => (
                        <td key={yearIndex}>
                          {item.years && item.years[yearIndex]
                            ? item.years[yearIndex]
                            : "0"}
                        </td>
                      )
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
      <pre>{JSON.stringify(MoreDetails, null, 2)}</pre>
    </div>
  );
};

export default MoreDetailsTable;

//  <div className="container mt-4 bg-light px-4">
//         <h2 className="py-4 text-center text-xl font-bold">More Details</h2>
//         <p className="py-4 text-center">Current Liabilities</p>
//         <div className="table-responsive">
//           <table className="table table-striped table-bordered table-hover">
//             <thead>
//               <tr>
//                 <th className="bg-headPurple">Index</th>
//                 <th className="bg-headPurple">Particular</th>
//                 <th className="bg-headPurple">Years</th>
//               </tr>
//             </thead>
//             <tbody>
//               {formData.MoreDetails.currentLiabilities &&
//                 Array.isArray(formData.MoreDetails.currentLiabilities) &&
//                 formData.MoreDetails.currentLiabilities.map((item, index) => (
//                   <tr key={index}>
//                     <td>{index + 1}</td>
//                     <td>{item.particular}</td>
//                     <td>
//                       {item.years && item.years.length > 0
//                         ? item.years.join(", ")
//                         : "No data"}
//                     </td>
//                   </tr>
//                 ))}
//             </tbody>
//           </table>
//         </div>

//         <p className="py-4 text-center">Current Assets</p>
//         <div className="table-responsive">
//           <table className="table table-striped table-bordered table-hover">
//             <thead>
//               <tr>
//                 <th className="bg-headPurple">Index</th>
//                 <th className="bg-headPurple">Particular</th>
//                 <th className="bg-headPurple">Years</th>
//               </tr>
//             </thead>
//             <tbody>
//               {formData.MoreDetails.currentAssets &&
//                 Array.isArray(formData.MoreDetails.currentAssets) &&
//                 formData.MoreDetails.currentAssets.map((item, index) => (
//                   <tr key={index}>
//                     <td>{index + 1}</td>
//                     <td>{item.particular}</td>
//                     <td>
//                       {item.years && item.years.length > 0
//                         ? item.years.join(", ")
//                         : "No data"}
//                     </td>
//                   </tr>
//                 ))}
//             </tbody>
//           </table>
//         </div>

//         <p className="py-4 text-center">Stocks</p>
//         <div className="table-responsive">
//           <table className="table table-striped table-bordered table-hover">
//             <thead>
//               <tr>
//                 <th className="bg-headPurple">Index</th>
//                 <th className="bg-headPurple">Particular</th>
//                 <th className="bg-headPurple">Years</th>
//               </tr>
//             </thead>
//             <tbody>
//               {formData.MoreDetails.StockValues &&
//                 Array.isArray(formData.MoreDetails.StockValues) &&
//                 formData.MoreDetails.StockValues.map((item, index) => (
//                   <tr key={index}>
//                     <td>{index + 1}</td>
//                     <td>{item.particular}</td>
//                     <td>
//                       {item.years && item.years.length > 0
//                         ? item.years.join(", ")
//                         : "No data"}
//                     </td>
//                   </tr>
//                 ))}

//               {/* {formData.MoreDetails.stocks &&
//               formData.MoreDetails.stocks.length > 0 ? (
//                 formData.MoreDetails.stocks.map((item, index) => {

//                   return (
//                     <tr key={index}>
//                       <td>{index + 1}</td>
//                       <td>{item.particular}</td>
//                       <td>
//                         {item.years && item.years.length > 0
//                           ? item.years.join(", ")
//                           : "No data"}
//                       </td>
//                     </tr>
//                   );
//                 })
//               ) : (
//                 <tr>
//                   <td colSpan="3">No stocks data available</td>
//                 </tr>
//               )} */}
//             </tbody>
//           </table>
//         </div>
//       </div>
