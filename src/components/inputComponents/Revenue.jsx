import React, { useEffect, useState } from 'react'
import deleteImg from "../../images/delete.png"
import checkImg from "../../images/check.png"

const Revenue = ({ handleSave, years }) => {
    //change the projection months to years==================================

    //rowType ==> 0:Normal, 1:Heading, 2:Bold, 3:Bold&Underline

    const [formFields, setFormFields] = useState(
        [
            { particular: 'p1', years: Array.from({ length: years }).fill(0), rowType: "0" },
            // { particular: 'p2', years: [1, 2, 3, 4, 5], bold: false, boldUnderline: false },
            // { particular: 'p3', years: [1, 2, 3, 4, 5], bold: false, boldUnderline: false },
        ]
    )
    //totalRevenue for others type
    const [totalRevenueForOthers, setTotalRevenueForOthers] = useState(Array.from({ length: years }).fill(0))

    const [formFields2, setFormFields2] = useState(
        [
            { particular: 'p1', years: Array.from({ length: years }).fill(0) },
            // { particular: 'p2', years: [1, 2, 3, 4, 5] },
            // { particular: 'p3', years: [1, 2, 3, 4, 5] },
        ]
    )


    // _________________________________________________________________________________________________________________________

    const addFields = (e) => {
        e.preventDefault();
        let object = { particular: '', years: Array.from({ length: years }).fill(0), rowType: "0" }
        setFormFields([...formFields, object])
    }
    const removeFields = (e, childIndex) => {
        e.preventDefault();
        let data = [...formFields];
        data.splice(childIndex, 1)
        setFormFields(data)
    }
    const handleFormChange = (event, childIndex, year) => {
        let data = [...formFields];
        console.log(event.target.name);
        console.log(data);

        if (event.target.name === 'particular') {
            data[childIndex]['particular'] = event.target.value;
        } else if (event.target.name === 'rowType') {
            data[childIndex]['rowType'] = event.target.value;
        } else {
            data[childIndex]['years'][year] = Number(event.target.value);
        }

        setFormFields(data);
    }

    const handleTotalRevenueForOthersChange = (value, i) => {
        let temp = [...totalRevenueForOthers];
        temp[i] = Number(value);
        setTotalRevenueForOthers(temp)
    }
    // _________________________________________________________________________________________________________________________

    const submit = (e) => {
        e.preventDefault();
        const final = {
            "revenue": formType ?
                {
                    "type": "others",
                    "entries": formFields,
                    "totalRevenue": totalRevenueForOthers
                }
                :
                {
                    "type": "monthly",
                    "entries": formFields2,
                    totalMonthlyRevenue,
                    noOfMonths,
                    totalRevenue
                }
        }

        handleSave({ ...final })
    }

    // _________________________________________________________________________________________________________________________

    const [formType, setFormType] = useState(false)
    const toggleType = (value) => {
        console.log(value);
        setFormType(value)
    }

    // _________________________________________________________________________________________________________________________

    const addFields2 = (e) => {
        e.preventDefault();
        let object = { particular: '', years: Array.from({ length: years }).fill(0) }
        setFormFields2([...formFields2, object])
    }
    const removeFields2 = (e, childIndex) => {
        e.preventDefault();
        let data = [...formFields2];
        data.splice(childIndex, 1)
        setFormFields2(data)
    }
    const handleFormChange2 = (event, childIndex, year) => {
        let data = [...formFields2];

        if (event.target.name === 'particular') {
            data[childIndex]['particular'] = event.target.value;
        } else {
            data[childIndex]['years'][year] = Number(event.target.value);
        }
        setFormFields2(data);
    }

    const [totalMonthlyRevenue, setTotalMonthlyRevenue] = useState(Array.from({ length: years }).fill(0));
    const [noOfMonths, setNoOfMonths] = useState(Array.from({ length: years }).fill(12));
    const [totalRevenue, setTotalRevenue] = useState(Array.from({ length: years }).fill(0));

    useEffect(() => {
        let tempMonthlyRevenue = [...totalMonthlyRevenue];
        tempMonthlyRevenue = tempMonthlyRevenue.map((val) => {
            return 0;
        })
        formFields2.map((entry) => {
            entry['years'].forEach((sub, index) => {
                tempMonthlyRevenue[index] += sub;
                // totalMonthlyRevenue[index]+=Number(_.toString())
            })
            return null
        })
        setTotalMonthlyRevenue([...tempMonthlyRevenue]);
    }, [formFields2])

    useEffect(() => {
        let tempRevenue = totalMonthlyRevenue.map((val, i) => {
            return totalMonthlyRevenue[i] * noOfMonths[i];
        })

        console.log(tempRevenue);
        setTotalRevenue(tempRevenue);
    }, [noOfMonths, formFields2])

    const changeMonth = (index, val) => {
        let temp = noOfMonths;
        temp[index] = parseInt(val);
        setNoOfMonths([...temp]);
    }
    // _________________________________________________________________________________________________________________________

    return (
        <div>
            <div className='toggleBtn'>
                {
                    formType ?
                        <button className='btn btn-sm btn-primary px-4 me-auto' type='button' onClick={(e) => addFields(e)}>Add Field +</button>
                        :
                        <button className='btn btn-sm btn-success px-4 me-auto' type='button' onClick={(e) => addFields2(e)}>Add Field +</button>
                }
                Monthly
                <input type='checkbox' id="toggle-btn" onChange={(e) => toggleType(e.target.checked)} checked={formType} />
                <label for="toggle-btn"></label>
                Others
            </div>
            {
                formType ?
                    <form onSubmit={submit} className=''>
                        <div className='position-relative w-100'>
                            <div className='form-scroll' style={{ paddingBottom: "12%" }}>
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
                                            <th class="header-label">Type</th>
                                            <th class="header-label"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            formFields.map((entry, i) => {
                                                return (
                                                    <tr key={i} className={'rowHover ' +
                                                        entry.rowType === "0" ? 'normalRow' :
                                                        entry.rowType === "1" ? 'headingRow' :
                                                            entry.rowType === "2" ? 'boldRow' :
                                                                entry.rowType === "3" ? 'boldUnderlineRow' : ''
                                                    }>
                                                        <td>{i + 1}</td>
                                                        <td>
                                                            <input
                                                                name='particular'
                                                                placeholder='Particular'
                                                                onChange={event => handleFormChange(event, i)}
                                                                value={entry.particular}
                                                                className='form-control text-center noBorder'
                                                                type='text'
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
                                                            <div className="">
                                                                {/* <label htmlFor="SelectStartingMonth">Select Starting Month</label> */}
                                                                <select className='form-control' id="rowType" name="rowType"
                                                                    value={entry.rowType} onChange={e => handleFormChange(e, i)}
                                                                    style={{ fontSize: '0.8em' }}
                                                                >
                                                                    <option value="0">Normal</option>
                                                                    <option value="1">Heading</option>
                                                                    <option value="2">Bold</option>
                                                                    <option value="3">B \ U</option>
                                                                </select>
                                                            </div>

                                                            {/* <div className="d-flex gap-1 p-1">
                                                                <div class="">
                                                                    <input type="checkbox" class="btn-check" id={"heading" + i} name='heading' autocomplete="off" value={entry.heading} onChange={e => handleFormChange(e, i)} />
                                                                    <label class="btn btn-sm btn-outline-secondary" for={"heading" + i}><strong>H</strong></label>
                                                                </div>
                                                                <div class="">
                                                                    <input type="checkbox" class="btn-check" id={"bold" + i} name='bold' autocomplete="off" value={entry.bold} onChange={e => handleFormChange(e, i)} />
                                                                    <label class="btn btn-sm btn-outline-secondary" for={"bold" + i}><strong>B</strong></label>
                                                                </div>
                                                                <div class="">
                                                                    <input type="checkbox" class="btn-check" id={"boldUnderline" + i} name='boldUnderline' autocomplete="off" value={entry.boldUnderline} onChange={e => handleFormChange(e, i)} />
                                                                    <label class="btn btn-sm btn-outline-primary" for={"boldUnderline" + i}><u><strong>B/U</strong></u></label>
                                                                </div>
                                                            </div> */}
                                                        </td>
                                                        <td>
                                                            <button className='rmvBtn' type='button' onClick={(e) => removeFields(e, i)}>Remove</button>
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                        }
                                    </tbody>
                                </table>
                            </div>
                            <div className="position-fixed w-100">
                                <div className="total-div pt-3">
                                    <div className='d-flex'>
                                        <label htmlFor="" className='form-label w-25 fs-10'>Total Revenue</label>
                                        <table class="table">
                                            <tbody>
                                                <tr>
                                                    {
                                                        totalRevenueForOthers.map((v, i) => {
                                                            return (
                                                                <td key={i}>
                                                                    <input
                                                                        name='value'
                                                                        placeholder='value'
                                                                        onChange={(e) => handleTotalRevenueForOthersChange(e.target.value, i)}
                                                                        value={v}
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
                                    </div>
                                </div>
                            </div>

                        </div>
                    </form>
                    :
                    <form onSubmit={submit} className=''>
                        <div className='position-relative w-100'>
                            <div className='form-scroll' style={{ paddingBottom: "12%" }}>
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
                                            formFields2.map((entry, i) => {
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
                                                            <button className='rmvBtn' type='button' onClick={(e) => removeFields2(e, i)}>Remove</button>
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                        }
                                    </tbody>
                                </table>
                            </div>
                            <div className="position-fixed w-100">
                                <div className="total-div pt-3">
                                    <div className='d-flex'>
                                        <label htmlFor="" className='form-label w-25 fs-10'>Total Monthly Revenue</label>
                                        <table class="table mb-1">
                                            <tbody>
                                                <tr>
                                                    {
                                                        totalMonthlyRevenue.map((v, i) => {
                                                            return (
                                                                <td key={i}>{v}</td>
                                                            )
                                                        })
                                                    }
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className='d-flex'>
                                        <label htmlFor="" className='form-label w-25 fs-10'>No. of Months</label>
                                        <table class="table mb-1">
                                            <tbody>
                                                <tr>
                                                    {
                                                        noOfMonths.map((v, i) => {
                                                            return (
                                                                <td key={i}>
                                                                    <input className='form-control text-center w-100' type="number" value={v} onChange={(e) => { changeMonth(i, e.target.value) }} />
                                                                </td>
                                                            )
                                                        })
                                                    }
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className='d-flex'>
                                        <label htmlFor="" className='form-label w-25 fs-10'>Total Revenue</label>
                                        <table class="table">
                                            <tbody>
                                                <tr>
                                                    {
                                                        totalRevenue.map((v, i) => {
                                                            return (
                                                                <td key={i}>{v}</td>
                                                            )
                                                        })
                                                    }
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>

            }
            <div className="">
                <button className='btn btn-success px-5' onClick={submit}>Save</button>
            </div>
        </div >
        )
}



export default Revenue