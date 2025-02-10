const SixthRevenue = ({ onFormDataChange, years }) => {
    const [localData, setLocalData] = useState({
      formFields: [
        { particular: 'p1', years: Array.from({ length: years }).fill(0), rowType: "0", amount: 0 },
      ],
      totalRevenueForOthers: Array.from({ length: years }).fill(0),
      formFields2: [
        { particular: 'p1', years: Array.from({ length: years }).fill(0), amount: 0 },
      ],
    });
  
    const [formType, setFormType] = useState(false);
  
    const addFields = (e) => {
      e.preventDefault();
      let object = { particular: '', years: Array.from({ length: years }).fill(0), rowType: "0", amount: 0 };
      setLocalData({
        ...localData,
        formFields: [...localData.formFields, object]
      });
    };
  
    const removeFields = (e, childIndex) => {
      e.preventDefault();
      let data = [...localData.formFields];
      data.splice(childIndex, 1);
      setLocalData({
        ...localData,
        formFields: data
      });
    };
  
    const handleFormChange = (event, childIndex, year) => {
      let data = [...localData.formFields];
      if (event.target.name === 'particular') {
        data[childIndex]['particular'] = event.target.value;
      } else if (event.target.name === 'rowType') {
        data[childIndex]['rowType'] = event.target.value;
      } else if (event.target.name === 'amount') {
        data[childIndex]['amount'] = Number(event.target.value);
      } else {
        data[childIndex]['years'][year] = Number(event.target.value);
      }
      setLocalData({ ...localData, formFields: data });
    };
  
    const handleTotalRevenueForOthersChange = (value, i) => {
      let temp = [...localData.totalRevenueForOthers];
      temp[i] = Number(value);
      setLocalData({ ...localData, totalRevenueForOthers: temp });
    };
  
    const toggleType = (value) => {
      setFormType(value);
    };
  
    const addFields2 = (e) => {
      e.preventDefault();
      let object = { particular: '', years: Array.from({ length: years }).fill(0), amount: 0 };
      setLocalData({
        ...localData,
        formFields2: [...localData.formFields2, object]
      });
    };
  
    const removeFields2 = (e, childIndex) => {
      e.preventDefault();
      let data = [...localData.formFields2];
      data.splice(childIndex, 1);
      setLocalData({
        ...localData,
        formFields2: data
      });
    };
  
    const handleFormChange2 = (event, childIndex, year) => {
      let data = [...localData.formFields2];
      if (event.target.name === 'particular') {
        data[childIndex]['particular'] = event.target.value;
      } else if (event.target.name === 'amount') {
        data[childIndex]['amount'] = Number(event.target.value);
      } else {
        data[childIndex]['years'][year] = Number(event.target.value);
      }
      setLocalData({ ...localData, formFields2: data });
    };
  
    const [totalMonthlyRevenue, setTotalMonthlyRevenue] = useState(Array.from({ length: years }).fill(0));
    const [noOfMonths, setNoOfMonths] = useState(Array.from({ length: years }).fill(12));
    const [totalRevenue, setTotalRevenue] = useState(Array.from({ length: years }).fill(0));
  
    useEffect(() => {
      onFormDataChange({ Revenue: localData });
    }, [localData, onFormDataChange]);
  
    const calculateTotal = (field) => {
      return field.reduce((sum, item) => sum + item.amount, 0);
    };
  
    const submit = (e) => {
      e.preventDefault();
      // Handle form submission here
      console.log("Form submitted", localData);
    };
  
    return (
      <>
        <div>
          <div className="toggleBtn">
            {
              formType ? 
              <button className="btn btn-sm btn-primary px-4 me-auto" type="button" onClick={addFields}>Add Field +</button>
              :
              <button className="btn btn-sm btn-success px-4 me-auto" type="button" onClick={addFields2}>Add Field +</button>
            }
            Monthly
            <input type="checkbox" id="toggle-btn" onChange={(e) => toggleType(e.target.checked)} checked={formType} />
            <label htmlFor="toggle-btn"></label>
            Others
          </div>
  
          {formType ? (
            <form onSubmit={submit}>
              <div className="position-relative w-100">
                <div className="form-scroll" style={{ paddingBottom: "12%" }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th className="header-label">Index</th>
                        <th className="header-label">Particulars</th>
                        {Array.from({ length: years }).map((_, b) => (
                          <th key={b} className="header-label">Year {b + 1}</th>
                        ))}
                        <th className="header-label">Amount</th>
                        <th className="header-label">Type</th>
                        <th className="header-label"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {localData.formFields.map((entry, i) => (
                        <tr key={i} className={`rowHover ${entry.rowType === "0" ? 'normalRow' : entry.rowType === "1" ? 'headingRow' : entry.rowType === "2" ? 'boldRow' : entry.rowType === "3" ? 'boldUnderlineRow' : ''}`}>
                          <td>{i + 1}</td>
                          <td>
                            <input
                              name="particular"
                              placeholder="Particular"
                              onChange={event => handleFormChange(event, i)}
                              value={entry.particular}
                              className="form-control text-center noBorder"
                              type="text"
                            />
                          </td>
                          {entry.years.map((yr, y) => (
                            <td key={y}>
                              <input
                                name="value"
                                placeholder="value"
                                onChange={event => handleFormChange(event, i, y)}
                                value={yr}
                                className="form-control text-end noBorder"
                                type="number"
                              />
                            </td>
                          ))}
                          <td>
                            <input
                              name="amount"
                              placeholder="Amount"
                              onChange={event => handleFormChange(event, i)}
                              value={entry.amount}
                              className="form-control text-end noBorder"
                              type="number"
                            />
                          </td>
                          <td>
                            <select className="form-control" id="rowType" name="rowType" value={entry.rowType} onChange={e => handleFormChange(e, i)} style={{ fontSize: '0.8em' }}>
                              <option value="0">Normal</option>
                              <option value="1">Heading</option>
                              <option value="2">Bold</option>
                              <option value="3">B \ U</option>
                            </select>
                          </td>
                          <td>
                            <button className="rmvBtn" type="button" onClick={(e) => removeFields(e, i)}>Remove</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
  
                <div className="position-fixed w-100">
                  <div className="total-div pt-3">
                    <div className="d-flex">
                      <label className="form-label w-25 fs-10">Total Revenue</label>
                      <table className="table">
                        <tbody>
                          <tr>
                            {localData.totalRevenueForOthers.map((v, i) => (
                              <td key={i}>
                                <input
                                  name="value"
                                  placeholder="value"
                                  onChange={(e) => handleTotalRevenueForOthersChange(e.target.value, i)}
                                  value={v}
                                  className="form-control text-end noBorder"
                                  type="number"
                                />
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="d-flex">
                      <label className="form-label w-25 fs-10">Total Amount</label>
                      <div className="total-amount">
                        <span>Total: {calculateTotal(localData.formFields)}</span>
                      </div>
                    </div>
                  </div>
                </div>
  
              </div>
            </form>
          ) : (
            <form onSubmit={submit}>
              {/* Similar structure for formFields2 */}
            </form>
          )}
        </div>
      </>
    );
  };
  