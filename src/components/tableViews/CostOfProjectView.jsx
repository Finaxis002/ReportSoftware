import React from 'react'

const CostOfProjectView = ({ data, totalCostOfProject }) => {
    return (
        <div className="container mt-4 bg-light px-4">
            <h2 className='py-4 text-center'>Cost Of Project</h2>
            <div className="table-responsive">
                <table className="table table-striped table-bordered table-hover">
                    <thead>
                        <tr>
                            <th className='bg-headPurple'>Name</th>
                            <th className='bg-headPurple'>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            data.map((key, i) => {
                                return (
                                    <tr key={i}>
                                        <td>{key.name}</td>
                                        <td> {key.amount}</td>
                                    </tr>
                                )
                            })
                        }
                        <tr>
                            <td className='bg-totalRed'>Total Cost of Project</td>
                            <td className='bg-totalRed'>{totalCostOfProject}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

    )
}

export default CostOfProjectView