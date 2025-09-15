// HR_HistoryPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockRequests } from "./mockRequests";
import NavBarMain from "@/Components/NavBarMain";

// Assets
import BackSquareIconWhite from "@/assets/BackSquareIconWhite.svg";
import MetroBankLogo from "@/assets/metroBankLogo2.svg";
import RoundArrowRightWhiteArrow from "@/assets/RoundArrowRightWhiteArrow.svg";
import SearchIcon from "@/assets/search.svg";

// Import mock user
import { mockUser } from "./mockUser";

export default function HR_HistoryPage() {
    const navigate = useNavigate();
    const user = mockUser;

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
                return 'bg-green-100 text-green-800 px-3 py-1 rounded-full text-base font-medium';
            case 'rejected':
                return 'bg-red-100 text-red-800 px-3 py-1 rounded-full text-base font-medium';
            default:
                return 'bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-base font-medium';
        }
    };

    // Handle row click to navigate to record summary
    const handleRecordClick = (requestId) => {
        navigate(`/loa-record-summary/${requestId}`);
    };

    // Navbar handlers
    const handleBackClick = () => {
        navigate("/hr-dashboard");
    };

    const handleProfileClick = () => {
        // Add your profile navigation logic here
        console.log("Navigate to profile");
    };

    const handleLogout = () => {
        // Add your logout logic here
        navigate("/LoginPage");
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
                logo={MetroBankLogo}
            />

            {/* Title */}
            <div className="flex justify-center mt-[43px]">
                <h1 className="text-[#023184] text-[28px] font-bold">
                    History
                </h1>
            </div>

            {/* Search + Filter Buttons */}
            <div className="px-[200px] mt-2 flex items-center gap-3">
                {/* Search Input */}
                <div className="relative flex-shrink-0 w-[500px] h-[38px]">
                    <div
                        className="absolute inset-0 rounded-full p-[2px]"
                        style={{ background: 'linear-gradient(to right, #3F6EC0, #00539F, #5D3EA4, #7940A8)' }}
                    >
                        <div className="w-full h-full bg-white rounded-full flex items-center px-4">
                            <img src={SearchIcon} alt="Search" className="h-5 w-5 text-gray-400 mr-2" />
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

                {/* Buttons immediately next to search */}
                <div className="flex gap-3">
                    <button
                        onClick={() => setSortOrder(sortOrder === "A-Z" ? "" : "A-Z")}
                        className={`px-5 py-2 rounded-full text-base font-bold hover:opacity-80 transition-all ${sortOrder === "A-Z" ? "text-white" : "text-gray-700 bg-gray-200"}`}
                        style={sortOrder === "A-Z" ? { background: 'linear-gradient(to right, #3F6EC0, #00539F, #5D3EA4, #7940A8)' } : {}}
                    >
                        A-Z
                    </button>
                    <button
                        onClick={() => setSortOrder(sortOrder === "Z-A" ? "" : "Z-A")}
                        className={`px-5 py-2 rounded-full text-base font-bold hover:opacity-80 transition-all ${sortOrder === "Z-A" ? "text-white" : "text-gray-700 bg-gray-200"}`}
                        style={sortOrder === "Z-A" ? { background: 'linear-gradient(to right, #3F6EC0, #00539F, #5D3EA4, #7940A8)' } : {}}
                    >
                        Z-A
                    </button>
                    <button
                        onClick={() => setStatusFilter(statusFilter === "approved" ? "" : "approved")}
                        className={`px-5 py-2 rounded-full text-base font-bold hover:opacity-80 transition-all ${statusFilter === "approved" ? "text-white" : "text-gray-700 bg-gray-200"}`}
                        style={statusFilter === "approved" ? { background: 'linear-gradient(to right, #3F6EC0, #00539F, #5D3EA4, #7940A8)' } : {}}
                    >
                        Approved
                    </button>
                    <button
                        onClick={() => setStatusFilter(statusFilter === "rejected" ? "" : "rejected")}
                        className={`px-5 py-2 rounded-full text-base font-bold hover:opacity-80 transition-all ${statusFilter === "rejected" ? "text-white" : "text-gray-700 bg-gray-200"}`}
                        style={statusFilter === "rejected" ? { background: 'linear-gradient(to right, #3F6EC0, #00539F, #5D3EA4, #7940A8)' } : {}}
                    >
                        Rejected
                    </button>
                    <button
                        onClick={() =>
                            setTypeFilter(typeFilter === "letter_of_approval" ? "" : "letter_of_approval")
                        }
                        className={`px-5 py-2 rounded-full text-base font-bold hover:opacity-80 transition-all ${typeFilter === "letter_of_approval" ? "text-white" : "text-gray-700 bg-gray-200"
                            }`}
                        style={
                            typeFilter === "letter_of_approval"
                                ? {
                                    background:
                                        "linear-gradient(to right, #3F6EC0, #00539F, #5D3EA4, #7940A8)",
                                }
                                : {}
                        }
                    >
                        Letter of Approval
                    </button>
                    <button
                        onClick={() =>
                            setTypeFilter(typeFilter === "letter_of_authorization" ? "" : "letter_of_authorization")
                        }
                        className={`px-5 py-2 rounded-full text-base font-bold hover:opacity-80 transition-all ${typeFilter === "letter_of_authorization" ? "text-white" : "text-gray-700 bg-gray-200"
                            }`}
                        style={
                            typeFilter === "letter_of_authorization"
                                ? {
                                    background:
                                        "linear-gradient(to right, #3F6EC0, #00539F, #5D3EA4, #7940A8)",
                                }
                                : {}
                        }
                    >
                        Letter of Authorization
                    </button>
                </div>
            </div>

            {/* Table Container */}
            <div className="mt-2 px-[200px]">
                <div
                    className="p-[2px] rounded-t-[68px]"
                    style={{
                        background:
                            "linear-gradient(to right, #3F6EC0, #00539F, #5D3EA4, #7940A8)",
                        width: "fit-content",
                    }}
                >
                    <div
                        className="bg-white rounded-t-[68px] overflow-hidden"
                        style={{
                            width: "1520px",
                            boxShadow: "0px 4px 28px 0px rgba(0, 0, 0, 0.25)",
                        }}
                    >
                        {/* Scrollable table wrapper */}
                        <div className="max-h-[900px] overflow-y-auto">
                            <table className="w-full table-fixed border-collapse">
                                <thead className="sticky top-0 z-10">
                                    <tr
                                        style={{
                                            height: "56px",
                                            background:
                                                "linear-gradient(90deg, #3F6EC0 0%, #00539F 33%, #5D3EA4 66%, #7940A8 100%)",
                                        }}
                                    >
                                        <th style={{ width: "127px" }} className="text-center"></th>
                                        <th
                                            style={{ width: "391px" }}
                                            className="text-white font-semibold text-center"
                                        >
                                            Name
                                        </th>
                                        <th
                                            style={{ width: "291px" }}
                                            className="text-white font-semibold text-center"
                                        >
                                            Type of Request
                                        </th>
                                        <th
                                            style={{ width: "211px" }}
                                            className="text-white font-semibold text-center"
                                        >
                                            Submitted
                                        </th>
                                        <th
                                            style={{ width: "341px" }}
                                            className="text-white font-semibold text-center"
                                        >
                                            Status
                                        </th>
                                        <th style={{ width: "159px" }} className="text-center"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRequests.map((req, index) => (
                                        <tr
                                            key={req.id}
                                            className={`border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer ${index % 2 === 0 ? "bg-white" : "bg-gray-50"
                                                }`}
                                            style={{ height: "72px" }}
                                            onClick={() => handleRecordClick(req.id)}
                                        >
                                            {/* Profile/Avatar */}
                                            <td className="text-center" style={{ width: "127px" }}>
                                                <div className="flex justify-center">
                                                    <div className="w-9 h-9 rounded-full bg-gradient-to-r from-[#3F6EC0] to-[#7940A8] flex items-center justify-center text-white font-semibold text-base">
                                                        {req.employee.first_name[0]}
                                                        {req.employee.last_name[0]}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Name */}
                                            <td className="text-center" style={{ width: "391px" }}>
                                                <span className="font-medium text-gray-900">
                                                    {req.employee.first_name} {req.employee.last_name}
                                                </span>
                                            </td>

                                            {/* Type of Request */}
                                            <td className="text-center" style={{ width: "291px" }}>
                                                <span className="text-gray-700 text-base">
                                                    {formatRequestType(req.request_type)}
                                                </span>
                                            </td>

                                            {/* Submitted */}
                                            <td className="text-center" style={{ width: "211px" }}>
                                                <span className="text-gray-600 text-base">
                                                    {req.created_at}
                                                </span>
                                            </td>

                                            {/* Status */}
                                            <td className="text-center" style={{ width: "341px" }}>
                                                <span className={getStatusStyling(req.current_status)}>
                                                    {formatStatus(req.current_status)}
                                                </span>
                                            </td>

                                            {/* Arrow */}
                                            <td className="text-center" style={{ width: "159px" }}>
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
                                            className={`border-b border-gray-200 ${(filteredRequests.length + index) % 2 === 0
                                                ? "bg-white"
                                                : "bg-gray-50"
                                                }`}
                                            style={{ height: "72px" }}
                                        >
                                            <td style={{ width: "127px" }}></td>
                                            <td style={{ width: "391px" }}></td>
                                            <td style={{ width: "291px" }}></td>
                                            <td style={{ width: "211px" }}></td>
                                            <td style={{ width: "341px" }}></td>
                                            <td style={{ width: "159px" }}></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}