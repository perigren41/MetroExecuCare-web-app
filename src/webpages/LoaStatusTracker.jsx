import React from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import NavBarSide from "@/ExecutiveEmployeeProfileComponents/NavBarSide";

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

export default function LOAStatusTracker() {
  const [searchParams] = useSearchParams();
  const location = useLocation();

  // Get data from URL params or navigation state
  const getRequestDetails = () => {
    // Priority 1: Data from navigation state (most complete)
    if (location.state?.requestDetails) {
      return location.state.requestDetails;
    }

    // Priority 2: Data from URL parameters
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

    // Priority 3: Default/fallback data
    return {
      request_type: "Letter of Authorization",
      request_id: 12345,
      requested_on: "April 18, 2025",
      requested_by: "Thor Odinson",
      current_status: "no_request", // Default status
    };
  };

  const requestDetails = getRequestDetails();

  // Status display configuration - Same as dashboard
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
      awaitingbso: {
        text: "Waiting for approval",
        note: "Benefit Service Officer under review",
        icon: ClockSquare,
        pillStyle: {
          backgroundColor: "#DBECFF",
          color: COLORS.blue,
          borderColor: "#B3D6FF",
          boxShadow: "#B3D6FF",
        },
      },
      awaitingba: {
        text: "Waiting for approval",
        note: "Benefits Assistant under review",
        icon: ClockSquare,
        pillStyle: {
          backgroundColor: "#DBECFF",
          color: COLORS.blue,
          borderColor: "#B3D6FF",
          boxShadow: "#B3D6FF",
        },
      },
      awaitingdh: {
        text: "Waiting for approval",
        note: "Division Head under review",
        icon: ClockSquare,
        pillStyle: {
          backgroundColor: "#DBECFF",
          color: COLORS.blue,
          borderColor: "#B3D6FF",
          boxShadow: "#B3D6FF",
        },
      },
      submittedapproval: {
        text: "Request Submitted",
        note: "Submitted Letter of Approval",
        icon: CheckSquare,
        pillStyle: {
          backgroundColor: "#D1FAE5",
          color: "#059669",
          borderColor: "#A7F3D0",
          boxShadow: "#A7F3D0",
        },
      },
      submittedauthorization: {
        text: "Request Submitted",
        note: "Submitted Letter of Authorization",
        icon: CheckSquare,
        pillStyle: {
          backgroundColor: "#D1FAE5",
          color: "#059669",
          borderColor: "#A7F3D0",
          boxShadow: "#A7F3D0",
        },
      },
      completed: {
        text: "Request Completed",
        note: "Your request has been completed",
        icon: CheckSquare,
        pillStyle: {
          backgroundColor: "#D1FAE5",
          color: "#059669",
          borderColor: "#A7F3D0",
          boxShadow: "#A7F3D0",
        },
      },
      rejected: {
        text: "Rejected",
        note: "Please review and resubmit",
        icon: XSquare,
        pillStyle: {
          backgroundColor: "#FEE2E2",
          color: "#DC2626",
          borderColor: "#FECACA",
          boxShadow: "#FECACA",
        },
      },
    };
    
    return statusConfig[status] || statusConfig.no_request;
  };

  // Get steps based on request type
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

    if (requestType === "Letter of Approval") {
      return [
        ...baseSteps,
        {
          id: 2,
          label: "Request Submitted",
          status: "Submitted Letter of Approval",
          state: "submittedapproval",
          isActive: currentStatus === "submittedapproval",
          isCompleted: ["awaitingbso", "awaitingba", "awaitingdh", "completed"].includes(currentStatus),
        },
        {
          id: 3,
          label: "Waiting for approval",
          status: "Under review by Benefit Service Officer",
          state: "awaitingbso",
          isActive: currentStatus === "awaitingbso",
          isCompleted: ["awaitingba", "awaitingdh", "completed"].includes(currentStatus),
        },
        {
          id: 4,
          label: "Waiting for approval",
          status: "Under review by Benefits Assistant",
          state: "awaitingba",
          isActive: currentStatus === "awaitingba",
          isCompleted: ["awaitingdh", "completed"].includes(currentStatus),
        },
        {
          id: 5,
          label: "Waiting for approval",
          status: "Under review by Division Head",
          state: "awaitingdh",
          isActive: currentStatus === "awaitingdh",
          isCompleted: currentStatus === "completed",
        },
        {
          id: 6,
          label: "Request Completed",
          status: "Your request has been completed",
          state: "completed",
          isActive: currentStatus === "completed",
          isCompleted: false,
        },
      ];
    } else if (requestType === "Letter of Authorization") {
      return [
        ...baseSteps,
        {
          id: 2,
          label: "Request Submitted",
          status: "Submitted Letter of Authorization",
          state: "submittedauthorization",
          isActive: currentStatus === "submittedauthorization",
          isCompleted: ["awaitingbso", "awaitingba", "awaitingdh", "completed"].includes(currentStatus),
        },
        {
          id: 3,
          label: "Waiting for approval",
          status: "Under review by Benefit Service Officer",
          state: "awaitingbso",
          isActive: currentStatus === "awaitingbso",
          isCompleted: ["awaitingba", "awaitingdh", "completed"].includes(currentStatus),
        },
        {
          id: 4,
          label: "Waiting for approval",
          status: "Under review by Benefits Assistant",
          state: "awaitingba",
          isActive: currentStatus === "awaitingba",
          isCompleted: ["awaitingdh", "completed"].includes(currentStatus),
        },
        {
          id: 5,
          label: "Waiting for approval",
          status: "Under review by Division Head",
          state: "awaitingdh",
          isActive: currentStatus === "awaitingdh",
          isCompleted: currentStatus === "completed",
        },
        {
          id: 6,
          label: "Request Completed",
          status: "Your request has been completed",
          state: "completed",
          isActive: currentStatus === "completed",
          isCompleted: false,
        },
      ];
    }

    return baseSteps;
  };

  // Get the appropriate icon for each step
  const getStepIcon = (step) => {
    if (step.isCompleted) return CheckSquare;
    if (step.isActive) {
      if (step.state === "no_request") return AddSquare;
      if (step.state.includes("awaiting")) return ClockSquare;
      if (step.state.includes("submitted")) return CheckSquare;
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
      <NavBarSide />
      <h1 className="text-center text-base font-bold mb-1 pt-6 text-blue-900 table-fixed pb-4">
        LOA Status Tracker
      </h1>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-[41%_59%] px-4 pb-6 gap-6 max-w-6xl mx-auto w-full table-fixed">
  
        {/* Left - Details */}
        <div className="bg-white rounded-3xl shadow-xl shadow-[#00539F]/30 py-4 pb-8 px-20 border border-gray-200 
        outline outline-2 outline-[#00539F]">
            
          <h2 className="text-base font-bold text-blue-900 mb-4">Details</h2>
          {/* Two-column layout for labels & values */}
          <div className="grid grid-cols-2 text-left text-xs">
            <span className="font-bold text-blue-900">Type:</span>
            <span className="text-left">{requestDetails.request_type}</span>

            <span className="font-bold text-blue-900">Requested ID:</span>
            <span className="text-left">{requestDetails.request_id}</span>

            <span className="font-bold text-blue-900">Requested on:</span>
            <span className="text-left">{requestDetails.requested_on}</span>

            <span className="font-bold text-blue-900">Requested by:</span>
            <span className="text-left">{requestDetails.requested_by}</span>
          </div>

          {/* Document Icon */}
          <div className="flex justify-center my-6">
            <img
              src={DocumentIcon}
              alt="Document Icon"
              className="w-70 h-70 object-contain"
            />
          </div>

          {/* Download Button */}
          <div className="flex justify-center text-sm">
            <button
              disabled
              className="px-4 py-2 rounded-full bg-gray-300 text-gray-600 cursor-not-allowed shadow-md"
            >
              Download
            </button>
          </div>
        </div>

        {/* Right - Progress */}
        <div className="bg-white rounded-3xl shadow-xl py-4 md:px-20 sm:px-4 border border-gray-200 shadow-[#00539F]/30
        outline outline-2 outline-[#00539F]">
          <h2 className="text-base font-bold text-blue-900 mb-4">
            LOA Request Progress
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
    </div>
  );
}