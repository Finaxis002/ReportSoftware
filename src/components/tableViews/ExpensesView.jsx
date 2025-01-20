import React from 'react'

const ExpensesView = ({ data }) => {
    const years = data.expensesTotal
    return (
        <div className="container mt-4 bg-light px-4">
            <h2 className='py-4 text-center'>Projected Expenses</h2>
            <div className="table-responsive">
                <h5>Direct Expenses</h5>
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
                        {
                            data.directExpensesYearwiseData.map((parti, i) => {
                                return (
                                    <tr key={i}>
                                        <td>{parti.name}</td>
                                        {
                                            parti.values.map((yr, j) => {
                                                return (
                                                    <td key={j}>{yr}</td>
                                                )
                                            })
                                        }
                                    </tr>
                                )
                            })
                        }
                        <tr>
                            <td className='bg-totalRed'>Total</td>
                            {
                                data.directExpensesTotal.map((t, i) => {
                                    return (
                                        <td key={i} className='bg-totalRed'>{t}</td>
                                    )
                                })
                            }
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className="table-responsive">
                <h5>InDirect Expenses</h5>
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
                        {
                            data.inDirectExpensesYearwiseData.map((parti, i) => {
                                return (
                                    <tr key={i}>
                                        <td>{parti.name}</td>
                                        {
                                            parti.values.map((yr, j) => {
                                                return (
                                                    <td key={j}>{yr}</td>
                                                )
                                            })
                                        }
                                    </tr>
                                )
                            })
                        }
                        <tr>
                            <td className='bg-totalRed'>Total</td>
                            {
                                data.inDirentExpensesTotal.map((t, i) => {
                                    return (
                                        <td key={i} className='bg-totalRed'>{t}</td>
                                    )
                                })
                            }
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className="table-responsive">
                <table className="table table-striped table-bordered table-hover">
                    <tbody>
                        <tr>
                            <td className='bg-highlightGreen'>Total Expenses</td>
                            {
                                data.expensesTotal.map((t, i) => {
                                    return (
                                        <td key={i} className='bg-highlightGreen'>{t}</td>
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

export default ExpensesView