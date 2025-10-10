// API Service for MetroExecuCare Frontend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
console.log('🔧 API Base URL:', API_BASE_URL);
console.log('🔧 All env vars:', import.meta.env);

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('authToken');
  }

  // Helper method to get headers
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      // Always get the latest token from localStorage for each request
      const currentToken = localStorage.getItem('authToken');

      // Validate token format before using it
      if (currentToken && currentToken.split('.').length === 3) {
        headers['Authorization'] = `Bearer ${currentToken}`;
      } else if (currentToken) {
        // Token exists but is malformed, clear it
        console.warn('Malformed JWT token detected, clearing localStorage');
        localStorage.removeItem('authToken');
        this.token = null;
      }
    }

    return headers;
  }

  // Helper method to handle API responses
  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      console.error('API Error Response (Full):', JSON.stringify(errorData, null, 2));
      console.error('API Error Status:', response.status);
      console.error('API Error URL:', response.url);

      // Provide user-friendly error messages
      let userMessage = errorData.error || errorData.message;

      if (response.status === 401 && !errorData.details) {
        userMessage = 'Invalid email or password. Please try again.';
      } else if (response.status === 403) {
        userMessage = 'Access denied. Please contact your administrator.';
      } else if (response.status === 404) {
        userMessage = 'Service not found. Please check your connection.';
      } else if (response.status >= 500) {
        userMessage = 'Server error. Please try again later.';
      }

      // Create custom error with response data attached
      const error = new Error(userMessage || `HTTP error! status: ${response.status}`);
      error.response = {
        status: response.status,
        data: errorData
      };

      throw error;
    }
    return await response.json();
  }

  // Set auth token
  setAuthToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  // Clear auth token
  clearAuthToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  // Authentication APIs
  async login(credentials) {
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: this.getHeaders(false),
        body: JSON.stringify(credentials),
      });

      const data = await this.handleResponse(response);

      if (data.success && data.data.token) {
        this.setAuthToken(data.data.token);
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(userData) {
    try {
      const response = await fetch(`${this.baseURL}/auth/register`, {
        method: 'POST',
        headers: this.getHeaders(true), // Requires authentication (admin creates users)
        body: JSON.stringify(userData),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async getProfile() {
    try {
      const response = await fetch(`${this.baseURL}/auth/profile`, {
        method: 'GET',
        headers: this.getHeaders(true),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  async changePassword(currentPassword, newPassword) {
    try {
      const response = await fetch(`${this.baseURL}/auth/change-password`, {
        method: 'PUT',
        headers: this.getHeaders(true),
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword
        }),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }

  // Request Management APIs
  async createRequest(requestData) {
    try {
      const response = await fetch(`${this.baseURL}/requests`, {
        method: 'POST',
        headers: this.getHeaders(true),
        body: JSON.stringify(requestData),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Create request error:', error);
      throw error;
    }
  }

  async getDashboardStats() {
    try {
      const response = await fetch(`${this.baseURL}/requests/dashboard`, {
        method: 'GET',
        headers: this.getHeaders(true),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      throw error;
    }
  }

  // Get pending approvals by user role for accurate dashboard counts
  async getPendingApprovals(role) {
    try {
      const response = await fetch(`${this.baseURL}/requests/pending-approvals?role=${role}`, {
        method: 'GET',
        headers: this.getHeaders(true),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Get pending approvals error:', error);
      throw error;
    }
  }

  async getRequests(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `${this.baseURL}/requests?${queryString}` : `${this.baseURL}/requests`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(true),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Get requests error:', error);
      throw error;
    }
  }

  async getRequestById(requestId) {
    try {
      const response = await fetch(`${this.baseURL}/requests/${requestId}`, {
        method: 'GET',
        headers: this.getHeaders(true),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Get request by ID error:', error);
      throw error;
    }
  }

  async updateRequest(requestId, updateData) {
    try {
      const response = await fetch(`${this.baseURL}/requests/${requestId}`, {
        method: 'PUT',
        headers: this.getHeaders(true),
        body: JSON.stringify(updateData),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Update request error:', error);
      throw error;
    }
  }

  // Request Workflow APIs
  async claimRequest(requestId) {
    try {
      const response = await fetch(`${this.baseURL}/requests/${requestId}/claim`, {
        method: 'POST',
        headers: this.getHeaders(true),
        body: JSON.stringify({}),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Claim request error:', error);
      throw error;
    }
  }

  async assignRequest(requestId, assignData) {
    try {
      const response = await fetch(`${this.baseURL}/requests/${requestId}/assign`, {
        method: 'POST',
        headers: this.getHeaders(true),
        body: JSON.stringify(assignData),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Assign request error:', error);
      throw error;
    }
  }

  async processRequest(requestId, processData) {
    try {
      const response = await fetch(`${this.baseURL}/requests/${requestId}/process`, {
        method: 'POST',
        headers: this.getHeaders(true),
        body: JSON.stringify(processData),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Process request error:', error);
      throw error;
    }
  }

  async approveRequest(requestId, approvalData) {
    try {
      const response = await fetch(`${this.baseURL}/requests/${requestId}/approve`, {
        method: 'POST',
        headers: this.getHeaders(true),
        body: JSON.stringify(approvalData),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Approve request error:', error);
      throw error;
    }
  }

  async rejectRequest(requestId, rejectionData) {
    try {
      const response = await fetch(`${this.baseURL}/requests/${requestId}/reject`, {
        method: 'POST',
        headers: this.getHeaders(true),
        body: JSON.stringify(rejectionData),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Reject request error:', error);
      throw error;
    }
  }

  // User Management APIs (Admin only)
  async getUsers(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `${this.baseURL}/users?${queryString}` : `${this.baseURL}/users`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(true),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Get users error:', error);
      throw error;
    }
  }

  async getUserById(userId) {
    try {
      const response = await fetch(`${this.baseURL}/users/${userId}`, {
        method: 'GET',
        headers: this.getHeaders(true),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Get user by ID error:', error);
      throw error;
    }
  }

  async getUserActivityLogs(userId, limit = 10) {
    try {
      const response = await fetch(`${this.baseURL}/users/${userId}/activity-logs?limit=${limit}`, {
        method: 'GET',
        headers: this.getHeaders(true),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Get user activity logs error:', error);
      throw error;
    }
  }

  // Get user-specific action statistics (for workflow personnel)
  async getUserActionStats() {
    try {
      const response = await fetch(`${this.baseURL}/requests/user-stats`, {
        method: 'GET',
        headers: this.getHeaders(true),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Get user action stats error:', error);
      throw error;
    }
  }

  // Get user-specific action logs (for workflow personnel)
  async getUserActionLogs(limit = 10) {
    try {
      const response = await fetch(`${this.baseURL}/requests/user-action-logs?limit=${limit}`, {
        method: 'GET',
        headers: this.getHeaders(true),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Get user action logs error:', error);
      throw error;
    }
  }

  async getAdminActivityLogs(limit = 10) {
    try {
      const response = await fetch(`${this.baseURL}/users/admin/activity-logs?limit=${limit}`, {
        method: 'GET',
        headers: this.getHeaders(true),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Get admin activity logs error:', error);
      throw error;
    }
  }

  async updateUser(userId, userData) {
    try {
      const response = await fetch(`${this.baseURL}/users/${userId}`, {
        method: 'PUT',
        headers: this.getHeaders(true),
        body: JSON.stringify(userData),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  }

  async updateUserStatus(userId, status) {
    try {
      const response = await fetch(`${this.baseURL}/users/${userId}/status`, {
        method: 'PUT',
        headers: this.getHeaders(true),
        body: JSON.stringify({ status }),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Update user status error:', error);
      throw error;
    }
  }

  async deleteUser(userId, deletionReason = '') {
    try {
      const response = await fetch(`${this.baseURL}/users/${userId}`, {
        method: 'DELETE',
        headers: this.getHeaders(true),
        body: JSON.stringify({ deletion_reason: deletionReason }),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  }

  async getDeletedUsers(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `${this.baseURL}/users/deleted?${queryString}` : `${this.baseURL}/users/deleted`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(true),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Get deleted users error:', error);
      throw error;
    }
  }

  async restoreUser(userId, restorationReason = '') {
    try {
      const response = await fetch(`${this.baseURL}/users/${userId}/restore`, {
        method: 'PUT',
        headers: this.getHeaders(true),
        body: JSON.stringify({ restored_reason: restorationReason }),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Restore user error:', error);
      throw error;
    }
  }

  // Profile Picture APIs
  async uploadProfilePicture(userId, file) {
    try {
      const formData = new FormData();
      formData.append('profile_picture', file);

      // Create headers without Content-Type for FormData
      const headers = {};
      const currentToken = localStorage.getItem('authToken');
      if (currentToken && currentToken.split('.').length === 3) {
        headers['Authorization'] = `Bearer ${currentToken}`;
      }

      const response = await fetch(`${this.baseURL}/users/${userId}/profile-picture`, {
        method: 'POST',
        headers: headers,
        body: formData,
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Upload profile picture error:', error);
      throw error;
    }
  }

  async removeProfilePicture(userId) {
    try {
      const response = await fetch(`${this.baseURL}/users/${userId}/profile-picture`, {
        method: 'DELETE',
        headers: this.getHeaders(true),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Remove profile picture error:', error);
      throw error;
    }
  }

  // Request File Upload APIs
  async uploadRequestFile(requestId, file) {
    try {
      const formData = new FormData();
      formData.append('request_file', file);

      // Create headers without Content-Type for FormData
      const headers = {};
      const currentToken = localStorage.getItem('authToken');
      if (currentToken && currentToken.split('.').length === 3) {
        headers['Authorization'] = `Bearer ${currentToken}`;
      }

      const response = await fetch(`${this.baseURL}/requests/${requestId}/upload-file`, {
        method: 'POST',
        headers: headers,
        body: formData,
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Upload request file error:', error);
      throw error;
    }
  }

  // Notes APIs
  async getUserNotes(userId) {
    try {
      const response = await fetch(`${this.baseURL}/users/${userId}/notes`, {
        method: 'GET',
        headers: this.getHeaders(true),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Get user notes error:', error);
      throw error;
    }
  }

  async updateUserNotes(userId, notes) {
    try {
      const response = await fetch(`${this.baseURL}/users/${userId}/notes`, {
        method: 'PUT',
        headers: this.getHeaders(true),
        body: JSON.stringify({ notes }),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Update user notes error:', error);
      throw error;
    }
  }

  // Health Check
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        headers: this.getHeaders(false),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Health check error:', error);
      throw error;
    }
  }

  // Email Service APIs (Admin only)
  async testEmailService() {
    try {
      const response = await fetch(`${this.baseURL}/email/test`, {
        method: 'GET',
        headers: this.getHeaders(true),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Test email service error:', error);
      throw error;
    }
  }

  async sendTestNotification(notificationData) {
    try {
      const response = await fetch(`${this.baseURL}/email/test-notification`, {
        method: 'POST',
        headers: this.getHeaders(true),
        body: JSON.stringify(notificationData),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Send test notification error:', error);
      throw error;
    }
  }

  async getNotificationHistory(requestId) {
    try {
      const response = await fetch(`${this.baseURL}/email/history/${requestId}`, {
        method: 'GET',
        headers: this.getHeaders(true),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Get notification history error:', error);
      throw error;
    }
  }

  // Hospital APIs
  async getHospitals(params = {}) {
    try {
      const queryString = new URLSearchParams();

      if (params.accredited !== undefined) {
        queryString.append('accredited', params.accredited);
      }
      if (params.active !== undefined) {
        queryString.append('active', params.active);
      }

      const url = `${this.baseURL}/hospitals${queryString.toString() ? `?${queryString}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(true),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Get hospitals error:', error);
      throw error;
    }
  }

  async searchHospitals(query, accredited) {
    try {
      const queryString = new URLSearchParams();
      queryString.append('q', query);

      if (accredited !== undefined) {
        queryString.append('accredited', accredited);
      }

      const response = await fetch(`${this.baseURL}/hospitals/search?${queryString}`, {
        method: 'GET',
        headers: this.getHeaders(true),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Search hospitals error:', error);
      throw error;
    }
  }

  async createHospital(hospitalData) {
    try {
      const response = await fetch(`${this.baseURL}/hospitals`, {
        method: 'POST',
        headers: this.getHeaders(true),
        body: JSON.stringify(hospitalData),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Create hospital error:', error);
      throw error;
    }
  }

  async getHospitalById(hospitalId) {
    try {
      const response = await fetch(`${this.baseURL}/hospitals/${hospitalId}`, {
        method: 'GET',
        headers: this.getHeaders(true),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Get hospital by ID error:', error);
      throw error;
    }
  }

  // File download API
  async downloadRequestFile(requestId, fileId) {
    try {
      const response = await fetch(`${this.baseURL}/requests/${requestId}/files/${fileId}/download`, {
        method: 'GET',
        headers: this.getHeaders(true),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response; // Return the response for blob handling
    } catch (error) {
      console.error('Download file error:', error);
      throw error;
    }
  }

  // File delete API
  async deleteRequestFile(requestId, fileId) {
    try {
      const response = await fetch(`${this.baseURL}/requests/${requestId}/files/${fileId}`, {
        method: 'DELETE',
        headers: this.getHeaders(true),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Delete file error:', error);
      throw error;
    }
  }

  // Request Management APIs

  // Check if executive has active request
  async checkActiveRequest() {
    try {
      const response = await fetch(`${this.baseURL}/requests/check-active`, {
        method: 'GET',
        headers: this.getHeaders(true),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Check active request error:', error);
      throw error;
    }
  }

  // Edit request (Executive only, unclaimed)
  async editRequest(requestId, requestData) {
    try {
      const response = await fetch(`${this.baseURL}/requests/${requestId}/edit`, {
        method: 'PUT',
        headers: this.getHeaders(true),
        body: JSON.stringify(requestData),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Edit request error:', error);
      throw error;
    }
  }

  // Delete request (Executive only, unclaimed)
  async deleteRequest(requestId) {
    try {
      const response = await fetch(`${this.baseURL}/requests/${requestId}`, {
        method: 'DELETE',
        headers: this.getHeaders(true),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Delete request error:', error);
      throw error;
    }
  }

  // File Request APIs

  // Create file request (Approvers only)
  async createFileRequest(requestId, message) {
    try {
      const response = await fetch(`${this.baseURL}/requests/file-requests`, {
        method: 'POST',
        headers: this.getHeaders(true),
        body: JSON.stringify({ request_id: requestId, message }),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Create file request error:', error);
      throw error;
    }
  }

  // Get file requests for specific checkup request
  async getFileRequestsByRequest(requestId) {
    try {
      const response = await fetch(`${this.baseURL}/requests/file-requests/request/${requestId}`, {
        method: 'GET',
        headers: this.getHeaders(true),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Get file requests error:', error);
      throw error;
    }
  }

  // Get pending file requests for current executive
  async getMyPendingFileRequests() {
    try {
      const response = await fetch(`${this.baseURL}/requests/file-requests/my-pending`, {
        method: 'GET',
        headers: this.getHeaders(true),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Get pending file requests error:', error);
      throw error;
    }
  }

  // Respond to file request (Executive uploads files)
  async respondToFileRequest(fileRequestId, fileIds) {
    try {
      const response = await fetch(`${this.baseURL}/requests/file-requests/${fileRequestId}/respond`, {
        method: 'POST',
        headers: this.getHeaders(true),
        body: JSON.stringify({ file_ids: fileIds }),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Respond to file request error:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;

// Export individual methods for easier imports
export const {
  login,
  register,
  getProfile,
  changePassword,
  createRequest,
  getRequests,
  getRequestById,
  updateRequest,
  claimRequest,
  assignRequest,
  approveRequest,
  rejectRequest,
  getUsers,
  getUserById,
  getUserActivityLogs,
  getUserActionStats,
  getUserActionLogs,
  updateUser,
  updateUserStatus,
  deleteUser,
  uploadProfilePicture,
  removeProfilePicture,
  uploadRequestFile,
  getUserNotes,
  updateUserNotes,
  healthCheck,
  testEmailService,
  sendTestNotification,
  getNotificationHistory,
  setAuthToken,
  clearAuthToken,
  checkActiveRequest,
  editRequest,
  deleteRequest,
  createFileRequest,
  getFileRequestsByRequest,
  getMyPendingFileRequests,
  respondToFileRequest
} = apiService;