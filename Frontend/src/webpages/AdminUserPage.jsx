import React, { useState, useEffect } from "react";
import SearchBar from "@/AdminUserPageComponents/SearchBar";
import UserTable from "@/AdminUserPageComponents/UserTable";
import UserDetailsModal from "@/AdminUserPageComponents/UserDetailsModal";
import NewUserFormModal from "@/AdminUserPageComponents/NewUserFormModal";
import DeletedUsersModal from "@/AdminUserPageComponents/DeletedUsersModal";
import DepartmentManagementModal from "@/AdminUserPageComponents/DepartmentManagementModal";
import BranchManagementModal from "@/AdminUserPageComponents/BranchManagementModal";
import RequestStatsCards from "@/AdminUserPageComponents/RequestStatsCards";
import RequestManagementTable from "@/AdminUserPageComponents/RequestManagementTable";
import RequestDetailsModal from "@/AdminUserPageComponents/RequestDetailsModal";
import AddFAQModal from "@/Components/AddFAQModal";
import FAQManagementModal from "@/Components/FAQManagementModal";
import NavBarMain from "@/Components/NavBarMain";
import BackSquareIconWhite from "@/assets/BackSquareIconWhite.svg";
import MetroBankLogo from "@/assets/mainLogo-foreground.svg";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import apiService from "@/services/api";

