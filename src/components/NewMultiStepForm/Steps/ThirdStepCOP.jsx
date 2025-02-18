import React, { useState, useEffect, useRef } from "react";
import deleteImg from "../delete.png";
import checkImg from "../check.png";

const ThirdStepCOP = ({ formData, onFormDataChange }) => {
  const prevDataRef = useRef(null);

  const defaultData = {
    Land: { name: "Land", id: "Land", amount: 0, rate: 15, isCustom: false },
    Building: { name: "Building", id: "Building", amount: 0, rate: 15 },
    FurnitureandFittings: {
      name: "Furniture and Fittings",
      id: "FurnitureandFittings",
      amount: 0,
      rate: 15,
      isCustom: false,
    },
    PlantMachinery: {
      name: "Plant Machinery",
      id: "PlantMachinery",
      amount: 0,
      rate: 15,
      isCustom: false,
    },
    IntangibleAssets: {
      name: "Intangible Assets",
      id: "IntangibleAssets",
      amount: 0,
      rate: 15,
      isCustom: false,
    },
    ComputersPeripherals: {
      name: "Computer Peripherals",
      id: "ComputersPeripherals",
      amount: 0,
      rate: 15,
      isCustom: false,
    },
    Miscellaneous: {
      name: "Miscellaneous",
      id: "Miscellaneous",
      amount: 0,
      rate: 15,
      isCustom: false,
    },
  };

  const [localData, setLocalData] = useState(defaultData);

  // ✅ Populate `localData` from `formData.CostOfProject` on mount
  useEffect(() => {
    if (formData?.CostOfProject) {
      const newData = {
        ...defaultData,
        ...formData.CostOfProject,
      };

      // Prevent unnecessary updates
      if (!prevDataRef.current || JSON.stringify(prevDataRef.current) !== JSON.stringify(newData)) {
        // console.log("Populating CostOfProject data:", newData);
        setLocalData(newData);
        prevDataRef.current = newData;
      }
    }
  }, [formData?.CostOfProject]);


  // ✅ Save `localData` back to `onFormDataChange` (Avoiding infinite loop)
  useEffect(() => {
    if (JSON.stringify(localData) !== JSON.stringify(prevDataRef.current)) {
      onFormDataChange({ CostOfProject: localData });
      prevDataRef.current = localData;
    }
  }, [localData, onFormDataChange]);

  // ✅ Handle input changes
  const handleChange = (event, key, field) => {
    const { value } = event.target;
    let newValue = value;

    // Ensure numeric fields are valid numbers
    if (field === "amount" || field === "rate") {
      newValue = value.trim() === "" ? 0 : parseFloat(value) || 0;
    }

    setLocalData((prevData) => ({
      ...prevData,
      [key]: {
        ...prevData[key],
        [field]: newValue,
      },
    }));
  };


  return (
    <div className="form-scroll">
      <form onSubmit={(e) => e.preventDefault()}>
        {Object.entries(localData).map(([key, field], index) => (
          <div key={key}>
            <div className="d-flex gap-2 my-4 justify-content-around">
              <div className="w-100">
                {index === 0 && <label className="form-label">Name</label>}
                <input
                  name="name"
                  placeholder={field.name}
                  onChange={(e) => handleChange(e, key, "name")}
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
                  onChange={(e) => handleChange(e, key, "amount")}
                  value={field.amount}
                  className="form-control"
                  type="number"
                />
              </div>
              <div>
                {index === 0 && (
                  <label className="form-label">Depreciation(%)</label>
                )}
                <input
                  name="rate"
                  placeholder={field.rate}
                  onChange={(e) => handleChange(e, key, "rate")}
                  value={field.rate}
                  className="form-control"
                  type="number"
                />
              </div>
              {field.isCustom ? (
                <button
                  className="btn h-100 mt-auto"
                  style={{ width: "50px", padding: "0", border: "none" }}
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
                <span
                  className="h-100 mt-auto"
                  style={{ width: "43px", padding: "0", border: "none" }}
                >
                  <img src={checkImg} alt="add" className="w-100" />
                </span>
              )}
            </div>
            <hr />
          </div>
        ))}


        {/* <div className="d-flex gap-2 my-4 justify-content-end">
          <div className="w-100 flex">
            <label className="form-label w-100">Working Capital</label>
             <input 
             type="text"
             name="workingCapital"
             className="form-control w-[50%]"
             value={formData.MeansOfFinance.totalWorkingCapital}
              />
          </div>

        </div> */}
        {/* Working Capital Input */}
        <div className="d-flex gap-2 my-4 justify-content-end">
          <div className="w-100 flex">
            <label
              className="form-label w-100"
              style={{
                backgroundColor: "var(--bs-secondary-bg)",
                padding: "0.5rem",
                marginRight: "1rem",
                borderRadius: "0.5rem",
              }}
            >
              Working Capital
            </label>

            <input
              type="number"
              name="workingCapital"
              className="form-control w-[50%]"
              value={formData.MeansOfFinance?.totalWorkingCapital || ""}
              onChange={(e) => {
                const newValue = e.target.value.trim() === "" ? 0 : parseFloat(e.target.value) || 0;
                onFormDataChange({
                  ...formData,
                  MeansOfFinance: {
                    ...formData.MeansOfFinance,
                    totalWorkingCapital: newValue,
                  },
                });
              }}
            />
          </div>
        </div>

        {/* Total Amount Calculation */}
        <div className="d-flex gap-2 my-4 justify-content-end">
          <div className="w-100 flex">
            <label className="form-label w-100">Total Amount</label>
            <input
              name="totalAmount"
              value={Object.values(localData).reduce(
                ((total, field) => total + field.amount),
                0
              ) + Number(formData.MeansOfFinance.totalWorkingCapital)}
              className="form-control w-[50%]"
              type="number"
              disabled
            />
          </div>
        </div>
        <button
          className="btn btn-secondary px-4"
          onClick={() => {
            // Check if the number of fields is less than 5
            if (Object.keys(localData).length < 12) {
              setLocalData((prevData) => ({
                ...prevData,
                [`CustomField${Object.keys(prevData).length + 1}`]: {
                  name: "",
                  id: `CustomField${Object.keys(prevData).length + 1}`,
                  amount: 0,
                  rate: 15,
                  isCustom: true,
                },
              }));
            } else {
              alert("You can only add up to 5 fields.");
            }
          }}
        >
          + Add More
        </button>
      </form>
      <div className="my-2 d-flex gap-5 justify-content-center"></div>
    </div>
  );
};

