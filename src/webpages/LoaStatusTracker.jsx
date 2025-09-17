import React from "react";
import NavBarSide from "@/ExecutiveEmployeeProfileComponents/NavBarSide";

// ✅ Your imported icons
import CheckSquare from "@/assets/checksquare.svg";
import ClockSquare from "@/assets/clocksquare.svg";
import XSquare from "@/assets/xsquare.svg";
import AddSquare from "@/assets/addsquare.svg";
import DocumentIcon from "@/assets/documenticon.svg";

export default function LOAStatusTracker() {
  // Example data (replace with props or API later)
  const requestDetails = {
    request_type: "Letter of Authorization",
    request_id: 12345,
    requested_on: "April 18, 2025",
    requested_by: "Thor Odinson",
    action_status: "no_request", // Possible values: no_request, requestsubmitted, submittedapproval, awaiting, rejected, completed
  };

  const steps = [
    {
      id: 1,
      label: "No Active Request",
      status: "Ready to submit new request",
      state: "no_request",
    },
    {
      id: 2,
      label: "Request Submitted",
      status: "Submitted Letter of Approval",
      state: "requestsubmitted",
    },
    {
      id: 3,
      label: "Request Submitted",
      status: "Submitted Letter of Authorization",
      state: "requestsubmitted",
    },
    {
      id: 4,
      label: "Completed",
      status: "Your request has been completed",
      state: "completed",
    },
    {
      id: 5,
      label: "Waiting for approval",
      status: "Under review by Benefits Service Officer",
      state: "awaiting",
    },
    {
      id: 6,
      label: "Waiting for approval",
      status: "Under review by Benefits Assistant",
      state: "awaiting",
    },
    {
      id: 7,
      label: "Waiting for approval",
      status: "Under review by Division Head",
      state: "awaiting",
    },
    {
      id: 8,
      label: "Rejected",
      status: "Please review and resubmit",
      state: "rejected",
    },
  ];

  // Pick icon based on step state
  const getIcon = (state) => {
    switch (state) {
      case "no_request":
        return AddSquare;
      case "requestsubmitted":
        return ClockSquare;
      case "submittedapproval":
        return CheckSquare;
      case "awaiting":
        return ClockSquare;
      case "rejected":
        return XSquare;
    case "completed":
        return CheckSquare;
      default:
        return AddSquare;
    }
  };

  // Get status display for the current request
  const getCurrentStatusDisplay = () => {
    const currentStep = steps.find(step => step.state === "in_progress");
    if (currentStep) {
      return {
        text: "In Progress",
        icon: ClockSquare
      };
    }
    return {
      text: requestDetails.status,
      icon: ClockSquare
    };
  };

  const currentStatus = getCurrentStatusDisplay();

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

          {/* Status pill */}
          <div className="flex justify-center mb-1">
            <span className="bg-yellow-100 border border-yellow-400 text-yellow-700 text-sm font-medium px-4 py-1 rounded-full flex items-center gap-2">
              <img src={currentStatus.icon} alt="Status" className="w-10 h-10 mr-1" />
              {currentStatus.text}
            </span>
          </div>

          {/* Steps */}
          <div className="space-y-1 text-left text-sm mb-2 pl-4">
            {steps.map((step) => (
              <div key={step.id} className="flex items-start gap-3">
                <img src={getIcon(step.state)} alt="status" className="w-7 h-7" />
                <div>
                  <p className="font-sm">{step.label}</p>
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