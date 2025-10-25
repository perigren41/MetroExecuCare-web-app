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
  const [activeFilter, setActiveFilter] = useState("all"); // Default to "all"

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

  // Handle stats card click
  const handleFilterClick = (filterKey) => {
    setActiveFilter(activeFilter === filterKey ? "all" : filterKey);
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

  // Stats cards configuration
  const statsCards = [
    { label: "Total", value: stats.total_requests || 0, filterKey: "all" },
    { label: "Pending", value: stats.pending || 0, filterKey: "pending" },
    { label: "Under Review", value: stats.under_review || 0, filterKey: "under_review" },
    { label: "Approved", value: stats.approved || 0, filterKey: "approved" },
    { label: "Completed", value: stats.completed || 0, filterKey: "completed" },
    { label: "Rejected", value: stats.rejected || 0, filterKey: "rejected" },
    { label: "Urgent", value: stats.urgent || 0, filterKey: "urgent" },
    { label: "Overdue", value: stats.overdue || 0, filterKey: "overdue" },
  ];

  const gradientStyle = {
    background: "linear-gradient(to right, #3F6EC0, #00539F, #5D3EA4, #7940A8)",
  };

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

      // Active filter from stats cards
      if (activeFilter === "all") return searchMatch;
      if (activeFilter === "pending") {
        return searchMatch && ["pending", "assigned_to_hr", "hr_processing"].includes(req.current_status);
      }
      if (activeFilter === "under_review") {
        return searchMatch && ["benefits_review", "welfare_review", "hr_final_verification"].includes(req.current_status);
      }
      if (activeFilter === "approved") {
        return searchMatch && req.current_status === "approved";
      }
      if (activeFilter === "completed") {
        return searchMatch && req.current_status === "completed";
      }
      if (activeFilter === "rejected") {
        return searchMatch && req.current_status === "rejected";
      }
      if (activeFilter === "urgent") {
        return searchMatch && req.priority_level === "urgent";
      }
      if (activeFilter === "overdue") {
        if (["completed", "rejected"].includes(req.current_status)) return false;
        const dueDate = new Date(req.due_date);
        const today = new Date();
        return searchMatch && dueDate < today;
      }

      return searchMatch;
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

      {/* Stats Summary - Clickable Cards */}
      {!loading && (
        <div className="px-4 md:px-8 lg:px-[200px] mt-6">
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 lg:gap-3 pb-2" style={{ minWidth: 'max-content' }}>
              {statsCards.map((card, index) => {
                const isActive = activeFilter === card.filterKey;

                if (isActive) {
                  // Active card with gradient background
                  return (
                    <button
                      key={index}
                      onClick={() => handleFilterClick(card.filterKey)}
                      className="relative overflow-hidden rounded-lg transition-all duration-200 shadow-lg p-3 lg:p-4 text-left cursor-pointer flex-shrink-0 w-32 md:w-36"
                      style={gradientStyle}
                    >
                      <div className="text-xs font-semibold bg-white/90 text-blue-700 px-1.5 py-0.5 rounded-full mb-1 inline-block">
                        Active
                      </div>
                      <div className="text-2xl md:text-3xl font-bold mb-0.5 lg:mb-1 text-white">
                        {card.value}
                      </div>
                      <div className="text-xs font-medium text-white/90">
                        {card.label}
                      </div>
                    </button>
                  );
                }

                // Inactive card with gradient border
                return (
                  <div key={index} className="relative p-[2px] rounded-lg flex-shrink-0 w-32 md:w-36" style={gradientStyle}>
                    <button
                      onClick={() => handleFilterClick(card.filterKey)}
                      className="w-full h-full bg-white rounded-lg shadow hover:shadow-md transition-all duration-200 p-3 lg:p-4 text-left cursor-pointer"
                    >
                      <div className="text-2xl md:text-3xl font-bold mb-0.5 lg:mb-1 text-gray-900">
                        {card.value}
                      </div>
                      <div className="text-xs font-medium text-gray-600">
                        {card.label}
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Search Only (Removed Filter Buttons) */}
      <div className="px-4 md:px-8 lg:px-[200px] mt-6">
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
              {searchTerm || activeFilter !== "all"
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