export default ThirdStepCOP;







// import React, { useState, useEffect, useRef } from "react";
// import deleteImg from "../delete.png";
// import checkImg from "../check.png";

// const ThirdStepCOP = ({ formData, onFormDataChange }) => {
//   const prevDataRef = useRef(null);

//   const defaultData = {
//     Land: { name: "Land", id: "Land", amount: 0, rate: 15, isCustom: false },
//     Building: { name: "Building", id: "Building", amount: 0, rate: 15 },
//     FurnitureandFittings: {
//       name: "Furniture and Fittings",
//       id: "FurnitureandFittings",
//       amount: 0,
//       rate: 15,
//       isCustom: false,
//     },
//     PlantMachinery: {
//       name: "Plant Machinery",
//       id: "PlantMachinery",
//       amount: 0,
//       rate: 15,
//       isCustom: false,
//     },
//     IntangibleAssets: {
//       name: "Intangible Assets",
//       id: "IntangibleAssets",
//       amount: 0,
//       rate: 15,
//       isCustom: false,
//     },
//     ComputersPeripherals: {
//       name: "Computer Peripherals",
//       id: "ComputersPeripherals",
//       amount: 0,
//       rate: 15,
//       isCustom: false,
//     },
//     Miscellaneous: {
//       name: "Miscellaneous",
//       id: "Miscellaneous",
//       amount: 0,
//       rate: 15,
//       isCustom: false,
//     },
//      };

//   const [localData, setLocalData] = useState(defaultData);

//   // ✅ Populate `localData` from `formData.CostOfProject` on mount
//   useEffect(() => {
//     if (formData?.CostOfProject) {
//       const newData = {
//         ...defaultData,
//         ...formData.CostOfProject,
//       };

//       // Prevent unnecessary updates
//       if (!prevDataRef.current || JSON.stringify(prevDataRef.current) !== JSON.stringify(newData)) {
//         // console.log("Populating CostOfProject data:", newData);
//         setLocalData(newData);
//         prevDataRef.current = newData;
//       }
//     }
//   }, [formData?.CostOfProject]);


