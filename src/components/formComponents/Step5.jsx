import React, { useState } from 'react'

const Step5 = ({ handleSave }) => {
    const [formFields, setFormFields] = useState([
        { designation: '', quantity: '', salary: '', totalSalary: 0 },
    ])

    const handleFormChange = (event, index) => {
        let data = [...formFields];
        if (event.target.name === "quantity" || event.target.name === "salary") {
            data[index][event.target.name] = Number(event.target.value);
            data[index]['totalSalary'] = Number(data[index]['quantity']) * Number(data[index]['salary']) * 12;
        } else {
            data[index][event.target.name] = event.target.value;
        }
        setFormFields(data);
    }

    const submit = (e) => {
        e.preventDefault();
        console.log(formFields)
        handleSave(formFields)
    }

    const addFields = () => {
        let object = {
            designation: '', quantity: 0, salary: 0, totalSalary: 0
        }

        setFormFields([...formFields, object])
    }

    const removeFields = (index) => {
        let data = [...formFields];
        data.splice(index, 1)
        setFormFields(data)
    }
    return (
        <div>
            <form onSubmit={submit} className='form-scroll'>
                {formFields.map((form, index) => {
                    return (
                        <div key={index} >
                            <div className='d-flex gap-2 my-4 justify-content-around'>
                                <div className=''>
                                    <h5 className="badge p-3 rounded-pill bg-secondary mt-4">{index + 1}</h5>
                                </div>
                                <div>
                                    <label for="designation" className="form-label">Designation</label>
                                    <input
                                        name='designation'
                                        placeholder='Designation'
                                        onChange={event => handleFormChange(event, index)}
                                        value={form.designation}
                                        className='form-control'
                                        type='text'
                                    />
                                </div>
                                <div>
                                    <label for="quantity" className="form-label">No. of empolyees</label>
                                    <input
                                        name='quantity'
                                        placeholder='No. of employees'
                                        onChange={event => handleFormChange(event, index)}
                                        value={form.quantity}
                                        className='form-control'
                                        type='number'
                                    />
                                </div>
                                <div>
                                    <label for="salary" className="form-label">Monthly Salary</label>
                                    <input
                                        name='salary'
                                        placeholder='Monthly Salary'
                                        onChange={event => handleFormChange(event, index)}
                                        value={form.salary}
                                        className='form-control'
                                        type='number'
                                    />
                                </div>
                                <div>
                                    <label for="totalSalary" className="form-label">Total Salary</label>
                                    <input
                                        name='totalSalary'
                                        placeholder='Total Salary'
                                        readOnly={true}
                                        value={form.totalSalary}
                                        className='form-control text-center border-none'
                                        type='number'
                                    />
                                </div>
                                <button className='btn btn-danger my-4 ms-2' onClick={() => removeFields(index)}>Remove</button>
                            </div>
                            <hr />
                        </div>

                    )
                })}
            </form>
            <div className="my-2 d-flex gap-5 justify-content-end">
                <button className='btn btn-secondary px-4' onClick={addFields}>+ Add More</button>
                <button className='btn btn-success px-5' onClick={submit}>Submit</button>
            </div>
        </div>)
}

export default Step5