import React from 'react'

const SalariesView = ({ data }) => {
    return (
        <div className="container mt-4 bg-light px-4">
            <h2 className='py-4 text-center'>Projected Salaries & Wages for the initial year</h2>
            <div className="table-responsive">
                <table className="table table-striped table-bordered table-hover">
                    <thead>
                        <tr>
                            <th className='bg-headPurple'>Type of Worker</th>
                            <th className='bg-headPurple'>No. of workers</th>
                            <th className='bg-headPurple'>Wages per month</th>
                            <th className='bg-headPurple'>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            data.map((key, i) => {
                                return (
                                    <tr key={i}>
                                        <td>{key.name}</td>
                                        <td> {key.quantity}</td>
                                        <td> {key.amount}</td>
                                        <td> {key.value}</td>
                                    </tr>
                                )
                            })
                        }
                        <tr>
                            <td className='bg-totalRed'>Total</td>
                            <td className='bg-totalRed'>-</td>
                            <td className='bg-totalRed'>-</td>
                            <td className='bg-totalRed'>{0}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

    )
}

export default SalariesView