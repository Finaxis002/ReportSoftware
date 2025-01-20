import React, { useState, useEffect } from "react";
import deleteImg from "../delete.png";
import checkImg from "../check.png";


// this is Third Step Cost Of Project table
//  


const ThirdStepCOP = ({ formData, onFormDataChange }) => {
  const [localData, setLocalData] = useState({
    Land: { name: "Land", id: "Land", amount: 0, rate: 15, isCustom: false },
    Building: { name: "Building", id: "Building", amount: 0, rate: 15 },
    FurnitureandFittings: { name: "Furniture and Fittings", id: "FurnitureandFittings", amount: 0, rate: 15, isCustom: false },
    PlantMachinery: { name: "Plant Machinery", id: "PlantMachinery", amount: 0, rate: 15, isCustom: false },
    IntangibleAssets: { name: "Intangible Assets", id: "IntangibleAssets", amount: 0, rate: 15, isCustom: false },
    ComputersPeripherals: { name: "Computer Peripherals", id: "ComputersPeripherals", amount: 0, rate: 15, isCustom: false },
    Miscellaneous: { name: "Miscellaneous", id: "Miscellaneous", amount: 0, rate: 15, isCustom: false },
  });

  // Handle input change
  const handleChange = (event, key, field) => {
    const { value } = event.target;
    setLocalData((prevData) => ({
      ...prevData,
      [key]: {
        ...prevData[key],
        [field]: field === 'amount' || field === 'rate' ? parseFloat(value) || 0 : value,
      },
    }));
  };

  // Automatically save the data when the form is updated
  useEffect(() => {
    onFormDataChange({ CostOfProject: localData });
  }, [localData, onFormDataChange]);

  return (
    <div className="form-scroll">
      <form onSubmit={(e) => e.preventDefault()} className="form-scroll">
        {Object.entries(localData).map(([key, field], index) => (
          <div key={key}>
            <div className="d-flex gap-2 my-4 justify-content-around">
              <div className="w-100">
                {index === 0 && <label className="form-label">Name</label>}
                <input
                  name="name"
                  placeholder={field.name}
                  onChange={(e) => handleChange(e, key, 'name')}
                  value={field.name}
                  className="form-control"
                  type="text"
                  disabled={!field.isCustom}
                />
               
              </div>
              <div>
                {index === 0 && <label className="form-label">Amount</label>}
                <input
                  name="amount"
                  placeholder={field.amount}
                  onChange={(e) => handleChange(e, key, 'amount')}
                  value={field.amount}
                  className="form-control"
                  type="number"
                />
              </div>
              <div>
                {index === 0 && <label className="form-label">Depreciation(%)</label>}
                <input
                  name="rate"
                  placeholder={field.rate}
                  onChange={(e) => handleChange(e, key, 'rate')}
                  value={field.rate}
                  className="form-control"
                  type="number"
                />
              </div>
              {field.isCustom ? (
                <button
                  className="btn h-100 mt-auto"
                  style={{ width: '50px', padding: '0', border: 'none' }}
                  onClick={() =>
                    setLocalData((prevData) => {
                      const updatedData = { ...prevData };
                      delete updatedData[key];
                      return updatedData;
                    })
                  }
                >
                  <img src={deleteImg} alt="Remove" className="w-100" />
                </button>
              ) : (
                <span className="h-100 mt-auto" style={{ width: '43px', padding: '0', border: 'none' }}>
                  <img src={checkImg} alt="add" className="w-100" />
                </span>
              )}
            </div>
            <hr />
          </div>
        ))}
        <button
          className="btn btn-secondary px-4"
          onClick={() =>
            setLocalData((prevData) => ({
              ...prevData,
              [`CustomField${Object.keys(prevData).length + 1}`]: {
                name: '',
                id: `CustomField${Object.keys(prevData).length + 1}`,
                amount: 0,
                rate: 15,
                isCustom: true,
              },
            }))
          }
        >
          + Add More
        </button>
      </form>
      <div className="my-2 d-flex gap-5 justify-content-center">
      </div>
    </div>
  );
};

export default ThirdStepCOP;

