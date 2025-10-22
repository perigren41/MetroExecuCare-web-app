import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "@/services/api";

export default function UserRequestHistoryModal({ userId, userName, userRole, onClose }) {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fetchedUserRole, setFetchedUserRole] = useState(userRole || "");

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
        setFetchedUserRole(response.data?.userRole || userRole || "");
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

  const formatRequestType = (type) => {
    if (!type) return "-";
    // Convert letter_of_authorization to Letter of Authorization
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
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

  const handleRequestClick = (requestId) => {
    // Navigate to LOA Record Summary page
    navigate(`/loa-record-summary/${requestId}`);
  };

  // Role-specific labels
  const getRoleSpecificLabel = () => {
    if (fetchedUserRole === 'executive') {
      return {
        title: "My Submitted Requests",
        subtitle: "Requests you have submitted for approval"
      };
    } else if (fetchedUserRole === 'hr_personnel') {
      return {
        title: "My Assigned Requests",
        subtitle: "Requests you have claimed or been assigned"
      };
    } else if (fetchedUserRole === 'benefits_officer') {
      return {
        title: "My Reviewed Requests",
        subtitle: "Requests you have reviewed as Benefits Officer"
      };
    } else if (fetchedUserRole === 'welfare_head') {
      return {
        title: "My Reviewed Requests",
        subtitle: "Requests you have reviewed as Division Head"
      };
    }
    return {
      title: "Request History",
      subtitle: "User's request activity"
    };
  };

  const roleLabels = getRoleSpecificLabel();

  return (
    <div
      className="fixed inset-0 bg-gradient-to-br from-purple-900/30 via-blue-900/30 to-purple-900/30 backdrop-blur-sm flex items-center justify-center z-[70] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Gradient */}
        <div className="px-6 py-5 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{roleLabels.title}</h2>
              <p className="text-purple-100 text-sm mt-1">{userName}</p>
              <p className="text-purple-200 text-xs mt-0.5">{roleLabels.subtitle}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-purple-200 text-3xl font-bold leading-none transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        {!loading && (
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              <div className="relative p-[2px] rounded-lg" style={{ background: "linear-gradient(to right, #3F6EC0, #00539F, #5D3EA4, #7940A8)" }}>
                <div className="bg-white rounded-lg shadow hover:shadow-md transition-all duration-200 p-3">
                  <div className="text-2xl font-bold text-gray-900">{stats.total_requests || 0}</div>
                  <div className="text-xs font-medium text-gray-600">Total</div>
                </div>
              </div>
              <div className="relative p-[2px] rounded-lg" style={{ background: "linear-gradient(to right, #3F6EC0, #00539F, #5D3EA4, #7940A8)" }}>
                <div className="bg-white rounded-lg shadow hover:shadow-md transition-all duration-200 p-3">
                  <div className="text-2xl font-bold text-gray-900">{stats.pending || 0}</div>
                  <div className="text-xs font-medium text-gray-600">Pending</div>
                </div>
              </div>
              <div className="relative p-[2px] rounded-lg" style={{ background: "linear-gradient(to right, #3F6EC0, #00539F, #5D3EA4, #7940A8)" }}>
                <div className="bg-white rounded-lg shadow hover:shadow-md transition-all duration-200 p-3">
                  <div className="text-2xl font-bold text-gray-900">{stats.under_review || 0}</div>
                  <div className="text-xs font-medium text-gray-600">Under Review</div>
                </div>
              </div>
              <div className="relative p-[2px] rounded-lg" style={{ background: "linear-gradient(to right, #3F6EC0, #00539F, #5D3EA4, #7940A8)" }}>
                <div className="bg-white rounded-lg shadow hover:shadow-md transition-all duration-200 p-3">
                  <div className="text-2xl font-bold text-gray-900">{stats.approved || 0}</div>
                  <div className="text-xs font-medium text-gray-600">Approved</div>
                </div>
              </div>
              <div className="relative p-[2px] rounded-lg" style={{ background: "linear-gradient(to right, #3F6EC0, #00539F, #5D3EA4, #7940A8)" }}>
                <div className="bg-white rounded-lg shadow hover:shadow-md transition-all duration-200 p-3">
                  <div className="text-2xl font-bold text-gray-900">{stats.completed || 0}</div>
                  <div className="text-xs font-medium text-gray-600">Completed</div>
                </div>
              </div>
              <div className="relative p-[2px] rounded-lg" style={{ background: "linear-gradient(to right, #3F6EC0, #00539F, #5D3EA4, #7940A8)" }}>
                <div className="bg-white rounded-lg shadow hover:shadow-md transition-all duration-200 p-3">
                  <div className="text-2xl font-bold text-gray-900">{stats.rejected || 0}</div>
                  <div className="text-xs font-medium text-gray-600">Rejected</div>
                </div>
              </div>
              <div className="relative p-[2px] rounded-lg" style={{ background: "linear-gradient(to right, #3F6EC0, #00539F, #5D3EA4, #7940A8)" }}>
                <div className="bg-white rounded-lg shadow hover:shadow-md transition-all duration-200 p-3">
                  <div className="text-2xl font-bold text-gray-900">{stats.urgent || 0}</div>
                  <div className="text-xs font-medium text-gray-600">Urgent</div>
                </div>
              </div>
              <div className="relative p-[2px] rounded-lg" style={{ background: "linear-gradient(to right, #3F6EC0, #00539F, #5D3EA4, #7940A8)" }}>
                <div className="bg-white rounded-lg shadow hover:shadow-md transition-all duration-200 p-3">
                  <div className="text-2xl font-bold text-gray-900">{stats.overdue || 0}</div>
                  <div className="text-xs font-medium text-gray-600">Overdue</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-gray-50 to-white">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600"></div>
              <span className="ml-3 text-gray-600 font-medium">Loading request history...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-2 border-red-400 text-red-700 px-6 py-4 rounded-xl shadow-md">
              <span className="font-semibold">Error:</span> {error}
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-16 bg-gradient-to-br from-gray-100 to-blue-50 rounded-xl shadow-inner">
              <p className="text-gray-600 font-medium text-lg">No requests found</p>
              <p className="text-gray-500 text-sm mt-2">This user has no request history</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  onClick={() => handleRequestClick(request.id)}
                  className="bg-white border-2 border-gray-200 hover:border-purple-400 rounded-xl p-5 hover:shadow-xl transition-all cursor-pointer transform hover:scale-[1.02]"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-lg font-bold text-purple-600">{request.request_number}</div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRequestClick(request.id);
                          }}
                          className="text-xs px-3 py-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full hover:from-purple-700 hover:to-blue-700 transition-colors font-medium shadow-sm"
                        >
                          View Details →
                        </button>
                      </div>
                      <div className="text-sm text-gray-700 font-medium">{formatRequestType(request.request_type)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1.5 text-xs font-semibold rounded-lg shadow-sm ${getStatusColor(request.current_status)}`}>
                        {request.current_status?.replace(/_/g, ' ').toUpperCase()}
                      </span>
                      {request.priority_level === 'urgent' && (
                        <span className="px-3 py-1.5 text-xs font-semibold rounded-lg shadow-sm bg-gradient-to-r from-red-500 to-red-600 text-white">
                          URGENT
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {/* Role-specific information */}
                    {fetchedUserRole === 'executive' ? (
                      <>
                        <div>
                          <div className="text-xs text-gray-500">Hospital</div>
                          <div className="font-medium text-gray-900 truncate">{request.hospital_name || "-"}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Assigned HR</div>
                          <div className="font-medium text-gray-900">
                            {request.hr_first_name && request.hr_last_name
                              ? `${request.hr_first_name} ${request.hr_last_name}`
                              : <span className="text-gray-400 italic">Unassigned</span>
                            }
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <div className="text-xs text-gray-500">Requester</div>
                          <div className="font-medium text-gray-900">
                            {request.employee_first_name && request.employee_last_name
                              ? `${request.employee_first_name} ${request.employee_last_name}`
                              : "-"
                            }
                          </div>
                          {request.employee_id && (
                            <div className="text-xs text-gray-500">({request.employee_id})</div>
                          )}
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Hospital</div>
                          <div className="font-medium text-gray-900 truncate">{request.hospital_name || "-"}</div>
                        </div>
                      </>
                    )}
                    <div>
                      <div className="text-xs text-gray-500">Created</div>
                      <div className="text-gray-900">{formatDate(request.created_at)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Due Date</div>
                      <div className="text-gray-900">{formatDate(request.due_date)}</div>
                    </div>
                  </div>

                  {/* Show approval action for benefits/welfare */}
                  {(fetchedUserRole === 'benefits_officer' || fetchedUserRole === 'welfare_head') && request.my_action && (
                    <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                      <div className="text-xs text-blue-700 font-semibold mb-1">My Action:</div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${request.my_action === 'approved' ? 'text-green-700' : 'text-red-700'}`}>
                          {request.my_action === 'approved' ? 'Approved' : 'Rejected'}
                        </span>
                        {request.my_action_date && (
                          <span className="text-xs text-gray-600">on {formatDate(request.my_action_date)}</span>
                        )}
                      </div>
                      {request.my_comments && (
                        <div className="text-sm text-gray-700 mt-1 italic">"{request.my_comments}"</div>
                      )}
                    </div>
                  )}

                  {request.rejection_reason && (
                    <div className="mt-3 p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border-2 border-red-200">
                      <div className="text-xs text-red-700 font-semibold mb-1">Rejection Reason:</div>
                      <div className="text-sm text-red-800">{request.rejection_reason}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with Gradient */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-gray-600 to-gray-700 text-white font-medium hover:from-gray-700 hover:to-gray-800 transition-all shadow-md hover:shadow-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
