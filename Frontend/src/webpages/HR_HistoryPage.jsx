// HR_HistoryPage.jsx - Fixed version
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import NavBarMain from "@/Components/NavBarMain";
import apiService from "@/services/api";

// Assets
import BackSquareIconWhite from "@/assets/BackSquareIconWhite.svg";
import mainLogo from '../assets/mainLogo-foreground.svg';
import RoundArrowRightWhiteArrow from "@/assets/RoundArrowRightWhiteArrow.svg";
import SearchIcon from "@/assets/search.svg";

export default function HR_HistoryPage() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    // State for requests data
    const [requests, setRequests] = useState([]);
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
    const [sortOrder, setSortOrder] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState("");

    // Fetch requests from API - Get only requests processed by current user
    const fetchRequests = async () => {
        try {
            setLoading(true);
            // Use getUserActionLogs to get only requests this user has approved/rejected
            const response = await apiService.getUserActionLogs(1000); // High limit to get all history

            if (response.success) {
                // Transform action logs into request format for the table
                const transformedRequests = response.data.map(log => ({
                    id: log.request_id,
                    request_number: log.request_number,
                    request_type: log.request_type,
                    current_status: log.action, // Use the action (approved/rejected) as status
                    created_at: log.created_at,
                    employee: {
                        first_name: log.employee_first_name,
                        last_name: log.employee_last_name
                    },
                    hospital_name: log.hospital_name,
                    action: log.action,
                    approval_stage: log.approval_stage
                }));
                setRequests(transformedRequests);
            } else {
                setError('Failed to fetch requests');
            }
        } catch (err) {
            console.error('Error fetching requests:', err);
            setError('Failed to load requests');
        } finally {
            setLoading(false);
        }
    };

    // Load requests on component mount
    useEffect(() => {
        if (user) {
            fetchRequests();
        }
    }, [user]);

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
                return 'bg-green-100 text-green-800 px-2 md:px-3 py-1 rounded-full text-sm md:text-base font-medium';
            case 'rejected':
                return 'bg-red-100 text-red-800 px-2 md:px-3 py-1 rounded-full text-sm md:text-base font-medium';
            default:
                return 'bg-gray-100 text-gray-800 px-2 md:px-3 py-1 rounded-full text-sm md:text-base font-medium';
        }
    };

    // Handle row click to navigate to record summary
    const handleRecordClick = (requestId) => {
        navigate(`/loa-record-summary/${requestId}`, {
            state: { user }
        });
    };


    const handleLogout = () => {
        sessionStorage.removeItem("user");
        sessionStorage.clear();
        localStorage.removeItem('authToken');
        navigate("/login", { replace: true });
    };

    // Filter and sort requests
    const filteredRequests = requests
        .filter(req => {
            if (!req.employee) return false;
            const fullName = `${req.employee.first_name || ''} ${req.employee.last_name || ''}`.toLowerCase();
            const matchesSearch = fullName.includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === "" || req.current_status === statusFilter;
            const matchesType = typeFilter === "" || req.request_type === typeFilter;
            return matchesSearch && matchesStatus && matchesType;
        })
        .sort((a, b) => {
            if (sortOrder === "A-Z") {
                const nameA = `${a.employee?.first_name || ''} ${a.employee?.last_name || ''}`;
                const nameB = `${b.employee?.first_name || ''} ${b.employee?.last_name || ''}`;
                return nameA.localeCompare(nameB);
            } else if (sortOrder === "Z-A") {
                const nameA = `${a.employee?.first_name || ''} ${a.employee?.last_name || ''}`;
                const nameB = `${b.employee?.first_name || ''} ${b.employee?.last_name || ''}`;
                return nameB.localeCompare(nameA);
            }
            return 0;
        });

    return (
        <div className="min-h-screen bg-white">
            {/* Updated Navbar with proper user display */}
            <NavBarMain
                user={{
                    ...user,
                    name: getUserDisplayName(user)
                }}
                onLogout={handleLogout}
                backButtonIcon={BackSquareIconWhite}
                logo={mainLogo}
            />

            {/* Title */}
            <div className="flex justify-center mt-6 md:mt-[43px] px-4">
                <h1 className="text-[#023184] text-xl md:text-[28px] font-bold">
                    History
                </h1>
            </div>


            {/* Search + Filter Buttons */}
            <div className="px-4 md:px-8 lg:px-[200px] mt-2 flex flex-col gap-4">
                {/* Search Input */}
                <div className="flex justify-center lg:justify-start">
                    <div className="relative w-full max-w-md lg:max-w-none lg:w-[500px]">
                        <div className="w-full bg-white rounded-full flex items-center px-4 py-2 shadow-sm">
                            <img src={SearchIcon} alt="Search" className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                            <input
                                type="text"
                                placeholder="Search by name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-transparent focus:outline-none text-gray-700 placeholder-gray-400 border-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Filter Buttons - Responsive Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex gap-2 lg:gap-3 justify-center lg:justify-start">
                    <button
                        onClick={() => setSortOrder(sortOrder === "A-Z" ? "" : "A-Z")}
                        className={`px-3 md:px-5 py-2 rounded-full text-sm md:text-base font-bold hover:opacity-80 transition-all ${
                            sortOrder === "A-Z" ? "text-white" : "text-gray-700 bg-gray-200"
                        }`}
                        style={sortOrder === "A-Z" ? { background: 'linear-gradient(to right, #3F6EC0, #00539F, #5D3EA4, #7940A8)' } : {}}
                    >
                        A-Z
                    </button>
                    <button
                        onClick={() => setSortOrder(sortOrder === "Z-A" ? "" : "Z-A")}
                        className={`px-3 md:px-5 py-2 rounded-full text-sm md:text-base font-bold hover:opacity-80 transition-all ${
                            sortOrder === "Z-A" ? "text-white" : "text-gray-700 bg-gray-200"
                        }`}
                        style={sortOrder === "Z-A" ? { background: 'linear-gradient(to right, #3F6EC0, #00539F, #5D3EA4, #7940A8)' } : {}}
                    >
                        Z-A
                    </button>
                    <button
                        onClick={() => setStatusFilter(statusFilter === "approved" ? "" : "approved")}
                        className={`px-3 md:px-5 py-2 rounded-full text-sm md:text-base font-bold hover:opacity-80 transition-all ${
                            statusFilter === "approved" ? "text-white" : "text-gray-700 bg-gray-200"
                        }`}
                        style={statusFilter === "approved" ? { background: 'linear-gradient(to right, #3F6EC0, #00539F, #5D3EA4, #7940A8)' } : {}}
                    >
                        Approved
                    </button>
                    <button
                        onClick={() => setStatusFilter(statusFilter === "rejected" ? "" : "rejected")}
                        className={`px-3 md:px-5 py-2 rounded-full text-sm md:text-base font-bold hover:opacity-80 transition-all ${
                            statusFilter === "rejected" ? "text-white" : "text-gray-700 bg-gray-200"
                        }`}
                        style={statusFilter === "rejected" ? { background: 'linear-gradient(to right, #3F6EC0, #00539F, #5D3EA4, #7940A8)' } : {}}
                    >
                        Rejected
                    </button>
                    <button
                        onClick={() =>
                            setTypeFilter(typeFilter === "letter_of_approval" ? "" : "letter_of_approval")
                        }
                        className={`px-3 md:px-5 py-2 rounded-full text-sm md:text-base font-bold hover:opacity-80 transition-all ${
                            typeFilter === "letter_of_approval" ? "text-white" : "text-gray-700 bg-gray-200"
                        } col-span-2 sm:col-span-1`}
                        style={
                            typeFilter === "letter_of_approval"
                                ? { background: "linear-gradient(to right, #3F6EC0, #00539F, #5D3EA4, #7940A8)" }
                                : {}
                        }
                    >
                        <span className="block sm:hidden">LOA</span>
                        <span className="hidden sm:block">Letter of Approval</span>
                    </button>
                    <button
                        onClick={() =>
                            setTypeFilter(typeFilter === "letter_of_authorization" ? "" : "letter_of_authorization")
                        }
                        className={`px-3 md:px-5 py-2 rounded-full text-sm md:text-base font-bold hover:opacity-80 transition-all ${
                            typeFilter === "letter_of_authorization" ? "text-white" : "text-gray-700 bg-gray-200"
                        } col-span-2 sm:col-span-1`}
                        style={
                            typeFilter === "letter_of_authorization"
                                ? { background: "linear-gradient(to right, #3F6EC0, #00539F, #5D3EA4, #7940A8)" }
                                : {}
                        }
                    >
                        <span className="block sm:hidden">LOAuth</span>
                        <span className="hidden sm:block">Letter of Authorization</span>
                    </button>
                </div>
            </div>

            {/* Table Container */}
            <div className="mt-4 px-4 md:px-8 lg:px-[200px]">
                {/* Mobile Card View */}
                <div className="block lg:hidden">
                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#023184] mx-auto mb-4"></div>
                                <p className="text-gray-500">Loading requests...</p>
                            </div>
                        ) : error ? (
                            <div className="text-center py-8 text-red-500">
                                <p>{error}</p>
                                <button
                                    onClick={fetchRequests}
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
                                        <span className="text-gray-600">Type:</span>
                                        <span className="text-gray-900">{formatRequestType(req.request_type)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Submitted:</span>
                                        <span className="text-gray-900">{new Date(req.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
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
                                No history records found.
                            </div>
                        )}
                    </div>
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block">
                    <div
                        className="p-[2px] rounded-t-[68px]"
                        style={{
                            background: "linear-gradient(to right, #3F6EC0, #00539F, #5D3EA4, #7940A8)",
                        }}
                    >
                        <div
                            className="bg-white rounded-t-[68px] overflow-hidden w-full"
                            style={{
                                boxShadow: "0px 4px 28px 0px rgba(0, 0, 0, 0.25)",
                            }}
                        >
                            {/* Scrollable table wrapper */}
                            <div className="max-h-[900px] overflow-y-auto overflow-x-auto">
                                <table className="w-full min-w-[1200px] table-fixed border-collapse">
                                    <thead className="sticky top-0 z-10">
                                        <tr
                                            style={{
                                                height: "56px",
                                                background: "linear-gradient(90deg, #3F6EC0 0%, #00539F 33%, #5D3EA4 66%, #7940A8 100%)",
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
                                        {loading ? (
                                            <tr style={{ height: "72px" }}>
                                                <td colSpan="6" className="text-center">
                                                    <div className="flex items-center justify-center py-8">
                                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#023184] mr-3"></div>
                                                        <span className="text-gray-500">Loading requests...</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : error ? (
                                            <tr style={{ height: "72px" }}>
                                                <td colSpan="6" className="text-center text-red-500">
                                                    <div className="py-4">
                                                        <p>{error}</p>
                                                        <button
                                                            onClick={fetchRequests}
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
                                                className={`border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer ${
                                                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                                                }`}
                                                style={{ height: "72px" }}
                                                onClick={() => handleRecordClick(req.id)}
                                            >
                                                {/* Profile/Avatar */}
                                                <td className="text-center">
                                                    <div className="flex justify-center">
                                                        <div className="w-9 h-9 rounded-full bg-gradient-to-r from-[#3F6EC0] to-[#7940A8] flex items-center justify-center text-white font-semibold text-base">
                                                            {req.employee?.first_name?.[0] || 'U'}
                                                            {req.employee?.last_name?.[0] || 'U'}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Name */}
                                                <td className="text-center px-2">
                                                    <span className="font-medium text-gray-900">
                                                        {req.employee?.first_name || 'Unknown'} {req.employee?.last_name || 'User'}
                                                    </span>
                                                </td>

                                                {/* Type of Request */}
                                                <td className="text-center px-2">
                                                    <span className="text-gray-700 text-base">
                                                        {formatRequestType(req.request_type)}
                                                    </span>
                                                </td>

                                                {/* Submitted */}
                                                <td className="text-center px-2">
                                                    <span className="text-gray-600 text-base">
                                                        {new Date(req.created_at).toLocaleDateString()}
                                                    </span>
                                                </td>

                                                {/* Status */}
                                                <td className="text-center px-2">
                                                    <span className={getStatusStyling(req.current_status)}>
                                                        {formatStatus(req.current_status)}
                                                    </span>
                                                </td>

                                                {/* Arrow */}
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