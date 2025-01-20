import React from "react";
import { useLocation } from "react-router-dom";
import { Text } from '@react-pdf/renderer';



const MoreDetailsTable =()=>{
     const location = useLocation();
      const formData = location.state;
    
      // Debug: Log data to check if AccountInformation is present
      // console.log("accountInfo in BasicDetailsView:");
    
      // Ensure formData is valid
      if (!formData || !formData.AccountInformation) {
        return <div>No account information available</div>; // Fallback UI
      }
    return(
       <div className="container-width">
         <div className="container  mt-4 bg-light px-4">
          <h2 className="py-4 text-center text-xl font-bold">More Details</h2>
          <Text className="py-4 text-center">Current Liabilities</Text>
          <div className="table-responsive">
            <table className="table table-striped table-bordered table-hover">
              <thead>
                <tr>
                  <th className="bg-headPurple">Index</th>
                  <th className="bg-headPurple">Particular</th>
                  <th className="bg-headPurple">Years</th>
                </tr>
              </thead>
              <tbody>
                {/* Check if currentLiabilities is defined and is an array */}
                {formData.MoreDetails.currentLiabilities &&
                  Array.isArray(formData.MoreDetails.currentLiabilities) &&
                  formData.MoreDetails.currentLiabilities.map((item, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>{" "}
                      {/* Display index number, starting from 1 */}
                      <td>{item.particular}</td>
                      <td>
                        {item.years && item.years.length > 0
                          ? item.years.join(", ")
                          : "No data"}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <Text className="py-4 text-center">Current Assets</Text>
          <div className="table-responsive">
            <table className="table table-striped table-bordered table-hover">
              <thead>
                <tr>
                  <th className="bg-headPurple">Index</th>
                  <th className="bg-headPurple">Particular</th>
                  <th className="bg-headPurple">Years</th>
                </tr>
              </thead>
              <tbody>
                {/* Check if currentAssets is defined and is an array */}
                {formData.MoreDetails.currentAssets &&
                  Array.isArray(formData.MoreDetails.currentAssets) &&
                  formData.MoreDetails.currentAssets.map((item, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>{" "}
                      {/* Display index number, starting from 1 */}
                      <td>{item.particular}</td>
                      <td>
                        {item.years && item.years.length > 0
                          ? item.years.join(", ")
                          : "No data"}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* <View style={styles.section}>
          <Text style={styles.sectionHeader}>More Details</Text>
          <Text style={styles.sectionContent}>
            {JSON.stringify(formData.MoreDetails, null, 2)}
          </Text>
        </View> */}
       </div>
    )
}


export default MoreDetailsTable;