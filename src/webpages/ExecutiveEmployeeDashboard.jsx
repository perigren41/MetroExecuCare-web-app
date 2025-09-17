import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
      className="text-white font-semibold p-4 rounded-4xl sm:h-20 w-110 md:h-42 shadow-md flex items-center 
      justify-center space-x-4 transition transform active:scale-[.98] mb-4 sm:mt-2 md:mt-4"
      style={{ 
        backgroundColor: color || "transparent",
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
        backgroundSize: "cover",       // 👈 change this to "contain" or custom size
        backgroundRepeat: "no-repeat", // 👈 prevent repeating
        backgroundPosition: "center",  // 👈 center the image
        
      }}
      onClick={onClick}
      onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.05)")}
      onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}
    >
      <span className="text-lg">{label}</span>
    </button>
  );
}

// GreetingStatusCard Component
function GreetingStatusCard({ firstName, lastName, requestStatus, onChevronClick }) {
  const fullName = `${firstName} ${lastName}`;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 w-full items-center mt-8 mb-2 md:mx-15 gap-8">
      {/* Greeting Section */}
      <div>
        <div className="grid grid-flow-row md:grid-flow-col grid-rows-3 md:flex-row max-w-8xl gap-0 text-center md:text-left my-0">
          <div className="flex flex-col items-center md:items-start">
            <img
              src="src/assets/MetrobankLogo.svg"
              className="sm:w-25 h-8 md:w-40 md:h-10"
              alt="Metrobank Logo"
            />
          </div>
          <h1 className="sm:text-4xl text-3xl font-bold text-center md:text-left">
            Hello, {firstName}!
          </h1>
          <p className="sm:text-xs md:text-lg text-center md:text-left">
            Welcome to the MetroExecuCare Annual Executive Check-up Portal
          </p>
        </div>
      </div>

      {/* Status Section */}
      <div className="bg-white text-gray-900 rounded-4xl shadow-xl/30 w-110 h-70 mt-0 md:mt-0 text-center 
      flex flex-col justify-center mx-auto ml-1 sm:ml-15 table-fixed">
        {/* Inside Status Section */}
        <h2 className="text-2xl font-bold pb-3 ">Current Request Status</h2>

        {/* Status Pill */}
        <div
          className="font-bold rounded-full shadow-xl/20 px-4 py-2 flex flex-col items-center border mx-auto w-60 h-21"
          style={requestStatus.pillStyle}
        >
          <div className="flex items-center">
            <img src={requestStatus.icon} alt="Status" className="w-10 h-10 mr-1" />
            <span>{requestStatus.text}</span>
          </div>
          <p className="text-xs text-gray-500 flex flex-col">{requestStatus.note}</p>
        </div>  
        <button
          onClick={onChevronClick}
          className="bg-blue-700 text-white w-6 h-6 rounded-full hover:bg-blue-800 transition 
          flex items-center justify-center mx-auto mt-3"
            >
          <img src={ChevronRight} alt="Chevron Right" className="w-3 h-3" />
          </button>   
      </div>
    </div>
  );
}

