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
    if (location.pathname.includes("executive-employee")) {
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
        className="relative flex items-center justify-between px-6 py-1 
        bg-[linear-gradient(to_right,#3F6EC0_2%,#00539F_30%,#5D3EA4_50%,#7940A8_75%)] 
        text-white md:pl-16 sm:pl-2 sm:pr-2"
      >
        {/* Left - Back Button or Empty Space */}
        <div className="relative w-5 h-5 flex items-center justify-center">
          {shouldShowBackButton() && (
            <button 
              className="w-5 h-5 flex items-center justify-center rounded-lg bg-white border border-white hover:bg-gray-100 transition" 
              onClick={handleClick}
            >
              <img src={BackButtonBlue} alt="Back" className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Center - Logo + Text */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <h1 className="text-base font-semibold flex items-center gap-0">
            <img src={mainLogo} alt="MetroExecuCare Logo" className="w-8 h-9" />
            MetroExecuCare
          </h1>
        </div>

        {/* Right - Name + Circle Image */}
        <div className="relative flex items-center space-x-1 md:pr-14 sm:pr-4" ref={dropdownRef}>
          <span className="text-xs">{user.name}</span>
          <button 
            className="w-6 h-6 rounded-full overflow-hidden border border-white hover:opacity-80 transition m-0" 
            onClick={handleUserClick}
          >
            <img
              src={user.profileImage || "https://via.placeholder.com/40"}
              alt="profile"
              className="w-full h-full object-cover"
            />
          </button>

          {/* Dropdown Modal */}
          {showDropdown && shouldShowDropdown() && (
            <div className="absolute top-full right-0 mt-2 w-26 bg-white rounded-2xl shadow-xl border border-gray-200 z-50">
              
              <div className="py-1">
                {/* Profile option - show on dashboard and submit pages, not on profile pages */}
                {shouldShowProfileOption() && (
                  <button
                    onClick={handleProfileClick}
                    className="w-full px-4 py-1 text-left text-sm text-blue-700 hover:bg-gray-200 hover:rounded-2xl transition flex items-center gap-2"
                  >
                    <img src={ProfileBlueSolid} alt="Profile Icon" className="w-4 h-4" />
                    <span>Profile</span>
                  </button>
                )}
                {/* Logout option - always show on all dropdown pages */}
                <button
                  onClick={handleLogoutClick}
                  className="w-full px-4 py-1 text-left text-sm text-blue-700 hover:bg-gray-200 hover:rounded-2xl transition flex items-center gap-2"
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
          <div className="bg-white p-6 rounded-3xl shadow-lg text-center w-80 ">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <img src={LogoutRed} alt="Logout" className="w-3 h-3" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Confirm Logout</h3>
            </div>
            <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={cancelLogout}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-2xl hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition"
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