import React, { useState, useEffect, useRef } from "react";

export default function HRRequestManagementTable({ requests, loading, activeFilter }) {
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const tableContainerRef = useRef(null);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
        <span className="ml-3 text-gray-600">Loading requests...</span>
      </div>
    );
  }

  if (requests.length === 0) {
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
            Try selecting a different filter
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

  return (
    <div className="relative">
      <div
        ref={tableContainerRef}
        className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm overflow-y-auto"
        style={{ maxHeight: "calc(100vh - 400px)" }}
      >
        <table className="w-full">
          <thead className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                Request Number
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                Type of Request
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                Submitted
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {requests.map((request) => (
              <tr key={request.id} className="hover:bg-blue-50/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-gray-900">
                    {request.employee_first_name} {request.employee_last_name}
                  </div>
                  <div className="text-xs text-gray-500">
                    ID: {request.employee_id || "-"}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-semibold text-blue-600">
                    {request.request_number || "-"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-700">
                    {formatRequestType(request.request_type)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-700">
                    {formatDate(request.created_at)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-sm font-medium ${getStatusColor(request.current_status)}`}>
                    {getStatusLabel(request.current_status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Scroll Indicator */}
      {showScrollIndicator && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-bounce z-20">
          <span className="text-sm font-medium">Scroll for more</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      )}
    </div>
  );
}