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

// Import MockUsers data
import { USERS_DATABASE } from '@/webpages/MockUsers.jsx'; // Adjust path as needed

const COLORS = {
  ombre: ["#3F6EC0", "#00539F", "#5D3EA4", "#7940A8"],
  blue: "#00539F",
  purple: "#5D3EA4",
};

// ActionButton Component
function ActionButton({ label, color, onClick, backgroundImage, hoverText }) {
  return (
    <button
      className="text-white font-semibold rounded-4xl 
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
function GreetingStatusCard({ firstName, lastName, requestStatus, onChevronClick }) {
  const fullName = `${firstName} ${lastName}`;
  
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Mobile & Tablet: Vertical Layout */}
      <div className="flex flex-col lg:hidden space-y-6 sm:space-y-8 mt-6 sm:mt-8">
        
        {/* Logo and Greeting Section */}
        <div className="text-center">
          <div className="flex flex-col items-center space-y-3 sm:space-y-4">
            <img
              src="src/assets/MetrobankLogo.svg"
              className="w-20 h-6 sm:w-28 sm:h-8 md:w-32 md:h-9"
              alt="Metrobank Logo"
            />
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                Hello, {firstName}!
              </h1>
              <p className="text-sm sm:text-base md:text-lg mt-1 sm:mt-2 px-4">
                Welcome to the MetroExecuCare Annual Executive Check-up Portal
              </p>
            </div>
          </div>
        </div>

        {/* Status Section */}
        <div className="bg-white text-gray-900 rounded-4xl shadow-xl/30 
        w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto h-auto min-h-[240px] sm:min-h-[280px] md:min-h-[320px] 
        text-center flex flex-col justify-center px-4 sm:px-6 md:px-8 py-3 sm:py-6 md:py-8">
          
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-900 pb-3 sm:pb-4 md:pb-6">
            Current Request Status
          </h2>

          {/* Status Pill */}
          <div
            className="font-bold rounded-full shadow-xl/20 px-4 sm:px-6 py-2 sm:py-3 md:py-2
            flex flex-col items-center justify-center border mx-auto 
            w-full max-w-[280px] sm:max-w-[320px] md:max-w-[360px] 
            min-h-[70px] sm:min-h-[80px] md:min-h-[90px] lg:min-h-[100px] mb-3 sm:mb-4 md:mb-6"
            style={requestStatus.pillStyle}
          >
            <div className="flex items-center justify-center mb-1">
              <img src={requestStatus.icon} alt="Status" className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 mr-2" />
              <span className="text-sm sm:text-base md:text-lg font-semibold text-center">{requestStatus.text}</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 text-center leading-tight px-2">{requestStatus.note}</p>
          </div>
          
          <button
            onClick={onChevronClick}
            className="bg-blue-700 text-white w-7 h-7 sm:w-8 sm:h-8 rounded-full hover:bg-blue-800 transition-colors
            flex items-center justify-center mx-auto"
          >
            <img src={ChevronRight} alt="Chevron Right" className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>   
        </div>
      </div>

      {/* Desktop: Horizontal Layout */}
      <div className="hidden lg:grid lg:grid-cols-2 w-full items-center mt-8 mb-2 gap-8">
        
        {/* Greeting Section */}
        <div>
          <div className="grid grid-flow-row gap-0 text-left">
            <div className="flex flex-col items-start mb-4">
              <img
                src="src/assets/MetrobankLogo.svg"
                className="w-40 h-10"
                alt="Metrobank Logo"
              />
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold">
              Hello, {firstName}!
            </h1>
            <p className="text-lg xl:text-xl mt-2">
              Welcome to the MetroExecuCare Annual Executive Check-up Portal
            </p>
          </div>
        </div>

        {/* Status Section */}
        <div className="bg-white text-gray-900 rounded-4xl shadow-xl/30 w-110 h-70 
        text-center flex flex-col justify-center xl:ml-15">
          
          <h2 className="text-2xl font-bold text-blue-900 pb-3">Current Request Status</h2>

          {/* Status Pill */}
          <div
            className="font-bold rounded-full shadow-xl/20 px-4 pt-2 pb-1 flex flex-col items-center border mx-auto w-60 h-20"
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
    </div>
  );
}

