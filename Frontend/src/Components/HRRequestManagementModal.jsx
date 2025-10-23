import React, { useState, useEffect, useRef } from "react";
import apiService from "@/services/api";

export default function HRRequestManagementModal({ onClose, user }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const tableContainerRef = useRef(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);

  // Fetch all requests (not just pending)
  useEffect(() => {
    fetchAllRequests();
  }, []);

  // Check scroll indicator
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

  const fetchAllRequests = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch all requests (including completed, approved, rejected)
      // API limit is max 100, so we'll fetch with that limit
      const response = await apiService.getRequests({ limit: 100 });

      if (response.success) {
        setRequests(response.data?.requests || []);
      } else {
        setError(response.message || "Failed to fetch requests");
        setRequests([]);
      }
    } catch (err) {
      console.error("Error fetching requests:", err);
      setError("Failed to load requests");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // Format request type for display
  const formatRequestType = (type) => {
    if (type === 'letter_of_authorization') return 'Letter of Authorization';
    if (type === 'letter_of_approval') return 'Letter of Approval';
    return type?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) || "-";
  };

  // Format status for display
  const formatStatus = (status) => {
    const statusMap = {
      'pending': 'Pending',
      'assigned_to_hr': 'Assigned to HR',
      'hr_processing': 'HR Processing',
      'benefits_review': 'Benefits Review',
      'welfare_review': 'Welfare Review',
      'hr_final_verification': 'HR Final Verification',
      'approved': 'Approved',
      'completed': 'Completed',
      'rejected': 'Rejected'
    };
    return statusMap[status] || status?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) || "-";
  };

  // Get status styling
  const getStatusColor = (status) => {
    const colors = {
      pending: "text-gray-700",
      assigned_to_hr: "text-blue-700",
      hr_processing: "text-blue-800",
      benefits_review: "text-yellow-700",
      welfare_review: "text-orange-700",
      hr_final_verification: "text-purple-700",
      approved: "text-green-700",
      completed: "text-green-800",
      rejected: "text-red-700",
    };
    return colors[status] || "text-gray-700";
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter requests
  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.request_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.employee_first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.employee_last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${req.employee_first_name} ${req.employee_last_name}`.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || req.current_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <>
      {/* Modal Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 flex items-center justify-center z-50"
        onClick={onClose}
      >
        {/* Modal Content */}
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Gradient Header */}
          <div className="px-6 py-5 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Request Management</h2>
              <p className="text-blue-100 text-sm mt-1">View and manage all executive checkup requests</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-2xl font-bold transition cursor-pointer"
            >
              ×
            </button>
          </div>

          {/* Search and Filters */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex gap-4 flex-wrap">
              <div className="relative flex-1 min-w-[200px] h-[38px]">
                <div
                  className="absolute inset-0 rounded-full p-[2px]"
                  style={{
                    background: "linear-gradient(to right, #3F6EC0, #00539F, #5D3EA4, #7940A8)",
                  }}
                >
                  <div className="w-full h-full bg-white rounded-full flex items-center px-4">
                    <input
                      type="text"
                      placeholder="Search by request number or employee name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-full border-0 bg-transparent focus:outline-none text-gray-700 placeholder-gray-400"
                    />
                  </div>
                </div>
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="assigned_to_hr">Assigned to HR</option>
                <option value="hr_processing">HR Processing</option>
                <option value="benefits_review">Benefits Review</option>
                <option value="welfare_review">Welfare Review</option>
                <option value="hr_final_verification">HR Final Verification</option>
                <option value="approved">Approved</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mx-6 mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Content Area - Table */}
          <div className="flex-1 overflow-y-auto p-6 relative" ref={tableContainerRef}>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Loading requests...</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Request Number
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Date Submitted
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Hospital
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRequests.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                          <div className="flex flex-col items-center">
                            <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-lg font-medium">No requests found</p>
                            <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredRequests.map((request) => (
                        <tr key={request.id} className="hover:bg-blue-50/50 transition-colors">
                          <td className="px-4 py-3">
                            <span className="text-sm font-semibold text-blue-600">
                              {request.request_number || "-"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-900">
                              {request.employee_first_name} {request.employee_last_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {request.employee_id || "-"}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-gray-700">
                              {formatRequestType(request.request_type)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-sm font-medium ${getStatusColor(request.current_status)}`}>
                              {formatStatus(request.current_status)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-gray-700">
                              {formatDate(request.created_at)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-gray-700">
                              {request.hospital_name || "-"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Scroll Indicator */}
            {showScrollIndicator && (
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
                <span className="text-sm font-medium">Scroll for more</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            )}
          </div>

          {/* Footer with total count */}
          <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-600">
              Showing {filteredRequests.length} of {requests.length} total requests
            </p>
          </div>
        </div>
      </div>
    </>
  );
}