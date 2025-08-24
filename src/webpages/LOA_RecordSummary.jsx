// LOA_RecordSummary.jsx
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { mockRequests } from "./mockRequests";

// Assets
import BackSquareIconWhite from "@/assets/BackSquareIconWhite.svg";
import MetroBankLogo from "@/assets/metroBankLogo2.svg";
import HomeIconWhite from "@/assets/HomeIconWhite.svg"; // Assuming you have a home icon

// Import mock user
import { mockUser } from "./mockUser";

export default function LOA_RecordSummary() {
    const navigate = useNavigate();
    const { requestId } = useParams();
    const user = mockUser;

    // Find the specific request
    const request = mockRequests.find(req => req.id === parseInt(requestId));

    if (!request) {
        return <div>Request not found</div>;
    }

    // Format request type for display
    const formatRequestType = (type) => {
        return type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
    };

    // Format status for display
    const formatStatus = (status) => {
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    // Get status styling
    const getStatusStyling = (status) => {
        switch (status.toLowerCase()) {
            case 'approved':
                return 'bg-green-100 text-green-800 px-4 py-2 rounded-full text-lg font-medium';
            case 'rejected':
                return 'bg-red-100 text-red-800 px-4 py-2 rounded-full text-lg font-medium';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-lg font-medium';
            default:
                return 'bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-lg font-medium';
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header
                className="w-full h-[56px] flex items-center justify-between px-[162px] relative"
                style={{
                    background:
                        "linear-gradient(to right, #3F6EC0, #00539F, #5D3EA4, #7940A8)",
                }}
            >
                {/* Left - Back Button and Home Button */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center hover:opacity-80"
                    >
                        <img
                            src={BackSquareIconWhite}
                            alt="Back"
                            className="w-[28px] h-[28px]"
                        />
                    </button>
                    <button
                        onClick={() => navigate("/hr-dashboard")}
                        className="flex items-center hover:opacity-80"
                    >
                        <img
                            src={HomeIconWhite}
                            alt="Home"
                            className="w-[28px] h-[28px]"
                        />
                    </button>
                </div>

                {/* Center - Metrobank Logo */}
                <div className="absolute left-1/2 transform -translate-x-1/2">
                    <img
                        src={MetroBankLogo}
                        alt="Metrobank Logo"
                        className="h-[40px] object-contain"
                    />
                </div>

                {/* Right - HR Name + Profile */}
                <button className="absolute right-[155px] flex items-center gap-2 hover:opacity-80">
                    <span className="text-base font-medium text-white">{user.name}</span>
                    {user.profilePic ? (
                        <img
                            src={user.profilePic}
                            alt={`${user.name} profile`}
                            className="w-7 h-7 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs">
                            {user.name[0]}
                        </div>
                    )}
                </button>
            </header>

            {/* Title */}
            <div className="flex justify-center mt-[43px]">
                <h1 className="text-[#023184] text-[28px] font-bold">
                    LOA Record Summary
                </h1>
            </div>

            {/* Content Container */}
            <div className="px-[200px] mt-8">
                <div
                    className="p-[3px] rounded-[24px]"
                    style={{
                        background: "linear-gradient(to right, #3F6EC0, #00539F, #5D3EA4, #7940A8)",
                        maxWidth: "1200px",
                        margin: "0 auto"
                    }}
                >
                    <div
                        className="bg-white rounded-[24px] p-8"
                        style={{
                            boxShadow: "0px 4px 28px 0px rgba(0, 0, 0, 0.25)",
                        }}
                    >
                        {/* Employee Information Section */}
                        <div className="mb-8">
                            <h2 className="text-[#023184] text-xl font-bold mb-6 border-b-2 border-gray-200 pb-2">
                                Employee Information
                            </h2>
                            
                            <div className="flex items-center gap-6 mb-6">
                                {/* Employee Avatar */}
                                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#3F6EC0] to-[#7940A8] flex items-center justify-center text-white font-bold text-xl">
                                    {request.employee.first_name[0]}{request.employee.last_name[0]}
                                </div>
                                
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">
                                        {request.employee.first_name} {request.employee.last_name}
                                    </h3>
                                    <p className="text-gray-600 text-lg">
                                        Employee ID: {request.employee.employee_id}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-gray-600 text-sm font-medium">Department</label>
                                    <p className="text-gray-900 text-lg font-medium">{request.employee.department}</p>
                                </div>
                                <div>
                                    <label className="text-gray-600 text-sm font-medium">Position</label>
                                    <p className="text-gray-900 text-lg font-medium">{request.employee.position}</p>
                                </div>
                                <div>
                                    <label className="text-gray-600 text-sm font-medium">Email</label>
                                    <p className="text-gray-900 text-lg font-medium">{request.employee.email}</p>
                                </div>
                                <div>
                                    <label className="text-gray-600 text-sm font-medium">Phone</label>
                                    <p className="text-gray-900 text-lg font-medium">{request.employee.phone || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Request Details Section */}
                        <div className="mb-8">
                            <h2 className="text-[#023184] text-xl font-bold mb-6 border-b-2 border-gray-200 pb-2">
                                Request Details
                            </h2>
                            
                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="text-gray-600 text-sm font-medium">Request Type</label>
                                    <p className="text-gray-900 text-lg font-medium">{formatRequestType(request.request_type)}</p>
                                </div>
                                <div>
                                    <label className="text-gray-600 text-sm font-medium">Status</label>
                                    <div className="mt-1">
                                        <span className={getStatusStyling(request.current_status)}>
                                            {formatStatus(request.current_status)}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-gray-600 text-sm font-medium">Submitted Date</label>
                                    <p className="text-gray-900 text-lg font-medium">{request.created_at}</p>
                                </div>
                                <div>
                                    <label className="text-gray-600 text-sm font-medium">Request ID</label>
                                    <p className="text-gray-900 text-lg font-medium">#{request.id.toString().padStart(6, '0')}</p>
                                </div>
                            </div>

                            {/* Purpose/Reason */}
                            <div className="mb-6">
                                <label className="text-gray-600 text-sm font-medium">Purpose/Reason</label>
                                <p className="text-gray-900 text-lg mt-1 p-4 bg-gray-50 rounded-lg">
                                    {request.purpose || 'No specific purpose provided'}
                                </p>
                            </div>
                        </div>

                        {/* Request History/Timeline */}
                        <div className="mb-8">
                            <h2 className="text-[#023184] text-xl font-bold mb-6 border-b-2 border-gray-200 pb-2">
                                Request Timeline
                            </h2>
                            
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                    <div>
                                        <p className="font-medium text-gray-900">Request Submitted</p>
                                        <p className="text-sm text-gray-600">{request.created_at}</p>
                                    </div>
                                </div>
                                
                                {request.current_status === 'approved' && (
                                    <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <div>
                                            <p className="font-medium text-gray-900">Request Approved</p>
                                            <p className="text-sm text-gray-600">Approved by HR Department</p>
                                        </div>
                                    </div>
                                )}
                                
                                {request.current_status === 'rejected' && (
                                    <div className="flex items-center gap-4 p-4 bg-red-50 rounded-lg">
                                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                        <div>
                                            <p className="font-medium text-gray-900">Request Rejected</p>
                                            <p className="text-sm text-gray-600">Rejected by HR Department</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-center gap-4 pt-6 border-t border-gray-200">
                            <button
                                onClick={() => navigate(-1)}
                                className="px-8 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
                            >
                                Back to History
                            </button>
                            <button
                                onClick={() => window.print()}
                                className="px-8 py-3 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                                style={{
                                    background: "linear-gradient(to right, #3F6EC0, #00539F, #5D3EA4, #7940A8)"
                                }}
                            >
                                Print Record
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}