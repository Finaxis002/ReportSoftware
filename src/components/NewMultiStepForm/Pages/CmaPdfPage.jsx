import { useState, useEffect } from "react";
import { PDFViewer } from "@react-pdf/renderer";
import ProjectedCashflow from "../PDFComponents/ProjectedCashflow";
import { calculateTotalDepreciationPerYear } from "../Utils/CMA/CmaReport/cmareportcalc";

const CmaPdfPage = () => {
  // 1. Get the string from localStorage
  const raw = localStorage.getItem("cmaFormData");

  // 2. Parse it to an object
  const formData = raw ? JSON.parse(raw) : null;

  // 3. Access computedData (safely!)
  const computedData = formData?.computedData;

  console.log("formData : " , formData)
  console.log("computedData:", computedData);
  const localData = formData;
  const moratoriumPeriodMonths =
    formData?.ProjectReportSetting?.MoratoriumPeriod;
  const projectionYears = formData?.ProjectReportSetting?.projectionYears;
  const startingMonth = formData?.ProjectReportSetting?.startingMonth;

  console.log(
    "formData?.computedData?.netProfitBeforeTax : ",
    formData?.computedData?.computedData?.netProfitBeforeTax
  );

  const totalDepreciationPerYear = calculateTotalDepreciationPerYear(
    formData,
    moratoriumPeriodMonths,
    projectionYears,
    startingMonth
  );

  return (
    <>
      <div>CmaPdfPage</div>
      <PDFViewer>
        <ProjectedCashflow
          formData={formData}
          localData={localData}
          totalDepreciationPerYear={totalDepreciationPerYear}
          netProfitBeforeTax={formData?.computedData?.netProfitBeforeTax || []}
        />
      </PDFViewer>
    </>
  );
};

export default CmaPdfPage;
