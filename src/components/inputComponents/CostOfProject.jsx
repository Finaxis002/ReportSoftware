import React, { useEffect, useState } from 'react'
import deleteImg from "../../images/delete.png"
import checkImg from "../../images/check.png"

const CostOfProject = ({ handleSave }) => {

    const [formFields, setFormFields] = useState([
        { name: 'Land', id: 'Land', amount: 0, rate: 15, isCustom: false },
        { name: 'Building', id: 'Building', amount: 0, rate: 15 },
        { name: 'Furniture and Fittings', id: 'FurnitureandFittings', amount: 0, rate: 15, isCustom: false },
        { name: 'Plant Machinery', id: 'PlantMachinery', amount: 0, rate: 15, isCustom: false },
        { name: 'Intangible Assets', id: 'IntangibleAssets', amount: 0, rate: 15, isCustom: false },
        { name: 'Computer Peripherals', id: 'ComputersPeripherals', amount: 0, rate: 15, isCustom: false },
        { name: 'Miscellaneous', id: 'Miscellaneous', amount: 0, rate: 15, isCustom: false },
    ])

    const handleFormChange = (event, index, form) => {
        let data = [...formFields];
        if (event.target.name === "amount" || event.target.name === "rate") {
            data[index][event.target.name] = Number(event.target.value);
        } else {
            data[index][event.target.name] = event.target.value;
            if (form.isCustom) {
                const tempStr = event.target.value
                data[index]["id"] = tempStr.split(" ").join("");;
            }
        }
        setFormFields(data);
    }

    const submit = (e) => {
        e.preventDefault();
        console.log(formFields)
        handleSave({ costOfProject: formFields })
    }

    const addFields = (e) => {
        e.preventDefault();
        let object = { name: '', id: 'Custom1', amount: 0, rate: 15, isCustom: true }
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
                                <div className='w-100'>
                                    {
                                        index === 0 &&
                                        <label for="name" className="form-label">Name</label>
                                    }
                                    <input
                                        name="name"
                                        placeholder={form.name}
                                        onChange={event => handleFormChange(event, index, form)}
                                        value={form.name}
                                        className='form-control'
                                        type='text'
                                        disabled={!form.isCustom}
                                    />
                                </div>
                                <div>
                                    {
                                        index === 0 &&
                                        <label for="amount" className="form-label">Amount</label>
                                    }
                                    <input
                                        name="amount"
                                        placeholder={form.amount}
                                        onChange={event => handleFormChange(event, index, form)}
                                        value={form.amount}
                                        className='form-control'
                                        type='text'
                                    />
                                </div>
                                <div>
                                    {
                                        index === 0 &&
                                        <label for="rate" className="form-label">Depreciation(%)</label>
                                    }
                                    <input
                                        name="rate"
                                        placeholder={form.rate}
                                        onChange={event => handleFormChange(event, index, form)}
                                        value={form.rate}
                                        className='form-control'
                                        type='text'
                                    />
                                </div>
                                {
                                    form.isCustom ?
                                        <button className='btn h-100 mt-auto' style={{ width: "50px", padding: "0", border: "none" }} onClick={() => removeFields(index)}>
                                            <img src={deleteImg} alt="Remove" className='w-100' />
                                        </button>
                                        :
                                        <span className='h-100 mt-auto' style={{ width: "43px", padding: "0", border: "none" }}>
                                            <img src={checkImg} alt="add" className='w-100' />
                                        </span>
                                }
                            </div>
                            <hr />
                        </div>
                    )
                })}
                <button className='btn btn-secondary px-4' onClick={addFields}>+ Add More</button>
            </form>
            <div className="my-2 d-flex gap-5 justify-content-center">
                <button className='btn btn-success px-5' onClick={submit}>Save</button>
            </div>
        </div>
    )
}

export default CostOfProject