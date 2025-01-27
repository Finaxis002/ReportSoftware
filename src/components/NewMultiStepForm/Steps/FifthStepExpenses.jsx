
import React, { useState, useEffect } from "react";
import deleteImg from "../delete.png";
import checkImg from "../check.png";

const FifthStepExpenses = ({ onFormDataChange }) => {
    const [message, setMessage] = useState("");
    const [localData, setLocalData] = useState(() => {
        const savedData = localStorage.getItem("FifthStepExpenses");
        
        // Default state with exactly 1 field in each section
        const defaultState = {
            normalExpense: [
                {
                    name: "",
                    key: "",
                    amount: 0,
                    quantity: 1,
                    value: 0,
                    type: "normal",
                    isCustom: true,
                }
            ],
            directExpense: [
                {
                    name: "",
                    key: "",
                    value: 0,
                    isDirect: true,
                    type: "direct",
                    isCustom: true,
                }
            ],
            totalExpense: 0
        };

        if (!savedData) {
            return defaultState;
        }

        try {
            const parsedData = JSON.parse(savedData);
            
            // Keep the data but ensure at least one field exists
            return {
                ...parsedData,
                // If no fields exist, use the default field
                normalExpense: parsedData.normalExpense?.length ? [parsedData.normalExpense[0]] : defaultState.normalExpense,
                directExpense: parsedData.directExpense?.length ? [parsedData.directExpense[0]] : defaultState.directExpense
            };
        } catch (error) {
            return defaultState;
        }
    });

    // Save data changes to localStorage
    useEffect(() => {
        localStorage.setItem("FifthStepExpenses", JSON.stringify(localData));
    }, [localData]);

    // Update parent component and calculate totals
    useEffect(() => {
        // Calculate total expenses without modifying localData
        const totalNormal = localData.normalExpense.reduce((total, expense) => {
            return total + (parseFloat(expense.amount) || 0) * (parseFloat(expense.quantity) || 0);
        }, 0);
    
        const totalDirect = localData.directExpense.reduce((total, expense) => {
            return total + (parseFloat(expense.value) || 0);
        }, 0);
    
        const totalExpense = totalNormal + totalDirect;
    
        // Pass the updated data to the parent component
        onFormDataChange({ Expenses: { ...localData, totalExpense } });
    }, [localData, onFormDataChange]);

    const handleFormChange = (event, index, form, type) => {
        const { name, value } = event.target;
        setLocalData(prevData => {
            const updatedExpenseList = [...prevData[type]];
            updatedExpenseList[index][name] = value;
            return {
                ...prevData,
                [type]: updatedExpenseList,
            };
        });
    };

    const addFields = () => {
        setLocalData((prevData) => {
            if (prevData.normalExpense.length >= 10) {
                setMessage("You can only add up to 10 fields.");
                return prevData;
            }

            setMessage("");
            return {
                ...prevData,
                normalExpense: [
                    ...prevData.normalExpense,
                    {
                        name: "",
                        key: "",
                        amount: 0,
                        quantity: 1,
                        value: 0,
                        type: "normal",
                        isCustom: true,
                    },
                ],
            };
        });
    };

    const addDirectFields = () => {
        setLocalData((prevData) => {
            if (prevData.directExpense.length >= 15) {
                setMessage("You can only add up to 15 fields.");
                return prevData;
            }

            setMessage("");
            return {
                ...prevData,
                directExpense: [
                    ...prevData.directExpense,
                    {
                        name: "",
                        key: "",
                        value: 0,
                        isDirect: true,
                        type: "direct",
                        isCustom: true,
                    }
                ]
            };
        });
    };

    const totalSum = localData.directExpense.reduce((sum, item) => {
        const value = parseFloat(item.value) || 0;
        return sum + value;
    }, 0);

    const removeFields = (index) => {
        setLocalData(prevData => {
            if (prevData.normalExpense.length <= 1) {
                return prevData; // Don't remove if it's the last field
            }
            const updatedExpenseList = prevData.normalExpense.filter((_, i) => i !== index);
            return {
                ...prevData,
                normalExpense: updatedExpenseList,
            };
        });
    };

    const removeDirectFields = (index) => {
        setLocalData(prevData => {
            if (prevData.directExpense.length <= 1) {
                return prevData; // Don't remove if it's the last field
            }
            const updatedExpenseList = prevData.directExpense.filter((_, i) => i !== index);
            return {
                ...prevData,
                directExpense: updatedExpenseList,
            };
        });
    };

    const calculateTotalExpense = () => {
        let totalNormal = 0;
        let totalDirect = 0;

        localData.normalExpense.forEach(expense => {
            totalNormal += parseFloat(expense.amount) * parseFloat(expense.quantity);
        });

        localData.directExpense.forEach(expense => {
            totalDirect += parseFloat(expense.value);
        });

        setLocalData(prevData => ({
            ...prevData,
            totalExpense: totalNormal + totalDirect,
        }));
    };

    const submit = (event) => {
        event.preventDefault();
        onFormDataChange({ Expenses: localData });
    };

    return (
        <div>
            <form onSubmit={submit} className='form-scroll'>
                <h5 className="text-center text-light bg-info">Expected Salary</h5>
                {localData.normalExpense.map((form, index) => (
                    <div key={index}>
                        <div className='d-flex gap-2 my-4 justify-content-around'>
                            <div className='w-100'>
                                {index === 0 && <label htmlFor="name" className="form-label">Name</label>}
                                <input
                                    name="name"
                                    placeholder={form.name}
                                    onChange={event => handleFormChange(event, index, form, 'normalExpense')}
                                    value={form.name}
                                    className='form-control'
                                    type='text'
                                    disabled={!form.isCustom}
                                />
                            </div>
                            <div>
                                {index === 0 && <label htmlFor="amount" className="form-label">Monthly Salary</label>}
                                <input
                                    name="amount"
                                    placeholder={form.amount}
                                    onChange={event => handleFormChange(event, index, form, 'normalExpense')}
                                    value={form.amount}
                                    className='form-control'
                                    type='text'
                                />
                            </div>
                            <div>
                                {index === 0 && <label htmlFor="quantity" className="form-label">Quantity</label>}
                                <input
                                    name="quantity"
                                    placeholder={form.quantity}
                                    onChange={event => handleFormChange(event, index, form, 'normalExpense')}
                                    value={form.quantity}
                                    className='form-control'
                                    type='text'
                                />
                            </div>
                            <div>
                                {index === 0 && <label htmlFor="value" className="form-label">Total Value</label>}
                                <input
                                    name="value"
                                    placeholder={form.value}
                                    value={parseFloat(form.amount) * parseFloat(form.quantity) || 0}
                                    disabled
                                    className='form-control'
                                    type='text'
                                />
                            </div>
                            {form.isCustom && localData.normalExpense.length > 1 && (
                                <button
                                    className='btn h-100 mt-auto'
                                    style={{ width: "50px", padding: "0", border: "none" }}
                                    onClick={() => removeFields(index)}
                                >
                                    <img src={deleteImg} alt="Remove" className='w-100' />
                                </button>
                            )}
                        </div>
                        <hr />
                    </div>
                ))}

                {localData.normalExpense.length > 0 && (
                    <div className="d-flex justify-content-end mt-4">
                        <strong className="text-sm font-bold text-gray-900">Total Expected Salary: </strong>
                        <span className="ms-2">
                            {localData.normalExpense.reduce((total, form) => {
                                const amount = parseFloat(form.amount) || 0;
                                const quantity = parseFloat(form.quantity) || 0;
                                return total + (amount * quantity);
                            }, 0).toFixed(2)}
                        </span>
                    </div>
                )}
                <hr />

                <h5 className="text-center text-light bg-secondary">Projected Expenses</h5>
                {localData.directExpense.map((form, index) => (
                    <div key={index}>
                        <div className='d-flex gap-2 my-4 justify-content-around'>
                            <div className='w-100'>
                                {index === 0 && <label htmlFor="name" className="form-label">Name</label>}
                                <input
                                    name="name"
                                    placeholder={form.name}
                                    onChange={event => handleFormChange(event, index, form, 'directExpense')}
                                    value={form.name}
                                    className='form-control'
                                    type='text'
                                    disabled={!form.isCustom}
                                />
                            </div>
                            <div>
                                {index === 0 && <label htmlFor="value" className="form-label">Value</label>}
                                <input
                                    name="value"
                                    placeholder={form.value}
                                    value={form.value}
                                    onChange={event => handleFormChange(event, index, form, 'directExpense')}
                                    className='form-control'
                                    type='text'
                                />
                            </div>
                            <div>
                                {index === 0 && <label htmlFor="type" className="form-label"></label>}
                                <select
                                    className="form-select mt-auto"
                                    style={{ width: "170px" }}
                                    aria-label="Direct/Indirect"
                                    name="type"
                                    onChange={event => handleFormChange(event, index, form, 'directExpense')}
                                >
                                    <option value="direct">Direct</option>
                                    <option value="indirect">Indirect</option>
                                </select>
                            </div>
                            {form.isCustom && localData.directExpense.length > 1 && (
                                <button
                                    className='btn h-100 mt-auto'
                                    style={{ width: "50px", padding: "0", border: "none" }}
                                    onClick={() => removeDirectFields(index)}
                                >
                                    <img src={deleteImg} alt="Remove" className='w-100' />
                                </button>
                            )}
                        </div>
                        <hr />
                    </div>
                ))}

                <div className="mt-6 flex justify-end items-center gap-4">
                    <strong className="text-sm font-bold text-gray-900">Total Projected Expenses:</strong>
                    <span className="text-lg font-medium">
                        {totalSum.toFixed(2)}
                    </span>
                </div>
            </form>

            <div className="my-2 d-flex gap-5 justify-content-end position-fixed">
                <div>
                    {message && <p className="text-danger">{message}</p>}
                    <button
                        className='btn text-light btn-info px-4'
                        onClick={addFields}
                        disabled={localData.normalExpense.length >= 10}
                    >
                        + Add Designation
                    </button>
                </div>
                
                <div>
                    <button
                        className='btn btn-secondary px-4 me-auto'
                        onClick={addDirectFields}
                        disabled={localData.directExpense.length >= 15}
                    >
                        + Add Expense
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FifthStepExpenses;
