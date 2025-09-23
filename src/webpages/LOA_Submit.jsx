// LOA_Submit.jsx - Fully Responsive Version
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import NavBarMain from "@/Components/NavBarMain";
import ExclamationPoint from "@/assets/ExclamationPoint.svg";
import UploadIcon from "@/assets/UploadIcon.svg";
import { X } from "lucide-react";

// Assets
import BackSquareIconWhite from "@/assets/BackSquareIconWhite.svg";

// Import mock data
import { mockUser, mockUsers } from "./mockUser";
import { mockPendingRequests } from "./mockPendingRequests";

export default function LOA_Submit() {
    const navigate = useNavigate();
    const { requestId } = useParams();
    const location = useLocation();

    // Enhanced user state management
    const [user, setUser] = useState(() => {
        // Priority order:
        // 1. User from navigation state
        // 2. User from sessionStorage
        // 3. Default mockUser
        const userFromState = location.state?.user;
        const userFromStorage = sessionStorage.getItem("user")
            ? JSON.parse(sessionStorage.getItem("user"))
            : null;

        return userFromState || userFromStorage || mockUser;
    });

    // Helper function to get user display name
    const getUserDisplayName = (user) => {
        return `${user.first_name} ${user.last_name}`;
    };

    // Helper function to get user initials
    const getUserInitials = (user) => {
        return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`;
    };

    // Store user to sessionStorage whenever we have a user from navigation
    useEffect(() => {
        if (location.state?.user) {
            sessionStorage.setItem("user", JSON.stringify(location.state.user));
            setUser(location.state.user);
        }
    }, [location.state]);

    // Find the request by ID - Compare string to string
    const request = mockPendingRequests.find(req => req.id === requestId);

    // State for modal/confirmation dialogs
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [approvalComment, setApprovalComment] = useState("");
    const [isDragOver, setIsDragOver] = useState(false);
    const [tempFile, setTempFile] = useState(null);

    // If request not found, redirect back
    useEffect(() => {
        if (!request) {
            console.log("Request not found, redirecting back");
            navigate("/hr-pending-requests", { state: { user } });
        }
    }, [request, navigate, user]);

    if (!request) {
        return <div>Loading...</div>;
    }

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

    const handleLogout = () => {
        // Clear session data
        sessionStorage.removeItem("user");
        sessionStorage.clear();
        localStorage.removeItem('authToken');
        navigate("/login", { replace: true });
    };

    // Action handlers
    const handleApprove = () => {
        setShowApproveModal(true);
    };

    const handleReject = () => {
        setShowRejectModal(true);
    };

    const handleReturn = () => {
        console.log("Returning request:", requestId);
        navigate("/hr-pending-requests", { state: { user } });
    };

    const confirmApprove = () => {
        console.log("Approving request:", requestId);
        if (approvalComment.trim()) {
            console.log("Approval comment:", approvalComment);
        }
        setShowApproveModal(false);
        setApprovalComment(""); // Clear comment after approval
        navigate("/hr-pending-requests", { state: { user } });
    };

    const confirmReject = () => {
        if (!rejectionReason.trim()) {
            alert("Please provide a reason for rejection");
            return;
        }
        console.log("Rejecting request:", requestId, "Reason:", rejectionReason);
        setShowRejectModal(false);
        setRejectionReason("");
        navigate("/hr-pending-requests", { state: { user } });
    };

    const confirmReturn = () => {
        console.log("Returning request:", requestId);
        navigate("/hr-pending-requests", { state: { user } });
    };

    const handleDownload = () => {
        // Create a sample PDF blob for demonstration
        const pdfContent = `%PDF-1.4
1 0 obj

/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj

/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj

/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj

/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(LOA Document - Request #${requestId}) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000207 00000 n 
trailer

/Size 5
/Root 1 0 R
>>
startxref
299
%%EOF`;

        const blob = new Blob([pdfContent], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `LOA_Request_${requestId}_document.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        console.log("Document downloaded for request:", requestId);
    };

    // Upload modal handlers
    const handleUpload = () => {
        setShowUploadModal(true);
    };

    const closeUploadModal = () => {
        setShowUploadModal(false);
        setTempFile(null);
        setIsDragOver(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            validateAndSetFile(file);
        }
    };

    const handleUploadAreaClick = () => {
        document.getElementById('fileInput').click();
    };

    const handleFileInputChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            validateAndSetFile(file);
        }
    };

    const validateAndSetFile = (file) => {
        // Check file size (limit to 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('File size must be less than 10MB');
            return;
        }

        // Check file type - only allow PDF for this upload modal
        if (file.type !== 'application/pdf') {
            alert('Please upload only PDF files');
            return;
        }

        setTempFile(file);
        console.log("File selected:", file.name, "Size:", file.size, "Type:", file.type);
    };

    const handleFinalUpload = () => {
        if (!tempFile) return;

        console.log("Uploading file:", tempFile.name, "Size:", tempFile.size, "Type:", tempFile.type);

        // Simulate upload progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            if (progress <= 100) {
                console.log(`Upload progress: ${progress}%`);
                if (progress === 100) {
                    console.log("File uploaded successfully for request:", requestId);
                    alert(`File "${tempFile.name}" uploaded successfully!`);
                    closeUploadModal();
                    clearInterval(interval);
                }
            }
        }, 200);
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

    // Check if user can see the Return button (only BAs can see "for return" requests)
    const canShowReturn = () => {
        return (user.position === "Benefits Assistant" || user.username === "BA") &&
            request.current_status === "for return";
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Updated Navbar with proper user display */}
            <NavBarMain
                user={{
                    ...user,
                    name: getUserDisplayName(user)
                }}
                onLogout={handleLogout}
                showHomeButton={true}
                backButtonIcon={BackSquareIconWhite}
            />

            {/* Page Title - Responsive */}
            <div className="flex justify-center mt-4 md:mt-8 lg:mt-[43px] px-4">
                <h1 className="text-[#023184] text-xl sm:text-2xl md:text-[28px] font-bold text-center">
                    {formatRequestType(request.request_type)}
                </h1>
            </div>

            {/* Main Content Container - Responsive */}
            <div className="px-4 sm:px-8 md:px-16 lg:px-32 xl:px-[200px] mt-4 md:mt-8 pb-8">
                <div className="bg-white rounded-2xl md:rounded-[32px] shadow-lg border-2 md:border-4 border-transparent"
                    style={{
                        background: "linear-gradient(white, white) padding-box, linear-gradient(to right, #3F6EC0, #00539F, #5D3EA4, #7940A8) border-box"
                    }}>

                    {/* Details Section - Responsive */}
                    <div className="p-4 sm:p-6 md:p-8">
                        <h2 className="text-[#023184] text-lg sm:text-xl md:text-[24px] font-bold mb-4 md:mb-6 text-center">Details</h2>

                        {/* Responsive Grid Layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                            {/* Left Column - Request Info */}
                            <div className="space-y-3 sm:space-y-4 order-2 lg:order-1">
                                <div>
                                    <label className="block text-[#023184] font-semibold mb-1 text-sm sm:text-base">Type:</label>
                                    <p className="text-gray-700 text-sm sm:text-base lg:text-lg">{formatRequestType(request.request_type)}</p>
                                </div>

                                <div>
                                    <label className="block text-[#023184] font-semibold mb-1 text-sm sm:text-base">Requested on:</label>
                                    <p className="text-gray-700 text-sm sm:text-base lg:text-lg">{request.created_at}</p>
                                </div>

                                <div>
                                    <label className="block text-[#023184] font-semibold mb-1 text-sm sm:text-base">Requested by:</label>
                                    <p className="text-gray-700 text-sm sm:text-base lg:text-lg">
                                        {request.employee.first_name} {request.employee.last_name}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-[#023184] font-semibold mb-1 text-sm sm:text-base">Employee ID:</label>
                                    <p className="text-gray-700 text-sm sm:text-base lg:text-lg">{request.employee.employee_id || "N/A"}</p>
                                </div>

                                <div>
                                    <label className="block text-[#023184] font-semibold mb-1 text-sm sm:text-base">Department:</label>
                                    <p className="text-gray-700 text-sm sm:text-base lg:text-lg">{request.employee.department || "N/A"}</p>
                                </div>

                                <div>
                                    <label className="block text-[#023184] font-semibold mb-1 text-sm sm:text-base">Current status:</label>
                                    <p className={`text-sm sm:text-base lg:text-lg font-semibold ${getStatusColor(request.current_status)}`}>
                                        {formatStatus(request.current_status)}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-[#023184] font-semibold mb-1 text-sm sm:text-base">Date of Checkup:</label>
                                    <p className="text-gray-700 text-sm sm:text-base lg:text-lg">
                                        {request.checkup_date || "Not specified"}
                                    </p>
                                </div>
                            </div>

                            {/* Right Column - Document Preview - Responsive */}
                            <div className="flex flex-col items-center justify-center order-1 lg:order-2">
                                <div className="w-48 h-60 sm:w-56 sm:h-72 md:w-64 md:h-80 border-2 md:border-4 border-[#023184] rounded-lg flex items-center justify-center bg-gray-50 mb-4">
                                    <div className="text-center">
                                        <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-[#023184] rounded-lg mx-auto mb-2 flex items-center justify-center">
                                            <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <p className="text-[#023184] font-medium text-sm sm:text-base">mtb_document.pdf</p>
                                    </div>
                                </div>

                                {/* Download and Upload Buttons - Responsive */}
                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                                    <button
                                        onClick={handleDownload}
                                        className="px-4 sm:px-6 py-2 bg-[#023184] text-white rounded-full font-medium hover:bg-[#034299] transition-colors text-sm sm:text-base w-full sm:w-auto"
                                    >
                                        Download
                                    </button>
                                    <button
                                        onClick={handleUpload}
                                        className="px-4 sm:px-6 py-2 bg-gray-600 text-white rounded-full font-medium hover:bg-gray-700 transition-colors text-sm sm:text-base w-full sm:w-auto"
                                    >
                                        Upload
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons - Responsive */}
                        <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mt-6 md:mt-8 pt-4 md:pt-6 border-t border-gray-200">
                            {/* Show Approve/Reject buttons for pending approvals */}
                            {canApprove() && (
                                <>
                                    <button
                                        onClick={handleApprove}
                                        className="px-6 sm:px-8 py-3 bg-green-600 text-white rounded-full font-bold hover:bg-green-700 transition-colors text-sm sm:text-base w-full sm:w-auto"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={handleReject}
                                        className="px-6 sm:px-8 py-3 bg-red-600 text-white rounded-full font-bold hover:bg-red-700 transition-colors text-sm sm:text-base w-full sm:w-auto"
                                    >
                                        Reject
                                    </button>
                                </>
                            )}

                            {/* Show Return button only for BAs viewing "for return" status */}
                            {canShowReturn() && (
                                <button
                                    onClick={handleReturn}
                                    className="px-6 sm:px-8 py-3 bg-gray-600 text-white rounded-full font-bold hover:bg-gray-700 transition-colors text-sm sm:text-base w-full sm:w-auto"
                                >
                                    Return
                                </button>
                            )}

                            {/* Show message if no actions are available */}
                            {!canApprove() && !canShowReturn() && (
                                <p className="text-gray-500 italic text-center text-sm sm:text-base">No actions available for this request status.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Approval Modal - Responsive */}
            {showApproveModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl md:rounded-[32px] shadow-lg border border-gray-300 overflow-hidden w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        {/* Gradient header with X button */}
                        <div
                            className="flex items-center justify-between px-4 md:px-6 py-2"
                            style={{
                                background: "linear-gradient(90deg, #3F6EC0 0%, #00539F 29%, #5D3EA4 57%, #7940A8 79%)",
                            }}
                        >
                            <span className="text-white font-semibold">&nbsp;</span>
                            <button
                                onClick={() => {
                                    setShowApproveModal(false);
                                    setApprovalComment("");
                                }}
                                aria-label="Close approval modal"
                                className="text-white text-2xl md:text-3xl font-bold leading-none hover:opacity-80"
                                style={{ lineHeight: "1" }}
                            >
                                &times;
                            </button>
                        </div>

                        {/* Modal content - Responsive */}
                        <div className="flex flex-col p-4 md:p-6 bg-white">
                            {/* Top section with icon and text - Responsive layout */}
                            <div className="flex flex-col md:flex-row items-start mb-4">
                                <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6 self-center md:self-start">
                                    <img
                                        src={ExclamationPoint}
                                        alt="Exclamation Point"
                                        className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36"
                                    />
                                </div>

                                {/* Text content */}
                                <div className="flex-grow">
                                    <h2 className="text-[#023184] text-lg sm:text-xl font-bold mb-2 text-center md:text-left">
                                        Approve Letter of Approval
                                    </h2>
                                    <p className="text-gray-700 text-center md:text-left text-sm sm:text-base leading-relaxed mb-4">
                                        Are you sure you want to <strong>approve</strong> this request?
                                        Once approved, it will be forwarded for review and{" "}
                                        <strong>cannot</strong> be edited.
                                    </p>

                                    <p className="text-gray-600 text-center md:text-left text-sm sm:text-base mb-3">
                                        If you have any comments, kindly leave them here.
                                    </p>
                                </div>
                            </div>

                            {/* Text area - Responsive */}
                            <div className="mb-4">
                                <textarea
                                    value={approvalComment}
                                    onChange={(e) => setApprovalComment(e.target.value)}
                                    className="w-full h-20 sm:h-24 p-3 border-2 border-gray-300 rounded-lg resize-none outline-none text-gray-700 focus:border-[#023184] transition-colors text-sm sm:text-base"
                                    placeholder="Optional: Enter your comments here..."
                                />
                            </div>

                            {/* Action buttons - Responsive */}
                            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                                <button
                                    onClick={() => {
                                        setShowApproveModal(false);
                                        setApprovalComment("");
                                    }}
                                    className="px-6 sm:px-8 py-2 bg-gray-400 text-white rounded-full font-medium hover:bg-gray-500 transition-colors text-sm sm:text-base w-full sm:w-auto order-2 sm:order-1"
                                    style={{
                                        backgroundColor: "#CACACA",
                                        color: "#4E4E4E",
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmApprove}
                                    className="px-6 sm:px-8 py-2 bg-blue-700 text-white rounded-full font-medium hover:bg-blue-800 transition-colors text-sm sm:text-base w-full sm:w-auto order-1 sm:order-2"
                                    style={{ backgroundColor: "#023184", color: "white" }}
                                >
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Rejection Modal - Responsive */}
            {showRejectModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl md:rounded-[32px] shadow-lg border border-gray-300 overflow-hidden w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        {/* Gradient header */}
                        <div
                            className="flex items-center justify-between px-4 md:px-6 py-2"
                            style={{
                                background: "linear-gradient(90deg, #3F6EC0 0%, #00539F 29%, #5D3EA4 57%, #7940A8 79%)",
                            }}
                        >
                            <span className="text-white font-semibold text-sm sm:text-base">Reason for Rejection</span>
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectionReason("");
                                }}
                                aria-label="Close rejection modal"
                                className="text-white text-2xl md:text-3xl font-bold leading-none hover:opacity-80"
                                style={{ lineHeight: "1" }}
                            >
                                &times;
                            </button>
                        </div>

                        {/* Modal content - Responsive */}
                        <div className="p-4 md:p-6 bg-white">
                            <p className="text-gray-700 mb-4 text-sm sm:text-base">Kindly leave a comment explaining the reason for rejection.</p>

                            {/* Text area with box - Responsive */}
                            <div className="relative mb-6">
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    className="w-full h-32 sm:h-40 md:h-48 p-4 border-2 border-gray-300 rounded-lg resize-none outline-none text-gray-700 focus:border-[#023184] transition-colors text-sm sm:text-base"
                                    placeholder="Enter your comment here..."
                                />
                            </div>

                            {/* Action buttons - Responsive */}
                            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                                <button
                                    onClick={() => {
                                        setShowRejectModal(false);
                                        setRejectionReason("");
                                    }}
                                    className="px-6 sm:px-8 py-2 bg-gray-400 text-white rounded-full font-medium hover:bg-gray-500 transition-colors text-sm sm:text-base w-full sm:w-auto order-2 sm:order-1"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmReject}
                                    className="px-6 sm:px-8 py-2 bg-red-600 text-white rounded-full font-medium hover:bg-red-700 transition-colors text-sm sm:text-base w-full sm:w-auto order-1 sm:order-2"
                                >
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Upload Modal - Responsive */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    {/* Modal Container - Responsive */}
                    <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl w-full max-w-md sm:max-w-lg md:max-w-xl mx-4 overflow-hidden max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="bg-[linear-gradient(to_right,#3F6EC0_2%,#00539F_30%,#5D3EA4_50%,#7940A8_75%)] 
                        flex items-center justify-between text-white px-4 py-2">
                            <h2 className="text-white text-sm sm:text-base font-semibold">Upload</h2>
                            <button
                                onClick={closeUploadModal}
                                className="text-white hover:text-gray-200 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        {/* Modal Body - Responsive */}
                        <div className="p-4 sm:p-6">
                            {!tempFile ? (
                                /* Upload Area - Responsive */
                                <div
                                    className={`flex flex-col items-center justify-center rounded-2xl 
                                        transition-all duration-200 cursor-pointer px-6 sm:px-12 md:px-20 py-8 sm:py-10 text-sm
                                        ${isDragOver
                                            ? 'bg-blue-50'
                                            : 'hover:bg-gray-50'
                                        }`}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={handleUploadAreaClick}
                                >
                                    {/* Upload Icon - Responsive */}
                                    <img src={UploadIcon} alt="Upload Icon" className="w-20 h-20 sm:w-24 sm:h-24 md:w-30 md:h-30 mb-2" />

                                    {/* Upload Text - Responsive */}
                                    <p className="text-gray-600 text-center text-sm sm:text-base">
                                        {isDragOver
                                            ? 'Drop your file here!'
                                            : 'Drop signed document here, or click here to browse'
                                        }
                                    </p>
                                    {/* Hidden File Input */}
                                    <input
                                        id="fileInput"
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleFileInputChange}
                                        className="hidden"
                                    />
                                </div>
                            ) : (
                                /* File Selected View - Responsive */
                                <div>
                                    <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg mb-4">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-500 rounded-lg flex items-center justify-center mr-3">
                                                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{tempFile.name}</p>
                                                <p className="text-xs sm:text-sm text-gray-500">{(tempFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setTempFile(null)}
                                            className="text-gray-400 hover:text-gray-600 ml-2"
                                        >
                                            <X className="w-4 h-4 sm:w-5 sm:h-5" />
                                        </button>
                                    </div>

                                    <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                                        <button
                                            onClick={closeUploadModal}
                                            className="px-4 sm:px-6 py-2 bg-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-400 transition-colors text-sm sm:text-base w-full sm:w-auto order-2 sm:order-1"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleFinalUpload}
                                            className="px-4 sm:px-6 py-2 bg-[#023184] text-white rounded-full font-medium hover:bg-[#034299] transition-colors text-sm sm:text-base w-full sm:w-auto order-1 sm:order-2"
                                        >
                                            Upload
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}