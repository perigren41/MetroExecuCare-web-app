const { pool } = require('../config/database/connection');
const bcrypt = require('bcryptjs');
const { logActivity, getRequestInfo, ACTIVITY_TYPES, formatRoleName, formatActionName } = require('../utils/activityLogger');
const path = require('path');
const fs = require('fs');

// GET /api/users - List users (admin only)
const getUsers = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        error: 'Access denied. Admin role required.' 
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const role = req.query.role || '';
    const status = req.query.status || '';

    // Build query with filters
    let query = `
      SELECT
        id, employee_id, email, first_name, last_name, middle_name, role,
        department, position, branch, contact_number, birth_date, is_active,
        profile_picture, created_at, updated_at
      FROM users
      WHERE is_active = 1
    `;
    let countQuery = 'SELECT COUNT(*) as total FROM users WHERE is_active = 1';
    let queryParams = [];
    let countParams = [];

    // Add search filter
    if (search) {
      query += ` AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)`;
      countQuery += ` AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)`;
      const searchParam = `%${search}%`;
      queryParams.push(searchParam, searchParam, searchParam);
      countParams.push(searchParam, searchParam, searchParam);
    }

    // Add role filter
    if (role) {
      query += ` AND role = ?`;
      countQuery += ` AND role = ?`;
      queryParams.push(role);
      countParams.push(role);
    }

    // Add status filter
    if (status) {
      query += ` AND is_active = ?`;
      countQuery += ` AND is_active = ?`;
      queryParams.push(status === 'active' ? 1 : 0);
      countParams.push(status === 'active' ? 1 : 0);
    }

    query += ` ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;

    // Execute queries
    const [users] = await pool.execute(query, queryParams);
    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};

// GET /api/users/:id - Get specific user
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user is admin or accessing their own profile
    if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ 
        success: false,
        error: 'Access denied. You can only access your own profile.' 
      });
    }

    const [users] = await pool.execute(
      `SELECT
        id, employee_id, email, first_name, last_name, middle_name, role,
        department, position, branch, contact_number, birth_date, profile_picture,
        is_active, created_at, updated_at
      FROM users
      WHERE id = ?`,
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    res.json({
      success: true,
      data: { user: users[0] }
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};

// PUT /api/users/:id - Update user (admin only)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      first_name,
      last_name,
      middle_name,
      email,
      role,
      department,
      position,
      branch,
      contact_number,
      birth_date,
      password
    } = req.body;

    // Check if user is admin or updating their own profile (limited fields)
    const isAdmin = req.user.role === 'admin';
    const isOwnProfile = req.user.id === parseInt(id);

    if (!isAdmin && !isOwnProfile) {
      return res.status(403).json({ 
        success: false,
        error: 'Access denied.' 
      });
    }

    // Check if user exists and get old values for logging
    const [existingUsers] = await pool.execute(
      'SELECT id, employee_id, email, first_name, last_name, middle_name, role, department, position, branch, contact_number, birth_date FROM users WHERE id = ?',
      [id]
    );
    if (existingUsers.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const oldUserData = existingUsers[0];

    // Validate required fields
    if (!first_name || !last_name || !email) {
      return res.status(400).json({ 
        success: false,
        error: 'First name, last name, and email are required' 
      });
    }

    // Check if email is already taken by another user
    if (email !== oldUserData.email) {
      const [emailCheck] = await pool.execute(
        'SELECT id FROM users WHERE email = ? AND id != ?', 
        [email, id]
      );
      if (emailCheck.length > 0) {
        return res.status(400).json({ 
          success: false,
          error: 'Email already exists' 
        });
      }
    }

    // Handle password update (admin only)
    let hashedPassword = null;
    if (isAdmin && password && password.trim()) {
      // Validate password strength
      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          error: 'Password must be at least 8 characters long'
        });
      }

      // Hash the new password
      const saltRounds = 10;
      hashedPassword = await bcrypt.hash(password, saltRounds);
    }

    // Build update query based on user permissions
    let updateFields = [];
    let updateValues = [];

    // Fields all users can update
    updateFields.push('first_name = ?', 'last_name = ?', 'email = ?');
    updateValues.push(first_name, last_name, email);

    if (middle_name !== undefined) {
      updateFields.push('middle_name = ?');
      updateValues.push(middle_name);
    }
    if (department !== undefined) {
      updateFields.push('department = ?');
      updateValues.push(department);
    }
    if (position !== undefined) {
      updateFields.push('position = ?');
      updateValues.push(position);
    }
    if (branch !== undefined) {
      updateFields.push('branch = ?');
      updateValues.push(branch);
    }
    if (contact_number !== undefined) {
      updateFields.push('contact_number = ?');
      updateValues.push(contact_number);
    }
    if (birth_date !== undefined) {
      updateFields.push('birth_date = ?');
      // Convert ISO date string to MySQL date format (YYYY-MM-DD) - timezone-safe
      let mysqlDate = null;
      if (birth_date) {
        const d = new Date(birth_date);
        mysqlDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      }
      updateValues.push(mysqlDate);
    }

    // Admin-only fields
    if (isAdmin && role !== undefined) {
      const validRoles = ['executive', 'hr_personnel', 'benefits_officer', 'welfare_head', 'admin'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid role specified'
        });
      }
      updateFields.push('role = ?');
      updateValues.push(role);
    }

    // Add password field if provided (admin only)
    if (hashedPassword) {
      updateFields.push('password_hash = ?');
      updateValues.push(hashedPassword);
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(id);

    const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
    await pool.execute(query, updateValues);

    // Get updated user data
    const [updatedUsers] = await pool.execute(
      `SELECT 
        id, employee_id, email, first_name, last_name, middle_name, role,
        department, position, branch, contact_number, birth_date, is_active,
        created_at, updated_at 
      FROM users 
      WHERE id = ?`,
      [id]
    );

    // Log user update activity
    const newUserData = updatedUsers[0];
    const logDescription = hashedPassword
      ? `Updated user ${oldUserData.employee_id} (${oldUserData.first_name} ${oldUserData.last_name}) including password change`
      : `Updated user ${oldUserData.employee_id} (${oldUserData.first_name} ${oldUserData.last_name})`;

    // Only log fields that actually changed
    const oldValues = {};
    const newValues = {};
    const fieldsToCheck = ['employee_id', 'first_name', 'last_name', 'middle_name', 'email', 'role', 'department', 'position', 'contact_number', 'birth_date', 'branch'];

    fieldsToCheck.forEach(field => {
      // Compare old and new values
      const oldVal = oldUserData[field];
      const newVal = newUserData[field];

      // Convert dates to ISO strings for comparison
      const oldValStr = oldVal instanceof Date ? oldVal.toISOString() : String(oldVal || '');
      const newValStr = newVal instanceof Date ? newVal.toISOString() : String(newVal || '');

      if (oldValStr !== newValStr) {
        oldValues[field] = oldVal;
        newValues[field] = newVal;
      }
    });

    // Add password change indicator if applicable
    if (hashedPassword) {
      oldValues.password = '[PASSWORD CHANGED]';
      newValues.password = '[PASSWORD UPDATED]';
    }

    await logActivity({
      userId: req.user.id, // The user performing the action
      action: ACTIVITY_TYPES.UPDATE_USER,
      description: logDescription,
      oldValues,
      newValues,
      ...getRequestInfo(req)
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user: updatedUsers[0] }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};

// PUT /api/users/:id/status - Activate/deactivate user
const updateUserStatus = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        error: 'Access denied. Admin role required.' 
      });
    }

    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['active', 'inactive', 'suspended'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false,
        error: 'Valid status is required (active, inactive, suspended)' 
      });
    }

    // Check if user exists
    const [users] = await pool.execute('SELECT id FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    // Prevent admin from deactivating themselves
    if (parseInt(id) === req.user.id && status !== 'active') {
      return res.status(400).json({ 
        success: false,
        error: 'You cannot deactivate your own account' 
      });
    }

    // Update user status
    await pool.execute(
      'UPDATE users SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status === 'active' ? 1 : 0, id]
    );

    res.json({
      success: true,
      message: `User ${status === 'active' ? 'activated' : status === 'inactive' ? 'deactivated' : 'suspended'} successfully`
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};

// DELETE /api/users/:id - Enhanced soft delete user
const deleteUser = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin role required.'
      });
    }

    const { id } = req.params;
    const { deletion_reason } = req.body;

    // Check if user exists and is active, get user data for logging
    // Note: deleted_at column doesn't exist in schema, using is_active flag
    const [users] = await pool.execute(
      'SELECT id, employee_id, email, first_name, last_name, role, is_active FROM users WHERE id = ?',
      [id]
    );
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const userToDelete = users[0];

    // Check if already inactive
    if (!userToDelete.is_active) {
      return res.status(400).json({
        success: false,
        error: 'User is already deactivated'
      });
    }

    // Prevent admin from deleting themselves
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'You cannot delete your own account'
      });
    }

    // Soft delete by setting is_active = 0 and recording deletion details
    await pool.execute(
      `UPDATE users SET
        is_active = 0,
        deleted_at = CURRENT_TIMESTAMP,
        deletion_reason = ?,
        deleted_by = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [deletion_reason || null, req.user.id, id]
    );

    // Log user deletion activity
    await logActivity({
      userId: req.user.id, // The admin performing the action
      action: ACTIVITY_TYPES.DELETE_USER,
      description: `Deactivated user ${userToDelete.employee_id} (${userToDelete.first_name} ${userToDelete.last_name}). Reason: ${deletion_reason || 'No reason provided'}`,
      oldValues: {
        employee_id: userToDelete.employee_id,
        email: userToDelete.email,
        first_name: userToDelete.first_name,
        last_name: userToDelete.last_name,
        role: userToDelete.role,
        is_active: true
      },
      newValues: {
        is_active: false
      },
      ...getRequestInfo(req)
    });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// GET /api/users/deleted - Get deleted users (admin only)
