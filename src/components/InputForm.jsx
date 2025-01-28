import React, { useState } from 'react'
import FormWizard from "react-form-wizard-component";
import "react-form-wizard-component/dist/style.css";
import "../css/reportForm.css"
import MenuBar from "./MenuBar";
import { useNavigate } from "react-router-dom";
import 'react-responsive-modal/styles.css';
import { Modal } from 'react-responsive-modal';
import { Bar, Line, Pie } from "react-chartjs-2";
import { generateProfitablityTable, generateRepaymentTable } from "../services";
import BasicDetails from './inputComponents/BasicDetails';
import CostOfProject from './inputComponents/CostOfProject';
import ReportSettings from './inputComponents/ReportSettings';
import Revenue from './inputComponents/Revenue';
import Expense from './inputComponents/Expense';
import InfoDetails from './inputComponents/InfoDetails';

import { data } from '../dummyData'
import MeansOfFinance from './inputComponents/MeansOfFinance';
import MoreDetails from './inputComponents/MoreDetails';

import { data as dummyData } from '../dummyData'

const InputForm = () => {
    const nav = useNavigate();
    const navigate = useNavigate();

    const [reportInput, setReportInput] = useState({});

    const handleSave = (data) => {
        console.log(data);
        let newObj = { ...reportInput, ...data };
        setReportInput({ ...newObj });
        alert("Details Saved")
    }

    const handleComplete = () => {
        console.log("Form completed!");
        alert("data : " + reportInput)
    };

    const checkValidateTab = () => {
        // console.log(firstTabInput);
        // if (firstTabInput === "") {
        //     return false;
        // }
        // return true;
    };
    const errorMessages = () => {
        // you can add alert or console.log or any thing you want
        alert("Please fill in the required fields");
    };


    const backTemplate = (handlePrevious) => {
        return (
            <div className="prevBtn">
                <button className="btn btn-outline-warning px-5" onClick={handlePrevious}>
                    Previous
                </button>
            </div>
        );
    };

    const nextTemplate = (handleNext) => {
        return (
            <div className="nextBtn">
                <button className="btn btn-primary ms-5 px-5" onClick={handleNext}>
                    Next
                </button>
            </div>
        );
    };

    const [open, setOpen] = useState(false);
    const onOpenModal = () => setOpen(true);
    const onCloseModal = () => setOpen(false);


    const submitDetails = () => {
        console.log("Report Generate");
        console.log(data);
        console.log(dummyData);
        nav("/report/review", { state: { ...data } })
        // onOpenModal()
        // const response = generateReport(dummyData)
        // console.log(response);
    }

    const renderMenuBar = () => {
       
        const authRole = localStorage.getItem('userRole'); // Get the role from localStorage or state
      
        // Check if authRole exists, and if it's a valid role
        if (!authRole) {
          navigate('/login'); // If there's no role, redirect to login
          return null; // Optionally render nothing while redirecting
        }
      
        switch (authRole) {
          case 'admin':
            return <MenuBar userRole="admin" />;
          case 'employee':
            return <MenuBar userRole="employee" />;
          case 'client':
            return <MenuBar userRole="client" />;
          default:
            navigate('/login'); // If role doesn't match, redirect to login
            return null;
        }
      };

    return (
        <>
            <div className="app-container">
            {renderMenuBar()}
                <div className="app-content">
                    <div className="container">
                        <FormWizard
                            stepSize="xs"
                            color="#673AB7"
                            onComplete={handleComplete}
                            // onTabChange={handleTabChange}
                            backButtonTemplate={backTemplate}
                            nextButtonTemplate={nextTemplate}
                            finishButtonTemplate={(handleComplete) => (
                                <button className="btn btn-success" style={{ padding: "2%", width: "50%", fontSize: "1.5rem", marginLeft: "25%", marginTop: "10%" }} onClick={submitDetails}>- Generate Report -</button>
                            )}
                        >
                            <FormWizard.TabContent title="Personal details" icon="ti-user">
                                <BasicDetails handleSave={handleSave} reportInput={reportInput} />
                            </FormWizard.TabContent>
                            <FormWizard.TabContent
                                title="Means of Finance"
                                icon="ti-marker"
                                isValid={checkValidateTab()}
                                validationError={errorMessages}
                            >
                                <MeansOfFinance handleSave={handleSave} />
                            </FormWizard.TabContent>
                            <FormWizard.TabContent
                                title="Cost of Project"
                                icon="ti-notepad"
                                isValid={checkValidateTab()}
                                validationError={errorMessages}
                            >
                                <CostOfProject handleSave={handleSave} />
                            </FormWizard.TabContent>
                            <FormWizard.TabContent title="Project Report Settings" icon="ti-settings">
                                <ReportSettings handleSave={handleSave} />
                            </FormWizard.TabContent>
                            <FormWizard.TabContent title="Expenses" icon="ti-pie-chart">
                                <Expense handleSave={handleSave} />
                            </FormWizard.TabContent>
                            <FormWizard.TabContent title="Revenue" icon="ti-check">
                                <Revenue handleSave={handleSave} years={(reportInput && reportInput.reportSettings && reportInput.reportSettings.ProjectionYears) || 0} />
                            </FormWizard.TabContent>
                            <FormWizard.TabContent title="Details" icon="ti-package">
                                <InfoDetails handleSave={handleSave} />
                            </FormWizard.TabContent>
                            <FormWizard.TabContent title="More Details" icon="ti-package">
                                <MoreDetails handleSave={handleSave} years={(reportInput && reportInput.reportSettings && reportInput.reportSettings.ProjectionYears) || 0} />
                            </FormWizard.TabContent>
                            <FormWizard.TabContent title="Submit" icon="ti-check-box">
                                <h3>Final Submit</h3>
                                <p>Check all the inputs</p>
                                <button onClick={submitDetails}>Generate</button>
                            </FormWizard.TabContent>

                        </FormWizard>
                    </div>
                    {/* <div className="" style={{ visibility: "hidden" }} id="charts">
                        <div className="">
                            <Line ref={lineRef} data={data} />
                            <Pie ref={pieRef} data={pieChartdata} />
                            <Bar ref={barRef} data={barChartData} />
                        </div>
                    </div> */}
                </div>

                <Modal open={open} onClose={onCloseModal} center
                    classNames={{
                        // overlay: 'customOverlay',
                        modal: 'customModal',
                    }}
                    closeOnEsc={false}
                    closeOnOverlayClick={false}
                >
                    <div className="container">
                        <div className="row">
                            <div className="col">
                                <div className="text-center">
                                    <div className="spinner-border" role="status">
                                        {/* <span className="sr-only p-4"></span> */}
                                    </div>
                                    <br />
                                    Generating Report...
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal>
            </div >
            {/* add style */}
            < style >
                {`
                    @import url("https://cdn.jsdelivr.net/gh/lykmapipo/themify-icons@0.1.2/css/themify-icons.css");
                    .form-control {
                        height: 36px;
                        padding: 0.375rem 0.75rem;
                        font-size: 1rem;
                        font-weight: 400;
                        line-height: 1.5;
                        color: #673AB7;
                        border: 1px solid #ced4da;
                        border-radius: 0.25rem;
                    }

                `}
            </style >
        </>
    )
}

export default InputForm