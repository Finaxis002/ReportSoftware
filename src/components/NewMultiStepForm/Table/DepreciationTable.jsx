import React from "react";
import { useLocation } from "react-router-dom";

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
    for (let year = 1; year <= 5; year++) {
      const depreciationThisYear = amount * (rate / 100);
      cumulativeDepreciation += depreciationThisYear;
      depreciation.push(cumulativeDepreciation.toFixed(2)); // Store cumulative depreciation
      amount -= depreciationThisYear; // Subtract the depreciation for the next year
    }
    return depreciation;
  };

  return (
    <div className="container container-width mt-4 bg-light px-4">
      <h2 className="py-4 text-center text-xl font-bold">
        Calculation of Depreciation
      </h2>
      {/* Gross Fixed Asset Table */}
      <div className="table-responsive">
        <h3>Gross Fixed Asset</h3>
        <table className="table table-striped table-bordered table-hover">
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
      <div className="table-responsive">
        <h3>Depreciation</h3>
        <table className="table table-striped table-bordered table-hover">
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
        <table className="table table-striped table-bordered table-hover">
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
        <table className="table table-striped table-bordered table-hover">
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
