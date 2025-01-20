import React, { useEffect, useState } from "react";

const ExpenseInput = ({
  formInput,
  setFormInput,
  title,
  id,
  checkBox,
  type,
  isDirectExpense,
  index,
  inputValue,
  isCustom,
  quantity,
  amount,
}) => {
  // const [inputNumber, setInputNumber] = useState(1);
  // const [showAmt, setShowAmt] = useState(0);

  const handleAmtChange = (e) => {
    const updatedFormInput = { ...formInput }; // Create a copy of the formInput object

    if (type === "normal") {
      updatedFormInput.normalExpense[index] = {
        ...updatedFormInput.normalExpense[index], // Keep other properties unchanged
        amount: parseFloat(e.target.value), // Update the 'value' property
        value: parseFloat(e.target.value) * parseFloat(quantity),
      };
    } else if (type === "direct") {
      updatedFormInput.DExpense[index] = {
        ...updatedFormInput.DExpense[index], // Keep other properties unchanged
        value: parseFloat(e.target.value), // Update the 'value' property
      };
    }

    setFormInput(updatedFormInput); // Update the state with the modified object
  };

  const handleQuantityChange = (e) => {
    const updatedFormInput = { ...formInput }; // Create a copy of the formInput object

    if (type === "normal") {
      updatedFormInput.normalExpense[index] = {
        ...updatedFormInput.normalExpense[index], // Keep other properties unchanged
        quantity: parseFloat(e.target.value), // Update the 'value' property
        value: parseFloat(e.target.value) * parseFloat(amount),
      };
    }

    setFormInput(updatedFormInput); // Update the state with the modified object
  };

  const handleTitleChange = (e) => {
    const updatedFormInput = { ...formInput };
    if (type === "normal") {
      updatedFormInput.normalExpense[index] = {
        ...updatedFormInput.normalExpense[index], // Keep other properties unchanged
        name: e.target.value, // Update the 'value' property
      };
    } else if (type === "direct") {
      updatedFormInput.DExpense[index] = {
        ...updatedFormInput.DExpense[index], // Keep other properties unchanged
        name: e.target.value, // Update the 'value' property
      };
    }
    setFormInput(updatedFormInput);
  };

  const setExpense = (value) => {
    const updatedFormInput = { ...formInput };
    updatedFormInput.DExpense[index] = {
      ...updatedFormInput.DExpense[index], // Keep other properties unchanged
      isDirect: value, // Update the 'value' property
    };
    setFormInput(updatedFormInput);
  };

  const [isDirect, setIsDirect] = useState(true);

  return (
    <>
      <div className="d-flex align-items-center mt-2">
        {isCustom ? (
          <div className="input me-3 mt-4">
            <input
              id={id}
              name={id}
              type="text"
              placeholder="Additional Expense"
              value={title}
              onChange={handleTitleChange}
            />
          </div>
        ) : (
          <div className="input me-3 mt-4">
            <span>{title}</span>
          </div>
        )}

        <div className="d-flex align-items-center">
          <div className="input me-3 mt-4">
            <input
              id={id}
              name={id}
              type="number"
              placeholder="Eg. 1,00,000"
              value={amount}
              onChange={(e) => handleAmtChange(e)}
            />
          </div>
          {checkBox ? (
            <div className="me-2">
              <input
                type="checkbox"
                className="me-2"
                id={id}
                checked={isDirectExpense}
                onChange={() => {
                  setExpense(true);
                }}
              />
              <label className="me-3" htmlFor="">
                Direct
              </label>
              <input
                type="checkbox"
                className="me-2"
                id={id}
                checked={!isDirectExpense}
                onChange={() => {
                  setExpense(false);
                }}
              />
              <label className="me-3" htmlFor="">
                Indirect
              </label>
            </div>
          ) : (
            <div className="d-flex align-items-center">
              <div className="input me-3 mt-4">
                <input
                  id={id}
                  name={id}
                  type="number"
                  placeholder="Eg. 2"
                  value={quantity}
                  onChange={handleQuantityChange}
                />
              </div>
              <span>{`Total = ${inputValue ? inputValue : "0"}`}</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ExpenseInput;
