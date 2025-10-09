// HR_PendingRequestsPage.jsx - Fixed version with proper user management
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import NavBarMain from "@/Components/NavBarMain";
import apiService from "@/services/api";

// Assets
import BackSquareIconWhite from "@/assets/BackSquareIconWhite.svg";
import MetroBankLogo from "@/assets/metroBankLogo2.svg";
import RoundArrowRightWhiteArrow from "@/assets/RoundArrowRightWhiteArrow.svg";
import SearchIcon from "@/assets/search.svg";

export default function HR_PendingRequestsPage() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const filterPopupRef = useRef(null);

    // State for pending requests data
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

    const [searchTerm, setSearchTerm] = useState("");
    const [showFilterPopup, setShowFilterPopup] = useState(false);

    // Filter states
    const [filters, setFilters] = useState({
        employeeName: "",
        requestType: "",
        status: [],
        dateSubmitted: "",
    });

    const [tempFilters, setTempFilters] = useState(filters);
    const [specificDate, setSpecificDate] = useState("");

    // Claim modal states
    const [showClaimModal, setShowClaimModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [claiming, setClaiming] = useState(false);

    // Fetch pending requests from API based on HR role
    const fetchPendingRequests = async () => {
        try {
            setLoading(true);

            // Use getPendingApprovals which properly filters out claimed requests
            const response = await apiService.getPendingApprovals(user?.role);

            if (response.success) {
                // getPendingApprovals returns approvals array with request details
                const requests = response.data.approvals.map(approval => ({
                    id: approval.request_id,
                    request_number: approval.request_number,
                    request_type: approval.request_type,
                    current_status: approval.current_status,
                    priority_level: approval.priority_level,
                    created_at: approval.request_created_at,
                    employee: {
                        first_name: approval.employee_first_name,
                        last_name: approval.employee_last_name,
                        employee_id: approval.employee_id
                    },
                    assigned_hr_id: approval.approver_id,
                    hospital_name: approval.hospital_name
                }));
                setPendingRequests(requests);
            } else {
                setError('Failed to fetch pending requests');
            }
        } catch (err) {
            console.error('Error fetching pending requests:', err);
            setError('Failed to load pending requests');
        } finally {
            setLoading(false);
        }
    };

    // Load pending requests on component mount
    useEffect(() => {
        if (user) {
            fetchPendingRequests();
        }
    }, [user]);

    // Close popup when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (filterPopupRef.current && !filterPopupRef.current.contains(event.target)) {
                setShowFilterPopup(false);
            }
        }

        if (showFilterPopup) {
            document.addEventListener("click", handleClickOutside);
        }

        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [showFilterPopup]);

    // Format request type for display
    const formatRequestType = (type) => {
        return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    };

    // Format status for display with clear labels for HR workflow
    const formatStatus = (status) => {
        const statusMap = {
            'pending': 'Needs to be Claimed',
            'assigned_to_hr': 'Assigned to HR',
            'hr_processing': 'HR Processing',
            'benefits_review': 'Pending BSO Approval',
            'welfare_review': 'Pending Final Approval',
            'approved': 'Final Approval Completed',
            'rejected': 'Rejected',
            'completed': 'Completed'
        };

        return statusMap[status] || status
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase());
    };

    // Get status styling - Plain text without colors
    const getStatusStyling = (status) => {
        return "text-gray-700 px-2 py-1 text-sm md:text-base font-medium";
    };

    // Handle row click to navigate to record summary or show claim modal
    const handleRecordClick = (requestId) => {
        const request = pendingRequests.find(req => req.id === requestId);

        if (!request) return;

        // Determine if request needs to be claimed based on role and status
        let needsClaim = false;

        if (user?.role === 'hr_personnel' && request.current_status === 'pending' && !request.assigned_hr_id) {
            needsClaim = true;
        } else if (user?.role === 'benefits_officer' && request.current_status === 'benefits_review') {
            // Check if not yet claimed by checking if approver_id is null for benefits_stage
            // For now, show claim modal for all benefits_review requests
            needsClaim = true;
        } else if (user?.role === 'welfare_head' && request.current_status === 'welfare_review') {
            // Check if not yet claimed by checking if approver_id is null for welfare_stage
            // For now, show claim modal for all welfare_review requests
            needsClaim = true;
        }

        if (needsClaim) {
            setSelectedRequest(request);
            setShowClaimModal(true);
        } else {
            // Direct navigation for already claimed requests
            navigate(`/loa-submit/${requestId}`, { state: { user } });
        }
    };

    // Handle claim request
    const handleClaimRequest = async () => {
        if (!selectedRequest || claiming) return;

        setClaiming(true);
        try {
            const response = await apiService.claimRequest(selectedRequest.id);

            if (response.success) {
                // Close modal
                setShowClaimModal(false);
                setSelectedRequest(null);

                // Refresh the pending requests list to remove claimed request
                await fetchPendingRequests();

                // Navigate to the request page
                navigate(`/loa-submit/${selectedRequest.id}`, { state: { user } });
            } else {
                alert('Failed to claim request: ' + (response.message || 'This request may have already been claimed by another HR personnel.'));
            }
        } catch (error) {
            console.error('Error claiming request:', error);
            alert('Failed to claim request: ' + error.message);
        } finally {
            setClaiming(false);
        }
    };

    // Close claim modal
    const closeClaimModal = () => {
        setShowClaimModal(false);
        setSelectedRequest(null);
    };

    // Handle filter popup
    const handleFilterClick = (e) => {
        e.stopPropagation();
        setTempFilters(filters);
        setSpecificDate(filters.dateSubmitted === "specific" ? specificDate : "");
        setShowFilterPopup(true);
    };

    const handleFilterClose = () => {
        setShowFilterPopup(false);
    };

    const handleFilterConfirm = () => {
        setFilters(tempFilters);
        setShowFilterPopup(false);
    };

    // Handle filter reset
    const handleFilterReset = () => {
        const defaultFilters = {
            employeeName: "",
            requestType: "",
            status: [],
            dateSubmitted: "",
        };

        setTempFilters(defaultFilters);
        setSpecificDate("");
        setFilters(defaultFilters);
        setShowFilterPopup(false);
    };

    // Handle status toggle for checkboxes (multi-select)
    const handleStatusToggle = (status) => {
        setTempFilters((prev) => ({
            ...prev,
            status: prev.status.includes(status)
                ? prev.status.filter((s) => s !== status)
                : [...prev.status, status],
        }));
    };

    // Check if date matches filter criteria
    const dateMatches = (dateStr, filterType, specificDateValue) => {
        const requestDate = new Date(dateStr);
        const today = new Date();

        switch (filterType) {
            case "today":
                return requestDate.toDateString() === today.toDateString();
            case "this_week":
                const weekStart = new Date(today);
                weekStart.setHours(0, 0, 0, 0);
                weekStart.setDate(today.getDate() - today.getDay());
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6);
                return requestDate >= weekStart && requestDate <= weekEnd;
            case "this_month":
                return (
                    requestDate.getMonth() === today.getMonth() &&
                    requestDate.getFullYear() === today.getFullYear()
                );
            case "specific":
                return (
                    specificDateValue &&
                    requestDate.toDateString() === new Date(specificDateValue).toDateString()
                );
            default:
                return true;
        }
    };

    // FIXED: Updated logout handler
    const handleLogout = () => {
        sessionStorage.removeItem("user");
        sessionStorage.clear();
        localStorage.removeItem('authToken');
        navigate("/login", { replace: true });
    };

    // Role-based filtering: show requests that need current user's action
    const roleFilteredRequests = pendingRequests.filter((req) => {
        if (!user) return false;

        // HR Personnel: Show pending (unassigned) requests and requests assigned to current user
        if (user.role === 'hr_personnel') {
            return (req.current_status === 'pending') ||
                   (req.current_status === 'hr_processing' && req.assigned_hr_id === user.id);
        }

        // Benefits Officer: Requests that have been approved by HR and need BSO approval
        if (user.role === 'benefits_officer') {
            return req.current_status === 'benefits_review';
        }

        // Welfare Head: Requests that have been approved by BSO and need final approval
        if (user.role === 'welfare_head') {
            return req.current_status === 'welfare_review';
        }

        // Legacy position-based filtering for backward compatibility
        if (user.position === "Benefits Assistant" || user.username === "ba") {
            return ['pending', 'assigned_to_hr', 'hr_processing'].includes(req.current_status);
        }

        if (user.position === "Benefits Services Officer" || user.username === "bso") {
            return req.current_status === 'benefits_review';
        }

        if (user.position === "Division Head" || user.username === "dh") {
            return req.current_status === 'welfare_review';
        }

        // Default: show all for debugging
        return true;
    });

    // Filter and sort requests
    const filteredRequests = roleFilteredRequests
        .filter((req) => {
            if (!req.employee) return false;
            const fullName = `${req.employee.first_name || ''} ${req.employee.last_name || ''}`.toLowerCase();
            const matchesSearch = fullName.includes(searchTerm.toLowerCase());
            const matchesType = filters.requestType === "" || req.request_type === filters.requestType;
            const matchesStatus = filters.status.length === 0 || filters.status.includes(req.current_status);
            const matchesDate = dateMatches(req.created_at, filters.dateSubmitted, specificDate);

            return matchesSearch && matchesType && matchesStatus && matchesDate;
        })
        .sort((a, b) => {
            if (filters.employeeName === "a-z") {
                const nameA = `${a.employee?.first_name || ''} ${a.employee?.last_name || ''}`;
                const nameB = `${b.employee?.first_name || ''} ${b.employee?.last_name || ''}`;
                return nameA.localeCompare(nameB);
            } else if (filters.employeeName === "z-a") {
                const nameA = `${a.employee?.first_name || ''} ${a.employee?.last_name || ''}`;
                const nameB = `${b.employee?.first_name || ''} ${b.employee?.last_name || ''}`;
                return nameB.localeCompare(nameA);
            }
            return 0;
        });

    // Status options based on current database schema
    const statusOptions = [
        "pending",
        "assigned_to_hr",
        "hr_processing",
        "benefits_review",
        "welfare_review",
        "approved",
        "rejected",
        "completed"
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* FIXED: Updated Navbar with proper user display */}
            <NavBarMain
                user={{
                    ...user,
                    name: getUserDisplayName(user)
                }}
                onLogout={handleLogout}
                backButtonIcon={BackSquareIconWhite}
            />

            {/* Title */}
            <div className="flex justify-center mt-6 md:mt-[43px] px-4">
                <h1 className="text-[#023184] text-xl md:text-[28px] font-bold text-center">
                    Pending Requests
                </h1>
            </div>

            {/* Rest of the component remains the same... */}
            {/* Search + Filter Button */}
            <div className="px-4 md:px-8 lg:px-[200px] mt-2 flex flex-col sm:flex-row items-center gap-3 relative">
                {/* Search Input */}
                <div className="relative w-full sm:flex-shrink-0 sm:w-[400px] lg:w-[500px] h-[38px]">
                    <div
                        className="absolute inset-0 rounded-full p-[2px]"
                        style={{
                            background:
                                "linear-gradient(to right, #3F6EC0, #00539F, #5D3EA4, #7940A8)",
                        }}
                    >
                        <div className="w-full h-full bg-white rounded-full flex items-center px-4">
                            <img
                                src={SearchIcon}
                                alt="Search"
                                className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0"
                            />
                            <input
                                type="text"
                                placeholder="Search by name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full h-full border-0 bg-transparent focus:outline-none text-gray-700 placeholder-gray-400"
                            />
                        </div>
                    </div>
                </div>

                {/* Filter Button Container */}
                <div className="relative w-full sm:w-auto">
                    <button
                        onClick={handleFilterClick}
                        className="w-full sm:w-auto px-5 py-2 rounded-full text-base font-bold hover:opacity-80 transition-all text-white cursor-pointer"
                        style={{
                            background:
                                "linear-gradient(to right, #3F6EC0, #00539F, #5D3EA4, #7940A8)",
                        }}
                    >
                        Filter
                    </button>

                    {/* Filter Popup - keeping the existing implementation */}
                    {showFilterPopup && (
                        <div
                            ref={filterPopupRef}
                            className="absolute top-full left-0 sm:left-auto sm:right-0 mt-2 shadow-lg border border-gray-300 z-50 bg-white rounded-3xl overflow-hidden w-screen max-w-[95vw] sm:max-w-none sm:w-[500px] lg:w-[678px]"
                            style={{
                                maxHeight: "80vh",
                                zIndex: 1000,
                            }}
                        >
                            {/* Gradient header */}
                            <div
                                className="flex items-center justify-between px-4 md:px-6 h-[38px]"
                                style={{
                                    background: "linear-gradient(90deg, #3F6EC0 0%, #00539F 29%, #5D3EA4 57%, #7940A8 79%)",
                                }}
                            >
                                <span className="text-white font-semibold">Filters</span>
                                <button
                                    onClick={handleFilterClose}
                                    aria-label="Close filter popup"
                                    className="text-white text-3xl font-bold leading-none"
                                    style={{ lineHeight: "1" }}
                                >
                                    &times;
                                </button>
                            </div>

                            {/* Scrollable content */}
                            <div className="overflow-y-auto max-h-[calc(80vh-38px)]">
                                <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 px-4 md:px-6 py-3 bg-white">
                                    {/* Left column / First section */}
                                    <div className="flex-1 flex flex-col gap-3">
                                        {/* Employee Information */}
                                        <div>
                                            <div className="text-left font-semibold text-[#023184] mb-0.5 text-sm">
                                                Employee Information
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="flex items-center gap-2 text-sm">
                                                    <input
                                                        type="radio"
                                                        name="employeeName"
                                                        value="a-z"
                                                        checked={tempFilters.employeeName === "a-z"}
                                                        onChange={() =>
                                                            setTempFilters((prev) => ({ ...prev, employeeName: "a-z" }))
                                                        }
                                                    />
                                                    Name (A–Z, Ascending)
                                                </label>
                                                <label className="flex items-center gap-2 text-sm">
                                                    <input
                                                        type="radio"
                                                        name="employeeName"
                                                        value="z-a"
                                                        checked={tempFilters.employeeName === "z-a"}
                                                        onChange={() =>
                                                            setTempFilters((prev) => ({ ...prev, employeeName: "z-a" }))
                                                        }
                                                    />
                                                    Name (Z–A, Descending)
                                                </label>
                                            </div>
                                        </div>

                                        {/* Request Details */}
                                        <div>
                                            <div className="text-left font-semibold text-[#023184] mb-0.5 text-sm">
                                                Request Details
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="flex items-center gap-2 text-sm">
                                                    <input
                                                        type="radio"
                                                        name="requestType"
                                                        value="letter_of_approval"
                                                        checked={tempFilters.requestType === "letter_of_approval"}
                                                        onChange={() =>
                                                            setTempFilters((prev) => ({ ...prev, requestType: "letter_of_approval" }))
                                                        }
                                                    />
                                                    Letter of Approval
                                                </label>
                                                <label className="flex items-center gap-2 text-sm">
                                                    <input
                                                        type="radio"
                                                        name="requestType"
                                                        value="letter_of_authorization"
                                                        checked={tempFilters.requestType === "letter_of_authorization"}
                                                        onChange={() =>
                                                            setTempFilters((prev) => ({ ...prev, requestType: "letter_of_authorization" }))
                                                        }
                                                    />
                                                    Letter of Authorization
                                                </label>
                                            </div>
                                        </div>

                                        {/* Status */}
                                        <div>
                                            <div className="text-left font-semibold text-[#023184] mb-0.5 text-sm">Status</div>
                                            <div className="flex flex-col gap-1">
                                                {statusOptions.map((status) => (
                                                    <label key={status} className="flex items-center gap-2 text-sm">
                                                        <input
                                                            type="checkbox"
                                                            checked={tempFilters.status.includes(status)}
                                                            onChange={() => handleStatusToggle(status)}
                                                            className="mr-1"
                                                        />
                                                        {formatStatus(status)}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right column / Second section */}
                                    <div className="flex-1 flex flex-col justify-between gap-3">
                                        {/* Date Submitted */}
                                        <div className="flex-1">
                                            <div className="text-left font-semibold text-[#023184] mb-0.5 text-sm">
                                                Date Submitted
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="radio"
                                                            name="dateSubmitted"
                                                            value="specific"
                                                            checked={tempFilters.dateSubmitted === "specific"}
                                                            onChange={() =>
                                                                setTempFilters((prev) => ({ ...prev, dateSubmitted: "specific" }))
                                                            }
                                                        />
                                                        Specific Date:
                                                    </div>
                                                    <input
                                                        type="date"
                                                        value={specificDate}
                                                        disabled={tempFilters.dateSubmitted !== "specific"}
                                                        onChange={(e) => setSpecificDate(e.target.value)}
                                                        className="border border-gray-300 rounded px-2 py-1 text-xs flex-shrink-0"
                                                        style={{
                                                            background:
                                                                tempFilters.dateSubmitted === "specific" ? "#fff" : "#f1f1f1",
                                                        }}
                                                    />
                                                </label>
                                                <label className="flex items-center gap-2 text-sm">
                                                    <input
                                                        type="radio"
                                                        name="dateSubmitted"
                                                        value="today"
                                                        checked={tempFilters.dateSubmitted === "today"}
                                                        onChange={() =>
                                                            setTempFilters((prev) => ({ ...prev, dateSubmitted: "today" }))
                                                        }
                                                    />
                                                    Today
                                                </label>
                                                <label className="flex items-center gap-2 text-sm">
                                                    <input
                                                        type="radio"
                                                        name="dateSubmitted"
                                                        value="this_week"
                                                        checked={tempFilters.dateSubmitted === "this_week"}
                                                        onChange={() =>
                                                            setTempFilters((prev) => ({ ...prev, dateSubmitted: "this_week" }))
                                                        }
                                                    />
                                                    This Week
                                                </label>
                                                <label className="flex items-center gap-2 text-sm">
                                                    <input
                                                        type="radio"
                                                        name="dateSubmitted"
                                                        value="this_month"
                                                        checked={tempFilters.dateSubmitted === "this_month"}
                                                        onChange={() =>
                                                            setTempFilters((prev) => ({ ...prev, dateSubmitted: "this_month" }))
                                                        }
                                                    />
                                                    This Month
                                                </label>
                                            </div>
                                        </div>

                                        {/* Reset and Confirm Buttons */}
                                        <div className="flex justify-end gap-3 pt-2 mt-4">
                                            <button
                                                onClick={handleFilterReset}
                                                className="bg-gray-400 text-white font-regular rounded-full px-4 md:px-6 py-1 text-sm shadow-sm hover:bg-gray-500 transition-colors"
                                            >
                                                Reset
                                            </button>
                                            <button
                                                onClick={handleFilterConfirm}
                                                className="bg-[#0F367F] text-white font-regular rounded-full px-4 md:px-6 py-1 text-sm shadow-sm"
                                            >
                                                Confirm
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Table Container */}
            <div className="mt-2 px-4 md:px-8 lg:px-[200px]">
                {/* Mobile Card View */}
                <div className="block lg:hidden">
                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#023184] mx-auto mb-4"></div>
                                <p className="text-gray-500">Loading pending requests...</p>
                            </div>
                        ) : error ? (
                            <div className="text-center py-8 text-red-500">
                                <p>{error}</p>
                                <button
                                    onClick={fetchPendingRequests}
                                    className="mt-4 px-4 py-2 bg-[#023184] text-white rounded-lg hover:bg-[#034299] transition-colors"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : filteredRequests.map((req) => (
                            <div
                                key={req.id}
                                className="bg-white rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => handleRecordClick(req.id)}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#3F6EC0] to-[#7940A8] flex items-center justify-center text-white font-semibold text-sm">
                                            {req.employee?.first_name?.[0] || 'U'}{req.employee?.last_name?.[0] || 'U'}
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900 text-sm">
                                                {req.employee?.first_name || 'Unknown'} {req.employee?.last_name || 'User'}
                                            </h3>
                                        </div>
                                    </div>
                                    <img
                                        src={RoundArrowRightWhiteArrow}
                                        alt="View details"
                                        className="w-8 h-8 flex-shrink-0"
                                    />
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Request Number:</span>
                                        <span className="text-gray-900 font-medium">{req.request_number || req.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Type:</span>
                                        <span className="text-gray-900">{formatRequestType(req.request_type)}</span>
                                    </div>
                                    {req.files && req.files.length > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Files:</span>
                                            <span className="text-blue-600 font-medium flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                                </svg>
                                                {req.files.length} file{req.files.length !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Submitted:</span>
                                        <span className="text-gray-900">{new Date(req.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Status:</span>
                                        <span className={getStatusStyling(req.current_status)}>
                                            {formatStatus(req.current_status)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {!loading && !error && filteredRequests.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                No pending requests found.
                            </div>
                        )}
                    </div>
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block">
                    <div
                        className="p-[2px] rounded-t-[68px] overflow-hidden"
                        style={{
                            background:
                                "linear-gradient(to right, #3F6EC0, #00539F, #5D3EA4, #7940A8)",
                        }}
                    >
                        <div
                            className="bg-white rounded-t-[68px] w-full"
                            style={{
                                boxShadow: "0px 4px 28px 0px rgba(0, 0, 0, 0.25)",
                            }}
                        >
                            <div className="max-h-[900px] overflow-y-auto overflow-x-auto rounded-t-[68px]">
                                <table className="w-full border-collapse">
                                    <thead className="sticky top-0 z-10">
                                        <tr
                                            style={{
                                                height: "56px",
                                                background:
                                                    "linear-gradient(90deg, #3F6EC0 0%, #00539F 33%, #5D3EA4 66%, #7940A8 100%)",
                                            }}
                                        >
                                            <th className="w-[8%] text-center px-2"></th>
                                            <th className="w-[20%] text-white font-semibold text-center px-2">Name</th>
                                            <th className="w-[15%] text-white font-semibold text-center px-2">Request Number</th>
                                            <th className="w-[20%] text-white font-semibold text-center px-2">Type of Request</th>
                                            <th className="w-[15%] text-white font-semibold text-center px-2">Submitted</th>
                                            <th className="w-[17%] text-white font-semibold text-center px-2">Status</th>
                                            <th className="w-[5%] text-center px-2"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr style={{ height: "72px" }}>
                                                <td colSpan="7" className="text-center">
                                                    <div className="flex items-center justify-center py-8">
                                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#023184] mr-3"></div>
                                                        <span className="text-gray-500">Loading pending requests...</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : error ? (
                                            <tr style={{ height: "72px" }}>
                                                <td colSpan="7" className="text-center text-red-500">
                                                    <div className="py-4">
                                                        <p>{error}</p>
                                                        <button
                                                            onClick={fetchPendingRequests}
                                                            className="mt-2 px-4 py-2 bg-[#023184] text-white rounded-lg hover:bg-[#034299] transition-colors text-sm"
                                                        >
                                                            Retry
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : filteredRequests.map((req, index) => (
                                            <tr
                                                key={req.id}
                                                className={`border-b border-gray-200 hover:bg-blue-50 hover:shadow-md transition-all duration-200 cursor-pointer ${
                                                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                                                }`}
                                                style={{ height: "72px" }}
                                                onClick={() => handleRecordClick(req.id)}
                                            >
                                                <td className="text-center">
                                                    <div className="flex justify-center">
                                                        <div className="w-9 h-9 rounded-full bg-gradient-to-r from-[#3F6EC0] to-[#7940A8] flex items-center justify-center text-white font-semibold text-base">
                                                            {req.employee?.first_name?.[0] || 'U'}
                                                            {req.employee?.last_name?.[0] || 'U'}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="text-center px-2">
                                                    <span className="font-medium text-gray-900">
                                                        {req.employee?.first_name || 'Unknown'} {req.employee?.last_name || 'User'}
                                                    </span>
                                                </td>
                                                <td className="text-center px-2">
                                                    <span className="font-medium text-gray-800 text-sm">
                                                        {req.request_number || req.id}
                                                    </span>
                                                </td>
                                                <td className="text-center px-2">
                                                    <span className="text-gray-700 text-base">
                                                        {formatRequestType(req.request_type)}
                                                    </span>
                                                </td>
                                                <td className="text-center px-2">
                                                    <span className="text-gray-600 text-base">{new Date(req.created_at).toLocaleDateString()}</span>
                                                </td>
                                                <td className="text-center px-2">
                                                    <span className={getStatusStyling(req.current_status)}>
                                                        {formatStatus(req.current_status)}
                                                    </span>
                                                </td>
                                                <td className="text-center">
                                                    <div className="flex justify-center">
                                                        <img
                                                            src={RoundArrowRightWhiteArrow}
                                                            alt="View details"
                                                            className="w-9 h-9"
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}

                                        {/* Fill remaining space with empty rows */}
                                        {!loading && !error && Array.from({
                                            length: Math.max(0, 10 - filteredRequests.length),
                                        }).map((_, index) => (
                                            <tr
                                                key={`empty-${index}`}
                                                className={`border-b border-gray-200 ${
                                                    (filteredRequests.length + index) % 2 === 0
                                                        ? "bg-white"
                                                        : "bg-gray-50"
                                                }`}
                                                style={{ height: "72px" }}
                                            >
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                            </tr>
                                        ))}
                                    </tbody>    
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Claim Request Modal */}
            {showClaimModal && selectedRequest && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-[#3F6EC0] via-[#00539F] via-[#5D3EA4] to-[#7940A8] text-white px-6 py-4">
                            <h2 className="text-lg font-semibold">Claim Request</h2>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <div className="mb-4">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    Request Details
                                </h3>
                                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Request Number:</span>
                                        <span className="font-medium">{selectedRequest.request_number || selectedRequest.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Employee:</span>
                                        <span className="font-medium">
                                            {selectedRequest.employee?.first_name || 'Unknown'} {selectedRequest.employee?.last_name || 'User'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Type:</span>
                                        <span className="font-medium">{formatRequestType(selectedRequest.request_type)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Submitted:</span>
                                        <span className="font-medium">{new Date(selectedRequest.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6">
                                <p className="text-gray-700">
                                    Do you want to claim this request? Once claimed, you will be responsible for processing it
                                    and other {user?.role === 'hr_personnel' ? 'HR personnel' : user?.role === 'benefits_officer' ? 'Benefits Officers' : 'Welfare Heads'} will not be able to access it.
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                <button
                                    onClick={closeClaimModal}
                                    className="px-6 py-3 bg-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-400 transition-colors text-sm sm:text-base w-full sm:w-auto order-2 sm:order-1"
                                    disabled={claiming}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleClaimRequest}
                                    disabled={claiming}
                                    className={`px-6 py-3 text-white rounded-full font-medium transition-colors text-sm sm:text-base w-full sm:w-auto order-1 sm:order-2 ${
                                        claiming ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#023184] hover:bg-[#034299]'
                                    }`}
                                >
                                    {claiming ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Claiming...</span>
                                        </div>
                                    ) : (
                                        'Claim Request'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}