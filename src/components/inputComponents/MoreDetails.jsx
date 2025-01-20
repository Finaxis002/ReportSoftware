import React, { useEffect, useState } from 'react'
import deleteImg from "../../images/delete.png"
import checkImg from "../../images/check.png"

//     1	Withdrawls	0	150000	250000	350000
//     2	Opening Stock
//     3	Closing Stock

const MoreDetails = ({ handleSave, years }) => {
    //change the projection months to years==================================
    function getEmptyArray() {
        return Array.from({ length: years }).fill(0)
    }

    const [withdrawls, setWithdrawls] = useState(getEmptyArray());
    const [openingStock, setOpeningStock] = useState(getEmptyArray());
    const [closingStock, setClosingStock] = useState(getEmptyArray());

    const handleStockChanges = (name, index, value) => {
        if (name === "withdrawls") {
            let temp = withdrawls;
            temp[index] = value;
            setWithdrawls([...temp])
        }
        else if (name === "openingStock") {
            let temp = openingStock;
            temp[index] = value;
            setOpeningStock([...temp])
        }
        else if (name === "closingStock") {
            let temp = closingStock;
            temp[index] = value;
            setClosingStock([...temp])

            if (index < years - 1) {
                let openingTemp = openingStock;
                openingTemp[index + 1] = value
                setOpeningStock(openingTemp)
            }

        }
    }

    const [currentLibalities, setCurrentLibalities] = useState(
        [
            { particular: 'Uses', years: Array.from({ length: years }).fill(0), isCustom: false },
            { particular: 'Other Current Liabilities', years: Array.from({ length: years }).fill(0), isCustom: false },
            { particular: 'Outstanding Expenses', years: Array.from({ length: years }).fill(0), isCustom: false },
            { particular: 'Sundry Creditors / Trade Payables', years: Array.from({ length: years }).fill(0), isCustom: false },
            { particular: 'Short term loans', years: Array.from({ length: years }).fill(0), isCustom: false },
            { particular: 'Quasi Equity(Important to set Current Ratio)', years: Array.from({ length: years }).fill(0), isCustom: false }
        ]
    )

    const [currentAssets, setCurrentAssets] = useState(
        [
            { particular: 'Sources', years: Array.from({ length: years }).fill(0), isCustom: false },
            { particular: 'Other Current Assets', years: Array.from({ length: years }).fill(0), isCustom: false },
            { particular: 'Prepaid Expenses', years: Array.from({ length: years }).fill(0), isCustom: false },
            { particular: 'Investments', years: Array.from({ length: years }).fill(0), isCustom: false },
            { particular: 'Trade Receivables / Sundry Debtors', years: Array.from({ length: years }).fill(0), isCustom: false },
            { particular: 'Advances to employees & Suppliers', years: Array.from({ length: years }).fill(0), isCustom: false },
            { particular: 'Inventory', years: Array.from({ length: years }).fill(0), isCustom: false },
        ]
    )


    // _________________________________________________________________________________________________________________________

    const addFields = (e) => {
        e.preventDefault();
        let object = { particular: '', years: Array.from({ length: years }).fill(0), isCustom: true }
        setCurrentLibalities([...currentLibalities, object])
    }
    const removeFields = (e, childIndex) => {
        e.preventDefault();
        let data = [...currentLibalities];
        data.splice(childIndex, 1)
        setCurrentLibalities(data)
    }
    const handleFormChange = (event, childIndex, year) => {
        let data = [...currentLibalities];
        // console.log(event.target.name);
        // console.log(data);

        if (event.target.name === 'particular') {
            data[childIndex]['particular'] = event.target.value;
        } else if (event.target.name === 'bold') {
            data[childIndex]['bold'] = !data[childIndex]['bold'];
        } else if (event.target.name === 'boldUnderline') {
            data[childIndex]['boldUnderline'] = !data[childIndex]['boldUnderline'];
        } else {
            data[childIndex]['years'][year] = Number(event.target.value);
        }

        setCurrentLibalities(data);
    }
    // _________________________________________________________________________________________________________________________

    const submit = (e) => {
        e.preventDefault();
        const final = {
            withdrawls,
            openingStock,
            closingStock,
            currentLibalities,
            currentAssets
        }

        handleSave({ moreDetails: { ...final } })
    }

    // _________________________________________________________________________________________________________________________

    const addFields2 = (e) => {
        e.preventDefault();
        let object = { particular: '', years: Array.from({ length: years }).fill(0), isCustom: true }
        setCurrentAssets([...currentAssets, object])
    }
    const removeFields2 = (e, childIndex) => {
        e.preventDefault();
        let data = [...currentAssets];
        data.splice(childIndex, 1)
        setCurrentAssets(data)
    }
    const handleFormChange2 = (event, childIndex, year) => {
        let data = [...currentAssets];

        if (event.target.name === 'particular') {
            data[childIndex]['particular'] = event.target.value;
        } else {
            data[childIndex]['years'][year] = Number(event.target.value);
        }
        setCurrentAssets(data);
    }

    return (
        <div>
            <form onSubmit={submit} className=''>
                <div className='position-relative w-100'>
                    <div className='form-scroll' style={{ paddingBottom: "12%" }}>
                        <table class="table">
                            <thead>
                                <tr>
                                    <th class="header-label">Particulars</th>
                                    {
                                        Array.from({ length: years }).map((a, b) => {
                                            return <th class="header-label">Year {b + 1}</th>
                                        })
                                    }
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <input
                                            name='openingStock'
                                            placeholder='openingStock'
                                            value="Opening Stock"
                                            className='form-control text-center noBorder'
                                            type='text'
                                            disabled
                                        />
                                    </td>
                                    {
                                        openingStock.map((yr, y) => {
                                            return (
                                                <td key={y}>
                                                    <input
                                                        name='value'
                                                        placeholder='value'
                                                        onChange={event => handleStockChanges("openingStock", y, event.target.value)}
                                                        value={yr}
                                                        className='form-control text-end noBorder'
                                                        type='number'
                                                        disabled={y > 0}
                                                    />
                                                </td>
                                            )
                                        })
                                    }
                                </tr>
                                <tr>
                                    <td>
                                        <input
                                            name='closingStock'
                                            placeholder='closingStock'
                                            value="Closing Stock"
                                            className='form-control text-center noBorder'
                                            type='text'
                                            disabled
                                        />
                                    </td>
                                    {
                                        closingStock.map((yr, y) => {
                                            return (
                                                <td key={y}>
                                                    <input
                                                        name='value'
                                                        placeholder='value'
                                                        onChange={event => handleStockChanges("closingStock", y, event.target.value)}
                                                        value={yr}
                                                        className='form-control text-end noBorder'
                                                        type='number'
                                                    />
                                                </td>
                                            )
                                        })
                                    }
                                </tr>
                                <tr>
                                    <td>
                                        <input
                                            name='withdrawls'
                                            placeholder='withdrawls'
                                            value="Withdrawls"
                                            className='form-control text-center noBorder'
                                            type='text'
                                            disabled
                                        />
                                    </td>
                                    {
                                        withdrawls.map((yr, y) => {
                                            return (
                                                <td key={y}>
                                                    <input
                                                        name='value'
                                                        placeholder='value'
                                                        onChange={event => handleStockChanges("withdrawls", y, event.target.value)}
                                                        value={yr}
                                                        className='form-control text-end noBorder'
                                                        type='number'
                                                    />
                                                </td>
                                            )
                                        })
                                    }
                                </tr>
                            </tbody>
                        </table>
                        <h5 className='text-start text-primary mt-4 mb-0'>Current Libalities</h5>
                        <hr className='mt-0 mb-1' />
                        <table class="table">
                            <thead>
                                <tr>
                                    <th class="header-label">Index</th>
                                    <th class="header-label">Particulars</th>
                                    {
                                        Array.from({ length: years }).map((a, b) => {
                                            return <th class="header-label">Year {b + 1}</th>
                                        })
                                    }
                                    <th class="header-label"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    currentLibalities.map((entry, i) => {
                                        return (
                                            <tr key={i} className='rowHover'>
                                                <td>{i + 1}</td>
                                                <td>
                                                    <input
                                                        name='particular'
                                                        placeholder='Particular'
                                                        onChange={event => handleFormChange(event, i)}
                                                        value={entry.particular}
                                                        className='form-control text-center noBorder'
                                                        type='text'
                                                        disabled={!entry.isCustom}
                                                    />
                                                </td>
                                                {
                                                    entry.years.map((yr, y) => {
                                                        return (
                                                            <td key={y}>
                                                                <input
                                                                    name='value'
                                                                    placeholder='value'
                                                                    onChange={event => handleFormChange(event, i, y)}
                                                                    value={yr}
                                                                    className='form-control text-end noBorder'
                                                                    type='number'
                                                                />
                                                            </td>
                                                        )
                                                    })
                                                }
                                                <td>
                                                    {
                                                        entry.isCustom ?
                                                            <button className='btn h-100 mt-auto' style={{ width: "50px", padding: "0", border: "none" }} onClick={(e) => removeFields(e, i)}>
                                                                <img src={deleteImg} alt="Remove" style={{ width: "30px", marginTop: "5%" }} />
                                                            </button>
                                                            :
                                                            <span className='h-100 mt-auto mx-2' style={{ width: "43px", padding: "0", border: "none" }}>
                                                                <img src={checkImg} alt="add" style={{ width: "25px", marginTop: "10%" }} />
                                                            </span>
                                                    }
                                                </td>
                                            </tr>
                                        )
                                    })
                                }
                            </tbody>
                        </table>
                        <button className='btn btn-sm btn-primary px-4 me-auto' type='button' onClick={(e) => addFields(e)}>Add Libality +</button>

                        <h5 className='text-start text-primary mt-4 mb-0'>Current Assets</h5>
                        <hr className='mt-0 mb-1' />
                        <table class="table">
                            <thead>
                                <tr>
                                    <th class="header-label">Index</th>
                                    <th class="header-label">Particulars</th>
                                    {
                                        Array.from({ length: years }).map((a, b) => {
                                            return <th class="header-label">Year {b + 1}</th>
                                        })
                                    }
                                    <th class="header-label"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    currentAssets.map((entry, i) => {
                                        return (
                                            <tr key={i}>
                                                <td>{i + 1}</td>
                                                <td>
                                                    <input
                                                        name='particular'
                                                        placeholder='Particular'
                                                        onChange={event => handleFormChange2(event, i)}
                                                        value={entry.particular}
                                                        className='form-control text-center noBorder'
                                                        type='text'
                                                        disabled={!entry.isCustom}
                                                    />
                                                </td>
                                                {
                                                    entry.years.map((yr, y) => {
                                                        return (
                                                            <td key={y}>
                                                                <input
                                                                    name='value'
                                                                    placeholder='value'
                                                                    onChange={event => handleFormChange2(event, i, y)}
                                                                    value={yr}
                                                                    className='form-control text-end noBorder'
                                                                    type='number'
                                                                />
                                                            </td>
                                                        )
                                                    })
                                                }
                                                <td>
                                                    {
                                                        entry.isCustom ?
                                                            <button className='btn h-100 mt-auto' style={{ width: "50px", padding: "0", border: "none" }} onClick={(e) => removeFields2(e, i)}>
                                                                <img src={deleteImg} alt="Remove" style={{ width: "30px", marginTop: "5%" }} />
                                                            </button>
                                                            :
                                                            <span className='h-100 mt-auto mx-2' style={{ width: "43px", padding: "0", border: "none" }}>
                                                                <img src={checkImg} alt="add" style={{ width: "25px", marginTop: "10%" }} />
                                                            </span>
                                                    }
                                                </td>
                                            </tr>
                                        )
                                    })
                                }
                            </tbody>
                        </table>
                        <button className='btn btn-sm btn-success px-4 me-auto' type='button' onClick={(e) => addFields2(e)}>Add Asset +</button>

                    </div>
                </div>
            </form>
            <div className="">
                <button className='btn btn-success px-5' onClick={submit}>Save</button>
            </div>
        </div >
        )
}

export default MoreDetails