//   // ✅ Save `localData` back to `onFormDataChange` (Avoiding infinite loop)
//   useEffect(() => {
//     if (JSON.stringify(localData) !== JSON.stringify(prevDataRef.current)) {
//       onFormDataChange({ CostOfProject: localData });
//       prevDataRef.current = localData;
//     }
//   }, [localData, onFormDataChange]);

//   // ✅ Handle input changes
//   const handleChange = (event, key, field) => {
//     const { value } = event.target;
//     let newValue = value;

//     // Ensure numeric fields are valid numbers
//     if (field === "amount" || field === "rate") {
//       newValue = value.trim() === "" ? 0 : parseFloat(value) || 0;
//     }

//     setLocalData((prevData) => ({
//       ...prevData,
//       [key]: {
//         ...prevData[key],
//         [field]: newValue,
//       },
//     }));
//   };


//   return (
//     <div className="form-scroll">
//       <form onSubmit={(e) => e.preventDefault()}>
//         {Object.entries(localData).map(([key, field], index) => (
//           <div key={key}>
//             <div className="d-flex gap-2 my-4 justify-content-around">
//               <div className="w-100">
//                 {index === 0 && <label className="form-label">Name</label>}
//                 <input
//                   name="name"
//                   placeholder={field.name}
//                   onChange={(e) => handleChange(e, key, "name")}
//                   value={field.name}
//                   className="form-control"
//                   type="text"
//                   disabled={!field.isCustom}
//                 />
//               </div>
//               <div>
//                 {index === 0 && <label className="form-label">Amount</label>}
//                 <input
//                   name="amount"
//                   placeholder={field.amount}
//                   onChange={(e) => handleChange(e, key, "amount")}
//                   value={field.amount}
//                   className="form-control"
//                   type="number"
//                 />
//               </div>
//               <div>
//                 {index === 0 && (
//                   <label className="form-label">Depreciation(%)</label>
//                 )}
//                 <input
//                   name="rate"
//                   placeholder={field.rate}
//                   onChange={(e) => handleChange(e, key, "rate")}
//                   value={field.rate}
//                   className="form-control"
//                   type="number"
//                 />
//               </div>
//               {field.isCustom ? (
//                 <button
//                   className="btn h-100 mt-auto"
//                   style={{ width: "50px", padding: "0", border: "none" }}
//                   onClick={() =>
//                     setLocalData((prevData) => {
//                       const updatedData = { ...prevData };
//                       delete updatedData[key];
//                       return updatedData;
//                     })
//                   }
//                 >
//                   <img src={deleteImg} alt="Remove" className="w-100" />
//                 </button>
//               ) : (
//                 <span
//                   className="h-100 mt-auto"
//                   style={{ width: "43px", padding: "0", border: "none" }}
//                 >
//                   <img src={checkImg} alt="add" className="w-100" />
//                 </span>
//               )}
//             </div>
//             <hr />
//           </div>
//         ))}
//         {/* Total Amount Calculation */}
//         <div className="d-flex gap-2 my-4 justify-content-end">
//           <div className="w-100 flex">
//             <label className="form-label w-100">Total Amount</label>
//             <input
//               name="totalAmount"
//               value={Object.values(localData).reduce(
//                 (total, field) => total + field.amount,
//                 0
//               )}
//               className="form-control w-[50%]"
//               type="number"
//               disabled
//             />
//           </div>
//         </div>
//         <button
//           className="btn btn-secondary px-4"
//           onClick={() => {
//             // Check if the number of fields is less than 5
//             if (Object.keys(localData).length < 12) {
//               setLocalData((prevData) => ({
//                 ...prevData,
//                 [`CustomField${Object.keys(prevData).length + 1}`]: {
//                   name: "",
//                   id: `CustomField${Object.keys(prevData).length + 1}`,
//                   amount: 0,
//                   rate: 15,
//                   isCustom: true,
//                 },
//               }));
//             } else {
//               alert("You can only add up to 5 fields.");
//             }
//           }}
//         >
//           + Add More
//         </button>
//       </form>
//       <div className="my-2 d-flex gap-5 justify-content-center"></div>
//     </div>
//   );
// };

// export default ThirdStepCOP;



