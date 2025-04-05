import React, { useState, useEffect } from "react";
import deleteImg from "../delete.png";
import checkImg from "../check.png";

const FifthStepExpenses = ({ onFormDataChange, expenseData }) => {
  const [message, setMessage] = useState("");
  const [localData, setLocalData] = useState(() => {
    // ✅ Predefined Direct Expense Categories (from image)
    const defaultDirectExpenses = [
      {
        name: "Raw Material Expenses / Purchases",
        key: "raw_material",
        value: 0,
        isDirect: true,
        type: "direct",
        isCustom: false,
      },
      {
        name: "Electricity Expenses",
        key: "electricity",
        value: 0,
        isDirect: true,
        type: "direct",
        isCustom: false,
      },
      {
        name: "Marketing Expenses",
        key: "marketing",
        value: 0,
        isDirect: true,
        type: "direct",
        isCustom: false,
      },
      {
        name: "Transportation Expenses",
        key: "transportation",
        value: 0,
        isDirect: true,
        type: "direct",
        isCustom: false,
      },
      {
        name: "Insurance Expenses",
        key: "insurance",
        value: 0,
        isDirect: true,
        type: "direct",
        isCustom: false,
      },
      {
        name: "Telephone and Internet Expenses",
        key: "telephone",
        value: 0,
        isDirect: true,
        type: "direct",
        isCustom: false,
      },
      {
        name: "Administrative Expenses",
        key: "administrative",
        value: 0,
        isDirect: true,
        type: "direct",
        isCustom: false,
      },
      {
        name: "Repairs and Maintenance",
        key: "repairs",
        value: 0,
        isDirect: true,
        type: "direct",
        isCustom: false,
      },
      {
        name: "Other Miscellaneous Expenses",
        key: "miscellaneous",
        value: 0,
        isDirect: true,
        type: "direct",
        isCustom: false,
      },
      {
        name: "Water Expenses",
        key: "water",
        value: 0,
        isDirect: true,
        type: "direct",
        isCustom: false,
      },
      {
        name: "Rent Expenses",
        key: "rent",
        value: 0,
        isDirect: true,
        type: "direct",
        isCustom: false,
      },
      {
        name: "CRM Expenses",
        key: "crm",
        value: 0,
        isDirect: true,
        type: "direct",
        isCustom: false,
      },
      {
        name: "Annual Maintenance Charges",
        key: "maintenance",
        value: 0,
        isDirect: false,
        type: "direct",
        isCustom: false,
      },
    ];

    // ✅ Merge existing expenseData if available, otherwise use defaults
    return expenseData && Object.keys(expenseData).length > 0
      ? {
          ...expenseData,
          directExpense: expenseData.directExpense || defaultDirectExpenses,
        }
      : {
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
          directExpense: defaultDirectExpenses, // ✅ Set default direct expenses
          totalExpense: 0,
        };
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
                  className="form-control no-spinner"
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
            <strong className="text-sm font-bold text-gray-900 dark:text-gray-50 dark:font-medium">
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
        {directExpenses.map((form, index) => {
          // ✅ Check if the value contains a percentage ("%")
          const isPercentage =
            form.value && String(form.value).trim().endsWith("%");

          return (
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
                    placeholder="0"
                    value={form.value || ""}
                    onChange={(event) =>
                      handleFormChange(event, index, form, "directExpense")
                    }
                    className="form-control"
                    type="text"
                  />
                </div>

                {/* ✅ Remove "Total" input field if the value is in percentage format */}
                {!isPercentage && (
                  <div>
                    {index === 0 && (
                      <label htmlFor="total" className="form-label">
                        Total
                      </label>
                    )}
                    <input
                      name="total"
                      placeholder="0"
                      value={(parseFloat(form.value) || 0) * 12}
                      className="form-control"
                      type="text"
                      readOnly
                    />
                  </div>
                )}

                <div>
                  {index === 0 && (
                    <label htmlFor="type" className="form-label"></label>
                  )}
                  <select
                    className="form-select mt-auto dark:bg-gray-800 dark:text-gray-100"
                    style={{ width: "170px" }}
                    aria-label="Direct/Indirect"
                    name="type"
                    value={form.type}
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
          );
        })}

        <div className="mt-6 flex justify-end items-center gap-4">
          <strong className="text-sm font-bold text-gray-900 dark:text-green-50">
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
