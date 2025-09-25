import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import apiService from "@/services/api";
import Authorization from "@/assets/authorization.svg";
import Approval from "@/assets/approval.svg";
import ProfileBlueSolid from "@/assets/profilebluesolid.svg";
import LogoutBlueSolid from "@/assets/logoutbluesolid.svg";
import LogoutRed from "@/assets/logoutred.svg";
import ApprovalBg from "@/assets/approvalbg.svg";
import AuthorizationBg from "@/assets/authorizationbg.svg";
import ChevronRight from "@/assets/chevronright.svg";

import CheckSquare from "@/assets/checksquare.svg";
import ClockSquare from "@/assets/clocksquare.svg";
import BlankSquare from "@/assets/blanksquare.svg";
import XSquare from "@/assets/xsquare.svg";
import AddSquare from "@/assets/addsquare.svg";
import { Clock } from "lucide-react";
const COLORS = {
  ombre: ["#3F6EC0", "#00539F", "#5D3EA4", "#7940A8"],
  blue: "#00539F",
  purple: "#5D3EA4",
};

// ActionButton Component
function ActionButton({ label, color, onClick, backgroundImage }) {
  return (
    <button
      className="text-white font-semibold p-4 sm:p-6 rounded-3xl shadow-lg hover:shadow-xl
      flex flex-col items-center justify-center transition-all duration-200 transform
      hover:scale-105 active:scale-95 w-full max-w-xs sm:max-w-sm md:max-w-md
      min-h-[140px] sm:min-h-[160px] md:min-h-[180px]"
      style={{
        backgroundColor: color || "transparent",
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
      onClick={onClick}
      onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.05)")}
      onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}
    >
      <div className="flex flex-col items-center text-center space-y-2">
        {label}
      </div>
    </button>
  );
}

