import React from 'react'

const DepriciationTableView = ({ data }) => {
    console.log(data);
    const years = data.grossFixedAsset[0].yearWiseData
    return (
        <div className="container mt-4 bg-light px-4">
            <h2 className='py-4 text-center'>Calculation of Depreciation</h2>
            <div className="table-responsive">
                <h5>Gross Fixed Asset</h5>
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
                            data.grossFixedAsset.map((parti, i) => {
                                return (
                                    <tr key={i}>
                                        <td>{parti.name}</td>
                                        {
                                            parti.yearWiseData.map((yr, j) => {
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
                                data.totalGrossFixedAssets.map((t, i) => {
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
                <h5>Depreciation</h5>
                <table className="table table-striped table-bordered table-hover">
                    <thead>
                        <tr>
                            <th className='bg-headPurple'>Name</th>
                            <th className='bg-headPurple'>Rate</th>
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
                            data.depreciation.map((parti, i) => {
                                return (
                                    <tr key={i}>
                                        <td>{parti.name}</td>
                                        <td>{parti.rate} %</td>
                                        {
                                            parti.yearWiseData.map((yr, j) => {
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
                            <td className='bg-totalRed'> - </td>
                            {
                                data.totalDepreciation.map((t, i) => {
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
                <h5>Cummulative Depriciation</h5>
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
                            data.cummulativeDepreciation.map((parti, i) => {
                                return (
                                    <tr key={i}>
                                        <td>{parti.name}</td>
                                        {
                                            parti.yearWiseData.map((yr, j) => {
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
                                data.totalCummulativeDepreciation.map((t, i) => {
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
                <h5>Net Fixed Asset</h5>
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
                            data.netFixedAsset.map((parti, i) => {
                                return (
                                    <tr key={i}>
                                        <td>{parti.name}</td>
                                        {
                                            parti.yearWiseData.map((yr, j) => {
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
                                data.totalNetFixedAssets.map((t, i) => {
                                    return (
                                        <td key={i} className='bg-totalRed'>{t}</td>
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

export default DepriciationTableView