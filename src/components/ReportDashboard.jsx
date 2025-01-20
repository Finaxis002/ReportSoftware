import React, { useEffect, useState } from 'react'
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import "../css/reportDashborad.css"
import DemoPDF from './DemoPDF';
import MenuBar from './MenuBar';
import pdfIcon from "../images/download-pdf.png"
import reportIcon from "../images/report.png"
import pdfCover from "../images/SA-Cover.png"
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { generateProfitablityTable } from '../services';


const ReportDashboard = () => {
    const params = useParams()
    console.log("report id ", params.id);
    const location = useLocation()
    console.log("report data ", location.state);
    const [report, setReport] = useState(location.state);
    const nav = useNavigate();

    useEffect(() => {
        setReport(location.state)
        console.log(report);
    }, [])

    // const demoObj = { RepaymentMonths: 60, RateOfInterest: 6, MoratoriumPeriod: 2, Principal: 200000 }

    const [repaymentTable, setRepaymentTable] = useState([])

    const profitablityData = {
        formInputT: {
            normalExpense: [
                { key: "ManagerTotal", value: 50000 },
                { key: "SkilledLabourTotal", value: 30000 },
                { key: "LabourTotal", value: 20000 },
                { key: "SecurityGuardTotal", value: 10000 },
                { key: "SupervisorTotal", value: 5000 },
                { key: "ChefTotal", value: 12000 },
                { key: "AdminStaffTotal", value: 6000 },
            ],
            DExpense: [
                { key: "DRawMaterialExpenses", value: 20000, isDirect: true },
                { key: "DElectricityExpenses", value: 5000, isDirect: false },
                { key: "DMarketingExpenses", value: 2000, isDirect: true },
                { key: "DTransportationExpenses", value: 0, isDirect: true },
                { key: "DInsuranceExpenses", value: 1010, isDirect: false },
                { key: "DTelephoneAndInternetExpenses", value: 0, isDirect: false },
                { key: "DAdministrativeExpenses", value: 80000, isDirect: true },
                { key: "DRepairsAndMaintanenceExpense", value: 50000, isDirect: true },
                { key: "DOtherMiscellaneousExpenses", value: 200000, isDirect: true },
                { key: "DRentExpenses", value: 300000, isDirect: true },
                { key: "DStationeryExpenses", value: 20000, isDirect: true }
            ]
        }
        ,
        revenue: {
            value: 8000000
        },
        depreciation: {
            value: 170000
        },
        interestOnTL: {
            value: 220000
        },
        interestOnWC: {
            value: 55000
        },
        startingMonth: {
            value: 15
        },
        rateOfInterest: {
            value: 10
        },
        incomeTax: {
            value: 10
        },
        closingStock: {
            value: 2000
        },
        rateOfExpense: {
            value: 10
        }

    }

    //revenue 10%

    const generateTable = async () => {
        let years = 8;
        let rate = profitablityData.rateOfExpense.value;

        const tableData = await generateProfitablityTable(profitablityData)
        console.log(tableData);
        return
        //types of expenses.................................................................
        let expenses = profitablityData.formInputT.normalExpense;
        let directExpenses = profitablityData.formInputT.DExpense.filter((data) => {
            return data.isDirect === true
        });
        let inDirectExpenses = profitablityData.formInputT.DExpense.filter((data) => {
            return data.isDirect === false
        });


        //yearwise calculation of expenses..................................................
        let expensesYearwiseData = [];
        let directExpensesYearwiseData = [];
        let inDirectExpensesYearwiseData = [];

        expenses.map((data) => {
            let key = data.key;
            let value = data.value;
            let values = [value];

            for (let i = 2; i <= years; i++) {
                value = value + ((value * rate) / 100);
                values.push(value)
            }

            expensesYearwiseData.push({ key, values })
        })

        directExpenses.map((data) => {
            let key = data.key;
            let value = data.value;
            let values = [value];

            for (let i = 2; i <= years; i++) {
                value = value + ((value * rate) / 100);
                values.push(value)
            }

            directExpensesYearwiseData.push({ key, values })
        })

        inDirectExpenses.map((data) => {
            let key = data.key;
            let value = data.value;
            let values = [value];

            for (let i = 2; i <= years; i++) {
                value = value + ((value * rate) / 100);
                values.push(value)
            }

            inDirectExpensesYearwiseData.push({ key, values })
        })

        console.log("expensesYearwiseData", expensesYearwiseData);
        console.log("directExpensesYearwiseData", directExpensesYearwiseData);
        console.log("inDirectExpensesYearwiseData", inDirectExpensesYearwiseData);

        //expenses total calculation......................................................
        let expensesTotal = [];
        let directExpensesTotal = [];
        let inDirentExpensesTotal = [];

        expensesYearwiseData.forEach((data, i) => {
            if (i === 0) {
                expensesTotal.push(...data.values)
            } else {
                expensesTotal = expensesTotal.map((ex, a) => {
                    return ex += data.values[a]
                })
            }
        })
        directExpensesYearwiseData.forEach((data, i) => {
            if (i === 0) {
                directExpensesTotal.push(...data.values)
            } else {
                directExpensesTotal = directExpensesTotal.map((ex, a) => {
                    return ex += data.values[a]
                })
            }
        })

        inDirectExpensesYearwiseData.forEach((data, i) => {
            if (i === 0) {
                inDirentExpensesTotal.push(...data.values)
            } else {
                inDirentExpensesTotal = inDirentExpensesTotal.map((ex, a) => {
                    return ex += data.values[a]
                })
            }
        })

        console.log("expensesTotal", expensesTotal);
        console.log("directExpensesTotal", directExpensesTotal);
        console.log("inDirentExpensesTotal", inDirentExpensesTotal);

        //revenue yearwise.............................................................
        let revenue = profitablityData.revenue.value
        let revenueYearwise = [revenue];
        for (let i = 2; i <= years; i++) {
            revenue = revenue + ((revenue * rate) / 100);
            revenueYearwise.push(revenue)
        }
        console.log("revenueYearwise", revenueYearwise);

        //closing stock yearwise........................................................
        let closingStock = profitablityData.closingStock.value
        let closingStockYearwise = [closingStock]
        for (let i = 2; i <= years; i++) {
            closingStock = closingStock + ((closingStock * rate) / 100);
            closingStockYearwise.push(revenue)
        }
        console.log("closingStockYearwise", closingStockYearwise);

        //revenue + closingstock........................................................
        let revenue_closingstock_total = [];
        for (let i = 0; i < years; i++) {
            revenue_closingstock_total.push(revenueYearwise[i] + closingStockYearwise[i]);
        }
        console.log("revenue_closingstock_total", revenue_closingstock_total);

        //opening stock yearwise........................................................
        let openingStock = 0;
        let openingStockYearwise = [openingStock]
        for (let i = 2; i <= years; i++) {
            openingStock = closingStockYearwise[i - 2];
            openingStockYearwise.push(openingStock)
        }
        console.log("openingStockYearwise", openingStockYearwise);

        //adding opening stock to expenses total
        for (let i = 0; i < years; i++) {
            expensesTotal[i] += openingStockYearwise[i];
        }
        console.log("expensesTotal + opening stock", expensesTotal);

        //grossProfit...................................................................
        let grossProfitYearwise = [];
        for (let i = 0; i < years; i++) {
            grossProfitYearwise.push(revenue_closingstock_total[i] - expensesTotal[i]);
        }
        console.log("grossProfitYearwise", grossProfitYearwise);

        //depriciation yearwise..........................................................
        let depreciation = profitablityData.depreciation.value;
        let depriciationYearwise = [depreciation];
        for (let i = 2; i <= years; i++) {
            depreciation = depreciation + ((depreciation * rate) / 100);
            depriciationYearwise.push(depreciation)
        }
        console.log("depriciationYearwise", depriciationYearwise);

        //Interest on TL yearwise.........................................................
        let interestOnTL = profitablityData.interestOnTL.value;
        let interestOnTLYearwise = [interestOnTL];
        for (let i = 2; i <= years; i++) {
            interestOnTL = interestOnTL + ((interestOnTL * rate) / 100);
            interestOnTLYearwise.push(interestOnTL)
        }
        console.log("interestOnTLYearwise", interestOnTLYearwise);

        //Interest on WC yearwise.........................................................
        let interestOnWC = profitablityData.interestOnWC.value;
        let interestOnWCYearwise = [interestOnWC];
        for (let i = 2; i <= years; i++) {
            interestOnWC = interestOnWC + ((interestOnWC * rate) / 100);
            interestOnWCYearwise.push(interestOnWC)
        }
        console.log("interestOnWCYearwise", interestOnWCYearwise);

        //directExpenses + inDirectExpenses + Depreciation + Interest on TL + Interest on WC
        let miscTotalYearwise = [];
        for (let i = 0; i < years; i++) {
            miscTotalYearwise.push(
                directExpensesTotal[i] + inDirentExpensesTotal[i]
                + depriciationYearwise[i] + interestOnTLYearwise[i] + interestOnWCYearwise[i]
            );
        }
        console.log("miscTotalYearwise", miscTotalYearwise);

        //profit before tax yearwise......................................................
        const profitBeforeTaxYearwise = [];
        for (let i = 0; i < years; i++) {
            profitBeforeTaxYearwise.push(grossProfitYearwise[i] - miscTotalYearwise[i]);
        }
        console.log("profitBeforeTaxYearwise", profitBeforeTaxYearwise);

        //income tax yearwise.............................................................
        let incomeTaxYearwise = [];
        let incomeTaxRate = profitablityData.incomeTax.value;
        for (let i = 0; i < years; i++) {
            let tax = ((profitBeforeTaxYearwise[i] * incomeTaxRate) / 100);
            incomeTaxYearwise.push(tax);
        }
        console.log("incomeTaxYearwise", incomeTaxYearwise);

        //profit after tax yearwise........................................................
        let profitAfterTaxYearwise = [];
        for (let i = 0; i < years; i++) {
            profitAfterTaxYearwise.push(profitBeforeTaxYearwise[i] - incomeTaxYearwise[i]);
        }
        console.log("profitAfterTaxYearwise", profitAfterTaxYearwise);

        return {
            revenueYearwise,
            closingStockYearwise,
            revenue_closingstock_total,
            openingStockYearwise, expensesYearwiseData, expensesTotal,
            grossProfitYearwise,
            directExpensesYearwiseData, directExpensesTotal,
            inDirectExpensesYearwiseData, inDirentExpensesTotal,
            depriciationYearwise, interestOnTLYearwise, interestOnWCYearwise,
            miscTotalYearwise,
            profitBeforeTaxYearwise,
            incomeTaxYearwise,
            profitAfterTaxYearwise
        }
    }

    return (
        <div className="app-container">
            <MenuBar />
            <div className="app-content">
                <div className="app-content-header">
                    <h1 className="app-content-headerText">Report Details</h1>
                    <button className="mode-switch" title="Switch Theme">
                        <svg className="moon" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" width="24" height="24" viewBox="0 0 24 24">
                            <defs></defs>
                            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"></path>
                        </svg>
                    </button>
                </div>

                <div className="container my-4">
                    <div className="row">
                        <div className="col-md-4">
                            <div className='btn btn-outline-secondary p-1' onClick={() => nav("/report/view", { state: report })}>
                                <img src={pdfCover} width="100%" alt='Report PDF cover' />
                                <br />
                                Demo View
                            </div>
                        </div>
                        <div className="col-md-8">
                            <div className="row">
                                <div className="col-md-6">
                                    <button className="btn btn-primary view-report-btn" onClick={() => nav("/report/view", { state: report })}>
                                        <img src={reportIcon} alt='View' />
                                        <br />
                                        View Report
                                    </button>
                                </div>
                                <div className="col-md-6">
                                    <PDFDownloadLink document={<DemoPDF report={report} />} fileName="Report">
                                        <button className="btn btn-danger download-report-btn">
                                            <img src={pdfIcon} alt='Download' />
                                            <br />
                                            Download Report
                                        </button>
                                    </PDFDownloadLink>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-12">
                                    <button onClick={generateTable}>Gererate table</button>

                                    <table class="table tableData">
                                        {/* <thead>
                                            <tr>
                                                <th scope="col">S.No.</th>
                                                <th scope="col">Month</th>
                                                <th scope="col">Principal</th>
                                                <th scope="col">Repayment</th>
                                                <th scope="col">CB</th>
                                                <th scope="col">Interest</th>
                                                <th scope="col">Total</th>
                                            </tr>
                                        </thead> */}
                                        <tbody>
                                            {
                                                repaymentTable.map((data, i) => {
                                                    return (
                                                        <tr key={i}>
                                                            <th scope="row">{data.sno}</th>
                                                            <td>{data.month}</td>
                                                            <td>{data.principal}</td>
                                                            <td>{data.repayment}</td>
                                                            <td>{data.closingBalance}</td>
                                                            <td>{data.interestAmount}</td>
                                                            <td>{data.total}</td>
                                                        </tr>
                                                    )
                                                })
                                            }
                                        </tbody>
                                    </table>

                                </div>
                            </div>

                            <div className="row mt-4">
                                <div className="col">
                                    <h3>Review & Edit</h3>
                                    <div className="d-flex flex-wrap justify-content-between gap-4">
                                        <button className="btn btn-outline-secondary mr-3 mt-3 fl-db-btn flex-grow-1" data-bs-toggle="modal" data-bs-target="#staticBackdrop">
                                            <img src="https://www.finline.in/assets/v3/img/company-details.png" height="32" alt="Company Details-Icon" /> Company Details
                                        </button>
                                        <button className="btn btn-outline-secondary mr-3 mt-3 fl-db-btn flex-grow-1">
                                            <img src="https://www.finline.in/assets/v3/img/business-profile.png" height="32" alt="Business Profile-Icon" /> Business Profile
                                        </button>
                                    </div>
                                    <div className="d-flex justify-content-between gap-4">
                                        <button className="btn btn-outline-secondary mr-3 mt-3 fl-db-btn flex-grow-1">
                                            <img src="https://www.finline.in/assets/v3/img/assets.png" height="32" alt="Assets-Icon" /> Assets </button>
                                        <button className="btn btn-outline-secondary mr-3 mt-3 fl-db-btn flex-grow-1">
                                            <img src="https://www.finline.in/assets/v3/img/expense.png" height="32" alt="Monthly Expense-Icon" />Monthly expense </button>
                                    </div>
                                    <div className="d-flex flex-wrap justify-content-between gap-4">
                                        <button className="btn btn-outline-secondary mr-3 mt-3 fl-db-btn flex-grow-1">
                                            <img src="https://www.finline.in/assets/v3/img/sales.png" height="32" alt="Sales-Icon" /> Sales &amp; Revenue </button>
                                        <button className="btn btn-outline-secondary mr-3 mt-3 fl-db-btn flex-grow-1">
                                            <img src="https://www.finline.in/assets/v3/img/term.png" height="32" alt="Term Loan-Icon" /> Term Loan </button>
                                    </div>
                                    <div className="d-flex flex-wrap justify-content-between gap-4">
                                        <button className="btn btn-outline-secondary mr-3 mt-3 fl-db-btn flex-grow-1">
                                            <img src="https://www.finline.in/assets/v3/img/term.png" height="32" alt="Term Loan-Icon" /> Working Capital </button>
                                        <button className="btn btn-outline-secondary mr-3 mt-3 fl-db-btn flex-grow-1">
                                            <img src="https://www.finline.in/assets/v3/img/settings.png" height="32" alt="Settings-Icon" /> Settings </button>
                                    </div>
                                    <div className="d-flex flex-wrap justify-content-between gap-4">
                                        <button className="btn btn-outline-secondary mr-3 mt-3 fl-db-btn flex-grow-1">
                                            <img src="https://www.finline.in/assets/v3/img/add-images.png" height="32" alt="Add Images-Icon" /> Add Images </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal fade" id="reportEditModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">Modal title</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            ...
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" className="btn btn-primary">Save changes</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ReportDashboard