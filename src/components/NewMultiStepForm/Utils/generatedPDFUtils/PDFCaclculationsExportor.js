import { useMemo } from 'react';

export const getPdfType = () => {
  return localStorage.getItem("pdfType") || "";
};

export const getFormData = () => {

  try {
    const data = localStorage.getItem("formData");
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error("Error parsing formData from localStorage:", error);
    return {};
  }
};

const formData = getFormData();

export const useNumberFormatter = (formatType = "1") => {
  return useMemo(() => {
    const options = {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    };

    let formatter;

    if (formatType === "2") {
      formatter = new Intl.NumberFormat("en-US", options);
    } else {
      formatter = new Intl.NumberFormat("en-IN", options);
    }

    return (value) => {
      if (value === undefined || value === null || isNaN(value)) return "0.00";
      return formatter.format(value);
    };
  }, [formatType]);
};


export const getTotalReceipts = (formData, formType) => {
  if (!formData || !formData.Revenue) return [];

  if (formType === "Others") {
    return formData.Revenue.totalRevenueForOthers || [];
  } else if (formType === "Monthly") {
    return formData.Revenue.totalRevenue || [];
  }

  return [];
};

const totalReceipt = getTotalReceipts();
export const hideFirstYear = totalReceipt?.[0] <= 0;
export const toRoman = n => ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"][n] || (n + 1);

export const getExpenses = (formData) => {
  if (!formData) {
    return { normalExpense: [], directExpense: [] };
  }

  const { Expenses = {} } = formData;
  const { normalExpense = [], directExpense = [] } = Expenses;

  return { normalExpense, directExpense };
};


export const useWageCalculations = (formData) => {
  const totalAnnualWages = useMemo(() => {
    // Your calculation logic here
    const { normalExpense = [] } = getExpenses(formData);
    return normalExpense.reduce(
      (sum, expense) => sum + (Number(expense?.value) || 0),
      0
    );
  }, [formData]);

  const fringeCalculation = useMemo(
    () => totalAnnualWages * 0.05,
    [totalAnnualWages]
  );

  const fringAndAnnualCalculation = useMemo(
    () => totalAnnualWages + fringeCalculation,
    [totalAnnualWages, fringeCalculation]
  );

  return {
    totalAnnualWages,
    fringeCalculation,
    fringAndAnnualCalculation
  };
};



const debtEquityOption =
  formData?.ProjectReportSetting?.DebtEquityOption ||
  formData?.ProjectReportSetting?.debtEquityOption;

const interestRate = formData?.ProjectReportSetting?.interestOnTL;

export const renderIOTLLabel = () => {
  if (debtEquityOption === "Equity") {
    return `Dividend Payout @${interestRate}%`; // Format for equity case
  } else {
    return "Interest On Term Loan"; // Default case
  }
};

export const renderIOWCLabel = () => {
  if (debtEquityOption === "Equity") {
    return "Return On Operational Equity";
  } else {
    return "Interest On Working Capital";
  }
};

export const renderTLFBLabel = () => {
  if (debtEquityOption === "Equity") {
    return `Equity Capital Infusion`; // Format for equity case
  } else {
    return "Term Loan From Bank"; // Default case
  }
};

export const renderWCLFBLabel = () => {
  if (debtEquityOption === "Equity") {
    return "Equity Of Running Operations";
  } else {
    return "Loan From Bank";
  }
};

export const renderBankTLLabel = () => {
  if (debtEquityOption === "Equity") {
    return `Equity Capital Infusion`; // Format for equity case
  } else {
    return "Bank Term Loan"; // Default case
  }
};

export const renderBankLoanTermLoanLabel = () => {
  if (debtEquityOption === "Equity") {
    return `Equity Capital Infusion`; // Format for equity case
  } else {
    return "Bank Loan - Term Loan"; // Default case
  }
};

export const renderWCLLabel = () => {
  if (debtEquityOption === "Equity") {
    return "Equity Of Running Operations";
  } else {
    return "Working Capital Loan";
  }
};

export const renderTotalBankLoanLabel = () => {
  if (debtEquityOption === "Equity") {
    return "Total Equity Capital Infusion";
  } else {
    return "Total Bank Loan";
  }
};

export const renderRepaymentSheetheading = () => {
  if (debtEquityOption === "Equity") {
    return "Dividend Payout On Equity";
  } else {
    return "Repayment of Term Loan";
  }
};

export const renderWithdrawalLabel = () => {
  if (debtEquityOption === "Equity") {
    return "Return On Equity";
  } else {
    return "Withdrawals";
  }
};


// ✅ Compute Total Cost of Project including Working Capital
const parseAmount = (val) => {
  if (!val) return 0;
  const cleaned = typeof val === "string" ? val.replace(/,/g, "") : val;
  return parseFloat(cleaned) || 0;
};

export const totalCost =
  (formData?.CostOfProject
    ? Object.values(formData.CostOfProject).reduce(
      (sum, field) => sum + parseAmount(field?.amount),
      0
    )
    : 0) + parseAmount(formData?.MeansOfFinance?.totalWorkingCapital);
