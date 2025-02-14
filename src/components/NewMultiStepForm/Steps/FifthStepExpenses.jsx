import React, { useState, useEffect } from "react";
import deleteImg from "../delete.png";
import checkImg from "../check.png";

const FifthStepExpenses = ({ onFormDataChange, expenseData }) => {
  const [message, setMessage] = useState("");
  const [localData, setLocalData] = useState(() => {
    // Conditional check for valid expenseData
    if (expenseData && Object.keys(expenseData).length > 0) {
      return expenseData; // If valid expenseData is passed, return it
    }

    // Default state when expenseData is not provided or invalid
    return {
      normalExpense: [
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
      directExpense: [
        {
          name: "",
          key: "",
          value: 0,
          isDirect: true,
          type: "direct",
          isCustom: true,
        },
      ],
      totalExpense: 0,
    }; // Return default state
  });

  // Save data changes to localStorage
  useEffect(() => {
    localStorage.setItem("FifthStepExpenses", JSON.stringify(localData));
  }, [localData]);

  // Update parent component and calculate totals
  useEffect(() => {
    calculateTotalExpense();
    onFormDataChange({ Expenses: localData });
  }, [localData]);

  const handleFormChange = (event, index, form, type) => {
    const { name, value } = event.target;
    setLocalData((prevData) => {
      const updatedExpenseList = [...prevData[type]];
      updatedExpenseList[index][name] = value;
      return {
        ...prevData,
        [type]: updatedExpenseList,
      };
    });
  };

  // Ensure that at least empty arrays are provided
  const normalExpenses = localData?.normalExpense || [];
  const directExpenses = localData?.directExpense || [];

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
          },
        ],
      };
    });
  };

  const totalSum = directExpenses.reduce((sum, item) => {
    const value = parseFloat(item.value) || 0;
    return sum + value;
  }, 0);

  const removeFields = (index) => {
    setLocalData((prevData) => {
      if (prevData.normalExpense.length <= 1) {
        return prevData; // Don't remove if it's the last field
      }
      const updatedExpenseList = prevData.normalExpense.filter(
        (_, i) => i !== index
      );
      return {
        ...prevData,
        normalExpense: updatedExpenseList,
      };
    });
  };

  const removeDirectFields = (index) => {
    setLocalData((prevData) => {
      if (prevData.directExpense.length <= 1) {
        return prevData; // Don't remove if it's the last field
      }
      const updatedExpenseList = prevData.directExpense.filter(
        (_, i) => i !== index
      );
      return {
        ...prevData,
        directExpense: updatedExpenseList,
      };
    });
  };

  const calculateTotalExpense = () => {
    let totalNormal = 0;
    let totalDirect = 0;

    normalExpenses.forEach((expense) => {
      totalNormal += parseFloat(expense.amount) * parseFloat(expense.quantity);
    });

    directExpenses.forEach((expense) => {
      totalDirect += parseFloat(expense.value);
    });

    setLocalData((prevData) => ({
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
      <form onSubmit={submit} className="form-scroll">
        <h5 className="text-center text-light bg-info">Expected Salary</h5>
        {normalExpenses.map((form, index) => (
          <div key={index}>
            <div className="d-flex gap-2 my-4 justify-content-around">
              <div className="w-100">
                {index === 0 && (
                  <label htmlFor="name" className="form-label">
                    Name
                  </label>
                )}
                <input
                  name="name"
                  placeholder={form.name}
                  onChange={(event) =>
                    handleFormChange(event, index, form, "normalExpense")
                  }
                  value={form.name}
                  className="form-control"
                  type="text"
                  disabled={!form.isCustom}
                />
              </div>
              <div>
                {index === 0 && (
                  <label htmlFor="amount" className="form-label">
                    Monthly Salary
                  </label>
                )}
                <input
                  name="amount"
                  placeholder={form.amount}
                  onChange={(event) =>
                    handleFormChange(event, index, form, "normalExpense")
                  }
                  value={form.amount}
                  className="form-control"
                  type="text"
                />
              </div>
              <div>
                {index === 0 && (
                  <label htmlFor="quantity" className="form-label">
                    Quantity
                  </label>
                )}
                <input
                  name="quantity"
                  placeholder={form.quantity}
                  onChange={(event) =>
                    handleFormChange(event, index, form, "normalExpense")
                  }
                  value={form.quantity}
                  className="form-control"
                  type="text"
                />
              </div>
              <div>
                {index === 0 && (
                  <label htmlFor="value" className="form-label">
                    Total Value
                  </label>
                )}
                <input
                  name="value"
                  placeholder={form.value}
                  value={
                    parseFloat(form.amount) * parseFloat(form.quantity) * 12 ||
                    0
                  }
                  disabled
                  className="form-control"
                  type="text"
                />
              </div>
              {form.isCustom && normalExpenses.length > 1 && (
                <button
                  className="btn h-100 mt-auto"
                  style={{ width: "50px", padding: "0", border: "none" }}
                  onClick={() => removeFields(index)}
                >
                  <img src={deleteImg} alt="Remove" className="w-100" />
                </button>
              )}
            </div>
            <hr />
          </div>
        ))}

        {/* ✅ Display Total Expected Salary */}
        {normalExpenses.length > 0 && (
          <div className="d-flex justify-content-end mt-4">
            <strong className="text-sm font-bold text-gray-900">
              Total Expected Salary:{" "}
            </strong>
            <span className="ms-2">
              {normalExpenses
                .reduce((total, form) => {
                  const amount = parseFloat(form.amount) || 0;
                  const quantity = parseFloat(form.quantity) || 0;
                  return total + amount * quantity * 12; // ✅ Corrected calculation
                }, 0)
                .toFixed(2)}
            </span>
          </div>
        )}
        <hr />

        <h5 className="text-center text-light bg-secondary">
          Projected Expenses
        </h5>
        {directExpenses.map((form, index) => (
          <div key={index}>
            <div className="d-flex gap-2 my-4 justify-content-around">
              <div className="w-100">
                {index === 0 && (
                  <label htmlFor="name" className="form-label">
                    Name
                  </label>
                )}
                <input
                  name="name"
                  placeholder={form.name}
                  onChange={(event) =>
                    handleFormChange(event, index, form, "directExpense")
                  }
                  value={form.name}
                  className="form-control"
                  type="text"
                  disabled={!form.isCustom}
                />
              </div>
              <div>
                {index === 0 && (
                  <label htmlFor="value" className="form-label">
                    Value
                  </label>
                )}
                <input
                  name="value"
                  placeholder={form.value}
                  value={form.value}
                  onChange={(event) =>
                    handleFormChange(event, index, form, "directExpense")
                  }
                  className="form-control"
                  type="text"
                />
              </div>
              <div>
                {index === 0 && (
                  <label htmlFor="value" className="form-label">
                    Total
                  </label>
                )}
                <input
                  name="value"
                  placeholder={form.value}
                  value={parseFloat(form.value) * 12 || 0}
                  onChange={(event) =>
                    handleFormChange(event, index, form, "directExpense")
                  }
                  className="form-control"
                  type="text"
                />
              </div>
              <div>
                {index === 0 && (
                  <label htmlFor="type" className="form-label"></label>
                )}
                <select
                  className="form-select mt-auto"
                  style={{ width: "170px" }}
                  aria-label="Direct/Indirect"
                  name="type"
                  onChange={(event) =>
                    handleFormChange(event, index, form, "directExpense")
                  }
                >
                  <option value="direct">Direct</option>
                  <option value="indirect">Indirect</option>
                </select>
              </div>
              {form.isCustom && directExpenses.length > 1 && (
                <button
                  className="btn h-100 mt-auto"
                  style={{ width: "50px", padding: "0", border: "none" }}
                  onClick={() => removeDirectFields(index)}
                >
                  <img src={deleteImg} alt="Remove" className="w-100" />
                </button>
              )}
            </div>
            <hr />
          </div>
        ))}

        <div className="mt-6 flex justify-end items-center gap-4">
          <strong className="text-sm font-bold text-gray-900">
            Total Projected Expenses:
          </strong>
          <span className="text-lg font-medium">
            {totalSum.toFixed(2) * 12}
          </span>
        </div>
      </form>

      <div className="my-2 d-flex gap-5 justify-content-end position-fixed">
        <div>
          {message && <p className="text-danger">{message}</p>}
          <button
            className="btn text-light btn-info px-4"
            onClick={addFields}
            disabled={normalExpenses.length >= 10}
          >
            + Add Designation
          </button>
        </div>

        <div>
          <button
            className="btn btn-secondary px-4 me-auto"
            onClick={addDirectFields}
            disabled={directExpenses.length >= 15}
          >
            + Add Expense
          </button>
        </div>
      </div>
    </div>
  );
};

export default FifthStepExpenses;

// import React, { useState, useEffect } from "react";
// import deleteImg from "../delete.png";
// import checkImg from "../check.png";

// const FifthStepExpenses = ({ onFormDataChange }) => {
//     // const [localData, setLocalData] = useState(() => {
//     //     const savedData = localStorage.getItem("FifthStepExpenses");

//     //     return savedData ? JSON.parse(savedData) : {
//     //         normalExpense: parsedData.normalExpense.slice(0, 10) || [],

//     //       normalExpense: [
//     //         {
//     //           name: "",
//     //           key: "",
//     //           amount: 0,
//     //           quantity: 1,
//     //           value: 0,
//     //           type: "normal",
//     //           isCustom: true,
//     //         }
//     //       ],
//     //       directExpense: [
//     //         {
//     //           name: "",
//     //           key: "",
//     //           value: 0,
//     //           isDirect: true,
//     //           type: "direct",
//     //           isCustom: true,
//     //         }
//     //       ],
//     //       totalExpense: 0
//     //     };
//     //      // Default state

//     //   });

//     const [localData, setLocalData] = useState(() => {
//         const savedData = localStorage.getItem("FifthStepExpenses");

//         if (savedData) {
//             // Parse and use data from localStorage
//             const parsedData = JSON.parse(savedData);
//             return {
//                 ...parsedData,
//                 normalExpense: parsedData.normalExpense
//                     ? parsedData.normalExpense.slice(0, 10) // Truncate to 10 fields if it exists
//                     : [], // Default to empty array if not present
//             };
//         }

//         // Default state if no localStorage data exists
//         return {
//             normalExpense: [
//                 {
//                     name: "",
//                     key: "",
//                     amount: 0,
//                     quantity: 1,
//                     value: 0,
//                     type: "normal",
//                     isCustom: true,
//                 },
//             ],
//             directExpense: [
//                 {
//                     name: "",
//                     key: "",
//                     value: 0,
//                     isDirect: true,
//                     type: "direct",
//                     isCustom: true,
//                 },
//             ],
//             totalExpense: 0,
//         };
//     });

//       const [message, setMessage] = useState("");

//       useEffect(() => {
//         localStorage.setItem("FifthStepExpenses", JSON.stringify(localData)); // Correct method
//       }, []);

//     useEffect(() => {
//         // Recalculate totals whenever the expenses change
//         calculateTotalExpense();
//         onFormDataChange({ Expenses: localData });
//     }, []);

//     const handleFormChange = (event, index, form, type) => {
//         const { name, value } = event.target;
//         setLocalData(prevData => {
//             const updatedExpenseList = [...prevData[type]];
//             updatedExpenseList[index][name] = value;
//             return {
//                 ...prevData,
//                 [type]: updatedExpenseList,
//             };
//         });
//     };

//     // const addFields = () => {
//     //     setLocalData(prevData => ({
//     //         ...prevData,
//     //         normalExpense: [
//     //             ...prevData.normalExpense,
//     //             {
//     //                 name: "",
//     //                 key: "",
//     //                 amount: 0,
//     //                 quantity: 1,
//     //                 value: 0,
//     //                 type: "normal",
//     //                 isCustom: true,
//     //             }
//     //         ]
//     //     }));
//     // };

//     //to show error message when fields are more than 10

//     const addFields = () => {
//         setLocalData((prevData) => {
//             if (prevData.normalExpense.length >= 10) {
//                 console.log("Limit reached, setting message");
//                 setMessage("You can only add up to 10 fields."); // Show error message
//                 return prevData; // Stop adding fields
//             }

//             setMessage(""); // Clear the message if a field is added successfully
//             return {
//                 ...prevData,
//                 normalExpense: [
//                     ...prevData.normalExpense,
//                     {
//                         name: "",
//                         key: "",
//                         amount: 0,
//                         quantity: 1,
//                         value: 0,
//                         type: "normal",
//                         isCustom: true,
//                     },
//                 ],
//             };
//         });
//     };

//     const addDirectFields = () => {
//         setLocalData((prevData) => {
//             if (prevData.directExpense.length >= 15) {
//                 setMessage("You can only add up to 10 fields."); // Set a limit message
//                 return prevData; // Stop adding fields
//             }

//             return{
//             ...prevData,
//             directExpense: [
//                 ...prevData.directExpense,
//                 {
//                     name: "",
//                     key: "",
//                     value: 0,
//                     isDirect: true,
//                     type: "direct",
//                     isCustom: true,
//                 }
//             ]}
//         })
//     };

//     //for total projected salary
//     const totalSum = localData.directExpense.reduce((sum, item) => {
//         const value = parseFloat(item.value) || 0;
//         return sum + value;
//       }, 0);

//     const removeFields = (index) => {
//         setLocalData(prevData => {
//             const updatedExpenseList = prevData.normalExpense.filter((_, i) => i !== index);
//             return {
//                 ...prevData,
//                 normalExpense: updatedExpenseList,
//             };
//         });
//     };

//     const removeDirectFields = (index) => {
//         setLocalData(prevData => {
//             const updatedExpenseList = prevData.directExpense.filter((_, i) => i !== index);
//             return {
//                 ...prevData,
//                 directExpense: updatedExpenseList,
//             };
//         });
//     };

//     const calculateTotalExpense = () => {
//         let totalNormal = 0;
//         let totalDirect = 0;

//         // Calculate total for normalExpense (Amount * Quantity for each)
//         localData.normalExpense.forEach(expense => {
//             totalNormal += parseFloat(expense.amount) * parseFloat(expense.quantity);
//         });

//         // Calculate total for directExpense
//         localData.directExpense.forEach(expense => {
//             totalDirect += parseFloat(expense.value);
//         });

//         // Update totalExpense
//         setLocalData(prevData => ({
//             ...prevData,
//             totalExpense: totalNormal + totalDirect,
//         }));
//     };

//     const submit = (event) => {
//         event.preventDefault();
//         console.log("Form submitted with data:", localData);
//         onFormDataChange({ Expenses: localData });
//     };

//     return (
//         <div>
//             <form onSubmit={submit} className='form-scroll'>
//                 <h5 className="text-center text-light bg-info">Expected Salary</h5>
//                 {localData.normalExpense.map((form, index) => {
//                     return (
//                         <div key={index}>
//                             <div className='d-flex gap-2 my-4 justify-content-around'>
//                                 <div className='w-100'>
//                                     {index === 0 && <label htmlFor="name" className="form-label">Name</label>}
//                                     <input
//                                         name="name"
//                                         placeholder={form.name}
//                                         onChange={event => handleFormChange(event, index, form, 'normalExpense')}
//                                         value={form.name}
//                                         className='form-control'
//                                         type='text'
//                                         disabled={!form.isCustom}
//                                     />
//                                 </div>
//                                 <div>
//                                     {index === 0 && <label htmlFor="amount" className="form-label">Monthly Salary</label>}
//                                     <input
//                                         name="amount"
//                                         placeholder={form.amount}
//                                         onChange={event => handleFormChange(event, index, form, 'normalExpense')}
//                                         value={form.amount}
//                                         className='form-control'
//                                         type='text'
//                                     />
//                                 </div>
//                                 <div>
//                                     {index === 0 && <label htmlFor="quantity" className="form-label">Quantity</label>}
//                                     <input
//                                         name="quantity"
//                                         placeholder={form.quantity}
//                                         onChange={event => handleFormChange(event, index, form, 'normalExpense')}
//                                         value={form.quantity}
//                                         className='form-control'
//                                         type='text'
//                                     />
//                                 </div>
//                                 <div>
//                                     {index === 0 && <label htmlFor="value" className="form-label">Total Value</label>}
//                                     <input
//                                         name="value"
//                                         placeholder={form.value}
//                                         value={parseFloat(form.amount) * parseFloat(form.quantity) || 0}
//                                         disabled
//                                         className='form-control'
//                                         type='text'
//                                     />
//                                 </div>
//                                 {form.isCustom ? (
//                                     <button
//                                         className='btn h-100 mt-auto' style={{ width: "50px", padding: "0", border: "none" }}
//                                         onClick={() => removeFields(index)}
//                                     >
//                                         <img src={deleteImg} alt="Remove" className='w-100' />
//                                     </button>
//                                 ) : (
//                                     <span className='h-100 mt-auto' style={{ width: "43px", padding: "0", border: "none" }}>
//                                         <img src={checkImg} alt="add" className='w-100' />
//                                     </span>
//                                 )}
//                             </div>
//                             <hr />
//                         </div>
//                     );
//                 })}
//                 {/* total expected Salary */}
//                 {localData.normalExpense.length > 0 && (
//                     <div className="d-flex justify-content-end mt-4">
//                         <strong className="text-sm font-bold text-gray-900">Total Expected Salary: </strong>
//                         <span className="ms-2">
//                             {localData.normalExpense.reduce((total, form) => {
//                                 const amount = parseFloat(form.amount) || 0;
//                                 const quantity = parseFloat(form.quantity) || 0;
//                                 return total + (amount * quantity);
//                             }, 0).toFixed(2)}
//                         </span>
//                     </div>
//                 )}
//                 <hr />

//                 <h5 className="text-center text-light bg-secondary">Projected Expenses</h5>
//                 {localData.directExpense.map((form, index) => {
//                     return (
//                         <div key={index}>
//                             <div className='d-flex gap-2 my-4 justify-content-around'>
//                                 <div className='w-100'>
//                                     {index === 0 && <label htmlFor="name" className="form-label">Name</label>}
//                                     <input
//                                         name="name"
//                                         placeholder={form.name}
//                                         onChange={event => handleFormChange(event, index, form, 'directExpense')}
//                                         value={form.name}
//                                         className='form-control'
//                                         type='text'
//                                         disabled={!form.isCustom}
//                                     />
//                                 </div>
//                                 <div>
//                                     {index === 0 && <label htmlFor="value" className="form-label">Value</label>}
//                                     <input
//                                         name="value"
//                                         placeholder={form.value}
//                                         value={form.value}
//                                         onChange={event => handleFormChange(event, index, form, 'directExpense')}
//                                         className='form-control'
//                                         type='text'
//                                     />
//                                 </div>
//                                 <div>
//                                     {index === 0 && <label htmlFor="value" className="form-label"></label>}
//                                     <select
//                                         className="form-select mt-auto"
//                                         style={{ width: "170px" }}
//                                         aria-label="Direct/Indirect"
//                                         name="type"
//                                         onChange={event => handleFormChange(event, index, form, 'directExpense')}
//                                     >
//                                         <option value="direct">Direct</option>
//                                         <option value="indirect">Indirect</option>
//                                     </select>
//                                 </div>
//                                 {form.isCustom ? (
//                                     <button
//                                         className='btn h-100 mt-auto' style={{ width: "50px", padding: "0", border: "none" }}
//                                         onClick={() => removeDirectFields(index)}
//                                     >
//                                         <img src={deleteImg} alt="Remove" className='w-100' />
//                                     </button>
//                                 ) : (
//                                     <span className='h-100 mt-auto' style={{ width: "43px", padding: "0", border: "none" }}>
//                                         <img src={checkImg} alt="add" className='w-100' />
//                                     </span>
//                                 )}
//                             </div>
//                             <hr />
//                         </div>
//                     );
//                 })}

//                  {/* total projected Salary */}
//                  <div className="mt-6 flex justify-end items-center gap-4">
//                    <strong className="text-sm font-bold text-gray-900">Total Projected Salary:</strong>
//                    <span className="text-lg font-medium">
//                      {totalSum.toFixed(2)}
//                    </span>
//                  </div>

//             </form>
//             {/* <div className="position-fixed w-100">
//                 <div className="total-div">
//                     <div className='d-flex align-items-center justify-content-end'>
//                         <label htmlFor="" className='form-label w-25 fs-10 mt-auto'>Total Expense</label>
//                         <input
//                             name="value"
//                             placeholder={localData.totalExpense}
//                             value={localData.totalExpense}
//                             className='form-control text-end w-50'
//                             type='text'
//                             disabled
//                         />
//                     </div>
//                 </div>
//             </div> */}

//             <div className="my-2 d-flex gap-5 justify-content-end position-fixed">
//                 <div>
//                      {message && <p className="text-danger">{message}</p>}
//                      <button className='btn text-light btn-info px-4 text-red-400' onClick={addFields}
//                      disabled={localData.normalExpense.length >= 10} >
//                          + Add Designation
//                      </button>
//                 </div>

//                 <div>
//                 <button className='btn btn-secondary px-4 me-auto'
//                 onClick={addDirectFields}
//                 disabled={localData.directExpense.length >= 15}
//                 >+ Add Expense
//                 </button>
//                 </div>

//             </div>
//         </div>
//     );
// };

// export default FifthStepExpenses;
