import React, { useEffect } from "react";
import useStore from "./useStore";

const CheckProfit = ({receivedGeneratedPDFData}) => {
  console.log("received Generated PDf DAta" , receivedGeneratedPDFData)
  
  return (
    <div>
      <h2>Check Profit</h2>
      <p>Net Profit After Tax: </p>
    </div>
  );
};

export default CheckProfit;
