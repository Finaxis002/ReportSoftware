import React from 'react'

const RepaymentTableView = ({ data }) => {
    console.log(data);
    //starting month
    //tableData
    //tableTotalData
    let startingMonth = data.startingMonth;
    let totalIndex = 0;


    const getTotal = (index) => {
        // console.log("Outer");
        if ((startingMonth === 12 && data.tableTotalData.length > 0) || index === -1) {
            const totalData = data.tableTotalData[totalIndex];
            totalIndex++;
            // console.log("Inner", totalData);
            startingMonth = 1;
            return (
                <tr key={totalData.repaymentTotal}>
                    <td className='bg-totalRed'>Total</td>
                    <td className='bg-totalRed'>-</td>
                    <td className='bg-totalRed'>-</td>
                    <td className='bg-totalRed'>{totalData.repaymentTotal}</td>
                    <td className='bg-totalRed'>-</td>
                    <td className='bg-totalRed'>{totalData.interestTotal}</td>
                    <td className='bg-totalRed'>{totalData.totalTotal}</td>
                </tr>
            )
        }
        else {
            // console.log("Else");
            startingMonth++;
            return (
                <></>
            )
        }
    }


    return (
        <div className="container mt-4 bg-light px-4">
            <h2 className='py-4 text-center'>Interest & Repayment of Term Loan</h2>
            <div className="table-responsive">
                {/* <h5>Gross Fixed Asset</h5> */}
                <table className="table table-striped table-bordered table-hover">
                    <thead>
                        <tr>
                            <th className='bg-headPurple'>S.No.</th>
                            <th className='bg-headPurple'>Month</th>
                            <th className='bg-headPurple'>Principal</th>
                            <th className='bg-headPurple'>Repayment</th>
                            <th className='bg-headPurple'>Closing Balance</th>
                            <th className='bg-headPurple'>Interest Amount</th>
                            <th className='bg-headPurple'>Total Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            data.tableData.map((parti, i) => {
                                return (
                                    <>
                                        <tr key={i}>
                                            <td>{parti.sno}</td>
                                            <td>{parti.month}</td>
                                            <td>{parti.principal}</td>
                                            <td>{parti.repayment}</td>
                                            <td>{parti.closingBalance}</td>
                                            <td>{parti.interestAmount}</td>
                                            <td>{parti.total}</td>
                                        </tr>
                                        {
                                            getTotal(i)
                                        }
                                    </>
                                )
                            })
                        }
                        {
                            getTotal(-1)
                        }
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RepaymentTableView