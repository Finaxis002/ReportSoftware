import React from 'react'

const ReportSettingsView = ({ data }) => {
    return (
        <div className="container mt-4 bg-light px-4">
            <h2 className='py-4 text-center'>Report Settings</h2>
            <div className="table-responsive">
                <table className="table table-striped table-bordered table-hover">
                    <thead>
                        <tr>
                            <th className='bg-headPurple'>Name</th>
                            <th className='bg-headPurple'>Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            Object.keys(data).map((key) => {
                                return (
                                    <tr key={key}>
                                        <td>{key}</td>
                                        <td> {data[key]}</td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>
            </div>
        </div>

    )
}
export default ReportSettingsView