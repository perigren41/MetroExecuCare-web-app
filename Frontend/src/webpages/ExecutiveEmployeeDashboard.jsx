// ExecutiveEmployeeDashboard.jsx

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import apiService from "@/services/api";
import Authorization from "@/assets/authorization.svg";
import Approval from "@/assets/approval.svg";
import ProfileBlueSolid from "@/assets/profilebluesolid.svg";
import LogoutBlueSolid from "@/assets/logoutbluesolid.svg";
import LogoutRed from "@/assets/logoutred.svg";
import ProfileIcon from '@/assets/ProfileIcon.svg';
import LogoutIcon from '@/assets/LogoutIcon.svg';
import ProfileGray from '@/assets/profilegray.svg';
import ClockIcon from '@/assets/ClockIconBlue.svg';
import { HelpCircle as FAQIcon } from "lucide-react";
import ApprovalBg from "@/assets/approvalbg.svg";
import AuthorizationBg from "@/assets/authorizationbg.svg";
import ChevronRight from "@/assets/chevronright.svg";
import MetrobankLogo from "@/assets/MetrobankLogo.svg";
import CheckSquare from "@/assets/checksquare.svg";
import ClockSquare from "@/assets/clocksquare.svg";
import BlankSquare from "@/assets/blanksquare.svg";
import XSquare from "@/assets/xsquare.svg";
import AddSquare from "@/assets/addsquare.svg";
import { HelpCircle } from "lucide-react";
const COLORS = {
  ombre: ["#3F6EC0", "#00539F", "#5D3EA4", "#7940A8"],
  blue: "#00539F",
  purple: "#5D3EA4",
};

