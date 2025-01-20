import { generateProfitablityTable, generateRepaymentTable } from "./services";

export const generateReport = async (data) => {
    // const response = await generateReportApi(tempInput)
    // console.log(response);
    const graphs = {
        // 'line': generateBase64Image(lineRef),
        // 'pie': generateBase64Image(pieRef),
        // 'bar': generateBase64Image(barRef),
    }

    const repaymentTable = await generateRepaymentTable(data.reportSettings, data.meansOfFinance);
    console.log(repaymentTable);
    const profitablityTable = await generateProfitablityTable(data.reportSettings, data.expenses);
    console.log(profitablityTable);
    return {}
    // const generatedData = {
    //     formDetails: response.fields,
    //     graphs: graphs,
    //     repaymentTable: [...repaymentTable.tableData],
    //     repaymentTableStartingMonth: repaymentTable.startingMonth,
    //     tableTotalData: [...repaymentTable.tableTotalData],
    //     profitabilityTableData: { ...profitablityTable },
    //     revenueTableData: { ...reportInput.revenue }
    // }

    // nav(`/report/${response.id}`, { state: { ...generatedData } })
};

const generateBase64Image = (chartRef) => {
    console.log(chartRef);
    if (chartRef && chartRef.current) {
        const chartCanvas = chartRef.current.canvas;
        const base64String = chartCanvas.toDataURL('image/png');
        // console.log(base64String);
        return base64String
    }
};