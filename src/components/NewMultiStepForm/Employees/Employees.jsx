
import { useNavigate } from "react-router-dom";
import EmployeeDetailsList from "../Dashboards/AdminDashboard/EmployeeDetailsList";

const Employees = () => {
  const navigate = useNavigate();



  return (
    <div className="flex h-[100vh]">
      <div className="app-content">
      <EmployeeDetailsList />
      </div>
    </div>
  );
};

export default Employees;
