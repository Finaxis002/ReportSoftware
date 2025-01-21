import React, {useState} from "react";
import { useLocation } from "react-router-dom";
import { Document, Page, Text, StyleSheet, View } from "@react-pdf/renderer";


const DepreciationTable = () => {
  const location = useLocation();
  const formData = location.state;

  // Debug: Log data to check if CostOfProject is present
  console.log("formData in DepreciationTable:", formData);

  // Ensure formData is valid
  if (!formData || !formData.CostOfProject) {
    return <div>No cost of project information available</div>; // Fallback UI
  }

  // Helper function to calculate depreciation for a given amount and rate over 5 years
  const calculateDepreciation = (amount, rate) => {
    let depreciation = [];
    let cumulativeDepreciation = 0;
    for (let year = 1; year <= 20; year++) {
      const depreciationThisYear = amount * (rate / 100);
      cumulativeDepreciation += depreciationThisYear;
      depreciation.push(cumulativeDepreciation.toFixed(2)); // Store cumulative depreciation
      amount -= depreciationThisYear; // Subtract the depreciation for the next year
    }
    return depreciation;
  };

  const columnCount = 11; // Total number of columns (th elements)

  // Function to return class name based on the number of columns (>= 10)
  const turnery = (columnCount) => {
    console.log('Number of columns:', columnCount); // Debugging
    return columnCount >= 11 ? 'transform-table' : ''; // Apply transform-table class if columns >= 10
  };

  // Function to return styles based on column count (>= 10)
  const dynamicStyle = (columnCount) => {
    console.log('Number of columns for style:', columnCount); // Debugging
    return columnCount >= 11
      ? { transform: 'scale(0.5)', marginLeft: '-40%' }
      : {}; // Apply styles if columns >= 10
  };


  return (
    <div className="mt-4 bg-light px-4">
      <h2 className="py-4 text-center text-xl font-bold">
        Calculation of Depreciation
      </h2>
      {/* Gross Fixed Asset Table */}
      <div >
        <h3>Gross Fixed Asset</h3>
        <table className={turnery(columnCount)} style={dynamicStyle(columnCount)}>
          <thead>
            <tr>
             
              <th className="bg-headPurple">Name</th>
              <th className="bg-headPurple">Amount</th>
              <th className="bg-headPurple">Rate (%)</th>
              <th className="bg-headPurple">Year 1</th>
              <th className="bg-headPurple">Year 2</th>
              <th className="bg-headPurple">Year 3</th>
              <th className="bg-headPurple">Year 4</th>
              <th className="bg-headPurple">Year 5</th>
              <th className="bg-headPurple">Year 6</th>
              <th className="bg-headPurple">Year 7</th>
              <th className="bg-headPurple">Year 8</th>
              <th className="bg-headPurple">Year 9</th>
              <th className="bg-headPurple">Year 10</th>
              <th className="bg-headPurple">Year 11</th>
              <th className="bg-headPurple">Year 12</th>
              <th className="bg-headPurple">Year 13</th>
              <th className="bg-headPurple">Year 14</th>
              <th className="bg-headPurple">Year 15</th>
              <th className="bg-headPurple">Year 16</th>
              <th className="bg-headPurple">Year 17</th>
              <th className="bg-headPurple">Year 18</th>
              <th className="bg-headPurple">Year 19</th>
              <th className="bg-headPurple">Year 20</th>
            </tr>
          </thead>
          <tbody>
            {formData.CostOfProject &&
              Object.entries(formData.CostOfProject).map(
                ([key, field], index) => {
                  const depreciationRate = field.rate / 100; // Depreciation rate
                  let grossYear1 =
                    field.amount - field.amount * depreciationRate;
                  let grossYear2 = grossYear1 - grossYear1 * depreciationRate;
                  let grossYear3 = grossYear2 - grossYear2 * depreciationRate;
                  let grossYear4 = grossYear3 - grossYear3 * depreciationRate;
                  let grossYear5 = grossYear4 - grossYear4 * depreciationRate;

                  return (
                    <tr key={key}>
                      <td>{field.name}</td>
                      <td>{field.amount}</td>
                      <td>{field.rate}%</td>
                      <td>{grossYear1.toFixed(2)}</td>
                      <td>{grossYear2.toFixed(2)}</td>
                      <td>{grossYear3.toFixed(2)}</td>
                      <td>{grossYear4.toFixed(2)}</td>
                      <td>{grossYear5.toFixed(2)}</td>
                    </tr>
                  );
                }
              )}
            {/* Total Row */}
            <tr>
              <td className="bg-totalRed">Total</td>
              <td className="bg-totalRed">
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
      {/* depreciation table */}
      <div >
        <h3>Depreciationn</h3>
        <table>
          <thead>
            <tr>
              <th className="bg-headPurple">Name</th>
              <th className="bg-headPurple">Amount</th>
              <th className="bg-headPurple">Rate (%)</th>
              <th className="bg-headPurple">Year 1</th>
              <th className="bg-headPurple">Year 2</th>
              <th className="bg-headPurple">Year 3</th>
              <th className="bg-headPurple">Year 4</th>
              <th className="bg-headPurple">Year 5</th>
            </tr>
          </thead>
          <tbody>
            {formData.CostOfProject &&
              Object.entries(formData.CostOfProject).map(
                ([key, field], index) => {
                  const depreciationRate = field.rate / 100; // Depreciation rate (e.g., 10% -> 0.1)
                  let year1 = field.amount - field.amount * depreciationRate; // Depreciation for Year 1
                  let year2 = year1 - year1 * depreciationRate; // Depreciation for Year 2
                  let year3 = year2 - year2 * depreciationRate; // Depreciation for Year 3
                  let year4 = year3 - year3 * depreciationRate; // Depreciation for Year 4
                  let year5 = year4 - year4 * depreciationRate; // Depreciation for Year 5

                  return (
                    <tr key={key}>
                      <td>{field.name}</td>
                      <td>{field.amount}</td>
                      <td>{field.rate}%</td>
                      <td>{year1.toFixed(2)}</td>
                      <td>{year2.toFixed(2)}</td>
                      <td>{year3.toFixed(2)}</td>
                      <td>{year4.toFixed(2)}</td>
                      <td>{year5.toFixed(2)}</td>
                    </tr>
                  );
                }
              )}
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
      <div className="table-responsive">
        <h3>Cummulative Depriciation</h3>
        <table className={formData.CostOfProject && Object.entries(formData.CostOfProject)[0][1].years >= 8 ? "transform-table" : ""}>
          <thead>
            <tr>
              <th className="bg-headPurple">Name</th>
              <th className="bg-headPurple">Amount</th>
              <th className="bg-headPurple">Rate (%)</th>
              <th className="bg-headPurple">Year 1</th>
              <th className="bg-headPurple">Year 2</th>
              <th className="bg-headPurple">Year 3</th>
              <th className="bg-headPurple">Year 4</th>
              <th className="bg-headPurple">Year 5</th>
            </tr>
          </thead>
          <tbody>
            {formData.CostOfProject &&
              Object.entries(formData.CostOfProject).map(
                ([key, field], index) => {
                  const depreciationRate = field.rate; // Depreciation rate in percentage
                  const depreciationValues = calculateDepreciation(
                    field.amount,
                    depreciationRate
                  );

                  return (
                    <tr key={key}>
                      <td>{field.name}</td>
                      <td>{field.amount}</td>
                      <td>{field.rate}%</td>
                      <td>{depreciationValues[0]}</td>
                      <td>{depreciationValues[1]}</td>
                      <td>{depreciationValues[2]}</td>
                      <td>{depreciationValues[3]}</td>
                      <td>{depreciationValues[4]}</td>
                    </tr>
                  );
                }
              )}
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
      <div className="table-responsive">
        <h3>Net Fixed Asset</h3>
        <table className={formData.CostOfProject && Object.entries(formData.CostOfProject)[0][1].years >= 8 ? "transform-table" : ""}>
          <thead>
            <tr>
              <th className="bg-headPurple">Name</th>
              <th className="bg-headPurple">Amount</th>
              <th className="bg-headPurple">Rate (%)</th>
              <th className="bg-headPurple">Year 1</th>
              <th className="bg-headPurple">Year 2</th>
              <th className="bg-headPurple">Year 3</th>
              <th className="bg-headPurple">Year 4</th>
              <th className="bg-headPurple">Year 5</th>
            </tr>
          </thead>
          <tbody>
            {formData.CostOfProject &&
              Object.entries(formData.CostOfProject).map(
                ([key, field], index) => {
                  const depreciationRate = field.rate / 100;
                  let grossYear1 =
                    field.amount - field.amount * depreciationRate;
                  let grossYear2 = grossYear1 - grossYear1 * depreciationRate;
                  let grossYear3 = grossYear2 - grossYear2 * depreciationRate;
                  let grossYear4 = grossYear3 - grossYear3 * depreciationRate;
                  let grossYear5 = grossYear4 - grossYear4 * depreciationRate;

                  const depreciationValues = calculateDepreciation(
                    field.amount,
                    field.rate
                  );
                  let netYear1 = grossYear1 - depreciationValues[0];
                  let netYear2 = grossYear2 - depreciationValues[1];
                  let netYear3 = grossYear3 - depreciationValues[2];
                  let netYear4 = grossYear4 - depreciationValues[3];
                  let netYear5 = grossYear5 - depreciationValues[4];

                  return (
                    <tr key={key}>
                      <td>{field.name}</td>
                      <td>{field.amount}</td>
                      <td>{field.rate}%</td>
                      <td>{netYear1.toFixed(2)}</td>
                      <td>{netYear2.toFixed(2)}</td>
                      <td>{netYear3.toFixed(2)}</td>
                      <td>{netYear4.toFixed(2)}</td>
                      <td>{netYear5.toFixed(2)}</td>
                    </tr>
                  );
                }
              )}
            {/* Total Row */}
            <tr>
              <td className="bg-totalRed">Total</td>
              <td className="bg-totalRed">
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
