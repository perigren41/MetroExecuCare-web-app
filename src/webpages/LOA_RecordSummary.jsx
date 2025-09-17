// src/pages/LOA_RecordSummary.jsx
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { mockRequests } from "./mockRequests";

// Components
import NavBarMain from "@/Components/NavBarMain";

// Assets
import BackSquareIconWhite from "@/assets/BackSquareIconWhite.svg";
import MetroBankLogo from "@/assets/mainLogo-foreground.svg";

// Import mock user
import { mockUser } from "./mockUser";

export default function LOA_RecordSummary() {
  const navigate = useNavigate();
  const { requestId } = useParams();
  const user = mockUser;

  // Handlers for NavBarMain
  const handleBackClick = () => navigate(-1);
  const handleProfileClick = () => navigate("/profile");
  const handleLogout = () => navigate("/login");

  const mainLogo = MetroBankLogo;

  // Find the specific request
  const request = mockRequests.find(
    (req) => req.id === parseInt(requestId, 10)
  );

  if (!request) {
    return <div>Request not found</div>;
  }

  // Format request type for display
  const formatRequestType = (type) =>
    type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  // Format status for display
  const formatStatus = (status) =>
    status.charAt(0).toUpperCase() + status.slice(1);

  // Get status styling
  const getStatusStyling = (status) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800 px-4 py-2 rounded-full text-lg font-medium";
      case "rejected":
        return "bg-red-100 text-red-800 px-4 py-2 rounded-full text-lg font-medium";
      case "pending":
        return "bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-lg font-medium";
      default:
        return "bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-lg font-medium";
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <NavBarMain
        user={user}
        onBackClick={handleBackClick}
        customProfileClick={handleProfileClick}
        customLogout={handleLogout}
        showBackButton={true}
        showProfileOption={true}
        showDropdown={true}
        backButtonIcon={BackSquareIconWhite}
        logo={mainLogo}
      />

      {/* Title */}
      <div className="flex justify-center mt-[43px]">
        <h1 className="text-[#023184] text-[28px] font-bold">
          LOA Record Summary
        </h1>
      </div>

      {/* Content Container */}
      <div className="px-[200px] mt-8">
        <div
          className="p-[3px] rounded-[68px]"
          style={{
            background:
              "linear-gradient(to right, #3F6EC0, #00539F, #5D3EA4, #7940A8)",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          <div
            className="bg-white rounded-[68px] p-8"
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
                  {request.employee.first_name[0]}
                  {request.employee.last_name[0]}
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
                  <label className="text-gray-600 text-sm font-medium">
                    Department
                  </label>
                  <p className="text-gray-900 text-lg font-medium">
                    {request.employee.department}
                  </p>
                </div>
                <div>
                  <label className="text-gray-600 text-sm font-medium">
                    Position
                  </label>
                  <p className="text-gray-900 text-lg font-medium">
                    {request.employee.position}
                  </p>
                </div>
                <div>
                  <label className="text-gray-600 text-sm font-medium">
                    Email
                  </label>
                  <p className="text-gray-900 text-lg font-medium">
                    {request.employee.email}
                  </p>
                </div>
                <div>
                  <label className="text-gray-600 text-sm font-medium">
                    Phone
                  </label>
                  <p className="text-gray-900 text-lg font-medium">
                    {request.employee.phone || "N/A"}
                  </p>
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
                  <label className="text-gray-600 text-sm font-medium">
                    Request Type
                  </label>
                  <p className="text-gray-900 text-lg font-medium">
                    {formatRequestType(request.request_type)}
                  </p>
                </div>
                <div>
                  <label className="text-gray-600 text-sm font-medium">
                    Status
                  </label>
                  <div className="mt-1">
                    <span className={getStatusStyling(request.current_status)}>
                      {formatStatus(request.current_status)}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-gray-600 text-sm font-medium">
                    Submitted Date
                  </label>
                  <p className="text-gray-900 text-lg font-medium">
                    {request.created_at}
                  </p>
                </div>
                <div>
                  <label className="text-gray-600 text-sm font-medium">
                    Request ID
                  </label>
                  <p className="text-gray-900 text-lg font-medium">
                    #{request.id.toString().padStart(6, "0")}
                  </p>
                </div>
              </div>

              {/* Purpose/Reason */}
              <div className="mb-6">
                <label className="text-gray-600 text-sm font-medium">
                  Comment/s
                </label>
                <p className="text-gray-900 text-lg mt-1 p-4 bg-gray-50 rounded-lg">
                  {request.comment || "No comment provided"}
                </p>
              </div>
            </div>

            {/* Request Timeline */}
            <div className="mb-8">
              <h2 className="text-[#023184] text-xl font-bold mb-6 border-b-2 border-gray-200 pb-2">
                Request Timeline
              </h2>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mt-1" />
                  <div className="flex flex-col">
                    <p className="font-medium text-gray-900">
                      Request Submitted
                    </p>
                    <p className="text-sm text-gray-600 text-left">
                      {request.created_at}
                    </p>
                  </div>
                </div>

                {request.current_status === "approved" && (
                  <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg">
                    <div className="w-3 h-3 bg-green-500 rounded-full mt-1" />
                    <div className="flex flex-col">
                      <p className="font-medium text-gray-900 text-left">
                        Request Approved
                      </p>
                      <p className="text-sm text-gray-600 text-left">
                        Approved by HR Department
                      </p>
                    </div>
                  </div>
                )}

                {request.current_status === "rejected" && (
                  <div className="flex items-start gap-4 p-4 bg-red-50 rounded-lg">
                    <div className="w-3 h-3 bg-red-500 rounded-full mt-1" />
                    <div className="flex flex-col">
                      <p className="font-medium text-gray-900 text-left">
                        Request Rejected
                      </p>
                      <p className="text-sm text-gray-600 text-left">
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
