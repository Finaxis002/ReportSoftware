import React from "react";
import { useLocation } from "react-router-dom";

const MeansOfFinanceTable = () =>{
   const location = useLocation();
    const formData = location.state;
  
    // Debug: Log data to check if AccountInformation is present
    // console.log("accountInfo in MOF:");
  
    // Ensure formData is valid
    if (!formData || !formData.AccountInformation) {
      return <div>No account information available</div>; // Fallback UI
    }
  
    return (
      <div className="container container-width mt-4 bg-light px-4">
      <h2 className="py-4 text-center text-xl font-bold">
        Means of Finance
      </h2>
      <div className="table-responsive">
        <table className="table table-striped table-bordered table-hover">
          <thead>
            <tr>
              <th className="bg-headPurple">Category</th>
              <th className="bg-headPurple">Loan</th>
              <th className="bg-headPurple">Loan (%)</th>
              <th className="bg-headPurple">Promoter Contribution</th>
              <th className="bg-headPurple">Promoter Contribution (%)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Term Loan</td>
              <td>{formData.MeansOfFinance.termLoan.termLoan}</td>
              <td>{formData.MeansOfFinance.TLTermLoanPercent}</td>
              <td>
                {formData.MeansOfFinance.termLoan.promoterContribution}
              </td>
              <td>
                {formData.MeansOfFinance.TLPromoterContributionPercent}
              </td>
            </tr>
            <tr>
              <td>Working Capital</td>
              <td>{formData.MeansOfFinance.workingCapital.termLoan}</td>
              <td>{formData.MeansOfFinance.WCTermLoanPercent}</td>
              <td>
                {
                  formData.MeansOfFinance.workingCapital
                    .promoterContribution
                }
              </td>
              <td>
                {formData.MeansOfFinance.WCPromoterContributionPercent}
              </td>
            </tr>
            <tr>
              <td className="bg-totalRed">Total</td>
              <td className="bg-totalRed">
                {formData.MeansOfFinance.totalTL}
              </td>
              <td className="bg-totalRed">
                {formData.MeansOfFinance.TotalTermLoanPercent}
              </td>
              <td className="bg-totalRed">
                {formData.MeansOfFinance.totalPC}
              </td>
              <td className="bg-totalRed">
                {formData.MeansOfFinance.TotalPromoterContributionPercent}
              </td>
            </tr>
          </tbody>
        </table>
        <br />
        <table className="table table-striped table-bordered table-hover">
          {/* Totals Section */}
          <thead>
            <tr>
              <th className="bg-headPurple">Category</th>
              <th className="bg-headPurple">Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Total Term Loan</td>
              <td>{formData.MeansOfFinance.totalTermLoan}</td>
            </tr>
            <tr>
              <td>Total Working Capital</td>
              <td>{formData.MeansOfFinance.totalWorkingCapital}</td>
            </tr>
            <tr className="bg-totalRed">
              <td className="bg-totalRed">Total</td>
              <td className="bg-totalRed">
                {formData.MeansOfFinance.total}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    );
}

export default MeansOfFinanceTable;
