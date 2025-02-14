import React, { useEffect, useState } from "react";
import ExpenseInput from "../inputContainers/ExpenseInput";

const Step4 = ({ handleSave }) => {
  // const initialFormInput = {
  //     normalExpense : {
  //         ManagerTotal: {key: "ManagerTotal",value: 0}, SkilledLabourTotal: {key: "SkilledLabourTotal",value: 0},LabourTotal: {key: "LabourTotal",value: 0},SecurityGuardTotal: {key: "SecurityGuardTotal",value: 0},
  //         SupervisorTotal: {key: "SupervisorTotal",value: 0}, ChefTotal: {key: "ChefTotal",value: 0}, AdminStaffTotal: {key: "AdminStaffTotal",value: 0},
  //     },
  //     DExpense : {
  //         DRawMaterialExpenses: {key: "DRawMaterialExpenses",value : 20000,isDirect : true},DElectricityExpenses:{key: "DElectricityExpenses" ,value : 5000,isDirect : false}, DMarketingExpenses: {key: "DMarketingExpenses" ,value : 2000,isDirect : true},
  //         DTransportationExpenses: {key: "DTransportationExpenses",value : 0,isDirect : true},DInsuranceExpenses: {key: "DInsuranceExpenses",value : 1010,isDirect : false},
  //         DTelephoneAndInternetExpenses: {key: "DTelephoneAndInternetExpenses" ,value : 0,isDirect : true},DAdministrativeExpenses: {key: "DAdministrativeExpenses" ,value : 80000,isDirect : true},
  //         DRepairsAndMaintanenceExpense: {key: "DRepairsAndMaintanenceExpense" ,value : 50000,isDirect : true},DOtherMiscellaneousExpenses: {key:"DOtherMiscellaneousExpenses",value : 200000,isDirect : true},
  //         DRentExpenses: {key: "DRentExpenses" ,value : 300000,isDirect : true},DStationeryExpenses: {key: "DStationeryExpenses" ,value : 20000,isDirect : true}
  //     }
  // }

  const initialFormInput = {
    normalExpense: [
      {
        name: "Manager",
        key: "ManagerTotal",
        value: 0,
        type: "normal",
        isCustom: false,
        amount: 0,
        quantity: 1,
      },
      {
        name: "Skilled Labour",
        key: "SkilledLabourTotal",
        value: 0,
        type: "normal",
        isCustom: false,
        amount: 0,
        quantity: 1,
      },
      {
        name: "Labour",
        key: "LabourTotal",
        value: 20000,
        type: "normal",
        isCustom: false,
        amount: 0,
        quantity: 1,
      },
      {
        name: "Security Guard",
        key: "SecurityGuardTotal",
        value: 0,
        type: "normal",
        amount: 0,
        quantity: 1,
      },
      {
        name: "Supervisor",
        key: "SupervisorTotal",
        value: 0,
        type: "normal",
        isCustom: false,
        amount: 0,
        quantity: 1,
      },
      {
        name: "Chef",
        key: "ChefTotal",
        value: 0,
        type: "normal",
        isCustom: false,
        amount: 0,
        quantity: 1,
      },
      {
        name: "Admin Staff",
        key: "AdminStaffTotal",
        value: 0,
        type: "normal",
        isCustom: false,
        amount: 0,
        quantiy: 1,
      },
      {
        name: "Fringe Benfits",
        key: "FringeBenefits",
        value: 5,
        type: "normal",
        amount: 0,
        quantity: 1,
      },
      {
        name: "",
        key: "CustomTotal1",
        value: 0,
        type: "normal",
        isCustom: true,
        amount: 0,
        quantity: 1,
      },
      {
        name: "",
        key: "CustomTotal2",
        value: 0,
        type: "normal",
        isCustom: true,
        amount: 0,
        quantity: 1,
      },
      {
        name: "",
        key: "CustomTotal3",
        value: 0,
        type: "normal",
        isCustom: true,
        amount: 0,
        quantity: 1,
      },
    ],
    DExpense: [
      {
        name: "Raw Material",
        key: "DRawMaterialExpenses",
        value: 0,
        isDirect: true,
        type: "direct",
        isCustom: false,
      },
      {
        name: "Electricity",
        key: "DElectricityExpenses",
        value: 0,
        isDirect: true,
        type: "direct",
        isCustom: false,
      },
      {
        name: "Marketing",
        key: "DMarketingExpenses",
        value: 0,
        isDirect: true,
        type: "direct",
        isCustom: false,
      },
      {
        name: "Transport",
        key: "DTransportationExpenses",
        value: 0,
        isDirect: true,
        type: "direct",
        isCustom: false,
      },
      {
        name: "Insurance",
        key: "DInsuranceExpenses",
        value: 0,
        isDirect: true,
        type: "direct",
        isCustom: false,
      },
      {
        name: "Telephone and Internet",
        key: "DTelephoneAndInternetExpenses",
        value: 0,
        isDirect: true,
        type: "direct",
        isCustom: false,
      },
      {
        name: "Administrative",
        key: "DAdministrativeExpenses",
        value: 0,
        isDirect: true,
        type: "direct",
        isCustom: false,
      },
      {
        name: "Repairs and Maintainence",
        key: "DRepairsAndMaintanenceExpense",
        value: 0,
        isDirect: true,
        type: "direct",
        isCustom: false,
      },
      {
        name: "Miscellaneous",
        key: "DOtherMiscellaneousExpenses",
        value: 0,
        isDirect: true,
        type: "direct",
        isCustom: false,
      },
      {
        name: "Rent",
        key: "DRentExpenses",
        value: 0,
        isDirect: true,
        type: "direct",
        isCustom: false,
      },
      {
        name: "Stationery",
        key: "DStationeryExpenses",
        value: 0,
        isDirect: true,
        type: "direct",
        isCustom: false,
      },
      {
        name: "",
        key: "CustomTotal4",
        value: 0,
        isDirect: true,
        type: "direct",
        isCustom: true,
      },
      {
        name: "",
        key: "CustomTotal5",
        value: 0,
        isDirect: true,
        type: "direct",
        isCustom: true,
      },
      {
        name: "",
        key: "CustomTotal6",
        value: 0,
        isDirect: true,
        type: "direct",
        isCustom: true,
      },
      {
        name: "",
        key: "CustomTotal6",
        value: 0,
        isDirect: true,
        type: "direct",
        isCustom: true,
      },
    ],
  };

  const [formInput, setFormInput] = useState(initialFormInput);

  const [isRawMatDirExp, setRawExpDirExp] = useState(true);
  const [isElectricityDirExp, setElectricityDirExp] = useState(true);
  const [isMarkDirExp, setMarkDirExp] = useState(true);
  const [isTransDirExp, setTransDirExpense] = useState(true);
  const [isInsurDirExp, setInsurDirExp] = useState(true);
  const [isTeleDirExp, setTeleDirExp] = useState(true);
  const [isAdminDirExp, setAdminDirExp] = useState(true);
  const [isRepairDirExp, setRepairDirExp] = useState(true);
  const [isMiscDirExp, setMiscDirExp] = useState(true);
  const [isRentDirExp, setRentDirExp] = useState(true);
  const [isStationeryDirExp, setStationerDirExp] = useState(true);
  const [addMoreCount, setAddMoreCount] = useState(0);

  const handleSave2 = () => {
    console.log(">>>>>", formInput.DExpense);
  };

  useEffect(() => {
    console.log("SSS", formInput);
  });

  return (
    <div>
      <div className="form-scroll">
        {/* <h4 className='mb-3'>Wages Table</h4> */}

        <h5>Expected Salary</h5>

        {formInput.normalExpense.map((value, index) => (
          <ExpenseInput
            formInput={formInput}
            setFormInput={setFormInput}
            title={value.name}
            id={value.key}
            checkBox={false}
            type={"normal"}
            index={index}
            inputValue={value.value}
            amount={value.amount}
            quantity={value.quantity}
            isCustom={value.isCustom}
          />
        ))}

        <h5>Direct/Indirect Expenses</h5>
        {formInput.DExpense.map((value, index) => (
          <ExpenseInput
            formInput={formInput}
            setFormInput={setFormInput}
            title={value.name}
            id={value.key}
            inputAmt={value.value}
            isDirectExpense={value.isDirect}
            checkBox={true}
            index={index}
            type={"direct"}
            isCustom={value.isCustom}
          />
        ))}

        {/* <ExpenseInput
          formInput={formInput}
          setFormInput={setFormInput}
          setExpense={setElectricityDirExp}
          title="Electricity Expenses"
          id="DElectricityExpenses"
          isDirectExpense={isElectricityDirExp}
          checkBox={true}
          type={"direct"}
        />
        <ExpenseInput
          formInput={formInput}
          setFormInput={setFormInput}
          setExpense={setMarkDirExp}
          title="Marketing Expenses"
          id="DMarketingExpenses"
          isDirectExpense={isMarkDirExp}
          checkBox={true}
          type={"direct"}
        />
        <ExpenseInput
          formInput={formInput}
          setFormInput={setFormInput}
          setExpense={setTransDirExpense}
          title="Transportation Expenses"
          id="DTransportationExpenses"
          isDirectExpense={isTransDirExp}
          checkBox={true}
          type={"direct"}
        />
        <ExpenseInput
          formInput={formInput}
          setFormInput={setFormInput}
          setExpense={setInsurDirExp}
          title="Insurance Expenses"
          id="DInsuranceExpenses"
          isDirectExpense={isInsurDirExp}
          checkBox={true}
          type={"direct"}
        />
        <ExpenseInput
          formInput={formInput}
          setFormInput={setFormInput}
          setExpense={setTeleDirExp}
          title="Telephone & Internet Expenses"
          id="DTelephoneAndInternetExpenses"
          isDirectExpense={isTeleDirExp}
          checkBox={true}
          type={"direct"}
        />
        <ExpenseInput
          formInput={formInput}
          setFormInput={setFormInput}
          setExpense={setAdminDirExp}
          title="Administrative Expenses"
          id="DAdministrativeExpenses"
          isDirectExpense={isAdminDirExp}
          checkBox={true}
          type={"direct"}
        />
        <ExpenseInput
          formInput={formInput}
          setFormInput={setFormInput}
          setExpense={setRepairDirExp}
          title="Repairs & Maintainence Expenses"
          id="DRepairsAndMaintanenceExpense"
          isDirectExpense={isRepairDirExp}
          checkBox={true}
          type={"direct"}
        />
        <ExpenseInput
          formInput={formInput}
          setFormInput={setFormInput}
          setExpense={setMiscDirExp}
          title="Miscelaneous Expenses"
          id="DOtherMiscellaneousExpenses"
          isDirectExpense={isMiscDirExp}
          checkBox={true}
          type={"direct"}
        />
        <ExpenseInput
          formInput={formInput}
          setFormInput={setFormInput}
          setExpense={setRentDirExp}
          title="Rent Expenses"
          id="DRentExpenses"
          isDirectExpense={isRentDirExp}
          checkBox={true}
          type={"direct"}
        />
        <ExpenseInput
          formInput={formInput}
          setFormInput={setFormInput}
          setExpense={setStationerDirExp}
          title="Stationery Expenses"
          id="DStationeryExpenses"
          isDirectExpense={isStationeryDirExp}
          checkBox={true}
          type={"direct"}
        /> */}

        <button className="btn btn-info mt-3" onClick={() => { }}>
          Load more
        </button>
      </div>

      <button
        className="btn btn-success mt-5 px-5"
        onClick={() => {
          handleSave2({ step2: formInput });
        }}
      >
        Save
      </button>
    </div>
  );
};

