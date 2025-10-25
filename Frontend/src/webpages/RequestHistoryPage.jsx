// RequestHistoryPage.jsx - User's own request history page
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import NavBarMain from "@/Components/NavBarMain";
import apiService from "@/services/api";
import BackSquareIconWhite from "@/assets/BackSquareIconWhite.svg";
import mainLogo from "../assets/mainLogo-foreground.svg";
import SearchIcon from "@/assets/search.svg";

export default function RequestHistoryPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState("");

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  // Fetch user's own request history
  const fetchRequestHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getUserRequestHistory(user.id);

      if (response.success) {
        setRequests(response.data?.requests || []);
        setStats(response.data?.stats || {});
        setUserRole(response.data?.userRole || user.role);
      } else {
        setError(response.error || "Failed to fetch request history");
      }
    } catch (err) {
      console.error("Error fetching request history:", err);
      setError(err.message || "Failed to load request history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRequestHistory();
    }
  }, [user]);

  // Helper functions
  const getUserDisplayName = (user) => {
    if (!user) return "Loading...";
    return `${user.first_name} ${user.last_name}`;
  };

  const formatRequestType = (type) => {
    if (!type) return "-";
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatStatus = (status) => {
    if (!status) return "-";
    return status
      .replace(/_/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getStatusStyling = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800 px-2 md:px-3 py-1 rounded-full text-sm md:text-base font-medium";
      case "completed":
        return "bg-green-200 text-green-900 px-2 md:px-3 py-1 rounded-full text-sm md:text-base font-medium";
      case "rejected":
        return "bg-red-100 text-red-800 px-2 md:px-3 py-1 rounded-full text-sm md:text-base font-medium";
      case "pending":
      case "assigned_to_hr":
        return "bg-gray-100 text-gray-800 px-2 md:px-3 py-1 rounded-full text-sm md:text-base font-medium";
      case "hr_processing":
        return "bg-blue-100 text-blue-800 px-2 md:px-3 py-1 rounded-full text-sm md:text-base font-medium";
      case "benefits_review":
        return "bg-yellow-100 text-yellow-800 px-2 md:px-3 py-1 rounded-full text-sm md:text-base font-medium";
      case "welfare_review":
        return "bg-orange-100 text-orange-800 px-2 md:px-3 py-1 rounded-full text-sm md:text-base font-medium";
      default:
        return "bg-gray-100 text-gray-800 px-2 md:px-3 py-1 rounded-full text-sm md:text-base font-medium";
    }
  };

  const handleRecordClick = (requestId) => {
    navigate(`/loa-record-summary/${requestId}`, {
      state: { user },
    });
  };

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    sessionStorage.clear();
    localStorage.removeItem("authToken");
    navigate("/login", { replace: true });
  };

  // Get role-specific labels
  const getRoleSpecificLabels = () => {
    if (userRole === "executive") {
      return {
        title: "My Request History",
        subtitle: "View all your submitted checkup requests",
        searchPlaceholder: "Search by hospital name...",
      };
    } else if (userRole === "hr_personnel") {
      return {
        title: "My Assigned Requests",
        subtitle: "Requests assigned to you",
        searchPlaceholder: "Search by executive name...",
      };
    } else if (userRole === "benefits_officer") {
      return {
        title: "My Reviewed Requests",
        subtitle: "Requests you reviewed as Benefits Officer",
        searchPlaceholder: "Search by executive name...",
      };
    } else if (userRole === "welfare_head") {
      return {
        title: "My Reviewed Requests",
        subtitle: "Requests you reviewed as Division Head",
        searchPlaceholder: "Search by executive name...",
      };
    }
    return {
      title: "Request History",
      subtitle: "View your request history",
      searchPlaceholder: "Search...",
    };
  };

  const labels = getRoleSpecificLabels();

  // Filter and sort requests
  const filteredRequests = requests
    .filter((req) => {
      // Search filter
      let searchMatch = true;
      if (searchTerm) {
        if (userRole === "executive") {
          // Search by hospital name for executives
          searchMatch = req.hospital_name?.toLowerCase().includes(searchTerm.toLowerCase());
        } else {
          // Search by executive name for approvers
          const fullName = `${req.employee_first_name || ""} ${req.employee_last_name || ""}`.toLowerCase();
          searchMatch = fullName.includes(searchTerm.toLowerCase());
        }
      }

      // Status filter
      const matchesStatus = statusFilter === "" || req.current_status === statusFilter;

      // Type filter
      const matchesType = typeFilter === "" || req.request_type === typeFilter;

      return searchMatch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      if (sortOrder === "A-Z") {
        if (userRole === "executive") {
          return (a.hospital_name || "").localeCompare(b.hospital_name || "");
        } else {
          const nameA = `${a.employee_first_name || ""} ${a.employee_last_name || ""}`;
          const nameB = `${b.employee_first_name || ""} ${b.employee_last_name || ""}`;
          return nameA.localeCompare(nameB);
        }
      } else if (sortOrder === "Z-A") {
        if (userRole === "executive") {
          return (b.hospital_name || "").localeCompare(a.hospital_name || "");
        } else {
          const nameA = `${a.employee_first_name || ""} ${a.employee_last_name || ""}`;
          const nameB = `${b.employee_first_name || ""} ${b.employee_last_name || ""}`;
          return nameB.localeCompare(nameA);
        }
      }
      return 0;
    });

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <NavBarMain
        user={{
          ...user,
          name: getUserDisplayName(user),
        }}
        onLogout={handleLogout}
        backButtonIcon={BackSquareIconWhite}
        logo={mainLogo}
      />

      {/* Title */}
      <div className="flex flex-col items-center mt-6 md:mt-[43px] px-4">
        <h1 className="text-[#023184] text-xl md:text-[28px] font-bold">
          {labels.title}
        </h1>
        <p className="text-gray-600 text-sm md:text-base mt-1">{labels.subtitle}</p>
      </div>

      {/* Stats Summary */}
      {!loading && (
        <div className="px-4 md:px-8 lg:px-[200px] mt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            <div
              className="relative p-[2px] rounded-lg"
              style={{
                background: "linear-gradient(to right, #3F6EC0, #00539F, #5D3EA4, #7940A8)",
              }}
            >
              <div className="bg-white rounded-lg shadow hover:shadow-md transition-all duration-200 p-3">
                <div className="text-2xl font-bold text-gray-900">{stats.total_requests || 0}</div>
                <div className="text-xs font-medium text-gray-600">Total</div>
              </div>
            </div>
            <div
              className="relative p-[2px] rounded-lg"
              style={{
                background: "linear-gradient(to right, #3F6EC0, #00539F, #5D3EA4, #7940A8)",
              }}
            >
              <div className="bg-white rounded-lg shadow hover:shadow-md transition-all duration-200 p-3">
                <div className="text-2xl font-bold text-gray-900">{stats.pending || 0}</div>
                <div className="text-xs font-medium text-gray-600">Pending</div>
              </div>
            </div>
            <div
              className="relative p-[2px] rounded-lg"
              style={{
                background: "linear-gradient(to right, #3F6EC0, #00539F, #5D3EA4, #7940A8)",
              }}
            >
              <div className="bg-white rounded-lg shadow hover:shadow-md transition-all duration-200 p-3">
                <div className="text-2xl font-bold text-gray-900">{stats.under_review || 0}</div>
                <div className="text-xs font-medium text-gray-600">Under Review</div>
              </div>
            </div>
            <div
              className="relative p-[2px] rounded-lg"
              style={{
                background: "linear-gradient(to right, #3F6EC0, #00539F, #5D3EA4, #7940A8)",
              }}
            >
              <div className="bg-white rounded-lg shadow hover:shadow-md transition-all duration-200 p-3">
                <div className="text-2xl font-bold text-gray-900">{stats.approved || 0}</div>
                <div className="text-xs font-medium text-gray-600">Approved</div>
              </div>
            </div>
            <div
              className="relative p-[2px] rounded-lg"
              style={{
                background: "linear-gradient(to right, #3F6EC0, #00539F, #5D3EA4, #7940A8)",
              }}
            >
              <div className="bg-white rounded-lg shadow hover:shadow-md transition-all duration-200 p-3">
                <div className="text-2xl font-bold text-gray-900">{stats.completed || 0}</div>
                <div className="text-xs font-medium text-gray-600">Completed</div>
              </div>
            </div>
            <div
              className="relative p-[2px] rounded-lg"
              style={{
                background: "linear-gradient(to right, #3F6EC0, #00539F, #5D3EA4, #7940A8)",
              }}
            >
              <div className="bg-white rounded-lg shadow hover:shadow-md transition-all duration-200 p-3">
                <div className="text-2xl font-bold text-gray-900">{stats.rejected || 0}</div>
                <div className="text-xs font-medium text-gray-600">Rejected</div>
              </div>
            </div>
            <div
              className="relative p-[2px] rounded-lg"
              style={{
                background: "linear-gradient(to right, #3F6EC0, #00539F, #5D3EA4, #7940A8)",
              }}
            >
              <div className="bg-white rounded-lg shadow hover:shadow-md transition-all duration-200 p-3">
                <div className="text-2xl font-bold text-gray-900">{stats.urgent || 0}</div>
                <div className="text-xs font-medium text-gray-600">Urgent</div>
              </div>
            </div>
            <div
              className="relative p-[2px] rounded-lg"
              style={{
                background: "linear-gradient(to right, #3F6EC0, #00539F, #5D3EA4, #7940A8)",
              }}
            >
              <div className="bg-white rounded-lg shadow hover:shadow-md transition-all duration-200 p-3">
                <div className="text-2xl font-bold text-gray-900">{stats.overdue || 0}</div>
                <div className="text-xs font-medium text-gray-600">Overdue</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search + Filter Buttons */}
      <div className="px-4 md:px-8 lg:px-[200px] mt-6 flex flex-col gap-4">
        {/* Search Input */}
        <div className="flex justify-center lg:justify-start">
          <div className="relative w-full max-w-md lg:max-w-none lg:w-[500px]">
            <div className="w-full bg-white rounded-full flex items-center px-4 py-2 shadow-lg border-2 border-gray-200 hover:border-[#023184] transition-all duration-200">
              <img
                src={SearchIcon}
                alt="Search"
                className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0"
              />
              <input
                type="text"
                placeholder={labels.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent focus:outline-none text-gray-700 placeholder-gray-400 border-none"
              />
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex gap-2 lg:gap-3 justify-center lg:justify-start">
          <button
            onClick={() => setSortOrder(sortOrder === "A-Z" ? "" : "A-Z")}
            className={`px-3 md:px-5 py-2 rounded-full text-sm md:text-base font-bold hover:opacity-80 transition-all ${
              sortOrder === "A-Z" ? "text-white" : "text-gray-700 bg-gray-200"
            }`}
            style={
              sortOrder === "A-Z"
                ? { background: "linear-gradient(to right, #3F6EC0, #00539F, #5D3EA4, #7940A8)" }
                : {}
            }
          >
            A-Z
          </button>
          <button
            onClick={() => setSortOrder(sortOrder === "Z-A" ? "" : "Z-A")}
            className={`px-3 md:px-5 py-2 rounded-full text-sm md:text-base font-bold hover:opacity-80 transition-all ${
              sortOrder === "Z-A" ? "text-white" : "text-gray-700 bg-gray-200"
            }`}
            style={
              sortOrder === "Z-A"
                ? { background: "linear-gradient(to right, #3F6EC0, #00539F, #5D3EA4, #7940A8)" }
                : {}
            }
          >
            Z-A
          </button>
          <button
            onClick={() => setStatusFilter(statusFilter === "approved" ? "" : "approved")}
            className={`px-3 md:px-5 py-2 rounded-full text-sm md:text-base font-bold hover:opacity-80 transition-all ${
              statusFilter === "approved" ? "text-white" : "text-gray-700 bg-gray-200"
            }`}
            style={
              statusFilter === "approved"
                ? { background: "linear-gradient(to right, #3F6EC0, #00539F, #5D3EA4, #7940A8)" }
                : {}
            }
          >
            Approved
          </button>
          <button
            onClick={() => setStatusFilter(statusFilter === "completed" ? "" : "completed")}
            className={`px-3 md:px-5 py-2 rounded-full text-sm md:text-base font-bold hover:opacity-80 transition-all ${
              statusFilter === "completed" ? "text-white" : "text-gray-700 bg-gray-200"
            }`}
            style={
              statusFilter === "completed"
                ? { background: "linear-gradient(to right, #3F6EC0, #00539F, #5D3EA4, #7940A8)" }
                : {}
            }
          >
            Completed
          </button>
          <button
            onClick={() => setStatusFilter(statusFilter === "rejected" ? "" : "rejected")}
            className={`px-3 md:px-5 py-2 rounded-full text-sm md:text-base font-bold hover:opacity-80 transition-all ${
              statusFilter === "rejected" ? "text-white" : "text-gray-700 bg-gray-200"
            }`}
            style={
              statusFilter === "rejected"
                ? { background: "linear-gradient(to right, #3F6EC0, #00539F, #5D3EA4, #7940A8)" }
                : {}
            }
          >
            Rejected
          </button>
          <button
            onClick={() =>
              setTypeFilter(typeFilter === "letter_of_approval" ? "" : "letter_of_approval")
            }
            className={`px-3 md:px-5 py-2 rounded-full text-sm md:text-base font-bold hover:opacity-80 transition-all ${
              typeFilter === "letter_of_approval" ? "text-white" : "text-gray-700 bg-gray-200"
            } col-span-2 sm:col-span-1`}
            style={
              typeFilter === "letter_of_approval"
                ? { background: "linear-gradient(to right, #3F6EC0, #00539F, #5D3EA4, #7940A8)" }
                : {}
            }
          >
            Approval
          </button>
          <button
            onClick={() =>
              setTypeFilter(
                typeFilter === "letter_of_authorization" ? "" : "letter_of_authorization"
              )
            }
            className={`px-3 md:px-5 py-2 rounded-full text-sm md:text-base font-bold hover:opacity-80 transition-all ${
              typeFilter === "letter_of_authorization" ? "text-white" : "text-gray-700 bg-gray-200"
            } col-span-2 sm:col-span-1`}
            style={
              typeFilter === "letter_of_authorization"
                ? { background: "linear-gradient(to right, #3F6EC0, #00539F, #5D3EA4, #7940A8)" }
                : {}
            }
          >
            Authorization
          </button>
        </div>
      </div>

      {/* Requests List */}
      <div className="mt-6 px-4 md:px-8 lg:px-[200px] pb-8">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#023184]"></div>
            <span className="ml-3 text-gray-600 font-medium">Loading request history...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-2 border-red-400 text-red-700 px-6 py-4 rounded-xl shadow-md">
            <span className="font-semibold">Error:</span> {error}
            <button
              onClick={fetchRequestHistory}
              className="ml-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-br from-gray-100 to-blue-50 rounded-xl shadow-inner">
            <p className="text-gray-600 font-medium text-lg">No requests found</p>
            <p className="text-gray-500 text-sm mt-2">
              {searchTerm || statusFilter || typeFilter
                ? "Try adjusting your filters"
                : "You have no request history yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div
                key={request.id}
                onClick={() => handleRecordClick(request.id)}
                className="bg-white border-2 border-gray-200 hover:border-purple-400 rounded-xl p-5 hover:shadow-xl transition-all cursor-pointer transform hover:scale-[1.01]"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-lg font-bold text-purple-600">
                        {request.request_number}
                      </div>
                      <span
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg shadow-sm ${getStatusStyling(
                          request.current_status
                        )}`}
                      >
                        {formatStatus(request.current_status)}
                      </span>
                      {request.priority_level === "urgent" && (
                        <span className="px-3 py-1.5 text-xs font-semibold rounded-lg shadow-sm bg-gradient-to-r from-red-500 to-red-600 text-white">
                          URGENT
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-700 font-medium">
                      {formatRequestType(request.request_type)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {/* Role-specific information */}
                  {userRole === "executive" ? (
                    <>
                      <div>
                        <div className="text-xs text-gray-500">Hospital</div>
                        <div className="font-medium text-gray-900 truncate">
                          {request.hospital_name || "-"}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Assigned HR</div>
                        <div className="font-medium text-gray-900">
                          {request.hr_first_name && request.hr_last_name ? (
                            `${request.hr_first_name} ${request.hr_last_name}`
                          ) : (
                            <span className="text-gray-400 italic">Unassigned</span>
                          )}
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
                            : "-"}
                        </div>
                        {request.employee_id && (
                          <div className="text-xs text-gray-500">({request.employee_id})</div>
                        )}
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Hospital</div>
                        <div className="font-medium text-gray-900 truncate">
                          {request.hospital_name || "-"}
                        </div>
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
                {(userRole === "benefits_officer" || userRole === "welfare_head") &&
                  request.my_action && (
                    <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                      <div className="text-xs text-blue-700 font-semibold mb-1">My Action:</div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-medium ${
                            request.my_action === "approved" ? "text-green-700" : "text-red-700"
                          }`}
                        >
                          {request.my_action === "approved" ? "Approved" : "Rejected"}
                        </span>
                        {request.my_action_date && (
                          <span className="text-xs text-gray-600">
                            on {formatDate(request.my_action_date)}
                          </span>
                        )}
                      </div>
                      {request.my_comments && (
                        <div className="text-sm text-gray-700 mt-1 italic">
                          "{request.my_comments}"
                        </div>
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
    </div>
  );
}
