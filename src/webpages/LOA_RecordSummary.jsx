// src/pages/LOA_RecordSummary.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { mockRequests } from "./mockRequests";

// Components
import NavBarMain from "@/Components/NavBarMain";

// Assets
import BackSquareIconWhite from "@/assets/BackSquareIconWhite.svg";
import MetroBankLogo from "@/assets/mainLogo-foreground.svg";

// Import mock user (optional fallback)
import { mockUser, mockUsers } from "./mockUser";

export default function LOA_RecordSummary() {
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

  const handleLogout = () => {
    // Clear session data
    sessionStorage.removeItem("user");
    sessionStorage.clear();
    localStorage.removeItem('authToken');
    navigate("/login", { replace: true });
  };

  // Find the specific request (treat IDs consistently as strings)
  const request = mockRequests.find((req) => req.id.toString() === requestId);

  if (!request) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
            Request Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The requested record could not be found.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Format helpers
  const formatRequestType = (type) =>
    type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  const formatStatus = (status) =>
    status.charAt(0).toUpperCase() + status.slice(1);

  const getStatusStyling = (status) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800 px-3 md:px-4 py-1 md:py-2 rounded-full text-sm md:text-lg font-medium";
      case "rejected":
        return "bg-red-100 text-red-800 px-3 md:px-4 py-1 md:py-2 rounded-full text-sm md:text-lg font-medium";
      case "pending":
        return "bg-yellow-100 text-yellow-800 px-3 md:px-4 py-1 md:py-2 rounded-full text-sm md:text-lg font-medium";
      default:
        return "bg-gray-100 text-gray-800 px-3 md:px-4 py-1 md:py-2 rounded-full text-sm md:text-lg font-medium";
    }
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
        logo={MetroBankLogo}
      />

      {/* Title */}
      <div className="flex justify-center mt-6 md:mt-[43px] px-4">
        <h1 className="text-[#023184] text-xl md:text-[28px] font-bold text-center">
          LOA Record Summary
        </h1>
      </div>

      {/* Content Container */}
      <div className="px-4 md:px-8 lg:px-[200px] mt-4 md:mt-8">
        <div
          className="p-[2px] md:p-[3px] rounded-[24px] md:rounded-[68px]"
          style={{
            background:
              "linear-gradient(to right, #3F6EC0, #00539F, #5D3EA4, #7940A8)",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          <div
            className="bg-white rounded-[24px] md:rounded-[68px] p-4 md:p-6 lg:p-8"
            style={{
              boxShadow: "0px 4px 28px 0px rgba(0, 0, 0, 0.25)",
            }}
          >
            {/* Employee Information Section */}
            <div className="mb-6 md:mb-8">
              <h2 className="text-[#023184] text-lg md:text-xl font-bold mb-4 md:mb-6 border-b-2 border-gray-200 pb-2">
                Employee Information
              </h2>

              <div className="flex flex-row flex-wrap items-center gap-4 md:gap-6 mb-4 md:mb-6 w-full">
                {/* Employee Avatar */}
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-r from-[#3F6EC0] to-[#7940A8] flex items-center justify-center text-white font-bold text-lg md:text-xl flex-shrink-0">
                  {request.employee.first_name[0]}
                  {request.employee.last_name[0]}
                </div>

                {/* Employee Name and ID */}
                <div className="flex-1 min-w-0 text-left">
                  <h3 className="text-lg md:text-2xl font-bold text-gray-900 truncate">
                    {request.employee.first_name} {request.employee.last_name}
                  </h3>
                  <p className="text-gray-600 text-sm md:text-lg">
                    Employee ID: {request.employee.employee_id}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="text-gray-600 text-xs md:text-sm font-medium block">
                    Department
                  </label>
                  <p className="text-gray-900 text-sm md:text-lg font-medium break-words">
                    {request.employee.department}
                  </p>
                </div>
                <div>
                  <label className="text-gray-600 text-xs md:text-sm font-medium block">
                    Position
                  </label>
                  <p className="text-gray-900 text-sm md:text-lg font-medium break-words">
                    {request.employee.position}
                  </p>
                </div>
                <div className="md:col-span-2 lg:col-span-1">
                  <label className="text-gray-600 text-xs md:text-sm font-medium block">
                    Email
                  </label>
                  <p className="text-gray-900 text-sm md:text-lg font-medium break-all">
                    {request.employee.email}
                  </p>
                </div>
                <div className="md:col-span-2 lg:col-span-1">
                  <label className="text-gray-600 text-xs md:text-sm font-medium block">
                    Phone
                  </label>
                  <p className="text-gray-900 text-sm md:text-lg font-medium">
                    {request.employee.phone || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Request Details Section */}
            <div className="mb-6 md:mb-8">
              <h2 className="text-[#023184] text-lg md:text-xl font-bold mb-4 md:mb-6 border-b-2 border-gray-200 pb-2">
                Request Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
                <div>
                  <label className="text-gray-600 text-xs md:text-sm font-medium block">
                    Request Type
                  </label>
                  <p className="text-gray-900 text-sm md:text-lg font-medium break-words">
                    {formatRequestType(request.request_type)}
                  </p>
                </div>
                <div>
                  <label className="text-gray-600 text-xs md:text-sm font-medium block">
                    Status
                  </label>
                  <div className="mt-1">
                    <span className={getStatusStyling(request.current_status)}>
                      {formatStatus(request.current_status)}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-gray-600 text-xs md:text-sm font-medium block">
                    Submitted Date
                  </label>
                  <p className="text-gray-900 text-sm md:text-lg font-medium">
                    {request.created_at}
                  </p>
                </div>
                <div>
                  <label className="text-gray-600 text-xs md:text-sm font-medium block">
                    Request ID
                  </label>
                  <p className="text-gray-900 text-sm md:text-lg font-medium">
                    #{request.id.toString().padStart(6, "0")}
                  </p>
                </div>
              </div>

              {/* Purpose/Reason */}
              <div className="mb-4 md:mb-6">
                <label className="text-gray-600 text-xs md:text-sm font-medium block mb-2">
                  Comment/s
                </label>
                <div className="text-gray-900 text-sm md:text-lg p-3 md:p-4 bg-gray-50 rounded-lg break-words">
                  {request.comment || "No comment provided"}
                </div>
              </div>
            </div>

            {/* Request Timeline */}
            <div className="mb-4 md:mb-8">
              <h2 className="text-[#023184] text-lg md:text-xl font-bold mb-4 md:mb-6 border-b-2 border-gray-200 pb-2">
                Request Timeline
              </h2>

              <div className="space-y-3 md:space-y-4 w-full text-left">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-blue-50 rounded-lg">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mt-1 flex-shrink-0" />
                  <div className="flex flex-col min-w-0 flex-1">
                    <p className="font-medium text-gray-900 text-sm md:text-base">
                      Request Submitted
                    </p>
                    <p className="text-xs md:text-sm text-gray-600">
                      {request.created_at}
                    </p>
                  </div>
                </div>

                {request.current_status === "approved" && (
                  <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-green-50 rounded-lg">
                    <div className="w-3 h-3 bg-green-500 rounded-full mt-1 flex-shrink-0" />
                    <div className="flex flex-col min-w-0 flex-1">
                      <p className="font-medium text-gray-900 text-sm md:text-base">
                        Request Approved
                      </p>
                      <p className="text-xs md:text-sm text-gray-600">
                        Approved by HR Department
                      </p>
                    </div>
                  </div>
                )}

                {request.current_status === "rejected" && (
                  <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-red-50 rounded-lg">
                    <div className="w-3 h-3 bg-red-500 rounded-full mt-1 flex-shrink-0" />
                    <div className="flex flex-col min-w-0 flex-1">
                      <p className="font-medium text-gray-900 text-sm md:text-base">
                        Request Rejected
                      </p>
                      <p className="text-xs md:text-sm text-gray-600">
                        Rejected by HR Department
                      </p>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}