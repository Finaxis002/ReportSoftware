import React, { useEffect, useState } from 'react'

const Step6 = ({ handleSave }) => {
    //change the projection months to years==================================
    const tempYear = 5;

    const [formFields, setFormFields] = useState(
        [
            { particular: 'p1', years: Array.from({ length: tempYear }).fill(0), bold: false, boldUnderline: false },
            // { particular: 'p2', years: [1, 2, 3, 4, 5], bold: false, boldUnderline: false },
            // { particular: 'p3', years: [1, 2, 3, 4, 5], bold: false, boldUnderline: false },
        ]
    )

    const [formFields2, setFormFields2] = useState(
        [
            { particular: 'p1', years: Array.from({ length: tempYear }).fill(0) },
            // { particular: 'p2', years: [1, 2, 3, 4, 5] },
            // { particular: 'p3', years: [1, 2, 3, 4, 5] },
        ]
    )


    // _________________________________________________________________________________________________________________________

    const addFields = (e) => {
        e.preventDefault();
        let object = { particular: '', years: Array.from({ length: tempYear }).fill(0), bold: false, boldUnderline: false }
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

        setFormFields(data);
    }
    // _________________________________________________________________________________________________________________________

    const submit = (e) => {
        e.preventDefault();
        const final = {
            "revenue": formType ?
                {
                    "type": "others",
                    "entries": formFields,
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
        let object = { particular: '', years: Array.from({ length: tempYear }).fill(0) }
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

    const [totalMonthlyRevenue, setTotalMonthlyRevenue] = useState(Array.from({ length: tempYear }).fill(0));
    const [noOfMonths, setNoOfMonths] = useState(Array.from({ length: tempYear }).fill(12));
    const [totalRevenue, setTotalRevenue] = useState(Array.from({ length: tempYear }).fill(0));

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
                                                Array.from({ length: tempYear }).map((a, b) => {
                                                    return <th class="header-label">Year {b + 1}</th>
                                                })
                                            }
                                            <th class="header-label">B/U</th>
                                            <th class="header-label"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            formFields.map((entry, i) => {
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
                                                            <div className="d-flex gap-1 p-1">
                                                                <div class="">
                                                                    <input type="checkbox" class="btn-check" id={"bold" + i} name='bold' autocomplete="off" value={entry.bold} onChange={e => handleFormChange(e, i)} />
                                                                    <label class="btn btn-sm btn-outline-secondary" for={"bold" + i}><strong>B</strong></label>
                                                                </div>
                                                                <div class="">
                                                                    <input type="checkbox" class="btn-check" id={"boldUnderline" + i} name='boldUnderline' autocomplete="off" value={entry.boldUnderline} onChange={e => handleFormChange(e, i)} />
                                                                    <label class="btn btn-sm btn-outline-primary" for={"boldUnderline" + i}><u><strong>B/U</strong></u></label>
                                                                </div>
                                                            </div>
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
                                                Array.from({ length: tempYear }).map((a, b) => {
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
        </div >)
}

export default Step6