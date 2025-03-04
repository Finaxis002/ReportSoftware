import React, { useEffect } from "react";
import useStore from "./useStore";

const CheckProfit = () => {
  const computedData = useStore((state) => state.computedDataToProfit);

  useEffect(() => {
    console.log("🟠 CheckProfit re-rendered, computedData:", computedData);
  }, [computedData]); // ✅ Ensure it logs updates

  if (!computedData) {
    return <p>Loading data...</p>; // ✅ Prevent rendering before Zustand updates
  }

  return (
    <div>
      <h2>Check Profit</h2>
      <p>Net Profit After Tax: {computedData?.netProfitAfterTax?.join(", ") || "N/A"}</p>
    </div>
  );
};

export default CheckProfit;
