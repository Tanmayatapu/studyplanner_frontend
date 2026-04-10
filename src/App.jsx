import {BrowserRouter,Routes,Route} from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import DashboardLayout from "./layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Subjects from "./pages/Subjects";
import SubjectDetails from "./pages/SubjectDetails";
import StudyPlan from "./pages/StudyPlan";
import Progress from "./pages/Progress";
import Settings from "./pages/Settings";

export default function App(){
  return(
    <BrowserRouter>
      <Routes>

        {/* Public pages */}
        <Route path="/" element={<Home/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/register" element={<Register/>}/>

        {/* Dashboard pages */}
        <Route element={<DashboardLayout/>}>
          <Route path="/dashboard" element={<Dashboard/>}/>
          <Route path="/subjects" element={<Subjects/>}/>
          <Route path="/subjects/:subjectId" element={<SubjectDetails/>}/>
          <Route path="/study-plan" element={<StudyPlan/>}/>
          <Route path="/progress" element={<Progress/>}/>
          <Route path="/settings" element={<Settings/>}/>
        </Route>

      </Routes>
    </BrowserRouter>
  )
}
