import React, { useState } from "react";
import MenuBar from "../MenuBar";
import Header from "../Header";
import EmployeeTasks from "../Dashboards/EmployeeDashboard/EmployeeTasks";

const Tasks = () => {
    const [employeeData, setEmployeeData] = useState(null);
    
    // Get employeeId from localStorage
    const employeeId = localStorage.getItem("userId");

    return (
        <div className="app-container">
            <MenuBar userRole={"employee"} />
            <div className="app-content">
                <Header dashboardType="User Dashboard" />
                {/* Pass employeeId directly to EmployeeTasks */}
                <EmployeeTasks employeeId={employeeId} />
            </div>
        </div>
    );
};

export default Tasks;
