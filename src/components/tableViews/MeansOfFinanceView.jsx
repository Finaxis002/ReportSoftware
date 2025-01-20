import React from 'react'

const MeansOfFinanceView = ({ data }) => {
    return (
        <div className="container mt-4 bg-light px-4">
            <h2 className='py-4 text-center'>Means of Finance</h2>
            <div className="table-responsive">
                <table className="table table-striped table-bordered table-hover">
                    <thead>
                        <tr>
                            <th className='bg-headPurple'>Category</th>
                            <th className='bg-headPurple'>Loan</th>
                            <th className='bg-headPurple'>Loan (%)</th>
                            <th className='bg-headPurple'>Promoter Contribution</th>
                            <th className='bg-headPurple'>Promoter Contribution (%)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Term Loan</td>
                            <td>{data.termLoan.termLoan}</td>
                            <td>{data.TLTermLoanPercent}%</td>
                            <td>{data.termLoan.promoterContribution}</td>
                            <td>{data.TLPromoterContributionPercent}%</td>
                        </tr>
                        <tr>
                            <td>Working Capital</td>
                            <td>{data.workingCapital.termLoan}</td>
                            <td>{data.WCTermLoanPercent}%</td>
                            <td>{data.workingCapital.promoterContribution}</td>
                            <td>{data.WCPromoterContributionPercent}%</td>
                        </tr>
                        <tr>
                            <td className='bg-totalRed'>Total</td>
                            <td className='bg-totalRed'>{data.totalTL}</td>
                            <td className='bg-totalRed'>{data.TotalTermLoanPercent}%</td>
                            <td className='bg-totalRed'>{data.totalPC}</td>
                            <td className='bg-totalRed'>{data.TotalPromoterContributionPercent}%</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className="table-responsive">
                <table className="table table-striped table-bordered table-hover">
                    <thead>
                        <tr>
                            <th className='bg-headPurple'>Category</th>
                            <th className='bg-headPurple'>Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Total Term Loan</td>
                            <td>{data.totalTermLoan}</td>
                        </tr>
                        <tr>
                            <td>Total Working Capital</td>
                            <td>{data.totalWorkingCapital}</td>
                        </tr>
                        <tr>
                            <td className='bg-totalRed'>Total</td>
                            <td className='bg-totalRed'>{data.total}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

    )
}


export default MeansOfFinanceView