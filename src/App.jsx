import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NotFound } from "@/NotFound";
import { LandingPage } from "@/webpages/LandingPage";
import { LoginPage } from "@/webpages/LoginPage";
import  ExecutiveEmployeeDashboard  from "@/webpages/ExecutiveEmployeeDashboard";
import ExecutiveEmployeeProfile from "@/webpages/ExecutiveEmployeeProfile";
import AdminUserPage from "@/webpages/AdminUserPage";

function App() {
  return(
  <>
    <BrowserRouter>
      <Routes>
        <Route index element={ <LandingPage /> } />
        <Route path="/loginpage" element={<LoginPage />} />
        <Route path="/executive-employee-dashboard" element={<ExecutiveEmployeeDashboard />} />
        <Route path="/executive-employee-profile" element={<ExecutiveEmployeeProfile />} />
        <Route path="/admin-users-page" element={<AdminUserPage />} />
        <Route path="*" element={ <NotFound/> } />
      </Routes>
    </BrowserRouter>
  </>
  );
}

export default App;
