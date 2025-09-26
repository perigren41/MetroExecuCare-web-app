import React, { useState, useRef, useEffect } from "react";
import mainLogo from "@/assets/mainLogo-foreground.svg";
import { useNavigate, useLocation } from "react-router-dom";
import ProfileBlueSolid from "@/assets/profilebluesolid.svg";
import LogoutBlueSolid from "@/assets/logoutbluesolid.svg";
import BackButtonBlue from "@/assets/BackButtonBlue.svg";
import LogoutRed from "@/assets/logoutred.svg";

export default function Navbar({ currentUser, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const dropdownRef = useRef(null);

  // Default user data if currentUser is not passed
  const user = currentUser || {
    id: 1,
    employeeid: "ADM001",
    name: "John Doe",
    position: "Admin",
    role: "Admin",
    email: "john.doe@example.com",
    contact_number: "09171234567",
    department: "IT",
    birthDate: "1995-04-15",
    created_at: "2023-08-15",
    profileImage: "https://i.pravatar.cc/100?img=1",
    username: "admin",
    password: "1234",
    branch: "Metrobank Fort - Ecoprime Tower"
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleClick = () => {
    if (location.pathname === "/admin-users-page") {
      // If already on adminpage → Logout
      setShowLogoutModal(true);
    } else if (location.pathname === "/admin-profile-page") {
      // If in admin profile page → go back to adminpage
      navigate("/admin-users-page");
    } else if (location.pathname === "/executive-employee-submit-loauthorization") {
      // If in executive employee submit page → go back to dashboard
      navigate("/executive-employee-dashboard");
    } else if (location.pathname === "/executive-employee-submit-loapproval") {
      // If in executive employee submit page → go back to dashboard
      navigate("/executive-employee-dashboard");
    } else if (location.pathname === "/executive-employee-profile") {
      // If in executive employee profile page → go back to dashboard
      navigate("/executive-employee-dashboard");
    } else if (location.pathname === "/loa-status-tracker") {
      // If in LOA status tracker page → go back to dashboard
      navigate("/executive-employee-dashboard");
    } else {
      // Default fallback
      navigate("/admin-users-page");
    }
  };

  const handleProfileClick = () => {
    // Navigate to appropriate profile page based on current location
    if (location.pathname.includes("executive-employee-dashboard")) {
      navigate("/executive-employee-profile");
    } 
    else if (location.pathname.includes("loa-status-tracker")) {
      navigate("/executive-employee-profile");
    } else {
      navigate("/admin-profile-page");
    }
    setShowDropdown(false);
  };

  const handleLogoutClick = () => {
    setShowDropdown(false);
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    // Call onLogout callback if provided
    if (onLogout) {
      onLogout();
    }
    navigate("/loginpage", { replace: true });
    setShowLogoutModal(false);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleUserClick = () => {
    // Show dropdown on admin pages and executive employee pages
    const showDropdownPages = [
      "/admin-users-page",
      "/admin-profile-page",
      "/executive-employee-dashboard",
      "/executive-employee-submit-loauthorization",
      "/executive-employee-submit-loapproval",
      "/executive-employee-profile",
      "/loa-status-tracker",
    ];
    
    if (showDropdownPages.includes(location.pathname)) {
      setShowDropdown(!showDropdown);
    }
  };

  const shouldShowBackButton = () => {
    return location.pathname === "/admin-profile-page" || 
           location.pathname === "/executive-employee-submit-loauthorization" ||
           location.pathname === "/executive-employee-submit-loapproval" ||
           location.pathname === "/executive-employee-profile" ||
           location.pathname === "/loa-status-tracker";
  };

  const shouldShowDropdown = () => {
    const dropdownPages = [
      "/admin-users-page",
      "/admin-profile-page",
      "/executive-employee-dashboard",
      "/executive-employee-submit-loauthorization",
      "/executive-employee-submit-loapproval",
      "/executive-employee-profile",
      "/loa-status-tracker"
    ];
    return dropdownPages.includes(location.pathname);
  };

  const shouldShowProfileOption = () => {
    // Show profile option on dashboard pages, not on profile pages themselves
    return location.pathname === "/admin-users-page" || 
           location.pathname === "/executive-employee-dashboard" ||
           location.pathname === "/executive-employee-submit-loauthorization" ||
           location.pathname === "/executive-employee-submit-loapproval" ||
           location.pathname === "/loa-status-tracker";
  };

  return (
    <>
      <div
        className="relative flex items-center justify-between 
                   px-2 md:px-4 lg:px-6 
                   py-2 sm:py-3 md:py-4
                   bg-[linear-gradient(to_right,#3F6EC0_2%,#00539F_30%,#5D3EA4_50%,#7940A8_75%)] 
                   text-white"
      >
        {/* Left - Back Button or Empty Space */}
        <div className="relative w-6 h-6 md:w-8 md:h-8 flex items-center justify-center flex-shrink-0">
          {shouldShowBackButton() && (
            <button 
              className="w-6 h-6 md:w-8 md:h-8 
                        flex items-center justify-center rounded-full 
                        bg-white border border-white hover:bg-gray-100 
                        transition-colors duration-200 touch-manipulation" 
              onClick={handleClick}
            >
              <img src={BackButtonBlue} alt="Back" className="w-3 h-3 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5" />
            </button>
          )}
        </div>

        {/* Center - Logo + Text */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center">
          <h1 className="text-sm md:text-md lg:text-lg font-semibold 
                        flex items-center gap-1 sm:gap-2">
            <img 
              src={mainLogo} 
              alt="MetroExecuCare Logo" 
              className="w-5 h-5 sm:w-6 sm:h-7 md:w-8 md:h-9 flex-shrink-0" 
            />
            <span className="whitespace-nowrap">MetroExecuCare</span>
          </h1>
        </div>

        {/* Right - Name + Circle Image */}
        <div className="relative flex items-center space-x-1 sm:space-x-2 flex-shrink-0" ref={dropdownRef}>
          <span className="text-xs sm:text-sm md:text-base truncate max-w-20 sm:max-w-24 md:max-w-32 lg:max-w-none">
            {user.name}
          </span>
          <button 
            className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 
                      rounded-full overflow-hidden border border-white 
                      hover:opacity-80 transition-opacity duration-200 
                      touch-manipulation flex-shrink-0 m-0" 
            onClick={handleUserClick}
          >
            <img
              src={user.profileImage || "https://via.placeholder.com/40"}
              alt="profile"
              className="w-full h-full object-cover"
            />
          </button>

          {/* Dropdown Modal - Responsive */}
          {showDropdown && shouldShowDropdown() && (
            <div className="absolute top-full right-0 mt-2 
                          w-20 sm:w-20 md:w-26 
                          bg-white rounded-xl sm:rounded-2xl 
                          shadow-xl border border-gray-200 z-50
                          transform sm:transform-none">
              
              <div className="py-1 sm:py-2">
                {/* Profile option - show on dashboard and submit pages, not on profile pages */}
                {shouldShowProfileOption() && (
                  <button
                    onClick={handleProfileClick}
                    className="w-full px-2 sm:px-3 md:px-4 py-1 sm:py-2 
                              text-left text-xs sm:text-sm 
                              text-blue-700 hover:bg-gray-200 
                              hover:rounded-xl sm:hover:rounded-2xl 
                              transition-colors duration-200 
                              flex items-center gap-1 sm:gap-2 touch-manipulation"
                  >
                    <img 
                      src={ProfileBlueSolid} 
                      alt="Profile Icon" 
                      className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" 
                    />
                    <span>Profile</span>
                  </button>
                )}
                
                {/* Logout option - always show on all dropdown pages */}
                <button
                  onClick={handleLogoutClick}
                  className="w-full px-2 sm:px-3 md:px-4 py-1 sm:py-2 
                            text-left text-xs sm:text-sm 
                            text-blue-700 hover:bg-gray-200 
                            hover:rounded-xl sm:hover:rounded-2xl 
                            transition-colors duration-200 
                            flex items-center gap-1 sm:gap-2 touch-manipulation"
                >
                  <img 
                    src={LogoutBlueSolid} 
                    alt="Logout" 
                    className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" 
                  />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Logout Confirmation Modal - Responsive */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 sm:p-6 md:p-8 
                         rounded-2xl sm:rounded-3xl shadow-lg 
                         text-center w-full max-w-xs sm:max-w-sm md:max-w-md
                         mx-4">
            
            {/* Header */}
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 justify-center sm:justify-start">
              <div className="w-8 h-8 sm:w-10 sm:h-10 
                            bg-red-100 rounded-full 
                            flex items-center justify-center flex-shrink-0">
                <img 
                  src={LogoutRed} 
                  alt="Logout" 
                  className="w-3 h-3 sm:w-4 sm:h-4" 
                />
              </div>
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">
                Confirm Logout
              </h3>
            </div>
            
            {/* Message */}
            <p className="text-gray-600 mb-4 sm:mb-6 text-xs sm:text-sm md:text-base">
              Are you sure you want to logout?
            </p>
            
            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center items-center">
              <button
                onClick={cancelLogout}
                className="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 
                          bg-gray-200 text-gray-800 
                          rounded-xl sm:rounded-2xl 
                          hover:bg-gray-300 transition-colors duration-200
                          text-xs sm:text-sm md:text-base
                          touch-manipulation order-2 sm:order-1
                          "
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 
                          bg-red-600 text-white 
                          rounded-xl sm:rounded-2xl 
                          hover:bg-red-700 transition-colors duration-200
                          text-xs sm:text-sm md:text-base
                          touch-manipulation order-1 sm:order-2"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}