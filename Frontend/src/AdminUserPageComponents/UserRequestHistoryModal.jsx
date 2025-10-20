import React, { useState, useEffect } from "react";
import apiService from "@/services/api";

export default function UserRequestHistoryModal({ userId, userName, onClose }) {
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUserHistory();
  }, [userId]);

  const fetchUserHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiService.getUserRequestHistory(userId);

      if (response.success) {
        setRequests(response.data?.requests || []);
        setStats(response.data?.stats || {});
      } else {
        setError(response.error || "Failed to fetch request history");
      }
    } catch (error) {
      console.error("Error fetching user history:", error);
      setError(error.message || "Failed to load request history");
    } finally {
      setLoading(false);
    }
  };

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
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/20 flex items-center justify-center z-[70] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Request History</h2>
              <p className="text-sm text-gray-600 mt-1">{userName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-3xl font-bold leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        {!loading && (
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="text-xs text-gray-600">Total</div>
                <div className="text-xl font-bold text-blue-600">{stats.total_requests || 0}</div>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="text-xs text-gray-600">Pending</div>
                <div className="text-xl font-bold text-gray-600">{stats.pending || 0}</div>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="text-xs text-gray-600">Under Review</div>
                <div className="text-xl font-bold text-yellow-600">{stats.under_review || 0}</div>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="text-xs text-gray-600">Approved</div>
                <div className="text-xl font-bold text-green-600">{stats.approved || 0}</div>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="text-xs text-gray-600">Completed</div>
                <div className="text-xl font-bold text-green-700">{stats.completed || 0}</div>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="text-xs text-gray-600">Rejected</div>
                <div className="text-xl font-bold text-red-600">{stats.rejected || 0}</div>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="text-xs text-gray-600">Urgent</div>
                <div className="text-xl font-bold text-red-700">{stats.urgent || 0}</div>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="text-xs text-gray-600">Overdue</div>
                <div className="text-xl font-bold text-red-800">{stats.overdue || 0}</div>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
              <span className="ml-3 text-gray-600">Loading request history...</span>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No requests found for this user</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-lg font-semibold text-blue-600">{request.request_number}</div>
                      <div className="text-sm text-gray-600">{request.request_type}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.current_status)}`}>
                        {request.current_status?.replace(/_/g, ' ').toUpperCase()}
                      </span>
                      {request.priority_level === 'urgent' && (
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          URGENT
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-xs text-gray-600">Hospital</div>
                      <div className="font-medium text-gray-900">{request.hospital_name || "-"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Assigned HR</div>
                      <div className="font-medium text-gray-900">
                        {request.hr_first_name && request.hr_last_name
                          ? `${request.hr_first_name} ${request.hr_last_name}`
                          : <span className="text-gray-400 italic">Unassigned</span>
                        }
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Created</div>
                      <div className="text-gray-900">{formatDate(request.created_at)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Due Date</div>
                      <div className="text-gray-900">{formatDate(request.due_date)}</div>
                    </div>
                  </div>

                  {request.rejection_reason && (
                    <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="text-xs text-red-600 font-semibold mb-1">Rejection Reason:</div>
                      <div className="text-sm text-red-800">{request.rejection_reason}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end bg-gray-50">
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