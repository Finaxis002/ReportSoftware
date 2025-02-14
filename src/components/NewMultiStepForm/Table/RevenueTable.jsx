import React from "react";
import { useLocation } from "react-router-dom";

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const RevenueTable = () => {
  const location = useLocation();
  const formData = location.state;

  const renderTableForFormFields = (fields, title) => {
    if (!fields || fields.length === 0) {
      return (
        <tr>
          <td colSpan="2">No Data Available</td>
        </tr>
      );
    }

    return fields.map((field, index) => (
      <tr key={`${title}-${index}`}>
        <td>{field.particular}</td>
        <td>
          {field.years.map((value, yearIndex) => (
            <span key={`${title}-year-${yearIndex}`} className="me-2">
              Year {yearIndex + 1}: {value}
            </span>
          ))}
          <br />
           {field.amount}
        </td>
      </tr>
    ));
  };

  const renderTotalRevenueForOthers = (totals) => {
    if (!totals || totals.length === 0) {
      return (
        <tr>
          <td colSpan="2">No Data Available</td>
        </tr>
      );
    }

    return (
      <tr>
        <td>Total Revenue (Others)</td>
        <td>
          {totals.map((value, yearIndex) => (
            <span key={`totalYear-${yearIndex}`} className="me-2">
              Year {yearIndex + 1}: {value}
            </span>
          ))}
        </td>
      </tr>
    );
  };

  const { formFields, formFields2, totalRevenueForOthers } = formData.Revenue || {};

  return (
    <div>
      <div className="container container-width mt-4 bg-light px-4">
        <h2 className="py-4 text-center text-xl font-bold">Projected Revenue</h2>

       
        {/* Table for formFields2 */}
        <div className="table-responsive mb-4">
          <h3 >Monthly</h3>
          <table className="table table-striped table-bordered table-hover">
            <thead>
              <tr>
                <th className="bg-headPurple">Name</th>
                <th className="bg-headPurple">Amount</th>
              </tr>
            </thead>
            <tbody>{renderTableForFormFields(formFields2, "formFields2")}</tbody>
          </table>
        </div>
         {/* Table for formFields */}
         <div className="table-responsive mb-4">
          <h3>Others</h3>
          <table className="table table-striped table-bordered table-hover">
            <thead>
              <tr>
                <th className="bg-headPurple">Name</th>
                <th className="bg-headPurple">Amount</th>
              </tr>
            </thead>
            <tbody>{renderTableForFormFields(formFields, "formFields")}</tbody>
          </table>
        </div>


      
      </div>

      {/* Debugging JSON */}
      {/* <pre>
        <code>{JSON.stringify(formData.Revenue, null, 2)}</code>
      </pre> */}
    </div>
  )
};

export default RevenueTable;
