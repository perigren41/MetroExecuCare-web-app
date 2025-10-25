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
import ClockIcon from '@/assets/ClockIconBlue.svg';
import { HelpCircle } from "lucide-react";


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

        console.log('🔍 Frontend getCountsByRole called with:', { role, stats });

        // HR Personnel who handle initial processing and claiming
        if (role === "hr_personnel") {
            // Convert to numbers to handle string values from backend
            const pendingToBeClaimed = Number(stats.unassigned_requests) || 0;  // Requests not yet claimed by any HR
            const claimedWaitingForApproval = Number(stats.assigned_to_me) || 0;  // Requests claimed by this HR user

            console.log('🔍 HR Personnel counts:', {
                pendingToBeClaimed,
                claimedWaitingForApproval,
                rawStats: {
                    unassigned_requests: stats.unassigned_requests,
                    assigned_to_me: stats.assigned_to_me
                }
            });

            // Both have requests
            if (pendingToBeClaimed > 0 && claimedWaitingForApproval > 0) {
                return {
                    message: `You have ${pendingToBeClaimed} request/s pending to be claimed and ${claimedWaitingForApproval} waiting for your approval`,
                };
            }
            // Only pending to be claimed
            else if (pendingToBeClaimed > 0 && claimedWaitingForApproval === 0) {
                return {
                    message: `You have ${pendingToBeClaimed} request/s pending to be claimed`,
                };
            }
            // Only claimed waiting for approval
            else if (claimedWaitingForApproval > 0 && pendingToBeClaimed === 0) {
                return {
                    message: `There are ${claimedWaitingForApproval} waiting for your approval`,
                };
            }
            // None
            else {
                return {
                    message: "No pending requests.",
                };
            }
        }

        // Benefits Officer handles benefits review
        if (role === "benefits_officer") {
            // Convert to numbers to handle string values from backend
            const pendingToBeClaimed = Number(stats.pending_action) || 0;  // Not yet claimed by BO
            const claimedWaitingForApproval = Number(stats.pending_review) || 0;  // Claimed by BO

            console.log('🔍 Benefits Officer counts:', {
                pendingToBeClaimed,
                claimedWaitingForApproval,
                rawStats: {
                    pending_action: stats.pending_action,
                    pending_review: stats.pending_review
                }
            });

            // Both have requests
            if (pendingToBeClaimed > 0 && claimedWaitingForApproval > 0) {
                return {
                    message: `You have ${pendingToBeClaimed} request/s pending to be claimed and ${claimedWaitingForApproval} waiting for your approval`,
                };
            }
            // Only pending to be claimed
            else if (pendingToBeClaimed > 0 && claimedWaitingForApproval === 0) {
                return {
                    message: `You have ${pendingToBeClaimed} request/s pending to be claimed`,
                };
            }
            // Only claimed waiting for approval
            else if (claimedWaitingForApproval > 0 && pendingToBeClaimed === 0) {
                return {
                    message: `There are ${claimedWaitingForApproval} waiting for your approval`,
                };
            }
            // None
            else {
                return {
                    message: "No pending requests.",
                };
            }
        }

        // Division Head handles final approval
        if (role === "welfare_head") {
            // Convert to numbers to handle string values from backend
            const pendingToBeClaimed = Number(stats.pending_action) || 0;  // Not yet claimed by DH
            const claimedWaitingForApproval = Number(stats.pending_final_approval) || 0;  // Claimed by DH

            console.log('🔍 Division Head counts:', {
                pendingToBeClaimed,
                claimedWaitingForApproval,
                rawStats: {
                    pending_action: stats.pending_action,
                    pending_final_approval: stats.pending_final_approval
                }
            });

            // Both have requests
            if (pendingToBeClaimed > 0 && claimedWaitingForApproval > 0) {
                return {
                    message: `You have ${pendingToBeClaimed} request/s pending to be claimed and ${claimedWaitingForApproval} waiting for your approval`,
                };
            }
            // Only pending to be claimed
            else if (pendingToBeClaimed > 0 && claimedWaitingForApproval === 0) {
                return {
                    message: `You have ${pendingToBeClaimed} request/s pending to be claimed`,
                };
            }
            // Only claimed waiting for approval
            else if (claimedWaitingForApproval > 0 && pendingToBeClaimed === 0) {
                return {
                    message: `There are ${claimedWaitingForApproval} waiting for your approval`,
                };
            }
            // None
            else {
                return {
                    message: "No pending requests.",
                };
            }
        }

        return { message: "No pending requests." };
    };

    // Get the message using the helper function - with null check
    // Use useMemo to recalculate when dashboardStats changes
    const message = React.useMemo(() => {
        console.log('🔄 useMemo recalculating message with:', {
            hasUser: !!user,
            role: user?.role,
            hasDashboardStats: !!dashboardStats,
            dashboardStats
        });

        if (!user || !user.role) {
            console.log('⚠️ Returning "Loading user data..." - user or role missing');
            return "Loading user data...";
        }

        const result = getCountsByRole(user.role, dashboardStats);
        console.log('✅ Message calculated:', result.message);
        return result.message;
    }, [user, user?.role, dashboardStats]);

    // Profile dropdown handlers
    const handleUserClick = () => {
        setShowDropdownMenu(!showDropdownMenu);
    };

    const handleProfileClick = () => {
        setShowDropdownMenu(false);
        navigate("/hr-profile", { state: { user } });
    };

    const handleHistoryClick = () => {
        setShowDropdownMenu(false);
        navigate("/history");
    };

    const handleFAQClick = () => {
        setShowDropdownMenu(false);
        navigate("/faq");
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
                                        onClick={handleHistoryClick}
                                        className="w-full px-4 py-2 text-left text-sm text-[#023184] hover:bg-gray-100 hover:rounded-2xl transition flex items-center gap-3"
                                    >
                                        <img src={ClockIcon} alt="" className="w-5 h-5" />
                                        <span>History</span>
                                    </button>
                                    <button
                                        onClick={handleFAQClick}
                                        className="w-full px-4 py-2 text-left text-sm text-[#023184] hover:bg-gray-100 hover:rounded-2xl transition flex items-center gap-3"
                                    >
                                        <HelpCircle className="w-5 h-5 text-[#023184]" />
                                        <span>FAQ</span>
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

                        {/* White Pending Requests Card - Redesigned for Mobile */}
                        <div
                            className="bg-white rounded-3xl flex flex-col items-center justify-center p-6 mx-auto overflow-hidden shadow-2xl"
                            style={{
                                width: screenSize === 'mobile' ? 'min(280px, 85vw)' : '320px',
                                maxWidth: '85vw'
                            }}
                        >
                            {/* Icon */}
                            <div className="mb-3 flex-shrink-0">
                                <img src={PendingRequestsLogo} alt="Pending Requests" className="w-14 h-14" />
                            </div>

                            {/* Pending Requests Title */}
                            <h2 className="text-base font-bold mb-2 text-center" style={{ color: '#023184' }}>
                                Pending Requests
                            </h2>

                            {/* Description Text with styled numbers */}
                            <p className="text-center text-xs mb-4 px-2 break-words leading-relaxed" style={{ color: '#484848' }}>
                                {loading ? "Loading..." : getStyledMessage(message)}
                            </p>

                            {/* Review Now Button */}
                            <button
                                className="text-xs text-white rounded-full flex items-center justify-center gap-2 cursor-pointer px-5 py-2 flex-shrink-0 hover:opacity-90 transition-opacity"
                                style={{
                                    backgroundColor: '#023184'
                                }}
                                onClick={() => {
                                    console.log('Navigating with user:', user);
                                    navigate(getPendingRequestsRoute(), { state: { user } });
                                }}
                            >
                                Review now
                                <img src={RoundArrowIconWhite} alt="Arrow" className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Lower half - white background */}
                <div className="flex-1 bg-white flex items-center justify-center px-4 sm:px-6 py-6 min-h-[300px]">
                    {/* Claimed Requests Card - Mobile List View */}
                    <div className="bg-white text-gray-900 rounded-3xl shadow-xl w-full max-w-xs sm:max-w-md
                    flex flex-col items-center py-5 px-5 sm:py-6 sm:px-6 border-2 border-gray-100">
                        {/* Header */}
                        <h2 className="text-base sm:text-lg font-semibold text-center mb-4 text-gray-800">
                            Claimed Requests
                        </h2>

                        {/* Content Container with list of requests */}
                        <div
                            className="rounded-2xl shadow-lg w-full flex flex-col py-4 px-3 sm:py-5 sm:px-4
                            min-h-[180px] max-h-[300px] overflow-y-auto"
                            style={{
                                background: "linear-gradient(45deg, #3F6EC0 0%, #00539F 29%, #5D3EA4 57%, #7940A8 79%)"
                            }}
                        >
                            {/* List of claimed requests */}
                            {claimedRequests.length > 0 ? (
                                <div className="space-y-2">
                                    {claimedRequests.map((request) => (
                                        <div
                                            key={request.id}
                                            className="bg-white/10 hover:bg-white/20 rounded-xl p-3 cursor-pointer transition-all"
                                            onClick={() => navigate(`/loa-submit/${request.id}`, { state: { user } })}
                                        >
                                            {/* Employee Name & Request Type */}
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-4 h-4 flex-shrink-0">
                                                    {request.request_type === 'letter_of_authorization' ? (
                                                        <img src={LOAuthIcon} alt="LOAuth" className="w-full h-full" />
                                                    ) : (
                                                        <img src={LOAppIcon} alt="LOApp" className="w-full h-full" />
                                                    )}
                                                </div>
                                                <span className="text-white font-medium text-xs truncate">
                                                    {request.employee?.first_name || 'Unknown'} {request.employee?.last_name || 'User'}
                                                </span>
                                            </div>

                                            {/* Request Number & Status */}
                                            <div className="text-white/80 text-[10px] space-y-1">
                                                <div>#{request.request_number || request.id}</div>
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                                                    <span>{formatRequestStatus(request.current_status)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                                    <img src={LOAppIcon} alt="No Requests" className="w-12 h-12 opacity-70" />
                                    <p className="text-white/70 text-xs px-3">
                                        No claimed requests found. Visit Pending Requests to claim new requests.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* View full history button */}
                        <button
                            className="mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-[#3F6EC0] to-[#7940A8]
                            text-white rounded-full cursor-pointer hover:opacity-90 transition-opacity text-xs font-medium px-4 py-2"
                            onClick={() => navigate(getHistoryRoute(), { state: { user } })}
                        >
                            View full history
                            <img src={RoundArrowIconWhite} alt="Arrow" className="w-3.5 h-3.5" />
                        </button>
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
                                            onClick={handleHistoryClick}
                                            className="w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm text-[#023184] hover:bg-gray-100 hover:rounded-2xl transition flex items-center gap-2 sm:gap-3"
                                        >
                                            <img src={ClockIcon} alt="" className="w-4 h-4 sm:w-5 sm:h-5" />
                                            <span>History</span>
                                        </button>
                                        <button
                                            onClick={handleFAQClick}
                                            className="w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm text-[#023184] hover:bg-gray-100 hover:rounded-2xl transition flex items-center gap-2 sm:gap-3"
                                        >
                                            <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#023184]" />
                                            <span>FAQ</span>
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
            <div className="flex-1 bg-white px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-center min-h-[300px] sm:min-h-[400px]">
                {/* Executive Dashboard style container */}
                <div className="bg-white text-gray-900 rounded-3xl shadow-xl w-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-6xl
                flex flex-col items-center py-4 px-3 sm:py-6 sm:px-6 md:px-8 lg:py-8 lg:px-10 border-2 border-gray-100">
                    {/* Header */}
                    <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-center mb-3 sm:mb-4 md:mb-6 text-gray-800">
                        Claimed Requests
                    </h2>

                    {/* Content Container with gradient background */}
                    <div
                        className="rounded-2xl sm:rounded-3xl shadow-lg w-full flex flex-col items-center py-3 px-3 sm:py-4 sm:px-4 md:py-6 md:px-6 lg:py-8 lg:px-10
                        border-2 min-h-[180px] sm:min-h-[220px] md:min-h-[280px] lg:min-h-[350px]"
                        style={{
                            background: "linear-gradient(45deg, #3F6EC0 0%, #00539F 29%, #5D3EA4 57%, #7940A8 79%)"
                        }}
                    >
                        {/* Table/Grid - Show claimed requests */}
                        <div className="w-full mb-3 sm:mb-4 md:mb-6 overflow-y-auto max-h-[150px] sm:max-h-[180px] md:max-h-[230px] lg:max-h-[280px] xl:max-h-[320px]">
                        {/* Table Header */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4 lg:gap-6 text-white font-semibold mb-2 sm:mb-3 md:mb-4 px-1 sm:px-2 md:px-4 border-b border-white/20 pb-2">
                            <div className="text-xs sm:text-sm md:text-base">Employee & Request Info</div>
                            <div className="text-xs sm:text-sm md:text-base hidden md:block">Status & Date</div>
                        </div>

                        {/* Table Rows */}
                        {claimedRequests.length > 0 ? claimedRequests.map((request, index) => (
                            <div
                                key={request.id}
                                className={`grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4 lg:gap-6 text-white px-1 sm:px-2 md:px-4 py-2 sm:py-2.5 md:py-3 rounded-lg hover:bg-white/10 cursor-pointer transition-colors ${index < claimedRequests.length - 1 ? 'mb-1.5 sm:mb-2' : ''}`}
                                onClick={() => navigate(`/loa-submit/${request.id}`, { state: { user } })}
                            >
                                {/* Left Column - Employee & Request Info */}
                                <div className="space-y-0.5 sm:space-y-1 md:space-y-2">
                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                        <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 flex items-center justify-center flex-shrink-0">
                                            {request.request_type === 'letter_of_authorization' ? (
                                                <img src={LOAuthIcon} alt="LOAuth" className="w-full h-full" />
                                            ) : request.request_type === 'letter_of_approval' ? (
                                                <img src={LOAppIcon} alt="LOApp" className="w-full h-full" />
                                            ) : (
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white sm:w-5 sm:h-5">
                                                    <circle cx="12" cy="12" r="3" fill="currentColor" />
                                                </svg>
                                            )}
                                        </div>
                                        <span className="font-medium text-[11px] sm:text-xs md:text-sm lg:text-base truncate">
                                            {request.employee?.first_name || 'Unknown'} {request.employee?.last_name || 'User'}
                                        </span>
                                    </div>
                                    <div className="text-white/80 text-[10px] sm:text-xs md:text-sm pl-5 sm:pl-6 md:pl-7 lg:pl-8">
                                        #{request.request_number || request.id} • {formatRequestType(request.request_type)}
                                    </div>
                                </div>

                                {/* Right Column - Status & Date */}
                                <div className="space-y-0.5 sm:space-y-1 md:space-y-2 pl-5 sm:pl-0">
                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                        <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 flex items-center justify-center">
                                            {request.current_status === 'hr_processing' ? (
                                                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                            ) : request.current_status === 'benefits_review' ? (
                                                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400 rounded-full"></div>
                                            ) : request.current_status === 'welfare_review' ? (
                                                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-400 rounded-full"></div>
                                            ) : request.current_status === 'hr_final_verification' ? (
                                                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse"></div>
                                            ) : (
                                                <span className="text-white text-[10px] sm:text-xs">•</span>
                                            )}
                                        </div>
                                        <span className="text-[11px] sm:text-xs md:text-sm lg:text-base truncate">
                                            {formatRequestStatus(request.current_status)}
                                        </span>
                                    </div>
                                    <div className="text-white/80 text-[10px] sm:text-xs md:text-sm">
                                        Claimed: {request.assigned_at ? new Date(request.assigned_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) :
                                         new Date(request.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center text-white/70 py-4 sm:py-6 md:py-8">
                                <p className="text-[11px] sm:text-xs md:text-sm lg:text-base px-3 sm:px-4">
                                    No claimed requests found. Visit Pending Requests to claim new requests.
                                </p>
                            </div>
                        )}
                    </div>

                        {/* View full history button */}
                        <button
                            className="flex items-center justify-center gap-1.5 sm:gap-2 bg-white rounded-full cursor-pointer
                            hover:bg-gray-50 transition-colors text-[11px] sm:text-xs md:text-sm font-medium px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 mt-2 sm:mt-3 md:mt-4"
                            style={{ color: '#023184' }}
                            onClick={() => navigate(getHistoryRoute(), { state: { user } })}
                        >
                            View full history
                            <img src={RoundArrowIconBlue} alt="Arrow" className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
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