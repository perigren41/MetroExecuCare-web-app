// HRDashboard.jsx (Fully Responsive - Complete)
import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { mockUser } from "./mockUser";
import metrobankLogo from "@/assets/metroBankLogo2.svg";
import PendingRequestsLogo from "@/assets/PendingRequestsLogo.svg";
import LOAppIcon from "@/assets/LOAppIcon.svg";
import LOAuthIcon from "@/assets/LOAuthIcon.svg";
import approvedIcon from "@/assets/approvedIcon.svg";
import rejectedIcon from "@/assets/rejectedIcon.svg";
import RoundArrowIconBlue from "@/assets/RoundArrowIconBlue.svg";
import RoundArrowIconWhite from "@/assets/RoundArrowIconWhite.svg";
import { mockPendingRequests } from "./mockPendingRequests";
import { mockRequests } from "./mockRequests";
import ProfileIcon from '../assets/ProfileIcon.svg';
import LogoutIcon from '../assets/LogoutIcon.svg';
import AlertIcon from '../assets/AlertIcon.svg';


const recentTransactions = mockRequests.slice(0, 3); // just 3 most recent

export default function HRDashboard() {
    const location = useLocation();
    const navigate = useNavigate();

    // Get user from navigation state or fallback to default
    const user = location.state?.user || mockUser;

    // Helper function to get user display name
    const getUserDisplayName = (user) => {
        return `${user.first_name} ${user.last_name}`;
    };

    // Helper function to get user initials
    const getUserInitials = (user) => {
        return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`;
    };

    const [screenSize, setScreenSize] = useState('desktop');
    const [showDropdownMenu, setShowDropdownMenu] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const dropdownRef = useRef(null);

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

    // Helper function to get counts by position 
    const getCountsByPosition = (position, requests) => {
        if (position === "Benefits Assistant") {
            const toApprove = requests.filter(
                (r) => r.current_status.toLowerCase() === "pending ba approval"
            ).length;
            const toReview = requests.filter(
                (r) => r.current_status.toLowerCase() === "pending ba review"
            ).length;
            return {
                message: `You have ${toApprove} LOA request/s to approve, and ${toReview} to review.`,
            };
        }
        if (position === "Benefits Services Officer") {
            const count = requests.filter(
                (r) => r.current_status.toLowerCase() === "pending bso approval"
            ).length;
            return {
                message: `You have ${count} LOA request/s to review and sign.`,
            };
        }
        if (position === "Division Head") {
            const count = requests.filter(
                (r) => r.current_status.toLowerCase() === "pending division head approval"
            ).length;
            return {
                message: `You have ${count} LOA request/s to review and sign.`,
            };
        }
        return { message: "" };
    };

    // Get the message using the helper function
    const { message } = getCountsByPosition(user.position, mockPendingRequests);

    // Profile dropdown handlers
    const handleUserClick = () => {
        setShowDropdownMenu(!showDropdownMenu);
    };

    const handleProfileClick = () => {
        setShowDropdownMenu(false);
        navigate("/profile", { state: { user } });
    };

    const handleLogoutClick = () => {
        setShowDropdownMenu(false);
        setShowLogoutModal(true);
    };

    const cancelLogout = () => {
        setShowLogoutModal(false);
    };

    const confirmLogout = () => {
        setShowLogoutModal(false);
        // Clear any user session data here
        navigate("/login");
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
                            {user.profilePic ? (
                                <img
                                    src={user.profilePic}
                                    alt={`${getUserDisplayName(user)} profile`}
                                    className="w-7 h-7 rounded-full object-cover border border-white"
                                />
                            ) : (
                                <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs border border-white">
                                    {getUserInitials(user)}
                                </div>
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
                                {getStyledMessage(message)}
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
                                    console.log('Navigating with user:', user); // Add this line
                                    navigate("/hr-pending-requests", { state: { user } });
                                }}
                            >
                                Review now
                                <img src={RoundArrowIconWhite} alt="Arrow" className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Lower half - white background */}
                <div className="flex-1 bg-white flex items-center justify-center p-6 min-h-[300px]">
                    {/* LOA History Card with gradient */}
                    <div
                        className="rounded-[40px] flex flex-col items-center justify-center p-6"
                        style={{
                            width: '337px',
                            maxWidth: '90vw',
                            height: '257px',
                            background: "linear-gradient(45deg, #3F6EC0 0%, #00539F 29%, #5D3EA4 57%, #7940A8 79%)"
                        }}
                    >
                        {/* LOA Icon */}
                        <div className="mb-3">
                            <img src={LOAppIcon} alt="LOA History" className="w-[75px] h-[75px]" />
                        </div>

                        {/* LOA History Title */}
                        <h2 className="text-white text-2xl font-bold mb-2">
                            LOA History
                        </h2>

                        {/* Description */}
                        <p className="text-white text-base text-center mb-4 px-4">
                            Check past requests and its details.
                        </p>

                        {/* View full history button */}
                        <button
                            className="flex items-center justify-center gap-2 bg-white rounded-full cursor-pointer hover:bg-gray-50 transition-colors"
                            style={{
                                width: '160px',
                                height: '29px',
                                color: '#023184'
                            }}
                            onClick={() => navigate("/hr-history", { state: { user } })}
                        >
                            View full history
                            <img src={RoundArrowIconBlue} alt="Arrow" className="w-5 h-5" />
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
        <div className="h-screen flex flex-col overflow-hidden">
            {/* Upper half with diagonal gradient */}
            <div
                className="flex items-center justify-between"
                style={{
                    height: styles.upperHeight,
                    background: "linear-gradient(45deg, #3F6EC0 0%, #00539F 29%, #5D3EA4 57%, #7940A8 79%)",
                    padding: screenSize === 'laptop' ? '0 3rem' : '0 14rem'
                }}
            >
                {/* Left side - Content */}
                <div className="flex flex-col justify-center items-start">
                    <img src={metrobankLogo} alt="Metrobank Logo" className={`${styles.logoSize} ${styles.margin} block`} />
                    <h1 className={`text-white ${styles.titleSize} font-bold leading-tight mb-0`}>
                        Hello, {getUserDisplayName(user)}!
                    </h1>
                    <p className={`text-white ${styles.subtitleSize} leading-relaxed max-w-4xl`}>
                        Welcome to the MetroExecuCare Annual Executive Check-up Portal
                    </p>
                </div>

                {/* Right side - White card */}
                <div
                    className="relative bg-white flex flex-col items-center justify-center p-8"
                    style={{
                        width: styles.cardWidth,
                        height: styles.cardHeight,
                        borderRadius: screenSize === 'laptop' ? '60px' : '75px',
                        boxShadow: '5px 5px 20px rgba(0, 0, 0, 0.25)'
                    }}
                >
                    {/* User info with dropdown above card */}
                    <div className="absolute -top-10 right-0" ref={dropdownRef}>
                        <button
                            onClick={handleUserClick}
                            className="flex items-center gap-2 hover:opacity-80 transition cursor-pointer"
                        >
                            <span className="text-base font-medium text-white">{getUserDisplayName(user)}</span>
                            {user.profilePic ? (
                                <img
                                    src={user.profilePic}
                                    alt={`${getUserDisplayName(user)} profile`}
                                    className="w-7 h-7 rounded-full object-cover border border-white"
                                />
                            ) : (
                                <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs border border-white">
                                    {getUserInitials(user)}
                                </div>
                            )}
                        </button>

                        {/* Dropdown Menu */}
                        {showDropdownMenu && (
                            <div className="absolute top-full right-0 mt-2 w-28 bg-white rounded-2xl shadow-xl border border-gray-200 z-50">
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

                    {/* Icon/Image */}
                    <div className="mb-3">
                        <img src={PendingRequestsLogo} alt="Pending Requests" className="w-16 h-16" />
                    </div>

                    {/* Pending Requests Title */}
                    <h2 className={`${screenSize === 'laptop' ? 'text-3xl' : 'text-4xl'} font-bold mb-2`} style={{ color: '#023184' }}>
                        Pending Requests
                    </h2>

                    {/* Description Text with styled numbers */}
                    <p className="text-center mb-4 max-w-md" style={{ color: '#484848' }}>
                        {getStyledMessage(message)}
                    </p>

                    {/* Review Now Button */}
                    <button
                        className="text-base text-white rounded-full flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 transition"
                        style={{
                            backgroundColor: '#023184',
                            width: '130px',
                            height: '29px'
                        }}
                        onClick={() => navigate("/hr-pending-requests", { state: { user } })}
                    >
                        Review now
                        <img src={RoundArrowIconWhite} alt="Arrow" className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Lower half (white) */}
            <div className="flex-1 bg-white p-6 flex items-center justify-center">
                {/* Large centered LOA History card */}
                <div
                    className="flex flex-col items-center justify-center p-8"
                    style={{
                        width: screenSize === 'laptop' ? '90%' : '1462px',
                        maxWidth: '95vw',
                        height: screenSize === 'laptop' ? '320px' : '380px',
                        borderRadius: screenSize === 'laptop' ? '60px' : '75px',
                        background: "linear-gradient(45deg, #3F6EC0 0%, #00539F 29%, #5D3EA4 57%, #7940A8 79%)"
                    }}
                >
                    {/* LOA History Title */}
                    <h2 className={`text-white ${screenSize === 'laptop' ? 'text-3xl' : 'text-4xl'} font-bold mb-6 text-center`}>
                        LOA History
                    </h2>

                    {/* Table/Grid - Dynamic rendering based on ERD */}
                    <div className="w-full max-w-5xl mb-6 overflow-y-auto">
                        {recentTransactions.map((transaction, index) => (
                            <div key={transaction.id} className={`grid grid-cols-4 gap-8 text-white ${index < recentTransactions.length - 1 ? 'mb-4' : ''}`}>
                                {/* Employee Name with SVG icon based on request type */}
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 flex items-center justify-center">
                                        {transaction.request_type === 'letter_of_authorization' ? (
                                            <img src={LOAuthIcon} alt="LOAuth" className="w-6 h-6" />
                                        ) : transaction.request_type === 'letter_of_approval' ? (
                                            <img src={LOAppIcon} alt="LOApp" className="w-6 h-6" />
                                        ) : (
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
                                                <circle cx="12" cy="12" r="3" fill="currentColor" />
                                            </svg>
                                        )}
                                    </div>
                                    <span className={screenSize === 'laptop' ? 'text-sm' : 'text-base'}>
                                        {transaction.employee.first_name} {transaction.employee.last_name}
                                    </span>
                                </div>

                                {/* Request Type */}
                                <div className={screenSize === 'laptop' ? 'text-sm' : 'text-base'}>
                                    {transaction.request_type === 'letter_of_approval' ? 'LOApp' :
                                        transaction.request_type === 'letter_of_authorization' ? 'LOAuth' :
                                            transaction.request_type}
                                </div>

                                {/* Created Date */}
                                <div className={screenSize === 'laptop' ? 'text-sm' : 'text-base'}>
                                    {transaction.created_at}
                                </div>

                                {/* Status */}
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 flex items-center justify-center">
                                        {transaction.current_status === 'approved' ?
                                            <img src={approvedIcon} alt="Approved" className="w-6 h-6" /> :
                                            transaction.current_status === 'rejected' ?
                                                <img src={rejectedIcon} alt="Rejected" className="w-6 h-6" /> :
                                                <span className="text-white">•</span>
                                        }
                                    </div>
                                    <span className={`capitalize ${screenSize === 'laptop' ? 'text-sm' : 'text-base'}`}>
                                        {transaction.current_status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* View full history button */}
                    <button
                        className="flex items-center justify-center gap-2 bg-white rounded-full cursor-pointer hover:bg-gray-50 transition-colors text-base"
                        style={{
                            width: '160px',
                            height: '29px',
                            color: '#023184'
                        }}
                        onClick={() => navigate("/hr-history", { state: { user } })}
                    >
                        View full history
                        <img src={RoundArrowIconBlue} alt="Arrow" className="w-5 h-5" />
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