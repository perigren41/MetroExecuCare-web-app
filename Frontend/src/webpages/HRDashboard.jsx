// HRDashboard.jsx (Fully Responsive - Complete)
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import apiService from "@/services/api";
import metrobankLogo from "@/assets/MetrobankLogo2.svg";
import PendingRequestsLogo from "@/assets/PendingRequestsLogo.svg";
import LOAppIcon from "@/assets/LOAppIcon.svg";
import LOAuthIcon from "@/assets/LOAuthIcon.svg";
import approvedIcon from "@/assets/ApprovedIcon.svg";
import rejectedIcon from "@/assets/RejectedIcon.svg";
import RoundArrowIconBlue from "@/assets/RoundArrowIconBlue.svg";
import RoundArrowIconWhite from "@/assets/RoundArrowIconWhite.svg";
import ProfileIcon from '../assets/ProfileIcon.svg';
import LogoutIcon from '../assets/LogoutIcon.svg';
import AlertIcon from '../assets/AlertIcon.svg';
import ProfileGray from '@/assets/profilegray.svg';


export default function HRDashboard() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    // State for dashboard data
    const [dashboardStats, setDashboardStats] = useState(null);
    const [claimedRequests, setClaimedRequests] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Helper function to get user display name
    const getUserDisplayName = (user) => {
        if (!user) return "Loading...";
        return `${user.first_name} ${user.last_name}`;
    };

    // Helper function to get user initials
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

    // Helper function to get the correct pending requests route based on user role
    const getPendingRequestsRoute = () => {
        if (!user?.role) return "/hr-pending-requests";

        switch (user.role) {
            case 'hr_personnel':
                return "/hr-pending-requests";
            case 'benefits_officer':
                return "/benefits-pending-requests";
            case 'welfare_head':
                return "/welfare-pending-requests";
            default:
                return "/hr-pending-requests";
        }
    };

    // Helper function to get the correct history route based on user role
    const getHistoryRoute = () => {
        if (!user?.role) return "/hr-history";

        switch (user.role) {
            case 'hr_personnel':
                return "/hr-history";
            case 'benefits_officer':
                return "/benefits-history";
            case 'welfare_head':
                return "/welfare-history";
            default:
                return "/hr-history";
        }
    };

    // Helper function to format request status for display
    const formatRequestStatus = (status) => {
        const statusMap = {
            'hr_processing': 'Human Resource Processing',
            'benefits_review': 'Benefits Officer Review',
            'welfare_review': 'Division Head Review',
            'hr_final_verification': 'Executive Clearance Review',
            'approved': 'Approved',
            'rejected': 'Rejected'
        };
        return statusMap[status] || status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    // Helper function to format request type for display
    const formatRequestType = (type) => {
        if (type === 'letter_of_authorization') return 'Letter of Authorization';
        if (type === 'letter_of_approval') return 'Letter of Approval';
        return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const [screenSize, setScreenSize] = useState('desktop');
    const [showDropdownMenu, setShowDropdownMenu] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const dropdownRef = useRef(null);

    // Fetch dashboard data with improved error handling
    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            console.log('HRDashboard: Starting to fetch dashboard data for user:', user);

            // Fetch claimed requests based on user role
            const claimedRequestsParams = {
                limit: 5,
                sort: 'created_at',
                order: 'desc'
            };

            // For HR Personnel, use assigned_hr_id filter
            if (user.role === 'hr_personnel') {
                claimedRequestsParams.status = 'hr_processing,benefits_review,welfare_review,hr_final_verification';
                claimedRequestsParams.assigned_hr_id = user.id;
            }
            // For Benefits Officer and Welfare Head, use claimed_by_me filter
            else if (user.role === 'benefits_officer') {
                claimedRequestsParams.status = 'benefits_review,welfare_review,hr_final_verification';
                claimedRequestsParams.claimed_by_me = 'true';
            } else if (user.role === 'welfare_head') {
                claimedRequestsParams.status = 'welfare_review,hr_final_verification';
                claimedRequestsParams.claimed_by_me = 'true';
            }

            const [claimedResponse, dashboardResponse] = await Promise.all([
                apiService.getRequests(claimedRequestsParams),
                apiService.getDashboardStats()
            ]);

            console.log('HRDashboard: Claimed response:', claimedResponse);
            console.log('HRDashboard: Dashboard response:', dashboardResponse);

            if (claimedResponse.success) {
                setClaimedRequests(claimedResponse.data.requests || []);
            }

            if (dashboardResponse.success) {
                // Use dashboard stats for now - the backend already has role-based logic
                setDashboardStats(dashboardResponse.data.stats);
                // For pending requests count, we'll use the dashboard stats
                setPendingRequests([]); // We'll populate this with a count from stats
            }
        } catch (err) {
            console.error('HRDashboard: Error fetching dashboard data:', err);
            setError(`Failed to load dashboard data: ${err.message}`);
            // Fallback to empty arrays if API fails
            setClaimedRequests([]);
            setPendingRequests([]);
            setDashboardStats(null);
        } finally {
            setLoading(false);
        }
    };

    // Load dashboard data on component mount
    useEffect(() => {
        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    useEffect(() => {
        const checkScreenSize = () => {
            const width = window.innerWidth;
            if (width < 640) {
                setScreenSize('mobile');
            } else if (width < 768) {
                setScreenSize('sm');
            } else if (width < 1024) {
                setScreenSize('tablet');
            } else if (width < 1280) {
                setScreenSize('laptop');
            } else {
                setScreenSize('desktop');
            }
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdownMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Helper function to get counts using dashboard stats based on user role
    const getCountsByRole = (role, stats) => {
        if (!stats) {
            return { message: "Loading dashboard data..." };
        }

        // HR Personnel who handle initial processing and claiming
        if (role === "hr_personnel") {
            const totalWork = (stats.assigned_to_me || 0) + (stats.unassigned_requests || 0);
            const pendingAction = stats.pending_action || 0;
            const inProgress = stats.in_progress || 0;

            if (pendingAction > 0) {
                return {
                    message: `You have ${pendingAction} request/s pending to be claimed`,
                };
            } else if (inProgress > 0) {
                return {
                    message: `You have ${inProgress} request/s in progress`,
                };
            } else {
                return {
                    message: "No pending requests assigned to you.",
                };
            }
        }

        // Benefits Officer handles benefits review
        if (role === "benefits_officer") {
            const pendingReview = stats.pending_review || 0;
            return {
                message: `You have ${pendingReview} request/s to review and approve.`,
            };
        }

        // Division Head handles final approval
        if (role === "welfare_head") {
            const pendingFinalApproval = stats.pending_final_approval || 0;
            return {
                message: `You have ${pendingFinalApproval} request/s for final approval.`,
            };
        }

        return { message: "No pending requests." };
    };

    // Get the message using the helper function - with null check
    const { message } = user && user.role ? getCountsByRole(user.role, dashboardStats) : { message: "Loading user data..." };

    // Profile dropdown handlers
    const handleUserClick = () => {
        setShowDropdownMenu(!showDropdownMenu);
    };

    const handleProfileClick = () => {
        setShowDropdownMenu(false);
        navigate("/hr-profile", { state: { user } });
    };

    const handleLogoutClick = () => {
        setShowDropdownMenu(false);
        setShowLogoutModal(true);
    };

    const cancelLogout = () => {
        setShowLogoutModal(false);
    };

    const confirmLogout = async () => {
        setShowLogoutModal(false);
        await logout();
        navigate("/loginpage", { replace: true });
    };

    // Parse the message to add styling to numbers
    const getStyledMessage = (message) => {
        // Split the message and wrap numbers in styled spans
        return message.split(/(\d+)/).map((part, index) => {
            if (/^\d+$/.test(part)) {
                return (
                    <span key={index} className="font-bold" style={{ color: '#023184' }}>
                        {part}
                    </span>
                );
            }
            return part;
        });
    };

    // Get responsive styles based on screen size
    const getResponsiveStyles = () => {
        switch (screenSize) {
            case 'mobile':
                return {
                    upperHeight: '500px',
                    logoSize: 'w-24',
                    titleSize: 'text-4xl',
                    subtitleSize: 'text-sm',
                    cardWidth: '280px',
                    cardHeight: '220px',
                    padding: 'px-4 pt-12',
                    margin: 'mb-3'
                };
            case 'sm':
                return {
                    upperHeight: '550px',
                    logoSize: 'w-28',
                    titleSize: 'text-5xl',
                    subtitleSize: 'text-base',
                    cardWidth: '320px',
                    cardHeight: '240px',
                    padding: 'px-5 pt-14',
                    margin: 'mb-4'
                };
            case 'tablet':
                return {
                    upperHeight: '400px',
                    logoSize: 'w-32',
                    titleSize: 'text-3xl xl:text-4xl',
                    subtitleSize: 'text-lg',
                    cardWidth: '400px',
                    cardHeight: '280px',
                    padding: 'px-8 pt-0',
                    margin: 'mb-1'
                };
            case 'laptop':
                return {
                    upperHeight: '500px',
                    logoSize: 'w-36',
                    titleSize: 'text-4xl xl:text-5xl',
                    subtitleSize: 'text-xl',
                    cardWidth: '500px',
                    cardHeight: '320px',
                    padding: 'px-12 pt-0',
                    margin: 'mb-1'
                };
            default: // desktop
                return {
                    upperHeight: '622px',
                    logoSize: 'w-32',
                    titleSize: 'text-6xl',
                    subtitleSize: 'text-2xl',
                    cardWidth: '657px',
                    cardHeight: '380px',
                    padding: 'px-[229px] pt-0',
                    margin: 'mb-1'
                };
        }
    };

    // Show loading if user is not available yet
    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#3F6EC0] via-[#5D3EA4] to-[#7940A8]">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    const styles = getResponsiveStyles();
    const isMobileView = screenSize === 'mobile' || screenSize === 'sm';
    const isTabletView = screenSize === 'tablet';

    // Mobile Layout
    if (isMobileView) {
        return (
            <div className="min-h-screen flex flex-col">
                {/* Upper half with gradient - 624px height on mobile */}
                <div
                    className="relative flex flex-col"
                    style={{
                        height: '624px',
                        background: "linear-gradient(45deg, #3F6EC0 0%, #00539F 29%, #5D3EA4 57%, #7940A8 79%)",
                    }}
                >
                    {/* User info with dropdown - upper right corner */}
                    <div className="absolute top-4 right-4" ref={dropdownRef}>
                        <button
                            onClick={handleUserClick}
                            className="flex items-center gap-2 hover:opacity-80 transition cursor-pointer"
                        >
                            <span className="text-white text-base font-medium">{getUserDisplayName(user)}</span>
                            {user?.profile_picture || user?.profilePic ? (
                                <img
                                    src={getProfilePictureUrl(user.profile_picture || user.profilePic) || ProfileGray}
                                    alt={`${getUserDisplayName(user)} profile`}
                                    className="w-7 h-7 rounded-full object-cover border border-white"
                                />
                            ) : (
                                <img
                                    src={ProfileGray}
                                    alt="Default profile"
                                    className="w-7 h-7 rounded-full object-cover border border-white"
                                />
                            )}
                        </button>

                        {/* Dropdown Menu */}
                        {showDropdownMenu && (
                            <div className="absolute top-full right-0 mt-2 w-40 bg-white rounded-2xl shadow-xl border border-gray-200 z-50">
                                <div className="py-1">
                                    <button
                                        onClick={handleProfileClick}
                                        className="w-full px-4 py-2 text-left text-sm text-[#023184] hover:bg-gray-100 hover:rounded-2xl transition flex items-center gap-3"
                                    >
                                        <img src={ProfileIcon} alt="" className="w-5 h-5" />
                                        <span>Profile</span>
                                    </button>
                                    <button
                                        onClick={handleLogoutClick}
                                        className="w-full px-4 py-2 text-left text-sm text-[#023184] hover:bg-gray-100 hover:rounded-2xl transition flex items-center gap-3"
                                    >
                                        <img src={LogoutIcon} alt="" className="w-5 h-5" />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Content container */}
                    <div className="px-6 pt-16 flex flex-col items-center text-center">
                        {/* Metrobank logo - centered */}
                        <img src={metrobankLogo} alt="Metrobank Logo" className="w-32 mb-4 block" />

                        {/* Greeting - centered */}
                        <h1 className="text-white text-[64px] font-bold leading-none mb-2">
                            Hello,<br />{getUserDisplayName(user)}!
                        </h1>

                        {/* Welcome message - centered */}
                        <p className="text-white text-base mb-8 max-w-sm">
                            Welcome to the MetroExecuCare Annual Executive Check-up Portal
                        </p>

                        {/* White Pending Requests Card */}
                        <div
                            className="bg-white rounded-[40px] flex flex-col items-center justify-center p-6 mx-auto"
                            style={{
                                width: '337px',
                                maxWidth: '90vw',
                                height: '257px',
                                boxShadow: '5px 5px 20px rgba(0, 0, 0, 0.25)'
                            }}
                        >
                            {/* Icon */}
                            <div className="mb-3">
                                <img src={PendingRequestsLogo} alt="Pending Requests" className="w-[75px] h-[75px]" />
                            </div>

                            {/* Pending Requests Title */}
                            <h2 className="text-2xl font-bold mb-2" style={{ color: '#023184' }}>
                                Pending Requests
                            </h2>

                            {/* Description Text with styled numbers */}
                            <p className="text-center text-base mb-4 px-4" style={{ color: '#484848' }}>
                                {loading ? "Loading..." : getStyledMessage(message)}
                            </p>

                            {/* Review Now Button */}
                            <button
                                className="text-base text-white rounded-full flex items-center justify-center gap-2 cursor-pointer"
                                style={{
                                    backgroundColor: '#023184',
                                    width: '130px',
                                    height: '29px'
                                }}
                                onClick={() => {
                                    console.log('Navigating with user:', user);
                                    navigate(getPendingRequestsRoute(), { state: { user } });
                                }}
                            >
                                Review now
                                <img src={RoundArrowIconWhite} alt="Arrow" className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Lower half - white background */}
                <div className="flex-1 bg-white flex items-center justify-center px-4 sm:px-8 py-6 min-h-[300px]">
                    {/* Claimed Requests Card - Executive Dashboard style */}
                    <div className="bg-white text-gray-900 rounded-3xl shadow-xl w-full max-w-xs sm:max-w-md
                    flex flex-col items-center py-6 px-8 sm:py-8 sm:px-10 border-2 border-gray-100">
                        {/* Header */}
                        <h2 className="text-lg sm:text-xl font-semibold text-center mb-6 text-gray-800">
                            Claimed Requests
                        </h2>

                        {/* Content Container with Executive Dashboard styling */}
                        <div
                            className="rounded-3xl shadow-lg w-full flex flex-col items-center py-6 px-8
                            min-h-[200px] sm:min-h-[250px] justify-center space-y-2"
                            style={{
                                background: "linear-gradient(45deg, #3F6EC0 0%, #00539F 29%, #5D3EA4 57%, #7940A8 79%)"
                            }}
                        >
                            {/* Request Icon */}
                            <div className="mb-3">
                                <img src={LOAppIcon} alt="Claimed Requests" className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16" />
                            </div>

                            {/* Claimed Requests Title */}
                            <h2 className="text-white text-lg sm:text-xl font-bold mb-2">
                                Claimed Requests
                            </h2>

                            {/* Description */}
                            <p className="text-white text-sm sm:text-base text-center mb-4 px-4 opacity-90">
                                Track requests assigned to you and their progress.
                            </p>

                            {/* View full history button */}
                            <button
                                className="flex items-center justify-center gap-2 bg-white rounded-full cursor-pointer
                                hover:bg-gray-50 transition-colors text-sm font-medium px-4 py-2"
                                style={{ color: '#023184' }}
                                onClick={() => navigate(getHistoryRoute(), { state: { user } })}
                            >
                                View full history
                                <img src={RoundArrowIconBlue} alt="Arrow" className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Logout Confirmation Modal */}
                {showLogoutModal && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-3xl shadow-lg text-center w-80">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <img src={AlertIcon} alt="Alert" className="w-5 h-5" />
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
            </div>
        );
    }

    // Desktop and Laptop Layout (Enhanced)
    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            {/* Upper half with diagonal gradient - Executive Dashboard layout */}
            <div
                className="relative text-white flex flex-col justify-center items-center shadow-2xl p-4 sm:p-6 lg:p-8"
                style={{
                    minHeight: "60vh",
                    background: "linear-gradient(45deg, #3F6EC0 0%, #00539F 29%, #5D3EA4 57%, #7940A8 79%)"
                }}
            >
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
                                            className="w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm text-[#023184] hover:bg-gray-100 hover:rounded-2xl transition flex items-center gap-2 sm:gap-3"
                                        >
                                            <img src={ProfileIcon} alt="" className="w-4 h-4 sm:w-5 sm:h-5" />
                                            <span>Profile</span>
                                        </button>
                                        <button
                                            onClick={handleLogoutClick}
                                            className="w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm text-[#023184] hover:bg-gray-100 hover:rounded-2xl transition flex items-center gap-2 sm:gap-3"
                                        >
                                            <img src={LogoutIcon} alt="" className="w-4 h-4 sm:w-5 sm:h-5" />
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                </div>

                {/* Main grid layout like ExecutiveEmployeeDashboard */}
                <div className="grid grid-cols-1 lg:grid-cols-2 w-full items-center mt-4 sm:mt-8 mb-2 gap-6 lg:gap-12 px-4 sm:px-8">
                    {/* Left side - Greeting Section */}
                    <div className="order-2 lg:order-1">
                        <div className="flex flex-col space-y-3 sm:space-y-4 text-center lg:text-left">
                            <div className="flex justify-center lg:justify-start">
                                <img src={metrobankLogo} alt="Metrobank Logo" className="w-24 h-6 sm:w-32 sm:h-8 md:w-40 md:h-10" />
                            </div>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                                Hello, {getUserDisplayName(user)}!
                            </h1>
                            <p className="text-sm sm:text-base lg:text-lg text-white/90">
                                Welcome to the MetroExecuCare Annual Executive Check-up Portal
                            </p>
                        </div>
                    </div>

                    {/* Right side - Status Section */}
                    <div className="order-1 lg:order-2 flex justify-center">
                        <div className="bg-white text-gray-900 rounded-3xl shadow-xl w-full max-w-sm sm:max-w-md lg:max-w-lg
                        flex flex-col items-center py-6 px-8 sm:py-8 sm:px-10 border-2 border-gray-100">
                            {/* Row-type flex layout with centered content */}
                            <div className="flex flex-col items-center justify-center space-y-4 w-full">
                                {/* First row: PendingRequestLogo.svg */}
                                <div className="flex justify-center">
                                    <img src={PendingRequestsLogo} alt="Pending Requests" className="w-12 h-12 sm:w-16 sm:h-16" />
                                </div>

                                {/* Second row: "Pending Requests" with blue color */}
                                <h2 className="text-lg sm:text-xl font-bold text-center" style={{ color: '#023184' }}>
                                    Pending Requests
                                </h2>

                                {/* Third row: "You have # request/s to approve, and # to review" */}
                                <p className="text-sm sm:text-base text-center text-gray-600 px-4">
                                    {loading ? "Loading..." : getStyledMessage(message)}
                                </p>

                                {/* Fourth row: Review Now button */}
                                <button
                                    onClick={() => navigate(getPendingRequestsRoute(), { state: { user } })}
                                    className="bg-blue-700 text-white px-6 py-2 rounded-full hover:bg-blue-800
                                    transition-colors duration-200 flex items-center justify-center gap-2 font-medium"
                                >
                                    Review Now
                                    <img src={RoundArrowIconWhite} alt="Arrow" className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Lower half (white) */}
            <div className="flex-1 bg-white px-4 sm:px-8 py-6 flex items-center justify-center min-h-[40vh]">
                {/* Executive Dashboard style container */}
                <div className="bg-white text-gray-900 rounded-3xl shadow-xl w-full max-w-xs sm:max-w-md lg:max-w-6xl
                flex flex-col items-center py-6 px-8 sm:py-8 sm:px-10 border-2 border-gray-100">
                    {/* Header */}
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-center mb-6 text-gray-800">
                        Claimed Requests
                    </h2>

                    {/* Content Container with gradient background */}
                    <div
                        className="rounded-3xl shadow-lg w-full flex flex-col items-center py-6 px-8 sm:py-8 sm:px-10
                        border-2 min-h-[200px] sm:min-h-[250px] lg:min-h-[350px]"
                        style={{
                            background: "linear-gradient(45deg, #3F6EC0 0%, #00539F 29%, #5D3EA4 57%, #7940A8 79%)"
                        }}
                    >
                        {/* Table/Grid - Show claimed requests */}
                        <div className="w-full mb-6 overflow-y-auto max-h-[200px] sm:max-h-[250px] lg:max-h-[300px]">
                        {/* Table Header */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-white font-semibold mb-4 px-4 border-b border-white/20 pb-2">
                            <div className={screenSize === 'laptop' ? 'text-sm' : 'text-base'}>Employee & Request Info</div>
                            <div className={screenSize === 'laptop' ? 'text-sm' : 'text-base'}>Status & Date</div>
                        </div>

                        {/* Table Rows */}
                        {claimedRequests.length > 0 ? claimedRequests.map((request, index) => (
                            <div
                                key={request.id}
                                className={`grid grid-cols-1 lg:grid-cols-2 gap-6 text-white px-4 py-3 rounded-lg hover:bg-white/10 cursor-pointer transition-colors ${index < claimedRequests.length - 1 ? 'mb-2' : ''}`}
                                onClick={() => navigate(`/loa-submit/${request.id}`, { state: { user } })}
                            >
                                {/* Left Column - Employee & Request Info */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 flex items-center justify-center">
                                            {request.request_type === 'letter_of_authorization' ? (
                                                <img src={LOAuthIcon} alt="LOAuth" className="w-5 h-5" />
                                            ) : request.request_type === 'letter_of_approval' ? (
                                                <img src={LOAppIcon} alt="LOApp" className="w-5 h-5" />
                                            ) : (
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
                                                    <circle cx="12" cy="12" r="3" fill="currentColor" />
                                                </svg>
                                            )}
                                        </div>
                                        <span className={`font-medium ${screenSize === 'laptop' ? 'text-sm' : 'text-base'}`}>
                                            {request.employee?.first_name || 'Unknown'} {request.employee?.last_name || 'User'}
                                        </span>
                                    </div>
                                    <div className={`text-white/80 ${screenSize === 'laptop' ? 'text-xs' : 'text-sm'}`}>
                                        #{request.request_number || request.id} • {formatRequestType(request.request_type)}
                                    </div>
                                </div>

                                {/* Right Column - Status & Date */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 flex items-center justify-center">
                                            {request.current_status === 'hr_processing' ? (
                                                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                            ) : request.current_status === 'benefits_review' ? (
                                                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                            ) : request.current_status === 'welfare_review' ? (
                                                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                                            ) : request.current_status === 'hr_final_verification' ? (
                                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                            ) : (
                                                <span className="text-white">•</span>
                                            )}
                                        </div>
                                        <span className={screenSize === 'laptop' ? 'text-sm' : 'text-base'}>
                                            {formatRequestStatus(request.current_status)}
                                        </span>
                                    </div>
                                    <div className={`text-white/80 ${screenSize === 'laptop' ? 'text-xs' : 'text-sm'}`}>
                                        Claimed: {request.assigned_at ? new Date(request.assigned_at).toLocaleDateString() :
                                         new Date(request.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center text-white/70 py-8">
                                <p className={screenSize === 'laptop' ? 'text-sm' : 'text-base'}>
                                    No claimed requests found. Visit Pending Requests to claim new requests.
                                </p>
                            </div>
                        )}
                    </div>

                        {/* View full history button */}
                        <button
                            className="flex items-center justify-center gap-2 bg-white rounded-full cursor-pointer
                            hover:bg-gray-50 transition-colors text-sm font-medium px-4 py-2 mt-4"
                            style={{ color: '#023184' }}
                            onClick={() => navigate(getHistoryRoute(), { state: { user } })}
                        >
                            View full history
                            <img src={RoundArrowIconBlue} alt="Arrow" className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-3xl shadow-lg text-center w-80">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <img src={AlertIcon} alt="Alert" className="w-5 h-5" />
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
        </div>
    );
}