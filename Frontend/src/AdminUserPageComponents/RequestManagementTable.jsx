import React from "react";

export default function RequestManagementTable({ requests, onViewDetails, loading }) {
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
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No requests found</p>
      </div>
    );
  }

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

  const isOverdue = (dueDate, status) => {
    if (['completed', 'rejected'].includes(status)) return false;
    const due = new Date(dueDate);
    const today = new Date();
    return due < today;
  };

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
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
              Priority
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
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {requests.map((request) => (
            <tr key={request.id} className="hover:bg-gray-50">
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
                <div className="text-sm text-gray-900">{request.request_type}</div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(request.current_status)}`}>
                  {getStatusLabel(request.current_status)}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {request.priority_level === 'urgent' ? (
                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                    Urgent
                  </span>
                ) : (
                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                    Normal
                  </span>
                )}
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
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => onViewDetails(request)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}