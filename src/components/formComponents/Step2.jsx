import React, { useEffect, useState } from 'react'
import CostOfProject from '../inputContainers/CostOfProject'

const Step2 = ({ handleSave }) => {

    const initialCopState = [
        { name: 'Land', id: 'Land', amount: 0, rate: 15, isCustom: false },
        { name: 'Building', id: 'Building', amount: 0, rate: 15 },
        { name: 'Furniture and Fittings', id: 'FurnitureandFittings', amount: 0, rate: 15, isCustom: false },
        { name: 'Plant Machinery', id: 'PlantMachinery', amount: 0, rate: 15, isCustom: false },
        { name: 'Intangible Assets', id: 'IntangibleAssets', amount: 0, rate: 15, isCustom: false },
        { name: 'Computer Peripherals', id: 'ComputersPeripherals', amount: 0, rate: 15, isCustom: false },
        { name: 'Miscellaneous', id: 'Miscellaneous', amount: 0, rate: 15, isCustom: false },
        { name: '', id: 'Custom1', amount: 0, rate: 15, isCustom: true },
        { name: '', id: 'Custom2', amount: 0, rate: 15, isCustom: true },
        { name: '', id: 'Custom3', amount: 0, rate: 15, isCustom: true },
        { name: '', id: 'Custom4', amount: 0, rate: 15, isCustom: true },
    ]

    const [formInput, setFormInput] = useState(initialCopState)
    useEffect(() => { console.log("forminput", formInput) })

    return (
        <div>
            <div className='form-scroll'>
                <div className="d-flex justify-content-around" style={{ marginTop: 20, marginBottom: 20, flexDirection: 'row' }}>
                    <h5>Amount</h5>
                    <h5>Depreciation Rate</h5>
                </div>

                {
                    formInput?.map((value, index) =>
                        <div className='flex-grow-1'>
                            <CostOfProject formInput={formInput} setFormInput={setFormInput} rateValue={value.rate} amountValue={value.amount} index={index} inputName={value.name} id={value.id} isCustom={value.isCustom} type={'number'} />
                        </div>

                    )
                }
                {/* <CostOfProject name={'Land'} id={'Land'} type={'number'} setFormInput={setFormInput} formInput={formInput}/>
                <CostOfProject name={'Building'} id={'Building'} type={'number'} setFormInput={setFormInput} formInput={formInput}/>
                <CostOfProject name={'Furniture and Fittings'} id={'Furniture and Fittings'} type={'number'} setFormInput={setFormInput} formInput={formInput}/>
                <CostOfProject name={'Plant Machinery'} id={'PlantMachinery'} type={'number'} setFormInput={setFormInput} formInput={formInput}/>
                <CostOfProject name={'Intangible Assets'} id={'IntangibleAssets'} type={'number'} setFormInput={setFormInput} formInput={formInput}/>
                <CostOfProject name={'Computer Peripherals'} id={'ComputerPeripherals'} type={'number'} setFormInput={setFormInput} formInput={formInput}/>
                <CostOfProject name={'Miscellaneous'} id={'Miscellaneous'} type={'number'} setFormInput={setFormInput} formInput={formInput}/> */}


                {/* <div className="input">
                    <input id="Land" name="Land" type="number"
                        value={formInput.Land} onChange={(e) => handleChange(e)} />
                    <label htmlFor="Land">Land</label>
                </div>

                <div className="input">
                    <input id="Building" name="Building" type="number" placeholder="0000"
                        value={formInput.Building} onChange={(e) => handleChange(e)} />
                    <label htmlFor="Building">Building</label>
                </div>

                <div className="input">
                    <input id="FurnitureandFittings" name="FurnitureandFittings" type="number" placeholder="0000"
                        value={formInput.FurnitureandFittings} onChange={(e) => handleChange(e)} />
                    <label htmlFor="FurnitureandFittings">Furniture and Fittings</label>
                </div>
                <div className="input">
                    <input id="PlantMachinery" name="PlantMachinery" type="number" placeholder="0000"
                        value={formInput.PlantMachinery} onChange={(e) => handleChange(e)} />
                    <label htmlFor="PlantMachinery">Plant & Machinery</label>
                </div>
                <div className="input">
                    <input id="IntangibleAssets" name="IntangibleAssets" type="number" placeholder="0000"
                        value={formInput.IntangibleAssets} onChange={(e) => handleChange(e)} />
                    <label htmlFor="IntangibleAssets">Intangible Assets(Applications, Softwares)</label>
                </div>
                <div className="input">
                    <input id="ComputersPeripherals" name="ComputersPeripherals" type="number" placeholder="0000"
                        value={formInput.ComputersPeripherals} onChange={(e) => handleChange(e)} />
                    <label htmlFor="ComputersPeripherals">Computers & Peripherals</label>
                </div>
                <div className="input">
                    <input id="Miscellaneous" name="Miscellaneous" type="number" placeholder="0000"
                        value={formInput.Miscellaneous} onChange={(e) => handleChange(e)} />
                    <label htmlFor="Miscellaneous">Miscellaneous & Other Assets</label>
                </div> */}
            </div>
            <button className="btn btn-success mt-5 px-5" onClick={() => { handleSave({ step2: formInput }) }}>
                Save
            </button>
        </div>


    )
}

export default Step2