// ActionButton Component
function ActionButton({ label, color, onClick, backgroundImage, hoverText }) {
  return (
    <button
      className="cursor-pointer text-white font-semibold rounded-4xl
      w-full max-w-xs sm:max-w-sm md:max-w-md lg:w-110
      h-24 sm:h-28 md:h-36 lg:h-42
      shadow-md flex items-center justify-center
      transition transform active:scale-[.98] hover:brightness-105
      mb-3 sm:mb-4 mx-auto p-3 sm:p-4 md:p-6 group relative overflow-hidden"
      style={{ 
        backgroundColor: color || "transparent",
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
      onClick={onClick}
    >
      {/* Original Content - Fades out on hover */}
      <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 ease-in-out group-hover:opacity-0 p-3 sm:p-4 md:p-6">
        <div className="w-full h-full flex items-center justify-center">
          {label}
        </div>
      </div>

      {/* Hover Content - Fades in on hover */}
      <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100">
        <span className="text-lg md:text-lg lg:text-xl font-bold text-blue-100 animate-pulse drop-shadow-lg">
          {hoverText || "Click to Submit"}
        </span>
        <div className="mt-2 w-6 h-6 border-2 border-blue-100 rounded-full animate-ping"></div>
      </div>
    </button>
  );
}

// GreetingStatusCard Component
function GreetingStatusCard({
  firstName,
  lastName,
  requestStatus,
  onChevronClick
}) {
  const fullName = `${firstName} ${lastName}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 w-full items-center mt-4 sm:mt-8 mb-2 gap-6 lg:gap-12 px-4 sm:px-8">
      {/* Greeting Section */}
      <div className="order-2 lg:order-1">
        <div className="flex flex-col space-y-3 sm:space-y-4 text-center lg:text-left">
          <div className="flex justify-center lg:justify-start">
            <img
              src={MetrobankLogo}
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

          {/* Status Pill - Fully Rounded */}
          <div
            className="rounded-full shadow-lg px-6 py-4 sm:px-8 sm:py-6 flex flex-col items-center
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
            transition-colors duration-200 flex items-center justify-center mt-4 sm:mt-6 cursor-pointer"
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
  const [showDropdownMenu, setShowDropdownMenu] = useState(false);
  const [showHelpTooltip, setShowHelpTooltip] = useState(false);

  // Refs
  const dropdownRef = useRef(null);

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasReachedAnnualLimit, setHasReachedAnnualLimit] = useState(false);

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
        const requests = response.data.requests;

        // Get the most recent request
        const latestRequest = requests[0];
        setCurrentRequest(latestRequest);

        // Check if user has reached annual limit (1 completed request this year)
        const currentYear = new Date().getFullYear();
        const completedThisYear = requests.filter(req => {
          if (req.current_status === 'completed' && req.completed_at) {
            const completedYear = new Date(req.completed_at).getFullYear();
            return completedYear === currentYear;
          }
          return false;
        });

        setHasReachedAnnualLimit(completedThisYear.length >= 1);
      } else {
        // No requests found
        setCurrentRequest(prev => ({ ...prev, current_status: "no_request" }));
        setHasReachedAnnualLimit(false);
      }
    } catch (error) {
      console.error("Error fetching user requests:", error);
      setError("Failed to load request data");
      setCurrentRequest(prev => ({ ...prev, current_status: "no_request" }));
      setHasReachedAnnualLimit(false);
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
      hr_processing: {
        text: "Human Resource Processing",
        note: "Request being processed by Human Resource",
        icon: ClockSquare,
        pillStyle: {
          backgroundColor: "#DBEAFE",
          color: "#2563EB",
          borderColor: "#93C5FD",
          boxShadow: "#93C5FD",
        },
      },
      in_progress: {
        text: "In Progress",
        note: "Request being processed",
        icon: ClockSquare,
        pillStyle: {
          backgroundColor: "#DBEAFE",
          color: "#2563EB",
          borderColor: "#93C5FD",
          boxShadow: "#93C5FD",
        },
      },
      benefits_review: {
        text: "Benefits Officer Review",
        note: "Benefits Officer currently reviewing...",
        icon: ClockSquare,
        pillStyle: {
          backgroundColor: "#DBEAFE",
          color: "#2563EB",
          borderColor: "#93C5FD",
          boxShadow: "#93C5FD",
        },
      },
      welfare_review: {
        text: "Division Head Review",
        note: "Division Head currently reviewing...",
        icon: ClockSquare,
        pillStyle: {
          backgroundColor: "#DBEAFE",
          color: "#2563EB",
          borderColor: "#93C5FD",
          boxShadow: "#93C5FD",
        },
      },
      hr_final_verification: {
        text: "Final Human Resource Verification",
        note: "Human Resource currently finalizing clearance...",
        icon: ClockSquare,
        pillStyle: {
          backgroundColor: "#DBEAFE",
          color: "#2563EB",
          borderColor: "#93C5FD",
          boxShadow: "#93C5FD",
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

  // Demo account emails that bypass annual limit
  const DEMO_ACCOUNTS = [
    'executive@metroexecucare.com',
    'hr@metroexecucare.com',
    'benefits@metroexecucare.com',
    'divisionhead@metroexecucare.com',
    'admintest@metroexecucare.com'
  ];

  // Check if user is a demo account
  const isDemoAccount = user?.email && DEMO_ACCOUNTS.includes(user.email);

  // Handle new approval request letter - Navigate to approval page
  const handleapprovalrequest = () => {
    // Check annual limit for non-demo accounts
    if (!isDemoAccount && hasReachedAnnualLimit) {
      alert('Annual Limit Reached\n\nYou have already completed 1 request this year. You can only have 1 completed request per calendar year.\n\nYou may submit new requests:\n• After pending/rejected requests are resolved, or\n• Starting next calendar year (January 1st)');
      return;
    }
    navigate('/executive-employee-submit-loapproval');
  };

  // Handle request authorization letter - Navigate to authorization page
  const handlerequestauthorization = () => {
    // Check annual limit for non-demo accounts
    if (!isDemoAccount && hasReachedAnnualLimit) {
      alert('Annual Limit Reached\n\nYou have already completed 1 request this year. You can only have 1 completed request per calendar year.\n\nYou may submit new requests:\n• After pending/rejected requests are resolved, or\n• Starting next calendar year (January 1st)');
      return;
    }
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

  // Helper functions similar to HRDashboard
  const getUserDisplayName = (user) => {
    if (!user) return "Loading...";
    return `${user.first_name} ${user.last_name}`;
  };

  const getUserInitials = (user) => {
    if (!user) return "?";
    return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`;
  };

  // Helper function to get profile picture URL
  const getProfilePictureUrl = (picturePath) => {
    if (!picturePath) return null;
    if (picturePath.startsWith('http')) return picturePath;
    if (picturePath.startsWith('data:')) return picturePath;
    const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${baseUrl}${picturePath}`;
  };

  // New dropdown handlers for HRDashboard style
  const handleUserClick = () => {
    setShowDropdownMenu(!showDropdownMenu);
  };

  const handleProfileClick = () => {
    setShowDropdownMenu(false);
    navigate('/executive-employee-profile');
  };

  const handleHistoryClick = () => {
    setShowDropdownMenu(false);
    navigate('/history');
  };

  const handleFAQClick = () => {
    setShowDropdownMenu(false);
    navigate('/faq');
  };

  const handleLogoutDropdownClick = () => {
    setShowDropdownMenu(false);
    logout();
    navigate('/loginpage', { replace: true });
  };

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileModal && !event.target.closest('.profile-modal-container')) {
        setShowProfileModal(false);
      }
      if (showDropdownMenu && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdownMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileModal, showDropdownMenu]);

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
            {/* User info with dropdown - Independent and fully responsive */}
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4 lg:right-6 xl:right-8 z-50" ref={dropdownRef}>
              <button
                onClick={handleUserClick}
                className="flex items-center gap-1 sm:gap-2 hover:opacity-80 transition cursor-pointer"
              >
                <span className="text-white text-sm sm:text-base font-medium hidden sm:block">{getUserDisplayName(user)}</span>
                <span className="text-white text-xs font-medium sm:hidden">
                  {getUserInitials(user)}
                </span>
                {user?.profile_picture || user?.profilePic ? (
                  <img
                    src={getProfilePictureUrl(user.profile_picture || user.profilePic) || ProfileGray}
                    alt={`${getUserDisplayName(user)} profile`}
                    className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full object-cover border border-white"
                  />
                ) : (
                  <img
                    src={ProfileGray}
                    alt="Default profile"
                    className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full object-cover border border-white"
                  />
                )}
              </button>

              {/* Dropdown Menu - Responsive width and positioning */}
              {showDropdownMenu && (
                <div className="absolute top-full right-0 mt-2 w-32 sm:w-36 md:w-40 bg-white rounded-2xl shadow-xl border border-gray-200 z-[60]">
                  <div className="py-1">
                    <button
                      onClick={handleProfileClick}
                      className="w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm text-[#023184] hover:bg-gray-100 hover:rounded-2xl transition flex items-center gap-2 sm:gap-3 cursor-pointer"
                    >
                      <img src={ProfileIcon} alt="" className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Profile</span>
                    </button>
                    <button
                      onClick={handleHistoryClick}
                      className="w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm text-[#023184] hover:bg-gray-100 hover:rounded-2xl transition flex items-center gap-2 sm:gap-3 cursor-pointer"
                    >
                      <img src={ClockIcon} alt="" className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>History</span>
                    </button>
                    <button
                      onClick={handleFAQClick}
                      className="w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm text-[#023184] hover:bg-gray-100 hover:rounded-2xl transition flex items-center gap-2 sm:gap-3 cursor-pointer"
                    >
                      <FAQIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#023184]" />
                      <span>FAQ</span>
                    </button>
                    <button
                      onClick={handleLogoutDropdownClick}
                      className="w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm text-[#023184] hover:bg-gray-100 hover:rounded-2xl transition flex items-center gap-2 sm:gap-3 cursor-pointer"
                    >
                      <img src={LogoutIcon} alt="" className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <GreetingStatusCard
              firstName={user?.first_name || "User"}
              lastName={user?.last_name || ""}
              requestStatus={statusDisplay}
              onChevronClick={handleChevronClick}
            />

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
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-2xl hover:bg-gray-300 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition cursor-pointer"
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
            className="ml-2 text-red-900 hover:text-red-700 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="py-8 sm:py-12 px-4 sm:px-8">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 sm:gap-6 lg:gap-12 max-w-5xl mx-auto">
          <div className="w-full sm:w-1/2 sm:max-w-xs lg:max-w-sm">
            <ActionButton
              label={
                <div className="flex flex-col items-center justify-center gap-1">
                  <span className="text-sm sm:text-base md:text-lg font-bold">Request</span>
                  <span className="text-sm sm:text-base md:text-lg font-bold">Letter of Approval</span>
                  <img src={Approval} alt="approval" className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16" />
                </div>
              }
              backgroundImage={ApprovalBg}
              onClick={handleapprovalrequest}
              hoverText="Click To Submit Letter of Approval"
            />
          </div>

          <div className="w-full sm:w-1/2 sm:max-w-xs lg:max-w-sm">
            <ActionButton
              label={
                <div className="flex flex-col items-center justify-center gap-1">
                  <span className="text-sm sm:text-base md:text-lg font-bold">Request</span>
                  <span className="text-sm sm:text-base md:text-lg font-bold">Letter of Authorization</span>
                  <img src={Authorization} alt="authorization" className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16" />
                </div>
              }
              backgroundImage={AuthorizationBg}
              onClick={handlerequestauthorization}
              hoverText="Click To Submit Letter of Authorization"
            />
          </div>
        </div>

        {/* Help Section - Below Action Buttons */}
        <div className="flex items-center justify-center gap-2 mt-6 sm:mt-8">
          <div className="relative">
            <button
              onMouseEnter={() => setShowHelpTooltip(true)}
              onMouseLeave={() => setShowHelpTooltip(false)}
              className="text-gray-600 hover:text-[#023184] transition-colors"
              aria-label="Help information"
            >
              <HelpCircle className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>

            {/* Responsive Tooltip */}
            {showHelpTooltip && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3
                w-[280px] sm:w-[320px] md:w-[380px] lg:w-[420px]
                bg-white text-gray-800 rounded-xl shadow-2xl
                p-3 sm:p-4 md:p-5 z-50 border-2 border-blue-200">
                <div className="space-y-2 sm:space-y-3">
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm md:text-base text-blue-900 mb-1">
                      Letter of Approval
                    </h4>
                    <p className="text-[10px] sm:text-xs md:text-sm text-gray-700 leading-relaxed">
                      Request for approval to undergo your annual medical check-up at an accredited hospital selected by HR.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm md:text-base text-blue-900 mb-1">
                      Letter of Authorization
                    </h4>
                    <p className="text-[10px] sm:text-xs md:text-sm text-gray-700 leading-relaxed">
                      Request authorization to undergo your annual medical check-up at your preferred hospital of choice.
                    </p>
                  </div>
                </div>
                {/* Arrow pointer */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                  <div className="w-3 h-3 bg-white border-b-2 border-r-2 border-blue-200 transform rotate-45"></div>
                </div>
              </div>
            )}
          </div>

          <a
            href="/faq"
            className="text-sm sm:text-base md:text-lg text-gray-600 hover:text-[#023184] underline transition-colors cursor-pointer font-medium"
          >
            Need Help?
          </a>
        </div>
      </div>
    </div>
  );
}