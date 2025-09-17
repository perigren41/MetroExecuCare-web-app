// LOA_Submit.jsx - Fixed version
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavBarMain from "@/Components/NavBarMain";

// Assets
import BackSquareIconWhite from "@/assets/BackSquareIconWhite.svg";

// Import mock data
import { mockUser } from "./mockUser";
import { mockPendingRequests } from "./mockPendingRequests";

export default function LOA_Submit() {
    const navigate = useNavigate();
    const { requestId } = useParams();
    const user = mockUser;

    // Find the request by ID - FIXED: Compare string to string, not parseInt
    const request = mockPendingRequests.find(req => req.id === requestId);

    // State for modal/confirmation dialogs
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [returnReason, setReturnReason] = useState("");

    // If request not found, redirect back
    useEffect(() => {
        if (!request) {
            console.log("Request not found, redirecting back");
            navigate("/hr-pending-requests");
        }
    }, [request, navigate]);

    if (!request) {
        return <div>Loading...</div>;
    }

    // Rest of your component code remains the same...
    // (Format functions, handlers, etc.)

    // Format request type for display
    const formatRequestType = (type) => {
        return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    };

    // Format status for display
    const formatStatus = (status) => {
        return status
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase())
            .replace(/\bBa\b/g, "BA")
            .replace(/\bBso\b/g, "BSO");
    };

    // Get status color
    const getStatusColor = (status) => {
        switch (status) {
            case "pending review":
                return "text-yellow-600";
            case "pending ba approval":
                return "text-blue-600";
            case "pending bso approval":
                return "text-purple-600";
            case "pending division head approval":
                return "text-orange-600";
            case "approved":
                return "text-green-600";
            case "rejected":
                return "text-red-600";
            case "for return":
                return "text-gray-600";
            default:
                return "text-gray-600";
        }
    };

    // Navbar handlers
    const handleBackClick = () => {
        navigate(-1);
    };

    const handleProfileClick = () => {
        navigate("/profile", { state: { user } });
    };

    const handleLogout = () => {
        navigate("/login");
    };

    // Action handlers
    const handleApprove = () => {
        setShowApproveModal(true);
    };

    const handleReject = () => {
        setShowRejectModal(true);
    };

    const handleReturn = () => {
        setShowReturnModal(true);
    };

    const confirmApprove = () => {
        // Here you would update the request status
        console.log("Approving request:", requestId);
        setShowApproveModal(false);
        // You might want to show a success message or redirect
        navigate("/hr-pending-requests");
    };

    const confirmReject = () => {
        if (!rejectionReason.trim()) {
            alert("Please provide a reason for rejection");
            return;
        }
        console.log("Rejecting request:", requestId, "Reason:", rejectionReason);
        setShowRejectModal(false);
        setRejectionReason("");
        navigate("/hr-pending-requests");
    };

    const confirmReturn = () => {
        if (!returnReason.trim()) {
            alert("Please provide a reason for return");
            return;
        }
        console.log("Returning request:", requestId, "Reason:", returnReason);
        setShowReturnModal(false);
        setReturnReason("");
        navigate("/hr-pending-requests");
    };

    const handleDownload = () => {
        // Implement download logic
        console.log("Downloading document for request:", requestId);
    };

    const handleUpload = () => {
        // Implement upload logic
        console.log("Uploading document for request:", requestId);
    };

    // Check if user can take actions on this request
    const canApprove = () => {
        if (user.position === "Benefits Assistant" || user.username === "BA") {
            return request.current_status === "pending ba approval";
        }
        if (user.position === "Benefits Services Officer" || user.username === "BSO") {
            return request.current_status === "pending bso approval";
        }
        if (user.position === "Division Head" || user.username === "DivisionHead") {
            return request.current_status === "pending division head approval";
        }
        return false;
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Navbar */}
            <NavBarMain
                user={user}
                onBackClick={handleBackClick}
                onProfileClick={handleProfileClick}
                onLogout={handleLogout}
                showBackButton={true}
                showProfileOption={true}
                showDropdown={true}
                backButtonIcon={BackSquareIconWhite}
            />

            {/* Page Title */}
            <div className="flex justify-center mt-[43px]">
                <h1 className="text-[#023184] text-[28px] font-bold">
                    {formatRequestType(request.request_type)}
                </h1>
            </div>

            {/* Main Content Container */}
            <div className="px-[200px] mt-8">
                <div className="bg-white rounded-[32px] shadow-lg border-4 border-transparent"
                    style={{
                        background: "linear-gradient(white, white) padding-box, linear-gradient(to right, #3F6EC0, #00539F, #5D3EA4, #7940A8) border-box"
                    }}>

                    {/* Details Section */}
                    <div className="p-8">
                        <h2 className="text-[#023184] text-[24px] font-bold mb-6 text-center">Details</h2>

                        <div className="grid grid-cols-2 gap-8">
                            {/* Left Column - Request Info */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[#023184] font-semibold mb-1">Type:</label>
                                    <p className="text-gray-700 text-lg">{formatRequestType(request.request_type)}</p>
                                </div>

                                <div>
                                    <label className="block text-[#023184] font-semibold mb-1">Requested on:</label>
                                    <p className="text-gray-700 text-lg">{request.created_at}</p>
                                </div>

                                <div>
                                    <label className="block text-[#023184] font-semibold mb-1">Requested by:</label>
                                    <p className="text-gray-700 text-lg">
                                        {request.employee.first_name} {request.employee.last_name}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-[#023184] font-semibold mb-1">Employee ID:</label>
                                    <p className="text-gray-700 text-lg">{request.employee.employee_id || "N/A"}</p>
                                </div>

                                <div>
                                    <label className="block text-[#023184] font-semibold mb-1">Department:</label>
                                    <p className="text-gray-700 text-lg">{request.employee.department || "N/A"}</p>
                                </div>

                                <div>
                                    <label className="block text-[#023184] font-semibold mb-1">Current status:</label>
                                    <p className={`text-lg font-semibold ${getStatusColor(request.current_status)}`}>
                                        {formatStatus(request.current_status)}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-[#023184] font-semibold mb-1">Date of Checkup:</label>
                                    <p className="text-gray-700 text-lg">
                                        {request.checkup_date || "Not specified"}
                                    </p>
                                </div>
                            </div>

                            {/* Right Column - Document Preview */}
                            <div className="flex flex-col items-center justify-center">
                                <div className="w-64 h-80 border-4 border-[#023184] rounded-lg flex items-center justify-center bg-gray-50 mb-4">
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-[#023184] rounded-lg mx-auto mb-2 flex items-center justify-center">
                                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <p className="text-[#023184] font-medium">mtb_document.pdf</p>
                                    </div>
                                </div>

                                {/* Download and Upload Buttons */}
                                <div className="flex gap-4">
                                    <button
                                        onClick={handleDownload}
                                        className="px-6 py-2 bg-[#023184] text-white rounded-full font-medium hover:bg-[#034299] transition-colors"
                                    >
                                        Download
                                    </button>
                                    <button
                                        onClick={handleUpload}
                                        className="px-6 py-2 bg-gray-600 text-white rounded-full font-medium hover:bg-gray-700 transition-colors"
                                    >
                                        Upload
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        {canApprove() && (
                            <div className="flex justify-center gap-6 mt-8 pt-6 border-t border-gray-200">
                                <button
                                    onClick={handleApprove}
                                    className="px-8 py-3 bg-green-600 text-white rounded-full font-bold hover:bg-green-700 transition-colors"
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={handleReject}
                                    className="px-8 py-3 bg-red-600 text-white rounded-full font-bold hover:bg-red-700 transition-colors"
                                >
                                    Reject
                                </button>
                                <button
                                    onClick={handleReturn}
                                    className="px-8 py-3 bg-gray-600 text-white rounded-full font-bold hover:bg-gray-700 transition-colors"
                                >
                                    Return
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals remain the same as in your original code */}
            {/* Approval Modal */}
            {showApproveModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-mx-4">
                        <h3 className="text-lg font-bold mb-4 text-[#023184]">Confirm Approval</h3>
                        <p className="mb-6">Are you sure you want to approve this request?</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowApproveModal(false)}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmApprove}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                            >
                                Approve
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rejection Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-mx-4">
                        <h3 className="text-lg font-bold mb-4 text-[#023184]">Reject Request</h3>
                        <label className="block text-sm font-medium mb-2">Reason for rejection:</label>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded resize-none h-24 mb-4"
                            placeholder="Please provide a reason for rejection..."
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectionReason("");
                                }}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmReject}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Return Modal */}
            {showReturnModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-mx-4">
                        <h3 className="text-lg font-bold mb-4 text-[#023184]">Return Request</h3>
                        <label className="block text-sm font-medium mb-2">Reason for return:</label>
                        <textarea
                            value={returnReason}
                            onChange={(e) => setReturnReason(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded resize-none h-24 mb-4"
                            placeholder="Please provide a reason for return..."
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowReturnModal(false);
                                    setReturnReason("");
                                }}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmReturn}
                                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                            >
                                Return
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}