const getDeletedUsers = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin role required.'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    // Build query for inactive users (is_active = 0) with deletion tracking info
    let query = `
      SELECT
        u.id, u.employee_id, u.email, u.first_name, u.last_name, u.middle_name, u.role,
        u.department, u.position, u.branch, u.contact_number, u.birth_date, u.updated_at,
        u.deleted_at, u.deletion_reason, u.deleted_by,
        deleter.first_name AS deleted_by_first_name,
        deleter.last_name AS deleted_by_last_name
      FROM users u
      LEFT JOIN users deleter ON u.deleted_by = deleter.id
      WHERE u.is_active = 0
    `;
    let countQuery = 'SELECT COUNT(*) as total FROM users WHERE is_active = 0';
    let queryParams = [];
    let countParams = [];

    // Add search filter
    if (search) {
      query += ` AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)`;
      countQuery += ` AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)`;
      const searchParam = `%${search}%`;
      queryParams.push(searchParam, searchParam, searchParam);
      countParams.push(searchParam, searchParam, searchParam);
    }

    query += ` ORDER BY u.deleted_at DESC LIMIT ${limit} OFFSET ${offset}`;

    // Execute queries
    const [deletedUsers] = await pool.execute(query, queryParams);
    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        users: deletedUsers,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get deleted users error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// PUT /api/users/:id/restore - Restore deleted user (admin only)