export default Step4;

// <div className='d-flex align-items-center'>
//                     <div className='me-5'>
//                         <h5 >Designation</h5>
//                         <div className="input me-3 mt-4">
//                             <span >Manager</span>

//                         </div>
//                     </div>
//                     <div>
//                         <h5>Number</h5>
//                         <div className="input me-3 mt-4">
//                             <input id="ManagerNo" name="ManagerNo" type="number" placeholder='Eg. 1,00,000'
//                                 value={formInput.Land} onChange={(e) => handleChange(e)} />
//                             <label htmlFor="ManagerNo">Amount</label>

//                         </div>
//                     </div>
//                     <div>
//                         <h5>Monthly</h5>
//                         <div className="input me-3 mt-4">
//                             <input id="ManagerAmt" name="ManagerAmt" type="number" placeholder='Eg. 1,00,000'
//                                 value={formInput.Land} onChange={(e) => handleChange(e)} />
//                             <label htmlFor="ManagerAmt">Amount</label>

//                         </div>
//                     </div>
//                     <div>
//                         <h5>Total</h5>
//                         <div className="input me-3 mt-4">
//                             <span>{formInput.ManagerAmt * formInput.ManagerNo}</span>

//                         </div>
//                     </div>

//                 </div>

//                 <div className='d-flex align-items-center'>

