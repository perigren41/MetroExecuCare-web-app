const { pool } = require('../config/database/connection');
const bcrypt = require('bcryptjs');
const { logActivity, getRequestInfo, ACTIVITY_TYPES } = require('../utils/activityLogger');
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
        deleted_at, deleted_by, deletion_reason, restored_at, restored_by,
        created_at, updated_at
      FROM users
      WHERE is_active = 1 AND deleted_at IS NULL
    `;
    let countQuery = 'SELECT COUNT(*) as total FROM users WHERE is_active = 1 AND deleted_at IS NULL';
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
        department, position, branch, contact_number, birth_date, is_active,
        created_at, updated_at 
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
      // Convert ISO date string to MySQL date format (YYYY-MM-DD)
      const mysqlDate = birth_date ? new Date(birth_date).toISOString().split('T')[0] : null;
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

    await logActivity({
      userId: req.user.id, // The user performing the action
      action: ACTIVITY_TYPES.UPDATE_USER,
      description: logDescription,
      oldValues: {
        first_name: oldUserData.first_name,
        last_name: oldUserData.last_name,
        email: oldUserData.email,
        role: oldUserData.role,
        department: oldUserData.department,
        ...(hashedPassword && { password: '[PASSWORD CHANGED]' })
      },
      newValues: {
        first_name: newUserData.first_name,
        last_name: newUserData.last_name,
        email: newUserData.email,
        role: newUserData.role,
        department: newUserData.department,
        ...(hashedPassword && { password: '[PASSWORD UPDATED]' })
      },
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

    // Check if user exists and is not already deleted, get user data for logging
    const [users] = await pool.execute(
      'SELECT id, employee_id, email, first_name, last_name, role FROM users WHERE id = ? AND deleted_at IS NULL',
      [id]
    );
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found or already deleted'
      });
    }

    const userToDelete = users[0];

    // Prevent admin from deleting themselves
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'You cannot delete your own account'
      });
    }

    // Enhanced soft delete with audit trail - keep original email
    await pool.execute(
      `UPDATE users SET
        is_active = 0,
        deleted_at = CURRENT_TIMESTAMP,
        deleted_by = ?,
        deletion_reason = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [req.user.id, deletion_reason || 'No reason provided', id]
    );

    // Log user deletion activity
    await logActivity({
      userId: req.user.id, // The admin performing the action
      action: ACTIVITY_TYPES.DELETE_USER,
      description: `Deleted user ${userToDelete.employee_id} (${userToDelete.first_name} ${userToDelete.last_name}). Reason: ${deletion_reason || 'No reason provided'}`,
      oldValues: {
        employee_id: userToDelete.employee_id,
        email: userToDelete.email,
        first_name: userToDelete.first_name,
        last_name: userToDelete.last_name,
        role: userToDelete.role,
        is_active: true
      },
      newValues: {
        is_active: false,
        deleted_at: new Date().toISOString(),
        deletion_reason: deletion_reason || 'No reason provided'
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

    // Build query for inactive users (is_active = 0)
    let query = `
      SELECT
        u.id, u.employee_id, u.email, u.first_name, u.last_name, u.middle_name, u.role,
        u.department, u.position, u.branch, u.contact_number, u.birth_date,
        u.deleted_at, u.deletion_reason, u.restored_at, u.restored_reason,
        deleter.first_name as deleted_by_first_name, deleter.last_name as deleted_by_last_name,
        restorer.first_name as restored_by_first_name, restorer.last_name as restored_by_last_name
      FROM users u
      LEFT JOIN users deleter ON u.deleted_by = deleter.id
      LEFT JOIN users restorer ON u.restored_by = restorer.id
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

    // Restore user - set is_active = 1, clear deleted_at, and record restoration details
    await pool.execute(
      `UPDATE users SET
        is_active = 1,
        deleted_at = NULL,
        restored_at = CURRENT_TIMESTAMP,
        restored_by = ?,
        restored_reason = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [req.user.id, restored_reason || 'No reason provided', id]
    );

    // Get restored user data
    const [restoredUsers] = await pool.execute(
      `SELECT
        id, employee_id, email, first_name, last_name, middle_name, role,
        department, position, branch, contact_number, birth_date, is_active,
        deleted_at, restored_at, restored_reason, created_at, updated_at
      FROM users
      WHERE id = ?`,
      [id]
    );

    // Log user restoration activity
    await logActivity({
      userId: req.user.id, // The admin performing the action
      action: ACTIVITY_TYPES.RESTORE_USER,
      description: `Restored user ${userToRestore.employee_id} (${userToRestore.first_name} ${userToRestore.last_name}). Reason: ${restored_reason || 'No reason provided'}`,
      oldValues: {
        employee_id: userToRestore.employee_id,
        email: userToRestore.email,
        first_name: userToRestore.first_name,
        last_name: userToRestore.last_name,
        role: userToRestore.role,
        is_active: false
      },
      newValues: {
        is_active: true,
        restored_at: new Date().toISOString(),
        restored_reason: restored_reason || 'No reason provided'
      },
      ...getRequestInfo(req)
    });

    res.json({
      success: true,
      message: 'User restored successfully',
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

    // Check if user exists and user has permission to view the logs
    // For now, allow users to view their own logs or admins to view any logs
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You can only view your own activity logs.'
      });
    }

    // Get user checkup requests that are approved for activity display
    const [logs] = await pool.execute(
      `SELECT
        cr.id,
        cr.request_type,
        cr.current_status,
        cr.created_at,
        cr.completed_at,
        h.name as hospital_name
      FROM checkup_requests cr
      LEFT JOIN hospitals h ON cr.hospital_id = h.id
      WHERE cr.employee_id = ? AND cr.current_status IN ('approved', 'rejected')
      ORDER BY cr.created_at DESC
      LIMIT ?`,
      [userId, limit]
    );

    // Format the request logs for user-friendly display
    const formattedLogs = logs.map(log => {
      // Convert request_type to user-friendly format
      let requestType = '';
      if (log.request_type === 'letter_of_approval') {
        requestType = 'Letter of Approval';
      } else if (log.request_type === 'letter_of_authorization') {
        requestType = 'Letter of Authorization';
      } else {
        requestType = log.request_type || 'Unknown Request';
      }

      // Format status to capitalize first letter
      const status = log.current_status.charAt(0).toUpperCase() + log.current_status.slice(1);

      return {
        id: log.id,
        request_type: requestType,
        hospital_name: log.hospital_name || 'Unknown Hospital',
        current_status: status,
        created_at: log.created_at,
        completed_at: log.completed_at || log.created_at
      };
    });

    res.json({
      success: true,
      data: { logs: formattedLogs }
    });
  } catch (error) {
    console.error('Get user activity logs error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
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
        profile_picture_url: profilePictureUrl
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
  updateUserNotes,
  getUserNotes
};