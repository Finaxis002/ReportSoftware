
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// import React, { useState, useEffect } from "react";
// import deleteImg from "../delete.png";
// import checkImg from "../check.png";
// import axios from "axios";

// // this is Third Step Cost Of Project table


// const ThirdStepCOP = ({ formData, onFormDataChange }) => {
//   const [localData, setLocalData] = useState({
//     _id: formData?._id || "", // Include _id from Step 1
//     Land: 0,
//     Building: 0,
//     FurnitureandFittings: 0,
//     PlantMachinery: 0,
//     IntangibleAssets: 0,
//     ComputersPeripherals: 0,
//     Miscellaneous: 0,
//     DepreciationRate: 15,
//   });

//   const [customFieldsCount, setCustomFieldsCount] = useState(0);
//   // Handle input change
//   // const handleChange = (event, key, field) => {
//   //   const { value } = event.target;
//   //   setLocalData((prevData) => ({
//   //     ...prevData,
//   //     [key]: {
//   //       ...prevData[key],
//   //       [field]:
//   //         field === "amount" || field === "rate"
//   //           ? parseFloat(value) || 0
//   //           : value,
//   //     },
//   //   }));
//   // };
//   const handleChange = (event, key, field) => {
//     const { value } = event.target;
    
//     setLocalData((prevData) => {
//       const updatedValue = field === "amount" || field === "rate" ? parseFloat(value) || 0 : value;
  
//       return {
//         ...prevData,
//         [key]: {
//           ...prevData[key], // Ensure existing values are preserved
//           [field]: updatedValue, 
//         },
//       };
//     });
//   };
  

//   // Automatically save the data when the form is updated
//   useEffect(() => {
//     onFormDataChange({ CostOfProject: localData });
//   }, [localData, onFormDataChange]);


  
//   // const handleStep3Submit = async (e) => {
//   //   e.preventDefault();
  
//   //   // ✅ Ensure _id is a valid string
//   //   const documentId = String(localData._id).trim(); 
  
//   //   if (!documentId || documentId === "undefined") {
//   //     alert("❌ Missing or invalid document ID (_id) from Step 1.");
//   //     return;
//   //   }
  
//   //   // ✅ Ensure CostOfProject is an object (not a string or undefined)
//   //   const costOfProjectData = localData && typeof localData === "object" ? localData : {};
  
//   //   try {
//   //     const response = await axios.post("http://localhost:5000/api/user/step3", {
//   //       _id: documentId, // ✅ Ensure this is a string
//   //       CostOfProject: costOfProjectData, // ✅ Ensure it's always an object
//   //     });
  
//   //     alert("✅ Step 3 data submitted successfully!");
//   //     console.log("📌 Updated document:", response.data);
//   //   } catch (err) {
//   //     console.error("❌ Error submitting Step 3:", err.response?.data || err.message);
//   //     alert("❌ Failed to submit Step 3 data. Check console for details.");
//   //   }
//   // };
//   const handleStep3Submit = async (e) => {
//     e.preventDefault();
  
//     const documentId = String(localData._id).trim();
  
//     if (!documentId || documentId === "undefined") {
//       alert("❌ Missing or invalid document ID (_id) from Step 1.");
//       return;
//     }
  
//     // ✅ Ensure all fields exist as objects
//     const fixField = (field) =>
//       typeof field === "object" && field !== null
//         ? field
//         : { amount: 0, depreciationRate: 15 };
  
//     // ✅ Ensure `Land` and other fields are always included in the request
//     const costOfProjectData = {
//       Land: fixField(localData.Land),
//       Building: fixField(localData.Building),
//       FurnitureandFittings: fixField(localData.FurnitureandFittings),
//       PlantMachinery: fixField(localData.PlantMachinery),
//       IntangibleAssets: fixField(localData.IntangibleAssets),
//       ComputersPeripherals: fixField(localData.ComputersPeripherals),
//       Miscellaneous: fixField(localData.Miscellaneous),
//       customFields: Array.isArray(localData.customFields)
//         ? localData.customFields
//         : [],
//     };
  
//     console.log("📌 Sending data to API:", JSON.stringify(costOfProjectData, null, 2));
  
//     try {
//       const response = await axios.post("http://localhost:5000/api/user/step3", {
//         _id: documentId,
//         CostOfProject: costOfProjectData,
//       });
  
