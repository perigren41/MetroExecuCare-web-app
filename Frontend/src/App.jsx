import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute, AdminRoute, ExecutiveRoute } from "@/Components/ProtectedRoute";
import { NotFound } from "@/NotFound";
import { LandingPage } from "@/webpages/LandingPage";
import { LoginPage } from "@/webpages/LoginPage";
import AdminUserPage from "@/webpages/AdminUserPage";
import AdminProfilePage from "./webpages/AdminProfilePage.jsx";
import ExecutiveEmployeeDashboard  from "@/webpages/ExecutiveEmployeeDashboard";
import ExecutiveEmployeeSubmitLOApproval from "@/webpages/ExecutiveEmployeeSubmitLOApproval.jsx";
import ExecutiveEmployeeSubmitLOAuthorization from "./webpages/ExecutiveEmployeeSubmitLOAuthorization.jsx";
import ExecutiveEmployeeProfile from "@/webpages/ExecutiveEmployeeProfile.jsx";
import LOAStatusTracker from "@/webpages/LoaStatusTracker.jsx";


function App() {
  return(
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route index element={ <LandingPage /> } />
          <Route path="/loginpage" element={<LoginPage />} />

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

          {/* 404 Route */}
          <Route path="*" element={ <NotFound/> } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
