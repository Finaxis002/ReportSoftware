import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom';
import { generateCashFlowTable, generateDepreciationTable, generateProfitablityTable, generateRepaymentTable, getTotalCostOfProject } from "../services";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Doughnut } from "react-chartjs-2";
import DepriciationTableView from './tempComponents/DepriciationTableView';
import RepaymentTableView from './tableViews/RepaymentTableView';
import BasicDetailsView from './tableViews/BasicDetailsView';
import CostOfProjectView from './tableViews/CostOfProjectView';
import ReportCover from '../images/SA-Cover.png'
import MeansOfFinanceView from './tableViews/MeansOfFinanceView';
import ReportSettingsView from './tableViews/ReportSettingsView';
import SalariesView from './tableViews/SalariesView';
import ProfitablityTableView from './tableViews/ProfitablityTableView';
import RevenueView from './tableViews/RevenueView';
import ExpensesView from './tableViews/ExpensesView';
import CashFlowView from './tableViews/CashFlowView';

const ReportReview = () => {
    const location = useLocation()
    console.log("report data ", location.state);
    const [data, setData] = useState({ ...location.state });

    ChartJS.register(
        CategoryScale,
        LinearScale,
        BarElement,
        Title,
        Tooltip,
        Legend
    );
    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Chart.js Bar Chart',
            },
        },
    };
    const [graphData, setGraphData] = useState();
    const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
    const tempGraphData = {
        labels,
        datasets: [
            {
                label: 'Dataset 1',
                data: [65, 59, 80, 81, 56, 55, 40],
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
            {
                label: 'Dataset 2',
                data: [25, 49, 85, 71, 52, 58, 70],
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
            },
        ],
    };


    useEffect(() => {
        setData({ ...location.state })
    }, [])

    useEffect(() => {

        // const graphImage = getGraphData("bar", tempGraphData.labels, tempGraphData.datasets)
        // console.log(graphImage);
        // setGraphData(graphImage)
        // getTableData()
        getTableData()
    }, [data])

    const [repaymentTable, setRepaymentTable] = useState();
    const [depreciationTable, setDepreciationTable] = useState();
    const [profitablityTable, setProfitablityTable] = useState();
    const [cashFlowTable, setCashFlowTable] = useState();

    const getTableData = async () => {
        const repaymentTableData = await generateRepaymentTable(data.reportSettings, data.meansOfFinance);
        console.log("repaymentTableData", repaymentTableData);
        setRepaymentTable(repaymentTableData);

        const depriciationTableData = await generateDepreciationTable(data.reportSettings, data.costOfProject)
        console.log("depriciationTableData", depriciationTableData);
        setDepreciationTable(depriciationTableData)

        const profitablityTableData = await generateProfitablityTable(data.reportSettings, data.expenses, data.revenue, data.moreDetails, depriciationTableData, repaymentTableData, data.meansOfFinance);
        console.log("profitablityTableData", profitablityTableData);
        setProfitablityTable(profitablityTableData)

        const cashFlowTableData = await generateCashFlowTable(data.reportSettings, profitablityTableData, data.meansOfFinance, data.moreDetails, depriciationTableData, repaymentTableData);
        console.log("cashFlowTableData", cashFlowTableData);
        setCashFlowTable(cashFlowTableData);

    }

    const getGraphData = async (type, labels, datasets) => {
        let graphURL = `https://quickchart.io/chart?chart={type:${type},data:{labels:${JSON.stringify(labels)},datasets:${JSON.stringify(datasets)}}}&backgroundColor=white&width=500&height=300&devicePixelRatio=1.0&format=png&version=2.9.3`
        graphURL = graphURL.replaceAll('"', "'")
        graphURL = graphURL.replaceAll(' ', '')
        console.log(graphURL);
        // console.log("https://quickchart.io/chart?chart={type:bar,data:{labels:['January',"February","March","April","May","June","July"],datasets:[{"label":"My First Dataset","data":[65,59,80,81,56,55,40],"fill":false,"borderColor":"rgb(75, 192, 192)","tension":0.1}]}}&backgroundColor=white&width=500&height=300&devicePixelRatio=1.0&format=png&version=2.9.3");
        // const graphImage = await fetch().then((res) => res.json())
        // console.log(graphImage);
    }

    return (
        <section className="watermark">
            <h1 className='text-center py-5 bg-headPurple'>Report Review</h1>
            <div className="text-center">
                <img src={ReportCover} alt="Cover" className='w-50 mx-auto' />
            </div>
            <div className='w-75 mx-auto watermark'>
                <hr />
                <h5>Index</h5>
                <hr />
                <BasicDetailsView data={data.personalDetails} />
                <hr />
                <ReportSettingsView data={data.reportSettings} />
                <hr />
                <CostOfProjectView data={data.costOfProject} totalCostOfProject={getTotalCostOfProject(data.costOfProject)} />
                <hr />
                <MeansOfFinanceView data={data.meansOfFinance} />
                <hr />
                {
                    depreciationTable &&
                    <DepriciationTableView data={depreciationTable} />
                }
                <hr />
                <RevenueView data={data.revenue} />
                <hr />
                {
                    profitablityTable &&
                    <ExpensesView data={profitablityTable} />
                }
                <hr />
                <SalariesView data={data.expenses["normalExpense"]} />
                <hr />
                {
                    repaymentTable &&
                    <RepaymentTableView data={repaymentTable} />
                }
                <hr />
                {
                    profitablityTable &&
                    <ProfitablityTableView data={profitablityTable} />
                }
                <hr />
                <h5>Projected Income-tax Calculations</h5>
                <hr />
                {
                    cashFlowTable &&
                    <CashFlowView data={cashFlowTable} />
                }
                <hr />
                <h5>Projected Balance Sheet</h5>
                <hr />
                <h5>Debt Service Coverage Ratio</h5>
                <hr />
                <h5>Breakeven Point</h5>
                <hr />
                <h5>Ratio Analysis</h5>
                <hr />
                <h5>Credit Monitoring Arrangement (CMA) Report</h5>
                <hr />
                <h5>Analysis of Balance Sheet</h5>
                <hr />
                <h5>Assessment of Working Capital Requirements</h5>
                <hr />
                <h5>Fund Flow Statement</h5>
                <hr />
                <h5>Financial Position of the Borrower</h5>
                <hr />
                <h5>Sensitivity Analysis</h5>
            </div>
            <div className='w-50 mx-auto'>
                <Bar options={options} data={tempGraphData} />;
                <hr />
                <Doughnut data={tempGraphData} />
            </div>
            <div className='w-75 mx-auto my-5'>
                <p>
                    {/* {JSON.stringify(data, undefined, 2)} */}
                </p>
            </div>
        </section>
    )
}

export default ReportReview