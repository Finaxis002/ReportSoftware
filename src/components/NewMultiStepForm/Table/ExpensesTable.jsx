import React from "react";
import { useLocation } from "react-router-dom";

const ExpensesTable = () => {
  const location = useLocation();
  const formData = location.state || {}; // If location.state is undefined, set it as an empty object
  const { Expenses = {} } = formData; // Destructure Expenses safely with fallback to empty object
  const { normalExpense = [], directExpense = [] } = Expenses;

  // Debug log to check the structure of formData
  // console.log(formData); // Check what is being passed in location.state

  // Check if Expenses data is available
  if (!Expenses || (!normalExpense.length && !directExpense.length)) {
    return <div>No expenses data available.</div>;
  }

  return (
    <div className="container-width">
      <div className="container mt-4 bg-light px-4">
        <h2 className="py-4 text-center text-xl font-bold">Projected Expenses</h2>

        {/* Direct/Indirect Expenses Table */}
        <div className="table-responsive">
          <h5>Direct/Indirect Expenses</h5>
          <table className="table table-striped table-bordered table-hover">
            <thead>
              <tr>
                <th className="bg-headPurple">Name</th>
                <th className="bg-headPurple">Value</th>
                <th className="bg-headPurple">Type</th>
              </tr>
            </thead>
            <tbody>
              {directExpense.map((expense, index) => (
                <tr key={index}>
                  <td>{expense.name || "N/A"}</td>
                  <td>{expense.value || "0"}</td>
                  <td>{expense.type || "0"}</td>
                </tr>
              ))}
              {/* Total Row */}
              <tr className="bg-totalRed">
                <td className="bg-totalRed">
                  <strong>Total</strong>
                </td>
                <td className="bg-totalRed">
                  <strong>
                    {directExpense.reduce(
                      (total, expense) => total + (parseFloat(expense.value) || 0),
                      0
                    )}
                  </strong>
                </td>
                <td className="bg-totalRed"></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Indirect Expenses (Salary Expenses) Table */}
        <h5>Salary Expenses</h5>
        <div className="table-responsive">
          <table className="table table-striped table-bordered table-hover">
            <thead>
              <tr>
                <th className="bg-headPurple">Name</th>
                <th className="bg-headPurple">Monthly Salary</th>
                <th className="bg-headPurple">Quantity</th>
                <th className="bg-headPurple">Value</th>
              </tr>
            </thead>
            <tbody>
              {normalExpense.map((expense, index) => (
                <tr key={index}>
                  <td>{expense.name || "N/A"}</td>
                  <td>{expense.amount || "0"}</td>
                  <td>{expense.quantity || "0"}</td>
                  <td>{expense.value || "0"}</td>
                </tr>
              ))}
              {/* Total Row */}
              <tr className="bg-totalRed">
                <td className="bg-totalRed">
                  <strong>Total</strong>
                </td>
                <td className="bg-totalRed">
                  <strong>
                    {normalExpense.reduce(
                      (total, expense) => total + (parseFloat(expense.amount) || 0),
                      0
                    )}
                  </strong>
                </td>
                <td className="bg-totalRed">
                  <strong>
                    {normalExpense.reduce(
                      (total, expense) => total + (parseFloat(expense.quantity) || 0),
                      0
                    )}
                  </strong>
                </td>
                <td className="bg-totalRed">
                  <strong>
                    {normalExpense.reduce(
                      (total, expense) => total + (parseFloat(expense.value) || 0),
                      0
                    )}
                  </strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExpensesTable;







// import React from "react";
// import { useLocation } from "react-router-dom";

// const ExpensesTable = () => {
//   // Check if location.state exists and contains Expenses
//  const location = useLocation();
//    const formData = location.state;
//    const localData = location.state;
//    const { normalExpense = [], directExpense = [] } = formData.Expenses || {};

//   // Debug log to check the structure of formData
//   console.log(formData); // Check what is being passed in location.state

//   // Check if normalExpense and directExpense have data, else return a fallback
//   if (!formData.Expenses || !normalExpense.length || !directExpense.length) {
//     return <div>No expenses data available.</div>;
//   }

//   return (
//     <div className="container-width">
//       <div className="container mt-4 bg-light px-4">
//         <h2 className="py-4 text-center text-xl font-bold">Projected Expenses</h2>

//         {/* Direct/Indirect Expenses Table */}
//         <div className="table-responsive">
//           <h5>Direct/Indirect Expenses</h5>
//           <table className="table table-striped table-bordered table-hover">
//             <thead>
//               <tr>
//                 <th className="bg-headPurple">Name</th>
//                 <th className="bg-headPurple">Value</th>
//                 <th className="bg-headPurple">Type</th>
//               </tr>
//             </thead>
//             <tbody>
//               {directExpense.map((expense, index) => (
//                 <tr key={index}>
//                   <td>{expense.name || "N/A"}</td>
//                   <td>{expense.value || "0"}</td>
//                   <td>{expense.type || "0"}</td>
//                 </tr>
//               ))}
//               {/* Total Row */}
//               <tr className="bg-totalRed">
//                 <td className="bg-totalRed">
//                   <strong>Total</strong>
//                 </td>
//                 <td className="bg-totalRed">
//                   <strong>
//                     {directExpense.reduce(
//                       (total, expense) => total + (parseFloat(expense.value) || 0),
//                       0
//                     )}
//                   </strong>
//                 </td>
//                 <td className="bg-totalRed"></td>
//               </tr>
//             </tbody>
//           </table>
//         </div>

//         {/* Indirect Expenses (Salary Expenses) Table */}
//         <h5>Salary Expenses</h5>
//         <div className="table-responsive">
//           <table className="table table-striped table-bordered table-hover">
//             <thead>
//               <tr>
//                 <th className="bg-headPurple">Name</th>
//                 <th className="bg-headPurple">Monthly Salary</th>
//                 <th className="bg-headPurple">Quantity</th>
//                 <th className="bg-headPurple">Value</th>
//               </tr>
//             </thead>
//             <tbody>
//               {normalExpense.map((expense, index) => (
//                 <tr key={index}>
//                   <td>{expense.name || "N/A"}</td>
//                   <td>{expense.amount || "0"}</td>
//                   <td>{expense.quantity || "0"}</td>
//                   <td>{expense.value || "0"}</td>
//                 </tr>
//               ))}
//               {/* Total Row */}
//               <tr className="bg-totalRed">
//                 <td className="bg-totalRed">
//                   <strong>Total</strong>
//                 </td>
//                 <td className="bg-totalRed">
//                   <strong>
//                     {normalExpense.reduce(
//                       (total, expense) => total + (parseFloat(expense.amount) || 0),
//                       0
//                     )}
//                   </strong>
//                 </td>
//                 <td className="bg-totalRed">
//                   <strong>
//                     {normalExpense.reduce(
//                       (total, expense) => total + (parseFloat(expense.quantity) || 0),
//                       0
//                     )}
//                   </strong>
//                 </td>
//                 <td className="bg-totalRed">
//                   <strong>
//                     {normalExpense.reduce(
//                       (total, expense) => total + (parseFloat(expense.value) || 0),
//                       0
//                     )}
//                   </strong>
//                 </td>
//               </tr>
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ExpensesTable;
