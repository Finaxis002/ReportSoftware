import React, {useState} from "react";
import { useLocation } from "react-router-dom";
import { Document, Page, Text, StyleSheet, View } from "@react-pdf/renderer";


const DepreciationTable = () => {
  const location = useLocation();
  const formData = location.state;
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

  const [projectionYears, setProjectionYears] = useState(localData.ProjectionYears || 5); // Default to 5 years



  // Ensure formData is valid
  if (!formData || !formData.CostOfProject) {
    return <div>No cost of project information available</div>; // Fallback UI
  }

  // Helper function to calculate depreciation for a given amount and rate over 5 years
  const calculateDepreciation = (amount, rate, years) => {
    let depreciation = [];
    let cumulativeDepreciation = 0;
  
    for (let year = 1; year <= years; year++) {
      const depreciationThisYear = amount * (rate / 100);
      cumulativeDepreciation += depreciationThisYear;
      depreciation.push({
        year: year,
        depreciationAmount: depreciationThisYear.toFixed(2),
        cumulativeDepreciation: cumulativeDepreciation.toFixed(2),
        remainingValue: amount.toFixed(2),
      });
      amount -= depreciationThisYear; // Subtract depreciation from the amount for next year
    }
  
    return depreciation;
  };
  
  const columnCount = projectionYears + 3; // Assuming base columns + projection years

  // Function to return class name based on the number of projection years
  const turnery = (projectionYears) => {
    console.log('Projection years:', projectionYears); // Debugging
    return projectionYears >= 8 ? 'transform-table' : ''; 
  };
  
  // Function to return styles based on projection years
  const dynamicStyle = (projectionYears) => {
    console.log('Projection years for style:', projectionYears); // Debugging
    return projectionYears >= 8
      ? { transform: 'scale(0.48)' }
      : {}; 
  };

  return (
    <div className="mt-4 bg-light px-4">
      <h2 className="py-4 text-center text-xl font-bold">
        Calculation of Depreciation
      </h2>
      {/* Gross Fixed Asset Table */}
      <div className="table-div">
        <h3>Gross Fixed Asset</h3>
        <table className={`table-container ${turnery(projectionYears)}`} style={dynamicStyle(projectionYears)}>
          <thead>
            <tr>
              <th className="bg-headPurple">Name</th>
              <th className="bg-headPurple">Amount</th>
              <th className="bg-headPurple">Rate (%)</th>
              {[...Array(parseInt(projectionYears))].map((_, index) => (
                <th key={index} className="bg-headPurple">
                  Year {index + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
          {formData.CostOfProject &&
              Object.entries(formData.CostOfProject).map(([key, field]) => {
                const depreciationData = calculateDepreciation(
                  field.amount,
                  field.rate,
                  projectionYears
                );

                return (
                  <tr key={key}>
                    <td>{field.name}</td>
                    <td>{field.amount}</td>
                    <td>{field.rate}%</td>
                    {depreciationData.map((data, idx) => (
                      <td key={idx}>{data.cumulativeDepreciation}</td>
                    ))}
                  </tr>
                );
              })}
            {/* Total Row */}
            <tr>
              <td className="bg-totalRed">Total</td>
              <td className="bg-totalRed">
                {/* Calculate total amount of the project */}
                {Object.values(formData.CostOfProject).reduce(
                  (sum, field) => sum + field.amount,
                  0
                )}
              </td>
             
            </tr>
          </tbody>
        </table>
      </div>
      {/* depreciation table */}
      <div className="table-div" >
        <h3>Depreciationn</h3>
        <table className={`table-container ${turnery(projectionYears)}`} style={dynamicStyle(projectionYears)}>
          <thead>
            <tr>
              <th className="bg-headPurple">Name</th>
              <th className="bg-headPurple">Amount</th>
              <th className="bg-headPurple">Rate (%)</th>
              {[...Array(parseInt(projectionYears))].map((_, index) => (
                <th key={index} className="bg-headPurple">
                  Year {index + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
          {formData.CostOfProject &&
              Object.entries(formData.CostOfProject).map(([key, field]) => {
                const depreciationData = calculateDepreciation(
                  field.amount,
                  field.rate,
                  projectionYears
                );

                return (
                  <tr key={key}>
                    <td>{field.name}</td>
                    <td>{field.amount}</td>
                    <td>{field.rate}%</td>
                    {depreciationData.map((data, idx) => (
                      <td key={idx}>{data.cumulativeDepreciation}</td>
                    ))}
                  </tr>
                );
              })}
            {/* Total Row */}
            <tr>
              <td className="bg-totalRed">Total</td>
              <td className="bg-totalRed">
                {/* Calculate total amount of the project */}
                {Object.values(formData.CostOfProject).reduce(
                  (sum, field) => sum + field.amount,
                  0
                )}
              </td>
              <td className="bg-totalRed"></td>
              <td className="bg-totalRed"></td>
              <td className="bg-totalRed"></td>
              <td className="bg-totalRed"></td>
              <td className="bg-totalRed"></td>
              <td className="bg-totalRed"></td>
            </tr>
          </tbody>
        </table>
      </div>
      {/* Cummulative Depriciation */}
      <div  className="table-div">
        <h3>Cummulative Depriciation</h3>
        <table className={`table-container ${turnery(projectionYears)}`} style={dynamicStyle(projectionYears)}>
          <thead>
            <tr>
              <th className="bg-headPurple">Name</th>
              <th className="bg-headPurple">Amount</th>
              <th className="bg-headPurple">Rate (%)</th>
              {[...Array(parseInt(projectionYears))].map((_, index) => (
                <th key={index} className="bg-headPurple">
                  Year {index + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
          {formData.CostOfProject &&
              Object.entries(formData.CostOfProject).map(([key, field]) => {
                const depreciationData = calculateDepreciation(
                  field.amount,
                  field.rate,
                  projectionYears
                );

                return (
                  <tr key={key}>
                    <td>{field.name}</td>
                    <td>{field.amount}</td>
                    <td>{field.rate}%</td>
                    {depreciationData.map((data, idx) => (
                      <td key={idx}>{data.cumulativeDepreciation}</td>
                    ))}
                  </tr>
                );
              })}
            {/* Total Row */}
            <tr>
              <td className="bg-totalRed">Total</td>
              <td className="bg-totalRed">
                {/* Calculate total amount of the project */}
                {Object.values(formData.CostOfProject).reduce(
                  (sum, field) => sum + field.amount,
                  0
                )}
              </td>
              <td className="bg-totalRed"></td>
              <td className="bg-totalRed"></td>
              <td className="bg-totalRed"></td>
              <td className="bg-totalRed"></td>
              <td className="bg-totalRed"></td>
              <td className="bg-totalRed"></td>
            </tr>
          </tbody>
        </table>
      </div>
      {/* Net Fixed Asset Table */}
      <div  className="table-div">
        <h3>Net Fixed Asset</h3>
        <table className={`table-container ${turnery(projectionYears)}`} style={dynamicStyle(projectionYears)}>
          <thead>
            <tr>
              <th className="bg-headPurple">Name</th>
              <th className="bg-headPurple">Amount</th>
              <th className="bg-headPurple">Rate (%)</th>
              {[...Array(parseInt(projectionYears))].map((_, index) => (
                <th key={index} className="bg-headPurple">
                  Year {index + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
          {formData.CostOfProject &&
              Object.entries(formData.CostOfProject).map(([key, field]) => {
                const depreciationData = calculateDepreciation(
                  field.amount,
                  field.rate,
                  projectionYears
                );

                return (
                  <tr key={key}>
                    <td>{field.name}</td>
                    <td>{field.amount}</td>
                    <td>{field.rate}%</td>
                    {depreciationData.map((data, idx) => (
                      <td key={idx}>{data.cumulativeDepreciation}</td>
                    ))}
                  </tr>
                );
              })}
            {/* Total Row */}
            <tr>
              <td className="bg-totalRed">Total</td>
              <td className="bg-totalRed">
                {/* Calculate total amount of the project */}
                {Object.values(formData.CostOfProject).reduce(
                  (sum, field) => sum + field.amount,
                  0
                )}
              </td>
              <td className="bg-totalRed"></td>
              <td className="bg-totalRed"></td>
              <td className="bg-totalRed"></td>
              <td className="bg-totalRed"></td>
              <td className="bg-totalRed"></td>
              <td className="bg-totalRed"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DepreciationTable;