const restoreUser = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin role required.'
      });
    }

    const { id } = req.params;
    const { restored_reason } = req.body;

    // Check if user exists and is inactive (is_active = 0), get user data for logging
    const [users] = await pool.execute(
      'SELECT id, employee_id, email, first_name, last_name, role, is_active FROM users WHERE id = ? AND is_active = 0',
      [id]
    );
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Inactive user not found'
      });
    }

    const userToRestore = users[0];

    // Check if email is already in use by another active user
    const [emailCheck] = await pool.execute(
      'SELECT id FROM users WHERE email = ? AND is_active = 1 AND id != ?',
      [userToRestore.email, id]
    );
    if (emailCheck.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot restore user: email address is already in use by another active user'
      });
    }

    // Restore user - set is_active = 1 and record restoration details
    await pool.execute(
      `UPDATE users SET
        is_active = 1,
        restored_at = CURRENT_TIMESTAMP,
        restoration_reason = ?,
        restored_by = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [restored_reason || null, req.user.id, id]
    );

    // Get restored user data
    const [restoredUsers] = await pool.execute(
      `SELECT
        id, employee_id, email, first_name, last_name, middle_name, role,
        department, position, branch, contact_number, birth_date, is_active,
        created_at, updated_at
      FROM users
      WHERE id = ?`,
      [id]
    );

    // Log user restoration activity
    await logActivity({
      userId: req.user.id, // The admin performing the action
      action: ACTIVITY_TYPES.RESTORE_USER,
      description: `Activated user ${userToRestore.employee_id} (${userToRestore.first_name} ${userToRestore.last_name}). Reason: ${restored_reason || 'No reason provided'}`,
      oldValues: {
        employee_id: userToRestore.employee_id,
        email: userToRestore.email,
        first_name: userToRestore.first_name,
        last_name: userToRestore.last_name,
        role: userToRestore.role,
        is_active: false
      },
      newValues: {
        is_active: true
      },
      ...getRequestInfo(req)
    });

    res.json({
      success: true,
      message: 'User activated successfully',
      data: { user: restoredUsers[0] }
    });
  } catch (error) {
    console.error('Restore user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Helper function to format action descriptions for user-friendly display
const formatActivityAction = (action, oldValues, newValues, description) => {
  const actionMap = {
    'UPDATE_USER': 'User Updated',
    'DELETE_USER': 'User Deleted',
    'CREATE_USER': 'User Created',
    'RESTORE_USER': 'User Restored',
    'UPLOAD_PROFILE_PICTURE': 'Profile Picture Updated',
    'UPDATE_USER_STATUS': 'User Status Updated',
    'LOGIN': 'User Login',
    'LOGOUT': 'User Logout'
  };

  const userFriendlyAction = actionMap[action] || action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());

  // If there's a specific description, use it; otherwise generate one from changes
  if (description && description !== `${action} action performed`) {
    return {
      action: userFriendlyAction,
      description: description
    };
  }

  // Generate description from old/new values if available
  let generatedDescription = '';
  if (oldValues && newValues) {
    try {
      const old = typeof oldValues === 'string' ? JSON.parse(oldValues) : oldValues;
      const newVals = typeof newValues === 'string' ? JSON.parse(newValues) : newValues;

      const changes = [];
      Object.keys(newVals).forEach(key => {
        if (old[key] !== newVals[key]) {
          const fieldName = key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
          changes.push(`${fieldName}: "${old[key]}" → "${newVals[key]}"`);
        }
      });

      if (changes.length > 0) {
        generatedDescription = `Updated: ${changes.join(', ')}`;
      }
    } catch (e) {
      // If JSON parsing fails, use the original description
      generatedDescription = description || 'No additional details';
    }
  }

  return {
    action: userFriendlyAction,
    description: generatedDescription || description || 'No additional details'
  };
};

// GET /api/users/:id/activity-logs - Get user activity logs
const getUserActivityLogs = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id); // Ensure id is an integer
    const limit = parseInt(req.query.limit) || 10;

    console.log(`📋 Fetching activity logs for user ${userId}, limit: ${limit}`);
    console.log(`User ID type: ${typeof userId}, Limit type: ${typeof limit}`);

    // Validate userId
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      });
    }

    // Check if user exists and user has permission to view the logs
    // For now, allow users to view their own logs or admins to view any logs
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You can only view your own activity logs.'
      });
    }

    // Get comprehensive activity logs from activity_logs table with file information
    const [logs] = await pool.query(
      `SELECT
        al.id,
        al.action,
        al.description,
        al.created_at,
        al.request_id,
        al.file_id,
        cr.request_number,
        cr.request_type,
        rf.original_file_name as file_name
      FROM activity_logs al
      LEFT JOIN checkup_requests cr ON al.request_id = cr.id
      LEFT JOIN request_files rf ON al.file_id = rf.id
      WHERE al.user_id = ?
      ORDER BY al.created_at DESC
      LIMIT ?`,
      [userId, limit]
    );

    console.log(`✅ Found ${logs.length} comprehensive activity logs for user ${userId}`);

    // If no logs found, return empty array
    if (!logs || logs.length === 0) {
      console.log(`ℹ️ No activity logs found for user ${userId}`);
      return res.json({
        success: true,
        data: []
      });
    }

    // Format and return the comprehensive activity logs with user-friendly descriptions
    res.json({
      success: true,
      data: logs.map(log => {
        // Create user-friendly description
        let userFriendlyDescription = log.description;

        // Replace "user ID: X" with more context if available
        userFriendlyDescription = userFriendlyDescription.replace(/user ID: \d+/gi, 'your account');
        userFriendlyDescription = userFriendlyDescription.replace(/userID: \d+/gi, 'your account');

        // Replace role abbreviations with full names
        userFriendlyDescription = userFriendlyDescription.replace(/\bhr\b/gi, 'Human Resource Personnel');
        userFriendlyDescription = userFriendlyDescription.replace(/\bhr_personnel\b/gi, 'Human Resource Personnel');
        userFriendlyDescription = userFriendlyDescription.replace(/\bbenefits_officer\b/gi, 'Benefits Officer');
        userFriendlyDescription = userFriendlyDescription.replace(/\bwelfare_head\b/gi, 'Welfare Head');
        userFriendlyDescription = userFriendlyDescription.replace(/\badmin\b/gi, 'Admin');
        userFriendlyDescription = userFriendlyDescription.replace(/\bexecutive\b/gi, 'Executive');

        // Improve common action descriptions with request numbers for workflow actions
        if (log.action === 'UPDATE_NOTES') {
          userFriendlyDescription = 'Updated personal notes';
        } else if (log.action === 'CHANGE_PASSWORD') {
          userFriendlyDescription = 'Changed account password';
        } else if (log.action === 'UPDATE_PROFILE') {
          userFriendlyDescription = 'Updated profile information';
        }
        // Handle approval actions (hr_stage_approved, benefits_stage_approved, welfare_stage_approved, hr_final_stage_approved)
        else if (log.action && log.action.includes('_approved') && log.request_number) {
          userFriendlyDescription = `Request approved by you, Request #${log.request_number}`;
        }
        // Handle rejection actions
        else if ((log.action === 'request_rejected' || log.action === 'REJECT_REQUEST') && log.request_number) {
          userFriendlyDescription = `Request rejected by you, Request #${log.request_number}`;
        }
        // Handle claim actions
        else if ((log.action === 'request_claimed' || log.action === 'CLAIM_REQUEST') && log.request_number) {
          userFriendlyDescription = `Claimed request, Request #${log.request_number}`;
        }
        // Handle file upload actions
        else if ((log.action === 'file_uploaded' || log.action === 'UPLOAD_FILE') && log.file_name && log.request_number) {
          userFriendlyDescription = `Uploaded submission document: ${log.file_name}, Request #${log.request_number}`;
        } else if ((log.action === 'file_uploaded' || log.action === 'UPLOAD_FILE') && log.request_number) {
          userFriendlyDescription = `Uploaded submission document, Request #${log.request_number}`;
        }
        // Handle assignment actions
        else if ((log.action === 'request_assigned' || log.action === 'ASSIGN_REQUEST') && log.request_number) {
          userFriendlyDescription = `Assigned request, Request #${log.request_number}`;
        }
        // Handle request creation
        else if ((log.action === 'request_created' || log.action === 'CREATE_REQUEST') && log.request_number) {
          userFriendlyDescription = `Created new request, Request #${log.request_number}`;
        }
        // Handle HR processing completion
        else if (log.action === 'hr_processing_completed' && log.request_number) {
          userFriendlyDescription = `Completed HR processing, Request #${log.request_number}`;
        }
        // Handle file deletion
        else if ((log.action === 'file_deleted' || log.action === 'DELETE_FILE') && log.file_name && log.request_number) {
          userFriendlyDescription = `Deleted file: ${log.file_name}, Request #${log.request_number}`;
        } else if ((log.action === 'file_deleted' || log.action === 'DELETE_FILE') && log.request_number) {
          userFriendlyDescription = `Deleted file, Request #${log.request_number}`;
        }

        return {
          id: log.id,
          action: log.action,
          description: userFriendlyDescription,
          created_at: log.created_at,
          request_id: log.request_id,
          request_number: log.request_number,
          request_type: log.request_type
        };
      })
    });
  } catch (error) {
    console.error('❌ Get user activity logs error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

// POST /api/users/:id/profile-picture - Upload profile picture
const uploadProfilePicture = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user can update this profile (admin or own profile)
    if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You can only update your own profile picture.'
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    // Check if user exists
    const [users] = await pool.execute(
      'SELECT id, profile_picture FROM users WHERE id = ?',
      [id]
    );
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = users[0];
    const oldProfilePicture = user.profile_picture;

    // Generate the public URL for the uploaded file
    const profilePictureUrl = `/uploads/profile-pictures/${req.file.filename}`;

    // Update user's profile picture in database
    await pool.execute(
      'UPDATE users SET profile_picture = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [profilePictureUrl, id]
    );

    // Delete old profile picture file if it exists and it's not the default
    if (oldProfilePicture && oldProfilePicture.startsWith('/uploads/')) {
      const oldFilePath = path.join(__dirname, '..', oldProfilePicture);
      try {
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      } catch (error) {
        console.error('Error deleting old profile picture:', error);
        // Don't fail the request if we can't delete the old file
      }
    }

    // Log activity
    await logActivity({
      userId: req.user.id,
      action: ACTIVITY_TYPES.UPLOAD_PROFILE_PICTURE,
      description: `Updated profile picture for user ID: ${id}`,
      oldValues: { profile_picture: oldProfilePicture },
      newValues: { profile_picture: profilePictureUrl },
      ...getRequestInfo(req)
    });

    res.json({
      success: true,
      message: 'Profile picture updated successfully',
      data: {
        profile_picture: profilePictureUrl
      }
    });
  } catch (error) {
    console.error('Upload profile picture error:', error);

    // Clean up uploaded file if database update failed
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error cleaning up uploaded file:', unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// DELETE /api/users/:id/profile-picture - Remove profile picture
const removeProfilePicture = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user can update this profile (admin or own profile)
    if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You can only update your own profile.'
      });
    }

    // Get current profile picture
    const [users] = await pool.execute(
      'SELECT profile_picture FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const oldProfilePicture = users[0].profile_picture;

    // Remove profile picture from database
    await pool.execute(
      'UPDATE users SET profile_picture = NULL WHERE id = ?',
      [id]
    );

    // Delete physical file if it exists
    if (oldProfilePicture) {
      const oldFilePath = path.join(__dirname, '..', oldProfilePicture);
      try {
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      } catch (error) {
        console.error('Error deleting profile picture file:', error);
        // Don't fail the request if we can't delete the file
      }
    }

    // Log activity
    await logActivity({
      userId: req.user.id,
      action: 'REMOVE_PROFILE_PICTURE',
      description: `Removed profile picture for user ID: ${id}`,
      oldValues: { profile_picture: oldProfilePicture },
      newValues: { profile_picture: null },
      ...getRequestInfo(req)
    });

    res.json({
      success: true,
      message: 'Profile picture removed successfully',
      data: {
        profile_picture: null
      }
    });
  } catch (error) {
    console.error('Remove profile picture error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// PUT /api/users/:id/notes - Update user notes
const updateUserNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    // Check if user can update this profile (admin or own profile)
    if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You can only update your own notes.'
      });
    }

    // Check if user exists and get old notes for logging
    const [users] = await pool.execute(
      'SELECT id, notes FROM users WHERE id = ?',
      [id]
    );
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const oldNotes = users[0].notes;

    // Update user notes
    await pool.execute(
      'UPDATE users SET notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [notes || null, id]
    );

    // Log activity if notes actually changed
    if (oldNotes !== notes) {
      await logActivity({
        userId: req.user.id,
        action: 'UPDATE_NOTES',
        description: `Updated personal notes for user ID: ${id}`,
        oldValues: { notes: oldNotes },
        newValues: { notes: notes },
        ...getRequestInfo(req)
      });
    }

    res.json({
      success: true,
      message: 'Notes updated successfully',
      data: { notes }
    });
  } catch (error) {
    console.error('Update user notes error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// GET /api/users/:id/notes - Get user notes
const getUserNotes = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user can access this profile (admin or own profile)
    if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You can only access your own notes.'
      });
    }

    // Get user notes
    const [users] = await pool.execute(
      'SELECT notes FROM users WHERE id = ?',
      [id]
    );
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { notes: users[0].notes || '' }
    });
  } catch (error) {
    console.error('Get user notes error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// GET /api/users/admin/activity-logs - Get admin's user management activity logs
const getAdminActivityLogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Only admins can access this endpoint
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin role required.'
      });
    }

    // Get activity logs for the current admin user
    // Filter for user management actions: CREATE_USER, UPDATE_USER, DELETE_USER, RESTORE_USER
    const [logs] = await pool.query(
      `SELECT
        id,
        user_id,
        action,
        description,
        old_values,
        new_values,
        created_at
      FROM activity_logs
      WHERE user_id = ?
        AND action IN ('CREATE_USER', 'UPDATE_USER', 'DELETE_USER', 'RESTORE_USER')
      ORDER BY created_at DESC
      LIMIT ?`,
      [req.user.id, limit]
    );

    // Process logs to extract employee info and format action descriptions
    const processedLogs = logs.map(log => {
      let employee_id = '-';
      let employee_name = '-';
      let action_display = log.action;
      let clean_description = log.description;

      // Extract employee info from new_values (for CREATE_USER) or old_values (for UPDATE/DELETE/RESTORE)
      if (log.new_values) {
        const newVals = typeof log.new_values === 'string' ? JSON.parse(log.new_values) : log.new_values;
        employee_id = newVals.employee_id || employee_id;
        employee_name = newVals.first_name && newVals.last_name
          ? `${newVals.first_name} ${newVals.last_name}`
          : employee_name;
      }

      if (employee_id === '-' && log.old_values) {
        const oldVals = typeof log.old_values === 'string' ? JSON.parse(log.old_values) : log.old_values;
        employee_id = oldVals.employee_id || employee_id;
        employee_name = oldVals.first_name && oldVals.last_name
          ? `${oldVals.first_name} ${oldVals.last_name}`
          : employee_name;
      }

      // If still no employee_id, try to parse from description (fallback for old logs)
      if (employee_id === '-') {
        // Format: "Updated user HRP393 (sample16 HR)"
        const match = log.description.match(/user ([A-Z]+\d+) \(([^)]+)\)/);
        if (match) {
          employee_id = match[1];
          employee_name = match[2];
        }
      }

      // Convert action to user-friendly display
      const actionMap = {
        'CREATE_USER': 'User Created',
        'UPDATE_USER': 'User Updated',
        'DELETE_USER': 'User Deleted',
        'RESTORE_USER': 'User Restored'
      };
      action_display = actionMap[log.action] || log.action;

      // Clean up description to remove redundancy and show detailed changes
      if (log.action === 'UPDATE_USER') {
        // Compare old and new values to show what changed
        const changes = [];
        const oldVals = log.old_values ? (typeof log.old_values === 'string' ? JSON.parse(log.old_values) : log.old_values) : {};
        const newVals = log.new_values ? (typeof log.new_values === 'string' ? JSON.parse(log.new_values) : log.new_values) : {};

        // Field display names
        const fieldNames = {
          first_name: 'First Name',
          last_name: 'Last Name',
          middle_name: 'Middle Name',
          email: 'Email',
          role: 'Role',
          department: 'Department',
          position: 'Position',
          contact_number: 'Contact Number',
          birth_date: 'Birth Date',
          branch: 'Branch',
          password: 'Password'
        };

        // Compare each field
        for (const [key, displayName] of Object.entries(fieldNames)) {
          if (oldVals[key] !== undefined && newVals[key] !== undefined) {
            let oldVal = oldVals[key];
            let newVal = newVals[key];

            // Normalize null/undefined values
            if (oldVal === null || oldVal === undefined) oldVal = '';
            if (newVal === null || newVal === undefined) newVal = '';

            // For dates, convert to comparable format (timezone-safe)
            if (key === 'birth_date') {
              if (oldVal) {
                const d = new Date(oldVal);
                oldVal = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
              }
              if (newVal) {
                const d = new Date(newVal);
                newVal = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
              }
            }

            // Convert to string for comparison
            oldVal = String(oldVal);
            newVal = String(newVal);

            if (oldVal !== newVal) {
              if (key === 'password') {
                changes.push('Password changed');
              } else if (key === 'role') {
                const displayOld = formatRoleName(oldVal) || '(empty)';
                const displayNew = formatRoleName(newVal) || '(empty)';
                changes.push(`${displayName}: "${displayOld}" → "${displayNew}"`);
              } else {
                const displayOld = oldVal || '(empty)';
                const displayNew = newVal || '(empty)';
                changes.push(`${displayName}: "${displayOld}" → "${displayNew}"`);
              }
            }
          }
        }

        if (changes.length > 0) {
          clean_description = changes.join(', ');
        } else {
          clean_description = 'Updated user profile (no field changes detected)';
        }
      } else if (log.action === 'DELETE_USER') {
        // Extract only the reason
        const reasonMatch = log.description.match(/Reason: (.+)$/);
        clean_description = reasonMatch ? `Reason: ${reasonMatch[1]}` : 'User deleted';
      } else if (log.action === 'RESTORE_USER') {
        // Extract only the reason
        const reasonMatch = log.description.match(/Reason: (.+)$/);
        clean_description = reasonMatch ? `Reason: ${reasonMatch[1]}` : 'User restored';
      } else if (log.action === 'CREATE_USER') {
        // Show role and department info
        const newVals = log.new_values ? (typeof log.new_values === 'string' ? JSON.parse(log.new_values) : log.new_values) : {};
        const details = [];
        if (newVals.role) details.push(`Role: ${formatRoleName(newVals.role)}`);
        if (newVals.department) details.push(`Department: ${newVals.department}`);
        if (newVals.position) details.push(`Position: ${newVals.position}`);
        clean_description = details.length > 0 ? details.join(', ') : 'New user created';
      }

      return {
        id: log.id,
        user_id: log.user_id,
        action: log.action,
        action_display,
        description: clean_description,
        employee_id,
        employee_name,
        created_at: log.created_at
      };
    });

    res.json({
      success: true,
      data: {
        logs: processedLogs || []
      }
    });
  } catch (error) {
    console.error('Get admin activity logs error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// CRITICAL: Make sure this export is at the bottom and correctly structured
module.exports = {
  getUsers,
  getUserById,
  getUserActivityLogs,
  updateUser,
  updateUserStatus,
  deleteUser,
  getDeletedUsers,
  restoreUser,
  uploadProfilePicture,
  removeProfilePicture,
  updateUserNotes,
  getUserNotes,
  getAdminActivityLogs
};