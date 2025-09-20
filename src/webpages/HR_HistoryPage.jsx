// HR_HistoryPage.jsx - Fixed version
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { mockRequests } from "./mockRequests";
import NavBarMain from "@/Components/NavBarMain";

// Assets
import BackSquareIconWhite from "@/assets/BackSquareIconWhite.svg";
import mainLogo from '../assets/mainLogo-foreground.svg';
import RoundArrowRightWhiteArrow from "@/assets/RoundArrowRightWhiteArrow.svg";
import SearchIcon from "@/assets/search.svg";

// Import mock user
import { mockUser, mockUsers } from "./mockUser";

export default function HR_HistoryPage() {
    const navigate = useNavigate();
    const location = useLocation();

    // Enhanced user state management
    const [user, setUser] = useState(() => {
        const userFromState = location.state?.user;
        const userFromStorage = sessionStorage.getItem("user") 
            ? JSON.parse(sessionStorage.getItem("user"))
            : null;
        
        return userFromState || userFromStorage || mockUser;
    });

    // Store user to sessionStorage whenever we have a user from navigation
    useEffect(() => {
        if (location.state?.user) {
            sessionStorage.setItem("user", JSON.stringify(location.state.user));
            setUser(location.state.user);
        }
    }, [location.state]);

    const [searchTerm, setSearchTerm] = useState("");
    const [sortOrder, setSortOrder] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState("");

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
    const filteredRequests = mockRequests
        .filter(req => {
            const fullName = `${req.employee.first_name} ${req.employee.last_name}`.toLowerCase();
            const matchesSearch = fullName.includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === "" || req.current_status === statusFilter;
            const matchesType = typeFilter === "" || req.request_type === typeFilter;
            return matchesSearch && matchesStatus && matchesType;
        })
        .sort((a, b) => {
            if (sortOrder === "A-Z") {
                const nameA = `${a.employee.first_name} ${a.employee.last_name}`;
                const nameB = `${b.employee.first_name} ${b.employee.last_name}`;
                return nameA.localeCompare(nameB);
            } else if (sortOrder === "Z-A") {
                const nameA = `${a.employee.first_name} ${a.employee.last_name}`;
                const nameB = `${b.employee.first_name} ${b.employee.last_name}`;
                return nameB.localeCompare(nameA);
            }
            return 0;
        });

    return (
        <div className="min-h-screen bg-white">
            {/* Updated Navbar */}
            <NavBarMain
                user={user}
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
                    <div className="relative w-full max-w-md lg:max-w-none lg:w-[500px] h-[38px]">
                        <div
                            className="absolute inset-0 rounded-full p-[2px]"
                            style={{ background: 'linear-gradient(to right, #3F6EC0, #00539F, #5D3EA4, #7940A8)' }}
                        >
                            <div className="w-full h-full bg-white rounded-full flex items-center px-4">
                                <img src={SearchIcon} alt="Search" className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
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
                                    <div className="flex justify-between items-center">
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
                                        {filteredRequests.map((req, index) => (
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
                                                            {req.employee.first_name[0]}
                                                            {req.employee.last_name[0]}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Name */}
                                                <td className="text-center px-2">
                                                    <span className="font-medium text-gray-900">
                                                        {req.employee.first_name} {req.employee.last_name}
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
                                                        {req.created_at}
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