import React, { useEffect, useState } from 'react'
import DemoPDF from './DemoPDF'
import { PDFViewer } from '@react-pdf/renderer'
import MenuBar from './MenuBar'
import { useLocation } from 'react-router-dom'
import ChartComponent from './pdfComponents/PDFCharts'

const ReportView = () => {
    const location = useLocation()
    // console.log("report data ", location.state);
    const [report, setReport] = useState();

    useEffect(() => {
        setReport(location.state)
        console.log(report);
    }, [])

    const tableData = [
        { header1: 'Header 1', header2: 'Header 2', header3: 'Header 3' },
        { cell1: 'Cell 1', cell2: 'Cell 2', cell3: 'Cell 3' },
        { cell1: 'Cell 4', cell2: 'Cell 5', cell3: 'Cell 6' },
    ];


    return (
        <div className="app-container">
            <MenuBar />
            <div className="app-content">
                <div className="app-content-header">
                    <h1 className="app-content-headerText">Report View</h1>
                    <button className="mode-switch" title="Switch Theme">
                        <svg className="moon" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" width="24" height="24" viewBox="0 0 24 24">
                            <defs></defs>
                            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"></path>
                        </svg>
                    </button>
                </div>
                <div className="container mt-3">
                    <div className="row d-flex justify-content-center">
                        <div className="col-md-8">
                            <PDFViewer width="100%" height="650vh">
                                <DemoPDF report={location.state} />
                            </PDFViewer>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default ReportView