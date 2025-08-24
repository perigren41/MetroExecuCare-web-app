// HRDashboard.jsx (responsive version with actual SVG imports)
import React, { useState, useEffect } from "react";
import { mockUser } from "./mockUser";
import metrobankLogo from "@/assets/metroBankLogo2.svg";
import PendingRequestsLogo from "@/assets/PendingRequestsLogo.svg";
import LOAppIcon from "@/assets/LOAppIcon.svg";
import LOAuthIcon from "@/assets/LOAuthIcon.svg";
import approvedIcon from "@/assets/approvedIcon.svg";
import rejectedIcon from "@/assets/rejectedIcon.svg";
import RoundArrowIconBlue from "@/assets/RoundArrowIconBlue.svg";
import RoundArrowIconWhite from "@/assets/RoundArrowIconWhite.svg";
import { mockRequests } from "./mockRequests";
import { useNavigate } from "react-router-dom";

const recentTransactions = mockRequests.slice(0, 3); // just 3 most recent

export default function HRDashboard() {
    const user = mockUser;
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Dynamic request counts - replace with your actual data source
    const requestsToApprove = 2; // This should come from your API/state
    const requestsToReview = 1;  // This should come from your API/state

    // Mock data for recent transactions - replace with actual API call
   

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
                    {/* User info - upper right corner */}
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                        <span className="text-white text-base font-medium">{user.name}</span>
                        <img
                            src={user.profilePic}
                            alt={`${user.name} profile`}
                            className="w-7 h-7 rounded-full object-cover"
                        />
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

                            {/* Description Text */}
                            <p className="text-center text-base mb-4 px-4" style={{ color: '#484848' }}>
                                {user.role === 'benefits assistant' ? (
                                    <>
                                        You have{" "}
                                        <span className="font-bold" style={{ color: '#023184' }}>
                                            {requestsToApprove}
                                        </span>{" "}
                                        LOA request{requestsToApprove !== 1 ? "s" : ""} to approve, and{" "}
                                        <span className="font-bold" style={{ color: '#023184' }}>
                                            {requestsToReview}
                                        </span>{" "}
                                        to review.
                                    </>
                                ) : user.role === 'benefits services officer' || user.role === 'division head' ? (
                                    <>
                                        You have{" "}
                                        <span className="font-bold" style={{ color: '#023184' }}>
                                            {requestsToReview}
                                        </span>{" "}
                                        LOA request{requestsToReview !== 1 ? "s" : ""} to review and sign.
                                    </>
                                ) : (
                                    <>
                                        You have{" "}
                                        <span className="font-bold" style={{ color: '#023184' }}>
                                            {requestsToApprove}
                                        </span>{" "}
                                        LOA request{requestsToApprove !== 1 ? "s" : ""} to approve, and{" "}
                                        <span className="font-bold" style={{ color: '#023184' }}>
                                            {requestsToReview}
                                        </span>{" "}
                                        to review.
                                    </>
                                )}
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
                                    console.log('Navigate to pending requests page');
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
                            onClick={() => {
                                console.log('Navigate to full history page');
                            }}
                        >
                            View full history
                            <img src={RoundArrowIconBlue} alt="Arrow" className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Desktop Layout (keeping your original design)
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
                    {/* User info above card */}
                    <button className="absolute -top-10 right-0 flex items-center gap-2 hover:opacity-80">
                        <span className="text-base font-medium text-white">{user.name}</span>
                        <img
                            src={user.profilePic}
                            alt={`${user.name} profile`}
                            className="w-7 h-7 rounded-full object-cover"
                        />
                    </button>

                    {/* Icon/Image */}
                    <div className="mb-3">
                        <img src={PendingRequestsLogo} alt="Pending Requests" className="w-16 h-16" />
                    </div>

                    {/* Pending Requests Title */}
                    <h2 className="text-[36px] font-bold mb-2" style={{ color: '#023184' }}>
                        Pending Requests
                    </h2>

                    {/* Description Text */}
                    <p className="text-center mb-4 max-w-md" style={{ color: '#484848' }}>
                        {user.role === 'benefits assistant' ? (
                            <>
                                You have{" "}
                                <span className="font-bold" style={{ color: '#023184' }}>
                                    {requestsToApprove}
                                </span>{" "}
                                LOA request{requestsToApprove !== 1 ? "s" : ""} to approve, and{" "}
                                <span className="font-bold" style={{ color: '#023184' }}>
                                    {requestsToReview}
                                </span>{" "}
                                to review.
                            </>
                        ) : user.role === 'benefits services officer' || user.role === 'division head' ? (
                            <>
                                You have{" "}
                                <span className="font-bold" style={{ color: '#023184' }}>
                                    {requestsToReview}
                                </span>{" "}
                                LOA request{requestsToReview !== 1 ? "s" : ""} to review and sign.
                            </>
                        ) : (
                            <>
                                You have{" "}
                                <span className="font-bold" style={{ color: '#023184' }}>
                                    {requestsToApprove}
                                </span>{" "}
                                LOA request{requestsToApprove !== 1 ? "s" : ""} to approve, and{" "}
                                <span className="font-bold" style={{ color: '#023184' }}>
                                    {requestsToReview}
                                </span>{" "}
                                to review.
                            </>
                        )}
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
                            console.log('Navigate to pending requests page');
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
                                            transaction.request_type === 'annual_checkup' ? 'Annual Checkup' :
                                                transaction.request_type === 'special_request' ? 'Special Request' :
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
                        onClick={() => navigate("/hr-history")} // ✅ navigate to HR_HistoryPage
                    >
                        View full history
                        <img src={RoundArrowIconBlue} alt="Arrow" className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}