// GreetingStatusCard Component
function GreetingStatusCard({ firstName, lastName, requestStatus, onChevronClick }) {
  const fullName = `${firstName} ${lastName}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 w-full items-center mt-4 sm:mt-8 mb-2 gap-6 lg:gap-12 px-4 sm:px-8">
      {/* Greeting Section */}
      <div className="order-2 lg:order-1">
        <div className="flex flex-col space-y-3 sm:space-y-4 text-center lg:text-left">
          <div className="flex justify-center lg:justify-start">
            <img
              src="src/assets/MetrobankLogo.svg"
              className="w-24 h-6 sm:w-32 sm:h-8 md:w-40 md:h-10"
              alt="Metrobank Logo"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
            Hello, {firstName}!
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-white/90">
            Welcome to the MetroExecuCare Annual Executive Check-up Portal
          </p>
        </div>
      </div>

      {/* Status Section - Centered */}
      <div className="order-1 lg:order-2 flex justify-center">
        <div className="bg-white text-gray-900 rounded-3xl shadow-xl w-full max-w-sm sm:max-w-md lg:max-w-lg
        flex flex-col items-center py-6 px-8 sm:py-8 sm:px-10">
          {/* Current Request Status Heading */}
          <h2 className="text-lg sm:text-xl font-semibold text-center mb-6 text-gray-800">
            Current Request Status
          </h2>

          {/* Status Pill - Bigger with more padding */}
          <div
            className="rounded-2xl shadow-lg px-6 py-4 sm:px-8 sm:py-6 flex flex-col items-center
            border-2 w-full max-w-xs sm:max-w-sm min-h-[100px] sm:min-h-[120px] justify-center space-y-2"
            style={requestStatus.pillStyle}
          >
            <div className="flex items-center space-x-2">
              <img src={requestStatus.icon} alt="Status" className="w-8 h-8 sm:w-10 sm:h-10" />
              <span className="font-semibold text-sm sm:text-base text-center">
                {requestStatus.text}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-center opacity-80 leading-relaxed">
              {requestStatus.note}
            </p>
          </div>

          {/* Chevron Button */}
          <button
            onClick={onChevronClick}
            className="bg-blue-700 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full hover:bg-blue-800
            transition-colors duration-200 flex items-center justify-center mt-4 sm:mt-6"
          >
            <img src={ChevronRight} alt="Chevron Right" className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Dashboard Component
export default function ExecutiveEmployeeDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Modal states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Current request status based on checkup_requests table schema
  const [currentRequest, setCurrentRequest] = useState({
    id: null,
    request_number: null,
    request_type: null,
    current_status: "no_request", // Default to no request until we fetch data
    priority_level: "normal",
    hospital_id: null,
    hospital_name: null,
    preferred_date: null,
    additional_notes: null,
    letter_purpose: null,
    medical_requirements: null
  });

  // Fetch user requests on component mount
  useEffect(() => {
    if (user) {
      fetchUserRequests();
    }
  }, [user]);

  const fetchUserRequests = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch user's requests
      const response = await apiService.getRequests();

      if (response.success && response.data && response.data.requests && response.data.requests.length > 0) {
        // Get the most recent request
        const latestRequest = response.data.requests[0];
        setCurrentRequest(latestRequest);
      } else {
        // No requests found
        setCurrentRequest(prev => ({ ...prev, current_status: "no_request" }));
      }
    } catch (error) {
      console.error("Error fetching user requests:", error);
      setError("Failed to load request data");
      setCurrentRequest(prev => ({ ...prev, current_status: "no_request" }));
    } finally {
      setLoading(false);
    }
  };

  // Status display configuration - aligned with database values
  const getStatusDisplay = (status) => {
    const statusConfig = {
      no_request: {
        text: "No Active Request",
        note: "Ready to submit new request",
        icon: AddSquare,
        pillStyle: {
          backgroundColor: "#F3F4F6",
          color: "#6B7280",
          borderColor: "#6B7280",
          boxShadow: "#6B7280",
        },
      },

      // Database status mappings
      pending: {
        text: "Waiting for HR",
        note: "HR Personnel reviewing your request",
        icon: ClockSquare,
        pillStyle: {
          backgroundColor: "#FEF3C7",
          color: "#D97706",
          borderColor: "#FCD34D",
          boxShadow: "#FCD34D",
        },
      },
      in_progress: {
        text: "In Progress",
        note: "Request being processed by HR",
        icon: ClockSquare,
        pillStyle: {
          backgroundColor: "#DBEAFE",
          color: "#2563EB",
          borderColor: "#93C5FD",
          boxShadow: "#93C5FD",
        },
      },
      hr_approved: {
        text: "HR Approved",
        note: "Waiting for Benefits Officer approval",
        icon: ClockSquare,
        pillStyle: {
          backgroundColor: "#DBECFF",
          color: COLORS.blue,
          borderColor: "#B3D6FF",
          boxShadow: "#B3D6FF",
        },
      },
      benefits_approved: {
        text: "Benefits Approved",
        note: "Waiting for Welfare Head approval",
        icon: ClockSquare,
        pillStyle: {
          backgroundColor: "#DBECFF",
          color: COLORS.blue,
          borderColor: "#B3D6FF",
          boxShadow: "#B3D6FF",
        },
      },
      welfare_approved: {
        text: "Welfare Approved",
        note: "Final approvals completed",
        icon: ClockSquare,
        pillStyle: {
          backgroundColor: "#DBECFF",
          color: COLORS.blue,
          borderColor: "#B3D6FF",
          boxShadow: "#B3D6FF",
        },
      },
      approved: {
        text: "Request Approved",
        note: "All approvals completed",
        icon: CheckSquare,
        pillStyle: {
          backgroundColor: "#D1FAE5",
          color: "#059669",
          borderColor: "#A7F3D0",
          boxShadow: "#A7F3D0",
        },
      },
      rejected: {
        text: "Request Rejected",
        note: "Request was not approved",
        icon: XSquare,
        pillStyle: {
          backgroundColor: "#FEE2E2",
          color: "#DC2626",
          borderColor: "#FECACA",
          boxShadow: "#FECACA",
        },
      },
      completed: {
        text: "Request Completed",
        note: "Process completed successfully",
        icon: CheckSquare,
        pillStyle: {
          backgroundColor: "#D1FAE5",
          color: "#059669",
          borderColor: "#A7F3D0",
          boxShadow: "#A7F3D0",
        },
      },
    };

    return statusConfig[status] || statusConfig.no_request;
  };

  // Handle new approval request letter - Navigate to approval page
  const handleapprovalrequest = () => {
    navigate('/executive-employee-submit-loapproval');
  };

  // Handle request authorization letter - Navigate to authorization page
  const handlerequestauthorization = () => {
    navigate('/executive-employee-submit-loauthorization');
  };

  // Handle chevron click - Navigate to LOA status tracker with current data
  const handleChevronClick = () => {
    // Pass complete request data through navigation state with database field mappings
    navigate('/loa-status-tracker', {
      state: {
        requestDetails: {
          ...currentRequest,
          // Ensure consistent field mappings
          request_type: currentRequest.request_type || "Letter of Authorization",
          request_id: currentRequest.id,
          created_at: currentRequest.created_at,
          first_name: user?.first_name,
          last_name: user?.last_name,
          current_status: currentRequest.current_status,
          request_number: currentRequest.request_number,
        }
      }
    });
  };

  // Modal handlers
  const handleUserProfile = () => {
    setShowProfileModal(!showProfileModal);
  };

  const handleProfileNavigation = () => {
    navigate('/executive-employee-profile');
    setShowProfileModal(false);
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
    setShowProfileModal(false);
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleConfirmLogout = () => {
    // Use AuthContext logout functionality
    logout();
    navigate('/loginpage', { replace: true });
    setShowLogoutModal(false);
  };

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileModal && !event.target.closest('.profile-modal-container')) {
        setShowProfileModal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileModal]);

  const statusDisplay = getStatusDisplay(currentRequest.current_status);

  return (
    <div className="bg-gray-100 min-h-screen font-sans">

      {/* Top Section */}
      <div
        className="relative text-white flex flex-col justify-center items-center shadow-2xl p-4 sm:p-6 lg:p-8"
        style={{
          minHeight: "60vh",
          background: `linear-gradient(90deg,
            ${COLORS.ombre[0]} 0%,
            ${COLORS.ombre[1]} 25%,
            ${COLORS.ombre[2]} 60%,
            ${COLORS.ombre[3]} 100%)`,
        }}
      >
        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <span className="ml-2 text-white">Loading dashboard...</span>
          </div>
        ) : (
          <>
            {/* Main Content */}
            <GreetingStatusCard
              firstName={user?.first_name || "User"}
              lastName={user?.last_name || ""}
              requestStatus={statusDisplay}
              onChevronClick={handleChevronClick}
            />

            {/* Top Right - User Profile */}
            <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex items-center space-x-2 profile-modal-container">
              <span className="text-xs sm:text-sm hidden sm:block">{user?.first_name} {user?.last_name}</span>
              <button
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-white hover:opacity-80 transition-opacity"
                onClick={handleUserProfile}
              >
                <img
                  src={user?.profile_picture_url || "https://via.placeholder.com/40"}
                  alt="profile"
                  className="w-full h-full object-cover"
                />
              </button>

              {/* Profile Modal Dropdown */}
              {showProfileModal && (
                <div className="absolute top-full right-0 mt-2 w-32 sm:w-36 bg-white rounded-2xl shadow-xl border border-gray-200 z-50">
                  <div className="py-1">
                    {/* Profile option */}
                    <button
                      onClick={handleProfileNavigation}
                      className="w-full px-4 py-2 text-left text-sm text-blue-700 hover:bg-gray-200 hover:rounded-2xl transition flex items-center gap-2"
                    >
                      <img src={ProfileBlueSolid} alt="Profile Icon" className="w-4 h-4" />
                      <span>Profile</span>
                    </button>
                    {/* Logout option */}
                    <button
                      onClick={handleLogoutClick}
                      className="w-full px-4 py-2 text-left text-sm text-blue-700 hover:bg-gray-200 hover:rounded-2xl transition flex items-center gap-2"
                    >
                      <img src={LogoutBlueSolid} alt="Logout" className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-3xl shadow-lg text-center w-80">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <img src={LogoutRed} alt="Logout" className="w-3 h-3" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Confirm Logout</h3>
            </div>
            <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
            <div className="flex gap-3">
              <button
                onClick={handleCancelLogout}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-2xl hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mx-4 sm:mx-8 mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
          <button
            onClick={() => setError("")}
            className="ml-2 text-red-900 hover:text-red-700"
          >
            ✕
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="py-8 sm:py-12 px-4 sm:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-12 max-w-4xl mx-auto">
          <div className="w-full max-w-xs sm:max-w-sm">
            <ActionButton
              label={
                <>
                  <span className="text-sm sm:text-base md:text-lg font-bold">Request</span>
                  <span className="text-sm sm:text-base md:text-lg font-bold">Letter of Approval</span>
                  <img src={Approval} alt="approval" className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16" />
                </>
              }
              backgroundImage={ApprovalBg}
              onClick={handleapprovalrequest}
            />
          </div>

          <div className="w-full max-w-xs sm:max-w-sm">
            <ActionButton
              label={
                <>
                  <span className="text-sm sm:text-base md:text-lg font-bold">Request</span>
                  <span className="text-sm sm:text-base md:text-lg font-bold">Letter of Authorization</span>
                  <img src={Authorization} alt="authorization" className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16" />
                </>
              }
              backgroundImage={AuthorizationBg}
              onClick={handlerequestauthorization}
            />
          </div>
        </div>
      </div>
    </div>
  );
}