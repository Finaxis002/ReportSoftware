import React, { useEffect, useState } from 'react'

const MeansOfFinance = ({ handleSave, reportInput }) => {
    const [termLoan, setTermLoan] = useState({
        promoterContribution: 0,
        termLoan: 0
    })
    const [workingCapital, setWorkingCapital] = useState({
        promoterContribution: 0,
        termLoan: 0
    })

    const [TLPromoterContributionPercent, setTLPromoterContributionPercent] = useState(0);
    const [TLTermLoanPercent, setTLTermLoanPercent] = useState(0);
    const [totalTermLoan, setTotalTermLoan] = useState(0);


    const [WCPromoterContributionPercent, setWCPromoterContributionPercent] = useState(0);
    const [WCTermLoanPercent, setWCTermLoanPercent] = useState(0);
    const [totalWorkingCapital, setTotalWorkingTotal] = useState(0);

    const [totalPC, setTotalPC] = useState(0);
    const [totalTL, setTotalTL] = useState(0);
    const [TotalTermLoanPercent, setTotalTermLoanPercent] = useState(0);
    const [TotalPromoterContributionPercent, setTotalPromoterContributionPercent] = useState(0);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        setTLPromoterContributionPercent((Number(termLoan.promoterContribution) / (Number(termLoan.termLoan) + Number(termLoan.promoterContribution)) * 100).toFixed(2))
        setTLTermLoanPercent((Number(termLoan.termLoan) / (Number(termLoan.termLoan) + Number(termLoan.promoterContribution)) * 100).toFixed(2))
        setTotalTermLoan((Number(termLoan.promoterContribution) + Number(termLoan.termLoan)))
    }, [termLoan])

    useEffect(() => {
        setWCPromoterContributionPercent((Number(workingCapital.promoterContribution) / (Number(workingCapital.termLoan) + Number(workingCapital.promoterContribution)) * 100).toFixed(2))
        setWCTermLoanPercent((Number(workingCapital.termLoan) / (Number(workingCapital.termLoan) + Number(workingCapital.promoterContribution)) * 100).toFixed(2))
        setTotalWorkingTotal((Number(workingCapital.promoterContribution) + Number(workingCapital.termLoan)))
    }, [workingCapital])

    useEffect(() => {
        setTotalPC((Number(termLoan.promoterContribution) + Number(workingCapital.promoterContribution)))
        setTotalTL((Number(termLoan.termLoan) + Number(workingCapital.termLoan)))
        setTotalPromoterContributionPercent(
            ((
                (
                    (Number(termLoan.promoterContribution) + Number(workingCapital.promoterContribution))
                    /
                    (Number(termLoan.promoterContribution) + Number(termLoan.termLoan) + Number(workingCapital.promoterContribution) + Number(workingCapital.termLoan))
                ) * 100
            ).toFixed(2))
        )
        setTotalTermLoanPercent(
            ((
                (
                    (Number(termLoan.termLoan) + Number(workingCapital.termLoan))
                    /
                    (Number(termLoan.promoterContribution) + Number(termLoan.termLoan) + Number(workingCapital.promoterContribution) + Number(workingCapital.termLoan))
                ) * 100
            ).toFixed(2))

        )
        setTotal((Number(termLoan.promoterContribution) + Number(termLoan.termLoan) + Number(workingCapital.promoterContribution) + Number(workingCapital.termLoan)))
    }, [termLoan, workingCapital])

    const submitDetails = () => {
        handleSave({
            meansOfFinance: {
                termLoan, workingCapital,
                TLPromoterContributionPercent, TLTermLoanPercent,
                totalTermLoan, WCPromoterContributionPercent,
                WCTermLoanPercent, totalWorkingCapital,
                totalPC, totalTL, TotalTermLoanPercent,
                TotalPromoterContributionPercent, total
            }
        })
    }

    return (
        <div className=''>
            <div className='form-scroll'>
                <div className="container">
                    <div className="row">
                        <div className="col-12 my-3"><h5>Term Loan</h5></div>
                        <div className="col-10">
                            <div className="input">
                                <input id="promoterContribution" name="promoterContribution" type="number" placeholder="Promoter's Contribution" required
                                    value={termLoan.promoterContribution} onChange={(e) => setTermLoan({ promoterContribution: e.target.value, termLoan: termLoan.termLoan })} />
                                <label htmlFor="promoterContribution">Promoter's Contribution</label>
                            </div>
                        </div>
                        <div className="col-2">
                            <div className="input">
                                <input id="pcPercent" name="pcPercent" type="text" placeholder="Percentage %"
                                    value={TLPromoterContributionPercent} disabled />
                                <label htmlFor="pcPercent">Percentage %</label>
                            </div>
                        </div>
                        <div className="col-10">
                            <div className="input">
                                <input id="termLoan" name="termLoan" type="number" placeholder="Term Loan" required
                                    value={termLoan.termLoan} onChange={(e) => setTermLoan({ termLoan: e.target.value, promoterContribution: termLoan.promoterContribution })} />
                                <label htmlFor="termLoan">Term Loan</label>
                            </div>
                        </div>
                        <div className="col-2">
                            <div className="input">
                                <input id="tlPercent" name="tlPercent" type="text" placeholder="Percentage %"
                                    value={TLTermLoanPercent} disabled />
                                <label htmlFor="tlPercent">Percentage %</label>
                            </div>
                        </div>
                        <div className="col-10">
                            <div className="input">
                                <input id="totalTermLoan" name="totalTermLoan" type="number" placeholder="Total Term Loan"
                                    value={totalTermLoan} disabled />
                                <label htmlFor="totalTermLoan">Total Term Loan</label>
                            </div>
                        </div>
                    </div>
                    <hr />
                    <div className="row">
                        <div className="col-12 my-3"><h5>Working Capital</h5></div>
                        <div className="col-10">
                            <div className="input">
                                <input id="workingPromoterContribution" name="workingPromoterContribution" type="number" placeholder="Promoter's Contribution" required
                                    value={workingCapital.promoterContribution} onChange={(e) => setWorkingCapital({ promoterContribution: e.target.value, termLoan: workingCapital.termLoan })} />
                                <label htmlFor="workingPromoterContribution">Promoter's Contribution</label>
                            </div>
                        </div>
                        <div className="col-2">
                            <div className="input">
                                <input id="pcPercent2" name="pcPercent2" type="text" placeholder="Percentage %"
                                    value={WCPromoterContributionPercent} disabled />
                                <label htmlFor="pcPercent2">Percentage %</label>
                            </div>
                        </div>
                        <div className="col-10">
                            <div className="input">
                                <input id="workingTermLoan" name="workingTermLoan" type="number" placeholder="Term Loan" required
                                    value={workingCapital.termLoan} onChange={(e) => setWorkingCapital({ termLoan: e.target.value, promoterContribution: workingCapital.promoterContribution })} />
                                <label htmlFor="workingTermLoan">Term Loan</label>
                            </div>
                        </div>
                        <div className="col-2">
                            <div className="input">
                                <input id="tlPercent2" name="tlPercent2" type="text" placeholder="Percentage %"
                                    value={WCTermLoanPercent} disabled />
                                <label htmlFor="tlPercent2">Percentage %</label>
                            </div>
                        </div>
                        <div className="col-10">
                            <div className="input">
                                <input id="totalWorkingCapital" name="totalWorkingCapital" type="number" placeholder="Total Working Capital"
                                    value={totalWorkingCapital} disabled />
                                <label htmlFor="totalWorkingCapital">Total Working Capital</label>
                            </div>
                        </div>
                    </div>
                    <hr />
                    <div className="row">
                        <div className="col-12 my-3"><h5>Total</h5></div>
                        <div className="col-10">
                            <div className="input">
                                <input id="PromoterContributionTotal" name="PromoterContributionTotal" type="number" placeholder="Promoter's Contribution Total" required
                                    value={totalPC} disabled />
                                <label htmlFor="PromoterContributionTotal">Promoter's Contribution Total</label>
                            </div>
                        </div>
                        <div className="col-2">
                            <div className="input">
                                <input id="pcPercent3" name="pcPercent3" type="text" placeholder="Percentage %"
                                    value={TotalPromoterContributionPercent}
                                    disabled />
                                <label htmlFor="pcPercent3">Percentage %</label>
                            </div>
                        </div>
                        <div className="col-10">
                            <div className="input">
                                <input id="TermLoanTotal" name="TermLoanTotal" type="number" placeholder="Term Loan Total" required
                                    value={totalTL} disabled />
                                <label htmlFor="TermLoanTotal">Term Loan Total</label>
                            </div>
                        </div>
                        <div className="col-2">
                            <div className="input">
                                <input id="tlPercent3" name="tlPercent3" type="text" placeholder="Percentage %"
                                    value={TotalTermLoanPercent}
                                    disabled />
                                <label htmlFor="tlPercent3">Percentage %</label>
                            </div>
                        </div>
                        <div className="col-10">
                            <div className="input">
                                <input id="total" name="total" type="number" placeholder="Total"
                                    value={total} disabled />
                                <label htmlFor="totalWorkingCapital">Total</label>
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

export default MeansOfFinance