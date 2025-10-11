const { pool } = require('../config/database/connection');
const { hashPassword, comparePassword } = require('../utils/passwordUtils');
const { generateTokenPair, verifyRefreshToken } = require('../utils/utils/jwtUtils');
const { logActivity, getRequestInfo, ACTIVITY_TYPES } = require('../utils/activityLogger');
const {
  validateRegistration,
  validateLogin,
  validateProfileUpdate,
  validatePasswordChange,
  validateRefreshToken,
  sanitizeObject
} = require('../validators/authValidators');

/**
 * User registration
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const register = async (req, res) => {
  try {
    console.log('\n========================================');
    console.log('=== REGISTRATION - CODE VERSION 2 WITH BIRTHDATE FIX ===');
    console.log('========================================\n');
    console.log('Request body:', req.body);

    // Sanitize input data
    const sanitizedData = sanitizeObject(req.body, [
      'employee_id', 'email', 'first_name', 'last_name', 'middle_name',
      'department', 'position', 'contact_number', 'birth_date', 'branch'
    ]);

    console.log('Sanitized data:', sanitizedData);
    console.log('birth_date value:', sanitizedData.birth_date);

    // Validate input data
    const validation = validateRegistration(sanitizedData);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    const {
      employee_id,
      email,
      password,
      first_name,
      last_name,
      middle_name,
      role,
      department,
      position,
      contact_number,
      birth_date,
      branch
    } = sanitizedData;

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE employee_id = ? OR email = ?',
      [employee_id, email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'User with this Employee ID or email already exists',
        error: 'USER_EXISTS'
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Convert birth_date to MySQL date format (YYYY-MM-DD) if provided
    const mysqlBirthDate = birth_date ? new Date(birth_date).toISOString().split('T')[0] : null;

    console.log('About to INSERT with values:', {
      employee_id,
      email,
      first_name,
      last_name,
      middle_name,
      role,
      department,
      position,
      contact_number,
      birth_date,
      mysqlBirthDate,
      branch
    });

    // Insert new user
    const [result] = await pool.execute(
      `INSERT INTO users
       (employee_id, email, password_hash, first_name, last_name, middle_name,
        role, department, position, contact_number, birth_date, branch)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [employee_id, email, hashedPassword, first_name, last_name, middle_name || null,
       role, department || null, position || null, contact_number || null,
       mysqlBirthDate, branch || null]
    );

    // Get the created user
    const [newUser] = await pool.execute(
      'SELECT id, employee_id, email, first_name, last_name, middle_name, role, department, position, contact_number, birth_date, branch, created_at FROM users WHERE id = ?',
      [result.insertId]
    );

    const user = newUser[0];

    // Generate tokens
    const tokens = generateTokenPair(user);

    // Update last_login
    await pool.execute(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );

    // Log user registration activity
    await logActivity({
      userId: user.id,
      action: ACTIVITY_TYPES.REGISTER,
      description: `User registered with employee ID: ${user.employee_id}`,
      newValues: {
        employee_id: user.employee_id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        department: user.department
      },
      ...getRequestInfo(req)
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          employee_id: user.employee_id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          middle_name: user.middle_name,
          role: user.role,
          department: user.department,
          position: user.position,
          contact_number: user.contact_number,
          birth_date: user.birth_date,
          branch: user.branch,
          full_name: `${user.first_name} ${user.middle_name ? user.middle_name + ' ' : ''}${user.last_name}`.trim(),
          created_at: user.created_at
        },
        tokens
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration',
      error: 'REGISTRATION_ERROR'
    });
  }
};

/**
 * User login
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const login = async (req, res) => {
  try {
    // Sanitize input data
    const sanitizedData = sanitizeObject(req.body, ['login']);

    // Validate input data
    const validation = validateLogin(sanitizedData);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    const { login, password } = sanitizedData;

    // Find user by email or employee_id
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE (email = ? OR employee_id = ?) AND is_active = TRUE',
      [login, login]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        error: 'INVALID_CREDENTIALS'
      });
    }

    const user = users[0];

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        error: 'INVALID_CREDENTIALS'
      });
    }

    // Generate tokens
    const tokens = generateTokenPair(user);

    // Update last_login
    await pool.execute(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );

    // Log user login activity
    await logActivity({
      userId: user.id,
      action: ACTIVITY_TYPES.LOGIN,
      description: `User logged in with employee ID: ${user.employee_id}`,
      ...getRequestInfo(req)
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          employee_id: user.employee_id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          middle_name: user.middle_name,
          role: user.role,
          department: user.department,
          position: user.position,
          contact_number: user.contact_number,
          full_name: `${user.first_name} ${user.middle_name ? user.middle_name + ' ' : ''}${user.last_name}`.trim(),
          last_login: user.last_login
        },
        tokens
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login',
      error: 'LOGIN_ERROR'
    });
  }
};

/**
 * Refresh access token
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const refreshToken = async (req, res) => {
  try {
    // Validate input data
    const validation = validateRefreshToken(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    const { refresh_token } = req.body;

    // Verify refresh token
    const decoded = verifyRefreshToken(refresh_token);

    // Get user details
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE id = ? AND is_active = TRUE',
      [decoded.id]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User not found or account deactivated',
        error: 'USER_NOT_FOUND'
      });
    }

    const user = users[0];

    // Generate new token pair
    const tokens = generateTokenPair(user);

    res.json({
      success: true,
      message: 'Tokens refreshed successfully',
      data: {
        tokens
      }
    });

  } catch (error) {
    console.error('Token refresh error:', error);

    if (error.message.includes('expired')) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token has expired',
        error: 'REFRESH_TOKEN_EXPIRED'
      });
    }

    if (error.message.includes('Invalid')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
        error: 'INVALID_REFRESH_TOKEN'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error during token refresh',
      error: 'TOKEN_REFRESH_ERROR'
    });
  }
};

/**
 * User logout
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const logout = async (req, res) => {
  try {
    // Log user logout activity
    if (req.user) {
      await logActivity({
        userId: req.user.id,
        action: ACTIVITY_TYPES.LOGOUT,
        description: `User logged out with employee ID: ${req.user.employee_id}`,
        ...getRequestInfo(req)
      });
    }

    // In a more advanced implementation, you would add the token to a blacklist
    // For now, we'll just return success and let the client handle token removal

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during logout',
      error: 'LOGOUT_ERROR'
    });
  }
};

/**
 * Get current user profile
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user details
    const [users] = await pool.execute(
      'SELECT id, employee_id, email, first_name, last_name, middle_name, role, department, position, contact_number, birth_date, branch, is_active, last_login, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      });
    }

    const user = users[0];

    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: {
          id: user.id,
          employee_id: user.employee_id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          middle_name: user.middle_name,
          role: user.role,
          department: user.department,
          position: user.position,
          contact_number: user.contact_number,
          birth_date: user.birth_date,
          branch: user.branch,
          full_name: `${user.first_name} ${user.middle_name ? user.middle_name + ' ' : ''}${user.last_name}`.trim(),
          is_active: user.is_active,
          last_login: user.last_login,
          created_at: user.created_at,
          updated_at: user.updated_at
        }
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error retrieving profile',
      error: 'PROFILE_ERROR'
    });
  }
};

/**
 * Update user profile
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Sanitize input data
    const sanitizedData = sanitizeObject(req.body, [
      'first_name', 'last_name', 'middle_name', 'department', 'position', 'contact_number'
    ]);

    // Validate input data
    const validation = validateProfileUpdate(sanitizedData);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];

    Object.keys(sanitizedData).forEach(key => {
      if (sanitizedData[key] !== undefined) {
        updateFields.push(`${key} = ?`);
        updateValues.push(sanitizedData[key]);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update',
        error: 'NO_UPDATE_FIELDS'
      });
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(userId);

    // Update user profile
    await pool.execute(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Get updated user data
    const [updatedUsers] = await pool.execute(
      'SELECT id, employee_id, email, first_name, last_name, middle_name, role, department, position, contact_number, updated_at FROM users WHERE id = ?',
      [userId]
    );

    const user = updatedUsers[0];

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user.id,
          employee_id: user.employee_id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          middle_name: user.middle_name,
          role: user.role,
          department: user.department,
          position: user.position,
          contact_number: user.contact_number,
          full_name: `${user.first_name} ${user.middle_name ? user.middle_name + ' ' : ''}${user.last_name}`.trim(),
          updated_at: user.updated_at
        }
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error updating profile',
      error: 'UPDATE_PROFILE_ERROR'
    });
  }
};

/**
 * Change password
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`🔐 [CHANGE PASSWORD] User ${userId} attempting to change password`);

    // Validate input data
    const validation = validatePasswordChange(req.body);
    if (!validation.isValid) {
      console.log(`❌ [CHANGE PASSWORD] Validation failed for user ${userId}:`, validation.errors);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    const { current_password, new_password } = req.body;

    // Get current user data
    const [users] = await pool.execute(
      'SELECT password_hash FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      console.log(`❌ [CHANGE PASSWORD] User ${userId} not found`);
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      });
    }

    const user = users[0];

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(current_password, user.password_hash);
    if (!isCurrentPasswordValid) {
      console.log(`❌ [CHANGE PASSWORD] Invalid current password for user ${userId}`);
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
        error: 'INVALID_CURRENT_PASSWORD'
      });
    }

    console.log(`✓ [CHANGE PASSWORD] Current password verified for user ${userId}`);

    // Hash new password
    const hashedNewPassword = await hashPassword(new_password);

    console.log(`💾 [CHANGE PASSWORD] Updating password in database for user ${userId}`);

    // Update password
    await pool.execute(
      'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedNewPassword, userId]
    );

    console.log(`✅ [CHANGE PASSWORD] Password updated successfully for user ${userId}`);

    // Log activity
    await logActivity({
      userId: userId,
      action: ACTIVITY_TYPES.CHANGE_PASSWORD,
      description: 'Changed account password',
      ...getRequestInfo(req)
    });

    console.log(`📝 [CHANGE PASSWORD] Activity logged for user ${userId}`);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error changing password',
      error: 'CHANGE_PASSWORD_ERROR'
    });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  updateProfile,
  changePassword
};