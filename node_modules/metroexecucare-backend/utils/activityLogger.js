const { pool } = require('../config/database/connection');

/**
 * Activity Logger Utility
 * Logs user activities to the activity_logs table
 */

/**
 * Log a user activity
 * @param {Object} params - Activity log parameters
 * @param {number} params.userId - ID of the user performing the action
 * @param {string} params.action - Action type (e.g., 'LOGIN', 'LOGOUT', 'CREATE_USER', 'UPDATE_USER', etc.)
 * @param {string} params.description - Human-readable description of the action
 * @param {number} [params.requestId] - ID of related request (if applicable)
 * @param {Object} [params.oldValues] - Previous values before the action (for updates)
 * @param {Object} [params.newValues] - New values after the action (for updates)
 * @param {number} [params.fileId] - ID of related file (if applicable)
 * @param {string} [params.ipAddress] - IP address of the user
 * @param {string} [params.userAgent] - User agent string
 * @param {string} [params.sessionId] - Session ID
 */
async function logActivity({
  userId,
  action,
  description,
  requestId = null,
  oldValues = null,
  newValues = null,
  fileId = null,
  ipAddress = null,
  userAgent = null,
  sessionId = null
}) {
  try {
    await pool.execute(
      `INSERT INTO activity_logs (
        user_id, action, description, request_id, old_values, new_values,
        file_id, ip_address, user_agent, session_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        userId,
        action,
        description,
        requestId,
        oldValues ? JSON.stringify(oldValues) : null,
        newValues ? JSON.stringify(newValues) : null,
        fileId,
        ipAddress,
        userAgent,
        sessionId
      ]
    );

    console.log(`✅ Activity logged: ${action} by user ${userId}`);
  } catch (error) {
    console.error('❌ Failed to log activity:', error);
    // Don't throw error to avoid breaking the main functionality
  }
}

/**
 * Helper function to extract request info for logging
 * @param {Object} req - Express request object
 * @returns {Object} - Request information for logging
 */
function getRequestInfo(req) {
  return {
    ipAddress: req.ip || req.connection.remoteAddress || req.socket.remoteAddress,
    userAgent: req.get('User-Agent'),
    sessionId: req.session?.id || req.sessionID
  };
}

/**
 * Common activity types
 */
const ACTIVITY_TYPES = {
  // Authentication
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  REGISTER: 'REGISTER',

  // User Management
  CREATE_USER: 'CREATE_USER',
  UPDATE_USER: 'UPDATE_USER',
  DELETE_USER: 'DELETE_USER',
  RESTORE_USER: 'RESTORE_USER',
  ACTIVATE_USER: 'ACTIVATE_USER',
  DEACTIVATE_USER: 'DEACTIVATE_USER',

  // Profile Management
  UPDATE_PROFILE: 'UPDATE_PROFILE',
  CHANGE_PASSWORD: 'CHANGE_PASSWORD',
  UPLOAD_PROFILE_PICTURE: 'UPLOAD_PROFILE_PICTURE',
  DELETE_PROFILE_PICTURE: 'DELETE_PROFILE_PICTURE',

  // Request Management
  CREATE_REQUEST: 'CREATE_REQUEST',
  UPDATE_REQUEST: 'UPDATE_REQUEST',
  APPROVE_REQUEST: 'APPROVE_REQUEST',
  REJECT_REQUEST: 'REJECT_REQUEST',
  CLAIM_REQUEST: 'CLAIM_REQUEST',
  ASSIGN_REQUEST: 'ASSIGN_REQUEST',

  // File Management
  UPLOAD_FILE: 'UPLOAD_FILE',
  DELETE_FILE: 'DELETE_FILE',

  // System
  VIEW_PAGE: 'VIEW_PAGE',
  EXPORT_DATA: 'EXPORT_DATA',
  IMPORT_DATA: 'IMPORT_DATA'
};

module.exports = {
  logActivity,
  getRequestInfo,
  ACTIVITY_TYPES
};