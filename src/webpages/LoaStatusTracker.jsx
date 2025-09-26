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
      
      {/* Page Title - Responsive */}
      <h1 className="text-center text-sm sm:text-base lg:text-lg font-bold mb-2 sm:mb-4 pt-4 sm:pt-6 text-blue-900 px-4">
        LOA Status Tracker
      </h1>

      {/* Main Content - Mobile/Tablet: Column, Desktop: Grid */}
      <div className="flex flex-col xl:grid xl:grid-cols-[41%_59%] px-4 sm:px-6 pb-6 gap-4 sm:gap-6 max-w-6xl mx-auto w-full">
  
        {/* Left - Details */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl shadow-[#00539F]/30 py-4 sm:py-6 pb-6 sm:pb-8 
        px-4 sm:px-8 lg:px-12 xl:px-20 border border-gray-200 outline outline-1 sm:outline-2 outline-[#00539F] 
        order-2 xl:order-1">
            
          <h2 className="text-sm sm:text-base font-bold text-blue-900 mb-3 sm:mb-4 text-center xl:text-left">Details</h2>
          
          {/* Mobile/Tablet: Centered Details */}
          <div className="xl:hidden">
            <div className="flex flex-col space-y-3 items-center text-center text-xs sm:text-sm">
              <div className="flex flex-col">
                <span className="font-bold text-blue-900">Type:</span>
                <span>{requestDetails.request_type}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-blue-900">Requested ID:</span>
                <span>{requestDetails.request_id}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-blue-900">Requested on:</span>
                <span>{requestDetails.requested_on}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-blue-900">Requested by:</span>
                <span>{requestDetails.requested_by}</span>
              </div>
            </div>
          </div>

          {/* Desktop: Two-column layout */}
          <div className="hidden xl:grid xl:grid-cols-2 text-left text-xs">
            <span className="font-bold text-blue-900">Type:</span>
            <span className="text-left">{requestDetails.request_type}</span>

            <span className="font-bold text-blue-900">Requested ID:</span>
            <span className="text-left">{requestDetails.request_id}</span>

            <span className="font-bold text-blue-900">Requested on:</span>
            <span className="text-left">{requestDetails.requested_on}</span>

            <span className="font-bold text-blue-900">Requested by:</span>
            <span className="text-left">{requestDetails.requested_by}</span>
          </div>

          {/* Document Icon - Responsive */}
          <div className="flex justify-center my-4 sm:my-6">
            <img
              src={DocumentIcon}
              alt="Document Icon"
              className="w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 xl:w-70 xl:h-70 object-contain"
            />
          </div>

          {/* Download Button - Responsive */}
          <div className="flex justify-center text-xs sm:text-sm">
            <button
              disabled
              className="px-3 sm:px-4 py-2 rounded-full bg-gray-300 text-gray-600 cursor-not-allowed shadow-md"
            >
              Download
            </button>
          </div>
        </div>

        {/* Right - Progress */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl py-4 sm:py-6 px-4 sm:px-8 lg:px-12 xl:px-20 
        border border-gray-200 shadow-[#00539F]/30 outline outline-1 sm:outline-2 outline-[#00539F] order-1 xl:order-2">
          
          <h2 className="text-sm sm:text-base font-bold text-blue-900 mb-3 sm:mb-4 text-center xl:text-left">
            LOA Request Progress
          </h2>

          {/* Status pill - Responsive */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <div
              className="font-bold rounded-full shadow-xl/20 px-3 sm:px-4 py-2 sm:py-3 
              flex flex-col items-center border mx-auto 
              w-full max-w-[280px] sm:max-w-[320px] lg:max-w-[340px] xl:w-60 
              min-h-[70px] sm:min-h-[80px] xl:h-20"
              style={currentStatusDisplay.pillStyle}
            >
              <div className="flex items-center">
                <img src={currentStatusDisplay.icon} alt="Status" 
                className="w-8 h-8 sm:w-9 sm:h-9 xl:w-10 xl:h-10 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm xl:text-base">{currentStatusDisplay.text}</span>
              </div>
              <p className="text-xs text-gray-500 text-center mt-1">{currentStatusDisplay.note}</p>
            </div>
          </div>

          {/* Steps - Responsive */}
          <div className="space-y-2 sm:space-y-3 text-left text-xs sm:text-sm mb-4 sm:mb-6 pl-2 sm:pl-4">
            {allSteps.map((step) => (
              <div key={step.id} className={`flex items-start gap-2 sm:gap-3 ${step.isActive ? 'opacity-100' : step.isCompleted ? 'opacity-80' : 'opacity-40'}`}>
                <img src={getStepIcon(step)} alt="status" className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0" />
                <div className="min-w-0">
                  <p className={`font-medium leading-tight ${step.isActive ? 'text-blue-900' : ''}`}>
                    {step.label}
                  </p>
                  <p className="text-xs text-gray-600 leading-tight">Status: {step.status}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Legend - Mobile Centered, Tablet/Desktop Original */}
          <div className="mt-4 sm:mt-6 text-xs text-gray-600">
            {/* Mobile: Centered Legend */}
            <div className="sm:hidden text-center">
              <p className="font-bold mb-3">Legend:</p>
              <div className="flex flex-col space-y-2 items-center">
                <div className="flex items-center gap-2">
                  <img src={CheckSquare} className="w-4 h-4" alt="Completed" />
                  <span>Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <img src={ClockSquare} className="w-4 h-4" alt="Waiting" />
                  <span>Waiting</span>
                </div>
                <div className="flex items-center gap-2">
                  <img src={AddSquare} className="w-4 h-4" alt="No request" />
                  <span>No request</span>
                </div>
                <div className="flex items-center gap-2">
                  <img src={XSquare} className="w-4 h-4" alt="Rejected" />
                  <span>Rejected</span>
                </div>
              </div>
            </div>

            {/* Tablet/Desktop: Original Layout */}
            <div className="hidden sm:grid sm:grid-cols-[.5fr_1fr_1fr_1fr_1fr] pl-4 text-left">
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
    </div>
  );
}