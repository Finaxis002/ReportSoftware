import React from 'react'

const CashFlowView = ({ data }) => {
    console.log(data);
    //     ,
    //     ,
    //     ,
    //     ,
    //     ,
    //     ,
    //     ,
    //     ,
    //     ,currentLibalities
    //     ,
    //     ,
    //     ,
    //     ,
    //     ,
    //     ,
    //     currentAssets,
    //     ,
    //     ,
    //     ,
    //     ,
    //     

    const years = Array.from({ length: data.years }).fill(0);
    return (
        <div className="container mt-4 bg-light px-4">
            <h2 className='py-4 text-center'>Cash Flow</h2>
            <div className="table-responsive">
                <table className="table table-striped table-bordered table-hover">
                    <thead>
                        <tr>
                            <th className='bg-headPurple'>Name</th>
                            {
                                years.map((yr, i) => {
                                    return (
                                        <th className='bg-headPurple' key={i}>Year {i + 1}</th>
                                    )
                                })
                            }
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>netProfitBeforeInterestAndTax</td>
                            {
                                data.netProfitBeforeInterestAndTax.map((yr, j) => {
                                    return (
                                        <td key={j}>{yr}</td>
                                    )
                                })
                            }
                        </tr>
                        <tr>
                            <td>capital</td>
                            {
                                data.capital.map((yr, j) => {
                                    return (
                                        <td key={j}>{yr}</td>
                                    )
                                })
                            }
                        </tr>
                        <tr>
                            <td>reservesAndSubsidies</td>
                            {
                                data.reservesAndSubsidies.map((yr, j) => {
                                    return (
                                        <td key={j}>{yr}</td>
                                    )
                                })
                            }
                        </tr>
                        <tr>
                            <td>bankLoan</td>
                            {
                                data.bankLoan.map((yr, j) => {
                                    return (
                                        <td key={j}>{yr}</td>
                                    )
                                })
                            }
                        </tr>
                        <tr>
                            <td>governmentGrants</td>
                            {
                                data.governmentGrants.map((yr, j) => {
                                    return (
                                        <td key={j}>{yr}</td>
                                    )
                                })
                            }
                        </tr>
                        <tr>
                            <td>workingCapitalLoan</td>
                            {
                                data.workingCapitalLoan.map((yr, j) => {
                                    return (
                                        <td key={j}>{yr}</td>
                                    )
                                })
                            }
                        </tr>
                        <tr>
                            <td>depriciation</td>
                            {
                                data.depriciation.map((yr, j) => {
                                    return (
                                        <td key={j}>{yr}</td>
                                    )
                                })
                            }
                        </tr>
                        <tr>
                            <td>currentLibalitiesTotal</td>
                            {
                                data.currentLibalitiesTotal.map((yr, j) => {
                                    return (
                                        <td key={j}>{yr}</td>
                                    )
                                })
                            }
                        </tr>
                        <tr>
                            <td>total1</td>
                            {
                                data.total1.map((yr, j) => {
                                    return (
                                        <td key={j}>{yr}</td>
                                    )
                                })
                            }
                        </tr>
                        <tr>
                            <td>fixedAssets</td>
                            {
                                data.fixedAssets.map((yr, j) => {
                                    return (
                                        <td key={j}>{yr}</td>
                                    )
                                })
                            }
                        </tr>
                        <tr>
                            <td>repaymentOfTermLoan</td>
                            {
                                data.repaymentOfTermLoan.map((yr, j) => {
                                    return (
                                        <td key={j}>{yr}</td>
                                    )
                                })
                            }
                        </tr>
                        <tr>
                            <td>interestOnTermLoan</td>
                            {
                                data.interestOnTermLoan.map((yr, j) => {
                                    return (
                                        <td key={j}>{yr}</td>
                                    )
                                })
                            }
                        </tr>
                        <tr>
                            <td>interestOnWorkingCapital</td>
                            {
                                data.interestOnWorkingCapital.map((yr, j) => {
                                    return (
                                        <td key={j}>{yr}</td>
                                    )
                                })
                            }
                        </tr>
                        <tr>
                            <td>incomeTax</td>
                            {
                                data.incomeTax.map((yr, j) => {
                                    return (
                                        <td key={j}>{yr}</td>
                                    )
                                })
                            }
                        </tr>
                        <tr>
                            <td>withdrawls</td>
                            {
                                data.withdrawls.map((yr, j) => {
                                    return (
                                        <td key={j}>{yr}</td>
                                    )
                                })
                            }
                        </tr>
                        <tr>
                            <td>currentAssetsTotal</td>
                            {
                                data.currentAssetsTotal.map((yr, j) => {
                                    return (
                                        <td key={j}>{yr}</td>
                                    )
                                })
                            }
                        </tr>
                        <tr>
                            <td>total2</td>
                            {
                                data.total2.map((yr, j) => {
                                    return (
                                        <td key={j}>{yr}</td>
                                    )
                                })
                            }
                        </tr>
                        <tr>
                            <td className='bg-highlightGreen'>openingCashBalance</td>
                            {
                                data.openingCashBalance.map((yr, j) => {
                                    return (
                                        <td key={j} className='bg-highlightGreen'>{yr}</td>
                                    )
                                })
                            }
                        </tr>
                        <tr>
                            <td>surplus</td>
                            {
                                data.surplus.map((yr, j) => {
                                    return (
                                        <td key={j}>{yr}</td>
                                    )
                                })
                            }
                        </tr>
                        <tr>
                            <td>closingCashBalance</td>
                            {
                                data.closingCashBalance.map((yr, j) => {
                                    return (
                                        <td key={j}>{yr}</td>
                                    )
                                })
                            }
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CashFlowView