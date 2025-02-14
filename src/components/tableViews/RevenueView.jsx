import React from 'react'

const RevenueView = ({ data }) => {
    // {
    //     "type": "others",
    //         "entries": formFields,
    //             "totalRevenue": totalRevenueForOthers
    // }
    // {
    //     "type": "monthly",
    //         "entries": formFields2,
    //             totalMonthlyRevenue,
    //             noOfMonths,
    //             totalRevenue
    // }
    const years = data.totalRevenue.length;

    return (
        <div className="container mt-4 bg-light px-4">
            <h2 className='py-4 text-center'>Projected Revenue</h2>
            {
                data.type === "others" ?
                    <div className="table-responsive">
                        <table className="table table-striped table-bordered table-hover">
                            <thead>
                                <tr>
                                    <th class="header-label">Index</th>
                                    <th class="header-label">Particulars</th>
                                    {
                                        Array.from({ length: years }).map((a, b) => {
                                            return <th class="header-label">Year {b + 1}</th>
                                        })
                                    }
                                    <th class="header-label">Type</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    data.entries.map((entry, i) => {
                                        return (
                                            <tr key={i} className={'rowHover ' +
                                                entry.rowType === "0" ? 'normalRow' :
                                                entry.rowType === "1" ? 'headingRow' :
                                                    entry.rowType === "2" ? 'boldRow' :
                                                        entry.rowType === "3" ? 'boldUnderlineRow' : ''
                                            }>
                                                <td>{i + 1}</td>
                                                <td>
                                                    {entry.particular}
                                                </td>
                                                {
                                                    entry.years.map((yr, y) => {
                                                        return (
                                                            <td key={y}>
                                                                {yr}
                                                            </td>
                                                        )
                                                    })
                                                }
                                                <td>
                                                    {entry.rowType}
                                                </td>
                                            </tr>
                                        )
                                    })
                                }
                                <tr>
                                    {
                                        data.totalRevenue.map((v, i) => {
                                            return (
                                                <td key={i} className='bg-highlightGreen'>
                                                    {v}
                                                </td>
                                            )
                                        })
                                    }
                                </tr>

                            </tbody>
                        </table>
                    </div>
                    :
                    <div className="table-responsive">
                        <table className="table table-striped table-bordered table-hover">
                            <thead>
                                <tr>
                                    <th className='bg-headPurple'>Index</th>
                                    <th className='bg-headPurple'>Particulars</th>
                                    {
                                        Array.from({ length: years }).map((a, b) => {
                                            return <th className='bg-headPurple'>Year {b + 1}</th>
                                        })
                                    }
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    data.entries.map((entry, i) => {
                                        return (
                                            <tr key={i}>
                                                <td>{i + 1}</td>
                                                <td>
                                                    {entry.particular}
                                                </td>
                                                {
                                                    entry.years.map((yr, y) => {
                                                        return (
                                                            <td key={y}>
                                                                {yr}
                                                            </td>
                                                        )
                                                    })
                                                }
                                            </tr>
                                        )
                                    })
                                }
                                <tr>
                                    <td className='bg-totalRed'>Total</td>
                                    <td className='bg-totalRed'></td>
                                    {
                                        data.totalMonthlyRevenue.map((v, i) => {
                                            return (
                                                <td className='bg-totalRed' key={i}>{v}</td>
                                            )
                                        })
                                    }
                                </tr>
                                <tr>
                                    <td>No. Of Months</td>
                                    <td></td>
                                    {
                                        data.noOfMonths.map((v, i) => {
                                            return (
                                                <td key={i}>
                                                    {v}
                                                </td>
                                            )
                                        })
                                    }
                                </tr>
                                <tr>
                                    <td className='bg-highlightGreen'>Total Revenue</td>
                                    <td className='bg-highlightGreen'></td>
                                    {
                                        data.totalRevenue.map((v, i) => {
                                            return (
                                                <td className='bg-highlightGreen' key={i}>{v}</td>
                                            )
                                        })
                                    }
                                </tr>

                            </tbody>
                        </table>
                    </div>
            }
        </div >)
}

export default RevenueView