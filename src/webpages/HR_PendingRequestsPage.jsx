// HR_PendingRequestsPage.jsx - Fixed version with proper user management
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { mockPendingRequests } from "./mockPendingRequests";
import NavBarMain from "@/Components/NavBarMain";

// Assets
import BackSquareIconWhite from "@/assets/BackSquareIconWhite.svg";
import MetroBankLogo from "@/assets/metroBankLogo2.svg";
import RoundArrowRightWhiteArrow from "@/assets/RoundArrowRightWhiteArrow.svg";
import SearchIcon from "@/assets/search.svg";

// Import mock user
import { mockUser, mockUsers } from "./mockUser";

export default function HR_PendingRequestsPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const filterPopupRef = useRef(null);

    // Enhanced user state management - FIXED
    const [user, setUser] = useState(() => {
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

    // Format status for display with proper capitalization for abbreviations
    const formatStatus = (status) => {
        return status
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase())
            .replace(/\bBa\b/g, "BA")
            .replace(/\bBso\b/g, "BSO");
    };

    // Get status styling - Plain text without colors
    const getStatusStyling = (status) => {
        return "text-gray-700 px-2 py-1 text-sm md:text-base font-medium";
    };

    // Handle row click to navigate to record summary
    const handleRecordClick = (requestId) => {
        navigate(`/loa-submit/${requestId}`, { state: { user } });
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

    // FIXED: Role-based filtering using the current user state
    const roleFilteredRequests = mockPendingRequests.filter((req) => {
        // Benefits Assistant sees all pending requests
        if (user.position === "Benefits Assistant" || user.username === "ba") {
            return true;
        }

        // BSO sees only pending BSO Approval
        if (user.position === "Benefits Services Officer" || user.username === "bso") {
            return req.current_status === "pending bso approval";
        }

        // Division Head sees only pending Division Head Approval
        if (user.position === "Division Head" || user.username === "dh") {
            return req.current_status === "pending division head approval";
        }

        // Default: nothing
        return false;
    });

    // Filter and sort requests
    const filteredRequests = roleFilteredRequests
        .filter((req) => {
            const fullName = `${req.employee.first_name} ${req.employee.last_name}`.toLowerCase();
            const matchesSearch = fullName.includes(searchTerm.toLowerCase());
            const matchesType = filters.requestType === "" || req.request_type === filters.requestType;
            const matchesStatus = filters.status.length === 0 || filters.status.includes(req.current_status);
            const matchesDate = dateMatches(req.created_at, filters.dateSubmitted, specificDate);

            return matchesSearch && matchesType && matchesStatus && matchesDate;
        })
        .sort((a, b) => {
            if (filters.employeeName === "a-z") {
                const nameA = `${a.employee.first_name} ${a.employee.last_name}`;
                const nameB = `${b.employee.first_name} ${b.employee.last_name}`;
                return nameA.localeCompare(nameB);
            } else if (filters.employeeName === "z-a") {
                const nameA = `${a.employee.first_name} ${a.employee.last_name}`;
                const nameB = `${b.employee.first_name} ${b.employee.last_name}`;
                return nameB.localeCompare(nameA);
            }
            return 0;
        });

    const statusOptions = [
        "pending review",
        "pending ba approval", 
        "pending bso approval",
        "pending division head approval",
        "for return",
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
                                className="w-full h-full bg-transparent focus:outline-none text-gray-700 placeholder-gray-400"
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
                        {filteredRequests.map((req) => (
                            <div
                                key={req.id}
                                className="bg-white rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => handleRecordClick(req.id)}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#3F6EC0] to-[#7940A8] flex items-center justify-center text-white font-semibold text-sm">
                                            {req.employee.first_name[0]}{req.employee.last_name[0]}
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900 text-sm">
                                                {req.employee.first_name} {req.employee.last_name}
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
                                        <span className="text-gray-600">Type:</span>
                                        <span className="text-gray-900">{formatRequestType(req.request_type)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Submitted:</span>
                                        <span className="text-gray-900">{req.created_at}</span>
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
                        
                        {filteredRequests.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                No pending requests found.
                            </div>
                        )}
                    </div>
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block">
                    <div
                        className="p-[2px] rounded-t-[68px]"
                        style={{
                            background:
                                "linear-gradient(to right, #3F6EC0, #00539F, #5D3EA4, #7940A8)",
                        }}
                    >
                        <div
                            className="bg-white rounded-t-[68px] overflow-hidden w-full"
                            style={{
                                boxShadow: "0px 4px 28px 0px rgba(0, 0, 0, 0.25)",
                            }}
                        >
                            <div className="max-h-[900px] overflow-y-auto overflow-x-auto">
                                <table className="w-full min-w-[1200px] table-fixed border-collapse">
                                    <thead className="sticky top-0 z-10">
                                        <tr
                                            style={{
                                                height: "56px",
                                                background:
                                                    "linear-gradient(90deg, #3F6EC0 0%, #00539F 33%, #5D3EA4 66%, #7940A8 100%)",
                                            }}
                                        >
                                            <th className="w-24 text-center"></th>
                                            <th className="w-80 text-white font-semibold text-center">Name</th>
                                            <th className="w-64 text-white font-semibold text-center">Type of Request</th>
                                            <th className="w-48 text-white font-semibold text-center">Submitted</th>
                                            <th className="w-64 text-white font-semibold text-center">Status</th>
                                            <th className="w-32 text-center"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredRequests.map((req, index) => (
                                            <tr
                                                key={req.id}
                                                className={`border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer ${
                                                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                                                }`}
                                                style={{ height: "72px" }}
                                                onClick={() => handleRecordClick(req.id)}
                                            >
                                                <td className="text-center">
                                                    <div className="flex justify-center">
                                                        <div className="w-9 h-9 rounded-full bg-gradient-to-r from-[#3F6EC0] to-[#7940A8] flex items-center justify-center text-white font-semibold text-base">
                                                            {req.employee.first_name[0]}
                                                            {req.employee.last_name[0]}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="text-center px-2">
                                                    <span className="font-medium text-gray-900">
                                                        {req.employee.first_name} {req.employee.last_name}
                                                    </span>
                                                </td>
                                                <td className="text-center px-2">
                                                    <span className="text-gray-700 text-base">
                                                        {formatRequestType(req.request_type)}
                                                    </span>
                                                </td>
                                                <td className="text-center px-2">
                                                    <span className="text-gray-600 text-base">{req.created_at}</span>
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
                                        {Array.from({
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
                                            </tr>
                                        ))}
                                    </tbody>    
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}