// Main Dashboard Component
export default function ExecutiveEmployeeDashboard() {
  const navigate = useNavigate();

  // Modal states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Mock user data based on users table schema
  const [userData] = useState({
    id: 1,
    employeeid: "EMP001",
    email: "thor.odinson@metrobank.com",
    firstName: "Thor",
    lastName: "Odinson",
    middleName: "God",
    position: "Senior Executive",
    contact_number: "+63-123-456-7890",
    address: "Asgard, Nine Realms"
  });

  // Current request status based on checkup_requests table schema
  const [currentRequest, setCurrentRequest] = useState({
    id: null,
    request_number: null,
    request_type: null, // enum values could be 'annual_checkup', 'medical_clearance', etc.
    current_status: "submittedauthorization", // enum: submittedapproval,submittedauthorization, rejected, completed, awaitingbso, awaitingba, awaitingdh, no_request
    priority_level: "normal", // enum: low, normal, high, urgent
    hospital_id: null,
    hospital_name: null,
    preferred_date: null,
    additional_notes: null,
    letter_purpose: null,
    medical_requirements: null
  });

  // Status display configuration
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
      
      awaitingbso: {
        text: "Waiting for approval",
        note: "Benefit Service Officer under review",
        icon: ClockSquare,
        pillStyle: {
          backgroundColor: "#DBECFF",
          color: COLORS.blue,
          borderColor: "#B3D6FF",
          boxShadow: "#B3D6FF",
        },
      },
      awaitingba: {
        text: "Waiting for approval",
        note: "Benefits Assistant under review",
        icon: ClockSquare,
        pillStyle: {
          backgroundColor: "#DBECFF",
          color: COLORS.blue,
          borderColor: "#B3D6FF",
          boxShadow: "#B3D6FF",
        },
      },
        awaitingdh: {
        text: "Waiting for approval",
        note: "Division Head under review",
        icon: ClockSquare,
        pillStyle: {
          backgroundColor: "#DBECFF",
          color: COLORS.blue,
          borderColor: "#B3D6FF",
          boxShadow: "#B3D6FF",
        },
      },
      submittedapproval: {
        text: "Request Submitted",
        note: "Submitted Letter of Approval",
        icon: CheckSquare,
        pillStyle: {
          backgroundColor: "#D1FAE5",
          color: "#059669",
          borderColor: "#A7F3D0",
          boxShadow: "#A7F3D0",
        },
      },
      submittedauthorization: {
        text: "Request Submitted",
        note: "Submitted Letter of Authorization",
        icon: CheckSquare,
        pillStyle: {
          backgroundColor: "#D1FAE5",
          color: "#059669",
          borderColor: "#A7F3D0",
          boxShadow: "#A7F3D0",
        },
      },
      completed: {
        text: "Request Completed",
        note: "Your request has been completed",
        icon: CheckSquare,
        pillStyle: {
          backgroundColor: "#D1FAE5",
          color: "#059669",
          borderColor: "#A7F3D0",
          boxShadow: "#A7F3D0",
        },
      },
      rejected: {
        text: "Rejected",
        note: "Please review and resubmit",
        icon: XSquare,
        pillStyle: {
          backgroundColor: "#FEE2E2",
          color: "#DC2626",
          borderColor: "#FECACA",
          boxShadow: "#FECACA",
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

  // Handle chevron click - Navigate to LOA status tracker
  const handleChevronClick = () => {
    navigate('/loa-status-tracker');
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
    // Clear any stored authentication data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    
    // Navigate to login page
    navigate('/loginpage');
    
    // Close modal
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
        className="relative text-white flex flex-col md:flex-row justify-between items-center shadow-2xl p-6 sm:p-8 sm:pr-30 sm:pl-30"
        style={{
          minHeight: "58vh",
          background: `linear-gradient(90deg, 
            ${COLORS.ombre[0]} 0%, 
            ${COLORS.ombre[1]} 25%, 
            ${COLORS.ombre[2]} 60%, 
            ${COLORS.ombre[3]} 100%)`,
        }}
      >
        {/* Main Content */}
        <GreetingStatusCard 
          firstName={userData.firstName} 
          lastName={userData.lastName}
          requestStatus={statusDisplay} 
          onChevronClick={handleChevronClick}
        />

        {/* Top Right - User Profile */}
        <div className="absolute top-4 right-4 flex items-center space-x-2 md:mr-16 sm:mr-4 profile-modal-container">
          <span className="text-xs">{userData.firstName} {userData.lastName}</span>
          <button
            className="w-8 h-8 rounded-full overflow-hidden border border-white hover:opacity-80 transition"
            onClick={handleUserProfile}
          >
            <img
              src={userData.profileImage || "https://via.placeholder.com/40"}
              alt="profile"
              className="w-full h-full object-cover"
            />
          </button>

          {/* Profile Modal Dropdown */}
          {showProfileModal && (
            <div className="absolute top-full right-0 mt-2 w-28 bg-white rounded-2xl shadow-xl border border-gray-200 z-50">
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

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center sm:space-x-[151px] my-10 px-4 sm:mb-8 
      space-y-4 sm:space-y-4">
        <ActionButton
          label={
        <div className="flex flex-col items-center text-center">
          <span className="text-lg font-semibold">Request</span>
          <span className="text-lg font-semibold">Letter of Approval</span>
          <img src={Approval} alt="approval" className="w-16 h-16 mt-2" />
        </div>
  }
          backgroundImage={ApprovalBg}   // ✅ background SVG
          onClick={handleapprovalrequest}
        />

        <ActionButton
          label={
            <div className="flex flex-col items-center text-center">
              <span className="text-lg font-semibold">Request</span>
              <span className="text-lg font-semibold">Letter of Authorization</span>
              <img src={Authorization} alt="authorization" className="w-16 h-16 mt-2" />
            </div>
          }
          backgroundImage={AuthorizationBg}
          onClick={handlerequestauthorization}
        />
      </div>
    </div>
  );
}