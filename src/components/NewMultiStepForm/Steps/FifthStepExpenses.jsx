import React, { useState, useEffect, useMemo, useCallback } from "react";
import deleteImg from "../delete.png";
import checkImg from "../check.png";

const FifthStepExpenses = ({ onFormDataChange }) => {
    const [localData, setLocalData] = useState(() => {
        const savedData = localStorage.getItem("FifthStepExpenses");
        return savedData ? JSON.parse(savedData) : {
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
      });
      
    useEffect(() => {
        localStorage.setItem("FifthStepExpenses", JSON.stringify(localData)); // Correct method
      }, [localData]);
      
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
        setLocalData(prevData => ({
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
                }
            ]
        }));
    };

    const addDirectFields = () => {
        setLocalData(prevData => ({
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
        }));
    };

    const removeFields = (index) => {
        setLocalData(prevData => {
            const updatedExpenseList = prevData.normalExpense.filter((_, i) => i !== index);
            return {
                ...prevData,
                normalExpense: updatedExpenseList,
            };
        });
    };

    const removeDirectFields = (index) => {
        setLocalData(prevData => {
            const updatedExpenseList = prevData.directExpense.filter((_, i) => i !== index);
            return {
                ...prevData,
                directExpense: updatedExpenseList,
            };
        });
    };

    const calculateTotalExpense = () => {
        let totalNormal = localData.normalExpense.reduce((acc, expense) => 
            acc + parseFloat(expense.amount || 0) * parseFloat(expense.quantity || 0), 0
        );
    
        let totalDirect = localData.directExpense.reduce((acc, expense) => 
            acc + parseFloat(expense.value || 0), 0
        );
    
        return totalNormal + totalDirect;
    }

   
    const memoizedOnFormDataChange = useCallback(onFormDataChange, []);

    useEffect(() => {
        const total = calculateTotalExpense();
        setLocalData(prevData => ({
            ...prevData,
            totalExpense: total,
        }));
        memoizedOnFormDataChange({ Expenses: localData });
    }, [localData.normalExpense, localData.directExpense, memoizedOnFormDataChange]);
    

    const submit = (event) => {
        event.preventDefault();
        // console.log("Form submitted with data:", localData);
        onFormDataChange({ Expenses: localData });
    };

    return (
        <div>
            <form onSubmit={submit} className='form-scroll'>
                <h5 className="text-center text-light bg-info">Expected Salary</h5>
                {localData.normalExpense.map((form, index) => {
                    return (
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
                                {form.isCustom ? (
                                    <button
                                        className='btn h-100 mt-auto' style={{ width: "50px", padding: "0", border: "none" }}
                                        onClick={() => removeFields(index)}
                                    >
                                        <img src={deleteImg} alt="Remove" className='w-100' />
                                    </button>
                                ) : (
                                    <span className='h-100 mt-auto' style={{ width: "43px", padding: "0", border: "none" }}>
                                        <img src={checkImg} alt="add" className='w-100' />
                                    </span>
                                )}
                            </div>
                            <hr />
                        </div>
                    );
                })}
                <hr />
                <h5 className="text-center text-light bg-secondary">Projected Expenses</h5>
                {localData.directExpense.map((form, index) => {
                    return (
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
                                    {index === 0 && <label htmlFor="value" className="form-label"></label>}
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
                                {form.isCustom ? (
                                    <button
                                        className='btn h-100 mt-auto' style={{ width: "50px", padding: "0", border: "none" }}
                                        onClick={() => removeDirectFields(index)}
                                    >
                                        <img src={deleteImg} alt="Remove" className='w-100' />
                                    </button>
                                ) : (
                                    <span className='h-100 mt-auto' style={{ width: "43px", padding: "0", border: "none" }}>
                                        <img src={checkImg} alt="add" className='w-100' />
                                    </span>
                                )}
                            </div>
                            <hr />
                        </div>
                    );
                })}
                
            </form>
            <div className="position-fixed w-100">
                <div className="total-div">
                    <div className='d-flex align-items-center justify-content-end'>
                        <label htmlFor="" className='form-label w-25 fs-10 mt-auto'>Total Expense</label>
                        <input
                            name="value"
                            placeholder={localData.totalExpense}
                            value={localData.totalExpense}
                            className='form-control text-end w-50'
                            type='text'
                            disabled
                        />
                    </div>
                </div>
            </div>

          
            <div className="my-2 d-flex gap-5 justify-content-end position-fixed">
                <button className='btn text-light btn-info px-4' onClick={addFields}>+ Add Designation</button>
                <button className='btn btn-secondary px-4 me-auto' onClick={addDirectFields}>+ Add Expense</button>
            </div>
        </div>
    );
};

export default FifthStepExpenses;
