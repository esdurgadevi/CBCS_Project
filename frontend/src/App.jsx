//use
import CBCSForm from "./CBCSForm";
import './index.css'
import DepartmentList from "./DepartmentList";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DepartmentDetails from "./DepartmentDetails";
import Login from "./Login";
import ResetPassword from "./ResetPassword";
import AdminDashboard from "./AdminDashboard";
import CoreSubjects from "./CoreSubjects";
import StaffList from "./StaffList";
import StudentCbcs from "./StudentCbcs";
import StudentLogin from "./StudentLogin";
import StaffDetails from "./StaffDetails";
import CreateStaff from "./CreateStaff";
import CbcsDetails from "./CbcsDetails";
import ProtectedRoute from "./ProtectedRoute";
import DomainDetails from "./DomainDetails";
import DomainList from "./DomainList";
import CreateDomain from "./CreateDomain";
import DomainCBCSForm from "./DomainCBCSForm";
import CBCSList from "./CBCSList";
import StudentFeedback from "./StudentFeedback";
import StudentDashboard from "./StudentDashboard";
import Feedback from "./Feedback";
function App()
{
  return(
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/reset" element={<ResetPassword />} />
        <Route path="/admin-dashboard" element={
          <ProtectedRoute>
             <AdminDashboard />
          </ProtectedRoute>
         } />
        <Route path="/dept-list" element={<DepartmentList />} />
        <Route path="/core_cbcs" element={<CBCSForm />} />
        <Route path="/core-sub" element={<CoreSubjects /> } />
         <Route path="/student_cbcs/:type/:id/:regno" element={<StudentCbcs />} />
        <Route path="/staff-stu" element={<StaffList />} />
        {/* <Route path="/cbcs/:id" element={<StudentLogin />} /> */}
        <Route path="/student-dashboard/:type/:id/:regno" element={<StudentDashboard />} />
        <Route path="/cbcs/:type/:id" element={<StudentLogin />} />
        <Route path="/departments/:dept_id" element={<DepartmentDetails />} />
        <Route path="/staffdetails/:staffId" element={<StaffDetails />} />
        <Route path="/staff-create" element={<CreateStaff />} />
        <Route path="/cbcsdetails/:id" element={<CbcsDetails />} />
        <Route path="/domaindetails/:domain_id" element={<DomainDetails />} />
        <Route path="/domainlist" element={<DomainList />} />
        <Route path="/create-domain" element={<CreateDomain />} />
        <Route path="/domain" element={<DomainCBCSForm />} />
        <Route path="/cbcslist" element={<CBCSList/>} />
        <Route path="/student-dashboard/:id" element={<StudentDashboard />} />
        <Route path="/feedback/:id/:regno/:type" element={<Feedback />} />
      </Routes>
    </Router>
  )
}

export default App;