import React, { useState } from 'react'

const Step3 = ({ handleSave }) => {
    const [formInput, setFormInput] = useState({
        RepaymentMonths: '', PurposeofReport: '', MoratoriumPeriod: '', SelectRepaymentMethod: '', SelectStartingMonth: '', FinancialYear: '', AmountIn: '', Currency: '', Format: ''
    })

    // const demoObj = {RepaymentMonths : 84, RateOfInterest : 12, MoratoriumPeriod : 6, Principal : 780000}

    const handleSave2 = () => {
        console.log(">>>>>", formInput)
    }

    const handleChange = (e) => {
        let targetName = e.target.name;
        let targetValue = e.target.value;
        console.log(targetName, targetValue);
        let tempInput = formInput;
        tempInput[targetName] = targetValue;
        setFormInput({ ...tempInput })
    }

    return (
        <div>
            <div className='form-scroll'>
                <div className="input">
                    <input id="RepaymentMonths" name="RepaymentMonths" type="text" placeholder="e.g. 12" required
                        value={formInput.RepaymentMonths} onChange={(e) => handleChange(e)} />
                    <label htmlFor="RepaymentMonths">Projection Months</label>
                </div>

                <div className="input">
                    <input id="PurposeofReport" name="PurposeofReport" type="text" placeholder="e.g. Annual Report" required
                        value={formInput.PurposeofReport} onChange={(e) => handleChange(e)} />
                    <label htmlFor="PurposeofReport">Purpose of Report</label>
                </div>

                <div className="input">
                    <input id="MoratoriumPeriod" name="MoratoriumPeriod" type="text" placeholder="e.g. 6 months" required
                        value={formInput.MoratoriumPeriod} onChange={(e) => handleChange(e)} />
                    <label htmlFor="MoratoriumPeriod">Moratorium Period</label>
                </div>

                <div className="input">
                    <label htmlFor="SelectRepaymentMethod">Select Repayment Method</label>
                    <select id="SelectRepaymentMethod" name="SelectRepaymentMethod" required
                        value={formInput.SelectRepaymentMethod} onChange={(e) => handleChange(e)}>
                        <option value="">Select Repayment Method</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Quarterly">Quarterly</option>
                        <option value="Semi-annually">Semi-annually</option>
                        <option value="Annually">Annually</option>
                    </select>

                </div>

                <div className="input">
                    <label htmlFor="SelectStartingMonth">Select Starting Month</label>
                    <select id="SelectStartingMonth" name="SelectStartingMonth" required
                        value={formInput.SelectStartingMonth} onChange={(e) => handleChange(e)}>
                        <option value="">Select an option</option>
                        <option value="January">January</option>
                        <option value="February">February</option>
                        <option value="March">March</option>
                        <option value="April">April</option>
                        <option value="May">May</option>
                        <option value="June">June</option>
                        <option value="July">July</option>
                        <option value="August">August</option>
                        <option value="September">September</option>
                        <option value="October">October</option>
                        <option value="November">November</option>
                        <option value="December">December</option>
                    </select>
                </div>

                <div className="input">
                    <input id="FinancialYear" name="FinancialYear" type="text" placeholder="e.g. 2023-2024" required
                        value={formInput.FinancialYear} onChange={(e) => handleChange(e)} />
                    <label htmlFor="FinancialYear">Financial Year</label>
                </div>

                <div className="input">
                    <label htmlFor="Currency">Currency</label>
                    <select id="Currency" name="Currency" required
                        value={formInput.AmountIn} onChange={(e) => handleChange(e)}>
                        <option value="INR">INR</option>
                        <option value="USD">USD</option>
                        <option value="Dhiram">Dhiram</option>

                    </select>
                </div>

                <div className="input">
                    <label htmlFor="Amount In">Amount In</label>
                    <select id="AmountIn" name="AmountIn" required
                        value={formInput.AmountIn} onChange={(e) => handleChange(e)}>
                        <option value="rupees">Rupees</option>
                        <option value="thousand">Thousands</option>
                        <option value="lakhs">Lakhs</option>
                        <option value="crores">Crores</option>
                        <option value="millions">Millions</option>
                    </select>
                </div>

                <div className="input">
                    <input id="Format" name="Format" type="text" placeholder="e.g. 1,23,456" required
                        value={formInput.Format} onChange={(e) => handleChange(e)} />
                    <label htmlFor="Format">Format</label>
                </div>
            </div>
            <button className="btn btn-success mt-5 px-5" onClick={() => { handleSave2({ step1: formInput }) }}>
                Save
            </button>
        </div>


    )
}

export default Step3