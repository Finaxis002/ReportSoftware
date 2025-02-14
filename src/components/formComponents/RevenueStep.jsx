import React, { useEffect, useState } from 'react'

const RevenueStep = ({ handleSave }) => {
    const [formFields, setFormFields] = useState(
        [
            {
                key: 'Heading 1', value: [
                    { particular: 'p1', years: [1, 2, 3, 4, 5] },
                    { particular: 'p2', years: [1, 2, 3, 4, 5] },
                    { particular: 'p3', years: [1, 2, 3, 4, 5] },
                ]
            },
            {
                key: 'Heading 2', value: [
                    { particular: 'p1', years: [1, 2, 3, 4, 5] },
                    { particular: 'p2', years: [1, 2, 3, 4, 5] },
                ]
            },
            {
                key: 'Heading 3', value: [
                    { particular: 'p1', years: [1, 2, 3, 4, 5] }
                ]
            },
        ]
    )

    const [formFields2, setFormFields2] = useState(
        [
            { particular: 'p1', years: [1, 2, 3, 4, 5] },
            { particular: 'p2', years: [1, 2, 3, 4, 5] },
            { particular: 'p3', years: [1, 2, 3, 4, 5] },
        ]
    )


    // _________________________________________________________________________________________________________________________

    const addSubFields = (e, index) => {
        e.preventDefault();
        let object = { particular: '', years: [0, 0, 0, 0, 0] }
        formFields[index].value.push(object);
        setFormFields([...formFields])
    }

    const addMainField = (e) => {
        e.preventDefault();
        let object = {
            key: '', value: []
        }
        setFormFields([...formFields, object])
    }

    const removeSubFields = (e, parentIndex, childIndex) => {
        e.preventDefault();
        let data = [...formFields];
        data[parentIndex].value.splice(childIndex, 1)
        if (data[parentIndex].value.length < 1) {
            data.splice(parentIndex, 1)
        }
        setFormFields(data)
    }

    const handleFormChange = (event, parentIndex, childIndex, year) => {
        let data = [...formFields];

        if (event.target.name === "heading") {
            data[parentIndex]['key'] = event.target.value;
        } else if (event.target.name === 'particular') {
            data[parentIndex]['value'][childIndex]['particular'] = event.target.value;
        } else {
            data[parentIndex]['value'][childIndex]['years'][year] = Number(event.target.value);
        }
        setFormFields(data);
    }

    const [totalRevenueOthers, setTotalRevenueOthers] = useState([0, 0, 0, 0, 0]);

    useEffect(() => {
        let tempMonthlyRevenue = [...totalRevenueOthers];
        tempMonthlyRevenue = tempMonthlyRevenue.map((val) => {
            return 0;
        })
        formFields.map((entry) => {
            return entry['value'].forEach((sub, index) => {

                return sub['years'].map((v, i) => {
                    tempMonthlyRevenue[i] += v;
                })

                tempMonthlyRevenue[index] += sub;
                // totalMonthlyRevenue[index]+=Number(_.toString())
            })
        })
        console.log(tempMonthlyRevenue);
        setTotalRevenueOthers(tempMonthlyRevenue);

    }, [formFields])

    // _________________________________________________________________________________________________________________________

    const submit = (e) => {
        e.preventDefault();
        const final = {
            "revenue": formType ?
                {
                    "type": "others",
                    "entries": formFields,
                    totalRevenueOthers
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
        let object = { particular: '', years: [0, 0, 0, 0, 0] }
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

    const [totalMonthlyRevenue, setTotalMonthlyRevenue] = useState([0, 0, 0, 0, 0]);
    const [noOfMonths, setNoOfMonths] = useState([0, 0, 0, 0, 0]);
    const [totalRevenue, setTotalRevenue] = useState([0, 0, 0, 0, 0]);

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
                        <button className='btn btn-sm btn-primary px-4 me-auto' type='button' onClick={(e) => addMainField(e)}>Add Heading +</button>
                        :
                        <></>
                }
                Monthly
                <input type='checkbox' id="toggle-btn" onChange={(e) => toggleType(e.target.checked)} checked={formType} />
                <label for="toggle-btn"></label>
                Others
            </div>
            {
                formType ?
                    <form onSubmit={submit} className='form-scroll'>
                        <div className='position-relative w-100'>
                            {/* <div className='form-scroll' style={{ paddingBottom: "12%" }}></div> */}
                            {formFields.map((form, index) => {
                                return (
                                    <div key={index} >
                                        <div className='bg-light p-2'>
                                            <div className='d-flex gap-2'>
                                                <h5 className="btn">{index + 1}</h5>
                                                <div className='w-100'>
                                                    {/* <label for="designation" className="form-label">Heading</label> */}
                                                    <input
                                                        name='heading'
                                                        placeholder='Heading'
                                                        onChange={event => handleFormChange(event, index)}
                                                        value={form.key}
                                                        className='form-control'
                                                        type='text'
                                                    />
                                                </div>

                                            </div>
                                            <div className=''>
                                                <table class="table">
                                                    <thead>
                                                        <tr>
                                                            <th class="header-label">Index</th>
                                                            <th class="header-label">Particulars</th>
                                                            <th class="header-label">Year 1</th>
                                                            <th class="header-label">Year 2</th>
                                                            <th class="header-label">Year 3</th>
                                                            <th class="header-label">Year 4</th>
                                                            <th class="header-label">Year 5</th>
                                                            <th class="header-label"></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {
                                                            form.value.map((entry, i) => {
                                                                return (
                                                                    <tr key={i}>
                                                                        <td>{i + 1}</td>
                                                                        <td>
                                                                            <input
                                                                                name='particular'
                                                                                placeholder='Particular'
                                                                                onChange={event => handleFormChange(event, index, i)}
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
                                                                                            onChange={event => handleFormChange(event, index, i, y)}
                                                                                            value={yr}
                                                                                            className='form-control text-end noBorder'
                                                                                            type='number'
                                                                                        />
                                                                                    </td>
                                                                                )
                                                                            })
                                                                        }
                                                                        <td>
                                                                            <button className='rmvBtn' type='button' onClick={(e) => removeSubFields(e, index, i)}>Remove</button>
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            })
                                                        }
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div>
                                                <button type='button' className='btn btn-info px-4' onClick={(e) => addSubFields(e, index)}>+ Add Field</button>
                                            </div>
                                        </div>
                                        <hr />
                                    </div>
                                )
                            })}
                        </div>
                        <div className="w-100 bg-dark text-light pt-3 pb-0">
                            <div className='d-flex'>
                                <label htmlFor="" className='form-label w-25'>Total Revenue</label>
                                <table class="table">
                                    <tbody>
                                        <tr>
                                            {
                                                totalRevenueOthers.map((v, i) => {
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
                                            <th class="header-label">Year 1</th>
                                            <th class="header-label">Year 2</th>
                                            <th class="header-label">Year 3</th>
                                            <th class="header-label">Year 4</th>
                                            <th class="header-label">Year 5</th>
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
                                <div className="total-div">
                                    <div className='w-25 ms-auto'>
                                        <button type='button' className='btn btn-danger px-4 text-light fs-10' onClick={(e) => addFields2(e)}>Add Field +</button>
                                    </div>
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
        </div >)
}

export default RevenueStep