//       alert("✅ Step 3 data submitted successfully!");
//       console.log("📌 Updated document:", response.data);
//     } catch (err) {
//       console.error("❌ Error submitting Step 3:", err.response?.data || err.message);
//       alert("❌ Failed to submit Step 3 data. Check console for details.");
//     }
//   };
  
  
//   return (
    
//   <div className="form-scroll">
//       <form onSubmit={handleStep3Submit}>
//         {Object.entries(localData)
//           .filter(([key]) => key !== "_id") // Remove `_id` field
//           .map(([key, field], index) => (
//             <div key={key}>
//               <div className="d-flex gap-2 my-4 justify-content-around">
//                 <div className="w-100">
//                   {index === 0 && <label className="form-label">Name</label>}
//                   <input
//                     name="name"
//                     placeholder="Enter field name"
//                     onChange={(e) => handleChange(e, key, "name")}
//                     value={field.isCustom ? field.name : key} // ✅ FIX: Show predefined field names correctly
//                     className="form-control"
//                     type="text"
//                     disabled={!field.isCustom} // Only allow editing custom fields
//                   />
//                 </div>
//                 <div>
//                   {index === 0 && <label className="form-label">Amount</label>}
//                   <input
//                     name="amount"
//                     placeholder="Enter amount"
//                     onChange={(e) => handleChange(e, key, "amount")}
//                     value={field.amount}
//                     className="form-control"
//                     type="number"
//                   />
//                 </div>
//                 <div>
//                   {index === 0 && <label className="form-label">Depreciation(%)</label>}
//                   <input
//                     name="rate"
//                     placeholder="Enter rate"
//                     onChange={(e) => handleChange(e, key, "rate")}
//                     value={field.rate}
//                     className="form-control"
//                     type="number"
//                   />
//                 </div>
//                 {field.isCustom ? (
//                   <button
//                     className="btn h-100 mt-auto"
//                     style={{ width: "50px", padding: "0", border: "none" }}
//                     onClick={() => {
//                       setLocalData((prevData) => {
//                         const updatedData = { ...prevData };
//                         delete updatedData[key];
//                         return updatedData;
//                       });
//                       setCustomFieldsCount((prevCount) => prevCount - 1);
//                     }}
//                   >
//                     ❌
//                   </button>
//                 ) : (
//                   <span className="h-100 mt-auto" style={{ width: "43px", padding: "0", border: "none" }}>
//                     ✅
//                   </span>
//                 )}
//               </div>
//               <hr />
//             </div>
//           ))}

//         {/* Add More Button - Allows Up to 5 Dynamic Fields */}
//         <button
//           className="btn btn-secondary px-4 my-3"
//           type="button" // ✅ Prevent form submission on click
//           onClick={() => {
//             if (customFieldsCount < 5) {
//               setLocalData((prevData) => ({
//                 ...prevData,
//                 [`CustomField${customFieldsCount + 1}`]: {
//                   name: `Custom Field ${customFieldsCount + 1}`,
//                   amount: 0,
//                   rate: 15,
//                   isCustom: true,
//                 },
//               }));
//               setCustomFieldsCount((prevCount) => prevCount + 1);
//             } else {
//               alert("You can only add up to 5 custom fields.");
//             }
//           }}
//         >
//           + Add More
//         </button>

//         {/* Total Amount Calculation */}
//         <div className="d-flex gap-2 my-4 justify-content-end">
//           <div className="w-50">
//             <label className="form-label">Total Amount</label>
//             <input
//               name="totalAmount"
//               value={Object.values(localData).reduce(
//                 (total, field) => total + (parseFloat(field.amount) || 0),
//                 0
//               )}
//               className="form-control"
//               type="number"
//               disabled
//             />
//           </div>
//         </div>

//         <div className="row">
//           <div className="col-12 text-center">
//             <button type="submit" className="btn btn-primary">
//               Submit & Next
//             </button>
//           </div>
//         </div>
//       </form>
//     </div>


//   );
// };

// export default ThirdStepCOP;


/////////////////////////////////////////////////////////////////////////////////////////////
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
        {/* Total Amount Calculation */}
        <div className="d-flex gap-2 my-4 justify-content-end">
          <div className="w-100 flex">
            <label className="form-label w-100">Total Amount</label>
            <input
              name="totalAmount"
              value={Object.values(localData).reduce(
                (total, field) => total + field.amount,
                0
              )}
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
