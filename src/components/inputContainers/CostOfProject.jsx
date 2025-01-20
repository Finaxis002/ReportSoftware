import React, { useEffect, useState } from 'react'


const CostOfProject =({id,inputName,type,setFormInput,formInput,index,amountValue,rateValue,isCustom})=>{

    const [amount,setAmount] = useState(0)

    const [rate,setRate] = useState(15);

    const handleAmtChange = (e) => {
        const updatedFormInput = [...formInput]; 
        updatedFormInput[index] = {
          ...updatedFormInput[index], 
          amount: parseFloat(e.target.value) 
        };
        setFormInput(updatedFormInput); 
      }


      const handleRateChange = (e) => {
        const updatedFormInput = [...formInput]; 
        updatedFormInput[index] = {
          ...updatedFormInput[index], 
          rate: parseFloat(e.target.value) 
        };
        setFormInput(updatedFormInput); 

      }

      const handleNameChange = (e)=>{
        const updatedFormInput = [...formInput]; 
        updatedFormInput[index] = {
          ...updatedFormInput[index], 
          name: e.target.value 
        };
        setFormInput(updatedFormInput); 
      }
  
    // const handleAdd = ()=>{
    //     const updatedObj = {
    //         name : name,
    //         id: id,
    //         amount : amount,
    //         rate : rate
    //     }
    //     const existingItemIndex = formInput.findIndex(item => item.name === updatedObj.name);

    //     if(formInput.length === 0){
    //         const arr = []
    //         arr.push(updatedObj)
    //         setFormInput(arr)
    //     }else if(existingItemIndex === -1){
    //         const updatedArray = formInput.map(item => {
    //             if (item.name === updatedObj.name) {
    //                 console.log("IN 1")
    //                 return updatedObj; 
    //             }
    //             return item; 
    //         });

    //         setFormInput(updatedArray);
    //     }else{
    //         console.log("IN 2")

    //         const arr = formInput
    //         arr.push(updatedObj)
    //         setFormInput(arr);
    //     }
    // }

   

    return(
            <div className="input d-flex flex-1 align-middle">
                    {isCustom ? 
                      <input className='me-5 flex-1' id={id} name={inputName} type={'text'}
                      value={inputName} onChange={handleNameChange} /> 
                      : 
                      <h6 style={{marginRight: 155,flex:1}} className=''>{inputName}</h6>
                    }
                    <input className='me-5 flex-1' id={id} name={inputName} type={type}
                        value={amountValue} onChange={handleAmtChange} />
                    {/* <label htmlFor="Land">{labelText}</label> */}
                    <input className='flex-grow-1' id={id} name={inputName} type={type}
                        value={rateValue} onChange={handleRateChange} />
                    {/* <label htmlFor="Land">{labelText}</label> */}
                    {/* <button className="btn btn-success ml-3 px-3" onClick={handleAdd}>
                        Add
                    </button> */}
            </div>
        
    )
}

export default CostOfProject;