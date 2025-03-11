import React from "react";
import { Document, Page } from "@react-pdf/renderer";
import BasicDetails from "./PDFComponents/BasicDetails";
import ProjectSynopsis from "./PDFComponents/ProjectSynopsis";
import MeansOfFinance from "./PDFComponents/MeansOfFinance";
import CostOfProject from "./PDFComponents/CostOfProject";
import ProjectedExpenses from "./PDFComponents/ProjectedExpenses";
import ProjectedRevenue from "./PDFComponents/ProjectedRevenue";
import ProjectedProfitability from "./PDFComponents/ProjectedProfitability";
import ProjectedSalaries from "./PDFComponents/ProjectedSalaries";
import ProjectedDepreciation from "./PDFComponents/ProjectedDepreciation";
import Repayment from "./PDFComponents/Repayment";
import IncomeTaxCalculation from "./PDFComponents/IncomeTaxCalculation";
import BreakEvenPoint from "./PDFComponents/BreakEvenPoint";
import DebtServiceCoverageRatio from "./PDFComponents/DebtServiceCoverageRatio";
import ProjectedCashflow from "./PDFComponents/ProjectedCashflow";
import ProjectedBalanceSheet from "./PDFComponents/ProjectedBalanceSheet";
import RatioAnalysis from "./PDFComponents/RatioAnalysis";
import CurrentRatio from "./PDFComponents/CurrentRatio";
import Assumptions from "./PDFComponents/Assumptions";

const GeneratedPDFDownload = ({ pdfData }) => {
  const formData = pdfData || {};

  const { Expenses = {} } = formData;
  const { normalExpense = [], directExpense = [] } = Expenses;

  const totalAnnualWages = normalExpense.reduce(
    (sum, expense) =>
      sum + Number(expense.amount * expense.quantity * 12 || 0),
    0
  );

  const fringeCalculation = totalAnnualWages * 0.05;
  const fringAndAnnualCalculation = totalAnnualWages + fringeCalculation;

  const firstYearGrossFixedAssets = Object.values(
    formData?.CostOfProject || {}
  ).reduce((sum, asset) => {
    let netAsset = asset.amount || 0;
    return sum + netAsset;
  }, 0);

  const financialYear =
    parseInt(formData?.ProjectReportSetting?.FinancialYear) || 2025;
  const projectionYears =
    parseInt(formData?.ProjectReportSetting?.ProjectionYears) || 20;

  const generateFinancialYearLabels = (startingFY, totalYears) => {
    const yearLabels = [];
    for (let i = 0; i < totalYears; i++) {
      const fromYear = startingFY + i;
      const toYear = (fromYear + 1) % 100;
      yearLabels.push(`${fromYear}-${toYear < 10 ? "0" + toYear : toYear}`);
    }
    return yearLabels;
  };

  const financialYearLabels = generateFinancialYearLabels(
    financialYear,
    projectionYears
  );

  return (
    <Document>
      <Page size="A4">
        <BasicDetails formData={formData} />
        <ProjectSynopsis
          formData={formData}
          financialYearLabels={financialYearLabels}
        />
        <MeansOfFinance formData={formData} />
        <CostOfProject formData={formData} />
        <ProjectedSalaries
          normalExpense={normalExpense}
          totalAnnualWages={totalAnnualWages}
          fringAndAnnualCalculation={fringAndAnnualCalculation}
        />
        <ProjectedRevenue formData={formData} />
        <ProjectedProfitability formData={formData} />
        <ProjectedExpenses formData={formData} />
        <ProjectedDepreciation formData={formData} />
        <Repayment formData={formData} />
        <IncomeTaxCalculation formData={formData} />
        <BreakEvenPoint formData={formData} />
        <DebtServiceCoverageRatio formData={formData} />
        <ProjectedCashflow formData={formData} />
        <ProjectedBalanceSheet formData={formData} />
        <RatioAnalysis formData={formData} />
        <CurrentRatio formData={formData} />
        <Assumptions formData={formData} />
      </Page>
    </Document>
  );
};

export default GeneratedPDFDownload;
