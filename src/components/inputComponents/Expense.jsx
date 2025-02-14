import React, { useState } from 'react'
import deleteImg from "../../images/delete.png"
import checkImg from "../../images/check.png"

const Expense = ({ handleSave }) => {

    const [normalExpense, setNormalExpense] = useState(
        [
            {
                name: "",
                key: "",
                amount: 0,
                quantity: 1,
                value: 0,
                type: "normal",
                isCustom: true,
            }
        ]
    );
    const [directExpense, setDirectExpense] = useState(
        [
            {
                name: "",
                key: "",
                value: 0,
                isDirect: true,
                type: "direct",
                isCustom: true,
            }
        ]
    );
    const [totalExpense, setTotalExpense] = useState(0)

    const getTotalExpense = () => {
        let total = 0;
        normalExpense.map((item) => (total += item.value))
        directExpense.map((item) => (total += item.value))
        return total;
    }

    const handleFormChange = (event, index, form) => {
        if (form.type === "normal") {
            let data = [...normalExpense];
            if (event.target.name === "amount" || event.target.name === "quantity") {
                data[index][event.target.name] = Number(event.target.value);
                const tempData = data[index].amount * data[index].quantity * 12;
                data[index].value = tempData;
            } else {
                data[index][event.target.name] = event.target.value;
                if (form.isCustom) {
                    const tempStr = event.target.value
                    data[index]["key"] = tempStr.split(" ").join("");;
                }
            }
            setNormalExpense(data);
            setTotalExpense(getTotalExpense());
        }
        else {
            let data = [...directExpense];
            if (event.target.name === "value") {
                data[index][event.target.name] = Number(event.target.value);
            } else {
                data[index][event.target.name] = event.target.value;
                if (form.isCustom && event.target.name !== "type") {
                    const tempStr = event.target.value
                    data[index]["key"] = tempStr.split(" ").join("");;
                }
            }
            setDirectExpense(data);
            setTotalExpense(getTotalExpense());
        }
    }

    const submit = (e) => {
        e.preventDefault();
        console.log(normalExpense)
        console.log(directExpense)
        console.log(totalExpense)
        handleSave(
            {
                expenses: {
                    normalExpense: normalExpense,
                    directExpense: directExpense,
                    totalExpense: totalExpense
                }
            })
    }

    const addFields = () => {
        let object = {
            name: "",
            key: "",
            amount: 0,
            quantity: 1,
            value: 0,
            type: "normal",
            isCustom: true,
        }
        setNormalExpense([...normalExpense, object])
    }

    const removeFields = (index) => {
        let data = [...normalExpense];
        setTotalExpense(totalExpense - data[index].value);
        data.splice(index, 1)
        setNormalExpense(data)
    }

    const addDirectFields = () => {
        let object = {
            name: "",
            key: "",
            value: 0,
            isDirect: true,
            type: "direct",
            isCustom: true,
        }
        setDirectExpense([...directExpense, object])
    }

    const removeDirectFields = (index) => {
        let data = [...directExpense];
        setTotalExpense(totalExpense - data[index].value);
        data.splice(index, 1)
        setDirectExpense(data)
    }


    return (
        <div>
            <form onSubmit={submit} className='form-scroll'>
                <h5 className="text-center text-light bg-info">Expected Salary</h5>
                {normalExpense.map((form, index) => {
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
                                        <label for="amount" className="form-label">Monthly Salary</label>
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
                                        <label for="quantity" className="form-label">Quantity</label>
                                    }
                                    <input
                                        name="quantity"
                                        placeholder={form.quantity}
                                        onChange={event => handleFormChange(event, index, form)}
                                        value={form.quantity}
                                        className='form-control'
                                        type='text'
                                    />
                                </div>
                                <div>
                                    {
                                        index === 0 &&
                                        <label for="value" className="form-label">Total Value</label>
                                    }
                                    <input
                                        name="value"
                                        placeholder={form.value}
                                        value={form.value}
                                        disabled
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
                <hr />
                <h5 className="text-center text-light bg-secondary">Projected Expenses</h5>
                {directExpense.map((form, index) => {
                    return (
                        <div key={index}>
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
                                        <label for="value" className="form-label">Value</label>
                                    }
                                    <input
                                        name="value"
                                        placeholder={form.value}
                                        value={form.value}
                                        onChange={event => handleFormChange(event, index, form)}
                                        className='form-control'
                                        type='text'
                                    />
                                </div>
                                <div>
                                    {
                                        index === 0 &&
                                        <label for="value" className="form-label"></label>
                                    }
                                    <select className="form-select mt-auto'" style={{ width: "170px" }} aria-label="Direct/Indirect" name="type" onChange={event => handleFormChange(event, index, form)}>
                                        <option selected>Direct/Indirect</option>
                                        <option value="direct">Direct</option>
                                        <option value="inDirect">Indirect</option>
                                    </select>
                                </div>
                                {
                                    form.isCustom ?
                                        <button className='btn h-100 mt-auto' style={{ width: "50px", padding: "0", border: "none" }} onClick={() => removeDirectFields(index)}>
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
            </form>
            <div className="position-fixed w-100">
                <div className="total-div">
                    <div className='d-flex align-items-center justify-content-end'>
                        <label htmlFor="" className='form-label w-25 fs-10 mt-auto'>Total Revenue</label>
                        <input
                            name="value"
                            placeholder={totalExpense}
                            value={totalExpense}
                            className='form-control text-end w-50'
                            type='text'
                            disabled
                        />
                    </div>
                </div>
            </div>

            <div className="my-2 d-flex gap-5 justify-content-end">
                <button className='btn text-light btn-info px-4' onClick={addFields}>+ Add Designation</button>
                <button className='btn btn-secondary px-4 me-auto' onClick={addDirectFields}>+ Add Expense</button>
                <button className='btn btn-success px-5' onClick={submit}>Save</button>
            </div>
        </div>
    )
}


export default Expense