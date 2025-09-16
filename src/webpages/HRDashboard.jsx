// HRDashboard.jsx (with counter helper integration)
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

    const [isMobile, setIsMobile] = useState(false);
    const [showDropdownMenu, setShowDropdownMenu] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
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

    // Mobile Layout
    if (isMobile) {
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
                            <span className="text-white text-base font-medium">{user.name}</span>
                            {user.profilePic ? (
                                <img
                                    src={user.profilePic}
                                    alt={`${user.name} profile`}
                                    className="w-7 h-7 rounded-full object-cover border border-white"
                                />
                            ) : (
                                <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs border border-white">
                                    {user.name.charAt(0)}
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
                    <div className="px-6 pt-16">
                        {/* Metrobank logo - 19px under name/pfp */}
                        <img src={metrobankLogo} alt="Metrobank Logo" className="w-32 mb-4 block" />

                        {/* Greeting - two lines */}
                        <h1 className="text-white text-[64px] font-bold leading-none mb-2 text-left">
                            Hello,<br />{user.name}!
                        </h1>

                        {/* Welcome message */}
                        <p className="text-white text-base mb-8 text-left">
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

    // Desktop Layout
    return (
        <div className="h-screen flex flex-col overflow-hidden">
            {/* Upper half with diagonal gradient */}
            <div
                className="h-[622px] w-full flex items-center justify-between px-[229px]"
                style={{
                    background: "linear-gradient(45deg, #3F6EC0 0%, #00539F 29%, #5D3EA4 57%, #7940A8 79%)",
                }}
            >
                {/* Left side - Content aligned to the left */}
                <div className="flex flex-col justify-center items-start">
                    {/* Metrobank logo */}
                    <img src={metrobankLogo} alt="Metrobank Logo" className="w-32 mb-1 block" />

                    {/* Main greeting */}
                    <h1 className="text-white text-[64px] font-bold leading-tight mb-0">
                        Hello, {user.name}!
                    </h1>

                    {/* Welcome message */}
                    <p className="text-white text-[24px] leading-relaxed max-w-[800px]">
                        Welcome to the MetroExecuCare Annual Executive Check-up Portal
                    </p>
                </div>

                {/* Right side - White card */}
                <div
                    className="relative bg-white rounded-[75px] flex flex-col items-center justify-center p-8"
                    style={{
                        width: '657px',
                        height: '380px',
                        boxShadow: '5px 5px 20px rgba(0, 0, 0, 0.25)'
                    }}
                >
                    {/* User info with dropdown above card */}
                    <div className="absolute -top-10 right-0" ref={dropdownRef}>
                        <button
                            onClick={handleUserClick}
                            className="flex items-center gap-2 hover:opacity-80 transition cursor-pointer"
                        >
                            <span className="text-base font-medium text-white">{user.name}</span>
                            {user.profilePic ? (
                                <img
                                    src={user.profilePic}
                                    alt={`${user.name} profile`}
                                    className="w-7 h-7 rounded-full object-cover border border-white"
                                />
                            ) : (
                                <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs border border-white">
                                    {user.name.charAt(0)}
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
                    <h2 className="text-[36px] font-bold mb-2" style={{ color: '#023184' }}>
                        Pending Requests
                    </h2>

                    {/* Description Text with styled numbers */}
                    <p className="text-center mb-4 max-w-md" style={{ color: '#484848' }}>
                        {getStyledMessage(message)}
                    </p>

                    {/* Review Now Button */}
                    <button
                        className="text-[16px] text-white rounded-full flex items-center justify-center gap-2 cursor-pointer"
                        style={{
                            backgroundColor: '#023184',
                            width: '130px',
                            height: '29px'
                        }}
                        onClick={() => {
                            navigate("/hr-pending-requests", { state: { user } });
                        }}
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
                    className="rounded-[75px] flex flex-col items-center justify-center p-8"
                    style={{
                        width: '1462px',
                        height: '380px',
                        background: "linear-gradient(45deg, #3F6EC0 0%, #00539F 29%, #5D3EA4 57%, #7940A8 79%)"
                    }}
                >
                    {/* LOA History Title */}
                    <h2 className="text-white text-[36px] font-bold mb-6 text-center">LOA History</h2>

                    {/* Table/Grid - Dynamic rendering based on ERD */}
                    <div className="w-full max-w-5xl mb-6 overflow-y-auto">
                        {recentTransactions.map((transaction, index) => (
                            <div key={transaction.id} className={`grid grid-cols-4 gap-8 text-white ${index < recentTransactions.length - 1 ? 'mb-4' : ''}`}>
                                {/* Employee Name with SVG icon based on request type */}
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 flex items-center justify-center">
                                        {transaction.request_type === 'letter_of_authorization' ? (
                                            <img src={LOAuthIcon} alt="LOAuth" className="w-24 h-24" />
                                        ) : transaction.request_type === 'letter_of_approval' ? (
                                            <img src={LOAppIcon} alt="LOApp" className="w-24 h-24" />
                                        ) : (
                                            // Default icon for other request types
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
                                                <circle cx="12" cy="12" r="3" fill="currentColor" />
                                            </svg>
                                        )}
                                    </div>
                                    <span>{transaction.employee.first_name} {transaction.employee.last_name}</span>
                                </div>

                                {/* Request Type - from checkup_requests.request_type enum */}
                                <div>
                                    {transaction.request_type === 'letter_of_approval' ? 'LOApp' :
                                        transaction.request_type === 'letter_of_authorization' ? 'LOAuth' :
                                                    transaction.request_type}
                                </div>

                                {/* Created Date - from checkup_requests.created_at */}
                                <div>{transaction.created_at}</div>

                                {/* Status - from checkup_requests.current_status */}
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 flex items-center justify-center">
                                        {transaction.current_status === 'approved' ?
                                            <img src={approvedIcon} alt="Approved" className="w-24 h-24" /> :
                                            transaction.current_status === 'rejected' ?
                                                <img src={rejectedIcon} alt="Rejected" className="w-24 h-24" /> :
                                                <span className="text-white">•</span>
                                        }
                                    </div>
                                    <span className="capitalize">{transaction.current_status}</span>
                                </div>
                            </div>
                        ))}
                    </div>

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