//                     <div className="input ms-3 me-5 mt-4">
//                         <span >Supervisor</span>

//                     </div>

//                     <div className="input ms-4 me-3 mt-2">
//                         <input id="SupervisorNo" name="SupervisorNo" type="number" placeholder='Eg. 1,00,000'
//                             value={formInput.Land} onChange={(e) => handleChange(e)} />
//                         <label htmlFor="SupervisorNo">Amount</label>

//                     </div>
//                     <div className="input me-3 mt-2">
//                         <input id="SupervisorAmt" name="SupervisorAmt" type="number" placeholder='Eg. 1,00,000'
//                             value={formInput.Land} onChange={(e) => handleChange(e)} />
//                         <label htmlFor="SupervisorAmt">Amount</label>

//                     </div>
//                     <div className="input me-3 mt-2">
//                         <span>{formInput.SupervisorAmt * formInput.SupervisorNo}</span>

//                     </div>
//                 </div>
//                 <div className='d-flex align-items-center'>

//                     <div className="input ms-3 me-5 mt-4">
//                         <span >Skilled Labour</span>

//                     </div>

//                     <div className="input ms-4 me-3 mt-2">
//                         <input id="SkilledLabourNo" name="SkilledLabourNo" type="number" placeholder='Eg. 1,00,000'
//                             value={formInput.Land} onChange={(e) => handleChange(e)} />
//                         <label htmlFor="SkilledLabourNo">Amount</label>

