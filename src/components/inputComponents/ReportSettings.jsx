import React, { useState } from 'react'

const ReportSettings = ({ handleSave }) => {
    const [formInput, setFormInput] = useState({
        RepaymentMonths: '',
        ProjectionYears: '',
        PurposeofReport: '',
        MoratoriumPeriod: '',
        SelectRepaymentMethod: '',
        SelectStartingMonth: '',
        FinancialYear: '',
        AmountIn: '',
        Currency: '',
        Format: '',
        interestOnTL: '',
        interestOnWC: '',
        rateOfInterest: '',
        rateOfWorkingCapital: '',
        incomeTax: 30,
        rateOfExpense: ''
    })

    const submitDetails = () => {
        handleSave({ "reportSettings": formInput })
    }

    const handleChange = (e) => {
        let targetName = e.target.name;
        let type = e.target.type;
        let targetValue = type === 'number' ? Number(e.target.value) : e.target.value;
        console.log(targetName, targetValue);
        if (targetName === "ProjectionYears") {
            localStorage.setItem("ProjectionYears", targetValue)
        }
        let tempInput = formInput;
        tempInput[targetName] = targetValue;
        console.log(tempInput);
        setFormInput({ ...tempInput })
    }

    return (
        <div>
            <div className='form-scroll'>
                <div className="container">
                    <div className="row">
                        <div className="col-4">
                            <div className="input">
                                <input id="RepaymentMonths" name="RepaymentMonths" type="number" placeholder="e.g. 12" required
                                    value={formInput.RepaymentMonths} onChange={(e) => handleChange(e)} />
                                <label htmlFor="RepaymentMonths">Repayment Months</label>
                            </div>
                        </div>
                        <div className="col-4">
                            <div className="input">
                                <input id="ProjectionYears" name="ProjectionYears" type="number" placeholder="Projection Years" required
                                    value={formInput.ProjectionYears} onChange={(e) => handleChange(e)} />
                                <label htmlFor="ProjectionYears">Projection Years</label>
                            </div>
                        </div>
                        <div className="col-4">
                            <div className="input">
                                <input id="MoratoriumPeriod" name="MoratoriumPeriod" type="number" placeholder="e.g. 6 months" required
                                    value={formInput.MoratoriumPeriod} onChange={(e) => handleChange(e)} />
                                <label htmlFor="MoratoriumPeriod">Moratorium Period</label>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-4">
                            <div className="">
                                {/* <label htmlFor="SelectRepaymentMethod">Select Repayment Method</label> */}
                                <select className='form-control selectInput' id="SelectRepaymentMethod" name="SelectRepaymentMethod" required
                                    value={formInput.SelectRepaymentMethod} onChange={(e) => handleChange(e)}>
                                    <option value="">Select Repayment Method</option>
                                    <option value="Monthly">Monthly</option>
                                    <option value="Quarterly">Quarterly</option>
                                    <option value="Semi-annually">Semi-annually</option>
                                    <option value="Annually">Annually</option>
                                </select>

                            </div>
                        </div>
                        <div className="col-4">
                            <div className="">
                                {/* <label htmlFor="SelectStartingMonth">Select Starting Month</label> */}
                                <select className='form-control selectInput' id="SelectStartingMonth" name="SelectStartingMonth" required
                                    value={formInput.SelectStartingMonth} onChange={(e) => handleChange(e)}>
                                    <option value="">Select Starting Month</option>
                                    <option value="10">January</option>
                                    <option value="11">February</option>
                                    <option value="12">March</option>
                                    <option value="1">April</option>
                                    <option value="2">May</option>
                                    <option value="3">June</option>
                                    <option value="4">July</option>
                                    <option value="5">August</option>
                                    <option value="6">September</option>
                                    <option value="7">October</option>
                                    <option value="8">November</option>
                                    <option value="9">December</option>
                                </select>
                            </div>
                        </div>
                        <div className="col-4">
                            <div className="input">
                                <input id="FinancialYear" name="FinancialYear" type="number" placeholder="e.g. 2023-2024" required
                                    value={formInput.FinancialYear} onChange={(e) => handleChange(e)} />
                                <label htmlFor="FinancialYear">Financial Year</label>
                            </div>
                        </div>
                    </div>
                    <div className="row mb-4">
                        <div className="col-4">
                            <div className="d-flex">
                                {/* <label htmlFor="Currency" className='w-100'>Currency</label> */}
                                <select className='form-control selectInput' id="Currency" name="Currency" required
                                    value={formInput.AmountIn} onChange={(e) => handleChange(e)}>
                                    <option value="INR" selected>INR</option>
                                    <option value="USD">USD</option>
                                    <option value="Dhiram">Dhiram</option>

                                </select>
                            </div>
                        </div>
                        <div className="col-4">
                            <div className="d-flex">
                                {/* <label htmlFor="Amount In" className='w-100'>Amount In</label> */}
                                <select className='form-control selectInput' id="AmountIn" name="AmountIn" required
                                    value={formInput.AmountIn} onChange={(e) => handleChange(e)}>
                                    <option value="rupees" selected>Rupees</option>
                                    <option value="thousand">Thousands</option>
                                    <option value="lakhs">Lakhs</option>
                                    <option value="crores">Crores</option>
                                    <option value="millions">Millions</option>
                                </select>
                            </div>
                        </div>
                        <div className="col-4">
                            <div>
                                <select className='form-control selectInput' id="Format" name="Format" required
                                    value={formInput.Format} onChange={(e) => handleChange(e)}>
                                    <option value="">Format (e.g. 1,23,456)</option>
                                    <option value="1">Indian (1,23,456)</option>
                                    <option value="2">USD (1,123,456)</option>
                                    <option value="3">1,23,456</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-4">
                            <div className="input">
                                <input id="PurposeofReport" name="PurposeofReport" type="text" placeholder="e.g. Annual Report" required
                                    value={formInput.PurposeofReport} onChange={(e) => handleChange(e)} />
                                <label htmlFor="PurposeofReport">Purpose of Report</label>
                            </div>
                        </div>
                        <div className="col-4">
                            <div className="input">
                                <input id="interestOnTL" name="interestOnTL" type="text" placeholder="interestOnTL" required
                                    value={formInput.interestOnTL} onChange={(e) => handleChange(e)} />
                                <label htmlFor="interestOnTL">Interest On Term Loan</label>
                            </div>
                        </div>
                        <div className="col-4">
                            <div className="input">
                                <input id="interestOnWC" name="interestOnWC" type="number" placeholder="interestOnWC" required
                                    value={formInput.interestOnWC} onChange={(e) => handleChange(e)} />
                                <label htmlFor="interestOnWC">Interest On Working Capital</label>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-4">
                            <div className="input">
                                <input id="rateOfInterest" name="rateOfInterest" type="number" placeholder="rateOfInterest" required
                                    value={formInput.rateOfInterest} onChange={(e) => handleChange(e)} />
                                <label htmlFor="rateOfInterest">Rate Of Interest</label>
                            </div>
                        </div>
                        <div className="col-4">
                            <div className="input">
                                <input id="rateOfExpense" name="rateOfExpense" type="number" placeholder="rateOfExpense" required
                                    value={formInput.rateOfExpense} onChange={(e) => handleChange(e)} />
                                <label htmlFor="rateOfExpense">Rate Of Expense</label>
                            </div>
                        </div>
                        <div className="col-4">
                            <div className="input">
                                <input id="incomeTax" name="incomeTax" type="number" placeholder="incomeTax" required
                                    value={formInput.incomeTax} onChange={(e) => handleChange(e)} />
                                <label htmlFor="incomeTax">Income Tax</label>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-4">
                            <div className="input">
                                <input id="rateOfWorkingCapital" name="rateOfWorkingCapital" type="number" placeholder="rateOfWorkingCapital" required
                                    value={formInput.rateOfWorkingCapital} onChange={(e) => handleChange(e)} />
                                <label htmlFor="rateOfWorkingCapital">Rate Of Working Capital</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <button className="btn btn-success mt-5 px-5" onClick={submitDetails}>
                Save
            </button>
        </div>


    )
}

export default ReportSettings