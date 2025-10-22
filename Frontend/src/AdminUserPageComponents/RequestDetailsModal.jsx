import React from "react";

export default function RequestDetailsModal({ request, onClose }) {
  if (!request) return null;

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-gray-100 text-gray-800",
      assigned_to_hr: "bg-blue-100 text-blue-800",
      hr_processing: "bg-blue-200 text-blue-900",
      benefits_review: "bg-yellow-100 text-yellow-800",
      welfare_review: "bg-orange-100 text-orange-800",
      hr_final_verification: "bg-purple-100 text-purple-800",
      approved: "bg-green-100 text-green-800",
      completed: "bg-green-200 text-green-900",
      rejected: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRequestType = (type) => {
    if (type === 'letter_of_authorization') return 'Letter of Authorization';
    if (type === 'letter_of_approval') return 'Letter of Approval';
    return type;
  };

  return (
    <div
      className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{request.request_number}</h2>
            <p className="text-sm text-gray-600 mt-1">
              {request.first_name || request.employee_first_name} {request.last_name || request.employee_last_name} ({request.employee_number || request.employee_id})
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-3xl font-bold leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Status and Request Type Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-600 mb-2">Current Status</div>
              <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getStatusColor(request.current_status)}`}>
                {request.current_status?.replace(/_/g, ' ').toUpperCase()}
              </span>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-600 mb-2">Request Type</div>
              <div className="text-sm font-medium text-gray-900">{formatRequestType(request.request_type)}</div>
            </div>
          </div>

          {/* Request Details */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Request Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-600 mb-1">Hospital</div>
                <div className="text-sm font-medium text-gray-900">{request.selected_hospital_name || request.hospital_name || "-"}</div>
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">Assigned HR Personnel</div>
                <div className="text-sm font-medium text-gray-900">
                  {request.assigned_hr_first_name && request.assigned_hr_last_name
                    ? `${request.assigned_hr_first_name} ${request.assigned_hr_last_name}`
                    : <span className="text-gray-400 italic">Not Assigned</span>
                  }
                </div>
              </div>
              {request.assigned_bo_id && (
                <div>
                  <div className="text-xs text-gray-600 mb-1">Assigned Benefits Officer</div>
                  <div className="text-sm font-medium text-gray-900">
                    {request.assigned_bo_first_name} {request.assigned_bo_last_name}
                  </div>
                </div>
              )}
              {request.assigned_wh_id && (
                <div>
                  <div className="text-xs text-gray-600 mb-1">Assigned Division Head</div>
                  <div className="text-sm font-medium text-gray-900">
                    {request.assigned_wh_first_name} {request.assigned_wh_last_name}
                  </div>
                </div>
              )}
              <div>
                <div className="text-xs text-gray-600 mb-1">Created Date</div>
                <div className="text-sm text-gray-900">{formatDate(request.created_at)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">Due Date</div>
                <div className="text-sm text-gray-900">{formatDate(request.due_date)}</div>
              </div>
              {request.completed_at && (
                <div>
                  <div className="text-xs text-gray-600 mb-1">Completed Date</div>
                  <div className="text-sm text-gray-900">{formatDate(request.completed_at)}</div>
                </div>
              )}
              {request.rejected_at && (
                <div className="md:col-span-2">
                  <div className="text-xs text-gray-600 mb-1">Rejection Reason</div>
                  <div className="text-sm text-red-600">{request.rejection_reason || "-"}</div>
                </div>
              )}
            </div>
          </div>

          {/* Employee Details */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Employee Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-600 mb-1">Full Name</div>
                <div className="text-sm font-medium text-gray-900">
                  {request.first_name || request.employee_first_name} {request.last_name || request.employee_last_name}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">Employee ID</div>
                <div className="text-sm text-gray-900">{request.employee_number || request.employee_id}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}