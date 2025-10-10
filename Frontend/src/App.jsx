import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext.jsx";
import { ProtectedRoute, AdminRoute, ExecutiveRoute, HRRoute, BenefitsRoute, WelfareRoute, WorkflowRoute } from "@/Components/ProtectedRoute.jsx";
import { NotFound } from "@/NotFound.jsx";
import { LandingPage } from "@/webpages/LandingPage.jsx";
import { LoginPage } from "@/webpages/NewLoginPage.jsx";
import AdminUserPage from "@/webpages/AdminUserPage.jsx";
import AdminProfilePage from "./webpages/AdminProfilePage.jsx";
import ExecutiveEmployeeDashboard  from "@/webpages/ExecutiveEmployeeDashboard.jsx";
import ExecutiveEmployeeSubmitLOApproval from "@/webpages/ExecutiveEmployeeSubmitLOApproval.jsx";
import ExecutiveEmployeeSubmitLOAuthorization from "./webpages/ExecutiveEmployeeSubmitLOAuthorization.jsx";
import ExecutiveEmployeeProfile from "@/webpages/ExecutiveEmployeeProfile.jsx";
import LOAStatusTracker from "@/webpages/LoaStatusTracker.jsx";

// HR Components
import HRDashboard from "@/webpages/HRDashboard.jsx";
import HR_HistoryPage from "@/webpages/HR_HistoryPage.jsx";
import HR_PendingRequestsPage from "@/webpages/HR_PendingRequestsPage.jsx";
import HRProfilePage from "@/webpages/HR_Profile.jsx";
import LOA_RecordSummary from "@/webpages/LOA_RecordSummary.jsx";
import LOA_Submit from "@/webpages/LOA_Submit.jsx";
import AboutUsPage from "@/webpages/AboutUsPage.jsx";
import FAQPage from "@/webpages/FAQPage.jsx";


function App() {
  return(
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route index element={ <LandingPage /> } />
          <Route path="/loginpage" element={<LoginPage />} />
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/faq" element={<FAQPage />} />

          {/* Executive Routes */}
          <Route
            path="/executive-employee-dashboard"
            element={
              <ExecutiveRoute>
                <ExecutiveEmployeeDashboard />
              </ExecutiveRoute>
            }
          />
          <Route
            path="/executive-employee-submit-loapproval"
            element={
              <ExecutiveRoute>
                <ExecutiveEmployeeSubmitLOApproval />
              </ExecutiveRoute>
            }
          />
          <Route
            path="/executive-employee-submit-loauthorization"
            element={
              <ExecutiveRoute>
                <ExecutiveEmployeeSubmitLOAuthorization />
              </ExecutiveRoute>
            }
          />
          <Route
            path="/executive-employee-profile"
            element={
              <ExecutiveRoute>
                <ExecutiveEmployeeProfile />
              </ExecutiveRoute>
            }
          />
          <Route
            path="/loa-status-tracker"
            element={
              <ExecutiveRoute>
                <LOAStatusTracker />
              </ExecutiveRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin-users-page"
            element={
              <AdminRoute>
                <AdminUserPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin-profile-page"
            element={
              <AdminRoute>
                <AdminProfilePage />
              </AdminRoute>
            }
          />

          {/* HR Personnel Routes */}
          <Route
            path="/hr-dashboard"
            element={
              <HRRoute>
                <HRDashboard />
              </HRRoute>
            }
          />
          <Route
            path="/hr-pending-requests"
            element={
              <HRRoute>
                <HR_PendingRequestsPage />
              </HRRoute>
            }
          />
          <Route
            path="/hr-history"
            element={
              <HRRoute>
                <HR_HistoryPage />
              </HRRoute>
            }
          />
          <Route
            path="/hr-profile"
            element={
              <WorkflowRoute>
                <HRProfilePage />
              </WorkflowRoute>
            }
          />

          {/* Benefits Officer Routes */}
          <Route
            path="/benefits-dashboard"
            element={
              <BenefitsRoute>
                <HRDashboard />
              </BenefitsRoute>
            }
          />
          <Route
            path="/benefits-pending-requests"
            element={
              <BenefitsRoute>
                <HR_PendingRequestsPage />
              </BenefitsRoute>
            }
          />
          <Route
            path="/benefits-history"
            element={
              <BenefitsRoute>
                <HR_HistoryPage />
              </BenefitsRoute>
            }
          />
          <Route
            path="/benefits-profile"
            element={
              <BenefitsRoute>
                <HRProfilePage />
              </BenefitsRoute>
            }
          />

          {/* Welfare Head Routes */}
          <Route
            path="/welfare-dashboard"
            element={
              <WelfareRoute>
                <HRDashboard />
              </WelfareRoute>
            }
          />
          <Route
            path="/welfare-pending-requests"
            element={
              <WelfareRoute>
                <HR_PendingRequestsPage />
              </WelfareRoute>
            }
          />
          <Route
            path="/welfare-history"
            element={
              <WelfareRoute>
                <HR_HistoryPage />
              </WelfareRoute>
            }
          />
          <Route
            path="/welfare-profile"
            element={
              <WelfareRoute>
                <HRProfilePage />
              </WelfareRoute>
            }
          />

          {/* Shared HR/Benefits/Welfare Routes */}
          <Route
            path="/loa-record-summary/:requestId"
            element={
              <ProtectedRoute allowedRoles={["hr_personnel", "benefits_officer", "welfare_head"]}>
                <LOA_RecordSummary />
              </ProtectedRoute>
            }
          />
          <Route
            path="/loa-submit/:requestId"
            element={
              <ProtectedRoute allowedRoles={["hr_personnel", "benefits_officer", "welfare_head"]}>
                <LOA_Submit />
              </ProtectedRoute>
            }
          />

          {/* Public Information Routes - Handled above in Public Routes section */}

          {/* 404 Route */}
          <Route path="*" element={ <NotFound/> } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
