import React, { useState } from "react";
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";
import NavBarMain from "@/Components/NavBarMain";
import BackSquareIconWhite from "@/assets/BackSquareIconWhite.svg";
import MetroBankLogo from "@/assets/mainLogo-foreground.svg";
import { useAuth } from "@/contexts/AuthContext";
import apiService from "@/services/api";
import ViewRequestDetailsModal from "@/Components/ViewRequestDetailsModal";

// ✅ Your imported icons
import CheckSquare from "@/assets/checksquare.svg";
import ClockSquare from "@/assets/clocksquare.svg";
import XSquare from "@/assets/xsquare.svg";
import AddSquare from "@/assets/addsquare.svg";
import BlankSquare from "@/assets/blanksquare.svg";
import DocumentIcon from "@/assets/documenticon.svg";

const COLORS = {
  ombre: ["#3F6EC0", "#00539F", "#5D3EA4", "#7940A8"],
  blue: "#00539F",
  purple: "#5D3EA4",
};

// API base URL configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function LOAStatusTracker() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Handle authenticated file download
  const handleDownload = async (endpoint, filename) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      // Get the blob from response
      const blob = await response.blob();

      // Create a download link and trigger it
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download file. Please try again.');
    }
  };

  // Get data from URL params or navigation state
  const getRequestDetails = () => {
    // Priority 1: Data from navigation state (from Active Request modal)
    if (location.state?.request) {
      const req = location.state.request;
      return {
        request_type: req.request_type,
        request_id: req.id,
        request_number: req.request_number,
        requested_on: new Date(req.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        requested_by: user?.first_name + ' ' + user?.last_name,
        current_status: req.current_status,
      };
    }

    // Priority 2: Data from navigation state (legacy format)
    if (location.state?.requestDetails) {
      return location.state.requestDetails;
    }

    // Priority 3: Data from URL parameters
    if (searchParams.get('status')) {
      return {
        request_type: searchParams.get('type') || "Letter of Authorization",
        request_id: parseInt(searchParams.get('id')) || 12345,
        requested_on: searchParams.get('date') || new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        requested_by: searchParams.get('user') || "Thor Odinson",
        current_status: searchParams.get('status'),
        request_number: searchParams.get('requestNumber'),
      };
    }

    // Priority 4: Default/fallback data
    return {
      request_type: "Letter of Authorization",
      request_id: 123458,
      requested_on: "April 18, 2025",
      requested_by: "Thor Odinson",
      current_status: "no_request", // Default status
    };
  };

  const requestDetails = getRequestDetails();

  // Status display configuration - Database status mappings
  const getStatusDisplay = (status) => {
    const statusConfig = {
      no_request: {
        text: "No Active Request",
        note: "Ready to submit new request",
        icon: AddSquare,
        pillStyle: {
          backgroundColor: "#F3F4F6",
          color: "#6B7280",
          borderColor: "#6B7280",
          boxShadow: "#6B7280",
        },
      },

      // Database status mappings
      pending: {
        text: "Waiting for Human Resource",
        note: "Human Resource Personnel reviewing your request",
        icon: ClockSquare,
        pillStyle: {
          backgroundColor: "#FEF3C7",
          color: "#D97706",
          borderColor: "#FCD34D",
          boxShadow: "#FCD34D",
        },
      },
      hr_processing: {
        text: "Human Resource Processing",
        note: "Request being processed by Human Resource",
        icon: ClockSquare,
        pillStyle: {
          backgroundColor: "#DBEAFE",
          color: "#2563EB",
          borderColor: "#93C5FD",
          boxShadow: "#93C5FD",
        },
      },
      in_progress: {
        text: "In Progress",
        note: "Request being processed",
        icon: ClockSquare,
        pillStyle: {
          backgroundColor: "#DBEAFE",
          color: "#2563EB",
          borderColor: "#93C5FD",
          boxShadow: "#93C5FD",
        },
      },
      benefits_review: {
        text: "Benefits Officer Review",
        note: "Benefits Officer currently reviewing...",
        icon: ClockSquare,
        pillStyle: {
          backgroundColor: "#DBEAFE",
          color: "#2563EB",
          borderColor: "#93C5FD",
          boxShadow: "#93C5FD",
        },
      },
      welfare_review: {
        text: "Division Head Review",
        note: "Division Head currently reviewing...",
        icon: ClockSquare,
        pillStyle: {
          backgroundColor: "#DBEAFE",
          color: "#2563EB",
          borderColor: "#93C5FD",
          boxShadow: "#93C5FD",
        },
      },
      hr_final_verification: {
        text: "Final Human Resource Verification",
        note: "Human Resource currently finalizing clearance...",
        icon: ClockSquare,
        pillStyle: {
          backgroundColor: "#DBEAFE",
          color: "#2563EB",
          borderColor: "#93C5FD",
          boxShadow: "#93C5FD",
        },
      },
      approved: {
        text: "Request Approved",
        note: "All approvals completed",
        icon: CheckSquare,
        pillStyle: {
          backgroundColor: "#D1FAE5",
          color: "#059669",
          borderColor: "#A7F3D0",
          boxShadow: "#A7F3D0",
        },
      },
      rejected: {
        text: "Request Rejected",
        note: "Request was not approved",
        icon: XSquare,
        pillStyle: {
          backgroundColor: "#FEE2E2",
          color: "#DC2626",
          borderColor: "#FECACA",
          boxShadow: "#FECACA",
        },
      },
      completed: {
        text: "Request Completed",
        note: "Process completed successfully",
        icon: CheckSquare,
        pillStyle: {
          backgroundColor: "#D1FAE5",
          color: "#059669",
          borderColor: "#A7F3D0",
          boxShadow: "#A7F3D0",
        },
      },
    };
    
    return statusConfig[status] || statusConfig.no_request;
  };

  // Get steps based on request type - using database status values
  const getStepsForRequestType = (requestType, currentStatus) => {
    const baseSteps = [
      {
        id: 1,
        label: "No Active Request",
        status: "Ready to submit new request",
        state: "no_request",
        isActive: currentStatus === "no_request",
        isCompleted: false,
      }
    ];

    // Both request types follow the same workflow with database status values
    const workflowSteps = [
      {
        id: 2,
        label: "Request Submitted",
        status: "Letter submitted!",
        state: "pending",
        isActive: currentStatus === "pending",
        isCompleted: ["hr_processing", "in_progress", "benefits_review", "welfare_review", "hr_final_verification", "approved", "completed"].includes(currentStatus),
      },
      {
        id: 3,
        label: "Human Resource Review",
        status: "Human Resource currently reviewing...",
        state: "hr_processing",
        isActive: currentStatus === "hr_processing" || currentStatus === "in_progress",
        isCompleted: ["benefits_review", "welfare_review", "hr_final_verification", "approved", "completed"].includes(currentStatus),
      },
      {
        id: 4,
        label: "Benefits Officer Review",
        status: "Benefits Officer currently reviewing...",
        state: "benefits_review",
        isActive: currentStatus === "benefits_review",
        isCompleted: ["welfare_review", "hr_final_verification", "approved", "completed"].includes(currentStatus),
      },
      {
        id: 5,
        label: "Division Head Review",
        status: "Division Head currently reviewing...",
        state: "welfare_review",
        isActive: currentStatus === "welfare_review",
        isCompleted: ["hr_final_verification", "approved", "completed"].includes(currentStatus),
      },
      {
        id: 6,
        label: "Final Human Resource Verification",
        status: "Human Resource currently finalizing clearance...",
        state: "hr_final_verification",
        isActive: currentStatus === "hr_final_verification",
        isCompleted: ["approved", "completed"].includes(currentStatus),
      },
      {
        id: 7,
        label: "Request Completed",
        status: "Your request has been completed",
        state: "completed",
        isActive: currentStatus === "completed",
        isCompleted: false,
      },
    ];

    return [...baseSteps, ...workflowSteps];
  };

  // Get the appropriate icon for each step
  const getStepIcon = (step) => {
    if (step.isCompleted) return CheckSquare;
    if (step.isActive) {
      if (step.state === "no_request") return AddSquare;
      if (step.state === "pending" || step.state === "in_progress" || step.state.includes("approved")) return ClockSquare;
      if (step.state === "completed") return CheckSquare;
      if (step.state === "rejected") return XSquare;
    }
    return BlankSquare; // For future steps
  };

  const currentStatusDisplay = getStatusDisplay(requestDetails.current_status);
  const steps = getStepsForRequestType(requestDetails.request_type, requestDetails.current_status);

  // Add rejected step if status is rejected
  const allSteps = requestDetails.current_status === "rejected" 
    ? [...steps, {
        id: steps.length + 1,
        label: "Rejected",
        status: "Please review and resubmit",
        state: "rejected",
        isActive: true,
        isCompleted: false,
      }]
    : steps;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navbar */}
      <NavBarMain
        user={{
          ...user,
          name: user ? `${user.first_name} ${user.last_name}` : "Loading..."
        }}
        onLogout={() => {
          sessionStorage.removeItem("user");
          sessionStorage.clear();
          localStorage.removeItem('authToken');
          navigate("/login", { replace: true });
        }}
        showHomeButton={true}
        backButtonIcon={BackSquareIconWhite}
        logo={MetroBankLogo}
      />
      <h1 className="text-center text-base font-bold mb-1 pt-6 text-blue-900 table-fixed pb-4">
        Request Status Tracker
      </h1>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-[41%_59%] px-4 pb-6 gap-6 max-w-6xl mx-auto w-full table-fixed">
  
        {/* Left - Details */}
        <div className="bg-white rounded-3xl shadow-xl shadow-[#00539F]/30 py-4 pb-8 px-20 border border-gray-200 
        outline-2 outline-[#00539F]">
            
          <h2 className="text-base font-bold text-blue-900 mb-4">Details</h2>
          {/* Two-column layout for labels & values */}
          {requestDetails.current_status === 'no_request' ? (
            <div className="text-center text-gray-500 text-sm py-8">
              <p className="mb-2">No active request found</p>
              <p className="text-xs">Submit a new request to track its progress</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 text-left text-xs">
              <span className="font-bold text-blue-900">Request Number:</span>
              <span className="text-left">{requestDetails.request_number || requestDetails.request_id}</span>

              <span className="font-bold text-blue-900">Type:</span>
              <span className="text-left">{requestDetails.request_type === 'letter_of_authorization' ? 'Letter of Authorization' : requestDetails.request_type === 'letter_of_approval' ? 'Letter of Approval' : requestDetails.request_type}</span>

              <span className="font-bold text-blue-900">Requested on:</span>
              <span className="text-left">{requestDetails.created_at ? new Date(requestDetails.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : requestDetails.requested_on}</span>

              <span className="font-bold text-blue-900">Requested by:</span>
              <span className="text-left">{requestDetails.first_name && requestDetails.last_name ? `${requestDetails.first_name} ${requestDetails.last_name}` : requestDetails.requested_by}</span>
            </div>
          )}

          {/* Document Icon */}
          <div className="flex justify-center my-6">
            <img
              src={DocumentIcon}
              alt="Document Icon"
              className="w-70 h-70 object-contain"
            />
          </div>

          {/* Download Buttons */}
          {requestDetails.current_status === 'completed' ? (
            <div className="flex flex-col gap-3 text-sm">
              <button
                onClick={() => handleDownload(
                  `${API_BASE_URL}/requests/${requestDetails.id}/download-latest-file`,
                  `Approval_Letter_${requestDetails.request_number || requestDetails.request_id}.pdf`
                )}
                className="px-4 py-2 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white cursor-pointer shadow-md hover:shadow-lg transition-all text-center"
              >
                📄 Download Approval Letter
              </button>
              <button
                onClick={() => handleDownload(
                  `${API_BASE_URL}/requests/${requestDetails.id}/download-executive-file`,
                  `Original_Request_${requestDetails.request_number || requestDetails.request_id}.pdf`
                )}
                className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white cursor-pointer shadow-md hover:shadow-lg transition-all text-center"
              >
                📋 Download Original Request
              </button>
            </div>
          ) : (
            <div className="flex justify-center text-sm">
              <button
                disabled
                className="px-4 py-2 rounded-full bg-gray-300 text-gray-600 cursor-not-allowed shadow-md"
              >
                Download (Available when completed)
              </button>
            </div>
          )}

          {/* View Full Details Button - Only show if there's an active request */}
          {requestDetails.current_status !== 'no_request' && requestDetails.id && (
            <div className="flex justify-center mt-4">
              <button
                onClick={() => setShowDetailsModal(true)}
                className="px-6 py-2 rounded-full bg-gradient-to-r cursor-pointer from-blue-600 to-purple-600 text-white font-semibold shadow-md hover:shadow-lg transition-all text-sm"
              >
                📋 View Full Details
              </button>
            </div>
          )}
        </div>

        {/* Right - Progress */}
        <div className="bg-white rounded-3xl shadow-xl py-4 md:px-20 sm:px-4 border border-gray-200 shadow-[#00539F]/30
        outline-2 outline-[#00539F]">
          <h2 className="text-base font-bold text-blue-900 mb-4">
            Request Progress
          </h2>

          {/* Status pill - Same styling as dashboard */}
          <div className="flex justify-center mb-6">
            <div
              className="font-bold rounded-full shadow-xl/20 px-4 pt-2 pb-1 flex flex-col items-center border mx-auto w-60 h-20"
              style={currentStatusDisplay.pillStyle}
            >
              <div className="flex items-center">
                <img src={currentStatusDisplay.icon} alt="Status" className="w-10 h-10 mr-1" />
                <span>{currentStatusDisplay.text}</span>
              </div>
              <p className="text-xs text-gray-500 flex flex-col">{currentStatusDisplay.note}</p>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-3 text-left text-sm mb-6 pl-4">
            {allSteps.map((step) => (
              <div key={step.id} className={`flex items-start gap-3 ${step.isActive ? 'opacity-100' : step.isCompleted ? 'opacity-80' : 'opacity-40'}`}>
                <img src={getStepIcon(step)} alt="status" className="w-7 h-7" />
                <div>
                  <p className={`font-medium ${step.isActive ? 'text-blue-900' : ''}`}>
                    {step.label}
                  </p>
                  <p className="text-xs text-gray-600">Status: {step.status}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="grid grid-cols-[.5fr_1fr_1fr_1fr_1fr] mt-6 text-xs text-gray-600 pl-4 text-left">
            <p className="flex items-center font-bold">Legend:</p>

            <p className="flex items-center gap-1">
              <img src={CheckSquare} className="w-5 h-5" alt="Completed" /> Completed
            </p>
            <p className="flex items-center gap-1">
              <img src={ClockSquare} className="w-5 h-5" alt="Waiting" /> Waiting
            </p>
            <p className="flex items-center gap-1">
              <img src={AddSquare} className="w-5 h-5" alt="No request" /> No request
            </p>
            <p className="flex items-center gap-1">
              <img src={XSquare} className="w-5 h-5" alt="Rejected" /> Rejected
            </p>
          </div>
        </div>
      </div>

      {/* View Request Details Modal */}
      <ViewRequestDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        requestId={requestDetails.id}
      />
    </div>
  );
}