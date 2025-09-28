import React, { useState, useRef, useEffect } from "react";
import mainLogo from "@/assets/mainLogo-foreground.svg";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ProfileBlueSolid from "@/assets/profilebluesolid.svg";
import LogoutBlueSolid from "@/assets/logoutbluesolid.svg";
import BackButtonBlue from "@/assets/BackButtonBlue.svg";
import LogoutRed from "@/assets/logoutred.svg";
import ProfileGray from "@/assets/profilegray.svg";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const dropdownRef = useRef(null);

  // Use authenticated user data or fallback
  const displayUser = user || {
    id: 1,
    employee_id: "GUEST001",
    first_name: "Guest",
    last_name: "User",
    position: "Guest",
    role: "guest",
    email: "guest@example.com",
    contact_number: "N/A",
    department: "N/A"
  };

  // Construct full name for display
  const fullName = user
    ? `${user.first_name} ${user.last_name}`.trim()
    : displayUser.first_name;

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

  // Helper function to get dashboard route based on user role
  const getDashboardRoute = () => {
    if (!user?.role) return "/loginpage";

    switch (user.role) {
      case 'executive':
        return "/executive-employee-dashboard";
      case 'hr_personnel':
        return "/hr-dashboard";
      case 'benefits_officer':
        return "/benefits-dashboard";
      case 'welfare_head':
        return "/welfare-dashboard";
      case 'admin':
        return "/admin-users-page";
      default:
        return "/loginpage";
    }
  };

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
    } else if (location.pathname === "/hr-profile" || location.pathname === "/benefits-profile" || location.pathname === "/welfare-profile") {
      // If in any HR-related profile page → go back to appropriate dashboard
      navigate(getDashboardRoute());
    } else if (location.pathname === "/hr-pending-requests" || location.pathname === "/benefits-pending-requests" || location.pathname === "/welfare-pending-requests") {
      // If in any HR-related pending requests page → go back to appropriate dashboard
      navigate(getDashboardRoute());
    } else if (location.pathname === "/hr-history" || location.pathname === "/benefits-history" || location.pathname === "/welfare-history") {
      // If in any HR-related history page → go back to appropriate dashboard
      navigate(getDashboardRoute());
    } else if (location.pathname.startsWith("/loa-submit/") || location.pathname.startsWith("/loa-record-summary/")) {
      // If in LOA submit or record summary → go back to appropriate dashboard
      navigate(getDashboardRoute());
    } else {
      // Default fallback - navigate to appropriate dashboard
      navigate(getDashboardRoute());
    }
  };

  const handleProfileClick = () => {
    // Navigate to appropriate profile page based on user role
    if (!user?.role) {
      navigate("/loginpage");
      setShowDropdown(false);
      return;
    }

    switch (user.role) {
      case 'executive':
        navigate("/executive-employee-profile");
        break;
      case 'hr_personnel':
        navigate("/hr-profile");
        break;
      case 'benefits_officer':
        navigate("/benefits-profile");
        break;
      case 'welfare_head':
        navigate("/welfare-profile");
        break;
      case 'admin':
        navigate("/admin-profile-page");
        break;
      default:
        navigate("/loginpage");
        break;
    }
    setShowDropdown(false);
  };

  const handleLogoutClick = () => {
    setShowDropdown(false);
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    // Use AuthContext logout function
    logout();
    navigate("/loginpage", { replace: true });
    setShowLogoutModal(false);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleUserClick = () => {
    // Show dropdown on admin pages, executive employee pages, and HR-related pages
    const showDropdownPages = [
      "/admin-users-page",
      "/admin-profile-page",
      "/executive-employee-dashboard",
      "/executive-employee-submit-loauthorization",
      "/executive-employee-submit-loapproval",
      "/executive-employee-profile",
      "/loa-status-tracker",
      "/hr-dashboard",
      "/benefits-dashboard",
      "/welfare-dashboard",
      "/hr-pending-requests",
      "/benefits-pending-requests",
      "/welfare-pending-requests",
      "/hr-history",
      "/benefits-history",
      "/welfare-history",
      "/hr-profile",
      "/benefits-profile",
      "/welfare-profile",
    ];

    // Also show dropdown for dynamic routes like /loa-submit/:id and /loa-record-summary/:id
    const isDynamicHRRoute = location.pathname.startsWith("/loa-submit/") ||
                           location.pathname.startsWith("/loa-record-summary/");

    if (showDropdownPages.includes(location.pathname) || isDynamicHRRoute) {
      setShowDropdown(!showDropdown);
    }
  };

  const shouldShowBackButton = () => {
    const backButtonPages = [
      "/admin-profile-page",
      "/executive-employee-submit-loauthorization",
      "/executive-employee-submit-loapproval",
      "/executive-employee-profile",
      "/loa-status-tracker",
      "/hr-profile",
      "/benefits-profile",
      "/welfare-profile",
      "/hr-pending-requests",
      "/benefits-pending-requests",
      "/welfare-pending-requests",
      "/hr-history",
      "/benefits-history",
      "/welfare-history",
    ];

    // Also show back button for dynamic routes
    const isDynamicHRRoute = location.pathname.startsWith("/loa-submit/") ||
                           location.pathname.startsWith("/loa-record-summary/");

    return backButtonPages.includes(location.pathname) || isDynamicHRRoute;
  };

  const shouldShowDropdown = () => {
    const dropdownPages = [
      "/admin-users-page",
      "/admin-profile-page",
      "/executive-employee-dashboard",
      "/executive-employee-submit-loauthorization",
      "/executive-employee-submit-loapproval",
      "/executive-employee-profile",
      "/loa-status-tracker",
      "/hr-dashboard",
      "/benefits-dashboard",
      "/welfare-dashboard",
      "/hr-pending-requests",
      "/benefits-pending-requests",
      "/welfare-pending-requests",
      "/hr-history",
      "/benefits-history",
      "/welfare-history",
      "/hr-profile",
      "/benefits-profile",
      "/welfare-profile",
    ];

    // Also show dropdown for dynamic routes
    const isDynamicHRRoute = location.pathname.startsWith("/loa-submit/") ||
                           location.pathname.startsWith("/loa-record-summary/");

    return dropdownPages.includes(location.pathname) || isDynamicHRRoute;
  };

  const shouldShowProfileOption = () => {
    // Show profile option on dashboard pages and other pages, but not on profile pages themselves
    const profilePages = ["/admin-profile-page", "/executive-employee-profile", "/hr-profile", "/benefits-profile", "/welfare-profile"];

    // Don't show profile option if we're already on a profile page
    if (profilePages.includes(location.pathname)) {
      return false;
    }

    const showProfilePages = [
      "/admin-users-page",
      "/executive-employee-dashboard",
      "/executive-employee-submit-loauthorization",
      "/executive-employee-submit-loapproval",
      "/loa-status-tracker",
      "/hr-dashboard",
      "/benefits-dashboard",
      "/welfare-dashboard",
      "/hr-pending-requests",
      "/benefits-pending-requests",
      "/welfare-pending-requests",
      "/hr-history",
      "/benefits-history",
      "/welfare-history",
    ];

    // Also show profile option for dynamic routes
    const isDynamicHRRoute = location.pathname.startsWith("/loa-submit/") ||
                           location.pathname.startsWith("/loa-record-summary/");

    return showProfilePages.includes(location.pathname) || isDynamicHRRoute;
  };

  return (
    <>
      <div
        className="relative flex items-center justify-between px-2 sm:px-4 md:px-6 py-2 md:py-3
        bg-[linear-gradient(to_right,#3F6EC0_2%,#00539F_30%,#5D3EA4_50%,#7940A8_75%)]
        text-white"
      >
        {/* Left - Back Button or Empty Space */}
        <div className="relative w-5 h-5 flex items-center justify-center flex-shrink-0">
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
        <div className="flex-1 flex items-center justify-center">
          <h1 className="text-sm sm:text-base font-semibold flex items-center gap-1">
            <img src={mainLogo} alt="MetroExecuCare Logo" className="w-6 h-7 sm:w-8 sm:h-9" />
            <span className="hidden xs:inline sm:inline">MetroExecuCare</span>
          </h1>
        </div>

        {/* Right - Name + Circle Image */}
        <div className="relative flex items-center space-x-1 flex-shrink-0" ref={dropdownRef}>
          <span className="text-xs hidden sm:inline truncate max-w-24">{fullName}</span>
          <button
            className="w-6 h-6 rounded-full overflow-hidden border border-white hover:opacity-80 transition m-0"
            onClick={handleUserClick}
          >
            <img
              src={user?.profile_picture_url || ProfileGray}
              alt="profile"
              className="w-full h-full object-cover"
            />
          </button>

          {/* Dropdown Modal */}
          {showDropdown && shouldShowDropdown() && (
            <div className="absolute top-full right-0 mt-2 w-28 bg-white rounded-2xl shadow-xl border border-gray-200 z-50">
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-lg text-center w-full sm:w-80 max-w-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <img src={LogoutRed} alt="Logout" className="w-3 h-3" />
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
}