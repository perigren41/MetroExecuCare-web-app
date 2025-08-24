// App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "@/webpages/LoginPage"; 
import {LandingPage}  from "@/webpages/LandingPage";
import { FAQ } from "@/webpages/FAQ";
import { AboutUs } from "@/webpages/AboutUs";
import { ContactUs } from "@/webpages/ContactUs";
import HRDashboard from "@/webpages/HRDashboard";
import HR_HistoryPage from "@/webpages/HR_HistoryPage";
import { NotFound } from "@/NotFound";
import LOA_RecordSummary from "@/webpages/LOA_RecordSummary";



export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default landing page */}
        <Route path="/" element={<LandingPage />} />

        {/* Other public pages */}
        <Route path="/faq" element={<FAQ />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/contact-us" element={<ContactUs />} />

        {/* Auth-related */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/hr-dashboard" element={<HRDashboard />} />
        <Route path="/hr-history" element={<HR_HistoryPage />} />
        <Route path="/loa-record-summary/:requestId" element={<LOA_RecordSummary />} />

        {/* 404 fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
