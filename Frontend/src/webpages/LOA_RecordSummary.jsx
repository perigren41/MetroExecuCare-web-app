// src/pages/LOA_RecordSummary.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
// Components
import NavBarMain from "@/Components/NavBarMain";
import apiService from "@/services/api";

// Assets
import BackSquareIconWhite from "@/assets/BackSquareIconWhite.svg";
import MetroBankLogo from "@/assets/mainLogo-foreground.svg";

export default function LOA_RecordSummary() {
  const navigate = useNavigate();
  const { requestId } = useParams();
  const { user, logout } = useAuth();

  // State for request data
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to get user display name
  const getUserDisplayName = (user) => {
    if (!user) return "Loading...";
    return `${user.first_name} ${user.last_name}`;
  };

  // Helper function to get user initials
  const getUserInitials = (user) => {
    if (!user || !user.first_name || !user.last_name) return "?";
    return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`;
  };

  // Fetch request data from API
  const fetchRequest = async () => {
    try {
      setLoading(true);
      const response = await apiService.getRequestById(requestId);
      if (response.success) {
        setRequest(response.data.request);
      } else {
        setError('Request not found');
      }
    } catch (err) {
      console.error('Error fetching request:', err);
      setError('Failed to load request');
    } finally {
      setLoading(false);
    }
  };

  // Load request data on component mount
  useEffect(() => {
    if (user && requestId) {
      fetchRequest();
    }
  }, [user, requestId]);

  const handleLogout = () => {
    // Clear session data
    sessionStorage.removeItem("user");
    sessionStorage.clear();
    localStorage.removeItem('authToken');
    navigate("/login", { replace: true });
  };

  // Handle file downloads - can accept type (string) or fileId (number)
  const handleDownload = async (typeOrFileId, customFilename = null) => {
    try {
      let downloadUrl;
      let filename;
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

      // Check if it's a direct file ID download
      if (typeof typeOrFileId === 'number') {
        downloadUrl = `${API_BASE_URL}/requests/files/${typeOrFileId}`;
        filename = customFilename || 'document.pdf';
      } else if (typeOrFileId === 'latest') {
        downloadUrl = `${API_BASE_URL}/requests/${requestId}/download-latest-file`;
        filename = 'approved_file.pdf';
      } else if (typeOrFileId === 'executive') {
        downloadUrl = `${API_BASE_URL}/requests/${requestId}/download-executive-file`;
        filename = 'original_request.pdf';
      }

      // Create a temporary link and trigger download
      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      // Get the blob data
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download file. Please try again.');
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#023184] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading request details...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !request) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
            Request Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            {error || 'The requested record could not be found.'}
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
  const formatRequestType = (type) => {
    if (!type) return "N/A";
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatStatus = (status) => {
    if (!status) return "N/A";

    // Map status codes to user-friendly names
    const statusMap = {
      'pending': 'Pending',
      'hr_processing': 'Human Resource Processing',
      'benefits_review': 'Benefits Officer Review',
      'welfare_review': 'Division Head Review',
      'final_hr_verification': 'Final Human Resource Verification',
      'approved': 'Approved',
      'rejected': 'Rejected',
      'completed': 'Completed'
    };

    return statusMap[status.toLowerCase()] || status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
  };

  const getStatusStyling = (status) => {
    if (!status) return "bg-gray-100 text-gray-800 px-3 md:px-4 py-1 md:py-2 rounded-full text-sm md:text-lg font-medium";
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
                  {request.first_name?.[0] || '?'}
                  {request.last_name?.[0] || '?'}
                </div>

                {/* Employee Name and ID */}
                <div className="flex-1 min-w-0 text-left">
                  <h3 className="text-lg md:text-2xl font-bold text-gray-900 truncate">
                    {request.first_name || 'Unknown'} {request.last_name || 'User'}
                  </h3>
                  <p className="text-gray-600 text-sm md:text-lg">
                    Employee ID: {request.employee_number || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="text-gray-600 text-xs md:text-sm font-medium block">
                    Department
                  </label>
                  <p className="text-gray-900 text-sm md:text-lg font-medium break-words">
                    {request.department || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-gray-600 text-xs md:text-sm font-medium block">
                    Position
                  </label>
                  <p className="text-gray-900 text-sm md:text-lg font-medium break-words">
                    {request.position || 'N/A'}
                  </p>
                </div>
                <div className="md:col-span-2 lg:col-span-1">
                  <label className="text-gray-600 text-xs md:text-sm font-medium block">
                    Email
                  </label>
                  <p className="text-gray-900 text-sm md:text-lg font-medium break-all">
                    {request.email || 'N/A'}
                  </p>
                </div>
                <div className="md:col-span-2 lg:col-span-1">
                  <label className="text-gray-600 text-xs md:text-sm font-medium block">
                    Phone
                  </label>
                  <p className="text-gray-900 text-sm md:text-lg font-medium">
                    {request.contact_number || "N/A"}
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
                    {request.created_at ? new Date(request.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-gray-600 text-xs md:text-sm font-medium block">
                    Request Number
                  </label>
                  <p className="text-gray-900 text-sm md:text-lg font-medium">
                    {request.request_number || "N/A"}
                  </p>
                </div>
              </div>

              {/* Purpose/Reason */}
              <div className="mb-4 md:mb-6">
                <label className="text-gray-600 text-xs md:text-sm font-medium block mb-2">
                  Letter Purpose
                </label>
                <div className="text-gray-900 text-sm md:text-lg p-3 md:p-4 bg-gray-50 rounded-lg break-words">
                  {request.letter_purpose || "No purpose specified"}
                </div>
              </div>

              {/* Hospital Information if available */}
              {request.selected_hospital_name && (
                <div className="mb-4 md:mb-6">
                  <label className="text-gray-600 text-xs md:text-sm font-medium block mb-2">
                    Selected Hospital
                  </label>
                  <div className="text-gray-900 text-sm md:text-lg p-3 md:p-4 bg-gray-50 rounded-lg break-words">
                    <p className="font-medium">{request.selected_hospital_name}</p>
                    {request.selected_hospital_address && (
                      <p className="text-sm text-gray-600 mt-1">{request.selected_hospital_address}</p>
                    )}
                    {request.selected_hospital_contact && (
                      <p className="text-sm text-gray-600">Contact: {request.selected_hospital_contact}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Submitted Documents Section */}
              {request.files && request.files.filter(file => file.uploaded_by === request.employee_id).length > 0 && (
                <div className="mb-4 md:mb-6">
                  <label className="text-gray-600 text-xs md:text-sm font-medium block mb-2">
                    Submitted Documents
                  </label>
                  <div className="bg-gray-50 rounded-lg p-3 md:p-4 space-y-2">
                    {request.files
                      .filter(file => file.uploaded_by === request.employee_id)
                      .map((file, index) => (
                        <div
                          key={file.id}
                          className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer"
                          onClick={() => handleDownload(file.id, file.original_file_name)}
                        >
                          <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {file.original_file_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              Uploaded {new Date(file.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Download Section */}
            {request.current_status === "approved" && (
              <div className="mb-6 md:mb-8">
                <h2 className="text-[#023184] text-lg md:text-xl font-bold mb-4 md:mb-6 border-b-2 border-gray-200 pb-2">
                  Download Approved Documents
                </h2>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4 md:p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-green-800">Your Documents Are Ready</h3>
                  </div>

                  <p className="text-green-700 mb-4 text-sm md:text-base">
                    Your request has been approved. Download your official documents below:
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                    <button
                      onClick={() => handleDownload('latest')}
                      className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#28a745] to-[#20c997] text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium hover:from-[#218838] hover:to-[#1e7e34] transition-all duration-200 shadow-md hover:shadow-lg text-sm md:text-base"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download Approved File
                    </button>

                    <button
                      onClick={() => handleDownload('executive')}
                      className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#3F6EC0] via-[#00539F] to-[#7940A8] text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium hover:opacity-90 transition-all duration-200 shadow-md hover:shadow-lg text-sm md:text-base"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download Original Request
                    </button>
                  </div>

                  <div className="mt-3 md:mt-4 text-xs md:text-sm text-green-600">
                    <p><strong>Note:</strong> These documents are valid for 6 months from the approval date. Please save copies for your records.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Request Timeline */}
            <div className="mb-4 md:mb-8">
              <h2 className="text-[#023184] text-lg md:text-xl font-bold mb-4 md:mb-6 border-b-2 border-gray-200 pb-2">
                Request Timeline
              </h2>

              <div className="space-y-3 md:space-y-4 w-full text-left">
                {/* Always show request creation */}
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-blue-50 rounded-lg">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mt-1 flex-shrink-0" />
                  <div className="flex flex-col min-w-0 flex-1">
                    <p className="font-medium text-gray-900 text-sm md:text-base">
                      Request Submitted
                    </p>
                    <p className="text-xs md:text-sm text-gray-600">
                      {request.created_at ? new Date(request.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Show HR assignment if available */}
                {request.assigned_hr_first_name && (
                  <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-yellow-50 rounded-lg">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mt-1 flex-shrink-0" />
                    <div className="flex flex-col min-w-0 flex-1">
                      <p className="font-medium text-gray-900 text-sm md:text-base">
                        Human Resource Personnel Assigned
                      </p>
                      <p className="text-xs md:text-sm text-gray-600">
                        {request.assigned_hr_first_name} {request.assigned_hr_last_name}
                      </p>
                      {request.assigned_at && (
                        <p className="text-xs md:text-sm text-gray-500">
                          {new Date(request.assigned_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Show Benefits Officer assignment if available */}
                {request.assigned_bo_first_name && (
                  <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-indigo-50 rounded-lg">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full mt-1 flex-shrink-0" />
                    <div className="flex flex-col min-w-0 flex-1">
                      <p className="font-medium text-gray-900 text-sm md:text-base">
                        Benefits Officer Assigned
                      </p>
                      <p className="text-xs md:text-sm text-gray-600">
                        {request.assigned_bo_first_name} {request.assigned_bo_last_name}
                      </p>
                    </div>
                  </div>
                )}

                {/* Show Division Head assignment if available */}
                {request.assigned_wh_first_name && (
                  <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-cyan-50 rounded-lg">
                    <div className="w-3 h-3 bg-cyan-500 rounded-full mt-1 flex-shrink-0" />
                    <div className="flex flex-col min-w-0 flex-1">
                      <p className="font-medium text-gray-900 text-sm md:text-base">
                        Division Head Assigned
                      </p>
                      <p className="text-xs md:text-sm text-gray-600">
                        {request.assigned_wh_first_name} {request.assigned_wh_last_name}
                      </p>
                    </div>
                  </div>
                )}

                {/* Show current status */}
                {request.current_status === "approved" && (
                  <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-green-50 rounded-lg">
                    <div className="w-3 h-3 bg-green-500 rounded-full mt-1 flex-shrink-0" />
                    <div className="flex flex-col min-w-0 flex-1">
                      <p className="font-medium text-gray-900 text-sm md:text-base">
                        Request Approved
                      </p>
                      <p className="text-xs md:text-sm text-gray-600">
                        All approvals completed successfully
                      </p>
                      {request.updated_at && (
                        <p className="text-xs md:text-sm text-gray-500">
                          {new Date(request.updated_at).toLocaleDateString()}
                        </p>
                      )}
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
                        Request was not approved
                      </p>
                      {request.updated_at && (
                        <p className="text-xs md:text-sm text-gray-500">
                          {new Date(request.updated_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Show in-progress status */}
                {!["approved", "rejected"].includes(request.current_status) && (
                  <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-purple-50 rounded-lg">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mt-1 flex-shrink-0" />
                    <div className="flex flex-col min-w-0 flex-1">
                      <p className="font-medium text-gray-900 text-sm md:text-base">
                        Currently: {formatStatus(request.current_status)}
                      </p>
                      <p className="text-xs md:text-sm text-gray-600">
                        Request is being processed
                      </p>
                      {request.updated_at && (
                        <p className="text-xs md:text-sm text-gray-500">
                          Last updated: {new Date(request.updated_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Show due date if available */}
                {request.due_date && (
                  <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 bg-gray-50 rounded-lg">
                    <div className="w-3 h-3 bg-gray-400 rounded-full mt-1 flex-shrink-0" />
                    <div className="flex flex-col min-w-0 flex-1">
                      <p className="font-medium text-gray-900 text-sm md:text-base">
                        Due Date
                      </p>
                      <p className="text-xs md:text-sm text-gray-600">
                        Expected completion: {new Date(request.due_date).toLocaleDateString()}
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