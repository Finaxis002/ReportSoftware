import React from 'react'

const ProfitablityTableView = ({ data }) => {
    console.log(data);
    const years = data.expensesTotal
    return (
        <div className="container mt-4 bg-light px-4">
            <h2 className='py-4 text-center'>Projected Profitability Statement</h2>
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
                            <td>Gross Revenue</td>
                            {
                                data.revenueYearwise.map((yr, j) => {
                                    return (
                                        <td key={j}>{yr}</td>
                                    )
                                })
                            }
                        </tr>
                        <tr>
                            <td>Opening Stock</td>
                            {
                                data.openingStockYearwise.map((yr, j) => {
                                    return (
                                        <td key={j}>{yr}</td>
                                    )
                                })
                            }
                        </tr>
                        <tr>
                            <td>Closing Stock</td>
                            {
                                data.closingStockYearwise.map((yr, j) => {
                                    return (
                                        <td key={j}>{yr}</td>
                                    )
                                })
                            }
                        </tr>
                        <tr>
                            <td>Total Revenue</td>
                            {
                                data.totalRevenue.map((yr, j) => {
                                    return (
                                        <td key={j}>{yr}</td>
                                    )
                                })
                            }
                        </tr>
                        {/* <tr>
                            <td>Revenue + Closing Stock</td>
                            {
                                data.revenue_closingstock_total.map((yr, j) => {
                                    return (
                                        <td key={j}>{yr}</td>
                                    )
                                })
                            }
                        </tr> */}
                        {/* <tr>
                            <td>Expenses + Opening Stock</td>
                            {
                                data.expenses_openingStock_total.map((yr, j) => {
                                    return (
                                        <td key={j}>{yr}</td>
                                    )
                                })
                            }
                        </tr> */}
                        <tr>
                            <td className='bg-headPurple'>Direct Expenses</td>
                            {
                                years.map((yr, i) => {
                                    return (
                                        <td className='bg-headPurple' key={i}>Year {i + 1}</td>
                                    )
                                })
                            }
                        </tr>
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
                        <tr>
                            <td className='bg-highlightGreen'>Gross Profit</td>
                            {
                                data.grossProfitYearwise.map((yr, j) => {
                                    return (
                                        <td key={j} className='bg-highlightGreen'>{yr}</td>
                                    )
                                })
                            }
                        </tr>
                        <tr>
                            <td className='bg-headPurple'>InDirect Expenses</td>
                            {
                                years.map((yr, i) => {
                                    return (
                                        <td className='bg-headPurple' key={i}>Year {i + 1}</td>
                                    )
                                })
                            }
                        </tr>
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
                            <td>Depriciation</td>
                            {
                                data.depriciationYearwise.map((yr, j) => {
                                    return (
                                        <td key={j}>{yr}</td>
                                    )
                                })
                            }
                        </tr>
                        <tr>
                            <td>Interest on Term Loan</td>
                            {
                                data.interestOnTLYearwise.map((yr, j) => {
                                    return (
                                        <td key={j}>{yr}</td>
                                    )
                                })
                            }
                        </tr>
                        <tr>
                            <td>Interest on Working Capital Loan</td>
                            {
                                data.interestOnWCYearwise.map((yr, j) => {
                                    return (
                                        <td key={j}>{yr}</td>
                                    )
                                })
                            }
                        </tr>
                        <tr>
                            <td className='bg-totalRed'>Total</td>
                            {
                                data.miscTotalYearwise.map((t, i) => {
                                    return (
                                        <td key={i} className='bg-totalRed'>{t}</td>
                                    )
                                })
                            }
                        </tr>
                        {/* <tr>
                            <td>Expenses + Depriciation + Interest on TL + Interest on WC</td>
                            {
                                data.miscTotalYearwise.map((yr, j) => {
                                    return (
                                        <td key={j}>{yr}</td>
                                    )
                                })
                            }
                        </tr> */}
                        <tr>
                            <td className='bg-highlightGreen'>Profit before taxes</td>
                            {
                                data.profitBeforeTaxYearwise.map((yr, j) => {
                                    return (
                                        <td key={j} className='bg-highlightGreen'>{yr}</td>
                                    )
                                })
                            }
                        </tr>
                        <tr>
                            <td>Income Tax</td>
                            {
                                data.incomeTaxYearwise.map((yr, j) => {
                                    return (
                                        <td key={j}>{yr}</td>
                                    )
                                })
                            }
                        </tr>
                        <tr>
                            <td className='bg-highlightGreen'>Profit after taxes</td>
                            {
                                data.profitAfterTaxYearwise.map((yr, j) => {
                                    return (
                                        <td key={j} className='bg-highlightGreen'>{yr}</td>
                                    )
                                })
                            }
                        </tr>
                        <tr>
                            <td>Withdrawls</td>
                            {
                                data.withdrawlsYerwise.map((yr, j) => {
                                    return (
                                        <td key={j}>{yr}</td>
                                    )
                                })
                            }
                        </tr>
                        <tr>
                            <td>Balance Transfer To Balance Sheet</td>
                            {
                                data.balanceTransferToBalanceSheet.map((yr, j) => {
                                    return (
                                        <td key={j}>{yr}</td>
                                    )
                                })
                            }
                        </tr>
                        <tr>
                            <td>Cumilative Balance Transfer To Balance Sheet</td>
                            {
                                data.cumilativeBalanceTransferToBalanceSheet.map((yr, j) => {
                                    return (
                                        <td key={j}>{yr}</td>
                                    )
                                })
                            }
                        </tr>
                        <tr>
                            <td className='bg-highlightGreen'>Cash Profit</td>
                            {
                                data.cashProfit.map((yr, j) => {
                                    return (
                                        <td key={j} className='bg-highlightGreen'>{yr}</td>
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

export default ProfitablityTableView