export default function AdminUsersPage() {
  const { user: currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Use function initializer to ensure Date.now() only runs ONCE on mount, not on every render
  const [cacheTimestamp, setCacheTimestamp] = useState(() => Date.now());

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [filter, setFilter] = useState("all");
  const [showDeletedUsersModal, setShowDeletedUsersModal] = useState(false);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const [showAddFAQModal, setShowAddFAQModal] = useState(false);
  const [showFAQManagementModal, setShowFAQManagementModal] = useState(false);

  // Request Management View State
  const [viewMode, setViewMode] = useState("users"); // "users" or "requests"
  const [requests, setRequests] = useState([]);
  const [requestStats, setRequestStats] = useState({});
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestSearchQuery, setRequestSearchQuery] = useState("");
  const [requestStatusFilter, setRequestStatusFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [activeStatFilter, setActiveStatFilter] = useState("all");
  const [requestDetailsLoading, setRequestDetailsLoading] = useState(false);

  // Fetch users from API on component mount
  useEffect(() => {
    if (viewMode === "users") {
      fetchUsers();
    } else {
      fetchRequests();
      fetchRequestStats();
    }
  }, [viewMode]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      // Request all users by setting a large limit
      const response = await apiService.getUsers({ limit: 1000 });

      if (response.success) {
        // API returns { success: true, data: { users: [...], pagination: {...} } }
        const userData = response.data?.users || [];

        // Transform user data to include full profile picture URL with stable cache-busting timestamp
        const transformedUsers = (Array.isArray(userData) ? userData : []).map(user => ({
          ...user,
          profile_picture_url: user.profile_picture
            ? `${apiService.baseURL.replace('/api', '')}${user.profile_picture}?v=${cacheTimestamp}`
            : null
        }));

        setUsers(transformedUsers);
      } else {
        setError(response.message || "Failed to fetch users");
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);

      // Provide user-friendly error messages
      if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
        setError("Cannot connect to server. Please check your connection.");
      } else if (error.message.includes('NetworkError') || error.message.includes('Network')) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError(error.message || "Failed to load users. Please try again.");
      }

      setUsers([]); // Ensure users is always an array
    } finally {
      setLoading(false);
    }
  };

  // Add New User
  const handleAddUser = () => {
    setEditUser(null);
    setShowFormModal(true);
  };

  // Save New or Edited User from NewUserFormModal
  const handleSaveUser = async (userData) => {
    try {
      if (editUser) {
        // Update existing user
        const response = await apiService.updateUser(editUser.id, userData);
        if (response.success) {
          await fetchUsers(); // Refresh the users list
          setSelectedUser(response.data); // Update selected user if modal is open
        } else {
          throw new Error(response.message || "Failed to update user");
        }
      } else {
        // Create new user via registration
        const response = await apiService.register(userData);
        if (response.success) {
          await fetchUsers(); // Refresh the users list
        } else {
          throw new Error(response.message || "Failed to create user");
        }
      }
    } catch (error) {
      console.error("Error saving user:", error);

      // Re-throw the error so the modal can display it
      throw error;
    }
  };

  // Delete User
  const handleDeleteUser = async (userId, deletionReason) => {
    try {
      const response = await apiService.deleteUser(userId, deletionReason);
      if (response.success) {
        await fetchUsers(); // Refresh the users list
        // Don't close modal here - let UserDetailsModal handle its own closing after showing success alert
        // setSelectedUser(null); // Removed - this was causing the issue
      } else {
        setError(response.message || "Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);

      // Provide user-friendly error messages
      if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
        setError("Cannot connect to server. Please check your connection.");
      } else {
        setError(error.message || "Failed to delete user. Please try again.");
      }
    }
  };

  // Update User from UserDetailsModal
  const handleUpdateUser = async (updatedUser) => {
    try {
      const response = await apiService.updateUser(updatedUser.id, updatedUser);

      if (response.success) {
        await fetchUsers(); // Refresh the users list
        // Update the selectedUser with the latest data to ensure modal reflects changes
        setSelectedUser(response.data || updatedUser); // Keep modal open with updated data
        return response; // Return the response so UserDetailsModal can use it
      } else {
        setError(response.message || "Failed to update user");
        throw new Error(response.message || "Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);

      // Provide user-friendly error messages
      let errorMessage;
      if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
        errorMessage = "Cannot connect to server. Please check your connection.";
      } else {
        errorMessage = error.message || "Failed to update user. Please try again.";
      }

      setError(errorMessage);
      throw new Error(errorMessage); // Re-throw so UserDetailsModal can handle it
    }
  };

  // Fetch all requests for Request Management view
  const fetchRequests = async () => {
    try {
      setRequestsLoading(true);
      setError("");

      const response = await apiService.getRequests({ limit: 100 });

      if (response.success) {
        setRequests(response.data?.requests || []);
      } else {
        setError(response.message || "Failed to fetch requests");
        setRequests([]);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
      setError(error.message || "Failed to load requests");
      setRequests([]);
    } finally {
      setRequestsLoading(false);
    }
  };

  // Fetch dashboard stats for Request Management view
  const fetchRequestStats = async () => {
    try {
      const response = await apiService.getDashboardStats();

      if (response.success) {
        setRequestStats(response.data?.stats || {});
      }
    } catch (error) {
      console.error("Error fetching request stats:", error);
    }
  };

  // Fetch full request details including BO and WH assignments
  const handleViewRequestDetails = async (request) => {
    try {
      setRequestDetailsLoading(true);
      const response = await apiService.getRequestById(request.id);

      if (response.success) {
        // Backend returns { success: true, data: { request: {...} } }
        setSelectedRequest(response.data.request || response.data);
      } else {
        setError(response.message || "Failed to fetch request details");
      }
    } catch (error) {
      console.error("Error fetching request details:", error);
      setError(error.message || "Failed to load request details");
    } finally {
      setRequestDetailsLoading(false);
    }
  };

  // Toggle between User Management and Request Management views
  const toggleView = () => {
    setViewMode(viewMode === "users" ? "requests" : "users");
    setError(""); // Clear any existing errors
  };

  // Filtered Users - ensure users is an array and only show active users
  const filteredUsers = (Array.isArray(users) ? users : []).filter((u) => {
    // Only show active users (is_active = 1)
    const isActive = u.is_active === 1;

    const fullName = `${u.first_name || ""} ${u.last_name || ""}`.trim();
    const matchesSearch =
      fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.employee_id && u.employee_id.toString().toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFilter =
      filter === "all" ? true : u.role === filter;

    return isActive && matchesSearch && matchesFilter;
  });

  // Handle stats card filter click
  const handleStatFilterClick = (filterKey) => {
    setActiveStatFilter(filterKey);

    // Map filterKey to appropriate status or special filter
    switch (filterKey) {
      case "all":
        setRequestStatusFilter("all");
        break;
      case "in_progress":
      case "overdue":
      case "unassigned":
        // These are special filters, keep status filter as "all"
        setRequestStatusFilter("all");
        break;
      default:
        // Direct status filters
        setRequestStatusFilter(filterKey);
        break;
    }
  };

  // Filtered Requests
  const filteredRequests = (Array.isArray(requests) ? requests : []).filter((r) => {
    const matchesSearch =
      r.request_number?.toLowerCase().includes(requestSearchQuery.toLowerCase()) ||
      r.employee_first_name?.toLowerCase().includes(requestSearchQuery.toLowerCase()) ||
      r.employee_last_name?.toLowerCase().includes(requestSearchQuery.toLowerCase()) ||
      r.employee_id?.toLowerCase().includes(requestSearchQuery.toLowerCase());

    // Handle special stat filters
    if (activeStatFilter === "in_progress") {
      const inProgressStatuses = ["hr_processing", "assigned_to_hr", "benefits_review", "welfare_review", "hr_final_verification"];
      return matchesSearch && inProgressStatuses.includes(r.current_status);
    }

    if (activeStatFilter === "overdue") {
      const isOverdue = (dueDate, status) => {
        if (['approved', 'completed', 'rejected'].includes(status)) return false;
        const due = new Date(dueDate);
        const today = new Date();
        return due < today;
      };
      return matchesSearch && isOverdue(r.due_date, r.current_status);
    }

    if (activeStatFilter === "unassigned") {
      return matchesSearch && !r.hr_first_name && !r.hr_last_name;
    }

    // Handle status-based filters
    let matchesStatusFilter = true;
    if (activeStatFilter === "approved") {
      // Approved filter now includes both approved and completed
      matchesStatusFilter = r.current_status === "approved" || r.current_status === "completed";
    } else if (activeStatFilter !== "all") {
      matchesStatusFilter = r.current_status === activeStatFilter;
    }

    return matchesSearch && matchesStatusFilter;
  });

  return (
    <div className="h-screen bg-gray-100 flex flex-col overflow-hidden">
      <NavBarMain
        user={{
          ...currentUser,
          name: currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : "Loading..."
        }}
        onLogout={() => {
          sessionStorage.removeItem("user");
          sessionStorage.clear();
          localStorage.removeItem('authToken');
          navigate("/login", { replace: true });
        }}
        showHomeButton={true}
        backButtonIcon={BackSquareIconWhite}
        logo={MetroBankLogo}
      />

      <h1 className="text-center text-base font-bold mb-2 pt-6 text-blue-900 flex-shrink-0">
        {viewMode === "users" ? "MetroExecuCare Users" : "Request Management"}
      </h1>

      <div className="flex-1 flex flex-col px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 pb-4 overflow-hidden">
        {/* View Header */}
        <div className="flex flex-col mb-3 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-left text-xs">
              <span className="font-bold">Branch:</span> {currentUser?.branch || "All Branches"}
            </h1>
          </div>

          {/* Mobile Layout */}
          <div className="block sm:hidden mb-1">
            {/* Search Bar - Full Width */}
            <div className="mb-2">
              <SearchBar
                search={searchQuery}
                setSearch={setSearchQuery}
                filter={filter}
                setFilter={setFilter}
              />
            </div>

            {/* Management Buttons - Full Width */}
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2 overflow-x-auto scrollbar-hide">
              {viewMode === "users" && (
                <>
                  <button
                    onClick={() => setShowDepartmentModal(true)}
                    disabled={loading}
                    className="px-2 py-1 sm:px-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-[10px] sm:text-xs whitespace-nowrap
                      rounded-full hover:from-blue-700 hover:to-blue-800 transition-all cursor-pointer shadow-sm hover:shadow-md
                      disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    Department
                  </button>
                  <button
                    onClick={() => setShowBranchModal(true)}
                    disabled={loading}
                    className="px-2 py-1 sm:px-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-[10px] sm:text-xs whitespace-nowrap
                      rounded-full hover:from-blue-700 hover:to-blue-800 transition-all cursor-pointer shadow-sm hover:shadow-md
                      disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    Branch
                  </button>
                  <button
                    onClick={toggleView}
                    disabled={loading}
                    className="px-2 py-1 sm:px-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-[10px] sm:text-xs whitespace-nowrap
                      rounded-full hover:from-purple-700 hover:to-purple-800 transition-all cursor-pointer shadow-sm hover:shadow-md
                      disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    Requests
                  </button>
                  <button
                    onClick={() => setShowDeletedUsersModal(true)}
                    disabled={loading}
                    className="px-2 py-1 sm:px-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white text-[10px] sm:text-xs whitespace-nowrap
                      rounded-full hover:from-gray-700 hover:to-gray-800 transition-all cursor-pointer shadow-sm hover:shadow-md
                      disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    Deleted
                  </button>
                </>
              )}
              {viewMode === "requests" && (
                <button
                  onClick={toggleView}
                  disabled={loading}
                  className="px-2 py-1 sm:px-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-[10px] sm:text-xs whitespace-nowrap
                    rounded-full hover:from-blue-700 hover:to-blue-800 transition-all cursor-pointer shadow-sm hover:shadow-md
                    disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  ← Back
                </button>
              )}
            </div>

            {/* Add Button */}
            <div className="flex items-center justify-end gap-2">
              {viewMode === "users" && (
                <div className="flex items-center gap-1 relative">
                  <span className="text-xs font-medium text-gray-700">Add</span>
                  <button
                    onClick={() => setShowAddDropdown(!showAddDropdown)}
                    disabled={loading}
                    className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-700 text-white
                      rounded-full hover:bg-blue-800 transition cursor-pointer
                      flex items-center justify-center
                      disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-base sm:text-lg font-bold">+</span>
                  </button>
                  {showAddDropdown && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[120px]">
                      <button
                        onClick={() => {
                          handleAddUser();
                          setShowAddDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-blue-50 text-xs sm:text-sm cursor-pointer transition-colors rounded-t-lg"
                      >
                        Add User
                      </button>
                      <button
                        onClick={() => {
                          setShowAddFAQModal(true);
                          setShowAddDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-blue-50 text-xs sm:text-sm cursor-pointer transition-colors rounded-b-lg border-t border-gray-100"
                      >
                        Add FAQ
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden sm:flex items-center justify-between gap-2 mb-1 flex-wrap">
            {viewMode === "users" && (
              <SearchBar
                search={searchQuery}
                setSearch={setSearchQuery}
                filter={filter}
                setFilter={setFilter}
              />
            )}

            <div className="flex items-center gap-2 md:gap-3 flex-wrap">
              {viewMode === "users" && (
                <>
                  <button
                    onClick={() => setShowDepartmentModal(true)}
                    disabled={loading}
                    className="px-2.5 py-1 sm:px-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-[11px] sm:text-xs whitespace-nowrap
                      rounded-full hover:from-blue-700 hover:to-blue-800 transition-all cursor-pointer shadow-sm hover:shadow-md
                      disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Department
                  </button>
                  <button
                    onClick={() => setShowBranchModal(true)}
                    disabled={loading}
                    className="px-2.5 py-1 sm:px-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-[11px] sm:text-xs whitespace-nowrap
                      rounded-full hover:from-blue-700 hover:to-blue-800 transition-all cursor-pointer shadow-sm hover:shadow-md
                      disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Branch
                  </button>
                  <button
                    onClick={() => setShowFAQManagementModal(true)}
                    disabled={loading}
                    className="px-2.5 py-1 sm:px-3 bg-gradient-to-r from-green-600 to-green-700 text-white text-[11px] sm:text-xs whitespace-nowrap
                      rounded-full hover:from-green-700 hover:to-green-800 transition-all cursor-pointer shadow-sm hover:shadow-md
                      disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    FAQ
                  </button>
                  <button
                    onClick={toggleView}
                    disabled={loading}
                    className="px-2.5 py-1 sm:px-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-[11px] sm:text-xs whitespace-nowrap
                      rounded-full hover:from-purple-700 hover:to-purple-800 transition-all cursor-pointer shadow-sm hover:shadow-md
                      disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Requests
                  </button>
                  <button
                    onClick={() => setShowDeletedUsersModal(true)}
                    disabled={loading}
                    className="px-2.5 py-1 sm:px-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white text-[11px] sm:text-xs whitespace-nowrap
                      rounded-full hover:from-gray-700 hover:to-gray-800 transition-all cursor-pointer shadow-sm hover:shadow-md
                      disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Deleted
                  </button>
                  <div className="flex items-center gap-1 relative">
                    <span className="text-xs sm:text-sm font-medium text-gray-700">Add</span>
                    <button
                      onClick={() => setShowAddDropdown(!showAddDropdown)}
                      disabled={loading}
                      className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-700 text-white
                        rounded-full hover:bg-blue-800 transition cursor-pointer
                        flex items-center justify-center
                        disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="text-base sm:text-lg font-bold">+</span>
                    </button>
                    {showAddDropdown && (
                      <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[120px]">
                        <button
                          onClick={() => {
                            handleAddUser();
                            setShowAddDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm cursor-pointer transition-colors rounded-t-lg"
                        >
                          Add User
                        </button>
                        <button
                          onClick={() => {
                            setShowAddFAQModal(true);
                            setShowAddDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm cursor-pointer transition-colors rounded-b-lg border-t border-gray-100"
                        >
                          Add FAQ
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
              {viewMode === "requests" && (
                <button
                  onClick={toggleView}
                  disabled={loading}
                  className="px-2.5 py-1 sm:px-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-[11px] sm:text-xs whitespace-nowrap
                    rounded-full hover:from-blue-700 hover:to-blue-800 transition-all cursor-pointer shadow-sm hover:shadow-md
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Back to Users
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex-shrink-0">
            {error}
            <button
              onClick={() => setError("")}
              className="ml-2 text-red-900 hover:text-red-700 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Conditional View: User Management or Request Management */}
        {viewMode === "users" ? (
          <>
            {/* USER MANAGEMENT TABLE */}
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
                  <span className="ml-2 text-gray-600">Loading users...</span>
                </div>
              ) : (
                <UserTable users={filteredUsers} onView={setSelectedUser} />
              )}
            </div>
          </>
        ) : (
          <>
            {/* REQUEST MANAGEMENT VIEW */}
            {/* Search Bar with Gradient Border */}
            <div className="mb-3 flex-shrink-0">
              <div className="relative w-full h-[38px]">
                <div
                  className="absolute inset-0 rounded-full p-[2px]"
                  style={{
                    background: "linear-gradient(to right, #3F6EC0, #00539F, #5D3EA4, #7940A8)",
                  }}
                >
                  <div className="w-full h-full bg-white rounded-full flex items-center px-4">
                    <input
                      type="text"
                      placeholder="Search by request #, employee name, or ID..."
                      value={requestSearchQuery}
                      onChange={(e) => setRequestSearchQuery(e.target.value)}
                      className="w-full h-full border-0 bg-transparent focus:outline-none text-gray-700 placeholder-gray-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="flex-shrink-0 mb-3">
              <RequestStatsCards
                stats={requestStats}
                loading={requestsLoading}
                onFilterClick={handleStatFilterClick}
                activeFilter={activeStatFilter}
              />
            </div>

            {/* Requests Table */}
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              <RequestManagementTable
                requests={filteredRequests}
                onViewDetails={handleViewRequestDetails}
                loading={requestsLoading}
                activeFilter={activeStatFilter}
              />
            </div>
          </>
        )}

        {/* User Details Modal */}
        {selectedUser && (
          <UserDetailsModal
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
            onDelete={handleDeleteUser}
            onUpdate={handleUpdateUser} // ✅ update table after save
          />
        )}

        {/* New User Modal */}
        {showFormModal && (
          <NewUserFormModal
            user={editUser}
            onClose={() => setShowFormModal(false)}
            onSave={handleSaveUser}
          />
        )}

        {/* Deleted Users Modal */}
        <DeletedUsersModal
          isOpen={showDeletedUsersModal}
          onClose={() => setShowDeletedUsersModal(false)}
          onRestore={() => {
            // Refresh the main users list when a user is restored
            fetchUsers();
          }}
        />

        {/* Department Management Modal */}
        {showDepartmentModal && (
          <DepartmentManagementModal
            onClose={() => setShowDepartmentModal(false)}
            onDepartmentChange={() => {
              // Refresh users list if needed after department changes
              fetchUsers();
            }}
          />
        )}

        {/* Branch Management Modal */}
        {showBranchModal && (
          <BranchManagementModal
            onClose={() => setShowBranchModal(false)}
            onBranchChange={() => {
              // Refresh users list if needed after branch changes
              fetchUsers();
            }}
          />
        )}

        {/* Request Details Modal */}
        {selectedRequest && (
          <RequestDetailsModal
            request={selectedRequest}
            onClose={() => setSelectedRequest(null)}
          />
        )}

        {/* Add FAQ Modal */}
        {showAddFAQModal && (
          <AddFAQModal
            onClose={() => setShowAddFAQModal(false)}
            onSave={(newFAQ) => {
              console.log('New FAQ added:', newFAQ);
              // Optionally show a success message or refresh FAQ list
            }}
          />
        )}

        {/* FAQ Management Modal */}
        {showFAQManagementModal && (
          <FAQManagementModal
            onClose={() => setShowFAQManagementModal(false)}
            onFAQChange={() => {
              console.log('FAQs updated');
            }}
          />
        )}
      </div>
    </div>
  );
}