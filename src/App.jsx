import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NotFound } from "@/NotFound";
import { LandingPage } from "@/webpages/LandingPage";
import { LoginPage } from "@/webpages/LoginPage";
import ExecutiveEmployeeDashboard  from "@/webpages/ExecutiveEmployeeDashboard";
import ExecutiveEmployeeSubmitLOApproval from "@/webpages/ExecutiveEmployeeSubmitLOApproval.jsx";
import AdminUserPage from "@/webpages/AdminUserPage";
import AdminProfilePage from "./webpages/AdminProfilePage.jsx";
import ExecutiveEmployeeSubmitLOAuthorization from "./webpages/ExecutiveEmployeeSubmitLOAuthorization.jsx";


function App() {
  return(
  <>
    <BrowserRouter>
      <Routes>
        <Route index element={ <LandingPage /> } />
        <Route path="/loginpage" element={<LoginPage />} />
        <Route path="/executive-employee-dashboard" element={<ExecutiveEmployeeDashboard />} />
        <Route path="/executive-employee-submit-loapproval" element={<ExecutiveEmployeeSubmitLOApproval />} />
        <Route path="/executive-employee-submit-loauthorization" element={<ExecutiveEmployeeSubmitLOAuthorization />} />

        <Route path="/admin-users-page" element={<AdminUserPage />} />
        <Route path="/admin-profile-page" element={<AdminProfilePage />} />
        <Route path="*" element={ <NotFound/> } />
      </Routes>
    </BrowserRouter>
  </>
  );
}

export default App;
