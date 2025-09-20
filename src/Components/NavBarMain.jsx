// components/NavBarMain.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import mainLogo from '../assets/mainLogo-foreground.svg';
import BackSquareIconWhite from '../assets/BackSquareIconWhite.svg';

// ✅ new imports
import ProfileIcon from '../assets/ProfileIcon.svg';
import LogoutIcon from '../assets/LogoutIcon.svg';
import AlertIcon from '../assets/AlertIcon.svg';
import HomeIcon from '../assets/HomeIconWhite.svg'; // Add this icon to your assets

const Navbar = ({
  user,
  onLogout = null,
  backButtonIcon = null,
  logo = null,
  showHomeButton = false, // New prop for showing home button
  customBackHandler = null, // Custom back handler
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const dropdownRef = useRef(null);

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

  const handleBackClick = () => {
    if (customBackHandler) {
      customBackHandler();
      return;
    }
    
    // Default back behavior
    navigate(-1);
  };

  const handleHomeClick = () => {
    // Navigate to appropriate dashboard based on user position
    if (user?.position === "Benefits Assistant" || 
        user?.position === "Benefits Services Officer" || 
        user?.position === "Division Head") {
      navigate("/hr-dashboard", { state: { user } });
    } else {
      navigate("/LOA_RecordSummary", { state: { user } });
    }
  };

  const handleProfileClick = () => {
    // Navigate to appropriate profile page based on user position
    if (user?.position === "Benefits Assistant" || 
        user?.position === "Benefits Services Officer" || 
        user?.position === "Division Head") {
      navigate("/profile", { state: { user } });
    } else {
      // For non-HR employees (if any), fallback to employee page
      navigate("/LOA_RecordSummary", { state: { user } });
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
    } else {
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('user');
      sessionStorage.clear();
    }
    navigate("/login", { replace: true });
    setShowLogoutModal(false);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleUserClick = () => {
    setShowDropdown(!showDropdown);
  };

  // Determine what to show in the left section
  const shouldShowBackButton = () => {
    return location.pathname !== "/hr-dashboard" && location.pathname !== "/LOA_RecordSummary";
  };

  const shouldShowHomeButton = () => {
    return showHomeButton || 
           location.pathname.startsWith("/loa-submit") || 
           location.pathname.startsWith("/loa-record-summary");
  };

  const shouldShowDropdown = () => {
    // Show dropdown on most pages except login
    return !location.pathname.includes("/login");
  };

  const shouldShowProfileOption = () => {
    // Show profile option everywhere except on profile page itself
    return location.pathname !== "/profile";
  };

  return (
    <>
      <header
        className="w-full h-[56px] flex items-center justify-between px-6 py-1 relative md:px-[162px] sm:px-4"
        style={{
          background: "linear-gradient(to right, #3F6EC0, #00539F, #5D3EA4, #7940A8)",
        }}
      >
        {/* Left - Navigation Buttons */}
        <div className="flex items-center gap-2 min-w-[60px]">
          {shouldShowBackButton() && (
            <button
              onClick={handleBackClick}
              className="flex items-center cursor-pointer hover:opacity-80 transition"
              title="Go Back"
            >
              <img
                src={backButtonIcon || BackSquareIconWhite}
                alt="Back"
                className="w-[28px] h-[28px]"
              />
            </button>
          )}
          
          {shouldShowHomeButton() && (
  <button
    onClick={handleHomeClick}
    className="flex items-center cursor-pointer hover:opacity-80 transition ml-1"
    title="Go to Dashboard"
  >
    <img
      src={HomeIcon}
      alt="Home"
      className="w-[28px] h-[28px]"
    />
  </button>
)}
        </div>

        {/* Center - Logo */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center">
          <img
            src={logo || mainLogo}
            alt="MetroExecuCare Logo"
            className="h-[60px] w-[60px] object-contain"
          />
          <h1 className="text-white text-lg font-semibold">MetroExecuCare</h1>
        </div>

        {/* Right - User Name + Profile */}
        <div className="relative flex items-center" ref={dropdownRef}>
          <button
            onClick={handleUserClick}
            className="flex items-center gap-2 hover:opacity-80 transition cursor-pointer"
          >
            <span className="text-base font-medium text-white">{user?.name || 'User'}</span>
            {user?.profilePic ? (
              <img
                src={user.profilePic}
                alt={`${user.name} profile`}
                className="w-7 h-7 rounded-full object-cover border border-white"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs border border-white">
                {user?.name?.charAt(0) || 'U'}
              </div>
            )}
          </button>

          {/* Dropdown Modal */}
          {showDropdown && shouldShowDropdown() && (
            <div className="absolute top-full right-0 mt-2 w-28 bg-white rounded-2xl shadow-xl border border-gray-200 z-50">
              <div className="py-1">
                {/* Profile option */}
                {shouldShowProfileOption() && (
                  <button
                    onClick={handleProfileClick}
                    className="w-full px-4 py-2 text-left text-sm text-[#023184] hover:bg-gray-200 hover:rounded-2xl transition flex items-center gap-2"
                  >
                    <img src={ProfileIcon} alt="Profile" className="w-4 h-4" />
                    <span>Profile</span>
                  </button>
                )}
                {/* Logout option */}
                <button
                  onClick={handleLogoutClick}
                  className="w-full px-4 py-2 text-left text-sm text-[#023184] hover:bg-gray-200 hover:rounded-2xl transition flex items-center gap-2"
                >
                  <img src={LogoutIcon} alt="Logout" className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-3xl shadow-lg text-center w-80">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <img src={AlertIcon} alt="Alert" className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Confirm Logout</h3>
            </div>
            <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelLogout}
                className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-500 rounded-2xl transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-2xl transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;