import React, { useState, useEffect, useRef } from "react";

export default function RequestManagementTable({ requests, onViewDetails, loading, activeFilter }) {
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [showMobileScrollIndicator, setShowMobileScrollIndicator] = useState(false);
  const tableContainerRef = useRef(null);
  const mobileContainerRef = useRef(null);

  useEffect(() => {
    const checkScroll = () => {
      if (tableContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = tableContainerRef.current;
        const hasMoreContent = scrollHeight > clientHeight;
        const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;
        setShowScrollIndicator(hasMoreContent && !isAtBottom);
      }
    };

    checkScroll();
    const container = tableContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', checkScroll);
      }
      window.removeEventListener('resize', checkScroll);
    };
  }, [requests]);

  useEffect(() => {
    const checkMobileScroll = () => {
      if (mobileContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = mobileContainerRef.current;
        const hasMoreContent = scrollHeight > clientHeight;
        const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;
        setShowMobileScrollIndicator(hasMoreContent && !isAtBottom);
      }
    };

    checkMobileScroll();
    const container = mobileContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkMobileScroll);
      window.addEventListener('resize', checkMobileScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', checkMobileScroll);
      }
      window.removeEventListener('resize', checkMobileScroll);
    };
  }, [requests]);
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
        <span className="ml-3 text-gray-600">Loading requests...</span>
      </div>
    );
  }

  if (requests.length === 0) {
    const getFilterLabel = (filter) => {
      const labels = {
        all: "All Requests",
        pending: "Pending",
        in_progress: "In Progress",
        approved: "Approved",
        rejected: "Rejected",
        overdue: "Overdue",
        unassigned: "Unassigned"
      };
      return labels[filter] || filter;
    };

    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <svg
          className="mx-auto h-12 w-12 text-gray-400 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="text-gray-500 text-lg font-medium">No requests found</p>
        {activeFilter && activeFilter !== "all" && (
          <p className="text-gray-400 text-sm mt-2">
            Filter: {getFilterLabel(activeFilter)}
          </p>
        )}
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: "text-gray-800",
      assigned_to_hr: "text-blue-800",
      hr_processing: "text-blue-900",
      benefits_review: "text-yellow-800",
      welfare_review: "text-orange-800",
      hr_final_verification: "text-purple-800",
      approved: "text-green-800",
      completed: "text-green-900",
      rejected: "text-red-800",
    };
    return colors[status] || "text-gray-800";
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: "Pending",
      assigned_to_hr: "Assigned to HR",
      hr_processing: "HR Processing",
      benefits_review: "Benefits Review",
      welfare_review: "Welfare Review",
      hr_final_verification: "HR Final Verification",
      approved: "Approved",
      completed: "Completed",
      rejected: "Rejected",
    };
    return labels[status] || status;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatRequestType = (type) => {
    if (type === 'letter_of_authorization') return 'Letter of Authorization';
    if (type === 'letter_of_approval') return 'Letter of Approval';
    return type;
  };

  const isOverdue = (dueDate, status) => {
    if (['completed', 'rejected'].includes(status)) return false;
    const due = new Date(dueDate);
    const today = new Date();
    return due < today;
  };

  return (
    <>
      {/* Desktop Table View - Hidden on mobile */}
      <div className="hidden md:block relative h-full">
        <div ref={tableContainerRef} className="overflow-auto bg-white rounded-lg shadow h-full border border-gray-200">
          <table className="min-w-full">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[linear-gradient(to_right,#3F6EC0_10%,#00539F_30%,#5D3EA4_50%,#7940A8_75%)] text-white">
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">
                  Request #
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">
                  Assigned HR
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">
                  Hospital
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">
                  Created
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">
                  Due Date
                </th>
              </tr>
            </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {requests.map((request) => (
              <tr
                key={request.id}
                onClick={() => onViewDetails(request)}
                className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 cursor-pointer transition-all duration-200 hover:shadow-sm"
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm font-medium text-blue-600">
                    {request.request_number}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {request.employee_first_name} {request.employee_last_name}
                  </div>
                  <div className="text-xs text-gray-500">{request.employee_id}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatRequestType(request.request_type)}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`text-xs leading-5 font-semibold ${getStatusColor(request.current_status)}`}>
                    {getStatusLabel(request.current_status)}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {request.hr_first_name && request.hr_last_name
                      ? `${request.hr_first_name} ${request.hr_last_name}`
                      : <span className="text-gray-400 italic">Unassigned</span>
                    }
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-gray-900 max-w-xs truncate">
                    {request.hospital_name || "-"}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{formatDate(request.created_at)}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className={`text-sm ${isOverdue(request.due_date, request.current_status) ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                    {formatDate(request.due_date)}
                    {isOverdue(request.due_date, request.current_status) && (
                      <span className="ml-1 text-xs">(Overdue)</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        {/* Scroll Indicator - Desktop */}
        {showScrollIndicator && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
            <div className="flex flex-col items-center animate-bounce">
              <span className="text-sm font-medium text-blue-600 mb-1">Scroll</span>
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Card View - Visible only on mobile */}
      <div className="md:hidden relative h-full">
        <div ref={mobileContainerRef} className="overflow-auto space-y-4 pb-16 h-full">
          {requests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:scale-[1.02]"
              onClick={() => onViewDetails(request)}
            >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="text-sm font-bold text-blue-600 mb-1">
                  {request.request_number}
                </div>
                <div className="text-sm text-gray-900 font-medium">
                  {request.employee_first_name} {request.employee_last_name}
                </div>
                <div className="text-xs text-gray-500">{request.employee_id}</div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`text-xs leading-5 font-semibold ${getStatusColor(request.current_status)}`}>
                  {getStatusLabel(request.current_status)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-500">Type:</span>
                <div className="text-gray-900 font-medium">{formatRequestType(request.request_type)}</div>
              </div>
              <div>
                <span className="text-gray-500">Assigned HR:</span>
                <div className="text-gray-900 font-medium">
                  {request.hr_first_name && request.hr_last_name
                    ? `${request.hr_first_name} ${request.hr_last_name}`
                    : <span className="text-gray-400 italic">Unassigned</span>
                  }
                </div>
              </div>
              <div>
                <span className="text-gray-500">Created:</span>
                <div className="text-gray-900">{formatDate(request.created_at)}</div>
              </div>
              <div>
                <span className="text-gray-500">Due Date:</span>
                <div className={`${isOverdue(request.due_date, request.current_status) ? 'text-red-600 font-semibold' : 'text-gray-900'}`}>
                  {formatDate(request.due_date)}
                  {isOverdue(request.due_date, request.current_status) && (
                    <div className="text-xs text-red-600">(Overdue)</div>
                  )}
                </div>
              </div>
            </div>

            {request.hospital_name && (
              <div className="mt-2 text-xs">
                <span className="text-gray-500">Hospital:</span>
                <div className="text-gray-900 truncate">{request.hospital_name}</div>
              </div>
            )}
          </div>
        ))}
        </div>

        {/* Scroll Indicator - Mobile */}
        {showMobileScrollIndicator && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
            <div className="flex flex-col items-center animate-bounce">
              <span className="text-sm font-medium text-blue-600 mb-1">Scroll</span>
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </>
  );
}