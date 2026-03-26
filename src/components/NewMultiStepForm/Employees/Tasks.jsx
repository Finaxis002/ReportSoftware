import EmployeeTasks from "../Dashboards/EmployeeDashboard/EmployeeTasks";

const Tasks = () => {
    
    // Get employeeId from localStorage
    const employeeId = localStorage.getItem("userId");

    return (
        <div className="app-container">
            
            <div className="app-content">
                <EmployeeTasks employeeId={employeeId} />
            </div>
        </div>
    );
};

export default Tasks;
