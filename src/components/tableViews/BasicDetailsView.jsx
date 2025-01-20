import React from 'react'

const BasicDetailsView = ({ data }) => {
    return (
        <div className="container mt-4 bg-light px-4 ">
            <h2 className='py-4 text-center'>PROJECT SYNOPSIS</h2>
            <div className="table-responsive">
                <table className="table table-striped table-bordered table-hover">
                    <thead>
                        <tr>
                            <th className='bg-headPurple'>Particulars</th>
                            <th className='bg-headPurple'>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            Object.keys(data).map((key) => {
                                if (key === "allPartners") {
                                    return (
                                        data[key].map((part, i) => {
                                            return (
                                                <tr key={i}>
                                                    <td>Partner {i + 1}</td>
                                                    <td>{part.partnerName} - {part.partnerAadhar} - {part.partnerDin}</td>
                                                </tr>
                                            )
                                        })
                                    )
                                } else {
                                    return (
                                        <tr key={key}>
                                            <td>{key}</td>
                                            <td> {data[key]}</td>
                                        </tr>
                                    )
                                }
                            })
                        }
                    </tbody>
                </table>
            </div>
        </div>

    )
}

export default BasicDetailsView