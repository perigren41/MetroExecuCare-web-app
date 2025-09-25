import React, { useState, useEffect } from "react";

export default function DeletedUsersModal({ isOpen, onClose, onRestore }) {
  const [deletedUsers, setDeletedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [showConfirmRestore, setShowConfirmRestore] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [restorationReason, setRestorationReason] = useState("");
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState(""); // 'success' or 'error'

  // Role mapping for consistent display
  const roleLabels = {
    "admin": "Admin",
    "executive": "Executive",
    "hr_personnel": "Human Resource Personnel",
    "benefits_officer": "Benefits Officer",
    "welfare_head": "Division Head"
  };

  useEffect(() => {
    if (isOpen) {
      fetchDeletedUsers();
    }
  }, [isOpen, currentPage, searchTerm]);

  const fetchDeletedUsers = async (preserveAlert = false) => {
    setLoading(true);
    if (!preserveAlert) {
      setAlertMessage("");
    }
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5019/api/users/deleted?page=${currentPage}&search=${searchTerm}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDeletedUsers(data.data.users);
        setTotalPages(data.data.pagination.totalPages);
      } else {
        const errorData = await response.json();
        setAlertMessage(errorData.error || 'Failed to fetch deleted users');
        setAlertType('error');
        console.error('Failed to fetch deleted users');
      }
    } catch (error) {
      setAlertMessage('Network error: Unable to fetch deleted users');
      setAlertType('error');
      console.error('Error fetching deleted users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = (user) => {
    setSelectedUser(user);
    setShowConfirmRestore(true);
  };

  const confirmRestore = async () => {
    // Validate required restoration reason
    if (!restorationReason.trim()) {
      alert('Please provide a reason for restoration');
      return;
    }

    setRestoreLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5019/api/users/${selectedUser.id}/restore`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          restored_reason: restorationReason.trim()
        })
      });

      if (response.ok) {
        const data = await response.json();

        // Store user info before clearing
        const restoredUserName = `${selectedUser.first_name} ${selectedUser.last_name}`;

        // Close the confirmation modal first
        setShowConfirmRestore(false);
        setSelectedUser(null);
        setRestorationReason("");

        // Show success alert
        setAlertMessage(`✅ SUCCESS: User ${restoredUserName} has been successfully restored and can now access the system.`);
        setAlertType('success');

        // Refresh the deleted users list (preserve success alert)
        setTimeout(() => {
          fetchDeletedUsers(true);
        }, 100);

        // Call parent component's onRestore callback if provided
        if (onRestore) {
          onRestore(selectedUser);
        }

        // Clear success message after 5 seconds
        setTimeout(() => {
          setAlertMessage("");
          setAlertType("");
        }, 5000);
      } else {
        const errorData = await response.json();
        setAlertMessage(errorData.error || 'Failed to restore user');
        setAlertType('error');
        console.error('Failed to restore user');
      }
    } catch (error) {
      setAlertMessage('Network error: Unable to restore user');
      setAlertType('error');
      console.error('Error restoring user:', error);
    } finally {
      setRestoreLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg w-full max-w-sm sm:max-w-6xl mx-auto relative overflow-hidden max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center bg-[linear-gradient(to_right,#3F6EC0_2%,#00539F_30%,#5D3EA4_50%,#7940A8_75%)] text-white px-3 sm:px-6 py-2 sm:py-4 rounded-t-lg">
          <h2 className="text-sm sm:text-lg font-bold">Deleted Users</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-xl"
          >
            ✖
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-2 sm:p-4 border-b">
          <input
            type="text"
            placeholder="Search deleted users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Alert Message */}
        {alertMessage && (
          <div className={`p-2 sm:p-4 mx-2 sm:mx-6 mt-2 sm:mt-4 rounded-md animate-pulse ${alertType === 'success' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'}`}>
            <div className="flex items-center">
              {alertType === 'success' && (
                <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              {alertType === 'error' && (
                <svg className="w-5 h-5 mr-2 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              <span className="font-medium">{alertMessage}</span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-2 sm:p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading deleted users...</p>
            </div>
          ) : deletedUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No deleted users found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700">Name</th>
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 hidden sm:table-cell">Email</th>
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700">Role</th>
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 hidden md:table-cell">Deleted Date</th>
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 hidden md:table-cell">Deleted By</th>
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 hidden lg:table-cell">Reason</th>
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deletedUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 sm:py-3 px-2 sm:px-4">
                        <div className="font-medium">{`${user.first_name} ${user.middle_name || ''} ${user.last_name}`.trim()}</div>
                        <div className="text-xs text-gray-500 sm:hidden">{user.email}</div>
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-600 hidden sm:table-cell">
                        {user.email}
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4">
                        <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          {roleLabels[user.role] || user.role}
                        </span>
                        <div className="text-xs text-gray-500 md:hidden mt-1">{formatDate(user.deleted_at)}</div>
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-600 hidden md:table-cell">
                        {formatDate(user.deleted_at)}
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-600 hidden md:table-cell">
                        {user.deleted_by_first_name && user.deleted_by_last_name
                          ? `${user.deleted_by_first_name} ${user.deleted_by_last_name}`
                          : 'Unknown'}
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-600 max-w-xs truncate hidden lg:table-cell">
                        {user.deletion_reason || 'No reason provided'}
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4">
                        <button
                          onClick={() => handleRestore(user)}
                          className="px-2 sm:px-3 py-1 bg-green-600 text-white text-xs rounded-full hover:bg-green-700 transition-colors w-full sm:w-auto"
                        >
                          Restore
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-6 space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Restore Confirmation Modal */}
      {showConfirmRestore && selectedUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-60">
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg text-center w-full sm:w-96 mx-2 sm:mx-4 max-w-md">
            <h2 className="text-sm font-bold text-green-700 mb-3">
              Restore User Account?
            </h2>
            <p className="text-xs text-gray-600 mb-4">
              Are you sure you want to restore{' '}
              <strong>
                {`${selectedUser.first_name} ${selectedUser.last_name}`}
              </strong>
              's account? This will reactivate their access to the system.
            </p>
            <div className="mb-4 text-left">
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Reason for restoration <span className="text-red-500">*</span>:
              </label>
              <textarea
                value={restorationReason}
                onChange={(e) => setRestorationReason(e.target.value)}
                placeholder="Enter reason for restoring this user account..."
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                rows="3"
                required
              />
            </div>
            <div className="flex justify-center gap-3">
              <button
                onClick={confirmRestore}
                disabled={restoreLoading}
                className="px-4 py-2 rounded-full bg-green-600 text-white text-xs hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {restoreLoading ? 'Restoring...' : 'Yes, Restore Account'}
              </button>
              <button
                onClick={() => {
                  setShowConfirmRestore(false);
                  setSelectedUser(null);
                  setRestorationReason("");
                }}
                className="px-4 py-2 rounded-full bg-gray-400 text-white text-xs hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}