//                     </div>
//                     <div className="input me-3 mt-2">
//                         <input id="SkilledLabourAmt" name="SkilledLabourAmt" type="number" placeholder='Eg. 1,00,000'
//                             value={formInput.Land} onChange={(e) => handleChange(e)} />
//                         <label htmlFor="SkilledLabourAmt">Amount</label>

//                     </div>
//                     <div className="input me-3 mt-2">
//                         <span>{formInput.SkilledLabourAmt * formInput.SkilledLabourNo}</span>

//                     </div>

//                 </div>
//                 <div className='d-flex align-items-center'>

//                     <div className="input ms-3 me-5 mt-4">
//                         <span >Labour</span>

//                     </div>

//                     <div className="input ms-4 me-3 mt-2">
//                         <input id="LabourNo" name="LabourNo" type="number" placeholder='Eg. 1,00,000'
//                             value={formInput.Land} onChange={(e) => handleChange(e)} />
//                         <label htmlFor="LabourNo">Amount</label>

//                     </div>
//                     <div className="input me-3 mt-2">
//                         <input id="LabourAmt" name="LabourAmt" type="number" placeholder='Eg. 1,00,000'
//                             value={formInput.Land} onChange={(e) => handleChange(e)} />
//                         <label htmlFor="LabourAmt">Amount</label>

//                     </div>
//                     <div className="input me-3 mt-2">
//                         <span>{formInput.LabourAmt * formInput.LabourNo}</span>

//                     </div>
//                 </div>
//                 <div className='d-flex align-items-center'>

//                     <div className="input ms-3 me-5 mt-4">
//                         <span >Security Guard</span>

//                     </div>

//                     <div className="input ms-4 me-3 mt-2">
//                         <input id="SecurityGuardNo" name="SecurityGuardNo" type="number" placeholder='Eg. 1,00,000'
//                             value={formInput.Land} onChange={(e) => handleChange(e)} />
//                         <label htmlFor="SecurityGuardNo">Amount</label>

//                     </div>
//                     <div className="input me-3 mt-2">
//                         <input id="SecurityGuardAmt" name="SecurityGuardAmt" type="number" placeholder='Eg. 1,00,000'
//                             value={formInput.Land} onChange={(e) => handleChange(e)} />
//                         <label htmlFor="SecurityGuardAmt">Amount</label>

//                     </div>
//                     <div className="input me-3 mt-2">
//                         <span>{formInput.SecurityGuardAmt * formInput.SecurityGuardNo}</span>

//                     </div>
//                 </div>
//                 <div className='d-flex align-items-center'>

//                     <div className="input ms-3 me-5 mt-4">
//                         <span >Chef</span>

//                     </div>

//                     <div className="input ms-4 me-3 mt-2">
//                         <input id="ChefNo" name="ChefNo" type="number" placeholder='Eg. 1,00,000'
//                             value={formInput.Land} onChange={(e) => handleChange(e)} />
//                         <label htmlFor="ChefNo">Amount</label>

//                     </div>
//                     <div className="input me-3 mt-2">
//                         <input id="ChefAmt" name="ChefAmt" type="number" placeholder='Eg. 1,00,000'
//                             value={formInput.Land} onChange={(e) => handleChange(e)} />
//                         <label htmlFor="ChefAmt">Amount</label>

//                     </div>
//                     <div className="input me-3 mt-2">
//                         <span>{formInput.ChefAmt * formInput.ChefNo}</span>

//                     </div>
//                 </div>
//                 <div className='d-flex  align-items-center'>

//                     <div className="input ms-3 me-5 mt-4">
//                         <span >Admin Staff</span>

//                     </div>

//                     <div className="input ms-4 me-3 mt-2">
//                         <input id="AdminStaffNo" name="AdminStaffNo" type="number" placeholder='Eg. 1,00,000'
//                             value={formInput.Land} onChange={(e) => handleChange(e)} />
//                         <label htmlFor="AdminStaffNo">Amount</label>

//                     </div>
//                     <div className="input me-3 mt-2">
//                         <input id="AdminStaffAmt" name="AdminStaffAmt" type="number" placeholder='Eg. 1,00,000'
//                             value={formInput.Land} onChange={(e) => handleChange(e)} />
//                         <label htmlFor="AdminStaffAmt">Amount</label>

//                     </div>
//                     <div className="input me-3 mt-2">
//                         <span>{formInput.AdminStaffAmt * formInput.AdminStaffNo}</span>

//                     </div>

//                 </div>
