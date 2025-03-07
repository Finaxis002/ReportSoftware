

import React, { useState, useEffect } from "react";

const SecondStepMOF = ({ formData, onFormDataChange, submitDetails }) => {
  const [localData, setLocalData] = useState({
    termLoan: {
      promoterContribution:
        formData?.MeansOfFinance?.termLoan?.promoterContribution || 0,
      termLoan: formData?.MeansOfFinance?.termLoan?.termLoan || 0,
    },
    workingCapital: {
      promoterContribution:
        formData?.MeansOfFinance?.workingCapital?.promoterContribution || 0,
      termLoan: formData?.MeansOfFinance?.workingCapital?.termLoan || 0,
    },
    TLPromoterContributionPercent: 0,
    TLTermLoanPercent: 0,
    totalTermLoan: 0,
    WCPromoterContributionPercent: 0,
    WCTermLoanPercent: 0,
    totalWorkingCapital: 0,
    totalPC: 0,
    totalTL: 0,
    TotalTermLoanPercent: 0,
    TotalPromoterContributionPercent: 0,
    total: 0,
  });

  // Calculate totals and percentages
  useEffect(() => {
    const { termLoan, workingCapital } = localData;

    const totalTermLoan =
      parseFloat(termLoan.promoterContribution || 0) +
      parseFloat(termLoan.termLoan || 0);
    const totalWorkingCapital =
      parseFloat(workingCapital.promoterContribution || 0) +
      parseFloat(workingCapital.termLoan || 0);
    const totalPC =
      parseFloat(termLoan.promoterContribution || 0) +
      parseFloat(workingCapital.promoterContribution || 0);
    const totalTL =
      parseFloat(termLoan.termLoan || 0) +
      parseFloat(workingCapital.termLoan || 0);
    const total = totalPC + totalTL;

    setLocalData((prevData) => ({
      ...prevData,
      totalTermLoan,
      totalWorkingCapital,
      totalPC,
      totalTL,
      total,
      TLPromoterContributionPercent: (
        (termLoan.promoterContribution / totalTermLoan) * 100 || 0
      ).toFixed(2),
      TLTermLoanPercent: (
        (termLoan.termLoan / totalTermLoan) * 100 || 0
      ).toFixed(2),
      WCPromoterContributionPercent: (
        (workingCapital.promoterContribution / totalWorkingCapital) * 100 || 0
      ).toFixed(2),
      WCTermLoanPercent: (
        (workingCapital.termLoan / totalWorkingCapital) * 100 || 0
      ).toFixed(2),
      TotalPromoterContributionPercent: ((totalPC / total) * 100 || 0).toFixed(
        2
      ),
      TotalTermLoanPercent: ((totalTL / total) * 100 || 0).toFixed(2),
    }));
  }, [localData.termLoan, localData.workingCapital]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    const [key, subKey] = name.split(".");

    // Update data in MultiStepForm
    onFormDataChange({
      MeansOfFinance: {
        ...formData.MeansOfFinance,
        [name]: value, // Update only the changed field
      },
    });

    setLocalData((prevData) => {
      if (subKey) {
        // Update nested objects
        return {
          ...prevData,
          [key]: {
            ...prevData[key],
            [subKey]: value,
          },
        };
      }
      // Update simple values
      return {
        ...prevData,
        [name]: value,
      };
    });
  };

  
  useEffect(() => {
    // console.log("Updated formData:", formData);
  }, [formData]);
  
  // Auto-update parent formData
  useEffect(() => {
    onFormDataChange({ MeansOfFinance: localData });
  }, [
    localData,
    onFormDataChange,
    localData.totalTermLoan,
    localData.totalWorkingCapital,
  ]);


  return (
    <div>
      <div className="form-scroll">
        <div className="container">
          {/* Term Loan Section */}
          <div className="row">
            <div className="col-12 my-3">
              <h5>Term Loan</h5>
            </div>
            <div className="col-10">
              <div className="input">
                <input
                  id="termLoan.promoterContribution"
                  name="termLoan.promoterContribution"
                  type="number"
                  placeholder="Promoter's Contribution"
                  value={localData.termLoan.promoterContribution}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="termLoan.promoterContribution">
                  Promoter's Contribution
                </label>
              </div>
            </div>
            <div className="col-2">
              <div className="input">
                <input
                  id="TLPromoterContributionPercent"
                  name="TLPromoterContributionPercent"
                  type="text"
                  placeholder="Percentage %"
                  value={localData.TLPromoterContributionPercent}
                  disabled
                />
                <label htmlFor="TLPromoterContributionPercent">
                  Percentage %
                </label>
              </div>
            </div>
            <div className="col-10">
              <div className="input">
                <input
                  id="termLoan.termLoan"
                  name="termLoan.termLoan"
                  type="number"
                  placeholder="Term Loan"
                  value={localData.termLoan.termLoan}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="termLoan.termLoan">Term Loan</label>
              </div>
            </div>
            <div className="col-2">
              <div className="input">
                <input
                  id="TLTermLoanPercent"
                  name="TLTermLoanPercent"
                  type="text"
                  placeholder="Percentage %"
                  value={localData.TLTermLoanPercent}
                  disabled
                />
                <label htmlFor="TLTermLoanPercent">Percentage %</label>
              </div>
            </div>
            <div className="col-10">
              <div className="input">
                <input
                  id="totalTermLoan"
                  name="totalTermLoan"
                  type="number"
                  placeholder="Total Term Loan"
                  value={localData.totalTermLoan}
                  disabled
                />
                <label htmlFor="totalTermLoan">Total Term Loan</label>
              </div>
            </div>
          </div>
          <hr />
          {/* Working Capital Section */}
          <div className="row">
            <div className="col-12 my-3">
              <h5>Working Capital</h5>
            </div>
            <div className="col-10">
              <div className="input">
                <input
                  id="workingCapital.promoterContribution"
                  name="workingCapital.promoterContribution"
                  type="number"
                  placeholder="Promoter's Contribution"
                  value={localData.workingCapital.promoterContribution}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="workingCapital.promoterContribution">
                  Promoter's Contribution
                </label>
              </div>
            </div>
            <div className="col-2">
              <div className="input">
                <input
                  id="WCPromoterContributionPercent"
                  name="WCPromoterContributionPercent"
                  type="text"
                  placeholder="Percentage %"
                  value={localData.WCPromoterContributionPercent}
                  disabled
                />
                <label htmlFor="WCPromoterContributionPercent">
                  Percentage %
                </label>
              </div>
            </div>
            <div className="col-10">
              <div className="input">
                <input
                  id="workingCapital.termLoan"
                  name="workingCapital.termLoan"
                  type="number"
                  placeholder="Term Loan"
                  value={localData.workingCapital.termLoan}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="workingCapital.termLoan">Term Loan</label>
              </div>
            </div>
            <div className="col-2">
              <div className="input">
                <input
                  id="WCTermLoanPercent"
                  name="WCTermLoanPercent"
                  type="text"
                  placeholder="Percentage %"
                  value={localData.WCTermLoanPercent}
                  disabled
                />
                <label htmlFor="WCTermLoanPercent">Percentage %</label>
              </div>
            </div>
            <div className="col-10">
              <div className="input">
                <input
                  id="totalWorkingCapital"
                  name="totalWorkingCapital"
                  type="number"
                  placeholder="Total Working Capital"
                  value={localData.totalWorkingCapital}
                  disabled
                />
                <label htmlFor="totalWorkingCapital">
                  Total Working Capital
                </label>
              </div>
            </div>
          </div>
          <hr />
          {/* Total Section */}
          <div className="row">
            <div className="col-12 my-3">
              <h5>Total</h5>
            </div>
            <div className="col-10">
              <div className="input">
                <input
                  id="totalPC"
                  name="totalPC"
                  type="number"
                  placeholder="Promoter's Contribution Total"
                  value={localData.totalPC}
                  disabled
                />
                <label htmlFor="totalPC">Promoter's Contribution Total</label>
              </div>
            </div>
            <div className="col-2">
              <div className="input">
                <input
                  id="TotalPromoterContributionPercent"
                  name="TotalPromoterContributionPercent"
                  type="text"
                  placeholder="Percentage %"
                  value={localData.TotalPromoterContributionPercent}
                  disabled
                />
                <label htmlFor="TotalPromoterContributionPercent">
                  Percentage %
                </label>
              </div>
            </div>
            <div className="col-10">
              <div className="input">
                <input
                  id="totalTL"
                  name="totalTL"
                  type="number"
                  placeholder="Term Loan Total"
                  value={localData.totalTL}
                  disabled
                />
                <label htmlFor="totalTL">Term Loan Total</label>
              </div>
            </div>
            <div className="col-2">
              <div className="input">
                <input
                  id="TotalTermLoanPercent"
                  name="TotalTermLoanPercent"
                  type="text"
                  placeholder="Percentage %"
                  value={localData.TotalTermLoanPercent}
                  disabled
                />
                <label htmlFor="TotalTermLoanPercent">Percentage %</label>
              </div>
            </div>
            <div className="col-10">
              <div className="input">
                <input
                  id="total"
                  name="total"
                  type="number"
                  placeholder="Total"
                  value={localData.total}
                  disabled
                />
                <label htmlFor="total">Total</label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecondStepMOF;