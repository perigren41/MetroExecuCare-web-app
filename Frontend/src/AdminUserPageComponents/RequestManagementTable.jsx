import React from "react";

export default function RequestManagementTable({ requests, onViewDetails, loading, activeFilter }) {
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
      <div className="hidden md:block overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Request #
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assigned HR
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hospital
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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

      {/* Mobile Card View - Visible only on mobile */}
      <div className="md:hidden space-y-4">
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
    </>
  );
}