// Main Dashboard Component
export default function ExecutiveEmployeeDashboard() {
  const navigate = useNavigate();

  // Modal states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // User data state - now connected to MockUsers
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Current request status based on checkup_requests table schema
  const [currentRequest, setCurrentRequest] = useState({
    id: null,
    request_number: null,
    request_type: null,
    current_status: "submittedauthorization",
    priority_level: "normal",
    hospital_id: null,
    hospital_name: null,
    preferred_date: null,
    additional_notes: null,
    letter_purpose: null,
    medical_requirements: null
  });

  // Load user data from MockUsers or localStorage
  useEffect(() => {
    const loadUserData = () => {
      try {
        // First, try to get user data from localStorage (from login)
        const storedUserData = localStorage.getItem('userData');
        const storedUserId = localStorage.getItem('currentUserId');
        
        let currentUser = null;

        if (storedUserData) {
          currentUser = JSON.parse(storedUserData);
        } else if (storedUserId) {
          // Find user by stored ID
          const userId = parseInt(storedUserId);
          currentUser = USERS_DATABASE.find(user => user.id === userId);
        } else {
          // Default to first executive employee for demo purposes
          currentUser = USERS_DATABASE.find(user => 
            user.position?.toLowerCase().includes('executive') || 
            user.role?.toLowerCase().includes('executive')
          ) || USERS_DATABASE[2]; // Fallback to Mike Johnson
        }

        if (currentUser) {
          setUserData({
            id: currentUser.id,
            employeeid: currentUser.employeeid,
            email: currentUser.email,
            firstName: currentUser.firstName,
            lastName: currentUser.lastName,
            middleName: currentUser.middleName || "",
            position: currentUser.position,
            role: currentUser.role,
            contact_number: currentUser.contact_number,
            address: currentUser.address || "Not specified",
            department: currentUser.department,
            branch: currentUser.branch,
            birthDate: currentUser.birthDate,
            profileImage: currentUser.profileImage,
            created_at: currentUser.created_at
          });
        } else {
          // If no user found, redirect to login
          console.error('No user data found');
          navigate('/loginpage');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        navigate('/loginpage');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [navigate]);

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

  // Handle chevron click - Navigate to LOA status tracker with current data
  const handleChevronClick = () => {
    if (!userData) return;

    // Determine request type based on current status
    let requestType = "Letter of Authorization";
    if (currentRequest.current_status === "submittedapproval") {
      requestType = "Letter of Approval";
    } else if (currentRequest.current_status === "submittedauthorization") {
      requestType = "Letter of Authorization";
    }

    // Pass complete request data through navigation state
    navigate('/loa-status-tracker', {
      state: {
        requestDetails: {
          request_type: requestType,
          request_id: currentRequest.id || 12345,
          requested_on: new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          requested_by: `${userData.firstName} ${userData.lastName}`,
          current_status: currentRequest.current_status,
          request_number: currentRequest.request_number || `REQ-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
          priority_level: currentRequest.priority_level,
          hospital_name: currentRequest.hospital_name,
          preferred_date: currentRequest.preferred_date,
          additional_notes: currentRequest.additional_notes,
          letter_purpose: currentRequest.letter_purpose,
          medical_requirements: currentRequest.medical_requirements
        }
      }
    });
  };

  // Modal handlers
  const handleUserProfile = () => {
    setShowProfileModal(!showProfileModal);
  };

  const handleProfileNavigation = () => {
    // Pass user data to profile page
    navigate('/executive-employee-profile', {
      state: { userData }
    });
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
    localStorage.removeItem('currentUserId');
    
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

  // ✅ Function to simulate status changes (for testing)
  const changeStatus = (newStatus) => {
    setCurrentRequest(prev => ({
      ...prev,
      current_status: newStatus
    }));
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // If no user data, show error
  if (!userData) {
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Unable to load user data</p>
          <button 
            onClick={() => navigate('/loginpage')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  const statusDisplay = getStatusDisplay(currentRequest.current_status);

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      {/* 🧪 Testing Controls - Remove in production */}
      <div className="bg-yellow-100 p-2 text-xs text-center overflow-x-auto">
        <strong>Testing Controls:</strong>
        <div className="flex flex-wrap justify-center gap-1 mt-1">
          <button onClick={() => changeStatus('no_request')} className="px-2 py-1 bg-gray-200 rounded text-xs">No Request</button>
          <button onClick={() => changeStatus('submittedapproval')} className="px-2 py-1 bg-green-200 rounded text-xs">Submitted Approval</button>
          <button onClick={() => changeStatus('submittedauthorization')} className="px-2 py-1 bg-green-200 rounded text-xs">Submitted Auth</button>
          <button onClick={() => changeStatus('awaitingbso')} className="px-2 py-1 bg-blue-200 rounded text-xs">Awaiting BSO</button>
          <button onClick={() => changeStatus('awaitingba')} className="px-2 py-1 bg-blue-200 rounded text-xs">Awaiting BA</button>
          <button onClick={() => changeStatus('awaitingdh')} className="px-2 py-1 bg-blue-200 rounded text-xs">Awaiting DH</button>
          <button onClick={() => changeStatus('completed')} className="px-2 py-1 bg-green-200 rounded text-xs">Completed</button>
          <button onClick={() => changeStatus('rejected')} className="px-2 py-1 bg-red-200 rounded text-xs">Rejected</button>
        </div>
      </div>

      {/* Top Section */}
      <div
        className="relative text-white flex flex-col justify-center items-center shadow-2xl 
        p-4 sm:p-6 lg:p-8 min-h-[70vh] sm:min-h-[65vh] lg:min-h-[58vh]"
        style={{
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
        <div className="absolute top-4 right-4 flex items-center space-x-2 profile-modal-container">
          <div className="text-right mr-2 hidden sm:block">
            <div className="text-xs font-medium">{userData.firstName} {userData.lastName}</div>
            {/* <div className="text-xs opacity-75">{userData.position}</div> */}
          </div>
          <button
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-white hover:opacity-80 transition m-0"
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
            <div className="absolute top-full right-0 mt-2 w-26 bg-white rounded-2xl shadow-xl border border-gray-200 z-50">
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-3xl shadow-lg text-center w-full max-w-sm">
            <div className="flex items-center gap-3 mb-3 justify-center">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <img src={LogoutRed} alt="Logout" className="w-3 h-3" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Confirm Logout</h3>
            </div>
            <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleCancelLogout}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-2xl hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-center lg:justify-center 
      lg:space-x-8 xl:space-x-16 2xl:space-x-[151px] 
      my-6 sm:my-8 lg:my-10 px-4 sm:px-6 lg:px-8 space-y-4 lg:space-y-0 max-w-7xl mx-auto">
        
        <ActionButton
          label={
            <div className="flex flex-col items-center justify-center text-center h-full w-full px-2">
              {/* Mobile: Single line */}
              <span className="sm:hidden text-xs font-semibold leading-tight block mb-2">
                Request Letter of Approval
              </span>
              {/* Tablet and up: Two lines */}
              <div className="hidden sm:flex flex-col items-center space-y-0 sm:space-y-1 mb-2 sm:mb-3">
                <span className="text-sm md:text-base lg:text-lg font-semibold leading-tight block">Request</span>
                <span className="text-sm md:text-base lg:text-lg font-semibold leading-tight block">Letter of Approval</span>
              </div>
              <img src={Approval} alt="approval" className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 flex-shrink-0" />
            </div>
          }
          backgroundImage={ApprovalBg}
          onClick={handleapprovalrequest}
          hoverText="Click To Submit Letter of Approval"
        />

        <ActionButton
          label={
            <div className="flex flex-col items-center justify-center text-center h-full w-full px-2">
              {/* Mobile: Single line */}
              <span className="sm:hidden text-xs font-semibold leading-tight block mb-2">
                Request Letter of Authorization
              </span>
              {/* Tablet and up: Two lines */}
              <div className="hidden sm:flex flex-col items-center space-y-0 sm:space-y-1 mb-2 sm:mb-3">
                <span className="text-sm md:text-base lg:text-lg font-semibold leading-tight block">Request</span>
                <span className="text-sm md:text-base lg:text-lg font-semibold leading-tight block">Letter of Authorization</span>
              </div>
              <img src={Authorization} alt="authorization" className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 flex-shrink-0" />
            </div>
          }
          backgroundImage={AuthorizationBg}
          onClick={handlerequestauthorization}
          hoverText="Click To Submit Letter of Authorization"
        />
      </div>
    </div>
  );
}